# Joluga788899/employee-turnover-randomforest

## Resumen

El modelo `employee-turnover-randomforest` es un clasificador binario tabular basado en Random Forest, publicado por el usuario Joluga788899 en Hugging Face. Se desarrolló como proyecto final de la asignatura Business Data Science (MN1135) del Grado en Administración de Empresas de la Universitas Diponegoro (Indonesia). Su objetivo es predecir la probabilidad de que un empleado abandone la empresa (`event = 1`) frente a la de que permanezca (`event = 0`), de modo que el departamento de recursos humanos pueda activar programas de retención proactivos.

No se trata de un modelo de lenguaje ni de una red neuronal: es un artefacto de scikit-learn serializado con `joblib`, entrenado sobre el Employee Turnover Dataset de Kaggle (1.116 filas únicas tras eliminar duplicados, 16 columnas originales que se expanden a 50 predictores tras One-Hot Encoding). El pipeline incluye un `StandardScaler` para las variables numéricas continuas y un Random Forest Classifier optimizado mediante GridSearchCV.

La relevancia del artefacto es acotada y de carácter educativo: el repositorio ocupa 0,0 GB, no registra descargas ni interacciones, y su ámbito de aplicación está restringido a la plantilla concreta representada en el dataset original. Resulta útil como ejemplo reproducible de un flujo completo de ciencia de datos aplicada a RR. HH. (limpieza, codificación, escalado, tuning y evaluación), no como componente listo para producción en una organización distinta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Random Forest Classifier (scikit-learn) con StandardScaler previo y One-Hot Encoding |
| Parametros totales | no disponible (número de árboles y profundidad no publicados) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo tabular, sin ventana de contexto) |
| Tipos de cuantizacion | no aplica (serialización nativa `joblib`; no hay versiones GGUF ni cuantizadas) |
| Idiomas soportados | indonesio (`id`) en la documentación; las etiquetas de las variables están en inglés |
| Licencia | MIT |
| Formato de pesos | `joblib` (artefactos: modelo, scaler, `feature_names`, `metadata`) |

## Arquitectura y entrenamiento

El modelo es un ensemble de árboles de decisión con bagging y selección aleatoria de subconjuntos de características en cada división, implementado en scikit-learn (versión mínima exigida: 1.6.1). Antes del entrenamiento se aplica One-Hot Encoding a las variables categóricas (`gender`, `industry`, `profession`, `traffic`, `coach`, `head_gender`, `greywage`, `way`), lo que lleva de 16 columnas originales a 50 predictores de entrada. Las variables numéricas continuas (`stag`, `age`, `extraversion`, `independ`, `selfcontrol`, `anxiety`, `novator`) se estandarizan con el `StandardScaler` guardado junto al modelo.

El conjunto de datos de partida es el Employee Turnover Dataset de Kaggle (autor: Davin Wijaya), con 1.116 filas únicas tras eliminar duplicados. La partición reserva 224 registros para test. Los hiperparámetros se ajustaron con GridSearchCV; la model card no detalla la rejilla explorada ni los valores finales seleccionados (número de estimadores, `max_depth`, `min_samples_split`, etc.). No se documenta uso de validación cruzada más allá del proceso de búsqueda, ni técnicas de calibración de probabilidades, ni ponderación de clases pese al desbalance inherente a un problema de rotación (112 positivos frente a 112 negativos en el conjunto de test, según la matriz de confusión descrita).

## Capacidades

- Clasificación binaria tabular: devuelve etiqueta (`0` = permanece, `1` = abandona) y probabilidad asociada mediante `predict_proba`.
- Predicción sobre registros individuales o lotes, siempre que el DataFrame de entrada respete el orden de `feature_names` y contenga las 50 columnas esperadas.
- Integración directa con el ecosistema Python/scikit-learn: `joblib.load` y llamadas estándar a `predict` y `predict_proba`.
- Preprocesado empaquetado: el `scaler` y la lista de columnas se distribuyen como artefactos separados, lo que permite replicar la transformación exacta usada en entrenamiento.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni generación de texto.
- Cobertura lingüística limitada al indonesio en la documentación; las variables y etiquetas están en inglés.

## Casos de uso

- Priorización de entrevistas de retención: aplicar el modelo a la plantilla activa para ordenar empleados por probabilidad de salida y concentrar el esfuerzo del equipo de RR. HH. en el decil superior de riesgo.
- Simulación de escenarios de política retributiva: modificar variables como `greywage` (transparencia salarial) o `traffic` (canal de reclutamiento) en registros sintéticos y observar el desplazamiento de la probabilidad predicha, siempre como análisis de sensibilidad y no causal.
- Segmentación de cohortes de riesgo por área: agrupar las probabilidades por `industry`, `profession` o `head_gender` para detectar departamentos con concentración anómala de riesgo y orientar auditorías internas.
- Docencia y reproducción de pipelines: sirve como ejemplo completo de limpieza, One-Hot Encoding, escalado, GridSearchCV y evaluación con matriz de confusión en un curso de ciencia de datos aplicada a negocio.
- Prototipado de un sistema de alertas tempranas: integrar el artefacto en un script programado que consuma exportaciones periódicas del HRIS y genere un listado semanal de empleados por encima de un umbral de probabilidad configurable.
- Benchmark interno de referencia: usar sus métricas (accuracy 70,54 %, F1 70,00 %, ROC-AUC 79,10 %) como línea base contra la que comparar modelos posteriores (gradient boosting, regresión logística regularizada) sobre el mismo dataset.

