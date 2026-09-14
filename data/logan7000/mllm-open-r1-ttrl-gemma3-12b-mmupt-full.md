# logan7000/mllm-open-r1-ttrl-gemma3-12b-mmupt-full

## Resumen

`logan7000/mllm-open-r1-ttrl-gemma3-12b-mmupt-full` es un checkpoint de investigación derivado de Gemma-3-12B-it, entrenado con la receta mmupt (variante Gemma, tier «big») y con la técnica TTRL (Test-Time Reinforcement Learning) basada en autoetiquetado por voto mayoritario. El objetivo declarado del experimento es reproducir en un modelo multimodal de 12 000 millones de parámetros la receta aplicada en la columna OpenR1 con Gemma-3, evaluando razonamiento matemático visual sobre MathVista-150.

El repositorio documenta explícitamente un **fallo de entrenamiento**: el run colapsó. La validación en bucle sobre MathVista-150 parte de 0.349 en el paso 0 (el modelo base) y cae de forma sostenida hasta 0.033-0.039 a partir del paso 220, sin recuperación. La recompensa de entrenamiento alcanzó 1.0 y `self_labeling/top_frequency_mean` llegó a 1.0, es decir, las 10 rollouts coincidían siempre en la misma respuesta: el voto mayoritario degeneró en autocorroboración. Ningún checkpoint guardado supera al modelo base.

Por tanto, el interés de esta ficha no es el uso práctico del modelo, sino su valor como evidencia negativa reproducible: es la fila de fallo de TTRL en la columna Gemma-3-12B / OpenR1 y un caso de estudio de degeneración por autoetiquetado. El autor advierte de forma explícita: «Do NOT use this repo as evidence that TTRL works». El repositorio ocupa 48,8 GB, no tiene descargas ni «likes», y no declara licencia ni idiomas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only multimodal, heredada del modelo base Gemma-3-12B-it (la ficha no detalla la arquitectura interna; el entrenamiento usó `attn_implementation` = sdpa) |
| Parametros totales | Aproximadamente 12 000 millones (segun la denominacion del modelo base Gemma-3-12B-it; la ficha no desglosa el recuento exacto) |
| Parametros activos | No aplica: no es un modelo MoE |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible. El repositorio contiene pesos en safetensors (48,8 GB en total, repartidos entre los directorios `best/`, `endpoint/` y `training/`); no se publican ficheros GGUF ni versiones cuantizadas |
| Idiomas soportados | No disponible |
| Licencia | No disponible en la ficha. Al derivar de Gemma-3-12B-it, el uso queda sujeto a los terminos de uso de Gemma del modelo base, pero el autor no lo especifica |
| Formato de pesos | safetensors (`best/` = mejor por validacion, paso 80; `endpoint/` = checkpoint-640, fin de la primera epoca; `training/` = registros de entrenamiento) |

## Arquitectura y entrenamiento

El modelo parte de **Gemma-3-12B-it** y se ajusta con la receta denominada «mmupt, variante Gemma (tier big)»: beta 0.01, K 10, temperatura 1.0, `max_completion_length` 1024, learning rate 1e-6 con `cosine_with_min_lr` 0.1, `warmup_ratio` 0, `weight_decay` 0.01, `max_grad_norm` 1.0, función de pérdida bnpo y `scale_rewards` por grupo. El batch efectivo es de 120 (12 prompts por paso, 1 época = 640 pasos) y la variante TTRL añade `--self_labeling` con pseudoetiquetas por voto mayoritario y `self_consistency_threshold` 0. Se entrenó con 4 GPUs, batch size 1 y 30 pasos de acumulación de gradiente por GPU, con `attn_implementation` sdpa, sobre el cluster a100 de la Johns Hopkins University (job 327291).

El fallo es la parte técnicamente relevante. La validación en bucle sobre MathVista-150 (150 ejemplos) evoluciona así: 0.349 en el paso 0 (base), 0.243 en el 20, 0.250 en el 40, 0.197 en el 60, 0.224 en el 80, 0.224 en el 100, 0.184 en el 120, 0.066 en el 140, 0.204 en el 160, 0.171 en el 180, 0.053 en el 200 y entre 0.033 y 0.039 desde el paso 220 hasta el final. La recompensa de entrenamiento sube hasta 1.0 con un `top_frequency_mean` de 1.0, lo que indica que las 10 rollouts del grupo convergen a la misma salida: la señal de autoetiquetado deja de ser informativa y el modelo se entrena contra su propia respuesta colapsada. El patrón coincide con el observado en Gemma-3-4B TTRL sobre OpenR1 y en Gemma-3-12B TTRL sobre MMR1, donde tampoco se superó al modelo base.

El protocolo de evaluación declarado para las tablas del artículo es la versión v2: temperatura 0, top_p 0.95, 16 000 tokens de salida máxima, prompt con respuesta en caja (`boxed`), corrección por reglas con mathruler más un juez Qwen2.5-32B, selección por endpoint y media AVG4 sobre MathVista, MathVision, MathVerse y We-Math.

## Capacidades

