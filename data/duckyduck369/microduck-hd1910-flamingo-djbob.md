# duckyduck369/microduck-hd1910-flamingo-djbob

## Resumen

`microduck-hd1910-flamingo-djbob` es una política de control entrenada mediante aprendizaje por refuerzo para el robot cuadrúpedo HD-1910 Microduck, publicada por el usuario duckyduck369 en Hugging Face. No es un modelo de lenguaje: es una política de locomoción exportada a ONNX que implementa la habilidad de mantenerse sobre una sola pata a la orden, con un ciclo de alternancia entre patas. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y un tamaño de 0.0 GB (los pesos concretos no se detallan en la información disponible).

La relevancia del modelo es acotada pero técnicamente interesante: documenta de forma exhaustiva el pipeline de entrenamiento (tarea Mjlab, curricula, pesos de recompensa, aleatorización de dominio, planta física con hash), lo que lo convierte en un artefacto reproducible para investigación en RL aplicado a robótica de bajo coste. Sin embargo, el propio autor lo marca explícitamente como **CANDIDATE (fails its acceptance gates, not robot-tested)**: no ha sido validado en hardware real y suspende dos de sus puertas de aceptación.

La política opera a 50 Hz sobre servos HD-1910, con ganancias Kp 5.0 / Kd 5.0, y fue entrenada hasta la iteración 3999 (96.000 pasos de entorno) sobre la planta `178ae2f431a12253` (790,6 g, alimentación 5.6-6.8 V).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Política de control por aprendizaje por refuerzo (no disponible el detalle de la red; exportada a ONNX) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (política de control, no modelo de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo lingüístico) |
| Licencia | apache-2.0 |
| Formato de pesos | ONNX (librería declarada: onnx) |

## Arquitectura y entrenamiento

La información disponible no detalla la topología de la red neuronal de la política (número de capas, dimensión de las observaciones o de las acciones). Lo que sí se documenta es el proceso de entrenamiento: tarea `Mjlab-FlamingoCycle-Flat-MicroDuck-HD1910-S2R-Lift2-ComCritic-Sym-RobotFw`, entrenada hasta la iteración 3999 (96.000 pasos de entorno, checkpoint `model_3999.pt`), con linaje `fw_kd5_s0 it 3999` (ciclo flamingo, clamp de firmware, Kp 5 / Kd 5). El código de entrenamiento corresponde a una rama local `hd1910-flamingo` no publicada (commit `367d660d7`).

El entrenamiento emplea un esquema de recompensas con curricula. Los pesos finales incluyen términos como `com_target` (+3), `swing_foot_clear` (+3), `stance_side_tilt` (+4), `pose_track` (+1.5), `swing_foot_contact` (+1.5), `gravity_track` (+2), `stillness` (+1), `stance_foot_grounded` (+1), y penalizaciones como `self_collisions` (-4), `joint_limit_proximity` (-1), `action_rate_l2` (-0.5 tras curriculum) y `joint_torque_rate_l2` (-0.001 tras curriculum). Las curricula escalonan la magnitud de empujes (de 0 a ±0.15 m/s entre las iteraciones 0 y 1000), el peso de `action_rate_l2`, el peso de `joint_torque_rate_l2`, la desviación y el rango de centro de masas (hasta 0.015), el rango de CoM de la cabeza y la probabilidad de estado `in_pose` (de 0.6 a 0.3). La aleatorización de dominio incluye `reset_base` con rango de pose y yaw completo, `foot_friction` con rango absoluto [0.4, 2.5] compartido, y `encoder_bias` (detalle truncado en la información disponible).

La planta física está definida en `plant.json`: masa de 790,6 g, modelo de servo `hd1910_m6_2026-10-10.json`, alimentación [5.6, 6.8] V con caída de tensión [0.1, 0.5] V/N·m y suelo de 3,5 V, y latencia de 4-10 pasos de física. La política se ejecuta a 50 Hz con Kp 5.0 / Kd 5.0 escritos al arranque, y utiliza una pose HOME concreta en el orden de articulaciones de la política.

## Capacidades

- Control de locomoción de un cuadrúpedo HD-1910 Microduck: mantenerse de pie sobre ambas patas y sobre una sola pata a la orden.
- Alternancia de lado de apoyo mediante comando twist `[flag, side, 0]`: `flag=1` activa apoyo a una pata, `side=+1` implica apoyo derecho (levanta la pata izquierda) y `side=-1` apoyo izquierdo (levanta la pata derecha).
- Transición suave a la pose: la política interpola hacia la pose objetivo a lo largo de 1,5 s.
- Sostenimiento de la pose durante ventanas de 2,5-5 s (rango entrenado).
- Recuperación de la postura tras empujes: métrica `push_stand_upright` de 1,0 en evaluación.
- Estabilidad con caída cero en bucle (`cycle_falls` 0,0) y sin caídas en apoyo bipodal (`stand_falls` 0,0).
- No incluye capacidad de levantarse tras una caída (fall stop ON, sin get-up).
- No soporta tool calling, agentes, multilingüismo ni generación de texto: no es un modelo de lenguaje.

## Casos de uso

