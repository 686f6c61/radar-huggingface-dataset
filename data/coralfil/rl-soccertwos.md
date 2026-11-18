# Coralfil/rl-soccertwos

## Resumen

`Coralfil/rl-soccertwos` es un agente de aprendizaje por refuerzo entrenado con Unity ML-Agents para el entorno SoccerTwos, un escenario de futbol 2 contra 2 en el que dos equipos de agentes compiten por marcar goles. Lo desarrolla el usuario Coralfil y se publica como artefacto certificado para el curso de Deep Reinforcement Learning de Hugging Face, lo que lo convierte en material didactico mas que en un modelo de proposito general.

No es un modelo de lenguaje ni un transformer generativo: es una politica neuronal entrenada mediante RL que mapea observaciones del entorno (posiciones, velocidades y estados de los agentes y del balon) a acciones discretas de movimiento y patada. Su relevancia es acotada y practica: sirve como referencia reproducible de un agente que alcanza una recompensa media declarada de 5,00 +/- 1,00 en SoccerTwos, util para comparar entrenamientos propios o para estudiar el comportamiento emergente de politicas multiagente cooperativas y competitivas.

La ficha se limita a los datos publicados en Hugging Face: el repositorio no incluye licencia, idiomas, arquitectura detallada ni hiperparametros de entrenamiento, por lo que varios campos se marcan como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Politica neuronal de aprendizaje por refuerzo entrenada con Unity ML-Agents (detalle de capas no disponible) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (entorno de observaciones por paso, no modelo de contexto) |
| Tipos de cuantizacion | no disponible (formato nativo de ML-Agents, tipicamente ONNX; no se documentan cuantizaciones) |
| Idiomas soportados | no disponible (no procesa lenguaje natural) |
| Licencia | no disponible |
| Formato de pesos | no disponible (artefacto de ML-Agents; habitualmente `.onnx` o checkpoint de trainer, no confirmado en el repositorio) |

## Arquitectura y entrenamiento

El modelo es una politica de RL para el entorno SoccerTwos de Unity ML-Agents, un escenario de futbol por equipos con observaciones vectoriales y acciones discretas. La libreria declarada es `ml-agents`, lo que implica un entrenamiento tipico con PPO (Proximal Policy Optimization) sobre el trainer de Unity ML-Agents, aunque el repositorio no confirma el algoritmo ni los hiperparametros concretos (learning rate, tamano de red, numero de pasos, curriculum).

No se publican datos sobre el numero de pasos de entrenamiento, la composicion del dataset (aqui generado por simulacion, no corpus textual) ni si se aplicaron tecnicas adicionales como self-play, recompensas conformadas o curriculum learning, habituales en SoccerTwos. La model card solo indica que el agente esta "certificado para el Hugging Face Deep RL Course", sin detallar la innovacion tecnica ni la configuracion del entrenamiento.

## Capacidades

- Control de agentes en el entorno SoccerTwos: seleccion de acciones de movimiento y patada a partir de observaciones vectoriales del estado del partido.
- Juego cooperativo y competitivo en equipos de dos agentes por bando.
- Politica entrenada para maximizar recompensa en un entorno concreto; no generaliza a otras tareas sin reentrenamiento.
- Integracion con el runtime de Unity ML-Agents para ejecutar la politica dentro del simulador.
- No soporta tool calling, function calling, agentes basados en lenguaje, razonamiento multi-paso simbolico, vision, audio ni capacidades multilingues.

## Casos de uso

- Docencia en RL: usar el agente como referencia resuelta del ejercicio SoccerTwos del Hugging Face Deep RL Course, comparando la recompensa obtenida por el alumno con la declarada (5,00 +/- 1,00).
- Baseline de evaluacion: servir como punto de partida para medir mejoras de nuevos entrenamientos en el mismo entorno y configuracion.
- Estudio de comportamiento multiagente: analizar las trayectorias y decisiones de la politica en partidos 2v2 para investigar cooperacion y competicion emergentes.
- Pruebas de infraestructura de simulacion: validar pipelines de Unity ML-Agents, carga de politicas y ejecucion en el motor antes de entrenar modelos propios.
- Demostraciones interactivas: incorporar el agente a una build de Unity para mostrar un partido jugable sin necesidad de entrenar desde cero.
- Comparacion de algoritmos: enfrentar esta politica contra agentes entrenados con otras variantes (por ejemplo, distintas recompensas o configuraciones de self-play) para evaluar diferencias de rendimiento.

## Benchmarks y rendimiento

Datos declarados por el autor en la model card (no verificados):

| Benchmark | Metrica | Valor | Verificado |
|---|---|---|---|
| ML-Agents-SoccerTwos | mean_reward | 5,00 +/- 1,00 | No |

No se han publicado otros resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; al tratarse de una politica de RL de ML-Agents, la inferencia suele ejecutarse en CPU sin requisitos significativos de GPU.
- GPU recomendadas: no disponible; no se documenta ningun requisito de GPU para ejecutar el agente.
- Compatibilidad con GPU de consumo: previsiblemente si, dado el bajo coste tipico de inferencia de politicas de ML-Agents, aunque no se confirma en el repositorio.
- Opciones de despliegue: runtime de Unity ML-Agents (Unity Inference Engine / Barracuda) y, si el artefacto es ONNX, ONNX Runtime; no se documentan opciones como vLLM, llama.cpp, Ollama o TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Entorno | Metrica declarada | Licencia | Disponibilidad |
|---|---|---|---|---|
| Coralfil/rl-soccertwos | ML-Agents SoccerTwos | mean_reward 5,00 +/- 1,00 | no disponible | Hugging Face |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible |

No se dispone de informacion sobre otros agentes publicados para el mismo entorno con los que establecer una comparacion cuantitativa fiable.

## Limitaciones y advertencias

- Especifico de un unico entorno (SoccerTwos); no es un modelo de lenguaje ni sirve para tareas genericas de NLP.
- La metrica de recompensa (5,00 +/- 1,00) esta declarada por el autor y marcada como no verificada.
- No se especifica la licencia, lo que impide confirmar si el uso comercial esta permitido; conviene contactar con el autor antes de cualquier uso en produccion.
- No se documentan sesgos, pero al ser una politica entrenada por RL puede exhibir comportamientos degenerados o explotar particularidades del simulador.
- No se publican hiperparametros, numero de pasos ni configuracion de entrenamiento, lo que dificulta la reproducibilidad.
- Sin idiomas soportados ni contexto: cualquier uso fuera del simulador de Unity ML-Agents requerira adaptacion.
- Riesgo de sobreajuste al escenario concreto de entrenamiento; el rendimiento en variantes del entorno no esta garantizado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Coralfil/rl-soccertwos
- Unity ML-Agents (documentacion oficial): https://github.com/Unity-Technologies/ml-agents
- Hugging Face Deep RL Course: https://huggingface.co/learn/deep-rl-course
- Entorno SoccerTwos en ML-Agents: https://github.com/Unity-Technologies/ml-agents/tree/develop/Project/Assets/ML-Agents/Examples/Soccer
