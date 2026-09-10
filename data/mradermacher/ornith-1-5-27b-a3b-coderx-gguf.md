# mradermacher/Ornith-1.5-27B-A3B-CoderX-GGUF

## Resumen

Ornith-1.5-27B-A3B-CoderX-GGUF es el conjunto de cuantizaciones en formato GGUF publicadas por mradermacher a partir del modelo base ManniX-ITA/Ornith-1.5-27B-A3B-CoderX. No se trata por tanto de un modelo entrenado desde cero, sino de una conversión y cuantización estática (quantize_version 2, tensor quantisation activada) pensada para ejecutar el modelo en llama.cpp, Ollama, LM Studio y otros runners compatibles con GGUF, sin necesidad de GPUs de centro de datos.

El modelo subyacente es un transformer de tipo mezcla de expertos (MoE) con 26.213.016.704 parámetros totales y una denominación A3B que sugiere del orden de 3.000 millones de parámetros activos por token, aunque este dato no aparece confirmado de forma explícita en la información disponible. Las etiquetas del repositorio indican que se trata de una variante orientada a código (code) construida mediante poda de expertos (expert-pruning, reap, ream) y fusion de modelos (omnimergekit), con soporte de predicción multi-token (mtp). La licencia declarada es Apache-2.0 y el único idioma listado en la model card es el inglés.

Su relevancia practica es doble: por un lado, ofrece una vía de despliegue en hardware de consumo para un MoE de ~26.000 millones de parámetros con una huella de memoria reducida; por otro, al provenir de una cadena de poda y fusión de expertos, resulta un caso interesante para investigadores que estudian técnicas de compresión estructural de MoE. Hay que señalar que el repositorio no incluye datos de entrenamiento, contexto soportado ni resultados de benchmarks, por lo que buena parte de la ficha queda marcada como no disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | transformer de mezcla de expertos (MoE) con poda de expertos; rasgos declarados: moe, expert-pruning, mtp, reap, ream |
| Parametros totales | 26.213.016.704 (26,21 B) |
| Parametros activos | no disponible de forma explicita; la nomenclatura A3B del nombre sugiere ~3 B activos por token (no confirmado en la informacion proporcionada) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | x-f16, Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, IQ4_XS (segun los metadatos del autor; en la tabla del README solo figura Q4_K_S con 15,2 GB) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (este repositorio); el modelo base se distribuye en safetensors |

## Arquitectura y entrenamiento

La informacion disponible no describe la arquitectura interna mas alla de las etiquetas del repositorio. Se sabe que el modelo base es un MoE, que sus pesos suman 26.213.016.704 parametros y que la variante lleva el sufijo A3B, habitual en la literatura para indicar el numero de parametros activos por token (en este caso, aproximadamente 3.000 millones). El pipeline declarado es transformers y la conversion a GGUF se hizo con convert_type hf y cuantizacion estatica de tensores (quantize_version 2, output_tensor_quantised 1).

Respecto al proceso de construccion del modelo original, las etiquetas apuntan a una combinacion de poda de expertos guiada por el router (reap, del ingles Router-weighted Expert Activation Pruning) y tecnicas relacionadas (ream), junto con fusion de modelos mediante la herramienta omnimergekit. La etiqueta mtp indica soporte o entrenamiento con prediccion multi-token. No hay informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, ni sobre si hubo etapas de RLHF, DPO u otro ajuste por preferencias. Tampoco se documenta ninguna innovacion de decodificacion especulativa en este repositorio de cuantizaciones.

## Capacidades

- Generacion de texto conversacional en ingles, segun la etiqueta conversational y el idioma declarado.
- Generacion y asistencia de codigo, dado que el modelo pertenece a la linea CoderX y lleva la etiqueta code.
- Razonamiento multi-paso en el contexto de tareas de programacion y depuracion, aunque no se documenta un modo de pensamiento explicito.
- Prediccion multi-token (mtp), segun las etiquetas del autor, lo que puede traducirse en decodificacion mas rapida en runners que la soporten.
- Inferencia eficiente gracias a la naturaleza MoE: solo se activa una fraccion de los parametros por token (aproximadamente 3 B segun la nomenclatura).
- Soporte de tool calling / function calling: no disponible, no se menciona en la informacion proporcionada.
- Soporte de agentes y multi-step reasoning orquestado: no disponible.
- Capacidades de vision o audio: no disponibles; no se declaran.
- Capacidades multilingues: limitadas al ingles segun la model card; no hay evidencia de soporte adicional.

