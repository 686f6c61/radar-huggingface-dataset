# mradermacher/Piccolo-27B-VL-1108-GGUF

## Resumen

Piccolo-27B-VL-1108-GGUF es la distribucion en formato GGUF del modelo multimodal Piccolo-27B-VL-1108, desarrollado originalmente por AgentScope (agentscope-ai) y cuantizado por mradermacher. Se trata de un modelo de lenguaje y vision de aproximadamente 27.320 millones de parametros (27,3B) que combina un backbone de lenguaje con un proyector multimodal (mmproj), lo que permite procesar tanto texto como imagenes dentro de una misma ventana de contexto. La licencia Apache 2.0 y la disponibilidad de cuantizaciones estaticas lo hacen apto para despliegues locales y entornos de produccion sin restricciones comerciales adicionales.

La relevancia de esta ficha radica en que el repositorio original del modelo base y el repositorio GGUF contienen informacion tecnica muy limitada: no se publican detalles de arquitectura interna, datos de entrenamiento ni resultados de benchmarks. La cuantizacion de mradermacher incluye el proyector multimodal en dos precisiones (Q8_0 y f16) y ofrece un abanico de cuantizaciones K-quant desde Q2_K hasta Q8_0, lo que permite ajustar el modelo a distintos presupuestos de VRAM, desde aproximadamente 11 GB hasta 29 GB.

El modelo esta etiquetado unicamente para ingles, aunque al tratarse de una cuantizacion de un modelo multimodal de 27B es probable que conserve capacidades multilingues parciales del modelo base; sin embargo, no hay datos publicados que lo confirmen. Esta ficha documenta exclusivamente lo que consta en la informacion disponible y marca como "no disponible" todo aquello que el autor no ha publicado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (backbone de lenguaje + proyector mmproj); detalles internos no disponibles |
| Parametros totales | 27.320.697.856 (27,3B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0; mmproj en Q8_0 y f16 |
| Idiomas soportados | en (segun la model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizaciones estaticas) y safetensors en el modelo base |
| Tamano del repo | 190,8 GB |
| Fecha de creacion | 2026-11-08 |

## Arquitectura y entrenamiento

No se dispone de informacion publicada sobre la arquitectura interna del modelo base Piccolo-27B-VL-1108. Por el nombre y por la presencia de un fichero mmproj separado en el repositorio GGUF, se trata de un modelo multimodal que combina un modelo de lenguaje con un proyector de vision, siguiendo el patron habitual de los modelos vision-language empaquetados para llama.cpp. El recuento real de parametros en safetensors es de 27.320.697.856, lo que confirma que el backbone de lenguaje ronda los 27B parametros.

Tampoco se han publicado datos sobre el numero de tokens de entrenamiento, la composicion del dataset, el uso de RLHF/DPO ni innovaciones tecnicas especificas (atencion lineal, decodificacion especulativa, etc.). La model card del repositorio GGUF es una plantilla estandar de mradermacher que solo documenta el proceso de cuantizacion: cuantizaciones estaticas, sin cuantizaciones ponderadas/imatrix disponibles en el momento de la publicacion, y conversion de tipo hf. Cualquier afirmacion sobre el entrenamiento del modelo base seria especulativa y, por tanto, se omite.

## Capacidades

- Generacion de texto conversacional: el tag "conversational" y la categoria "endpoints_compatible" indican que el modelo esta pensado para dialogos multi-turno.
- Procesamiento de vision: la presencia del fichero mmproj (Q8_0 y f16) confirma capacidad de entrada de imagenes junto con texto.
- Razonamiento y generacion de codigo: no confirmado explicitamente en la informacion disponible; se desconoce si el modelo base fue entrenado con datos de codigo o matematicas.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: el desarrollador (AgentScope) esta orientado a agentes, pero no se documenta ninguna capacidad especifica de agenting en la model card.
- Capacidades multilingues: la model card declara unicamente ingles; no hay evidencia de soporte de otros idiomas.
- Modo thinking, audio u otras capacidades especiales: no disponible.

## Casos de uso

- Analisis de documentos con imagenes: el modelo puede recibir capturas, diagramas o paginas escaneadas junto con una pregunta en texto y devolver una descripcion o extraccion de informacion, gracias al proyector multimodal mmproj.
- Asistentes conversacionales locales: con cuantizaciones Q4_K_M (16,9 GB) o Q5_K_M (19,6 GB) puede desplegarse en una estacion de trabajo con una sola GPU de 24 GB para dialogos multi-turno sin depender de la nube.
- Descripcion y etiquetado de imagenes a escala: integrado en pipelines de procesamiento por lotes con llama.cpp, puede generar descripciones y metadatos para catalogos de imagenes.
- Prototipado de agentes con AgentScope: al proceder del ecosistema agentscope-ai, es un candidato natural para experimentar con flujos de agentes que combinen texto e imagen en local.
- Investigacion sobre cuantizacion multimodal: la disponibilidad de 11 cuantizaciones distintas (de Q2_K a Q8_0) permite estudiar el impacto de la precision en tareas vision-language.
- Despliegue en entornos con requisitos de soberania del dato: la licencia Apache 2.0 y la ejecucion local con llama.cpp permiten procesar imagenes y texto sensibles sin salida a servicios externos.
- Educacion y demostraciones: las cuantizaciones Q2_K (11,0 GB) y Q3_K_S (12,4 GB) permiten ejecutar el modelo en GPUs de consumo de gama alta con 12-16 GB de VRAM, aunque con perdida de calidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Ni la model card del repositorio GGUF ni los resultados de busqueda web incluyen cifras de MMLU, HumanEval, GSM8K, MMMU u otras evaluaciones, ni comparaciones con modelos similares.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos del modelo de lenguaje, sin contar KV cache ni mmproj):
  - Q2_K: 11,0 GB
  - Q3_K_S: 12,4 GB
  - Q3_K_M: 13,6 GB
  - Q3_K_L: 14,7 GB
  - IQ4_XS: 15,5 GB
  - Q4_K_S: 15,9 GB
  - Q4_K_M: 16,9 GB
  - Q5_K_S: 19,1 GB
  - Q5_K_M: 19,6 GB
  - Q6_K: 22,5 GB
  - Q8_0: 29,1 GB
