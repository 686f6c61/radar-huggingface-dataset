# marvameraj/poca-SoccerTwos

## Resumen

poca-SoccerTwos es un agente de aprendizaje por refuerzo profundo entrenado por el usuario marvameraj con Unity ML-Agents para el entorno SoccerTwos, un escenario de futbol 2 contra 2 en el que dos equipos de dos agentes compiten por marcar goles dentro de un entorno de simulacion Unity. El repositorio contiene exclusivamente los artefactos de inferencia del agente (ficheros `.onnx` / `.nn`, junto con los logs de entrenamiento de TensorBoard), con un tamano total de 0,1 GB.

El modelo se ha entrenado con el algoritmo poca de ML-Agents, que en la implementacion de referencia de Unity corresponde a MA-POCA (Multi-Agent POsthumous Credit Assignment), un metodo on-policy disenado especificamente para entornos cooperativos multiagente con numero variable de agentes. A diferencia de un modelo de lenguaje, no procesa texto ni dispone de ventana de contexto: su funcion es mapear observaciones vectoriales o visuales del entorno a acciones discretas o continuas dentro de la simulacion.

Se trata de un artefacto de investigacion y docencia, no de un modelo de proposito general. Su relevancia es doble: por un lado sirve como referencia reproducible para comparar algoritmos de RL multiagente en un benchmark estandar; por otro, es un ejemplo publico del flujo completo de ML-Agents (entrenamiento, exportacion a ONNX y visualizacion en el navegador mediante Hugging Face Spaces). El repositorio no incluye licencia declarada ni documentacion sobre hiperparametros, red o presupuesto de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible en la model card. Agente de RL entrenado con el trainer `poca` de Unity ML-Agents (MA-POCA); la topologia concreta de la red (MLP, LSTM, atencion) no se documenta |
| Parametros totales | No disponible |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica (no es un modelo de lenguaje; procesa observaciones del entorno por paso de simulacion) |
| Tipos de cuantizacion | No disponible (se distribuye en formato ONNX / `.nn` de Unity; no se documentan variantes cuantizadas) |
| Idiomas soportados | No disponible (no procesa lenguaje natural) |
| Licencia | No disponible |
| Formato de pesos | ONNX (`.onnx`) y formato nativo de Unity ML-Agents (`.nn`); logs de TensorBoard |
| Entorno de entrenamiento | ML-Agents SoccerTwos (futbol 2v2, Unity) |
| Tamano del repositorio | 0,1 GB |
| Descargas / likes | 0 / 0 en el momento de la consulta |
| Fecha de publicacion (metadatos) | 25 de septiembre de 2026 |
| Pipeline declarado | `reinforcement-learning` |

## Arquitectura y entrenamiento

El agente se ha entrenado con el trainer `poca` de la libreria Unity ML-Agents. En la implementacion oficial de Unity, `poca` corresponde a MA-POCA, un algoritmo on-policy que introduce un critico centralizado durante el entrenamiento y un mecanismo de asignacion de credito postuma para repartir la recompensa de equipo entre los distintos agentes cooperativos. Este diseno esta pensado para escenarios donde el numero de agentes por equipo puede variar y donde la recompensa es fundamentalmente colectiva, como es el caso de SoccerTwos. La ejecucion en inferencia es descentralizada: cada agente actua a partir de sus propias observaciones.

La model card no incluye informacion sobre el numero de pasos de entrenamiento, la composicion del dataset de experiencias, los hiperparametros del fichero YAML de configuracion, ni si se aplicaron tecnicas adicionales como self-play, curriculum learning o recompensas moldeadas. Tampoco se especifica si la politica usa exclusivamente observaciones vectoriales o incluye camaras (observaciones visuales), lo que condiciona directamente el tamano de la red. La unica evidencia disponible sobre el proceso de entrenamiento son los logs de TensorBoard publicados junto a los pesos.

## Capacidades

