# harkrishkali/poca-SoccerTwos

## Resumen

poca-SoccerTwos es un agente de aprendizaje por refuerzo profundo publicado en Hugging Face por el usuario harkrishkali, entrenado con Unity ML-Agents para el entorno SoccerTwos. No se trata de un modelo de lenguaje ni de un modelo multimodal: es una política (policy) que controla a un agente dentro de una simulación física de fútbol 2 contra 2, donde dos equipos de dos agentes compiten por marcar goles. El repositorio se etiqueta con `ml-agents`, `SoccerTwos`, `deep-reinforcement-learning`, `reinforcement-learning` y `ML-Agents-SoccerTwos`, y su pipeline declarado es `reinforcement-learning`.

El nombre del repositorio hace referencia a POCA, el entrenador de Unity ML-Agents basado en optimización de política proximal (PPO) con un crítico centralizado y asignación de crédito póstuma, pensado para escenarios multiagente competitivos y de self-play. La model card es mínima: se limita a indicar que es un agente de refuerzo entrenado con Unity ML-Agents. No se publican hiperparámetros, número de pasos de entrenamiento, curva de aprendizaje, valoración Elo ni resultados de evaluación.

Su relevancia es acotada y de perfil investigador o docente: sirve como artefacto reproducible dentro del ecosistema ML-Agents y como posible punto de partida para experimentos de aprendizaje multiagente, pero carece de licencia declarada, de documentación técnica y de métricas publicadas, por lo que no es apto para un uso en producción sin una evaluación propia previa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible. Agente de RL con política neuronal entrenada mediante el entrenador POCA de Unity ML-Agents; no es un transformer, MoE ni SSM |
| Parametros totales | No disponible |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica. Es un agente de RL que consume observaciones por paso; no tiene ventana de contexto de lenguaje |
| Tipos de cuantizacion | No disponible. La libreria ml-agents suele exportar en FP32; no se documentan cuantizaciones alternativas |
| Idiomas soportados | No aplica (no procesa lenguaje natural) |
| Licencia | No disponible |
| Formato de pesos | No disponible de forma explicita. La libreria declarada es ml-agents, cuya convencion habitual es publicar un fichero ONNX junto al checkpoint de PyTorch (.pt) |
| Tarea declarada (pipeline) | reinforcement-learning |
| Entorno | Unity ML-Agents SoccerTwos (futbol 2 contra 2, simulacion fisica de Unity) |
| Entrenador | POCA (segun el nombre del repositorio; no confirmado en la model card) |
| Descargas / likes | 0 / 0 |
| Fecha de creacion | 2026-09-27 |
| Ultima actualizacion | 2026-09-27 |

## Arquitectura y entrenamiento

La informacion disponible no describe la arquitectura interna. Por el entorno y el entrenador implicados, lo esperable en ML-Agents es una red neuronal de tipo actor-critico, normalmente un perceptron multicapa con capas ocultas configuradas en el fichero YAML de entrenamiento, que consume observaciones vectoriales (posiciones, velocidades y, segun configuracion, sensores de raycast) o, en la variante visual, observaciones de pixeles apiladas. La parte de critico en POCA es centralizada y se emplea para repartir credito entre agentes, incluidos aquellos que dejan de estar activos durante un episodio (asignacion de credito postuma), lo que encaja con un entorno competitivo de self-play como SoccerTwos. El autor no publica ni el numero de capas, ni el tamano de las capas ocultas, ni la configuracion de observaciones empleada.

Tampoco se documentan los datos de entrenamiento, que en este caso no son un corpus textual sino experiencia generada por la propia simulacion: millones de pasos de interaccion recogidos por self-play o por enfrentamiento contra politicas predefinidas. Se desconoce el numero total de pasos, si se uso curriculum learning, el rango de Elo alcanzado, si hubo fases de imitacion (behavioral cloning o GAIL) o si el checkpoint publicado corresponde a un entrenamiento completo o parcial. No hay evidencia de RLHF ni de DPO, tecnicas que no aplican a este tipo de modelo.

## Capacidades