## Casos de uso

- Asistente de programacion en local: al ser un GGUF de 15,2 GB en Q4_K_S, puede ejecutarse en una unica GPU de 24 GB o incluso en CPU con RAM suficiente, ofreciendo autocompletado y explicacion de codigo sin enviar el codigo fuente a servicios externos.
- Revision de pull requests en pipelines internos: el modelo puede integrarse en un runner llama.cpp para generar resumenes de cambios y detectar patrones problematicos en diffs, manteniendo el codigo dentro de la infraestructura de la organizacion.
- Generacion de tests unitarios: dada su orientacion a codigo, es adecuado para producir borradores de pruebas a partir de funciones existentes, que despues se validan en CI/CD.
- Migracion y traduccion de codigo entre lenguajes: el modelo puede emplearse para reescribir fragmentos de un lenguaje a otro y explicar las diferencias semanticas, con revision humana posterior.
- Documentacion tecnica automatica: generacion de docstrings y documentacion de API a partir del codigo fuente y de los comentarios existentes.
- Chatbot de soporte tecnico especializado: su caracter conversacional y su foco en codigo permiten desplegar un asistente que responda dudas sobre lenguajes, librerias y mensajes de error concretos.
- Experimentacion en investigacion sobre MoE: al ser un modelo podado y fusionado, sirve como banco de pruebas para estudiar el impacto de la poda de expertos en la calidad de las respuestas, comparando variantes de cuantizacion sobre el mismo esqueleto.
- Despliegue en estaciones de trabajo sin GPU dedicada: las cuantizaciones Q2_K y Q3_K permiten ejecucion en CPU, util para entornos de desarrollo con recursos limitados o para demos offline.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio de cuantizaciones se limita a listar los formatos generados y no incluye metricas de MMLU, HumanEval, GSM8K ni de ningun otro conjunto de evaluacion. La busqueda web realizada no devolvio resultados relacionados con el modelo: los unicos enlaces recuperados corresponden a portales gubernamentales de Oman, sin ninguna relacion con este modelo, por lo que no se puede extraer de ellos ningun dato de rendimiento.

## Requisitos de hardware

Los tamanos de los ficheros GGUF que no aparecen en el README se estiman a partir de los 26.213 millones de parametros y de los bits por peso tipicos de cada tipo de cuantizacion; son estimaciones, no cifras publicadas por el autor.

- VRAM estimada para inferencia (mas overhead de contexto y cache KV):
  - Q2_K: ~10-11 GB (estimado).
  - Q3_K_S: ~11,5 GB (estimado); Q3_K_M: ~13 GB (estimado); Q3_K_L: ~14 GB (estimado).
  - IQ4_XS: ~14 GB (estimado).
  - Q4_K_S: 15,2 GB (dato real del repositorio); Q4_K_M: ~15,5-16 GB (estimado).
  - Q5_K_S: ~18 GB (estimado); Q5_K_M: ~19 GB (estimado).
  - Q6_K: ~21,5 GB (estimado).
  - Q8_0: ~28 GB (estimado).
  - f16: ~52 GB (estimado).
- GPU recomendadas: RTX 4090, RTX 3090, RTX 4080 Super o A6000 para Q4_K_S y cuantizaciones inferiores; A100 40/80 GB, H100 o L40S para Q6_K, Q8_0 y f16. Para Q2_K y Q3_K es viable la ejecucion mixta CPU+GPU o completamente en CPU con 16-32 GB de RAM.
- Cabe en GPU de consumo: si. Con 24 GB de VRAM se pueden ejecutar comodamente Q2_K a Q5_K_M y Q4_K_S con contexto moderado; Q6_K requiere reducir el contexto o descargar capas a CPU; Q8_0 y f16 no caben en una unica GPU de consumo.
- Opciones de despliegue: llama.cpp (incluido llama-server), Ollama, LM Studio, koboldcpp y cualquier runner compatible con GGUF. Para el modelo base sin cuantizar, vLLM, SGLang o TGI con los pesos en safetensors.
- Latencia y throughput estimados: no disponible. Como referencia cualitativa, al activar solo una fraccion reducida de parametros por token (aproximadamente 3 B segun la nomenclatura A3B), el throughput esperado en una RTX 4090 con Q4_K_S es notablemente superior al de un modelo denso de 26 B, pero no hay cifras publicadas que lo confirmen.

