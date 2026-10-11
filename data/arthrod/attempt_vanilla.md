# arthrod/attempt_vanilla

## Resumen

`arthrod/attempt_vanilla` es un checkpoint de reconocimiento de entidades nombradas (NER) basado en GLiNER, especializado en deteccion de informacion personal identificable (PII), publicado por el usuario arthrod. Se trata de un fine-tuning en modo `token_level` del modelo `knowledgator/gliner-pii-large-v1.0` (encoder `microsoft/deberta-v3-large`) sobre un corpus sintetico de PII de aproximadamente 1.026.320 ejemplos. El objetivo declarado por el autor es documentar un experimento de un dia de duracion realizado el 24 de febrero de 2026 sobre una unica GPU AMD MI300X (192 GB, ROCm 7.1).

El repositorio se publica explicitamente como registro de experimento (experiment log), no como modelo de produccion. El checkpoint principal es `gliner_logs/gliner-pii-large-full-v1/checkpoint-7500`, que obtuvo la menor eval loss de la ejecucion (417,7) tras 7.500 pasos. No se calcularon metricas de F1, precision ni recall durante estas ejecuciones, por lo que el autor recomienda evaluar los pesos antes de cualquier uso real. El repositorio ocupa 5,4 GB e incluye ademas configuraciones YAML, logs de W&B offline, scripts de entrenamiento, evaluacion, conversion a ONNX y benchmarking.

La relevancia de esta ficha es limitada y debe entenderse como referencia metodologica: aporta cifras concretas de un pipeline de fine-tuning de GLiNER para PII en hardware AMD (ROCm), incluyendo un fallo documentado (loss exactamente 0 durante 17.000 pasos) que sirve como advertencia practica para otros entrenamientos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GLiNER (NER zero-shot sobre encoder transformer bidireccional DeBERTa-v3-large) |
| Parametros totales | no disponible (el encoder base es `microsoft/deberta-v3-large`) |
| Longitud de contexto | 768 tokens (`max_len` configurado en el fine-tuning) |
| Tipos de cuantizacion | no disponible (no se publican versiones cuantizadas; se incluyen scripts de conversion a ONNX) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | no especificado en la model card (checkpoint de HuggingFace Trainer; el repositorio relacionado `arthrod/v1-deberta_large-token_level-1-7` incluye pesos + ONNX) |

## Arquitectura y entrenamiento

El modelo parte de GLiNER, un esquema de NER zero-shot que proyecta embeddings de etiquetas de entidad y representaciones de spans del texto en un espacio comun, permitiendo extraer entidades definidas dinamicamente en tiempo de inferencia sin reentrenamiento. En esta ficha el encoder subyacente es DeBERTa-v3-large y el modo de span es `token_level`, con `max_len` de 768, `max_width` de 100 y `max_types` de 30.

Los hiperparametros del run principal (`gliner-pii-large-full-v1`) fueron: learning rate de 5e-6 para el encoder y 7e-6 para el resto, schedule lineal con 10 % de warmup, batch efectivo de 184, precision bf16 y perdida focal con `alpha=0.75`, `gamma=0` y `loss_reduction: sum`. Se planificaron 15.000 pasos, pero el entrenamiento se detuvo manualmente en torno al paso 8.200 (1,43 epocas, aproximadamente 6,5 horas). La train loss cayo de ~11.600 en el paso 10 a ~257 en el paso 8.000, y la eval loss evoluciono de la siguiente forma:

| Paso | 500 | 1000 | 2000 | 3000 | 4000 | 5000 | 6000 | 7000 | 7500 | 8000 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| Eval loss | 936,8 | 653,7 | 535,6 | 478,0 | 477,4 | 451,4 | 438,9 | 440,0 | 417,7 | 449,8 |

