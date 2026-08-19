# bolewara/books-price-predictor

## Resumen

El modelo `bolewara/books-price-predictor` es un regresor basado en Random Forest que predice el precio de un libro en libras esterlinas (GBP) a partir de características extraídas del título y la valoración en estrellas. Fue desarrollado por Anuj Bolewar (usuario `bolewara` en Hugging Face y Kaggle) y entrenado sobre un catálogo de 1000 libros obtenidos del sitio de demostración books.toscrape.com. Es un modelo de aprendizaje automático clásico (no un modelo de lenguaje) orientado a regresión tabular, con una arquitectura de 300 árboles de decisión y un preprocesamiento basado en TF-IDF y TruncatedSVD para las características textuales del título.

Este modelo es relevante como ejemplo de aplicación de técnicas de ML tradicionales a un problema de predicción de precios en comercio electrónico, y puede servir como punto de partida para sistemas de estimación de precios o como material didáctico en cursos de ciencia de datos. Su tamaño es muy reducido (el repositorio ocupa 0.0 GB) y se distribuye en formato `joblib`, lo que facilita su integración en entornos de producción sin necesidad de infraestructura especializada. Aunque su rendimiento es modesto (MAE de 13.3 GBP), demuestra un pipeline completo de limpieza de datos, ingeniería de características y validación cruzada.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | RandomForestRegressor (300 árboles) |
| Parametros totales | no disponible (modelo sklearn, no se reporta número de parámetros) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo tabular) |
| Tipos de cuantizacion | no aplica (modelo clásico, se guarda como joblib) |
| Idiomas soportados | no disponible (aunque los datos de entrenamiento están en inglés, no es un modelo de lenguaje) |
| Licencia | MIT |
| Formato de pesos | joblib (archivos .joblib) |

## Arquitectura y entrenamiento

El modelo emplea un `RandomForestRegressor` de 300 árboles de decisión. Las variables de entrada son numéricas e incluyen: la valoración en estrellas (1-5), la longitud del título, el número de palabras del título, la presencia de dos puntos (`:`) en el título, y 8 componentes resultantes de aplicar `TruncatedSVD` sobre una matriz TF-IDF generada a partir de los títulos. El dataset de entrenamiento contiene 1000 registros del catálogo de books.toscrape.com, donde los precios (originalmente envueltos en HTML) se limpiaron mediante expresiones regulares y las valoraciones textuales (One-Five) se mapearon a enteros. No se aplicaron técnicas de RLHF ni DPO; se trata de un entrenamiento supervisado de regresión con validación cruzada de 5 pliegues, obteniendo un error absoluto medio (MAE) de 13.3 GBP (±0.33). El autor señala que las características basadas únicamente en el título ofrecen una señal débil y que añadir la categoría o el género del libro mejoraría la precisión.

## Capacidades

- Predicción de precios de libros en GBP a partir de características del título y la valoración en estrellas.
- Regresión numérica sobre datos tabulares.
- Pipeline de preprocesamiento de texto integrado (TF-IDF + TruncatedSVD) para convertir títulos en vectores densos.
- No dispone de capacidades de generación de texto, razonamiento, código, visión, tool calling ni agentes.
- No es un modelo multilingüe; solo procesa características numéricas derivadas de texto en inglés.

## Casos de uso

- Estimación de precios en catálogos de librerías online: el modelo puede integrarse en un sistema de recomendación para sugerir precios competitivos basados en el título y la valoración, aunque su precisión es limitada.
- Análisis de mercado de libros usados: permite obtener una referencia rápida del precio esperado de un libro a partir de su título y rating, útil para plataformas de segunda mano.
- Preprocesamiento de datos textuales: el uso de TF-IDF y TruncatedSVD en el pipeline puede reutilizarse como plantilla para otros problemas de regresión con texto corto.
- Educación en ciencia de datos: sirve como ejemplo práctico de entrenamiento de un Random Forest, validación cruzada y evaluación con MAE en un problema real.
- Benchmark de modelos de regresión: puede utilizarse como baseline para comparar con otros algoritmos (regresión lineal, gradient boosting, etc.) en el mismo conjunto de datos.
- Prototipado rápido: al ser un modelo pequeño y fácil de cargar con `joblib`, es adecuado para pruebas de concepto en entornos con recursos limitados.

## Benchmarks y rendimiento

Los únicos datos de rendimiento disponibles son los reportados por el autor en la model card:

| Métrica | Valor |
|---|---|
| MAE (validación cruzada 5-fold) | 13.3 GBP (±0.33) |
| Baseline (predecir la mediana) | 12.5 GBP |

No se han publicado resultados comparativos con otros modelos en la información disponible. La mejora sobre el baseline es marginal, lo que indica que las características utilizadas tienen una capacidad predictiva limitada.

## Requisitos de hardware

- El modelo es extremadamente ligero: ocupa menos de 1 MB en memoria (el repositorio reporta 0.0 GB).
- No requiere GPU; se ejecuta perfectamente en CPU.
- Cualquier máquina con Python y `scikit-learn` puede cargar y ejecutar el modelo sin problemas.
- Despliegue sencillo: basta con `joblib.load("model.joblib")` y llamar al método `predict`.
- No necesita servicios de inferencia como vLLM u Ollama; puede integrarse en una API REST con frameworks como Flask o FastAPI.
- Latencia de inferencia en el orden de microsegundos para una sola muestra, dado el tamaño del modelo.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la misma categoría (regresión tabular para precios de libros). El autor no ha publicado comparaciones con otros regresores. Se puede señalar que, al ser un modelo de Random Forest, su rendimiento podría contrastarse con regresión lineal o gradient boosting, pero no hay datos al respecto en la información proporcionada. Por tanto, se indica "no disponible".

## Limitaciones y advertencias

- El MAE de 13.3 GBP es alto en comparación con el rango de precios típico de los libros (probablemente entre 10 y 50 GBP), lo que limita su utilidad práctica.
- Las características se limitan al título y la valoración; no se incluyen variables relevantes como categoría, autor, editorial o año de publicación.
- El conjunto de datos es pequeño (1000 registros) y proviene de un único sitio web de demostración, lo que puede provocar falta de generalización a otros dominios.
- El modelo no es un sistema de lenguaje y no puede procesar texto libre; solo acepta las características numéricas predefinidas.
- No se han documentado sesgos específicos, pero al entrenarse con datos de un catálogo concreto, puede reflejar los precios y tendencias de ese sitio.
- La licencia MIT permite uso comercial sin restricciones, pero el autor no ofrece garantías sobre la precisión o idoneidad del modelo para producción.

## Enlaces

- [Hugging Face - bolewara/books-price-predictor](https://huggingface.co/bolewara/books-price-predictor)
- [Perfil de usuario de bolewara en Hugging Face](https://huggingface.co/bolewara)
