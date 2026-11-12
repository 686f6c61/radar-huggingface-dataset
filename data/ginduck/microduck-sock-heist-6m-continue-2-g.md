# GinDuck/microduck-sock-heist-6m-continue-2-g

## Resumen

microduck-sock-heist-6m-continue-2-g es un checkpoint de política de refuerzo (reinforcement learning) para el robot cuadrúpedo microduck de Pollen Robotics, publicado por el usuario GinDuck en Hugging Face. No es un modelo de lenguaje ni un transformer generativo: es una política perpetua entrenada mediante RL que controla la locomoción del robot para completar una tarea concreta denominada "sock heist" (robar un calcetín esquivando guardias). El artefacto se distribuye como `policy.onnx` con el normalizador de observaciones embebido y un `manifest.json` conforme al esquema 2 del manifiesto de políticas de microduck.

El modelo recibe observaciones de 61 dimensiones y emite 14 acciones a 50 Hz, lo que corresponde a la interfaz estándar del microduck. La política se ejecuta de forma continua hasta que se le indique lo contrario, comportándose como una marcha o gait cargada en una ranura de política del demonio `robotctl`. El entrenamiento se realizó con el framework mjlab (basado en MuJoCo) sobre el repositorio `microduck-challenges`, rama `sock-continue-2`, commit `10ba3a426`, con 4096 entornos paralelos y 1000 iteraciones máximas, semilla 1.

La relevancia de esta ficha es acotada: se trata de un checkpoint experimental de un usuario individual, sin descargas ni likes en el momento de la consulta, sin licencia declarada y sin idiomas especificados. Su interés reside en ser un ejemplo reproducible de entrenamiento RL para robótica de bajo coste con el stack de Pollen Robotics, no en capacidades de propósito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Política de reinforcement learning exportada a ONNX (red neuronal feed-forward; topología interna no disponible) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (política de control, no modelo de lenguaje); observación de 61 dimensiones por paso |
| Tipos de cuantizacion | no disponible (se distribuye en ONNX; no se documentan variantes cuantizadas) |
| Idiomas soportados | no disponible (no procesa lenguaje natural) |
| Licencia | no disponible |
| Formato de pesos | ONNX (`policy.onnx`) + `manifest.json` (esquema 2 del manifiesto de políticas de microduck) |

## Arquitectura y entrenamiento

La política se entrena con mjlab, un framework de RL basado en MuJoCo, sobre el repositorio `microduck-challenges` de Pollen Robotics. La tarea `Mjlab-SockHeist6m-MicroDuck` define un escenario con guardias y un calcetín como objetivo; la política debe esquivar a los guardias y recoger el calcetín sin ser detectada, completando cada episodio en menos de 10 segundos según la model card. El checkpoint corresponde a la iteración 100 de un entrenamiento con 4096 entornos paralelos, 1000 iteraciones máximas y semilla 1, sobre la base `mjlab-microduck 0.1.0 @ 1efd853be`. El sufijo "continue-2" indica que es una continuación de un run previo ("sock-continue-2").

La interfaz de control es la estándar del microduck: 61 dimensiones de observación y 14 acciones a 50 Hz. El normalizador de observaciones está embebido en el propio `policy.onnx`, de modo que el consumidor debe alimentar observaciones en bruto. La política es perpetua: se ejecuta de forma continua hasta que el demonio la descargue. No se documentan detalles de la topología de la red (capas, anchos, función de activación), ni el algoritmo RL concreto, ni la composición del dataset de entrenamiento (que en RL procede de la simulación, no de un corpus). El autor advierte que el entrenamiento no es bit-reproducible entre máquinas: misma semilla y mismo código producen una política comparable, no idéntica.

## Capacidades

- Control locomotor del robot microduck: genera 14 acciones a 50 Hz a partir de 61 observaciones.
- Ejecución de la tarea "sock heist": navegar esquivando guardias y recoger un calcetín sin ser detectada.
- Política perpetua: no tiene condición de terminación interna; se ejecuta hasta que el demonio la detiene.
- Integración con el stack de Pollen Robotics mediante `robotctl policy load <slot> <repo>`.
- Normalización de observaciones integrada en el ONNX: acepta observaciones en bruto.
- No soporta tool calling, function calling, agentes multi-paso, ni procesamiento de lenguaje, visión o audio.

## Casos de uso

