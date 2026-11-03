# liqii/poca-SoccerTwos

## Resumen

poca-SoccerTwos es un agente entrenado con aprendizaje por refuerzo profundo (deep reinforcement learning) para el entorno SoccerTwos de Unity ML-Agents. Lo publica el usuario liqii en HuggingFace Hub y su propósito es jugar partidos de fútbol 2 contra 2 dentro de la simulación de Unity, no procesar lenguaje natural. El repositorio contiene los pesos del agente en formato ONNX y los artefactos de entrenamiento generados por la librería ml-agents, con un tamaño total de 0,2 GB.

El modelo se enmarca en la familia de agentes de ML-Agents, un ecosistema de simulación y entrenamiento por refuerzo mantenido por Unity Technologies. El algoritmo indicado por el nombre del repositorio es POCA (una variante de PPO con optimización de crédito de equipo, habitualmente usada en entornos cooperativos y competitivos multijugador como SoccerTwos). No se trata de un modelo de lenguaje: no tiene parámetros declarados en miles de millones, ni ventana de contexto textual, ni capacidades generativas.

Su relevancia es acotada y práctica: sirve como referencia reproducible para quienes investigan o experimentan con entornos multiagente en ML-Agents, y permite visualizar el comportamiento del agente directamente en el navegador mediante el visor de HuggingFace para entornos oficiales de Unity. La información pública disponible es mínima: sin licencia declarada, sin idiomas, sin benchmarks y con cero descargas en el momento de redactar esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal de política y valor entrenada con ML-Agents (algoritmo POCA, variante de PPO para entornos multijugador); topología exacta no disponible |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (no es un modelo de lenguaje; el agente observa el estado del entorno SoccerTwos en cada paso) |
| Tipos de cuantizacion | no disponible (los pesos se distribuyen en ONNX y formato .nn de ML-Agents) |
| Idiomas soportados | no disponible (no procesa texto) |
| Licencia | no disponible |
| Formato de pesos | ONNX y .nn (formato nativo de ML-Agents); el repositorio incluye artefactos de TensorBoard |

## Arquitectura y entrenamiento

El agente se entrena con la librería Unity ML-Agents, que implementa el bucle de interacción entre un entorno de Unity y un proceso de entrenamiento en Python. El nombre del repositorio sugiere el uso de POCA (Policy Optimization with Credit Assignment), un algoritmo orientado a entornos con múltiples agentes que comparten recompensa o compiten en equipo, como es el caso de SoccerTwos: dos equipos de dos agentes cada uno disputan un partido de fútbol simplificado en un campo rectangular.

No se dispone de información sobre el número de pasos de entrenamiento, la composición de las observaciones, la configuración de hiperparámetros, el uso de recompensas intrínsecas ni la existencia de currículo de dificultad. La model card únicamente documenta el comando para reanudar el entrenamiento (`mlagents-learn <config>.yaml --run-id=<id> --resume`) y el procedimiento para visualizar al agente en el navegador a través de la organización Unity en HuggingFace. Los ficheros de TensorBoard incluidos en el repositorio permitirían, en principio, inspeccionar las curvas de recompensa y pérdida del entrenamiento, pero no se han publicado resúmenes de esas métricas.

## Capacidades

- Control de agentes en el entorno SoccerTwos de Unity ML-Agents: el agente recibe observaciones del estado del partido y emite acciones de movimiento y patada según la definición del entorno.
- Juego cooperativo y competitivo 2 contra 2: el algoritmo POCA está diseñado para escenarios con asignación de crédito entre agentes del mismo equipo.
- Inferencia en formato ONNX: los pesos pueden cargarse con Unity Barracuda o con runtimes ONNX estándar para desplegar el agente fuera del editor.
- Reanudación del entrenamiento: el repositorio conserva los artefactos necesarios para continuar el entrenamiento con ML-Agents.
- Visualización en navegador: compatible con el visor de HuggingFace para entornos oficiales de Unity.
- No soporta tool calling, function calling, razonamiento multi-paso simbólico, generación de texto, visión general ni audio.

## Casos de uso

