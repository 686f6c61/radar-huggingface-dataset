# dashi/microduck-sprint-daily-20261107

## Resumen

`dashi/microduck-sprint-daily-20261107` es una política de control motriz (policy) para el robot cuadrúpedo de código abierto microduck, desarrollado por Pollen Robotics. No es un modelo de lenguaje: es un modelo de aprendizaje por refuerzo exportado a ONNX que genera comandos de locomoción a 50 Hz a partir de observaciones de 61 dimensiones y produce 14 acciones de control. Se publica en el espacio de nombres de usuario `dashi` y se enmarca en la categoría de políticas de robótica, no en la de modelos generativos.

El modelo es un reentrenamiento diario («daily re-entry») de `dashi/microduck-sprint-remix-r844`, que obtuvo una puntuación de 0,844, y a su vez es un finetune (remix) de `jrubiosainz/microduck-game-sprinter-remix3`. Ocupa el slot de marcha (`walk`) del sistema de políticas del daemon de microduck, y su propósito es proporcionar una marcha perpetua que se ejecuta de forma continua hasta recibir una orden de parada.

Su relevancia es acotada y específica: sirve como pieza intercambiable dentro del ecosistema microduck para experimentación en locomoción con aprendizaje por refuerzo. El repositorio tiene un tamaño de 0,0 GB, cero descargas y cero likes en el momento de la consulta, y no se ha publicado información sobre arquitectura de red, hiperparámetros de entrenamiento ni resultados de evaluación formales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (política de RL exportada a ONNX; topología de red no especificada) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (política de control reactiva, no modelo de secuencia) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (modelo de control robótico, no lingüístico) |
| Licencia | no disponible |
| Formato de pesos | ONNX (`policy.onnx`) y `manifest.json` (schema 2 del manifiesto de políticas microduck) |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura de la red neuronal subyacente (número de capas, tipo de capas, tamaño de las capas ocultas). Lo que sí se especifica es la interfaz del modelo: recibe observaciones de 61 dimensiones, emite 14 acciones y opera a 50 Hz. El normalizador de observaciones está integrado dentro de `policy.onnx`, de modo que el consumidor debe alimentar observaciones en crudo.

El entrenamiento se realizó con el repositorio `pollen-robotics/microduck_rl`, en la rama `roll-backward` y el commit `83599404a`. Se trata de un proceso de aprendizaje por refuerzo (la etiqueta `reinforcement-learning` así lo indica), pero no se han publicado el número de pasos de entrenamiento, la función de recompensa, la composición del entorno ni los detalles del algoritmo de RL empleado. El modelo es un finetune de `jrubiosainz/microduck-game-sprinter-remix3` y un reentrenamiento de `dashi/microduck-sprint-remix-r844`.

## Capacidades

- Generación de una marcha perpetua para el robot microduck: la política se ejecuta de forma continua hasta que se le indica lo contrario.
- Control de locomoción a 50 Hz con 14 acciones de salida y 61 entradas de observación.
- Ocupación del slot `walk` dentro del sistema de políticas del daemon microduck.
- Normalización de observaciones integrada en el propio modelo ONNX, lo que simplifica la integración en el robot.
- Carga en robot mediante el comando `robotctl policy load walk dashi/microduck-sprint-daily-20261107`.
- No dispone de capacidades de generación de texto, razonamiento, código, matemáticas, visión, audio, tool calling ni agentes multi-paso.

## Casos de uso

- Locomoción básica del microduck en experimentos de robótica: se carga en el slot `walk` y el robot ejecuta una marcha continua, lo que permite probar el hardware y el daemon con una política funcional.
- Comparación de políticas de marcha: al ser un reentrenamiento diario de un remix previo con puntuación 0,844, sirve para evaluar la variabilidad entre ejecuciones de entrenamiento sobre la misma base.
- Investigación en aprendizaje por refuerzo para robótica: el modelo se puede usar como punto de partida o referencia en experimentos de finetune con el repositorio `microduck_rl`.
- Docencia y prototipado con robots de bajo coste: el microduck es una plataforma de código abierto y esta política permite poner un robot a caminar sin entrenar desde cero.
- Integración en pipelines de despliegue de políticas: el formato ONNX y el manifiesto schema 2 facilitan la carga automatizada mediante `robotctl`.
- Pruebas de robustez del daemon de microduck: una política perpetua a 50 Hz somete al sistema de control a una carga continua y sirve para validar latencias y estabilidad.
- Reentrenamientos diarios en serie: el patrón «daily re-entry» permite generar variantes sucesivas y estudiar su comportamiento en el robot.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El único dato numérico es la puntuación de 0,844 de la política base `dashi/microduck-sprint-remix-r844`, pero no se especifica la métrica, el entorno de evaluación ni la escala utilizada.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el tamaño del repositorio es de 0,0 GB, lo que sugiere un modelo muy pequeño, pero no se confirma.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible; por el tamaño del artefacto es plausible que se ejecute en CPU, pero no se ha confirmado.
- Opciones de despliegue: el modelo está pensado para ejecutarse en el robot mediante `robotctl` y el daemon de microduck, con el runtime ONNX. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: la política opera a 50 Hz (periodo de 20 ms por ciclo de control), según la model card; no se publican latencias medidas.

## Comparativa con modelos similares

| Modelo | Tipo | Entrada / salida | Slot | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `dashi/microduck-sprint-daily-20261107` | Política RL (ONNX) | 61 obs / 14 acciones a 50 Hz | `walk` | no disponible | Hugging Face |
| `dashi/microduck-sprint-remix-r844` | Política RL (ONNX) | no disponible | no disponible | no disponible | Hugging Face |
| `jrubiosainz/microduck-game-sprinter-remix3` | Política RL (ONNX) | no disponible | no disponible | no disponible | Hugging Face |

No se dispone de datos de rendimiento comparables entre estas políticas, por lo que la comparativa se limita a la relación de linaje (finetune y reentrenamiento) y al formato de publicación.

## Limitaciones y advertencias

- No se ha publicado la licencia, lo que impide determinar si el uso comercial está permitido.
- El repositorio tiene cero descargas y cero likes, y no hay evidencia de validación externa.
- No se especifican la arquitectura de red, los hiperparámetros de entrenamiento ni la función de recompensa, lo que dificulta la reproducibilidad.
- La puntuación de 0,844 de la política base carece de definición métrica en la información disponible.
- El modelo está diseñado exclusivamente para el robot microduck y el slot `walk`; no es reutilizable fuera de ese ecosistema.
- No hay información sobre sesgos, alucinación ni comportamiento en dominios no previstos, más allá de lo que implica una política de control reactiva.
- Al ser un reentrenamiento diario, puede presentar variabilidad respecto a la política base sin que se documenten las diferencias.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dashi/microduck-sprint-daily-20261107
- Modelo base: https://huggingface.co/jrubiosainz/microduck-game-sprinter-remix3
- Perfil del autor: https://huggingface.co/dashi
- Repositorio microduck: https://github.com/pollen-robotics/microduck
- Repositorio de entrenamiento RL: `pollen-robotics/microduck_rl` (rama `roll-backward`, commit `83599404a`)
- Manifiesto de políticas (schema 2): `docs/policy-manifest.md` en el repositorio del daemon
