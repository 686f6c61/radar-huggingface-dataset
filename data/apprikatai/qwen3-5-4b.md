# ApprikatAI/Qwen3.5-4B

## Resumen

Qwen3.5-4B es un modelo de lenguaje y visión de tipo causal con codificador visual, desarrollado por el equipo Qwen de Alibaba y publicado en el repositorio ApprikatAI/Qwen3.5-4B. Se trata de un modelo post-entrenado que integra una base multimodal de fusión temprana, capaz de procesar entradas de imagen y texto para generar respuestas conversacionales. Con 4.659.865.088 parámetros totales y una ventana de contexto nativa de 262.144 tokens, extensible hasta 1.010.000, está diseñado para cargas de trabajo que requieren razonamiento, código, agentes y comprensión visual en un mismo modelo.

La relevancia de esta versión radica en su arquitectura híbrida eficiente, que combina Gated Delta Networks (atención lineal) con atención con compuertas, y en su entrenamiento con refuerzo a escala de millones de entornos de agentes. Esto lo posiciona como una alternativa compacta frente a modelos de mayor tamaño, manteniendo un rendimiento competitivo en benchmarks de conocimiento, STEM y tareas agénticas. Su licencia Apache 2.0 facilita la adopción comercial y la integración en pipelines de producción.

