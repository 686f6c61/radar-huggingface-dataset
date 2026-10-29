# nikghodki/microduck-tug-r8b-250

## Resumen

`microduck-tug-r8b-250` no es un modelo de lenguaje, sino una política de aprendizaje por refuerzo (RL) para el robot bípedo MicroDuck de Pollen Robotics, el pato robótico de 25 cm que Hugging Face vende por 399 dólares. Publicada por el usuario nikghodki el 29 de octubre de 2026, esta política resuelve la tarea "TugOfWar" (tira y afloja) del repositorio `microduck-challenges`: el robot debe mantener el equilibrio y resistir una fuerza de tracción externa ejercida por un oponente simulado. Es una política "perpetua": una vez cargada en un slot del robot, se ejecuta de forma continua a 50 Hz hasta que se sustituye por otra.

Técnicamente, es una red de control exportada a ONNX con 61 observaciones de entrada y 14 acciones de salida, con el normalizador de observaciones integrado en el propio fichero. El entrenamiento se realizó en simulación con mjlab sobre MuJoCo usando 4096 entornos paralelos, y los pesos publicados corresponden al checkpoint 250. Su interés principal es que ilustra el flujo completo sim-to-real del ecosistema MicroDuck: entrenamiento reproducible en GPU, publicación en el Hub y despliegue en el robot físico con un único comando.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Política de RL (red actor) para control robótico; detalle de capas no disponible |
| Parámetros totales | no disponible |
| Parámetros activos | no aplicable (no es un modelo MoE) |
| Longitud de contexto | no aplicable (no es un modelo de lenguaje) |
| Tipos de cuantización | no disponible (pesos en ONNX sin cuantización declarada) |
| Idiomas soportados | no aplicable (no procesa lenguaje natural) |
| Licencia | no disponible |
| Formato de pesos | ONNX (`policy.onnx` con normalizador integrado) más `manifest.json` (esquema 2) |
| Observaciones | 61 dimensiones |
| Acciones | 14 |
| Frecuencia de control | 50 Hz |
| Tarea de entrenamiento | `Mjlab-TugOfWar-MicroDuck` |
| Checkpoint / seed | 250 / 1 |
| Librería / pipeline | microduck / robotics |

## Arquitectura y entrenamiento

La política es una red actor entrenada mediante aprendizaje por refuerzo acelerado por GPU con mjlab, el framework de simulación basado en MuJoCo empleado por el ecosistema MicroDuck. La tarea `Mjlab-TugOfWar-MicroDuck` proviene del repositorio `pollen-robotics/microduck-challenges` (rama `md-planter`, commit `fe4036eb2`), sobre la base `mjlab-microduck 0.1.0` (commit `1efd853be`). El bucle de control trabaja a 50 Hz con observaciones de 61 dimensiones y un espacio de acción de 14 salidas; la composición exacta del vector de observación no está documentada en la model card.

El entrenamiento usó 4096 entornos paralelos con un máximo de 500 iteraciones, guardando checkpoints cada 50 pasos; los pesos publicados son del checkpoint 250 con seed 1. Los hiperparámetros incluyen learning rate de 1e-4 y un KL objetivo de 0,002, configuración típica de PPO con ajuste adaptativo del learning rate, aunque el algoritmo concreto no se detalla en la card. Un elemento destacable es el entrenamiento adversario: el oponente `Puller6GentleActor` simula a un rival que tira suavemente de la cuerda, lo que obliga a la política a desarrollar un control postural robusto frente a perturbaciones externas. El propio autor advierte que, pese a fijar código, `uv.lock`, comando y seed, el reentrenamiento produce políticas comparables pero no pesos idénticos, ya que la RL en GPU no es bit-reproducible entre máquinas.

## Capacidades

- Comportamiento de tira y afloja: el robot mantiene postura y resiste fuerzas de tracción externas de forma continuada.
- Ejecución perpetua a 50 Hz: la política corre indefinidamente hasta que se carga otra en su slot, sin necesidad de comandos externos.
- Despliegue directo en robot: se carga en un slot de política del daemon microduck mediante `robotctl policy load`, sin pipeline intermedio.
- Normalizador integrado: al estar incluido en `policy.onnx`, acepta observaciones crudas sin preprocesamiento externo.
- Compatibilidad con el esquema 2 del manifiesto de políticas de microduck (`docs/policy-manifest.md` del daemon).
- No es un modelo generativo: no produce texto, no soporta tool calling, no tiene capacidades de visión, audio ni razonamiento multi-paso.

## Casos de uso

