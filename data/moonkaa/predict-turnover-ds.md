# moonkaa/predict-turnover-ds

## Resumen

`moonkaa/predict-turnover-ds` es un clasificador tabular binario que estima la probabilidad de que un científico de datos abandone la empresa (turnover) tras completar un programa de formación interno. Lo desarrolla el usuario moonkaa y se publica bajo licencia MIT. No es un modelo de lenguaje: es un artefacto de scikit-learn serializado con joblib que encapsula un `RandomForestClassifier` optimizado mediante `GridSearchCV`, acompañado de un escalador y una lista de nombres de columnas.

El modelo aborda un problema acotado de analítica de recursos humanos: dado un conjunto de 14 variables sociodemográficas y laborales de un candidato, devuelve una etiqueta binaria (1 = riesgo de abandono, 0 = retención). Su interés práctico reside en el ajuste agresivo del umbral de decisión durante el tuning: el recall de la clase positiva sube del 49,01 % al 77,38 % a costa de sacrificar precisión (del 58,28 % al 54,82 %), una decisión de diseño coherente con un caso de uso de retención preventiva donde el coste de un falso negativo es alto.

El repositorio es de tamaño 0,0 GB (los artefactos joblib ocupan pocos megabytes) y no registra descargas ni likes en el momento de la consulta. El pipeline de Hugging Face no está declarado y el idioma etiquetado es `id` (indonesio), lo que refleja el origen del dataset y de la documentación, no una capacidad multilingüe del modelo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Random Forest (ensemble de árboles de decisión) con `GridSearchCV` para ajuste de hiperparámetros |
| Parametros totales | no disponible (el número de árboles y su profundidad no se detallan en la model card) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo tabular; entrada de 169 columnas tras one-hot encoding) |
| Tipos de cuantizacion | no disponible (serialización joblib; no se documentan variantes) |
| Idiomas soportados | `id` (indonesio); las variables categóricas del dataset están en indonesio/inglés |
| Licencia | MIT |
| Formato de pesos | joblib (`.joblib`), compatible con scikit-learn 1.6.1 |

## Arquitectura y entrenamiento

El modelo es un `RandomForestClassifier` de scikit-learn, un ensemble de árboles de decisión entrenados con bagging y selección aleatoria de features en cada split. Sobre él se aplicó una búsqueda en rejilla (`GridSearchCV`) para seleccionar hiperparámetros; la model card no especifica la rejilla explorada, el número final de estimadores ni la profundidad máxima. El artefacto se distribuye junto a un `scaler` (para las dos variables numéricas: `city_development_index` y `training_hours`) y un `feature_names.joblib` que fija el orden de las 169 columnas resultantes del one-hot encoding de las 12 variables categóricas restantes.

Los datos de entrenamiento provienen del dataset público de Kaggle "HR Analytics: Job Change of Data Scientists", con 19 158 filas y 14 columnas originales. No se documenta el split train/test utilizado, ni si hubo balanceo de clases, validación cruzada o tratamiento de valores ausentes más allá de lo implícito en el pipeline de preprocesado. No hay RLHF, DPO ni ninguna fase de alineación, por tratarse de un modelo supervisado clásico.

## Capacidades

- Clasificación binaria tabular: predice si un candidato abandonará la empresa (clase 1) o se quedará (clase 0).
- Entrada estructurada de 14 variables: 2 numéricas (`city_development_index`, `training_hours`) y 12 categóricas (`city`, `gender`, `relevent_experience`, `enrolled_university`, `education_level`, `major_discipline`, `experience`, `company_size`, `company_type`, `last_new_job`, entre otras).
- Salida de probabilidad y etiqueta mediante `predict` y `predict_proba` de scikit-learn.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni generación de texto.
- No tiene capacidades multimodales (visión, audio) ni modo de razonamiento explícito.
- No es multilingüe: las categorías de entrada están codificadas en indonesio/inglés y el modelo no procesa lenguaje natural libre.

## Casos de uso

- Priorización de entrevistas de retención: el equipo de HR puede ordenar a los candidatos por `predict_proba` y concentrar las conversaciones de retención en el decil de mayor riesgo, usando el recall del 77,38 % como garantía de cobertura razonable de los casos reales de abandono.
- Segmentación de cohortes de formación: cruzando la predicción con `training_hours` y `city_development_index` se identifican perfiles con alta probabilidad de fuga tras el programa formativo, lo que permite rediseñar la inversión en formación por segmento.
- Análisis de sensibilidad a variables: al ser un Random Forest, se pueden extraer importancias de features para justificar ante dirección qué factores (experiencia previa, tamaño de empresa, disciplina) correlacionan más con el abandono.
- Simulación de escenarios de contratación: evaluar lotes de candidatos antes de incorporarlos para estimar el riesgo agregado de la cohorte y ajustar la oferta o el plan de carrera.
- Integración en un dashboard de People Analytics: el artefacto joblib se carga en un servicio Python (Flask, FastAPI) y se expone como endpoint de scoring por lotes para alimentar paneles de RR. HH.
- Auditoría de sesgo en procesos de selección: al conocerse las limitaciones de falsos positivos (45,18 %), el modelo sirve como caso de estudio para establecer controles humanos obligatorios antes de cualquier decisión que afecte a empleados.
- Docencia y prototipado de pipelines tabulares: por su licencia MIT y su tamaño reducido, es un ejemplo reproducible de extremo a extremo (carga, escalado, one-hot, predicción) para cursos de machine learning aplicado.