## Comparativa con modelos similares

La comparacion se limita a parametros totales, parametros activos y licencia, ya que no hay datos publicados de benchmarks ni de contexto para Ornith-1.5-27B-A3B-CoderX.

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia | Rendimiento |
|---|---|---|---|---|---|
| Ornith-1.5-27B-A3B-CoderX (este, en GGUF) | 26,21 B | ~3 B (segun nomenclatura, no confirmado) | no disponible | apache-2.0 | no disponible |
| Qwen3-30B-A3B | ~30,5 B | ~3,3 B | no disponible | apache-2.0 | no disponible |
| Qwen2.5-Coder-32B-Instruct | ~32,5 B | denso (sin MoE) | no disponible | apache-2.0 | no disponible |
| DeepSeek-Coder-V2-Lite | ~15,7 B | ~2,4 B | no disponible | no disponible | no disponible |

Nota: las cifras de los modelos de comparacion corresponden a datos publicos ampliamente difundidos, pero no se han verificado en el contexto de esta busqueda. La ventaja estructural de Ornith frente a un modelo denso de tamano similar es el coste de inferencia por token, derivado del enrutado MoE; su desventaja potencial es la menor documentacion y la ausencia de evaluaciones publicadas.

## Limitaciones y advertencias

- Sesgos conocidos: no disponible. No hay informacion sobre la composicion del corpus de entrenamiento ni sobre analisis de sesgo.
- Riesgo de alucinacion: presente como en cualquier modelo generativo; es especialmente relevante en tareas de codigo, donde puede inventar APIs, funciones o parametros inexistentes. Se recomienda validacion automatica (compilacion, tests) antes de aceptar sugerencias.
- Limitaciones de contexto: la longitud de contexto no esta documentada en la informacion disponible, por lo que no se puede garantizar el manejo de repositorios o conversaciones largas. Hay que verificarlo empiricamente antes de usarlo en produccion.
- Limitaciones de idioma: la model card declara unicamente ingles. El rendimiento en castellano u otros idiomas no esta verificado y probablemente sea inferior.
- Restricciones de licencia: Apache-2.0 permite uso comercial, modificacion y redistribucion, pero conviene revisar la licencia del modelo base ManniX-ITA/Ornith-1.5-27B-A3B-CoderX, ya que este repositorio solo cubre la cuantizacion y el autor de la cuantizacion no es el titular de los derechos del entrenamiento.
- Procedencia del modelo: la cadena de poda de expertos y fusion (reap, ream, omnimergekit) puede degradar capacidades de forma no uniforme entre dominios; sin evaluaciones publicadas no es posible saber que areas se han visto mas afectadas.
- Estado del repositorio: creado el 2026-09-10 segun los metadatos de HuggingFace y con 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validacion por parte de la comunidad.
- Cuantizaciones: el autor indica que no hay cuantizaciones ponderadas/imatrix disponibles y que podria no planear generarlas; en el README solo se documenta Q4_K_S, aunque los metadatos mencionan otros tipos. Conviene verificar la lista real de ficheros antes de disenar un despliegue.
- Los ficheros GGUF de gran tamano pueden estar divididos en multiples partes; es necesario consultar las instrucciones de concatenacion del autor antes de usarlos.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Ornith-1.5-27B-A3B-CoderX-GGUF
- Modelo base: https://huggingface.co/ManniX-ITA/Ornith-1.5-27B-A3B-CoderX
- Fichero Q4_K_S: https://huggingface.co/mradermacher/Ornith-1.5-27B-A3B-CoderX-GGUF/resolve/main/Ornith-1.5-27B-A3B-CoderX.Q4_K_S.gguf
- Pagina de descargas del autor: https://hf.tst.eu/model#Ornith-1.5-27B-A3B-CoderX-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafica comparativa de cuantizaciones de ikawrakow: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Solicitudes de cuantizacion del autor: https://huggingface.co/mradermacher/model_requests
- nethype GmbH: https://www.nethype.de/

Nota: la busqueda web no devolvio ningun enlace relevante sobre este modelo; los resultados obtenidos correspondian a portales gubernamentales de Oman sin relacion con el contenido de esta ficha. No se dispone por tanto de papers, blogs tecnicos ni demos adicionales.
