# Atomic-Germ/Qwen2.5-3B-Instruct-NPU2

## Resumen

Este repositorio, publicado por el usuario Atomic-Germ, contiene una copia del modelo Qwen2.5-3B-Instruct de Alibaba Cloud, etiquetado con el sufijo "NPU2". No se aporta ninguna documentación adicional que explique el propósito del sufijo ni si se trata de un fine-tune específico para unidades de procesamiento neuronal (NPU). Los metadatos indican que el modelo base es `Qwen/Qwen2.5-3B` y que la licencia es `qwen-research`. El repositorio tiene 0 descargas y 0 likes, lo que sugiere que es una publicación reciente o sin difusión.

El modelo subyacente, Qwen2.5-3B-Instruct, es un modelo causal de lenguaje de 3.09 mil millones de parámetros, ajustado para instrucciones y conversación. Forma parte de la serie Qwen2.5, que destaca por mejoras significativas en codificación, matemáticas, seguimiento de instrucciones y generación de texto largo, con soporte de contexto de hasta 128K tokens en la familia completa. Este modelo concreto tiene una ventana de contexto de 32.768 tokens y genera hasta 8.192 tokens. Su relevancia radica en ofrecer un rendimiento sólido en tareas de chat y razonamiento con un tamaño moderado, apto para despliegues en hardware limitado.

Dado que no hay información específica sobre la variante "NPU2", esta ficha se basa en las especificaciones del modelo original, asumiendo que el repositorio es una réplica o una adaptación menor sin cambios sustanciales en la arquitectura ni en los pesos.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal con RoPE, SwiGLU, RMSNorm, Attention QKV bias y embeddings atados |
| Parametros totales | 3.09 mil millones |
| Parametros activos | No disponible (no es un modelo MoE) |
| Longitud de contexto | 32.768 tokens (generación hasta 8.192 tokens) |
| Tipos de cuantizacion | No se indican en el repositorio; el modelo base admite cuantizaciones comunes (GGUF, AWQ, etc.) |
| Idiomas soportados | Inglés (según metadatos del repositorio; el modelo base declara soporte para 29 idiomas) |
| Licencia | qwen-research (licencia de investigación, con restricciones para uso comercial) |
| Formato de pesos | Safetensors (tamaño del repositorio 2.6 GB) |

## Arquitectura y entrenamiento

La arquitectura es un transformer causal estándar con atención de consulta agrupada (GQA) con 16 cabezas de consulta y 2 de clave/valor, 36 capas y embeddings atacadas. Utiliza RoPE (rotary positional embeddings), SwiGLU como función de activación y RMSNorm para normalización. El modelo fue pre-entrenado en un dataset de hasta 18 billones de tokens (según la documentación de Qwen2.5) y posteriormente ajustado con instrucciones y técnicas de alineación como RLHF. La model card original menciona mejoras en el seguimiento de instrucciones, generación de JSON y resiliencia a prompts de sistema diversos.

No se dispone de información específica sobre el proceso de entrenamiento de esta variante "NPU2". Al tratarse de una copia del modelo base, se asume que la arquitectura y los pesos son idénticos a los de Qwen2.5-3B-Instruct.

## Capacidades

- Generación de texto conversacional: responde a preguntas, mantiene diálogos multi-turno y sigue instrucciones con formato de chat.
- Razonamiento y matemáticas: ha demostrado mejoras en tareas de razonamiento numérico y lógico en comparación con Qwen2.
- Generación de código: soporta tareas de programación en diversos lenguajes, aunque no es un modelo especializado como el Coder.
- Generación de texto largo: puede producir respuestas de hasta 8.192 tokens y manejar contextos de 32K tokens.
- Comprensión de datos estructurados: puede procesar tablas y generar salidas JSON válidas.
- Soporte de tool calling: aunque no se menciona explícitamente en la model card, los modelos Qwen2.5 incluyen soporte para funciones mediante la API de chat.
- Multilingüe: aunque el repositorio indica solo inglés, el modelo base soporta 29 idiomas, incluyendo español, francés, alemán, etc.

## Casos de uso

