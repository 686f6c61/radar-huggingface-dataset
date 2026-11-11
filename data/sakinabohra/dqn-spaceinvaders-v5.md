# SakinaBohra/dqn-SpaceInvaders-v5

## Resumen

DQN Agent Playing Space Invaders es un agente de aprendizaje por refuerzo profundo entrenado con Stable-Baselines3 sobre el entorno ALE/SpaceInvaders-v5 de la suite Atari Learning Environment. Lo desarrolla SakinaBohra como artefacto de experimentacion, no como modelo de lenguaje: no procesa texto ni genera contenido, sino que aprende una politica de accion para jugar a Space Invaders a partir de observaciones visuales (frames apilados). El algoritmo es Deep Q-Network (DQN) con una politica convolucional (CnnPolicy), y el checkpoint publicado corresponde a 700.000 pasos de entrenamiento de un experimento completo de 1.000.000 de pasos.

El modelo resuelve un problema de control secuencial con recompensa escasa y observaciones de alta dimensionalidad (imagenes), un clasico de referencia en RL. Su relevancia es principalmente educativa y de reproducibilidad: sirve como ejemplo de pipeline completo con RL Baselines3 Zoo, incluyendo configuracion de entrenamiento, evaluacion estocastica de 30 episodios y una grabacion de gameplay. No es un modelo de proposito general ni esta pensado para despliegue en produccion.

La evaluacion publicada reporta una recompensa media de 573,33 con desviacion tipica de 207,10 (minimo 205, maximo 1345) en 30 episodios con seleccion de accion estocastica. El autor advierte explicitamente que el entorno usado (SpaceInvaders-v5) difiere del del curso original de Hugging Face (SpaceInvadersNoFrameskip-v4), por lo que los resultados no son directamente comparables con otros agentes publicados para esa variante.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Deep Q-Network (DQN) con CnnPolicy (red convolucional sobre frames apilados) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica; observacion de 4 frames apilados (AtariWrapper) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | model.zip (formato de Stable-Baselines3) |

## Arquitectura y entrenamiento

El agente emplea DQN, un algoritmo de aprendizaje por refuerzo off-policy que aproxima la funcion Q con una red neuronal y estabiliza el entrenamiento mediante una red objetivo y un buffer de repeticion de experiencias. La politica es CnnPolicy, es decir, una red convolucional que toma como entrada las observaciones visuales del entorno. El preprocesado sigue el pipeline estandar de Atari: AtariWrapper, apilado de 4 frames, VecTransposeImage, frameskip base de 1 y probabilidad de repeticion de accion de 0,0. El entrenamiento se realizo con Stable-Baselines3 y RL Baselines3 Zoo, con un checkpoint publicado a los 700.000 timesteps de un experimento de 1.000.000.

No se dispone de informacion sobre hiperparametros concretos (tasa de aprendizaje, tamano del buffer, frecuencia de actualizacion de la red objetivo, epsilon-greedy), composicion del dataset (en RL no aplica en el sentido supervisado) ni tecnicas adicionales como double DQN, dueling o prioritized experience replay. La model card solo detalla el algoritmo, la politica, el numero de pasos y el pipeline de preprocesado del entorno.

## Capacidades

- Control de politica para el entorno ALE/SpaceInvaders-v5: selecciona acciones discretas a partir de observaciones visuales.
- Aprendizaje por refuerzo off-policy con DQN sobre entradas de imagen (CnnPolicy).
- Evaluacion reproducible: incluye evaluation_results.json con 30 episodios y metricas de recompensa.
- Grabacion de gameplay (replay.mp4) con seleccion de accion greedy.
- Compatibilidad con el ecosistema Stable-Baselines3 (carga mediante `DQN.load`).
- No soporta tool calling, function calling, agentes multi-step, capacidades multilingues, vision semantica, audio ni modos de razonamiento: es un agente de RL especifico de una tarea.

## Casos de uso

- Reproduccion de experimentos de RL: cargar model.zip con Stable-Baselines3 y ejecutar el agente en ALE/SpaceInvaders-v5 para verificar la recompensa media reportada (573,33) y estudiar la varianza entre episodios.
- Docencia y tutoriales de DQN: usar el checkpoint de 700.000 pasos como ejemplo intermedio para explicar el efecto del numero de timesteps en la politica aprendida.
- Comparacion de variantes de entorno: contrastar el comportamiento en SpaceInvaders-v5 frente a SpaceInvadersNoFrameskip-v4, tal como advierte el autor, para ilustrar como el preprocesado y el frameskip afectan al rendimiento.
- Base para fine-tuning o continuacion del entrenamiento: reanudar el entrenamiento desde el checkpoint con Stable-Baselines3 para probar mejoras (double DQN, dueling, ajuste de epsilon) y medir el delta de recompensa.
- Analisis de estabilidad de politica: usar los 30 episodios de evaluacion estocastica para estudiar la dispersion (desviacion tipica de 207,10) y detectar episodios atipicos (maximo 1345 frente a minimo 205).
- Generacion de material divulgativo: el replay.mp4 y la configuracion dqn_config.yml sirven para ilustrar un pipeline completo de RL en articulos o clases, sin necesidad de reentrenar.

