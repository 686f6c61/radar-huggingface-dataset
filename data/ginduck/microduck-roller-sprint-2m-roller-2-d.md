# GinDuck/microduck-roller-sprint-2m-roller-2-d

## Resumen

`microduck-roller-sprint-2m-roller-2-d` es una política de control por refuerzo (reinforcement learning) entrenada para el robot cuadrúpedo de bajo coste microduck de Pollen Robotics. No es un modelo de lenguaje ni un modelo fundacional generativo: es un controlador neuronal que produce una marcha (gait) de locomoción sobre ruedas (rollers) a 50 Hz, con 61 dimensiones de observación y 14 acciones de salida. Lo publica el usuario GinDuck bajo el identificador `GinDuck/microduck-roller-sprint-2m-roller-2-d` y se distribuye como un fichero ONNX listo para cargarse en una ranura de política del daemon del robot.

El checkpoint pertenece a la segunda tanda de entrenamientos del autor ("roller run") y abandona la marcha de patinaje previa para priorizar velocidad pura, siguiendo una receta compartida por otro usuario (TheSauceman). Según la model card, completa cada carrera en aproximadamente 1,5 segundos. La política es perpetua: se ejecuta de forma continua hasta que se le indica lo contrario.

La relevancia de esta ficha es acotada y muy específica: se trata de un artefacto de robótica de código abierto orientado al ecosistema microduck, útil para quien quiera reproducir el entrenamiento con mjlab o desplegar una marcha rápida sobre ruedas en hardware real. No hay información pública sobre licencia, idiomas ni benchmarks estandarizados.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Red de política de reinforcement learning (detalles de capas no disponibles), exportada a ONNX |
| Parámetros totales | no disponible (el tamaño del repo figura como 0.0 GB en Hugging Face) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (política de control, no modelo de secuencia) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible (no es un modelo lingüístico) |
| Licencia | no disponible |
| Formato de pesos | ONNX (`policy.onnx`) más `manifest.json` con esquema 2 del manifiesto de políticas microduck |
| Observación / acción | 61-D observación, 14 acciones |
| Frecuencia de control | 50 Hz |
| Normalizador de observaciones | integrado en `policy.onnx` (se alimenta con observaciones en crudo) |
| Entorno de entrenamiento | mjlab-microduck 0.1.0 (commit 1efd853be), tarea `Mjlab-RollerSprint2m-MicroDuck` |

## Arquitectura y entrenamiento

La política se entrena con aprendizaje por refuerzo en simulación usando mjlab (entorno de RL basado en MuJoCo para el microduck). La tarea concreta es `Mjlab-RollerSprint2m-MicroDuck`, dentro del repositorio `pollen-robotics/microduck-challenges`, rama `race-2`, commit `b44f7ffc9`. El entrenamiento se lanzó el 2 de noviembre de 2026 con semilla 1, checkpoint 5250 y una configuración de 2048 entornos paralelos y hasta 6000 iteraciones del agente, con registro en TensorBoard bajo el nombre de ejecución `roller-2`.

El autor advierte explícitamente de que el entrenamiento no es reproducible bit a bit entre máquinas: repetir el mismo comando con el mismo `uv.lock` y la misma semilla produce una política comparable, pero no idéntica. El pipeline de reproducción está documentado en la model card (`git clone`, `git checkout b44f7ffc9`, `uv sync`, `uv run train ...`). No se detalla la topología interna de la red (número de capas, anchura, función de activación), ni el número total de pasos de entorno, ni la composición de recompensas; esa información no está disponible en el material proporcionado.

## Capacidades

- Locomoción sobre ruedas (rollers) del robot microduck a 50 Hz, con política perpetua que se ejecuta hasta que se detiene o se sustituye.
- Marcha orientada a velocidad: según la model card, completa cada carrera en aproximadamente 1,5 segundos.
- Consumo de observaciones en crudo: el normalizador está embebido en el ONNX, por lo que no requiere preprocesado externo.
- Integración con el daemon del robot mediante `robotctl policy load <slot> <repo>`, cargando la política en una ranura.
- Compatibilidad con el manifiesto de políticas microduck en esquema 2.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni capacidades multilingües: es un controlador motor, no un modelo generativo.