- Atención al cliente automatizada: el modelo puede gestionar conversaciones multi-turno con un contexto de 32.768 tokens, permitiendo mantener el historial completo de una interacción y resolver consultas de soporte sin perder información.
- Generación de código en entornos de desarrollo: puede asistir a programadores con sugerencias de código, depuración y explicaciones, integrándose en editores o pipelines de CI/CD mediante llamadas a API.
- Análisis de datos tabulares: gracias a su capacidad para entender tablas y generar JSON, es útil para extraer información de documentos estructurados o transformar datos en formatos legibles por máquinas.
- Chatbot de documentación técnica: puede responder preguntas sobre manuales o APIs, manteniendo coherencia a lo largo de conversaciones largas.
- Generación de contenido educativo: puede redactar explicaciones, resúmenes y ejercicios en inglés, adaptándose a distintos niveles de complejidad.
- Prototipado rápido de aplicaciones de chat: su tamaño de 3B permite ejecutarlo en hardware de consumo, ideal para pruebas de concepto y demos sin depender de servicios externos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card original enlaza al blog de Qwen2.5 y a la documentación de benchmarks de velocidad, pero no se incluyen números concretos en este repositorio. No se proporcionan métricas de MMLU, HumanEval, GSM8K ni otras evaluaciones. Para conocer el rendimiento se recomienda consultar el blog de Qwen (enlace en la sección de enlaces).

## Requisitos de hardware

- VRAM estimada: para el modelo en FP16 (2.6 GB de pesos) se requieren aproximadamente 6-8 GB de VRAM para inferencia con un batch pequeño. Con cuantización a 8 bits (INT8) se reduce a ~3-4 GB, y con 4 bits (Q4) a ~2-3 GB.
- GPU recomendadas: puede ejecutarse en GPUs de consumo como NVIDIA RTX 3060 (12 GB), RTX 4070 (12 GB) o superiores. También es viable en tarjetas con 8 GB de VRAM usando cuantización.
- Compatibilidad con hardware de consumo: sí, es uno de los modelos de 3B más ligeros de la familia Qwen, apto para PC domésticos y portátiles con GPU moderada.
- Opciones de despliegue: transformers (Python), vLLM para inferencia de alto rendimiento, llama.cpp para CPU y GPU, Ollama para ejecución local simplificada, y TGI (Text Generation Inference) para entornos de producción.
- Latencia y throughput: no se han publicado datos específicos en la información disponible. En una RTX 4090 se puede esperar una generación de ~100-200 tokens/segundo con cuantización 4 bits, pero esto es una estimación general no verificada para este modelo concreto.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de características detalladas de modelos comparables en la información proporcionada. Como este repositorio es idéntico al Qwen2.5-3B-Instruct original, se puede comparar con otros modelos de 3B como Llama-3.2-3B o Gemma-3-3B, pero no se tienen datos cuantitativos en esta fuente. Se recomienda consultar el blog de Qwen para ver comparativas de la serie Qwen2.5.

## Limitaciones y advertencias

- Sesgos conocidos: el modelo puede heredar sesgos de los datos de entrenamiento, comunes en modelos de lenguaje grandes. No se ha realizado una auditoría específica en este repositorio.
- Riesgo de alucinación: como todo LLM, puede generar información plausible pero incorrecta, especialmente en temas especializados o poco representados.
- Limitaciones de idioma: el repositorio declara solo inglés, aunque el modelo base soporta más idiomas. El rendimiento en otros idiomas puede ser inferior al del inglés.
- Restricciones de licencia: la licencia `qwen-research` es de tipo investigación, lo que limita el uso comercial sin permisos adicionales. Es crucial revisar los términos completos antes de usar el modelo en producción.
- Falta de documentación sobre la variante "NPU2": no hay información sobre si el modelo está optimizado para NPU, si ha sido fine-tuneado o si contiene cambios técnicos. Se debe tratar como el modelo base.
- Requiere `transformers>=4.37.0` para cargar correctamente el modelo, según la model card.

## Enlaces

- Repositorio Hugging Face: [Atomic-Germ/Qwen2.5-3B-Instruct-NPU2](https://huggingface.co/Atomic-Germ/Qwen2.5-3B-Instruct-NPU2)
- Modelo original Qwen2.5-3B-Instruct: [Qwen/Qwen2.5-3B-Instruct](https://huggingface.co/Qwen/Qwen2.5-3B-Instruct)
- Blog de Qwen2.5: [Qwen2.5 Blog](https://qwenlm.github.io/blog/qwen2.5/)
- GitHub de Qwen2.5: [QwenLM/Qwen2.5](https://github.com/QwenLM/Qwen2.5)
- Documentación de Qwen: [Qwen Docs](https://qwen.readthedocs.io/en/latest/)
- Tutorial de despliegue local: [Guía para ejecutar Qwen2.5-3B-Instruct](https://aiindigo.com/tutorials/getting-started-with-qwen2-5-3b-instruct-deploying-efficient-local-ai)
- Página en Ollama: [qwen2.5:3b-instruct](https://ollama.com/library/qwen2.5:3b-instruct)
- Especificaciones y benchmarks en LocalLLMs: [Qwen2.5-3B-Instruct specs](https://localllms.dev/llm/qwenqwen25-3b-instruct/)
