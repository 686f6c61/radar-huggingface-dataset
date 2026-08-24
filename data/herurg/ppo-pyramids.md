# herurg/ppo-Pyramids

## Resumen

El modelo `herurg/ppo-Pyramids` es un agente de aprendizaje por refuerzo entrenado con el algoritmo PPO (Proximal Policy Optimization) para resolver el entorno Pyramids de Unity ML-Agents. Este entorno presenta un desafío de navegación en 3D donde el agente debe localizar una pirámide dorada en un espacio con obstáculos y recogerla, mientras se enfrenta a un entorno con recompensas dispersas y un objetivo que cambia de posición en cada episodio.

El modelo fue desarrollado por el usuario `herurg` y publicado en HuggingFace como parte del ecosistema de Unity ML-Agents, que permite entrenar agentes inteligentes en entornos de simulación física. La relevancia de este modelo reside en que demuestra la aplicación de PPO a un problema de navegación con observaciones vectoriales (raycast) y proporciona un ejemplo reproducible de entrenamiento y despliegue de agentes de RL en entornos Unity, un flujo de trabajo cada vez más utilizado en robótica, juegos y simulación.

El repositorio contiene los pesos del modelo en formato ONNX y la red neuronal entrenada, lista para ser integrada en el entorno Unity o para continuar su entrenamiento. La arquitectura subyacente es una red neuronal de tipo MLP (perceptrón multicapa) de 2 capas con 512 unidades cada una, que procesa las observaciones del entorno (raycasts y one-hot del objetivo) para producir acciones discretas de movimiento.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MLP (2 capas de 512 unidades) |
| Parametros totales | no disponible (red pequeña, estimacion < 1M) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no aplica, es un agente de RL) |
| Tipos de cuantizacion | no disponible (formato ONNX nativo) |
| Idiomas soportados | no disponible (no aplica, es un modelo de agente) |
| Licencia | no disponible |
| Formato de pesos | ONNX, .nn (ML-Agents) |

## Arquitectura y entrenamiento

El modelo se basa en el algoritmo PPO (Proximal Policy Optimization) implementado en la libreria Unity ML-Agents. La politica se representa mediante una red neuronal MLP con 2 capas ocultas de 512 unidades cada una, que procesa un vector de observacion de 172 dimensiones. Este vector incluye percepciones por raycast (deteccion de distancia a objetos y paredes) y una codificacion one-hot de la posicion del objetivo (la piramide). La salida es una politica de acciones discretas para el control del agente.

El entrenamiento se realizo en el entorno Pyramids de Unity, un escenario de navegacion con recompensas dispersas: el agente recibe una recompensa positiva al recoger la piramide y una recompensa negativa si toca una caja roja (trampa). El proceso de entrenamiento utilizo el algoritmo PPO con las configuraciones por defecto de ML-Agents, incluyendo normalizacion de observaciones y entrenamiento por episodios. No se ha publicado informacion sobre el numero de tokens de entrenamiento ni sobre el uso de tecnicas de RLHF o DPO, ya que se trata de un entrenamiento de RL clasico y no de un modelo de lenguaje.

## Capacidades

- Navegacion en entornos 3D: el agente puede moverse en un espacio tridimensional y navegar hacia un objetivo.
- Percepcion por raycast: utiliza observaciones de raycast para detectar obstaculos y el objetivo, permitiendo navegacion reactiva.
- Decisiones discretas: genera acciones de movimiento (avanzar, girar) a partir de la observacion del entorno.
- Recompensa optimizada: entrenado para maximizar la recompensa acumulada en el entorno Pyramids, equilibrando la recoleccion de la piramide y la evitacion de trampas.
- Integracion con Unity: el modelo se puede ejecutar directamente en el entorno Unity mediante el toolkit de ML-Agents.
- Continuidad de entrenamiento: el repositorio permite reanudar el entrenamiento con `mlagents-learn --resume`.

## Casos de uso

