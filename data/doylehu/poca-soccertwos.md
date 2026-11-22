# DoyleHu/poca-SoccerTwos

## Resumen

`DoyleHu/poca-SoccerTwos` es un agente de aprendizaje por refuerzo entrenado con la librería Unity ML-Agents para el entorno `SoccerTwos`, un escenario de fútbol 2 contra 2 en el que dos equipos de agentes compiten por marcar gol. El modelo lo publica el usuario DoyleHu en Hugging Face y sigue el flujo estándar de la comunidad ML-Agents: entrenamiento con el algoritmo POCA (Policy Optimization with Clipped Advantage, la variante de PPO implementada en ML-Agents) y exportación de los pesos a formato `.nn`/`.onnx` para su ejecución dentro de Unity o en el visor web de Hugging Face.

No se trata de un modelo de lenguaje ni de un modelo fundacional: es una política neuronal compacta que mapea observaciones del entorno (posiciones, velocidades y estado del balón) a acciones discretas de movimiento y patada. Por tanto, su interés es acotado al ámbito del reinforcement learning aplicado a entornos de simulación física, y resulta útil como referencia reproducible de un entrenamiento multiagente con recompensa competitiva y autoaprendizaje por equipos.

El repositorio ocupa 0,2 GB y no incluye información sobre hiperparámetros, número de pasos de entrenamiento, tasa de victorias ni configuración del fichero YAML usado. La model card es la plantilla automática que genera ML-Agents al publicar un agente, sin métricas ni detalles del proceso.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal de política ML-Agents (POCA, variante de PPO) para observaciones vectoriales y acciones discretas |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (entorno de RL, no modelo de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica |
| Licencia | no disponible |
| Formato de pesos | `.nn` y `.onnx` (ML-Agents / Unity Barracuda) |

## Arquitectura y entrenamiento

El agente se entrena con ML-Agents usando POCA, el algoritmo de optimización de política con ventaja recortada que la librería emplea por defecto en escenarios competitivos y de autoaprendizaje. La política consume observaciones vectoriales del entorno `SoccerTwos` (estado de los agentes y del balón) y produce acciones discretas de desplazamiento y patada. El escenario `SoccerTwos` es un entorno multiagente por equipos, habitualmente entrenado con autoaprendizaje (self-play) y recompensas basadas en posesión, gol y resultado del episodio.

No se dispone de información sobre el número de pasos de entrenamiento, la composición del currículo, los hiperparámetros del fichero YAML, el tamaño de las capas ocultas ni si se aplicaron técnicas de regularización o currículo de dificultad. Tampoco se documenta el uso de recompensas shaping adicionales ni de mecanismos de evaluación frente a políticas de referencia.

## Capacidades

- Control de agentes en el entorno `SoccerTwos` de Unity ML-Agents: movimiento, orientación y patada del balón en partidos 2 contra 2.
- Toma de decisiones en tiempo real dentro de la simulación física de Unity, con observaciones vectoriales y acciones discretas.
- Comportamiento multiagente por equipos: la política se instancia en cada agente del equipo y coopera implícitamente mediante el entrenamiento conjunto.
- Ejecución en el visor web de Hugging Face mediante el fichero `.onnx` y en Unity mediante el fichero `.nn`.
- Reanudación del entrenamiento desde el checkpoint publicado usando `mlagents-learn --resume`.
- No soporta tool calling, function calling, generación de texto, visión, audio ni razonamiento simbólico: es una política de control, no un modelo generativo.

## Casos de uso

- Evaluación de algoritmos de RL multiagente: sirve como política de referencia para comparar POCA con PPO, SAC u otros algoritmos en `SoccerTwos`, midiendo tasa de victorias y goles por episodio frente a este checkpoint.
- Reproducción de experimentos docentes: el agente permite ilustrar el ciclo completo de ML-Agents (entrenamiento, exportación a `.onnx`, visualización en el navegador) en cursos y tutoriales de reinforcement learning.
- Punto de partida para fine-tuning: reanudar el entrenamiento con `--resume` y modificar hiperparámetros o recompensas para estudiar el efecto en el comportamiento emergente del equipo.
- Pruebas de integración de ML-Agents en pipelines de CI: validar que un agente exportado se carga y ejecuta correctamente en Unity Barracuda o en el visor de Hugging Face antes de desplegar políticas propias.
- Benchmark de entornos de simulación física: usar el agente como oponente fijo para medir la mejora de nuevas políticas en partidos 2 contra 2 con condiciones controladas.
- Demostraciones interactivas de autoaprendizaje: mostrar en el navegador cómo un agente entrenado coopera y compite en un entorno deportivo, sin necesidad de infraestructura GPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Inferencia en CPU: el agente es una red neuronal pequeña y puede ejecutarse en CPU sin GPU dedicada, tanto en Unity como en el visor web de Hugging Face.
- VRAM estimada: no disponible; por el tamaño del repositorio (0,2 GB, que incluye checkpoints y ficheros de TensorBoard) la política es ligera y no requiere GPU para inferencia.
- GPU recomendadas: no aplica para inferencia; para reanudar el entrenamiento con `mlagents-learn` se recomienda una GPU con al menos 8 GB de VRAM (RTX 3060/4060 o superior), aunque no se documenta el requisito exacto.
- Cabe en cualquier GPU de consumo e incluso en CPU para inferencia; el cuello de botella es la simulación física de Unity, no la red.
- Opciones de despliegue: Unity ML-Agents (fichero `.nn`), Unity Barracuda, ONNX Runtime (fichero `.onnx`) y el visor web de Hugging Face para entornos oficiales de ML-Agents.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Entorno | Algoritmo | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| DoyleHu/poca-SoccerTwos | SoccerTwos | POCA (PPO) | `.nn`, `.onnx` | no disponible | Hugging Face |
| Agentes oficiales de Unity ML-Agents | SoccerTwos y otros | POCA / PPO | `.nn`, `.onnx` | MIT (repo ML-Agents) | GitHub de Unity Technologies |
| Políticas de referencia de la comunidad ML-Agents en Hugging Face | SoccerTwos | POCA / PPO | `.nn`, `.onnx` | variable según autor | Hugging Face (organización `unity`) |

La comparación se limita al mismo entorno y algoritmo, ya que no existen alternativas de propósito general equiparables: cualquier agente de `SoccerTwos` comparte arquitectura y espacio de acciones, y las diferencias se reducen al entrenamiento y a la tasa de victorias, dato que no se publica en esta ficha.

## Limitaciones y advertencias

- No se documenta licencia: el uso comercial del checkpoint queda sin autorización explícita y requiere contactar con el autor.
- La model card es la plantilla automática de ML-Agents; no incluye hiperparámetros, número de pasos, métricas de evaluación ni tasa de victorias.
- El agente está especializado exclusivamente en `SoccerTwos`; no generaliza a otros entornos ni tareas.
- El comportamiento puede presentar sesgos derivados del autoaprendizaje, como estrategias explotadoras o dependencia de las condiciones exactas de entrenamiento.
- No hay información sobre la robustez frente a variaciones de física, número de agentes o parámetros del entorno.
- Al ser una política de RL, no existe riesgo de alucinación en el sentido de los modelos de lenguaje, pero sí de comportamientos degenerados fuera de la distribución de entrenamiento.
- El repositorio incluye ficheros de TensorBoard; conviene revisar su contenido antes de reutilizarlo en producción para descartar datos no deseados.
- No apto para tareas de NLP, visión, generación de código ni atención al cliente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/DoyleHu/poca-SoccerTwos
- Repositorio de Unity ML-Agents: https://github.com/Unity-Technologies/ml-agents
- Documentación de ML-Agents: https://unity-technologies.github.io/ml-agents/ML-Agents-Toolkit-Documentation/
- Tutorial corto del curso de deep RL: https://huggingface.co/learn/deep-rl-course/unitbonus1/introduction
- Tutorial largo de ML-Agents: https://huggingface.co/learn/deep-rl-course/unit5/introduction
- Organización de agentes de Unity en Hugging Face: https://huggingface.co/unity
