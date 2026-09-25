# Mathis-Mo/poca-SoccerTwos

## Resumen

poca-SoccerTwos es una política de aprendizaje por refuerzo profundo entrenada por el usuario Mathis-Mo para el entorno SoccerTwos de Unity ML-Agents. Se trata de un agente (o conjunto de agentes, dado que SoccerTwos es un escenario 2 contra 2) que ha aprendido a jugar al fútbol simulado mediante el algoritmo POCA implementado en la librería ML-Agents, usando entrenamiento con self-play y arquitectura de tipo actor-crítico. No es un modelo de lenguaje ni un transformer generativo: es una red neuronal de política que mapea observaciones del entorno a acciones de control.

El repositorio tiene un tamano de 0,2 GB y fue publicado el 25 de septiembre de 2026. Está etiquetado como `ml-agents`, `onnx`, `tensorboard`, `SoccerTwos` y `deep-reinforcement-learning`, y su pipeline declarado en HuggingFace es `reinforcement-learning`. Incluye el archivo de pesos en formato nativo de ML-Agents (`.nn`) y su exportación a ONNX, lo que permite cargarlo tanto en el toolkit de entrenamiento como en el motor Unity mediante los paquetes de inferencia correspondientes.

Su relevancia es práctica para la comunidad de RL multiagente: sirve como punto de partida reproducible para investigar cooperación, asignación de crédito y entrenamiento auto-jugado en entornos con equipos. El autor no ha publicado licencia, idiomas soportados ni métricas de rendimiento, por lo que su uso en producción requiere verificar previamente los términos legales con el autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal de política (actor-crítico) entrenada con el algoritmo POCA de Unity ML-Agents; detalle de capas no disponible |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (no es un modelo de lenguaje; el "contexto" es la observación del entorno SoccerTwos) |
| Tipos de cuantizacion | no disponible; el repositorio incluye pesos en formato `.nn` y exportación a ONNX |
| Idiomas soportados | no aplica |
| Licencia | no disponible |
| Formato de pesos | `.nn` (ML-Agents) y `.onnx` |
| Tamano del repositorio | 0,2 GB |
| Libreria | ml-agents |
| Pipeline | reinforcement-learning |
| Fecha de publicacion | 2026-09-25 |
| Fecha de actualizacion | 2026-09-25 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El modelo sigue el paradigma de ML-Agents para escenarios multiagente cooperativos. El algoritmo indicado, POCA (Policy Optimization with Credit Assignment, emparentado con MA-POCA en la implementación de ML-Agents), combina entrenamiento centralizado con ejecución descentralizada: durante el entrenamiento el crítico puede acceder a información global del equipo para estimar el valor, mientras que en inferencia cada agente actúa únicamente con sus observaciones locales. Esto permite aprender comportamientos cooperativos sin comunicación explícita entre agentes en tiempo de ejecución.

El entorno SoccerTwos es un campo de fútbol reducido con dos equipos de dos agentes cada uno, observaciones vectoriales y acciones de tipo discreto o continuo según la configuración. El entrenamiento se realiza por self-play, de modo que la política mejora enfrentándose a versiones de sí misma. El repositorio usa TensorBoard para el seguimiento de las curvas de entrenamiento, y los pesos resultantes se exportan a ONNX para su despliegue en Unity. No se dispone de datos sobre número de pasos de entrenamiento, composición del dataset, hiperparámetros, uso de RLHF/DPO (no aplicable en RL puro de control) ni innovaciones técnicas adicionales.

## Capacidades

- Control de agentes en el entorno SoccerTwos: genera acciones de movimiento y de interacción con el balón para un agente que juega en equipo.
- Comportamiento cooperativo 2 contra 2: coordinación implícita con el compañero de equipo aprendida por self-play.
- Inferencia en tiempo real dentro de Unity: los pesos ONNX se pueden cargar con los paquetes de inferencia de ML-Agents para jugar en el navegador o en el editor.
- Reanudación del entrenamiento: compatible con `mlagents-learn ... --resume` para seguir afinando la política.
- Exportación portable: el formato ONNX permite ejecutar el modelo fuera del toolkit, por ejemplo con ONNX Runtime.
- Seguimiento experimental: los archivos de TensorBoard incluidos permiten auditar el progreso del entrenamiento.
- Sin capacidades de lenguaje, visión, tool calling ni razonamiento simbólico: es una política de control específica de tarea.

## Casos de uso

