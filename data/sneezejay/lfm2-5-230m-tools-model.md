# sneezejay/lfm2.5-230m-tools-model

## Resumen

`sneezejay/lfm2.5-230m-tools-model` es un adaptador LoRA publicado en HuggingFace por el usuario `sneezejay`, entrenado mediante fine-tuning supervisado (SFT) sobre el modelo base `LiquidAI/LFM2.5-230M-Base`. No se trata por tanto de un modelo completo, sino de un conjunto de pesos delta (formato PEFT) que debe combinarse con el modelo base de Liquid AI para poder ejecutarse. El repositorio ocupa 0,2 GB y fue creado el 1 de octubre de 2026, sin descargas ni valoraciones registradas en el momento de redactar esta ficha.

El modelo base, LFM2.5-230M, es el modelo de texto mas pequeno de la familia LFM2.5 de Liquid AI: una red de 230 millones de parametros disenada explicitamente para despliegue en el borde (edge), con orientacion a extraccion de datos y bucles de agentes ligeros con tool calling. Liquid AI publico ese modelo base el 25 de junio de 2026 y lo posiciona como modelo abierto pensado para fine-tuning y ejecucion en dispositivos con presupuesto de memoria y computo muy ajustado. De ahi que tenga sentido un fine-tune especifico orientado a herramientas, como el que nos ocupa: la etiqueta `sft` y el sufijo `-tools-model` del nombre apuntan a un ajuste centrado en el uso de funciones o herramientas.

La relevancia de este adaptador es limitada y hay que enmarcarla con honestidad: la model card es la plantilla vacia por defecto de HuggingFace, sin descripcion, sin hiperparametros, sin datos de entrenamiento y sin evaluacion. No hay licencia declarada, no hay idiomas declarados y no hay resultados de benchmarks. Cualquier uso en produccion exige auditar primero el adaptador por cuenta propia y asumir el coste de validacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre `LiquidAI/LFM2.5-230M-Base`, cuya arquitectura base es LFM2.5 de Liquid AI; no se detallan los componentes internos en la informacion disponible |
| Parametros totales | Adaptador: no disponible. Modelo base: 230 millones |
| Parametros activos | No aplica (no se describe como MoE en la informacion disponible) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible para el adaptador (pesos en safetensors); no se documenta ninguna receta de cuantizacion |
| Idiomas soportados | No disponible (no declarados en el repositorio ni en la model card) |
| Licencia | No disponible |
| Formato de pesos | safetensors (adaptador LoRA PEFT, libreria `peft`) |

## Arquitectura y entrenamiento

El artefacto es un adaptador de bajo rango (LoRA) en formato PEFT, generado con la version 0.21.2 de la libreria PEFT y con TRL como parte del stack de entrenamiento declarado en los tags. El entrenamiento se realizo sobre `LiquidAI/LFM2.5-230M-Base`, que es el checkpoint no ajustado de la familia LFM2.5 de 230 millones de parametros. No se especifica el rango del adaptador, las capas objetivo, la tasa de aprendizaje, el numero de pasos, el tamano de lote ni el numero de epocas. Tampoco se documenta el dataset de instrucciones o de tool calling empleado, ni si hubo una fase posterior de preferencias (DPO, RLHF) despues del SFT.

Sobre la arquitectura del modelo base, Liquid AI lo describe como un modelo de fundacion de pesos abiertos construido sobre la arquitectura LFM2.5 y optimizado para despliegue en el borde, con enfasis en extraccion de datos y tareas agenticas ligeras. El blog de Liquid AI y la documentacion oficial no detallan en los extractos disponibles la composicion exacta de capas ni si emplea atencion hibrida o convoluciones de corto alcance, por lo que esa informacion debe consultarse en la documentacion del modelo base. En cuanto a la innovacion tecnica del adaptador, no se declara ninguna: es un SFT estandar orientado a herramientas.

## Capacidades

