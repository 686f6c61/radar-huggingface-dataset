# dashi/microduck-sprint-daily-20261121

## Resumen

`dashi/microduck-sprint-daily-20261121` es una política de control para el robot cuadrúpedo de código abierto microduck, desarrollado por Pollen Robotics. No se trata de un modelo de lenguaje, sino de una política de aprendizaje por refuerzo exportada a ONNX que genera comandos motores a 50 Hz a partir de observaciones de 61 dimensiones y produce 14 acciones. El modelo se publica como un reentrenamiento diario ("daily re-entry") del checkpoint `dashi/microduck-sprint-remix-r844`, con una puntuación de 0,844, y está especializado en la ranura de marcha (`walk`) del robot.

La relevancia de esta ficha es acotada: el repositorio tiene 0 descargas y 0 likes en el momento de la consulta, un tamaño de 0,0 GB y una model card mínima. La información técnica disponible se limita a los metadatos de Hugging Face y a la model card del autor; no hay datos sobre arquitectura de red, número de parámetros, composición del dataset de entrenamiento ni resultados de benchmarks. Todo lo que no consta se marca explícitamente como "no disponible".

El modelo base declarado es `jrubiosainz/microduck-game-sprinter-remix3`, sobre el que se aplica un fine-tuning. La licencia no está especificada, lo que impide determinar condiciones de uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (política de RL exportada a ONNX; arquitectura de red no especificada) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (política de control, no modelo de secuencia) |
| Tipos de cuantizacion | no disponible (se distribuye en ONNX; no se documentan variantes cuantizadas) |
| Idiomas soportados | no aplica (modelo de robótica, sin entrada/salida de texto) |
| Licencia | no disponible |
| Formato de pesos | ONNX (`policy.onnx`) + `manifest.json` (esquema 2 del manifiesto de políticas microduck) |

## Arquitectura y entrenamiento

La model card no describe la arquitectura de la red neuronal. Se sabe que la política consume observaciones de 61 dimensiones y emite 14 acciones a una frecuencia de 50 Hz, y que el normalizador de observaciones está integrado dentro de `policy.onnx`, de modo que el robot debe alimentar observaciones en bruto. El manifiesto `manifest.json` sigue el esquema 2 del manifiesto de políticas microduck, documentado en `docs/policy-manifest.md` del repositorio del daemon.

El entrenamiento se realizó con el repositorio `pollen-robotics/microduck_rl`, en la rama `roll-backward`, commit `83599404a`. Es un fine-tuning sobre `jrubiosainz/microduck-game-sprinter-remix3`, etiquetado como "daily re-entry" del checkpoint `dashi/microduck-sprint-remix-r844` con puntuación 0,844. No se especifican el número de pasos de entrenamiento, la composición del dataset, ni si se emplearon técnicas como RLHF o DPO (no aplicables a este dominio). La política se describe como "perpetua": se ejecuta de forma continua hasta recibir una orden de parada.

## Capacidades

- Generación de marcha continua para el cuadrúpedo microduck en la ranura `walk`.
- Control motor a 50 Hz con 14 acciones de salida.
- Procesamiento de observaciones de 61 dimensiones con normalización integrada en el modelo ONNX.
- Operación desatendida: la política corre de forma perpetua hasta que se le indique lo contrario.
- Carga en robot mediante el comando `robotctl policy load walk dashi/microduck-sprint-daily-20261121`.
- No dispone de capacidades de texto, razonamiento, código, matemáticas, visión, tool calling, agentes ni multilingüismo.

## Casos de uso

- Investigación en locomoción de cuadrúpedos: sirve como política de referencia para comparar estrategias de marcha en la ranura `walk` del microduck, con observaciones y acciones bien definidas.
- Pruebas de pipeline de políticas RL en robot real: permite validar el flujo `robotctl policy load` y el consumo del manifiesto esquema 2 sin escribir código adicional.
- Reentrenamiento y remezcla: al ser un fine-tuning de `jrubiosainz/microduck-game-sprinter-remix3`, resulta útil como punto de partida para nuevas iteraciones diarias sobre la misma base.
- Docencia y demostraciones de aprendizaje por refuerzo aplicado a robótica: el modelo ONNX autocontenido (con normalizador incluido) simplifica la puesta en marcha en talleres.
- Benchmarking interno de políticas de marcha: la puntuación declarada (0,844) permite comparar variantes del mismo linaje de checkpoints.
- Integración en experimentos de control continuo a 50 Hz: útil para estudiar estabilidad y comportamiento de la política en ejecuciones prolongadas ("perpetua").

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La única métrica mencionada es la puntuación de 0,844 asociada al checkpoint `dashi/microduck-sprint-remix-r844`, sin que se especifique la metodología de evaluación ni la escala.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible (el tamaño del repositorio es de 0,0 GB y no se documenta el número de parámetros).
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: ejecución en el robot mediante `robotctl` (comando `robotctl policy load walk ...`); el modelo se distribuye como ONNX, por lo que puede ejecutarse con runtimes ONNX estándar, aunque no se documenta ninguno en concreto.
- Latencia y throughput: la política está diseñada para operar a 50 Hz; no se publican medidas de latencia ni throughput reales.

## Comparativa con modelos similares

| Modelo | Tipo | Ranura | Puntuación declarada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `dashi/microduck-sprint-daily-20261121` | Política RL (ONNX) | walk | 0,844 (heredada del checkpoint base) | no disponible | Hugging Face, 0 descargas |
| `dashi/microduck-sprint-remix-r844` | Política RL | walk | 0,844 | no disponible | Hugging Face (referenciado) |
| `jrubiosainz/microduck-game-sprinter-remix3` | Política RL (modelo base) | no disponible | no disponible | no disponible | Hugging Face |

No se dispone de datos de parámetros, contexto ni rendimiento medido para ninguno de los modelos comparados.

## Limitaciones y advertencias

- No se especifica la licencia, por lo que no puede confirmarse el uso comercial ni la redistribución.
- La model card no documenta arquitectura, número de parámetros, dataset de entrenamiento ni metodología de evaluación.
- La puntuación de 0,844 procede del checkpoint base y no se acredita con una evaluación independiente en este repositorio.
- El modelo está especializado exclusivamente en la ranura `walk`; no cubre otras habilidades del robot.
- El repositorio tiene 0 descargas y 0 likes, sin señales de validación por parte de la comunidad.
- Al ser un "daily re-entry", puede quedar obsoleto rápidamente frente a versiones posteriores del mismo linaje.
- No hay información sobre sesgos, robustez ante distribuciones de observación distintas a las de entrenamiento ni comportamiento en entornos no vistos.
- El uso requiere hardware microduck y el daemon `robotctl`; no es un modelo de propósito general.

## Enlaces

- Hugging Face: https://huggingface.co/dashi/microduck-sprint-daily-20261121
- Modelo base: https://huggingface.co/jrubiosainz/microduck-game-sprinter-remix3
- Repositorio del robot microduck: https://github.com/pollen-robotics/microduck
- Repositorio de entrenamiento RL: `pollen-robotics/microduck_rl` (rama `roll-backward`, commit `83599404a`; sin URL directa en la información disponible)
- Documentación del manifiesto de políticas: `docs/policy-manifest.md` en el repositorio del daemon (sin URL directa en la información disponible)
