# mradermacher/continuity-a4b-26b-i1-GGUF

## Resumen

Continuity A4B 26B es un modelo de lenguaje de tipo mezcla de expertos (MoE) desarrollado por GestaltLabs y cuantizado por mradermacher. Su identificador interno ("a4b") apunta a un diseno con aproximadamente 4.000 millones de parametros activos por token sobre un total de 25.233.142.046 parametros reales confirmados en los pesos safetensors, lo que lo situa en la categoria de modelos MoE de ~25B con coste de inferencia propio de un modelo mucho mas pequeno.

El modelo esta claramente orientado a la extraccion estructurada: sus etiquetas declaran soporte para salidas restringidas por esquema, JSON, HTML y "schema-constrained", ademas de tool calling y uso conversacional. Se trata tambien de un modelo con capacidad de vision, ya que la model card indica explicitamente que es un modelo visual y que los ficheros mmproj se publican en el repositorio estatico asociado. Esta construido como un merge de LoRA sobre una base no detallada en la informacion disponible.

La relevancia de esta ficha concreta radica en que el repositorio es la version GGUF con cuantizacion por imatrix (la mas util para despliegue en local), no los pesos originales. Los pesos base estan publicados en formato bf16 bajo licencia apache-2.0, aunque el enlace de licencia de la model card remite a la licencia de Gemma 4, una ambiguedad legal que se detalla en la seccion de advertencias.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mezcla de expertos (MoE) de tipo transformer; detalles de capas, atencion y enrutado no disponibles |
| Parametros totales | 25.233.142.046 (25,23 B) |
| Parametros activos | no disponible de forma oficial; el sufijo "a4b" del nombre sugiere aproximadamente 4.000 millones activos por token |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF i1 (imatrix): IQ1_S, IQ1_M, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, IQ3_XXS, IQ3_XS, IQ3_S, IQ3_M, Q2_K, Q2_K_S, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_NL (small), IQ4_XS, Q4_0, Q4_1, Q4_K_S, Q4_K_M; version estatica adicional en el repositorio GGUF no-imatrix |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 (la model card enlaza ademas la licencia de Gemma 4) |
| Formato de pesos | GGUF (este repositorio); los pesos originales en bf16 se distribuyen por separado como safetensors |
| Capacidad multimodal | Si, modelo con vision; requiere ficheros mmproj del repositorio estatico |
| Modelo base | GestaltLabs/continuity-a4b-26b |
| Tamano del repositorio | 49,8 GB |
| Libreria declarada | transformers |

## Arquitectura y entrenamiento

La informacion disponible confirma que se trata de un modelo MoE resultado de un merge de LoRA sobre una base no especificada, y que fue convertido a GGUF a partir de pesos HuggingFace en formato bf16. No se detallan el numero de expertos, el numero de expertos activos por token, la estrategia de enrutado, el tipo de atencion ni la profundidad de la red. Tampoco se especifica la composicion del dataset de entrenamiento, el numero de tokens vistos ni si hubo fases de RLHF, DPO o ajuste por preferencias.

La innovacion practica que si puede confirmarse es doble. Por un lado, el modelo esta afinado para extraccion estructurada y generacion restringida por esquema, una capacidad que en la practica exige un post-procesado minimo cuando se integra en pipelines de datos. Por otro, las cuantizaciones publicadas en este repositorio son de tipo imatrix (importance matrix), generadas con una matriz de calibracion que reduce la perdida de perplejidad en cuantizaciones agresivas; el autor incluye tambien el fichero imatrix de 0,2 GB para quien quiera generar sus propias cuantizaciones.

## Capacidades

- Generacion de texto conversacional multi-turno en ingles.
- Extraccion estructurada de informacion: salidas en JSON valido y HTML a partir de texto de entrada.
- Generacion restringida por esquema (schema-constrained), pensada para que la salida respete un contrato de datos predefinido.
- Soporte de tool calling y function calling, segun las etiquetas del repositorio ("vllm", "endpoints_compatible").
- Capacidad de vision: puede procesar imagenes si se carga junto con el fichero mmproj correspondiente del repositorio estatico.
- Uso como modelo de razonamiento agentico de varios pasos: la combinacion de contexto conversacional y salida estructurada es adecuada para bucles de agente.
- Capacidades multilingues: limitadas al ingles segun el campo de idiomas declarado.

## Casos de uso

- Extraccion de datos de facturas y albarranes: el modelo puede recibir el texto OCR de un documento y devolver un JSON con los campos normalizados (importes, fechas, CIF, lineas de detalle) respetando el esquema definido, lo que elimina validaciones posteriores.
- Parsing de documentos con vision: cargando el mmproj, el modelo puede leer capturas, escaneos o formularios directamente como imagen y emitir la estructura extraida sin necesidad de un motor OCR externo.
- Normalizacion de catalogos de producto: conversion de descripciones heterogeneas en fichas HTML o JSON consistentes para su ingesta en un CMS o en un sistema de busqueda.
- Agentes de automatizacion con tool calling: el modelo puede actuar como planificador que decide que funcion invocar y con que argumentos, devolviendo siempre la llamada en un formato parseable.
- Post-procesado de pipelines RAG: conversion de respuestas en texto libre a estructuras verificables por esquema antes de insertarlas en una base de datos o en un informe.
- Extraccion de entidades en datos de vigilancia o compliance: identificacion de contrapartes, importes y fechas en comunicaciones, con salida tabulada directamente consumible.
- Generacion de fragmentos HTML en herramientas de publicacion: creacion de bloques HTML estructurados a partir de instrucciones breves o de datos tabulares.
- Servicio conversacional especializado en dominio tecnico en ingles: atencion de consultas con contexto multi-turno donde la respuesta debe incluir campos estructurados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio cuantizado no incluye tablas de MMLU, GSM8K, HumanEval ni metricas de extraccion estructurada, y los resultados de la busqueda web no aportan datos tecnicos sobre el modelo.

