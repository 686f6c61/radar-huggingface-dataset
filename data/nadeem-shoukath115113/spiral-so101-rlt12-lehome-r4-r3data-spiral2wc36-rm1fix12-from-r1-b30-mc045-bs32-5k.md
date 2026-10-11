# Nadeem-Shoukath115113/spiral-so101-rlt12-lehome-r4-r3data-spiral2wc36-rm1fix12-from-r1-b30-mc045-bs32-5k

## Resumen

SPIRAL on rlt12 stage 3, ronda 4 es un checkpoint de investigacion de aprendizaje por refuerzo residual (residual RL) para robotica, publicado por el usuario Nadeem-Shoukath115113 en HuggingFace. No es un modelo de lenguaje: es un modulo de control compuesto por un actor residual y un ensemble de cinco criticos (redes MLP de 3×1024) entrenados sobre una politica base congelada π₀.₅ + RLT. El checkpoint concreto corresponde al paso 2500 y al paso final 4999 de un entrenamiento de 5000 pasos con batch 32 (aproximadamente 1,6 pasadas sobre los datos), con semilla 42.

El problema que aborda es el ajuste fino de una politica de manipulacion robotica (plegado de una camiseta de manga larga sobre una mesa) mediante RL offline sobre un dataset mixto de demostraciones de teleoperacion, rollouts de politica y sesiones de DAgger. La ronda 4 combina 220 episodios y 97.701 frames a 15 fps, etiquetados con el modelo de recompensa RM1 y clasificados con las puntuaciones subjetivas de un operador. El entrenamiento parte del actor de la ronda 1 (paso 4999) y reinicia criticos, optimizador y contador de pasos.

Su relevancia es acotada y experimental: el propio autor advierte que el modelo no ha sido evaluado en robot y que no se recomienda emplearlo en tiempo de robot, porque las pruebas offline muestran que el critico no logra ordenar las propuestas de π₀.₅ y el residual aprendido es un desplazamiento minimo y practicamente fijo, similar al de las rondas 2 y 3. Se trata, por tanto, de un artefacto para reproducir ablaciones e investigar el fallo del critico, no de un modelo listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Actor residual y ensemble de 5 criticos (MLP de 3×1024 cada uno) sobre politica base congelada π₀.₅ + RLT; features RLT z_rl (2048) + estado (12) |
| Parametros totales | No disponible (el modelo base π₀.₅ no se incluye; el modulo residual no declara recuento de parametros) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica (modelo de politica robotica); horizonte de accion de 20 pasos |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible; las instrucciones de tarea estan en ingles ("Fold the T-shirt on the table") |
| Licencia | Apache-2.0 |
| Formato de pesos | Checkpoints Orbax (`step_00002500`, `step_00004999`) mas matriz de ruido correlacionado `action_cholesky.npy`; tamano de repo 0,4 GB |

## Arquitectura y entrenamiento

La arquitectura sigue el esquema de RL residual de SPIRAL: una politica base π₀.₅ + RLT permanece congelada y un actor residual aprende una correccion de la accion. Las features de entrada son la representacion RLT z_rl de 2048 dimensiones mas el estado de 12 dimensiones. La dimension de accion es 12 (sin padding, todos los valores son deltas) y el horizonte de prediccion es 20. El actor y el critico tienen 3 capas de 1024 unidades, con escala de salida residual de 0,1. El ensemble consta de 5 criticos con sus correspondientes redes objetivo, factor de descuento gamma 0,9995, suavizado de objetivo tau 0,005 y kappa 4. La componente BC se regula con beta 30. El objetivo del critico es mixto: 0,45 de retorno Monte Carlo y 0,55 de diferencia temporal; el retorno MC se calcula como `progress[last frame] × 0,9995^steps_remaining`. Se aplica ruido correlacionado (beta 0,5) mediante `action_cholesky.npy` (matriz pre-reducida de 240×240, identica a las rondas 1 y 2). La optimizacion usa AdamW con learning rate 1e-4 para actor y critico, weight decay 1e-4 y recorte de gradiente 1,0.

