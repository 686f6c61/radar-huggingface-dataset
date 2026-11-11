# bigeye35/connectailab-rl-healmu-humanoid-v5-ppo

## Resumen

`connectailab-rl-healmu-humanoid-v5-ppo` es una politica de aprendizaje por refuerzo entrenada con PPO (Proximal Policy Optimization) para la tarea `Humanoid-v5` del entorno Gymnasium/MuJoCo. El modelo, publicado por el usuario `bigeye35` bajo la etiqueta organizativa CONNECT AI LAB × AI CITY BUILDERS, aprende a controlar un humanoide simulado de 17 actuadores para caminar de forma estable durante episodios completos de 1.000 pasos.

El problema que aborda es el control continuo de alta dimensionalidad: a partir de observaciones de 348 dimensiones (estado articular, velocidades, contacto, etc.), la red produce 17 acciones de par motor continuas. La model card reporta que la politica completa los 1.000 pasos de episodio en las 10 semillas de evaluacion (9000-9009) y avanza unos 45,3 m a 1,81 m/s, con una recompensa media de 8.405,9 puntos.

Es relevante como referencia reproducible de entrenamiento PPO en MuJoCo: el repositorio inclui no solo los pesos (`model.pt`) sino tambien las estadisticas de normalizacion de observaciones (`obs_norm.npz`), la definicion de recompensas biomecanicas (`added_scores.py`) y un JSON de integracion para un playground 3D web. Conviene tratarlo como artefacto de investigacion en simulacion, no como un modelo de lenguaje: no procesa texto ni tiene capacidades generativas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MLP [348 -> 256 -> 256 -> 17] con activacion Tanh (politica actor PPO) |
| Parametros totales | no disponible (estimable en ~106.000 a partir de la topologia MLP declarada) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (entorno de control continuo; horizonte de episodio de 1.000 pasos) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo no linguistico) |
| Licencia | no disponible |
| Formato de pesos | PyTorch (`model.pt`); JSON (`actor.json`); NumPy (`obs_norm.npz`) |

## Arquitectura y entrenamiento

La politica es una red MLP de tres capas (entrada 348, dos capas ocultas de 256 unidades, salida 17) con activacion Tanh, que mapea el vector de observacion del `Humanoid-v5` a 17 acciones continuas de control articular. El entrenamiento usa PPO con GAE (`lambda=0.95`, `gamma=0.99`) y una desviacion logaritmica inicial de exploracion (`log_std=-2.0`, equivalente a sigma aproximada de 0,135). Las observaciones se normalizan en tiempo real con media y varianza almacenadas en `obs_norm.npz`.

La model card describe una funcion de recompensa aumentada con terminos biomecanicos ponderados: postura de cintura y pecho (0,4), rodillas y centro de masa (1,0), elevacion (0,5), control de sobreflexion y altura del pie (0,25), y balanceo de brazos y equilibrio del pie (0,2-0,25). No se especifica el numero total de pasos de entrenamiento, la composicion del dataset (aqui generado por simulacion) ni si se aplicaron tecnicas adicionales como curriculum learning o domain randomization. La evaluacion reportada usa 10 semillas de holdout (9000-9009), lo que sugiere una separacion entre semillas de entrenamiento y evaluacion, aunque el detalle no se documenta.

## Capacidades

- Control motor continuo de un humanoide simulado de 17 articulaciones en MuJoCo (`Humanoid-v5`).
- Locomocion bípeda estable durante episodios completos de 1.000 pasos sin caida en las 10 semillas evaluadas.
- Velocidad sostenida de aproximadamente 1,81 m/s (unos 6,5 km/h) con desplazamiento medio de 45,32 m por episodio.
- Normalizacion de observaciones en linea mediante estadisticas precalculadas (`obs_norm.npz`).
- Integracion con playground 3D web de MuJoCo mediante `actor.json`.
- No dispone de tool calling, function calling, agentes, razonamiento multi-paso, capacidades multilingues, vision, audio ni modo de pensamiento.

## Casos de uso

- Investigacion en aprendizaje por refuerzo: servir como linea base PPO reproducible para comparar algoritmos (SAC, TD3, Dreamer) sobre `Humanoid-v5` con las mismas semillas de evaluacion 9000-9009.
- Estudio de funciones de recompensa biomecanicas: `added_scores.py` permite analizar como las ponderaciones de postura, rodilla y balanceo de brazos afectan la marcha resultante.
- Simulacion de locomotion para videojuegos y animacion: la politica puede controlar personajes humanoides en motores fisicos compatibles con MuJoCo, aportando marchas naturales a 1,81 m/s.
- Transferencia sim-a-real como referencia: aunque no se documenta transferencia a hardware, el modelo sirve de punto de partida para estudiar robustez ante cambios de masa, friccion o retardo de actuacion.
- Docencia y demostraciones interactivas: `actor.json` facilita visualizar la politica en un playground web 3D sin infraestructura GPU dedicada.
- Evaluacion de robustez: las 10 semillas de holdout permiten medir varianza de recompensa (8.368,9-8.435,8) y detectar sensibilidad a condiciones iniciales.
- Benchmarking de normalizacion de observaciones: comparar el efecto de `obs_norm.npz` frente a normalizacion por lotes o sin normalizacion en estabilidad de entrenamiento.

