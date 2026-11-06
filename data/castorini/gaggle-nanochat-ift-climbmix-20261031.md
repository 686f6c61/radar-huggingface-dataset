# castorini/gaggle-nanochat-ift-climbmix-20261031

## Resumen

gaggle-nanochat-ift-climbmix-20261031 es un modelo de chat de 3.290 millones de parámetros derivado del checkpoint preentrenado castorini/gaggle-nanochat-pretrained-climbmix-20260924 (paso 227.158), desarrollado por el grupo Castorini. Se ha entrenado con la receta de chat estándar de nanochat en dos etapas —midtraining y ajuste supervisado (SFT)— sin refuerzo con retroalimentación humana (RLHF) ni optimización directa de preferencias (DPO). El resultado es un modelo conversacional pequeño, con licencia MIT, orientado a inglés y con una ventana de contexto de 2.048 tokens.

La arquitectura es la del modelo base sin cambios: un transformer decoder-only de profundidad 34, anchura 2.176, 17 cabezas de atención de dimensión 128 y un tokenizador BPE a nivel de byte de 32.768 entradas. De los 3.290 millones de parámetros, 1.210 millones corresponden a búsquedas de embedding de valor, lo que reduce el coste efectivo de inferencia respecto a un modelo denso del mismo tamaño nominal. El modelo se distribuye con los pesos en safetensors y es compatible tanto con transformers (con trust_remote_code=True) como con el código propio de nanochat y su plugin de vLLM.

Su relevancia radica en que documenta de forma reproducible la receta de chat de nanochat sobre un preentrenamiento con ClimbMix, con evaluación detallada en formato de chat y comparación directa contra el checkpoint base y contra otra reproducción de la misma receta. Es un modelo de referencia para investigación en ajuste conversacional de bajo coste (entrenado en una sola H100 80GB en algo más de tres horas y media entre ambas etapas) más que un modelo para producción a gran escala.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (nanochat depth-34): 34 capas, anchura 2.176, 17 cabezas de atención de dimensión 128 |
| Parametros totales | 3.286.633.962 (3,29B); 1,21B corresponden a búsquedas de embedding de valor |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 2.048 tokens |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Inglés (en) |
| Licencia | MIT |
| Formato de pesos | safetensors; compatible con transformers (trust_remote_code=True), código de nanochat y plugin de vLLM |
| Tokenizador | BPE a nivel de byte, 32.768 entradas |
| Modelo base | castorini/gaggle-nanochat-pretrained-climbmix-20260924 (paso 227.158) |
| Formato de chat | `<\|bos\|>`, `<\|user_start\|>`...`<\|user_end\|>`, `<\|assistant_start\|>`...`<\|assistant_end\|>`; el mensaje de sistema se fusiona con el primer mensaje de usuario |
| Código de referencia | karpathy/nanochat en el commit `92d63d4` |

## Arquitectura y entrenamiento

El modelo mantiene íntegra la arquitectura del checkpoint base: un transformer decoder-only de 34 capas con anchura 2.176, 17 cabezas de atención de 128 dimensiones y contexto de 2.048 tokens. El tokenizador también es el del modelo base (BPE a nivel de byte con 32.768 entradas). Solo cambian los pesos. La receta de chat es la versión de dos etapas de nanochat en el commit `348fbb3` (scripts/mid_train.py y después scripts/chat_sft.py), portada sobre el código `92d63d4` con el que se entrenó el modelo base; el port solo modifica APIs y reporte (sin autocast, porque `92d63d4` gestiona el dtype de cómputo en el modelo, y la configuración completa se guarda en los metadatos del checkpoint). Ambas etapas arrancan con un optimizador nuevo.

El midtraining consistió en una época de 816 pasos de 524.288 tokens (secuencias de 2.048 tokens con empaquetado best-fit alineado a BOS y pérdida sobre todos los tokens), con 849.656 filas en total: 460.341 de smol-smoltalk train, 99.842 de MMLU auxiliary_train, 7.473 de GSM8K main train, 2.000 conversaciones de identidad de nanochat (2 épocas), 200.000 de SimpleSpelling y 80.000 de SpellingBee. Se usaron tasas de aprendizaje de 0,2 (embeddings), 0,004 (unembedding) y 0,02 (Muon, matrices de bloque), sin weight decay, constantes durante el 80% del entrenamiento y con decaimiento lineal hasta cero; el momento de Muon pasó de 0,85 a 0,95 en los primeros 300 pasos. El SFT fue una época de 701 pasos de 32 conversaciones con pérdida solo en los tokens del asistente, sobre 22.443 filas: ARC-Easy train (2.251), ARC-Challenge train (1.119), GSM8K main train (7.473), las primeras 10.000 de smol-smoltalk tras el shuffle con semilla 42, 1.000 conversaciones de identidad, 300 de SimpleSpelling y 300 de SpellingBee, con las mismas tasas escaladas por 0,02 y decaimiento lineal a cero. Ninguna etapa reutiliza texto de preentrenamiento (ClimbMix). El cómputo total fue de 3 h 10 min de midtraining y 25 min de SFT en una NVIDIA H100 80GB, manteniendo los tamaños de lote de la receta mediante acumulación de gradientes sobre micro-lotes de 4 secuencias.

