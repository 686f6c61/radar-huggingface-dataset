# dashi/microduck-sprint-daily-20261120

## Resumen

microduck-sprint-daily-20261120 es una política de control para el robot cuadrúpedo microduck, desarrollada por el usuario dashi como reentrada diaria (daily re-entry) de su modelo previo dashi/microduck-sprint-remix-r844, que alcanzó una puntuación de 0.844. No se trata de un modelo de lenguaje, sino de una política de refuerzo (reinforcement learning) exportada a ONNX que se ejecuta en el daemon del robot para generar una marcha (gait) perpetua en el slot `walk`. El modelo es un finetune de jrubiosainz/microduck-game-sprinter-remix3 y está pensado para ser cargado directamente en hardware físico mediante `robotctl`.

La política opera a 50 Hz, consume observaciones de 61 dimensiones y produce 14 acciones. El normalizador de observaciones está embebido dentro de `policy.onnx`, de modo que el robot puede alimentar observaciones crudas sin preprocesamiento externo. El repositorio tiene un tamaño de 0.0 GB (vacío o prácticamente vacío en el momento de la consulta) y cero descargas, lo que sugiere un artefacto recién publicado o incompleto.

Por su naturaleza (política de robotics con licencia no disponible e idiomas no aplicables), esta ficha debe leerse como documentación de un artefacto de control motriz, no como un modelo generativo. La información técnica disponible es muy limitada y muchos campos quedan como "no disponible".

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (política de reinforcement learning exportada a ONNX) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (observación de 61 dimensiones por paso, sin ventana de contexto declarada) |
| Tipos de cuantizacion | no disponible (formato ONNX; no se declaran cuantizaciones) |
| Idiomas soportados | no disponible (no aplica; política motriz) |
| Licencia | no disponible |
| Formato de pesos | ONNX (`policy.onnx`) + `manifest.json` (schema 2 del microduck policy manifest) |

Otros datos relevantes: frecuencia de control 50 Hz, 14 acciones, slot `walk`, pipeline `robotics`, librería `microduck`.

## Arquitectura y entrenamiento

La arquitectura interna de la red no está documentada en la model card. Se sabe que es una política entrenada con reinforcement learning en el repositorio `pollen-robotics/microduck_rl`, rama `roll-backward`, commit `83599404a`, y que se exporta a ONNX para inferencia en el robot. La política es un finetune de jrubiosainz/microduck-game-sprinter-remix3, que a su vez deriva de un entrenamiento previo del mismo autor (dashi/microduck-sprint-remix-r844, puntuación 0.844).

El modelo se describe como "perpetual": una marcha que se ejecuta de forma continua hasta que se le indique lo contrario, lo que implica que no tiene un horizonte de episodio fijo en su uso previsto. El normalizador de observaciones está integrado en el propio grafo ONNX, una decisión de ingeniería que simplifica el despliegue al eliminar la dependencia de un pipeline de normalización separado en el daemon. No se dispone de información sobre el número de tokens, composición del dataset, uso de RLHF/DPO ni innovaciones de decodificación, ya que no aplica a este tipo de artefacto.

## Capacidades

- Control motriz de marcha (gait) para el robot microduck en el slot `walk`.
- Generación de una política perpetua que se mantiene activa hasta recibir una orden de parada.
- Consumo de observaciones crudas de 61 dimensiones a 50 Hz, con normalización embebida en el ONNX.
- Producción de 14 acciones de control por paso.
- Integración con el daemon del robot mediante `robotctl policy load walk`.
- Compatibilidad con el schema 2 del manifiesto de políticas de microduck.
- No se declaran capacidades de generación de texto, razonamiento, código, matemáticas, visión, tool calling, agentes, multilingüismo, thinking mode, audio ni ninguna otra capacidad cognitiva.

## Casos de uso