El modelo se distribuye en formato Transformers con pesos safetensors y es compatible con vLLM, SGLang y KTransformers, lo que permite su despliegue en infraestructuras estándar de inferencia. Su tamaño de 4B parámetros lo hace apto para GPUs de consumo, aunque la longitud de contexto extendida y el codificador visual incrementan los requisitos de memoria en configuraciones de alta concurrencia.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Causal Language Model con codificador visual; híbrida Gated DeltaNet + Gated Attention |
| Parámetros totales | 4.659.865.088 (4B) |
| Parámetros activos | no disponible (no se especifica si es MoE sparse en la información proporcionada) |
| Longitud de contexto | 262.144 tokens nativos; extensible hasta 1.010.000 |
| Tipos de cuantización | no disponible |
| Idiomas soportados | 201 idiomas y dialectos (según model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (Transformers) |

## Arquitectura y entrenamiento

La arquitectura combina capas de Gated DeltaNet (atención lineal) con capas de Gated Attention en un layout de 8 bloques que alternan 3 capas de Gated DeltaNet + FFN por cada capa de Gated Attention + FFN. La dimensión oculta es 2560, con 32 capas totales, embedding de tokens de 248.320 (con padding) y salida LM atada al embedding. La Gated DeltaNet emplea 32 cabezas de atención lineal para V y 16 para QK, con dimensión de cabeza 128. La Gated Attention usa 16 cabezas para Q y 4 para KV, con dimensión de cabeza 256 y RoPE de 64 dimensiones. La FFN tiene dimensión intermedia de 9216. El modelo incluye un módulo MTP (Multi-Token Prediction) entrenado con múltiples pasos.

El entrenamiento se realizó en dos fases: pre-entrenamiento y post-entrenamiento, con fusión temprana sobre tokens multimodales. Según la model card, el entrenamiento con refuerzo se escaló a través de millones de entornos de agentes con distribuciones de tareas progresivamente complejas, y la infraestructura alcanza una eficiencia de entrenamiento multimodal cercana al 100% respecto al entrenamiento solo de texto. No se detalla el número exacto de tokens de entrenamiento ni la composición del dataset.

## Capacidades

- Generación de texto y razonamiento en dominios de conocimiento general, STEM y matemáticas.
- Comprensión de imágenes y texto (image-text-to-text) mediante codificador visual integrado.
- Generación y razonamiento sobre código, con soporte para tareas de programación.
- Capacidades agénticas y de razonamiento multi-paso, entrenado con RL en entornos de agentes.
- Soporte multilingüe amplio: 201 idiomas y dialectos según la model card.
- Compatibilidad con tool calling / function calling (implícito en el pipeline conversacional y agentes, aunque no se detalla explícitamente en la información disponible).
- Modo de pensamiento (thinking) no confirmado explícitamente para esta variante en la información proporcionada.
- Decodificación con Multi-Token Prediction (MTP) para acelerar la inferencia.

## Casos de uso

- Atención al cliente automatizada: el modelo puede gestionar conversaciones multi-turno con contexto largo gracias a sus 262.144 tokens de ventana nativa, manteniendo coherencia en historiales extensos y soportando 201 idiomas para despliegues internacionales.
- Generación de código en producción: su capacidad de razonamiento sobre código y su compatibilidad con vLLM y SGLang permiten integrarlo en pipelines de CI/CD para revisión automática, generación de tests o documentación técnica.
- Análisis de documentos con imágenes: al ser image-text-to-text, puede procesar capturas, diagramas o documentos escaneados junto con texto para extraer información estructurada o responder preguntas sobre el contenido visual.
- Agentes autónomos multi-paso: entrenado con RL en entornos de agentes, es adecuado para orquestar tareas que requieren planificación, uso de herramientas y razonamiento iterativo en dominios como automatización de flujos de trabajo.
- Asistente de investigación técnica: con contexto extensible hasta 1.010.000 tokens, puede ingerir artículos, papers y documentación extensa para resumir, comparar y responder consultas con trazabilidad sobre el material fuente.
- Despliegue en entornos con recursos limitados: sus 4B parámetros permiten ejecución en GPUs de consumo, facilitando prototipado rápido y aplicaciones edge o on-premise con requisitos de privacidad.
- Traducción y localización multilingüe: los 201 idiomas y dialectos soportados lo hacen útil para sistemas de traducción automática y adaptación cultural de contenido.

## Benchmarks y rendimiento

| Benchmark | GPT-OSS-120B | GPT-OSS-20B | Qwen3-Next-80B-A3B-Thinking | Qwen3-30BA3B-Thinking-2507 | Qwen3.5-9B | Qwen3.5-4B |
|---|---|---|---|---|---|---|
| MMLU-Pro | 80.8 | 74.8 | 82.7 | 80.9 | 82.5 | 79.1 |
| MMLU-Redux | 91.0 | 87.8 | 92.5 | 91.4 | 91.4 | no disponible en el extracto |

No se han publicado en la información disponible resultados adicionales de benchmarks como HumanEval, GSM8K u otros; la model card incluye una imagen de resultados y una tabla parcial de la que solo se dispone de las filas mostradas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; para un modelo de 4B parámetros en FP16 se estiman aproximadamente 9,3 GB de pesos (tamaño del repo), más overhead de activaciones y codificador visual.
- GPU recomendadas: no especificadas en la información proporcionada; por tamaño, cabría en GPUs de consumo como RTX 4090 (24 GB) en FP16, y en GPUs profesionales A100/H100 para despliegues de alta concurrencia.
- Compatibilidad con consumer GPU: probable en RTX 4090 y GPUs con 16-24 GB, aunque la ventana de contexto extendida y el procesamiento de imágenes aumentan los requisitos.
- Opciones de despliegue: Hugging Face Transformers, vLLM, SGLang, KTransformers (según la model card).
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | MMLU-Pro | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.5-4B | 4B | 262.144 (ext. 1.010.000) | 79.1 | Apache 2.0 | Hugging Face |
| Qwen3.5-9B | 9B | no disponible | 82.5 | Apache 2.0 (presumible) | Hugging Face |
| Qwen3-30BA3B-Thinking-2507 | 30B (MoE) | no disponible | 80.9 | no disponible | Hugging Face |
| GPT-OSS-20B | 20B | no disponible | 74.8 | no disponible | no disponible |

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la información proporcionada; como modelo entrenado con datos web a gran escala, es probable que herede sesgos presentes en dichos datos.
- Riesgo de alucinación: inherente a los modelos generativos; no se han publicado evaluaciones específicas de factualidad en la información disponible.
- Limitaciones de contexto o idioma: aunque se declaran 201 idiomas, no se especifica el rendimiento por idioma; la ventana extendida a 1.010.000 tokens puede degradar la calidad en los extremos.
- Restricciones de licencia: Apache 2.0 permite uso comercial, modificación y redistribución con atribución; no se identifican restricciones adicionales en la información disponible.
- Caveats para producción: el repositorio es una publicación de ApprikatAI sobre el modelo base Qwen/Qwen3.5-4B-Base; la fecha de creación (2026-11-15) y la ausencia de descargas/likes sugieren un artefacto reciente sin validación comunitaria. No se dispone de información sobre cuantizaciones oficiales ni de resultados de benchmarks completos.

## Enlaces

- Hugging Face: https://huggingface.co/ApprikatAI/Qwen3.5-4B
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B-Base
- Blog Qwen3.5: https://qwen.ai/blog?id=qwen3.5
- Qwen Chat: https://chat.qwen.ai
- Licencia: https://huggingface.co/Qwen/Qwen3.5-4B/blob/main/LICENSE
