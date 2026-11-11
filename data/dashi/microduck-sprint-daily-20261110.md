# dashi/microduck-sprint-daily-20261110

## Resumen

microduck-sprint-daily-20261110 es una política de control robótico, no un modelo de lenguaje. La publica el usuario dashi en Hugging Face como reentrada diaria de una política anterior (`dashi/microduck-sprint-remix-r844`, con recompensa 0.844) y constituye un ajuste fino (finetune) del modelo `jrubiosainz/microduck-game-sprinter-remix3`. Su propósito es dotar al robot cuadrúpedo de código abierto microduck (proyecto de Pollen Robotics) de una marcha perpetua para el slot de locomoción `walk`.

El modelo opera a 50 Hz, recibe observaciones de 61 dimensiones y emite 14 acciones de control. Se distribuye como un grafo ONNX (`policy.onnx`) con el normalizador de observaciones integrado, de modo que el robot puede alimentarlo directamente con observaciones en bruto. El repositorio tiene un tamaño de 0.0 GB, lo que sugiere pesos muy ligeros o un artefacto mínimo.

Su relevancia es acotada: se trata de un artefacto experimental de robótica con refuerzo, sin benchmarks publicados, sin licencia declarada y sin métricas de rendimiento más allá del score 0.844 heredado de la política de la que deriva. No es un modelo de propósito general ni compite con modelos fundacionales; su interés reside en la reproducibilidad del pipeline de entrenamiento y en su integración directa con el daemon de microduck.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (política de reinforcement learning exportada a ONNX; arquitectura de red no declarada) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (observación de 61 dimensiones por paso, sin ventana de contexto textual) |
| Tipos de cuantizacion | no disponible (se distribuye como ONNX; no se declaran variantes cuantizadas) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | ONNX (`policy.onnx`) y `manifest.json` conforme al esquema 2 del manifiesto de políticas de microduck |

## Arquitectura y entrenamiento

La información disponible no detalla la topología de la red (número de capas, dimensión oculta, tipo de capa). Se sabe que es una política de reinforcement learning entrenada con el repositorio `pollen-robotics/microduck_rl`, en la rama `roll-backward`, commit `83599404a`. La política se exporta a ONNX e incorpora el normalizador de observaciones dentro del propio grafo, una decisión de ingeniería que simplifica el despliegue en el robot al eliminar el preprocesado externo.

El modelo es un finetune de `jrubiosainz/microduck-game-sprinter-remix3` y se describe como "reentrada diaria" de `dashi/microduck-sprint-remix-r844`, cuya recompensa reportada es 0.844. No se especifican el número de tokens, la composición del dataset, ni si hubo RLHF o DPO; en el contexto de robótica con refuerzo estos términos no aplican y la información sobre el entorno de simulación, la función de recompensa y el currículo de entrenamiento no está disponible.

## Capacidades

- Generación de una marcha perpetua para el slot `walk` del robot microduck, que se ejecuta de forma continua hasta que se le indique lo contrario.
- Control a 50 Hz con observaciones de 61 dimensiones y 14 acciones de salida.
- Normalización de observaciones integrada en el grafo ONNX: acepta observaciones en bruto sin preprocesado externo.
- Despliegue directo mediante el comando `robotctl policy load walk dashi/microduck-sprint-daily-20261110`.
- Compatibilidad con el manifiesto de políticas de microduck en su esquema 2.
- No dispone de capacidades de generación de texto, razonamiento, código, matemáticas, visión, audio, tool calling ni agentes multi-paso.

## Casos de uso

