# iFaz/eqm-aloha_transfer_cube-seed3-24sep2026_2pm

## Resumen

EQM Policy es una política de manipulación robótica entrenada con LeRobot sobre el dataset simulado `lerobot/aloha_sim_transfer_cube_human`, publicada por el usuario iFaz con el identificador `eqm-aloha_transfer_cube-seed3-24sep2026_2pm`. No es un modelo de lenguaje: es una política visomotora de imitación que mapea observaciones (imágenes de cámaras e estado de las articulaciones) a secuencias de acciones, destinada al entorno MuJoCo `AlohaTransferCube-v0` con un robot bimanual ALOHA simulado. Cuenta con 76.446.214 parámetros reales y un repositorio de 0,3 GB en formato safetensors.

El modelo se enmarca en la familia de políticas generativas basadas en modelos de energía (*equilibrium matching*, etiqueta `eqm`), con un denoiser de tipo UNet, regularización jacobiana y un anclaje de punto fijo. Se entrenó durante 5.000 pasos con un tamaño de lote de 8 y semilla 3, sin evaluaciones intermedias (`eval_freq = 0`), y utiliza un horizonte de predicción de 64 pasos con 63 pasos de acción.

Su relevancia es estrictamente de investigación: es un artefacto reproducible de un experimento concreto (una semilla, una tarea, 5.000 pasos) cuyo resultado de evaluación publicado es de 0,0 % de éxito sobre un único episodio. Resulta útil como referencia negativa de línea base, como punto de partida para *fine-tuning* y para estudiar el comportamiento de la formulación EQM en robótica de imitación, no como política desplegable en producción.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Política de imitación generativa con modelo de energía (*equilibrium matching*, `eqm`); denoiser UNet; tipo de EBM `dot` |
| Parametros totales | 76.446.214 (aproximadamente 76,4 M) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica en el sentido de LLM; horizonte de predicción de acciones de 64 pasos (`horizon = 64`) y 63 pasos de acción (`n_action_steps = 63`) durante el entrenamiento |
| Tipos de cuantizacion | No disponible; el repositorio solo contiene pesos en safetensors sin variantes cuantizadas publicadas |
| Idiomas soportados | `en` (campo de idioma de la model card); el modelo no procesa lenguaje natural, solo observaciones visomotoras |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (mixin `pytorch_model_hub_mixin`, librería `lerobot`) |

Parámetros adicionales de configuración de la política, tal y como se declaran en la model card: `ebm = dot`, `jacobian_reg_weight = 0.001`, `jacobian_reg_probes = 1`, `denoiser_type = unet`, `fixed_point_anchor_weight = 0.1`, `c_gamma_a = 0.5`, `use_adaptive_compute = False`, `drop_n_last_frames = 0`.

## Arquitectura y entrenamiento

La política pertenece a la familia `eqm` implementada en LeRobot. Según la configuración publicada, emplea un denoiser basado en UNet que opera sobre un horizonte de 64 pasos y genera secuencias de 63 acciones. La formulación incluye un término de energía de tipo `dot` (`ebm = dot`), regularización jacobiana con peso 0,001 y una única sonda de estimación (`jacobian_reg_probes = 1`), así como un anclaje de punto fijo con peso 0,1 (`fixed_point_anchor_weight`) que estabiliza el objetivo de *equilibrium matching*. El parámetro `c_gamma_a = 0.5` modula el comportamiento del muestreador, y el cómputo adaptativo está desactivado (`use_adaptive_compute = False`), por lo que el número de pasos de integración es fijo. La model card no documenta detalles adicionales del *backbone*, del número de capas ni del mecanismo de atención.

El entrenamiento se realizó con LeRobot sobre el dataset `lerobot/aloha_sim_transfer_cube_human` (demostraciones humanas teleoperadas sobre ALOHA simulado), durante 5.000 pasos, con lote de 8, 4 procesos de carga de datos y semilla 3. No se registró ninguna evaluación durante el entrenamiento (`eval_freq = 0`) y los checkpoints se guardaron cada 1.000 pasos (`save_freq = 1000`). No se documenta en la información disponible si hubo etapas de RLHF, DPO u optimización por preferencias; al tratarse de una política de imitación, el objetivo declarado es la reproducción de las demostraciones del dataset. En la fase de evaluación se configuró un umbral de detección fuera de distribución (`ood_z_threshold = 3.0`) con registro en CSV y calibración previa en `eqm_calibration.json`, lo que sugiere que la implementación incorpora monitorización de OOD como parte del pipeline experimental.

## Capacidades

