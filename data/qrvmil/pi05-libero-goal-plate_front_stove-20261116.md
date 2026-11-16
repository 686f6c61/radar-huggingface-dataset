# qrvmil/pi05-libero-goal-plate_front_stove-20261116

## Resumen

Pi0.5 SFT para LIBERO-goal es un ajuste fino supervisado (SFT) completo del modelo base `lerobot/pi05_base`, publicado por el usuario qrvmil en Hugging Face. El modelo resuelve una unica tarea de manipulacion robotica: empujar el plato hacia la parte frontal de la cocina (task ID 5 del suite LIBERO-goal). Se trata de un experimento de investigacion con evaluaciones aun pendientes, no de un modelo listo para produccion.

El entrenamiento consistio en 1000 pasos de SFT completo sobre 33 demostraciones (4990 fotogramas) filtradas por tarea exacta del dataset `lerobot/libero`. Todos los 4143 millones de parametros fueron entrenables, sin LoRA ni backbone congelado. El modelo usa pesos en FP32 con autocast BF16, AdamW, batch 8 y una tasa de aprendizaje de 5e-5 con decaimiento coseno hasta 5e-6.

La relevancia de esta ficha es acotada: se trata de un artefacto de investigacion (single-task, sin benchmarks publicados, con 0 descargas) que ilustra el flujo de trabajo de LeRobot para politicas de robot basadas en flow matching. Es util como referencia tecnica del pipeline, no como modelo de proposito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Politica de robot Pi0.5 (flow matching) sobre backbone PaliGemma; implementada en LeRobot |
| Parametros totales | 4.143.404.816 (todos entrenables en el SFT) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (pesos entrenados en FP32 con autocast BF16) |
| Idiomas soportados | No disponible (modelo de robotica, no de lenguaje general) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (checkpoints LeRobot en `checkpoints/000XXX/pretrained_model`) |

## Arquitectura y entrenamiento

El modelo parte de `lerobot/pi05_base`, una politica de robotica basada en flow matching construida sobre el backbone de vision-lenguaje PaliGemma. La accion se genera mediante un cabezal de flow matching con 10 pasos de inferencia y un chunk de acciones de longitud 50, del que se ejecutan 10 acciones por paso. La entrada consta de dos camaras mas una camara enmascarada, con normalizacion media/desviacion estandar tomada del dataset original.

El ajuste fino es un SFT completo de 1000 pasos sobre 33 demostraciones (4990 fotogramas) del dataset `lerobot/libero`, filtradas por la tarea exacta (task ID 5). Se usaron pesos en FP32 y estado AdamW, autocast BF16, batch 8, semilla 1000, learning rate 5e-5 con warmup de 50 pasos y decaimiento coseno hasta 5e-6 en el paso 1000. No se empleo LoRA ni se congelo el backbone. El tokenizador usa el vocabulario oficial publico Big Vision PaliGemma con IDs verificados, guardado en `qrvmil/pi05-paligemma-tokenizer-20261116`. Se publican checkpoints reanudables en los pasos 250, 500, 750 y 1000, cada uno con directorio `pretrained_model` y `training_state` (optimizador y RNG).

## Capacidades

- Manipulacion robotica de una unica tarea: empujar el plato hacia la parte frontal de la cocina (LIBERO-goal, task ID 5).
- Control del efector final relativo a 20 Hz con limite de 300 pasos por episodio.
- Procesamiento de entrada multimodal: dos camaras mas una camara enmascarada a 256x256 pixeles.
- Generacion de acciones por flow matching con chunk de 50 acciones y ejecucion de 10.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso de proposito general.
- No tiene capacidades multilingues ni de generacion de texto.
- No dispone de modo thinking, vision general, audio ni otras capacidades fuera de la politica robotica.

## Casos de uso

