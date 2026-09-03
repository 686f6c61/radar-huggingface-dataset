# aestoquera/ppo-Huggy

## Resumen

El modelo `aestoquera/ppo-Huggy` es un agente de aprendizaje por refuerzo profundo entrenado con el algoritmo PPO (Proximal Policy Optimization) para jugar al entorno Huggy, un escenario del ecosistema Unity ML-Agents en el que un perro virtual debe aprender a buscar y recoger un palo. El autor, aestoquera, ha publicado este modelo como parte de un ecosistema educativo más amplio impulsado por Hugging Face, que incluye tutoriales completos para que desarrolladores aprendan a entrenar sus primeros agentes con ML-Agents y a publicarlos en el Hub.

El modelo resuelve el problema de enseñar a un agente a interactuar con un entorno 3D continuo mediante políticas de control aprendidas, sin necesidad de programar reglas explícitas. Su relevancia radica en que sirve como ejemplo práctico y reproducible de entrenamiento de agentes con Unity ML-Agents, una de las herramientas más utilizadas para simulación y entrenamiento de IA en entornos físicos. El repositorio incluye los pesos del modelo en formato ONNX y `.nn`, listos para ser cargados en el entorno Unity o visualizados directamente en el navegador a través de la plataforma Hugging Face Unity.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | PPO (Proximal Policy Optimization) con red neuronal (MLP) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (entorno de RL, no modelo de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica |
| Licencia | no disponible |
| Formato de pesos | ONNX, `.nn` (Unity ML-Agents) |

## Arquitectura y entrenamiento

El modelo utiliza el algoritmo PPO, un método de optimización de políticas basado en gradiente ascendente que se ha convertido en un estándar de facto en aprendizaje por refuerzo profundo. PPO equilibra la estabilidad del entrenamiento con la eficiencia muestral mediante una funcion de perdida que limita la desviacion entre la politica actual y la anterior, evitando actualizaciones destructivas. La red neuronal subyacente es un perceptron multicapa (MLP) que mapea observaciones del entorno (posicion, velocidad, estado del palo, etc.) a acciones de control continuas o discretas.

El entrenamiento se realizo con Unity ML-Agents, un toolkit que integra Unity como simulador fisico con Python para el entrenamiento de agentes. El entorno Huggy es un escenario disenado especificamente para el curso de Deep RL de Hugging Face, donde el agente debe aprender a navegar, recoger un palo y devolverlo. No se dispone de informacion detallada sobre el numero de timesteps, la composicion del dataset de experiencias ni si se aplicaron tecnicas adicionales como curriculum learning o reward shaping, aunque el entorno base ya incluye un diseno de recompensas que guia al agente hacia el objetivo.

## Capacidades

- Control de un agente virtual en un entorno 3D continuo con fisica simulada.
- Aprendizaje de politicas de navegacion y manipulacion de objetos (recoger y devolver un palo).
- Inferencia en tiempo real dentro del motor Unity, tanto en editor como en build.
- Visualizacion del comportamiento directamente en el navegador mediante la integracion de Hugging Face con Unity WebGL.
- Reanudacion del entrenamiento desde los pesos guardados con `mlagents-learn --resume`.
- Exportacion a formato ONNX para interoperabilidad con otros motores o frameworks.

## Casos de uso

- Educacion en aprendizaje por refuerzo: el modelo es un ejemplo perfecto para que estudiantes y desarrolladores vean el resultado de un entrenamiento PPO en un entorno 3D y lo comparen con sus propios agentes.
- Prototipado de IA para videojuegos: sirve como punto de partida para disenar NPCs o enemigos que aprenden comportamientos complejos en Unity sin programacion manual.
- Investigacion en RL: el repositorio permite reproducir el entrenamiento y experimentar con hiperparametros, funciones de recompensa o arquitecturas de red alternativas.
- Integracion en pipelines de ML-Ops: al estar disponible en el Hub, puede descargarse y evaluarse automaticamente en entornos CI/CD para validar regresiones en el comportamiento del agente.
- Demostraciones interactivas: la capacidad de ver al agente jugar en el navegador lo convierte en una herramienta de divulgacion y presentacion de proyectos de IA.
- Benchmarking de algoritmos: al ser un entorno estandarizado, permite comparar el rendimiento de PPO con otros algoritmos como SAC o DQN en la misma tarea.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor no proporciona metricas cuantitativas de rendimiento (como recompensa media, exito en la tarea o comparativas con otros algoritmos) en la model card.

## Requisitos de hardware

- El modelo es extremadamente ligero (0.1 GB en el repositorio), por lo que la inferencia puede ejecutarse en CPU sin problemas.
- Para entrenamiento desde cero, se recomienda una GPU con al menos 4 GB de VRAM (p. ej., GTX 1650 o superior) para acelerar la simulacion, aunque Unity ML-Agents tambien puede entrenar en CPU con tiempos mas largos.
- Para visualizacion en el navegador, no se requiere hardware especial; basta con un navegador moderno con soporte WebGL.
- El despliegue se realiza principalmente dentro de Unity, por lo que no aplican motores de inferencia como vLLM u Ollama. La integracion con Python se hace a traves de `mlagents-learn` y el paquete `mlagents` de PyPI.
- La latencia de inferencia es tipicamente inferior a 10 ms en CPU moderna, dado el tamano reducido de la red, lo que permite control en tiempo real a 60 fps.

## Comparativa con modelos similares

| Modelo | Entorno | Algoritmo | Libreria | Formato | Licencia |
|---|---|---|---|---|---|
| aestoquera/ppo-Huggy | Huggy (Unity) | PPO | ML-Agents | ONNX, .nn | no disponible |
| Kev3010/ppo-Huggy | Huggy (Unity) | PPO | ML-Agents | ONNX, .nn | no disponible |
| aestoquera/ppo-LunarLander-v2 | LunarLander-v2 (Gym) | PPO | stable-baselines3 | .zip (SB3) | no disponible |

Los tres modelos son ejemplos educativos de agentes PPO entrenados en entornos distintos. El de LunarLander-v2 usa el stack de Gym + stable-baselines3, mientras que los de Huggy usan Unity ML-Agents. No hay diferencias sustanciales en capacidades; la eleccion depende del entorno objetivo.

## Limitaciones y advertencias

- El modelo esta especializado exclusivamente en el entorno Huggy; no es transferible a otras tareas sin reentrenamiento.
- No se dispone de informacion sobre la licencia, por lo que se recomienda contactar con el autor antes de un uso comercial.
- El comportamiento del agente puede presentar fallos en situaciones no vistas durante el entrenamiento (generalizacion limitada).
- Al ser un modelo educativo, no se ha optimizado para produccion ni se han realizado pruebas de robustez frente a perturbaciones en el entorno.
- La ausencia de benchmarks publicados impide evaluar su calidad relativa frente a otros agentes entrenados en el mismo entorno.
- El repositorio no incluye el codigo de entrenamiento ni la configuracion YAML, solo los pesos, lo que limita la reproducibilidad completa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/aestoquera/ppo-Huggy
- Documentacion de Unity ML-Agents: https://unity-technologies.github.io/ml-agents/ML-Agents-Toolkit-Documentation/
- Tutorial corto (entrenar a Huggy): https://huggingface.co/learn/deep-rl-course/unitbonus1/introduction
- Tutorial largo (ML-Agents en profundidad): https://huggingface.co/learn/deep-rl-course/unit5/introduction
- Repositorio de ML-Agents en GitHub: https://github.com/Unity-Technologies/ml-agents
- Plataforma Unity de Hugging Face: https://huggingface.co/unity
