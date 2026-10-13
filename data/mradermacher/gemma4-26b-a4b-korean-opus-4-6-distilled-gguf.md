# mradermacher/Gemma4-26B-A4B-Korean-Opus-4.6-Distilled-GGUF

## Resumen

Gemma4-26B-A4B-Korean-Opus-4.6-Distilled-GGUF es una coleccion de cuantizaciones en formato GGUF generadas por mradermacher (nethype GmbH) a partir del modelo jiwon9703/KoGemopus-4-26B-A4B-experimental. No se trata, por tanto, de un entrenamiento original, sino de una redistribucion optimizada para inferencia local del modelo base, que segun los metadatos fue ajustado mediante SFT sobre el dataset Jongsim/claude-opus-4.6-reasoning-12k-ko-filtered-v2, un corpus de razonamiento en coreano derivado de trazas de un modelo tipo Claude Opus. El modelo esta etiquetado con la familia gemma4 y orientado a tareas conversacionales y de razonamiento en coreano e ingles.

El repositorio declara 25.233.142.046 parametros totales (unos 25,2 mil millones), en linea con la denominacion comercial "26B" del nombre. El sufijo "A4B" del identificador sugiere una arquitectura de mezcla de expertos (MoE) con aproximadamente 4 mil millones de parametros activos por token, aunque la informacion disponible no confirma ni detalla esta configuracion. El repositorio ocupa 184,9 GB e incluye 11 cuantizaciones estaticas mas dos ficheros mmproj, lo que apunta a soporte de entrada multimodal, sin que la model card lo describa.

Su relevancia practica es doble: por un lado, permite ejecutar un modelo afinado especificamente para razonamiento en coreano en hardware de consumo mediante llama.cpp u Ollama; por otro, sirve como punto de entrada para quien quiera evaluar el modelo base sin descargar los pesos completos. La licencia Apache 2.0 declarada facilita su uso comercial, aunque se hereda cualquier restriccion del modelo original. El numero de descargas (636) y de "me gusta" (1) indica una adopcion todavia muy limitada.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible. Etiquetado como familia "gemma4"; el sufijo "A4B" apunta a MoE con ~4B activos, sin confirmar |
| Parametros totales | 25.233.142.046 (~25,2B) |
| Parametros activos | No disponible (el nombre sugiere ~4B, dato no verificado) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0; ficheros mmproj en Q8_0 y f16; variantes imatrix (i1) en repositorio aparte |
| Idiomas soportados | Coreano (ko) e ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizaciones estaticas); el modelo base esta en safetensors |
| Autor de la cuantizacion | mradermacher |
| Modelo base | jiwon9703/KoGemopus-4-26B-A4B-experimental |
| Dataset de ajuste | Jongsim/claude-opus-4.6-reasoning-12k-ko-filtered-v2 |
| Tamano del repositorio | 184,9 GB |
| Libreria declarada | transformers (los ficheros son GGUF, se ejecutan con llama.cpp y derivados) |
| Compatibilidad con endpoints | Si (etiqueta endpoints_compatible) |
| Descargas / likes | 636 / 1 |
| Fecha de creacion | 2026-04-22 |
| Ultima actualizacion | 2026-10-12 |

## Arquitectura y entrenamiento

La informacion disponible no describe la arquitectura interna del modelo. La model card de esta cuantizacion es una plantilla automatica de mradermacher que solo indica el origen ("static quants of jiwon9703/KoGemopus-4-26B-A4B-experimental") y la lista de ficheros generados. La etiqueta gemma4 situa al modelo en la familia Gemma 4, y la nomenclatura "26B-A4B" reproduce el patron habitual de los modelos de mezcla de expertos, donde el primer numero indica los parametros totales y el segundo los activos por token. No obstante, ni el numero de expertos, ni la dimension de la capa de atencion, ni los detalles del enrutador estan documentados en la informacion proporcionada.

Respecto al entrenamiento, los metadatos indican que el modelo base se ajusto mediante SFT (supervised fine-tuning) sobre el dataset Jongsim/claude-opus-4.6-reasoning-12k-ko-filtered-v2, un conjunto de aproximadamente 12.000 ejemplos de razonamiento en coreano, filtrado, y presumiblemente destilado a partir de trazas de un modelo de la familia Claude Opus. No hay informacion sobre el volumen total de tokens de preentrenamiento, la composicion del corpus original, ni sobre si se aplicaron fases de RLHF, DPO u optimizacion por preferencias. La presencia de ficheros mmproj (proyector multimodal) en el repositorio sugiere que el modelo base admite entrada de imagenes ademas de texto, aunque la model card no lo declara explicitamente y no se detalla el codificador visual empleado.

## Capacidades

