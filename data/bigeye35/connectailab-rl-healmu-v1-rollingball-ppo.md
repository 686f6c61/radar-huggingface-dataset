# bigeye35/connectailab-rl-healmu-v1-rollingball-ppo

## Resumen

`connectailab-rl-healmu-v1-rollingball-ppo` es un agente de aprendizaje por refuerzo entrenado con el algoritmo PPO (Proximal Policy Optimization) mediante la librería Stable-Baselines3 sobre el simulador físico MuJoCo 4.0. Lo desarrolla Connect AI Lab dentro del proyecto HealMu (autor `bigeye35`) y su tarea es controlar un robot esférico tridimensional que debe desplazarse rodando hasta un objetivo sobre un plano. No es un modelo de lenguaje: es una política neuronal de control continuo, empaquetada junto con un simulador interactivo 3D autónomo y material de demostración.

El problema que resuelve es el control de bajo nivel de un robot esférico omnidireccional con observaciones parciales (vector continuo de 7 dimensiones) y acciones de par de rodadura continuas en un rango de ±10 Nm. El repositorio incluye además el entorno `RollingBall-v0` y un script `simulate.py` que permite ejecutar el simulador con controles de cámara orbital, pausa y manipulación en tiempo real de la bola para probar la capacidad de recuperación del agente.

Su relevancia es acotada: se trata de un artefacto de investigación y demostración con cero descargas y cero likes en el momento de la ficha, sin licencia declarada y sin idiomas especificados. Resulta útil como referencia reproducible de un pipeline PPO+MuJoCo completo (entrenamiento, evaluación, simulación interactiva), no como componente listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal MLP (política `MlpPolicy` de Stable-Baselines3) entrenada con PPO |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (no es un modelo de lenguaje; observación de 7 dimensiones) |
| Tipos de cuantizacion | no disponible (pesos en formato `.zip` de Stable-Baselines3) |
| Idiomas soportados | no disponible (no aplica) |
| Licencia | no disponible |
| Formato de pesos | `.zip` (serialización de Stable-Baselines3 / PyTorch) |

Especificaciones adicionales del entorno `RollingBall-v0`:

| Parametro | Valor |
|---|---|
| Agente | Robot esférico 3D, radio 0,2 m, masa 2,0 kg |
| Espacio de observación | Vector continuo de 7 dimensiones (desplazamiento relativo al objetivo, distancia euclídea, velocidad lineal, velocidad angular) |
| Espacio de acción | Vector continuo de 2 dimensiones, par de rodadura en [-1,0, 1,0] (±10 Nm) |
| Recompensa por objetivo | +10,0 cuando la distancia < 0,35 m |
| Penalización por salida | -5,0 cuando \|x\| > 4,3 m o \|y\| > 4,3 m |
| Recompensa de progreso | Potencial continuo basado en la velocidad hacia el objetivo |
| Simulador | MuJoCo 4.0 |
| Framework de entrenamiento | Stable-Baselines3 (PPO) |

## Arquitectura y entrenamiento

La política es una red MLP (`MlpPolicy`) que mapea observaciones continuas de 7 dimensiones a acciones continuas de 2 dimensiones. El entrenamiento se realizó con PPO en Stable-Baselines3 sobre el simulador físico MuJoCo 4.0. La model card no detalla el número de capas ni de neuronas de la red, el número total de pasos de entrenamiento, el tamaño del batch ni los hiperparámetros de PPO (learning rate, clip range, coeficiente de entropía, GAE lambda), por lo que esos datos deben considerarse no disponibles.

El diseño del entorno incorpora una recompensa de potencial continuo alineada con la velocidad hacia el objetivo, combinada con recompensas terminales discretas (+10,0 al alcanzar el objetivo, -5,0 al salir de los límites de ±4,3 m). Este esquema de recompensa shaping busca guiar la exploración del agente hacia el objetivo sin depender exclusivamente de recompensas dispersas. El autor declara una tasa de éxito objetivo del 100% en las secuencias de evaluación, aunque no se especifica el número de episodios evaluados ni la metodología de medición.

## Capacidades

- Control continuo de un robot esférico mediante par de rodadura bidimensional (±10 Nm) sobre un plano simulado en MuJoCo.
- Navegación hacia un objetivo puntual a partir de observaciones parciales (posición relativa, distancia, velocidades lineal y angular).
- Recuperación ante perturbaciones: el simulador permite agarrar y lanzar la bola en tiempo real para probar la respuesta del agente.
- Inferencia determinista mediante `model.predict(obs, deterministic=True)`.
- Ejecución de un simulador 3D interactivo autónomo con controles de cámara orbital, paneo, zoom y pausa.
- No soporta tool calling, agentes multi-paso, capacidades multilingües, visión, audio ni generación de texto: no es un modelo de lenguaje.

## Casos de uso

