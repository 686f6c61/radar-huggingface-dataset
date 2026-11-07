# Jasmin71/connectailab-rl-mihyun-v1-mujoco-ball-ppo

## Resumen

`connectailab-rl-mihyun-v1-mujoco-ball-ppo` es una politica de aprendizaje por refuerzo entrenada con PPO (Proximal Policy Optimization) mediante la libreria Stable-Baselines3, publicada por el autor Jasmin71 en el marco del curso de RL de AI CITY BUILDERS y CONNECT AI LAB. No es un modelo de lenguaje: es un agente de control continuo que opera sobre un entorno MuJoCo personalizado llamado `BallRollGoal-v0`, en el que una pelota debe rodar hasta un objetivo dentro de un campo de juego.

El entorno se define mediante un fichero `world.xml` (suelo del campo, limite exterior, bandera de objetivo y agente esferico) y un `run.py` que implementa la logica fisica y el registro en Gymnasium con `gym.register(id="BallRollGoal-v0", entry_point="run:BallRollGoalEnv")`. El modelo forma parte de una serie de experimentos educativos del mismo autor que incluye variantes como `mihyun-v2-mujoco-hopper-ppo` y `mihyun-v1-lunarlander`.

La relevancia es la de un artefacto didactico reproducible: demuestra el ciclo completo de diseno de simulador, definicion de recompensa, superacion de recompensa retardada mediante reward shaping y evaluacion con semillas no vistas. El repositorio figura con 0 descargas y 0 likes, y el tamano declarado es de 0.0 GB, por lo que los pesos no parecen estar disponibles publicamente en el momento de redactar esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (politica de RL entrenada con PPO sobre Stable-Baselines3; no se especifica la topologia de la red) |
| Parametros totales | No disponible |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible (no aplica; el agente opera sobre observaciones por paso del entorno `BallRollGoal-v0`) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible (no es un modelo linguistico) |
| Licencia | No disponible |
| Formato de pesos | No disponible (libreria declarada: Stable-Baselines3; el repositorio figura con 0.0 GB) |
| Entorno | `BallRollGoal-v0` (MuJoCo, registrado en Gymnasium) |
| Algoritmo | PPO (Proximal Policy Optimization) |
| Libreria | Stable-Baselines3 |
| Pipeline | reinforcement-learning |

## Arquitectura y entrenamiento

El modelo es una politica entrenada con PPO, un algoritmo actor-critico con recorte de la relacion de probabilidades (clipping) para limitar la magnitud de cada actualizacion. La implementacion procede de Stable-Baselines3, aunque la model card no detalla el numero de capas, el tamano de las capas ocultas, la funcion de activacion ni el numero total de pasos de entrenamiento. El espacio de acciones es continuo, segun la etiqueta `continuous-control`.

El entorno `BallRollGoal-v0` se construye a medida en MuJoCo: un `world.xml` describe el suelo del campo, la linea de fuera de juego, la bandera objetivo (`goal_target`) y el agente esferico (`ball_agent`), mientras que `run.py` implementa la fisica, la funcion de recompensa y el registro en Gymnasium. La recompensa base otorga +10 al alcanzar el objetivo y -5 al salir del campo. Para combatir la recompensa retardada, el autor combina esa senal con un termino de shaping de distancia `(prev_dist - dist) * 4.0`. La model card menciona ademas una comparativa fisica del mismo estimulo a 4.2 m/s con masas distintas: pelota de baloncesto (0.6 kg, rebota), bola de hierro (30 kg, empuja) y una esfera de 1.000 toneladas (1.000.000 kg, que atraviesa barreras pesadas). No se documenta el uso de RLHF, DPO ni tecnicas de decodificacion especulativa, que no aplican a este tipo de modelo.

## Capacidades

- Control continuo de un agente esferico en un simulador fisico MuJoCo.
- Navegacion hacia un objetivo con recompensa por llegada (+10) y penalizacion por salida del campo (-5).
- Aprendizaje de politicas bajo recompensa retardada, mitigado con reward shaping basado en la reduccion de distancia.
- Generalizacion a episodios no vistos: la evaluacion se realiza sobre 50 episodios nuevos.
- Integracion con Gymnasium mediante `gym.make("BallRollGoal-v0", render_mode="rgb_array")`.
- Reproduccion del entorno fisico con distintas masas (0.6 kg, 30 kg, 1.000.000 kg) para comparar comportamiento dinamico.
- No dispone de generacion de texto, razonamiento simbolico, codigo, vision, tool calling, capacidades de agente multi-paso ni soporte multilingue.

## Casos de uso

