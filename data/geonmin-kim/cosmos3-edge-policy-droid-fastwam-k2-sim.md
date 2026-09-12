# geonmin-kim/Cosmos3-Edge-Policy-DROID-FastWAM-K2-sim

## Resumen

Cosmos3-Edge-Policy-DROID-FastWAM-K2-sim es un checkpoint intermedio de una politica vision-language-action (VLA) para manipulacion robotica, publicado por el usuario geonmin-kim. Se obtiene por warm start desde los pesos EMA del checkpoint `geonmin-kim/Cosmos3-Edge-Policy-DROID-FastWAM-K2` (step 12000) y continua el entrenamiento mezclando datos de simulacion de Franka Panda generados en IsaacSim con el corpus DROID. Corresponde al 100% de las 12.000 iteraciones de este run concreto, que se suman a las 12.000 del arm K=2.

El objetivo declarado del experimento es medir si la adaptacion de dominio a renderizado y robot de IsaacSim mueve la puntuacion en el benchmark RoboLab. El autor advierte explicitamente de que se trata de una instantanea de evaluacion y no de un artefacto final, y de que el pool de simulacion empleado (open-cabinet-left, open-cabinet-right, open-drawer) no solapa con las tareas de RoboLab (pick-and-place y stacking), por lo que el arm puede validar adaptacion de dominio pero no ensenar tareas nuevas.

El modelo hereda la formulacion two-pass de su predecesor: un pase de flow matching de vision y otro de flow matching de accion, con decodificacion leading-K en la que se conservan 2 frames latentes generados (K=2). La secuencia resultante es de 1.211 tokens, a 340 tokens por frame. No se publican el numero de parametros, la composicion exacta del dataset de preentrenamiento del modelo base ni resultados de benchmarks propios de este checkpoint.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLA (vision-language-action) derivada de nvidia/Cosmos3-Edge-Policy-DROID; two-pass flow matching (pass A vision FM, pass B action FM) con decodificacion leading-K (K=2) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no se describe una arquitectura MoE) |
| Longitud de contexto | 1.211 tokens de secuencia: frames de condicionamiento + 2 frames latentes generados previos, 340 tokens por frame |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible; las instrucciones se pasan formateadas como JSON (`--format-prompt-as-json True`) |
| Licencia | nvidia-open-model-license (etiquetada como `license: other` en HuggingFace) |
| Formato de pesos | safetensors (export desde pesos EMA, sin training state) |
| Tamano del repositorio | 28,0 GB |
| Pipeline declarado | robotics |
| Modelo base | nvidia/Cosmos3-Edge-Policy-DROID |
| Checkpoint de origen | geonmin-kim/Cosmos3-Edge-Policy-DROID-FastWAM-K2 (step 12000, pesos EMA) |
| Paso de entrenamiento | 12.000 iteraciones (acumulado 24.000 con el arm K=2) |
| Version de la model card | FastWAM-K2 + IsaacSim (v6) |

## Arquitectura y entrenamiento

La arquitectura es una politica VLA construida sobre nvidia/Cosmos3-Edge-Policy-DROID, un modelo de mundo/politica de la familia Cosmos de NVIDIA. El entrenamiento sigue un esquema two-pass: el pase A aplica flow matching sobre vision con `loss_scale=1` y el pase B aplica flow matching sobre accion con `action_loss_weight=10`. La decodificacion leading-K se configura con `two_pass_keep_generated_vision_frames=2`, de modo que la politica condiciona sobre los frames de observacion mas dos frames latentes generados previamente, lo que da una secuencia de 1.211 tokens a 340 tokens por frame. El warm start se realiza cargando los pesos EMA del checkpoint K=2 (`load_ema_to_reg`) y reiniciando el optimizador desde cero.

La mezcla de datos es 3:1 entre DROID y simulacion, repartida por rango con `RankPartitionedDataLoader` sobre 8 GPU: DROID ocupa los rangos 0-5 y simulacion los rangos 6-7 (el 25% de las muestras por lote). El pool DROID procede de `nvidia/Cosmos3-DROID` (exitos y fallos, con el filtro oficial `keep_ranges_1_0_1`; los fallos solo contribuyen al objetivo de video) y el pool de simulacion procede de `nvidia/PhysicalAI-Robotics-Manipulation-SingleArm`, subconjunto de acciones articulares de Franka Panda en IsaacSim, con 4.211 episodios y 300.665 frames convertidos al esquema DROID, solo exitos. El autor justifica la proporcion conservadora 3:1 porque el robot simulado se desplaza aproximadamente 6 veces mas por frame que la teleoperacion DROID (0,0386 frente a 0,0061 rad) y porque la articulacion `joint[4]` queda fuera del rango de normalizacion de DROID en el 14,8% de los frames. El conversor integra los deltas articulares de origen en valores objetivo absolutos.

