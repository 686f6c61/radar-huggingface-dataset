# mradermacher/Mr-MARTIN-9B-3.5_vision-OMNI-GGUF

## Resumen

Mr-MARTIN-9B-3.5_vision-OMNI-GGUF es la version cuantizada en formato GGUF del modelo ZERO-POINT-AI/Mr-MARTIN-9B-3.5_vision-OMNI, publicada por el usuario mradermacher (nethype GmbH), un autor habitual de cuantizaciones de terceros. El modelo original lo desarrolla ZERO-POINT-AI y cuenta con 8.953.803.264 parametros (unos 8,95 mil millones), lo que lo situa en la franja de los 9B densos. Esta publicacion no aporta pesos nuevos: unicamente convierte el modelo base a GGUF para permitir su ejecucion en llama.cpp y derivados (Ollama, LM Studio, text-generation-webui).

La relevancia de esta ficha es practica: el modelo base aparentemente solo esta disponible en transformers, mientras que esta version ofrece doce niveles de cuantizacion (desde Q2_K de 3,9 GB hasta f16 de 18,0 GB) que cubren desde GPUs de gama de entrada hasta estaciones de trabajo. El nombre del modelo incluye "vision-OMNI" y los metadatos de la model card contienen un campo `skip_mmproj`, lo que sugiere soporte multimodal con proyector de vision, aunque la model card no lo confirma explicitamente ni documenta la arquitectura.

