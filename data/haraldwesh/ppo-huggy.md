# haraldwesh/ppo-Huggy

## Resumen

`haraldwesh/ppo-Huggy` es un agente de aprendizaje por refuerzo entrenado con el algoritmo PPO (Proximal Policy Optimization) sobre el entorno Huggy de Unity ML-Agents. No es un modelo de lenguaje ni un modelo generativo: es una política neuronal que controla a un perro virtual ("Huggy") para que aprenda a recoger un palo y devolverlo, un caso clásico de control continuo dentro del ecosistema de simulación de Unity.

El modelo lo publica el usuario `haraldwesh` en Hugging Face y se distribuye con la librería `ml-agents`, junto con ficheros de pesos en formato `.nn` y `.onnx` y trazas de TensorBoard. El repositorio ocupa 0,2 GB, lo que es coherente con una red neuronal pequeña típica de este tipo de entornos, muy lejos de los cientos de miles de millones de parámetros de un LLM.

Su relevancia es fundamentalmente didáctica y de investigación en RL: sirve como referencia reproducible de un agente PPO entrenado en un entorno estándar de ML-Agents, permite reanudar el entrenamiento con `mlagents-learn --resume` y puede visualizarse directamente en el navegador a través de la integración de Hugging Face con Unity. No hay información sobre licencia, idiomas ni benchmarks de rendimiento en la información disponible.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal de política PPO para ML-Agents (detalles de capas no disponibles) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (agente de RL, no modelo de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no procesa lenguaje natural) |
| Licencia | no disponible |
| Formato de pesos | `.nn` y `.onnx` (ML-Agents) |

## Arquitectura y entrenamiento

El agente se entrena con PPO, un algoritmo de gradiente de política con recorte de la ratio de probabilidad (*clipped surrogate objective*) que busca actualizaciones estables y de paso limitado. En ML-Agents, la política suele implementarse como una red *fully connected* con observaciones vectoriales (posición y velocidad del agente, del palo y del objetivo) y acciones continuas (movimiento y orientación). El entorno Huggy es un escenario de *fetch* en 3D donde el agente debe localizar el palo, recogerlo y llevarlo a una zona de entrega.

No se dispone de información sobre el número de pasos de entrenamiento, la composición del dataset (en RL no hay dataset estático, sino experiencia generada por interacción), hiperparámetros concretos ni si se aplicaron técnicas adicionales como *reward shaping* o currículo. El repositorio incluye trazas de TensorBoard que permiten inspeccionar la curva de recompensa y las métricas de entrenamiento, pero los valores no están publicados en la información disponible.

## Capacidades

- Control de un agente virtual en el entorno Huggy de Unity ML-Agents mediante acciones continuas.
- Política entrenada con PPO lista para inferencia en Unity o en el visor web de Hugging Face.
- Reanudación del entrenamiento con `mlagents-learn <config>.yaml --run-id=<id> --resume`.
- Exportación a ONNX para despliegue fuera del runtime de ML-Agents.
- Visualización interactiva en el navegador a través de la integración de Hugging Face con Unity.
- No soporta generación de texto, código, matemáticas, visión, tool calling ni razonamiento multi-paso.

## Casos de uso

- Docencia de aprendizaje por refuerzo: sirve como ejemplo reproducible de un agente PPO entrenado en un entorno estándar, útil para cursos y tutoriales de ML-Agents.
- Reproducción de experimentos: el checkpoint permite reanudar el entrenamiento y comparar curvas de recompensa frente a nuevas configuraciones de hiperparámetros.
- Punto de partida para *fine-tuning*: se puede continuar el entrenamiento con variaciones del entorno (posición del palo, fricción, recompensas) para estudiar transferencia.
- Evaluación de políticas en navegador: mediante el visor de Hugging Face se puede comprobar cualitativamente el comportamiento del agente sin instalar Unity.
- Despliegue en aplicaciones Unity: el fichero `.onnx` permite integrar la política en un proyecto de Unity para prototipos de NPCs o demos interactivas.
- Investigación en *reward shaping*: al disponer de un baseline PPO en Huggy, se pueden medir mejoras introducidas por funciones de recompensa alternativas.
- Benchmarking de algoritmos: comparar PPO con SAC, DDPG u otros algoritmos sobre el mismo entorno usando este agente como referencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible; por el tamaño del repositorio (0,2 GB) y la naturaleza del entorno, la inferencia cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: cualquier GPU compatible con Unity o con ONNX Runtime; para entrenamiento se recomienda al menos una GPU dedicada (por ejemplo, RTX 3060 o superior) para acelerar la simulación.
- Cabe en GPU consumer: sí, con total seguridad, dado el tamaño reducido de la política.
- Opciones de despliegue: Unity ML-Agents (`mlagents-learn`), ONNX Runtime, visor web de Hugging Face con Unity.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Entorno | Algoritmo | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| haraldwesh/ppo-Huggy | Huggy (ML-Agents) | PPO | `.nn`, `.onnx` | no disponible | Hugging Face |
| Kev3010/ppo-Huggy | Huggy (ML-Agents) | PPO | `.nn`, `.onnx` | no disponible | Hugging Face |
| Tokess/ppo-Huggy | Huggy (ML-Agents) | PPO | `.nn`, `.onnx` | no disponible | Hugging Face |

Los tres modelos son variantes del mismo agente PPO sobre Huggy; las diferencias de rendimiento entre ellos no están documentadas en la información disponible.

## Limitaciones y advertencias

- Es un agente de RL específico para el entorno Huggy; no generaliza a otras tareas ni entornos sin reentrenamiento.
- No procesa lenguaje natural ni imágenes; no es un modelo de propósito general.
- No hay información sobre licencia, por lo que el uso comercial queda sin garantías legales explícitas.
- El rendimiento real depende de la configuración exacta del entorno Unity (versión de ML-Agents, parámetros de simulación) y puede degradarse si esta difiere de la usada en el entrenamiento.
- Al ser un modelo con 0 descargas y 0 likes, no hay evidencia de validación por parte de la comunidad.
- Riesgo de sobreajuste a la política de recompensa original: cambios en la función de recompensa invalidan el comportamiento aprendido.
- No se han publicado métricas de recompensa media ni de tasa de éxito, por lo que no se puede evaluar cuantitativamente su calidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/haraldwesh/ppo-Huggy
- Documentación de ML-Agents: https://unity-technologies.github.io/ml-agents/ML-Agents-Toolkit-Documentation/
- Tutorial corto (Huggy en el navegador): https://huggingface.co/learn/deep-rl-course/unitbonus1/introduction
- Tutorial largo de ML-Agents: https://huggingface.co/learn/deep-rl-course/unit5/introduction
- Repositorio ML-Agents: https://github.com/Unity-Technologies/ml-agents
- Visor de agentes Unity en Hugging Face: https://huggingface.co/unity
- Modelo similar (Kev3010): https://huggingface.co/Kev3010/ppo-Huggy
- Modelo similar (Tokess): https://huggingface.co/Tokess/ppo-Huggy
