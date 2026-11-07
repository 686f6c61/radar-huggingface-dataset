# GinDuck/microduck-duck-rock-2

## Resumen

`GinDuck/microduck-duck-rock-2` es una política de control motor entrenada mediante aprendizaje por refuerzo para el robot cuadrúpedo de código abierto Microduck, desarrollado por Pollen Robotics y comercializado por Hugging Face. No es un modelo de lenguaje: es un controlador que mapea observaciones de 61 dimensiones a 14 acciones de actuadores a 50 Hz, empaquetado como grafo ONNX y publicado bajo la librería `microduck` con pipeline `robotics`. Su propósito es ejecutar una secuencia de acrobacias (voltereta hacia delante, patadas, flexiones y una reverencia profunda) de forma perpetua hasta que se le indique lo contrario.

El modelo se entrenó con el framework `mjlab` sobre el repositorio `microduck-challenges`, usando 4096 entornos paralelos durante 3000 iteraciones y una semilla fija (seed 1). El resultado es una política de desplazamiento continuo ("perpetual") que se carga en una ranura de política del demonio `robotctl` del robot. La normalización de observaciones está embebida en el propio `policy.onnx`, de modo que el robot puede alimentar observaciones en crudo.

Su relevancia es acotada pero concreta: forma parte de un ecosistema incipiente de políticas abiertas para robótica de bajo coste, donde el robot cuesta 399 dólares y las políticas se comparten como artefactos versionados. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y el tamaño del repo es de 0,0 GB, lo que sugiere un artefacto muy ligero (coherente con una política de control, no con un modelo neuronal de gran tamaño).

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Política de control motor entrenada por RL, exportada a ONNX (no se especifica la topología interna de la red) |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica; ventana de observación de 61 dimensiones por paso |
| Tipos de cuantización | no disponible (artefacto ONNX; no se documentan variantes cuantizadas) |
| Idiomas soportados | no aplica (modelo de robótica, sin entrada/salida de texto) |
| Licencia | no disponible |
| Formato de pesos | ONNX (`policy.onnx`) más `manifest.json` con esquema 2 del manifiesto de políticas de microduck |

## Arquitectura y entrenamiento

La política se entrenó con `mjlab` (versión base `mjlab-microduck 0.1.0 @ 1efd853be`) sobre la tarea `Mjlab-GotATalent-MicroDuck` del repositorio `microduck-challenges`, en la rama `main` y el commit `dc73b9237`. La configuración de entrenamiento usó 4096 entornos simulados en paralelo, un máximo de 3000 iteraciones del agente y semilla 1, con registro en TensorBoard bajo el nombre de ejecución `run-1031-1415`. El checkpoint publicado es el número 5.

El modelo opera a 50 Hz con un espacio de observación de 61 dimensiones y 14 acciones, y se describe como una política "perpetua": no termina por sí sola, sino que ejecuta su comportamiento de forma continua hasta que se le ordena lo contrario. La normalización de observaciones está integrada en el grafo ONNX, lo que elimina la necesidad de preprocesar las observaciones en el lado del robot. La model card indica explícitamente que el entrenamiento no es reproducible bit a bit entre máquinas: repetir el pipeline con el mismo código, `uv.lock`, comando y semilla produce una política comparable, pero no idéntica.

## Capacidades

- Control motor de un robot cuadrúpedo Microduck con 14 actuadores a 50 Hz.
- Ejecución de una secuencia de acrobacias: voltereta hacia delante, patadas, flexiones ("plumps") y reverencia profunda.
- Comportamiento perpetuo: mantiene la política activa de forma indefinida hasta recibir una orden de parada o cambio.
- Ingesta de observaciones en crudo gracias a la normalización embebida en el ONNX.
- Carga como ranura de política mediante `robotctl policy load <slot>`.
- Integración con el manifiesto de políticas de microduck (esquema 2).
- Atribución de "trucos invitados" a otros autores (JacoCronje, dashi, ElectricShaka), según la model card.
- No soporta tool calling, agentes, razonamiento multi-paso, texto, visión ni audio.

## Casos de uso