## Benchmarks y rendimiento

Resultados reportados por el autor sobre datos de test no vistos:

| Metrica | Baseline | Optimizado (GridSearchCV) | Delta |
|---|---|---|---|
| Accuracy | 78,55 % | 78,47 % | -0,08 % |
| Precision (clase 1) | 58,28 % | 54,82 % | -3,46 % |
| Recall (clase 1) | 49,01 % | 77,38 % | +28,37 % |
| F1-score (clase 1) | 0,5324 | 0,6418 | +0,1094 |
| ROC-AUC | 0,8016 | 0,8152 | +0,0136 |

No se han publicado comparaciones con otros modelos (regresión logística, XGBoost, LightGBM) en la información disponible, ni métricas desagregadas por subgrupo demográfico.

## Requisitos de hardware

- VRAM: no aplica; el modelo se ejecuta en CPU. El artefacto joblib ocupa del orden de megabytes, no gigabytes.
- GPU: no necesaria ni soportada de forma nativa por scikit-learn para este estimador.
- Cabe en cualquier equipo de consumo: un portátil con 4 GB de RAM es suficiente para cargar el modelo y puntuar lotes de miles de filas.
- Despliegue: servicio Python con `joblib.load` + `scikit-learn==1.6.1`; se puede envolver en FastAPI, Flask, BentoML o un job por lotes. No aplica vLLM, llama.cpp, Ollama ni TGI, que son runtimes de modelos generativos.
- Latencia y throughput: no disponibles en la información proporcionada; en la práctica, la inferencia de un Random Forest sobre 169 features es del orden de microsegundos a milisegundos por fila en CPU.

## Comparativa con modelos similares

No se dispone de comparaciones publicadas con alternativas en la información proporcionada. Como referencia cualitativa de la categoría (clasificadores tabulares para el mismo dataset de Kaggle), podrían considerarse regresión logística, XGBoost o LightGBM, pero no hay datos de rendimiento de esos modelos en esta ficha que permitan una comparación rigurosa.

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `moonkaa/predict-turnover-ds` | no disponible (Random Forest) | no aplica | ROC-AUC 0,8152; F1 0,6418 | MIT | Hugging Face |
| Alternativas tabulares (XGBoost, LightGBM, regresión logística) | no disponible | no aplica | no disponible | según implementación | no disponible |

## Limitaciones y advertencias

- Tasa de falsos positivos del 45,18 %: casi la mitad de las predicciones positivas corresponden a empleados que en realidad se quedan. No debe usarse como instrumento único para decisiones disciplinarias o de recorte de derechos.
- Ausencia de datos dinámicos: el modelo solo emplea información estática del momento de inscripción en la formación; no accede a evaluación de desempeño, satisfacción salarial ni indicadores de estrés actuales.
- Validez temporal limitada: solo es aplicable si la población laboral se parece a la distribución del dataset de entrenamiento; cambios en el mercado o en la política de la empresa invalidan las predicciones.
- Riesgo de sesgo demográfico: incluye variables como `gender`, `city` y `education_level`, que pueden inducir discriminación indirecta; no se documenta ninguna auditoría de equidad.
- Dependencia de versión: requiere scikit-learn 1.6.1 exactamente; otras versiones pueden fallar al deserializar el estimador o al aplicar el escalador.
- Idioma y codificación: las categorías de entrada están en indonesio/inglés; usarlo con datos en castellano exige remapear todas las categorías y reentrenar, no basta con traducir.
- Licencia MIT: permite uso comercial y modificación, pero el autor no ofrece garantías ni soporte; la responsabilidad legal del uso en RR. HH. recae en el integrador.
- Sin métricas por subgrupo ni calibración de probabilidades documentada: un `predict_proba` alto no equivale necesariamente a una probabilidad bien calibrada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/moonkaa/predict-turnover-ds
- Dataset de origen (Kaggle): https://www.kaggle.com/datasets/arashnic/hr-analytics-job-change-of-data-scientists
- Documentación de scikit-learn (RandomForestClassifier): https://scikit-learn.org/stable/modules/generated/sklearn.ensemble.RandomForestClassifier.html
- Documentación de scikit-learn (GridSearchCV): https://scikit-learn.org/stable/modules/generated/sklearn.model_selection.GridSearchCV.html
- Documentación de joblib: https://joblib.readthedocs.io/
