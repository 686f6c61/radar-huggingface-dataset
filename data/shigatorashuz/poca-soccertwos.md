# ShigatoraShuz/poca-SoccerTwos

## Resumen

MA-POCA SoccerTwos es una política de aprendizaje por refuerzo entrenada con el algoritmo MA-POCA (Multi-Agent POsthumous Credit Assignment) del toolkit ML-Agents de Unity, aplicada al entorno de fútbol 2 contra 2 SoccerTwos. El modelo no es un modelo de lenguaje: es una red neuronal exportada en formato ONNX que actúa como agente controlador de jugadores dentro de la simulación, y su propósito es servir como oponente o como base de partida en experimentos de aprendizaje multiagente con auto-juego (self-play). Lo publica el usuario ShigatoraShuz en Hugging Face con fecha de creación del 25 de noviembre de 2026.

La relevancia de este artefacto es acotada y experimental: se trata de un checkpoint de investigación con cero descargas y cero likes en el momento de la consulta, sin licencia declarada y sin documentación más allá de una model card mínima. No incorpora arquitectura transformer, no procesa lenguaje natural y no dispone de ventana de contexto en el sentido habitual. Su interés práctico se limita a quien trabaje con el entorno SoccerTwos de ML-Agents y quiera reutilizar una política ya entrenada para evaluación comparativa o para inicializar un currículo de self-play.

El rendimiento declarado por el autor es modesto: una recompensa media de 0,11 con desviación típica de 0,57 evaluada contra un oponente aleatorio con semilla fija. Esa cifra, con una desviación mayor que la media, indica una política con alta varianza episódica y sin dominio consolidado del entorno, por lo que debe interpretarse como un punto de partida y no como un agente resuelto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal de política para ML-Agents (MA-POCA), exportada como grafo ONNX; topología interna no disponible |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (entorno de simulación por pasos, no modelo de lenguaje) |
| Tipos de cuantizacion | no disponible (el artefacto se distribuye como ONNX; no se documentan variantes cuantizadas) |
| Idiomas soportados | no disponible (no procesa lenguaje natural) |
| Licencia | no disponible |
| Formato de pesos | ONNX (librería `ml-agents`) |
| Tarea | Aprendizaje por refuerzo multiagente (SoccerTwos) |
| Algoritmo de entrenamiento | MA-POCA con self-play |
| Entorno | ML-Agents SoccerTwos (Unity) |
| Tamano del repositorio | 0.0 GB (según Hugging Face) |

## Arquitectura y entrenamiento

El modelo se entrena con MA-POCA, un algoritmo de aprendizaje por refuerzo multiagente pensado para escenarios de cooperación y competición donde la asignación de crédito entre agentes es ambigua. MA-POCA combina una función de valor centralizada durante el entrenamiento con políticas descentralizadas en ejecución, de modo que cada jugador decide su acción a partir de sus propias observaciones, mientras el crítico aprovecha información agregada del equipo para estimar la contribución individual. El escenario es SoccerTwos de Unity ML-Agents: dos equipos de dos jugadores que compiten por introducir un balón en la portería contraria, con observaciones vectoriales y acciones discretas de movimiento y chut.

El autor indica que el entrenamiento se realizó con self-play y que la recompensa combina términos individuales y de grupo por episodio completado de cada jugador. No se especifican el número de pasos de entorno, la configuración de hiperparámetros, el tamaño de las redes ni la composición de las recompensas más allá de esa descripción cualitativa. Tampoco se documenta si hubo fases de currículo, imitación o ajuste posterior. La evaluación se realizó contra un oponente aleatorio con semilla fija, lo que constituye una referencia débil y no comparable con métricas de ligas competitivas de SoccerTwos.

## Capacidades

- Control de agentes en el entorno SoccerTwos: genera acciones de movimiento y chut para jugadores de un equipo 2 contra 2 a partir de observaciones vectoriales del simulador.
- Comportamiento multiagente cooperativo: la política está entrenada para coordinarse con un compañero dentro del mismo equipo, no solo para actuar de forma individual.
- Inferencia en tiempo real dentro de Unity: al exportarse como ONNX, puede cargarse con el runtime de ML-Agents o con ONNX Runtime para ejecución por paso de simulación.
- Uso como oponente de evaluación: sirve para medir políticas propias contra un rival entrenado con MA-POCA en lugar de contra un oponente puramente aleatorio.
- Inicialización de experimentos de self-play: puede emplearse como checkpoint de partida en un currículo de entrenamiento, aunque no se documenta compatibilidad exacta de configuración.
- No dispone de generación de texto, razonamiento simbólico, código, matemáticas, visión, audio, tool calling ni capacidad multilingüe.

## Casos de uso

