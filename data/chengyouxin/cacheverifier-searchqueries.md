# ChengyouXin/cacheverifier-searchqueries

## Resumen

`cacheverifier-searchqueries` es un cross-encoder de reordenamiento (reranker) especializado en verificar si una respuesta cacheada de un LLM sigue siendo correcta para una nueva consulta. Lo desarrolla ChengyouXin como parte de la investigación "Synchronous Online Verification Gating in Semantic Caches", que sostiene el servicio CacheVerifier: una capa de verificación que se interpone entre una caché semántica y el usuario para evitar servir respuestas obsoletas o incorrectas.

Técnicamente es un fine-tuning de `cross-encoder/ms-marco-MiniLM-L6-v2`, un transformer BERT de tipo `BertForSequenceClassification` con 22.713.601 parámetros (aproximadamente 22,7 M) y una ventana máxima de 512 tokens. Recibe pares de textos (consulta y respuesta candidata) y emite una puntuación escalar que indica la idoneidad de la respuesta para esa consulta. El entrenamiento se realizó con la librería `sentence-transformers` sobre 60.398 ejemplos y función de pérdida `BinaryCrossEntropyLoss`.

Su relevancia es acotada pero específica: las cachés semánticas de LLM ahorran coste y latencia, pero pueden devolver una respuesta que se parecía a la consulta sin serlo. Este modelo actúa como verificador barato (22,7 M de parámetros) para filtrar esos aciertos falsos antes de servirlos. La licencia es `all-rights-reserved` y el checkpoint se publica únicamente para reproducir los resultados del paper.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Cross-encoder basado en BERT (`BertForSequenceClassification`), tarea de clasificación de secuencias con una etiqueta de salida |
| Parámetros totales | 22.713.601 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 512 tokens (longitud máxima de secuencia) |
| Tipos de cuantización | no disponible (no se documentan cuantizaciones publicadas) |
| Idiomas soportados | no disponible |
| Licencia | all-rights-reserved (`license: other`); el modelo base se entrenó con MS MARCO, de uso solo para investigación no comercial |
| Formato de pesos | safetensors (repo de 0,2 GB) |

## Arquitectura y entrenamiento

El modelo es un cross-encoder puro: un encoder BERT que procesa conjuntamente el par (consulta, respuesta) y produce un único logit de relevancia mediante una cabeza de clasificación. La arquitectura declarada en la model card es `CrossEncoder(Transformer({'transformer_task': 'sequence-classification', ... 'architecture': 'BertForSequenceClassification'}))`, con una sola etiqueta de salida. Al ser un cross-encoder, no genera embeddings reutilizables por separado: la puntuación depende del par completo, lo que encarece el cómputo por candidato pero mejora la precisión frente a un bi-encoder en tareas de ranking fino.

El fine-tuning parte de `cross-encoder/ms-marco-MiniLM-L6-v2` y se ejecutó con la librería `sentence-transformers`, usando `BinaryCrossEntropyLoss` sobre 60.398 ejemplos (según los metadatos del repo). No se documentan en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset, ni si hubo etapas de RLHF o DPO. Tampoco se detalla ninguna innovación arquitectónica propia: la novedad del trabajo está en el sistema de verificación (el *gating* síncrono sobre cachés semánticas), no en el modelo en sí.

## Capacidades

- Puntuación de pares (consulta, respuesta): devuelve un score escalar de idoneidad, útil para reordenar o filtrar candidatos.
- Reordenamiento (reranking) de respuestas candidatas para una misma consulta mediante `model.rank()`.
- Verificación de respuestas cacheadas: función principal para la que fue entrenado, decidir si una respuesta almacenada sigue siendo válida para una consulta nueva.
- Clasificación binaria implícita: el score puede umbralizarse para aceptar o rechazar una respuesta.
- Integración con `sentence-transformers` y con `text-embeddings-inference` (tag `endpoints_compatible`).
- No soporta tool calling, function calling, agentes, visión, audio ni modo de razonamiento explícito: es un modelo de ranking de texto, no generativo.
- Capacidades multilingües: no documentadas; el modelo base está entrenado sobre MS MARCO en inglés, por lo que el rendimiento fuera del inglés es incierto.

## Casos de uso

