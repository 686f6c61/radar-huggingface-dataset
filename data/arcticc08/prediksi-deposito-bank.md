# Arcticc08/prediksi-deposito-bank

## Resumen

`Arcticc08/prediksi-deposito-bank` es un clasificador tabular binario basado en Random Forest, empaquetado con scikit-learn y serializado con joblib. Lo desarrolla Sylwina Arctic Tanamas como trabajo de fin de asignatura (UAS Business Data Science, MN1135) del programa de Management, y resuelve un problema acotado: predecir si un cliente bancario contratará un depósito a plazo tras ser contactado en una campaña de telemarketing. No es un modelo de lenguaje ni una red neuronal: es un pipeline clásico de machine learning supervisado sobre 16 variables tabulares.

Su relevancia es práctica y limitada: sirve como referencia reproducible de un flujo completo (preprocesado con `StandardScaler` y One-Hot Encoding, ajuste de hiperparámetros con GridSearchCV y evaluación con métricas sensibles al desbalanceo) sobre el dataset público Bank Marketing del UCI Machine Learning Repository. Con 45.211 filas y una tasa de positivos del 11,7%, el modelo se orienta a priorizar seguimientos comerciales, no a sustituir la decisión de negocio.

El artefacto pesa 0,0 GB (ficheros joblib de pocos MB), no tiene descargas ni likes en el momento de la consulta y se publicó el 22 de noviembre de 2026. Su utilidad principal es didáctica y como línea base interna para equipos que trabajen con datos de campañas bancarias similares.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Random Forest (ensemble de árboles de decisión) con pipeline de preprocesado scikit-learn |
| Parametros totales | no disponible (no aplica; el modelo se define por hiperparámetros: `n_estimators=100`, `max_depth=None`, `min_samples_leaf=5`, `class_weight='balanced'`) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (entrada tabular fija de 42 columnas tras preprocesado) |
| Tipos de cuantizacion | no disponible (no aplica; serialización joblib) |
| Idiomas soportados | no disponible (no procesa texto libre; las categorías del dataset están en inglés) |
| Licencia | CC BY 4.0 |
| Formato de pesos | joblib (`model_rf_deposito.joblib`, `scaler.joblib`, `feature_names.joblib`, `metadata.joblib`) |

## Arquitectura y entrenamiento

El modelo es un Random Forest de 100 estimadores sin límite de profundidad (`max_depth=None`) y con `min_samples_leaf=5`, configurado con `class_weight='balanced'` para compensar el desbalanceo de clases. Los hiperparámetros se seleccionaron mediante GridSearchCV con validación cruzada de 5 folds y F1 como métrica de scoring. El preprocesado estandariza las variables numéricas con `StandardScaler` y aplica One-Hot Encoding con `drop="first"` a las categóricas, generando 42 columnas de entrada a partir de las 16 originales.

El entrenamiento usa el dataset Bank Marketing (`bank-full.csv`) del UCI Machine Learning Repository: 45.211 filas, 16 features y la variable objetivo `y`. La partición es 80/20 estratificada por la clase objetivo con `random_state=42`, resultando en 36.168 filas de entrenamiento y 9.043 de test. No hay información sobre técnicas de regularización adicionales, calibración de probabilidades ni validación temporal; el autor no documenta ningún proceso de reentrenamiento ni de selección de umbral distinto del 0,5 por defecto.

## Capacidades

- Clasificación binaria tabular: estima la probabilidad de que un cliente contrate un depósito a plazo (`predict_proba`) y asigna etiqueta con umbral 0,5 por defecto.
- Manejo explícito del desbalanceo de clases mediante `class_weight='balanced'`, lo que favorece el recall de la clase positiva.
- Preprocesado integrado: escalado de numéricas y codificación one-hot de categóricas, con artefactos separados (`scaler.joblib`, `feature_names.joblib`, `metadata.joblib`) para reconstruir el vector de entrada.
- Interpretabilidad parcial: al ser un bosque de árboles, permite extraer importancias de features (aunque el autor no las publica en la model card).
- Interfaz de demostración: incluye una app Gradio (`app.py`) para probar predicciones manualmente.
- No soporta tool calling, agentes, razonamiento multi-paso, visión, audio ni generación de texto. No es multilingüe ni procesa lenguaje natural.

## Casos de uso

