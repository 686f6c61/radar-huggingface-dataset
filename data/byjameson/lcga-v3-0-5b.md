# byjameson/lcga-v3-0.5b

## Resumen

LCGA v3 0.5b es un checkpoint de investigación publicado por byjameson que implementa atención dispersa por bloques aprendible (learnable block-sparse attention) sobre un Qwen2.5-0.5B congelado. No es un modelo nuevo entrenado desde cero ni un modelo conversacional: el repositorio de HuggingFace solo contiene el router de conceptos y los pesos LoRA (19,1 MB en `v3_best.pt`); los pesos base de Qwen2.5-0.5B no se distribuyen y deben descargarse aparte. El problema que aborda es el coste cuadrático O(N²) de la atención densa, sustituyéndolo por una ruta que selecciona los bloques de clave/valor más relevantes antes de aplicar softmax exacto sobre ellos.

El mecanismo se apoya en un router de grafo de conceptos latente con K=64 embeddings de concepto aprendibles, que puntúa la secuencia y agrega esas probabilidades en puntuaciones por bloque; en cada capa se retienen los `top-M` bloques, con `M = round(rho * n_blocks)` y `rho=0.25` por defecto, y el bloque es de 64 tokens. Sobre los bloques seleccionados se calcula atención softmax exacta, es decir, no hay aproximación dentro de la propia atención, solo poda del conjunto de claves. La causalidad se mantiene a nivel de slot (`kpos <= qpos`) en todas las rutas.

La relevancia actual del checkpoint es doble. Por un lado, documenta con evidencia reproducible un resultado negativo interesante: en modelado de lenguaje puro el router aprendido degenera en un prior de posición y no supera a una ventana estática con el mismo presupuesto de bloques. Por otro, mide ganancias reales de velocidad en prefill y decode a partir de contextos de 4k-16k, lo que lo convierte en material útil para quien investigue atención dispersa, routing aprendido o eficiencia en GPUs de gama baja.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen2.5-0.5B congelado) con ruta de atención block-sparse aprendible: router de grafo de conceptos latente + atención softmax exacta sobre bloques seleccionados |
| Parametros totales | 0,5B en el modelo base (congelado, no incluido en el repo); el checkpoint distribuido contiene únicamente router + LoRA (19,1 MB) |
| Parametros activos | No aplica (no es MoE); el checkpoint disperso no reduce parámetros, reduce el conjunto de K/V atendido |
| Longitud de contexto | No disponible en la información proporcionada. El checkpoint se entrena y evalúa con T=1024; el modelo base Qwen2.5-0.5B declara una ventana nativa de 32.768 tokens según su propia model card |
| Tipos de cuantizacion | No disponible. El entrenamiento y la evaluación se realizan en fp16; no se publican pesos cuantizados |
| Idiomas soportados | Inglés (`en`) |
| Licencia | Apache-2.0 (el modelo base Qwen2.5-0.5B también es Apache-2.0) |
| Formato de pesos | Checkpoint PyTorch `.pt` (state dict con router por capa + LoRA, 19,1 MB). Los pesos base en safetensors no están incluidos en el repositorio |

Parámetros de configuración relevantes: `block=64`, `n_concepts=64`, `graph_rank=16`, `budget (rho)=0.25`, `lora r_attn=16`, `lora r_mlp=0`. Tamaño total del repositorio: 0,1 GB. Librería declarada: `lcga`.

## Arquitectura y entrenamiento

LCGA sustituye la atención densa O(N²) por una ruta dispersa aprendida en tres pasos. Primero, un router de concepto latente puntúa la secuencia usando K=64 embeddings de concepto aprendibles (`lcsa/concepts.py`). Segundo, esas probabilidades de concepto se agregan en puntuaciones por bloque y se seleccionan los `top-M` bloques por capa, con `M = round(rho * n_blocks)` y `rho=0.25` por defecto, sobre bloques de 64 tokens. Tercero, se calcula atención softmax exacta únicamente sobre las K/V de los bloques seleccionados; no hay aproximación dentro del softmax. La semántica de causalidad a nivel de slot (`kpos <= qpos`) se respeta en todas las rutas, y existe un modo denso de control para ablaciones.

El entrenamiento parte de Qwen2.5-0.5B congelado en fp16 y usa wikitext-2 con T=1024. La versión 1 entrenaba solo el router; las versiones 2 y 3 añaden LoRA y optimizan una combinación de pérdidas LM + KL + MSE + recall-gain. La diferencia entre v2 y v3 es únicamente la tasa de aprendizaje de LoRA (de 1e-3 a 1e-4), lo que según el autor corrigió en gran medida el olvido fuera de dominio. El stage v3 se entrenó durante 1250 pasos con `lr_lora=1e-4`, sobre una única GPU de portátil de 6 GB y batch=1. Un análisis de atribución sobre v2 estima que aproximadamente el 83 % de la mejora procede de la adaptación LoRA genérica y solo el 17 % es específica de la dispersión (ablación `dense_control`).

