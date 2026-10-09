# dangerousmanleebyeonggeon/qwen3-emb-0.6b-specter-n5469-e2-ckpt326

## Resumen

qwen3-emb-0.6b-specter-n5469-e2-ckpt326 es un modelo de embeddings de texto publicado por el usuario dangerousmanleebyeonggeon en HuggingFace. Se trata de un ajuste fino completo de Qwen/Qwen3-Embedding-0.6B (595.776.512 parametros) orientado a similitud entre frases y recuperacion de documentos, con pipeline sentence-similarity y libreria sentence-transformers.

El ajuste forma parte de un experimento de ablation sobre datos de entrenamiento: se ha entrenado con 5.469 pares de tripletas de citas cientificas extraidas de allenai/scirepeval (tarea cite_prediction, formato SPECTER) mediante la perdida InfoNCE de ms-swift. El checkpoint publicado es el final del entrenamiento (paso 326 de 326, eval loss 0.4428).

Su relevancia es acotada pero concreta: es un modelo pequeno (0.6B) que cabe en cualquier GPU de consumo y en CPU, sirve como referencia controlada para estudiar como afecta la composicion del dataset a un modelo de embeddings multilingue y es util para tareas de recuperacion semantica en el dominio cientifico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only de la familia Qwen3 adaptado a embeddings (heredado del modelo base Qwen3-Embedding-0.6B) |
| Parametros totales | 595.776.512 (dato de safetensors) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | 32.768 tokens (heredado del modelo base Qwen3-Embedding-0.6B; no confirmado en la model card de este ajuste) |
| Tipos de cuantizacion | no disponible (repo en safetensors bf16; sin GGUF publicado para este ajuste) |
| Idiomas soportados | no disponible (el modelo base es multilingue; no se detalla en esta model card) |
| Licencia | no disponible (la del modelo base Qwen3-Embedding-0.6B es Apache-2.0) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del modelo base Qwen/Qwen3-Embedding-0.6B, un transformer decoder-only de la familia Qwen3 reutilizado para producir representaciones vectoriales de texto. Sobre el se ha realizado un ajuste fino completo (no LoRA ni adaptadores) mediante ms-swift con la tarea `embedding` y la perdida InfoNCE. El entrenamiento uso lr 6e-6 con scheduler coseno, 2 epocas, bf16, DeepSpeed ZeRO-3 y 8 GPUs con per-device 1 y grad-acc 4, lo que da 32 consultas por paso. Los negativos son in-batch (all-gathered entre las 8 consultas de un micro-batch) con temperatura 0.1, y se reservo un 5 por ciento para validacion con semilla 42.

El conjunto de entrenamiento tiene 5.469 filas muestreadas de allenai/scirepeval (cite_prediction), con el formato de tripletas de SPECTER: paper consultado, paper citado y un negativo de SPECTER, usando como texto la concatenacion "title. abstract.". La model card lo describe explicitamente como una ablation de datos de entrenamiento, del mismo tamano que su dataset de referencia canho/ours-6k. El unico dato de rendimiento publicado es la eval loss final de 0.4428 en el paso 326 de 326. Para inferencia se define un prompt de consulta "Query:" en `config_sentence_transformers.json`; los documentos se codifican sin prompt, y se indica `padding_side="left"`.

## Capacidades

- Generacion de embeddings densos de texto para similitud semantica y recuperacion.
- Sentence similarity: comparacion directa entre consultas y documentos.
- Recuperacion de informacion (retrieval) en corpus, con consultas prefijadas por "Query:" y documentos sin prompt.
- Recuperacion en el dominio cientifico, en particular prediccion y recomendacion de citas (entrenado sobre tripletas de citas de scirepeval).
- Clustering y deduplicacion de textos por similitud coseno.
- Clasificacion de textos mediante embeddings como caracteristicas.
- Reranking de resultados de busqueda usando la similitud del modelo como puntuacion.
- Capacidades multilingues potenciales heredadas del modelo base (no confirmadas en esta ficha).
- No es un modelo generativo: no produce texto, no soporta tool calling ni function calling, ni razonamiento multi-paso agentico, ni modos de pensamiento.

## Casos de uso

