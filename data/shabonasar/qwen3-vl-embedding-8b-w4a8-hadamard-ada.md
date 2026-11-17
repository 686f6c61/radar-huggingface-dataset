# shabonasar/qwen3-vl-embedding-8b-w4a8-hadamard-ada

## Resumen

El modelo `shabonasar/qwen3-vl-embedding-8b-w4a8-hadamard-ada` es una versión cuantizada del modelo de embeddings multimodales Qwen3-VL-Embedding-8B de Alibaba Qwen, publicada por el usuario shabonasar. Su propósito es reducir el coste de memoria y aumentar el rendimiento de inferencia de un modelo de embeddings de 8.148.922.608 parámetros, pasando de 17,5 GB en bf16 a 5,9 GB, mediante una combinación de cuantización de pesos a int4 y activaciones a int8 (W4A8), rotación de Hadamard de estilo QuIP y GPTQ con act-order estático.

El modelo proyecta texto, imágenes y entradas mixtas en un único espacio de 4096 dimensiones y soporta truncamiento Matryoshka desde 64 hasta 4096 dimensiones. Está optimizado específicamente para la NVIDIA RTX 6000 Ada Generation (arquitectura SM89, 48 GB), y requiere una build concreta de vLLM nightly con el backend lineal Humming y la transformación `hadacore`, ya que las versiones anteriores no cargan el layout W4A8 rotado.

Es relevante porque demuestra que la cuantización agresiva W4A8 combinada con rotaciones de Hadamard permite mantener la calidad de los embeddings multimodales (la rotación y GPTQ son imprescindibles: sin rotación, el recall texto→imagen cae de 0,68 a 0,57, y con round-to-nearest simple cae a 0,03) al tiempo que mejora el throughput de prefill entre un 30% y un 42% respecto a FP8 W8A8.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder denso (Qwen3-VL), 36 capas con atención completa y MLP denso, más vision tower de 27 bloques |
| Parametros totales | 8.148.922.608 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 8192 tokens (configurado en el ejemplo de despliegue del autor) |
| Tipos de cuantizacion | W4A8: pesos int4 simétricos por canal, activaciones int8 dinámicas por token; KV cache FP8 E4M3; vision tower, embeddings y normas en BF16 |
| Idiomas soportados | no disponible (la model card no detalla la lista de idiomas; el set de calibración incluye pasajes y preguntas en ruso) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors con formato `compressed-tensors` (`pack-quantized`), generado con llm-compressor 0.15.0 |

## Arquitectura y entrenamiento

El modelo base es un transformer decoder denso de 36 capas con atención completa y MLP denso, sin capa `lm_head` (el checkpoint original no la incluye y el pooling no la necesita). Incluye una torre de visión de 27 bloques con `merger`, tres `deepstack_merger_list`, `patch_embed` y `pos_embed`, todos mantenidos en BF16. La cuantización se aplica únicamente a las capas lineales del modelo de lenguaje: `q_proj`, `k_proj`, `v_proj`, `o_proj`, `gate_proj`, `up_proj` y `down_proj` de las 36 capas pasan a int4 simétrico por canal con escalas BF16 por canal, y sus activaciones a int8 dinámico por token. Las normas (`input_layernorm`, `post_attention_layernorm`, `q_norm`, `k_norm`, norma final) y `embed_tokens` permanecen en BF16.

La innovación técnica clave es la combinación de rotación de Hadamard de estilo QuIP (bloques de 128) sobre la entrada de cada capa lineal, aplicada antes de GPTQ con act-order estático. vLLM aplica la rotación inversa en línea mediante `hadacore`. Las matrices de Hadamard (128×128) se almacenan en FLOAT64 como `*.v_input.weight`. La calibración usó 512 muestras de hasta 2048 tokens, con aproximadamente un 64% de pasajes rusos de `mteb/RuBQRetrieval` y `mteb/MIRACLReranking`, un 21% de preguntas de esos mismos datasets y un 15% de imágenes de `jxie/flickr8k` pasadas por el chat template del modelo. No se usaron datos privados. No se especifica en la información disponible si hubo RLHF o DPO en el entrenamiento del modelo base.