Se trata de un modelo marcado como "conversational", con etiquetas de contenido para adultos (nsfw, adults only, not-for-all-audiences) y con soporte declarado de ocho idiomas: ingles, chino, coreano, espanol, frances, aleman, japones y tailandes. La licencia declarada es Apache 2.0 tanto en el repositorio base como en esta cuantizacion.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (transformer, sin confirmar por el autor) |
| Parametros totales | 8.953.803.264 (~8,95 B) |
| Parametros activos | no disponible (no confirmado como MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | en, zh, ko, es, fr, de, ja, th |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (safetensors en el modelo base) |
| Parametros del repositorio | 81,4 GB (suma de todos los cuantos) |
| Tamano de f16 | 18,0 GB (16 bpw) |
| Tamano de Q4_K_M | 5,7 GB (recomendado) |
| Modelo base | ZERO-POINT-AI/Mr-MARTIN-9B-3.5_vision-OMNI |
| Cuantizador | mradermacher |

## Arquitectura y entrenamiento

No disponible. La model card de la cuantizacion no incluye informacion sobre la arquitectura del modelo base: no se especifica si es un transformer denso, un modelo de mezcla de expertos (MoE), un hibrido con atencion lineal o un SSM, ni tampoco el tipo de atencion, la funcion de activacion o el esquema de normalizacion. Tampoco se documentan el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de alineacion como RLHF, DPO o instruccion supervisada.

El unico indicio tecnico relevante es el nombre del modelo, que incluye "vision", y la presencia de un campo comentado `skip_mmproj` en los metadatos internos de la model card, lo que apunta a la existencia de un proyector multimodal (mmproj) y, por tanto, a capacidades de vision. Dicho esto, ni el autor del modelo base ni el cuantizador publican detalles que permitan confirmar la arquitectura, el mecanismo de fusion de las entradas visuales ni las innovaciones tecnicas asociadas.

## Capacidades

- Generacion de texto conversacional multi-turno, segun la etiqueta "conversational" del repositorio.
- Capacidad de codigo: el repositorio incluye la etiqueta "code", que indica soporte para tareas de programacion, si bien no se documenta su alcance ni el rendimiento en generacion de codigo.
- Posible soporte de vision (imagenes): inferido del nombre "vision-OMNI" y del campo `skip_mmproj`; no confirmado explicitamente en la model card.
- Multilingue: ocho idiomas declarados (ingles, chino, coreano, espanol, frances, aleman, japones y tailandes).
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Modo de razonamiento explicito (thinking mode): no disponible.
- Capacidades de audio: no disponible.

## Casos de uso

- Despliegue en hardware de consumo: gracias a los cuantos Q4_K_S (5,5 GB) y Q4_K_M (5,7 GB), el modelo puede ejecutarse en GPUs con 8 GB de VRAM, lo que permite prototipar asistentes conversacionales en un portatil o una torre con RTX 3060/4060.
- Servicio de chat autoalojado con llama.cpp u Ollama: el formato GGUF permite levantar un endpoint HTTP local sin necesidad de infraestructura de servidor ni de drivers CUDA especificos, util para equipos que necesitan privacidad de datos.
- Procesamiento de conversaciones en espanol: al declarar soporte de espanol junto a otros siete idiomas, puede emplearse en atencion al usuario multilingue en un unico modelo en lugar de mantener varios modelos monolingues.
- Asistencia de generacion de codigo en entornos con restricciones de red: la etiqueta "code" sugiere que puede completar y explicar fragmentos de codigo dentro de un IDE o un pipeline de CI/CD local, aunque no hay datos publicos de HumanEval ni de otros benchmarks que respalden su calidad.
- Iteracion rapida en investigacion: la disponibilidad de cuantos desde Q2_K (3,9 GB) hasta f16 (18,0 GB) permite estudiar la degradacion por cuantizacion sobre un mismo modelo y elegir el punto de equilibrio entre calidad y memoria.
- Experimentacion con modelos multimodales: si se confirma la capacidad de vision, podria usarse para descripcion de imagenes, extraccion de informacion de capturas de pantalla o analisis de documentos escaneados con un unico modelo de menos de 9B.
- Analisis de contenido en tailandes o coreano: la cobertura de idiomas poco frecuentes en modelos de este tamano lo hace candidato para tareas de clasificacion y generacion en esos idiomas, sujeto a validacion propia.
- Despliegue en CPU pura: el cuanto Q4_K_M (5,7 GB) puede ejecutarse en un servidor sin GPU con llama.cpp, a costa de una latencia mayor, lo que resulta util para tareas por lotes no interactivas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Ni la model card del modelo base ni la de la cuantizacion incluyen cifras de MMLU, HumanEval, GSM8K, MT-Bench, MMMU ni de ninguna otra evaluacion. Tampoco se aportan datos de velocidad (tokens/s) ni de latencia para ningun cuanto.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos, sin cache KV): Q2_K ~3,9 GB; Q3_K_S ~4,4 GB; Q3_K_M ~4,7 GB; Q3_K_L ~5,0 GB; IQ4_XS ~5,3 GB; Q4_K_S ~5,5 GB; Q4_K_M ~5,7 GB; Q5_K_S ~6,4 GB; Q5_K_M ~6,6 GB; Q6_K ~7,5 GB; Q8_0 ~9,6 GB; f16 ~18,0 GB.
- A esa cifra hay que sumar la cache KV y el overhead del runtime, que dependen de la longitud de contexto, del numero de capas y de la implementacion; al no conocerse la arquitectura ni el contexto, no es posible dar un valor fiable.
- GPU recomendadas: una RTX 3060 12 GB o RTX 4060 Ti 16 GB cubre comodamente cualquier cuanto hasta Q8_0; una RTX 4090 24 GB permite ejecutar f16 completo en una sola GPU; para despliegues con contexto largo y concurrencia conviene una A100 40/80 GB o una H100.
- Cabe en GPU de consumo: si, en GPUs de 8 GB o mas con cuantos de 4 bits (Q4_K_S, Q4_K_M, IQ4_XS) y en GPUs de 6-8 GB con cuantos de 3 bits, a costa de perdida de calidad.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, Jan, text-generation-webui y cualquier runtime compatible con GGUF. No se documenta soporte de vLLM ni de TGI en esta publicacion, al estar orientada a GGUF.
- Latencia y throughput: no disponible. No se aportan mediciones de tokens por segundo para ningun cuanto ni hardware.
- Cuantos con imatrix: el autor publica una version alternativa con cuantizaciones ponderadas por importancia en mradermacher/Mr-MARTIN-9B-3.5_vision-OMNI-i1-GGUF, que suele ofrecer mejor calidad a igual tamano.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Rendimiento comparado |
|---|---|---|---|---|---|
| Mr-MARTIN-9B-3.5_vision-OMNI (este) | ~8,95 B | no disponible | Apache 2.0 | GGUF (terceros) y transformers (base) | no disponible |
| Llama 3.1 8B Instruct | 8,03 B | 128 K | Llama 3.1 Community License | GGUF, transformers, vLLM, TGI | no disponible frente a este modelo |
| Gemma 2 9B IT | 9,24 B | 8 K | Gemma Terms of Use | GGUF, transformers, vLLM | no disponible frente a este modelo |
| Mistral 7B Instruct v0.3 | 7,25 B | 32 K | Apache 2.0 | GGUF, transformers, vLLM, TGI | no disponible frente a este modelo |