- Busqueda semantica en repositorios de articulos cientificos: indexar titulos y abstracts y recuperar los documentos mas cercanos a una consulta, aprovechando que el ajuste se ha realizado sobre texto de este tipo.
- Recomendacion de citas: dado un paper, recuperar candidatos que probablemente citaria, ya que el entrenamiento proviene de tripletas de citas de scirepeval.
- RAG para literatura cientifica: usar el modelo como retriever para alimentar un LLM generativo con los abstracts mas relevantes en lugar del texto completo.
- Clustering de publicaciones por tematica: agrupar titulos y abstracts por similitud coseno para mapear areas de investigacion o detectar duplicados.
- Deduplicacion de registros bibliograficos: detectar entradas repetidas o casi identicas en bases de datos de referencias mediante umbral de similitud.
- Clasificacion y etiquetado de documentos: usar los embeddings como entrada de un clasificador ligero para asignar categorias o temas a nuevos articulos.
- Reranking en pipelines de busqueda: reordenar los resultados de un retriever rapido usando la similitud del modelo para mejorar la precision final.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El unico dato de rendimiento reportado en la model card es la eval loss final de entrenamiento: 0.4428 en el paso 326 de 326. No se aportan resultados de MTEB, MMLU ni de tareas de recuperacion comparables, por lo que no es posible contrastar su calidad con otros modelos usando datos verificables.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,2 GB en bf16/fp16 solo para los pesos, y del orden de 2-3 GB considerando activaciones y el procesamiento por lotes.
- Cabe holgadamente en GPU de consumo: RTX 3060, RTX 4060, RTX 4090 y similares, e incluso en GPUs de portatil con 4 GB o mas.
- Puede ejecutarse en CPU para lotes pequenos, dado el tamano reducido del modelo.
- GPU recomendadas para servicio de alto rendimiento: T4, L4, A10, A100 o H100 si se necesita gran throughput de indexacion.
- Opciones de despliegue: sentence-transformers (libreria nativa), text-embeddings-inference (el repo esta etiquetado como compatible), vLLM en modo embedding y exportacion ONNX si se necesita.
- Latencia y throughput estimados: no disponibles (no se publican mediciones en la model card).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Dominio | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| qwen3-emb-0.6b-specter-n5469-e2-ckpt326 | 595.776.512 | 32.768 (heredado del base) | Cientifico (ajuste sobre citas) | no disponible | HuggingFace |
| Qwen/Qwen3-Embedding-0.6B (base) | 595.776.512 | 32.768 | General y multilingue | Apache-2.0 | HuggingFace |
| allenai/specter2_base | ~110M | 512 | Cientifico | Apache-2.0 | HuggingFace |
| BAAI/bge-m3 | ~568M | 8.192 | Multilingue, recuperacion | MIT | HuggingFace |

Los valores de los modelos comparativos provienen de la documentacion publica de cada modelo; los del ajuste aqui descrito, de la informacion disponible en su repositorio. El ajuste hereda la arquitectura y el contexto del modelo base, pero su entrenamiento se ha especializado en el dominio cientifico y su licencia no esta declarada.

## Limitaciones y advertencias

- Licencia sin especificar: el repositorio no declara licencia para este ajuste, lo que supone un riesgo para uso comercial aunque el modelo base sea Apache-2.0.
- Riesgo de sobreajuste al dominio cientifico: solo 5.469 pares de citas de un unico dataset, lo que puede degradar su rendimiento general frente al modelo base en dominios no cientificos.
- La model card lo presenta como una ablation de datos de entrenamiento, no como un modelo optimizado para produccion; la eval loss de 0.4428 no equivale a una mejora demostrada en benchmarks externos.
- No es un modelo generativo, por lo que no puede producir texto ni responder preguntas; su salida son vectores.
- Idiomas soportados no detallados: aunque el base es multilingue, este ajuste se ha entrenado con texto mayoritariamente en ingles (abstracts cientificos), por lo que el rendimiento multilingue no esta garantizado.
- Longitud de contexto no confirmada en la model card; conviene verificar el limite efectivo antes de indexar documentos largos.
- Sesgos: hereda los sesgos del corpus de origen (scirepeval) y del modelo base, con posible sobrerrepresentacion de ciertas areas cientificas.
- Solo 0 descargas y 0 likes en el momento de la ficha, sin validacion externa de la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/dangerousmanleebyeonggeon/qwen3-emb-0.6b-specter-n5469-e2-ckpt326
- Modelo base: https://huggingface.co/Qwen/Qwen3-Embedding-0.6B
- Dataset de entrenamiento: https://huggingface.co/datasets/allenai/scirepeval
- Herramienta de entrenamiento (ms-swift): https://github.com/modelscope/ms-swift
- Libreria de inferencia (sentence-transformers): https://github.com/UKPLab/sentence-transformers
- Documentacion de SPECTER (referencia del formato de tripletas): https://github.com/allenai/specter2