- Investigacion en RL multiagente: usar el modelo como línea base reproducible en experimentos sobre cooperación, asignación de crédito y dinámicas de equipo en SoccerTwos.
- Comparacion de algoritmos: enfrentar esta política POCA contra políticas entrenadas con PPO u otros trainers de ML-Agents para medir diferencias de rendimiento en el mismo entorno.
- Entrenamiento por self-play continuado: reanudar el entrenamiento desde estos pesos para estudiar curvas de mejora y estabilidad a largo plazo.
- Demostraciones interactivas en Unity: cargar el ONNX en el motor para mostrar agentes jugando en una build web o de escritorio, útil en docencia y divulgacion.
- Pruebas de integracion de pipelines de RL: verificar el flujo completo de exportacion a `.nn` y `.onnx`, carga en inferencia y evaluacion automatizada.
- Benchmark de rendimiento de inferencia: medir latencia y throughput del ONNX en CPU y GPU para dimensionar despliegues de agentes en tiempo real.
- Material didactico para cursos de deep RL: el binomio repositorio más tutoriales de ML-Agents permite ilustrar el ciclo completo de entrenamiento, publicacion y visualizacion de un agente.
- Base para transferencia a otros entornos de ML-Agents: reutilizar la política como inicializacion en escenarios de control con equipos similares.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye Elo, tasa de victorias, recompensa media ni comparaciones cuantitativas con otras políticas.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja. Una política de ML-Agents para SoccerTwos ocupa tipicamente pocos megabytes de parametros; el repositorio de 0,2 GB incluye pesos, checkpoints y eventos de TensorBoard, no solo el modelo final.
- GPU recomendadas: cualquier GPU con soporte CUDA sirve para entrenar (por ejemplo RTX 3060 en adelante). Para inferencia, la CPU es suficiente.
- Compatibilidad con GPU de consumo: si, cabe holgadamente en cualquier GPU de consumo e incluso se ejecuta en CPU sin problema.
- Opciones de despliegue: Unity ML-Agents (runtime Python o Sentinel/Barracuda en Unity), ONNX Runtime, y el visor web de HuggingFace para agentes de ML-Agents alojados en la organizacion `unity`.
- Latencia y throughput estimados: no disponibles. Dependen fuertemente del hardware, del backend de inferencia y del numero de agentes simulados en paralelo.
- Nota: los requisitos de entrenamiento son mas exigentes que los de inferencia, ya que implican simulacion del entorno y actualizacion de gradientes.

## Comparativa con modelos similares

| Modelo | Entorno | Algoritmo | Contexto / observaciones | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Mathis-Mo/poca-SoccerTwos | SoccerTwos (ML-Agents) | POCA | Observaciones vectoriales del entorno | no disponible | HuggingFace, 0 descargas |
| Otros agentes SoccerTwos de ML-Agents | SoccerTwos | PPO / MA-POCA | Observaciones vectoriales del entorno | variable segun autor | HuggingFace, organizacion `unity` |
| Políticas de referencia de Unity ML-Agents | Diversos entornos de ejemplo | PPO / SAC / MA-POCA | Segun entorno | licencia de Unity ML-Agents | Repositorio oficial de ML-Agents |

No se dispone de datos cuantitativos publicados que permitan comparar el rendimiento de esta política con alternativas concretas. La comparacion queda por tanto limitada a categoria, algoritmo y disponibilidad.

## Limitaciones y advertencias

- Especificidad de tarea: el modelo solo sabe jugar a SoccerTwos; no generaliza a otros entornos ni a tareas de lenguaje o vision.
- Ausencia de licencia: la model card no declara licencia, por lo que el uso comercial queda en un limbo legal hasta que el autor lo aclare.
- Ausencia de metricas: no hay Elo, tasa de victorias ni recompensa media publicada, de modo que no se puede evaluar su calidad objetiva sin ejecutarlo.
- Sesgos de entrenamiento: al ser self-play, la política esta sesgada hacia las dinamicas concretas del entorno y sus recompensas; puede explotar comportamientos emergentes no deseados.
- Riesgo de sobreajuste al entorno: cambios en la version de ML-Agents, en la configuracion del entorno o en la fisica de Unity pueden degradar el comportamiento.
- Robustez limitada: no hay datos sobre su resistencia a perturbaciones, ruido en observaciones o adversarios fuera de distribucion.
- Reproducibilidad incompleta: no se documentan hiperparametros ni semilla, lo que dificulta replicar el entrenamiento.
- Soporte nulo aparente: cero descargas y cero likes en el momento de la consulta, sin mantenimiento conocido.
- Idiomas: no aplica; no es un modelo linguistico.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Mathis-Mo/poca-SoccerTwos
- Repositorio de Unity ML-Agents: https://github.com/Unity-Technologies/ml-agents
- Documentacion de ML-Agents: https://unity-technologies.github.io/ml-agents/ML-Agents-Toolkit-Documentation/
- Tutorial corto de ML-Agents (Huggy the Dog): https://huggingface.co/learn/deep-rl-course/unitbonus1/introduction
- Tutorial largo de ML-Agents: https://huggingface.co/learn/deep-rl-course/unit5/introduction
- Visor de agentes ML-Agents en HuggingFace: https://huggingface.co/unity
