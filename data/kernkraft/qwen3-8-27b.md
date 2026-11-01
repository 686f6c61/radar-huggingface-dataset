# kernkraft/Qwen3.8-27B

## Resumen

Qwen3.8-27B es un modelo de lenguaje y visión de tipo dense (no MoE) publicado por el usuario kernkraft en Hugging Face bajo licencia Apache 2.0. Según su model card, se presenta como la generación más reciente de la familia Qwen open-model, construida sobre la base arquitectónica de Qwen3.5, e incorpora un encoder de visión nativo para comprensión de imágenes y vídeo. El modelo declara 27 000 millones de parámetros y una ventana de contexto nativa de 262 144 tokens, extensible hasta 1 000 000.

La arquitectura combina capas de atención lineal (Gated DeltaNet) con capas de atención completa (Gated Attention) en un patrón híbrido de 64 capas, además de Multi-Token Prediction (MTP) entrenado con múltiples pasos. El modelo está orientado a tareas de codificación, trabajo profesional, investigación y agentes de largo horizonte, con control flexible del modo de razonamiento (thinking mode) activable o desactivable por petición.

Es relevante porque propone un modelo dense de 27B con capacidades multimodales y contexto muy largo en un formato desplegable en infraestructura propia, compatible con Transformers, vLLM, SGLang y TokenSpeed. No obstante, la información disponible es limitada: el repositorio acumula 36 descargas y 0 likes, y la model card está incompleta en la sección de benchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Causal Language Model con Vision Encoder; híbrido Gated DeltaNet (atención lineal) + Gated Attention |
| Parametros totales | 27 781 427 952 (27,78B) |
| Parametros activos | No aplica (modelo dense, no MoE) |
| Longitud de contexto | 262 144 tokens nativos; extensible hasta 1 000 000 |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

El modelo emplea un transformer híbrido de 64 capas con dimensión oculta de 5120 y layout `16 × (3 × (Gated DeltaNet → FFN) → 1 × (Gated Attention → FFN))`. Las capas de Gated DeltaNet usan 48 cabezas de atención lineal para V y 16 para QK, con dimensión de cabeza 128. Las capas de Gated Attention usan 24 cabezas para Q y 4 para KV, con dimensión de cabeza 256 y RoPE de 64 dimensiones. La FFN tiene dimensión intermedia de 17 408, y el embedding de tokens y la salida LM son de 248 320 (con padding). Incluye Multi-Token Prediction (MTP) entrenado con múltiples pasos, lo que puede habilitar decodificación especulativa.

Según la model card, el modelo ha pasado por pre-entrenamiento y post-entrenamiento, pero no se especifican el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron RLHF o DPO. Tampoco se detalla la arquitectura del encoder de visión más allá de su existencia. La model card menciona mejoras en planificación autónoma y manejo de retroalimentación del entorno, así como control flexible del razonamiento mediante los parámetros `reasoning_effort` y `preserve_thinking`.

## Capacidades

- Generación de texto y razonamiento con modo de pensamiento (thinking mode) activado por defecto y desactivable por petición.
- Codificación y tareas de agente en terminal (agentic terminal coding), según los benchmarks declarados.
- Comprensión de imágenes y vídeo de forma nativa, incluyendo diagramas STEM, documentos y vídeos de hasta una hora.
- Soporte de tool calling y function calling (mencionado de forma implícita vía "official built-in tools" en la versión alojada).
- Ejecución de agentes autónomos y tareas de múltiples pasos de largo horizonte.
- Capacidades multilingües: no se detallan los idiomas soportados.
- Ajuste de profundidad de razonamiento mediante `reasoning_effort` y retención de contexto de razonamiento histórico mediante `preserve_thinking`.
- Compatibilidad declarada con Transformers, vLLM, SGLang y TokenSpeed.

## Casos de uso

