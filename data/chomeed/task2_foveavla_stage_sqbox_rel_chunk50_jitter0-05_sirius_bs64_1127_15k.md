# chomeed/task2_foveavla_stage_sqbox_rel_chunk50_jitter0.05_sirius_bs64_1127_15k

## Resumen

`chomeed/task2_foveavla_stage_sqbox_rel_chunk50_jitter0.05_sirius_bs64_1127_15k` es un checkpoint de politica robotica (VLA, vision-language-action) para manipulacion bimanual, construido sobre `lerobot/pi05_base` (pi0.5 de Physical Intelligence) y aumentado con la variante FoveaVLA. Lo desarrolla el usuario `chomeed` en el contexto de la competicion o proyecto Hyundai Duet, y esta especializado en la tarea 2 (insercion de cable GRC) con prediccion de subtareas de alto nivel y foveacion por recortes de imagen.

El modelo resuelve el mapeo directo de observaciones multimodales (6 camaras y un estado de 18 dimensiones) a una accion continua de 18 dimensiones, emitida en chunks de 50 pasos con 30 acciones efectivas. Su particularidad es que el VLM primero escribe la subtarea actual en texto y el experto de accion condiciona sobre ella; ademas, en las subtareas que lo requieren, se alimenta de recortes RGB de 224x224 centrados en cajas predichas por el propio modelo (foveacion), lo que concentra la capacidad visual en la zona de interaccion.

Se trata de un checkpoint intermedio: 15.000 de 30.000 actualizaciones de optimizador, con perdida de entrenamiento de 0.197 en ese paso. Es relevante como referencia tecnica de como se combinan prediccion de subtareas, DAgger iterativo y atencion foveada en un pipeline LeRobot para robotica de insercion de precision.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLA basada en pi0.5 (VLM + experto de accion) con extension FoveaVLA y prediccion de subtareas |
| Parametros totales | 4.145.521.424 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (entrada: 6 camaras + estado 18-D; salida: chunk de 50 acciones) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; entrenamiento en bf16 con pesos maestros fp32) |
| Idiomas soportados | no disponible (el modelo emite subtareas en texto, ejemplos en ingles en la model card) |
| Licencia | no disponible |
| Formato de pesos | safetensors (repo de 16,6 GB) |

## Arquitectura y entrenamiento

El modelo parte de `lerobot/pi05_base` y se entrena con el framework LeRobot 0.6.2, en la variante `pi05_foveavla_subtask` de la rama `stage-views` de `lerobot_foveavla`, junto con `lerobot_sirius`. La arquitectura combina un VLM que genera la subtarea actual como texto tras el prompt y un experto de accion que condiciona sobre esa subtarea. Adicionalmente, el modelo predice cajas por camara (zed_mini, d405_left, d405_right) con 4 slots por camara, 4 clases sobre 1024 bins, para el instante t+8; el experto de accion no ve esas cajas, pero si los recortes que se derivan de la consulta anterior.

El entrenamiento usa batch efectivo de 64 (32 por GPU en 2x B200 con DDP y acumulacion 1), AdamW con lr pico 2.5e-05, warmup de 1000 pasos y decaimiento coseno hasta 2.5e-06 en 30.000 pasos, precision bf16 con autocast y pesos maestros fp32, y gradient checkpointing. Los datos provienen de la tarea 2 (subtasques 2 y 3, con la subtarea 1 eliminada) e incluyen demostraciones y rondas DAgger 1-3, con etiquetas de subtarea derivadas de marcas de etapa y cajas rastreadas por camara solo dentro de las etapas que fovean esa camara. El muestreo SIRIUS usa proporcion 0.5 demo / 0.4 intervencion / 0.1 robot y descarta los 3 segundos previos a una toma de control. En total se usan 363 episodios y 961.551 frames aproximadamente entre los siete datasets.

