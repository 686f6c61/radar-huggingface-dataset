# dashi/microduck-hill-daily-20261118

## Resumen

`dashi/microduck-hill-daily-20261118` es una política de control entrenada por refuerzo (reinforcement learning) para el robot cuadrúpedo de código abierto microduck, desarrollado por Pollen Robotics. No es un modelo de lenguaje: es una política de locomoción que ocupa el slot `walk` del daemon del robot y genera comandos de marcha a 50 Hz a partir de observaciones de 61 dimensiones, produciendo 14 acciones. Se distribuye como un grafo ONNX listo para ejecutarse en el robot mediante el comando `robotctl policy load walk`.

La relevancia de esta ficha es acotada: se trata de un artefacto de investigación derivado de un modelo previo (`jrubiosainz/microduck-game-hillclimber-remix6`) mediante un fine-tune, etiquetado por el autor como "daily re-entry" de una política anterior (`dashi/microduck-hill-remix-r752`, con puntuación 0.749). El repositorio no contiene pesos en safetensors ni un transformer: contiene una política neuronal exportada a ONNX con el normalizador de observaciones embebido.

Por tanto, la mayoría de los campos habituales de una ficha de modelo de lenguaje (contexto, cuantización, idiomas, benchmarks de MMLU/HumanEval) no aplican y se marcan como no disponibles. La información pública se limita a la model card del autor y a los metadatos de Hugging Face.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal de política para control robótico, exportada a ONNX (detalles de capas no disponibles) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no aplica; observación de 61 dimensiones por paso) |
| Tipos de cuantizacion | no disponible (se distribuye como ONNX) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | ONNX (`policy.onnx`) y `manifest.json` (schema 2 del manifiesto de políticas microduck) |
| Frecuencia de control | 50 Hz |
| Dimension de observacion | 61 |
| Dimension de accion | 14 |
| Slot de política | `walk` |
| Modelo base | `jrubiosainz/microduck-game-hillclimber-remix6` (fine-tune) |
| Libreria | `microduck` |
| Tamano del repo | 0.0 GB |

## Arquitectura y entrenamiento

La model card no describe la arquitectura interna de la red (número de capas, anchura, tipo de activaciones). Lo que sí se explicita es el pipeline de entrenamiento: el repositorio `pollen-robotics/microduck_rl`, rama `roll-backward`, commit `83599404a`, con entrenamiento por refuerzo. Se trata de un fine-tune del modelo `jrubiosainz/microduck-game-hillclimber-remix6`, que a su vez es un "remix" de un juego de políticas de locomoción para el microduck.

La innovación práctica destacable es de ingeniería de despliegue: el normalizador de observaciones está embebido dentro de `policy.onnx`, de modo que el consumidor puede alimentar observaciones en crudo sin replicar la normalización en el lado del robot. El `manifest.json` sigue el esquema 2 documentado en `docs/policy-manifest.md` del repositorio del daemon. La política es "perpetua": no tiene condición de terminación propia y se ejecuta hasta que se le indique lo contrario, lo que la hace adecuada como marcha continua en el slot `walk`.

No se documentan número de tokens, composición del dataset, ni uso de RLHF/DPO, ya que no es un modelo de lenguaje.

## Capacidades

- Generación de comandos de locomoción continua para el robot microduck en el slot `walk`.
- Control a 50 Hz con observaciones de 61 dimensiones y 14 acciones.
- Ejecución perpetua sin condición de parada interna (la marcha continúa hasta que el daemon la detenga).
- Normalización de observaciones integrada en el grafo ONNX, lo que simplifica la integración en el daemon.
- Despliegue directo en robot mediante `robotctl policy load walk dashi/microduck-hill-daily-20261118`.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingües: no es un modelo de lenguaje.
- No se documentan capacidades de visión, audio ni modo "thinking".

## Casos de uso

