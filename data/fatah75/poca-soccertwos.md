# fatah75/poca-SoccerTwos

## Resumen

poca-SoccerTwos es un agente de aprendizaje por refuerzo entrenado con el algoritmo POCA (Policy Optimization with Clipped Advantages) sobre el entorno SoccerTwos de Unity ML-Agents. Lo publica el usuario fatah75 en Hugging Face y su propósito es resolver una tarea concreta de fútbol 2 contra 2 en un entorno simulado de Unity, no la generación de texto ni el razonamiento general. Se trata, por tanto, de un artefacto de investigación en RL multiagente y no de un modelo de lenguaje.

El repositorio contiene los pesos del agente en formato ML-Agents (ficheros `.nn` y/o `.onnx`), con un tamaño total de 0,1 GB, lo que sitúa el modelo en el rango de redes neuronales pequeñas típicas de políticas de RL para entornos de control. La model card es la plantilla estándar que Hugging Face genera para agentes ML-Agents y no aporta detalles sobre hiperparámetros, arquitectura de red, número de pasos de entrenamiento ni métricas de recompensa.

La relevancia de esta ficha es limitada fuera del ámbito de ML-Agents: sirve como ejemplo reproducible de un agente POCA en SoccerTwos y como punto de partida para quienes quieran reanudar el entrenamiento o visualizar la política en el visor de Unity, pero no debe confundirse con un modelo fundacional ni evaluarse con benchmarks de NLP.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal de política y valor para ML-Agents (detalles no disponibles; POCA es el algoritmo de entrenamiento, no la arquitectura de red) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (entorno de RL, no modelo de lenguaje) |
| Tipos de cuantizacion | no disponible (pesos en formato ML-Agents/ONNX; no se documentan cuantizaciones) |
| Idiomas soportados | no disponible (no procesa lenguaje natural) |
| Licencia | no disponible |
| Formato de pesos | `.nn` (ML-Agents) y `.onnx` (exportación para inferencia) |

## Arquitectura y entrenamiento

El agente se entrena con POCA, un algoritmo de optimización de política con ventajas recortadas orientado a entornos multiagente cooperativos y competitivos. El entorno SoccerTwos de ML-Agents simula un partido de fútbol 2 contra 2 con observaciones vectoriales y acciones discretas; la política aprende a moverse, orientarse y golpear el balón mediante recompensas dispersas y de equipo. La model card no especifica el número de pasos de entrenamiento, la composición de las recompensas, el tamaño de las capas ocultas ni si se aplicaron técnicas auxiliares como self-play, curriculum learning o imitación.

No se documenta ninguna innovación técnica adicional más allá del uso de POCA dentro del ecosistema ML-Agents. El repositorio incluye los artefactos necesarios para reanudar el entrenamiento con `mlagents-learn ... --resume` y para exportar la política a ONNX, pero no se publican curvas de TensorBoard ni métricas de convergencia.

## Capacidades

- Control de agentes en el entorno SoccerTwos de Unity ML-Agents (fútbol 2 contra 2).
- Inferencia en tiempo real dentro del simulador de Unity mediante el cerebro de ML-Agents.
- Exportación a ONNX para ejecución fuera de Unity con un runtime compatible.
- Reanudación del entrenamiento desde el checkpoint publicado.
- No soporta generación de texto, razonamiento, código, matemáticas ni visión.
- No soporta tool calling ni function calling.
- No soporta agentes conversacionales ni razonamiento multi-paso en el sentido de los LLM.
- No tiene capacidades multilingües.

## Casos de uso

- Reproducción de experimentos de RL multiagente: cargar el agente en el entorno SoccerTwos para comparar el comportamiento de POCA frente a otros algoritmos (PPO, SAC) en la misma tarea.
- Reanudación de entrenamiento: usar el checkpoint como punto de partida con `mlagents-learn --resume` para afinar la política con nuevas recompensas o currículos.
- Visualización en el navegador: emplear el visor de Hugging Face (sección unity) para observar la política jugando sin instalar Unity.
- Docencia y divulgación: ejemplo práctico de un agente entrenado con ML-Agents para explicar conceptos de RL cooperativo y competitivo.
- Exportación a ONNX para integración en pipelines de inferencia propios, por ejemplo en un servicio que simule partidos y registre métricas.
- Base para experimentos de self-play: partir de esta política y enfrentarla contra versiones anteriores para estudiar la dinámica de entrenamiento adversarial.
- Pruebas de robustez: evaluar la política frente a variaciones del entorno (número de agentes, recompensas) para medir su generalización.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye recompensa media, tasa de victorias, número de pasos hasta convergencia ni comparaciones con otros agentes SoccerTwos.

## Requisitos de hardware

- VRAM estimada: inferior a 1 GB para inferencia, dado el tamaño del repositorio (0,1 GB) y el carácter ligero de las políticas ML-Agents.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060 o superior) es suficiente; también funciona en CPU para inferencia.
- Cabe en GPU consumer: sí, en cualquier GPU con al menos 2 GB de memoria; incluso en iGPU.
- Opciones de despliegue: Unity ML-Agents (runtime nativo), ONNX Runtime, y el visor web de Hugging Face para ML-Agents.
- Latencia y throughput: no disponibles; dependen del entorno Unity y del hardware, no se publican mediciones.

## Comparativa con modelos similares

| Modelo | Entorno | Algoritmo | Tamano | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| fatah75/poca-SoccerTwos | SoccerTwos (ML-Agents) | POCA | 0,1 GB | no disponible | Hugging Face |
| Agentes PPO de SoccerTwos (comunidad ML-Agents) | SoccerTwos | PPO | variable | generalmente MIT/Apache-2.0 | Hugging Face / Unity |
| Agentes SAC de ML-Agents | distintos entornos | SAC | variable | generalmente MIT/Apache-2.0 | Hugging Face / Unity |

No se dispone de datos de rendimiento comparativo entre estos agentes en la informacion proporcionada.

## Limitaciones y advertencias

- La licencia no está especificada, lo que impide confirmar si se permite uso comercial; hay que contactar con el autor antes de reutilizarlo en producción.
- El agente está especializado exclusivamente en SoccerTwos; no generaliza a otros entornos ni tareas.
- No hay métricas publicadas de recompensa ni de convergencia, por lo que no se puede evaluar su calidad objetiva.
- La model card es la plantilla automática de Hugging Face y no documenta hiperparámetros, semillas ni configuración de entrenamiento.
- Riesgo de sobreajuste al escenario concreto de entrenamiento; el comportamiento frente a oponentes distintos no está validado.
- No apto para tareas de NLP, visión, código ni agentes conversacionales.
- El repositorio tiene 0 descargas y 0 likes, lo que sugiere que no ha sido validado por la comunidad.
- La fecha de creación indicada (2026-11-11) es futura respecto a la información disponible; conviene verificar la integridad del repositorio.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/fatah75/poca-SoccerTwos
- Documentación de ML-Agents: https://unity-technologies.github.io/ml-agents/ML-Agents-Toolkit-Documentation/
- Repositorio ML-Agents: https://github.com/Unity-Technologies/ml-agents
- Tutorial corto de ML-Agents: https://huggingface.co/learn/deep-rl-course/unitbonus1/introduction
- Tutorial largo de ML-Agents: https://huggingface.co/learn/deep-rl-course/unit5/introduction
- Visor de agentes ML-Agents en Hugging Face: https://huggingface.co/unity
