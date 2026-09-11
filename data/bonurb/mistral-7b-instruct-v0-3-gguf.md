# bonurb/Mistral-7B-Instruct-v0.3-GGUF

## Resumen

`bonurb/Mistral-7B-Instruct-v0.3-GGUF` es una redistribución en formato GGUF del modelo `mistralai/Mistral-7B-Instruct-v0.3`, publicado por el usuario `bonurb`. La cuantización original fue realizada por `bartowski` sobre `llama.cpp` (release b2965), y este repositorio la replica. Se trata de un modelo denso de 7.248.023.552 parámetros (unos 7,25 mil millones) orientado a generación de texto conversacional, derivado del conocido Mistral 7B Instruct v0.3 de Mistral AI, publicado originalmente el 22 de mayo de 2024.

La relevancia de la versión 0.3 frente a la 0.2 reside en tres cambios concretos: el vocabulario se amplía de 32.000 a 32.768 tokens, se incorpora un tokenizador nuevo y se añade soporte nativo de *function calling* mediante tokens dedicados (`TOOL_CALLS`, `AVAILABLE_TOOLS`, `TOOL_RESULTS`). Mantiene la ventana de contexto de 32.768 tokens de la versión anterior.

Al estar empaquetado en GGUF, el modelo está pensado para inferencia local y en CPU/GPU mixta mediante `llama.cpp` y sus derivados (Ollama, LM Studio, entre otros). La licencia Apache 2.0 permite uso comercial sin restricciones adicionales. El repositorio es una re-subida de terceros con 0 descargas y 0 *likes* en el momento de la consulta, por lo que no cuenta con validación de la comunidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Mistral 7B Instruct v0.3); numero de capas, cabezas y tipo de atencion no disponibles |
| Parametros totales | 7.248.023.552 (~7,25 mil millones) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 32.768 tokens |
| Tipos de cuantizacion | GGUF; el repositorio no enumera los niveles concretos incluidos |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp) |
| Tamano del vocabulario | 32.768 tokens (ampliado desde 32.000 en v0.2) |
| Plantilla de prompt | `<s>[INST] {prompt} [/INST]</s>` |
| System prompt | no (la configuracion de LM Studio indica `system_prompt: none`) |
| Modelo base | mistralai/Mistral-7B-Instruct-v0.3 |
| Cuantizado por | bartowski, sobre llama.cpp b2965 |
| Tamano del repositorio | 63,4 GB (compatible con varias variantes de cuantizacion agregadas) |
| Fecha de publicacion del modelo original | 22-05-2024 |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de 7,25 mil millones de parámetros, resultado del ajuste por instrucciones (*instruction tuning*) sobre la familia Mistral 7B. Los detalles internos de la arquitectura (número de capas, cabezas de atención, uso de *sliding window attention*, *grouped query attention* o el esquema de RoPE) no se especifican en la información proporcionada, más allá de que el contexto máximo es de 32.768 tokens.

En cuanto al entrenamiento, la model card no documenta el número de tokens, la composición del dataset ni si hubo fases de RLHF o DPO. Lo que sí se detalla es la evolución respecto a v0.2: vocabulario ampliado a 32.768 entradas, tokenizador nuevo y soporte de *function calling* implementado a través de los tokens especiales `TOOL_CALLS`, `AVAILABLE_TOOLS` y `TOOL_RESULTS`. No se documentan innovaciones adicionales de decodificación ni mecanismos de atención específicos en la información disponible.

## Capacidades

- Generacion de texto conversacional multi-turno en tareas generales de asistencia.
- Seguimiento de instrucciones, heredado del ajuste de Mistral 7B Instruct v0.3.
- *Function calling* / *tool calling* nativo: el vocabulario extendido incluye tokens para declarar herramientas disponibles, emitir llamadas y recibir resultados.
- Razonamiento multi-paso encadenando llamadas a herramientas mediante los tokens de *tool calling*.
- Procesamiento de contextos largos de hasta 32.768 tokens en una sola pasada.
- Capacidades multilingues: no confirmadas en la informacion proporcionada.
- Vision, audio y otras modalidades: no soportadas (el pipeline declarado es exclusivamente `text-generation`).
- Modo de razonamiento explicito (*thinking mode*): no disponible.

## Casos de uso

- Atencion al cliente automatizada: con 32.768 tokens de contexto, el modelo puede mantener conversaciones multi-turno incorporando el historial completo y documentacion de soporte en el mismo *prompt*, sin necesidad de truncar.
- Orquestacion de agentes con herramientas: gracias a los tokens `AVAILABLE_TOOLS`, `TOOL_CALLS` y `TOOL_RESULTS`, se puede integrar en un bucle de agente que consulte APIs externas, bases de datos o sistemas de tickets y devuelva los resultados al modelo para continuar el razonamiento.
- Generacion y refactorizacion de codigo en local: al ejecutarse sobre GGUF con `llama.cpp`, encaja en entornos de desarrollo sin conexion, lo que resulta util cuando el codigo no puede salir de la red corporativa.
- Resumen y analisis de documentos largos: informes, contratos o expedientes de hasta ~32.000 tokens que se procesan en una unica llamada, evitando estrategias de *chunking* con perdida de coherencia global.
- Extraccion de informacion estructurada: conversion de texto libre a JSON u otros formatos estructurados en pipelines de ingestion de datos, aprovechando el soporte de *function calling* para forzar el esquema de salida.
- Despliegue on-premise con datos sensibles: al requerir una unica GPU de gama consumer en cuantizaciones de 4-5 bits, permite procesar datos personales o clinicos sin enviarlos a servicios externos.
- Prototipado rapido en estaciones de trabajo: se puede cargar en LM Studio u Ollama con una plantilla `Mistral Instruct` predefinida, lo que reduce el tiempo de puesta en marcha para evaluar ideas antes de escalar a modelos mayores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

