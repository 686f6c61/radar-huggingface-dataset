# onnx-community/paraphrase-multilingual-MiniLM-L12-v2-ONNX

## Resumen

El modelo `onnx-community/paraphrase-multilingual-MiniLM-L12-v2-ONNX` es una versión convertida a formato ONNX del modelo original `sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2`, desarrollado por la comunidad de ONNX y publicado bajo licencia Apache 2.0. Se trata de un modelo de embeddings de frases basado en la arquitectura BERT (MiniLM de 12 capas) que mapea oraciones y párrafos a un espacio vectorial denso de 384 dimensiones. Su propósito principal es la similitud semántica entre textos, permitiendo tareas como búsqueda semántica, clustering y clasificación de textos.

La conversión a ONNX facilita su uso en entornos sin PyTorch, incluyendo JavaScript a través de Transformers.js, así como en despliegues con ONNX Runtime. El modelo soporta más de 50 idiomas, lo que lo hace adecuado para aplicaciones multilingües. La longitud máxima de contexto es de 128 tokens, un valor moderado que limita el tamaño de los textos procesables. El repositorio tiene un tamaño de 1.5 GB y no registra descargas ni likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BERT (MiniLM) con pooling de media |
| Parametros totales | no disponible |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 128 tokens |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | Multilingüe: ar, bg, ca, cs, da, de, el, en, es, et, fa, fi, fr, gl, gu, he, hi, hr, hu, hy, id, it, ja, ka, ko, ku, lt, lv, mk, mn, mr, ms, my, nb, nl, pl, pt, ro, ru, sk, sl, sq, sr, sv, th, tr, uk, ur, vi (más variantes regionales como fr-ca, pt-br, zh-cn, zh-tw) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX |

## Arquitectura y entrenamiento

El modelo es una conversión directa a ONNX del modelo `paraphrase-multilingual-MiniLM-L12-v2` de sentence-transformers. La arquitectura subyacente es un transformer BERT de tipo MiniLM con 12 capas, que produce embeddings de 384 dimensiones. El modelo incluye una capa de pooling de media sobre los tokens, que tiene en cuenta la máscara de atención para calcular el embedding de la frase. La longitud máxima de secuencia es de 128 tokens.

Los datos de entrenamiento y el proceso de entrenamiento específico del modelo original no se detallan en la información disponible. El modelo original fue entrenado por sentence-transformers para la tarea de similitud de frases, utilizando técnicas de aprendizaje siamés. La conversión a ONNX no modifica los pesos, sino que exporta el modelo a un formato optimizado para inferencia en diferentes plataformas.

## Capacidades

- Generacion de embeddings de frases y parrafos en un espacio vectorial denso de 384 dimensiones.
- Similitud semantica entre textos en multiples idiomas, incluyendo mas de 50 lenguas.
- Busqueda semantica: permite recuperar documentos o frases relevantes a partir de una consulta.
- Clustering de textos: agrupa documentos por similitud semantica.
- Clasificacion de textos: los embeddings pueden usarse como caracteristicas para entrenar clasificadores ligeros.
- No soporta tool calling, agentes ni razonamiento multi-paso, al ser un modelo de embeddings no generativo.
- No tiene capacidades de vision ni audio.

## Casos de uso

- Busqueda semantica en documentacion multilingue: se indexan los embeddings de los documentos y se comparan con el embedding de la consulta para recuperar los mas relevantes. Es adecuado porque el modelo soporta multiples idiomas y produce embeddings de baja dimension (384), lo que permite busquedas rapidas.
- Sistemas de recomendacion de contenido: se calcula la similitud entre articulos, productos o noticias para sugerir elementos relacionados. El modelo es util por su capacidad de capturar similitud semantica en varios idiomas.
- Clustering de tickets de soporte: se agrupan tickets de atencion al cliente por tema o categoria usando los embeddings generados. La dimension reducida facilita el clustering con algoritmos como K-means.
- Deteccion de parafrasis o duplicados: se comparan pares de frases para identificar si expresan lo mismo, lo que resulta util en sistemas de moderacion o deduplicacion de contenidos.
- FAQ automatizada: se emparejan preguntas de usuarios con respuestas predefinidas mediante similitud de embeddings. El modelo es adecuado porque entiende la semantica de la pregunta, no solo palabras clave.
- Analitica de opiniones multilingue: se generan embeddings de resenas o comentarios y se alimentan a un clasificador de sentimiento. El soporte multilingue permite analizar opiniones en diferentes idiomas sin modelos separados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible. El repositorio tiene un tamano de 1.5 GB, lo que incluye los pesos ONNX y otros archivos, pero no se proporcionan cifras oficiales de consumo de memoria.
- GPU recomendadas: no disponible. Al ser un modelo de embeddings de tamano reducido, puede ejecutarse en CPU o en GPUs de gama media, pero no hay datos oficiales.
- Opciones de despliegue: ONNX Runtime, Transformers.js (para JavaScript en navegador o Node.js), Hugging Face Inference Endpoints con text-embeddings-inference.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de informacion detallada sobre modelos comparables en la documentacion proporcionada. Se puede considerar el modelo base original `sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2` y otros modelos de embeddings multilingues de la misma familia, pero sus especificaciones exactas no estan disponibles en esta informacion.

## Limitaciones y advertencias

- Sesgos conocidos: no disponible en la informacion proporcionada.
- Riesgo de alucinacion: no aplica, ya que es un modelo de embeddings y no genera texto.
- Limitaciones de contexto: la longitud maxima de secuencia es de 128 tokens, lo que impide procesar documentos largos de una sola vez. Para textos extensos se requiere truncamiento o segmentacion.
- Limitaciones de idioma: aunque es multilingue, la calidad de los embeddings puede variar entre idiomas, especialmente en lenguas con menos datos de entrenamiento. No se especifica el rendimiento por idioma.
- Restricciones de licencia: la licencia Apache 2.0 permite uso comercial y modificacion, siempre que se mantenga el aviso de licencia.
- Caveat para produccion: el repositorio no tiene descargas ni likes, lo que sugiere que no ha sido ampliamente probado. La conversion a ONNX puede introducir pequenas diferencias numericas respecto al modelo original.

## Enlaces

- HuggingFace: https://huggingface.co/onnx-community/paraphrase-multilingual-MiniLM-L12-v2-ONNX
- Modelo base: https://huggingface.co/sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2
- Paper de Sentence-BERT: https://arxiv.org/abs/1908.10084
- Documentacion de Transformers.js: https://huggingface.co/docs/transformers.js/api/pipelines
- Space de conversion a ONNX: https://huggingface.co/spaces/onnx-community/convert-to-onnx
