# GinDuck/microduck-hill-climb-1m5-hill-2-f

## Resumen

`hill-climb-1m5-hill-2-f` es un checkpoint de política de control para el robot cuadrúpedo de bajo coste microduck, desarrollado por el usuario GinDuck y publicado en Hugging Face. No se trata de un modelo de lenguaje, sino de una política de aprendizaje por refuerzo entrenada para que el robot suba una rampa de 1,5 metros a la máxima velocidad posible manteniendo la trayectoria. El modelo se distribuye como un fichero ONNX autocontenido que se carga directamente en un slot de política del daemon del robot mediante `robotctl`.

La política opera a 50 Hz con una observación de 61 dimensiones y 14 acciones de control, y está diseñada como una política perpetua: una vez cargada, el robot ejecuta la marcha de forma indefinida hasta que se le indique lo contrario. Según el autor, cada episodio de subida se completa en aproximadamente 1,4 segundos. Es relevante en el contexto de robótica de bajo coste y aprendizaje por refuerzo aplicado, ya que demuestra un flujo de entrenamiento reproducible (simulación con mjlab, 4096 entornos paralelos, 3000 iteraciones) y un formato de despliegue estandarizado para hardware real.

El checkpoint corresponde al commit `b44f7ffc9` de la rama `race-2` del repositorio `microduck-challenges` de Pollen Robotics, con semilla 1 y checkpoint 1500. El modelo es de tamaño mínimo (repo de 0,0 GB) y no dispone de información pública sobre licencia ni idiomas, dado que no es un modelo lingüístico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Política de aprendizaje por refuerzo (red neuronal de control, exportada a ONNX); no disponible el detalle de capas |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica; ventana de observación de 61 dimensiones a 50 Hz |
| Tipos de cuantizacion | no disponible (se distribuye como ONNX) |
| Idiomas soportados | no disponible (no es un modelo lingüístico) |
| Licencia | no disponible |
| Formato de pesos | ONNX (`policy.onnx`) + `manifest.json` (schema 2 del manifiesto de políticas microduck) |

## Arquitectura y entrenamiento

La política se entrena mediante aprendizaje por refuerzo en simulación con la tarea `Mjlab-HillClimb1m5-MicroDuck`, usando el framework mjlab (basado en MuJoCo) en su versión 0.1.0, commit `1efd853be`. El entrenamiento se ejecuta con 4096 entornos paralelos, un máximo de 3000 iteraciones, semilla 1 y registro en TensorBoard con el nombre de ejecución `hill-2`. El checkpoint publicado corresponde a la iteración 1500. La observación de 61 dimensiones y las 14 acciones a 50 Hz definen la interfaz de control del robot microduck; el normalizador de observaciones está embebido en el propio `policy.onnx`, por lo que se alimenta con observaciones en crudo.

El autor advierte que el entrenamiento no es bit-reproducible entre máquinas: repetir el mismo comando con el mismo `uv.lock` y la misma semilla produce una política comparable, pero no idéntica. No se dispone de información sobre la composición del dataset (al ser RL en simulación, los datos proceden del propio entorno simulado) ni sobre técnicas de ajuste fino posteriores.

## Capacidades

- Control locomotriz de un robot cuadrúpedo microduck: genera 14 acciones de control a 50 Hz a partir de 61 observaciones.
- Subida de rampa de 1,5 metros priorizando velocidad bruta y mantenimiento de la línea de trayectoria.
- Política perpetua: ejecuta la marcha de forma continua hasta que se detiene o se sustituye.
- Despliegue directo en hardware real mediante `robotctl policy load <slot> GinDuck/microduck-hill-climb-1m5-hill-2-f`.
- Normalización de observaciones integrada en el modelo ONNX, sin preprocesado externo.
- No dispone de capacidades de texto, razonamiento, código, visión, audio, tool calling ni agentes; es exclusivamente una política motriz.

## Casos de uso

- Investigación en aprendizaje por refuerzo aplicado a robótica: sirve como referencia reproducible de un pipeline completo de entrenamiento (mjlab + 4096 entornos + exportación ONNX) y despliegue en hardware real.
- Demostración de subida de rampa en robots de bajo coste: el modelo permite que un microduck suba una pendiente de 1,5 m a máxima velocidad en aproximadamente 1,4 segundos, útil para validar capacidades locomotoras del hardware.
- Benchmark de políticas de locomoción: al estar entrenado con semilla y commit documentados, permite comparar variantes de receta o hiperparámetros frente a este checkpoint base.
- Pruebas de integración del daemon microduck: el `manifest.json` conforme al schema 2 permite validar el sistema de slots de políticas y la carga remota desde Hugging Face.
- Educación y divulgación en robótica: un modelo pequeño y de despliegue sencillo que ilustra el ciclo simulación-a-realidad en un robot asequible.
- Base para ajuste fino o continuación de entrenamiento: el checkpoint 1500 puede servir como inicialización para variantes de la tarea (otras pendientes, terrenos o velocidades) dentro del repositorio `microduck-challenges`.
- Evaluación de robustez de controladores: útil para medir el comportamiento de la política ante cambios de terreno o condiciones de la rampa en pruebas controladas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El único dato de rendimiento declarado por el autor es que cada episodio de subida se completa en aproximadamente 1,4 segundos.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el tamaño del repositorio es de 0,0 GB y el modelo es un ONNX de política de control de dimensiones reducidas, por lo que la inferencia es viable en CPU.
- GPU recomendadas: no aplica para inferencia; para reentrenar, el autor usa entrenamiento con GPU (4096 entornos paralelos), pero no especifica el modelo de GPU empleado.
- Cabe en GPU de consumo: sí, con toda probabilidad, dado el tamaño mínimo del artefacto; no se dispone de cifras oficiales.
- Opciones de despliegue: ONNX Runtime en el daemon del robot microduck mediante `robotctl policy load`; el normalizador va embebido en el modelo.
- Latencia y throughput estimados: control a 50 Hz (20 ms por ciclo); no se publican cifras de latencia de inferencia.

## Comparativa con modelos similares

No disponible. No se han identificado en la información proporcionada otros checkpoints comparables de la misma tarea con datos públicos de rendimiento, parámetros o licencia.

## Limitaciones y advertencias

- Es una política específica para una tarea (subida de rampa de 1,5 m) y un robot concreto (microduck); no es generalizable a otros robots o tareas sin reentrenamiento.
- El entrenamiento no es bit-reproducible: la misma semilla y comando producen políticas comparables, no idénticas.
- No se especifica licencia, lo que impide confirmar si el uso comercial está permitido; conviene contactar con el autor antes de usarlo en producción.
- No hay información sobre sesgos, alucinación o comportamiento fuera de distribución; el riesgo principal es la degradación del control ante condiciones no vistas en simulación (sim-to-real gap).
- El autor describe la política como perpetua: una vez cargada, el robot sigue ejecutando la marcha hasta que se detenga o se sustituya, lo que exige supervisión y mecanismos de parada.
- El rendimiento de 1,4 segundos por episodio es una afirmación del autor sin validación externa publicada.
- No se dispone de datos sobre idiomas ni capacidades lingüísticas porque no es un modelo de lenguaje.

## Enlaces

- Hugging Face: https://huggingface.co/GinDuck/microduck-hill-climb-1m5-hill-2-f
- Repositorio microduck (Pollen Robotics): https://github.com/pollen-robotics/microduck
- Repositorio de retos y entrenamiento: https://github.com/pollen-robotics/microduck-challenges
- Rama de entrenamiento: `race-2`, commit `b44f7ffc9`
