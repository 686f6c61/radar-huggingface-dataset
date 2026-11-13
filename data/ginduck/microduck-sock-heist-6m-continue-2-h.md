# GinDuck/microduck-sock-heist-6m-continue-2-h

## Resumen

`microduck-sock-heist-6m-continue-2-h` es un checkpoint de política de aprendizaje por refuerzo entrenada para el robot cuadrúpedo de bajo coste microduck, desarrollado por el ecosistema de Pollen Robotics. El modelo resuelve una tarea concreta de manipulación y locomoción: acercarse a un calcetín, esquivar a los guardias y cogerlo sin ser detectado, completando cada episodio en menos de 10 segundos. No es un modelo de lenguaje ni un modelo generativo de propósito general, sino una política de control continuo empaquetada en formato ONNX y publicada por el usuario GinDuck.

La arquitectura subyacente es una red neuronal de política entrenada con RL (probablemente PPO, dado el flujo de entrenamiento con `mjlab` y `num-envs 4096`), que consume observaciones de 61 dimensiones a 50 Hz y emite 14 acciones de control articular. El entrenamiento se realizó sobre el entorno `Mjlab-SockHeist6m-MicroDuck` del repositorio `microduck-challenges`, con 4096 entornos paralelos, 1000 iteraciones máximas, semilla 1 y checkpoint 300.

Su relevancia es acotada pero clara: sirve como ejemplo reproducible de un pipeline completo de RL para robótica de bajo coste, con normalizador de observaciones embebido en el propio ONNX, manifiesto de política conforme al esquema 2 del daemon y un comando de despliegue directo (`robotctl policy load`). El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y no se declara licencia ni idiomas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal de política para RL (detalles de capas no disponibles); política perpetua de control a 50 Hz |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo de contexto; observación de 61 dimensiones por paso) |
| Tipos de cuantizacion | no disponible (pesos exportados a ONNX; no se documentan cuantizaciones) |
| Idiomas soportados | no disponible (no procesa lenguaje) |
| Licencia | no disponible |
| Formato de pesos | ONNX (`policy.onnx`) + `manifest.json` (esquema 2 del manifiesto de políticas microduck) |

## Arquitectura y entrenamiento

El modelo es una política de control continuo entrenada mediante aprendizaje por refuerzo en el entorno `Mjlab-SockHeist6m-MicroDuck`, perteneciente al repositorio `microduck-challenges` (rama `sock-continue-2`, commit `10ba3a426`). La observación tiene 61 dimensiones y la acción 14 dimensiones, ejecutadas a 50 Hz. El entrenamiento se lanzó con 4096 entornos paralelos, un máximo de 1000 iteraciones, semilla 1, logger TensorBoard y nombre de ejecución `continue-2`, partiendo de la base `mjlab-microduck 0.1.0 @ 1efd853be` y del checkpoint 300. El identificador de tarea es `Mjlab-SockHeist6m-MicroDuck` y el inicio del entrenamiento se registra el 2026-11-01T07:12:53Z.

El autor indica explícitamente que el entrenamiento no es bit-reproducible entre máquinas: repetir el mismo comando con el mismo `uv.lock` y la misma semilla produce una política comparable, no los mismos pesos. El normalizador de observaciones está embebido dentro de `policy.onnx`, de modo que el robot debe alimentar observaciones en crudo. La política es de tipo perpetuo: se ejecuta de forma continua hasta que se le indique lo contrario, funcionando como una marcha o gait cargada en una ranura de política del daemon.

## Capacidades

- Control locomotor y de manipulación del robot microduck: ejecuta una política perpetua a 50 Hz con 14 acciones.
- Resolución de la tarea `sock-heist`: acercarse al calcetín, esquivar guardias y cogerlo sin ser detectado, en menos de 10 segundos por episodio.
- Integración con el daemon mediante `robotctl policy load <slot> GinDuck/microduck-sock-heist-6m-continue-2-h`.
- Normalización de observaciones integrada en el ONNX: acepta observaciones en crudo de 61 dimensiones.
- Compatibilidad con el manifiesto de políticas microduck, esquema 2.
- No soporta tool calling, function calling, agentes multi-paso, capacidades multilingües, visión, audio ni modos de razonamiento: no es un modelo de lenguaje.

## Casos de uso