La accion se define relativa al estado actual (`use_relative_actions=true`), salvo cuatro articulaciones que se mantienen absolutas: `right_index_joint2`, `right_index_joint3`, `left_index_joint2` y `left_index_joint3`. Las cajas se parametrizan como centro x, centro y y lado (`fovea_box_param=center_side`), y se decodifican como un cuadrado deslizado dentro del frame.

## Capacidades

- Prediccion de subtareas de alto nivel en texto (por ejemplo, "grasp the board with the right hand", "turn the head to the center", "insert the board into the control module") que condicionan al experto de accion.
- Generacion de acciones continuas de 18 dimensiones en chunks de 50 pasos, con 30 acciones efectivas por chunk.
- Foveacion selectiva: recortes RGB de 224x224 por camara en las subtareas que lo requieren (zed_mini para el paso de cable a mano izquierda o derecha; d405_left para insercion; d405_left y d405_right para insercion del otro extremo en subtask3).
- Prediccion de cajas por camara a t+8 con 4 clases sobre 1024 bins por slot.
- Procesamiento multimodal con 6 camaras (d405_left, d405_right, zed_mini, fovea_zed_mini, fovea_d405_left, fovea_d405_right) y estado de 18 dimensiones.
- Enmascaramiento de vistas sin ventana: un recorte sin caja se enmascara de la atencion como si fuera una camara ausente.
- No se documentan capacidades de tool calling, agentes multi-paso, vision general, audio ni razonamiento conversacional; el ambito es exclusivamente robotico.

## Casos de uso

- Insercion de cable GRC en entorno industrial: el modelo ejecuta la secuencia de subtareas 2 y 3 (entrega del cable a una mano, insercion en el puerto) con acciones relativas de 18-D, adecuado por su entrenamiento especifico sobre 363 episodios y rondas DAgger de esa tarea.
- Manipulacion bimanual con feedback visual de alta frecuencia: los chunks de 50 acciones con 30 pasos efectivos permiten control fluido a partir de 3 camaras completas y recortes foveados, lo que resulta util en tareas de precision donde el detalle local importa.
- Investigacion en foveacion para VLA: sirve como referencia reproducible para estudiar el efecto de recortes condicionados por cajas predichas frente a frames completos, dado que la model card detalla la logica de enmascaramiento y las etapas que fovean cada camara.
- Aprendizaje por imitacion con DAgger iterativo: el checkpoint documenta el uso de rondas DAgger 1-3 y el muestreo SIRIUS, por lo que es util como punto de partida para experimentos de correccion de politica en robot real.
- Prediccion de subtareas como modulo auxiliar: el VLM que escribe la subtarea puede evaluarse de forma aislada para medir la coherencia entre instruccion, estado visual y etapa de la tarea.
- Despliegue en simulacion o gemelo digital: al ser un checkpoint LeRobot con safetensors, puede cargarse en pipelines de evaluacion offline antes de transferir a robot fisico.
- Estudio de robustez ante vistas ausentes: el enmascaramiento de recortes sin ventana permite analizar el comportamiento del modelo cuando falta informacion visual local.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El unico dato de rendimiento es la perdida de entrenamiento en el paso 15.000: 0.197.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Con 4.145.521.424 parametros, en bf16/fp16 se requieren aproximadamente 8,3 GB solo para pesos, mas activaciones y buffers de las 6 camaras y el estado; en fp32 serian unos 16,6 GB.
- GPU recomendadas: el entrenamiento se realizo en 2x B200; para inferencia se recomienda al menos una GPU con 16-24 GB (A100, H100, L40S, RTX 4090) para bf16.
- Cabe en GPU consumer: previsiblemente si en RTX 4090 (24 GB) en bf16, y en GPUs de 16 GB con cuantizacion, aunque no hay datos oficiales de cuantizacion para este checkpoint.
- Opciones de despliegue: LeRobot 0.6.2 con la variante `pi05_foveavla_subtask` y `lerobot_sirius`; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI para este modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| task2_foveavla_stage_sqbox_rel_chunk50_jitter0.05_sirius_bs64_1127_15k | 4.145.521.424 | no disponible | VLA robotica con subtareas y foveacion | no disponible | Hugging Face (0 descargas) |
| lerobot/pi05_base | no disponible | no disponible | VLA base pi0.5 | no disponible | Hugging Face |
| Otros checkpoints derivados de pi05 en LeRobot | no disponible | no disponible | VLA robotica | no disponible | no disponible |

