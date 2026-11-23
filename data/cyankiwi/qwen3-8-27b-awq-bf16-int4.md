# cyankiwi/Qwen3.8-27B-AWQ-BF16-INT4

## Resumen

Qwen3.8-27B es un modelo de lenguaje y visión de tipo denso desarrollado por el equipo Qwen (Alibaba), presentado como la generación más capaz de la familia abierta Qwen hasta la fecha y construido sobre la base arquitectónica de Qwen3.5. Se trata de un modelo nativo visión-lenguaje de 27 000 millones de parámetros (27 781 427 952 según los pesos en safetensors), diseñado para tareas de código, trabajo profesional, investigación y flujos agénticos de horizonte largo, con control flexible del modo de razonamiento.

La ficha que nos ocupa, sin embargo, no es el modelo original: es la cuantización AWQ en INT4 con activaciones en BF16 publicada por cyankiwi (versión 26.05.01), calibrada con un dataset propio de contenido STEM y agéntico. El repositorio ocupa 28,85 GB y está pensado para servir el modelo con vLLM, SGLang o TokenSpeed en hardware más modesto que el requerido por los pesos en BF16, manteniendo el pipeline `image-text-to-text` y la licencia Apache 2.0 del modelo base.

Su relevancia actual radica en que combina tres elementos poco habituales en un modelo de este tamaño: contexto nativo de 262 144 tokens extensible hasta 1 000 000, comprensión nativa de imágenes y vídeos (incluidos vídeos de hasta una hora), y una arquitectura híbrida con capas de atención lineal Gated DeltaNet intercaladas con atención con compuertas, además de Multi-Token Prediction entrenado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal híbrido con encoder de visión; layout 16 × (3 × (Gated DeltaNet → FFN) → 1 × (Gated Attention → FFN)) |
| Parametros totales | 27 781 427 952 (27B declarados) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 262 144 tokens nativos; extensible hasta 1 000 000 |
| Tipos de cuantizacion | AWQ INT4 con activaciones BF16 (esta versión); el modelo base admite otras cuantizaciones de la comunidad |
| Idiomas soportados | No disponible en la informacion proporcionada |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (compressed-tensors), compatible con Transformers, vLLM, SGLang y TokenSpeed |

Datos arquitectónicos adicionales: dimensión oculta 5120, 64 capas, embedding de tokens de 248 320 (con padding), FFN con dimensión intermedia 17 408. En las capas Gated DeltaNet: 48 cabezas de atención lineal para V y 16 para QK, dimensión de cabeza 128. En las capas Gated Attention: 24 cabezas para Q y 4 para KV, dimensión de cabeza 256, dimensión RoPE 64. Tamaño del repositorio: 28,85 GB.

## Arquitectura y entrenamiento

El modelo emplea una arquitectura híbrida que alterna bloques de atención lineal Gated DeltaNet con bloques de atención con compuertas (Gated Attention), en una proporción de tres capas DeltaNet por cada capa de atención completa, repetida 16 veces. Este diseño busca reducir el coste computacional y de memoria del contexto largo sin renunciar a la calidad de la atención completa en puntos clave de la red. Incorpora además un encoder de visión para el procesamiento nativo de imágenes y vídeo, y fue entrenado con Multi-Token Prediction (MTP) en varios pasos, lo que habilita decodificación especulativa y mejora el throughput de generación.

El modelo pasa por las etapas de pre-entrenamiento y post-entrenamiento, aunque la información disponible no detalla el número de tokens de entrenamiento, la composición del dataset ni si se emplearon técnicas concretas de RLHF o DPO. Sí se documenta el control flexible del pensamiento: el modo thinking está activo por defecto, puede desactivarse por petición, su profundidad se ajusta mediante `reasoning_effort` y el contexto de razonamiento de mensajes históricos se conserva con `preserve_thinking`. La versión cuantizada de cyankiwi aplica AWQ INT4 con calibración específica sobre datos STEM y agénticos, lo que orienta la preservación de precisión hacia esos dominios.

## Capacidades

- Generación de texto y razonamiento con modo thinking activable y desactivable por petición, con profundidad de razonamiento ajustable mediante `reasoning_effort`.
- Comprensión nativa de imágenes y vídeo, incluyendo diagramas STEM, documentos y vídeos de hasta una hora de duración.
- Generación y comprensión de código, con mejoras declaradas en tareas de programación y trabajo profesional.
- Ejecución agéntica: planificación autónoma y manejo de retroalimentación del entorno para completar tareas de extremo a extremo.
- Soporte de tool calling y function calling (integrado en el ecosistema Qwen y en los harnesses compatibles).
- Razonamiento multi-paso de horizonte largo, con retención del contexto de razonamiento entre turnos.
- Compatibilidad amplia con harnesses y herramientas de desarrollo populares, según la model card.
- Capacidades multilingües: no detalladas en la información disponible.

## Casos de uso

