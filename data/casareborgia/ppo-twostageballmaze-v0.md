# casareborgia/ppo-TwoStageBallMaze-v0

## Resumen

`casareborgia/ppo-TwoStageBallMaze-v0` es un agente de aprendizaje por refuerzo entrenado con PPO (Proximal Policy Optimization) mediante la librería Stable-Baselines3 sobre un entorno MuJoCo personalizado denominado `TwoStageBallMaze-v0`. No se trata de un modelo de lenguaje ni de un modelo generativo de propósito general: es una política neuronal que controla una bola en un laberinto físico simulado con dos etapas de decisión, donde una bifurcación conduce a una trampa (penalización de -500 puntos) y la otra a la meta (recompensa de +1.000 puntos).

El entorno sigue la especificación de Gymnasium MuJoCo (`MujocoEnv`, `EzPickle`) y está registrado mediante el módulo `run.py` del autor. El agente aprende a navegar la primera etapa (zona inferior, `y ∈ [-2.0, 0.0]`) con pasillos en zigzag y un callejón sin salida, y a elegir correctamente la rama derecha en la segunda etapa (`y ∈ [0.0, +2.0]`) para alcanzar la meta en `(1.30, 1.30)`.

Su relevancia es acotada: sirve como ejemplo reproducible de entrenamiento PPO en un entorno MuJoCo con recompensas estructuradas, útil para quienes investigan RL aplicado a control continuo y navegación con decisiones jerárquicas. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y un tamaño de 0.0 GB, lo que sugiere que los pesos pueden no estar efectivamente subidos o son de tamaño despreciable.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | PPO (Stable-Baselines3) sobre política neuronal para control continuo; arquitectura interna de la red no especificada |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (no es un modelo de lenguaje; el entorno limita a 450 pasos por episodio) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | no disponible (librería declarada: stable-baselines3; el tamaño del repo es 0.0 GB) |

## Arquitectura y entrenamiento

El agente se entrena con PPO, un algoritmo de gradiente de política con recorte de la ratio de probabilidad (clipped surrogate objective) y optimización de una función de valor crítica, implementado en Stable-Baselines3. El entorno es un `MujocoEnv` de Gymnasium con observaciones de estado físico (posición y velocidad de la bola, presumiblemente) y acciones continuas de control. No se especifica en la información disponible la topología exacta de la red (número de capas, unidades por capa, función de activación) ni los hiperparámetros de PPO (learning rate, clip range, número de pasos por rollout, batch size, épocas).

El diseño del entorno incorpora una estructura de recompensa poco habitual que combina señal densa y señal terminal: +10 puntos por cada uno de hasta 12 puntos de control de exploración (`trial_node_1` a `trial_node_8`, máximo +120), +1.000 por alcanzar la meta, -500 por caer en la trampa o agotar los 450 pasos, y -1.000 por permanecer inmóvil durante un tiempo determinado. El máximo teórico es por tanto +1.120. No se indica si hubo currículo de entrenamiento (el ejemplo de uso expone un parámetro `curriculum=False`), ni el número total de timesteps de entrenamiento, ni si se aplicó domain randomization.

## Capacidades

- Control continuo de una bola en un entorno físico simulado con MuJoCo.
- Navegación de un laberinto de dos etapas con pasillos en zigzag, muros de bloqueo y un callejón sin salida en la primera etapa.
- Toma de decisión binaria en la bifurcación de la segunda etapa: rama izquierda (trampa, -500) frente a rama derecha (meta, +1.000).
- Exploración con recompensa intermedia mediante puntos de control (`trial_node_1` a `trial_node_8`).
- Inferencia determinista (`model.predict(obs, deterministic=True)`) para evaluación reproducible con semilla fija.
- Renderizado 3D en tiempo real mediante `render_mode="rgb_array"` y el script `run.py`.
- No soporta tool calling, function calling, razonamiento multi-paso simbólico, capacidades multilingües, visión, audio ni modo de pensamiento: es exclusivamente una política de RL para una tarea concreta.

## Casos de uso

