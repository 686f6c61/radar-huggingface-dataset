# foleymon/poca-SoccerTwos

## Resumen

poca-SoccerTwos es un agente de aprendizaje por refuerzo entrenado con el algoritmo MA-POCA (Multi-Agent POsthumous Credit Assignment) sobre el entorno SoccerTwos de Unity ML-Agents. Lo desarrolla el usuario foleymon como entrega de la unidad 7 del curso de Deep Reinforcement Learning de Hugging Face. No es un modelo de lenguaje: es una política neuronal que controla jugadores de un partido de fútbol 2 contra 2 en un entorno simulado, y se distribuye como pesos ONNX compatibles con ML-Agents.

El interés de esta ficha es distinto al de un LLM. Aquí no hay tokens de contexto, cuantizaciones ni capacidades lingüísticas, sino un artefacto de investigación educativa que demuestra un pipeline completo de entrenamiento multiagente con self-play. El entrenamiento se realizó con 1.000.000 de pasos sobre una GPU Tesla T4, con un resultado de Mean Group Reward de -0.05 +/- 0.16 sobre las 100 summaries de entrenamiento y un reward final por agente de 0.00.

Su relevancia es acotada: sirve como referencia reproducible para quien quiera entender MA-POCA y el flujo de publicación en el Hub de Unity, pero no es un modelo listo para producción ni para tareas fuera del entorno SoccerTwos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal de política para ML-Agents (MA-POCA, aprendizaje por refuerzo multiagente); topología interna no disponible |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (entorno de simulación, no modelo de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica |
| Licencia | no disponible |
| Formato de pesos | ONNX (.onnx), compatible con ML-Agents; también se mencionan archivos .nn en la model card |
| Algoritmo de entrenamiento | MA-POCA con self-play |
| Entorno | SoccerTwos (Unity ML-Agents) |
| Pasos de entrenamiento | 1.000.000 |
| Hardware de entrenamiento | Tesla T4 |
| Tamaño del repositorio | 0.1 GB |
| Librería | ml-agents |

## Arquitectura y entrenamiento

El agente se entrena con MA-POCA, un algoritmo de aprendizaje por refuerzo multiagente diseñado para asignar crédito de forma póstuma entre agentes que comparten recompensa. En SoccerTwos, dos equipos de dos jugadores compiten en un campo simulado; el self-play permite que la política mejore enfrentándose a versiones de sí misma. La model card no detalla la topología de la red (capas, unidades, tipo de observaciones), por lo que esa información no está disponible.

El entrenamiento consta de 1.000.000 de pasos ejecutados sobre una Tesla T4. La métrica reportada es el Mean Group Reward promediado sobre las 100 summaries de entrenamiento: -0.05 +/- 0.16, con un resultado puntual de -0.22. En el paso final, el Mean Group Reward fue 0.19 y el Mean Reward por agente 0.00. Estos valores indican una política que no ha convergido a un comportamiento claramente ganador: el reward final por agente nulo sugiere empates o ausencia de señal de recompensa neta en el último tramo.

## Capacidades

- Control de agentes en el entorno SoccerTwos de Unity ML-Agents (fútbol 2 contra 2).
- Aprendizaje multiagente con asignación de crédito compartida (MA-POCA).
- Entrenamiento mediante self-play, lo que permite enfrentar el agente contra versiones de sí mismo.
- Inferencia vía ONNX dentro del runtime de ML-Agents.
- Reanudación del entrenamiento desde el checkpoint publicado (`--resume`).
- Visualización del agente jugando en el navegador a través del Hub de Unity.
- No soporta generación de texto, código, matemáticas, visión, tool calling, agentes conversacionales ni capacidades multilingües.

## Casos de uso

- Docencia y formación en RL multiagente: usar el checkpoint como ejemplo reproducible de un entrenamiento MA-POCA con self-play en la unidad 7 del curso de Hugging Face, comparando curvas de reward y comportamiento final.
- Baseline para experimentos de SoccerTwos: partir de estos pesos y reanudar el entrenamiento con más pasos o hiperparámetros distintos para medir mejoras en el Mean Group Reward.
- Estudio de asignación de crédito: analizar cómo MA-POCA reparte la recompensa grupal entre los dos jugadores de un equipo en un escenario cooperativo-competitivo.
- Pruebas de integración de ML-Agents: validar pipelines de carga de modelos ONNX, visualización en el Hub de Unity y reanudación de runs en infraestructura propia.
- Investigación sobre convergencia en self-play: el reward final por agente de 0.00 y el Mean Group Reward de -0.05 ofrecen un caso de estudio sobre políticas que no alcanzan un comportamiento dominante.
- Demostraciones educativas en el navegador: desplegar el agente en el visor de Unity del Hub para mostrar el funcionamiento de un agente entrenado sin necesidad de infraestructura local.
- Comparación de algoritmos: contrastar MA-POCA con PPO u otros algoritmos en el mismo entorno para evaluar estabilidad y calidad de la política resultante.

## Benchmarks y rendimiento

Datos declarados por el autor en la model card (no verificados):

| Tarea | Dataset | Métrica | Valor |
|---|---|---|---|
| Reinforcement Learning | ML-Agents-SoccerTwos | mean_reward | -0.05 +/- 0.16 |
| Reinforcement Learning | ML-Agents-SoccerTwos | resultado puntual | -0.22 |
| Reinforcement Learning | ML-Agents-SoccerTwos | Mean Group Reward final | 0.19 |
| Reinforcement Learning | ML-Agents-SoccerTwos | Mean Reward por agente final | 0.00 |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la información disponible, ya que no aplican a este tipo de modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja; el repositorio completo ocupa 0.1 GB y la política es una red pequeña, por lo que cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: cualquier GPU con soporte CUDA o incluso CPU para inferencia; el entrenamiento se realizó en una Tesla T4.
- Cabe en GPU consumer: sí, en cualquier modelo actual (RTX 3060, RTX 4090, etc.) e incluso en CPU para inferencia.
- Opciones de despliegue: runtime de ML-Agents con pesos ONNX, visor del Hub de Unity (https://huggingface.co/unity), y reanudación de entrenamiento con `mlagents-learn`.
- Latencia y throughput: no disponibles; dependen del entorno SoccerTwos y del hardware de simulación.

## Comparativa con modelos similares

| Modelo | Tipo | Entorno | Algoritmo | Pasos | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| poca-SoccerTwos (foleymon) | Agente RL | SoccerTwos | MA-POCA + self-play | 1.000.000 | no disponible | Hugging Face |
| Agentes SoccerTwos del curso HF | Agente RL | SoccerTwos | MA-POCA | variable | según autor | Hugging Face |
| Modelos de Unity ML-Agents oficiales | Agente RL | varios | PPO / MA-POCA | variable | según repositorio | GitHub / Hub |

No se dispone de datos comparativos de rendimiento entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Específico del entorno SoccerTwos: no es transferible a otras tareas sin reentrenamiento.
- Rendimiento limitado: el Mean Group Reward de -0.05 +/- 0.16 y el reward final por agente de 0.00 indican una política que no domina el entorno.
- Entrenamiento corto: 1.000.000 de pasos es una cantidad modesta para self-play multiagente; es probable que más pasos mejoren el comportamiento.
- Licencia no disponible: no se puede confirmar el uso comercial; conviene contactar con el autor antes de cualquier despliegue productivo.
- Sin información sobre sesgos: al no operar sobre datos humanos, los sesgos sociales no aplican, pero puede presentar comportamientos degenerados o colusorios propios del self-play.
- Sin garantías de robustez: los resultados no están verificados (`verified: false` en la model card).
- Dependencia de ML-Agents: requiere el runtime y la versión compatible de la librería para cargar los pesos ONNX.
- Documentación escasa: la model card no detalla topología, observaciones ni hiperparámetros, lo que dificulta la reproducibilidad exacta.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/foleymon/poca-SoccerTwos
- Repositorio Unity ML-Agents: https://github.com/Unity-Technologies/ml-agents
- Documentación de ML-Agents: https://unity-technologies.github.io/ml-agents/ML-Agents-Toolkit-Documentation/
- Tutorial corto (Huggy the Dog): https://huggingface.co/learn/deep-rl-course/unitbonus1/introduction
- Tutorial largo unidad 7: https://huggingface.co/learn/deep-rl-course/unit7/introduction
- Visor de agentes en el Hub de Unity: https://huggingface.co/unity
