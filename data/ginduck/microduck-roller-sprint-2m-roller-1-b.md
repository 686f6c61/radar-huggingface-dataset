# GinDuck/microduck-roller-sprint-2m-roller-1-b

## Resumen

`microduck-roller-sprint-2m-roller-1-b` es una política de control para robots entrenada mediante aprendizaje por refuerzo, publicada por el usuario GinDuck en Hugging Face. No es un modelo de lenguaje: es un checkpoint de política (policy) para el robot cuadrúpedo de código abierto microduck de Pollen Robotics, empaquetado en formato ONNX y distribuido con la librería `microduck`. El modelo ejecuta una marcha (gait) sobre ruedas ("on rollers") que desplaza al robot de forma continua hasta que se le indica lo contrario.

La política consume observaciones de 61 dimensiones y emite 14 acciones a 50 Hz, lo que la sitúa en el ámbito de los controladores reactivos de baja latencia para robótica. Según la model card, fue entrenada con la receta estándar de Pollen ("plain recipe") sin ajustes posteriores, y el autor reporta que completó el recorrido en las cinco pruebas realizadas. El checkpoint corresponde a la iteración 750 de un entrenamiento con semilla 1 sobre la tarea `Mjlab-RollerSprint2m-MicroDuck`.

Su relevancia es acotada pero concreta: sirve como ejemplo reproducible de un pipeline de RL para un robot de bajo coste, con instrucciones de reproducción completas (commit, lockfile, comando) y un manifiesto de política versionado. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y el tamaño del repo figura como 0.0 GB, lo que sugiere que los pesos pueden no estar materializados o que la métrica no está actualizada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Política de RL para control robótico (red neuronal, detalles no disponibles); empaquetada en ONNX |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (no es un modelo de lenguaje); observación de 61 dimensiones por paso |
| Tipos de cuantizacion | no disponible (formato ONNX; normalizador de observaciones integrado en `policy.onnx`) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | ONNX (`policy.onnx`) + `manifest.json` (schema 2 del manifiesto de políticas microduck) |

## Arquitectura y entrenamiento

La información disponible no detalla la topología de la red (número de capas, anchura, tipo de activación). Lo que sí se especifica es la interfaz: entrada de observación de 61 dimensiones, salida de 14 acciones, frecuencia de control de 50 Hz, y ejecución sobre ruedas. El normalizador de observaciones está embebido en el propio `policy.onnx`, de modo que el consumidor debe alimentar observaciones en bruto sin preprocesar.

El entrenamiento se realizó con `mjlab` (base `mjlab-microduck 0.1.0 @ 1efd853be`) sobre el repositorio `pollen-robotics/microduck-challenges`, commit `dc73b9237`, tarea `Mjlab-RollerSprint2m-MicroDuck`, con 4096 entornos paralelos, hasta 3000 iteraciones máximas y semilla 1; el checkpoint publicado es el 750. El autor advierte explícitamente que el entrenamiento no es bit-reproducible entre máquinas: repetir el comando con el mismo `uv.lock` y la misma semilla produce una política comparable, no idéntica. No se documenta composición del dataset (al ser RL en simulación, la "data" son rollouts generados por el simulador), ni uso de RLHF/DPO.

## Capacidades

- Control locomotor sobre ruedas: genera una marcha continua ("perpetual") que mantiene al robot desplazándose hasta recibir instrucción contraria.
- Inferencia reactiva a 50 Hz con observaciones de 61 dimensiones y 14 acciones.
- Despliegue como política cargable en una ranura (slot) del daemon del robot mediante `robotctl policy load`.
- Normalización de observaciones integrada en el artefacto ONNX, lo que simplifica la integración en el runtime.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingües: no es un modelo de lenguaje.
- No se documentan capacidades de visión, audio ni modo "thinking".

## Casos de uso

- Demostración de locomoción sobre ruedas en microduck: cargar la política en una ranura y ejecutar la marcha para validar que el robot se desplaza de forma estable, tal como reporta el autor en sus cinco pruebas.
- Reproducción de experimentos de RL: servir como referencia de un checkpoint concreto (iteración 750, semilla 1) para comparar contra reentrenamientos con la misma receta y verificar la variabilidad entre ejecuciones.
- Punto de partida para ajuste fino: al ser un checkpoint temprano de la receta estándar, es un baseline razonable sobre el que introducir modificaciones de recompensa o de escena y medir la mejora.
- Docencia y divulgación en robótica de bajo coste: el flujo completo (clonar repo, `uv sync`, `uv run train`, cargar política) es reproducible y adecuado para talleres.
- Pruebas de integración del daemon: validar el manifiesto schema 2 y el comando `robotctl policy load` en pipelines de CI del propio robot.
- Benchmark interno de controladores: comparar latencia y estabilidad de esta política frente a otras marchas sobre ruedas del mismo robot en condiciones controladas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El único dato de rendimiento es cualitativo: el autor indica que la política "rueda de forma estable" y "llegó a la meta en las cinco pruebas" realizadas. No hay métricas de recompensa, velocidad, consumo, deriva ni tasas de éxito cuantificadas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; al tratarse de una política de control de pequeña dimensión (61 entradas, 14 salidas) y formato ONNX, es previsible que quepa en CPU, pero no se confirma en la información.
- GPU recomendadas: no disponibles para inferencia. Para reentrenamiento, el comando usa 4096 entornos paralelos, lo que en la práctica exige una GPU de datacenter (A100/H100 o similar); el autor no especifica el hardware empleado.
- ¿Cabe en GPU de consumo? No confirmado; probablemente sí para inferencia dado el tamaño reducido, pero no hay dato en la model card.
- Opciones de despliegue: runtime `microduck` con `robotctl policy load <slot> <repo>`; el artefacto es ONNX, por lo que es compatible con cualquier runtime ONNX estándar (ONNX Runtime, etc.), aunque no se documenta explícitamente.
- Latencia y throughput: no disponibles; el único dato es la frecuencia de control de 50 Hz (periodo de 20 ms), que la política debe cumplir.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye otras políticas del mismo robot ni checkpoints comparables de la misma tarea, y no se dispone de datos de rendimiento para establecer una comparación cuantitativa.

## Limitaciones y advertencias

- Licencia no especificada: no se puede asumir uso comercial; hay que contactar con el autor o consultar el repositorio antes de cualquier despliegue productivo.
- Reproducibilidad limitada: el propio autor advierte que el entrenamiento no es bit-reproducible entre máquinas; los pesos exactos no se pueden regenerar.
- Validación empírica mínima: cinco pruebas del autor, sin métricas publicadas ni protocolo de evaluación detallado.
- Alcance restringido: es una marcha sobre ruedas para un robot concreto (microduck); no es transferible a otras plataformas sin reentrenamiento.
- Sin datos de sesgos, alucinación o comportamiento fuera de distribución; al ser un controlador, el riesgo relevante es de inestabilidad o fallo físico del robot, no de contenido generado.
- Tamaño del repo reportado como 0.0 GB: conviene verificar que `policy.onnx` esté efectivamente disponible antes de integrarlo.
- Enlace externo promocional (QuackPack) en la model card: no forma parte del modelo y no debe considerarse documentación técnica.

## Enlaces

- Hugging Face: https://huggingface.co/GinDuck/microduck-roller-sprint-2m-roller-1-b
- Repositorio microduck (Pollen Robotics): https://github.com/pollen-robotics/microduck
- Repositorio de retos y entrenamiento: https://github.com/pollen-robotics/microduck-challenges
- Enlace promocional citado en la model card: https://www.imundo.ch/quackpack/
