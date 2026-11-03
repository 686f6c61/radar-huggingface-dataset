# moravianai/ThinEmbed-Qwen3-Embedding-0.6B

## Resumen

ThinEmbed-Qwen3-Embedding-0.6B es una familia de codificadores de consulta (query encoders) cuantizados en formato GGUF, publicada por Moravian AI, que reproduce el comportamiento del modelo de embeddings Qwen/Qwen3-Embedding-0.6B exclusivamente en el lado de la consulta. El objetivo es permitir la codificación de queries en el cliente —portátil, pestaña de navegador o dispositivo edge— manteniendo la compatibilidad vectorial con un índice de documentos ya construido con el modelo original en fp32 o fp16. Esto reduce el artefacto de 1 142 MiB (fp16) a entre 339,9 y 385,4 MiB según la variante, sin necesidad de reindexar el corpus.

El modelo base es un transformer de 595.776.512 parámetros (0,6B) con embeddings de 1024 dimensiones, pooling de último token, normalización L2 y soporte de truncamiento Matryoshka. ThinEmbed no es un fine-tune ni un modelo nuevo: es una receta de cuantización K-quant con mezcla de bloques (Q4_K_M a 4,5 bits o Q5_K_M a 5,7 bits) más una tabla de tokens en 4 bits, calibrada con importance matrix específica por idioma (inglés/wikitext o checo). Se distribuye en cuatro ficheros que difieren en el idioma de calibración y en la anchura de bits.

Su relevancia actual radica en el despliegue de recuperación asimétrica en entornos con recursos limitados: búsqueda semántica local, RAG en navegador y aplicaciones offline donde el índice reside en servidor pero la query se genera en el dispositivo. La licencia Apache 2.0 y la compatibilidad directa con llama.cpp y wllama 3.6.1 facilitan su integración sin dependencias de infraestructura GPU.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (derivado de Qwen3-Embedding-0.6B), pooling de ultimo token, normalizacion L2, 1024 dimensiones |
| Parametros totales | 595.776.512 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 32 768 tokens en el modelo base; en la practica se recomienda fijar `-c 512` para queries, ya que el contexto por defecto asigna varios GB de KV cache |
| Tipos de cuantizacion | Q4_K_M (4,5 bits) + tabla de tokens Q4_0; Q5_K_M (5,7 bits) + tabla de tokens Q4_0; importance matrix calibrada en ingles/wikitext o en checo |
| Idiomas soportados | en, cs, multilingual |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (4 ficheros: 339,9 MiB y 385,4 MiB por variante de idioma) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del modelo Qwen3-Embedding-0.6B: un transformer encoder de 0,6B parámetros que produce embeddings de 1024 dimensiones mediante pooling de último token y normalización L2. ThinEmbed no modifica los pesos en sentido de entrenamiento supervisado ni aplica RLHF/DPO; es un proceso de cuantización post-entrenamiento ejecutado con `llama-quantize`, combinando K-quants por bloques con una tabla de tokens de 4 bits. La novelty técnica está en la calibración: se generan importance matrices separadas para inglés (wikitext) y checo, de modo que la asignación de bits por bloque se ajusta a la distribución de activaciones de cada idioma.

La receta se diseñó con una regla de publicación explícita: retener al menos el 95 % del nDCG@10 del modelo fp32, una similitud coseno mínima de 0,94 respecto al vector de query fp32 y un solapamiento top-10 mínimo de 0,75. Los autores documentan que todas las variantes de 3 bits o menos fallaron esa regla en checo (Q3_K de `llama-quantize` retenía 80–86 %, IQ3_XXS un 70 %, y una tabla de tokens de 2 bits por sí sola costaba 4,6–6,6 puntos). De ahí la elección de 4,5 bits como mínimo y 5,7 bits como opción de mayor fidelidad.

Un detalle operativo relevante: la compatibilidad exige que los vectores de documento se hayan generado sin instrucción en el lado del documento, con pooling de último token, normalización L2 y 1024 dimensiones. Las queries deben usar el formato de instrucción del modelo, sin espacio final tras `Query:`.

## Capacidades

- Generación de embeddings de consulta (query-side encoding) compatibles con índices construidos con Qwen3-Embedding-0.6B en fp32/fp16.
- Recuperación asimétrica: el índice se mantiene en servidor con el modelo completo y la query se codifica en el cliente.
- Codificación monolingüe en inglés y checo, con calibración de cuantización específica para cada uno.
- Soporte multilingüe general en la variante calibrada con wikitext.
- Truncamiento Matryoshka: se puede truncar la dimensión del embedding de salida y renormalizar, igual que en el modelo original.
- Ejecución en llama.cpp mediante `llama-embedding` con pooling `last` y normalización `--embd-normalize 2`.
- Ejecución en navegador con wllama 3.6.1, usando WebGPU cuando `shader-f16` está disponible y WebAssembly en caso contrario.
- No soporta tool calling, agentes, razonamiento multi-paso ni generación de texto: es exclusivamente un modelo de feature-extraction.

