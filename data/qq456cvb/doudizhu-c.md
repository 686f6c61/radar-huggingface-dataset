# qq456cvb/doudizhu-C

## Resumen

doudizhu-C es un conjunto de checkpoints preentrenados en TensorFlow 1.x para agentes de Dou Di Zhu (el juego de cartas chino de 3 jugadores) entrenados con Combinatorial Q-Learning (CQL), un algoritmo de aprendizaje por refuerzo propuesto por Yang You, Liangwei Guo, Baisong Wang, Weiming Lu y Cewu Lu y publicado en AIIDE 2020. El modelo resuelve un problema de decision secuencial con espacio de acciones combinatorio: en Dou Di Zhu la accion no es una carta suelta, sino una combinacion valida (single, pair, trio, straight, bomb, etc.), lo que hace inviable el Q-learning tabular clasico y motiva el diseno de CQL. No es un modelo de lenguaje ni un modelo generativo de proposito general: es un agente autonomo especializado en un unico juego.

El repositorio contiene dos checkpoints, en los pasos 302.500 y 500.000 de entrenamiento, que deben descargarse en la carpeta `pretrained_model` del repositorio de codigo `qq456cvb/doudizhu-C` en GitHub y evaluarse con las instrucciones de ese repositorio. El peso total del repo es de 0,9 GB, la licencia es MIT y la libreria declarada es TensorFlow 1.x.

Su relevancia actual es mas historica y de investigacion que practica: es una implementacion de referencia de RL combinatorio aplicado a juegos de informacion imperfecta, publicada con codigo y pesos abiertos, lo que permite reproducir el agente y usarlo como linea base o como banco de pruebas para tecnicas de RL sobre espacios de acciones combinados. El modelo no ha recibido traccion en HuggingFace (0 descargas, 0 likes en el momento de la consulta).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal Q entrenada con Combinatorial Q-Learning (TensorFlow 1.x); topologia exacta no disponible |
| Parametros totales | no disponible |
| Longitud de contexto | no aplica (no es un modelo de lenguaje; opera sobre el estado del juego en cada turno) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje; el dominio es el juego Dou Di Zhu) |
| Licencia | MIT |
| Formato de pesos | checkpoints nativos de TensorFlow 1.x (`model-302500.*`, `model-500000.*`) |
| Libreria | TensorFlow (1.x) |
| Tamano del repositorio | 0,9 GB |
| Checkpoints incluidos | 302.500 pasos y 500.000 pasos de entrenamiento |
| Pipeline declarado | reinforcement-learning |
| Tarea | agente de decision para Dou Di Zhu (3 jugadores, informacion imperfecta) |

## Arquitectura y entrenamiento

La informacion disponible no detalla la topologia de la red (numero de capas, dimensiones de embedding, mecanismo de codificacion de la mano y del historial de jugadas). Lo que si se especifica es el metodo de aprendizaje: Combinatorial Q-Learning, un esquema de Q-learning disenado para dominios donde el conjunto de acciones validas es combinatorio y variable en cada estado. En lugar de tratar cada combinacion de cartas como una accion atomica independiente, CQL descompone la estimacion del valor de una combinacion en terminos de sus componentes, lo que reduce drasticamente el espacio efectivo de acciones a explorar y permite generalizar entre jugadas estructuralmente similares.

Los dos checkpoints publicados corresponden a 302.500 y 500.000 pasos de entrenamiento, lo que permite comparar el rendimiento del agente en dos fases distintas del aprendizaje. No se especifica en la informacion proporcionada el numero de partidas jugadas, si el entrenamiento fue self-play puro, contra agentes heuristicos o contra versiones congeladas, ni si se aplicaron fases de refinamiento posteriores al Q-learning. Tampoco se documentan tecnicas auxiliares como reward shaping, curriculum learning o decodificacion especulativa.

## Capacidades

- Juego autonomo de Dou Di Zhu: seleccion de combinaciones validas de cartas (singles, pares, tríos, escaleras, bombas y demas figuras del reglamento) en funcion del estado de la partida.
- Estimacion de valor Q sobre acciones combinatorias mediante el esquema CQL, con generalizacion entre combinaciones relacionadas.
- Dos niveles de entrenamiento disponibles (302.500 y 500.000 pasos), utiles para analisis comparativo del aprendizaje.
- Operacion en inferencia sin necesidad de entorno grafico ni de interaccion con lenguaje natural.
- Soporte de tool calling / function calling: no disponible (no aplica).
- Soporte de agentes y razonamiento multi-paso: limitado al bucle de decision propio del juego, sin planificacion simbolica general.
- Capacidades multilingues: no disponible (no es un modelo de lenguaje).
- Modo thinking, vision o audio: no disponible.

## Casos de uso

