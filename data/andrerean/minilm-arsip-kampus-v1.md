# andrerean/minilm-arsip-kampus-v1

## Resumen

El modelo `andrerean/minilm-arsip-kampus-v1` es un _sentence transformer_ de tipo BERT (MiniLM) desarrollado por el usuario andrerean, especializado en la generación de _embeddings_ de frases y párrafos para tareas de similitud semántica y recuperación de información. Está construido a partir del modelo base `sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2`, un MiniLM de 12 capas con 117,6 millones de parámetros, y ha sido ajustado mediante _fine-tuning_ con una pérdida de tipo `TrackedMNRLoss` sobre un conjunto de datos de 2.352 ejemplos. El nombre del modelo (del indonesio "arsip kampus", archivo universitario) y los ejemplos de la _model card_ indican que el ajuste se ha realizado sobre documentos administrativos y de archivo de una universidad indonesia (Universitas Darussalam Gontor). Su relevancia radica en ofrecer un modelo compacto y multilingüe para recuperación semántica en dominios específicos, especialmente útil para instituciones educativas que necesitan indexar y buscar documentos internos sin depender de servicios externos.

El modelo mapea frases a un espacio vectorial denso de 384 dimensiones, con una longitud máxima de secuencia de 384 tokens y utiliza similitud coseno como función de similitud. Aunque no se especifican los idiomas soportados, al heredar la arquitectura multilingüe del modelo base, es capaz de procesar texto en más de 50 idiomas, aunque el ajuste específico parece centrarse en indonesio. La licencia no está declarada, lo que limita su uso comercial sin verificación previa. A pesar de tener cero descargas y cero _likes_ en el momento de la consulta, el modelo está disponible públicamente en Hugging Face y es compatible con la librería `sentence-transformers` y con `text-embeddings-inference`.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BERT (MiniLM, 12 capas) |
| Parametros totales | 117.653.760 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 384 tokens |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (heredado del base: multilingüe, probablemente indonesio) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura MiniLM (Knowledge Distillation for MiniLM, arxiv:1908.10084) con 12 capas de transformer y una dimensión de _embedding_ de 384. El _pooling_ utilizado es la media de los _token embeddings_ (`mean pooling`). El entrenamiento consistió en un ajuste fino (_fine-tuning_) a partir del modelo preentrenado `paraphrase-multilingual-MiniLM-L12-v2`, que a su vez fue entrenado con pares de frases multilingües para producir _embeddings_ semánticamente alineados. El conjunto de datos de ajuste tiene 2.352 ejemplos, probablemente pares de frases o tríos con anclas y positivos/negativos, y se usó la función de pérdida `TrackedMNRLoss` (Multiple Negatives Ranking Loss con seguimiento), típica para tareas de similitud y recuperación. No se dispone de detalles sobre el número de épocas, el tamaño del _batch_ ni el proceso de _hard negative mining_.

No se han publicado detalles sobre el _dataset_ específico ni sobre el proceso de _RLHF_ o _DPO_, ya que se trata de un modelo de _embeddings_ y no de generación. La innovación técnica principal es la herencia de la arquitectura MiniLM, que ofrece un equilibrio entre rendimiento y eficiencia, y el ajuste en un dominio concreto (archivos universitarios), lo que mejora la precisión en la recuperación de documentos de ese ámbito.

## Capacidades

- Generación de _embeddings_ de frases y párrafos con 384 dimensiones.
- Similitud semántica mediante similitud coseno.
- Recuperación de información (búsqueda semántica) en colecciones de documentos.
- Soporte multilingüe heredado del modelo base (más de 50 idiomas, aunque el ajuste se centra en indonesio).
- Clasificación de frases o documentos por similitud.
- Agrupación (_clustering_) de documentos por contenido.
- Extracción de características para tareas posteriores (_feature extraction_).
- Compatible con `sentence-transformers` y `text-embeddings-inference`.

No se han indicado capacidades de _tool calling_, agentes, visión o audio, ya que es un modelo exclusivamente de texto para _embeddings_.

## Casos de uso

- **Recuperación de documentos de archivo universitario**: el modelo puede indexar y buscar actas, resoluciones, oficios y otros documentos administrativos de una universidad. Por ejemplo, dada una consulta como "sop perjalanan dinas", el modelo devuelve los documentos más relevantes gracias a su ajuste en ese dominio.
- **Búsqueda semántica en repositorios institucionales**: integrar el modelo en un sistema de _retrieval_ para que estudiantes y personal encuentren normativas, procedimientos o certificados mediante lenguaje natural, sin depender de palabras clave exactas.
- **Deduplicación de documentos**: comparar _embeddings_ de documentos para detectar duplicados o versiones similares en un archivo digital, útil para limpieza de bases de datos.
- **Clasificación automática de documentos**: asignar categorías (por ejemplo, "SK rector", "SOP", "foto") a partir de la similitud con representaciones de referencia.
- **Sistema de preguntas y respuestas sobre documentación interna**: combinar el modelo con un _retriever_ para construir un chatbot que responda consultas sobre procedimientos administrativos, citando los documentos fuente.
- **Análisis de coherencia temática**: verificar que los documentos de un expediente tratan sobre el mismo asunto, comparando sus _embeddings_ y detectando anomalías.
- **Recomendación de documentos relacionados**: en un portal de archivos, sugerir documentos similares al que el usuario está consultando, mejorando la navegación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El modelo no presenta métricas en _MTEB_, _GLUE_ ni otros _leaderboards_ en la ficha de Hugging Face. Por tanto, no es posible comparar su rendimiento cuantitativo con otros modelos de _embeddings_ sin datos adicionales.

