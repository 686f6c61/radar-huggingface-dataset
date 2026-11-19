# NeuML/colbert-atto-25m-384d

## Resumen

ColBERT Atto 25M es un modelo de recuperación de información basado en late interaction (estilo ColBERT) desarrollado por NeuML. Se construye mediante fine-tuning del modelo base `NeuML/atto-25m-384d` con la librería PyLate, y está diseñado para funcionar como retriever o reranker en pipelines de búsqueda semántica y RAG. Con 25,4 millones de parámetros y una dimensión de embedding de 384, es una alternativa extremadamente ligera frente a los rerankers cross-encoder habituales.

El modelo pertenece a la familia Atto, una línea de modelos contextuales compactos orientados a representación lingüística con eficiencia de parámetros. La variante ColBERT añade la cabeza de proyección densa (384 a 128 dimensiones) que genera embeddings multi-vector por token, lo que permite puntuar con MaxSim sin necesidad de un cross-encoder completo.

Su relevancia actual radica en la relación calidad/tamaño: con 25 millones de parámetros alcanza un ndcg@10 medio de 0,4995 en el subconjunto de BEIR evaluado, superando a variantes más pequeñas de la misma familia y acercándose a modelos de 110M parámetros como LateOn. Todo ello con licencia Apache 2.0 y un repositorio de 0,1 GB.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (AttoModel) con cabeza densa de proyección para late interaction (ColBERT) |
| Parámetros totales | 25.444.096 |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | 299 tokens (max_seq_length) |
| Tipos de cuantización | No disponible |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura ColBERT: un encoder transformer (AttoModel) con `max_seq_length` de 299 tokens que genera una representación por token, seguida de una capa densa lineal sin sesgo que proyecta de 384 a 128 dimensiones (`in_features: 384`, `out_features: 128`, activación identidad, sin residual). La puntuación se realiza mediante MaxSim entre los embeddings de consulta y documento, lo que permite un reranking más expresivo que un bi-encoder clásico pero mucho más barato que un cross-encoder.

El fine-tuning se realizó con PyLate sobre el modelo base `NeuML/atto-25m-384d`. Los hiperparámetros publicados son: batch size por dispositivo de 4, 1 época, learning rate 0,0003, warmup del 5 %, acumulación de gradientes de 8, fp16 activado, evaluación por pasos y 20 workers de dataloader. No se especifican en la información disponible el número de tokens de entrenamiento ni la composición exacta del dataset, ni si hubo etapas de RLHF o DPO (no aplicables en un modelo de recuperación).

## Capacidades

- Generación de embeddings multi-vector por token para recuperación de información (late interaction ColBERT).
- Búsqueda semántica sobre corpus documentales mediante MaxSim.
- Reranking de resultados de un retriever previo (bi-encoder o BM25), aprovechando la señal token a token.
- Integración nativa con `sentence-transformers` v6.0.0 o superior mediante `MultiVectorEncoder` (`encode_query`, `encode_document`, `similarity`).
- Integración con txtai 9.0 o superior para construir bases de embeddings y pipelines de RAG.
- Soporte de `feature-extraction` y `sentence-similarity` como pipeline tags.
- Compatible con endpoints de Hugging Face (`endpoints_compatible`).
- No soporta tool calling, agentes, visión, audio ni modos de razonamiento: es un modelo puramente de representación.

## Casos de uso

- Reranking en pipelines RAG: se coloca tras un retriever bi-encoder ligero y reordena los candidatos con MaxSim; su coste de 25M parámetros permite ejecutarlo en CPU o GPU modesta sin penalizar la latencia del pipeline.
- Búsqueda semántica en documentación técnica: indexar manuales o FAQs en inglés con txtai y consultar con lenguaje natural; la ventana de 299 tokens encaja con fragmentos de párrafo típicos de chunking.
- Búsqueda en bases de conocimiento internas: como retriever sobre catálogos de productos o tickets de soporte en inglés, con un repositorio de solo 0,1 GB que se puede versionar y desplegar en contenedores pequeños.
- Filtrado previo en motores de búsqueda híbridos: combinar BM25 con este modelo para la fase de recall y reservar cross-encoders más caros solo para el top-k final.
- Sistemas de recomendación de contenido textual: calcular similitud entre descripciones de artículos o documentos y el perfil del usuario mediante embeddings multi-vector.
- Deduplicación y clustering de documentos: agrupar pasajes similares en corpus grandes con un coste computacional muy bajo gracias al tamaño reducido del modelo.
- Prototipado y evaluación de arquitecturas ColBERT: servir como baseline ligero para comparar configuraciones de dimensión y vocabulario dentro de la familia Atto antes de escalar a modelos mayores.

## Benchmarks y rendimiento

Resultados de `ndcg@10` en el subconjunto de BEIR evaluado con el script de benchmarks de txtai:

| Modelo | Parámetros | Dimensiones | Vocab | ArguAna | NFCorpus | SciFact | Media |
|---|---:|---:|---:|---:|---:|---:|---:|
| colbert-atto-840-8d | 840 | 8 | 250 | 0,2143 | 0,2585 | 0,4688 | 0,3139 |
| colbert-atto-9k-16d | 9K | 16 | 1K | 0,2459 | 0,2902 | 0,5604 | 0,3655 |
| colbert-atto-90k-32d | 90K | 32 | 4K | 0,3435 | 0,3263 | 0,6663 | 0,4454 |
| colbert-atto-950k-128d | 950K | 128 | 4K | 0,4149 | 0,3352 | 0,6946 | 0,4816 |
| colbert-atto-4m-384d | 4M | 384 | 30K | 0,4157 | 0,3349 | 0,6949 | 0,4818 |
| colbert-atto-14m-384d | 14M | 384 | 30K | 0,4248 | 0,3483 | 0,7057 | 0,4929 |
| **colbert-atto-25m-384d** | **25M** | **384** | **30K** | **0,4395** | **0,3461** | **0,7130** | **0,4995** |
| LateOn | 110M | 768 | 50K | 0,4979 | 0,3802 | 0,7609 | 0,5463 |

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp16 (25,4M parámetros equivalen a unos 51 MB de pesos); con overhead de activaciones y batch pequeño, cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM (GTX 1650, RTX 3050, RTX 4090, A100, H100). El modelo no requiere GPU de datacenter.
- Cabe en GPU consumer: sí, en todas las GPU modernas e incluso en iGPU y CPU para cargas moderadas.
- Opciones de despliegue: `sentence-transformers` v6.0.0 o superior (`MultiVectorEncoder`), txtai 9.0 o superior, PyLate para fine-tuning adicional. No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, ya que no es un modelo generativo.
- Latencia y throughput: no disponibles en la información proporcionada. Por el tamaño (25M parámetros, contexto de 299 tokens) se espera una latencia muy baja, pero no se aportan cifras medidas.

## Comparativa con modelos similares

| Modelo | Parámetros | Dimensiones | Contexto | ndcg@10 medio (BEIR subset) | Licencia | Disponibilidad |
|---|---:|---:|---:|---:|---|---|
| colbert-atto-25m-384d | 25M | 384 | 299 | 0,4995 | Apache 2.0 | Hugging Face |
| colbert-atto-14m-384d | 14M | 384 | No disponible | 0,4929 | Apache 2.0 | Hugging Face |
| colbert-atto-4m-384d | 4M | 384 | No disponible | 0,4818 | Apache 2.0 | Hugging Face |
| LateOn | 110M | 768 | No disponible | 0,5463 | No disponible | Hugging Face |

Frente a los modelos de la misma familia, el salto de 14M a 25M parámetros aporta una mejora modesta (+0,0066 en la media), mientras que LateOn, con 4,4 veces más parámetros y el doble de dimensión, obtiene +0,0468. La elección depende del presupuesto de latencia y del tamaño del corpus.

## Limitaciones y advertencias

- Solo soporta inglés; el rendimiento en castellano u otros idiomas no está evaluado y probablemente sea deficiente.
- Ventana de contexto de 299 tokens: los documentos deben trocearse en fragmentos cortos; pasajes largos perderán información.
- Riesgo de alucinación no aplica en sentido generativo (no produce texto), pero sí puede devolver pasajes irrelevantes como relevantes si la consulta cae fuera de dominio.
- Los benchmarks publicados cubren solo tres datasets de BEIR (ArguAna, NFCorpus, SciFact); no hay evaluación en dominios como Question Answering, código o multilingüe.
- Licencia Apache 2.0 permite uso comercial sin restricciones adicionales, pero conviene revisar la licencia del modelo base `NeuML/atto-25m-384d` por si impone condiciones adicionales (no especificadas en la información disponible).
- No se documentan sesgos específicos; al ser un modelo de recuperación, puede heredar sesgos del corpus de entrenamiento, cuya composición no se detalla.
- Requiere `sentence-transformers` v6.0.0 o superior o txtai 9.0 o superior; versiones anteriores no cargan el modelo como multi-vector.
- El modelo tiene 0 descargas y 1 like en el momento de la consulta: es un artefacto reciente y poco validado por la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/NeuML/colbert-atto-25m-384d
- Modelo base: https://huggingface.co/NeuML/atto-25m-384d
- Artículo "Introducing Atto": https://huggingface.co/blog/neuml/introducing-atto
- PyLate (librería de fine-tuning): https://github.com/lightonai/pylate
- txtai (librería de embeddings y RAG): https://github.com/neuml/txtai
- Script de benchmarks de txtai: https://github.com/neuml/txtai/blob/master/examples/benchmarks.py
- Sentence Transformers (documentación): https://www.sbert.net/
- Modelo comparable LateOn: https://huggingface.co/lightonai/lateon
- Variante colbert-atto-14m-384d: https://huggingface.co/neuml/colbert-atto-14m-384d
- Variante colbert-atto-4m-384d: https://huggingface.co/neuml/colbert-atto-4m-384d