- Agentes autónomos de larga duración: el modelo puede planificar y ejecutar tareas multi-paso con retroalimentación del entorno, apoyándose en el contexto de 262 144 tokens para mantener el estado de la tarea y en `preserve_thinking` para conservar el razonamiento entre turnos.
- Análisis de documentos técnicos y diagramas STEM: al ser un modelo visión-lenguaje nativo, puede procesar figuras, esquemas y documentos escaneados junto con el texto, útil en herramientas de investigación y soporte técnico.
- Comprensión de vídeo de larga duración: la ventana de contexto extensa permite resumir o extraer información de vídeos de hasta una hora sin trocear manualmente el contenido.
- Asistencia a la programación en producción: con soporte de tool calling y compatibilidad con vLLM y SGLang, puede integrarse en pipelines de CI/CD o en asistentes de código que consultan repositorios y ejecutan herramientas.
- Atención al cliente multi-turno: la ventana de contexto y el control de thinking permiten conversaciones largas con historial completo, desactivando el razonamiento profundo para respuestas de baja latencia.
- Investigación y análisis profesional: tareas de síntesis, revisión de literatura y redacción técnica donde el modo thinking con `reasoning_effort` ajustable permite equilibrar calidad y coste.
- Despliegue en infraestructura propia con presupuesto limitado: la cuantización AWQ INT4 reduce el peso a 28,85 GB, lo que facilita servir el modelo en GPUs de 40-48 GB en lugar de requerir nodos multi-GPU en BF16.

## Benchmarks y rendimiento

La model card del modelo base incluye una sección de resultados de benchmarks de rendimiento en texto (tabla «Text Performance»), pero el contenido de dicha tabla no está disponible en la información proporcionada. No se han podido extraer cifras concretas de MMLU, HumanEval, GSM8K ni de otras evaluaciones.

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para esta versión AWQ INT4: aproximadamente 29 GB solo para pesos, más overhead de activaciones, caché KV y el encoder de visión; en la práctica, se recomienda un mínimo de 32-40 GB de VRAM para contextos moderados.
- Para contexto completo de 262 144 tokens, la caché KV y las activaciones elevan notablemente el requisito; conviene planificar GPUs de 80 GB o más, o bien usar atención con paginación y cuantización de caché en vLLM/SGLang.
- GPUs recomendadas: A100 80 GB, H100 80 GB, L40S 48 GB o RTX 6000 Ada 48 GB para producción; en consumer, RTX 4090 24 GB no es suficiente para esta versión INT4 completa, pero sí para cuantizaciones GGUF más agresivas del modelo base.
- Opciones de despliegue: vLLM, SGLang y TokenSpeed son los backends indicados por el autor; Transformers para uso directo. Para consumer, llama.cpp/Ollama con GGUF del modelo base sería la vía habitual, aunque esta versión AWQ no es directamente compatible con esos motores.
- Latencia y throughput: no disponibles en la información proporcionada. El entrenamiento con MTP sugiere soporte de decodificación especulativa, que puede mejorar el throughput, pero no se aportan cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Vision | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-27B (esta versión AWQ INT4) | 27B denso | 262 144 (hasta 1M) | Si (imagen y video) | Apache 2.0 | Hugging Face, vLLM, SGLang, TokenSpeed |
| Qwen3.8-27B (base BF16) | 27B denso | 262 144 (hasta 1M) | Si | Apache 2.0 | Hugging Face, API Qwen Cloud (próximamente) |
| Alternativas de la misma categoría | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de datos de benchmarks ni de especificaciones de modelos competidores en la información proporcionada, por lo que no es posible establecer una comparación cuantitativa rigurosa con alternativas de tamaño similar.

## Limitaciones y advertencias

- La cuantización AWQ INT4 introduce una pérdida de precisión respecto al modelo BF16; aunque la calibración está orientada a STEM y agentes, dominios fuera de esa distribución pueden degradarse más.
- Riesgo de alucinación inherente a los modelos de lenguaje, especialmente en modo thinking desactivado o con `reasoning_effort` bajo.
- El modo thinking activo por defecto incrementa la latencia y el consumo de tokens; en producción conviene desactivarlo o limitarlo para cargas interactivas.
- La información sobre idiomas soportados no está disponible, por lo que no se puede garantizar el rendimiento en castellano sin evaluación propia.
- El contexto de 1 000 000 de tokens es una extensión sobre los 262 144 nativos; el rendimiento en la zona extendida puede degradarse y requiere configuración específica.
- Aunque la licencia es Apache 2.0 y permite uso comercial, el modelo base pertenece a Qwen y conviene revisar los términos de la API Qwen Cloud si se opta por el servicio gestionado.
- El despliegue de esta versión requiere backends compatibles con compressed-tensors (vLLM, SGLang, TokenSpeed); no es apta para llama.cpp u Ollama sin reconvertir.
- No se han publicado datos de sesgos en la información disponible; se recomienda auditoría propia antes de uso en producción.

## Enlaces

- Repositorio Hugging Face de esta cuantización: https://huggingface.co/cyankiwi/Qwen3.8-27B-AWQ-BF16-INT4
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Web del autor de la cuantización: https://cyan.kiwi/
- Perfil del autor en Hugging Face: https://huggingface.co/cyankiwi
- Perfil del autor en ModelScope: https://www.modelscope.ai/organization/cyankiwi
- Dataset de calibración: https://huggingface.co/datasets/cyankiwi/calibration
- Despliegue en endpoints de cyan.kiwi: https://cyan.kiwi/workspace?prompt=Deploy%20cyankiwi/Qwen3.8-27B-AWQ-BF16-INT4
- Página del modelo en Qwen Cloud: https://www.qwencloud.com/models/qwen3.8-27b
- X del autor: https://x.com/cyankiwi_ai
- Reddit del autor: https://www.reddit.com/r/cyankiwi/
