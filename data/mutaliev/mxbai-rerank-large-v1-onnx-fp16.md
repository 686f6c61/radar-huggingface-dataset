# mutaliev/mxbai-rerank-large-v1-onnx-fp16

## Resumen

`mutaliev/mxbai-rerank-large-v1-onnx-fp16` es una conversión a precisión media (fp16) del grafo ONNX del cross-encoder de reranking `mixedbread-ai/mxbai-rerank-large-v1`, desarrollado originalmente por Mixedbread AI. El modelo resuelve la segunda fase del pipeline de recuperación de información: dado un par consulta-documento, asigna una puntuación de relevancia que permite reordenar los candidatos devueltos por un retriever inicial (BM25, embeddings densos, etc.). La relevancia de esta ficha radica en que el repositorio upstream solo publica grafos ONNX en fp32 e int8, y esta variante cubre el hueco intermedio para inferencia en GPU con el proveedor CUDA de ONNX Runtime.

Arquitectónicamente es un transformer encoder basado en DeBERTa-v2 con cabeza de clasificación para `text-ranking` (pipeline de Transformers.js), empaquetado para ejecutarse en el ecosistema JavaScript/Node.js mediante `@huggingface/transformers`. Los pesos son exactamente los del modelo base almacenados en fp16: no hay fine-tuning ni reentrenamiento, y los ficheros de configuración y tokenizador son copias byte a byte de la revisión `98f655841d5caf0b16eaff79c2b4ca109d920d17`.

