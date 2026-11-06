# GinDuck/microduck-sprint-2m-sprint-2-b

## Resumen

`sprint-2m-sprint-2-b` es un checkpoint de política de control para el robot cuadrúpedo de código abierto microduck, desarrollado por el usuario GinDuck y entrenado sobre el framework de retos de Pollen Robotics. No es un modelo de lenguaje: es una política de aprendizaje por refuerzo (reinforcement learning) exportada a ONNX que genera comandos de locomoción a partir de observaciones del robot. El modelo se publica bajo la librería `microduck` y el pipeline `robotics`, con un tamaño de repositorio de 0.0 GB (pesos ligeros, propios de una política de control).

La política es de tipo *perpetuo*: ejecuta una marcha (gait) de forma continua hasta que se le indique lo contrario, cargándose en una ranura de política del daemon del robot. Trabaja a 50 Hz, consume observaciones de 61 dimensiones y emite 14 acciones de control. Según la model card, completa cada ciclo de carrera en aproximadamente 1.2 segundos, priorizando velocidad bruta y "lanzándose" a la carrera.

Este checkpoint corresponde a un estado intermedio del segundo sprint de entrenamiento (checkpoint 2750 de 3000 iteraciones máximas), con semilla 1, sobre la tarea `Mjlab-Sprint2m-MicroDuck` de la rama `race-2`. Es relevante para quienes experimentan con locomoción de bajo nivel en robótica de código abierto y quieren reproducir o comparar políticas de velocidad entrenadas con mjlab.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Política de aprendizaje por refuerzo exportada a ONNX (arquitectura de red no especificada en la información disponible) |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica; observación de 61 dimensiones por paso |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no aplica (modelo de control robótico, no lingüístico) |
| Licencia | no disponible |
| Formato de pesos | ONNX (`policy.onnx`) y `manifest.json` con esquema 2 del manifiesto de políticas microduck |

## Arquitectura y entrenamiento

La política se entrena mediante aprendizaje por refuerzo con el framework mjlab (base `mjlab-microduck 0.1.0 @ 1efd853be`), dentro del repositorio `microduck-challenges`, rama `race-2`, commit `b44f7ffc9`. La tarea es `Mjlab-Sprint2m-MicroDuck`, orientada a maximizar la velocidad de carrera del cuadrúpedo. El entrenamiento se lanzó el 2026-11-02T13:25:30Z con 4096 entornos paralelos, un máximo de 3000 iteraciones del agente, semilla 1 y registro en TensorBoard bajo el nombre de ejecución `sprint-2`. El checkpoint publicado corresponde a la iteración 2750.

La receta de entrenamiento es compartida por TheSauceman. La política opera a 50 Hz con un espacio de observación de 61 dimensiones y un espacio de acción de 14 dimensiones. El normalizador de observaciones está integrado dentro de `policy.onnx`, de modo que el robot debe alimentar observaciones en bruto. El autor advierte que el entrenamiento no es bit-reproducible entre máquinas: repetir el mismo comando con el mismo `uv.lock` y la misma semilla produce una política comparable, pero no idéntica. No se detalla en la información disponible la topología exacta de la red (capas, activaciones) ni la composición del dataset de entrenamiento más allá del simulador.

## Capacidades

- Locomoción perpetua del cuadrúpedo microduck: ejecuta una marcha continua hasta recibir una orden de parada o cambio de política.
- Control a 50 Hz con observaciones de 61 dimensiones y 14 acciones.
- Marcha orientada a velocidad: completa cada ciclo de carrera en aproximadamente 1.2 segundos.
- Integración con el daemon del robot mediante `robotctl policy load <slot>`, que carga la política en una ranura.
- Normalización de observaciones incluida en el propio ONNX, lo que simplifica el despliegue en el robot.
- Compatible con el esquema 2 del manifiesto de políticas microduck (`manifest.json`).
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingües: es un controlador de bajo nivel, no un modelo generativo.

## Casos de uso

- Locomoción de velocidad en el microduck: cargar la política en una ranura con `robotctl policy load` para que el robot ejecute una marcha de carrera continua a 50 Hz, adecuada para pruebas de velocidad en pista.
- Benchmarking de políticas de sprint: comparar este checkpoint intermedio (iteración 2750) con otros checkpoints del mismo sprint para evaluar la evolución del rendimiento durante el entrenamiento.
- Reproducción de experimentos de RL: reentrenar con el comando documentado (`uv run train Mjlab-Sprint2m-MicroDuck --env.scene.num-envs 4096 --agent.max-iterations 3000 --agent.seed 1`) para obtener políticas comparables y estudiar la variabilidad entre máquinas.
- Investigación en simulación a realidad: validar en el robot físico una política entrenada en mjlab con 4096 entornos paralelos, aprovechando la normalización embebida para reducir errores de integración.
- Desarrollo de retos de robótica: usar el checkpoint como referencia en la rama `race-2` del repositorio `microduck-challenges` para construir o evaluar nuevas recetas de entrenamiento.
- Pruebas de integración del daemon: verificar el flujo de carga de políticas, el manifiesto de esquema 2 y la ejecución perpetua en un robot real o simulado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El único dato de rendimiento es cualitativo y proviene de la model card: cada ciclo de carrera se completa en aproximadamente 1.2 segundos.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el repositorio ocupa 0.0 GB y la política es un ONNX ligero, por lo que se espera un consumo mínimo, pero no se confirma en la información disponible.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible; por el tamaño del artefacto es plausible que se ejecute en CPU o en GPU de gama baja, pero no se especifica.
- Opciones de despliegue: ONNX Runtime (formato `policy.onnx`) y el daemon microduck mediante `robotctl policy load <slot>`.
- Latencia y throughput: frecuencia de control de 50 Hz; no se publican cifras de latencia por inferencia.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye otros checkpoints o políticas comparables con especificaciones publicadas (parámetros, contexto, rendimiento o licencia) que permitan una comparación rigurosa.

## Limitaciones y advertencias

- Licencia no disponible: no se puede confirmar el uso comercial ni la redistribución de los pesos.
- Modelo específico para el robot microduck: no es reutilizable en otras plataformas sin reentrenamiento.
- Entrenamiento no bit-reproducible: la misma semilla y el mismo comando producen políticas comparables, no idénticas.
- Checkpoint intermedio (iteración 2750 de 3000): puede no representar el mejor estado del sprint.
- Sin datos de benchmarks ni métricas cuantitativas de rendimiento más allá del tiempo de ciclo (~1.2 s).
- Sin información sobre sesgos, alucinación o limitaciones de idioma: no aplica a un modelo de control, pero tampoco se documentan fallos de política, comportamientos inseguros ni límites de robustez en el robot físico.
- El repositorio tiene 0 descargas y 0 likes, sin validación comunitaria publicada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/GinDuck/microduck-sprint-2m-sprint-2-b
- Repositorio microduck: https://github.com/pollen-robotics/microduck
- Repositorio de retos microduck: https://github.com/pollen-robotics/microduck-challenges
