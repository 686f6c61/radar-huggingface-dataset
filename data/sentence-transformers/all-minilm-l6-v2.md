# sentence-transformers/all-MiniLM-L6-v2

## Resumen

El modelo `sentence-transformers/all-MiniLM-L6-v2` es un encoder de frases y párrafos cortos desarrollado por el proyecto Sentence-Transformers durante el community week de Hugging Face con JAX/Flax. Convierte texto en vectores densos de 384 dimensiones que capturan el significado semántico, lo que permite tareas como búsqueda semántica, clustering o similitud entre frases. Está basado en la arquitectura MiniLM de 6 capas (una versión destilada de BERT) y fue ajustado mediante aprendizaje contrastivo sobre más de 1.170 millones de pares de frases. Su tamaño reducido (aproximadamente 22,7 millones de parámetros) y su baja latencia lo convierten en una opción muy popular para sistemas de recuperación de información en producción, con más de 258 millones de descargas en Hugging Face.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (BERT-style) de 6 capas, embeddings de 384 dimensiones |
| Parametros totales | ~22,7 millones |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 256 word pieces (truncamiento por defecto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | ingles |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, ONNX, OpenVINO, TensorFlow, Rust |

## Arquitectura y entrenamiento

El modelo parte de `nreimers/MiniLM-L6-H384-uncased`, un transformer preentrenado de 6 capas con 384 unidades ocultas, y se ajusta mediante un objetivo de aprendizaje contrastivo: dado un par de frases, el modelo debe identificar cuál de un conjunto de frases muestreadas aleatoriamente es la verdadera pareja. El entrenamiento se realizó sobre un conjunto de más de 1.170 millones de pares de frases procedentes de múltiples datasets (Reddit, StackExchange, MS MARCO, SNLI, etc.), con una probabilidad de muestreo ponderada. Se usaron 7 TPU v3-8 durante 100.000 pasos, con un tamaño de lote de 1024 (128 por núcleo), una tasa de aprendizaje de 2e-5 con AdamW y una longitud de secuencia limitada a 128 tokens. El resultado es un modelo que produce embeddings normalizados mediante mean pooling sobre las salidas del transformer.

## Capacidades

- Genera embeddings densos de 384 dimensiones para frases y párrafos cortos (hasta 256 word pieces).
- Similitud semántica entre textos mediante similitud coseno.
- Búsqueda semántica y recuperación de información.
- Clustering de documentos o mensajes.
- Clasificación de textos mediante comparación con embeddings de referencia.
- No es un modelo generativo: no produce texto, solo representaciones vectoriales.
- No soporta tool calling ni razonamiento multi-paso; su función es exclusivamente codificar texto.
- Multilingüe: no, está entrenado únicamente en inglés.

## Casos de uso

- Búsqueda semántica en bases de conocimiento: indexar documentos y consultas con el modelo y recuperar los más relevantes por similitud coseno, útil para motores de búsqueda internos o chatbots con recuperación aumentada (RAG).
- Clustering de tickets de soporte: agrupar automáticamente incidencias de clientes por tema para priorizar y derivar a equipos especializados.
- Deduplicación de contenidos: detectar artículos o anuncios duplicados comparando embeddings de textos, reduciendo costes de almacenamiento y moderación.
- Sistemas de recomendación basados en texto: recomendar artículos, noticias o productos calculando la similitud entre el perfil del usuario y los ítems.
- Moderación de comentarios: clasificar comentarios como tóxicos o relevantes comparando con embeddings de ejemplos etiquetados.
- Análisis de encuestas abiertas: agrupar respuestas libres en temas comunes para extraer patrones sin etiquetado manual.
- Entrenamiento de clasificadores ligeros: usar los embeddings como características de entrada para modelos de regresión logística o SVM en tareas de análisis de sentimiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tablas comparativas con métricas como MMLU, HumanEval o similares, ya que se trata de un modelo de embeddings y no de generación de texto. Para evaluar su calidad en tareas de similitud semántica, se recomienda consultar el leaderboard de Sentence-Transformers o los papers originales de MiniLM y Sentence-BERT.

## Requisitos de hardware

- Modelo muy ligero: ~22,7 millones de parámetros, ocupa aproximadamente 90 MB en fp32.
- Inferencia en CPU sin problemas; latencia típica de pocos milisegundos por frase en hardware moderno.
- VRAM mínima: puede ejecutarse en GPU con 1 GB o menos; incluso en CPU con 4 GB de RAM es suficiente.
- GPU recomendada: cualquier GPU con al menos 2 GB de VRAM (p. ej., NVIDIA GTX 1050 Ti o superior) para procesamiento por lotes.
- Despliegue compatible con sentence-transformers, Hugging Face Transformers, ONNX Runtime, OpenVINO, y servidores de embeddings como Text Embeddings Inference (TEI).
- Throughput estimado: en una CPU moderna (8 núcleos) puede procesar cientos de frases por segundo; en GPU, miles.

## Comparativa con modelos similares

| Modelo | Parametros | Dimensiones | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| all-MiniLM-L6-v2 | ~22,7 M | 384 | 256 tokens | Apache 2.0 | Muy ligero, rápido, buena calidad para su tamaño |
| all-MiniLM-L12-v2 | ~33 M | 384 | 256 tokens | Apache 2.0 | Misma familia, 12 capas, algo más preciso pero más lento |
| all-mpnet-base-v2 | ~109 M | 768 | 384 tokens | Apache 2.0 | Mayor calidad, más pesado, requiere más recursos |
| BERT-base (embeddings) | ~110 M | 768 | 512 tokens | Apache 2.0 | Modelo base sin ajuste contrastivo, peor rendimiento en similitud |

La comparativa se basa en características arquitectónicas y de uso común; no se dispone de métricas numéricas en la información proporcionada.

## Limitaciones y advertencias

- Entrenado exclusivamente en inglés; no es adecuado para textos en otros idiomas sin adaptación.
- Longitud de contexto limitada a 256 word pieces; textos más largos se truncan, perdiendo información.
- No genera texto: solo produce embeddings, por lo que no sirve para tareas generativas.
- Puede reflejar sesgos presentes en los datos de entrenamiento (por ejemplo, Reddit, foros), lo que podría afectar a la neutralidad de las representaciones.
- Al ser un modelo de 2021, puede no capturar vocabulario o contextos recientes.
- Para uso comercial, la licencia Apache 2.0 permite uso libre, pero se recomienda verificar los términos de los datasets de entrenamiento (algunos pueden tener restricciones).
- En producción, es importante normalizar los embeddings (norma L2) para obtener similitudes coseno comparables.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/sentence-transformers/all-MiniLM-L6-v2)
- [Paper de MiniLM (1904.06472)](https://arxiv.org/abs/1904.06472)
- [Paper de Sentence-BERT (1704.05179)](https://arxiv.org/abs/1704.05179)
- [Paper de Sentence-Transformers (2102.07033)](https://arxiv.org/abs/2102.07033)
- [Documentación de Sentence-Transformers](https://www.sbert.net)