- Investigación en RL para robótica de bajo coste: la política sirve como referencia reproducible de un pipeline completo (tarea, recompensas, curricula, aleatorización, planta) para estudiar cómo se comporta una habilidad de apoyo monopodal en simulación antes de transferirla a hardware.
- Docencia y divulgación: el repositorio documenta de forma explícita pesos de recompensa, etapas de curriculum y puertas de aceptación, lo que permite usarlo como caso de estudio de evaluación rigurosa de políticas (candidato que falla gates frente a política aceptada).
- Desarrollo de firmware y drivers de servo: los parámetros de la planta (Kp/Kd, frecuencia de 50 Hz, clamp de rango articular, alimentación 5.6-6.8 V) sirven para validar la cadena de control del HD-1910 antes de ejecutar políticas más exigentes.
- Pruebas de robustez frente a perturbaciones: la métrica `push_stand_upright` y la aleatorización de empujes permiten usar la política como banco de pruebas de controladores ante perturbaciones laterales.
- Evaluación comparativa dentro de la familia flamingo: al compartir el eval v1.0 (256 robots, semilla 0), permite comparar variantes de política con el mismo protocolo y las mismas condiciones de prueba.
- Análisis de brechas sim-to-real: al no estar probada en robot real y fallar sus gates, es útil como caso de estudio de las diferencias entre rendimiento en simulación y criterios de aceptación para hardware.
- Integración en pipelines de simulación Mjlab: el artefacto ONNX y el `plant.json` permiten reproducir los escenarios de replay con cámara fija en tiempo real.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (eval `flamingo` v1.0, 256 robots, semilla 0). Ninguno está verificado (`verified: false`).

| Métrica | Valor | Puerta de aceptación | Resultado |
|---|---|---|---|
| lift_left_airborne | 0.73 | >= 0.85 | falla |
| lift_right_airborne | 0.716 | >= 0.85 | falla |
| lift_left_clearance_m | 0.054 | >= 0.05 | pasa |
| lift_right_clearance_m | 0.0506 | >= 0.05 | pasa |
| cycle_falls | 0.0 | — | — |
| stand_both_feet | 1.0 | >= 0.95 | pasa |
| stand_falls | 0.0 | <= 0.01 | pasa |
| push_stand_upright | 1.0 | >= 0.9 | pasa |
| settle_time_s | 0.1 | <= 2.0 | pasa |

No se han publicado resultados de benchmarks comparativos con otras políticas en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible (el tamaño del modelo ONNX no se detalla; el repositorio ocupa 0.0 GB).
- GPU recomendadas: no disponible. Al tratarse de una política de control a 50 Hz, la inferencia es probablemente viable en CPU, pero no se confirma en la información.
- ¿Cabe en GPU de consumo? No disponible.
- Opciones de despliegue: ONNX Runtime (formato de pesos ONNX); el resto de runtimes no se especifica.
- Latencia y throughput: no disponibles como cifras de inferencia. La planta modela una latencia de servo de 4-10 pasos de física y el bucle de control corre a 50 Hz.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye otras políticas de la familia flamingo ni modelos comparables con parámetros, contexto o rendimiento que permitan una comparación cuantitativa. La única referencia interna es el linaje `fw_kd5_s0 it 3999`, del que no se aportan métricas.

## Limitaciones y advertencias

- El autor clasifica el modelo como **CANDIDATE**: falla al menos una puerta de aceptación (`lift_left_airborne` 0.73 y `lift_right_airborne` 0.716 frente al umbral 0.85).
- No ha sido probado en robot real ("not robot-tested"); todo el rendimiento es en simulación.
- No incluye capacidad de levantarse tras una caída (fall stop ON, sin get-up).
- Requiere respetar condiciones operativas estrictas: elegir el lado antes de levantar el flag, dejar un hold con flag 0 y esperar al menos 3 s antes de cambiar de lado, y mantener ventanas de hold de 2,5-5 s (fuera de ese rango el comportamiento no está garantizado).
- Los objetivos deben recortarse al rango articular (el firmware lo hace; la política fue entrenada con ese clamp).
- Alimentación entrenada de 5.6-6.8 V (pack 2S antiguo); fuera de ese rango el comportamiento no está validado.
- Las ganancias Kp 5 / Kd 5 y la pose HOME antigua (hip pitch ±0.4579) son específicas de esta política y difieren de las de los walkers (8 / 20).
- Riesgo de alucinación: no aplica (no es un modelo generativo de lenguaje). El riesgo equivalente es de generalización: el rendimiento fuera de la distribución de aleatorización (empujes > ±0.15 m/s, fricción fuera de [0.4, 2.5], variaciones de CoM mayores) no está caracterizado.
- Licencia Apache 2.0: permite uso comercial con atribución, pero el modelo no está validado para producción ni para operación en hardware real.
- El código de entrenamiento no está publicado (rama local no commiteada, commit `367d660d7`), lo que limita la reproducibilidad completa.
- Idiomas soportados: no disponible; el modelo no procesa lenguaje.

## Enlaces

- Hugging Face: https://huggingface.co/duckyduck369/microduck-hd1910-flamingo-djbob
- Vídeo de replay: https://huggingface.co/duckyduck369/microduck-hd1910-flamingo-djbob/resolve/main/replay.mp4
- Otros enlaces (papers, blogs, repos, demos): no disponibles en la información proporcionada.
