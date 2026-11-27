# cimo001/baai

## Resumen

`cimo001/baai` es una conversión a ONNX del modelo `bge-reranker-v2-m3` de BAAI, publicada por el usuario cimo001. Se trata de un reranker cross-encoder para ranking de texto: recibe un par (consulta, documento) y devuelve una puntuación de relevancia en el rango 0..1 tras aplicar sigmoid al logit de salida. El modelo se distribuye en dos variantes dentro del repositorio: FP32 (`model.onnx` junto con `model.onnx_data`) e INT8 cuantizada (`model_quantized.onnx`).

La relevancia de esta ficha es práctica: elimina la dependencia de `transformers` y `tokenizers` al usar directamente el vocabulario SentencePiece (`sentencepiece.bpe.model`) con el remapeo de IDs propio de fairseq (offset +1, unk = 3, bos = 0, pad = 1, eos = 2). Esto permite desplegar el reranker con solo `onnxruntime` y `sentencepiece`, lo que simplifica el empaquetado en entornos de producción y reduce el peso de dependencias.

El repositorio ocupa 2,8 GB y está etiquetado como multilingüe con licencia Apache 2.0. No obstante, la model card es muy escueta: no documenta número de parámetros, longitud de contexto máxima, composición del dataset de entrenamiento ni resultados de benchmarks, por lo que buena parte de las especificaciones técnicas de esta ficha quedan marcadas como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Cross-encoder transformer para ranking (derivado de bge-reranker-v2-m3); detalles internos no disponibles |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | FP32 (`model.onnx` + `model.onnx_data`) e INT8 (`model_quantized.onnx`) |
| Idiomas soportados | multilingue (segun etiqueta del autor); lista concreta de idiomas no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (con tokenizador SentencePiece `sentencepiece.bpe.model`) |

## Arquitectura y entrenamiento

El modelo es un reranker de tipo cross-encoder: procesa conjuntamente la consulta y el documento en una única secuencia con el formato `[bos] prompt [eos] [eos] text [eos]`, y produce un logit que se transforma en probabilidad mediante sigmoid. El artefacto publicado es una exportación a ONNX del modelo base `bge-reranker-v2-m3` de BAAI; la model card no detalla la arquitectura interna (número de capas, dimensión oculta, cabezas de atención), el volumen de tokens de entrenamiento, la composición del corpus ni si se aplicaron fases de RLHF o DPO.

La innovación destacable de este repositorio es de ingeniería de despliegue, no de modelado: la tokenización se realiza directamente con `sentencepiece.bpe.model` aplicando el remapeo de IDs de fairseq, lo que elimina la dependencia de `transformers` y `tokenizers`. El pipeline incluye `src/helper.py` (constructor de sesión ONNX con selección de proveedor de ejecución, hilos y opciones de memoria) y `src/example.py` (tokenización, batching, inferencia y sigmoid). Se recomienda normalizar la entrada con NFKC para obtener puntuaciones consistentes en contextos multilingües.

## Capacidades

- Ranking de texto (text-ranking): puntuación de relevancia consulta-documento en el rango 0..1 mediante sigmoid del logit.
- Reranking en pipelines de recuperación: reordenación de candidatos devueltos por un retriever de primera fase (BM25, embeddings, etc.).
- Procesamiento multilingüe: la model card incluye ejemplos en inglés, japonés y cadenas cortas, y etiqueta el modelo como multilingüe.
- Ejecución en CPU y GPU mediante `onnxruntime` / `onnxruntime-gpu`, con selección de proveedor de ejecución y configuración de hilos.
- Batching: el ejemplo oficial agrupa pares y aplica padding por lote hasta la secuencia más larga.
- Cuantización INT8 disponible para reducir huella de memoria y acelerar inferencia.
- No se documentan capacidades de generación de texto, tool calling, agentes, visión ni audio; es un modelo exclusivamente de scoring.

## Casos de uso

