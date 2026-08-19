# dimsmauls/code4ml-sq-filtered

## Resumen

`dimsmauls/code4ml-sq-filtered` es un dataset, no un modelo de lenguaje. Se trata de una versión derivada y enriquecida del corpus **Code4ML** (Zenodo 7312803), que contiene 2,6 millones de fragmentos de código Python extraídos de cuadernos de Kaggle. Cada fragmento ha sido analizado con el analizador estático **SonarQube** para obtener métricas de calidad de código, siendo la etiqueta principal el `maintainability_rating` (A–E). El dataset incluye además métricas de soporte como code smells, complejidad ciclomática, bugs y deuda técnica.

La relevancia de este recurso radica en que permite entrenar y evaluar modelos de clasificación o generación de código con información estructurada sobre la mantenibilidad del código, algo poco común en datasets públicos. Al estar anotado con métricas estáticas, posibilita tareas como predicción de calidad de código, análisis de mantenibilidad o filtrado de código de alta calidad para entrenar modelos de generación. El dataset está licenciado bajo CC-BY-4.0, con el código subyacente bajo Apache-2.0 (atribución preservada en NOTICE.txt).

## Especificaciones técnicas

Dado que no es un modelo, las especificaciones se refieren al dataset:

| Parámetro | Valor |
|---|---|
| Tipo de recurso | Dataset (no modelo) |
| Formato | CSV único (~986 MB) |
| Número de registros | 2,599,355 (99.89% con rating no vacío) |
| Columnas | 12 (índice, kernel_id, code_block_id, code_block, sqale_rating, maintainability_rating, code_smells, complexity, cognitive_complexity, bugs, sqale_index, ncloc) |
| Idioma del código | Python |
| Fuente | Code4ML (Zenodo 7312803) |
| Licencia del dataset | CC-BY-4.0 |
| Licencia del código subyacente | Apache-2.0 (ver NOTICE.txt) |
| Tamaño del repositorio | 1.0 GB |

## Arquitectura y entrenamiento

No aplica arquitectura de modelo. El dataset se construyó mediante un pipeline de cuatro pasos: (1) división del CSV original de `code_blocks.csv` en 12 shards balanceados usando un splitter CSV en Rust; (2) análisis de cada fragmento con SonarQube a través de un wrapper FastAPI y `sonar-scanner`; (3) unión de los ratings resultantes con cada shard mediante LEFT JOIN sobre `code_block_id`; (4) fusión de los 12 shards en un único CSV final. No se aplicaron cambios que afecten al código fuente; solo se eliminaron comentarios redundantes y se aplicaron correcciones PEP8 en algunos casos.

## Capacidades

El dataset permite:

- Entrenar modelos de clasificación de calidad de código (etiqueta A–E).
- Entrenar modelos de regresión para predecir métricas numéricas (complejidad, code smells, deuda técnica).
- Filtrar código de alta calidad para entrenar modelos de generación de código (por ejemplo, mantener solo fragmentos con rating A–C).
- Analizar la relación entre métricas estáticas y el rendimiento de modelos de ML.
- Construir pipelines de evaluación de mantenibilidad de código en entornos de desarrollo.
- Servir como corpus de referencia para estudios de ingeniería de software basados en datos.

## Casos de uso

- **Entrenamiento de clasificadores de calidad de código**: se puede usar el dataset para entrenar un modelo que asigne automáticamente una calificación de mantenibilidad (A–E) a fragmentos de código Python, útil en herramientas de revisión de código.
- **Filtrado de código para generación**: al mantener solo fragmentos con rating A–C, se puede construir un corpus de entrenamiento de alta calidad para modelos de generación de código, reduciendo el ruido y mejorando la mantenibilidad del código generado.
- **Predicción de deuda técnica**: las columnas `sqale_index` y `complexity` permiten entrenar modelos de regresión para estimar el esfuerzo de mantenimiento necesario en un proyecto.
- **Análisis de correlación entre métricas estáticas**: investigadores pueden estudiar cómo se relacionan la complejidad ciclomática, cognitive complexity y los code smells con la mantenibilidad percibida.
- **Evaluación de herramientas de análisis estático**: el dataset puede servir como ground truth para comparar la precisión de diferentes analizadores estáticos frente a SonarQube.
- **Generación de datos sintéticos para benchmarks**: las anotaciones permiten crear subconjuntos etiquetados para tareas de clasificación o regresión en el ámbito de la ingeniería de software.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. Al ser un dataset, no hay métricas de rendimiento de modelo asociadas.

## Requisitos de hardware

No aplica para inferencia de modelos. Para procesar el dataset se recomienda:

- Almacenamiento: al menos 2 GB libres para el CSV y posibles transformaciones.
- Memoria RAM: 8 GB o más para cargar el CSV completo en pandas (el archivo de ~986 MB puede requerir ~2-3 GB en memoria).
- CPU: suficiente para operaciones de filtrado o agrupación; no se requiere GPU.
- Herramientas de procesamiento: Python con `datasets` o `pandas`; también se puede usar `duckdb` para consultas SQL sobre el CSV.

## Comparativa con modelos similares

No aplica comparación con modelos. Como dataset, se puede comparar con otros corpus de código:

| Dataset | Origen | Tamaño | Anotaciones | Licencia |
|---|---|---|---|---|
| Code4ML (original) | Kaggle notebooks | ~2.5M snippets | Anotaciones manuales parciales | Apache-2.0 |
| Code4ML 2.0 | Kaggle notebooks | ~2.5M snippets (enriquecido) | No especificado | No especificado |
| code4ml-sq-filtered (este) | Code4ML original | ~2.6M snippets | Métricas SonarQube (A–E, smells, bugs, etc.) | CC-BY-4.0 (código Apache-2.0) |

La principal diferencia es que este dataset añade anotaciones automáticas de calidad estática, lo que no está disponible en el corpus original.

## Limitaciones y advertencias

- Solo contiene código Python, no cubre otros lenguajes.
- Los fragmentos provienen exclusivamente de cuadernos de Kaggle, lo que puede introducir sesgos en el estilo de programación y en la calidad media del código.
- Las anotaciones de SonarQube son automáticas y pueden contener errores o no reflejar la calidad percibida por humanos.
- El ~0.11% de registros sin rating son fragmentos que SonarQube no pudo analizar (vacíos o no parseables).
- La licencia CC-BY-4.0 del dataset exige atribución; el código subyacente está bajo Apache-2.0, por lo que se debe mantener el NOTICE.txt al redistribuir.
- No se han realizado validaciones externas de la calidad de las anotaciones.

## Enlaces

- [Dataset en HuggingFace](https://huggingface.co/dimsmauls/code4ml-sq-filtered)
- [Code4ML original en Zenodo](https://zenodo.org/records/7312803)
- [Code4ML 2.0 en Zenodo](https://zenodo.org/records/15465737)
- [Paper Code4ML (arXiv)](https://arxiv.org/abs/2210.16018)
- [PDF del paper](https://arxiv.org/pdf/2210.16018.pdf)
- [Repositorio de reimplementación (GitHub)](https://github.com/AAAlsulami/Reimplementation-of-Paper-Name-Code4ML-a-Large-Scale-Dataset-of-Annotated-Machine-Learning-Code-)
