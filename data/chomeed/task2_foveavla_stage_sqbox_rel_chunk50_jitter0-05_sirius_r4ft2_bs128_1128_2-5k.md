# chomeed/task2_foveavla_stage_sqbox_rel_chunk50_jitter0.05_sirius_r4ft2_bs128_1128_2.5k

## Resumen

Este repositorio contiene un checkpoint intermedio (2.500 de 30.000 actualizaciones del optimizador) de un modelo de politica robotica denominado pi0.5 + FoveaVLA con prediccion de subtareas de alto nivel. Lo desarrolla el usuario chomeed y se construye mediante ajuste fino del modelo base lerobot/pi05_base, empleando el framework LeRobot 0.6.2 con la variante pi05_foveavla_subtask de la rama stage-views del repositorio HDR-SRL/lerobot_foveavla. El modelo esta orientado a control robotico de tipo vision-language-action (VLA) sobre el conjunto de datos hyundai_duet_task2.

La particularidad tecnica del modelo es su mecanismo de foveacion: el componente VLM predice primero la subtarea actual en texto y, a continuacion, cuatro slots de caja por camara (zed_mini, d405_left, d405_right) que estiman la region de interes en el instante t+8. El experto de acciones condiciona su salida a la subtarea predicha, pero no recibe directamente las cajas. El modelo consume seis camaras y un estado de 18 dimensiones, y produce acciones de 18 dimensiones en chunks de 50 pasos.

Con 4.145.521.424 parametros totales y un tamano de repositorio de 16,6 GB, se trata de un modelo de gran tamano para el ambito de robotica, pensado para ejecutarse en hardware de datacenter (el entrenamiento se realizo sobre 2 GPU B200). Su relevancia radica en la combinacion de prediccion de subtareas, atencion foveada y entrenamiento con datos de DAgger, una receta poco habitual en modelos VLA de codigo abierto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language-action (VLA) basada en pi0.5, con experto de acciones y modulo FoveaVLA de prediccion de subtareas y cajas |
| Parametros totales | 4.145.521.424 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors, probablemente bf16/fp32) |
| Idiomas soportados | no disponible (las subtareas se expresan en ingles en los ejemplos de la model card) |
| Licencia | no disponible |
| Formato de pesos | safetensors (libreria lerobot) |

## Arquitectura y entrenamiento

El modelo sigue la estela de pi0.5 (lerobot/pi05_base) y anade el modulo FoveaVLA. La entrada consta de seis camaras (d405_left, d405_right, zed_mini, fovea_zed_mini, fovea_d405_left, fovea_d405_right) y un vector de estado de 18 dimensiones. El VLM genera primero la subtarea en texto (por ejemplo, "grasp the board with the right hand"); despues, cuatro slots de caja por camara predicen la region de interes en t+8 mediante 4 clases sobre 1024 bins. El experto de acciones se condiciona a la subtarea pero no a las cajas. Las vistas de recorte se enmascaran de la atencion cuando no hay caja disponible, de forma analoga a una camara ausente.

El ajuste fino parte de chomeed/task2_foveavla_stage_sqbox_rel_chunk50_jitter0.05_sirius_r4ft_bs64_1128_20k (ronda 4 de DAgger a 20k actualizaciones) y recorre de nuevo los mismos datos: demostraciones de las subtareas 2 y 3 y rondas DAgger 1 a 4. Se emplea batch efectivo de 128 (64 por GPU en 2 B200, DDP), AdamW con lr pico 1e-5 y decaimiento coseno hasta 2,5e-6, warmup de 1000 pasos, precision bf16 con pesos maestros fp32 y gradient checkpointing. La perdida combina flow matching con 0,1 x entropia cruzada de subtarea y, en las subtareas de insercion, 0,1 x entropia cruzada de cajas. El muestreo de datos sigue ratios fijos por clase: 50 % demostraciones, 40 % intervenciones humanas, 10 % rollouts autonomos y 0 % para los 3 segundos previos a cada intervencion. La perdida de entrenamiento en este paso es 0,089.

## Capacidades

- Prediccion de subtareas de alto nivel en texto a partir de observaciones visuales y estado del robot.
- Generacion de acciones de control de 18 dimensiones en chunks de 50 pasos (30 pasos ejecutados), relativas al estado actual salvo cuatro articulaciones de los dedos indice que se mantienen absolutas.
- Foveacion selectiva: prediccion de cajas de region de interes por camara para guiar el recorte de las vistas.
- Procesamiento multimodal con seis camaras simultaneas y estado proprioceptivo de 18 dimensiones.
- Aprendizaje por imitacion combinado con DAgger (rondas 1 a 4) para corregir la distribucion de estados.
- No se documentan capacidades de tool calling, agentes multi-paso, vision general, audio ni modo thinking.

## Casos de uso

