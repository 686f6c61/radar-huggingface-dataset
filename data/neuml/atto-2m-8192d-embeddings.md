# NeuML/atto-2m-8192d-embeddings

## Resumen

Atto-2m-8192d-embeddings es un modelo de embeddings de frases (sentence-transformers) desarrollado por NeuML, pensado para representación contextual del lenguaje con un coste paramétrico extremadamente bajo. Forma parte de la familia Atto, una línea de modelos compactos disenados para aprendizaje de representaciones eficiente en parámetros. Este checkpoint concreto es un fine-tuning del modelo base NeuML/atto-2m-8192d, con aproximadamente 2 millones de parámetros y una dimensionalidad de embedding de 8192, lo que lo sitúa en el extremo de "muchas dimensiones, muy pocos parámetros".

El modelo resuelve el problema de generar embeddings de alta dimensionalidad para búsqueda semántica y recuperación de información (RAG) con un coste computacional y de almacenamiento mínimo en lo que a pesos se refiere, aunque con un vector de salida grande. Está pensado para indexar y recuperar documentos en inglés mediante similitud coseno, e integra soporte nativo para txtai y sentence-transformers.

Su relevancia actual radica en la tendencia hacia modelos de embeddings ultraligeros que puedan ejecutarse en CPU o en hardware muy limitado, manteniendo una calidad razonable en benchmarks de recuperación como BEIR. Con licencia Apache 2.0 y pesos en safetensors, es directamente desplegable en producción sin restricciones comerciales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (AttoModel) con pooling max; pipeline sentence-transformers |
| Parametros totales | ~2M (2 millones) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors; al ser 2M de parámetros, la cuantizacion es poco relevante) |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |
| Dimension de embedding | 8192 |
| Vocabulario | 4K |
| Pooling | max (include_prompt: True) |
| Prefijos de prompt | query: / document: |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura transformer propia denominada AttoModel, configurada para feature-extraction y con salida sobre `last_hidden_state`, seguida de una capa de pooling de tipo max que produce un vector de 8192 dimensiones. El tokenizer emplea un vocabulario de 4K entradas, muy reducido en comparación con los 30K habituales en BERT, lo que contribuye al bajo recuento de parámetros. El modelo base es NeuML/atto-2m-8192d y este checkpoint es un fine-tuning con sentence-transformers.

El entrenamiento se realizó con `per_device_train_batch_size` de 128, 25 épocas, learning rate de 0.003, 1000 pasos de warmup, weight decay de 0.01 y precisión fp16. Se usaron prompts diferenciados para consulta (`query: `) y documento (`document: `), lo que implica que el modelo espera ese prefijado en el momento de la inferencia para obtener el mejor rendimiento. No se detalla en la información disponible la composición exacta del dataset de entrenamiento ni si se aplicaron técnicas de RLHF o DPO (no aplicables habitualmente a modelos de embeddings).

## Capacidades

- Generación de embeddings de frases y documentos de 8192 dimensiones para similitud semántica.
- Búsqueda semántica y recuperación de información (retrieval) sobre corpus en inglés.
- Soporte como fuente de conocimiento para pipelines de RAG (retrieval-augmented generation) vía txtai.
- Integración nativa con sentence-transformers (`SentenceTransformer`) y con txtai (`txtai.Embeddings`).
- Prefijado de prompts query/document para distinguir consultas de documentos indexados.
- Modelo exclusivamente de representación: no genera texto ni soporta tool calling, agentes ni razonamiento multi-paso.
- Capacidad multilingüe limitada al inglés (`language: en`).

## Casos de uso

- Búsqueda semántica en corpus pequeños o medianos en inglés: indexar documentos con txtai y ejecutar consultas por similitud coseno, aprovechando el bajo coste de almacenamiento de los pesos (2M de parámetros) aunque con vectores de 8192 dimensiones por documento.
- RAG en entornos con recursos limitados: usar el modelo como recuperador en pipelines de generación aumentada, ejecutándose en CPU sin GPU dedicada gracias a su reducido tamaño.
- Clasificación y clustering de textos por similitud: agrupar documentos o detectar duplicados semánticos en inglés mediante los embeddings de 8192 dimensiones.
- Prototipado rápido de sistemas de recomendación de contenido textual: calcular similitud entre artículos, noticias o descripciones de productos en inglés.
- Deduplicación y near-duplicate detection en bases documentales: comparar embeddings de alta dimensionalidad para identificar documentos casi idénticos.
- Búsqueda dentro de aplicaciones edge o embebidas: al tener solo 2M de parámetros, puede empaquetarse en aplicaciones de escritorio o móviles con requisitos de memoria mínimos.
- Evaluación comparativa de estrategias de embeddings: servir como baseline ultraligero frente a modelos como all-MiniLM-L6-v2 en experimentos de recuperación.

## Benchmarks y rendimiento

Resultados de `ndcg@10` sobre un subconjunto de BEIR, según la model card del autor:

| Modelo | Params | Dim | Vocab | ArguAna | NFCorpus | SciFact | Media |
|---|---:|---:|---:|---:|---:|---:|---:|
| atto-36k-384d | 36K | 384 | 1K | 0.3249 | 0.2286 | 0.4920 | 0.3485 |
| atto-90k-2048d | 90K | 2048 | 1K | 0.4021 | 0.2676 | 0.6074 | 0.4257 |
| atto-1m-4096d | 1M | 4096 | 4K | 0.4223 | 0.3044 | 0.6417 | 0.4561 |
| **atto-2m-8192d** | **2M** | **8192** | **4K** | **0.4343** | **0.3125** | **0.6653** | **0.4707** |
| atto-14m-384d | 14M | 384 | 30K | 0.4874 | 0.3329 | 0.6472 | 0.4892 |
| atto-17m-8192d | 17M | 8192 | 30K | 0.4963 | 0.3455 | 0.6909 | 0.5109 |
| all-MiniLM-L6-v2 | 23M | 384 | 30K | 0.4789 | 0.3089 | 0.6527 | 0.4802 |
| atto-28m-8192d | 28M | 8192 | 30K | 0.5111 | 0.3461 | 0.6843 | 0.5138 |
| DenseOn | 110M | 768 | 50K | 0.5408 | 0.3915 | 0.7591 | 0.5638 |

El modelo supera a all-MiniLM-L6-v2 en ArguAna (0.4343 vs 0.4789 no, en realidad queda por debajo en ArguAna; supera en NFCorpus 0.3125 vs 0.3089 y en SciFact 0.6653 vs 0.6527) y queda por debajo en la media global (0.4707 vs 0.4802). Frente a modelos de mayor tamaño como DenseOn (110M), la diferencia en media es de aproximadamente 9 puntos de nDCG.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 100 MB en fp32 para los pesos (2M de parámetros); prácticamente despreciable. El cuello de botella es el vector de salida de 8192 dimensiones por documento.
- GPU recomendadas: cualquier GPU moderna, incluidas GTX 1060, RTX 3060, RTX 4090, A100 o H100; el modelo está sobredimensionado para cualquier GPU actual.
- Cabe en cualquier GPU consumer e incluso se ejecuta en CPU sin problemas.
- Opciones de despliegue: sentence-transformers (con `trust_remote_code=True`), txtai, y potencialmente transformers con código custom. No se documenta soporte para vLLM, llama.cpp u Ollama (no aplicables a un modelo de embeddings de este tipo).
- Latencia y throughput: no disponibles en la información proporcionada; al ser un modelo de 2M de parámetros, se espera una latencia muy baja, pero el coste de almacenar y comparar vectores de 8192 dimensiones puede dominar el tiempo total en bases de datos grandes.

## Comparativa con modelos similares

| Modelo | Params | Dim | Contexto | Media BEIR (subconjunto) | Licencia | Disponibilidad |
|---|---:|---:|---|---:|---|---|
| **atto-2m-8192d** | 2M | 8192 | no disponible | 0.4707 | apache-2.0 | Hugging Face |
| all-MiniLM-L6-v2 | 23M | 384 | 512 tokens (típico) | 0.4802 | apache-2.0 | Hugging Face |
| atto-28m-8192d | 28M | 8192 | no disponible | 0.5138 | apache-2.0 | Hugging Face |
| DenseOn | 110M | 768 | no disponible | 0.5638 | no disponible | Hugging Face |

El modelo ofrece un rendimiento cercano a all-MiniLM-L6-v2 con una décima parte de parámetros, a costa de vectores 21 veces más grandes (8192 vs 384 dimensiones). Frente a atto-28m-8192d, la diferencia de calidad es de unos 4 puntos de media, con 14 veces menos parámetros.

## Limitaciones y advertencias

- Solo soporta inglés (`language: en`); el rendimiento en otros idiomas no está garantizado.
- No se documenta la longitud máxima de contexto; los modelos de la familia Atto suelen tener ventanas cortas, pero este dato no está confirmado.
- El vector de embedding de 8192 dimensiones implica un coste de almacenamiento elevado por documento en comparación con modelos de 384 o 768 dimensiones, lo que puede afectar a la escalabilidad de índices grandes.
- Requiere prefijar las entradas con `query: ` y `document: ` para obtener el rendimiento reportado; omitir los prefijos puede degradar la calidad de recuperación.
- Es un modelo de embeddings, no generativo: no produce texto, no soporta tool calling ni razonamiento multi-paso.
- Riesgo de alucinación no aplicable directamente (no genera texto), pero sí puede producir recuperaciones irrelevantes en dominios fuera de su distribución de entrenamiento.
- No se detalla la composición del dataset de entrenamiento, por lo que no se pueden evaluar sesgos específicos.
- Licencia Apache 2.0 permite uso comercial sin restricciones adicionales conocidas.
- No se han publicado datos de latencia ni throughput en la información disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/NeuML/atto-2m-8192d-embeddings
- Modelo base: https://huggingface.co/NeuML/atto-2m-8192d
- Artículo "Introducing Atto": https://hf.co/blog/neuml/introducing-atto
- Repositorio txtai: https://github.com/neuml/txtai
- Script de benchmarks de txtai: https://github.com/neuml/txtai/blob/master/examples/benchmarks.py
- sentence-transformers: https://www.SBERT.net
- Modelo comparable all-MiniLM-L6-v2: https://huggingface.co/sentence-transformers/all-MiniLM-L6-v2
- Modelo comparable DenseOn: https://huggingface.co/lightonai/denseon
