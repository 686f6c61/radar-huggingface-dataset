# SionJang/ppo-Walker2d-v5

## Resumen

`SionJang/ppo-Walker2d-v5` es un agente de aprendizaje por refuerzo entrenado con el algoritmo PPO (Proximal Policy Optimization) sobre el entorno `Walker2d-v5` de MuJoCo, un benchmark clasico de control continuo en el que un bipedo simulado debe aprender a caminar. Lo publica el usuario SionJang en Hugging Face y esta implementado con Stable-Baselines3 2.9.0. No es un modelo de lenguaje ni un transformer generativo: es una politica neuronal que mapea observaciones del entorno a acciones continuas de 6 dimensiones.

El interes del artefacto no reside en su tamano (redes MLP de 256x256, sin parametros publicados) sino en su metodologia: segun la model card, el experimento completo (diseno, codigo, entrenamiento y evaluacion) fue ejecutado por un agente de IA (Rich, Claude Code) bajo supervision humana. Ademas, el autor documenta de forma explicita el protocolo de evaluacion (100 episodios deterministas con semillas 10000-10099) y compara dos recetas de red (64x64 frente a 256x256).

El modelo alcanza una recompensa media de 4905,96 +/- 16,86 en 100 episodios, con el 100 % de los episodios llegando a los 1000 pasos maximos, y se entrena en una unica maquina de consumo usando solo CPU. Es relevante como referencia reproducible de recetas de RL en CPU y como ejemplo de evaluacion honesta que incluye semillas fallidas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MLP (politica y funcion de valor independientes, 256x256, activacion tanh), algoritmo PPO |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (entorno de RL, observaciones de dimension fija) |
| Tipos de cuantizacion | no disponible (pesos en formato nativo de Stable-Baselines3, `.zip`) |
| Idiomas soportados | no aplica (no es un modelo de lenguaje) |
| Licencia | MIT |
| Formato de pesos | `.zip` de Stable-Baselines3 (`ppo_walker2d_seed0.zip`) + estadisticas de normalizacion en pickle (`vecnormalize_seed0.pkl`) |

## Arquitectura y entrenamiento

La politica y la red de valor son perceptrones multicapa de dos capas ocultas de 256 neuronas cada una, con activacion tanh, entrenados con PPO durante 1.000.000 de pasos de entorno con un unico entorno paralelo. Los hiperparametros son: `n_steps` 2048, `batch_size` 64, `n_epochs` 10, `gamma` 0.99, `gae_lambda` 0.95, `clip_range` 0.2 y tasa de aprendizaje 3e-4 con decaimiento lineal hasta 0. Se aplica normalizacion de observaciones y recompensas con VecNormalize y recorte a 10.

El entorno es `Walker2d-v5` de Gymnasium 1.3.0 con MuJoCo 3.12.0, y el entrenamiento se ejecuto con PyTorch 2.13.0 en CPU sobre un PC de consumo. El autor compara dos recetas: una red 64x64 (receta heredada de Hopper) y una 256x256. Con 8 semillas, la 64x64 fallo en 1 (recompensa media < 1500) y obtuvo una media de 3840,79; con 5 semillas, la 256x256 no fallo ninguna y obtuvo una media de 4918,22. El modelo publicado es la semilla 0 de la receta 256x256. El autor advierte que la diferencia 0/5 frente a 1/8 no es estadisticamente distinguible, aunque la mejora en puntuacion es consistente.

## Capacidades

- Control continuo de un bipedo simulado en MuJoCo: locomocion estable durante 1000 pasos en el 100 % de los episodios de evaluacion.
- Inferencia determinista en CPU con latencia muy baja, apta para bucles de simulacion en tiempo real.
- Reproducibilidad documentada: semillas de evaluacion fijas (10000-10099) y receta de entrenamiento publicada en un repositorio externo.
- No soporta tool calling, function calling, agentes multi-paso ni razonamiento simbolico: es una politica de RL especifica de tarea.
- No tiene capacidades multilingues ni de generacion de texto.
- Requiere obligatoriamente las estadisticas de normalizacion (`vecnormalize_seed0.pkl`) para replicar los resultados; sin ellas el rendimiento decae.

## Casos de uso