- Locomoción continua en el robot microduck: cargar la política en el slot `walk` con `robotctl policy load walk dashi/microduck-sprint-daily-20261120` permite que el robot mantenga una marcha perpetua sin intervención, adecuada para demostraciones de desplazamiento sostenido.
- Pruebas de gait en laboratorio: al ser una reentrada diaria de un modelo puntuado (0.844), sirve como referencia para comparar variantes de marcha en experimentos de RL sobre el mismo robot.
- Validación de despliegue ONNX end-to-end: al llevar el normalizador embebido, permite verificar que el pipeline de inferencia del daemon funciona con observaciones crudas, útil en pruebas de integración de hardware.
- Base para finetunes posteriores: al ser un finetune de jrubiosainz/microduck-game-sprinter-remix3, puede usarse como punto de partida para entrenamientos derivados en `pollen-robotics/microduck_rl`.
- Demostraciones educativas de RL en robótica: el microduck es un robot de bajo coste y esta política permite mostrar el ciclo observación-acción a 50 Hz en talleres y cursos.
- Benchmarking interno de políticas: la puntuación 0.844 del modelo original permite usarla como línea base para comparar nuevas reentradas diarias del mismo autor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La única métrica mencionada es la puntuación 0.844 del modelo base dashi/microduck-sprint-remix-r844, pero no se especifica qué benchmark, entorno ni protocolo de evaluación la produce.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. Al ser una política ONNX de robótica, el tamaño del grafo no se declara y el repo figura con 0.0 GB, por lo que no es posible estimar memoria.
- GPU recomendadas: no disponible. La inferencia a 50 Hz en un robot microduck sugiere ejecución en CPU embebida o en hardware de bajo consumo, pero no se documenta.
- Compatibilidad con consumer GPU: no disponible.
- Opciones de despliegue: daemon de microduck vía `robotctl policy load walk`; inferencia ONNX (runtime no especificado).
- Latencia y throughput: no disponible; el único dato es la frecuencia de control de 50 Hz.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| dashi/microduck-sprint-daily-20261120 | Política RL ONNX (walk) | no disponible | no disponible (obs. 61-D) | no disponible (base 0.844) | no disponible | Hugging Face, 0 descargas |
| dashi/microduck-sprint-remix-r844 | Política RL (base del reentry) | no disponible | no disponible | 0.844 | no disponible | Hugging Face |
| jrubiosainz/microduck-game-sprinter-remix3 | Política RL (base del finetune) | no disponible | no disponible | no disponible | no disponible | Hugging Face |

No se conocen otros modelos comparables de la misma categoría (políticas microduck para el slot `walk`) en la información disponible.

## Limitaciones y advertencias

- Licencia no disponible: no se puede confirmar si el uso comercial está permitido; es imprescindible contactar con el autor antes de cualquier despliegue en producción.
- Repositorio de 0.0 GB y 0 descargas: el artefacto puede estar incompleto, en proceso de subida o ser un placeholder; verificar la integridad de `policy.onnx` y `manifest.json` antes de cargarlo en hardware.
- Model card mínima: no se documentan arquitectura, número de parámetros, dataset de entrenamiento ni protocolo de evaluación, lo que impide reproducir o auditar el modelo.
- Especialización estrecha: la política está entrenada exclusivamente para el slot `walk` del microduck; no es reutilizable en otros robots, slots ni tareas sin reentrenamiento.
- Comportamiento perpetuo: al ejecutarse hasta recibir una orden de parada, requiere mecanismos externos de seguridad y parada de emergencia en el robot.
- Riesgo de sobreajuste al entorno de entrenamiento: sin datos sobre diversidad de condiciones (terrenos, cargas, baterías), no se puede garantizar robustez fuera del entorno de entrenamiento.
- Sin datos de sesgos, alucinación o limitaciones idiomáticas: no aplican a este tipo de artefacto, pero tampoco se documentan sesgos de comportamiento motriz.
- Dependencia del daemon y del schema 2 del manifiesto: cambios de versión en el daemon de microduck pueden romper la compatibilidad de carga.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dashi/microduck-sprint-daily-20261120
- Modelo base (finetune): https://huggingface.co/jrubiosainz/microduck-game-sprinter-remix3
- Repositorio del robot microduck: https://github.com/pollen-robotics/microduck
- Repositorio de entrenamiento RL: `pollen-robotics/microduck_rl` (rama `roll-backward`, commit `83599404a`)
- Documentación del manifiesto de políticas: `docs/policy-manifest.md` en el repositorio del daemon
