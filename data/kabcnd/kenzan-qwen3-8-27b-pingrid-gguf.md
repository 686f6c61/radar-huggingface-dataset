# kabcnd/Kenzan-Qwen3.8-27B-PinGrid-GGUF

## Resumen

Kenzan-Qwen3.8-27B-PinGrid-GGUF es una cuantización GGUF del modelo denso Qwen/Qwen3.8-27B (26.895.998.464 parámetros totales), publicada por el usuario kabcnd bajo licencia Apache 2.0. No se trata de un modelo nuevo entrenado desde cero, sino de un repack cuantizado con una receta propia de precisión mixta denominada "Pin-Grid", orientada a ejecutar un modelo de 27B en máquinas Apple Silicon con 16 GB de memoria unificada (el autor cita un Mac mini M6) y en GPUs de consumo con 12–16 GB de VRAM.

La aportación técnica principal es la asignación quirúrgica de tipos de cuantización según la sensibilidad L2 de la matriz de importancia (`imatrix`): el backbone de atención y las capas Gated DeltaNet se mantienen en Q4_0, las capas medias-tardías (`blk.36..57`) suben a IQ2_XS y los anclajes de la cola (`blk.58..63`) se colocan en Q4_0/Q5_K/Q6_K, con el head de salida en Q8_0 y los embeddings en Q6_K. El resultado es un fichero de 10,77 GiB a 3,39 BPW que, según el autor, alcanza una perplejidad WikiText-2 de 8,4997 frente a 9,6249 de su build anterior de 6,42 GiB.

El modelo base emplea una arquitectura híbrida de 64 capas que combina atención con DeltaNet con compuertas (Gated DeltaNet), identificada en llama.cpp como arquitectura `qwen35`. La relevancia de esta ficha radica en que demuestra que es posible mantener la precisión de un 27B denso en el umbral de los 16 GB sin recurrir a kernels ternarios personalizados, usando únicamente tipos GGUF estándar compatibles con llama.cpp, Ollama y LM Studio.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer híbrido con 64 capas DeltaNet/Attention (Gated DeltaNet), identificador `qwen35` en llama.cpp |
| Parámetros totales | 26.895.998.464 (≈26,9B) |
| Parámetros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | Hasta 32.768 tokens recomendado por el autor en 16 GB; el modelo base soporta ventanas mayores (valor exacto no disponible) |
| Tipos de cuantización | IQ2_XXS, IQ2_XS, IQ3_XXS, Q4_0, Q4_K, Q5_K, Q6_K, Q8_0 (mezcla por tensor); fichero principal a 3,39 BPW |
| Idiomas soportados | Inglés, ruso y multilingüe (vocabulario de 248.320 tokens) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (fichero `Kenzan-Qwen3.8-27B-PinGrid-IQ2_XXS-M6-16G.gguf`, 10,77 GiB) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B es un transformer denso de 64 capas que intercala mecanismos de atención clásica con capas Gated DeltaNet (una variante de atención lineal con estado recurrente y compuertas). Esta hibridación reduce el coste de memoria de la caché KV en contextos largos, algo especialmente relevante en la receta de despliegue del autor, que combina Flash Attention con caché KV cuantizada a q4_0. El checkpoint incluye una capa MTP (Multi-Token Prediction) en `blk.64`, que el autor poda durante la cuantización.

No se dispone de información sobre el dataset de entrenamiento del modelo base (número de tokens, composición, fases de RLHF/DPO) en la documentación proporcionada. Lo que sí está documentado es el proceso de cuantización: se parte de pesos nativos Q8_0 y se aplica una matriz de importancia de `unsloth/Qwen3.8-27B-GGUF` calibrada sobre 496 tensores y 1251 chunks. La innovación destacable es el parcheo de la cabecera GGUF (`qwen35.nextn_predict_layers = 0`): la poda de la capa MTP con `--prune-layers 64` deja el flag a 1 en la salida cruda de `llama-quantize`, lo que provoca que llama.cpp malinterprete `blk.63` como capa NextN y omita su FFN, degradando la perplejidad hasta 24,86. El GGUF publicado corrige ese flag directamente en la cabecera, de modo que funciona sin `--override-kv`.

