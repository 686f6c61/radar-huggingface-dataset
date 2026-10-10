# fanqi-robo/pi0_insert_gear_in_gripper_lr1x_s1000

## Resumen

`fanqi-robo/pi0_insert_gear_in_gripper_lr1x_s1000` es un ajuste fino de un modelo visión-lenguaje-acción (VLA) sobre la tarea robótica `insert_gear_in_gripper`. Parte de `lerobot/pi0_base`, el checkpoint base de pi0 publicado en el ecosistema LeRobot, y se especializa en insertar un engranaje en una pinza con un robot bimanual YAM. El autor es `fanqi-robo` y la ficha se enmarca en un benchmark interno que compara distintas configuraciones de entrenamiento (en este caso, learning rate 1x y semilla 1000).

El modelo tiene 4.028.019.472 parámetros, todos ellos entrenables durante este ajuste, y sigue la arquitectura pi0: un backbone PaliGemma (visión-lenguaje) acoplado a un "action expert" que genera acciones mediante flow matching. Se entrenó sobre 50 episodios y 27.228 fotogramas del dataset `fanqi-robo/insert_gear_in_gripper`, con tres cámaras de 720x1280 y un espacio de estado y acción conjunto de 14 dimensiones. Predice y ejecuta bloques de 50 acciones.

Es relevante ahora porque forma parte del esfuerzo abierto por reproducir y comparar recetas de ajuste fino de VLA en tareas de manipulación reales, con métricas de validación y de evaluación offline publicadas junto al checkpoint. Su utilidad es acotada: es un artefacto de investigación ligado a un único montaje físico, no un modelo de propósito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLA pi0: backbone PaliGemma (vision-lenguaje) + action expert con flow matching |
| Parametros totales | 4.028.019.472 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (se entrenó en bfloat16; no hay cuantizaciones publicadas) |
| Idiomas soportados | no disponible (el backbone PaliGemma acepta instrucciones en lenguaje natural, pero no se documenta el soporte de idiomas para esta tarea) |
| Licencia | gemma (Gemma Terms of Use del modelo base) |
| Formato de pesos | safetensors (repo de 17,8 GB, librería `lerobot`) |

Otros datos relevantes: espacio de acción y estado de 14 dimensiones (robot bimanual YAM), tres cámaras de 720x1280, horizonte de acción de 50 acciones predichas y 50 ejecutadas, librería `lerobot` 0.5.1.

## Arquitectura y entrenamiento

La arquitectura es la de pi0: un transformer que combina un backbone preentrenado PaliGemma (procesamiento conjunto de imágenes e instrucciones de lenguaje) con un módulo experto en acciones que genera trayectorias mediante flow matching. En este ajuste se inicializó desde `lerobot/pi0_base@26b99b94` y se entrenó el modelo completo (`freeze_vision_encoder=false`, `train_expert_only=false`) en bfloat16 con gradient checkpointing. La normalización de estado y acción usa la media y desviación típica del conjunto de entrenamiento, y las imágenes se reescalan dentro del modelo.

Los datos de entrenamiento son `fanqi-robo/insert_gear_in_gripper` (revisión `acdc9ac8`): 50 episodios y 27.228 fotogramas de la tarea `insert_gear_in_gripper` en un robot bimanual YAM con 14 dimensiones de estado y acción y tres cámaras de 720x1280. La validación usó `villekuosmanen/insert_gear_in_gripper_val` (revisión `7c4d62f3`), con 5 episodios reservados y 2.245 fotogramas. El optimizador fue AdamW con decaimiento coseno y warmup, con learning rate 1x (optimizer_lr=2.5e-05, scheduler_decay_lr=2.5e-06), 20.000 actualizaciones a batch efectivo 32 (32 x 1, una GPU), semilla 1000 y sin aumento de datos de imagen. El entrenamiento consumió 13,7 GPU-horas en una NVIDIA H100 80GB HBM3, con un pico de VRAM de 44,4 GB. No se aplicó RLHF ni DPO: el ajuste es puramente de imitación supervisada sobre demostraciones, con pérdida de flow matching.

## Capacidades

- Generación de acciones motoras para una tarea concreta: inserción de un engranaje en la pinza con un robot bimanual YAM, a partir de observaciones visuales y del estado articular.
- Control bimanual: maneja un espacio conjunto de 14 dimensiones de estado y acción que abarca ambos brazos y la pinza.
- Predicción de bloques de acción: genera 50 acciones por inferencia y ejecuta las 50 (action chunking), lo que reduce la frecuencia de recálculo.
- Entrada multimodal: procesa tres flujos de cámara de 720x1280 junto con el estado del robot.
- Interpretación de instrucciones en lenguaje natural: heredada del backbone PaliGemma y del entrenamiento previo de pi0, aunque la tarea evaluada es fija.
- No dispone de tool calling, function calling ni capacidades de agente.
- No se documentan capacidades multilingües específicas para esta tarea.

