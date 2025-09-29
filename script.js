const API_KEY = 'ba41c37e41864f8986d7801b7cc83ef1'; //Spoonacular API Key

const navLinks = document.querySelectorAll('.nav-link');
const panes = document.querySelectorAll('.pane');

const cuisineInput = document.getElementById('cuisine-input');
const cuisineButton = document.getElementById('cuisine-button');
const ingredientInput = document.getElementById('ingredient-input');
const searchButton = document.getElementById('search-button');
const recipesContainer = document.getElementById('recipes-container');
const resultsTitle = document.getElementById('results-title');

const clearPlannerBtn = document.getElementById('clear-planner-btn');
const plannerGrid = document.querySelector('.planner-grid');
const getSuggestionsBtn = document.getElementById('get-suggestions-btn');
const intolerancesInput = document.getElementById('intolerances-input');
const dietInput = document.getElementById('diet-input');

const shoppingInput = document.getElementById('shopping-input');
const addItemBtn = document.getElementById('add-item-btn');
const shoppingListEl = document.getElementById('shopping-list-items');
const favoritesList = document.getElementById('favorites-list');

let currentCuisine = '';
let favorites = JSON.parse(localStorage.getItem('favorites')) || [];
let shoppingList = JSON.parse(localStorage.getItem('shoppingList')) || [];
let mealPlan = JSON.parse(localStorage.getItem('mealPlan')) || {};

document.addEventListener('DOMContentLoaded', () => {
    updateMealPlannerUI();
    updateShoppingListUI();
    updateFavoritesUI();

    document.getElementById('recipes-pane').classList.add('active');
});

// Navigation Logic
navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        const targetPaneId = e.target.closest('.nav-link').dataset.pane;
        
        navLinks.forEach(nav => nav.classList.remove('active'));
        e.target.closest('.nav-link').classList.add('active');
        
        panes.forEach(pane => pane.classList.remove('active'));
        document.getElementById(targetPaneId).classList.add('active');

        // Update UI for each pane when it becomes active
        if (targetPaneId === 'planner-pane') updateMealPlannerUI();
        if (targetPaneId === 'favorites-pane') updateFavoritesUI();
        if (targetPaneId === 'shopping-pane') updateShoppingListUI();
    });
});

// Event listeners for searching
cuisineButton.addEventListener('click', () => {
    currentCuisine = cuisineInput.value.trim();
    if (currentCuisine) {
        findRecipesByCuisine(currentCuisine);
    }
});

searchButton.addEventListener('click', () => {
    const ingredients = ingredientInput.value;
    if (ingredients) {
        findRecipesByIngredients(ingredients);
    }
});

async function fetchRecipes(url, titleText) {
    try {
        recipesContainer.innerHTML = '<p class="loading-message">Finding recipes...</p>';
        resultsTitle.textContent = titleText;
        const response = await fetch(url);
        const data = await response.json();
        
        const recipes = data.results || data; 

        if (recipes.length === 0) {
            recipesContainer.innerHTML = '<p class="no-results-message">Sorry, no recipes found.</p>';
            return;
        }

        displayRecipes(recipes);

    } catch (error) {
        console.error('Error fetching recipes:', error);
        recipesContainer.innerHTML = '<p class="error-message">Oops! Something went wrong. Try again later.</p>';
    }
}

async function findRecipesByCuisine(cuisine) {
    const url = `https://api.spoonacular.com/recipes/complexSearch?apiKey=${API_KEY}&cuisine=${cuisine}&number=12&addRecipeInformation=true`;
    await fetchRecipes(url, `Found some amazing ${cuisine} recipes...`);
}

async function findRecipesByIngredients(ingredients) {
    let url = `https://api.spoonacular.com/recipes/findByIngredients?apiKey=${API_KEY}&ingredients=${ingredients}&number=12&ranking=2`;
    if (currentCuisine) {
        url += `&cuisine=${currentCuisine}`;
    }
    await fetchRecipes(url, `Here are some recipes you can make with what you have...`);
}

function displayRecipes(recipes) {
    recipesContainer.innerHTML = '';
    recipes.forEach(recipe => {
        const recipeCard = document.createElement('div');
        recipeCard.className = 'recipe-card';
        const isFavorited = favorites.some(fav => fav.id === recipe.id);
        
        recipeCard.dataset.id = recipe.id;
        recipeCard.dataset.title = recipe.title;
        recipeCard.dataset.image = recipe.image;
        
        const timeInMinutes = recipe.readyInMinutes || 'N/A'; // Get time

        recipeCard.innerHTML = `
            <img src="${recipe.image}" alt="${recipe.title}">
            <div class="recipe-time">
                <i class="fas fa-clock"></i> 
                ${timeInMinutes} min
            </div>
            <i class="fas fa-heart favorite-btn ${isFavorited ? 'favorited' : ''}" data-id="${recipe.id}" data-title="${recipe.title}" data-image="${recipe.image}"></i>
            <div class="recipe-card-content">
                <h3>${recipe.title}</h3>
                <button class="btn view-recipe-btn" data-id="${recipe.id}" data-title="${recipe.title}">View Recipe</button>
            </div>
        `;

        recipeCard.querySelector('.favorite-btn').addEventListener('click', (e) => toggleFavorite(e, recipe));
        recipeCard.querySelector('.view-recipe-btn').addEventListener('click', (e) => {
            const recipeId = e.target.dataset.id;
            getRecipeDetails(recipeId);
        });

        recipesContainer.appendChild(recipeCard);
    });
}

