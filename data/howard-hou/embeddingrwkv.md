# howard-hou/EmbeddingRWKV

## Resumen

EmbeddingRWKV es una familia de modelos de embeddings de texto y reranking construida sobre la arquitectura RWKV, concretamente sobre el modelo base BlinkDL/rwkv7-g1. Lo desarrolla el usuario de HuggingFace howard-hou y se distribuye bajo licencia Apache 2.0. Su proposito es cubrir dos tareas clasicas de recuperacion de informacion (retrieval y reranking) con un coste computacional bajo, aprovechando las ventajas de un modelo recurrente lineal frente a un transformer clasico.

El repositorio incluye tres niveles de tamano (Tiny, Base y Large) con pesos en formato `.pth` de PyTorch, junto con rerankers emparejados. La propuesta tecnica mas singular es el uso del estado final del modelo de embeddings (en concreto el estado de TimeMixing) como entrada del reranker, lo que permite precomputar y cachear estados de documentos y reducir la latencia en consulta a O(L_query) en lugar de O(L_doc + L_query).

El modelo esta pensado para pipelines RAG, motores de busqueda semantica y sistemas de filtrado de candidatos. Su relevancia actual radica en que ofrece una alternativa no-transformer a los embeddings densos convencionales, con un consumo de memoria que escala de forma lineal con la longitud de secuencia en lugar de cuadratica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | RWKV (variante v7, modelo base BlinkDL/rwkv7-g1) |
| Parametros totales | no disponible (variantes de 0,1B, 0,4B y 1,4B segun nombre de checkpoint) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos distribuidos en `.pth`, sin GGUF ni safetensors) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | `.pth` (PyTorch) |

## Arquitectura y entrenamiento

La familia se apoya en RWKV v7, una arquitectura recurrente con mecanismos de TimeMixing y ChannelMixing que combina caracteristicas de RNN y de transformer. El modelo base es BlinkDL/rwkv7-g1, sobre el que se ha realizado un fine-tuning para producir embeddings y rerankers. El repositorio ofrece tres pares de modelos:

- Tiny: `rwkv0b1-emb-curriculum.pth` (embedding) y `rwkv0b1-reranker.pth` (reranker).
- Base: `rwkv0b4-emb-curriculum.pth` (embedding) y `rwkv0b3-reranker.pth` (reranker).
- Large: `rwkv1b4-emb-curriculum.pth` (embedding) y `rwkv1b3-reranker.pth` (reranker).

El sufijo "curriculum" en los checkpoints de embedding sugiere un entrenamiento por fases con dificultad creciente, aunque la model card no detalla la composicion del dataset, el numero de tokens ni si se aplicaron tecnicas de RLHF o DPO. Tampoco se especifica la dimension de los embeddings ni el numero de capas.

La innovacion tecnica mas destacable es el diseno del reranker: en lugar de procesar el par query-documento completo, reutiliza el estado de TimeMixing (`state[1]`) generado por el modelo de embeddings. Esto habilita dos modos de operacion: online (procesar el par completo en cada consulta) y offline (precomputar y cachear el estado del documento, de modo que en consulta solo se procesa la query). El tokenizer propio requiere `add_eos=True` con el token EOS `65535` para marcar el final de secuencia, y el padding debe hacerse a la izquierda con token `0`.

## Capacidades

- Generacion de embeddings de texto densos para similitud semantica (cosine similarity).
- Reranking de pares query-documento mediante el estado recurrente del modelo.
- Modo offline con cacheo de estados de documentos para reducir latencia en consulta.
- Soporte de procesamiento por lotes (batching), con recomendacion explicita de padding a longitud fija para maximizar el throughput en GPU.
- Aceleracion opcional mediante kernel CUDA (`RWKV_CUDA_ON=1`).
- Tokenizer propio integrado en el paquete `rwkv-emb`.
- No se documentan capacidades de generacion de texto, tool calling, agentes, vision, audio ni modo thinking.

## Casos de uso

