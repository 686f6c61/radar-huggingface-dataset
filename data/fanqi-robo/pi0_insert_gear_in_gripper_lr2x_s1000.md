# fanqi-robo/pi0_insert_gear_in_gripper_lr2x_s1000

## Resumen

`pi0_insert_gear_in_gripper_lr2x_s1000` es un ajuste fino del modelo vision-lenguaje-acción (VLA) π0, publicado por el usuario `fanqi-robo` sobre el checkpoint base `lerobot/pi0_base`. El modelo está especializado en una única tarea de manipulación bimanual: insertar un engranaje en una pinza sobre un robot YAM de dos brazos, con estado y acción de 14 grados de libertad y tres cámaras de 720x1280. No es un modelo de propósito general ni de generación de texto: es una política robótica entrenada para producir trayectorias continuas de acción.

El modelo cuenta con 4.028.019.472 parámetros (aproximadamente 4,03 mil millones), todos ellos entrenables durante el ajuste fino, y se distribuye en formato `safetensors` a través del ecosistema LeRobot (versión 0.5.1). El entrenamiento se realizó íntegramente sobre un conjunto de 50 episodios y 27.228 fotogramas, más 5 episodios de validación con 2.245 fotogramas, lo que lo sitúa en el régimen de aprendizaje por imitación con pocos datos.

Su relevancia actual es doble. Por un lado, sirve como punto de comparación dentro de un banco de pruebas que enfrenta π0 con `groot_n17` sobre la misma tarea y los mismos datos. Por otro, documenta de forma inusualmente detallada el coste de entrenamiento (13,7 horas de GPU en una H100 80GB, 44,4 GB de VRAM en pico), la latencia de inferencia (240,4 ms) y las curvas de error en lazo abierto, lo que lo convierte en un caso de estudio útil para quienes evalúan el ajuste fino de VLA en manipulación diestra.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA) basada en PaliGemma (encoder visual SigLIP + backbone de lenguaje Gemma) con un "action expert" que genera acciones continuas mediante flow matching |
| Parámetros totales | 4.028.019.472 (aproximadamente 4,03 B) |
| Parámetros activos | No aplica: no es un modelo MoE |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible (modelo de control robótico; no produce salida de lenguaje en esta tarea) |
| Licencia | Gemma (Gemma Terms of Use, heredada del modelo base) |
| Formato de pesos | safetensors (repositorio LeRobot, 17,8 GB) |
| Tarea | `insert_gear_in_gripper`, robot bimanual YAM |
| Dimensiones de estado/acción | Estado y acción de 14 grados de libertad (articulares) |
| Entradas visuales | Tres cámaras de 720x1280 |
| Chunk de acciones | 50 acciones predichas y 50 ejecutadas por inferencia |
| Latencia de inferencia | 240,4 ms |
| Biblioteca | LeRobot 0.5.1 |

## Arquitectura y entrenamiento

El modelo parte de `lerobot/pi0_base@26b99b94`, un VLA preentrenado que combina un backbone PaliGemma (encoder visual SigLIP más modelo de lenguaje Gemma) con un "action expert" separado que genera acciones continuas mediante flow matching. Esta combinación permite condicionar la predicción motora en observaciones visuales y en el estado del robot, produciendo secuencias de acciones fluidas y precisas en lugar de tokens discretos. En este ajuste fino se entrenó el modelo completo (`freeze_vision_encoder=false`, `train_expert_only=false`) en `bfloat16` con gradient checkpointing, sin congelar ninguna parte de la red.

El entrenamiento usó el conjunto `fanqi-robo/insert_gear_in_gripper` en la revisión `acdc9ac8` (50 episodios, 27.228 fotogramas) y se validó sobre `villekuosmanen/insert_gear_in_gripper_val` en la revisión `7c4d62f3` (5 episodios reservados, 2.245 fotogramas). El optimizador fue AdamW con decaimiento coseno y calentamiento, con una programación predefinida de 1000/30000 reescalada por LeRobot a calentamiento 666 y decaimiento 20000. Se aplicó una tasa de aprendizaje del doble de la de partida (`optimizer_lr=5e-05`, `scheduler_decay_lr=5e-06`), semilla 1000, sin aumentación de imagen, y 20000 actualizaciones del optimizador con lote efectivo de 32 (32x1, una sola GPU). La normalización de estado y acción emplea la media y la desviación típica del conjunto de entrenamiento, y las imágenes se reescalan dentro del propio modelo. No se documenta ningún preentrenamiento específico del cuerpo robótico (embodiment) para el YAM bimanual.

## Capacidades

