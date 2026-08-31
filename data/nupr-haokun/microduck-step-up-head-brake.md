# Nupr-Haokun/microduck-step-up-head-brake

## Resumen

Microduck Step-Up + Head-Brake Recovery es un controlador de dos políticas entrenado con aprendizaje por refuerzo (PPO) para el robot bípedo Microduck de Pollen Robotics. El modelo resuelve una tarea concreta: cruzar un escalón de 25 mm de altura con borde cuadrado, usar la cabeza como freno temporal de apoyo, recuperar la postura erguida y detenerse sobre la plataforma superior. Es un experimento comunitario independiente, no un lanzamiento oficial de Pollen Robotics.

El controlador está formado por dos actores ONNX: `step_up_walk.onnx`, que cruza el escalón con una orden de avance de 0,30 m/s, y `step_up_stand_recovery.onnx`, que se activa con orden cero, frena con la cabeza y se pone en pie. Ambos siguen el contrato de ejecución estándar de Microduck: observación de 61 flotantes y salida de 14 acciones a 50 Hz, con normalización integrada en el propio modelo. El estado actual es de validación exclusivamente en simulación; no se ha probado aún en hardware real.

La relevancia de este modelo radica en que demuestra un enfoque de sim2real para habilidades de locomoción complejas en robots de bajo coste, con una documentación completa del proceso de entrenamiento y evaluación. Su licencia Apache 2.0 permite uso comercial y modificación, aunque con las advertencias de seguridad correspondientes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Política neuronal (PPO) sin especificar; exportada a ONNX |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (controlador de robot, no modelo de lenguaje) |
| Tipos de cuantizacion | no disponible (formato ONNX estándar) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (dos archivos: `step_up_walk.onnx` y `step_up_stand_recovery.onnx`) |

## Arquitectura y entrenamiento

La arquitectura exacta de la red neuronal no se detalla en la documentación disponible, pero se sabe que ambos actores fueron entrenados con el algoritmo PPO (Proximal Policy Optimization). El entrenamiento se basa en el stack oficial de Pollen Robotics `microduck_rl` (revisión base `d424a0c899f6b33cbd3daeb279913134349c0b63`), que utiliza entornos de simulación MuJoCo con modelos fieles del robot, incluyendo la posibilidad de entrenar con backlash (juego mecánico) en las articulaciones para mejorar la transferencia sim2real.

El conjunto de entrenamiento incluye una tarea de cruce de escalón de 25 mm, una base de estados de recuperación (recovery-state bank) y funciones de recompensa específicas para la tarea. El checkpoint seleccionado para el cruce (`step_up_walk_model_1000.pt`) está disponible para reanudar el entrenamiento, pero el checkpoint exacto del actor de recuperación no se conservó, lo que limita la reproducibilidad completa de esa política.

La observación es un vector de 61 flotantes que incluye estados del robot (posiciones, velocidades, orientaciones, etc.) y la salida son 14 acciones correspondientes a los servos. La normalización de observaciones está integrada en el modelo ONNX, lo que simplifica su despliegue.

## Capacidades

- Cruce de escalones de 25 mm de altura con borde cuadrado a una velocidad de avance de 0,30 m/s.
- Uso de la cabeza como freno/soporte temporal para estabilizarse tras el cruce.
- Recuperación de la postura erguida (coseno de la vertical ≥ 0,8) y detención sobre la plataforma superior.
- Operación a 50 Hz con latencia determinista gracias al formato ONNX.
- Dos modos de funcionamiento: caminar (step_up_walk) y recuperación/parada (step_up_stand_recovery), activados por un controlador externo.
- No detecta el escalón por sí mismo: requiere alineación previa y orden de velocidad cero desde un operador o capa de percepción externa.
- Validado en simulación determinista con 13 de 14 casos estables; no validado en hardware real.

## Casos de uso

