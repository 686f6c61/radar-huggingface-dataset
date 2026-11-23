# emh11/ppo-Huggy

## Resumen

`emh11/ppo-Huggy` es un agente de aprendizaje por refuerzo entrenado con el algoritmo PPO (Proximal Policy Optimization) sobre el entorno Huggy, uno de los escenarios oficiales de Unity ML-Agents. Lo desarrolla el usuario emh11 y lo publica en Hugging Face Hub dentro de la categoría de modelos de reinforcement learning. No es un modelo de lenguaje: es una política neuronal que controla a un perro virtual (Huggy) para que aprenda a perseguir y atrapar un palo, un caso clásico de control continuo con recompensa escasa.

El artefacto se distribuye en formato nativo de ML-Agents (ficheros `.nn` y exportación `.onnx`), lo que permite cargarlo directamente en Unity o visualizarlo en el navegador mediante el visor de Hugging Face. El repositorio ocupa 0,2 GB y no incluye model card detallada más allá de las instrucciones de uso estándar generadas por la librería `ml-agents`.

Su relevancia es fundamentalmente didáctica: sirve como ejemplo reproducible de un pipeline completo de entrenamiento con ML-Agents (definición de observaciones, acciones, recompensas y currículo) y como punto de partida para quienes quieren entender cómo se publica y se reutiliza un agente entrenado en el Hub. No aporta innovaciones en arquitectura ni en algoritmos, y no debe confundirse con un modelo generativo.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Red neuronal de política y valor para PPO (ML-Agents); detalles de capas no disponibles |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (no es un modelo de lenguaje; el agente observa un vector de estado por paso) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no aplica |
| Licencia | no disponible |
| Formato de pesos | `.nn` (formato nativo de ML-Agents) y `.onnx` |
| Algoritmo | PPO (Proximal Policy Optimization) |
| Entorno | Huggy (Unity ML-Agents) |
| Librería | ml-agents |
| Tamaño del repositorio | 0,2 GB |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El agente se entrena con PPO, un algoritmo de gradiente de política con recorte de la ratio de probabilidad (*clipped surrogate objective*) que estabiliza las actualizaciones y es el estándar de facto en ML-Agents para entornos con acciones continuas y discretas. La política consume las observaciones definidas por el entorno Huggy (posición y velocidad relativas del agente, del palo y del objetivo, además de raycasts de percepción) y produce las acciones de movimiento. La red suele combinar capas fully-connected con normalización de observaciones y, opcionalmente, memoria recurrente; la model card no especifica la configuración exacta de capas, unidades ni si se usó LSTM.

No se dispone de información sobre el número de pasos de entrenamiento, la composición del currículo, hiperparámetros (learning rate, batch size, horizonte, epochs), ni sobre técnicas adicionales como reward shaping, curiosity o self-play. Tampoco se documenta si el entrenamiento se reanudó o se ajustó con configuraciones personalizadas. El repositorio incluye los artefactos de TensorBoard habituales de ML-Agents, pero no se han publicado métricas en la información disponible.

## Capacidades

- Control de un agente virtual en el entorno Huggy: perseguir el palo, orientarse y alcanzarlo.
- Política entrenada para acciones continuas de movimiento (traslación y rotación).
- Exportación a ONNX para inferencia fuera de Unity (por ejemplo, en Python con `onnxruntime`).
- Compatibilidad con el visor web de Hugging Face para reproducir la partida en el navegador.
- Reanudación del entrenamiento mediante `mlagents-learn --resume`.
- No soporta tool calling, function calling, agentes multi-paso, multilingüismo ni generación de texto: no es un modelo de lenguaje.

## Casos de uso

