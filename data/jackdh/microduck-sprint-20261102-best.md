# JackDH/microduck-sprint-20261102-best

## Resumen

microduck-sprint-20261102-best es una política de control robótico entrenada mediante aprendizaje por refuerzo para el robot cuadrúpedo de código abierto microduck, desarrollado por Pollen Robotics. El modelo ha sido publicado por el usuario JackDH y se distribuye como un archivo ONNX (policy.onnx) junto con un manifiesto en formato JSON que sigue el esquema 2 del manifiesto de políticas de microduck. No se trata de un modelo de lenguaje, sino de un controlador de locomoción que opera a 50 Hz sobre un espacio de observación de 61 dimensiones y un espacio de acción de 14 dimensiones.

La política se describe como "perpetua": ejecuta un patrón de marcha (gait) de forma continua hasta que se le indique lo contrario, y está pensada para cargarse en una ranura de política del demonio robotctl del robot. El checkpoint seleccionado es el 1000 de un entrenamiento de línea base denominado "sprint-2m", ejecutado localmente en una RTX 4090 con el entorno de simulación mjlab-microduck 0.1.0. El identificador de tarea es Mjlab-Sprint2m-MicroDuck y el entrenamiento se realizó con semilla 1 sobre 4096 entornos paralelos.

Por su naturaleza, este artefacto es relevante para la comunidad de robótica de refuerzo que trabaja con microduck: proporciona una política lista para desplegar, reproducible en código (aunque no bit a bit), y con la normalización de observaciones integrada en el propio ONNX, lo que simplifica la integración con el robot. Al tratarse de un repositorio sin descargas ni likes y con un tamaño de 0.0 GB, cabe esperar que el peso sea muy reducido, coherente con una red de política compacta para control motor.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Red de política de aprendizaje por refuerzo (detalles de capas no disponibles); exportada a ONNX |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplicable (política de control, no modelo de lenguaje) |
| Tipos de cuantización | no disponible; se distribuye como ONNX (presumiblemente FP32) |
| Idiomas soportados | no aplicable |
| Licencia | no disponible |
| Formato de pesos | ONNX (policy.onnx) más manifest.json (esquema 2) |
| Espacio de observación | 61 dimensiones |
| Espacio de acción | 14 dimensiones |
| Frecuencia de control | 50 Hz |
| Librería | microduck |
| Pipeline | robotics |

## Arquitectura y entrenamiento

La información disponible no detalla la topología interna de la red (número de capas, unidades ocultas ni tipo de red). Se sabe que es una política de aprendizaje por refuerzo entrenada en simulación con mjlab-microduck 0.1.0 (base fijada en el commit 1efd853be) y exportada a ONNX. La normalización de las observaciones está integrada dentro de policy.onnx, de modo que el consumidor debe alimentar observaciones en bruto. La política opera como un controlador reactivo a 50 Hz que mapea 61 observaciones a 14 acciones, y está diseñada para ejecutarse de forma continua (comportamiento "perpetuo") hasta que el demonio del robot la descargue o la sustituya.

El entrenamiento se realizó con 4096 entornos paralelos, un máximo de 3000 iteraciones del agente, semilla 1 y registro en TensorBoard bajo el nombre de ejecución sprint-baseline-20261102. El checkpoint final seleccionado es el 1000. La model card advierte explícitamente de que el proceso no es reproducible bit a bit entre máquinas: repetir el entrenamiento con el mismo código, el mismo uv.lock, el mismo comando y la misma semilla produce una política comparable, pero no idéntica. No se especifican en la información proporcionada detalles sobre la función de recompensa, el algoritmo de RL empleado (PPO u otro) ni la composición del dominio de entrenamiento.

## Capacidades

- Locomoción cuadrúpeda: ejecuta una marcha ("sprint") de forma continua sobre el robot microduck.
- Control a 50 Hz con observaciones de 61 dimensiones y 14 acciones motoras.
- Política perpetua: mantiene la marcha hasta recibir una orden de parada o sustitución.
- Normalización de observaciones embebida en el ONNX: acepta observaciones en bruto sin preprocesado externo.
- Integración con el demonio robotctl mediante carga en una ranura de política.
- Compatibilidad con el manifiesto de políticas de microduck en su esquema 2.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingües: no es un modelo de lenguaje.

## Casos de uso

- Despliegue de locomoción base en un microduck físico: cargar la política con `sudo robotctl policy load <slot> JackDH/microduck-sprint-20261102-best` para obtener una marcha funcional sin entrenar desde cero.
- Punto de partida para fine-tuning o comparación: sirve como línea base "sprint-2m" frente a la que medir políticas propias entrenadas con el mismo entorno mjlab-microduck.
- Validación de la cadena de herramientas robotctl: útil para verificar que el demonio carga correctamente políticas ONNX con manifiesto de esquema 2 y normalización embebida.
- Demostraciones y docencia en robótica de refuerzo: al ser una política compacta y reproducible en código, permite ilustrar el ciclo completo simulación-entrenamiento-despliegue.
- Pruebas de robustez en simulación: reutilizar la política como referencia para evaluar perturbaciones, cambios de terreno o variaciones de carga en el simulador.
- Integración en pipelines de evaluación automatizada: el formato ONNX facilita su ejecución en runners sin dependencias de frameworks de RL, comparando métricas de marcha entre checkpoints.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de recompensa, velocidad alcanzada, estabilidad ni comparaciones cuantitativas con otras políticas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el tamaño del repositorio es de 0.0 GB, lo que sugiere un modelo muy pequeño que probablemente quepa en cualquier GPU e incluso en CPU.
- GPU recomendadas: no se especifican para inferencia. El entrenamiento se realizó en una RTX 4090 con 4096 entornos paralelos.
- GPU de consumo: por el tamaño declarado del repositorio, es altamente probable que quepa en cualquier GPU de consumo, aunque no se confirma en la información disponible.
- Opciones de despliegue: ONNX Runtime a través del demonio robotctl del robot microduck; también puede ejecutarse con cualquier runtime compatible con ONNX.
- Latencia y throughput: no disponibles; el control opera a 50 Hz, lo que fija un presupuesto de 20 ms por paso de inferencia.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye otras políticas de microduck ni modelos comparables con los que contrastar parámetros, contexto, rendimiento o licencia.

## Limitaciones y advertencias

- Licencia no especificada: no se puede confirmar el uso comercial ni la redistribución; conviene contactar con el autor antes de usarla en producción.
- Ausencia de métricas: no hay benchmarks ni datos de rendimiento que permitan evaluar su calidad frente a alternativas.
- Entrenada en simulación: el comportamiento en el robot físico puede degradarse por la brecha simulación-realidad (sim-to-real gap).
- Reproducibilidad limitada: el propio autor advierte de que el reentrenamiento no produce pesos idénticos, solo comparables.
- Sin información sobre sesgos ni alucinación: no aplica en el sentido de modelos de lenguaje, pero no se documentan fallos de política, condiciones de fallo ni límites de seguridad.
- Dependencia del ecosistema microduck: requiere el demonio robotctl y el esquema de manifiesto 2; no es portable a otros robots sin adaptación.
- Repositorio sin tracción: cero descargas y cero likes en el momento de la consulta, sin garantías de mantenimiento.

## Enlaces

- HuggingFace: https://huggingface.co/JackDH/microduck-sprint-20261102-best
- Repositorio de entrenamiento: https://github.com/JackDanHollister/microduck-challenges
- Repositorio del robot microduck: https://github.com/pollen-robotics/microduck
