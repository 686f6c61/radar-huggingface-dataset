# lookarooka/connectailab-rl-novice-v4-Humanoid-v5-ppo

## Resumen

`connectailab-rl-novice-v4-Humanoid-v5-ppo` es un agente de aprendizaje por refuerzo profundo entrenado con el algoritmo PPO (Proximal Policy Optimization) sobre el entorno `Humanoid-v5` de MuJoCo, integrado en Gymnasium. Lo publica el usuario `lookarooka` bajo la etiqueta del proyecto CONNECT AI LAB, y su objetivo es resolver una tarea clásica de control continuo: mantener erguido y hacer caminar de forma estable a un robot humanoide articulado sin que se caiga.

El modelo no es un modelo de lenguaje ni un transformer generativo, sino una política Actor-Critic con dos capas ocultas de 256 neuronas que mapea un vector de observación de 348 dimensiones (ángulos y velocidades articulares, inercia del centro de masas, fuerzas de contacto) a 17 acciones continuas de par motor en el rango [-0.4, 0.4]. Incorpora normalización de estado en línea mediante buffers Welford registrados en el propio módulo, de forma que la política y las estadísticas de normalización se guardan juntas en un único fichero `model.pt`.

Es relevante como referencia didáctica y de reproducibilidad: el autor documenta la configuración completa de entrenamiento (500.000 pasos, 16 entornos paralelos, GAE con gamma 0.99 y lambda 0.95, clipping de 0.15) y reporta una puntuación media de 5656.9 en 20 episodios de prueba con 1000 pasos de supervivencia. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y el tamaño del repo es de 0.0 GB, lo que sugiere que los pesos pueden no estar efectivamente alojados.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Actor-Critic MLP (PPO) con normalización de estado en línea (Welford) |
| Parámetros totales | no disponible (capas ocultas 256 x 256, entrada 348, salida 17) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (entorno de control continuo; horizonte de episodio de 1000 pasos) |
| Tipos de cuantización | no disponible (pesos en `model.pt`, PyTorch) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | `model.pt` (PyTorch `state_dict`) |

## Arquitectura y entrenamiento

La política es una red neuronal totalmente conectada de tipo Actor-Critic para PPO. La entrada son 348 dimensiones de estado físico del humanoide (posiciones y velocidades articulares, `cinert`, `cfrc_ext` y otras variables del entorno `Humanoid-v5`), normalizadas en línea con media y varianza actualizadas por el algoritmo de Welford y recortadas a [-10, 10]. La salida son 17 medias de acción continua mapeadas con `tanh(x) * 0.4` para respetar los límites del espacio de acción `Box(-0.4, 0.4, (17,), float32)`. Las capas ocultas son de 256 x 256, y la desviación típica de exploración inicial se fija en log sigma = -1.0 (sigma aproximada de 0.37).

El entrenamiento usa 16 entornos `Humanoid-v5` en paralelo con 256 pasos por rollout (4096 transiciones por actualización), minibatch de 512, 10 épocas por actualización, tasa de aprendizaje de 0.0002 con decaimiento lineal, GAE con gamma 0.99 y lambda 0.95, y objetivo surrogate recortado con epsilon 0.15. El total declarado es de 500.000 pasos en 220.2 segundos. El autor menciona un `HumanGaitWrapper` específico de la versión v4 que impone estabilidad del torso, altura de 1.35 m y suavizado de acciones para reducir el temblor articular.

## Capacidades

- Control continuo de 17 articulaciones con pares en [-0.4, 0.4] para locomoción bípeda.
- Mantenimiento del equilibrio y marcha erguida en el entorno `Humanoid-v5` de MuJoCo.
- Procesamiento de observaciones de alta dimensión (348) con normalización interna reproducible.
- Inferencia determinista usando la media de la distribución de política (`dist.mean`).
- Reproducción completa del estado de normalización al cargar un único `model.pt`.
- Visualización en tiempo real mediante `render_mode="human"` y `env.render()` (OpenGL/GLFW).
- No soporta tool calling, agentes multi-paso, visión, audio ni capacidades multilingües; no es un modelo de lenguaje.

## Casos de uso

- Docencia de aprendizaje por refuerzo: sirve como ejemplo ejecutable de un pipeline PPO completo sobre MuJoCo, con hiperparámetros y resultados documentados, para cursos y talleres de RL.
- Reproducción de experimentos: permite comparar variantes de PPO (clipping, GAE, normalización de estado) partiendo de una configuración de referencia con métricas publicadas.
- Estudio de normalización de estado en línea: el modelo incorpora buffers Welford en el propio `state_dict`, lo que facilita analizar el impacto de la normalización en entornos con escalas heterogéneas.
- Prototipado de controladores para robótica simulada: la política puede servir como línea base antes de transferir a simuladores con mayor fidelidad o a hardware real.
- Evaluación de wrappers de recompensa: el `HumanGaitWrapper` descrito permite experimentar con funciones de recompensa que imponen altura y estabilidad del torso.
- Benchmarking de infraestructura de entrenamiento: con 16 entornos paralelos y 500.000 pasos en 220 segundos, es útil para medir throughput de CPU/GPU en RL.
- Visualización y divulgación: el modo `render_mode="human"` permite grabar demostraciones de locomoción para materiales docentes o presentaciones.

