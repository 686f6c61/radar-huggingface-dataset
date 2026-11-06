# RadioRambo-86/microduck-tug-upright

## Resumen

`microduck-tug-upright` es una política de control motriz entrenada por refuerzo (reinforcement learning) para el robot cuadrúpedo de bajo coste MicroDuck, desarrollado por Pollen Robotics. No es un modelo de lenguaje ni un sistema generativo de propósito general: es un controlador neuronal que mapea observaciones de 61 dimensiones (estado de sensores y articulaciones del robot) a 14 acciones de control, ejecutándose en bucle a 50 Hz. El modelo se publica como un artefacto ONNX autocontenido, con el normalizador de observaciones embebido en el propio grafo, listo para cargarse en una ranura de política del daemon `robotctl`.

La tarea concreta es `Mjlab-TugOfWar-MicroDuck`, un escenario de "tira y afloja" simulado en el que el robot debe mantener una postura erguida y ejercer tracción de forma sostenida. La política es de tipo "perpetual" (perpetua): no tiene condición de terminación interna y se ejecuta de forma continua hasta que el operador la detiene o la sustituye. Esto la diferencia de políticas episódicas que se reinician tras un número fijo de pasos.

El modelo es relevante en el nicho de robótica de bajo coste y aprendizaje por refuerzo aplicado a hardware real: demuestra un flujo de trabajo reproducible (semilla, commit, `uv.lock` y comando de entrenamiento documentados) sobre el simulador mjlab, y empaqueta el resultado en un formato ONNX portable con un manifiesto versionado. El repositorio es extremadamente pequeño (0,0 GB reportados) y no cuenta con descargas ni interacciones en el momento de la consulta.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Red neuronal de política para control (entrenada con RL en mjlab); topología interna no disponible |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (no es un modelo de lenguaje; observación de 61 dimensiones por paso) |
| Tipos de cuantización | no disponible (artefacto distribuido en ONNX) |
| Idiomas soportados | no disponible (no procesa lenguaje) |
| Licencia | no disponible |
| Formato de pesos | ONNX (`policy.onnx`) + `manifest.json` (schema 2 del manifiesto de políticas de microduck) |

## Arquitectura y entrenamiento

La información disponible no detalla la topología interna de la red (número de capas, anchura, tipo de capas). Lo que sí se documenta es el contrato de interfaz: entrada de 61 dimensiones (observación cruda, con normalización embebida en el grafo ONNX) y salida de 14 acciones, ejecutada a 50 Hz. El modelo se distribuye como un único `policy.onnx` acompañado de un `manifest.json` que sigue el esquema 2 del manifiesto de políticas del daemon microduck.

El entrenamiento se realizó con aprendizaje por refuerzo en el simulador mjlab, sobre la tarea `Mjlab-TugOfWar-MicroDuck`, usando el repositorio `microduck-challenges` (rama `upright1`, commit `2ed756e99`), base `mjlab-microduck 0.1.0 @ 1efd853be`, checkpoint 250, semilla 6, con 4096 entornos paralelos y hasta 500 iteraciones del agente. El autor advierte explícitamente que el entrenamiento no es reproducible bit a bit entre máquinas: repetir el proceso con el mismo código, `uv.lock`, comando y semilla produce una política comparable, no idéntica.

## Capacidades

- Control motriz continuo de un robot cuadrúpedo MicroDuck: genera 14 acciones a partir de 61 observaciones a 50 Hz.
- Ejecución perpetua: la política no termina por sí misma; corre hasta que se detiene o se reemplaza.
- Mantenimiento de postura erguida y tracción sostenida en el escenario de tira y afloja.
- Normalización de observaciones integrada en el modelo: acepta observaciones crudas sin preprocesado externo.
- Carga en hardware real mediante el comando `robotctl policy load <slot> RadioRambo-86/microduck-tug-upright`.
- No soporta tool calling, function calling, agentes de múltiples pasos, ni capacidades multilingües: no es un modelo de lenguaje.
- No dispone de modo de razonamiento (thinking), visión ni audio.

## Casos de uso

