# Isxcesp/defiende-servidor-unsw-nb15

## Resumen

Defiende el servidor v2 es un clasificador binario de conexiones de red entrenado sobre el conjunto de datos UNSW-NB15, cuyo objetivo es distinguir entre tráfico normal (clase 0) y tráfico de ataque (clase 1). Lo desarrolla el usuario Isxcesp en el marco de un curso académico de MLOps de la Universidad Externado de Colombia (2026-II), y su propósito declarado es practicar el versionado trazable de código, datos, experimentos y modelos, no construir un sistema de detección de intrusiones listo para producción.

Técnicamente no es un modelo de lenguaje ni una red neuronal: es un `sklearn.pipeline.Pipeline` que encadena imputación, escalado, codificación one-hot de las variables categóricas `proto`, `service` y `state`, y un clasificador `HistGradientBoostingClassifier`. El artefacto se distribuye como `model.joblib` junto con un `config.json` que fija el umbral de decisión (0,65) y el SHA-256 del modelo, y un `requirements.txt` con las versiones exactas de las dependencias.

Su interés actual es fundamentalmente metodológico: documenta con rigor la trazabilidad (commit Git, hash DVC de los datos, run ID de MLflow), reporta métricas de validación y de test oficial, y expone sin maquillar la degradación de rendimiento entre ambos conjuntos (el FPR pasa de 0,049 en validación a 0,181 en test). Es un ejemplo útil de buenas prácticas de reproducibilidad y de honestidad en el reporte de resultados, más que una herramienta operativa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pipeline de scikit-learn: imputación + escalado + one-hot (`proto`/`service`/`state`) + `HistGradientBoostingClassifier` (gradient boosting sobre histogramas, árboles de decisión) |
| Parametros totales | no disponible (el autor no publica número de árboles, profundidad ni número de parámetros) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (clasificación tabular, una fila por conexión) |
| Tipos de cuantizacion | no disponible; el artefacto se sirve como `model.joblib` (pickle de scikit-learn) sin variantes cuantizadas |
| Idiomas soportados | no disponible (no procesa texto; las variables categóricas son valores de protocolo, servicio y estado de conexión) |
| Licencia | other (el autor indica uso académico por la licencia de los datos UNSW-NB15) |
| Formato de pesos | `model.joblib` (pickle de scikit-learn); `config.json` y `requirements.txt` como artefactos auxiliares |

## Arquitectura y entrenamiento

El modelo es un `Pipeline` de scikit-learn que transforma cada registro tabular de UNSW-NB15 y lo pasa a un `HistGradientBoostingClassifier`, un gradient boosting que discretiza las variables continuas en histogramas para acelerar el entrenamiento y reducir memoria. El pipeline incluye imputación de valores ausentes, escalado de numéricas y codificación one-hot de `proto`, `service` y `state`. Las variables `id`, `attack_cat` y `label` se excluyen del conjunto de entrada; `id` se descarta explícitamente porque su orden filtra la clase.

Los datos proceden de la partición oficial de entrenamiento de UNSW-NB15 (175.341 filas). El autor separa validación con `StratifiedGroupKFold` (semilla 42) agrupando entradas idénticas, de modo que los grupos duplicados no se reparten entre train (139.520 filas) y validación (34.881 filas); se excluyen 940 filas de grupos con etiquetas contradictorias. La versión v2 sustituye la regresión logística de v1 por HistGradientBoosting, y el umbral de 0,65 se elige en validación maximizando el recall de ataque con la restricción FPR ≤ 0,05. No se documenta uso de RLHF, DPO ni técnicas de calibración de probabilidades.

## Capacidades

- Clasificación binaria de conexiones de red: devuelve `score_attack` y la etiqueta derivada (`ataque si score_attack >= 0,65`).
- Procesamiento de registros tabulares con variables numéricas y categóricas (`proto`, `service`, `state`) mediante pipeline integrado.
- Inferencia por lotes sobre un CSV de conexiones mediante `model.predict_proba(X)[:, 1]`.
- Integración en flujos MLOps: artefacto versionado con SHA-256, configuración externa del umbral y dependencias fijadas.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni generación de texto.
- No tiene capacidades multimodales (visión, audio) ni modo de razonamiento explícito.
- No distingue la familia del ataque: solo normal frente a ataque.

## Casos de uso

- Docencia y prácticas de MLOps: el modelo sirve como artefacto de referencia para ejercitar versionado de datos (DVC), experimentos (MLflow), empaquetado (joblib) y despliegue reproducible con revisiones fijadas por SHA.
- Reproducción de experimentos académicos: permite replicar el pipeline completo a partir del commit Git y del hash de datos documentados, útil para asignaturas de ciencia de datos e ingeniería de ML.
- Evaluación de pipelines de preprocesado tabular: al incluir imputación, escalado y one-hot en un único objeto serializado, sirve para comparar estrategias de preprocesado sin reentrenar.
- Análisis de desviación entre validación y test: el caso documentado (FPR de 0,049 a 0,181) es un ejemplo real para estudiar cómo el umbral elegido en validación no se transfiere a distribuciones distintas.
- Prototipado de detección de anomalías en redes de laboratorio: con datos de tráfico generados en entorno controlado (IXIA PerfectStorm), puede usarse como primera aproximación didáctica a la clasificación de intrusiones.
- Integración en pipelines de CI/CD como prueba de humo: el `config.json` con umbral y SHA-256 permite verificar que el artefacto cargado es el esperado antes de ejecutar inferencia.
- Auditoría de sesgo de duplicados: la separación por grupos con `StratifiedGroupKFold` documentada sirve para estudiar el impacto de duplicados (42 % de las filas de entrenamiento) en la estimación de métricas.

