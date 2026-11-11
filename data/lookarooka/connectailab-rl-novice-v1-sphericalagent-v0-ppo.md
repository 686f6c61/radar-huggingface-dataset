# lookarooka/connectailab-rl-novice-v1-SphericalAgent-v0-ppo

## Resumen

`connectailab-rl-novice-v1-SphericalAgent-v0-ppo` es un agente de aprendizaje por refuerzo profundo entrenado con PPO (Proximal Policy Optimization) para controlar un robot esferico de 100,0 kg en un entorno de simulacion fisica MuJoCo 3.2.7 registrado como `SphericalAgent-v0` en Gymnasium 1.1+. Lo desarrolla el usuario `lookarooka` en el marco del proyecto CONNECT AI LAB, en su variante "novice v1". El problema que resuelve es la navegacion autonoma con evitacion de obstaculos: el agente debe desplazar la esfera desde su posicion inicial hasta un objetivo holografico esquivando una pista con una columna central, cuatro pilares en las esquinas y cuatro muros de baffle.

A diferencia de un modelo de lenguaje, no se trata de un transformer generativo sino de una politica actor-critica de dos redes MLP de 64x64 unidades con activacion Tanh, que mapea un vector de observacion de 18 dimensiones a dos salidas de par continuo en el rango [-220, +220] N·m. La observacion combina la posicion relativa y distancia al objetivo, el vector de velocidad lineal, la velocidad angular en tres ejes, un termino de alineacion y ocho lecturas de un LiDAR virtual de 8 canales a 45 grados de resolucion angular.

