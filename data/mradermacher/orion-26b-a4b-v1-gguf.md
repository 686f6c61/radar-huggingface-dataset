# mradermacher/Orion-26B-A4B-v1-GGUF

## Resumen

Orion-26B-A4B-v1-GGUF es la distribucion en formato GGUF del modelo Orion-26B-A4B-v1, desarrollado originalmente por TheDrummer y cuantizado por mradermacher. Se trata de un modelo de lenguaje conversacional con arquitectura de mezcla de expertos (MoE), tal y como indica el sufijo "A4B" (aproximadamente 4 mil millones de parametros activos por token) sobre un total de 25.233.142.046 parametros. El repositorio proporciona exclusivamente pesos cuantizados estaticos, no los pesos originales en precision completa.

La relevancia de esta publicacion radica en que permite ejecutar un modelo MoE de ~25B parametros totales en hardware de consumo, ya que solo se activa una fraccion de los expertos en cada paso de inferencia. Las cuantizaciones disponibles abarcan desde Q2_K (10,7 GB) hasta Q8_0 (27,0 GB), ademas de dos variantes del proyector multimodal (mmproj), lo que sugiere capacidades de vision en el modelo base.

La informacion publicada por el cuantizador es deliberadamente minima: no se detalla la longitud de contexto, la licencia, los idiomas soportados ni los resultados de evaluacion. La model card se limita a listar los ficheros GGUF generados y a remitir a la pagina del modelo original para obtener documentacion adicional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mezcla de expertos (MoE) tipo transformer, inferida del sufijo "A4B"; detalles no disponibles |
| Parametros totales | 25.233.142.046 (dato de safetensors del modelo base) |
| Parametros activos | Aproximadamente 4B (inferido de la nomenclatura "A4B"); cifra exacta no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0; proyectores mmproj en Q8_0 y f16 |
| Idiomas soportados | en (segun la model card) |
| Licencia | no disponible |
| Formato de pesos | GGUF (safetensors solo en el modelo base) |

## Arquitectura y entrenamiento

El modelo base es TheDrummer/Orion-26B-A4B-v1, un modelo de mezcla de expertos con 25.233.142.046 parametros totales y, segun la convencion de nomenclatura, aproximadamente 4 mil millones de parametros activos por token. La presencia de ficheros mmproj (proyector multimodal) en el repositorio GGUF indica que el modelo incorpora capacidad de procesamiento de imagenes, probablemente mediante un encoder visual acoplado al transformer principal. No se dispone de informacion sobre el numero de capas, el numero de expertos, la estrategia de enrutamiento ni la dimension de las representaciones ocultas.

Tampoco se han publicado detalles sobre el corpus de entrenamiento: numero de tokens, composicion del dataset, uso de RLHF, DPO u otras tecnicas de alineacion. La model card del repositorio cuantizado no incluye ninguna seccion tecnica sobre el entrenamiento, y la informacion disponible unicamente documenta el proceso de cuantizacion estatica (quantize_version 2, output_tensor_quantised 1, convert_type hf) realizado con las herramientas habituales del ecosistema llama.cpp.

## Capacidades

- Generacion de texto conversacional en ingles, segun la etiqueta `conversational` y el idioma declarado en la model card.
- Procesamiento multimodal: la existencia de proyectores mmproj-Q8_0 y mmproj-f16 confirma soporte de entrada de imagenes, aunque no se detalla el alcance (captioning, VQA, OCR).
- Razonamiento y generacion de codigo: capacidad esperable en un modelo de esta familia, pero no documentada explicitamente en la informacion disponible.
- Soporte de tool calling y function calling: no disponible en la documentacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: limitadas al ingles segun la etiqueta de idioma; no se declaran otros idiomas.
- Modo de razonamiento explicito (thinking mode): no disponible.

## Casos de uso

