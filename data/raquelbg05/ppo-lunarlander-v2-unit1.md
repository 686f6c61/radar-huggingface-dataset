# RaquelBG05/ppo-LunarLander-v2-unit1

## Resumen

`RaquelBG05/ppo-LunarLander-v2-unit1` es un agente de aprendizaje por refuerzo entrenado con el algoritmo PPO (Proximal Policy Optimization) mediante la librería Stable-Baselines3 sobre el entorno `LunarLander-v2` de Gymnasium. No es un modelo de lenguaje ni un transformer generativo: es una política neuronal que controla un módulo de aterrizaje bidimensional y devuelve acciones discretas (no hacer nada, encender motor izquierdo, motor principal o motor derecho) a partir del vector de estado del entorno (8 dimensiones continuas).

El modelo lo publica la usuaria RaquelBG05 como ejercicio de la Unidad 1 del Deep Reinforcement Learning Course. El entrenamiento se prolongó durante 1.015.808 pasos con semilla 42, y la evaluación se realizó sobre diez episodios deterministas partiendo de la semilla 2026, obteniendo una recompensa media de 273,96 con una desviación típica de 25,15.

Su relevancia es fundamentalmente didáctica: sirve como referencia reproducible de un pipeline completo de RL (entrenamiento, evaluación y grabación de episodios) y como punto de partida para comparar hiperparámetros o variantes de PPO en un entorno de control continuo con recompensa densa y dinámica física sencilla.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal fully-connected (política y función de valor) entrenada con PPO; topología exacta no disponible |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (entorno de RL con observación de 8 dimensiones por paso) |
| Tipos de cuantizacion | no disponible; el artefacto es un checkpoint de Stable-Baselines3 (`.zip`), no pesos en formato tensorial cuantizable |
| Idiomas soportados | no disponible (no procesa lenguaje natural) |
| Licencia | no disponible |
| Formato de pesos | checkpoint de Stable-Baselines3 (`.zip`) cargable con `PPO.load()`; pesos en PyTorch internamente |

## Arquitectura y entrenamiento

El agente emplea PPO, un algoritmo de gradiente de política con recorte de la ratio de probabilidad (*clipped surrogate objective*) y optimización alterna de política y función de valor. La política es estocástica durante el entrenamiento y determinista en evaluación. La observación del entorno `LunarLander-v2` es un vector de 8 componentes (posición, velocidad lineal y angular, ángulo, contacto con el suelo y estado de las patas), y el espacio de acciones es discreto con 4 opciones.

El entrenamiento se ejecutó durante 1.015.808 pasos con semilla 42 usando Stable-Baselines3. La evaluación se hizo sobre diez episodios deterministas sin aprendizaje, partiendo de la semilla 2026, con una recompensa media de 273,96 y desviación típica de 25,15. La model card no detalla hiperparámetros de PPO (tasa de aprendizaje, `n_steps`, `batch_size`, coeficiente de entropía, clipping), composición del buffer ni arquitectura exacta de las redes. Tampoco se documenta ningún proceso de RLHF, DPO ni ajuste fino posterior; en RL clásico no aplican.

## Capacidades

- Control de políticas en el entorno `LunarLander-v2`: selecciona una de las cuatro acciones discretas en cada paso a partir del vector de estado de 8 dimensiones.
- Inferencia determinista: la evaluación se realizó sin muestreo estocástico, lo que produce comportamiento reproducible dado un estado y una semilla del entorno.
- Entrenamiento y evaluación reproducibles mediante Stable-Baselines3 (`PPO.load()` y `model.predict()`).
- Grabación de episodios: el repositorio incluye `replay.mp4` con un episodio de semilla 7.
- No soporta *tool calling*, *function calling*, razonamiento multi-paso en lenguaje natural, capacidades multilingües, visión, audio ni modo *thinking*. Es un agente específico de un único entorno.

## Casos de uso

- Docencia y prácticas de RL: servir como solución de referencia de la Unidad 1 del curso, permitiendo al alumnado comparar su propio entrenamiento con una recompensa media conocida (273,96 ± 25,15).
- Reproducibilidad de experimentos: al estar fijadas las semillas de entrenamiento (42) y evaluación (2026), permite replicar el resultado y estudiar la varianza entre episodios.
- *Baseline* para comparación de algoritmos: útil como punto de partida frente a A2C, DQN o SAC en `LunarLander-v2` para medir diferencias de recompensa y estabilidad.
- Estudio de sensibilidad a hiperparámetros: el checkpoint permite reanudar el entrenamiento con `PPO.load()` y modificar la tasa de aprendizaje, el clipping o el coeficiente de entropía para analizar el efecto en la recompensa media.
- Generación de demostraciones visuales: el episodio `replay.mp4` sirve para material divulgativo o para verificar visualmente que la política aterriza correctamente.
- Pruebas de infraestructura de RL: al ser un artefacto pequeño, es adecuado para validar pipelines de carga, evaluación y registro de métricas en entornos de CI o de experiment tracking.
- Punto de partida para *curriculum learning* o transferencia: la política entrenada puede inicializar el entrenamiento en variantes del entorno (por ejemplo, con viento o gravedad modificada) antes de continuar el ajuste.

