# NeuML/colbert-atto-4m-384d

## Resumen

ColBERT Atto 4M 384D es un modelo de recuperación de información basado en interacción tardía (late interaction), desarrollado por NeuML dentro de la familia Atto de modelos contextuales compactos. Convierte documentos y consultas en representaciones multi-vector siguiendo el esquema ColBERT, lo que permite puntuar la relevancia mediante MaxSim en lugar de una simple similitud coseno sobre un único vector. El modelo parte del checkpoint base NeuML/atto-4m-384d y se afina con PyLate para tareas de búsqueda semántica y reranking.

La relevancia principal reside en su extrema eficiencia paramétrica: aproximadamente 4 millones de parámetros, 384 dimensiones de embedding y un vocabulario de 30K tokens. Frente a alternativas de 110M parámetros como LateOn, ofrece una huella de memoria y cómputo drásticamente menor, lo que lo hace apto para despliegues en CPU, entornos edge y pipelines con requisitos de latencia muy ajustados.

Está pensado para integración con txtai (a partir de la versión 9.0) y con Sentence Transformers (a partir de v6.0.0 mediante `MultiVectorEncoder`), y su licencia Apache 2.0 facilita el uso comercial. El modelo solo declara soporte para inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer AttoModel + capa densa (esquema ColBERT de interacción tardía) |
| Parametros totales | ~4M |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 299 tokens (max_seq_length) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Dimensiones de embedding | 384 (proyectadas a 128 en la cabeza densa) |
| Vocabulario | 30K tokens |
| Librería | sentence-transformers, PyLate, txtai |
| Modelo base | NeuML/atto-4m-384d |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura ColBERT: un codificador Transformer (`AttoModel`) con longitud máxima de secuencia de 299 tokens genera embeddings contextuales de 384 dimensiones por token, que una capa densa sin sesgo proyecta a 128 dimensiones. La puntuación de relevancia se calcula mediante MaxSim sobre las representaciones multi-vector de consulta y documento, lo que captura coincidencias a nivel de término sin necesidad de un cross-encoder completo.

El afinamiento se realizó con PyLate, la librería de LightOn para modelos de interacción tardía. Los hiperparámetros publicados indican un batch size por dispositivo de 32, una única época de entrenamiento, learning rate de 0.0003, warmup del 5% de los pasos, precisión fp16, evaluación por pasos y 20 workers de dataloader. No se detalla en la información disponible el volumen ni la composición exacta del dataset de entrenamiento, ni si se aplicaron etapas de RLHF o DPO (poco habituales en modelos de retrieval).

## Capacidades

- Generación de embeddings multi-vector para búsqueda semántica y similitud de frases.
- Recuperación densa con scoring de interacción tardía (MaxSim) mediante `MultiVectorEncoder` de Sentence Transformers.
- Reranking de resultados en pipelines de recuperación, función en la que los modelos de interacción tardía destacan según la documentación del autor.
- Indexación de bases de embeddings con txtai 9.0+ para búsqueda semántica y como fuente de conocimiento en RAG.
- Extracción de features (`feature-extraction`) y tareas de `sentence-similarity`.
- Soporte multilingüe: no disponible; solo inglés.
- Tool calling, agentes, visión, audio o modo thinking: no disponible (no es un modelo generativo).

## Casos de uso

- Búsqueda semántica en corpus pequeños o medianos: indexar documentos con txtai 9.0+ y consultar por similitud; el tamaño de 4M parámetros permite mantener el índice y el modelo en memoria en máquinas modestas.
- Reranking en pipelines RAG: usar el modelo como segunda etapa sobre los candidatos de un retriever inicial, aprovechando el scoring MaxSim para reordenar por relevancia real.
- Despliegue en edge o entornos sin GPU: al ser un modelo de ~4M parámetros y 384 dimensiones, puede ejecutarse en CPU con latencias bajas, adecuado para dispositivos con recursos limitados.
- Filtrado y deduplicación de documentos: comparar representaciones multi-vector para detectar duplicados o near-duplicates en bases documentales en inglés.
- Búsqueda interna en documentación técnica: indexar manuales, FAQs o tickets en inglés y servir consultas con un motor ligero integrado en aplicaciones web.
- Prototipado rápido de sistemas de retrieval: al cargar directamente en Sentence Transformers v6.0.0, permite iterar sobre pipelines de búsqueda sin infraestructura pesada.
- Clasificación por similitud de frases: usar los embeddings para agrupar o etiquetar textos cortos en inglés en tareas de moderación o enrutamiento.

## Benchmarks y rendimiento

Resultados de un subconjunto de BEIR (ndcg@10) publicados en la model card, comparados con otros modelos de la familia Atto y LateOn:

