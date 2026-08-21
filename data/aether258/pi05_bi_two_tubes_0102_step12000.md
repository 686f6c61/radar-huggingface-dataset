# Aether258/pi05_bi_two_tubes_0102_step12000

## Resumen

`Aether258/pi05_bi_two_tubes_0102_step12000` es un checkpoint de fine-tuning del modelo de robotica Pi0.5 (configuracion `pi05_bi` de openpi), desarrollado por Aether258 para una tarea de manipulacion bimanual de pick-and-place con dos tubos (azul y verde) e integracion de sensores tactiles. El modelo pertenece a la familia de modelos vision-language-action (VLA) y se distribuye bajo licencia Apache 2.0 a traves de la libreria LeRobot.

El checkpoint corresponde al paso 12000 de un entrenamiento planificado a 20000 pasos, con una loss de validacion held-out de 0.0538. El entrenamiento se realizo sobre un dataset fusionado de 1.019 episodios (802.719 frames) provenientes de dos fuentes (`KaiyueChen/two_tubes_01` y `KaiyueChen/two_tubes_02`), con seis flujos de camara: dos RGB y cuatro sensores tactiles. El modelo ejecuta una instruccion unica unificada en ingles que especifica la secuencia completa de manipulacion.

La relevancia de este checkpoint reside en que combina tres elementos: coordinacion bimanual, feedback tactil y fine-tuning eficiente mediante LoRA sobre un modelo fundacional de robotica. El repositorio ocupa 9.6 GB e incluye tanto los pesos de inferencia como el estado del optimizador para reanudar el entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | pi05_bi (vision-language-action, openpi) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | LeRobot v2.1 (directorio `checkpoint/params/` + `checkpoint/train_state/`) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura `pi05_bi` de openpi, un modelo vision-language-action que combina un backbone de lenguaje (LLM) con un experto de acciones y una torre de vision. La generacion de acciones se realiza mediante flow-matching, como indica la metrica de validacion utilizada (flow-matching loss). El fine-tuning emplea LoRA con rango 16 sobre el LLM y rango 32 sobre el experto de acciones, mientras que la torre de vision se fine-tunea completamente (el filtro de congelacion solo coincide con `.*llm.*`).

El entrenamiento se realizo sobre un dataset fusionado de dos fuentes: `KaiyueChen/two_tubes_01` (519 episodios, 425.115 frames) y `KaiyueChen/two_tubes_02` (500 episodios, 377.604 frames), totalizando 1.019 episodios y 802.719 frames a 30 fps. Los datos se registraron con LeRobot v2.1, con `robot_type=bimanual` e imagenes embebidas en archivos parquet. La particion de datos mantiene episodios held-out por repositorio fuente (10%, seed 42): 917 episodios de entrenamiento, 102 de `val_seen` (subconjunto de train) y 102 de `val_unseen` (held-out). Las estadisticas de normalizacion (cuantiles q01/q99) se calcularon solo sobre el split de entrenamiento.

El entrenamiento se ejecuto en 2x A100-80GB con FSDP, batch size 128, learning rate pico de 2e-4 con 1.000 pasos de warmup y decaimiento coseno sobre 100.000 pasos. Un detalle relevante: el entrenamiento se reanudo desde el checkpoint del paso 10000 en un host nuevo con `--resume`, lo que restaura los pesos y el estado del optimizador pero no la posicion del data loader, alterando la secuencia de batches respecto a una ejecucion ininterrumpida. Esto explica que el paso 12000 de esta ejecucion presente una loss de 0.0538 frente a 0.0542 en la ejecucion original.

## Capacidades

- Manipulacion bimanual coordinada: ejecuta secuencias que requieren coordinar ambas manos (izquierda recoge el tubo azul, derecha el verde, y luego los depositan en orden).
- Integracion de sensores tactiles: procesa cuatro flujos tactiles (`tactile_left_0/1`, `tactile_right_0/1`) ademas de dos camaras RGB, lo que permite ajustar la manipulacion con feedback fisico.
- Comprension de instrucciones en lenguaje natural: sigue una instruccion unica en ingles que describe la secuencia completa de la tarea.
- Generacion de acciones mediante flow-matching: produce trayectorias de accion del robot de forma autoregresiva sobre el espacio de acciones.
- Pick-and-place con precision: la tarea requiere recoger y depositar objetos en un orden especifico, lo que exige planificacion de secuencia y control fino.
- Fine-tuning eficiente con LoRA: el uso de adaptadores de bajo rango permite reutilizar el modelo fundacional Pi0.5 con un coste de entrenamiento reducido.