## Benchmarks y rendimiento

Datos declarados por el autor en el `model-index` de la model card (no verificados, `verified: false`):

| Algoritmo | Tarea | Dataset/entorno | Metrica | Valor |
|---|---|---|---|---|
| PPO | reinforcement-learning | LunarLander-v2 | mean_reward | 273,96 ± 25,15 |

La model card añade una puntuación de 248,81 y especifica que la evaluación consta de diez episodios deterministas con semilla inicial 2026. No se han publicado resultados comparativos con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada: mínima; el checkpoint es un `.zip` de tamaño inferior a 0,01 GB según el tamaño del repositorio (0,0 GB reportado). Cabe holgadamente en cualquier GPU consumer, e incluso la inferencia puede ejecutarse en CPU.
- GPU recomendadas: no se requiere GPU dedicada. Cualquier GPU con soporte CUDA (por ejemplo, GTX 1060 o superior) acelera el entrenamiento, pero no es imprescindible.
- GPU consumer: sí, en todas las gamas; también funciona en CPU.
- Opciones de despliegue: `stable-baselines3` con PyTorch como backend; no aplican vLLM, llama.cpp, Ollama ni TGI porque no es un modelo de lenguaje.
- Latencia y throughput: no disponibles en la información proporcionada. Al tratarse de una red de pequeñas dimensiones, la latencia por paso es del orden de microsegundos a milisegundos en CPU, pero no se ha medido ni documentado.

## Comparativa con modelos similares

No se dispone de datos de otros agentes PPO sobre `LunarLander-v2` en la información proporcionada, por lo que la comparación cuantitativa no está disponible. Cualitativamente, este agente es comparable a cualquier política PPO de Stable-Baselines3 entrenada sobre el mismo entorno, y alternativa a algoritmos como A2C, DQN o SAC de la misma librería. La comparación de parámetros, contexto, licencia y disponibilidad con esos modelos no está disponible.

## Limitaciones y advertencias

- Especialización extrema: la política solo es válida para `LunarLander-v2` con la misma parametrización del entorno; no generaliza a otras tareas ni a variantes con física modificada.
- Licencia no especificada: no se indica licencia en el repositorio, lo que impide confirmar si el uso comercial está permitido. Conviene contactar con la autora antes de cualquier uso fuera del ámbito didáctico.
- Resultados no verificados: la métrica del `model-index` tiene `verified: false` y procede únicamente del autor.
- Varianza alta: la desviación típica de 25,15 sobre una recompensa media de 273,96 indica una dispersión considerable entre episodios; no debe asumirse un rendimiento estable en todos los casos.
- Información técnica incompleta: no se documentan hiperparámetros, arquitectura de red, número de capas ni tamaño de las capas ocultas, lo que dificulta la replicación exacta.
- Sin soporte de lenguaje, visión ni audio: no es adecuado para ninguna tarea de NLP, generación de texto o multimodal.
- Riesgo de sobreajuste a la semilla: al haberse entrenado con una única semilla (42), el rendimiento puede no ser representativo de la media del algoritmo.
- Sin mantenimiento documentado: el repositorio se creó y actualizó el mismo día (2026-11-20) y no consta versionado posterior ni issues resueltos.

## Enlaces

- Hugging Face: https://huggingface.co/RaquelBG05/ppo-LunarLander-v2-unit1
- Repositorio de Stable-Baselines3: https://github.com/DLR-RM/stable-baselines3
- Documentación de PPO en Stable-Baselines3: https://stable-baselines3.readthedocs.io/en/master/modules/ppo.html
- Entorno LunarLander-v2 (Gymnasium): https://gymnasium.farama.org/environments/box2d/lunar_lander/
- Deep Reinforcement Learning Course (Unidad 1): https://huggingface.co/learn/deep-rl-course/unit1/introduction
- Artículo original de PPO: https://arxiv.org/abs/1707.06347
