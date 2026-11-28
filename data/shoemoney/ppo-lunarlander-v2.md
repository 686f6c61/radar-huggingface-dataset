# shoemoney/ppo-LunarLander-v2

## Resumen

`shoemoney/ppo-LunarLander-v2` es un agente de aprendizaje por refuerzo entrenado con el algoritmo PPO (Proximal Policy Optimization) sobre el entorno LunarLander-v2 de Gymnasium, mediante la librería Stable-Baselines3. No se trata de un modelo de lenguaje ni de un transformer generativo: es una política neuronal que controla la nave del simulador LunarLander para aterrizar de forma segura en la plataforma objetivo. El autor es el usuario de Hugging Face `shoemoney`, y el repositorio se publicó el 27 de noviembre de 2026.

El modelo resuelve un problema clásico de control continuo/discreto en un entorno de física 2D: la política recibe el estado del módulo de aterrizaje (posición, velocidad, ángulo, contacto con el suelo, etc.) y emite una acción discreta entre cuatro posibles (no hacer nada, encender motor principal, encender motor izquierdo, encender motor derecho). Su relevancia es fundamentalmente didáctica y de referencia: sirve como ejemplo reproducible de un agente PPO que alcanza una recompensa media declarada de 265,76 ± 18,71, por encima del umbral de 200 que se suele considerar "resuelto" en LunarLander-v2.

La ficha se centra en lo que realmente es: un artefacto de reinforcement learning de pequeño tamaño (el repositorio ocupa 0,0 GB, lo que indica pesos de una red MLP de pocos cientos de miles de parámetros), con licencia no especificada y sin información sobre idiomas, cuantización o despliegue en producción más allá de Stable-Baselines3.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Política neuronal MLP (actor-crítico) entrenada con PPO mediante Stable-Baselines3; no es un transformer |
| Parametros totales | no disponible (el tamaño del repo es 0,0 GB, compatible con una MLP de pocos cientos de miles de parámetros) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (entorno de RL con observación de estado fija de LunarLander-v2, típicamente 8 dimensiones) |
| Tipos de cuantizacion | no disponible (no se documentan cuantizaciones; los pesos se distribuyen en el formato nativo de Stable-Baselines3) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | pesos de Stable-Baselines3 (`.zip`), cargables con `stable_baselines3` y `huggingface_sb3` |

## Arquitectura y entrenamiento

El agente emplea PPO, un algoritmo de optimización de política proximal con recorte de la ratio de probabilidad (clipped surrogate objective) y ventaja generalizada (GAE). La política es una red neuronal multicapa (MLP) que mapea el vector de observación del entorno LunarLander-v2 a una distribución categórica sobre cuatro acciones discretas. El entrenamiento se realizó con Stable-Baselines3 sobre el entorno `LunarLander-v2` de Gymnasium, con recompensas basadas en el aterrizaje suave, la posición y la velocidad, y penalizaciones por colisión o por encender los motores laterales.

La model card no documenta hiperparámetros (learning rate, número de timesteps, tamaño de la red, coeficiente de entropía, clipping range) ni la composición del dataset, ya que en RL no hay dataset: el agente aprende por interacción con el simulador. Tampoco se indica si hubo ajuste fino posterior ni evaluación con múltiples semillas. La única métrica declarada es la recompensa media de 265,76 ± 18,71, marcada como `verified: false`, es decir, no verificada de forma independiente por Hugging Face.

## Capacidades

- Control de políticas en el entorno LunarLander-v2: selecciona una de cuatro acciones discretas (nada, motor principal, motor izquierdo, motor derecho) a partir del estado del módulo de aterrizaje.
- Aprendizaje por refuerzo profundo con PPO: reproducible con Stable-Baselines3 y compatible con el ecosistema `huggingface_sb3`.
- Aterrizaje autónomo en el simulador: la recompensa media declarada supera el umbral de 200 considerado "resuelto" en LunarLander-v2.
- No soporta tool calling, function calling, agentes multi-step, razonamiento simbólico, código, matemáticas, visión, audio ni capacidades multilingües: es un agente específico de un único entorno de control.
- No dispone de modo "thinking" ni de generación de texto.

## Casos de uso

- Docencia y tutoriales de reinforcement learning: usar el agente como ejemplo reproducible de PPO con Stable-Baselines3 para explicar el ciclo de entrenamiento, la función de recompensa y la evaluación de políticas en un entorno clásico de control.
- Referencia de línea base en LunarLander-v2: comparar nuevas políticas o hiperparámetros de PPO contra esta recompensa media declarada (265,76 ± 18,71) para medir mejoras.
- Pruebas de integración de `huggingface_sb3`: validar el flujo de carga de pesos desde el Hub (`load_from_hub`) en pipelines de CI o notebooks de demostración.
- Experimentos de ablación sobre PPO: reentrenar con distintas semillas, learning rates o arquitecturas de red y contrastar con este agente como punto de partida.
- Demostraciones de simulación física 2D: integrar el agente en visualizaciones o vídeos educativos del entorno LunarLander para mostrar comportamiento de aterrizaje.
- Benchmarking de infraestructura de RL: medir tiempos de carga, inferencia y evaluación de un agente pequeño en distintas máquinas o contenedores.
- Base para transferencia o curriculum learning: usar los pesos como inicialización en variantes del entorno (por ejemplo, con perturbaciones) para estudiar la robustez de la política.

