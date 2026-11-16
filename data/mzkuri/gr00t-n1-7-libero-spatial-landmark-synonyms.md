# mzkuri/gr00t-n1.7-libero-spatial-landmark-synonyms

## Resumen

El repositorio `mzkuri/gr00t-n1.7-libero-spatial-landmark-synonyms` es una coleccion de checkpoints de vision-lenguaje-accion (VLA) para robotica, obtenidos por fine-tuning del checkpoint `libero_spatial` de NVIDIA GR00T N1.7. El autor del fine-tuning es el usuario de Hugging Face `mzkuri`, mientras que el modelo base y el modelo de vision-lenguaje subyacente son de NVIDIA. No es un modelo nuevo, sino un conjunto de experimentos controlados sobre el modelo base para estudiar como afecta el fraseo de las instrucciones (sustantivo de referencia, verbo o destino) al comportamiento del modelo en tareas de manipulacion.

El objetivo del repositorio es de investigacion: replicar y variar instrucciones en los datos de demostracion de los benchmarks LIBERO-Spatial y LIBERO-Goal, y comparar runs con distintos subconjuntos de tensores entrenados. El componente de vision-lenguaje es `nvidia/Cosmos-Reason2-2B`, que se mantiene congelado en todos los runs; solo se entrena el cabezal de accion y, en algunos experimentos, el conector entre ambos (66 tensores denominado "neck").

La relevancia es acotada: no es un modelo listo para produccion ni para robots fisicos, sino material reproducible para estudiar sensibilidad al lenguaje en politicas VLA. El repo ocupa 289,6 GB e incluye 31 checkpoints finales de 9,5 GB cada uno (dos shards de safetensors), ademas de registros de ejecucion. No tiene descargas ni likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-lenguaje-accion (VLA): modelo de vision-lenguaje Cosmos-Reason2-2B congelado + cabezal de accion con atencion (action head, 471 tensores) + conector "neck" de 66 tensores |
| Parametros totales | no disponible (el repo contiene multiples checkpoints; cada uno ocupa ~9,5 GB en safetensors) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo se publican pesos en safetensors sin cuantizar) |
| Idiomas soportados | no disponible |
| Licencia | NVIDIA Open Model License para pesos y resto del modelo; CC BY 4.0 para los registros de ejecucion (configuraciones, logs, JSON, CSV) |
| Formato de pesos | safetensors (dos shards por checkpoint) |

## Arquitectura y entrenamiento

La arquitectura es la de GR00T N1.7: un modelo de vision-lenguaje `nvidia/Cosmos-Reason2-2B` (revision `9ce19a19`) que permanece congelado, conectado mediante un conector de 66 tensores (`action_head.vlln` y `action_head.vl_self_attention`) a un cabezal de accion de 471 tensores. Todos los runs parten del checkpoint `nvidia/GR00T-N1.7-LIBERO`, carpeta `libero_spatial`, revision `2ea293aa20ba7cf5bbf3ba17a5fbcb1a01cbfe21`, incluso los que se ajustan con datos de LIBERO-Goal.

Los datos de fine-tuning son `IPEC-COMMUNITY/libero_spatial_no_noops_1.0.0_lerobot` y `IPEC-COMMUNITY/libero_goal_no_noops_1.0.0_lerobot`, en formato LeRobot. El codigo empleado es `NVIDIA/Isaac-GR00T` en el commit `9c7e746b2cd37a810070a98ef41d290a07e806c2`, con modificaciones locales que no se incluyen en el repo. Cada run se entrena con una sola semilla (101, 202 o 303) y conserva solo el checkpoint final `checkpoint-1500/`, sin estado de optimizador ni de scheduler.

El diseno experimental varia el fraseo de las instrucciones en las demostraciones: sustantivo de referencia ("var"), verbo ("verb"), destino con distintos porcentajes de coincidencia accion-destino (P = 0, 25, 50, 100) y un shuffle emparejado en frecuencia, ademas de runs que entrenan solo los 66 tensores del conector ("neck") o subconjuntos de los 471 tensores del cabezal. Tambien hay runs hibridos que combinan tensores de `ctrl` y `var` sin entrenamiento adicional, y sondas de solo forward. No se documenta RLHF, DPO ni numero total de tokens de entrenamiento.

## Capacidades

- Generacion de acciones robotica a partir de instrucciones en lenguaje natural e imagenes, en el entorno de simulacion LIBERO.
- Manipulacion de objetos en tareas de LIBERO-Spatial y LIBERO-Goal (por ejemplo, tareas de tres cuencos con frases de destino).
- Sensibilidad controlada al fraseo: los checkpoints permiten comparar el efecto del sustantivo de referencia, el verbo y la frase de destino en las instrucciones.
- Entrenamiento selectivo de subconjuntos de tensores: runs con solo el conector "neck" (66 tensores) o con subconjuntos de 471 tensores del cabezal de accion.
- Vision-lenguaje congelado: el modelo Cosmos-Reason2-2B no se modifica, por lo que las capacidades de percepcion y comprension del lenguaje son las del modelo base.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponibles.
- Capacidades especiales: no disponibles mas alla del pipeline de robotica VLA.

## Casos de uso

