# edge-inference/cohab-lekiwi-floorsort-pi05

## Resumen

CoHab LeKiwi es una política vision-lenguaje-acción (VLA) especializada en la tarea de recogida y clasificación de objetos del suelo ("floor sorting") para un robot móvil LeKiwi equipado con un brazo SO-101. El modelo deriva de `lerobot/pi05_base`, el checkpoint base de la familia pi0.5 de Physical Intelligence, y ha sido afinado por el autor `edge-inference` para ejecutar de forma autónoma las cuatro fases de la tarea: desplazarse hasta un objeto, recogerlo, transportarlo hasta su contenedor y depositarlo. Con 4.143 millones de parámetros, la política consume las cámaras frontal y de muñeca, el estado articular, la velocidad de la base y la posición objetivo en el marco del robot, y emite bloques de 10 acciones a 15 Hz (6 objetivos articulares del brazo más velocidades x/y/theta de la base).

El sistema completo no es un único modelo: la política pi0.5 se apoya en un planificador externo Cosmos-Reason2-8B que decide, a partir de la imagen de cámara y un menú textual de opciones, cuál es el siguiente paso de cada uno de los dos robots, y que además juzga si el robot ha llegado a un objeto o contenedor. El entrenamiento se realizó íntegramente en simulación (ManiSkill 3 sobre escenas ReplicaCAD), combinando datos de un profesor scripted con reintentos y ruido, y dos rondas de demostraciones de recogida generadas a partir de los estados en los que la propia política debía recoger.

Su relevancia actual reside en que documenta con detalle un pipeline completo de VLA multi-robot para manipulación móvil, con evaluación cuantitativa sobre 576 tareas y apartamentos no vistos en entrenamiento. El modelo es, sin embargo, estrictamente de simulación: no se ha probado todavía en un LeKiwi físico, lo que limita por ahora su uso a investigación y desarrollo de políticas robóticas.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Vision-language-action (VLA) derivada de pi0.5 (`lerobot/pi05_base`); no se detalla la arquitectura interna en la información disponible |
| Parámetros totales | 4.143.404.816 |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible; el checkpoint se distribuye y entrena en bf16 |
| Idiomas soportados | no disponible (las instrucciones de tarea son texto generado por el planificador) |
| Licencia | BSD 3-Clause |
| Formato de pesos | safetensors (librería `lerobot`) |
| Pipeline | robotics |
| Modelo base | `lerobot/pi05_base` |
| Entradas | cámaras `base_0_rgb` (frontal) y `left_wrist_0_rgb` (muñeca), estado articular, velocidad de la base, posición objetivo en marco del robot |
| Salidas | chunks de 10 acciones (6 objetivos articulares + velocidades x/y/theta de la base) |
| Frecuencia de control | 15 Hz |
| Tamaño del repositorio | 37,4 GB |

## Arquitectura y entrenamiento

El modelo es una política VLA construida sobre `lerobot/pi05_base` y afinada con todos los pesos en LeRobot 0.6.1 en precisión bf16. La información disponible no detalla la arquitectura interna del backbone (transformer, mezcla de expertos, mecanismo de atención), por lo que este dato debe considerarse no disponible. La interfaz sí está bien definida: dos flujos de imagen (cámara frontal y de muñeca), vector de estado articular, velocidad de la base y posición objetivo, con salida en forma de chunks de 10 acciones a 15 Hz que combinan control del brazo y de la base móvil.

El entrenamiento se realizó exclusivamente en simulación, sobre ManiSkill 3 con escenas ReplicaCAD. Los datos provienen de dos fuentes: por un lado, un profesor scripted que genera trayectorias con reintentos y pequeñas perturbaciones de brazo y base; por otro, demostraciones de recogida generadas en dos rondas de "autoimitación", en las que la propia política ejecutaba tareas completas en los apartamentos de entrenamiento, se guardaba el estado inicial de cada recogida y un profesor de pick completaba la acción desde ahí, conservando únicamente las recogidas exitosas. El checkpoint publicado es el último de la ejecución, elegido de antemano. No se especifican en la información disponible el número de tokens, la composición exacta del dataset ni si se aplicaron etapas de RLHF o DPO.

## Capacidades

