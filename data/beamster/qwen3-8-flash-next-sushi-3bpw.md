# beamster/Qwen3.8-Flash-Next-Sushi-3bpw

## Resumen

Qwen3.8-Flash-Next-Sushi-3bpw es un empaquetado cuantizado del modelo Qwen/Qwen3.8-Flash-Next, desarrollado por el usuario beamster para el motor de inferencia sushi, una bifurcación de mlx-serve orientada de forma nativa a Apple Silicon. No se trata de un modelo nuevo, sino de una distribución de pesos optimizada para ejecutar el modelo base de Qwen en un Mac de 64 GB de memoria unificada, con un peso en GPU de aproximadamente 49,33 GiB y un tamaño en disco de unos 79 GiB.

El modelo base es un transformer de tipo mezcla de expertos (MoE) con 28.849.143.699 parámetros totales según los safetensors publicados, visión integrada (torre Qwen3-VL ViT para imagen y vídeo) y una cabeza MTP (multi-token prediction). El pack emplea cuantización EXL3 para los expertos enrutados y cuantización afín de 8 bits para la parte densa, además de una tabla de embeddings n-gram de 4 bits con grupo de tamaño 32 que se lee desde el SSD y nunca se carga en memoria de GPU.

Su relevancia actual es doble: por un lado, demuestra que es posible ejecutar un MoE multimodal de casi 29.000 millones de parámetros en hardware de consumo de Apple con una ventana de contexto de hasta 1.048.576 tokens (YaRN x4 sobre los 262.144 nativos); por otro, publica métricas de degradación por cuantización (KLD y acuerdo top-1) frente a empaquetados alternativos, lo que permite evaluar el compromiso calidad/memoria con datos concretos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE multimodal (atención, GDN, expertos compartidos, hyper-connections, indexer, torre de visión Qwen3-VL ViT, cabeza MTP) |
| Parametros totales | 28.849.143.699 |
| Parametros activos | no disponible |
| Longitud de contexto | hasta 1.048.576 tokens (YaRN x4 sobre 262.144 nativos) |
| Tipos de cuantizacion | EXL3 en expertos enrutados; afín 8-bit en parte densa; afín 4-bit grupo 32 en tabla n-gram; KV cache kv8 |
| Idiomas soportados | no disponible |
| Licencia | Qwen Community License 1.0 (derivado de Qwen/Qwen3.8-Flash-Next) |
| Formato de pesos | safetensors (EXL3 + afín 8-bit), más `ngram_table.bin` |
| Tamano en disco | ~79 GiB (49,3 GiB de pesos + 29,8 GiB de tabla n-gram) |
| Peso en memoria de GPU | 49,33 GiB |
| Pipeline | image-text-to-text |
| Motor de inferencia | sushi v1.0.0 o superior, macOS 26.2 o superior, Apple Silicon |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-Flash-Next es un transformer de mezcla de expertos con 48 capas y 512 expertos enrutados por capa, según se deduce de la descripción del empaquetado. Incorpora componentes densos que el pack conserva en 8 bits: mecanismo de atención, GDN (gated delta network), expertos compartidos, hyper-connections, un indexer y las matrices de embedding y lm_head. A ello se suma una torre de visión Qwen3-VL ViT para entrada de imagen y vídeo, y una cabeza MTP que permite decodificación multi-token especulativa. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni las etapas de alineación (RLHF/DPO) del modelo original.

La innovación técnica de este pack no reside en el entrenamiento, sino en el esquema de compresión y en el motor de ejecución. Los expertos enrutados se almacenan en formato EXL3 mediante un conversor propio del autor; la tabla de embeddings n-gram se cuantiza a 4 bits con grupo de tamaño 32 y se mantiene en SSD, de modo que no consume VRAM y puede intercambiarse por la versión bf16 (95,4 GiB en disco) para obtener una ganancia pequeña de calidad. El pack solo funciona con sushi, no carga en transformers, vLLM, mlx-lm ni exllamav3.

## Capacidades