- Docencia de reinforcement learning: usar el agente como ejemplo resuelto para explicar el ciclo observación-acción-recompensa en PPO dentro de un curso introductorio.
- Reproducción de experimentos: cargar el `.nn` en Unity y comparar el comportamiento con una política entrenada desde cero para medir la influencia de hiperparámetros.
- Punto de partida para *fine-tuning*: reanudar el entrenamiento con `--resume` y modificar la recompensa o el currículo para estudiar cómo cambia la política resultante.
- Integración en demos interactivas: incrustar el `.onnx` en una aplicación web o en un motor de inferencia ligero para mostrar un agente jugando en tiempo real.
- Evaluación de robustez: someter al agente a variaciones del entorno (fricción, posición inicial del palo) para analizar su generalización y documentar fallos.
- Benchmarking de ML-Agents: usar el agente como línea base al comparar configuraciones de PPO, SAC u otros algoritmos en el mismo escenario.
- Material para el Hub: ejemplo de estructura de repositorio (`configuration.yaml`, checkpoints, TensorBoard, `.onnx`) que otros autores pueden replicar al publicar sus propios agentes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye recompensa media, tasa de éxito, número de pasos hasta convergencia ni comparaciones con otras políticas sobre Huggy.

## Requisitos de hardware

- Inferencia en CPU: suficiente para ejecutar el `.onnx` en tiempo real; el agente es una red pequeña y no requiere GPU.
- GPU: no necesaria para inferencia; para reentrenamiento se recomienda al menos una GPU consumer (RTX 3060 o superior) por comodidad, aunque ML-Agents puede entrenar en CPU con tiempos mayores.
- Memoria: el repositorio ocupa 0,2 GB; la inferencia en memoria es del orden de decenas de MB.
- Despliegue: Unity ML-Agents (runtime nativo), `onnxruntime` en Python, o el visor web de Hugging Face.
- Latencia y throughput: no disponibles; dependen del hardware y del motor de inferencia.

## Comparativa con modelos similares

| Modelo | Entorno | Algoritmo | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| emh11/ppo-Huggy | Huggy | PPO | `.nn`, `.onnx` | no disponible | Hugging Face Hub |
| unity/ML-Agents Huggy (agentes oficiales) | Huggy | PPO | `.nn`, `.onnx` | según ML-Agents | Hugging Face (org. unity) |
| Agentes PPO de la unidad 5 del curso Deep RL | Huggy / otros | PPO | `.nn` | según curso | Hugging Face Learn |

La comparación se limita a otros agentes del mismo entorno y algoritmo, ya que no existen alternativas equivalentes fuera del ecosistema ML-Agents. No se dispone de datos de rendimiento para establecer diferencias cuantitativas entre ellos.

## Limitaciones y advertencias

- Específico del entorno Huggy: la política no se transfiere a otras tareas sin reentrenamiento.
- Sin model card técnica: no hay información sobre hiperparámetros, semillas, número de pasos ni métricas de convergencia, lo que dificulta la reproducibilidad.
- Licencia no declarada: no se puede asumir uso comercial; conviene contactar con el autor antes de reutilizarlo en producción.
- Cero descargas y cero likes: no hay evidencia de validación por parte de la comunidad.
- Riesgo de sobreajuste al currículo de entrenamiento: el comportamiento puede degradarse ante cambios en la física o en la posición inicial del palo.
- No es un modelo de lenguaje: no admite prompts, texto, tool calling ni razonamiento simbólico.
- Fecha de creación futura (2026-11-23) en los metadatos: conviene verificar la integridad del repositorio antes de confiar en él.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/emh11/ppo-Huggy
- Documentación de ML-Agents: https://unity-technologies.github.io/ml-agents/ML-Agents-Toolkit-Documentation/
- Repositorio ML-Agents: https://github.com/Unity-Technologies/ml-agents
- Tutorial corto (Huggy en el navegador): https://huggingface.co/learn/deep-rl-course/unitbonus1/introduction
- Tutorial largo de ML-Agents: https://huggingface.co/learn/deep-rl-course/unit5/introduction
- Organización Unity en Hugging Face: https://huggingface.co/unity