// Favorites Pane Logic
function toggleFavorite(e, recipe) {
    const btn = e.target;
    const recipeId = recipe.id;

    if (btn.classList.contains('favorited')) {
        favorites = favorites.filter(fav => fav.id !== recipeId);
        btn.classList.remove('favorited');
    } else {
        favorites.push({
            id: recipe.id,
            title: recipe.title,
            image: recipe.image
        });
        btn.classList.add('favorited');
    }
    localStorage.setItem('favorites', JSON.stringify(favorites));
    updateFavoritesUI();
}

function updateFavoritesUI() {
    favoritesList.innerHTML = '';
    if (favorites.length === 0) {
        favoritesList.innerHTML = '<p>No favorites added yet!</p>';
        return;
    }

    favorites.forEach(recipe => {
        const favCard = document.createElement('div');
        favCard.className = 'recipe-card';
        favCard.dataset.id = recipe.id;
        favCard.dataset.title = recipe.title;
        favCard.dataset.image = recipe.image;
        
        
        favCard.innerHTML = `
            <img src="${recipe.image}" alt="${recipe.title}">
            <i class="fas fa-heart favorite-btn favorited" data-id="${recipe.id}" data-title="${recipe.title}" data-image="${recipe.image}"></i>
            <div class="recipe-card-content">
                <h3>${recipe.title}</h3>
                <button class="btn view-recipe-btn" data-id="${recipe.id}" data-title="${recipe.title}">View Recipe</button>
            </div>
        `;
        favCard.querySelector('.favorite-btn').addEventListener('click', (e) => toggleFavorite(e, recipe));
        favCard.querySelector('.view-recipe-btn').addEventListener('click', (e) => getRecipeDetails(e.target.dataset.id));
        favoritesList.appendChild(favCard);
    });
}

// Meal Planner Logic
clearPlannerBtn.addEventListener('click', () => {
    localStorage.removeItem('mealPlan');
    mealPlan = {};
    updateMealPlannerUI();
});

getSuggestionsBtn.addEventListener('click', async () => {
    const intolerances = intolerancesInput.value.trim();
    const diet = dietInput.value.trim();
    
    let url = `https://api.spoonacular.com/recipes/random?apiKey=${API_KEY}&number=21`;
    if (intolerances) {
        url += `&intolerances=${intolerances}`;
    }
    if (diet) {
        url += `&tags=${diet}`;
    }
    
    try {
        const response = await fetch(url);
        const data = await response.json();
        
        const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
        const meals = ['Breakfast', 'Lunch', 'Dinner'];
        let recipeIndex = 0;
        
        days.forEach(day => {
            if (!mealPlan[day]) mealPlan[day] = {};
            meals.forEach(meal => {
                if (!mealPlan[day][meal] && data.recipes[recipeIndex]) {
                    const recipe = data.recipes[recipeIndex];
                    mealPlan[day][meal] = {
                        id: recipe.id,
                        title: recipe.title,
                        image: recipe.image
                    };
                    recipeIndex++;
                }
            });
        });
        localStorage.setItem('mealPlan', JSON.stringify(mealPlan));
        updateMealPlannerUI();

    } catch (error) {
        console.error("Error getting suggestions:", error);
        alert("Could not get healthy suggestions. Please try again.");
    }
});

