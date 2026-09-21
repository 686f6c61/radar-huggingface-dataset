# peluz/poca-SoccerTwos

## Resumen

poca-SoccerTwos es una politica de aprendizaje por refuerzo profundo entrenada por el usuario peluz para el entorno SoccerTwos de Unity ML-Agents. No es un modelo de lenguaje ni un modelo multimodal: es una red neuronal de control que juega partidos de futbol 2 contra 2 dentro de la simulacion, entrenada con el entrenador POCA (auto-juego, basado en MA-POCA) de la libreria ML-Agents. El repositorio ocupa 0,2 GB y esta etiquetado como tensorboard y onnx, ademas de incluir los pesos exportados del agente.

El modelo se publica como resultado de un entrenamiento con `mlagents-learn` y esta pensado para reproducir el comportamiento del agente dentro del entorno Unity, no para tareas de procesamiento de lenguaje natural. La model card se limita a indicar como reanudar el entrenamiento y como visualizar al agente en el navegador a traves de la organizacion unity de Hugging Face; no documenta hiperparametros, numero de pasos de entrenamiento, Elo final ni licencia.

En el momento de la consulta acumula 0 descargas y 0 "me gusta", y no se ha publicado ninguna evaluacion cuantitativa en la informacion disponible. Su interes es, por tanto, como pieza reproducible de un pipeline de auto-juego con ML-Agents y como punto de partida para experimentos de asignacion de credito multiagente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red de politica de ML-Agents (perceptron multicapa con normalizacion de observaciones; capas, unidades y posible capa recurrente no especificadas en la model card) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica: el agente consume un vector de observaciones por paso; la model card no especifica su dimension |
| Tipos de cuantizacion | no disponible (ML-Agents exporta a .nn y .onnx; no se documenta cuantizacion) |
| Idiomas soportados | no aplica (no procesa lenguaje natural) |
| Licencia | no disponible |
| Formato de pesos | .nn (formato nativo de ML-Agents) y .onnx (segun las etiquetas del repositorio); no se detalla la lista exacta de ficheros |
| Tipo de entrenamiento | aprendizaje por refuerzo con auto-juego competitivo (trainer POCA) |
| Entorno | SoccerTwos (Unity ML-Agents), partidos 2 contra 2 |
| Tamano del repositorio | 0,2 GB (incluye artefactos de entrenamiento, no solo los pesos) |
| Fecha de publicacion | 2026-09-21 (creacion y ultima actualizacion) |

## Arquitectura y entrenamiento

El agente se entrena con el entrenador POCA de ML-Agents, la configuracion de auto-juego que gestiona escenarios multiagente competitivos con equipos. Este entrenador emplea tipicamente un critico centralizado y un mecanismo de asignacion de credito postuma (MA-POCA) que reparte la recompensa de equipo entre los agentes individuales, ademas de un bucle de auto-juego en el que el modelo se enfrenta a versiones anteriores de si mismo y mantiene una estimacion de Elo para seleccionar rivales. El resultado es una politica que coopera con su companero de equipo y compite contra la pareja rival dentro del mismo entorno.

No hay informacion en la model card sobre el numero de pasos de entrenamiento, el tamano de lote, la tasa de aprendizaje, el numero de entornos paralelos, la composicion exacta de las recompensas ni el uso de demostraciones, curriculo o imitacion. Tampoco se documenta si la politica incorpora memoria recurrente (LSTM) o atencion sobre observaciones. Los artefactos presentes en el repositorio (etiquetas `tensorboard`) sugieren que se conservan los registros de entrenamiento, pero las curvas no se reproducen en la model card y no se pueden citar cifras concretas.

## Capacidades

- Control de un agente de futbol 2 contra 2 en el entorno SoccerTwos de Unity ML-Agents, con politica entrenada para cooperar con su companero y marcar goles.
- Inferencia en el runtime de Unity mediante modelo exportado (ONNX, consumible por Sentis o Barracuda) y en Python a traves de `mlagents-envs`.
- Comportamiento determinista en inferencia (politica de actuacion), adecuado para evaluacion reproducible contra rivales fijos.
- Soporte de reanudacion del entrenamiento con `mlagents-learn <config>.yaml --run-id=<id> --resume`, lo que permite continuar el auto-juego.
- Capacidad de servir como oponente o como inicializacion en experimentos de auto-juego con otros agentes SoccerTwos.
- No dispone de generacion de texto, razonamiento simbolico, codigo, matematicas, vision, audio, tool calling ni capacidades multilingues: es exclusivamente una politica de control dentro de una simulacion.

## Casos de uso

- Demostracion interactiva en el navegador: subir el fichero `.nn` o `.onnx` del repositorio al visualizador de la organizacion unity de Hugging Face permite ver al agente jugar sin instalar Unity, util para divulgacion y para verificar rapidamente que los pesos cargan correctamente.
- Baseline en investigacion de auto-juego: sirve como referencia fija contra la que medir variantes de POCA, PPO o SAC en SoccerTwos, comparando Elo o tasa de victorias a lo largo del entrenamiento.
- Punto de partida para aprendizaje por curriculo: reanudar el entrenamiento cambiando la configuracion de `self_play` (ventana de rivales, frecuencia de intercambio de equipo) permite estudiar como afectan esos parametros a la convergencia.
- Generacion de trayectorias para imitation learning: ejecutar la politica en modo demostracion para recolectar pares observacion-accion y recompensas, y usarlos despues en clonado de comportamiento u offline RL.
- Evaluacion de robustez frente a oponentes: enfrentar esta politica a otros agentes SoccerTwos publicados para medir generalizacion fuera de su propia poblacion de auto-juego.
- Docencia en cursos de refuerzo profundo: el par modelo + entorno es un ejemplo completo de entrenamiento competitivo con ML-Agents, reutilizable en practicas de laboratorio.
- Regresion en pipelines de CI: cargar el ONNX y ejecutar un numero fijo de episodios con semillas conocidas para detectar cambios que degraden la politica al modificar el entorno o el runtime.
- Estudio de asignacion de credito multiagente: analizar como el critico centralizado reparte recompensa entre los dos miembros del equipo en episodios concretos, usando los registros de TensorBoard conservados en el repositorio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye Elo final, tasa de victorias, numero de pasos de entrenamiento ni curvas de aprendizaje, y los resultados de la busqueda web no contienen datos relacionados con el modelo. No se deben asumir cifras de rendimiento a partir del nombre del algoritmo ni del entorno.

