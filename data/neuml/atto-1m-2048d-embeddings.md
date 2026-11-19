# NeuML/atto-1m-2048d-embeddings

## Resumen

Atto 1m 2048d embeddings es un modelo de representación de frases (sentence embeddings) desarrollado por NeuML, pensado para generar vectores densos de 2048 dimensiones a partir de texto en inglés. Forma parte de la familia Atto, una línea de modelos contextuales compactos diseñados para aprendizaje de representaciones con un número muy reducido de parámetros. En concreto, este checkpoint cuenta con 1.326.720 parámetros totales, lo que lo sitúa en el rango del millón de parámetros, es decir, tres órdenes de magnitud por debajo de los modelos de embeddings convencionales basados en BERT.

El modelo se obtiene mediante fine-tuning con la librería sentence-transformers sobre el modelo base NeuML/atto-1m-2048d, y su propósito principal es la búsqueda semántica y la recuperación de información (retrieval) en pipelines de RAG. Su relevancia actual radica en que demuestra que es posible obtener puntuaciones competitivas en tareas de recuperación con un coste computacional y de almacenamiento mínimo: un vector de 2048 dimensiones por documento, generado por un modelo de poco más de un millón de parámetros, puede desplegarse en CPU sin dificultad y almacenarse en bases vectoriales a gran escala.

La arquitectura subyacente es de tipo transformer con una implementación personalizada (`AttoModel`, cargada con `trust_remote_code=True`), un vocabulario reducido de 4.000 tokens y una capa de pooling de tipo max que proyecta la salida a 2048 dimensiones. El modelo está publicado bajo licencia Apache 2.0 y solo declara soporte para inglés.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer contextual compacto (`AttoModel`) con pooling max; empaquetado como SentenceTransformer |
| Parametros totales | 1.326.720 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors; al ser un modelo de ~1,3 M de parámetros, la cuantización es innecesaria en la práctica) |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |
| Dimensiones del embedding | 2048 |
| Vocabulario | 4.000 tokens |
| Pooling | max, con inclusión del prompt |
| Prefijos de prompt | `query: ` para consultas, `document: ` para documentos |
| Modelo base | NeuML/atto-1m-2048d |
| Librería | sentence-transformers (requiere `trust_remote_code=True`) |
| Pipeline | sentence-similarity / feature-extraction |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura transformer de tipo encoder con una implementación propia (`AttoModel`) que expone la salida `last_hidden_state` y cuyo `token_embeddings` se pasa a una capa de pooling. El pooling es de tipo max sobre la dimensión de salida, con `embedding_dimension=2048` e `include_prompt=True`. El vocabulario es de 4.000 tokens, muy inferior al de los tokenizadores BPE habituales (30.000-50.000), lo que reduce drásticamente el tamaño de la matriz de embeddings y contribuye a que el total de parámetros se mantenga en torno al millón.

El entrenamiento se realizó con sentence-transformers sobre el checkpoint base `NeuML/atto-1m-2048d`, con los siguientes hiperparámetros declarados por el autor: batch size de 128 por dispositivo (entrenamiento y evaluación), 25 épocas, learning rate de 0,003, 1.000 pasos de warmup, weight decay de 0,01, precisión fp16 y 20 workers de dataloader. Se emplean prefijos de prompt diferenciados para consultas (`query: `) y documentos (`document: `), práctica habitual en modelos de recuperación asimétrica. No se detalla en la información disponible la composición del dataset de entrenamiento, el número de tokens vistos ni si se aplicaron técnicas de RLHF o DPO (poco habituales en modelos de embeddings).

## Capacidades

- Generación de embeddings de frase y de documento con 2048 dimensiones, orientados a similitud semántica y recuperación densa.
- Búsqueda semántica sobre corpus documentales mediante indexación vectorial (integración nativa con txtai).
- Recuperación aumentada por generación (RAG): el modelo actúa como recuperador de pasajes para alimentar a un LLM generador.
- Soporte de recuperación asimétrica mediante prefijos `query: ` y `document: `.
- Extracción de características (`feature-extraction`) a nivel de token y de secuencia.
- Compatibilidad con la API de sentence-transformers (`SentenceTransformer.encode`).
- Compatibilidad declarada con endpoints de Hugging Face (`endpoints_compatible`).
- No soporta tool calling, agentes, razonamiento multi-paso, visión ni audio: es exclusivamente un modelo de embeddings de texto.
- Capacidad multilingüe: no, solo inglés.

