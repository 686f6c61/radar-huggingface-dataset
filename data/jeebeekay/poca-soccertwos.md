# jeebeekay/poca-SoccerTwos

## Resumen

poca-SoccerTwos es un agente entrenado con aprendizaje por refuerzo profundo (deep reinforcement learning) mediante la librería Unity ML-Agents, publicado por el usuario jeebeekay en Hugging Face. El modelo resuelve la tarea del entorno SoccerTwos, un escenario de fútbol 2 contra 2 en el que dos equipos de agentes compiten por marcar goles en un campo reducido. El entrenamiento se realizó con el algoritmo POCA (Policy Optimization with Clipped Advantages), una variante de política proximal que ML-Agents incorpora para entornos multiagente competitivos y cooperativos.

El artefacto publicado no es un modelo de lenguaje ni un transformer generativo, sino una política neuronal exportada en formato ONNX (y potencialmente .nn) que se ejecuta dentro del motor Unity. El repositorio ocupa 0,2 GB, lo que sugiere la inclusión de checkpoints intermedios, archivos de TensorBoard y los pesos finales del agente. No se dispone de información sobre el número de parámetros, la arquitectura exacta de la red ni el volumen de pasos de entrenamiento.

Su relevancia es acotada: se trata de un artefacto de investigación y demostración para el entorno SoccerTwos, útil para reproducir experimentos de RL multiagente y para visualizar agentes entrenados directamente en el navegador a través del visor de Hugging Face. No está pensado para uso en producción ni para tareas fuera del entorno Unity para el que fue entrenado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal de política y valor para RL (ML-Agents, algoritmo POCA); topología exacta no disponible |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (agente de RL, no procesa texto) |
| Tipos de cuantizacion | no disponible (exportación a ONNX; cuantización no documentada) |
| Idiomas soportados | no aplica (agente de control en entorno Unity) |
| Licencia | no disponible |
| Formato de pesos | ONNX (.onnx) y checkpoints de ML-Agents (.nn); repo de 0,2 GB |

## Arquitectura y entrenamiento

El agente se entrenó con Unity ML-Agents, un toolkit que implementa algoritmos de RL profundo sobre el motor Unity. El algoritmo indicado en el nombre del modelo es POCA, una variante de PPO orientada a entornos multiagente con ventajas recortadas, adecuada para escenarios competitivos como SoccerTwos, donde dos equipos de dos agentes cada uno comparten política o compiten entre sí. La política se materializa como una red neuronal que recibe observaciones del entorno (posiciones, velocidades y estado del balón y de los agentes) y emite acciones discretas de movimiento y chut.

No se dispone de información sobre el número de pasos de entrenamiento, la composición de las observaciones, la arquitectura concreta de las capas ocultas, el uso de memoria recurrente (LSTM) ni hiperparámetros como la tasa de aprendizaje o el tamaño de lote. El repositorio incluye artefactos de TensorBoard, lo que permite inspeccionar curvas de recompensa si se descargan, pero los valores no están documentados en la model card.

## Capacidades

- Control de un agente en el entorno SoccerTwos de Unity ML-Agents: movimiento, orientación y chut del balón en partidos 2 contra 2.
- Ejecución de política entrenada mediante inferencia ONNX dentro del motor Unity o en el visor web de Hugging Face.
- Reanudación del entrenamiento desde el checkpoint publicado mediante `mlagents-learn --resume`.
- Visualización del agente jugando en el navegador a través del visor oficial de ML-Agents en Hugging Face.
- No soporta tool calling, function calling, agentes multi-step en el sentido de LLM, ni capacidades multilingües.
- No dispone de modo de razonamiento explícito (thinking mode), visión, audio ni generación de texto.

## Casos de uso

