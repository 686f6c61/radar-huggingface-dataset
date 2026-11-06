# roboticascent/graspgenx-so101

## Resumen

GraspGen-X SO-101 es un ajuste fino del modelo generativo de agarres GraspGen-X de NVIDIA, adaptado por el autor `roboticascent` al gripper del brazo robótico de bajo coste SO-101 (TheRobotStudio). El modelo resuelve un problema muy concreto: dado un conjunto de puntos sobre la superficie de un objeto situado en una mesa, propone poses del efector final del SO-101 que permiten agarrarlo, junto con una puntuación de calidad para cada una. La relevancia actual radica en que el modelo original de NVIDIA fue entrenado con grippers de dedos simétricos y apenas lograba agarres con el SO-101 (0,1% de éxito según el autor), por lo que este ajuste fino relabela los agarres para la morfología asimétrica del SO-101 (una mandíbula móvil contra una fija).

El repositorio contiene dos redes: un generador (`gen/`, checkpoint `epoch_1025.pth`) que propone poses de agarre y un discriminador (`dis/`, checkpoint `epoch_1350.pth`) que las puntúa. El modelo se entrenó en orientación vertical (upright) y sin aumentación de rotación, con puntos expresados en un marco cuyo eje z apunta hacia arriba desde la mesa y cuyo -x apunta hacia la base del brazo. El tamaño del repositorio es de 1,7 GB y la librería de carga es `graspgenx`.

Se distribuye bajo la NVIDIA Open Model License (versión de 2025-10-24) y, según la model card, todavía no se ha probado en un brazo real: solo en simulación (Isaac Sim con física Newton). Es, por tanto, un modelo de investigación en fase temprana, con cero descargas y cero likes en el momento de redactar esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Generador + discriminador de poses de agarre (GraspGen-X); detalles de capas no disponibles |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (entrada: nube de puntos; no es un modelo de lenguaje) |
| Tipos de cuantizacion | no disponible (checkpoints `.pth` en precisión original) |
| Idiomas soportados | no disponible (modelo de robótica, sin capacidades linguisticas) |
| Licencia | NVIDIA Open Model License (2025-10-24) |
| Formato de pesos | PyTorch `.pth` (`epoch_1025.pth` para el generador, `epoch_1350.pth` para el discriminador) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de GraspGen-X de NVIDIA: un generador que produce poses de agarre candidatas a partir de puntos de la superficie del objeto y un discriminador que las puntúa. Ambos se ajustaron finamente desde los checkpoints publicados por NVIDIA, en orientación vertical y con vistas unilaterales de los objetos tomadas entre 15 y 30 cm por encima de la mesa. Las estadísticas de BatchNorm del codificador del gripper se mantuvieron tal como se publicaron.

El entrenamiento se diseñó específicamente para corregir el desajuste morfológico del SO-101, cuyo gripper cierra una mandíbula móvil contra una fija. Se generaron candidatos sobre 562 objetos sintéticos (cubos, cilindros, cuencos, tazas, varillas, cucharas, etc.) a partir de las propuestas del GraspGen-X original, copias con jitter y candidatos adicionales a lo largo de las normales de la superficie, cada uno asentado contra la mandíbula fija. Cada candidato se etiquetó en simulación (Newton con MuJoCo-Warp a 240 Hz) usando el gripper real del SO-101, con el servo de la mandíbula identificado a 3,35 N·m de par de bloqueo del STS3215 y colisión de mallas. El protocolo consistía en acercar el gripper abierto 6 cm, cerrar la mandíbula, levantar 5 cm y agitar; se consideraba fallo si el objeto se desplazaba más de 15 mm o se inclinaba más de 15° durante el cierre. Se obtuvieron 313.588 positivos sobre 2.214 colocaciones.

## Capacidades

- Generación de poses de agarre 6D para el gripper del SO-101 a partir de una nube de puntos de la superficie del objeto.
- Puntuación de calidad de cada agarre propuesto mediante el discriminador, lo que permite ordenar candidatos para un planificador de movimiento.
- Funcionamiento en orientación vertical (upright) exclusivamente; no soporta aumentación de rotación ni marcos arbitrarios.
- Conversión entre el marco del gripper de GraspGen-X y el link del gripper del SO-101 mediante `graspgen_frame_in_gripper_link`.
- Descripción del gripper mediante marco y volumen de barrido (`grasp_frame.json`), sin necesidad de assets de malla del gripper.
- No dispone de tool calling, razonamiento multi-paso, capacidades multilingües ni modo thinking; no es un modelo de lenguaje.

## Casos de uso