- Generación de texto conversacional multi-turno con contexto muy largo (hasta 1.048.576 tokens).
- Entrada multimodal de imagen y vídeo mediante la torre Qwen3-VL ViT incluida en el pack.
- Razonamiento extendido: la evaluación publicada usa 12k tokens de razonamiento y 16k de salida.
- Decodificación multi-token (MTP) para acelerar la generación.
- Capacidades de código y matemáticas implícitas en el modelo base (evaluadas vía MMLU-Pro, OlympiadBench y LiveBench en el conjunto Hard 50).
- Soporte de tool calling y function calling: no disponible en la información proporcionada.
- Capacidades de agente y razonamiento multi-paso: no disponible en la información proporcionada.
- Idiomas soportados: no disponible en la información proporcionada.

## Casos de uso

- Asistente local en un Mac de 64 GB: el pack está dimensionado para ejecutarse íntegramente en memoria unificada de 64 GB, lo que permite desplegar un asistente conversacional privado sin conexión a servicios en la nube.
- Análisis de documentos extensos: con hasta 1.048.576 tokens de contexto, se pueden procesar libros completos, expedientes o bases de código en una sola pasada sin truncar.
- Procesamiento de imagen y vídeo: la torre ViT incluida permite tareas de image-text-to-text, como descripción de contenido audiovisual, extracción de información de capturas o análisis de fotogramas.
- Razonamiento sobre problemas técnicos: el conjunto Hard 50 (MMLU-Pro, OlympiadBench, LiveBench, NIST Juliet) sugiere uso en resolución de problemas de nivel experto y revisión de código seguro.
- Prototipado e investigación en cuantización: al publicar KLD y acuerdo top-1 frente a otros packs, sirve como referencia para estudiar el impacto de EXL3 y de las tablas n-gram en la calidad.
- Evaluación comparativa de motores de inferencia: útil para medir el rendimiento de sushi frente a mlx-serve u oMLX en hardware Apple Silicon con la misma carga.
- Desarrollo sin GPU dedicada: permite a desarrolladores con portátiles o equipos de sobremesa Mac experimentar con un MoE multimodal de gran tamaño sin infraestructura de centro de datos.

## Benchmarks y rendimiento

Calidad de cuantización frente al checkpoint bf16 (KLD sobre 16 prompts × 512 tokens, 7186 posiciones, KV cache kv8):

| Pack | Pesos en GPU (GiB) | KLD | Acuerdo top-1 |
|---|---|---|---|
| Sushi-4bpw | 63,68 | 0,0592 | 92,89% |
| oMLX oQ5e | 83,97 | 0,0625 | 92,40% |
| mlx-serve mixed-4-8bit | 70,13 | 0,0818 | 91,39% |
| Sushi-3bpw (tabla n-gram 4-bit) | 49,33 | 0,1036 | 90,31% |
| Sushi-2.6bpw (tabla n-gram 4-bit) | 43,95 | 0,1355 | 89,08% |
| oMLX oQ4e | 69,21 | 0,1370 | 88,87% |
| mlx-serve iQ-MLX 3.3bpw | 50,60 | 0,1987 | 86,28% |
| Vontra 4-bit g32 (TensorFold) | 75,60 | 0,2074 | 85,01% |
| Sushi-2bpw (tabla n-gram 4-bit) | 34,97 | 0,2080 | 85,94% |

Impacto de la tabla n-gram:

| Tabla | Tamano en disco | Incluida en | KLD con Sushi-3bpw | KLD con Sushi-4bpw |
|---|---|---|---|---|
| 4-bit, grupo 32 | 29,8 GiB | Sushi-3bpw | 0,1036 | 0,0654 |
| bf16 | 95,4 GiB | Sushi-4bpw | 0,1006 | 0,0592 |

Evaluación LLMProbe Hard 50 (MMLU-Pro, OlympiadBench, LiveBench, NIST Juliet): 41 correctas, 7 incorrectas, 2 parciales (límite de tokens), 82,0% con llmprobe 0.6.12, esfuerzo xhigh, 12k tokens de razonamiento y 16k de salida, KV 8-bit y MTP.

## Requisitos de hardware

