# Freddddd1/senior-management-prediction

## Resumen

`Freddddd1/senior-management-prediction` es un modelo de clasificación binaria tabular publicado en Hugging Face por el autor Frederick Edbert (NIM 2025121088) como proyecto de la asignatura Business Data Science (MN1135) del Programa de Estudios de Gestión de la Universitas Universal, semestre 2026/2027. No es un modelo de lenguaje ni una red neuronal: es un `DecisionTreeClassifier` de scikit-learn serializado con joblib que estima si un empleado ocupa un puesto de dirección senior (`Senior Management` = 1) a partir de su perfil laboral y retributivo.

El modelo se entrenó sobre el dataset público *Employee Data* (1.000 filas, 8 columnas originales, 14 tras el preprocesado) con un split 80/20 estratificado y `random_state=42`. La entrada son seis campos crudos (género, equipo, salario, porcentaje de bonus, fecha de inicio y hora del último login) que se transforman en 14 features mediante ingeniería de variables (antigüedad en años, hora de login y one-hot encoding de género y equipo con `drop_first=True`). La salida es una clase binaria y una probabilidad asociada.

Su relevancia es limitada y el propio autor la acota: se presenta como herramienta de cribado preliminar para listas de revisión del *leadership pipeline* en RR. HH., nunca como base para decisiones de promoción o evaluación de desempeño. Los resultados publicados son deliberadamente modestos (F1 de 0,6491 en la clase Senior, ROC-AUC de 0,548) y el autor los atribuye a la debilidad intrínseca de las señales disponibles, no a un error de proceso.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Árbol de decisión (`DecisionTreeClassifier` de scikit-learn 1.6.1) |
| Parametros totales | no disponible (árbol con `max_depth=3`, `min_samples_leaf=5`, `min_samples_split=2`) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo tabular, sin ventana de contexto) |
| Tipos de cuantizacion | no aplica (serialización joblib; sin cuantización) |
| Idiomas soportados | `id` (indonesio), según la model card y los metadatos |
| Licencia | MIT |
| Formato de pesos | joblib (`model_senior.joblib`, `scaler.joblib`, `feature_names.joblib`, `metadata.joblib`) |

## Arquitectura y entrenamiento

El clasificador es un árbol de decisión único, no un ensemble, con profundidad máxima 3 y un mínimo de 5 muestras por hoja. Se entrenó con `class_weight='balanced'` sobre 800 filas (80 % del dataset) y se evaluó sobre 200 filas reservadas con estratificación por clase. Los hiperparámetros se seleccionaron mediante `GridSearchCV` con validación cruzada de 5 folds y `scoring='f1'`, restringido al conjunto de entrenamiento. El preprocesado incluye el cálculo de `tenure_years` como `round((2026-09-28 - Start Date).days / 365.25, 2)`, la extracción de la hora de `Last Login Time` y un one-hot encoding de `Gender` y `Team` con `drop_first=True`, tomando `Gender = Female` y `Team = Business Development` como categorías de referencia. No se aplica `StandardScaler` porque el modelo es basado en árboles y se entrenó con valores crudos.

No hay datos de entrenamiento profundo, RLHF, DPO ni innovaciones de inferencia: es un pipeline clásico de scikit-learn. La decisión metodológica más destacable es la elección del F1 sobre la clase Senior como métrica principal, justificada por asimetría de costes (un falso negativo, un candidato a liderazgo no detectado, se considera más caro que un falso positivo). El autor documenta explícitamente que las correlaciones de las variables numéricas con el target están por debajo de 0,07 en magnitud y que la V de Cramér de `Team` es solo 0,099, lo que explica el bajo rendimiento.

## Capacidades

- Clasificación binaria tabular: predice si un empleado pertenece a la clase Senior (1) o no (0).
- Salida de probabilidad calibrada por el árbol (`predict_proba`), útil para ordenar candidatos en una lista de revisión.
- Ingeniería de variables integrada en el pipeline: derivación de antigüedad y hora de login a partir de fechas y marcas temporales.
- Codificación one-hot determinista de `Gender` y `Team` con categorías de referencia fijas.
- Reproducibilidad estricta: requiere scikit-learn 1.6.1, pandas, numpy, joblib y huggingface_hub.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni generación de texto.
- Capacidad multilingüe: no aplica; el modelo no procesa lenguaje, solo columnas tabulares.

## Casos de uso