## Benchmarks y rendimiento

Resultados reportados por el autor en 10 semillas de holdout (9000-9009) sobre `Humanoid-v5`:

| Metrica | Media | Mejor | Peor |
|---|---|---|---|
| Recompensa | 8.405,9 | 8.435,8 (seed 9003) | 8.368,9 (seed 9007) |
| Pasos sobrevividos | 1.000,0 / 1.000 | 1.000 | 1.000 |
| Distancia avanzada | 45,32 m | 45,78 m (seed 9003) | 44,81 m (seed 9007) |
| Velocidad media | 1,81 m/s | 1,83 m/s | 1,79 m/s |

No se han publicado comparaciones con otras politicas (por ejemplo, PPO estandar de Stable-Baselines3, SAC o TD3) en la informacion disponible, ni resultados en benchmarks estandar de RL como MMLU, HumanEval o GSM8K, que no aplican a este tipo de modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB; la red MLP de ~106.000 parametros ocupa unos pocos cientos de kilobytes en FP32.
- GPU recomendadas: innecesarias para inferencia; cualquier GPU integrada o CPU moderna es suficiente. Para reentrenamiento se recomienda una GPU con al menos 8-12 GB (RTX 3060/4070 o superior) para paralelizar entornos MuJoCo.
- Cabe en cualquier GPU consumer e incluso en CPU; el cuello de botella es la simulacion fisica de MuJoCo, no la red neuronal.
- Opciones de despliegue: PyTorch nativo (`model.pt`), exportacion a ONet/ONNX no documentada, integracion via `actor.json` en el playground web de CONNECT AI LAB, y ejecucion dentro de Gymnasium con MuJoCo.
- Latencia y throughput: no disponibles de forma explicita; en la practica, la inferencia de una MLP de este tamano es del orden de microsegundos, mientras que el paso de simulacion MuJoCo domina el coste.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / horizonte | Rendimiento reportado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| connectailab-rl-healmu-humanoid-v5-ppo | ~106.000 (MLP 348-256-256-17) | Episodio de 1.000 pasos | 8.405,9 de recompensa media; 45,32 m; 1,81 m/s en 10 semillas | no disponible | Hugging Face (0 descargas) |
| PPO de referencia Stable-Baselines3 en Humanoid-v5 | no disponible | Episodio de 1.000 pasos | no disponible en esta ficha | MIT (SB3) | Publico |
| Politicas SAC/TD3 para Humanoid-v5 | no disponible | Episodio de 1.000 pasos | no disponible en esta ficha | no disponible | Publico en repos de RL |

No se dispone de datos comparativos verificados en la informacion proporcionada; la comparativa se limita a familias de algoritmos, no a resultados numericos contrastados.

## Limitaciones y advertencias

- Modelo exclusivamente de control continuo en simulacion: no procesa lenguaje, no genera texto y no admite tool calling ni agentes.
- La licencia no esta declarada, por lo que el uso comercial queda en situacion juridica incierta hasta que el autor la especifique.
- Los resultados provienen de un unico entorno (`Humanoid-v5`) y de 10 semillas; no hay evidencia de robustez ante cambios de dinamica, ruido sensorial o retardo de actuacion.
- No se documenta transferencia sim-a-real ni validacion en hardware fisico; el rendimiento en robot real es desconocido.
- El repositorio tiene 0 descargas y 0 likes, y no se ha publicado informacion sobre sesgos, fallos conocidos o limites de generalizacion.
- La recompensa reportada depende de la funcion de recompensa aumentada definida en `added_scores.py`; no es directamente comparable con recompensas de `Humanoid-v5` estandar sin ese termino biomecanico.
- Riesgo de sobreajuste a las condiciones de entrenamiento (semillas y parametros fisicos de MuJoCo) no cuantificado en la model card.
- La fecha de creacion indicada (2026-11-11) es futura respecto al momento habitual de publicacion; conviene verificar la autenticidad y procedencia del artefacto antes de usarlo en produccion.

## Enlaces

- Hugging Face: https://huggingface.co/bigeye35/connectailab-rl-healmu-humanoid-v5-ppo
- Repositorio de referencia del entorno: https://gymnasium.farama.org/environments/mujoco/humanoid/
- Documentacion de MuJoCo: https://mujoco.readthedocs.io/
- Stable-Baselines3 (PPO de referencia): https://github.com/DLR-RM/stable-baselines3
- Paper de PPO: https://arxiv.org/abs/1707.06347
- No se han encontrado en la busqueda web papers, blogs, repos o demos adicionales especificos de este modelo.
