# Dmitry1595/Qwen3.8-27B

## Resumen

Qwen3.8-27B es un modelo de lenguaje denso multimodal (visión-lenguaje) desarrollado por el equipo Qwen de Alibaba, presentado como la generación más capaz de la familia abierta Qwen hasta la fecha. Construido sobre la base arquitectónica de Qwen3.5, incorpora mejoras sustanciales en tareas de programación, trabajo profesional, investigación y tareas agénticas de horizonte largo. Con 27.781 millones de parámetros, ofrece una ventana de contexto nativa de 262.144 tokens, extensible hasta 1.000.000, y soporta entrada de imágenes y vídeo de hasta una hora de duración.

El modelo destaca por su control flexible del razonamiento: el modo de pensamiento está activado por defecto y puede desactivarse por petición, con parámetros como `reasoning_effort` para ajustar la profundidad y `preserve_thinking` para retener el contexto de razonamiento en mensajes históricos. Su licencia Apache 2.0 y su tamaño compacto (27B) lo hacen especialmente atractivo para despliegue local en hardware de consumo, manteniendo un rendimiento competitivo en tareas complejas. El repositorio analizado es un mirror de la comunidad (Dmitry1595) que replica los pesos oficiales de Qwen.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Causal Language Model con Vision Encoder, híbrida (Gated DeltaNet + Gated Attention) |
| Parametros totales | 27.781.427.952 (27B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 262.144 tokens nativo, extensible a 1.000.000 |
| Tipos de cuantizacion | No disponible (no se especifican en la información proporcionada) |
| Idiomas soportados | No disponible (no se detallan en la model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (compatible con Transformers, vLLM, SGLang, TokenSpeed) |

## Arquitectura y entrenamiento

Qwen3.8-27B emplea una arquitectura híbrida que combina atención lineal y atención completa. El bloque de lenguaje se organiza en un layout de 16 repeticiones de `3 × (Gated DeltaNet → FFN) → 1 × (Gated Attention → FFN)`. La capa Gated DeltaNet utiliza 48 cabezas de atención lineal para V y 16 para QK, con dimensión de cabeza 128, mientras que la capa Gated Attention usa 24 cabezas para Q y 4 para KV, con dimensión de cabeza 256 y RoPE de dimensión 64. La red feed-forward tiene dimensión intermedia de 17.408. El modelo incorpora Multi-Token Prediction (MTP) entrenado con múltiples pasos, lo que mejora la eficiencia de decodificación y la coherencia a largo plazo.

El entrenamiento comprende fases de pre-entrenamiento y post-entrenamiento, aunque la información disponible no detalla la composición del dataset ni si se aplicaron técnicas como RLHF o DPO. El modelo incluye un codificador de visión nativo que permite procesar imágenes y vídeo, con capacidad para entender diagramas STEM, documentos y vídeos de larga duración. La arquitectura está optimizada para tareas agénticas, con mejoras en planificación autónoma y manejo de feedback del entorno.

## Capacidades

- Generación de texto y razonamiento multi-step con control de profundidad mediante `reasoning_effort`.
- Comprensión de imágenes y vídeo: diagramas STEM, documentos, vídeos de hasta una hora.
- Programación y codificación agéntica, incluyendo tareas de terminal y desarrollo de software.
- Automatización de oficina: generación y análisis de documentos, hojas de cálculo, presentaciones.
- Soporte de agentes con planificación autónoma y manejo de feedback del entorno.
- Modo de pensamiento configurable: activado por defecto, desactivable por petición, con retención de contexto de razonamiento (`preserve_thinking`).
- Capacidades multilingües no confirmadas explícitamente en la documentación proporcionada.
- Compatible con herramientas de desarrollo populares (vLLM, SGLang, TokenSpeed, Transformers).

## Casos de uso

- Asistente de programación en terminal: el modelo puede ejecutar tareas de codificación agéntica, como depuración, refactorización y pruebas, gracias a su soporte para razonamiento multi-step y manejo de feedback del entorno. Su contexto de 262K tokens permite mantener el estado completo de un repositorio.
- Automatización de oficina: generación de informes, análisis de documentos y creación de presentaciones a partir de instrucciones en lenguaje natural, aprovechando su capacidad de comprensión de imágenes y texto.
- Análisis de documentos técnicos con diagramas: puede interpretar figuras, gráficos y esquemas STEM, útil en investigación y educación.
- Agente de atención al cliente con contexto largo: su ventana de 262K tokens permite gestionar conversaciones multi-turno con historial extenso y documentos adjuntos, manteniendo coherencia a lo largo de la interacción.
- Investigación y síntesis de literatura: procesamiento de artículos largos, extracción de información y generación de resúmenes con razonamiento profundo configurable.
- Despliegue local en hardware de consumo: gracias a su tamaño de 27B y licencia Apache 2.0, puede integrarse en entornos de desarrollo con GPUs de 24GB mediante cuantización, ofreciendo capacidades de nivel profesional sin dependencia de servicios en la nube.

## Benchmarks y rendimiento

La model card del autor incluye una tabla de benchmarks comparativa, pero la información proporcionada está incompleta y no se dispone de valores numéricos completos. La tabla menciona las siguientes comparaciones:

| Benchmark | Qwen3.8-27B | Qwen3.6-27B | Qwen3.7-Plus | Muse Glimmer-30B | Opus4.6 Max |
|---|---|---|---|---|---|
| Agentic terminal coding (Terminal Bench 2.1) | No disponible | No disponible | No disponible | No disponible | No disponible |

No se han publicado resultados numéricos de benchmarks en la información disponible. Se recomienda consultar la documentación oficial de Qwen para obtener métricas detalladas.

## Requisitos de hardware

- VRAM estimada: con 27.781 millones de parámetros, en FP16 se requieren aproximadamente 55,6 GB de memoria (tamaño del repo). Con cuantización de 8 bits se reduce a ~28 GB, y con 4 bits a ~14 GB.
- GPUs recomendadas: para FP16 se necesitan GPUs profesionales como A100 (80GB) o H100. Con cuantización 4-bit puede ejecutarse en GPUs consumer de 24GB como RTX 4090 o RTX 3090.
- Compatibilidad con hardware local: el blog de AMD confirma soporte para AMD Ryzen AI Max y GPUs Radeon, lo que indica viabilidad en estaciones de trabajo con aceleración AMD.
- Opciones de despliegue: compatible con Hugging Face Transformers, vLLM, SGLang y TokenSpeed. También puede ejecutarse mediante llama.cpp u Ollama si se dispone de pesos GGUF (no confirmado en la información).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

La tabla de benchmarks del autor compara Qwen3.8-27B con Qwen3.6-27B (generación anterior), Qwen3.7-Plus (modelo más grande), Muse Glimmer-30B y Opus4.6 Max. Sin embargo, no se dispone de valores numéricos en la información proporcionada. A nivel de especificaciones:

| Modelo | Parámetros | Contexto | Licencia | Modalidad |
|---|---|---|---|---|
| Qwen3.8-27B | 27B | 262K (ext. 1M) | Apache 2.0 | Texto + visión |
| Qwen3.6-27B | 27B | No disponible | Apache 2.0 | Texto + visión |
| Qwen3.7-Plus | No disponible | No disponible | No disponible | No disponible |
| Muse Glimmer-30B | 30B | No disponible | No disponible | No disponible |
| Opus4.6 Max | No disponible | No disponible | No disponible | No disponible |

No se dispone de datos suficientes para una comparativa cuantitativa rigurosa.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la información proporcionada. Como modelo entrenado con datos web, puede presentar sesgos sociales y culturales.
- Riesgo de alucinación: inherente a los modelos de lenguaje; se recomienda verificación de hechos en aplicaciones críticas.
- Limitaciones de contexto: aunque la ventana nativa es de 262K tokens, la extensión a 1M puede degradar el rendimiento en tareas de recuperación de información muy distante.
- Idiomas: no se especifican los idiomas soportados; el rendimiento puede variar significativamente entre lenguas.
- Restricciones de licencia: Apache 2.0 permite uso comercial sin restricciones, pero el repositorio analizado es un mirror de la comunidad (Dmitry1595), no el oficial de Qwen. Se recomienda descargar los pesos desde el repositorio oficial de Qwen para garantizar integridad.
- Producción: el modelo está diseñado para tareas agénticas, pero la fiabilidad en entornos de producción depende de la configuración del razonamiento y del manejo de errores.

## Enlaces

- Repositorio HuggingFace (mirror de la comunidad): https://huggingface.co/Dmitry1595/Qwen3.8-27B
- Repositorio HuggingFace oficial: https://huggingface.co/Qwen/Qwen3.8-27B
- Repositorio GitHub oficial: https://github.com/AlibabaCloud-Official/Qwen3.8-27B
- Página del modelo en QwenCloud: https://www.qwencloud.com/models/qwen3.8-27b
- Blog de AMD sobre ejecución local: https://www.amd.com/en/blogs/2026/run-qwen-3-8-27b-on-amd-ryzen-ai-max-and-radeon-graphics-cards-day-0.html
- Página en LM Studio: https://lmstudio.ai/models/qwen3.8
