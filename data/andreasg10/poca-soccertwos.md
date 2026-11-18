# AndreasG10/poca-SoccerTwos

## Resumen

`AndreasG10/poca-SoccerTwos` es un agente de aprendizaje por refuerzo profundo entrenado con el algoritmo POCA (una variante de PPO orientada a entornos multiagente cooperativos/competitivos) sobre el entorno `SoccerTwos` de Unity ML-Agents. El entorno SoccerTwos es un escenario de futbol 2 contra 2 en el que dos equipos de agentes compiten por marcar goles en un campo reducido, lo que lo convierte en un banco de pruebas clasico para investigar coordinacion multiagente, comportamiento emergente y politicas competitivas.

El modelo lo publica el usuario AndreasG10 en Hugging Face y esta empaquetado como artefacto de ML-Agents (pesos `.nn`/`.onnx`), no como un modelo de lenguaje. No se trata, por tanto, de un LLM: no procesa ni genera texto, sino que produce acciones de control a partir de observaciones del entorno de simulacion. Su relevancia es acotada al ambito de la investigacion en RL multiagente y a la reproducibilidad de experimentos con ML-Agents.

La informacion disponible es muy limitada: la model card es la plantilla estandar autogenerada por ML-Agents y no incluye detalles de hiperparametros, presupuesto de entrenamiento, recompensas alcanzadas ni configuracion exacta. El repositorio ocupa 0,1 GB, lo que es coherente con un checkpoint de politica neuronal de pequeno tamano.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Politica neuronal de aprendizaje por refuerzo (ML-Agents, algoritmo POCA); topologia exacta no disponible |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (no es un modelo de lenguaje; observaciones por paso del entorno) |
| Tipos de cuantizacion | no disponible (artefacto `.nn`/`.onnx` de ML-Agents) |
| Idiomas soportados | no disponible (no procesa lenguaje natural) |
| Licencia | no disponible |
| Formato de pesos | `.nn` y `.onnx` (ML-Agents / ONNX) |

## Arquitectura y entrenamiento

El agente se entrena con la libreria Unity ML-Agents usando el algoritmo POCA, incluido en el toolkit de ML-Agents para escenarios multiagente. POCA combina ideas de PPO con mecanismos de ventaja contrafactual para estabilizar el aprendizaje en entornos con varios agentes que comparten o compiten por recompensa. El entorno SoccerTwos enfrenta a dos equipos de dos agentes en un campo de futbol simplificado con observaciones vectoriales y acciones discretas de movimiento y patada.

No se dispone de informacion sobre el numero de pasos de entrenamiento, la configuracion YAML empleada (tasas de aprendizaje, tamano de red, coeficientes de recompensa), la composicion del curriculum ni si se aplicaron tecnicas adicionales como self-play o entrenamiento contra oponentes fijos. La model card solo indica que es un agente entrenado y remite a la documentacion oficial de ML-Agents para reproducir o reanudar el entrenamiento. No hay innovaciones tecnicas documentadas mas alla del uso estandar del toolkit.

## Capacidades

- Control de agentes en el entorno `SoccerTwos` de Unity ML-Agents (movimiento y patada en un partido 2 contra 2).
- Aprendizaje de politicas multiagente mediante POCA, con coordinacion entre companeros de equipo.
- Inferencia en el runtime de ML-Agents (Unity) o mediante el fichero ONNX exportado.
- No soporta tool calling ni function calling.
- No soporta razonamiento multi-paso simbolico ni planificacion basada en lenguaje.
- No tiene capacidades multilingues ni de vision (las observaciones son las definidas por el entorno).
- No dispone de modo "thinking", audio ni otras capacidades generativas.

## Casos de uso