- Verificación de caché semántica en producción: antes de servir una respuesta cacheada a una consulta entrante, se puntúa el par con este cross-encoder; si el score cae por debajo de un umbral, se invalida la caché y se llama al LLM. Es el caso de uso central del modelo y para el que fue entrenado.
- Reducción de coste en APIs de LLM: al filtrar aciertos falsos de caché, se evitan respuestas erróneas sin renunciar al ahorro de llamadas al modelo grande.
- Reordenamiento de resultados de búsqueda o de FAQ: dado un conjunto de respuestas candidatas, `model.rank()` las ordena por relevancia respecto a la consulta del usuario.
- Deduplicación semántica de respuestas: puntuar pares de respuestas para detectar duplicados o respuestas que cubren la misma intención.
- Enrutamiento de consultas: usar el score para decidir si una consulta puede resolverse con una respuesta preexistente o requiere generación nueva.
- Evaluación offline de sistemas de caché: medir la tasa de aciertos verdaderos y falsos de una caché semántica sobre un conjunto de pares etiquetados, usando el modelo como juez barato.
- Filtro previo en pipelines RAG: descartar pasajes recuperados que no responden realmente a la pregunta antes de pasarlos al generador.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja, en torno a 100-200 MB en fp32 para los 22,7 M de parámetros, más el overhead del runtime; cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: no requiere GPU dedicada; funciona en CPU con latencia aceptable para volúmenes moderados. Para alto throughput, cualquier GPU moderna (RTX 3060 en adelante) es suficiente.
- Cabe en GPU consumer: sí, en cualquier modelo con al menos 1 GB de VRAM, e incluso en CPU.
- Opciones de despliegue: `sentence-transformers` (CrossEncoder), `text-embeddings-inference` (tag `endpoints_compatible`), y despliegue en Hugging Face Endpoints.
- Latencia y throughput estimados: no disponibles en la información proporcionada; al ser un BERT MiniLM de 6 capas, la latencia por par debería ser de pocos milisegundos en GPU, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `ChengyouXin/cacheverifier-searchqueries` | 22,7 M | 512 tokens | Verificación/reranking de pares consulta-respuesta | all-rights-reserved | Hugging Face |
| `cross-encoder/ms-marco-MiniLM-L6-v2` (base) | ~22,7 M | 512 tokens | Reranking de pasajes MS MARCO | Apache-2.0 (según el modelo base original) | Hugging Face |
| `cross-encoder/ms-marco-MiniLM-L12-v2` | ~33 M | 512 tokens | Reranking de pasajes MS MARCO | Apache-2.0 | Hugging Face |
| `BAAI/bge-reranker-base` | ~278 M | 512 tokens | Reranking multilingüe | MIT | Hugging Face |

La comparativa se limita a alternativas de la misma categoría (cross-encoders de reranking); no se dispone de datos de rendimiento comparativo entre ellas en la información proporcionada.

## Limitaciones y advertencias

- Licencia `all-rights-reserved`: no se permite uso comercial. El checkpoint se publica solo para reproducir los resultados del paper, y el modelo base (MS MARCO) restringe el uso a investigación no comercial.
- Ventana de 512 tokens: consultas o respuestas más largas se truncan, lo que puede degradar la verificación en contextos extensos.
- Idioma no documentado: el modelo base está entrenado en inglés; su comportamiento en castellano u otros idiomas no está validado.
- Riesgo de falsos negativos y positivos en la verificación: un umbral mal calibrado puede invalidar respuestas correctas (coste extra) o aceptar respuestas incorrectas (peor caso).
- Sesgos heredados de MS MARCO: el dataset de origen tiene sesgos de dominio y de estilo de consulta que pueden trasladarse al verificador.
- No es un modelo generativo: no produce texto, solo puntuaciones; no debe usarse como sustituto de un LLM.
- Sin datos de benchmarks publicados: no hay evidencia cuantitativa de su rendimiento frente a alternativas, lo que dificulta justificar su elección en producción.
- Naturaleza específica del dominio: entrenado para verificación de caché de respuestas de LLM; su rendimiento en tareas genéricas de ranking no está garantizado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ChengyouXin/cacheverifier-searchqueries
- Repositorio de la investigación (CacheVerifier): https://github.com/imxinchengyou/CacheVerifier
- Documento de licencias de modelos preentrenados: https://github.com/imxinchengyou/CacheVerifier/blob/main/results/PRETRAINED_MODELS.md
- Servicio CacheVerifier: https://www.cacheverifier.com
- Modelo base: https://huggingface.co/cross-encoder/ms-marco-MiniLM-L6-v2
- Documentación de Sentence Transformers: https://sbert.net
- Documentación de Cross Encoder: https://www.sbert.net/docs/cross_encoder/usage/usage.html
- Repositorio de Sentence Transformers: https://github.com/huggingface/sentence-transformers
- Cross Encoders en Hugging Face: https://huggingface.co/models?library=sentence-transformers&other=cross-encoder
- Paper de referencia (arXiv 1908.10084): https://arxiv.org/abs/1908.10084
- Perfil del autor: https://huggingface.co/ChengyouXin
