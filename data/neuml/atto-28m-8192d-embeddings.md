# NeuML/atto-28m-8192d-embeddings

## Resumen

Atto-28m-8192d-embeddings es un modelo de embeddings de frases desarrollado por NeuML, obtenido mediante fine-tuning con sentence-transformers del modelo base NeuML/atto-28m-8192d. Forma parte de la familia Atto, una linea de modelos contextuales compactos disenados para aprendizaje de representaciones linguisticas con eficiencia de parametros. El modelo resuelve el problema de generar embeddings densos de alta dimensionalidad (8192 dimensiones) para busqueda semantica y recuperacion de informacion, con un coste computacional muy reducido.

Con aproximadamente 28 millones de parametros y una dimension de salida de 8192, el modelo se posiciona como una alternativa ultraligera a los encoders clasicos como all-MiniLM-L6-v2 (23M parametros, 384 dimensiones) o DenseOn (110M parametros, 768 dimensiones). Su interes actual radica en que demuestra que es posible superar a modelos de embeddings mucho mas grandes en tareas de recuperacion (BEIR) manteniendo un tamano de pesos de apenas 0.1 GB, lo que lo hace apto para despliegues en CPU, entornos con recursos limitados y pipelines de RAG de bajas latencias.

El modelo esta publicado bajo licencia Apache 2.0, soporta unicamente ingles y se distribuye en formato safetensors con codigo personalizado (custom_code), por lo que requiere `trust_remote_code=True` para su carga. Esta orientado a la extraccion de caracteristicas y similitud de frases, no a la generacion de texto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | AttoModel (transformer compacto) + Pooling max |
| Parametros totales | 28M |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors; cuantizacion no documentada por el autor) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |
| Dimension de embedding | 8192 |
| Vocabulario | 30K |
| Modo de pooling | max (include_prompt: True) |
| Tamano del repositorio | 0.1 GB |
| Pipeline | sentence-similarity / feature-extraction |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura de tipo encoder transformer compacto denominada AttoModel, envuelta en un pipeline de sentence-transformers compuesto por dos modulos: un Transformer de feature-extraction que expone `last_hidden_state` como `token_embeddings`, y una capa de Pooling con pooling_mode "max" que produce un vector final de 8192 dimensiones. El modelo base es NeuML/atto-28m-8192d, sobre el que se ha realizado un fine-tuning especifico para similitud de frases.

El entrenamiento se realizo con sentence-transformers usando los siguientes hiperparametros: batch size de 64 por dispositivo, 25 epocas, learning rate de 0.01, 1000 pasos de warmup, weight decay de 0.01, gradient accumulation de 2 pasos y fp16 activado. Se emplearon prompts diferenciados para consulta (`query: `) y documento (`document: `), lo que indica un entrenamiento orientado a recuperacion asimetrica. No se especifica en la informacion disponible el numero de tokens de entrenamiento, la composicion exacta del dataset ni si se aplicaron tecnicas de RLHF o DPO (no aplicables tipicamente a modelos de embeddings). La innovacion principal es la combinacion de un numero muy bajo de parametros con una dimension de embedding muy alta (8192), lo que permite representaciones ricas con un coste de almacenamiento minimo.

## Capacidades

- Generacion de embeddings de frases y documentos en ingles con 8192 dimensiones.
- Similitud semantica entre textos (pipeline sentence-similarity).
- Extraccion de caracteristicas (feature-extraction) a nivel de token y de frase.
- Recuperacion de informacion densa para motores de busqueda semantica.
- Integracion como fuente de conocimiento en pipelines de retrieval augmented generation (RAG).
- Soporte de prompts asimetricos para consulta y documento, optimizado para recuperacion.
- Compatible con txtai para construir bases de datos de embeddings.
- Compatible con la libreria sentence-transformers.
- No soporta generacion de texto, tool calling, agentes, vision, audio ni modo thinking.

## Casos de uso

- Busqueda semantica en documentacion tecnica: el modelo genera vectores de 8192 dimensiones que permiten indexar y recuperar fragmentos relevantes en ingles con un coste de almacenamiento bajo (0.1 GB de pesos), adecuado para corpus de documentacion de productos.
- Base de conocimiento para RAG: se puede usar como encoder de recuperacion en pipelines de generacion aumentada, recuperando pasajes relevantes antes de pasarlos a un LLM generador, gracias a su integracion nativa con txtai y sentence-transformers.
- Deduplicacion y clustering de textos: la alta dimensionalidad del embedding facilita separar documentos semanticamente proximos en tareas de agrupamiento o eliminacion de duplicados en ingles.
- Clasificacion de tickets de soporte: los embeddings pueden alimentar clasificadores ligeros para enrutar incidencias por similitud con casos historicos, con inferencia viable en CPU.
- Busqueda en aplicaciones edge o de bajos recursos: al tener solo 28M de parametros y 0.1 GB de pesos, puede desplegarse en dispositivos con poca memoria o en contenedores ligeros sin GPU.
- Filtrado previo en sistemas de recomendacion de contenido: calculo de similitud entre consultas de usuario y catalogos de articulos en ingles para generar candidatos antes de un ranking mas costoso.
- Evaluacion de similitud en pipelines de control de calidad de datos: comparacion de pares de frases para detectar parafrasis o inconsistencias en datasets en ingles.