- Generación de trayectorias de acción continuas para control robótico bimanual en el entorno simulado ALOHA (`AlohaTransferCube-v0`).
- Ejecución de políticas de imitación visomotora a partir de observaciones de cámara y estado de las articulaciones, con horizonte de 64 pasos y bloques de 63 acciones.
- Predicción de secuencias de acción en lugar de acciones aisladas, lo que reduce la frecuencia de replanificación.
- Detección de observaciones fuera de distribución mediante puntuaciones z calibradas (`ood_z_threshold = 3.0`) y registro en CSV.
- Aprendizaje por imitación a partir de demostraciones humanas; no requiere definición explícita de recompensa durante el entrenamiento.
- Configuración geométrica y de muestreo ajustable mediante hiperparámetros expuestos en la configuración de la política (`sample_stepsize`, `n_action_steps`, `horizon`).
- No dispone de *tool calling*, *function calling*, capacidades de agente multi-paso, razonamiento simbólico ni procesamiento de lenguaje natural.
- No dispone de capacidades de visión generalistas: la percepción está limitada a las cámaras del entorno ALOHA y al preprocesamiento definido por LeRobot.
- No tiene modo *thinking*, ni procesamiento de audio, ni generación de texto.

## Casos de uso

- Línea base negativa en experimentos de imitación: dado que la evaluación publicada arroja un 0,0 % de éxito, el modelo sirve como referencia de partida contra la que medir variantes mejoradas de la formulación EQM en la misma tarea y con la misma semilla.
- Reproducción de experimentos: permite replicar exactamente el entrenamiento con semilla 3, 5.000 pasos y lote 8, lo que facilita auditar la variabilidad entre semillas comparando con las otras versiones publicadas por el mismo autor.
- Estudio del efecto de los hiperparámetros de EQM: con `jacobian_reg_weight`, `fixed_point_anchor_weight` y `c_gamma_a` expuestos en la configuración, es posible diseñar ablaciones sistemáticas sobre el término de energía y la regularización jacobiana sin reescribir el pipeline.
- Punto de partida para *fine-tuning*: al estar en formato safetensors y ser compatible con LeRobot, se puede continuar el entrenamiento sobre el mismo dataset con más pasos o sobre tareas relacionadas de manipulación bimanual.
- Validación de infraestructura de evaluación: útil para comprobar que un pipeline propio de `lerobot-eval` con MuJoCo, `env.type = aloha` y ejecución asíncrona (`eval.use_async_envs`) funciona de extremo a extremo antes de lanzar experimentos costosos.
- Evaluación de detección OOD: el modelo registra puntuaciones de novedad con umbral z = 3,0, por lo que puede emplearse para validar si un detector de fuera de distribución identifica correctamente perturbaciones en las observaciones del entorno simulado.
- Docencia y divulgación técnica: sirve como ejemplo autocontenido y ligero (0,3 GB) de cómo se define y publica una política de imitación en LeRobot, incluyendo configuración de entrenamiento, de política y de evaluación.
- Comparación de formulaciones generativas: permite contrastar el enfoque EQM con políticas de difusión o de *action chunking* bajo el mismo entorno y dataset, siempre que se igualen pasos de entrenamiento y presupuesto de evaluación.

## Benchmarks y rendimiento

La información disponible únicamente incluye los resultados de evaluación declarados por el autor para un solo episodio. No se han publicado resultados de benchmarks adicionales (por ejemplo, comparativas con ACT o Diffusion Policy) en la información disponible.

| Métrica | Valor |
|---|---|
| Episodios evaluados | 1 |
| Tasa de éxito | 0,0 % |
| Recompensa media acumulada (avg sum reward) | 0,00 |
| Recompensa máxima media (avg max reward) | 0,00 |
| Tiempo de evaluación | 45,2 s |
| Entorno | `aloha` / `AlohaTransferCube-v0` |
| `n_action_steps` en evaluación | 32 |
| `sample_stepsize` en evaluación | 0,017 |

Advertencia metodológica: una tasa de éxito de 0,0 % medida sobre un único episodio tiene un intervalo de confianza muy amplio y no permite concluir que el modelo sea incapaz de resolver la tarea ni que la formulación EQM sea inviable. La configuración de evaluación difiere además de la de entrenamiento en el número de pasos de acción (32 frente a 63), lo que puede afectar al rendimiento observado.

## Requisitos de hardware

- Peso de los parámetros: 76.446.214 parámetros equivalen a aproximadamente 306 MB en fp32 y 153 MB en fp16 o bf16; el repositorio completo ocupa 0,3 GB.
- VRAM estimada para inferencia: en torno a 1-2 GB considerando pesos en fp32, activaciones del UNet y los búferes de observación (imágenes de cámara y estados de 14 articulaciones para ALOHA). No se dispone de una medición oficial.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM es suficiente; se ha entrenado en `cuda` según la model card. Una RTX 3060, RTX 4060, RTX 3090 o RTX 4090 cubren el caso sin dificultad. No se requiere A100 ni H100.
- Cabe en GPU de consumo: sí, con holgura. También es viable en portátiles con GPU discreta de gama media y en iGPU con memoria unificada suficiente, aunque sin datos de latencia publicados.
- Opciones de despliegue: LeRobot (`lerobot-eval`, `lerobot-train`) con PyTorch y el simulador MuJoCo para el entorno `aloha`. No es compatible con vLLM, llama.cpp, Ollama, TGI ni otros servidores de inferencia de LLM, ya que no es un modelo de lenguaje.
- Latencia y throughput: no disponibles como métrica de inferencia aislada. El único dato temporal es el tiempo total de evaluación de un episodio: 45,2 s, que incluye la simulación física en MuJoCo, el paso del entorno y la comunicación asíncrona, no solo el cómputo de la política.
- Entrenamiento: la configuración usa lote 8, 4 workers y 5.000 pasos, un presupuesto asequible en una única GPU de gama media-alta.

