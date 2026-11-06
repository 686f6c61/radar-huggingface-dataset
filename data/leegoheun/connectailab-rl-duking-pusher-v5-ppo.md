# leegoheun/connectailab-rl-duking-Pusher-v5-ppo

## Resumen

`connectailab-rl-duking-Pusher-v5-ppo` es un agente de aprendizaje por refuerzo (RL) entrenado con PPO (Proximal Policy Optimization) para resolver la tarea `Pusher-v5` del entorno MuJoCo, distribuido a traves de Gymnasium. El modelo controla un brazo robotico de 7 articulaciones cuyo objetivo es empujar un objeto cilindrico sobre una mesa hasta una posicion objetivo. Lo desarrolla el autor `leegoheun` en el contexto del proyecto CONNECT AI LAB (AI CITY BUILDERS), y se publica como un artefacto de politica entrenada en PyTorch.

No se trata de un modelo de lenguaje ni de un modelo fundacional: es una politica neuronal de control continuo. La entrada es un vector de estado de 23 dimensiones (angulos y velocidades articulares, mas coordenadas 3D de la pinza, el objeto y el objetivo) y la salida es un vector de 7 acciones continuas que representan pares de fuerza (torques) en el rango `-2.0` a `2.0`. La red es un MLP con capa oculta de 128 unidades y activacion Tanh.

El interes practico es acotado pero claro: sirve como referencia reproducible de un entrenamiento PPO en un benchmark clasico de control continuo, con hiperparametros documentados y resultados reportados sobre episodios no vistos. Es relevante para quien quiera estudiar la curva de aprendizaje, reproducir el pipeline o comparar variantes de PPO en `Pusher-v5`. No es un modelo para produccion general ni para tareas fuera de este entorno.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MLP (perceptron multicapa) con capa oculta de 128 unidades y activacion Tanh; politica PPO para control continuo |
| Parametros totales | no disponible (no se publica el recuento; estimable en el orden de decenas de miles a partir de entrada 23 y salida 7 con capa oculta 128, pero no confirmado) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (no es un modelo de lenguaje; el estado es un vector de 23 dimensiones por paso) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (no procesa lenguaje) |
| Licencia | no disponible |
| Formato de pesos | no disponible (libreria declarada: pytorch) |

## Arquitectura y entrenamiento

La politica es una red neuronal feedforward de tipo MLP con una capa oculta de 128 unidades y activacion Tanh, entrenada con PPO sobre el entorno `gymnasium.make("Pusher-v5")` de MuJoCo. El espacio de observacion es `Box(23,)` y el de acciones es `Box(7,)` con limites `-2.0` a `2.0`, correspondientes a los torques de las 7 articulaciones del brazo. El agente se entreno durante 500.000 pasos totales con 16 entornos en paralelo, `n_steps=200` por entorno y `batch_size=400`.

Los hiperparametros declarados son: `clip=0.2`, `gamma=0.98`, `gae_lambda=0.95`, `learning_rate=3e-4`, `ent_coef=0.0` y `hidden_dim=128`. No se documenta el numero de tokens ni una composicion de dataset, ya que el aprendizaje es por interaccion con el simulador. Tampoco se indica si hubo tecnicas adicionales como normalizacion de recompensas, curriculum o decodificacion especulativa (no aplicable). El autor reporta un resultado de `-43.4` de puntuacion media en 20 episodios no vistos, con una distancia final media al objetivo de 23,4 cm.

## Capacidades

- Control continuo de un brazo robotico de 7 articulaciones mediante salida de torques.
- Resolucion de la tarea `Pusher-v5`: empujar un objeto cilindrico hasta una posicion objetivo sobre una mesa.
- Generalizacion limitada a episodios no vistos, con rendimiento reportado de `-43.4` de media en 20 episodios.
- No soporta tool calling ni function calling.
- No soporta agentes multi-paso fuera del bucle de control del entorno.
- No tiene capacidades multilingues.
- No dispone de modo de razonamiento (`thinking mode`), vision ni audio.
- Incluye artefactos de video (`training_process.mp4` y `replay.mp4`) para inspeccion cualitativa del entrenamiento y de la politica final.

