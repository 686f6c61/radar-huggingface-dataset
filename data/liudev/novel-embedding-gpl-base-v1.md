# liudev/novel-embedding-gpl-base-v1

## Resumen

`liudev/novel-embedding-gpl-base-v1` es un modelo de embeddings de frases (sentence transformer) desarrollado por el usuario `liudev` y afinado a partir de `BAAI/bge-base-zh-v1.5`. Su función es proyectar frases y párrafos en un espacio vectorial denso de 768 dimensiones, de modo que la similitud semántica entre textos pueda medirse mediante similitud coseno. El modelo está especializado en el dominio de la narrativa web china (novelas serializadas), a juzgar por los ejemplos de la model card y por la composición del dataset de entrenamiento.

El problema que resuelve es el de la recuperación y el emparejamiento semántico dentro de corpus de ficción: sinopsis, resúmenes de capítulos, descripciones de tramas y eventos argumentales. Los embeddings genéricos multilingües suelen degradarse en este tipo de texto por la densidad de entidades, giros argumentales y referencias internas; un ajuste fino sobre pares de frases del dominio mejora la discriminación entre tramas similares pero distintas.

Con 102.267.648 parámetros y una longitud máxima de secuencia de 256 tokens, es un modelo compacto orientado a producción en tareas de búsqueda semántica y clustering. Su relevancia actual radica en que cubre un nicho poco atendido (embeddings para ficción en chino) y es compatible con `text-embeddings-inference` y endpoints de Hugging Face, lo que facilita su despliegue como servicio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BERT (BertModel) con pooling CLS y normalización L2 (SentenceTransformer) |
| Parametros totales | 102.267.648 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 256 tokens |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (los ejemplos y el modelo base son en chino) |
| Licencia | no disponible |
| Formato de pesos | safetensors (repo con 132,1 GB, incluye artefactos de entrenamiento) |

## Arquitectura y entrenamiento

La arquitectura es un transformer BERT estándar (`BertModel`) heredado de `BAAI/bge-base-zh-v1.5`, sobre el que se aplica un pooling de tipo CLS (dimensión 768) y una normalización L2. El pipeline completo de Sentence Transformers es: extracción de `last_hidden_state`, pooling CLS y normalización, con similitud coseno como función de comparación. La longitud máxima de secuencia es de 256 tokens, un límite relativamente corto que condiciona el tipo de documento indexable.

El ajuste fino se realizó sobre un dataset de 435.262 muestras con columnas `anchor`, `sentence1`, `sentence2` y `label`, empleando la función de pérdida `MarginMSELoss`. Los datos presentan tripletas con anclas cortas (media de 15,5 tokens, máximo 25) y candidatos más largos (media de 73,19 tokens en `sentence1`, máximo 256; media de 69,23 en `sentence2`, máximo 92), con etiquetas continuas entre 0,02 y 0,84. Este esquema es coherente con un entrenamiento de tipo GPL (Generative Pseudo-Labeling), donde las etiquetas reflejan puntuaciones de relevancia generadas por un modelo teacher. El modelo base está etiquetado con los papers arXiv:1908.10084 (Sentence-BERT) y arXiv:2010.02666 (GPL). No se documenta el uso de RLHF ni DPO, ni la composición exacta del corpus más allá del tamaño y las estadísticas de longitud.

## Capacidades

- Generación de embeddings de frases y párrafos en un espacio denso de 768 dimensiones.
- Similitud semántica entre textos (semantic textual similarity) mediante similitud coseno.
- Búsqueda semántica y recuperación de pasajes (semantic search, dense retrieval).
- Minería de paráfrasis (paraphrase mining).
- Clasificación de textos mediante embeddings como features.
- Clustering y agrupamiento semántico de documentos.
- Extracción de features (`feature-extraction`) para pipelines posteriores.
- Compatibilidad con `text-embeddings-inference` y endpoints de Hugging Face.
- No soporta tool calling, agentes, visión, audio ni modos de razonamiento: es exclusivamente un encoder de texto.

## Casos de uso

