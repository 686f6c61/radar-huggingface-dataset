# GinDuck/microduck-hill-climb-1m5-hill-2-c

## Resumen

microduck-hill-climb-1m5-hill-2-c es una política de control por refuerzo (reinforcement learning) entrenada para el robot cuadrúpedo de código abierto microduck de Pollen Robotics. No es un modelo de lenguaje: se trata de un checkpoint intermedio de la segunda campaña de entrenamiento de escalada ("hill-2") del autor GinDuck, empaquetado como `policy.onnx` y consumible por el daemon `robotctl` del robot. La política es perpetua (se ejecuta de forma continua hasta que se le indique lo contrario) y actúa como una marcha cargada en una ranura de política del robot.

El modelo resuelve una tarea concreta: subir una rampa de 1,5 m a la máxima velocidad posible manteniendo la trayectoria. Según la model card, completa cada recorrido en aproximadamente 1,4 segundos. La observación es de 61 dimensiones y la acción de 14 dimensiones, ejecutándose a 50 Hz. El normalizador de observaciones está embebido en el fichero ONNX, por lo que se alimentan observaciones en crudo.

Es relevante en el contexto de la robótica de bajo coste y el aprendizaje por refuerzo reproducible: el autor documenta el pipeline completo (task_id, repositorio, commit, semilla, checkpoint) para que otros puedan reproducir el entrenamiento con el mismo código y comando, aunque los pesos no serán idénticos por la no determinabilidad bit a bit del entrenamiento en GPU.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Política de reinforcement learning exportada a ONNX (arquitectura de red no detallada en la model card) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (política de control; observación de 61 dimensiones por paso) |
| Tipos de cuantizacion | no disponible (distribución en ONNX) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | ONNX (`policy.onnx`) más `manifest.json` (esquema 2 del manifiesto de políticas microduck) |

## Arquitectura y entrenamiento

La política se entrenó con el framework `mjlab-microduck 0.1.0` (base `1efd853be`) sobre la tarea `Mjlab-HillClimb1m5-MicroDuck`, dentro del repositorio `pollen-robotics/microduck-challenges`, rama `race-2`, commit `b44f7ffc9`. El entrenamiento usó 4096 entornos paralelos, un máximo de 3000 iteraciones del agente y semilla 1, con registro en TensorBoard bajo el nombre de ejecución `hill-2`. Este checkpoint corresponde a la iteración 2000, iniciado el 2026-11-02T16:43:48Z.

La receta de entrenamiento es compartida con TheSauceman, según la model card. El objetivo declarado es maximizar la velocidad bruta de subida por la rampa manteniendo la línea. La política se distribuye con el normalizador de observaciones integrado en el ONNX y un manifiesto que sigue el esquema 2 del daemon microduck. No se detalla en la información disponible la topología interna de la red (capas, activaciones, número de parámetros) ni el volumen o composición del dataset de entrenamiento más allá de la simulación en `mjlab`.

## Capacidades

- Control locomotor de un robot cuadrúpedo microduck para la tarea de escalada de rampa de 1,5 m.
- Política perpetua: se ejecuta de forma continua hasta que se le indique lo contrario, funcionando como una marcha cargada en una ranura.
- Observación de 61 dimensiones y acción de 14 dimensiones a 50 Hz.
- Normalización de observaciones integrada en el ONNX, lo que permite alimentar observaciones en crudo.
- Despliegue directo mediante el comando `robotctl policy load <slot> GinDuck/microduck-hill-climb-1m5-hill-2-c`.
- Completado de cada recorrido en aproximadamente 1,4 segundos según la model card.
- No dispone de tool calling, razonamiento multi-paso, capacidades multilingües ni modos de pensamiento: es una política motora, no un modelo generativo.

## Casos de uso

