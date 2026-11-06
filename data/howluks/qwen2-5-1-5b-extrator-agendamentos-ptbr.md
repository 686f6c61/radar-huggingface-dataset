# HowLuks/qwen2.5-1.5b-extrator-agendamentos-ptbr

## Resumen

El modelo `HowLuks/qwen2.5-1.5b-extrator-agendamentos-ptbr` es un adaptador LoRA sobre el modelo base Qwen2.5-1.5B-Instruct, desarrollado por el usuario HowLuks. Su propósito es muy concreto: extraer información estructurada de mensajes de WhatsApp en portugués de Brasil para convertirlos en un objeto JSON con los campos de intención, servicio, profesional, fecha, hora y período. El catálogo del negocio y la fecha actual se inyectan a través del prompt de sistema, de modo que el modelo no memoriza el catálogo sino que lo consulta en cada inferencia.

Se trata de un modelo de nicho, con solo 1.500 millones de parámetros en el base y un adaptador LoRA de pequeño tamaño (el repositorio ocupa 0,1 GB). No es un modelo de propósito general: está especializado en una tarea de extracción de información (information extraction) en un dominio acotado como es la gestión de citas en pequeños negocios. Su relevancia radica en que demuestra que un modelo pequeño ajustado con 600 ejemplos sintéticos puede superar ampliamente al modelo base en una tarea concreta, con una exactitud del 89,7 % frente al 18,3 % del base.

La licencia Apache 2.0 del adaptador y del modelo base facilita su uso comercial, si bien las limitaciones del dataset sintético y la ausencia de contexto conversacional deben tenerse en cuenta antes de llevarlo a producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre transformer decoder-only Qwen2.5-1.5B-Instruct |
| Parametros totales | 1.500 millones (modelo base); tamaño del adaptador no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (la del modelo base Qwen2.5-1.5B-Instruct es 32.768 tokens, dato no confirmado en esta ficha) |
| Tipos de cuantizacion | no disponible; al ser un adaptador PEFT, la cuantizacion depende del despliegue del modelo base (GGUF, bitsandbytes, etc.) |
| Idiomas soportados | portugués (pt), según la model card |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA); el base en safetensors |

## Arquitectura y entrenamiento

El adaptador se entrena sobre Qwen2.5-1.5B-Instruct, un transformer decoder-only de 1.500 millones de parámetros. La técnica empleada es LoRA (Low-Rank Adaptation), que congela los pesos del modelo base e introduce matrices de bajo rango entrenables en las capas de atención. El repositorio contiene únicamente los pesos del adaptador en formato safetensors, con un tamaño total de 0,1 GB, lo que refleja el bajo número de parámetros entrenables.

El entrenamiento se realizó con 600 mensajes sintéticos en portugués, generados por LLMs (Gemini y Claude) a partir de etiquetas sorteadas, y se evaluó sobre 300 mensajes de test. La tarea consiste en leer un mensaje de WhatsApp junto con un prompt de sistema que contiene el catálogo de servicios y profesionales del negocio y la fecha actual, y devolver un JSON con los campos de agendamiento. No se especifica en la información disponible si se emplearon técnicas de RLHF o DPO, ni el número de tokens de entrenamiento, la composición exacta del dataset ni los hiperparámetros del LoRA (rango, alpha, dropout, tasa de aprendizaje). Tampoco se detalla si se aplicaron técnicas de decodificación especulativa o atención lineal.

## Capacidades

- Extracción de información estructurada: convierte mensajes de WhatsApp en portugués en un JSON con los campos intención, servicio, profesional, fecha, hora y período.
- Clasificación de intención: distingue entre solicitud de agendamiento, consulta, cancelación u otras intenciones, según el esquema de la tarea.
- Normalización de entidades: identifica el servicio y el profesional a partir del catálogo inyectado en el prompt de sistema.
- Resolución de fechas y horas: interpreta expresiones temporales en portugués y las normaliza a un formato estructurado, usando la fecha actual proporcionada en el prompt.
- Generación de JSON: produce una salida estructurada consumible por un pipeline posterior.
- No soporta tool calling ni function calling de forma nativa más allá de la generación de JSON.
- No soporta agentes ni razonamiento multi-paso: cada mensaje se procesa de forma aislada, sin memoria conversacional.
- Capacidades multilingües limitadas al portugués; no se ha entrenado ni evaluado en otros idiomas.
- No dispone de modo thinking, visión ni audio.

## Casos de uso

