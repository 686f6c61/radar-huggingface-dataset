# RSanchez996/microduck-tug-of-war-run-1103-1703

## Resumen

`microduck-tug-of-war-run-1103-1703` es una política de control entrenada mediante aprendizaje por refuerzo para el robot cuadrúpedo de código abierto microduck, desarrollado por Pollen Robotics. No es un modelo de lenguaje: es un controlador neuronal exportado a ONNX que recibe observaciones de 61 dimensiones y emite 14 acciones a 50 Hz, pensado para ejecutarse en el propio robot a través del daemon `robotctl`. El autor del artefacto es RSanchez996 y se distribuye con la librería `microduck` en HuggingFace.

La política se entrenó con el entorno `Mjlab-TugOfWar-MicroDuck` del repositorio `microduck-challenges`, sobre la base `mjlab-microduck 0.1.0`, con 2048 entornos paralelos, 1000 iteraciones máximas y semilla 1, alcanzando el checkpoint 900. El resultado es una marcha («gait») perpetua: se ejecuta de forma continua hasta que se le indique lo contrario, y se carga en una ranura de política del robot mediante un único comando.

Su relevancia es acotada pero concreta: demuestra el flujo completo de entrenamiento y despliegue de políticas de locomoción para un robot de bajo coste, con el normalizador de observaciones embebido en el propio ONNX y un manifiesto que sigue el esquema 2 del daemon. El repositorio ocupa 0,0 GB y no registra descargas ni interacciones en el momento de redactar esta ficha.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (política neuronal exportada a ONNX; arquitectura de red no detallada en la model card) |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (política de control, no modelo de lenguaje) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | ONNX (`policy.onnx`) + `manifest.json` (esquema 2 del manifiesto de políticas microduck) |
| Dimensión de observación | 61 |
| Dimensión de acción | 14 |
| Frecuencia de control | 50 Hz |
| Librería | microduck |
| Tamaño del repositorio | 0,0 GB |
| Pipeline | robotics |

## Arquitectura y entrenamiento

La model card no describe la topología de la red (número de capas, anchura, activaciones ni tipo de política). Lo que sí se documenta es el pipeline de entrenamiento: aprendizaje por refuerzo con el entorno `Mjlab-TugOfWar-MicroDuck`, definido en el repositorio `https://github.com/RSanchez996/microduck-challenges.git` (rama `main`, commit `610bda4f5`), sobre la base `mjlab-microduck 0.1.0` en el commit `1efd853be`. El entrenamiento usó 2048 entornos paralelos, un máximo de 1000 iteraciones del agente, semilla 1 y registro en TensorBoard bajo el nombre de ejecución `run-1103-1703`, iniciado el 2026-11-03T16:03:41Z. El checkpoint publicado corresponde al paso 900.

Una decisión técnica destacable es que el normalizador de observaciones está embebido dentro de `policy.onnx`, de modo que el consumidor debe alimentar observaciones en bruto sin preprocesar. El artefacto se acompaña de un `manifest.json` que sigue el esquema 2 del manifiesto de políticas del daemon microduck (documentado en `docs/policy-manifest.md` del repositorio del daemon). El autor advierte explícitamente que el entrenamiento no es reproducible bit a bit entre máquinas: misma semilla y mismo código producen una política comparable, no idéntica.

## Capacidades

- Locomoción continua del robot microduck: política perpetua que se ejecuta hasta recibir una orden de parada.
- Control a 50 Hz con observaciones de 61 dimensiones y 14 acciones, ajustado a la interfaz del daemon `robotctl`.
- Tarea específica de «tug of war» según el identificador del entorno de entrenamiento (`Mjlab-TugOfWar-MicroDuck`).
- Inferencia en el propio robot mediante ONNX, sin dependencia de un servidor externo.
- Normalización de observaciones integrada en el grafo ONNX, lo que simplifica la integración.
- Carga y sustitución en caliente mediante ranuras de política (`robotctl policy load <slot> ...`).
- No dispone de generación de texto, razonamiento, código, matemáticas, visión, audio, tool calling ni capacidades multilingües: no es un modelo de lenguaje.

