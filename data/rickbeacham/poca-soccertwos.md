# rickbeacham/poca-SoccerTwos

## Resumen

`poca-SoccerTwos` es un agente entrenado con el algoritmo POCA (Policy Optimization with Clipped Advantages) dentro del entorno SoccerTwos de Unity ML-Agents. Lo publica el usuario rickbeacham en Hugging Face y su propósito es jugar partidos de fútbol 2 contra 2 en un entorno de simulación física de Unity, no procesar lenguaje natural. Es un artefacto de reinforcement learning profundo, no un modelo de lenguaje: no genera texto ni mantiene conversaciones.

El repositorio ocupa 0,2 GB y contiene los pesos del agente en formato de ML-Agents (`.nn`/`.onnx`), junto con los eventos de TensorBoard del entrenamiento. La model card es la plantilla estándar que Hugging Face genera para agentes de ML-Agents y no incluye detalles sobre la arquitectura de la red, el número de parámetros ni la configuración de entrenamiento utilizada.

Su relevancia es acotada: sirve como ejemplo reproducible de entrenamiento de un agente multiagente competitivo en SoccerTwos y como punto de partida para quien quiera reanudar el entrenamiento o inspeccionar el comportamiento del agente en el visor web de Hugging Face. No es un modelo apto para producción de NLP ni para tareas fuera de este entorno de simulación.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Red neuronal de política/valor para ML-Agents (detalles no disponibles) |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (entorno de simulación, no modelo de lenguaje) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no aplica |
| Licencia | no disponible |
| Formato de pesos | `.nn` / `.onnx` (ML-Agents) |

## Arquitectura y entrenamiento

El agente se entrena con POCA, un algoritmo de policy gradient con ventajas recortadas, sobre el entorno SoccerTwos de Unity ML-Agents. SoccerTwos es un escenario multiagente de fútbol 2 contra 2 con observaciones vectoriales y acciones discretas, donde los agentes compiten por marcar goles. La model card no especifica el número de capas, el tamaño de las capas ocultas, el número de pasos de entrenamiento ni la composición de las recompensas.

El repositorio incluye los eventos de TensorBoard del entrenamiento, lo que permite inspeccionar curvas de recompensa y pérdidas, pero no se han publicado detalles técnicos adicionales (hiperparámetros, semillas, número de entornos paralelos) en la información disponible. No hay innovaciones técnicas documentadas más allá del uso estándar de POCA en ML-Agents.

## Capacidades

- Control de un agente en el entorno SoccerTwos de Unity ML-Agents.
- Política entrenada para el juego cooperativo-competitivo 2 contra 2.
- Salida de acciones discretas compatibles con el Brain del entorno.
- Ejecución en el visor web de Hugging Face para agentes de ML-Agents.
- Reanudación del entrenamiento mediante `mlagents-learn --resume`.
- No soporta tool calling, function calling, agentes de lenguaje, razonamiento multi-paso ni capacidades multilingües.
- No tiene modo thinking, visión, audio ni generación de texto.

## Casos de uso

- Reproducción de experimentos de RL multiagente: cargar el agente en el visor de Hugging Face para observar su comportamiento en SoccerTwos y compararlo con otras políticas publicadas.
- Reanudación de entrenamiento: usar el checkpoint como punto de partida con `mlagents-learn <config>.yaml --run-id=<id> --resume` para continuar el aprendizaje con nuevos hiperparámetros o recompensas.
- Docencia y divulgación: ejemplo práctico de POCA en un entorno competitivo de ML-Agents para cursos de reinforcement learning.
- Evaluación de robustez: someter al agente a variaciones del entorno (posición inicial, velocidad de la pelota) para medir su generalización.
- Baseline en investigación multiagente: comparar nuevas políticas contra este agente en partidos 2 contra 2.
- Integración en pipelines de simulación: exportar los pesos `.onnx` para ejecutarlos fuera de Unity en un runtime de inferencia propio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- Inferencia en CPU suficiente para ejecutar el agente en el visor web o en un runtime ONNX ligero; el tamaño del repo (0,2 GB) sugiere una red pequeña.
- GPU no imprescindible para inferencia; útil para reanudar el entrenamiento con múltiples entornos paralelos.
- Cabe en cualquier GPU consumer (RTX 3060 en adelante) e incluso en CPU para despliegue.
- Despliegue mediante Unity ML-Agents, el visor de Hugging Face (https://huggingface.co/unity) o un runtime ONNX (onnxruntime).
- Latencia y throughput no disponibles.

## Comparativa con modelos similares

| Modelo | Entorno | Algoritmo | Licencia | Disponibilidad |
|---|---|---|---|---|
| rickbeacham/poca-SoccerTwos | SoccerTwos | POCA | no disponible | Hugging Face |
| Agentes SoccerTwos de la organización unity | SoccerTwos | PPO/POCA (no especificado) | no disponible | Hugging Face (https://huggingface.co/unity) |
| Otros agentes ML-Agents de la comunidad | Varios entornos ML-Agents | PPO, SAC, POCA | variable | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estos agentes en la información proporcionada.

## Limitaciones y advertencias

- Específico del entorno SoccerTwos: no funciona fuera de él ni en otros escenarios de ML-Agents sin reentrenamiento.
- Sin licencia declarada: no se puede asumir uso comercial; conviene contactar con el autor antes de reutilizarlo.
- Sin información sobre sesgos ni robustez: no hay evaluación publicada de su comportamiento ante perturbaciones.
- Sin datos de entrenamiento: se desconoce el número de pasos, la semilla y la configuración, lo que dificulta la reproducibilidad.
- Model card genérica: no documenta arquitectura ni hiperparámetros.
- No es un modelo de lenguaje: no debe evaluarse con métricas de NLP ni usarse para generación de texto.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/rickbeacham/poca-SoccerTwos
- Documentación de ML-Agents: https://unity-technologies.github.io/ml-agents/ML-Agents-Toolkit-Documentation/
- Repositorio ML-Agents: https://github.com/Unity-Technologies/ml-agents
- Visor de agentes de Hugging Face: https://huggingface.co/unity
- Tutorial corto de ML-Agents: https://huggingface.co/learn/deep-rl-course/unitbonus1/introduction
- Tutorial largo de ML-Agents: https://huggingface.co/learn/deep-rl-course/unit5/introduction
