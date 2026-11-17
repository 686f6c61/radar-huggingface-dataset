# daniel-gomm/sciseek-nano

## Resumen

sciseek-nano es un modelo de embeddings de frases especializado en búsqueda de literatura científica, desarrollado por daniel-gomm y publicado bajo licencia Apache 2.0. Se trata de un fine-tuning del modelo ibm-granite/granite-embedding-small-english-r2, de arquitectura ModernBERT, que transforma consultas de investigación y descripciones de artículos (título más resumen) en vectores densos de 384 dimensiones para recuperación semántica. Con 47,6 millones de parámetros y un repositorio de 0,4 GB, está pensado para indexar y consultar corpus de arXiv y otros repositorios académicos con un coste computacional muy reducido.

El modelo resuelve un problema concreto: los embeddings de propósito general no capturan bien la jerga y la estructura semántica de las consultas científicas. sciseek-nano se entrena específicamente sobre pares consulta-artículo del dataset sciseek-train y se evalúa sobre SciSeek (3.010 consultas generadas automáticamente sobre 200.000 artículos de arXiv) y LitSearch (597 preguntas reales de investigadores). Según el autor, ocupa la tercera posición del ranking de SciSeek por detrás de sciseek-micro y de Qwen3-Embedding-4B, un modelo 85 veces más grande.

Su relevancia actual radica en la eficiencia: con 384 dimensiones y 47 millones de parámetros iguala o supera a modelos mucho mayores en tareas de recuperación científica, y se distribuye también en formato ONNX de 8 bits (53 MB) para ejecutarse en el navegador con transformers.js o en servidores con Text Embeddings Inference y vLLM. Es, por tanto, una pieza adecuada para motores de búsqueda académica con requisitos estrictos de latencia y memoria.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ModernBERT (encoder transformer), fine-tuning de ibm-granite/granite-embedding-small-english-r2 |
| Parametros totales | 47.662.464 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | ONNX 8 bits (53 MB); fp16 para WebGPU; pesos safetensors en precisión completa |
| Idiomas soportados | ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, ONNX |
| Dimension del embedding | 384 |
| Pooling | token CLS, normalizacion L2, similitud por producto escalar |
| Tamano del repositorio | 0,4 GB |
| Descargas | 10 |
| Fecha de creacion | 2026-11-02 |

## Arquitectura y entrenamiento

sciseek-nano es un encoder transformer de la familia ModernBERT, derivado por fine-tuning de granite-embedding-small-english-r2 de IBM. Produce representaciones densas de 384 dimensiones mediante pooling del token CLS y normalización L2, de modo que la similitud entre consulta y documento se calcula con un producto escalar. El modelo está especializado en un único formato de entrada: los artículos se codifican como `"Title:\n{title}\nAbstract:\n{abstract}"`, mientras que las consultas no requieren prefijo ni instrucción alguna.

El entrenamiento se realizó sobre el dataset sciseek-train, publicado por el mismo autor, compuesto por pares de consultas y artículos científicos. No se dispone de información sobre el número exacto de tokens, la composición detallada del dataset ni sobre si se aplicaron técnicas de RLHF o DPO; la model card no detalla la función de pérdida ni el esquema de minería de negativos. El autor reporta mejoras estadísticamente significativas respecto al modelo base: +0,059 de nDCG@10 en SciSeek (intervalo [+0,054, +0,064]) y +0,026 en LitSearch (intervalo [+0,012, +0,040]). El modelo se publica junto a sciseek-micro (149M parámetros, 768 dimensiones), entrenado con los mismos datos, y ambos alimentan la búsqueda semántica de refract.science.

## Capacidades

- Generación de embeddings de frases para recuperación semántica de texto científico (título y resumen de artículos).
- Búsqueda de literatura por consulta en lenguaje natural, sin instrucciones ni prefijos.
- Similitud semántica entre consultas y documentos mediante coseno sobre vectores de 384 dimensiones.
- Ejecución en navegador y Node.js con transformers.js (WebGPU fp16 o WASM q8).
- Despliegue en servidor con Text Embeddings Inference (TEI) y vLLM mediante los ficheros docker compose incluidos en `deploy/`.
- Compatibilidad con la librería sentence-transformers y con ONNX Runtime.
- Indexación eficiente a gran escala: 384 dimensiones y 53 MB en ONNX de 8 bits.
- No soporta tool calling, agentes, razonamiento multi-paso, visión, audio ni modo thinking; es exclusivamente un modelo de embeddings.
- Capacidad monolingüe: solo inglés.

