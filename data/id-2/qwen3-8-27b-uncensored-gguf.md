# id-2/Qwen3.8-27B-Uncensored-GGUF

## Resumen

Qwen3.8-27B es un modelo de lenguaje denso de 27 000 millones de parámetros desarrollado por el equipo Qwen de Alibaba, presentado como la generación más capaz de la familia abierta Qwen hasta la fecha. Se trata de un modelo nativo multimodal que integra un codificador de visión, lo que le permite comprender imágenes y vídeos además de texto, con un diseño orientado a tareas agénticas de largo recorrido y razonamiento multi-paso. Este modelo se distribuye en formato GGUF cuantizado, lo que facilita su ejecución en hardware local y de consumo.

Construido sobre la base arquitectónica de Qwen3.5, Qwen3.8-27B incorpora una arquitectura híbrida de atención que combina capas de atención lineal (Gated DeltaNet) con capas de atención completa (Gated Attention), logrando un equilibrio entre eficiencia computacional y capacidad de razonamiento. El modelo soporta una longitud de contexto nativa de 262 144 tokens, extensible hasta 1 000 000, e incluye un modo de pensamiento flexible que puede activarse o desactivarse por petición. Su licencia Apache 2.0 permite uso comercial sin restricciones significativas.

La versión "Uncensored" publicada por el usuario id-2 en HuggingFace es una adaptación en formato GGUF del modelo base, cuantizada con la tecnología Dynamic 3.0 de Unsloth, que según sus desarrolladores ofrece una precisión superior a otras cuantizaciones del mismo tamaño. Esta ficha se basa en la información disponible del repositorio y del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Causal Language Model híbrido con Vision Encoder (Gated DeltaNet + Gated Attention) |
| Parametros totales | 27 320 697 856 (27B) |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | 262 144 tokens nativo, extensible hasta 1 000 000 |
| Tipos de cuantizacion | GGUF (Dynamic 3.0 de Unsloth; variantes específicas no detalladas) |
| Idiomas soportados | no disponible (el modelo base Qwen soporta múltiples idiomas, pero la ficha no los detalla) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizado) |

## Arquitectura y entrenamiento

Qwen3.8-27B emplea una arquitectura híbrida de atención que combina dos mecanismos: 48 de las 64 capas utilizan Gated DeltaNet, un mecanismo de atención lineal con estado recurrente constante, mientras que las 16 capas restantes (una de cada cuatro) utilizan Gated Attention con atención completa. Esta configuración, descrita como `16 × (3 × (Gated DeltaNet → FFN) → 1 × (Gated Attention → FFN))`, permite reducir el coste computacional frente a un transformer denso convencional manteniendo la capacidad de razonamiento profundo. El modelo tiene una dimensión oculta de 5120, 64 capas, embedding de tokens de 248 320 (padded) y un tamaño de FFN intermedio de 17 408.

El entrenamiento se realizó en dos etapas: pre-entrenamiento y post-entrenamiento, e incluye Multi-Token Prediction (MTP) entrenado con múltiples pasos, una técnica que permite predecir varios tokens a la vez y mejora la velocidad de inferencia. El modelo incorpora un codificador de visión nativo que le permite procesar imágenes y vídeos, incluyendo diagramas STEM, documentos y vídeos de hasta una hora de duración. El modo de pensamiento está activado por defecto y puede desactivarse por petición, con un parámetro `reasoning_effort` para ajustar la profundidad del razonamiento y `preserve_thinking` para retener el contexto de razonamiento en mensajes históricos.

## Capacidades

- Generación de texto y razonamiento multi-paso con modo de pensamiento flexible (thinking mode) activable o desactivable por petición.
- Comprensión nativa de imágenes y vídeos, incluyendo diagramas STEM, documentos escaneados y vídeos de larga duración.
- Soporte de tool calling y function calling, con mejoras específicas para el parseo de objetos anidados que aumentan la tasa de éxito en llamadas a herramientas.
- Capacidades agénticas mejoradas: planificación autónoma, manejo de feedback del entorno y ejecución fiable de tareas multi-paso de principio a fin.
- Soporte para agentes en herramientas como Codex, con soporte de rol de desarrollador.
- Ajuste de la profundidad de razonamiento mediante el parámetro `reasoning_effort`.
- Retención del contexto de razonamiento en mensajes históricos mediante `preserve_thinking`.
- Capacidades multilingües heredadas del modelo base Qwen (idiomas específicos no detallados en la ficha).

## Casos de uso

