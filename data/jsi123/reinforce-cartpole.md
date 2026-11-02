# JSI123/Reinforce-CartPole

## Resumen

Reinforce-CartPole es un agente de aprendizaje por refuerzo basado en el algoritmo REINFORCE (policy gradient) entrenado con PyTorch para resolver el entorno CartPole-v1 de Gymnasium. Lo desarrolla el usuario JSI123 y se publica como parte del material del curso Deep RL Class, con el objetivo de servir como implementacion de referencia de un agente policy-gradient basico. No es un modelo de lenguaje: es una politica neuronal que mapea el estado de 4 dimensiones del entorno (posicion y velocidad del carro, angulo y velocidad angular de la barra) a una distribucion de probabilidad sobre 2 acciones discretas (empujar a izquierda o derecha).

El interes del artefacto es pedagogico y de reproducibilidad: el autor documenta el algoritmo, los hiperparametros de entrenamiento, los resultados de evaluacion y los artefactos generados (pesos, JSON de resultados y video de la partida). El repositorio tiene un tamano de 0.0 GB, lo que refleja que los pesos de una red de 4 a 64 a 128 a 2 ocupan apenas unos cientos de kilobytes.

La relevancia es limitada fuera del ambito docente: CartPole-v1 es un entorno de control clasico con recompensa maxima de 500, y el modelo declara haber alcanzado ese techo. Sirve como punto de partida para comparar variantes de policy gradient, no como componente de produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal fully-connected (perceptron multicapa) como politica: 4 a 64 a 128 a 2 |
| Parametros totales | No disponible (estimacion a partir de las capas: 4x64 + 64 + 64x128 + 128 + 128x2 + 2 = 8.642 parametros) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (no es un modelo de lenguaje; el estado de entrada es un vector de 4 dimensiones) |
| Tipos de cuantizacion | No disponible (pesos en PyTorch, formato model.pt) |
| Idiomas soportados | No disponible (no procesa lenguaje) |
| Licencia | No disponible |
| Formato de pesos | model.pt (PyTorch) |

## Arquitectura y entrenamiento

La politica es una red neuronal fully-connected con dos capas ocultas de 64 y 128 neuronas que recibe el vector de observacion de 4 dimensiones de CartPole-v1 y produce logits sobre 2 acciones. El entrenamiento sigue el algoritmo REINFORCE clasico: se ejecutan episodios completos, se calculan los retornos descontados con factor gamma de 0.99 y se actualizan los pesos por ascenso de gradiente de la politica con optimizador Adam y tasa de aprendizaje 0.001. Se realizaron 10.000 episodios de entrenamiento.

No se documenta el uso de baseline, normalizacion de retornos, entropy bonus ni otras tecnicas de reduccion de varianza habituales en variantes modernas de REINFORCE; tampoco se detalla la composicion de los datos (aqui el "dataset" es el propio entorno, generado por interaccion). El autor etiqueta la implementacion como custom-implementation dentro del contexto de la Deep RL Class.

## Capacidades

- Control de politica en CartPole-v1: selecciona acciones discretas (izquierda o derecha) a partir del estado de 4 dimensiones.
- Aprendizaje por refuerzo con policy gradient: implementacion de REINFORCE con retornos descontados.
- Reproducibilidad: incluye pesos entrenados (model.pt), resultados de evaluacion (results.json) y video de la partida (replay.mp4).
- No soporta tool calling ni function calling.
- No soporta agentes multi-step fuera del bucle episodico del entorno.
- No tiene capacidades multilingues ni de generacion de texto.
- No dispone de modo thinking, vision ni audio.

## Casos de uso

