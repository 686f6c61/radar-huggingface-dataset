# edge-inference/cohab-lekiwi-floorsort-pi05

## Resumen

CoHab LeKiwi es una política vision-language-action (VLA) derivada de pi0.5 mediante fine-tuning completo sobre el checkpoint base `lerobot/pi05_base`. Desarrollada por el grupo edge-inference, resuelve una tarea concreta de robótica de manipulación móvil: la clasificación de objetos del suelo en contenedores mediante un robot LeKiwi con brazo SO-101. El modelo consume las cámaras frontal y de muñeca del robot, el estado articular, la velocidad de la base y la posición objetivo en el marco del robot, y emite chunks de 10 acciones a 15 Hz que combinan 6 consignas articulares del brazo con velocidades de base en x, y y theta.

La relevancia del modelo reside en su enfoque multi-robot y en la separación entre planificación de alto nivel y ejecución de bajo nivel: un planificador Cosmos-Reason2-8B decide el siguiente paso de cada robot como instrucción textual, mientras la política pi0.5 ejecuta las cuatro fases de la tarea (ir al objeto, recogerlo, trasladarlo al contenedor e introducirlo). El entrenamiento se realizó exclusivamente con datos de profesor scriptado en simulador (ManiSkill 3 sobre ReplicaCAD), con reintentos y ruido añadido en brazo y base.

El modelo cuenta con 4.143.404.816 parámetros en formato safetensors, un repositorio de 28,1 GB y licencia BSD 3-Clause. Hasta la fecha solo se ha evaluado en simulación; no se ha ejecutado todavía sobre un LeKiwi físico. Los resultados publicados muestran 3,16 objetos clasificados de 6 por tarea con 150 segundos de presupuesto y 3,71 objetos con 300 segundos, sobre 192 tareas con 24 semillas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language-action (VLA) derivada de pi0.5; transformer con codificadores de visión y estado, salida de acciones en chunks |
| Parametros totales | 4.143.404.816 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en bf16) |
| Idiomas soportados | no disponible |
| Licencia | BSD 3-Clause |
| Formato de pesos | safetensors (librería LeRobot 0.6.1) |

## Arquitectura y entrenamiento

La política sigue la arquitectura pi0.5 de LeRobot, un modelo VLA que combina percepción visual multi-cámara con estado proprioceptivo del robot para producir secuencias de acciones. Las entradas son las imágenes de las cámaras `front` (renombrada `base_0_rgb`) y `wrist` (renombrada `left_wrist_0_rgb`), el estado articular, la velocidad de la base y la posición objetivo expresada en el marco del robot. La salida es un chunk de 10 acciones a 15 Hz, compuesto por 6 objetivos articulares del brazo SO-101 más las velocidades de base en x, y y theta.

El fine-tuning se realizó sobre todos los pesos de `lerobot/pi05_base` con LeRobot 0.6.1 en precisión bf16, usando datos generados por un profesor scriptado en simulación (ManiSkill 3, ReplicaCAD) con reintentos y pequeñas perturbaciones de brazo y base. Se seleccionó el checkpoint final de la ejecución, elegido de antemano. No se especifica en la información disponible el volumen de tokens ni la composición exacta del dataset de entrenamiento, más allá de que proviene del dataset `edge-inference/cohab-lekiwi` y que el apartamento 5 de ReplicaCAD quedó fuera del entrenamiento como conjunto retenido.

## Capacidades

- Ejecución de políticas de manipulación móvil: genera acciones continuas de brazo y base a partir de observaciones visuales y proprioceptivas.
- Clasificación de objetos del suelo en cuatro fases: ir al objeto, recogerlo, trasladarlo al contenedor e introducirlo.
- Percepción multi-cámara: integra cámara frontal y cámara de muñeca.
- Control de base móvil: emite velocidades de traslación y rotación junto a las consignas articulares.
- Integración con planificación de alto nivel: compatible con un planificador externo (Cosmos-Reason2-8B) que selecciona el siguiente paso como instrucción textual.
- Operación multi-robot: evaluado con dos robots en paralelo sobre el mismo entorno.
- Seguimiento de objetivos en el marco del robot: consume la posición objetivo derivada de odometría, mapa previo y cámara (SLAM simulada).
- No dispone de capacidades de generación de texto general, tool calling, agentes conversacionales ni audio según la información disponible.

## Casos de uso

- Clasificación automatizada de objetos en entornos simulados: el modelo ejecuta las cuatro fases de ordenación del suelo sobre un LeKiwi simulando dos robots en paralelo, lo que permite validar pipelines de manipulación móvil antes de trasladarlos a hardware real.
- Evaluación de políticas VLA en benchmarks de robótica: sirve como referencia reproducible sobre ManiSkill 3 y ReplicaCAD con 192 tareas y 24 semillas, útil para comparar variantes de pi0.5 o de planificadores de alto nivel.
- Desarrollo de sistemas jerárquicos planner-policy: al aceptar instrucciones textuales de un planificador externo como Cosmos-Reason2-8B, permite construir arquitecturas donde un LLM/VLM decide el paso y la política lo ejecuta a 15 Hz.
- Investigación en coordinación multi-robot: el modelo está entrenado y evaluado con dos robots que operan sobre seis objetos y dos contenedores por tarea, lo que facilita estudiar asignación de tareas y evitación de colisiones en simulador.
- Prototipado de robótica móvil de bajo coste: al estar pensado para LeKiwi con brazo SO-101, sirve como base para experimentos con plataformas económicas antes de invertir en hardware industrial.
- Generación de datos sintéticos y aumento de dataset: el pipeline de profesor scriptado con reintentos y ruido puede reutilizarse para producir nuevas trayectorias etiquetadas para otras políticas.
- Validación de robustez frente a ruido de percepción: la evaluación incorpora ruido de objetivo (`--goal-noise 0.10`) y error de cámara de aproximadamente 6 cm, lo que permite medir la tolerancia del modelo a imperfecciones de SLAM simulada.

