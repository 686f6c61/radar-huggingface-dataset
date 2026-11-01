# Izell088/ppo-LunarLander-v2-unit8-part1

## Resumen

Este repositorio contiene un agente de aprendizaje por refuerzo entrenado con Proximal Policy Optimization (PPO) para resolver el entorno LunarLander-v3 de Gymnasium. Lo publica el usuario Izell088 como parte de la Unit 8 Part I del curso Deep Reinforcement Learning de Hugging Face, y su proposito es servir como checkpoint de referencia para la asignacion practica de dicho curso. No es un modelo de lenguaje: es una politica actor-critica que mapea un vector de 8 caracteristicas del estado a una de 4 acciones discretas.

El agente se implementa en PyTorch sobre Gymnasium y se entrena durante 999.424 pasos de entorno con 16 entornos paralelos, semilla 1 y los hiperparametros estandar de PPO. La evaluacion declarada por el autor sobre 10 episodios arroja una recompensa media de 210,73 con una desviacion tipica de 32,78, lo que situa al agente por encima del umbral de resolucion de LunarLander (200 puntos).

Su relevancia es acotada y didactica: no compite con modelos fundacionales ni con agentes de proposito general, sino que documenta un resultado reproducible de un ejercicio de RL. El repositorio es de tamano practicamente nulo (0,0 GB), con licencia MIT y un unico checkpoint `agent.pt`, lo que lo hace trivial de descargar y ejecutar en cualquier maquina con CPU.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Actor-critico con perceptron multicapa (MLP) para PPO; entrada de 8 caracteristicas, capas ocultas de 64 y 64, activacion Tanh, salida de 4 acciones (actor) y 1 valor (critico) |
| Parametros totales | no disponible (no se declara el recuento; por la arquitectura descrita, del orden de miles de parametros) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (entorno de RL con observaciones de 8 dimensiones; no hay ventana de contexto textual) |
| Tipos de cuantizacion | no disponible (checkpoint PyTorch en `agent.pt`; no se publican variantes cuantizadas) |
| Idiomas soportados | no disponible (no procesa lenguaje natural) |
| Licencia | MIT |
| Formato de pesos | PyTorch (`agent.pt`); metadatos de evaluacion en `evaluation.json` |

## Arquitectura y entrenamiento

La arquitectura es un actor-critico clasico para PPO. El actor recibe las 8 caracteristicas de observacion del entorno LunarLander-v3 y las procesa mediante dos capas ocultas de 64 neuronas con activacion Tanh, produciendo una distribucion sobre 4 acciones discretas (no hacer nada, encender motor izquierdo, encender motor principal, encender motor derecho). El critico comparte la misma estructura de entrada y capas ocultas, pero emite un unico valor escalar de estimacion del retorno. No hay atencion, convoluciones ni componentes recurrentes: es un MLP compacto.

El entrenamiento sigue la configuracion estandar de PPO: tasa de aprendizaje 0,00025, factor de descuento 0,999, lambda de GAE 0,98, coeficiente de recorte 0,2, 16 entornos paralelos, semilla 1 y 999.424 pasos totales de entorno. No se documenta el uso de curricula, recompensas modeladas ni tecnicas adicionales de estabilizacion. El autor indica explicitamente que el checkpoint publicado es el resultado del entrenamiento original y que no se realizo entrenamiento adicional durante la publicacion. Un detalle relevante: la etiqueta `LunarLander-v2` se incluye unicamente para que el comprobador de progreso del curso localice la asignacion; el entorno real de entrenamiento y evaluacion es LunarLander-v3.

## Capacidades

- Control de politica en el entorno LunarLander-v3: selecciona una de 4 acciones discretas a partir de observaciones de 8 dimensiones (posicion, velocidad, angulo, velocidad angular, contacto con patas).
- Aprendizaje por refuerzo con PPO: politica estocastica durante el entrenamiento y determinista en evaluacion, segun la implementacion habitual del curso.
- Reproducibilidad: semilla fija (1) e hiperparametros documentados, lo que permite replicar el entrenamiento.
- Evaluacion declarada: recompensa media de 210,73 sobre 10 episodios, con desviacion tipica de 32,78.
- No soporta tool calling, function calling, agentes multi-paso, razonamiento simbolico, vision, audio ni capacidades multilingues.
- No dispone de modo de pensamiento (thinking mode) ni de generacion de texto de ningun tipo.

## Casos de uso

