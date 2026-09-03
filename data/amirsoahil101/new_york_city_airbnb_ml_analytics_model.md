# amirsoahil101/New_York_City_Airbnb_ML_Analytics_Model

## Resumen

El modelo `amirsoahil101/New_York_City_Airbnb_ML_Analytics_Model` es un clasificador tabular entrenado con scikit-learn para predecir atributos de los anuncios de Airbnb en Nueva York a partir del conjunto de datos público "NYC Airbnb Open Data 2019". Fue desarrollado por Amir Sohail como parte de una aplicación web completa que combina análisis exploratorio, un pipeline de preprocesamiento y un frontend desplegado en Render. El modelo final es un `RandomForestClassifier` integrado en un `Pipeline` de scikit-learn que utiliza `ColumnTransformer` para procesar variables numéricas y categóricas por separado.

El proyecto resuelve un problema de clasificación supervisada sobre datos tabulares, con una precisión declarada del 85,1% y un F1 de 0,713. Aunque no se trata de un modelo de lenguaje ni de visión, es relevante como ejemplo de aplicación práctica de machine learning clásico en el dominio inmobiliario, con un pipeline reproducible y una interfaz web funcional. El repositorio incluye el código fuente, el dataset, el cuaderno de análisis y el pipeline serializado en formato pickle.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pipeline scikit-learn: ColumnTransformer (SimpleImputer + PowerTransformer + StandardScaler para numéricas; SimpleImputer + OneHotEncoder para categóricas) + RandomForestClassifier |
| Parametros totales | no disponible (número de árboles y profundidad no especificados) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo tabular) |
| Tipos de cuantizacion | no aplica (modelo clásico, no requiere cuantización) |
| Idiomas soportados | inglés (etiquetas y documentación en inglés) |
| Licencia | MIT |
| Formato de pesos | Pickle (archivo `Model_Pipeline.pkl` con el pipeline serializado) |

## Arquitectura y entrenamiento

El modelo sigue un enfoque clásico de machine learning con scikit-learn. El pipeline consta de un `ColumnTransformer` que aplica transformaciones diferenciadas a variables numéricas y categóricas: para las numéricas usa `SimpleImputer` seguido de `PowerTransformer` y `StandardScaler`; para las categóricas usa `SimpleImputer` y `OneHotEncoder`. El estimador final es un `RandomForestClassifier`, cuyos hiperparámetros se optimizaron mediante `RandomizedSearchCV`. No se especifica el número de árboles ni la profundidad máxima, ni el tamaño del conjunto de datos de entrenamiento (aunque el dataset `AB_NYC_2019.csv` es de acceso público). Tampoco se detalla si se aplicaron técnicas de regularización o validación cruzada más allá de la búsqueda aleatoria.

## Capacidades

- Clasificación de atributos de anuncios de Airbnb en Nueva York a partir de características numéricas (precio, disponibilidad, número de reseñas, etc.) y categóricas (tipo de habitación, barrio, etc.).
- Inferencia en tiempo real a través de una API web (el repositorio incluye un servidor backend en `main.py` y un frontend en HTML/CSS/JS).
- Integración con un pipeline de preprocesamiento automático que maneja valores faltantes y escala variables.
- Soporte para despliegue en plataformas cloud como Render (hay una demo en vivo).
- No soporta generación de texto, tool calling, agentes ni capacidades multimodales.

## Casos de uso

- Análisis de mercado inmobiliario: el modelo puede predecir el tipo de anuncio (por ejemplo, habitación completa, privada o compartida) a partir de características como el precio, la ubicación y la disponibilidad, lo que facilita estudios de oferta y demanda en el sector del alquiler vacacional.
- Optimización de precios: aunque la tarea exacta no se especifica, un clasificador de atributos puede ayudar a los anfitriones a estimar el rango de precio esperado para su propiedad según sus características, permitiendo ajustar tarifas de forma competitiva.
- Filtrado y moderación de anuncios: la predicción de atributos puede usarse para detectar anuncios atípicos o mal clasificados en plataformas de alquiler, mejorando la calidad de los listados.
- Sistema de recomendación para viajeros: dado un conjunto de preferencias (ubicación, precio, tipo de habitación), el modelo puede clasificar qué anuncios cumplen los criterios, aunque no está diseñado específicamente para ranking.
- Demostración educativa de pipelines de scikit-learn: el proyecto sirve como ejemplo didáctico de cómo construir un pipeline completo con `ColumnTransformer`, `RandomizedSearchCV` y despliegue web, útil para cursos de machine learning.
- Integración en dashboards analíticos: los resultados de clasificación pueden alimentar visualizaciones en herramientas como Streamlit o Tableau para monitorizar tendencias del mercado de alquiler en Nueva York.

