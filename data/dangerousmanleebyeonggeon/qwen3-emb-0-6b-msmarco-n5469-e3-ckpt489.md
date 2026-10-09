# dangerousmanleebyeonggeon/qwen3-emb-0.6b-msmarco-n5469-e3-ckpt489

## Resumen

Este modelo es un ajuste fino completo de Qwen/Qwen3-Embedding-0.6B, publicado por el usuario dangerousmanleebyeonggeon, orientado a similitud semántica y recuperación de información (pipeline `sentence-similarity`). Cuenta con 595.776.512 parámetros (~0,6B), pesos en safetensors y se distribuye a través de la librería `sentence-transformers`. No es un modelo de propósito general: forma parte de un estudio de ablación del dato de entrenamiento, diseñado para medir el efecto de un corpus de 5.469 pares frente a un dataset mayor del mismo autor (6.000 pares).

El entrenamiento utiliza la pérdida InfoNCE sobre un subconjunto de `microsoft/ms_marco` v1.1: 5.469 consultas muestreadas con semilla 42, cada una con un único pasaje seleccionado y los nueve primeros pasajes no seleccionados como negativos duros. El checkpoint publicado es el final del entrenamiento (paso 489 de 489, eval loss 2,145) tras 3 épocas con 8 GPU, precisión bf16 y DeepSpeed ZeRO-3.

Su relevancia es acotada y experimental: sirve como referencia reproducible en investigación sobre selección de datos para modelos de embeddings, no como un modelo listo para producción. La model card no declara licencia, idiomas soportados ni resultados de evaluación, y el repositorio registra 0 descargas y 0 valoraciones positivas en el momento de la consulta.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder para generación de embeddings, derivado de Qwen3-Embedding-0.6B (número de capas y dimensión oculta no disponibles) |
| Parametros totales | 595.776.512 (~0,6B) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en bf16) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Modelo base | Qwen/Qwen3-Embedding-0.6B (ajuste fino completo) |
| Funcion de perdida | InfoNCE (implementada en ms-swift) |
| Prompt de consulta | `Query:` (los documentos se codifican sin prompt) |
| Tamano del repositorio | 1,2 GB |
| Formato de embeddings | vectores densos de dimensión no disponible |
| Pipeline declarado | sentence-similarity |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen3-Embedding-0.6B, un transformer encoder utilizado exclusivamente para producir representaciones vectoriales de texto. Este repositorio no introduce cambios estructurales: se trata de un ajuste fino completo (*full fine-tuning*) de todos los pesos del modelo base, no de un adaptador LoRA. La model card no detalla el número de capas, la dimensión de los embeddings ni el mecanismo de atención, por lo que esos datos figuran como no disponibles.

El procedimiento de entrenamiento se ejecutó con `swift sft --task_type embedding --loss_type infonce`, con ratio de aprendizaje 6e-6 con decaimiento coseno, 3 épocas, 8 GPU con 1 muestra por dispositivo y acumulación de gradiente 4 (32 consultas por paso), temperatura 0,1, bf16 y DeepSpeed ZeRO-3. Los negativos en lote (*in-batch negatives*) se comparten entre las 8 consultas de cada micro-lote mediante *all-gather*. El conjunto de datos contiene 5.469 filas y se reservó un 5 % para validación, con semilla 42. El paso final es el 489 de 489, con una pérdida de evaluación de 2,145. Se trata, por tanto, de un experimento controlado de ablación del dato, no de un entrenamiento orientado a maximizar métricas de recuperación.

## Capacidades

- Generación de embeddings de texto para similitud semántica y recuperación densa (*dense retrieval*).
- Codificación diferenciada de consultas y documentos: las consultas requieren el prompt `Query:` y los documentos se codifican sin prompt.
- Recuperación de pasajes relevantes en el estilo de MS MARCO, gracias al entrenamiento con negativos duros extraídos del propio corpus.
- Uso como codificador bi-encoder en la primera etapa de un pipeline de búsqueda, dejando el reordenamiento a un cross-encoder posterior.
- Cálculo de similitud coseno entre pares de frases para agrupamiento, deduplicación o clasificación por vecinos más cercanos.
- Compatibilidad con `sentence-transformers` y con `text-embeddings-inference` (etiqueta declarada en el repositorio), así como con endpoints compatibles.
- Capacidades multilingües: no documentadas en la información disponible.
- Soporte de *tool calling*, agentes, visión, audio o modo de razonamiento: no disponible (no es un modelo generativo).

## Casos de uso