## Benchmarks y rendimiento

Datos declarados por el autor en la model card (marcados como `verified: false`):

| Algoritmo | Tarea | Dataset/entorno | Métrica | Valor |
|---|---|---|---|---|
| PPO | reinforcement-learning | LunarLander-v2 | mean_reward | 265,76 ± 18,71 |

No se han publicado en la información disponible otros benchmarks (por ejemplo, recompensa por episodio, tasa de aterrizajes exitosos, número de pasos hasta el aterrizaje) ni comparaciones con otros agentes.

## Requisitos de hardware

- VRAM estimada para inferencia: mínima, inferior a 1 GB; la política es una MLP de pocos cientos de miles de parámetros y el estado de entrada es un vector de 8 dimensiones.
- GPU recomendadas: no es necesario GPU; cualquier CPU moderna ejecuta el agente en tiempo real. Si se desea entrenar de nuevo, una GPU consumer (RTX 3060 o superior) acelera el entrenamiento, aunque PPO en LunarLander-v2 converge razonablemente en CPU.
- Cabe en cualquier GPU consumer (GTX 1050, RTX 2060, RTX 4090) y también en entornos sin GPU.
- Opciones de despliegue: Stable-Baselines3 (carga con `PPO.load`), `huggingface_sb3` para descarga desde el Hub, y Gymnasium para el entorno. No aplica vLLM, llama.cpp, Ollama ni TGI, que son para modelos de lenguaje.
- Latencia y throughput: no disponibles en la información proporcionada; por la naturaleza del agente, la inferencia por paso es del orden de microsegundos a milisegundos en CPU.

## Comparativa con modelos similares

| Modelo | Algoritmo | Entorno | Parámetros | Contexto | Recompensa declarada | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|---|
| shoemoney/ppo-LunarLander-v2 | PPO | LunarLander-v2 | no disponible (MLP pequeña) | no aplica | 265,76 ± 18,71 | no disponible | Hugging Face |
| Agentes PPO de referencia de Stable-Baselines3 (RL Zoo) | PPO | LunarLander-v2 | MLP similar | no aplica | no disponible en esta ficha | MIT (código SB3) | GitHub / RL Zoo |
| Agentes DQN de referencia para LunarLander-v2 | DQN | LunarLander-v2 | MLP similar | no aplica | no disponible en esta ficha | MIT (código SB3) | GitHub / RL Zoo |

No se dispone de datos verificados de benchmarks de los modelos alternativos en la información proporcionada; la comparación se limita a algoritmo, entorno y disponibilidad.

## Limitaciones y advertencias

- Especialización extrema: el agente solo funciona en LunarLander-v2; no generaliza a otros entornos ni tareas.
- Métrica no verificada: la recompensa media declarada (265,76 ± 18,71) está marcada como `verified: false`; no hay evaluación independiente ni número de episodios ni semillas documentados.
- Sin información de licencia: no se especifica licencia, por lo que el uso comercial es incierto y requiere contactar con el autor.
- Sin hiperparámetros ni receta de entrenamiento: la model card incluye un `TODO` en la sección de uso, lo que dificulta la reproducción exacta.
- Sin información sobre sesgos: al ser un agente de control en un simulador, no aplican sesgos sociales típicos de modelos de lenguaje, pero tampoco se documenta robustez ante perturbaciones.
- Riesgo de sobreajuste al entorno: no se documenta evaluación con dominios aleatorizados ni con variaciones de física.
- No apto para producción como servicio de lenguaje: no genera texto, no soporta tool calling ni agentes; su uso en producción se limita a simulación o docencia.
- El repositorio ocupa 0,0 GB y no se listan archivos; conviene verificar la integridad de los pesos antes de usarlos.

## Enlaces

- Hugging Face: https://huggingface.co/shoemoney/ppo-LunarLander-v2
- Stable-Baselines3: https://github.com/DLR-RM/stable-baselines3
- Documentación de `huggingface_sb3`: https://github.com/huggingface/huggingface_sb3
- Entorno LunarLander-v2 (Gymnasium): https://gymnasium.farama.org/environments/box2d/lunar_lander/
- Paper de PPO: https://arxiv.org/abs/1707.06347
- RL Zoo de Stable-Baselines3 (agentes de referencia): https://github.com/DLR-RM/rl-baselines3-zoo
