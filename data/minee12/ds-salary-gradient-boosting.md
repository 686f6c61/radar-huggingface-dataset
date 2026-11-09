# Minee12/ds-salary-gradient-boosting

## Resumen

`Minee12/ds-salary-gradient-boosting` es un modelo de regresión tabular basado en `GradientBoostingRegressor` de scikit-learn, publicado por el usuario Minee12 en Hugging Face. Su objetivo es predecir el salario anual en dólares estadounidenses de profesionales del sector de datos a partir de variables como el nivel de experiencia, el puesto, la ubicación geográfica, el tamaño de la empresa y el grado de trabajo remoto. No se trata de un modelo de lenguaje ni de una red neuronal: es un artefacto clásico de machine learning serializado con joblib.

El modelo se desarrolló como proyecto académico para la asignatura MN1135 Business Data Science (autoría de Jasmine Liu, NIM 2025121076) y se plantea como herramienta de apoyo para que departamentos de recursos humanos estimen rangos de oferta salarial. Se entrenó sobre el conjunto público «Data Science Salaries 2023» de Kaggle, tras eliminar 1.171 duplicados, quedando 2.584 filas divididas en 2.067 de entrenamiento y 517 de prueba.

Es relevante como ejemplo de pipeline tabular reproducible y ligero (repo de 0,0 GB), pero sus métricas son modestas: R² de 0,3812 y RMSE de 52.027 USD en test, lo que limita su uso a estimaciones orientativas y no a decisiones salariales individuales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Gradient Boosting Regressor (scikit-learn), árboles de decisión potenciados secuencialmente |
| Parametros totales | no disponible (modelo de árboles; 287 estimadores, profundidad máxima 4) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo tabular; entrada de 8 features) |
| Tipos de cuantizacion | no disponible (serialización joblib; no se documentan cuantizaciones) |
| Idiomas soportados | id (indonesio; etiquetas de categorías y documentación) |
| Licencia | MIT |
| Formato de pesos | joblib (`model_gb_tuned.joblib`, `scaler.joblib`) más JSON auxiliares |

## Arquitectura y entrenamiento

El modelo es un `GradientBoostingRegressor` de scikit-learn con función de pérdida Huber, 287 estimadores, profundidad máxima 4, `learning_rate` 0,1062, `max_features` 0,2, `min_samples_leaf` 13, `min_samples_split` 7 y `subsample` 0,9018. Los hiperparámetros se obtuvieron mediante búsqueda aleatoria y en rejilla con validación cruzada de 5 pliegues y métrica RMSE. El preprocesamiento incluye one-hot encoding de las variables categóricas, generando 250 columnas finales; el orden de columnas se guarda en `model_columns.json` y la configuración de categorías válidas en `preprocessing_config.json`.

Los datos provienen del dataset «Data Science Salaries 2023» de Kaggle (licencia DbCL-1.0), con 2.584 filas tras deduplicación. La variable objetivo es `salary_in_usd`. Las features de entrada son `work_year` (2020-2023), `experience_level` (EN, MI, SE, EX), `employment_type` (FT, PT, CT, FL), `job_title` (93 valores), `employee_residence` (78 valores ISO), `remote_ratio` (0, 50, 100), `company_location` (72 valores ISO) y `company_size` (S, M, L). No se documenta uso de RLHF, DPO ni técnicas de regularización más allá de los hiperparámetros del bosque potenciado. El modelo se entrenó con scikit-learn 1.6.1.

## Capacidades

- Predicción de regresión sobre datos tabulares: estima un salario anual continuo en USD.
- Procesamiento de 8 features mixtas (numéricas y categóricas) con one-hot encoding interno.
- Inferencia por lotes o fila a fila mediante el helper `inference.py` incluido en el repositorio.
- Validación de categorías de entrada contra `preprocessing_config.json`, con error explícito ante valores desconocidos.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni generación de texto.
- No tiene capacidades multimodales (sin visión, audio ni vídeo).
- Capacidad multilingüe limitada a etiquetas en indonesio y códigos ISO estándar; no procesa lenguaje natural libre.

## Casos de uso