- Manipulacion robotica de doble brazo en tareas de ensamblaje: el modelo predice la subtarea ("insert the board into the control module") y genera las acciones de 18 dimensiones para ejecutarla, aprovechando los chunks de 50 pasos para reducir la frecuencia de inferencia.
- Control con multiples camaras y foveacion: en entornos con camaras de muñeca y camaras externas, el modulo FoveaVLA selecciona la region relevante de cada vista, lo que permite mantener precision en objetos pequeños sin procesar fotogramas completos de alta resolucion.
- Recuperacion tras intervenciones humanas: los ratios de muestreo (40 % de frames de intervencion) hacen al modelo adecuado para escenarios donde un operador corrige al robot y se desea que la politica aprenda de esas correcciones.
- Investigacion en aprendizaje por imitacion con DAgger: sirve como checkpoint de referencia para estudiar el efecto de las rondas de DAgger y del muestreo por clase en el rendimiento final.
- Prototipado de pipelines VLA en LeRobot: al estar integrado en la libreria lerobot y en el fork lerobot_foveavla, se puede cargar con make_pre_post_processors y PI05FoveaVLASubtaskPolicy para experimentar con la prediccion de subtareas.
- Evaluacion de foveacion en robotica: el modelo permite comparar el rendimiento con y sin vistas de recorte, ya que las vistas sin caja se enmascaran de la atencion de forma explicita.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El unico dato de rendimiento es la perdida de entrenamiento en el paso 2.500, que asciende a 0,089.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 4.145 millones de parametros, en bf16 los pesos ocupan aproximadamente 8,3 GB, a los que hay que sumar activaciones y buffers de las seis camaras.
- GPU recomendadas: el entrenamiento se realizo en 2 GPU NVIDIA B200; para inferencia se recomienda como minimo una GPU de datacenter (A100 80 GB, H100) si se procesan todas las camaras a resolucion completa.
- Cabe en GPU de consumo: probablemente en RTX 4090 (24 GB) o RTX 3090 (24 GB) con precision bf16, aunque no hay datos oficiales que lo confirmen.
- Opciones de despliegue: LeRobot 0.6.2 con el fork lerobot_foveavla (rama stage-views) y el paquete lerobot_sirius; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| chomeed/task2_foveavla_stage_sqbox_rel_chunk50_jitter0.05_sirius_r4ft2_bs128_1128_2.5k | 4.145 M | no disponible | no disponible | Hugging Face |
| lerobot/pi05_base | no disponible | no disponible | no disponible | Hugging Face |
| chomeed/task2_foveavla_stage_sqbox_rel_chunk50_jitter0.05_sirius_r4ft_bs64_1128_20k | no disponible | no disponible | no disponible | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- Es un checkpoint intermedio (2.500 de 30.000 actualizaciones), por lo que no representa el modelo final y su rendimiento puede ser inferior al de la ejecucion completa.
- La licencia no esta disponible, lo que impide confirmar si se permite el uso comercial.
- El modelo esta especializado en una tarea concreta (hyundai_duet_task2) y un conjunto de camaras y estado especificos; no es un modelo de proposito general.
- No se documentan sesgos conocidos, pero al entrenarse con demostraciones humanas y datos de un unico entorno robotico, puede heredar sesgos de los operadores y del montaje.
- Riesgo de alucinacion en la prediccion de subtareas: el VLM puede generar una subtarea incorrecta que condicione erroneamente al experto de acciones.
- La foveacion depende de cajas predichas; si la caja es erronea, el recorte puede ocultar informacion relevante.
- Requiere el fork lerobot_foveavla y lerobot_sirius, lo que anade dependencias no triviales para produccion.
- Los ratios de muestreo y la normalizacion estan fijados al init; cambiar los datos de inferencia sin respetar los procesadores guardados puede degradar el rendimiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/chomeed/task2_foveavla_stage_sqbox_rel_chunk50_jitter0.05_sirius_r4ft2_bs128_1128_2.5k
- Modelo base: https://huggingface.co/lerobot/pi05_base
- Checkpoint de partida: https://huggingface.co/chomeed/task2_foveavla_stage_sqbox_rel_chunk50_jitter0.05_sirius_r4ft_bs64_1128_20k
- Repositorio del fork: https://github.com/HDR-SRL/lerobot_foveavla/tree/stage-views
- Ejecucion de entrenamiento en W&B: https://wandb.ai/meeroro56/hyundai_duet/runs/4hiwlr93
- Dataset principal: https://huggingface.co/datasets/HDR-AI-tmp/hyundai_duet_task2
- Dataset DAgger subtarea 2 ronda 1: https://huggingface.co/datasets/HDR-AI-tmp/hyundai_duet_task2_subtask2_dagger_r1
- Dataset DAgger subtarea 2 ronda 2: https://huggingface.co/datasets/HDR-AI-tmp/hyundai_duet_task2_subtask2_dagger_r2
- Dataset DAgger subtarea 2 ronda 3: https://huggingface.co/datasets/HDR-AI-tmp/hyundai_duet_task2_subtask2_dagger_r3
- Dataset DAgger subtarea 2 ronda 4: https://huggingface.co/datasets/HDR-AI-tmp/hyundai_duet_task2_subtask2_dagger_r4
- Dataset DAgger subtarea 3 ronda 1: https://huggingface.co/datasets/HDR-AI-tmp/hyundai_duet_task2_subtask3_dagger_r1
- Dataset DAgger subtarea 3 ronda 2: https://huggingface.co/datasets/HDR-AI-tmp/hyundai_duet_task2_subtask3_dagger_r2
- Dataset DAgger subtarea 3 ronda 3: https://huggingface.co/datasets/HDR-AI-tmp/hyundai_duet_task2_subtask3_dagger_r3
- Dataset DAgger subtarea 3 ronda 4: https://huggingface.co/datasets/HDR-AI-tmp/hyundai_duet_task2_subtask3_dagger_r4
