# lsdyna/poca-SoccerTwos

## Resumen

El modelo `lsdyna/poca-SoccerTwos` es un agente de aprendizaje por refuerzo profundo entrenado con la librería Unity ML-Agents para jugar al entorno SoccerTwos, un escenario de fútbol 2 contra 2 dentro del conjunto de entornos de Unity. El autor, `lsdyna`, ha publicado el modelo en Hugging Face con el pipeline de reinforcement-learning, y los archivos incluyen pesos en formato ONNX y posiblemente el `.nn` original de ML-Agents, junto con métricas de TensorBoard.

El modelo utiliza el algoritmo POCA (Proximal Policy Optimization with Curiosity and Apprenticeship? En realidad POCA es un algoritmo de ML-Agents que combina PPO con mecanismos de atención sobre agentes), aunque no se especifican los hiperparámetros ni la arquitectura exacta de la red neuronal. Es relevante como ejemplo de aplicación de RL en entornos multiagente cooperativos/competitivos, y puede servir para estudiar políticas entrenadas en SoccerTwos o como punto de partida para fine-tuning.

La model card es muy escueta y no incluye detalles técnicos más allá del nombre del algoritmo y el entorno. No se proporcionan benchmarks, licencia ni información sobre el dataset de entrenamiento, por lo que gran parte de la ficha deberá indicar "no disponible".

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal del algoritmo POCA (ML-Agents), detalles no disponibles |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (entorno de observaciones vectoriales, sin contexto de lenguaje) |
| Tipos de cuantizacion | no disponible (se publica como ONNX y posiblemente `.nn`) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | ONNX (`.onnx`) y posiblemente `.nn` de ML-Agents; el repo incluye también TensorBoard logs |

## Arquitectura y entrenamiento

