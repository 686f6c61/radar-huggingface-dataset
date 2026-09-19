# mradermacher/yes-or-no-1.5b-GGUF

## Resumen

`mradermacher/yes-or-no-1.5b-GGUF` es un repositorio de cuantizaciones en formato GGUF del modelo base `eventvoid/yes-or-no-1.5b`, publicado por el usuario mradermacher, conocido por producir versiones cuantizadas de modelos abiertos para su uso con llama.cpp y derivados. No se trata de un modelo nuevo entrenado desde cero, sino de una conversión de pesos orientada a reducir los requisitos de memoria y facilitar la inferencia en hardware de consumo.

El modelo base pertenece a la categoria de modelos especializados en respuestas binarias (etiquetas `yes-no`), verificacion de hechos (fact-checking), calibracion y cuantificacion de incertidumbre. Es decir, no esta disenado como un asistente conversacional general, sino como un componente de decision que responde a afirmaciones o preguntas con una salida si/no acompanada, previsiblemente, de algun tipo de senal de confianza. Cuenta con 1.543.714.304 parametros (aproximadamente 1,54 mil millones), lo que lo situa en el segmento de modelos pequenos.

Su relevancia practica es doble: por un lado, ofrece una alternativa ligera para tareas de verificacion dentro de pipelines de recuperacion aumentada (RAG); por otro, la disponibilidad de cuantizaciones desde Q2_K hasta f16 permite desplegarlo en entornos muy restringidos, incluidas CPU y GPUs de gama de consumo. La licencia Apache 2.0 del modelo base facilita su integracion en productos comerciales. No obstante, la informacion publicada es escasa: se trata de una model card de cuantizacion, sin detalles sobre arquitectura interna, datos de entrenamiento ni longitud de contexto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no especificada en la informacion proporcionada) |
| Parametros totales | 1.543.714.304 (aproximadamente 1,54 mil millones) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | f16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, IQ4_XS, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (el repositorio contiene unicamente ficheros GGUF) |

Datos adicionales derivados del repositorio: tamano total del repo de 14,2 GB, biblioteca declarada `transformers`, etiquetas de pipeline `endpoints_compatible`, `conversational`, `yes-no`, `fact-checking`, `calibration`, `uncertainty-quantification`. Fecha de creacion: 2026-09-19.

## Arquitectura y entrenamiento

No hay informacion disponible sobre la arquitectura interna del modelo base `eventvoid/yes-or-no-1.5b` en la documentacion proporcionada. Los metadatos indican que se distribuye a traves de la libreria `transformers`, y el conteo de parametros procede de los ficheros safetensors del modelo original (1.543.714.304 parametros). El repositorio cuantizado no incluye configuracion de capas, numero de cabezas de atencion, dimension del modelo ni tipo de atencion.

Tampoco se documenta el proceso de entrenamiento: no consta el numero de tokens, la composicion del dataset, ni si se aplicaron tecnicas de ajuste como RLHF, DPO o SFT supervisado. Lo unico inferible son los objetivos declarados mediante etiquetas: clasificacion binaria si/no, verificacion de hechos, calibracion de probabilidades y cuantificacion de incertidumbre. Esto sugiere un ajuste fino orientado a producir respuestas categoricas con una confianza asociada, presumiblemente mas fiable que la de un modelo generalista interrogado directamente sobre la veracidad de una afirmacion.

En cuanto a la cuantizacion, la model card indica que se trata de cuantizaciones estaticas (sin pesos ponderados ni matriz de importancia, `imatrix`), generadas con `quantize_version: 2`, `output_tensor_quantised: 1` y `convert_type: hf`. Se advierte explicitamente de que las cuantizaciones ponderadas o con imatrix no estaban disponibles en el momento de la publicacion, y que las de tipo Q3_K_M tienen calidad inferior. No se han publicado resultados de perplejidad especificos para estas conversiones.

## Capacidades

- Clasificacion binaria si/no: la funcion principal del modelo es responder de forma categorica a preguntas o afirmaciones, segun las etiquetas `yes-no` del repositorio.
- Verificacion de hechos (fact-checking): evaluacion de la veracidad de una afirmacion proporcionada en el prompt.
- Calibracion: el modelo esta etiquetado como apto para tareas donde la probabilidad asignada a la respuesta debe reflejar la confianza real.
- Cuantificacion de incertidumbre: orientado a que el sistema consumidor pueda distinguir entre casos resueltos y casos dudosos.
- Generacion de texto: el modelo base se distribuye con pipeline `conversational`, por lo que mantiene capacidad de generar texto, aunque su ajuste especifico lo orienta a salidas cortas y categoricas.
- Soporte de tool calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: limitadas al ingles (`language: en`). No consta soporte de castellano ni de otros idiomas.
- Capacidades especiales (modo thinking, vision, audio): no disponibles.

