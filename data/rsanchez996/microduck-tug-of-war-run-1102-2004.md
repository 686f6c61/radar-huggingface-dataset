# RSanchez996/microduck-tug-of-war-run-1102-2004

## Resumen

`microduck-tug-of-war-run-1102-2004` es una política de control entrenada por refuerzo para el robot cuadrúpedo de bajo coste microduck, desarrollado por Pollen Robotics. No se trata de un modelo de lenguaje ni de un modelo fundacional generativo: es un controlador neuronal exportado a ONNX que mapea una observación de 61 dimensiones a 14 acciones de articulación a 50 Hz, pensado para ejecutarse embebido en el propio robot o en su daemon de control.

El modelo resuelve una tarea concreta de locomoción, `Mjlab-TugOfWar-MicroDuck`, dentro del entorno de simulación mjlab. La política es de tipo "perpetuo": una vez cargada en una ranura de política del daemon `robotctl`, ejecuta la marcha de forma continua hasta que se le indique lo contrario. Esto la diferencia de políticas episódicas que requieren reinicio tras cada secuencia.

Su relevancia es limitada y muy específica: se publica como artefacto reproducible de un experimento de entrenamiento (checkpoint 200, semilla 1, commit concreto) en el repositorio de retos del autor. El repositorio ocupa 0.0 GB según HuggingFace, lo que sugiere un artefacto de pequeño tamaño (coherente con una red de política para un robot de 14 actuadores), aunque no se dispone del recuento exacto de parámetros.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal de política para control robótico (topología no especificada; exportada a ONNX) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (no es un modelo de lenguaje) |
| Tipos de cuantizacion | no disponible (artefacto ONNX; el autor no documenta variantes cuantizadas) |
| Idiomas soportados | no disponible (no procesa lenguaje natural) |
| Licencia | no disponible |
| Formato de pesos | ONNX (`policy.onnx`) + `manifest.json` (schema 2 del manifiesto de políticas microduck) |

## Arquitectura y entrenamiento

La política se entrena con aprendizaje por refuerzo en simulación mediante mjlab (entorno de simulación física basado en MuJoCo, según la referencia `mjlab-microduck 0.1.0`). El espacio de observación tiene 61 dimensiones y el de acción 14, con un bucle de control a 50 Hz. El normalizador de observaciones está integrado dentro del propio `policy.onnx`, de modo que el consumidor debe alimentar observaciones en bruto sin preprocesar.

El entrenamiento se ejecutó con 2304 entornos paralelos, un máximo de 1000 iteraciones del agente, semilla 1 y registro en TensorBoard, sobre la tarea `Mjlab-TugOfWar-MicroDuck` del repositorio `RSanchez996/microduck-challenges` (rama `main`, commit `27e5454fa`). El checkpoint publicado es el 200. El autor advierte explícitamente de que el entrenamiento por refuerzo con GPU no es bit-reproducible entre máquinas: repetir el pipeline con el mismo `uv.lock`, comando y semilla produce una política comparable, no idéntica.

No se documenta en la información disponible el número de tokens, la composición del dataset (no aplica en RL), ni si se emplearon técnicas adicionales como recompensas conformadas, currículo o regularización. Tampoco se detalla la topología interna de la red (capas, anchuras, activaciones).

## Capacidades

- Control locomotor continuo del robot microduck para la tarea de "tug of war" (tracción/forcejeo), ejecutado de forma perpetua hasta que el daemon lo detenga.
- Mapeo directo observación (61-D) a acción (14-D) a 50 Hz, adecuado para control en tiempo real.
- Normalización de observaciones incorporada en el grafo ONNX, lo que simplifica la integración en el daemon.
- Carga como ranura de política mediante `robotctl policy load <slot> <repo>`.
- No soporta tool calling, function calling, razonamiento multi-paso, generación de texto, visión, audio ni capacidades multilingües: no es un modelo de lenguaje.

## Casos de uso

