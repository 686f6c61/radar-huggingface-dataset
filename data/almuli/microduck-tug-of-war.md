# almuli/microduck-tug-of-war

## Resumen

`almuli/microduck-tug-of-war` es una política de control motor obtenida mediante aprendizaje por refuerzo para el robot microduck de Pollen Robotics. No es un modelo de lenguaje: se trata de una política de marcha («gait») que se carga en una ranura de política del demonio del robot y se ejecuta de forma continua hasta que se le indique lo contrario. El autor es el usuario `almuli` y el repositorio se publicó el 27 de octubre de 2026 con la librería `microduck` y formato de exportación ONNX.

La interfaz del modelo está definida con precisión: recibe observaciones de 61 dimensiones y emite 14 acciones a 50 Hz. El normalizador de observaciones está integrado dentro del grafo `policy.onnx`, por lo que la entrada debe ser la observación en crudo, y se acompaña de un `manifest.json` conforme al esquema 2 del manifiesto de políticas de microduck. El tamaño del repositorio es de 0,0 GB, coherente con una red de política de pequeñas dimensiones.

La relevancia práctica es acotada pero clara: es un artefacto reproducible y desplegable en hardware real con un solo comando (`robotctl policy load`). La model card documenta la trazabilidad completa del entrenamiento (tarea, repositorio, rama, commit, checkpoint, semilla y comando de reproducción), aunque no publica métricas de rendimiento, licencia ni detalles de la topología de la red.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red de política de aprendizaje por refuerzo exportada a ONNX; topología interna no documentada en la model card |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica; observación de 61 dimensiones por paso, sin memoria de contexto |
| Tipos de cuantizacion | no disponible; se distribuye únicamente en ONNX con el normalizador incorporado en el grafo |
| Idiomas soportados | no disponible; no aplica (no es un modelo de lenguaje) |
| Licencia | no disponible (la model card no especifica licencia) |
| Formato de pesos | ONNX (`policy.onnx`) y manifiesto `manifest.json` (esquema 2 del microduck policy manifest) |
| Dimension de observacion | 61 |
| Dimension de accion | 14 |
| Frecuencia de control | 50 Hz |
| Modo de ejecucion | perpetuo (se ejecuta hasta que se detiene explícitamente) |
| Libreria | `microduck` |
| Tarea de entrenamiento | `Mjlab-TugOfWar-MicroDuck` |
| Tamano del repositorio | 0,0 GB |

## Arquitectura y entrenamiento

La model card no describe la topología de la red (capas, anchuras ni tipo de extractor de características); únicamente indica que se trata de una política de RL entrenada con la tarea `Mjlab-TugOfWar-MicroDuck` y exportada a ONNX. El nombre de la clase del actor utilizada en el entrenamiento (`microduck_challenges.tug_of_war.opponent:StartActor`) sugiere un esquema actor-crítico con un actor denominado `StartActor`, aunque no se detalla su implementación. La base declarada es `mjlab-microduck 0.1.0 @ 1efd853be`.

El entrenamiento se realizó en 4096 entornos paralelos, con un máximo de 500 iteraciones, intervalos de guardado cada 50 iteraciones, semilla 2 y registro en TensorBoard (nombre de ejecución `pool2`). El checkpoint publicado es el 150. La trazabilidad incluye el repositorio `pollen-robotics/microduck-challenges`, rama `tug-pit-marker`, commit `0ae9b20fa` e inicio el 2026-10-27T15:09:31Z; el autor advierte que la exportación se hizo desde un checkout con cambios sin confirmar. El propio autor señala que el proceso no es reproducible bit a bit entre máquinas: misma semilla y mismo código producen una política comparable, no idéntica. No se documenta composición del dataset, uso de RLHF/DPO ni innovaciones de decodificación, por no ser aplicables a este dominio.

## Capacidades

- Generación de marcha continua para el robot microduck: política perpetua que se ejecuta hasta recibir una orden de parada.
- Control motor de ciclo cerrado a 50 Hz con 14 acciones de salida.
- Consumo de observaciones de 61 dimensiones en crudo, con normalización resuelta dentro del grafo ONNX.
- Carga en caliente en una ranura de política mediante `robotctl policy load <slot> almuli/microduck-tug-of-war`.
- Integración con el ecosistema de manifiestos de microduck (esquema 2), lo que permite al demonio del robot validar y desplegar la política.
- Ejecución en el runtime del robot sin dependencia de una pila de inferencia de modelos de lenguaje.
- Reproducibilidad del entrenamiento documentada mediante comando `uv` con parámetros fijos (entornos, iteraciones, semilla, clase de actor).
- No dispone de capacidades de lenguaje, visión, tool calling, razonamiento multi-paso ni multilingüismo.

## Casos de uso

