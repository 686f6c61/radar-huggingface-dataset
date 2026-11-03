# GinDuck/microduck-hill-climb-1m5-hill-2

## Resumen

`GinDuck/microduck-hill-climb-1m5-hill-2` es una política de control por refuerzo (reinforcement learning) entrenada para el robot cuadrúpedo de bajo coste microduck, desarrollado por Pollen Robotics. No es un modelo de lenguaje ni un modelo generativo de propósito general: es un controlador neuronal que mapea una observación de 61 dimensiones a 14 acciones de actuadores a 50 Hz, empaquetado en formato ONNX para su ejecución directa sobre el robot o en simulación.

La política resuelve una tarea concreta de locomoción: subir una rampa de 1,5 metros a máxima velocidad manteniendo la trayectoria. Según la model card del autor, completa cada episodio en aproximadamente 1,3 segundos. Se trata de una política perpetua, es decir, se ejecuta de forma continua hasta que se le indica lo contrario, y se carga en una ranura de política del demonio de control del robot mediante el comando `robotctl policy load`.

El interés de esta ficha es limitado para el público habitual de un blog de IA generativa, ya que no hay pesos de lenguaje, tokenizador, contexto ni benchmarks de razonamiento. Su relevancia radica en el ecosistema microduck como ejemplo de flujo de trabajo completo de RL para robótica: entrenamiento con mjlab, empaquetado en ONNX con normalizador integrado y despliegue con un manifiesto de política versionado. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y la licencia no está especificada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Política neuronal de reinforcement learning (detalles de capas no disponibles); empaquetada como grafo ONNX |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (no es un modelo de lenguaje); ventana de observación de 61 dimensiones por paso |
| Tipos de cuantizacion | no disponible (se distribuye como `policy.onnx`; no se documentan variantes cuantizadas) |
| Idiomas soportados | no aplica (modelo de control robótico, sin entrada/salida de texto) |
| Licencia | no disponible |
| Formato de pesos | ONNX (`policy.onnx`) más `manifest.json` con esquema 2 del manifiesto de políticas microduck |
| Frecuencia de control | 50 Hz |
| Dimensiones de observación | 61 |
| Dimensiones de acción | 14 |
| Tarea | `Mjlab-HillClimb1m5-MicroDuck` (subida de rampa de 1,5 m) |
| Checkpoint | 2250 |
| Semilla | 1 |
| Commit de entrenamiento | `b44f7ffc9` (rama `race-2`) |
| Base de simulación | `mjlab-microduck 0.1.0 @ 1efd853be` |

## Arquitectura y entrenamiento

La información disponible no detalla la topología de la red (número de capas, anchura, funciones de activación). Lo que sí se documenta es el pipeline de entrenamiento: la política se entrena con mjlab sobre la tarea `Mjlab-HillClimb1m5-MicroDuck`, definida en el repositorio `pollen-robotics/microduck-challenges`, rama `race-2`, commit `b44f7ffc9`. El entrenamiento se lanzó el 2026-11-02 con 4096 entornos paralelos, un máximo de 3000 iteraciones del agente, semilla 1 y registro en TensorBoard bajo el nombre de ejecución `hill-2`. El checkpoint final es el 2250.

El autor indica explícitamente que el entrenamiento no es bit-reproducible entre máquinas: repetir el mismo comando con el mismo `uv.lock` y la misma semilla produce una política comparable, no idénticos pesos. Esta es una advertencia relevante para cualquiera que intente auditar o replicar el resultado. La receta de entrenamiento es compartida por otro autor identificado como TheSauceman, según la model card.

Una innovación práctica destacable es que el normalizador de observaciones está integrado dentro del propio `policy.onnx`, de modo que el consumidor debe alimentar observaciones en crudo, sin preprocesado adicional. El manifiesto `manifest.json` sigue el esquema 2 documentado en `docs/policy-manifest.md` del repositorio del demonio, lo que permite cargar la política en una ranura mediante `robotctl policy load <slot> GinDuck/microduck-hill-climb-1m5-hill-2`.

## Capacidades

- Locomoción de subida de rampa: la política está especializada en ascender una pendiente de 1,5 metros priorizando velocidad y manteniendo la línea de trayectoria.
- Control continuo a 50 Hz con observación de 61 dimensiones y 14 acciones de actuadores.
- Ejecución perpetua: no tiene condición de terminación interna; corre hasta que el operador o el demonio la detengan.
- Despliegue directo en hardware mediante `robotctl`, sin necesidad de conversión adicional.
- Inferencia autocontenida: el normalizador de observaciones va embebido en el grafo ONNX.
- No soporta tool calling, function calling, razonamiento multi-paso, generación de texto, visión, audio ni capacidades multilingües, al no ser un modelo de lenguaje.

