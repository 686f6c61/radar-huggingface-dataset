# evenediktov/poca-SoccerTwos

## Resumen

`evenediktov/poca-SoccerTwos` es un agente de aprendizaje por refuerzo entrenado para el entorno SoccerTwos del toolkit Unity ML-Agents. No es un modelo de lenguaje ni un modelo generativo: es una politica neuronal (policy) que controla un agente jugador de futbol 2 contra 2 dentro de una simulacion Unity. El autor del repositorio es el usuario `evenediktov` y el entrenamiento se ha realizado con el algoritmo POCA (el entrenador multiagente de ML-Agents, emparentado con MA-POCA) mediante self-play. El repositorio se creo y actualizo el 14 de octubre de 2026 y ocupa aproximadamente 0,1 GB.

El interes practico de esta ficha es acotado pero claro: sirve como ejemplo reproducible de un flujo completo de entrenamiento con ML-Agents (definicion de entorno, self-play, guardado de la politica y publicacion en el Hub con ficheros `.nn`/`.onnx` para su visualizacion en el navegador). Al tratarse de un agente especifico de un entorno, no comparte categoria con los modelos de lenguaje, vision o audio que suelen aparecer en este blog, por lo que varias de las categorias habituales de la ficha quedan marcadas como no disponibles.

No hay informacion publica sobre licencia, idiomas, cuantizaciones ni resultados de benchmarks. El repositorio no registra descargas ni likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal de politica entrenada con el algoritmo POCA de Unity ML-Agents (aprendizaje por refuerzo multiagente con self-play); topologia concreta de capas: no disponible |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (no es un modelo de lenguaje; trabaja con observaciones vectoriales por paso de simulacion) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica / no disponible |
| Licencia | no disponible |
| Formato de pesos | `.nn` (formato de ML-Agents/Unity Inference Engine) y `.onnx` (ONNX) |
| Entorno | Unity ML-Agents - SoccerTwos (2 contra 2) |
| Algoritmo de entrenamiento | POCA (ML-Agents), con self-play |
| Tamano del repositorio | 0,1 GB |
| Libreria | ml-agents |
| Pipeline declarado en el Hub | reinforcement-learning |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El agente se ha entrenado con POCA, el entrenador de refuerzo multiagente de Unity ML-Agents. Se trata de un metodo de la familia de gradiente de politica con critico centralizado, orientado a entornos cooperativos y competitivos con varios agentes que comparten observaciones y recompensas de equipo. El concepto de asignacion postuma de credito, compartido con MA-POCA, es el mecanismo que permite repartir la recompensa de equipo entre agentes individuales cuando el episodio termina. El entrenamiento de SoccerTwos se realiza tipicamente mediante self-play, es decir, el propio agente genera sus rivales a lo largo del entrenamiento.

No se dispone de informacion publica sobre el numero de pasos de simulacion, el numero de episodios, la composicion del buffer de experiencia, hiperparametros (learning rate, tamano de lote, coeficientes de entropia), ni sobre si se aplicaron tecnicas adicionales como curricula o reward shaping. El repositorio incluye la etiqueta `tensorboard`, lo que indica que el entrenamiento genero registros de TensorBoard, pero no se publican los valores numericos de esas curvas. La politica entrenada se exporta en formato `.nn` para Unity Inference Engine y en `.onnx`, lo que permite ejecutarla fuera del proceso de entrenamiento.

## Capacidades

- Control de un agente de futbol dentro del entorno SoccerTwos de ML-Agents: movimiento, orientacion y acciones de juego definidas por el espacio de acciones del entorno.
- Juego cooperativo en equipo de dos agentes (2 contra 2), con politica aprendida por self-play.
- Inferencia en tiempo real dentro de Unity mediante Unity Inference Engine, o fuera de Unity cargando el fichero `.onnx` con un runtime ONNX.
- Visualizacion directa en el navegador a traves de la integracion del Hub de Hugging Face con los entornos oficiales de Unity.
- Reanudacion del entrenamiento desde el punto guardado con `mlagents-learn ... --resume`.
- No dispone de generacion de texto, razonamiento simbolico, codigo, matematicas, vision de proposito general, tool calling, function calling, agentes multi-paso ni capacidades multilingues: no es un modelo de lenguaje.

## Casos de uso

- Docencia de aprendizaje por refuerzo: sirve como caso practico para explicar self-play, entrenadores multiagente y el ciclo completo de ML-Agents, desde la definicion del entorno hasta la publicacion del modelo en el Hub.
- Reproduccion de experimentos: el repositorio permite partir de una politica ya entrenada y reanudar el entrenamiento con `--resume`, util para comparar hiperparametros o variantes del algoritmo sin empezar de cero.
- Demostracion interactiva en navegador: al estar en formato `.onnx` y alojado en el Hub de Hugging Face, se puede cargar en la pagina de Unity del Hub y ver al agente jugar sin instalar Unity.
- Punto de partida para investigacion en coordinacion multiagente: la politica de SoccerTwos es un banco de pruebas de bajo coste para estudiar cooperacion, asignacion de credito y estabilidad de politicas entrenadas por auto-juego.
- Integracion en pipelines de simulacion propios: el `.onnx` puede cargarse en un runtime ONNX y conectarse a una replica del entorno o a un entorno propio con un espacio de observaciones y acciones equivalente.
- Benchmark interno de infraestructura: sirve para validar cadenas de despliegue de inferencia (Unity Inference Engine, ONNX Runtime) y medir latencia de politica en un caso pequeno y controlado.
- Material de ejemplo para articulos y tutoriales: al ser un modelo pequeno y de un entorno de referencia, es adecuado para ilustrar como se publica un agente entrenado en el Hub.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Para esta categoria de modelos, la metrica habitual en ML-Agents es la puntuacion ELO registrada por el entrenador de self-play en TensorBoard, pero el repositorio no expone valores numericos, ni curvas, ni comparaciones con otros agentes.

