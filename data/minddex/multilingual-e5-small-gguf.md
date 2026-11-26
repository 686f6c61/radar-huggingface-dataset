# MindDex/multilingual-e5-small-GGUF

## Resumen

multilingual-e5-small-GGUF es la conversión al formato GGUF del modelo de embeddings intfloat/multilingual-e5-small, publicada por el usuario MindDex. No se trata de un modelo generativo, sino de un encoder BERT de 12 capas y 118 millones de parámetros que produce representaciones vectoriales densas de 384 dimensiones a partir de texto. Su función es alimentar sistemas de búsqueda semántica, recuperación aumentada (RAG), clustering y similitud entre textos en más de 90 idiomas.

La relevancia de esta versión concreta reside en el formato: al estar en GGUF, el modelo puede ejecutarse con motores basados en ggml como CrispEmbed o con una bifurcación de Ollama que soporta embeddings XLM-R, sin necesidad de PyTorch ni de una GPU dedicada. El tamaño reducido de los ficheros cuantizados (126 MiB en Q8_0, 115 MiB en Q4_K) permite desplegarlo en entornos con recursos muy limitados, incluidos contenedores pequeños y dispositivos de borde.

El modelo conserva la licencia MIT del original y mantiene una fidelidad prácticamente exacta respecto a los pesos de Hugging Face: la cuantización Q8_0 alcanza una similitud coseno de 0.9999 frente a la referencia F32, mientras que Q4_K baja a 0.990. Es, por tanto, una opción práctica para pipelines de recuperación de información multilingüe donde el coste computacional y el espacio en disco son críticos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BERT (encoder transformer) |
| Parametros totales | 117.505.920 (118M) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | F32, Q8_0, Q4_K, Q4_K + imatrix, IQ4_XS |
| Idiomas soportados | 90+ (en, de, fr, es, zh, ja, ko, ar, hi, pt, ru, it, nl, pl, tr, vi, th, id, sv, da, no, fi, cs, ro, hu, bg, uk, ca, el, hr, sk, sl, et, lt, lv, ms, tl, sw, af, cy, ga, sq, mk, bs, mt, gl, eu, is, ka, hy, kk, uz, az, be, mn, ne, si, km, my, lo, am, ps, sd, ku, ug, bo, dz, fy) |
| Licencia | MIT |
| Formato de pesos | GGUF (tambien disponible el original en safetensors via intfloat) |
| Dimension de embedding | 384 |
| Capas | 12 |
| Pooling | mean |
| Tokenizador | SentencePiece |
| Tamano del repo | 1.0 GB |

## Arquitectura y entrenamiento

La arquitectura es un transformer encoder tipo BERT con 12 capas, dimensión oculta de 384 y pooling por media de los tokens. El tokenizador es SentencePiece con vocabulario multilingüe, lo que permite procesar texto en más de 90 idiomas sin normalización previa específica por lengua. El modelo original fue entrenado por intfloat siguiendo la receta de la familia E5, que combina preentrenamiento contrastivo sobre pares de texto y ajuste con datos supervisados de recuperación; los detalles exactos de la composición del dataset y el número de tokens de entrenamiento no se especifican en la información proporcionada y deben consultarse en la model card del modelo base.

Esta versión GGUF no introduce cambios arquitectónicos ni de entrenamiento: es una conversión pura de formato y cuantización. Según la model card, no hubo fine-tuning, merging, destilación ni modificación de vocabulario o capacidades; solo cambia la representación numérica de los pesos. La tabla de ficheros documenta la fidelidad de cada cuantización mediante similitud coseno frente a la referencia F32: Q8_0 = 0.9999, Q4_K = 0.990, y las variantes con imatrix e IQ4_XS no tienen medición publicada.

## Capacidades

- Generación de embeddings de texto densos de 384 dimensiones para similitud semántica y recuperación de información.
- Soporte multilingüe amplio: más de 90 idiomas, incluidos lenguas de bajos recursos como euskera, galés, islandés, georgiano, urdu, birmano o tibetano.
- Codificación de consultas y documentos para búsqueda semántica (el formato E5 espera prefijos `query:` y `passage:` en el texto de entrada, según la convención del modelo base).
- Extracción de características para clustering, deduplicación y clasificación mediante vecinos más cercanos.
- No soporta generación de texto, tool calling, agentes ni razonamiento multi-paso: es exclusivamente un encoder.
- No dispone de modo thinking, visión ni audio.
- Compatible con APIs OpenAI (`/v1/embeddings`), Ollama (`/api/embed`, `/api/embeddings`) y API nativa de CrispEmbed (`/embed`).

## Casos de uso