## Casos de uso

- Motor de búsqueda de literatura académica: indexar los títulos y resúmenes de un corpus de arXiv y recuperar los artículos más relevantes para una consulta de investigación; el modelo está entrenado exactamente para este formato de entrada y supera a modelos mucho mayores en SciSeek.
- Asistente de revisión bibliográfica: dado un tema de investigación, generar los vectores de las consultas del usuario y compararlos con un índice de resúmenes para sugerir lecturas relacionadas, con latencia baja gracias a los 47M parámetros.
- Búsqueda semántica en el navegador: desplegar el modelo en ONNX de 8 bits (53 MB) con transformers.js y WASM para ofrecer búsqueda de artículos sin backend, útil en aplicaciones web de divulgación científica.
- Deduplicación y agrupación de artículos: calcular embeddings de resúmenes y agrupar por similitud para detectar publicaciones duplicadas o temas solapados en una base de datos bibliográfica.
- Recomendación de artículos relacionados: usar el vector del resumen de un artículo como consulta contra el índice para construir un sistema de "artículos similares" en un repositorio institucional.
- Filtrado previo en pipelines RAG científicos: reducir un corpus de miles de documentos a los candidatos más relevantes antes de pasarlos a un modelo generativo, abaratando el coste de contexto.
- Enrutamiento de consultas en un portal de publicaciones: clasificar o dirigir consultas de usuarios hacia las colecciones temáticas adecuadas comparando su embedding con centroides de cada colección.

## Benchmarks y rendimiento

Resultados declarados por el autor del modelo (no verificados de forma independiente):

| Modelo | Base | Params | Dim | SciSeek nDCG@10 | LitSearch nDCG@10 | ONNX 8 bits |
|---|---|---:|---:|---:|---:|---:|
| sciseek-nano | granite-embedding-small-english-r2 | 47M | 384 | 0,646 | 0,512 | 53 MB |
| sciseek-micro | granite-embedding-english-r2 | 149M | 768 | 0,715 | 0,584 | 167 MB |

Resultados por conjunto de evaluación para sciseek-nano:

| Dataset | Metrica | Valor |
|---|---|---|
| SciSeek (test) | nDCG@10 | 0,6461 |
| SciSeek (test) | Recall@10 | 0,5418 |
| LitSearch | nDCG@10 | 0,5119 |
| DORIS-MAE | nDCG@10 | 0,6506 |
| BEIR TREC-COVID | nDCG@10 | 0,6304 |
| BEIR SciFact | nDCG@10 | 0,7413 |
| BEIR NFCorpus | nDCG@10 | 0,3657 |
| BEIR SciDocs | nDCG@10 | 0,2287 |

Según el autor, sciseek-nano es el tercer mejor modelo de todos los evaluados en SciSeek, solo por detrás de sciseek-micro y Qwen3-Embedding-4B (85 veces mayor). En LitSearch, sciseek-micro y cuatro modelos de propósito general más grandes (Qwen3-Embedding-4B, Qwen3-Embedding-0.6B, jina-v5-small y jina-v5-nano) obtienen puntuaciones significativamente superiores; granite-r2, gte-modernbert y leaf-ir empatan, y el resto queda por debajo. A igual tamaño de índice (384 dimensiones), el mejor modelo Matryoshka truncado alcanza 0,612 en SciSeek (Qwen3-Embedding-4B), por debajo de sciseek-nano.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp32 (47M parámetros); unos 100 MB en fp16 y aproximadamente 53 MB en ONNX de 8 bits.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; no requiere A100 ni H100. Una RTX 4090 o RTX 3090 sobredimensionan el modelo y solo aportan ventaja en throughput por lotes grandes.
- Cabe en cualquier GPU consumer, incluida una GTX 1650 o una iGPU con suficiente memoria compartida; también funciona en CPU.
- Despliegue: sentence-transformers (Python), ONNX Runtime, transformers.js (WebGPU o WASM en navegador y Node), Text Embeddings Inference (TEI) y vLLM, con ficheros docker compose en `deploy/`.
- Latencia y throughput: no disponibles en la información proporcionada. El tamaño del modelo y del embedding (384 dimensiones) sugieren una indexación muy económica, pero no se publican cifras de latencia ni de documentos por segundo.