- Planificación de agarres en mesa para el SO-101: dado un objeto segmentado y su nube de puntos, el modelo propone un conjunto de poses ordenadas por puntuación que un planificador puede intentar secuencialmente hasta encontrar una alcanzable.
- Manipulación de cubos y cuencos en escenas de escritorio: la model card reporta que ha levantado cubos y cuencos (incluido un cuenco por el borde) en Isaac Sim con física Newton, lo que lo hace adecuado para tareas de pick-and-place en simulación.
- Investigación en aprendizaje por imitación o refuerzo con SO-101: el modelo puede actuar como generador de propuestas de agarre dentro de un pipeline de recogida de datos o de evaluación de políticas.
- Prototipado de bajo coste: al estar ajustado al SO-101, un brazo de bajo coste, permite experimentar con agarres aprendidos sin depender de hardware industrial.
- Evaluación de robustez de agarres: el discriminador puntúa candidatos y permite comparar estrategias de aproximación (frontal, lateral, por el borde) en simulación antes de transferir a hardware.
- Filtrado previo en pipelines de percepción: integrado tras un segmentador de objetos y un estimador de nube de puntos estéreo, reduce el espacio de búsqueda de agarres antes de la planificación de trayectorias.
- Docencia e investigación en robótica: sirve como ejemplo reproducible de ajuste fino de un modelo generativo de agarres a una morfología de gripper concreta, con etiquetado físico en simulación.

## Benchmarks y rendimiento

| Metrica | Resultado |
|---|---|
| Colocaciones retenidas evaluadas | 237 |
| Agarres muestreados por colocación | 2.000 (agrupados en familias de agarre) |
| Colocaciones con algún agarre alcanzable | 217 de 237 |
| Mejor agarre alcanzable que se sostiene (reglas de las etiquetas) | 36% |
| Mejor agarre alcanzable que se sostiene (por resultado) | 57% |
| Intentos totales que se sostienen (por resultado) | 52% de 730 intentos |
| Tasa de éxito del modelo original de NVIDIA con SO-101 | 0,1% (según el autor) |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible, ya que no se trata de un modelo de lenguaje.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precisión; el repositorio ocupa 1,7 GB en disco y contiene dos checkpoints, por lo que la inferencia en FP32 requiere del orden de varios GB de VRAM, aunque la cifra exacta no se especifica.
- GPU recomendadas: no disponibles en la información proporcionada; al ser un modelo pequeño de robótica, es probable que quepa en GPUs de consumo, pero no se confirma.
- Compatibilidad con GPU de consumo: no confirmada.
- Opciones de despliegue: carga mediante la librería `graspgenx` (commit `b9429097728cb1c430dd78b92edf17ba318aad03`), bloqueando `graspgenx._setup_dependencies` antes de la importación para evitar la descarga de checkpoints de NVIDIA. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| GraspGen-X SO-101 (este) | no disponible | no aplica | 36% / 57% en 237 colocaciones (simulación) | NVIDIA Open Model License | Hugging Face, 0 descargas |
| GraspGen-X original (NVIDIA) | no disponible | no aplica | 0,1% de éxito con SO-101 según el autor | NVIDIA Open Model License | GitHub NVlabs/GraspGenX |
| Otros generadores de agarres (p. ej. basados en nubes de puntos) | no disponible | no aplica | no disponible | no disponible | no disponible |

La comparativa se limita al modelo base, ya que no se dispone de datos de alternativas comparables en la información proporcionada.

## Limitaciones y advertencias

- No se ha probado en un brazo real: todas las evaluaciones son en simulación (Newton/MuJoCo-Warp e Isaac Sim).
- No agarra varillas finas redondas, cucharas de 3 cm ni barras de 8 mm; ninguno de esos casos se sostuvo tampoco en entrenamiento.
- Solo funciona en orientación vertical y sin aumentación de rotación; los puntos deben expresarse en el marco upright descrito (z hacia arriba, -x hacia la base del brazo).
- Requiere bloquear `graspgenx._setup_dependencies` antes de importar la librería, lo que añade complejidad de integración.
- Licencia NVIDIA Open Model License: es necesario revisar `LICENSE.pdf` y `NOTICE` para confirmar condiciones de uso comercial, redistribución y atribución.
- Riesgo de alucinación de agarres: el generador puede proponer poses no alcanzables o inestables; el discriminador y la simulación mitigan pero no eliminan este riesgo.
- Sesgo morfológico: ajustado exclusivamente al gripper del SO-101 con la mandíbula abierta a 1,0 rad; no es transferible a otros grippers sin reentrenamiento.
- Sin datos de sesgo lingüístico ni de idioma, al no ser un modelo de lenguaje.
- Cero descargas y cero likes en el momento de la ficha: no hay validación comunitaria independiente.

## Enlaces

- Hugging Face: https://huggingface.co/roboticascent/graspgenx-so101
- Modelo base: https://huggingface.co/adithyamurali/GraspGenXModel
- Repositorio GraspGen-X de NVIDIA: https://github.com/NVlabs/GraspGenX
- Repositorio SO-ARM100 / SO-101: https://github.com/TheRobotStudio/SO-ARM100
- Licencia NVIDIA Open Model License: https://www.nvidia.com/en-us/agreements/enterprise-software/nvidia-open-model-license/
