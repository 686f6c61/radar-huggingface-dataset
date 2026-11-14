# GinDuck/microduck-sock-heist-6m-continue-2-i

## Resumen

`microduck-sock-heist-6m-continue-2-i` es una política de control entrenada por refuerzo (reinforcement learning) para el robot cuadrúpedo de bajo coste microduck, desarrollado por Pollen Robotics. No es un modelo de lenguaje ni un sistema multimodal: es un policy checkpoint exportado en ONNX que mapea observaciones de 61 dimensiones a 14 acciones de control a 50 Hz, pensado para ejecutarse en el propio robot a través del daemon `robotctl`. El autor, GinDuck, lo publica como parte de sus experimentos de "sock heist", una tarea de locomoción y manipulación en la que el robot debe esquivar guardias y recoger un calcetín sin ser detectado, completándola en unos 10 segundos.

El checkpoint corresponde a la iteración 400 de un entrenamiento continuado (rama `sock-continue-2`, commit `10ba3a426`) sobre el entorno `Mjlab-SockHeist6m-MicroDuck`, con 4096 entornos paralelos, 1000 iteraciones máximas y semilla 1, usando el framework mjlab en su versión 0.1.0. La política es de tipo "perpetual": una marcha o comportamiento que se ejecuta de forma continua hasta que el operador la detiene o carga otra política en la ranura correspondiente.

Su relevancia es acotada pero concreta: sirve como ejemplo reproducible de un pipeline completo de RL para robótica (entrenamiento en simulación con mjlab, exportación a ONNX con normalizador de observaciones embebido, manifiesto de política conforme al esquema 2 y despliegue directo en hardware). No hay información pública sobre benchmarks, licencia ni idiomas, y el repositorio no contiene pesos en formato safetensors ni GGUF, sino un único `policy.onnx` junto con `manifest.json`.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Política neuronal para control robótico (detalles de capas no disponibles); exportada a ONNX |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica; observación de 61 dimensiones por paso |
| Tipos de cuantización | no disponible (se distribuye en ONNX, presumiblemente FP32) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | ONNX (`policy.onnx`) + `manifest.json` (esquema 2 del manifiesto de políticas microduck) |
| Frecuencia de control | 50 Hz |
| Dimensiones de observación | 61 |
| Dimensiones de acción | 14 |
| Comportamiento | Perpetuo (se ejecuta hasta que se detiene o se sustituye) |

## Arquitectura y entrenamiento

La información disponible no detalla la topología interna de la red (número de capas, anchura, tipo de activaciones). Lo que sí se especifica es la interfaz: la política consume observaciones crudas de 61 dimensiones y emite 14 acciones a 50 Hz, con el normalizador de observaciones integrado dentro del propio `policy.onnx`, de modo que el robot puede alimentar observaciones sin preprocesar. El artefacto se acompaña de un `manifest.json` que sigue el esquema 2 del manifiesto de políticas del daemon microduck (documentado en `docs/policy-manifest.md` del repositorio del daemon).

El entrenamiento se realizó con mjlab (base `mjlab-microduck 0.1.0 @ 1efd853be`) sobre el entorno `Mjlab-SockHeist6m-MicroDuck`, con 4096 entornos paralelos, hasta 1000 iteraciones, semilla 1 y registro en TensorBoard bajo el nombre de ejecución `continue-2`. El checkpoint publicado es el 400. El autor advierte explícitamente que el entrenamiento no es bit-reproducible entre máquinas: repetir el mismo comando con el mismo `uv.lock` y la misma semilla produce una política comparable, no pesos idénticos. No se documenta el número de tokens (no aplica), la composición del dataset (es RL en simulación, no aprendizaje supervisado) ni el uso de RLHF/DPO.

## Capacidades

- Control locomotor de un cuadrúpedo microduck a 50 Hz mediante política perpetua.
- Ejecución de una tarea compuesta de navegación y recogida de objeto ("sock heist"): esquivar guardias y agarrar el calcetín sin ser detectado, en aproximadamente 10 segundos.
- Interfaz estandarizada de observación (61-D) y acción (14-D), compatible con el daemon `robotctl`.
- Normalización de observaciones embebida en el grafo ONNX, lo que simplifica la integración en el robot.
- Carga en una ranura de política mediante `robotctl policy load <slot> <repo>`.
- No soporta tool calling, function calling, razonamiento multi-paso simbólico, capacidades multilingües, visión ni audio.

