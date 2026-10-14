# mradermacher/Urbex-4B-GGUF

## Resumen

Urbex-4B-GGUF es la distribucion en formato GGUF del modelo vvangfaye/Urbex-4B, generada por mradermacher (nethype GmbH), un cuantizador conocido por publicar versiones comprimidas listas para inferencia local. Se trata de un modelo de 4.022.468.096 parametros (4,02 B) orientado, segun sus etiquetas, a spatial grounding —la localizacion de referencias espaciales en imagenes y entornos— y ajustado mediante aprendizaje por refuerzo (el pipeline declarado en HuggingFace es reinforcement-learning). El repositorio incluye ficheros mmproj (proyector multimodal), lo que indica que el modelo base incorpora capacidad de vision, es decir, es un modelo de lenguaje y vision (VLM) de 4 B de parametros.

La relevancia de esta publicacion es practica: el modelo original se distribuye en pesos transformers, mientras que esta version ofrece 13 cuantizaciones GGUF distintas (desde Q2_K de 1,8 GB hasta f16 de 8,2 GB) mas dos variantes del proyector multimodal. Eso permite ejecutar un VLM de 4 B en GPUs de consumo e incluso en CPU, algo imposible con los pesos en precision completa.

La informacion disponible es limitada: el repositorio del cuantizador no reproduce la model card del modelo base, no se documentan la longitud de contexto, la composicion del dataset de entrenamiento ni resultados de benchmarks. Todo lo que figura a continuacion sobre arquitectura, datos o rendimiento se marca explicitamente como "no disponible" cuando no consta en la informacion proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible. La presencia de ficheros mmproj (proyector multimodal) indica un componente de vision acoplado a un transformer de lenguaje, pero no se documenta la arquitectura concreta |
| Parametros totales | 4.022.468.096 (4,02 B) |
| Parametros activos | no disponible. No consta que sea un modelo MoE |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | f16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, IQ4_XS, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K; proyector multimodal en mmproj-Q8_0 y mmproj-f16. No hay cuantizaciones ponderadas/imatrix publicadas |
| Idiomas soportados | ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp) |
| Modelo base | vvangfaye/Urbex-4B |
| Cuantizado por | mradermacher |
| Etiquetas | urbex, spatial-grounding, reinforcement-learning |
| Tamano del repositorio | 37,7 GB |
| Fecha de publicacion | 14 de octubre de 2026 |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura del modelo base. Los metadatos de la etiqueta base_model apuntan a vvangfaye/Urbex-4B, cuyo repositorio no se incluye en la informacion proporcionada. Los dos indicios tecnicos disponibles son: (1) el pipeline declarado en HuggingFace es reinforcement-learning, lo que sugiere que el ajuste del modelo se realizo total o parcialmente mediante tecnicas de RL, presumiblemente para optimizar la localizacion espacial (spatial grounding); y (2) la existencia de ficheros mmproj en el repositorio GGUF, que solo se generan cuando el modelo tiene un encoder visual o proyector multimodal, de modo que Urbex-4B es un modelo de vision-lenguaje.

El proceso de cuantizacion si esta documentado por el autor del repositorio: se trata de cuantizaciones estaticas (quantize_version 2, output_tensor_quantised 1, convert_type hf) generadas con llama.cpp. Esto implica que los tensores se cuantizan sin una matriz de importancia (imatrix) derivada de un corpus de calibracion, un enfoque mas rapido de producir pero con perdida de calidad algo mayor que las cuantizaciones ponderadas en rangos bajos. El autor indica explicitamente que las cuantizaciones ponderadas no estan disponibles y que no las tiene planificadas por el momento. No consta informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, ni si hubo fases de SFT, RLHF o DPO previas al ajuste por refuerzo.

## Capacidades

- Generacion de texto conversacional en ingles (la model card no documenta otros idiomas).
- Procesamiento de imagenes: los ficheros mmproj confirman soporte multimodal de entrada visual.
- Spatial grounding: localizacion de objetos o regiones descritas en lenguaje natural dentro de una imagen, que es la capacidad que da nombre y sentido a las etiquetas del modelo.
- Razonamiento multi-paso sobre escenas, presumiblemente entrenado mediante RL para mejorar la precision del grounding.
- Ajuste conversacional: la etiqueta endpoints_compatible y el tag conversational indican que el modelo acepta plantillas de chat.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Capacidades de agente: no disponible en la informacion proporcionada.
- Capacidades multilingues: limitadas al ingles segun el campo language del repositorio.
- Modo thinking o modos de razonamiento explicito: no disponible.
- Entrada de audio o video: no disponible.

