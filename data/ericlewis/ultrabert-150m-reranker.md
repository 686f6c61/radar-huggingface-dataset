# ericlewis/ultrabert-150m-reranker

## Resumen

UltraBERT-150M reranker es un modelo cross-encoder de reordenación (reranking) para búsqueda documental en inglés, publicado por el usuario ericlewis en Hugging Face. Se trata de un ajuste fino del backbone dmis-lab/UltraBERT-150M, un transformer encoder de 24 capas con 151.624.705 parámetros, entrenado para puntuar pares consulta-documento y reordenar los resultados de un recuperador de primera fase como BM25.

El modelo resuelve el segundo paso clásico de un pipeline de recuperación de información: tras obtener un conjunto de candidatos mediante búsqueda léxica o vectorial, el cross-encoder evalúa conjuntamente consulta y documento y devuelve una puntuación de relevancia ilimitada, permitiendo reordenar los resultados por calidad. El entrenamiento se basa en destilación sobre 5 millones de pares puntuados por un modelo profesor, con una función de pérdida MSE sobre las puntuaciones de relevancia.

Es relevante por su tamaño contenido (150M de parámetros) y su ventana de 32.768 tokens por par, que permite reordenar documentos largos sin truncamiento agresivo. La licencia Apache 2.0 facilita su uso comercial, aunque el modelo está limitado al idioma inglés y su publicación es muy reciente, con cero descargas registradas en el momento de la consulta.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder (cross-encoder), backbone UltraBERT-150M: 24 capas, hidden size 768, 6 cabezas de atención |
| Parámetros totales | 151.624.705 |
| Parámetros activos | no aplica (modelo denso) |
| Longitud de contexto | 32.768 tokens por par consulta/documento |
| Tipos de cuantización | no disponible (pesos publicados en FP32; se documenta evaluación en BF16 backbone + FP32 readout) |
| Idiomas soportados | inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo de 0,6 GB) |

## Arquitectura y entrenamiento

El modelo es un cross-encoder: codifica conjuntamente la consulta y el documento en una única secuencia y produce una puntuación de relevancia escalar no acotada. El backbone UltraBERT-150M consta de 24 capas de transformer con hidden size 768 y 6 cabezas de atención, con una longitud máxima de 32.768 tokens por par. La cabeza de salida es una regresión sobre la representación conjunta, entrenada con MSE frente a las puntuaciones de un profesor.

El ajuste fino se realizó sobre 5 millones de pares consulta-documento puntuados por destilación, usando el dataset cross-encoder/ettin-reranker-v1-data. El checkpoint publicado corresponde al paso 26.042, seleccionado por validación, con los pesos originales en FP32 sin modificar. El modelo requiere código personalizado (tag custom_code) y se integra en el ecosistema sentence-transformers.

## Capacidades

- Reordenación de resultados de búsqueda: puntúa pares consulta-documento y ordena los candidatos por relevancia.
- Puntuación de relevancia no acotada: la salida es un escalar continuo, útil para umbrales y calibración.
- Manejo de documentos largos: ventana de 32.768 tokens por par, sin truncamiento en la mayoría de casos.
- Integración con pipelines de recuperación: pensado para combinarse con recuperadores de primera fase como BM25.
- Compatibilidad con sentence-transformers y transformers.
- No dispone de generación de texto, tool calling, capacidades de agente ni multimodalidad.
- Cobertura monolingüe en inglés.

## Casos de uso

- Búsqueda documental empresarial: combinar BM25 o búsqueda vectorial con este reranker para reordenar los 100 mejores candidatos y mejorar el nDCG@10 en corpus técnicos o científicos.
- Atención al cliente con base de conocimiento: recuperar artículos relevantes de una FAQ o wiki interna y reordenarlos antes de pasarlos a un LLM generador, reduciendo alucinaciones por contexto irrelevante.
- Búsqueda legal y normativa: reordenar fragmentos de documentos largos gracias a la ventana de 32.768 tokens, evaluando el par completo sin perder secciones clave.
- RAG (generación aumentada por recuperación): actuar como segunda etapa del retriever para mejorar la precisión del contexto inyectado en el prompt de un modelo generativo.
- Búsqueda académica: reordenar resultados de motores sobre artículos científicos, con buen rendimiento observado en SciFact y TREC-COVID.
- Moderación y deduplicación de contenido: puntuar similitud semántica entre consultas y documentos para filtrar duplicados o resultados irrelevantes.
- Evaluación de sistemas de recuperación: usar las puntuaciones como señal de calidad en experimentos offline de IR.

