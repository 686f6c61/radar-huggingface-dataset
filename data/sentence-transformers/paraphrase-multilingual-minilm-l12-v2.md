# sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2

## Resumen

`paraphrase-multilingual-MiniLM-L12-v2` es un modelo de embeddings de frases multilingüe desarrollado por el equipo de `sentence-transformers` (SBERT.net). Convierte frases y párrafos en vectores densos de 384 dimensiones, optimizados para tareas de similitud semántica, búsqueda semántica y clustering. Está basado en la arquitectura BERT (MiniLM-L12) con 12 capas transformer y un mecanismo de pooling por media de tokens, y soporta más de 50 idiomas, lo que lo convierte en una opción habitual para sistemas de recuperación de información multilingües.

El modelo se publicó en marzo de 2022 y acumula más de 54 millones de descargas en HuggingFace, lo que refleja su adopción generalizada en la comunidad. Su relevancia actual radica en su equilibrio entre tamaño reducido (117 millones de parámetros), velocidad de inferencia y cobertura lingüística, siendo una alternativa ligera a modelos más grandes como `paraphrase-multilingual-mpnet-base-v2`. Está disponible bajo licencia Apache 2.0, lo que permite uso comercial sin restricciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BERT (MiniLM-L12) con 12 capas transformer, embedding de 384 dimensiones |
| Parametros totales | 117.654.272 |
| Parametros activos | no aplicable (modelo denso) |
| Longitud de contexto | 128 tokens (max_seq_length) |
| Tipos de cuantizacion | no disponible (se distribuye en FP32; existen conversiones ONNX, OpenVINO y TF) |
| Idiomas soportados | Multilingüe: ar, bg, ca, cs, da, de, el, en, es, et, fa, fi, fr, gl, gu, he, hi, hr, hu, hy, id, it, ja, ka, ko, ku, lt, lv, mk, mn, mr, ms, my, nb, nl, pl, pt, ro, ru, sk, sl, sq, sr, sv, th, tr, uk, ur, vi, además de variantes regionales (fr-ca, pt-br, zh-cn, zh-tw) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, PyTorch, TensorFlow, ONNX, OpenVINO |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura Sentence-BERT (Reimers y Gurevych, 2019): un transformer BERT (en este caso MiniLM-L12) que procesa cada frase de forma independiente y aplica una operación de pooling sobre los embeddings de los tokens para obtener un vector de frase. En concreto, se usa pooling por media de tokens (mean pooling), que tiene en cuenta la máscara de atención para promediar solo los tokens reales. La dimensión de salida es 384.

El entrenamiento se realizó con redes siamesas y tripletas, optimizando la similitud coseno entre frases semánticamente equivalentes en distintos idiomas. Aunque la model card no detalla el corpus exacto, el modelo se entrenó sobre datos multilingües de paráfrasis y pares de frases equivalentes, lo que le permite alinear espacios semánticos entre lenguas. No se menciona el uso de RLHF ni DPO; el entrenamiento es supervisado con pares de frases.

## Capacidades

- Generación de embeddings de frases y párrafos (hasta 128 tokens) en un espacio vectorial de 384 dimensiones.
- Similitud semántica entre frases, tanto dentro de un mismo idioma como entre idiomas distintos (búsqueda cross-lingual).
- Búsqueda semántica: recuperación de documentos o frases relevantes a partir de una consulta en cualquier idioma soportado.
- Clustering de textos por similitud semántica, útil para agrupar documentos multilingües.
- Clasificación de textos mediante la comparación de embeddings con prototipos o centroides.
- Extracción de características (feature extraction) para pipelines de aprendizaje automático.
- No soporta generación de texto, tool calling, agentes ni razonamiento multi-paso; es exclusivamente un modelo de representación.

## Casos de uso

- Búsqueda semántica multilingüe en bases de conocimiento: el modelo permite indexar documentos en varios idiomas y recuperarlos con consultas en cualquier lengua soportada, gracias a que los embeddings de frases equivalentes quedan próximos en el espacio vectorial.
- Sistemas de atención al cliente con FAQ multilingüe: se pueden codificar las preguntas frecuentes en distintos idiomas y comparar la consulta del usuario con todas ellas para devolver la respuesta más similar, incluso si el usuario escribe en un idioma distinto al de la base de conocimiento.
- Deduplicación de contenidos en plataformas editoriales: al generar embeddings de artículos o noticias en varios idiomas, se pueden detectar duplicados o versiones traducidas mediante umbrales de similitud coseno.
- Moderación de comentarios en redes sociales: los embeddings permiten agrupar comentarios con temática similar (por ejemplo, spam o discurso de odio) sin necesidad de etiquetar manualmente cada idioma.
- Sistemas de recomendación basados en contenido: se pueden representar ítems (productos, artículos, vídeos) mediante sus descripciones textuales y recomendar elementos similares calculando la distancia entre embeddings.
- Análisis de encuestas abiertas multilingües: las respuestas en diferentes idiomas se proyectan al mismo espacio vectorial, lo que facilita la agrupación temática y la detección de tendencias sin traducción previa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas como MMLU, HumanEval o similares, dado que se trata de un modelo de embeddings y no de generación de texto. Para tareas de similitud semántica, la práctica habitual es evaluar con conjuntos como STS (Semantic Textual Similarity) o MTEB, pero no se proporcionan cifras en la documentación consultada.

