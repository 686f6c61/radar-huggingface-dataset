# lewjae/poca-SoccerTwos

## Resumen

poca-SoccerTwos es un agente entrenado con aprendizaje por refuerzo profundo (deep reinforcement learning) mediante la librería Unity ML-Agents, publicado en Hugging Face por el usuario lewjae. El modelo resuelve la tarea SoccerTwos, un entorno de fútbol 2 contra 2 incluido en los entornos oficiales de ML-Agents, donde dos equipos de agentes compiten por marcar goles en un campo reducido. El algoritmo empleado es POCA (POlicy Consolidation with Attention), una variante de PPO diseñada para entornos multijugador cooperativos y competitivos.

Se trata de un artefacto de política entrenada, no de un modelo de lenguaje: el repositorio contiene pesos exportados en formato ONNX (y presumiblemente .nn, el formato nativo de ML-Agents) que se cargan dentro del motor Unity para controlar a los agentes en tiempo de inferencia. Su relevancia es acotada al ámbito de la investigación en RL multiagente y a la docencia, ya que sirve como ejemplo reproducible de entrenamiento con ML-Agents y como referencia para experimentos de autojuego y consolidación de políticas.

El repositorio tiene un tamaño de 0,2 GB, cero descargas y cero likes en el momento de la consulta, y la model card es la plantilla estándar generada automáticamente por ML-Agents, sin documentación adicional sobre hiperparámetros, número de pasos de entrenamiento ni resultados obtenidos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal de política y valor para RL multiagente (algoritmo POCA sobre ML-Agents); arquitectura interna exacta no disponible |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (entorno de RL, no modelo de lenguaje) |
| Tipos de cuantizacion | no disponible; pesos exportados en ONNX y presumiblemente .nn para ML-Agents |
| Idiomas soportados | no aplica (no procesa lenguaje natural) |
| Licencia | no disponible |
| Formato de pesos | ONNX (tag `onnx`); formato nativo ML-Agents `.nn` presumiblemente incluido, no confirmado |
| Libreria | ml-agents |
| Entorno | SoccerTwos (Unity ML-Agents) |
| Algoritmo | POCA (según nombre del repositorio) |
| Tamano del repositorio | 0,2 GB |
| Fecha de publicacion | 2026-11-15 |

## Arquitectura y entrenamiento

El agente se entrena con POCA, un algoritmo de la familia de policy gradient implementado en Unity ML-Agents. POCA combina PPO con mecanismos de consolidación de políticas y atención entre agentes, pensados para escenarios multijugador donde varios agentes comparten o compiten por recompensas. En SoccerTwos, dos agentes por equipo actúan de forma coordinada con observaciones parciales del campo y recompensas basadas en goles y posesión.

No se dispone de información sobre el número de pasos de entrenamiento, la configuración del fichero YAML, el tamaño de las redes (capas ocultas, unidades), la composición del currículo de entrenamiento ni si se aplicaron técnicas de self-play, imitación o recompensas intrínsecas. La model card únicamente documenta cómo reanudar el entrenamiento con `mlagents-learn --resume` y cómo visualizar al agente en el navegador a través de la organización Unity en Hugging Face. No se han publicado curvas de TensorBoard ni métricas de convergencia en el repositorio.

## Capacidades

- Control de agentes en el entorno SoccerTwos de Unity ML-Agents: el modelo genera acciones de movimiento y disparo para dos agentes por equipo.
- Cooperación multiagente: POCA está diseñado para coordinar políticas entre agentes del mismo equipo.
- Competencia contra oponentes: el entorno SoccerTwos implica enfrentamiento directo entre dos equipos.
- Inferencia en tiempo real dentro del motor Unity mediante el formato ONNX o `.nn`.
- Reanudación del entrenamiento: compatible con `mlagents-learn --resume` usando el fichero de configuración original (no incluido en el repositorio).
- Visualización en el navegador a través de la plataforma de Hugging Face y la organización Unity.
- No soporta tool calling, function calling, agentes basados en lenguaje, razonamiento multi-paso simbólico, capacidades multilingües ni procesamiento de visión, audio o texto.

## Casos de uso

