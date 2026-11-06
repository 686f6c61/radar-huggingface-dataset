# ElyKok/hebrew-qa-retriever-e5-large-nofilter

## Resumen

`hebrew-qa-retriever-e5-large-nofilter` es un modelo de recuperación densa (retrieval) para hebreo, desarrollado por el usuario independiente ElyKok. Se trata de un fine-tuning de `intfloat/multilingual-e5-large` (arquitectura XLM-RoBERTa, 559.890.432 parámetros) especializado en una tarea concreta: dada una pregunta en hebreo, devolver el párrafo de un corpus que contiene la respuesta. Forma parte de un sistema RAG en tres etapas (búsqueda híbrida con BM25, reranker afinado y un LLM generador).

El modelo resuelve un problema concreto de la comunidad NLP en hebreo: los retrievers multilingües genéricos rinden de forma mediocre en recuperación de respuestas sobre Wikipedia hebrea y prensa tecnológica. El fine-tuning se hizo sobre las 19.654 preguntas respondibles del dataset HeQ, y el autor reporta una mejora sustancial en R@1 (de 72,4 a 80,7) frente al modelo base.

Es relevante ahora porque la recuperación en idiomas de recursos medios sigue siendo el cuello de botella de los pipelines RAG en producción, y este modelo demuestra que un ajuste ligero (una época, T4 única) con negativos duros minados puede superar a un modelo multilingüe mucho más genérico. La licencia MIT facilita su uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | XLM-RoBERTa (transformer encoder), base `intfloat/multilingual-e5-large` |
| Parametros totales | 559.890.432 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el autor recomienda párrafos de 100-200 palabras) |
| Tipos de cuantizacion | no disponible (pesos safetensors en fp32/fp16; compatible con cuantización estándar de sentence-transformers, no documentada por el autor) |
| Idiomas soportados | hebreo (`he`) |
| Licencia | MIT |
| Formato de pesos | safetensors (repo de 2,3 GB) |

## Arquitectura y entrenamiento

Es un encoder transformer XLM-RoBERTa derivado de `multilingual-e5-large`, usado como modelo de embeddings de frases mediante `sentence-transformers`. La salida es un vector normalizado por consulta y por pasaje, y la similitud se calcula con producto escalar. Mantiene la convención de prefijos del modelo base: `query: ` para preguntas y `passage: ` para pasajes.

El entrenamiento usó `CachedMultipleNegativesRankingLoss` con negativos en batch más 2 negativos duros minados por pregunta, batch size 64 y gradient caching en una sola GPU T4. Los negativos duros se obtuvieron con el modelo base sin afinar: se recuperaban los párrafos de entrenamiento más similares y se elegían 2 al azar entre los 15 primeros (excluyendo el correcto). Una época, learning rate 1e-5, 10 % de warmup y un sampler que evita duplicados en el batch.

La innovación declarada es el sufijo «nofilter»: a diferencia de la práctica habitual, no se excluyeron candidatos potencialmente falsos negativos (párrafos del mismo artículo o mejor rankeados). En una comparación controlada con los mismos datos, semilla y ajustes, aplicar ese filtro bajó R@1 de 80,7 a 78,9, de modo que el autor decidió no aplicarlo.

## Capacidades

- Generación de embeddings de frases para búsqueda semántica en hebreo (pipeline `sentence-similarity`).
- Recuperación de respuestas: localiza el párrafo que responde a una pregunta, no genera texto.
- Soporte de búsqueda híbrida: pensado para combinarse con BM25 mediante Reciprocal Rank Fusion (RRF).
- Integración en pipelines RAG de dos etapas (retriever + reranker) y tres etapas (con LLM generador).
- Compatible con Text Embeddings Inference (tag `text-embeddings-inference`) y con endpoints compatibles.
- Normalización de embeddings para usar producto escalar como similitud coseno.
- No soporta tool calling, agentes, visión, audio ni modo de razonamiento: es exclusivamente un encoder de recuperación.

## Casos de uso

