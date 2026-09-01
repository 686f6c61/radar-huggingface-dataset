# Pro152/poca-SoccerTwos

## Resumen

El modelo `Pro152/poca-SoccerTwos` es un agente de aprendizaje por refuerzo entrenado con la librería Unity ML-Agents para jugar al entorno SoccerTwos, un escenario de fútbol 2 contra 2 dentro del conjunto de entornos de Unity. El autor, Pro152, ha publicado el modelo en Hugging Face con el objetivo de que otros desarrolladores puedan cargarlo y visualizar el comportamiento del agente directamente en el navegador mediante la plataforma de Unity de Hugging Face.

El modelo emplea el algoritmo POCA (Policy Optimization with Continuous Actions), un método de entrenamiento multiagente incluido en ML-Agents, diseñado para entornos cooperativos y competitivos con acciones continuas. La model card no proporciona detalles sobre la arquitectura de red, el número de parámetros ni el proceso de entrenamiento (número de pasos, recompensas, configuración de hiperparámetros). El repositorio ocupa 0.1 GB e incluye al menos un archivo de pesos en formato `.nn` u `.onnx`, aunque el contenido exacto no se detalla.

La relevancia de este modelo radica en su utilidad como ejemplo práctico de aplicación de aprendizaje por refuerzo en entornos multiagente con Unity, así como en la posibilidad de reanudar el entrenamiento o inspeccionar el comportamiento del agente sin necesidad de reentrenar desde cero. Sin embargo, al carecer de documentación técnica adicional, su uso se limita al ámbito de demostración y experimentación dentro del ecosistema ML-Agents.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | `.nn` u `.onnx` (según la model card, se menciona seleccionar uno de estos formatos) |

## Arquitectura y entrenamiento

El modelo se basa en el algoritmo POCA de Unity ML-Agents, un método de optimización de políticas diseñado específicamente para problemas multiagente con acciones continuas. POCA se apoya en una arquitectura de actor-crítico, donde el actor genera acciones continuas (por ejemplo, velocidad de movimiento y rotación) y el crítico estima el valor de las observaciones. La red neuronal subyacente es típicamente un perceptrón multicapa con capas totalmente conectadas, aunque los detalles concretos (número de capas, neuronas, funciones de activación) no se especifican en la información disponible.

El entrenamiento se realizó en el entorno SoccerTwos de Unity, que simula un partido de fútbol con dos equipos de dos agentes cada uno. El entorno proporciona observaciones vectoriales y visuales, y las recompensas se basan en marcar goles, mantener la posesión del balón y evitar goles en contra. No se dispone de datos sobre el número de pasos de entrenamiento, la composición del dataset (las observaciones se generan en tiempo real durante la simulación) ni el uso de técnicas adicionales como recompensas por modelado (reward shaping) o curriculum learning. Tampoco se indica si se aplicaron métodos de post-entrenamiento como RLHF o DPO, ya que no es un modelo de lenguaje.

## Capacidades

- Jugar al fútbol 2 contra 2 en el entorno SoccerTwos de Unity, controlando a un agente con acciones continuas (movimiento y rotación).
- Tomar decisiones en tiempo real basadas en observaciones vectoriales y visuales del entorno, como la posición del balón, los compañeros y los oponentes.
- Cooperar con un compañero de equipo para mantener la posesión y marcar goles, gracias al entrenamiento con POCA que fomenta comportamientos coordinados.
- Reanudar el entrenamiento a partir de los pesos guardados mediante `mlagents-learn --resume`.
- Ejecutar el modelo en el navegador a través de la plataforma Unity de Hugging Face, seleccionando el archivo `.nn` u `.onnx` correspondiente.
- No es un modelo de lenguaje ni tiene capacidades de generación de texto, visión general, tool calling o razonamiento simbólico; su ámbito se limita al control de agentes en el entorno específico.

## Casos de uso

- Investigación en aprendizaje por refuerzo multiagente: el modelo sirve como punto de partida para estudiar comportamientos emergentes de cooperación y competencia en entornos deportivos simulados. Se puede cargar en Unity y analizar las estrategias aprendidas, o comparar con agentes entrenados con otros algoritmos.
- Desarrollo de IA para juegos deportivos: los desarrolladores de videojuegos pueden utilizar el modelo como base para crear oponentes o compañeros controlados por IA en juegos de fútbol, adaptando las observaciones y recompensas a sus propios entornos.
- Educación y demostración de ML-Agents: el modelo se puede usar en cursos o tutoriales para mostrar cómo se entrena un agente con POCA y cómo se visualiza su comportamiento en el navegador, facilitando la comprensión de conceptos de RL.
- Evaluación de algoritmos de RL: al ser un modelo publicado, permite comparar el rendimiento de POCA frente a otros algoritmos (PPO, SAC, etc.) en el mismo entorno, siempre que se disponga de métricas de evaluación adicionales.
- Pruebas de integración con Unity ML-Agents: los desarrolladores pueden verificar la compatibilidad de sus instalaciones de ML-Agents cargando este modelo y ejecutándolo en el entorno SoccerTwos, como prueba de que la configuración funciona correctamente.
- Generación de datos de comportamiento: el agente puede ejecutarse en el entorno para generar trayectorias de observación-acción que luego se utilicen para entrenar otros modelos, por ejemplo mediante imitación o aprendizaje por refuerzo offline.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas como MMLU, HumanEval o similares, ya que no se trata de un modelo de lenguaje o de propósito general. Tampoco se proporcionan estadísticas de rendimiento en el entorno SoccerTwos (por ejemplo, tasa de victorias, goles por partido o recompensa media). Los sitios web encontrados en la búsqueda (openmodelmap.com, zoo.bimant.com) muestran modelos similares de otros autores, pero no ofrecen datos comparativos cuantitativos para este modelo concreto.

