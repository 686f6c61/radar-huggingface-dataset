# lookarooka/connectailab-rl-novice-v2-Humanoid-v5-ppo

## Resumen

`connectailab-rl-novice-v2-Humanoid-v5-ppo` es un agente de aprendizaje por refuerzo entrenado con el algoritmo PPO (Proximal Policy Optimization) para resolver la tarea de control continuo `Humanoid-v5` del motor de fisica MuJoCo, integrada en Gymnasium. Lo desarrolla CONNECT AI LAB (autor del repositorio en Hugging Face: `lookarooka`) como modelo de practica (nivel "novice", version 2) dentro de su proyecto de aprendizaje por refuerzo. No es un modelo de lenguaje: es una politica neuronal (Actor-Critic) que controla los 17 actuadores de un humanoide simulado para que mantenga el equilibrio y camine en bipedestacion.

El entorno tiene un espacio de observacion de 348 dimensiones (angulos y velocidades articulares, inercia del centro de masa `cinert`, fuerzas de contacto `cfrc_ext`, etc.) y un espacio de accion continuo de 17 dimensiones con torques acotados en el rango `[-0.4, 0.4]`. El modelo incorpora normalizacion online de estados mediante el algoritmo de Welford, con los estadisticos guardados como buffers junto a los pesos, lo que garantiza la reproducibilidad en inferencia.

Es relevante como referencia practica y reproducible de un pipeline PPO completo sobre MuJoCo: entrenamiento en 500.000 pasos con 16 entornos paralelos, un tiempo de entrenamiento declarado de 211,1 segundos y una puntuacion media de 3962,3 en 20 episodios de evaluacion. Su utilidad es docente y experimental, no de produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red Actor-Critic MLP con capas ocultas de 256 x 256, normalizacion online de estados (RunningMeanStd, Welford) integrada como buffers, salida de politica `tanh(x) * 0.4` para 17 acciones continuas |
| Parametros totales | no disponible (el repositorio declara 0.0 GB; el numero exacto de parametros no se especifica) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (no es un modelo de lenguaje); horizonte de decision de 256 pasos por rollout y 500.000 pasos de entrenamiento |
| Tipos de cuantizacion | no aplica; pesos en precision nativa PyTorch (`model.pt`) |
| Idiomas soportados | no aplica (no procesa texto) |
| Licencia | no disponible |
| Formato de pesos | `model.pt` (checkpoint PyTorch, `torch.load` / `load_state_dict`) |

## Arquitectura y entrenamiento

La politica es una red neuronal densa con dos capas ocultas de 256 neuronas, dimensionada para mapear 348 entradas de estado a 17 salidas de torque. La capa de salida aplica `tanh(x) * 0.4` para respetar los limites del espacio de accion `Box(-0.4, 0.4, (17,), float32)`. La innovacion principal es la inclusion de un buffer de normalizacion de estados basado en el algoritmo de Welford registrado dentro del propio modulo (`register_buffer`), de modo que la media y la varianza acumuladas se serializan junto a los pesos y se aplican en inferencia con recorte a `[-10, 10]`. Esto evita la saturacion de `tanh` causada por la disparidad de escalas entre observaciones (angulos en torno a +-1 frente a fuerzas de contacto de centenares de unidades).

El entrenamiento sigue PPO con recoleccion paralela de rollouts: 16 entornos `Humanoid-v5` ejecutados 256 pasos cada uno, lo que produce lotes de 4096 transiciones por actualizacion. Se emplean 10 epocas por actualizacion, minibatch de 512, tasa de aprendizaje 0,0003 con decaimiento lineal, factor de descuento `gamma=0.99`, `lambda=0.95` para GAE y recorte `epsilon=0.2` en la funcion objetivo sustituta. La desviacion tipica inicial de exploracion se fija en `log sigma = -1.0` (sigma aproximada de 0,37). El total declarado es de 500.000 pasos con un tiempo de entrenamiento de 211,1 segundos.

## Capacidades

- Control continuo de un humanoide simulado de 17 articulaciones con torques acotados a +-0.4.
- Locomocion bipeda y mantenimiento del equilibrio en `Humanoid-v5` durante episodios prolongados.
- Procesamiento de observaciones de alta dimension (348 valores fisicos) con normalizacion interna de escala.
- Politica determinista en inferencia (se usa la media de la distribucion) y estocastica durante el entrenamiento.
- Reproducibilidad completa de la inferencia gracias a la serializacion conjunta de pesos y estadisticos de normalizacion.
- Visualizacion en tiempo real mediante `render_mode="human"` y OpenGL/GLFW.
- No soporta tool calling, function calling, agentes multi-paso, razonamiento simbolico, vision, audio ni capacidades multilingues.

## Casos de uso

