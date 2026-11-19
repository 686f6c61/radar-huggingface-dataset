# NeuML/atto-90k-2048d-embeddings

## Resumen

Atto-90k-2048d-embeddings es un modelo de embeddings de frases desarrollado por NeuML, perteneciente a la familia Atto de "modelos contextuales compactos disenados para aprendizaje de representaciones linguisticas con eficiencia de parametros". Concretamente, es un fine-tune con sentence-transformers del modelo base NeuML/atto-90k-2048d, orientado a tareas de similitud semantica y extraccion de caracteristicas.

El modelo resuelve el problema de generar embeddings densos de alta calidad con un coste computacional minimo: apenas 90.000 parametros y una dimension de salida de 2048, lo que lo situa en la gama "ultra-compacta" dentro del ecosistema de embeddings. Es relevante para escenarios donde el despliegue en CPU, dispositivos con recursos limitados o pipelines de altisimo throughput son prioritarios frente a la precision absoluta.

Su interes practico radica en la relacion calidad/tamano: segun los datos de evaluacion del autor, con 90K parametros alcanza un promedio de ndcg@10 de 0.4257 en el subconjunto BEIR evaluado, superando a alternativas de mayor tamano como bert-hash-nano (953K) o bert-hash-pico (442K). Esta pensado para construir bases de embeddings con txtai, busqueda semantica y recuperacion aumentada por generacion (RAG).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | AttoModel (transformer contextual compacto) + Pooling (max) |
| Parametros totales | 90K |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors, fp16 en entrenamiento) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |
| Dimension de embedding | 2048 |
| Vocabulario | 1K |
| Pooling | max (include_prompt: true) |
| Prefijos de prompt | `query: ` / `document: ` |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura propietaria AttoModel, un transformer contextual compacto que expone `last_hidden_state` y `token_embeddings` como salidas. Sobre el se aplica una capa de pooling de tipo max que proyecta a una dimension de embedding de 2048, con un vocabulario reducido de 1.000 tokens. No se trata de un modelo generativo ni de un LLM: es un encoder de representaciones para similitud semantica y extraccion de caracteristicas.

El fine-tune se realizo con sentence-transformers partiendo de NeuML/atto-90k-2048d. Los hiperparametros de entrenamiento reportados son: batch size de 128 por dispositivo, 25 epocas, learning rate de 0.003, 1000 pasos de warmup, weight decay de 0.01 y entrenamiento en fp16. Se emplearon prompts diferenciados para consulta (`query: `) y documento (`document: `). No se especifica en la informacion disponible el volumen de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO (no procede en un modelo de embeddings). La metodologia completa se remite al articulo "Introducing Atto" del blog de NeuML.

## Capacidades

- Generacion de embeddings densos de frases y documentos con dimension de salida de 2048.
- Similitud semantica entre pares de textos (pipeline `sentence-similarity`).
- Extraccion de caracteristicas (`feature-extraction`) a nivel de token y de secuencia.
- Indexacion y busqueda semantica mediante txtai, con soporte de `trust_remote_code`.
- Uso como fuente de conocimiento para RAG (retrieval augmented generation).
- Soporte de prefijos de prompt diferenciados para consultas y documentos, lo que mejora la asimetria en recuperacion.
- Capacidad multilingue limitada al ingles (unico idioma declarado).
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso: no es un modelo generativo.

## Casos de uso

- Busqueda semantica de baja latencia en produccion: con 90K parametros y embeddings de 2048 dimensiones, el modelo puede indexar y consultar grandes corpus en CPU con un coste marginal, adecuado para motores de busqueda interna o catalogos documentales.
- Recuperacion aumentada por generacion (RAG) en entornos con recursos limitados: sirve como recuperador en pipelines RAG donde el generador es un LLM remoto y el cuello de botella es el retrieval; su tamano permite ejecutarlo junto al resto del stack sin GPU dedicada.
- Deduplicacion y clustering de documentos: la similitud coseno sobre embeddings de 2048 dimensiones permite agrupar articulos, tickets o registros duplicados en pipelines ETL de forma economica.
- Clasificacion zero-shot por prototipos: comparando el embedding de un texto con embeddings de etiquetas o ejemplos representativos, util para enrutado de tickets o etiquetado de contenido sin entrenamiento adicional.
- Despliegue en dispositivos edge o entornos serverless: al no requerir GPU y ocupar un espacio de pesos minimo, encaja en funciones lambda, contenedores ligeros o sistemas embebidos con restricciones de memoria.
- Filtrado y pre-ranking en pipelines de busqueda hibrida: puede actuar como primera etapa de recuperacion de bajo coste antes de un re-ranker mas pesado, reduciendo el numero de candidatos a puntuar.
- Prototipado rapido de sistemas de recomendacion basados en contenido: la representacion de 2048 dimensiones permite calcular similitud entre items y perfiles de usuario sin infraestructura de inferencia compleja.

## Benchmarks y rendimiento

Resultados de ndcg@10 en el subconjunto BEIR reportados por el autor (via script de benchmarks de txtai):