La configuracion de optimizacion usa FusedAdamW con `lr=1e-5`, multiplicador 5x sobre los tres puentes de accion, scheduler LambdaLinear con warm-up de 1.000 pasos y ciclo de 12.000 (lr 1e-5 en el paso 1k, 8,36e-6 en 3k, 5,91e-6 en 6k, 3,45e-6 en 9k y 1e-6 en 12k). El lote efectivo es de 128 (FSDP shard 8 x 16 x grad_accum 1), frente a 64 del arm K=2, y el entrenamiento se ejecuto sobre 8 GPU B300. No se documentan en la informacion disponible mecanismos adicionales como decodificacion especulativa, atencion lineal ni tecnicas de RLHF o DPO.

## Capacidades

- Generacion de acciones de manipulacion robotica en forma de trayectorias articulares, condicionadas por observaciones visuales y un prompt de tarea.
- Razonamiento viso-espacial integrado: el modelo procesa frames de condicionamiento y genera frames latentes de vision antes de producir la accion (two-pass).
- Formulacion de politica VLA, no solo de modelo de mundo: produce directamente la accion del efector/articulaciones.
- Adaptacion a dominio de renderizado sintetico (IsaacSim) ademas del dominio de teleoperacion real (DROID), objeto explicito de este arm.
- Compatibilidad con el servidor `cosmos_framework.scripts.action_policy_server_robolab`, que expone la politica como servicio en un puerto.
- Formateo de prompt como JSON mediante el argumento `--format-prompt-as-json True`.
- Conservacion de frames de vision generados para el condicionamiento del pase de accion (`--keep-generated-vision-frames 2`).
- Capacidades multilingues: no disponible (no se documenta procesamiento de lenguaje natural multilingue).
- Tool calling / function calling: no disponible.
- Soporte de agentes multi-paso: no disponible.

## Casos de uso

- Investigacion en adaptacion de dominio sim-to-real: el checkpoint esta disenado para medir si mezclar datos de IsaacSim (renderizado y robot Franka) mejora la puntuacion de una politica entrenada sobre teleoperacion real en un benchmark distinto, RoboLab.
- Evaluacion comparativa de politicas VLA: sirve como punto intermedio en una secuencia de checkpoints (base, K=2, K=2 + sim) para aislar el efecto de cada cambio de datos y de configuracion de decodificacion.
- Despliegue en simulacion con IsaacSim: el modelo puede servirse mediante el servidor de RoboLab y ejecutarse contra tareas de manipulacion en simulador para recoger trayectorias y metricas de exito.
- Generacion de datos sinteticos de manipulacion: las trayectorias generadas pueden emplearse como rollouts de politica en simulador para analisis de cobertura de tareas (apertura de armarios y cajones).
- Estudio de mezclas de datos en entrenamiento robotico: la proporcion 3:1 DROID:sim, el reparto por rango y el tratamiento de fallos solo en el objetivo de video son decisiones reproducibles que pueden reutilizarse en experimentos propios.
- Referencia para investigacion en flow matching aplicado a accion: la separacion entre pase de vision y pase de accion con ponderaciones distintas (`loss_scale=1` y `action_loss_weight=10`) es un punto de partida para ablaciones.
- Validacion de pipelines de evaluacion estadistica: la model card recomienda muestreo adaptativo (`--num-episodes-adaptive 200 --ci-pp-width 0.14`) y advierte de que n=96 con ±9 pp es ruido, lo que es util como referencia metodologica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks propios de este checkpoint en la informacion disponible. El autor indica que el juicio debe hacerse sobre RoboLab con 12 tareas completas y que este arm todavia no tiene resultados publicados en la model card.

Los unicos datos numericos disponibles corresponden al checkpoint predecesor (arm K=2) y al baseline, no a este modelo:

| Modelo / configuracion | Benchmark | Resultado | Comparacion |
|---|---|---|---|
| Baseline (nvidia base) | RoboLab, 12 tareas | 36,5% | referencia |
| Cosmos3-Edge-Policy-DROID-FastWAM-K2 (12k) | RoboLab, 12 tareas | 34,4% [26,2, 42,6] | p=0,88 frente al baseline; sin diferencia significativa; ~2,4x mas rapido |
| Base full-WAM | RoboLab, tareas BlocksInBin, CondimentsInBin, SpoonInMug, Stack3RubiksCube, FruitsMoving | 0% en las 5 | 5 de 12 tareas sin exito en el modelo base |
| Cosmos3-Edge-Policy-DROID-FastWAM-K2-sim (este checkpoint) | RoboLab, 12 tareas | no disponible | evaluacion pendiente segun la model card |

Advertencias de evaluacion incluidas por el autor: no usar la curva de loss como criterio (el objetivo es de tipo matching y la curva es plana), el MAE en open-loop ha apuntado en direccion contraria en tres ocasiones dentro del proyecto, y el cribado de 2 tareas (RubiksCubesInBin y StackYellowOnRed) solo sirve para comprobar regresiones de la brecha de FastWAM, no para validar la hipotesis de adaptacion de dominio.

## Requisitos de hardware

