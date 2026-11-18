# McGill-NLP/EchoMoE

## Resumen

EchoMoE es una familia de modelos de mezcla de expertos (MoE) desarrollada por McGill-NLP que aplica una tecnica de compresion de comunicacion para el entrenamiento e inferencia distribuida con paralelismo de expertos (expert parallelism). En lugar de transmitir cada estado oculto completo entre nodos, EchoMoE envia una diferencia comprimida respecto a un estado de referencia que se refresca cada pocas capas. Esta tecnica reduce el trafico de red entre nodos, que es el cuello de botella principal cuando se sirven modelos MoE de gran tamano repartidos entre multiples maquinas.

El modelo principal de la familia se construye sobre Qwen3-30B-A3B, un MoE de 30 mil millones de parametros totales con aproximadamente 3 mil millones activos por token. El modelo profesor (teacher) es Qwen3-30B-A3B-Base afinado con datos de instrucciones Dolci, y los 19 estudiantes EchoMoE se entrenan con distintas configuraciones de stride de referencia y anchuras de codigo de despacho y combinacion. En la configuracion destacada (s4-r512-c768) se consigue un ahorro del 58 por ciento en bytes entre nodos y una mejora del 22,6 por ciento en throughput con expert parallel 32 sobre 4 nodos, a costa de 3,8 puntos de rendimiento medio sobre 18 benchmarks.

La relevancia de EchoMoE es fundamentalmente de infraestructura: demuestra que es posible reducir de forma sustancial la comunicacion en despliegues distribuidos de MoE manteniendo un rendimiento competitivo. La familia incluye tambien variantes sobre Kanana-2-30B-A3B, Gemma-4-26B-A4B, Moonlight-16B-A3B y Nemotron-3.5-Lightning-30B-A3B, lo que permite evaluar la tecnica sobre distintas arquitecturas MoE.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (mezcla de expertos) con comunicacion comprimida entre nodos |
| Parametros totales | 30B (base Qwen3-30B-A3B) |
| Parametros activos | Aproximadamente 3B (denominacion A3B) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible (compatible con vLLM via plugin de EchoMoE y con Hugging Face Transformers) |

## Arquitectura y entrenamiento

EchoMoE parte de un modelo MoE preentrenado (Qwen3-30B-A3B-Base) y lo somete a un proceso de retrofit para que comunique menos bajo paralelismo de expertos. La innovacion central es sustituir el envio del estado oculto completo por una representacion comprimida: una diferencia respecto a un estado de referencia que se refresca cada N capas (stride de referencia, parametro s). El estado se codifica con una anchura de codigo de despacho (dispatch code, parametro r) y se reconstruye con una anchura de combinacion (combine code, parametro c). Cuando no se usa referencia se habla de compresion "plain".

El entrenamiento se realiza por destilacion desde un modelo profesor: Qwen3-30B-A3B-Base afinado sobre datos de instrucciones Dolci. Los estudiantes se entrenan del mismo modo que el profesor pero con distintas configuraciones de stride y anchuras de codigo. Se generaron 19 variantes para Qwen3-30B-A3B, con ahorros de bytes entre nodos que van del 32 al 75 por ciento y puntuaciones medias sobre 18 benchmarks que van de 65,5 a 50,7 (el profesor obtiene 66,9). La tecnica se valida ademas sobre otras cuatro arquitecturas MoE (Kanana-2, Gemma-4, Moonlight y Nemotron-3.5-Lightning) con ahorros en torno al 48-50 por ciento. No se especifica en la informacion disponible el numero de tokens de entrenamiento, la composicion detallada del dataset ni si se empleo RLHF o DPO.

## Capacidades