## Casos de uso

- Reproducción de experimentos de RL en robótica: clonar `microduck-challenges`, hacer checkout del commit `b44f7ffc9` y relanzar el entrenamiento con la misma semilla para obtener una política comparable y analizar la variabilidad entre ejecuciones.
- Despliegue de una marcha rápida en hardware real: cargar la política en una ranura con `sudo robotctl policy load <slot> GinDuck/microduck-roller-sprint-2m-roller-2-d` para disponer de un controlador de sprint sobre ruedas listo para usar.
- Benchmarking interno de gaits: comparar esta política de sprint con las de patinaje de la misma tanda del autor para medir tiempos de carrera sobre el mismo robot y circuito.
- Base para fine-tuning o destilación: usar el checkpoint 5250 como punto de partida o referencia para entrenar variantes con otras recompensas (estabilidad, eficiencia energética, terrenos).
- Docencia en robótica con refuerzo: ejemplo completo y reproducible de un pipeline de entrenamiento (mjlab + MuJoCo + 2048 entornos) aplicado a un cuadrúpedo de bajo coste.
- Validación del stack de despliegue microduck: probar la carga de políticas vía `robotctl` y el manifiesto en esquema 2 como prueba de integración del daemon antes de desplegar políticas propias.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El único dato de rendimiento aportado por el autor es cualitativo-cuantitativo: cada carrera se completa en aproximadamente 1,5 segundos, sin especificar la longitud del circuito ni las condiciones de medida.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; por la naturaleza del artefacto (política de 61 entradas y 14 salidas exportada a ONNX), la huella es mínima y cabe holgadamente en cualquier GPU consumer, e incluso en CPU.
- GPU recomendadas: no especificadas por el autor. Para el entrenamiento, la model card indica 2048 entornos paralelos, lo que en la práctica exige una GPU de datacenter (A100, H100 o similar); no se detalla el modelo usado.
- Cabe en GPU consumer: sí, para inferencia; el cuello de botella es el robot, no el cómputo.
- Opciones de despliegue: ONNX Runtime a través del daemon microduck (`robotctl policy load`). No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de artefacto.
- Latencia y throughput: control a 50 Hz (periodo de 20 ms por paso de política); no se publican cifras de latencia de inferencia ni de throughput de entrenamiento.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye otras políticas microduck comparables con datos de parámetros, contexto o rendimiento. La referencia más cercana sería el resto de checkpoints de la misma tanda "roller-2" del autor y las políticas de patinaje que este sprint sustituye, pero no se aportan sus especificaciones.

## Limitaciones y advertencias

- Licencia no declarada: no hay información sobre permisos de uso comercial, redistribución o modificación; conviene contactar con el autor antes de cualquier uso en producción.
- Ausencia total de benchmarks estandarizados: el único dato de rendimiento (1,5 s por carrera) carece de condiciones de medida documentadas.
- Entrenamiento no reproducible bit a bit: misma semilla y mismo código producen pesos distintos; no debe tratarse como un artefacto determinista.
- Especialización extrema: la política solo sirve para el microduck sobre rollers y para la tarea de sprint; no generaliza a otros robots, terrenos o tareas sin reentrenamiento.
- Sin información sobre sesgos, alucinación o comportamiento fuera de distribución: no se documentan fallos en bordes, recuperación tras caídas ni robustez ante perturbaciones.
- Metadatos incompletos en Hugging Face: 0 descargas, 0 likes y tamaño de repo de 0.0 GB, lo que sugiere un artefacto recién subido y sin validación por parte de la comunidad.
- Fechas de creación y actualización (noviembre de 2026) posteriores a la mayoría de referencias del ecosistema: verificar la vigencia del daemon y del manifiesto en esquema 2 antes de desplegar.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/GinDuck/microduck-roller-sprint-2m-roller-2-d
- Repositorio microduck (Pollen Robotics): https://github.com/pollen-robotics/microduck
- Repositorio de retos y entrenamiento: https://github.com/pollen-robotics/microduck-challenges (rama `race-2`, commit `b44f7ffc9`)
- Documentación del manifiesto de políticas: `docs/policy-manifest.md` en el repositorio del daemon (no se proporciona URL directa)
