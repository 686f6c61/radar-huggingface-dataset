# atomicvox/microduck-sprint-2m-run-1117-1242

## Resumen

`microduck-sprint-2m-run-1117-1242` es una política de control entrenada mediante aprendizaje por refuerzo para el robot cuadrúpedo de código abierto microduck, desarrollado por Pollen Robotics. No se trata de un modelo de lenguaje ni de un modelo fundacional generativo, sino de un controlador neuronal exportado a ONNX que produce comandos de actuación a partir de observaciones del robot. Lo publica el usuario `atomicvox` dentro de un conjunto de experimentos de robótica denominado `microduck-challenges`.

El modelo resuelve la tarea identificada como `Mjlab-Sprint2m-MicroDuck`, que corresponde a una marcha de sprint de 2 metros para el microduck. La política es de tipo perpetuo: una vez cargada en una ranura de política del daemon del robot, se ejecuta de forma continua hasta que se detiene explícitamente. Trabaja a 50 Hz, consume observaciones de 61 dimensiones y emite 14 acciones.

Su relevancia es acotada pero concreta: demuestra el flujo completo de entrenamiento y despliegue de políticas de locomoción para un robot de bajo coste, con un pipeline reproducible basado en `mjlab`, `uv` y exportación a ONNX. El repositorio tiene un tamaño de 0,0 GB y no registra descargas ni likes en el momento de la consulta, por lo que debe considerarse un artefacto experimental más que un modelo de producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Política neuronal para control robótico (red de política entrenada con RL; topología interna no disponible) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (observación de 61 dimensiones por paso) |
| Tipos de cuantizacion | no disponible (pesos exportados a ONNX) |
| Idiomas soportados | no aplica (modelo de control, no lingüístico) |
| Licencia | no disponible |
| Formato de pesos | ONNX (`policy.onnx`) y `manifest.json` según esquema 2 del manifiesto de políticas microduck |

## Arquitectura y entrenamiento

La política se entrena con aprendizaje por refuerzo en el entorno `Mjlab-Sprint2m-MicroDuck`, sobre la base `mjlab-microduck 0.1.0` (commit `1efd853be`). El entrenamiento se ejecutó con 4096 entornos paralelos, un máximo de 2000 iteraciones del agente, semilla 1 y registro en TensorBoard, bajo el nombre de ejecución `run-1117-1242`. El checkpoint publicado corresponde al paso 1250. La tarea se define en el repositorio `atomicvox/microduck-challenges`, rama `main`, commit `7b69a70d2`.

El autor advierte explícitamente que el entrenamiento no es reproducible bit a bit entre máquinas: repetir el mismo comando con el mismo `uv.lock` y la misma semilla produce una política comparable, no pesos idénticos. La normalización de observaciones está incorporada dentro de `policy.onnx`, de modo que el robot debe alimentar observaciones en crudo. La interfaz es de 61 dimensiones de observación y 14 acciones a 50 Hz. No se dispone de información sobre el número de parámetros, la topología de la red ni la composición exacta de las recompensas.

## Capacidades

- Locomoción cuadrúpeda: genera una marcha de sprint de 2 metros para el microduck.
- Política perpetua: se ejecuta de forma continua hasta que se detiene o se sustituye.
- Control en tiempo real a 50 Hz con 14 acciones de salida.
- Consumo de observaciones en crudo gracias a la normalización integrada en el ONNX.
- Despliegue mediante el daemon del robot con `robotctl policy load`.
- Exportación a ONNX para inferencia en el propio robot.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingües, por no ser un modelo de lenguaje.

## Casos de uso