## Capacidades

- Generación de texto autoregresiva en inglés para modelado de lenguaje puro (continuación de texto, cálculo de perplejidad).
- Atención dispersa con presupuesto de bloques configurable (`rho`), con rutas densa y dispersa conmutables mediante `set_sparse_enabled`.
- Selección de bloques por capa mediante router de conceptos, con `graph_rank` y `rel_bias` configurables.
- Evaluación reproducible de perplejidad en WikiText-2 y en un probe OOD (TinyStories).
- Soporte de decodificación con CUDA graphs de paso completo, con paridad bit a bit frente a la ruta densa.
- No dispone de tool calling ni function calling documentado.
- No dispone de modo agente, multi-step reasoning ni thinking mode documentado.
- Sin capacidades de visión, audio ni multimodalidad.
- Multilingüismo: únicamente inglés; el entrenamiento se limita a wikitext-2 (y un probe en TinyStories).

## Casos de uso

- Investigación en atención dispersa: reproducir las ablaciones del repositorio (v1, v2, v2ctl, v3) y medir el efecto del router frente a una ventana estática con el mismo presupuesto de bloques. Es el uso principal para el que se publica el checkpoint.
- Estudio de routing aprendido en transformers: analizar por qué el router degenera en un prior de posición (solo el 1,7 / 6,0 / 7,0 / 6,7 % de los bloques seleccionados son de contenido a 1k / 4k / 8k / 16k) y probar variantes de pérdida o inicialización.
- Evaluación de eficiencia en prefill: medir el punto de cruce de velocidad (aproximadamente 5k tokens) y la ganancia de 1,25× frente a denso a 16k con router CUDA-graph en una GPU de 6 GB, sin necesidad de hardware de datacenter.
- Benchmarking de recuperación en contexto largo: el autor reporta experimentos needle a 8k con presupuesto del 25 %, donde el modelo denso responde con exactitud 1.00 y cross-entropy 0,14-0,39; sirve como banco de pruebas para comparar estrategias de poda.
- Base para fine-tuning de investigación: al mantener los pesos de Qwen congelados y entrenar solo router + LoRA, permite iterar sobre el mecanismo de atención con un coste de cómputo muy bajo (un checkpoint de 19,1 MB por ejecución).
- Docencia y divulgación técnica: ilustra de forma tangible el compromiso entre presupuesto de sparsity y calidad (la brecha frente a denso cae del +45 % a 1k al +11 % a 16k con el mismo 25 % de bloques).
- Prototipado de sistemas de entrenamiento con memoria limitada: combinado con el trainer en streaming del mismo autor (`stream-finetune`), sirve para validar recetas de entrenamiento en GPUs de 6 GB.

## Benchmarks y rendimiento

Perplejidad medida por el autor (menor es mejor):

| Evaluación | Configuración | Denso (base) | LCGA v3 disperso | Diferencia |
|---|---|---|---|---|
| WikiText-2 test | T=1024, rho=0.25, 128 chunks | 12,46 | 16,56 | +33,1 % |
| TinyStories valid (OOD) | probe único | 6,09 | 9,16 | +50,4 % |
| WikiText-2 test, v1 | T=1024 | 14,30 | 21,84 | +52,7 % |
| WikiText-2 test, v2 | T=1024 | 12,88 | 16,73 | +29,9 % |
| WikiText-2 test, v2ctl | T=1024 | 12,80 | 17,26 | +34,8 % |

Comparación del router aprendido frente a ventana estática con presupuesto idéntico (25 % de bloques), según las mediciones corregidas del 25 de octubre de 2026:

| Longitud | PPL router aprendido | PPL ventana estática | Bloques de contenido seleccionados |
|---|---|---|---|
| 1k | 25,166 | 25,051 | 1,7 % |
| 4k | 13,788 | 13,783 | 6,0 % |
| 8k | 12,176 | 12,160 | 7,0 % |
| 16k | 12,001 | 11,868 | 6,7 % |

El router aprendido es entre 0,005 y 0,133 PPL peor que la ventana estática en todas las longitudes. La brecha frente a atención densa cae del +45 % a 1k al +11 % a 16k con presupuesto fijo del 25 % de bloques.

Rendimiento de sistema:

| Eje | Resultado |
|---|---|
| Prefill | Punto de cruce en ~5k tokens; 1,25× más rápido que denso a 16k (router con CUDA graph) |
| Decode (CUDA graph de paso completo) | Paridad bit a bit con denso; ruta dispersa 1,12-1,27× más rápida que densa a 4k-8k |
| Retrieval needle @8k, 25 % | Denso: exactitud 1.00, CE 0,14-0,39. Resultado disperso: no disponible (dato truncado en la información) |
| Atribución de mejora (v2) | ~83 % adaptación LoRA genérica, ~17 % específica de sparsity |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- Los pesos del modelo base en fp16 ocupan aproximadamente 1 GB; el checkpoint adicional (router + LoRA) son 19,1 MB. Con T=1024 y batch=1, el pico de VRAM estimado se sitúa en el rango de 2-4 GB, aunque la cifra exacta no se reporta en la información disponible.
- Todo el trabajo del autor se ejecutó en una única GPU de portátil de 6 GB, batch=1, fp16. Cabe por tanto en GPUs de consumo con 6 GB o más (gama GTX 1660/RTX 3060 y superiores); no se especifica el modelo exacto de GPU utilizada.
- Para prefill a 16k con ganancias de velocidad se requiere soporte de CUDA graphs; sin él, la ruta dispersa no aporta la mejora de 1,25×.
- Opciones de despliegue: no compatible con vLLM, llama.cpp, Ollama ni TGI de forma nativa. Requiere el paquete `lcsa` del repositorio de GitHub, con `load_model`, `patch_model`, `apply_lora` y `set_sparse_enabled`, más la copia manual del state dict en cada capa de atención (ver `experiments/exp3_eval.py:load_ckpt()`).
- Latencia y throughput absolutos (tokens/s): no disponible. Solo se publican ratios relativos frente a la ruta densa.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | PPL WikiText-2 (T=1024) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LCGA v3 0.5b (este) | 0,5B base congelado + router/LoRA | T=1024 en entrenamiento; ventana nativa del base 32.768 | 16,56 (disperso, rho=0.25) | Apache-2.0 | Checkpoint de router/LoRA en HF + código en GitHub |
| Qwen2.5-0.5B denso | 0,5B | 32.768 (según model card del base) | 12,46 | Apache-2.0 | Pesos completos en HF, ecosistema amplio |
| LCGA con ventana estática (baseline interno) | 0,5B + ventana fija al 25 % | T=1024 | 25,051 (1k) / 11,868 (16k) | Apache-2.0 | Solo como ablación en los informes del autor |
| LCGA v2 0.5b | 0,5B + router/LoRA | T=1024 | 16,73 (disperso) | Apache-2.0 | Checkpoint previo del mismo autor |

No se dispone en la información proporcionada de comparaciones con otros modelos de 0,5B (por ejemplo, variantes de SmolLM, Qwen2.5-1.5B o modelos con atención dispersa de otros autores), por lo que la comparativa se limita a las rutas densa, estática y v2 del mismo trabajo.

## Limitaciones y advertencias

- No es un modelo de instrucciones ni de chat: es un checkpoint de modelado de lenguaje. No se debe esperar seguimiento de instrucciones, formato conversacional ni alineación tipo RLHF/DPO.
- La calidad en la ruta dispersa es peor que la densa en todas las mediciones publicadas: +33 % de perplejidad en WikiText-2 y +50 % en el probe OOD de TinyStories. El autor rechaza explícitamente cualquier afirmación de "calidad densa a una fracción del coste".
- El router aprendido no aporta nada sobre una ventana estática con el mismo presupuesto en modelado de lenguaje; se comporta como un prior de posición. Solo entre el 1,7 % y el 7,0 % de los bloques seleccionados son de contenido.
- El entrenamiento se limita a wikitext-2 en inglés, con T=1024 y 1250 pasos. La generalización fuera de ese dominio está respaldada por un único probe (TinyStories), insuficiente para afirmar que el modelo "no olvida".
- El checkpoint depende de código personalizado (`lcsa`) no publicado en PyPI ni integrado en frameworks estándar; sin ese paquete el modelo no es utilizable.
- Los pesos base no están incluidos: hay que descargar Qwen2.5-0.5B por separado y aceptar sus términos.
- Riesgo de alucinación: no evaluado en la información disponible; al ser un LM base de 0,5B entrenado sobre un corpus enciclopédico pequeño, la generación libre tenderá a divagar y a reproducir patrones de WikiText.
- Sin soporte multilingüe más allá del inglés; el castellano no está contemplado en el entrenamiento.
- Licencia Apache-2.0 permite uso comercial, pero el estado de investigación, la falta de benchmarks de tareas y el gap de calidad frente a denso desaconsejan cualquier despliegue en producción.
- Las cifras de la sección de hallazgos del 25 de octubre de 2026 corrigen una nota anterior que reportaba selección del 0,0 % de bloques de contenido; esa medición previa era errónea por evaluar un router sin inicializar.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/byjameson/lcga-v3-0.5b
- Código, informes y evidencia cruda (`results/results.jsonl`): https://github.com/byjameson/lcga-local
- Informe principal en turco (`RAPOR.md`): https://github.com/byjameson/lcga-local/blob/main/RAPOR.md
- Trainer en streaming (32B en 6 GB) y guía: https://github.com/byjameson/stream-finetune
- Artículo de lanzamiento en dev.to: https://dev.to/mycute_97b39c4e34027570f9/running-a-4b-model-in-6-gb-and-training-3b-parameters-on-a-laptop-4al
- Blog hub de Pro Signal Studio: https://prosignalstudio.blogspot.com/2026/10/meet-pro-signal-studio-12-android-apps.html
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-0.5B
