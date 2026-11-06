# rumezhak/microduck-sock-heist-second-green

## Resumen

sock-heist-second-green es una política de control para el robot cuadrúpedo microduck, desarrollado por el ecosistema de Pollen Robotics. El modelo, publicado por el usuario rumezhak, implementa una marcha (gait) perpetua entrenada mediante aprendizaje por refuerzo y empaquetada en formato ONNX para su ejecución directa sobre el robot. No se trata de un modelo de lenguaje ni de un modelo generativo de propósito general, sino de un controlador de política neuronal que mapea observaciones de sensores a acciones de actuadores a 50 Hz.

La política consume un vector de observación de 61 dimensiones y produce 14 acciones de control, correspondientes a la cinemática del robot microduck. El modelo se distribuye como un fichero `policy.onnx` con el normalizador de observaciones integrado, de modo que la política acepta observaciones en crudo, más un `manifest.json` que sigue el esquema 2 del manifiesto de políticas de microduck. Su relevancia es acotada pero concreta: permite cargar una marcha entrenada en una ranura de política del daemon `robotctl` sin necesidad de reentrenar ni de preprocesar observaciones manualmente.

El repositorio es de tamaño prácticamente nulo (0.0 GB reportados), sin descargas ni interacciones registradas, y no incluye información sobre licencia, idiomas ni resultados de evaluación. Se desconoce igualmente el procedimiento de entrenamiento más allá de la referencia al repositorio `pollen-robotics/microduck_rl`, rama `main`, commit `5cee942d8`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (política neuronal de control; se desconoce la topología concreta) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (no es un modelo de lenguaje; ventana de observación de 61 dimensiones por paso) |
| Tipos de cuantizacion | no disponible (se distribuye en ONNX; se desconoce si existe versión cuantizada) |
| Idiomas soportados | no disponible (no aplica; el modelo no procesa lenguaje) |
| Licencia | no disponible |
| Formato de pesos | ONNX (`policy.onnx`) más `manifest.json` (esquema 2 del manifiesto de políticas de microduck) |
| Dimension de observacion | 61 |
| Dimension de accion | 14 |
| Frecuencia de control | 50 Hz |
| Tipo de política | perpetua (se ejecuta de forma continua hasta recibir orden de parada) |
| Libreria / runtime | microduck |
| Pipeline (Hugging Face) | robotics |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna de la red neuronal: la model card no detalla número de capas, tipo de red (MLP, recurrente, transformer ligero u otra), función de activación ni tamaño de los pesos. Lo único confirmado es que la política se exporta a ONNX y que el normalizador de observaciones está integrado en el propio grafo de `policy.onnx`, lo que implica que el modelo recibe observaciones crudas del robot y aplica la normalización internamente antes de la inferencia.

El entrenamiento se realizó mediante aprendizaje por refuerzo, según la etiqueta `reinforcement-learning` y la referencia al repositorio `pollen-robotics/microduck_rl` (rama `main`, commit `5cee942d8`). No se especifican el algoritmo de RL empleado (PPO, SAC u otro), el número de pasos de entorno, la función de recompensa, el dominio de aleatorización ni la composición del dataset de entrenamiento. Tampoco se documenta si hubo ajuste fino posterior o destilación. La política se describe como "perpetua", es decir, un gait cíclico destinado a ejecutarse de forma continua en una ranura de política del daemon, sin condición de terminación interna.

## Capacidades

- Control locomotor continuo del robot cuadrúpedo microduck mediante una marcha (gait) perpetua.
- Mapeo directo de observaciones de 61 dimensiones a 14 acciones de actuador a 50 Hz.
- Normalización de observaciones integrada en el modelo ONNX: acepta observaciones en crudo sin preprocesado externo.
- Carga y ejecución mediante el comando `robotctl policy load <slot> rumezhak/microduck-sock-heist-second-green` en una ranura de política del daemon.
- Compatibilidad con el esquema 2 del manifiesto de políticas de microduck (`manifest.json`).
- No soporta tool calling, function calling, razonamiento multi-paso, procesamiento de lenguaje, visión, audio ni ninguna capacidad generativa.

## Casos de uso

