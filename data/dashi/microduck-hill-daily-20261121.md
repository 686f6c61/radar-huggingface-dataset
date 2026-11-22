# dashi/microduck-hill-daily-20261121

## Resumen

`dashi/microduck-hill-daily-20261121` es una política de control motriz entrenada por refuerzo (reinforcement learning) para el robot cuadrúpedo de bajo coste microduck, desarrollado por Pollen Robotics. No es un modelo de lenguaje: es una política perpetua que genera comandos de locomocion a 50 Hz a partir de observaciones de 61 dimensiones y produce 14 acciones de control articular. Se publica en formato ONNX y se carga directamente en el daemon del robot mediante el comando `robotctl policy load walk`.

El modelo es un fine-tune (re-entrada diaria) de `jrubiosainz/microduck-game-hillclimber-remix6`, que a su vez deriva de `dashi/microduck-hill-remix-r752` (con una métrica de 0,749, presumiblemente de recompensa media). Está especializado en el slot de marcha `walk` y está pensado para ejecutarse de forma continua hasta que se le indique lo contrario. La relevancia actual radica en que demuestra un flujo de trabajo de entrenamiento RL reproducible y de código abierto para robótica de bajo coste, con artefactos desplegables vía ONNX.

La información disponible es muy escasa: el repositorio ocupa 0,0 GB, no tiene descargas ni likes, no declara licencia ni idiomas, y la model card se limita a instrucciones de despliegue y metadatos de entrenamiento. No hay datos de arquitectura de red, número de parámetros ni benchmarks publicados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (política de control RL, artefacto ONNX) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (política reactiva; observación de 61 dimensiones por paso) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (modelo de robótica, no de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | ONNX (`policy.onnx`) + `manifest.json` (schema 2 del manifiesto de políticas microduck) |
| Frecuencia de control | 50 Hz |
| Dimension de observacion | 61 |
| Dimension de accion | 14 |
| Slot de política | `walk` |
| Modelo base | `jrubiosainz/microduck-game-hillclimber-remix6` |
| Metrica reportada | 0,749 (en la política de origen `microduck-hill-remix-r752`) |

## Arquitectura y entrenamiento

No se dispone de detalles sobre la arquitectura de red de la política (número de capas, dimensión de las capas ocultas, tipo de red —MLP, CNN, recurrente— ni función de activación). Lo que sí se documenta es la interfaz: entrada de 61 dimensiones de observación, salida de 14 acciones, a 50 Hz, con un normalizador de observaciones embebido en el propio `policy.onnx`, de modo que el consumidor debe alimentar observaciones en bruto.

El entrenamiento se realizó con el repositorio `pollen-robotics/microduck_rl`, rama `roll-backward`, commit `83599404a`. Se trata de un fine-tune del modelo `jrubiosainz/microduck-game-hillclimber-remix6` y se describe como "re-entrada diaria" de `dashi/microduck-hill-remix-r752` con una métrica de 0,749. No se especifican el algoritmo RL concreto (PPO, SAC, etc.), el número de pasos de entorno, la función de recompensa ni la composición del dataset de entrenamiento.

## Capacidades

- Locomoción cuadrúpeda continua: genera una marcha para el slot `walk` del microduck de forma perpetua hasta recibir una orden de parada.
- Control reactivo a 50 Hz a partir de observaciones de 61 dimensiones (estado de articulaciones, sensores del robot, etc., según la interfaz del daemon).
- Despliegue directo en hardware: se carga con `robotctl policy load walk dashi/microduck-hill-daily-20261121`.
- Autocontenido en inferencia: el normalizador de observaciones está embebido en el ONNX, por lo que no requiere preprocesado externo.
- Compatible con el manifiesto de políticas microduck schema 2.
- No soporta tool calling, agentes, razonamiento multi-paso, visión, audio ni capacidades multilingües: es una política motriz, no un modelo generativo.

## Casos de uso

- Locomoción en terreno con pendiente: al derivar de un modelo entrenado en un entorno tipo "hillclimber", la política está pensada para mantener la marcha en superficies inclinadas o irregulares, usando la observación completa del robot para corregir la postura en cada ciclo de 50 Hz.
- Demostración educativa de RL para robótica: sirve como artefacto listo para cargar en un microduck real en talleres o cursos, ya que el flujo `robotctl policy load` elimina la necesidad de compilar o exportar el modelo.
- Investigación en transferencia sim-a-real: al estar entrenada en `microduck_rl` y desplegarse vía ONNX, permite comparar el comportamiento simulado con el real y medir la brecha de realidad.
- Base para fine-tuning de nuevas marchas: el modelo se puede usar como punto de partida para entrenar variantes (terrenos, velocidades, estilos de marcha) sobre el mismo slot `walk`.
- Evaluación de robustez de políticas perpetuas: su naturaleza "runs until told otherwise" permite dejarla corriendo durante sesiones largas para medir deriva, consumo energético o degradación de la marcha.
- Integración en pipelines de robótica de bajo coste: al ser un ONNX ligero y autocontenido, se puede ejecutar en el propio robot o en un companion computer sin dependencias de frameworks de deep learning pesados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La única métrica mencionada es 0,749, asociada a la política de origen `dashi/microduck-hill-remix-r752`, sin que se especifique qué mide ni con qué protocolo.

## Requisitos de hardware

- VRAM estimada: no disponible; al ser una política de control de pequeña dimensión y formato ONNX, es presumible que quepa en memoria de un robot o de un companion computer, pero no se publican cifras.
- GPU recomendadas: no disponibles. Por el tipo de artefacto (ONNX, 50 Hz, observación de 61 dimensiones), la inferencia en CPU es plausible, pero no está documentado.
- ¿Cabe en GPU consumer? No disponible. Lo esperable es que sí, e incluso en CPU, pero no hay confirmación del autor.
- Opciones de despliegue: `robotctl` (daemon de microduck) cargando `policy.onnx`; también es posible usar ONNX Runtime de forma genérica, aunque no está documentado por el autor.
- Latencia y throughput: no disponibles. El único dato es la frecuencia de control de 50 Hz, que fija un presupuesto de 20 ms por ciclo.

## Comparativa con modelos similares

No disponible. No se han identificado en la información proporcionada políticas comparables de otros autores para el mismo robot o para tareas equivalentes, ni se dispone de datos de parámetros, contexto o rendimiento de alternativas.

## Limitaciones y advertencias

- Información muy escasa: no se declara licencia, idiomas, arquitectura ni número de parámetros, lo que impide evaluar su idoneidad para uso comercial o su reproducibilidad.
- Licencia no disponible: sin licencia explícita, el uso comercial y la redistribución quedan en un limbo legal; conviene contactar con el autor antes de integrarlo en productos.
- Especialización estrecha: es una política para el slot `walk` del microduck; no es un modelo de propósito general ni transferible a otros robots sin reentrenamiento.
- Sin benchmarks ni métricas de éxito documentadas: la única cifra (0,749) no está definida, por lo que no se puede comparar su rendimiento con alternativas.
- Riesgo de sobreajuste al simulador: al derivar de un entorno de entrenamiento concreto (`microduck_rl`, rama `roll-backward`), el comportamiento en el robot real puede degradarse respecto al simulado; no se documenta ninguna validación sim-a-real.
- Naturaleza "perpetua": la política corre hasta que se le indica lo contrario, lo que exige mecanismos externos de parada segura y supervisión en producción.
- Repositorio vacío en la práctica (0,0 GB, 0 descargas, 0 likes): no hay evidencia de uso comunitario ni de mantenimiento.
- Los resultados de búsqueda web recibidos tratan sobre el caldo japonés *dashi* y no guardan relación con el modelo; se descartan por irrelevantes.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dashi/microduck-hill-daily-20261121
- Modelo base: https://huggingface.co/jrubiosainz/microduck-game-hillclimber-remix6
- Repositorio de entrenamiento: `pollen-robotics/microduck_rl` (rama `roll-backward`, commit `83599404a`)
- Proyecto microduck: https://github.com/pollen-robotics/microduck
- Documentación del manifiesto de políticas: `docs/policy-manifest.md` en el repositorio del daemon