Estimaciones de VRAM para los pesos, calculadas a partir del numero de parametros. El repositorio no publica el desglose de ficheros, por lo que las cifras son orientativas:

| Cuantizacion | Pesos aproximados | VRAM estimada (solo pesos) |
|---|---|---|
| F16 | ~14,5 GB | ~16 GB |
| Q8_0 | ~7,7 GB | ~9-10 GB |
| Q6_K | ~6,0 GB | ~7-8 GB |
| Q5_K_M | ~5,1 GB | ~6-7 GB |
| Q4_K_M | ~4,4 GB | ~5,5-6 GB |
| Q3_K_M | ~3,5 GB | ~4,5 GB |
| Q2_K | ~2,7 GB | ~3,5 GB |

- A esas cifras hay que sumar el *cache* KV, que con 32.768 tokens de contexto puede anadir varios GB adicionales; el dato exacto depende de la configuracion de atencion, que no se detalla.
- GPU recomendadas: para F16, una A100 40 GB, H100 o dos GPU de 24 GB; para Q8_0, una RTX 4090 o A6000 de 24 GB; para Q4_K_M, una RTX 3060 de 12 GB o RTX 4070 es suficiente.
- Cabe en GPU de consumo: si. Con Q4_K_M o Q5_K_M funciona en tarjetas de 8-12 GB (RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070). En 6-8 GB conviene bajar a Q3_K_M o Q2_K, con la consiguiente perdida de calidad.
- Opciones de despliegue: `llama.cpp`, Ollama, LM Studio (el autor indica la plantilla `Mistral Instruct`), `llama-cpp-python` y servidores compatibles con la API de OpenAI. vLLM ofrece soporte GGUF experimental; TGI no soporta GGUF de forma nativa y requeriria convertir a otro formato.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Rendimiento |
|---|---|---|---|---|---|
| Mistral-7B-Instruct-v0.3 (este, GGUF) | 7,25 B | 32.768 | Apache 2.0 | GGUF | no disponible |
| Mistral-7B-Instruct-v0.3 (original) | 7,25 B | 32.768 | Apache 2.0 | safetensors | no disponible |
| Llama-3.1-8B-Instruct | ~8 B | 128.000 | Llama 3.1 Community License | safetensors, GGUF | no disponible |
| Qwen2.5-7B-Instruct | ~7,6 B | 128.000 | Apache 2.0 | safetensors, GGUF | no disponible |

Nota: los datos de los modelos alternativos proceden del conocimiento general sobre dichos modelos, no de la busqueda web realizada, que no devolvio resultados relevantes. No se dispone de cifras de benchmarks comparativas en la informacion proporcionada.

## Limitaciones y advertencias

- Riesgo de alucinacion: es un modelo de 7B sin datos publicados sobre tasas de error; en tareas factuales o de calculo conviene validar las salidas con fuentes externas.
- Sesgos: no se documenta ninguna evaluacion de sesgo, toxicidad o equidad en la informacion disponible.
- Idiomas: la lista de idiomas soportados no esta declarada en el repositorio; no se puede asumir buen rendimiento fuera de los idiomas mayoritarios sin una evaluacion propia.
- Ausencia de *system prompt*: la configuracion publicada indica `system_prompt: none`, por lo que las instrucciones de sistema deben integrarse dentro del bloque `[INST]` o no se respetaran como tales.
- Cuantizacion: al ser una version GGUF, existe perdida de calidad respecto a los pesos originales en FP16/BF16, especialmente en niveles Q2 y Q3. No se publican metricas de degradacion.
- Repositorio de terceros: el modelo ha sido subido por `bonurb` con 0 descargas y 0 *likes*; la cuantizacion original es de `bartowski`. No hay verificacion de integridad ni de reproducibilidad por parte del autor del repositorio. Conviene contrastar con el repositorio de `bartowski` si se necesita trazabilidad.
- Licencia: Apache 2.0 permite uso comercial, modificacion y redistribucion, siempre que se conserve el aviso de licencia y se indiquen los cambios. No impone restricciones de uso adicionales.
- Produccion: sin resultados de benchmarks publicados ni informes de latencia, no es posible dimensionar el rendimiento real sin una prueba propia en el hardware objetivo.
- Fecha de creacion del repositorio: 11-09-2026, segun los metadatos de HuggingFace.

## Enlaces

- Repositorio del modelo: https://huggingface.co/bonurb/Mistral-7B-Instruct-v0.3-GGUF
- Modelo base: https://huggingface.co/mistralai/Mistral-7B-Instruct-v0.3
- Organizacion Mistral AI en HuggingFace: https://huggingface.co/mistralai
- Cuantizaciones de bartowski: https://huggingface.co/bartowski
- Release de llama.cpp utilizada (b2965): https://github.com/ggerganov/llama.cpp/releases/tag/b2965
- Repositorio llama.cpp: https://github.com/ggerganov/llama.cpp
- LM Studio: https://lmstudio.ai
- Dataset empleado para calcular la imatrix: https://gist.github.com/bartowski1182/b6ac44691e994344625687afe3263b3a

Nota: la busqueda web realizada no devolvio ningun resultado relacionado con el modelo; los enlaces anteriores proceden de la informacion del repositorio de HuggingFace.