- Investigación en RL multiagente: sirve como punto de partida reproducible para estudiar POCA en entornos cooperativos-competitivos, comparando curvas de aprendizaje con otras variantes de PPO.
- Docencia y tutoriales de ML-Agents: el repositorio encaja en los cursos de deep RL de Hugging Face, que ya referencian SoccerTwos como entorno de ejemplo para enseñar entrenamiento y publicación de agentes.
- Evaluación de técnicas de self-play: el agente puede enfrentarse a versiones anteriores de sí mismo o a otros agentes publicados en el Hub para medir la robustez de la política.
- Benchmark de entornos Unity: permite comparar el rendimiento de distintos algoritmos (PPO, POCA, SAC) sobre el mismo entorno estandarizado.
- Demostraciones interactivas en navegador: al cargar el fichero ONNX en la plataforma de Unity en Hugging Face, se puede mostrar el comportamiento del agente sin instalación local.
- Base para fine-tuning con recompensas personalizadas: reanudando el entrenamiento con un YAML modificado se puede adaptar la política a variantes del entorno (campo más grande, reglas distintas).
- Pruebas de integración de ML-Agents en pipelines de CI: verificar que la carga del modelo y la inferencia funcionan en Unity antes de desplegar agentes en productos interactivos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precisión; el repositorio ocupa 0,2 GB, por lo que los pesos en sí son ligeros y caben en cualquier GPU consumer con al menos 1-2 GB libres, aunque el consumo real depende del motor Unity y del renderizado.
- GPU recomendadas: cualquier GPU compatible con Unity (GTX 1060 o superior, RTX 2060/3060/4090, A100/H100 para entrenamiento a gran escala). Para inferencia interactiva, una GPU consumer moderna es suficiente.
- Cabe en GPU consumer: sí, previsiblemente en cualquier GPU con soporte DirectX 11/12 o Vulkan y suficiente memoria para el motor Unity.
- Opciones de despliegue: Unity Editor o build standalone con el paquete ML-Agents; inferencia vía ONNX Runtime o el backend nativo `.nn` de ML-Agents; visualización en navegador mediante la plataforma de Hugging Face y Unity.
- Latencia y throughput: no disponibles. Dependen del hardware, del build de Unity y del número de agentes simulados en paralelo.

## Comparativa con modelos similares

| Modelo | Entorno | Algoritmo | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| lewjae/poca-SoccerTwos | SoccerTwos | POCA | ONNX / .nn | no disponible | Hugging Face, 0 descargas |
| Agentes SoccerTwos de la organizacion Unity | SoccerTwos | PPO (referencia) | .nn / ONNX | según repositorio | Hugging Face (organización Unity) |
| Agentes del curso Deep RL de Hugging Face | Varios (SoccerTwos, Huggy) | PPO / otros | .nn / ONNX | según repositorio | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la información proporcionada. La comparación se limita a entorno, algoritmo y formato de publicación.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados; en RL multiagente es habitual que la política se sobreajuste a las condiciones exactas del entrenamiento (mapa, oponentes, parámetros físicos) y falle ante variaciones.
- Riesgo de alucinación: no aplica en el sentido de modelos de lenguaje, pero sí existe riesgo de comportamientos degenerados o no generalizables fuera del entorno de entrenamiento.
- Limitaciones de contexto o idioma: no aplica; el modelo no procesa lenguaje.
- Restricciones de licencia: la licencia no está disponible, por lo que no se puede asumir uso comercial sin consultar al autor.
- Ausencia de documentación: no hay información sobre hiperparámetros, número de pasos, métricas de convergencia ni calidad final del agente; no se puede verificar su nivel de rendimiento.
- Repositorio sin tracción: cero descargas y cero likes, sin evidencia de validación por parte de la comunidad.
- Dependencia del entorno: el agente solo es funcional dentro de la versión concreta de ML-Agents y del entorno SoccerTwos con la que se entrenó; cambios de versión pueden romper la compatibilidad.
- Para producción: no se recomienda su uso como componente crítico sin una evaluación previa del comportamiento en el escenario objetivo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/lewjae/poca-SoccerTwos
- Documentación de ML-Agents: https://unity-technologies.github.io/ml-agents/ML-Agents-Toolkit-Documentation/
- Repositorio de ML-Agents: https://github.com/Unity-Technologies/ml-agents
- Tutorial corto del curso Deep RL de Hugging Face: https://huggingface.co/learn/deep-rl-course/unitbonus1/introduction
- Tutorial largo del curso Deep RL de Hugging Face: https://huggingface.co/learn/deep-rl-course/unit5/introduction
- Organización Unity en Hugging Face: https://huggingface.co/unity
