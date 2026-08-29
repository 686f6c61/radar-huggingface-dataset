# Hesh913/Qwen3.8-27B

## Resumen

Qwen3.8-27B es un modelo de lenguaje denso multimodal (visión-lenguaje) desarrollado por el equipo Qwen de Alibaba, presentado como la generación más capaz de la familia abierta Qwen hasta la fecha. Construido sobre la base arquitectónica de Qwen3.5, incorpora mejoras sustanciales en tareas de codificación, trabajo profesional, investigación y ejecución de agentes de larga duración. Con 27.781 millones de parámetros, ofrece una ventana de contexto nativa de 262.144 tokens, extensible hasta 1.000.000, y soporta comprensión de imágenes y vídeo de hasta una hora de duración.

El modelo destaca por su arquitectura híbrida que combina capas de atención lineal (Gated DeltaNet) con capas de atención completa (Gated Attention), junto con entrenamiento de predicción multi-token (MTP). Incluye un modo de pensamiento (thinking mode) activado por defecto, con control fino del esfuerzo de razonamiento mediante el parámetro `reasoning_effort` y retención del contexto de razonamiento histórico con `preserve_thinking`. Su licencia Apache 2.0 permite uso comercial sin restricciones, y está disponible en formato Transformers, compatible con vLLM, SGLang y TokenSpeed.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Causal Language Model con Vision Encoder, híbrida (Gated DeltaNet + Gated Attention) |
| Parametros totales | 27.781.427.952 (27B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 262.144 tokens nativo, extensible a 1.000.000 |
| Tipos de cuantizacion | No disponible (repo en safetensors, sin cuantizaciones publicadas) |
| Idiomas soportados | No disponible (no especificados en la model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (Transformers) |

## Arquitectura y entrenamiento

Qwen3.8-27B emplea una arquitectura híbrida que intercala capas de atención lineal y atención completa. El modelo tiene 64 capas organizadas en un patrón de 16 bloques, cada uno compuesto por 3 sub-bloques de (Gated DeltaNet → FFN) seguidos de 1 sub-bloque de (Gated Attention → FFN). La capa Gated DeltaNet utiliza 48 cabezas de atención lineal para V y 16 para QK, con dimensión de cabeza 128. La capa Gated Attention usa 24 cabezas para Q y 4 para KV, con dimensión de cabeza 256 y posición rotatoria (RoPE) de dimensión 64. La dimensión oculta es 5120, el embedding de tokens es de 248.320 (con padding) y la dimensión intermedia del FFN es 17.408.

El entrenamiento se realizó en dos etapas: pre-entrenamiento y post-entrenamiento. Se incluye predicción multi-token (MTP) entrenada con múltiples pasos, lo que mejora la eficiencia de decodificación y la coherencia del razonamiento. No se han publicado datos sobre el número de tokens de entrenamiento ni la composición del dataset. El modelo integra un codificador de visión nativo que permite procesar imágenes y vídeo, con capacidades de comprensión de diagramas STEM, documentos y vídeo de larga duración.

## Capacidades

- Generación de texto y razonamiento multi-paso con modo de pensamiento (thinking mode) activable o desactivable por petición, con control de profundidad mediante `reasoning_effort`.
- Comprensión de imágenes y vídeo de forma nativa, incluyendo diagramas STEM, documentos escaneados y vídeo de hasta una hora de duración.
- Ejecución de agentes autónomos con planificación robusta y manejo de feedback del entorno, orientado a tareas de larga duración.
- Codificación avanzada, incluyendo codificación agéntica en terminal (evaluada en Terminal Bench 2.1).
- Automatización de oficina y productividad profesional, con mejoras específicas en tareas de texto y visión.
- Compatibilidad con herramientas externas (tool calling) en la versión alojada de Qwen Cloud, con herramientas integradas oficiales.
- Predicción multi-token (MTP) que mejora la velocidad de decodificación y la coherencia del texto generado.
- Soporte multilingüe no especificado en la documentación disponible.

## Casos de uso

- Agente de codificación en terminal: el modelo puede ejecutar tareas de codificación agéntica, como navegar por repositorios, editar archivos y ejecutar comandos, gracias a su capacidad de planificación autónoma y manejo de feedback del entorno. Su contexto nativo de 262K tokens permite mantener el estado de sesiones largas de desarrollo.
- Automatización de oficina: puede procesar documentos, hojas de cálculo y presentaciones, tanto en formato textual como visual, generando resúmenes, extrayendo datos de diagramas y redactando informes. Su comprensión de imágenes facilita el trabajo con capturas de pantalla y documentos escaneados.
- Análisis de documentos técnicos y científicos: la comprensión de diagramas STEM y ecuaciones permite al modelo asistir en la revisión de artículos, interpretación de figuras y generación de explicaciones paso a paso.
- Comprensión de vídeo de larga duración: con soporte para vídeo de hasta una hora, puede resumir contenido audiovisual, extraer información de grabaciones de reuniones o clases, y responder preguntas sobre el contenido visual.
- Asistente de investigación con razonamiento profundo: el modo de pensamiento con `reasoning_effort` ajustable permite al modelo abordar problemas complejos de matemáticas, lógica o ciencia, manteniendo el contexto de razonamiento histórico para tareas multi-paso.
- Despliegue local en hardware de consumo: con 27B parámetros y cuantización, el modelo puede ejecutarse en estaciones de trabajo con GPUs de gama alta o en equipos con AMD Ryzen AI Max, como demuestra el soporte de día cero publicado por AMD, lo que lo hace adecuado para desarrollo local sin dependencia de la nube.
- Integración en pipelines de CI/CD: su capacidad de generación de código y tool calling permite su uso como asistente de revisión de código, generación de tests o automatización de tareas de mantenimiento en entornos de integración continua.

## Benchmarks y rendimiento

La model card incluye una tabla comparativa de rendimiento en texto que enfrenta a Qwen3.8-27B con Qwen3.6-27B, Qwen3.7-Plus, Muse Glimmer-30B y Opus4.6 Max, organizada por categorías como codificación, trabajo profesional, investigación y agentes. El extracto disponible solo muestra la cabecera y la primera fila correspondiente a "Agentic terminal coding" (Terminal Bench 2.1, Terminus), sin valores numéricos. No se han proporcionado los resultados completos en la información disponible, por lo que no es posible presentar una tabla de benchmarks con datos verificables. Se recomienda consultar la model card oficial en Hugging Face para acceder a los resultados completos.

## Requisitos de hardware

- El repositorio ocupa 55,6 GB en safetensors, lo que sugiere pesos en bf16 o fp16. Para inferencia en precisión completa se requieren aproximadamente 56 GB de VRAM.
- Con cuantización a 8 bits, la VRAM estimada sería de unos 28 GB, permitiendo ejecución en GPUs como RTX 4090 (24 GB) con cuantización de 4 bits (aproximadamente 14 GB) o A6000 (48 GB) con 8 bits.
- No se han publicado requisitos oficiales de hardware por parte del equipo de Qwen. Las estimaciones anteriores son orientativas basadas en el tamaño de los pesos.
- El modelo es compatible con Transformers, vLLM, SGLang y TokenSpeed, lo que permite desplegarlo en infraestructura estándar de inferencia.
- AMD ha publicado soporte de día cero para ejecutar Qwen3.8-27B en equipos con procesadores AMD Ryzen AI Max y GPUs Radeon, lo que indica viabilidad en hardware de consumo de gama alta.
- Para la versión alojada en Qwen Cloud, se ofrece contexto de 1M tokens por defecto y herramientas integradas, sin necesidad de gestionar infraestructura.

## Comparativa con modelos similares

La model card compara Qwen3.8-27B con Qwen3.6-27B (predecesor directo), Qwen3.7-Plus (modelo de gama superior, probablemente propietario), Muse Glimmer-30B (modelo denso de 30B) y Opus4.6 Max (modelo de gran escala). No se dispone de especificaciones técnicas detalladas de estos modelos comparados en la información disponible. La tabla de benchmarks de la model card es la fuente principal de comparación, pero sus valores no están accesibles en el extracto. Se puede afirmar que Qwen3.8-27B es la evolución de Qwen3.6-27B con mejoras en codificación, trabajo profesional y agentes, manteniendo el mismo tamaño de 27B parámetros.

## Limitaciones y advertencias

- No se han publicado datos sobre sesgos específicos del modelo, pero al ser un modelo generativo entrenado con datos web, puede reflejar sesgos presentes en dichos datos.
- Riesgo de alucinación inherente a los modelos de lenguaje, especialmente en tareas de razonamiento complejo o con contexto muy largo.
- La ventana de contexto de 262K tokens nativa puede degradar el rendimiento en los extremos de longitud; la extensión a 1M tokens requiere configuración adicional y puede aumentar la latencia.
- Los idiomas soportados no están documentados, lo que limita la evaluación de su rendimiento multilingüe.
- El repositorio analizado (Hesh913/Qwen3.8-27B) es un mirror de la comunidad, no el repositorio oficial de Qwen. Se recomienda utilizar el repositorio oficial para entornos de producción.
- La licencia Apache 2.0 permite uso comercial sin restricciones, pero el modelo puede estar sujeto a términos adicionales de la plataforma Qwen Cloud si se utiliza su servicio alojado.
- No se han publicado resultados de benchmarks completos en la información disponible, por lo que la validación de rendimiento debe realizarse de forma independiente.

## Enlaces

- Repositorio oficial en Hugging Face: https://huggingface.co/Qwen/Qwen3.8-27B
- Repositorio mirror analizado: https://huggingface.co/Hesh913/Qwen3.8-27B
- GitHub oficial de la serie Qwen3.8: https://github.com/QwenLM/Qwen3.8
- GitHub específico de Qwen3.8-27B: https://github.com/AlibabaCloud-Official/Qwen3.8-27B
- Página de Qwen Cloud para Qwen3.8-27B: https://www.qwencloud.com/models/qwen3.8-27b
- Blog de AMD sobre ejecución local: https://www.amd.com/en/blogs/2026/run-qwen-3-8-27b-on-amd-ryzen-ai-max-and-radeon-graphics-cards-day-0.html