- Estudio de robustez al lenguaje en politicas VLA: comparar los checkpoints `ctrl`, `var` y `verb` para medir cuanto cambia la tasa de exito cuando se varia el sustantivo de referencia o el verbo en las instrucciones de las demostraciones.
- Analisis de atribucion de tensores: usar los runs `wl_neck` y `wl_dit` (solo registros, sin pesos) junto con los checkpoints `neck_ctrl` y `neck_var` para aislar el papel del conector de 66 tensores frente al resto del cabezal de accion.
- Replicacion de experimentos de fraseo de destino: los 15 checkpoints de `e3_seed_*` permiten estudiar el efecto de que la frase de destino coincida con la accion en el 0, 25, 50 o 100 % de las demostraciones en LIBERO-Goal.
- Investigacion de sinonimia en instrucciones: el run `gx11_dstvar` cicla el sustantivo de destino entre el original y tres sinonimos, util para medir sensibilidad lexica del modelo.
- Docencia y formacion en robotica con IA: los registros de ejecucion (`resolved_config.yaml`, `experiment_cfg/`, `trainer_state.json`, `run.log`) sirven como material de referencia para reproducir pipelines de fine-tuning de GR00T N1.7.
- Validacion de infraestructura de entrenamiento: el run `setup/smoke_train` y las sondas de solo forward de `probe_ab` permiten comprobar la configuracion del entorno antes de lanzar entrenamientos completos.
- Benchmarking en simulacion: usar los checkpoints finales para evaluar politicas en LIBERO sin necesidad de reentrenar desde el modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card describe los runs y sus datos, pero no incluye tasas de exito ni metricas de evaluacion en LIBERO.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la informacion proporcionada. Cada checkpoint ocupa aproximadamente 9,5 GB en safetensors, lo que da una referencia del orden de magnitud de los pesos, pero no se especifica el consumo en inferencia.
- GPU recomendadas: no disponible.
- Cabeza en GPU de consumo: no disponible.
- Opciones de despliegue: el flujo documentado usa `hf download` para obtener los checkpoints y el codigo `NVIDIA/Isaac-GR00T` para ejecutarlos. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| mzkuri/gr00t-n1.7-libero-spatial-landmark-synonyms | no disponible | no disponible | sin benchmarks publicados | NVIDIA Open Model License (pesos), CC BY 4.0 (registros) | Hugging Face |
| nvidia/GR00T-N1.7-LIBERO | no disponible | no disponible | no disponible en la informacion | NVIDIA Open Model License | Hugging Face, modelo base del anterior |
| nvidia/Cosmos-Reason2-2B | 2B (modelo de vision-lenguaje) | no disponible | no disponible en la informacion | no disponible en la informacion | Hugging Face, componente congelado del anterior |

## Limitaciones y advertencias

- Entrenado y evaluado exclusivamente en simulacion LIBERO; el autor indica explicitamente que no debe usarse en robots fisicos.
- No es un modelo generalista: es una coleccion de checkpoints experimentales de fine-tuning, no un modelo unico listo para produccion.
- El repo ocupa 289,6 GB, lo que exige planificacion de almacenamiento y descargas selectivas mediante `--include` o `--exclude`.
- Cada run conserva solo el checkpoint final `checkpoint-1500/`, sin estado de optimizador ni scheduler, por lo que no se puede reanudar el entrenamiento desde el repo.
- Las carpetas marcadas como "records only" (`wl_neck`, `wl_dit`, `gx15_hybrids`) no contienen pesos, solo `swapped_keys.json` con las claves movidas y el sha256 de los shards.
- Las rutas absolutas de los registros se han sustituido por `/path/to/vla_study` y el nombre de host por `host`; `training_args.bin` se reguardo con la misma sustitucion.
- El codigo de entrenamiento tiene modificaciones locales que no se incluyen, lo que limita la reproducibilidad exacta.
- Riesgo de alucinacion y sesgos conocidos: no documentados en la informacion disponible.
- Restricciones de licencia: los pesos estan sujetos a la NVIDIA Open Model License, que conviene revisar antes de cualquier uso comercial; los registros de ejecucion son CC BY 4.0.
- Todos los runs parten del checkpoint LIBERO-Spatial, incluidos los ajustados con LIBERO-Goal, lo que puede introducir un sesgo de dominio en los resultados de Goal.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/mzkuri/gr00t-n1.7-libero-spatial-landmark-synonyms
- Modelo base: https://huggingface.co/nvidia/GR00T-N1.7-LIBERO
- Modelo de vision-lenguaje congelado: https://huggingface.co/nvidia/Cosmos-Reason2-2B
- Codigo: https://github.com/NVIDIA/Isaac-GR00T (commit `9c7e746b2cd37a810070a98ef41d290a07e806c2`)
- Dataset LIBERO-Spatial: https://huggingface.co/datasets/IPEC-COMMUNITY/libero_spatial_no_noops_1.0.0_lerobot
- Dataset LIBERO-Goal: https://huggingface.co/datasets/IPEC-COMMUNITY/libero_goal_no_noops_1.0.0_lerobot
- Licencia NVIDIA Open Model License: https://www.nvidia.com/en-us/agreements/enterprise-software/nvidia-open-model-license/