- Generacion de texto y razonamiento general, heredadas del modelo base Qwen3-30B-A3B y del ajuste con datos de instrucciones Dolci.
- Capacidades de instruccion conversacional, al estar los estudiantes destilados desde un profesor afinado con datos de instrucciones.
- Inferencia distribuida eficiente con paralelismo de expertos, con reduccion del trafico entre nodos de hasta el 58 por ciento en la configuracion destacada.
- Compatibilidad con vLLM mediante el plugin del paquete EchoMoE, y con Hugging Face Transformers.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Soporte de tool calling, agentes, vision o audio: no disponible en la informacion proporcionada.

## Casos de uso

- Servicio de modelos MoE de gran tamano en cluster multi-nodo: EchoMoE reduce los bytes intercambiados entre nodos con expert parallel 32 sobre 4 nodos, lo que permite servir Qwen3-30B-A3B con menor presion sobre la red de interconexion y mayor throughput (22,6 por ciento de mejora en la configuracion destacada).
- Despliegue en infraestructura con interconexion limitada: en entornos donde el ancho de banda entre nodos es el cuello de botella, las variantes con mayor ahorro (hasta el 75 por ciento) permiten mantener el modelo distribuido con menor coste de comunicacion, aceptando una perdida de calidad controlada.
- Investigacion en sistemas distribuidos de IA: la familia de 19 variantes con distintos strides y anchuras de codigo permite estudiar el compromiso entre ahorro de comunicacion y calidad, y servir de base para experimentos de paralelismo de expertos.
- Generacion de texto asistida por instrucciones en produccion: el modelo conserva el comportamiento de instruccion del profesor (Qwen3-30B-A3B afinado con Dolci), por lo que puede emplearse en tareas de generacion y respuesta conversacional.
- Evaluacion comparativa de tecnicas de compresion de comunicacion: las variantes sobre Kanana-2, Gemma-4, Moonlight y Nemotron-3.5-Lightning permiten replicar la tecnica sobre distintas arquitecturas MoE y comparar resultados.
- Prototipado de pipelines con vLLM: la integracion mediante plugin facilita incorporar EchoMoE en stacks de inferencia existentes basados en vLLM sin reescribir el servicio.

## Benchmarks y rendimiento

Los resultados publicados son puntuaciones medias sobre 18 benchmarks (sin desglose por benchmark en la informacion disponible). El profesor Qwen3-30B-A3B-SFT-EchoMoE-teacher obtiene 66,9.

| Modelo | Referencia | Dispatch | Combine | Bytes entre nodos ahorrados | Puntuacion media |
|---|---|---|---|---|---|
| Profesor (Qwen3-30B-A3B-SFT) | no aplica | no aplica | no aplica | 0% | 66,9 |
| EchoMoE-Qwen3-30B-A3B-s4-r1280-c1280 | cada 4 capas | 1280 | 1280 | 32% | 65,5 |
| EchoMoE-Qwen3-30B-A3B-s4-r512-c1280 | cada 4 capas | 512 | 1280 | 46% | 64,9 |
| EchoMoE-Qwen3-30B-A3B-s4-r512-c1024 | cada 4 capas | 512 | 1024 | 52% | 63,8 |
| EchoMoE-Qwen3-30B-A3B-s4-r512-c768 | cada 4 capas | 512 | 768 | 58% | 63,1 |
| EchoMoE-Qwen3-30B-A3B-s6-r512-c768 | cada 6 capas | 512 | 768 | 62% | 61,5 |
| EchoMoE-Qwen3-30B-A3B-plain-r512-c512 | ninguna | 512 | 512 | 75% | 51,4 |

Otras arquitecturas base:

| Modelo base | Bytes ahorrados | Puntuacion profesor | Puntuacion estudiante |
|---|---|---|---|
| Kanana-2-30B-A3B | 50% | 58,5 | 56,1 |
| Gemma-4-26B-A4B | 50% | 61,2 | 56,8 |
| Moonlight-16B-A3B | 50% | 53,0 | 47,1 |
| Nemotron-3.5-Lightning-30B-A3B | 48% | 62,8 | 58,3 |

