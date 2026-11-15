# Kervyn-AI/Kervyn-Rerank-100M-Preview

## Resumen

Kervyn Rerank 100M · Preview es un cross-encoder de reordenación (reranker) desarrollado por Kervyn-AI. Su función es recibir un par formado por una consulta y un pasaje de texto, y devolver una puntuación de relevancia que permite reordenar los resultados de cualquier buscador (denso, BM25 o híbrido) para colocar el pasaje correcto en primera posición. Está construido sobre arquitectura ModernBERT con 104.468.737 parámetros totales, lo que lo sitúa en la gama de modelos ligeros aptos para inferencia en CPU.

El modelo es propio: arquitectura, tokenizer y pesos entrenados desde cero por Kervyn-AI, sin herencia de licencias de terceros, y se distribuye bajo licencia Apache-2.0. Soporta español, inglés y consultas cruzadas entre ambos idiomas, lo que lo hace especialmente interesante para sistemas de recuperación de información (RAG, motores de búsqueda internos) que operen en entornos bilingües.

Esta versión es una preview pública: los pesos pueden cambiar en futuras revisiones, y el autor recomienda fijar `revision="v1"` para reproducibilidad. Su relevancia actual radica en que ofrece una alternativa compacta a rerankers multilingües más pesados (como bge-reranker-v2-m3, de 568M parámetros), con mejoras medias de nDCG@10 declaradas sobre top-20 y un rendimiento en CPU notablemente superior.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ModernBERT, cross-encoder (text-ranking) |
| Parametros totales | 104.468.737 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 512 tokens (pregunta + pasaje combinados); la pregunta se recorta a 400 caracteres |
| Tipos de cuantizacion | no disponible en la informacion proporcionada |
| Idiomas soportados | es, en (y consultas cruzadas es↔en) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (librería sentence-transformers) |

## Arquitectura y entrenamiento

El modelo es un cross-encoder basado en ModernBERT. A diferencia de los bi-encoders (que codifican consulta y documento por separado), el cross-encoder procesa conjuntamente la pregunta y el pasaje, lo que permite capturar interacciones token a token entre ambos y produce puntuaciones de relevancia más precisas a costa de no poder precomputar representaciones. La cabeza de salida devuelve una puntuación escalar por par (más alta = más relevante).

El entrenamiento se realizó desde cero (arquitectura, tokenizer y pesos propios) sobre una mezcla de datasets que incluye corpus web y educativos (FineWeb-2, FineWeb-Edu), Wikipedia, colecciones de recuperación y QA en inglés y español (MS MARCO BM25, ms-marco-es-500k, Natural Questions, GooAQ, SQuAD, ELI5, SQAC), datos de NLI (all-nli), pares de traducción (parallel-sentences-talks), código (CodeSearchNet) y preguntas/respuestas de StackExchange. La model card no detalla el número exacto de tokens de entrenamiento ni si se aplicaron etapas de RLHF o DPO; esa información no está disponible.

La innovación destacable no es arquitectónica sino de eficiencia: consigue, según el autor, una media de nDCG@10 superior a bge-reranker-v2-m3 con 5 veces menos parámetros y 2,8 veces menos latencia en CPU, y evita el deterioro típico en dominios de código que sufren otros rerankers multilingües.

## Capacidades

- Reordenación de resultados de búsqueda: puntúa pares (consulta, pasaje) para reordenar un top-k recuperado por cualquier motor (denso, BM25 o híbrido).
- Soporte bilingüe español-inglés, incluyendo consultas en un idioma con pasajes en el otro.
- Recuperación de información sobre documentos largos troceados (chunks de ~200 palabras recomendados en la model card).
- Buen comportamiento en dominios técnicos y de código: el autor reporta que sube CodeSearchNet a 91,7 frente a la caída a 82,8 de bge-reranker-v2-m3.
- Ajuste fino (fine-tuning) con datos propios mediante el flujo estándar de sentence-transformers, incluyendo minería de negativos duros con `mine_hard_negatives`.
- Integración con el ecosistema sentence-transformers (`CrossEncoder`) y con Text Embeddings Inference (tag `text-embeddings-inference`).
- No es un modelo generativo: no produce texto, no soporta tool calling, ni razonamiento multi-step, ni visión, ni audio. Su única salida es una puntuación de relevancia por par.

## Casos de uso

- Reordenación en pipelines RAG: tras la recuperación densa con un embedder (por ejemplo, Kervyn Embeddings 100M), el reranker reordena el top-20 para que el fragmento correcto llegue al LLM generador, reduciendo alucinaciones por contexto irrelevante. Adecuado por su bajo coste en CPU y su ventana de 512 tokens por par.
- Buscadores internos de empresa bilingües: indexación de documentación en español e inglés con reordenación cruzada, útil en organizaciones con documentación mixta donde una consulta en castellano debe recuperar pasajes en inglés.
- Atención al cliente sobre base de conocimiento: reordenar respuestas candidatas a preguntas frecuentes (devoluciones, facturación, plazos) antes de mostrarlas o pasarlas a un agente generativo.
- Búsqueda de código en repositorios: localizar funciones o fragmentos relevantes a partir de una descripción en lenguaje natural, aprovechando su comportamiento estable en CodeSearchNet frente a rerankers genéricos que degradan este dominio.
- Ajuste fino por dominio en infraestructura propia: al tener 104M parámetros, el fine-tuning completo cabe en una GPU de consumo y los datos no salen de la infraestructura del cliente; la licencia Apache-2.0 permite conservar el modelo ajustado.
- Sistemas de soporte técnico y foros: reordenar hilos de StackExchange o tickets históricos para sugerir soluciones previas antes de abrir uno nuevo.
- Evaluación y monitorización de calidad de recuperación: usar las puntuaciones del cross-encoder como señal para medir y comparar configuraciones de buscadores (BM25 vs denso vs híbrido) en producción.

