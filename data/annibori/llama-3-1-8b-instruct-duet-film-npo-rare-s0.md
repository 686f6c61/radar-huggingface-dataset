# AnniBori/Llama-3.1-8B-Instruct-DUET-film-NPO-rare-s0

## Resumen

Llama-3.1-8B-Instruct-DUET-film-NPO-rare-s0 es un modelo derivado de Llama-3.1-8B-Instruct obtenido mediante un proceso de *unlearning* (desaprendizaje) selectivo sobre un conjunto de hechos cinematograficos. Lo desarrolla el usuario AnniBori y parte de un checkpoint intermedio propio (`Llama-3.1-8B-Instruct-DUET-film-ft`, epoch 6), que a su vez es un fine-tuning de Llama-3.1-8B-Instruct sobre el conjunto DUET de peliculas. Sobre esa base se aplica NPO (Negative Preference Optimization) para eliminar el conocimiento de un subconjunto concreto de hechos (director-pelicula) marcado como "rare", manteniendo al mismo tiempo el conocimiento del resto del conjunto de retencion.

El modelo resuelve un problema de investigacion concreto: evaluar si es posible borrar informacion factual especifica de un LLM sin degradar de forma inaceptable el resto de su conocimiento. Con 8.030.261.248 parametros (8B) y la arquitectura transformer decoder-only estandar de la familia Llama 3.1, el checkpoint es relevante como artefacto experimental reproducible: la model card documenta la receta de desaprendizaje, la seleccion de epoch por criterios de retencion/olvido y los scripts de evaluacion, lo que lo convierte en material util para quienes investigan machine unlearning, no para despliegue generalista.

La relevancia ahora es metodologica: el modelo demuestra una curva de compromiso entre olvido y retencion medida con ROUGE-L recall, con un epoch seleccionado (epoch 8) que alcanza un forget recall de 0.002 y un retain recall de 0.602, frente a una base de retencion de 0.842. Es, por tanto, un modelo de investigacion con proposito acotado y no un asistente de uso general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Llama 3.1) |
| Parametros totales | 8.030.261.248 (8B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada de Llama 3.1-8B-Instruct: 128.000 tokens, no confirmado en la model card) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; no se documentan cuantizaciones publicadas) |
| Idiomas soportados | no disponible |
| Licencia | llama3.1 (Llama 3.1 Community License) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es la de Llama-3.1-8B-Instruct sin modificaciones estructurales: un transformer decoder-only denso de 8B parametros. El entrenamiento consta de dos fases. Primero, un fine-tuning sobre el conjunto DUET (config `film`) que produce el checkpoint base `AnniBori/Llama-3.1-8B-Instruct-DUET-film-ft` en su epoch 6. Segundo, un proceso de desaprendizaje con NPO sobre ese checkpoint, usando el framework `open-unlearning` con la configuracion `experiment=revival_mechanism/unlearn/duet_8B_NPO`.

La receta de NPO emplea beta 0.1, gamma 1 (peso de olvido), alpha 1 (peso de retencion) y perdida de retencion NLL. El entrenamiento usa learning rate 1e-5, 8 epochs, batch 4 con acumulacion de gradiente 4, warmup de 1 epoch, weight decay 0.01, optimizador `paged_adamw_8bit` y precision bf16, con semilla 0 y un checkpoint por epoch (26 pasos por epoch). Los datos son el conjunto de olvido `forget_rare_film` (411 hechos director-pelicula, filas con `split_role = train`, commit `2c2b047bb569b205ea57f924b36e818d4e3f3903`) y el conjunto de retencion `retain_film` (546 ejemplos). La seleccion del epoch final sigue un criterio preregistrado: se exige forget recall (ROUGE-L, generacion greedy de 64 tokens) menor o igual a 0.15 y retain recall mayor o igual a la base menos 0.30 (base 0.842, suelo 0.542); entre los epochs que cumplen, se elige el de mayor diferencia retain − forget.

## Capacidades

- Generacion de texto conversacional en formato chat de Llama 3.1, con plantilla de tokenizer estandar y un system prompt especifico de QA conciso y factual.
- Respuesta a preguntas factuales de tipo "pocas palabras, respuesta correcta" segun el system prompt de entrenamiento y evaluacion.
- Razonamiento y generacion general heredados de Llama-3.1-8B-Instruct, aunque no evaluados en la model card.
- Capacidad de *desaprendizaje* verificada sobre un subconjunto factual concreto: forget recall de 0.002 en el epoch seleccionado.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible.
- Capacidades especiales (vision, audio, thinking mode): no disponible.

## Casos de uso

- Investigacion en machine unlearning: el modelo sirve como artefacto reproducible para estudiar el equilibrio entre olvido de hechos y retencion de conocimiento, con receta, semilla y scripts de evaluacion documentados.
- Evaluacion de ataques de re-aprendizaje: la model card referencia una sonda de relearning con LoRA de rango 4 (`stage4_revival_sweep.py`, probe seed 42, pasos 1-256), util para medir si el conocimiento borrado puede recuperarse con un fine-tuning ligero.
- Analisis de subespacios de representacion: el script `stage9_gate_anatomy.py` y su nulo apareado permiten estudiar que direcciones del espacio de activaciones codifican el conocimiento olvidado.
- Benchmarking de metodos de unlearning: comparar NPO con alternativas (gradient ascent, preference optimization variantes) sobre el mismo conjunto DUET film y la misma metrica ROUGE-L recall.
- Validacion de pipelines de evaluacion: `film_gate.py` y `partc_job.sh` ofrecen una implementacion de referencia para medir forget y retain recall con generacion greedy.
- Estudio de formatos de prompt en tareas de QA factual: el system prompt "terse and fact-only" permite analizar como el formato afecta a la recuperacion de hechos tras el desaprendizaje.
- Docencia y divulgacion: ejemplo concreto y trazable de un proceso completo de unlearning con criterios de seleccion preregistrados.