- Control de un agente dentro del entorno SoccerTwos: movimiento, orientacion, esprint, uso de la pelota y disparo a porteria, segun las acciones definidas por el entorno.
- Comportamiento cooperativo y competitivo en un escenario 2 contra 2, con interaccion contra un equipo rival.
- Aprendizaje por refuerzo multiagente con politicas entrenadas mediante self-play o enfrentamiento directo, segun la configuracion de POCA.
- Inferencia en tiempo real dentro de Unity mediante los mecanismos de ejecucion de ML-Agents (Unity Inference Engine / Sentis, Barracuda u ONNX Runtime).
- Exportacion a un formato consumible por la API de ML-Agents, presumiblemente ONNX, para su uso en la simulacion.
- No dispone de generacion de texto, razonamiento simbolico, codigo, matematicas, vision de proposito general, tool calling, function calling, capacidades de agente basadas en lenguaje ni soporte multilingue. Cualquier atribucion de ese tipo seria incorrecta.

## Casos de uso

- Investigacion en aprendizaje por refuerzo multiagente: el agente permite reproducir experimentos de cooperacion y competicion en un entorno estandarizado y de coste computacional bajo, comparando el comportamiento emergente con otros checkpoints de SoccerTwos.
- Estudio de asignacion de credito: al proceder del entrenador POCA, sirve como artefacto para analizar como se reparte la recompensa entre agentes en un escenario de equipo, frente a alternativas como PPO puro o MA-POCA.
- Material docente en cursos de RL: encaja en unidades practicas de entrenamiento con self-play, exportacion de modelos y publicacion en Hugging Face, y puede usarse como ejemplo de checkpoint de estudiante.
- Punto de partida para fine-tuning: un investigador puede reanudar el entrenamiento con su propio curriculum, modificar el equilibrio de equipos o cambiar la recompensa, y comparar el rendimiento frente a este checkpoint como linea base.
- Generacion de trayectorias para imitation learning: los episodios jugados por el agente pueden registrarse y emplearse como datos de demostracion para behavioral cloning o GAIL en agentes nuevos.
- Prototipado de comportamientos de equipo en videojuegos: integrado mediante Unity Inference Engine, el agente puede usarse como referencia de IA de personajes en prototipos de jugabilidad deportiva o de equipo.
- Pruebas de estres de simuladores: al ejecutarse con muchas instancias en paralelo, resulta util para validar la estabilidad de una build de Unity o de la API de ML-Agents bajo carga.
- Evaluacion comparativa de algoritmos: enfrentar este checkpoint contra agentes entrenados con otros entrenadores de ML-Agents permite medir diferencias de rendimiento en un mismo entorno, siempre que se fije un protocolo de evaluacion propio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye curvas de aprendizaje, valoracion Elo, tasa de victorias, recompensa media acumulada ni ninguna otra metrica. En entornos de ML-Agents lo habitual es reportar Elo durante el self-play y recompensa media por episodio, pero en este repositorio no se proporciona ninguno de esos datos.

| Metrica | Valor |
|---|---|
| Elo (self-play) | No disponible |
| Tasa de victorias | No disponible |
| Recompensa media por episodio | No disponible |
| Pasos de entrenamiento | No disponible |
| Comparacion con modelos similares | No disponible |

## Requisitos de hardware

- VRAM para inferencia: minima. Al tratarse de una politica de RL de tipo MLP en un entorno SoccerTwos, el modelo cabe holgadamente en menos de 1 GB de memoria y puede ejecutarse en CPU. No se dispone de la cifra exacta de parametros, por lo que la estimacion es orientativa segun el tamano tipico de estos agentes.
- GPU recomendadas: no requiere GPU para inferencia. Cualquier GPU consumer (por ejemplo, una RTX 3060 o superior) es mas que suficiente, y tambien lo es la ejecucion integramente en CPU.
- Cabe en GPU consumer: si, en cualquier GPU consumer moderna, e incluso en CPU. El cuello de botella real suele ser la simulacion fisica de Unity y el numero de instancias paralelas, no la red neuronal.
- Opciones de despliegue: Unity Inference Engine (Sentis) o Barracuda dentro del editor y de builds de Unity; ONNX Runtime desde Python o desde otros lenguajes; la API de Python de ML-Agents (mlagents-envs) para conectar el agente a la simulacion; entrenamiento o reanudacion con mlagents-learn sobre PyTorch.
- Requisitos de entrenamiento: para continuar el entrenamiento hace falta el editor de Unity, la version correspondiente del paquete ML-Agents, Python con PyTorch y un fichero de configuracion YAML. El self-play escala mejor con muchas CPU que con una GPU grande.
- Latencia y throughput: no disponibles. No se publican mediciones de inferencia ni de pasos por segundo.

