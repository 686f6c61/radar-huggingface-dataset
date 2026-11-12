# atomicvox/microduck-got-a-talent-run-1111-1656

## Resumen

`atomicvox/microduck-got-a-talent-run-1111-1656` es una política de control motriz entrenada mediante aprendizaje por refuerzo para el robot cuadrúpedo de código abierto microduck, desarrollado por Pollen Robotics. No se trata de un modelo de lenguaje ni de un modelo generativo multimodal: es un controlador neuronal que recibe observaciones de 61 dimensiones y emite 14 acciones a 50 Hz, empaquetado en formato ONNX para su ejecución directa en el robot. El autor del artefacto es el usuario de Hugging Face `atomicvox`, y el modelo se distribuye con la librería `microduck` y la etiqueta de pipeline `robotics`.

El modelo implementa una política "perpetua": una marcha o patrón de locomoción que se ejecuta de forma continua hasta que se le indique lo contrario, cargándose en una ranura de política del daemon del robot. El repositorio tiene un tamaño de 0,0 GB según los metadatos de Hugging Face, lo que sugiere un artefacto muy ligero (probablemente un único `policy.onnx` de pocos megabytes), coherente con una red neuronal de política de tamaño reducido para control en tiempo real a 50 Hz.

La relevancia de esta ficha es acotada: se trata de un artefacto experimental de un autor individual, sin descargas ni likes, con licencia e idiomas no declarados y sin benchmarks publicados. Su interés reside en el ecosistema microduck y en el pipeline de entrenamiento reproducible (mjlab, 2048 entornos paralelos, 3000 iteraciones) más que en capacidades cognitivas o de generación de lenguaje.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | red neuronal de política para control robótico (detalles de capas no disponibles); entrenada con mjlab (reinforcement learning) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (política de control; sin ventana de contexto textual) |
| Tipos de cuantizacion | no disponible (se distribuye como ONNX; no se documentan cuantizaciones) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | ONNX (`policy.onnx`) y `manifest.json` con esquema 2 del manifiesto de políticas microduck |

## Arquitectura y entrenamiento

La información disponible no detalla la topología interna de la red (número de capas, dimensiones ocultas, funciones de activación). Lo que sí se documenta es la interfaz: 61 dimensiones de observación de entrada y 14 dimensiones de acción de salida, con una frecuencia de control de 50 Hz. El normalizador de observaciones está embebido dentro de `policy.onnx`, de modo que el consumidor debe alimentar observaciones en crudo. El artefacto se acompaña de un `manifest.json` que sigue el esquema 2 del manifiesto de políticas del daemon microduck, lo que permite cargarlo directamente en una ranura de política del robot mediante `robotctl policy load <slot> atomicvox/microduck-got-a-talent-run-1111-1656`.

El entrenamiento se realizó con el framework mjlab (base `mjlab-microduck 0.1.0 @ 1efd853be`), sobre la tarea `Mjlab-GotATalent-MicroDuck`, con 2048 entornos paralelos, 3000 iteraciones máximas, semilla 1 y checkpoint final 2999. El comando de reproducción usa `uv` con un `uv.lock` fijado y el commit `b4c54287d` del repositorio `atomicvox/microduck-challenges`. El autor advierte explícitamente que el entrenamiento no es bit-reproducible entre máquinas: repetir el proceso con el mismo código, lock, comando y semilla produce una política comparable, no los mismos pesos. No se documentan datos sobre composición del dataset (en RL se trata de experiencia generada por simulación), ni uso de RLHF/DPO, ni innovaciones técnicas adicionales más allá del propio pipeline de entrenamiento masivamente paralelo.

## Capacidades

- Control motriz de locomoción para el robot cuadrúpedo microduck: genera 14 acciones de control a 50 Hz a partir de 61 observaciones.
- Política "perpetua": ejecuta una marcha continua hasta que se le indique lo contrario, pensada para cargarse en una ranura de política del daemon.
- Inferencia en formato ONNX con normalización de observaciones integrada, lo que simplifica la integración en el robot.
- Compatibilidad con el manifiesto de políticas microduck (esquema 2) para carga mediante `robotctl`.
- No dispone de generación de texto, razonamiento, código, matemáticas, visión, audio, tool calling, capacidades de agente ni multilingüismo: es exclusivamente un controlador de robótica.

