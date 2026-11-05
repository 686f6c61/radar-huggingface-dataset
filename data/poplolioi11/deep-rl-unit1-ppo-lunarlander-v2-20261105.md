# poplolioi11/deep-rl-unit1-ppo-LunarLander-v2-20261105

## Resumen

`poplolioi11/deep-rl-unit1-ppo-LunarLander-v2-20261105` es un agente de refuerzo entrenado con PPO (Proximal Policy Optimization) mediante la librería Stable-Baselines3 sobre el entorno LunarLander-v2 de Gymnasium. No es un modelo de lenguaje ni un transformer generativo: es una política neuronal que controla el módulo de aterrizaje del clásico problema de control continuo de Box2D, decidiendo en cada paso entre cuatro acciones discretas (no hacer nada, encender motor principal, encender motor lateral izquierdo o derecho).

El modelo lo publica el usuario `poplolioi11` como parte de un ejercicio educativo de deep reinforcement learning (Deep RL Unit 1) y declara un rendimiento medio de recompensa de 245,54 ± 21,33 sobre una evaluación de holdout de 100 episodios con semillas fijas (50000-50099) y política determinista. El entrenamiento se realizó desde cero en CPU con un único hilo, 16 entornos síncronos, semilla 42 y 1.015.808 pasos reales de entorno, en 366 segundos.

Su relevancia es fundamentalmente didáctica y de reproducibilidad: sirve como referencia mínima de un pipeline PPO completo con Stable-Baselines3 y como ejemplo de model card con verificación de artefactos (hashes SHA-256 de la fuente de entrenamiento y del checkpoint seleccionado). No es un modelo para producción ni para tareas de NLP.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Política neuronal MLP entrenada con PPO (Stable-Baselines3); no es un transformer ni un LLM |
| Parametros totales | no disponible (el repositorio ocupa 0.0 GB y la model card no detalla el tamaño de la red) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (no es un modelo de secuencia; opera por paso de entorno en LunarLander-v2) |
| Tipos de cuantizacion | no disponible (no se documentan cuantizaciones; el artefacto es un checkpoint SB3) |
| Idiomas soportados | no disponible / no aplica (no procesa lenguaje natural) |
| Licencia | MIT |
| Formato de pesos | checkpoint de Stable-Baselines3 (librería `stable-baselines3`; extensión .zip habitual en SB3) |

Otros datos técnicos declarados: entorno `LunarLander-v2` (Gymnasium/Box2D), espacio de acciones discreto de 4 acciones, 16 entornos síncronos durante el entrenamiento, semilla 42, 1.015.808 pasos de entorno, selección de checkpoint por recompensa media de validación antes de la evaluación de holdout.

## Arquitectura y entrenamiento

El agente se entrena con PPO, un algoritmo on-policy de gradiente de política con recorte de la ratio de probabilidad (*clipped surrogate objective*), típicamente combinado con una red de valor (critic) que estima la función de ventaja mediante GAE. Stable-Baselines3 implementa esta política sobre un perceptrón multicapa (MLP) que recibe el vector de observación de 8 dimensiones del entorno LunarLander-v2 (posición, velocidad, ángulo, velocidad angular, contacto con el suelo y estado de las patas) y produce una distribución categórica sobre las 4 acciones discretas.

El entrenamiento se ejecutó en CPU con un solo hilo, usando 16 entornos síncronos en paralelo, semilla 42 y un total de 1.015.808 pasos de entorno, con un tiempo de ejecución de 366,070 segundos. El autor indica que el checkpoint final se seleccionó por recompensa media de validación antes de la evaluación de holdout, y que la fuente de entrenamiento y el checkpoint seleccionado están verificados mediante hashes SHA-256 (5ec4ebc2... y 6ffd689f... respectivamente). No se documenta RLHF, DPO ni ninguna innovación de inferencia como decodificación especulativa o atención lineal, lo cual es coherente con el tipo de modelo.

## Capacidades

- Control de políticas en el entorno LunarLander-v2: elige entre 4 acciones discretas (inacción, motor principal, motor lateral izquierdo, motor lateral derecho) en cada paso.
- Política determinista en evaluación: la model card indica que la evaluación de holdout se hizo con política determinista, por lo que el agente puede desplegarse de forma reproducible sin muestreo estocástico.
- Entrenamiento reproducible: semilla, número de pasos, número de entornos y hashes de artefactos permiten reconstruir el experimento (el código de entrenamiento permanece privado según la model card).
- Aprendizaje por refuerzo desde cero: entrenado *from scratch* con SB3 PPO, no ajustado desde un modelo preentrenado.
- Integración con Stable-Baselines3: el artefacto es cargable con la API estándar de SB3 (`PPO.load`), lo que facilita su uso en pipelines de evaluación.
- Capacidades de lenguaje, visión, audio, tool calling, agentes multi-paso o multilingüismo: no disponibles (el modelo no las soporta).

## Casos de uso

- Docencia y ejercicios de Deep RL: sirve como ejemplo canónico de un pipeline PPO completo (entorno, entrenamiento, selección de checkpoint, evaluación de holdout) para cursos introductorios, encajando directamente con el propósito declarado del autor.
- Reproducción y verificación de experimentos: los hashes SHA-256 y la semilla 42 permiten auditar que el artefacto publicado corresponde al entrenamiento descrito, útil en asignaturas que exigen trazabilidad.
- Benchmark de referencia para LunarLander-v2: el resultado de 245,54 ± 21,33 sobre 100 episodios con semillas 50000-50099 puede usarse como línea base al comparar otros algoritmos (DQN, A2C, SAC) o hiperparámetros.
- Pruebas de infraestructura de RL: al estar entrenado en CPU con un solo hilo y en 366 segundos, es un caso de coste mínimo para validar entornos de CI, contenedores o runners de evaluación en integración continua.
- Enseñanza de buenas prácticas de model card: el documento incluye semillas, dependencias, hashes y una advertencia explícita de que la evaluación de éxito físico no es un clasificador de aterrizaje exitoso; es un ejemplo de documentación honesta de limitaciones.
- Evaluación comparativa de agentes estocásticos frente a deterministas: la model card menciona que las mismas semillas se evaluaron también con acciones aleatorias, lo que permite contrastar el rendimiento aprendido con una base aleatoria en el mismo conjunto de episodios.

