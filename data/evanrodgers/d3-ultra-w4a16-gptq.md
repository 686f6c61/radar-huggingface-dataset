# evanrodgers/d3-ultra-W4A16-GPTQ

## Resumen

d3-ultra-W4A16-GPTQ es una versión cuantizada a INT4 del modelo d3-ultra, publicado por el usuario evanrodgers a partir del checkpoint base vllm-sr/d3-ultra. Se trata de un modelo de decisión multimodal (texto e imagen) orientado a clasificación zero-shot y feature extraction, construido sobre una arquitectura híbrida qwen3_5 con atención completa y atención lineal. La cuantización reduce el peso en disco de 52,2 GB a 16,06 GB manteniendo el torre de visión, el readout FP32 y el comportamiento de decisión del modelo original.

El modelo está pensado para servir como motor de decisión en pipelines de enrutamiento semántico y clasificación, no como un LLM generativo de propósito general. Integra un runtime propio (d3_runtime) y un servidor HTTP (d3_server.py) que viven en el repositorio padre, no en este checkpoint. La cuantización W4A16 es weight-only: las activaciones permanecen en BF16 y la caché KV no se cuantiza.

Su relevancia actual radica en que demuestra que un modelo de 26.000 millones de parámetros puede servirse en una única GPU con 15 GiB de VRAM tras la carga, manteniendo una concordancia top-1 del 96,48% en texto y del 100% en las pruebas de visión respecto al modelo BF16. Es una referencia útil para quienes necesitan desplegar modelos de decisión multimodales con restricciones de memoria severas.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer híbrido (atención completa + atención lineal) con torre de visión, basado en qwen3_5 |
| Parámetros totales | 26.085.330.160 (25,62B texto, 0,46B visión, 1,3M readout FP32) |
| Parámetros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | no disponible (se han medido peticiones de hasta 8.192 tokens) |
| Tipos de cuantización | INT4 weight-only W4A16, compressed-tensors pack-quantized: int4 simétrico, grupo 128, escalas BF16, GPTQ actorder=weight, dampening 0,01, bloque 128 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (un único model.safetensors de 16,06 GB), compressed-tensors |

## Arquitectura y entrenamiento

El modelo base d3-ultra emplea una arquitectura transformer híbrida de 64 capas que combina atención completa con atención lineal, e incorpora un modo de atención propio denominado `prefix_bidir` que no está soportado por la integración estándar de vLLM. Dispone de una torre de visión de 0,46B parámetros y un readout FP32 de 1,3M parámetros que produce las decisiones. El config preserva `text_config.mtp_num_hidden_layers: 1`, pero el release d3-ultra no incluye tensores `mtp.*`; el checkpoint base Qwen/Qwen3.8-27B sí los lleva, mientras que d3 los descarta.

La cuantización se aplicó a 400 proyecciones del decodificador de texto: `mlp.gate/up/down_proj`, `self_attn.q/k/v/o_proj` y `linear_attn.in_proj_qkv/in_proj_z/out_proj`. Se mantuvieron en BF16 la totalidad de la torre `visual.*` (333 tensores copiados bit a bit), `linear_attn.in_proj_a/b`, embeddings, `conv1d`, normas, el readout FP32 y `mtp.*`. La calibración usó 512 prompts del split de validación de `tasksource/tasksource-jev-typed-decisions`, procesados con `d3_runtime.D3.prepare` y la máscara de bloque `prefix_bidir` exacta. Se eligió GPTQ sobre RTN por la profundidad del decodificador (64 capas híbridas) y para preservar el comportamiento de decisión. No se dispone de información sobre el número de tokens de entrenamiento del modelo base ni sobre si hubo RLHF o DPO.

## Capacidades

- Clasificación zero-shot y feature extraction sobre texto e imagen.
- Toma de decisiones tipadas mediante un readout FP32 específico y `decision_config.json`.
- Procesamiento multimodal: acepta peticiones de imagen y vídeo por la misma ruta que el paquete BF16.
- Razonamiento multi-turno con prompts largos (se han medido peticiones de 512, 4.096 y 8.192 tokens).
- Soporte de tool calling y function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible.
- Modo thinking, audio u otras capacidades especiales: no disponible.

## Casos de uso

- Enrutamiento semántico en producción: el modelo puede clasificar peticiones entrantes y decidir a qué motor o ruta derivarlas, aprovechando su naturaleza de decision-model y su readout tipado. Es adecuado porque mantiene el 100% de concordancia top-1 con el BF16 en las pruebas de transferencia.
- Clasificación zero-shot de documentos legales: con 16 pasajes reales de registros judiciales públicos y una pregunta de decisión por petición, el modelo procesa hasta 2.501 tokens/s en lotes de 8 a 512 tokens, lo que permite clasificar lotes documentales en una sola GPU.
- Moderación de contenido multimodal: la torre de visión se conserva bit a bit, de modo que las peticiones de imagen siguen la misma ruta que en el modelo BF16, permitiendo clasificar imágenes y texto combinados sin degradación por cuantización.
- Extracción de características para pipelines de retrieval: el modelo puede actuar como extractor de features en un sistema de búsqueda o clustering, con la ventaja de ocupar solo 14,96 GiB tras la carga frente a los 50,1 GB del BF16.
- Despliegue en hardware con memoria limitada: al caber en una GPU de 64 GB como la NVIDIA CMP 170HX con un pico de 27,55 GiB a 8K/B=8, permite servir un modelo de 26B en entornos donde el BF16 no cabría junto con las activaciones.
- Evaluación de decisiones a gran escala: con 2,4–2,5k tokens/s de techo en una GPU, el modelo sirve para ejecutar campañas de evaluación sobre conjuntos de validación tipados sin necesidad de clústeres multi-GPU.
- Prototipado de asistentes con contexto largo: peticiones de 8.192 tokens a 0,27 req/s en serie y 0,29 req/s en lote de 4 permiten construir asistentes que razonan sobre documentos extensos en una única GPU consumer o de gama profesional.