## Casos de uso

- Búsqueda semántica en documentación técnica: indexar manuales, RFCs o documentación de API con txtai o una base vectorial y recuperar pasajes relevantes para una consulta en lenguaje natural. El modelo es adecuado porque genera vectores de 2048 dimensiones con un coste de inferencia mínimo, lo que permite indexar corpus grandes en CPU.
- Recuperación para RAG en producción: usar el modelo como retriever en un pipeline que alimente a un LLM. Su reducido tamaño permite ejecutarlo en el mismo nodo que el orquestador sin competir por VRAM con el modelo generador.
- Deduplicación y clustering de documentos: calcular embeddings de un corpus y agrupar por similitud coseno para detectar duplicados o temas. La dimensión 2048 ofrece buena separabilidad a un coste de almacenamiento de 8 KB por vector en fp32.
- Filtrado previo en motores de búsqueda híbridos: combinar BM25 con recuperación densa usando este modelo como componente semántico, aprovechando su bajo coste para reordenar candidatos.
- Sistemas de recomendación de contenido textual: embeber artículos, noticias o publicaciones y calcular similitud con el perfil del usuario para generar recomendaciones.
- Moderación y clasificación por similitud: comparar mensajes entrantes contra un conjunto de ejemplos etiquetados y asignar la etiqueta del vecino más cercano, útil en entornos con recursos limitados.
- Despliegue en dispositivos edge o entornos sin GPU: al tener 1,3 M de parámetros, el modelo cabe en memoria de un contenedor ligero y puede servirse en CPU con latencias de milisegundos.

## Benchmarks y rendimiento

Resultados declarados por el autor en un subconjunto de BEIR, métrica nDCG@10, calculados con el script de benchmarks de txtai:

| Modelo | Parámetros | Dimensiones | Vocab | ArguAna | NFCorpus | SciFact | Media |
|---|---:|---:|---:|---:|---:|---:|---:|
| atto-36k-384d | 36K | 384 | 1K | 0,3249 | 0,2286 | 0,4920 | 0,3485 |
| atto-50k-768d | 50K | 768 | 1K | 0,3264 | 0,2430 | 0,5334 | 0,3676 |
| atto-90k-2048d | 90K | 2048 | 1K | 0,4021 | 0,2676 | 0,6074 | 0,4257 |
| bert-hash-femto | 243K | 128 | 30K | 0,1964 | 0,1402 | 0,2830 | 0,2065 |
| bert-hash-pico | 442K | 128 | 30K | 0,2853 | 0,2075 | 0,3912 | 0,2947 |
| bert-hash-nano | 953K | 128 | 30K | 0,3828 | 0,2562 | 0,5032 | 0,3807 |
| **atto-1m-2048d** | **1M** | **2048** | **4K** | **0,4189** | **0,2941** | **0,6229** | **0,4453** |
| atto-1m-4096d | 1M | 4096 | 4K | 0,4223 | 0,3044 | 0,6417 | 0,4561 |
| atto-2m-8192d | 2M | 8192 | 4K | 0,4343 | 0,3125 | 0,6653 | 0,4707 |
| atto-14m-384d | 14M | 384 | 30K | 0,4874 | 0,3329 | 0,6472 | 0,4892 |
| atto-17m-8192d | 17M | 8192 | 30K | 0,4963 | 0,3455 | 0,6909 | 0,5109 |
| all-MiniLM-L6-v2 | 23M | 384 | 30K | 0,4789 | 0,3089 | 0,6527 | 0,4802 |
| atto-25m-384d | 25M | 384 | 30K | 0,4879 | 0,3426 | 0,6600 | 0,4968 |
| atto-28m-8192d | 28M | 8192 | 30K | 0,5111 | 0,3461 | 0,6843 | 0,5138 |
| DenseOn | 110M | 768 | 50K | 0,5408 | 0,3915 | 0,7591 | 0,5638 |

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 100 MB en fp32 para los pesos (1,3 M de parámetros × 4 bytes ≈ 5,3 MB), más el overhead del runtime de PyTorch y del tokenizador. Cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: no requiere GPU. Cualquier GPU con al menos 1 GB de VRAM (GTX 1050, RTX 3060, RTX 4090, A100, H100) puede ejecutarlo; la GPU solo aporta ventaja en throughput por lotes grandes.
- Cabe en GPU consumer: sí, en todas las GPU modernas e incluso en iGPU y en CPU.
- Opciones de despliegue: sentence-transformers (requiere `trust_remote_code=True`), txtai, y cualquier servidor compatible con la API de sentence-transformers o de Hugging Face Inference Endpoints. La compatibilidad con vLLM, llama.cpp, Ollama o TGI no está declarada, y al no ser un modelo generativo no aplican los formatos GGUF.
- Latencia y throughput: no se han publicado cifras de latencia ni throughput en la información disponible. Por el tamaño del modelo, se espera que la codificación de lotes en CPU sea del orden de milisegundos por lote, pero no hay dato verificado.

