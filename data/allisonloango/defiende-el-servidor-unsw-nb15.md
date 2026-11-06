# allisonloango/defiende-el-servidor-unsw-nb15

## Resumen

`defiende-el-servidor-unsw-nb15` es un clasificador binario de conexiones de red entrenado sobre el dataset UNSW-NB15, que distingue entre tráfico normal (clase 0) y tráfico de ataque (clase 1). Lo publica Allison Loango como proyecto académico del curso MLOps 2026-II de la Universidad Externado de Colombia, dentro del taller "Defiende el servidor". No es un modelo de lenguaje ni una red neuronal: es un `Pipeline` de scikit-learn que combina preprocesamiento tabular con un `HistGradientBoostingClassifier` y un umbral de decisión calibrado.

La revisión v2 está pensada para un equipo de seguridad con un presupuesto estricto de falsas alarmas: maximiza la detección de ataques manteniendo la tasa de falsos positivos por debajo del 5 % en validación. El umbral de decisión se fija en 0,66, lo que en validación produce un recall de ataque de 0,9532 y una precisión de 0,9769. La evaluación posterior sobre el conjunto de test completo (82.332 filas) arroja un recall de 0,9681, una precisión de 0,8712 y un FPR de 0,1754, muy superior al de validación.

El interés del artefacto es fundamentalmente metodológico y de trazabilidad: incluye hashes SHA-256 del modelo y de los datos, verificación del artefacto antes de cargarlo, split agrupado para evitar fuga de información por duplicados y una comparación explícita entre la versión v1 y la v2. El propio autor advierte que no es un IDS para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pipeline de scikit-learn: preprocesamiento (ordinal para categóricas, sin escalado para numéricas) + `HistGradientBoostingClassifier` (gradient boosting sobre histogramas) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo tabular; 42 variables de entrada por muestra) |
| Tipos de cuantizacion | no aplica (artefacto `joblib`/pickle, sin cuantización) |
| Idiomas soportados | es (documentación y model card) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | `model.joblib` (pickle de scikit-learn), con SHA-256 `23c42b34e7729858b5a809fc7dde153d2ca108179db7ad3d745297ddca125671` |

## Arquitectura y entrenamiento

El modelo es un `Pipeline` completo de scikit-learn que encapsula el preprocesamiento y el clasificador. Las 42 variables predictoras se dividen en 3 categóricas (`proto`, `service`, `state`), codificadas de forma ordinal, y 39 numéricas, que no reciben transformación (`ninguno`). Se excluyen `id` (identificador), `label` (la etiqueta) y `attack_cat` (que revela la respuesta). El clasificador es un `HistGradientBoostingClassifier`, un gradient boosting que discretiza las variables numéricas en histogramas para acelerar el entrenamiento y reducir memoria.

Los datos provienen de UNSW-NB15 (Moustafa & Slay, 2015), con las particiones publicadas `UNSW_NB15_training-set.csv` (175.341 filas) y `UNSW_NB15_testing-set.csv` (82.332 filas). Entrenamiento y validación se extraen únicamente del archivo de entrenamiento mediante `StratifiedGroupKFold` con semilla 42, agrupando filas con entradas idénticas para que un mismo grupo no se reparta entre ambas particiones: 140.274 filas para entrenamiento y 35.067 para validación. El archivo de test no participó ni en el entrenamiento ni en la elección del modelo o del umbral. El umbral 0,66 se seleccionó en validación bajo la restricción de FPR ≤ 5 %.

## Capacidades

- Clasificación binaria de conexiones de red: 0 = normal, 1 = ataque.
- Puntuación de ataque continua (`score_attack`) además de la etiqueta discreta, lo que permite reevaluar el umbral sin reentrenar.
- Manejo nativo de variables tabulares mixtas (categóricas y numéricas) mediante el pipeline integrado.
- Predicción autocontenida con verificación de integridad: `predict.py` comprueba el SHA-256 del artefacto antes de cargarlo.
- Salida por fila con `row_id`, `score_attack` y `y_pred`.
- No soporta tool calling, agentes, razonamiento multi-paso, visión, audio ni generación de texto: es un clasificador tabular.

## Casos de uso

- Triaje de alertas en un SOC: el modelo puntúa conexiones y permite priorizar las que superan el umbral 0,66, reduciendo el volumen de alertas que llega a un analista humano. Es adecuado porque su precisión en validación (0,9769) limita el ruido, aunque el FPR en test (0,1754) obliga a validar antes en la red objetivo.
- Ejercicios académicos de MLOps: sirve como ejemplo completo de versionado, hashes, splits agrupados, calibración de umbral y evaluación final única sobre test, replicable en un curso.
- Prototipado de detección de intrusiones: permite montar un baseline rápido en Python con scikit-learn antes de invertir en un IDS comercial o en modelos más complejos.
- Evaluación comparativa de pipelines de preprocesamiento: al fijar el clasificador y variar el tratamiento de categóricas, se puede medir el impacto del preprocesamiento en la detección.
- Análisis de compromiso entre recall y falsos positivos: el par v1/v2 documenta el efecto de mover el umbral de 0,50 a 0,66 (FPR de 0,1755 a 0,0480, recall de 0,9876 a 0,9532), útil para justificar decisiones de política de alertas.
- Docencia sobre fuga de datos: el uso de `StratifiedGroupKFold` con agrupación por entradas idénticas ilustra cómo evitar que duplicados inflen las métricas.