## Capacidades

- Generación de embeddings multimodales: texto, imágenes y entradas mixtas en un único espacio de 4096 dimensiones.
- Truncamiento Matryoshka de 64 a 4096 dimensiones, lo que permite ajustar el coste de almacenamiento y búsqueda vectorial.
- Similitud semántica y recuperación (pipeline `sentence-similarity`).
- Procesamiento de imágenes a través del chat template del modelo (una imagen por prompt según la configuración recomendada).
- Pooling del último token con normalización L2, devuelto en FP32 en la respuesta.
- No incluye `lm_head`, por lo que no es un modelo generativo: está especializado en representaciones vectoriales.
- No se documentan en la información disponible capacidades de tool calling, agentes, audio ni modo thinking.

## Casos de uso

- Búsqueda semántica multilingüe sobre corpus rusos: el set de calibración incluye pasajes y preguntas de RuBQRetrieval y MIRACLReranking, por lo que el modelo está ajustado para recuperación de pasajes en ruso con embeddings truncables a 1024 dimensiones vía el parámetro `dimensions` de `/v1/embeddings`.
- Recuperación texto→imagen: con un recall@1 de 0,68 en la evaluación del autor, es adecuado para motores de búsqueda visual sobre catálogos de imágenes, usando el endpoint de chat con `image_url` en base64 y `add_generation_prompt: true`.
- Reranking de resultados: el pipeline de similitud permite reordenar candidatos recuperados previamente, reduciendo la latencia frente a un cross-encoder generativo.
- Deduplicación y clustering de documentos: los embeddings de 4096 dimensiones (o truncados a 512/1024) permiten agrupar documentos por similitud coseno en pipelines de ingesta.
- Sistemas RAG con restricción de VRAM: con 5,9 GB de pesos y un KV cache de 164.864 tokens en una RTX 6000 Ada con `--gpu-memory-utilization 0.35`, cabe junto a otros servicios en la misma GPU.
- Indexación masiva por lotes: el throughput de prefill de 20.997 tok/s con entradas de 128 tokens y 32 peticiones en paralelo permite procesar grandes volúmenes de documentos en una sola tarjeta.
- Moderación y clasificación zero-shot por similitud: comparar embeddings de contenido contra embeddings de referencia de políticas.

## Benchmarks y rendimiento

El autor no publica resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) porque el modelo no es generativo. Sí publica métricas de calidad de embeddings y de rendimiento de inferencia.

Calidad de embeddings (recall texto→imagen R@1, según el autor):

| Configuracion | Texto→imagen R@1 |
|---|---|
| W4A8 con rotacion y GPTQ (este modelo) | 0,68 |
| W4A8 con GPTQ sin rotacion | 0,57 |
| W4A8 round-to-nearest simple | 0,03 |

Rendimiento en una RTX 6000 Ada de 48 GB con vLLM commit `cf5cea2da`, comparado con FP8 W8A8 dinámico sobre cutlass con FlashAttention 2 y KV en bf16:

| Carga de trabajo | FP8 W8A8 | Este modelo |
|---|---|---|
| Prefill, entradas de 128 tokens, 32 en paralelo (tok/s) | 14.814 | 20.997 |
| Prefill, entradas de 512 tokens, 8 en paralelo (tok/s) | 14.243 | 20.850 |
| Prefill, entradas de 2048 tokens, 8 en paralelo (tok/s) | 13.397 | 18.338 |
| Prefill, entradas de 8000 tokens, 8 en paralelo (tok/s) | 11.413 | 15.190 |
| Prefill, lote de 64 × 512 tokens (tok/s) | 13.668 | 18.718 |
| Latencia de una petición, 128 / 512 / 2048 / 8000 tokens (ms) | 17,8 / 39,0 / 149 / 704 | 13,8 / 33,3 / 106 / 527 |
| Imágenes, 8 en paralelo (img/s) | 62,9 | 82,6 |
| Latencia de una imagen (ms) | 48,6 | 61,7 |
| Capacidad de KV cache (tokens) | 44.032 | 164.864 |

