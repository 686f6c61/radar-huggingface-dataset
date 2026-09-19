# seamon67/WeMM-Embedding-9B-GGUF

## Resumen

WeMM-Embedding-9B es un modelo de embeddings multimodales universales desarrollado por Tencent, construido sobre Qwen3.5. Acepta texto, imagenes, videos, documentos visuales y entradas multimodales intercaladas, y devuelve un vector de 4.096 dimensiones normalizado en L2. La version que nos ocupa, seamon67/WeMM-Embedding-9B-GGUF, es una conversion no oficial al formato GGUF realizada con una version modificada de llama.cpp (release b10269) a partir de los pesos originales de Tencent.

El proposito del modelo es unificar la recuperacion multimodal en un unico espacio vectorial: en lugar de mantener un encoder de texto, otro de imagen y otro de video, WeMM-Embedding permite indexar y consultar indistintamente cualquiera de esas modalidades con la misma representacion, lo que simplifica mucho las arquitecturas de RAG multimodal y de busqueda semantica sobre corpus heterogeneos. La informacion no incluye el numero de tokens de entrenamiento ni la composicion del dataset.

La relevancia actual del modelo radica en dos factores. Por un lado, encabeza la tabla comparativa MMEB-v2 con 80,6 puntos de media en su variante de 9B, por delante de alternativas de tamano equivalente como Qwen3-VL-Embedding 8B (77,8) o GME 8B (59,2). Por otro, la conversion a GGUF abre la puerta a desplegarlo en llama.cpp y en entornos de inferencia local con recursos limitados, algo poco habitual en modelos de embeddings multimodales de este tamano. El repositorio GGUF no registra descargas ni valoraciones en el momento de redactar esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal basado en Qwen3.5; modelo de embeddings (pooling), no generativo |
| Parametros totales | 9B (modelo base tencent/WeMM-Embedding-9B) |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repositorio GGUF ocupa 9,4 GB; no se detalla la lista de ficheros ni los niveles de cuantizacion) |
| Idiomas soportados | chino (zh) e ingles (en) |
| Licencia | apache-2.0 (etiquetada en HuggingFace como license:other con license_name: apache-2.0) |
| Formato de pesos | GGUF (llama.cpp); el modelo original se publica en safetensors |
| Dimension del embedding | 4.096, normalizado en L2 |
| Matryoshka (MRL) | si, truncable (por ejemplo a 256); las dimensiones validas estan en model.config.matryoshka_dimensions |
| Modalidades de entrada | texto, imagen, video, documentos visuales y combinaciones intercaladas; audio no soportado |
| Pipeline declarado | feature-extraction |
| Repositorio | seamon67/WeMM-Embedding-9B-GGUF |

## Arquitectura y entrenamiento

Se trata de un transformer multimodal derivado de Qwen3.5 que funciona exclusivamente como extractor de caracteristicas: no genera texto, sino que proyecta cada entrada a un unico vector de 4.096 dimensiones normalizado en L2. El procesamiento de imagenes y video se realiza con qwen-vl-utils (con parche de 16 pixeles para las imagenes) y el modelo puede recibir varias imagenes o videos intercalados en un mismo mensaje mediante plantillas de chat, lo que permite construir representaciones conjuntas de texto e imagen en una sola pasada.

La informacion proporcionada no detalla el volumen de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de alineacion como RLHF o DPO. Si se documenta el soporte de Matryoshka Representation Learning (MRL), que permite truncar el vector y renormalizarlo para operar con dimensiones menores con una perdida controlada de calidad, y la separacion entre codificacion de consultas (encode_query) y de documentos (encode_document) en la interfaz de Sentence Transformers. El modelo incluye un template de chat especifico para embeddings (embedding_chat_template.jinja) y soporte de despliegue mediante runner de pooling en vLLM 0.27.0 y mediante --is-embedding con interpolacion precisa en SGLang 0.5.9.

## Capacidades

- Generacion de embeddings de texto con salida de 4.096 dimensiones normalizada en L2.
- Generacion de embeddings de imagen, tanto desde ficheros y URLs como desde objetos PIL.Image.
- Generacion de embeddings de video (procesado con decord a traves de qwen-vl-utils).
- Embeddings de documentos visuales, con evaluacion especifica mediante NDCG@5 en el benchmark MMEB-v2 (paginas escaneadas, presentaciones, figuras, diagramas).
- Entradas multimodales intercaladas: varias imagenes, varios videos y texto combinados en un mismo mensaje para producir un unico embedding conjunto.
- Codificacion asimetrica query/documento (encode_query y encode_document) para tareas de recuperacion.
- Embeddings Matryoshka: truncado a dimensiones menores con renormalizacion (por ejemplo, 256), util para indexacion aproximada o para reducir coste de almacenamiento.
- Integracion con Sentence Transformers (>= 5.7.0) y con Transformers 5.2.0 mediante AutoModel y AutoProcessor con trust_remote_code.
- Despliegue como servicio de embeddings con vLLM en modo pooling y con SGLang en modo embedding.
- No soporta audio.
- No soporta tool calling ni function calling: es un modelo de representacion, no un modelo de chat con herramientas.
- No soporta agentes ni razonamiento multi-paso, ni dispone de modo de pensamiento (thinking mode).
- Cobertura multilingue limitada a chino e ingles.