## Benchmarks y rendimiento

| Métrica | Valor reportado |
|---|---|
| Puntuación media acumulada (20 episodios de test) | 5656.9 |
| Pasos de supervivencia medios (20 episodios de test) | 1000.0 |
| Pasos totales de entrenamiento | 500.000 |
| Tiempo de entrenamiento | 220.2 s |
| Entornos paralelos x pasos de rollout | 16 x 256 = 4096 |

No se han publicado comparaciones con otros agentes PPO sobre `Humanoid-v5` en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja; la red es un MLP de 348 -> 256 -> 256 -> 17, por lo que cabe holgadamente en cualquier GPU consumer (menos de 1 GB en la práctica).
- GPU recomendadas: no requiere GPU dedicada; una RTX 4090, RTX 3060 o incluso CPU son suficientes para inferencia. Para entrenamiento, el autor reporta 220.2 s con 16 entornos paralelos, lo que sugiere que el cuello de botella es la simulación MuJoCo en CPU más que la GPU.
- Cabe en cualquier GPU consumer y en CPU.
- Opciones de despliegue: PyTorch nativo con `torch.load`, Gymnasium con `Humanoid-v5` y MuJoCo para la simulación; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplican a este tipo de modelo).
- Latencia y throughput: no disponibles de forma desagregada; el tiempo total de entrenamiento de 500.000 pasos en 220.2 s equivale a aproximadamente 2270 pasos por segundo con 16 entornos.

## Comparativa con modelos similares

| Modelo | Tipo | Entorno | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| connectailab-rl-novice-v4-Humanoid-v5-ppo | PPO Actor-Critic MLP | Humanoid-v5 | no disponible (256x256) | no aplica | no disponible | Hugging Face, 0 descargas |
| Políticas de referencia de Stable-Baselines3 (PPO) | PPO MLP | Humanoid-v3/v4 | configurable | no aplica | MIT | GitHub, ampliamente usado |
| RL Zoo / CleanRL PPO Humanoid | PPO MLP | Humanoid-v3/v4 | configurable | no aplica | MIT | GitHub |
| Otros checkpoints de `lookarooka` (p. ej. variantes Roadster) | PPO MLP | entornos MuJoCo propios | no disponible | no aplica | no disponible | Hugging Face |

No se dispone de datos de rendimiento comparables publicados para estas alternativas en el mismo entorno y configuración, por lo que la comparación cuantitativa no está disponible.

## Limitaciones y advertencias

- Licencia no especificada: no se puede asumir uso comercial sin consultar al autor.
- Repositorio con 0 descargas, 0 likes y tamaño de 0.0 GB: existe riesgo de que los pesos no estén realmente alojados o de que el artefacto esté incompleto.
- El código de ejemplo importa un módulo `humanoid_ppo` que no se distribuye en el repositorio, por lo que la reproducibilidad depende de reimplementar la clase `정책두뇌`.
- Entrenado únicamente en `Humanoid-v5` de MuJoCo; no hay evidencia de transferencia a otros simuladores ni a hardware real (sim-to-real no validado).
- La puntuación de 5656.9 y los 1000 pasos de supervivencia provienen de la propia model card y no han sido verificados de forma independiente.
- El modelo está especializado en una única tarea de locomoción; no generaliza a otras tareas de control sin reentrenamiento.
- No es un modelo de lenguaje: no tiene capacidades de generación de texto, razonamiento, código ni multilingües.
- La normalización de estado está acoplada al `state_dict`; cargar los pesos sin el módulo correcto produce resultados incorrectos.
- No se documentan sesgos, pero al ser un agente de RL simulado, su comportamiento depende por completo de la función de recompensa y del wrapper `HumanGaitWrapper`, lo que puede inducir comportamientos no deseados fuera del entorno de entrenamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/lookarooka/connectailab-rl-novice-v4-Humanoid-v5-ppo
- Documentación de Gymnasium `Humanoid-v5`: https://gymnasium.farama.org/environments/mujoco/humanoid/
- MuJoCo: https://mujoco.org/
- Paper de PPO (Schulman et al., 2017): https://arxiv.org/abs/1707.06347
- Stable-Baselines3 (implementación de referencia de PPO): https://github.com/DLR-RM/stable-baselines3
- CleanRL (implementaciones de referencia de PPO): https://github.com/vwxyzjn/cleanrl
- No se han encontrado papers, blogs ni demos adicionales específicos de este modelo en la información disponible.
