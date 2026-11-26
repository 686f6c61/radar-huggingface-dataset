# Pyleon/pyro-ps-0.2.0

## Resumen

Pyro PS-0.2.0 es un modelo de lenguaje causal (decoder-only) de 100,7 millones de parametros desarrollado por Pyleon, entrenado desde inicializacion aleatoria con un motor propio escrito integramente en Rust y CUDA, sin usar PyTorch ni el codigo de entrenamiento de Hugging Face Transformers, y sin pesos preentrenados de terceros. Se trata por tanto de un ejercicio de entrenamiento "from scratch" que busca demostrar que es posible construir un LLM competitivo con recursos muy limitados: 2,84 mil millones de tokens procesados en 29,3 horas sobre dos GPUs Tesla T4 gratuitas.

El modelo emplea una arquitectura transformer pre-RMSNorm con Grouped-Query Attention (12 cabezas de consulta y 4 de clave/valor), QK-Norm, RoPE con theta 10.000, activacion SwiGLU y embeddings atados. Tiene 12 capas, dimension de modelo 768 y una longitud de contexto maxima de 1024 tokens. Su relevancia actual reside en dos frentes: por un lado, demuestra que un modelo de ~100M puede superar a GPT-2 124M y a Pythia-160M en la media de seis benchmarks estandar (41,57% frente a 39,57% y 39,53% respectivamente); por otro, su runtime de inferencia en Rust con cuantizacion int4 de grupo 64 alcanza 102,8 tok/s en una CPU de doble nucleo de 2017 sin AVX.

Es un modelo base (pretrained), no ajustado por instrucciones, orientado a completado de texto y continuacion cientifico-matematica. Existe un checkpoint chat SFT separado (Pyleon/pyro-ps-0.2.0-chat) y una demo publica en CPU.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only pre-RMSNorm con GQA, QK-Norm, RoPE (theta = 10.000), SwiGLU y embeddings atados |
| Parametros totales | 100.684.032 (100,7M) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 1024 tokens (max_seq_len) |
| Tipos de cuantizacion | FP32, int8, int4 (grupo 64, runtime SIMD propio) |
| Idiomas soportados | Ingles (en) |
| Licencia | pyro-evaluation-preview (licencia personalizada, no comercial estandar) |
| Formato de pesos | safetensors; runtime propio pyro-infer (Rust) para int8/int4 |
| Dimensiones | 12 capas, d_model = 768, 12 cabezas Q / 4 cabezas KV (head_dim = 64), ffn_hidden = 2048 |
| Tamano del repo | 0,5 GB |
| Huella en int4 | 56,7 MB (7,1x menor que FP32) |

## Arquitectura y entrenamiento

La arquitectura es un transformer denso decoder-only con pre-RMSNorm, Grouped-Query Attention (12 cabezas de consulta compartiendo 4 cabezas de clave/valor, lo que reduce el coste del KV-cache), QK-Norm para estabilizar la atencion, RoPE con theta 10.000 para codificacion posicional relativa, SwiGLU en la FFN (ffn_hidden = 2048) y embeddings de entrada y salida atados. El contexto maximo es de 1024 tokens.

El entrenamiento se realizo desde inicializacion aleatoria sobre 2,84 mil millones de tokens de datos con licencia permisiva y "comercialmente limpios": FineWeb-Edu y FineMath 4+ (ODC-By-1.0). Se completo en 29,3 horas sobre 2 x Tesla T4. El motor de entrenamiento (pyro-engine) y el de inferencia (pyro-infer) son implementaciones propias en Rust + CUDA sin dependencias de frameworks de ML. El autor reporta un optimizador Muon propio (Newton-Schulz) con aproximadamente 2x de eficiencia de muestras frente a AdamW a escala 100M (1,4712 BPB en 65,5M tokens frente a 1,4755 BPB en 131,1M tokens), aunque ese resultado corresponde al desarrollo del sucesor PS-0.5 (210,8M) y no al checkpoint publicado aqui. No se documenta en la informacion disponible si hubo RLHF, DPO ni fases de alineacion para este checkpoint base.

## Capacidades

- Generacion de texto y completado autoregresivo en ingles.
- Continuacion de texto cientifico y matematico (entrenado con FineMath 4+).
- Razonamiento basico de sentido comun y conocimiento general a escala de ~100M de parametros.
- Respuesta a preguntas de opcion multiple en formato de evaluacion estandar (ARC, OpenBookQA, BoolQ, etc.).
- Capacidades multilingues: solo ingles.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Modo thinking, vision o audio: no disponible.
- Checkpoint chat SFT disponible por separado (Pyleon/pyro-ps-0.2.0-chat) para conversacion.

