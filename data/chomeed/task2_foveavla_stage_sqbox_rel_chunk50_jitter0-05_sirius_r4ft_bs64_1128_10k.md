# chomeed/task2_foveavla_stage_sqbox_rel_chunk50_jitter0.05_sirius_r4ft_bs64_1128_10k

## Resumen

`chomeed/task2_foveavla_stage_sqbox_rel_chunk50_jitter0.05_sirius_r4ft_bs64_1128_10k` es un checkpoint de investigacion para robotica de manipulacion, no un modelo de lenguaje general. Se trata de un fine-tune de `lerobot/pi05_base` (la variante pi0.5 de Physical Intelligence) enriquecido con la extension FoveaVLA, que anade prediccion de subtareas de alto nivel y atencion foveada por camara. El autor, `chomeed`, lo publica como parte de una campana de entrenamiento sobre el dataset Hyundai DUET (tarea 2) con rondas sucesivas de DAgger.

El checkpoint corresponde al paso 10.000 de 30.000 actualizaciones del optimizador de una ronda de fine-tune DAgger (ronda 4) sobre un modelo previo ya entrenado en foveacion por etapas. El modelo recibe seis camaras (d405_left, d405_right, zed_mini, fovea_zed_mini, fovea_d405_left, fovea_d405_right) y un estado de 18 dimensiones, y emite acciones de 18 dimensiones en chunks de 50 pasos (30 ejecutados). La perdida de entrenamiento en este paso es 0,136.

Su relevancia es acotada y experimental: se publica con 0 descargas y 0 likes, sin licencia declarada, y esta pensado para reproducir el pipeline de investigacion del autor (LeRobot 0.6.2 con la rama `stage-views` de `lerobot_foveavla` y `lerobot_sirius`), no para uso en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLA basada en pi0.5 (VLM + action expert) con extension FoveaVLA (prediccion de subtarea y cajas foveadas) |
| Parametros totales | 4.145.521.424 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors; el autor no documenta cuantizaciones) |
| Idiomas soportados | no disponible (modelo de robotica; las instrucciones de subtarea estan en ingles) |
| Licencia | no disponible |
| Formato de pesos | safetensors (libreria LeRobot) |

## Arquitectura y entrenamiento

El modelo parte de `lerobot/pi05_base` y anade el modulo FoveaVLA. El VLM genera primero la subtarea actual tras el prompt (por ejemplo, "grasp the board with the right hand", "turn the head to the center", "insert the board into the control module") y el action expert condiciona sus predicciones sobre esa subtarea. Ademas, cuatro slots de caja por camara (zed_mini, d405_left, d405_right) predicen la caja de cada camara en t+8 sobre 1024 bins y 4 clases; el action expert no ve estas cajas. En subtareas de tipo "grasp" o "turn the head" la vista recortada se enmascara de la atencion (como una camara ausente) y solo se usan los fotogramas completos; en "insert" se usa exactamente la caja de la consulta anterior estirada al tamano del recorte.

El entrenamiento se realiza con LeRobot 0.6.2 (`pi05_foveavla_subtask`, rama `stage-views` de `lerobot_foveavla`, mas `lerobot_sirius`) sobre el dataset Hyundai DUET tarea 2 y ocho datasets de DAgger (rondas 1 a 4 para las subtareas 2 y 3). Batch efectivo de 64 (32 por GPU en 2x B200, DDP), AdamW con lr pico 1e-5, warmup 1000 y decaimiento coseno hasta 2,5e-6 en 30.000 pasos, precision bf16 con pesos maestros fp32 y gradient checkpointing. El muestreo SIRIUS usa ratios fijos por clase: 50% demostraciones humanas, 40% intervenciones, 10% rollouts autonomos y 0% para los 3 segundos previos a cada intervencion. Las acciones son relativas al estado actual salvo cuatro articulaciones que se mantienen absolutas (right_index_joint2, right_index_joint3, left_index_joint2, left_index_joint3). La normalizacion se hereda del checkpoint inicial, y las estadisticas quedan guardadas en los ficheros `policy_preprocessor_*` y `policy_postprocessor_*` del repositorio.

## Capacidades

- Prediccion de acciones de manipulacion robotica de 18 dimensiones en chunks de 50 pasos (30 ejecutados).
- Prediccion explicita de subtareas de alto nivel en lenguaje natural antes de generar la accion.
- Atencion foveada por camara: seleccion de region de interes mediante cajas predichas a t+8.
- Fusion multimodal de seis camaras RGB mas estado propioceptivo de 18 dimensiones.
- Entrenamiento con datos de DAgger (intervenciones humanas) para corregir errores de politica.
- No soporta tool calling, function calling ni agentes multi-paso en el sentido de un LLM.
- Capacidades multilingues no documentadas; las subtareas del dataset estan en ingles.
- No dispone de modo thinking, vision general, audio ni otras capacidades fuera del control robotico.

## Casos de uso

