# minju2026/connectailab-rl-minju2026-v1-cartpole

## Resumen

connectailab-rl-minju2026-v1-cartpole es un agente de aprendizaje por refuerzo profundo entrenado con el algoritmo DQN (Deep Q-Network) para resolver el entorno CartPole-v1 de Gymnasium. Lo desarrolla el usuario minju2026 en el marco del programa CONNECT AI LAB × AI CITY BUILDERS, concretamente como resultado de la quinta leccion de un curso de IA de refuerzo. No es un modelo de lenguaje: es una politica neuronal que recibe cuatro valores numericos del estado del entorno (posicion y velocidad del carro, angulo y velocidad angular de la barra) y emite una de dos acciones discretas (empujar a la izquierda o a la derecha).

El modelo es deliberadamente minimo: una red totalmente conectada de tres capas (4 → 128 → 128 → 2) con activaciones ReLU, entrenada durante 50.000 pasos con un buffer de repeticion, una tasa de aprendizaje de 0,001, factor de descuento 0,99, epsilon de exploracion durante el 20 % del entrenamiento, sincronizacion de la red objetivo cada 200 pasos y tamano de lote 128. Su relevancia es educativa y de referencia: sirve como ejemplo reproducible de un pipeline DQN completo y como punto de partida para quien quiera verificar el funcionamiento de un agente de refuerzo en un entorno de control clasico.

