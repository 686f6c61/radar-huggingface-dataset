# mradermacher/sg-moe-dpo-v2-GGUF

## Resumen

`mradermacher/sg-moe-dpo-v2-GGUF` es la distribución en formato GGUF del modelo `AndyGulp/sg-moe-dpo-v2`, publicada por mradermacher (nethype GmbH), un autor conocido por convertir modelos de HuggingFace a cuantizaciones GGUF listas para llama.cpp. No se trata de un modelo original, sino de un artefacto de cuantización: el repositorio contiene los pesos del modelo base convertidos a 11 cuantizaciones estáticas distintas (desde Q2_K hasta Q8_0) para su ejecución en CPU y GPU con herramientas compatibles con GGUF.

El modelo base tiene 30.532.122.624 parámetros totales según los safetensors del autor original, lo que lo sitúa en la franja de ~30B. El nombre del repositorio indica una arquitectura de mezcla de expertos (MoE) y un ajuste posterior mediante DPO (Direct Preference Optimization), pero la model card no documenta ni el número de parámetros activos, ni el conjunto de datos de entrenamiento, ni la longitud de contexto. El modelo está etiquetado únicamente para inglés y como `conversational`.

La relevancia práctica de esta publicación es acotada pero clara: permite ejecutar un modelo de ~30B en hardware de consumo mediante cuantizaciones de 11,4 GB (Q2_K) a 32,6 GB (Q8_0), sin necesidad de infraestructura de servidor. Con 48 descargas y 0 likes en el momento de la ficha, es un artefacto de nicho, sin validación comunitaria significativa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE segun el nombre del repositorio; detalles no documentados en la model card (no disponible) |
| Parametros totales | 30.532.122.624 (~30,5B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0 (estaticas; sin imatrix ni quants ponderadas) |
| Idiomas soportados | en (ingles) |
| Licencia | no disponible |
| Formato de pesos | GGUF (repo de cuantizaciones); el modelo base se distribuye en safetensors |
| Modelo base | AndyGulp/sg-moe-dpo-v2 |
| Tamano del repositorio | 208,1 GB |
| Tag de pipeline | no disponible (etiquetas: transformers, gguf, conversational, endpoints_compatible) |
| Fecha de creacion / actualizacion | 2025-12-05 / 2026-10-24 |

## Arquitectura y entrenamiento

La informacion disponible no describe la arquitectura interna del modelo base. El nombre `sg-moe-dpo-v2` sugiere una mezcla de expertos (MoE) sometida a un ajuste de preferencias con DPO en su segunda version, pero la model card de la cuantizacion no incluye ningun detalle sobre numero de expertos, funcion de routing, dimension del hidden state, mecanismo de atencion ni numero de capas. Tampoco se documenta la longitud de contexto nativa, un dato critico para planificar el uso en produccion. Cualquier afirmacion al respecto requeriria consultar el repositorio del modelo base o su `config.json`, que no forman parte de la informacion proporcionada.

En cuanto al entrenamiento, no hay datos sobre volumen de tokens, composicion del corpus, uso de RLHF/DPO (mas alla de lo que indica el nombre) ni innovaciones tecnicas. La unica informacion aportada por el autor de la cuantizacion es de caracter operativo: las cuantizaciones son estaticas, generadas con `convert_type: hf` y `output_tensor_quantised: 1`, y no se han publicado variantes ponderadas con matriz de importancia (imatrix) para este modelo concreto.

## Capacidades

- Generacion de texto conversacional en ingles: el modelo esta etiquetado como `conversational` y ajustado presumiblemente con DPO, lo que orienta su uso a dialogos multi-turno.
- Razonamiento y generacion de contenido general: capacidad esperable por tamano (~30B), aunque no hay evaluaciones publicadas que la cuantifiquen.
- Ejecucion local en CPU/GPU mediante llama.cpp y ecosistema GGUF, con 11 niveles de cuantizacion que permiten ajustar el equilibrio calidad/memoria.
- Compatibilidad declarada con endpoints (`endpoints_compatible`): puede servirse detras de APIs compatibles con el formato de HuggingFace/OpenAI en funcion del servidor elegido.
- Soporte de tool calling / function calling: no documentado; requiere validacion empirica.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multimodales (vision, audio): no disponibles.
- Capacidades multilingues: limitadas al ingles segun los metadatos.
- Modo "thinking" o razonamiento extendido: no documentado.

## Casos de uso

- Asistente conversacional en ingles para atencion al cliente: el ajuste DPO y la etiqueta `conversational` lo orientan a respuestas alineadas con preferencias humanas; desplegado con Q4_K_M (18,7 GB) en una GPU de 24 GB permite servir conversaciones multi-turno sin depender de APIs externas. Requiere validar antes la longitud de contexto real.
- Prototipado e investigacion de tecnicas DPO/MoE: el acceso a 11 cuantizaciones distintas del mismo checkpoint permite estudiar la degradacion de calidad por nivel de cuantizacion en un modelo de ~30B con una sola GPU de consumo.
- Generacion de texto y redaccion asistida en entornos con requisitos de soberania del dato: al ejecutarse integramente en local con llama.cpp, el texto no sale de la infraestructura propia, lo que resulta adecuado para borradores internos y documentacion no sensible.
- Resumen y reformulacion de documentos en ingles: con Q5_K_M o Q6_K (21,8-25,2 GB) se obtiene una calidad proxima a la del modelo original, util para pipelines batch de resumen nocturno en una unica RTX 4090 o A6000.
- Evaluacion comparativa de cuantizaciones en pipelines de CI: el repositorio incluye ficheros de todos los niveles, lo que permite automatizar tests de regresion de calidad entre Q4_K_S y Q8_0 sobre el mismo prompt set.
- Base para ajuste fino ligero (LoRA/QLoRA) sobre GGUF: tecnicamente posible con `llama.cpp` o `unsloth` en el caso de partir del modelo base en safetensors; el repositorio GGUF en si no es el punto de partida ideal, pero sirve para evaluar el comportamiento antes de invertir en entrenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Ni la model card del autor de la cuantizacion ni los metadatos del repositorio incluyen puntuaciones de MMLU, HumanEval, GSM8K, MT-Bench ni de ninguna otra evaluacion. Tampoco se aportan mediciones de perplexidad por nivel de cuantizacion para este modelo concreto (el autor enlaza un grafico generico comparativo de tipos de cuantizacion, no especifico de este checkpoint).

## Requisitos de hardware

- VRAM estimada para inferencia con offload completo en GPU: aproximadamente el tamano del fichero GGUF mas 1-3 GB de cache KV y overhead del runtime (la cache depende del contexto efectivo, que no esta documentado).
- Q2_K (11,4 GB): cabe en GPUs de 12 GB (RTX 3060 12 GB, RTX 4070) y en 16 GB con margen amplio.
- Q3_K_M / Q3_K_L (14,8-16,0 GB): ajustado en 16 GB; recomendable 24 GB.
- IQ4_XS / Q4_K_S / Q4_K_M (16,7-18,7 GB): encajan en 24 GB (RTX 3090, RTX 4090, A10G, L4), dejando espacio para contexto moderado.
- Q5_K_S / Q5_K_M (21,2-21,8 GB): 24 GB al limite; mejor 32 GB (V100 32 GB, A100 40 GB) o reparto GPU+CPU.
- Q6_K (25,2 GB): requiere 32 GB o superior; en 24 GB obliga a offload parcial a RAM.
- Q8_0 (32,6 GB): A100 40 GB, 2x RTX 4090 (48 GB) o A6000 Ada 48 GB.
- Opciones de despliegue: llama.cpp (CLI y servidor), Ollama, LM Studio, llama-cpp-python, text-generation-webui. vLLM y TGI admiten GGUF de forma experimental/parcial; para produccion con concurrencia alta conviene validar el soporte antes de comprometerse.
- Latencia y throughput: no disponibles. No hay mediciones publicadas de tokens/s para ninguna de las cuantizaciones.
- Nota: con arquitectura MoE, el rendimiento depende del numero de parametros activos por token, dato que no se ha publicado; las estimaciones de velocidad no pueden derivarse del total de parametros.

## Comparativa con modelos similares

La informacion proporcionada no incluye datos de rendimiento ni especificaciones de modelos alternativos de la misma categoria, por lo que no es posible establecer una comparativa cuantitativa fiable. La unica comparacion documentable es con el propio modelo base:

| Modelo | Parametros | Formato | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| mradermacher/sg-moe-dpo-v2-GGUF | 30,5B | GGUF (11 cuantizaciones) | no disponible | no disponible | Objeto de esta ficha; ejecutable en local |
| AndyGulp/sg-moe-dpo-v2 | 30,5B | safetensors | no disponible | no disponible | Modelo base sin cuantizar; autor original |
| Alternativas de ~30B MoE | no disponible | no disponible | no disponible | no disponible | Sin datos en la informacion proporcionada |

## Limitaciones y advertencias

- Licencia no especificada: sin licencia declarada no se puede asumir permiso para uso comercial. Es imprescindible contactar con el autor del modelo base (`AndyGulp`) antes de cualquier despliegue productivo.
- Idiomas: solo ingles segun los metadatos; el rendimiento en castellano no esta evaluado y previsiblemente sera deficiente.
- Contexto desconocido: al no documentarse la longitud de contexto, planificar aplicaciones con ventanas largas es arriesgado; hay que medirlo empiricamente.
- Riesgo de alucinacion: inherente a los modelos generativos de esta escala; no hay evaluaciones de factualidad ni de tasa de alucinacion publicadas.
- Sesgos: no hay informacion sobre composicion del dataset ni sobre procesos de mitigacion de sesgos; se debe asumir el riesgo habitual de los modelos entrenados con corpus web en ingles.
- Sin validacion comunitaria: 48 descargas y 0 likes indican practicamente nula adopcion; no existen reportes independientes de calidad ni de problemas.
- Cuantizaciones estaticas sin imatrix: el propio autor advierte de que no hay quants ponderadas para este modelo, lo que implica una perdida de calidad algo mayor en los niveles bajos (Q2_K, Q3_K_S) frente a alternativas con imatrix.
- Q3_K_M marcada por el autor como "lower quality": no recomendada cuando exista margen de memoria para Q4_K_S o IQ4_XS.
- Modelo base de origen no verificado: `AndyGulp/sg-moe-dpo-v2` no cuenta con documentacion publica en la informacion disponible, lo que impide auditar el linaje de los datos de entrenamiento.
- Repositorio de 208,1 GB: descargar el conjunto completo de cuantizaciones es innecesario; conviene bajar solo el fichero GGUF requerido.

## Enlaces

- Repositorio HuggingFace (esta cuantizacion): https://huggingface.co/mradermacher/sg-moe-dpo-v2-GGUF
- Modelo base: https://huggingface.co/AndyGulp/sg-moe-dpo-v2
- Pagina de descarga y vision general del autor: https://hf.tst.eu/model#sg-moe-dpo-v2-GGUF
- Peticiones de cuantizacion y FAQ del autor: https://huggingface.co/mradermacher/model_requests
- Guia de uso de ficheros GGUF y concatenacion multi-parte (referencia de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico comparativo de tipos de cuantizacion (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas sobre cuantizacion de Artefact2: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- nethype GmbH (empresa del autor): https://www.nethype.de/