- Demostración de acrobacias en el robot Microduck: cargar la política en una ranura y dejar que el robot ejecute la secuencia de forma continua para exhibiciones o vídeos de producto.
- Investigación en aprendizaje por refuerzo para robótica de bajo coste: sirve como política de referencia entrenada con `mjlab` y 4096 entornos, útil para comparar configuraciones de entrenamiento o estudiar la transferencia sim-a-real en un cuadrúpedo de 399 dólares.
- Docencia y talleres de robótica: el flujo `robotctl policy load` y el manifiesto versionado permiten que estudiantes carguen una política funcional sin entrenar desde cero.
- Pruebas de integración del demonio `robotctl`: al ser una política perpetua con observaciones en crudo, es adecuada para validar el bucle de control a 50 Hz, la carga de ranuras y el esquema 2 del manifiesto.
- Base para desarrollo de nuevas políticas: el repositorio `microduck-challenges` y el comando de reproducción documentado permiten partir de esta configuración (4096 entornos, 3000 iteraciones, semilla 1) y modificarla.
- Benchmarking de simulación: comparar el comportamiento de esta política con otras del mismo autor (por ejemplo, `microduck-hill-climb-1m5-hill-2`) para evaluar la robustez de distintas tareas entrenadas con el mismo stack.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de recompensa, tasas de éxito ni comparaciones numéricas con otras políticas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el tamaño del repo es de 0,0 GB, lo que indica un artefacto ONNX muy pequeño, probablemente ejecutable en CPU.
- GPU recomendadas: no disponible. Por el tipo de artefacto (política de control en ONNX), la inferencia probablemente se ejecuta en la CPU del propio robot o en un equipo embebido, pero no se documenta.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: el método documentado es `robotctl policy load <slot> GinDuck/microduck-duck-rock-2` sobre el demonio de microduck; también puede ejecutarse el ONNX con un runtime ONNX estándar, aunque no se documenta.
- Latencia y throughput: no disponibles; el bucle de control opera a 50 Hz según la model card, pero no se publican cifras de latencia por inferencia.

## Comparativa con modelos similares

| Modelo | Tipo | Tarea | Observación / acciones | Frecuencia | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| `GinDuck/microduck-duck-rock-2` | Política RL (ONNX) | Acrobacias perpetuas | 61-D / 14 | 50 Hz | no disponible | Hugging Face |
| `GinDuck/microduck-hill-climb-1m5-hill-2` | Política RL (ONNX) | Subida de colina | no disponible | no disponible | no disponible | Hugging Face |
| Políticas abiertas de Pollen Robotics | Políticas RL | Locomoción y tareas base | no disponible | no disponible | no disponible | Repositorio `microduck` |

No se dispone de datos de rendimiento comparativo entre estas políticas en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no procesa texto, no responde preguntas y no tiene capacidades de razonamiento simbólico.
- La licencia no está especificada, lo que impide confirmar si se permite el uso comercial; conviene contactar con el autor antes de integrarlo en un producto.
- El entrenamiento no es reproducible bit a bit: los pesos publicados no pueden regenerarse de forma idéntica, solo obtener una política "comparable".
- El comportamiento es perpetuo por diseño; sin una orden explícita de parada o cambio de ranura, el robot seguirá ejecutando la secuencia.
- Depende del ecosistema `microduck` y del demonio `robotctl`; no se documenta compatibilidad con otros robots o stacks.
- No se documentan sesgos, tasas de alucinación ni limitaciones idiomáticas por tratarse de un controlador motor, pero tampoco se publican evaluaciones de robustez, seguridad física ni comportamiento ante perturbaciones.
- Cero descargas y cero likes en el momento de la consulta: no hay evidencia de uso en producción ni validación por parte de la comunidad.
- La model card menciona "trucos invitados" de otros autores sin detallar su contribución exacta ni la licencia de esos fragmentos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/GinDuck/microduck-duck-rock-2
- Repositorio de retos y entrenamiento: https://github.com/pollen-robotics/microduck-challenges
- Repositorio del robot microduck: https://github.com/pollen-robotics/microduck
- Documentación del manifiesto de políticas (`docs/policy-manifest.md` en el repo del demonio): no disponible como enlace directo en la información proporcionada
- Política relacionada del mismo autor: https://huggingface.co/GinDuck/microduck-hill-climb-1m5-hill-2
- Artículo de TechCrunch sobre Microduck: https://techcrunch.com/2026/08/27/hugging-face-is-selling-a-cute-399-open-source-duck-robot-microduck/