- Evaluación de habilidades de locomoción en robótica educativa: el modelo permite a estudiantes e investigadores probar un controlador de cruce de obstáculos en el Microduck, tanto en simulación como en hardware con las debidas medidas de seguridad.
- Investigación en sim2real: sirve como caso de estudio para analizar la transferencia de políticas entrenadas en MuJoCo a un robot físico de bajo coste, con documentación de los fallos y limitaciones.
- Desarrollo de comportamientos de recuperación ante perturbaciones: la política de frenado con la cabeza y posterior levantamiento puede adaptarse a otras tareas de estabilización en robots bípedos.
- Integración en pipelines de control reactivo: al ser un "controller-triggered skill", puede combinarse con un sistema de percepción visual o LiDAR (el Microduck lleva cámara y LiDAR) que active el cruce cuando detecte el escalón.
- Pruebas de robustez ante condiciones iniciales variadas: la evaluación con distintos yaws y offsets demuestra su uso para estudiar la sensibilidad del controlador ante perturbaciones en la pose inicial.
- Base para extensiones de la tarea: el código fuente y los checkpoints permiten modificar la altura del escalón, añadir obstáculos o cambiar la velocidad objetivo para generar nuevas variantes de la habilidad.

## Benchmarks y rendimiento

Los resultados de evaluación en simulación se presentan en la documentación del modelo. Son casos deterministas, no una garantía estadística:

| Configuracion de prueba | Casos estables | Casos totales |
|---|---|---|
| Yaw canonico (-10/-5/0/+5/+10 grados) | 5 | 5 |
| Offset de inicio (-2/0/+2 cm) combinado con yaw (-10/0/+10 grados) | 8 | 9 |
| Total publicado | 13 | 14 |

El criterio de estabilidad es: ambos pies permanecen en la plataforma superior, coseno de la vertical ≥ 0,8 y velocidad horizontal ≤ 0,05 m/s al final. El único fallo conocido ocurre con un offset de +2 cm y yaw de -10 grados, donde el robot alcanza la superficie superior pero sale por el lateral de la plataforma.

No se han publicado resultados comparativos con otros controladores en la información disponible.

## Requisitos de hardware

- El modelo es extremadamente ligero: dos archivos ONNX con entrada de 61 flotantes y salida de 14, lo que implica una red neuronal pequeña (del orden de miles de parámetros, aunque el número exacto no se indica).
- Puede ejecutarse en tiempo real en el propio Microduck, que utiliza un procesador RK3566 (ARM Cortex-A55) según la información pública del robot. No se requieren GPUs.
- Para simulación, basta con un ordenador estándar con MuJoCo y ONNX Runtime.
- Opciones de despliegue: ONNX Runtime, integrable en el stack de control del robot mediante el archivo `robotd-policy-overrides.toml` incluido.
- Latencia: no se especifica, pero la tasa de control de 50 Hz implica que cada inferencia debe completarse en menos de 20 ms; dado el tamaño, es factible en el hardware objetivo.

## Comparativa con modelos similares

No se dispone de información sobre otros controladores de RL para Microduck o robots bípedos similares que permitan una comparación directa. El propio modelo indica que es un experimento comunitario independiente, no oficial. Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- El modelo no ha sido validado en hardware físico. Solo ha sido probado en simulación determinista, y la transferencia sim2real no está demostrada.
- Puede hacer que el robot físico se caiga, colisione, se pince, se sobrecaliente o salga de la plataforma. Es obligatorio leer el archivo `SAFETY.md` del repositorio antes de cualquier prueba en hardware.
- No detecta el escalón por sí mismo: requiere un operador o sistema de percepción externo que alinee el robot y ordene la velocidad cero tras el cruce.
- Limitación de reproducibilidad: el checkpoint exacto del actor de recuperación no se conservó, por lo que esa política no puede reanudarse desde el punto de entrenamiento original.
- La evaluación en simulación usa casos deterministas, no una muestra estadística; los resultados no deben interpretarse como una tasa de éxito general.
- Licencia Apache 2.0 permite uso comercial, pero el autor advierte que es un experimento independiente y no una liberación oficial de Pollen Robotics; el soporte y mantenimiento no están garantizados.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Nupr-Haokun/microduck-step-up-head-brake
- Repositorio de código fuente: https://github.com/bihaokun/microduck-step-up-policy
- Stack oficial de entrenamiento RL: https://github.com/pollen-robotics/microduck_rl
- Página del robot Microduck: https://pollen-robotics.com/microduck/
- Repositorio oficial del robot: https://github.com/pollen-robotics/microduck
- Documento de seguridad: https://github.com/bihaokun/microduck-step-up-policy/blob/main/SAFETY.md
- Artículo de prensa sobre Microduck: https://circuitdigest.com/news/this-microduck-robot-based-on-an-rk3566-has-no-arms-but-picks-things-up-using-ai-and-reinforcement-learning