## Benchmarks y rendimiento

Los unicos datos publicados en la informacion disponible son las metricas de olvido y retencion por epoch (ROUGE-L recall, generacion greedy de 64 tokens nuevos):

| Epoch | Forget recall | Retain recall |
|---|---|---|
| 1 | 0.412 | 0.566 |
| 2 | 0.004 | 0.036 |
| 3 | 0.001 | 0.125 |
| 4 | 0.001 | 0.277 |
| 5 | 0.001 | 0.397 |
| 6 | 0.002 | 0.528 |
| 7 | 0.002 | 0.595 |
| 8 (seleccionado) | 0.002 | 0.602 |

Base de referencia: retain recall 0.842; suelo admisible 0.542. No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16/fp16: aproximadamente 16 GB solo para pesos, mas overhead de activaciones y cache KV; en la practica se recomienda 24 GB o mas para contexto moderado.
- Cuantizacion a 8 bits: unos 8-9 GB de pesos; a 4 bits: unos 4-5 GB, aunque no se documentan cuantizaciones publicadas para este checkpoint concreto.
- GPU recomendadas: A100 40/80 GB, H100, L40S o RTX 4090 (24 GB) para bf16; RTX 3090/4080 (16 GB) viables solo con cuantizacion.
- Cabe en GPU de consumo: si, en RTX 4090 a bf16 con contexto limitado, y en GPUs de 16 GB con cuantizacion a 8 o 4 bits.
- Opciones de despliegue: transformers (libreria declarada), text-generation-inference (tag `text-generation-inference`), endpoints compatibles; vLLM, llama.cpp u Ollama no estan documentados para este checkpoint.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Proposito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Llama-3.1-8B-Instruct-DUET-film-NPO-rare-s0 | 8B | no disponible | Unlearning de hechos film (NPO) | llama3.1 | Hugging Face (0 descargas) |
| AnniBori/Llama-3.1-8B-Instruct-DUET-film-ft | 8B | no disponible | Fine-tuning DUET film (base del anterior) | llama3.1 | Hugging Face |
| Llama-3.1-8B-Instruct (Meta) | 8B | 128.000 tokens | Asistente generalista | llama3.1 | Hugging Face |
| Metodos de unlearning alternativos sobre DUET | no disponible | no disponible | Olvido de hechos film | no disponible | no disponible |

La comparativa con otros checkpoints de unlearning publicados sobre el mismo conjunto DUET no esta disponible en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo de investigacion con proposito acotado: no esta pensado como asistente generalista ni se han evaluado sus capacidades fuera del conjunto DUET film.
- Retain recall de 0.602 frente a 0.842 de la base: el desaprendizaje degrada aproximadamente 0.24 puntos absolutos de recall en el conjunto de retencion, dentro del suelo preregistrado pero con perdida medible.
- El olvido se mide con ROUGE-L recall sobre generacion greedy de 64 tokens; no se documentan evaluaciones con parafrasis o ataques en los resultados publicados, aunque los scripts existen.
- Riesgo de re-aprendizaje: la model card incluye una sonda de relearning con LoRA de rango 4, lo que sugiere que el conocimiento borrado podria recuperarse con fine-tuning ligero; los resultados de esa sonda no se detallan.
- Riesgo de alucinacion: no evaluado en la informacion disponible.
- Sesgos conocidos: no documentados; se heredan los de Llama-3.1-8B-Instruct y los del conjunto DUET.
- Idiomas soportados: no disponible; el system prompt y la evaluacion estan en ingles.
- Restricciones de licencia: Llama 3.1 Community License, con condiciones de uso comercial y de redistribucion de Meta; revisar los terminos antes de cualquier uso en produccion.
- Contexto maximo no confirmado en la model card: no asumir los 128.000 tokens de Llama 3.1 sin verificacion.
- Sin descargas ni likes en Hugging Face: no hay evidencia de uso o validacion por terceros.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AnniBori/Llama-3.1-8B-Instruct-DUET-film-NPO-rare-s0
- Modelo base: https://huggingface.co/AnniBori/Llama-3.1-8B-Instruct-DUET-film-ft
- Conjunto de datos DUET: https://huggingface.co/datasets/SwetieePawsss/DUET_LLM
- Repositorio open-unlearning (framework de entrenamiento citado): no disponible como enlace directo en la informacion proporcionada
- Scripts de evaluacion (`film_unlearning/scripts/film_gate.py`, `partc_job.sh`, `film_forget_metrics.py`) y sondas (`revival_mechanism/src/stage4_revival_sweep.py`, `stage9_gate_anatomy.py`): rutas relativas a `open-unlearning/experiments/` en el repositorio del proyecto, sin URL publica en la informacion disponible
