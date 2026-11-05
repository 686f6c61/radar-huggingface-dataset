# Luna002-Luna75/connectailab-rl-lunaluna-v1-roadster-ppo

## Resumen

`connectailab-rl-lunaluna-v1-roadster-ppo` es un agente de aprendizaje por refuerzo entrenado con PPO (Proximal Policy Optimization) para una tarea de control continuo muy concreta: hacer aterrizar de forma segura un vehiculo tipo roadster que cae invertido, accionando un propulsor principal (intensidad 0 a 1) y un sistema de giro por gas frio (rango -1 a 1). Lo publica el usuario Luna002-Luna75 en el marco del curso de IA de refuerzo "AI CITY BUILDERS" del CONNECT AI LAB, y no es un modelo de lenguaje: es una politica neuronal (Actor-Critic) empaquetada como repositorio de PyTorch.

El interes tecnico es acotado pero claro: sirve como referencia reproducible de un pipeline PPO completo sobre un entorno Gymnasium de 7 dimensiones de estado y 2 de accion, con hiperparametros explicitos, curva de aprendizaje y video de replay. El autor reporta una tasa de aterrizaje del 92,0 % en 50 episodios no vistos tras 1.000.000 de pasos de entrenamiento.

Conviene subrayar que el repositorio tiene 0,0 GB de tamano y 0 descargas en el momento de la consulta, y que la model card esta redactada en coreano. No hay informacion sobre licencia, idiomas ni pesos publicados en formatos estandar, por lo que su utilidad practica fuera del contexto del curso es limitada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Actor-Critic con MLP de 2 capas, activacion Tanh, 64 nodos ocultos por capa |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (no es un modelo de lenguaje; estado de 7 dimensiones por paso) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo linguistico) |
| Licencia | no disponible |
| Formato de pesos | no disponible (repositorio PyTorch; no se detalla safetensors, GGUF ni checkpoint concreto) |

## Arquitectura y entrenamiento

La politica es una red Actor-Critic con dos capas ocultas de 64 neuronas y activacion Tanh, que mapea un vector de estado de 7 dimensiones (posicion x, y; velocidad vx, vy; inclinacion codificada como sin(theta) y cos(theta); y velocidad angular omega) a una accion continua de 2 dimensiones: intensidad del propulsor principal inferior en [0, 1] y potencia de giro por gas frio en [-1, 1]. El entorno es un simulador Gymnasium denominado "roadster continuo" (로드스터연속).

El entrenamiento usa PPO con los siguientes hiperparametros declarados por el autor: ratio de recorte 0,15, tasa de aprendizaje 0,0003, 16 entornos paralelos, 280 pasos de rollout por entorno (tamano de lote 4.480), 10 epocas de actualizacion por iteracion, minibatch de 256 y 1.000.000 de pasos totales. El autor indica un tiempo de entrenamiento de 39,4 segundos en un Apple M5. No se documenta composicion del dataset (no aplica, es RL online), ni uso de RLHF, DPO o tecnicas de decodificacion especulativa.

## Capacidades

- Control continuo de un vehiculo aereo en caida invertida: gestion conjunta de empuje vertical y par de giro.
- Estabilizacion de orientacion mediante la representacion sin/cos del angulo, que evita discontinuidades en el espacio de estados.
- Politica estocastica entrenada con PPO, apta para evaluacion determinista o con muestreo.
- Generalizacion limitada al entorno de entrenamiento: el autor reporta 92,0 % de exito en 50 episodios no vistos.
- No soporta tool calling, function calling, agentes multi-paso ni razonamiento simbolico.
- No tiene capacidades multilingues, de vision ni de audio.
- No dispone de modo "thinking" ni de ninguna capacidad generativa de texto.

## Casos de uso

