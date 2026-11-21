# Alibaba-NLP/gte-multilingual-reranker-base

## Resumen

gte-multilingual-reranker-base es un modelo de reranking (reordenación de resultados de búsqueda) desarrollado por Alibaba-NLP, el primer reranker de la familia GTE. Su función es recibir un par consulta-documento y asignar una puntuación de relevancia, lo que lo convierte en la segunda etapa de un pipeline de recuperación de información (retrieval-augmented generation, búsqueda semántica, etc.) tras un primer filtrado con embeddings.

Frente a los rerankers basados en LLMs decoder-only (como gte-qwen2-1.5b-instruct), este modelo emplea una arquitectura transformer encoder-only de 306M parámetros, lo que reduce drásticamente los requisitos de hardware y multiplica por diez la velocidad de inferencia según el autor. Soporta contextos de hasta 8192 tokens y cubre más de 70 idiomas, incluido el castellano.

Es relevante ahora porque permite montar pipelines RAG multilingües con una calidad de reordenación alta sobre hardware modesto, con licencia Apache 2.0 y soporte nativo en `transformers` (a partir de la versión 5.18.0), además de integración lista para producción con Text Embeddings Inference (TEI) e Infinity.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-only (familia GTE, text-classification / cross-encoder) |
| Parametros totales | 305.959.681 (306M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 8192 tokens |
| Tipos de cuantizacion | no disponible de forma explícita; el ejemplo oficial usa float16 y los despliegues TEI/Infinity soportan bfloat16 |
| Idiomas soportados | más de 70 (af, ar, az, be, bg, bn, ca, ceb, cs, cy, da, de, el, en, es, et, eu, fa, fi, fr, gl, gu, he, hi, hr, ht, hu, hy, id, is, it, ja, jv, ka, kk, km, kn, ko, ky, lo, lt, lv, mk, ml, mn, mr, ms, my, ne, nl, no, pa, pl, pt, qu, ro, ru, si, sk, sl, so, sq, sr, sv, sw, ta, te, th, tl, tr, uk, ur, vi, yo, zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un cross-encoder basado en una arquitectura transformer encoder-only, lo que le permite procesar conjuntamente la consulta y el documento en una sola pasada y emitir una puntuación de relevancia (logit) por par. Esta decisión de diseño contrasta con los rerankers construidos sobre LLMs decoder-only: al ser encoder-only, el modelo es mucho más pequeño (306M parámetros frente a 1.5B o más) y, según el autor, ofrece un aumento de 10x en velocidad de inferencia con menores requisitos de hardware.

El entrenamiento se describe en el paper mGTE (arXiv:2407.19669), que presenta modelos generalizados de representación y reranking de contexto largo para recuperación multilingüe. La model card no detalla el número exacto de tokens de entrenamiento, la composición del dataset ni si se emplearon técnicas de RLHF o DPO; esa información debe consultarse en el paper. El modelo soporta longitudes de hasta 8192 tokens y está diseñado para tareas de retrieval multilingüe y evaluaciones multi-tarea de modelos de representación.

## Capacidades

- Reranking de pares consulta-documento: asigna una puntuación de relevancia a cada par, apta para reordenar resultados de un primer retrieval.
- Recuperación multilingüe: cubre más de 70 idiomas, incluidos castellano, catalán, euskera y gallego.
- Contexto largo: procesa textos de hasta 8192 tokens, útil para documentos extensos o fragmentos largos.
- Clasificación de texto: la pipeline declarada es `text-ranking` y el modelo se carga como `AutoModelForSequenceClassification`.
- Integración con tooling de producción: compatible con Text Embeddings Inference (TEI), Infinity y sentence-transformers.
- Aceleración nativa: soporte de PyTorch SDPA y Flash Attention 2 con `transformers>=5.18.0` sin código personalizado.
- No es un modelo generativo: no produce texto, tool calling ni razonamiento multi-paso; su única salida es una puntuación de relevancia.

## Casos de uso

- RAG (retrieval-augmented generation): tras recuperar los N documentos más similares con un modelo de embeddings, el reranker reordena esos candidatos y se envían solo los más relevantes al LLM generador, reduciendo ruido y coste de contexto.
- Búsqueda semántica en bases documentales multilingües: en un corpus con documentos en castellano, inglés y otros idiomas, el modelo puntúa pares consulta-documento de forma consistente entre idiomas gracias a su cobertura de más de 70 lenguas.
- Atención al cliente con base de conocimiento: reordenar artículos de ayuda recuperados para una consulta de usuario antes de componer la respuesta, con latencia baja al ser un encoder de 306M.
- Búsqueda en documentación técnica y código: el ejemplo oficial incluye pares como "how to implement quick sort in python?" frente a "Introduction of quick sort", lo que lo hace útil para localizar fragmentos relevantes en documentación de desarrollo.
- Filtrado de resultados en motores de búsqueda internos: como segunda etapa de un pipeline híbrido (BM25 + embeddings + reranker) para mejorar la precisión de los primeros resultados.
- Deduplicación y priorización de contenido: puntuar la relevancia de noticias, tickets o incidencias frente a una consulta para ordenar colas de trabajo.
- Evaluación de calidad de recuperación: usar las puntuaciones como señal para medir y ajustar pipelines de retrieval en experimentos offline.

## Benchmarks y rendimiento

La model card indica que el modelo alcanza resultados state-of-the-art en tareas de retrieval multilingüe y evaluaciones multi-tarea de modelos de representación frente a rerankers de tamaño similar, y remite a una figura (`images/mgte-reranker.png`) y al paper (arXiv:2407.19669) para los resultados detallados. No se incluyen cifras numéricas de benchmarks (MMLU, HumanEval, nDCG, MRR, etc.) en la información proporcionada.

No se han publicado resultados de benchmarks numéricos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 306M parámetros, en float16 los pesos ocupan aproximadamente 0,6 GB; en bfloat16, lo mismo. El repo completo pesa 1,2 GB.
- Cabe holgadamente en GPU de consumo: cualquier GPU con 4 GB o más de VRAM (RTX 3060, RTX 4060, RTX 4090, etc.) puede ejecutarlo con comodidad.
- GPU recomendadas para producción: A100, H100, L40S o RTX 4090 para lotes grandes; el modelo es lo bastante pequeño como para que el cuello de botella sea el throughput de tokens del par consulta-documento, no la memoria.
- CPU: TEI ofrece imagen de CPU (`ghcr.io/huggingface/text-embeddings-inference:cpu-1.7`), viable para cargas moderadas.
- Opciones de despliegue: Text Embeddings Inference (TEI) con ruta `/rerank`, Infinity (servidor REST con licencia MIT), sentence-transformers y `transformers` nativo (>=5.18.0).
- Latencia y throughput: el autor afirma un aumento de 10x en velocidad de inferencia frente a rerankers basados en LLMs decoder-only del orden de 1.5B; no se proporcionan cifras absolutas de latencia o throughput en la información disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Arquitectura | Licencia | Notas |
|---|---|---|---|---|---|
| Alibaba-NLP/gte-multilingual-reranker-base | 306M | 8192 | Encoder-only cross-encoder | Apache 2.0 | Reranker multilingüe (70+ idiomas), 10x más rápido que alternativas decoder-only según el autor |
| Alibaba-NLP/gte-qwen2-1.5b-instruct | 1.5B (no confirmado en esta ficha) | no disponible | Decoder-only LLM | no disponible | Reranker de la misma familia basado en LLM; mayores requisitos de hardware y menor velocidad según la model card |
| BAAI/bge-reranker-v2-m3 | no disponible | no disponible | Cross-encoder | no disponible | Alternativa multilingüe de reranking; datos no verificados en esta ficha |

No se dispone de datos de benchmarks comparativos numéricos en la información proporcionada para establecer una comparación cuantitativa fiable.

## Limitaciones y advertencias

- No es un modelo generativo: no produce texto, no soporta tool calling ni razonamiento multi-paso; solo emite puntuaciones de relevancia.
- La model card no detalla sesgos conocidos ni la composición del dataset de entrenamiento, por lo que no es posible evaluar sesgos específicos a partir de la información disponible.
- Riesgo de alucinación no aplicable en sentido estricto (no genera texto), pero las puntuaciones pueden ser poco fiables fuera de la distribución de datos de entrenamiento o en dominios muy especializados.
- Aunque declara más de 70 idiomas, la calidad puede variar entre ellos; no se aportan métricas por idioma en la información disponible.
- El contexto máximo es de 8192 tokens; pares consulta-documento que lo excedan requerirán truncado (TEI permite `truncate` y `truncation_direction`).
- Para versiones de `transformers` anteriores a 5.18.0 es necesario fijar `revision="8215cf0"` y usar `trust_remote_code=True`, lo que introduce dependencia de código remoto.
- Licencia Apache 2.0: permite uso comercial, pero conviene revisar las condiciones de los servicios en la nube de Alibaba, que no son idénticos a los modelos open source.
- En producción, el rendimiento depende del primer etapa de retrieval; un mal recall inicial no se corrige con el reranker.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Alibaba-NLP/gte-multilingual-reranker-base
- Paper mGTE: https://arxiv.org/pdf/2407.19669
- Colección GTE: https://huggingface.co/collections/Alibaba-NLP/gte-models-6680f0b13f885cb431e6d469
- Repositorio de implementación alternativa (new-impl): https://huggingface.co/Alibaba-NLP/new-impl
- Discusión sobre uso offline: https://huggingface.co/Alibaba-NLP/new-impl/discussions/2#662b08d04d8c3d0a09c88fa3
- PR de soporte nativo en transformers: https://github.com/huggingface/transformers/pull/48416
- Text Embeddings Inference: https://github.com/huggingface/text-embeddings-inference
- Especificación OpenAPI de TEI: https://huggingface.github.io/text-embeddings-inference/
- Infinity: https://github.com/michaelfeil/infinity
- API comercial de embeddings en Alibaba Cloud: https://help.aliyun.com/zh/model-studio/developer-reference/general-text-embedding/
- API comercial de reranking en Alibaba Cloud: https://help.aliyun.com/zh/model-studio/developer-reference/general-text-sorting-model/
