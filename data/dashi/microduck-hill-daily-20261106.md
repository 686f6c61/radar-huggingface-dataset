# dashi/microduck-hill-daily-20261106

## Resumen

`dashi/microduck-hill-daily-20261106` es una política de control para el robot cuadrúpedo de código abierto microduck, desarrollado por Pollen Robotics. No se trata de un modelo de lenguaje, sino de una política de aprendizaje por refuerzo exportada a ONNX que genera comandos motores a 50 Hz a partir de observaciones de 61 dimensiones y produce 14 acciones de control. El modelo está etiquetado para el slot `walk`, es decir, la marcha de locomoción del robot.

La política es una reentrada diaria ("daily re-entry") del modelo `dashi/microduck-hill-remix-r752`, que obtuvo una puntuación de 0,749, y constituye un finetune de `jrubiosainz/microduck-game-hillclimber-remix6`. El autor la describe como una política "perpetua": se ejecuta de forma continua hasta que se le indique lo contrario. El repositorio tiene un tamaño de 0,0 GB, sin descargas ni likes en el momento de la consulta, lo que sugiere un artefacto experimental de publicación reciente.

Por su naturaleza (política de robótica y no modelo generativo), esta ficha adapta la estructura habitual: los apartados de arquitectura, capacidades y benchmarks se interpretan en términos de control motor y aprendizaje por refuerzo, no de procesamiento de lenguaje natural.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Política de aprendizaje por refuerzo exportada a ONNX (no disponible el detalle de la red) |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica; observación de 61 dimensiones por paso |
| Tipos de cuantización | no disponible (pesos en ONNX) |
| Idiomas soportados | no aplica (modelo de control robótico) |
| Licencia | no disponible |
| Formato de pesos | ONNX (`policy.onnx`) + `manifest.json` (esquema 2) |
| Frecuencia de control | 50 Hz |
| Dimensiones de observación | 61 |
| Dimensiones de acción | 14 |
| Slot de política | `walk` |
| Modelo base | `jrubiosainz/microduck-game-hillclimber-remix6` (finetune) |
| Repositorio de entrenamiento | `pollen-robotics/microduck_rl`, rama `roll-backward`, commit `83599404a` |

## Arquitectura y entrenamiento

La información disponible no detalla la topología interna de la red neuronal (número de capas, tipo de capas o función de activación). Lo que sí se especifica es que se trata de una política de aprendizaje por refuerzo entrenada mediante el repositorio `pollen-robotics/microduck_rl`, en la rama `roll-backward` y en el commit `83599404a`. La política se exporta a ONNX con el normalizador de observaciones integrado en `policy.onnx`, de modo que el robot alimenta observaciones en bruto sin preprocesado externo.

El modelo es un finetune de `jrubiosainz/microduck-game-hillclimber-remix6`, y el autor lo describe como una reentrada diaria del modelo `dashi/microduck-hill-remix-r752` con puntuación 0,749. El entrenamiento se enmarca en un flujo de trabajo de remezclas sucesivas ("remix") sobre políticas previas, orientado a la marcha del robot en terrenos tipo colina. No se dispone de datos sobre número de pasos de entrenamiento, composición del dataset ni uso de técnicas como RLHF o DPO, que no aplican a este dominio.

## Capacidades

- Control de locomoción del microduck: genera 14 acciones motoras a partir de 61 observaciones a 50 Hz.
- Marcha continua ("perpetua"): la política está diseñada para ejecutarse indefinidamente hasta recibir una orden de parada.
- Ocupación del slot `walk`: se carga como política de marcha dentro del daemon del robot.
- Normalización integrada: acepta observaciones en bruto gracias al normalizador embebido en el ONNX.
- Adaptación a terreno tipo colina: derivada del linaje `hillclimber` y de las remezclas previas.
- Despliegue directo en robot: carga mediante el comando `robotctl policy load walk dashi/microduck-hill-daily-20261106`.
- No dispone de capacidades de lenguaje, visión, tool calling ni razonamiento multi-paso; es exclusivamente una política de control motor.

## Casos de uso

