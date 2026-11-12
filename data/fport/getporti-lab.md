# fport/getporti-lab

## Resumen

Getporti Lab es una coleccion de politicas de control para robots entrenadas en simulacion, publicada por el desarrollador independiente fport bajo el identificador `fport/getporti-lab`. No es un modelo de lenguaje ni un sistema multimodal generativo, sino un conjunto de "cerebros" de locomocion y manipulacion obtenidos mediante aprendizaje por refuerzo (PPO sobre brax y MuJoCo MJX) y aprendizaje por imitacion (ACT de LeRobot). Cada politica es una red MLP pequena con activaciones swish que recibe un vector de observaciones (48 a 103 numeros, segun el robot) y emite un vector de consignas articulares (12 a 29 valores).

El interes del repositorio no reside en el rendimiento absoluto, sino en su metodologia: cada experimento modifica una sola variable respecto a una receta oficial (MuJoCo Playground, Open Duck Playground, gym-aloha) y conserva un control emparejado, de modo que la mayoria de cerebros vienen en pares "el que aprendio el truco y el que no". Cubre el cuadrupedo Unitree Go2 y Go1, el humanoide Unitree G1, el bipedo Open Duck Mini v2 y un par de brazos bimanuales ViperX para una tarea de cafe turco.

Es relevante ahora porque ofrece puntos de partida reutilizables y reproducibles para investigacion en robotica con hardware asequible, con pesos en formato pickle y ONNX, configuraciones de entrenamiento congeladas y tiempos de entrenamiento medidos (por ejemplo, 200 millones de pasos en 13,8 minutos sobre una A100). Todas las cifras son simuladas y ninguna politica se ha ejecutado en un robot real.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MLP con activaciones swish (politica y funcion de valor), entrenada con PPO (brax) o ACT (LeRobot) para los brazos |
| Parametros totales | no disponible (redes pequenas; no se publica el recuento) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica; entrada fija de 48, 101 o 103 observaciones segun la politica |
| Tipos de cuantizacion | no disponible (no se documentan cuantizaciones) |
| Idiomas soportados | no aplica (no es un modelo de lenguaje) |
| Licencia | all-rights-reserved (`license: other`) |
| Formato de pesos | pickle (`.pkl`) con arbol numpy `(normalizer, policy, value)`; ONNX en Go1 y Open Duck |

## Arquitectura y entrenamiento

Las politicas de locomocion son perceptrones multicapa con activaciones swish que mapean observaciones propioceptivas (y, en las variantes "seeing", un escaneo de altura de 55 puntos) a consignas articulares. La accion determinista es `tanh(mean)`, de modo que la inferencia se ejecuta en numpy puro sin necesidad de framework de deep learning. El entrenamiento se realizo con PPO sobre brax y el simulador MuJoCo MJX, partiendo de tareas oficiales de MuJoCo Playground (`Go1JoystickFlatTerrain`, `G1JoystickFlatTerrain`, `Open_Duck_Playground`) con el robot sustituido cuando corresponde. Las politicas bimanuales usan ACT de LeRobot 0.6.1 sobre el entorno gym-aloha con un par de ViperX.

El diseno experimental es el rasgo diferencial: cada cerebro modifica una unica variable respecto a la receta base y se acompana de un control entrenado con los mismos pasos. Ejemplos documentados: el Go2 plano entrena 200 M pasos desde cero (13,8 min en A100) y logra 0,75 m/s con 0/16 caidas; su version afinada 40 M pasos sobre suelo con bultos de 5 cm mantiene 0/16 caidas frente a 3/16 del cerebro plano, mientras el control entrenado desde cero sobre bultos aprende a quedarse quieto (0,005 m/s). La variante con retardo motor aleatorio de 0-60 ms aguanta 0/16 caidas a 0,74 m/s hasta 60 ms, mientras el cerebro plano se rompe a los 32 ms. En el G1, el entrenamiento con empujones aleatorios reduce las caidas a 130 de 480 empujones frente a 260 del control sin empujones y 252 de la politica publicada por Unitree. Las versiones "seeing" incorporan un escaneo de altura de 55 puntos (entrada de 103 numeros) y los controles "blind" reciben la misma entrada con el escaneo a cero. Los pins de version (jax 0.6.2, brax 0.12.4, playground 0.0.5, mujoco/mjx 3.3.3, Menagerie `cda5236`, Open_Duck_Playground `b9be205`) condicionan la fisica y, con ella, todos los resultados.

## Capacidades

