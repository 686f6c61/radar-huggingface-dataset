# GinDuck/microduck-sprint-2m-sprint-2-k

## Resumen

microduck-sprint-2m-sprint-2-k es un checkpoint de política de control para el robot cuadrúpedo de código abierto microduck de Pollen Robotics, publicado por el usuario GinDuck en Hugging Face. No se trata de un modelo de lenguaje ni de un modelo fundacional generativo, sino de una política de aprendizaje por refuerzo entrenada para producir una marcha (gait) que mantiene al robot erguido y le permite completar un circuito de sprint. El artefacto se distribuye como un fichero ONNX con el normalizador de observaciones integrado y un manifiesto `manifest.json` conforme al esquema 2 del daemon de microduck.

El modelo recibe observaciones de 61 dimensiones y emite 14 acciones a 50 Hz, funcionando como política perpetua: una vez cargada en una ranura de política del robot, se ejecuta de forma continua hasta que se le indique lo contrario. El entrenamiento se realizó con el framework mjlab sobre la tarea `Mjlab-Sprint2m-MicroDuck` del repositorio `microduck-challenges` (rama `race-2`, commit `b44f7ffc9`), con 4096 entornos paralelos, 3000 iteraciones máximas y semilla 1, partiendo del checkpoint 500.

La relevancia de esta ficha es acotada: se trata de un checkpoint experimental de un proyecto de robótica de aficionado, sin métricas de benchmarks publicadas, sin licencia declarada y sin idiomas especificados (no aplica, al no ser un modelo de lenguaje). Su interés reside en la reproducibilidad del pipeline de entrenamiento y en la integración directa con el hardware microduck mediante el comando `robotctl policy load`.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Política de aprendizaje por refuerzo (no se especifica la topología de red en la información disponible) |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (política de control, no modelo de lenguaje) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no aplica |
| Licencia | no disponible |
| Formato de pesos | ONNX (`policy.onnx`) con normalizador de observaciones integrado; manifiesto `manifest.json` (esquema 2) |

Especificaciones adicionales del entorno de control:

| Parámetro | Valor |
|---|---|
| Dimensiones de observación | 61 |
| Dimensiones de acción | 14 |
| Frecuencia de control | 50 Hz |
| Tipo de política | perpetua (gait continuo) |
| Tarea de entrenamiento | `Mjlab-Sprint2m-MicroDuck` |
| Framework de entrenamiento | mjlab (base `mjlab-microduck 0.1.0 @ 1efd853be`) |
| Checkpoint | 500 |
| Semilla | 1 |
| Commit del repo de entrenamiento | `b44f7ffc9` (rama `race-2`) |
| Fecha de inicio del entrenamiento | 2026-11-02T13:25:30Z |
| Entornos paralelos | 4096 |
| Iteraciones máximas | 3000 |

## Arquitectura y entrenamiento

La información disponible no detalla la topología de la red neuronal de la política (número de capas, anchura, tipo de activación ni si emplea una arquitectura MLP, recurrente o transformer). Lo que sí se documenta es el pipeline de entrenamiento: aprendizaje por refuerzo con simulación masivamente paralela (4096 entornos) sobre la tarea `Mjlab-Sprint2m-MicroDuck` del repositorio `microduck-challenges`, usando el framework mjlab en su versión `0.1.0` fijada al commit `1efd853be`. El entrenamiento partió del checkpoint 500, con 3000 iteraciones máximas y semilla 1, y registró métricas en TensorBoard bajo el nombre de ejecución `sprint-2`.

El autor indica explícitamente que el entrenamiento no es bit-reproducible entre máquinas: repetir el mismo comando con el mismo `uv.lock` y la misma semilla produce una política comparable, pero no idéntica. La política se describe como "perpetua", es decir, un gait continuo que se ejecuta hasta recibir una orden contraria, y se carga en una ranura de política del daemon del robot mediante `robotctl policy load`. El normalizador de observaciones está embebido en el propio `policy.onnx`, de modo que el consumidor debe alimentar observaciones en bruto, sin preprocesar. El autor menciona que la receta de entrenamiento fue compartida por TheSauceman y que la política se mantuvo erguida y completó el circuito en las cinco pruebas realizadas.

## Capacidades

