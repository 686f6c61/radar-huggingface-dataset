# SionJang/ppo-LunarLander-v3

## Resumen

`SionJang/ppo-LunarLander-v3` es un agente de aprendizaje por refuerzo entrenado con PPO (Proximal Policy Optimization) sobre el entorno `LunarLander-v3` de Gymnasium. Lo publica Sion Jang, aunque el experimento, el codigo de entrenamiento y la evaluacion los desarrollo un agente de IA (Rich, ejecutado sobre Claude Code) bajo supervision humana. No es un modelo de lenguaje: es una politica neuronal (MLP) que mapea observaciones de 8 dimensiones a 4 acciones discretas para aterrizar el modulo lunar.

El interes practico esta en su reproducibilidad y en su rendimiento: alcanza una recompensa media de 274,83 (+/- 19,90) sobre 100 episodios con semillas no vistas durante el entrenamiento y un 100 % de aterrizajes exitosos, con tres semillas de entrenamiento que confirman la estabilidad de la receta (media de 271,68). Supera claramente a la variante Double DQN del mismo autor (223,49 de media, 75 % de aterrizajes).

Se trata de un artefacto pequeno (repo de 0,0 GB, pesos en `.zip` de stable-baselines3) pensado como referencia de baseline en RL y como demostracion de un flujo de trabajo donde un agente de IA disena y ejecuta el experimento. No es un modelo generativo ni tiene capacidades de lenguaje, vision o tool calling.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MlpPolicy (perceptron multicapa) entrenada con PPO; stable-baselines3 2.9.2 |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (entorno de RL con observaciones de 8 dimensiones) |
| Tipos de cuantizacion | no disponible (pesos en `.zip` de PyTorch) |
| Idiomas soportados | no aplica (no es un modelo de lenguaje) |
| Licencia | MIT |
| Formato de pesos | `.zip` de stable-baselines3 (serializacion con Python pickle) |

## Arquitectura y entrenamiento

La politica es una `MlpPolicy` de stable-baselines3 optimizada con PPO. Se parte de los hiperparametros del RL Baselines3 Zoo para LunarLander: 16 entornos en paralelo, `n_steps=1024`, `batch_size=64`, `gamma=0.999`, `gae_lambda=0.98`, `n_epochs=4` y `ent_coef=0.01`. Los dos cambios que llevaron la recompensa por encima de 260 fueron ampliar el entrenamiento a 2.000.000 de timesteps (frente a 1.000.000) y aplicar un decaimiento lineal del learning rate desde 3e-4 hasta 0. Segun el autor, esto elimino el episodio catastrofico de 47 puntos observado en la ejecucion de 1M de pasos y elevo la media de 3 semillas de 257,53 a 271,68.

El entrenamiento se ejecuto unicamente en CPU (Intel i7-11800H), sin GPU: 26,4 minutos para esta semilla y 84,3 minutos para las tres. El stack fue Python 3.12, PyTorch 2.13.0 (CPU), Gymnasium 1.3.0 y Box2D 2.3.10. El repositorio incluye `train_ppo.py` y `results.json` para reproducir la ejecucion con `RUN_NAME=runs STEPS=2000000 LINEAR_LR=1 python train_ppo.py`. No se documenta el numero de tokens ni composicion de dataset porque no aplica: el agente aprende por interaccion con el simulador.

## Capacidades

- Control de politica discreta en `LunarLander-v3`: selecciona entre 4 acciones (no hacer nada, encender motor principal, encender motor lateral izquierdo, encender motor lateral derecho) a partir de observaciones de 8 dimensiones.
- Aterrizaje fiable: 100 % de exito en 100 episodios de evaluacion con acciones deterministas y semillas 10000-10099 no vistas en entrenamiento.
- Inferencia determinista (`model.predict(obs, deterministic=True)`) reproducible con `stable-baselines3`.
- Estabilidad entre semillas: tres ejecuciones independientes mantienen el 100 % de episodios con recompensa >= 200.
- No soporta tool calling, function calling, agentes multi-paso, capacidades multilingues, vision, audio ni modo de razonamiento extendido.

## Casos de uso

- Baseline de referencia en RL: usar este agente como punto de comparacion al evaluar nuevos algoritmos (SAC, TD3, A2C) sobre `LunarLander-v3`, ya que ofrece una media y desviacion tipica bien caracterizadas sobre 100 semillas fijas.
- Docencia y tutoriales de PPO: el repositorio incluye el script de entrenamiento y los resultados, lo que permite reproducir el experimento completo en CPU en menos de media hora y explicar el efecto del decaimiento del learning rate.
- Verificacion de pipelines de evaluacion: sus semillas de test documentadas (10000-10099) y su 100 % de aterrizajes sirven para validar que un harness de evaluacion de Gymnasium esta correctamente configurado.
- Demostracion de agentes de IA para investigacion: el modelo documenta un flujo donde un agente de IA disena, escribe y ejecuta el experimento con revision humana, util como caso de estudio de automatizacion del ciclo experimental.
- Pruebas de integracion con stable-baselines3 y Hugging Face Hub: el ejemplo de carga via `hf_hub_download` y `PPO.load` sirve para validar pipelines de descarga y carga de artefactos RL.
- Simulacion de control en entornos Box2D: la politica puede integrarse en visualizaciones (`render_mode="human"`) o grabaciones para demostraciones de control continuo-discreto en fisica 2D.