## Capacidades

- Generación de texto conversacional en inglés con formato de chat multi-turno definido por nanochat.
- Razonamiento básico de opción múltiple (ARC-Easy, ARC-Challenge, MMLU) y matemáticas elementales (GSM8K), con resultados moderados.
- Generación de código a pequeña escala (HumanEval), con un rendimiento limitado (15,85 de pass@1 en el checkpoint SFT).
- Tareas de ortografía y manipulación de cadenas (SimpleSpelling, SpellingBee), incluidas en el midtraining y el SFT.
- Conversaciones de identidad de nanochat, incorporadas mediante datos específicos en ambas etapas.
- No se documenta soporte de tool calling ni de function calling.
- No se documenta soporte de agentes ni de razonamiento multi-paso explícito.
- No se documenta modo thinking, visión ni audio.
- Capacidad multilingüe limitada al inglés según la model card.

## Casos de uso

- Investigación reproducible sobre recetas de ajuste conversacional: sirve como referencia para replicar la receta de dos etapas de nanochat (midtraining + SFT) sobre un preentrenamiento con ClimbMix, comparando directamente con el checkpoint base y con otras reproducciones de la misma receta.
- Evaluación comparativa de formatos de prompt: permite medir la diferencia entre evaluación 5-shot en texto plano y evaluación zero-shot en formato de chat, un fenómeno documentado en la propia model card (el modelo base rinde mejor en 5-shot y los modelos de chat en formato de chat).
- Asistente conversacional ligero en inglés para prototipos: con 2.048 tokens de contexto y 3,29B de parámetros, puede desplegarse en una sola GPU para demostraciones de chat con formato nanochat.
- Generación de respuestas de opción múltiple: útil en pipelines de evaluación automática de preguntas tipo ARC o MMLU con puntuación por letra de respuesta.
- Tareas de ortografía y manipulación de texto controlada: los datos de SimpleSpelling y SpellingBee del entrenamiento lo hacen adecuado para experimentos sobre corrección ortográfica o transformación de cadenas.
- Experimentos de ajuste fino posteriores: al estar bajo licencia MIT y con pesos en safetensors compatibles con transformers y nanochat, sirve como punto de partida para SFT adicional en dominios concretos.
- Despliegue con vLLM: el plugin de vLLM del modelo base está incluido, lo que permite servir el modelo en entornos de inferencia de alto rendimiento una vez validado el checkpoint.

## Benchmarks y rendimiento

Evaluación de chat de nanochat (scripts/chat_eval.py en `92d63d4`), en formato de chat y zero-shot: ARC y MMLU por letra de respuesta, GSM8K y HumanEval por generación greedy (hasta 512 tokens). ChatCORE es la media de precisión centrada sobre estas cinco tareas.

| Modelo | ARC-Easy | ARC-Challenge | MMLU | GSM8K | HumanEval | ChatCORE |
|---|---:|---:|---:|---:|---:|---:|
| Este modelo (SFT, paso 700) | 81,57 | 68,00 | 44,93 | 30,63 | 15,85 | 0,412 |
| Midtraining (paso 816) | 80,01 | 65,70 | 44,32 | 13,95 | 16,46 | 0,368 |
| nanochat d34 + misma receta (pankajmathur/nanochat-d34-finetuned), SFT | 72,10 | 54,18 | 43,04 | 13,27 | 10,37 | 0,299 |

La fila de nanochat d34 procede de su model card; su ChatCORE de 0,416 promedia seis tareas incluyendo SpellingBee, que chat_eval en `92d63d4` no incluye, por lo que el 0,299 es la media de las mismas cinco tareas recalculada a partir de sus números por tarea.

MMLU y MMLU-Pro en dos formatos, para el modelo base y ambos checkpoints de chat:

| Modelo | MMLU (5-shot) | MMLU-Pro (5-shot) | MMLU (formato nanochat) | MMLU-Pro (formato nanochat) |
|---|---:|---:|---:|---:|
| Modelo base, paso 227158 | 49,22 | 17,60 | 23,12 | 11,66 |
| Midtraining (paso 816) | 36,25 | 13,82 | 44,32 | 19,90 |
| Este modelo (SFT, paso 700) | 36,68 | 13,36 | 44,93 | 19,97 |