## Casos de uso

- Despliegue de una marcha base en un microduck físico: cargar la política en una ranura con `robotctl policy load` y dejar que el robot camine de forma continua mientras se evalúa la estabilidad del gait en distintas superficies.
- Pruebas de estrés de hardware: al ser una política perpetua, sirve para someter a motores, batería y estructura a sesiones largas de locomoción y medir calentamiento y consumo.
- Referencia para entrenar políticas propias: el repositorio `microduck-challenges` y los hiperparámetros documentados (2048 entornos, 1000 iteraciones, semilla 1) permiten reproducir el pipeline y comparar contra esta política base.
- Comparación de checkpoints: al publicarse el checkpoint 900, puede contrastarse con checkpoints intermedios o con políticas de otras tareas para analizar la evolución del entrenamiento.
- Docencia e investigación en RL aplicado a robótica: ejemplo completo y de bajo coste del ciclo entorno → entrenamiento → exportación ONNX → despliegue en robot.
- Integración en pipelines de CI para robótica: validar automáticamente que una nueva compilación del daemon carga y ejecuta correctamente el `policy.onnx` y su `manifest.json` en simulación.
- Pruebas de compatibilidad del daemon: verificar el esquema 2 del manifiesto de políticas y el contrato de observación/acción en futuras versiones de microduck.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de recompensa, tasa de éxito, velocidad de desplazamiento, estabilidad ni comparaciones con otras políticas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el tamaño del repositorio es 0,0 GB y no se detalla el número de parámetros, aunque por la naturaleza del modelo (política de control para un robot de bajo coste) se espera que sea muy reducido.
- GPU recomendadas: no disponible. La inferencia está prevista en el propio robot vía ONNX, no necesariamente en GPU.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: daemon microduck con `robotctl policy load <slot> RSanchez996/microduck-tug-of-war-run-1103-1703`; ejecución del `policy.onnx` mediante un runtime ONNX.
- Latencia y throughput: no disponibles; el único dato temporal es la frecuencia de control de 50 Hz (periodo de 20 ms por ciclo).

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye otras políticas de microduck ni modelos comparables con los que contrastar parámetros, contexto, rendimiento, licencia o disponibilidad.

## Limitaciones y advertencias

- Licencia no especificada: no hay autorización explícita para uso comercial ni para redistribución; conviene contactar con el autor antes de cualquier uso en producción.
- Idiomas no aplicables, pero tampoco se documenta nada al respecto; el artefacto no procesa lenguaje.
- La model card no describe la arquitectura de red ni el número de parámetros, lo que dificulta auditorías técnicas y estimaciones de recursos.
- Entrenamiento no reproducible bit a bit: los pesos no pueden regenerarse de forma idéntica, solo obtener una política «comparable».
- Tarea muy específica (`TugOfWar-MicroDuck`): no se garantiza su comportamiento fuera del escenario de entrenamiento ni en otros robots distintos del microduck.
- Sin métricas publicadas de rendimiento, estabilidad o tasa de éxito: no hay evidencia cuantitativa de robustez en el mundo real.
- Repositorio sin descargas ni interacciones: ausencia de validación por parte de la comunidad.
- Riesgo de sobreajuste a la configuración de simulación (2048 entornos, semilla 1) y a la versión concreta de `mjlab-microduck` y del daemon.
- El normalizador está embebido en el ONNX: alimentar observaciones ya normalizadas produciría un comportamiento incorrecto.
- No aplica el riesgo de alucinación propio de los modelos de lenguaje, pero sí el riesgo de acciones erráticas del robot ante observaciones fuera de distribución.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/RSanchez996/microduck-tug-of-war-run-1103-1703
- Repositorio de entrenamiento: https://github.com/RSanchez996/microduck-challenges.git
- Repositorio del robot microduck: https://github.com/pollen-robotics/microduck
- Documentación del manifiesto de políticas (referenciada en la model card): `docs/policy-manifest.md` en el repositorio del daemon microduck (URL exacta no disponible)
