# MatterWaveAI/grt-30m

## Resumen

GRT-30M es un checkpoint de investigacion de tipo base, desarrollado por MatterWaveAI, que implementa una arquitectura denominada Geometric Rotation Transformer (`GRTForCausalLM`). El modelo se obtiene mediante destilacion de conocimiento a partir de Qwen 3 en una unica ejecucion de 24 horas sobre 8 GPU NVIDIA A100-SXM4-80GB, procesando 10.790 millones de tokens a una tasa sostenida de aproximadamente 123.900 tokens por segundo. Su proposito no es competir como asistente de produccion, sino demostrar que una columna vertebral de transformer puramente rotacional puede destilarse de forma estable desde un modelo mayor.

La innovacion central consiste en sustituir cada proyeccion lineal densa de la atencion (Q, K, V, O) y del bloque feed-forward (expand, contract) por cascadas de rotaciones de Givens 2x2 sobre SO(D), moduladas por contenido e intercaladas con permutaciones de tipo butterfly. El resultado es una columna vertebral de solo 9,74 millones de parametros no de embedding distribuidos en 12 bloques, con un total de 29,31 millones de parametros almacenados, de los cuales 19,57 millones corresponden a la tabla de embeddings ligada al vocabulario BPE de Qwen 3 de 151.669 tokens.