- Generacion de texto conversacional, segun el pipeline declarado (`text-generation`) y el tag `conversational`.
- Uso de herramientas y llamadas a funciones: el nombre del repositorio (`tools-model`) y el tag `sft` indican que el ajuste esta orientado a tool calling, aunque no se aporta ninguna evaluacion que lo demuestre.
- Extraccion de datos estructurados: es una de las aplicaciones para las que Liquid AI disena el modelo base de 230M.
- Ejecucion en el borde: el modelo base esta pensado para dispositivos con memoria y computo muy limitados, incluidos telefonos.
- Capacidades multilingues: no declaradas para este adaptador. Liquid AI describe la familia LFM2.5-Encoder como multilingue, pero no hay confirmacion para el modelo base de 230M ni para este fine-tune.
- Modo de razonamiento explicito (thinking mode), vision o audio: no disponibles.
- Razonamiento complejo, matematicas avanzadas, generacion de codigo y escritura creativa: fuera del ambito recomendado por Liquid AI para el modelo base, que lo desaconseja explicitamente para esas cargas de trabajo.

## Casos de uso

- Enrutado de herramientas en un asistente local: el adaptador puede integrarse en un asistente de escritorio o movil que reciba la peticion del usuario en lenguaje natural y decida que funcion invocar, aprovechando el tamano reducido del modelo base para mantener el bucle de agente en el propio dispositivo.
- Extraccion de campos en formularios y documentos: dado el enfoque del modelo base en extraccion de datos, un fine-tune de este tipo puede convertir texto libre en JSON con campos predefinidos en pipelines de digitalizacion de documentos.
- Clasificacion y etiquetado de tickets de soporte: uso del modelo para inferir categoria, prioridad y equipo responsable a partir del texto del ticket, con salida estructurada y coste de inferencia minimo.
- Preprocesamiento en pipelines de RAG: el modelo puede reformular consultas, extraer entidades o decidir si hace falta recuperacion antes de llamar a un modelo mayor, actuando como router de bajo coste.
- Automatizacion de acciones sobre APIs internas: con esquemas de funciones bien definidos, el adaptador puede emitir la llamada correcta (parametros y endpoint) para tareas de ofimatica, calendario o gestion de incidencias, siempre con validacion posterior del esquema.
- Prototipado rapido y experimentacion academica: al ser un adaptador LoRA sobre un modelo de 230M, es viable iterar sobre el en una GPU de consumo o incluso en CPU, lo que lo hace util para estudiar tecnicas de SFT para tool calling.
- Filtrado y moderacion previa en el dispositivo: clasificacion de texto sensible a latencia muy baja antes de enviar la peticion a un modelo mayor en la nube, reduciendo coste y exposicion de datos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del adaptador no incluye seccion de evaluacion (la plantilla aparece con `[More Information Needed]` en todos los apartados), y el repositorio no aporta ningun dato de MMLU, HumanEval, GSM8K, BFCL ni de ninguna otra suite de evaluacion de tool calling. Tampoco se han encontrado resultados publicados especificos de este adaptador en la busqueda web.

## Requisitos de hardware

- El adaptador por si solo no es ejecutable: requiere descargar `LiquidAI/LFM2.5-230M-Base` y aplicar los pesos LoRA (o fusionarlos) antes de la inferencia.
- VRAM estimada para el modelo base, calculada a partir de los 230 millones de parametros (estimacion orientativa, no dato oficial):

| Precision | Peso aproximado de los pesos | VRAM minima orientativa |
|---|---|---|
| FP16 / BF16 | ~460 MB | ~1 GB |
| INT8 | ~230 MB | ~0,5 GB |
| 4 bits (GGUF Q4) | ~130-150 MB | ~0,5 GB |

- El adaptador LoRA anade un coste adicional muy inferior al del modelo base; el repositorio completo ocupa 0,2 GB, lo que sugiere que el delta de pesos es relativamente grande para un LoRA de este tamano, pero no se documenta su rango.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente en la practica; el modelo esta pensado para CPU y NPU de dispositivos moviles mas que para GPUs de datacenter. No tiene sentido desplegarlo en A100 o H100 salvo como parte de un pipeline de evaluacion masivo.
- Si cabe en GPU de consumo: si, con margen amplio. Funciona en RTX 3060, RTX 4060, RTX 4090 y en cualquier iGPU moderna con memoria compartida suficiente.
- Opciones de despliegue: llama.cpp u Ollama tras convertir el modelo fusionado a GGUF; vLLM o TGI si se fusiona el adaptador y se sirve en FP16. La libreria declarada en el repositorio es `peft`, por lo que el flujo natural es cargar el base con `transformers` y aplicar el adaptador con PEFT.
- Latencia y throughput: Liquid AI reporta 213 tokens por segundo en CPU de telefono para el modelo base. No hay ninguna cifra especifica publicada para este adaptador.