- Despliegue local en estaciones de trabajo con GPU de consumo: con cuantizaciones Q4_K_M (16,9 GB) o IQ4_XS (14,2 GB), el modelo cabe en GPUs de 16-24 GB de VRAM, lo que permite ejecutar un MoE de 25B totales con activacion de ~4B en hardware asequible.
- Asistentes conversacionales en ingles autoalojados: la naturaleza conversacional del modelo base y su reducido coste de inferencia por token lo hacen adecuado para chatbots de atencion al usuario desplegados en infraestructura propia, evitando dependencias de API externas.
- Procesamiento de documentos con imagenes: gracias a los proyectores mmproj, puede emplearse en pipelines de extraccion de informacion de capturas, formularios escaneados o graficos, combinando entrada visual y salida textual.
- Prototipado rapido con llama.cpp u Ollama: la disponibilidad de cuantizaciones desde 10,7 GB permite iterar en portatiles con GPU modesta antes de escalar a un despliegue mayor.
- Servicio de inferencia con vLLM o TGI a partir del modelo base: para produccion con mayor throughput, conviene usar los pesos safetensors originales de TheDrummer/Orion-26B-A4B-v1 en lugar de los GGUF, aprovechando el enrutamiento disperso de la MoE.
- Experimentacion en investigacion sobre MoE: el modelo permite estudiar el comportamiento de un MoE de ~25B con ~4B activos en entornos con recursos limitados, comparando calidad entre cuantizaciones (Q2_K frente a Q8_0) con la misma arquitectura.
- Fine-tuning ligero sobre el modelo base: los pesos originales en safetensors permiten aplicar LoRA o QLoRA sobre las capas densas y los expertos, aunque el repositorio GGUF no es el punto de partida adecuado para ello.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia segun cuantizacion: Q2_K ~10,7 GB; Q3_K_S ~12,3 GB; Q3_K_M ~13,4 GB; Q3_K_L ~13,9 GB; IQ4_XS ~14,2 GB; Q4_K_S ~15,6 GB; Q4_K_M ~16,9 GB; Q5_K_S ~18,1 GB; Q5_K_M ~19,2 GB; Q6_K ~22,7 GB; Q8_0 ~27,0 GB. A estas cifras hay que sumar el proyector multimodal (0,9 GB en Q8_0 o 1,3 GB en f16) si se usa entrada de imagenes, mas el espacio para la cache KV, cuyo tamano depende de la longitud de contexto (no documentada).
- GPU recomendadas: RTX 4090 (24 GB) para Q4_K_M, Q5_K_M o Q6_K con contexto moderado; RTX 4080 / 4070 Ti Super (16 GB) para Q4_K_S o IQ4_XS con contexto ajustado; A100 40/80 GB o H100 para Q8_0 con contextos largos y mayor concurrencia.
- Cabe en GPU de consumo: si, en tarjetas de 16 GB o mas con cuantizaciones Q4 o inferiores; en tarjetas de 12 GB solo con Q2_K o Q3_K_S y contexto reducido, o mediante offloading parcial a CPU.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio y cualquier runtime compatible con GGUF; para el modelo base en safetensors, vLLM o TGI si la arquitectura MoE esta soportada por dichos frameworks (no confirmado en la informacion disponible).
- Latencia y throughput: no disponibles. Al tratarse de un MoE con ~4B parametros activos, se espera un coste computacional por token comparable al de un modelo denso de ~4B, aunque el consumo de memoria corresponde al total de 25B.

## Comparativa con modelos similares

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| Orion-26B-A4B-v1 (este) | 25,2B | ~4B (inferido) | no disponible | no disponible | GGUF, safetensors (base) |
| Alternativas de la misma categoria | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de informacion suficiente sobre modelos comparables de la misma categoria (MoE de ~25B con ~4B activos) en la documentacion proporcionada para establecer una comparativa rigurosa con cifras verificables de rendimiento.

## Limitaciones y advertencias

- La licencia no esta declarada en el repositorio. Antes de cualquier uso comercial es imprescindible consultar la licencia del modelo base TheDrummer/Orion-26B-A4B-v1, ya que los terminos del cuantizador pueden no cubrir los derechos de uso del modelo original.
- El unico idioma declarado es el ingles; el rendimiento en castellano u otras lenguas no esta documentado y probablemente sea deficiente.
- No se han publicado evaluaciones de sesgo, toxicidad ni alineacion. Como modelo conversacional sin documentacion de seguridad, existe riesgo de generar contenido inapropiado o factualmente incorrecto.
- Riesgo de alucinacion inherente a los modelos de lenguaje; no hay datos sobre la calibracion del modelo ni sobre su comportamiento en tareas de recuperacion factual.
- La longitud de contexto es desconocida, lo que impide planificar despliegues con ventanas largas o estimar con precision el consumo de memoria de la cache KV.
- Las cuantizaciones de baja precision (Q2_K, Q3_K_S) degradan la calidad de forma notable; para produccion se recomienda Q4_K_M o superior.
- Los pesos GGUF estaticos no son adecuados para fine-tuning; para adaptaciones hay que partir del modelo base en safetensors.
- El repositorio ocupa 184,9 GB en total, aunque cada fichero individual es descargable por separado; conviene seleccionar solo la cuantizacion necesaria.
- No hay informacion sobre el proceso de entrenamiento ni sobre posibles sesgos derivados de los datos utilizados.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Orion-26B-A4B-v1-GGUF
- Modelo base: https://huggingface.co/TheDrummer/Orion-26B-A4B-v1
- Cuantizaciones con imatrix: https://huggingface.co/mradermacher/Orion-26B-A4B-v1-i1-GGUF
- Pagina de descargas del cuantizador: https://hf.tst.eu/model#Orion-26B-A4B-v1-GGUF
- Peticiones de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Guia de uso de GGUF (referencia de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Analisis de tipos de cuantizacion de Artefact2: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