function updateMealPlannerUI() {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const meals = ['Breakfast', 'Lunch', 'Dinner'];

    const oldCells = plannerGrid.querySelectorAll('.planner-cell, .meal-label');
    oldCells.forEach(cell => cell.remove());

    meals.forEach(meal => {
        const mealLabel = document.createElement('div');
        mealLabel.className = 'meal-label';
        mealLabel.textContent = meal;
        plannerGrid.appendChild(mealLabel);

        days.forEach(day => {
            const cell = document.createElement('div');
            cell.className = 'planner-cell';
            
            if (mealPlan[day] && mealPlan[day][meal]) {
                const recipe = mealPlan[day][meal];
                cell.innerHTML = `
                    <div class="meal-card">
                        <img src="${recipe.image}" alt="${recipe.title}">
                        <span>${recipe.title}</span>
                        <button class="remove-meal-btn" data-day="${day}" data-meal="${meal}"><i class="fas fa-times"></i></button>
                    </div>
                `;
                cell.querySelector('.remove-meal-btn').addEventListener('click', (e) => {
                    const cellDay = e.target.closest('button').dataset.day;
                    const cellMeal = e.target.closest('button').dataset.meal;
                    removeMeal(cellDay, cellMeal);
                });
            } else {
                cell.innerHTML = `
                    <div class="planner-input-container">
                        <input type="text" placeholder="Add recipe..." class="recipe-input" data-day="${day}" data-meal="${meal}">
                        <button class="add-recipe-btn" data-day="${day}" data-meal="${meal}"><i class="fas fa-plus"></i></button>
                    </div>
                `;
                cell.querySelector('.add-recipe-btn').addEventListener('click', (e) => {
                    const input = e.target.closest('.planner-input-container').querySelector('.recipe-input');
                    if (input.value.trim()) {
                        addRecipeToPlanner(input.value.trim(), day, meal);
                    }
                });
                cell.querySelector('.recipe-input').addEventListener('keypress', (e) => {
                    if (e.key === 'Enter' && e.target.value.trim()) {
                        addRecipeToPlanner(e.target.value.trim(), day, meal);
                    }
                });
            }
            plannerGrid.appendChild(cell);
        });
    });
}

async function addRecipeToPlanner(recipeName, day, meal) {
    const url = `https://api.spoonacular.com/recipes/complexSearch?apiKey=${API_KEY}&query=${recipeName}&number=1&addRecipeInformation=true`;
    try {
        const response = await fetch(url);
        const data = await response.json();
        const recipe = data.results[0];

        if (recipe) {
            if (!mealPlan[day]) mealPlan[day] = {};
            mealPlan[day][meal] = {
                id: recipe.id,
                title: recipe.title,
                image: recipe.image
            };
            localStorage.setItem('mealPlan', JSON.stringify(mealPlan));
            updateMealPlannerUI();
        } else {
            alert("Sorry, could not find that recipe. Please try a different name.");
        }
    } catch (error) {
        console.error("Error adding recipe to planner:", error);
        alert("An error occurred. Please try again later.");
    }
}

function removeMeal(day, meal) {
    if (mealPlan[day] && mealPlan[day][meal]) {
        delete mealPlan[day][meal];
        if (Object.keys(mealPlan[day]).length === 0) {
            delete mealPlan[day];
        }
        localStorage.setItem('mealPlan', JSON.stringify(mealPlan));
        updateMealPlannerUI();
    }
}

// Shopping List Logic
addItemBtn.addEventListener('click', addShoppingItem);
shoppingInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        addShoppingItem();
    }
});

function addShoppingItem() {
    const itemText = shoppingInput.value.trim().toLowerCase();
    if (itemText) {
        const existingItem = shoppingList.find(item => item.name.toLowerCase() === itemText);
        if (existingItem) {
            const confirmUpdate = confirm(`'${itemText}' already exists. Do you want to increase the quantity?`);
            if (confirmUpdate) {
                existingItem.quantity = (existingItem.quantity || 1) + 1;
            }
        } else {
            shoppingList.push({ name: itemText, quantity: 1 });
        }
        localStorage.setItem('shoppingList', JSON.stringify(shoppingList));
        updateShoppingListUI();
        shoppingInput.value = '';
    }
}

function removeShoppingItem(index) {
    shoppingList.splice(index, 1);
    localStorage.setItem('shoppingList', JSON.stringify(shoppingList));
    updateShoppingListUI();
}

function updateShoppingListUI() {
    shoppingListEl.innerHTML = '';
    shoppingList.forEach((item, index) => {
        const li = document.createElement('li');
        li.innerHTML = `
            <span>${item.name}</span>
            <div class="shopping-quantity-controls">
                <button class="shopping-quantity-btn decrease-btn" data-index="${index}"><i class="fas fa-minus"></i></button>
                <span class="shopping-quantity">${item.quantity}</span>
                <button class="shopping-quantity-btn increase-btn" data-index="${index}"><i class="fas fa-plus"></i></button>
            </div>
        `;
        li.querySelector('.increase-btn').addEventListener('click', () => updateQuantity(index, 1));
        li.querySelector('.decrease-btn').addEventListener('click', () => updateQuantity(index, -1));
        shoppingListEl.appendChild(li);
    });
}

function updateQuantity(index, change) {
    if (shoppingList[index]) {
        shoppingList[index].quantity += change;
        if (shoppingList[index].quantity <= 0) {
            shoppingList.splice(index, 1);
        }
        localStorage.setItem('shoppingList', JSON.stringify(shoppingList));
        updateShoppingListUI();
    }
}

// Robust Recipe Link Fetch
async function getRecipeDetails(recipeId) {
    const url = `https://api.spoonacular.com/recipes/${recipeId}/information?apiKey=${API_KEY}`;
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        window.open(data.sourceUrl, '_blank');
    } catch (error) {
        console.error("Error fetching recipe details:", error);
        alert("Sorry, could not retrieve the recipe link. Please try again later.");
    }
}