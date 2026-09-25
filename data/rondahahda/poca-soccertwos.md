# rondahahda/poca-SoccerTwos

## Resumen

poca-SoccerTwos es una política de aprendizaje por refuerzo profundo entrenada con Unity ML-Agents para el entorno SoccerTwos (partidos 2 contra 2). Lo desarrolla el usuario rondahahda y se publica como agente POCA, la variante de entrenamiento multi-agente con autojuego de la librería ML-Agents. El artefacto principal es un fichero ONNX que contiene la política evaluada, acompanado de la configuracion de entrenamiento (`configuration.yaml`, `config.json`), un checkpoint reanudable (`checkpoint.pt`) y un registro de ejecucion (`training.log`).

No se trata de un modelo de lenguaje ni de un modelo fundacional: es una política compacta especifica de un entorno de simulacion. Se entreno desde cero durante 44.608 pasos en Google Colab, con asistencia de Codex para la codificacion y ejecucion, y el propio autor lo describe como un modelo de curso introductorio, no como una politica completamente convergida. La relevancia es, por tanto, didactica y de investigacion: sirve como punto de partida reproducible para practicar autojuego, evaluacion determinista por semilla y reanudacion de entrenamiento en ML-Agents.

El rendimiento declarado es practicamente neutro: una recompensa media de -0.006180000305175781 con una desviacion estandar de 0.6227306729380327 sobre 20 episodios completos. Es decir, el agente se comporta de forma estadisticamente indistinguible de una politica sin habilidad futbolistica desarrollada, lo que es coherente con el escaso numero de pasos de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (politica POCA de ML-Agents exportada a ONNX; el autor no detalla la topologia de la red) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (entorno de decision secuencial, no modelo de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | ONNX (politica evaluada); checkpoint.pt para reanudar entrenamiento; configuration.yaml y config.json con ajustes |
| Entorno de entrenamiento | Unity ML-Agents, SoccerTwos (2 contra 2) |
| Algoritmo | POCA (variante multi-agente de PPO con autojuego de ML-Agents) |
| Pasos de entrenamiento | 44.608 |
| Tamano del repositorio | 0,0 GB |
| Libreria | ml-agents |
| Tarea (pipeline) | reinforcement-learning |
| Fecha de publicacion | 25 de septiembre de 2026 (segun metadatos de HuggingFace) |

## Arquitectura y entrenamiento

La ficha del autor no describe la topologia interna de la red (numero de capas, unidades ocultas, tipo de observaciones ni espacio de acciones), de modo que esos detalles quedan como no disponibles. Lo que si se declara es el marco de trabajo: Unity ML-Agents con el entrenador POCA, que en esta libreria corresponde al esquema de aprendizaje por refuerzo multi-agente con autojuego, donde las politicas de ambos equipos se entrenan conjuntamente. El aprendizaje es desde cero, sin inicializacion a partir de pesos preentrenados, y se ejecuto durante 44.608 pasos en Google Colab, un presupuesto muy reducido para un entorno de futbol concredit assignment entre companeros de equipo.

La evaluacion se realizo con la politica ONNX exportada, con acciones deterministas, sobre 20 episodios de agente completados y una unica semilla (12345). La recompensa de SoccerTwos incluye el componente de equipo. El autor indica explicitamente que se trata de un modelo de curso introductorio y no de una politica convergida, y que el archivo `evaluation.json` contiene los retornos completos de los episodios. No se documentan etapas de RLHF, DPO ni tecnicas de optimizacion de inferencia (decodificacion especulativa, attention linear, etc.), que no aplican a este tipo de modelo.

## Capacidades

- Control de un agente jugador de futbol en el entorno SoccerTwos de Unity ML-Agents (equipos 2 contra 2).
- Toma de decisiones en tiempo real a partir de observaciones del entorno simulado, con salida de acciones exportada en ONNX.
- Inferencia determinista reproducible bajo una semilla fija, util para comparaciones controladas.
- Reanudacion de entrenamiento desde el checkpoint incluido (`checkpoint.pt`).
- Evaluacion por lotes mediante el fichero de resultados de episodios (`evaluation.json`).
- Integracion en el ecosistema ML-Agents (Unity, ONNX Runtime y los runners de la libreria).
- No dispone de generacion de texto, razonamiento simbolico, codigo, matematicas, vision general, tool calling, function calling, capacidades de agente multi-paso, soporte multilingue ni modo de razonamiento explicito.

## Casos de uso

- Formacion practica en aprendizaje por refuerzo multi-agente: el modelo acompana los ejercicios de las unidades 5 y 7 del curso de deep RL de HuggingFace, de modo que un alumno puede reproducir el entrenamiento, comparar resultados y entender el efecto del numero de pasos en la calidad final de la politica.
- Punto de partida para autojuego prolongado: cargando `checkpoint.pt` y `configuration.yaml` se puede continuar el entrenamiento durante ordenes de magnitud mas pasos y comprobar si la recompensa media deja de ser practicamente cero.
- Investigacion sobre asignacion de credito entre companeros: SoccerTwos combina recompensa de equipo e individual, por lo que la politica sirve como sujeto de estudio de como el entrenador POCA reparte la contribucion en un escenario 2 contra 2.
- Linea base negativa en evaluaciones: al tener una recompensa media de -0.006180000305175781 con desviacion de 0.6227306729380327, resulta util como referencia de "politica no entrenada" frente a la que medir mejoras de otros agentes en el mismo entorno.
- Oponente de entrenamiento en Unity: el fichero ONNX se puede cargar con los runners de ML-Agents para desplegar este agente como rival de otra politica durante sesiones de autojuego o de evaluacion.
- Validacion de pipelines de exportacion ONNX: el repositorio incluye el ciclo completo (configuracion, checkpoint, politica exportada y registro de entrenamiento), lo que permite probar herramientas de conversion, despliegue y ejecucion de inferencia de extremo a extremo.
- Prototipado de protocolos de evaluacion reproducibles: el uso de acciones deterministas, una semilla concreta y 20 episodios completos sirve como plantilla metodologica para disenar evaluaciones comparables entre agentes del mismo entorno.

## Benchmarks y rendimiento

Resultados declarados por el autor en el model-index de la model card (metrica no verificada):

| Tarea | Conjunto de datos | Metrica | Valor | Verificado |
|---|---|---|---|---|
| Reinforcement Learning | ML-Agents-SoccerTwos | mean_reward | -0.006180000305175781 +/- 0.6227306729380327 | No |

Detalles de la evaluacion segun el autor: politica ONNX exportada, acciones deterministas, 20 episodios de agente completados, semilla 12345. La recompensa de SoccerTwos incluye la recompensa de equipo. No se han publicado otros resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM para inferencia: no se requiere GPU. Al tratarse de una politica ONNX de un repositorio de 0,0 GB orientada a un entorno de simulacion, la inferencia es viable en CPU.
- GPU recomendadas: ninguna en particular; el modelo no se beneficia de aceleracion GPU especifica segun la informacion disponible.
- Compatibilidad con GPU de consumo: no aplica, dado que no es necesario un acelerador grafico.
- Opciones de despliegue: Unity ML-Agents (runners de la libreria), ONNX Runtime, y carga del `checkpoint.pt` para reanudar el entrenamiento con el entrenador POCA.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Autor | Entorno | Algoritmo | Licencia | Descargas / likes | Metricas publicadas |
|---|---|---|---|---|---|---|
| rondahahda/poca-SoccerTwos | rondahahda | ML-Agents-SoccerTwos | POCA (ML-Agents) | no disponible | 0 / 0 | mean_reward -0.006180000305175781 +/- 0.6227306729380327 |
| akanametov/MLAgents-poca-SoccerTwos | akanametov | ML-Agents-SoccerTwos | POCA (ML-Agents) | no disponible | no disponible | no disponible en la informacion recopilada |
| aiartwork/poca-SoccerTwos | aiartwork | ML-Agents-SoccerTwos | POCA (ML-Agents) | no disponible | no disponible | no disponible en la informacion recopilada |

Los tres modelos pertenecen al mismo ejercicio del curso de deep RL de HuggingFace y comparten el entorno, la libreria y el esquema de entrenamiento. La informacion disponible no permite comparar parametros, contexto ni rendimiento cuantitativo entre ellos, ya que solo el modelo de rondahahda publica metricas.

## Limitaciones y advertencias

- Politica no convergida: el propio autor la describe como modelo de curso introductorio, no como politica final.
- Rendimiento practicamente neutro: recompensa media de -0.006180000305175781, con desviacion de 0.6227306729380327, lo que indica un comportamiento sin habilidad futbolistica apreciable.
- Presupuesto de entrenamiento minimo: solo 44.608 pasos, insuficiente para converger en un entorno de futbol 2 contra 2.
- Evaluacion fragil: 20 episodios y una unica semilla (12345), sin intervalos de confianza robustos ni evaluacion cruzada.
- Metrica no verificada: el resultado del model-index figura con el campo `verified` a falso.
- Sin licencia declarada: la ausencia de licencia impide determinar las condiciones de uso comercial; se debe contactar con el autor antes de cualquier uso en produccion.
- Sin idiomas ni contexto: no es un modelo de lenguaje, por lo que no procede hablar de soporte multilingue, ventana de contexto ni alucinaciones en el sentido habitual.
- Falta de generalizacion: la politica es especifica del entorno SoccerTwos y no es transferible a otras tareas sin reentrenamiento.
- Senales de baja adopcion: 0 descargas y 0 likes en el momento de la consulta, sin validacion externa de la comunidad.
- Sin datos de sesgo: no se ha publicado ningun analisis de sesgos, comportamiento en situaciones limite ni robustez frente a variaciones de la simulacion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/rondahahda/poca-SoccerTwos
- Modelo comparable de akanametov: https://huggingface.co/akanametov/MLAgents-poca-SoccerTwos
- Modelo comparable de aiartwork: https://huggingface.co/aiartwork/poca-SoccerTwos
- Ficha en aibase (variante 1927650001010561024): https://model.aibase.com/models/details/1927650001010561024
- Ficha en aibase (variante 1915692709983182850): https://model.aibase.com/models/details/1915692709983182850
- Documentacion del reto SoccerTwos en el curso de deep RL: https://deepwiki.com/huggingface/deep-rl-class/8.1-soccertwos:-ai-vs-ai-challenge
- Curso de deep RL, unidad 5 (hands-on): https://huggingface.co/learn/deep-rl-course/en/unit5/hands-on
- Curso de deep RL, unidad 7 (hands-on): https://huggingface.co/learn/deep-rl-course/en/unit7/hands-on
- Repositorio de Unity ML-Agents: https://github.com/Unity-Technologies/ml-agents