## Casos de uso

- Búsqueda semántica en navegador: cargar el GGUF de 339,9 MiB con wllama y codificar la query en la pestaña del usuario contra un índice de documentos alojado en servidor, eliminando la latencia de ida y vuelta para la fase de encoding y reduciendo coste de backend.
- RAG en aplicaciones de escritorio o edge: desplegar el codificador de query junto a un índice local precalculado con Qwen3-Embedding-0.6B, de modo que la recuperación funcione sin conexión y sin GPU dedicada.
- Atención al cliente con recuperación de documentación: el índice de artículos se genera una vez en fp32 en servidor y cada instancia cliente codifica las consultas de los usuarios con el fichero Q4_K_M, manteniendo el 99,3–100,1 % del nDCG@10 en los corpus evaluados.
- Recuperación jurídica en checo: usar la variante calibrada con importance matrix checa sobre índices de resoluciones (el caso documentado cubre 55 071 segmentos del tribunal supremo), donde Q5_K_M retiene el 99,5 % del nDCG@10 con coseno 0,983 y solapamiento top-10 de 0,839.
- Extensión de navegador para búsqueda sobre documentación técnica: el tamaño de 340–385 MiB permite empaquetar el modelo en la extensión y codificar queries localmente, evitando enviar el texto de la consulta a un servicio externo.
- Prototipado y evaluación de pipelines de recuperación: al ser compatible byte a byte con el índice del modelo base, permite comparar la calidad de la cuantización frente a fp32 sobre los mismos datos sin reindexar, usando los corpus SciFact, NFCorpus, ArguAna, SciDocs o un índice propio en checo.
- Despliegue en dispositivos con poca memoria: sustituir el modelo fp16 de 1 142 MiB por el GGUF de 339,9 MiB en entornos donde el presupuesto de RAM o de descarga es restrictivo, aceptando una pérdida de calidad nula o inferior a 0,01 nDCG@10 en inglés.

## Benchmarks y rendimiento

Resultados sobre el split de test, con `llama-embedding` nativo y un índice de documentos fp32 del mismo modelo. La métrica principal es nDCG@10 como porcentaje del fp32; se añaden el coseno medio del vector de query del cliente respecto al fp32 y el solapamiento medio del top-10 con el ranking fp32.

| Corpus (consultas) | fp32 | Q4_K_M, imatrix EN | Q5_K_M, imatrix EN | Q4_K_M, imatrix CS | Q5_K_M, imatrix CS |
|---|---|---|---|---|---|
| SciFact (300) | 0,7004 | 0,7004 (100,0 %) · cos 0,981 · overlap 0,898 | 0,6989 (99,8 %) · 0,992 · 0,928 | – | – |
| NFCorpus (323) | 0,3537 | 0,3514 (99,4 %) · 0,973 · 0,869 | 0,3539 (100,1 %) · 0,988 · 0,912 | – | – |
| ArguAna (700, self-document ignorado) | 0,7034 | 0,7044 (100,1 %) · 0,980 · 0,937 | 0,7040 (100,1 %) · 0,991 · 0,959 | – | – |
| SciDocs (500) | 0,2168 | 0,2154 (99,3 %) · 0,983 · 0,898 | 0,2171 (100,1 %) · 0,992 · 0,936 | – | – |
| Segmentos del tribunal supremo checo (1 137 queries sinteticas) | 0,3186 | – | – | 0,3145 (98,7 %) · 0,966 · 0,775 | 0,3171 (99,5 %) · 0,983 · 0,839 |

Los autores indican que las diferencias inferiores a 0,01 nDCG@10 deben interpretarse como empate, ya que el intervalo pareado sobre consultas no incluye la varianza del muestreo de calibración (aproximadamente 0,01) ni la variación entre máquinas (±0,006). La comparación con `microsoft/harrier-oss-v1-0.6b` (misma arquitectura, fine-tune de recuperación) se cita solo como referencia: ese modelo mantiene el 99 % a 3,4 bits, mientras que Qwen3-Embedding-0.6B no supera la regla de publicación por debajo de 4,5 bits.

## Requisitos de hardware

