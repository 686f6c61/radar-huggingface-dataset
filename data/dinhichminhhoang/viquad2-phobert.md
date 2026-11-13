# DinhIchMinhHoang/viquad2-phobert

## Resumen

viquad2-phobert es un conjunto de cuatro ajustes finos (seeds 42, 43, 44 y 45) del modelo base `vinai/phobert-base-v2` para respuesta extractiva de preguntas (extractive QA) en vietnamita sobre el conjunto UIT-ViQuAD 2.0, que incluye preguntas sin respuesta posible en el contexto. Lo publica el usuario DinhIchMinhHoang como artefacto de investigación reproducible: los pesos se distribuyen en safetensors en fp16, con configuraciones de entrenamiento y umbrales de decisión documentados.

El modelo resuelve la tarea de localizar un span de respuesta en un contexto dado y, además, decidir cuándo la pregunta es irresoluble (unanswerable) mediante la diferencia entre los logits de inicio y fin comparada con un umbral calibrado por seed. La relevancia práctica es doble: por un lado ofrece una línea base vietnamita de QA extractiva con gestión explícita de preguntas sin respuesta; por otro, documenta con transparencia un fenómeno relevante para quien entrene modelos pequeños: dos de los cuatro seeds divergen en el epoch 3 y se excluyen del ensemble.

Arquitectónicamente es un transformer encoder tipo RoBERTa adaptado al vietnamita (PhoBERT-base-v2, 135 millones de parámetros), con una cabeza de QA extractiva sobre la salida del encoder. No es un modelo generativo ni soporta tool calling, agentes ni razonamiento multi-paso: su alcance es estrictamente extractivo y monolingüe.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (RoBERTa-style, PhoBERT-base-v2) con cabeza de QA extractiva |
| Parametros totales | 135,0 M |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 256 tokens de entrada (max_length de entrenamiento); doc_stride 128 |
| Tipos de cuantizacion | fp16 en la publicacion; no se documentan otras cuantizaciones |
| Idiomas soportados | vietnamita (vi) |
| Licencia | AGPL-3.0 (heredada del modelo base) |
| Formato de pesos | safetensors (fp16), con config.json, tokenizer.json y tokenizer_config.json |

## Arquitectura y entrenamiento

El modelo parte de `vinai/phobert-base-v2`, un encoder transformer de 135 millones de parámetros preentrenado en vietnamita, y le añade una cabeza de question answering extractiva que predice logits de inicio y fin del span de respuesta. El ajuste fino se realiza sobre UIT-ViQuAD 2.0 (dataset `taidng/UIT-ViQuAD2.0`), que incluye preguntas sin respuesta. La entrada se segmenta en palabras con VnCoreNLP antes de tokenizar, y los spans predichos se reasignan al contexto original.

La receta de entrenamiento documentada es: learning rate 1,5e-5, 5 epochs, batch 32, max_length 256, doc_stride 128, warmup 0,1, weight decay 0,01, n_best 20 y max_answer_length 64, ejecutada con cuatro seeds (42, 43, 44 y 45). La decisión de "sin respuesta" se toma comparando la diferencia de logits (`null_diff`) con un umbral por seed: -2,00 para s42, -1,50 para s43, -1,00 para s44 y 0,00 para s45. Los seeds 44 y 45 divergieron en el epoch 3 (eval loss ~2,7 frente a ~1,1 en los seeds sanos) y se excluyen del ensemble, que usa únicamente s42 y s43 con umbral -1,50. No se documenta RLHF, DPO ni innovaciones de decodificación especulativa; es un ajuste fino supervisado convencional.

## Capacidades

- Respuesta extractiva de preguntas en vietnamita: devuelve un span del contexto proporcionado.
- Detección de preguntas sin respuesta (unanswerable) mediante umbral sobre la diferencia de logits de inicio y fin.
- Procesamiento de contextos largos mediante ventana deslizante (doc_stride 128 sobre max_length 256).
- Ensemble de dos seeds (s42 + s43) con umbral -1,50 para mejorar la estabilidad de la predicción.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene modo thinking, visión ni audio.
- Capacidad multilingüe limitada al vietnamita; no se documenta transferencia a otros idiomas.

## Casos de uso

- Búsqueda de respuestas sobre documentación interna en vietnamita: dado un fragmento de manual o política corporativa, el modelo localiza el pasaje exacto que responde a la consulta, con la ventaja de que puede declarar "sin respuesta" si el contexto no la contiene.
- Atención al cliente sobre FAQ: integrado en un pipeline de recuperación (retrieval) que pasa los fragmentos recuperados al modelo, este extrae la respuesta concreta y evita respuestas inventadas cuando el umbral de no-respuesta se supera.
- Extracción de datos de contratos y formularios vietnamitas: localización de cláusulas o campos concretos (fechas, importes, partes) dentro de documentos segmentados.
- Evaluación de sistemas RAG: como componente de QA extractiva sirve de línea base medible (F1, EM, precisión en no-respuesta) frente a generadores, gracias a su bajo coste computacional.
- Anotación asistida de datasets de QA: preanotar pares pregunta-respuesta sobre corpus vietnamitas para revisión humana, con el ensemble s42+s43 como configuración recomendada.
- Investigación sobre robustez de seeds en modelos pequeños: los checkpoints divergentes s44 y s45 se publican como evidencia para estudiar la varianza de entrenamiento con PhoBERT a lr 1,5e-5.
- Despliegue en entornos con recursos limitados: al ocupar ~256 MiB por run en fp16, puede servirse en CPU o en GPUs de gama baja para volúmenes moderados de consultas.

