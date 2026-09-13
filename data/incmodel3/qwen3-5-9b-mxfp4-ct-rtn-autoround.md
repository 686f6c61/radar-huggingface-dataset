# INCModel3/Qwen3.5-9B-MXFP4-CT-RTN-AutoRound

## Resumen

INCModel3/Qwen3.5-9B-MXFP4-CT-RTN-AutoRound es una version cuantizada del modelo Qwen/Qwen3.5-9B, publicada por el usuario INCModel3 el 13 de septiembre de 2026. La cuantizacion se ha generado con AutoRound, la herramienta de Intel para cuantizacion consciente del error de redondeo, aplicando un esquema MXFP4 (coma flotante de 4 bits con escalas compartidas por bloque) y serializando el resultado en formato compressed-tensors, el formato que consumen pilas de inferencia como vLLM. El repositorio declara 9.653.104.368 parametros, identicos a los del modelo base, y ocupa 12,2 GB.

El interes practico de la ficha es doble. Por un lado, permite ejecutar un modelo de casi 9,7 mil millones de parametros con un peso teorico de unos 5,1 GB, lo que lo situa en el rango de GPUs de consumo y de servidores de una sola tarjeta. Por otro, sirve como ejemplo del flujo de trabajo que el autor etiqueta como autoquant-agent: cuantizar, evaluar y aplicar autocorreccion de forma automatizada, dejando la tabla de evaluacion publicada en la propia model card.