## Benchmarks y rendimiento

Métricas de validación (ataque = positivo, umbral 0,66):

| Métrica | Valor |
|---|---|
| Recall de ataque | 0,9532 |
| Precision de ataque | 0,9769 |
| Tasa de falsos positivos (FPR) | 0,0480 |
| Macro-F1 | 0,9464 |
| Accuracy | 0,9528 |

Matriz de confusión en validación: TN 10.662, FP 538, FN 1.117, TP 22.750.

Comparación v1 frente a v2 en validación:

| Métrica | v1 (umbral 0,50) | v2 (umbral 0,66) | Cambio |
|---|---|---|---|
| Recall de ataque | 0,9876 | 0,9532 | -3,4 pp |
| Precision de ataque | 0,9230 | 0,9769 | +5,4 pp |
| FPR | 0,1755 | 0,0480 | -12,8 pp |
| Macro-F1 | 0,9225 | 0,9464 | +2,4 pp |
| Falsos positivos | 1.966 | 538 | -1.428 |
| Ataques no detectados (FN) | 296 | 1.117 | +821 |

Evaluación final en test (82.332 filas, una sola vez):

| Métrica | Test |
|---|---|
| Recall de ataque | 0,9681 |
| Precision de ataque | 0,8712 |
| FPR | 0,1754 |
| Macro-F1 | 0,9010 |

Matriz de confusión en test: TN 30.510, FP 6.490, FN 1.447, TP 43.885.

## Requisitos de hardware

- VRAM: no aplica; la inferencia es en CPU.
- GPU: no necesaria. El modelo cabe en memoria principal sin dificultad (repositorio de 0,0 GB según Hugging Face).
- CPU: cualquier máquina capaz de ejecutar scikit-learn; el coste dominante es la carga del `joblib` y el preprocesamiento de las 42 variables por fila.
- Despliegue: Python con `scikit-learn` y `huggingface_hub`; `snapshot_download` para obtener el artefacto y `predict.py` para la inferencia con verificación de hash. No hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI, que no aplican a modelos tabulares.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

No se han publicado comparaciones con otros modelos en la información disponible. Como referencia contextual, el propio autor compara esta versión con su v1 (mismo algoritmo, umbral 0,50), cuyos resultados figuran en la sección de benchmarks.

| Modelo | Algoritmo | Umbral | Recall (val.) | Precision (val.) | FPR (val.) | Licencia |
|---|---|---|---|---|---|---|
| defiende-el-servidor v2 | HistGradientBoosting | 0,66 | 0,9532 | 0,9769 | 0,0480 | CC-BY-4.0 |
| defiende-el-servidor v1 | HistGradientBoosting | 0,50 | 0,9876 | 0,9230 | 0,1755 | CC-BY-4.0 |
| Alternativas externas | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- No es un IDS para producción: el dataset es histórico (2015) y de laboratorio (tráfico sintético de UNSW Canberra), y no demuestra eficacia sobre una red actual.
- Deriva entre validación y test: el FPR pasa de 0,0480 a 0,1754 y la precisión cae de 0,9769 a 0,8712. El umbral calibrado en validación no conserva el presupuesto de falsas alarmas en test, y el autor lo reporta sin reajustar.
- Diferencia de distribución: el 68 % de las filas de entrenamiento son ataques frente al 55 % en test.
- Duplicados: el 42 % de las filas de entrenamiento repiten entradas; el split agrupado evita la fuga, pero las métricas dependen de esa estructura.
- Ruido irreducible: 229 grupos de entradas idénticas tienen etiquetas contradictorias (940 filas).
- Optimismo del umbral: al elegirse en validación, las métricas al umbral elegido son algo optimistas.
- Riesgo de seguridad al cargar: `joblib` usa pickle, por lo que solo deben cargarse artefactos cuyo SHA-256 coincida con el publicado.
- Sesgos: no documentados explícitamente en la información disponible; al tratarse de tráfico de laboratorio, la generalización a redes reales con protocolos y servicios distintos no está garantizada.
- Licencia CC-BY-4.0: permite uso comercial con atribución, pero el propio autor desaconseja el uso como IDS en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/allisonloango/defiende-el-servidor-unsw-nb15
- Repositorio de código: https://github.com/allisonloangorayo-sudo/defiende-el-servidor
- Dataset UNSW-NB15: https://research.unsw.edu.au/projects/unsw-nb15-dataset
