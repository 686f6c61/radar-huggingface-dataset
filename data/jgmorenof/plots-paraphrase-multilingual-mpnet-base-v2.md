# Jgmorenof/plots-paraphrase-multilingual-mpnet-base-v2

## Resumen

El modelo `plots-paraphrase-multilingual-mpnet-base-v2`, desarrollado por Jose G. Moreno (usuario `Jgmorenof`) y coautores del dataset PLOTS, es un modelo de embeddings de frases obtenido por ajuste fino de `sentence-transformers/paraphrase-multilingual-mpnet-base-v2` sobre pares de resúmenes argumentales de películas de Wikipedia escritos de forma independiente en distintos idiomas. Resuelve un problema concreto: la similitud narrativa y la recuperación cross-lingual cuando dos textos cuentan la misma historia con palabras y nombres distintos, algo que los embeddings multilingües genéricos resuelven mal en modo zero-shot.

La arquitectura subyacente es XLM-RoBERTa con cabecera de pooling MPNet, con 278.043.648 parámetros totales, ventana de entrada de 512 tokens y licencia Apache 2.0. No es un modelo generativo: es un encoder de similitud de frases (`pipeline_tag: sentence-similarity`) pensado para producir vectores densos comparables mediante coseno.

Su relevancia actual radica en que ataca el fenómeno "tip-of-the-tongue" (ToT): recuperar una película o historia a partir de una descripción vaga, en cualquier idioma, contra un corpus de resúmenes en inglés. El ajuste fino sobre 197.694 pares multiplica por más de dos el rendimiento zero-shot del modelo base en las métricas publicadas.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | XLM-RoBERTa con pooling MPNet (encoder tipo transformer, base sentence-transformers) |
| Parametros totales | 278.043.648 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 512 tokens de entrada máxima |
| Tipos de cuantizacion | no disponible (pesos en safetensors; admite cuantización estándar de sentence-transformers/ONNX, no documentada por el autor) |
| Idiomas soportados | multilingüe (heredado de XLM-RoBERTa; cobertura de 100 idiomas aproximada, no detallada por el autor) |
| Licencia | Apache 2.0 (pesos); datos de entrenamiento PLOTS bajo CC BY-SA 4.0 |
| Formato de pesos | safetensors |
| Dimension de embedding | no disponible (heredada del modelo base, típicamente 768; no confirmada en la model card) |
| Funcion de similitud | coseno (`model.similarity`) |
| Tamano del repo | 1.1 GB |

## Arquitectura y entrenamiento

El modelo parte de `paraphrase-multilingual-mpnet-base-v2`, un encoder XLM-RoBERTa base con cabecera de pooling MPNet entrenado originalmente para similitud de paráfrasis multilingüe. El ajuste fino sustituye el objetivo de paráfrasis por uno de similitud narrativa: pares de resúmenes argumentales de la misma película escritos de forma independiente, uno en inglés y otro en otro idioma, de modo que el modelo aprenda a alinear historias y no palabras ni nombres propios.

El entrenamiento usó 197.694 pares con pérdida contrastiva simétrica in-batch (InfoNCE en ambas direcciones) y gradient caching, batch de 128, una época, learning rate 2e-05, longitud máxima de 512 tokens y semilla 13. Se excluyeron explícitamente del entrenamiento las películas de SemEval-2026 Task 4 y de las consultas train y dev de TREC ToT 2023, lo que permite evaluar sin fuga de datos. No se documenta RLHF ni DPO, al no ser un modelo generativo.

## Capacidades

- Generación de embeddings de frases multilingües para similitud semántica y narrativa.
- Recuperación cross-lingual: empareja una descripción en cualquier idioma con un resumen en inglés.
- Similitud narrativa ("same story, different words"): distingue historias equivalentes aunque cambien personajes, lugares o sinónimos.
- Recuperación tipo "tip-of-the-tongue": localizar una película a partir de una descripción vaga.
- Ranking de candidatos mediante similitud coseno sobre vectores densos.
- Soporte de `prompt=""` en `encode` para consultas y documentos simétricos.
- Integración con `text-embeddings-inference` y endpoints compatibles (tag `endpoints_compatible`).
- No soporta tool calling, agentes, visión, audio ni modo de razonamiento: es exclusivamente un encoder de similitud.

## Casos de uso

- Búsqueda de películas por descripción vaga: el usuario describe una trama que recuerda a medias, en su idioma, y el modelo la enfrenta a un índice de resúmenes en inglés; sus 512 tokens cubren resúmenes argumentales completos y la métrica NS de 0,614 supera claramente al modelo base.
- Recuperación cross-lingual en catálogos editoriales: indexar sinopsis en inglés y consultar en castellano, francés o alemán sin traducción previa, aprovechando el alineamiento narrativo aprendido.
- Deduplicación de fichas y metadatos: detectar entradas de la misma película descritas de forma distinta en distintas fuentes o idiomas mediante umbral de similitud coseno.
- Recomendación por similitud argumental: construir un sistema de "películas parecidas" sobre embeddings precalculados, más barato que un LLM generativo y con latencia de milisegundos.
- Enriquecimiento de bases de conocimiento: enlazar descripciones de usuarios o de terceros con entidades canónicas de un catálogo (entity linking narrativo).
- Evaluación de paráfrasis y reescritura: medir si dos resúmenes generados por distintos sistemas cuentan la misma historia, útil en pipelines de evaluación automática.
- Recuperación en archivos audiovisuales o literarios: adaptar el mismo esquema a sinopsis de series, novelas o guiones, ya que el modelo aprende estructura narrativa y no vocabulario de cine.