- Automatización de la recepción de citas en pequeños negocios: el modelo lee el mensaje del cliente en WhatsApp y devuelve un JSON con el servicio, profesional, fecha y hora solicitados, que un backend puede insertar directamente en la agenda. Es adecuado porque la tarea está acotada y el catálogo se inyecta en el prompt, evitando reentrenamientos cuando cambia la oferta del negocio.
- Integración con chatbots de atención al cliente: el JSON extraído puede alimentar un flujo de confirmación o un sistema de reservas, reduciendo la necesidad de intervención humana en la primera fase del agendamiento.
- Clasificación y enrutado de mensajes entrantes: la intención extraída permite derivar cada mensaje al departamento o al flujo correspondiente (reservas, consultas, cancelaciones) sin procesamiento adicional.
- Normalización de datos para CRM: los campos estructurados (servicio, profesional, fecha, hora, período) pueden volcarse en un CRM o en una hoja de cálculo para su análisis posterior.
- Prototipado rápido de asistentes de agenda: al ser un adaptador LoRA de 0,1 GB sobre un modelo de 1,5B, se puede desplegar en una GPU de consumo para validar un producto antes de invertir en un modelo mayor.
- Extracción de datos en entornos con recursos limitados: el tamaño reducido del adaptador y del modelo base permite ejecutarlo en infraestructura modesta, algo relevante para pymes o despliegues en el borde.
- Generación de datasets etiquetados: el modelo puede usarse para preetiquetar mensajes reales y acelerar la anotación manual en un proceso de mejora continua del dataset.

## Benchmarks y rendimiento

Resultados publicados en la model card sobre 300 mensajes de test sintéticos:

| Modelo | Exacta | Intención | Servicio | Profesional | Fecha | Hora | Período |
|---|---|---|---|---|---|---|---|
| qwen_lora | 89,7 % | 98,0 % | 99,7 % | 99,3 % | 92,7 % | 100,0 % | 100,0 % |
| qwen_base | 18,3 % | 84,7 % | 82,0 % | 91,7 % | 50,0 % | 85,7 % | 65,0 % |

La métrica "exacta" es la fracción de mensajes con todos los campos correctos. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base de 1,5B en FP16 requiere aproximadamente 3 GB de VRAM; en cuantización de 8 bits, unos 1,5-2 GB; en 4 bits, alrededor de 1 GB. El adaptador LoRA añade una sobrecarga mínima (0,1 GB en disco).
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para FP16, como una RTX 3050, RTX 4060 o superior. Para mayor throughput, una RTX 4090, A100 o H100.
- Cabe en GPU de consumo: sí, en la mayoría de GPUs consumer modernas con 4 GB o más de VRAM, e incluso en CPU con llama.cpp u Ollama si se convierte el modelo base a GGUF y se aplica el adaptador.
- Opciones de despliegue: vLLM (con soporte de adaptadores LoRA), TGI, llama.cpp (requiere fusionar el adaptador con el base y convertir a GGUF), Ollama (previa fusión y conversión), transformers + PEFT para inferencia directa.
- Latencia y throughput estimados: no disponibles en la información proporcionada. Dado el tamaño del modelo, se espera una latencia baja en GPU consumer (decenas de milisegundos por mensaje corto), pero no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| HowLuks/qwen2.5-1.5b-extrator-agendamentos-ptbr | 1,5B (base) + LoRA | no disponible | Extracción de agendamientos en pt-BR | Apache 2.0 | Hugging Face |
| Qwen/Qwen2.5-1.5B-Instruct | 1,5B | 32.768 tokens (según documentación del base) | Propósito general, instrucciones | Apache 2.0 | Hugging Face |
| Modelos de extracción de información en portugués de tamaño similar | no disponible | no disponible | Extracción de entidades o JSON | no disponible | no disponible |

No se dispone de información sobre otros adaptadores LoRA especializados en extracción de agendamientos en portugués que permitan una comparación directa. La comparación más relevante es con el modelo base, cuyos resultados en la misma tarea se recogen en la tabla de benchmarks.

## Limitaciones y advertencias

- Dataset sintético: los 600 mensajes de entrenamiento fueron generados por LLMs (Gemini y Claude) a partir de etiquetas sorteadas; los mensajes reales de WhatsApp tienden a ser más desordenados, con abreviaturas, errores ortográficos y ruido, lo que puede degradar el rendimiento en producción.
- Sin memoria conversacional: cada mensaje se procesa de forma aislada, sin contexto de mensajes anteriores; no es adecuado para conversaciones multi-turno sin un sistema externo que gestione el estado.
- Dependencia del prompt de sistema: el catálogo de servicios y profesionales y la fecha actual deben inyectarse correctamente en cada inferencia; un catálogo mal formateado o desactualizado provoca errores en la extracción.
- Riesgo de alucinación: como todo modelo generativo, puede inventar servicios, profesionales o fechas que no estén en el catálogo, especialmente ante mensajes ambiguos.
- Sesgos: no se han documentado sesgos específicos, pero al entrenarse con datos sintéticos generados por LLMs, puede heredar sesgos de esos generadores.
- Limitaciones de idioma: solo se ha entrenado y evaluado en portugués; no se garantiza su funcionamiento en otros idiomas.
- Licencia: Apache 2.0 permite uso comercial, pero se recomienda verificar las condiciones del modelo base Qwen2.5-1.5B-Instruct, también Apache 2.0.
- Madurez: el modelo tiene 12 descargas y 0 likes en el momento de la consulta, lo que sugiere que no ha sido validado por la comunidad; conviene realizar una evaluación propia con datos reales antes de usarlo en producción.

## Enlaces

- Hugging Face: https://huggingface.co/HowLuks/qwen2.5-1.5b-extrator-agendamentos-ptbr
- Repositorio GitHub con datos, prompt y código: https://github.com/HowLuks/extrator-agendamentos-ptbr
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
