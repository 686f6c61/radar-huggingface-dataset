# mradermacher/Red-Squadron-8x22B-v1-GGUF

## Resumen

Red-Squadron-8x22B-v1-GGUF es la distribucion en formato GGUF del modelo Red-Squadron-8x22B-v1, un fine-tune publicado por TheDrummer sobre una base de tipo Mixture-of-Experts de 8 expertos y 22.000 millones de parametros por experto (la nomenclatura "8x22B" es la habitual de la familia Mixtral de Mistral AI). Esta ficha concreta no contiene el modelo original, sino las cuantizaciones estaticas generadas por mradermacher para su uso con llama.cpp y derivados.

El interes practico del repositorio es permitir ejecutar un modelo de gran tamano en infraestructura local mediante cuantizacion, con ficheros divididos en partes de 2 a 4 fragmentos que van desde 52,2 GB (Q2_K) hasta 149,5 GB (Q8_0). Al tratarse de un fine-tune orientado a generacion creativa y rol (Red-Squadron), el modelo esta pensado para conversacion y escritura, no para tareas de razonamiento verificable.

La relevancia actual es limitada: el repositorio registra 0 descargas y 0 likes en el momento de la consulta, la model card del cuantizador no aporta informacion sobre entrenamiento ni evaluacion, y el modelo base no documenta licencia en los metadatos disponibles. Es, por tanto, un artefacto de nicho dentro del ecosistema GGUF, util solo para quien ya conoce el modelo original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (la nomenclatura 8x22B sugiere Mixture-of-Experts con 8 expertos, no confirmado en la informacion proporcionada) |
| Parametros totales | no disponible (el nombre indica 8x22B; el total agregado no esta documentado) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0 (estaticas); variantes imatrix/weighted en repositorio separado |
| Idiomas soportados | en |
| Licencia | no disponible |
| Formato de pesos | GGUF (ficheros multiparte: 2, 3 o 4 fragmentos segun la cuantizacion) |

## Arquitectura y entrenamiento

La informacion disponible no describe la arquitectura interna del modelo base TheDrummer/Red-Squadron-8x22B-v1. El identificador "8x22B" sigue la convencion de nombres de los modelos MoE de la familia Mixtral, lo que sugiere una arquitectura transformer con capa de mezcla de expertos dispersa, pero este extremo no se confirma en la model card proporcionada. Tampoco se documentan el numero de tokens de entrenamiento, la composicion del dataset, ni si hubo etapas de RLHF, DPO o SFT.

El repositorio de mradermacher no aporta informacion adicional sobre entrenamiento: se limita a declarar que son "static quants" del modelo de TheDrummer, generados con convert_type hf y quantize_version 2. Las cuantizaciones ponderadas con imatrix se publican en un repositorio aparte (Red-Squadron-8x22B-v1-i1-GGUF), lo que indica que el autor ofrece ambas variantes, pero no se detalla el corpus de calibracion usado.

## Capacidades

- Generacion de texto en ingles, orientada presumiblemente a conversacion y escritura creativa por el perfil del fine-tune (no confirmado en la informacion disponible).
- Ejecucion local mediante llama.cpp y derivados gracias al formato GGUF.
- Soporte de ficheros multiparte para cuantizaciones de gran tamano.
- No se documenta soporte de tool calling, function calling, agentes, vision, audio ni modo de razonamiento explicito.
- Capacidades multilingues: solo se declara ingles.

## Casos de uso