Se trata de una publicacion con traccion nula (0 descargas y 0 likes en el momento de la consulta), sin licencia declarada en los metadatos de HuggingFace y sin model card mas alla de los detalles de cuantizacion y cuatro resultados de benchmark. La model card remite explicitamente a la licencia del modelo original, que no se especifica en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible en la model card; el tag `qwen3_5` y el modelo base Qwen/Qwen3.5-9B apuntan a un transformer denso de la familia Qwen3.5 (sin sufijo de expertos en el nombre, a diferencia de los MoE de la familia) |
| Parametros totales | 9.653.104.368 (dato de safetensors) |
| Parametros activos | no aplica (no hay indicios de arquitectura MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | MXFP4 (pesos en FP4 con escalas por bloque, serializados con compressed-tensors). Los tags del repositorio incluyen ademas `8-bit`, en contradiccion con el esquema MXFP4 declarado |
| Idiomas soportados | no disponible |
| Licencia | no disponible en HuggingFace; la model card indica "Please follow the license of the original model", es decir, la de Qwen/Qwen3.5-9B, no especificada |
| Formato de pesos | safetensors con compressed-tensors |

## Arquitectura y entrenamiento

La model card no describe la arquitectura del modelo base ni el proceso de entrenamiento. Los unicos datos tecnicos aportados se refieren a la cuantizacion: esquema MXFP4, metodo AutoRound, formato de salida compressed-tensors y flujo de trabajo autoquant-agent (cuantizar, evaluar y autorreparar). El sufijo RTN del nombre del repositorio hace referencia al redondeo al vecino mas cercano (round-to-nearest), una de las estrategias de cuantizacion disponibles en AutoRound. No hay informacion sobre numero de tokens de entrenamiento, composicion del dataset, uso de RLHF o DPO, ni sobre innovaciones arquitectonicas (atencion lineal, decodificacion especulativa, atencion hibrida) en el modelo base.

En consecuencia, no es posible verificar si la cuantizacion afecta a todas las capas, si se han mantenido embeddings y normas en precision alta, ni que granularidad de grupo se ha empleado. El unico indicio indirecto es el tamano del repositorio: 12,2 GB para 9,65 mil millones de parametros es muy superior a los aproximadamente 5,1 GB que ocuparian los pesos en MXFP4 puro, lo que sugiere la presencia de ficheros adicionales (escalas, pesos sin cuantizar, checkpoints intermedios de AutoRound o copias en otra precision). Conviene revisar el listado de ficheros antes de descargar.

## Capacidades

- Generacion de texto y uso conversacional: los tags del repositorio incluyen `text-generation` y `conversational`.
- Razonamiento matematico: la model card reporta 0,9181 en GSM8K, el resultado mas solido de la tabla de evaluacion.
- Conocimiento general y razonamiento: 0,7609 en MMLU.
- Razonamiento fisico y de sentido comun: 0,7856 en PIQA y 0,5652 en HellaSwag.
- Capacidades multilingues: no disponible, no se documentan idiomas.
- Tool calling / function calling: no disponible, no documentado.
- Soporte de agentes y razonamiento multi-paso: no disponible, no documentado.
- Capacidades multimodales (vision, audio): no disponible, el pipeline declarado es exclusivamente text-generation.
- Modo de razonamiento explicito (thinking mode): no disponible, no documentado.

## Casos de uso

- Despliegue local en GPU de consumo: con unos 5,1 GB de pesos teoricos en MXFP4, el modelo cabe en tarjetas de 12 GB (RTX 3060, RTX 4070) dejando margen para cache KV, lo que permite prototipar asistentes en estacion de trabajo sin depender de la nube.
- Inferencia en servidor de una sola tarjeta para cargas moderadas: una A100 40 GB o una L40S permiten servir el modelo con contexto amplio y varios usuarios concurrentes si la pila de inferencia soporta compressed-tensors MXFP4.
- Tutoria y resolucion de problemas matematicos: el 0,9181 en GSM8K lo hace adecuado para asistentes de resolucion de ejercicios de nivel escolar y primeros cursos, con verificacion humana del resultado final.
- Asistente conversacional multi-turno: para dialogos encadenados es imprescindible verificar primero la ventana de contexto efectiva del modelo base, dato que no se publica en esta ficha; con la ventana confirmada, el modelo puede gestionar conversaciones con historial largo.
- Generacion aumentada por recuperacion (RAG) sobre documentacion tecnica: combinado con un indice vectorial externo, el modelo puede responder preguntas sobre manuales y normativa, reduciendo la dependencia del conocimiento parametrico.
- Filtrado y clasificacion de texto a partir de etiquetas: al ser un modelo base ajustable mediante prompting, puede usarse para triaje de tickets, clasificacion de intenciones o moderacion previa, con umbrales calibrados sobre un conjunto de validacion propio.
- Investigacion en cuantizacion: el repositorio es un artefacto util para comparar AutoRound frente a RTN, GPTQ o AWQ sobre el mismo modelo base, midiendo la degradacion en GSM8K, MMLU, PIQA y HellaSwag.
- Fine-tuning de dominio y recuantizacion: partir del modelo original, ajustar con LoRA sobre un corpus propio y volver a cuantizar con AutoRound es un flujo mas robusto que intentar reentrenar directamente sobre pesos MXFP4 con compressed-tensors, cuya compatibilidad con QLoRA no esta documentada.

## Benchmarks y rendimiento

Datos publicados en la model card del autor:

| Benchmark | Puntuacion | Referencia del modelo base | Notas |
|---|---|---|---|
| GSM8K | 0,9181 | no disponible | Resultado mas alto de la tabla; consistente con un modelo de ~9,6B en tareas de aritmetica de varios pasos |
| MMLU | 0,7609 | no disponible | Valor razonable para la categoria |
| PIQA | 0,7856 | no disponible | Ligeramente por debajo de lo habitual en modelos de este tamano |
| HellaSwag | 0,5652 | no disponible | Valor notablemente bajo para un modelo de ~9,6B; podria indicar degradacion por cuantizacion o una configuracion de evaluacion atipica (por ejemplo, evaluacion sin log-likelihood normalizada) |

No se han publicado en esta ficha resultados de HumanEval, MATH, BBH ni de benchmarks multilingues, ni se ha facilitado la puntuacion del modelo base sin cuantizar, por lo que no es posible cuantificar la perdida introducida por la cuantizacion MXFP4 con los datos disponibles. Tampoco se documenta la metodologia de evaluacion (few-shot, harness, version de las tareas).

## Requisitos de hardware

- VRAM estimada para inferencia: alrededor de 5,1 GB solo para pesos en MXFP4 (9.653.104.368 parametros a ~4,25 bits). Con activaciones, overhead de la pila y cache KV, conviene reservar entre 7 y 12 GB segun longitud de contexto y numero de secuencias concurrentes.
- Comparativa de precision: los mismos pesos en BF16 ocuparian unos 19,3 GB, de modo que la cuantizacion reduce el requisito a aproximadamente un tercio.
- GPU de consumo: cabe en tarjetas de 12 GB o mas (RTX 3060 12 GB, RTX 4070/4070 Ti, RTX 4080, RTX 4090 24 GB). En 8 GB el margen es muy estrecho y depende del contexto.
- GPU de datacenter: A100 40/80 GB, H100 80 GB, L40S y B200. Las arquitecturas Blackwell cuentan con soporte nativo de MXFP4 en los tensor cores; en Ampere y Ada el formato suele resolverse mediante kernels de dequantizacion, con la penalizacion de rendimiento correspondiente.
- Opciones de despliegue: vLLM y SGLang con soporte de compressed-tensors son las rutas naturales para estos pesos. llama.cpp ha incorporado un tipo GGUF MXFP4, pero los ficheros compressed-tensors de este repositorio requeririan conversion previa; Ollama necesita tambien GGUF. El soporte en TGI no esta confirmado en la informacion disponible.
- Latencia y throughput: no disponible. No se han publicado mediciones de tokens por segundo ni de tiempo hasta el primer token.

## Comparativa con modelos similares

No se han proporcionado especificaciones ni resultados de modelos alternativos en la informacion disponible, por lo que la comparativa se limita a la relacion con el modelo base.

| Modelo | Relacion | Parametros | Cuantizacion | Licencia | Benchmarks en esta ficha |
|---|---|---|---|---|---|
| INCModel3/Qwen3.5-9B-MXFP4-CT-RTN-AutoRound | Objeto de la ficha | 9.653.104.368 | MXFP4 (AutoRound, compressed-tensors) | no disponible | GSM8K 0,9181; MMLU 0,7609; PIQA 0,7856; HellaSwag 0,5652 |
| Qwen/Qwen3.5-9B | Modelo base sin cuantizar | no disponible | sin cuantizar (presumiblemente BF16) | no disponible | no disponible |
| Otras cuantizaciones de Qwen3.5-9B (GPTQ, AWQ, GGUF) | Alternativas de la misma categoria | ~9,65B | 4-8 bits segun esquema | no disponible | no disponible |
| Modelos densos de 8-9B de otras familias (Qwen3-8B, Llama 3.x 8B, Gemma 2 9B) | Alternativas por tamano | no disponible en la informacion proporcionada | no disponible | no disponible | no disponible |

No es posible establecer una comparacion cuantitativa de rendimiento con alternativas porque no se han facilitado sus puntuaciones.

## Limitaciones y advertencias

- Riesgo de degradacion por cuantizacion: no se publica la puntuacion del modelo base sin cuantizar, por lo que no se puede medir la perdida real. El 0,5652 en HellaSwag es sospechosamente bajo para un modelo de este tamano y merece verificacion independiente antes de usar el modelo en produccion.
- Contradiccion en los metadatos: el repositorio esta etiquetado como `8-bit` mientras que el esquema declarado es MXFP4 (4 bits). Conviene inspeccionar la configuracion de cuantizacion real de los ficheros safetensors.
- Tamano del repositorio inconsistente: 12,2 GB para unos pesos que deberian ocupar aproximadamente 5,1 GB, lo que apunta a ficheros adicionales no documentados.
- Licencia no declarada: la model card delega en la licencia del modelo original, que no se especifica. No se debe asumir uso comercial libre sin comprobar la licencia de Qwen/Qwen3.5-9B en su repositorio oficial.
- Idiomas: no se documenta ningun idioma soportado. No se puede asumir un rendimiento acceptuable en castellano sin evaluacion propia.
- Longitud de contexto desconocida: cualquier caso de uso que dependa de contexto largo (RAG extenso, dialogos multi-turno, analisis de documentos) requiere medir primero la ventana efectiva.
- Capacidades no documentadas: no hay evidencia publicada de soporte de tool calling, agentes, vision, audio ni modo de razonamiento explicito. No deben asumirse en diseno de producto.
- Versionado incierto: el identificador Qwen3.5-9B y la fecha de publicacion (septiembre de 2026) corresponden a una generacion posterior a Qwen3; conviene confirmar la disponibilidad y el estado del modelo base antes de fijar dependencias.
- Reproducibilidad de la evaluacion: no se detalla el arnes ni la configuracion de few-shot empleados, por lo que los valores de la tabla no son directamente comparables con otras publicaciones.
- Sesgos: no hay informacion sobre sesgos evaluados ni sobre la composicion de los datos de entrenamiento del modelo base.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/INCModel3/Qwen3.5-9B-MXFP4-CT-RTN-AutoRound
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- AutoRound (Intel), herramienta de cuantizacion citada: https://github.com/intel/auto-round
- autoquant-agent: la model card enlaza a https://github.com/ sin ruta especifica, por lo que el enlace no es utilizable
- Resultados de la busqueda web: las busquedas realizadas no devolvieron ningun resultado relevante sobre el modelo, el autor ni la herramienta autoquant-agent; unicamente aparecieron sitios de practica de mecanografia sin relacion con el contenido. No se han encontrado papers, blogs ni demos adicionales.
