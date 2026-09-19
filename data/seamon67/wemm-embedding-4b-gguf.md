# seamon67/WeMM-Embedding-4B-GGUF

## Resumen

WeMM-Embedding-4B-GGUF es la conversion a formato GGUF del modelo multimodal de embeddings tencent/WeMM-Embedding-4B, publicada por el usuario seamon67. El modelo original lo desarrolla Tencent y esta construido sobre Qwen3.5: acepta texto, imagenes, video, documentos visuales e entradas multimodales intercaladas, y devuelve un unico vector de embedding L2-normalizado de 2.560 dimensiones. No admite audio.

La relevancia de esta conversion es de tipo practico: permite ejecutar un modelo de embeddings multimodales de 4.000 millones de parametros mediante llama.cpp, sin depender de una pila de transformers completa ni de GPUs de datacenter. El modelo original esta pensado para recuperacion e indexacion semantica sobre corpus heterogeneos donde conviven texto, capturas, PDFs escaneados y clips de video.

Segun la tabla de evaluacion MMEB-v2 incluida en la model card del autor original, la variante de 4B alcanza una media de 79,2 puntos sobre 78 conjuntos de datos, por delante de Qwen3-VL-Embedding 2B (73,2) y de la propia variante de 2B del mismo modelo (77,9), y cerca de la variante de 9B (80,6). La licencia declarada presenta una discrepancia entre los metadatos de HuggingFace (apache-2.0) y el frontmatter de la model card (license: other), lo que conviene verificar antes de un uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal derivado de Qwen3.5 (encoder de vision + torre de texto), orientado a extraccion de caracteristicas |
| Parametros totales | 4B (modelo base tencent/WeMM-Embedding-4B) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible en detalle; el repositorio GGUF ocupa 5,2 GB y fue generado con llama.cpp release b10269 |
| Idiomas soportados | chino (zh) e ingles (en) |
| Licencia | discrepancia: los metadatos de HuggingFace indican apache-2.0; el frontmatter de la model card indica license: other con license_name: apache-2.0 |
| Formato de pesos | GGUF (original en safetensors para transformers) |
| Dimension del embedding | 2.560, L2-normalizado |
| MRL (Matryoshka) | si, con truncado a dimensiones listadas en model.config.matryoshka_dimensions (ejemplo de la model card: d=256) |
| Modalidades de entrada | texto, imagen, video, documento visual, entradas intercaladas; audio no soportado |
| Libreria de inferencia | llama.cpp; el modelo original soporta transformers 5.2.0, sentence-transformers >=5.7.0, vLLM 0.27.0 y SGLang 0.5.9 |
| Pipeline declarado | feature-extraction |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre el entrenamiento en el material proporcionado. Lo que si consta es que el modelo esta construido sobre Qwen3.5 y que es un modelo universal de embeddings multimodales: procesa texto, imagenes, video y documentos visuales, ademas de entradas intercaladas que combinan varias modalidades en una misma secuencia (por ejemplo, una imagen y un texto, o varios fotogramas de video con una consulta). El procesador aplica una plantilla de chat y el modelo expone un metodo especifico `model.embedding(**inputs)` para obtener el vector final.

La innovacion tecnica mas concreta documentada es el uso de Matryoshka Representation Learning: el embedding completo de 2.560 dimensiones puede truncarse a dimensiones menores (por ejemplo 256) renormalizando el vector, lo que permite reducir costes de almacenamiento y latencia de busqueda vectorial a cambio de una perdida de calidad controlada. En el lado del despliegue, la model card original documenta el uso de vLLM con `--runner pooling` y un chat template especifico (`embedding_chat_template.jinja`), y de SGLang 0.5.9 con `--is-embedding --enable-precise-embedding-interpolation` mas un parche (`patch_sglang_video.py`) para el procesamiento de video. No se detalla en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset ni si hubo etapas de RLHF o DPO, algo poco habitual en modelos de embeddings puros.

## Capacidades

- Generacion de embeddings de texto: codifica consultas y documentos en un espacio vectorial comun de 2.560 dimensiones.
- Embeddings de imagen: acepta rutas, URLs u objetos PIL.Image.
- Embeddings de video: procesa clips mediante qwen-vl-utils con decodificacion decord, con soporte de metadatos de video.
- Embeddings de documentos visuales: orientado a recuperacion sobre documentos con estructura visual (la evaluacion usa NDCG@5 para esta categoria).
- Entradas multimodales intercaladas: un mismo input puede combinar imagen, video y texto mediante mensajes con `content` de varios tipos.
- Recuperacion asimetrica query/document: expone `encode_query` y `encode_document` en la API de sentence-transformers.
- Embeddings con dimension reducible via MRL, truncando y renormalizando.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso: es un modelo de extraccion de caracteristicas, no generativo conversacional.
- No soporta audio.
- Capacidades multilingues limitadas a chino e ingles segun los metadatos declarados.