La comparacion cuantitativa con alternativas no esta disponible en la informacion proporcionada. El modelo base `lerobot/pi05_base` es el referente directo, pero no se detallan sus parametros ni su contexto en la documentacion consultada.

## Limitaciones y advertencias

- Checkpoint intermedio: solo 15.000 de 30.000 actualizaciones de optimizador; el autor lo etiqueta explicitamente como checkpoint parcial, por lo que el rendimiento final puede diferir.
- Especializacion estrecha: entrenado unicamente para la tarea 2 (subtasques 2 y 3) del entorno Hyundai Duet; no es un modelo generalista y no se espera transferencia directa a otras tareas o robots.
- Dependencia de la configuracion de escenario: en el robot hay que indicar `policy.config.fovea_scenario = "subtask2"` o `"subtask3"` antes de construir los procesadores; una configuracion incorrecta altera las vistas de entrada.
- Dependencia de la subtarea previa: los recortes que recibe una consulta dependen de la subtarea decodificada en la consulta anterior (o de la anotacion 1 segundo atras en entrenamiento), lo que introduce acoplamiento temporal y posible propagacion de errores.
- Riesgo de alucinacion en la subtarea textual: al ser un VLM que genera texto, puede emitir subtareas incoherentes con el estado visual; el experto de accion condiciona sobre esa salida.
- Licencia no disponible: no se puede confirmar el uso comercial; es necesario contactar con el autor antes de produccion.
- Idiomas no disponibles: los ejemplos de subtarea estan en ingles; no se documenta soporte multilingue.
- Sin benchmarks publicados: no hay evidencia cuantitativa de exito en tarea, por lo que la evaluacion en robot real es imprescindible.
- Cero descargas y cero likes en el momento de la consulta: ecosistema de validacion practicamente nulo.
- Requiere el stack especifico `lerobot_foveavla` (rama `stage-views`) y `lerobot_sirius`; no es un modelo plug-and-play en LeRobot estandar.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/chomeed/task2_foveavla_stage_sqbox_rel_chunk50_jitter0.05_sirius_bs64_1127_15k
- Modelo base: https://huggingface.co/lerobot/pi05_base
- Repositorio del framework: https://github.com/HDR-SRL/lerobot_foveavla/tree/stage-views
- Run de entrenamiento en W&B: https://wandb.ai/meeroro56/hyundai_duet/runs/fbj3mr5u
- Dataset principal: https://huggingface.co/datasets/HDR-AI-tmp/hyundai_duet_task2
- Dataset DAgger subtask2 r1: https://huggingface.co/datasets/HDR-AI-tmp/hyundai_duet_task2_subtask2_dagger_r1
- Dataset DAgger subtask2 r2: https://huggingface.co/datasets/HDR-AI-tmp/hyundai_duet_task2_subtask2_dagger_r2
- Dataset DAgger subtask2 r3: https://huggingface.co/datasets/HDR-AI-tmp/hyundai_duet_task2_subtask2_dagger_r3
- Dataset DAgger subtask3 r1: https://huggingface.co/datasets/HDR-AI-tmp/hyundai_duet_task2_subtask3_dagger_r1
- Dataset DAgger subtask3 r2: https://huggingface.co/datasets/HDR-AI-tmp/hyundai_duet_task2_subtask3_dagger_r2
- Dataset DAgger subtask3 r3: https://huggingface.co/datasets/HDR-AI-tmp/hyundai_duet_task2_subtask3_dagger_r3