- Investigación en locomoción de cuadrúpedos de bajo coste: cargar la política en un microduck físico para estudiar el comportamiento de escalada a máxima velocidad y compararlo con otros checkpoints de la misma campaña.
- Benchmarking de recetas de RL: al compartir receta con TheSauceman y documentar commit, semilla y comando, sirve para comparar curvas de aprendizaje y políticas resultantes entre ejecuciones.
- Evaluación de robustez en rampa: probar la política en distintas inclinaciones o superficies de la rampa de 1,5 m para medir la degradación del comportamiento fuera de distribución.
- Demostraciones de robótica educativa: usar la política como ejemplo reproducible de un pipeline completo de entrenamiento en simulación y despliegue en hardware real.
- Pruebas de integración del daemon `robotctl`: validar la carga de políticas, el esquema 2 de manifiesto y el manejo de ranuras en un robot microduck.
- Análisis de velocidad frente a estabilidad: comparar este checkpoint intermedio (iteración 2000) con el resto de la campaña `hill-2` para estudiar el compromiso entre rapidez y sujeción de la línea.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La única métrica reportada en la model card es el tiempo de completado del recorrido, aproximadamente 1,4 segundos por ejecución.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; al tratarse de una política pequeña en ONNX para un robot microduck, se espera que quepa en hardware muy modesto, pero no se confirma en la información disponible.
- GPU recomendadas: no disponible; el despliegue se realiza en el propio robot mediante `robotctl`, no en un servidor de inferencia.
- Compatibilidad con GPU de consumo: no confirmada en la información disponible.
- Opciones de despliegue: daemon `robotctl` del microduck (comando `robotctl policy load`); el formato ONNX permite en principio ejecución con runtimes ONNX estándar, aunque no se documenta en la model card.
- Latencia y throughput: la política opera a 50 Hz (periodo de 20 ms por paso); el recorrido completo se completa en aproximadamente 1,4 segundos según el autor.

## Comparativa con modelos similares

| Modelo | Tipo | Tarea | Contexto / observación | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| GinDuck/microduck-hill-climb-1m5-hill-2-c | Política RL (ONNX) | Escalada de rampa 1,5 m | 61-D obs / 14 acciones a 50 Hz | no disponible | Hugging Face |
| GinDuck/microduck-hill-climb-1m5-hill-2-b | Política RL (ONNX) | Escalada de rampa 1,5 m | 61-D obs / 14 acciones a 50 Hz | no disponible | Hugging Face |
| GinDuck/microduck-hill-climb-1m5-hill-1 | Política RL (ONNX) | Escalada de rampa 1,5 m | 61-D obs / 14 acciones a 50 Hz | no disponible | Hugging Face |

Los tres modelos pertenecen a la misma familia y campaña del autor; no se dispone de datos comparativos de rendimiento entre ellos en la información proporcionada.

## Limitaciones y advertencias

- Es un checkpoint intermedio (iteración 2000 de 3000 máximas), no el modelo final de la campaña; su comportamiento puede diferir del de checkpoints posteriores.
- Política especializada exclusivamente en la tarea de escalada de rampa de 1,5 m; no es un modelo de propósito general ni un modelo de lenguaje.
- El entrenamiento en GPU no es reproducible bit a bit: reentrenar con el mismo código, comando y semilla produce una política comparable, no los mismos pesos.
- No se especifica la licencia, por lo que el uso comercial queda sin garantías jurídicas hasta que el autor la declare.
- No se documentan sesgos, riesgos de alucinación ni limitaciones de idioma porque no aplican a una política motora; sí existe riesgo de fallo físico al desplegarla en hardware real sin las protecciones adecuadas.
- El rendimiento de 1,4 segundos por recorrido corresponde a las condiciones de simulación del autor; el comportamiento en un robot físico puede variar.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validación por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/GinDuck/microduck-hill-climb-1m5-hill-2-c
- Checkpoint hermano hill-2-b: https://huggingface.co/GinDuck/microduck-hill-climb-1m5-hill-2-b
- Checkpoint hermano hill-1: https://huggingface.co/GinDuck/microduck-hill-climb-1m5-hill-1
- Repositorio del robot microduck: https://github.com/pollen-robotics/microduck
- Repositorio de retos y entrenamiento: https://github.com/pollen-robotics/microduck-challenges
