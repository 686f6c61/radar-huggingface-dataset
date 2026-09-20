# abdullah1904/NYC-House-Types-Classifier

## Resumen

NYC House Types Classifier es un proyecto de clasificación tabular desarrollado por el usuario abdullah1904 y publicado en HuggingFace. No es un modelo de lenguaje: se trata de un pipeline de scikit-learn que predice el tipo de alojamiento (`room_type`) de un anuncio de Airbnb en Nueva York a partir de variables tabulares como la ubicación, el precio, la estancia mínima, el número de reseñas o la disponibilidad anual. La variable objetivo tiene tres clases: `Entire home/apt`, `Private room` y `Shared room`.

El flujo de trabajo compara cuatro familias de clasificadores clásicos (regresión logística, árbol de decisión, Random Forest y Gradient Boosting) y aplica ajuste de hiperparámetros mediante Grid Search CV y Randomized Search CV sobre el Random Forest. El artefacto distribuido es un pipeline serializado en formato `.pkl` con `joblib` que integra las etapas de imputación, escalado y codificación one-hot, por lo que puede consumirse como un único objeto sin reconstruir el preprocesado.

Su relevancia es fundamentalmente educativa y de referencia: sirve como línea base reproducible para experimentar con datos tabulares, comparación de modelos y tuning, y como punto de partida para proyectos de analítica del mercado de alquiler. El repositorio ocupa 0,1 GB y no registra descargas ni interacciones en el momento de la consulta, por lo que carece de validación externa por parte de la comunidad.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Random Forest (conjunto de árboles de decisión con bagging) embebido en un pipeline de scikit-learn |
| Parámetros totales | no disponible (no se publica el número de árboles, la profundidad máxima ni el número de nodos) |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (la entrada es un vector de características tabulares por fila, no una secuencia de texto) |
| Tipos de cuantización | no aplica (modelo tabular basado en árboles; no se distribuyen variantes cuantizadas) |
| Idiomas soportados | no disponible; las etiquetas y las columnas del dataset están en inglés |
| Licencia | MIT |
| Formato de pesos | `.pkl` serializado con `joblib` (fichero `House_Types_Classifier.pkl`) |
| Tarea | clasificación multiclase tabular |
| Variable objetivo | `room_type`, con tres clases: `Entire home/apt`, `Private room`, `Shared room` |
| Librería | scikit-learn |
| Frameworks comparados | regresión logística, árbol de decisión, Random Forest y Gradient Boosting |
| Tamaño del repositorio | 0,1 GB |
| Descargas / likes | 0 / 0 |
| Fecha de creación | 19 de septiembre de 2026 (según metadatos de HuggingFace) |
| Última actualización | 19 de septiembre de 2026 (según metadatos de HuggingFace) |

## Arquitectura y entrenamiento

El modelo final es un Random Forest, un método de conjunto que entrena múltiples árboles de decisión sobre muestras bootstrap del conjunto de entrenamiento y agrega sus predicciones por votación para reducir la varianza respecto a un árbol individual. El pipeline de scikit-learn encapsula todo el preprocesado: eliminación de identificadores, nombres de anfitrión y campos de fecha; imputación de `reviews_per_month` con cero; recorte de `price` y `minimum_nights` en el percentil 99; imputación por mediana y escalado estándar para variables numéricas; e imputación por moda y codificación one-hot para variables categóricas. El reparto de datos es una partición estratificada 80/20 entre entrenamiento y test.

El entrenamiento consiste en una comparación de los cuatro clasificadores citados mediante validación cruzada, usando accuracy y F1 macro como métricas, seguidas de evaluación sobre el conjunto de test reservado. Posteriormente se ajustan pipelines de Random Forest con Grid Search CV y Randomized Search CV. No se especifican en la información disponible el número de tokens de entrenamiento (concepto no aplicable a datos tabulares), el volumen de filas del dataset, el número de pliegues de validación, el espacio de búsqueda de hiperparámetros ni si se aplicaron técnicas de balanceo de clases. Tampoco se documenta ninguna innovación técnica más allá del uso estándar de pipelines y búsqueda de hiperparámetros.

