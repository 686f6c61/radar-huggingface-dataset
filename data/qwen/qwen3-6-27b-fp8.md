# Qwen/Qwen3.6-27B-FP8

## Resumen

Qwen3.6-27B-FP8 es la cuantización oficial en FP8 del modelo denso Qwen3.6-27B, desarrollado por el equipo Qwen de Alibaba. Se trata de un modelo de lenguaje causal con codificador de visión (image-text-to-text), por lo que acepta tanto texto como imágenes como entrada. La versión FP8 emplea cuantización de grano fino con bloques de 128 y, según el autor, mantiene métricas de rendimiento prácticamente idénticas a las del modelo original en BF16, lo que permite desplegarlo con menor huella de memoria sin renunciar a calidad.

El modelo cuenta con 27.781.427.952 parámetros (aproximadamente 27,8 mil millones) y una longitud de contexto nativa de 262.144 tokens, extensible hasta 1.010.000 tokens. Su arquitectura combina capas de atención lineal (Gated DeltaNet) con capas de atención con compuerta (Gated Attention) en un diseño híbrido de 64 capas, e incorpora entrenamiento con multi-token prediction (MTP). Es la primera variante de pesos abiertos de la serie Qwen3.6.

La relevancia actual del modelo reside en su enfoque hacia el "agentic coding": razonamiento a nivel de repositorio, flujos de trabajo de frontend y una nueva opción de "Thinking Preservation" que retiene el contexto de razonamiento de mensajes históricos. Se distribuye bajo licencia Apache 2.0, lo que facilita su uso comercial, y es compatible con Transformers, vLLM, SGLang y KTransformers.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal híbrido con codificador de visión; 64 capas con layout 16 × (3 × (Gated DeltaNet → FFN) → 1 × (Gated Attention → FFN)) |
| Parametros totales | 27.781.427.952 (≈27,8 B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 262.144 tokens nativos; extensible hasta 1.010.000 tokens |
| Tipos de cuantizacion | FP8 de grano fino con tamaño de bloque 128 (esta versión); el modelo base se distribuye en BF16 |
| Idiomas soportados | No disponible en la información proporcionada |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (compatible con Transformers, vLLM, SGLang, KTransformers) |

Otros datos técnicos: dimensión oculta de 5120, embedding de tokens de 248.320 (con padding), dimensión intermedia de la FFN de 17.408. En Gated DeltaNet: 48 cabezas de atención lineal para V y 16 para QK, dimensión de cabeza 128. En Gated Attention: 24 cabezas para Q y 4 para KV, dimensión de cabeza 256, dimensión de RoPE 64. Salida del LM de 248.320 (con padding). Tamaño del repositorio: 30,9 GB.

## Arquitectura y entrenamiento

El modelo es un transformer causal denso con codificador de visión y una arquitectura híbrida de atención. De las 64 capas, la mayoría emplea Gated DeltaNet (atención lineal), intercalada con capas de Gated Attention clásica con compuerta, en un patrón repetido 16 veces. Este diseño busca combinar la eficiencia de la atención lineal en contextos largos con la capacidad expresiva de la atención tradicional. La FFN tiene una dimensión intermedia de 17.408, y el modelo se entrenó con multi-token prediction (MTP) en varios pasos, técnica que puede aprovecharse para decodificación especulativa.

El entrenamiento consta de fases de preentrenamiento y postentrenamiento. La model card no detalla el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas concretas de RLHF o DPO. La versión FP8 aquí descrita se obtiene mediante cuantización de grano fino con bloques de 128, y el autor afirma que sus métricas de rendimiento son casi idénticas a las del modelo original. Entre las innovaciones destacadas está la "Thinking Preservation", que permite retener el contexto de razonamiento de mensajes históricos para reducir sobrecarga en desarrollo iterativo.

## Capacidades

- Generación de texto y razonamiento en modo "thinking" y "non-thinking" (según la información de la librería de Modal).
- Comprensión de imágenes junto con texto (pipeline image-text-to-text, con codificador de visión).
- Codificación agéntica: flujos de trabajo de frontend y razonamiento a nivel de repositorio.
- Razonamiento multi-paso y soporte para agentes.
- "Thinking Preservation": retención del contexto de razonamiento de mensajes históricos.
- Capacidades multilingües: la model card incluye el benchmark SWE-bench Multilingual, lo que evidencia soporte para tareas de código en varios idiomas, aunque la lista concreta de idiomas no está disponible.
- Entrenamiento con multi-token prediction (MTP), aprovechable para decodificación especulativa.
- Soporte de tool calling / function calling: no confirmado explícitamente en la información proporcionada.

## Casos de uso

- Agente de codificación sobre repositorios: el modelo puede razonar a nivel de repositorio y resolver tareas de tipo SWE-bench (77,2 en SWE-bench Verified), por lo que encaja en pipelines que reciben un issue y deben producir un parche sobre un código base real.
- Desarrollo de frontend asistido: según el autor, maneja flujos de trabajo de frontend con mayor fluidez y precisión, útil para generar y modificar componentes de interfaz dentro de un proyecto existente.
- Desarrollo iterativo con contexto de razonamiento persistente: la opción "Thinking Preservation" permite conservar el razonamiento de turnos anteriores, lo que reduce la sobrecarga en sesiones largas de depuración o refactorización.
- Análisis de documentos con imágenes: al ser image-text-to-text, puede procesar capturas, diagramas o documentos escaneados junto con instrucciones textuales, con una ventana de 262.144 tokens para documentos extensos.
- Procesamiento de bases de código grandes: la ventana nativa de 262.144 tokens (ampliable a 1.010.000) permite cargar múltiples archivos y contextos de repositorio en una sola pasada.
- Despliegue en infraestructura con memoria limitada: la cuantización FP8 reduce la huella de memoria respecto a BF16 con un rendimiento declarado casi idéntico, adecuada para servir el modelo en GPUs de 40-80 GB.
- Asistente técnico multilingüe sobre código: su rendimiento en SWE-bench Multilingual lo hace apto para tareas de mantenimiento de software en distintos idiomas de programación y lenguajes naturales.

## Benchmarks y rendimiento

Datos publicados por el autor en la model card (categoría Coding Agent):

| Benchmark | Qwen3.5-27B | Qwen3.5-397B-A17B | Gemma4-31B | Claude 4.5 Opus | Qwen3.6-35B-A3B | Qwen3.6-27B |
|---|---|---|---|---|---|---|
| SWE-bench Verified | 75,0 | 76,2 | 52,0 | 80,9 | 73,4 | 77,2 |
| SWE-bench Pro | 51,2 | 50,9 | 35,7 | 57,1 | 49,5 | 53,5 |
| SWE-bench Multilingual | 69,3 | 69,3 | 51,0 (dato truncado en la fuente) | No disponible | No disponible | No disponible |

Nota: la tabla de la model card está truncada en la información proporcionada; los valores de SWE-bench Multilingual para Gemma4-31B, Claude 4.5 Opus, Qwen3.6-35B-A3B y Qwen3.6-27B no están completos en la fuente. No se han publicado en la información disponible resultados de MMLU, HumanEval, GSM8K ni otros benchmarks de lenguaje general. Los valores corresponden al modelo Qwen3.6-27B; el autor afirma que la versión FP8 presenta métricas casi idénticas.

## Requisitos de hardware

- VRAM estimada: con 27,8 B parámetros en FP8 (1 byte por parámetro) los pesos ocupan aproximadamente 27,8 GB; añadiendo overhead de activaciones y caché KV para contexto largo, se recomienda un mínimo de 32-40 GB de VRAM para contextos moderados. Para aprovechar los 262.144 tokens de contexto se necesita bastante más memoria.
- GPU recomendadas: A100 (40/80 GB) y H100 (80 GB) para despliegue en producción con contexto largo; también se mencionan despliegues gestionados en Azure y SageMaker.
- GPU de consumo: el modelo no cabe en GPUs de consumo de 24 GB (RTX 4090) en FP8 sin offloading; requeriría cuantizaciones adicionales o descarga a CPU/VRAM compartida, no documentadas en la información disponible.
- Opciones de despliegue: Hugging Face Transformers, vLLM, SGLang y KTransformers, según la model card.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | SWE-bench Verified | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.6-27B (FP8) | 27,8 B (denso) | 262.144 nativos; hasta 1.010.000 | 77,2 | Apache 2.0 | Pesos abiertos en Hugging Face |
| Qwen3.5-27B | 27 B (denso) | No disponible | 75,0 | No disponible | Pesos abiertos (serie Qwen3.5) |
| Qwen3.6-35B-A3B | 35 B totales (MoE, 3 B activos) | No disponible | 73,4 | No disponible | Pesos abiertos |
| Gemma4-31B | 31 B | No disponible | 52,0 | No disponible | Pesos abiertos |
| Claude 4.5 Opus | No disponible | No disponible | 80,9 | Propietaria | Solo API |

La comparativa se limita a los datos de la model card. Qwen3.6-27B supera a su predecesor Qwen3.5-27B y a la variante MoE Qwen3.6-35B-A3B en SWE-bench Verified, y se acerca a Claude 4.5 Opus (80,9) pese a ser un modelo abierto de menor tamaño declarado. No se dispone de datos de contexto ni licencia de los modelos comparados en la información proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la información proporcionada; como todo modelo entrenado con datos web, es previsible que herede sesgos de esos datos, pero no hay confirmación del autor.
- Riesgo de alucinación: no cuantificado en la información disponible; debe asumirse el riesgo habitual en modelos generativos, especialmente en tareas de código donde una alucinación puede producir parches incorrectos.
- Idiomas: la lista oficial de idiomas soportados no está disponible; el soporte multilingüe se infiere del benchmark SWE-bench Multilingual, no de una declaración explícita.
- Contexto: aunque el contexto nativo es de 262.144 tokens y se declara extensible a 1.010.000, el rendimiento en la ventana extendida no está cuantificado en la información disponible.
- Cuantización FP8: el autor afirma un rendimiento casi idéntico al BF16, pero no se aportan métricas comparativas detalladas entre ambas versiones.
- Licencia: Apache 2.0 permite uso comercial, pero conviene revisar el archivo LICENSE del repositorio para confirmar condiciones y posibles avisos adicionales.
- Producción: no hay datos publicados de latencia ni throughput, por lo que el dimensionamiento debe validarse empíricamente antes de desplegar.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Qwen/Qwen3.6-27B-FP8
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-27B
- Blog de Qwen3.6-27B: https://qwen.ai/blog?id=qwen3.6-27b
- Qwen Chat: https://chat.qwen.ai/
- Sitio oficial de Qwen: https://qwen.ai/home
- Ficha en Modal: https://modal.com/library/qwen/qwen3-6-27b-fp8
- Licencia: https://huggingface.co/Qwen/Qwen3.6-27B-FP8/blob/main/LICENSE
- Wikipedia (Qwen): https://fr.wikipedia.org/wiki/Qwen
