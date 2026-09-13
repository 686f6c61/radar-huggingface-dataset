# mradermacher/query-understanding-ja-4b-GGUF

## Resumen

`mradermacher/query-understanding-ja-4b-GGUF` es una coleccion de cuantizaciones en formato GGUF del modelo `mahiyama/query-understanding-ja-4b`, un modelo de 4.326.350.848 parametros (aproximadamente 4,33 mil millones) especializado en comprension y analisis de consultas de busqueda en japones. Lo publica mradermacher, un autor habitual de cuantizaciones GGUF para llama.cpp, que actua como empaquetador del trabajo original de mahiyama. El repositorio no incluye pesos en safetensors: solo los ficheros GGUF derivados, con un peso total de 41,0 GB repartido entre las distintas variantes de cuantizacion y dos ficheros mmproj.

El modelo resuelve un problema muy concreto dentro del ambito de la recuperacion de informacion: convertir una consulta de usuario en japones (tipica de buscadores de comercio electronico) en una representacion estructurada, normalmente JSON, mediante tecnicas de semantic parsing y slot-filling. Los tags del repositorio lo situan en el dominio del e-commerce y la busqueda de productos, con menciones explicitas al dataset ESCI (Exact, Substitute, Complement, Irrelevant), un benchmark clasico de relevancia de productos en buscadores.