El repositorio documenta dos runs adicionales. El segundo (`gliner-multitask-v1.0`) es un top-up de 1.000 pasos sobre `knowledgator/gliner-multitask-v1.0` (encoder DeBERTa-v2-xlarge, `max_len` 1024), ejecutado en paralelo en la misma GPU, con train loss de 4.015 a 114 y eval loss de 167,7 (paso 500) a 149,2 (paso 1000). El tercero (`h-gliner-token-full-v1`) fue un intento desde cero sobre `microsoft/deberta-v3-small` en el que la train loss, la eval loss y la norma del gradiente fueron exactamente 0,0 desde el paso 10 hasta el 17.000; el fallo nunca se confirmo y los pesos no se conservaron. El autor sospecha de `prev_path: "none"` pasado como cadena y de un `class_token_index` fijado de forma estatica.

## Capacidades

- Reconocimiento de entidades nombradas zero-shot mediante etiquetas definidas en tiempo de inferencia (por ejemplo, `person`, `email`, `phone number`).
- Deteccion de PII en texto en ingles con salida a nivel de token, incluyendo puntuacion de confianza por entidad (`score`) y umbral configurable (`threshold`).
- Extraccion de spans con ancho maximo de 100 tokens y hasta 30 tipos de entidad distintos por consulta.
- Clasificacion por token (pipeline `token-classification`) integrable en flujos de anonimizacion o redaccion.
- Soporte de tool calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible (no es un modelo generativo de proposito general).
- Capacidades multilingues: no (solo ingles declarado).
- Capacidades especiales: no se documentan modos de pensamiento, vision ni audio.

## Casos de uso

- Anonimizacion de documentos antes de enviarlos a un LLM externo: el modelo permite marcar y sustituir entidades PII (nombres, correos, telefonos) en ingles, reduciendo el riesgo de fuga de datos en pipelines de RAG.
- Cumplimiento normativo (RGPD/CCPA) en corpus en ingles: uso como paso de redaccion previo a almacenamiento o analitica, con umbral de confianza ajustable para priorizar precision o recall.
- Preprocesado de logs y tickets de soporte: extraccion de entidades en textos no estructurados antes de indexarlos en un buscador, evitando indexar datos personales.
- Limpieza de datasets de entrenamiento: deteccion y etiquetado de PII en corpus propios para construir conjuntos de datos anonimizados.
- Etiquetado asistido (human-in-the-loop): generacion de preanotaciones de entidades PII que un revisor humano valida, acelerando la creacion de datasets supervisados en ingles.
- Investigacion sobre NER zero-shot: reproduccion del experimento como referencia de hiperparametros (learning rates, perdida focal, `max_len` 768) y del pipeline de entrenamiento en ROCm/MI300X.
- Evaluacion comparativa de checkpoints: uso de los pesos (paso 7500) como punto de partida para reentrenamientos o comparaciones frente a otros checkpoints GLiNER.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks (F1, precision o recall) en la informacion disponible para este repositorio. El autor indica explicitamente que no se calcularon en estas ejecuciones y recomienda evaluar los pesos antes de usarlos. Como referencia cuantitativa solo se dispone de las eval losses del run principal (ver tabla en la seccion de arquitectura). Existe un barrido de evaluacion posterior de febrero de 2026 en `arthrod/gliner_eval_folder` (18 modelos x 9 conjuntos) que puntua los checkpoints 1000 y 8000 de este run, pero los valores concretos no estan incluidos en la informacion proporcionada.

## Requisitos de hardware

