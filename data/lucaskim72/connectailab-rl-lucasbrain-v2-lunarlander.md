# lucaskim72/connectailab-rl-lucasbrain-v2-lunarlander

## Resumen

`connectailab-rl-lucasbrain-v2-lunarlander` es un agente de aprendizaje por refuerzo profundo (deep RL) entrenado para resolver el entorno `LunarLander-v3` de Gymnasium. No es un modelo de lenguaje: se trata de una red neuronal de política (Q-network) que mapea un vector de estado de 8 dimensiones a 4 acciones discretas de control del módulo de aterrizaje. Lo publica el usuario `lucaskim72` (Lucasbrain) en el contexto de las sesiones de refuerzo del CONNECT AI LAB y la plataforma AI CITY BUILDERS.

El modelo emplea una arquitectura DQN con mejoras estándar de la familia Rainbow: dueling heads, Double DQN, prioritized experience replay (PER) y n-step returns con n=3. La red es un MLP de dos capas ocultas de 256 unidades. Según la model card, el entrenamiento se realizó durante 250 000 pasos y alcanza una media de 260,8 puntos en 10 episodios de hold-out con semillas fijas (7000-7009), superando el umbral de 200 que el propio entorno considera resuelto.

Su relevancia es acotada: sirve como referencia reproducible de un agente DQN bien ajustado sobre un entorno clásico de control, útil para docencia, comparación de hiperparámetros y verificación de pipelines de RL. No tiene aplicación como modelo generativo ni soporta texto, visión ni tool calling. El repositorio ocupa 0,0 GB y no registra descargas ni likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DQN con dueling heads, Double DQN, PER y n-step (n=3); MLP 8-256-256 con cabezas de valor y ventaja |
| Parametros totales | no disponible (estimado en el orden de 10^5 a partir de las dimensiones 8-256-256-1/4) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (entrada fija de 8 valores de estado) |
| Tipos de cuantizacion | no disponible (pesos en `model.pt` de PyTorch, sin versiones GGUF ni cuantizadas) |
| Idiomas soportados | no disponible (no procesa lenguaje) |
| Licencia | no disponible |
| Formato de pesos | `model.pt` (checkpoint PyTorch con clave `state_dict`) |

## Arquitectura y entrenamiento

La red es un perceptrón multicapa con cuerpo compartido de dos capas `Linear(8, 256)` y `Linear(256, 256)` con activación ReLU. Sobre ese cuerpo se aplican dos cabezas lineales: una de valor escalar (`v`) y otra de ventaja de 4 dimensiones (`a`), combinadas según la formulación dueling `Q = V + A - mean(A)`. Las acciones son cuatro: no hacer nada, motor izquierdo, motor principal y motor derecho. El estado de entrada son 8 escalares: posición x e y, velocidad x e y, ángulo, velocidad angular y contacto de las patas izquierda y derecha.

El entrenamiento declarado en la model card usa 250 000 pasos totales con `lr=0.00025`, `gamma=0.99`, `soft_tau=0.005`, `explore_fraction=0.5`, `grad_clip=10.0`, Double DQN activado, dueling activado, PER activado, n-step de 3 y sin reward shaping (la recompensa es la original de `LunarLander-v3`). No se especifican el tamaño del buffer de replay, la tasa de actualización de la red objetivo ni el número de semillas de entrenamiento. No se documenta ningún uso de RLHF, DPO ni datos supervisados, ya que el aprendizaje es puramente por interacción con el simulador.

## Capacidades

- Control de política discreta en `LunarLander-v3`: selecciona una de 4 acciones a partir de un vector de estado de 8 dimensiones.
- Aterrizaje autónomo con recompensa media de 260,8 en 10 episodios de hold-out (semillas 7000-7009), por encima del umbral de 200 del entorno.
- Inferencia determinista mediante `argmax` sobre los Q-values, sin muestreo estocástico.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso en lenguaje natural: no disponible.
- Capacidades multilingües: no aplica.
- Modo thinking, visión o audio: no disponible.

## Casos de uso

- Docencia de deep RL: sirve como ejemplo completo y reproducible de un DQN con dueling, Double y PER sobre un entorno de Gymnasium, con hiperparámetros explícitos en la model card para replicar el experimento en clase.
- Verificación de pipelines de entrenamiento: al estar evaluado con semillas fijas (7000-7009), permite comprobar que un entorno reimplementado o una versión distinta de Gymnasium produce recompensas comparables.
- Baseline para comparación de algoritmos: se puede contrastar frente a PPO, A2C o SAC sobre el mismo entorno para medir la brecha de rendimiento con un DQN bien ajustado.
- Estudio de ablation de componentes Rainbow: el checkpoint permite aislar el efecto de dueling, PER y n-step reentrenando variantes y comparando contra esta referencia.
- Demostración de agentes en simuladores físicos: útil para mostrar en talleres cómo un MLP pequeño resuelve una tarea de control continuo discretizado sin necesidad de GPU.
- Pruebas de integración de `huggingface_hub` en flujos de RL: el snippet de la model card descarga `model.pt` con `hf_hub_download` y carga el `state_dict`, lo que sirve para validar pipelines de distribución de checkpoints.
- Evaluación de robustez ante semillas: al fijar semillas de evaluación, se puede medir la varianza del agente y detectar sobreajuste a las condiciones de entrenamiento.