- Estimación orientativa de bandas salariales en RR. HH.: dado un perfil (nivel, puesto, país, tamaño de empresa), el modelo devuelve un salario base que puede usarse como punto de partida para construir rangos, siempre ampliándolo con el MAE de ±39.213 USD.
- Análisis exploratorio de compensación por país: permite comparar predicciones entre códigos ISO de residencia y de localización de empresa para detectar brechas geográficas en los datos de 2020-2023.
- Simulación de escenarios de trabajo remoto: al variar `remote_ratio` (0, 50, 100) se puede observar el efecto estimado sobre el salario, útil para políticas internas de trabajo híbrido.
- Docencia y reproducción de pipelines tabulares: sirve como ejemplo completo de entrenamiento, tuning con CV, serialización y despliegue ligero en scikit-learn para cursos de ciencia de datos.
- Prototipado rápido de APIs de predicción: el artefacto joblib y el helper `inference.py` permiten montar un endpoint interno en minutos sin infraestructura GPU.
- Benchmark interno de modelos tabulares: al ser un baseline pequeño y reproducible, puede usarse para comparar con XGBoost, LightGBM o CatBoost en la misma tarea de predicción salarial.
- Filtro previo en procesos de selección: descartar ofertas anómalamente alejadas de la predicción para revisión manual, nunca como decisión automática.

## Benchmarks y rendimiento

Resultados publicados en la model card sobre el conjunto de prueba (517 filas):

| Metrica | Valor |
|---|---|
| RMSE | 52.027 USD |
| MAE | 39.213 USD |
| MSE | 2.706.840.864 |
| R² | 0,3812 |
| Baseline (media de salario) RMSE | 66.142 USD |
| Baseline (media de salario) R² | ≈ 0 |

No se han publicado comparaciones con otros modelos (XGBoost, LightGBM, CatBoost, regresión lineal) en la información disponible.

## Requisitos de hardware

- VRAM estimada: 0 GB; el modelo es de árboles y se ejecuta íntegramente en CPU.
- GPU recomendadas: no aplica; no requiere GPU.
- Cabe en cualquier equipo consumer: el repositorio ocupa 0,0 GB y el artefacto joblib es de tamaño reducido (no se especifica cifra exacta).
- Opciones de despliegue: script Python con scikit-learn 1.6.1 y joblib; puede servirse mediante FastAPI, Flask, BentoML o como función serverless. No es compatible con vLLM, llama.cpp, Ollama ni TGI, que están orientados a modelos de lenguaje.
- Latencia y throughput: no disponibles en la información proporcionada; por la naturaleza del modelo (287 árboles de profundidad 4) se espera inferencia en milisegundos por fila en CPU, pero no hay cifras publicadas.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables publicados con la misma tarea y dataset en la información proporcionada. Como referencia cualitativa, los modelos de gradient boosting más habituales para regresión tabular (XGBoost, LightGBM, CatBoost) suelen superar a `GradientBoostingRegressor` de scikit-learn en velocidad y, a menudo, en precisión, pero no se han publicado métricas comparativas en esta ficha.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| ds-salary-gradient-boosting | 287 estimadores, profundidad 4 | no aplica | MIT | Hugging Face |
| XGBoost / LightGBM / CatBoost | no disponible | no aplica | licencias propias | no disponible en esta ficha |

## Limitaciones y advertencias

- Capacidad explicativa moderada: R² de 0,3812 implica que la mayor parte de la varianza salarial no queda explicada por las features disponibles.
- Error elevado: MAE de 39.213 USD y RMSE de 52.027 USD; debe usarse como rango (predicción ± MAE) y no como cifra final.
- Peor precisión en niveles Executive y Entry por escasez de datos en esas categorías.
- Datos de 2020-2023 y solo 2.584 filas; los patrones salariales cambian con el tiempo y el modelo requiere reentrenamiento periódico.
- Categorías raras o ausentes en entrenamiento no se predicen de forma fiable; el helper lanza error ante valores desconocidos.
- No captura variables relevantes como bonus, equity, industria, habilidades específicas o años reales de experiencia.
- Riesgo de reproducir sesgos y brechas salariales entre países presentes en el dataset original.
- No establece relaciones causales; no debe usarse como única base para decisiones sobre personas.
- Dependencia estricta de scikit-learn 1.6.1; versiones distintas pueden romper la compatibilidad de la serialización joblib.
- Licencia MIT permite uso comercial, pero la licencia del dataset original (DbCL-1.0) debe respetarse por separado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Minee12/ds-salary-gradient-boosting
- Dataset original en Kaggle: https://www.kaggle.com/datasets/arnabchaki/data-science-salaries-2023
- Documentación de scikit-learn GradientBoostingRegressor: https://scikit-learn.org/stable/modules/generated/sklearn.ensemble.GradientBoostingRegressor.html
- Repositorio de scikit-learn: https://github.com/scikit-learn/scikit-learn