- Investigacion en aprendizaje por refuerzo: el modelo sirve como ejemplo de referencia para estudiar el comportamiento de PPO en tareas de navegacion con recompensas dispersas. Los investigadores pueden analizar las politicas aprendidas y comparar con otros algoritmos.
- Desarrollo de agentes para videojuegos: el flujo de entrenamiento y despliegue puede replicarse para crear NPCs o agentes en juegos Unity que necesiten navegar en entornos 3D con objetivos dinamicos.
- Benchmark para algoritmos de RL: el entorno Pyramids es un benchmark clasico en ML-Agents; este modelo proporciona una politica de referencia que puede servir de baseline para evaluar mejoras en algoritmos de RL.
- Simulacion de robots en Unity: el enfoque de raycast y control discreto se puede adaptar para simular robots de navegacion en entornos virtuales antes de desplegarlos en el mundo real.
- Educacion en IA: el modelo y su documentacion son un recurso didactico para ensenar conceptos de RL, PPO y ML-Agents en cursos universitarios o talleres.
- Demostraciones interactivas: el modelo se puede visualizar directamente en el navegador a traves de la pagina de HuggingFace, permitiendo demostrar el comportamiento del agente a una audiencia no tecnica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se dispone de datos de rendimiento comparativos como MMLU, HumanEval o GSM8K, ya que este modelo no es un modelo de lenguaje sino un agente de aprendizaje por refuerzo. El rendimiento se mide en terminos de recompensa acumulada en el entorno Pyramids, pero estos datos no estan disponibles en la documentacion publica.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo es muy ligero (menos de 1M de parametros). Puede ejecutarse en CPU sin necesidad de GPU, con un uso de memoria inferior a 50 MB.
- GPU recomendada: no se requiere GPU para inferencia. Si se usa, cualquier GPU con al menos 2 GB de VRAM es suficiente, aunque la inferencia en CPU es perfectamente viable.
- Compatibilidad con consumer GPU: el modelo es compatible con cualquier GPU consumer (RTX 20/30/40 series, GTX 10/16 series) y tambien con CPU.
- Opciones de despliegue: el modelo se ejecuta en Unity ML-Agents con el archivo `.onnx` o `.nn`. Tambien se puede usar en Python con ONNX Runtime para pruebas fuera de Unity.
- Latencia y throughput: la inferencia es practicamente instantanea (menos de 1 ms por paso en CPU) gracias al tamano reducido de la red.

## Comparativa con modelos similares

| Modelo | Algoritmo | Entorno | Arquitectura | Observaciones | Licencia |
|---|---|---|---|---|---|
| `herurg/ppo-Pyramids` | PPO | Pyramids | MLP 2x512 | 172 (raycast + one-hot) | no disponible |
| `lukasheuer/ppo-pyramids` | PPO | Pyramids | MLP (no especificado) | no especificado | no disponible |
| `thaslimshaik/ppo-Pyramids` | PPO | Pyramids | MLP (no especificado) | no especificado | no disponible |

Los tres modelos son agentes entrenados para el mismo entorno Pyramids con el mismo algoritmo PPO. No hay datos publicos que permitan comparar su rendimiento relativo, aunque es probable que todos tengan un comportamiento similar al converger a la misma politica optima.

## Limitaciones y advertencias

- Especificidad del entorno: el modelo esta entrenado exclusivamente para el entorno Pyramids de Unity. No puede generalizar a otros entornos ni tareas sin reentrenamiento.
- Riesgo de sobreajuste: el modelo puede haber sobreajustado a las caracteristicas especificas del entorno (posicion de las piramides, configuracion de obstaculos) y puede no funcionar bien en variaciones no vistas.
- Sin soporte de lenguaje o vision: no es un modelo de lenguaje ni de vision; solo procesa observaciones vectoriales de raycast y acciones discretas.
- Licencia no disponible: el autor no ha especificado la licencia, por lo que el uso comercial del modelo es legalmente incierto. Se recomienda contactar al autor para aclarar los terminos.
- Documentacion limitada: no se proporcionan detalles sobre el proceso de entrenamiento (hiperparametros, numero de episodios, curva de recompensa), lo que dificulta la reproduccion exacta.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/herurg/ppo-Pyramids
- Documentacion de ML-Agents: https://unity-technologies.github.io/ml-agents/ML-Agents-Toolkit-Documentation/
- Tutorial corto del Deep RL Course: https://huggingface.co/learn/deep-rl-course/unitbonus1/introduction
- Tutorial largo del Deep RL Course: https://huggingface.co/learn/deep-rl-course/unit5/introduction
- Repositorio de Unity ML-Agents: https://github.com/Unity-Technologies/ml-agents