## Benchmarks y rendimiento

| Metrica | Valor | Condiciones |
|---|---|---|
| Recompensa media hold-out | 260,8 | 10 episodios, semillas 7000-7009, recompensa original de `LunarLander-v3` |
| Umbral de exito del entorno | 200 | Criterio de `LunarLander-v3` |
| Pasos de entrenamiento | 250 000 | segun model card |

No se han publicado resultados de benchmarks en la informacion disponible mas alla de la recompensa media de hold-out indicada por el autor.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB; la red es un MLP de dos capas de 256 unidades y el checkpoint completo ocupa 0,0 GB segun el repositorio.
- GPU recomendadas: cualquier GPU con soporte CUDA es suficiente; tambien funciona en CPU sin penalizacion perceptible por la latencia del simulador.
- Cabe en cualquier GPU de consumo (GTX 1050, RTX 2060, RTX 3060, RTX 4090) e incluso en CPU.
- Opciones de despliegue: PyTorch nativo con `torch.load` y `state_dict`, tal como muestra la model card. No se documentan exportaciones a ONNX, TorchScript, vLLM, llama.cpp, Ollama ni TGI, y ninguna de ellas aplica a este tipo de modelo.
- Latencia y throughput: no disponibles de forma oficial; por la arquitectura, la inferencia por paso es del orden de microsegundos en CPU, muy por debajo del coste del paso de simulación de Gymnasium.

## Comparativa con modelos similares

| Modelo | Tipo | Entorno | Parametros | Contexto | Rendimiento | Licencia |
|---|---|---|---|---|---|---|
| connectailab-rl-lucasbrain-v2-lunarlander | DQN dueling + Double + PER + n-step | LunarLander-v3 | no disponible | no aplica | 260,8 medio en hold-out | no disponible |
| DQN de referencia de Stable-Baselines3 | DQN estandar | LunarLander-v3 | no disponible | no aplica | no disponible | MIT (libreria) |
| PPO de referencia de Stable-Baselines3 | PPO | LunarLander-v3 | no disponible | no aplica | no disponible | MIT (libreria) |
| Agentes de la leaderboard de Gymnasium | varios | LunarLander-v3 | no disponible | no aplica | no disponible | variable |

No se dispone de cifras verificables de los modelos alternativos en la informacion proporcionada; la comparacion cuantitativa queda pendiente de evaluacion directa sobre las mismas semillas.

## Limitaciones y advertencias

- Especificidad total al entorno: el agente solo funciona con la version `LunarLander-v3` de Gymnasium y su espacio de observacion de 8 dimensiones; cualquier cambio en la dinamica o en la escala de recompensas invalida el checkpoint.
- Sin licencia declarada: no se especifica licencia en el repositorio, por lo que el uso comercial queda en un limbo legal hasta que el autor la defina.
- Evaluacion limitada: la metrica de 260,8 se basa en 10 episodios con semillas fijas, una muestra pequena que no garantiza robustez ante condiciones iniciales no vistas.
- Sin documentacion de sesgos ni de analisis de fallos: no hay informacion sobre episodios de colision, consumo excesivo de combustible o comportamientos degenerados.
- Riesgo de sobreajuste a las semillas de evaluacion: al ser un conjunto de 10 semillas fijas, el resultado puede no ser representativo de la distribucion completa de episodios.
- Sin garantias de reproducibilidad completa: faltan datos como el tamano del buffer de replay, la frecuencia de actualizacion de la red objetivo y el numero de semillas de entrenamiento.
- No aplica como modelo generativo: no procesa texto, no soporta tool calling ni razonamiento multi-paso en lenguaje natural.
- Repositorio sin traccion: 0 descargas y 0 likes en el momento de la consulta, sin senales de validacion por parte de la comunidad.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/lucaskim72/connectailab-rl-lucasbrain-v2-lunarlander)
- [CONNECT AI LAB (GitHub)](https://github.com/wonseokjung/connect-tycoon)
- [AI CITY BUILDERS - Reinforcement Learning](https://www.aicitybuilders.com/robot)