- Manipulación robótica bimanual: ejecuta la tarea de inserción de un engranaje en una pinza sobre un robot YAM de dos brazos.
- Control articular continuo: predice y ejecuta acciones de 14 grados de libertad mediante flow matching, no mediante tokens discretos.
- Percepción multivista: consume simultáneamente tres cámaras de 720x1280 como entrada visual.
- Predicción en chunks: genera bloques de 50 acciones que se ejecutan completos entre inferencias, lo que reduce la frecuencia de cómputo del modelo.
- Aprendizaje por imitación con pocos datos: la política se ajusta a partir de 50 episodios y 27.228 fotogramas.
- Condicionamiento en el estado del robot: la normalización de estado y acción se calcula a partir del conjunto de entrenamiento y se aplica en inferencia.
- No dispone de tool calling, function calling ni razonamiento multi-paso en el sentido de los modelos de lenguaje.
- No se documentan capacidades multilingües, de visión general, de audio ni modo de razonamiento explícito.

## Casos de uso

- Automatización de ensamblaje de precisión: el modelo está entrenado específicamente para insertar un engranaje en una pinza, de modo que puede desplegarse como política de control en una celda de ensamblaje con robot YAM para esa operación concreta.
- Punto de partida para ajuste fino en tareas de inserción: al ser un VLA con backbone preentrenado y todos los parámetros entrenables, sirve como inicialización para otras tareas de ensamblaje con pocos episodios, aprovechando que el ajuste completo solo requirió 13,7 horas de H100.
- Evaluación comparativa de arquitecturas VLA: forma parte de un banco de pruebas que contrasta π0 con `groot_n17` sobre la misma tarea, los mismos datos y la misma semilla, lo que permite comparar políticas bajo condiciones controladas.
- Investigación en flow matching para control motor: reproduce íntegramente el pipeline de entrenamiento, con configuraciones de optimizador, normalización y chunking documentadas, lo que facilita experimentos reproducibles sobre generación de acciones continuas.
- Verificación offline de políticas antes de desplegar: las métricas MAE@10, MAE@30, k=1, k=30, error de brazo y detección de cierre de pinza permiten evaluar checkpoints sobre episodios reservados sin necesidad de acceso al robot físico.
- Análisis de robustez del agarre: los valores de `grip rec` (0,75 en el checkpoint final) y `grip dt` (3,8) permiten estudiar la fiabilidad de la detección de cierre de la pinza y su impacto en la tasa de éxito.
- Docencia y referencia de ingeniería: el repositorio incluye `benchmark_run.json`, `metrics.jsonl` y `run_summary.json`, útiles como plantilla para documentar experimentos de robótica con métricas de coste, latencia y VRAM.

## Benchmarks y rendimiento

No hay resultados de benchmarks estándar de lenguaje (MMLU, HumanEval, GSM8K y similares) en la información disponible, ya que se trata de un modelo de control robótico. La model card sí publica una evaluación offline en lazo abierto sobre los 5 episodios reservados de `villekuosmanen/insert_gear_in_gripper_val` (423 consultas, cada 5 fotogramas), en las unidades articulares del conjunto de datos. La referencia `hold` (mantener la pose actual) obtiene MAE@30 de 2,60.

