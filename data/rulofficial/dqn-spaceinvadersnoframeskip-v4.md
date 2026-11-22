# RulOfficial/dqn-SpaceInvadersNoFrameskip-v4

## Resumen

`RulOfficial/dqn-SpaceInvadersNoFrameskip-v4` es un agente de aprendizaje por refuerzo entrenado con el algoritmo Deep Q-Network (DQN) en su implementación vanilla de la librería Stable-Baselines3 sobre el entorno Atari `ALE/SpaceInvaders-v5`. No se trata de un modelo de lenguaje ni de un transformer generativo, sino de una política convolucional (`CnnPolicy`) que aprende a jugar a Space Invaders a partir de observaciones visuales del juego. El autor lo publica como ejercicio reproducible del pipeline completo de entrenamiento y publicación, no como un agente de rendimiento competitivo.

El modelo se entrenó durante 100.000 timesteps con semilla 42, learning rate 0,0001, factor de descuento 0,99, buffer de repetición de 100.000 transiciones y actualización de la red objetivo cada 1.000 pasos. La evaluación sobre 10 episodios arroja una recompensa media de 3,10 con una desviación estándar de 2,51, lo que sitúa la puntuación `mean_reward - std_reward` en 0,59. El propio autor reconoce en la model card que estos resultados quedan lejos de los agentes Atari entrenados durante millones de pasos y que el valor del artefacto es demostrativo.