## Comparativa con modelos similares

| Modelo | Parámetros | Dimensiones | Contexto | Media BEIR (subconjunto) | Licencia | Disponibilidad |
|---|---:|---:|---|---:|---|---|
| **atto-1m-2048d-embeddings** | 1,33M | 2048 | no disponible | 0,4453 | Apache 2.0 | Hugging Face |
| atto-1m-4096d | 1M | 4096 | no disponible | 0,4561 | Apache 2.0 (según familia) | Hugging Face |
| atto-14m-384d | 14M | 384 | no disponible | 0,4892 | Apache 2.0 (según familia) | Hugging Face |
| all-MiniLM-L6-v2 | 23M | 384 | 256 tokens (dato público del modelo) | 0,4802 | Apache 2.0 | Hugging Face |
| DenseOn | 110M | 768 | no disponible | 0,5638 | no disponible | Hugging Face |

La comparativa muestra el compromiso central del modelo: con 1,33 M de parámetros supera a los modelos hash de NeuML de tamaño similar y se queda por debajo de all-MiniLM-L6-v2 (23 M de parámetros) en media BEIR, pero a un coste de parámetros 17 veces menor y con una dimensión de embedding 5,3 veces mayor.

## Limitaciones y advertencias

- Solo inglés: no se declara soporte para otros idiomas, por lo que su uso en castellano u otras lenguas degradará la calidad de la recuperación.
- Riesgo de alucinación no aplica en sentido generativo, pero sí de falsos positivos en similitud: al ser un modelo muy pequeño, puede recuperar pasajes léxicamente próximos pero semánticamente irrelevantes.
- Vocabulario de solo 4.000 tokens: probablemente incrementa la fragmentación de palabras poco frecuentes y términos técnicos, lo que puede penalizar en dominios especializados.
- Longitud de contexto no documentada: no hay dato oficial sobre el máximo de tokens por secuencia, lo que impide planificar el truncado con seguridad.
- Requiere `trust_remote_code=True` para cargar la arquitectura personalizada `AttoModel`, lo que implica ejecutar código del repositorio del autor; conviene auditar el código antes de usarlo en producción.
- Licencia Apache 2.0: permite uso comercial sin restricciones adicionales, pero no hay garantías del autor sobre el rendimiento en dominios concretos.
- Sin datos publicados de sesgos: no se ha documentado ningún análisis de sesgo, y el corpus de entrenamiento no se detalla.
- El modelo tiene 0 descargas y 2 likes en el momento de la consulta, lo que indica adopción prácticamente nula y ausencia de validación independiente.
- No es un modelo generativo: no puede usarse para chat, resumen ni generación de código; su único uso es producir embeddings.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/NeuML/atto-1m-2048d-embeddings
- Modelo base: https://huggingface.co/NeuML/atto-1m-2048d
- Artículo de presentación de Atto: https://hf.co/blog/neuml/introducing-atto
- Repositorio txtai: https://github.com/neuml/txtai
- Script de benchmarks de txtai: https://github.com/neuml/txtai/blob/master/examples/benchmarks.py
- sentence-transformers: https://www.SBERT.net
- Modelo comparable all-MiniLM-L6-v2: https://huggingface.co/sentence-transformers/all-MiniLM-L6-v2
- Modelo comparable DenseOn: https://huggingface.co/lightonai/denseon
- Familia Atto (variantes citadas): https://hf.co/neuml/atto-36k-384d-embeddings, https://hf.co/neuml/atto-50k-768d-embeddings, https://hf.co/neuml/atto-90k-2048d-embeddings, https://hf.co/neuml/atto-1m-4096d-embeddings, https://hf.co/neuml/atto-2m-8192d-embeddings, https://hf.co/neuml/atto-14m-384d-embeddings, https://hf.co/neuml/atto-17m-8192d-embeddings, https://hf.co/neuml/atto-25m-384d-embeddings, https://hf.co/neuml/atto-28m-8192d-embeddings
