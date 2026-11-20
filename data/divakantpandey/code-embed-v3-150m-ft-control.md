# divakantpandey/code-embed-v3-150m-ft-control

## Resumen

`code-embed-v3-150m-ft-control` es un modelo de embeddings de código desarrollado por divakantpandey como artefacto de investigación para el artículo *Does Execution-Verified Near-Miss Training Teach Code Embeddings to Prefer Working Code? A Negative Result*. Se trata del **control de solo repetición (replay-only)**: un fine-tuning de `Alibaba-NLP/gte-modernbert-base` con la misma receta que el piloto near-miss, pero sin los datos near-miss, de modo que la comparación del artículo pueda reproducirse.

El modelo emplea una arquitectura ModernBERT de aproximadamente 149 millones de parámetros, con pooling CLS, embeddings normalizados de 768 dimensiones y truncamiento Matryoshka a 512, 256, 128 y 64 dimensiones. Su ventana de contexto es de 8.192 tokens, lo que permite indexar funciones y ficheros de código de longitud media sin fragmentación agresiva.

Es relevante por su valor metodológico, no por su rendimiento: el propio autor advierte que **no es un mejor embedder de código que su modelo base**. Los resultados muestran que el fine-tuning sobre la mezcla de replay por sí solo cuesta unos 2 puntos de MTEB(Code) (69,75 frente a 71,78 del base) y que la mejora atribuible a los datos near-miss no es estadísticamente significativa. Se publica para permitir la reproducibilidad del resultado negativo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ModernBERT (encoder transformer) |
| Parametros totales | 149.014.272 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 8.192 tokens |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; evaluado en float32 y float16) |
| Idiomas soportados | en, code |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de `Alibaba-NLP/gte-modernbert-base`, un encoder ModernBERT con pooling CLS y embeddings normalizados de 768 dimensiones, con soporte de truncamiento Matryoshka a 512, 256, 128 y 64 dimensiones. La longitud máxima de entrada es de 8.192 tokens. El fine-tuning se realizó sobre 213.648 filas correspondientes únicamente a los datos de replay del piloto, durante 13.346 pasos con batch de 16, una época y una sola fuente por batch. Se usó la pérdida *cached multiple-negatives ranking* con temperatura 0,015 y Matryoshka, tasa de aprendizaje 2e-5, 512 tokens de entrenamiento, pesos maestros en float32 y una única semilla.

Los datos de entrenamiento fueron decontaminados frente a MTEB(Code, v1), CoIR, CoREB(v1), ExecRetrieval y CoQuIR. Las consultas reciben un prompt de tarea (`nl2code`, `code2code`, `code2nl`, `text2sql`, etc., definidos en `config_sentence_transformers.json`), mientras que los documentos no llevan prompt. No se menciona uso de RLHF ni DPO; el entrenamiento es puramente contrastivo con negativos en caché.

## Capacidades

- Generación de embeddings de texto y código para búsqueda semántica y recuperación.
- Recuperación código-a-código, lenguaje natural a código (nl2code), código a lenguaje natural (code2nl) y texto a SQL (text2sql) mediante prompts de tarea.
- Similitud semántica entre consultas y documentos de código.
- Soporte de truncamiento Matryoshka para reducir dimensionalidad (768, 512, 256, 128, 64) a coste de precisión.
- Contexto de 8.192 tokens para indexar funciones, clases o ficheros de tamaño medio.
- Compatible con Text Embeddings Inference (TEI) y con endpoints de Hugging Face.
- No soporta tool calling, agentes, visión, audio ni modo de razonamiento: es exclusivamente un modelo de embeddings.

## Casos de uso

- **Reproducción de resultados de investigación**: sirve como control emparejado frente a `code-embed-v3-150m-ft-behaviour` para verificar el resultado negativo del artículo sobre entrenamiento near-miss verificado por ejecución.
- **Búsqueda semántica de código en repositorios internos**: indexando funciones y ficheros con contexto de hasta 8.192 tokens y consultando con el prompt `nl2code`, permite localizar implementaciones a partir de descripciones en lenguaje natural.
- **Deduplicación y clustering de fragmentos de código**: los embeddings normalizados y las dimensiones reducidas vía Matryoshka permiten agrupar código similar con menor coste de almacenamiento y comparación.
- **Sistemas de recomendación de fragmentos de código**: dado un snippet de entrada, recuperar fragmentos relacionados mediante el prompt `code2code` para asistentes de IDE o documentación técnica.
- **Documentación automática asistida**: con el prompt `code2nl`, emparejar funciones con descripciones o comentarios existentes para generar y validar documentación.
- **Recuperación texto-a-SQL**: con el prompt `text2sql`, vincular preguntas en lenguaje natural con consultas SQL de referencia en un catálogo interno.
- **Línea base en experimentos de embeddings de código**: como punto de comparación controlado en estudios sobre fine-tuning contrastivo, al compartir receta, datos de replay y semilla con el piloto near-miss.

