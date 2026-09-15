# SirSahOl/NeoHorse-1-9B-chat-mlx-16bit

## Resumen

NeoHorse-1-9B-chat-mlx-16bit es una conversión a formato MLX (Apple Silicon) del modelo TokenRhythm/NeoHorse-1-9B, realizada por SirSahOl. Se trata de un modelo de lenguaje denso de 9.000 millones de parámetros (8.953.801.728 parámetros totales), con arquitectura Qwen3_5ForCausalLM y una ventana de contexto de 262.144 tokens. La conversión está optimizada para ejecución nativa en GPU de Apple Silicon mediante el framework MLX, manteniendo los pesos en precisión bfloat16 sin cuantizar.

El modelo está diseñado para tareas de generación de texto, conversación, razonamiento, generación de código, uso de herramientas y seguimiento de instrucciones. Su relevancia actual radica en ofrecer una alternativa de código abierto con licencia Apache 2.0, orientada a desarrolladores que trabajan en ecosistemas Apple y que necesitan un modelo con contexto largo y capacidades agénticas. Al ser una conversión MLX, no requiere infraestructura CUDA, lo que facilita su despliegue en estaciones de trabajo con memoria unificada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3_5ForCausalLM |
| Parametros totales | 8.953.801.728 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | 4-bit MLX, 8-bit MLX, 16-bit MLX (bfloat16) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

La arquitectura del modelo es Qwen3_5ForCausalLM, un transformer denso de 9.000 millones de parámetros. No se trata de un modelo de mezcla de expertos (MoE), ya que todos los parámetros se activan en cada paso de inferencia. La ventana de contexto de 262.144 tokens permite procesar documentos extensos y mantener conversaciones largas sin perder información relevante.

Esta versión concreta es una conversión al formato MLX del modelo original TokenRhythm/NeoHorse-1-9B. La conversión se ha realizado manteniendo los pesos en bfloat16, sin cuantización adicional, lo que preserva la calidad de referencia del modelo base. No se dispone de información detallada sobre los datos de entrenamiento, el número de tokens, la composición del dataset ni si se aplicaron técnicas como RLHF o DPO en la información proporcionada.

## Capacidades

- Generación de texto conversacional con soporte de chat template (ChatML), incluyendo tokens de inicio y fin de turno.
- Razonamiento y seguimiento de instrucciones complejas, según los tags del repositorio.
- Generación de código y asistencia en tareas de programación.
- Uso de herramientas (tool calling) y capacidades agénticas para orquestar flujos de trabajo multi-paso.
- Procesamiento de contexto largo de hasta 262.144 tokens, adecuado para documentos extensos y conversaciones prolongadas.
- Compatibilidad con el framework MLX, lo que permite inferencia nativa en GPU de Apple Silicon.

## Casos de uso

- Asistente conversacional local en Apple Silicon: el modelo se ejecuta de forma nativa en Mac con M1/M2/M3/M4, ofreciendo respuestas rápidas sin depender de servicios en la nube. Su ventana de contexto de 262.144 tokens permite mantener conversaciones largas y coherentes.
- Generación de código en el entorno de desarrollo: gracias a su capacidad de tool calling, puede integrarse en IDEs o pipelines de CI/CD para sugerir implementaciones, revisar fragmentos de código o automatizar tareas repetitivas.
- Agentes autónomos con razonamiento multi-paso: el soporte de uso de herramientas y de razonamiento permite construir agentes que planifican, ejecutan acciones y validan resultados, por ejemplo en flujos de automatización de datos o investigación.
- Procesamiento de documentos extensos: con 262.144 tokens de contexto, el modelo puede analizar informes, contratos o artículos largos, extrayendo información, resumiendo secciones o respondiendo preguntas específicas sobre el contenido.
- Asistente de investigación con RAG: el modelo puede combinarse con un sistema de recuperación aumentada (RAG) para responder preguntas basadas en repositorios de conocimiento corporativo, aprovechando su capacidad de seguir instrucciones y su contexto amplio.
- Chatbot de atención al cliente: la capacidad de gestionar conversaciones multi-turno y el soporte de tool calling permiten integrar el modelo en plataformas de soporte, donde puede consultar bases de datos, gestionar tickets o derivar consultas a sistemas externos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La model card incluye datos de rendimiento de inferencia en Apple Silicon, que se presentan a continuación:

