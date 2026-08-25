# marafx2007/Qwen3.8-27B

## Resumen

Qwen3.8-27B es un modelo denso de lenguaje y visión de 27.000 millones de parámetros desarrollado por el equipo Qwen (Alibaba), que se presenta como la generación más capaz de la familia abierta Qwen hasta la fecha. Construido sobre la base arquitectónica de Qwen3.5, incorpora mejoras sustanciales en codificación, trabajo profesional, investigación y tareas de agente de largo horizonte. Se trata de un modelo nativo de visión y lenguaje que comprende imágenes y vídeos, desde diagramas STEM hasta documentos de oficina y vídeos de duración horaria.

La arquitectura es híbrida, combinando bloques de atención lineal (Gated DeltaNet) con bloques de atención clásica (Gated Attention), e incluye un vision encoder. Ofrece una ventana de contexto nativa de 262.144 tokens, extensible hasta 1.000.000, y un control flexible del modo de pensamiento: activado por defecto, desactivable por petición, con profundidad de razonamiento ajustable mediante `reasoning_effort` y conservación del contexto de razonamiento histórico mediante `preserve_thinking`. Su licencia Apache 2.0 permite uso comercial sin restricciones, y los pesos están disponibles en formato safetensors compatibles con Transformers, vLLM, SGLang y TokenSpeed.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Causal Language Model híbrido (Gated DeltaNet + Gated Attention) con Vision Encoder |
| Parámetros totales | 27.781.427.952 (27B) |
| Parámetros activos | No aplica (modelo denso) |
| Longitud de contexto | 262.144 tokens nativo, extensible a 1.000.000 |
| Tipos de cuantización | No disponible |
| Idiomas soportados | No disponible (la familia Qwen es típicamente multilingüe) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (transformers) |

## Arquitectura y entrenamiento

Qwen3.8-27B es un modelo causal de lenguaje con vision encoder, entrenado en dos etapas: pre-entrenamiento y post-entrenamiento. El módulo de lenguaje consta de 64 capas con dimensión oculta de 5120 y un embedding de tokens de 248.320 entradas (con padding). El layout de capas sigue el patrón 16 × (3 × (Gated DeltaNet → FFN) → 1 × (Gated Attention → FFN)), es decir, por cada bloque de 4 capas, tres son de atención lineal Gated DeltaNet y una de atención clásica Gated Attention.

Gated DeltaNet utiliza 48 cabezas de atención lineal para V y 16 para QK, con dimensión de cabeza 128. La Gated Attention emplea 24 cabezas para Q y 4 para KV, con dimensión de cabeza 256 y RoPE de 64 dimensiones. La red FFN tiene dimensión intermedia de 17.408. El modelo se entrenó además con Multi-Token Prediction (MTP) en múltiples pasos, una técnica que predice varios tokens de forma simultánea para mejorar la eficiencia de inferencia. Los datos de entrenamiento incluyen código, trabajo profesional, investigación y tareas de agente con retroalimentación del entorno, y el post-entrenamiento refuerza la fiabilidad en la finalización de tareas de múltiples pasos.

## Capacidades

- Generación de texto y razonamiento: modo de pensamiento configurable con `reasoning_effort`, desactivable por petición, y conservación del razonamiento histórico con `preserve_thinking`.
- Comprensión de imágenes: procesa diagramas STEM, documentos de oficina, gráficos y capturas de pantalla.
- Comprensión de vídeo: soporta vídeos de hasta una hora de duración, con análisis temporal del contenido.
- Razonamiento agente de largo plazo: diseñado para tareas complejas de múltiples pasos con retroalimentación del entorno y planificación autónoma.
- Tool calling y function calling: la versión hospedada en Qwen Cloud incluirá herramientas integradas oficiales; el soporte en pesos abiertos no está documentado explícitamente.
- Compatibilidad con entornos de desarrollo: soporta vLLM, SGLang, TokenSpeed y Hugging Face Transformers, así como harnesses de evaluación populares.
- Multi-Token Prediction (MTP): predicción simultánea de varios tokens para acelerar la generación.

## Casos de uso

1. Asistente de codificación en terminal: el modelo se evalúa en Terminal Bench 2.1 (Terminus), un benchmark de codificación agente en terminal, por lo que es adecuado para agentes de desarrollo que ejecutan comandos, editan archivos y gestionan entornos de terminal de forma autónoma.
2. Análisis de documentos científicos: con su visión encoder y contexto de 262K tokens, puede procesar papers con diagramas STEM, tablas y fórmulas, y responder preguntas complejas sobre el contenido.
3. Resumen de vídeos de larga duración: la capacidad de comprensión de vídeo de hasta una hora permite generar resúmenes, transcripciones y análisis de contenido audiovisual en entornos profesionales.
4. Automatización de flujos de oficina: el modelo puede interpretar capturas de pantalla, formularios y documentos para automatizar tareas repetitivas de productividad, como la extracción de datos o la generación de informes.
5. Agente de investigación con contexto extenso: la ventana extensible a 1M tokens permite cargar documentación completa y datasets de gran tamaño para análisis, síntesis y toma de decisiones en investigación.
6. Despliegue local en equipos AMD: con soporte de día 0 en Ryzen AI Max y GPUs Radeon, puede ejecutarse en estaciones de trabajo para desarrollo de agentes y prototipado sin infraestructura en la nube.
7. Asistente conversacional multimodal: con su pipeline image-text-to-text, puede sostener conversaciones con referencias a imágenes y vídeos, útil en atención al cliente con adjuntos visuales.