- Priorización de seguimiento comercial post-llamada: dado un cliente ya contactado, el modelo estima la probabilidad de contratación y permite ordenar la cola de seguimiento. Es adecuado porque `duration` (variable más influyente según el autor) solo se conoce tras el contacto, por lo que el uso previsto es posterior a la primera llamada.
- Segmentación de campañas de telemarketing: aplicar el modelo a la base histórica de contactos para identificar perfiles con alta probabilidad y concentrar el esfuerzo del equipo comercial en ellos.
- Línea base para experimentación interna: sirve como referencia de rendimiento (F1 0,6071 en clase positiva) frente a la que comparar modelos más complejos (XGBoost, LightGBM, redes tabulares) en el mismo dataset.
- Material docente y reproducibilidad: el pipeline completo (preprocesado, GridSearchCV, evaluación) es un ejemplo didáctico de flujo supervisado con datos desbalanceados.
- Análisis de sensibilidad de campañas: variando features como `campaign`, `pdays` o `poutcome` se pueden explorar escenarios hipotéticos de contacto (con las cautelas propias de un modelo correlacional).
- Prototipado rápido en entornos con recursos limitados: al ser un artefacto de pocos MB y dependencias estándar (scikit-learn, pandas, numpy, joblib), se puede desplegar en cualquier servicio con Python sin GPU.
- Integración en un CRM interno como microservicio de scoring: cargando los joblib al arranque y exponiendo un endpoint que reciba el JSON del cliente y devuelva la probabilidad.

## Benchmarks y rendimiento

Resultados publicados por el autor sobre el conjunto de test (9.043 filas):

| Metrica | Valor |
|---|---|
| F1-score (clase yes) | 0,6071 |
| Recall (clase yes) | 0,7958 |
| Precision (clase yes) | 0,4907 |
| Accuracy | 0,8795 |
| ROC AUC | 0,9294 |

No se han publicado comparaciones con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM: no aplica; la inferencia es en CPU y el artefacto ocupa pocos MB.
- GPU: no necesaria. Cualquier CPU moderna es suficiente.
- Cabe en cualquier equipo consumer, incluidos portátiles de gama baja y contenedores con 512 MB de RAM.
- Despliegue: script Python con scikit-learn 1.6.1, pandas, numpy y joblib; opcionalmente la app Gradio incluida (`app.py`). No requiere vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la información proporcionada; por la naturaleza del modelo (Random Forest de 100 árboles sobre 42 features) se espera del orden de milisegundos por predicción en CPU, aunque el autor no publica cifras.

## Comparativa con modelos similares

No se dispone de comparaciones publicadas con otros modelos en la información proporcionada. Como referencia contextual del mismo dataset Bank Marketing, existen múltiples implementaciones públicas (regresión logística, XGBoost, LightGBM) pero no se han incluido datos comparativos verificables en esta ficha.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Arcticc08/prediksi-deposito-bank | Random Forest, 100 árboles | no aplica (tabular) | CC BY 4.0 | Hugging Face |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Fuga de información potencial: `duration` es la feature más influyente según el autor y solo se conoce después de la llamada, por lo que el modelo no es válido para seleccionar clientes antes del primer contacto.
- Precision baja (0,4907): aproximadamente la mitad de los clientes marcados como "yes" no contratarán; el recall del 0,7958 implica que en torno al 20% de positivos reales no se detectan.
- Sesgo geográfico y temporal: los datos provienen de una única entidad bancaria en Portugal entre 2008 y 2010; la generalización a otros países, entidades o periodos no está garantizada.
- Correlación, no causalidad: las importancias y predicciones no implican relaciones causales; no deben usarse para diseñar políticas comerciales sin validación adicional.
- Umbral fijo en 0,5: no se ha optimizado el punto de corte para el coste asimétrico de falsos positivos y falsos negativos, algo crítico en aplicaciones reales.
- Dependencia estricta de versión: el artefacto joblib requiere scikit-learn 1.6.1; otras versiones pueden fallar al deserializar.
- Sin información sobre calibración de probabilidades: los valores de `predict_proba` pueden no estar bien calibrados.
- Licencia CC BY 4.0: permite uso comercial con atribución, pero conviene revisar las condiciones del dataset original del UCI antes de un despliegue productivo.
- Modelo de autoría individual y con fines académicos, sin mantenimiento documentado ni issues abiertos.

## Enlaces

- Hugging Face: https://huggingface.co/Arcticc08/prediksi-deposito-bank
- Dataset original (UCI Machine Learning Repository): https://archive.ics.uci.edu/dataset/222/bank+marketing
- Documentación de scikit-learn: https://scikit-learn.org/stable/
- Documentación de joblib: https://joblib.readthedocs.io/
- Documentación de Gradio: https://www.gradio.app/docs