Es relevante ahora porque permite desplegar un extractor de intenciones de busqueda en japones en hardware de consumo: la variante Q4_K_M ocupa 2,9 GB y la Q8_0 4,7 GB, lo que habilita inferencia local con llama.cpp, Ollama o servidores compatibles con el endpoint de HuggingFace. La licencia Apache 2.0 facilita su integracion comercial. Como contrapartida, la informacion publicada es muy escasa: no se documentan longitud de contexto, composicion del dataset de entrenamiento, volumen de tokens ni resultados de benchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible en la informacion proporcionada; los tags indican familia qwen3.5 (se deduce transformer denso de aproximadamente 4B) |
| Parametros totales | 4.326.350.848 (aproximadamente 4,33B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF: f16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, IQ4_XS, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K; mas mmproj-f16 y mmproj-Q8_0 (suplemento multimodal) |
| Idiomas soportados | japones (ja) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (este repositorio); el modelo base se distribuye en formato HuggingFace (safetensors) |
| Modelo base | mahiyama/query-understanding-ja-4b |
| Tarea declarada | comprension de consultas, query parsing, semantic parsing, slot filling, extraccion de informacion, salida estructurada JSON |
| Tamano del repositorio | 41,0 GB |
| Descargas / likes | 0 / 0 |
| Fecha de creacion | 2026-09-13 |

## Arquitectura y entrenamiento

No se proporciona informacion detallada sobre la arquitectura interna en la model card de esta cuantizacion. Los tags del repositorio incluyen `qwen3.5`, lo que vincula el modelo base con la familia Qwen 3.5 de Alibaba, y `lora`, lo que indica que el modelo original `mahiyama/query-understanding-ja-4b` se obtuvo mediante ajuste fino con LoRA sobre una base de aproximadamente 4B parametros. El recuento real de parametros procede de los ficheros safetensors del modelo base (4.326.350.848). No se especifican el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron fases de RLHF o DPO.

La especializacion declarada es la comprension de consultas de busqueda: dado un texto de consulta en japones, el modelo produce una representacion semantica estructurada con slots e intenciones, orientada a motores de busqueda de productos. La presencia de ficheros `mmproj` (proyeccion multimodal) sugiere que el modelo base hereda capacidad de vision del modelo sobre el que se ajusto, aunque la model card de esta cuantizacion no documenta ninguna capacidad multimodal ni su uso practico en la tarea de comprension de consultas. La cuantizacion la realiza mradermacher con su herramienta habitual; en el momento de publicacion solo hay cuantizaciones estaticas, sin variantes ponderadas con imatrix.

## Capacidades

- Comprension de consultas de busqueda en japones: interpretacion de la intencion del usuario a partir de texto libre.
- Query parsing y semantic parsing: conversion de lenguaje natural a una representacion semantica formal.
- Slot filling: extraccion de atributos como categoria de producto, marca, talla, color, precio u otras restricciones presentes en la consulta.
- Extraccion de informacion sobre consultas de comercio electronico, con mencion explicita al esquema ESCI de relevancia de productos.
- Salida estructurada en JSON, adecuada para consumo directo por parte de pipelines de busqueda.
- Capacidad conversacional declarada en los tags del repositorio.
- No se documenta soporte de tool calling, function calling ni comportamiento agentico multi-paso.
- No se documenta modo de razonamiento explicito (thinking mode), capacidades de audio ni uso real de vision, pese a la existencia de ficheros mmproj.
- Capacidad multilingue: no disponible; el unico idioma declarado es el japones.

## Casos de uso

- Analisis de consultas en buscadores de comercio electronico: el modelo recibe la cadena escrita por el usuario en japones y devuelve un JSON con intencion y slots, que el motor de busqueda traduce a filtros de catalogo. Es su caso de uso principal declarado.
- Clasificacion de relevancia segun ESCI: etiquetar pares consulta-producto como exacto, sustituto, complementario o irrelevante para evaluar y mejorar el ranking de un buscador.
- Enriquecimiento de logs de busqueda: procesar de forma masiva consultas historicas para construir taxonomias de intencion y detectar huecos de catalogo.
- Generacion de filtros para busqueda facetada: extraer marca, categoria, rango de precio o atributos tecnicos de una consulta y convertirlos en parametros de filtrado para el backend.
- Preprocesado en pipelines de recuperacion aumentada: normalizar la pregunta del usuario en japones a una estructura intermedia antes de consultar un indice vectorial o una base de datos.
- Extraccion de informacion en backoffice: procesar descripciones o solicitudes de clientes en japones y poblar campos estructurados de un CRM o de un sistema de tickets.
- Normalizacion de consultas para motores de recomendacion: transformar texto libre en representaciones consistentes que alimenten modelos de ranking posteriores.
- Servicio local de inferencia sin conexion: al disponer de cuantizaciones de 2,1 a 4,7 GB, puede ejecutarse en portatiles o equipos de sobremesa para prototipado y pruebas offline.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card de esta cuantizacion no incluye metricas de MMLU, HumanEval, GSM8K ni de tareas de comprension de consultas, y la busqueda web realizada no ha devuelto resultados relevantes sobre el modelo (los resultados obtenidos corresponden a hilos de foros de Autodesk sobre conversion de DWG a PDF y no guardan relacion con este modelo).

## Requisitos de hardware

- VRAM estimada para inferencia, a partir del tamano de los ficheros GGUF (el consumo real depende de la longitud de contexto y del backend):
  - f16 (8,8 GB): aproximadamente 10 GB de VRAM o mas.
  - Q8_0 (4,7 GB): aproximadamente 5,5-6 GB.
  - Q6_K (3,7 GB): aproximadamente 4,5-5 GB.
  - Q5_K_M (3,3 GB) y Q5_K_S (3,2 GB): aproximadamente 4-4,5 GB.
  - Q4_K_M (2,9 GB) y Q4_K_S (2,7 GB): aproximadamente 3,5-4 GB.
  - IQ4_XS (2,7 GB), Q3_K_L (2,6 GB), Q3_K_M (2,4 GB), Q3_K_S (2,2 GB): aproximadamente 3-3,5 GB.
  - Q2_K (2,1 GB): aproximadamente 2,5-3 GB.
- Cabe en GPU de consumo: si, en tarjetas con 6-8 GB o mas de VRAM (por ejemplo RTX 3060, RTX 4060, RTX 2070 en adelante) usando cuantizaciones de Q2_K a Q8_0. Las variantes Q4_K_M y Q4_K_S son las recomendadas por el autor por equilibrio entre velocidad y calidad; Q6_K se marca como de muy buena calidad.
- GPU de gama alta (A100, H100, RTX 4090): sobredimensionadas para este modelo; permitirian lotes grandes, contextos muy largos o despliegue en servidor con alta concurrencia.
- Opciones de despliegue: llama.cpp directamente sobre los ficheros GGUF; Ollama; servidores compatibles con el endpoint de HuggingFace (el tag `endpoints_compatible` aparece en el repositorio); integracion con transformers para el modelo base en safetensors. No se documenta soporte especifico para vLLM o TGI en esta cuantizacion.
- Latencia y throughput estimados: no disponibles. No se han publicado mediciones.

## Comparativa con modelos similares

No hay datos de rendimiento publicados para este modelo ni para alternativas directamente comparables dentro de la informacion proporcionada, por lo que no es posible establecer una comparativa cuantitativa fiable. La unica comparacion documentable es entre esta cuantizacion y su modelo base.

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| mradermacher/query-understanding-ja-4b-GGUF | 4,33B | no disponible | GGUF (12 variantes de cuantizacion + 2 mmproj) | apache-2.0 | Cuantizacion estatica; sin variantes imatrix |
| mahiyama/query-understanding-ja-4b | 4,33B | no disponible | HuggingFace / safetensors | apache-2.0 | Modelo original ajustado con LoRA; requiere transformers y mayor VRAM en f16 |
| Alternativas de la misma categoria | no disponible | no disponible | no disponible | no disponible | No se han identificado modelos comparables en la informacion proporcionada |

## Limitaciones y advertencias

- Idioma unico: el modelo solo declara soporte de japones; su uso con castellano, ingles u otros idiomas no esta documentado y previsiblemente dara resultados deficientes.
- Ausencia de benchmarks: no existen metricas publicadas que permitan estimar su precision en produccion. Cualquier despliegue deberia ir precedido de una evaluacion propia sobre datos del dominio objetivo.
- Riesgo de alucinacion: al ser un modelo generativo de 4B ajustado con LoRA para producir JSON, puede inventar slots o valores no presentes en la consulta original; es recomendable validar la salida contra un esquema y aplicar comprobaciones de consistencia.
- Ambito muy estrecho: esta especializado en comprension de consultas de busqueda y comercio electronico; no debe esperarse un buen rendimiento en tareas generales de generacion, codigo o matematicas.
- Ficheros mmproj incluidos: no hay documentacion sobre su uso ni sobre las capacidades multimodales del modelo base. Su presencia no implica que la tarea de comprension de consultas admita entrada de imagenes.
- Cuantizaciones de baja precision: Q2_K y Q3_K_S reducen el tamano pero degradan la calidad; para tareas de salida estructurada, donde un token mal generado invalida el JSON, conviene usar Q5_K_M o superior.
- Cuantizaciones ponderadas no disponibles: el autor indica que no hay variantes imatrix/weighted en el momento de publicacion, por lo que la calidad relativa de las cuantizaciones de baja precision puede ser inferior a la de otros modelos que si las tienen.
- Versionado del modelo base: la cuantizacion es estatica y queda ligada a la revision de `mahiyama/query-understanding-ja-4b` en el momento de su generacion; conviene fijar revisiones concretas en produccion.
- Licencia Apache 2.0: permite uso comercial, modificacion y redistribucion con obligacion de conservar el aviso de licencia y los ficheros de atribucion. No se imponen restricciones adicionales conocidas, aunque se recomienda revisar la licencia del modelo base y de la familia Qwen subyacente.
- Repositorio sin adopcion: 0 descargas y 0 likes en el momento de la consulta, lo que implica ausencia de validacion por parte de la comunidad.

## Enlaces

- Repositorio HuggingFace de la cuantizacion: https://huggingface.co/mradermacher/query-understanding-ja-4b-GGUF
- Modelo base (autor original): https://huggingface.co/mahiyama/query-understanding-ja-4b
- Pagina de resumen y listado de descargas de mradermacher para este modelo: https://hf.tst.eu/model#query-understanding-ja-4b-GGUF
- Preguntas frecuentes y solicitudes de cuantizacion de mradermacher: https://huggingface.co/mradermacher/model_requests
- Guia de uso de ficheros GGUF (README de referencia de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafica comparativa de perplejidad entre tipos de cuantizacion (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones GGUF: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9

Nota: la busqueda web realizada no ha devuelto ningun enlace relevante sobre este modelo; los resultados obtenidos pertenecen a hilos de foros de Autodesk sobre conversion de ficheros DWG a PDF y se han descartado por no guardar relacion con el modelo.