## Casos de uso

- Automatizacion de pick-and-place en lineas de montaje: el modelo puede integrarse en celulas roboticas que requieran recoger y colocar piezas en un orden determinado, aprovechando su capacidad de coordinacion bimanual y su instruccion unica para simplificar el despliegue.
- Manipulacion con feedback tactil en entornos industriales: la integracion de cuatro sensores tactiles permite al robot ajustar la fuerza y la posicion al manipular objetos fragiles o de geometria variable, algo critico en ensamblaje de precision.
- Investigacion en aprendizaje por demostracion: el checkpoint y su dataset asociado (1.019 episodios con 6 flujos de sensores) sirven como referencia para estudiar tecnicas de fine-tuning de modelos VLA con LoRA y flow-matching.
- Evaluacion de generalizacion en robotica: la particion `val_unseen` con episodios held-out por fuente permite medir la capacidad de generalizacion del modelo a datos no vistos, util para comparar estrategias de regularizacion.
- Desarrollo de sistemas de ensamblaje bimanual: la tarea de recoger dos objetos con manos distintas y depositarlos en orden es un prototipo directo de operaciones de ensamblaje que requieren coordinacion entre dos brazos.
- Benchmarking de modelos VLA en manipulacion tactil: al combinar vision y tacto, este checkpoint puede usarse como punto de comparacion para evaluar otros modelos de robotica en tareas que exigen feedback multimodal.

## Benchmarks y rendimiento

La unica metrica cuantitativa disponible es la curva de validacion de flow-matching loss, evaluada sobre 20 batches por split en los mismos batches iniciales para cada punto:

| Paso | Train | val_seen | val_unseen | Gap | Ejecucion |
|---:|---:|---:|---:|---:|---|
| 0 | 0.5525 | 0.4968 | 0.5261 | 0.0293 | inicial |
| 2000 | 0.0553 | 0.0504 | 0.0608 | 0.0104 | inicial |
| 4000 | 0.0490 | 0.0467 | 0.0576 | 0.0109 | inicial |
| 6000 | 0.0460 | 0.0437 | 0.0543 | 0.0106 | inicial |
| 8000 | 0.0441 | 0.0423 | 0.0550 | 0.0127 | inicial |
| 10000 | 0.0435 | 0.0416 | 0.0542 | 0.0126 | inicial / punto de reanudacion |
| **12000** | 0.0420 | 0.0403 | **0.0538** | 0.0135 | continuacion |
| 14000 | 0.0404 | 0.0387 | 0.0537 | 0.0150 | continuacion |

El analisis del autor indica que `val_unseen` descendio monotonamente hasta el paso 6000 y se ha mantenido practicamente plana desde entonces (0.0543 a 0.0537 entre los pasos 6000 y 14000, una mejora total de 0.0006 en 8.000 pasos), mientras que `val_seen` mejoro un 11.4% en el mismo intervalo y el gap se amplio un 42%. Esta combinacion sugiere que la generalizacion se ha saturado: la capacidad ganada despues del paso 6000 se dedica a ajustar los episodios de entrenamiento en lugar de transferir. Cada pasada de validacion cubre aproximadamente 2.560 frames (3-4 episodios de ~780 frames), por lo que variaciones puntuales de ±0.001 estan dentro del ruido; la tendencia plana en cinco puntos consecutivos es la senal fiable.

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible, ya que se trata de un modelo de robotica especializado, no de un modelo de lenguaje general.

## Requisitos de hardware