Es relevante ahora por dos motivos. Primero, ofrece paridad de generacion greedy token a token verificada en cuatro backends distintos (PyTorch ROCm, llama.cpp CPU AVX2, llama.cpp Vulkan y llama.cpp ROCm), lo que es un resultado poco habitual en modelos de investigacion pequenos. Segundo, sirve como referencia reproducible para estudiar destilacion token-alineada, optimizadores factorizados para matrices de acoplamiento 2D y despliegue en hardware consumer AMD Strix Halo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `GRTForCausalLM` (Geometric Rotation Transformer, transformer causal con rotaciones de Givens) |
| Parametros totales | 29.844.597 (29,84 M); 29.305.498 almacenados segun model card |
| Parametros activos | no disponible (no es MoE) |
| Parametros no-embedding | 9.740.197 (9,74 M) en 12 bloques |
| Parametros equivalentes densos | 55.680.446 (55,68 M) |
| Longitud de contexto | 2.048 tokens (`max_position_embeddings`) |
| Tipos de cuantizacion | GGUF F32 (`grt-30m-f32.gguf`); otros tipos no disponibles |
| Idiomas soportados | ingles (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (`model.safetensors`, 116 MB), GGUF (`grt-30m-f32.gguf`, 340 MB) |
| `hidden_size` (`d_model`) | 256 |
| `num_hidden_layers` | 12 |
| `num_attention_heads` | 4 (`head_dim` = 64) |
| `intermediate_size` (`d_ff`) | 1.024 |
| Rotaciones (`qkv` / `mixer` / `ffn`) | 11 / 1 / 21 |
| Vocabulario | 151.669 (BPE de Qwen 3, cabeza coseno polar ligada) |
| Tamano del repo | 0,5 GB |

## Arquitectura y entrenamiento

La arquitectura `GRTForCausalLM` (variante `grt30m_kd`) es un transformer causal en el que todas las proyecciones lineales densas se reemplazan por productos de rotaciones de Givens 2x2 sobre el grupo especial ortogonal SO(D). Cada bloque aplica 11 rotaciones en el camino QKV, 1 rotacion en el mixer y 21 rotaciones en el feed-forward, con permutaciones butterfly intercaladas y modulacion dependiente del contenido. La cabeza de salida es un embedding polar ligado que representa cada token mediante un vector de `phase_angles` de forma [151669, 128] mas un `log_magnitude` de forma [151669], lo que explica que el 66,8% de los pesos almacenados corresponda al vocabulario y no a la columna vertebral.

El entrenamiento consistio en una destilacion token-alineada desde Qwen 3 con el vocabulario BPE completo de 151.669 tokens. El corpus mezclo `fineweb-edu` (45%), `cosmopedia-v2` (20%), `wikipedia` (15%), `finemath` (12%) y `stack-edu` (8%). Se ejecuto durante 86.969 segundos (24,0 horas) en 8x A100-SXM4-80GB con DDP y kernels CUDA fusionados de Givens, con un batch global de 524.288 tokens por paso (micro-batch 32, acumulacion 1, longitud de secuencia 2.048), 20.580 pasos y 10.789.404.672 tokens totales. El optimizador fue `PairAdam`, con momentos de segundo orden factorizados para las matrices de acoplamiento 2D y recorte angular en los pasos, programacion WSD con pico de learning rate 1e-3 y un throughput sostenido de 123.900 tok/s sin NaN ni picos de gradiente. El resultado final fue `val_loss` = 4,4776 y `val_ppl` = 88,02 sobre FineWeb-Edu, con una precision top-1 de token del 27,20% sobre el vocabulario completo. No se menciona RLHF ni DPO; es un checkpoint base, no un asistente instruido.

## Capacidades

- Generacion de texto causal autoregresiva en ingles, como modelo base sin ajuste de instrucciones.
- Razonamiento de nivel basico emergente: supera el azar en 6 de 7 benchmarks zero-shot de eleccion multiple.
- Aritmetica basica: la variante curriculum reporta 99,20% de precision en verificacion 4-way de GSM8K, aunque este checkpoint base no dispone de esa cifra.
- Soporte de tool calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: limitadas al ingles; el tokenizador es el de Qwen 3 pero no se declara entrenamiento multilingue.
- Capacidades especiales: ninguna modalidad adicional (sin vision ni audio); no dispone de modo thinking.
- Inferencia determinista verificada en cuatro backends con paridad greedy exacta.

## Casos de uso

- Investigacion en arquitecturas alternativas: el modelo sirve como banco de pruebas reproducible para estudiar si las rotaciones de Givens pueden sustituir a las proyecciones densas en un transformer causal, con configuracion y curvas de entrenamiento publicadas.
- Destilacion token-alineada: al compartir el vocabulario completo de Qwen 3, permite experimentar con tecnicas de destilacion directa token a token sin remapeo de vocabulario, comparando perdida y perplejidad frente al profesor.
- Validacion de portabilidad entre backends: la paridad greedy exacta en PyTorch ROCm, llama.cpp CPU, Vulkan y ROCm lo convierte en un caso de prueba util para verificar implementaciones de kernels o de cuantizacion.
- Desarrollo de kernels fusionados: los kernels HIP y CUDA de rotaciones de Givens publicados con el modelo pueden reutilizarse y medirse en hardware consumer, como el Ryzen AI Max+ 395 con `gfx1151`.
- Educacion y docencia: su tamano reducido (116 MB en safetensors, 340 MB en GGUF F32) y su licencia Apache 2.0 permiten desplegarlo en portatiles para ilustrar el funcionamiento interno de un transformer sin infraestructura dedicada.
- Pruebas de humo en pipelines de despliegue: sirve para validar cadenas de conversion a GGUF, carga en llama.cpp y ejecucion en Vulkan o ROCm antes de mover modelos mayores, gracias a su bajo coste computacional.
- Estudio de optimizadores: la implementacion de `PairAdam` con momentos factorizados y recorte angular puede evaluarse en tareas de ajuste fino sobre este checkpoint como base.

## Benchmarks y rendimiento

Resultados zero-shot de eleccion multiple reportados en la model card (checkpoint base):

| Benchmark | GRT-30M | Azar (referencia) |
|---|---|---|
| ARC-Easy | 29,50% | ~25% |
| HellaSwag | 29,20% | ~25% |
| OpenBookQA | 28,40% | ~25% |
| CommonsenseQA | 21,70% | ~20% |
| BoolQ | 51,53% | ~50% |
| QNLI | 51,50% | ~50% |

Metricas de validacion y rendimiento:

| Metrica | Valor |
|---|---|
| `val_loss` (FineWeb-Edu) | 4,4776 |
| `val_ppl` (FineWeb-Edu) | 88,02 |
| Precision top-1 de token | 27,20% |
| Throughput de entrenamiento | 123.900 tok/s (8x A100-80GB) |
| Prefill (Vulkan, Strix Halo) | 3.790 tok/s |
| Decode (CPU, 16 hilos, FP32) | 87,4 tok/s |
| Forward BF16 con kernels HIP fusionados | 5.760 tok/s |

La model card indica que el modelo iguala a modelos densos de capacidad de columna vertebral comparable (`Pythia-14M` / `Pythia-31M`), pero no se aportan las cifras concretas de esos modelos en la informacion disponible. La variante `grt-30m-curriculum` reporta 48,07% de media macro en 9 tareas de SLM-Bench, 99,20% en verificacion 4-way de GSM8K y perplejidad de 7,60 en GSM8K; no son resultados de este checkpoint.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en FP32 para los pesos (116 MB en safetensors, 340 MB en GGUF F32); el coste dominante es el contexto y el estado de activaciones, no los pesos.
- GPU recomendadas: cualquier GPU con soporte ROCm o CUDA; el autor valida explicitamente AMD Strix Halo (`gfx1151`) y ejecucion en CPU x86_64 con AVX2.
- Cabe en GPU consumer: si, en practicamente cualquier GPU consumer moderna e incluso en CPU. Se ha medido en un Ryzen AI Max+ 395.
- Opciones de despliegue: `transformers` (PyTorch, con kernels HIP o CUDA fusionados), `llama.cpp` en CPU (AVX2), Vulkan (RADV) y ROCm (HIP). No se mencionan vLLM, TGI ni Ollama en la informacion disponible.
- Latencia y throughput: 3.790 tok/s de prefill en Vulkan, 87,4 tok/s de decode en CPU con 16 hilos en FP32 y 5.760 tok/s de forward en BF16 con kernels HIP fusionados, medidos en Strix Halo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| GRT-30M | 29,84 M totales / 9,74 M no-embedding | 2.048 | Apache 2.0 | Rotaciones de Givens, destilado de Qwen 3, paridad multi-backend |
| Pythia-14M | 14 M | 2.048 | Apache 2.0 | Transformer denso clasico; citado por el autor como referencia de capacidad comparable |
| Pythia-31M | 31 M | 2.048 | Apache 2.0 | Transformer denso clasico; citado por el autor como referencia de capacidad comparable |
| Qwen 3 (profesor) | no disponible en la informacion | no disponible | no disponible | Modelo profesor de la destilacion; familia con vocabulario BPE de 151.669 tokens |

No se dispone de cifras de benchmark de Pythia-14M ni Pythia-31M en la informacion proporcionada para una comparacion numerica directa.

## Limitaciones y advertencias

- Es un checkpoint base de investigacion, no un asistente instruido: no sigue instrucciones ni mantiene dialogos coherentes de forma fiable.
- La calidad de generacion es muy baja en terminos absolutos: las continuaciones greedy publicadas son repetitivas y sin sentido factual (por ejemplo, "The capital of France is the first to be the first to be...").
- Precision top-1 de solo 27,20% sobre un vocabulario de 151.669 tokens; la perplejidad de validacion es 88,02.
- Ventana de contexto limitada a 2.048 tokens.
- Entrenado unicamente en ingles; no hay garantia de comportamiento en castellano ni en otros idiomas.
- Riesgo elevado de alucinacion y de texto incoherente, especialmente en generacion abierta y en tareas de conocimiento factual.
- No se documentan sesgos especificos, pero el corpus (fineweb-edu, cosmopedia-v2, wikipedia, finemath, stack-edu) puede introducir los sesgos habituales de datos web filtrados.
- La licencia Apache 2.0 permite uso comercial, pero el modelo no es apto para produccion por su calidad; cualquier despliegue comercial requeriria ajuste fino adicional y evaluacion propia.
- La paridad exacta entre backends se ha verificado con 16 tokens nuevos en cuatro backends sobre hardware AMD; no se garantiza en otras configuraciones ni con cuantizaciones distintas de F32.
- El modelo comparte vocabulario con Qwen 3, pero no hereda sus capacidades; no debe confundirse con un derivado funcional de Qwen 3.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/MatterWaveAI/grt-30m
- Variante curriculum: https://huggingface.co/MatterWaveAI/grt-30m-curriculum
- Dataset FineWeb-Edu: https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu
- Dataset Cosmopedia v2: https://huggingface.co/datasets/HuggingFaceTB/cosmopedia-v2
- Dataset Wikipedia: https://huggingface.co/datasets/wikimedia/wikipedia
- Dataset FineMath: https://huggingface.co/datasets/HuggingFaceTB/finemath
- Dataset SmolLM Corpus: https://huggingface.co/datasets/HuggingFaceTB/smollm-corpus