- Generacion de texto conversacional multi-turno, con soporte declarado de la etiqueta "conversational".
- Razonamiento explicito: el modelo base fue afinado sobre un dataset de razonamiento en coreano, por lo que se orienta a tareas de cadena de pensamiento y resolucion de problemas.
- Capacidad bilingue coreano-ingles declarada en los metadatos del repositorio.
- Posible soporte de entrada multimodal (imagen + texto) por la presencia de los ficheros mmproj Q8_0 y f16; no confirmado en la documentacion.
- Compatibilidad con endpoints (etiqueta endpoints_compatible), lo que facilita su exposicion mediante APIs compatibles con OpenAI en servidores locales.
- Capacidades de tool calling, function calling y uso agentico: no disponible en la informacion proporcionada.
- Ejecucion local en CPU y GPU mediante ecosistema GGUF, con distintos niveles de cuantizacion.
- Capacidades de codigo y matematicas: no especificadas en la informacion disponible, aunque el dataset de destilacion de razonamiento suele incluir estos dominios.

## Casos de uso

- Asistentes conversacionales en coreano: el modelo esta afinado especificamente sobre trazas de razonamiento en coreano, lo que lo hace adecuado para atender a usuarios hispanohablantes de servicios coreanos o para integrarse en productos dirigidos al mercado de Corea del Sur con un tono y una sintaxis nativos.
- Traduccion y adaptacion de contenido tecnico ko-en: al declarar soporte de ambos idiomas, puede emplearse en pipelines de localizacion de documentacion, fichas de producto o articulos, con revisión humana posterior.
- Razonamiento asistido en entornos educativos: la naturaleza del dataset de ajuste (razonamiento destilado) permite usarlo como tutor que explica el proceso de resolucion paso a paso, en lugar de devolver solo la respuesta final.
- Despliegue en estaciones de trabajo sin GPU de datacenter: con las cuantizaciones Q4_K_S (15,6 GB) o Q4_K_M (16,9 GB) cabe en tarjetas de 24 GB o incluso en equipos con 16 GB de VRAM usando offload parcial a CPU, lo que habilita prototipos locales sin coste de API.
- Procesamiento por lotes de textos largos en coreano: clasificacion, resumen o extraccion de entidades sobre volumenes medios de documentos, ejecutado con llama.cpp o Ollama en un servidor de gama media; requiere validar previamente la longitud de contexto real del modelo, no documentada.
- Investigacion sobre destilacion de razonamiento: al derivarse de un dataset filtrado de trazas de un modelo mayor, sirve como caso de estudio para analizar como se transfieren patrones de razonamiento en coreano mediante SFT sobre un modelo base abierto.
- Base para ajuste posterior: al distribuirse en GGUF solo para inferencia, quien necesite fine-tuning debera partir del modelo base en safetensors; aun asi, estas cuantizaciones son utiles para evaluar rapidamente si merece la pena invertir en ese ajuste.
- Auditoria de sesgos en modelos especificos de un idioma: el modelo permite estudiar como un ajuste centrado en un unico idioma desplaza el comportamiento en ingles y en otras lenguas no incluidas en el entrenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio no incluye tablas comparativas (MMLU, HumanEval, GSM8K, KMMLU ni similares), y el autor del modelo base tampoco aporta metricas en los metadatos accesibles. No se deben extrapolar numeros a partir de la familia Gemma ni del tamano declarado, porque la arquitectura y el ajuste reales no estan confirmados.

## Requisitos de hardware

- VRAM estimada para inferencia segun el fichero elegido (solo pesos; hay que sumar la cache KV, cuyo tamano depende de una longitud de contexto no documentada):

| Cuantizacion | Tamano en disco | VRAM minima practica |
|---|---|---|
| Q2_K | 10,7 GB | 12-16 GB |
| Q3_K_S | 12,3 GB | 16 GB |
| Q3_K_M | 13,4 GB | 16 GB |
| Q3_K_L | 13,9 GB | 16-20 GB |
| IQ4_XS | 14,2 GB | 16-20 GB |
| Q4_K_S | 15,6 GB | 20-24 GB |
| Q4_K_M | 16,9 GB | 24 GB |
| Q5_K_S | 18,1 GB | 24 GB |
| Q5_K_M | 19,2 GB | 24-32 GB |
| Q6_K | 22,7 GB | 32 GB |
| Q8_0 | 27,0 GB | 32-40 GB |
| mmproj Q8_0 | 0,9 GB | complemento multimodal |
| mmproj f16 | 1,3 GB | complemento multimodal |

- GPU recomendadas: RTX 4090, RTX 3090 o RTX 5090 (24-32 GB) para las cuantizaciones Q4 y Q5; A100 40 GB, L40S o H100 para Q6_K, Q8_0 y contextos largos.
- Cabe en GPU de consumo: si, en tarjetas de 16 GB con las cuantizaciones Q3_K_M o IQ4_XS, y en tarjetas de 24 GB con Q4_K_M sin necesidad de offload a CPU. Por debajo de 12 GB de VRAM habria que recurrir a Q2_K con offload parcial, con la perdida de calidad asociada.
- Opciones de despliegue: llama.cpp (referencia para formato GGUF), Ollama, LM Studio, koboldcpp, text-generation-webui, jan y servidores con soporte GGUF como llama-cpp-python. La ruta de transformers/vLLM esta pensada para el modelo base en safetensors, no para estos ficheros, aunque vLLM admite GGUF de forma experimental.
- Cuantizaciones imatrix: disponibles en mradermacher/Gemma4-26B-A4B-Korean-Opus-4.6-Distilled-i1-GGUF, con calidad superior a igual tamano segun el propio autor.
- Latencia y throughput: no disponible. No se han publicado mediciones y el repositorio no incluye datos de velocidad, consumo ni comparativas de tokens por segundo.

