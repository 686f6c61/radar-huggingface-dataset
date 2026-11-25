# Infinity-io/llm

## Resumen

Infinity-io/llm es un modelo de generación de texto publicado en Hugging Face por el usuario Infinity-io, que se presenta como una destilación y cuantización del modelo base moonshotai/Kimi-K3.1-Pro, un Mixture-of-Experts de frontera de 2,8 billones de parámetros totales y 104.000 millones de parámetros activos. El artefacto publicado pesa 12,0 GB y contiene 12.008.815.616 parámetros reales según los safetensors del repositorio, lo que evidencia que no se trata del modelo original completo, sino de una consolidación comprimida de sus "expertos" mediante una técnica propietaria denominada AW-SECD (Activation-Weighted Super-Expert Consolidation & Residual Drift Compensation).

La propuesta central del autor es permitir la ejecución local, incluso en un portátil con 16 GB de RAM, de un modelo que originalmente requeriría del orden de 5.600 GB de VRAM en un clúster de 8 GPU A100/H100. Para ello combina consolidación de subespacios de expertos, compensación de deriva residual y cuantización a 4 bits (Q4_K_M en GGUF), con la promesa de retener más del 95 % del conocimiento del modelo base.

El modelo se distribuye con licencia Apache 2.0, soporte para transformers, llama.cpp, Ollama, LM Studio y Jan.ai, y está etiquetado para casos de uso de razonamiento, matemáticas, código y contexto largo. Es relevante ahora porque ejemplifica una tendencia creciente: la compresión agresiva de MoE de frontera para despliegue on-device, aunque la ausencia de validación independiente y de datos de entrenamiento publicados exige cautela antes de adoptarlo en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE) consolidado; pesos en safetensors con `custom_code` y variante GGUF |
| Parametros totales | 12.008.815.616 (12,0 GB en safetensors); el modelo base declara 2,8 T totales |
| Parametros activos | 104.000 millones en el modelo base (no disponible para el artefacto comprimido) |
| Longitud de contexto | no disponible (etiquetado como `long-context`, sin cifra publicada) |
| Tipos de cuantizacion | 4 bits (Q4_K_M en GGUF), 8 bits, `4bit` en safetensors |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (transformers), GGUF (llama.cpp/Ollama) |

## Arquitectura y entrenamiento

El modelo base Kimi-K3.1-Pro es un transformer con arquitectura Mixture-of-Experts de 2,8 billones de parámetros totales y 104.000 millones activos por token. El artefacto publicado no es un entrenamiento nuevo, sino una transformación del modelo base: el autor aplica AW-SECD, un procedimiento que consolida los subespacios de los expertos ponderando por activación y compensa la deriva residual introducida por la compresión, de modo que el resultado es un modelo denso de aproximadamente 12.000 millones de parámetros que aproxima el comportamiento del MoE original.

No se publican datos sobre el corpus de entrenamiento del modelo base (número de tokens, composición, proporción de código, matemáticas o multilingüe), ni sobre si hubo fases de RLHF, DPO o ajuste por preferencias. Tampoco se documenta el proceso de calibración de AW-SECD: no se indica qué conjunto de datos se usó para estimar las ponderaciones de activación ni cómo se midió la "deriva cero" que el autor afirma. La innovación declarada es, por tanto, metodológica (consolidación de expertos con compensación de deriva) más que arquitectónica, y carece de paper, código de entrenamiento o reproducibilidad publicada.

## Capacidades

- Generación de texto conversacional multi-turno con plantilla de chat `<|user|> ... <|assistant|>`.
- Razonamiento paso a paso, con ejemplos de la model card orientados a deducción causal (ARC-Challenge) y matemáticas multi-paso (GSM8K).
- Generación de código Python, incluyendo funciones con docstring y manejo de casos límite (HumanEval).
- Razonamiento matemático de varios pasos (resolución de ecuaciones lineales, problemas tipo GSM8K).
- Contexto largo, según la etiqueta `long-context` (sin cifra concreta publicada).
- Despliegue on-device: ejecución en CPU con AVX2/AVX-512, GPU Metal en Apple Silicon y CUDA en NVIDIA.
- Compatibilidad con tooling estándar: transformers, llama.cpp, Ollama, LM Studio, Jan.ai, Colab y Kaggle.
- No se documentan capacidades de visión, audio, tool calling nativo ni modo "thinking" explícito.

## Casos de uso

- Asistencia offline en portátil: ejecutar el GGUF Q4_K_M con Ollama o LM Studio en un equipo de 16 GB de RAM permite disponer de un asistente de razonamiento sin conexión ni coste de API, útil en entornos con requisitos de confidencialidad.
- Prototipado rápido de aplicaciones de razonamiento: al cargarse con `AutoModelForCausalLM` en transformers sobre una GPU de 6-16 GB, sirve para validar prompts y flujos de deducción antes de migrar a un modelo mayor en la nube.
- Enseñanza y demostraciones de MoE: el contraste entre los 2,8 T del modelo base y los 12 GB del artefacto permite ilustrar en clase conceptos de consolidación de expertos y cuantización.
- Generación de código en scripts locales: con ejemplos HumanEval en la model card, encaja en tareas de autocompletado o generación de funciones Python dentro de editores con backend llama.cpp.
- Resolución de problemas matemáticos guiados: para cuadernos de ejercicios o tutores que necesitan cadenas de razonamiento explícitas en un dispositivo sin GPU dedicada.
- Despliegue en notebooks gratuitos (Colab T4/P100, Kaggle): el autor proporciona notebooks de un clic, lo que facilita pruebas de concepto y benchmarks informales sin infraestructura propia.
- Evaluación comparativa de técnicas de compresión: investigadores pueden usar el modelo como caso de estudio para medir la pérdida real de calidad frente al Kimi-K3.1-Pro original.

