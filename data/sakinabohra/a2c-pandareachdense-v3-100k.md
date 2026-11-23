# SakinaBohra/a2c-PandaReachDense-v3-100k

## Resumen

Este repositorio contiene un agente de aprendizaje por refuerzo entrenado con el algoritmo Advantage Actor-Critic (A2C) para controlar un brazo robotico Panda en el entorno PandaReachDense-v3, perteneciente a la suite Panda-Gym. Lo desarrolla SakinaBohra y se publica bajo la libreria Stable-Baselines3, con el objetivo de resolver una tarea de alcance (reach) en la que el efector final del robot debe alcanzar una posicion objetivo en el espacio tridimensional.

No se trata de un modelo de lenguaje ni de un modelo fundacional: es una politica neuronal de control motor, empaquetada como un fichero `.zip` de Stable-Baselines3. Su relevancia es acotada y practica: sirve como referencia reproducible de un agente A2C que resuelve un entorno de manipulacion robotica denso en recompensa, util para comparativas de algoritmos, experimentos docentes y como linea base en investigacion de RL aplicado a robotica.

El entrenamiento se realizo durante 100.000 pasos sobre CPU con una politica `MultiInputPolicy`, y la model card reporta una tasa de exito del 100% en 100 episodios de evaluacion determinista, con una recompensa media de -0,2896 y una distancia final media de 0,0355 metros al objetivo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal de politica (actor-critic) gestionada por Stable-Baselines3 con `MultiInputPolicy` |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (no es un modelo de lenguaje) |
| Tipos de cuantizacion | no disponible (pesos en formato `.zip` de Stable-Baselines3) |
| Idiomas soportados | no aplica (no procesa lenguaje natural) |
| Licencia | no disponible |
| Formato de pesos | `.zip` (checkpoint de Stable-Baselines3: `a2c_pandareach_100k.zip`) |

## Arquitectura y entrenamiento

El agente emplea el algoritmo A2C (Advantage Actor-Critic), un metodo on-policy de gradiente de politica con estimacion de ventaja, implementado en Stable-Baselines3. La politica es de tipo `MultiInputPolicy`, lo que indica que el entorno entrega observaciones compuestas por multiples claves (tipicamente estado de articulaciones y posicion del objetivo en Panda-Gym). Los hiperparametros declarados en la model card son: tasa de aprendizaje 0,0007, factor de descuento gamma 0,99, `n_steps` de 5 y entrenamiento sobre CPU. No se utilizo `VecNormalize` durante el entrenamiento.

El entrenamiento total fue de 100.000 timesteps en el entorno PandaReachDense-v3, una variante con recompensa densa que penaliza de forma continua la distancia entre el efector final y el objetivo. No se documentan detalles sobre inicializacion de pesos, semillas, numero de entornos paralelos ni composicion de episodios de entrenamiento; esa informacion no esta disponible en la model card.

## Capacidades

- Control motor de un brazo robotico Panda para tareas de alcance de un punto objetivo en el espacio 3D.
- Generacion de acciones continuas a partir de observaciones compuestas (estado de articulaciones y posicion del objetivo), mediante `MultiInputPolicy`.
- Politica determinista apta para evaluacion y despliegue en simulacion (la evaluacion reportada usa acciones deterministas).
- Integracion directa con el ecosistema Stable-Baselines3 y Gymnasium/Panda-Gym para carga y evaluacion.
- No dispone de generacion de texto, razonamiento simbolico, codigo, matematicas, vision general, tool calling, capacidades de agente multi-paso ni soporte multilingue.

## Casos de uso

