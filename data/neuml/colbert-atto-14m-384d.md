# NeuML/colbert-atto-14m-384d

## Resumen

ColBERT Atto 14M es un modelo de recuperación de información basado en late interaction (estilo ColBERT), desarrollado por NeuML y publicado en Hugging Face. Se obtiene mediante fine-tuning del modelo base NeuML/atto-14m-384d con la librería PyLate, y está diseñado para generar representaciones multi-vector por token que permiten puntuar la relevancia entre consulta y documento mediante MaxSim. Con 14.774.272 parámetros y una dimensión de embedding de 384 reducida a 128 en la proyección densa, es un modelo extremadamente compacto orientado a búsqueda semántica y reranking.

El modelo forma parte de la familia Atto, una línea de modelos contextuales compactos pensados para aprendizaje de representaciones con alta eficiencia de parámetros. Su relevancia actual radica en que ofrece un equilibrio poco habitual entre tamaño (14M de parámetros, repositorio de 0,1 GB) y calidad de recuperación: en el subconjunto de BEIR evaluado por el autor alcanza un ndcg@10 medio de 0,4929, superando a variantes más pequeñas de la misma familia y acercándose a modelos de 110M de parámetros como LateOn (0,5463).

Está pensado para integrarse en pipelines de búsqueda semántica y RAG, especialmente como reranker sobre resultados de un retriever inicial. Su licencia Apache 2.0 y su reducido coste de inferencia lo hacen adecuado para despliegues en CPU o GPU de gama baja, aunque su cobertura lingüística se limita al inglés.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | ColBERT (late interaction) sobre transformer AttoModel, con proyección densa 384→128 |
| Parámetros totales | 14.774.272 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 299 tokens (max_seq_length) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura ColBERT de late interaction: un encoder transformer (AttoModel) genera embeddings contextuales por token, que se proyectan de 384 a 128 dimensiones mediante una capa densa sin bias ni activación. La puntuación de relevancia se calcula con MaxSim, sumando para cada token de la consulta la similitud máxima con los tokens del documento. Esto permite un reranking más fino que los embeddings de frase únicos, a coste de almacenar múltiples vectores por documento.

El fine-tuning se realizó con PyLate sobre el modelo base NeuML/atto-14m-384d. Los hiperparámetros publicados son: 1 época, learning rate 0,0003, warmup del 5 %, gradient accumulation de 4 pasos, precisión fp16 y evaluación por pasos. No se detalla en la información disponible la composición exacta del dataset de entrenamiento ni el número de tokens utilizados, ni si hubo etapas de RLHF o DPO (no aplicables habitualmente en modelos de recuperación). El vocabulario del tokenizador es de 30K entradas y la dimensión de embedding es 384.

## Capacidades

- Generación de representaciones multi-vector por token para búsqueda semántica y recuperación de información.
- Puntuación de relevancia consulta-documento mediante MaxSim (late interaction).
- Reranking de resultados de un retriever inicial, función en la que destaca según la model card.
- Integración con txtai 9.0+ para construir bases de embeddings y pipelines de RAG.
- Carga directa como `MultiVectorEncoder` en Sentence Transformers v6.0.0 o superior.
- Extracción de features (`feature-extraction`) y similitud de frases (`sentence-similarity`).
- Soporte de tool calling / function calling: no disponible (no es un modelo generativo).
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: limitadas al inglés.
- Capacidades especiales: no dispone de modo thinking, visión ni audio.

## Casos de uso

- Reranking en pipelines RAG: tras una primera fase de recuperación con un retriever denso o BM25, ColBERT Atto 14M reordena los candidatos con MaxSim, mejorando la precisión del contexto entregado al LLM generador con un coste de cómputo muy bajo gracias a sus 14M de parámetros.
- Búsqueda semántica en documentación técnica: indexar manuales o documentación de producto en txtai con este modelo permite consultas en lenguaje natural sobre corpus en inglés, con un repositorio de solo 0,1 GB que cabe en cualquier entorno.
- Búsqueda en bases de conocimiento internas: el modelo puede alimentar un sistema de preguntas y respuestas sobre wikis o bases de conocimiento corporativas en inglés, usando la API de txtai para indexar y consultar.
- Reranking en motores de búsqueda de comercio electrónico: reordenar resultados de búsqueda de productos en inglés según relevancia semántica respecto a la consulta del usuario, aprovechando la naturaleza multi-vector para capturar coincidencias parciales de términos.
- Filtrado de candidatos en pipelines de deduplicación o clasificación: usar las representaciones por token para medir similitud fina entre pares de textos en tareas de matching en inglés.
- Prototipado e investigación en recuperación: su tamaño reducido y licencia Apache 2.0 lo hacen idóneo para experimentar con arquitecturas de late interaction, comparar variantes de la familia Atto o servir como baseline ligero en estudios de eficiencia.
- Despliegue en entornos con recursos limitados: al requerir muy poca memoria, puede ejecutarse en CPU o en GPUs consumer para servicios de búsqueda de baja latencia.

