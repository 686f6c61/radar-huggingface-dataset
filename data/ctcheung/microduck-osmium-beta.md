# ctcheung/microduck-osmium-beta

## Resumen

Microduck Osmium Beta es una política de control motriz entrenada mediante aprendizaje por refuerzo para el robot bípedo Microduck, un robot de 25 cm desarrollado por Pollen Robotics en colaboración con Hugging Face. El modelo no es un modelo de lenguaje ni un sistema multimodal generativo: es un artefacto de robótica que traduce observaciones del robot (61 dimensiones) en acciones de control (14 dimensiones) a una frecuencia de 50 Hz, empaquetado en formato ONNX y distribuido bajo la librería `microduck`.

El repositorio, publicado por el usuario `ctcheung`, se presenta explícitamente como una prueba ("trial") y contiene un checkpoint entrenado en la tarea `Mjlab-TugOfWar-MicroDuck` (checkpoint 1000, semilla 1). Su función es ocupar una ranura de política ("policy slot") en el daemon del robot y ejecutarse de forma perpetua hasta que se le indique lo contrario, lo que lo convierte en una pieza de software de control lista para desplegar en hardware real mediante el comando `robotctl policy load`.

La relevancia de esta ficha es acotada: se trata de un artefacto experimental de un autor individual, sin descargas ni valoraciones, sin licencia declarada y con un tamaño de repositorio de 0.0 GB. No debe confundirse con un modelo fundacional ni evaluarse con los criterios habituales de LLM; su interés reside en el ecosistema Microduck de robótica open source y en el formato de manifiesto de políticas que estandariza el despliegue de controladores RL en robots de bajo coste.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Política de aprendizaje por refuerzo exportada a ONNX (arquitectura de red no especificada) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (entrada de observación de 61 dimensiones; no hay contexto textual) |
| Tipos de cuantizacion | no disponible (se distribuye en ONNX; el normalizador de observaciones está integrado en `policy.onnx`) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | ONNX (`policy.onnx`) y manifiesto `manifest.json` (schema 2 del manifiesto de políticas microduck) |

## Arquitectura y entrenamiento

La información disponible no detalla la topología de la red neuronal (número de capas, dimensiones ocultas, tipo de activación ni si emplea memoria recurrente). Lo que sí se especifica es la interfaz: una política que consume observaciones de 61 dimensiones y emite 14 acciones a 50 Hz, con un normalizador de observaciones embebido en el propio grafo ONNX, de modo que el consumidor debe alimentar observaciones en crudo sin preprocesado adicional. El modelo se ejecuta de forma perpetua hasta recibir una orden de parada, comportándose como una marcha ("gait") cargada en una ranura de política del daemon.

El entrenamiento se realizó en el entorno `Mjlab-TugOfWar-MicroDuck`, presumiblemente una tarea de simulación de tirar de la cuerda adaptada al robot Microduck dentro del ecosistema MuJoCo/Mjlab, con checkpoint 1000 y semilla 1. No se aportan datos sobre número de pasos de entrenamiento, composición del dataset, técnicas de RL empleadas (PPO, SAC, etc.), ni procesos de ajuste fino o destilación. Tampoco se documenta ninguna innovación técnica adicional más allá del empaquetado del normalizador dentro del modelo ONNX y el uso del esquema de manifiesto versión 2 del daemon de microduck.

## Capacidades

- Control motriz bípedo: genera comandos de articulación (14 acciones) a partir del estado del robot (61 observaciones) a 50 Hz.
- Ejecución perpetua: la política corre de forma continua hasta que se le ordena detenerse, adecuada para marchas sostenidas.
- Despliegue estandarizado: se carga en una ranura de política mediante `robotctl policy load <slot> ctcheung/microduck-osmium-beta`.
- Autocontención del preprocesado: el normalizador de observaciones está integrado en `policy.onnx`, por lo que acepta observaciones en crudo.
- Compatibilidad con el manifiesto schema 2 del daemon de microduck, lo que facilita su integración en el pipeline oficial del robot.
- No dispone de generación de texto, razonamiento, código, matemáticas, visión, audio, tool calling ni capacidades multilingües.

## Casos de uso