- Investigación en aprendizaje por refuerzo multiagente: el agente sirve como línea base reproducible para comparar variantes de POCA o PPO en SoccerTwos, reanudando el entrenamiento con la configuración adecuada y midiendo la recompensa media por episodio.
- Docencia y tutoriales de ML-Agents: al ser un entorno oficial y estar disponible el visor web, se puede usar en clases para mostrar cómo un agente aprende a jugar en equipo sin necesidad de infraestructura local.
- Evaluación de robustez frente a oponentes: enfrentar este agente contra versiones entrenadas con otros hiperparámetros permite estudiar la generalización de políticas cooperativas en entornos con oponentes dinámicos.
- Punto de partida para fine-tuning con recompensas modificadas: reanudar el entrenamiento cambiando la función de recompensa del entorno permite estudiar cómo evoluciona la política ante incentivos alterados.
- Pruebas de integración de Unity Barracuda: el fichero ONNX puede integrarse en un proyecto de Unity para validar el pipeline de inferencia en tiempo real dentro del motor.
- Generación de datos de demostración: ejecutar el agente en partidos automatizados produce trayectorias que pueden emplearse como datos de imitación para otros agentes o para análisis de comportamiento.
- Benchmarking de infraestructura de simulación: medir el rendimiento de ML-Agents con este agente permite comparar configuraciones de hardware y versiones de la librería en cargas multijugador.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye recompensa media, tasa de victorias, Elo ni curvas de aprendizaje, y el repositorio no presenta resúmenes de las métricas de TensorBoard.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja; el repositorio completo ocupa 0,2 GB y la red de política de un agente de SoccerTwos suele ser de pocas capas densas, por lo que la inferencia cabe holgadamente en cualquier GPU consumer con 2 GB o más.
- GPU recomendadas: cualquier GPU compatible con CUDA para el entrenamiento (RTX 3060, RTX 4090, A100, H100); para inferencia basta con CPU o con la GPU integrada en Unity.
- Cabe en GPU consumer: sí, en cualquier modelo con al menos 2 GB de VRAM; también en CPU para inferencia.
- Opciones de despliegue: Unity ML-Agents con el runtime de inferencia, Unity Barracuda para el fichero ONNX, y ONNX Runtime para ejecución fuera de Unity.
- Latencia y throughput estimados: no disponibles. Dependen del hardware, de la versión de ML-Agents y del número de agentes simulados simultáneamente en la escena.

## Comparativa con modelos similares

| Modelo | Entorno | Algoritmo | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| liqii/poca-SoccerTwos | SoccerTwos | POCA | ONNX / .nn | no disponible | HuggingFace Hub |
| Agentes oficiales de Unity en HuggingFace (organización unity) | Varios entornos ML-Agents, incluido SoccerTwos | PPO / POCA según entorno | .nn / ONNX | según el repositorio oficial | HuggingFace Hub |
| Agentes de la comunidad para SoccerTwos | SoccerTwos | PPO habitualmente | .nn / ONNX | variable | HuggingFace Hub |

No se dispone de datos de rendimiento comparativo entre estas alternativas. La comparación se limita a entorno, algoritmo y formato de distribución.

## Limitaciones y advertencias

- Sesgos conocidos: no aplica en el sentido de sesgos lingüísticos, pero la política puede explotar comportamientos degenerados del entorno (por ejemplo, quedarse quieto o repetir una acción) si el entrenamiento no convergió a una estrategia robusta.
- Riesgo de alucinación: no aplica; el agente no genera texto.
- Limitaciones de contexto o idioma: no aplica; el agente solo opera dentro del entorno SoccerTwos y no generaliza a otras tareas sin reentrenamiento.
- Restricciones de licencia: la licencia no está declarada en el repositorio, por lo que no se puede asumir uso comercial sin consultar al autor. ML-Agents tiene su propia licencia (Unity Companion License) que condiciona el uso de la librería.
- Caveats para producción: el repositorio tiene cero descargas y cero likes, sin validación externa de la calidad del agente; la model card no documenta hiperparámetros ni resultados de evaluación; el tamaño de 0,2 GB incluye artefactos de TensorBoard que no son necesarios para la inferencia.
- Dependencia de versión: la compatibilidad del fichero .nn y del ONNX depende de la versión de ML-Agents y de Unity empleadas en el entrenamiento, que no se especifican.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/liqii/poca-SoccerTwos
- Documentación de ML-Agents: https://unity-technologies.github.io/ml-agents/ML-Agents-Toolkit-Documentation/
- Repositorio de ML-Agents en GitHub: https://github.com/Unity-Technologies/ml-agents
- Tutorial corto de ML-Agents en HuggingFace: https://huggingface.co/learn/deep-rl-course/unitbonus1/introduction
- Tutorial largo de ML-Agents en HuggingFace: https://huggingface.co/learn/deep-rl-course/unit5/introduction
- Organización Unity en HuggingFace (visor de agentes): https://huggingface.co/unity
