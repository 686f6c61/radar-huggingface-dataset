# davidheineman/rlve-opd-teacher-R1Distill-108-NANDResultCounting-20261025

## Resumen

`rlve-opd-teacher-R1Distill-108-NANDResultCounting-20261025` es un ajuste fino completo de `deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B` (1.777.088.000 parámetros, arquitectura transformer decoder-only de la familia Qwen2) publicado por el usuario de HuggingFace `davidheineman`. No es un modelo de propósito general: es el checkpoint final de un experimento de *data scaling* denominado RLVE, en el que el modelo actúa como "teacher" (profesor) dentro de un pipeline de destilación on-policy (OPD, *on-policy distillation*).

El modelo se ha entrenado con GRPO como especialista en un único entorno: una tarea de conteo de resultados de compuertas NAND (`108-NANDResultCounting`) con dificultad equilibrada 0/1. El entrenamiento se limitó a 4.000 rollouts (checkpoint 499, indexado desde cero), con parada anticipada si la validación alcanzaba pass@1 >= 0,98 sobre 32 prompts y 8 respuestas por prompt, evaluados cada 50 actualizaciones.

Su relevancia es, por tanto, metodológica y de investigación: sirve como artefacto reproducible para estudiar el escalado de datos en RL, como profesor para generar trazas de razonamiento destilables hacia modelos más pequeños, y como referencia de especialización extrema en una sola tarea. No está pensado para uso en producción como asistente general, y su model card no documenta idiomas, licencia ni resultados de benchmarks estándar.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen2), ajuste fino completo del modelo base |
| Parametros totales | 1.777.088.000 (1,78 B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la información proporcionada (heredada del modelo base) |
| Tipos de cuantizacion | No se distribuyen pesos cuantizados; el repo contiene safetensors, convertible a GGUF/AWQ/GPTQ (no verificado) |
| Idiomas soportados | No disponible |
| Licencia | No disponible en la model card (consultar la licencia del modelo base) |
| Formato de pesos | safetensors + tokenizer y configuración de `transformers` (repo de 3,6 GB) |

## Arquitectura y entrenamiento

Arquitectura transformer decoder-only densa de la familia Qwen2, con 1,78 B de parámetros. El punto de partida es `DeepSeek-R1-Distill-Qwen-1.5B`, un modelo destilado de razonamiento de DeepSeek; todos los "actores" del experimento se inicializaron desde cero a partir de ese mismo checkpoint, de modo que las diferencias observadas entre variantes del estudio son atribuibles al régimen de datos y no a la inicialización. El repositorio contiene únicamente pesos, tokenizer y configuración: no incluye estado del optimizador ni del dataloader, por lo que no es reanudable tal cual.

El método de entrenamiento es GRPO (*Group Relative Policy Optimization*) aplicado como especialista sobre un único entorno, `108-NANDResultCounting`, con dificultad equilibrada 0/1. La generación usa 1.024 tokens iniciales más una continuación forzada de 128 tokens para la respuesta. El presupuesto se fijó en 4.000 rollouts (última actualización de checkpoint: 499, indexado desde cero) o parada anticipada al alcanzar pass@1 >= 0,98 en validación; la validación emplea 32 prompts con 8 respuestas cada uno, cada 50 actualizaciones, y sus muestras no computan contra el presupuesto de entrenamiento. La configuración exacta y la lista de entornos están en `training_run.json` y `training_config.yaml` del repositorio, y el run está registrado en W&B (grupo `data-scaling-v1-n128-20261022-225839`).

## Capacidades

- Generación de texto autoregresiva en el formato conversacional (`chat_template`) del modelo base.
- Razonamiento especializado en una única tarea sintética: conteo de resultados de compuertas NAND con dificultad binaria 0/1 (`108-NANDResultCounting`).
- Producción de trazas de razonamiento largas (hasta 1.024 tokens iniciales más 128 tokens de continuación forzada en el régimen de entrenamiento).
- Uso como profesor en destilación on-policy: genera rollouts etiquetados que otro modelo estudiante puede imitar.
- Soporte de *tool calling* / *function calling*: no documentado.
- Soporte de agentes y razonamiento multi-paso: no documentado; el entrenamiento se limita a un solo entorno de un paso.
- Capacidades multilingües: no documentadas; presumiblemente heredadas del modelo base, sin verificar.
- Capacidades especiales (modo *thinking* explícito, visión, audio): no documentadas en esta ficha; el modelo base es solo texto.

## Casos de uso

- Investigación sobre escalado de datos en RL: replicar o extender el experimento RLVE comparando este profesor (n=128) con otras variantes del mismo grupo de runs, usando `training_run.json` como referencia de configuración.
- Destilación on-policy hacia modelos más pequeños: generar rollouts del profesor sobre `108-NANDResultCounting` y entrenar con ellos un estudiante de menor tamaño para medir la transferencia de la habilidad de conteo.
- Generación de datos sintéticos etiquetados: producir pares (problema NAND, solución) verificables automáticamente, ya que la tarea tiene una respuesta exacta comprobable por reglas.
- Estudio de especialización extrema y olvido catastrófico: evaluar cuánto del comportamiento generalista del modelo base se conserva tras 4.000 rollouts de GRPO sobre una sola tarea, midiendo la degradación en tareas fuera de dominio.
- Referencia de línea base en *reward hacking* y dinámica de GRPO: analizar las curvas de recompensa y validación registradas en W&B para detectar colapso de diversidad o sobreajuste al verificador.
- Docencia y divulgación técnica: ejemplo mínimo y reproducible (1,78 B, un solo entorno, 4.000 rollouts) para explicar un pipeline completo de RL con verificación y destilación.
- Evaluación de infraestructura de inferencia: por su tamaño reducido, sirve como banco de pruebas para medir latencia y throughput de vLLM o TGI con prompts largos antes de escalar a modelos mayores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible (MMLU, HumanEval, GSM8K u otros). El único criterio de rendimiento documentado es interno al entrenamiento: pass@1 en validación sobre el entorno `108-NANDResultCounting`, con umbral de parada en 0,98.

| Protocolo de entrenamiento | Valor |
|---|---|
| Algoritmo | GRPO (especialista, actores inicializados desde el modelo base) |
| Entornos | 1 (`108-NANDResultCounting`), dificultad equilibrada 0/1 |
| Presupuesto | 4.000 rollouts (checkpoint 499, indexado desde cero) |
| Generación | 1.024 tokens iniciales + 128 tokens de respuesta forzada |
| Validación | 32 prompts × 8 respuestas, cada 50 actualizaciones |
| Criterio de parada | 4.000 rollouts o pass@1 de validación >= 0,98 |
| Resultado final de pass@1 | No disponible en la información proporcionada (consultar el run de W&B) |

## Requisitos de hardware

- VRAM para inferencia en precisión nativa (bf16): aproximadamente 3,6 GB solo para pesos; con caché KV y overhead de runtime, entre 5 y 8 GB para contextos moderados.
- VRAM con cuantización de 8 bits: en torno a 2,5-3 GB de pesos; con 4 bits, en torno a 1,5-2 GB (estimaciones teóricas a partir de 1,78 B de parámetros, no verificadas con este checkpoint).
- GPU consumer: cabe holgadamente en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080/4090 y en tarjetas de 8 GB si se cuantiza. En GPUs de 4-6 GB requeriría cuantización agresiva y contextos cortos.
- GPU de datacenter: A100, H100, L40S o A10G son sobredimensionadas para inferencia de un solo modelo, pero adecuadas para generar grandes volúmenes de rollouts en paralelo (el caso de uso real de un profesor).
- Opciones de despliegue: `transformers` (vía `pipeline("text-generation")`), TGI (el repo incluye el tag `text-generation-inference` y `endpoints_compatible`), vLLM para serving con throughput alto. Para llama.cpp u Ollama sería necesario convertir los safetensors a GGUF, paso no documentado en el repositorio.
- Latencia y throughput: no disponibles en la información proporcionada; no se han publicado mediciones para este checkpoint.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Especialización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (`rlve-opd-teacher-...-NANDResultCounting`) | 1,78 B | No disponible | Conteo de resultados NAND (entorno único, GRPO) | No disponible | HuggingFace, repo de 3,6 GB |
| `deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B` (base) | 1,78 B | No disponible en esta ficha | Razonamiento general destilado de R1 | No disponible aquí (consultar su model card) | HuggingFace |
| `Qwen2.5-1.5B-Instruct` | 1,5 B | No disponible en esta ficha | Instrucciones generales, multilingüe | No disponible aquí (consultar su model card) | HuggingFace |
| Otras variantes del grupo `data-scaling-v1-n128-20261022-225839` | 1,78 B | No disponible | Distintos entornos del mismo experimento | No disponible | HuggingFace (mismo autor) |

No se dispone de datos de rendimiento comparables entre estas alternativas en la información proporcionada; la comparación relevante es de propósito (especialista vs. generalista) y de procedencia (todos los actores parten del mismo checkpoint base).

## Limitaciones y advertencias

- Especialización extrema: el modelo ha sido entrenado sobre un único entorno sintético; es previsible un rendimiento pobre en tareas generales de lenguaje, código o matemáticas, aunque no se han publicado mediciones de la degradación.
- No es un asistente: no hay evidencia de alineación conversacional, seguimiento de instrucciones abierto ni seguridad de salida; no debe desplegarse de cara al usuario final.
- Riesgo de sobreajuste al verificador: con 4.000 rollouts sobre una sola tarea con recompensa verificable, es plausible el colapso de diversidad y la explotación de atajos del verificador.
- Licencia no declarada en la model card: antes de cualquier uso comercial debe verificarse la licencia del modelo base y la del propio repositorio; la ausencia de licencia explícita es un bloqueo para producción.
- Idiomas no documentados: no hay garantía de comportamiento multilingüe; la mayor parte del entrenamiento RL se realizó sobre una tarea sintética, probablemente en inglés.
- Longitud de contexto no documentada: el régimen de entrenamiento usa 1.024 + 128 tokens; no se ha validado el comportamiento más allá de esa ventana.
- Anomalía en el identificador: el nombre del repositorio incluye la fecha `20261025` y la model card referencia runs de 2026, lo que conviene contrastar antes de citarlo como trabajo publicado o revisado por pares.
- Repositorio sin estado de optimizador ni dataloader: no es posible reanudar el entrenamiento exactamente, solo reutilizar los pesos.
- Sin métricas publicadas: no hay benchmarks estándar, curvas de evaluación ni comparaciones formales con el modelo base en la información disponible.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/davidheineman/rlve-opd-teacher-R1Distill-108-NANDResultCounting-20261025
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B
- Run de entrenamiento en W&B: https://wandb.ai/david-heineman/rl-data-scaling-teachers-v1/runs/14ec5c41
- Archivos de configuración citados en el repo: `training_run.json` y `training_config.yaml` (incluidos en el repositorio de HuggingFace)
- Paper, blog, demo o repositorio de código del método RLVE: no disponibles en la información proporcionada
- Resultados de la búsqueda web: no relevantes para este modelo (los enlaces devueltos no guardan relación con el repositorio ni con el autor); se omiten.
