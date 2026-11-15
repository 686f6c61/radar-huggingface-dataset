# GinDuck/microduck-hill-climb-1m5-hill-2-g

## Resumen

`microduck-hill-climb-1m5-hill-2-g` es un checkpoint de política de control para el robot cuadrúpedo de bajo coste microduck, desarrollado por el usuario GinDuck y publicado en Hugging Face. No se trata de un modelo de lenguaje, sino de una política de aprendizaje por refuerzo entrenada para una tarea motora concreta: subir una rampa de 1,5 metros de desnivel. El modelo se distribuye en formato ONNX y se carga directamente en el daemon del robot mediante el comando `robotctl policy load`.

La política opera a 50 Hz, consume observaciones de 61 dimensiones y emite 14 acciones de control articular. Es una política de tipo perpetuo: una vez cargada, ejecuta la marcha de forma continua hasta que se le indique lo contrario. El normalizador de observaciones está embebido dentro del propio fichero `policy.onnx`, de modo que el robot puede alimentar observaciones en bruto sin preprocesado adicional.

El checkpoint corresponde a la iteración 500 de un entrenamiento realizado con el framework mjlab sobre la tarea `Mjlab-HillClimb1m5-MicroDuck`, en la rama `race-2` del repositorio `microduck-challenges` de Pollen Robotics, con semilla 1. Según el autor, la política completó la subida en las cinco pruebas realizadas. Su relevancia es acotada: es una pieza de robótica aplicada y reproducible, no un modelo generativo de propósito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Política de aprendizaje por refuerzo (red neuronal de control motor); arquitectura interna no detallada en la información disponible |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica; ventana de observación de 61 dimensiones por paso |
| Tipos de cuantizacion | no disponible; se distribuye como `policy.onnx` |
| Idiomas soportados | no aplica (modelo de robótica, sin capacidades lingüísticas) |
| Licencia | no disponible |
| Formato de pesos | ONNX (`policy.onnx`) más `manifest.json` con esquema 2 del manifiesto de políticas microduck |
| Frecuencia de control | 50 Hz |
| Dimension de observacion | 61 |
| Dimension de accion | 14 |
| Checkpoint | 500 |
| Semilla | 1 |

## Arquitectura y entrenamiento

La política se entrenó con mjlab (versión `mjlab-microduck 0.1.0`, commit `1efd853be`), un entorno de aprendizaje por refuerzo basado en física para el robot microduck. La tarea, `Mjlab-HillClimb1m5-MicroDuck`, consiste en ascender una rampa de 1,5 metros. El entrenamiento se ejecutó con 4096 entornos paralelos, un máximo de 3000 iteraciones, semilla 1 y registro en TensorBoard bajo el nombre de ejecución `hill-2`. El autor indica que la receta de entrenamiento es compartida con TheSauceman.

El checkpoint publicado corresponde a la iteración 500, es decir, una fase temprana del entrenamiento según el propio autor. La reproducibilidad no es bit a bit: repetir el mismo comando, código, `uv.lock` y semilla produce una política comparable pero no idéntica, porque el entrenamiento por refuerzo en GPU no es determinista entre máquinas. No se detalla en la información disponible la topología interna de la red (número de capas, anchura, tipo de activación) ni el algoritmo de RL empleado (PPO u otro), ni la composición del dataset de entrenamiento, que en este caso es generado por simulación.

## Capacidades

- Control motor de marcha para el robot cuadrúpedo microduck: genera 14 acciones articulares a partir de 61 observaciones a 50 Hz.
- Ejecución de una política perpetua: mantiene la marcha de forma continua hasta que se detiene explícitamente.
- Ascenso de rampa: la tarea entrenada es subir una pendiente de 1,5 metros de desnivel, completada en las cinco pruebas del autor.
- Normalización de observaciones embebida en el modelo ONNX: acepta observaciones en bruto sin preprocesado externo.
- Integración con el daemon del robot mediante `robotctl policy load`.
- No dispone de generación de texto, razonamiento, código, matemáticas, visión, tool calling, capacidades de agente ni multilingüismo.

## Casos de uso