## Casos de uso

- Verificacion de hechos en pipelines RAG: tras recuperar pasajes relevantes de una base documental, el modelo recibe la afirmacion del usuario junto con el contexto recuperado y emite un veredicto binario. Su tamano reducido (1,5 mil millones de parametros) permite ejecutarlo en la misma maquina que el resto del pipeline sin competir por VRAM con el modelo generador.
- Filtrado previo de respuestas generadas: en un sistema de generacion aumentada, el modelo actua como comprobador de fidelidad, validando si cada afirmacion de la respuesta esta respaldada por las fuentes recuperadas antes de mostrarla al usuario, lo que reduce el riesgo de alucinacion visible.
- Etiquetado de datos a gran escala: clasificacion automatica de conjuntos de afirmaciones, noticias o pares pregunta-respuesta en categorias de verdadero/falso o verificable/no verificable, aprovechando las cuantizaciones Q4 y Q5 para maximizar el rendimiento por GPU.
- Enrutamiento en cascada de modelos: como primera etapa de bajo coste, el modelo resuelve los casos con alta confianza y delega en un modelo mayor unicamente las consultas marcadas como inciertas. Esto reduce el coste de inferencia en produccion de forma medible.
- Moderacion y control de calidad de contenido: deteccion de afirmaciones potencialmente falsas en comentarios, resenas o articulos generados por usuarios, marcando los casos que requieren revision humana.
- Evaluacion automatica de asistentes: uso como juez binario en pruebas de regresion, comprobando si las respuestas de un chatbot cumplen criterios objetivos de veracidad antes de desplegar una version nueva.
- Sistemas embebidos o de borde: gracias a las cuantizaciones de 0,8 a 1,2 GB, puede desplegarse en dispositivos con recursos limitados donde no cabe un modelo generativo de mayor tamano, ofreciendo solo la funcion de decision binaria.
- Abstencion controlada en asistentes medicos o legales: en dominios donde una respuesta erronea es costosa, el modelo puede usarse para detectar cuando el sistema no dispone de evidencia suficiente, activando una respuesta de abtencion en lugar de una afirmacion no respaldada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio cuantizado no incluye tablas de MMLU, HumanEval, GSM8K, TruthfulQA ni metricas de calibracion (ECE, Brier score) para el modelo base ni para las cuantizaciones. Tampoco se proporcionan datos de perplejidad comparativos entre los distintos niveles de cuantizacion; la unica referencia cualitativa es la tabla de notas del autor, que marca Q3_K_M como "lower quality", Q4_K_S y Q4_K_M como "fast, recommended", Q6_K como "very good quality" y f16 como "16 bpw, overkill".

## Requisitos de hardware

Los tamanos de fichero publicados por el autor permiten estimar el consumo de memoria en inferencia. La VRAM necesaria es aproximadamente el tamano del fichero mas el espacio para la cache KV y el overhead del runtime, que depende de la longitud de contexto (no disponible).

| Cuantizacion | Tamano del fichero | VRAM estimada en inferencia |
|---|---|---|
| Q2_K | 0,8 GB | aproximadamente 1,0-1,5 GB |
| Q3_K_S / Q3_K_M | 0,9 GB | aproximadamente 1,1-1,6 GB |
| Q3_K_L / IQ4_XS / Q4_K_S | 1,0 GB | aproximadamente 1,2-1,8 GB |
| Q4_K_M | 1,1 GB | aproximadamente 1,3-1,9 GB |
| Q5_K_S / Q5_K_M | 1,2 GB | aproximadamente 1,4-2,0 GB |
| Q6_K | 1,4 GB | aproximadamente 1,6-2,2 GB |
| Q8_0 | 1,7 GB | aproximadamente 1,9-2,5 GB |
| f16 | 3,2 GB | aproximadamente 3,5-4,5 GB |

- Cabe en cualquier GPU de consumo: una RTX 3060 de 12 GB, una RTX 4060 de 8 GB o incluso una GTX 1650 de 4 GB pueden ejecutar las cuantizaciones Q4 o Q5 sin dificultad, dejando margen amplio para el contexto.
- Inferencia en CPU: viable con llama.cpp en cualquier procesador moderno; los ficheros de 0,8 a 1,2 GB se mantienen en memoria RAM sin problema.
- GPU de datacenter: A100, H100 o L40S estan sobredimensionadas para este modelo; su uso solo se justifica si se busca throughput masivo mediante batching.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, koboldcpp y servidores compatibles con GGUF. La etiqueta `endpoints_compatible` sugiere compatibilidad con Hugging Face Inference Endpoints. No consta soporte nativo en vLLM o TGI para estos ficheros GGUF en la informacion proporcionada.
- Latencia y throughput: no disponibles. Dado el tamano, en una GPU de consumo se espera una latencia de decenas de milisegundos por consulta corta, pero no hay mediciones publicadas que lo confirmen.