- Docencia de aprendizaje por refuerzo: el par `world.xml` + `run.py` sirve como ejemplo minimo y reproducible de como se define un entorno MuJoCo y se registra en Gymnasium con `gym.make`, adecuado para practicas de laboratorio.
- Estudio de reward shaping: la combinacion de recompensa terminal (+10/-5) con `(prev_dist - dist) * 4.0` permite analizar empiricamente como el shaping acelera el aprendizaje frente a la recompensa puramente retardada.
- Comparativa de dinamica fisica por masa: el mismo estimulo a 4.2 m/s sobre cuerpos de 0.6 kg, 30 kg y 1.000.000 kg ilustra el efecto de la inercia y del contacto en simuladores de rigid bodies.
- Baseline de PPO en control continuo: sirve como referencia para comparar hiperparametros, semillas y variantes de algoritmo en tareas de navegacion 2D sobre plano.
- Prototipado de entornos personalizados: el codigo de registro (`gym.register`) y la estructura de recompensas son reutilizables como plantilla para nuevos entornos didacticos.
- Evaluacion de robustez de politicas: la tasa de exito sobre 50 episodios no vistos permite medir la varianza de la politica ante condiciones iniciales distintas.
- No es adecuado para tareas de produccion en lenguaje natural, vision, atencion al cliente ni generacion de codigo, dado que no es un modelo linguistico.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados, `verified: false`):

| Metrica | Tarea / dataset | Valor |
|---|---|---|
| Tasa de exito (50 episodios) | `BallRollGoal-v0` | 92 % (46/50) |
| Recompensa media por episodio | `BallRollGoal-v0` (objetivo +10 / fuera -5) | 12,23 |

El autor indica ademas que el ejemplo base del curso, con recompensa puramente retardada, pasaba de un 13 % a un 16,5 % de exito, y que la version con shaping alcanza el 92 %. No se han publicado otros resultados de benchmarks (tipo MMLU, HumanEval o GSM8K) en la informacion disponible, ya que no aplican a este modelo.

## Requisitos de hardware

- VRAM estimada: no disponible; no se especifica el tamano de la politica ni el formato de pesos.
- GPU recomendadas: no disponible. Para entrenamiento e inferencia de PPO en MuJoCo, una GPU de gama media es habitualmente suficiente, pero el autor no publica requisitos.
- Cabe en GPU de consumo: previsiblemente si, dado el caracter didactico del entorno, aunque no hay dato confirmado.
- Opciones de despliegue: Stable-Baselines3 con Gymnasium y MuJoCo; ejecucion via `gym.make("BallRollGoal-v0", render_mode="rgb_array")` tras importar `run`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Entorno | Algoritmo | Metricas declaradas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `connectailab-rl-mihyun-v1-mujoco-ball-ppo` | `BallRollGoal-v0` (custom) | PPO (SB3) | 92 % exito, recompensa 12,23 | No disponible | Repositorio de 0.0 GB |
| `connectailab-rl-mihyun-v2-mujoco-hopper-ppo` | `Hopper-v5` | PPO (SB3) | No disponible en la busqueda | No disponible | Repositorio de 120 kB |
| `connectailab-rl-mihyun-v1-lunarlander` | `LunarLander` | No disponible | No disponible en la busqueda | No disponible | No disponible |

Los tres modelos pertenecen al mismo autor y a la misma serie didactica de CONNECT AI LAB; no se dispone de datos de rendimiento de las variantes Hopper y LunarLander en la informacion proporcionada.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, codigo ni respuestas conversacionales.
- Las metricas (92 % de exito, recompensa media 12,23) estan declaradas por el autor y no han sido verificadas de forma independiente (`verified: false`).
- El repositorio figura con 0.0 GB y 0 descargas, por lo que los pesos pueden no estar accesibles o estar incompletos.
- La licencia no esta declarada, lo que impide determinar si el uso comercial esta permitido.
- El modelo esta acoplado a un entorno concreto (`BallRollGoal-v0`) y a su `world.xml`; fuera de ese simulador no tiene utilidad.
- La evaluacion se limita a 50 episodios, una muestra pequena que puede no reflejar la robustez ante condiciones iniciales extremas.
- Riesgo de sobreajuste al shaping de distancia: la recompensa `(prev_dist - dist) * 4.0` puede inducir comportamientos que no generalicen si se modifica el entorno.
- No hay informacion sobre sesgos, alucinacion ni limitaciones idiomaticas porque no aplican a este tipo de artefacto.
- No se documentan semillas, hiperparametros ni numero de pasos de entrenamiento, lo que dificulta la reproducibilidad exacta.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Jasmin71/connectailab-rl-mihyun-v1-mujoco-ball-ppo
- Variante Hopper PPO: https://huggingface.co/Jasmin71/connectailab-rl-mihyun-v2-mujoco-hopper-ppo/tree/main
- Variante LunarLander: https://huggingface.co/Jasmin71/connectailab-rl-mihyun-v1-lunarlander
- Stable-Baselines3: https://github.com/DLR-RM/stable-baselines3
- Gymnasium: https://gymnasium.farama.org/
- MuJoCo: https://mujoco.org/