## Benchmarks y rendimiento

Los únicos datos disponibles proceden de la model card del autor y no han sido verificados de forma independiente:

| Benchmark | Resultado declarado (AW-SECD SuperExpert) | Referencia declarada (modelo base) |
|---|---|---|
| ARC-Challenge | 85,8 % | línea base de frontera (sin cifra) |
| GSM8K | 82,1 % | línea base de frontera (sin cifra) |
| HumanEval | 80,4 % | línea base de frontera (sin cifra) |

El autor afirma una retención de conocimiento superior al 95 % y "deriva cero" en razonamiento multi-paso, pero no publica la metodología de evaluación, el número de muestras, la configuración de decodificación ni los resultados del modelo base con los que compara. No hay resultados de MMLU, MMLU-Pro, MATH, BBH ni de benchmarks multilingües.

## Requisitos de hardware

- VRAM/RAM estimada: 12,0 GB para el GGUF Q4_K_M; en torno a 24 GB para los pesos safetensors en fp16 (12,0 GB de parámetros × 2 bytes) y aproximadamente 12 GB en 8 bits.
- GPU recomendadas: cualquier GPU NVIDIA con 6-16 GB de VRAM (RTX 3060, 4060 Ti, 4070, 4080, 4090) para offload CUDA; A100/H100 no son necesarias y estarían sobredimensionadas.
- Apple Silicon: verificado por el autor en M1/M2/M3/M4 con 16 GB de memoria unificada, a 25+ tok/s según su medición.
- Consumer GPU: sí, cabe en GPU de gama media y en portátiles de 16 GB; también funciona en CPU con AVX2/AVX-512.
- Opciones de despliegue: llama.cpp (`llama-cli`), Ollama (`ollama run`), LM Studio, Jan.ai, transformers con `trust_remote_code=True`, y notebooks de Colab/Kaggle.
- Latencia y throughput: 25+ tok/s en Apple Silicon según el autor; no se publican cifras para CUDA ni CPU.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Infinity-io/llm (este) | 12,0 B (destilado de MoE 2,8 T) | no disponible | Apache 2.0 | Hugging Face, GGUF, Ollama | Benchmarks solo del autor |
| moonshotai/Kimi-K3.1-Pro (base) | 2,8 T totales / 104 B activos | no disponible | no disponible | Referenciado como base | Requiere ~5.600 GB de VRAM según el autor |
| Mistral 7B / Qwen2.5 7B | 7 B | 8K-32K típicamente | Apache 2.0 | Amplia | Modelos densos pequeños de referencia; sin datos comparativos publicados aquí |
| Otros "SuperExpert" del mismo autor (GLM-5.3 SuperExpert v2) | no disponible | no disponible | no disponible | Hugging Face | Misma metodología AW-SECD |

No se dispone de comparaciones independientes frente a modelos de tamaño similar, por lo que la comparativa debe tomarse como orientativa.

## Limitaciones y advertencias

- Los benchmarks proceden exclusivamente de la model card del autor, sin evaluación independiente ni reproducibilidad publicada; deben tratarse como afirmaciones no verificadas.
- La técnica AW-SECD no está documentada con paper, código de entrenamiento ni detalles de calibración, lo que impide auditar la fidelidad respecto al modelo base.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin señales de adopción por la comunidad.
- El identificador del modelo en la información (`Infinity-io/llm`) no coincide con el usado en la model card (`shashanth-27xA9/Kimi-K3.1-Pro-SuperExpert-12GB`), lo que genera ambigüedad sobre la autoría y la cadena de custodia del artefacto.
- No se especifican los idiomas soportados; el comportamiento multilingüe es desconocido.
- No se publica la longitud de contexto efectiva, pese a la etiqueta `long-context`.
- Riesgo de alucinación inherente a los modelos de lenguaje, agravado por la compresión agresiva de un MoE de frontera a un denso de 12 B.
- Aunque la licencia es Apache 2.0, la licencia del modelo base Kimi-K3.1-Pro no se detalla; conviene verificar los términos del modelo original antes de un uso comercial.
- La etiqueta `trust_remote_code=True` implica ejecutar código del autor; debe revisarse en entornos de producción.

## Enlaces

- Hugging Face: https://huggingface.co/Infinity-io/llm
- Modelo base: https://huggingface.co/moonshotai/Kimi-K3.1-Pro
- Repositorio del autor en GitHub (notebooks): https://github.com/shashanth-27xA9/Kimi-K3.1-Pro-SuperExpert-12GB
- Notebook de ejecución en Colab: https://colab.research.google.com/github/shashanth-27xA9/Kimi-K3.1-Pro-SuperExpert-12GB/blob/main/1_click_run_kimi_12gb.ipynb
- Notebook de benchmarks: https://colab.research.google.com/github/shashanth-27xA9/Kimi-K3.1-Pro-SuperExpert-12GB/blob/main/benchmark_evaluation_and_test.ipynb
- Demo en Hugging Face Spaces: https://huggingface.co/spaces/shashanth-27xA9/Kimi-K3.1-Pro-Playground
- Descarga directa del GGUF: https://huggingface.co/shashanth-27xA9/Kimi-K3.1-Pro-SuperExpert-12GB/resolve/main/kimi-k3.1-pro-superexpert-12gb-q4_k_m.gguf
- Notebook de Kaggle: https://www.kaggle.com/code/hariniathukuri/kimi-k3-1-pro-12gb-1-click-starter