| Modelo | Parámetros | Dimensiones | Vocab | ArguAna | NFCorpus | SciFact | Media |
|---|---:|---:|---:|---:|---:|---:|---:|
| colbert-atto-840-8d | 840 | 8 | 250 | 0.2143 | 0.2585 | 0.4688 | 0.3139 |
| colbert-atto-9k-16d | 9K | 16 | 1K | 0.2459 | 0.2902 | 0.5604 | 0.3655 |
| colbert-atto-90k-32d | 90K | 32 | 4K | 0.3435 | 0.3263 | 0.6663 | 0.4454 |
| colbert-atto-950k-128d | 950K | 128 | 4K | 0.4149 | 0.3352 | 0.6946 | 0.4816 |
| **colbert-atto-4m-384d** | **4M** | **384** | **30K** | **0.4157** | **0.3349** | **0.6949** | **0.4818** |
| colbert-atto-14m-384d | 14M | 384 | 30K | 0.4248 | 0.3483 | 0.7057 | 0.4929 |
| colbert-atto-25m-384d | 25M | 384 | 30K | 0.4395 | 0.3461 | 0.7130 | 0.4995 |
| LateOn | 110M | 768 | 50K | 0.4979 | 0.3802 | 0.7609 | 0.5463 |

El salto de rendimiento entre 950K y 4M parámetros es marginal (media 0.4816 frente a 0.4818), mientras que escalar a 14M o 25M aporta mejoras moderadas. LateOn, con 110M parámetros, sigue siendo claramente superior en calidad de recuperación.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; con ~4M parámetros en fp16 el peso del modelo ronda decenas de MB, por lo que la huella es mínima.
- GPU recomendadas: innecesarias para inferencia; cualquier GPU consumer (GTX 1650, RTX 3060, RTX 4090) sobra para el modelo. El cuello de botella será el índice de embeddings, no el modelo.
- Cabe en GPU consumer: sí, holgadamente, y también en CPU.
- Opciones de despliegue: txtai 9.0+, Sentence Transformers v6.0.0+ con `MultiVectorEncoder`, PyLate. No se mencionan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplicables a un modelo de retrieval no generativo).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Dimensiones | Contexto | Media BEIR (3 datasets) | Licencia | Disponibilidad |
|---|---:|---:|---:|---:|---|---|
| colbert-atto-4m-384d | 4M | 384 | 299 | 0.4818 | Apache 2.0 | Hugging Face |
| colbert-atto-25m-384d | 25M | 384 | no disponible | 0.4995 | no disponible | Hugging Face |
| LateOn | 110M | 768 | no disponible | 0.5463 | no disponible | Hugging Face |

La familia Atto ofrece un compromiso claro entre tamaño y calidad: el modelo de 4M iguala prácticamente al de 950K y queda por debajo de variantes de 14M y 25M. LateOn, con 27 veces más parámetros, obtiene aproximadamente 6.5 puntos más de media en los tres datasets evaluados.

## Limitaciones y advertencias

- Solo soporta inglés; no se declara cobertura multilingüe.
- Longitud de contexto limitada a 299 tokens, insuficiente para documentos largos sin chunking previo.
- No es un modelo generativo: no produce texto, no hace tool calling ni razonamiento multi-paso.
- Riesgo de sesgos heredados del corpus de entrenamiento (no documentado en la información disponible).
- Rendimiento en BEIR claramente inferior a modelos de mayor tamaño como LateOn (0.4818 frente a 0.5463 de media en el subconjunto evaluado); no apto para escenarios donde la calidad de recuperación sea crítica.
- La evaluación publicada cubre solo tres datasets de BEIR, por lo que la generalización a otros dominios no está validada.
- Licencia Apache 2.0 permite uso comercial, pero conviene revisar las condiciones de los modelos base y datasets empleados en el afinamiento.
- El repositorio figura con 0 descargas y 1 like en el momento de la consulta, lo que sugiere escasa validación por parte de la comunidad.
- No se documentan tipos de cuantización ni latencias medidas; para producción conviene realizar una evaluación propia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/NeuML/colbert-atto-4m-384d
- Modelo base: https://huggingface.co/NeuML/atto-4m-384d
- Artículo "Introducing Atto": https://hf.co/blog/neuml/introducing-atto
- PyLate (LightOn): https://github.com/lightonai/pylate
- txtai: https://github.com/neuml/txtai
- Script de benchmarks de txtai: https://github.com/neuml/txtai/blob/master/examples/benchmarks.py
- Sentence Transformers: https://www.sbert.net/
- Modelos comparables: https://hf.co/neuml/colbert-atto-840-8d, https://hf.co/neuml/colbert-atto-9k-16d, https://hf.co/neuml/colbert-atto-90k-32d, https://hf.co/neuml/colbert-atto-950k-128d, https://hf.co/neuml/colbert-atto-14m-384d, https://hf.co/neuml/colbert-atto-25m-384d, https://hf.co/neuml/lateon
