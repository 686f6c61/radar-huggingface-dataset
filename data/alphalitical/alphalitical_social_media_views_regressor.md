# Alphalitical/Alphalitical_social_media_views_regressor

## Resumen

Alphalitical_social_media_views_regressor es un modelo de regresión tabular publicado por el usuario Alphalitical en Hugging Face. No es un modelo de lenguaje ni una red neuronal profunda: se trata de un pipeline de scikit-learn que envuelve un `LGBMRegressor` de LightGBM configurado con objetivo de regresión cuantil (`alpha=0.5`, es decir, predicción de la mediana). Su propósito es estimar el número de visualizaciones de publicaciones en redes sociales (Facebook e Instagram) a partir de métricas de engagement y del tipo de contenido.

La elección de regresión cuantil en lugar de regresión sobre la media responde a la distribución fuertemente asimétrica de las visualizaciones, con colas extremas dominadas por publicaciones virales. Predecir la mediana reduce la sensibilidad del modelo a esos outliers y evita la inflación del error estándar. El preprocesamiento combina `RobustScaler` para las variables numéricas de engagement (reacciones, comentarios, compartidos, engagement total) y `OneHotEncoder` para las categóricas (plataforma de origen y tipo de contenido).

El repositorio contiene dos artefactos: `best_model.joblib`, entrenado con validación cruzada estándar de 5 folds, y `best_model_ts.joblib`, entrenado con `TimeSeriesSplit` para una evaluación temporal cronológica estricta. Es relevante como ejemplo de pipeline de predicción de rendimiento en marketing de contenidos, aunque su alcance es muy acotado, su trazabilidad limitada y no se han publicado métricas de rendimiento ni detalles del dataset en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pipeline scikit-learn con `LGBMRegressor` (LightGBM) y objetivo de regresión cuantil (`alpha=0.5`) |
| Parametros totales | no disponible (modelo de árboles; el número de árboles y hojas no se documenta) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo tabular, no secuencial) |
| Tipos de cuantizacion | no disponible (no aplica; artefacto `joblib`) |
| Idiomas soportados | no disponible (no procesa texto libre; las categóricas se codifican con OneHotEncoder) |
| Licencia | no disponible |
| Formato de pesos | `joblib` (`best_model.joblib`, `best_model_ts.joblib`) |

## Arquitectura y entrenamiento

El modelo es un `LGBMRegressor` de LightGBM, un algoritmo de gradient boosting sobre árboles de decisión con crecimiento por hojas. La función objetivo es cuantil con `alpha=0.5`, lo que implica que el modelo optimiza la pérdida de pinball para la mediana condicional en lugar de la media. El pipeline incluye dos transformadores previos: `RobustScaler` sobre las variables numéricas de engagement (reacciones, comentarios, compartidos y engagement total), que centra y escala usando mediana y rango intercuartílico para resistir outliers, y `OneHotEncoder` sobre las variables categóricas de plataforma y tipo de contenido.

Se han publicado dos variantes de entrenamiento: una con validación cruzada de 5 folds estándar y otra con `TimeSeriesSplit`, que respeta el orden cronológico de las observaciones para evitar fuga de información temporal. La model card no especifica el número de muestras, el periodo temporal cubierto, la composición del dataset, ni si hubo ajuste de hiperparámetros más allá de la selección de folds. Tampoco se documentan técnicas de regularización, número de estimadores, profundidad máxima ni learning rate.

## Capacidades

- Predicción de la mediana de visualizaciones de publicaciones en Facebook e Instagram a partir de métricas de engagement y tipo de contenido.
- Regresión robusta frente a outliers gracias al objetivo cuantil y al escalado con `RobustScaler`.
- Manejo de variables categóricas mediante codificación one-hot (plataforma de origen y tipo de contenido).
- Dos variantes de evaluación: validación cruzada aleatoria y validación temporal cronológica.
- No soporta generación de texto, razonamiento, código, matemáticas, visión ni audio.
- No soporta tool calling, function calling ni razonamiento multi-paso.
- No tiene capacidades multilingües: no procesa lenguaje natural.
- No dispone de modo "thinking" ni de ninguna capacidad cognitiva avanzada.

## Casos de uso

