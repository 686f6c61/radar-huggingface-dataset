# Maram8/poca-SoccerTwos

## Resumen

El modelo `Maram8/poca-SoccerTwos` es un agente de aprendizaje por refuerzo profundo entrenado con la librería Unity ML-Agents para jugar al entorno SoccerTwos, un escenario de fútbol simulado en Unity donde dos equipos de dos agentes compiten por marcar goles. El agente utiliza el algoritmo POCA (Probabilistic Off-policy Multi-agent Critic Adaptation), una variante de PPO diseñada para entornos multiagente que permite entrenar políticas cooperativas y competitivas de forma estable.

Este modelo es relevante para la comunidad de investigación en RL porque demuestra la aplicación práctica de ML-Agents en un entorno multiagente con dinámicas de equipo, y su publicación en Hugging Face facilita la reproducibilidad y la comparación con otros agentes entrenados en el mismo entorno. El repositorio tiene un tamaño de 0,1 GB e incluye los pesos del modelo en formato ONNX, listos para ser cargados en Unity o en el visor web de Hugging Face. No se dispone de información sobre la arquitectura interna, el número de parámetros ni la licencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (agente RL basado en red neuronal, algoritmo POCA) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (entorno de observacion continua, sin contexto textual) |
| Tipos de cuantizacion | no disponible (pesos en formato ONNX, sin cuantizacion publicada) |
| Idiomas soportados | no disponible (modelo de RL, no procesa lenguaje) |
| Licencia | no disponible |
| Formato de pesos | ONNX (`.onnx`) y posiblemente `.nn` (Unity ML-Agents) |

## Arquitectura y entrenamiento

El modelo se entrena con el algoritmo POCA, implementado en Unity ML-Agents. POCA es una extensión de PPO (Proximal Policy Optimization) para entornos multiagente que utiliza un crítico centralizado con información de todos los agentes y un actor descentralizado por agente. Esto permite que cada agente aprenda una política individual mientras el crítico evalúa la acción conjunta, lo que mejora la estabilidad en tareas cooperativas y competitivas como SoccerTwos.

El entorno SoccerTwos consiste en dos equipos de dos agentes que deben cooperar para marcar goles y defender su portería. El entrenamiento se realiza mediante aprendizaje por refuerzo con recompensas basadas en eventos del juego (goles, posesión, etc.). No se dispone de detalles sobre el número de pasos de entrenamiento, la composición del dataset de experiencias ni si se aplicaron técnicas adicionales como curriculum learning o reward shaping. El modelo se publica en formato ONNX, que es el estándar de exportación de ML-Agents para su uso en Unity y en el visor web de Hugging Face.

## Capacidades

- Jugar al fútbol simulado en el entorno SoccerTwos de Unity, controlando un agente en un equipo de dos.
- Cooperar con un compañero de equipo para marcar goles y defender la portería.
- Tomar decisiones en tiempo real basadas en observaciones continuas del entorno (posiciones, velocidades, orientación, etc.).
- Competir contra otro equipo de dos agentes en un escenario multiagente.
- Inferencia en tiempo real mediante el runtime de ML-Agents en Unity o mediante el visor web de Hugging Face.
- No tiene capacidades de procesamiento de lenguaje, visión ni generación de texto, ya que es un modelo puramente de control motor.

## Casos de uso

- Investigacion en aprendizaje por refuerzo multiagente: el modelo sirve como punto de partida para estudiar comportamientos cooperativos y competitivos en entornos simulados, permitiendo comparar con otros agentes POCA o PPO en SoccerTwos.
- Desarrollo de agentes para juegos deportivos simulados: puede integrarse en proyectos Unity que requieran NPCs con comportamiento realista en deportes de equipo, como fútbol, baloncesto o hockey.
- Evaluacion de algoritmos de RL: al estar disponible en Hugging Face, se puede utilizar como baseline para probar nuevas variantes de algoritmos multiagente o técnicas de regularizacion.
- Educacion en RL: el modelo y su entorno son adecuados para cursos y tutoriales que enseñan a entrenar agentes con ML-Agents, como los cursos de Hugging Face Deep RL.
- Benchmarking de entornos Unity: permite medir el rendimiento de diferentes configuraciones de hardware o de versiones de ML-Agents al ejecutar el agente en el entorno SoccerTwos.
- Demostraciones interactivas: se puede cargar en el visor web de Hugging Face para que usuarios no tecnicos observen el comportamiento del agente en el navegador, util para divulgacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se dispone de metricas como tasa de victorias, goles por partido o recompensa media obtenida durante el entrenamiento. El autor no ha incluido graficas de TensorBoard ni comparaciones con otros agentes en la model card.

