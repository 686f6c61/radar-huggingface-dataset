# ctcheung/microduck-sock-heist-6m-progress12-v3-from1500-10k

## Resumen

`microduck-sock-heist-6m-progress12-v3-from1500-10k` es una política de control entrenada mediante aprendizaje por refuerzo para el robot cuadrúpedo de código abierto microduck, desarrollado por Pollen Robotics. No se trata de un modelo de lenguaje ni de un modelo fundacional generativo, sino de un controlador neuronal exportado a ONNX que mapea observaciones de 61 dimensiones a 14 acciones de control a 50 Hz. El autor, ctcheung, lo publica como una política perpetua ("perpetual") que se ejecuta de forma continua hasta que se le indique lo contrario, pensada para cargarse en una ranura de política del demonio `robotctl` del robot.

El modelo resuelve un problema concreto de robótica de locomoción y manipulación: ejecutar de forma estable una tarea denominada `SockHeist6m` (presumiblemente una tarea de marcha o interacción con un calcetín en un entorno de simulación de 6 millones de pasos), entrenada con el framework de RL `mjlab` sobre la base `mjlab-microduck 0.1.0`. La relevancia es limitada fuera del ecosistema microduck: es un artefacto de investigación reproducible, no un modelo de propósito general.

La información disponible es escasa: el repositorio ocupa 0.0 GB, no tiene descargas ni likes, no declara licencia ni idiomas, y la model card solo documenta el proceso de entrenamiento y reproducción. No se publican benchmarks, métricas de rendimiento ni detalles de la arquitectura de la red neuronal más allá de la interfaz de observación/acción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal de política para RL (detalles internos no disponibles); exportada a ONNX |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (política de control, no modelo de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | ONNX (`policy.onnx`) y `manifest.json` (schema 2 del manifiesto de políticas microduck) |

## Arquitectura y entrenamiento

La política se entrena con aprendizaje por refuerzo en el entorno `Mjlab-SockHeist6m-MicroDuck`, usando el repositorio `microduck-challenges` (rama `main`, commit `358805e00`) y la base `mjlab-microduck 0.1.0` (commit `1efd853be`). El entrenamiento parte de un checkpoint previo (`model_1500.pt` con hash SHA-256 `1e6329f4…`) y se ejecuta durante 10 000 iteraciones con 2048 entornos paralelos y semilla 1. El checkpoint final exportado corresponde a la iteración 8000. La observación tiene 61 dimensiones y la acción 14 dimensiones, con una frecuencia de control de 50 Hz.

El autor advierte explícitamente que el entrenamiento no es bit-reproducible entre máquinas: repetir el mismo comando con el mismo `uv.lock` y la misma semilla produce una política comparable, no idénticos pesos. El normalizador de observaciones está embebido en `policy.onnx`, de modo que la política consume observaciones en bruto. El nombre del artefacto sugiere una fase de "progress12-v3" que continúa desde el paso 1500 hasta 10 000, con un intervalo de guardado de 1000 iteraciones.

## Capacidades

- Control de locomoción o manipulación del robot microduck mediante una política perpetua que se ejecuta hasta recibir una orden de parada.
- Mapeo directo de observaciones crudas de 61 dimensiones a 14 acciones de control a 50 Hz, sin preprocesado externo (normalizador embebido).
- Carga en una ranura de política del demonio `robotctl` mediante el comando `sudo robotctl policy load <slot> <repo>`.
- Reproducibilidad parcial: el autor documenta comando, semilla, commit y manifiesto de software para reentrenar una política equivalente.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, capacidades multilingües, visión, audio ni modo de pensamiento; no es un modelo generativo.

## Casos de uso

- Investigación en aprendizaje por refuerzo para robótica: sirve como política de referencia (`baseline`) para comparar nuevas variantes de entrenamiento en la tarea `SockHeist6m` dentro del ecosistema `microduck-challenges`.
- Despliegue en el robot microduck físico: se carga en una ranura del demonio `robotctl` para ejecutar una marcha o comportamiento continuo a 50 Hz.
- Reproducción de experimentos: el comando documentado con `uv sync`, el commit exacto y la semilla permiten reentrenar una política comparable en otra máquina.
- Evaluación de pipelines de exportación ONNX: el artefacto incluye el normalizador embebido y un `manifest.json` conforme al schema 2, útil para validar el flujo de exportación del daemon.
- Pruebas de integración del daemon `robotctl`: permite verificar la carga de políticas desde el Hub de Hugging Face en una ranura del robot.
- Docencia y divulgación: ejemplo completo y reproducible de un ciclo de RL (entrenamiento con 2048 entornos, checkpoint, exportación y despliegue) sobre un robot de bajo coste.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de recompensa, tasa de éxito de la tarea, latencia ni throughput.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el tamaño del repositorio es de 0.0 GB, lo que sugiere un modelo muy pequeño, pero no se especifican parámetros ni precisión.
- GPU recomendadas: no disponible para inferencia. Para reentrenamiento, el autor menciona entrenamiento con RL en GPU y 2048 entornos paralelos, sin especificar el modelo de GPU.
- Compatibilidad con GPU de consumo: no disponible; por el tamaño del artefacto (ONNX de menos de 0.1 GB) es plausible que quepa en cualquier GPU de consumo, pero no se confirma.
- Opciones de despliegue: carga en el robot mediante `sudo robotctl policy load <slot> ctcheung/microduck-sock-heist-6m-progress12-v3-from1500-10k`; inferencia vía ONNX Runtime (implícito en el formato, no documentado explícitamente).
- Latencia y throughput: no disponibles; la frecuencia de control es de 50 Hz (periodo de 20 ms), lo que fija un requisito de inferencia por debajo de ese umbral, pero no se aportan medidas.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| microduck-sock-heist-6m-progress12-v3-from1500-10k | Política RL (ONNX) para microduck | no disponible | no aplica | no disponible | Hugging Face (0 descargas) |
| Políticas microduck de referencia (p. ej. las publicadas por Pollen Robotics) | Política RL para microduck | no disponible | no aplica | no disponible | Repositorio microduck / Hub |
| Otras políticas del mismo autor en `microduck-challenges` | Política RL para microduck | no disponible | no aplica | no disponible | Hugging Face |

No se dispone de datos de rendimiento para establecer una comparación cuantitativa con alternativas. La comparación se limita a la categoría (políticas de control para el robot microduck) y a la disponibilidad.

## Limitaciones y advertencias

- Artefacto de investigación con 0 descargas y 0 likes: no hay evidencia de validación por terceros ni de uso en producción.
- Sin licencia declarada: no se puede asumir permiso para uso comercial, redistribución o modificación; es necesario contactar con el autor.
- Entrenamiento no bit-reproducible: el propio autor advierte que repetir el proceso produce pesos distintos, lo que complica la auditoría y la depuración.
- Exportado desde un checkout con cambios sin commitear, según la model card, lo que reduce la trazabilidad del artefacto final.
- Específico del robot microduck: la interfaz de 61 observaciones y 14 acciones a 50 Hz no es transferible a otros robots sin reentrenamiento.
- Sin datos de sesgos, alucinación o robustez: no aplican las categorías habituales de modelos de lenguaje, pero tampoco se documenta el comportamiento de la política ante perturbaciones, cambios de terreno o fallos de sensores.
- Sin métricas de éxito de la tarea: no es posible evaluar si la política cumple el objetivo `SockHeist6m` de forma fiable.
- El nombre del artefacto indica una continuación desde el paso 1500, pero no se documenta el rendimiento del checkpoint base ni la mejora obtenida.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ctcheung/microduck-sock-heist-6m-progress12-v3-from1500-10k
- Repositorio del robot microduck (Pollen Robotics): https://github.com/pollen-robotics/microduck
- Repositorio de retos de entrenamiento: `git@github.com:cct1123/microduck-challenges.git` (referenciado en la model card; no se dispone de URL web pública)
- Documentación del manifiesto de políticas: `docs/policy-manifest.md` en el repositorio del daemon (no se dispone de URL directa)
- Base de entrenamiento `mjlab-microduck 0.1.0`: commit `1efd853be` (no se dispone de URL directa)