- Despliegue de una marcha de referencia en el robot Microduck: cargar la política en una ranura con `robotctl policy load` permite al robot ejecutar un gait continuo sin desarrollo adicional de control, útil para validar el hardware recién montado.
- Pruebas de integración del daemon: al seguir el esquema de manifiesto versión 2, sirve como artefacto de prueba para verificar que el cargador de políticas, el normalizador embebido y la frecuencia de 50 Hz funcionan correctamente en el robot.
- Comparación de políticas en experiments de RL: al estar etiquetada con tarea, checkpoint y semilla, puede usarse como línea base frente a otras políticas entrenadas en `Mjlab-TugOfWar-MicroDuck`.
- Demostraciones educativas de robótica con RL: un robot de 25 cm y bajo coste ejecutando una política perpetua es un recurso didáctico para explicar el ciclo observación-acción en sistemas embebidos.
- Investigación en simulación a realidad (sim-to-real): permite evaluar la transferencia de una política entrenada en Mjlab al hardware físico, observando estabilidad y deriva de la marcha.
- Prototipado rápido de comportamientos: al ser una prueba ("trial") de un autor individual, sirve para experimentar con el formato de políticas microduck antes de entrenar políticas propias.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el tamaño del repositorio es de 0.0 GB y el modelo se ejecuta como política ONNX, por lo que la huella es previsiblemente mínima, pero no se aportan cifras.
- GPU recomendadas: no disponible. Al ejecutarse en el propio robot Microduck, lo habitual es inferencia en CPU embebida; no se documenta soporte GPU.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: el daemon oficial de microduck mediante `robotctl policy load`; el formato ONNX permite, en principio, ejecución con ONNX Runtime, pero no se documenta explícitamente.
- Latencia y throughput: la política opera a 50 Hz (periodo de 20 ms por ciclo de control); no se publican medidas de latencia real ni throughput.

## Comparativa con modelos similares

| Modelo | Tipo | Entrada / salida | Frecuencia | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Microduck Osmium Beta (ctcheung) | Política RL para Microduck (ONNX) | 61 obs. / 14 acciones | 50 Hz | no disponible | Hugging Face, 0 descargas |
| Políticas oficiales de Microduck (Pollen Robotics / Hugging Face) | Políticas RL para Microduck | no disponible | no disponible | no disponible | Ecosistema oficial Microduck |
| Otras políticas de la tarea Mjlab-TugOfWar-MicroDuck | Políticas RL en Mjlab | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos públicos de rendimiento, parámetros ni licencia de las alternativas como para establecer una comparación cuantitativa fiable.

## Limitaciones y advertencias

- El propio autor califica el modelo como "trial": es un artefacto experimental sin garantías de robustez ni de estabilidad en hardware real.
- No se declara licencia, lo que impide determinar si su uso comercial está permitido; en ausencia de licencia, debe asumirse que no hay autorización explícita.
- No hay información sobre sesgos, pero al ser una política de control entrenada en una única tarea, semilla y checkpoint, su comportamiento está fuertemente especializado y puede fallar fuera de las condiciones de entrenamiento.
- Riesgo de alucinación no aplicable; el riesgo equivalente es la generación de acciones no seguras o inestables que puedan dañar el robot o su entorno.
- No se documentan los idiomas ni capacidades lingüísticas porque no es un modelo de lenguaje; cualquier uso en ese sentido es inválido.
- El repositorio tiene 0 descargas y 0 valoraciones, por lo que no existe validación comunitaria de su funcionamiento.
- El tamaño del repositorio figura como 0.0 GB, lo que puede indicar que los pesos no están efectivamente alojados o que la métrica no se ha actualizado; conviene verificar la integridad de `policy.onnx` antes de desplegarlo.
- No se especifican requisitos de seguridad física para la ejecución de una política perpetua en un robot bípedo; debe supervisarse el primer arranque.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ctcheung/microduck-osmium-beta
- Repositorio del daemon microduck (referenciado en la model card): https://github.com/pollen-robotics/microduck
- Artículo sobre Microduck en MarkTechPost: https://www.marktechpost.com/2026/08/28/pollen-robotics-hugging-face-microduck-399-open-source-rl-biped-robot/
- Sitio oficial de Microduck: https://microducks.org/
