# mradermacher/Darwin-28B-FUSION-v1-GGUF

## Resumen

Darwin-28B-FUSION-v1-GGUF es la version cuantizada en formato GGUF del modelo Darwin-28B-FUSION-v1, publicado originalmente por el usuario VIDraft en HuggingFace. La cuantizacion la firma mradermacher, un actor habitual en el ecosistema de publicacion de pesos GGUF para modelos open source, que distribuye tanto cuantizaciones estaticas como imatrix (estas ultimas en un repositorio separado). El modelo base, pese a su nombre comercial, cuenta con 26.895.998.464 parametros reales segun los tensores en safetensors, es decir, aproximadamente 26,9 mil millones de parametros, no 28B exactos.

El modelo esta orientado a conversacion (tag `conversational`) y declarado unicamente para ingles. La model card del repositorio GGUF no aporta informacion sobre arquitectura, contexto, datos de entrenamiento ni benchmarks: se limita a describir los ficheros de cuantizacion disponibles. Esto limita considerablemente la evaluacion tecnica del modelo a partir de esta fuente, y obliga a remitirse al repositorio del modelo base para cualquier detalle arquitectonico.

La relevancia de esta publicacion es practica: ofrece el modelo en un espectro amplio de cuantizaciones (desde Q2_K de 10,8 GB hasta Q8_0 de 28,7 GB), lo que permite ejecutarlo en hardware de consumo con llama.cpp o derivados. El repositorio acumula 71 descargas y 8 likes, un volumen bajo que sugiere un modelo de nicho o reciente, sin adopcion amplia en la comunidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | 26.895.998.464 (~26,9B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0 (estaticas); imatrix en repositorio i1-GGUF |
| Idiomas soportados | en (ingles) |
| Licencia | no disponible |
| Formato de pesos | GGUF (modelo base en safetensors) |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura del modelo base en la documentacion proporcionada. El nombre "FUSION" sugiere una posible fusion de modelos (model merging), practica comun en la comunidad, pero no hay confirmacion en la model card. Tampoco se detallan el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de RLHF, DPO o ajuste por instrucciones.

La unica informacion tecnica concreta es la relativa al proceso de cuantizacion: mradermacher indica en los metadatos que se uso `quantize_version: 2`, `output_tensor_quantised: 1` y `convert_type: hf`, lo que implica una conversion desde pesos HuggingFace y una cuantizacion por tensor de salida. Se ofrece ademas una variante con imatrix (importance matrix) en el repositorio `Darwin-28B-FUSION-v1-i1-GGUF`, que suele mejorar la calidad en cuantizaciones bajas.

## Capacidades

- Generacion de texto conversacional en ingles, segun el tag `conversational`.
- Compatibilidad declarada con endpoints (`endpoints_compatible`), lo que facilita su despliegue en infraestructuras de inferencia compatibles con la API de HuggingFace.
- Uso con la libreria `transformers` para los pesos originales y con llama.cpp y derivados para los GGUF.
- Capacidades de razonamiento, codigo, matematicas, vision, audio, tool calling o agentes: no disponibles en la informacion proporcionada.
- Soporte multilingue: limitado a ingles segun los metadatos.
- Modo thinking, vision o audio: no disponible.

## Casos de uso

- Despliegue local en estaciones de trabajo con GPU de consumo: las cuantizaciones Q4_K_M (16,6 GB) y Q5_K_M (19,3 GB) permiten ejecutar un modelo de ~27B en GPUs con 24 GB de VRAM, como la RTX 3090 o la RTX 4090, usando llama.cpp u Ollama.
- Prototipado de asistentes conversacionales en ingles: el tag `conversational` y la disponibilidad en GGUF facilitan montar un chatbot local sin depender de APIs externas, util para pruebas de concepto y demos internas.
- Evaluacion comparativa de tecnicas de cuantizacion: al ofrecer 11 variantes incluyendo IQ4_XS e imatrix, el repositorio sirve para medir la degradacion de perplejidad entre cuantizaciones en un modelo de ~27B.
- Inferencia en CPU o entornos sin GPU dedicada: las variantes Q2_K (10,8 GB) y Q3_K_S (12,2 GB) permiten ejecucion en RAM del sistema con llama.cpp, aunque con perdida de calidad notable en el caso de Q2_K.
- Integracion en pipelines compatibles con la API de endpoints: el tag `endpoints_compatible` sugiere su uso en servicios de inferencia gestionados que acepten el formato de HuggingFace.
- Fine-tuning o experimentation sobre el modelo base: los pesos originales en safetensors (26,9B parametros) permiten ajuste con tecnicas como LoRA o QLoRA, aunque el coste de VRAM es elevado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia segun cuantizacion: Q2_K ~10,8 GB; Q3_K_M ~13,4 GB; Q4_K_M ~16,6 GB; Q5_K_M ~19,3 GB; Q6_K ~22,2 GB; Q8_0 ~28,7 GB. Hay que sumar overhead de contexto KV cache, que puede anadir varios GB con contextos largos.
- GPU recomendadas: RTX 3090 o RTX 4090 (24 GB) para Q4_K_M y Q5_K_M con contexto moderado; A100 40 GB o H100 para Q6_K y Q8_0 con contexto amplio; multiples GPUs para Q8_0 en produccion.
- Cabe en GPU de consumo: si, en RTX 3090/4090 para cuantizaciones hasta Q5_K_M; en GPUs de 16 GB solo Q2_K y Q3_K_S con contexto reducido; en GPUs de 12 GB, inviable salvo offloading parcial a RAM.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio y cualquier runtime compatible con GGUF. Para los pesos originales, transformers con aceleracion CUDA o vLLM (sujeto a soporte de la arquitectura, no confirmado).
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Darwin-28B-FUSION-v1 | ~26,9B | no disponible | no disponible | safetensors, GGUF | Solo ingles, sin benchmarks publicados |
| Mistral Small 24B | ~24B | 32k-128k (segun version) | Apache 2.0 | safetensors, GGUF | Multilingue, benchmarks publicos |
| Gemma 2 27B | ~27B | 8k | Gemma license | safetensors, GGUF | Multilingue, benchmarks publicos |
| Qwen2.5 32B | ~32B | 32k-128k | Apache 2.0 (segun variante) | safetensors, GGUF | Multilingue, amplia documentacion |

La comparacion se ofrece a nivel de tamano y categoria; no hay datos de rendimiento del modelo Darwin que permitan una comparacion cuantitativa con estas alternativas.

## Limitaciones y advertencias

- Ausencia total de benchmarks y documentacion tecnica: no es posible evaluar su calidad frente a alternativas con datos publicos.
- Licencia no especificada: no se puede confirmar el uso comercial; es imprescindible consultar el repositorio del modelo base (VIDraft/Darwin-28B-FUSION-v1) antes de cualquier despliegue en produccion.
- Solo soporta ingles segun los metadatos; el rendimiento en castellano u otros idiomas es desconocido y probablemente deficiente.
- Riesgo de alucinacion no cuantificado: sin evaluaciones publicadas no hay estimacion de fiabilidad.
- Origen del modelo base poco documentado: el autor VIDraft no dispone de informacion publica sobre el proceso de entrenamiento o fusion, lo que dificulta auditar sesgos o procedencia de datos.
- Volumen de descargas bajo (71) y pocos likes (8): escasa validacion por parte de la comunidad.
- Las cuantizaciones Q2_K y Q3_K_S degradan notablemente la calidad; para uso serio se recomienda Q4_K_M o superior.
- El repositorio pesa 186,3 GB en total; la descarga selectiva de una sola cuantizacion es necesaria para evitar consumos de disco elevados.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Darwin-28B-FUSION-v1-GGUF
- Modelo base: https://huggingface.co/VIDraft/Darwin-28B-FUSION-v1
- Cuantizaciones imatrix: https://huggingface.co/mradermacher/Darwin-28B-FUSION-v1-i1-GGUF
- Pagina de resumen del autor: https://hf.tst.eu/model#Darwin-28B-FUSION-v1-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Analisis de tipos de cuantizacion (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Solicitudes de cuantizacion de mradermacher: https://huggingface.co/mradermacher/model_requests
