# marcel739/uas

## Resumen

`marcel739/uas` es un modelo de clasificación tabular binaria entrenado con scikit-learn (Random Forest) para predecir rotación de empleados (attrition) a partir de 17 características numéricas de recursos humanos. Lo publica Marcel Ong en el contexto de la asignatura MN1135 Business Data Science (NIM 2025121043), y no es un modelo de lenguaje ni una red neuronal: es un artefacto serializado con joblib que se carga en Python para inferencia sobre datos tabulares.

El modelo resuelve un problema acotado: dado un registro con satisfacción laboral, última evaluación, número de proyectos, horas mensuales, antigüedad, accidentes laborales, promociones, salario codificado y departamento (one-hot), estima la probabilidad de que el empleado abandone la empresa (`left=1`) o permanezca (`left=0`). El repositorio incluye además el `StandardScaler` y el orden de columnas necesarios para reproducir el preprocesado.

Es relevante únicamente como ejemplo didáctico de pipeline de clasificación tabular con métricas declaradas sobre el conjunto de prueba (accuracy 0.9858, F1 0.9558 para la clase positiva). No compite con modelos fundacionales ni con sistemas de IA generativa: es un artefacto de tamaño mínimo (0.0 GB), sin idiomas ni contexto en el sentido de los LLM.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Random Forest (scikit-learn, ensemble de árboles de decisión) |
| Parámetros totales | no disponible (no aplica; modelo de árboles, sin recuento de parámetros neuronales) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no aplica; entrada tabular de 17 columnas fijas) |
| Tipos de cuantización | no disponible (no aplica; artefacto joblib) |
| Idiomas soportados | no disponible (no procesa texto; los nombres de columna están en inglés) |
| Licencia | MIT |
| Formato de pesos | joblib (`model_final.joblib`, `scaler.joblib`, `feature_names.joblib`, `metadata.json`) |

## Arquitectura y entrenamiento

El modelo es un `RandomForestClassifier` de scikit-learn, es decir, un ensemble de árboles de decisión entrenados con bagging y selección aleatoria de características en cada división. No hay capas neuronales, atención ni mecanismo de contexto: la entrada es un vector de 17 características numéricas y la salida es una etiqueta binaria (`left`). El pipeline incluye estandarización con `StandardScaler` sobre las columnas indicadas en `scale_columns` y un orden de columnas fijado mediante `feature_names.joblib`.

El entrenamiento se realizó sobre el dataset público HR Analytics (`HR_comma_sep.csv`, disponible en Kaggle), que contiene atributos de satisfacción, evaluación, número de proyectos, horas mensuales, antigüedad, accidentes, promociones, departamento y nivel salarial. La model card menciona que el modelo publicado es el resultado de un tuning ("model hasil tuning"), pero no detalla hiperparámetros, número de árboles, profundidad, semilla ni proceso de validación. No se documenta uso de RLHF, DPO ni técnicas de regularización específicas más allá del propio ensemble.

## Capacidades

- Clasificación binaria tabular: predice `left=0` (permanece) o `left=1` (abandona) a partir de 17 features numéricas.
- Preprocesado reproducible: incluye scaler y orden de columnas para garantizar consistencia entre entrenamiento e inferencia.
- Integración directa en Python mediante `joblib.load` y `model.predict()`.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso.
- No procesa texto, imágenes, audio ni lenguaje natural.
- No tiene capacidades multilingües: los identificadores de columna están en inglés y el target es numérico.
- No dispone de modo "thinking", visión ni generación.

## Casos de uso

- **Análisis exploratorio de rotación en RR. HH.:** cargar el modelo y puntuar una plantilla histórica para identificar empleados con mayor probabilidad de salida y priorizar entrevistas de retención. Es adecuado porque el modelo está entrenado sobre el dataset HR Analytics estándar y produce una probabilidad interpretable por registro.
- **Prototipado docente de pipelines tabulares:** usar el repositorio como plantilla para enseñar carga de artefactos joblib, escalado y evaluación con accuracy, precision, recall y F1 en un caso realista de clasificación binaria.
- **Sistema de alerta temprana en un dashboard de RR. HH.:** integrar `model_final.joblib` en un script programado que lea la tabla de empleados, aplique el scaler y genere una lista de casos con score alto para revisión humana semanal.
- **Validación de hipótesis sobre factores de rotación:** emplear las predicciones y la importancia de variables del Random Forest (si se extrae del artefacto) para contrastar qué features —satisfacción, horas, antigüedad— pesan más en la salida.
- **Generación de datos sintéticos de prueba:** usar el modelo como oráculo para etiquetar registros sintéticos con distribución similar al dataset original y probar pipelines downstream de RR. HH.
- **Benchmark interno de modelos tabulares:** servir como baseline de referencia (accuracy 0.9858, F1 0.9558) frente a alternativas como regresión logística, gradient boosting o XGBoost en el mismo dataset.
- **Documentación de auditoría de sesgo:** analizar las predicciones por departamento o nivel salarial para detectar disparidades antes de cualquier uso real, dado que la model card advierte de posibles sesgos en los datos históricos.