El modelo está entrenado con el algoritmo POCA de Unity ML-Agents. POCA (Proximal Policy Optimization with Curiosity and Apprenticeship? En la documentación de ML-Agents, POCA es una variante de PPO que utiliza una función de valor centralizada y una política descentralizada, diseñada para entornos multiagente. Permite que cada agente tome decisiones basadas en sus propias observaciones mientras que el crítico centralizado tiene acceso a información global. Esto mejora la estabilidad del entrenamiento en escenarios cooperativos y competitivos como SoccerTwos.

No se han publicado detalles sobre la arquitectura de la red (número de capas, neuronas, funciones de activación), ni sobre el proceso de entrenamiento: número de pasos, configuración de hiperparámetros, recompensas, etc. La model card solo menciona que se usó ML-Agents y que el agente juega a SoccerTwos. Tampoco se indica si se aplicaron técnicas como curiosity o reward shaping más allá de lo que POCA pueda incluir por defecto.

## Capacidades

- Jugar al entorno SoccerTwos de Unity ML-Agents: controla un equipo de dos agentes en un partido de fútbol simplificado, coordinando acciones para marcar goles y defender.
- Política entrenada mediante aprendizaje por refuerzo: el agente ha aprendido una política que mapea observaciones del entorno (posiciones, velocidades, orientación, etc.) a acciones continuas o discretas.
- Soporte de inferencia en Unity: puede cargarse en el entorno Unity mediante ML-Agents para visualizar el comportamiento del agente.
- Exportación a ONNX: permite ejecutar el modelo fuera de Unity, por ejemplo con runtime de ONNX en Python, aunque no se documentan ejemplos de uso externo.
- No es un modelo de lenguaje ni de visión; no genera texto, código ni responde a prompts.

## Casos de uso

- Investigación en aprendizaje por refuerzo multiagente: el modelo puede servir como referencia de una política entrenada en SoccerTwos para comparar con otros algoritmos o para estudiar comportamientos emergentes en entornos competitivos.
- Fine-tuning en SoccerTwos: se puede reanudar el entrenamiento con `mlagents-learn --resume` para adaptar el agente a variantes del entorno o a recompensas modificadas.
- Demostración educativa: útil para cursos o tutoriales de RL, mostrando cómo un agente aprende a jugar un juego colaborativo/competitivo.
- Evaluación de políticas en Unity: permite cargar el modelo en el entorno SoccerTwos y medir su rendimiento frente a agentes heurísticos o entrenados con otros algoritmos.
- Pruebas de integración ONNX: al estar disponible en formato ONNX, se puede usar para validar pipelines de conversión o para ejecutar inferencia en motores externos (por ejemplo, ONNX Runtime en Python o C#).
- Benchmark de entornos ML-Agents: sirve como baseline para comparar el rendimiento de otros agentes en SoccerTwos, aunque no se han publicado métricas cuantitativas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de rendimiento (por ejemplo, tasa de victorias, goles promedio, recompensa acumulada) ni comparaciones con otros agentes. El repositorio contiene logs de TensorBoard que podrían contener curvas de entrenamiento, pero no se han extraído ni documentado en la tarjeta del modelo.

## Requisitos de hardware

- Para inferencia en Unity con ML-Agents: no se requieren GPUs potentes; el modelo es una red pequeña (típicamente menos de 1M de parámetros en SoccerTwos) y puede ejecutarse en CPU en tiempo real.
- Para reanudar el entrenamiento: se recomienda una GPU con al menos 4-8 GB de VRAM, dependiendo del número de agentes y del tamaño del batch. Una RTX 2060 o superior sería suficiente.
- Para inferencia ONNX fuera de Unity: puede ejecutarse en CPU sin problemas, aunque una GPU acelera la evaluación de múltiples agentes en paralelo.
- Opciones de despliegue: Unity ML-Agents (carga del `.nn` o `.onnx`), ONNX Runtime en Python/C#, y posiblemente conversión a TensorFlow Lite para dispositivos móviles.
- Latencia y throughput: no se han publicado datos; en CPU se espera una inferencia por paso de entorno en milisegundos, dado el tamaño reducido del modelo.

## Comparativa con modelos similares

No se dispone de información sobre otros modelos de agentes SoccerTwos en Hugging Face con los que comparar directamente. Existen otros repositorios con nombres similares, como `akanametov/SoccerTwos` o `dfm794/poca-SoccerTwos-2x-12-3-6-6-1-l`, pero no se han encontrado especificaciones técnicas públicas ni resultados de rendimiento. Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- No se ha publicado la licencia, por lo que se desconoce si el modelo puede usarse comercialmente. Se recomienda contactar con el autor antes de cualquier uso en producción.
- La model card no proporciona información sobre el proceso de entrenamiento, hiperparámetros ni configuración del entorno, lo que dificulta la reproducibilidad.
- El modelo está especializado exclusivamente en SoccerTwos; no es transferible a otras tareas sin reentrenamiento completo.
- Al ser un agente de RL, su comportamiento puede ser frágil ante cambios en el entorno (física, tiempos de paso, observaciones) y puede presentar comportamientos no deseados o explotar bugs del entorno.
- No se han documentado sesgos ni riesgos de alucinación (al no ser un modelo generativo de lenguaje), pero sí existe riesgo de sobreajuste al entorno específico de entrenamiento.
- El repositorio tiene 0 descargas y 0 likes, lo que sugiere que no ha sido validado por la comunidad.
- No se incluyen instrucciones claras de uso fuera de Unity; la documentación se limita a comandos de reanudación y visualización en el navegador.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/lsdyna/poca-SoccerTwos
- Documentación de Unity ML-Agents: https://unity-technologies.github.io/ml-agents/ML-Agents-Toolkit-Documentation/
- Curso de RL de Hugging Face (tutorial corto): https://huggingface.co/learn/deep-rl-course/unitbonus1/introduction
- Curso de RL de Hugging Face (tutorial largo): https://huggingface.co/learn/deep-rl-course/unit5/introduction
- Repositorio de ML-Agents en GitHub: https://github.com/Unity-Technologies/ml-agents