- Entrenamiento: 2x A100-80GB con FSDP, batch size 128. El checkpoint del paso 10000 se reanudo en un host distinto con `--resume`.
- Inferencia: no especificado en la informacion disponible. El repositorio ocupa 9.6 GB, que incluye tanto los pesos de inferencia (`checkpoint/params/`) como el estado del optimizador (`checkpoint/train_state/`), por lo que los pesos de inferencia ocupan menos.
- GPU recomendadas: no disponible. Dado que se trata de un modelo VLA con torre de vision y LLM, se requiere una GPU con VRAM suficiente para el tamano del modelo en precision FP16 o BF16, aunque no se especifica el numero exacto de parametros.
- Opciones de despliegue: el modelo se distribuye en formato LeRobot v2.1, compatible con el ecosistema LeRobot. No se mencionan formatos GGUF, ONNX ni soporte para vLLM, llama.cpp u Ollama.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Arquitectura | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| `Aether258/pi05_bi_two_tubes_0102_step12000` (este) | pi05_bi (VLA, openpi) | no disponible | Apache 2.0 | HuggingFace, LeRobot |
| `Aether258/pi05_bi_two_tubes_0102_step6000` | pi05_bi (VLA, openpi) | no disponible | Apache 2.0 | HuggingFace, LeRobot |
| Pi0.5 (modelo base, Qualcomm AI Hub) | VLA generalista | no disponible | no disponible | Qualcomm AI Hub |

La comparativa directa con otros checkpoints de Pi0.5 o modelos VLA similares (como OpenVLA o RT-2) no esta disponible en la informacion proporcionada. El checkpoint del paso 6000 del mismo autor es la referencia mas cercana, ya que comparte configuracion, dataset y metodologia de entrenamiento, diferenciandose unicamente en el punto de la curva de entrenamiento.

## Limitaciones y advertencias

- Tarea altamente especifica: el modelo esta entrenado exclusivamente para la tarea de pick-and-place de dos tubos con una instruccion unica unificada. No generaliza a otras instrucciones ni a otros objetos sin fine-tuning adicional.
- Instruccion forzada en el merge de datos: la fuente `two_tubes_02` contenia el placeholder `"perform manipulation task"` en su `meta/tasks.jsonl`. Al fusionar los datos, ambas fuentes se forzaron a la misma instruccion para evitar que el modelo aprendiera que dos instrucciones distintas significan el mismo movimiento. Esto limita la diversidad de lenguaje del entrenamiento.
- Generalizacion saturada: la loss de `val_unseen` se ha mantenido plana desde el paso 6000 (mejora total de 0.0006 en 8.000 pasos), mientras que `val_seen` sigue mejorando. Esto indica que el modelo ha dejado de transferir capacidad a datos no vistos y se esta sobreajustando al conjunto de entrenamiento.
- Checkpoint intermedio: el modelo corresponde al paso 12000 de un entrenamiento planificado a 20000 pasos. No es el checkpoint final y el autor senala que el paso 14000 presenta una loss held-out ligeramente mejor (0.0537).
- Reanudacion del entrenamiento: la ejecucion se reanudo desde el paso 10000 en un host nuevo, lo que altero la secuencia de batches. Los pesos del paso 12000 difieren de los de una ejecucion ininterrumpida, aunque la diferencia es pequena (0.0538 vs 0.0542).
- Solo ingles: el modelo solo soporta instrucciones en ingles. No hay soporte multilingue.
- Unico entorno y robot: los datos provienen de un unico entorno de robot bimanual. La transferencia a otros robots o entornos requeriria fine-tuning adicional.
- Sin datos de benchmarks estandar: no se han publicado resultados en benchmarks de referencia de robotica (como RLBench o LIBERO), lo que dificulta la comparacion objetiva con otros modelos.
- Riesgo de alucinacion en acciones: como todo modelo VLA, existe riesgo de generar acciones incorrectas o inconsistentes en situaciones fuera de la distribucion de entrenamiento, especialmente con objetos o disposiciones no vistas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Aether258/pi05_bi_two_tubes_0102_step12000
- Checkpoint del paso 6000 (mismo autor): https://huggingface.co/Aether258/pi05_bi_two_tubes_0102_step6000
- Perfil del autor en HuggingFace: https://huggingface.co/Aether258/datasets
- Pagina de Pi0.5 en Qualcomm AI Hub: https://aihub.qualcomm.com/models/pi05