- Entrenamiento documentado: 8 GPU B300 con FSDP shard 8, lote 16 por shard, grad_accum 1 (lote efectivo 128).
- VRAM para inferencia: no disponible en la informacion proporcionada. Como referencia derivada, el repositorio de pesos ocupa 28,0 GB, por lo que la carga del checkpoint requiere al menos ese orden de magnitud de memoria o de almacenamiento, sin que se confirme el numero de parametros ni el tipo de dato de exportacion.
- GPU recomendadas: no disponible. El unico hardware mencionado es B300 x8 para entrenamiento.
- Encaje en GPU de consumo: no disponible; no se puede confirmar con los datos publicados.
- Opciones de despliegue: servidor especifico del framework Cosmos, invocado como `python -m cosmos_framework.scripts.action_policy_server_robolab --checkpoint-path "$ckpt" --port 8000 --format-prompt-as-json True --no-guardrails --keep-generated-vision-frames 2`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, y por el tipo de modelo (politica de accion, no LLM de texto) no serian aplicables directamente.
- Latencia y throughput: el unico dato es que el arm K=2 es aproximadamente 2,4 veces mas rapido que el baseline en la evaluacion de RoboLab; no se publican valores absolutos de latencia ni de tokens por segundo para este checkpoint.

## Comparativa con modelos similares

Solo se dispone de datos de la propia familia. No se han proporcionado datos de alternativas externas comparables.

| Modelo | Parametros | Contexto / secuencia | RoboLab 12 tareas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| nvidia/Cosmos3-Edge-Policy-DROID (base) | no disponible | no disponible | 36,5% (baseline); 0% en 5 de 12 tareas | nvidia-open-model-license | publico en HuggingFace |
| geonmin-kim/Cosmos3-Edge-Policy-DROID-FastWAM-K2 | no disponible | 1.211 tokens, K=2 | 34,4% [26,2, 42,6], p=0,88 | nvidia-open-model-license | publico en HuggingFace |
| geonmin-kim/Cosmos3-Edge-Policy-DROID-FastWAM-K2-sim (este) | no disponible | 1.211 tokens, K=2 | no disponible | nvidia-open-model-license | publico en HuggingFace |
| Otras politicas VLA (OpenVLA, GR00T, etc.) | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Es un checkpoint intermedio de evaluacion, no un artefacto final: el propio autor lo califica como instantanea y no como resultado definitivo.
- El pool de simulacion usado (open-cabinet-left, open-cabinet-right, open-drawer) no solapa con las tareas de RoboLab, que son de pick-and-place y stacking; por tanto este arm puede validar adaptacion de dominio, pero no ensenar tareas nuevas ni desbloquear las 5 tareas que el modelo base resuelve al 0%.
- Distribucion de datos con salto de dominio: la simulacion tiene un desplazamiento por frame aproximadamente 6 veces mayor que DROID (0,0386 frente a 0,0061 rad) y `joint[4]` cae fuera del rango de normalizacion DROID en el 14,8% de los frames; el conversor integra deltas articulares en valores absolutos, lo que introduce aproximaciones.
- Solo se exportan pesos EMA y no hay training state, de modo que el checkpoint no es reanudable tal cual y no permite reproducir la trayectoria exacta de optimizacion.
- El objetivo de entrenamiento es de tipo matching: la curva de loss es plana y no sirve como criterio de calidad; el MAE en open-loop ha resultado enganoso en tres ocasiones dentro del proyecto.
- Ruido estadistico elevado en la evaluacion: con n=96, ±9 pp entra dentro del ruido; se recomienda muestreo adaptativo (`--num-episodes-adaptive 200 --ci-pp-width 0.14`).
- El servidor de referencia se lanza con `--no-guardrails`, lo que desactiva las barreras de seguridad del modelo; en un dominio robotico esto implica riesgo fisico si se despliega sin capas de proteccion externas.
- Licencia NVIDIA Open Model License (etiquetada como `license: other`): es necesario revisar los terminos para uso comercial, redistribucion y despliegue en produccion; no se detallan en la informacion disponible las restricciones concretas aplicables a este derivado.
- Sesgos conocidos: no disponible. No se documentan analisis de sesgo para este checkpoint.
- Riesgo de alucinacion: no disponible en el sentido de generacion de texto; al ser una politica de accion, el riesgo equivalente es la generacion de trayectorias no validas fisicamente, no cuantificado en la model card.
- Soporte de idiomas y capacidades multilingues: no disponible.
- Trazabilidad limitada: el repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin validacion independiente por parte de terceros.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/geonmin-kim/Cosmos3-Edge-Policy-DROID-FastWAM-K2-sim
- Modelo base: https://huggingface.co/nvidia/Cosmos3-Edge-Policy-DROID
- Checkpoint de origen (arm K=2): https://huggingface.co/geonmin-kim/Cosmos3-Edge-Policy-DROID-FastWAM-K2
- Dataset DROID usado en el entrenamiento: https://huggingface.co/nvidia/Cosmos3-DROID
- Dataset de simulacion usado: https://huggingface.co/nvidia/PhysicalAI-Robotics-Manipulation-SingleArm
- Licencia NVIDIA Open Model License: https://www.nvidia.com/en-us/agreements/enterprise-software/nvidia-open-model-license/
- Paper, blog, repositorio de codigo o demo adicionales: no disponible. La busqueda web realizada no devolvio resultados relevantes para este modelo (los resultados obtenidos correspondian a recetas de cocina y no guardan relacion con el modelo).