## Requisitos de hardware

- Cuantizaciones confirmadas por el autor: i1-Q2_K ocupa 10,7 GB e i1-IQ3_M ocupa 12,5 GB. El fichero imatrix auxiliar ocupa 0,2 GB.
- Estimacion para otras cuantizaciones sobre un modelo de 25,23 B parametros: Q4_K_M en torno a 15-16 GB, Q8_0 en torno a 27 GB y bf16 en torno a 50 GB (el repositorio completo ocupa 49,8 GB). Son estimaciones por tamano de parametros, no cifras publicadas.
- GPU consumer: una RTX 4090 o RTX 3090 de 24 GB puede ejecutar Q4_K_M y Q5 completos en VRAM con contexto moderado; una GPU de 12 GB (RTX 3060, RTX 4070) puede alojar Q2_K o IQ3_M dejando poco margen para cache KV.
- GPU profesionales: A100 40/80 GB, H100 y L40S permiten bf16 o Q8 con contexto largo y lote elevado. Al ser MoE, el cuello de botella en memoria es el peso total, no el computo por token.
- Despliegue en CPU o hibrido: llama.cpp y sus derivados permiten offload parcial de capas a GPU, lo que hace viable IQ2/IQ3 en equipos con 16-32 GB de RAM.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, koboldcpp y cualquier runtime compatible con GGUF para este repositorio. Para vLLM o TGI conviene partir de los pesos originales en bf16, ya que el soporte de GGUF en esos servidores es mas limitado. La vision requiere un runtime con soporte mmproj, como llama.cpp reciente.
- Latencia y throughput: no disponible. Al tratarse de un MoE con un numero reducido de parametros activos, la velocidad por token deberia ser sustancialmente superior a la de un modelo denso de 25B, pero no hay cifras publicadas que lo confirmen.

## Comparativa con modelos similares

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia | Rendimiento |
|---|---|---|---|---|---|
| continuity-a4b-26b (este) | 25,23 B | no disponible (sugerido ~4 B por el nombre) | no disponible | apache-2.0 con enlace a licencia Gemma 4 | no disponible |
| Qwen3-30B-A3B | 30,5 B | 3,3 B | 128 K | apache-2.0 | publicado por el autor (no comparable directamente) |
| Gemma 3 27B | 27 B (denso) | 27 B | 128 K | terminos de uso de Gemma | publicado por el autor |
| Mixtral 8x7B | 46,7 B | 12,9 B | 32 K | apache-2.0 | publicado por el autor |

La comparativa es estructural: los tres modelos alternativos son referencias publicas de la misma categoria de tamano o de esquema MoE. No existen datos de rendimiento publicados para continuity-a4b-26b que permitan una comparacion cuantitativa, y la longitud de contexto del modelo no esta documentada.

## Limitaciones y advertencias

- Ambiguedad de licencia: el repositorio declara apache-2.0, pero la model card enlaza la licencia de Gemma 4. Si el modelo base deriva de Gemma, las condiciones reales de uso comercial pueden no ser las de Apache 2.0. Conviene verificar la licencia del modelo base antes de un uso en produccion.
- Idioma: el modelo solo declara ingles. No hay evidencia de soporte fiable en castellano ni en otros idiomas, por lo que su uso en extraccion estructurada multilingue requeriria validacion previa.
- Alucinacion en campos estructurados: en tareas de extraccion, un fallo tipico no es el texto incorrecto sino la invencion de un campo ausente. Es imprescindible validar la salida contra el esquema y descartar valores no presentes en la fuente.
- Restricciones de esquema: la generacion restringida por esquema depende del runtime empleado. No todos los motores de inferencia aplican gramaticas o JSON schema de la misma forma, por lo que el comportamiento puede variar entre llama.cpp, Ollama y vLLM.
- Sin benchmarks publicados: no hay evidencia cuantitativa de calidad en MMLU, GSM8K, HumanEval ni en tareas de extraccion, lo que dificulta estimar su fiabilidad frente a alternativas.
- Modelo recien publicado y con traccion nula: cero descargas y cero likes en el momento de redactar la ficha, sin comunidad que haya reportado comportamiento en produccion.
- Vision condicionada: la capacidad multimodal exige cargar el mmproj desde el repositorio estatico; sin el, el modelo funciona solo como modelo de texto.
- Cuantizaciones muy agresivas: las variantes IQ1 e IQ2 degradan la calidad de forma apreciable. Para extraccion estructurada, donde un token mal predicho invalida el JSON, no son recomendables por debajo de IQ3.
- Perplejidad no documentada por cuantizacion: no se han publicado tablas de perplejidad para este modelo concreto.

## Enlaces

- Repositorio GGUF con imatrix: https://huggingface.co/mradermacher/continuity-a4b-26b-i1-GGUF
- Repositorio GGUF estatico (incluye mmproj si existe): https://huggingface.co/mradermacher/continuity-a4b-26b-GGUF
- Modelo base: https://huggingface.co/GestaltLabs/continuity-a4b-26b
- Pagina de resumen y descargas del autor: https://hf.tst.eu/model#continuity-a4b-26b-i1-GGUF
- Peticiones de cuantizacion y FAQ del autor: https://huggingface.co/mradermacher/model_requests
- Guia de uso de GGUF (referencia de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico comparativo de calidad de cuantizaciones de ikawrakow: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Licencia referenciada por la model card: https://ai.google.dev/gemma/docs/gemma_4_license