- Búsqueda semántica multilingüe: indexar documentos en varios idiomas y recuperar pasajes relevantes para consultas en cualquier lengua soportada, usando la similitud coseno entre embeddings de 384 dimensiones. El tamaño de 118M permite indexar corpus grandes con coste de almacenamiento bajo (384 floats por fragmento).
- RAG (retrieval-augmented generation): actuar como recuperador en pipelines donde un LLM generativo consume los pasajes recuperados. Su reducido tamaño permite ejecutarlo en la misma máquina que el generador o en un servicio separado sin competir por VRAM.
- Deduplicación de corpus: calcular embeddings de documentos o registros y agrupar por similitud para eliminar duplicados en datasets de entrenamiento o catálogos de productos.
- Clasificación de tickets y soporte: asignar categorías a mensajes de clientes en múltiples idiomas mediante comparación con embeddings de prototipos por categoría, sin necesidad de entrenar un clasificador específico.
- Moderación y filtrado de contenido: comparar textos entrantes contra una lista de ejemplos etiquetados para detectar similitud con contenido no deseado, aprovechando la cobertura de 90+ idiomas.
- Búsqueda en aplicaciones de borde: desplegar el modelo cuantizado en Q8_0 (126 MiB) o Q4_K (115 MiB) dentro de un contenedor o dispositivo con poca memoria, usando CrispEmbed u Ollama, para búsqueda local sin conexión.
- Agrupación de reseñas o encuestas: generar embeddings de respuestas abiertas y aplicar clustering para descubrir temas recurrentes en encuestas multilingües.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks (MMLU, HumanEval, GSM8K ni métricas de recuperación como MTEB) en la información disponible. La model card solo documenta la fidelidad de las cuantizaciones respecto al original:

| Fichero | Cuantizacion | Tamano | Similitud coseno vs HF |
|---|---|---|---|
| multilingual-e5-small.gguf | F32 | 455 MiB | 1.0000 (referencia) |
| multilingual-e5-small-q8_0.gguf | Q8_0 | 126 MiB | 0.9999 |
| multilingual-e5-small-q4_k.gguf | Q4_K | 115 MiB | 0.990 |
| multilingual-e5-small-q4_k-imatrix.gguf | Q4_K + imatrix | 115 MiB | no medida |
| multilingual-e5-small-iq4_xs.gguf | IQ4_XS | 115 MiB | no medida |

## Requisitos de hardware

- VRAM estimada: inferior a 1 GB en todas las cuantizaciones; Q8_0 ocupa 126 MiB de pesos y Q4_K 115 MiB, más overhead de activaciones y tokenizador.
- GPU recomendadas: cualquier GPU con al menos 1 GB de memoria libre; el modelo es viable en iGPU y en CPU. No requiere A100 ni H100.
- Cabe en GPU de consumo: sí, en cualquier RTX, GTX o iGPU moderna; también funciona enteramente en CPU.
- Opciones de despliegue: CrispEmbed (CLI y servidor), Ollama mediante la bifurcación con soporte de embeddings XLM-R, y cualquier runtime ggml/GGUF compatible con modelos BERT de embeddings.
- Latencia y throughput: no se han publicado mediciones en la información disponible. Por el tamaño (118M parámetros), se espera latencia de milisegundos por lote en CPU moderna, pero no hay cifras oficiales.

## Comparativa con modelos similares

| Modelo | Parametros | Dimension | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|---|
| multilingual-e5-small-GGUF (este) | 118M | 384 | no disponible | 90+ | MIT | GGUF |
| intfloat/multilingual-e5-small | 118M | 384 | no disponible | 90+ | MIT | safetensors |
| multilingual-e5-base | no disponible en la informacion | no disponible | no disponible | 90+ | MIT | safetensors |
| multilingual-e5-large | no disponible en la informacion | no disponible | no disponible | 90+ | MIT | safetensors |

La comparación relevante es con el modelo base original: esta versión GGUF ofrece los mismos pesos en un formato ejecutable sin PyTorch, con una pérdida de fidelidad despreciable en Q8_0 (0.9999 de similitud coseno). Frente a las variantes base y large de la familia E5, el modelo small sacrifica capacidad de representación a cambio de un tamaño mucho menor, adecuado para despliegues con restricciones de memoria. No se dispone de datos de benchmarks comparativos en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo generativo: no produce texto, código ni respuestas; solo embeddings. No debe evaluarse con benchmarks de generación.
- La longitud máxima de contexto no se documenta en la información disponible; debe consultarse la model card del modelo base para conocer el límite exacto de tokens por entrada.
- La convención E5 requiere prefijos `query:` y `passage:` para un rendimiento óptimo en recuperación; omitirlos puede degradar la calidad de los embeddings.
- Riesgo de sesgos heredados del corpus de entrenamiento original, no documentados en esta conversión; la model card no detalla la composición del dataset.
- La cuantización Q4_K reduce la similitud coseno a 0.990 frente a la referencia; para aplicaciones sensibles a la precisión se recomienda Q8_0, que la mantiene en 0.9999.
- Las variantes con imatrix e IQ4_XS no tienen medición de fidelidad publicada, por lo que su comportamiento es incierto.
- Licencia MIT: permite uso comercial y modificación, pero esta conversión no otorga derechos adicionales a los del modelo original de intfloat.
- Según la nota de la model card sobre el Reglamento (UE) 2024/1689, el proveedor del modelo sigue siendo intfloat; esta conversión no constituye un nuevo modelo de propósito general.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validación comunitaria de su funcionamiento.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/MindDex/multilingual-e5-small-GGUF
- Modelo base: https://huggingface.co/intfloat/multilingual-e5-small
- CrispEmbed (motor de inferencia): https://github.com/CrispStrobe/CrispEmbed
- Bifurcación de Ollama con soporte de embeddings XLM-R: https://github.com/CrispStrobe/ollama/tree/feat/xlmr-embedding
- Ollama: https://ollama.com
