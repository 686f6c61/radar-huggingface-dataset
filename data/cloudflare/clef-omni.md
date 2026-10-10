# Cloudflare/clef-omni

## Resumen

Clef-Omni es un modelo multimodal de tipo mixture-of-experts (MoE) publicado por Cloudflare y obtenido mediante post-entrenamiento a partir de Qwen/Qwen3-Omni-30B-A3B-Instruct. Su rasgo diferencial es que no genera texto libre: recibe un "estado" (texto, JSON, imagenes, audio o video) junto con un esquema de preguntas tipadas y devuelve, en una sola pasada forward, una probabilidad para cada opcion permitida de cada pregunta. De este modo elimina por completo la generacion libre y el parseo de la salida, que es justo el punto fragil de los pipelines de decision automatizada basados en LLM.

El backbone es el thinker de Qwen3-Omni-30B-A3B con sus codificadores de vision y audio, sobre el que se anade una "joint schema head": una cabeza transformer que lee los estados ocultos finales del backbone, enruta la evidencia del estado hacia cada pregunta y puntua conjuntamente todas las opciones de todas las preguntas. El repositorio almacena 35.259.818.545 parametros en safetensors, cifra que incluye los pesos de salida de voz (talker y code2wav) del modelo base, presentes pero no utilizados. La activacion por token corresponde a la denominacion A3B del backbone, es decir, 3.000 millones de parametros activos.

Es relevante ahora porque cubre un nicho muy concreto -clasificacion y decision estructurada sobre entradas multimodales- con salida tipada lista para consumir, con una API compatible con Jev y SystemOne y con licencia Apache-2.0, lo que permite uso comercial sin restricciones adicionales. Su coste de inferencia se aproxima al de un MoE de 3B activos en lugar del de un modelo denso de 30B.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal MoE (backbone Qwen3-Omni-30B-A3B thinker con codificadores de vision y audio) mas joint schema head de tipo transformer |
| Parametros totales | 35.259.818.545 (~35,26 mil millones) segun safetensors del repositorio |
| Parametros activos | 3.000 millones (denominacion A3B del backbone) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors fragmentados (model-*.safetensors + model.safetensors.index.json), joint_head.safetensors y codigo de modelado en joint_schema_model.py |

Otros datos del repositorio: pipeline declarado `image-text-to-text`, libreria `transformers`, tamano de repo 70,8 GB, 2 descargas y 15 likes, creado y actualizado el 2026-10-09.

## Arquitectura y entrenamiento

Clef-Omni conserva el thinker de Qwen3-Omni-30B-A3B-Instruct con sus torres de vision y audio. A la salida del backbone se acopla una joint schema head, un transformer de tamano reducido que codifica las preguntas y sus opciones permitidas y las cruza con los estados ocultos del backbone, de forma que la puntuacion de cada opcion depende del resto de preguntas del esquema (scoring conjunto, no independiente). La salida son logits, uno por opcion permitida y pregunta; aplicando un softmax por pregunta se obtienen probabilidades. Los pesos de salida de voz del modelo base se incluyen sin modificar, pero `load_release_model` no los carga.

No se detalla en la informacion disponible el volumen de tokens de post-entrenamiento, la composicion del dataset, ni si se emplearon tecnicas concretas de RLHF, DPO u otras. Si se explicita que se trata de un post-train sobre el modelo base instruct y que la relacion con el mismo es de `finetune`. El soporte de SGLang aparece anunciado como "coming soon", por lo que la ruta de ejecucion probada es la de Transformers con codigo propio.

## Capacidades