## Casos de uso

- Busqueda semantica multimodal en RAG: indexar un corpus mixto de texto, imagenes y videos en un unico espacio vectorial de 4.096 dimensiones y recuperar los fragmentos mas relevantes para una consulta en lenguaje natural, evitando mantener pipelines separados por modalidad.
- Recuperacion de documentos visuales en entornos empresariales: indexar facturas escaneadas, contratos en PDF, diapositivas y manuales tecnicos, y localizar paginas concretas a partir de una consulta textual. La puntuacion de 83,3 en tareas de documentos visuales en MMEB-v2 lo hace adecuado para este escenario.
- Busqueda en bibliotecas de video: generar embeddings de fragmentos de video y permitir consultas como "donde se explica el proceso de montaje", sin necesidad de transcripcion previa. La puntuacion de 74,3 en tareas de video es la mas alta de la comparativa MMEB-v2.
- Deduplicacion y near-duplicate detection: comparar embeddings de imagenes, videos o documentos para detectar copias, versiones casi identicas o contenido reutilizado en catalogos de gran volumen.
- Clustering y organizacion de activos digitales: agrupar automaticamente un archivo fotografico o audiovisual por similitud semantica, sin etiquetas manuales, gracias a la similitud coseno entre vectores L2-normalizados.
- Clasificacion zero-shot y few-shot: usar los embeddings como caracteristicas de entrada para un clasificador ligero (regresion logistica, SVM) en tareas de moderacion, enrutado de tickets o etiquetado de contenidos.
- Sistemas de recomendacion: representar items heterogeneos (ficha de producto con texto e imagen, video promocional) en un espacio comun y calcular similitud entre usuario e item.
- Evaluacion de calidad de descripciones: medir la similitud entre un texto generado y el contenido visual al que hace referencia, como metrica automatica en pipelines de generacion de subtitulos o descripciones de producto.
- Indexacion en local con recursos limitados: al disponer de pesos GGUF, se puede desplegar en infraestructura propia sin GPU de gama alta para tareas de recuperacion sobre volumenes moderados.

## Benchmarks y rendimiento

Los datos disponibles corresponden al modelo original en la tabla 1 del informe tecnico (78 datasets del benchmark MMEB-v2). Las tareas de imagen y video se miden con Hit@1 y las de documentos visuales con NDCG@5. No hay resultados publicados especificos para la version cuantizada en GGUF.

| Modelo | Tamaño | Media | Imagen | Video | DocVisual |
|---|---:|---:|---:|---:|---:|
| VLM2Vec | 2B | 47,8 | 59,7 | 29,0 | 44,0 |
| GME | 2B | 55,4 | 51,9 | 33,9 | 76,8 |
| VLM2Vec-V2 | 2B | 59,3 | 64,9 | 34,9 | 69,2 |
| Qwen3-VL-Embedding | 2B | 73,2 | 75,0 | 61,9 | 79,2 |
| DME-Small (cerrado) | 2B | 74,8 | 75,9 | 65,6 | 79,9 |
| WeMM-Embedding | 2B | 77,9 | 79,6 | 70,8 | 80,7 |
| WeMM-Embedding | 4B | 79,2 | 80,8 | 72,1 | 82,0 |
| VLM2Vec | 8B | 53,2 | 65,5 | 34,0 | 49,1 |
| GME | 8B | 59,2 | 56,0 | 38,6 | 79,3 |
| Qwen3-VL-Embedding | 8B | 77,8 | 80,1 | 67,1 | 82,4 |
| DME-Medium (cerrado) | 9B | 78,4 | 79,8 | 70,8 | 82,0 |
| WeMM-Embedding | 9B | 80,6 | 81,9 | 74,3 | 83,3 |

## Requisitos de hardware

Las cifras de VRAM que se indican a continuacion son estimaciones a partir del numero de parametros del modelo base (9B); la informacion proporcionada no incluye requisitos oficiales.