- RAG sobre Wikipedia hebrea: indexar los 4.930 párrafos del corpus HeQ (o un corpus mayor) y recuperar los candidatos relevantes antes de pasar por el reranker y el LLM generador.
- Atención al cliente en hebreo: construir una base de conocimiento de artículos de ayuda y recuperar el fragmento exacto que responde a la consulta del usuario, reduciendo el contexto que se envía al LLM.
- Búsqueda documental interna: indexar documentación técnica o legal en hebreo y ofrecer búsqueda semántica que funcione mejor que la búsqueda por palabras clave cuando la terminología varía.
- Sistemas de preguntas y respuestas sobre prensa tecnológica: el modelo se entrenó también con Geektime, por lo que es adecuado para corpus de artículos tecnológicos en hebreo.
- Recuperación híbrida en producción: combinar este retriever con BM25 mediante RRF, escenario en el que el autor reporta R@1 de 83,3 frente a 80,7 del modelo solo.
- Filtrado previo en pipelines de moderación o curación de contenido: usar la similitud semántica para agrupar o deduplicar pasajes en hebreo.
- Evaluación comparativa de retrievers: servir como baseline afinado frente a modelos multilingües genéricos en experimentos de recuperación en hebreo.

## Benchmarks y rendimiento

Conjunto de test HeQ: 1.072 preguntas, cada una buscada contra los 4.930 párrafos del corpus. Los artículos de test son disjuntos de los de entrenamiento.

| Modelo | R@1 | R@5 | R@10 | MRR@10 | NDCG@10 |
|---|---|---|---|---|---|
| BM25 (búsqueda por palabras clave) | 73,1 | 86,8 | 89,8 | 79,0 | 81,7 |
| multilingual-e5-large (base) | 72,4 | 87,8 | 91,2 | 79,0 | 82,0 |
| **Este modelo** | **80,7** | **92,2** | **95,0** | **85,9** | **88,1** |
| Híbrido: BM25 + este modelo (RRF) | 83,3 | 93,4 | 95,5 | 87,6 | 89,5 |
| Híbrido + reranker afinado | 93,9 | 97,2 | 97,4 | 95,4 | 95,9 |

## Requisitos de hardware

- VRAM estimada para inferencia: unos 2,2 GB en fp16 (559,9 M de parámetros); en fp32, unos 4,5 GB contando overhead de activaciones y tokenizador.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para fp16. El autor entrenó en una T4, lo que da una idea del perfil de recursos.
- Cabe en GPU de consumo: sí, en RTX 3060, RTX 4060, RTX 4090 y similares; también en CPU para volúmenes moderados.
- Opciones de despliegue: `sentence-transformers`, Text Embeddings Inference (tag oficial en el repo), endpoints compatibles, y exportación a ONNX o cuantización vía las herramientas estándar de sentence-transformers. No hay pesos GGUF publicados.
- Latencia y throughput: no disponible (no se han publicado mediciones).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | R@1 en HeQ | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo | 559,9 M | no disponible | 80,7 | MIT | Hugging Face |
| intfloat/multilingual-e5-large (base) | 559,9 M | no disponible | 72,4 | MIT | Hugging Face |
| BM25 (referencia léxica) | n/a | n/a | 73,1 | n/a | Librería estándar |
| Fine-tuned reranker de ElyKok (etapa 2) | no disponible | no disponible | 93,9 (en pipeline híbrido) | no disponible | Hugging Face |

No se dispone de datos de otros retrievers densos específicos para hebreo en la información proporcionada.

## Limitaciones y advertencias

- Las preguntas de HeQ fueron escritas por anotadores que veían el párrafo, por lo que comparten más vocabulario con él que las consultas reales de usuarios; el rendimiento en producción probablemente será inferior al de los benchmarks.
- Los datos de entrenamiento y test provienen de Wikipedia hebrea y Geektime; las mejoras sobre otros registros (hebreo rabínico o literario) serán previsiblemente menores.
- Es un modelo exclusivamente de recuperación: no genera respuestas ni razona; cualquier uso generativo requiere un LLM adicional.
- Solo soporta hebreo; no debe usarse como retriever multilingüe aunque herede esa capacidad del modelo base.
- Riesgo de falsos negativos en el corpus: al no filtrar candidatos durante el entrenamiento, el modelo puede haber aprendido a puntuar alto pasajes del mismo artículo que no contienen la respuesta.
- Licencia MIT: permite uso comercial sin restricciones, pero el dataset HeQ (creado por Webiks para MAFAT) está bajo CC BY 4.0 y exige atribución si se redistribuye.
- No hay datos publicados sobre latencia, throughput ni comportamiento con contextos superiores a 200 palabras.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ElyKok/hebrew-qa-retriever-e5-large-nofilter
- Modelo base: https://huggingface.co/intfloat/multilingual-e5-large
- Reranker del mismo autor: https://huggingface.co/ElyKok/hebrew-qa-reranker
- Dataset HeQ: https://github.com/NNLP-IL/Hebrew-Question-Answering-Dataset
- Repositorio del proyecto: GITHUB_URL (marcador sin resolver en la model card)
- Demo: SPACE_URL (marcador sin resolver en la model card)