| Modelo | Parametros | Dimensiones | Vocab | ArguAna | NFCorpus | SciFact | Promedio |
|---|---:|---:|---:|---:|---:|---:|---:|
| **atto-90k-2048d** | **90K** | **2048** | **1K** | **0.4021** | **0.2676** | **0.6074** | **0.4257** |
| atto-36k-384d | 36K | 384 | 1K | 0.3249 | 0.2286 | 0.4920 | 0.3485 |
| atto-50k-768d | 50K | 768 | 1K | 0.3264 | 0.2430 | 0.5334 | 0.3676 |
| atto-1m-2048d | 1M | 2048 | 4K | 0.4189 | 0.2941 | 0.6229 | 0.4453 |
| atto-1m-4096d | 1M | 4096 | 4K | 0.4223 | 0.3044 | 0.6417 | 0.4561 |
| atto-2m-8192d | 2M | 8192 | 4K | 0.4343 | 0.3125 | 0.6653 | 0.4707 |
| atto-14m-384d | 14M | 384 | 30K | 0.4874 | 0.3329 | 0.6472 | 0.4892 |
| atto-17m-8192d | 17M | 8192 | 30K | 0.4963 | 0.3455 | 0.6909 | 0.5109 |
| all-MiniLM-L6-v2 | 23M | 384 | 30K | 0.4789 | 0.3089 | 0.6527 | 0.4802 |
| atto-25m-384d | 25M | 384 | 30K | 0.4879 | 0.3426 | 0.6600 | 0.4968 |
| atto-28m-8192d | 28M | 8192 | 30K | 0.5111 | 0.3461 | 0.6843 | 0.5138 |
| DenseOn | 110M | 768 | 50K | 0.5408 | 0.3915 | 0.7591 | 0.5638 |

Lectura: atto-90k-2048d supera a todos los modelos "bert-hash" (nano, pico, femto) y a los atto de menor dimension con el mismo rango de parametros, pero queda por debajo de los atto de 14M-28M parametros y de all-MiniLM-L6-v2 (23M). La evaluacion se limita a tres datasets de BEIR, por lo que no debe extrapolarse a un rendimiento BEIR completo.

## Requisitos de hardware

- VRAM estimada para inferencia: practicamente nula; con 90K parametros los pesos ocupan del orden de centenares de KB en fp32, por lo que cabe en cualquier GPU consumer e incluso en CPU.
- GPU recomendadas: no requiere GPU. Cualquier GPU (incluso integrada) es suficiente; el modelo esta optimizado para ejecucion en CPU.
- Cabe en consumer GPU: si, en cualquier GPU consumer y en la mayoria de CPUs y dispositivos embebidos.
- Opciones de despliegue: sentence-transformers, txtai (con `trust_remote_code=True`), transformers con `trust_remote_code=True`. No se documenta soporte nativo para vLLM, llama.cpp, Ollama ni TGI (no es un modelo generativo).
- Latencia y throughput: no disponibles en la informacion proporcionada. Por el tamano del modelo, se espera throughput muy alto y latencia de milisegundos en CPU, aunque no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Dimensiones | Contexto | Promedio BEIR (subconjunto) | Licencia | Disponibilidad |
|---|---:|---:|---|---:|---|---|
| atto-90k-2048d-embeddings | 90K | 2048 | no disponible | 0.4257 | apache-2.0 | Hugging Face |
| atto-1m-2048d-embeddings | 1M | 2048 | no disponible | 0.4453 | apache-2.0 | Hugging Face |
| all-MiniLM-L6-v2 | 23M | 384 | no disponible | 0.4802 | apache-2.0 | Hugging Face |
| DenseOn | 110M | 768 | no disponible | 0.5638 | no disponible | Hugging Face |

Frente a all-MiniLM-L6-v2, atto-90k-2048d ofrece una dimension de embedding mucho mayor (2048 vs 384) con una decima parte de parametros, a costa de un rendimiento inferior en el subconjunto BEIR evaluado (0.4257 vs 0.4802). Frente a atto-1m-2048d, sacrifica algo de precision (0.4257 vs 0.4453) a cambio de un factor de ~11 menos parametros. DenseOn, con 110M parametros, es claramente superior en calidad pero dos ordenes de magnitud mas pesado.

## Limitaciones y advertencias

- Solo soporta ingles; no se declaran capacidades multilingues.
- Vocabulario muy reducido (1K tokens), lo que puede penalizar la cobertura lexica en dominios especializados o con terminologia tecnica.
- La evaluacion publicada cubre solo tres datasets de BEIR (ArguAna, NFCorpus, SciFact); no hay datos de MTEB ni de otros benchmarks, por lo que la generalizacion es incierta.
- No es un modelo generativo: no puede usarse para chat, razonamiento, codigo ni tool calling.
- Riesgo de alucinacion no aplicable en sentido estricto (no genera texto), pero si de recuperaciones irrelevantes en dominios fuera de distribucion.
- No se documentan sesgos conocidos ni evaluaciones de robustez; al entrenarse presumiblemente con datos en ingles, heredara sesgos de ese corpus.
- La licencia apache-2.0 permite uso comercial, pero conviene verificar los terminos del modelo base y de los datos de entrenamiento (no documentados).
- Requiere `trust_remote_code=True` por el uso de la arquitectura AttoModel personalizada, lo que implica ejecutar codigo del autor; auditar antes de desplegar en produccion.
- El repositorio ocupa 0.0 GB y registra 0 descargas en el momento de la consulta: proyecto muy reciente y con poca validacion externa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/NeuML/atto-90k-2048d-embeddings
- Modelo base: https://huggingface.co/NeuML/atto-90k-2048d
- Articulo "Introducing Atto": https://hf.co/blog/neuml/introducing-atto
- Repositorio txtai: https://github.com/neuml/txtai
- Script de benchmarks de txtai: https://github.com/neuml/txtai/blob/master/examples/benchmarks.py
- Sentence-Transformers: https://www.SBERT.net
- Modelo comparable all-MiniLM-L6-v2: https://huggingface.co/sentence-transformers/all-MiniLM-L6-v2
- Modelo comparable DenseOn: https://huggingface.co/lightonai/denseon
