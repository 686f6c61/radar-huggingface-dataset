# armnet/pi0_rbb_so101_insert_gear_in_gripper

## Resumen

`armnet/pi0_rbb_so101_insert_gear_in_gripper` es un checkpoint de política robótica (vision-language-action, VLA) entrenado sobre la base `pi0_base` del framework JAX `openpi`. Lo publica el usuario `armnet` como parte de RoboBuilderBench (RBB), un conjunto de baselines para tareas de manipulación con el brazo SO-101. La tarea concreta es `so101_insert_gear_in_gripper`: insertar un engranaje en la pinza del robot, con observaciones de cámara cenital y de muñeca a 30 Hz y un espacio de acciones de 6 dimensiones.

El modelo no es un LLM de propósito general, sino una política de control entrenada por imitación con flow matching sobre un dataset específico (`armnet/so101_insert_gear_in_gripper`). El repositorio contiene únicamente el checkpoint final (paso 19.999) en formato Orbax OCDBT, más los ficheros de normalización de acciones y un manifiesto de integridad; no incluye el estado del optimizador. El tamaño del repo es de 12,0 GB.

Su relevancia es acotada: sirve como referencia reproducible de un baseline de manipulación robótica dentro de RBB, con receta de entrenamiento, curva de pérdida y run de W&B documentados. No está pensado para inferencia de texto ni para uso fuera del entorno robótico SO-101.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language-action (VLA) basada en `pi0_base` (framework JAX `openpi`); `pi05=False` |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en Orbax OCDBT) |
| Idiomas soportados | no disponible (modelo de control robótico, no de texto) |
| Licencia | no disponible |
| Formato de pesos | Orbax OCDBT (`checkpoint-19999/params/`) |
| Espacio de acciones | 6 dimensiones, `action_horizon=30`, delta joints + grippers absolutos |
| Frecuencia de control | 30 Hz |
| Entradas sensoriales | Cámara cenital (top) y de muñeca (wrist) |
| Dataset de entrenamiento | `armnet/so101_insert_gear_in_gripper` @ `42e271c25c30d934449c4acf73af96c48ff86b6f` |
| Hardware de entrenamiento | 2x NVIDIA GH200 120 GB (data-parallel, `fsdp_devices=1`) |
| Duracion del entrenamiento | 04:37:21 |

## Arquitectura y entrenamiento

El checkpoint deriva de `pi0_base`, la arquitectura VLA de la familia pi0 implementada en el framework JAX `openpi`. El entrenamiento se realizó con flow matching (la pérdida reportada es de flow matching, no de cross-entropy) sobre el dataset de la tarea, con normalización de acciones por paso temporal (`norm_stats_actions_per_timestep.json`) y un horizonte de acción de 30 pasos. La configuración concreta es `pi0_rbb_so101_insert_gear_in_gripper`, con `pi05=False`.

La optimización usó `num_train_steps=20000`, `batch_size=32` y un schedule de learning rate coseno de 2,5e-5 a 2,5e-6, con guardado cada 5.000 pasos. La pérdida de flow matching bajó de 0,7021 (paso 0) a 0,0221 (paso 19.900), y la norma del gradiente decayó de 14,0995 a 0,5686, lo que indica convergencia estable sin signos aparentes de divergencia. El checkpoint publicado excluye el `train_state/` (estado del optimizador), por lo que no es directamente reanudable para fine-tuning sin reconstruir el optimizador.

## Capacidades

- Control robótico de manipulación: genera secuencias de acciones de 6 dimensiones para el brazo SO-101 a 30 Hz.
- Ejecución de la tarea específica `insert_gear_in_gripper` (insertar un engranaje en la pinza).
- Política condicionada por visión: consume observaciones de cámara cenital y de muñeca.
- Generación de trayectorias con horizonte de 30 pasos y acciones normalizadas por paso temporal.
- Aprendizaje por imitación vía flow matching sobre un dataset de demostraciones.
- No soporta tool calling, function calling, agentes multi-paso, razonamiento textual ni capacidades multilingües: es una política de control, no un modelo de lenguaje.

