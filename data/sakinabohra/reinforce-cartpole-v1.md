# SakinaBohra/REINFORCE-CartPole-v1

## Resumen

REINFORCE-CartPole-v1 es un agente de aprendizaje por refuerzo publicado por SakinaBohra en Hugging Face, entrenado desde cero con PyTorch como parte de la Unidad 4 del curso de Deep Reinforcement Learning de Hugging Face. Implementa el algoritmo REINFORCE (gradiente de politica Monte Carlo) sobre el entorno clasico CartPole-v1 de Gymnasium, cuyo objetivo es mantener un poste en equilibrio sobre un carro aplicando fuerzas laterales.

No es un modelo de lenguaje ni un transformer generativo: es una red neuronal pequena (4 entradas, 16 neuronas ocultas y 2 salidas) que aprende una politica estocastica para un problema de control con espacio de observacion continuo de cuatro dimensiones y dos acciones discretas. Su relevancia es fundamentalmente didactica y de referencia: sirve como ejemplo reproducible de policy gradient, con metricas de evaluacion publicadas y artefactos de entrenamiento (pesos, arquitectura, video y resultados).

El repositorio es de tamano practicamente nulo (0.0 GB segun Hugging Face) y no incluye informacion sobre licencia ni idiomas, ya que no aplica al tratarse de un agente de control. Cualquier uso en produccion requeriria reimplementar la arquitectura y cargar los pesos manualmente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal fully connected (perceptron multicapa): 4 entradas, capa oculta de 16 neuronas con ReLU, salida de 2 acciones con Softmax |
| Parametros totales | no disponible (estimacion: ~114 parametros entrenables, 4x16 + 16 + 16x2 + 2) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (entorno CartPole-v1, observacion de 4 valores por paso) |
| Tipos de cuantizacion | no disponible (pesos en PyTorch float32 por defecto) |
| Idiomas soportados | no aplica |
| Licencia | no disponible |
| Formato de pesos | PyTorch (`policy.pt`, `best_policy.pt`), cargables con `torch.load(..., weights_only=True)` |

## Arquitectura y entrenamiento

La politica es una red neuronal feedforward de dos capas: recibe los cuatro valores de observacion del entorno CartPole-v1 (posicion del carro, velocidad, angulo del poste y velocidad angular), los proyecta a 16 neuronas con activacion ReLU y produce dos logits que se normalizan con Softmax para obtener probabilidades de accion. El algoritmo es REINFORCE puro, un gradiente de politica Monte Carlo que estima el retorno completo del episodio y actualiza los pesos en la direccion que incrementa la probabilidad de las acciones tomadas ponderada por dicho retorno.

El entrenamiento se realizo durante 1.000 episodios con el optimizador Adam, tasa de aprendizaje 0.01 y factor de descuento 1.0 (sin descuento, coherente con un entorno de horizonte finito de 500 pasos). No se menciona el uso de linea base (baseline), entropia adicional, normalizacion de retornos ni otros refinamientos; tampoco se documentan detalles sobre semillas, numero de ejecuciones ni curvas de aprendizaje. Los artefactos incluyen `policy_network.py` con la definicion de la arquitectura, `hyperparameters.json` con la configuracion y `replay.mp4` con una demostracion de juego.

## Capacidades

- Control de politica estocastica en el entorno CartPole-v1: selecciona entre dos acciones discretas (empujar a izquierda o derecha) a partir de cuatro observaciones continuas.
- Aprendizaje por refuerzo con gradiente de politica Monte Carlo (REINFORCE), sin modelo del entorno.
- Evaluacion reproducible: incluye metricas de 100 episodios y archivo JSON con resultados.
- Carga de pesos en PyTorch mediante `torch.load(..., weights_only=True)` recreando la arquitectura de `policy_network.py`.
- No soporta tool calling, function calling, agentes multi-paso, razonamiento simbolico, generacion de texto, vision, audio ni capacidades multilingues.
- No dispone de modo de razonamiento (thinking mode) ni de mecanismos de decodificacion especulativa.

## Casos de uso