- Demostración de RL en robótica de bajo coste: cargar la política en un microduck físico para mostrar una tarea de navegación con obstáculos y objetivo, usando el comando `robotctl policy load` documentado en la model card.
- Reproducción de experimentos: clonar `microduck-challenges`, hacer checkout del commit `10ba3a426` y relanzar el entrenamiento con `uv run train Mjlab-SockHeist6m-MicroDuck` para obtener una política comparable y comparar curvas en TensorBoard.
- Punto de partida para fine-tuning: usar el checkpoint como inicialización en la rama `sock-continue-2` para continuar el entrenamiento con variaciones de escenario, recompensas o número de guardias.
- Evaluación de robustez de políticas RL: medir la tasa de éxito y el tiempo por episodio (el autor afirma menos de 10 segundos por run) en simulador y en robot real para estudiar la brecha sim-a-real.
- Benchmark interno de políticas microduck: comparar esta política con otras del mismo autor o de la comunidad en la misma tarea, usando el mismo manifiesto y el mismo demonio.
- Docencia en cursos de RL aplicado: ejemplo completo y reproducible de pipeline (entorno MuJoCo, entrenamiento paralelo con 4096 entornos, exportación a ONNX, despliegue en robot) con comandos concretos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente afirma que la política "completa cada run en menos de 10 segundos" y que "esquiva a los guardias y coge el calcetín sin ser detectada", sin cifras de tasa de éxito, recompensa media ni comparación con otras políticas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el tamaño del repositorio es de 0.0 GB según Hugging Face, lo que sugiere un artefacto ONNX muy pequeño (política de control, no un modelo generativo).
- GPU recomendadas: no disponible. Para inferencia en robot, el cómputo es mínimo y probablemente se ejecuta en la CPU del propio robot o en un SBC.
- ¿Cabe en GPU de consumo? Sí, con altísima probabilidad, dado el tamaño del artefacto; no se documentan requisitos específicos.
- Opciones de despliegue: ONNX Runtime para la inferencia del `policy.onnx`; el despliegue en robot se realiza con `robotctl policy load <slot> GinDuck/microduck-sock-heist-6m-continue-2-g`. Para reentrenamiento, mjlab con MuJoCo y `uv` (ver comandos de reproducción).
- Latencia y throughput: no disponibles. La política opera a 50 Hz por requisito de la interfaz del microduck, pero no se publican medidas de latencia del ONNX.

## Comparativa con modelos similares

| Modelo | Tipo | Interfaz | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| microduck-sock-heist-6m-continue-2-g | Política RL (ONNX) | 61 obs / 14 acciones a 50 Hz | Sock heist | no disponible | Hugging Face, 0 descargas |
| Otros checkpoints de GinDuck (misma familia) | Política RL (ONNX) | 61 obs / 14 acciones a 50 Hz | Sock heist / variantes | no disponible | no disponible en la información proporcionada |
| Políticas de referencia de microduck-challenges | Política RL | 61 obs / 14 acciones a 50 Hz | Tareas del repositorio oficial | según repositorio | GitHub Pollen Robotics |

No se dispone de datos de benchmarks ni de especificaciones detalladas de los modelos comparables en la información proporcionada, por lo que la comparación cuantitativa no está disponible.

## Limitaciones y advertencias

- Licencia no declarada: no se especifica licencia, lo que impide determinar si el uso comercial está permitido. Antes de cualquier uso en producción, contactar con el autor.
- Modelo experimental de un usuario individual: 0 descargas y 0 likes en el momento de la consulta; sin validación por parte de la comunidad.
- Sin datos de benchmarks: la afirmación de éxito ("menos de 10 segundos por run") no está respaldada por métricas publicadas ni por una evaluación independiente.
- Entrenamiento no bit-reproducible: el autor advierte explícitamente que relanzar el entrenamiento produce una política comparable pero no idéntica.
- Especialización estrecha: la política está entrenada para una única tarea ("sock heist") y no es reutilizable para otras tareas sin reentrenamiento.
- Riesgo de brecha sim-a-real: no se documenta evaluación en robot físico ni robustez frente a variaciones de terreno, iluminación o dinámica de los guardias.
- Sin soporte de lenguaje, visión ni audio: no es un modelo de propósito general.
- Dependencia del stack microduck: requiere el demonio `robotctl` y el esquema 2 del manifiesto de políticas; no es portable a otros robots sin adaptación.
- Idiomas no aplicables: no procesa texto.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/GinDuck/microduck-sock-heist-6m-continue-2-g
- Repositorio de retos microduck: https://github.com/pollen-robotics/microduck-challenges
- Repositorio microduck (Pollen Robotics): https://github.com/pollen-robotics/microduck
- Documentación del manifiesto de políticas: `docs/policy-manifest.md` en el repositorio del demonio (referenciado en la model card; URL exacta no disponible)
- Commit de entrenamiento: `10ba3a426` en `microduck-challenges`
- Base de entrenamiento: `mjlab-microduck 0.1.0 @ 1efd853be` (URL no disponible)
