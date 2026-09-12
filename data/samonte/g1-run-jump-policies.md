# Samonte/g1-run-jump-policies

## Resumen

`Samonte/g1-run-jump-policies` es un repositorio de politicas congeladas (checkpoints de redes neuronales) para el robot humanoide Unitree G1, orientadas a ejecutar una tarea de carrera con salto de obstaculo (run-jump). No es un modelo de lenguaje: se trata de un conjunto de controladores entrenados con aprendizaje por refuerzo que se integran en el simulador NVIDIA Isaac Lab a traves de la libreria `isaaclab` y del framework `skrl`. Lo publica el usuario Samonte y es el artefacto de despliegue del proyecto `task-humanoid-run-jump`.

El stack se compone de cuatro modulos encadenados: un tracker BeyondMimic de una sola fase (`tracker/tracker.pt`, TorchScript, 157-D de entrada a 29-D de salida en forma de consignas PD articulares), dos actores AMP para carrera (`run/policy.pt`, 134-D a 64-D) y salto (`jump/policy.pt`, 156-D a 64-D), y un conmutador jerarquico de alto nivel entrenado con PPO en skrl (`hl/best.pt`, 116-D a 6-D, que produce `[gate, vx, vy, wz, a_h, a_flight]`). El repositorio ocupa 0,1 GB y se distribuye bajo licencia BSD 3-Clause.

Su relevancia ahora es acotada pero clara: sirve como punto de partida reproducible para investigacion en locomocion de humanoides con curriculo de obstaculos, y como baseline honesto sobre el que mejorar. El propio autor documenta los limites: el actor de salto no supera cuboides de 0,9 a 1,2 m y el conmutador de alto nivel alcanza un pico de aproximadamente el 47 % de finalizacion en un circuito de un solo obstaculo facil (0,35 a 0,55 m), muy lejos de la puntuacion de minero de EnvHub (~0,77) que se necesitaria.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Politicas de redes neuronales para control motor entrenadas con RL. Tres componentes: tracker BeyondMimic (imitation/tracking), actores AMP (Adversarial Motion Priors) y conmutador jerarquico PPO. Exportadas a TorchScript |
| Parametros totales | no disponible (la model card no publica el numero de parametros de ningun checkpoint) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (no es un modelo de lenguaje; la "ventana" es el vector de observacion por paso, de 116 a 157 dimensiones segun el modulo) |
| Tipos de cuantizacion | no aplica (se distribuyen checkpoints TorchScript y skrl en `.pt`/`.ckpt`; no se publica cuantizacion) |
| Idiomas soportados | no aplica (no procesa lenguaje natural) |
| Licencia | BSD 3-Clause, la misma que los repositorios de entrenamiento |
| Formato de pesos | TorchScript JIT (`.pt`) para despliegue; checkpoints skrl (`.pt`) para reanudar entrenamiento; checkpoint `.ckpt` de seguimiento |
| Dimensiones de entrada/salida | tracker: 157-D → 29-D PD articulares; run: 134-D → 64-D frame objetivo; jump: 156-D → 64-D frame objetivo; HL: 116-D → 6-D `[gate, vx, vy, wz, a_h, a_flight]` |
| Robot objetivo | Unitree G1 (humanoide) |
| Entorno de simulacion | NVIDIA Isaac Lab (libreria `isaaclab`) |
| Tamano del repositorio | 0,1 GB |
| Autor | Samonte |
| Descargas / likes | 0 / 0 |
| Fecha de publicacion | 2026-09-12 (creacion y ultima actualizacion el mismo dia) |

## Arquitectura y entrenamiento

El stack es jerarquico y combina tres paradigmas de RL. En la base, `tracker/tracker.pt` es un tracker BeyondMimic de un solo fotograma (`future_steps=[1]`) exportado a TorchScript, procedente del experimento `g1_bm_l2c2_1frame_hurdle` en su epoca 11200; sus bytes son identicos a los de `humanoid-g1-tracking/.../exported/policy.pt`. Sobre el, `run/policy.pt` es un actor AMP para carrera y `jump/policy.pt` un actor AMP para salto, ambos con salida de 64 dimensiones expresada como frame objetivo. Estos dos actores provienen de los entrenamientos `g1_run_amp/2026-09-09_04-58-38` (checkpoint `agent_300000`) y `g1_jump_amp/2026-09-09_18-11-29` (checkpoint `agent_400000`).

La capa superior es `hl/best.pt`, un conmutador PPO entrenado con skrl en el experimento `g1_runjump_hl_ppo/2026-09-11_05-33-19`, correspondiente al checkpoint `agent_345000`. Produce seis salidas (`gate, vx, vy, wz, a_h, a_flight`) que deciden cuando activar el salto y como modular las velocidades y la altura. Se conserva un keeper alternativo, `hl/agent_410000.pt`, con un rendimiento ligeramente inferior (~45-46 % frente al ~47 % del principal). El autor advierte que los intentos posteriores de reanudar el entrenamiento (con `vy`/`wz` mas ajustados y rebloqueo de la etapa 1) no superaron a este checkpoint.

