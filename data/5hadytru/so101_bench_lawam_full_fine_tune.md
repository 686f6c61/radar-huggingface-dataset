# 5hadytru/so101_bench_LaWAM_full_fine_tune

## Resumen

5hadytru/so101_bench_LaWAM_full_fine_tune es un checkpoint de robotica publicado por 5hadytru (Truman Hickok) dentro del banco de pruebas SO-101 Bench. Se trata de un ajuste fino completo del modelo LaWAM (latent-action world-action model) que parte del checkpoint jialei02/lawam-pretrain-lerobot y sigue la implementacion para LeRobot del adaptador lerobot.policies.lawam. LaWAM combina un backbone de vision-lenguaje Qwen3-VL-2B que predice acciones latentes, un modelo de accion latente que aporta los objetivos latentes futuros y una cabeza de flow-matching que los traduce en acciones de robot.

El modelo cuenta con 2.555.179.360 parametros y se distribuye en formato safetensors, como una carpeta pretrained_model estandar de LeRobot, bajo licencia MIT. Resuelve la generacion de trayectorias de manipulacion para el brazo SO-101 a partir de instrucciones en lenguaje natural y observaciones visuales (camara cenital y camara de muneca), y resulta relevante porque forma parte de una comparativa abierta de modelos fundacionales de robot orientada a medir la brecha entre competencia semantica y geometrica.

El entrenamiento se realizo sobre el conjunto simulado de teleoperacion 5hadytru/so101_bench_sim (3.629 episodios, 1.996.120 fotogramas) durante 49.000 actualizaciones en 4x A100-80GB. El checkpoint publicado corresponde a la actualizacion 45000, seleccionada por obtener la mejor puntuacion de validacion (21/39, 53,8 %).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | World-action model latente (LaWAM): backbone Qwen3-VL-2B + modelo de accion latente + cabeza de flow-matching |
| Parametros totales | 2.555.179.360 (~2,55 mil millones) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo pesos en safetensors; sin variantes GGUF publicadas) |
| Idiomas soportados | no disponible (recibe instrucciones de tarea en lenguaje natural, pero no se especifican idiomas) |
| Licencia | MIT (backbone Qwen3-VL-2B-Instruct bajo Apache-2.0) |
| Formato de pesos | safetensors (carpeta pretrained_model de LeRobot) |

## Arquitectura y entrenamiento

LaWAM es un modelo de accion latente: el backbone Qwen3-VL-2B procesa las observaciones visuales y la instruccion de tarea y predice acciones latentes; un modelo de accion latente independiente genera los objetivos latentes futuros, y una cabeza de flow-matching convierte esas representaciones latentes en acciones de robot. El conjunto se ejecuta dentro del adaptador de LeRobot (lerobot.policies.lawam), con la version del adaptador fijada en el commit ca69a20. La entrada visual combina la camara cenital (observation.images.image, la camara principal y la que usa el modelo de accion latente) y la camara de muneca (observation.images.image2), ambas redimensionadas a 256x256. No se utiliza estado del robot como entrada.

Este checkpoint es un ajuste fino completo del preentrenamiento jialei02/lawam-pretrain-lerobot sobre el dataset simulado 5hadytru/so101_bench_sim (3.629 episodios, 1.996.120 fotogramas), que incluye camaras cenital y de muneca. El entrenamiento se ejecuto en 4x A100-80GB con lote global 256 (32 por GPU x 4 GPU x 2 de acumulacion), AdamW con tasa de aprendizaje 1e-4, 1.500 actualizaciones de warmup y decaimiento coseno hasta 5e-7, durante aproximadamente 6,3 epocas de un total de 49.000 actualizaciones. El checkpoint publicado es la actualizacion 45000. Se incluyen ficheros model.safetensors, config.json, train_config.json y los pre/post-procesadores del propio checkpoint (estadisticas de normalizacion).

## Capacidades

- Generacion de acciones de manipulacion robotica: emite chunks de 36 objetivos articulares absolutos (6-D, unidades de LeRobot) a 30 Hz, ejecutados en su totalidad antes de replanificar.
- Comprension de instrucciones de tarea en lenguaje natural a traves del backbone Qwen3-VL-2B.
- Percepcion visual multimodal con dos camaras simultaneas (cenital y de muneca), cada una resizada a 256x256.
- Operacion sin estado del robot: la politica no requiere realimentacion de las articulaciones como entrada.
- Ejecucion de tareas de manipulacion tabletop en simulacion: named-bin, four-object bin, next-to, between y move, con objetos vistos y no vistos.
- No dispone de tool calling ni function calling; no es un modelo de agente conversacional.
- No genera texto libre como salida operativa, pese a que su backbone sea un modelo de vision-lenguaje.

## Casos de uso

- Investigacion en modelos fundacionales de robot: uso del checkpoint como referencia LaWAM dentro de SO-101 Bench para comparar arquitecturas de VLA bajo un protocolo de evaluacion comun en Isaac Sim.
- Manipulacion tabletop simulada: ejecucion de tareas de colocacion en contenedores con nombre y de relacion espacial (next-to, between) sobre el brazo SO-101 en entornos simulados, con objetos vistos y no vistos.
- Ajuste fino para tareas nuevas: el checkpoint sirve como punto de partida (transfer learning) para reentrenar la politica sobre otros conjuntos de manipulacion con el mismo formato de observacion y accion de LeRobot.
- Desarrollo de pipelines de evaluacion cerrada: integracion en el bucle de evaluacion closed-loop (39 episodios de validacion sobre real_gr00t_val_v2) para medir tasas de exito por actualizacion y seleccionar checkpoints.
- Estudio de correspondencia sim-real: analisis de si una politica entrenada exclusivamente en simulacion (como este checkpoint) mantiene su comportamiento al trasladarse a hardware real, comparandola con otros modelos del mismo banco.
- Prototipado rapido de politicas de vision-lenguaje-accion: uso del servidor scripts/lawam_server.py del repositorio SO-101 Bench para servir el modelo y conectarlo a un entorno de simulacion sin necesidad de infraestructura propia personalizada.