- Búsqueda semántica sobre documentación técnica: indexar los pasajes con `m.encode()` sin prompt y codificar la consulta del usuario con `prompt_name="query"`; el modelo devuelve vectores comparables mediante similitud coseno, lo que permite recuperar fragmentos relevantes aunque no compartan palabras clave con la pregunta.
- Recuperación aumentada por generación (RAG) en dominios con terminología específica: el modelo actúa como recuperador de primer nivel y su bajo coste (0,6B de parámetros) permite indexar corpus grandes sin recurrir a GPU de gama alta.
- Deduplicación de corpus y control de calidad de datasets: codificar todos los documentos de un conjunto y agrupar por similitud para detectar duplicados casi idénticos antes de usarlos en entrenamiento.
- Búsqueda de preguntas frecuentes en soporte técnico: emparejar la consulta entrante con la entrada más similar de una base de conocimiento, sustituyendo la coincidencia por palabras clave por recuperación semántica.
- Reordenamiento previo en motores de búsqueda internos: usar los embeddings como filtro rápido para reducir de millones a centenares de candidatos, que después se refinan con un cross-encoder.
- Clasificación y enrutamiento de tickets: entrenar un clasificador ligero (regresión logística, k-NN) sobre los embeddings generados y asignar categorías o equipos de resolución.
- Experimentación académica en ablación de datos: el modelo es un punto de control reproducible para comparar el efecto del volumen y la composición del dataset de entrenamiento sobre la calidad de los embeddings, con la receta exacta documentada en la model card.
- Detección de temas emergentes o agrupamiento de retroalimentación de usuarios: reducir la dimensionalidad de los embeddings y aplicar agrupamiento no supervisado para descubrir patrones recurrentes en encuestas o comentarios.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada en bf16: aproximadamente 1,2 GB solo para los pesos, más el *overhead* de activaciones y del tokenizador; en la práctica, entre 2 y 3 GB para lotes pequeños.
- VRAM estimada en fp16/bf16 con lotes grandes o secuencias largas: puede superar los 4 GB, aunque sigue siendo un modelo muy ligero.
- Inferencia en CPU: viable. Con 0,6B de parámetros, la codificación en CPU es funcional para volúmenes moderados si se acepta mayor latencia.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM. Una RTX 3060, RTX 4060, RTX 3090 o RTX 4090 puede ejecutar el modelo con holgura y procesar lotes grandes.
- GPU de datacenter: A100, H100 o L40S permiten maximizar el rendimiento por lotes en indexación masiva, aunque están sobredimensionadas para este tamaño de modelo.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU de consumo moderna (8 GB o más), e incluso en iGPU con memoria compartida si la latencia no es crítica.
- Opciones de despliegue: `sentence-transformers` (uso directo en Python), `text-embeddings-inference` (etiqueta declarada por el autor) y endpoints compatibles. No hay pesos GGUF publicados, por lo que `llama.cpp` y `Ollama` no son utilizables sin convertir el modelo previamente.
- Detalle de implementación: debe usarse `processor_kwargs={"padding_side": "left"}` al instanciar el modelo, tal como indica la model card.
- Latencia y throughput estimados: no disponible. No hay cifras publicadas de tokens por segundo ni de latencia por lote.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| dangerousmanleebyeonggeon/qwen3-emb-0.6b-msmarco-n5469-e3-ckpt489 | 595.776.512 | no disponible | no disponible | HuggingFace, 0 descargas |
| Qwen/Qwen3-Embedding-0.6B (modelo base) | ~0,6B | no disponible en la informacion proporcionada | no disponible | HuggingFace |
| Otras alternativas de embeddings de tamano similar | no disponible | no disponible | no disponible | no disponible |

El modelo solo puede compararse de forma fiable con su propio modelo base, del que hereda la arquitectura y el tamaño. La diferencia sustantiva es el ajuste con InfoNCE sobre 5.469 pares de MS MARCO, orientado a recuperación consulta-pasaje. No se dispone de datos de rendimiento de ninguna de las alternativas en la información proporcionada, por lo que no es posible establecer una comparación cuantitativa con otros modelos de embeddings de la misma categoría (por ejemplo, familia E5, BGE o GTE).

## Limitaciones y advertencias

- Es un experimento de ablación de datos, no un modelo validado para producción. La propia model card lo describe como parte de un estudio comparativo de tamaño de dataset.
- No se han publicado resultados de benchmarks, por lo que se desconoce su calidad real en tareas de recuperación frente al modelo base o a alternativas consolidadas.
- La licencia no está declarada en la información disponible. Antes de cualquier uso comercial es imprescindible verificar los términos del modelo base Qwen3-Embedding-0.6B y consultar al autor del ajuste.
- Los idiomas soportados no están documentados. Aunque el modelo base podría cubrir múltiples lenguas, el ajuste se ha realizado exclusivamente sobre MS MARCO en inglés, lo que probablemente degrada el rendimiento fuera de ese idioma.
- Riesgo de sesgo de dominio: el entrenamiento se limita a consultas y pasajes de MS MARCO, un corpus de búsqueda web en inglés. El comportamiento en dominios técnicos, jurídicos, médicos o multilingües es incierto.
- Riesgo de sobreajuste al formato: el uso incorrecto del prompt `Query:` o de `padding_side="left"` puede degradar notablemente la calidad de los embeddings.
- Al ser un modelo de embeddings y no generativo, no puede producir texto y por tanto no es susceptible de alucinación en el sentido habitual; sin embargo, sí puede recuperar pasajes irrelevantes o falsos positivos, lo que en un RAG puede propagar información incorrecta al modelo generador.
- La longitud de contexto no está documentada en la información disponible; secuencias más largas de lo que soporte el modelo se truncarán silenciosamente y perderán información.
- Repositorio sin tracción: 0 descargas y 0 valoraciones, sin evidencia de uso en producción ni de mantenimiento posterior.
- La pérdida de evaluación final (2,145) es un valor aislado y sin referencia; no permite por sí sola juzgar la calidad del modelo.
- La fecha de creación registrada (2026-10-09) es posterior a la fecha actual conocida, lo que conviene verificar directamente en el repositorio antes de citarla.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/dangerousmanleebyeong/qwen3-emb-0.6b-msmarco-n5469-e3-ckpt489
- Modelo base: https://huggingface.co/Qwen/Qwen3-Embedding-0.6B
- Dataset de entrenamiento: https://huggingface.co/datasets/microsoft/ms_marco
- Paper, blog, repositorio o demo adicionales: no disponible en la informacion proporcionada.