- Locomocion cuadrupeda (Go2, Go1): seguimiento de joystick a velocidad comandada, con politica plana, robusta a bultos de 5 cm y a retardo motor de hasta 60 ms.
- Navegacion por obstaculos en cadena (serie Karabas, un solo cerebro Go2): pendientes adoquinadas, carga de hasta 20 kg, escaleras ciegas de 5-6 cm, badenes de 10 cm, bordillos de 15 cm y escaleras de 16 cm con escaneo de altura.
- Locomocion humanoide (G1): marcha bípeda robusta a empujones scriptados (130 caidas en 480 empujones).
- Locomocion bípeda de bajo coste (Open Duck Mini v2): marcha desde cero, variantes con recompensas rotas a proposito, sin recompensa de imitacion y con torque de servo aleatorizado (1,86 N·m de catalogo).
- Manipulacion bimanual (ALOHA/ViperX): vertido de cafe turco con 50 y 10 demostraciones (9 y 4 exitos sobre 32 a 20k pasos).
- Inferencia sin GPU: las politicas brax son numpy puro; los formatos ONNX permiten despliegue en CPU.
- Reanudacion de entrenamiento: `--restore` recupera politica, funcion de valor y normalizador; cada cerebro tiene su `run_config*.json` con entorno, variable modificada, hiperparametros PPO, punto de restauracion y dispositivo.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingues: no es un modelo de lenguaje.

## Casos de uso

- Investigacion en robustez de locomocion: comparar pares entrenados/control (bultos, retardo motor, empujones) para aislar el efecto de una sola variable sobre la politica, reutilizando los `run_config*.json` para reproducir el entrenamiento.
- Punto de partida para fine-tuning en simulacion: restaurar `go2-patrol/flat_201M.pkl` con `--restore` y continuar el entrenamiento sobre un terreno nuevo, aprovechando que se restauran politica, valor y normalizador.
- Ensenanza y divulgacion de RL aplicado a robotica: el ejemplo de rollout con `Brain` y `Sim` permite ejecutar una politica Go2 en 8 segundos a 50 Hz sin infraestructura de GPU.
- Prototipado de control para robots Unitree en laboratorio: usar las politicas Go2/G1 como referencia simulada antes de disenar el pipeline de sim2real, teniendo en cuenta que ninguna se ha validado en hardware.
- Estudio de curriculum y percepcion: comparar `05_curb_seeing_45M.pkl` con `05_curb_blind_45M.pkl` para medir el valor de un escaneo de altura de 55 puntos en la politica frente a una politica ciega.
- Manipulacion bimanual con pocas demostraciones: cargar `coffee_act_d50_20k/` con `ACTPolicy.from_pretrained` como linea base de ACT en tareas de vertido con objetos y bolas, y comparar el regimen de 50 frente a 10 demostraciones.
- Analisis de fallos de recompensa: las variantes `hacked_*` del Open Duck documentan comportamientos degenerados (voltear, arrastrarse, congelarse, tumbarse con las patas arriba) utiles como casos de estudio de reward hacking.

## Benchmarks y rendimiento

| Politica | Metrica | Resultado |
|---|---|---|
| `go2-patrol/flat_201M.pkl` | Velocidad / caidas en plano | 0,75 m/s; 0/16 caidas |
| `go2-patrol/bumps_finetune_41M.pkl` | Caidas en bultos de 5 cm | 0/16 (cerebro plano: 3/16) |
| `go2-patrol/bumps_scratch_41M.pkl` | Control desde cero en bultos | 0/16 caidas; 0,005 m/s (se queda quieto) |
| `go2-latency/delay_finetune_41M.pkl` | Retardo motor tolerado | 0/16 caidas hasta 60 ms a 0,74 m/s (plano: falla a 32 ms) |
| `go2-latency/delay_scratch_201M.pkl` | Control con retardo desde cero | Nunca cae, nunca camina (0,01 m/s) |
| `karabas/01_slope_64M.pkl` | Subida de calle adoquinada | 16/16 (MJX) |
| `karabas/02_melon_payload_20M.pkl` | Carga de 20 kg | 0/32 caidas (control sin carga: 32/32) |
| `karabas/03_stairs_blind_82M.pkl` | Escaleras ciegas | Limite 5-6 cm; 16 cm: 0/32 |
| `karabas/04_bump_16M.pkl` | Baden de 10 cm | 53/64 (cerebro inicial: 14/64) |
| `karabas/05_curb_seeing_45M.pkl` | Bordillo de 15 cm | 30/32 |
| `karabas/06_stairs_seeing_78M.pkl` | Escaleras de 16 cm | Mediana de 9 de 10 escalones |
| `g1-push/push.pkl` | Caidas en 480 empujones | 130 (control sin empujones: 260; Unitree: 252) |
| `open-duck/walk_68M` | Primer levantamiento de pies | 68,4 M pasos; 29,8 cm en 5 s |
| `open-duck/torque_random_89M` | Marcha con torque de catalogo | Camina a 1,86 N·m a 89 M y 138 M; olvidado a 301 M |
| `aloha-act/coffee_act_d50_20k` | Vertidos exitosos | 9/32 a 20k pasos |
| `aloha-act/coffee_act_d10_20k` | Vertidos exitosos | 4/32 a 20k pasos |