## Benchmarks y rendimiento

Resultados declarados por el autor sobre el conjunto de prueba (no se especifica el tamaño ni la partición exacta):

| Métrica | Valor |
|---|---|
| Accuracy | 0.9858 |
| Precision (clase `left=1`) | 0.9892 |
| Recall (clase `left=1`) | 0.9246 |
| F1-score (clase `left=1`) | 0.9558 |

No se han publicado resultados comparativos con otros modelos (MMLU, HumanEval, GSM8K no aplican; no hay benchmarks tabulares adicionales en la información disponible).

## Requisitos de hardware

- VRAM estimada: no aplica; el modelo es un artefacto joblib de tamaño mínimo (repo de 0.0 GB) que se ejecuta en CPU.
- GPU recomendadas: no requiere GPU; cualquier CPU moderna es suficiente.
- Cabe en cualquier equipo consumer: portátil básico, Raspberry Pi o contenedor con pocos cientos de MB de RAM.
- Opciones de despliegue: script Python con `joblib` y `scikit-learn`; también puede servirse mediante FastAPI, Flask o un job programado. No aplica vLLM, llama.cpp, Ollama ni TGI, que son para modelos de lenguaje.
- Latencia y throughput: no disponibles en la información proporcionada; en la práctica, la inferencia de un Random Forest sobre 17 features es del orden de microsegundos a milisegundos por registro en CPU.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| `marcel739/uas` | Random Forest tabular | no aplica | no aplica | Accuracy 0.9858, F1 0.9558 | MIT | Hugging Face |
| Regresión logística (baseline típico en HR Analytics) | Modelo lineal tabular | no aplica | no aplica | no disponible en esta ficha | según implementación | scikit-learn |
| XGBoost / LightGBM (alternativas típicas) | Gradient boosting tabular | no aplica | no aplica | no disponible en esta ficha | Apache 2.0 / MIT | librerías estándar |
| Modelos fundacionales tabulares (p. ej. TabPFN) | Transformer tabular | no disponible | no disponible | no disponible en esta ficha | según versión | Hugging Face / repos |

No se dispone de comparaciones publicadas por el autor frente a estos modelos; la comparativa es orientativa por categoría.

## Limitaciones y advertencias

- El modelo solo aprende patrones del dataset histórico HR Analytics; no generaliza necesariamente a otras empresas, sectores o épocas.
- La model card advierte explícitamente de posible sesgo en los datos y de cambios de patrón con el tiempo.
- Riesgo de alucinación no aplica (no genera texto), pero sí de predicciones erróneas con falsos positivos y negativos; el recall de 0.9246 implica que aproximadamente un 7,5 % de los empleados que se van no se detectan.
- No debe usarse como base única de decisiones sobre empleados; el autor indica que es solo una señal inicial para revisión humana por RR. HH.
- El repositorio no documenta hiperparámetros, partición train/test ni semilla, lo que dificulta la reproducibilidad exacta de las métricas.
- No incluye información sobre idiomas, contexto ni cuantización porque no son aplicables a este tipo de artefacto.
- Licencia MIT: permite uso comercial y modificación, pero sin garantías; conviene auditar sesgos antes de cualquier despliegue real.

## Enlaces

- Hugging Face: https://huggingface.co/marcel739/uas
- Dataset original (Kaggle HR Analytics): https://www.kaggle.com/ludobenistant/hr-analytics/data
- scikit-learn (Random Forest): https://scikit-learn.org/stable/modules/ensemble.html#forest
- joblib: https://joblib.readthedocs.io/
