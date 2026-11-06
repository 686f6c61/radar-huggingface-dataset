# dashi/microduck-sprint-daily-20261103

## Resumen

`dashi/microduck-sprint-daily-20261103` es una política de control motriz entrenada por refuerzo para el robot cuadrúpedo de bajo coste Microduck, desarrollado por Pollen Robotics. No es un modelo de lenguaje: es una política neuronal que mapea observaciones de 61 dimensiones a 14 acciones de control a 50 Hz, destinada a ejecutar una marcha perpetua en la ranura `walk` del robot. Se distribuye en formato ONNX y se carga directamente en el daemon del robot mediante el comando `robotctl policy load`.

El modelo es un reentrenamiento diario (daily re-entry) de `dashi/microduck-sprint-remix-r844`, que obtuvo una puntuación de 0,844 en el sistema de evaluación del proyecto. A su vez, deriva por fine-tuning de `jrubiosainz/microduck-game-sprinter-remix3`, un remix de la política de sprint del juego Microduck. La ficha técnica es deliberadamente escueta: no se publican parámetros, contexto, idiomas ni licencia.

Su relevancia es de nicho: dentro del ecosistema Microduck, este tipo de políticas demuestran el ciclo de entrenamiento por RL en robótica de bajo coste, con reentrenamientos frecuentes y despliegue directo en hardware real mediante ONNX Runtime. Para desarrolladores e investigadores en robótica de locomoción, es un ejemplo de pipeline completo desde el simulador hasta el robot físico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | política neuronal de control (reinforcement learning); topología interna no disponible |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (política de control, no modelo de lenguaje) |
| Tipos de cuantizacion | no disponible (se distribuye en ONNX; el normalizador de observaciones va embebido) |
| Idiomas soportados | no disponible (no aplica) |
| Licencia | no disponible |
| Formato de pesos | ONNX (`policy.onnx`) + `manifest.json` (schema 2 del manifiesto de políticas microduck) |

Especificaciones adicionales del entorno de control:

| Parametro | Valor |
|---|---|
| Dimension de observacion | 61 |
| Dimension de accion | 14 |
| Frecuencia de control | 50 Hz |
| Ranura de política | `walk` |
| Modelo base | `jrubiosainz/microduck-game-sprinter-remix3` (fine-tune) |
| Repo de entrenamiento | `pollen-robotics/microduck_rl`, rama `roll-backward`, commit `83599404a` |
| Tamano del repo | 0.0 GB (según Hugging Face) |

## Arquitectura y entrenamiento

La información pública no detalla la topología interna de la red (número de capas, anchura, tipo de activaciones). Se sabe que es una política de reinforcement learning entrenada con el repositorio `pollen-robotics/microduck_rl`, en la rama `roll-backward` y el commit `83599404a`. El entrenamiento produce una política perpetua: se ejecuta de forma continua hasta que se le indique lo contrario, sin episodios acotados.

El modelo es un fine-tune de `jrubiosainz/microduck-game-sprinter-remix3` y se describe como "daily re-entry" de `dashi/microduck-sprint-remix-r844` (puntuación 0,844). El normalizador de observaciones está embebido en el propio `policy.onnx`, de modo que el robot debe alimentar observaciones en crudo. No se especifican el número de pasos de entrenamiento, la composición del dataset, ni si se emplearon técnicas como PPO, SAC u otras; tampoco se documenta RLHF/DPO (no aplica en este dominio).

## Capacidades

- Locomoción cuadrúpeda: genera una marcha perpetua para el robot Microduck en la ranura `walk`.
- Control reactivo a 50 Hz a partir de observaciones de 61 dimensiones (estado de articulaciones, IMU y consignas, presumiblemente; la composición exacta no está documentada).
- Salida de 14 acciones de control articular.
- Despliegue directo en hardware mediante ONNX Runtime, con normalización integrada.
- Integración con el daemon del robot vía `robotctl policy load`.
- No soporta tool calling, agentes, razonamiento multi-paso, visión, audio ni capacidades multilingües: es una política motriz, no un modelo generativo.

## Casos de uso