- Linea base en investigacion de RL para robotica: sirve como referencia A2C ya entrenada contra la que comparar variantes (PPO, SAC, TD3) en PandaReachDense-v3, midiendo tasa de exito, recompensa media y longitud de episodio.
- Docencia y tutoriales de aprendizaje por refuerzo: el agente permite demostrar el ciclo completo de entrenamiento y evaluacion con Stable-Baselines3 sobre un entorno de manipulacion realista, sin necesidad de reentrenar.
- Validacion de pipelines de simulacion: al cargarse como politica `.zip`, se puede integrar en scripts de evaluacion automatizada para comprobar que el entorno Panda-Gym y las dependencias funcionan correctamente.
- Estudio de recompensas densas: el entorno PandaReachDense-v3 penaliza la distancia de forma continua, y este agente permite analizar como una politica A2C explota esa senal para reducir la distancia final a 0,0355 m de media.
- Punto de partida para fine-tuning: el checkpoint puede reutilizarse como inicializacion en variantes del entorno (distintas posiciones objetivo, ruido en observaciones) para estudiar transferencia y robustez.
- Benchmarking de eficiencia de algoritmos: con solo 100.000 timesteps y entrenamiento en CPU, es util para medir coste computacional y velocidad de convergencia de A2C frente a alternativas en tareas de alcance.

## Benchmarks y rendimiento

Resultados de evaluacion reportados por el autor sobre 100 episodios con acciones deterministas:

| Metrica | Resultado |
|---|---|
| Tasa de exito | 100% |
| Recompensa media por episodio | -0,2896 |
| Longitud media de episodio | 3,59 pasos |
| Distancia final media al objetivo | 0,0355 metros |

No se han publicado comparaciones con otros algoritmos o modelos en la informacion disponible.

## Requisitos de hardware

- Inferencia en CPU: el propio entrenamiento se realizo en CPU, y una politica A2C de este tipo es ligera; no se especifica el numero de parametros, pero el tamano del repositorio es de 0,0 GB (fichero `.zip` de pocos megabytes).
- VRAM estimada: no disponible; el modelo esta pensado para ejecutarse en CPU sin GPU.
- GPU recomendadas: no aplica; cualquier GPU moderna puede acelerar la inferencia, pero no es necesaria.
- Cabe en cualquier equipo de consumo: no requiere GPU dedicada.
- Opciones de despliegue: carga mediante Stable-Baselines3 (`A2C.load`) junto con Gymnasium y Panda-Gym; no es compatible con vLLM, llama.cpp, Ollama ni TGI, que estan orientados a modelos de lenguaje.
- Latencia y throughput: no disponibles en la informacion proporcionada; la longitud media de episodio de 3,59 pasos sugiere una politica que alcanza el objetivo en muy pocos pasos de simulacion.

## Comparativa con modelos similares

No se dispone de informacion sobre otros agentes publicados para PandaReachDense-v3 en la documentacion proporcionada, por lo que la comparativa cuantitativa no esta disponible. Como referencia cualitativa de categoria:

| Modelo | Algoritmo | Entorno | Timesteps | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (SakinaBohra/a2c-PandaReachDense-v3-100k) | A2C | PandaReachDense-v3 | 100.000 | no disponible | Hugging Face |
| Alternativas A2C/PPO/SAC para Panda-Gym | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Especifico del entorno PandaReachDense-v3: la politica no generaliza a otras tareas, morfologias de robot ni variantes del entorno sin reentrenamiento o fine-tuning.
- Evaluacion limitada: los resultados provienen de 100 episodios deterministas reportados por el autor; no hay validacion independiente ni intervalos de confianza.
- Sin `VecNormalize`: al no haberse usado normalizacion de observaciones durante el entrenamiento, la politica puede ser sensible a cambios de escala o distribucion en las observaciones en despliegues modificados.
- Licencia no especificada: la ausencia de licencia explicita impide confirmar condiciones de uso comercial; debe contactarse con el autor antes de cualquier uso en produccion.
- Riesgo de sobreajuste al objetivo de entrenamiento: una tasa de exito del 100% en el conjunto evaluado no garantiza robustez ante posiciones objetivo fuera de la distribucion de entrenamiento.
- Sin informacion sobre sesgos, datos de entrenamiento detallados ni reproducibilidad (semillas, configuracion completa); la model card no documenta estos extremos.
- No apto para tareas de lenguaje, vision general ni agentes conversacionales; su uso esta restringido al control robotico en simulacion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/SakinaBohra/a2c-PandaReachDense-v3-100k
- Stable-Baselines3: https://github.com/DLR-RM/stable-baselines3
- Panda-Gym: https://github.com/qgallouedec/panda-gym
- Gymnasium: https://github.com/Farama-Foundation/Gymnasium