- Salida estructurada tipada: devuelve un logit por opcion permitida de cada pregunta, con softmax por pregunta para obtener probabilidades; no hay generacion de texto libre ni parseo posterior.
- Tipos de pregunta soportados: `choice` (con `choice`, `confidence` y `probabilities`), `score` (con `score` esperado, `confidence`, `legend` y `probabilities`) y `noul` (probabilidad de verdadero).
- Entrada multimodal: texto, JSON, imagenes, audio y video. Texto y multimodal se pueden mezclar en el mismo lote.
- Vision: procesa imagenes como ruta de fichero, URL, data URL en base64, bytes crudos u objetos PIL.
- Audio: acepta rutas, URL, base64, bytes crudos o arrays de muestras mono a 16 kHz.
- Video: acepta rutas, URL, base64, bytes o arrays de fotogramas RGB; muestrea a 2 fotogramas por segundo y, si todos los videos del registro tienen banda sonora, procesa tambien el audio.
- Razonamiento multi-pregunta conjunto: la joint schema head puntua todas las opciones de todas las preguntas de forma simultanea, lo que permite decisiones condicionadas entre preguntas.
- Compatibilidad de API con Jev y SystemOne: funcion `systemone` que acepta y devuelve el mismo cuerpo de peticion/respuesta de `POST /v1/systemone`, incluyendo `model`, `answers` y `usage`.
- Clasificacion con criterios definidos por el usuario en lenguaje natural mediante el campo `criteria`.
- No dispone de tool calling, function calling ni modo thinking declarados en la informacion disponible.

## Casos de uso

- Triage de tickets de soporte: con un `choice` que asigne el departamento (facturacion, tecnico, etc.) y un `score` de urgencia con leyenda ("puede esperar", "esta semana", "hoy"), el modelo devuelve probabilidades por opcion y puede enrutarse el ticket automaticamente cuando la confianza supera un umbral.
- Clasificacion documental multimodal: agrupando facturas, albaranes o contratos con el texto extraido del estado, el modelo puede responder a preguntas booleanas (`noul`) como si el importe supera un umbral o si el documento esta vencido, sin necesidad de escribir reglas ni de parsear JSON generado.
- Moderacion y etiquetado de contenido audiovisual: dado un video muestreado a 2 fps junto con su banda sonora, se pueden resolver preguntas como si aparece una colision o si se oye cristal rompiendose, con una probabilidad asociada consumible por un sistema de revision.
- Analisis de llamadas de atencion al cliente: pasando el audio a 16 kHz mono y un esquema de preguntas sobre motivo de contacto, sentimiento y resolucion, se obtiene una ficha estructurada por llamada apta para analitica agregada.
- Enrutado de alertas de infraestructura: con el texto de la alerta como estado y preguntas sobre si hay caida de servicio y su severidad, el modelo actua como capa de decision entre el sistema de monitorizacion y el sistema de guardias.
- Revision de cumplimiento sobre imagenes: capturas de interfaces, paneles o documentos escaneados pueden evaluarse frente a un esquema de criterios regulatorios, devolviendo probabilidad por criterio en lugar de una narracion.
- Extraccion de campos con validacion probabilistica: en lugar de un extractor de entidades clasico, se plantean preguntas booleanas o de eleccion sobre el estado y se usan las probabilidades como puntuacion de confianza para decidir si se escala a revision humana.
- Preprocesado para agentes: como paso previo a un agente que si genera texto, Clef-Omni puede reducir texto, imagen, audio y video a un conjunto pequeno de decisiones tipadas y de bajo coste, reduciendo el numero de llamadas al modelo generativo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El autor indica que el backbone necesita aproximadamente 64 GB de memoria de GPU en bfloat16, y que las pruebas se realizaron en una unica H200.
- Entorno de referencia: `torch` 2.11 y `transformers` 5.10.2.
- GPU recomendadas: H200 (configuracion validada por el autor); por capacidad de memoria, H100 80 GB o A100 80 GB son opciones coherentes para bfloat16 completo, aunque no estan validadas en la informacion disponible.
- No cabe en GPUs de consumo tipo RTX 4090 (24 GB) en bfloat16 con los 64 GB estimados; para reducir requisitos habria que recurrir a cuantizacion, y no se documentan formatos de cuantizacion disponibles.
- Dependencias adicionales: `pillow` para imagenes y `av` para audio y video.
- Opciones de despliegue: Transformers con el codigo propio del repositorio (`joint_schema_model.py`, funciones `load_release_model`, `encode_record`, `collate_records` y `systemone`). El soporte de SGLang esta anunciado como "coming soon". No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Parametros activos | Contexto | Salida | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Cloudflare/clef-omni | 35,26 mil millones (incluye pesos de voz no usados) | 3.000 millones | no disponible | Probabilidades por opcion y pregunta (logits + softmax), sin texto libre | Apache-2.0 | HuggingFace, transformers, codigo custom; SGLang anunciado |
| Qwen/Qwen3-Omni-30B-A3B-Instruct (modelo base) | 30 mil millones (A3B) | 3.000 millones | no disponible en la informacion proporcionada | Texto libre generado, multimodal | no disponible en la informacion proporcionada | HuggingFace |
| Cloudflare/clef | no disponible | no disponible | no disponible | Decision estructurada sobre imagen y video (variante densa) | no disponible en la informacion proporcionada | HuggingFace |
| Cloudflare/clef-flash | no disponible | no disponible | no disponible | Decision estructurada sobre imagen y video (variante densa) | no disponible en la informacion proporcionada | HuggingFace |