Su relevancia es acotada pero concreta: es un artefacto reproducible de control continuo con MuJoCo y Gymnasium, con pesos y fichero de entorno publicados, util como referencia de pipeline PPO para robotica simulada y como caso de estudio de ingenieria de recompensas (nueve terminos de recompensa y penalizacion combinados). El repositorio ocupa 0,0 GB y no registra descargas ni likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Actor-critico PPO con MLP (actor 18->64->64->2, critico 18->64->64->1, activacion Tanh) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (entorno de refuerzo con observacion de 18 dimensiones por paso) |
| Tipos de cuantizacion | no disponible (checkpoint PyTorch `spherical_ppo_model.pt`) |
| Idiomas soportados | en, ko (documentacion de la model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | Checkpoint PyTorch `.pt` con claves `obs_mean` y `obs_var` para normalizacion Welford |

## Arquitectura y entrenamiento

La politica es un actor-critico PPO clasico con dos perceptrones multicapa independientes de dos capas ocultas de 64 neuronas y activacion Tanh. La entrada es un vector de 18 componentes: indices 0-2 con la posicion relativa y la distancia euclidea al objetivo en metros; 3-5 con las velocidades lineales `vx`, `vy` y el modulo de velocidad; 6-8 con las velocidades angulares `wx`, `wy`, `wz`; indice 9 con la alineacion coseno entre direccion de avance y direccion al objetivo; e indices 10-17 con las ocho lecturas de LiDAR normalizadas en [0,0, 1,0] a 0, 45, ..., 315 grados. Las observaciones se normalizan en linea mediante estadisticas Welford (`obs_mean`, `obs_var`) almacenadas en el checkpoint junto con los pesos.

El entorno simula una esfera de 100,0 kg con radio 0,20 m e inercia de cascara esferica I = (2/3)·m·r² = 2,6667 kg·m². La accion es un par de dos componentes en [-1,0, 1,0] que se escala a ±220,0 N·m sobre los ejes de rodadura x e y. La recompensa total agrega progreso (+10,0 por metro de reduccion de distancia), proximidad (+0,5·exp(-d/2,0)), alineacion (+0,3·max(0, alignment)), bonus de objetivo (+100,0 dentro de 38 cm) y penalizaciones por tiempo (-0,05 por paso), energia (-0,02·||a||²), giro (-0,005·wz²), proximidad a obstaculo (-2,0·(0,25 - d)/0,25) y colision (-12,0). El entrenamiento uso 8 entornos paralelos, 483.328 pasos y 1.004 episodios. No se documentan datos sobre RLHF, DPO ni decodificacion especulativa, que no aplican a este tipo de modelo.

## Capacidades

- Control continuo de un robot esferico mediante pares de rodadura en dos ejes dentro de un entorno MuJoCo.
- Navegacion hacia objetivo con observacion egocentrica de posicion, velocidad, alineacion y distancia.
- Evitacion de obstaculos con LiDAR virtual de 8 canales y 45 grados de resolucion angular.
- Supresion activa del giro en el eje z gracias al termino de penalizacion de spin.
- Politica determinista o estocastica segun muestreo de la distribucion de acciones PPO.
- Integracion estandar con Gymnasium 1.1+ mediante `gym.make("SphericalAgent-v0")` y renderizado 3D con `render_mode="human"`.
- No soporta tool calling, function calling, razonamiento multi-paso simbolico, vision real, audio ni modo "thinking"; sus capacidades se limitan al control motor simulado.

## Casos de uso

- Prototipado de pipelines PPO en robotica simulada: sirve como referencia completa (entorno, recompensa, normalizacion de observaciones y checkpoint) para validar una infraestructura de entrenamiento con Gymnasium y MuJoCo antes de escalar a robots propios.
- Estudio de ingenieria de recompensas: el diseno con nueve terminos (progreso, proximidad, alineacion, objetivo, tiempo, energia, giro, proximidad a obstaculo y colision) permite experimentar con pesos y observar el efecto en la tasa de exito del 66,7 % reportada.
- Benchmark de control continuo con obstaculos: la escena con columna central, cuatro pilares y cuatro baffles es un banco de pruebas reproducible para comparar algoritmos (PPO frente a SAC, TD3 o Dreamer) en igualdad de condiciones.
- Docencia de aprendizaje por refuerzo: el repositorio incluye el fichero `world.xml` y `spherical_agent_env.py`, lo que facilita montar practicas de PPO con observaciones normalizadas en linea.
- Validacion de tecnicas de normalizacion Welford: el checkpoint expone `obs_mean` y `obs_var`, util para estudiar la estabilidad del entrenamiento con observaciones de escala heterogenea (metros, rad/s, cosenos y lecturas LiDAR).
- Simulacion de logistica con cargas pesadas: el modelo de 100 kg y pares de hasta 220 N·m es un punto de partida para estudiar el compromiso entre energia consumida y tiempo de llegada en transporte de objetos esfericos.
- Generacion de datos sinteticos de trayectorias: las politicas entrenadas pueden generar rollouts etiquetados para entrenar modelos de dinamica o controladores por imitacion.

## Benchmarks y rendimiento

Los datos siguientes proceden del `model-index` declarado por el autor y de la model card; no estan verificados de forma independiente (`verified: false`).

| Metrica | Valor |
|---|---|
| Tarea | reinforcement-learning |
| Entorno / dataset | SphericalAgent-v0 |
| Recompensa media (`mean_reward`) | 89,7 |
| Pasos totales de entrenamiento | 483.328 |
| Entornos paralelos | 8 |
| Episodios | 1.004 |
| Recompensa inicial de referencia | -292 puntos |
| Tasa de exito en objetivo (fase final) | 66,7 % |
| Tiempo medio hasta objetivo | 1,2 - 2,4 s |

No se han publicado resultados comparativos con otros algoritmos ni con otros modelos en la informacion disponible.

## Requisitos de hardware

- Inferencia en CPU: viable, dado que la politica es una MLP de dos capas de 64 neuronas y la observacion tiene 18 dimensiones; el cuello de botella es la simulacion MuJoCo, no la red.
- VRAM estimada: no disponible; el checkpoint PyTorch es de tamano reducido (repositorio de 0,0 GB) y no requiere GPU para inferencia.
- GPU recomendadas: no disponibles; cualquier GPU compatible con PyTorch sirve para acelerar la simulacion o el entrenamiento, pero la model card no especifica modelos concretos (A100, H100, RTX 4090 u otros).
- Cabe en cualquier GPU de consumo: si, por el tamano del modelo, aunque no se documenta un requisito minimo.
- Opciones de despliegue: script Python con `gymnasium`, `mujoco`, `torch`, `numpy`, `glfw` e `imageio`; descarga de pesos mediante `huggingface_hub.hf_hub_download`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles de forma agregada; la model card reporta tiempos de llegada al objetivo de 1,2 a 2,4 s por episodio en la simulacion.

## Comparativa con modelos similares

| Modelo | Tipo | Entorno | Parametros | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| connectailab-rl-novice-v1-SphericalAgent-v0-ppo | PPO, MLP actor-critico | SphericalAgent-v0 (MuJoCo) | no disponible | Apache 2.0 | Hugging Face |
| Políticas PPO de referencia de Stable-Baselines3 | PPO, MLP | Entornos Gymnasium/MuJoCo estandar | configurables | MIT | GitHub |
| Políticas de referencia de CleanRL | PPO, MLP | Entornos Gymnasium/MuJoCo estandar | configurables | MIT | GitHub |

No se dispone de datos de rendimiento de alternativas sobre el mismo entorno `SphericalAgent-v0`, por lo que la comparacion cuantitativa directa no esta disponible.

## Limitaciones y advertencias

- Entrenamiento corto: 483.328 pasos y 1.004 episodios; la tasa de exito del 66,7 % implica que aproximadamente un tercio de los episodios no alcanza el objetivo.
- Entorno especifico: la politica esta acoplada a la fisica y geometria de `SphericalAgent-v0` (masa, radio, pares maximos, disposicion de obstaculos); no se garantiza transferencia a otras escenas ni a un robot real.
- LiDAR de baja resolucion: solo 8 canales a 45 grados, lo que puede dejar angulos ciegos frente a obstaculos estrechos.
- Riesgo de sobreajuste a la semilla de entrenamiento: la model card no documenta evaluacion multi-semilla ni intervalos de confianza.
- Metricas no verificadas: el `mean_reward` de 89,7 figura como `verified: false` en el model-index.
- Idiomas: la model card esta en coreano e ingles; no hay documentacion en castellano.
- Licencia Apache 2.0: permite uso comercial y modificacion con atribucion y conservacion del aviso de licencia, pero el autor no ofrece garantias sobre el comportamiento en produccion.
- No apto para tareas de lenguaje, vision, tool calling ni agentes conversacionales; su ambito es exclusivamente el control continuo simulado.
- El ejemplo de la model card incluye un bucle de inferencia que llama a `env.action_space.sample()` en lugar de ejecutar la politica cargada; conviene revisarlo antes de reutilizarlo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/lookarooka/connectailab-rl-novice-v1-SphericalAgent-v0-ppo
- Perfil del maintainer: https://huggingface.co/novice
- Gymnasium: https://gymnasium.farama.org/
- MuJoCo (Google DeepMind): https://github.com/google-deepmind/mujoco
- Licencia Apache 2.0: https://opensource.org/licenses/Apache-2.0