- Recuperacion en pipelines RAG: el modelo de embeddings filtra candidatos por similitud coseno y el reranker reordena los resultados. La posibilidad de cachear estados de documentos encaja con corpus estaticos que se consultan con frecuencia.
- Busqueda semantica en motores internos: indexacion offline de documentos con `Instruct + Document` y puntuacion en consulta con solo la query, reduciendo la latencia de O(L_doc + L_query) a O(L_query).
- Filtrado inicial de candidatos en sistemas de recomendacion: la variante Tiny (0,1B) permite procesar grandes volumenes con poca memoria y baja latencia.
- Deduplicacion y clustering de documentos: los embeddings permiten agrupar textos semanticamente proximos en tareas de limpieza de corpus.
- Moderacion y clasificacion semantica: comparar mensajes contra un conjunto de referencia de politicas mediante similitud de embeddings.
- Despliegue en entornos con VRAM limitada: la variante Tiny esta disenada explicitamente para "minimo consumo de memoria", lo que la hace apta para GPUs de consumo o entornos edge, aunque no se publican cifras concretas.
- Evaluacion de relevancia en sistemas de QA: el reranker con sigmoide sobre los logits proporciona una probabilidad de relevancia entre 0 y 1 directamente utilizable como umbral.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible. El repositorio ocupa 9,5 GB e incluye las seis variantes de pesos; el consumo en inferencia depende del checkpoint cargado y no se documenta.
- GPU recomendadas: no disponible. La model card menciona aceleracion CUDA opcional (`RWKV_CUDA_ON=1`) sin especificar modelos de GPU.
- GPU de consumo: la variante Tiny (0,1B) esta descrita como "ultra-rapida, minima memoria", lo que sugiere que cabe en GPUs de consumo, pero no se aportan cifras de VRAM.
- Opciones de despliegue: paquete Python `rwkv-emb` con PyTorch. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI; los pesos en `.pth` no son directamente compatibles con esos runners sin conversion.
- Latencia y throughput: no se publican cifras. La model card indica que el padding a longitud fija activa una ruta CUDA mas rapida y que el batching mejora el rendimiento, pero sin numeros concretos.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones detalladas (dimension de embedding, contexto, idiomas) que permitan una comparacion rigurosa con alternativas como BGE, E5 o GTE. Se indica "no disponible".

| Modelo | Arquitectura | Parametros | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| EmbeddingRWKV | RWKV v7 | 0,1B / 0,4B / 1,4B (segun checkpoint) | no disponible | Apache 2.0 | `.pth` |
| Alternativas tipo BGE/E5/GTE | Transformer | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- No se documentan sesgos conocidos, pero al derivar de un modelo base sin informacion sobre el dataset de entrenamiento, el riesgo de sesgos inheritos no puede descartarse.
- Riesgo de alucinacion no aplica en sentido estricto (no genera texto), pero la similitud coseno y las puntuaciones del reranker pueden producir falsos positivos en documentos semanticamente proximos pero no relevantes.
- Idiomas soportados no declarados; no hay garantia de rendimiento multilingue.
- Longitud de contexto no especificada, lo que dificulta dimensionar el truncado de documentos largos.
- La licencia Apache 2.0 permite uso comercial, pero al ser un fine-tuning de BlinkDL/rwkv7-g1 conviene verificar la licencia del modelo base.
- Los pesos en `.pth` requieren el paquete `rwkv-emb` y no son compatibles de forma nativa con runners estandar como vLLM u Ollama, lo que anade friccion en produccion.
- El tokenizer exige `add_eos=True` y padding a la izquierda con token `0`; omitir estos requisitos degrada la calidad de los embeddings.
- Repositorio con 0 descargas y 8 likes en el momento de la consulta: ecosistema pequeno y poca validacion externa.
- No hay resultados de benchmarks publicados, por lo que la calidad relativa frente a embeddings establecidos no esta verificada.

## Enlaces

- HuggingFace: https://huggingface.co/howard-hou/EmbeddingRWKV
- Pesos: https://huggingface.co/howard-hou/EmbeddingRWKV/tree/main
- Modelo base: https://huggingface.co/BlinkDL/rwkv7-g1
