# GinDuck/microduck-roller-sprint-2m-roller-2-i

## Resumen

`microduck-roller-sprint-2m-roller-2-i` es un checkpoint de política de control para el robot cuadrúpedo de bajo coste microduck, desarrollado por el usuario GinDuck y publicado en Hugging Face. No es un modelo de lenguaje: es una política de reinforcement learning entrenada para que el robot se desplace sobre ruedas (rollers) en un patrón de marcha orientado a velocidad, denominado "sprint". El modelo se distribuye como un grafo ONNX (`policy.onnx`) con el normalizador de observaciones ya integrado, junto con un `manifest.json` conforme al esquema 2 del manifiesto de políticas de microduck.

El problema que resuelve es concreto: proporcionar una marcha lista para cargar en una ranura de política del daemon `robotctl` del microduck, de modo que el robot pueda ejecutar un desplazamiento rápido sobre ruedas de forma perpetua (hasta que se le indique lo contrario). Según el autor, en sus propias pruebas el recorrido se completa en aproximadamente 1,5 a 1,6 segundos, lo que lo sitúa como una variante de velocidad frente a su predecesora, que priorizaba el patrón de patinaje.

La relevancia es acotada pero clara para quien trabaja con robótica de bajo coste y simulación física: el checkpoint documenta de forma explícita la receta de entrenamiento (task_id, repositorio, rama, commit, semilla, checkpoint y versión base de mjlab), lo que permite reproducir el pipeline. La información pública disponible es muy limitada: el repositorio ocupa 0,0 GB según la ficha, no tiene descargas ni likes, y no se declaran licencia ni idiomas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Política de reinforcement learning exportada a ONNX (red neuronal de control; topología interna no disponible) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (no es un modelo de lenguaje) |
| Tipos de cuantizacion | no disponible (se distribuye como `policy.onnx`) |
| Idiomas soportados | no disponible (no aplica) |
| Licencia | no disponible |
| Formato de pesos | ONNX (`policy.onnx`) + `manifest.json` (esquema 2 del manifiesto de políticas de microduck) |
| Entrada (observación) | 61 dimensiones, observaciones en bruto (normalizador integrado en el ONNX) |
| Salida (acción) | 14 acciones |
| Frecuencia de control | 50 Hz |
| Tipo de política | Perpetua (se ejecuta hasta recibir instrucción de parada) |
| Hardware objetivo | Robot microduck sobre ruedas (rollers) |
| Tarea de entrenamiento | `Mjlab-RollerSprint2m-MicroDuck` |

## Arquitectura y entrenamiento

La información disponible no detalla la topología interna de la red (número de capas, anchura, función de activación ni tipo de política, p. ej. MLP o red recurrente). Lo que sí está documentado es la interfaz: recibe un vector de observación de 61 dimensiones, emite 14 acciones a 50 Hz y se exporta a ONNX con el normalizador de observaciones embebido, de forma que el consumidor debe alimentar observaciones en bruto sin preprocesar.

El entrenamiento se realizó con el stack mjlab (versión base `mjlab-microduck 0.1.0 @ 1efd853be`) sobre la tarea `Mjlab-RollerSprint2m-MicroDuck`, en el repositorio `pollen-robotics/microduck-challenges`, rama `race-2`, commit `b44f7ffc9`. Se lanzó con 2048 entornos paralelos, un máximo de 6000 iteraciones y semilla 1, guardándose el checkpoint 5500; el inicio del entrenamiento se registra el 2026-11-02T13:27:08Z. La receta es compartida por el usuario TheSauceman. El autor advierte explícitamente que el entrenamiento no es bit-reproducible entre máquinas: repetir el comando con el mismo `uv.lock` y la misma semilla produce una política comparable, no los mismos pesos.

## Capacidades

- Locomoción sobre ruedas: ejecuta una marcha de tipo sprint sobre rollers, orientada a maximizar velocidad de desplazamiento.
- Política perpetua: mantiene la marcha de forma continua hasta que se le indique lo contrario, sin horizonte de episodio fijo.
- Interfaz estandarizada: compatible con el cargador de políticas del daemon de microduck mediante `robotctl policy load <slot> <repo>`.
- Normalización integrada: el ONNX incluye el normalizador, por lo que acepta observaciones en bruto de 61 dimensiones.
- Control en tiempo real: inferencia a 50 Hz con 14 acciones de salida.
- No soporta tool calling, function calling, razonamiento multi-paso, capacidades multilingües, visión, audio ni modo de pensamiento; es exclusivamente una política motora.