## Capacidades

- Generación de texto conversacional multi-turno en inglés, ruso y otros idiomas cubiertos por el vocabulario multilingüe.
- Razonamiento y generación de código; el autor documenta pruebas en vivo con C++17.
- Soporte de decodificación especulativa mediante `ngram-map-k` en llama.cpp (parámetros `n=3, m=4`, hasta 3 tokens de borrador).
- Compatibilidad con plantillas de chat vía `--jinja` en llama-server.
- Ejecución nativa con Flash Attention y caché KV cuantizada (q4_0) en Metal y en backends estándar de llama.cpp.
- Compatibilidad declarada con endpoints (tag `endpoints_compatible`), lo que permite servirlo tras una API compatible con OpenAI.
- Capacidades del modelo base no documentadas en esta ficha (tool calling, visión, modo thinking): no disponible.

## Casos de uso

- Asistente conversacional local en Mac de 16 GB: el fichero de 10,77 GiB y la caché KV a q4_0 permiten mantener sesiones de hasta 32K tokens sin swapping, con un consumo medido de 12,01 GiB de RSS en llama-server.
- Generación y revisión de código en C++17 sobre estación de trabajo sin GPU dedicada: el autor valida el modelo con prompts de código en ruso e inglés a 11,25 t/s de generación y 118,40 t/s de evaluación de prompt.
- Procesamiento de documentación técnica multilingüe (inglés/ruso): el vocabulario de 248.320 tokens y los embeddings en Q6_K preservan la cobertura léxica en ruso, un punto débil habitual en cuantizaciones agresivas.
- Servicio de inferencia en GPUs de consumo de 12–16 GB (RTX 4070 Ti, 4080, 3090): el autor declara compatibilidad directa con llama.cpp estándar, sin kernels personalizados.
- Prototipado de pipelines con decodificación especulativa: la combinación de `ngram-map-k` con llama-server permite experimentar con aceleración de generación sin cambiar de modelo.
- Despliegue en Ollama o LM Studio para equipos de desarrollo: al usar tipos GGUF estándar (IQ2_XXS, Q4_K, Q5_K, Q8_0), el modelo se carga sin pasos de conversión adicionales.
- Evaluación comparativa de recetas de cuantización: el autor publica la tabla de tipos por tensor (`recipes/tensor_types_c3.txt`), lo que sirve como referencia reproducible para estudiar el impacto de la precisión mixta en modelos híbridos.

## Benchmarks y rendimiento

Datos medidos por el autor en un Apple Mac mini M6 con 16 GB de memoria unificada, Metal y caché KV q4_0, sobre `wt2_128k.txt` (`-c 2048 --chunks 14 -ctk q4_0 -ctv q4_0 -fa 1 -ngl 99`) y `llama-bench` (`-p 512 -n 128 -r 3`):

| Modelo | Tamaño | PPL (wt2, c=2048) | pp512 (t/s) | tg128 (t/s) | Notas |
|---|---|---|---|---|---|
| Kenzan-Qwen3.8-27B-Abliterated-Core16-Q4_1 (baseline) | 6,42 GiB | 9,6249 ± 0,22173 | 225,61 | 16,42 | Base 1-bit PTQ1_0 |
| Kenzan-Qwen3.8-27B-PinGrid-IQ2_XXS-M6-16G (esta release) | 10,77 GiB | 8,4997 ± 0,19278 | 248,52 | 11,31 | -1,1252 PPL frente al baseline |