## Benchmarks y rendimiento

Validacion en el conjunto SO-101 Bench (real_gr00t_val_v2): 39 episodios closed-loop en Isaac Sim sobre tareas named-bin, four-object bin, next-to, between y move, con objetos vistos y no vistos.

| Actualizacion | 5k | 10k | 15k | 20k | 25k | 30k | 35k | 40k | 45k | 49k |
|---|---|---|---|---|---|---|---|---|---|---|
| Exito /39 | 10 | 15 | 18 | 20 | 20 | 20 | 17 | 20 | 21 | 19 |

La actualizacion 45000 (el checkpoint publicado) obtiene la mejor puntuacion: 21/39 (53,8 %). No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K u otros) en la informacion disponible, ya que no son aplicables a un modelo de robotica.

## Requisitos de hardware

- Entrenamiento: el autor informa de 4x A100-80GB con lote global 256.
- VRAM estimada para inferencia segun el recuento de parametros (2,55 mil millones): aproximadamente 10,2 GB en fp32, 5,1 GB en fp16/bf16, 2,55 GB en int8 y 1,28 GB en int4, sin contar la cache de atencion ni la sobrecarga del codificador visual. Estos valores son calculos derivados del numero de parametros, no cifras publicadas por el autor.
- GPUs recomendadas: no disponible de forma explicita; por tamano, cabe en GPUs de consumo como RTX 3090, RTX 4090 o RTX 5090 en fp16/bf16 o en cuantizaciones inferiores.
- Despliegue: mediante la libreria LeRobot (lerobot.policies.lawam.modeling_lawam.LaWAMPolicy.from_pretrained) y el servidor scripts/lawam_server.py del repositorio SO-101 Bench. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles; la politica opera a una frecuencia de control de 30 Hz para los chunks de acciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Benchmark (SO-101 Bench val) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| so101_bench_LaWAM_full_fine_tune (este) | ~2,55 B | no disponible | 21/39 (53,8 %) | MIT | HuggingFace |
| so101_bench_G0.5_full_fine_tune (Galaxea G0.5) | no disponible | no disponible | no disponible | no disponible | HuggingFace |
| MolmoAct2 (Ai2) | ~5 B | no disponible | no disponible | no disponible | LeRobot / repositorio |

Los tres modelos pertenecen a la misma categoria (VLA para manipulacion SO-101) y participan en el banco SO-101 Bench, pero solo se dispone de la puntuacion de validacion de este checkpoint. Los valores del resto figuran como no disponibles en la informacion proporcionada.

## Limitaciones y advertencias

- El modelo solo ha sido validado en simulacion (Isaac Sim); no se documenta validacion en hardware real, por lo que su transferencia a un SO-101 fisico es incierta.
- La tasa de exito del checkpoint publicado es del 53,8 % (21/39), lo que implica un 46,2 % de episodios fallidos en el conjunto de validacion.
- La politica no utiliza estado del robot como entrada, lo que puede limitar la precision en tareas que requieran realimentacion de las articulaciones.
- Depende de una configuracion de camaras concreta (cenital como camara principal y de muneca), ambas a 256x256; cambios en la disposicion o el numero de camaras pueden degradar el rendimiento.
- No se especifican los idiomas soportados para las instrucciones de tarea.
- No se documenta longitud de contexto ni tipos de cuantizacion oficiales.
- Riesgo de alucinacion o de acciones fuera de distribucion ante objetos o escenas no vistas, dado el caracter de modelo fundacional entrenado sobre un unico conjunto simulado.
- Aunque la licencia es MIT y el backbone es Apache-2.0, conviene verificar las condiciones del preentrenamiento base (jialei02/lawam-pretrain-lerobot) y del dataset antes de un uso comercial.
- El modelo registra 0 descargas y 0 likes, por lo que carece de validacion independiente por parte de la comunidad en el momento de la consulta.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/5hadytru/so101_bench_LaWAM_full_fine_tune
- Modelo base (preentrenamiento): https://huggingface.co/jialei02/lawam-pretrain-lerobot
- Repositorio SO-101 Bench: https://github.com/5hadytru/so101_bench
- Perfil del autor: https://huggingface.co/5hadytru
- Dataset de entrenamiento simulado (referenciado): 5hadytru/so101_bench_sim
- Checkpoint comparable G0.5: https://huggingface.co/5hadytru/so101_bench_G0.5_full_fine_tune
- MolmoAct2 sobre SO-101 en simulacion: https://github.com/ataghof/molmoact2-so101-sim
- Dataset SO101 Bench Sim 4 (sim-real correspondence): https://claru.ai/datasets/5hadytru-so101-bench-sim-4
- Backbone Qwen3-VL-2B-Instruct: https://huggingface.co/Qwen/Qwen3-VL-2B-Instruct