- Generación de texto y razonamiento multimodal (imagen + texto) heredados de Gemma-3-12B-it: el modelo base es capaz de resolver problemas matemáticos con soporte visual, tareas que la receta intenta reforzar.
- Razonamiento matemático visual: es la capacidad objetivo del entrenamiento, medida con MathVista-150 y con la suite AVG4 (MathVista, MathVision, MathVerse, We-Math).
- Generación de cadenas de razonamiento largas: el protocolo de evaluación permite hasta 16 000 tokens de salida y el entrenamiento usa `max_completion_length` 1024.
- Muestreo múltiple con voto mayoritario: la variante TTRL genera K = 10 rollouts por prompt y agrega la respuesta por frecuencia, aunque en este run ese mecanismo degeneró.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponibles (la ficha no declara idiomas).
- Capacidades especiales (modo «thinking», audio, vídeo): no disponibles. El modelo base Gemma-3-12B-it es multimodal de imagen y texto, pero la ficha no detalla el alcance exacto de las modalidades soportadas tras el ajuste.

## Casos de uso

Advertencia previa: dado que el run colapsó y que ningún checkpoint guardado supera al modelo base, los casos de uso realistas son de investigación y reproducción, no de despliegue en producción.

- Estudio de colapso por autoetiquetado en RL: el repositorio permite analizar por qué el voto mayoritario degenera en autocorroboración, inspeccionando `training/train.log`, `trainer_state_best`, `trainer_state_endpoint` y `best_metric` para reconstruir la curva de recompensa frente a la curva de validación.
- Fixture de regresión para pipelines de RL multimodal: los scripts y logs sirven como caso de prueba que cualquier framework de RL debería detectar y abortar, por ejemplo mediante una comprobación de diversidad de rollouts que corte el entrenamiento cuando `top_frequency_mean` se aproxima a 1.0.
- Reproducción de la receta mmupt tier big: el autor indica que la configuración es idéntica al script de referencia `examples/mmr1_gemma3_12b_gt_mmupt.sh` (columna Gemma), lo que permite replicar el experimento con o sin `--self_labeling` y comparar ambos brazos.
- Reutilización del checkpoint `best/` (paso 80) como inicialización: al ser el mejor checkpoint guardado dentro de un run degradado, puede servir como punto de partida para un reajuste supervisado con datos etiquetados reales, verificando antes que no arrastra el sesgo de colapso.
- Validación de arneses de evaluación matemática: el protocolo v2 (temperatura 0, top_p 0.95, 16 000 tokens, prompt `boxed`, mathruler más juez Qwen2.5-32B) es reutilizable para medir cualquier modelo multimodal de matemáticas y comparar resultados entre implementaciones.
- Auditoría de coste y trazas de entrenamiento: los registros del job 327291 (34 h 55 min en 4 GPUs A100) permiten estimar el coste de un ciclo de TTRL de una época sobre un modelo de 12 000 millones de parámetros y planificar presupuestos de cómputo para experimentos equivalentes.
- Docencia sobre RL con recompensa autorreferencial: el caso ilustra con números concretos por qué una recompensa que alcanza 1.0 no implica una mejora, algo útil en cursos y seminarios de ajuste fino.

## Benchmarks y rendimiento

Los únicos datos numéricos proporcionados son la validación en bucle sobre MathVista-150 durante el entrenamiento. No hay resultados publicados del protocolo v2 (AVG4) para este checkpoint, ni comparaciones completas con otros modelos.

| Paso de entrenamiento | MathVista-150 (holdout, en bucle) |
|---|---|
| 0 (modelo base) | 0.349 |
| 20 | 0.243 |
| 40 | 0.250 |
| 60 | 0.197 |
| 80 (`best/`) | 0.224 |
| 100 | 0.224 |
| 120 | 0.184 |
| 140 | 0.066 |
| 160 | 0.204 |
| 180 | 0.171 |
| 200 | 0.053 |
| 220 - 640 (`endpoint/`) | 0.033 - 0.039 |

Lectura de la tabla: el mejor checkpoint guardado (`best/`, paso 80, 0.224) está 12,5 puntos porcentuales por debajo del modelo base (0.349). El autor indica que `best/` es únicamente el mejor entre los checkpoints guardados cada 80 pasos, no un modelo que mejore la línea base.

Para el resto de métricas (MMLU, HumanEval, GSM8K, AVG4 sobre MathVista/MathVision/MathVerse/We-Math, etc.): no se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada (pesos): alrededor de 24-25 GB en bf16/fp16 para los aproximadamente 12 000 millones de parámetros; en int8 unos 13 GB y en cuantización de 4 bits alrededor de 7-8 GB, aunque el repositorio no publica ficheros cuantizados.
- VRAM estimada (inferencia real): con el protocolo de evaluación declarado (16 000 tokens de salida) el consumo de caché KV es elevado; conviene reservar 40 GB o más por instancia en bf16, y 80 GB para lotes mayores o contextos largos.
- GPUs recomendadas: A100 de 40 GB o 80 GB y H100 son las opciones cómodas; es el hardware usado en el entrenamiento (4 x A100 en el cluster de la JHU).
- GPUs de consumo: una RTX 4090 (24 GB) queda al límite en bf16 y obliga a contexto corto y lote 1, con posible descarga a CPU. Con cuantización de 4 bits sí cabría en tarjetas de 8-12 GB, pero requeriría convertir los pesos a GGUF, algo que el repositorio no ofrece.
- Opciones de despliegue: los pesos safetensors son compatibles con vLLM y TGI; llama.cpp y Ollama solo tras una conversión a GGUF. No se documenta ningún despliegue concreto.
- Latencia y throughput: no disponibles.
- Nota de almacenamiento: el repositorio ocupa 48,8 GB porque incluye varios checkpoints (best, endpoint y logs), no un único conjunto de pesos.

