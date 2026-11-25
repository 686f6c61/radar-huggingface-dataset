# lejelly/icwm2027-tdmpc2-mt30-ft

## Resumen

`lejelly/icwm2027-tdmpc2-mt30-mt30-ft` es una coleccion de checkpoints de TD-MPC2 (Twelve Dynamics Model Predictive Control, version 2) afinados de forma mono-tarea sobre dos tareas de DMControl: `acrobot-swingup` (indice 6 en el conjunto mt30) y `hopper-hop` (indice 18). El autor, `lejelly`, parte de los checkpoints oficiales multi-tarea mt30 de TD-MPC2 en cinco tamanos (1M, 5M, 19M, 48M y 317M parametros) y realiza un ajuste fino con RL online durante 100.000 pasos de entorno por tarea.

El objetivo declarado no es desplegar un agente de proposito general, sino disponer de pares (base, fine-tune) que compartan exactamente el mismo checkpoint de partida para poder calcular vectores de tarea (theta_FT - theta_base) y estudiar tecnicas de model merging y aprendizaje continuo en modelos del mundo. Es, por tanto, un artefacto de investigacion mas que un modelo listo para produccion.

La relevancia actual radica en que los world models basados en planificacion (como TD-MPC2) son una alternativa eficiente en muestras al RL model-free, y la comunidad carece de checkpoints publicos sistematicos para estudiar como se componen o se olvidan habilidades al ajustar y fusionar estos modelos. Este repositorio cubre ese hueco con una rejilla controlada de tamanos, semillas y pasos intermedios.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | TD-MPC2 (world model + planificacion MPC con politica aprendida); encoder y dinamica latente, recompensa, ensemble de Q y politica |
| Parametros totales | Cinco variantes: 1M, 5M, 19M, 48M y 317M |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; horizonte de planificacion `horizon` = 3) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | MIT |
| Formato de pesos | `.pt` (state dict de PyTorch serializado con `TDMPC2.save()`, estructura `{"model": state_dict}`) |

## Arquitectura y entrenamiento

TD-MPC2 combina un modelo del mundo aprendido de forma conjunta (encoder, modelo de dinamica latente, predictor de recompensa, ensemble de funciones Q y politica) con planificacion tipo MPC en el espacio latente, usando la politica como propuesta y el ensemble de Q como critero de seleccion. Los checkpoints base son los oficiales multi-tarea `mt30` (30 tareas de DMControl), que se re-guardan como `base/mt30-<size>M_step_0.pt` para fijar una referencia identica en todos los runs.

El ajuste fino sigue el bucle `OnlineTrainer` oficial (commit `332f19e`) durante 100.000 pasos de entorno. Los primeros 2.500 pasos los recoge el agente preentrenado planificando con ruido de exploracion (no acciones aleatorias); despues se realizan 2.500 actualizaciones y, a partir de ahi, una actualizacion por paso. Los hiperparametros son los de TD-MPC2 por defecto con `lr` 3e-4, `batch_size` 256, `horizon` 3, `buffer_size` 100.000 y `torch.compile` activado. Se congelan el encoder (`_encoder`) y el embedding de tarea (`_task_emb`), y se entrenan la dinamica (`_dynamics`), la recompensa (`_reward`), el ensemble de Q (`_Qs`, incluidos los Q objetivo) y la politica (`_pi`). La evaluacion durante el ajuste se hace con 10 episodios cada 10.000 pasos y la puntuacion es el retorno del episodio dividido entre 10.

La rejilla de runs cubre: semilla 1 para los cinco tamanos con checkpoints en los pasos 25k, 50k, 75k y 100k (1M y 317M) o cada 10k hasta 100k (5M, 19M y 48M); y semillas 2 y 3 adicionales para 48M y 317M con checkpoints cada 10k hasta 100k. Cada run incluye `config.json`, `train.jsonl`, `eval.jsonl` y `ft.log`.

## Capacidades

- Control continuo mono-tarea en DMControl: `acrobot-swingup` y `hopper-hop`.
- Planificacion online en espacio latente con horizonte 3 mediante MPC.
- Aprendizaje por refuerzo online sobre un world model preentrenado multi-tarea.
- Reutilizacion del checkpoint base mt30 (30 tareas) como punto de partida comun entre runs, lo que permite calcular vectores de tarea.
- Soporte de model merging y aprendizaje continuo mediante los pares (base, fine-tune) publicados.
- No es un modelo de lenguaje: no genera texto, no soporta tool calling, no tiene capacidades multilingues ni modos de razonamiento simbolico.
- No incorpora vision ni audio; opera sobre observaciones de estado de DMControl.

## Casos de uso

