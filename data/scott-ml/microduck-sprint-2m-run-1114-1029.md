# scott-ml/microduck-sprint-2m-run-1114-1029

## Resumen

`microduck-sprint-2m-run-1114-1029` es una política de control robótico entrenada mediante aprendizaje por refuerzo para el robot cuadrúpedo de bajo coste Microduck, desarrollado por Pollen Robotics. No se trata de un modelo de lenguaje: es una política perpetua de locomoción que genera comandos de acción a 50 Hz a partir de observaciones de 61 dimensiones, con 14 acciones de salida. El autor, identificado como `scott-ml`, la describe como su "baseline" para aprender a caminar, lo que la sitúa como un punto de partida experimental más que como un sistema de producción.

El modelo se distribuye empaquetado como `policy.onnx` (con el normalizador de observaciones integrado en el propio grafo ONNX) y un `manifest.json` que sigue el esquema 2 del manifiesto de políticas de microduck. Se carga directamente en el daemon del robot mediante el comando `robotctl policy load`, lo que la hace inmediatamente desplegable en hardware real sin pasos intermedios de conversión.

Su relevancia es acotada pero concreta: demuestra el flujo completo de entrenamiento y despliegue de políticas de locomoción en un robot open source de bajo coste, empleando el simulador mjlab (basado en MuJoCo) con 4096 entornos paralelos durante 3000 iteraciones. La información disponible sobre licencia, idiomas y benchmarks es prácticamente nula, lo que limita su evaluación rigurosa.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Política de aprendizaje por refuerzo exportada a ONNX (no disponible el detalle de la red) |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (política de control, no modelo de lenguaje) |
| Tipos de cuantización | no disponible (se distribuye en ONNX; el normalizador va integrado en el grafo) |
| Idiomas soportados | no disponible (no aplica) |
| Licencia | no disponible |
| Formato de pesos | ONNX (`policy.onnx`) + `manifest.json` (esquema 2 del manifiesto de microduck) |
| Dimensión de observación | 61 |
| Dimensión de acción | 14 |
| Frecuencia de control | 50 Hz |
| Política | perpetua (se ejecuta hasta que se detiene explícitamente) |

## Arquitectura y entrenamiento

La política se entrenó con aprendizaje por refuerzo en el simulador mjlab (basado en MuJoCo), bajo la tarea `Mjlab-Sprint2m-MicroDuck` del repositorio `spowers42/microduck-challenges`. La configuración de entrenamiento emplea 4096 entornos paralelos, 3000 iteraciones máximas del agente y semilla 1, con registro en TensorBoard bajo el nombre de ejecución `run-1114-1029`. El checkpoint final es el 2999. La base de simulación es `mjlab-microduck 0.1.0` en el commit `1efd853be`.

La política resultante se exporta a ONNX con el normalizador de observaciones embebido, de modo que el consumidor alimenta observaciones crudas sin preprocesado adicional. El autor advierte explícitamente de que el entrenamiento no es reproducible bit a bit entre máquinas: con el mismo código, `uv.lock`, comando y semilla se obtiene una política "comparable", no idéntica. No se especifican en la información disponible la arquitectura interna de la red (capas, activaciones), el algoritmo de RL empleado (PPO, SAC u otro), ni la composición de las recompensas.

## Capacidades

- Locomoción cuadrúpeda perpetua: genera una marcha continua ("sprint") que se ejecuta hasta recibir orden de parada.
- Control a 50 Hz con observaciones de 61 dimensiones y 14 acciones articulares.
- Acepta observaciones crudas, ya que el normalizador está integrado en el grafo ONNX.
- Despliegue directo en el robot mediante carga en un slot de política del daemon (`robotctl policy load`).
- Compatible con el manifiesto de políticas de microduck en su esquema 2.
- No soporta tool calling, function calling, razonamiento multi-paso, capacidades multilingües ni modalidades de texto, visión o audio: es exclusivamente una política motora.

## Casos de uso