- Locomoción continua en el slot `walk` del microduck: cargar la política con `robotctl policy load walk ...` y dejar que el robot camine de forma indefinida, aprovechando su naturaleza perpetua.
- Experimentación en robótica de código abierto: servir como punto de partida para comparar políticas de marcha sobre el mismo hardware y el mismo daemon, dado que comparte base con `microduck-game-hillclimber-remix6`.
- Reproducción de resultados de RL: el commit y la rama de entrenamiento están documentados, lo que permite reconstruir el pipeline en `pollen-robotics/microduck_rl`.
- Integración en pipelines de evaluación de políticas: al ser un artefacto ONNX con manifiesto versionado (schema 2), se puede cargar programáticamente en herramientas de test del daemon.
- Demostraciones educativas: ilustrar el ciclo completo de entrenamiento por refuerzo, exportación a ONNX y despliegue en un robot cuadrúpedo de bajo coste.
- Base para fine-tunes posteriores: el autor ya ha realizado al menos un fine-tune sobre un modelo previo, por lo que esta política puede servir como inicialización para nuevas variantes de marcha.

## Benchmarks y rendimiento

La model card menciona una puntuación de 0.749 asociada a la política previa `dashi/microduck-hill-remix-r752`, de la que esta es una "re-entry" diaria, pero no se especifica la métrica, el entorno de evaluación ni los resultados de esta versión concreta. No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; al ser una política de control en ONNX de un robot de pequeñas dimensiones, es presumible que quepa en CPU, pero no se documenta.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible; no se especifica.
- Opciones de despliegue: el daemon `robotctl` del microduck (comando `robotctl policy load walk <repo>`); el runtime ONNX concreto no se detalla en la model card.
- Latencia y throughput estimados: frecuencia de control de 50 Hz documentada; latencia por inferencia no disponible.

## Comparativa con modelos similares

| Modelo | Tipo | Slot | Base | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `dashi/microduck-hill-daily-20261118` | Política RL (ONNX) | `walk` | `jrubiosainz/microduck-game-hillclimber-remix6` | no disponible | Hugging Face |
| `dashi/microduck-hill-remix-r752` | Política RL | no disponible | no disponible | no disponible | Hugging Face (referenciado) |
| `jrubiosainz/microduck-game-hillclimber-remix6` | Política RL | no disponible | no disponible | no disponible | Hugging Face |

No se dispone de datos de rendimiento comparables entre estas políticas en la información proporcionada.

## Limitaciones y advertencias

- Es un artefacto de investigación con 0 descargas y 0 likes en el momento de la ficha; no hay evidencia de uso en producción.
- La licencia no está disponible, lo que impide confirmar si se permite uso comercial.
- No se documentan sesgos, pero al ser una política entrenada por RL en un simulador concreto, su comportamiento fuera de la distribución de entrenamiento (terrenos, cargas o perturbaciones no vistas) es incierto.
- El entrenamiento se realizó en la rama `roll-backward` del repositorio `microduck_rl`, lo que sugiere un sesgo hacia un modo de marcha concreto; no se detalla su generalidad.
- La política es perpetua y no tiene condición de parada interna: el operador debe detenerla explícitamente.
- El repositorio tiene un tamaño de 0.0 GB reportado, lo que puede indicar que los artefactos no están completamente subidos o que el tamaño es inferior a la resolución de la métrica; conviene verificar los ficheros antes de desplegar.
- No aplica ninguna de las advertencias típicas de modelos de lenguaje (alucinación, contexto, idioma), pero tampoco ofrece sus garantías.

## Enlaces

- Hugging Face: https://huggingface.co/dashi/microduck-hill-daily-20261118
- Modelo base: https://huggingface.co/jrubiosainz/microduck-game-hillclimber-remix6
- Repositorio del robot microduck: https://github.com/pollen-robotics/microduck
- Repositorio de entrenamiento RL: `pollen-robotics/microduck_rl` (rama `roll-backward`, commit `83599404a`)