- Reproducción de experimentos de RL multiagente: cargar el checkpoint en ML-Agents y continuar el entrenamiento con `--resume` para estudiar la convergencia de POCA en SoccerTwos.
- Demostración educativa de RL competitivo: usar el visor de Hugging Face para mostrar en clase o en un tutorial cómo un agente aprendido juega al fútbol 2v2 sin necesidad de infraestructura local.
- Comparación de algoritmos: emplear este agente como referencia frente a políticas entrenadas con PPO, SAC u otros algoritmos en el mismo entorno, evaluando recompensa media por episodio.
- Generación de datos de comportamiento: ejecutar la política para recolectar trayectorias y analizar estrategias emergentes (presión, cobertura, posicionamiento) en entornos multiagente.
- Base para fine-tuning en variantes del entorno: partir de estos pesos y adaptarlos a configuraciones modificadas de SoccerTwos (número de agentes, recompensas, tamaño de campo).
- Integración en pipelines de investigación de Unity: desplegar el ONNX en una build de Unity para pruebas de inferencia en tiempo real y medir latencia del agente en el motor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB; la red de política de ML-Agents para SoccerTwos es de tamaño reducido y el repositorio completo ocupa 0,2 GB, incluyendo checkpoints y logs.
- GPU recomendadas: cualquier GPU con soporte CUDA o incluso CPU es suficiente para inferencia; para reentrenamiento se recomienda una GPU consumer moderna (RTX 3060 o superior).
- Cabe en cualquier GPU consumer, incluidas GTX 1650, RTX 3050 y superiores; también funciona en CPU.
- Opciones de despliegue: Unity ML-Agents (runtime nativo), ONNX Runtime, visor web de Hugging Face para ML-Agents.
- Latencia y throughput estimados: no disponibles; dependen del motor Unity y del hardware, no del modelo en sí.

## Comparativa con modelos similares

| Modelo | Entorno | Algoritmo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| jeebeekay/poca-SoccerTwos | SoccerTwos | POCA | no disponible | no aplica | no disponible | Hugging Face |
| Agentes oficiales de Unity en huggingface.co/unity | SoccerTwos y otros | PPO / POCA | no disponible | no aplica | generalmente permisiva, ver cada repo | Hugging Face |
| Políticas de referencia del repositorio ml-agents | SoccerTwos | PPO | no disponible | no aplica | Apache 2.0 (repo ml-agents) | GitHub |

La comparación se limita a otros agentes del mismo entorno, ya que no existen alternativas de propósito general comparables: se trata de un artefacto específico de un entorno de RL, no de un modelo fundacional.

## Limitaciones y advertencias

- El agente está entrenado exclusivamente para SoccerTwos; no generaliza a otros entornos ni a tareas fuera de Unity.
- No es un modelo de lenguaje: no procesa texto, no responde a prompts y no tiene capacidades generativas.
- La licencia no está especificada, lo que impide asumir permisos de uso comercial; es necesario contactar con el autor antes de cualquier explotación.
- No se documentan sesgos, pero al ser una política entrenada por recompensa puede exhibir comportamientos degenerados o explotar artefactos del simulador.
- No hay información sobre la calidad del entrenamiento (recompensa final, tasa de victorias) ni sobre la estabilidad de la política.
- El repositorio tiene 0 descargas y 0 likes, lo que sugiere que no ha sido validado por la comunidad.
- La fecha de creación indicada (2026-11-19) es futura respecto a la fecha habitual de publicación, lo que puede indicar un error en los metadatos del Hub.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jeebeekay/poca-SoccerTwos
- Documentación de ML-Agents: https://unity-technologies.github.io/ml-agents/ML-Agents-Toolkit-Documentation/
- Repositorio de ML-Agents: https://github.com/Unity-Technologies/ml-agents
- Visor de agentes ML-Agents en Hugging Face: https://huggingface.co/unity
- Tutorial corto de ML-Agents: https://huggingface.co/learn/deep-rl-course/unitbonus1/introduction
- Tutorial largo de ML-Agents: https://huggingface.co/learn/deep-rl-course/unit5/introduction