| Apple Silicon Tier | Unified Memory | Active VRAM | Velocidad estimada | TTFT estimado | Uso recomendado |
| :--- | :--- | :--- | :--- | :--- | :--- |
| M1 / M2 / M3 / M4 (Base) | 24 GB+ | ~20.6 GB | ~12 tokens/seg | ~283 ms | Asistente interactivo diario y completaciones locales rápidas |
| M1 / M2 / M3 / M4 Pro | 36 GB – 48 GB | ~20.6 GB | ~18 tokens/seg | ~192 ms | Uso equilibrado: código, invocación de herramientas y chat multi-turno |
| M1 / M2 / M3 / M4 Max | 36 GB – 128 GB | ~20.6 GB | ~26 tokens/seg | ~119 ms | Generación de alto rendimiento, baja latencia, orquestación de agentes |
| M1 / M2 / M3 Ultra | 64 GB – 192 GB | ~20.6 GB | ~38 tokens/seg | ~79 ms | Concurrencia máxima, extracción por lotes, despliegue en producción |

Estas cifras son estimaciones basadas en el ancho de banda de memoria unificada de Apple Silicon y en el footprint activo de parámetros. Los valores reales pueden variar según la longitud del contexto.

## Requisitos de hardware

- VRAM estimada para inferencia: ~20.5 GB en la versión 16-bit, ~9.9 GB en la versión 8-bit y ~5.3 GB en la versión 4-bit.
- GPU recomendadas: Apple Silicon con memoria unificada de 32 GB o superior para la versión 16-bit. Para la versión 8-bit se recomienda 16 GB o más, y para la versión 4-bit basta con 8 GB.
- No es compatible con GPU NVIDIA o AMD sin una conversión previa a otro formato, ya que la versión MLX está diseñada exclusivamente para Apple Silicon.
- Opciones de despliegue: mlx-lm (CLI y API Python), LM Studio con configuración de stop strings personalizada, o cualquier runtime compatible con MLX.
- Latencia y throughput estimados: entre 12 y 38 tokens/segundo según el tier de Apple Silicon, con un tiempo hasta el primer token (TTFT) de entre 79 y 283 ms.

## Comparativa con modelos similares

No disponible. No se han proporcionado datos de benchmarks ni características de modelos comparables en la información disponible. La única referencia directa es el modelo base TokenRhythm/NeoHorse-1-9B, del cual esta versión es una conversión MLX sin cambios en los pesos.

## Limitaciones y advertencias

- No se dispone de información detallada sobre sesgos conocidos, riesgos de alucinación o limitaciones de idioma en la documentación proporcionada.
- Al ser un modelo de lenguaje generativo, existe riesgo de alucinación, especialmente en tareas que requieren hechos precisos o información actualizada.
- La versión 16-bit requiere al menos 32 GB de memoria unificada en Apple Silicon, lo que limita su uso en equipos de gama de entrada.
- El formato MLX no es compatible con frameworks basados en CUDA, por lo que su despliegue en clústeres con GPU NVIDIA requiere una conversión previa.
- La licencia Apache 2.0 permite el uso comercial, pero es necesario verificar la licencia del modelo base y de los datos de entrenamiento originales.
- El rendimiento puede degradarse con contextos muy largos, aunque la ventana sea de 262.144 tokens, debido al coste computacional de la atención.

## Enlaces

- Repositorio del modelo: https://huggingface.co/SirSahOl/NeoHorse-1-9B-chat-mlx-16bit
- Variante 4-bit: https://huggingface.co/SirSahOl/NeoHorse-1-9B-chat-mlx-4bit
- Variante 8-bit: https://huggingface.co/SirSahOl/NeoHorse-1-9B-chat-mlx-8bit
- Modelo base: https://huggingface.co/TokenRhythm/NeoHorse-1-9B
- Framework MLX: https://github.com/ml-explore/mlx
