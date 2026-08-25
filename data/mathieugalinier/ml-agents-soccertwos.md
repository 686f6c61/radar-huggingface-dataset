# MathieuGALINIER/ML-Agents-SoccerTwos

## Resumen

Este modelo es un agente de aprendizaje por refuerzo entrenado con Unity ML-Agents para jugar a SoccerTwos, el entorno de futbol 2 contra 2 incluido en el kit de herramientas de Unity. Lo desarrolla el usuario MathieuGALINIER y su publicacion en Hugging Face tiene fecha de agosto de 2026. El agente emplea el algoritmo POCA (Proximal Policy Optimization with Collective Attention), una extension de PPO disenada especificamente para escenarios multi-agente con cooperacion y competicion simultaneas.

El modelo resuelve el problema de control de un agente en un entorno competitivo de tiempo real: dos equipos de dos agentes compiten por marcar gol en un campo de futbol simulado. Es relevante como ejemplo de entrenamiento de politicas multi-agente con Unity ML-Agents, y como referencia para desarrolladores que quieren entrenar, evaluar o publicar agentes de RL en el Hub de Hugging Face. La model card es minima y no proporciona detalles sobre el tamano de la red, los hiperparametros de entrenamiento ni los datos utilizados, por lo que gran parte de la informacion tecnica no esta disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | POCA (Proximal Policy Optimization with Collective Attention) sobre ML-Agents |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (agente de RL, no modelo de lenguaje) |
| Tipos de cuantizacion | no aplica |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | .nn / .onnx (formato nativo de Unity ML-Agents) |

## Arquitectura y entrenamiento

El agente se entrena con el algoritmo POCA, implementado en la libreria Unity ML-Agents. POCA es un algoritmo de aprendizaje por refuerzo multi-agente que extiende PPO incorporando un mecanismo de atencion colectiva: cada agente puede atender al estado de los companeros de equipo, lo que facilita el aprendizaje de comportamientos cooperativos en entornos donde los agentes deben coordinarse para lograr un objetivo comun (en este caso, marcar gol en un partido 2v2).

El entrenamiento se realiza en el entorno SoccerTwos de Unity, donde cada agente percibe el estado del juego (posiciones, velocidades, orientacion de la pelota y de los jugadores) y emite acciones continuas de movimiento y golpeo. No se dispone de informacion publica sobre el numero de episodios de entrenamiento, el tamano de la red neuronal ni los hiperparametros exactos utilizados. El modelo se publica como un archivo de pesos en formato .nn o .onnx, listo para cargarse en ML-Agents y ejecutarse en el entorno de Unity.

## Capacidades

- Juego autonomo de SoccerTwos: el agente controla a un jugador en partidos de futbol 2v2 dentro del entorno SoccerTwos de Unity ML-Agents.
- Cooperacion en equipo: gracias a POCA, el agente puede coordinarse con un companero para avanzar hacia la porteria rival.
- Competicion contra oponentes: el agente aprende a defender y a atacar en un entorno competitivo de tiempo real.
- Ejecucion en tiempo real: los pesos se cargan en el runtime de ML-Agents y el agente puede jugar directamente en el navegador mediante la integracion de Hugging Face con Unity.
- Reanudacion de entrenamiento: se puede continuar el entrenamiento desde el estado guardado mediante `mlagents-learn --resume`.
- Integracion con el ecosistema ML-Agents: compatible con el toolkit de Unity para desarrollo y evaluacion de agentes de RL.

## Casos de uso

- Investigacion en aprendizaje por refuerzo multi-agente: el modelo sirve como punto de partida para estudiar comportamientos cooperativos y competitivos en entornos 2v2, comparando POCA con otros algoritmos como PPO o SAC.
- Benchmark de algoritmos de RL: se puede utilizar como politico de referencia para medir el rendimiento de nuevos algoritmos en el entorno SoccerTwos.
- Evaluacion de tecnicas de curriculum learning: el entorno SoccerTwos permite disenar curriculos de dificultad progresiva (1v0, 1v1, 2v2) y este modelo puede servir como oponente o companero en esos experimentos.
- Demo educativa de ML-Agents: el agente puede ejecutarse en el navegador mediante la integracion de Hugging Face, lo que permite demostrar conceptos de RL en clases o talleres sin necesidad de instalar Unity.
- Entrenamiento de politicas de apoyo: se puede usar como agente de "companero fijo" para entrenar a un segundo agente en un entorno de cooperacion, fijando el modelo como referencia.
- Evaluacion de robustez de politicas: al enfrentar al agente contra distintas variantes de oponentes, se puede medir su robustez y generalizacion ante estilos de juego diferentes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de rendimiento (por ejemplo, tasa de victorias, goles por partido o recompensa media) ni comparaciones con otros agentes entrenados en SoccerTwos.