## Benchmarks y rendimiento

| Configuracion | Dev F1 | Test EM | Test F1 | Test HasAns F1 | Test NoAns acc | Nota |
|---|---|---|---|---|---|---|
| s42 (umbral -2,00) | 68,33 | 58,18 | 68,10 | 69,00 | 66,06 | en ensemble |
| s43 (umbral -1,50) | 66,28 | 57,29 | 66,82 | 69,56 | 60,55 | en ensemble |
| s44 (umbral -1,00) | 62,78 | no disponible | no disponible | no disponible | no disponible | divergente, excluido |
| s45 (umbral 0,00) | 60,86 | no disponible | no disponible | no disponible | no disponible | divergente, excluido |
| Ensemble s42+s43 (umbral -1,50) | 68,19 | 59,07 | 68,62 | 71,58 | 61,84 | publicacion |
| Ensemble original fase 3 (resultado del articulo) | no disponible | no disponible | 68,97 | no disponible | no disponible | referencia del paper |

El release queda 0,35 puntos por debajo del ensemble original de la fase 3, con intervalo de confianza [-0,88, 0,17] y sin significación estadística según el autor. El test se evaluó una sola vez. No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K) en la información disponible, lo cual es esperable dado que el modelo es extractivo y monolingüe.

## Requisitos de hardware

- VRAM estimada para inferencia: ~256 MiB por run en fp16 (según el autor); en fp32, aproximadamente el doble (~0,5 GB), más el overhead del runtime.
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de VRAM libre; no requiere A100 ni H100. Una RTX 4090 o una T4 están sobradamente dimensionadas.
- Cabe en GPU de consumo: sí, en cualquier GPU consumer moderna (GTX 1650 en adelante) e incluso en CPU para volúmenes moderados.
- Opciones de despliegue: Hugging Face Transformers (pipeline `question-answering`), servidores de inferencia compatibles con modelos encoder (por ejemplo, Text Embeddings Inference no aplica; TGI soporta arquitecturas encoder en algunas versiones), y exportación a ONNX para inferencia en CPU.
- Latencia y throughput: no disponibles en la información proporcionada. Al ser un encoder de 135 M de parámetros con entradas de 256 tokens, la latencia esperada es de decenas de milisegundos por consulta en GPU, pero no se aporta medición.
- Requisito adicional: VnCoreNLP para la segmentación de palabras, que no se redistribuye con el modelo y debe descargarse por separado.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Notas |
|---|---|---|---|---|---|
| viquad2-phobert (este) | 135 M | 256 tokens | QA extractiva vietnamita con no-respuesta | AGPL-3.0 | Ensemble s42+s43, test F1 68,62 |
| vinai/phobert-base-v2 | 135 M | 256 tokens | Encoder base vietnamita | AGPL-3.0 | Modelo base sin ajuste de QA |
| XLM-RoBERTa-base | ~278 M | 512 tokens | Encoder multilingue | MIT | Alternativa multilingue; rendimiento en vietnamita no disponible en esta ficha |
| mBERT (bert-base-multilingual-cased) | ~178 M | 512 tokens | Encoder multilingue | Apache-2.0 | Alternativa multilingue con licencia permisiva; rendimiento en vietnamita no disponible en esta ficha |

No se dispone de resultados comparativos directos publicados en la información proporcionada para estas alternativas sobre UIT-ViQuAD 2.0.

## Limitaciones y advertencias

- Alta varianza por seed: dos de los cuatro seeds (44 y 45) divergieron en el epoch 3 con lr 1,5e-5; el autor recomienda seleccionar checkpoint por dev y no confiar en un seed fijo.
- Los checkpoints s44 y s45 se publican solo como evidencia y no deben usarse en producción.
- Licencia AGPL-3.0: cualquier uso en red o servicio expuesto puede obligar a liberar el código fuente bajo la misma licencia; revisar implicaciones antes de uso comercial.
- Requiere segmentación de palabras con VnCoreNLP antes de la tokenización; sin ella, el rendimiento se degrada y el pipeline no reproduce los resultados publicados.
- Contexto limitado a 256 tokens con ventana deslizante de 128; contextos largos requieren troceado y agregación de spans.
- Solo vietnamita: no hay soporte multilingüe documentado.
- Riesgo de alucinación bajo en sentido generativo (es extractivo), pero puede devolver spans incorrectos o declarar "sin respuesta" erróneamente si el umbral no está bien calibrado para el dominio.
- El test se evaluó una sola vez; no hay validación cruzada ni intervalos de confianza por seed más allá del ensemble.
- Sesgos: no se documenta análisis de sesgos del dataset UIT-ViQuAD 2.0 ni del modelo base.
- El resultado principal del artículo (ensemble original fase 3, test F1 68,97) no se reproduce exactamente en este release (68,62).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/DinhIchMinhHoang/viquad2-phobert
- Modelo base: https://huggingface.co/vinai/phobert-base-v2
- Dataset UIT-ViQuAD 2.0 (espejo en HF): https://huggingface.co/datasets/taidng/UIT-ViQuAD2.0
- Paper PhoBERT (Nguyen y Nguyen, 2020): no disponible en la información proporcionada
- Paper UIT-ViQuAD 2.0: no disponible en la información proporcionada
- Artículo asociado a este release: no disponible en la información proporcionada (el autor lo marca como TODO)
- Repositorio de código con VnCoreNLP y utilidades (`src.demo`, `src.segment`): no disponible como URL en la información proporcionada
- VnCoreNLP (herramienta externa requerida): no disponible como URL en la información proporcionada