- VRAM/RAM para inferencia: el fichero ocupa 339,9 MiB (Q4_K_M) o 385,4 MiB (Q5_K_M); a ello se suma el KV cache, que con `-c 512` es de decenas de MiB, pero con el contexto por defecto de 32k asciende a varios GB.
- GPU recomendadas: cualquier GPU con soporte de llama.cpp; en la práctica el modelo cabe holgadamente en RTX 3060 12 GB, RTX 4060 Ti, RTX 4090, A100 y H100, aunque el cuello de botella no es la VRAM sino el número de queries por segundo.
- Cabe en GPU consumer: sí, en cualquier GPU con 2 GB o más de VRAM, e incluso en CPU. En navegador funciona con WebGPU (requiere `shader-f16`) o WebAssembly.
- Opciones de despliegue: `llama-embedding` de llama.cpp con `--pooling last --embd-normalize 2`; wllama 3.6.1 en navegador; cualquier runtime compatible con GGUF que soporte pooling de último token y normalización L2.
- Latencia y throughput: no disponibles en la información proporcionada. La model card no publica cifras de latencia ni de queries por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Dimensiones | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|---|
| ThinEmbed-Qwen3-Embedding-0.6B | 595,8 M | 1024 (Matryoshka) | 32k en el base; 512 recomendado para queries | GGUF Q4_K_M / Q5_K_M | Apache 2.0 | Solo query-side; compatible con índices de Qwen3-Embedding-0.6B |
| Qwen/Qwen3-Embedding-0.6B (fp16) | 595,8 M | 1024 | 32k | safetensors | Apache 2.0 | Modelo completo; 1 142 MiB en fp16, sirve para indexar y consultar |
| ThinEmbed-harrier-0.6b | 0,6B | no disponible | no disponible | GGUF | no disponible | Clientes de query para `microsoft/harrier-oss-v1-0.6b`; retiene el 99 % a 3,4 bits según la model card |
| microsoft/harrier-oss-v1-0.6b | 0,6B | no disponible | no disponible | safetensors | no disponible | Fine-tune de recuperación sobre la misma arquitectura; no compatible con índices de Qwen3 |

La comparación directa de rendimiento entre ThinEmbed y el modelo base no aplica en términos absolutos: ThinEmbed reproduce al base con una pérdida de nDCG@10 inferior al 1 % en los corpus evaluados. Frente a harrier-oss-v1-0.6b, la diferencia relevante es la tolerancia a cuantización más agresiva (3,4 bits frente a 4,5 bits), aunque los índices de ambos modelos no son intercambiables.

## Limitaciones y advertencias

- No es un modelo de generación: solo produce embeddings de consulta; no responde preguntas, no razona y no soporta tool calling.
- Incompatible con índices construidos con otros modelos, incluidos `jina-embeddings-v5-text-small` y `harrier-oss-v1-0.6b`, aunque compartan arquitectura y dimensión. Mezclar índices y codificadores de query distintos invalida la recuperación.
- Requiere que los documentos se hayan indexado sin instrucción en el lado del documento, con pooling de último token, normalización L2 y 1024 dimensiones. Un índice generado con instrucción en el documento no es compatible.
- El formato de query debe respetar la instrucción del modelo y no incluir espacio final tras `Query:`; desviarse de ese formato degrada la calidad de forma no cuantificada en la model card.
- La calibración de la cuantización es específica por idioma: usar la variante inglesa sobre corpus checo, o viceversa, no está evaluado y probablemente reduzca la fidelidad.
- El contexto por defecto de 32k provoca una asignación de KV cache de varios GB en llama.cpp; es necesario fijar `-c 512` o un valor acorde a la longitud real de las queries.
- Riesgo de alucinación: no aplica en el sentido generativo, pero sí existe riesgo de recuperación de pasajes irrelevantes cuando la similitud coseno cae por debajo de los umbrales documentados (0,94 en la regla de publicación).
- Sesgos: no documentados en la información disponible; al heredar el modelo base, reproduce los sesgos de Qwen3-Embedding-0.6B en la representación de textos.
- Licencia Apache 2.0: permite uso comercial, pero conviene verificar las condiciones del modelo base Qwen3-Embedding-0.6B, también Apache 2.0 según la información disponible.
- El repositorio tiene 117 descargas y 0 likes en el momento de la consulta, lo que indica una validación comunitaria todavía limitada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/moravianai/ThinEmbed-Qwen3-Embedding-0.6B
- Modelo base: https://huggingface.co/Qwen/Qwen3-Embedding-0.6B
- Página de query encoders de Moravian AI: https://moravian.ai/query-encoders/
- Demo en vivo: https://moravian.ai/demo
- Clientes ThinEmbed para harrier: https://huggingface.co/moravianai/ThinEmbed-harrier-0.6b
- Modelo harrier de referencia: https://huggingface.co/microsoft/harrier-oss-v1-0.6b