## Benchmarks y rendimiento

| Métrica | BF16 | W4A16 |
|---|---:|---:|
| VDB core (150 items) | 95,0 (A) | 95,0 (A) |
| VDB transfer (30 items) | 100,0 (A) | 100,0 (A) |
| VDB top-1 agreement | — | 150/150 core, 30/30 transfer |
| Text top-1 agreement (256 filas) | — | 96,48% |
| Memoria GPU tras carga | 50,1 GB | 14,96 GiB |
| Tiempo VDB core | 63 s | 68 s |

Throughput medido en una NVIDIA CMP 170HX (64 GB) con el runtime padre y el cargador packed-int4 `d3q`:

| Prompt | Servidor serie (C=1) | p50 | Mejor lote | req/s | tokens/s |
|---|---:|---:|---|---:|---:|
| 512 tokens | 2,37 req/s, 1.210 tok/s | 422 ms | B=8 | 4,90 | 2.501 |
| 4.096 tokens | 0,54 req/s, 2.191 tok/s | 1,87 s | B=4 | 0,61 | 2.477 |
| 8.192 tokens | 0,27 req/s, 2.248 tok/s | 3,64 s | B=4 | 0,29 | 2.407 |

El techo en una GPU es de aproximadamente 2,4–2,5k tokens/s de entrada. Las peticiones de 512 tokens están dominadas por el desempaquetado de pesos int4 por forward; el batching lo amortiza y casi duplica el throughput. Las de 4K/8K están limitadas por cómputo y el batching aporta poco. La concurrencia no ayuda: `d3_server.py` procesa una petición a la vez y, a C=2/4/8, el throughput se mantiene plano y la latencia p50 crece linealmente (512: 0,84/1,68/3,39 s; 4K: 3,75/7,53/15,08 s; 8K: 7,28/14,56/29,12 s).

## Requisitos de hardware

- VRAM estimada tras la carga: 14,96 GiB; pico de 15,41 GiB en una petición de 225 tokens.
- Pico medido de 27,55 GiB a 8K/B=8 (15 GB de pesos empaquetados más activaciones).
- GPU recomendadas: NVIDIA CMP 170HX (64 GB) es la plataforma de referencia de las mediciones; cualquier GPU con al menos 28 GiB disponibles para el pico a 8K/B=8.
- Cabe en GPU consumer de gama alta con 24 GB solo para cargas de contexto corto; para 8K/B=8 se necesita más de 28 GiB.
- Opciones de despliegue: el runtime propio del modelo padre vllm-sr/d3-ultra, el modo Engine de vLLM Semantic Router (mantiene los pesos int4 empaquetados) o el cargador packed-int4 `d3q`. Cargar el checkpoint compressed-tensors directamente con transformers lo descomprime a BF16 y vuelve a necesitar los 52 GB.
- vLLM estándar no sirve este checkpoint: su integración de Decision 3.0 acepta `causal` y `noncausal_full_attention`, pero no `prefix_bidir`, y `vllm serve` falla con `unsupported decision_config.json attention_mode 'prefix_bidir'`. Afecta también al BF16; se necesita un build con el PR #62584 de vLLM.
- Latencia y throughput: 422 ms p50 a 512 tokens en serie; 2.501 tokens/s en lote de 8 a 512 tokens; 2.407 tokens/s en lote de 4 a 8K.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| d3-ultra-W4A16-GPTQ | 26,09B | no disponible | INT4 W4A16 GPTQ | Apache 2.0 | Hugging Face, 152 descargas |
| vllm-sr/d3-ultra (BF16) | 26,09B | no disponible | BF16 | Apache 2.0 | Hugging Face (modelo base) |
| Qwen/Qwen3.8-27B | ~27B | no disponible | BF16 | no disponible | Hugging Face (checkpoint base con tensores MTP) |

No se dispone de datos de benchmarks de los modelos comparables en la información proporcionada, por lo que la comparación se limita a parámetros, formato y licencia.

## Limitaciones y advertencias

- La cuantización es weight-only: las activaciones se mantienen en BF16 y la caché KV no se cuantiza, por lo que el ahorro de memoria se limita a los pesos.
- El rendimiento en texto no es idéntico al BF16: la concordancia top-1 es del 96,48% en 256 filas, lo que implica un 3,52% de discrepancias en las decisiones.
- El servidor `d3_server.py` procesa una petición a la vez; la concurrencia no mejora el throughput y dispara la latencia linealmente.
- vLLM estándar no soporta el modo `prefix_bidir`; reescribir el modo de atención altera la máscara y las respuestas.
- Cargar con transformers descomprime a BF16 y requiere de nuevo los 52 GB, lo que anula la ventaja de la cuantización.
- El release no incluye tensores `mtp.*`; el config preserva `mtp_num_hidden_layers: 1` pero no hay pesos MTP que cuantizar.
- No hay información sobre sesgos, idiomas soportados ni riesgos de alucinación específicos del modelo base.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base y sus dependencias de runtime deben verificarse por separado.
- El modelo está orientado a decisión y clasificación, no a generación de texto libre; su uso como LLM conversacional no está documentado.

## Enlaces

- Hugging Face: https://huggingface.co/evanrodgers/d3-ultra-W4A16-GPTQ
- Modelo base: https://huggingface.co/vllm-sr/d3-ultra
- PR de vLLM para soporte de `prefix_bidir`: https://github.com/vllm-project/vllm/pull/62584
- Dataset de calibración: https://huggingface.co/datasets/tasksource/tasksource-jev-typed-decisions
