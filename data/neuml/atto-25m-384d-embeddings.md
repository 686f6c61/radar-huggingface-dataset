# NeuML/atto-25m-384d-embeddings

## Resumen

Atto-25m-384d-embeddings es un modelo de embeddings de frases (sentence embeddings) desarrollado por NeuML, miembro de la familia Atto de modelos contextuales compactos disenados para representacion del lenguaje con eficiencia de parametros. Se trata de un fine-tuning con sentence-transformers sobre el modelo base NeuML/atto-25m-384d, que genera vectores densos de 384 dimensiones para tareas de similitud semantica y recuperacion de informacion.

Con 25 millones de parametros, un vocabulario de 30K tokens y una dimension de salida de 384, el modelo se posiciona como una alternativa ultraligera a all-MiniLM-L6-v2 (23M parametros, 384 dimensiones), superandolo ligeramente en la media de los tres subconjuntos de BEIR reportados (0.4968 frente a 0.4802 en ndcg@10). Su reducido tamano lo hace adecuado para despliegues con recursos muy limitados, indexacion masiva de documentos y entornos de CPU.

El modelo se publica bajo licencia Apache 2.0, esta disenado exclusivamente para ingles y su uso principal es la construccion de bases de datos de embeddings con txtai para busqueda semantica y como fuente de conocimiento en pipelines de retrieval augmented generation (RAG).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | AttoModel (transformer contextual compacto) + Pooling (mean pooling) |
| Parametros totales | 25M |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |
| Dimension de embedding | 384 |
| Vocabulario | 30K tokens |
| Pooling | mean, include_prompt=True |
| Libreria | sentence-transformers |
| Requiere trust_remote_code | si (custom_code) |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura SentenceTransformer compuesta por dos modulos: un transformer de extraccion de caracteristicas (`AttoModel`) que devuelve el `last_hidden_state` a nivel de token, y una capa de pooling de tipo mean que agrega las representaciones token a token en un vector unico de 384 dimensiones. El prefijo de prompt se incluye en el pooling (`include_prompt: True`), y se utilizan prompts diferenciados para consulta (`query: `) y documento (`document: `).

El fine-tuning se realizo con sentence-transformers sobre el modelo base NeuML/atto-25m-384d, con los siguientes hiperparametros: batch size de 64 por dispositivo, 25 epocas, learning rate de 0.003, 1000 pasos de warmup, weight decay de 0.01, acumulacion de gradientes de 2 pasos, entrenamiento en fp16 y 20 workers de carga de datos. No se detalla en la informacion disponible la composicion exacta del dataset de entrenamiento ni el numero de pares o tripletas utilizadas.

## Capacidades

- Generacion de embeddings de frases de 384 dimensiones para similitud semantica.
- Extraccion de caracteristicas a nivel de token (`feature-extraction`).
- Busqueda semantica sobre corpus documentales mediante indexacion vectorial.
- Recuperacion de informacion para pipelines de RAG como fuente de conocimiento.
- Integracion nativa con txtai para construir bases de datos de embeddings.
- Integracion con sentence-transformers mediante `SentenceTransformer`.
- Soporte de prompts diferenciados para consulta y documento.
- Compatibilidad con endpoints de Hugging Face (`endpoints_compatible`).

## Casos de uso

- Busqueda semantica en corpus pequenos o medianos: el modelo indexa documentos con vectores de 384 dimensiones y permite consultas por similitud coseno con un coste computacional minimo, adecuado para catalogos de documentacion tecnica o bases de conocimiento internas.
- RAG con presupuesto de recursos ajustado: al tener solo 25M de parametros, puede ejecutarse en CPU o en GPUs de gama baja dentro de un pipeline de recuperacion previo a un LLM generador, reduciendo el coste de infraestructura del componente retriever.
- Deduplicacion y agrupamiento de textos: los embeddings permiten detectar documentos o registros duplicados o semanticamente proximos mediante clustering y umbrales de similitud en tareas de limpieza de datos.
- Clasificacion zero-shot por similitud: comparar la representacion de un texto con descripciones de categorias para asignar etiquetas sin entrenamiento adicional.
- Motor de busqueda en aplicaciones edge o embebidas: su tamano (repo de 0.1 GB) permite desplegarlo en dispositivos con memoria limitada o en contenedores ligeros.
- Filtrado y ranking en pipelines de recomendacion de contenido: generar embeddings de items y usuarios para recuperar candidatos por similitud semantica antes de un ranking mas costoso.
- Moderacion y triaje de tickets de soporte: agrupar consultas entrantes por tematica y enrutarlas al equipo correspondiente mediante similitud con embeddings de referencia.

## Benchmarks y rendimiento

Resultados de BEIR (ndcg@10) reportados por el autor, con el script de benchmarks de txtai:

| Modelo | Parametros | Dimensiones | Vocab | ArguAna | NFCorpus | SciFact | Media |
|---|---:|---:|---:|---:|---:|---:|---:|
| atto-36k-384d | 36K | 384 | 1K | 0.3249 | 0.2286 | 0.4920 | 0.3485 |
| atto-50k-768d | 50K | 768 | 1K | 0.3264 | 0.2430 | 0.5334 | 0.3676 |
| atto-90k-2048d | 90K | 2048 | 1K | 0.4021 | 0.2676 | 0.6074 | 0.4257 |
| bert-hash-femto | 243K | 128 | 30K | 0.1964 | 0.1402 | 0.2830 | 0.2065 |
| bert-hash-pico | 442K | 128 | 30K | 0.2853 | 0.2075 | 0.3912 | 0.2947 |
| bert-hash-nano | 953K | 128 | 30K | 0.3828 | 0.2562 | 0.5032 | 0.3807 |
| atto-1m-2048d | 1M | 2048 | 4K | 0.4189 | 0.2941 | 0.6229 | 0.4453 |
| atto-1m-4096d | 1M | 4096 | 4K | 0.4223 | 0.3044 | 0.6417 | 0.4561 |
| atto-2m-8192d | 2M | 8192 | 4K | 0.4343 | 0.3125 | 0.6653 | 0.4707 |
| atto-14m-384d | 14M | 384 | 30K | 0.4874 | 0.3329 | 0.6472 | 0.4892 |
| atto-17m-8192d | 17M | 8192 | 30K | 0.4963 | 0.3455 | 0.6909 | 0.5109 |
| all-MiniLM-L6-v2 | 23M | 384 | 30K | 0.4789 | 0.3089 | 0.6527 | 0.4802 |
| **atto-25m-384d** | **25M** | **384** | **30K** | **0.4879** | **0.3426** | **0.6600** | **0.4968** |
| atto-28m-8192d | 28M | 8192 | 30K | 0.5111 | 0.3461 | 0.6843 | 0.5138 |
| DenseOn | 110M | 768 | 50K | 0.5408 | 0.3915 | 0.7591 | 0.5638 |

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp16 para el modelo completo (25M de parametros); en fp32, aproximadamente 100 MB de pesos mas overhead de activaciones y tokenizador.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; el modelo no requiere A100 ni H100. Funciona correctamente en GTX 1650, RTX 3060, RTX 4090 o incluso en CPU.
- Cabe en cualquier GPU consumer: si, con margen amplio.
- Opciones de despliegue: sentence-transformers, txtai, Hugging Face Inference Endpoints (compatible). No se especifica soporte nativo de vLLM, llama.cpp, Ollama o TGI en la informacion disponible.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Dimensiones | Vocab | Media BEIR (ndcg@10) | Licencia |
|---|---:|---:|---:|---:|---|
| atto-25m-384d-embeddings | 25M | 384 | 30K | 0.4968 | apache-2.0 |
| all-MiniLM-L6-v2 | 23M | 384 | 30K | 0.4802 | apache-2.0 |
| atto-28m-8192d-embeddings | 28M | 8192 | 30K | 0.5138 | apache-2.0 |
| DenseOn | 110M | 768 | 50K | 0.5638 | no disponible |

Frente a all-MiniLM-L6-v2, el modelo de NeuML ofrece una media ligeramente superior en los tres subconjuntos evaluados (0.4968 frente a 0.4802) con un tamano de parametros comparable y la misma dimension de salida. El atto-28m-8192d obtiene mejor puntuacion media (0.5138) a costa de una dimension de embedding mucho mayor (8192), lo que incrementa el coste de almacenamiento e indexacion. DenseOn, con 110M de parametros y 768 dimensiones, supera a todos ellos en calidad pero multiplica por mas de cuatro el tamano del modelo.

## Limitaciones y advertencias

- Solo soporta ingles; su rendimiento en castellano u otros idiomas no esta validado y probablemente sea deficiente.
- Es un modelo de embeddings, no generativo: no produce texto, razonamiento ni codigo.
- No se dispone de informacion sobre sesgos demograficos o culturales del modelo base ni del dataset de fine-tuning.
- Riesgo de falsos positivos en similitud semantica en dominios especializados no representados en los datos de entrenamiento; conviene validar con un conjunto propio antes de produccion.
- Requiere `trust_remote_code=True` por el uso de arquitectura personalizada (`AttoModel`), lo que implica ejecutar codigo del autor; auditar antes de desplegar en entornos sensibles.
- La longitud maxima de contexto no esta documentada; textos largos pueden truncarse sin aviso segun la configuracion del tokenizador.
- La licencia Apache 2.0 permite uso comercial, pero el modelo se distribuye sin garantias y el autor no ofrece soporte formal.
- No se han publicado resultados de benchmarks fuera de los tres subconjuntos de BEIR reportados (ArguAna, NFCorpus, SciFact).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/NeuML/atto-25m-384d-embeddings
- Modelo base: https://huggingface.co/NeuML/atto-25m-384d
- Articulo "Introducing Atto": https://hf.co/blog/neuml/introducing-atto
- Repositorio txtai: https://github.com/neuml/txtai
- Script de benchmarks de txtai: https://github.com/neuml/txtai/blob/master/examples/benchmarks.py
- Sentence-Transformers: https://www.SBERT.net
- all-MiniLM-L6-v2 (comparativa): https://huggingface.co/sentence-transformers/all-MiniLM-L6-v2
- DenseOn (comparativa): https://huggingface.co/lightonai/denseon