- Despliegue local en estaciones de trabajo con GPU de gran memoria: usar Q4_K_M (85,7 GB) o Q5_K_M (100,1 GB) en configuraciones con varias GPU para servir un modelo de gran tamano sin dependencia de API externa.
- Experimentacion con cuantizacion: comparar calidad entre Q2_K, IQ4_XS y Q8_0 sobre el mismo modelo para estudiar el impacto de la cuantizacion en la perplexidad, usando la grafica de ikawrakow referenciada en la model card.
- Generacion creativa en ingles: emplear el modelo para escritura de ficcion, roleplay o narrativa, que es el uso tipico de los fine-tunes de TheDrummer, siempre que se valide la calidad con evaluacion propia.
- Investigacion sobre modelos MoE de gran tamano: analizar el comportamiento de un 8x22B cuantizado en tareas de generacion libre y medir latencia y throughput en hardware concreto.
- Archivado y replicabilidad: conservar las cuantizaciones multiparte para reproducir experimentos pasados con un checkpoint fijo, dado que el repositorio no recibe actualizaciones de contenido funcional.
- Pruebas de integracion con llama.cpp: validar la concatenacion de ficheros multiparte y el cargador GGUF en pipelines internos de evaluacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente igual al tamano del fichero GGUF mas overhead de contexto. Q2_K ronda 52 GB, Q4_K_M 86 GB, Q8_0 150 GB.
- GPU recomendadas: para Q4_K_M se necesitan al menos dos GPU de 48 GB (A6000, L40S, A100 40/80 GB) o una H100 80 GB con margen ajustado; para Q8_0 hacen falta varias A100/H100 80 GB.
- No cabe en GPU consumer: ni RTX 4090 (24 GB) ni RTX 3090 (24 GB) pueden alojar ninguna de las cuantizaciones publicadas. Seria necesario repartir entre GPU y RAM del sistema (offloading parcial), con caida severa de throughput.
- Opciones de despliegue: llama.cpp y frontends compatibles (Ollama, llama-cpp-python, LM Studio) para GGUF; vLLM y TGI no son el formato nativo de este repositorio.
- Latencia y throughput: no disponibles. Con offloading parcial en CPU se espera un rendimiento muy bajo, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Red-Squadron-8x22B-v1-GGUF (este) | 8x22B (no confirmado) | no disponible | GGUF multiparte | no disponible | Hugging Face, 0 descargas |
| Red-Squadron-8x22B-v1 (base) | 8x22B (no confirmado) | no disponible | safetensors (presumible) | no disponible | Hugging Face (TheDrummer) |
| Red-Squadron-8x22B-v1-i1-GGUF | 8x22B (no confirmado) | no disponible | GGUF imatrix | no disponible | Hugging Face (mradermacher) |

No se dispone de datos de rendimiento para establecer una comparacion cuantitativa con alternativas de la misma categoria.

## Limitaciones y advertencias

- Ausencia total de documentacion sobre el entrenamiento, los datos y la evaluacion del modelo base: no es posible verificar calidad ni sesgos.
- Riesgo de alucinacion no caracterizado; al ser un fine-tune creativo, es probable que priorice coherencia narrativa sobre veracidad, pero no hay datos que lo confirmen.
- Solo se declara soporte de ingles; no hay evidencia de capacidades multilingues.
- Licencia no disponible: no se puede garantizar el uso comercial. Verificar la licencia del modelo base antes de cualquier despliegue productivo.
- Repositorio con 0 descargas y 0 likes: sin validacion comunitaria ni reportes de fallos.
- Ficheros multiparte de hasta 150 GB: la descarga, el almacenamiento y la concatenacion requieren planificacion; errores en la union de fragmentos producen ficheros corruptos.
- Consumo de memoria muy elevado incluso en la cuantizacion mas pequena (52 GB), lo que excluye hardware consumer.
- El repositorio no incluye pesos en safetensors; para otros formatos hay que acudir al modelo base.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Red-Squadron-8x22B-v1-GGUF
- Modelo base: https://huggingface.co/TheDrummer/Red-Squadron-8x22B-v1
- Cuantizaciones imatrix: https://huggingface.co/mradermacher/Red-Squadron-8x22B-v1-i1-GGUF
- Pagina de descargas del cuantizador: https://hf.tst.eu/model#Red-Squadron-8x22B-v1-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafica comparativa de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizacion: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Peticiones de cuantizacion: https://huggingface.co/mradermacher/model_requests