- Despliegue de una marcha base en un microduck físico: cargar la política en una ranura con `robotctl policy load` y verificar en banco que el robot mantiene el patrón de locomoción de forma indefinida, aprovechando que la política es perpetua.
- Tarea de referencia para el benchmark `Mjlab-TugOfWar-MicroDuck`: sirve como oponente o como política inicial en experimentos de competición dentro de `microduck-challenges`.
- Punto de partida para ajuste fino: al estar documentados tarea, commit y semilla, un equipo puede reentrenar con la misma receta y comparar políticas derivadas frente al checkpoint 150.
- Validación de la cadena de herramientas del robot: usar el `policy.onnx` y su `manifest.json` para comprobar que el demonio acepta manifiestos de esquema 2 y que el normalizador integrado funciona con observaciones crudas.
- Pruebas de robustez en hardware: al ejecutarse de forma continua, permite medir deriva, calentamiento de actuadores y consumo energético en sesiones largas de operación.
- Demostraciones y docencia en robótica con RL: el comando de reproducción completo (4096 entornos, 500 iteraciones, semilla 2) es un ejemplo autocontenido de flujo de entrenamiento y exportación a ONNX.
- Integración en pipelines de evaluación automatizada: al ser un artefacto ONNX pequeño, se puede ejecutar en CPU fuera del robot para regression tests del comportamiento de la política antes de desplegarla.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente aporta hiperparámetros de entrenamiento (4096 entornos, 500 iteraciones, checkpoint 150, semilla 2) y no incluye métricas de recompensa, tasa de éxito, estabilidad de la marcha ni comparaciones con otras políticas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. Al ser una política ONNX de 61 entradas y 14 salidas, el requisito es previsiblemente mínimo, pero no se publica el número de parámetros ni el tamaño del grafo.
- GPU recomendadas para inferencia: no aplica; el destino natural es la computación embebida del robot o una CPU convencional.
- GPU para reentrenamiento: no disponible en la información proporcionada; el comando de reproducción lanza 4096 entornos paralelos, lo que implica aceleración por GPU para el entrenamiento, pero no se especifica el modelo.
- Cabe en GPU de consumo: no disponible como dato confirmado; por la naturaleza del artefacto (repositorio de 0,0 GB, salida de 14 acciones) no se espera que requiera una GPU dedicada para inferencia.
- Opciones de despliegue: demonio de políticas de microduck mediante `robotctl policy load <slot> <repo>`; ejecución directa del grafo `policy.onnx` con un runtime ONNX estándar.
- Latencia y throughput: el bucle de control está fijado a 50 Hz, lo que impone un presupuesto de 20 ms por paso; no se publican mediciones de latencia real ni de throughput.

## Comparativa con modelos similares

| Modelo | Parametros | Observacion / control | Rendimiento publicado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `almuli/microduck-tug-of-war` | no disponible | 61-D, 14 acciones, 50 Hz | sin benchmarks | no disponible | HuggingFace, 0 descargas, 0 likes |
| Otras politicas del repo `microduck-challenges` | no disponible | no disponible | no disponible | no disponible | no disponible en la informacion proporcionada |
| Politicas de locomocion para robots cuadrupedos de tamano reducido | no disponible | no disponible | no disponible | no disponible | no disponible en la informacion proporcionada |

No se dispone de datos de parámetros, contexto, rendimiento ni licencia de alternativas comparables en la información proporcionada, por lo que no es posible establecer una comparación cuantitativa.

## Limitaciones y advertencias

- No es un modelo de lenguaje ni un modelo generativo de propósito general; cualquier uso fuera del control del robot microduck carece de sentido.
- Licencia no especificada: no se puede asumir permiso de uso comercial ni de redistribución. Es necesario contactar con el autor antes de integrarlo en un producto.
- Ausencia total de métricas: no hay datos de tasa de éxito, estabilidad, consumo ni robustez frente a perturbaciones, lo que impide evaluar su calidad sin probarla en hardware.
- Entrenamiento exportado desde un checkout con cambios sin confirmar, lo que introduce una discrepancia potencial entre el código publicado y el que produjo los pesos.
- Reproducibilidad limitada: el autor advierte explícitamente de que el entrenamiento con RL en GPU no es reproducible bit a bit entre máquinas; la misma receta produce políticas comparables, no idénticas.
- Comportamiento perpetuo: la política se ejecuta hasta que se detiene, por lo que requiere mecanismos externos de parada y supervisión durante las pruebas en robot real.
- Dependencia del normalizador integrado: alimentar observaciones ya normalizadas produciría un comportamiento incorrecto, ya que la normalización está incorporada en el grafo.
- Acoplamiento fuerte al hardware y a la versión del demonio: cambios en el firmware, en el esquema de manifiesto o en la definición de las 61 observaciones pueden invalidar la política.
- Sin datos de sesgos en el sentido de modelos de lenguaje; el riesgo análogo es el sobreajuste a las condiciones del simulador de entrenamiento y la consiguiente pérdida de rendimiento en el mundo real (sim-to-real gap), no cuantificado.
- Sin soporte multiidioma, de tool calling ni de agentes: no aplica.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/almuli/microduck-tug-of-war
- Repositorio del robot microduck (Pollen Robotics): https://github.com/pollen-robotics/microduck
- Repositorio de retos y entrenamiento: https://github.com/pollen-robotics/microduck-challenges (rama `tug-pit-marker`, commit `0ae9b20fa`)
- Documentación del manifiesto de políticas: `docs/policy-manifest.md` en el repositorio del demonio de microduck (URL no proporcionada en la información disponible)
- Base de entrenamiento: `mjlab-microduck 0.1.0` en el commit `1efd853be` (URL no proporcionada en la información disponible)