- Agentes de codificación en terminal: el modelo declara resultados en Terminal Bench 2.1 (Terminus), lo que lo hace adecuado para tareas de resolución autónoma de problemas en entornos de línea de comandos con retroalimentación del entorno.
- Análisis de documentos técnicos y diagramas STEM: gracias a su encoder de visión nativo, puede procesar figuras, esquemas y documentos escaneados junto con texto para tareas de investigación y extracción de información.
- Procesamiento de vídeo de larga duración: la ventana de contexto de 262K tokens y la capacidad de entender vídeos de hasta una hora permiten resumir, indexar o responder preguntas sobre contenido audiovisual.
- Asistencia en investigación y trabajo profesional: con contexto extensible hasta 1M tokens, puede manejar corpus largos, revisiones de literatura o análisis de múltiples documentos en una sola sesión.
- Automatización de pipelines de CI/CD con tool calling: su soporte declarado de herramientas y agentes permite integrarlo en flujos de integración continua para diagnóstico de fallos y generación de parches.
- Despliegue en infraestructura propia: al ser un modelo dense de 27B con licencia Apache 2.0 y pesos en safetensors, es viable para organizaciones que necesitan inferencia local con vLLM o SGLang sin depender de APIs externas.
- Chat multi-turno con contexto largo: la retención de contexto de razonamiento (`preserve_thinking`) facilita conversaciones prolongadas donde el historial de decisiones previas es relevante.

## Benchmarks y rendimiento

La model card incluye una tabla de benchmarks comparativa con Qwen3.6-27B, Qwen3.7-Plus, Muse Glimmer-30B y Opus4.6 Max, pero el contenido extraído está truncado y solo se aprecia la cabecera de la sección "Coding" con la fila "Agentic terminal coding — Terminal Bench 2.1 (Terminus)". No se dispone de los valores numéricos.

No se han publicado resultados de benchmarks completos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia orientativa por tamaño (27,78B parámetros), en fp16 requeriría aproximadamente 55,6 GB (tamaño del repo), en int8 unos 28 GB y en int4 unos 14 GB; estas cifras son estimaciones por tamaño, no datos publicados.
- GPU recomendadas: no especificadas en la información disponible. Por tamaño, cabría esperar viabilidad en A100 80GB, H100 80GB y configuraciones multi-GPU para fp16.
- ¿Cabe en GPU consumer? No confirmado. En cuantización int4 podría ajustarse en GPUs con 24 GB de VRAM (RTX 3090/4090), pero no hay datos oficiales de cuantización ni de soporte.
- Opciones de despliegue: Transformers, vLLM, SGLang y TokenSpeed, según la model card.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Qwen3.8-27B | 27,78B (dense) | 262K nativo, hasta 1M | Apache 2.0 | Hugging Face (kernkraft) |
| Qwen3.6-27B | No disponible | No disponible | No disponible | Mencionado en benchmarks |
| Qwen3.7-Plus | No disponible | No disponible | No disponible | Mencionado en benchmarks |
| Muse Glimmer-30B | ~30B (por nombre) | No disponible | No disponible | Mencionado en benchmarks |
| Opus4.6 Max | No disponible | No disponible | No disponible | Mencionado en benchmarks |

Los modelos comparables citados en la model card no tienen especificaciones públicas en la información proporcionada, por lo que la comparación cuantitativa no es posible.

## Limitaciones y advertencias

- La model card está incompleta: la tabla de benchmarks aparece truncada y no se pueden verificar los resultados declarados.
- No se especifican los idiomas soportados, lo que impide evaluar el rendimiento multilingüe.
- No se detallan los datos de entrenamiento (tokens, composición, alineación) ni si se aplicaron RLHF o DPO.
- No hay información sobre sesgos conocidos ni sobre tasas de alucinación.
- El repositorio tiene muy poca tracción (36 descargas, 0 likes) y fue creado y actualizado el mismo día, lo que no permite validar su fiabilidad ni su procedencia real.
- Aunque la licencia declarada es Apache 2.0, conviene verificar la procedencia de los pesos y la coherencia con la familia Qwen original antes de un uso comercial.
- La extensión de contexto hasta 1M tokens se menciona como característica de la versión alojada en Qwen Cloud, no necesariamente del checkpoint local.
- No hay datos de cuantizaciones soportadas ni de rendimiento en producción.

## Enlaces

- Hugging Face: https://huggingface.co/kernkraft/Qwen3.8-27B
- Qwen Cloud (modelo alojado): https://www.qwencloud.com/models/qwen3.8-27b
- Qwen Cloud (servicio): https://www.qwencloud.com