- Pesos en bf16/fp16 (formato original): aproximadamente 18 GB solo de pesos, mas activaciones y memoria de las caracteristicas visuales. Requiere GPU de 24 GB o superior; una RTX 3090 o RTX 4090 puede ser justa, y se recomienda A100 40/80 GB o H100 para lotes grandes.
- Pesos GGUF de 8 bits: aproximadamente 10-11 GB. Cabe con holgura en GPUs de 16-24 GB (RTX 4080, RTX 4090, A10G, L4) y de forma ajustada en 12 GB con secuencias cortas.
- Pesos GGUF de 4 bits: aproximadamente 5,5-6 GB. Permite ejecucion en GPUs consumer de 8-12 GB (RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070).
- Las entradas de video son el principal consumidor de memoria: cada fotograma se convierte en un numero elevado de tokens visuales, por lo que la VRAM real depende mucho del numero de frames y de la resolucion.
- Opciones de despliegue: llama.cpp (release b10269 o posterior, segun el autor de la conversion), vLLM 0.27.0 con --runner pooling y el chat template de embeddings, SGLang 0.5.9 con --is-embedding, y Sentence Transformers >= 5.7.0 con trust_remote_code.
- La informacion no especifica si el repositorio GGUF incluye el proyector multimodal (mmproj) necesario para procesar imagen y video en llama.cpp; conviene verificarlo antes de planificar un despliegue de este tipo.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Media MMEB-v2 | Imagen | Video | DocVisual | Licencia | Disponibilidad |
|---|---:|---:|---:|---:|---:|---|---|
| WeMM-Embedding 9B (objeto de esta ficha) | 9B | 80,6 | 81,9 | 74,3 | 83,3 | apache-2.0 | pesos abiertos (safetensors y GGUF no oficial) |
| WeMM-Embedding 4B / 2B | 4B / 2B | 79,2 / 77,9 | 80,8 / 79,6 | 72,1 / 70,8 | 82,0 / 80,7 | apache-2.0 (segun la ficha del 9B) | pesos abiertos |
| Qwen3-VL-Embedding 8B | 8B | 77,8 | 80,1 | 67,1 | 82,4 | no disponible | pesos abiertos |
| GME 8B | 8B | 59,2 | 56,0 | 38,6 | 79,3 | no disponible | pesos abiertos |
| VLM2Vec-V2 2B / VLM2Vec 8B | 2B / 8B | 59,3 / 53,2 | 64,9 / 65,5 | 34,9 / 34,0 | 69,2 / 49,1 | no disponible | pesos abiertos |
| DME-Medium | 9B | 78,4 | 79,8 | 70,8 | 82,0 | no disponible | cerrado, sin pesos publicos |

La comparativa se limita a los modelos presentes en la tabla del informe tecnico; no se dispone de datos de otras alternativas de embeddings multimodales en la informacion proporcionada. Destaca la ventaja de WeMM-Embedding 9B en tareas de video (+7,2 puntos sobre Qwen3-VL-Embedding 8B) y su rendimiento en documentos visuales, mientras que en tareas de imagen la diferencia con Qwen3-VL-Embedding 8B es de menos de 2 puntos.

## Limitaciones y advertencias

- No es un modelo generativo: no produce texto, codigo ni respuestas en lenguaje natural. Cualquier uso conversacional, de razonamiento o de agentes queda fuera de su alcance.
- Cobertura de idiomas limitada a chino e ingles segun la model card. El comportamiento en castellano no esta documentado y no hay evaluaciones en esta lengua.
- No soporta entrada de audio.
- La longitud de contexto no se especifica en la informacion disponible, lo que dificulta dimensionar la indexacion de documentos largos o videos extensos.
- El rendimiento publicado corresponde al modelo original en precision completa. La cuantizacion a GGUF puede degradar la calidad de los embeddings; no hay cifras que cuantifiquen esa perdida.
- Los sesgos del modelo base Qwen3.5 no se detallan en la model card. Al tratarse de un modelo entrenado predominantemente con datos en chino e ingles, es esperable un sesgo cultural y linguistico hacia esos idiomas.
- Al ser un modelo de recuperacion, los errores se manifiestan como falsos positivos o falsos negativos en la busqueda, no como alucinaciones de texto. En un RAG, un embedding erroneo puede llevar a citar documentos irrelevantes.
- La licencia figura como apache-2.0 en el campo LICENSE de HuggingFace, pero la etiqueta del repositorio indica license:other con license_name: apache-2.0. Conviene verificar los terminos exactos y las condiciones de uso comercial antes de un despliegue en produccion, tanto del modelo base como de la conversion.
- La conversion GGUF la realiza un tercero (seamon67) y no Tencent. El repositorio no registra descargas ni valoraciones, por lo que no hay validacion de la comunidad sobre su correcto funcionamiento.
- El autor indica que funciona con versiones modernas de llama.cpp, pero no se documentan pruebas en todas las plataformas ni el soporte completo de vision en todos los backends.
- Dependencia de trust_remote_code en Transformers y Sentence Transformers, lo que implica ejecutar codigo del autor del modelo; debe revisarse en entornos con requisitos de seguridad estrictos.
- La fecha de creacion del repositorio (2026-09-19) y las versiones de librerias citadas (Transformers 5.2.0, vLLM 0.27.0, SGLang 0.5.9) son coherentes con el ecosistema descrito, pero implican que el modelo puede requerir versiones muy recientes de las herramientas.

## Enlaces

- Repositorio GGUF: https://huggingface.co/seamon67/WeMM-Embedding-9B-GGUF
- Modelo original: https://huggingface.co/tencent/WeMM-Embedding-9B
- Coleccion de Tencent en HuggingFace: https://huggingface.co/collections/tencent/wemm-embedding
- Informe tecnico (arXiv): https://arxiv.org/abs/2608.24053
- Repositorio GitHub: https://github.com/Tencent/WeMM-Embedding
- Informe tecnico en PDF: https://github.com/Tencent/WeMM-Embedding/blob/main/assets/WeMM_Embedding_tech_report.pdf
- La busqueda web realizada no devolvio resultados relevantes sobre este modelo; los enlaces anteriores proceden de la model card y de los metadatos del repositorio.
