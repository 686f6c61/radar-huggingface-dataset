# glossia/Rambley-V2.1-350M-Embed-Pretrain-Preview

## Resumen

Rambley-V2.1-350M-Embed-Pretrain-Preview es un modelo de embeddings de frases (sentence transformer) desarrollado por el usuario glossia, obtenido mediante fine-tuning del modelo base glossia/Rambley-V2.1-350M sobre el dataset nomic-embed-unsupervised-data. Su funcion es proyectar frases y parrafos a un espacio vectorial denso de 896 dimensiones, pensado para tareas de recuperacion de informacion y similitud semantica. Con 348.583.480 parametros y un tamano de repositorio de 0,7 GB, es un modelo compacto orientado a despliegues con requisitos de hardware modestos.

El modelo sigue la arquitectura SentenceTransformer con tres componentes encadenados: un transformer de extraccion de caracteristicas (RambleyV2Model), una capa de pooling de tipo lasttoken con dimension de embedding de 896 e include_prompt activado, y una capa de normalizacion final. La similitud se calcula por coseno. El entrenamiento empleo la perdida CachedMultipleNegativesRankingLoss con escala 20.0, similitud coseno, mini-batch de 64 y direccion query_to_doc.

La relevancia de esta publicacion es limitada y experimental: se trata de una "preview" de preentrenamiento con solo 34 descargas, sin likes, sin licencia declarada y sin idiomas documentados. Su interes principal radica en evaluar la calidad del modelo base Rambley-V2.1-350M como encoder para recuperacion, no como un modelo listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SentenceTransformer (RambleyV2Model + Pooling lasttoken + Normalize) |
| Parametros totales | 348.583.480 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 256 tokens (maxima longitud de secuencia) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Dimension de embedding | 896 |
| Funcion de similitud | coseno |
| Modalidad | texto |
| Libreria | sentence-transformers |
| Modelo base | glossia/Rambley-V2.1-350M (revision 61f2613c63873e4e863bec23ea59cf243a565119) |
| Dataset de entrenamiento | nomic-embed-unsupervised-data |
| Perdida | CachedMultipleNegativesRankingLoss (scale 20.0, cos_sim, mini_batch_size 64) |
| Tamano del repositorio | 0,7 GB |

## Arquitectura y entrenamiento

La arquitectura es un pipeline SentenceTransformer de tres modulos. El primero es un transformer de extraccion de caracteristicas con arquitectura propia denominada RambleyV2Model, que expone last_hidden_state como salida. El segundo es una capa de pooling de tipo lasttoken con dimension de embedding de 896 y include_prompt en True, lo que implica que el token de pooling es el ultimo token de la secuencia, incluido el prompt. El tercero es una capa de normalizacion que produce vectores unitarios para el calculo de similitud por coseno. El modelo base empleado es glossia/Rambley-V2.1-350M, del que no se dispone de detalles arquitectonicos adicionales en la informacion proporcionada.

El fine-tuning se realizo sobre nomic-embed-unsupervised-data, con columnas query y document, usando CachedMultipleNegativesRankingLoss con escala 20.0, similitud coseno, mini-batch de 64, particion joint y direccion query_to_doc. Los hiperparametros incluyen batch de 64 por dispositivo, 5000 pasos maximos, learning rate 2e-05, scheduler coseno, warmup del 5 por ciento, optimizador adamw_torch_fused, precision bf16 y dataloader_drop_last activado. No se documenta el numero total de tokens de entrenamiento ni la composicion completa del dataset, y no consta el uso de RLHF o DPO, algo esperable en un modelo de embeddings. Tampoco se documentan innovaciones tecnicas adicionales como decodificacion especulativa o atencion lineal.

## Capacidades

- Generacion de embeddings de frases y parrafos en un espacio denso de 896 dimensiones.
- Recuperacion de informacion (retrieval) mediante similitud semantica por coseno.
- Codificacion asimetrica de consultas y documentos mediante encode_query y encode_document.
- Extraccion de caracteristicas (feature-extraction) a partir del transformer subyacente.
- Calculo de similitud entre embeddings con la funcion similarity de sentence-transformers.
- Integracion con el ecosistema sentence-transformers y la API de Hugging Face.
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso, vision, audio ni modo thinking.
- Capacidades multilingues: no disponibles (idiomas no declarados en la model card).

## Casos de uso