- Locomoción autónoma del microduck: cargar la política en el slot `walk` para que el robot camine de forma continua en pruebas de laboratorio, aprovechando su diseño de ejecución perpetua.
- Investigación en aprendizaje por refuerzo: servir como punto de partida o referencia para comparar políticas de marcha dentro del ecosistema `microduck_rl`, dado su linaje documentado y su commit de entrenamiento identificable.
- Experimentos de remezcla de políticas: al ser un finetune de `hillclimber-remix6`, permite estudiar el efecto de reentrenamientos sucesivos sobre el rendimiento en locomoción.
- Validación de pipelines de despliegue: útil para verificar el flujo `robotctl policy load` y el formato de manifiesto (esquema 2) en el daemon del robot.
- Pruebas de robustez en terreno inclinado: el origen "hillclimber" sugiere su uso en escenarios de pendiente, aunque no se publican métricas que lo confirmen.
- Docencia y demostraciones de robótica de código abierto: al integrarse en el stack de Pollen Robotics, sirve para ilustrar el ciclo completo de entrenamiento, exportación a ONNX y despliegue en hardware.
- Reproducibilidad de experimentos: el commit y la rama de entrenamiento permiten reconstruir el entorno de entrenamiento para auditoría o replicación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El único dato numérico es la puntuación de 0,749 del modelo predecesor `dashi/microduck-hill-remix-r752`, pero no se especifica la métrica ni el entorno de evaluación, por lo que no se puede presentar como benchmark comparable.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; al ser una política pequeña exportada a ONNX y con un repositorio de 0,0 GB, es probable que quepa en CPU, pero no se confirma en la información.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no confirmada; el despliegue previsto es en el propio robot microduck, no en estaciones de trabajo.
- Opciones de despliegue: daemon del microduck mediante `robotctl policy load walk dashi/microduck-hill-daily-20261106`; runtime ONNX.
- Latencia y throughput: la política opera a 50 Hz (20 ms por paso), según la model card; no se publican cifras de latencia de inferencia.

## Comparativa con modelos similares

| Modelo | Tipo | Slot | Puntuación | Formato | Licencia |
|---|---|---|---|---|---|
| `dashi/microduck-hill-daily-20261106` | Política RL (finetune) | `walk` | no disponible | ONNX | no disponible |
| `dashi/microduck-hill-remix-r752` | Política RL (predecesor) | no disponible | 0,749 | no disponible | no disponible |
| `jrubiosainz/microduck-game-hillclimber-remix6` | Política RL (base) | no disponible | no disponible | no disponible | no disponible |
| `dashi/microduck-hill-daily-20261101` | Política RL (daily) | no disponible | no disponible | ONNX | no disponible |
| `dashi/microduck-hill-daily-20261102` | Política RL (daily) | no disponible | no disponible | ONNX | no disponible |

No se dispone de información sobre parámetros, contexto ni rendimiento detallado de las alternativas; la comparación se limita a lo publicado en los identificadores y model cards accesibles.

## Limitaciones y advertencias

- Licencia no especificada: no se puede confirmar el uso comercial ni la redistribución; es un riesgo relevante para producción.
- Sin métricas de evaluación publicadas: no hay benchmarks que permitan estimar el rendimiento real de esta política frente a sus predecesoras.
- Específica de hardware: diseñada exclusivamente para el microduck de Pollen Robotics; no es transferible a otras plataformas sin reentrenamiento.
- Sin capacidades de lenguaje ni percepción general: no debe evaluarse como modelo generativo.
- Riesgo de comportamiento no deseado en entornos no vistos: al ser una política de RL, su robustez fuera de las condiciones de entrenamiento (terreno tipo colina) no está documentada.
- Repositorio sin descargas ni validación comunitaria: artefacto experimental reciente, sin evidencia de uso en producción.
- Dependencia de la versión del daemon: el manifiesto sigue el esquema 2, por lo que requiere una versión compatible del software del robot.
- No se documentan sesgos ni alucinaciones en el sentido de modelos de lenguaje; el equivalente sería un comportamiento motor impredecible, no cuantificado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dashi/microduck-hill-daily-20261106
- Modelo base: https://huggingface.co/jrubiosainz/microduck-game-hillclimber-remix6
- Predecesor citado: `dashi/microduck-hill-remix-r752` (referenciado en la model card; sin URL directa en la información disponible)
- Entradas diarias relacionadas: https://huggingface.co/dashi/microduck-hill-daily-20261101 y https://huggingface.co/dashi/microduck-hill-daily-20261102
- Repositorio del robot microduck: https://github.com/pollen-robotics/microduck
- Repositorio de entrenamiento: `pollen-robotics/microduck_rl` (rama `roll-backward`, commit `83599404a`; sin URL directa en la información disponible)
- Documentación del manifiesto de políticas: `docs/policy-manifest.md` en el repositorio del daemon (sin URL directa en la información disponible)
