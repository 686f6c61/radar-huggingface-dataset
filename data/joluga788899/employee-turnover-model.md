# Joluga788899/employee-turnover-model

## Resumen

El modelo `employee-turnover-model` es un clasificador binario tabular desarrollado por el usuario Joluga788899 y publicado en Hugging Face. Su objetivo es predecir la probabilidad de que un empleado abandone la empresa (turnover) a partir de 15 variables predictoras de tipo demográfico, laboral y psicológico. No es un modelo de lenguaje ni una red neuronal: se trata de un `RandomForestClassifier` de scikit-learn serializado con joblib, entrenado sobre un conjunto de datos público de Kaggle.

El modelo resuelve un problema acotado de recursos humanos: identificar de forma proactiva empleados con riesgo de renuncia para que el departamento de RR. HH. pueda diseñar programas de retención antes de que se produzca la baja. Se entrenó sobre 1.116 registros únicos tras eliminar duplicados, con 15 características originales que, tras aplicar One-Hot Encoding, se expanden a 50 dimensiones. El pipeline incluye un `StandardScaler` para las variables numéricas y un modelo de bosque aleatorio optimizado mediante `GridSearchCV`.

La relevancia de esta ficha es limitada en el contexto de modelos fundacionales: no hay pesos neuronales, ni contexto, ni capacidades generativas. Se trata de un artefacto de ML clásico orientado a producción interna, con licencia MIT, y su interés radica en servir como ejemplo reproducible de pipeline tabular completo (preprocesado, entrenamiento, tuning y serialización) para casos de clasificación binaria con datos estructurados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Random Forest (`RandomForestClassifier` de scikit-learn) |
| Parametros totales | no disponible (hiperparametros: `n_estimators=100`, `max_depth=20`, `min_samples_leaf=1`, `class_weight='balanced'`) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo tabular, sin contexto secuencial) |
| Tipos de cuantizacion | no disponible (no aplica; artefacto joblib) |
| Idiomas soportados | en (etiquetas y documentacion en ingles e indonesio) |
| Licencia | MIT |
| Formato de pesos | joblib (`model_saya.joblib`, `scaler.joblib`, `feature_names.joblib`, `metadata.joblib`) |

## Arquitectura y entrenamiento

La arquitectura es un bosque aleatorio (`RandomForestClassifier`) con 100 estimadores, profundidad máxima de 20 y `min_samples_leaf=1`, configurado con `class_weight='balanced'` para compensar el posible desbalanceo de clases. El pipeline completo incluye un `StandardScaler` ajustado sobre las variables numéricas continuas (`stag`, `age`, `extraversion`, `independ`, `selfcontrol`, `anxiety`, `novator`) y una transformación One-Hot Encoding sobre las 8 variables categóricas (`gender`, `industry`, `profession`, `traffic`, `coach`, `head_gender`, `greywage`, `way`), lo que expande el espacio de entrada de 15 a 50 dimensiones.

El entrenamiento se realizó sobre el dataset público "Employee Turnover" de Kaggle (atribuido a Davin Wijaya y originalmente compartido en el blog de Edward Babushkin), con 1.116 filas tras eliminar duplicados. La partición de evaluación reserva un 20 % de los datos (224 muestras equilibradas) para test. La optimización de hiperparámetros se llevó a cabo con `GridSearchCV`, seleccionando la combinación indicada en la tabla de especificaciones. No se documenta el uso de técnicas de regularización adicionales, validación cruzada repetida ni calibración de probabilidades más allá del propio bosque. El artefacto se serializó con scikit-learn 1.6.1, dato crítico para garantizar la compatibilidad al cargar los ficheros joblib.

## Capacidades

- Clasificación binaria tabular: predice la clase `1` (riesgo de renuncia) o `0` (permanencia) a partir de 50 características tras el preprocesado.
- Estimación de probabilidad de renuncia mediante `predict_proba`, lo que permite priorizar empleados por umbral ajustable.
- Preprocesado integrado: incluye el `StandardScaler` y la lista de nombres de características necesarios para reproducir la inferencia.
- Metadatos embebidos: el fichero `metadata.joblib` expone la versión de scikit-learn y la lista de columnas numéricas.
- Sin capacidades de generación de texto, razonamiento simbólico, visión, audio, tool calling ni agentes.
- Sin soporte multilingüe más allá de las etiquetas de las variables categóricas.
- Sin modo "thinking", sin decodificación especulativa ni mecanismos de atención.

## Casos de uso