## Comparativa con modelos similares

| Modelo | Params | Dim | SciSeek nDCG@10 | LitSearch nDCG@10 | Licencia | Disponibilidad |
|---|---:|---:|---:|---:|---|---|
| sciseek-nano | 47M | 384 | 0,646 | 0,512 | Apache 2.0 | Hugging Face, ONNX, transformers.js |
| sciseek-micro | 149M | 768 | 0,715 | 0,584 | no disponible | Hugging Face |
| Qwen3-Embedding-4B | ~4B | 384 (truncado Matryoshka) | 0,612 (truncado) | superior a sciseek-nano | no disponible | Hugging Face |
| granite-embedding-small-english-r2 | 47M | 384 | ~0,587 (base, -0,059) | ~0,486 (base, -0,026) | Apache 2.0 | Hugging Face |

sciseek-nano se sitúa como la opción Pareto eficiente de su categoría: con 47M parámetros y 384 dimensiones supera al modelo base y a los modelos Matryoshka truncados al mismo tamaño de índice, y solo cede ante sciseek-micro (3 veces más parámetros) y Qwen3-Embedding-4B (85 veces más parámetros). Para tareas fuera de la búsqueda científica, el propio autor recomienda usar el modelo base granite-embedding-small-english-r2.

## Limitaciones y advertencias

- Especialización estrecha: está entrenado exclusivamente para búsqueda de literatura científica; para otras tareas de similitud o recuperación rinde peor que un modelo de propósito general.
- Monolingüe: solo soporta inglés; las consultas en castellano u otros idiomas no están cubiertas.
- Formato de entrada rígido: los documentos deben codificarse como `"Title:\n{title}\nAbstract:\n{abstract}"`; desviarse de este formato puede degradar la recuperación.
- Riesgo de alucinación no aplicable en sentido estricto (no genera texto), pero sí de recuperación irrelevante si el corpus no es científico o si las consultas son muy cortas o ambiguas.
- Resultados de benchmarks declarados por el autor y no verificados de forma independiente (`verified: false` en el model-index).
- Rendimiento flojo en algunos conjuntos BEIR: nDCG@10 de 0,2287 en SciDocs y 0,3657 en NFCorpus, muy por debajo de los resultados en SciFact o SciSeek.
- Licencia Apache 2.0, que permite uso comercial, pero conviene revisar las condiciones del modelo base granite-embedding-small-english-r2 y de los datasets de entrenamiento.
- Advertencia de despliegue en navegador: no todos los navegadores exponen WebGPU con fp16; debe preverse una caída a WASM y ejecutar el extractor en un Web Worker.
- Modelo con muy poca adopción (10 descargas, 0 likes en el momento de la consulta) y creado recientemente; no hay evidencia de uso en producción más allá de refract.science.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/daniel-gomm/sciseek-nano
- Modelo hermano sciseek-micro: https://huggingface.co/daniel-gomm/sciseek-micro
- Dataset de entrenamiento: https://huggingface.co/datasets/daniel-gomm/sciseek-train
- Dataset de evaluación SciSeek: https://huggingface.co/datasets/daniel-gomm/SciSeek
- Dataset LitSearch: https://huggingface.co/datasets/princeton-nlp/LitSearch
- Modelo base: https://huggingface.co/ibm-granite/granite-embedding-small-english-r2
- Aplicación refract.science: https://refract.science
- Documentación de Text Embeddings Inference: https://huggingface.co/docs/text-embeddings-inference
- Documentación de vLLM: https://vllm.ai/
- Documentación de transformers.js: https://huggingface.co/docs/transformers.js
- Repositorio de TEI: https://github.com/huggingface/text-embeddings-inference