- Locomoción continua en el robot microduck: cargar la política en el slot `walk` y dejar que el robot camine de forma indefinida, adecuado porque la política está diseñada explícitamente como perpetua y a 50 Hz.
- Investigación en robótica con refuerzo: servir como punto de partida reproducible para experimentos de ajuste fino, dado que se documentan el repositorio, la rama y el commit de entrenamiento.
- Comparación de políticas de marcha: al ser una reentrada de una política con score 0.844, permite contrastar variantes de gait sobre la misma base `microduck-game-sprinter-remix3`.
- Demostraciones educativas del proyecto microduck: el despliegue con un único comando `robotctl` facilita talleres y pruebas de concepto sin infraestructura adicional.
- Integración en pipelines de evaluación automatizada: el formato ONNX y el manifiesto estandarizado permiten cargar la política en entornos de simulación o en el daemon del robot sin adaptadores personalizados.
- Pruebas de robustez del daemon microduck: al ser un artefacto ligero (0.0 GB) y con normalizador embebido, resulta útil para validar el ciclo de carga y ejecución de políticas en el esquema 2 del manifiesto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El único dato numérico es el score 0.844 de la política predecesora (`dashi/microduck-sprint-remix-r844`), que no constituye un benchmark estandarizado ni se acompaña de la definición de la métrica.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el tamaño del repositorio es de 0.0 GB y la arquitectura de red no se declara, por lo que no puede estimarse con rigor.
- GPU recomendadas: no disponible; el modelo se ejecuta en el propio robot microduck a través del daemon, no se documenta hardware de inferencia externo.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: daemon de microduck mediante `robotctl policy load walk dashi/microduck-sprint-daily-20261110`; el artefacto es ONNX y podría ejecutarse con runtimes ONNX estándar, aunque no se documenta.
- Latencia y throughput: frecuencia de control de 50 Hz declarada; no se publican cifras de latencia por inferencia ni de throughput.

## Comparativa con modelos similares

| Modelo | Tipo | Base | Slot | Frecuencia | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| dashi/microduck-sprint-daily-20261110 | Política RL (ONNX) | jrubiosainz/microduck-game-sprinter-remix3 | walk | 50 Hz | no disponible | Hugging Face |
| dashi/microduck-sprint-remix-r844 | Política RL | no disponible | no disponible | no disponible | no disponible | Hugging Face (referenciado) |
| jrubiosainz/microduck-game-sprinter-remix3 | Política RL | no disponible | no disponible | no disponible | no disponible | Hugging Face (referenciado) |

No se dispone de datos de parámetros, contexto ni rendimiento de las alternativas para una comparación cuantitativa.

## Limitaciones y advertencias

- No se declara licencia, por lo que el uso comercial queda sin autorización explícita y debe consultarse con el autor.
- No hay benchmarks ni métricas de rendimiento publicadas para esta política concreta; el score 0.844 pertenece a la política predecesora y no es directamente transferible.
- El modelo está especializado en una única tarea (marcha en el slot `walk`) y no generaliza a otras habilidades ni a otros robots.
- Al ser una "reentrada diaria", su valor como artefacto estable en producción es limitado; puede ser reemplazado por versiones posteriores.
- No se documentan sesgos, riesgos de alucinación ni limitaciones de idioma porque no es un modelo de lenguaje; estos criterios no aplican.
- La ausencia de información sobre el entorno de entrenamiento y la función de recompensa dificulta evaluar la robustez de la marcha ante perturbaciones reales.
- El tamaño de 0.0 GB en el repositorio puede indicar que los pesos no están efectivamente alojados o que el artefacto es mínimo; conviene verificar la integridad antes de desplegar.

## Enlaces

- Hugging Face: https://huggingface.co/dashi/microduck-sprint-daily-20261110
- Modelo base: https://huggingface.co/jrubiosainz/microduck-game-sprinter-remix3
- Proyecto microduck: https://github.com/pollen-robotics/microduck
- Repositorio de entrenamiento: `pollen-robotics/microduck_rl` (rama `roll-backward`, commit `83599404a`); no se proporciona URL directa en la información disponible.
- Documentación del manifiesto de políticas: `docs/policy-manifest.md` en el repositorio del daemon; no se proporciona URL directa en la información disponible.