- Busqueda semantica en documentacion tecnica: indexar fragmentos de documentacion como documentos y codificar las consultas de los usuarios como queries, recuperando los fragmentos mas similares por coseno. El limite de 256 tokens obliga a trocear los documentos en fragmentos cortos.
- Deduplicacion de registros: codificar filas de texto de una base de datos y agrupar por similitud coseno para detectar entradas duplicadas o casi duplicadas, aprovechando el bajo coste de un modelo de 350M parametros.
- Clasificacion de tickets de soporte por similitud: codificar los tickets entrantes y compararlos contra embeddings de tickets historicos ya etiquetados, asignando la categoria del vecino mas cercano sin entrenar un clasificador adicional.
- Filtrado de contenido en pipelines de datos: calcular la similitud entre pares de textos para descartar duplicados o contenido redundante en corpus de entrenamiento, dado que el modelo esta pensado para retrieval sobre pares query-document.
- Sistemas de recomendacion basados en contenido: representar descripciones de articulos como vectores y recomendar articulos similares a partir del historial de lectura o compra del usuario codificado como query.
- Evaluacion de la calidad del modelo base Rambley-V2.1-350M: usar esta preview como banco de pruebas para medir la capacidad del encoder subyacente en tareas de recuperacion antes de invertir en fine-tuning adicional o en un despliegue mayor.
- Prototipado rapido en entornos con recursos limitados: al ocupar 0,7 GB en safetensors, puede cargarse en una GPU de consumo para experimentos de similitud semantica sin infraestructura dedicada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Por el tamano del modelo (348,6M parametros, 0,7 GB en safetensors), una estimacion razonable en fp32 ronda 1,4 GB de pesos mas overhead de activaciones; en bf16/fp16 alrededor de 0,7 GB de pesos. Estas cifras son estimaciones a partir del recuento de parametros, no datos publicados.
- GPU recomendadas: no disponibles. Por tamano, cualquier GPU con al menos 4-8 GB de VRAM deberia poder ejecutarlo con comodidad.
- Cabe en GPU de consumo: previsiblemente si, en tarjetas como RTX 3060, RTX 4060 o superiores, aunque no hay confirmacion oficial.
- Opciones de despliegue: sentence-transformers (libreria oficial del modelo), ecosistema Hugging Face (endpoints_compatible segun los tags). No se documenta soporte explicito de vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Dimension de embedding | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| glossia/Rambley-V2.1-350M-Embed-Pretrain-Preview | 348,6M | 256 tokens | 896 | no disponible | Hugging Face (34 descargas) |
| nomic-embed-text (referencia del dataset) | no disponible | no disponible | no disponible | no disponible | no disponible |
| all-MiniLM-L6-v2 | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento, contexto ni licencia de los modelos alternativos en la informacion proporcionada, por lo que la comparacion cuantitativa no es posible. La unica comparacion fiable es que este modelo es un fine-tuning sobre nomic-embed-unsupervised-data, el mismo corpus empleado por la familia nomic-embed, pero sin resultados publicados que permitan situarlo frente a ella.

## Limitaciones y advertencias

- Licencia no declarada: no se puede asumir uso comercial permitido; es imprescindible contactar con el autor antes de cualquier despliegue en produccion.
- Idiomas no declarados: se desconoce que lenguas cubre el modelo y con que calidad, lo que impide garantizar su comportamiento en castellano u otros idiomas.
- Longitud de contexto muy corta: 256 tokens maximos, insuficiente para documentos largos; obliga a trocear y puede perder contexto en fragmentos complejos.
- Estado de "preview": solo 34 descargas, cero likes y sin benchmarks publicados; no hay evidencia de calidad frente a alternativas establecidas.
- Riesgo de sesgo y alucinacion: no documentado por el autor; al tratarse de un modelo de embeddings, el riesgo se traduce en recuperaciones erroneas o sesgadas segun los datos de entrenamiento, no en texto generado.
- Sin garantias de calibracion de similitudes: no se publican umbrales ni evaluaciones de recall, por lo que los scores de coseno deben validarse en el dominio concreto de uso.
- Dependencia de codigo personalizado: el tag custom_code y la arquitectura RambleyV2Model implican que la carga requiere confiar en el codigo del repositorio; conviene auditar los ficheros de modelado antes de ejecutarlo.
- Pooling lasttoken con include_prompt: el comportamiento del embedding depende de como se construya la secuencia de entrada, lo que exige respetar el formato de prompt usado en entrenamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/glossia/Rambley-V2.1-350M-Embed-Pretrain-Preview
- Modelo base: https://huggingface.co/glossia/Rambley-V2.1-350M
- Documentacion de Sentence Transformers: https://sbert.net
- Repositorio de Sentence Transformers: https://github.com/huggingface/sentence-transformers
- Modelos con sentence-transformers en Hugging Face: https://huggingface.co/models?library=sentence-transformers
- Paper de Sentence-BERT (arXiv:1908.10084): https://arxiv.org/abs/1908.10084
- Paper de CachedMultipleNegativesRankingLoss (arXiv:2101.06983): https://arxiv.org/abs/2101.06983
- Documentacion de CachedMultipleNegativesRankingLoss: https://sbert.net/docs/package_reference/sentence_transformer/losses.html#cachedmultiplenegativesrankingloss