- Locomoción cuadrúpeda: genera una marcha de sprint que mantiene el robot erguido y le permite desplazarse por un circuito.
- Control en tiempo real a 50 Hz con observaciones de 61 dimensiones y 14 acciones.
- Política perpetua: ejecución continua del gait hasta que se le indique lo contrario.
- Integración directa con el daemon de microduck mediante `robotctl policy load <slot>`.
- Normalización de observaciones integrada en el fichero ONNX (entrada de observaciones en bruto).
- Compatibilidad con el esquema 2 del manifiesto de políticas de microduck.
- Reproducibilidad del pipeline de entrenamiento mediante `uv`, comando documentado y semilla fija (con la salvedad de no ser bit-reproducible).
- No soporta tool calling, function calling, razonamiento multi-paso, capacidades multilingües ni procesamiento de visión, audio o texto: es una política de control motor, no un modelo generativo.

## Casos de uso

- Investigación en locomoción de bajo coste: usar la política como línea base para comparar recetas de entrenamiento de marcha en el robot microduck, ya que el pipeline completo (repo, commit, semilla, comando) está documentado y es reproducible de forma aproximada.
- Demostración educativa de aprendizaje por refuerzo en robótica: cargar la política en un microduck físico o simulado para ilustrar cómo una política entrenada en simulación con 4096 entornos se transfiere a hardware real.
- Pruebas de integración del daemon: validar el flujo `robotctl policy load` y el esquema 2 del manifiesto de políticas en un entorno de desarrollo antes de desplegar políticas propias.
- Benchmark de gait en circuitos de sprint: emplear el checkpoint como referencia de velocidad y estabilidad en la tarea `Mjlab-Sprint2m-MicroDuck`, dado que el autor reporta finalización en las cinco pruebas realizadas.
- Punto de partida para fine-tuning: reanudar el entrenamiento desde este checkpoint con la misma tarea y semilla para explorar variaciones de recompensa o de parámetros del entorno.
- Validación de robustez en simulación: ejecutar la política en mjlab con distintos números de entornos o condiciones iniciales para medir la varianza del gait antes de probarla en el robot físico.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El único dato de rendimiento cualitativo es la afirmación del autor de que la política se mantuvo erguida y alcanzó la meta en las cinco pruebas realizadas, sin cifras de velocidad, distancia, tiempo ni métricas de recompensa.

## Requisitos de hardware

- El tamaño del repositorio es de 0.0 GB según Hugging Face, lo que sugiere un artefacto ONNX de pocos megabytes; no se dispone del tamaño exacto del fichero.
- VRAM estimada para inferencia: no disponible; por el tipo de artefacto (política de control en ONNX) es previsible que quepa en cualquier GPU consumer, pero no se confirma en la información proporcionada.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU consumer: no confirmada explícitamente; el despliegue previsto es en el propio robot microduck, no en un servidor con GPU.
- Opciones de despliegue: daemon de microduck mediante `robotctl policy load <slot>`; el formato ONNX permite inferencia con ONNX Runtime.
- Latencia y throughput: frecuencia de control de 50 Hz (20 ms por ciclo); no se publican latencias medidas ni throughput.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye otros checkpoints de microduck ni políticas comparables con las que establecer una comparación de parámetros, contexto, rendimiento, licencia y disponibilidad.

## Limitaciones y advertencias

- No se declara licencia en la información disponible; el uso comercial queda sin autorización explícita y requiere consultar al autor.
- No se especifican los parámetros, la arquitectura de red ni el tamaño del modelo, lo que impide evaluar su complejidad computacional.
- El entrenamiento no es bit-reproducible: la misma semilla y el mismo comando producen pesos distintos en máquinas diferentes.
- La validación se limita a cinco pruebas del propio autor; no hay evidencia independiente de robustez, generalización ni seguridad.
- Es una política específica para la tarea de sprint en el robot microduck; no es transferible a otros robots ni a otras tareas sin reentrenamiento.
- Riesgo de fallo en condiciones no vistas en simulación (terrenos irregulares, perturbaciones externas), dado que no se documenta el dominio de aleatorización del entrenamiento.
- No aplica el riesgo de alucinación ni los sesgos lingüísticos propios de modelos de lenguaje, al no ser un modelo generativo.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validación por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/GinDuck/microduck-sprint-2m-sprint-2-k
- Repositorio del robot microduck: https://github.com/pollen-robotics/microduck
- Repositorio de retos y entrenamiento: https://github.com/pollen-robotics/microduck-challenges (rama `race-2`, commit `b44f7ffc9`)