- Docencia de aprendizaje por refuerzo: sirve como ejemplo completo y reproducible de un pipeline PPO sobre MuJoCo, desde la recoleccion paralela de rollouts hasta la evaluacion, con hiperparametros y resultados documentados.
- Investigacion en control continuo: punto de partida para experimentos de ajuste fino, cambios de recompensa o comparacion de variantes de PPO en `Humanoid-v5`.
- Benchmarking de infraestructura de entrenamiento: con 500.000 pasos en 211,1 segundos sobre 16 entornos paralelos, permite medir el rendimiento de una maquina o de un cluster en tareas de RL.
- Validacion de tecnicas de normalizacion de observaciones: el buffer Welford integrado en el checkpoint permite estudiar el efecto de la normalizacion online en entornos con escalas heterogeneas.
- Generacion de datos sinteticos de trayectorias: las politicas entrenadas pueden producir rollouts etiquetados para entrenar modelos de dinamica o imitacion.
- Demostraciones visuales e interactivas: la API de renderizado permite grabar videos o presentar el comportamiento del agente en charlas y clases.
- Simulacion de control de robots bipedos antes de transferir estrategias a hardware real (con las cautelas propias del salto de simulacion a realidad).

## Benchmarks y rendimiento

| Metrica | Resultado |
|---|---|
| Puntuacion media acumulada (20 episodios de prueba) | 3962,3 |
| Supervivencia media (20 episodios de prueba) | 732,0 pasos |
| Pasos totales de entrenamiento | 500.000 |
| Tiempo de entrenamiento declarado | 211,1 segundos |
| Transiciones por actualizacion | 4096 (16 entornos x 256 pasos) |

No se han publicado comparaciones con otros agentes ni resultados en benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible, ya que no aplican a un modelo de control continuo.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB; la red es un MLP de dos capas de 256 neuronas y el checkpoint ocupa una fraccion minima de un repositorio declarado en 0.0 GB.
- GPU recomendadas: cualquier GPU moderna es suficiente; el cuello de botella es la simulacion fisica MuJoCo, no la red neuronal. Para entrenamiento paralelo con 16 entornos se recomienda una GPU de gama media-alta (RTX 3060 o superior) o CPU con muchos nucleos.
- Cabe en cualquier GPU de consumo, e incluso la inferencia puede ejecutarse en CPU sin problema.
- Opciones de despliegue: script Python con `gymnasium`, `mujoco` y `torch`; descarga del checkpoint mediante `huggingface_hub.hf_hub_download`. No se contemplan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles de forma explicita; el entrenamiento completo de 500.000 pasos se declara en 211,1 segundos, lo que da una referencia aproximada de 2370 pasos de simulacion por segundo en el hardware del autor (no especificado).

## Comparativa con modelos similares

| Modelo | Tipo | Entorno | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| connectailab-rl-novice-v2-Humanoid-v5-ppo | PPO, MLP Actor-Critic | MuJoCo Humanoid-v5 | no disponible | no aplica | no disponible | Hugging Face |
| Agentes de referencia de Stable-Baselines3 (PPO Humanoid) | PPO, MLP | MuJoCo Humanoid-v4/v5 | no disponible | no aplica | MIT (libreria) | GitHub / documentacion |
| CleanRL PPO continuo | PPO, MLP | MuJoCo (varios) | no disponible | no aplica | MIT (libreria) | GitHub |

No se dispone de resultados comparativos publicados entre este modelo y las implementaciones de referencia en la informacion proporcionada; la comparacion se limita a la categoria y al marco de entrenamiento.

## Limitaciones y advertencias

- Modelo de practica (nivel "novice"): no esta pensado para produccion ni para control de robots reales sin una validacion exhaustiva.
- Entrenado exclusivamente en el simulador `Humanoid-v5`; el rendimiento fuera de esa distribucion (variaciones de fisica, ruido, hardware real) no esta garantizado.
- La puntuacion media de 3962,3 y la supervivencia de 732,0 pasos corresponden a 20 episodios de prueba; la varianza entre episodios y la robustez ante semillas distintas no se documentan.
- Licencia no especificada: no se puede confirmar el uso comercial ni la redistribucion de los pesos.
- El codigo de inferencia del ejemplo importa un modulo local (`humanoid_ppo`) que no se distribuye en el repositorio; es necesario reimplementar la clase de la politica para cargar el checkpoint.
- No incluye capacidades de lenguaje, vision ni interaccion multimodal; cualquier expectativa en ese sentido es erronea.
- Riesgo de sobreajuste a la recompensa por defecto de `Humanoid-v5`, que prioriza el avance hacia delante y puede producir gaitas poco naturales.
- No se documentan sesgos de comportamiento, pero al ser un agente entrenado con una recompensa concreta, su politica refleja unicamente ese objetivo.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/lookarooka/connectailab-rl-novice-v2-Humanoid-v5-ppo
- Entorno Humanoid-v5 en Gymnasium: https://gymnasium.farama.org/environments/mujoco/humanoid/
- Documentacion de MuJoCo: https://mujoco.readthedocs.io/
- Paper de PPO (Schulman et al., 2017): https://arxiv.org/abs/1707.06347
- Stable-Baselines3 (implementacion de referencia de PPO): https://github.com/DLR-RM/stable-baselines3
- CleanRL (implementacion de referencia de PPO continuo): https://github.com/vwxyzjn/cleanrl