- Verificacion de la asignacion Unit 8 Part I del curso Deep RL: el checkpoint permite al alumno comparar su propia implementacion de PPO contra un resultado de referencia con recompensa media superior a 200.
- Reproduccion de experimentos docentes: con la semilla y los hiperparametros documentados se puede reentrenar el agente y contrastar la curva de aprendizaje con la reportada.
- Punto de partida para ajuste fino en RL: al ser un MLP pequeno, sirve como inicializacion para variantes del entorno (por ejemplo, cambios en la dinamica de aterrizaje) con bajo coste computacional.
- Evaluacion de algoritmos de RL alternativos: el mismo entorno y la misma metrica permiten comparar PPO con A2C, DQN o SAC usando este agente como linea base.
- Demostracion de inferencia en CPU: el checkpoint se ejecuta sin GPU, lo que facilita su uso en aulas, portatiles y entornos de CI para pruebas de integracion de pipelines de RL.
- Material de docencia sobre actor-critico: la separacion explicita entre actor (4 salidas) y critico (1 salida) con capas de 64 neuronas es un ejemplo minimalista para explicar el flujo de ventajas y la perdida de recorte de PPO.
- Registro de resultados para comparaciones historicas: al estar versionado en Hugging Face con metadatos estructurados (`evaluation.json`), puede citarse como referencia reproducible en informes de practicas.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados de forma independiente):

| Metrica | Valor |
|---|---|
| Recompensa media | 210,73 |
| Desviacion tipica | 32,78 |
| Media menos desviacion tipica | 177,95 |
| Episodios de evaluacion | 10 |
| Pasos de entrenamiento | 999.424 |
| Entorno | LunarLander-v3 |

No se han publicado resultados de benchmarks comparativos con otros agentes en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: practicamente nula; el checkpoint cabe en memoria RAM convencional y no requiere GPU.
- GPU recomendadas: no aplica; cualquier CPU moderna es suficiente. Opcionalmente, una GPU consumer (por ejemplo, RTX 3060 o superior) acelera el reentrenamiento, no la inferencia.
- Cabe en cualquier GPU consumer e incluso en entornos sin GPU; el cuello de botella es la simulacion del entorno, no la red.
- Opciones de despliegue: PyTorch con Gymnasium para cargar `agent.pt` y ejecutar `policy.act(obs)`; no hay soporte para vLLM, llama.cpp, Ollama ni TGI, al no ser un modelo de lenguaje.
- Latencia y throughput: no disponible; no se publican mediciones. Por la arquitectura (dos capas de 64 neuronas), la inferencia por paso es del orden de microsegundos en CPU.

## Comparativa con modelos similares

| Modelo | Algoritmo | Entorno | Recompensa media | Parametros | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Izell088/ppo-LunarLander-v2-unit8-part1 | PPO | LunarLander-v3 | 210,73 +/- 32,78 | no disponible (MLP 64-64) | MIT | Hugging Face |
| Agentes PPO de referencia del curso Deep RL | PPO | LunarLander-v2/v3 | no disponible | MLP similar | variable | Hugging Face (multiples autores) |
| Agentes DQN para LunarLander | DQN | LunarLander-v2 | no disponible | MLP similar | variable | Hugging Face |
| Agentes A2C para LunarLander | A2C | LunarLander-v2 | no disponible | MLP similar | variable | Hugging Face |

No se dispone de cifras verificadas de los modelos alternativos en la informacion proporcionada; la comparacion se limita a la categoria y al algoritmo.

## Limitaciones y advertencias

- Sesgos conocidos: no se documentan sesgos, pero el agente esta sobreajustado a la dinamica concreta de LunarLander-v3; no generaliza a otros entornos ni a variaciones de la fisica.
- Riesgo de alucinacion: no aplica en el sentido de modelos de lenguaje; el riesgo equivalente es una politica fragil que falla en estados poco visitados durante el entrenamiento, como lo refleja la desviacion tipica de 32,78.
- Limitaciones de contexto o idioma: no procesa lenguaje; su entrada esta fijada a 8 caracteristicas y su salida a 4 acciones.
- Restricciones de licencia: licencia MIT, que permite uso comercial y modificacion con atribucion; no obstante, el valor comercial del checkpoint es muy limitado por su especificidad.
- Caveat importante: la etiqueta `LunarLander-v2` es un artefacto de descubrimiento para el comprobador del curso y no indica evaluacion en v2; quien la interprete literalmente obtendra conclusiones erroneas.
- La evaluacion se basa en solo 10 episodios y no esta verificada de forma independiente (`verified: false` en el model-index), por lo que la recompensa media tiene un error de muestreo considerable.
- El repositorio no incluye codigo de entrenamiento ni de evaluacion, solo el checkpoint y los metadatos; la reproducibilidad depende de la implementacion externa del curso.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Izell088/ppo-LunarLander-v2-unit8-part1
- Curso Deep Reinforcement Learning de Hugging Face (Unit 8): https://huggingface.co/learn/deep-rl-course/unit8/introduction
- Entorno LunarLander-v3 en Gymnasium: https://gymnasium.farama.org/environments/box2d/lunar_lander/
- Documentacion de PPO en Stable-Baselines3: https://stable-baselines3.readthedocs.io/en/master/modules/ppo.html
- Repositorio de Gymnasium: https://github.com/Farama-Foundation/Gymnasium