- Investigacion en RL multiagente: usar el checkpoint como linea base o punto de partida para estudiar coordinacion y comportamiento emergente en SoccerTwos, comparando con agentes entrenados desde cero.
- Reproduccion de experimentos: cargar el agente en Unity ML-Agents para verificar resultados de un articulo o practica docente sobre POCA y entornos competitivos.
- Entrenamiento por self-play: reanudar el entrenamiento (`mlagents-learn --resume`) usando este agente como oponente o inicializacion para generar politicas mas fuertes.
- Docencia y divulgacion: demostrar en el visor web de Hugging Face (integracion con la organizacion `unity`) como un agente entrenado juega en el navegador sin instalar Unity.
- Evaluacion de robustez: medir la tasa de victorias del agente frente a oponentes heuristicos o checkpoints de distintas fases de entrenamiento para analizar estabilidad de la politica.
- Benchmark interno de algoritmos: comparar POCA con PPO estandar u otros algoritmos de ML-Agents en el mismo entorno usando este checkpoint como referencia de rendimiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tasa de victorias, recompensa media por episodio, Elo interno ni curvas de entrenamiento (TensorBoard) accesibles desde la ficha.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja; el repositorio completo ocupa 0,1 GB, por lo que la politica cabe holgadamente en cualquier GPU consumer (menos de 1 GB en la practica).
- GPU recomendadas: cualquier GPU con soporte CUDA o incluso CPU; no requiere A100 ni H100. Una RTX 4090 o una GTX 1650 son igualmente suficientes para inferencia.
- Cabe en GPU consumer: si, en practicamente cualquier modelo (incluidas iGPU), y tambien en CPU.
- Opciones de despliegue: runtime de Unity ML-Agents (`.nn`), ONNX Runtime (`.onnx`), visor web de Hugging Face para ML-Agents, y entrenamiento/reanudacion con `mlagents-learn`.
- Latencia y throughput: no disponibles; dependen del motor Unity y del hardware, pero al ser una red pequena la inferencia por paso es del orden de microsegundos a pocos milisegundos en GPU.

## Comparativa con modelos similares

| Modelo | Entorno | Algoritmo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| AndreasG10/poca-SoccerTwos | SoccerTwos | POCA | no disponible | no aplica | no disponible | Hugging Face |
| Agentes oficiales de la org. `unity` (ML-Agents) | SoccerTwos y otros | PPO / POCA | no disponible | no aplica | normalmente licencia permisiva del toolkit | Hugging Face (`unity`) |
| Checkpoints de referencia del curso Deep RL de Hugging Face | SoccerTwos | PPO | no disponible | no aplica | segun el curso | Hugging Face |

La comparacion cuantitativa con alternativas no es posible con la informacion disponible, ya que no se publican metricas de rendimiento para este checkpoint ni para las alternativas citadas.

## Limitaciones y advertencias

- Ausencia total de metricas: no hay evidencia publicada de la calidad de la politica (tasa de victorias, recompensa media), por lo que no debe asumirse un nivel de rendimiento concreto.
- Especificidad del entorno: el agente solo es valido para `SoccerTwos` con la configuracion exacta de observaciones y acciones de ML-Agents; no es transferible a otros entornos sin reentrenamiento.
- Licencia no declarada: al no especificarse licencia, no hay garantia de uso comercial; conviene contactar con el autor antes de cualquier despliegue productivo.
- Falta de documentacion de entrenamiento: sin YAML, hiperparametros ni curvas, la reproducibilidad es limitada.
- Riesgo de sobreajuste a oponentes concretos: al desconocerse el regimen de entrenamiento (self-play, oponentes fijos), la robustez frente a politicas no vistas es incierta.
- No es un modelo de lenguaje: no debe evaluarse con criterios de LLM (MMLU, HumanEval, etc.); cualquier comparacion de ese tipo carece de sentido.
- Fecha de creacion futura en los metadatos (2026-11-17): posible inconsistencia en los datos del repositorio que conviene verificar.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AndreasG10/poca-SoccerTwos
- Documentacion de ML-Agents: https://unity-technologies.github.io/ml-agents/ML-Agents-Toolkit-Documentation/
- Repositorio de ML-Agents: https://github.com/Unity-Technologies/ml-agents
- Tutorial corto del curso Deep RL (Hugging Face): https://huggingface.co/learn/deep-rl-course/unitbonus1/introduction
- Tutorial largo de ML-Agents (Hugging Face): https://huggingface.co/learn/deep-rl-course/unit5/introduction
- Organizacion de agentes ML-Agents en Hugging Face: https://huggingface.co/unity