## Requisitos de hardware

- El tamaño del repositorio es de 0,1 GB, lo que sugiere un modelo de pequenas dimensiones (tipicamente redes con menos de 1 millon de parametros en ML-Agents).
- Para inferencia en Unity, se requiere una GPU con soporte para DirectX 11 o Vulkan, aunque el modelo ONNX puede ejecutarse en CPU con rendimiento aceptable dado su tamano reducido.
- Para entrenamiento desde cero, se recomienda una GPU con al menos 4 GB de VRAM (por ejemplo, GTX 1650 o superior) y CPU con 4 nucleos, aunque los requisitos exactos dependen de la configuracion del entorno Unity.
- Opciones de despliegue: Unity ML-Agents (runtime nativo), visor web de Hugging Face (https://huggingface.co/unity), o cualquier runtime ONNX compatible (ONNX Runtime, TensorRT).
- No se dispone de datos de latencia o throughput especificos para este modelo.

## Comparativa con modelos similares

Existen otros modelos publicados en Hugging Face con el mismo nombre y entorno, entrenados por diferentes autores. No se dispone de datos comparativos de rendimiento entre ellos.

| Modelo | Autor | Algoritmo | Entorno | Formato | Licencia |
|---|---|---|---|---|---|
| poca-SoccerTwos | Maram8 | POCA | SoccerTwos | ONNX | no disponible |
| poca-SoccerTwos | akanametov | POCA | SoccerTwos | ONNX | no disponible |
| poca-SoccerTwos | huanvo88 | POCA | SoccerTwos | ONNX | no disponible |
| poca-SoccerTwos | ByteExplorer | POCA | SoccerTwos | ONNX | no disponible |

No se dispone de informacion sobre diferencias en arquitectura, tamano o rendimiento entre estos modelos. Todos parecen seguir la misma plantilla de model card generada por el curso de Hugging Face.

## Limitaciones y advertencias

- El modelo esta entrenado exclusivamente para el entorno SoccerTwos de Unity; no es transferible a otros entornos o tareas sin reentrenamiento.
- No se dispone de informacion sobre la licencia, por lo que su uso comercial puede estar restringido o requerir consulta con el autor.
- No se han publicado metricas de rendimiento, por lo que no se puede evaluar su calidad objetiva frente a otros agentes.
- El modelo puede presentar comportamientos suboptimos o fallos en situaciones no vistas durante el entrenamiento, como cambios en la fisica del entorno o en las reglas del juego.
- Al ser un modelo de RL, no tiene capacidad de razonamiento simbolico ni de explicar sus decisiones; su comportamiento es puramente reactivo a las observaciones.
- La fecha de creacion (2026-08-31) es posterior a la fecha actual, lo que sugiere que el modelo podria ser un artefacto de prueba o un error en la metadata; se recomienda verificar su validez antes de usarlo en produccion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Maram8/poca-SoccerTwos
- Documentacion de Unity ML-Agents: https://unity-technologies.github.io/ml-agents/ML-Agents-Toolkit-Documentation/
- Repositorio de ML-Agents: https://github.com/Unity-Technologies/ml-agents
- Curso de Deep RL de Hugging Face (unidad 5, ML-Agents): https://huggingface.co/learn/deep-rl-course/unit5/introduction
- Tutorial de Huggy the Dog: https://huggingface.co/learn/deep-rl-course/unitbonus1/introduction
- Visor web de agentes Unity: https://huggingface.co/unity