- Proyector multimodal adicional: mmproj-Q8_0 (0,7 GB) o mmproj-f16 (1,0 GB).
- GPU recomendadas: para Q4_K_M o Q5_K_M, una RTX 4090 (24 GB) o RTX 3090 (24 GB) es suficiente; para Q6_K y Q8_0 se recomienda A100 40 GB, H100 o RTX 6000 Ada (48 GB).
- Cabe en GPU de consumo: si, en Q2_K a Q4_K_M en GPUs de 12-16 GB (con riesgo de calidad en las cuantizaciones mas bajas) y en Q5_K_M/Q6_K en GPUs de 24 GB.
- Opciones de despliegue: llama.cpp y sus derivados (Ollama, LM Studio, llama-cpp-python); el tag "endpoints_compatible" sugiere compatibilidad con endpoints tipo OpenAI. No se documenta soporte de vLLM o TGI para este formato GGUF.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de rendimiento del modelo, por lo que la comparativa se limita a caracteristicas estructurales. Los resultados de busqueda solo referencian el repositorio GGUF hermano (mradermacher/Piccolo-27B-VL-GGUF) y el modelo base (agentscope-ai/Piccolo-27B-VL), sin alternativas comparables documentadas.

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Piccolo-27B-VL-1108 (este) | 27,3B | no disponible | Apache 2.0 | GGUF, safetensors | Multimodal, solo ingles declarado |
| Piccolo-27B-VL (base) | 27B (segun nombre; la busqueda indica 3B, dato no fiable) | no disponible | Apache 2.0 | safetensors | Modelo original de AgentScope |
| Alternativas de 27B multimodal | no disponible | no disponible | no disponible | no disponible | Sin datos en la informacion proporcionada |

## Limitaciones y advertencias

- Sesgos conocidos: no documentados; al no publicarse la composicion del dataset de entrenamiento, no es posible evaluar sesgos de genero, raza o idioma.
- Riesgo de alucinacion: no cuantificado; como en cualquier modelo generativo de 27B sin benchmarks publicados, se recomienda validacion humana en produccion.
- Limitaciones de contexto e idioma: la model card declara unicamente ingles; el uso en castellano no esta garantizado y la longitud de contexto es desconocida.
- Restricciones de licencia: Apache 2.0 permite uso comercial, modificacion y redistribucion con atribucion; no se identifican restricciones adicionales en la informacion disponible.
- Cuantizaciones bajas: Q2_K y Q3_K_S degradan la calidad de forma notable segun la grafica de perplejidad referenciada por mradermacher; para produccion se recomienda Q4_K_M o superior.
- Ausencia de cuantizaciones imatrix/ponderadas: el autor indica que no estan disponibles en el momento de la publicacion, lo que limita la calidad de las cuantizaciones de baja precision.
- Falta de benchmarks: no hay evidencia publicada de rendimiento que permita comparar con alternativas; cualquier decision de adopcion deberia basarse en evaluacion propia.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: ecosistema de validacion practicamente inexistente.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Piccolo-27B-VL-1108-GGUF
- Modelo base: https://huggingface.co/agentscope-ai/Piccolo-27B-VL-1108
- Repositorio GGUF hermano: https://huggingface.co/mradermacher/Piccolo-27B-VL-GGUF
- Modelo base (variante): https://huggingface.co/agentscope-ai/Piccolo-27B-VL
- Pagina de descargas de mradermacher: https://hf.tst.eu/model#Piccolo-27B-VL-1108-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafica de perplejidad de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas sobre cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Solicitudes de cuantizacion de mradermacher: https://huggingface.co/mradermacher/model_requests
