# feti-ai/fetiai-v1-phiusiil-binclf-knn-skl-500k

## Resumen

El modelo `fetiai-v1-phiusiil-binclf-knn-skl-500k` es un clasificador tabular binario desarrollado por el grupo 16 del curso IF3070 (Fundamentos de Inteligencia Artificial) de la STEI ITB. Su función es puntuar una fila de características pre-extraídas de una URL (49 dimensiones) y devolver un veredicto de "legítima" o "phishing". No se trata de un modelo de lenguaje, sino de un KNN (K-Nearest Neighbors) clásico implementado con scikit-learn.

El problema que resuelve es la clasificación de URLs de phishing a partir de un vector numérico, evitando procesar texto directamente. Su relevancia radica en ser un ejemplo completo de despliegue de un modelo clásico de machine learning: incluye una API HTTP con rutas de predicción y metadata, soporte para Docker, y un mecanismo de autotest que verifica que el artefacto reproduce una predicción registrada (golden row). El autor lo presenta explícitamente como una reimplementación académica, no como un producto de seguridad listo para producción.

El modelo tiene 500.002 parámetros declarados, aunque en un KNN estos corresponden a los datos de entrenamiento almacenados. El artefacto pesa 2,6 MB y se sirve mediante una API que acepta valores nulos y realiza imputación automática. Está entrenado sobre el dataset PhiUSIIL (estático, 2023-24) y su licencia es MIT.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | KNN (K-Nearest Neighbors) con scikit-learn |
| Parametros totales | 500.002 (según autor) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo tabular, no secuencial) |
| Tipos de cuantizacion | no aplica (modelo clásico, no neuronal) |
| Idiomas soportados | no aplica (entrada numérica, no texto) |
| Licencia | MIT |
| Formato de pesos | joblib (scikit-learn) |

## Arquitectura y entrenamiento

El modelo emplea el algoritmo KNN de scikit-learn, que clasifica una muestra según la proximidad a los k vecinos más cercanos en el espacio de características. El dataset de entrenamiento es PhiUSIIL (PhiUSIIL Phishing URL Dataset), del cual se extrajeron 49 características numéricas por URL. Según la documentación, se aplicó SMOTE (Synthetic Minority Over-sampling Technique) para abordar el desbalanceo de clases, junto con un proceso de ingeniería de características. No se menciona el número exacto de tokens ni el tamaño del dataset en la información disponible.

El despliegue se realiza como un servicio HTTP que expone rutas como `/predict` (una fila), `/predict/batch` (hasta 1000 filas), `/metadata`, `/healthz` y `/readyz`. El modelo se commitea directamente en el repositorio (2,6 MB) y se hornea en la imagen Docker, de modo que la imagen es una descripción completa de lo que predecirá el servicio. El build falla si el artefacto no reproduce su propia fila dorada en el autotest.

## Capacidades

- Clasificación binaria de vectores de características de 49 dimensiones para detectar phishing.
- Puntuación de phishing (`phishing_score`) y veredicto (`legitimate` o `phishing`).
- Imputación automática de valores nulos: en el ejemplo de la documentación, de 49 características, 33 se proporcionan y 16 se imputan, con un `coverage_ratio` de 0.6735.
- Soporte de inferencia por lotes (hasta 1000 filas por petición).
- API REST con documentación interactiva en `/docs`.
- Autotest de reproducción (golden row) para verificar la integridad del artefacto.
- No dispone de capacidades de generación de texto, razonamiento, código, visión, tool calling, agentes ni soporte multilingüe, al ser un modelo tabular clásico.

## Casos de uso

- Filtrado previo de URLs en un pipeline de análisis: integrar la API para puntuar lotes de URLs extraídas de logs de acceso o de tráfico de red, marcando las sospechosas para revisión manual.
- Demostración educativa de MLOps: sirve como ejemplo práctico de cómo servir un modelo sklearn con Docker, health checks, tests de reproducción y documentación de API.
- Prototipo de sistema de alertas internas: consumir `/predict` para generar alertas en un dashboard de seguridad, siempre con supervisión humana debido a las limitaciones del modelo.
- Depuración de extractores de características: usar el campo `coverage_ratio` y `n_imputed` de la respuesta para detectar qué características no se están extrayendo correctamente en un sistema propio.
- Benchmark de modelos clásicos vs. deep learning: utilizar este KNN como baseline en un estudio comparativo de clasificación de phishing frente a redes neuronales o gradient boosting.
- Práctica de integración continua: emplear `make selftest` en un pipeline de CI para validar que el artefacto del modelo no se ha corrompido o modificado accidentalmente en el repositorio.

## Benchmarks y rendimiento

Resultados declarados por el autor en el model-index de HuggingFace, sobre el dataset PhiUSIIL:

| Metrica | Valor |
|---|---|
| Accuracy | 0,9807 |
| Precision (phishing) | 0,9809 |
| Recall (phishing) | 0,7635 |

No se han publicado resultados de benchmarks comparativos con otros modelos en la informacion disponible. Cabe destacar que el recall de phishing es notablemente inferior a la precisión, lo que indica una tasa de falsos negativos relativamente alta.

## Requisitos de hardware

- Modelo extremadamente ligero: el artefacto ocupa 2,6 MB, por lo que no requiere GPU.
- CPU: cualquier procesador moderno es suficiente para inferencia.
- RAM: menos de 1 GB para cargar el modelo y los datos de entrenamiento en memoria.
- Despliegue: servidor HTTP local (uvicorn/FastAPI) o contenedor Docker.
- Latencia: para una sola fila, la inferencia KNN es O(N) sobre los 500k puntos de entrenamiento, lo que en CPU se traduce en milisegundos o decenas de milisegundos. El modo batch (1000 filas) puede tardar unos segundos dependiendo del hardware.

## Comparativa con modelos similares

No se dispone de datos de rendimiento de modelos comparables en la informacion proporcionada. Conceptualmente, se puede comparar con otros clasificadores tabulares clásicos como Random Forest o XGBoost, que suelen ofrecer mejor recall y menor coste de inferencia que un KNN con 500k muestras. Sin embargo, no hay métricas publicadas de estas alternativas sobre el mismo dataset para realizar una comparativa cuantitativa.

## Limitaciones y advertencias

- Es un trabajo de curso, no un producto de seguridad. El propio autor advierte que no debe usarse para decidir si un enlace es seguro.
- Entrenado con un dataset estático de 2023-24. No tiene conocimiento de campañas de phishing más recientes.
- No incorpora threat intelligence, blocklists ni actualizaciones automáticas.
- El recall de phishing es bajo (0,7635), lo que implica que una parte significativa de URLs maliciosas podrían clasificarse como legítimas (falsos negativos).
- La entrada está limitada a 49 características pre-extraídas; no acepta URLs crudas. Depende de un extractor de características externo (el proyecto padre) para funcionar.
- No tiene soporte para otros idiomas ni para texto libre, al ser un modelo puramente tabular.

## Enlaces

- HuggingFace: https://huggingface.co/feti-ai/fetiai-v1-phiusiil-binclf-knn-skl-500k
- Repositorio de la aplicación completa: https://github.com/fetiai/phishing-url-classifier
- Demo en vivo: https://phiusiil.faizath.com
- Dataset PhiUSIIL (UCI): https://archive.ics.uci.edu/dataset/967/phiusiil+phishing+url+dataset