- Evaluación de políticas propias en SoccerTwos: cargar el ONNX como oponente fijo en el simulador y medir la tasa de victorias de un agente en entrenamiento, con la ventaja de que el rival es determinista y reproducible frente a un oponente aleatorio.
- Línea base en experimentos de aprendizaje multiagente: usar la recompensa media declarada (0,11 ± 0,57) como referencia mínima para comprobar si una configuración nueva de MA-POCA o PPO mejora el comportamiento en el mismo entorno.
- Docencia y demostraciones de ML-Agents: ilustrar el flujo completo de entrenamiento, exportación a ONNX e integración en una build de Unity en cursos o talleres de aprendizaje por refuerzo.
- Pruebas de regresión de infraestructura: verificar que el pipeline de inferencia ONNX, el servidor de entrenamiento y la comunicación con el entorno funcionan correctamente antes de lanzar entrenamientos largos.
- Arranque en frío de currículos de self-play: inicializar una población de agentes con esta política y aplicar después variaciones de recompensa u oponentes para explorar estrategias distintas.
- Análisis de varianza episódica: estudiar por qué una política con media baja y desviación alta se comporta de forma inconsistente, útil para depurar funciones de recompensa o esquemas de asignación de crédito en MA-POCA.

## Benchmarks y rendimiento

Datos declarados por el autor en la model card (no verificados):

| Tarea | Dataset / entorno | Metrica | Valor |
|---|---|---|---|
| reinforcement-learning | ML-Agents-SoccerTwos | mean_reward | 0,11 +/- 0,57 |

No se han publicado otros resultados de benchmarks en la información disponible. No hay comparación con políticas de referencia de la liga SoccerTwos ni con configuraciones base de ML-Agents.

## Requisitos de hardware

- VRAM estimada: no disponible. El repositorio ocupa 0.0 GB según Hugging Face, lo que sugiere un grafo ONNX de tamaño reducido, pero no se publica el número de parámetros ni el tamaño exacto del fichero.
- GPU recomendadas: no disponible. Para una política de ML-Agents de este tipo, cualquier GPU consumer reciente sería suficiente en la práctica, pero no hay datos publicados que lo confirmen.
- Compatibilidad con GPU consumer: probablemente sí, dado el tamaño aparente del artefacto, aunque no se documenta.
- Opciones de despliegue: runtime de ML-Agents en Unity, ONNX Runtime, o el `Unity Inference Engine` integrado en builds de Unity. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Entorno | Algoritmo | Recompensa media | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| MA-POCA SoccerTwos (ShigatoraShuz) | Política RL multiagente | SoccerTwos | MA-POCA + self-play | 0,11 +/- 0,57 (no verificado) | no disponible | Hugging Face, 0 descargas |
| Políticas de referencia de ML-Agents | Política RL multiagente | SoccerTwos | MA-POCA / PPO | no disponible en la información proporcionada | Licencia de Unity ML-Agents | Repositorio oficial de Unity |
| Alternativas de la comunidad en Hugging Face | Política RL multiagente | SoccerTwos | variable | no disponible | variable | Búsqueda en Hugging Face |

No se dispone de datos comparativos verificables con otras políticas publicadas para el mismo entorno en la información proporcionada.

## Limitaciones y advertencias

- Métrica de evaluación débil: la recompensa media se midió contra un oponente aleatorio con semilla fija, no contra políticas entrenadas, por lo que no refleja competitividad real.
- Alta varianza: la desviación típica (0,57) supera ampliamente la media (0,11), lo que indica comportamiento inconsistente entre episodios.
- Ausencia de licencia: no se declara licencia, lo que impide determinar si el uso comercial o la redistribución están permitidos. Debe contactarse con el autor antes de cualquier uso en producción.
- Documentación mínima: no se publican hiperparámetros, tamaño de red, número de pasos de entrenamiento ni configuración exacta del entorno, lo que dificulta la reproducibilidad.
- Sin verificación: el resultado del model-index está marcado como `verified: false`.
- Especificidad del entorno: la política solo es válida para la configuración de observaciones y acciones de SoccerTwos con la que se entrenó; cambios en la versión de ML-Agents o en la parametrización del entorno pueden invalidarla.
- Sin capacidades de lenguaje: no debe evaluarse con métricas de NLP ni emplearse en tareas de texto, código o razonamiento.
- Riesgo de sobreajuste al oponente de evaluación: al haberse validado contra un rival aleatorio, el comportamiento puede degradarse frente a políticas entrenadas.
- Sin mantenimiento aparente: cero descargas y actualización inmediata a la creación sugieren un artefacto de publicación puntual sin soporte.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ShigatoraShuz/poca-SoccerTwos
- Documentación de ML-Agents (Unity Technologies): https://github.com/Unity-Technologies/ml-agents
- Documentación del algoritmo MA-POCA: https://github.com/Unity-Technologies/ml-agents/blob/develop/docs/Learning-Environment-Design-Agents.md
- Entorno SoccerTwos en ML-Agents: https://github.com/Unity-Technologies/ml-agents/tree/develop/Project/Assets/ML-Agents/Examples/Soccer
- ONNX Runtime: https://onnxruntime.ai/