- Control visomotor de manipulación móvil: desplazamiento de la base hasta un objeto, recogida con el brazo SO-101, transporte y depósito en un contenedor.
- Percepción multimodal: procesa simultáneamente cámara frontal y cámara de muñeca junto con propriocepción (estado articular y velocidad de la base).
- Ejecución de instrucciones de tarea en texto: recibe del planificador externo el siguiente paso como instrucción textual.
- Control combinado de brazo y base: emite objetivos articulares y velocidades de chasis en un único chunk de acciones.
- Operación multi-robot: el sistema se evaluó con dos robots trabajando en paralelo, cada uno con su propio planificador.
- Integración con planificación de alto nivel: depende de Cosmos-Reason2-8B para seleccionar el siguiente paso y para juzgar la llegada a objetos y contenedores.
- Detección de agarre mediante señal física: el estado "sosteniendo el objeto" se infiere del ángulo y la carga del gripper, no de la política.
- No se documentan capacidades de tool calling, razonamiento multi-paso genérico, matemáticas, código ni procesamiento de audio.

## Casos de uso

- Investigación en VLA para manipulación móvil: sirve como referencia reproducible de un pipeline completo (datos de profesor scripted, autoimitación y evaluación multi-robot) para quienes desarrollan políticas de robot con LeRobot.
- Clasificación de objetos en entornos domésticos simulados: el modelo cubre el ciclo completo de recogida y depósito de seis objetos en dos contenedores, útil para estudiar tareas de ordenación del hogar antes de trasladarlas a hardware real.
- Benchmark de políticas multi-robot: la configuración de evaluación (72 semillas, 8 tareas paralelas, 150 s por tarea) permite comparar nuevas políticas contra esta línea base en condiciones controladas.
- Generación de datos de recogida para otras políticas: el esquema de autoimitación descrito (ejecutar la política, guardar estados de pick y completar con un profesor) es reutilizable para aumentar datasets de manipulación.
- Estudio de planificación jerárquica con modelos de lenguaje: la combinación de un VLA de bajo nivel con un planificador VLM de alto nivel (Cosmos-Reason2-8B) es un caso práctico para investigar descomposición de tareas en instrucciones textuales.
- Prototipado de control de base móvil con brazo: la salida conjunta de velocidades de chasis y articulaciones a 15 Hz sirve para validar pilas de control en simuladores ManiSkill antes de portarlas a un LeKiwi físico.
- Docencia y formación en robótica: el repositorio incluye registros por semilla (decisiones del planificador, comprobaciones de cámara, latencias) y una tabla por tarea, material útil para analizar fallos y tasas de éxito por fase.

## Benchmarks y rendimiento

Evaluación sobre 576 tareas (72 semillas, 100-171, por 8 tareas paralelas con disposiciones aleatorias distintas; 150 s por tarea), con dos robots, seis objetos y dos contenedores por tarea, en el apartamento 5 no visto en entrenamiento:

| Métrica | Resultado |
|---|---|
| Objetos clasificados por tarea (de 6) | 3,56 [IC 95 %: 3,44-3,68]; 2.053 de 3.456 (59,4 %) |
| Tareas con 0 objetos clasificados | 11 |
| Tareas con 1 objeto clasificado | 46 |
| Tareas con 2 objetos clasificados | 88 |
| Tareas con 3 objetos clasificados | 123 |
| Tareas con 4 objetos clasificados | 128 |
| Tareas con 5 objetos clasificados | 130 |
| Tareas con 6 objetos clasificados | 50 |
| Éxito por paso: ir al objeto | 72 % |
| Éxito por paso: recoger | 77 % |
| Éxito por paso: transportar | 79 % |
| Éxito por paso: depositar | 95 % |

