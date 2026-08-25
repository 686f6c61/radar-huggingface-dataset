# SeanWang0027/data-dq

## Resumen

`SeanWang0027/data-dq` es un dataset de evaluación y entrenamiento para aprendizaje por refuerzo (RLHF) publicado en Hugging Face por el usuario SeanWang0027. No se trata de un modelo de lenguaje, sino de un archivo de datos que incluye evaluaciones de modelos sobre problemas matemáticos (AIME 2025 y HMMT 2025), trayectorias de interacción en el entorno SciWorld generadas por un modelo de 32B, y datasets auxiliares como DAPO-Math-17k en inglés y RLVE. Su propósito principal es servir como material de referencia para análisis de diagnóstico de modelos en entornos de RL, especialmente para comparar el rendimiento de diferentes configuraciones de entrenamiento (por ejemplo, ROSE frente a DAPO) y para entrenar modelos mediante *supervised fine-tuning* (SFT) a partir de trayectorias de profesores.

El dataset ocupa 1.1 GB y contiene múltiples carpetas con formatos JSONL. Su relevancia actual radica en la creciente necesidad de datos de evaluación y de rollouts para el desarrollo de técnicas de RL (como RLOO, DPO, etc.) en modelos de razonamiento matemático y de agentes. La licencia Apache 2.0 permite su uso comercial y académico sin restricciones de atribución, aunque se recomienda revisar los términos de los datasets originales (como MathArena) que puedan tener licencias propias.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No aplica (dataset de evaluación y entrenamiento) |
| Parametros totales | No aplica (dataset de 1.1 GB) |
| Parametros activos | No aplica |
| Longitud de contexto | No aplica |
| Tipos de cuantizacion | No aplica |
| Idiomas soportados | No disponible (contenido en inglés y chino) |
| Licencia | Apache 2.0 |
| Formato de pesos | JSONL (archivos de datos) |

## Arquitectura y entrenamiento

El dataset no corresponde a un modelo, sino a un conjunto de datos generados durante el proceso de entrenamiento y evaluación de modelos de lenguaje. La estructura principal incluye:

- `evalout/`: contiene 281 carpetas (una por ejecución) con registros de evaluación para cada problema. Cada registro incluye el enunciado, la respuesta correcta, el número de aciertos y las muestras generadas (con el texto completo). Está diseñado para análisis por problema (per-problem) y para comparar la evolución de rendimiento entre versiones del modelo (por ejemplo, Olmo-7B ROSE mejoró en 8 problemas y empeoró en 7).
- `sciworld_sft/`: trayectorias de interacción en el entorno SciWorld generadas por un modelo de 32B (profesor). Los archivos contienen mensajes y máscaras de pérdida (loss_mask) para entrenamiento SFT. Se proporcionan varios niveles de filtrado por score (≥0.5, ≥0.8, =1.0).
- `datasets/`: datasets de evaluación y entrenamiento, como AIME25 (30 problemas), HMMT25 (30 problemas), DAPO-Math-17k en inglés y RLVE train/test.
- `iter_data_keep/`: datos intermedios de la ejecución iterativa de ROSE.

El dataset se generó mediante scripts de evaluación (por ejemplo, `aime_eval.py`, `hmmt_eval.py`) que utilizan `math_verify` para verificar equivalencia simbólica en problemas de HMMT, evitando errores de comparación por tipo de respuesta. No se especifican datos de entrenamiento del modelo original, ya que el dataset es un subproducto de experimentos de RL.

## Capacidades

- Almacena evaluaciones de modelos en problemas de matemáticas de competición (AIME 2025 y HMMT 2025) con respuestas exactas y muestras de generación completas.
- Proporciona trayectorias de agentes en el entorno SciWorld, con anotaciones de score y máscaras de pérdida para entrenamiento supervisado.
- Permite análisis de diagnóstico por problema: identificar problemas donde el modelo mejora o empeora tras un entrenamiento específico (por ejemplo, ROSE vs DPO).
- Incluye datos de entrenamiento de RL (DAPO-Math-17k) y conjuntos de evaluación RLVE (train/test) para reproducibilidad.
- Soporta comparación de modelos mediante los resultados de pass@16, hits, y longitud de generación.
- Permite entrenar modelos de razonamiento mediante SFT a partir de trayectorias de alta calidad (score ≥0.8).