## Benchmarks y rendimiento

Resultados publicados en la model card sobre el conjunto de test de 224 registros:

| Metrica | Baseline (sin tuning) | Optimizado (GridSearchCV) |
|---|---|---|
| Accuracy | 67,86 % | 70,54 % |
| F1-Score | 66,36 % | 70,00 % |
| Recall | 63,39 % | 68,75 % |
| Precision | 69,61 % | 71,30 % |
| ROC-AUC | 77,99 % | 79,10 % |

En la matriz de confusión del modelo final, de 112 empleados que realmente abandonaron se detectaron correctamente 77 (35 falsos negativos). No se han publicado comparaciones con otros algoritmos sobre el mismo conjunto de test en la información disponible.

## Requisitos de hardware

- Inferencia en CPU: el artefacto es un Random Forest serializado en `joblib`; no requiere GPU en ningún escenario.
- VRAM estimada: 0 GB. El consumo es de RAM del proceso Python, del orden de decenas o pocos cientos de MB en función del número de árboles (no publicado).
- GPU recomendadas: ninguna. Cualquier CPU moderna x86-64 o ARM es suficiente para lotes de miles de registros.
- Cabe en cualquier equipo de consumo, incluidos portátiles de gama baja y entornos serverless con 512 MB de memoria.
- Opciones de despliegue: script Python con `joblib` + `pandas` + `scikit-learn` (>= 1.6.1), API REST con FastAPI o Flask, o tareas batch programadas. No es compatible con vLLM, llama.cpp, Ollama ni TGI, que están orientados a modelos de lenguaje.
- Latencia y throughput: no publicados. Por la naturaleza del algoritmo, la inferencia sobre lotes pequeños es del orden de milisegundos en CPU.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| employee-turnover-randomforest | Random Forest tabular | no disponible | no aplica | MIT | Hugging Face, `joblib` |
| XGBoost / LightGBM (entrenados sobre el mismo dataset) | Gradient boosting tabular | no disponible | no aplica | Apache 2.0 (librería) | Requiere entrenamiento propio |
| Regresión logística (baseline sobre el mismo dataset) | Modelo lineal tabular | no disponible | no aplica | scikit-learn BSD-3 | Requiere entrenamiento propio |

No se dispone de métricas publicadas de alternativas evaluadas sobre el mismo conjunto de test, por lo que la comparación cuantitativa de rendimiento no está disponible.

## Limitaciones y advertencias

- Población restringida: entrenado sobre 1.116 registros con características demográficas y psicológicas específicas de un contexto concreto; no generaliza a industrias o mercados laborales no representados en el dataset.
- Recall del 68,75 %: aproximadamente el 31,25 % de los empleados que realmente se marchan no se detectan (falsos negativos), lo que limita su uso como único filtro de decisión.
- Correlación, no causalidad: variables como `anxiety`, `independ` o `selfcontrol` reflejan asociaciones estadísticas; el modelo no estima efectos causales de intervenciones de retención.
- Ausencia de variables dinámicas: no incorpora subidas salariales reales, encuestas de satisfacción periódicas ni horas extra mensuales, factores habitualmente decisivos en la rotación.
- Riesgo de alucinación: no aplica en sentido estricto (no genera texto), pero sí puede producir predicciones sobreconfiadas fuera del dominio de entrenamiento.
- Sesgos potenciales: al incluir `gender` y `head_gender` como predictores, el modelo puede amplificar sesgos de género presentes en los datos originales; su uso en decisiones laborales exige auditoría de equidad previa.
- Licencia MIT: permite uso comercial y modificación con atribución, pero el dataset de origen (Kaggle) puede tener condiciones propias que deben verificarse antes de un uso productivo.
- Mantenimiento nulo: repositorio sin descargas ni actualizaciones posteriores a noviembre de 2026, sin issues ni soporte del autor.
- Dependencia de versión: exige scikit-learn >= 1.6.1; cargar el `joblib` con versiones anteriores puede fallar o producir resultados inconsistentes.

## Enlaces

- Hugging Face: https://huggingface.co/Joluga788899/employee-turnover-randomforest
- Dataset de origen (Kaggle, Davin Wijaya): https://www.kaggle.com/datasets/davinwijaya/employee-turnover
- Documentación de scikit-learn: https://scikit-learn.org/stable/
- Documentación de joblib: https://joblib.readthedocs.io/