- Demostración de locomoción en rampa con microduck: cargar la política en una ranura del daemon y ejecutar la subida de una pendiente de 1,5 metros como validación del comportamiento entrenado.
- Pruebas de reproducibilidad de entrenamiento: servir como referencia para comparar políticas obtenidas con la misma receta, semilla y commit, verificando que el resultado es cualitativamente equivalente.
- Benchmark interno de recetas de RL: usar este checkpoint (iteración 500) como línea base frente a checkpoints posteriores del mismo run (`hill-2`) para medir la mejora con más iteraciones.
- Integración en pipelines de simulación a realidad: validar en el robot físico una política entrenada en mjlab antes de desplegar versiones más avanzadas.
- Docencia y divulgación en robótica de bajo coste: ejemplo reproducible de extremo a extremo, desde el comando de entrenamiento hasta la ejecución en hardware, sobre una plataforma accesible.
- Evaluación de robustez de políticas perpetuas: someter la marcha continua a perturbaciones o cambios de superficie para estudiar la estabilidad del controlador entrenado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El único dato de rendimiento aportado por el autor es cualitativo: la política alcanzó la cima de la rampa en las cinco pruebas realizadas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el tamaño del fichero ONNX no se detalla (el repositorio figura con 0.0 GB), aunque por la naturaleza del modelo (política de control a 50 Hz) se espera que sea muy reducido.
- GPU recomendadas para inferencia: no disponible; es plausible ejecutar la política en CPU, pero no se confirma en la información proporcionada.
- GPU para entrenamiento: el comando de reproducción usa 4096 entornos paralelos, lo que requiere una GPU de gama alta; no se especifica el modelo concreto.
- Cabe en GPU de consumo: no disponible.
- Opciones de despliegue: daemon microduck con `robotctl` y runtime ONNX; no se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: frecuencia de control de 50 Hz; no se aportan medidas de latencia adicionales.

## Comparativa con modelos similares

| Modelo | Tipo | Tarea | Frecuencia | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| microduck-hill-climb-1m5-hill-2-g (este) | Política RL para microduck | Subida de rampa 1,5 m | 50 Hz | ONNX | no disponible | Hugging Face |
| Otros checkpoints del run `hill-2` de GinDuck | Política RL para microduck | Subida de rampa 1,5 m | 50 Hz | ONNX | no disponible | Hugging Face (mismo autor) |
| Políticas de la receta de TheSauceman | Política RL para microduck | Locomoción / escalada | 50 Hz | ONNX | no disponible | No confirmada en la información disponible |

No se dispone de datos de benchmarks ni de especificaciones detalladas de las alternativas que permitan una comparación cuantitativa.

## Limitaciones y advertencias

- Modelo específico de robótica: no es un modelo de lenguaje ni un modelo generativo; no puede usarse para tareas de texto, código o visión.
- Especialización estrecha: entrenado únicamente para la tarea de subida de rampa de 1,5 metros; no se garantiza su comportamiento en otras tareas o terrenos.
- Checkpoint temprano: corresponde a la iteración 500 de 3000 máximas, por lo que puede existir una versión posterior con mejor rendimiento.
- Validación limitada: el autor reporta cinco pruebas propias; no hay evaluación independiente ni métricas cuantitativas publicadas.
- Reproducibilidad no bit a bit: repetir el entrenamiento produce pesos distintos, lo que dificulta la auditoría exacta del modelo.
- Licencia no disponible: no se puede confirmar si el uso comercial está permitido; conviene contactar con el autor antes de cualquier despliegue productivo.
- Dependencia de hardware y software concretos: requiere el robot microduck, el daemon compatible con el manifiesto de esquema 2 y el runtime ONNX.
- Sesgos y alucinación: no aplican en el sentido habitual de los modelos de lenguaje, pero sí existe riesgo de fallo del controlador ante condiciones no vistas en simulación (superficies, cargas o perturbaciones distintas).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/GinDuck/microduck-hill-climb-1m5-hill-2-g
- Repositorio microduck (Pollen Robotics): https://github.com/pollen-robotics/microduck
- Repositorio de retos y entrenamiento: https://github.com/pollen-robotics/microduck-challenges
- Rama de entrenamiento: `race-2`, commit `b44f7ffc9`
- Documentación del manifiesto de políticas: `docs/policy-manifest.md` en el repositorio del daemon (no se proporciona URL directa)
