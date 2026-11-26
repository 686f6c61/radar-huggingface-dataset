# evalstate/ettin-encoder-32m-colbert-nq-mnrl

## Resumen

Ettin-encoder-32m-colbert-nq-mnrl es un modelo de recuperación de información multi-vector de tipo ColBERT, construido por el usuario evalstate a partir del encoder Ettin de 32 millones de parámetros desarrollado por el grupo JHU-CLSP. El modelo transforma cada documento y cada consulta en una matriz de embeddings por token (en lugar de un único vector denso) y aplica late interaction con la operación MaxSim para puntuar la relevancia, siguiendo el paradigma de ColBERT.

El modelo está afinado con MultiVectorMultipleNegativesRankingLoss sobre un conjunto de aproximadamente 96.658 ejemplos de negativos duros, derivados de Natural Questions (NQ) y orientado a la recuperación de pasajes. Su relevancia radica en que ofrece capacidades de recuperación multi-vector con una huella de parámetros extremadamente reducida (31,88 millones), lo que permite desplegarlo en entornos con recursos limitados o como componente de sistemas RAG ligeros.

La arquitectura base es ModernBERT (etiqueta modernbert en Hugging Face), lo que aporta atención eficiente y soporte de secuencias largas. El modelo es solo para inglés, se distribuye con licencia MIT y está pensado como extractor de características dentro de pipelines de sentence-transformers o de Text Embeddings Inference.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder (ModernBERT) con cabecera ColBERT multi-vector y late interaction (MaxSim) |
| Parámetros totales | 31.883.136 (aproximadamente 32 M) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (la model card no especifica la ventana máxima) |
| Tipos de cuantización | no disponible (pesos en safetensors; sin variantes GGUF publicadas) |
| Idiomas soportados | inglés (en) |
| Licencia | MIT |
| Formato de pesos | safetensors (librería sentence-transformers) |

## Arquitectura y entrenamiento

El modelo parte de jhu-clsp/ettin-encoder-32m, un encoder de la familia Ettin basado en ModernBERT, y le añade una proyección multi-vector para producir un embedding por token. La puntuación se realiza mediante late interaction: para cada término de la consulta se calcula el producto escalar máximo contra todos los tokens del documento (MaxSim) y se suman esos máximos, el mecanismo clásico de ColBERT descrito en arXiv:1908.10084. La elección de ModernBERT como columna vertebral aporta atención con sesgo posicional rotatorio y eficiencia computacional frente a encoders BERT clásicos.

El entrenamiento se realizó con la pérdida MultiVectorMultipleNegativesRankingLoss (MNRL), que contrasta cada consulta con su pasaje positivo y con negativos duros dentro del lote, sobre un conjunto de 96.658 ejemplos. Los negativos duros proceden de Natural Questions, lo que alinea el modelo con la distribución de preguntas reales de un buscador. El modelo se generó con el Trainer de sentence-transformers (etiqueta generated_from_trainer) y no se documentan fases de RLHF ni de ajuste por preferencias, algo esperable en un modelo de recuperación.

## Capacidades

- Extracción de embeddings multi-vector por token para consultas y documentos (feature-extraction).
- Recuperación de pasajes mediante late interaction con MaxSim, adecuada para ranking fino tras un primer filtro.
- Búsqueda semántica en inglés sobre corpus de preguntas y respuestas (estilo Natural Questions).
- Puntuación de relevancia consulta-documento a nivel de token, lo que permite señales de interpretabilidad por término.
- Integración con sentence-transformers y con Text Embeddings Inference (endpoints_compatible) para servir el modelo como API.
- No soporta generación de texto, tool calling ni razonamiento multi-paso: es un encoder puro.
- Capacidad multilingüe limitada al inglés.

## Casos de uso

- Búsqueda semántica en documentación técnica en inglés: el modelo genera embeddings por token de cada fragmento y permite recuperar los pasajes más relevantes para una consulta con MaxSim, con un coste de almacenamiento bajo gracias a sus 32 M de parámetros.
- Reranking en pipelines RAG: tras una recuperación inicial con un modelo bi-encoder barato, este ColBERT puntúa los candidatos con late interaction, mejorando la precisión sin el coste de un cross-encoder grande.
- Preguntas y respuestas sobre bases de conocimiento: al estar afinado con negativos de Natural Questions, es adecuado para localizar el pasaje que contiene la respuesta a una pregunta factual en inglés.
- Indexación de corpus pequeños en entornos con recursos limitados: su tamaño permite ejecutarlo en CPU o en GPUs de gama baja, útil para prototipos y pruebas de concepto.
- Filtrado de duplicados ynear-duplicates semánticos: los embeddings multi-vector permiten comparar documentos por similitud a nivel de token, útil en deduplicación de artículos o tickets.
- Servicio de búsqueda interno vía API: compatible con Text Embeddings Inference, se puede desplegar como endpoint de embeddings para que otras aplicaciones consulten un índice ColBERT.
- Evaluación de sistemas de recuperación: sirve como baseline ligero para comparar estrategias de indexación y ranking en experimentos académicos.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados, verified: false). Se evalúan sobre NanoMSMARCO y NanoNQ con métricas MaxSim.