## Requisitos de hardware

- VRAM estimada: no disponible. Los modelos de ML-Agents son redes neuronales pequenas (tipicamente de miles a unos pocos millones de parametros) y pueden ejecutarse en CPU sin necesidad de GPU.
- GPU recomendadas: no disponible; la inferencia de un agente ML-Agents suele funcionar en cualquier GPU moderna o incluso en CPU.
- Compatibilidad con GPU de consumo: si, se puede ejecutar en RTX 3060 o inferiores; no se requiere hardware de datacenter.
- Opciones de despliegue: Unity ML-Agents (runtime oficial), integracion web de Hugging Face (Unity WebGL), y ejecucion local con el binario del entorno.
- Latencia y throughput: no disponibles en la informacion publicada; el entorno se ejecuta en tiempo real (60 FPS típicos en Unity), por lo que la politica debe ser lo suficientemente rapida para decidir en cada frame.

## Comparativa con modelos similares

| Modelo | Algoritmo | Entorno | Autor | Licencia | Formato |
|---|---|---|---|---|---|
| MathieuGALINIER/ML-Agents-SoccerTwos | POCA | SoccerTwos (Unity ML-Agents) | MathieuGALINIER | no disponible | .nn / .onnx |
| Adilbai/ML-Agents-SoccerTwos | no especificado | SoccerTwos | Adilbai | no disponible | no especificado |
| thaslimshaik/ppo-SoccerTwos | PPO | SoccerTwos | thaslimshaik | no disponible | .nn / .onnx |

No hay datos publicados de rendimiento comparativo entre estos modelos. La principal diferencia entre ellos es el algoritmo de entrenamiento: este modelo usa POCA, mientras que `thaslimshaik/ppo-SoccerTwos` usa PPO, lo que puede dar lugar a diferencias en la capacidad de cooperacion del agente. No hay informacion suficiente para establecer una comparativa cuantitativa.

## Limitaciones y advertencias

- Sesgos y limitaciones del entorno: el agente solo sabe jugar a SoccerTwos; no es un modelo de lenguaje ni tiene capacidades generales fuera de este entorno de juego.
- Riesgo de alucinacion: no aplica (no es un modelo generativo de lenguaje).
- Limitaciones de idioma: no aplica; el modelo no procesa lenguaje.
- Licencia: la licencia no esta especificada en la model card, por lo que no se puede garantizar su uso comercial sin consultar al autor.
- Datos de entrenamiento desconocidos: no se han publicado detalles sobre el dataset de experiencias, el numero de episodios ni los hiperparametros, lo que dificulta la reproducibilidad del entrenamiento.
- Rendimiento no verificado: no hay benchmarks publicados, por lo que no se puede afirmar que el agente tenga un buen rendimiento competitivo frente a otros agentes.
- Dependencia de Unity: el modelo requiere el runtime de Unity ML-Agents para ejecutarse; no funciona en frameworks de inferencia estandar como PyTorch o TensorFlow sin conversion.
- Modelo sin actualizaciones: la fecha de actualizacion coincide con la de creacion (2026-08-25), lo que sugiere que no ha recibido mantenimiento posterior.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/MathieuGALINIER/ML-Agents-SoccerTwos
- Documentacion de Unity ML-Agents: https://unity-technologies.github.io/ml-agents/ML-Agents-Toolkit-Documentation/
- Repositorio de Unity ML-Agents: https://github.com/Unity-Technologies/ml-agents
- Tutorial corto de ML-Agents (Hugging Face Deep RL Course): https://huggingface.co/learn/deep-rl-course/unitbonus1/introduction
- Tutorial largo de ML-Agents (Hugging Face Deep RL Course): https://huggingface.co/learn/deep-rl-course/unit5/introduction
- Pagina de entornos Unity en Hugging Face: https://huggingface.co/unity
- Modelo similar (Adilbai): https://huggingface.co/Adilbai/ML-Agents-SoccerTwos
- Modelo similar con PPO (thaslimshaik): https://huggingface.co/thaslimshaik/ppo-SoccerTwos
- Proyecto de investigacion sobre SoccerTwos (nlsnln): https://github.com/nlsnln/soccertwos
- Tutorial de Soccer Twos con ML-Agents (deepanshut041): https://deepanshut041.github.io/Reinforcement-Learning/mlagents/05_soccer_twos/
