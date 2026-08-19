# jpetrina/Qwen3.8-27B-IQ4_XS-pure-GGUF

## Resumen

Qwen3.8-27B es la última generación de la familia Qwen de modelos abiertos, desarrollada por el equipo Qwen. Se trata de un modelo de lenguaje causal denso de 27 000 millones de parámetros con encoder de visión nativo, capaz de comprender imágenes y vídeo, y diseñado para tareas de razonamiento complejo, agente autónomo y codificación. La versión aquí descrita es una cuantización GGUF en formato IQ4_XS puro, creada por jpetrina a partir del modelo base de Unsloth, con el objetivo de ejecutarse en GPUs de consumo con 16 GB de VRAM.

El modelo introduce mejoras sustanciales respecto a las series Qwen3.5 y Qwen3.6 en capacidades de codificación, trabajo profesional, investigación y ejecución de agentes de largo horizonte. Su arquitectura híbrida combina capas de atención lineal (Gated DeltaNet) con capas de atención completa (Gated Attention), alcanzando una longitud de contexto nativa de 262 144 tokens, extensible hasta 1 000 000 mediante técnicas de escalado RoPE como YaRN. La cuantización IQ4_XS reduce el peso del modelo a unos 14,5 GB, lo que lo hace viable en tarjetas gráficas de gama alta de consumo.

Esta ficha se centra en la versión cuantizada IQ4_XS pura, que excluye los pesos del módulo `nextn` (multi-token prediction) para optimizar el uso de memoria, siguiendo el mismo enfoque que la cuantización equivalente de Qwen3.6-27B.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal híbrido con visión (Gated DeltaNet + Gated Attention + FFN) |
| Parametros totales | 27 320 697 856 (27B) |
| Parametros activos | no aplicable (modelo denso) |
| Longitud de contexto | 262 144 tokens nativo, extensible hasta 1 000 000 |
| Tipos de cuantizacion | IQ4_XS (este archivo); el modelo base también está disponible en otras cuantizaciones GGUF |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantización IQ4_XS pura) |

## Arquitectura y entrenamiento

Qwen3.8-27B es un modelo de lenguaje causal con encoder de visión integrado. Su arquitectura interna es híbrida: combina capas de atención lineal (Gated DeltaNet) con capas de atención completa (Gated Attention), dispuestas en un patrón de 16 bloques, donde cada bloque contiene 3 sub-bloques de Gated DeltaNet seguidos de un sub-bloque de Gated Attention, todos con FFN intercalado. Esta configuración permite manejar contextos muy largos con un coste computacional reducido en comparación con un transformer totalmente atencional. El modelo tiene 64 capas, una dimensión oculta de 5120 y un embedding de 248 320 tokens (padding incluido).

El entrenamiento se realizó en dos etapas: pre-entrenamiento y post-entrenamiento. Se incluye un módulo de multi-token prediction (MTP) entrenado con múltiples pasos, aunque en esta cuantización se han excluido los pesos `nextn` para reducir el uso de VRAM. El modelo soporta un modo de pensamiento (thinking mode) activado por defecto, que puede desactivarse por petición, y permite ajustar la profundidad del razonamiento mediante el parámetro `reasoning_effort`. También conserva el contexto de razonamiento de mensajes históricos mediante `preserve_thinking`.

La cuantización IQ4_XS se generó con la herramienta `buun-llama-quantize` usando la matriz de importancia (imatrix) de bartowski, excluyendo los pesos `nextn` y aplicando el modo `--pure`. Esto produce un archivo GGUF optimizado para inferencia en GPUs con 16 GB de VRAM.

## Capacidades

- Generación de texto y razonamiento complejo: el modelo destaca en tareas de codificación, trabajo profesional, investigación y razonamiento multi-paso.
- Comprensión de visión y lenguaje: soporta entrada de imágenes y vídeo de forma nativa, incluyendo diagramas STEM, documentos y vídeos de hasta una hora de duración.
- Control flexible del razonamiento: el modo de pensamiento puede activarse o desactivarse por petición; la profundidad del razonamiento se ajusta con `reasoning_effort`.
- Ejecución de agentes: planificación autónoma y manejo de feedback del entorno para tareas de largo horizonte, con mayor fiabilidad en la finalización de tareas.
- Soporte de tool calling y function calling: no se detalla explícitamente en la información proporcionada, pero se indica compatibilidad con harnesses y herramientas de desarrollo populares.
- Capacidades multilingües: no se especifican los idiomas soportados en la información disponible.
- Contexto largo: 262 144 tokens nativos, extensible a 1 000 000 con escalado RoPE (p. ej., YaRN).

## Casos de uso

