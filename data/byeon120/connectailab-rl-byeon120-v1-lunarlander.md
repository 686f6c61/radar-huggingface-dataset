# byeon120/connectailab-rl-byeon120-v1-lunarlander

## Resumen

connectailab-rl-byeon120-v1-lunarlander es un agente de aprendizaje por refuerzo profundo entrenado con el algoritmo DQN (Deep Q-Network) para resolver el entorno LunarLander-v3 de Gymnasium. Lo desarrolla el autor byeon120 en el marco del programa educativo CONNECT AI LAB x AI CITY BUILDERS, dentro de su curso de refuerzo de IA (leccion 5). No es un modelo de lenguaje: es una politica neuronal que mapea un vector de estado de 8 dimensiones a una de cuatro acciones discretas (no hacer nada, motor izquierdo, motor central, motor derecho) para aterrizar una nave en una plataforma.

La red es un perceptron multicapa de tres capas (8 -> 128 -> 128 -> 4) con activaciones ReLU, entrenado durante 200.000 pasos con una tasa de aprendizaje de 0,0005, factor de descuento 0,99, exploracion epsilon con periodo de 0,3, sincronizacion de red objetivo cada 500 pasos y tamano de lote de 128. Su relevancia es fundamentalmente didactica: sirve como referencia reproducible de un DQN funcional en un entorno de control continuo-discreto de bajo coste computacional.