## Requisitos de hardware

- Al ser un modelo de red neuronal pequeña (el repositorio ocupa 0.1 GB), es probable que la inferencia se ejecute sin problemas en CPU, incluso en equipos de gama media. Sin embargo, no se especifica el número de parámetros ni el consumo de memoria.
- Para ejecutar el entorno SoccerTwos de Unity se requiere una GPU con soporte de DirectX 11 o superior, aunque esto es necesario para el motor gráfico, no para el modelo de RL en sí.
- El modelo se puede ejecutar mediante la interfaz de ML-Agents en Unity, o bien exportando el archivo `.onnx` para usarlo con otros motores de inferencia.
- No se indican opciones de despliegue como vLLM, llama.cpp u Ollama, ya que no es un modelo de lenguaje. La integración se realiza a través de Unity ML-Agents o del visualizador web de Hugging Face.
- No se disponen de datos sobre latencia o throughput, pero dado el tamaño reducido, se espera una inferencia en tiempo real (varios cientos de decisiones por segundo) en CPU moderna.

## Comparativa con modelos similares

Existen otros agentes entrenados para SoccerTwos publicados en Hugging Face, como `akanametov/MLAgents-poca-SoccerTwos`, `zhiliang1/poca-SoccerTwos` (según openmodelmap.com) o `Alex48/poca-SoccerTwos-v15`. Todos ellos se basan en el mismo algoritmo POCA y entorno, pero no se dispone de información detallada sobre sus arquitecturas, hiperparámetros o rendimiento comparativo. La siguiente tabla resume lo que se conoce:

| Modelo | Autor | Fecha de creación | Tamaño del repo | Formato de pesos | Licencia |
|---|---|---|---|---|---|
| Pro152/poca-SoccerTwos | Pro152 | 2026-08-31 | 0.1 GB | `.nn` / `.onnx` | no disponible |
| akanametov/MLAgents-poca-SoccerTwos | akanametov | no disponible | no disponible | no disponible | no disponible |
| Alex48/poca-SoccerTwos-v15 | Alex48 | no disponible | no disponible | no disponible | no disponible |

No se pueden establecer comparaciones cuantitativas de rendimiento al no existir datos públicos de benchmarks para ninguno de estos agentes.

## Limitaciones y advertencias

- El modelo está entrenado exclusivamente para el entorno SoccerTwos de Unity; no puede generalizarse a otras tareas o entornos sin reentrenamiento.
- No se dispone de información sobre posibles sesgos o comportamientos indeseados del agente (por ejemplo, estrategias explotadoras o falta de robustez ante cambios en el entorno).
- Al no especificarse la licencia, el uso comercial del modelo es incierto; se recomienda contactar con el autor antes de utilizarlo en productos comerciales.
- La model card no documenta el proceso de entrenamiento, por lo que no se puede evaluar la reproducibilidad ni la calidad del agente.
- La ausencia de datos sobre la arquitectura y los parámetros impide estimar el consumo de recursos con precisión.
- El modelo no tiene capacidades de razonamiento simbólico, procesamiento de lenguaje natural ni visión general; su alcance se limita al control de un agente en un entorno simulado.
- No se garantiza que el agente funcione correctamente en versiones recientes de Unity ML-Agents si ha habido cambios en la API o en el formato de los pesos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Pro152/poca-SoccerTwos
- Documentación de Unity ML-Agents: https://unity-technologies.github.io/ml-agents/ML-Agents-Toolkit-Documentation/
- Tutorial corto del curso de RL de Hugging Face: https://huggingface.co/learn/deep-rl-course/unitbonus1/introduction
- Tutorial largo sobre ML-Agents: https://huggingface.co/learn/deep-rl-course/unit5/introduction
- Modelo similar de akanametov: https://huggingface.co/akanametov/MLAgents-poca-SoccerTwos
- Modelo similar en openmodelmap.com: https://openmodelmap.com/model/zhiliang1/poca-soccertwos
- Modelo similar en AI Model Zoo (BimAnt): https://zoo.bimant.com/model/152299 y https://zoo.bimant.com/model/260219
