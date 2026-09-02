# kwondw/bert-base-uncased-trec-covid-tsdae-tiny

## Resumen

El modelo `kwondw/bert-base-uncased-trec-covid-tsdae-tiny` es un fine-tuning de `google-bert/bert-base-uncased` realizado con la técnica TSDAE (Transformer-based Denoising AutoEncoder) para generar embeddings de frases orientados a la recuperación de información. Lo desarrolla el usuario `kwondw` y está publicado en Hugging Face con la librería `sentence-transformers`. El objetivo es mapear frases y párrafos a un espacio vectorial denso de 768 dimensiones, utilizando similitud coseno para tareas de retrieval semántico.

El modelo se entrenó sobre un subconjunto de solo 100 ejemplos del dataset TREC-COVID, lo que lo convierte en una versión extremadamente ligera y experimental. Su arquitectura es la de BERT base (encoder transformer) con 109 millones de parámetros y una longitud máxima de secuencia de 75 tokens. Aunque su rendimiento en benchmarks es bajo, puede servir como punto de partida para experimentos educativos o prototipos rápidos en dominios biomédicos relacionados con la COVID-19.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (BERT base, 12 capas, 768 hidden, 12 cabezas) |
| Parametros totales | 109.482.240 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 75 tokens |
| Tipos de cuantizacion | no disponible (solo safetensors en FP32) |
| Idiomas soportados | no disponible (base uncased, entrenado principalmente en inglés) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de `google-bert/bert-base-uncased`, un encoder transformer de 12 capas con 768 unidades ocultas y 12 cabezas de atención, preentrenado con masked language modeling y next sentence prediction sobre corpus en inglés. El fine-tuning se realizó con la pérdida `DenoisingAutoEncoderLoss` (TSDAE), una técnica que corrompe las frases de entrada (eliminando o enmascarando tokens) y entrena al modelo para reconstruir la frase original, generando así representaciones semánticas robustas. El dataset utilizado fue TREC-COVID, limitado a 100 ejemplos, lo que explica el bajo rendimiento observado. No se menciona el uso de RLHF, DPO ni otras técnicas de alineación.

## Capacidades

- Generación de embeddings de frases y párrafos en un espacio vectorial de 768 dimensiones.
- Cálculo de similitud semántica mediante similitud coseno.
- Recuperación de información (information retrieval) sobre el dominio de COVID-19, aunque con precisión limitada.
- Extracción de características (feature extraction) para downstream tasks.
- No soporta tool calling, agentes, razonamiento multi-paso, visión ni audio.
- Capacidad multilingüe no confirmada; el modelo base es uncased y está orientado al inglés.

## Casos de uso

- Prototipado rápido de búsqueda semántica: dado su pequeño tamaño y baja complejidad, puede usarse para validar pipelines de retrieval en entornos de desarrollo o académicos antes de migrar a modelos más potentes.
- Experimentación educativa: útil para demostrar el efecto del fine-tuning con TSDAE sobre BERT en cursos de NLP o talleres de embeddings.
- Indexación de documentos biomédicos reducidos: con un corpus pequeño de artículos sobre COVID-19, puede generar embeddings para clustering o búsqueda por similitud, aunque con resultados limitados.
- Pruebas de concepto en sistemas RAG: sirve para evaluar la integración con bases vectoriales y frameworks como sentence-transformers antes de escalar a modelos de mayor calidad.
- Análisis de sensibilidad: al estar entrenado con solo 100 ejemplos, permite estudiar cómo afecta el tamaño del dataset al rendimiento de los embeddings.
- Benchmarking interno: puede usarse como baseline de bajo coste para comparar mejoras en tareas de retrieval específicas del dominio COVID.

## Benchmarks y rendimiento

Los resultados declarados por el autor en el model-index corresponden a la tarea de Information Retrieval sobre el dataset TREC-COVID, evaluados con similitud coseno:

| Metrica | Valor |
|---|---|
| Cosine Accuracy@1 | 0,06 |
| Cosine Accuracy@3 | 0,18 |
| Cosine Accuracy@5 | 0,22 |
| Cosine Accuracy@10 | 0,34 |
| Cosine Precision@1 | 0,06 |
| Cosine Precision@3 | 0,06 |
| Cosine Precision@5 | 0,044 |
| Cosine Precision@10 | 0,038 |
| Cosine Recall@1 | 0,0002247 |
| Cosine Recall@3 | 0,0004738 |
| Cosine Recall@5 | 0,0005286 |
| Cosine Recall@10 | 0,0008936 |
| Cosine NDCG@10 | 0,0426 |
| Cosine MRR@10 | 0,1304 |
| Cosine MAP@100 | 0,0020 |

Estos valores son notablemente bajos, especialmente en recall y MAP, lo que indica que el modelo no es adecuado para retrieval en producción. No se han publicado comparaciones con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada: aproximadamente 420 MB en FP32 (109M parámetros × 4 bytes). Con cuantización a int8 podría reducirse a ~110 MB, aunque no se proporcionan pesos cuantizados.
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM, incluyendo GTX 1050, RTX 2060, RTX 3060, etc. También funciona en CPU sin problemas.
- Compatible con GPUs de consumo: sí, es un modelo pequeño que cabe en cualquier tarjeta moderna.
- Opciones de despliegue: compatible con `sentence-transformers`, `text-embeddings-inference` (según tags), y puede exportarse a ONNX o convertirse a GGUF para `llama.cpp` u Ollama, aunque no se proporcionan dichos formatos.
- Latencia y throughput: al ser un modelo de 110M parámetros, la inferencia es rápida; en CPU se procesan cientos de frases por segundo, y en GPU miles, dependiendo del hardware.

## Comparativa con modelos similares

No se dispone de datos de benchmarks comparativos con otros modelos de embeddings en la información proporcionada. Como referencia cualitativa, se puede comparar con:

| Modelo | Parametros | Contexto | Rendimiento en retrieval | Licencia |
|---|---|---|---|---|
| kwondw/bert-base-uncased-trec-covid-tsdae-tiny | 109M | 75 tokens | Muy bajo (ver benchmarks) | no disponible |
| sentence-transformers/all-MiniLM-L6-v2 | 22M | 256 tokens | Superior en tareas generales | Apache 2.0 |
| BAAI/bge-small-en-v1.5 | 33M | 512 tokens | Superior en retrieval multilingüe | MIT |

La comparativa es orientativa; no se han ejecutado los mismos benchmarks sobre estos modelos alternativos en la información disponible.

## Limitaciones y advertencias

- Dataset de entrenamiento extremadamente reducido (100 ejemplos), lo que provoca un rendimiento muy pobre en tareas de retrieval y una alta probabilidad de sobreajuste.
- Sesgos potenciales heredados del modelo base BERT uncased, que pueden reflejar estereotipos presentes en los corpus de preentrenamiento.
- Riesgo elevado de alucinación en tareas de generación, aunque el modelo está diseñado solo para embeddings, no para generación de texto.
- Longitud de contexto limitada a 75 tokens, insuficiente para documentos largos o conversaciones multi-turno.
- Idiomas soportados no documentados; el modelo base es uncased y está orientado al inglés, por lo que su uso en otros idiomas probablemente degrade el rendimiento.
- Licencia no especificada, lo que genera incertidumbre sobre el uso comercial y la redistribución.
- No apto para producción: los valores de recall y MAP son casi nulos, lo que lo descarta para sistemas de búsqueda reales.
- Fecha de creación futura (2026-09-02) y sin descargas ni likes, lo que sugiere que es un experimento personal sin validación comunitaria.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/kwondw/bert-base-uncased-trec-covid-tsdae-tiny
- Modelo base: https://huggingface.co/google-bert/bert-base-uncased
- Paper TSDAE (arxiv 2104.06979): https://arxiv.org/abs/2104.06979
- Paper BERT (arxiv 1908.10084): https://arxiv.org/abs/1908.10084
- Librería sentence-transformers: https://www.sbert.net
