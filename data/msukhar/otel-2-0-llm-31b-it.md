# msukhar/OTel-2.0-LLM-31B-IT

## Resumen

OTel-2.0-LLM-31B-IT es un modelo de lenguaje especializado en telecomunicaciones, desarrollado por AT&T en colaboración con GSMA, Microsoft, Dell, AMD y Red Hat dentro del proyecto Open Telco AI. Se trata de un post-entrenamiento del modelo base Gemma 4 31B-IT de Google, adaptado mediante un entrenamiento adicional de aproximadamente 440 mil millones de tokens de dominio telecom. Es la primera versión de la familia OTel 2.0, que amplía el enfoque original de OTel 1.0 (centrado en RAG y abstinencia) hacia un programa más amplio de adaptación de dominio, incluyendo respuesta directa a preguntas, seguimiento de instrucciones y llamada a herramientas.

El modelo está diseñado para flujos de trabajo de grado operador en redes de telecomunicaciones: interpretación de estándares, operaciones de red, desarrollo de productos, asistencia a configuración de red, RAG y preguntas-respuesta específicas del sector. Con 31 mil millones de parámetros (32.106.632.252 según los pesos safetensors), ofrece un equilibrio entre capacidad y despliegue práctico, y se distribuye bajo licencia Apache 2.0, lo que facilita su uso comercial y su integración en entornos de producción. Su relevancia actual radica en ser el mayor modelo open source construido específicamente para telecomunicaciones, con una cobertura de corpus crudo 25 veces superior a la de su predecesor.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (basado en Gemma 4 31B-IT) |
| Parametros totales | 31B (32.106.632.252 según safetensors) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (se distribuye en safetensors; cuantizaciones posteriores no especificadas) |
| Idiomas soportados | Inglés |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de la arquitectura de Gemma 4 31B-IT, un transformer denso con atención completa, sin mezcla de expertos. Sobre esta base se realizó un post-entrenamiento de dominio específico para telecomunicaciones. El corpus inicial contiene aproximadamente 15 mil millones de tokens crudos proporcionados por GSMA a través de Open Telco AI, que incluyen estándares y material técnico de 3GPP, ETSI, ITU, GSMA, CAMARA, O-RAN y TM Forum. Este corpus se procesó hasta superar 1 billón de tokens utilizando el Synthetic Data Generation Hub (SDG Hub) de Red Hat, ejecutado en Microsoft Azure Managed Compute con aproximadamente 530 GPUs AMD MI300X. Del pool procesado se seleccionaron unos 440 mil millones de tokens para el entrenamiento final, que se llevó a cabo en GPUs AMD MI355X on-premises con infraestructura de Dell Technologies.

La mezcla de datos de entrenamiento incluye ejemplos de RAG (generación de respuestas con contexto recuperado), abstinencia (evitar responder cuando el contexto es insuficiente), preguntas-respuesta directas sobre conocimiento telecom, seguimiento de instrucciones de propósito general y ejemplos de llamada a herramientas. Es importante señalar que la mezcla actual no incluye ejemplos específicos de telecomunicaciones para MCP, llamada a herramientas o seguimiento de instrucciones; estos son de carácter general.

## Capacidades

- Generación de texto en inglés con conocimiento especializado en telecomunicaciones: estándares, protocolos, arquitecturas de red, servicios y conceptos de operación.
- RAG (Retrieval-Augmented Generation): capaz de generar respuestas fundamentadas en documentos técnicos recuperados, útil para consultas sobre especificaciones y normativas.
- Abstinencia: entrenado para abstenerse de responder cuando el contexto es ausente, irrelevante o insuficiente, reduciendo alucinaciones en escenarios de recuperación.
- Respuesta directa a preguntas sobre conocimiento factual de telecomunicaciones (QnA directa).
- Seguimiento de instrucciones de propósito general, aunque sin ejemplos específicos del dominio telecom.
- Llamada a herramientas (tool calling) de propósito general, sin integración específica de MCP telecom en la mezcla de entrenamiento.
- Capacidad de conversación multi-turno, dado su origen como modelo instructivo.

## Casos de uso

- Asistencia a operaciones de red: el modelo puede interpretar alarmas, sugerir procedimientos de resolución de incidencias y explicar comandos de configuración basándose en estándares 3GPP y documentación de operador, reduciendo el tiempo de respuesta del personal de red.
- Interpretación de estándares técnicos: ingenieros pueden consultar especificaciones de 3GPP, ETSI o ITU en lenguaje natural, obteniendo resúmenes, aclaraciones y comparativas entre versiones de estándares, gracias a su entrenamiento sobre el corpus de estándares.
- Desarrollo de productos y servicios telecom: equipos de producto pueden usar el modelo para redactar especificaciones funcionales, generar casos de prueba o validar la coherencia de propuestas de servicios frente a normativas CAMARA o TM Forum.
- Asistencia a configuración de red: el modelo puede generar ejemplos de configuración para equipos de red (por ejemplo, parámetros de radio, políticas de QoS) a partir de descripciones de requisitos, apoyándose en su conocimiento de estándares y buenas prácticas.
- Sistemas RAG para atención al cliente: integrado en un pipeline de recuperación, el modelo responde consultas de clientes sobre cobertura, facturación o resolución de problemas técnicos, fundamentando sus respuestas en documentos corporativos y abstiniéndose cuando no hay información suficiente.
- Formación y documentación interna: el modelo puede generar material formativo, guías de referencia rápida y documentación técnica a partir de los estándares, facilitando la capacitación de nuevos ingenieros y personal de operaciones.
- Automatización de agentes de soporte: gracias a su capacidad de tool calling general, puede integrarse en agentes que consulten APIs de red o bases de conocimiento, aunque la mezcla actual no incluye ejemplos telecom específicos de MCP.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La web de Open Telco AI indica que el modelo lidera el leaderboard de open-telco.ai, pero no se proporcionan métricas numéricas concretas (como MMLU, HumanEval o GSM8K) en los materiales consultados. Se recomienda consultar el leaderboard oficial para obtener datos de evaluación comparativa.

