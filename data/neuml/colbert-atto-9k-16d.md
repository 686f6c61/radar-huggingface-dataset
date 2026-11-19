# NeuML/colbert-atto-9k-16d

## Resumen

ColBERT Atto es un modelo de recuperación de información basado en interacción tardía (late interaction), desarrollado por NeuML como parte de la familia Atto de modelos contextuales compactos. Se trata de un fine-tune del modelo base NeuML/atto-9k-16d, entrenado con la librería PyLate para funcionar como retriever multi-vector al estilo ColBERT. El modelo no genera texto: su función es producir embeddings de consulta y documento que se comparan mediante MaxSim para puntuar relevancia.

La relevancia de este modelo radica en su tamaño extremadamente reducido: aproximadamente 9.000 parámetros, con embeddings de 16 dimensiones y un vocabulario de 1.000 tokens. Esto lo sitúa en la gama más baja de la familia Atto, por debajo de variantes como colbert-atto-90k-32d o colbert-atto-950k-128d. Su propósito es ofrecer búsqueda semántica y reranking con un coste computacional mínimo, apto para entornos con recursos muy limitados o para pipelines donde el modelo actúa como primera etapa de filtrado.

El modelo se integra con txtai (versión 9.0 o superior) y con Sentence Transformers v6.0.0 a través de `MultiVectorEncoder`. La licencia es Apache 2.0 y el único idioma declarado es el inglés. No se han publicado resultados de benchmarks más allá del subconjunto de BEIR incluido en la model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Atto (AttoModel), late interaction estilo ColBERT |
| Parametros totales | 9K (aproximadamente 9.000) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 399 tokens (max_seq_length) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Dimensiones de embedding | 16 |
| Vocabulario | 1K (1.000 tokens) |
| Librerias compatibles | sentence-transformers, transformers, PyLate, txtai (>= 9.0) |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura de interacción tardía ColBERT sobre un backbone transformer compacto denominado AttoModel. La arquitectura completa declarada en la model card es `ColBERT(Transformer({'max_seq_length': 399, 'do_lower_case': False, 'architecture': 'AttoModel'}))`. Cada token de consulta y de documento se proyecta a un vector de 16 dimensiones, y la puntuación de relevancia se calcula mediante MaxSim entre los embeddings de consulta y documento. El vocabulario es de 1.000 tokens y la longitud máxima de secuencia es de 399 tokens.

El fine-tune se realizó con PyLate sobre el modelo base NeuML/atto-9k-16d. Los hiperparámetros de entrenamiento publicados son: batch size por dispositivo de 32, una época, learning rate de 0.01, warmup del 5%, precisión fp16, evaluación por pasos y 20 workers de dataloader. No se especifica en la información disponible el volumen de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO (no aplicables en un modelo de retrieval de este tipo).

## Capacidades

- Extracción de features y generación de embeddings multi-vector para consultas y documentos (estilo ColBERT).
- Búsqueda semántica mediante similitud MaxSim de interacción tardía.
- Reranking de resultados en pipelines de recuperación de dos etapas.
- Construcción de bases de datos de embeddings con txtai para búsqueda semántica y RAG.
- Integración con Sentence Transformers v6.0.0 mediante `MultiVectorEncoder`.
- Soporte de `encode_query` y `encode_document` para codificación asimétrica.
- Capacidad monolingüe: únicamente inglés.
- No soporta generación de texto, tool calling, agentes ni razonamiento multi-paso.

## Casos de uso

- Búsqueda semántica de bajo coste: el modelo indexa y consulta documentos con embeddings de 16 dimensiones y 9K parámetros, lo que permite desplegarlo en entornos con memoria y cómputo muy restringidos, como dispositivos edge o funciones serverless.
- Primera etapa de un pipeline de recuperación: por su tamaño mínimo, puede actuar como filtro rápido que reduzca el conjunto de candidatos antes de aplicar un reranker más pesado como LateOn (110M parámetros), reservando el modelo grande para la fase final.
- Reranking en pipelines txtai: la model card indica que los modelos de interacción tardía destacan como rerankers; se puede combinar `Reranker` con `Similarity(lateencode=True)` para reordenar resultados de un retriever previo.
- RAG con presupuesto de latencia ajustado: al usar txtai 9.0+, el modelo puede servir como fuente de conocimiento para generación aumentada por recuperación en aplicaciones donde el coste por consulta debe ser mínimo.
- Prototipado y experimentación académica: sirve para estudiar el comportamiento de la interacción tardía con dimensiones y vocabulario muy reducidos, comparando su degradación frente a variantes mayores de la familia Atto.
- Clasificación y similitud de frases en inglés: el pipeline declarado es `sentence-similarity`, por lo que puede emplearse para tareas de emparejamiento de frases cortas dentro del límite de 399 tokens.

## Benchmarks y rendimiento

La model card incluye resultados de un subconjunto de BEIR evaluados con el script de benchmarks de txtai, con métrica `ndcg@10`:

| Modelo | Parametros | Dimensiones | Vocab | ArguAna | NFCorpus | SciFact | Media |
|---|---:|---:|---:|---:|---:|---:|---:|
| colbert-atto-840-8d | 840 | 8 | 250 | 0.2143 | 0.2585 | 0.4688 | 0.3139 |
| **colbert-atto-9k-16d** | **9K** | **16** | **1K** | **0.2459** | **0.2902** | **0.5604** | **0.3655** |
| colbert-atto-90k-32d | 90K | 32 | 4K | 0.3435 | 0.3263 | 0.6663 | 0.4454 |
| colbert-atto-950k-128d | 950K | 128 | 4K | 0.4149 | 0.3352 | 0.6946 | 0.4816 |
| colbert-atto-4m-384d | 4M | 384 | 30K | 0.4157 | 0.3349 | 0.6949 | 0.4818 |
| colbert-atto-14m-384d | 14M | 384 | 30K | 0.4248 | 0.3483 | 0.7057 | 0.4929 |
| colbert-atto-25m-384d | 25M | 384 | 30K | 0.4395 | 0.3461 | 0.7130 | 0.4995 |
| LateOn | 110M | 768 | 50K | 0.4979 | 0.3802 | 0.7609 | 0.5463 |

El modelo evaluado obtiene una media de 0.3655 en los tres datasets reportados, frente a 0.3139 de la variante inferior (840-8d) y 0.4454 de la variante superior (90k-32d).

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB; con 9K parámetros y embeddings de 16 dimensiones, el modelo cabe holgadamente en cualquier GPU consumer e incluso en CPU.
- GPU recomendadas: cualquier GPU con al menos unos pocos cientos de MB libres; no requiere A100, H100 ni RTX 4090. Una GPU integrada o una CPU moderna son suficientes.
- Cabe en cualquier GPU consumer (GTX 1050, RTX 3050, etc.) y en dispositivos de baja potencia.
- Opciones de despliegue: sentence-transformers (v6.0.0+) con `MultiVectorEncoder`, transformers, PyLate y txtai 9.0+.
- Latencia y throughput estimados: no disponibles en la información proporcionada; por el tamaño del modelo se espera una latencia muy baja, pero no se aportan cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Dimensiones | Vocab | Media BEIR (ndcg@10) | Licencia |
|---|---:|---:|---:|---:|---|
| colbert-atto-840-8d | 840 | 8 | 250 | 0.3139 | no disponible |
| **colbert-atto-9k-16d** | **9K** | **16** | **1K** | **0.3655** | **Apache 2.0** |
| colbert-atto-90k-32d | 90K | 32 | 4K | 0.4454 | no disponible |
| LateOn | 110M | 768 | 50K | 0.5463 | no disponible |

Frente a la variante inferior (840-8d), el modelo mejora la media en 0.0516 puntos a costa de un aumento de parámetros de 840 a 9K. Frente a la variante superior inmediata (90k-32d), queda 0.0799 puntos por debajo. LateOn, con 110M de parámetros, supera al modelo en 0.1808 puntos de media. La comparativa se limita a los modelos de la propia familia Atto y a LateOn incluidos en la model card; no se dispone de datos de otros retrievers comparables en la información proporcionada.

## Limitaciones y advertencias

- Modelo monolingüe: solo soporta inglés; no debe usarse con textos en castellano u otros idiomas.
- Contexto muy limitado: la longitud máxima de secuencia es de 399 tokens, insuficiente para documentos largos sin fragmentación previa.
- Vocabulario reducido de 1.000 tokens y embeddings de 16 dimensiones: la capacidad semántica es muy inferior a la de modelos como LateOn (768 dimensiones) o colbert-atto-25m-384d.
- Riesgo de degradación en dominios especializados: los resultados de BEIR reportados son modestos (media 0.3655) y no se han evaluado otros dominios.
- No es un modelo generativo: no puede producir texto, invocar herramientas ni ejecutar razonamiento multi-paso; cualquier expectativa en ese sentido es incorrecta.
- Requiere versiones específicas de software: txtai 9.0+ para soporte de late interaction y Sentence Transformers v6.0.0+ para `MultiVectorEncoder`.
- Licencia Apache 2.0: permite uso comercial, pero no se han documentado sesgos ni evaluaciones de robustez, por lo que se recomienda validación propia antes de producción.
- No se dispone de información sobre cuantizaciones ni sobre el dataset de entrenamiento, lo que limita la reproducibilidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/NeuML/colbert-atto-9k-16d
- Modelo base: https://huggingface.co/NeuML/atto-9k-16d
- Artículo "Introducing Atto": https://hf.co/blog/neuml/introducing-atto
- PyLate: https://github.com/lightonai/pylate
- txtai: https://github.com/neuml/txtai
- Script de benchmarks de txtai: https://github.com/neuml/txtai/blob/master/examples/benchmarks.py
- Sentence Transformers: https://www.sbert.net/
- Variante colbert-atto-840-8d: https://hf.co/neuml/colbert-atto-840-8d
- Variante colbert-atto-90k-32d: https://hf.co/neuml/colbert-atto-90k-32d
- Variante colbert-atto-950k-128d: https://hf.co/neuml/colbert-atto-950k-128d
- Variante colbert-atto-4m-384d: https://hf.co/neuml/colbert-atto-4m-384d
- Variante colbert-atto-14m-384d: https://hf.co/neuml/colbert-atto-14m-384d
- Variante colbert-atto-25m-384d: https://hf.co/neuml/colbert-atto-25m-384d
- LateOn: https://hf.co/neuml/lateon