No se documenta el numero de tokens ni una composicion de dataset al uso: el aprendizaje se realiza en simulacion fisica, con recompensas de tarea y, en los actores AMP, un discriminador de estilo que penaliza movimientos poco naturales. Tampoco se describen fases de RLHF o DPO, que no aplican a este dominio.

## Capacidades

- Locomocion de carrera en un humanoide Unitree G1 dentro de Isaac Lab, mediante el actor AMP de carrera.
- Seguimiento de referencia de movimiento (motion tracking) con el tracker BeyondMimic de un solo fotograma, que mapea un vector de 157 dimensiones a 29 consignas PD articulares.
- Ejecucion de un salto "stay-up" con planeo de aproximadamente 0,5 a 0,9 m, denominado hop-and-glide.
- Conmutacion jerarquica entre modos (carrera, salto, gate) mediante una politica PPO de alto nivel con seis salidas continuas.
- Control de velocidades lineales (`vx`, `vy`) y angular (`wz`) del robot, ademas de parametros de altura de salto y de fase de vuelo.
- Reanudacion de entrenamiento: los checkpoints de skrl (`run/agent_300000.pt`, `jump/agent_400000.pt`, `hl/agent_*.pt`) permiten continuar el entrenamiento o lanzar `play.py`.
- Reentrenamiento del tracker a partir de `tracker/epoch_11200_score.ckpt` en el repositorio `humanoid-g1-tracking`.
- No dispone de capacidades de generacion de texto, codigo, matematicas, vision, audio, tool calling, agentes ni multilingues: no es un modelo generativo de lenguaje.

## Casos de uso

- Investigacion en locomocion de humanoides: usar el stack como baseline reproducible en Isaac Lab para comparar nuevas politicas de carrera y salto con las mismas condiciones de evaluacion (etapa 0 de un obstaculo, 0,35-0,55 m).
- Desarrollo de politicas de salto de obstaculos: partir de `jump/policy.pt` como inicializacion y entrenar un actor que si supere cuboides de 0,9 a 1,2 m, el hueco declarado explicitamente por el autor.
- Entrenamiento de conmutadores jerarquicos: reutilizar `hl/best.pt` (116-D → 6-D) como punto de partida para PPO jerarquico con nuevos criterios de recompensa o curriculos de varias vallas.
- Evaluacion sim-to-real en Unitree G1: exportar los TorchScript a un bucle de control de tiempo real y medir la transferencia del tracker y de los actores AMP al hardware fisico.
- Reanudacion y ajuste fino de experimentos: cargar los checkpoints de skrl (`agent_300000`, `agent_400000`, `agent_345000`) con `scripts/skrl/play.py` para inspeccionar el comportamiento y continuar el entrenamiento con hiperparametros modificados.
- Benchmarking interno de checkpoints: comparar `hl/best.pt` con `hl/agent_410000.pt` y con las reanudaciones descartadas (`vy`/`wz` ajustados, rebloqueo de etapa 1) para reproducir la conclusion de que ninguna mejora al keeper principal.
- Docencia y replicacion de pipelines RL: montar el flujo BeyondMimic + AMP + PPO jerarquico como ejemplo didactico de composicion de politicas en Isaac Lab con skrl.
- Baseline para minería de EnvHub: usar el stack como referencia conocida al desarrollar la politica de salto real que se necesita para acercarse a la puntuacion ~0,77.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K ni equivalentes) en la informacion disponible, ya que no es un modelo de lenguaje. La model card si aporta metricas internas de entrenamiento y evaluacion:

| Modulo / metrica | Resultado | Condiciones |
|---|---|---|
| Conmutador HL (`hl/best.pt`, `agent_345000`) | ~47 % de finalizacion en el pico | Etapa 0, un obstaculo facil de 0,35-0,55 m, circuito procedural |
| Conmutador HL alternativo (`hl/agent_410000.pt`) | ~45-46 % de finalizacion | Mismas condiciones |
| Actor de salto (`jump/policy.pt`, `agent_400000`) | Salto stay-up con planeo de ~0,5-0,9 m | No supera cuboides de 0,9-1,2 m |
| Reanudaciones posteriores del HL | No superaron al keeper principal | `vy`/`wz` mas ajustados, rebloqueo de etapa 1 |
| Puntuacion de minero de EnvHub | ~0,77 (referencia externa, no alcanzada) | Requiere una politica de salto que supere obstaculos reales |

El autor subraya que el conmutador HL no fue evaluado con EnvHub, por lo que el ~45-47 % de finalizacion en entrenamiento no equivale a una puntuacion de navegacion de 0,77.

## Requisitos de hardware