## Requisitos de hardware

- VRAM estimada para inferencia: al tratarse de un modelo de 31B parámetros en precisión FP16/BF16, se requieren aproximadamente 64 GB de VRAM para carga completa. Con cuantización a 4 bits (no especificada oficialmente, pero posible mediante herramientas como llama.cpp o GPTQ), la huella podría reducirse a unos 16-20 GB, permitiendo su ejecución en GPUs de consumo como la RTX 4090 (24 GB) o la RTX 3090.
- GPUs recomendadas: para despliegue en producción con FP16, se recomiendan GPUs de centro de datos como A100 (80 GB), H100 (80 GB) o AMD MI300X (192 GB). Para cuantización, una RTX 4090 o A6000 (48 GB) son opciones viables.
- Compatibilidad con GPUs de consumo: sí, con cuantización 4-bit u 8-bit, aunque con posibles pérdidas de calidad. Sin cuantización, no cabe en GPUs de consumo típicas (24 GB).
- Opciones de despliegue: al ser un modelo transformers estándar, es compatible con vLLM, TensorRT-LLM, llama.cpp (con conversión a GGUF), Ollama (si se convierte) y TGI (Text Generation Inference). También está disponible en Microsoft Foundry, Featherless AI y Red Hat para inferencia desde el día cero.
- Latencia y throughput: no se han publicado datos específicos. Como referencia orientativa, un modelo de 31B en FP16 en una A100 puede generar del orden de 20-40 tokens por segundo, dependiendo de la longitud de contexto y el batch. Con cuantización 4-bit en una RTX 4090, la velocidad puede ser similar o ligeramente inferior.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Entrenamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| OTel-2.0-LLM-31B-IT | 31B | No disponible | Post-entrenamiento telecom (~440B tokens) | Apache-2.0 | Hugging Face, Microsoft Foundry, Featherless AI, Red Hat |
| Gemma 4 31B-IT (base) | 31B | No disponible (128k según especificaciones de Google, no confirmado en esta ficha) | Pre-entrenamiento general | Gemma Terms of Use (permisiva, con restricciones de uso) | Hugging Face, Google AI Studio |
| OTel 1.0 (versión anterior) | No disponible | No disponible | Post-entrenamiento RAG y abstinencia (~1B tokens) | Apache-2.0 (presumiblemente) | Hugging Face |

La comparativa directa con otros modelos especializados en telecomunicaciones no está disponible en la información consultada. Frente a su modelo base, OTel-2.0-LLM-31B-IT añade conocimiento de dominio telecom y capacidades de abstinencia y RAG, a costa de un posible deterioro en tareas generales (no medido en los materiales disponibles). Frente a OTel 1.0, la versión 2.0 multiplica por 440 el volumen de tokens de entrenamiento y amplía la mezcla de datos con QnA directa, instrucciones generales y tool calling.

## Limitaciones y advertencias

- Idioma: el modelo solo soporta inglés. No está entrenado para otros idiomas, lo que limita su uso en mercados no anglófonos.
- Mezcla de entrenamiento incompleta para telecom: la mezcla actual no incluye ejemplos específicos de telecomunicaciones para MCP, tool calling o instruction following. Las capacidades de llamada a herramientas y seguimiento de instrucciones son de propósito general, lo que puede reducir su eficacia en tareas telecom agénticas.
- Actualizaciones frecuentes de pesos: el modelo está en desarrollo continuo y los pesos pueden actualizarse semanalmente. Para evaluación reproducible o despliegue en producción, es imprescindible fijar una revisión específica, hash de checkpoint o etiqueta de release.
- Riesgo de alucinación: aunque incluye entrenamiento de abstinencia, el modelo puede generar información incorrecta o inventada, especialmente en consultas fuera de su corpus de entrenamiento o cuando se le pide razonar más allá de los datos disponibles.
- Sesgos: al estar entrenado predominantemente sobre estándares y material técnico de organizaciones occidentales, puede presentar sesgos hacia prácticas y terminología de esos contextos, y carecer de cobertura de estándares o regulaciones de otras regiones.
- Restricciones de licencia: la licencia Apache-2.0 permite uso comercial, pero el modelo base Gemma 4 31B-IT tiene sus propios términos de uso de Google, que pueden imponer restricciones adicionales. Es responsabilidad del usuario verificar el cumplimiento de ambas licencias.
- Requisitos de hardware: el tamaño del modelo (31B) exige infraestructura de GPU considerable para inferencia en FP16, lo que puede ser una barrera para equipos pequeños sin acceso a GPUs de centro de datos.

## Enlaces

- Hugging Face (modelo): https://huggingface.co/msukhar/OTel-2.0-LLM-31B-IT
- Hugging Face (organización Open Telco AI): https://huggingface.co/farbodtavakkoli/OTel-2.0-LLM-31B-IT
- Repositorio GitHub de Open Telco AI: https://github.com/farbodtavakkoli/OTel
- Anuncio oficial en Open Telco AI: https://www.open-telco.ai/716-2/
- Noticia de GSMA: https://www.gsma.com/newsroom/article/atts-otel-2-0-is-now-live-the-largest-and-best-performing-open-source-model-built-for-telecoms/
- Catálogo de modelos de Microsoft Foundry: https://ai.azure.com/catalog/models/farbodtavakkoli--otel-2.0-llm-31b-it?search=otel
