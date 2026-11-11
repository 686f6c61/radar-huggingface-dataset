# islee94/n16-franka-pnp-middle-cup-to-basket-dsu-30k-s42

## Resumen

`n16-franka-pnp-middle-cup-to-basket-dsu-30k-s42` es un checkpoint de ajuste fino del modelo fundacional de robotica GR00T N1.6, desarrollado por NVIDIA, subido por el usuario islee94 desde el clúster Raven (MPCDF). No se trata de un modelo de lenguaje: es una politica visomotora (vision-language-action, VLA) entrenada para una tarea de manipulacion robotica concreta sobre un brazo Franka: recoger un vaso situado en el centro y depositarlo en una cesta (`pnp_middle_cup_to_basket`). El checkpoint contiene unicamente los pesos de inferencia, sin estado del optimizador, con 3.286.608.832 parametros y un peso de repositorio de 6,6 GB en dos ficheros safetensors.

El entrenamiento parte del checkpoint base `gr00tn16 179b98b` y se ejecuto durante 30.000 actualizaciones con 4 GPU A100 (batch 4 x 16) y semilla 42. Los datos de demostracion son trayectorias reales de Franka retemporizadas mediante DemoSpeedup, usando la politica original de 30k como proxy de entropia (`pnpcup_dsu_l1_h2_proxy30k`). El autor indica explicitamente que la evaluacion en robot real esta pendiente, por lo que no hay evidencia publicada de exito en la tarea.

Su relevancia es acotada: sirve como artefacto reproducible de un pipeline de ajuste fino de GR00T N1.6 sobre datos reales y como punto de partida para quien quiera replicar o continuar el entrenamiento. No es un modelo de proposito general ni debe usarse fuera del entorno robotico para el que fue entrenado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GR00T N1.6 (vision-language-action, base NVIDIA); detalles internos no disponibles |
| Parametros totales | 3.286.608.832 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors sin cuantizar) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (2 shards) + config.json, processor_config.json, statistics.json |
| Tamano del repositorio | 6,6 GB |
| Checkpoint base | gr00tn16 179b98b |
| Tarea | Franka `pnp_middle_cup_to_basket` (pick-and-place) |
| Entrenamiento | 30.000 updates, 4 x A100, batch 4 x 16, seed 42 |

## Arquitectura y entrenamiento

El modelo es un ajuste fino de GR00T N1.6, la familia de modelos fundacionales de robotica de NVIDIA con arquitectura vision-language-action. La model card no detalla la composicion interna (backbone VLM, cabezal de accion, tokenizador de acciones), por lo que esa informacion no esta disponible en la documentacion proporcionada. El repositorio incluye `embodiment_id.json` y ficheros de configuracion del procesador (`processor_config.json`, `final_processor_config.json`, `statistics.json`, `dataset_statistics.json`) que codifican la normalizacion de observaciones y acciones especifica del embodiment Franka.

El entrenamiento se realizo sobre datos reales de Franka retemporizados con DemoSpeedup, una tecnica de aceleracion de demostraciones que altera la velocidad de las trayectorias manteniendo la coherencia de la politica. Como proxy de entropia se uso la politica original de 30k (`pnpcup_dsu_l1_h2_proxy30k`), y el manifiesto `pacedistill_manifest.json` sugiere un esquema de destilacion por ritmo o pacing. Se ejecutaron 30.000 actualizaciones con 4 A100 y batch efectivo de 64, con semilla 42. No se documentan tecnicas de RLHF/DPO, decodificacion especulativa ni atencion lineal; al ser un modelo de accion, esos conceptos no aplican directamente.

## Capacidades

- Generacion de acciones motrices para un brazo Franka en la tarea concreta de pick-and-place de un vaso central a una cesta.
- Procesamiento de observaciones visuales y de estado del robot segun el esquema de normalizacion incluido en `statistics.json` y `dataset_statistics.json`.
- Inferencia condicionada por instruccion o contexto de tarea, segun el formato esperado por GR00T N1.6 (no detallado en la model card).
- No se documenta soporte de tool calling, function calling, agentes multi-paso ni razonamiento simbolico.
- No se documenta capacidad multilingue ni modo de pensamiento (thinking mode).
- No se documentan capacidades de vision general, audio ni generacion de texto libre.

## Casos de uso