## Benchmarks y rendimiento

Evaluacion sobre 100 episodios, acciones deterministas, semillas 10000-10099 (no usadas en entrenamiento):

| Modelo | Recompensa media | Desviacion tipica | Minimo | Exito de aterrizaje |
|---|---|---|---|---|
| Este modelo (PPO, semilla 1) | 274,83 | 19,90 | 235,64 | 100 % |
| Double DQN del mismo autor | 223,49 | 88,69 | 18,71 | 75 % |

Estabilidad entre semillas de entrenamiento:

| Semilla | Media | Desviacion tipica | Minimo | Episodios >= 200 |
|---|---|---|---|---|
| 0 | 267,51 | 20,53 | 227,72 | 100 % |
| 1 (este modelo) | 274,83 | 19,90 | 235,64 | 100 % |
| 2 | 272,70 | 22,30 | 217,98 | 100 % |
| Media de 3 semillas | 271,68 | no disponible | no disponible | 300 / 300 |

Los resultados del `model-index` estan marcados como `verified: false`, es decir, declarados por el autor y no verificados de forma independiente.

## Requisitos de hardware

- Inferencia en CPU: suficiente. El entrenamiento completo se hizo en un Intel i7-11800H sin GPU; la inferencia de una MLP de este tamano es trivial en cualquier CPU moderna.
- VRAM estimada: no disponible; no requiere GPU.
- GPU recomendadas: ninguna imprescindible. Cualquier GPU (RTX 4090, A100, H100) acelera el entrenamiento, pero no es necesaria para inferencia.
- Cabe en GPU de consumo: si, en cualquier GPU con CUDA, aunque no aporta ventaja significativa frente a CPU para esta politica.
- Opciones de despliegue: `stable-baselines3` (`PPO.load`), `gymnasium` con Box2D 2.3.10, descarga via `huggingface_hub`. No aplica vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles de forma explicita; el entrenamiento de 2M de timesteps tardo 26,4 minutos en CPU, lo que da una idea del coste computacional del ciclo completo.

## Comparativa con modelos similares

| Modelo | Algoritmo | Recompensa media | Exito de aterrizaje | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SionJang/ppo-LunarLander-v3 | PPO | 274,83 | 100 % | MIT | Hugging Face |
| SionJang/lunarlander-v3-double-dqn | Double DQN | 223,49 | 75 % | no disponible | Hugging Face |
| Baseline RL Baselines3 Zoo (LunarLander) | PPO | no disponible | no disponible | MIT (SB3) | GitHub |

No se dispone de datos publicados de otros agentes comparables en la informacion proporcionada.

## Limitaciones y advertencias

- Especifico de `LunarLander-v3`: la politica no generaliza a otros entornos ni tareas; esta acoplada a observaciones de 8 dimensiones y 4 acciones discretas.
- No es un modelo de lenguaje: no procesa texto, no tiene capacidades generativas ni multilingues.
- Resultados no verificados: el `model-index` marca los benchmarks como `verified: false`; la evaluacion la realizo el propio autor.
- Riesgo de seguridad al cargar: los archivos `.zip` de stable-baselines3 usan Python pickle; solo deben cargarse desde fuentes de confianza, tal como advierte la model card.
- Dependencias de entorno: requiere Gymnasium 1.3.0 y Box2D 2.3.10 para reproducir los resultados; versiones distintas pueden alterar la dinamica del simulador.
- Licencia MIT: permite uso comercial y modificacion, pero conviene conservar el aviso de copyright.
- Procedencia asistida por IA: el experimento lo diseno y ejecuto un agente de IA con revision humana; no hay validacion independiente por terceros.
- Sin datos de sesgo, alucinacion o robustez fuera de distribucion: no disponibles.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/SionJang/ppo-LunarLander-v3
- Modelo Double DQN del mismo autor: https://huggingface.co/SionJang/lunarlander-v3-double-dqn
- Repositorio de stable-baselines3: https://github.com/DLR-RM/stable-baselines3
- RL Baselines3 Zoo: https://github.com/DLR-RM/rl-baselines3-zoo
- Entorno LunarLander-v3 (Gymnasium): https://gymnasium.farama.org/environments/box2d/lunar_lander/
- Documentacion de PPO en stable-baselines3: https://stable-baselines3.readthedocs.io/en/master/modules/ppo.html
