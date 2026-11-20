# mradermacher/clairic-GGUF

## Resumen

clairic-GGUF es la coleccion de cuantizaciones GGUF del modelo Cloudflare/clairic, publicada por mradermacher. El modelo original lo desarrolla Cloudflare y se presenta como un modelo multimodal orientado a salida estructurada y extraccion de informacion, con etiquetas que lo vinculan al proyecto SystemOne. Esta version GGUF permite ejecutar el modelo en entornos de inferencia local y en herramientas compatibles con llama.cpp, Ollama y similares, algo imposible con los pesos originales en safetensors si no se dispone de infraestructura de GPU de gran capacidad.

El modelo cuenta con 27.320.697.856 parametros totales (aproximadamente 27,3 mil millones) y esta publicado bajo licencia Apache 2.0. El repositorio GGUF ocupa 190,7 GB e incluye cuantizaciones estaticas desde Q2_K (11,3 GB) hasta Q8_0 (29,1 GB), lo que permite ajustar el consumo de memoria a distintos entornos. La model card no detalla la longitud de contexto, la arquitectura interna ni los datos de entrenamiento, por lo que esos datos se indican como no disponibles en esta ficha.

La relevancia de esta publicacion radica en que facilita el despliegue de un modelo de 27B especializado en extraccion de informacion y salida estructurada en hardware de consumo o en servidores sin GPUs de datacenter. Aun asi, la ausencia de benchmarks publicados y de documentacion tecnica detallada en la informacion disponible limita la evaluacion objetiva de su calidad frente a alternativas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | 27.320.697.856 (aproximadamente 27,3B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0 |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (cuantizaciones estaticas); modelo base en safetensors |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del modelo. Las etiquetas de la model card indican que se trata de un modelo multimodal con soporte de salida estructurada, orientado a extraccion de informacion, y que requiere codigo personalizado (custom-code) para su uso con transformers. No se especifican el tipo de transformer, si emplea mezcla de expertos, atencion lineal u otras innovaciones, ni el numero de tokens de entrenamiento, la composicion del dataset o si se aplicaron tecnicas de RLHF o DPO.

Esta publicacion es una cuantizacion del modelo original Cloudflare/clairic, realizada con el flujo de trabajo de mradermacher. Se han generado cuantizaciones estaticas (sin imatrix), y la propia model card senala que las cuantizaciones ponderadas con imatrix no estaban disponibles en el momento de la publicacion. No se documentan procesos de destilacion, ajuste fino adicional ni cambios en los pesos mas alla de la cuantizacion.

## Capacidades

- Generacion de texto conversacional, segun la etiqueta "conversational" del repositorio.
- Salida estructurada (structured-output), adecuada para generar JSON u otros formatos parseables.
- Extraccion de informacion (information-extraction) a partir de documentos o entradas de texto.
- Procesamiento multimodal, segun la etiqueta "multimodal" de la model card.
- Soporte de codigo personalizado en transformers (custom-code), lo que implica que la carga del modelo requiere confiar en codigo remoto del autor original.
- Compatibilidad con endpoints (endpoints_compatible) para despliegue en infraestructura compatible.
- Capacidades multilingues limitadas al ingles segun el campo de idiomas.
- No se documentan en la informacion disponible capacidades de tool calling, razonamiento multi-paso ni modos de pensamiento explicitos.

## Casos de uso

- Extraccion de datos de documentos: el modelo puede procesar texto y devolver campos estructurados (por ejemplo, JSON con entidades, fechas e importes) gracias a su orientacion a salida estructurada, lo que simplifica la integracion en pipelines de datos.
- Procesamiento de formularios y facturas: con su capacidad multimodal y de extraccion de informacion, puede emplearse para convertir documentos escaneados en registros estructurados para sistemas de gestion.
- Enriquecimiento de bases de datos: dado un corpus de textos, el modelo puede generar metadatos estructurados de forma automatizada en lugar de requerir anotacion manual.
- Clasificacion y etiquetado de contenido: la salida estructurada permite obtener etiquetas consistentes y parseables para tareas de moderacion o catalogacion.
- Asistentes conversacionales en ingles: la etiqueta conversacional y su tamano de 27B permiten mantener dialogos multi-turno, aunque la longitud de contexto no esta documentada.
- Despliegue local en estaciones de trabajo: las cuantizaciones Q4_K_M (17,1 GB) y Q5_K_M (19,7 GB) permiten ejecutar el modelo en GPUs de consumo con 24 GB de VRAM, algo inviable con los pesos originales en precision completa.
- Prototipado de pipelines de extraccion sin infraestructura de datacenter: las cuantizaciones Q2_K (11,3 GB) y Q3_K_S (12,4 GB) reducen los requisitos de memoria para pruebas iniciales, a costa de calidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 11,3 GB con Q2_K; 15,9-17,1 GB con Q4_K_S/Q4_K_M; 19,1-19,7 GB con Q5_K_S/Q5_K_M; 22,5 GB con Q6_K; 29,1 GB con Q8_0. Los pesos originales en safetensors (27,3B parametros) requeririan del orden de 55 GB en FP16, sin contar overhead.
- GPU recomendadas: RTX 3090 o RTX 4090 (24 GB) para cuantizaciones Q4 y Q5; A100 40 GB o H100 para Q6_K y Q8_0; GPU con 16 GB o menos solo para Q2_K o Q3_K_S, con posible offload a CPU.
- Cabe en GPU de consumo: si, en RTX 3090/4090 con cuantizaciones Q4_K_M o Q5_K_M; en GPUs de 16 GB solo con cuantizaciones Q2_K o Q3_K_S.
- Opciones de despliegue: llama.cpp y herramientas basadas en el (Ollama, LM Studio, entre otras); el formato GGUF es el estandar para estos entornos. No se documenta soporte para vLLM o TGI en la informacion disponible.
- Latencia y throughput: no disponibles. No se han publicado mediciones en la informacion proporcionada.

## Comparativa con modelos similares

No se dispone de datos de rendimiento del modelo que permitan una comparativa cuantitativa fiable. La siguiente tabla recoge solo los datos verificables de esta publicacion frente a alternativas genericas de tamano comparable, sin comparar calidad:

| Modelo | Parametros | Contexto | Licencia | Formato GGUF | Notas |
|---|---|---|---|---|---|
| clairic (esta ficha) | 27,3B | no disponible | Apache 2.0 | Si | Multimodal, salida estructurada, solo ingles |
| Alternativa de ~27B | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparables en la informacion proporcionada |
| Alternativa de ~30B | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparables en la informacion proporcionada |

No se identifican en la informacion disponible modelos directamente comparables con datos de benchmarks publicados.

## Limitaciones y advertencias

- Solo se declara soporte de ingles; el rendimiento en castellano u otros idiomas no esta documentado y probablemente sea deficiente.
- No hay benchmarks publicados, por lo que la calidad real del modelo en tareas de extraccion o generacion no puede verificarse de forma objetiva.
- Riesgo de alucinacion inherente a los modelos generativos; en tareas de extraccion de informacion conviene validar la salida estructurada con esquemas y comprobaciones posteriores.
- La model card no documenta sesgos conocidos, datos de entrenamiento ni procesos de alineacion.
- El modelo requiere codigo personalizado (custom-code) en transformers; esto implica ejecutar codigo remoto y revisar su procedencia antes de usarlo en produccion.
- Las cuantizaciones de baja precision (Q2_K, Q3_K_S) pueden degradar notablemente la calidad; para produccion se recomienda Q4_K_M o superior.
- No se han generado cuantizaciones imatrix para este modelo, segun la model card, lo que puede afectar a la calidad relativa de las cuantizaciones de baja precision.
- Aunque la licencia es Apache 2.0, conviene verificar las condiciones del modelo base Cloudflare/clairic y de cualquier componente multimodal incluido.
- El repositorio tiene 0 descargas en el momento de la consulta y un solo like, lo que indica una adopcion muy limitada y poca validacion por parte de la comunidad.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/clairic-GGUF
- Modelo base: https://huggingface.co/Cloudflare/clairic
- Pagina de descargas del autor: https://hf.tst.eu/model#clairic-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico de calidad de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas sobre cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- FAQ y peticiones de cuantizacion: https://huggingface.co/mradermacher/model_requests