## Casos de uso

- Navegacion de robots moviles en interiores: el componente de spatial grounding permite traducir instrucciones como "ve a la puerta que esta detras de la columna" en coordenadas o regiones de la imagen captada por la camara. Un modelo de 4 B en Q4_K_M ocupa 2,6 GB, por lo que puede ejecutarse en el propio robot sobre una GPU embebida tipo Jetson Orin.
- Inspeccion de edificios e instalaciones: dado el tag urbex (exploracion urbana), el modelo encaja en tareas de analisis visual de estructuras, deteccion de elementos concretos en fotografias de campo y anotacion automatica de informes de inspeccion, con la ventaja de que puede desplegarse sin conexion en un portatil.
- Anotacion asistida de datasets de vision: el modelo puede pre-etiquetar bounding boxes o regiones descritas en lenguaje natural sobre grandes volumenes de imagenes, reduciendo el trabajo manual previo a una revision humana. La licencia Apache 2.0 permite integrarlo en pipelines internos sin restricciones de uso comercial.
- Asistencia a personas con discapacidad visual: descripcion de escenas y localizacion de objetos ("el vaso esta a tu derecha, sobre la mesa") en un dispositivo de bolsillo. El modelo cabe en Q4_K_M en cualquier GPU de consumo y puede correr en CPU con llama.cpp a velocidad reducida.
- Documentacion tecnica a partir de fotografias: generacion de descripciones estructuradas de equipos, planos o instalaciones a partir de imagenes, con salida en texto listo para incorporar a un sistema de gestion documental.
- Prototipado e investigacion en grounding: al ser un modelo pequeno y con pesos GGUF, sirve como linea base reproducible en experimentos de comparacion de tecnicas de RL para localizacion espacial, sin necesidad de infraestructura de datacenter.
- Realidad aumentada: superposicion de etiquetas informativas sobre objetos detectados en tiempo real, aprovechando el bajo coste de inferencia de las cuantizaciones Q4 e IQ4_XS.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Ni la model card del repositorio GGUF ni los metadatos de HuggingFace incluyen puntuaciones de MMLU, HumanEval, GSM8K, RefCOCO, VQAv2, MMBench ni de cualquier otra evaluacion de vision-lenguaje o de grounding. Tampoco se ofrece comparacion con el modelo base en precision completa para medir la degradacion introducida por la cuantizacion.

## Requisitos de hardware

- VRAM estimada para inferencia (pesos + cache KV y overhead de runtime, valores aproximados): Q2_K 1,8 GB de fichero, ~2,5 GB en VRAM; Q3_K_S 2,0 GB, ~2,8 GB; Q4_K_S 2,5 GB, ~3,4 GB; Q4_K_M 2,6 GB, ~3,5 GB; IQ4_XS 2,4 GB, ~3,3 GB; Q5_K_M 3,0 GB, ~4,0 GB; Q6_K 3,4 GB, ~4,5 GB; Q8_0 4,4 GB, ~5,5 GB; f16 8,2 GB, ~10 GB.
- El proyector multimodal anade entre 0,6 GB (mmproj-Q8_0) y 0,9 GB (mmproj-f16) que debe cargarse junto al modelo cuando se procesan imagenes.
- GPU de consumo: el modelo cabe sin problema en cualquier GPU con 6 GB o mas de VRAM. Una RTX 3060 de 12 GB, una RTX 4060 Ti de 8 GB o una RTX 4090 ejecutan la version Q4_K_M o incluso Q8_0 con margen amplio y contexto moderado. Las cuantizaciones Q2_K y Q3_K permiten ademas despliegue en iGPU con memoria compartida.
- GPU de datacenter: A100, H100 o L40S solo tienen sentido si se busca throughput muy alto con muchas peticiones concurrentes o contexto largo, dado el reducido tamano del modelo.
- Despliegue: llama.cpp, Ollama, LM Studio, KoboldCpp y llama-cpp-python son las opciones naturales para GGUF. vLLM incorpora soporte GGUF experimental pero no es la via recomendada para este formato; TGI no es una opcion adecuada para pesos GGUF.
- Latencia y throughput: no disponible. No se han publicado mediciones de tokens por segundo ni de latencia en la informacion proporcionada.
- Almacenamiento: el repositorio completo ocupa 37,7 GB. Conviene descargar unicamente la cuantizacion necesaria mediante el patron de fichero correspondiente.