## Benchmarks y rendimiento

Resultados de `ndcg@10` en un subconjunto de BEIR, segun la model card del autor:

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
| atto-25m-384d | 25M | 384 | 30K | 0.4879 | 0.3426 | 0.6600 | 0.4968 |
| **atto-28m-8192d** | **28M** | **8192** | **30K** | **0.5111** | **0.3461** | **0.6843** | **0.5138** |
| DenseOn | 110M | 768 | 50K | 0.5408 | 0.3915 | 0.7591 | 0.5638 |

No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K u otros) en la informacion disponible, ya que el modelo no esta orientado a generacion.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp32 para los 28M de parametros y 0.1 GB de pesos; en fp16 aproximadamente 0.06 GB de pesos, con overhead adicional por activaciones y codigo personalizado.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; el modelo cabe holgadamente en tarjetas como RTX 3060, RTX 4060, RTX 4090, e incluso en GPUs de gama baja o integradas.
- Cabe en GPU consumer: si, en practicamente cualquier GPU consumer e incluso en CPU.
- Opciones de despliegue: sentence-transformers con `trust_remote_code=True`, txtai, y en general frameworks compatibles con modelos sentence-transformers. No se documentan opciones especificas para vLLM, llama.cpp, Ollama o TGI en la informacion disponible.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Dimensiones | Media BEIR (ndcg@10) | Licencia | Disponibilidad |
|---|---:|---:|---:|---|---|
| atto-28m-8192d-embeddings | 28M | 8192 | 0.5138 | apache-2.0 | Hugging Face |
| all-MiniLM-L6-v2 | 23M | 384 | 0.4802 | apache-2.0 | Hugging Face |
| atto-17m-8192d-embeddings | 17M | 8192 | 0.5109 | apache-2.0 | Hugging Face |
| DenseOn | 110M | 768 | 0.5638 | no disponible | Hugging Face |

El modelo supera a all-MiniLM-L6-v2 en la media de BEIR (0.5138 frente a 0.4802) con un tamano similar, y queda ligeramente por encima de atto-17m-8192d. DenseOn obtiene mejores puntuaciones, pero con casi cuatro veces mas parametros y una dimension de embedding menor.

## Limitaciones y advertencias

- Solo soporta ingles; no se garantiza un rendimiento adecuado en castellano u otros idiomas.
- Es un modelo de embeddings, no de generacion: no produce texto, no soporta tool calling ni razonamiento multi-paso.
- Requiere `trust_remote_code=True` por el uso de codigo personalizado, lo que implica ejecutar codigo del autor; conviene auditar el repositorio antes de usarlo en produccion.
- La dimension de 8192 eleva el coste de almacenamiento por vector (32 KB por embedding en fp32), lo que puede ser relevante en indices de gran escala pese al bajo numero de parametros.
- No se documentan sesgos especificos, pero al entrenarse en ingles hereda los sesgos de los datos de entrenamiento, no detallados en la informacion disponible.
- Riesgo de alucinacion no aplicable directamente al no generar texto, pero si puede producir similitudes erroneas en dominios fuera de distribucion.
- La licencia Apache 2.0 permite uso comercial, pero no se especifican restricciones adicionales sobre los datos de entrenamiento.
- No se documenta la longitud maxima de contexto soportada, lo que limita la planificacion de uso con documentos largos.
- Modelo con muy pocas descargas y reciente publicacion (noviembre de 2026), por lo que la validacion comunitaria es escasa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/NeuML/atto-28m-8192d-embeddings
- Modelo base: https://huggingface.co/NeuML/atto-28m-8192d
- Articulo "Introducing Atto": https://hf.co/blog/neuml/introducing-atto
- Repositorio txtai: https://github.com/neuml/txtai
- Script de benchmarks de txtai: https://github.com/neuml/txtai/blob/master/examples/benchmarks.py
- Modelo comparable all-MiniLM-L6-v2: https://huggingface.co/sentence-transformers/all-MiniLM-L6-v2
- Modelo comparable DenseOn: https://huggingface.co/lightonai/denseon
- Modelo relacionado atto-17m-8192d-embeddings: https://hf.co/neuml/atto-17m-8192d-embeddings
- Modelo relacionado atto-25m-384d-embeddings: https://hf.co/neuml/atto-25m-384d-embeddings
- Modelo relacionado atto-2m-8192d-embeddings: https://hf.co/neuml/atto-2m-8192d-embeddings
- Sentence-Transformers: https://www.SBERT.net