## Requisitos de hardware

- Al tratarse de una politica de un entorno de simulacion 2 contra 2, el modelo es pequeno (repositorio de 0,1 GB, que incluye ficheros de TensorBoard ademas de los pesos) y la inferencia del `.onnx`/`.nn` es muy ligera.
- VRAM estimada para inferencia: no disponible de forma exacta; por el tamano del entorno y de la red, cabe con holgura en cualquier GPU consumer moderna e incluso puede ejecutarse solo en CPU.
- GPU recomendadas: no hay una recomendacion publicada. Para el entrenamiento (no la inferencia) ML-Agents se beneficia de GPU con soporte CUDA; para la inferencia del agente es suficiente una GPU integrada o una GTX/RTX de gama baja.
- Cabe en GPU consumer: si, con margen amplio; no se dispone de cifras oficiales de consumo.
- Opciones de despliegue: Unity Inference Engine (formato `.nn`), ONNX Runtime u otro runtime compatible con ONNX (formato `.onnx`), y visualizacion via la pagina de Unity en Hugging Face. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No se dispone de datos numericos para comparar. Como alternativas de la misma categoria se pueden considerar los agentes oficiales de SoccerTwos publicados por la organizacion Unity en Hugging Face (`https://huggingface.co/unity`) y otros agentes POCA/MA-POCA entrenados por la comunidad para el mismo entorno.

| Modelo | Entorno | Algoritmo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| evenediktov/poca-SoccerTwos | SoccerTwos (2v2) | POCA (ML-Agents) | no disponible | no aplica | no disponible | Hub de Hugging Face |
| Agentes oficiales de Unity para SoccerTwos | SoccerTwos (2v2) | Self-play sobre ML-Agents | no disponible | no aplica | no disponible | Organizacion `unity` en Hugging Face |
| Otros agentes POCA/MA-POCA de la comunidad | SoccerTwos u otros entornos de ML-Agents | POCA / MA-POCA | no disponible | no aplica | variable, no disponible | Hub de Hugging Face |

No se dispone de valores de ELO, tasa de victorias ni de ningun otro indicador de rendimiento para establecer una comparacion cuantitativa.

## Limitaciones y advertencias

- Especificidad de entorno: la politica esta entrenada para SoccerTwos y no es transferible a otras tareas sin reentrenamiento.
- Ausencia de licencia declarada: el repositorio no especifica licencia, por lo que no hay autorizacion explicita para uso comercial ni para redistribucion. Conviene contactar con el autor antes de reutilizarlo.
- Sin datos de rendimiento: no hay benchmarks, curvas de ELO ni evaluacion publicada, de modo que no se puede afirmar que el agente juegue a un nivel competitivo.
- Riesgo de sobreajuste al self-play: los agentes entrenados contra si mismos pueden explotar comportamientos que no generalizan frente a rivales externos, incluidos agentes con heuristicas o humanos.
- Sin informacion sobre sesgos: no aplica el concepto habitual de sesgo de modelos de lenguaje, pero no se ha auditado el comportamiento del agente en situaciones limite del entorno.
- Entrenamiento no documentado: se desconocen hiperparametros, numero de pasos y si se aplico curriculum, lo que dificulta reproducir el resultado exacto.
- Idioma y contexto: no aplica; el modelo no procesa lenguaje natural.
- Madurez: repositorio con 0 descargas y 0 likes, sin senales de uso o validacion por parte de la comunidad, y con fechas de creacion y actualizacion separadas por menos de un minuto.
- Dependencia de la version de ML-Agents y de Unity: un cambio de version del toolkit o del entorno puede invalidar la politica o alterar su comportamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/evenediktov/poca-SoccerTwos
- Repositorio de Unity ML-Agents: https://github.com/Unity-Technologies/ml-agents
- Documentacion de ML-Agents: https://unity-technologies.github.io/ml-agents/ML-Agents-Toolkit-Documentation/
- Tutorial corto de ML-Agents (Huggy the Dog): https://huggingface.co/learn/deep-rl-course/unitbonus1/introduction
- Tutorial largo de ML-Agents: https://huggingface.co/learn/deep-rl-course/unit5/introduction
- Organizacion de Unity en Hugging Face (entornos oficiales y visualizacion de agentes): https://huggingface.co/unity
- Documentacion de MA-POCA en ML-Agents (entrenador multiagente relacionado con POCA): https://unity-technologies.github.io/ml-agents/ML-Agents-Toolkit-Documentation/#ma-poca