- Locomoción de sprint en el microduck: cargar la política en una ranura mediante `robotctl policy load <slot> atomicvox/microduck-sprint-2m-run-1117-1242` para que el robot ejecute una marcha de avance continuo a 50 Hz.
- Investigación en aprendizaje por refuerzo: servir como referencia de una ejecución concreta (semilla 1, 4096 entornos, checkpoint 1250) para comparar curvas de recompensa y estabilidad frente a otras ejecuciones del mismo banco de tareas.
- Reproducción de experimentos: clonar `microduck-challenges` en el commit `7b69a70d2` y relanzar el entrenamiento con `uv run train` para generar políticas comparables y estudiar la variabilidad entre máquinas.
- Evaluación de robustez de marchas: probar la política en distintas condiciones de terreno o carga dentro del simulador `mjlab` antes de transferirla al robot físico.
- Despliegue embebido: usar el ONNX con la normalización integrada para inferencia directa en el hardware del microduck, sin preprocesado adicional en el host.
- Docencia y prototipado en robótica de bajo coste: emplear el flujo completo (entrenamiento, exportación y carga en el daemon) como ejemplo práctico de pipeline de RL a robot real.
- Comparación de políticas: mantener esta política en una ranura y alternarla con otras marchas del mismo autor para evaluar comportamiento en el mismo robot.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el tamaño del repositorio es de 0,0 GB, lo que sugiere un modelo muy pequeño, pero no se confirma el número de parámetros.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: runtime ONNX en el propio robot a través del daemon microduck (`robotctl policy load`); no se documentan otros runners.
- Latencia y throughput: frecuencia de control fijada en 50 Hz (periodo de 20 ms); no se publican medidas de latencia real ni de throughput de entrenamiento.
- Entrenamiento: el autor emplea 4096 entornos paralelos, lo que implica aceleración por GPU, pero no se especifica el hardware utilizado.

## Comparativa con modelos similares

| Modelo | Tipo | Observaciones / acciones | Frecuencia | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `atomicvox/microduck-sprint-2m-run-1117-1242` | Política RL para microduck (ONNX) | 61 / 14 | 50 Hz | no disponible | Hugging Face, 0 descargas |
| Otras políticas del banco `microduck-challenges` | Políticas RL para microduck | no disponible | no disponible | no disponible | Repositorio del autor |
| Políticas de locomoción para cuadrúpedos comerciales (p. ej. Unitree, ANYmal) | Políticas RL propietarias o de investigación | no disponible | no disponible | habitualmente restrictiva | No comparables directamente por hardware y tarea |

No se dispone de datos públicos de rendimiento que permitan una comparación cuantitativa con alternativas.

## Limitaciones y advertencias

- Artefacto experimental: cero descargas y cero likes; no hay evidencia de validación externa ni de uso en producción.
- Licencia no disponible: no puede asumirse permiso para uso comercial, modificación o redistribución.
- Sesgos: no aplica en el sentido lingüístico, pero la política puede estar sobreajustada a las condiciones del simulador `mjlab` y a la tarea `Mjlab-Sprint2m-MicroDuck`.
- Brecha simulación-real: no se documenta ninguna validación en el robot físico ni resultados de transferencia.
- Reproducibilidad limitada: el propio autor indica que el entrenamiento no es bit a bit reproducible; los pesos publicados no pueden regenerarse de forma idéntica.
- Tarea única: la política está especializada en una marcha de sprint de 2 metros; no se documenta generalización a otras tareas, terrenos o velocidades.
- Sin información sobre robustez ante perturbaciones, caídas o recuperación.
- No apta para tareas de percepción, lenguaje, razonamiento o generación de contenido.
- El manifiesto sigue el esquema 2 del daemon microduck; cambios de esquema podrían romper la carga de la política.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/atomicvox/microduck-sprint-2m-run-1117-1242
- Repositorio de desafíos y entrenamiento: `git@github.com:atomicvox/microduck-challenges.git` (commit `7b69a70d2`)
- Proyecto microduck de Pollen Robotics: https://github.com/pollen-robotics/microduck
- Documentación del manifiesto de políticas: `docs/policy-manifest.md` en el repositorio del daemon microduck
- Base de entrenamiento: `mjlab-microduck 0.1.0` (commit `1efd853be`)