## Benchmarks y rendimiento

La model card del autor incluye una tabla de benchmarks comparando Qwen3.8-27B con Qwen3.6-27B, Qwen3.7-Plus, Muse Glimmer-30B y Opus4.6 Max. La tabla comienza con la categoría Coding y el benchmark de codificación agente en terminal Terminal Bench 2.1 (Terminus), pero los valores numéricos no están disponibles en la información proporcionada, ya que la tabla se corta en el encabezado de la primera fila. No se han publicado resultados de benchmarks completos en la información disponible.

## Requisitos de hardware

- El repositorio safetensors ocupa 55,6 GB, lo que corresponde a pesos en BF16/FP16 para 27,78B parámetros (2 bytes por parámetro).
- Para inferencia en FP16 se necesitan aproximadamente 56 GB de VRAM: requiere múltiples GPU (por ejemplo, 2× A100 40GB o 2× RTX 4090 24GB) o una GPU de 80GB como H100.
- Con cuantización 4-bit (Q4_K_M), el modelo podría caber en una GPU consumer de 24 GB (RTX 3090/4090), aunque no hay cuantizaciones oficiales publicadas.
- Soporte de despliegue en vLLM, SGLang, TokenSpeed y Hugging Face Transformers, según la model card.
- El blog de AMD confirma ejecución en Ryzen AI MAX y GPUs Radeon, con soporte de día 0 para equipos locales.
- La versión hospedada en Qwen Cloud estará disponible próximamente con contexto de 1M por defecto y herramientas integradas, sin gestión de infraestructura.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Especialidad |
|---|---|---|---|---|
| Qwen3.8-27B | 27B | 262K / 1M extensible | Apache 2.0 | Visión-lenguaje, agentes, código |
| Qwen3.6-27B | 27B | No disponible | Apache 2.0 | Generación anterior de la misma familia |
| Qwen3.7-Plus | No disponible | No disponible | No disponible | Variante Plus de la serie Qwen3.7 |
| Muse Glimmer-30B | 30B | No disponible | No disponible | Modelo denso de 30B de otra familia |

La comparativa se basa en los modelos listados en la tabla de benchmarks de la model card. Los datos de parámetros y contexto de las alternativas no están disponibles en la información proporcionada. El modelo se posiciona como una mejora incremental sobre Qwen3.6-27B, con especial énfasis en capacidades agente y visión.

## Limitaciones y advertencias

- Sesgos conocidos: no se han publicado evaluaciones de sesgo para este modelo.
- Riesgo de alucinación: como todo modelo causal de lenguaje, puede generar información falsa o inventada, especialmente en tareas de razonamiento de múltiples pasos sin verificación externa.
- Limitaciones de contexto: aunque la ventana nativa es de 262K tokens, el rendimiento puede degradarse en contextos cercanos al límite; se recomienda evaluar el caso de uso específico antes de desplegar en producción.
- Limitaciones de idioma: los idiomas soportados no están documentados oficialmente; aunque la familia Qwen es típicamente multilingüe, no hay garantías para idiomas de baja representación.
- Restricciones de licencia: Apache 2.0 permite uso comercial libre, pero se debe mantener la atribución y notificar cambios en los archivos de licencia.
- Disponibilidad de cuantizaciones: no se publican formatos GGUF o cuantizaciones oficiales; los usuarios que quieran desplegar en GPU consumer deberán generar sus propias cuantizaciones, lo que puede afectar a la calidad.
- El repositorio de Hugging Face listado como `marafx2007/Qwen3.8-27B` tiene 0 descargas y 0 likes; el repositorio oficial es `Qwen/Qwen3.8-27B`. Se recomienda descargar los pesos desde la fuente oficial para evitar versiones no verificadas.

## Enlaces

- Modelo oficial en Hugging Face: https://huggingface.co/Qwen/Qwen3.8-27B
- Repositorio de la ficha: https://huggingface.co/marafx2007/Qwen3.8-27B
- Qwen Cloud (versión hospedada): https://www.qwencloud.com/models/qwen3.8-27b
- LM Studio: https://lmstudio.ai/models/qwen3.8
- Blog de AMD (soporte día 0): https://www.amd.com/en/blogs/2026/run-qwen-3-8-27b-on-amd-ryzen-ai-max-and-radeon-graphics-cards-day-0.html
