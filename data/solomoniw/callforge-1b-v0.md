# solomoniw/CallForge-1B-v0

## Resumen

CallForge-1B v0 es un modelo de lenguaje de 1.080 millones de parámetros, especializado en tool calling y function calling, desarrollado por el usuario solomoniw. Se trata de un fine-tuning del modelo base openbmb/MiniCPM5-1B, que a su vez emplea una arquitectura LlamaForCausalLM. El modelo está diseñado para entornos de agentes con recursos limitados, donde se necesita seleccionar herramientas, construir argumentos válidos según el esquema, ejecutar llamadas y reparar fallos de ejecución.

Su relevancia radica en que, pese a su tamaño reducido, mejora significativamente la generalización a herramientas no vistas durante el entrenamiento. Según los datos publicados, pasa de un 0% de éxito en herramientas fuera del conjunto de entrenamiento a un 43%, lo que lo convierte en una opción viable para aplicaciones locales de automatización y agentes conversacionales. Utiliza la plantilla de chat nativa de MiniCPM5 con marcado XML para las llamadas a herramientas.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LlamaForCausalLM |
| Parametros totales | 1.080.632.832 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (repo en safetensors, sin cuantizaciones predefinidas) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura LlamaForCausalLM, tal como indica el campo `architectures` del modelo base. El fine-tuning se realizó sobre MiniCPM5-1B, un modelo de 1B parámetros de OpenBMB. La model card no detalla el dataset de entrenamiento ni el proceso (si se usó RLHF, DPO u otro método). Lo que sí se especifica es que el modelo emplea la plantilla de chat nativa de MiniCPM5 con un marcado XML para las llamadas a herramientas, lo que permite estructurar las invocaciones de funciones de forma consistente.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del corpus ni las técnicas de optimización más allá del fine-tuning supervisado implícito.

## Capacidades

- Generación de texto y razonamiento conversacional básico.
- Tool calling y function calling: selección de herramientas, construcción de argumentos válidos según el esquema JSON, ejecución de llamadas y reparación de fallos.
- Soporte para agentes: puede integrarse en flujos multi-paso donde se requiera decidir qué herramienta usar y cómo.
- Generalización a herramientas no vistas: según la evaluación, alcanza un 43% de éxito en herramientas fuera del conjunto de entrenamiento.
- Compatible con el formato de chat de MiniCPM5, incluyendo el marcado XML para llamadas a funciones.
- No se especifican capacidades multimodales ni soporte de audio o visión.

## Casos de uso

- Asistentes virtuales locales con acceso a APIs: el modelo puede gestionar peticiones como "¿qué tiempo hace en Madrid?" y generar la llamada a una API meteorológica con los parámetros correctos.
- Automatización de tareas de oficina: integrado en un agente que consulta calendarios, envía correos o actualiza registros mediante funciones definidas por el usuario.
- Chatbots de atención al cliente con integración en sistemas de ticketing: el modelo selecciona la acción adecuada (crear ticket, consultar estado, derivar) y rellena los campos obligatorios.
- Pipelines de CI/CD: como generador de comandos o llamadas a herramientas de despliegue, aprovechando su capacidad de estructurar argumentos válidos.
- Prototipos de agentes en entornos con poca memoria: su tamaño de 1B permite ejecutarlo en hardware modesto, ideal para desarrollo y pruebas.
- Sistemas de extracción de datos estructurados: dado un texto, el modelo puede invocar funciones que transforman la información en formato JSON.

## Benchmarks y rendimiento

La model card proporciona una evaluación específica para tool calling, comparando el modelo base con CallForge-1B v0:

| Metrica | MiniCPM5-1B (base) | CallForge-1B v0 |
| :--- | :--- | :--- |
| Tasa de exito en tareas vistas | 20% | 40% |
| Tasa de exito en herramientas no vistas | 0% | 43% |
| Tasa de bien formado del parser | 100% | 92% |
| Tasa de validez de esquema del parser | 100% | 92% |

No se han publicado resultados en benchmarks estándar como MMLU, HumanEval o GSM8K en la información disponible.

## Requisitos de hardware

- VRAM estimada: con 1.08B parámetros, en bfloat16 ocupa aproximadamente 2.2 GB; en float32 unos 4.3 GB (coincide con el tamaño del repositorio). Con cuantizaciones de 4 bits podría reducirse a ~0.7 GB.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM (por ejemplo, RTX 3050, RTX 3060, GTX 1660 Super) es suficiente para inferencia en bfloat16. Para mayor velocidad, una RTX 4090 o A10G serían adecuadas.
- Cabe en GPUs de consumo: sí, incluso en tarjetas con 4-6 GB.
- Opciones de despliegue: Hugging Face Transformers (como se muestra en el ejemplo), vLLM, llama.cpp, Ollama, TGI (Text Generation Inference) siempre que se adapte el formato de pesos.
- Latencia y throughput: no disponibles. Se estima que en una RTX 3060 la generación de 256 tokens podría tardar entre 2 y 5 segundos, pero no hay datos oficiales.

## Comparativa con modelos similares

No se dispone de comparativas directas con otros modelos de 1B especializados en tool calling. El modelo base MiniCPM5-1B es la referencia más cercana, y la tabla de evaluación ya muestra la mejora. Otros modelos de tamaño similar como allenai/Bolmo-1B existen, pero no se han encontrado datos comparativos de rendimiento en tareas de función calling. Por tanto, se indica que la comparativa no está disponible.

## Limitaciones y advertencias

- Sesgos y alucinaciones: no se han evaluado formalmente; al ser un modelo pequeño, puede generar respuestas inexactas o inventar herramientas inexistentes.
- Riesgo de alucinación en llamadas a funciones: la tasa de parser bien formado es del 92%, lo que implica que un 8% de las salidas pueden no ser parseables.
- Limitaciones de contexto: no se especifica la longitud máxima de contexto; se recomienda probar con ventanas cortas para evitar degradación.
- Idiomas: no se indica qué idiomas soporta; probablemente esté limitado a los idiomas del modelo base, que no se detallan.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero el modelo base MiniCPM5-1B tiene su propia licencia; es necesario verificar ambas.
- Para producción, se recomienda implementar validación de esquema y reintentos ante fallos, ya que el modelo no garantiza una tasa de éxito perfecta.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/solomoniw/CallForge-1B-v0
- Modelo base MiniCPM5-1B: https://huggingface.co/openbmb/MiniCPM5-1B
- Paquete PyPI callforge-ai (posiblemente relacionado): https://pypi.org/project/callforge-ai/