- Reproduccion de un pipeline PPO de referencia: el repositorio documenta hiperparametros, numero de entornos y curva de aprendizaje, lo que permite replicar el experimento en un entorno Gymnasium equivalente y comparar resultados.
- Docencia en aprendizaje por refuerzo: sirve como ejemplo completo y de entrenamiento rapido (menos de un minuto en hardware Apple) para explicar recorte de PPO, ventajas de entornos vectorizados y representacion angular.
- Control de aterrizaje en simuladores de fisica: la politica puede integrarse como modulo de control en un simulador de cuerpo rigido para estudiar maniobras de recuperacion de actitud.
- Prueba de algoritmos de RL alternativos: el mismo entorno y espacio de acciones permite comparar PPO frente a SAC o TD3 con una linea base ya entrenada.
- Benchmark de eficiencia en hardware consumer: el tiempo de entrenamiento reportado en Apple M5 ofrece una referencia para medir coste computacional de PPO en tareas de baja dimensionalidad.
- Base para experimentos de robustez: evaluar la caida de la tasa de exito al introducir ruido en observaciones o cambios en la fisica del entorno, partiendo del 92,0 % reportado.

## Benchmarks y rendimiento

| Metrica | Valor | Contexto |
|---|---|---|
| Tasa de aterrizaje en 50 episodios no vistos | 92,0 % | Reportado por el autor |
| Pasos totales de entrenamiento | 1.000.000 | Configuracion PPO declarada |
| Tiempo de entrenamiento | 39,4 s | Apple M5, 16 entornos paralelos |
| Tamano de lote por iteracion | 4.480 | 280 pasos x 16 entornos |

No se han publicado comparaciones con otras politicas ni resultados en benchmarks estandar (MMLU, HumanEval, GSM8K u otros), que ademas no aplican a este tipo de modelo.

## Requisitos de hardware

- VRAM estimada: muy baja; la red es un MLP de 2 capas y 64 nodos, por lo que el checkpoint cabe holgadamente en cualquier GPU consumer (menos de 1 GB en la mayoria de configuraciones).
- GPU recomendadas: no se requiere GPU dedicada; el autor entreno en un Apple M5. Cualquier GPU con soporte CUDA o Metal es suficiente.
- Cabe en GPU consumer: si, practicamente en cualquier modelo (GTX 1650, RTX 3060, RTX 4090), asi como en CPU.
- Opciones de despliegue: PyTorch nativo; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a un agente de RL.
- Latencia y throughput: no disponibles de forma explicita; al tratarse de un MLP de 64x64 la inferencia por paso es del orden de microsegundos en GPU y de decenas de microsegundos en CPU.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| connectailab-rl-lunaluna-v1-roadster-ppo | PPO, MLP Actor-Critic | no disponible | no aplica (estado de 7 dim.) | 92,0 % de exito en 50 episodios | no disponible | HuggingFace, repo de 0,0 GB |
| Politicas PPO de Stable-Baselines3 (referencia generica) | PPO, MLP configurable | segun configuracion | no aplica | depende del entorno | MIT (SB3) | pip, GitHub |
| Agentes RL de CleanRL (referencia generica) | PPO de un solo fichero | segun configuracion | no aplica | depende del entorno | MIT | GitHub |

No se dispone de informacion sobre modelos comparables especificos para el mismo entorno "roadster continuo"; las alternativas citadas son implementaciones genericas de PPO, no politicas entrenadas para esta tarea.

## Limitaciones y advertencias

- La model card esta en coreano; no hay documentacion en castellano ni en ingles.
- No se especifica licencia, lo que impide determinar si el uso comercial esta permitido.
- El repositorio tiene 0,0 GB y 0 descargas: no esta claro que los pesos del checkpoint esten efectivamente publicados o que el repositorio sea funcional.
- El rendimiento del 92,0 % procede de una unica evaluacion de 50 episodios reportada por el autor, sin validacion independiente ni intervalos de confianza.
- La politica esta fuertemente acoplada al entorno "roadster continuo" de Gymnasium; no es transferible a otros simuladores sin reentrenamiento.
- No hay informacion sobre sesgos, riesgo de alucinacion ni comportamiento fuera de distribucion, aunque en RL el riesgo principal es la degradacion ante cambios en la dinamica del entorno.
- No es un modelo de lenguaje: no debe evaluarse con criterios de MMLU, HumanEval ni similares.
- El tiempo de entrenamiento de 39,4 segundos en Apple M5 no es directamente comparable con otros hardware sin conocer el numero de hilos y la version de PyTorch.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Luna002-Luna75/connectailab-rl-lunaluna-v1-roadster-ppo
- Curva de aprendizaje (referenciada en la model card): `learning_curve.png`
- Video de replay (referenciado en la model card): `replay.mp4`
- No se han encontrado en la busqueda web papers, blogs, repositorios ni demos adicionales asociados a este modelo.
