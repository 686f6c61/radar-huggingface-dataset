# dashi/microduck-sprint-daily-20261111

## Resumen

`sprint-daily-20261111` es una política de control para el robot cuadrúpedo de bajo coste microduck, desarrollada por el usuario dashi y publicada en Hugging Face. No se trata de un modelo de lenguaje, sino de una política de aprendizaje por refuerzo exportada a ONNX que genera patrones de marcha (gaits) para el robot. Concretamente, ocupa el slot `walk` y produce 14 acciones de control a partir de observaciones de 61 dimensiones a una frecuencia de 50 Hz.

El modelo es una reentrada diaria (*daily re-entry*) de la política `dashi/microduck-sprint-remix-r844`, que obtuvo una puntuación de 0,844, y constituye un fine-tuning del modelo `jrubiosainz/microduck-game-sprinter-remix3`. La política está diseñada para ejecutarse de forma perpetua hasta que se le indique lo contrario, lo que la hace adecuada para despliegues continuos en el robot físico.

Su relevancia radica en el ecosistema microduck de Pollen Robotics, que permite experimentar con aprendizaje por refuerzo en robótica de bajo coste. El repositorio tiene un tamaño de 0,0 GB y no registra descargas ni likes en el momento de la consulta, lo que sugiere una publicación reciente y de nicho.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (política de RL exportada a ONNX) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (observación de 61 dimensiones por paso) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | ONNX (`policy.onnx`) y `manifest.json` (schema 2) |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna de la red neuronal. Se sabe que es una política de aprendizaje por refuerzo entrenada con el repositorio `pollen-robotics/microduck_rl`, en la rama `roll-backward` y el commit `83599404a`. La política se exporta a ONNX e incluye el normalizador de observaciones integrado en el propio fichero `policy.onnx`, de modo que el robot puede alimentar observaciones en bruto directamente.

El modelo es un fine-tuning de `jrubiosainz/microduck-game-sprinter-remix3` y se describe como una reentrada diaria de `dashi/microduck-sprint-remix-r844` (puntuación 0,844). No se especifican el número de tokens de entrenamiento, la composición del dataset ni si se emplearon técnicas como RLHF o DPO, ya que no aplican al dominio de robótica. El `manifest.json` sigue el esquema 2 del manifiesto de políticas microduck documentado en `docs/policy-manifest.md` del repositorio del daemon.

## Capacidades

- Generación de patrones de marcha para el slot `walk` del robot microduck.
- Control a 50 Hz con 14 acciones de salida a partir de 61 dimensiones de observación.
- Ejecución perpetua: la política corre de forma continua hasta que se detiene explícitamente.
- Normalización de observaciones integrada en el modelo ONNX, lo que simplifica la integración en el robot.
- Compatible con el comando de carga de políticas del daemon (`robotctl policy load walk ...`).
- No dispone de capacidades de lenguaje, visión, tool calling ni razonamiento multi-paso.

## Casos de uso

- Marcha continua en el robot microduck: la política se carga en el slot `walk` y genera de forma perpetua el patrón de marcha, adecuada para sesiones de demostración o exhibición sin intervención manual.
- Investigación en aprendizaje por refuerzo: sirve como punto de partida para experimentos de fine-tuning sobre `jrubiosainz/microduck-game-sprinter-remix3`, dado que es un remix documentado y reproducible.
- Comparación de políticas: al ser una reentrada diaria de una política con puntuación conocida (0,844), permite evaluar la variabilidad entre ejecuciones de entrenamiento sobre la misma base.
- Despliegue en robots de bajo coste: el formato ONNX y la normalización integrada facilitan la ejecución en hardware modesto asociado al microduck.
- Docencia y prototipado en robótica: el ecosistema microduck y el comando `robotctl` permiten cargar la política con una sola instrucción, lo que reduce la barrera de entrada.
- Integración en pipelines de evaluación automatizada: el `manifest.json` con esquema 2 permite que herramientas del daemon validen y carguen la política de forma programática.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El único dato de rendimiento mencionado es la puntuación de 0,844 de la política original `dashi/microduck-sprint-remix-r844`, de la que esta es una reentrada diaria; no se especifica la métrica empleada ni el resultado de esta versión concreta.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; al ser una política ONNX de robótica, el requisito es previsiblemente muy inferior al de un modelo de lenguaje, pero no se proporcionan cifras.
- GPU recomendadas: no disponibles.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: el daemon microduck mediante `sudo robotctl policy load walk dashi/microduck-sprint-daily-20261111`; el fichero `policy.onnx` puede ejecutarse con cualquier runtime compatible con ONNX.
- Latencia y throughput estimados: no disponibles; la política está diseñada para operar a 50 Hz.

## Comparativa con modelos similares

| Modelo | Tipo | Slot | Puntuación | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `dashi/microduck-sprint-daily-20261111` | Política RL (ONNX) | walk | no disponible | no disponible | Hugging Face |
| `dashi/microduck-sprint-remix-r844` | Política RL (ONNX) | walk | 0,844 | no disponible | Hugging Face |
| `jrubiosainz/microduck-game-sprinter-remix3` | Política RL (ONNX) | no disponible | no disponible | no disponible | Hugging Face |

No se dispone de datos de arquitectura, parámetros ni contexto para estos modelos, ya que son políticas de robótica y no modelos de lenguaje.

## Limitaciones y advertencias

- La licencia no está disponible, por lo que no se puede confirmar si el uso comercial está permitido.
- No se especifican los idiomas soportados; en cualquier caso, no es un modelo de lenguaje.
- El repositorio tiene un tamaño de 0,0 GB y cero descargas, lo que indica que no ha sido validado por la comunidad.
- Al ser una reentrada diaria de una política anterior, su rendimiento puede diferir del de la versión con puntuación 0,844; no se publica la métrica de esta versión.
- La política está especializada en el slot `walk` del microduck; no es transferible a otros robots o tareas sin reentrenamiento.
- No se documentan sesgos ni riesgos de alucinación, ya que no genera texto; el riesgo principal es un comportamiento de marcha inestable en el robot físico.
- No se proporcionan detalles sobre la arquitectura ni el proceso de entrenamiento, lo que dificulta la reproducibilidad y la auditoría técnica.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dashi/microduck-sprint-daily-20261111
- Modelo base: https://huggingface.co/jrubiosainz/microduck-game-sprinter-remix3
- Repositorio microduck: https://github.com/pollen-robotics/microduck
- Repositorio de entrenamiento RL: `pollen-robotics/microduck_rl` (rama `roll-backward`, commit `83599404a`)