- Asistentes de codificación en producción: el modelo puede integrarse en IDE o pipelines de CI/CD para generar código, revisar cambios y sugerir refactorizaciones. Su capacidad de razonamiento multi-paso y su contexto largo permiten manejar repositorios extensos.
- Análisis de documentos técnicos y científicos: gracias a su comprensión de visión, puede extraer información de diagramas, gráficos y documentos escaneados, útil en entornos de investigación y consultoría.
- Agentes autónomos de automatización de tareas: con soporte para planificación y manejo de feedback del entorno, puede ejecutar flujos de trabajo complejos como gestión de incidencias, orquestación de APIs o navegación web asistida.
- Comprensión de vídeo de larga duración: su capacidad nativa de visión permite procesar vídeos de hasta una hora, aplicable en vigilancia inteligente, análisis de reuniones o revisión de contenido multimedia.
- Chatbots de atención al cliente con contexto largo: la ventana de 262 000 tokens permite mantener conversaciones extensas con historial completo, reduciendo la pérdida de información en diálogos multi-turno.
- Herramientas de investigación y redacción profesional: el modelo puede generar informes, resumir literatura y razonar sobre problemas complejos, con un modo de pensamiento que mejora la calidad de las respuestas en tareas analíticas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card menciona mejoras cualitativas en codificación, trabajo profesional, investigación y tareas de agente, pero no proporciona métricas numéricas (MMLU, HumanEval, GSM8K, etc.) para esta versión cuantizada ni para el modelo base.

## Requisitos de hardware

- VRAM estimada: el archivo GGUF IQ4_XS tiene un tamaño de 14,5 GB, por lo que cabe en GPUs con 16 GB de VRAM o más. Se recomienda al menos 16 GB para inferencia con contexto estándar.
- GPU recomendadas: RTX 4080, RTX 4090, RTX 5080, RTX 5090, o GPUs profesionales con 16 GB o más (A100, L4, etc.). Para contextos muy largos (más de 100 000 tokens), se necesitaría más VRAM o cuantizaciones más agresivas.
- Compatibilidad con GPU de consumo: sí, es el objetivo principal de esta cuantización (16 GB de VRAM).
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, y cualquier backend compatible con GGUF. Para despliegue en producción con mayor throughput, se puede considerar vLLM si soporta este formato, aunque no se confirma en la información disponible.
- Latencia y throughput: no se proporcionan datos específicos. Dependerá del hardware, la longitud de contexto y la configuración de decodificación.

## Comparativa con modelos similares

No se dispone de datos de rendimiento comparativos en la información proporcionada. La model card indica que Qwen3.8-27B supera a las series Qwen3.5 y Qwen3.6 en varias tareas, pero no se ofrecen cifras concretas. Como referencia arquitectónica, se puede comparar con otras cuantizaciones GGUF de modelos de 27B, como las de Qwen3.6-27B o Llama 3.3 70B (aunque este último es significativamente mayor). No se dispone de una comparativa cuantitativa fiable.

## Limitaciones y advertencias

- La cuantización IQ4_XS introduce pérdida de precisión respecto al modelo BF16 original, lo que puede afectar ligeramente a la calidad en tareas de razonamiento complejo o generación de código muy especializado.
- El modelo está diseñado para funcionar con los parámetros de muestreo recomendados (temperatura, top_p, etc.); usar otros valores puede degradar el rendimiento o provocar repeticiones.
- No se especifican los idiomas soportados; aunque Qwen suele cubrir múltiples lenguas, no hay garantía de calidad uniforme en todos los idiomas.
- El modo de pensamiento está activado por defecto; si se desactiva, el modelo puede perder parte de su capacidad de razonamiento profundo.
- Para contextos superiores a 262 000 tokens, se requiere escalado RoPE (p. ej., YaRN), que no está implementado en todos los backends de inferencia.
- La licencia Apache 2.0 permite uso comercial, pero se recomienda revisar los términos específicos del modelo base en el repositorio de Qwen.
- La cuantización excluye los pesos `nextn` (multi-token prediction), por lo que la velocidad de generación puede ser inferior a la del modelo completo en frameworks que aprovechan esa característica.

## Enlaces

- Repositorio HuggingFace de esta cuantización: https://huggingface.co/jpetrina/Qwen3.8-27B-IQ4_XS-pure-GGUF
- Modelo base GGUF de Unsloth: https://huggingface.co/unsloth/Qwen3.8-27B-GGUF
- Modelo original Qwen3.8-27B: https://huggingface.co/Qwen/Qwen3.8-27B
- Guía de Unsloth para Qwen3.8: https://unsloth.ai/docs/models/qwen3.8
- Blog oficial de Qwen sobre Qwen3.8: https://qwen.ai/blog?id=qwen3.8
- Cuantización de referencia de Qwen3.6-27B (Ununnilium): https://huggingface.co/Ununnilium/Qwen3.6-27B-IQ4_XS-pure-GGUF