- Memoria de GPU estimada: 49,33 GiB para los pesos; el objetivo declarado es un Mac de 64 GB de memoria unificada.
- Disco: ~79 GiB para el pack con tabla n-gram de 4 bits; ~145 GiB si se sustituye por la tabla bf16 de 95,4 GiB.
- GPU recomendadas: Apple Silicon con 64 GB o más de memoria unificada. No es compatible con CUDA ni con GPUs discretas tipo A100, H100 o RTX 4090, ya que el motor sushi es específico de Apple Silicon.
- Cabe en GPU de consumo: sí, en equipos Mac con 64 GB de memoria unificada; no en GPUs de consumo convencionales por incompatibilidad de motor.
- Sistema operativo: macOS 26.2 o superior.
- Opciones de despliegue: exclusivamente sushi v1.0.0 o superior. No carga en transformers, vLLM, mlx-lm ni exllamav3.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | KLD | Acuerdo top-1 | Licencia | Motor |
|---|---|---|---|---|---|---|
| Sushi-3bpw (este pack) | 28,85 B | 1.048.576 | 0,1036 | 90,31% | Qwen Community 1.0 | sushi |
| Sushi-4bpw | 28,85 B (base) | 1.048.576 | 0,0592 | 92,89% | Qwen Community 1.0 | sushi |
| mlx-serve iQ-MLX 3.3bpw | 28,85 B (base) | no disponible | 0,1987 | 86,28% | Qwen Community 1.0 | mlx-serve |
| oMLX oQ4e | 28,85 B (base) | no disponible | 0,1370 | 88,87% | Qwen Community 1.0 | oMLX |

La comparación se limita a otros empaquetados del mismo modelo base, ya que no se dispone de datos de benchmarks frente a modelos de distinta familia. A igualdad aproximada de memoria (~50 GiB), Sushi-3bpw reduce el KLD a aproximadamente la mitad del de iQ-MLX 3.3bpw (0,104 frente a 0,199).

## Limitaciones y advertencias

- Exclusividad de motor: el pack solo funciona con sushi v1.0.0 o superior en Apple Silicon con macOS 26.2 o superior; no es portable a otros runtimes.
- Degradación por cuantización: el KLD de 0,1036 y el acuerdo top-1 del 90,31% implican una pérdida de calidad medible frente al bf16; para tareas sensibles conviene valorar Sushi-4bpw.
- Dependencia de disco: la tabla n-gram de 29,8 GiB se lee desde SSD, por lo que el rendimiento depende de la velocidad del almacenamiento.
- Licencia: Qwen Community License 1.0, con condiciones específicas para grandes servicios comerciales; es necesario revisar el archivo LICENSE antes de un uso comercial a escala.
- Idiomas soportados: no disponibles en la información proporcionada, lo que impide confirmar cobertura multilingüe.
- Sesgos y alucinaciones: no se han publicado análisis específicos para este pack; hereda los del modelo base, no documentados en la información disponible.
- Parámetros activos del MoE: no disponibles, lo que dificulta estimar el coste computacional real por token.
- Madurez: el pack se publicó en septiembre de 2026 y se actualizó en noviembre de 2026, con 916 descargas y 11 likes; el ecosistema de herramientas en torno a sushi es reducido.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/beamster/Qwen3.8-Flash-Next-Sushi-3bpw
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Repositorio de sushi: https://github.com/beamivalice/sushi
- Documentación de uso de sushi: https://github.com/beamivalice/sushi/blob/main/docs/usage.md
- mlx-serve (origen del fork): https://github.com/ddalcu/mlx-serve
- Pack MLX-Serve mixed-4-8bit: https://huggingface.co/ddalcu/Qwen3.8-Flash-Next-MLX-Serve-mixed-4-8bit
- Pack MLX-Serve iQ-MLX 3.3bpw: https://huggingface.co/ddalcu/Qwen3.8-Flash-Next-MLX-Serve-iQ-MLX-3.3bpw
- Ficha en LLM Explorer: https://llm-explorer.com/model/beamster%2FQwen3.8-Flash-Next-Sushi-3bpw,5lIG1d9iKcYf5PIxMYTBNX
