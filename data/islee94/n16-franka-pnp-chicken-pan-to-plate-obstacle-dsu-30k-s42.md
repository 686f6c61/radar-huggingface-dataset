# islee94/n16-franka-pnp-chicken-pan-to-plate-obstacle-dsu-30k-s42

## Resumen

El modelo `n16-franka-pnp-chicken-pan-to-plate-obstacle-dsu-30k-s42` es un checkpoint de ajuste fino del modelo fundacional de robotica GR00T N1.6, desarrollado por NVIDIA, publicado por el usuario `islee94` en Hugging Face. No se trata de un modelo de lenguaje: es una politica visomotora (vision-language-action, VLA) entrenada para controlar un brazo robotico Franka en una tarea concreta de manipulacion, en este caso recoger una sarten con pollo y trasladarla a un plato esquivando un obstaculo.

El checkpoint se ha entrenado sobre datos reales de un robot Franka (retemporizados con DemoSpeedup) durante 30.000 actualizaciones en 4 GPU A100, con semilla 42, partiendo del checkpoint `gr00tn16 179b98b`. El autor indica explicitamente que la evaluacion en robot fisico esta pendiente, por lo que se trata de un artefacto de investigacion, no de un modelo validado en produccion.

Su relevancia es acotada: sirve como referencia reproducible de un ajuste fino de GR00T N1.6 para una tarea especifica de robotica, con los ficheros de inferencia unicamente (sin estado del optimizador). No hay model card descriptiva, ni licencia declarada, ni resultados de evaluacion publicados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GR00T N1.6 (modelo fundacional visomotora VLA de NVIDIA; detalles internos no disponibles en la informacion proporcionada) |
| Parametros totales | 3.286.608.832 (segun safetensors) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors de precision original; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible (modelo orientado a robotica, no a texto general) |
| Licencia | no disponible |
| Formato de pesos | safetensors (dos shards: `model-00001-of-00002.safetensors` y `model-00002-of-00002.safetensors`) |

## Arquitectura y entrenamiento

El modelo es un ajuste fino del checkpoint GR00T N1.6 (`gr00tn16 179b98b`), la version 1.6 del modelo fundacional de robotica de NVIDIA. La informacion proporcionada no detalla la arquitectura interna (composicion de encoders de vision, modulo de lenguaje y cabeza de acciones), por lo que no se puede confirmar si emplea un transformer estandar, un esquema dual-system o modulos de difusion para la generacion de acciones. El tag `Gr00tN1d6` y el identificador del checkpoint base confirman la familia, pero no los detalles tecnicos.

El entrenamiento se realizo sobre datos reales del robot Franka para la tarea `pnp_chicken_pan_to_plate_obstacle`, retemporizados con DemoSpeedup y usando la politica original de 30k como proxy de entropia (`chicken_dsu_l1_h2_proxy30k`). Se ejecutaron 30.000 actualizaciones en 4 GPU A100 con 4 x 16 (probablemente batch por GPU y acumulacion, aunque el autor no lo explicita), semilla 42, con un total de 32.104.885 pasos de ajuste ("FT 32104885"). El repositorio incluye ficheros de configuracion de experimento (`experiment_cfg/conf.yaml`, `config.yaml`, `dataset_statistics.json`, `final_model_config.json`, `final_processor_config.json`), estadisticas del dataset (`statistics.json`) y un manifiesto de destilacion (`raven/pacedistill_manifest.json`), lo que sugiere un pipeline de destilacion con control de ritmo (paced distillation) y una estrategia de seleccion de datos basada en entropia. No se documenta el numero de tokens, la composicion del dataset ni si hubo RLHF o DPO (no aplica en el sentido habitual de LLM).

## Capacidades

- Control visomotor de un brazo robotico Franka para la tarea especifica de recoger una sarten con pollo y depositarla en un plato esquivando un obstaculo.
- Procesamiento de observaciones visuales y estado del robot como entrada (propio de un modelo VLA), segun la configuracion incluida en `experiment_cfg/`.
- Generacion de acciones de control continuo para el efector final, condicionadas a la tarea y al entorno.
- Integracion con el ecosistema GR00T N1.6 de NVIDIA (procesadores, configuracion de embodiment via `embodiment_id.json`).
- No se documentan capacidades de generacion de texto, razonamiento simbolico, codigo, matematicas, tool calling, agentes multi-paso ni capacidades multilingues.

## Casos de uso