No se han publicado resultados desglosados por benchmark (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la informacion proporcionada. Como referencia, un MoE de 30B parametros totales con aproximadamente 3B activos requiere almacenar todos los pesos en memoria distribuida; el requisito exacto depende de la cuantizacion, que no se documenta.
- GPU recomendadas: el escenario evaluado es multi-nodo (expert parallel 32 sobre 4 nodos), lo que implica GPUs de centro de datos con interconexion de alta velocidad (tipo A100, H100 o similar). No se especifican modelos concretos.
- Cabe en GPU de consumo: no disponible. El modelo esta disenado para despliegue distribuido; no se documenta una variante para GPU de consumo.
- Opciones de despliegue: vLLM mediante el plugin del paquete EchoMoE, y Hugging Face Transformers.
- Latencia y throughput: se reporta una mejora de throughput del 22,6 por ciento con expert parallel 32 sobre 4 nodos en la configuracion destacada. No se publican valores absolutos de latencia ni de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros totales / activos | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| EchoMoE (Qwen3-30B-A3B) | 30B / ~3B | no disponible | Apache 2.0 | MoE con comunicacion comprimida para expert parallelism |
| Qwen3-30B-A3B (profesor sin compresion) | 30B / ~3B | no disponible | Apache 2.0 (segun modelo base) | MoE estandar |
| EchoMoE-Moonlight-16B-A3B | 16B / ~3B | no disponible | Apache 2.0 | Variante EchoMoE sobre Moonlight |
| EchoMoE-Gemma-4-26B-A4B | 26B / ~4B | no disponible | Apache 2.0 | Variante EchoMoE sobre Gemma-4 |

La comparacion principal es contra el propio profesor sin compresion: EchoMoE sacrifica 3,8 puntos de media (63,1 frente a 66,9) a cambio de un 58 por ciento menos de bytes entre nodos y un 22,6 por ciento mas de throughput. No se dispone de datos de benchmarks desglosados que permitan comparar con alternativas fuera de la familia.

## Limitaciones y advertencias

- Perdida de calidad respecto al profesor: la configuracion destacada obtiene 63,1 frente a 66,9 del modelo sin comprimir, una diferencia de 3,8 puntos sobre 18 benchmarks. Las variantes con mayor ahorro caen hasta 51,4.
- El beneficio depende del regimen de despliegue: la mejora de throughput se mide con expert parallel 32 sobre 4 nodos; en configuraciones de un solo nodo o sin paralelismo de expertos la ventaja puede no materializarse.
- Requiere infraestructura especifica: el uso previsto es multi-nodo con vLLM y el plugin de EchoMoE o Transformers; no se documenta soporte para llama.cpp, Ollama u otras herramientas.
- Idiomas soportados no documentados: no se especifica cobertura multilingue en la informacion disponible.
- Riesgo de alucinacion y sesgos: no documentados en la informacion proporcionada; al derivar de Qwen3-30B-A3B y de datos de instrucciones Dolci, hereda las caracteristicas del modelo base, que no se detallan.
- Licencia Apache 2.0: permite uso comercial, pero conviene verificar las condiciones del modelo base subyacente en cada variante.
- Modelo de investigacion: con 0 descargas y 0 likes en el momento de la consulta, y sin paper publicado (el enlace de arXiv figura como pendiente en la model card), la madurez para produccion es limitada.
- No se documentan cuantizaciones disponibles ni requisitos de VRAM, lo que dificulta la planificacion de despliegues.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/McGill-NLP/EchoMoE
- Codigo: https://github.com/McGill-NLP/EchoMoE
- Pagina del proyecto: https://mcgill-nlp.github.io/EchoMoE/
- Coleccion EchoMoE: https://huggingface.co/collections/McGill-NLP/echomoe-6afcbfa10b38185f87cbd0ac
- Profesor: https://huggingface.co/McGill-NLP/Qwen3-30B-A3B-SFT-EchoMoE-teacher
- Variante destacada: https://huggingface.co/McGill-NLP/EchoMoE-Qwen3-30B-A3B-s4-r512-c768