## Benchmarks y rendimiento

Resultados reportados por el autor sobre validación (34.881 filas) y test oficial completo (82.332 filas, SHA-256 `734fe6642edf758f7c94d7d9149426b49d202fe8e7bf0bef47392489c3c0a559`), con ataque como clase positiva y umbral 0,65:

| Conjunto | Recall ataque | Precision ataque | FPR | Macro-F1 | Accuracy |
|---|---|---|---|---|---|
| Validación (v2) | 0,9522 | 0,9763 | 0,0495 | 0,9451 | 0,9517 |
| Validación (v1, regresión logística) | 0,9887 | 0,9228 | 0,1768 | 0,9229 | 0,9360 |
| Test oficial | 0,9684 | 0,8674 | 0,1814 | 0,8983 | no disponible |
| Test, entradas vistas en train/val (8.313 filas) | 0,9982 | 0,9652 | 0,2032 | 0,9316 | no disponible |
| Test, entradas nuevas (74.019 filas) | 0,9629 | 0,8509 | 0,1806 | 0,8925 | no disponible |

Matriz de confusión en test: TN 30.288 · FP 6.712 · FN 1.432 · TP 43.900. El autor señala explícitamente que el FPR sube de 0,049 en validación a 0,181 en test porque el conjunto de test oficial tiene otra proporción de clases y otra distribución de tráfico normal, y conserva el resultado sin reajustar el umbral. No se han publicado comparaciones con otros modelos en la información disponible.

## Requisitos de hardware

- El artefacto ocupa 0,0 GB según el tamaño del repositorio; el modelo es un pipeline de gradient boosting sobre datos tabulares, por lo que la inferencia cabe en CPU sin GPU.
- No requiere VRAM dedicada: no hay pesos en coma flotante de gran tamaño ni atención por hardware.
- GPU recomendadas: no aplica; no se documenta ningún requisito de aceleración.
- Cabe en cualquier equipo consumer: el cuello de botella es la memoria para cargar el `joblib` y el dataframe de entrada, no el modelo.
- Opciones de despliegue: carga directa con `joblib.load` y scikit-learn; el autor documenta también `python -m src.predict` desde el repositorio de código. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Datos | Recall ataque | FPR | Macro-F1 | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|---|
| Defiende el servidor v2 | HistGradientBoosting (sklearn) | UNSW-NB15 | 0,9522 (val) / 0,9684 (test) | 0,0495 (val) / 0,1814 (test) | 0,9451 (val) / 0,8983 (test) | other (académica) | HuggingFace |
| Defiende el servidor v1 | Regresión logística (sklearn) | UNSW-NB15 | 0,9887 (val) | 0,1768 (val) | 0,9229 (val) | other (académica) | HuggingFace (revisión anterior) |
| Alternativas de la misma categoría (otros IDS sobre UNSW-NB15) | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

La única comparación disponible en la información proporcionada es interna, entre v1 y v2 del propio autor. No hay datos publicados para contrastar con otros clasificadores de UNSW-NB15.

## Limitaciones y advertencias

- El tráfico de UNSW-NB15 se generó en laboratorio con IXIA PerfectStorm en 2015; el autor advierte que no demuestra eficacia en una red actual.
- Alta proporción de duplicados: el 42 % de las filas de entrenamiento son duplicados, y el test oficial comparte entradas con train/val en aproximadamente el 10 % de sus filas, lo que infla las métricas sobre esas filas vistas.
- Clasificación binaria únicamente: no distingue la familia del ataque (`attack_cat` se excluye como respuesta).
- Probabilidades no calibradas; el umbral de 0,65 se eligió sobre la distribución de validación y no se transfiere al test (FPR de 0,049 a 0,181).
- El autor declara explícitamente que no es un IDS para producción.
- La licencia es "other" por la licencia de uso académico de los datos UNSW-NB15; conviene verificar las condiciones antes de cualquier uso comercial.
- `joblib.load` ejecuta pickle: el propio autor recomienda cargar solo revisiones cuyo SHA se conozca.
- Riesgo de sesgo por la composición del dataset de 2015 y por la sobrerrepresentación de ciertos tipos de tráfico de laboratorio.
- No hay información sobre sesgos demográficos ni sobre comportamiento en idiomas, al no procesar texto.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Isxcesp/defiende-servidor-unsw-nb15
- Repositorio de código (commit de entrenamiento): https://github.com/isaiasexternado-a11y/defiende-servidor-unsw-nb15/tree/3fd054d7be2c6130d5f9696d859652b24889e647
- Referencia del dataset: Moustafa, N., & Slay, J. (2015). UNSW-NB15: a comprehensive data set for network intrusion detection systems. MilCIS 2015.
