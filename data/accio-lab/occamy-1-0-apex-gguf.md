# Accio-Lab/occamy-1.0-APEX-GGUF

## Resumen

Occamy-1.0 APEX GGUF es el conjunto de versiones cuantizadas del modelo multimodal Occamy-1.0, publicado por Accio-Lab. No se trata de un modelo nuevo entrenado desde cero, sino de siete perfiles GGUF generados a partir de la misma fuente BF16, utilizando los perfiles de cuantización APEX del equipo de LocalAI. El objetivo es permitir el despliegue del modelo en hardware de gama de consumo manteniendo el mayor parecido posible con la referencia BF16, con tamanos de fichero que van de 13,47 GB (I-Mini) a 25,34 GB (Balanced).

El modelo base es `Accio-Lab/occamy-1.0`, con 34.660.610.688 parametros (unos 34,66 mil millones) y una arquitectura de mezcla de expertos (MoE) asociada a la familia Qwen3.5 MoE, segun las etiquetas del repositorio. La cuantizacion APEX no aplica un ancho de bits uniforme: asigna precision distinta a expertos enrutados, expertos compartidos y proyecciones de atencion/SSM, y ademas varia por posicion de capa dentro de las 40 capas del modelo. El pipeline declarado es `image-text-to-text`, por lo que admite entrada de texto e imagen mediante un proyector multimodal separado.

La relevancia de esta publicacion es practica: ofrece una via documentada para ejecutar un MoE multimodal de ~35B en `llama.cpp` con perfiles calibrados y con datos de validacion medidos (casos funcionales y perplejidad sobre un subconjunto de WikiText) frente al modelo BF16 original. La licencia Apache 2.0 facilita el uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mezcla de expertos (MoE) vinculada a Qwen3.5 MoE; la asignacion de precision distingue expertos enrutados, expertos compartidos y proyecciones de atencion/SSM, en 40 capas |
| Parametros totales | 34.660.610.688 (~34,66 mil millones) segun los pesos safetensors del modelo base |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (el ejemplo de `llama.cpp` usa `-c 8192` como ajuste de ejecucion, no como limite declarado del modelo) |
| Tipos de cuantizacion | GGUF de precision mixta: Q4_K, Q3_K, Q5_K, Q6_K, Q8_0, IQ4_XS, IQ2_S, con recetas base Q4_K_M, Q6_K o Q3_K_M segun perfil |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (la fuente BF16 esta en safetensors); proyector multimodal en GGUF F16, fichero aparte de 899.282.944 bytes |

Perfiles disponibles y tamano exacto del fichero de pesos:

| Perfil | Bytes exactos | GB | GiB |
|---|---:|---:|---:|
| Compact | 16.538.851.072 | 16,54 | 15,403 |
| Quality | 22.819.401.472 | 22,82 | 21,252 |
| Balanced | 25.335.983.872 | 25,34 | 23,596 |
| I-Compact | 16.538.851.360 | 16,54 | 15,403 |
| I-Quality | 22.819.401.760 | 22,82 | 21,252 |
| I-Balanced | 25.335.984.160 | 25,34 | 23,596 |
| I-Mini | 13.467.210.784 | 13,47 | 12,542 |

## Arquitectura y entrenamiento

No se describe en la informacion proporcionada ningun proceso de entrenamiento propio de esta publicacion: se trata de una cuantizacion. El modelo de partida, `Accio-Lab/occamy-1.0`, se corresponde con una arquitectura de mezcla de expertos de la familia Qwen3.5 MoE, con 40 capas, y con un componente multimodal para entrada de imagen y texto. La model card cita el articulo arXiv:2609.11977 como referencia tecnica del modelo.

La innovacion tecnica de esta publicacion es el esquema APEX (del equipo de LocalAI), que reparte la precision por rol de tensor y por posicion de capa en lugar de aplicar un unico ancho de bits. En los perfiles documentados, los expertos enrutados reciben Q4_K en las capas 0-4 y 35-39, Q3_K en las capas 5-34 (Compact) o combinaciones de Q6_K, Q5_K e IQ4_XS (Quality y Balanced); los expertos compartidos suben a Q6_K o Q8_0; y las proyecciones de atencion/SSM usan Q4_K o Q6_K. Los perfiles con prefijo `I-` aplican exactamente la misma asignacion pero con una matriz de importancia validada (calibracion); I-Mini emplea el perfil `mini` del proyecto, que exige calibracion y baja a IQ2_S en las capas centrales. Los tensores de embeddings, salida y aquellos fuera de las reglas del perfil siguen la receta base del cuantizador fijado (Q4_K_M en Compact e I-Compact; Q6_K en Quality, Balanced y sus variantes I; Q3_K_M en I-Mini). Los tipos reales de cada tensor quedan registrados en `validation/summary.json`, y la propia model card insiste en que es precision mixta, no un ancho de bits uniforme.