- Planificación de calendario editorial: estimar la mediana de visualizaciones esperadas de una publicación antes de publicarla, a partir del engagement previsto y del tipo de contenido, para decidir qué formatos priorizar.
- Establecimiento de líneas base de rendimiento: usar la predicción mediana como referencia para distinguir una publicación con rendimiento normal de una que empieza a comportarse como viral.
- Priorización de recursos en marketing: comparar la mediana esperada entre plataformas (Facebook frente a Instagram) y tipos de contenido para asignar presupuesto y esfuerzo creativo.
- Detección temprana de anomalías: si las visualizaciones observadas superan ampliamente la mediana predicha, marcar la publicación para análisis posterior o para amplificar su distribución.
- Evaluación de campañas con series temporales: la variante `best_model_ts.joblib`, entrenada con `TimeSeriesSplit`, permite validar el modelo respetando el orden cronológico, adecuada para escenarios donde el rendimiento cambia con el tiempo.
- Integración en dashboards internos: el artefacto `joblib` puede cargarse directamente en un servicio Python con scikit-learn para exponer predicciones vía API interna o alimentar informes automatizados.
- Análisis de sensibilidad de engagement: variando las entradas numéricas (reacciones, comentarios, compartidos) puede estimarse cómo cambia la mediana esperada de visualizaciones, útil para formación de equipos de contenido.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de error (MAE, RMSE, MAPE, cobertura del intervalo cuantil) ni comparaciones con alternativas.

## Requisitos de hardware

- Inferencia en CPU: LightGBM con objetivo cuantil es eficiente en CPU; no requiere GPU.
- VRAM estimada: no aplica; el modelo no usa aceleración por GPU de forma nativa.
- GPU recomendadas: no aplica; no se documenta soporte GPU.
- ¿Cabe en consumer GPU? No aplica; el despliegue típico es en CPU.
- Opciones de despliegue: carga directa con `joblib.load` en Python con scikit-learn y LightGBM instalados; exposición mediante FastAPI, Flask o un job batch; serialización alternativa a ONNX no documentada.
- Latencia y throughput estimados: no disponibles; dependen del número de árboles y del volumen de peticiones, no documentados.

## Comparativa con modelos similares

| Modelo | Tipo | Objetivo | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Alphalitical_social_media_views_regressor | LightGBM cuantil (alpha=0.5) | Mediana de visualizaciones en Facebook e Instagram | no aplica | no disponible | Hugging Face, 0 descargas |
| Regresión lineal / Ridge sobre las mismas features | Modelo lineal | Media condicional | no aplica | según implementación | Disponible en scikit-learn |
| XGBoost Regressor con objetivo cuantil | Gradient boosting | Mediana condicional | no aplica | Apache 2.0 (XGBoost) | Disponible en xgboost |
| CatBoost Regressor | Gradient boosting | Media o cuantil | no aplica | Apache 2.0 (CatBoost) | Disponible en catboost |

No se dispone de comparaciones empíricas publicadas entre este modelo y las alternativas anteriores; la comparativa es estructural, no de rendimiento.

## Limitaciones y advertencias

- No se documenta la licencia, lo que impide determinar si el uso comercial está permitido; debe consultarse con el autor antes de cualquier despliegue en producción.
- No se publican métricas de error ni de calibración del cuantil, por lo que no es posible evaluar la calidad predictiva a priori.
- El modelo está entrenado exclusivamente para Facebook e Instagram; extrapolar a otras plataformas (TikTok, YouTube, LinkedIn) no está justificado.
- La predicción es de la mediana, no de la media ni del valor esperado; puede infraestimar sistemáticamente el rendimiento agregado de campañas con distribuciones muy asimétricas.
- Riesgo de deriva temporal: el comportamiento de las redes sociales cambia con los algoritmos de distribución; sin fecha de entrenamiento documentada ni reentrenamiento periódico, la validez puede degradarse.
- No se especifica el tamaño ni la procedencia del dataset de entrenamiento, lo que impide evaluar sesgos de representatividad por región, sector o tamaño de cuenta.
- El repositorio tiene 0 descargas y 0 likes, sin validación externa de la comunidad.
- El tamaño del repo es de 0.0 GB según la información disponible, lo que sugiere que los artefactos `joblib` podrían no estar efectivamente subidos o que el tamaño es inferior a la precisión de medida reportada; conviene verificar la integridad de los ficheros antes de usarlos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Alphalitical/Alphalitical_social_media_views_regressor
- Documentación de LightGBM: https://lightgbm.readthedocs.io/
- Documentación de scikit-learn (RobustScaler, OneHotEncoder, TimeSeriesSplit): https://scikit-learn.org/stable/
- Documentación de joblib: https://joblib.readthedocs.io/