## Comparativa con modelos similares

| Modelo | Parametros | Tipo | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| `sneezejay/lfm2.5-230m-tools-model` | Adaptador sobre 230M | LoRA + SFT | No disponible | No disponible | Model card vacia, 0 descargas, sin evaluacion |
| `LiquidAI/LFM2.5-230M-Base` | 230M | Modelo base | No disponible | No disponible en la informacion recogida | Punto de partida del adaptador; orientado a borde y extraccion de datos |
| `LiquidAI/LFM2.5-Encoder-230M` | 230M | Encoder bidireccional (masked LM) | No disponible | No disponible en la informacion recogida | Alternativa multilingue de la misma familia para tareas de comprension, no de generacion |

No se dispone de datos comparativos de rendimiento entre estos modelos en la informacion proporcionada. Para comparar con alternativas de otros fabricantes en el rango de 200-500 millones de parametros seria necesario consultar sus respectivas fichas tecnicas.

## Limitaciones y advertencias

- Model card practicamente vacia: todos los apartados estan sin rellenar. No hay descripcion, ni uso previsto, ni limitaciones declaradas por el autor.
- Sin datos de entrenamiento: se desconoce por completo el dataset, su procedencia, su licencia y si contenia contenido sesgado o problematico. No es posible evaluar sesgos sistematicos.
- Riesgo de alucinacion: inherente a cualquier modelo de lenguaje de este tamano, y especialmente relevante en tool calling, donde una llamada a funcion mal formada o con parametros inventados puede provocar acciones erroneas sobre sistemas reales. Es obligatorio validar el esquema de salida antes de ejecutar cualquier herramienta.
- Volumen de parametros muy bajo: 230 millones de parametros limitan severamente la capacidad de razonamiento, el seguimiento de instrucciones complejas y la coherencia en conversaciones largas. Liquid AI desaconseja explicitamente el modelo base para matematicas avanzadas, generacion de codigo y escritura creativa.
- Longitud de contexto desconocida: sin este dato no se puede planificar el uso en conversaciones multi-turno ni en documentos largos.
- Idiomas no declarados: un fine-tune sobre un dataset desconocido puede degradar el rendimiento multilingue respecto al modelo base.
- Licencia no disponible: sin licencia explicita no hay autorizacion clara para uso comercial. Debe tratarse como no apto para produccion comercial hasta aclararlo, y conviene revisar tambien la licencia del modelo base de Liquid AI.
- Validacion inexistente por la comunidad: cero descargas y cero likes en el momento de la consulta. No hay terceros que hayan reproducido resultados.
- Dependencia del modelo base: cualquier cambio, retirada o actualizacion de `LiquidAI/LFM2.5-230M-Base` afecta directamente a la reproducibilidad del adaptador.
- El tag `arxiv:1910.09700` del repositorio corresponde a la plantilla de calculo de impacto de carbono (Lacoste et al., 2019), no a un articulo sobre el modelo. No debe interpretarse como referencia tecnica.

## Enlaces

- Repositorio del adaptador en HuggingFace: https://huggingface.co/sneezejay/lfm2.5-230m-tools-model
- Modelo base en HuggingFace: https://huggingface.co/LiquidAI/LFM2.5-230M-Base
- Pagina del modelo base LFM2.5-230M: https://huggingface.co/LiquidAI/LFM2.5-230M
- Blog de Liquid AI sobre LFM2.5-230M: https://www.liquid.ai/blog/lfm2-5-230m
- Documentacion de Liquid AI para LFM2.5-230M: https://docs.liquid.ai/lfm/models/lfm25-230m
- Modelo hermano LFM2.5-Encoder-230M: https://huggingface.co/LiquidAI/LFM2.5-Encoder-230M
- Analisis de terceros sobre LFM2.5-230M: https://www.explainx.ai/blog/liquid-ai-lfm2-5-230m-edge-agent-model-2026
- Calculadora de impacto de carbono (Lacoste et al., 2019): https://mlco2.github.io/impact#compute
- Articulo de Lacoste et al.: https://arxiv.org/abs/1910.09700