## Comparativa con modelos similares

No se dispone de datos verificables de benchmarks ni de especificaciones completas de modelos alternativos de la misma categoria (afinados para coreano con razonamiento sobre una base abierta de ~25B). La siguiente tabla compara unicamente los artefactos directamente relacionados con esta publicacion:

| Modelo | Parametros | Formato | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Gemma4-26B-A4B-Korean-Opus-4.6-Distilled-GGUF | 25,2B totales (activos no disponibles) | GGUF, 11 cuantizaciones + mmproj | No disponible | Apache 2.0 | Publico en HuggingFace; 636 descargas |
| jiwon9703/KoGemopus-4-26B-A4B-experimental (base) | 25,2B | safetensors | No disponible | No disponible en la informacion proporcionada | Publico en HuggingFace |
| Gemma4-26B-A4B-Korean-Opus-4.6-Distilled-i1-GGUF | 25,2B | GGUF con imatrix | No disponible | Apache 2.0 | Publico en HuggingFace |

Para comparar con alternativas de otros autores (por ejemplo, modelos coreanos de tamano similar basados en Qwen, Llama o EXAONE) seria necesario disponer de sus fichas tecnicas y resultados de evaluacion, que no forman parte de la informacion proporcionada. Se indica por tanto: comparativa con modelos de terceros no disponible.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados, pero un ajuste SFT practicamente monocritorio sobre datos destilados de otro modelo tiende a reproducir los sesgos de ese modelo generador y a infrarrepresentar variedades dialectales del coreano.
- Alucinacion: el modelo fue afinado sobre trazas de razonamiento destiladas, un procedimiento que puede producir cadenas de pensamiento plausibles pero incorrectas. Debe validarse cualquier salida factual, especialmente en dominios tecnicos o legales.
- Limitaciones de contexto: la longitud de contexto no esta documentada. Planificar despliegues con ventanas largas sin verificar antes el limite real del modelo y el coste de memoria de la cache KV es un riesgo operativo.
- Limitaciones de idioma: solo se declaran coreano e ingles. El rendimiento en castellano no esta evaluado y probablemente sea deficiente, por lo que no es una opcion sensata para productos en espanol sin una evaluacion previa.
- Licencia: el repositorio declara Apache 2.0, pero al ser una cuantizacion de un modelo de terceros, conviene verificar la licencia del modelo base jiwon9703/KoGemopus-4-26B-A4B-experimental, que no aparece en la informacion proporcionada. La licencia de la familia Gemma original de Google impone obligaciones adicionales de uso aceptable que podrian aplicar segun la procedencia real de los pesos.
- Ausencia de documentacion tecnica: la model card es una plantilla automatica que no describe arquitectura, contexto, tokenizador ni plantilla de prompt. Es un problema serio para produccion, ya que la plantilla de chat debe inferirse del modelo base.
- Trazabilidad limitada: se trata de una cuantizacion estatica sin imatrix; para igual tamano, las variantes i1 del autor suelen ofrecer mejor perplejidad, aunque tampoco se publican mediciones comparativas.
- Adopcion marginal: con 636 descargas y 1 "me gusta", hay pocos informes independientes de comportamiento en produccion, lo que reduce la confianza en el artefacto.
- Multimodalidad ambigua: existen ficheros mmproj, pero sin codificador declarado ni instrucciones de uso; tratar la entrada de imagen como una capacidad confirmada seria un error.
- Contenido del dataset: al derivarse de trazas de un modelo propietario de terceros, pueden existir dudas sobre los derechos de redistribucion del corpus de ajuste y, por extension, de los pesos derivados.

## Enlaces

- Repositorio HuggingFace de esta cuantizacion: https://huggingface.co/mradermacher/Gemma4-26B-A4B-Korean-Opus-4.6-Distilled-GGUF
- Cuantizaciones imatrix (i1) del mismo modelo: https://huggingface.co/mradermacher/Gemma4-26B-A4B-Korean-Opus-4.6-Distilled-i1-GGUF
- Modelo base: https://huggingface.co/jiwon9703/KoGemopus-4-26B-A4B-experimental
- Dataset de ajuste: https://huggingface.co/datasets/Jongsim/claude-opus-4.6-reasoning-12k-ko-filtered-v2
- Pagina de resumen y descargas del autor: https://hf.tst.eu/model#Gemma4-26B-A4B-Korean-Opus-4.6-Distilled-GGUF
- Peticiones y FAQ de cuantizaciones de mradermacher: https://huggingface.co/mradermacher/model_requests
- Guia de uso de ficheros GGUF (README de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Analisis de tipos de cuantizacion de Artefact2: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Grafica comparativa de perplejidad por tipo de cuantizacion: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Patrocinador de la infraestructura de cuantizacion: https://www.nethype.de/
