# K-9-labs/connectailab-rl-eak-v2-lunarlander

## Resumen

connectailab-rl-eak-v2-lunarlander es un agente de aprendizaje por refuerzo profundo entrenado con DQN (Deep Q-Network) para resolver el entorno LunarLander-v3 de Gymnasium, en el que un modulo lunar debe aterrizar de forma controlada sobre una plataforma. Lo desarrolla K-9-labs en el marco de una colaboracion entre CONNECT AI LAB y AI CITY BUILDERS, presentado como material didactico del curso de refuerzo de AI CITY BUILDERS. No es un modelo de lenguaje: es una red neuronal pequena que aproxima la funcion Q de un agente discreto.

El interes practico es acotado pero claro: sirve como referencia reproducible y minima de un pipeline DQN completo (entorno, red, entrenamiento, evaluacion y pesos publicados) sobre un benchmark clasico de control. La red es un perceptron de tres capas (8 -> 128 -> 128 -> 4 con activaciones ReLU) que consume 8 variables de estado y emite 4 acciones discretas.

El autor declara una puntuacion media de 215,6 en 10 episodios no vistos, por encima del umbral de 200 que el propio autor fija como exito. No hay informacion sobre licencia, idiomas ni datos de entrenamiento mas alla de la configuracion de hiperparametros publicada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal fully-connected (MLP) como aproximador de Q en DQN: 8 -> 128 -> 128 -> 4 con ReLU |
| Parametros totales | no disponible (estimacion: ~18.000, no confirmada por el autor) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje; entrada fija de 8 valores de estado) |
| Tipos de cuantizacion | no disponible (pesos en `model.pt`, sin variantes GGUF/ONNX publicadas) |
| Idiomas soportados | no disponible (no procesa texto) |
| Licencia | no disponible |
| Formato de pesos | PyTorch (`model.pt`, `state_dict`) |

## Arquitectura y entrenamiento

El agente es un DQN clasico con red Q implementada como `nn.Sequential` de tres capas lineales y activaciones ReLU. La entrada son los 8 valores de observacion de LunarLander-v3 (posicion x e y, velocidad x e y, inclinacion, velocidad angular, contacto de pata izquierda y contacto de pata derecha) y la salida son los valores Q de las 4 acciones discretas (no hacer nada, motor izquierdo, motor principal, motor derecho).

La configuracion de entrenamiento declarada por el autor es: 200.000 pasos totales, capas ocultas de 128 unidades, tasa de aprendizaje 0,0005, factor de descuento gamma 0,99, fraccion de exploracion 0,3, frecuencia de actualizacion de la red objetivo de 500 pasos y tamano de lote 128. No se especifica el tipo de exploracion (epsilon-greedy u otra), el tamano del buffer de repeticion, la estrategia de decaimiento de epsilon ni si se aplico doble Q-learning, dueling o prioritized replay; por tanto, se asume un DQN estandar segun la descripcion. No hay informacion sobre semillas, numero de ejecuciones ni varianza de los resultados.

## Capacidades

- Control discreto en el entorno LunarLander-v3 de Gymnasium: selecciona una de 4 acciones a partir de 8 observaciones numericas.
- Politica greedy determinista: la accion se obtiene con `argmax` sobre los valores Q de salida.
- Inferencia en CPU: los pesos se cargan con `map_location='cpu'` y la red es lo bastante pequena para ejecutarse sin GPU.
- Integracion directa con el bucle de Gymnasium: la salida encaja con el espacio de acciones `Discrete(4)` del entorno.
- No soporta tool calling, function calling, agentes multi-paso, razonamiento textual, vision, audio ni capacidades multilingues.
- No dispone de modo de razonamiento explicito ni de generacion de texto de ningun tipo.

## Casos de uso

- Docencia de aprendizaje por refuerzo: sirve como ejemplo completo y reproducible de un DQN funcional (entorno, red, hiperparametros y pesos) para explicar en clase el ciclo de entrenamiento, la funcion Q y la exploracion.
- Verificacion de pipelines de RL: al ser un agente pequeno y conocido, se puede usar como prueba de humo para validar que un entorno Gymnasium, un cargador de pesos PyTorch y un bucle de evaluacion funcionan correctamente antes de escalar a modelos mayores.
- Benchmark de referencia en control: permite comparar rapidamente nuevas variantes (Double DQN, Dueling DQN, PPO) contra una linea base con una puntuacion declarada de 215,6 en LunarLander-v3.
- Demostracion de despliegue ligero: la red cabe en cualquier maquina y se puede servir desde un script de Python o un contenedor minimo para mostrar como empaquetar un agente de RL en produccion.
- Generacion de datos sinteticos de trayectorias: ejecutar la politica greedy para recolectar episodios etiquetados con recompensas, utiles para entrenar modelos de imitacion o para analisis de comportamiento.
- Pruebas de integracion en entornos de simulacion: usar el agente como controlador de aterrizaje en simuladores o videojuegos que reproduzcan la dinamica de LunarLander para validar la logica de fisica y recompensas.