- Despliegue en el robot microduck físico: cargar la política en una ranura con `robotctl policy load` y ejecutar la tarea de recogida del calcetín en un entorno con guardias, aprovechando que el normalizador está embebido y no requiere preprocesado externo.
- Demostración de RL aplicado a robótica de bajo coste: usar el checkpoint como referencia funcional de un pipeline `mjlab` + `microduck-challenges` con 4096 entornos y 1000 iteraciones, útil en docencia o divulgación.
- Reproducción de experimentos: clonar el repositorio en el commit `10ba3a426`, ejecutar `uv sync` y lanzar el comando de entrenamiento documentado para obtener una política comparable y comparar curvas en TensorBoard.
- Punto de partida para fine-tuning: al ser un checkpoint `continue-2` de una segunda ejecución, sirve como inicialización para variantes de la misma tarea o para ajustar hiperparámetros del agente.
- Validación de infraestructura de políticas: probar el esquema 2 del manifiesto y el flujo de carga en el daemon antes de desplegar políticas propias en producción.
- Benchmark interno de control: medir tiempos de episodio (el autor reporta menos de 10 segundos por ejecución) y tasas de éxito frente a otros checkpoints de la misma serie.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El único dato de rendimiento reportado por el autor es cualitativo y acotado a la tarea: la política completa cada episodio en menos de 10 segundos y evita ser detectada por los guardias.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el tamaño del repositorio es de 0.0 GB y no se documentan parámetros, por lo que no puede estimarse con rigor.
- GPU recomendadas: no disponibles. Para el entrenamiento, el comando documentado usa 4096 entornos paralelos, lo que en la práctica exige una GPU de datacenter (A100, H100 o similar); el autor no especifica el hardware empleado.
- Cabe en GPU de consumo: no disponible. Al ser una política de control de pequeño tamaño exportada a ONNX, es plausible que quepa en GPUs de consumo e incluso en CPU, pero no hay datos publicados que lo confirmen.
- Opciones de despliegue: ONNX Runtime (formato `policy.onnx`), daemon microduck mediante `robotctl policy load`, y el stack de entrenamiento `mjlab` con `uv` para reproducir el entrenamiento.
- Latencia y throughput estimados: la política opera a 50 Hz (periodo de 20 ms por paso de control); no se publican cifras de latencia de inferencia ni de throughput.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto / observación | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| microduck-sock-heist-6m-continue-2-h | Política RL para robot microduck | no disponible | 61-D obs, 14 acciones, 50 Hz | no disponible | Hugging Face, 0 descargas |
| Otros checkpoints de la serie sock-heist | Política RL para robot microduck | no disponible | 61-D obs, 14 acciones, 50 Hz | no disponible | no disponible (no se listan en la información proporcionada) |
| Políticas del repositorio microduck-challenges | Política RL para robot microduck | no disponible | no disponible | no disponible | GitHub (pollen-robotics/microduck-challenges) |

No se dispone de datos de benchmarks ni de especificaciones de modelos alternativos comparables en la información proporcionada, por lo que la comparación cuantitativa no está disponible.

## Limitaciones y advertencias

- No se declara licencia: no hay autorización explícita para uso comercial ni para redistribución; debe contactarse con el autor antes de cualquier uso en producción.
- Sesgos conocidos: no documentados; al ser una política de RL entrenada en un entorno simulado concreto, puede sobreajustarse a las condiciones de simulación (posiciones de guardias, geometría del escenario) y degradarse en el mundo real.
- Riesgo de alucinación: no aplica en el sentido de modelos de lenguaje, pero sí existe riesgo de comportamientos no previstos fuera de la distribución de observaciones de entrenamiento.
- Limitaciones de contexto o idioma: no procesa lenguaje; su "contexto" es una observación de 61 dimensiones por paso, sin memoria explícita más allá de la recurrencia implícita de la política.
- Reproducibilidad: el propio autor advierte que el entrenamiento no es bit-reproducible entre máquinas; los pesos no pueden regenerarse exactamente.
- Madurez: repositorio con 0 descargas y 0 likes, creado y actualizado el mismo día (2026-11-13), sin documentación de rendimiento cuantitativo ni validación externa.
- Despliegue: depende del daemon microduck y del comando `robotctl`; requiere acceso `sudo` y una ranura de política libre.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/GinDuck/microduck-sock-heist-6m-continue-2-h
- Repositorio de retos microduck: https://github.com/pollen-robotics/microduck-challenges
- Repositorio del robot microduck: https://github.com/pollen-robotics/microduck
- Documentación del manifiesto de políticas: `docs/policy-manifest.md` en el repositorio del daemon (referenciado en la model card; URL exacta no disponible)