## Casos de uso

- Busqueda semantica multimodal sobre repositorios de producto: indexar fichas tecnicas, fotos de producto y videos demostrativos en un mismo espacio vectorial permite una consulta en lenguaje natural que recupere indistintamente el PDF, la imagen o el clip relevante, sin necesidad de pipelines separados por modalidad.
- Recuperacion aumentada (RAG) sobre documentacion corporativa: los documentos visuales (presentaciones, PDFs maquetados, capturas de paneles) se codifican directamente sin OCR previo, y las consultas de texto se comparan contra ese indice con `encode_query` frente a `encode_document`.
- Moderacion y deduplicacion de contenido: calcular similitud entre imagenes y videos para detectar material duplicado o casi duplicado en una plataforma, aprovechando el truncado MRL para usar vectores de 256 dimensiones cuando el volumen es alto y la precision no es critica.
- Recomendacion de contenido audiovisual: construir un indice de embeddings de trailers y clips y recomendar a partir de una descripcion textual del interes del usuario, o a partir de un clip de referencia.
- Analisis de video para monitorizacion: codificar fotogramas o clips cortos y agruparlos por similitud para detectar eventos repetidos o anomalias respecto a un conjunto de referencia.
- Clasificacion y enrutado de tickets de soporte con adjuntos: el modelo permite vectorizar el texto del ticket junto con la captura de pantalla adjunta en un unico embedding, mejorando el enrutado automatico frente a sistemas que solo miran el texto.
- Construccion de indices vectoriales de bajo coste: gracias a MRL y a la cuantizacion GGUF, se puede reducir el almacenamiento por vector hasta un orden de magnitud (2.560 frente a 256 dimensiones) manteniendo una calidad degradada de forma controlada.
- Deduplicacion de datasets de entrenamiento: comparar pares texto-imagen o texto-video a gran escala para eliminar muestras redundantes antes de entrenar otros modelos.

## Benchmarks y rendimiento

Resultados publicados en la model card original, sobre 78 conjuntos de datos de MMEB-v2. Las tareas de imagen y video usan Hit@1; las de documento visual, NDCG@5. Mayor es mejor.

| Modelo | Tamano | AVG | Image | Video | VisDoc |
|---|---:|---:|---:|---:|---:|
| VLM2Vec | 2B | 47,8 | 59,7 | 29,0 | 44,0 |
| GME | 2B | 55,4 | 51,9 | 33,9 | 76,8 |
| VLM2Vec-V2 | 2B | 59,3 | 64,9 | 34,9 | 69,2 |
| Qwen3-VL-Embedding | 2B | 73,2 | 75,0 | 61,9 | 79,2 |
| DME-Small (†) | 2B | 74,8 | 75,9 | 65,6 | 79,9 |
| WeMM-Embedding | 2B | 77,9 | 79,6 | 70,8 | 80,7 |
| **WeMM-Embedding** | **4B** | **79,2** | **80,8** | **72,1** | **82,0** |
| VLM2Vec | 8B | 53,2 | 65,5 | 34,0 | 49,1 |
| GME | 8B | 59,2 | 56,0 | 38,6 | 79,3 |
| Qwen3-VL-Embedding | 8B | 77,8 | 80,1 | 67,1 | 82,4 |
| DME-Medium (†) | 9B | 78,4 | 79,8 | 70,8 | 82,0 |
| **WeMM-Embedding** | **9B** | **80,6** | **81,9** | **74,3** | **83,3** |

(†) Envio cerrado al leaderboard, sin modelo publicado.

No se han publicado en la informacion disponible resultados de benchmarks especificos para la version GGUF cuantizada; los datos anteriores corresponden a los pesos originales.

## Requisitos de hardware

- VRAM estimada para la variante de 4B: en torno a 8 GB para pesos en precision completa (BF16/FP16), aproximadamente 4-5 GB en una cuantizacion de 8 bits y del orden de 2,5-3,5 GB en cuantizaciones de 4 bits. Son estimaciones derivadas del numero de parametros, no datos publicados.
- A esas cifras hay que sumar la memoria del encoder de vision y las activaciones, que crecen con el numero de imagenes o fotogramas procesados por lote; en video conviene dimensionar con margen adicional.
- GPU recomendadas: tarjetas de datacenter (A100, H100, L40S) para indexacion masiva por lotes; en el lado consumer, una RTX 4090 (24 GB), RTX 4080 o RTX 3090 permiten ejecutar la version cuantizada con holgura, y tarjetas de 8-12 GB como RTX 4060 Ti 16 GB o RTX 3060 12 GB son suficientes para cuantizaciones de 4 bits.
- Si cabe en GPU consumer: si, en cualquiera con 8 GB o mas de VRAM usando cuantizacion de 4-8 bits. Para lotes grandes de video conviene subir a 16-24 GB.
- Opciones de despliegue: llama.cpp para la version GGUF (probada a partir de la release b10269); vLLM 0.27.0 con `--runner pooling` y el chat template de embedding; SGLang 0.5.9 con `--is-embedding`; y sentence-transformers >=5.7.0 con `truncate_dim` para MRL. Tambien transformers 5.2.0 con qwen-vl-utils.
- Latencia y throughput: no disponible. Depende fuertemente de la cuantizacion elegida, del numero de fotogramas por video y del backend de serving.