## Requisitos de hardware

- **VRAM estimada**: al tratarse de un modelo de 117,6 millones de parámetros, el tamaño del modelo en float32 es de aproximadamente 470 MB. Para inferencia con _batch_ pequeño, se puede ejecutar en CPU con unos 2-4 GB de RAM. En GPU, la VRAM necesaria es inferior a 1 GB si se usa precisión float16 o int8, por lo que cabe en cualquier GPU moderna con al menos 2 GB de VRAM.
- **GPU recomendadas**: cualquier GPU con al menos 4 GB de VRAM (por ejemplo, NVIDIA GTX 1650, RTX 3050, o superiores) es suficiente. También funciona en CPU sin problemas para cargas moderadas.
- **Compatibilidad con GPU de consumo**: sí, es un modelo ligero que se ejecuta sin problemas en tarjetas gráficas de consumo como la serie RTX 30/40.
- **Opciones de despliegue**: se puede servir con `sentence-transformers` directamente, o mediante `text-embeddings-inference` (compatible con el ecosistema Hugging Face), así como con `ONNX Runtime` o `TensorRT` si se convierte el modelo. También es posible usarlo en `llama.cpp` aunque no es su formato nativo.
- **Latencia y throughput**: no se han publicado mediciones oficiales. En una GPU moderna, la generación de _embeddings_ para frases cortas suele ser del orden de milisegundos por frase; en CPU puede ser algo mayor, pero sigue siendo adecuado para aplicaciones de recuperación con volúmenes moderados.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Dimensiones | Idiomas | Licencia |
|---|---|---|---|---|---|
| `andrerean/minilm-arsip-kampus-v1` | 117,6 M | 384 | 384 | Multilingüe (ajustado a indonesio) | no disponible |
| `sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2` (base) | 117,6 M | 384 | 384 | Multilingüe | Apache 2.0 |
| `intfloat/multilingual-e5-small` | 118 M | 512 | 384 | Multilingüe | MIT |
| `BAAI/bge-small-en-v1.5` | 33 M | 512 | 384 | Inglés | MIT |

La comparativa se basa en características generales, ya que no hay datos de rendimiento del modelo evaluado. El modelo `minilm-arsip-kampus-v1` es un ajuste del `paraphrase-multilingual-MiniLM-L12-v2`, por lo que su rendimiento en el dominio específico de archivos universitarios probablemente sea superior al del base en esa tarea, pero inferior en tareas generales. Frente a `multilingual-e5-small`, ofrece una ventana de contexto menor (384 vs 512) y no tiene licencia declarada, mientras que `e5-small` es MIT. `bge-small-en-v1.5` es más pequeño y solo en inglés, por lo que no es comparable en multilingüismo.

## Limitaciones y advertencias

- **Dominio limitado**: el ajuste se ha realizado sobre documentos de una universidad indonesia concreta (Universitas Darussalam Gontor), por lo que su rendimiento fuera de ese dominio (por ejemplo, en documentos de otras instituciones o en otros idiomas) puede degradarse notablemente.
- **Contexto corto**: la longitud máxima de secuencia es de 384 tokens, lo que limita el procesamiento de documentos largos. Para textos más extensos es necesario truncar o dividir en fragmentos.
- **Sesgos potenciales**: al entrenarse sobre un corpus específico, puede reflejar sesgos presentes en esos documentos (por ejemplo, terminología administrativa local, nombres propios, etc.).
- **Alucinación**: al ser un modelo de _embeddings_, no genera texto, por lo que el riesgo de alucinación es nulo. Sin embargo, en tareas de recuperación, puede devolver resultados irrelevantes si la consulta está fuera del dominio entrenado.
- **Licencia no declarada**: no se especifica la licencia del modelo. Esto impide su uso comercial sin autorización explícita del autor. Se recomienda contactar con el autor antes de utilizarlo en producción.
- **Sin benchmarks publicados**: no hay evidencia cuantitativa de su rendimiento, lo que dificulta evaluar su calidad frente a alternativas.
- **Idiomas no especificados**: aunque el modelo base es multilingüe, no se indica qué idiomas están realmente bien soportados tras el ajuste. Es probable que el indonesio sea el principal, y otros idiomas puedan tener peor rendimiento.

## Enlaces

- Modelo en Hugging Face: [https://huggingface.co/andrerean/minilm-arsip-kampus-v1](https://huggingface.co/andrerean/minilm-arsip-kampus-v1)
- Modelo base: [sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2](https://huggingface.co/sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2)
- Documentación de Sentence Transformers: [https://sbert.net](https://sbert.net)
- Repositorio de Sentence Transformers: [https://github.com/huggingface/sentence-transformers](https://github.com/huggingface/sentence-transformers)
- Paper de MiniLM (arxiv:1908.10084): [https://arxiv.org/abs/1908.10084](https://arxiv.org/abs/1908.10084)
- Paper de Sentence-BERT (arxiv:1807.03748): [https://arxiv.org/abs/1807.03748](https://arxiv.org/abs/1807.03748)