- Docencia de policy gradient: usar el repositorio como ejemplo minimo y reproducible de REINFORCE, comparando la implementacion con variantes con baseline o actor-critic.
- Punto de partida para experimentos: reutilizar la red 4-64-128-2 y los hiperparametros como linea base al probar mejoras (normalizacion de retornos, entropy bonus) en CartPole-v1.
- Verificacion de pipelines de RL: validar que un entorno de entrenamiento y evaluacion (Gymnasium, PyTorch) funciona correctamente antes de escalar a entornos mas complejos.
- Generacion de demostraciones visuales: el replay.mp4 permite ilustrar el comportamiento de un agente entrenado en presentaciones o materiales docentes.
- Benchmark de referencia en entornos discretos: dado que alcanza la recompensa maxima de 500, sirve como techo contra el que medir agentes nuevos en CartPole-v1.
- Pruebas de infraestructura de inferencia: al ser un modelo diminuto, es util para validar pipelines de carga de pesos y ejecucion de politicas sin coste de computo relevante.

## Benchmarks y rendimiento

Datos declarados por el autor en la model card (metrica no verificada, `verified: false`):

| Tarea | Dataset | Metrica | Valor |
|---|---|---|---|
| Reinforcement Learning | CartPole-v1 | mean_reward | 500.0 +/- 0.0 |

La evaluacion se realizo sobre 10 episodios, con desviacion estandar 0.0 y leaderboard score de 500.0. No se han publicado otros resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 MB para los pesos (red de 8.642 parametros); cualquier GPU o incluso CPU es suficiente.
- GPU recomendadas: no requiere GPU; funciona en CPU sin penalizacion perceptible.
- Cabe en cualquier GPU consumer (RTX 4090, RTX 3060, integradas) y en CPU.
- Opciones de despliegue: PyTorch nativo cargando model.pt; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplicables a este tipo de modelo).
- Latencia y throughput: no disponibles de forma explicita; por el tamano de la red, la inferencia por paso es del orden de microsegundos en CPU.

## Comparativa con modelos similares

| Modelo | Algoritmo | Entorno | Parametros | Recompensa declarada | Licencia |
|---|---|---|---|---|---|
| Reinforce-CartPole (JSI123) | REINFORCE | CartPole-v1 | ~8.642 | 500.0 +/- 0.0 | No disponible |
| Agentes REINFORCE con baseline (referencias docentes) | REINFORCE + baseline | CartPole-v1 | Similar | No disponible | Variable |
| Agentes DQN para CartPole (referencias docentes) | Deep Q-Learning | CartPole-v1 | Similar | No disponible | Variable |

No se dispone de datos de benchmarks comparables verificados en la informacion proporcionada para establecer una comparacion cuantitativa con alternativas.

## Limitaciones y advertencias

- Ambito muy restringido: solo resuelve CartPole-v1; no generaliza a otros entornos ni tareas.
- Resultado no verificado: la metrica de 500.0 +/- 0.0 esta marcada como `verified: false` y se basa en solo 10 episodios de evaluacion, lo que limita la significancia estadistica.
- Sin licencia declarada: no se especifican terminos de uso comercial ni de redistribucion; debe tratarse como no apto para produccion hasta aclarar la licencia.
- Sin informacion sobre sesgos: al no operar sobre datos humanos ni lenguaje, no aplican sesgos sociales, pero tampoco hay documentacion al respecto.
- Riesgo de sobreajuste al entorno: al alcanzar el techo de recompensa, no hay margen para evaluar mejoras; la desviacion 0.0 sugiere evaluacion poco exhaustiva.
- Sin soporte de cuantizacion ni formatos alternativos de pesos: solo model.pt en PyTorch.
- No apto para tareas de lenguaje, vision, agentes conversacionales ni tool calling.

## Enlaces

- HuggingFace: https://huggingface.co/JSI123/Reinforce-CartPole
- Repositorio de artefactos: incluido en el propio repositorio de HuggingFace (model.pt, results.json, replay.mp4)
- Deep RL Class (contexto del curso, referenciado en los tags): no se proporciona enlace directo en la informacion disponible
- Paper de REINFORCE (Williams, 1992): no se proporciona enlace en la informacion disponible