## Comparativa con modelos similares

No se conocen, en la informacion disponible, modelos comparables con datos publicados. Existen otras categorias de agentes para el mismo entorno (entrenadores PPO, SAC o MA-POCA dentro de ML-Agents, y otros checkpoints comunitarios de SoccerTwos), pero se desconoce su numero de parametros, su licencia y sus resultados, por lo que cualquier comparacion cuantitativa seria una invencion. Se ofrece unicamente una comparacion cualitativa de categorias.

| Modelo o categoria | Entorno | Algoritmo | Parametros | Licencia | Datos publicados |
|---|---|---|---|---|---|
| poca-SoccerTwos (este modelo) | Unity ML-Agents SoccerTwos | POCA (segun el nombre) | No disponible | No disponible | No |
| Agentes SoccerTwos entrenados con PPO en ML-Agents | Unity ML-Agents SoccerTwos | PPO | No disponible | No disponible | No disponible |
| Agentes SoccerTwos entrenados con MA-POCA | Unity ML-Agents SoccerTwos | MA-POCA | No disponible | No disponible | No disponible |
| Baseline heuristico o aleatorio del entorno | Unity ML-Agents SoccerTwos | No aplica | No aplica | Sujeta a la licencia de ML-Agents | No |

## Limitaciones y advertencias

- Ausencia total de licencia: sin licencia declarada no hay autorizacion explicita de uso, modificacion ni redistribucion, ni claridad sobre el uso comercial. Es un bloqueo relevante para cualquier integracion en producto.
- Model card practicamente vacia: no se documentan hiperparametros, configuracion de observaciones, numero de pasos, version de ML-Agents ni proceso de evaluacion. Reproducir el resultado es inviable con la informacion publicada.
- Sin metricas de rendimiento: no hay Elo ni tasa de victorias, por lo que no se puede afirmar que el agente juegue mejor o peor que un baseline heuristico.
- Sobreajuste al rival de entrenamiento: los agentes entrenados por self-play tienden a explotar las carencias concretas de las politicas contra las que se entrenaron. El rendimiento frente a oponentes nuevos o heuristicos puede degradarse de forma notable.
- Generalizacion limitada: la politica esta atada a la fisica, la escala temporal y el espacio de observaciones y acciones de SoccerTwos. No es transferible a otros entornos sin reentrenamiento.
- Cero capacidades de lenguaje y de vision general: no procesa texto ni imagenes fuera del sensor visual del propio entorno, y no admite tool calling, agentes basados en lenguaje ni razonamiento multi-paso simbolico. El termino "alucinacion" no aplica en el sentido de los modelos generativos; el fallo tipico aqui es comportamiento erroneo o colapso de politica.
- Ausencia de idiomas: no hay soporte multilingue porque no hay procesamiento de lenguaje natural.
- Riesgo de checkpoint parcial: se desconoce si el modelo publicado corresponde a un entrenamiento terminado o a una instantanea intermedia, algo frecuente en repositorios de estudiantes.
- Dependencia del ecosistema: su ejecucion practica exige Unity, una version compatible del paquete ML-Agents y, para el formato de pesos, el runtime adecuado. Los cambios de version pueden romper la compatibilidad.
- Cero traccion en la comunidad: 0 descargas y 0 likes en el momento de la consulta, sin issues ni discusion asociada que permita contrastar su comportamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/harkrishkali/poca-SoccerTwos
- Repositorio de Unity ML-Agents: https://github.com/Unity-Technologies/ml-agents
- Documentacion de Unity ML-Agents (entorno SoccerTwos y entrenadores disponibles): https://github.com/Unity-Technologies/ml-agents/tree/develop/docs
- Curso de deep reinforcement learning de Hugging Face (unidad sobre SoccerTwos y publicacion de modelos en el Hub), contexto probable de los tags del repositorio: https://huggingface.co/learn/deep-rl-course/unit3/introduction
- Pagina del Hub con modelos etiquetados como ML-Agents-SoccerTwos: https://huggingface.co/models?other=ML-Agents-SoccerTwos
