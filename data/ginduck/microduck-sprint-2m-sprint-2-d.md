# GinDuck/microduck-sprint-2m-sprint-2-d

## Resumen

microduck-sprint-2m-sprint-2-d es una política de control entrenada por refuerzo (reinforcement learning) para el robot bípedo microduck de Pollen Robotics. No es un modelo de lenguaje: es un checkpoint de una política perpetua que genera comandos de locomoción a 50 Hz a partir de observaciones de 61 dimensiones y produce 14 acciones. El modelo se distribuye en formato ONNX con un manifiesto asociado que sigue el esquema 2 del manifiesto de políticas de microduck.

La política pertenece a la segunda tanda de entrenamientos del autor (GinDuck) bajo la tarea `Mjlab-Sprint2m-MicroDuck`, en la rama `race-2` del repositorio microduck-challenges. Según la model card, el objetivo es la velocidad bruta: completa cada carrera en aproximadamente 1,2 segundos. El checkpoint corresponde a la iteración 2250 de un entrenamiento con semilla 1 y 4096 entornos paralelos.

El modelo es relevante para quienes trabajan en robótica de locomoción con simulación física (mjlab, basado en MuJoCo) y despliegue en hardware real mediante el daemon `robotctl`. Su utilidad es acotada: es un artefacto de investigación y experimentación, no un componente de propósito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Política de control entrenada por refuerzo (no se especifica la topología de red en la información disponible) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje; observación de 61 dimensiones por paso) |
| Tipos de cuantizacion | no disponible (distribución en ONNX) |
| Idiomas soportados | no aplica (modelo de robótica) |
| Licencia | no disponible |
| Formato de pesos | ONNX (`policy.onnx`) más `manifest.json` (esquema 2) |

## Arquitectura y entrenamiento

La política opera como un controlador reactivo: recibe un vector de observación de 61 dimensiones y emite 14 acciones a una frecuencia de 50 Hz. La normalización de observaciones está integrada dentro de `policy.onnx`, de modo que el consumidor debe alimentar observaciones crudas. El entrenamiento se realizó con mjlab (versión 0.1.0, commit `1efd853be`), un entorno de aprendizaje por refuerzo construido sobre simulación física, con 4096 entornos paralelos, 3000 iteraciones máximas y semilla 1. La tarea es `Mjlab-Sprint2m-MicroDuck`, dentro de la rama `race-2` del repositorio `pollen-robotics/microduck-challenges`, en el commit `b44f7ffc9`.

El autor advierte explícitamente que el entrenamiento no es reproducible bit a bit entre máquinas: repetir la receta con el mismo código, `uv.lock`, comando y semilla produce una política comparable, pero no idéntica. La receta de entrenamiento es compartida por TheSauceman según la model card. No se detalla en la información disponible el algoritmo concreto de RL (PPO u otro), la composición de recompensas ni la arquitectura interna de la red.

## Capacidades

- Locomoción bípeda perpetua: la política corre de forma continua hasta que se le indica lo contrario, sin episodios de terminación propios.
- Marcha orientada a velocidad: diseñada para maximizar la rapidez, con carreras completadas en aproximadamente 1,2 segundos según el autor.
- Control a 50 Hz con observaciones de 61 dimensiones y 14 acciones, compatible con el daemon `robotctl` del microduck.
- Carga en una ranura de política del robot mediante `robotctl policy load <slot>`.
- Normalización de observaciones integrada en el modelo ONNX, lo que simplifica la integración en el robot.
- No soporta tool calling, agentes, multilingüismo, visión, audio ni modo de razonamiento: es exclusivamente una política motora.

## Casos de uso