- Control de un agente individual dentro del entorno SoccerTwos: percepcion del estado de la simulacion y emision de acciones de movimiento, rotacion, esprint, regate y chute.
- Juego cooperativo 2v2: la politica esta optimizada para coordinarse con un companero de equipo en un escenario con recompensa compartida.
- Inferencia en tiempo real dentro de Unity: el modelo se exporta a ONNX y puede ejecutarse como cerebro de un agente durante la simulacion.
- Reproduccion en navegador: compatible con el visor de agentes de ML-Agents en Hugging Face Spaces, que permite ver al agente jugar sin instalar Unity.
- Reanudacion del entrenamiento: el repositorio esta preparado para retomar el entrenamiento con `mlagents-learn --resume`.
- No dispone de tool calling, function calling, capacidades de agente basadas en lenguaje, razonamiento simbolico, vision general, audio ni procesamiento multilingue. Es un agente de control especifico de tarea.

## Casos de uso

- Linea base en investigacion multiagente: sirve como punto de referencia reproducible en SoccerTwos 2v2 para comparar el rendimiento de MA-POCA frente a PPO, SAC u otros algoritmos sobre el mismo entorno y la misma tarea.
- Estudio de asignacion de credito: dado que MA-POCA esta disenado para repartir recompensa de equipo entre agentes, el agente permite analizar empiricamente como afecta el mecanismo de credito postumo a la coordinacion en tareas cooperativas.
- Evaluacion de algoritmos de auto-juego y curriculum: el checkpoint puede usarse como oponente o companero fijo mientras se entrena una nueva politica, midiendo la mejora de esta ultima contra un rival estable.
- Demostraciones docentes de RL profundo: enlazado con el curso de deep reinforcement learning de Hugging Face, el agente se puede cargar en el visor web para mostrar de forma interactiva el resultado de un entrenamiento con ML-Agents sin escribir codigo.
- Generacion de trayectorias para imitation learning u offline RL: las partidas del agente pueden registrarse para construir un dataset de demostraciones con el que preentrenar o comparar politicas que aprenden de datos en lugar de interaccion.
- Validacion de pipelines de exportacion ONNX: al distribuirse ya en ONNX, es util para probar la integracion de un cerebro de ML-Agents en un runtime de inferencia externo (por ejemplo, una build de Unity o un servicio de simulacion headless).
- Pruebas de regresion de infraestructura: sirve para verificar que una instalacion de ML-Agents, un runner de CI o un entorno de simulacion headless cargan correctamente un modelo preentrenado y producen episodios validos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio incluye logs de TensorBoard (etiqueta `tensorboard`), pero la model card no reproduce ninguna curva, tasa de victoria, recompensa media acumulada ni numero de episodios de evaluacion. No se dispone por tanto de cifras comparables de MMLU, HumanEval, GSM8K ni equivalentes, ya que esos benchmarks no aplican a un agente de control.

## Requisitos de hardware

- Inferencia: al tratarse de una politica de control de tamano reducido y distribuirse en ONNX, la inferencia cabe con holgura en CPU. El repositorio completo ocupa 0,1 GB, por lo que la huella de memoria del modelo es una fraccion de esa cifra (estimacion orientativa, no confirmada por el autor).
- GPU recomendadas para inferencia: cualquiera, incluida una GPU integrada. El agente no requiere aceleracion dedicada; el cuello de botella en SoccerTwos suele ser la simulacion de Unity, no la red.
- GPU para reentrenamiento: entrenar con ML-Agents se beneficia de GPU, pero los entornos SoccerTwos son lo bastante ligeros para entrenar en una GPU de consumo (RTX 3060, RTX 4070, RTX 4090) o incluso en CPU durante mas tiempo. No se documenta el hardware usado por el autor.
- Cabe en GPU de consumo: si, con margen amplio, en cualquier GPU con al menos unos pocos GB de VRAM.
- Opciones de despliegue: Unity ML-Agents (runtime nativo `.nn`), Unity Sentis/Barracuda u otros runtimes ONNX, y el visor de agentes de Hugging Face Spaces para reproduccion en navegador.
- Latencia y throughput: no disponibles. No se han publicado mediciones de pasos por segundo, latencia por decision ni recompensa media.

