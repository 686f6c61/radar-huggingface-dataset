# GinDuck/microduck-hill-climb-1m5-hill-1-e

## Resumen

`microduck-hill-climb-1m5-hill-1-e` es una política de control entrenada por el usuario GinDuck para el robot cuadrúpedo microduck de Pollen Robotics. No es un modelo de lenguaje ni un modelo fundacional generativo: es un checkpoint de aprendizaje por refuerzo (RL) que produce una marcha (gait) para que el robot suba una rampa de 1,5 metros de altura. Se publica como un artefacto ONNX autocontenido, con el normalizador de observaciones embebido, listo para cargarse en una ranura de política del daemon `robotctl`.

El interés del modelo es acotado pero concreto: sirve como referencia reproducible de un entrenamiento RL completo sobre el simulador mjlab aplicado al microduck, con semilla, commit y comando de entrenamiento documentados. Es el primer intento de escalada del autor, entrenado con la receta "plain" de Pollen sin ajustes posteriores, y según su model card completó la subida en las cinco pruebas realizadas, aunque con una marcha lenta en la rampa.

Por su naturaleza (política perpetual de 50 Hz con 61 dimensiones de observación y 14 acciones), su relevancia no está en capacidades cognitivas sino en ser un ejemplo operativo de despliegue de políticas RL en robótica de bajo coste, con formato ONNX y manifiesto de política versionado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Política de aprendizaje por refuerzo (red neuronal) exportada a ONNX; no se detalla la topología interna |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica; observación de 61 dimensiones por paso |
| Tipos de cuantizacion | no disponible (se distribuye ONNX, presumiblemente FP32) |
| Idiomas soportados | no aplica (control robótico, sin interfaz de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | ONNX (`policy.onnx`) + `manifest.json` (esquema 2 del manifiesto de políticas microduck) |
| Frecuencia de control | 50 Hz |
| Dimension de observacion | 61 |
| Dimension de accion | 14 |
| Tamano del repositorio | 0,0 GB (artefacto muy ligero) |

## Arquitectura y entrenamiento

El modelo es una política de RL entrenada en el simulador mjlab (base `mjlab-microduck 0.1.0 @ 1efd853be`) sobre la tarea `Mjlab-HillClimb1m5-MicroDuck`, definida en el repositorio `pollen-robotics/microduck-challenges` (rama `main`, commit `dc73b9237`). El entrenamiento se lanzó el 2026-11-01 con 4096 entornos paralelos, un máximo de 3000 iteraciones, semilla 1 y registro en TensorBoard; el checkpoint publicado corresponde a la iteración 2250 y a la ejecución `hill-1`. No se especifican en la información disponible la topología de la red (número de capas, unidades ocultas), el algoritmo RL concreto (PPO u otro) ni la composición del dataset, ya que en RL el "dataset" es la distribución de estados generada por el simulador y la función de recompensa de la tarea.

La innovación práctica del artefacto es de empaquetado: el normalizador de observaciones está embebido dentro de `policy.onnx`, de modo que el consumidor alimenta observaciones crudas sin preprocesar. Además, la política se declara "perpetual": se ejecuta de forma continua hasta que se le indique lo contrario, comportándose como una marcha cargada en una ranura de política. El autor advierte explícitamente que el entrenamiento no es bit-reproducible entre máquinas, por lo que repetir el comando con la misma semilla produce una política comparable, no idéntica.

## Capacidades

- Control locomotor de un robot cuadrúpedo microduck mediante política RL a 50 Hz.
- Escalada de una rampa de 1,5 metros de altura (tarea `HillClimb1m5`), completada según el autor en las cinco pruebas realizadas.
- Ejecución perpetual: la política corre de forma continua como gait hasta que se detiene externamente.
- Consumo de observaciones crudas de 61 dimensiones y emisión de 14 acciones, sin necesidad de normalización externa.
- Carga directa en el daemon del robot mediante `robotctl policy load <slot>`.
- No dispone de generación de texto, razonamiento, código, matemáticas, visión, audio, tool calling ni capacidades multilingües.
- No es un agente de razonamiento multi-paso; su "razonamiento" es la inferencia reactiva de la política en cada paso de control.

## Casos de uso

- Escalada de rampas en entornos de laboratorio: cargar la política en una ranura del microduck y ejecutarla sobre la rampa de 1,5 m para validar la cadena completa simulación-a-realidad del pipeline mjlab.
- Reproducción de experimentos RL: usar el manifiesto (commit, semilla, checkpoint, comando) para reentrenar y comparar políticas con variaciones de hiperparámetros, sirviendo como línea base "plain recipe" de Pollen.
- Benchmark interno de políticas de locomoción: comparar esta marcha lenta pero fiable contra políticas posteriores del mismo autor para medir mejoras en velocidad y estabilidad sobre la rampa.
- Docencia y formación en robótica con RL: ejemplo mínimo y ligero (repositorio de 0,0 GB) para ilustrar el ciclo entrenamiento en mjlab, exportación a ONNX y despliegue en hardware real.
- Integración en competiciones y demos: el autor la vincula a las carreras y copas Arena seguidas con la aplicación QuackPack, por lo que puede emplearse como política de referencia en demostraciones de escalada.
- Validación de infraestructura de despliegue: probar el daemon `robotctl`, el esquema 2 del manifiesto de políticas y la carga de ONNX con normalizador embebido antes de desplegar políticas más complejas.
- Pruebas de robustez sim-to-real: evaluar cómo se comporta una política entrenada solo en simulación con 4096 entornos al transferirse al robot físico en una tarea de escalada concreta.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El único dato de rendimiento aportado por el autor es cualitativo: la política alcanzó la cima en las cinco pruebas realizadas, con una marcha lenta en la rampa. No se proporcionan métricas de recompensa, velocidad, tasa de éxito agregada ni comparaciones numéricas con otras políticas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el repositorio ocupa 0,0 GB y la política es una red pequeña para 61 entradas y 14 salidas, por lo que la huella de memoria es mínima.
- GPU recomendadas: no se especifican; para inferencia a 50 Hz de una política de este tamaño no se requiere GPU dedicada en el robot.
- Compatibilidad con GPU de consumo: previsiblemente sí, dado el tamaño del artefacto, aunque no se documenta ningún requisito concreto.
- Opciones de despliegue: el daemon `robotctl` del microduck cargando `policy.onnx` en una ranura de política; el runtime ONNX subyacente no se detalla.
- Latencia y throughput: no disponibles; únicamente se conoce la frecuencia de control de 50 Hz.
- Hardware de entrenamiento: no disponible; el comando usa 4096 entornos paralelos, lo que implica una GPU de gama alta, pero no se especifica el modelo.

## Comparativa con modelos similares

No se dispone de información sobre políticas comparables del mismo autor o de terceros para la tarea `HillClimb1m5` del microduck. La model card menciona políticas posteriores del mismo autor ("before I tuned anything"), pero no aporta nombres, métricas ni enlaces que permitan una comparación rigurosa.

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| microduck-hill-climb-1m5-hill-1-e | no disponible | no aplica (obs. 61-D) | 5/5 subidas según el autor, marcha lenta | no disponible | Hugging Face |
| Políticas posteriores del mismo autor | no disponible | no disponible | no disponible | no disponible | no disponible |
| Otras políticas microduck de la comunidad | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Licencia no disponible: no se puede confirmar si el uso comercial está permitido; conviene contactar con el autor antes de cualquier despliegue productivo.
- Entrenada únicamente para la tarea `HillClimb1m5`; no se garantiza su comportamiento en otras superficies, pendientes o tareas.
- Marcha lenta en la rampa según el propio autor; no es adecuada si se requiere velocidad de ascenso.
- Éxito verificado solo en cinco pruebas del autor; no hay evidencia estadística de robustez ni tasa de fallo a largo plazo.
- No reproducible bit a bit: reentrenar con la misma semilla produce pesos distintos, lo que complica la auditoría exacta del artefacto.
- Riesgo de brecha sim-to-real: no se documentan pruebas en condiciones variables (iluminación, fricción, desgaste de actuadores) más allá de las cinco ejecuciones mencionadas.
- Sin información sobre sesgos: al ser una política de control no aplican sesgos lingüísticos, pero sí pueden existir sesgos de simulación derivados de la distribución de entrenamiento.
- No apta para tareas generativas, conversacionales ni de razonamiento simbólico.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validación independiente por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/GinDuck/microduck-hill-climb-1m5-hill-1-e
- Repositorio microduck (Pollen Robotics): https://github.com/pollen-robotics/microduck
- Repositorio de retos y entrenamiento: https://github.com/pollen-robotics/microduck-challenges
- Documentación del manifiesto de políticas (`docs/policy-manifest.md` en el repositorio del daemon): no disponible como URL directa en la información proporcionada
- Aplicación QuackPack (carreras y copas Arena): https://www.imundo.ch/quackpack/