- Investigación en locomoción bípeda: servir como punto de partida o referencia para comparar políticas de sprint en el entorno mjlab, dado que la receta y el commit de entrenamiento están documentados.
- Despliegue en el robot microduck real: cargar la política en una ranura mediante `robotctl policy load` para que el robot ejecute una marcha continua de alta velocidad en demostraciones o pruebas de hardware.
- Benchmarking de controladores: usar el tiempo de carrera (~1,2 s) como métrica de referencia frente a otros checkpoints de la misma tanda (por ejemplo, la variante `sprint-2-c`).
- Reproducción de experimentos de RL: reentrenar con la receta publicada (4096 entornos, 3000 iteraciones, semilla 1) para estudiar la variabilidad entre ejecuciones y la sensibilidad a la semilla.
- Educación y divulgación en robótica: ilustrar el ciclo completo simulación-a-realidad (sim-to-real) con un robot de bajo coste y una política abierta en ONNX.
- Integración en pipelines de evaluación automatizada: ejecutar la política en simulación para medir estabilidad y velocidad antes de transferirla al hardware.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El único dato de rendimiento aportado por el autor es que la política completa cada carrera en aproximadamente 1,2 segundos, sin especificar la métrica exacta, la pista ni las condiciones de medida.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el repositorio ocupa 0,0 GB y el modelo es un ONNX de política de control, por lo que la huella esperada es mínima, pero no se confirma en la información disponible.
- GPU recomendadas: no disponible. Para el entrenamiento, el autor usa 4096 entornos paralelos, lo que implica una GPU de datacenter, pero no se especifica el modelo.
- Compatibilidad con GPU de consumo: no confirmada en la información disponible.
- Opciones de despliegue: el daemon `robotctl` del microduck (carga en ranura de política) y ejecución del ONNX mediante un runtime compatible con ONNX; no se documentan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: la política está diseñada para operar a 50 Hz (20 ms por paso); no se publican medidas de latencia reales.

## Comparativa con modelos similares

| Modelo | Tipo | Observación / acciones | Frecuencia | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| GinDuck/microduck-sprint-2m-sprint-2-d | Política RL para microduck | 61 / 14 | 50 Hz | no disponible | Hugging Face |
| GinDuck/microduck-sprint-2m-sprint-2-c | Política RL para microduck (misma tanda) | 61 / 14 | 50 Hz | no disponible | Hugging Face |
| Otras políticas de microduck-challenges | Políticas RL para microduck | no disponible | no disponible | no disponible | Repositorio del proyecto |

No se dispone de datos de rendimiento comparables entre estas variantes más allá del tiempo de carrera indicado por el autor para la variante `-d`.

## Limitaciones y advertencias

- Modelo de nicho: solo es válido para el robot microduck y su stack (`robotctl`, manifiesto de políticas); no es reutilizable en otras plataformas sin reentrenamiento.
- Licencia no especificada: no hay información sobre permisos de uso comercial, modificación o redistribución; conviene contactar con el autor antes de cualquier uso en producción.
- Sin datos de benchmarks ni de robustez: no se documentan métricas de estabilidad, consumo energético, tolerancia a perturbaciones ni comportamiento ante fallos.
- Reproducibilidad limitada: el propio autor indica que el entrenamiento no es bit-reproducible entre máquinas; los pesos no pueden regenerarse de forma idéntica.
- Especialización extrema en velocidad: una política orientada al sprint puede sacrificar estabilidad o suavidad de movimiento; no se documentan evaluaciones en terrenos variados.
- Sin información sobre sesgos, alucinación o idiomas: no aplica en el sentido habitual, pero tampoco se documentan limitaciones de dominio.
- Fecha de creación futura en los metadatos (2026-11-08): conviene verificar la vigencia y el estado del repositorio antes de depender de él.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/GinDuck/microduck-sprint-2m-sprint-2-d
- Variante relacionada: https://huggingface.co/GinDuck/microduck-sprint-2m-sprint-2-c
- Repositorio microduck (Pollen Robotics): https://github.com/pollen-robotics/microduck
- Repositorio de retos y entrenamiento: https://github.com/pollen-robotics/microduck-challenges
- Documentación del manifiesto de políticas: `docs/policy-manifest.md` en el repositorio del daemon (referenciado en la model card)
- Sitio del robot microduck: https://microducks.org/
