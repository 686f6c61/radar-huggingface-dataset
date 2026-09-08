# Mwampooo/ppo-Huggy

## Resumen

`Mwampooo/ppo-Huggy` es un modelo de aprendizaje por refuerzo (reinforcement learning) entrenado con el algoritmo PPO (Proximal Policy Optimization) mediante la librería Unity ML-Agents. El agente está diseñado para jugar al entorno "Huggy", un escenario de Unity en el que un perro debe aprender a buscar y traer un palo. No se trata de un modelo de lenguaje, sino de una política neuronal que mapea observaciones del entorno a acciones de control.

El modelo fue desarrollado por el usuario Mwampooo y publicado en Hugging Face como parte de la categoría de modelos de reinforcement learning. Su relevancia radica en servir como ejemplo práctico de entrenamiento de agentes con Unity ML-Agents y de su publicación en el Hub, así como en la posibilidad de visualizar el comportamiento del agente directamente en el navegador. El repositorio tiene un tamaño de 0,2 GB e incluye pesos en formato ONNX, lo que permite su ejecución fuera de Unity mediante el runtime de ONNX. La información técnica disponible es limitada: no se especifican parámetros totales, arquitectura detallada ni datos de entrenamiento.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (red neuronal de Unity ML-Agents) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible (no aplica, es un agente de RL) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | .onnx / .nn |

## Arquitectura y entrenamiento

El modelo fue entrenado con el algoritmo PPO, una técnica de aprendizaje por refuerzo basada en políticas, utilizando la librería Unity ML-Agents. La arquitectura concreta de la red neuronal (número de capas, unidades por capa, tipo de red feedforward o recurrente) no se ha publicado en la información disponible. El entorno de entrenamiento es "Huggy", un entorno de simulación de Unity en el que el agente interactúa con un mundo 3D para completar una tarea de búsqueda y recogida de un objeto.

No se dispone de datos sobre el número de tokens, la composición del dataset ni sobre procesos de ajuste como RLHF o DPO, al tratarse de un modelo de aprendizaje por refuerzo y no de un modelo de lenguaje. Tampoco se han documentado innovaciones técnicas destacables en la model card. El modelo se puede reanudar desde el estado guardado mediante el comando `mlagents-learn --resume`, lo que indica que se entrenó con la herramienta de línea de comandos de ML-Agents.

## Capacidades

- Ejecutar una política de control para el entorno Huggy de Unity ML-Agents, tomando decisiones basadas en observaciones del entorno.
- Exportar el modelo a formato ONNX para su integración en aplicaciones fuera de Unity.
- Visualizar el comportamiento del agente en el navegador a través de la plataforma Hugging Face, seleccionando el archivo `.nn` o `.onnx` correspondiente.
- Reanudar el entrenamiento desde un checkpoint guardado, lo que permite continuar el entrenamiento con nuevas configuraciones.
- No soporta generación de texto, razonamiento simbólico, tool calling, visión ni otras capacidades de los modelos de lenguaje.
- No dispone de soporte para agentes conversacionales ni multi-step reasoning.

## Casos de uso

- Investigación en aprendizaje por refuerzo: el modelo puede utilizarse como punto de partida para estudiar el comportamiento de agentes PPO en entornos de Unity, comparando políticas o analizando la estabilidad del entrenamiento.
- Prototipado de agentes en videojuegos: sirve como ejemplo de cómo entrenar un NPC que aprende a interactuar con el entorno, útil para desarrolladores que quieran integrar ML-Agents en sus propios juegos.
- Demostraciones educativas: el modelo se puede cargar en el navegador para mostrar a estudiantes cómo un agente aprende una tarea sencilla, sin necesidad de instalar Unity ni de disponer de hardware potente.
- Pruebas de exportación a ONNX: al incluir pesos en formato ONNX, el modelo puede usarse para probar la compatibilidad de agentes de Unity con otros motores de inferencia, como ONNX Runtime en aplicaciones de escritorio o web.
- Integración en pipelines de simulación: el agente puede ejecutarse dentro de un entorno de simulación Unity para evaluar políticas de control en escenarios repetibles, por ejemplo en robótica o en juegos.
- Comparación de algoritmos de RL: al ser un modelo PPO, puede servir como referencia para comparar el rendimiento de otros algoritmos (como SAC o DQN) en el mismo entorno Huggy, aunque no se dispone de métricas publicadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. Al tratarse de un agente de RL pequeño (repo de 0,2 GB), la inferencia puede ejecutarse en CPU, aunque no se especifica el consumo exacto de memoria.
- GPU recomendadas: no disponible. Para reanudar el entrenamiento con Unity ML-Agents se recomienda una GPU compatible con CUDA, pero no se indica ningún modelo concreto.
- Compatibilidad con GPU de consumo: probablemente sí, dado el tamaño reducido del repositorio, aunque no hay datos oficiales.
- Opciones de despliegue: Unity ML-Agents (con el archivo `.nn`), ONNX Runtime (con el archivo `.onnx`), y visualización en el navegador a través de Hugging Face.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Autor | Formato | Entorno | Licencia |
|---|---|---|---|---|
| Mwampooo/ppo-Huggy | Mwampooo | .onnx / .nn | Huggy | no disponible |
| Kev3010/ppo-Huggy | Kev3010 | .onnx / .nn | Huggy | no disponible |
| aiartwork/ppo-Huggy | aiartwork | .onnx / .nn | Huggy | no disponible |

Los tres modelos pertenecen a la misma categoría de agentes PPO entrenados para el entorno Huggy con Unity ML-Agents, pero no se dispone de información sobre parámetros, contexto, rendimiento ni licencia para ninguno de ellos. La comparación se limita a la disponibilidad y al formato de los pesos.

## Limitaciones y advertencias

- La licencia no está especificada, lo que puede suponer una restricción para el uso comercial del modelo o de sus pesos.
- No se ha publicado información sobre la arquitectura de la red, el número de parámetros ni las condiciones de entrenamiento, lo que dificulta la reproducibilidad.
- El modelo solo funciona en el entorno Huggy y puede no generalizar a otros entornos o tareas.
- No se dispone de datos sobre sesgos, aunque al ser un agente de RL en un entorno de simulación, el riesgo de sesgo social es limitado.
- La model card no incluye advertencias sobre alucinaciones, ya que el modelo no genera texto.
- La información sobre requisitos de hardware y rendimiento es incompleta, por lo que es necesario realizar pruebas propias antes de su uso en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Mwampooo/ppo-Huggy
- Documentación de Unity ML-Agents: https://unity-technologies.github.io/ml-agents/ML-Agents-Toolkit-Documentation/
- Tutorial corto de Huggy (Deep RL Course): https://huggingface.co/learn/deep-rl-course/unitbonus1/introduction
- Tutorial largo de ML-Agents (Deep RL Course): https://huggingface.co/learn/deep-rl-course/unit5/introduction
- Repositorio de Unity ML-Agents: https://github.com/Unity-Technologies/ml-agents
