# pablolorran/SmartHome-Qwen3-4B-Instruct

## Resumen

SmartHome-Qwen3-4B-Instruct es un ajuste fino del modelo Qwen3-4B (concretamente de la variante publicada por Unsloth, `unsloth/Qwen3-4B`) desarrollado por el usuario pablolorran. El modelo está entrenado para actuar como asistente virtual de soporte y ventas de SmartHome TechBrasil, una empresa ficticia de automatización residencial (RetailTech/IoT) con productos como la línea EcoSmart y el Hub Central SmartHome. El objetivo declarado es ayudar a usuarios legos a resolver dudas de pre-venta, instalación y soporte técnico en portugués.

Técnicamente se trata de un fine-tuning mediante PEFT/QLoRA en 4 bits usando la biblioteca Unsloth, sobre un dataset propietario de 520 interacciones pregunta-respuesta generadas con un LLM. El resultado no es un modelo de propósito general, sino un asistente vertical muy especializado en un catálogo concreto de productos de domótica. Su relevancia es la de un caso de estudio de personalización de un LLM pequeño (4B) para un dominio de negocio concreto con recursos mínimos.

El repositorio tiene un tamaño de 0,1 GB, lo que sugiere que los pesos publicados podrían corresponder a adaptadores en lugar del modelo fusionado completo, aunque la model card no lo aclara. El modelo acumula 0 descargas y 0 likes en el momento de la consulta, y no presenta resultados de evaluación publicados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (familia Qwen3) con fine-tuning PEFT/LoRA |
| Parametros totales | 4 000 millones (modelo base Qwen3-4B); tamano de los adaptadores publicados: no disponible |
| Parametros activos | No aplica (modelo denso, no es MoE) |
| Longitud de contexto | 2048 tokens segun el ejemplo de carga de la model card; contexto nativo del modelo base: no disponible en la informacion proporcionada |
| Tipos de cuantizacion | QLoRA 4-bit en entrenamiento; carga en 4 bits (`load_in_4bit=True`) en inferencia. No se declaran ficheros GGUF ni otras cuantizaciones |
| Idiomas soportados | Portugues (`pt`) |
| Licencia | MIT |
| Formato de pesos | safetensors |
| Tamano del repositorio | 0,1 GB |
| Modelo base | `unsloth/Qwen3-4B` |
| Dataset de entrenamiento | [SmartHome-Knowledge-Base](https://huggingface.co/datasets/pablolorran/SmartHome-Knowledge-Base), 520 interacciones QnA |
| Autor | pablolorran |

## Arquitectura y entrenamiento

El modelo parte de `unsloth/Qwen3-4B`, un transformer decoder-only denso de 4 000 millones de parametros de la familia Qwen3. El ajuste se realiza con PEFT sobre LoRA en precision de 4 bits (QLoRA), utilizando la libreria Unsloth, que optimiza el entrenamiento de adaptadores mediante kernels personalizados y reduccion del uso de memoria. La model card no especifica el rango de LoRA, el learning rate, el numero de pasos ni la composicion exacta de las capas adaptadas.

El corpus de entrenamiento es una base de conocimiento propietaria generada con un LLM que contiene 520 interacciones QnA centradas en los productos de SmartHome TechBrasil: la linea EcoSmart (lamparas y tomas inteligentes con conectividad Wi-Fi) y el Hub Central SmartHome (integrador compatible con Alexa, Google Assistant y red Zigbee). La model card menciona el uso de una plantilla de chat con mensaje de sistema que define la persona del asistente, y recomienda `temperature=0.1` y `max_new_tokens=256` para la inferencia. No se documenta el uso de RLHF, DPO ni tecnicas adicionales de alineamiento mas alla del ajuste supervisado sobre el dataset QnA.

## Capacidades

- Generacion de texto conversacional en portugues orientada a soporte y venta de productos de domotica.
- Resolucion de dudas de pre-venta sobre las lineas EcoSmart y Hub Central SmartHome.
- Soporte tecnico guiado: proceso de pareado de dispositivos a la red Wi-Fi, diagnostico de problemas de conexion e informacion de instalacion.
- Asistencia en la creacion de rutinas y automatizaciones dentro del ecosistema SmartHome.
- Conocimiento del ecosistema de integracion declarado: Alexa, Google Assistant y red Zigbee a traves del Hub Central.
- Mantenimiento de una persona de marca concreta mediante el mensaje de sistema definido en la model card (tono claro, servicial y amable).
- Generacion de respuestas en formato conversacional multi-turno basico, limitado por la ventana de contexto configurada.
- Soporte de tool calling / function calling: no disponible (no se menciona en la informacion proporcionada).
- Capacidades de agente y razonamiento multi-paso: no disponible (no se menciona en la informacion proporcionada).
- Modo de razonamiento explicito (thinking mode): no disponible.
- Capacidades de vision o audio: no disponibles.

## Casos de uso

- Atencion al cliente automatizada de primer nivel: el modelo puede gestionar consultas recurrentes sobre instalacion, pareado y funcionamiento de los dispositivos, reduciendo la carga del equipo humano. Es adecuado por su especializacion en el catalogo y su respuesta en portugues.
- Chatbot de pre-venta en tienda online: puede responder preguntas sobre diferencias entre productos de la linea EcoSmart y el Hub Central, y orientar la compra segun las necesidades del usuario.
- Asistente embebido en la app movil de la empresa: al ser un modelo de 4B, puede desplegarse en infraestructura modesta y servir respuestas en tiempo casi real dentro de un flujo de soporte in-app.
- Guia de solucion de problemas paso a paso: para incidencias de conexion Wi-Fi o de integracion Zigbee, el modelo puede estructurar una secuencia de comprobaciones partiendo de la base de conocimiento entrenada.
- Generacion de respuestas en un sistema de ticketing: integrado como sugeridor de respuesta para agentes humanos, que revisan y envian la contestacion final al cliente.
- Onboarding y formacion interna: puede utilizarse como simulador de conversaciones para entrenar a nuevos agentes de soporte en el discurso de producto de la empresa.
- Soporte a la creacion de rutinas de automatizacion: el asistente puede explicar al usuario como plantear rutinas basicas (horarios, encendido por presencia, escenas) con los dispositivos compatibles.
- Base para prototipos de asistentes verticales: sirve como plantilla reproducible de fine-tuning con Unsloth y QLoRA para otros dominios de retail o IoT con necesidade de datos limitados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye evaluaciones sobre MMLU, HumanEval, GSM8K ni metricas especificas del dominio (por ejemplo, exactitud de respuesta sobre el dataset SmartHome-Knowledge-Base), y no se ha publicado ninguna evaluacion externa del modelo.

## Requisitos de hardware

- VRAM estimada para inferencia (estimaciones a partir de un modelo denso de 4B; no verificadas en la model card):
  - Cuantizacion 4 bits: en torno a 3 GB de VRAM para los pesos, mas el coste del contexto y del KV cache.
  - Cuantizacion 8 bits: en torno a 5 GB.
  - Precision completa FP16/BF16: en torno a 8-9 GB.
- GPU recomendadas: cualquier GPU con al menos 6-8 GB de VRAM para 4 bits (RTX 3060, RTX 4060, RTX 2070 o superiores). Para FP16 sin cuantizar, se recomienda RTX 3090, RTX 4090, A10G, L4 o superiores. Para servir varias peticiones concurrentes, A100 o H100.
- Compatibilidad con GPU de consumo: si, cabe en GPUs de gama media con cuantizacion de 4 bits, que es precisamente el modo que usa el ejemplo de la model card.
- Opciones de despliegue: la model card solo documenta la carga mediante la libreria `unsloth` con `FastLanguageModel`. No se mencionan instrucciones para vLLM, llama.cpp, Ollama o TGI, y no se publican ficheros GGUF, por lo que el uso con esas herramientas requeriria conversion previa.
- Latencia y throughput: no disponibles. No se publican mediciones de tokens por segundo ni de latencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Enfoque | Disponibilidad |
|---|---|---|---|---|---|---|
| SmartHome-Qwen3-4B-Instruct | 4B | 2048 tokens configurados en el ejemplo de carga (nativo del base: no disponible) | Portugues | MIT | Fine-tuning vertical de soporte y ventas de domotica | HuggingFace, 0 descargas |
| Qwen/Qwen3-4B | 4B | No disponible en la informacion proporcionada | Multilingue | No disponible en la informacion proporcionada | Modelo base de proposito general, sobresale en comprension de lenguaje, generacion, codigo y matematicas | HuggingFace |
| Qwen/Qwen3-4B-Instruct-2507 | 4B | No disponible en la informacion proporcionada | Multilingue | No disponible en la informacion proporcionada | Variante solo instruct, sin soporte de thinking mode | HuggingFace, Qualcomm AI Hub, Ollama |
| Otros fine-tunes verticales de 3-4B | 3-4B | No disponible | Variable | Variable | Asistentes de dominio especifico | No disponible |

Segun la informacion de Ollama, el Qwen3-4B base es capaz de rivalizar con Qwen2.5-72B-Instruct en rendimiento, lo que situa la calidad del modelo de partida en un nivel competitivo para su tamano. No obstante, no existen datos que permitan comparar el rendimiento del fine-tuning de SmartHome con estos modelos de referencia.

## Limitaciones y advertencias

- Dominio extremadamente restringido: el entrenamiento se basa en solo 520 interacciones QnA sobre una empresa ficticia, por lo que el modelo probablemente responde de forma poco fiable fuera de ese catalogo.
- Riesgo elevado de alucinacion: al ser un ajuste pequeno sobre un dataset generado por LLM, puede inventar especificaciones de producto, precios, compatibilidades o procedimientos de instalacion que no existan.
- Sesgo de persona: el modelo tiende a responder con el discurso comercial de SmartHome TechBrasil; no es neutral y no deberia usarse como fuente de informacion independiente.
- Idioma: unicamente portugues segun la etiqueta de idioma del repositorio. No hay evidencia de soporte de castellano ni de otros idiomas, y al no documentarse el multilingueismo del base podria degradarse.
- Contexto limitado: el ejemplo de la model card configura `max_seq_length=2048`, insuficiente para conversaciones largas o para inyectar documentacion extensa en el prompt.
- Ambiguedad del repositorio: 0,1 GB de tamano para un modelo de 4B sugiere que podrian publicarse solo los adaptadores y no los pesos fusionados. Conviene verificar el contenido del repositorio antes de asumir una carga directa con herramientas estandar.
- Sin benchmarks: no hay ninguna evaluacion publicada que respalde la calidad del ajuste, ni metrica de exactitud sobre el propio dataset de validacion.
- Adopcion nula: 0 descargas y 0 likes, sin issues ni comunidad que permita contrastar el comportamiento real del modelo.
- Uso comercial: la licencia declarada es MIT, lo que en principio permite uso comercial, pero la model card no incluye aviso legal sobre la base de conocimiento propietaria ni sobre los terminos del modelo base, por lo que conviene revisar la licencia de `unsloth/Qwen3-4B` y de Qwen3-4B antes de un despliegue en produccion.
- Produccion: al no documentarse tool calling, despliegue con servidores de inferencia de alto rendimiento ni evaluaciones de robustez, no se recomienda su uso directo en atencion al cliente real sin una capa de validacion humana y filtros de contenido.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/pablolorran/SmartHome-Qwen3-4B-Instruct
- Dataset SmartHome-Knowledge-Base: https://huggingface.co/datasets/pablolorran/SmartHome-Knowledge-Base
- Modelo base empleado (Unsloth): https://huggingface.co/unsloth/Qwen3-4B
- Qwen3-4B en HuggingFace: https://huggingface.co/Qwen/Qwen3-4B
- Qwen3-4B-Instruct-2507 en HuggingFace: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
- Qwen3-4B-Instruct-2507 en Qualcomm AI Hub: https://aihub.qualcomm.com/models/qwen3_4b_instruct_2507
- Qwen3-4B en Qualcomm AI Hub: https://aihub.qualcomm.com/models/qwen3_4b
- Qwen3 4B Instruct en Ollama: https://ollama.com/library/qwen3:4b-instruct