- Asistente de programación local: el modelo puede ejecutarse en una máquina de desarrollo sin enviar código a la nube, actuando como par de programación para revisión de código, generación de funciones y depuración, gracias a su licencia Apache 2.0 y su formato GGUF que permite ejecución en hardware de consumo.
- Automatización de oficina: procesamiento de documentos, generación de informes, resumen de actas y extracción de información de tablas e imágenes, aprovechando su capacidad de comprensión visual y su contexto largo de 262 000 tokens.
- Agente de atención al cliente: gestión de conversaciones multi-turno con contexto amplio, integrando tool calling para consultar bases de datos, gestionar tickets o realizar devoluciones, con un modo de razonamiento que mejora la coherencia de las respuestas.
- Análisis de vídeo: procesamiento de grabaciones de vigilancia, webinars o material formativo de hasta una hora de duración, extrayendo eventos relevantes, transcribiendo diálogos y generando resúmenes estructurados.
- Investigación académica: asistencia en la revisión de literatura científica, comprensión de diagramas y figuras de artículos, y generación de borradores de secciones metodológicas, gracias a su capacidad de razonamiento profundo y comprensión de documentos técnicos.
- Desarrollo de agentes autónomos: construcción de pipelines agénticos que requieren planificación multi-paso, manejo de feedback del entorno y ejecución fiable de tareas complejas, como la automatización de flujos de trabajo de datos o la orquestación de múltiples herramientas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del autor no incluye tablas de rendimiento comparativo, y los datos de la ficha de HuggingFace no proporcionan métricas de evaluación. Se recomienda consultar el repositorio oficial de Qwen para obtener resultados de benchmarks actualizados.

## Requisitos de hardware

- VRAM estimada para inferencia: para un modelo de 27B en formato GGUF, se estima un consumo de entre 14 GB (cuantización Q4_K_M) y 28 GB (cuantización Q8_0), dependiendo de la variante de cuantización utilizada.
- GPU recomendadas: para ejecución fluida con contexto largo, se recomiendan GPUs con 24 GB de VRAM o más, como RTX 3090, RTX 4090 o A100. Con cuantizaciones agresivas (Q4), podría ejecutarse en GPUs de 16 GB como RTX 4080 o RTX 4070 Ti Super.
- Compatibilidad con hardware de consumo: sí, el modelo cabe en GPUs de consumo de gama alta (24 GB) con cuantización Q4, y en GPUs de 16 GB con cuantizaciones más agresivas, aunque con menor calidad de salida.
- Opciones de despliegue: llama.cpp, Ollama, vLLM (con soporte para GGUF), TGI (Text Generation Inference) y Unsloth Desktop, que ofrece toggles de pensamiento y soporte para ejecución local en Mac, Windows y Linux.
- Latencia y throughput: no disponible en la información proporcionada. Se espera que la arquitectura híbrida con atención lineal reduzca el coste computacional frente a un transformer denso equivalente, especialmente en contextos largos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Arquitectura | Licencia | Formato |
|---|---|---|---|---|---|
| Qwen3.8-27B (este) | 27B | 262K nativo, 1M extensible | Híbrida (DeltaNet + Attention) | Apache 2.0 | GGUF |
| Qwen3.5 (generación anterior) | no disponible | no disponible | no disponible | Apache 2.0 | no disponible |
| Qwen3.6 (generación anterior) | no disponible | no disponible | no disponible | Apache 2.0 | no disponible |

No se dispone de información suficiente sobre las generaciones anteriores de Qwen (3.5 y 3.6) para realizar una comparativa detallada en cuanto a parámetros, contexto y rendimiento. El modelo base Qwen/Qwen3.8-27B es la referencia directa, y esta versión GGUF es una cuantización del mismo.

## Limitaciones y advertencias

- La versión "Uncensored" puede haber sido fine-tuneada o modificada para eliminar restricciones de contenido, lo que podría aumentar el riesgo de generación de respuestas inapropiadas, dañinas o sesgadas. Se recomienda precaución en despliegues públicos.
- Riesgo de alucinación: como todo modelo de lenguaje, puede generar información falsa o inventada, especialmente en tareas de razonamiento multi-paso o con contextos ambiguos.
- Limitaciones de idioma: la ficha no especifica los idiomas soportados, aunque el modelo base Qwen tiene soporte multilingüe. El rendimiento puede variar significativamente entre idiomas.
- La cuantización GGUF introduce una pérdida de precisión frente al modelo en punto flotante completo, que puede ser más notable en tareas de razonamiento complejo o matemáticas.
- El modo de pensamiento activado por defecto aumenta el número de tokens generados, lo que incrementa la latencia y el coste computacional por petición.
- La licencia Apache 2.0 permite uso comercial, pero el usuario debe verificar que la versión "Uncensored" no haya introducido modificaciones que alteren los términos de la licencia original.
- Para producción, se recomienda validar el comportamiento del modelo en el dominio específico de uso, dado que no se han publicado benchmarks oficiales para esta versión cuantizada.

## Enlaces

- Repositorio HuggingFace de esta versión: https://huggingface.co/id-2/Qwen3.8-27B-Uncensored-GGUF
- Repositorio HuggingFace de la versión GGUF de Unsloth: https://huggingface.co/unsloth/Qwen3.8-27B-GGUF
- Repositorio HuggingFace de la versión Uncensored de JonathanColetti: https://huggingface.co/JonathanColetti/Qwen3.8-27B-Uncensored-GGUF
- Repositorio GitHub oficial de Qwen3.8-27B: https://github.com/AlibabaCloud-Official/Qwen3.8-27B
- Repositorio GitHub de instalación local: https://github.com/qwen3-8-27b/qwen3-8-27b
- Guía de vLLM para Qwen3.8-27B: https://recipes.vllm.ai/Qwen/Qwen3.8-27B
- Documentación de Unsloth para Qwen3.8: https://unsloth.ai/docs/models/qwen3.8