| Update | MAE@10 | MAE@30 | k=1 | k=30 | arm | grip rec | grip dt |
|---|---|---|---|---|---|---|---|
| 851 | 1,65 | 2,65 ± 0,59 | 1,17 | 4,13 | 0,94 | 0,60 | 4,3 |
| 1702 | 1,52 | 2,26 ± 0,32 | 1,16 | 3,28 | 0,92 | 0,56 | 4,9 |
| 2553 | 1,64 | 2,56 ± 0,90 | 1,13 | 3,73 | 0,93 | 0,56 | 4,5 |
| 3404 | 1,28 | 1,96 ± 0,33 | 0,98 | 3,00 | 0,91 | 0,60 | 5,1 |
| 4000 | 1,33 | 2,07 ± 0,37 | 0,97 | 3,19 | 0,95 | 0,63 | 5,0 |
| 4255 | 1,37 | 2,26 ± 0,63 | 0,93 | 3,46 | 0,96 | 0,79 | 4,7 |
| 5106 | 1,29 | 2,14 ± 0,56 | 0,89 | 3,32 | 0,96 | 0,75 | 4,1 |
| 5957 | 1,34 | 2,10 ± 0,52 | 0,95 | 3,19 | 0,92 | 0,75 | 4,7 |
| 6808 | 1,36 | 2,22 ± 0,66 | 0,93 | 3,39 | 0,90 | 0,68 | 4,5 |
| 7659 | 1,31 | 2,18 ± 0,70 | 0,86 | 3,36 | 0,97 | 0,73 | 3,3 |
| 8000 | 1,37 | 2,27 ± 0,74 | 0,90 | 3,46 | 0,97 | 0,75 | 4,3 |
| 8510 | 1,24 | 2,08 ± 0,51 | 0,84 | 3,26 | 0,94 | 0,78 | 4,3 |
| 9361 | 1,22 | 2,09 ± 0,66 | 0,80 | 3,30 | 0,97 | 0,76 | 4,1 |
| 10212 | 1,25 | 2,13 ± 0,76 | 0,80 | 3,31 | 0,98 | 0,75 | 3,5 |
| 11063 | 1,27 | 2,15 ± 0,71 | 0,83 | 3,34 | 0,98 | 0,75 | 3,4 |
| 11914 | 1,27 | 2,16 ± 0,77 | 0,83 | 3,35 | 0,95 | 0,75 | 3,5 |
| 12000 | 1,26 | 2,14 ± 0,80 | 0,80 | 3,32 | 0,95 | 0,76 | 3,4 |
| 12765 | 1,24 | 2,11 ± 0,78 | 0,78 | 3,28 | 0,97 | 0,76 | 3,2 |
| 13616 | 1,19 | 2,05 ± 0,67 | 0,77 | 3,24 | 0,98 | 0,78 | 3,7 |
| 14467 | 1,20 | 2,06 ± 0,71 | 0,76 | 3,24 | 0,97 | 0,78 | 3,9 |
| 15318 | 1,19 | 2,06 ± 0,72 | 0,76 | 3,24 | 0,97 | 0,78 | 4,0 |
| 16000 | 1,19 | 2,06 ± 0,72 | 0,75 | 3,25 | 0,98 | 0,76 | 3,6 |
| 16169 | 1,22 | 2,09 ± 0,76 | 0,78 | 3,26 | 0,98 | 0,75 | 4,0 |
| 17020 | 1,18 | 2,04 ± 0,71 | 0,75 | 3,21 | 0,98 | 0,73 | 3,7 |
| 17871 | 1,18 | 2,04 ± 0,74 | 0,74 | 3,22 | 0,98 | 0,73 | 3,6 |
| 18722 | 1,18 | 2,04 ± 0,71 | 0,75 | 3,22 | 0,98 | 0,73 | 3,7 |
| 19573 | 1,17 | 2,04 ± 0,73 | 0,73 | 3,22 | 0,99 | 0,73 | 3,8 |
| 20000 | 1,17 | 2,03 ± 0,71 | 0,73 | 3,21 | 0,98 | 0,75 | 3,8 |
| hold (referencia) | no disponible | 2,60 | no disponible | no disponible | no disponible | no disponible | no disponible |

Métricas de entrenamiento y validación publicadas:

| Métrica | Valor |
|---|---|
| Pérdida de validación (update final 20000) | 0,249957 |
| Mejor pérdida de validación | 0,0658975 en el update 1702 |
| Pérdida de entrenamiento (última ventana) | 0,0070831 |
| VRAM en pico (entrenamiento) | 44,4 GB |
| Horas de GPU | 13,7 |
| Latencia de inferencia | 240,4 ms |

La model card advierte explícitamente de que la pérdida de validación es el MSE de flow matching de `policy.forward` en modo evaluación, con una única muestra de ruido por lote bajo semilla fija, y que los pasos de acción con relleno cuentan como objetivos porque π0 no tiene máscara de relleno. Esa métrica solo sirve para ordenar checkpoints de esta misma ejecución y no es comparable entre políticas distintas.

## Requisitos de hardware

- Peso de los parámetros: aproximadamente 8 GB en `bfloat16` (cálculo derivado de 4.028.019.472 parámetros a 2 bytes cada uno); el repositorio ocupa 17,8 GB.
- VRAM de entrenamiento: 44,4 GB en pico, medidos con una NVIDIA H100 80GB HBM3, lote efectivo 32, una GPU y gradient checkpointing.
- GPU utilizada en el ajuste fino: 1 x NVIDIA H100 80GB HBM3 durante 13,7 horas de GPU.
- GPU de consumo: no hay datos confirmados de despliegue en GPUs de consumo. Por tamaño de pesos, el modelo podría caber en GPUs con 12-16 GB o más (por ejemplo, RTX 4080 o RTX 4090), pero esta estimación no está verificada en la información disponible.
- Opciones de despliegue: ecosistema LeRobot 0.5.1, con la clase `Pi0Policy` para selección de acciones a partir de lotes de entrada. No se documentan soportes de vLLM, llama.cpp, Ollama ni TGI para este checkpoint.
- Latencia: 240,4 ms por inferencia, que cubre un chunk de 50 acciones.
- Rendimiento de throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `fanqi-robo/pi0_insert_gear_in_gripper_lr2x_s1000` (este modelo) | 4.028.019.472 | no disponible | MAE@30 2,03 ± 0,71; MAE@10 1,17; latencia 240,4 ms; pérdida de validación final 0,249957 | Gemma | HuggingFace, 9 descargas, 0 likes |
| `lerobot/pi0_base` | 4.028.019.472 (el ajuste entrena el modelo completo, por lo que coincide con la base) | no disponible | no disponible | Gemma | HuggingFace, dentro del ecosistema LeRobot |
| `fanqi-robo/groot_n17_insert_gear_in_gripper_lr2x_s1000` | no disponible | no disponible | no disponible (ejecución comparativa sobre la misma tarea, el mismo esquema de tasa de aprendizaje y la misma semilla) | no disponible | HuggingFace |
| π0 original (Physical Intelligence) | no disponible en la información proporcionada | no disponible | no disponible en la información proporcionada | no disponible en la información proporcionada | Checkpoints base preentrenados sobre más de 10.000 horas de datos de robot, según el repositorio asociado |