## Capacidades

- Generacion de texto conversacional, con plantilla de chat compatible con el formato de `qwen2` a nivel de pre-tokenizador.
- Razonamiento con modo de pensamiento conmutable mediante `chat_template_kwargs.enable_thinking` en la API compatible con OpenAI de `llama-server`.
- Uso de herramientas (tool use / function calling), segun la etiqueta `tool-use` del repositorio y el tag `endpoints_compatible`.
- Entrada multimodal de imagen y texto (`image-text-to-text`), previa carga del proyector `mmproj-occamy-1.0-F16.gguf`. La model card advierte de que la inferencia de imagen no se volvio a probar en esta release APEX.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Capacidad especial: modo de razonamiento explicito activable o desactivable por peticion, util para separar respuestas rapidas de respuestas con cadena de pensamiento.

## Casos de uso

- Asistente conversacional autoalojado: con los perfiles I-Mini o Compact, el modelo cabe en una GPU de 24 GB y puede servir chat multi-turno a traves del endpoint `/v1/chat/completions` de `llama-server`, sin enviar datos a terceros.
- Agente con herramientas en produccion: la etiqueta `tool-use` y la compatibilidad con endpoints permiten conectarlo a funciones externas (busqueda, calculo, APIs internas) y construir bucles de varios pasos sobre la API compatible con OpenAI.
- Analisis de documentos con imagen: el pipeline `image-text-to-text` y el proyector F16 permiten procesar capturas, diagramas o paginas escaneadas junto a instrucciones de texto, siempre que se valide el perfil de cuantizacion elegido.
- Despliegue en estaciones de trabajo sin GPU de datacenter: con I-Mini (12,542 GiB de pesos) el modelo entra en GPUs de 16 GB y en configuraciones con offload parcial a CPU, lo que abarata la puesta en marcha de entornos de desarrollo.
- Generacion de codigo asistida en entornos con requisitos de soberania del dato: al ejecutarse en local con `llama.cpp`, se puede integrar en pipelines de CI/CD o en plugins de IDE sin exponer el codigo a servicios externos.
- Evaluacion comparativa de tecnicas de cuantizacion: los siete perfiles, generados desde la misma fuente BF16 y con datos de validacion publicados, sirven como banco de pruebas para medir el impacto de la precision mixta en perplejidad y en tareas funcionales.
- Razonamiento por etapas en tareas de analisis: activando `enable_thinking` se puede forzar una cadena de razonamiento antes de la respuesta final, util para depuracion de prompts y para tareas de clasificacion o extraccion con criterios complejos.
- Servicio interno con multiples usuarios secuenciales: el comando de referencia usa `-np 1` y `-fa on` (flash attention), de modo que el perfil Balanced o Quality en una A100 o H100 permite atender peticiones con contexto mas largo que en las variantes compactas.

## Benchmarks y rendimiento

La model card solo publica dos metricas de validacion: casos funcionales autorales (sobre 20) y perplejidad sobre un subconjunto de WikiText (menor es mejor), con protocolo identico entre variantes.

| Modelo | Casos funcionales | Perplejidad WikiText (subconjunto) |
|---|---:|---:|
| BF16 | 19/20 | 8,2963 +/- 0,36372 |
| APEX-Compact | 20/20 | 8,4567 +/- 0,36569 |
| APEX-Quality | 19/20 | 8,2568 +/- 0,36068 |
| APEX-Balanced | 19/20 | 8,2994 +/- 0,36385 |
| APEX-I-Compact | 19/20 | 8,5074 +/- 0,37314 |
| APEX-I-Quality | 19/20 | 8,3743 +/- 0,36829 |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni de otros benchmarks estandar en la informacion disponible. Tampoco hay datos de los perfiles I-Balanced e I-Mini en las tablas de validacion proporcionadas.

## Requisitos de hardware