## Capacidades

- Clasificación multiclase tabular: asigna cada anuncio a una de las tres categorías de `room_type`.
- Ingesta directa de un dataframe con las columnas esperadas por el pipeline (`neighbourhood_group`, `latitude`, `longitude`, `price`, `minimum_nights`, `number_of_reviews`, `reviews_per_month`, `calculated_host_listings_count`, `availability_365`).
- Preprocesado integrado: imputación de valores ausentes, escalado de numéricas y codificación one-hot de categóricas durante la inferencia.
- Robustez frente a valores extremos gracias al recorte de `price` y `minimum_nights` en el percentil 99.
- Serialización y recarga en una sola llamada mediante `joblib.load`, sin necesidad de reentrenar.
- Reproducibilidad del flujo completo a través de `notebook.ipynb`.
- No soporta generación de texto, razonamiento, código, matemáticas, visión ni audio.
- No soporta tool calling ni function calling.
- No está diseñado para agentes ni razonamiento multi-paso.
- No tiene capacidades multilingües: trabaja con etiquetas categóricas en inglés y variables estructuradas.
- No dispone de modo de pensamiento (thinking mode) ni de salidas de tipo cadena de razonamiento.

## Casos de uso

- Línea base educativa para clasificación tabular: el pipeline completo permite reproducir en un cuaderno el ciclo de análisis exploratorio, limpieza, comparación de modelos y tuning, lo que lo hace adecuado para formación en ciencia de datos.
- Segmentación del mercado de alquiler: clasificar anuncios por tipo de alojamiento para estudiar la distribución de la oferta (vivienda completa frente a habitación privada o compartida) por barrio y rango de precio.
- Enriquecimiento de catálogos incompletos: cuando un agregador recibe listados sin el campo de tipo de alojamiento, el modelo puede estimarlo a partir de las variables restantes y marcar la etiqueta como inferida.
- Prototipado de servicios de inferencia: dado que el artefacto es un `.pkl` autocontenido con el preprocesado, puede exponerse rápidamente mediante una API en FastAPI o Flask para validar un flujo de extremo a extremo antes de invertir en modelos más complejos.
- Filtro previo en sistemas de búsqueda: usar la predicción como señal auxiliar para ordenar o agrupar resultados por tipo de alojamiento cuando el dato de origen es ruidoso.
- Auditoría de sesgo geográfico: entrenar y evaluar el modelo por `neighbourhood_group` permite analizar si las predicciones se degradan en determinadas zonas, útil en trabajos de equidad y calidad de datos.
- Docencia de preprocesado con `ColumnTransformer`: sirve como ejemplo canónico de imputación por mediana, escalado y one-hot encoding encapsulados en un pipeline reutilizable.
- Pruebas de integración de MLOps sencillas: por su tamaño reducido y su naturaleza CPU-only, es útil para validar pipelines de empaquetado, versionado y despliegue de artefactos `joblib` en entornos de prueba.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica que el cuaderno calcula accuracy y F1 macro mediante validación cruzada y sobre el conjunto de test, pero no incluye las cifras obtenidas.

| Métrica | Conjunto de evaluación | Resultado |
|---|---|---|
| Accuracy (validación cruzada) | entrenamiento | no publicado |
| F1 macro (validación cruzada) | entrenamiento | no publicado |
| Accuracy | test reservado 20 % | no publicado |
| F1 macro | test reservado 20 % | no publicado |
| Comparación con regresión logística, árbol de decisión y Gradient Boosting | no especificado | no publicado |

## Requisitos de hardware

