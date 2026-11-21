# MatterWaveAI/grt-30m-curriculum

## Resumen

GRT-30M-Curriculum es un modelo de lenguaje causal de pequeno tamano (SLM) desarrollado por MatterWaveAI, construido sobre una arquitectura propietaria denominada Geometric Rotation Transformer (GRT). Se trata de un ajuste fino por curriculo de multiples rondas del checkpoint base `MatterWaveAI/grt-30m`, que a su vez es el resultado de una destilacion de 24 horas desde la familia Qwen 3. El modelo almacena 29,84 millones de parametros totales, de los cuales solo 9,74 millones corresponden al backbone no-embedding distribuido en 12 bloques rotacionales, con un hidden size de 256 y una ventana de contexto de 2.048 tokens.

El modelo resuelve el problema de mejorar el rendimiento de un SLM destilado mediante optimizacion curricular avanzada en lugar de aumentar el numero de parametros. Su innovacion principal es el uso del optimizador `HuygensSymplecticAdam`, que aplica una fase de torque de splay de Huygens seguida de un curriculo de no-compresion simplectica, consiguiendo una mejora de +8,46 puntos porcentuales en la suite de multiple choice SLM-Bench respecto al baseline `PairAdam` sobre el mismo checkpoint de partida.

Es relevante ahora porque demuestra que tecnicas de optimizacion geometrica y curriculos multi-ronda pueden extraer rendimiento adicional significativo de modelos muy pequenos sin cambiar la arquitectura ni el presupuesto de parametros, lo que resulta interesante para despliegues en hardware de bajos recursos. El modelo esta publicado bajo licencia Apache 2.0 y solo soporta ingles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GRTForCausalLM (`model_type: "grt"`, `grt30m_kd`), transformer rotacional de 12 bloques |
| Parametros totales | 29.844.597 (29,84M); backbone no-embedding: 9.740.197 (9,74M) |
| Parametros activos | no disponible (modelo denso) |
| Longitud de contexto | 2.048 tokens (`max_position_embeddings`) |
| Tipos de cuantizacion | FP32 (GGUF base en el repo `grt-30m`); no se documentan otras cuantizaciones para este checkpoint |
| Idiomas soportados | Ingles (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (`model.safetensors`, 116 MB) |

Otros parametros tecnicos: `hidden_size` (d_model) = 256, `num_hidden_layers` = 12, `num_attention_heads` = 4 (`head_dim` = 64), `intermediate_size` (d_ff) = 1.024, `n_qkv_rotations` = 11, `n_mixer_rotations` = 1, `ffn_n_rotations` = 21, vocabulario de 151.669 tokens (BPE de Qwen 3, cabeza polar coseno atada). Parametros densos equivalentes: 55.680.446 (55,68M).

## Arquitectura y entrenamiento

La arquitectura GRT (Geometric Rotation Transformer) es un transformer causal con bloques rotacionales: en lugar de la atencion estandar, emplea rotaciones geometricas parametrizadas (`n_qkv_rotations` = 11, `n_mixer_rotations` = 1, `ffn_n_rotations` = 21). La tabla de embeddings polar atada (`phase_angles [151669, 128]` + `log_magnitude [151669]`) consume 19,57M parametros, el 66,8% de los pesos almacenados, lo que deja los 9,74M restantes para el backbone de 12 capas. El vocabulario completo de Qwen 3 se mantiene a `hidden_size` = 256 para permitir destilacion alineada por token directamente desde Qwen 3.

El checkpoint base `grt-30m` se entreno durante 24 horas (86.969 s) en 8x NVIDIA A100-SXM4-80GB con DDP y kernels Givens CUDA fusionados, procesando 10.789.404.672 tokens (10,79B) en 20.580 pasos a 123.900 tok/s. La mezcla del corpus fue fineweb-edu (45%), cosmopedia-v2 (20%), wikipedia (15%), finemath (12%) y stack-edu (8%). El optimizador base fue `PairAdam` (LR pico 1e-3, schedule WSD), con `val_loss` = 4,4776 y `val_ppl` = 88,02. Sobre ese checkpoint, este modelo aplica un curriculo multi-ronda con `HuygensSymplecticAdam`, que combina una etapa de torque de splay de Huygens con un curriculo de no-compresion simplectica. No se documentan fases de RLHF ni DPO.

## Capacidades

- Generacion de texto causal en ingles mediante decodificacion autorregresiva.
- Razonamiento basico de sentido comun y respuesta a preguntas de multiple choice (BoolQ, ARC-Easy, ARC-Challenge, OpenBookQA, PIQA).
- Verificacion numerica en GSM8K en formato de 4 opciones (99,20% de acierto reportado).
- Razonamiento matematico elemental gracias a la inclusion de finemath en el corpus de destilacion.
- Generacion de codigo basica derivada del subconjunto stack-edu del entrenamiento (no se documenta tool calling).
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso explicito.
- Capacidades multilingues limitadas al ingles (unico idioma declarado).
- No se documenta modo thinking, vision ni audio.

## Casos de uso

- Clasificacion y respuesta a preguntas de multiple choice en ingles: el modelo esta optimizado especificamente para tareas tipo SLM-Bench (BoolQ, ARC, OpenBookQA, PIQA), por lo que encaja en pipelines de evaluacion o filtrado de preguntas con opciones cerradas.
- Verificacion aritmetica ligera: con un 99,20% de acierto en GSM8K de 4 opciones, puede emplearse como verificador de respuestas numericas en un pipeline mayor, seleccionando la opcion correcta entre candidatos generados por otro modelo.
- Prototipado e investigacion de optimizadores: sirve como banco de pruebas reproducible para estudiar el efecto de `HuygensSymplecticAdam` y curriculos multi-ronda frente a `PairAdam` sobre un checkpoint fijo de 29,3M parametros.
- Despliegue en hardware de bajos recursos: con 116 MB en safetensors FP32 y 9,74M parametros de backbone, cabe en CPU y en GPUs integradas; el repo base ofrece GGUF FP32 para llama.cpp.
- Experimentos de destilacion de conocimiento: al compartir el tokenizador completo de Qwen 3 (151.669 tokens) a hidden size 256, es util como estudiante de referencia en investigaciones de destilacion token-aligned.
- Educacion y demostraciones de arquitecturas alternativas: la naturaleza rotacional de los bloques permite ilustrar variantes geometricas de atencion en cursos o articulos tecnicos.
- Generacion de texto corto en ingles con contexto de hasta 2.048 tokens para tareas de completado simple, siempre que no se requiera alta calidad factua.

## Benchmarks y rendimiento

Resultados en la suite SLM-Bench de multiple choice (9 tareas principales, 13.144 ejemplos held-out). Se comparan el checkpoint destilado zero-shot, el baseline `PairAdam`, el pase unico con `HuygensSymplecticAdam` y el curriculo multi-ronda (este modelo):

| Tarea (SLM-Bench) | Split (n) | Random | Zero-Shot (GRT-30M) | PairAdam | Single-Pass (HuygensSymplectic) | Multi-Round Curriculum |
|---|---|---:|---:|---:|---:|---:|
| BoolQ | val (3.270) | 50,00% | 51,41% | 60,55% | 62,23% | 65,72% |
| ARC-Easy | test (2.376) | 25,00% | 29,59% | 28,96% | 36,32% | 40,57% |
| ARC-Challenge | test (1.172) | 25,00% | 20,82% | 23,55% | 25,68% | 30,80% |
| OpenBookQA | test (500) | 25,00% | 28,20% | 30,00% | 35,80% | 42,80% |
| PIQA | val | no disponible | no disponible | no disponible | no disponible | no disponible |

Macro-promedio en las 9 tareas: 37,56% (zero-shot) → 39,61% (`PairAdam`) → 43,86% (pase unico) → 48,07% (curriculo multi-ronda, +8,46% vs. `PairAdam`). En GSM8K, la verificacion numerica de 4 opciones alcanza 99,20% con `PPL` = 7,60 (frente a 27,99 en el checkpoint previo, una reduccion de 3,68x). Los datos completos de PIQA y del resto de tareas de la suite no se incluyen en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en FP32 (116 MB de pesos + overhead de activaciones); en la practica cabe en cualquier GPU consumer.
- GPU recomendadas: no requiere GPU dedicada; funciona en CPU x86_64 con AVX2 y en GPUs integradas (se valido en AMD Strix Halo, `gfx1151`).
- Cabe en GPU consumer: si, en cualquier modelo (RTX 4090, RTX 3060, e incluso iGPU).
- Opciones de despliegue: `transformers` (PyTorch), llama.cpp en CPU, Vulkan y ROCm. Se reporta paridad exacta token a token en generacion greedy (`temperature` = 0, 16 tokens nuevos) entre PyTorch ROCm, llama.cpp CPU, llama.cpp Vulkan y llama.cpp ROCm sobre el checkpoint base.
- Latencia y throughput: no disponible para este checkpoint; el entrenamiento base reporto 123.900 tok/s en 8x A100-80GB, dato no extrapolable a inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Idiomas | Notas |
|---|---|---|---|---|---|
| GRT-30M-Curriculum (este) | 29,84M (9,74M backbone) | 2.048 | Apache 2.0 | en | 48,07% macro en SLM-Bench; arquitectura rotacional propia |
| MatterWaveAI/grt-30m | 29,31M (9,74M backbone) | 2.048 | Apache 2.0 | en | Checkpoint base destilado, 37,56% macro en SLM-Bench |
| Qwen 3 (profesor) | no disponible | no disponible | no disponible | no disponible | Familia profesora usada para destilacion; tokenizador compartido |
| Otros SLM de ~30M | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparativos en la informacion proporcionada |

No se dispone de comparaciones con alternativas de terceros de tamano similar en la informacion proporcionada.

## Limitaciones y advertencias

- Solo soporta ingles; no se declaran otros idiomas.
- Ventana de contexto limitada a 2.048 tokens, insuficiente para documentos largos o conversaciones multi-turno extensas.
- Riesgo elevado de alucinacion y de generacion incoherente: los ejemplos de continuacion greedy del checkpoint base muestran repeticiones y texto sin sentido ("the first to be the first to be...").
- El rendimiento en tareas abiertas es bajo: 48,07% de macro-promedio en multiple choice, lejos de modelos de mayor tamano.
- El 66,8% de los parametros son embeddings; el backbone real es de solo 9,74M, lo que limita la capacidad de razonamiento.
- No se documenta soporte de tool calling, agentes ni modo thinking.
- Aunque la licencia es Apache 2.0 (permite uso comercial), la calidad del modelo hace desaconsejable su uso en produccion orientada a usuarios finales.
- El checkpoint base fue entrenado en 8x A100 durante 24 horas; no se documentan evaluaciones de sesgo, toxicidad ni seguridad.
- La paridad de backends reportada se valida sobre el checkpoint base, no explicitamente sobre este checkpoint curricular.

## Enlaces

- Hugging Face (este modelo): https://huggingface.co/MatterWaveAI/grt-30m-curriculum
- Modelo base: https://huggingface.co/MatterWaveAI/grt-30m
- Dataset fineweb-edu: https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu
- Dataset cosmopedia-v2: https://huggingface.co/datasets/HuggingFaceTB/cosmopedia-v2
- Dataset wikipedia: https://huggingface.co/datasets/wikimedia/wikipedia
- Dataset finemath: https://huggingface.co/datasets/HuggingFaceTB/finemath
- Dataset smollm-corpus: https://huggingface.co/datasets/HuggingFaceTB/smollm-corpus
- Paper, blog o repositorio adicional: no disponible en la informacion proporcionada