## Casos de uso

- Investigación en aprendizaje por imitación: reproducir la receta de ajuste (learning rate 1x, semilla 1000, 20.000 actualizaciones) sobre el mismo dataset permite comparar curvas de pérdida de validación y métricas offline frente a otras variantes del benchmark.
- Manipulación bimanual de precisión: la tarea de insertar un engranaje en una pinza exige coordinación de dos brazos; el modelo sirve como política de referencia para estudiar el control bimanual con VLA.
- Evaluación offline de políticas: el autor publica métricas MAE@10, MAE@30 y de agarre sobre episodios reservados, de modo que el modelo puede usarse como punto de comparación para nuevas políticas sin necesidad de montar el robot.
- Punto de partida para ajustes específicos: al tratarse de un checkpoint sobre `lerobot/pi0_base`, puede reutilizarse como inicialización en tareas de ensamblaje similares dentro de LeRobot.
- Despliegue en bucle cerrado en laboratorio: con una latencia de inferencia de 231,3 ms, es viable como política de control en un montaje experimental, siempre que la frecuencia de control lo permita.
- Estudio de sobreajuste en datasets pequeños: con solo 50 episodios y 27.228 fotogramas, es un caso útil para analizar la divergencia entre pérdida de entrenamiento y de validación en VLA.
- Validación de pipelines de datos robóticos: sirve para comprobar el correcto funcionamiento de la carga de episodios, normalización y cámaras múltiples en LeRobot 0.5.1.

## Benchmarks y rendimiento

Evaluación offline en los episodios reservados `villekuosmanen/insert_gear_in_gripper_val` (423 consultas, un fotograma de cada 5), en unidades articulares del dataset. La referencia `hold` (mantener la pose actual) obtiene MAE@30 = 2,60. Selección de actualizaciones del registro completo:

| Actualizacion | MAE@10 | MAE@30 | k=1 | k=30 | arm | grip rec | grip dt |
|---|---|---|---|---|---|---|---|
| hold (referencia) | no disponible | 2,60 | no disponible | no disponible | no disponible | no disponible | no disponible |
| 851 | 1,34 | 2,19 +/- 0,24 | 0,87 | 3,32 | 0,96 | 0,49 | 5,1 |
| 1702 | 1,23 | 2,04 +/- 0,47 | 0,80 | 3,12 | 0,95 | 0,54 | 4,3 |
| 2553 | 1,12 | 1,81 +/- 0,31 | 0,78 | 2,78 | 0,98 | 0,60 | 5,6 |
| 5106 | 0,98 | 1,67 +/- 0,38 | 0,67 | 2,65 | 0,97 | 0,59 | 4,2 |
| 9361 | 1,01 | 1,74 +/- 0,54 | 0,65 | 2,74 | 0,95 | 0,68 | 4,4 |
| 12765 | 0,99 | 1,71 +/- 0,52 | 0,63 | 2,67 | 0,97 | 0,67 | 4,0 |
| 17871 | 0,97 | 1,70 +/- 0,53 | 0,61 | 2,68 | 0,98 | 0,71 | 4,7 |
| 20000 (final) | 0,97 | 1,71 +/- 0,53 | 0,61 | 2,70 | 0,97 | 0,71 | 4,7 |

Métricas adicionales del entrenamiento: pérdida de validación final 0,220923 en la actualización 20.000; mejor pérdida de validación 0,0650489 en la actualización 1.702; pérdida de entrenamiento en la última ventana 0,00761635; latencia de inferencia 231,3 ms; pico de VRAM 44,4 GB durante el entrenamiento. La pérdida de validación es el MSE de flow matching de `policy.forward` en modo evaluación, con una extracción de ruido por lote bajo semilla fija, y los pasos de acción con relleno cuentan como objetivos (pi0 no tiene máscara de relleno); sirve para ordenar checkpoints de esta misma ejecución, no es comparable entre políticas distintas. No se han publicado resultados de benchmarks estándar tipo MMLU, HumanEval o GSM8K, que no aplican a este tipo de modelo.

## Requisitos de hardware

