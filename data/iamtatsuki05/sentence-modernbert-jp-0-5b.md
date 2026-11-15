# iamtatsuki05/Sentence-ModernBERT-JP-0.5B

## Resumen

Sentence-ModernBERT-JP-0.5B es un modelo de embeddings de frases para japones desarrollado por iamtatsuki05, parte de la familia MIREI. Se trata de un encoder basado en la arquitectura ModernBERT (677.538.560 parametros totales segun los pesos en safetensors, de los cuales 548M son no-embedding) afinado mediante aprendizaje contrastivo supervisado sobre el dataset cl-nagoya/ruri-v3-dataset-ft. Genera embeddings de 1.280 dimensiones con pooling de media y soporta una longitud maxima de secuencia de 8.192 tokens.

El modelo parte del checkpoint preentrenado iamtatsuki05/Sentence-ModernBERT-JP-0.5B-PT y esta disenado especificamente para tareas de similitud semantica, recuperacion de informacion (retrieval) y clustering en japones. Su relevancia radica en que ofrece una alternativa de arquitectura encoder pura (ModernBERT) frente a los enfoques basados en decoders tipo Llama adaptados a embeddings, con un rendimiento competitivo en el benchmark JMTEB v2 y una licencia permisiva MIT.

Con 85 descargas y 2,7 GB de tamano de repositorio, es un modelo relativamente nuevo (publicado en noviembre de 2025) orientado a desarrolladores que necesitan un encoder japones eficiente para sistemas RAG, busqueda semantica o deduplicacion de documentos, con soporte para text-embeddings-inference y despliegue en endpoints compatibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ModernBERT (encoder transformer) |
| Parametros totales | 677.538.560 (679M); 548M sin embeddings |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 8.192 tokens |
| Tipos de cuantizacion | no disponible (pesos en safetensors; compatible con cuantizacion estandar de transformers, pero no se documentan variantes oficiales) |
| Idiomas soportados | Japones (ja) |
| Licencia | MIT |
| Formato de pesos | safetensors |
| Dimension de embedding | 1.280 (mean pooling) |
| Tokenizer | SentencePiece, vocabulario de 102.400 |
| Codificacion posicional | RoPE |
| Metrica de similitud | Coseno |
| Libreria | sentence-transformers (>=4.1.0), transformers (>=4.51.0) |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura ModernBERT, un transformer encoder modernizado que incorpora RoPE (Rotary Positional Embeddings) y atencion con Flash Attention 2, lo que permite manejar secuencias de hasta 8.192 tokens de forma eficiente. El tokenizer es SentencePiece con un vocabulario de 102.400 tokens, optimizado para japones. La salida se obtiene mediante mean pooling sobre las representaciones del encoder, produciendo un vector de 1.280 dimensiones normalizado para similitud coseno.

El entrenamiento parte del checkpoint preentrenado iamtatsuki05/Sentence-ModernBERT-JP-0.5B-PT y aplica aprendizaje contrastivo supervisado sobre el dataset cl-nagoya/ruri-v3-dataset-ft. No se detalla en la informacion disponible el numero exacto de tokens de entrenamiento, la composicion completa del dataset ni si se emplearon tecnicas adicionales como DPO o RLHF (poco habituales en modelos de embeddings). El trabajo asociado se documenta en el articulo "同一条件下における Encoder/Decoder アーキテクチャによる文埋め込みの性能分析" (NLP2026), que analiza el rendimiento de embeddings de frases segun arquitectura encoder frente a decoder bajo condiciones identicas.

## Capacidades

- Generacion de embeddings de frases en japones de 1.280 dimensiones con normalizacion para similitud coseno.
- Similitud semantica entre frases (sentence-similarity) y pares query-documento.
- Recuperacion de informacion (retrieval) y busqueda semantica densa.
- Clustering y agrupacion de documentos por similitud.
- Reranking de resultados de busqueda.
- Clasificacion de texto basada en representaciones (JMTEB-Classification).
- Soporte de secuencias largas de hasta 8.192 tokens, adecuado para documentos extensos.
- Compatible con text-embeddings-inference y endpoints compatibles.
- No soporta tool calling, function calling ni razonamiento multi-paso (es un encoder, no un modelo generativo).
- Capacidad multilingue limitada al japones.

## Casos de uso

- Busqueda semantica en corpus japoneses: el modelo genera embeddings normalizados de 1.280 dimensiones que permiten indexar documentos y recuperar los mas relevantes ante una consulta en japones, aprovechando la ventana de 8.192 tokens para fragmentos largos.
- Sistemas RAG (Retrieval-Augmented Generation) en japones: actua como componente de recuperacion densa antes de un modelo generativo, con integracion directa en pipelines de sentence-transformers y text-embeddings-inference.
- Deduplicacion y clustering de documentos: agrupar articulos, tickets o registros por similitud coseno para eliminar duplicados o organizar contenido, usando la faceta de clustering del benchmark JMTEB.
- Reranking de resultados de busqueda: reordenar candidatos recuperados por un motor lexico (BM25) segun similitud semantica, tarea en la que el modelo obtiene 65,11 en JMTEB-Reranking.
- Clasificacion de texto por similitud: asignar categorias comparando embeddings de documentos con embeddings de etiquetas o prototipos, sin necesidad de un clasificador supervisado adicional.
- Moderacion o filtrado de contenido: detectar textos semanticamente proximos a patrones definidos mediante comparacion de embeddings, adecuado para volumeres altos por el tamano compacto del modelo (679M parametros).
- Busqueda en bases de conocimiento internas: indexar documentacion tecnica o manuales en japones y ofrecer busqueda semantica con contexto largo gracias a los 8.192 tokens.