## Requisitos de hardware

- VRAM estimada: al tratarse de un modelo de 117 millones de parámetros, en FP32 ocupa aproximadamente 470 MB de memoria. En FP16 o con cuantización a 8 bits, el consumo se reduce a unos 235 MB o menos. No se requieren GPUs de alta gama.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente, incluyendo tarjetas de consumo como GTX 1650, RTX 2060 o superiores. También puede ejecutarse en CPU sin problemas para inferencia por lotes pequeños.
- Compatibilidad con hardware de consumo: sí, cabe en cualquier GPU moderna e incluso en CPU, gracias a su tamaño reducido.
- Opciones de despliegue: se puede usar con la librería `sentence-transformers`, con HuggingFace Transformers (aplicando pooling manual), o mediante servidores de inferencia como Text Embeddings Inference (TEI), que es compatible con este modelo. También existen conversiones a ONNX y OpenVINO para optimización en CPU.
- Latencia y throughput: no se proporcionan datos oficiales, pero por su tamaño se espera una latencia de milisegundos por frase en GPU y de decenas de milisegundos en CPU, con capacidad para procesar cientos de frases por segundo en lotes.

## Comparativa con modelos similares

| Modelo | Parámetros | Dimensiones | Contexto | Idiomas | Licencia |
|---|---|---|---|---|---|
| paraphrase-multilingual-MiniLM-L12-v2 | 117 M | 384 | 128 | 50+ | Apache 2.0 |
| paraphrase-multilingual-mpnet-base-v2 | 278 M | 768 | 128 | 50+ | Apache 2.0 |
| distiluse-base-multilingual-cased | 135 M | 512 | 128 | 50+ | Apache 2.0 |
| multilingual-e5-small | 118 M | 384 | 512 | 100+ | MIT |

No se dispone de datos de rendimiento comparativo en la información proporcionada. La elección entre estos modelos suele depender del equilibrio entre tamaño, calidad de embeddings y velocidad. `paraphrase-multilingual-MiniLM-L12-v2` es el más ligero de los tres primeros, mientras que `mpnet-base` ofrece mayor dimensión y potencialmente mejor calidad, a costa de más parámetros. `multilingual-e5-small` es una alternativa más reciente con contexto más largo.

## Limitaciones y advertencias

- Longitud de contexto limitada a 128 tokens: frases o párrafos más largos se truncan, lo que puede perder información relevante en documentos extensos.
- Sesgos lingüísticos: aunque soporta más de 50 idiomas, el rendimiento puede variar entre lenguas con menos datos de entrenamiento. Idiomas minoritarios o variantes dialectales pueden obtener embeddings de menor calidad.
- Riesgo de alucinación: al ser un modelo de embeddings, no genera texto, por lo que no hay riesgo de alucinación en el sentido clásico. Sin embargo, la similitud coseno puede producir falsos positivos si las frases son superficialmente similares pero semánticamente distintas.
- Limitaciones para tareas de generación: no es adecuado para generación de texto, resumen o diálogo; su uso se restringe a representación vectorial.
- Restricciones de licencia: Apache 2.0 permite uso comercial sin restricciones, pero se debe incluir el aviso de licencia en redistribuciones.
- Dependencia de la librería: para un uso óptimo se recomienda `sentence-transformers`, aunque también se puede emplear con Transformers aplicando pooling manualmente.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2
- Paper de Sentence-BERT: https://arxiv.org/abs/1908.10084
- Documentación de sentence-transformers: https://www.sbert.net/
- Repositorio de ejemplo (no oficial): https://github.com/shinichiro-takahashi-sbr/paraphrase-multilingual-MiniLM-L12-v2
- Guía de uso multilingüe (Milvus): https://milvus.io/ai-quick-reference/how-do-you-use-sentence-transformers-in-a-multilingual-setting-for-example-loading-a-multilingual-model-to-encode-sentences-in-different-languages
