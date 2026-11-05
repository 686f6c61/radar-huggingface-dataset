# GinDuck/microduck-roller-sprint-2m-roller-2-c

## Resumen

`microduck-roller-sprint-2m-roller-2-c` es una política de control por refuerzo para el robot cuadrúpedo de bajo coste microduck de Pollen Robotics, publicada por el usuario GinDuck en HuggingFace. No es un modelo de lenguaje ni un modelo fundacional: es un checkpoint de entrenamiento (iteración 5500 de un total de 6000) que implementa una marcha o *gait* perpetua para un robot que se desplaza sobre ruedas (*rollers*). La política consume observaciones de 61 dimensiones y emite 14 acciones a 50 Hz, y se ejecuta de forma continua hasta que se le ordena detenerse.

El modelo se distribuye en formato ONNX, con el normalizador de observaciones embebido en el propio grafo, de modo que el consumidor debe alimentar observaciones en bruto. Se acompaña de un `manifest.json` que sigue el esquema 2 del manifiesto de políticas de microduck. El repositorio tiene un tamaño de 0,0 GB (probablemente por redondeo, dado que el archivo ONNX es pequeño). La licencia no está especificada.

La relevancia de esta ficha es acotada: se trata de un artefacto de investigación en robótica con refuerzo, no de un modelo de propósito general. Su interés radica en que documenta un flujo de entrenamiento reproducible (mjlab + microduck-challenges, rama `race-2`, commit `b44f7ffc9`) y en que ejemplifica cómo se publican políticas de control como artefactos versionados listos para desplegar en hardware real mediante `robotctl`.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Política de control por refuerzo (no especificada en detalle; red neuronal entrenada con mjlab) |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (no es un modelo de lenguaje); observación de 61 dimensiones por paso |
| Tipos de cuantización | no disponible (se distribuye como ONNX) |
| Idiomas soportados | no aplica |
| Licencia | no disponible |
| Formato de pesos | ONNX (`policy.onnx`) + `manifest.json` (esquema 2) |
| Frecuencia de control | 50 Hz |
| Dimensiones de observación | 61 |
| Dimensiones de acción | 14 |
| Checkpoint | 5500 (de 6000 iteraciones máximas) |
| Semilla | 1 |
| Task ID | `Mjlab-RollerSprint2m-MicroDuck` |

## Arquitectura y entrenamiento

La información disponible no detalla la topología de la red (número de capas, anchura, activaciones). Lo que sí se documenta es el pipeline de entrenamiento: se usó `mjlab-microduck 0.1.0` (commit `1efd853be`) sobre el repositorio `pollen-robotics/microduck-challenges`, rama `race-2`, commit `b44f7ffc9`. El entrenamiento se lanzó con 2048 entornos paralelos, un máximo de 6000 iteraciones y semilla 1, con registro en TensorBoard bajo el nombre de ejecución `roller-2`. El checkpoint publicado corresponde a la iteración 5500, descrito por el autor como un checkpoint temprano de su segunda ejecución con *rollers*.

El autor advierte explícitamente que el entrenamiento no es bit-reproducible entre máquinas: repetir el comando con el mismo `uv.lock`, el mismo commit y la misma semilla produce una política comparable, pero no idéntica. Esta es una propiedad conocida del aprendizaje por refuerzo con GPU y conviene tenerla en cuenta si se pretende auditar el resultado. La política es perpetua: no tiene condición de terminación interna y se ejecuta hasta que el operador la detiene. El normalizador de observaciones está integrado en el ONNX, lo que elimina una fuente habitual de errores de integración.

## Capacidades

- Locomoción sobre ruedas (*rollers*) para el robot microduck, con una marcha orientada a velocidad y no a patinaje.
- Ejecución perpetua: la política no termina por sí misma, sino que corre de forma continua hasta que se descarga o se sustituye.
- Consumo de observaciones en bruto: el normalizador va embebido en `policy.onnx`, por lo que no requiere preprocesado externo.
- Control a 50 Hz con 61 entradas de observación y 14 salidas de acción.
- Despliegue en robot real mediante `robotctl policy load <slot> <repo>`.
- Completar cada carrera en aproximadamente 1,5 segundos según el autor.
- No soporta tool calling, agentes, razonamiento multi-paso, visión, audio ni capacidades multilingües: es una política motora, no un modelo generativo.

## Casos de uso