## Comparativa con modelos similares

Datos limitados a lo declarado en la ficha del autor. Las celdas marcadas como «no disponible» no aparecen en la información proporcionada.

| Modelo | Parametros | Contexto | Rendimiento declarado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (`mllm-open-r1-ttrl-gemma3-12b-mmupt-full`) | ~12 000 millones | No disponible | MathVista-150: 0.224 en el mejor checkpoint (paso 80); 0.033-0.039 al final; sin superar al base (0.349) | No disponible | HuggingFace, 0 descargas, 0 «likes», 48,8 GB |
| Gemma-3-12B-it (modelo base del run) | ~12 000 millones | No confirmado en esta ficha | MathVista-150: 0.349 (paso 0, referencia del run) | Terminos de uso de Gemma (segun el modelo base; no confirmado en esta ficha) | HuggingFace / Google |
| Gemma-3-12B TTRL sobre MMR1 (referencia mencionada por el autor) | ~12 000 millones | No disponible | Sin ganancia sobre el base, segun la ficha | No disponible | No disponible |
| Gemma-3-4B TTRL sobre OpenR1 (referencia mencionada por el autor) | ~4 000 millones | No disponible | Sin ganancia sobre el base, segun la ficha | No disponible | No disponible |

No se dispone de comparaciones numéricas frente a alternativas de la misma categoría (por ejemplo, otros modelos multimodales de 7 a 12 000 millones de parámetros para matemáticas visuales) en la información proporcionada.

## Limitaciones y advertencias

- Colapso confirmado: el run degeneró. La validación cayó de 0.349 a 0.033-0.039 y ningún checkpoint guardado supera al modelo base. No debe usarse en producción ni citarse como evidencia de que TTRL funciona.
- Recompensa engañosa: la recompensa de entrenamiento alcanzó 1.0 con `self_labeling/top_frequency_mean` de 1.0, señal de que las 10 rollouts coincidían en la misma respuesta. Una recompensa alta no implica mejora de calidad.
- Riesgo elevado de alucinación y de razonamiento incorrecto: un modelo entrenado contra su propia salida colapsada tiende a producir respuestas consistentes pero erróneas, sin diversidad.
- `best/` no es un buen checkpoint: es solo el mejor entre los guardados cada 80 pasos dentro de un run degradado, no un modelo que mejore la línea base.
- Licencia no declarada: la ficha no especifica licencia. Cualquier uso comercial exige verificar primero los términos aplicables al modelo base Gemma-3-12B-it, que no se detallan aquí.
- Idiomas no declarados: no hay información sobre cobertura multilingüe ni sobre el comportamiento en castellano.
- Contexto y cuantizaciones no documentados: no se indica la longitud de contexto efectiva ni se publican versiones cuantizadas, lo que complica el despliegue en hardware de consumo.
- Origen de datos opaco: la ficha no describe la composición del dataset de entrenamiento ni el conjunto exacto de ejemplos; solo menciona OpenR1 con secuencias de 8k y la validación MathVista-150.
- Inconsistencia en las fechas: la ficha indica entrenamiento del 2026-09-03 al 2026-09-05, pero el job 327291 se describe como ejecutado del 2026-09-12 05:35 al 2026-09-13 16:30. Conviene tratar las fechas como no fiables.
- Trazabilidad limitada: 0 descargas y 0 «likes»; no hay revisión externa ni resultados AVG4 publicados para este checkpoint.

## Enlaces

- HuggingFace: https://huggingface.co/logan7000/mllm-open-r1-ttrl-gemma3-12b-mmupt-full
- Script de referencia de la receta citado en la ficha: `examples/mmr1_gemma3_12b_gt_mmupt.sh` (columna Gemma)
- Ruta local del run citada por el autor: `/weka/scratch/jhu/dssg2026-ext-rghani1/yyang331/mllm-repro-out/mllm-co-grpo-dp/openr1_gemma3_12b_ttrl_mmupt`
- Identificador del job de entrenamiento: job 327291, cluster a100 de la Johns Hopkins University
- Resultados de la búsqueda web: no se han encontrado enlaces relevantes. Los resultados devueltos corresponden al programa de fidelización Flying Blue de Air France-KLM y no guardan relación con el modelo.
- Paper, blog o repositorio asociados: no disponibles en la información proporcionada.