## Comparativa con modelos similares

| Modelo | Parametros | AVG MMEB-v2 | Licencia | Disponibilidad | Notas |
|---|---:|---:|---|---|---|
| WeMM-Embedding-4B | 4B | 79,2 | apache-2.0 / other (segun fuente) | Pesos abiertos + GGUF de terceros | Embedding multimodal texto/imagen/video/VisDoc, soporte MRL |
| Qwen3-VL-Embedding | 2B / 8B | 73,2 / 77,8 | no disponible en la informacion proporcionada | Pesos abiertos | Alternativa directa de la misma familia base (Qwen3.5); la variante de 8B supera al WeMM de 4B en AVG |
| VLM2Vec-V2 | 2B | 59,3 | no disponible en la informacion proporcionada | Pesos abiertos | Rendimiento claramente inferior en video (34,9 frente a 72,1 del WeMM 4B) |
| GME | 2B / 8B | 55,4 / 59,2 | no disponible en la informacion proporcionada | Pesos abiertos | Buen rendimiento en documento visual (76,8 / 79,3), muy bajo en video |
| DME-Small / DME-Medium | 2B / 9B | 74,8 / 78,4 | no disponible (envios cerrados) | No publicados | Referencia de leaderboard sin pesos disponibles |

## Limitaciones y advertencias

- Solo se declaran capacidades en chino e ingles. El rendimiento en castellano u otras lenguas no esta documentado y puede degradarse de forma notable.
- No es un modelo generativo: no produce texto, no hace razonamiento, no soporta tool calling ni uso como agente. Solo devuelve vectores.
- No admite audio; pese a la etiqueta "multimodal", la cobertura se limita a texto, imagen, video y documento visual.
- La longitud de contexto no esta publicada en la informacion disponible, lo que dificulta planificar la indexacion de documentos largos o videos extensos.
- Discrepancia de licencia: los metadatos de HuggingFace indican apache-2.0 mientras que el frontmatter de la model card indica `license: other` con `license_name: apache-2.0`. Verificar la licencia del modelo base antes de cualquier uso comercial.
- El repositorio GGUF tiene 0 descargas y 0 likes, y fue creado por un tercero (seamon67), no por Tencent. La conversion no cuenta con validacion independiente ni con cifras de degradacion por cuantizacion.
- Aunque la model card del GGUF afirma que funciona "en cualquier version moderna de llama.cpp", no se documenta en la informacion disponible el grado de soporte de embeddings multimodales (imagen y sobre todo video) en llama.cpp. El propio modelo original recomienda vLLM o SGLang para servir con vision, con parches especificos para video en el caso de SGLang.
- Riesgo de alucinacion no aplica en el sentido generativo clasico, pero si existe riesgo de falsos positivos en la recuperacion: embeddings con alta similitud coseno no garantizan relevancia semantica real, especialmente entre modalidades distintas.
- La evaluacion reportada proviene del equipo que desarrolla el modelo; no hay verificacion por terceros en la informacion disponible.
- Los modelos de embeddings pueden heredar sesgos presentes en sus datos de entrenamiento y producir agrupaciones discriminatorias por atributos demograficos en tareas de clasificacion o moderacion.

## Enlaces

- Modelo GGUF en HuggingFace: https://huggingface.co/seamon67/WeMM-Embedding-4B-GGUF
- Modelo base original: https://huggingface.co/tencent/WeMM-Embedding-4B
- Coleccion de Tencent en HuggingFace: https://huggingface.co/collections/tencent/wemm-embedding
- Informe tecnico (arXiv): https://arxiv.org/abs/2608.24053
- Repositorio en GitHub: https://github.com/Tencent/WeMM-Embedding
- PDF del informe tecnico: https://github.com/Tencent/WeMM-Embedding/blob/main/assets/WeMM_Embedding_tech_report.pdf

Nota: la busqueda web realizada no ha devuelto resultados relacionados con el modelo; los enlaces anteriores proceden de la model card y de los metadatos de HuggingFace.