- Investigacion en VLA con foveacion: el modelo sirve como referencia reproducible para estudiar como la atencion selectiva por camara afecta al control fino en tareas de insercion, gracias a las cajas predichas y al enmascaramiento selectivo de recortes.
- Manipulacion bimanual en entorno Hyundai DUET: con seis camaras y estado de 18 dimensiones, puede ejecutar las subtareas 2 y 3 del benchmark (agarrar tablero, girar la cabeza, insertar el tablero en el modulo de control) sobre el setup fisico del autor.
- Aprendizaje por imitacion con DAgger: util para evaluar recetas de mezcla demo/intervencion/robot (ratios SIRIUS) y su efecto en la robustez de la politica ante correcciones humanas.
- Estudio de chunking de acciones: al emitir chunks de 50 pasos con 30 ejecutados, permite analizar el compromiso entre reactividad y suavidad en politicas de control.
- Base para nuevos fine-tunes: al ser un checkpoint intermedio (10k de 30k) sobre una ronda DAgger 4, sirve como inicializacion para experimentos posteriores con mas rondas o datasets adicionales.
- Evaluacion de prediccion de subtareas: el modulo VLM que escribe la subtarea antes de la accion permite medir precision de planificacion de alto nivel en tareas largas.
- Reproduccion de pipelines LeRobot personalizados: util para validar la integracion `lerobot_foveavla` + `lerobot_sirius` en flujos de entrenamiento con multiples GPUs B200.
- No es adecuado para atencion al cliente, generacion de codigo, agentes conversacionales ni ninguna tarea de NLP general.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El unico dato de rendimiento reportado es la perdida de entrenamiento en el paso 10.000, que es 0,136, sin comparacion con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; con 4.145.521.424 parametros, en bf16 los pesos ocupan aproximadamente 8,3 GB, a los que hay que sumar activaciones, buffers de seis camaras y estado. En fp32 serian unos 16,6 GB solo de pesos.
- GPU recomendadas: el autor entrena con 2x NVIDIA B200 en bf16; para inferencia es razonable una GPU de datacenter (A100, H100, B200) o una consumer de gama alta con suficiente VRAM.
- Cabe en consumer GPU: probablemente en RTX 4090 (24 GB) en bf16 si se ajusta el batch y se evita el gradient checkpointing; no confirmado por el autor.
- Opciones de despliegue: libreria LeRobot 0.6.2 con `lerobot_policy_pi05_foveavla` (instalable desde `git+https://github.com/HDR-SRL/lerobot_foveavla`); no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de politica.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este checkpoint (FoveaVLA, 10k/30k) | 4.145.521.424 | no disponible | VLA pi0.5 + subtareas + foveacion | no disponible | Hugging Face, 0 descargas |
| `lerobot/pi05_base` | no disponible | no disponible | VLA pi0.5 base | no disponible | Hugging Face (modelo base) |
| `chomeed/task2_foveavla_stage_sqbox_rel_chunk50_jitter0.05_sirius_bs64_1127_30k` | no disponible | no disponible | FoveaVLA etapa foveacion, 30k pasos | no disponible | Hugging Face (checkpoint previo) |

La comparacion con modelos de proposito general no es significativa: tanto el modelo base como este checkpoint son politicas de robotica, no LLMs, y no se han publicado metricas comparables (MMLU, HumanEval, GSM8K) para ninguno de ellos.

## Limitaciones y advertencias

- Modelo de investigacion con 0 descargas y 0 likes: no hay evidencia de uso externo ni validacion independiente.
- Sin licencia declarada: no se puede asumir permiso para uso comercial; hay que contactar con el autor antes de cualquier despliegue productivo.
- Entrenado exclusivamente sobre el dataset Hyundai DUET tarea 2 y sus rondas DAgger: el dominio esta limitado al setup fisico, camaras y tareas de ese dataset.
- Checkpoint intermedio (10.000 de 30.000 pasos): no es el modelo final de la campana y puede presentar menor calidad que el checkpoint de 30k.
- Las subtareas que genera el VLM estan en ingles y limitadas al vocabulario del dataset; no hay capacidades multilingues documentadas.
- Riesgo de sobreajuste a las camaras y calibracion concretas (d405_left, d405_right, zed_mini y sus versiones fovea); la d435 no es una entrada valida.
- La normalizacion depende de los ficheros `policy_preprocessor_*` y `policy_postprocessor_*` del repositorio; cargar los pesos sin ellos rompe la reproducibilidad.
- No hay datos de benchmarks, latencia ni robustez fuera de distribucion; cualquier uso en produccion requeriria evaluacion propia.
- El pipeline requiere dependencias no estandar (`lerobot_foveavla` en rama `stage-views`, `lerobot_sirius`), lo que dificulta la reproducibilidad fuera del entorno del autor.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/chomeed/task2_foveavla_stage_sqbox_rel_chunk50_jitter0.05_sirius_r4ft_bs64_1128_10k
- Modelo base: https://huggingface.co/lerobot/pi05_base
- Checkpoint previo (30k, etapa foveacion): https://huggingface.co/chomeed/task2_foveavla_stage_sqbox_rel_chunk50_jitter0.05_sirius_bs64_1127_30k
- Dataset principal: https://huggingface.co/datasets/HDR-AI-tmp/hyundai_duet_task2
- Dataset DAgger subtarea 2 ronda 4: https://huggingface.co/datasets/HDR-AI-tmp/hyundai_duet_task2_subtask2_dagger_r4
- Dataset DAgger subtarea 3 ronda 4: https://huggingface.co/datasets/HDR-AI-tmp/hyundai_duet_task2_subtask3_dagger_r4
- Repositorio `lerobot_foveavla` (rama `stage-views`): https://github.com/HDR-SRL/lerobot_foveavla/tree/stage-views
- Registro de entrenamiento en W&B: https://wandb.ai/meeroro56/hyundai_duet/runs/3qz9lxzh