- Búsqueda semántica en catálogos de novelas web: indexar sinopsis y resúmenes de capítulos como vectores de 768 dimensiones y recuperar obras similares por trama, no solo por palabras clave. El ajuste en dominio de ficción mejora la discriminación entre argumentos con entidades y giros parecidos.
- Recomendación de lecturas: calcular la similitud coseno entre el embedding del historial de un usuario y el de las sinopsis del catálogo para generar recomendaciones por afinidad argumental.
- Deduplicación y detección de plagio argumental: agrupar por clustering embeddings de resúmenes de tramas para identificar obras con estructuras narrativas casi idénticas.
- Etiquetado temático automático: usar los embeddings como features de entrada para un clasificador que asigne géneros o tropos (xianxia, urbano, militar, etc.) a partir de descripciones cortas.
- Moderación y filtrado de contenido: comparar descripciones de capítulos contra un conjunto de referencia de contenido sensible mediante similitud semántica, aprovechando la ventana de 256 tokens para fragmentos de resumen.
- Construcción de un motor de preguntas y respuestas sobre un corpus de ficción: recuperar los pasajes más relevantes de una base vectorial antes de pasarlos a un LLM generador (patrón RAG), con la ventaja de que el encoder es ligero y rápido de servir.
- Segmentación de sagas y series: agrupar capítulos o volúmenes por similitud de trama para reconstruir arcos narrativos o detectar continuaciones no oficiales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 0,4 GB de pesos (102,3 M de parámetros), más overhead de activaciones; en la práctica, menos de 1 GB para lotes pequeños.
- VRAM estimada en fp16: alrededor de 0,2 GB de pesos.
- Cabe holgadamente en cualquier GPU consumer: RTX 3060, RTX 4060, RTX 4090, así como en GPUs de datacenter (A100, H100) para servir a gran escala.
- También es viable en CPU para volúmenes moderados, dado el tamaño reducido del modelo.
- Opciones de despliegue: `sentence-transformers` (referencia), `text-embeddings-inference` (soporte declarado en los tags), endpoints de Hugging Face, y exportación a ONNX para servir con `optimum` o `fastembed`. No se documenta soporte explícito de vLLM ni llama.cpp para este modelo.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Dimensión | Licencia | Notas |
|---|---|---|---|---|---|
| liudev/novel-embedding-gpl-base-v1 | 102,3 M | 256 tokens | 768 | no disponible | Ajustado a dominio de ficción en chino |
| BAAI/bge-base-zh-v1.5 | ~102 M | 512 tokens | 768 | MIT (según el modelo base original) | Modelo base; propósito general en chino |
| BAAI/bge-small-zh-v1.5 | ~24 M | 512 tokens | 512 | MIT | Alternativa más ligera y rápida |
| paraphrase-multilingual-MiniLM-L12-v2 | ~118 M | 128 tokens | 384 | Apache 2.0 | Multilingüe, contexto más corto |

La comparación con el modelo base es la más directa: este ajuste reduce la ventana de 512 a 256 tokens y especializa el espacio de embeddings en narrativa, a costa de generalidad. Para licencia y benchmarks del modelo ajustado no hay datos publicados.

## Limitaciones y advertencias

- Ventana de contexto de solo 256 tokens: no apta para indexar documentos largos sin fragmentación previa.
- El modelo base y los ejemplos son en chino; el rendimiento en castellano u otros idiomas no está documentado y previsiblemente será deficiente.
- Licencia no disponible: no se puede confirmar el uso comercial sin contactar con el autor.
- No se documentan sesgos, pero al entrenarse sobre ficción web china puede heredar estereotipos de género, etnia o clase presentes en ese corpus.
- Riesgo de alucinación no aplica directamente (no genera texto), pero sí de falsos positivos en similitud: tramas superficialmente parecidas pueden puntuar alto.
- El repositorio ocupa 132,1 GB, muy superior al tamaño de los pesos, probablemente por artefactos de entrenamiento; conviene descargar solo los ficheros necesarios.
- Sin métricas de evaluación publicadas (MTEB, C-MTEB u otras), por lo que la calidad frente al modelo base no está cuantificada.
- El dataset de entrenamiento no está identificado ni se detalla su procedencia, lo que dificulta auditar posibles contaminaciones.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/liudev/novel-embedding-gpl-base-v1
- Modelo base: https://huggingface.co/BAAI/bge-base-zh-v1.5
- Documentación de Sentence Transformers: https://sbert.net
- Repositorio de Sentence Transformers: https://github.com/huggingface/sentence-transformers
- Modelos con librería sentence-transformers: https://huggingface.co/models?library=sentence-transformers
- Paper Sentence-BERT (arXiv:1908.10084): https://arxiv.org/abs/1908.10084
- Paper GPL (arXiv:2010.02666): https://arxiv.org/abs/2010.02666