## Benchmarks y rendimiento

Resultados de ndcg@10 en un subconjunto de BEIR, según la model card del autor (script de benchmarks de txtai):

| Modelo | Parámetros | Dimensiones | Vocab | ArguAna | NFCorpus | SciFact | Media |
|---|---:|---:|---:|---:|---:|---:|---:|
| colbert-atto-840-8d | 840 | 8 | 250 | 0,2143 | 0,2585 | 0,4688 | 0,3139 |
| colbert-atto-9k-16d | 9K | 16 | 1K | 0,2459 | 0,2902 | 0,5604 | 0,3655 |
| colbert-atto-90k-32d | 90K | 32 | 4K | 0,3435 | 0,3263 | 0,6663 | 0,4454 |
| colbert-atto-950k-128d | 950K | 128 | 4K | 0,4149 | 0,3352 | 0,6946 | 0,4816 |
| colbert-atto-4m-384d | 4M | 384 | 30K | 0,4157 | 0,3349 | 0,6949 | 0,4818 |
| **colbert-atto-14m-384d** | **14M** | **384** | **30K** | **0,4248** | **0,3483** | **0,7057** | **0,4929** |
| colbert-atto-25m-384d | 25M | 384 | 30K | 0,4395 | 0,3461 | 0,7130 | 0,4995 |
| LateOn | 110M | 768 | 50K | 0,4979 | 0,3802 | 0,7609 | 0,5463 |

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp16 (14,7M de parámetros); en la práctica, unos pocos cientos de MB incluyendo buffers y tokenizador.
- GPU recomendadas: cualquier GPU moderna sirve; el modelo es viable incluso en GPUs integradas o en CPU. Para alto throughput, una RTX 4090 o una A100 ofrecen margen sobrado, pero no son necesarias.
- Cabe en cualquier GPU consumer (GTX 1060, RTX 3060, RTX 4090, etc.) y también en CPU.
- Opciones de despliegue: txtai 9.0+, Sentence Transformers v6.0.0+ (`MultiVectorEncoder`) y PyLate. No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, ya que no es un modelo generativo.
- Latencia y throughput estimados: no disponible en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Dimensiones | Contexto | Media BEIR (ndcg@10) | Licencia | Disponibilidad |
|---|---:|---:|---:|---:|---|---|
| colbert-atto-14m-384d | 14M | 384 | 299 | 0,4929 | Apache 2.0 | Hugging Face |
| colbert-atto-25m-384d | 25M | 384 | no disponible | 0,4995 | Apache 2.0 | Hugging Face |
| colbert-atto-4m-384d | 4M | 384 | no disponible | 0,4818 | Apache 2.0 | Hugging Face |
| LateOn | 110M | 768 | no disponible | 0,5463 | no disponible | Hugging Face |

La comparativa se limita al subconjunto de BEIR (ArguAna, NFCorpus, SciFact) reportado por el autor; no se dispone de datos de MMLU, HumanEval ni GSM8K, que no aplican a un modelo de recuperación.

## Limitaciones y advertencias

- Solo soporta inglés; el rendimiento en otros idiomas no está evaluado y previsiblemente será deficiente.
- Ventana de contexto de 299 tokens, insuficiente para documentos largos sin fragmentación previa.
- Al ser un modelo de recuperación y no generativo, puede producir falsos positivos en la puntuación de relevancia; no debe usarse como fuente de conocimiento por sí mismo.
- Los benchmarks publicados cubren únicamente tres datasets de BEIR; el rendimiento en dominios fuera de distribución (jurídico, médico, multilingüe) no está validado.
- Sesgos: no se documentan análisis de sesgo; al entrenarse sobre corpus en inglés, puede heredar sesgos de esos datos.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías ni soporte.
- Requiere almacenar múltiples vectores por documento (late interaction), lo que incrementa el coste de indexación frente a embeddings de frase únicos.
- Dependencia de versiones concretas: txtai 9.0+ y Sentence Transformers 6.0.0+ para la carga como multi-vector.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/NeuML/colbert-atto-14m-384d
- Modelo base: https://huggingface.co/NeuML/atto-14m-384d
- Artículo "Introducing Atto": https://hf.co/blog/neuml/introducing-atto
- Repositorio PyLate: https://github.com/lightonai/pylate
- Repositorio txtai: https://github.com/neuml/txtai
- Script de benchmarks de txtai: https://github.com/neuml/txtai/blob/master/examples/benchmarks.py
- Variante colbert-atto-25m-384d: https://hf.co/neuml/colbert-atto-25m-384d
- Variante colbert-atto-4m-384d: https://hf.co/neuml/colbert-atto-4m-384d
- Modelo LateOn: https://hf.co/lightonai/lateon