- Benchmark de referencia para PPO en control continuo: util para comparar implementaciones de Stable-Baselines3 o variantes de PPO contra una linea base con recompensa media conocida (4905,96) y protocolo de evaluacion fijo.
- Docencia de RL: sirve como ejemplo completo y reproducible de un pipeline PPO con normalizacion de observaciones y recompensas, ejecutable en CPU en una maquina de consumo.
- Estudio de recetas de red: permite analizar el efecto del tamano de la MLP (64x64 frente a 256x256) sobre la estabilidad del entrenamiento y las semillas fallidas.
- Generacion de datos de demostracion: la politica entrenada puede producir trayectorias expertas para inicializar tecnicas de imitation learning o comportamiento de referencia en `Walker2d-v5`.
- Pruebas de infraestructura de simulacion: al ser ligero y determinista, es adecuado para validar instalaciones de MuJoCo, Gymnasium o entornos de renderizado en CI.
- Comparacion de algoritmos de RL: linea base PPO contra SAC, TD3 o A2C en el mismo entorno y con el mismo presupuesto de 1M de pasos.
- Investigacion sobre agentes autonomos de IA: el artefacto documenta un flujo en el que un agente de IA disena, escribe y evalua el experimento, lo que permite estudiar la reproducibilidad de ese proceso.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados de forma independiente):

| Modelo / receta | Semillas | Semillas fallidas (media < 1500) | Media de todas las semillas |
|---|---|---|---|
| 64x64 (receta Hopper sin cambios) | 8 | 1 | 3840,79 |
| 256x256 (receta de este modelo) | 5 | 0 | 4918,22 |
| **Este modelo (semilla 0, 256x256)** | 1 | 0 | **4905,96 +/- 16,86** |

Detalle de la evaluacion del modelo publicado: 100 episodios con acciones deterministas, semillas 10000-10099, recompensa bruta del entorno, minimo 4861,14, 100/100 episodios alcanzan los 1000 pasos. Con la red 64x64, la misma semilla se desplomaba hacia el paso 330 en todos los episodios.

## Requisitos de hardware

- VRAM: no aplica; el modelo se ejecuta en CPU y ocupa del orden de kilobytes (repo de 0,0 GB).
- GPU recomendadas: ninguna necesaria. El entrenamiento original se hizo en CPU; cualquier GPU moderna aceleraria el entrenamiento pero no es requisito.
- Cabe en cualquier equipo de consumo, incluidos portatiles sin GPU dedicada.
- Despliegue: carga directa con `PPO.load("ppo_walker2d_seed0.zip", device="cpu")` de Stable-Baselines3; requiere Gymnasium 1.3.0, MuJoCo 3.12.0 y las estadisticas de normalizacion en pickle.
- Latencia y throughput: no disponibles de forma explicita; al ser una MLP de 256x256 con inferencia determinista, la latencia por paso es minima y el cuello de botella es la simulacion de MuJoCo, no la red.

## Comparativa con modelos similares

| Modelo | Entorno | Algoritmo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| SionJang/ppo-Walker2d-v5 | Walker2d-v5 | PPO | no disponible (MLP 256x256) | no aplica | MIT | Hugging Face |
| Agentes PPO de referencia de Stable-Baselines3 RL Zoo | Walker2d-v5 | PPO | no disponible | no aplica | MIT | Repositorio SB3 |
| Agentes SAC/TD3 de referencia para MuJoCo | Walker2d-v5 | SAC / TD3 | no disponible | no aplica | MIT | Repositorio SB3 |

No se dispone de datos de rendimiento de los modelos comparables en la informacion proporcionada, por lo que no se puede establecer una comparacion cuantitativa con ellos.

## Limitaciones y advertencias

- Modelo especifico de una sola tarea y un solo entorno (`Walker2d-v5`); no generaliza a otros entornos ni a tareas de lenguaje.
- Los resultados no estan verificados de forma independiente (`verified: false` en el model-index).
- La diferencia entre recetas (0/5 frente a 1/8 semillas fallidas) no es estadisticamente significativa segun el propio autor; la mejora debe interpretarse con cautela.
- Dependencia critica de `vecnormalize_seed0.pkl`: sin esas estadisticas el rendimiento no coincide con el reportado, y cargar pickles de fuentes no confiables es un riesgo de seguridad.
- El entrenamiento se limita a 1M de pasos y una sola semilla publicada; no hay analisis de robustez frente a perturbaciones del entorno.
- Licencia MIT: permite uso comercial y modificacion, pero sin garantias implicitas.
- No se documentan sesgos en el sentido de modelos de lenguaje; el principal riesgo es de sobreajuste al protocolo de evaluacion concreto y de reproducibilidad si cambian versiones de Gymnasium, MuJoCo o Stable-Baselines3.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/SionJang/ppo-Walker2d-v5
- Repositorio de recetas en CPU (codigo, protocolo de evaluacion y resultados de todas las semillas): https://github.com/sionjang101-create/cpu-rl-recipes
- Stable-Baselines3: https://github.com/DLR-RM/stable-baselines3
- Gymnasium (entorno Walker2d-v5): https://gymnasium.farama.org/
- MuJoCo: https://mujoco.org/
