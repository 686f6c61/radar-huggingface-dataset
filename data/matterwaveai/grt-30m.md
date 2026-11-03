# MatterWaveAI/grt-30m

## Resumen

GRT-30M es un modelo de lenguaje causal de tipo base desarrollado por MatterWaveAI, presentado como una vista previa de un preentrenamiento de 24 horas. Su particularidad es arquitectonica: implementa un *Geometric Rotation Transformer* (`GRTForCausalLM`), en el que todas las proyecciones lineales densas de la atencion y del feed-forward se sustituyen por cascadas de rotaciones de Givens de 2x2 moduladas por contenido sobre SO(D), intercaladas con permutaciones de tipo mariposa. El modelo se entrena desde cero sobre FineWeb-Edu y constituye una prueba de concepto de que una columna vertebral basada solo en rotaciones puede entrenar de forma estable.

El checkpoint almacena 29,31 M de parametros totales, aunque solo 9,74 M corresponden a la columna vertebral no-embedding de 12 bloques; el resto lo domina la tabla de embeddings ligada (151.669 tokens del vocabulario BPE de Qwen3 con cabeza polar coseno), que representa el 66,8% de los pesos. La longitud de contexto es de 2.048 tokens y el modelo solo declara soporte para ingles.

Es relevante ahora por dos motivos: demuestra una arquitectura alternativa a los transformers densos convencionales con paridad de generacion greedy bit a bit entre cuatro backends (PyTorch ROCm, llama.cpp CPU, llama.cpp Vulkan y llama.cpp ROCm), y publica pesos en safetensors y GGUF FP32, lo que facilita su reproduccion e inspeccion. No es un asistente instruido: es un checkpoint de investigacion base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `GRTForCausalLM` (Geometric Rotation Transformer, transformer causal con rotaciones de Givens) |
| Parametros totales | 29.844.597 (29,84 M segun safetensors; 29,31 M segun model card) |
| Parametros activos | no disponible (no es MoE) |
| Parametros no-embedding | 9.740.197 (9,74 M, 12 bloques) |
| Parametros equivalentes densos | 55.680.446 (55,68 M) |
| Longitud de contexto | 2.048 tokens (`max_position_embeddings`) |
| Tipos de cuantizacion | FP32 (GGUF publicado); no se documentan otras cuantizaciones |
| Idiomas soportados | Ingles (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (`model.safetensors`, 116 MB) y GGUF (`grt-30m-f32.gguf`, 340 MB) |
| `hidden_size` (d_model) | 256 |
| `num_hidden_layers` | 12 |
| Cabezas de atencion | 4 (`head_dim = 64`) |
| `intermediate_size` (d_ff) | 1.024 |
| Rotaciones (qkv / mixer / ffn) | 11 / 1 / 21 |
| Vocabulario | 151.669 (BPE de Qwen3, cabeza polar coseno ligada) |
| Tamano del repo | 0,5 GB |

## Arquitectura y entrenamiento

La arquitectura GRT sustituye cada proyeccion lineal densa (`nn.Linear`) de la atencion (Q, K, V, O) y del feed-forward (expand, contract) por cascadas de rotaciones de Givens de 2x2 sobre SO(D) moduladas por contenido, intercaladas con permutaciones de tipo mariposa. El modelo tiene 12 bloques con `d_model = 256`, 4 cabezas de atencion de dimension 64 y `d_ff = 1024`, con 11 rotaciones en QKV, 1 en el mixer y 21 en el FFN. La cabeza de salida es polar coseno ligada a la tabla de embeddings, que se almacena como `phase_angles [151669, 128]` mas `log_magnitude [151669]`.

El entrenamiento se realizo desde cero durante 24 horas (86.969 s) en 8x NVIDIA A100-SXM4-80GB con DDP y kernels CUDA fusionados de Givens, procesando 10.789.404.672 tokens (10,79 B) en 20.580 pasos. El batch global fue de 524.288 tokens por paso (micro-batch 16, acumulacion de gradiente 2, longitud de secuencia 2.048, 8 GPUs), con un rendimiento sostenido de 123.900 tok/s (~15.490 tok/s por GPU) y sin NaNs ni picos de gradiente. Se uso el optimizador `PairAdam` (segundos momentos factorizados para matrices de acoplamiento 2D y recorte angular del paso), con LR pico de 6e-4 y schedule coseno, detenido en el paso 20.000 de 57.220 con LR = 4,31e-4. El dataset fue FineWeb-Edu. La perdida de validacion final fue 4,4776 y la perplejidad 88,02 (27,2% de precision top-1 sobre el vocabulario de 151.669 tokens); el autor indica que equivale a ~29 PPL en un vocabulario GPT-2 estandar de 50k.

## Capacidades

- Generacion de texto causal en ingles: continuacion de prompts y modelado de lenguaje autoregresivo.
- Razonamiento basico de sentido comun: supera la linea base aleatoria en 6 de 7 benchmarks de eleccion multiple zero-shot.
- Comprension lectora y clasificacion binaria limitada: resultados cercanos al azar en BoolQ (51,53%) y QNLI (51,50%).
- Generacion greedy determinista con paridad exacta token a token entre cuatro backends (PyTorch ROCm, llama.cpp CPU AVX2, llama.cpp Vulkan RADV y llama.cpp ROCm HIP).
- No soporta tool calling ni function calling (no documentado; es un modelo base).
- No soporta agentes ni razonamiento multi-paso (no documentado).
- Multilingue: no disponible; solo ingles declarado.
- Capacidades especiales: ninguna documentada (sin vision, audio ni modo thinking).
- No es un modelo instruido: no sigue instrucciones ni mantiene formato conversacional.

## Casos de uso

- Investigacion de arquitecturas alternativas: el modelo sirve como banco de pruebas reproducible para estudiar si una columna vertebral basada solo en rotaciones de Givens puede sustituir a las proyecciones densas en transformers pequenos, con pesos y receta de entrenamiento publicados.
- Validacion de kernels y backends: gracias a la paridad greedy bit a bit entre PyTorch ROCm y llama.cpp (CPU, Vulkan, ROCm), se puede usar para verificar la correccion numerica de nuevas implementaciones de kernels o de portes a hardware no soportado.
- Pruebas de cuantizacion y despliegue en llama.cpp: al existir un GGUF FP32 de 340 MB, es util para validar pipelines de conversion, carga y generacion en entornos con recursos muy limitados antes de escalar a modelos mayores.
- Educacion y divulgacion: su tamano reducido (9,74 M de parametros no-embedding) permite inspeccionar y visualizar el flujo completo de un transformer causal en un portatil, incluida la mecanica de rotaciones y permutaciones.
- Generacion de texto exploratoria en ingles: puede producir continuaciones coherentes a nivel local en dominios cercanos a FineWeb-Edu, util para experimentos de prompting y analisis de distribuciones de tokens.
- Benchmarking de hardware integrado: el autor reporta 3.790 tok/s de prefill (Vulkan) y 87,4 tok/s de decode (CPU, 16 hilos) en FP32 sobre un AMD Ryzen AI Max+ 395 (Strix Halo / gfx1151), lo que lo convierte en una carga de trabajo de referencia para medir el rendimiento de GPUs integradas y APUs.
- Estudio de cabezas de salida con vocabulario grande: con el 66,8% de los pesos en la tabla de embeddings de 151.669 tokens, es un caso practico para analizar el coste y el comportamiento de vocabularios grandes en modelos minusculos.

## Benchmarks y rendimiento

Evaluacion zero-shot (sin fine-tuning) mediante scoring de log-verosimilitud normalizado por longitud sobre el checkpoint 20.000:

| Benchmark | Split (n) | GRT-30M | Aleatorio | Delta |
|---|---|---:|---:|---:|
| ARC-Easy | test (2.376) | 29,50% | 25,00% | +4,50% |
| HellaSwag | val (1.000) | 29,20% | 25,00% | +4,20% |
| OpenBookQA | test (500) | 28,40% | 25,00% | +3,40% |
| CommonsenseQA | val (1.221) | 21,70% | 20,00% | +1,70% |
| BoolQ | val (3.270) | 51,53% | 50,00% | +1,53% |
| QNLI | val (1.000) | 51,50% | 50,00% | +1,50% |
| ARC-Challenge | test (1.172) | 21,08% | 25,00% | -3,92% |

Modelado de lenguaje en dominio (FineWeb-Edu, validacion):

| Metrica | Valor |
|---|---|
| Loss (NLL) | 4,4776 |
| Perplejidad (vocab. 151k) | 88,02 |
| Precision top-1 de token | 27,20% |

Rendimiento de inferencia reportado por el autor (AMD Ryzen AI Max+ 395, Strix Halo / gfx1151):

| Backend / modo | Throughput |
|---|---|
| Prefill Vulkan | 3.790 tok/s |
| Decode CPU (16 hilos, FP32) | 87,4 tok/s |
| Forward BF16 con kernels HIP fusionados | 5.760 tok/s |
| Entrenamiento (8x A100-SXM4-80GB) | 123.900 tok/s (~15.490 tok/s/GPU) |

## Requisitos de hardware

- VRAM estimada para inferencia: minima. Los pesos en safetensors ocupan 116 MB y el GGUF FP32 340 MB; en FP32 la huella completa ronda los 120-350 MB segun formato, muy por debajo de cualquier GPU consumer.
- GPU recomendadas: cualquier GPU con al menos 1 GB de memoria libre; el autor valida explicitamente AMD Strix Halo (gfx1151) con ROCm y Vulkan, y llama.cpp CPU con AVX2.
- Cabe en GPU consumer: si, en practicamente todas (RTX 4090, RTX 3060, GPUs integradas e incluso APUs). Tambien funciona en CPU sin GPU.
- Opciones de despliegue: `transformers` (PyTorch, con soporte ROCm), `llama.cpp` en CPU (AVX2), Vulkan y ROCm/HIP. No se documenta soporte para vLLM, TGI ni Ollama.
- Latencia y throughput: 3.790 tok/s de prefill en Vulkan y 87,4 tok/s de decode en CPU de 16 hilos en FP32 sobre Strix Halo; 5.760 tok/s de forward en BF16 con kernels HIP fusionados. No hay datos de latencia en GPUs discretas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| GRT-30M | 29,31 M almacenados (9,74 M no-embedding) | 2.048 | ARC-Easy 29,50%, HellaSwag 29,20%, val PPL 88,02 (vocab. 151k) | Apache 2.0 | safetensors + GGUF |
| Pythia-14M | 14 M | 2.048 | No disponible en la informacion proporcionada | Apache 2.0 | safetensors |
| Pythia-31M | 31 M | 2.048 | No disponible en la informacion proporcionada | Apache 2.0 | safetensors |

El autor indica que GRT-30M iguala a modelos densos de capacidad de columna vertebral comparable (Pythia-14M y Pythia-31M), pero no se aportan cifras concretas de estos en la informacion disponible. No se dispone de datos de otros modelos de la misma categoria para una comparacion cuantitativa adicional.

## Limitaciones y advertencias

- Es un checkpoint base de investigacion, no un asistente instruido: no sigue instrucciones, no mantiene formato conversacional y no debe usarse como chatbot sin fine-tuning.
- Calidad de lenguaje muy limitada: las continuaciones greedy mostradas por el autor son repetitivas y carentes de coherencia global (por ejemplo, "The capital of France is the first to be the first to be...").
- Riesgo alto de alucinacion y de texto sin sentido: la precision top-1 de token es del 27,2% sobre un vocabulario de 151.669 tokens.
- Rendimiento cercano al azar en la mayoria de benchmarks: solo supera la linea base aleatoria entre 1,5 y 4,5 puntos en 6 de 7 tareas, y queda por debajo en ARC-Challenge (-3,92%).
- Solo ingles: no hay soporte multilingue declarado.
- Contexto corto: 2.048 tokens, insuficiente para tareas de contexto largo.
- Sesgos: no documentados por el autor; al entrenarse sobre FineWeb-Edu es probable que herede sesgos del corpus web filtrado, aunque no se cuantifican.
- Licencia Apache 2.0: permite uso comercial, pero el modelo no es adecuado para produccion por su calidad.
- La model card advierte de que es una "vista previa" de 24 horas con el entrenamiento detenido en el paso 20.000 de 57.220, por lo que el checkpoint esta subentrenado respecto al plan previsto.
- Discrepancia menor en el recuento de parametros entre safetensors (29.844.597) y la model card (29.305.498); conviene verificar antes de integrarlo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/MatterWaveAI/grt-30m
- Dataset de entrenamiento: https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu
- No se han encontrado en la informacion proporcionada papers, blogs, repositorios ni demos adicionales.