No se han publicado en la información disponible resultados comparativos entre estas políticas sobre la misma métrica, salvo la referencia interna `hold` (MAE@30 2,60) de este mismo banco de pruebas.

## Limitaciones y advertencias

- Especialización extrema: el modelo está ajustado para `insert_gear_in_gripper` en un robot YAM bimanual concreto y no es una política generalista. Fuera de esa tarea y ese cuerpo robótico, su comportamiento no está caracterizado.
- Ausencia de preentrenamiento específico del cuerpo: la model card indica que no se conoce ningún preentrenamiento específico para el YAM bimanual, lo que limita la transferencia esperada.
- Dataset muy reducido: 50 episodios y 27.228 fotogramas. El riesgo de sobreajuste es real; de hecho, la mejor pérdida de validación se alcanza en el update 1702 (0,0658975), mientras que el checkpoint final (20000) presenta una pérdida de validación de 0,249957, casi cuatro veces mayor, aunque sus métricas de error de acción son mejores.
- Divergencia entre métricas: la pérdida de validación no correlaciona bien con el error en lazo abierto en esta ejecución. La propia model card advierte de que la pérdida no es comparable entre políticas.
- Error de seguimiento: en el checkpoint final, el MAE@30 es de 2,03 ± 0,71 frente a 2,60 del baseline `hold`. La mejora existe, pero la desviación típica es elevada y la comparación se realiza sobre 5 episodios reservados y 423 consultas.
- Fiabilidad del agarre: `grip rec` se queda en 0,75 y `grip dt` en 3,8 en el update final, lo que indica que aproximadamente una cuarta parte de las detecciones de cierre de pinza no se reconocen correctamente.
- Sin aumentación de imagen durante el entrenamiento, lo que reduce la robustez ante variaciones de iluminación, posición de cámara o apariencia del entorno no vistas.
- Evaluación únicamente offline y en lazo abierto: no se publican tasas de éxito en ejecución real sobre el robot.
- Licencia Gemma: el uso está sujeto a los Gemma Terms of Use del modelo base. Es imprescindible revisar las condiciones aplicables al uso comercial antes de desplegarlo en producción.
- Idiomas: no disponible; el modelo no genera texto en esta configuración, por lo que no aplica soporte multilingüe.
- Latencia de 240,4 ms por chunk de 50 acciones: condiciona la frecuencia de control efectiva y debe tenerse en cuenta en la planificación temporal del lazo de control.
- No hay datos publicados de cuantización ni de despliegue en hardware de consumo, por lo que no puede garantizarse su viabilidad fuera de GPUs de datacenter.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/fanqi-robo/pi0_insert_gear_in_gripper_lr2x_s1000
- Modelo base: https://huggingface.co/lerobot/pi0_base
- Conjunto de datos de entrenamiento: https://huggingface.co/datasets/fanqi-robo/insert_gear_in_gripper
- Conjunto de datos de validación: https://huggingface.co/datasets/villekuosmanen/insert_gear_in_gripper_val
- Ejecución de W&B: https://wandb.ai/fanqi-robo-saferobotics/insert_gear_in_gripper_benchmark/runs/vzfvh582
- Modelo comparativo (groot_n17 sobre la misma tarea): https://huggingface.co/fanqi-robo/groot_n17_insert_gear_in_gripper_lr2x_s1000
- Artículo de π0: A Vision-Language-Action Flow Model for General Robot Control: https://arxiv.org/html/2410.24164v1
- Repositorio de ajuste fino de π0: https://github.com/Brown-yang/pi0
- Ficha de π0 en PromptLayer: https://www.promptlayer.com/models/pi0/