- Priorización de entrevistas de retención: el equipo de RR. HH. puede cargar los datos de plantilla, ejecutar `predict_proba` y ordenar a los empleados por probabilidad de renuncia para concentrar las conversaciones de retención en el segmento de mayor riesgo.
- Segmentación de cohortes de riesgo: agrupando las probabilidades en tramos (por ejemplo, <30 %, 30-60 %, >60 %), se pueden diseñar programas de retención diferenciados por nivel de riesgo en lugar de aplicar políticas homogéneas.
- Análisis de factores asociados: aunque el modelo no es causal, la importancia de variables del bosque permite identificar qué características (industria, masa salarial, tipo de salario `greywage`, etc.) concentran la señal predictiva y orientar políticas de RR. HH.
- Simulación de escenarios contrafactuales: variando variables controlables como `coach` (presencia de supervisor) o `way` (transporte) en el DataFrame de entrada, se puede estimar cómo cambia la probabilidad de renuncia y evaluar el impacto potencial de una intervención.
- Integración en dashboards de RR. HH.: el artefacto joblib se puede servir detrás de una API ligera (FastAPI, Flask) y alimentar paneles internos que muestren el riesgo agregado por departamento o industria.
- Validación de pipelines de ML tabular: por su licencia MIT y su simplicidad, sirve como referencia reproducible para equipos que quieran replicar un flujo completo (limpieza, encoding, escalado, tuning y serialización) en problemas de clasificación binaria.
- Prototipado de sistemas de alerta temprana: combinado con datos de encuestas internas, el modelo puede generar alertas periódicas (por ejemplo, mensuales) sobre empleados cuyo perfil se aleja del patrón de permanencia.

## Benchmarks y rendimiento

Resultados reportados por el autor sobre el 20 % de test (224 muestras equilibradas):

| Metrica | Baseline | Optimizado (RF) |
|---|---|---|
| Accuracy | 67,86 % | 70,54 % |
| Precision | 69,61 % | 71,30 % |
| Recall | 63,39 % | 68,75 % |
| F1-score | 66,36 % | 70,00 % |
| ROC-AUC | 0,7799 | 0,7910 |

No se han publicado comparaciones con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada: no aplica; el modelo es un artefacto de scikit-learn que se ejecuta íntegramente en CPU.
- GPU recomendadas: no aplica; no se requiere GPU para inferencia ni para reentrenamiento ligero.
- Cabe en cualquier portátil o servidor modesto: el tamaño del repositorio es de 0,0 GB y el conjunto de entrenamiento tiene 1.116 filas.
- Opciones de despliegue: carga directa con `joblib.load` en Python, servicio HTTP con FastAPI o Flask, o integración en un notebook de análisis. No aplica vLLM, llama.cpp, Ollama ni TGI, que son motores para modelos de lenguaje.
- Latencia y throughput: no disponibles de forma explícita; por la naturaleza del bosque (100 árboles, 50 características) se espera una latencia en el orden de milisegundos por muestra en CPU, aunque el autor no publica mediciones.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la información proporcionada. Se puede señalar, no obstante, que un `RandomForestClassifier` compite habitualmente con alternativas como XGBoost, LightGBM o regresión logística sobre el mismo dataset, pero no se han publicado resultados de esas alternativas en la información disponible.

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| employee-turnover-model | 100 arboles, max_depth=20 | no aplica | F1 70,00 %, ROC-AUC 0,7910 | MIT | Hugging Face |
| Alternativas (XGBoost, LightGBM, regresion logistica) | no disponible | no aplica | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Recall del 68,75 %: aproximadamente un 31,25 % de los empleados que realmente se marchan no son detectados (falsos negativos), lo que limita su uso como único sistema de alerta.
- Validez poblacional restringida: el modelo se entrenó sobre un dataset histórico concreto; puede sufrir *concept drift* en industrias con culturas laborales muy distintas o durante crisis macroeconómicas.
- Asociación, no causalidad: las variables relevantes (industria, rasgos de personalidad, etc.) reflejan correlaciones predictivas, no relaciones causales; las intervenciones de RR. HH. deben acompañarse de criterio humano.
- Dependencia de versión: el artefacto se guardó con scikit-learn 1.6.1; cargarlo con otra versión puede producir errores o advertencias de compatibilidad.
- Riesgo de sesgo: variables como `gender`, `head_gender`, `industry` o `profession` pueden introducir sesgos discriminatorios si el modelo se usa para tomar decisiones laborales; se recomienda auditar la equidad antes de cualquier uso productivo.
- Uso comercial: la licencia MIT permite uso comercial, pero no exime del cumplimiento del RGPD y de la normativa laboral aplicable al tratamiento de datos personales de empleados.
- Idioma: la documentación y las etiquetas están en inglés e indonesio; no hay soporte para otros idiomas en la interfaz del modelo.
- Sin mantenimiento documentado: cero descargas y cero likes en el momento de la consulta, sin evidencia de actualizaciones posteriores a la creación (2026-11-20).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Joluga788899/employee-turnover-model
- Dataset original en Kaggle: https://www.kaggle.com/datasets/davinwijaya/employee-turnover
- Blog de Edward Babushkin (origen del dataset, citado en la model card): no disponible como URL directa en la información proporcionada
- Paper o publicación técnica asociada: no disponible
- Repositorio de código: no disponible
- Demo: no disponible