- Cribado preliminar de liderazgo en RR. HH.: el modelo genera una lista ordenada por probabilidad de pertenencia a dirección senior para que el equipo de RR. HH. priorice revisiones manuales, tal como propone el autor.
- Auditoría de sesgo en pipelines de RR. HH.: al incluir `Gender` como feature y exponer su peso en un árbol poco profundo, sirve como caso de estudio para detectar dependencias no deseadas antes de desplegar modelos de people analytics.
- Prototipado docente de clasificación tabular: pipeline completo y reproducible (split estratificado, GridSearchCV, one-hot, serialización joblib) útil como plantilla en cursos de ciencia de datos.
- Validación de infraestructura de serving tabular: por su tamaño mínimo y su formato joblib, permite probar endpoints de inferencia y contratos de entrada/salida sin coste de GPU.
- Análisis de viabilidad de datos: el propio modelo demuestra, con métricas publicadas, que las variables disponibles no bastan para predecir el nivel jerárquico, lo que justifica inversiones en fuentes de datos adicionales (historial de promociones, evaluaciones de desempeño).
- Reproducción de experimentos académicos: sirve para replicar el flujo de preprocesado documentado (fecha de referencia 2026-09-28, categorías de referencia) y comparar variantes de modelos sobre el mismo dataset.

## Benchmarks y rendimiento

Resultados publicados en la model card sobre el conjunto de prueba (200 filas):

| Metrica | Valor |
|---|---|
| Accuracy | 0,535 |
| Precision (clase Senior) | 0,5029 |
| Recall (clase Senior) | 0,9149 |
| F1-score (clase Senior) | 0,6491 |
| ROC-AUC | 0,548 |

No se han publicado comparaciones con otros modelos en la información disponible. El autor advierte que diferencias de F1 inferiores a aproximadamente 0,05 entre modelos no son estadísticamente distinguibles con este tamaño de muestra.

## Requisitos de hardware

- VRAM estimada: 0 GB; la inferencia se ejecuta en CPU.
- GPU recomendadas: ninguna; no se requiere aceleración por hardware.
- Cabe en cualquier equipo consumer: el repositorio ocupa 0,0 GB y el árbol tiene profundidad 3.
- Opciones de despliegue: script Python con joblib y scikit-learn 1.6.1, o servicio HTTP ligero (FastAPI, Flask) que cargue los artefactos `model_senior.joblib`, `scaler.joblib`, `feature_names.joblib` y `metadata.joblib`.
- Latencia y throughput: no disponibles en la información proporcionada; por la naturaleza del modelo (árbol de profundidad 3) la latencia esperada por predicción es de microsegundos a milisegundos en CPU, aunque no se aporta medición oficial.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. Como referencia cualitativa, dentro del propio espacio de clasificación tabular de RR. HH. cabría comparar con ensembles de gradient boosting (XGBoost, LightGBM, CatBoost) entrenados sobre el mismo dataset, pero no se han publicado resultados de tales alternativas en la información disponible.

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `Freddddd1/senior-management-prediction` | Árbol, profundidad 3 | no aplica | F1 0,6491; ROC-AUC 0,548 | MIT | Hugging Face |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Señal predictiva débil: las correlaciones de las variables numéricas con el target están por debajo de 0,07 en magnitud y la V de Cramér de `Team` es 0,099; el ROC-AUC de 0,548 está próximo al azar.
- Dataset pequeño: 1.000 filas totales y 200 de prueba; las diferencias de F1 por debajo de 0,05 no son estadísticamente distinguibles.
- Variables ausentes críticas: no hay historial de promociones, evaluaciones de desempeño, evaluaciones de competencias ni historial educativo, que son los predictores convencionales del nivel directivo.
- Riesgo de uso indebido: el autor prohíbe explícitamente emplearlo como base para decisiones de promoción, traslado o evaluación de desempeño; usarlo así constituye un uso contrario a la model card.
- Sesgo potencial por `Gender`: la variable se incluye como feature y puede introducir dependencias de género en las predicciones; debe auditarse antes de cualquier uso real.
- Dependencia de versión: requiere scikit-learn 1.6.1 exactamente para evitar `InconsistentVersionWarning` y posibles diferencias de comportamiento.
- Preprocesado frágil: la fecha de referencia para la antigüedad está fijada a 2026-09-28 y las categorías de referencia del one-hot son fijas; cualquier cambio en el esquema de entrada invalida las predicciones.
- Idioma: la documentación y el contexto del dataset están en indonesio; no hay soporte multilingüe porque el modelo no procesa texto libre.
- Licencia MIT: permite uso comercial y modificación, pero no exime de las advertencias éticas y de idoneidad anteriores.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Freddddd1/senior-management-prediction
- Dataset original en Kaggle: https://www.kaggle.com/datasets/shree0910/employee-dataset/data
- Mirror del dataset en GitHub: https://github.com/Narr55/Employee-Data/raw/refs/heads/main/Employee_updated.csv
