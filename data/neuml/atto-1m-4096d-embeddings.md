# NeuML/atto-1m-4096d-embeddings

## Resumen

Atto-1m-4096d-embeddings es un modelo de embeddings de frases desarrollado por NeuML, parte de la familia Atto de modelos contextuales compactos disenados para representacion linguistica con eficiencia de parametros. Este modelo concreto parte del checkpoint base NeuML/atto-1m-4096d y se ha afinado con la libreria sentence-transformers para tareas de similitud semantica y extraccion de caracteristicas. Con aproximadamente 1,59 millones de parametros y una dimension de embedding de 4096, se posiciona como una alternativa ultraligera a modelos densos clasicos como all-MiniLM-L6-v2 (23M parametros, 384 dimensiones).

El modelo resuelve el problema de generar representaciones vectoriales de alta dimension con un coste computacional y de almacenamiento minimo, lo que resulta relevante para sistemas de busqueda semantica, recuperacion aumentada por generacion (RAG) y construccion de bases de datos de embeddings a gran escala. Su vocabulario reducido de 4096 tokens y su arquitectura compacta lo hacen especialmente atractivo para despliegues en entornos con recursos limitados o para indexar corpus muy grandes donde el coste por vector importa.

La relevancia actual del modelo radica en la tendencia hacia embeddings eficientes: aunque su rendimiento en BEIR es inferior al de modelos mas grandes, su relacion tamano-rendimiento permite construir indices densos con una huella de memoria muy reducida, lo que facilita su integracion en pipelines de recuperacion de informacion en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | AttoModel (transformer contextual compacto) con pooling maximo |
| Parametros totales | 1.590.912 (aprox. 1,59M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |
| Dimension de embedding | 4096 |
| Vocabulario | 4096 tokens |
| Pooling | max pooling |
| Prefijos de prompt | `query: ` / `document: ` |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura de tipo transformer contextual denominada AttoModel, con un codificador que produce `last_hidden_state` a partir de las representaciones de tokens, seguido de una capa de pooling de tipo maximo que genera un vector de 4096 dimensiones. La configuracion completa se expone como un `SentenceTransformer` con dos modulos: el transformer de extraccion de caracteristicas y el pooling. El vocabulario es de 4096 tokens, lo que reduce drasticamente el tamano de la matriz de embeddings respecto a modelos con vocabularios de 30K o 50K tokens.

El entrenamiento se realizo con sentence-transformers usando los siguientes hiperparametros: batch size de 128 por dispositivo, 25 epocas, learning rate de 0,003, 1000 pasos de warmup, weight decay de 0,01, precision fp16 y 20 workers de carga de datos. Se emplearon prefijos de prompt diferenciados para consultas (`query: `) y documentos (`document: `), practica habitual en modelos de recuperacion densa para separar los espacios de representacion. No se detalla en la informacion disponible la composicion exacta del dataset de entrenamiento ni si se aplicaron tecnicas de RLHF o DPO, aunque por la naturaleza del modelo (embeddings) cabe esperar entrenamiento contrastivo supervisado, si bien este extremo no se confirma en la documentacion proporcionada.

## Capacidades

- Generacion de embeddings de frases para similitud semantica y recuperacion de informacion.
- Extraccion de caracteristicas contextuales a nivel de token y de secuencia.
- Busqueda semantica densa mediante integracion con txtai y sentence-transformers.
- Soporte como fuente de conocimiento para pipelines de RAG.
- Representaciones de alta dimension (4096) con un numero muy reducido de parametros.
- Soporte de prefijos de prompt para distinguir consultas y documentos.
- Capacidades multilingues: limitadas al ingles (unico idioma declarado).
- No soporta tool calling, agentes ni modos de razonamiento explicito (no es un modelo generativo).

## Casos de uso

- Busqueda semantica en corpus grandes: el modelo genera vectores de 4096 dimensiones con solo 1,59M de parametros, lo que permite indexar millones de documentos con un coste de almacenamiento y computo muy bajo en comparacion con modelos densos de mayor tamano.
- Recuperacion aumentada por generacion (RAG): se puede usar como recuperador ligero en pipelines donde el modelo generador es el componente costoso y se necesita minimizar la latencia y memoria del paso de retrieval.
- Deduplicacion y clustering de documentos: la similitud coseno entre embeddings permite agrupar documentos semanticamente cercanos en tareas de curaduria de datos o eliminacion de duplicados.
- Clasificacion de texto por similitud: comparando la representacion de un texto con prototipos de cada clase, sin necesidad de entrenar un clasificador dedicado.
- Despliegue en entornos con recursos limitados: al ocupar menos de 2M de parametros, cabe en CPU y en dispositivos de borde, lo que facilita la inferencia en tiempo real sin GPU.
- Filtrado previo en sistemas de recomendacion o motores de busqueda: primera etapa de recuperacion de candidatos antes de un re-ranking con un modelo mas costoso.
- Indexacion masiva en bases vectoriales: la dimension de 4096 ofrece alta capacidad expresiva, aunque conviene valorar el coste de almacenamiento frente a dimensiones menores (384 o 768) en funcion del presupuesto.

## Benchmarks y rendimiento

Resultados de una submuestra de BEIR (ndcg@10) reportados por el autor:

| Modelo | Parametros | Dimensiones | Vocab | ArguAna | NFCorpus | SciFact | Media |
|---|---:|---:|---:|---:|---:|---:|---:|
| atto-36k-384d | 36K | 384 | 1K | 0,3249 | 0,2286 | 0,4920 | 0,3485 |
| atto-50k-768d | 50K | 768 | 1K | 0,3264 | 0,2430 | 0,5334 | 0,3676 |
| atto-90k-2048d | 90K | 2048 | 1K | 0,4021 | 0,2676 | 0,6074 | 0,4257 |
| bert-hash-femto | 243K | 128 | 30K | 0,1964 | 0,1402 | 0,2830 | 0,2065 |
| bert-hash-pico | 442K | 128 | 30K | 0,2853 | 0,2075 | 0,3912 | 0,2947 |
| bert-hash-nano | 953K | 128 | 30K | 0,3828 | 0,2562 | 0,5032 | 0,3807 |
| atto-1m-2048d | 1M | 2048 | 4K | 0,4189 | 0,2941 | 0,6229 | 0,4453 |
| **atto-1m-4096d** | **1M** | **4096** | **4K** | **0,4223** | **0,3044** | **0,6417** | **0,4561** |
| atto-2m-8192d | 2M | 8192 | 4K | 0,4343 | 0,3125 | 0,6653 | 0,4707 |
| atto-14m-384d | 14M | 384 | 30K | 0,4874 | 0,3329 | 0,6472 | 0,4892 |
| atto-17m-8192d | 17M | 8192 | 30K | 0,4963 | 0,3455 | 0,6909 | 0,5109 |
| all-MiniLM-L6-v2 | 23M | 384 | 30K | 0,4789 | 0,3089 | 0,6527 | 0,4802 |
| atto-25m-384d | 25M | 384 | 30K | 0,4879 | 0,3426 | 0,6600 | 0,4968 |
| atto-28m-8192d | 28M | 8192 | 30K | 0,5111 | 0,3461 | 0,6843 | 0,5138 |
| DenseOn | 110M | 768 | 50K | 0,5408 | 0,3915 | 0,7591 | 0,5638 |

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 100 MB en fp16 para los pesos del modelo (1,59M parametros), mas el overhead de activaciones y tokenizador.
- GPU recomendadas: cualquier GPU moderna sirve; el modelo no requiere GPU dedicada. Funciona correctamente en CPU.
- Cabe en cualquier GPU de consumo (RTX 3060, RTX 4090, etc.) e incluso en dispositivos de borde y entornos sin acelerador.
- Opciones de despliegue: sentence-transformers, txtai, transformers con `trust_remote_code=True`. No se documenta soporte nativo para vLLM, llama.cpp u Ollama (no es un modelo generativo).
- Latencia y throughput: no disponibles en la informacion proporcionada; por el tamano del modelo se espera un throughput alto en CPU, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Dimensiones | Contexto | BEIR (media) | Licencia | Disponibilidad |
|---|---:|---:|---|---:|---|---|
| atto-1m-4096d | 1,59M | 4096 | no disponible | 0,4561 | apache-2.0 | Hugging Face |
| all-MiniLM-L6-v2 | 23M | 384 | 256 tokens (estandar) | 0,4802 | apache-2.0 | Hugging Face |
| atto-28m-8192d | 28M | 8192 | no disponible | 0,5138 | apache-2.0 | Hugging Face |
| DenseOn | 110M | 768 | no disponible | 0,5638 | no disponible | Hugging Face |

El modelo ofrece un rendimiento en BEIR ligeramente inferior a all-MiniLM-L6-v2 (0,4561 frente a 0,4802) con un numero de parametros unas 14 veces menor, lo que lo hace competitivo en escenarios donde el coste computacional o de memoria es el factor limitante. Frente a atto-28m-8192d, este ultimo obtiene mejor puntuacion (0,5138) a costa de mas parametros y mayor dimension.

## Limitaciones y advertencias

- Sesgos conocidos: no se documentan analisis de sesgo en la informacion disponible; al entrenarse presumiblemente con datos en ingles, puede heredar sesgos de ese corpus.
- Riesgo de alucinacion: no aplica directamente al no ser un modelo generativo, pero los embeddings pueden producir similitudes espurias en dominios fuera de distribucion.
- Limitaciones de contexto: la longitud maxima de contexto no se especifica en la documentacion; conviene validarla antes de usarlo con textos largos.
- Limitaciones de idioma: solo se declara soporte para ingles; el rendimiento en castellano u otros idiomas no esta garantizado.
- Restricciones de licencia: licencia apache-2.0, permisiva para uso comercial, pero se recomienda revisar los terminos del modelo base y de los datos de entrenamiento (no detallados).
- Caveat para produccion: requiere `trust_remote_code=True` debido a la arquitectura personalizada AttoModel, lo que implica ejecutar codigo del autor; auditar antes de desplegar en entornos sensibles.
- El rendimiento en BEIR es modesto en terminos absolutos; para tareas de alta precision puede ser necesario un re-ranking con un modelo mayor.
- El numero de descargas es 0 y el modelo es muy reciente (creado en noviembre de 2026), por lo que la validacion comunitaria es practicamente inexistente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/NeuML/atto-1m-4096d-embeddings
- Modelo base: https://huggingface.co/NeuML/atto-1m-4096d
- Articulo de presentacion de Atto: https://hf.co/blog/neuml/introducing-atto
- Repositorio txtai: https://github.com/neuml/txtai
- Script de benchmarks de txtai: https://github.com/neuml/txtai/blob/master/examples/benchmarks.py
- Sentence-Transformers: https://www.SBERT.net
- Modelo comparable all-MiniLM-L6-v2: https://huggingface.co/sentence-transformers/all-MiniLM-L6-v2
- Modelo comparable DenseOn: https://huggingface.co/lightonai/denseon