- Reproducción de experimentos de RL: el par entorno + agente permite replicar un pipeline PPO completo con Stable-Baselines3 y Gymnasium MuJoCo, útil como referencia docente o como base para comparar variantes de PPO.
- Investigación en recompensas estructuradas: el esquema de +10 por nodo de exploración, +1.000 por meta, -500 por trampa y -1.000 por inacción sirve para estudiar cómo el shaping de recompensa afecta a la política aprendida en tareas de navegación con bifurcaciones.
- Estudio de decisiones jerárquicas en dos etapas: el entorno separa una fase de navegación (etapa 1) de una fase de elección binaria con consecuencias asimétricas (etapa 2), lo que permite analizar el comportamiento del agente ante ramas con distinta recompensa.
- Benchmark de algoritmos de RL: al estar registrado como entorno Gymnasium, puede usarse para comparar PPO con SAC, TD3 o A2C bajo la misma dinámica y el mismo sistema de recompensas.
- Validación de pipelines de entrenamiento MuJoCo: útil para verificar que la instalación de MuJoCo, Gymnasium y Stable-Baselines3 funciona correctamente antes de escalar a entornos más costosos.
- Demostraciones visuales de RL: el visor 3D (`python run.py`) permite grabar vídeos de la política ejecutando la tarea, adecuado para material divulgativo o presentaciones.
- Pruebas de robustez ante semillas: el ejemplo de la model card fija `seed=42`, lo que facilita evaluar la varianza de la política en distintas condiciones iniciales.

## Benchmarks y rendimiento

Resultados declarados por el autor en el `model-index` de la model card (no verificados):

| Tarea | Dataset / entorno | Metrica | Valor | Verificado |
|---|---|---|---|---|
| Reinforcement Learning | TwoStageBallMaze-v0 | Mean Official Score | 1118 | No |
| Reinforcement Learning | TwoStageBallMaze-v0 | Goal Success Rate | 1.0 (100 %) | No |

El valor 1118 es coherente con el máximo teórico de +1.120 descrito en la model card (1.000 de meta + 120 de nodos de exploración, con posibles variaciones por pasos adicionales o redondeos). No se han publicado resultados comparativos con otros algoritmos ni con otras semillas en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precisión; al ser una política de RL de tamaño reducido (el repositorio ocupa 0.0 GB), es esperable que quepa en cualquier GPU consumer, pero no se confirma en la información proporcionada.
- GPU recomendadas: no especificadas por el autor. Para el entrenamiento con MuJoCo, una GPU consumer moderna (por ejemplo, RTX 3060 o superior) suele ser suficiente para este tipo de entornos, aunque no hay datos publicados que lo confirmen.
- Compatibilidad con GPU consumer: probable pero no confirmada explícitamente.
- Opciones de despliegue: Stable-Baselines3 (`PPO.load`) con Gymnasium y MuJoCo; el visor 3D se lanza con `python run.py`. No se documentan opciones como vLLM, llama.cpp, Ollama o TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. No se han identificado en la información proporcionada otros agentes PPO publicados sobre el mismo entorno `TwoStageBallMaze-v0` ni alternativas directamente comparables con parámetros, contexto y licencia documentados.

## Limitaciones y advertencias

- Específico de una única tarea: la política está entrenada exclusivamente para `TwoStageBallMaze-v0` y no generaliza a otros entornos, laberintos ni dominios.
- Resultados no verificados: tanto el `mean_reward` de 1118 como el `success_rate` de 1.0 están marcados como `verified: false` en el `model-index`.
- Licencia no disponible: no se declara licencia, lo que impide determinar si el uso comercial está permitido; conviene contactar con el autor antes de cualquier uso en producción.
- Idiomas no disponibles: el campo de idiomas aparece vacío, aunque es irrelevante al no ser un modelo de lenguaje.
- Tamaño del repositorio de 0.0 GB: no se confirma que los pesos del modelo estén efectivamente publicados; el ejemplo de la model card carga `"ppo_two_stage_maze"`, un nombre que puede no corresponder a un fichero presente en el repo.
- Dependencia de un módulo externo: el código de ejemplo requiere `import run` para registrar el entorno, lo que implica que el usuario debe disponer del script del entorno, no incluido necesariamente en el repositorio de Hugging Face.
- Sin datos de sesgo, alucinación o robustez: al no ser un modelo generativo, estas categorías no aplican, pero tampoco se documenta la robustez de la política ante perturbaciones físicas, cambios de fricción o ruido en las observaciones.
- Actividad del autor mínima: 0 descargas y 0 likes en el momento de la consulta, lo que reduce la validación comunitaria del artefacto.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/casareborgia/ppo-TwoStageBallMaze-v0
- Perfil del autor en Hugging Face: https://huggingface.co/casareborgia
- Documentación de entornos MuJoCo de Gymnasium (referenciada en la model card): https://gymnasium.farama.org/environments/mujoco/
- Stable-Baselines3 (librería de entrenamiento): no se proporciona enlace en la información disponible
- Repositorio del código del entorno (`run.py`): no disponible
- Paper o blog del autor: no disponible