## Benchmarks y rendimiento

| Metrica (30 episodios, seleccion estocastica) | Valor |
|---|---|
| Recompensa media | 573,33 |
| Desviacion tipica | 207,10 |
| Recompensa minima | 205,00 |
| Recompensa maxima | 1345,00 |
| Media menos desviacion tipica | 366,23 |

No se han publicado resultados de benchmarks comparativos con otros agentes en la informacion disponible. El autor indica que los resultados no son directamente intercambiables con los del curso original de Hugging Face por la diferencia de entorno (v5 frente a NoFrameskip-v4).

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precision; al tratarse de una CnnPolicy sobre 4 frames apilados de resolucion Atari, la huella es muy reducida y cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: cualquier GPU con soporte CUDA (GTX 1060 o superior) es suficiente; tambien puede ejecutarse en CPU con latencia aceptable para evaluacion.
- Cabe en GPU consumer: si, practicamente en todas las GPU modernas e incluso en iGPU para inferencia a baja frecuencia.
- Opciones de despliegue: Stable-Baselines3 (carga nativa de model.zip), ejecucion en CPU o GPU via PyTorch; no aplica vLLM, llama.cpp, Ollama ni TGI porque no es un modelo de lenguaje.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada; dependen del hardware y del bucle de simulacion del entorno ALE.

## Comparativa con modelos similares

| Modelo | Algoritmo | Entorno | Recompensa media | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SakinaBohra/dqn-SpaceInvaders-v5 | DQN + CnnPolicy | ALE/SpaceInvaders-v5 | 573,33 (30 episodios) | no disponible | Hugging Face |
| Agentes del curso Hugging Face (referencia) | DQN + CnnPolicy | SpaceInvadersNoFrameskip-v4 | no disponible en la informacion | no disponible | Hugging Face |
| Otros agentes DQN de RL Baselines3 Zoo | DQN | Variantes Atari | no disponible en la informacion | no disponible | Repositorio RL Baselines3 Zoo |

No se dispone de datos suficientes para una comparativa cuantitativa rigurosa con alternativas de la misma categoria; la unica referencia citada por el autor es el curso de Hugging Face, con un entorno distinto que impide la comparacion directa.

## Limitaciones y advertencias

- Especificidad de tarea: el agente solo actua en ALE/SpaceInvaders-v5; no generaliza a otros juegos ni a tareas fuera del entorno.
- Varianza elevada: la desviacion tipica de 207,10 sobre una media de 573,33 indica una politica inestable entre episodios.
- Entorno no equivalente: el autor advierte que SpaceInvaders-v5 no es intercambiable con SpaceInvadersNoFrameskip-v4; comparaciones con agentes publicados para esa variante son invalidas.
- Checkpoint intermedio: el modelo publicado corresponde a 700.000 de 1.000.000 de timesteps, por lo que no representa el resultado final del experimento.
- Seleccion de accion: la evaluacion usa politica estocastica y el video usa greedy; los resultados no son directamente comparables entre ambas configuraciones.
- Licencia no disponible: no se puede confirmar el uso comercial ni la redistribucion; conviene contactar con el autor antes de reutilizarlo.
- Sesgos y alucinacion: no aplican en el sentido de modelos de lenguaje, pero la politica puede explotar comportamientos degenerados del entorno (reward hacking) propios de DQN.
- Sin datos de hiperparametros ni de reproducibilidad completa mas alla de dqn_config.yml; no se garantiza que un reentrenamiento alcance las mismas metricas.
- Repositorio de 0,0 GB y sin descargas ni likes: no hay evidencia de validacion por parte de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/SakinaBohra/dqn-SpaceInvaders-v5
- Stable-Baselines3: https://github.com/DLR-RM/stable-baselines3
- RL Baselines3 Zoo: https://github.com/DLR-RM/rl-baselines3-zoo
- Documentacion de DQN en Stable-Baselines3: https://stable-baselines3.readthedocs.io/en/master/modules/dqn.html
- Atari Learning Environment (ALE): https://github.com/Farama-Foundation/Arcade-Learning-Environment
- Curso de RL de Hugging Face (referencia citada por el autor): https://huggingface.co/learn/deep-rl-course