- Investigación en aprendizaje por refuerzo aplicado a robótica: sirve como política de referencia reproducible para comparar variantes de entrenamiento sobre la tarea `Mjlab-TugOfWar-MicroDuck`, con semilla, commit y comando documentados.
- Demostración de tira y afloja con MicroDuck: la política mantiene tracción y postura erguida de forma continua, adecuada para exhibiciones o validación de hardware en laboratorio.
- Prueba de integración del daemon `robotctl`: permite verificar el flujo de carga de políticas en ranuras, la lectura del `manifest.json` (schema 2) y la ejecución de un grafo ONNX con normalizador embebido.
- Benchmark de simulación a realidad (sim-to-real): al ser una política entrenada en mjlab y ejecutable en el robot físico, sirve para medir la brecha de rendimiento entre simulación y hardware en una tarea de contacto sostenido.
- Base para ajuste fino o destilación: el checkpoint y el pipeline de entrenamiento publicados permiten partir de esta configuración (4096 entornos, 500 iteraciones, semilla 6) para entrenar variantes con otros parámetros.
- Validación de despliegue ONNX en sistemas embebidos: el artefacto es un grafo ONNX autocontenido, útil para probar latencia y compatibilidad de runtimes ONNX en la electrónica del MicroDuck.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el tamaño del repositorio se reporta como 0,0 GB y el artefacto es un ONNX de política de control, por lo que la huella esperada es muy reducida, pero no se confirma en la información proporcionada.
- GPU recomendadas: no disponibles. Para el entrenamiento se emplearon 4096 entornos paralelos en GPU (el autor menciona GPU RL), pero no se especifica el modelo de GPU utilizado.
- ¿Cabe en GPU de consumo? No confirmado en la información disponible; por el tipo de artefacto (política de control en ONNX) es plausible, pero no se aporta dato verificable.
- Opciones de despliegue: el método documentado es el daemon `robotctl` de microduck (`sudo robotctl policy load <slot> RadioRambo-86/microduck-tug-upright`). Al ser ONNX, es compatible en principio con runtimes ONNX, aunque no se documentan otras vías de despliegue.
- Latencia y throughput: la política está diseñada para ejecutarse a 50 Hz (periodo de 20 ms por paso), según la model card. No se publican cifras de latencia real ni de throughput.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye otras políticas para MicroDuck ni modelos comparables de la misma categoría (control motriz por RL para cuadrúpedos de bajo coste) con datos verificables de parámetros, contexto o rendimiento.

## Limitaciones y advertencias

- El modelo es una política de control específica para la tarea `Mjlab-TugOfWar-MicroDuck`; no es un modelo de propósito general y no debe esperarse comportamiento fuera del escenario entrenado.
- La licencia no está disponible, lo que impide confirmar si se permite el uso comercial. Ante la ausencia de licencia explícita, debe tratarse como uso restringido hasta aclaración con el autor.
- El entrenamiento no es reproducible bit a bit: mismos hiperparámetros y semilla producen pesos distintos entre máquinas, según advierte el propio autor.
- El repositorio no registra descargas ni interacciones, y el tamaño reportado es 0,0 GB; conviene verificar la integridad y el contenido real del artefacto antes de desplegarlo.
- No hay información sobre sesgos, tasas de alucinación (no aplica a un modelo generativo) ni evaluación de robustez sim-to-real; el rendimiento en el robot físico no está cuantificado en la información disponible.
- Depende del ecosistema microduck (`robotctl`, esquema 2 del manifiesto de políticas); su uso fuera de ese entorno requiere adaptación manual del grafo ONNX y de la interfaz de observaciones y acciones.
- No se documentan limitaciones idiomáticas porque el modelo no procesa lenguaje.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/RadioRambo-86/microduck-tug-upright
- Repositorio microduck (Pollen Robotics): https://github.com/pollen-robotics/microduck
- Repositorio de retos y entrenamiento: https://github.com/pollen-robotics/microduck-challenges
- Documentación del manifiesto de políticas: `docs/policy-manifest.md` en el repositorio del daemon (referenciado en la model card; URL directa no disponible)