- VRAM: no aplica; es un clasificador de árboles que se ejecuta en CPU y no requiere GPU.
- Memoria RAM: no disponible; el tamaño del fichero `.pkl` no se especifica, aunque el repositorio completo ocupa 0,1 GB (incluye `data.csv` y el cuaderno).
- GPU recomendadas: ninguna. El modelo no aprovecha aceleración por GPU de forma nativa.
- GPU de consumo: irrelevante para este modelo; cualquier equipo con Python y scikit-learn puede ejecutarlo.
- Opciones de despliegue: carga directa del `.pkl` con `joblib` en scripts de Python, servicio HTTP con FastAPI o Flask, ejecución por lotes con pandas y orquestadores de trabajos, o conversión a otros formatos mediante herramientas externas de scikit-learn (por ejemplo, exportación a ONNX). No es compatible con vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo de lenguaje.
- Latencia y throughput: no publicados. Para un clasificador de árboles sobre vectores tabulares de pocas columnas se espera una inferencia en CPU del orden de microsegundos a pocos milisegundos por fila, pero se trata de una expectativa general y no de una medición confirmada para este artefacto.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros publicados | Entrada | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| NYC House Types Classifier (Random Forest) | Conjunto de árboles (bagging) | no disponible | Vector tabular | no publicado | MIT | HuggingFace, artefacto `.pkl`, 0 descargas |
| Regresión logística (evaluada en el cuaderno) | Modelo lineal | no disponible | Vector tabular | no publicado | MIT (dentro del proyecto) | Solo en el cuaderno, sin artefacto separado |
| Árbol de decisión (evaluado en el cuaderno) | Árbol único | no disponible | Vector tabular | no publicado | MIT (dentro del proyecto) | Solo en el cuaderno, sin artefacto separado |
| Gradient Boosting (evaluado en el cuaderno) | Boosting secuencial | no disponible | Vector tabular | no publicado | MIT (dentro del proyecto) | Solo en el cuaderno, sin artefacto separado |
| XGBoost / LightGBM | Boosting de árboles | no disponible | Vector tabular | no evaluado en este proyecto | Apache-2.0 / MIT | Librerías externas; no se han comparado cifras con este modelo |

No se dispone de comparaciones cuantitativas entre este modelo y alternativas, ya que no se han publicado métricas en la información disponible.

## Limitaciones y advertencias

- El modelo refleja únicamente los patrones del dataset de Airbnb de Nueva York utilizado y puede no generalizar a otras ciudades ni a otros periodos temporales.
- Los precios, la disponibilidad y el comportamiento de las reseñas cambian con el tiempo, lo que introduce deriva de datos y degrada las predicciones si el modelo se usa con datos recientes.
- El dataset puede contener sesgos de muestreo, de reporte y geográficos; no se documenta ningún análisis de equidad por barrio ni por grupo demográfico.
- No se publican métricas de rendimiento, matrices de confusión ni distribución de clases, por lo que se desconoce si existe desbalanceo entre `Entire home/apt`, `Private room` y `Shared room`.
- El riesgo de alucinación tal como se entiende en modelos generativos no aplica, pero las predicciones deben tratarse como estimaciones para aprendizaje y experimentación, no como clasificaciones autoritativas de una propiedad.
- El pipeline espera exactamente las columnas de características con las que fue entrenado; si falta alguna o cambia su tipo, la inferencia puede fallar o producir resultados incorrectos.
- El artefacto es un `.pkl` generado con `joblib`; deserializar ficheros de origen no verificado implica riesgo de ejecución de código arbitrario.
- La licencia MIT permite uso comercial y modificación, pero el modelo se distribuye sin garantías y sin soporte del autor.
- El repositorio no tiene descargas ni likes y no se han identificado revisiones independientes, por lo que no hay validación externa de su calidad.
- No se especifican la versión de scikit-learn ni las dependencias exactas más allá de `pyproject.toml`, lo que puede provocar incompatibilidades al recargar el `.pkl` en versiones distintas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/abdullah1904/NYC-House-Types-Classifier
- No se han encontrado enlaces adicionales relevantes (papers, blogs, repositorios o demos) en la búsqueda web realizada; los resultados obtenidos corresponden únicamente a páginas principales de buscadores y no aportan información sobre el modelo.