## Casos de uso

- Baseline de referencia en RoboBuilderBench: sirve para comparar nuevas políticas sobre la tarea `so101_insert_gear_in_gripper` con una receta y una curva de pérdida reproducibles.
- Reproducción de experimentos: el run de W&B y la receta (pasos, batch, LR, horizonte) permiten replicar el entrenamiento con `openpi` sobre el mismo dataset.
- Evaluación de pipelines de manipulación: útil para validar infraestructura de inferencia robótica (cámaras top/wrist, frecuencia de 30 Hz, espacio de acciones de 6-D) antes de entrenar políticas propias.
- Punto de partida para fine-tuning: aunque el checkpoint no incluye el estado del optimizador, los pesos pueden servir como inicialización para tareas relacionadas con SO-101.
- Estudio de convergencia en flow matching: la progresión de pérdida y norma de gradiente documentada permite analizar dinámicas de entrenamiento en políticas VLA pequeñas.
- Verificación de integridad de checkpoints: el `CHECKPOINT_MANIFEST.json` y la herramienta `verify-checkpoint` sirven como ejemplo de buenas prácticas de empaquetado de artefactos de entrenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo reporta la curva de pérdida de entrenamiento (flow matching), no métricas de éxito en la tarea:

| Step | Loss | Grad Norm |
|---:|---:|---:|
| 0 | 0,7021 | 14,0995 |
| 500 | 0,2500 | 3,2749 |
| 1.000 | 0,2256 | 2,6246 |
| 2.000 | 0,1732 | 2,1000 |
| 5.000 | 0,1016 | 1,3314 |
| 10.000 | 0,0554 | 0,8927 |
| 15.000 | 0,0335 | 0,7272 |
| 19.900 | 0,0221 | 0,5686 |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada; el repo pesa 12,0 GB y el entrenamiento usó 2x GH200 de 120 GB en data-parallel.
- GPU recomendadas para entrenamiento: 2x NVIDIA GH200 120 GB (configuración reportada).
- GPU para inferencia: no disponible; al ser una política VLA pequeña en comparación con LLM, es plausible que quepa en GPUs de consumo, pero no hay datos publicados que lo confirmen.
- Opciones de despliegue: framework JAX `openpi` (formato Orbax OCDBT). No se indica soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles; la política opera a 30 Hz sobre el robot SO-101, pero no se reportan tiempos de inferencia medidos.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye otros checkpoints de RoboBuilderBench ni políticas comparables con datos de rendimiento que permitan una comparación rigurosa.

## Limitaciones y advertencias

- Modelo específico de una única tarea (`insert_gear_in_gripper`) y un único robot (SO-101); no generaliza a otras tareas ni plataformas sin reentrenamiento.
- No es un modelo de lenguaje: no genera texto, no razona simbólicamente ni soporta tool calling.
- Licencia no especificada: no se puede asumir uso comercial sin consultar al autor.
- El checkpoint excluye el estado del optimizador, lo que dificulta reanudar el entrenamiento exactamente desde el paso 19.999.
- Solo se publica el checkpoint final; no hay checkpoints intermedios para analizar la evolución de la política.
- Sin métricas de éxito en la tarea publicadas: la pérdida de flow matching no garantiza buen rendimiento en el robot real.
- Riesgo de sobreajuste al dataset concreto y a las condiciones de iluminación, cámara y calibración del entorno de recogida de datos.
- Cero descargas y cero likes en el momento de la consulta: sin validación externa por parte de la comunidad.
- Requiere verificar la integridad de los ficheros con `verify-checkpoint` contra `CHECKPOINT_MANIFEST.json` tras la descarga.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/armnet/pi0_rbb_so101_insert_gear_in_gripper
- Dataset: `armnet/so101_insert_gear_in_gripper` (commit `42e271c25c30d934449c4acf73af96c48ff86b6f`)
- Run de W&B: https://wandb.ai/pravsels/rbb-pi0/runs/9yxg7xp7
- Framework `openpi` (JAX): no se proporciona URL en la información disponible
- Paper de pi0: no se proporciona URL en la información disponible
