# s0nh/byte-level-code-mtp-data

## Resumen

El repositorio `s0nh/byte-level-code-mtp-data` no es un modelo de inferencia, sino un conjunto de artefactos de reproducibilidad para los modelos `s0nh/byte-level-code-mtp-32-*`, que son modelos byte-level con predicción multi-token (MTP, Multi-Token Prediction) de 32 cabezas, transferidos desde `meta-llama/Llama-3.2-3B-Instruct`. El repositorio contiene el código de preprocesamiento, los manifiestos de división de datos, la configuración de entrenamiento y un tokenizer byte-level, pero no redistribuye los archivos fuente originales ni los pesos del modelo. Su propósito es permitir reconstruir exactamente el flujo de datos y entrenamiento a partir del dataset público `jon-tow/starcoderdata-python-edu`.

El problema que resuelve es la reproducibilidad de un pipeline de entrenamiento de modelos byte-level sobre código Python. La relevancia actual radica en la investigación sobre tokenización byte-level y predicción multi-token como alternativas a los tokenizers subword tradicionales. El contexto de empaquetado es de 4096 ids, y el dataset filtrado contiene aproximadamente 18,5 GB de bytes UTF-8 procedentes de 5,3 millones de archivos Python.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Byte-level MTP transferido desde Llama-3.2-3B-Instruct (repositorio de artefactos de reproducibilidad, no incluye pesos) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 4096 ids (ventanas de empaquetado) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | Python (codigo fuente) |
| Licencia | cc-by-4.0 |
| Formato de pesos | no disponible (no contiene pesos; incluye datos de entrenamiento, manifiestos y codigo) |

## Arquitectura y entrenamiento

El repositorio documenta un pipeline de preprocesamiento para entrenar modelos byte-level con MTP de 32 cabezas (H=32), transferidos desde `meta-llama/Llama-3.2-3B-Instruct`. No incluye el modelo entrenado, sino la receta exacta para reconstruir el flujo de datos. El dataset fuente es `jon-tow/starcoderdata-python-edu` en la revisión `67bd30e21b92296da7d2ee05c8f9d8ee16ba0129`, compuesto por 125 archivos parquet. Se aplica un filtro de calidad `int_score >= 3`, que reduce los 12.866.649 archivos originales a 5.319.139, pertenecientes a 1.207.742 repositorios, con un total de 18.540.530.965 bytes UTF-8 crudos (18.454.196.676 después de la limpieza de cabeceras).

La tokenización utiliza el tokenizer byte de `benjamin/Llama3-2-3B-IT-Byte`, donde los ids 0..255 corresponden a bytes individuales y los ids 256..264 a los tokens de plantilla de Llama-3 (`<|begin_of_text|>`=256, `<|eot_id|>`=259 usado como EOS, `<|end_of_text|>`=258 usado como PAD). Cada archivo se transforma en `[BOS] + ids + [EOS]` y se concatenan por shard parquet. Las ventanas se cortan exactamente en 4096 ids; si un corte cae dentro de un carácter multi-byte UTF-8, se retrocede al inicio del carácter y la cola de la ventana se rellena con padding (máximo 3 ids; 296.537 slots de padding en total en train). El orden global de entrenamiento se genera con `numpy.random.default_rng([20260904, 0]).permutation(n_windows)`.

Para la alineación con el teacher subword de Llama-3, se calcula el número de tokens por ventana: media 1016, p99 1480, p99.9 1967, máximo 3080. Como la longitud máxima del teacher es 2048, un 0,088% de las ventanas se trunca para la pérdida ALM. La máscara MTP define que la cabeza k en la posición t predice `ids[t+k]`, siendo válido si `t+k < 4096`, `ids[t+k] != PAD` y no hay ningún BOS en `ids[t+1..t+k]` (mismo documento). EOS es un objetivo válido dentro de su documento; BOS nunca es objetivo. Cada cabeza normaliza su pérdida por su propio conteo de posiciones válidas, y `bytes_seen` cuenta solo los bytes de fuente reales.

## Capacidades

- Reproducibilidad del pipeline de entrenamiento de modelos byte-level MTP, incluyendo la configuración exacta en `training_config.json`.
- Split determinista por repositorio basado en `sha256(max_stars_repo_name)`, con división en train (99%), val (0,5%) y test (0,5%).
- Tokenización byte-level con ids 0..255 = bytes y tokens de plantilla Llama-3, que permite procesar código Python sin pérdida de información.
- Empaquetado de ventanas de exactamente 4096 ids con manejo de caracteres multi-byte UTF-8 y padding.
- Máscara MTP configurable con 32 cabezas, alineada con el tokenizer subword de Llama-3 para la pérdida auxiliar.
- Filtrado de calidad por `int_score >= 3`, con histogramas y estadísticas de tamaño de archivo.
- Limpieza de cabeceras de metadatos añadidas por el dataset (`<reponame>`, `<filename>`, `<gh_stars>`).
- No es un modelo de inferencia: no ofrece generación de texto, tool calling, ni soporte de agentes.