- Reproducción de un pipeline completo de RL: el repositorio incluye el agente entrenado, el entorno y las dependencias, lo que permite reproducir el entrenamiento y la evaluación de un agente PPO sobre MuJoCo sin infraestructura adicional.
- Docencia y formación en aprendizaje por refuerzo: el entorno `RollingBall-v0` con observaciones de 7 dimensiones y acciones de 2 dimensiones es un caso de control continuo manejable para explicar reward shaping, PPO y evaluación de políticas.
- Pruebas de robustez de políticas: la funcionalidad de agarre y lanzamiento de la bola en el simulador permite evaluar la capacidad de recuperación del agente ante perturbaciones externas.
- Benchmark interno de algoritmos: sirve como referencia base para comparar PPO con otros algoritmos de Stable-Baselines3 (SAC, TD3, A2C) sobre el mismo entorno y presupuesto de entrenamiento.
- Demostración visual de robótica simulada: el GIF de navegación y el reproductor interactivo permiten presentar el comportamiento del agente en charlas, clases o documentación técnica.
- Desarrollo de controladores para robots esféricos: el esquema de observación y acción puede adaptarse como punto de partida para el control de robots de rodadura omnidireccional en simulación antes de un despliegue físico.

## Benchmarks y rendimiento

Datos declarados por el autor en el `model-index` de la model card (no verificados):

| Tarea | Entorno | Métrica | Valor | Verificado |
|---|---|---|---|---|
| reinforcement-learning | RollingBall-v0 | mean_reward | 16,2 | No |

No se han publicado otros resultados de benchmarks en la información disponible (no hay comparación con SAC, TD3, A2C ni con variantes de PPO, ni desglose por episodios o semillas).

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. Al tratarse de una política MLP de dimensiones reducidas (observación de 7 dimensiones, acción de 2 dimensiones), el modelo cabe holgadamente en cualquier GPU consumer moderna e incluso puede ejecutarse en CPU.
- GPU recomendadas: no se especifican. Cualquier GPU con soporte PyTorch es suficiente; una RTX 3060 o superior resulta más que adecuada, y una CPU es viable para inferencia.
- Cabe en GPU consumer: sí, con margen amplio, dado el tamaño reducido de la política.
- Opciones de despliegue: Stable-Baselines3 (`PPO.load`), PyTorch, y el simulador interactivo incluido (`python simulate.py`) con MuJoCo 4.0.
- Latencia y throughput estimados: no disponibles. La inferencia de una MLP de este tamaño es del orden de microsegundos a milisegundos por paso en CPU, pero el autor no publica mediciones.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. Como referencia de categoría, cabría comparar con otros agentes PPO de Stable-Baselines3 sobre entornos MuJoCo (por ejemplo, políticas para `HalfCheetah`, `Hopper` o `Walker2d`), pero no se han encontrado datos verificables en la información disponible para establecer una comparación con cifras.

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| connectailab-rl-healmu-v1-rollingball-ppo | no disponible (MLP) | no aplica | mean_reward 16,2 en RollingBall-v0 | no disponible | Hugging Face |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, no razona, no soporta tool calling ni capacidades multilingües. Cualquier expectativa en ese sentido es incorrecta.
- Licencia no declarada: no se especifican términos de uso comercial, redistribución ni modificación. Antes de cualquier uso en producción es necesario contactar con el autor.
- El único resultado de rendimiento (mean_reward 16,2) está marcado como no verificado y procede del propio autor; no hay evaluación independiente ni desglose por semillas.
- La tasa de éxito del 100% declarada en la model card no incluye la metodología de evaluación (número de episodios, condiciones iniciales, semillas), por lo que no es un dato reproducible tal cual.
- El agente está entrenado específicamente para el entorno `RollingBall-v0` con un robot esférico de 0,2 m de radio y 2,0 kg; no generaliza a otras morfologías, masas o rangos de par sin reentrenamiento.
- El espacio de observación es de 7 dimensiones y no incluye información visual ni de contacto; la política depende de un estado privilegiado que en un robot físico requeriría estimación de estado.
- Riesgo de sobreajuste al simulador (sim-to-real gap): no se documentan pruebas de transferencia a hardware físico ni técnicas de domain randomization.
- Repositorio con 0 descargas y 0 likes en el momento de la ficha: no hay evidencia de uso comunitario ni de mantenimiento continuado.
- El contenido de la model card incluye emojis y formato promocional; conviene tratar las afirmaciones de rendimiento con cautela hasta disponer de verificación independiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/bigeye35/connectailab-rl-healmu-v1-rollingball-ppo
- GIF de demostración de navegación: https://huggingface.co/bigeye35/connectailab-rl-healmu-v1-rollingball-ppo/resolve/main/replay.gif
- Stable-Baselines3 (documentación): https://stable-baselines3.readthedocs.io/
- MuJoCo (documentación): https://mujoco.readthedocs.io/
- Gymnasium (documentación): https://gymnasium.farama.org/
- Repositorio del autor en Hugging Face: https://huggingface.co/bigeye35