Los datos de la ronda 4 (`local/r4_r3data_spiral2wc36_rm1fix12`) se fusionaron con `scripts/merge_lerobot_v20.py` y comprenden 220 episodios y 97.701 frames a 15 fps: 57 demostraciones de teleoperacion humanas (episodios 0–56), 36 episodios de rollouts de la politica de la etapa 3 de RLT (57–92) y de DAgger con ruido correlacionado, 47 episodios de rollouts de la ronda 1 de SPIRAL (93–139), 44 episodios de una sesion DAgger con 85 intervenciones humanas (140–183) y 36 episodios de rollouts de la ronda 2 con seleccion best-of-K (184–219). Todas las etiquetas provienen de RM1 (`sarm2_gripper58`) con `--stride 15`, `--smoother-mode none` y la instruccion de RM1 ("Fold the T-shirt on the table") separada del prompt de politica. Como innovaciones operativas, el entrenamiento introduce `--resume-from` / `--resume-actor-only` en `scripts/train_residual_rl_rlt.py` y la metrica registrada `actor/q_gain_select_best_of_k`.

## Capacidades

- Ejecucion de una politica de manipulacion robotica para una tarea unica: plegar una camiseta de manga larga sobre una mesa (SO-101).
- Generacion de correcciones residuales de accion de 12 dimensiones (deltas) sobre la salida de una politica base congelada π₀.₅ + RLT.
- Estimacion de valor mediante un ensemble de 5 criticos con doble uso (seleccion best-of-K y calculo de ventaja).
- Entrenamiento con retornos Monte Carlo derivados de la etiqueta de progreso del modelo de recompensa RM1.
- Soporte de reanudacion parcial: el actor puede inicializarse desde un checkpoint anterior manteniendo criticos nuevos.
- Inyeccion de ruido correlacionado entre dimensiones de accion mediante una matriz de Cholesky precalculada.
- No dispone de generacion de texto, razonamiento simbolico, codigo, matematicas, vision general, tool calling, capacidades de agente multi-paso, audio ni modo de pensamiento.
- Cobertura multilingue: no aplica ni esta documentada.

## Casos de uso

- Reproduccion de ablaciones de SPIRAL en la etapa 3 de RLT: el checkpoint permite replicar exactamente la ronda 4 (pasos 2500 y 4999) con semilla 42 y comparar contra las rondas 1, 2 y 3 usando el mismo dataset de 220 episodios y 97.701 frames.
- Diagnostico del critico: la prueba offline `scripts/probe_critic_actions_rlt.py` sobre 1600 frames de entrenamiento sirve para estudiar por que el critico ordena situaciones pero no acciones (correlacion de Spearman con el resultado de 0,431 y diferencia de Q entre dos propuestas de π₀.₅ del 1,14 %).
- Estudio del ruido correlacionado en acciones: `action_cholesky.npy` (240×240) permite analizar el efecto de la matriz de covarianza pre-reducida en el aprendizaje residual, comparando rondas con y sin esta componente.
- Generacion de nuevos datos de rollout para DAgger: aunque el autor no lo recomienda en robot, el pipeline de servicio descrito (`load_residual_rl_rlt_policy` mas servidor websocket) permite producir episodios etiquetados que alimenten rondas posteriores.
- Punto de partida para rondas de investigacion posteriores: la bandera `--resume-actor-only` deja reutilizar este actor como inicializacion mientras se entrenan criticos desde cero, lo que es util para aislar la contribucion del critico frente a la del actor.
- Auditoria del proceso de etiquetado con RM1: los episodios llevan puntuaciones de operador 1/2/3/4/5 por segmento, lo que permite medir la correlacion entre la recompensa aprendida y el juicio humano y detectar desalineaciones.
- Referencia para infraestructura de RL offline sobre LeRobot/SO-101: el repo documenta la fusion de datasets con `merge_lerobot_v20.py` y el etiquetado con `label_for_spiral.py`, reutilizables en otros proyectos de manipulacion.
- Material docente o de revision por pares: sirve como ejemplo publico y reproducible de un ciclo completo de RL residual offline con politica congelada, incluidos los fallos observados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible; se trata de un modelo de robotica y no de un modelo de lenguaje. Si se incluyen las cifras de entrenamiento del registro y los resultados de la prueba offline.

Numeros de entrenamiento (extracto del log):

| Paso | Perdida del critico | Q min / media / max | Media del objetivo MC | Q(actor) − Q(base) | Ganancia de seleccion best-of-4 | Tamano del residual |
|---|---|---|---|---|---|---|
| 100 | 0,162 | −0,30 / 0,15 / 0,64 | 0,770 | 0,0005 | 0,0020 | 0,0039 |
| 2500 | 0,0050 | 0,29 / 0,77 / 0,98 | 0,778 | 0,0003 | 0,0014 | 0,0021 |
| 4900 | 0,0041 | 0,24 / 0,76 / 0,97 | 0,772 | 0,0003 | 0,0016 | 0,0022 |