## Casos de uso

- Reproducción de experimentos de investigación: los investigadores pueden usar el repositorio para reconstruir exactamente el mismo flujo de datos y entrenamiento de los modelos `byte-level-code-mtp-32-*`, garantizando la reproducibilidad de resultados en publicaciones.
- Desarrollo de nuevos modelos byte-level MTP: a partir del código y la configuración incluida, se pueden modificar hiperparámetros como el número de cabezas MTP o el contexto, y reentrenar con el mismo pipeline sobre el dataset filtrado.
- Evaluación de la calidad de datos de código Python: los histogramas de `int_score` y las estadísticas de tamaño permiten analizar cómo afecta el filtrado a la composición del corpus, útil para diseñar filtros de calidad en otros dominios.
- Investigación en tokenización byte-level: el tokenizer incluido y el proceso de alineación con el teacher subword permiten comparar el rendimiento de modelos byte-level frente a modelos subword en tareas de código.
- Auditoría de pipelines de datos: el código de preprocesamiento y los manifiestos de split sirven como referencia para construir pipelines de datos deterministas y auditables en entornos de producción.
- Transferencia de modelos instruct a representación byte-level: el repositorio documenta cómo transferir `Llama-3.2-3B-Instruct` a una arquitectura byte-level con MTP, lo que resulta útil para equipos que exploran esta técnica sin partir de cero.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio incluye un archivo `baseline_reference_eval.json` con la evaluación de referencia del baseline `benjamin/Llama3-2-3B-IT-Byte` sobre las primeras 128 ventanas de validación, pero no se proporcionan métricas numéricas en el README. No se dispone de resultados de MMLU, HumanEval, GSM8K ni de otras pruebas comparativas.

## Requisitos de hardware

- Para ejecutar el pipeline de preprocesamiento: se necesita espacio en disco para los ~18,5 GB de datos filtrados, más los parquet originales (~60 GB) si se descargan. La RAM necesaria depende del tamaño de los shards parquet procesados, pero no se especifica en el README.
- Para entrenar los modelos `byte-level-code-mtp-32-*`: no disponible en la información proporcionada. Al tratarse de una transferencia desde un modelo de 3B parámetros, se estima que se requiere una GPU con al menos 16-24 GB de VRAM en fp16, o menos con cuantización, pero no hay datos concretos.
- No aplica la inferencia en GPU de consumo porque el repositorio no contiene pesos de modelo; es un conjunto de artefactos de datos y código.

## Comparativa con modelos similares

No disponible. Este repositorio no es un modelo de inferencia, sino un conjunto de artefactos de reproducibilidad. Los modelos comparables serían los `s0nh/byte-level-code-mtp-32-*` y el baseline `benjamin/Llama3-2-3B-IT-Byte`, pero no se proporcionan especificaciones ni resultados de benchmarks que permitan una comparativa directa. El enfoque de byte-level MTP guarda relación con el Byte Latent Transformer (BLT) de Meta, pero no hay datos de rendimiento en esta información.

## Limitaciones y advertencias

- No contiene pesos de modelo; solo datos, código y manifiestos. No se puede usar directamente para inferencia ni para generar texto.
- El dataset está limitado a código Python, por lo que no cubre otros lenguajes de programación ni dominios generales.
- El filtrado de calidad (`int_score >= 3`) puede eliminar código de baja calidad, lo que podría introducir sesgos hacia repositorios más populares o mejor mantenidos.
- La limpieza de cabeceras elimina la primera línea de archivos que comienzan con `<reponame>`, `<filename>` o `<gh_stars>`, lo que podría afectar a archivos cuyo contenido legítimo empiece con esas etiquetas, aunque el regex es específico.
- La reproducibilidad depende de revisiones exactas de datasets externos: `jon-tow/starcoderdata-python-edu` (revisión `67bd30e...`) y `benjamin/Llama3-2-3B-IT-Byte`. Si estos recursos cambian o desaparecen, el pipeline no se puede reconstruir.
- No se han publicado resultados de benchmarks, por lo que el rendimiento real del modelo resultante es desconocido.
- La licencia CC-BY-4.0 permite uso comercial con atribución, pero los modelos derivados podrían tener restricciones adicionales según la licencia de Llama-3.2.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/s0nh/byte-level-code-mtp-data
- Dataset fuente: https://huggingface.co/datasets/jon-tow/starcoderdata-python-edu (revisión `67bd30e21b92296da7d2ee05c8f9d8ee16ba0129`)
- Tokenizer: https://huggingface.co/benjamin/Llama3-2-3B-IT-Byte
- Código fuente: commit `611f0b1560ef35ebd21766ed587c3f1a22376969` (branch `mtp32-byte-transfer`)
- Referencia BLT (Byte Latent Transformer): https://github.com/facebookresearch/blt