- Investigacion en model merging de world models: los pares (base, fine-tune) con el mismo checkpoint de partida permiten calcular vectores de tarea `theta_FT - theta_base` y probar tecnicas de interpolacion, TIES o task arithmetic sobre la dinamica, recompensa, Q y politica.
- Estudio de aprendizaje continuo y olvido catastrofico: la rejilla de tamanos y semillas permite medir como se degrada el rendimiento multi-tarea del base mt30 tras el ajuste mono-tarea en `acrobot-swingup` o `hopper-hop`, con curvas de evaluacion cada 10.000 pasos.
- Reproduccion de experimentos de RL model-based: el repositorio incluye `config.json`, `train.jsonl`, `eval.jsonl` y `ft.log` por run, lo que facilita replicar el bucle `OnlineTrainer` con los mismos hiperparametros y commit.
- Analisis de escalado en world models: las cinco variantes (1M a 317M) con el mismo protocolo de ajuste permiten estudiar como escala la eficiencia en muestras y la calidad de la planificacion con el tamano del modelo.
- Baseline para metodos de transferencia entre tareas: los checkpoints intermedios (25k, 50k, 75k, 100k o cada 10k) sirven como puntos de comparacion para tecnicas de destilacion o adaptacion rapida en DMControl.
- Docencia y prototipado de RL: el checkpoint de 1M cabe en cualquier GPU consumer y permite ejecutar un agente TD-MPC2 completo con `TDMPC2.load(path)` sobre un agente construido con `task=mt30 model_size=<size>`, util para practicas y validacion de pipelines.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo indica que la evaluacion se realiza con 10 episodios cada 10.000 pasos y que la puntuacion reportada es el retorno del episodio dividido entre 10, pero no incluye cifras numericas de retorno ni comparaciones.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la informacion proporcionada. Como referencia de orden de magnitud, el repositorio completo ocupa 52,4 GB, pero ese tamano incluye todos los checkpoints, no el peso de un modelo individual.
- GPU recomendadas: no disponible. Para el tamano de 317M se espera necesitar una GPU con memoria suficiente para cargar el state dict completo y ejecutar planificacion con `horizon` 3; para 1M y 5M, cualquier GPU consumer moderna deberia bastar, aunque no se confirma en la model card.
- Cabe en GPU consumer: probablemente si para los tamanos 1M, 5M, 19M y 48M; no confirmado para 317M.
- Opciones de despliegue: carga mediante `TDMPC2.load(path)` sobre un agente construido con `task=mt30 model_size=<size>`, usando el codigo oficial de TD-MPC2 (commit `332f19e`). No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / horizonte | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| TD-MPC2 mt30 fine-tune (este) | 1M, 5M, 19M, 48M, 317M | horizonte 3 | Control continuo DMControl (`acrobot-swingup`, `hopper-hop`) | MIT | Hugging Face |
| TD-MPC2 mt30 oficial | 1M, 5M, 19M, 48M, 317M | horizonte 3 | Multi-tarea DMControl (30 tareas) | MIT | GitHub oficial |
| DreamerV3 | no disponible en la informacion | no disponible | Control continuo y discreto, multiplataforma | MIT | Repositorio oficial |
| TD-MPC2 single-task oficial | 1M a 317M | horizonte 3 | Mono-tarea DMControl | MIT | GitHub oficial |

La comparativa se limita a alternativas del mismo paradigma (world models para RL); no se dispone de datos de rendimiento comparativo en la informacion proporcionada.

## Limitaciones y advertencias

- No es un modelo de lenguaje ni un modelo generativo de texto: no admite prompts en lenguaje natural ni tool calling.
- Uso restringido a dos tareas de DMControl (`acrobot-swingup` y `hopper-hop`); no generaliza a otras tareas sin un nuevo ajuste fino.
- El ajuste fino congela el encoder y el embedding de tarea, por lo que la representacion visual/estado no se adapta a la tarea objetivo.
- Riesgo de olvido catastrofico del comportamiento multi-tarea del base mt30 tras el ajuste mono-tarea; la model card no reporta metricas de retencion.
- Los checkpoints son state dicts de PyTorch que requieren el codigo oficial de TD-MPC2 (commit `332f19e`) y la API `TDMPC2.load`; no son cargables con librerias genericas de inferencia.
- El repositorio ocupa 52,4 GB, lo que exige espacio en disco considerable si se descarga completo.
- No se documentan sesgos, tasas de alucinacion ni limitaciones de idioma porque el modelo no procesa lenguaje.
- Licencia MIT: permite uso comercial y modificacion, pero el autor no ofrece garantias ni soporte; verificar la licencia de los checkpoints oficiales de TD-MPC2 antes de redistribuir.
- Sin descargas ni likes en el momento de la consulta: no hay evidencia de validacion por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/lejelly/icwm2027-tdmpc2-mt30-ft
- Codigo oficial de TD-MPC2: https://github.com/nicklashansen/tdmpc2
- Checkpoints oficiales mt30 de TD-MPC2: no disponible en la informacion proporcionada
- Paper de TD-MPC2: no disponible en la informacion proporcionada
- Blog o demo del autor: no disponible en la informacion proporcionada
