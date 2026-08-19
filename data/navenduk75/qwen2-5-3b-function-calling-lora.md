# navenduk75/qwen2.5-3b-function-calling-lora

## Resumen

`navenduk75/qwen2.5-3b-function-calling-lora` es un adaptador LoRA entrenado sobre el modelo base `Qwen/Qwen2.5-3B-Instruct` para dotar a un modelo pequeño de capacidades estructuradas de *function calling* y *tool use*. El adaptador ha sido desarrollado por el usuario navenduk75 y publicado en HuggingFace, con el objetivo de permitir que el modelo genere llamadas a herramientas en formato JSON, XML o estilo OpenAI, o bien responda en lenguaje natural cuando no corresponde invocar ninguna función.

El modelo resuelve el problema de añadir *tool calling* a un LLM compacto sin necesidad de un ajuste completo, mediante un adaptador LoRA de bajo rango (`r=16`, `lora_alpha=32`) entrenado con `SFTTrainer` de TRL sobre un dataset sintético. La relevancia actual radica en la creciente demanda de agentes conversacionales ligeros que puedan integrarse en entornos con recursos limitados, manteniendo la capacidad de interactuar con APIs y servicios externos. Al ser un adaptador, requiere el modelo base para funcionar, y no se distribuye como un modelo fusionado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen2.5-3B-Instruct (decoder-only transformer) + adaptador LoRA |
| Parametros totales | ~3.09B (modelo base) + parametros del adaptador (no especificados) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 32,768 tokens (heredada del modelo base Qwen2.5-3B-Instruct) |
| Tipos de cuantizacion | No disponible (el adaptador se distribuye en safetensors; el base puede cuantizarse con GPTQ, AWQ o GGUF) |
| Idiomas soportados | No especificados en la model card; el base Qwen2.5 soporta multiples idiomas (incluido español, ingles, chino, frances, aleman, etc.) |
| Licencia | Apache-2.0 (declarada en la model card; el campo de HuggingFace indica "no disponible") |
| Formato de pesos | safetensors (adaptador PEFT) |

## Arquitectura y entrenamiento

El adaptador se basa en la arquitectura transformer densa de Qwen2.5-3B-Instruct, un modelo decoder-only preentrenado con hasta 18T tokens segun la documentacion oficial de Qwen2.5. El ajuste se realizo mediante LoRA sobre las proyecciones `q_proj` y `v_proj` con rango `r=16` y `lora_alpha=32`, utilizando el `SFTTrainer` de TRL. El dataset sintetico de entrenamiento incluye llamadas de una sola vuelta, frases con errores tipograficos, multiples formatos de salida (JSON plano, bloques de codigo, XML `<tool_call>` y estilo OpenAI `{"tool_calls": [...]}`), conversaciones multi-turno con resultados simulados de herramientas, y prompts fuera de tema o ambiguos que no deben activar ninguna llamada a funcion.

El modelo no emplea ninguna innovacion arquitectonica adicional; su valor reside en el ajuste fino especifico para *function calling*. El formato de prompt es personalizado y no sigue la plantilla de chat estandar de HuggingFace, usando delimitadores `<|system|>`, `<|tools|>`, `<|user|>` y `<|assistant|>`. Las herramientas soportadas son tres: `get_weather(location, unit)`, `get_news(topic, limit)` y `calculate(expression)`.

## Capacidades

- Generacion de llamadas a herramientas estructuradas en formato JSON, XML o estilo OpenAI, segun el prompt de entrada.
- Seleccion automatica de la herramienta adecuada cuando el usuario solicita informacion meteorologica, noticias o calculos matematicos.
- Respuesta en lenguaje natural cuando no hay ninguna herramienta aplicable o faltan argumentos obligatorios.
- Manejo de conversaciones multi-turno con bloques `<|tool|>` para incorporar resultados de herramientas.
- Capacidades genericas del modelo base Qwen2.5-3B-Instruct: generacion de texto, razonamiento basico, comprension multilingue y soporte de contexto largo (32K tokens).
- No se han documentado capacidades de vision, audio o *thinking mode*; el adaptador esta limitado a texto.

## Casos de uso