- Entrenamiento documentado: una unica GPU AMD MI300X (192 GB de VRAM) con ROCm 7.1, cuatro runs concurrentes en total y aproximadamente 6,5 horas para 8.200 pasos del run principal.
- VRAM estimada para inferencia: no disponible de forma oficial. Como estimacion orientativa, un encoder DeBERTa-v3-large en bf16 ocupa del orden de 0,9 GB en pesos; con activaciones a 768 tokens, la inferencia en batch pequeno deberia caber holgadamente en GPUs consumer de 6-8 GB, aunque este dato no esta confirmado por el autor.
- GPU recomendadas: no disponibles. El unico hardware confirmado es MI300X. Cualquier GPU con ROCm 7.1 o CUDA compatible con `transformers==5.1.0` y `gliner==0.2.25` deberia ser utilizable, previa validacion.
- Compatibilidad con GPU consumer: no confirmada oficialmente; por tamano del encoder, es plausible en tarjetas de 6-8 GB o superiores, pero requiere verificacion.
- Opciones de despliegue: libreria `gliner` (version 0.2.25) con `transformers==5.1.0`; el repositorio incluye scripts de conversion a ONNX y de benchmarking. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura / encoder | Contexto | Modo de span | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `arthrod/attempt_vanilla` (este) | GLiNER / DeBERTa-v3-large | 768 | token_level | apache-2.0 | HuggingFace, 0 descargas, 0 likes |
| `knowledgator/gliner-pii-large-v1.0` | GLiNER / DeBERTa-v3-large | no disponible | no disponible | no disponible | Modelo base, publico |
| `knowledgator/gliner-multitask-v1.0` | GLiNER / DeBERTa-v2-xlarge | 1024 (en el top-up) | no disponible | no disponible | Modelo base, publico |
| `arthrod/v1-deberta_large-token_level-1-7` | GLiNER / DeBERTa-v3-large | no disponible | token_level | no disponible | HuggingFace, pesos + ONNX |

La comparacion cuantitativa de rendimiento entre estas alternativas no esta disponible, ya que no se publicaron metricas F1 para este run. Los datos comparables se limitan a arquitectura, contexto y licencia.

## Limitaciones y advertencias

- El propio autor etiqueta el repositorio como registro de experimento, no como modelo de produccion.
- No se calcularon F1, precision ni recall durante los entrenamientos; se recomienda evaluar los pesos antes de cualquier uso real.
- El corpus de entrenamiento es sintetico y propio; no se incluye en el repositorio, lo que impide reproducir exactamente el entrenamiento.
- La train y eval loss usan `loss_reduction: sum`, por lo que sus valores escalan con el tamano de batch y no son directamente comparables con otras configuraciones.
- El modelo solo declara soporte de ingles; no hay evidencia de comportamiento en castellano ni en otros idiomas.
- Riesgo de alucinacion y de falsos positivos/negativos en la deteccion de PII: no cuantificado en la informacion disponible.
- Sesgos conocidos: no documentados.
- El repositorio incluye configuracion y estado de un run fallido (`h-gliner-token-full-v1`) cuyos pesos se eliminaron deliberadamente; no debe confundirse con un modelo utilizable.
- Restricciones de licencia: apache-2.0, lo que permite uso comercial, pero la responsabilidad sobre el rendimiento y el cumplimiento normativo recae en quien lo despliegue.
- El repositorio registra 0 descargas y 0 likes, sin validacion externa conocida.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/arthrod/attempt_vanilla
- Modelo base: https://huggingface.co/knowledgator/gliner-pii-large-v1.0
- Segundo modelo base (top-up): https://huggingface.co/knowledgator/gliner-multitask-v1.0
- Organizacion knowledgator: https://huggingface.co/knowledgator
- Dataset de evaluacion: https://huggingface.co/datasets/arthrod/gliner_eval_folder
- Dataset de comparacion: https://huggingface.co/datasets/arthrod/gliner_review_comparison
- Upload relacionado: https://huggingface.co/arthrod/v1-deberta_large-token_level-1-7
- Modelo PT-BR posterior: https://huggingface.co/arthrod/gliner-opf-ptbr-pii-v1
- Benchmark PT-BR: https://huggingface.co/datasets/arthrod/gliner-opf-ptbr-pii-bench-v1
- La busqueda web no devolvio resultados relevantes: los enlaces encontrados correspondian al termino medico "artrodesis" y no guardan relacion con este modelo.