| Métrica | NanoMSMARCO | NanoNQ |
|---|---|---|
| Accuracy@1 | 0,24 | 0,42 |
| Accuracy@3 | 0,36 | 0,56 |
| Accuracy@5 | 0,50 | 0,58 |
| Accuracy@10 | 0,56 | 0,68 |
| Precision@1 | 0,24 | 0,42 |
| Precision@3 | 0,12 | 0,193 |
| Precision@5 | 0,10 | 0,12 |
| Precision@10 | 0,056 | 0,072 |
| Recall@1 | 0,24 | 0,40 |
| Recall@3 | 0,36 | 0,53 |
| Recall@5 | 0,50 | 0,55 |
| Recall@10 | 0,56 | 0,66 |
| NDCG@10 | 0,384 | 0,530 |
| MRR@10 | 0,329 | 0,500 |
| MAP@100 | 0,342 | 0,492 |

El rendimiento es claramente superior en NanoNQ que en NanoMSMARCO, coherente con el dominio de entrenamiento (Natural Questions). No se han publicado comparaciones con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en FP32 (31,88 M de parámetros, unos 128 MB de pesos), y menos de 100 MB en FP16. Cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; RTX 3060, RTX 4090, A100 o H100 funcionan sin problema, aunque el modelo está sobredimensionado para estas últimas.
- Cabe en GPU consumer: sí, en todas las GPU modernas e incluso en iGPU con suficiente memoria compartida.
- Opciones de despliegue: sentence-transformers (nativo), Text Embeddings Inference (endpoints_compatible), y servidores de embeddings compatibles con la API de Hugging Face. No se dispone de variantes GGUF para llama.cpp u Ollama.
- Latencia y throughput: no disponibles en la información proporcionada. Por el tamaño del modelo, se espera una latencia muy baja en GPU y aceptable en CPU, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| evalstate/ettin-encoder-32m-colbert-nq-mnrl | 31,88 M | no disponible | ColBERT multi-vector | MIT | Hugging Face |
| jhu-clsp/ettin-encoder-32m (base) | 32 M aprox. | no disponible | Encoder denso | MIT | Hugging Face |
| ColBERTv2 (referencia) | ~110 M | 512 tokens | ColBERT multi-vector | MIT | Hugging Face / repositorio oficial |
| Modelos bi-encoder tipo MiniLM | ~22-33 M | 512 tokens | Bi-encoder denso | Apache 2.0 / MIT | Hugging Face |

La comparación cuantitativa de rendimiento frente a estas alternativas no está disponible en la información proporcionada. Frente al encoder base, este modelo añade la cabecera multi-vector y el ajuste con negativos duros; frente a ColBERTv2, ofrece un tamaño tres veces menor a costa de una capacidad de recuperación presumiblemente inferior, aunque no hay datos que lo confirmen.

## Limitaciones y advertencias

- Solo soporta inglés; no debe usarse para recuperación en otros idiomas.
- El dominio de entrenamiento son preguntas de Natural Questions, por lo que el rendimiento puede degradarse en dominios muy distintos (código, textos legales, conversaciones).
- Los benchmarks publicados no están verificados (verified: false) y proceden de conjuntos reducidos (NanoMSMARCO, NanoNQ), por lo que no deben extrapolarse a MS MARCO completo.
- Riesgo de falsos positivos en MaxSim: la coincidencia de tokens frecuentes puede inflar la puntuación de documentos irrelevantes.
- No es un modelo generativo; no puede responder preguntas por sí mismo, solo recuperar pasajes.
- La licencia MIT permite uso comercial, pero el autor no ofrece garantías sobre el rendimiento en producción.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica escasa validación por parte de la comunidad.
- No se documentan sesgos específicos, pero al entrenarse sobre datos web en inglés puede heredar sesgos de ese corpus.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/evalstate/ettin-encoder-32m-colbert-nq-mnrl
- Modelo base: https://huggingface.co/jhu-clsp/ettin-encoder-32m
- Paper de ColBERT: https://arxiv.org/abs/1908.10084
- Paper de MaxSim / late interaction: https://arxiv.org/abs/1705.00652
- Documentación de sentence-transformers: https://www.sbert.net/
- Text Embeddings Inference: https://github.com/huggingface/text-embeddings-inference