- Locomoción continua en robótica de investigación: la política se carga en una ranura del daemon y proporciona una marcha estable a 50 Hz para experimentos de locomoción con el microduck, sin necesidad de entrenar un controlador propio.
- Demostraciones y prototipado rápido: al estar empaquetada en ONNX con normalizador integrado, permite poner el robot a andar en minutos mediante un único comando `robotctl policy load`, útil para validar hardware o montajes.
- Base de comparación en experimentos de RL: sirve como política de referencia (baseline) frente a marchas entrenadas por el propio investigador en el mismo repositorio `microduck_rl`.
- Pruebas de integración del daemon: al seguir el esquema 2 del manifiesto, se puede emplear para verificar el flujo de carga de políticas, gestión de ranuras y ejecución a 50 Hz en el daemon de microduck.
- Docencia y talleres de robótica: una marcha perpetua preentrenada reduce la barrera de entrada para ejercicios prácticos de control y aprendizaje por refuerzo sobre un cuadrúpedo de bajo coste.
- Evaluación de robustez de políticas en hardware real: ejecutar la política de forma continua permite observar deriva, estabilidad y comportamiento del gait en distintas superficies, como paso previo a un reentrenamiento con dominio aleatorizado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de recompensa, tasa de éxito, velocidad de desplazamiento, estabilidad ni comparaciones con otras políticas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. Al tratarse de una política de control de dimensiones reducidas (61 observaciones, 14 acciones) y distribuirse en ONNX, es previsible que el modelo sea muy ligero, pero no se confirma el número de parámetros ni el tamaño del fichero.
- GPU recomendadas: no disponible. La inferencia a 50 Hz de una política de este tipo es habitualmente viable en CPU; no se documenta si el daemon requiere GPU.
- Compatibilidad con GPU de consumo: no confirmada; probablemente innecesaria dado el tamaño del repositorio (0.0 GB reportados), pero no hay dato oficial.
- Opciones de despliegue: runtime `microduck` a través del daemon `robotctl` (comando `robotctl policy load <slot> ...`). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: frecuencia de control fijada en 50 Hz (periodo de 20 ms por paso). No se publican latencias de inferencia medidas ni throughput.

## Comparativa con modelos similares

| Modelo | Tipo | Dimension observacion | Dimension accion | Frecuencia | Formato | Licencia |
|---|---|---|---|---|---|---|
| sock-heist-second-green (rumezhak) | Política RL para microduck | 61 | 14 | 50 Hz | ONNX | no disponible |
| Otras políticas de microduck en Hugging Face | Política RL para microduck | no disponible | no disponible | no disponible | no disponible | no disponible |
| Políticas de otros cuadrúpedos (p. ej. Unitree, ANYmal) | Política RL específica de plataforma | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información suficiente para establecer una comparativa cuantitativa con alternativas concretas. Las políticas de control son específicas del robot y de su espacio de observación/acción, por lo que no son intercambiables entre plataformas sin reentrenamiento.

## Limitaciones y advertencias

- Específica del hardware: la política está entrenada para el microduck (61 observaciones, 14 acciones, 50 Hz) y no es portable a otros robots sin reentrenamiento.
- Licencia no disponible: no se puede confirmar el uso comercial ni la redistribución; conviene contactar con el autor antes de integrarla en un producto.
- Ausencia de documentación técnica: no se detallan arquitectura, número de parámetros, algoritmo de RL, recompensa ni procedimiento de entrenamiento, lo que dificulta la reproducibilidad.
- Sin métricas de evaluación: no hay datos de robustez, estabilidad, velocidad ni comportamiento ante perturbaciones o terrenos distintos.
- Repositorio sin tracción: 0 descargas y 0 likes en el momento de la consulta, sin evidencia de validación por parte de la comunidad.
- Riesgo de comportamiento inesperado en hardware real: al ser una marcha perpetua sin condición de terminación interna, requiere supervisión y mecanismos externos de parada segura.
- Idiomas y sesgos: no aplica el análisis de sesgos lingüísticos al no ser un modelo de lenguaje; no se documentan sesgos de política (por ejemplo, asimetrías de gait) por falta de información.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/rumezhak/microduck-sock-heist-second-green
- Repositorio de microduck (Pollen Robotics): https://github.com/pollen-robotics/microduck
- Repositorio de entrenamiento RL referenciado: `pollen-robotics/microduck_rl` (rama `main`, commit `5cee942d8`)
- Documentación del manifiesto de políticas: `docs/policy-manifest.md` en el repositorio del daemon de microduck