Prueba offline del critico (paso 4999, 1600 frames de entrenamiento):

| Metrica | Ronda 2 (r2c) | Ronda 3 | Esta ronda |
|---|---|---|---|
| Q sigue el resultado (Spearman) | 0,536 | 0,536 | 0,431 |
| Dos propuestas de π₀.₅ en el mismo estado: diferencia de Q / dispersion entre estados | 0,91 % | 0,89 % | 1,14 % |
| Accion prestada: margen frente al resultado (aleatoria / emparejada) | +0,10 / +0,06 | +0,11 / +0,03 | +0,04 / −0,03 |
| Pendiente ‖dQ/da‖ / misma direccion en todos los estados | 0,0099 / 0,57 | 0,0090 / 0,52 | 0,0093 / 0,68 |

## Requisitos de hardware

- VRAM estimada: no disponible en la informacion proporcionada. El repositorio ocupa 0,4 GB y contiene los dos checkpoints mas la matriz de Cholesky, pero no incluye la politica base π₀.₅ + RLT, que es obligatoria y no se cuantifica.
- Estimacion orientativa derivada de la arquitectura declarada: actor y cinco criticos de 3×1024 con entradas de 2060–2072 dimensiones implican del orden de 3 millones de parametros por red; el ensemble completo con redes objetivo en fp32 puede situarse en el rango de las decenas de millones de parametros, es decir, unos cientos de MB como maximo. Esta cifra es una estimacion aritmetica, no un dato publicado.
- GPU recomendadas: no disponibles. La carga real la determina la politica base π₀.₅, cuyos requisitos no se detallan en la model card.
- Compatibilidad con GPU de consumo: no confirmada. El modulo residual en si es ligero, pero la politica base condiciona la viabilidad en GPUs tipo RTX 4090 u otras.
- Opciones de despliegue: carga mediante `openpi.policies.residual_rl_rlt_policy.load_residual_rl_rlt_policy` y servidor websocket construido a mano, ya que `scripts/serve_policy.py` no tiene punto de entrada para esta politica. Se requiere la rama `lehome-noise-norm` (commit `f79f191` o posterior) con la normalizacion lehome y el modelo de 12 dimensiones. Todas las rutas deben ser absolutas porque Orbax rechaza rutas relativas. La normalizacion se resuelve desde `assets/rlt12_s3_dagger_rlt1/local/teleop57_daggerrlt1_v21/norm_stats.json`. Hay una copia solo de codigo en el bucket `hf://buckets/Nadeem-Shoukath115113/test/spiral_rlt12_serve`.
- Formatos no soportados: no hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI, que no son aplicables a este tipo de modelo.
- Latencia y throughput: no disponibles como medicion. El dataset de entrenamiento esta a 15 fps, lo que implica un presupuesto de control de aproximadamente 66,7 ms por paso si el despliegue replica esa frecuencia.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Datos de entrenamiento | Licencia | Disponibilidad | Rendimiento observado |
|---|---|---|---|---|---|---|
| Este checkpoint (ronda 4) | Actor residual + 5 criticos sobre π₀.₅ + RLT congelado | No disponible | 220 episodios / 97.701 frames, 15 fps | Apache-2.0 | Publico en HF (0,4 GB) | Spearman Q-resultado 0,431; residual 0,0021–0,0022; no evaluado en robot |
| `spiral-so101-rlt12-lehome-r1-demos57-rm1-b30-bs32-5k-clr1e4` (ronda 1) | Actor residual + criticos sobre la misma base | No disponible | 57 demostraciones de teleoperacion | Apache-2.0 | Publico en HF | No disponible en la informacion proporcionada |
| `pi05-so101-rlt12-lehome-s3-daggerrlt1-15fps-b32-10k` (politica base) | VLA π₀.₅ + RLT | No disponible | No disponible | No disponible | Publico en HF, requerido pero no incluido | No disponible |
| Rondas 2 y 3 (referencias internas del autor) | Mismo esquema residual | No disponible | No disponible | No disponible | No verificada en la busqueda | Spearman 0,536; margen de accion prestada +0,10/+0,11 |
| `Nadeem-Shoukath115113/spiral-so101-cloth-fold-sarm` | Modelo relacionado de plegado de tela | No disponible | No disponible | No disponible | Publico en HF | No disponible |