Su relevancia es, por tanto, didáctica: sirve como ejemplo mínimo funcional de DQN con Stable-Baselines3 sobre Atari, con scripts de entrenamiento (`train.py`), publicación (`push.py`), métricas (`resultados.json`) y una reproducción en vídeo (`replay.mp4`). No aporta innovaciones arquitectónicas ni compite con agentes de referencia como los de la suite DQN de Atari publicados en la literatura.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DQN (Deep Q-Network) con política convolucional (`CnnPolicy`) de Stable-Baselines3 |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (entorno de RL, no modelo de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | `.zip` de Stable-Baselines3 (`dqn-SpaceInvadersNoFrameskip-v4.zip`) |

Parámetros de entrenamiento declarados en la model card:

| Parametro | Valor |
|---|---|
| Entorno | `ALE/SpaceInvaders-v5` |
| Semilla | 42 |
| Timesteps | 100.000 |
| Learning rate | 0,0001 |
| Gamma | 0,99 |
| Tamaño del replay buffer | 100.000 |
| Frecuencia de actualización de la red objetivo | 1.000 pasos |
| Episodios de evaluación | 10 |

## Arquitectura y entrenamiento

El agente emplea DQN vanilla, el algoritmo de Q-learning profundo propuesto por Mnih et al. (2015), en la implementación de Stable-Baselines3. La política es una `CnnPolicy`, es decir, una red convolucional que procesa los fotogramas del entorno Atari y produce valores Q para cada una de las acciones discretas disponibles. El bucle de entrenamiento sigue el esquema estándar de DQN: interacción con el entorno, almacenamiento de transiciones en un replay buffer de 100.000 elementos, muestreo de minibatches para actualizar la red en línea y sincronización periódica con una red objetivo cada 1.000 pasos para estabilizar el aprendizaje.

El entrenamiento se limita a 100.000 timesteps, un orden de magnitud muy inferior al utilizado en los resultados de referencia de Atari (que suelen emplear entre 10 y 50 millones de fotogramas). No se documenta el uso de mejoras como Double DQN, Dueling DQN, prioritized experience replay, frame stacking explícito o normalización de recompensas más allá de lo que aplica por defecto Stable-Baselines3. Tampoco se indica la composición de datos (el entorno es el propio generador de experiencia) ni procesos de RLHF o DPO, que no aplican a este tipo de modelo. No se declara ninguna innovación técnica destacable.

## Capacidades

- Control de política discreta sobre el entorno Atari `ALE/SpaceInvaders-v5`: selecciona acciones a partir de observaciones visuales del juego.
- Aprendizaje por refuerzo off-policy con replay buffer y red objetivo, según la implementación estándar de DQN en Stable-Baselines3.
- Reproducibilidad del pipeline completo: incluye `train.py` para reentrenar, `push.py` para publicar en el Hub y `requirements.txt` con las dependencias.
- Evaluación reproducible: `resultados.json` recoge métricas y configuración, y `replay.mp4` muestra una partida del agente.
- No soporta tool calling, function calling, agentes multi-step, capacidades multilingües, visión general, audio ni modos de razonamiento extendido, al no ser un modelo de lenguaje.

## Casos de uso

- Docencia y formación en aprendizaje por refuerzo: el repositorio sirve como ejemplo mínimo y ejecutable de DQN con Stable-Baselines3 sobre Atari, útil para explicar el bucle de entrenamiento, el replay buffer y la red objetivo en un curso introductorio.
- Verificación de pipelines de RL: `train.py` y `requirements.txt` permiten reproducir el entrenamiento de principio a fin y comprobar que el entorno, las dependencias y el hardware funcionan antes de escalar a experimentos mayores.
- Punto de partida para ablaciones: al ser un DQN vanilla con hiperparámetros documentados, puede usarse como línea base para comparar mejoras como Double DQN, Dueling DQN o prioritized replay sobre el mismo entorno y semilla.
- Pruebas de integración con Stable-Baselines3: validar la carga de un `.zip` de política `CnnPolicy`, la evaluación con `evaluate_policy` y la generación de vídeos de replay en un entorno controlado.
- Demostraciones visuales: `replay.mp4` y `evidencia_entrenamiento.png` permiten ilustrar en charlas o materiales divulgativos cómo aprende (y cómo falla) un agente DQN con presupuesto limitado.
- Referencia de estructura de model card y model-index: el repositorio ejemplifica cómo declarar métricas de RL (`mean_reward`) en el `model-index` de Hugging Face, útil para quienes publican agentes en el Hub.

## Benchmarks y rendimiento

Resultados declarados por el autor en el `model-index` de la model card (no verificados):

| Tarea | Dataset/entorno | Metrica | Valor |
|---|---|---|---|
| reinforcement-learning | SpaceInvaders (`ALE/SpaceInvaders-v5`) | mean_reward | 3,10 +/- 2,51 |

Métrica derivada indicada en la model card:

| Metrica | Valor |
|---|---|
| `mean_reward - std_reward` | 0,59 |
| Episodios de evaluación | 10 |

No se han publicado en la información disponible resultados comparativos con otros agentes DQN de referencia sobre Atari.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; al tratarse de una `CnnPolicy` pequeña sobre fotogramas Atari, la huella es muy reducida y cabe holgadamente en cualquier GPU consumer moderna. No se proporcionan cifras concretas.
- GPU recomendadas: no disponibles en la información proporcionada. Por el tamaño típico de una `CnnPolicy` de Stable-Baselines3, cualquier GPU con unos pocos GB de VRAM es suficiente, pero el autor no lo especifica.
- Cabe en GPU consumer: sí, previsiblemente en cualquier GPU consumer reciente; no se documenta el modelo exacto ni el consumo medido.
- Opciones de despliegue: carga mediante Stable-Baselines3 (`DQN.load(...)`) en Python; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de artefacto.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Algoritmo | Entorno | Timesteps | mean_reward | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| RulOfficial/dqn-SpaceInvadersNoFrameskip-v4 | DQN vanilla (SB3) | ALE/SpaceInvaders-v5 | 100.000 | 3,10 +/- 2,51 | no disponible | Hugging Face |
| Agentes de referencia DQN Atari (Mnih et al., 2015) | DQN | Atari 2600 (incl. Space Invaders) | millones de fotogramas | no disponible en la información proporcionada | no disponible | publicación académica |
| Otros agentes DQN de la comunidad en el Hub | DQN (SB3) | Atari | variable | no disponible | variable | Hugging Face |

No se dispone de datos verificables de modelos comparables en la información proporcionada; la comparativa con los agentes de referencia de la literatura se limita a señalar la diferencia de presupuesto de entrenamiento indicada por el propio autor.

## Limitaciones y advertencias

- Rendimiento muy limitado: recompensa media de 3,10 con desviación estándar de 2,51 sobre 10 episodios; el autor reconoce explícitamente que no es comparable a agentes entrenados durante millones de pasos.
- Presupuesto de entrenamiento reducido: 100.000 timesteps, muy por debajo de lo habitual en resultados de referencia de Atari.
- Alta varianza en la evaluación: solo 10 episodios y una desviación estándar cercana a la media, lo que hace la métrica poco fiable estadísticamente.
- Licencia no disponible: no se declara licencia, por lo que el uso comercial queda en un limbo legal y requiere contactar con el autor.
- Sin datos de sesgos, alucinación o limitaciones idiomáticas: no aplican en el sentido habitual de un modelo de lenguaje, pero tampoco se documentan sesgos de política ni comportamiento fuera de distribución.
- Artefacto didáctico, no de producción: no se aportan garantías de robustez, generalización ni mantenimiento.
- Dependencia de versiones: al ser un `.zip` de Stable-Baselines3, la carga requiere una versión compatible de la librería y de Gymnasium/ALE; no se especifican versiones exactas más allá de `requirements.txt`.
- Sin innovaciones técnicas declaradas: DQN vanilla sin Double, Dueling ni prioritized replay documentados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/RulOfficial/dqn-SpaceInvadersNoFrameskip-v4
- Repositorio de Stable-Baselines3: https://github.com/DLR-RM/stable-baselines3
- Documentación de Stable-Baselines3 sobre DQN: https://stable-baselines3.readthedocs.io/en/master/modules/dqn.html
- Entorno ALE/SpaceInvaders-v5 (Arcade Learning Environment): https://github.com/Farama-Foundation/Arcade-Learning-Environment
- Paper original de DQN (Mnih et al., 2015): https://www.nature.com/articles/nature14236