El modelo reporta una recompensa media de 215,6 en 10 episodios no vistos, por encima del umbral de 200 que el entorno considera exito. El repositorio es de tamano practicamente nulo (0,0 GB) y contiene un unico fichero de pesos `model.pt`, lo que lo hace trivial de desplegar en CPU.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Perceptron multicapa (MLP) con DQN: 8 -> 128 -> 128 -> 4, activacion ReLU |
| Parametros totales | 18.564 (estimado a partir de la arquitectura: 8x128+128 + 128x128+128 + 128x4+4) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (entorno de refuerzo con estado de 8 dimensiones por paso) |
| Tipos de cuantizacion | no disponible (pesos en punto flotante PyTorch, sin variantes GGUF/INT8 publicadas) |
| Idiomas soportados | no aplica (no es un modelo de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | PyTorch (`model.pt`, state_dict cargable con `torch.load`) |

## Arquitectura y entrenamiento

La arquitectura es un DQN clasico con red Q aproximada por un MLP de dos capas ocultas de 128 neuronas cada una. La entrada son 8 variables continuas del entorno LunarLander-v3 (posicion x e y, velocidad x e y, angulo, velocidad angular e indicadores de contacto de las dos patas) y la salida son los valores Q para cada una de las 4 acciones discretas. La accion se selecciona por `argmax` sobre los valores Q, sin politica estocastica en inferencia.

El entrenamiento emplea los hiperparametros declarados en la model card: 200.000 pasos totales, tasa de aprendizaje 0,0005, gamma 0,99, epsilon de exploracion con periodo 0,3, actualizacion de la red objetivo cada 500 pasos y lote de 128. No se documenta el uso de Double DQN, Dueling DQN, prioritized replay ni otras variantes; tampoco se especifica el tamano del replay buffer, la politica de decaimiento de epsilon ni el numero de episodios de entrenamiento. No hay informacion sobre datos de entrenamiento mas alla de las interacciones generadas por el propio entorno.

## Capacidades

- Control de aterrizaje en LunarLander-v3: selecciona una de cuatro acciones discretas en cada paso a partir de un estado de 8 dimensiones.
- Politica determinista: dado un estado, devuelve la accion con mayor valor Q mediante `argmax`.
- Inferencia en CPU: el modelo es lo bastante pequeno para ejecutarse sin GPU.
- Reproducibilidad didactica: el codigo de carga y uso esta incluido en la model card.
- No soporta tool calling, function calling, agentes multi-paso, generacion de texto, vision, audio ni capacidades multilingues.
- No dispone de modo de razonamiento explicito ni de salida de trazas intermedias.

## Casos de uso

- Docencia de aprendizaje por refuerzo: usar el agente como ejemplo funcional de DQN en un curso introductorio, cargando `model.pt` y comparando la recompensa obtenida con el umbral de exito de 200.
- Baseline en experimentos de RL: servir como referencia de partida para comparar variantes (Double DQN, Dueling, PPO) sobre el mismo entorno LunarLander-v3 con los mismos hiperparametros declarados.
- Pruebas de infraestructura de evaluacion: validar pipelines que ejecutan episodios de Gymnasium y calculan recompensa media en episodios no vistos, dado que el modelo es ligero y determinista.
- Demostraciones en vivo: ejecutar el agente en CPU durante talleres o charlas sin necesidad de hardware especializado, gracias a su tamano de 0,0 GB.
- Verificacion de entornos Gymnasium: comprobar que una instalacion de LunarLander-v3 funciona correctamente reproduciendo el resultado reportado de 215,6 de recompensa media.
- Estudio de estabilidad de DQN: analizar la sensibilidad del agente a cambios en la red objetivo (periodo 500) o en el factor de descuento (0,99) reentrenando desde cero con los hiperparametros documentados.

## Benchmarks y rendimiento

Datos declarados por el autor en el model-index (no verificados de forma independiente):

| Benchmark | Metrica | Valor | Nota |
|---|---|---|---|
| LunarLander-v3 | mean_reward | 215,6 | Media de 10 episodios no vistos; umbral de exito >= 200 |

No se han publicado otros resultados de benchmarks en la informacion disponible. No hay comparaciones con otros agentes DQN, PPO o A2C en el mismo entorno.

## Requisitos de hardware

- VRAM estimada para inferencia: practicamente nula; el modelo ocupa menos de 100 KB en memoria (18.564 parametros en float32).
- GPU recomendadas: no requiere GPU; cualquier CPU moderna es suficiente.
- Cabe en cualquier GPU consumer (RTX 4090, RTX 3060, GTX 1650, etc.) e incluso en dispositivos embebidos.
- Opciones de despliegue: PyTorch nativo (`torch.load` + `nn.Sequential`), exportacion a TorchScript u ONNX si se necesita, o integracion directa en un bucle de Gymnasium.
- Latencia y throughput: no disponibles de forma oficial; por el tamano de la red, la inferencia por paso es del orden de microsegundos en CPU, aunque no se han publicado mediciones.

## Comparativa con modelos similares

No se dispone de informacion sobre otros agentes publicados para LunarLander-v3 en la documentacion proporcionada, por lo que la comparativa cuantitativa no esta disponible.

| Modelo | Parametros | Entorno | Recompensa media | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| connectailab-rl-byeon120-v1-lunarlander | 18.564 (estimado) | LunarLander-v3 | 215,6 (10 episodios) | no disponible | HuggingFace |
| Alternativas DQN/PPO para LunarLander-v3 | no disponible | LunarLander-v3 | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Especifico de un unico entorno: la politica solo es valida para LunarLander-v3 con el espacio de observacion y accion original; no generaliza a otras tareas.
- Sin licencia declarada: no se especifican terminos de uso comercial, redistribucion ni modificacion; conviene contactar con el autor antes de cualquier uso en produccion.
- Resultado no verificado: la recompensa de 215,6 procede del model-index del autor con `verified: false`; no hay evaluacion independiente.
- Sin informacion sobre sesgos: al no tratar datos humanos ni lenguaje, no aplican sesgos sociales, pero tampoco se documenta el comportamiento en estados fuera de distribucion.
- Sin variantes cuantizadas ni formatos alternativos: solo se distribuye `model.pt` en PyTorch; no hay GGUF, ONNX ni TorchScript publicados.
- Detalles de entrenamiento incompletos: faltan el tamano del replay buffer, la politica de decaimiento de epsilon, el numero de episodios y la semilla, lo que dificulta la reproduccion exacta.
- Riesgo de sobreajuste al entorno: el rendimiento puede degradarse si se modifican los parametros fisicos de LunarLander-v3 o la version de Gymnasium.
- Documentacion en coreano: la model card esta redactada en coreano, lo que puede limitar su accesibilidad para parte del publico.

## Enlaces

- HuggingFace: https://huggingface.co/byeon120/connectailab-rl-byeon120-v1-lunarlander
- Repositorio CONNECT AI LAB: https://github.com/wonseokjung/connect-tycoon
- Curso AI CITY BUILDERS (refuerzo): https://www.aicitybuilders.com/robot
- Entorno LunarLander-v3 (Gymnasium): no disponible en la informacion proporcionada
- Paper original de DQN: no disponible en la informacion proporcionada