## Benchmarks y rendimiento

Datos declarados por el autor en el model-index (resultados no verificados por un tercero, `verified: false`):

| Tarea | Dataset / entorno | Metrica | Resultado |
|---|---|---|---|
| reinforcement-learning | LunarLander-v2 | mean_reward | 245.54102055 +/- 21.33366077 |

Detalles de la evaluación según la model card: 100 episodios con semillas separadas 50000-50099, política determinista, desviación estándar poblacional 21.33366077 y media menos una desviación estándar de 224.20735978. Además, 98 de 100 episodios entrenados puntuaron al menos 200, aunque el autor aclara que esto no es un clasificador de éxito físico de aterrizaje. No se proporcionan resultados de MMLU, HumanEval, GSM8K ni de otros benchmarks de NLP, ya que no aplican a este tipo de modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: insignificante; es una política MLP de pequeña dimensión y el checkpoint se ejecuta en CPU sin GPU.
- GPU recomendadas: ninguna necesaria; el propio entrenamiento se realizó en CPU con un único hilo.
- Cabe en cualquier GPU consumer: sí, y también en CPU; no requiere CUDA.
- Opciones de despliegue: carga con la API de Stable-Baselines3 (`PPO.load`) sobre Python, e integración con Gymnasium/Box2D para ejecutar el entorno LunarLander-v2. No hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo de lenguaje.
- Latencia y throughput: no disponibles de forma desglosada; el dato conocido es el tiempo de entrenamiento (366,070 s para 1.015.808 pasos, aproximadamente 2.775 pasos por segundo en CPU de un solo hilo con 16 entornos).

## Comparativa con modelos similares

| Modelo | Tipo | Entorno | Métrica declarada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| poplolioi11/deep-rl-unit1-ppo-LunarLander-v2-20261105 | PPO + MLP (SB3) | LunarLander-v2 | mean_reward 245,54 ± 21,33 (holdout 100 episodios) | MIT | HuggingFace |
| Agentes PPO de referencia del tutorial de SB3 (RL Zoo) | PPO + MLP (SB3) | LunarLander-v2 | no disponible en esta ficha | MIT (SB3) | Repositorio RL Zoo / SB3 |
| Agentes DQN sobre LunarLander-v2 en Stable-Baselines3 | DQN + MLP | LunarLander-v2 | no disponible en esta ficha | MIT (SB3) | Repositorio SB3 |
| Política aleatoria (baseline mencionada en la model card) | Acciones aleatorias | LunarLander-v2 | no disponible como valor numérico en la información proporcionada | no aplica | no aplica |

No se dispone de resultados numéricos de los comparadores en la información proporcionada, por lo que la comparación cuantitativa se limita al valor declarado por el autor para este modelo.

## Limitaciones y advertencias

- Alcance limitado a LunarLander-v2: la política está entrenada para un único entorno de control con observaciones de 8 dimensiones y 4 acciones; no generaliza a otras tareas y no es un modelo de propósito general.
- No es un LLM: no procesa lenguaje, no genera texto, no tiene tool calling ni visión; cualquier uso en esos dominios es inválido.
- Resultados no verificados: el model-index declara `verified: false` y la model card indica que la aceptación oficial del curso y la emisión del certificado están pendientes y no se reclaman.
- Código de entrenamiento privado: la model card afirma que el código permanece privado y que las versiones exactas de dependencias, resultados por episodio y comprobaciones de lectura se conservan de forma privada, lo que limita la reproducción independiente.
- Éxito de aterrizaje no clasificado: 98/100 episodios con puntuación ≥ 200 no equivale a un clasificador de aterrizaje físico exitoso; el autor lo advierte explícitamente.
- Asistencia de IA declarada: la model card indica que se usó ingeniería asistida por IA y verificación de fuente, y que el dominio independiente del alumno no ha sido evaluado; los sesgos del proceso de entrenamiento no están analizados.
- Riesgo de sobreajuste al conjunto de semillas: la evaluación se limita a 100 semillas concretas (50000-50099); el comportamiento fuera de ese rango y con política estocástica no está cuantificado.
- Licencia MIT: permite uso comercial y modificación con atribución, pero al tratarse de un artefacto educativo sin garantías de robustez, no debe usarse como componente crítico en producción.
- Idiomas y sesgos lingüísticos: no aplica (no hay datos de idioma en la información disponible), pero tampoco hay análisis de sesgos de política en el entorno.

## Enlaces

- HuggingFace: https://huggingface.co/poplolioi11/deep-rl-unit1-ppo-LunarLander-v2-20261105
- Stable-Baselines3 (librería de entrenamiento): https://github.com/DLR-RM/stable-baselines3
- Documentación de PPO en SB3: https://stable-baselines3.readthedocs.io/en/master/modules/ppo.html
- Entorno LunarLander-v2 (Gymnasium): https://gymnasium.farama.org/environments/box2d/lunar_lander/
- Paper de PPO (Schulman et al., 2017): https://arxiv.org/abs/1707.06347
- Repositorio RL Zoo de SB3: https://github.com/DLR-RM/rl-baselines3-zoo