- **Marcha perpetua en el robot microduck**: cargar la política en una ranura del daemon y dejar que el robot ejecute la locomoción de forcejeo de forma continua; encaja porque el artefacto está diseñado explícitamente como política perpetua a 50 Hz.
- **Reproducción de experimentos de RL**: servir como referencia reproducible (commit, semilla y comando documentados) para validar pipelines de entrenamiento en mjlab con 2304 entornos paralelos.
- **Base para ajuste fino o comparación de políticas**: usar el checkpoint 200 como punto de partida o línea base frente a otras políticas de la misma tarea en el repositorio de retos.
- **Validación de integración del daemon robotctl**: probar el flujo de carga de políticas, el esquema 2 de manifiesto y la alimentación de observaciones en bruto con un artefacto real.
- **Docencia y demostración de RL aplicado a robótica de bajo coste**: ilustrar el ciclo completo de simulación a despliegue en un cuadrúpedo económico.
- **Pruebas de robustez en hardware**: evaluar el comportamiento de una política entrenada en simulación al transferirse al robot físico, midiendo degradación por diferencias sim-a-real.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precisión; por el tamaño del repositorio (0.0 GB) y el espacio de acción/observación, se espera un modelo de pocos miles a pocos cientos de miles de parámetros, ejecutable en CPU.
- GPU recomendadas: no aplica para inferencia; el entrenamiento documentado usó GPU (no se especifica el modelo) con 2304 entornos paralelos.
- Cabe en GPU de consumo: previsiblemente sí, e incluso en CPU embebida, aunque no se confirma en la documentación.
- Opciones de despliegue: runtime ONNX integrado en el daemon microduck vía `robotctl`; no se documentan vLLM, llama.cpp, Ollama ni TGI (no aplican).
- Latencia y throughput: bucle de control a 50 Hz (periodo de 20 ms); no se publican cifras de latencia por inferencia.

## Comparativa con modelos similares

| Modelo | Tipo | Observación / acción | Frecuencia | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| microduck-tug-of-war-run-1102-2004 | Política RL (ONNX) | 61-D / 14-D | 50 Hz | no disponible | HuggingFace |
| Otras políticas microduck del mismo autor | Política RL (ONNX) | no disponible | no disponible | no disponible | Repositorio `microduck-challenges` |
| Políticas de referencia de mjlab-microduck | Política RL | no disponible | no disponible | no disponible | `mjlab-microduck 0.1.0` |

No se dispone de datos de rendimiento ni de especificaciones detalladas de las alternativas para una comparación cuantitativa.

## Limitaciones y advertencias

- Es una política específica de una única tarea (`Mjlab-TugOfWar-MicroDuck`); no generaliza a otras tareas de locomoción sin reentrenamiento.
- Entrenada en simulación: el rendimiento en el robot físico puede degradarse por la brecha sim-a-real, no cuantificada en la información disponible.
- No es bit-reproducible: el propio autor advierte que repetir el entrenamiento produce pesos distintos.
- Licencia no especificada: no se puede asumir uso comercial sin consultar al autor.
- Idiomas no aplicables; el modelo no procesa texto.
- Sin benchmarks publicados ni métricas de recompensa, éxito de tarea o robustez.
- El repositorio registra 0 descargas y 0 likes, y la model card incluye la cadena "test1", lo que sugiere un artefacto de prueba más que una política validada en producción.
- Riesgo de alucinación no aplica (no genera texto); el riesgo relevante es de comportamiento físico imprevisto en hardware.

## Enlaces

- HuggingFace: https://huggingface.co/RSanchez996/microduck-tug-of-war-run-1102-2004
- Repositorio de retos del autor: https://github.com/RSanchez996/microduck-challenges.git
- Proyecto microduck (Pollen Robotics): https://github.com/pollen-robotics/microduck
- Documentación del manifiesto de políticas: `docs/policy-manifest.md` en el repositorio del daemon (no se proporciona URL directa)