El intervalo de confianza se calculó por bootstrap sobre las 576 tareas. No se han publicado comparaciones con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada. Con 4.143 millones de parámetros en bf16, el peso de los pesos ronda los 8,3 GB, a lo que hay que sumar el coste de los dos flujos de imagen y del estado; no se documentan mediciones.
- GPU recomendadas: no disponible. El autor no especifica hardware de referencia ni latencias medidas.
- Cabe en GPU de consumo: no confirmado; por tamaño de pesos (≈8,3 GB en bf16) sería viable en GPUs consumer con 12-16 GB o más, pero es una estimación, no un dato publicado.
- Opciones de despliegue: la vía documentada es LeRobot 0.6.1 mediante `PI05Policy.from_pretrained`. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que además no aplican a una política de robótica de este tipo.
- Latencia y throughput: no disponibles. El repositorio incluye registros de latencias del planificador en `eval/head/`, pero los valores no se recogen en la información proporcionada.
- Requisito adicional del sistema: el planificador Cosmos-Reason2-8B se ejecuta aparte y añade sus propios requisitos de memoria y cómputo, no cuantificados en la información disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| CoHab LeKiwi (este modelo) | 4.143 M | no disponible | VLA de floor sorting para LeKiwi/SO-101 en simulación | BSD 3-Clause | Hugging Face, 186 descargas |
| `lerobot/pi05_base` | no disponible | no disponible | Política VLA base de propósito general | no disponible en la información | Hugging Face (modelo base) |
| Cosmos-Reason2-8B | 8.000 M (aproximado por nombre) | no disponible | Planificador VLM de alto nivel usado junto a esta política | no disponible en la información | Usado como componente del sistema |

No se dispone de datos de benchmarks de `lerobot/pi05_base` ni de Cosmos-Reason2-8B en la información proporcionada, por lo que no es posible establecer una comparación de rendimiento cuantitativa. Tampoco se han identificado otras políticas VLA comparables en la información disponible.

## Limitaciones y advertencias

- Solo simulación: el modelo no se ha ejecutado en un LeKiwi físico; el propio autor lo indica explícitamente. El rendimiento en hardware real es desconocido.
- Tasa de éxito limitada: clasifica de media 3,56 de 6 objetos por tarea (59,4 %), con 11 tareas sin ningún objeto clasificado y solo 50 tareas con los seis objetos ordenados.
- Dependencia de supuestos de simulación: si el depósito ha caído en el contenedor se determina con verdad del simulador; el chasis simulado atraviesa alfombras; durante el transporte el brazo se mantiene en la pose final de la recogida mediante una regla fija sobre la salida de la política.
- Dependencia de un planificador externo: el sistema completo requiere Cosmos-Reason2-8B para elegir el siguiente paso y validar llegadas, lo que añade latencia, coste computacional y un punto de fallo adicional.
- Percepción imperfecta: la localización del objetivo combina odometría, mapa previo y cámara simulada (error mediano de unos 5 cm) más ruido añadido de 0,10; el paso "ir al objeto" es el de menor éxito (72 %).
- Sesgos conocidos: no documentados en la información disponible.
- Riesgo de alucinación: no aplica en el sentido habitual de generación de texto libre; el riesgo equivalente es la selección errónea de paso por parte del planificador, no cuantificada de forma aislada.
- Idiomas: no se especifican; las instrucciones de tarea son texto generado por el planificador, sin evaluación multilingüe publicada.
- Licencia BSD 3-Clause: permite uso comercial con obligación de conservar el aviso de copyright y la cláusula de no aval; conviene revisar también las condiciones del modelo base `lerobot/pi05_base` y del planificador Cosmos-Reason2-8B, cuyas licencias no se detallan en la información disponible.
- Generalización limitada: entrenado en los apartamentos de ManiSkill/ReplicaCAD y evaluado en uno no visto; no hay evidencia de transferencia a otras escenas, objetos o morfologías de robot.
- Estado del arte cambiante: la model card advierte que el vídeo de demostración corresponde a un checkpoint anterior (v12), no al publicado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/edge-inference/cohab-lekiwi-floorsort-pi05
- Modelo base: https://huggingface.co/lerobot/pi05_base
- Dataset de entrenamiento: https://huggingface.co/datasets/edge-inference/cohab-lekiwi
- Código y documentación: https://github.com/edge-inference/cohab-lekiwi (con `docs/PLAN.md`)
- Librería LeRobot: https://github.com/huggingface/lerobot
- Simulador ManiSkill: https://maniskill.ai (ManiSkill 3)
- Escenas ReplicaCAD: https://aihabitat.org/datasets/replica_cad/
- Vídeo de demostración: `replay.mp4` en el repositorio del modelo (checkpoint v12, apartamento no visto, primer minuto a 2x)
