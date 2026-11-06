# raahemnabeel/qwen3-reranker-4b

## Resumen

qwen3-reranker-4b es un port del modelo Qwen/Qwen3-Reranker-4B, desarrollado originalmente por el equipo Qwen, publicado por el usuario raahemnabeel. Se trata de un reranker de texto (text-ranking) derivado del modelo base de Qwen sin modificar los pesos, empaquetado para su ejecución sobre hardware Tenstorrent Blackhole (chips p150 y p300). El modelo puntúa la relevancia de un documento respecto a una consulta calculando logit("yes") - logit("no") al final del prompt, y se sirve mediante una API estilo Cohere / Jina / vLLM en /v1/rerank.

El modelo está pensado como segunda etapa de reranking en pipelines de recuperación y RAG: reordena los mejores candidatos devueltos por una búsqueda de embeddings (por ejemplo, Qwen3-Embedding) sobre texto y código. No es un modelo generativo. Soporta más de 100 idiomas y código, y cada chip aloja una copia completa del modelo, de modo que añadir chips incrementa el número de documentos procesados por segundo (paralelismo de datos).

El paquete se publica con tt-model-manager 0.1.0 (esquema de manifiesto 5.1) y expone el servidor HTTP propio del modelo en el puerto 20000, no una API de chat compatible con OpenAI. La licencia es Apache 2.0 y el tamaño del repositorio es de 1.0 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivado de Qwen3-Reranker-4B; port TTNN para Tenstorrent) |
| Parametros totales | 4B (según el nombre del modelo base; no se detalla en la información disponible) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | pares truncados a 8192 tokens |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | más de 100 idiomas y código |
| Licencia | apache-2.0 |
| Formato de pesos | checkpoint de Qwen/Qwen3-Reranker-4B convertido a pesos TTNN (no se especifica safetensors/GGUF) |

## Arquitectura y entrenamiento

El modelo es un reranker basado en la arquitectura del transformer Qwen3-Reranker-4B, con los pesos sin modificar respecto al modelo original del equipo Qwen. La innovación del paquete no está en el entrenamiento, sino en el port a TTNN (Tenstorrent Neural Network) para ejecutarse sobre chips Blackhole. La puntuación de relevancia se obtiene leyendo logit("yes") - logit("no") al final del prompt del modelo, y la relevancia final es sigmoid(score), equivalente a exp(log_softmax([no, yes]))[yes] según la model card.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO en la información proporcionada; esos detalles corresponden al modelo base Qwen/Qwen3-Reranker-4B y no se detallan en esta ficha. El port está construido sobre la pila compartida de reranker Qwen3 (models/autoports/qwen_qwen3_vl_reranker_8b) y se empaqueta con tt-model-manager.

## Capacidades

- Reranking de texto: puntúa la relevancia de un documento respecto a una consulta mediante el cálculo de logits yes/no.
- Soporte de más de 100 idiomas y código.
- API de reranking estilo Cohere / Jina / vLLM en POST /v1/rerank con campos query, documents (1 a 1000), instruction, top_n, return_documents y raw_scores.
- Endpoint POST /v1/score con la forma de vLLM (text_1, text_2).
- Endpoint GET /health que informa del estado de cada chip y devuelve 503 hasta que el modelo está caliente o mientras un chip está caído.
- Truncado de pares a 8192 tokens; rechazo de imágenes y vídeo con error 400.
- Paralelismo de datos: una copia completa del modelo por chip, con perfiles p150, p300, p300x2, p150x2 y p150x4.
- No es un modelo generativo: no soporta generación de texto, tool calling ni razonamiento multi-paso.

## Casos de uso

- Reranking en pipelines RAG: reordenar los mejores candidatos devueltos por una búsqueda de embeddings (por ejemplo, Qwen3-Embedding) antes de pasarlos a un LLM generador, mejorando la precisión del contexto recuperado.
- Búsqueda empresarial multilingüe: puntuar documentos en más de 100 idiomas para consultas en distintos idiomas, gracias a la cobertura multilingüe del modelo base.
- Búsqueda de código: reordenar fragmentos de código recuperados por similitud para consultas técnicas, dado el soporte de código del modelo.
- Atención al cliente con base de conocimiento: seleccionar los pasajes más relevantes de una base documental para responder consultas de usuarios en conversaciones multi-turno.
- Deduplicación y ordenación de resultados: usar /v1/score para puntuar pares texto-texto y ordenar o filtrar candidatos en pipelines de procesamiento documental.
- Despliegue en hardware Tenstorrent: servir el reranker en chips Blackhole p150 o p300, escalando el throughput añadiendo chips (p300x2, p150x2, p150x4) con una copia del modelo por chip.
- Evaluación de relevancia a escala: procesar hasta 1000 documentos por petición con top_n para seleccionar los mejores resultados en sistemas de búsqueda internos.

## Benchmarks y rendimiento

