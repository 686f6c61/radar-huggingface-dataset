# Alex711101/microduck-speed13-seed2-500

## Resumen

`microduck-speed13-seed2-500` es una política de control entrenada mediante aprendizaje por refuerzo para el robot cuadrúpedo de bajo coste microduck, desarrollado por Pollen Robotics. No se trata de un modelo de lenguaje, sino de un controlador neuronal exportado a ONNX que genera comandos de locomoción a 50 Hz a partir de observaciones propioceptivas del robot. La política se ha entrenado en simulación con el entorno `Mjlab-RollerSprint2m-MicroDuck` y está pensada para ser cargada directamente en una ranura de política del daemon `robotctl` del robot.

El modelo es una política perpetua: una vez cargada, ejecuta una marcha continua hasta que se le indique lo contrario. La observación tiene 61 dimensiones y la acción 14 dimensiones, correspondientes a las articulaciones del cuadrúpedo. El entrenamiento se realizó con 4096 entornos paralelos, 1500 iteraciones máximas y semilla 2, guardando el checkpoint 500, lo que sugiere que la política final corresponde a una fase temprana del entrenamiento o a un ajuste específico de velocidad.

La relevancia de esta ficha es acotada: se trata de un artefacto de investigación reproducible, con cero descargas y cero likes en el momento de la consulta, y sin model card extendida más allá de los metadatos de entrenamiento. No hay información sobre licencia, idiomas ni benchmarks de rendimiento en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Política neuronal para control robótico, exportada a ONNX (detalles de capas no disponibles) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (política de control, no modelo de lenguaje) |
| Tipos de cuantizacion | no disponible (el artefacto se distribuye como `policy.onnx`) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | ONNX (`policy.onnx`) y `manifest.json` con esquema 2 del manifiesto de políticas microduck |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna de la red (número de capas, dimensión oculta, tipo de activación). Lo que sí se conoce es la interfaz: observación de 61 dimensiones, acción de 14 dimensiones, frecuencia de control de 50 Hz y ejecución sobre ruedas (rollers). El normalizador de observaciones está embebido en `policy.onnx`, de modo que el consumidor debe alimentar observaciones en crudo.

El entrenamiento se realizó con el framework `mjlab` (versión base `mjlab-microduck 0.1.0` en el commit `1efd853be`), sobre el repositorio `microduck-challenges` en la rama `main`, commit `a1aee7f22`. Se usaron 4096 entornos paralelos, hasta 1500 iteraciones del agente, semilla 2, guardado cada 100 iteraciones y logging en TensorBoard con el nombre de ejecución `speed13_seed2`. El checkpoint exportado es el 500. El autor advierte explícitamente que el entrenamiento no es bit-reproducible entre máquinas: repetir el comando con el mismo código, `uv.lock`, comando y semilla produce una política comparable, no los mismos pesos.

## Capacidades

- Locomoción continua del robot microduck sobre ruedas a 50 Hz.
- Generación de comandos articulares de 14 dimensiones a partir de observaciones propioceptivas de 61 dimensiones.
- Ejecución perpetua: la política corre hasta que se le indique lo contrario.
- Carga directa en una ranura del daemon mediante `robotctl policy load`.
- Normalización de observaciones integrada en el grafo ONNX.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingües: no es un modelo de lenguaje.
- No se documentan capacidades de visión, audio ni modo de razonamiento.

## Casos de uso

- Investigación en aprendizaje por refuerzo para robótica: sirve como política de referencia reproducible para comparar variantes de entrenamiento (semillas, checkpoints, tareas) sobre el mismo entorno `Mjlab-RollerSprint2m-MicroDuck`.
- Despliegue en el robot microduck de Pollen Robotics: se carga en una ranura con `robotctl policy load <slot> Alex711101/microduck-speed13-seed2-500` y el robot ejecuta la marcha de forma continua, útil para pruebas de locomoción sobre ruedas.
- Benchmarking de pipelines de simulación a realidad: al estar exportada a ONNX con normalizador embebido, permite medir la brecha sim-to-real de una política entrenada con 4096 entornos paralelos.
- Docencia y talleres de RL robótico: el comando de reproducción completo (clonar repo, `uv sync`, `uv run train ...`) permite a estudiantes reentrenar y comparar políticas con una configuración fija y documentada.
- Integración en el daemon `robotctl`: el `manifest.json` sigue el esquema 2 documentado en `docs/policy-manifest.md`, lo que facilita el encaje en el sistema de ranuras de políticas del robot.
- Pruebas de robustez de controladores: al ser una política perpetua de velocidad (`speed13`), puede usarse para evaluar comportamiento sostenido, deriva y estabilidad en ejecuciones largas sobre ruedas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. Al ser una política de control de pequeña dimensión (61 entradas, 14 salidas) exportada a ONNX, es previsible que quepa en CPU y en GPUs de gama baja, pero no se aportan cifras.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no confirmada en la información disponible.
- Opciones de despliegue: ONNX Runtime (formato `policy.onnx`) y el daemon `robotctl` del robot microduck mediante `robotctl policy load`.
- Latencia y throughput: no disponibles; la frecuencia de control declarada es de 50 Hz.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye otras políticas microduck ni modelos comparables de la misma categoría con datos de parámetros, contexto o rendimiento.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no procesa texto, no responde a prompts y no tiene capacidades de razonamiento simbólico.
- Diseñada específicamente para el robot microduck sobre ruedas; no se garantiza su transferencia a otras morfologías o condiciones.
- Licencia no disponible: no se puede confirmar el uso comercial ni la redistribución.
- Entrenamiento no bit-reproducible: el autor advierte que reentrenar con la misma semilla produce pesos distintos.
- Checkpoint 500 de un máximo de 1500 iteraciones: puede representar una política no convergida o un ajuste deliberado; no se documenta la curva de recompensa.
- Exportada desde un checkout con cambios sin commitear, según la model card, lo que puede afectar a la reproducibilidad exacta del artefacto.
- Cero descargas y cero likes en el momento de la consulta: sin validación externa por parte de la comunidad.
- No se documentan sesgos, tasas de alucinación ni evaluaciones de seguridad, al no tratarse de un modelo generativo de texto.

## Enlaces

- Hugging Face: https://huggingface.co/Alex711101/microduck-speed13-seed2-500
- Repositorio de entrenamiento: https://github.com/alex711104-a11y/microduck-challenges.git
- Proyecto microduck (Pollen Robotics): https://github.com/pollen-robotics/microduck