## Casos de uso

- Completado de texto en local y en dispositivos de bajos recursos: con 56,7 MB en int4 y 102,8 tok/s en una CPU de doble nucleo de 2017, es viable ejecutarlo en portatiles antiguos, Raspberry Pi o entornos embebidos sin GPU.
- Continuacion de textos cientificos y matematicos: entrenado sobre FineMath 4+, puede usarse para autocompletar pasajes tecnicos o como generador de borradores en dominios STEM dentro de un pipeline mayor.
- Verificacion y reproduccion de benchmarks: al publicar resultados con protocolo tipo lm-evaluation-harness y datos canonicos, sirve como referencia reproducible para validar implementaciones de evaluacion propias.
- Prototipado de runtimes de inferencia: su motor Rust con kernels SIMD int4 (SSSE3/AVX2) es un caso de estudio para quien desarrolle motores de inferencia o compare rendimiento frente a llama.cpp.
- Educacion e investigacion en entrenamiento desde cero: util como ejemplo didactico completo de pipeline (tokenizacion, entrenamiento, cuantizacion, evaluacion) sin dependencias de frameworks.
- Generacion de texto en entornos air-gapped o con requisitos de trazabilidad de licencia de datos: al estar entrenado con datos de licencia permisiva (FineWeb-Edu + FineMath, ODC-By-1.0), facilita auditorias de procedencia de datos.
- Base para fine-tuning ligero: punto de partida de bajo coste para ajustes supervisados en tareas de dominio en ingles con presupuesto de computo minimo.

## Benchmarks y rendimiento

Evaluacion zero-shot sobre 6 tareas publicas (500 items por tarea, 3.000 en total), metrica acc_norm normalizada por longitud en bytes.

| Modelo | Parametros | Tokens de entrenamiento | Media 6 tareas (acc_norm) | Media 6 tareas (acc) | OpenBookQA | ARC-Easy | ARC-Challenge | WinoGrande | HellaSwag | BoolQ |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| Azar | — | — | 33,33% | 33,33% | 25,0% | 25,0% | 25,0% | 50,0% | 25,0% | 50,0% |
| Pythia-160M-deduped | 162,3M | ~300B | 39,53% | 35,17% | 25,4% | 42,6% | 22,8% | 48,0% | 39,6% | 58,8% |
| GPT-2 124M | 124,4M | ~10B | 39,57% | 35,80% | 25,8% | 41,0% | 20,8% | 53,2% | 40,0% | 56,6% |
| Pyro PS-0.2.0 (int8) | 100,7M | 2,84B | 41,57% | 38,13% | 29,2% | 45,8% | 21,6% | 50,0% | 40,6% | 62,2% |
| Pyro PS-0.2.0 (int4) | 100,7M | 2,84B | 41,57% | 38,53% | 28,4% | 45,6% | 22,0% | 50,4% | 40,2% | 62,8% |
| SmolLM2-135M | 134,5M | 2.000B | 46,20% | 42,93% | 33,2% | 58,0% | 27,2% | 52,0% | 44,0% | 62,8% |

Error estandar por tarea: ±1,7-2,2% (n = 500); media macro de 6 tareas: ±0,85%.

Compresion en texto retenido (BPB, menor es mejor; 2,0M tokens, T = 1024, FP32):

| Modelo | Parametros | Tokens | eval-edu BPB | eval-math BPB |
|---|---:|---:|---:|---:|
| Pythia-160M-deduped | 162,3M | ~300B | 1,2334 | 1,3087 |
| GPT-2 124M | 124,4M | ~10B | 1,0200 | 1,2054 |
| Pyro PS-0.2.0 | 100,7M | 2,84B | 1,0025 | 0,8540 |
| SmolLM2-135M | 134,5M | 2.000B | 0,8807 | 0,8613 |

Auditoria de retencion con cuantizacion (500 items, ARC-Easy + OpenBookQA): f32 37,20% -> int8 37,40% (100,5%, 2,04x mas rapido) -> int4 36,60% (98,4%, 3,06x mas rapido). En la suite completa de 3.000 items, int4 iguala a int8 en 41,57% acc_norm (0,00% de caida).

