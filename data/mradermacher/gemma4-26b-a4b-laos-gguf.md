# mradermacher/gemma4-26b-a4b-laos-GGUF

## Resumen

mradermacher/gemma4-26b-a4b-laos-GGUF es un repositorio de cuantizaciones en formato GGUF generado por el usuario mradermacher a partir del modelo Phonepadith/gemma4-26b-a4b-laos. No se trata de un modelo entrenado por el autor del repositorio, sino de una conversion de pesos para hacer viable la inferencia local en hardware de consumo mediante llama.cpp y herramientas compatibles. El modelo cuenta con 25.233.142.046 parametros (unos 25,2 mil millones) y se distribuye bajo licencia apache-2.0.

El nombre del modelo apunta a la familia Gemma 4 de Google y a una configuracion tipo MoE con aproximadamente 4.000 millones de parametros activos (el sufijo "a4b"), asi como a un ajuste orientado al idioma lao (sufijo "laos"). Ninguno de estos dos extremos se confirma en la informacion disponible: la model card no documenta arquitectura, contexto ni composicion del entrenamiento, y los metadatos declaran unicamente el idioma ingles.

La relevancia de esta ficha es practica: el repositorio incluye 13 cuantizaciones GGUF distintas (desde Q2_K de 10,7 GB hasta Q8_0 de 27,0 GB) mas dos ficheros multimodales mmproj, lo que permite desplegar un modelo de 25B en GPUs de 12 a 24 GB de VRAM. El repositorio no registra descargas ni likes en el momento de la consulta, por lo que se trata de una publicacion reciente y sin validacion comunitaria.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el nombre "a4b" sugiere MoE con ~4B activos, sin confirmar) |
| Parametros totales | 25.233.142.046 (25,2 mil millones) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, mmproj-Q8_0, mmproj-f16 |
| Idiomas soportados | en (segun metadatos); el nombre del modelo referencia "laos", sin confirmar |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (cuantizado); el modelo base se distribuye presumiblemente en safetensors |
| Modelo base | Phonepadith/gemma4-26b-a4b-laos |
| Autor de la cuantizacion | mradermacher |
| Tamano del repositorio | 184,9 GB |
| Fecha de creacion | 2026-09-16 |
| Ultima actualizacion | 2026-09-16 |
| Descargas / likes | 0 / 0 |

### Cuantizaciones disponibles

| Fichero | Tipo | Tamano (GB) | Notas |
|---|---|---|---|
| gemma4-26b-a4b-laos.mmproj-Q8_0.gguf | mmproj-Q8_0 | 0,9 | suplemento multimodal |
| gemma4-26b-a4b-laos.mmproj-f16.gguf | mmproj-f16 | 1,3 | suplemento multimodal |
| gemma4-26b-a4b-laos.Q2_K.gguf | Q2_K | 10,7 | calidad reducida |
| gemma4-26b-a4b-laos.Q3_K_S.gguf | Q3_K_S | 12,3 | |
| gemma4-26b-a4b-laos.Q3_K_M.gguf | Q3_K_M | 13,4 | calidad inferior |
| gemma4-26b-a4b-laos.Q3_K_L.gguf | Q3_K_L | 13,9 | |
| gemma4-26b-a4b-laos.IQ4_XS.gguf | IQ4_XS | 14,2 | |
| gemma4-26b-a4b-laos.Q4_K_S.gguf | Q4_K_S | 15,6 | rapida, recomendada |
| gemma4-26b-a4b-laos.Q4_K_M.gguf | Q4_K_M | 16,9 | rapida, recomendada |
| gemma4-26b-a4b-laos.Q5_K_S.gguf | Q5_K_S | 18,1 | |
| gemma4-26b-a4b-laos.Q5_K_M.gguf | Q5_K_M | 19,2 | |
| gemma4-26b-a4b-laos.Q6_K.gguf | Q6_K | 22,7 | calidad muy buena |
| gemma4-26b-a4b-laos.Q8_0.gguf | Q8_0 | 27,0 | rapida, mejor calidad |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura interna del modelo base en la documentacion proporcionada. El identificador "gemma4-26b-a4b" sugiere una arquitectura de mezcla de expertos (MoE) con 26.000 millones de parametros totales y aproximadamente 4.000 millones activos por token, patron habitual en la nomenclatura de modelos sparse, pero la model card del repositorio de cuantizacion no lo confirma ni detalla el numero de expertos, la funcion de enrutamiento o la longitud de contexto nativa.