## Benchmarks y rendimiento

Resultados publicados por el autor, misma máquina, float32 y 8.192 tokens (MTEB(Code) puntuado en float16 para ambos fine-tunes):

| Modelo | exec@1 | beats_paired | CoQuIR pairwise | MTEB(Code, v1) | AppsRetrieval |
|---|---|---|---|---|---|
| gte-modernbert-base (base) | 0.0927 | 0.0990 | 0.5528 | 71.78 | 57.67 |
| replay-only control (este modelo) | 0.0852 | 0.0905 | 0.5588 | 69.75 | 53.89 |
| near-miss pilot | 0.0990 | 0.1054 | 0.5527 | 66.02 | 18.87 |

Comparación piloto frente a control, emparejada por consultas: exec@1 +0,014 (McNemar p = 0,21), beats_paired +0,015 (p = 0,18), CoQuIR pairwise -0,006 (bootstrap p = 0,043). El autor concluye que los datos near-miss aportan una ganancia pequeña y no significativa en ExecRetrieval y son la causa del colapso en AppsRetrieval, mientras que el fine-tuning sobre la mezcla de replay por sí solo cuesta aproximadamente 2 puntos de MTEB(Code).

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,6 GB en float16 y 1,2 GB en float32 para los pesos; el consumo real depende del tamaño de batch y de la longitud de secuencia.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para lotes pequeños; tarjetas como RTX 3060, RTX 4090, A100 o H100 son suficientes y de sobra para este tamaño.
- Cabe holgadamente en GPU de consumo: sí, en cualquier GPU moderna con 4 GB o más.
- Opciones de despliegue: `sentence-transformers`, Text Embeddings Inference (TEI), endpoints de Hugging Face; también es convertible a otros runtimes de embeddings, aunque no se documenta GGUF ni Ollama.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | MTEB(Code, v1) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| code-embed-v3-150m-ft-control | 149 M | 8.192 | 69,75 | apache-2.0 | Hugging Face |
| Alibaba-NLP/gte-modernbert-base | 149 M | 8.192 | 71,78 | apache-2.0 | Hugging Face |
| code-embed-v3-150m-ft-behaviour | 149 M | 8.192 | 66,02 | no disponible en la información | Hugging Face |

El modelo base supera a este control en MTEB(Code) y AppsRetrieval, por lo que para búsqueda de código en producción el autor recomienda usar `gte-modernbert-base`. El piloto near-miss obtiene mejor exec@1 pero colapsa en AppsRetrieval. No se dispone de comparación con otros embedders de código de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- **No es un mejor embedder de código que su base**: el autor lo indica explícitamente y recomienda el modelo base para búsqueda de código.
- El fine-tuning sobre la mezcla de replay por sí solo degrada MTEB(Code) en unos 2 puntos respecto al base.
- Una sola semilla de entrenamiento por modelo; los resultados pueden no ser estables entre ejecuciones.
- Las 939 consultas de ExecRetrieval no permiten resolver diferencias de un punto; los tests emparejados del piloto no alcanzan significación en exec@1 ni beats_paired.
- Solo se estudió un modelo base, lo que limita la generalización de las conclusiones.
- Riesgo de alucinación no aplicable en sentido generativo, pero sí de recuperaciones irrelevantes en dominios alejados de los datos de entrenamiento.
- Idiomas limitados a inglés y código; no se documenta soporte multilingüe.
- Licencia apache-2.0, que permite uso comercial, pero el modelo se publica como artefacto de investigación y no como producto listo para producción.
- Los datos de entrenamiento están decontaminados frente a MTEB(Code, v1), CoIR, CoREB(v1), ExecRetrieval y CoQuIR, lo que condiciona la comparación con esos benchmarks.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/divakantpandey/code-embed-v3-150m-ft-control
- Modelo base: https://huggingface.co/Alibaba-NLP/gte-modernbert-base
- Piloto near-miss: https://huggingface.co/divakantpandey/code-embed-v3-150m-ft-behaviour
- Repositorio con receta, bitácora de investigación y drivers de experimentos: https://github.com/divakantpandey/code-embed-v3
- Dataset de filas de replay: https://huggingface.co/datasets/divakantpandey/code-embed-v3-data
- Dataset de filas near-miss: https://huggingface.co/datasets/divakantpandey/code-embed-v3-synth
- Salidas de evaluación por consulta, tests emparejados y logs: https://huggingface.co/divakantpandey/code-embed-v3-src