## Casos de uso

- Demostración de locomoción en microduck: cargar la política en una ranura con `robotctl policy load` y ejecutar el robot sobre una rampa de 1,5 m para mostrar la capacidad de ascenso a máxima velocidad en aproximadamente 1,3 segundos por episodio.
- Benchmark interno de políticas de subida: servir como referencia de velocidad frente a otras políticas entrenadas en la misma tarea `Mjlab-HillClimb1m5-MicroDuck`, comparando tiempos de episodio y estabilidad de trayectoria.
- Validación de pipeline de despliegue: probar de extremo a extremo el flujo de manifiesto esquema 2, carga en ranuras y alimentación de observaciones en crudo con el normalizador embebido.
- Reproducción de experimentos de RL: usar la configuración documentada (4096 entornos, 3000 iteraciones, semilla 1, commit `b44f7ffc9`) como punto de partida para estudiar la variabilidad entre ejecuciones de entrenamiento.
- Docencia y divulgación en robótica de bajo coste: ilustrar cómo una política de RL entrenada en simulación (mjlab) se empaqueta en ONNX y se ejecuta en un cuadrúpedo económico.
- Investigación en transferencia sim-a-real: evaluar el comportamiento de una política entrenada en simulación sobre hardware real en una tarea acotada y medible como la subida de rampa.
- Base para ajuste fino o destilación: emplear la política como inicialización o como profesor en experimentos posteriores sobre la misma tarea.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El único dato de rendimiento aportado por el autor es que la política completa cada episodio de subida en aproximadamente 1,3 segundos, sin comparación con otras políticas ni métricas de éxito, estabilidad o consumo energético.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el tamaño del repositorio es de 0,0 GB y no se documenta el número de parámetros de la red.
- GPU recomendadas: no disponibles para inferencia; para reentrenar, la configuración documentada usa 4096 entornos paralelos, lo que en la práctica requiere una GPU de datacenter (no se especifica el modelo exacto).
- Compatibilidad con GPU de consumo: no confirmada; al ser un grafo ONNX de robótica de pequeña escala, es plausible que quepa en GPU de consumo, pero no hay datos que lo respalden.
- Opciones de despliegue: ejecución en el robot mediante `robotctl policy load <slot> GinDuck/microduck-hill-climb-1m5-hill-2`; el formato ONNX permite en principio usar runtimes ONNX estándar, aunque no se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI (ninguno aplica a este tipo de modelo).
- Latencia y throughput: control a 50 Hz por diseño; no se publican cifras de latencia de inferencia ni de throughput medido.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye otras políticas de la misma tarea ni datos de rendimiento que permitan una comparación cuantitativa. Como referencia cualitativa, la model card menciona que la receta de entrenamiento es compartida por TheSauceman, pero no se aportan métricas de su política ni de otras alternativas.

## Limitaciones y advertencias

- Especialización extrema: la política solo está entrenada para la tarea de subida de rampa de 1,5 m; no se espera que generalice a terrenos, pendientes u objetivos distintos.
- Sin licencia declarada: no se especifica licencia, por lo que el uso comercial y la redistribución quedan en un limbo legal que conviene aclarar con el autor antes de cualquier despliegue en producción.
- Reproducibilidad limitada: el propio autor advierte que el entrenamiento no es bit-reproducible; los pesos exactos no pueden regenerarse a partir de la receta.
- Ausencia de métricas de robustez: no se documentan tasas de éxito, varianza entre episodios, comportamiento ante perturbaciones ni consumo energético.
- Sin datos de sesgos ni alucinación en el sentido de modelos de lenguaje; el riesgo análogo es el fallo de control (caída, desviación de trayectoria) fuera de las condiciones de entrenamiento.
- Documentación mínima: no se detalla la arquitectura de la red, el número de parámetros ni el proceso de recompensa, lo que dificulta la auditoría técnica.
- Adopción nula verificable: 0 descargas y 0 likes en el momento de la consulta, sin señales de validación por parte de la comunidad.
- Dependencia del ecosistema microduck: el despliegue práctico requiere el demonio y el comando `robotctl`, además del hardware del robot.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/GinDuck/microduck-hill-climb-1m5-hill-2
- Repositorio microduck (Pollen Robotics): https://github.com/pollen-robotics/microduck
- Repositorio de retos y entrenamiento microduck: https://github.com/pollen-robotics/microduck-challenges (rama `race-2`, commit `b44f7ffc9`)
- Documentación del manifiesto de políticas: `docs/policy-manifest.md` en el repositorio del demonio de microduck (no se proporciona URL directa)
- Paper, blog o demo adicionales: no disponibles en la información proporcionada
