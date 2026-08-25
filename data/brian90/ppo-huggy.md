# Brian90/ppo-Huggy

## Resumen

Brian90/ppo-Huggy es un agente de aprendizaje por refuerzo (reinforcement learning) entrenado con el algoritmo PPO (Proximal Policy Optimization) para jugar al entorno Huggy de Unity ML-Agents. El modelo fue desarrollado por el usuario Brian90 y publicado en Hugging Face como parte de la comunidad de ML-Agents, que permite entrenar agentes inteligentes en entornos Unity. Huggy es un perro virtual que debe aprender a recoger un palo lanzado por el usuario, un problema clásico de control motor y navegación en un entorno 3D.

Este modelo es relevante como ejemplo práctico de aplicación de PPO en un entorno de juego interactivo, y su publicación en Hugging Face permite a otros desarrolladores reproducir el entrenamiento, cargar el agente y visualizar su comportamiento directamente en el navegador. La arquitectura concreta del agente (número de capas, neuronas, tipo de red) no está documentada en la información disponible, aunque el repositorio incluye pesos en formato ONNX o .nn, típicos de ML-Agents. El tamaño del repositorio es de 0,2 GB, lo que sugiere un modelo ligero, pero no se especifican parámetros totales ni longitud de contexto, ya que no se trata de un modelo de lenguaje.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal del agente ML-Agents (no especificada) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (agente de RL, no procesa texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica |
| Licencia | no disponible |
| Formato de pesos | ONNX / .nn (según la model card) |

## Arquitectura y entrenamiento

El agente se entrena mediante el algoritmo PPO, implementado en la librería Unity ML-Agents. PPO es un método de optimización de política basado en gradiente que equilibra exploración y explotación mediante una función de pérdida con recorte (clipped surrogate objective). El entorno Huggy consiste en un perro virtual que debe aprender a moverse y recoger un palo, lo que implica observaciones del estado (posición, velocidad, orientación) y acciones de control motor. No se dispone de detalles sobre el número de capas, neuronas, funciones de activación, ni sobre el dataset de entrenamiento (número de episodios, recompensas, hiperparámetros). La model card indica que se puede reanudar el entrenamiento con el comando `mlagents-learn --resume`, lo que sugiere que se usó una configuración YAML estándar de ML-Agents. No se menciona el uso de técnicas adicionales como RLHF o DPO, ya que no aplican a este tipo de agente.

## Capacidades

- Control de un agente virtual en un entorno 3D: el modelo es capaz de mover al perro Huggy para recoger un palo, lo que implica navegación, seguimiento de objetivos y control motor.
- Interacción con el entorno Unity: el agente procesa observaciones del entorno y emite acciones continuas o discretas según la configuración de ML-Agents.
- Reproducibilidad del entrenamiento: al ser un agente PPO estándar, puede reanudarse el entrenamiento o modificarse la configuración para adaptarlo a variantes del entorno.
- Visualización en navegador: gracias a la integración con Hugging Face Unity, se puede observar al agente jugar directamente en el navegador sin necesidad de instalar Unity.
- No tiene capacidades de lenguaje, tool calling, visión ni razonamiento simbólico; es exclusivamente un agente de RL para un entorno específico.

## Casos de uso

- Demostración educativa de RL: el modelo sirve para enseñar los fundamentos de PPO y ML-Agents en cursos de aprendizaje por refuerzo, ya que el entorno Huggy es sencillo y visualmente atractivo.
- Prototipado de agentes para juegos: desarrolladores de videojuegos pueden usar este agente como punto de partida para entrenar NPCs o personajes que aprendan a interactuar con objetos en entornos Unity.
- Investigación en control motor: el problema de recoger un palo implica coordinación de movimientos y puede servir como banco de pruebas para algoritmos de control continuo.
- Benchmark de algoritmos RL: al ser un entorno reproducible, se puede comparar el rendimiento de PPO frente a otros algoritmos (SAC, DQN) en la misma tarea.
- Integración en pipelines de simulación: el agente puede integrarse en simulaciones de robótica o animación para generar comportamientos autónomos de personajes.
- Experimentación con hiperparámetros: los usuarios pueden reanudar el entrenamiento con diferentes configuraciones para estudiar el efecto de la tasa de aprendizaje, el tamaño del batch, etc.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos sobre recompensas medias, tasa de éxito ni comparaciones con otros agentes en el entorno Huggy.

## Requisitos de hardware

- El modelo es ligero (0,2 GB) y está diseñado para ejecutarse en Unity ML-Agents, por lo que puede funcionar en CPU sin necesidad de GPU para inferencia.
- Para reanudar el entrenamiento se recomienda una GPU con al menos 4 GB de VRAM, aunque no se especifica un requisito mínimo.
- El despliegue se realiza mediante Unity ML-Agents, ya sea en el editor de Unity o en el navegador a través de la integración de Hugging Face (https://huggingface.co/unity).
- No se dispone de datos de latencia ni throughput, pero al ser un agente de control en tiempo real, se espera que la inferencia sea rápida (del orden de milisegundos) en hardware moderno.
- No es compatible con vLLM, llama.cpp u otras herramientas de inferencia de modelos de lenguaje, ya que no es un LLM.

## Comparativa con modelos similares

No se dispone de información suficiente para una comparativa rigurosa. Existen otros agentes PPO-Huggy publicados en Hugging Face, como Kev3010/ppo-Huggy o SleepyNinjaAI/HuggyAI, pero no se conocen sus especificaciones ni rendimiento. En general, todos los agentes de este tipo comparten la misma arquitectura base de ML-Agents y se diferencian únicamente en los hiperparámetros y el número de pasos de entrenamiento, datos que no están disponibles en este modelo.

## Limitaciones y advertencias

- El agente está entrenado exclusivamente para el entorno Huggy; no generaliza a otros entornos o tareas sin reentrenamiento.
- No se han documentado sesgos ni riesgos de alucinación, ya que no es un modelo de lenguaje.
- La licencia no está especificada, por lo que se desconoce si permite uso comercial o modificación; se recomienda contactar al autor antes de utilizarlo en proyectos comerciales.
- El rendimiento del agente depende de la configuración del entorno Unity; cambios en la física o en la cámara pueden degradar su comportamiento.
- No se proporcionan métricas de robustez ni de estabilidad del entrenamiento, por lo que no se puede garantizar que el agente actúe de forma óptima en todas las condiciones.
- El repositorio no incluye documentación técnica detallada (arquitectura de red, hiperparámetros, curvas de recompensa), lo que dificulta la reproducibilidad exacta.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Brian90/ppo-Huggy
- Documentación de ML-Agents: https://unity-technologies.github.io/ml-agents/ML-Agents-Toolkit-Documentation/
- Tutorial corto de Huggy (Deep RL Course): https://huggingface.co/learn/deep-rl-course/unitbonus1/introduction
- Tutorial largo de ML-Agents (Deep RL Course): https://huggingface.co/learn/deep-rl-course/unit5/introduction
- Repositorio de Unity ML-Agents: https://github.com/Unity-Technologies/ml-agents