Tampoco hay datos sobre el proceso de entrenamiento: no se indica el volumen de tokens, la composicion del dataset, ni si se aplicaron tecnicas de alineacion como RLHF, DPO o ajuste por instrucciones. El unico indicio relevante es el sufijo "laos" en el nombre, que sugiere un ajuste fino orientado al idioma lao, y la presencia de ficheros mmproj (multi-modal supplement) en el repositorio, que indica que el modelo base incorpora capacidad multimodal (entrada de imagenes) que las cuantizaciones preservan. El proceso aplicado por mradermacher es una conversion estatica a GGUF (quantize_version 2, output_tensor_quantised 1, convert_type hf) sin cuantizacion ponderada ni imatrix.

## Capacidades

- Generacion de texto conversacional, segun la etiqueta "conversational" del repositorio.
- Capacidad multimodal: la presencia de los ficheros mmproj-Q8_0 y mmproj-f16 indica soporte de entrada de imagenes junto al texto. El alcance exacto (captioning, VQA, OCR) no esta documentado.
- Inferencia optimizada para GGUF mediante llama.cpp y runtimes compatibles (Ollama, LM Studio, llama-cpp-python, text-generation-inference con backend GGUF).
- Compatibilidad declarada con endpoints (etiqueta "endpoints_compatible") y con text-generation-inference.
- Capacidades multilingues: no disponibles. Los metadatos solo declaran "en"; no se confirma soporte de lao, castellano ni otros idiomas.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Modo de razonamiento explicito (thinking mode): no disponible.
- Capacidades de codigo y matematicas: no disponibles.

## Casos de uso

- Inferencia local en estacion de trabajo con GPU de 24 GB: usando Q4_K_M (16,9 GB) o IQ4_XS (14,2 GB), el modelo cabe en una RTX 3090 o RTX 4090 con margen para cache KV, lo que permite ejecutar un modelo de 25B sin depender de APIs externas ni enviar datos a terceros.
- Despliegue en portatil con GPU de 12-16 GB: la cuantizacion Q3_K_M (13,4 GB) o Q2_K (10,7 GB) permite cargar el modelo en equipos de gama media, asumiendo una perdida de calidad respecto a Q4 o superior.
- Procesamiento de documentos con imagenes en local: los ficheros mmproj habilitan flujos multimodales (por ejemplo, extraccion de informacion de capturas o diagramas) sin salida a la nube, adecuado en entornos con requisitos de confidencialidad.
- Generacion de texto y asistentes conversacionales autoalojados: el modelo puede servir como backend de un chatbot interno en una organizacion que quiera evitar costes por token y mantener el control de los datos.
- Experimentacion e investigacion en cuantizacion: el repositorio ofrece 11 cuantizaciones del mismo modelo con tamanos de 10,7 a 27,0 GB, lo que permite estudiar la degradacion de perplejidad entre niveles K-quant e IQ-quant sobre un mismo checkpoint.
- Prototipado de pipelines con llama.cpp: la compatibilidad con GGUF facilita integrar el modelo en scripts Python (llama-cpp-python) o servidores compatibles con la API de OpenAI para pruebas de concepto antes de escalar a un despliegue mayor.
- Evaluacion comparativa de estrategias de despliegue: al disponer de variantes desde 10,7 GB hasta 27,0 GB, resulta util para medir throughput y latencia reales en distintas GPU y decidir el equilibrio calidad/velocidad para produccion.
- Servicio de traduccion o generacion en ingles dentro de un backend propio: dado que el unico idioma declarado es "en", su uso en produccion deberia limitarse a ese idioma hasta verificar el comportamiento real en otros.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio de cuantizacion no incluye valores de MMLU, HumanEval, GSM8K ni de ningun otro conjunto de evaluacion, y la busqueda web realizada no ha devuelto informacion relacionada con el modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: entre 11 y 13 GB con Q2_K (10,7 GB de pesos mas cache KV y overhead), entre 14 y 17 GB con IQ4_XS o Q4_K_S, entre 17 y 20 GB con Q4_K_M, entre 20 y 23 GB con Q5_K_M, entre 24 y 27 GB con Q6_K y en torno a 28-32 GB con Q8_0. Los ficheros mmproj anaden 0,9 GB (Q8_0) o 1,3 GB (f16) si se usa la via multimodal.
- GPU recomendadas por tramo: RTX 4090, RTX 3090, L40S o A6000 (48 GB) para Q4_K_M y superiores; RTX 4080, RTX 4070 Ti Super o A5000 (24 GB) para Q3_K_L e IQ4_XS; RTX 3060 12 GB, RTX 4070 o Tesla T4 para Q2_K y Q3_K_S; A100 40/80 GB o H100 para Q8_0 con contextos largos o varias sesiones concurrentes.
- Cabe en GPU de consumo: si. Q4_K_M (16,9 GB) entra en GPUs de 24 GB; Q3_K_M (13,4 GB) entra en GPUs de 16 GB; Q2_K (10,7 GB) entra en GPUs de 12 GB, aunque con degradacion de calidad perceptible.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, llama-cpp-python, text-generation-inference con soporte GGUF, y servidores compatibles con la API de OpenAI. El uso de vLLM no es directo con GGUF, salvo conversion previa a safetensors.
- Latencia y throughput estimados: no disponibles. No se han publicado mediciones de tokens por segundo para ninguna de las cuantizaciones.
- Nota sobre ejecucion parcial en CPU: las cuantizaciones Q2_K y Q3_K_S permiten escenarios de offload parcial con RAM del sistema, pero reducen drasticamente el throughput.

