# NeuML/atto-17m-8192d-embeddings

## Resumen

atto-17m-8192d-embeddings es un modelo de embeddings de frases (sentence embeddings) desarrollado por NeuML, publicado en Hugging Face bajo licencia Apache 2.0. Forma parte de la familia Atto, un conjunto de modelos contextuales compactos disenados para aprendizaje de representaciones linguisticas con eficiencia de parametros. Este modelo concreto parte del checkpoint base NeuML/atto-17m-8192d y se ha ajustado con la libreria sentence-transformers para tareas de similitud semantica y extraccion de caracteristicas.

El modelo resuelve el problema de generar embeddings densos de alta dimensionalidad (8192 dimensiones) con un presupuesto de parametros muy reducido (17 millones), lo que lo hace atractivo para despliegues con restricciones de memoria o latencia. Su vocabulario de 30K tokens y su arquitectura AttoModel lo situan en la categoria de modelos "nano" para recuperacion de informacion, busqueda semantica y generacion aumentada por recuperacion (RAG).

Es relevante ahora porque demuestra que es posible superar a alternativas mas grandes como all-MiniLM-L6-v2 (23M parametros) en benchmarks BEIR con menos parametros y mayor dimensionalidad de embedding, lo que abre la puerta a pipelines de recuperacion mas ligeros sin sacrificar calidad. El modelo esta pensado principalmente para ingles y se integra de forma nativa con txtai y sentence-transformers.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | AttoModel (transformer contextual compacto) con capa de pooling max |
| Parametros totales | 17M |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |
| Dimension de embedding | 8192 |
| Vocabulario | 30K |
| Pooling | max, con include_prompt=True |
| Libreria | sentence-transformers |
| Tamano del repo | 0.1 GB |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura AttoModel, un transformer contextual compacto disenado especificamente para eficiencia de parametros. La arquitectura completa segun la model card es un SentenceTransformer compuesto por un modulo Transformer (tarea feature-extraction, salida last_hidden_state) seguido de una capa de Pooling con dimension de embedding 8192, modo max y include_prompt=True. El modelo base es NeuML/atto-17m-8192d, sobre el que se ha realizado un fine-tuning con sentence-transformers.

Los parametros de entrenamiento reportados incluyen batch size de 64 por dispositivo, 25 epochs, learning rate de 0.01, warmup de 1000 pasos, weight decay de 0.01, gradient accumulation de 2 pasos y fp16 activado. Se utilizan prompts diferenciados para query y document (`query: ` y `document: `), lo que indica un entrenamiento orientado a recuperacion asimetrica. No se especifica en la informacion disponible el numero total de tokens de entrenamiento ni la composicion exacta del dataset, aunque por la evaluacion en BEIR se deduce un entrenamiento orientado a recuperacion de informacion. No se menciona uso de RLHF ni DPO.

## Capacidades

- Generacion de embeddings de frases de 8192 dimensiones para similitud semantica.
- Extraccion de caracteristicas (feature-extraction) a nivel de token y de frase.
- Busqueda semantica y recuperacion de informacion mediante similitud coseno.
- Soporte como fuente de conocimiento para RAG (retrieval augmented generation) via txtai.
- Integracion nativa con sentence-transformers y txtai.
- Soporte de prompts asimetricos para query y document.
- Capacidad multilingue: no disponible (solo ingles declarado).
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Vision, audio o thinking mode: no disponible.

## Casos de uso

- Busqueda semantica en documentacion tecnica: el modelo genera embeddings de 8192 dimensiones que permiten indexar y recuperar fragmentos por similitud semantica con buena calidad relativa a su tamano, adecuado para corpus en ingles de dominio medio.
- Generacion aumentada por recuperacion (RAG): se puede usar como recuperador en pipelines RAG con txtai, indexando documentos y recuperando los mas relevantes para alimentar a un LLM generador, gracias a su integracion directa con `txtai.Embeddings`.
- Deduplicacion y clustering de textos: los embeddings de alta dimensionalidad permiten agrupar documentos o detectar near-duplicates en corpus en ingles con un coste computacional bajo (17M parametros).
- Clasificacion de textos por similitud: comparar embeddings de consultas contra prototipos de categoria para clasificacion zero-shot o few-shot en ingles.
- Sistemas de recomendacion de contenido: calcular similitud entre descripciones de articulos, papers o productos para sugerir items relacionados.
- Moderacion y filtrado de contenido: comparar embeddings de mensajes contra embeddings de referencia de contenido permitido o prohibido para detectar similitudes.
- Despliegue en entornos con recursos limitados: al tener solo 17M parametros y un repo de 0.1 GB, cabe en CPU y en GPUs de gama baja, lo que permite servir embeddings en dispositivos edge o contenedores pequenos.
- Evaluacion comparativa de recuperacion: util como baseline ligero en experimentos de BEIR o en la seleccion de modelos de embeddings para un dominio concreto.

## Benchmarks y rendimiento

Resultados de ndcg@10 en un subconjunto de BEIR, segun la model card del autor:

| Modelo | Parametros | Dimensiones | Vocab | ArguAna | NFCorpus | SciFact | Media |
|---|---:|---:|---:|---:|---:|---:|---:|
| atto-17m-8192d | 17M | 8192 | 30K | 0.4963 | 0.3455 | 0.6909 | 0.5109 |
| atto-28m-8192d | 28M | 8192 | 30K | 0.5111 | 0.3461 | 0.6843 | 0.5138 |
| atto-25m-384d | 25M | 384 | 30K | 0.4879 | 0.3426 | 0.6600 | 0.4968 |
| atto-14m-384d | 14M | 384 | 30K | 0.4874 | 0.3329 | 0.6472 | 0.4892 |
| all-MiniLM-L6-v2 | 23M | 384 | 30K | 0.4789 | 0.3089 | 0.6527 | 0.4802 |
| atto-2m-8192d | 2M | 8192 | 4K | 0.4343 | 0.3125 | 0.6653 | 0.4707 |
| atto-1m-4096d | 1M | 4096 | 4K | 0.4223 | 0.3044 | 0.6417 | 0.4561 |
| atto-1m-2048d | 1M | 2048 | 4K | 0.4189 | 0.2941 | 0.6229 | 0.4453 |
| atto-90k-2048d | 90K | 2048 | 1K | 0.4021 | 0.2676 | 0.6074 | 0.4257 |
| atto-50k-768d | 50K | 768 | 1K | 0.3264 | 0.2430 | 0.5334 | 0.3676 |
| atto-36k-384d | 36K | 384 | 1K | 0.3249 | 0.2286 | 0.4920 | 0.3485 |
| bert-hash-nano | 953K | 128 | 30K | 0.3828 | 0.2562 | 0.5032 | 0.3807 |
| bert-hash-pico | 442K | 128 | 30K | 0.2853 | 0.2075 | 0.3912 | 0.2947 |
| bert-hash-femto | 243K | 128 | 30K | 0.1964 | 0.1402 | 0.2830 | 0.2065 |
| DenseOn | 110M | 768 | 50K | 0.5408 | 0.3915 | 0.7591 | 0.5638 |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita. Con 17M parametros en fp16 el modelo ocupa aproximadamente 34 MB de pesos, mas overhead de activaciones y pooling; el repo completo es de 0.1 GB.
- Cabe holgadamente en cualquier GPU consumer (RTX 3060, RTX 4090, etc.) y en CPU.
- GPU recomendadas: no requiere GPU dedicada; funciona en CPU. Para alto throughput, cualquier GPU moderna sirve.
- Opciones de despliegue: sentence-transformers, txtai, transformers con `trust_remote_code=True`. No se menciona soporte nativo de vLLM, llama.cpp, Ollama o TGI en la informacion disponible.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Dimensiones | Contexto | Media BEIR (ndcg@10) | Licencia | Disponibilidad |
|---|---:|---:|---|---:|---|---|
| atto-17m-8192d | 17M | 8192 | no disponible | 0.5109 | apache-2.0 | Hugging Face |
| all-MiniLM-L6-v2 | 23M | 384 | no disponible | 0.4802 | apache-2.0 | Hugging Face |
| atto-28m-8192d | 28M | 8192 | no disponible | 0.5138 | apache-2.0 | Hugging Face |
| DenseOn | 110M | 768 | no disponible | 0.5638 | no disponible | Hugging Face |

El modelo supera a all-MiniLM-L6-v2 en la media de BEIR (0.5109 frente a 0.4802) con menos parametros, aunque con una dimensionalidad de embedding mucho mayor (8192 frente a 384), lo que incrementa el coste de almacenamiento del indice vectorial. Queda ligeramente por debajo de atto-28m-8192d (0.5138) y por debajo de DenseOn (0.5638), que tiene 110M parametros.

## Limitaciones y advertencias

- Solo soporta ingles segun la model card; el rendimiento en otros idiomas no esta garantizado ni documentado.
- La dimensionalidad de 8192 implica indices vectoriales mucho mas grandes que alternativas de 384 dimensiones, lo que aumenta el coste de almacenamiento y de calculo de similitud a escala.
- El modelo tiene 17M parametros y esta pensado para recuperacion ligera; en tareas de razonamiento semantico complejo puede quedar por debajo de modelos de mayor tamano como DenseOn.
- No se han documentado sesgos especificos ni evaluaciones de robustez o seguridad en la informacion disponible.
- Riesgo de alucinacion: no aplica directamente al ser un modelo de embeddings, pero los resultados de recuperacion pueden ser irrelevantes si el dominio difiere del corpus de entrenamiento.
- La licencia Apache 2.0 permite uso comercial, pero se recomienda verificar los terminos del modelo base NeuML/atto-17m-8192d.
- Requiere `trust_remote_code=True` para cargarse, lo que implica ejecutar codigo personalizado del autor.
- La longitud maxima de contexto no esta documentada, lo que dificulta planificar el troceado de documentos largos.
- El modelo tiene 0 descargas y 1 like en el momento de la consulta, por lo que su validacion por la comunidad es practicamente inexistente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/NeuML/atto-17m-8192d-embeddings
- Modelo base: https://huggingface.co/NeuML/atto-17m-8192d
- Blog "Introducing Atto": https://hf.co/blog/neuml/introducing-atto
- Repositorio txtai: https://github.com/neuml/txtai
- Script de benchmarks txtai: https://github.com/neuml/txtai/blob/master/examples/benchmarks.py
- sentence-transformers: https://www.SBERT.net
- Modelo comparable all-MiniLM-L6-v2: https://huggingface.co/sentence-transformers/all-MiniLM-L6-v2
- Modelo comparable DenseOn: https://huggingface.co/lightonai/denseon