Prueba en vivo con `llama-server` (`ngram-map-k` con `n=3, m=4`, ruso + C++17): 11,25 t/s de generación, 118,40 t/s de evaluación de prompt, 55 de 198 tokens de borrador aceptados y 12,01 GiB de RSS sin swapping.

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM/RAM estimada: 10,77 GiB para los pesos más la caché KV; el autor reporta 12,01 GiB de RSS en inferencia real con contexto moderado.
- Apple Silicon: validado en Mac mini M6 con 16 GB de memoria unificada; el autor recomienda mantener `-c` entre 8192 y 32768 con `--cache-type-k q4_0 --cache-type-v q4_0` para no superar el límite de working set de Metal (~15 GB).
- GPUs de consumo: el autor declara compatibilidad con RTX 4070 Ti, RTX 4080 y RTX 3090 (12–16 GB de VRAM).
- GPUs de datacenter (A100, H100): no mencionadas en la documentación; el modelo está pensado para hardware de gama consumer y Apple Silicon.
- Opciones de despliegue: llama.cpp (upstream, arquitectura `qwen35`), llama-server con `--jinja` y decodificación especulativa `ngram-map-k`, Ollama y LM Studio (compatibilidad "stock" declarada por el autor).
- Throughput medido: 248,52 t/s en prefill (pp512) y 11,31 t/s en generación (tg128) en Mac mini M6; 11,25 t/s de generación y 118,40 t/s de prompt eval en llama-server con especulación activa.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | PPL (wt2) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Kenzan-Qwen3.8-27B-PinGrid-IQ2_XXS (esta release) | 26,9B densos | hasta 32K recomendado en 16 GB | 8,4997 | Apache 2.0 | GGUF en Hugging Face |
| Kenzan-Qwen3.8-27B-Abliterated-Core16-Q4_1 | 26,9B densos | no disponible | 9,6249 | Apache 2.0 | GGUF (build previa del mismo autor) |
| Qwen/Qwen3.8-27B (modelo base) | 26,9B densos | no disponible | no disponible | Apache 2.0 | Pesos originales en Hugging Face |
| Otras cuantizaciones GGUF de Qwen3.8-27B (p. ej. unsloth) | 26,9B densos | no disponible | no disponible | Apache 2.0 | GGUF en Hugging Face |

La comparativa se limita a variantes del mismo modelo base porque la documentación proporcionada no incluye datos de rendimiento de modelos competidores de tamaño similar.

## Limitaciones y advertencias

- La cuantización IQ2_XXS en el rango `blk.1..35` introduce pérdida de precisión inevitable; el propio autor cuantifica la degradación en términos de PPL, pero no documenta su impacto en tareas de razonamiento o código.
- El modelo está optimizado y validado para Apple Silicon de 16 GB; el rendimiento en otras plataformas (CUDA, ROCm) no está medido en la documentación.
- La receta de cuantización depende de la matriz de importancia de `unsloth`; cambios en esa matriz o en la versión de llama.cpp pueden alterar los resultados.
- Riesgo de alucinación: no evaluado ni documentado por el autor.
- Sesgos conocidos: no documentados.
- Idiomas: cobertura declarada para inglés, ruso y multilingüe; no hay evaluación por idioma más allá del vocabulario.
- Licencia Apache 2.0 permite uso comercial, pero el modelo base Qwen3.8-27B debe verificarse contra sus propios términos antes de producción.
- El autor advierte de un bug de cabecera en cuantizaciones crudas de este modelo (`nextn_predict_layers`); usar otras builds sin el parche puede degradar la PPL hasta 24,86.
- Contexto efectivo limitado en la práctica por la memoria: en 16 GB el autor recomienda no superar 32K tokens incluso con caché KV a 4 bits.
- El repositorio tiene 0 likes y 882 descargas en el momento de la consulta; se trata de una publicación de un autor individual, no de un equipo de investigación, lo que reduce la validación externa.

## Enlaces

- Hugging Face: https://huggingface.co/kabcnd/Kenzan-Qwen3.8-27B-PinGrid-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Matriz de importancia utilizada: https://huggingface.co/unsloth/Qwen3.8-27B-GGUF
- Ko-fi del autor: https://ko-fi.com/kabcpc
- llama.cpp (arquitectura `qwen35`): no disponible en la información proporcionada
