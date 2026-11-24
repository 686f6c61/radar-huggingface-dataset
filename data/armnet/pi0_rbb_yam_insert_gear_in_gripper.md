# armnet/pi0_rbb_yam_insert_gear_in_gripper

## Resumen

`armnet/pi0_rbb_yam_insert_gear_in_gripper` es un checkpoint de politica robotica (vision-language-action, VLA) entrenado como baseline para la tarea de insercion de una pieza en una pinza dentro del banco de pruebas RoboBuilderBench. Lo desarrolla el usuario `armnet` y deriva de `pi0_base`, el modelo pi0 de Physical Intelligence, reentrenado con el framework JAX `openpi` sobre el conjunto de datos `fanqi-robo/insert_gear_in_gripper`. No es un modelo de lenguaje general, sino un modelo de control motor que mapea observaciones visuales y de estado del robot a acciones de articulaciones.

El modelo opera sobre una plataforma bimanual YAM de 14 grados de libertad, con observaciones a 20 Hz procedentes de tres camaras (vista superior, muneca izquierda y muneca derecha). El checkpoint incluido corresponde al paso 19.999 de un entrenamiento de 20.000 pasos, con una perdida de flow-matching que desciende de 0,5973 a 0,0218. El repositorio ocupa 12,0 GB e incluye unicamente los pesos en formato Orbax OCDBT, los assets de normalizacion y los metadatos del checkpoint; el estado del optimizador ha sido excluido.

Su relevancia es acotada: se trata de un artefacto de investigacion reproducible para comparar recetas de entrenamiento en manipulacion robotica bimanual, no de un modelo listo para produccion. La ausencia de model card extendida, licencia declarada y resultados de evaluacion publicos limita su uso fuera del contexto del benchmark.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language-action (VLA) derivada de `pi0_base` (flow matching, `pi05=False`); detalles internos no disponibles |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (horizonte de accion: `action_horizon=30`) |
| Tipos de cuantizacion | no disponible (pesos en Orbax OCDBT, sin variantes GGUF/INT8 publicadas) |
| Idiomas soportados | no disponible (modelo de control robotico, no conversacional) |
| Licencia | no disponible |
| Formato de pesos | Orbax OCDBT (`checkpoint-19999/params/`) |

## Arquitectura y entrenamiento

El checkpoint parte de `pi0_base`, la politica VLA de Physical Intelligence basada en flow matching, y se afina con el framework JAX `openpi` bajo la configuracion `pi0_rbb_insert_gear_in_gripper`. La salida es un vector de acciones con horizonte de 30 pasos, compuesto por articulaciones diferenciales (delta joints) y pinzas en valor absoluto, con normalizacion de acciones por paso temporal. La plataforma es una YAM bimanual de 14 dimensiones controlada a 20 Hz con tres flujos de camara (top, left_wrist, right_wrist).

El entrenamiento se ejecuto en 2x NVIDIA GH200 de 120 GB en paralelo de datos (`fsdp_devices=1`) durante 4 h 48 min 32 s, con 20.000 pasos, tamano de lote 32 y programacion coseno de tasa de aprendizaje de 2,5e-5 a 2,5e-6. La perdida de flow-matching baja de 0,5973 (paso 0) a 0,0218 (paso 19.900) y la norma del gradiente de 16,20 a 0,32, sin senales de divergencia. Los datos provienen del dataset `fanqi-robo/insert_gear_in_gripper` fijado al commit `acdc9ac8`. No se documenta el numero de episodios, la composicion del dataset ni si hubo etapas de RLHF o DPO (no aplicables en este dominio).

## Capacidades

- Control motor bimanual de 14 grados de libertad sobre la plataforma YAM, con salida de acciones delta de articulaciones y pinzas absolutas.
- Percepcion visual multi-camara a partir de tres flujos (top, left_wrist, right_wrist).
- Ejecucion de la tarea especifica de insercion de una pieza en la pinza (`insert_gear_in_gripper`) en el contexto de RoboBuilderBench.
- Prediccion de secuencias de accion con horizonte de 30 pasos temporales.
- No se documenta soporte de tool calling, function calling, razonamiento multi-paso simbolico, capacidades conversacionales ni multilingues.
- No se documenta modo de razonamiento explicito (thinking mode), audio ni vision de proposito general.

## Casos de uso

- Reproduccion de baselines en RoboBuilderBench: el checkpoint permite replicar la receta `pi0_rbb_insert_gear_in_gripper` y comparar variantes de hiperparametros sobre la misma tarea y dataset.
- Investigacion en manipulacion bimanual: sirve como punto de partida para estudiar el ajuste fino de `pi0_base` en plataformas YAM de 14 grados de libertad con observaciones a 20 Hz.
- Evaluacion de recetas de flow matching: la curva de perdida documentada (0,5973 a 0,0218) permite contrastar estrategias de normalizacion de acciones por paso temporal y horizontes de 30 pasos.
- Desarrollo de pipelines de verificacion de checkpoints: el manifiesto `CHECKPOINT_MANIFEST.json` y la herramienta `verify-checkpoint` facilitan integrar comprobaciones de integridad en flujos de CI para artefactos de aprendizaje automatico.
- Benchmarking de hardware: el registro de 2x GH200 120 GB con `fsdp_devices=1` y 4 h 48 min de entrenamiento sirve para dimensionar recursos en experimentos equivalentes.
- Docencia y divulgacion tecnica: como ejemplo reproducible de politica VLA aplicada a una tarea de insercion, util para ilustrar el ciclo datos-entrenamiento-despliegue en robotica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La unica metrica documentada es la progresion de la perdida de entrenamiento:

| Paso | Perdida | Norma del gradiente |
|---:|---:|---:|
| 0 | 0,5973 | 16,1974 |
| 500 | 0,1968 | 2,3570 |
| 1.000 | 0,1805 | 1,7733 |
| 2.000 | 0,1447 | 1,2958 |
| 5.000 | 0,0886 | 0,8550 |
| 10.000 | 0,0488 | 0,5656 |
| 15.000 | 0,0302 | 0,4184 |
| 19.900 | 0,0218 | 0,3208 |

No se proporcionan tasas de exito en simulacion o en robot real, ni comparaciones con otros checkpoints del mismo banco.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precision; el repositorio de pesos ocupa 12,0 GB, por lo que se requiere al menos ese orden de magnitud en memoria, mas el estado del runtime JAX y los buffers de inferencia.
- GPU de entrenamiento documentadas: 2x NVIDIA GH200 de 120 GB en paralelo de datos (`fsdp_devices=1`), 4 h 48 min 32 s para 20.000 pasos con lote 32.
- GPU recomendadas para inferencia: no disponibles; por tamano de pesos, se situa en el rango de GPU de datacenter (A100 80 GB, H100, GH200). No se confirma que quepa en GPU de consumo.
- Despliegue: el checkpoint esta en formato Orbax OCDBT y depende del stack JAX `openpi`; no se publican variantes para vLLM, llama.cpp, Ollama ni TGI (no aplicables a este tipo de politica).
- Latencia y throughput: no disponibles. La frecuencia de control de la plataforma es de 20 Hz, pero no se documenta si la inferencia cumple ese presupuesto en el hardware indicado.

## Comparativa con modelos similares

No se dispone de datos de rendimiento ni de especificaciones completas de alternativas en la informacion proporcionada. Comparativa cualitativa:

| Modelo | Base | Tarea | Contexto / horizonte | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `armnet/pi0_rbb_yam_insert_gear_in_gripper` | `pi0_base` (JAX `openpi`) | Insercion de pieza en pinza, YAM bimanual 14-D | `action_horizon=30` | no disponible | Hugging Face, 12,0 GB |
| `pi0_base` (Physical Intelligence) | Modelo original | Politica VLA generalista | no disponible en esta ficha | no disponible | Referenciado como base, sin datos verificados aqui |
| Otros baselines de RoboBuilderBench | no disponible | Tareas del banco | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Modelo de proposito especifico: solo se ha entrenado para `insert_gear_in_gripper` sobre la plataforma YAM bimanual de 14 grados de libertad; no generaliza a otras tareas, morfologias ni camaras sin reentrenamiento.
- Sin evaluacion publicada: no hay tasas de exito ni validacion en robot real, por lo que no puede recomendarse para produccion.
- Licencia no declarada: la ausencia de licencia explicita impide asumir permisos de uso comercial; debe consultarse al autor antes de cualquier despliegue.
- Sesgos y alucinacion: en el dominio robotico, el equivalente es la deriva de politica y la ejecucion de acciones fuera de distribucion cuando las observaciones se alejan de los datos de entrenamiento; no se documenta analisis de robustez.
- Dependencia del dataset fijado: los resultados estan ligados al commit `acdc9ac8` de `fanqi-robo/insert_gear_in_gripper`; cambios en los datos invalidan la reproducibilidad.
- Estado del optimizador excluido: el checkpoint no permite reanudar el entrenamiento tal cual, solo inferencia o ajuste fino desde los pesos.
- Integridad: debe ejecutarse `verify-checkpoint` contra `CHECKPOINT_MANIFEST.json` tras la descarga para descartar corrupcion de los pesos.
- Sin soporte documentado de cuantizacion ni de runtimes de inferencia estandar, lo que complica el despliegue fuera del stack JAX `openpi`.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/armnet/pi0_rbb_yam_insert_gear_in_gripper
- Ejecucion de W&B: https://wandb.ai/pravsels/rbb-pi0/runs/19i9n4st
- Dataset de entrenamiento: `fanqi-robo/insert_gear_in_gripper` (commit `acdc9ac82e45db2c421c242e41ef8ef0fe549b31`)
- Framework de entrenamiento: JAX `openpi` (config `pi0_rbb_insert_gear_in_gripper`)
- Modelo base: `pi0_base` de Physical Intelligence (sin enlace directo en la informacion disponible)