## Benchmarks y rendimiento

Resultados publicados en la model card. NS: accuracy en los 355 triples leak-free del track B de test de SemEval-2026 Task 4. PLOTS-IR: nDCG@10 sobre las consultas de test (M: entidades enmascaradas). ToT: consultas dev de TREC ToT 2023.

| Metrica | Este modelo | MPNet multilingue zero-shot |
|---|---|---|
| NS accuracy | 0,614 | 0,546 |
| PLOTS-IR Full | 0,979 | 0,428 |
| PLOTS-IR Full M | 0,793 | 0,218 |
| PLOTS-IR First | 0,758 | 0,199 |
| PLOTS-IR Last | 0,325 | 0,091 |
| PLOTS-IR Last M | 0,075 | 0,025 |
| ToT nDCG@10 | 0,110 | 0,009 |
| ToT R@100 | 0,293 | 0,060 |

La mejora es especialmente marcada en recuperación con entidades enmascaradas (Full M: 0,793 frente a 0,218) y en ToT R@100 (0,293 frente a 0,060). El rendimiento en la posición "Last" con entidades enmascaradas sigue siendo bajo (0,075), lo que indica dificultad cuando la información discriminante aparece al final del resumen y sin nombres propios.

## Requisitos de hardware

- Inferencia en FP32: aproximadamente 1,1 GB de pesos, con picos de VRAM de 2 a 3 GB según batch y longitud de secuencia.
- Inferencia en FP16: alrededor de 0,6 GB de pesos; cabe holgadamente en cualquier GPU consumer con 4 GB o más.
- GPU recomendadas: RTX 3060/4060 o superiores para lotes grandes; A100/H100 solo necesarias para indexación masiva a gran throughput.
- Cabe en CPU para volúmenes moderados: es un encoder de 278 M de parámetros, viable con ONNX Runtime o sentence-transformers en CPU.
- Despliegue: `sentence-transformers`, `text-embeddings-inference` (tag `endpoints_compatible`), exportación a ONNX, integración con FAISS, Qdrant, Milvus o pgvector para el índice vectorial.
- Latencia y throughput: no publicados por el autor; en una RTX 4090 se espera del orden de miles de frases por segundo con batch grande, pero es una estimación no verificada en la información disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| plots-paraphrase-multilingual-mpnet-base-v2 | 278 M | 512 | Similitud narrativa cross-lingual (fine-tune PLOTS) | Apache 2.0 | Hugging Face |
| sentence-transformers/paraphrase-multilingual-mpnet-base-v2 | 278 M | 512 | Similitud de paráfrasis multilingüe genérica | Apache 2.0 | Hugging Face |
| BAAI/bge-m3 | ~568 M | 8192 | Embeddings multilingües densos, dispersos y multi-vector | MIT | Hugging Face |
| intfloat/multilingual-e5-large | ~560 M | 512 | Embeddings de recuperación multilingüe | MIT | Hugging Face |

Frente al modelo base, la ganancia está cuantificada en la tabla de benchmarks. Frente a `bge-m3` y `multilingual-e5-large`, este modelo ofrece menor tamaño y un ajuste específico para similitud narrativa, pero no se han publicado comparaciones directas con ellos en la información disponible.

## Limitaciones y advertencias

- Especializado en dominio cinematográfico y narrativo: el ajuste fino sobre PLOTS puede degradar ligeramente el rendimiento en tareas de paráfrasis general respecto al modelo base, aunque no se documenta.
- Ventana de 512 tokens: los resúmenes o descripciones más largos se truncan, con pérdida de información.
- Rendimiento bajo en recuperación con entidades enmascaradas cuando la información discriminante está al final del texto (0,075 de nDCG@10 en Last M).
- Riesgo de falsos positivos en tramas arquetípicas: historias estructuralmente parecidas pero distintas pueden colapsar en el espacio de embeddings.
- Sesgos heredados de XLM-RoBERTa y de Wikipedia: cobertura desigual entre idiomas y sesgo hacia el inglés como idioma de documentos.
- Los datos de entrenamiento (PLOTS) están bajo CC BY-SA 4.0; los pesos bajo Apache 2.0, pero la redistribución de derivados debe respetar ambas condiciones.
- Modelo con 0 descargas y 0 likes en el momento de la consulta: sin validación comunitaria ni ecosistema de terceros.
- No es un modelo generativo: no debe usarse para producir texto, responder preguntas ni razonar; solo para embeddings.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Jgmorenof/plots-paraphrase-multilingual-mpnet-base-v2
- Dataset PLOTS: https://huggingface.co/datasets/Jgmorenof/PLOTS
- Modelo base: https://huggingface.co/sentence-transformers/paraphrase-multilingual-mpnet-base-v2
- Paper citado (PLOTS, Moreno et al., 2026): https://huggingface.co/datasets/Jgmorenof/PLOTS
- SemEval-2026 Task 4: no disponible (referenciado en la model card sin enlace)
- TREC ToT 2023: no disponible (referenciado en la model card sin enlace)
