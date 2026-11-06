# AndoShy/microduck-tug-pool21-2000

## Resumen

`microduck-tug-pool21-2000` es una política de control robótico entrenada por el usuario AndoShy para el robot cuadrúpedo educativo microduck de Pollen Robotics. No es un modelo de lenguaje: es una política de aprendizaje por refuerzo (reinforcement learning) exportada a ONNX que se carga en una ranura de política del daemon `robotctl` del robot. La tarea entrenada es `Mjlab-TugOfWar-MicroDuck`, un escenario de simulación en el que el robot compite en un juego de tirar de la cuerda contra otras políticas.

La política opera a 50 Hz con una observación de 61 dimensiones y 14 acciones, y es de tipo "perpetuo": no termina por sí sola, sino que ejecuta una marcha continua hasta que se le indica lo contrario. El checkpoint corresponde a la iteración 2000 de un entrenamiento con 2048 entornos paralelos y semilla 1, partiendo de un run anterior (`pool20`, checkpoint 1720) y con un pool de 64 oponentes de referencia.

Su relevancia es acotada pero clara: forma parte de un ecosistema de retos comunitarios de robótica de bajo coste donde los investigadores pueden entrenar, comparar y desplegar políticas de locomoción y manipulación en hardware real. El modelo es pequeño (el repo ocupa 0.0 GB) y está pensado para ejecutarse en el propio robot, no en servidores.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Política de reinforcement learning exportada a ONNX (arquitectura de red no detallada en la model card) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica; ventana de observación de 61 dimensiones por paso |
| Tipos de cuantizacion | no disponible (se distribuye como `policy.onnx`) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | ONNX (`policy.onnx`) + `manifest.json` con esquema 2 del manifiesto de políticas microduck |
| Frecuencia de control | 50 Hz |
| Dimension de observacion | 61 |
| Dimension de accion | 14 |
| Checkpoint | 2000 (iteracion) |
| Semilla | 1 |

## Arquitectura y entrenamiento

La model card no detalla la topología de la red neuronal (capas, dimensiones ocultas ni tipo de política). Lo que sí se especifica es el pipeline de entrenamiento: se usó `mjlab-microduck 0.1.0` (commit `1efd853be`), un framework de RL basado en MuJoCo, con el entorno `Mjlab-TugOfWar-MicroDuck` del repositorio `pollen-robotics/microduck-challenges` (rama `andoshy-tug`, commit `4ecabf29e`). El entrenamiento se lanzó con 2048 entornos paralelos, un máximo de 300 iteraciones, guardado cada 10 iteraciones, `desired-kl` de 0.005 y `entropy-coef` de 0.002, lo que sugiere un algoritmo tipo PPO con control de KL.

El entrenamiento es incremental: parte del run `pool20` en el checkpoint `model_1720.pt` y continúa hasta la iteración 2000. El elemento técnico más destacable es el uso de un pool de 64 oponentes de referencia (políticas ONNX de otros usuarios como `greecree_super-v9_h2h`, `juicenv_anchor1`, `rumezhak_league-v3_h2h`, `pool20-1640`, etc.) muestreados con repetición, lo que constituye una forma de curriculum por auto-juego contra población (population-based training) para evitar el olvido catastrófico y sobreajuste a un único rival. El autor advierte que el entrenamiento no es bit-reproducible entre máquinas aunque se usen el mismo código, `uv.lock`, comando y semilla.

## Capacidades

- Ejecución de una marcha continua ("perpetua") para el juego de tirar de la cuerda en el robot microduck, sin condición de terminación propia.
- Control motor a 50 Hz con 14 acciones sobre un robot cuadrúpedo de pequeño tamaño.
- Procesamiento de observaciones de 61 dimensiones con normalizador integrado en el propio ONNX (se alimenta con observaciones en bruto).
- Comportamiento competitivo contra un pool diverso de oponentes entrenados por la comunidad, incluyendo políticas de referencia con historial de enfrentamientos cabeza a cabeza.
- Carga directa en una ranura de política del daemon `robotctl` mediante el comando `sudo robotctl policy load <slot> AndoShy/microduck-tug-pool21-2000`.
- No soporta tool calling, agentes, razonamiento multi-paso, capacidades multilingües, visión ni audio: es una política de control motor, no un modelo generativo.

## Casos de uso