- Demostración interactiva y juego físico: una persona puede tirar de la cuerda frente al robot y comprobar en tiempo real cómo la política compensa las fuerzas; es el escenario para el que fue entrenada y funciona directamente tras cargar el slot.
- Investigación en locomoción robusta: sirve como política base o baseline para estudiar el control postural bajo perturbaciones externas, un problema clásico de robótica bípeda, con un robot barato y seguro para experimentar.
- Validación de transferencia sim-to-real: al existir el entorno de entrenamiento público en `microduck-challenges`, se puede comparar el comportamiento simulado y el real para cuantificar el gap de transferencia de este flujo mjlab-ONNX-robotctl.
- Enseñanza de RL robótico: el comando de entrenamiento completo está publicado (hiperparámetros, seed, número de entornos), lo que lo convierte en un ejercicio reproducible ideal para cursos y tutoriales de RL en GPU.
- Pruebas de infraestructura de despliegue: permite validar pipelines de flota (carga de políticas, slots, manifiestos schema 2) antes de desplegar comportamientos críticos, usando una tarea inofensiva como banco de pruebas.
- Benchmark de oponentes adversarios: el diseño con actor oponente permite comparar políticas entrenadas contra distintos rivales (por ejemplo, variantes más agresivas de `Puller`) y medir cómo afecta la dificultad del adversario a la robustez final.
- Composición de comportamientos: como política perpetua en un slot, puede conmutarse en runtime con otras políticas del ecosistema (andar, sentarse, patadas, roulade) para construir secuencias de comportamiento más complejas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de recompensa, tasa de éxito en la tarea ni evaluación en robot real, y el modelo registra 0 descargas y 0 likes en el Hub, por lo que no existe validación comunitaria de su rendimiento.

## Requisitos de hardware

- Inferencia: no requiere GPU ni servidor; la política se ejecuta en el computador integrado del propio MicroDuck a 50 Hz (un paso de control cada 20 ms) mediante ONNX Runtime.
- Entrenamiento o reproducción: requiere GPU con soporte CUDA para RL acelerado con 4096 entornos paralelos en mjlab/MuJoCo; una GPU de gama alta de consumo (clase RTX 3090/4090) es una estimación razonable, aunque la VRAM exacta no está publicada.
- Consumer GPU: para inferencia no se necesita ninguna GPU externa; para reentrenar, una RTX 4090 de 24 GB debería bastar para la escala indicada, sin datos oficiales que lo confirmen.
- Despliegue: `sudo robotctl policy load <slot> nikghodki/microduck-tug-r8b-250` sobre el daemon de microduck; también puede ejecutarse en simulación con ONNX Runtime para evaluación previa sin hardware físico.
- Latencia: ciclo de control de 50 Hz especificado en la card; el throughput no es un concepto aplicable al no ser un modelo generativo.

## Comparativa con modelos similares

| Modelo | Tarea | Obs. / acciones | Formato | Licencia | Observaciones |
|---|---|---|---|---|---|
| nikghodki/microduck-tug-r8b-250 (este) | TugOfWar (mjlab) | 61-D / 14 a 50 Hz | ONNX | no disponible | Checkpoint 250, seed 1, oponente `Puller6GentleActor` |
| nikghodki/microduck-tug-r2a-250 | TugOfWar (mjlab) | no disponible | ONNX | no disponible | Otra ejecución del mismo autor sobre la misma tarea (run r2a) |
| Políticas base del ecosistema microduck (walk, stand, sitstand, ground_pick, kick_left, kick_right, roulade) | Comportamientos base del robot | no disponible | ONNX | no disponible | Slots estándar documentados del daemon microduck |

No hay datos de rendimiento comparativo entre estas políticas, ya que ninguna publica métricas de evaluación.

## Limitaciones y advertencias

- Especificidad de tarea: la política solo ejecuta el comportamiento de tira y afloja; no generaliza a locomoción general ni a otras tareas.
- Reproducibilidad parcial: el propio autor indica que reentrenar con el mismo código y seed produce políticas comparables, no pesos idénticos, por la no bit-reproducibilidad de la RL en GPU.
- Sin licencia declarada: al no figurar licencia en el repositorio, las condiciones de uso comercial no están claras; conviene consultar al autor antes de cualquier despliegue productivo.
- Rendimiento sin verificar: 0 descargas, 0 likes y ausencia total de métricas de éxito o evaluación en robot real; el comportamiento en hardware físico está sin contrastar.
- Tamaño del repositorio de 0,0 GB: posible incidencia de indexación o metadatos; conviene verificar que `policy.onnx` y `manifest.json` están realmente presentes antes de intentar cargar la política.
- Dependencia de infraestructura: requiere un daemon microduck con soporte del esquema 2 de manifiestos y el comando `robotctl` con privilegios de superusuario en el robot.
- Riesgo físico: las políticas de RL pueden comportarse de forma inesperada fuera de la distribución de entrenamiento (fuerzas, superficies o ángulos de tracción no vistos); se recomienda supervisión directa durante las pruebas, aunque el robot sea pequeño (25 cm, 15 motores).
- Proyecto muy reciente: creado y entrenado el mismo día (29 de octubre de 2026), sin histórico de mantenimiento ni issues asociados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/nikghodki/microduck-tug-r8b-250
- Modelo relacionado del mismo autor (run r2a): https://huggingface.co/nikghodki/microduck-tug-r2a-250
- Repositorio de entrenamiento (microduck-challenges, rama `md-planter`, commit `fe4036eb2`): https://github.com/pollen-robotics/microduck-challenges
- Repositorio del robot microduck: https://github.com/pollen-robotics/microduck
- Página oficial del robot MicroDuck: https://pollen-robotics.com/microduck/
- Artículo de TechCrunch sobre el lanzamiento del MicroDuck: https://techcrunch.com/2026/08/27/hugging-face-is-selling-a-cute-399-open-source-duck-robot-microduck/
- Recursos independientes sobre MicroDuck: https://microduckrobot.org/