## Benchmarks y rendimiento

Resultados en JMTEB v2 segun la model card del autor:

| Modelo | Arquitectura | Parametros | JMTEB-Avg | JMTEB-Retrieval | JMTEB-STS | JMTEB-Classification | JMTEB-Reranking | JMTEB-Clustering |
|---|---|---|---|---|---|---|---|---|
| Sentence-ModernBERT-JP-0.5B (este modelo) | ModernBERT | 679M (548M sin emb.) | 62,07 | 61,11 | 80,61 | 55,38 | 65,11 | 48,15 |
| Sentence-Llama-Bi-JP-0.5B | Llama | 661M (530M sin emb.) | 57,13 | 50,17 | 77,67 | 52,96 | 56,99 | 47,85 |
| Sentence-Sarashina-Bi-0.5B | Llama | 661M (530M sin emb.) | 62,81 | 55,47 | 83,44 | 58,50 | 66,82 | 49,80 |

Cada puntuacion de familia promedia todos los datasets, splits y subconjuntos de la familia; JMTEB-Avg es la media macro sobre las cinco familias. Este modelo destaca en JMTEB-Retrieval (61,11, el mejor de la comparativa), mientras que Sentence-Sarashina-Bi-0.5B obtiene mejores resultados en el resto de familias y en la media global.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,4 GB en bfloat16 (679M parametros x 2 bytes); en float32 unos 2,7 GB. Con cuantizacion a 8 bits se reduce a unos 0,7 GB.
- GPU recomendadas: cualquier GPU con al menos 2-4 GB de VRAM. Para alto throughput, A100, H100 o L40S; para desarrollo, RTX 4090, RTX 3090 o RTX 4060 Ti.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU moderna (incluso GTX 1660 con 6 GB o superiores), asi como en CPU para cargas moderadas.
- Opciones de despliegue: sentence-transformers (recomendado), text-embeddings-inference, transformers con Flash Attention 2, endpoints compatibles. No se documenta soporte explicito de llama.cpp u Ollama (orientados a modelos generativos).
- Latencia y throughput: no disponible en la informacion proporcionada. El uso de Flash Attention 2 y bfloat16 sugiere buen rendimiento en GPUs Ampere o superiores, pero no se publican cifras concretas.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parametros | Contexto | JMTEB-Avg | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Sentence-ModernBERT-JP-0.5B | ModernBERT | 679M | 8.192 | 62,07 | MIT | Hugging Face |
| Sentence-Llama-Bi-JP-0.5B | Llama | 661M | no disponible | 57,13 | no disponible en la informacion | Hugging Face |
| Sentence-Sarashina-Bi-0.5B | Llama | 661M | no disponible | 62,81 | no disponible en la informacion | Hugging Face |

Los tres modelos pertenecen a la misma familia MIREI del mismo autor y comparten el dataset de fine-tuning (cl-nagoya/ruri-v3-dataset-ft). La diferencia principal es la arquitectura base: ModernBERT (encoder) frente a Llama (decoder adaptado a embeddings). El modelo ModernBERT lidera en retrieval (61,11 frente a 55,47 y 50,17) y ofrece contexto de 8.192 tokens, mientras que Sarashina-Bi-0.5B obtiene mejores medias globales y en STS, clasificacion, reranking y clustering.

## Limitaciones y advertencias

- Solo soporta japones; su uso con otros idiomas producira embeddings de baja calidad.
- Es un modelo de embeddings, no generativo: no puede responder preguntas ni generar texto directamente.
- Riesgo de sesgos presente en los datos de entrenamiento (cl-nagoya/ruri-v3-dataset-ft), no documentados en detalle.
- No se publican datos sobre tasas de alucinacion ni sobre robustez ante dominios especializados (legal, medico, tecnico).
- La longitud de contexto de 8.192 tokens es amplia, pero no se documenta el rendimiento en el extremo de esa ventana.
- Licencia MIT: permite uso comercial sin restricciones significativas, pero conviene verificar las condiciones del dataset de entrenamiento subyacente.
- Requiere versiones especificas de librerias (sentence-transformers>=4.1.0, transformers>=4.51.0, flash-attn>=2.7.3) para un funcionamiento optimo.
- Con solo 85 descargas y 0 likes en el momento de la consulta, la validacion por parte de la comunidad es limitada; conviene evaluar en el dominio propio antes de produccion.
- No hay informacion sobre cuantizaciones oficiales ni sobre soporte en motores de inferencia alternativos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/iamtatsuki05/Sentence-ModernBERT-JP-0.5B
- Checkpoint preentrenado base: https://huggingface.co/iamtatsuki05/Sentence-ModernBERT-JP-0.5B-PT
- Coleccion MIREI: https://huggingface.co/collections/iamtatsuki05/mirei
- Repositorio GitHub: https://github.com/iamtatsuki05/MIREI
- Dataset de fine-tuning: https://huggingface.co/datasets/cl-nagoya/ruri-v3-dataset-ft
- Modelo comparable Sentence-Llama-Bi-JP-0.5B: https://huggingface.co/iamtatsuki05/Sentence-Llama-Bi-JP-0.5B
- Modelo comparable Sentence-Sarashina-Bi-0.5B: https://huggingface.co/iamtatsuki05/Sentence-Sarashina-Bi-0.5B
- Licencia MIT: https://opensource.org/license/mit/
