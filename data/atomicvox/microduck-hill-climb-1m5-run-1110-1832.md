# atomicvox/microduck-hill-climb-1m5-run-1110-1832

## Resumen

`microduck-hill-climb-1m5-run-1110-1832` es una política de control entrenada por refuerzo para el robot cuadrúpedo de código abierto microduck, desarrollado por Pollen Robotics. No se trata de un modelo de lenguaje: es un controlador neuronal que recibe observaciones de 61 dimensiones y emite 14 acciones a 50 Hz, empaquetado en formato ONNX con el normalizador de observaciones integrado en el propio grafo. Lo publica el usuario atomicvox en Hugging Face bajo la librería `microduck` y el pipeline `robotics`.

El modelo resuelve una tarea concreta de locomoción: subir una pendiente ("hill climb") de 1,5 metros de longitud, manteniendo una marcha perpetua hasta que se le indique lo contrario. Se ha entrenado con el framework mjlab (basado en MuJoCo) sobre el entorno `Mjlab-HillClimb1m5-MicroDuck`, con 2048 entornos paralelos, 2000 iteraciones máximas y semilla 1, alcanzando el checkpoint 1000.

Su relevancia es la de un artefacto reproducible de investigación en RL para robótica: el autor documenta el commit exacto, el `uv.lock`, el comando de entrenamiento y la semilla, de modo que cualquiera puede regenerar una política comparable. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y su tamaño es de 0,0 GB (probablemente por debajo del umbral de redondeo de la interfaz).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal de política para control robótico (detalles de capas no disponibles); empaquetada como grafo ONNX |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica; ventana de observación de 61 dimensiones por paso |
| Tipos de cuantizacion | no disponible (se distribuye en ONNX, presumiblemente FP32) |
| Idiomas soportados | no aplica (no es un modelo de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | ONNX (`policy.onnx`) + `manifest.json` (esquema 2 del manifiesto de políticas microduck) |
| Frecuencia de control | 50 Hz |
| Dimension de observacion | 61 |
| Dimension de accion | 14 |
| Tarea | `Mjlab-HillClimb1m5-MicroDuck` (ascenso de pendiente de 1,5 m) |
| Framework de entrenamiento | mjlab 0.1.0 (base `1efd853be`), MuJoCo |
| Checkpoint | 1000 |
| Semilla | 1 |
| Commit de entrenamiento | `485629a55` (rama `main`, repo `atomicvox/microduck-challenges`) |

## Arquitectura y entrenamiento

La política se entrena con aprendizaje por refuerzo en simulación mediante mjlab, un stack construido sobre MuJoCo para entornos de robots articulados. El entrenamiento usa 2048 entornos paralelos, hasta 2000 iteraciones y logging en TensorBoard, con el run `run-1110-1832`. El resultado es una política perpetua: una vez cargada en una ranura del daemon `robotctl`, ejecuta la marcha de ascenso de forma continua hasta que se le ordene lo contrario.

El artefacto distribuido incluye el normalizador de observaciones embebido directamente en `policy.onnx`, de modo que el consumidor debe alimentar observaciones en bruto (sin normalizar) y el grafo se encarga del preprocesado. El `manifest.json` sigue el esquema 2 documentado en `docs/policy-manifest.md` del repositorio del daemon. El autor advierte explícitamente de que el entrenamiento no es bit-reproducible entre máquinas: repetir el comando con la misma semilla produce una política comparable, no idéntica.

## Capacidades

- Locomoción cuadrúpeda: ejecuta una marcha de ascenso de pendiente de 1,5 m sobre el robot microduck.
- Control reactivo a 50 Hz a partir de observaciones proprioceptivas de 61 dimensiones.
- Política perpetua: mantiene la marcha indefinidamente hasta recibir una orden de parada o cambio de política.
- Integración con el daemon `robotctl` mediante carga en una ranura de política (`policy load <slot> <repo>`).
- Autocontenida en inferencia: el normalizador va dentro del ONNX, lo que simplifica el despliegue en el robot.
- No soporta tool calling, agentes, razonamiento multi-paso, visión, audio ni capacidades multilingües; su ámbito es exclusivamente el control motor del robot.

## Casos de uso

- Demostración de ascenso de pendiente en microduck: cargar la política en una ranura con `robotctl policy load` y dejar que el robot suba una rampa de 1,5 m en un entorno controlado, útil para validar la mecánica y los servos del robot.
- Benchmark de referencia para RL en robótica: sirve como línea base reproducible (commit, semilla, `uv.lock` y comando documentados) contra la que comparar nuevas políticas entrenadas en el mismo entorno `Mjlab-HillClimb1m5-MicroDuck`.
- Docencia y talleres de reinforcement learning: el flujo completo (clonar repo, `uv sync`, entrenar, cargar en robot) es un ejemplo cerrado y ejecutable de un pipeline de RL sim-a-real para cuadrúpedos de bajo coste.
- Investigación en robustez de marchas: al ser una política perpetua, permite estudiar deriva, estabilidad y recuperación ante perturbaciones durante ascensos prolongados.
- Pruebas de integración del daemon `robotctl`: valida el esquema 2 del manifiesto de políticas y el mecanismo de carga de políticas desde Hugging Face en el robot.
- Generación de datos de locomoción en simulación: la política puede ejecutarse en mjlab/MuJoCo para producir trayectorias de ascenso que alimenten análisis cinemático o entrenamiento de modelos auxiliares.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de recompensa, tasa de éxito en el ascenso, ni comparaciones cuantitativas con otras políticas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el tamaño del repositorio es de 0,0 GB, lo que sugiere una política muy pequeña que probablemente quepa en cualquier GPU e incluso en CPU.
- GPU recomendadas para entrenamiento: no especificadas por el autor; el entrenamiento usa 2048 entornos paralelos en mjlab, lo que en la práctica requiere una GPU de datacenter (A100, H100 o similar) para completar 2000 iteraciones en un tiempo razonable.
- GPU de consumo: la inferencia en el robot no requiere GPU; el despliegue se hace vía ONNX en el propio microduck. El entrenamiento en una RTX 4090 es plausible pero no está confirmado por el autor.
- Opciones de despliegue: ONNX Runtime (formato `policy.onnx`) y el daemon `robotctl` del ecosistema microduck; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles; el control opera a 50 Hz (periodo de 20 ms por paso), pero no se publican tiempos de inferencia medidos.

## Comparativa con modelos similares

| Modelo | Tipo | Tarea | Entorno | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `atomicvox/microduck-hill-climb-1m5-run-1110-1832` | Política RL (ONNX) | Ascenso de pendiente 1,5 m en microduck | mjlab / MuJoCo | no disponible | Hugging Face, 0 descargas |
| Otras políticas microduck de atomicvox | Política RL (ONNX) | Distintas tareas de locomoción | mjlab / MuJoCo | no disponible | no verificado en la información disponible |
| Políticas de referencia de Pollen Robotics para microduck | Política RL | Locomoción base del robot | no disponible | no disponible | Repositorio `pollen-robotics/microduck` |

No se dispone de datos de rendimiento de las alternativas en la información proporcionada, por lo que la comparación se limita a tipo de artefacto, tarea y disponibilidad.

## Limitaciones y advertencias

- Ámbito muy restringido: es una política de control motor para una tarea y un robot concretos; no es reutilizable como modelo de propósito general.
- Licencia no disponible: no se puede confirmar el uso comercial ni la redistribución; conviene contactar con el autor antes de cualquier despliegue productivo.
- Reproducibilidad limitada: el propio autor advierte de que el entrenamiento con RL en GPU no es bit-reproducible; la misma semilla produce políticas comparables, no idénticas.
- Sin métricas publicadas: no hay datos de tasa de éxito, recompensa media ni robustez ante perturbaciones, lo que impide evaluar su fiabilidad antes de probarla en hardware.
- Riesgo de sim-a-real gap: al entrenarse en mjlab/MuJoCo, el comportamiento en el robot físico puede degradarse por discrepancias de dinámica, fricción o calibración de servos.
- Cero tracción comunitaria: 0 descargas y 0 likes en el momento de la consulta, sin issues ni validación externa documentada.
- Sin información sobre sesgos, alucinación o idiomas: no aplica al no ser un modelo de lenguaje, pero tampoco se documentan limitaciones de seguridad física (caídas, sobreesfuerzo de articulaciones) que deberían considerarse en pruebas con hardware real.

## Enlaces

- Hugging Face: https://huggingface.co/atomicvox/microduck-hill-climb-1m5-run-1110-1832
- Repositorio del robot microduck (Pollen Robotics): https://github.com/pollen-robotics/microduck
- Repositorio de retos y entrenamiento del autor: `git@github.com:atomicvox/microduck-challenges.git` (commit `485629a55`, rama `main`)
- Documentación del manifiesto de políticas: `docs/policy-manifest.md` en el repositorio del daemon (no se proporciona URL directa)
- Base de entrenamiento mjlab 0.1.0: commit `1efd853be` (no se proporciona URL directa)