- VRAM estimada para inferencia: los tamanos indicados son los del fichero de pesos, no el pico de memoria. La propia model card avisa de que hay que anadir memoria para el runtime, el contexto y la entrada de imagen. Como referencia orientativa, I-Mini parte de 12,5 GiB de pesos, Compact e I-Compact de 15,4 GiB, Quality e I-Quality de 21,25 GiB, y Balanced e I-Balanced de 23,6 GiB.
- GPU de gama de consumo: I-Mini y Compact caben en tarjetas de 24 GB (RTX 3090, RTX 4090) con margen para contexto moderado. Quality e I-Quality, con 21,25 GiB de pesos, dejan muy poco espacio para cache KV en 24 GB, por lo que en la practica requieren 32 GB o mas (por ejemplo RTX 5090) o reparto entre dos GPU.
- GPU profesionales: A100 de 40 GB y 80 GB, H100 de 80 GB y L40S de 48 GB permiten ejecutar cualquier perfil, incluido Balanced, con contexto amplio o con el proyector de vision cargado en paralelo.
- Vision: el proyector ocupa 899.282.944 bytes adicionales (unos 0,84 GiB) y debe descargarse aparte.
- Opciones de despliegue: `llama.cpp` es la ruta validada, con la revision `972d2313bc0bf0a45f634f77d95c9fb03aeab12c` y soporte de Qwen3.5 MoE; el comando de referencia es `llama-server -ngl 999 -c 8192 -np 1 -fa on --jinja`. Al ser GGUF, tambien es compatible con ejecutores basados en `llama.cpp` como Ollama o LM Studio. Para vLLM no se documenta soporte de estos ficheros en la informacion disponible.
- Latencia y throughput: no disponibles.
- Nota operativa: se recomienda servir ficheros con `endpoints_compatible` y normalizar la entrada a NFC, ya que los ficheros almacenan metadatos de pre-tokenizador `qwen2` compatibles con la fuente; existen instrucciones especificas en el documento TOKENIZER del repositorio GGUF.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| occamy-1.0-APEX-GGUF (este repositorio) | 34,66 mil millones (totales) | no disponible | GGUF, 7 perfiles de 13,47 a 25,34 GB | Apache 2.0 | Publicado; 0 descargas y 0 likes en el momento de la consulta |
| occamy-1.0 (BF16, modelo base) | 34,66 mil millones | no disponible | safetensors | Apache 2.0 | Publicado por Accio-Lab |
| occamy-1.0-GGUF | no disponible | no disponible | GGUF, incluye proyector F16 | no disponible | Publicado por Accio-Lab; es el repositorio de donde procede el `mmproj` |

No se dispone de datos verificados en la informacion proporcionada sobre otros modelos abiertos comparables de tamano similar, por lo que no se incluye comparacion con alternativas externas.

## Limitaciones y advertencias

- La cuantizacion introduce perdida de calidad. La perplejidad del perfil I-Compact (8,5074) es claramente superior a la del BF16 (8,2963), y el perfil Compact obtiene 20/20 en casos funcionales pero peor perplejidad. La eleccion de perfil debe validarse con el caso de uso real.
- La inferencia de imagen no se volvio a probar en esta release APEX; funciona con el proyector F16 del repositorio GGUF, pero no hay validacion publicada para estas cuantizaciones.
- Los perfiles con prefijo `I-` dependen de una matriz de importancia calibrada, por lo que su comportamiento puede diferir del de los perfiles planos con la misma asignacion de precision.
- Los tamanos de fichero no equivalen al pico de memoria: hay que reservar VRAM adicional para runtime, cache KV y entrada de imagen. Ejecutar Quality en 24 GB puede provocar desbordamiento a CPU y caidas fuertes de rendimiento.
- Riesgo de alucinacion: no se documentan evaluaciones de veracidad ni de tasa de alucinacion en la informacion disponible.
- Idiomas soportados: no disponibles. No se puede confirmar el rendimiento en castellano ni en otros idiomas distintos del ingles.
- Sesgos conocidos: no disponibles.
- Requisitos tecnicos de ejecucion: es necesaria una version reciente de `llama.cpp` con soporte de Qwen3.5 MoE y la normalizacion NFC de la entrada; el uso de builds antiguos puede producir resultados incorrectos.
- Licencia Apache 2.0: permite uso comercial y modificacion, con obligacion de conservar avisos de licencia y atribucion. No se declaran restricciones adicionales.
- El repositorio tiene 143,0 GB de tamano total y 0 descargas en el momento de la consulta, por lo que la validacion por parte de la comunidad es practicamente inexistente.
- Las fechas de creacion (2026-10-02) y el identificador arXiv:2609.11977 proceden de la informacion proporcionada al elaborar esta ficha.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Accio-Lab/occamy-1.0-APEX-GGUF
- Modelo base: https://huggingface.co/Accio-Lab/occamy-1.0
- Repositorio GGUF asociado (proyector multimodal): https://huggingface.co/Accio-Lab/occamy-1.0-GGUF
- Proyector `mmproj-occamy-1.0-F16.gguf`: https://huggingface.co/Accio-Lab/occamy-1.0-GGUF/resolve/main/mmproj-occamy-1.0-F16.gguf?download=true
- Protocolo del tokenizador: https://huggingface.co/Accio-Lab/occamy-1.0-GGUF/blob/main/TOKENIZER.md
- Coleccion Occamy-1.0: https://huggingface.co/collections/Accio-Lab/occamy-10-6ac00729659e8a86ec11e216
- Explorador de checkpoints: https://huggingface.co/spaces/Accio-Lab/Occamy-Explorer
- Sitio del proyecto: https://accio-lab.github.io/occamy/
- Articulo: https://arxiv.org/abs/2609.11977
- Perfiles APEX (equipo de LocalAI): https://github.com/localai-org/apex-quant