- Docencia e investigación en robótica con bajo presupuesto: sirve como política de referencia para que estudiantes comparen sus propios entrenamientos contra una marcha funcional ya publicada, usando el robot Microduck de Pollen Robotics.
- Reproducción de experimentos de RL: el repositorio y el comando de entrenamiento documentados permiten volver a lanzar la tarea `Mjlab-Sprint2m-MicroDuck` con los mismos hiperparámetros y comprobar la variabilidad entre ejecuciones, útil para estudiar la no reproducibilidad bit a bit en RL con GPU.
- Validación de pipelines de despliegue sim-a-real: cargar esta política en un Microduck físico valida la cadena completa (entrenamiento en mjlab, exportación ONNX, manifiesto, daemon `robotctl`) antes de invertir esfuerzo en políticas propias más complejas.
- Punto de partida para fine-tuning: al ser una política "baseline" de marcha, puede servir como inicialización o comparativa para entrenar habilidades derivadas (giros, cambios de velocidad, recuperación de caídas) sobre la misma tarea.
- Pruebas de integración del daemon de microduck: los desarrolladores del ecosistema pueden usar esta política como caso de prueba reproducible para verificar la carga de slots, la frecuencia de control y el cumplimiento del esquema 2 del manifiesto.
- Benchmark interno de infraestructura de simulación: los 4096 entornos paralelos y 3000 iteraciones con semilla fija permiten medir throughput y estabilidad de la plataforma mjlab en distintas máquinas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de recompensa, distancia recorrida, tasa de caídas ni comparaciones cuantitativas con otras políticas. El autor solo indica que la política "aprende a caminar" y que se trata de un baseline.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible, pero al tratarse de una política de control pequeña exportada a ONNX, es previsible que quepa en CPU y en cualquier GPU de consumo; no hay cifras confirmadas en la información.
- GPU recomendadas: no disponibles. Para el entrenamiento, la configuración usa 4096 entornos paralelos en mjlab, lo que en la práctica requiere una GPU dedicada (no se especifica modelo).
- ¿Cabe en GPU de consumo? No confirmado; el despliegue real ocurre en la computadora del robot Microduck, no en una GPU de escritorio.
- Opciones de despliegue: ONNX Runtime (formato `policy.onnx`) y el daemon `robotctl` del ecosistema microduck mediante `sudo robotctl policy load <slot> scott-ml/microduck-sprint-2m-run-1114-1029`. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: control a 50 Hz (periodo de 20 ms por ciclo de inferencia); no se publican cifras de latencia por inferencia.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye otras políticas de locomoción para Microduck ni resultados comparables de modelos de la misma categoría.

## Limitaciones y advertencias

- Es un "baseline, just learning to walk": el propio autor la presenta como un punto de partida, no como una política madura o robusta.
- No hay información sobre licencia; no puede asumirse uso comercial sin consultar al autor.
- No se documentan sesgos (no aplica en el sentido lingüístico), pero sí un riesgo de comportamiento frágil ante perturbaciones no vistas en simulación.
- La reproducibilidad es limitada: el autor advierte que reentrenar produce una política comparable, no la misma, por la no determinación bit a bit del RL en GPU.
- Depende del hardware y del daemon específicos de microduck (61-D de observación, 14 acciones, 50 Hz); no es portable a otros robots sin reentrenamiento.
- No se publican métricas de rendimiento ni tasas de éxito, por lo que no hay evidencia cuantitativa de robustez en el mundo real.
- El repositorio ocupa 0.0 GB y no tiene descargas ni likes: es un artefacto experimental de un autor individual.
- Cualquier uso en producción requeriría validación propia de estabilidad, seguridad física y recuperación ante fallos.

## Enlaces

- Hugging Face: https://huggingface.co/scott-ml/microduck-sprint-2m-run-1114-1029
- Repositorio de retos de entrenamiento: https://github.com/spowers42/microduck-challenges (commit `5cee942d8`, rama `main`)
- Robot microduck (Pollen Robotics): https://github.com/pollen-robotics/microduck
- Documentación del manifiesto de políticas: `docs/policy-manifest.md` en el repositorio del daemon de microduck (no se proporciona URL directa)