No hay datos de benchmarks publicados para Mr-MARTIN-9B-3.5_vision-OMNI, por lo que no es posible establecer una comparacion de rendimiento verificable con las alternativas de la tabla. La comparacion se limita a parametros, contexto, licencia y disponibilidad. La ventaja diferencial de este modelo frente a las alternativas citadas es la cobertura declarada de ocho idiomas, incluidos tailandes y coreano, y la posible capacidad de vision, que Llama 3.1 8B y Mistral 7B no ofrecen en sus versiones de texto.

## Limitaciones y advertencias

- Sesgos conocidos: no disponible. No se ha publicado ninguna evaluacion de sesgos ni de toxicidad.
- Riesgo de alucinacion: no cuantificado. Al no existir benchmarks, no hay datos objetivos sobre la fiabilidad factual del modelo; conviene validar sus salidas antes de usarlo en produccion.
- Contenido para adultos: el repositorio incluye las etiquetas "nsfw", "adults only" y "not-for-all-audiences", lo que indica que el modelo puede generar contenido no apto para todos los publicos. No debe desplegarse sin filtros en aplicaciones orientadas a menores o de uso general.
- Riesgo de contenido no filtrado: al no documentarse si hubo alineacion con RLHF o DPO, se desconoce el grado de ajuste del modelo a directrices de seguridad. Es especialmente relevante para despliegues abiertos al publico.
- Contexto e idioma: la longitud de contexto no esta documentada, lo que impide planificar tareas que requieran ventanas largas. Aunque se declaran ocho idiomas, no hay evaluaciones que midan la calidad real en espanol, tailandes o coreano; el soporte puede ser desigual.
- Licencia: declarada como Apache 2.0, lo que en principio permite uso comercial. No obstante, la licencia aparece en el repositorio base y en el cuantizado sin un fichero LICENSE explicito en la model card, y la naturaleza del contenido de entrenamiento (etiquetado como nsfw) puede plantear dudas sobre la procedencia de los datos. Conviene revisar el repositorio original antes de un uso comercial.
- Modelo cuantizado por terceros: los cuantos de menor tamano (Q2_K, Q3_K_*) introducen degradacion de calidad considerable. El propio autor recomienda Q4_K_S y Q4_K_M como opciones rapidas y equilibradas.
- Capacidad de vision sin confirmar: el nombre y los metadatos sugieren soporte multimodal, pero no se documenta como activarlo, si requiere un fichero mmproj aparte ni que formatos de imagen acepta.
- Sin soporte documentado de tool calling ni de agentes: no se puede asumir que el modelo emita llamadas a funciones en formato estructurado sin verificacion previa.
- Madurez del proyecto: 500 descargas y 2 "me gusta" en el repositorio, con una unica revision de README y sin pipeline declarado. La comunidad no lo ha validado de forma significativa.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Mr-MARTIN-9B-3.5_vision-OMNI-GGUF
- Repositorio del modelo base: https://huggingface.co/ZERO-POINT-AI/Mr-MARTIN-9B-3.5_vision-OMNI
- Cuantizaciones con imatrix: https://huggingface.co/mradermacher/Mr-MARTIN-9B-3.5_vision-OMNI-i1-GGUF
- Pagina de resumen y descargas del autor: https://hf.tst.eu/model#Mr-MARTIN-9B-3.5_vision-OMNI-GGUF
- Preguntas frecuentes y peticiones de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Guia de referencia sobre GGUF: https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Comparativa de calidad entre cuantos (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Grafica de perplejidad por tipo de cuanto: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- nethype GmbH: https://www.nethype.de/