- Reproduccion de experimentos de robotica: sirve como checkpoint de referencia para replicar el ajuste fino de GR00T N1.6 sobre la tarea `pnp_chicken_pan_to_plate_obstacle` con los mismos hiperparametros (30k updates, seed 42, 4 x A100).
- Investigacion en destilacion de politicas: el manifiesto `pacedistill_manifest.json` y el proxy de entropia permiten estudiar estrategias de destilacion con control de ritmo en politicas VLA.
- Comparacion de estrategias de retemporizacion: al usar DemoSpeedup sobre datos reales, el checkpoint es util para evaluar el impacto de la retemporizacion en el rendimiento de la politica.
- Base para ajuste fino en tareas de manipulacion similares (pick-and-place con obstaculos) en robots Franka, reutilizando los ficheros de configuracion y estadisticas del dataset.
- Analisis de robustez ante obstaculos: la tarea incluye un obstaculo explicito, por lo que el checkpoint permite estudiar el comportamiento de la politica en escenarios con colision potencial.
- Docencia y formacion en robotica: como ejemplo completo de un pipeline de entrenamiento VLA (datos reales, retemporizacion, destilacion, checkpoint final) para cursos avanzados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explicitamente que la evaluacion en robot fisico esta pendiente ("robot evaluation pending").

## Requisitos de hardware

- VRAM estimada para inferencia: el repo pesa 6,6 GB y los pesos suman aproximadamente 6,57 GB en safetensors (4.991.091.456 + 1.582.283.096 bytes), lo que corresponde a unos 3.286 millones de parametros en precision de 16 bits. La inferencia en fp16 requiere del orden de 7-8 GB de VRAM, mas el coste de los encoders de vision y buffers de activaciones.
- GPU recomendadas: A100 o H100 para entrenamiento y evaluacion a gran escala (el autor uso 4 x A100 para el ajuste fino). Para inferencia, una RTX 4090 (24 GB) o RTX A6000 (48 GB) es suficiente en terminos de memoria.
- Cabe en GPU de consumo: si, en tarjetas con 12 GB o mas (RTX 3060 12 GB, RTX 4070, RTX 4080, RTX 4090), siempre que se disponga del resto del stack GR00T N1.6 y de los procesadores asociados.
- Opciones de despliegue: no se documentan en la informacion proporcionada. El ecosistema GR00T de NVIDIA suele desplegarse con sus propias herramientas (Isaac GR00T, TensorRT), pero no se confirma en este repo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| n16-franka-pnp-chicken-pan-to-plate-obstacle-dsu-30k-s42 | 3.286.608.832 | no disponible | Manipulacion Franka (sarten a plato con obstaculo) | no disponible | Publico en HF, 0 descargas |
| GR00T N1.6 (checkpoint base `179b98b`) | no disponible | no disponible | Modelo fundacional VLA general | no disponible | Referenciado por el autor; no se enlaza en la info |
| Otras politicas VLA de tamano similar (p. ej. OpenVLA, pi0) | no disponible en esta ficha | no disponible | Manipulacion robotica general | no disponible | No verificable con la informacion proporcionada |

La comparacion con alternativas concretas no es posible con los datos disponibles: no se documentan resultados de evaluacion ni caracteristicas tecnicas del checkpoint base que permitan un contraste riguroso.

## Limitaciones y advertencias

- Modelo de robotica, no de lenguaje: no debe evaluarse con benchmarks de texto (MMLU, HumanEval, GSM8K) ni usarse para tareas de NLP.
- Evaluacion en robot fisico pendiente: el autor lo declara explicitamente, por lo que no hay evidencia publicada de que la politica funcione correctamente en el mundo real.
- Tarea extremadamente especifica: entrenado unicamente para `pnp_chicken_pan_to_plate_obstacle` en un Franka; no generaliza a otras tareas ni a otros robots sin reentrenamiento.
- Licencia no declarada: no se especifican terminos de uso comercial, redistribucion ni atribucion. No debe asumirse uso comercial libre.
- Sin model card descriptiva: no hay informacion sobre sesgos, riesgos de alucinacion (en el sentido de acciones erroneas), limitaciones de contexto ni caveats de produccion.
- Cero descargas y cero likes en el momento de la consulta: sin validacion por parte de la comunidad.
- Solo ficheros de inferencia: no incluye estado del optimizador, por lo que no es directamente reanudable para continuar el entrenamiento.
- Repositorio de 6,6 GB con ficheros auxiliares de configuracion y estadisticas que pueden no ser necesarios para inferencia pero si para reproducir el pipeline.

## Enlaces

- Hugging Face: https://huggingface.co/islee94/n16-franka-pnp-chicken-pan-to-plate-obstacle-dsu-30k-s42
- No se han encontrado otros enlaces (paper, blog, repositorio o demo) en la informacion proporcionada.