## Comparativa con modelos similares

| Modelo | Entorno | Algoritmo | Licencia | Documentacion adicional | Disponibilidad |
|---|---|---|---|---|---|
| marvameraj/poca-SoccerTwos | SoccerTwos | poca | No disponible | Solo model card estandar; 0 descargas | Hugging Face |
| akanametov/SoccerTwos | SoccerTwos | poca | No disponible | Model card estandar | Hugging Face |
| akanametov/MLAgents-poca-SoccerTwos | SoccerTwos | poca | No disponible | Incluye metricas de entrenamiento en la ficha | Hugging Face |
| marimurta/poca-SoccerTwos | SoccerTwos | poca | No disponible | Ficha replicada en agregadores | Hugging Face |

Los repositorios comparables son esencialmente equivalentes en planteamiento: agentes poca entrenados sobre el mismo entorno SoccerTwos. Ninguno de ellos publica cifras de rendimiento comparables, por lo que no es posible establecer una jerarquia objetiva entre ellos con la informacion disponible. La diferencia practica se reduce al numero de artefactos publicados, la presencia de metricas de entrenamiento y el nivel de documentacion de la ficha.

## Limitaciones y advertencias

- No hay licencia declarada: en ausencia de terminos explicitos, no se puede asumir permiso para uso comercial ni redistribucion. Conviene contactar con el autor antes de integrarlo en un producto.
- Especificidad total de tarea: el modelo solo es util dentro del entorno SoccerTwos de ML-Agents. No generaliza a otros entornos, a otros juegos ni a tareas de control distintas sin reentrenamiento.
- Ausencia de documentacion de entrenamiento: no se indican hiperparametros, red, numero de pasos ni si se uso self-play o curriculum, lo que dificulta reproducir el resultado o diagnosticar comportamientos anomalos.
- Riesgo de politicas degeneradas: en RL, un checkpoint sin evaluacion publicada puede haber convergido a estrategias locales poco robustas (por ejemplo, posicionamiento pasivo o explotacion de artefactos del simulador). Sin curvas de recompensa no es posible descartarlo.
- Sesgos del entorno: el comportamiento aprendido refleja las recompensas, la fisica y las reglas de SoccerTwos; cualquier sesgo presente en el diseno del entorno se hereda en la politica.
- Dependencia de version: los cerebros de ML-Agents estan ligados a la version de la libreria y del entorno con los que se entrenaron. Cargar el ONNX en una version distinta puede degradar el comportamiento.
- Estado de validacion comunitario: 0 descargas y 0 likes en el momento de la consulta, sin evaluaciones independientes que respalden su rendimiento.
- No es un modelo de lenguaje: no procesa texto, no responde a instrucciones y no tiene capacidades de tool calling, razonamiento verbal ni multilingues.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/marvameraj/poca-SoccerTwos
- Repositorio de Unity ML-Agents: https://github.com/Unity-Technologies/ml-agents
- Documentacion de ML-Agents: https://unity-technologies.github.io/ml-agents/ML-Agents-Toolkit-Documentation/
- Curso de deep RL de Hugging Face, unidad bonus (tutorial corto): https://huggingface.co/learn/deep-rl-course/unitbonus1/introduction
- Curso de deep RL de Hugging Face, unidad 5 (ML-Agents): https://huggingface.co/learn/deep-rl-course/unit5/introduction
- Organizacion de Unity en Hugging Face (visor de agentes): https://huggingface.co/unity
- Modelo comparable: https://huggingface.co/akanametov/SoccerTwos
- Modelo comparable: https://huggingface.co/akanametov/MLAgents-poca-SoccerTwos
- Modelo comparable: https://huggingface.co/marimurta/poca-SoccerTwos