El modelo no tiene fase de decodificación: todo el throughput es prefill y no hay decodificación especulativa.

## Requisitos de hardware

- VRAM estimada: 5,9 GB de pesos en el formato cuantizado, frente a 17,5 GB en bf16. El autor usa `--gpu-memory-utilization 0.35` sobre 48 GB.
- GPU probada: NVIDIA RTX 6000 Ada Generation (SM89, 48 GB). El autor solo garantiza funcionamiento en SM89.
- Requisito de hardware: GPU NVIDIA con tensor cores int8. El KV cache FP8 en SM89 solo funciona con FlashInfer.
- No se documenta compatibilidad con GPUs de consumo (RTX 4090 es SM89 y comparte arquitectura, pero no se ha probado según la información disponible).
- Despliegue: exclusivamente vLLM con backend lineal Humming y transformación `hadacore`. La build exacta probada es la imagen `vllm/vllm-openai:nightly-cf5cea2da37d3dfed27d2e0aa3041c3e553c2d57`. Versiones anteriores de vLLM no cargan el layout W4A8 rotado.
- No hay soporte documentado para llama.cpp, Ollama ni TGI.
- Throughput y latencia: ver tabla de benchmarks (hasta 20.997 tok/s en prefill y 82,6 img/s con 8 imágenes en paralelo).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (Qwen3-VL-Embedding-8B W4A8 Hadamard) | 8.148.922.608 | 8192 tokens (configurado) | safetensors compressed-tensors W4A8 | Apache 2.0 | Hugging Face, requiere vLLM nightly específica |
| Qwen/Qwen3-VL-Embedding-8B (base) | 8.148.922.608 | no disponible en la informacion | safetensors bf16 | Apache 2.0 | Hugging Face |
| FP8 W8A8 dinámico (referencia del autor) | 8.148.922.608 | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks estándar para comparar con otros modelos de embeddings multimodales de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- Dependencia estricta de una build concreta de vLLM nightly; versiones estables o anteriores no cargan el modelo.
- Solo probado en SM89 (RTX 6000 Ada). El comportamiento en otras arquitecturas NVIDIA no está documentado.
- El KV cache FP8 en SM89 requiere FlashInfer; con otros backends de atención puede no funcionar.
- La cuantización sin rotación degrada gravemente la calidad: el round-to-nearest simple reduce el recall texto→imagen de 0,68 a 0,03. No es una cuantización intercambiable con otras herramientas.
- La calibración está sesgada hacia ruso (aproximadamente el 85% de las muestras) y un 15% de imágenes de Flickr8k; el rendimiento en otros idiomas o dominios no está evaluado.
- El modelo no genera texto (no tiene `lm_head`): no sirve para tareas generativas, tool calling ni agentes.
- No se documentan sesgos específicos ni tasas de alucinación, pero al ser un modelo de embeddings, los riesgos se trasladan a la recuperación (falsos positivos en similitud).
- Licencia Apache 2.0 permite uso comercial, pero la dependencia de vLLM nightly puede introducir inestabilidad en producción.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado el 2026-11-16: es un artefacto reciente sin validación comunitaria.
- La lista de idiomas soportados no está disponible en la información proporcionada.

## Enlaces

- Hugging Face: https://huggingface.co/shabonasar/qwen3-vl-embedding-8b-w4a8-hadamard-ada
- Modelo base: https://huggingface.co/Qwen/Qwen3-VL-Embedding-8B
- Commit de vLLM probado: https://github.com/vllm-project/vllm/commit/cf5cea2da
- Dataset de calibración RuBQRetrieval: https://huggingface.co/datasets/mteb/RuBQRetrieval
- Dataset de calibración MIRACLReranking: https://huggingface.co/datasets/mteb/MIRACLReranking
- Dataset de calibración Flickr8k: https://huggingface.co/datasets/jxie/flickr8k