## Benchmarks y rendimiento

Según los datos declarados por el autor en la model card, el modelo Random Forest seleccionado obtuvo los siguientes resultados sobre el conjunto de datos "NYC Airbnb Open Data 2019":

| Modelo | Accuracy | F1-score |
|---|---|---|
| Random Forest Classifier (seleccionado) | 0.851 | 0.713 |
| Gradient Boosting Classifier | 0.850 | 0.706 |
| Decision Tree Classifier | 0.786 | 0.655 |
| Logistic Regression | 0.726 | 0.575 |

Estos valores son los únicos disponibles; no se han publicado métricas adicionales como precisión, recall o AUC. No se dispone de comparaciones con modelos externos ni de resultados en otros conjuntos de datos.

## Requisitos de hardware

- Inferencia en CPU: el modelo es un `RandomForestClassifier` de tamaño moderado, por lo que puede ejecutarse en cualquier máquina con Python y scikit-learn instalados, sin necesidad de GPU.
- VRAM: no requiere VRAM; el modelo se carga en memoria RAM (el archivo pickle ocupa menos de unos pocos megabytes, aunque el tamaño exacto no se indica).
- GPU recomendadas: ninguna; el modelo no aprovecha aceleración por GPU.
- Opciones de despliegue: el repositorio incluye un servidor backend (posiblemente FastAPI o Flask) y un frontend estático; también puede integrarse en aplicaciones Streamlit o en servicios como Render, Heroku o AWS Lambda.
- Latencia: al ser un modelo clásico, la inferencia es del orden de milisegundos, adecuada para aplicaciones en tiempo real.

## Comparativa con modelos similares

Dentro del propio proyecto se compararon varios algoritmos de clasificación sobre el mismo dataset. No se dispone de información sobre otros modelos externos comparables, por lo que la comparativa se limita a los resultados internos:

| Modelo | Accuracy | F1-score | Notas |
|---|---|---|---|
| Random Forest | 0.851 | 0.713 | Seleccionado por mejor rendimiento global |
| Gradient Boosting | 0.850 | 0.706 | Rendimiento muy similar, ligeramente inferior en F1 |
| Decision Tree | 0.786 | 0.655 | Menor capacidad de generalización |
| Logistic Regression | 0.726 | 0.575 | Modelo lineal, claramente inferior |

## Limitaciones y advertencias

- El modelo fue entrenado con datos de 2019; los patrones del mercado de Airbnb pueden haber cambiado, por lo que su rendimiento en datos actuales podría degradarse.
- No se especifica la variable objetivo exacta (qué atributo se predice), lo que dificulta evaluar su aplicabilidad concreta.
- La métrica F1 de 0.713 indica un equilibrio moderado entre precisión y recall; puede haber sesgo hacia clases mayoritarias.
- El modelo no es generativo ni multimodal; solo maneja datos tabulares estructurados.
- La licencia MIT permite uso comercial, pero el dataset original (AB_NYC_2019.csv) puede tener sus propias restricciones de uso.
- No se han publicado análisis de sesgos ni de robustez ante datos fuera de distribución.
- El repositorio incluye una sección titulada "Next-Generation Vocal Acoustic Analytics for Emergency Triage Scoring" que no parece relacionada con el modelo principal; podría tratarse de un error en la documentación, por lo que se recomienda verificar la integridad del proyecto.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/amirsoahil101/New_York_City_Airbnb_ML_Analytics_Model
- Repositorio de GitHub: https://github.com/amirsohail100/New-York-City-Airbnb-ML-Analytics-Web-App
- Demo en vivo (Render): https://new-york-city-airbnb-ml-analytics-web-xoyb.onrender.com
- Dataset NYC Airbnb Open Data 2019 (referenciado, no enlazado directamente en la model card)