## Benchmarks y rendimiento

Los datos publicados en la model card son métricas de nDCG@10 sobre top-20, comparando con bge-reranker-v2-m3:

| Metrica | Kervyn Rerank 100M | bge-reranker-v2-m3 |
|---|---|---|
| Media de búsqueda sobre Kervyn Embeddings | 94,45 | 94,23 |
| Media de búsqueda sobre bge-m3 | 94,67 | 94,18 |
| CodeSearchNet (nDCG@10) | 91,7 | 82,8 |
| Parametros | 104M | 568M |
| Tiempo de reordenacion de top-20 (8 vCPU) | 2,5 s | 7,1 s |

Mejora media declarada sobre cualquier buscador: de +2,9 a +3,7 puntos de nDCG@10. No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks generativos en la información disponible, ya que el modelo no es generativo.

## Requisitos de hardware

- VRAM estimada para inferencia: en FP32, aproximadamente 0,42 GB de pesos; en FP16/BF16, ~0,21 GB. Con overhead de activaciones y batch pequeño, cabe holgadamente en menos de 2 GB de VRAM.
- GPU recomendadas: cualquier GPU con al menos 2-4 GB de VRAM es suficiente (RTX 3060, RTX 4060, T4, L4). Para alto throughput, A10G, L4 o A100/H100 con batching grande.
- Cabe en GPU de consumo: sí, en cualquier GPU consumer moderna, e incluso en CPU para cargas moderadas.
- CPU: el autor reporta 2,5 s para reordenar un top-20 con 8 vCPU, frente a 7,1 s de bge-reranker-v2-m3.
- Opciones de despliegue: sentence-transformers (`CrossEncoder`), Text Embeddings Inference (tag `text-embeddings-inference`), y compatible con endpoints de Hugging Face. No se menciona soporte GGUF/llama.cpp en la información disponible.
- Throughput: no disponible más allá del dato de latencia en CPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Notas |
|---|---|---|---|---|---|
| Kervyn Rerank 100M · Preview | 104M | 512 tokens (par) | Cross-encoder ModernBERT | Apache-2.0 | Bilingüe es/en, mejor media nDCG@10 declarada que bge-reranker-v2-m3, 2,8x más rápido en CPU |
| bge-reranker-v2-m3 | 568M | 8192 tokens | Cross-encoder (XLM-RoBERTa) | MIT (según el modelo original) | Multilingüe amplio, más pesado, degrada en código según el autor |
| Kervyn Embeddings 100M · Preview | ~100M | no disponible | Bi-encoder | Apache-2.0 | Modelo pareja para la etapa de recuperación densa |
| bge-m3 | 568M | 8192 tokens | Bi-encoder multilingüe | MIT | Usado como buscador base en la comparativa del autor |

## Limitaciones y advertencias

- Es una versión preview: los pesos pueden cambiar en revisiones futuras; fijar `revision="v1"` para reproducibilidad en producción.
- Ventana de 512 tokens por par (pregunta + pasaje): los pasajes largos deben trocearse; la pregunta se recorta a 400 caracteres, lo que limita consultas muy extensas.
- Solo español e inglés: no hay soporte declarado para otras lenguas, por lo que no es adecuado como reranker multilingüe general.
- No es generativo: no puede usarse para responder preguntas, resumir ni generar texto; solo puntúa relevancia.
- Riesgo de sesgo: al entrenarse sobre corpus web (FineWeb-2, FineWeb-Edu) y StackExchange, puede heredar sesgos de esos datos; la model card no documenta evaluaciones de sesgo.
- Riesgo de alucinación no aplica directamente (no genera texto), pero sí puede producir falsos positivos/negativos en la puntuación de relevancia en dominios alejados de los datos de entrenamiento.
- Licencia Apache-2.0: permite uso comercial y modificación; no se identifican restricciones adicionales en la información disponible.
- Los benchmarks publicados son del propio autor y no han sido replicados de forma independiente en la información disponible; conviene validar con un conjunto de evaluación propio antes de adoptarlo en producción.
- Sin descargas ni likes en el momento de la consulta: ecosistema y soporte comunitario aún incipientes.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Kervyn-AI/Kervyn-Rerank-100M-Preview
- Modelo pareja (embeddings): https://huggingface.co/Kervyn-AI/Kervyn-Embeddings-100M-Preview
- Librería sentence-transformers: https://sbert.net
- Documentación de CrossEncoder: https://sbert.net/docs/cross_encoder/usage/usage.html
- Text Embeddings Inference: https://github.com/huggingface/text-embeddings-inference
- Dataset MS MARCO español (dariolopez/ms-marco-es-500k): https://huggingface.co/datasets/dariolopez/ms-marco-es-500k
- Dataset SQAC (PlanTL-GOB-ES): https://huggingface.co/datasets/PlanTL-GOB-ES/SQAC
- FineWeb-2: https://huggingface.co/datasets/HuggingFaceFW/fineweb-2