- **Investigación en locomoción con refuerzo sobre ruedas**: sirve como línea base reproducible para comparar recetas de entrenamiento en el entorno `Mjlab-RollerSprint2m-MicroDuck`, usando el mismo task ID y configuración de entornos paralelos.
- **Despliegue de referencia en microduck físico**: permite cargar una política funcional en un slot del daemon con `robotctl policy load` y validar la cadena completa de observación normalizada y actuación a 50 Hz sobre hardware real.
- **Pruebas de integración del daemon y del manifiesto**: al seguir el esquema 2 del manifiesto de políticas, es útil para verificar que el daemon interpreta correctamente `manifest.json` y el ONNX asociado antes de publicar políticas propias.
- **Benchmark interno de velocidad de carrera**: dado que el autor reporta un tiempo de aproximadamente 1,5 segundos por carrera, puede emplearse como referencia de rendimiento frente a otras políticas de la misma familia (por ejemplo, variantes de patinaje).
- **Docencia y demostración de RL aplicado a robótica**: el flujo completo (clonar `microduck-challenges`, `uv sync`, `uv run train`) es un ejemplo compacto de entrenamiento con 2048 entornos paralelos y registro en TensorBoard.
- **Base para *fine-tuning* o continuación de entrenamiento**: al ser un checkpoint intermedio (5500 de 6000), puede reutilizarse como inicialización para experimentos que exploren recetas alternativas sobre la rama `race-2`.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El único dato de rendimiento reportado por el autor es cualitativo y específico de la tarea: cada carrera se completa en aproximadamente 1,5 segundos. No hay métricas de recompensa, distancia recorrida, estabilidad ni comparación numérica con otras políticas.

## Requisitos de hardware

- **VRAM estimada para inferencia**: no disponible; el repositorio ocupa 0,0 GB según HuggingFace, lo que sugiere un modelo ONNX de tamaño muy reducido, probablemente ejecutable en CPU.
- **GPU recomendadas**: no disponibles. Para el entrenamiento, el autor emplea 2048 entornos paralelos, lo que implica una GPU de gama alta (no especificada); para inferencia no se documenta requisito alguno.
- **Viabilidad en GPU de consumo**: no confirmada explícitamente, pero el tamaño del artefacto y el hecho de que sea una política de 61 entradas y 14 salidas hacen plausible la inferencia en CPU o en GPU de gama baja; no hay datos publicados que lo confirmen.
- **Opciones de despliegue**: `robotctl policy load <slot> GinDuck/microduck-roller-sprint-2m-roller-2-c` sobre el daemon de microduck; el runtime subyacente es ONNX.
- **Latencia y throughput**: la política opera a 50 Hz (periodo de 20 ms por paso de control); no se publican cifras de latencia de inferencia.

## Comparativa con modelos similares

No se dispone de información sobre otras políticas comparables en la misma familia más allá de la mención a la "segunda ejecución con rollers" del propio autor y a la receta compartida por TheSauceman. No hay datos de parámetros, contexto ni rendimiento de alternativas, por lo que la comparación cuantitativa no está disponible.

| Modelo | Tipo | Observación | Acciones | Frecuencia | Licencia | Formato |
|---|---|---|---|---|---|---|
| microduck-roller-sprint-2m-roller-2-c | Política RL (rollers) | 61 | 14 | 50 Hz | no disponible | ONNX |
| Alternativas de la familia microduck | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- **Licencia no especificada**: no hay licencia declarada, lo que impide asumir permisos de uso comercial, redistribución o modificación. Cualquier uso en producción requiere contactar con el autor.
- **Ámbito muy restringido**: es una política motora para un robot concreto (microduck sobre rollers); no es reutilizable como modelo de propósito general.
- **Checkpoint intermedio**: corresponde a la iteración 5500 de 6000, descrito por el autor como un checkpoint temprano de su segunda ejecución; no es necesariamente la versión final ni la mejor.
- **No reproducible bit a bit**: el propio autor advierte que reentrenar con la misma semilla y configuración produce una política comparable pero no idéntica, lo que dificulta la auditoría exacta.
- **Sin datos de robustez**: no se publican métricas de estabilidad, comportamiento ante perturbaciones, terreno variable ni fallos en hardware real.
- **Comportamiento perpetuo**: la política no se detiene por sí misma; el operador debe gestionar la parada, lo que exige supervisión en despliegues reales.
- **Riesgo de alucinación, sesgos o limitaciones idiomáticas**: no aplica, al no ser un modelo de lenguaje.
- **Documentación mínima**: la model card no incluye topología de red, número de parámetros, datos de entrenamiento ni curvas de recompensa, lo que limita la evaluación técnica independiente.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/GinDuck/microduck-roller-sprint-2m-roller-2-c
- Repositorio microduck (Pollen Robotics): https://github.com/pollen-robotics/microduck
- Repositorio de retos y entrenamiento: https://github.com/pollen-robotics/microduck-challenges (rama `race-2`, commit `b44f7ffc9`)
- Documentación del manifiesto de políticas: `docs/policy-manifest.md` en el repositorio del daemon (no se proporciona URL directa)