- Replicacion de experimentos de ajuste fino de GR00T N1.6: el checkpoint permite partir de un estado entrenado con 30k updates sobre Franka real para comparar hiperparametros, semillas o esquemas de retemporizacion de datos.
- Investigacion en retemporizacion de demostraciones (DemoSpeedup): util para estudiar como afecta el retiming de trayectorias reales al aprendizaje de politicas de manipulacion, usando este checkpoint como referencia entrenada.
- Estudio de destilacion por ritmo (paced distillation): el manifiesto `pacedistill_manifest.json` y el proxy de entropia permiten analizar la influencia del esquema de destilacion en el rendimiento final.
- Base para ajuste adicional en tareas de pick-and-place similares sobre Franka: al compartir embodiment, el checkpoint puede servir de inicializacion para tareas de trasvase de objetos con variaciones de posicion.
- Evaluacion comparativa de politicas VLA: util como uno de los brazos de comparacion frente a otras politicas entrenadas con los mismos datos pero distinto esquema de entrenamiento.
- Reproducibilidad de pipelines en clusters HPC: los hashes sha256 de los ficheros de contexto y manifiestos permiten verificar la integridad del experimento en replicas sobre Raven u otros clusters.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente "robot evaluation pending", por lo que no hay tasas de exito, metricas de error de posicion ni comparaciones cuantitativas con otras politicas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la model card. Como referencia orientativa, 3.286.608.832 parametros en fp32 ocupan aproximadamente 13,1 GB; en fp16/bf16, unos 6,6 GB; en int8, unos 3,3 GB. Estas cifras son calculos a partir del numero de parametros, no datos publicados por el autor.
- GPU recomendadas: el entrenamiento uso 4 x A100, lo que sugiere que la inferencia en precision completa requiere GPU de datacenter (A100, H100). No se documenta el requisito minimo.
- Compatibilidad con GPU de consumo: no confirmada. Si el modelo se puede ejecutar en bf16, cabria en GPUs con 8-16 GB de VRAM (RTX 4070 Ti, RTX 4080, RTX 4090), pero al ser un modelo VLA con posibles componentes de vision, el consumo real puede ser mayor y no esta verificado.
- Opciones de despliegue: no se documentan. Al ser un checkpoint GR00T N1.6, lo esperable es usar el stack de inferencia de NVIDIA Isaac GR00T, pero la model card no lo confirma.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| n16-franka-pnp-middle-cup-to-basket-dsu-30k-s42 (este) | 3.286.608.832 | no disponible | Franka pick-and-place | no disponible | publico en HF |
| GR00T N1.6 base (gr00tn16 179b98b) | no disponible | no disponible | robotica general | no disponible | referencia citada, no enlazada |
| Otras politicas VLA (p. ej. OpenVLA, pi0) | no disponible en esta busqueda | no disponible | robotica general | no disponible | no verificado |

No se dispone de datos suficientes en la informacion proporcionada para establecer una comparativa cuantitativa fiable con alternativas de la misma categoria. La comparacion con el checkpoint base es cualitativa: este modelo es un ajuste fino del base sobre una tarea concreta, sin metricas publicadas de mejora.

## Limitaciones y advertencias

- Evaluacion en robot real pendiente: no hay evidencia publicada de que la politica funcione en la tarea objetivo. No debe asumirse exito.
- Especificidad de tarea y embodiment: el checkpoint esta entrenado para Franka y para `pnp_middle_cup_to_basket`; su uso en otro robot, otra tarea u otra configuracion de camara probablemente fallara sin reentrenamiento.
- Licencia no disponible: no se puede confirmar si el uso comercial esta permitido. Al derivar de GR00T N1.6, la licencia del modelo base condiciona la del ajuste, pero no se detalla.
- Idiomas no disponibles: al ser un modelo de accion, la componente linguistica (si existe) no esta documentada.
- Riesgo de sobreajuste a la distribucion de demostraciones: con 30k updates sobre un unico conjunto de datos, la politica puede no generalizar a variaciones de posicion, iluminacion u objetos.
- Sin estado del optimizador: el checkpoint solo permite inferencia o reinicio de ajuste, no reanudar el entrenamiento exactamente donde se dejo.
- Sesgos: no documentados. En robotica, los sesgos suelen manifestarse como preferencias por posiciones o trayectorias presentes en las demostraciones.
- Alucinacion: el concepto no aplica de forma directa, pero la politica puede generar acciones fisicamente invalidas o inseguras; se recomienda validacion en simulacion y limites de seguridad en el robot.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/islee94/n16-franka-pnp-middle-cup-to-basket-dsu-30k-s42
- Repositorio GR00T de NVIDIA: no disponible en la informacion proporcionada
- Paper de GR00T N1: no disponible en la informacion proporcionada
- Documentacion de DemoSpeedup: no disponible en la informacion proporcionada
- Referencia interna del autor (`internal/docs/servers/raven.md`): no accesible publicamente