Rendimiento del runtime (Intel Pentium G4560 de 2017, SSE4.2, sin AVX/AVX2): pyro-infer int8 alcanza 49,5 tok/s (1 hilo, +51% frente a llama.cpp 31,9-33,4 tok/s) y 56,8 tok/s (4 hilos, +22% frente a 46,6 tok/s). El runtime int4 de grupo 64 alcanza 102,8 tok/s en generacion en vivo (128,6 tok/s en micro-benchmark) con 56,7 MB de RAM.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo cabe holgadamente en cualquier GPU consumer. En FP32 ocupa aproximadamente 0,4 GB; en int8 unos 101 MB; en int4 unos 57 MB.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4090, etc.) es sobredimensionada; el modelo esta disenado para ejecutarse en CPU. En GPU, A100/H100 no aportan ventaja practica por el tamano.
- Cabe en GPU consumer: si, en todas, incluidas GPUs integradas y placas embebidas.
- CPU: funciona en procesadores sin AVX/AVX2 (SSE4.2), como el Pentium G4560 de 2017, a 102,8 tok/s en int4.
- Opciones de despliegue: runtime propio pyro-infer (Rust); pesos en safetensors. Compatibilidad con vLLM, llama.cpp, Ollama o TGI: no disponible en la informacion proporcionada (el autor compara su motor con llama.cpp, pero no indica soporte de formatos GGUF).
- Latencia y throughput: 102,8 tok/s en generacion en vivo y 128,6 tok/s en micro-benchmark sobre CPU de doble nucleo de 2017 con int4; 49,5-56,8 tok/s en int8 segun numero de hilos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Media 6 tareas (acc_norm) | Licencia | Disponibilidad |
|---|---:|---:|---:|---|---|
| Pyro PS-0.2.0 | 100,7M | 1024 | 41,57% | pyro-evaluation-preview | Hugging Face (safetensors) |
| GPT-2 124M | 124,4M | 1024 | 39,57% | MIT (OpenAI) | Amplia, multiples formatos |
| Pythia-160M-deduped | 162,3M | 2048 | 39,53% | Apache 2.0 | Amplia, multiples formatos |
| SmolLM2-135M | 134,5M | 8192 (segun model card de referencia) | 46,20% | Apache 2.0 | Amplia, multiples formatos |

Pyro PS-0.2.0 supera a GPT-2 124M y Pythia-160M en la media de 6 tareas pese a tener menos parametros y muchos menos tokens de entrenamiento (2,84B frente a ~10B y ~300B). Queda por debajo de SmolLM2-135M, que entreno con 2 billones de tokens. La principal desventaja frente a los tres es la licencia restrictiva y la ausencia de ecosistema de despliegue estandar (GGUF, llama.cpp, vLLM).

## Limitaciones y advertencias

- Modelo base sin alineacion: no sigue instrucciones de forma fiable; para conversacion debe usarse el checkpoint chat separado.
- Solo ingles; no hay soporte multilingue.
- Contexto limitado a 1024 tokens, inferior a alternativas como Pythia (2048) o SmolLM2 (hasta 8192).
- Escala de 100M de parametros: alta propension a alucinaciones y conocimiento factual muy limitado; no apto para tareas que requieran precision factual.
- Sesgos: no se documentan evaluaciones de sesgo ni de seguridad en la informacion disponible; al entrenarse sobre FineWeb-Edu y FineMath, hereda los sesgos de esas fuentes.
- Licencia "pyro-evaluation-preview": no es una licencia open source estandar; el uso comercial puede estar restringido. Verificar los terminos antes de cualquier despliegue en produccion.
- Los benchmarks se evaluaron sobre 500 items por tarea (error estandar ±1,7-2,2%), por lo que las diferencias frente a GPT-2 y Pythia son pequenas en terminos absolutos aunque consistentes en 5 de 6 tareas.
- Los conjuntos eval-edu y eval-math son divisiones retenidas de los mismos datasets de entrenamiento (in-distribution), lo que favorece al modelo en la comparativa BPB frente a GPT-2 y Pythia.
- Sin soporte documentado de formatos GGUF ni integracion con frameworks de despliegue estandar; el uso requiere el runtime propio del autor.
- No se documentan resultados de benchmarks de seguridad, toxicidad ni robustez adversarial.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Pyleon/pyro-ps-0.2.0
- Checkpoint chat SFT: https://huggingface.co/Pyleon/pyro-ps-0.2.0-chat
- Demo publica en CPU: https://huggingface.co/spaces/Pyleon/pyro-demo
- Paper, blog o repositorio del motor Rust: no disponible en la informacion proporcionada.