## Comparativa con modelos similares

No se dispone de datos de rendimiento comparativos publicados en la información proporcionada. La comparación siguiente es estructural y se limita a los campos documentados; los valores marcados como «no disponible» no se han podido verificar.

| Modelo | Categoría | Parametros | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| EQM Policy (`iFaz/eqm-aloha_transfer_cube-seed3-24sep2026_2pm`) | Política de imitación (EQM, denoiser UNet) | 76.446.214 | ALOHA sim, transfer cube | Apache-2.0 | HuggingFace, librería `lerobot` |
| ACT (Action Chunking with Transformers) | Política de imitación con *action chunking* | No disponible en la información proporcionada | Manipulación ALOHA (real y sim) | No disponible en la información proporcionada | Implementación de referencia en LeRobot |
| Diffusion Policy | Política de imitación basada en difusión | No disponible en la información proporcionada | Manipulación y tareas visomotoras | No disponible en la información proporcionada | Implementación de referencia en LeRobot |
| Otras políticas `eqm` del mismo autor | Política de imitación (EQM) | No disponible | ALOHA sim, transfer cube, distintas semillas | Apache-2.0 | HuggingFace |

Criterio de comparación recomendado: para que una comparación sea válida hay que igualar el número de episodios de evaluación (muy superior a 1), el `n_action_steps` de evaluación y el número de pasos de entrenamiento, y usar semillas distintas para estimar la varianza.

## Limitaciones y advertencias

- Rendimiento verificado nulo en la única evaluación publicada: 0,0 % de éxito y 0,00 de recompensa media sobre un episodio. No debe usarse como política funcional sin un reentrenamiento o *fine-tuning* previo.
- Base estadística insuficiente: un solo episodio de evaluación no permite estimar la tasa de éxito real ni su varianza.
- Desajuste entre configuración de entrenamiento y de evaluación: el entrenamiento declara 63 pasos de acción y la evaluación 32, además de un `sample_stepsize` distinto (0,017), lo que puede degradar el rendimiento medido.
- Ausencia de evaluación durante el entrenamiento: `eval_freq = 0` implica que no hay curva de aprendizaje ni criterio de mejor checkpoint; el artefacto publicado corresponde a un único punto del entrenamiento.
- Especialización extrema: el modelo está entrenado exclusivamente para `AlohaTransferCube-v0` con el dataset `aloha_sim_transfer_cube_human`. No generaliza a otras tareas, otros robots ni al mundo real sin reentrenamiento.
- Dominio simulado: entrenado sobre datos de simulación MuJoCo con demostraciones humanas teleoperadas; el *transfer* a hardware real no está demostrado y es propenso a la brecha sim-a-real.
- Volumen de datos reducido: 5.000 pasos de entrenamiento con lote 8 implican un presupuesto de optimización muy bajo para una política de 76 M de parámetros, lo que probablemente sea la causa del rendimiento nulo.
- Sobreajuste al entorno: la observación se limita a las cámaras y estados definidos por el entorno ALOHA en LeRobot; cambios en la resolución, el número de cámaras o el preprocesamiento invalidan la política.
- Idiomas: el campo de la model card declara `en`, pero el modelo no procesa lenguaje; no existe soporte multilingüe ni interfaz conversacional.
- Sin garantías de robustez ni de seguridad: no se han publicado estudios de sesgos, fallos silenciosos, reproducibilidad de la detección OOD ni comportamiento ante perturbaciones. Su uso en un robot físico requeriría protocolos de parada de emergencia y validación independiente.
- Licencia Apache-2.0: permite uso comercial y modificación, pero no exime de responsabilidad al usuario; el autor no ofrece ninguna garantía sobre el comportamiento del modelo.
- Procedencia y mantenimiento: 0 descargas y 0 *likes* en el momento de la consulta, sin documentación adicional más allá de la model card y sin paper asociado identificado. Es un artefacto experimental sin soporte.
- Riesgo de alucinación: no aplica en el sentido de generación de texto, pero existe el riesgo análogo de acciones inconsistentes o fuera de distribución, parcialmente mitigado por el registro OOD con umbral z = 3,0.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/iFaz/eqm-aloha_transfer_cube-seed3-24sep2026_2pm
- Dataset de entrenamiento: https://huggingface.co/datasets/lerobot/aloha_sim_transfer_cube_human
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
- Cita de LeRobot (Cadene, Alibert y otros, 2024), incluida en la model card:
  - `author = {Cadene, Remi and Alibert, Simon and others}`, `title = {LeRobot}`, `year = {2024}`, `url = {https://github.com/huggingface/lerobot}`
- Paper asociado a la formulación EQM: no disponible en la información proporcionada.
- Demos, blogs o informes técnicos adicionales: no disponible en la información proporcionada.