El repositorio pesa 0,0 GB y contiene unicamente los pesos en formato PyTorch (`model.pt`), ademas de un video de repeticion (`replay.mp4`). No hay informacion sobre licencia, idiomas ni datos de entrenamiento mas alla de los hiperparametros declarados. El autor reporta una recompensa media de 500,0 (el maximo del entorno) en 10 episodios no vistos, aunque el propio model-index marca la metrica como no verificada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal totalmente conectada (MLP) con DQN: 4 → 128 → 128 → 2, activacion ReLU |
| Parametros totales | 17.922 (calculado a partir de las dimensiones de las capas: 4×128+128 + 128×128+128 + 128×2+2) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (entorno de refuerzo con estado de 4 dimensiones) |
| Tipos de cuantizacion | no disponible (pesos en punto flotante PyTorch estandar) |
| Idiomas soportados | no aplica (no es un modelo de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | PyTorch (`model.pt`, state_dict) |

## Arquitectura y entrenamiento

La arquitectura es un perceptron multicapa de tres capas lineales con activaciones ReLU entre ellas, empleado como aproximador de la funcion Q dentro del esquema DQN clasico. La entrada son los cuatro componentes del estado de CartPole-v1 y la salida son dos valores Q, uno por accion; la accion seleccionada es la de mayor valor (`argmax`). El entrenamiento se realizo durante 50.000 pasos de entorno con un tamano de lote de 128, tasa de aprendizaje 0,001, factor de descuento 0,99, fase de exploracion epsilon durante el 20 % del entrenamiento y actualizacion de la red objetivo cada 200 pasos. No se especifica el tamano del buffer de repeticion, la politica de decaimiento de epsilon ni la semilla utilizada.

No hay informacion sobre el numero exacto de episodios de entrenamiento, la composicion del dataset (en refuerzo se genera por interaccion con el entorno) ni sobre tecnicas adicionales como Double DQN, Dueling DQN o prioritised replay. Tampoco se documenta si se aplico algun tipo de normalizacion de estados o recorte de recompensas. La unica innovacion destacable es la propia eleccion del entorno CartPole-v1 como banco de pruebas, un clasico para validar que un agente DQN converge correctamente antes de pasar a entornos mas complejos.

## Capacidades

- Control discreto en el entorno CartPole-v1: recibe el estado de cuatro dimensiones y devuelve una accion binaria (izquierda o derecha).
- Aprendizaje por refuerzo offline: los pesos se cargan y se usan para inferencia sin necesidad de reentrenar.
- Reproducibilidad del pipeline DQN: el autor documenta hiperparametros y estructura de red, lo que permite replicar el entrenamiento.
- Inferencia en CPU: al tratarse de una red de 17.922 parametros, la evaluacion es practicamente instantanea incluso sin GPU.
- No soporta tool calling, function calling, agentes multi-paso, capacidades multilingues, vision, audio ni modo de razonamiento extendido, ya que no es un modelo de lenguaje.

## Casos de uso

- Docencia de aprendizaje por refuerzo: usar el modelo como ejemplo resuelto de DQN en un curso introductorio, cargando `model.pt` y comparando la politica aprendida con la de un agente aleatorio para ilustrar la convergencia.
- Verificacion de pipelines de entrenamiento: integrar el modelo en un test automatizado que compruebe que un agente DQN recien entrenado alcanza la recompensa maxima en CartPole-v1 antes de desplegar codigo en produccion.
- Baseline en investigacion de RL: emplear los pesos como referencia de rendimiento (recompensa media 500) al evaluar variantes como Double DQN o Dueling DQN sobre el mismo entorno.
- Demostracion de inferencia en dispositivos limitados: al tener menos de 18.000 parametros, el modelo cabe en microcontroladores o entornos embebidos con PyTorch Mobile, sirviendo como prueba de concepto de despliegue de politicas ligeras.
- Generacion de datos sinteticos de trayectorias: ejecutar el agente en CartPole-v1 para recolectar episodios etiquetados y usarlos como datos de entrenamiento de otros algoritmos de imitacion o de modelos de mundo.
- Prueba de integracion con Gymnasium: validar que la API de entornos y la carga de pesos desde Hugging Face funcionan correctamente en un pipeline de CI, usando este modelo como caso de prueba minimo.

## Benchmarks y rendimiento

Los unicos datos disponibles son los declarados por el autor en el model-index. No se han publicado resultados adicionales ni comparaciones con otros agentes en la informacion proporcionada.

| Benchmark | Metrica | Valor | Verificado |
|---|---|---|---|
| CartPole-v1 | Recompensa media en 10 episodios no vistos (maximo 500) | 500,0 | No |

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 MB; los pesos en punto flotante de 32 bits ocupan aproximadamente 72 KB (17.922 parametros × 4 bytes).
- GPU recomendadas: ninguna en particular; cualquier GPU con soporte CUDA puede ejecutar el modelo, pero no aporta ventaja frente a CPU.
- Cabe en cualquier GPU de consumo, incluida una GTX 1050 o inferior, y tambien en CPU.
- Opciones de despliegue: PyTorch nativo (carga directa del `state_dict`), TorchScript para exportar a un grafo estatico, o conversion a ONNX para inferencia en otros runtimes. No se ha publicado soporte para vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo de lenguaje.
- Latencia y throughput estimados: no disponibles de forma oficial; por el tamano de la red, la inferencia por paso deberia estar en el orden de microsegundos en CPU moderna, pero no se han publicado mediciones.

## Comparativa con modelos similares

No se dispone de informacion sobre otros modelos comparables en el repositorio ni en la model card. Como referencia cualitativa, cualquier agente DQN entrenado en CartPole-v1 con una red de tamano similar (por ejemplo, 4 → 128 → 128 → 2) seria funcionalmente equivalente, pero no se han identificado alternativas concretas con pesos publicados en la informacion proporcionada.

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| connectailab-rl-minju2026-v1-cartpole | 17.922 | no aplica | 500,0 en CartPole-v1 (no verificado) | no disponible | Hugging Face |
| Alternativas DQN en CartPole-v1 | no disponible | no aplica | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- El modelo solo funciona en CartPole-v1; no generaliza a otros entornos ni a variaciones del entorno con distinta fisica o dimensiones de estado.
- La metrica de recompensa media 500,0 esta marcada como no verificada en el model-index; no se ha validado de forma independiente.
- No se especifica la licencia, por lo que el uso comercial queda en un limbo legal hasta que el autor la declare.
- No hay informacion sobre sesgos, pero al ser un agente de control en un entorno sintetico, los sesgos relevantes serian los derivados de la politica de exploracion y de la distribucion de estados visitados durante el entrenamiento.
- Riesgo de alucinacion no aplica; el riesgo real es que la politica falle en estados fuera de la distribucion de entrenamiento (por ejemplo, angulos extremos) y el episodio termine antes de lo esperado.
- No se documenta el buffer de repeticion ni la semilla, lo que dificulta la reproducibilidad exacta del resultado reportado.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que sugiere que no ha pasado por una revision comunitaria.

## Enlaces

- [Hugging Face: minju2026/connectailab-rl-minju2026-v1-cartpole](https://huggingface.co/minju2026/connectailab-rl-minju2026-v1-cartpole)
- [CONNECT AI LAB (GitHub)](https://github.com/wonseokjung/connect-tycoon)
- [AI CITY BUILDERS - Robot](https://www.aicitybuilders.com/robot)