## Comparativa con modelos similares

La comparacion directa es limitada porque el modelo esta especializado en clasificacion binaria y verificacion de hechos, una categoria con pocos modelos publicos de referencia. No hay datos de rendimiento del modelo base que permitan comparaciones cuantitativas.

| Modelo | Parametros | Contexto | Licencia | Naturaleza |
|---|---|---|---|---|
| yes-or-no-1.5b (base de esta ficha) | 1,54 mil millones | no disponible | Apache 2.0 | Especializado en si/no y fact-checking |
| Qwen2.5-1.5B-Instruct | 1,54 mil millones | 32.768 tokens (segun documentacion publica del modelo) | Apache 2.0 | Asistente generalista |
| SmolLM2-1.7B-Instruct | 1,7 mil millones | 8.192 tokens (segun documentacion publica del modelo) | Apache 2.0 | Asistente generalista |
| Gemma 2 2B Instruct | 2,6 mil millones | 8.192 tokens (segun documentacion publica del modelo) | Licencia Gemma (con restricciones de uso) | Asistente generalista |

Los modelos de la comparativa son generalistas y no ofrecen calibracion explicita ni salidas binarias, por lo que la comparacion en tareas de verificacion no es directa: un modelo generalista requeriria ingenieria de prompts y no garantiza una calibracion fiable. Los datos de contexto de los modelos alternativos proceden de su documentacion publica y no han sido verificados en esta busqueda; los del modelo objeto de la ficha figuran como no disponibles.

## Limitaciones y advertencias

- Cobertura idiomatica restringida al ingles. El modelo no declara soporte de castellano ni de ningun otro idioma, por lo que su uso en entornos hispanohablantes requeriria traduccion previa o un ajuste adicional.
- Dominio de salida muy estrecho: produce respuestas si/no, lo que lo inutiliza como generador de texto libre o asistente conversacional general.
- Riesgo de alucinacion relevante en la tarea de verificacion de hechos: un clasificador binario puede afirmar la veracidad o falsedad de una afirmacion sin evidencia suficiente. La etiqueta `uncertainty-quantification` sugiere que el modelo intenta mitigarlo, pero no hay metricas publicadas que lo confirmen.
- Calibracion no verificada: no se han publicado valores de error de calibracion esperado (ECE) ni curvas de fiabilidad para el modelo base ni para las cuantizaciones.
- Degradacion por cuantizacion: las conversiones Q2_K y Q3_K reducen la precision de los pesos de forma agresiva. El propio autor marca Q3_K_M como de calidad inferior. Para tareas sensibles a la calibracion, deberian preferirse Q5, Q6, Q8_0 o f16, y validar el impacto real con un conjunto de evaluacion propio.
- Ausencia de cuantizaciones ponderadas o con imatrix: la model card indica que no estaban disponibles, lo que en principio implica una perdida de calidad algo mayor que la de cuantizaciones generadas con matriz de importancia al mismo tamano.
- Contexto desconocido: al no documentarse la longitud de contexto, no es posible garantizar el comportamiento con prompts largos (por ejemplo, pasajes RAG extensos) ni estimar con precision el consumo de cache KV.
- Sesgos: no disponibles. Al no publicarse la composicion del dataset de entrenamiento, no se puede evaluar el sesgo del modelo en dominios especificos.
- Licencia: Apache 2.0, permisiva y apta para uso comercial, siempre que se conserve el aviso de licencia y el fichero de atribucion. No obstante, la licencia del modelo base debe verificarse de forma independiente, ya que esta ficha se basa en la declaracion del repositorio cuantizado.
- Advertencia de procedencia: la model card de este repositorio es una plantilla automatica de cuantizacion. Carece de informacion sobre evaluacion, limitaciones declaradas por el autor original y guia de uso responsable.

## Enlaces

- Repositorio de cuantizaciones: https://huggingface.co/mradermacher/yes-or-no-1.5b-GGUF
- Modelo base: https://huggingface.co/eventvoid/yes-or-no-1.5b
- Pagina de resumen de descargas del autor: https://hf.tst.eu/model#yes-or-no-1.5b-GGUF
- FAQ y peticiones de cuantizacion del autor: https://huggingface.co/mradermacher/model_requests
- Guia de uso de ficheros GGUF (README de referencia de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico comparativo de calidad entre cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Paper, blog o demo oficial del modelo base: no disponible

Nota sobre la busqueda web: los resultados obtenidos corresponden a sitios de apuestas y casino sin relacion alguna con el modelo. No se ha encontrado informacion adicional verificable sobre `yes-or-no-1.5b` ni sobre su autor original.