| Eval | Métrica | Este paquete | Referencia HF | Tamaño |
|---|---|---:|---:|---|
| Conjunto fijo de pares, parte de texto (188 pares en 33 grupos de consulta; inglés, multilingüe, código, documentos de 2K-8K tokens) | Pearson r de la puntuación | 0.9997 | 1 (HF fp32) | 188 pares |
| | Diferencia media / máxima absoluta de puntuación (logits) | 0.140 / 0.64 | 0 | |
| | Mismo documento top-1 por grupo | 33/33 | | |
| | Mismo orden para pares que HF separa por >= 0.5 | 100.0% | | 449 pares |
| MTEB reranking, inglés (subconjunto SciDocsRR + AskUbuntuDupQuestions) | NDCG@10 | 94.35 | 94.35 | 60 grupos, 600 pares |
| MIRACL reranking, subconjunto de / ja / ar | NDCG@10 | 95.42 | 96.19 | 45 grupos, 450 pares |

| Un documento, en caliente, p150 | Tokens del par | Latencia (ms) |
|---|---:|---:|
| texto 128 | 135 | 42 |
| texto 512 | 515 | 75 |

La referencia HF es la implementación de transformers en CPU con el prompt de la model card, sobre exactamente los mismos token ids (fp32 para el conjunto fijo de pares, bf16 para los subconjuntos de benchmark). Las filas de benchmark son subconjuntos fijos con listas de candidatos cortas (NDCG con ganancia exponencial): muestran paridad con HF, no números de leaderboard. En MIRACL el top-1 de un grupo se invierte (Pearson de puntuación 0.9996, media |d| 0.15).

## Requisitos de hardware

- Hardware específico Tenstorrent Blackhole: p150, p300, p300x2, p150x2 o p150x4.
- Cada chip aloja una copia completa del modelo; más chips implican más documentos por segundo (paralelismo de datos).
- Perfiles de servicio: p150 (un chip, por defecto), p300 (dos chips, aproximadamente el doble de throughput que p150), p300x2 (QuietBox 2, cuatro chips, aproximadamente cuatro veces el throughput de p150), p150x2 (dos placas p150) y p150x4 (cuatro placas p150).
- Requisitos de sistema: CLI de Tenstorrent (tt) instalable con uv tool install tenstorrent, Docker, 1 GB de hugepages montadas en /dev/hugepages-1G y aproximadamente 10 GB de disco libre para el checkpoint y los pesos convertidos.
- Despliegue: tt serve raahemnabeel/qwen3-reranker-4b (o tt-model serve sin tt-cli); el servidor escucha en el puerto 20000 (o el siguiente libre).
- La primera puesta en marcha compila kernels para el dispositivo y tarda varios minutos; el servidor está listo cuando registra "Application startup complete".
- No cabe en GPU consumer (RTX 4090, etc.): el paquete está diseñado exclusivamente para hardware Tenstorrent.
- Latencia conocida (p150, un documento en caliente): 42 ms para 135 tokens de par y 75 ms para 515 tokens de par.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| raahemnabeel/qwen3-reranker-4b (este) | 4B | pares truncados a 8192 tokens | apache-2.0 | Hugging Face (port Tenstorrent) | Solo hardware Tenstorrent Blackhole |
| Qwen/Qwen3-Reranker-4B | 4B | no disponible en la información | apache-2.0 | Hugging Face | Modelo base original; implementación transformers |
| Qwen3-Embedding | no disponible | no disponible | no disponible | Hugging Face | Mencionado como primera etapa de recuperación en el pipeline RAG |

No se dispone de datos de otros rerankers comparables (por ejemplo, Cohere Rerank o Jina Reranker) en la información proporcionada; la comparativa se limita a los modelos citados en la model card.

## Limitaciones y advertencias

- No es un modelo generativo: solo realiza reranking; no debe usarse para generación de texto, chat ni tool calling.
- Sesgos conocidos: no disponibles en la información proporcionada.
- Riesgo de alucinación: no aplica directamente al ser un modelo de puntuación, pero las puntuaciones de relevancia pueden ser imprecisas en dominios fuera de distribución.
- Limitación de contexto: los pares se truncan a 8192 tokens; documentos más largos se recortan.
- Rechaza imágenes y vídeo con error 400; solo procesa texto.
- Dependencia de hardware propietario: requiere chips Tenstorrent Blackhole (p150/p300), Docker, hugepages y aproximadamente 10 GB de disco; no se ejecuta en GPU convencionales.
- La API no es compatible con OpenAI: expone el servidor HTTP propio del modelo en el puerto 20000 con formas de petición y respuesta propias.
- En MIRACL se observa una ligera degradación frente a HF (NDCG@10 95.42 frente a 96.19) y la inversión del top-1 en un grupo.
- Licencia Apache 2.0: permite uso comercial, pero conviene verificar las condiciones del modelo base Qwen/Qwen3-Reranker-4B y del hardware/software Tenstorrent.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta; es un paquete recién publicado y poco validado por la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/raahemnabeel/qwen3-reranker-4b
- Modelo base: https://huggingface.co/Qwen/Qwen3-Reranker-4B
- tt-model-manager: https://github.com/tenstorrent/tt-model-manager
- CLI de Tenstorrent (prerequisitos): https://github.com/tenstorrent/tt-cli/blob/main/docs/prerequisites.md
- Repositorio Tenstorrent: https://github.com/tenstorrent