## Limitaciones y advertencias

- El autor indica explicitamente que el modelo no ha sido evaluado en robot y que no se recomienda gastar tiempo de robot con el: el critico no ordena las propuestas de π₀.₅ y el residual es un desplazamiento minimo y practicamente fijo.
- La prueba offline muestra degradacion respecto a rondas previas en la correlacion de Q con el resultado (0,431 frente a 0,536) y un margen negativo en la accion prestada emparejada (−0,03).
- Requiere obligatoriamente una politica base que no se incluye en el repositorio (`pi05-so101-rlt12-lehome-s3-daggerrlt1-15fps-b32-10k`, paso 9999), lo que hace que el checkpoint por si solo no sea funcional.
- El codigo necesario no esta completamente publicado: el autor menciona adiciones sin confirmar (`--resume-from`, `--resume-actor-only`, el preset `residual_rl_pi05_so101_rlt12_r4_rm1fix12` y la metrica `actor/q_gain_select_best_of_k`) sobre la rama `lehome-noise-norm`.
- Riesgo de sobreajuste al dominio: la tarea es unica ("Fold the long sleeved T-shirt on the table") y el dataset es pequeno y muy especifico; no hay evidencia de generalizacion a otras prendas, objetos o entornos.
- Las etiquetas de recompensa dependen de RM1 (`sarm2_gripper58`) con un ajuste concreto (`--stride 15`, `--smoother-mode none`); un cambio de configuracion invalida la comparabilidad con estas cifras.
- Al usar `--smoother-mode none`, el progreso puede decrecer, de modo que los fallos tardios no quedan congelados en su maximo; esto afecta a la forma del retorno Monte Carlo.
- Los datos de calidad son desiguales: varias sesiones de rollout tienen mayorias de puntuaciones 5 pero tambien puntuaciones 0, y una sesion (episodios 57–92) concentra 20 puntuaciones de 5 frente a 12 de 4 y 3 de 3.
- Sesgos conocidos: no documentados. Al ser un modelo de control robotico, los sesgos relevantes serian de distribucion de datos y de entorno fisico, no linguisticos.
- Riesgo de alucinacion: no aplica en el sentido generativo; el riesgo equivalente es la produccion de acciones fuera de distribucion.
- Licencia Apache-2.0: permite uso comercial del artefacto publicado, pero la politica base y cualquier componente de terceros pueden tener condiciones distintas no detalladas aqui.
- Para produccion: no apto. No hay latencias, throughput, tasas de exito en robot ni pruebas de robustez publicadas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Nadeem-Shoukath115113/spiral-so101-rlt12-lehome-r4-r3data-spiral2wc36-rm1fix12-from-r1-b30-mc045-bs32-5k
- Politica base requerida (π₀.₅ + RLT, paso 9999): https://huggingface.co/Nadeem-Shoukath115113/pi05-so101-rlt12-lehome-s3-daggerrlt1-15fps-b32-10k
- Ronda 1 de SPIRAL (inicializacion del actor): https://huggingface.co/Nadeem-Shoukath115113/spiral-so101-rlt12-lehome-r1-demos57-rm1-b30-bs32-5k-clr1e4
- Modelo relacionado de plegado de tela: https://huggingface.co/Nadeem-Shoukath115113/spiral-so101-cloth-fold-sarm
- Seguimiento del entrenamiento en Weights & Biases: proyecto `spiral-rlt12`, ejecucion `f1luw0sd`
- Copia solo de codigo en bucket de HuggingFace: `hf://buckets/Nadeem-Shoukath115113/test/spiral_rlt12_serve`
- Documentacion de NVIDIA sobre datasets y modelos para SO-101 sim-to-real: https://docs.nvidia.com/learning/physical-ai/sim-to-real-so-101/latest/datasets-and-models.html
- Paper de SPIRAL: no se ha encontrado enlace directo en la busqueda web; la model card lo cita como "Paper Algorithm 1, Stage 2b" sin referencia bibliografica.
- Repositorio de codigo openpi: no se ha encontrado enlace directo en la busqueda web; se mencionan la rama `lehome-noise-norm` y el commit `f79f191`.