- Docencia de aprendizaje por refuerzo: sirve como ejemplo completo y reproducible de REINFORCE para ilustrar gradiente de politica en un curso introductorio, con pesos, hiperparametros y metricas de evaluacion incluidos.
- Baseline de referencia en CartPole-v1: permite comparar nuevas implementaciones (A2C, PPO, DQN) contra un agente que alcanza 490.63 de recompensa media en 100 episodios, lo que facilita validar pipelines de entrenamiento.
- Pruebas de infraestructura de RL: util para verificar que un entorno de ejecucion (Gymnasium, PyTorch, versiones de CUDA/CPU) carga correctamente pesos y reproduce la evaluacion declarada.
- Experimentos de ablation: al ser una red minima (~114 parametros), permite estudiar el efecto de cambiar la linea base, el descuento, la tasa de aprendizaje o el tamano de la capa oculta sin coste computacional apreciable.
- Demostraciones visuales: el archivo `replay.mp4` y el bajo coste de inferencia permiten generar visualizaciones de politica aprendida en tiempo real en CPU, util para material divulgativo.
- Prototipado rapido de agentes en entornos discretos: la arquitectura y el bucle de entrenamiento pueden adaptarse a otros entornos con observaciones continuas y acciones discretas de baja dimension.

## Benchmarks y rendimiento

| Metrica (CartPole-v1, 100 episodios, seleccion estocastica) | Valor |
|---|---|
| Recompensa media | 490.63 |
| Desviacion estandar | 58.37 |
| Recompensa minima | 48 |
| Recompensa maxima | 500 |
| Episodios que alcanzan 500 pasos | 97/100 |
| Media menos desviacion estandar | 432.26 |

No se han publicado resultados de benchmarks comparativos con otros algoritmos (PPO, A2C, DQN) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: practicamente nula (<1 MB); el modelo cabe en memoria de cualquier CPU.
- GPU recomendadas: no necesaria; cualquier CPU moderna ejecuta la inferencia en microsegundos por paso.
- Cabe en cualquier GPU consumer (RTX 4090, RTX 3060, GTX 1650) e incluso en entornos sin GPU.
- Opciones de despliegue: PyTorch nativo (carga con `torch.load`), exportacion a TorchScript u ONNX si se desea, o integracion directa con Gymnasium mediante un bucle de evaluacion.
- Latencia y throughput: no disponibles de forma medida; por el tamano de la red (~114 parametros) la latencia por paso es del orden de microsegundos en CPU, muy por debajo del paso de simulacion del entorno.

## Comparativa con modelos similares

| Modelo | Algoritmo | Parametros | Entorno | Recompensa media | Licencia |
|---|---|---|---|---|---|
| SakinaBohra/REINFORCE-CartPole-v1 | REINFORCE | ~114 (estimado) | CartPole-v1 | 490.63 | no disponible |
| Otros agentes REINFORCE en CartPole-v1 de la comunidad HF | REINFORCE | variable | CartPole-v1 | no disponible | variable |
| Agentes PPO en CartPole-v1 (referencia comun) | PPO | variable | CartPole-v1 | no disponible en esta ficha | variable |
| Agentes DQN en CartPole-v1 (referencia comun) | DQN | variable | CartPole-v1 | no disponible en esta ficha | variable |

No se dispone de datos comparativos verificados en la informacion proporcionada; las filas de alternativas se incluyen solo como categorias de referencia y sus valores no deben tomarse como medidos.

## Limitaciones y advertencias

- El modelo esta especializado exclusivamente en CartPole-v1; no generaliza a otros entornos ni tareas.
- No es un modelo de lenguaje: no procesa texto, imagenes ni audio, y no dispone de capacidades generativas.
- La licencia no esta declarada, por lo que el uso comercial queda en situacion juridica incierta y requiere contactar con el autor.
- No se documentan sesgos, pero al ser un agente entrenado con una unica semilla y sin informacion sobre repetibilidad, los resultados pueden no reproducirse exactamente.
- La evaluacion usa seleccion estocastica de acciones; el rendimiento con seleccion determinista (argmax) no se reporta.
- El repositorio es de 0.0 GB y no incluye informacion sobre versiones de dependencias (PyTorch, Gymnasium), lo que puede provocar incompatibilidades al cargar los pesos.
- No apto para produccion en tareas reales de control: la red y el algoritmo estan pensados para un entorno de juguete con horizonte de 500 pasos.

## Enlaces

- Hugging Face: https://huggingface.co/SakinaBohra/REINFORCE-CartPole-v1
- Curso de Deep Reinforcement Learning de Hugging Face (Unidad 4, referencia del entrenamiento): https://huggingface.co/learn/deep-rl-course
- Entorno CartPole-v1 en Gymnasium: https://gymnasium.farama.org/environments/classic_control/cart_pole/
- Documentacion de PyTorch para `torch.load`: https://pytorch.org/docs/stable/generated/torch.load.html