## Requisitos de hardware

- Inferencia: al tratarse de una politica de control de tamano reducido (el repositorio completo ocupa 0,2 GB, incluyendo checkpoints y registros), la inferencia se ejecuta en CPU sin necesidad de GPU.
- VRAM estimada: no disponible; en la practica, este tipo de politicas de ML-Agents ocupan unos pocos megabytes en memoria.
- GPU recomendadas: no aplica para inferencia. Para reentrenar con auto-juego, ML-Agents escala con CPU (muchos entornos en paralelo) y aprovecha GPU de forma secundaria; no se especifica hardware de entrenamiento en la model card.
- GPU de consumo: cualquier equipo con CPU moderna puede ejecutar al agente, tambien en portatil; no se requiere RTX 4090 ni similar.
- Opciones de despliegue: Unity con el modelo ONNX (Sentis o Barracuda), Python con `mlagents-envs` junto a `onnxruntime`, y el reproductor web de la organizacion unity de Hugging Face. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles en la informacion proporcionada. Como referencia orientativa no verificada, una politica MLP de este tipo suele resolver una decision por paso en menos de un milisegundo en CPU moderna, muy por debajo del presupuesto de tiempo de un paso de fisica de Unity.

## Comparativa con modelos similares

| Modelo | Tipo | Entorno | Parametros | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| peluz/poca-SoccerTwos | Politica RL con auto-juego (POCA) | SoccerTwos 2v2 | no disponible | no disponible | Publico en Hugging Face, 0,2 GB, 0 descargas, 0 "me gusta" |
| Agentes SoccerTwos de la organizacion unity | Politicas RL de referencia de ML-Agents | SoccerTwos 2v2 | no disponible | no disponible | Publicos en Hugging Face; datos concretos no disponibles en la informacion proporcionada |
| Agentes de los cursos de deep RL de Hugging Face | Politicas RL de ejercicios guiados | Entornos ML-Agents, entre ellos variantes de futbol | no disponible | no disponible | Publicos como parte del material del curso; datos concretos no disponibles |

No se dispone de cifras comparables de rendimiento (Elo, tasa de victorias o recompensa media) para ninguno de los modelos de la tabla en la informacion proporcionada, por lo que la comparacion se limita a formato de publicacion y disponibilidad.

## Limitaciones y advertencias

- Ausencia de licencia: la model card no declara licencia, por lo que no hay autorizacion explicita para uso comercial y el estatus legal de los pesos es incierto.
- Sin validacion externa: 0 descargas y 0 "me gusta" en el momento de la consulta, sin evaluaciones de terceros ni resultados publicados.
- Especificidad total al entorno: el agente solo tiene sentido dentro de SoccerTwos; no es transferible a otros entornos, tareas de NLP ni dominios visuales.
- Hiperparametros y presupuesto de entrenamiento no documentados: imposible reproducir el resultado exacto o juzgar si el entrenamiento convergio.
- Riesgo de sobreajuste a la poblacion de auto-juego: el rendimiento frente a rivales externos o heuristicas nuevas no esta caracterizado.
- Dependencia de la version de ML-Agents y del runtime de Unity: los ficheros `.nn` y `.onnx` pueden requerir versiones concretas para cargar correctamente, y no se indica cual.
- Sin garantias de robustez ni de seguridad: es una politica de simulacion, no un componente para sistemas en produccion con consecuencias fisicas.
- Fechas de publicacion inusuales (2026-09-21) registradas en el repositorio; conviene verificar la integridad y la procedencia de los artefactos antes de reutilizarlos.
- Alucinacion, sesgos de idioma y limitaciones de contexto no aplican en el sentido habitual, ya que el modelo no genera lenguaje; el equivalente aqui es la aparicion de comportamientos degenerados o bucles de politica fuera de la distribucion de entrenamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/peluz/poca-SoccerTwos
- Repositorio de Unity ML-Agents: https://github.com/Unity-Technologies/ml-agents
- Documentacion de ML-Agents: https://unity-technologies.github.io/ml-agents/ML-Agents-Toolkit-Documentation/
- Tutorial corto del curso de deep RL (Huggy the Dog): https://huggingface.co/learn/deep-rl-course/unitbonus1/introduction
- Tutorial largo de ML-Agents del curso de deep RL: https://huggingface.co/learn/deep-rl-course/unit5/introduction
- Organizacion de Unity en Hugging Face (visualizador de agentes): https://huggingface.co/unity
- Nota sobre la busqueda web: los resultados obtenidos (dominio ardmediathek.de y relacionados) no guardan ninguna relacion con el modelo, por lo que no se incluyen como referencias validas.