- Pico de VRAM en entrenamiento: 44,4 GB, medido en 1 x NVIDIA H100 80GB HBM3 durante 13,7 GPU-horas.
- VRAM estimada para inferencia: no disponible (no se publica el consumo de memoria en inferencia; los pesos en bfloat16 ocupan aproximadamente 8 GB, a los que hay que sumar activaciones y el procesamiento de tres cámaras de 720x1280).
- GPU recomendadas: para entrenamiento, H100 80GB (la usada por el autor); para inferencia, se puede plantear una GPU con al menos 24-48 GB de VRAM según el backend, aunque no hay estimaciones publicadas.
- ¿Cabe en GPU de consumo? no disponible; no hay datos publicados de ejecución en RTX 4090 o similares, y las tres cámaras de 720x1280 más un modelo de 4B sugieren un consumo de memoria considerable.
- Opciones de despliegue: librería `lerobot` (versión 0.5.1 en el entrenamiento), que es el entorno previsto por el autor. No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, que no son aplicables a una política VLA de este tipo.
- Latencia: 231,3 ms por inferencia según el autor. No se publica throughput.

## Comparativa con modelos similares

No hay datos de benchmarks comparables entre políticas, y el propio autor advierte que la pérdida de validación solo ordena checkpoints de la misma ejecución. Comparativa cualitativa:

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| pi0_insert_gear_in_gripper_lr1x_s1000 | 4.028.019.472 | no disponible | Insercion de engranaje en pinza, YAM bimanual | gemma | HuggingFace |
| lerobot/pi0_base | mismo backbone (pi0, ~4B) | no disponible | VLA base preentrenado, multiuso | gemma | HuggingFace |
| Otras variantes del mismo benchmark (distintos lr/semilla) | misma arquitectura | no disponible | Misma tarea | gemma | Repositorio del autor, no listados en la informacion disponible |

No se dispone de cifras de rendimiento de los modelos alternativos en la informacion proporcionada, por lo que no es posible una comparacion numerica.

## Limitaciones y advertencias

- Especialización extrema: el modelo está ajustado para una única tarea y un único montaje físico (robot bimanual YAM, tres cámaras de 720x1280, 14 dimensiones de estado y acción). No es transferible a otro hardware sin un nuevo ajuste.
- Dataset pequeño: 50 episodios y 27.228 fotogramas. No se documenta ningún preentrenamiento específico del embodiment (bimanual YAM), lo que limita la generalización.
- Señales de sobreajuste: la mejor pérdida de validación se alcanza en la actualización 1.702 (0,0650489) y en la 20.000 es de 0,220923, mientras la pérdida de entrenamiento baja a 0,00761635. El checkpoint `main` es el final, no el de mejor validación; el autor indica que el mejor está en la rama `best`.
- Métrica de validación no comparable: la pérdida de flow matching solo ordena checkpoints de la misma ejecución; no sirve para comparar con otras políticas ni como estimación de éxito real en el robot.
- Evaluación limitada: la tabla publicada es de evaluación offline (error de bloque de acción en bucle abierto) sobre 5 episodios reservados y 423 consultas, no una tasa de éxito en el robot.
- Riesgo de fallo en ejecución real: al ser una política de imitación sin mecanismos de seguridad explícitos, requiere supervisión y límites de par/fuerza en el robot.
- Sesgos: no disponibles; no se documenta un análisis de sesgos, y el concepto no se aplica igual que en modelos de lenguaje.
- Licencia: sujeto a los Gemma Terms of Use del modelo base, lo que impone condiciones y restricciones de uso (incluido el uso comercial) que deben revisarse antes de cualquier despliegue en producción.
- Idiomas y contexto: sin datos publicados sobre longitud de contexto ni sobre cobertura idiomática de las instrucciones.
- Artefacto de investigación: solo 11 descargas y 0 likes en el momento de la consulta, sin mantenimiento ni soporte documentado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/fanqi-robo/pi0_insert_gear_in_gripper_lr1x_s1000
- Modelo base: https://huggingface.co/lerobot/pi0_base
- Dataset de entrenamiento: https://huggingface.co/datasets/fanqi-robo/insert_gear_in_gripper
- Dataset de validación: https://huggingface.co/datasets/villekuosmanen/insert_gear_in_gripper_val
- Ejecución de W&B: https://wandb.ai/fanqi-robo-saferobotics/insert_gear_in_gripper_benchmark/runs/78yqkba6
- La búsqueda web realizada no devolvió enlaces relevantes sobre este modelo; los resultados obtenidos trataban sobre otros temas y no se han incluido.