- Asistentes virtuales de consulta meteorologica: el modelo puede invocar `get_weather` con la ubicacion y la unidad (celsius/fahrenheit) a partir de una peticion del usuario, devolviendo el JSON estructurado para que el sistema ejecute la llamada a una API externa.
- Agregadores de noticias personalizados: dado un tema y un limite, el modelo genera la llamada a `get_news`, permitiendo que un bot de Telegram o Slack recupere titulares y los resuma.
- Calculadora conversacional integrada: ante expresiones matematicas, el modelo emite `calculate(expression)` y el sistema evalua la expresion, devolviendo el resultado al usuario en una conversacion natural.
- Chatbots de atencion al cliente con herramientas internas: el adaptador puede conectarse a sistemas de consulta de pedidos o incidencias, siempre que se definan las herramientas correspondientes en el bloque `<|tools|>`.
- Prototipos de agentes autonomos ligeros: al soportar multiples formatos de salida, puede integrarse en frameworks de agentes (como LangChain o LlamaIndex) que esperan llamadas estilo OpenAI.
- Entornos de desarrollo y testing de *function calling*: sirve como modelo de referencia para evaluar el comportamiento de adaptadores LoRA en tareas de tool use, dado su bajo coste de inferencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de MMLU, HumanEval, GSM8K ni comparaciones con otros modelos de *function calling*. El unico dato de rendimiento indirecto es el tamaño del modelo (3B parametros), que sugiere una latencia baja en hardware consumer, pero no hay cifras verificables.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base Qwen2.5-3B-Instruct en precision fp16 ocupa aproximadamente 6 GB. Con el adaptador LoRA fusionado, el uso de VRAM es similar. En cuantizacion 8-bit se reduce a unos 3-4 GB, y en 4-bit a unos 2-3 GB.
- GPU recomendadas: cualquier GPU consumer con al menos 6 GB de VRAM (RTX 3060, RTX 4060, etc.). Para mayor velocidad, una RTX 4090 o GPU profesional (A100, L4) permite inferencia con mayor throughput.
- Si cabe en consumer GPU: si, es adecuado para GPUs de gama media y alta de consumo.
- Opciones de despliegue: al ser un adaptador PEFT, se puede cargar con `transformers` + `peft` (como se muestra en el quick start). Para produccion, se recomienda fusionar el adaptador con el modelo base (`merge_and_unload()`) y exportarlo a formato GGUF para `llama.cpp` u Ollama, o servirlo con vLLM o TGI (tras fusion y conversion).
- Latencia y throughput estimados: no hay datos oficiales; con una RTX 4090 y cuantizacion 4-bit, se pueden esperar decenas de tokens por segundo, pero no es verificable.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| navenduk75/qwen2.5-3b-function-calling-lora | 3B (adaptador) | 32K | Apache-2.0 | Adaptador LoRA, 3 herramientas especificas |
| amgustav/forge-qwen2.5-3b-function-calling | 3B (adaptador) | 32K | No especificada | Adaptador para agentes, seleccion de API y encadenamiento de llamadas |
| Qwen2.5-3B-Instruct (base) | 3B | 32K | Apache-2.0 | Modelo base sin ajuste especifico para function calling, aunque soporta tool use nativamente en ciertas condiciones |

La comparativa se limita a modelos del mismo tamaño y proposito. No se dispone de datos de rendimiento comparativo (benchmarks) entre estos adaptadores.

## Limitaciones y advertencias

- Es un adaptador, no un modelo fusionado: requiere cargar el modelo base Qwen2.5-3B-Instruct junto con el adaptador usando `peft`. No se puede usar directamente como un checkpoint independiente.
- Solo soporta tres herramientas predefinidas (`get_weather`, `get_news`, `calculate`); para otras funciones es necesario reentrenar o ampliar el dataset.
- El formato de prompt es personalizado y no compatible con el chat template estandar de HuggingFace; es necesario construir los prompts manualmente siguiendo la estructura documentada.
- Riesgo de alucinacion en la generacion de argumentos JSON, especialmente si el usuario proporciona informacion ambigua o incompleta.
- El entrenamiento se realizo sobre un dataset sintetico, lo que puede limitar la generalizacion a dominios reales o a variaciones linguisticas no contempladas.
- Sesgos del modelo base Qwen2.5-3B-Instruct pueden persistir, aunque no se han documentado evaluaciones especificas.
- Licencia Apache-2.0 permite uso comercial, pero se debe verificar el cumplimiento de la licencia del modelo base (tambien Apache-2.0).
- No hay garantias de soporte ni mantenimiento; el repositorio tiene 0 descargas y 0 likes, lo que sugiere que es un proyecto experimental.

## Enlaces

- Repositorio del adaptador: https://huggingface.co/navenduk75/qwen2.5-3b-function-calling-lora
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-3B-Instruct
- Coleccion oficial Qwen2.5: https://huggingface.co/collections/Qwen/qwen25
- Documentacion de function calling en Qwen2.5 (DeepWiki): https://deepwiki.com/QwenLM/Qwen2.5/2.2-function-calling-and-tool-use
- Repositorio TRL: https://github.com/huggingface/trl
- Repositorio PEFT: https://github.com/huggingface/peft
- Adaptador similar: https://huggingface.co/amgustav/forge-qwen2.5-3b-function-calling