- Investigacion en aprendizaje por refuerzo combinatorio: el agente sirve como implementacion de referencia de CQL para reproducir los resultados del paper y comparar variantes del algoritmo sobre el mismo entorno.
- Linea base en competiciones o benchmarks de Dou Di Zhu: permite medir la mejora de agentes nuevos (self-play tipo DMC, MCTS con redes, metodos basados en transformers) contra un oponente entrenado con un metodo publicado.
- Estudio de espacios de acciones combinatorios: el dominio de Dou Di Zhu es un banco de pruebas util para validar tecnicas de factorizacion de acciones aplicables despues a planificacion, scheduling o asignacion de recursos.
- Generacion de datos de juego: el agente puede jugar partidas automaticas masivamente para producir trazas (estado, accion, recompensa) que alimenten el entrenamiento de otros modelos, incluidos modelos de lenguaje entrenados sobre secuencias de jugadas.
- Ensenanza y divulgacion: usado como demostracion practica de RL en juegos de informacion imperfecta en cursos o tutoriales, con la ventaja de que el codigo y los pesos son abiertos y la licencia MIT lo permite.
- Analisis de robustez y explotacion: al disponer de dos checkpoints, se puede estudiar como evoluciona la vulnerabilidad del agente a estrategias de explotacion entre las dos fases de entrenamiento.
- Integracion en entornos de simulacion de cartas: como modulo de decision dentro de un motor de juego que gestione el estado, la legalidad de jugadas y el interfaz, dejando al modelo solo la seleccion de accion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio no incluye tablas de tasas de victoria, Elo ni comparaciones numericas con otros agentes; el paper asociado (arXiv:1901.08925) es la fuente donde deben consultarse esas metricas, pero sus cifras no forman parte de la informacion proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El repositorio ocupa 0,9 GB e incluye dos checkpoints, pero no se desglosa el tamano ni la arquitectura de cada uno.
- GPU recomendadas: no disponibles. Al ser un modelo de TensorFlow 1.x para un juego de cartas, la inferencia no suele ser intensiva en computo, pero la informacion proporcionada no especifica requisitos.
- Compatibilidad con GPU de consumo: probablemente viable en GPU de consumo e incluso en CPU, dado el dominio (juego de cartas con estado discreto), pero no confirmado por la informacion disponible.
- Opciones de despliegue: la unica via documentada es cargar los checkpoints en TensorFlow 1.x siguiendo las instrucciones del repositorio de GitHub `qq456cvb/doudizhu-C`. No se mencionan vLLM, llama.cpp, Ollama, TGI ni otros servidores de inferencia, que ademas no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos verificados de otros agentes de Dou Di Zhu en la informacion proporcionada, por lo que no es posible construir una comparativa numerica fiable. Como referencia cualitativa, el paper de CQL se enmarca en la literatura de agentes para Dou Di Zhu y juegos de informacion imperfecta, donde existen otros enfoques publicados (por ejemplo, agentes basados en self-play con descomposicion de acciones o en busqueda con redes), pero sus parametros, contexto, rendimiento y licencia no forman parte de los datos disponibles para esta ficha.

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| doudizhu-C (CQL) | no disponible | no aplica | no disponible | MIT | pesos abiertos en HuggingFace y codigo en GitHub |
| Alternativas de la misma categoria | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, no responde a prompts y no admite instrucciones en lenguaje natural. Cualquier uso fuera del juego Dou Di Zhu requiere reentrenamiento.
- Dominio cerrado: el agente esta especializado en un unico juego con reglas fijas; no se documenta transferencia a otros juegos ni a otros dominios de decision.
- Dependencia de TensorFlow 1.x: se trata de una version obsoleta del framework, sin soporte activo, lo que complica el despliegue en entornos modernos y exigira contenedores o entornos virtuales con versiones antiguas.
- Ausencia de evaluacion publicada en el repositorio: la model card no aporta tasas de victoria ni comparaciones, de modo que el rendimiento real de los checkpoints de 302.500 y 500.000 pasos no puede verificarse con la informacion disponible.
- Traccion nula en HuggingFace (0 descargas, 0 likes en el momento de la consulta): no hay validacion independiente por parte de la comunidad ni issues publicos que confirmen que los checkpoints cargan correctamente.
- Fechas del repositorio inusuales: la creacion y la ultima actualizacion registradas (2026) no coinciden con la publicacion del paper (2020), lo que sugiere un volcado posterior de artefactos; conviene verificar la integridad de los ficheros antes de usarlos en produccion.
- Riesgo de sobreajuste a las heuristicas del entorno de entrenamiento: al no documentarse la composicion de los oponentes ni el procedimiento de self-play, no se puede descartar que el agente explote patrones especificos del simulador usado.
- Licencia MIT: permite uso comercial y modificacion con atribucion, pero el usuario debe asumir que no hay garantias ni soporte del autor.
- Idoneidad para produccion limitada: sin metricas de latencia, sin versionado de artefactos y sin pipeline de despliegue, el modelo es adecuado para investigacion y experimentacion, no para un servicio en produccion sin trabajo adicional de integracion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/qq456cvb/doudizhu-C
- Codigo y instrucciones de uso: https://github.com/qq456cvb/doudizhu-C
- Paper en arXiv: https://arxiv.org/abs/1901.08925
- Pagina del paper en HuggingFace: https://huggingface.co/papers/1901.08925
- Paper en AIIDE 2020 (AAAI OJS): https://ojs.aaai.org/index.php/AIIDE/article/view/7445
- Pagina del autor: https://qq456cvb.github.io/
