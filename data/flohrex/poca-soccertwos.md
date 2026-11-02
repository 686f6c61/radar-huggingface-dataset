# Flohrex/poca-SoccerTwos

## Resumen

`Flohrex/poca-SoccerTwos` es un agente entrenado con aprendizaje por refuerzo profundo (deep reinforcement learning) mediante el algoritmo POCA (Policy Optimization with Clipped Advantages) sobre el entorno SoccerTwos de Unity ML-Agents. No es un modelo de lenguaje: es una política neuronal que controla agentes jugadores de fútbol 2 contra 2 en un entorno de simulación física de Unity. Lo publica el usuario Flohrex en Hugging Face bajo la librería `ml-agents`.

El modelo resuelve una tarea concreta y acotada: aprender a jugar al SoccerTwos, un entorno de referencia de ML-Agents donde dos equipos de dos agentes compiten por marcar gol con una pelota física. Es relevante como artefacto reproducible de entrenamiento en RL multiagente y como ejemplo práctico de despliegue de políticas entrenadas con ML-Agents en el Hub, donde se puede visualizar el agente jugando directamente en el navegador.

La información pública es muy escasa: el repositorio ocupa 0,2 GB, no declara licencia, no declara idiomas y no incluye resultados de benchmarks ni detalles de hiperparámetros en la model card. El contenido del repositorio son pesos en formato ONNX (y presumiblemente `.nn` de ML-Agents) junto con artefactos de TensorBoard.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Política neuronal de ML-Agents (red densa) entrenada con POCA; arquitectura exacta no disponible |
| Parametros totales | No disponible |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (no es un modelo de lenguaje) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible (no es un modelo lingüístico) |
| Licencia | No disponible |
| Formato de pesos | ONNX (y formato `.nn` de ML-Agents, según la model card) |

## Arquitectura y entrenamiento

El agente se entrena con el algoritmo POCA implementado en Unity ML-Agents, un método de policy gradient con ventaja recortada (clipped advantages) pensado para entornos multiagente cooperativos y competitivos. La política consume las observaciones del entorno SoccerTwos (estado de los agentes, posición y velocidad de la pelota, raycasts) y produce acciones continuas de movimiento y rotación. La arquitectura concreta de la red (número de capas, unidades, funciones de activación) no se detalla en la model card.

No se especifican en la información disponible el número de pasos de entrenamiento, la composición del dataset (en RL no hay dataset estático, sino experiencia generada por interacción), ni si se aplicaron técnicas adicionales como self-play, curricula o recompensas conformadas. El repositorio incluye artefactos de TensorBoard, lo que sugiere que el autor registró curvas de entrenamiento, pero no se publican métricas en la ficha.

## Capacidades

- Control de agentes en el entorno SoccerTwos de Unity ML-Agents (fútbol 2 contra 2).
- Toma de decisiones en tiempo real a partir de observaciones vectoriales del entorno.
- Comportamiento multiagente: el entorno implica coordinación y competición entre dos equipos de dos agentes.
- Despliegue en el navegador mediante el visor de ML-Agents del Hub de Hugging Face.
- Reanudación del entrenamiento con `mlagents-learn --resume`.
- No soporta tool calling, function calling, razonamiento multi-paso en lenguaje natural, visión, audio ni capacidades multilingües.

## Casos de uso

- Investigación en RL multiagente: usar el agente como línea base o punto de partida para estudiar coordinación y competición en SoccerTwos, comparando curvas de recompensa con otros algoritmos (PPO, SAC, MADDPG).
- Docencia y divulgación: demostrar en un navegador cómo una política entrenada con ML-Agents juega al fútbol, sin necesidad de instalar Unity, gracias al visor del Hub.
- Reproducibilidad de experimentos: reanudar el entrenamiento con `mlagents-learn --resume` para verificar resultados o continuar el aprendizaje con más pasos.
- Evaluación de algoritmos: comparar POCA frente a PPO en el mismo entorno y con la misma configuración de observaciones y recompensas.
- Generación de datos sintéticos de interacción: ejecutar el agente contra versiones anteriores de sí mismo para producir trayectorias de entrenamiento adicionales (self-play).
- Pruebas de integración de ML-Agents: validar pipelines de exportación a ONNX y de carga de políticas en Unity o en el visor web antes de desplegar agentes propios.
- Benchmarking de infraestructura de simulación: medir throughput de pasos por segundo en SoccerTwos con distintas configuraciones de ML-Agents.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja; una política de ML-Agents para SoccerTwos suele ocupar del orden de megabytes. El repositorio completo pesa 0,2 GB, principalmente por los artefactos de TensorBoard.
- GPU recomendadas: no es necesario GPU para inferencia; cualquier CPU moderna puede ejecutar la política. Para reentrenar, se recomienda una GPU con al menos 8 GB (RTX 3060, RTX 4070, RTX 4090) o una A100/H100 para entrenamientos largos con muchas instancias paralelas.
- Cabe en GPU de consumo: sí, en cualquier GPU de consumo con soporte CUDA; también en CPU.
- Opciones de despliegue: Unity ML-Agents (runtime de Unity), visor web del Hub de Hugging Face, ONNX Runtime para integraciones personalizadas.
- Latencia y throughput estimados: no disponibles; dependen del hardware y del número de agentes simulados en paralelo.

## Comparativa con modelos similares

| Modelo | Entorno | Algoritmo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Flohrex/poca-SoccerTwos | SoccerTwos | POCA | No disponible | No aplica | No disponible | Hugging Face |
| Agentes oficiales de Unity ML-Agents (p. ej. los publicados en huggingface.co/unity) | SoccerTwos y otros entornos | PPO (habitual) | No disponible | No aplica | Según el repositorio | Hugging Face |
| Políticas de referencia de la documentación de ML-Agents | SoccerTwos | PPO | No disponible | No aplica | MIT (código de ML-Agents) | GitHub de Unity Technologies |

La comparación cuantitativa no es posible con la información disponible, ya que no se publican recompensas medias, tasas de victoria ni curvas de entrenamiento en la model card.

## Limitaciones y advertencias

- Específico del entorno SoccerTwos: la política no es transferible a otras tareas sin reentrenamiento.
- Sin licencia declarada: no se puede asumir permiso para uso comercial; conviene contactar con el autor antes de reutilizarlo en producción.
- Sin métricas publicadas: no hay evidencia de rendimiento (tasa de victoria, recompensa media) que permita evaluar su calidad frente a otros agentes.
- Sin detalles de entrenamiento: se desconocen hiperparámetros, número de pasos y configuración de self-play, lo que dificulta la reproducibilidad.
- Riesgo de sobreajuste al oponente: en RL multiagente, un agente entrenado contra un oponente fijo puede degradarse frente a políticas distintas.
- Sin soporte de lenguaje natural ni de tareas generales: no debe confundirse con un modelo de lenguaje pese a estar alojado en Hugging Face.
- Artefactos de TensorBoard incluidos: el repositorio contiene registros de entrenamiento que pueden exponer detalles internos del experimento; revisar antes de publicar derivados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Flohrex/poca-SoccerTwos
- Documentación de ML-Agents: https://unity-technologies.github.io/ml-agents/ML-Agents-Toolkit-Documentation/
- Repositorio de ML-Agents: https://github.com/Unity-Technologies/ml-agents
- Tutorial corto (Huggy the Dog): https://huggingface.co/learn/deep-rl-course/unitbonus1/introduction
- Tutorial largo de ML-Agents: https://huggingface.co/learn/deep-rl-course/unit5/introduction
- Visor de agentes de Unity en el Hub: https://huggingface.co/unity