## Casos de uso

- **Análisis de diagnóstico de modelos de RL**: los investigadores pueden usar los registros de `evalout/` para identificar en qué problemas un modelo falla o mejora tras una iteración de RL, y así ajustar los hiperparámetros de entrenamiento.
- **Entrenamiento de modelos de razonamiento matemático**: las trayectorias de SciWorld (score alto) sirven para fine-tuning de modelos de agente que deben interactuar con un entorno científico, mejorando su capacidad de planificación y ejecución de tareas.
- **Evaluación de modelos en matemáticas de competición**: los datasets de AIME25 y HMMT25, con verificación simbólica, permiten evaluar el rendimiento de modelos en problemas difíciles sin errores de formato.
- **Comparación de estrategias de RL (ROSE vs DPO)**: los datos de evaluación por problema permiten analizar qué método de RL produce mejoras más consistentes y cuantificar el impacto de cada estrategia.
- **Desarrollo de agentes de interacción con entornos**: las trayectorias de SciWorld pueden servir para entrenar agentes que deban seguir instrucciones y completar tareas en un mundo simulado, con validación por score.
- **Investigación en RLHF**: los datos de RLVE (train/test) proporcionan un entorno de evaluación estandarizado para medir el rendimiento de políticas de aprendizaje por refuerzo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El dataset no incluye métricas de rendimiento de los modelos evaluados, sino solo los datos crudos de evaluación. Para obtener métricas como exactitud en AIME o HMMT, el usuario debe procesar los archivos JSONL con sus propias herramientas.

## Requisitos de hardware

No aplica, ya que se trata de un dataset, no de un modelo. No obstante, para procesar los archivos (por ejemplo, cargar los JSONL y analizar los resultados) se recomienda:

- Almacenamiento: al menos 1.1 GB de espacio libre en disco.
- Memoria RAM: suficiente para cargar los archivos JSONL más grandes (cada registro de evaluación puede contener cientos de muestras de texto largo, con tamaños de hasta ~25 MB por archivo). Se recomienda un mínimo de 8 GB de RAM.
- CPU: un procesador moderno para ejecutar scripts de análisis y evaluación.
- Para entrenamiento con las trayectorias de SciWorld, se requiere una GPU con suficiente VRAM (por ejemplo, 24 GB para modelos de 7B en fp16), aunque el dataset en sí no tiene requisitos de GPU.

## Comparativa con modelos similares

No disponible. Este dataset no es un modelo, sino un recurso de datos. No se puede comparar directamente con modelos de lenguaje. En el contexto de datasets de evaluación para RL, existen alternativas como el dataset de evaluaciones de OpenRLHF o los datos de RLVR, pero no se dispone de información en la documentación proporcionada para una comparación objetiva.

## Limitaciones y advertencias

- **Contenido parcial**: la documentación indica que algunos archivos de evaluación temprana (específicamente los de los modelos 4B) fueron sobrescritos por sus resúmenes, por lo que no se dispone de los registros detallados de esos casos.
- **Calidad de las trayectorias**: la colección de SciWorld solo logró éxito en 158/3592 intentos bajo condiciones de alta concurrencia (48 procesos, límite de descriptores de archivo), lo que puede sesgar la distribución de los datos.
- **Idiomas**: los datos están principalmente en inglés, aunque los metadatos y scripts están en chino. No hay soporte oficial para otros idiomas.
- **Licencia**: Apache 2.0 permite uso comercial, pero los datasets subyacentes (como MathArena) pueden tener licencias propias que deben ser respetadas.
- **Riesgo de alucinación**: no aplica, ya que no es un modelo, pero los datos de evaluación pueden contener errores de generación que deben ser filtrados antes de usarlos para entrenamiento.
- **Fechas**: el dataset fue creado en 2026-08-25 (fecha futura según el sistema actual), lo que puede indicar un error de fecha o que es un dataset de un futuro próximo. Se recomienda verificar la integridad de los archivos.

## Enlaces

- Dataset en HuggingFace: [SeanWang0027/data-dq](https://huggingface.co/SeanWang0027/data-dq)
- Dataset parcial de SciWorld (solo trayectorias incompletas): [SeanWang0027/sciworld-teacher32b-sft-partial](https://huggingface.co/datasets/SeanWang0027/sciworld-teacher32b-sft-partial)