- Locomoción autónoma en el robot Microduck: cargar la política en la ranura `walk` y dejar que el robot camine de forma continua en demostraciones o entornos controlados, gracias a su naturaleza perpetua.
- Investigación en locomoción de bajo coste: servir como punto de partida o línea base para comparar estrategias de RL en cuadrúpedos económicos.
- Reentrenamiento y experimentación: al ser un fine-tune de un remix público, permite reproducir el pipeline con `microduck_rl` y evaluar variantes (por ejemplo, la rama `roll-backward`).
- Docencia y talleres de robótica: el despliegue en un solo comando (`robotctl policy load walk ...`) facilita prácticas sin infraestructura pesada.
- Pruebas de integración del daemon: validar el esquema 2 del manifiesto de políticas y el flujo de carga de políticas ONNX en el robot.
- Benchmarking interno del equipo: el identificador `r844` (0,844) sugiere una métrica de evaluación que puede usarse para comparar reentrenamientos diarios.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El único dato numérico es la puntuación 0,844 asociada al modelo de origen `dashi/microduck-sprint-remix-r844`, sin que se documente la métrica, el conjunto de evaluación ni la comparación con alternativas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; por el tamaño del repo (0.0 GB según Hugging Face) y el formato ONNX, es presumiblemente muy reducida, pero no se confirma.
- GPU recomendadas: no disponible. La inferencia ONNX puede ejecutarse en CPU o en GPU de gama baja, pero no se especifica.
- ¿Cabe en GPU de consumo? No confirmado; el despliegue documentado es en el propio robot (CPU embebida), no en GPU de escritorio.
- Opciones de despliegue: ONNX Runtime a través del daemon `robotctl` del proyecto Microduck; no se documentan vLLM, llama.cpp, Ollama ni TGI (no aplican).
- Latencia y throughput: control a 50 Hz (periodo de 20 ms por paso); no se publican latencias medidas.

## Comparativa con modelos similares

| Modelo | Tipo | Observacion / accion | Frecuencia | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `dashi/microduck-sprint-daily-20261103` | Política RL (fine-tune) | 61 / 14 | 50 Hz | no disponible | Hugging Face |
| `jrubiosainz/microduck-game-sprinter-remix3` | Política RL (base) | no disponible | no disponible | no disponible | Hugging Face |
| `dashi/microduck-sprint-remix-r844` | Política RL (origen del reentry) | no disponible | no disponible | no disponible | Hugging Face |

No se dispone de datos de rendimiento comparables entre estas políticas; la comparativa se limita a la relación de linaje (fine-tune y reentry) y a la ausencia de especificaciones públicas en los tres casos.

## Limitaciones y advertencias

- Es una política específica para el robot Microduck; no es transferible a otros robots sin reentrenamiento.
- La ranura está fijada a `walk`; no cubre otras habilidades (por ejemplo, giros o saltos) salvo que el daemon lo permita.
- No se publica licencia: el uso comercial queda sin autorización explícita y debe consultarse con el autor.
- No hay información sobre sesgos, alucinaciones ni robustez ante perturbaciones; en robótica, el riesgo principal es la inestabilidad de la marcha en terrenos no vistos durante el entrenamiento.
- El modelo base y el origen del reentry no documentan sus propios detalles, lo que limita la trazabilidad del entrenamiento.
- Los resultados de búsqueda web proporcionados tratan sobre el caldo japonés *dashi* y son irrelevantes para este modelo; no aportan información técnica.
- El repositorio figura con 0 descargas y 0 likes, y un tamaño de 0.0 GB, lo que puede indicar metadatos incompletos o un artefacto aún no publicado por completo.

## Enlaces

- Hugging Face: https://huggingface.co/dashi/microduck-sprint-daily-20261103
- Modelo base: https://huggingface.co/jrubiosainz/microduck-game-sprinter-remix3
- Proyecto Microduck (Pollen Robotics): https://github.com/pollen-robotics/microduck
- Repositorio de entrenamiento RL: `pollen-robotics/microduck_rl` (rama `roll-backward`, commit `83599404a`); URL exacta no disponible en la información proporcionada
- Documentación del manifiesto de políticas: `docs/policy-manifest.md` en el repositorio del daemon; URL exacta no disponible