## Casos de uso

- Locomoción continua en el microduck: cargar la política en una ranura con `robotctl policy load` y dejar que el robot ejecute la marcha de forma indefinida hasta recibir una orden de parada o cambio de política.
- Demostración de gait o patrón de marcha: usar el artefacto como ejemplo reproducible de una política entrenada con mjlab para mostrar el flujo completo de entrenamiento a despliegue en el robot.
- Investigación en aprendizaje por refuerzo para robótica: servir de punto de partida para comparar políticas entrenadas con distintas semillas, ya que el autor documenta el comando exacto de reproducción y advierte de la no reproducibilidad bit a bit.
- Pruebas de integración del daemon microduck: validar la carga de manifiestos de esquema 2 y la ejecución de políticas ONNX en una ranura del sistema.
- Benchmarking de simulación a realidad: evaluar cómo se comporta una política entrenada con 2048 entornos paralelos en el robot físico, midiendo desviaciones respecto al comportamiento simulado.
- Docencia y talleres: usar el repositorio `microduck-challenges` y este artefacto como material práctico para enseñar el ciclo de entrenamiento con mjlab y despliegue con ONNX.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. Por el tamaño del repositorio (0,0 GB) y la naturaleza del artefacto (política ONNX de control), se espera que sea muy reducida, pero no hay cifras publicadas.
- GPU recomendadas: no disponibles. La inferencia a 50 Hz de una política de control suele ser viable en CPU o en GPUs de gama baja, pero no se documenta.
- ¿Cabe en GPU consumer? No disponible con datos del autor; por el tamaño del artefacto es plausible, pero no confirmado.
- Opciones de despliegue: carga en el robot mediante `robotctl policy load <slot>` con el daemon microduck; ejecución del `policy.onnx` con un runtime ONNX estándar. No se documentan vLLM, llama.cpp, Ollama ni TGI (no aplican a este tipo de modelo).
- Latencia y throughput: la política está diseñada para 50 Hz (periodo de 20 ms), pero no se publican mediciones de latencia ni throughput reales.

## Comparativa con modelos similares

No disponible. No se han identificado en la información proporcionada otras políticas microduck comparables con parámetros, contexto, rendimiento y licencia documentados.

## Limitaciones y advertencias

- Licencia no declarada: no se especifican condiciones de uso comercial ni de redistribución; debe contactarse con el autor antes de cualquier uso en producción.
- Idiomas no aplicables: no es un modelo de lenguaje, por lo que las expectativas de capacidades cognitivas o multilingües no proceden.
- Sin benchmarks ni métricas de rendimiento publicadas: no hay evidencia cuantitativa de calidad de la marcha ni de robustez en el robot físico.
- Reproducibilidad limitada: el propio autor advierte que el entrenamiento no es bit-reproducible; los pesos exactos no pueden regenerarse.
- Artefacto experimental sin tracción: 0 descargas y 0 likes en el momento de la consulta, sin validación comunitaria.
- Dependencia del ecosistema microduck y del esquema 2 de manifiesto: cambios en el daemon o en el formato pueden romper la compatibilidad.
- Riesgo de comportamiento inesperado en el robot físico: al ser una política de RL entrenada en simulación, puede presentar brechas simulación-realidad no documentadas.
- Sin información sobre sesgos (no aplica en el sentido habitual de modelos de lenguaje) ni sobre alucinación (no genera texto).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/atomicvox/microduck-got-a-talent-run-1111-1656
- Repositorio microduck de Pollen Robotics: https://github.com/pollen-robotics/microduck
- Repositorio de entrenamiento del autor: `git@github.com:atomicvox/microduck-challenges.git` (commit `b4c54287d`)
- Documentación del manifiesto de políticas: `docs/policy-manifest.md` en el repositorio del daemon microduck (no se proporciona URL directa)