La comparacion con alternativas de otros fabricantes no esta disponible en la informacion proporcionada. La diferencia funcional clave frente al modelo base es que Clef-Omni no genera texto: sustituye la generacion por un cabezal de clasificacion conjunto sobre un esquema declarado por el usuario.

## Limitaciones y advertencias

- No genera texto libre: cualquier caso de uso que requiera redaccion, resumen o dialogo abierto queda fuera del alcance del modelo.
- La calidad de las decisiones depende por completo de la formulacion del esquema (`questions`, `criteria`, `instructions`); un criterio ambiguo se traduce directamente en probabilidades poco fiables.
- Riesgo de calibracion: las probabilidades devueltas son la salida de un softmax sobre logits de un cabezal de clasificacion, y no se documenta ningun proceso de calibracion ni datos de evaluacion de fiabilidad.
- Riesgo de alucinacion residual en el sentido de asignar alta probabilidad a una opcion sin evidencia suficiente en el estado; al no haber texto intermedio, no hay traza explicativa que permita auditar el motivo de la decision.
- Idiomas soportados no disponibles: no hay lista oficial de idiomas, lo que impide garantizar el comportamiento en castellano u otros idiomas distintos del ingles.
- Longitud de contexto no disponible: se desconoce el limite de tokens de texto, el numero maximo de imagenes, la duracion maxima de audio o video soportada por registro.
- Sin datos de benchmarks publicos, no es posible comparar objetivamente su precision frente a alternativas.
- Restricciones de licencia: el modelo se distribuye bajo Apache-2.0, lo que permite uso comercial, pero hay que verificar las condiciones del modelo base Qwen3-Omni-30B-A3B-Instruct, ya que el repositorio conserva pesos derivados de el.
- Los pesos de salida de voz (talker y code2wav) se incluyen en el repositorio aunque no se cargan: ocupan espacio en disco y aumentan el tamano del repo hasta los 70,8 GB.
- El ecosistema de despliegue es limitado: no hay soporte documentado de vLLM, llama.cpp, Ollama o TGI, y el codigo de carga e inferencia es custom (`joint_schema_model.py`), lo que obliga a confiar en el mismo.
- No se documentan formatos de cuantizacion, por lo que desplegar en GPUs de consumo no es viable con la informacion disponible.
- El modelo tiene muy poca traccion en el momento de la ficha (2 descargas, 15 likes) y todos los ficheros son de octubre de 2026, por lo que la comunidad y el soporte son practicamente inexistentes.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Cloudflare/clef-omni
- Anuncio en el blog de Cloudflare: https://blog.cloudflare.com/clef-faster-cheaper-multimodal
- Modelo base: https://huggingface.co/Qwen/Qwen3-Omni-30B-A3B-Instruct
- Variante densa para imagen y video: https://huggingface.co/Cloudflare/clef
- Variante densa rapida: https://huggingface.co/Cloudflare/clef-flash
- Cloudflare (sitio corporativo): https://www.cloudflare.com/
- Cloudflare (version en frances): https://www.cloudflare.com/fr-fr/
- Panel de Cloudflare: https://dash.cloudflare.com/login
- Cliente Cloudflare One, descargas estables: https://developers.cloudflare.com/cloudflare-one/team-and-resources/devices/cloudflare-one-client/download/
- Cloudflare en Wikipedia: https://en.wikipedia.org/wiki/Cloudflare