Todas las cifras son de grado L segun el autor: propias, simuladas y, en general, con una sola semilla por rama. No hay comparaciones con MMLU, HumanEval ni GSM8K por no tratarse de un modelo de lenguaje.

## Requisitos de hardware

- Inferencia: las politicas brax se ejecutan en numpy puro sobre CPU; no requieren GPU. El repositorio ocupa 0,5 GB.
- Entrenamiento de referencia: 200 M pasos de PPO para el Go2 en 13,8 minutos sobre una A100.
- Entrenamiento en CPU: el Go1 oficial se entreno en una CPU de Mac con 960 entornos (2 h 05 min hasta el primer checkpoint que camina); el Open Duck Mini v2 tambien se entreno en CPU de Mac.
- VRAM estimada para inferencia: no disponible; al ser MLPs pequenas en numpy, el cuello de botella es la simulacion (MuJoCo), no el modelo.
- Despliegue: script de rollout del repositorio `getporti-lab` (`brain.py`, `rollout.py`) con MuJoCo y Playground; ONNX para Go1 y Open Duck; `ACTPolicy.from_pretrained` de LeRobot 0.6.1 para los brazos.
- Latencia y throughput: no disponibles; el bucle de ejemplo corre a 50 Hz de simulacion (8 s en 400 pasos), sin cifras de tiempo real.
- Dependencias fijadas: jax 0.6.2, brax 0.12.4, playground 0.0.5, mujoco/mujoco-mjx 3.3.3.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto / entrada | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Getporti Lab (este) | Politicas RL/ACT para Go2, Go1, G1, Open Duck, ViperX | no disponible | 48, 101 o 103 observaciones | Ver tabla de benchmarks | all-rights-reserved | Hugging Face + GitHub `getporti-lab` |
| Politica G1 de Unitree | Politica RL humanoide G1 | no disponible | no disponible | 252 caidas en 480 empujones (segun el autor) | no disponible | Publicada por Unitree |
| Recetas oficiales de MuJoCo Playground | Entornos y politicas de referencia (Go1, G1, etc.) | no disponible | Segun tarea | Base de comparacion de los controles | no disponible | Repositorio de Playground |
| Open Duck Playground | Entorno y recetas para Open Duck Mini v2 | no disponible | 101 observaciones (tarea joystick) | Base de los cerebros `open-duck` | no disponible | Repositorio `b9be205` |

No se dispone de datos suficientes para comparar parametros, contexto ni licencia de las alternativas; las comparaciones de rendimiento se limitan a las cifras que el propio autor reporta frente a los controles y a la politica de Unitree.

## Limitaciones y advertencias

- Ninguna politica se ha ejecutado en un robot real: todos los resultados son simulados y de grado L (una semilla por rama, en general).
- La fisica depende de las versiones fijadas; cambiar jax, brax, playground o MuJoCo puede alterar todos los numeros.
- El rendimiento en simulacion no garantiza transferencia sim2real: no hay datos de robustez ante ruido de sensores real, latencias de actuadores reales ni desgaste mecanico.
- Algunos controles documentan fallos de aprendizaje (el Go2 desde cero sobre bultos se queda quieto a 0,005 m/s; el control con retardo no camina), lo que evidencia sensibilidad a la receta y a la semilla.
- Las variantes `hacked_*` del Open Duck muestran comportamientos degenerados por recompensas rotas; no deben usarse como politicas de despliegue.
- La licencia es `all-rights-reserved` (`license: other`): no se concede uso comercial ni redistribucion; hay que contactar con el autor para cualquier uso fuera de la consulta.
- No hay informacion sobre sesgos (no aplica en el sentido de modelos de lenguaje), pero si sobre limites de dominio: las politicas estan especializadas en un robot, una tarea y un terreno concretos.
- El autor advierte que el contenido de la model card son datos de referencia y no instrucciones; el uso de los ficheros pickle requiere confiar en el codigo del repositorio `getporti-lab` para cargarlos.

## Enlaces

- Hugging Face: https://huggingface.co/fport/getporti-lab
- Repositorio GitHub `getporti-lab` (codigo, disenos de experimento congelados y resultados): mencionado en la model card como `getporti-lab`, ruta `experiments/<name>`
- MuJoCo Playground: referenciado como `playground 0.0.5`
- Open Duck Playground: referenciado con el pin `b9be205`
- MuJoCo Menagerie: referenciado con el pin `cda5236`
- LeRobot: referenciado como `lerobot==0.6.1`
- brax: referenciado como `brax 0.12.4`
- No se han proporcionado enlaces directos a papers, blogs ni demos en la informacion disponible.