- Investigación en aprendizaje por refuerzo multiagente: sirve como política de referencia y como oponente en el pool de entrenamiento de otras políticas de tirar de la cuerda, permitiendo estudiar dinámicas de auto-juego y currículos por población.
- Despliegue en el robot microduck para demostraciones educativas: se carga en una ranura con `robotctl` y el robot ejecuta la marcha de forma continua, útil en talleres de robótica y ferias.
- Evaluación comparativa de políticas: al ser un checkpoint concreto (iteración 2000, semilla 1) y con comando de reproducción documentado, se puede usar como baseline reproducible (con la salvedad de no ser bit-reproducible) en experimentos de la comunidad.
- Benchmark de simulación a realidad: permite medir la brecha sim-to-real de una política entrenada en MuJoCo sobre hardware de bajo coste, comparando el comportamiento en simulación con el del robot físico.
- Generación de datos de comportamiento: la política puede ejecutarse en simulación para producir trayectorias de observación-acción que alimenten otros entrenamientos o análisis de estabilidad de marchas.
- Estudio de robustez frente a oponentes: al haber sido entrenada contra 64 políticas distintas, es un sujeto adecuado para analizar cómo generaliza una política de RL a rivales no vistos durante el entrenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de recompensa, tasa de victorias ni comparaciones cuantitativas con otras políticas.

## Requisitos de hardware

- El modelo se ejecuta en el propio robot microduck de Pollen Robotics, no en GPU de servidor; el repo ocupa 0.0 GB y el archivo principal es un `policy.onnx` de política pequeña.
- VRAM estimada para inferencia: no disponible; por el tamaño del repo, es despreciable y cabe en cualquier dispositivo que ejecute el daemon del robot.
- GPU recomendadas: no aplica para inferencia en robot. Para reentrenar, la model card no especifica requisitos de GPU, aunque el uso de 2048 entornos paralelos en MuJoCo con 300 iteraciones sugiere una GPU dedicada (no se indica modelo concreto).
- Cabe en GPU consumer: sí para inferencia (no requiere GPU); para entrenamiento no hay datos publicados.
- Opciones de despliegue: `robotctl` (daemon de microduck) con `sudo robotctl policy load <slot> AndoShy/microduck-tug-pool21-2000`; el ONNX puede ejecutarse con cualquier runtime ONNX estándar.
- Latencia y throughput: la política corre a 50 Hz (periodo de 20 ms) por diseño del entorno; no se publican cifras de latencia adicionales.

## Comparativa con modelos similares

| Modelo | Tarea | Parametros | Contexto / observacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| AndoShy/microduck-tug-pool21-2000 | Tirar de la cuerda (microduck) | no disponible | 61-D obs, 14 acciones, 50 Hz | no disponible | Hugging Face |
| AndoShy/microduck-tug-pool2 | Tirar de la cuerda (microduck) | no disponible | no disponible | no disponible | Hugging Face |
| AndoShy/microduck-tug-pool4-1200 | Tirar de la cuerda (microduck) | no disponible | no disponible | no disponible | Hugging Face |

Las alternativas encontradas son del mismo autor y misma familia de tareas, por lo que la comparación cuantitativa de rendimiento no está disponible. No se han identificado políticas comparables de otros autores con datos publicados en la información proporcionada.

## Limitaciones y advertencias

- Es una política de control motor específica para la tarea `Mjlab-TugOfWar-MicroDuck`; no es un modelo de lenguaje ni un modelo generativo y no debe evaluarse como tal.
- Licencia no disponible: no se puede asumir uso comercial sin consultar al autor.
- Idiomas no disponibles: no aplica, pero la ausencia de metadatos impide confirmar restricciones de uso regional.
- El comportamiento está fuertemente condicionado por el pool de oponentes del entrenamiento; puede degradarse frente a rivales con estrategias no representadas en el pool.
- La model card advierte que el autor describe al agente como temeroso de "un pato que se tumba y se niega a jugar", lo que sugiere una vulnerabilidad conocida frente a oponentes pasivos o no cooperativos.
- El entrenamiento no es bit-reproducible: los pesos no se pueden regenerar exactamente, solo obtener una política "comparable".
- No hay métricas publicadas de tasa de victorias, recompensa media ni robustez sim-to-real, por lo que no se puede evaluar su rendimiento de forma objetiva.
- El repo tiene 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de validación por parte de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/AndoShy/microduck-tug-pool21-2000
- Repositorio microduck: https://github.com/pollen-robotics/microduck
- Repositorio de retos de entrenamiento: https://github.com/pollen-robotics/microduck-challenges
- Política hermana pool2: https://huggingface.co/AndoShy/microduck-tug-pool2
- Política hermana pool4-1200: https://huggingface.co/AndoShy/microduck-tug-pool4-1200/tree/main
