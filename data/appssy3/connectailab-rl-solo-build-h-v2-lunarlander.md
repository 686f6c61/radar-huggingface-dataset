# appssy3/connectailab-rl-solo-build-h-v2-lunarlander

## Resumen

connectailab-rl-solo-build-h-v2-lunarlander es un agente de aprendizaje por refuerzo entrenado con DQN (Deep Q-Network) para resolver el entorno LunarLander-v3 de Gymnasium. Lo publica el usuario appssy3 en el marco de una colaboracion entre CONNECT AI LAB y AI CITY BUILDERS, y forma parte del material didactico de un curso de reinforcement learning (leccion 5). No es un modelo de lenguaje: es una red neuronal pequena que mapea un vector de estado de 8 dimensiones a una de cuatro acciones discretas.

La red es un perceptron multicapa de tres capas (8 -> 128 -> 128 -> 4) con activaciones ReLU, entrenado con una variante de DQN que incluye red objetivo y actualizacion periodica. El autor declara una recompensa media de 233,6 en 10 episodios no vistos, por encima del umbral de 200 que se suele considerar exito en este entorno.

Su relevancia es limitada fuera del ambito educativo: sirve como ejemplo minimo y reproducible de un pipeline de RL con PyTorch y Gymnasium, y como referencia para comparar hiperparametros y curvas de aprendizaje en un problema de control continuo-discreto de baja dimensionalidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Perceptron multicapa (MLP) con DQN: 8 -> 128 -> 128 -> 4, activacion ReLU |
| Parametros totales | 18.564 (estimado a partir de las dimensiones de las capas) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (entorno de RL con estado de 8 valores por paso) |
| Tipos de cuantizacion | no disponible (pesos en precision nativa PyTorch) |
| Idiomas soportados | no disponible (no procesa lenguaje) |
| Licencia | no disponible |
| Formato de pesos | PyTorch (`model.pt`, `state_dict`) |

## Arquitectura y entrenamiento

La arquitectura es una red fully connected de tres capas lineales con ReLU entre ellas: entrada de 8 dimensiones (posicion x e y, velocidad x e y, inclinacion, velocidad angular y dos flags de contacto de las patas), dos capas ocultas de 128 neuronas y salida de 4 valores Q correspondientes a las acciones de reposo, motor izquierdo, motor central y motor derecho. La accion se selecciona con `argmax` sobre los valores Q, sin politica estocastica en inferencia.

El entrenamiento usa DQN con los siguientes hiperparametros declarados por el autor: 200.000 pasos totales, tasa de aprendizaje 0,0005, factor de descuento 0,99, epsilon de exploracion 0,3, actualizacion de la red objetivo cada 500 pasos y tamano de batch 128. No se especifica el optimizador, el tamano del buffer de repeticion, la politica de decaimiento de epsilon ni si se aplicaron tecnicas adicionales como Double DQN o clipping de recompensas. No hay informacion sobre el numero de semillas ni sobre la varianza entre ejecuciones.

## Capacidades

- Control de politica discreta en LunarLander-v3: selecciona una de cuatro acciones a partir de un estado de 8 valores.
- Inferencia determinista mediante `argmax` sobre los valores Q.
- Entrenamiento reproducible con PyTorch y Gymnasium a partir de los hiperparametros documentados.
- No soporta tool calling ni function calling.
- No soporta razonamiento multi-paso ni comportamiento de agente basado en lenguaje.
- No tiene capacidades multilingues, de vision ni de audio.
- No dispone de modo de razonamiento (thinking mode) ni de generacion de texto.

## Casos de uso

- Docencia de reinforcement learning: sirve como ejemplo completo y de bajo coste computacional para explicar DQN, red objetivo y exploracion epsilon-greedy en un curso introductorio.
- Reproduccion de experimentos: los hiperparametros publicados permiten replicar el entrenamiento y comparar curvas de recompensa con variaciones propias.
- Baseline en investigacion de RL: puede actuar como referencia minima frente a algoritmos mas modernos (PPO, SAC, Rainbow DQN) en el mismo entorno.
- Pruebas de infraestructura de evaluacion: al ser un modelo de menos de 20.000 parametros, es util para validar pipelines de carga de `state_dict`, inferencia en CPU y registro de episodios.
- Demostracion en talleres y charlas: el bajo coste de inferencia permite ejecutarlo en tiempo real en portatiles sin GPU.
- Verificacion de entornos Gymnasium: sirve para comprobar la integracion de la API de Gymnasium con PyTorch en procesos de CI.

## Benchmarks y rendimiento

| Tarea | Dataset/entorno | Metrica | Valor | Verificado |
|---|---|---|---|---|
| Reinforcement learning | LunarLander-v3 | Recompensa media en 10 episodios no vistos (>= 200 = exito) | 233,6 | No |

No se han publicado otros resultados de benchmarks en la informacion disponible. El valor de 233,6 procede de la model card del autor y no esta verificado de forma independiente.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 MB para los pesos; el modelo cabe holgadamente en cualquier GPU, e incluso en CPU.
- GPU recomendadas: ninguna en particular; cualquier GPU con soporte PyTorch es suficiente. Se puede ejecutar en CPU sin penalizacion perceptible.
- Cabe en cualquier GPU de consumo (GTX 1050, RTX 3060, RTX 4090) y en entornos sin GPU.
- Opciones de despliegue: PyTorch nativo, exportacion a TorchScript u ONNX para inferencia ligera. No se ha validado con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles de forma medida; por el tamano de la red, la inferencia por paso es del orden de microsegundos en CPU.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Entorno | Recompensa declarada | Licencia |
|---|---|---|---|---|---|
| connectailab-rl-solo-build-h-v2-lunarlander | DQN (MLP) | ~18.564 (estimado) | LunarLander-v3 | 233,6 | no disponible |
| Algoritmos de referencia de Stable-Baselines3 (DQN, PPO, A2C) | Implementaciones de libreria | variable | LunarLander-v3 | no disponible en esta ficha | MIT (libreria) |
| CLEANRL / implementaciones de referencia de DQN | DQN con CNN o MLP | variable | Atari y clasicos de control | no disponible en esta ficha | MIT (codigo) |

No se dispone de resultados comparables publicados en la informacion proporcionada para establecer una comparacion cuantitativa con alternativas concretas.

## Limitaciones y advertencias

- Modelo especifico de un unico entorno: no generaliza a otras tareas ni a variantes de LunarLander distintas de v3.
- La recompensa de 233,6 no esta verificada de forma independiente y procede de solo 10 episodios, lo que implica alta varianza en la estimacion.
- No se documentan semillas, numero de ejecuciones ni intervalos de confianza; la robustez del resultado es desconocida.
- Licencia no disponible: no se puede confirmar el uso comercial ni la redistribucion de los pesos.
- No se detalla el optimizador, el buffer de repeticion ni posibles tecnicas adicionales (Double DQN, dueling), lo que limita la reproducibilidad exacta.
- Al ser un agente de control y no un modelo de lenguaje, no aplica la advertencia habitual de alucinacion, pero si la de sobreajuste al entorno de entrenamiento.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin evidencia de uso o validacion por terceros.
- La fecha de creacion indicada (2026-11-05) es posterior a la redaccion habitual de fichas tecnicas; conviene verificar la integridad de los metadatos del repositorio.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/appssy3/connectailab-rl-solo-build-h-v2-lunarlander
- CONNECT AI LAB (repositorio del autor): https://github.com/wonseokjung/connect-tycoon
- AI CITY BUILDERS, curso de reinforcement learning: https://www.aicitybuilders.com/robot