- Reranking en motores de búsqueda internos: tras una recuperación inicial con BM25 o un modelo de embeddings, el reranker reordena los N candidatos y mejora la precisión de los primeros resultados; su salida probabilística permite fijar umbrales de corte.
- Búsqueda semántica en documentación técnica multilingüe: al estar etiquetado como multilingüe, puede puntuar pares consulta-documento en varios idiomas dentro de un mismo índice, con normalización NFKC para estabilizar las puntuaciones.
- Filtrado de duplicados y contenido irrelevante: la puntuación baja observada en el ejemplo oficial para una entrada trivial ("hi", 0.000279) sugiere utilidad como filtro de ruido antes de etapas costosas de generación.
- RAG (retrieval-augmented generation): seleccionar los fragmentos más relevantes antes de pasarlos a un LLM, reduciendo el contexto enviado y el coste por consulta.
- Despliegue en entornos con dependencias restringidas: al requerir solo `onnxruntime` y `sentencepiece`, encaja en contenedores mínimos, funciones serverless o sistemas embebidos donde instalar `transformers` no es viable.
- Moderación y triaje de tickets: puntuar la similitud entre una consulta de usuario y una base de respuestas o categorías predefinidas para enrutar el ticket al equipo adecuado.
- Evaluación offline de sistemas de recuperación: usar las puntuaciones como métrica auxiliar para comparar índices o configuraciones de retrieval.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente incluye tres ejemplos de salida del pipeline (0.953583 para un par relevante en inglés, 0.000279 para una entrada trivial y 0.994547 para un par relevante en japonés), que no constituyen una evaluación sistemática.

## Requisitos de hardware

- VRAM estimada: no disponible con precisión al no documentarse el número de parámetros. El repositorio ocupa 2,8 GB, lo que incluye los pesos FP32 y la variante INT8; la variante INT8 reduce aproximadamente a la cuarta parte el peso de los pesos FP32 correspondientes.
- GPU recomendadas: no disponibles en la documentación. Al ser un cross-encoder de ranking, cargas típicas de este tipo de modelos caben en GPUs de consumo, pero no hay confirmación oficial para este artefacto concreto.
- GPU de consumo: no confirmado; la existencia de una variante INT8 y el soporte de `onnxruntime` en CPU permiten plantear despliegue sin GPU, aunque sin datos de latencia publicados.
- Opciones de despliegue: `onnxruntime` (CPU) y `onnxruntime-gpu` (GPU) con selección de execution provider; el repositorio incluye `src/helper.py` para configurar proveedor, hilos y opciones de memoria. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (son frameworks orientados a generación, no a reranking).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| cimo001/baai (esta ficha) | Reranker cross-encoder ONNX | no disponible | no disponible | Apache 2.0 | ONNX (FP32/INT8) | Sin dependencia de transformers; tokenizador SentencePiece directo |
| BAAI/bge-reranker-v2-m3 (original) | Reranker cross-encoder | no disponible en esta informacion | no disponible en esta informacion | Apache 2.0 (segun el autor de esta conversion) | safetensors / PyTorch | Modelo base del que deriva esta exportacion; requiere transformers |
| BAAI/bge-reranker-base | Reranker cross-encoder | no disponible en esta informacion | no disponible en esta informacion | no disponible en esta informacion | PyTorch | Alternativa de la misma familia; datos no verificados en esta informacion |

No se dispone de datos de rendimiento comparativo (nDCG, MRR, latencia) en la información proporcionada para establecer una comparación cuantitativa.

## Limitaciones y advertencias

- Información técnica incompleta: la model card no documenta parámetros, contexto máximo, dataset de entrenamiento ni evaluación; cualquier estimación de capacidad debe validarse empíricamente antes de producción.
- Repositorio de terceros: la publicación la realiza el usuario cimo001, no BAAI; la fidelidad de la conversión ONNX respecto al modelo original no está verificada en la documentación.
- Riesgo de alucinación no aplica en el sentido generativo (no produce texto), pero sí existe riesgo de puntuaciones mal calibradas fuera de la distribución de entrenamiento.
- Sesgos: no documentados; al ser un modelo multilingüe sin evaluación publicada, pueden existir sesgos de idioma, dominio o estilo en las puntuaciones.
- Contexto: se desconoce la longitud máxima de secuencia; secuencias largas pueden truncarse o degradar la puntuación sin aviso explícito.
- Licencia: Apache 2.0 permite uso comercial, pero conviene verificar la licencia del modelo base original de BAAI antes de redistribuir.
- Dependencia de normalización: la propia model card advierte que se debe aplicar NFKC a la entrada para obtener puntuaciones consistentes en contextos multilingües; omitirlo puede introducir variabilidad.
- Sin métricas de latencia ni throughput publicadas: el dimensionado de infraestructura requiere pruebas propias.
- Cero descargas y un solo "like" en el momento de la consulta: no hay evidencia de uso en producción ni validación comunitaria.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/cimo001/baai
- Modelo base referenciado (BAAI): https://huggingface.co/BAAI/bge-reranker-v2-m3 (enlace inferido del campo `base_model`; no verificado en la información proporcionada)
- Script de ejemplo del pipeline: https://huggingface.co/cimo001/baai/blob/main/bge-reranker-v2-m3/src/example.py
- Constructor de sesión ONNX: https://huggingface.co/cimo001/baai/blob/main/bge-reranker-v2-m3/src/helper.py