## Benchmarks y rendimiento

Resultados declarados por el autor (no verificados de forma independiente), sobre BEIR con recuperación BM25 top-100 (BM25S Lucene, k1=1.2, b=0.75, rerank_k=100):

| Dataset | Métrica | FP32 | BF16 backbone + FP32 readout |
|---|---|---|---|
| SciFact (300 consultas) | nDCG@10 | 0,7619 | 0,7622 |
| SciFact | MRR@10 | 0,7305 | 0,7306 |
| SciFact | Recall@100 | 0,9127 | 0,9127 |
| NFCorpus (323 consultas) | nDCG@10 | 0,3534 | 0,3533 |
| NFCorpus | MRR@10 | 0,5791 | 0,5792 |
| NFCorpus | Recall@100 | 0,2469 | 0,2469 |
| TREC-COVID (50 consultas) | nDCG@10 | 0,8143 | 0,8134 |
| TREC-COVID | MRR@10 | 0,9900 | 0,9750 |
| TREC-COVID | Recall@100 | 0,1105 | 0,1105 |

La diferencia entre FP32 y BF16 es marginal en nDCG@10 y MRR@10, lo que sugiere que la inferencia en BF16 con readout en FP32 es viable sin pérdida apreciable de calidad.

## Requisitos de hardware

- VRAM estimada en FP32: aproximadamente 0,6 GB de pesos más activaciones; en la práctica cabe en cualquier GPU con 4 GB o más.
- VRAM estimada en BF16: aproximadamente 0,3 GB de pesos, holgado incluso en GPUs integradas o de gama baja.
- GPU recomendadas: RTX 4090, A100, H100 para alto throughput; RTX 3060/4060 y similares para uso en producción de baja concurrencia.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU moderna; también es viable en CPU para volúmenes moderados.
- Despliegue: transformers, sentence-transformers, vLLM (si soporta el custom code), TGI, llama.cpp (solo si se generan pesos GGUF, no disponible de forma oficial).
- Latencia y throughput: no disponibles en la información proporcionada; al ser un cross-encoder, el coste escala linealmente con el número de pares a reordenar.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| ultrabert-150m-reranker | 151,6M | 32.768 | Apache 2.0 | Cross-encoder destilado, inglés |
| Alternativas de la misma categoría | no disponible | no disponible | no disponible | No se dispone de datos comparativos verificados en la información proporcionada |

No se han publicado comparaciones directas con otros rerankers en la información disponible; los benchmarks del autor solo reportan resultados propios sobre BEIR.

## Limitaciones y advertencias

- Modelo monolingüe en inglés: no soporta consultas ni documentos en castellano u otros idiomas.
- Riesgo de alucinación no aplica en sentido generativo, pero las puntuaciones de relevancia pueden ser erróneas en dominios alejados de los datos de entrenamiento.
- Resultados de benchmarks declarados por el autor y marcados como no verificados (verified: false); deben tratarse con cautela.
- Rendimiento desigual entre datasets: nDCG@10 de 0,35 en NFCorpus frente a 0,81 en TREC-COVID, lo que indica sensibilidad al dominio.
- Requiere código personalizado (custom_code), lo que puede complicar el despliegue en frameworks estándar.
- Licencia Apache 2.0 permite uso comercial, pero conviene revisar las condiciones del backbone base dmis-lab/UltraBERT-150M.
- Publicación muy reciente y sin tracción comunitaria (0 descargas, 0 likes), por lo que no hay validación externa ni reportes de producción.
- El coste computacional crece linealmente con el número de pares reordenados; no sustituye a un recuperador de primera fase.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ericlewis/ultrabert-150m-reranker
- Backbone base: https://huggingface.co/dmis-lab/UltraBERT-150M
- Dataset de entrenamiento: https://huggingface.co/datasets/cross-encoder/ettin-reranker-v1-data
- Artefactos de evaluación BEIR (FP32 y BF16): https://huggingface.co/ericlewis/ultrabert-150m-reranker/tree/cb87d8d991b3b46d465fd9884de3c2282846df26
- Paper o blog del autor: no disponible
- Repositorio de código: no disponible
- Demo: no disponible