## Casos de uso

- Despliegue en hardware microduck: cargar la política en una ranura con `sudo robotctl policy load <slot> GinDuck/microduck-sock-heist-6m-continue-2-i` para reproducir el comportamiento de recogida de calcetín en el robot físico.
- Demostración docente de RL para robótica: usar el checkpoint como ejemplo funcional de un pipeline mjlab → ONNX → robot, con comando de reproducción documentado y semilla fija.
- Punto de partida para entrenamiento continuado: al ser un checkpoint de una rama `sock-continue-2`, sirve como inicialización para experimentos posteriores de ajuste fino o curriculum en la misma tarea.
- Benchmark interno de políticas: comparar esta política con otros checkpoints del mismo autor (por ejemplo, la primera ejecución de "sock heist") para evaluar la mejora en tiempo de finalización y tasa de éxito.
- Pruebas de integración del daemon `robotctl`: validar el esquema 2 de manifiesto de políticas y el flujo de carga en ranuras en un entorno controlado.
- Investigación en simulación: reutilizar el entorno `Mjlab-SockHeist6m-MicroDuck` con 4096 entornos paralelos para estudiar estabilidad del entrenamiento y sensibilidad a la semilla.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor solo indica cualitativamente que la política "esquiva a los guardias y agarra el calcetín sin ser atrapado" y que "termina en unos 10 segundos". No hay tasas de éxito, recompensas medias, curvas de aprendizaje ni comparaciones numéricas con otras políticas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el tamaño del repositorio es de 0.0 GB, lo que sugiere un modelo muy pequeño (probablemente en el rango de kilobytes a pocos megabytes), apto para ejecución en CPU.
- GPU recomendadas: no se especifican; por el formato ONNX y el contexto de robótica embebida, la inferencia se plantea en la CPU del propio robot microduck.
- ¿Cabe en GPU consumer? Sí, con total probabilidad dada la ausencia de requisitos de memoria documentados, aunque no hay confirmación oficial.
- Opciones de despliegue: daemon `robotctl` del ecosistema microduck (carga en ranura de política); al ser ONNX, también es ejecutable con ONNX Runtime en otras plataformas.
- Latencia y throughput: no disponibles; el único dato temporal es la frecuencia de control de 50 Hz (periodo de 20 ms por paso).

## Comparativa con modelos similares

No disponible. No se han identificado en la información proporcionada otras políticas microduck comparables con parámetros, contexto, rendimiento y licencia documentados. El propio autor menciona una "primera ejecución" de sock heist como referencia interna, pero sin datos cuantitativos publicados.

## Limitaciones y advertencias

- Licencia no disponible: no se puede asumir permiso para uso comercial, redistribución o modificación; es necesario contactar con el autor antes de cualquier uso en producción.
- Especialización extrema: la política solo ejecuta la tarea "sock heist" en el robot microduck; no generaliza a otras tareas ni a otros robots.
- Comportamiento perpetuo: la política se ejecuta de forma continua hasta que se detiene explícitamente o se sustituye en la ranura, lo que exige supervisión del operador.
- Reproducibilidad limitada: el propio autor advierte que el entrenamiento no es bit-reproducible; los pesos publicados no se pueden regenerar exactamente.
- Sin datos de robustez: no hay información sobre sim-to-real gap, tasa de éxito en hardware, sensibilidad a perturbaciones ni comportamiento ante fallos.
- Sin benchmarks ni métricas cuantitativas: la evaluación es puramente cualitativa ("unos 10 segundos"), lo que dificulta comparaciones objetivas.
- Repositorio sin descargas ni likes en el momento de la consulta, lo que reduce la validación comunitaria del artefacto.
- El modelo no es un LLM: no debe evaluarse con métricas de lenguaje, razonamiento o generación de texto.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/GinDuck/microduck-sock-heist-6m-continue-2-i
- Repositorio microduck (Pollen Robotics): https://github.com/pollen-robotics/microduck
- Repositorio de retos y entrenamiento: https://github.com/pollen-robotics/microduck-challenges
- Commit de entrenamiento: https://github.com/pollen-robotics/microduck-challenges/commit/10ba3a426
- Documentación del manifiesto de políticas: `docs/policy-manifest.md` en el repositorio del daemon microduck (no se proporciona URL directa)