## Casos de uso

- Reproduccion de un baseline PPO en `Pusher-v5`: util para validar un pipeline de RL con hiperparametros documentados y comparar curvas de aprendizaje frente a nuevas variantes.
- Docencia y formacion en control continuo: el modelo y sus videos permiten ilustrar el comportamiento de PPO en un entorno MuJoCo clasico con espacio de acciones continuo.
- Punto de partida para ajuste fino: se puede reentrenar o continuar el entrenamiento con recompensas modificadas o dominios aleatorizados para estudiar robustez.
- Evaluacion de tecnicas de RL: sirve como referencia para medir el efecto de cambios en `clip`, `gamma`, `ent_coef` o el tamano de la red oculta.
- Demostraciones de robotica simulada: el agente puede ejecutarse en el simulador para generar visualizaciones de manipulacion de objetos con un brazo de 7 articulaciones.
- Benchmark interno de infraestructura: al ser un modelo pequeno, es adecuado para probar pipelines de entrenamiento distribuido con multiples entornos y registro de metricas.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| Entorno | `Pusher-v5` (MuJoCo) |
| Puntuacion media en 20 episodios no vistos | -43.4 |
| Distancia final media al objetivo | 23,4 cm |
| Pasos de entrenamiento | 500.000 |
| Entornos en paralelo | 16 |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible, ya que no aplican a este tipo de modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja; el modelo es un MLP pequeno (entrada 23, salida 7, capa oculta 128) y cabe holgadamente en cualquier GPU consumer, e incluso puede ejecutarse en CPU.
- GPU recomendadas: no se especifican; cualquier GPU con soporte PyTorch es suficiente. Para entrenamiento con 16 entornos MuJoCo en paralelo se recomienda una GPU de gama media o superior, aunque no se documentan requisitos concretos.
- Cabe en GPU consumer: si, sin restricciones practicas conocidas.
- Opciones de despliegue: PyTorch directamente; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplican a este tipo de modelo).
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Entorno | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| `connectailab-rl-duking-Pusher-v5-ppo` | PPO, MLP | `Pusher-v5` | no disponible | no aplica | no disponible | Hugging Face |
| `connectailab-rl-duking-v2-link01` | no disponible | no disponible | no disponible | no aplica | no disponible | Hugging Face |
| `connectailab-rl-duking-v3-link01` | no disponible | no disponible | no disponible | no aplica | no disponible | Hugging Face |

No se dispone de datos de rendimiento comparables entre estas variantes en la informacion proporcionada.

## Limitaciones y advertencias

- El modelo esta especializado exclusivamente en `Pusher-v5`; no generaliza a otras tareas ni entornos sin reentrenamiento.
- El rendimiento reportado es modesto: puntuacion media de `-43.4` y distancia final media de 23,4 cm, lo que indica que la politica no resuelve la tarea de forma consistente.
- No se documentan sesgos, pero al ser un agente de simulacion no aplican sesgos sociales propios de modelos de lenguaje.
- Riesgo de alucinacion: no aplica en el sentido habitual, pero la politica puede producir acciones erroneas fuera de la distribucion de estados vista durante el entrenamiento.
- No se especifica licencia, por lo que el uso comercial queda sin garantias legales explicitas.
- No se documentan limitaciones de contexto ni de idioma porque no procesa lenguaje.
- Para produccion en robotica real seria necesario validar la transferencia sim-a-real, que no se ha documentado.
- El repositorio tiene 0 descargas y 0 likes, y un tamano de 0.0 GB, lo que sugiere que los pesos podrian no estar efectivamente alojados o que el artefacto es minimo; conviene verificarlo antes de usarlo.

## Enlaces

- Hugging Face: https://huggingface.co/leegoheun/connectailab-rl-duking-Pusher-v5-ppo
- Variante v2: https://huggingface.co/leegoheun/connectailab-rl-duking-v2-link01
- Variante v3: https://huggingface.co/leegoheun/connectailab-rl-duking-v3-link01