## Benchmarks y rendimiento

Resultados publicados por el autor sobre 192 tareas (24 semillas × 8 tareas paralelas con layouts aleatorios), en el apartamento 5 no usado en entrenamiento:

| Metrica | 150 s por tarea | 300 s por tarea |
|---|---|---|
| Objetos clasificados por tarea (de 6) | 3,16 [IC 95% 2,95; 3,38] (607 de 1.152, 52,7%) | 3,71 [3,51; 3,92] (713 de 1.152, 61,9%) |
| Tareas con 0 objetos clasificados | 4 | 4 |
| Tareas con 1 objeto clasificado | 28 | 10 |
| Tareas con 2 objetos clasificados | 31 | 28 |
| Tareas con 3 objetos clasificados | 48 | 36 |
| Tareas con 4 objetos clasificados | 44 | 48 |
| Tareas con 5 objetos clasificados | 25 | 49 |
| Tareas con 6 objetos clasificados | 12 | 17 |
| Exito por paso: ir al objeto | 69% | 59% |
| Exito por paso: recoger | 80% | 75% |
| Exito por paso: trasladar | 70% | 70% |
| Exito por paso: introducir en contenedor | 92% | 87% |

Los intervalos de confianza se calculan por bootstrap sobre las 192 tareas. Los registros por semilla, las decisiones del planificador, las comprobaciones de cámara y las latencias están disponibles en `eval/v12/` del repositorio de código (`head` corresponde a 150 s y `double_time` a 300 s).

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada. Con 4.143.404.816 parámetros en bf16, el peso de los tensores ronda los 8,3 GB, a lo que hay que sumar memoria para activaciones y codificadores de visión; una estimación conservadora sitúa el requisito por encima de 12-16 GB en bf16.
- GPU recomendadas: no disponible. Por tamaño, cabría en GPUs de 24 GB o más (RTX 4090, L40S, A100 40 GB, H100), pero el autor no publica requisitos oficiales.
- Compatibilidad con GPU de consumo: plausible en RTX 4090 (24 GB) y posiblemente en GPUs de 16 GB si se aplica cuantización, aunque no se han publicado pesos cuantizados ni pruebas al respecto.
- Opciones de despliegue: la model card indica el uso mediante la librería LeRobot 0.6.1 con `PI05Policy.from_pretrained`. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no son adecuados para este tipo de política VLA.
- Latencia y throughput: la política emite chunks de 10 acciones a 15 Hz (aproximadamente 67 ms por chunk), pero no se publican latencias medidas ni throughput por GPU en la información disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| CoHab LeKiwi pi0.5 floorsort | 4.143.404.816 | no disponible | VLA para clasificación de objetos con LeKiwi/SO-101 | BSD 3-Clause | Hugging Face, 131 descargas |
| lerobot/pi05_base | no disponible en la información | no disponible | Modelo VLA base de LeRobot | no disponible en la información | Hugging Face (modelo base) |
| Cosmos-Reason2-8B | no disponible en la información | no disponible | Planificador VLM de alto nivel usado junto a esta política | no disponible en la información | Usado como componente externo en la evaluación |

No se dispone de datos de benchmarks comparativos con otras políticas VLA de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- Solo evaluado en simulación (ManiSkill 3, ReplicaCAD); no se ha ejecutado sobre un LeKiwi físico, por lo que el gap sim-to-real no está caracterizado.
- Entrenado con datos de profesor scriptado, no con demostraciones humanas; puede presentar sesgos hacia las trayectorias y layouts del simulador.
- Dependencia de un planificador externo (Cosmos-Reason2-8B) para decidir el siguiente paso; errores del planificador se propagan a la política.
- Suposición fija durante el traslado: el brazo se mantiene en la pose final del pick; sin esta regla el modelo deja caer más objetos.
- La SLAM es simulada y el chasis simulado atraviesa alfombras; estos comportamientos no reflejan condiciones reales.
- Error de cámara de aproximadamente 6 cm y ruido de objetivo añadido (`--goal-noise 0.10`) condicionan los resultados; sin estas perturbaciones el rendimiento podría diferir.
- Rendimiento limitado: 3,16 de 6 objetos clasificados a 150 s y 3,71 de 6 a 300 s; el éxito por paso cae al 59% en "ir al objeto" con 300 s.
- Idiomas soportados no disponibles; el modelo no está orientado a tareas lingüísticas generales.
- Licencia BSD 3-Clause: permite uso comercial con obligación de conservar el aviso de copyright y la cláusula de exención; conviene revisar los términos del modelo base `lerobot/pi05_base` antes de producción.
- Riesgo de alucinación no aplicable en el sentido textual, pero sí de acciones incorrectas o inconsistentes con el objetivo ante observaciones fuera de distribución.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/edge-inference/cohab-lekiwi-floorsort-pi05
- Modelo base: https://huggingface.co/lerobot/pi05_base
- Dataset de entrenamiento: https://huggingface.co/datasets/edge-inference/cohab-lekiwi
- Repositorio de código e historial: https://github.com/edge-inference/cohab-lekiwi
- Documento de planificación: https://github.com/edge-inference/cohab-lekiwi/blob/main/docs/PLAN.md
- Demo (`replay.mp4`): disponible en el repositorio del modelo en Hugging Face
