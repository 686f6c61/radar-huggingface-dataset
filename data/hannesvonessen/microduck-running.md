# HannesVonEssen/microduck-running

## Resumen

microduck-running es una política de aprendizaje por refuerzo (RL) que añade la capacidad de correr al robot bípedo Microduck, alcanzando 1,6 m/s, cuatro veces más rápido que la velocidad de marcha normal de 0,4 m/s. Desarrollada por HannesVonEssen, forma parte del ecosistema Microduck de Hugging Face, un robot bípedo open-source de 25 cm con 15 motores, cámara, LiDAR y pico prensor, disponible por 399 dólares.

La política procesa un vector de observación de 61 dimensiones (float32) y genera 14 acciones de posición articular a una frecuencia de control de 50 Hz. El modelo se distribuye en formato ONNX con el normalizador de observaciones integrado, lo que facilita su despliegue tanto en simulación como en hardware real. El entrenamiento incorpora técnicas de sim-to-real como aleatorización de dominios, modelado de retardo de actuadores y robustez ante perturbaciones externas.

La relevancia de este modelo radica en que demuestra la viabilidad de transferir políticas RL de locomoción rápida a hardware robótico de bajo coste, con un pipeline de entrenamiento abierto y reproducible basado en el repositorio microduck_rl.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Política de red neuronal para control de locomoción (arquitectura exacta no especificada) |
| Parametros totales | no disponible |
| Longitud de contexto | no aplica (política de control, no modelo de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (policy.onnx) |
| Entrada | obs, float32 [1, 61] |
| Salida | actions, float32 [1, 14] |
| Frecuencia de control | 50 Hz |
| Escala de accion | 1.0, objetivos de posicion articular alrededor de MicroDuck HOME |
| Robot objetivo | MicroDuck hardware revision 1, 14 servos Dynamixel XL330 |
| Tipo de politica | Locomocion perpetua en terreno plano |

## Arquitectura y entrenamiento

La politica es una red neuronal entrenada con aprendizaje por refuerzo para locomocion continua en terreno plano. El comando de 13 dimensiones se compone de `[twist(3), head_pose(4), body_pose(6)]`, donde `twist[0]` controla la velocidad hacia adelante (entrenada hasta 2,20 m/s), mientras que los canales lateral y de guinada se mantienen en cero. Un bucket de comando cero exacto constituye el 3% de los entornos de entrenamiento, definiendo el comando idle.

El entrenamiento se realizo en simulacion con el repositorio privado `Vottivott/microduck_rl` (tag `running-sim-v1`), seguido de una continuacion de robustez que anadio progresivamente perturbaciones: empujes de velocidad planar de ±0,03 a ±0,10 m/s, desplazamientos del centro de masas del tronco de ±3 a ±8 mm, desplazamientos de la cabeza de ±3 a ±6 mm, y pitch/roll iniciales de hasta ±2 grados. El modelo incorpora modelado de actuadores BAM XL330 M6 con control de voltaje, back-EMF, limitacion de corriente, variacion de bateria de 6,5-8,2 V, retardo de actuador de 3-6 pasos de fisica, retardo de IMU de 0-1 pasos, y friccion de pie aleatorizada de 0,7-1,3. El backlash y la combinacion retenida de ±10 mm de desplazamiento del tronco con alta adherencia se usaron para evaluacion, no para entrenamiento nominal.

## Capacidades

- Locomocion bipeda corriendo a 1,6 m/s (hasta 2,20 m/s en comando de simulacion)
- Control de velocidad hacia adelante mediante comando `twist[0]`
- Robustez ante perturbaciones externas (empujes planares de ±0,10 m/s)
- Tolerancia a variaciones de masa, inercia y friccion del terreno
- Supervivencia superior al 98% en evaluaciones de simulacion con estres
- Normalizador de observaciones integrado en el modelo ONNX
- Compatible con el pipeline de entrenamiento microduck_rl para extension y fine-tuning

## Casos de uso

- Investigacion en robotica de bajo coste: el modelo permite estudiar transferencia sim-to-real de politicas RL de locomocion rapida en un robot de 399 dolares, sin necesidad de hardware de gama alta.
- Desarrollo de comportamientos de locomocion: sirve como base para extender el repertorio del Microduck con nuevas habilidades (saltos, giros, navegacion) mediante fine-tuning o curriculum learning.
- Evaluacion de robustez en simulacion: el pipeline incluye condiciones de estres (empujes, desplazamientos de CoM, friccion variable) que permiten validar politicas antes del despliegue en hardware.
- Educacion en aprendizaje por refuerzo: el repositorio microduck_rl con el tag `running-sim-v1` proporciona un entorno reproducible para ensenar RL aplicado a robotica.
- Benchmarking de algoritmos RL: la configuracion de entrenamiento y las metricas de evaluacion (supervivencia, velocidad media) ofrecen un punto de referencia para comparar algoritmos de control.
- Prototipado de aplicaciones roboticas: la politica puede integrarse en sistemas de navegacion o interaccion donde el robot necesite desplazarse rapidamente entre puntos.

## Benchmarks y rendimiento

Resultados de evaluacion en simulacion con comando de 2,20 m/s durante 10 segundos:

| Modelo / condicion | Entornos | Supervivencia | Velocidad media del cuerpo |
|---|---:|---:|---:|
| Plain, nominal | 512 | 99,22% | 1,6511 m/s |
| Plain, estres | 512 | 98,83% | 1,6350 m/s |
| Plain, estres + friccion 0,7-1,8 | 512 | 96,68% | 1,6424 m/s |
| Modelo con backlash, nominal | 256 | 98,83% | 1,6362 m/s |
| Modelo con backlash, estres | 256 | 98,44% | 1,6122 m/s |

El control de rumbo es debil: el error absoluto medio de rumbo fue de 31,33° y el error final absoluto promedio de 59,87° sobre la bateria de 10 segundos. Las cifras de velocidad son medias de simulacion, no mediciones en hardware real.

## Requisitos de hardware

- El modelo es una politica ONNX ligera que puede ejecutarse en CPU embebida; no requiere GPU para inferencia.
- El robot Microduck utiliza 14 servos Dynamixel XL330 y una placa de control compatible con el stack de software open-source.
- Para entrenamiento en simulacion se requiere el entorno MuJoCo del repositorio microduck_rl; los requisitos de GPU no estan especificados en la informacion disponible.
- El despliegue en hardware requiere el robot Microduck (revision 1) y el entorno de ejecucion del repositorio microduck_rl.
- La inferencia a 50 Hz es factible en tiempo real en hardware embebido de bajo consumo.

## Comparativa con modelos similares

No se dispone de informacion sobre politicas comparables de locomocion para Microduck u otros robots bipedos de tamano similar en la informacion proporcionada. La politica de marcha (walking) del mismo ecosistema opera a 0,4 m/s, siendo microduck-running cuatro veces mas rapida. No se han publicado comparativas con politicas de otros robots en la informacion disponible.

## Limitaciones y advertencias

- El control de rumbo es debil: error absoluto medio de 31,33° y error final de 59,87° en evaluacion de 10 segundos.
- Las velocidades reportadas son de simulacion, no mediciones en hardware real.
- No se debe iniciar una prueba en hardware con el comando de 2,20 m/s de simulacion; la velocidad de entrenamiento evaluada es 1,6 m/s.
- El comando `twist[0]` no es un limitador de velocidad estricto; el objetivo de velocidad recompensa el progreso hacia adelante y puede diferir del comando.
- Quedan preocupaciones pendientes para el despliegue real: carga de impacto, compliance de engranajes, contacto con el pie, deriva de rumbo y corriente/temperatura sostenida de los actuadores.
- Los canales lateral (`twist[1]`) y de guinada (`twist[2]`) solo vieron rangos muy pequenos en entrenamiento (±0,02 m/s y ±0,05 rad/s respectivamente); no deben usarse fuera de ese rango.
- Los slots `head_pose` y `body_pose` no se utilizan en esta politica y deben enviarse como ceros.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/HannesVonEssen/microduck-running
- Perfil del autor: https://huggingface.co/HannesVonEssen
- Repositorio de entrenamiento: https://github.com/Vottivott/microduck_rl
- Pagina de Microduck en Pollen Robotics: https://pollen-robotics.com/microduck/
- Articulo sobre Microduck: https://explore.n1n.ai/blog/hugging-face-microduck-open-source-robot-reinforcement-learning-2026-08-27