## Casos de uso

- Demostración de velocidad en competiciones de microduck: la política está entrenada para la tarea `RollerSprint2m` y el autor reporta tiempos de 1,5 a 1,6 segundos, por lo que encaja directamente en pruebas cronometradas sobre un recorrido de referencia.
- Benchmarking de recetas de RL: al documentarse commit, semilla, número de entornos e iteraciones, sirve como punto de comparación reproducible frente a otras políticas de la misma rama `race-2`.
- Base para ajuste fino: al ser un checkpoint intermedio (iteración 5500 de 6000), puede utilizarse como inicialización para experimentos posteriores de velocidad o robustez.
- Validación de pipelines de despliegue: permite probar el flujo `robotctl policy load` y el consumo del `manifest.json` esquema 2 en un robot real o simulado.
- Investigación en locomoción con ruedas: útil para estudiar cómo una política aprende a abandonar un patrón de patinaje y adoptar una marcha de sprint, comparando con la variante predecesora del mismo autor.
- Docencia y prototipado en robótica de bajo coste: el microduck es una plataforma asequible y esta política permite mostrar un ciclo completo de entrenamiento en simulación, exportación a ONNX y despliegue en hardware.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El único dato de rendimiento aportado por el autor es cualitativo y subjetivo ("en mis propias pruebas termina en aproximadamente 1,5 a 1,6 segundos"), sin especificar condiciones de medida, hardware, superficie ni metodología.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el tamaño del repositorio se declara como 0,0 GB, lo que sugiere un grafo ONNX muy pequeño, pero no se confirma la cifra exacta.
- GPU recomendadas: no disponibles; para una política de 61 entradas y 14 salidas la inferencia puede ejecutarse en CPU, aunque no se documenta latencia medida.
- ¿Cabe en GPU de consumo? No hay datos que lo confirmen, pero por la dimensionalidad de entrada/salida es altamente probable que sí; el autor no lo especifica.
- Opciones de despliegue: el runtime previsto es el daemon de microduck con `robotctl policy load <slot> <repo>`; el formato ONNX permite en principio otros runtimes (ONNX Runtime), aunque no se documentan.
- Latencia y throughput: no disponibles; el único requisito conocido es que la política opera a 50 Hz sobre el robot.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye otros checkpoints comparables de la misma tarea ni datos de rendimiento de alternativas. El propio autor menciona una variante previa ("second roller run") que priorizaba el patinaje, pero no se aportan sus especificaciones ni métricas para establecer una comparación cuantitativa.

## Limitaciones y advertencias

- Licencia no declarada: no se especifica si se permite uso comercial, modificación o redistribución; debe contactarse con el autor antes de cualquier uso en producción.
- Información mínima: sin descargas ni likes, sin model card extendida, sin métricas formales de éxito, robustez ni generalización.
- Rendimiento reportado de forma anecdótica: el tiempo de 1,5 a 1,6 segundos proviene de pruebas del propio autor, sin condiciones documentadas ni validación independiente.
- No reproducible bit a bit: el propio autor advierte que el reentrenamiento produce políticas comparables pero no idénticos pesos.
- Especialización estrecha: la política está entrenada para una tarea concreta (`RollerSprint2m`) sobre rollers; no se garantiza su comportamiento en otras superficies, configuraciones del robot o condiciones no vistas durante el entrenamiento.
- Riesgo de fallo fuera de distribución: como toda política de RL sin datos de robustez publicados, puede degradarse ante perturbaciones, cambios de carga o terreno distintos a los de simulación.
- Sin soporte de lenguaje, visión ni interacción multimodal: no debe evaluarse con los criterios habituales de un modelo fundacional.
- Estado del repositorio: creado y actualizado el mismo día (2026-11-14), sin historial de mantenimiento; posible abandono o falta de soporte.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/GinDuck/microduck-roller-sprint-2m-roller-2-i
- Repositorio de retos de microduck: https://github.com/pollen-robotics/microduck-challenges
- Proyecto microduck (Pollen Robotics): https://github.com/pollen-robotics/microduck
- Documentación del manifiesto de políticas: `docs/policy-manifest.md` en el repositorio del daemon (referenciada por el autor, sin URL directa disponible)