## Comparativa con modelos similares

No se dispone de datos de rendimiento verificables para establecer una comparativa funcional. La tabla siguiente compara unicamente caracteristicas objetivas del modelo base frente a la version cuantizada y sus variantes multimodales.

| Modelo / artefacto | Parametros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| Phonepadith/gemma4-26b-a4b-laos (base) | 25,2 mil millones | no disponible | apache-2.0 | safetensors (presumible) | en HuggingFace |
| mradermacher/gemma4-26b-a4b-laos-GGUF (este repo) | 25,2 mil millones | no disponible | apache-2.0 | GGUF, 11 cuantizaciones | en HuggingFace |
| mmproj-Q8_0 / mmproj-f16 (suplemento) | no aplica | no aplica | apache-2.0 | GGUF (proyector multimodal) | en el mismo repo |
| Otros modelos de ~25-27B comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

No se han identificado en la informacion proporcionada modelos alternativos concretos (por ejemplo, otras variantes de la familia Gemma, Llama o Mistral de tamano similar) con datos verificables de parametros, contexto o rendimiento.

## Limitaciones y advertencias

- Ausencia total de benchmarks: no hay evidencia publicada de calidad, por lo que no se puede recomendar su uso en produccion sin una evaluacion propia previa.
- Sesgos conocidos: no disponibles. Al desconocerse la composicion del dataset de entrenamiento, no se puede acotar el sesgo del modelo.
- Riesgo de alucinacion: no cuantificado. Al no haber evaluaciones publicadas, se debe asumir el riesgo habitual de los modelos generativos y verificar las salidas en aplicaciones criticas.
- Limitacion idiomatica: los metadatos declaran unicamente "en". El nombre del modelo sugiere un ajuste para lao, pero no hay confirmacion; no hay evidencia de soporte de castellano ni de otros idiomas.
- Limitacion de contexto: se desconoce la longitud de contexto nativa, lo que impide planificar casos de uso con documentos largos o conversaciones extensas.
- Cuantizaciones de baja precision: Q2_K y Q3_K_S degradan notablemente la calidad frente a Q4 o superior; la propia model card marca Q3_K_M como "lower quality" y recomienda Q4_K_S y Q4_K_M como opciones rapidas.
- Cuantizaciones ponderadas no disponibles: el autor indica que no ha publicado variantes weighted/imatrix, que suelen ofrecer mejor relacion calidad/tamano que las estaticas a igual tamano.
- Licencia: apache-2.0 permite uso comercial, modificacion y redistribucion, siempre que se conserve el aviso de licencia y se indiquen los cambios. Al ser una cuantizacion derivada, conviene verificar tambien los terminos del modelo base Phonepadith/gemma4-26b-a4b-laos.
- Procedencia de los pesos: se trata de una cuantizacion de terceros; el autor del repositorio no es el entrenador del modelo, por lo que la trazabilidad del entrenamiento depende del repositorio base.
- Adopcion nula: 0 descargas y 0 likes implican ausencia de validacion por parte de la comunidad en el momento de la consulta.
- Fechas de publicacion inusuales: la metadata indica creacion y actualizacion el 2026-09-16, dato que se reproduce tal cual figura en la fuente.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/gemma4-26b-a4b-laos-GGUF
- Modelo base: https://huggingface.co/Phonepadith/gemma4-26b-a4b-laos
- Pagina de descargas del autor: https://hf.tst.eu/model#gemma4-26b-a4b-laos-GGUF
- Guia de uso de GGUF de TheBloke: https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Solicitudes de cuantizacion del autor: https://huggingface.co/mradermacher/model_requests
- Grafico comparativo de perplejidad por tipo de cuantizacion: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Entidad responsable de la cuantizacion: https://www.nethype.de/
- Paper, blog o demo oficial del modelo: no disponible