- Los pesos en si son ligeros: el repositorio completo ocupa 0,1 GB y los ficheros TorchScript y checkpoints de skrl son de tamano reducido; no se publica un desglose de VRAM por modulo.
- VRAM estimada para inferencia: no disponible en la informacion proporcionada. Al ser politicas pequenas de control motor, la carga de inferencia es muy inferior a la del simulador.
- El coste computacional dominante no es el modelo, sino el entorno Isaac Lab, que requiere una GPU con capacidad de simulacion fisica para entrenamiento y evaluacion; no se especifican modelos de GPU concretos.
- GPU recomendadas (A100, H100, RTX 4090, etc.): no disponible. La model card no indica hardware de referencia.
- Capacidad en GPU de consumo: no disponible. No se indican requisitos minimos ni pruebas en GPUs de consumo.
- Opciones de despliegue: TorchScript JIT (`.pt`) para los tres modulos congelados recomendados (`frozen_policies/tracker.pt`, `best_policy/run/policy.pt`, `best_policy/jump/policy.pt`) y skrl con `scripts/skrl/play.py` para evaluacion o reanudacion del HL. No se documentan exportaciones a vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de artefacto.
- Latencia y throughput: no disponible. La unica referencia temporal es que el bucle de evaluacion se ejecuta en modo `--headless` con el interprete `/venv/env_isaaclab/bin/python`.

## Comparativa con modelos similares

No se conocen modelos comparables externos en la informacion proporcionada. La comparativa relevante es interna, entre los checkpoints del propio stack:

| Componente | Ruta | Entrada → salida | Origen del entrenamiento | Estado |
|---|---|---|---|---|
| Tracker BeyondMimic 1-frame | `tracker/tracker.pt` | 157-D → 29-D PD | `g1_bm_l2c2_1frame_hurdle`, epoca 11200, `future_steps=[1]` | Congelado, recomendado para despliegue |
| Actor AMP de carrera | `run/policy.pt` | 134-D → 64-D | `g1_run_amp`, `agent_300000` | Congelado, recomendado para despliegue |
| Actor AMP de salto | `jump/policy.pt` | 156-D → 64-D | `g1_jump_amp`, `agent_400000` | Congelado; salto stay-up, no supera obstaculos reales |
| Conmutador PPO jerarquico (principal) | `hl/best.pt` | 116-D → 6-D | `g1_runjump_hl_ppo`, `agent_345000` | Mejor keeper, ~47 % de finalizacion |
| Conmutador PPO alternativo | `hl/agent_410000.pt` | 116-D → 6-D | `g1_runjump_hl_ppo` | Keeper alternativo, ~45-46 % |
| Checkpoints de reanudacion | `run/agent_300000.pt`, `jump/agent_400000.pt`, `hl/agent_*.pt` | Formatos skrl | Varios experimentos | Para `play.py` y reanudacion, no TorchScript |

## Limitaciones y advertencias

- El actor de salto no supera cuboides de 0,9 a 1,2 m. El autor lo declara explicitamente: hace falta una politica de salto que supere obstaculos reales para aspirar a las puntuaciones de minero de EnvHub (~0,77).
- El conmutador de alto nivel no se ha evaluado con EnvHub. El ~45-47 % de finalizacion en un circuito procedural de un solo obstaculo no debe interpretarse como una puntuacion de navegacion.
- `best_agent.pt` presente en los registros de skrl no es valido como checkpoint final: el autor advierte que corresponde a una metrica o a un paso incorrectos. Hay que usar los ficheros indicados en el apartado de layout.
- Solo funciona en el ecosistema Isaac Lab con la tarea `Nepher-G1-RunJumpHL-Play-v0` y el robot Unitree G1; no es portable a otros robots ni a otros simuladores sin reentrenamiento.
- Los actores AMP reproducen el estilo de las animaciones de referencia usadas en el entrenamiento; no se documenta ningun analisis de sesgo de movimiento ni de robustez ante perturbaciones no vistas.
- Riesgo de fallo en el mundo real: no se aportan datos de sim-to-real, de robustez a empujes externos ni de comportamiento ante terreno irregular.
- El rendimiento depende del curriculum: los entrenamientos posteriores con `vy`/`wz` mas ajustados y rebloqueo de la etapa 1 no mejoraron el resultado, lo que sugiere sensibilidad a los hiperparametros.
- Licencia BSD 3-Clause: permite uso comercial y modificacion, siempre que se conserve el aviso de copyright y la clausula de exencion de responsabilidad, y que no se use el nombre de los titulares para promocionar derivados sin permiso.
- Uso responsable: al tratarse de politicas de control fisico para un humanoide, cualquier despliegue en hardware real debe hacerse con limites de par, paradas de emergencia y validacion en entorno controlado.
- No se documentan idiomas, contexto, cuantizacion ni sesgos de lenguaje porque no aplican: no es un modelo de lenguaje.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/Samonte/g1-run-jump-policies
- Repositorio de la tarea de entrenamiento (task-humanoid-run-jump): https://github.com/nepher-ai/task-humanoid-run-jump
- Repositorio del tracker (humanoid-g1-tracking): https://github.com/nepher-ai/humanoid-g1-tracking
- Resultados de la busqueda web: los enlaces devueltos (ensonhaber.com y subdominios) no guardan relacion con el modelo y no se han incluido como fuentes. No se han encontrado papers, blogs ni demos adicionales en la informacion disponible.