## Comparativa con modelos similares

La comparacion se establece con modelos de vision-lenguaje de tamano reducido, ya que no consta ninguna otra publicacion de la familia Urbex. Los datos de los modelos de terceros provienen de su documentacion publica y deben verificarse antes de tomar decisiones.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad GGUF | Rendimiento |
|---|---|---|---|---|---|
| Urbex-4B (via mradermacher) | 4,02 B | no disponible | Apache 2.0 | Si, 13 cuantizaciones | no disponible |
| Qwen2.5-VL-3B-Instruct | 3,75 B | 32k nativo | Apache 2.0 | Si, amplia comunidad de cuantizaciones | no comparable por falta de datos de Urbex-4B |
| Gemma 3 4B | ~4 B | 128k | Licencia Gemma (uso comercial permitido con condiciones) | Si, cuantizaciones oficiales y de terceros | no comparable por falta de datos de Urbex-4B |
| InternVL2.5-4B | ~4 B | no disponible | MIT | Si | no comparable por falta de datos de Urbex-4B |

Diferencias destacables: Urbex-4B se distingue de las alternativas por su enfoque especifico en spatial grounding y por el ajuste mediante RL, mientras que Qwen2.5-VL-3B, Gemma 3 4B e InternVL2.5-4B son asistentes multimodales de proposito general. El soporte de idiomas de Urbex-4B se limita al ingles, frente al caracter multilingue de sus competidores. Sin benchmarks publicados no es posible determinar si la especializacion en grounding compensa esa perdida de generalidad.

## Limitaciones y advertencias

- Ausencia total de evaluacion publicada: no hay benchmarks, comparaciones con el modelo base ni analisis de la degradacion introducida por las cuantizaciones. Cualquier uso en produccion exige una evaluacion propia previa.
- Riesgo de alucinacion en la descripcion de imagenes y en la localizacion de objetos: los modelos de grounding pequenos pueden generar coordenadas o referencias plausibles pero incorrectas, especialmente con escenas ambiguas u objetos poco frecuentes.
- Idiomas: el modelo esta declarado unicamente para ingles. No hay evidencia de soporte para castellano u otras lenguas, por lo que su uso en productos en espanol requeriria validacion adicional.
- Longitud de contexto desconocida: no se puede planificar el uso con documentos largos o secuencias de multiples imagenes sin medir empiricamente el limite real.
- Cuantizaciones estaticas sin imatrix: el propio autor advierte de que no hay cuantizaciones ponderadas disponibles. En los rangos bajos (Q2_K, Q3_K_S, Q3_K_M) la perdida de calidad puede ser notable, y la etiqueta "lower quality" aparece explicitamente en Q3_K_M.
- Distribucion no oficial: este repositorio es una cuantizacion de terceros. Para reportar problemas de comportamiento del modelo, la referencia correcta es el repositorio base vvangfaye/Urbex-4B.
- Licencia: el repositorio declara Apache 2.0, lo que en principio permite uso comercial. No obstante, conviene verificar la licencia del modelo base y de los datos de entrenamiento antes de desplegarlo en producto, ya que la informacion disponible no incluye esa trazabilidad.
- Sesgos: no se ha publicado ninguna evaluacion de sesgos demograficos, culturales o geograficos. Un modelo entrenado con RL sobre una tarea concreta puede ademas presentar comportamientos derivados del reward hacking, como respuestas estereotipadas o exceso de confianza en la tarea para la que fue optimizado.
- Datos temporales: la fecha de publicacion indicada en los metadatos es el 14 de octubre de 2026, con una unica actualizacion el mismo dia. El repositorio registra 0 descargas y 0 likes, por lo que no existe retroalimentacion de la comunidad sobre su comportamiento real.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Urbex-4B-GGUF
- Modelo base: https://huggingface.co/vvangfaye/Urbex-4B
- Pagina de vision general y lista de descargas del cuantizador: https://hf.tst.eu/model#Urbex-4B-GGUF
- FAQ y peticiones de cuantizacion de mradermacher: https://huggingface.co/mradermacher/model_requests
- Guia de uso de ficheros GGUF (referencia de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Analisis de tipos de cuantizacion de Artefact2: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Grafica comparativa de perplejidad por tipo de cuantizacion (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- nethype GmbH: https://www.nethype.de/