## Benchmarks y rendimiento

Datos declarados por el autor en la model card (metrica no verificada, `verified: false`):

| Tarea | Dataset | Metrica | Valor |
|---|---|---|---|
| reinforcement-learning | LunarLander-v3 | mean_reward (media de 10 episodios no vistos; >= 200 = exito) | 215,6 |

No se han publicado otros resultados de benchmarks en la informacion disponible. No hay datos de desviacion estandar, numero de semillas ni comparacion con otras implementaciones.

## Requisitos de hardware

- VRAM estimada para inferencia: practicamente nula; la red tiene del orden de decenas de miles de parametros y se ejecuta en CPU sin problema.
- GPU recomendadas: no necesaria. Cualquier GPU consumer (por ejemplo, una GTX 1050 o superior) sobra; tambien funciona en CPU.
- Cabe en cualquier GPU consumer, e incluso en entornos sin GPU (Raspberry Pi, contenedores pequenos), siempre que se disponga de PyTorch.
- Opciones de despliegue: script de Python con PyTorch y `huggingface_hub` para descargar `model.pt`; no hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles de forma oficial; por el tamano de la red, la inferencia por paso es del orden de microsegundos a pocos milisegundos en CPU, aunque no hay medicion publicada.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Entorno | Resultado declarado | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| connectailab-rl-eak-v2-lunarlander | DQN (MLP) | no disponible (~18.000 estimados) | LunarLander-v3 | mean_reward 215,6 | no disponible | Hugging Face (K-9-labs) |
| Implementaciones DQN de referencia de Stable-Baselines3 | DQN (MLP) | configurable | LunarLander-v2/v3 | no disponible en esta ficha | MIT (segun el proyecto) | GitHub / PyPI |
| CleanRL `dqn.py` | DQN (MLP) | configurable | Atari y clasicos de Gym | no disponible en esta ficha | MIT (segun el proyecto) | GitHub |

No se dispone de datos publicados de benchmarks de las alternativas en la informacion proporcionada, por lo que la comparacion de rendimiento no puede cuantificarse.

## Limitaciones y advertencias

- Modelo especifico de un unico entorno: la politica solo es valida para LunarLander-v3 con la misma parametrizacion de observaciones y acciones; no generaliza a otros juegos ni a variantes del entorno.
- Resultado no verificado: la metrica de 215,6 esta marcada como `verified: false` y procede unicamente del autor; no hay semillas, repeticiones ni intervalos de confianza publicados.
- Licencia no disponible: no se puede asumir uso comercial permitido; es necesario contactar con el autor antes de cualquier despliegue en produccion.
- Riesgo de sobreajuste o fragilidad: con 200.000 pasos y una red pequena, el rendimiento puede degradarse ante cambios en la dinamica, en la recompensa o en la distribucion de estados iniciales.
- Sin informacion sobre sesgos: al no tratar texto ni datos humanos, no aplican sesgos linguisticos, pero tampoco hay analisis de robustez frente a perturbaciones del entorno.
- Documentacion minima: no se detallan buffer de repeticion, decaimiento de exploracion, semillas ni proceso de seleccion del checkpoint final, lo que dificulta la reproducibilidad exacta.
- Sin soporte de cuantizacion ni formatos alternativos: solo se distribuye `model.pt`; no hay GGUF, ONNX ni versiones optimizadas.

## Enlaces

- Hugging Face: https://huggingface.co/K-9-labs/connectailab-rl-eak-v2-lunarlander
- CONNECT AI LAB (repositorio del autor): https://github.com/wonseokjung/connect-tycoon
- AI CITY BUILDERS, curso de refuerzo: https://www.aicitybuilders.com/robot
- Entorno LunarLander-v3 de Gymnasium: no disponible en la informacion proporcionada (referencia habitual: https://gymnasium.farama.org/environments/box2d/lunar_lander/)
