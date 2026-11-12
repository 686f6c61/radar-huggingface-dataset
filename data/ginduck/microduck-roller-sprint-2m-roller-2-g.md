# GinDuck/microduck-roller-sprint-2m-roller-2-g

## Resumen

`microduck-roller-sprint-2m-roller-2-g` es una política de control motriz entrenada por refuerzo (reinforcement learning) para el robot cuadrúpedo de bajo coste microduck de Pollen Robotics. No es un modelo de lenguaje ni un transformer generativo: es un checkpoint de política neuronal que produce directamente las 14 acciones de control del robot a partir de una observación de 61 dimensiones, a 50 Hz, sobre ruedas (rollers).

El modelo forma parte de la segunda tanda de experimentos del autor (GinDuck) sobre el entorno `Mjlab-RollerSprint2m-MicroDuck`, entrenado con la librería mjlab en 2048 entornos paralelos durante 6000 iteraciones. La política es perpetua: una vez cargada en una ranura de política del daemon del robot, se ejecuta indefinidamente, completando cada recorrido en aproximadamente 1,5 segundos.

Su relevancia es acotada pero concreta: demuestra el flujo completo de entrenamiento, exportación a ONNX y despliegue en hardware real mediante `robotctl`, con normalización de observaciones embebida en el propio fichero `policy.onnx`. Es material de referencia para quien trabaje en locomoción con RL sobre microduck, no un modelo de propósito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal de política entrenada por refuerzo (detalles de capas no disponibles) |
| Parametros totales | no disponible (repo de 0.0 GB) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica; ventana de observación de 61 dimensiones |
| Tipos de cuantizacion | no disponible; exportación en ONNX |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | ONNX (`policy.onnx`) + `manifest.json` (schema 2 del manifiesto de políticas microduck) |

## Arquitectura y entrenamiento

La política se entrena con mjlab (entorno de RL para robots) sobre la tarea `Mjlab-RollerSprint2m-MicroDuck`, en la rama `race-2` del repositorio `pollen-robotics/microduck-challenges`, commit `b44f7ffc9`, con base `mjlab-microduck 0.1.0 @ 1efd853be`. El entrenamiento usa 2048 entornos paralelos, 6000 iteraciones máximas, semilla 1 y logging a TensorBoard; el checkpoint publicado corresponde a la iteración 5750.

La observación de entrada es de 61 dimensiones y la salida de 14 acciones, ejecutadas a 50 Hz sobre ruedas. La normalización de observaciones está integrada en el propio `policy.onnx`, de modo que el consumidor alimenta observaciones en crudo. El autor advierte que el entrenamiento con RL en GPU no es bit-reproducible entre máquinas: repetir el comando con el mismo código, `uv.lock` y semilla produce una política comparable, no idénticos pesos.

## Capacidades

- Control locomotor de tipo sprint sobre ruedas para el robot microduck, con recorridos de aproximadamente 1,5 segundos.
- Política perpetua: se ejecuta de forma continua hasta que se le indique lo contrario.
- Inferencia en tiempo real a 50 Hz con observaciones crudas (normalizador embebido en el ONNX).
- Despliegue directo en hardware mediante `robotctl policy load <slot> <repo>`.
- Sin capacidades de lenguaje, visión, tool calling, agentes ni multilingüismo.

## Casos de uso

- Despliegue en robot físico: cargar la política en una ranura del daemon con `robotctl policy load` para que el microduck ejecute el sprint sobre ruedas de forma continua.
- Referencia de entrenamiento: reproducir el pipeline completo (clonar `microduck-challenges`, checkout del commit, `uv sync`, `uv run train`) para generar políticas comparables con la misma receta.
- Base para fine-tuning o continuación de entrenamiento: partir del checkpoint 5750 y la semilla 1 para explorar variantes de la tarea de sprint.
- Evaluación comparativa de políticas: contrastar esta política con otros checkpoints de la misma tanda (por ejemplo, variantes de skating) en condiciones idénticas de simulación.
- Validación de la cadena de exportación ONNX: usar el `policy.onnx` con normalizador embebido como ejemplo de integración en pipelines de inferencia en robot.
- Docencia y experimentación en RL aplicado a robótica: el repositorio de challenges y el manifiesto schema 2 sirven como caso de estudio reproducible de entrenamiento a despliegue.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El único dato de rendimiento reportado por el autor es que la política completa cada recorrido en aproximadamente 1,5 segundos.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el tamaño del repositorio es de 0.0 GB, lo que sugiere un modelo muy pequeño apto para ejecución en el propio robot.
- GPU recomendadas: no disponible para inferencia. Para reentrenamiento, el autor indica 2048 entornos paralelos y hasta 6000 iteraciones, lo que requiere una GPU de entrenamiento (modelo concreto no especificado).
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: ONNX Runtime a través del daemon microduck (`robotctl`); no se documentan vLLM, llama.cpp, Ollama ni TGI (no aplican a este tipo de modelo).
- Latencia y throughput: frecuencia de control de 50 Hz; latencia por inferencia no disponible.

## Comparativa con modelos similares

| Modelo | Tipo | Observación / acciones | Frecuencia | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| microduck-roller-sprint-2m-roller-2-g | Política RL para microduck | 61 / 14 | 50 Hz | no disponible | Hugging Face |
| Otros checkpoints de la tanda "roller-2" del mismo autor | Política RL para microduck | no disponible | no disponible | no disponible | Hugging Face (mismo autor) |
| Políticas de la rama `race-2` de microduck-challenges | Política RL para microduck | no disponible | no disponible | según repositorio | GitHub |

No se dispone de datos de benchmarks ni de especificaciones detalladas de las alternativas para una comparación cuantitativa.

## Limitaciones y advertencias

- Modelo altamente específico: solo válido para el robot microduck sobre ruedas; no es reutilizable en otras plataformas ni tareas.
- Licencia no disponible: no se puede confirmar el uso comercial; conviene contactar con el autor antes de cualquier despliegue productivo.
- Reproducibilidad limitada: el propio autor advierte que el RL en GPU no es bit-reproducible; los pesos no se pueden regenerar de forma idéntica.
- Sin información sobre sesgos, robustez ante perturbaciones ni comportamiento fuera de la distribución de entrenamiento.
- Sin datos de benchmarks, curvas de aprendizaje ni métricas de éxito publicadas.
- Dependencia del ecosistema microduck (daemon, manifiesto schema 2, `robotctl`); requiere hardware y software concretos.
- Fecha de creación del repositorio (2026-11-12) y ausencia de descargas o likes: no hay validación comunitaria ni evidencia de uso externo.

## Enlaces

- Hugging Face: https://huggingface.co/GinDuck/microduck-roller-sprint-2m-roller-2-g
- Repositorio microduck: https://github.com/pollen-robotics/microduck
- Repositorio de challenges de entrenamiento: https://github.com/pollen-robotics/microduck-challenges (rama `race-2`, commit `b44f7ffc9`)