El interés práctico está en el ahorro de VRAM y latencia documentado por el autor: en una NVIDIA L4 el p50 por consulta baja de 642 a 367 ms y el consumo de VRAM de 3.294 a 2.072 MiB, manteniendo una concordancia top-1 del 100% con fp32 sobre 200 preguntas de LoCoMo. Es, por tanto, una opción orientada a despliegues de reranking en producción con GPUs de gama media.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (DeBERTa-v2) con cabeza de clasificación para ranking |
| Parametros totales | no disponible (el grafo ONNX fp16 ocupa 872.473.151 bytes) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (las pruebas se truncaron a 512 tokens) |
| Tipos de cuantizacion | fp16 (esta variante); fp32 e int8 disponibles en el repositorio upstream |
| Idiomas soportados | en (ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (`onnx/model_fp16.onnx`) |

## Arquitectura y entrenamiento

El modelo es un cross-encoder basado en DeBERTa-v2 que procesa conjuntamente la consulta y el documento candidato, produciendo una puntuación de relevancia. Esta variante concreta no introduce cambios arquitectónicos: es una conversión determinista del grafo ONNX fp32 upstream a fp16 mediante `convert_float_to_float16` de `onnxruntime.transformers.float16`, con `keep_io_types=True` y la lista de operadores bloqueados por defecto (`DEFAULT_OP_BLOCK_LIST`). Mantener los tipos de entrada y salida (tokens de entrada y logits en fp32) permite que los llamadores no modifiquen su código.

El autor documenta una decisión técnica relevante: conservar también en fp32 los operadores descompuestos de LayerNorm (`Pow`, `ReduceMean`, `Sqrt`) empeoraba el ranking, con una concordancia top-1 que caía a 88 de 200, por lo que se aplicó la lista de bloqueo por defecto. La conversión resultó reproducible (tres builds en dos máquinas produjeron el mismo fichero) y se realizó con onnxruntime 1.30.0 y onnx 1.23.2. No se dispone de información sobre el volumen de tokens, la composición del dataset ni el uso de RLHF/DPO en el entrenamiento del modelo base dentro de la información proporcionada.

## Capacidades

- Reranking de pares consulta-documento: asigna una puntuación de relevancia que permite reordenar candidatos de un retriever previo.
- Clasificación de texto vía `AutoModelForSequenceClassification` en Transformers.js.
- Inferencia en GPU mediante el proveedor CUDA de ONNX Runtime (`device: "cuda"`, `dtype: "fp16"`).
- Ejecución en el ecosistema JavaScript/Node.js con `@huggingface/transformers`.
- Capacidades multilingües: limitadas al inglés según la model card.
- No se documentan capacidades de generación de texto, tool calling, agentes, visión ni audio; es un modelo exclusivamente de ranking.

## Casos de uso

- Reranking en pipelines RAG: tras la recuperación densa o léxica de decenas o cientos de fragmentos, el modelo reordena los candidatos por relevancia real respecto a la consulta, mejorando la precisión del contexto entregado al LLM generador. El fp16 reduce el coste por consulta frente a fp32.
- Búsqueda semántica en producción con GPUs de gama media: el ahorro de VRAM (2.072 MiB frente a 3.294 MiB en L4) permite co-alojar el reranker junto a otros servicios en la misma GPU.
- Despliegue en aplicaciones web JavaScript/Node.js: al cargarse con Transformers.js, puede integrarse en backends Node sin depender de Python, usando el grafo fp16 con CUDA.
- Reranking de memoria conversacional: el autor valida el modelo sobre LoCoMo (preguntas sobre conversaciones largas), un escenario aplicable a asistentes con memoria de historial.
- Filtrado de resultados en motores de búsqueda internos: reordenar los resultados de un índice corporativo antes de presentarlos al usuario.
- Evaluación de concordancia en migraciones fp32→fp16: el modelo sirve como referencia para validar que una conversión a media precisión no degrada el ranking (top-1 y Spearman documentados).
- Deduplicación y priorización de documentos candidatos en pipelines de anotación o curación de datasets.

## Benchmarks y rendimiento

El autor publica una comparación de concordancia fp16 frente a fp32 sobre 200 preguntas de LoCoMo (20 por conversación, cada una contra 150 turnos, 30.000 pares, lotes de 16, truncado a 512 tokens), con ONNX Runtime 1.30.0 en CUDA:

| Metrica | NVIDIA L4 | NVIDIA RTX PRO 6000 Blackwell |
|---|---|---|
| Top-1 igual a fp32 | 200 de 200 | 200 de 200 |
| Top-10 identico a fp32 | 198 de 200 (solapamiento medio 9,99) | 198 de 200 (solapamiento medio 9,99) |
| Correlacion de Spearman minima | 0,99986 | 0,99988 |
| Diferencia absoluta de logits media / maxima | 0,0022 / 0,068 | 0,0022 / 0,043 |
| Logits no finitos | 0 | 0 |
| p50 en caliente por consulta, fp32 → fp16 | 642 → 367 ms | 130 → 99 ms |
| VRAM adicional, fp32 → fp16 | 3.294 → 2.072 MiB | 3.089 → 1.168 MiB |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible, dado que el modelo es un reranker y no un modelo generativo.

## Requisitos de hardware

- VRAM estimada: 2.072 MiB adicionales en NVIDIA L4 y 1.168 MiB en RTX PRO 6000 Blackwell con el grafo fp16 (frente a 3.294 y 3.089 MiB en fp32, respectivamente).
- GPU validadas por el autor: NVIDIA L4 y NVIDIA RTX PRO 6000 Blackwell con CUDA.
- GPU de consumo: no se documenta validación en GPUs consumer; el tamaño del grafo (872 MB) sugiere que cabría en GPUs con 4 GB o más de VRAM, pero no hay datos publicados.
- Despliegue: ONNX Runtime con proveedor CUDA y Transformers.js (`@huggingface/transformers`); no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Latencia: p50 en caliente de 367 ms por consulta en L4 y 99 ms en RTX PRO 6000 Blackwell con fp16, sobre lotes de 16 y truncado a 512 tokens.
- Throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| mutaliev/mxbai-rerank-large-v1-onnx-fp16 | no disponible | no disponible (pruebas a 512 tokens) | ONNX fp16 | Apache 2.0 | Hugging Face |
| mixedbread-ai/mxbai-rerank-large-v1 (upstream) | no disponible | no disponible | safetensors, ONNX fp32, ONNX int8 | Apache 2.0 | Hugging Face |
| Alternativas de reranking de la misma categoria | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone en la información proporcionada de datos de rendimiento de modelos alternativos que permitan una comparación cuantitativa.

## Limitaciones y advertencias

- Solo soporta inglés; no se documentan otros idiomas.
- Es un modelo de ranking, no generativo: no produce texto, no soporta tool calling ni razonamiento multi-paso.
- Las pruebas de concordancia se truncaron a 512 tokens; el comportamiento con secuencias más largas no está documentado.
- Riesgo de sesgos y alucinación: no documentado en la información proporcionada; al ser un cross-encoder, su salida es una puntuación, no texto generado.
- Licencia Apache 2.0, que permite uso comercial, pero se trata de una versión modificada del modelo base y debe conservarse la atribución correspondiente.
- La validación se limita a dos GPUs profesionales (L4 y RTX PRO 6000 Blackwell); no hay datos de rendimiento en otras GPUs ni en CPU.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que carece de validación comunitaria.
- No se documentan requisitos de versión mínima de ONNX Runtime más allá de la 1.30.0 usada en la conversión.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mutaliev/mxbai-rerank-large-v1-onnx-fp16
- Modelo base: https://huggingface.co/mixedbread-ai/mxbai-rerank-large-v1
- Blog de Mixedbread sobre los modelos rerank v1: https://www.mixedbread.ai/blog/mxbai-rerank-v1