El formato 5-shot usa LM Evaluation Harness 0.4.9 (mmlu, leaderboard_mmlu_pro) con prompts en texto plano, cinco ejemplos resueltos, puntuación por log-verosimilitud de la letra y contexto de 2.048 tokens. El formato nanochat es zero-shot en formato de chat, puntuado por letra; la tarea MMLU-Pro propia (code/tasks/mmlu_pro.py) aplica la tarea MMLU de nanochat a las 12.032 preguntas de test de MMLU-Pro, con las opciones de cada pregunta etiquetadas de A a J (el azar puntúa 11,1%). Cada modelo rinde mejor en el formato para el que fue entrenado. El modelo base reporta 49,3 y 17,8 en 5-shot de una ejecución anterior en otra GPU. Todas las cifras de esta sección proceden del código de nanochat en una sola H100. La pérdida de validación del midtraining bajó de 0,390 a 0,288 bits por byte; la del SFT fue 0,712.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada. Como referencia de orden de magnitud, los 3,29B de parámetros en fp16 ocuparían aproximadamente 6,6 GB de pesos, y en cuantizaciones de 8 y 4 bits aproximadamente 3,3 GB y 1,7 GB respectivamente, sin contar caché KV ni overhead del runtime; estas cifras son estimaciones por tamaño y no datos publicados por el autor.
- GPU recomendadas: el entrenamiento se realizó en una NVIDIA H100 80GB; no se documentan requisitos de inferencia específicos.
- Compatibilidad con GPU de consumo: no documentada. Por tamaño de pesos, un modelo de 3,29B en fp16 cabría en GPUs de consumo con 8 GB o más de VRAM, pero el autor no lo confirma.
- Opciones de despliegue: transformers con trust_remote_code=True, código propio de nanochat y plugin de vLLM (el chequeo de este checkpoint en vLLM seguía en ejecución según la model card). No se mencionan llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | ChatCORE (5 tareas) | Licencia | Disponibilidad |
|---|---:|---:|---:|---|---|
| gaggle-nanochat-ift-climbmix-20261031 | 3,29B (1,21B en embeddings de valor) | 2.048 | 0,412 | MIT | Hugging Face (castorini) |
| castorini/gaggle-nanochat-pretrained-climbmix-20260924 (base) | 3,29B | 2.048 | No evaluado en chat; MMLU 5-shot 49,22 | MIT | Hugging Face (castorini) |
| pankajmathur/nanochat-d34-finetuned | d34 (misma arquitectura) | No disponible | 0,299 (recalculado a 5 tareas) | No disponible en la información | Hugging Face (pankajmathur) |

La comparación se limita a los modelos citados en la model card; no se dispone de datos de otros modelos de tamaño similar para contrastar.

## Limitaciones y advertencias

- Ventana de contexto de solo 2.048 tokens, insuficiente para documentos largos o conversaciones extensas.
- Entrenado únicamente en inglés; el rendimiento en otros idiomas no está documentado y previsiblemente será bajo.
- Resultados débiles en código (HumanEval 15,85) y matemáticas (GSM8K 30,63), lejos de modelos especializados del mismo tamaño.
- Riesgo de alucinación inherente a un modelo de 3,29B sin RLHF ni DPO; no se documentan mitigaciones.
- Sesgos conocidos: no documentados en la información proporcionada.
- El modelo no ha sido alineado con preferencias humanas (sin RL, según la model card), por lo que puede producir respuestas no deseadas en producción.
- Licencia MIT: permite uso comercial, pero el autor no ofrece garantías ni documenta evaluaciones de seguridad.
- El soporte en vLLM estaba pendiente de validación en el momento de publicación de la model card (chequeo en ejecución).
- El formato de chat es específico de nanochat (etiquetas `<|user_start|>`, `<|assistant_start|>`, etc.); usarlo con otros formatos degradará el rendimiento, como muestran las diferencias entre evaluaciones 5-shot y en formato de chat.
- El mensaje de sistema se fusiona con el primer mensaje de usuario, lo que limita el control fino sobre instrucciones de sistema.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/castorini/gaggle-nanochat-ift-climbmix-20261031
- Modelo base: https://huggingface.co/castorini/gaggle-nanochat-pretrained-climbmix-20260924
- Repositorio nanochat: https://github.com/karpathy/nanochat
- Dataset smol-smoltalk: https://huggingface.co/datasets/HuggingFaceTB/smol-smoltalk
- Dataset ClimbMix: https://huggingface.co/datasets/karpathy/climbmix-400b-shuffle
- Modelo comparable nanochat-d34-finetuned: https://huggingface.co/pankajmathur/nanochat-d34-finetuned