- Investigacion en aprendizaje por imitacion: reproducir el pipeline de SFT completo de LeRobot sobre una tarea LIBERO concreta para estudiar el efecto del numero de pasos y checkpoints en la tasa de exito.
- Evaluacion comparativa de checkpoints: los checkpoints en 250, 500, 750 y 1000 pasos permiten analizar la curva de aprendizaje de una politica de flow matching en una tarea de manipulacion.
- Base para experimentos de single-task SFT: sirve como punto de partida para replicar el ajuste con otros task IDs del suite LIBERO-goal.
- Docencia y formacion: ejemplo didactico de configuracion de entrenamiento (FP32, BF16 autocast, AdamW, cosine decay) y de evaluacion con 5 intentos y semillas fijas.
- Validacion de infraestructura de robotica: probar el flujo de carga de checkpoints con `PI05Policy.from_pretrained` y el tokenizador PaliGemma verificado.
- Referencia de reproducibilidad: el model card documenta revision del dataset, commit de LeRobot, semilla y normalizacion, lo que permite auditar el experimento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La tabla de evaluacion del model card presenta los pasos 250, 500, 750 y 1000 con estado "pending" en exitos y tasa de exito (SR). La evaluacion se realiza con 5 intentos (estados iniciales 0-4, semillas de entorno 1000-1004, reinicios duros, 256x256 pixeles, control relativo del efector final a 20 Hz, limite de 300 pasos), lo que da una estimacion gruesa en incrementos de 20 puntos. Los resultados crudos se guardan en `evaluations/<step>/eval.json`.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la informacion proporcionada. Con 4.143 millones de parametros, una estimacion orientativa en FP16 rondaria los 8-9 GB solo de pesos, mas overhead de activaciones y camaras; en FP32 se duplicaria. No se confirma ningun dato.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no confirmada. Por tamano, cabria teoricamente en GPUs con 16-24 GB de VRAM en precision reducida, pero no hay validacion publicada.
- Opciones de despliegue: LeRobot (`PI05Policy` de `lerobot.policies.pi05.modeling_pi05`) mediante `huggingface_hub.snapshot_download`. No se documentan vLLM, llama.cpp, Ollama ni TGI (no aplicables a este tipo de politica).
- Latencia y throughput: no disponibles. El control se ejecuta a 20 Hz y la inferencia usa 10 pasos de flow matching, pero no se publican tiempos medidos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| qrvmil/pi05-libero-goal-plate_front_stove-20261116 | 4.143 M | No disponible | Single-task LIBERO-goal (task 5) | Apache 2.0 | Hugging Face, 0 descargas |
| lerobot/pi05_base | No disponible en la informacion | No disponible | Politica base multi-tarea | No disponible en la informacion | Hugging Face (modelo base) |
| Otros SFT single-task de Pi0.5 sobre LIBERO | No disponible | No disponible | Tareas LIBERO especificas | No disponible | No disponible |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo de tarea unica: solo resuelve "empujar el plato hacia la parte frontal de la cocina" (task ID 5 de LIBERO-goal); no generaliza a otras tareas.
- Evaluaciones pendientes: no hay tasas de exito publicadas; el model card indica explicitamente que es un experimento en curso.
- Sin benchmarks ni validacion externa: 0 descargas y 0 likes en el momento de la consulta.
- Entrenado con solo 33 demostraciones (4990 fotogramas), lo que limita la robustez y favorece el sobreajuste.
- Evaluacion con 5 intentos: la tasa de exito tiene resolucion de 20 puntos, insuficiente para conclusiones finas.
- Sesgos conocidos: no documentados; al entrenarse con un dataset acotado, hereda los sesgos de las demostraciones y del entorno simulado LIBERO.
- Riesgo de alucinacion: no aplica en el sentido linguistico, pero la politica puede generar acciones no validas fuera de la distribucion de entrenamiento.
- Limitaciones de contexto e idioma: no aplica como modelo de lenguaje; no se documentan capacidades linguisticas.
- Licencia Apache 2.0: permite uso comercial, pero el modelo base y el dataset pueden tener condiciones adicionales no detalladas aqui.
- Caveat para produccion: no usar en entornos reales sin evaluacion adicional; es un artefacto de investigacion.

## Enlaces

- Hugging Face: https://huggingface.co/qrvmil/pi05-libero-goal-plate_front_stove-20261116
- Modelo base: https://huggingface.co/lerobot/pi05_base
- Tokenizador: https://huggingface.co/qrvmil/pi05-paligemma-tokenizer-20261116
- Dataset: https://huggingface.co/datasets/lerobot/libero
- Repositorio LeRobot: https://github.com/huggingface/lerobot (commit `781d3daccc64e8ce3e3d0910e64b2b0180551059`)
