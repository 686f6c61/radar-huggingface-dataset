# kiroaiseoul/pi0full_bs32_all11_14D_ft1101_s5k

## Resumen

pi0full_bs32_all11_14D_ft1101_s5k es un ajuste fino completo (full fine-tune) del modelo fundacional de robotica pi0, desarrollado por Physical Intelligence y distribuido a traves de la libreria LeRobot de Hugging Face. El autor del checkpoint es el usuario kiroaiseoul, que lo publica como paso intermedio (step 5000) de un entrenamiento de 10.000 pasos, partiendo de un checkpoint anterior (`pi0full_bs32_all11_14D_ft1030_s10k`). El modelo resuelve el problema de control visuomotor de proposito general: dado un conjunto de observaciones (imagenes de camaras y estado del robot) y una instruccion en lenguaje natural, predice acciones de bajo nivel para manipular objetos.

Con 3.501.372.176 parametros (~3,5 mil millones) y un repositorio de 7 GB en formato safetensors, se trata de un modelo de politica (policy) para robotica, no de un LLM de proposito general. Su relevancia actual radica en que demuestra el flujo de trabajo tipico de la robotica fundacional: partir de un modelo preentrenado multimodal, ajustarlo con datos propios de teleoperacion y publicar checkpoints intermedios para evaluar el efecto de la mezcla de datos y el numero de pasos.

La ficha se basa exclusivamente en la informacion disponible en Hugging Face; muchos datos tipicos (licencia, idiomas, benchmarks) no estan publicados por el autor y se indican como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | pi0 (vision-language-action, VLA); detalles internos no disponibles en la model card |
| Parametros totales | 3.501.372.176 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors, presumiblemente bf16) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (libreria lerobot) |

## Arquitectura y entrenamiento

El modelo es un ajuste fino completo de pi0, el modelo vision-language-action de Physical Intelligence, entrenado con la libreria LeRobot. La model card no detalla la arquitectura interna (atencion, capas, tokenizador de acciones), por lo que no se puede confirmar mas alla de su naturaleza VLA. El checkpoint parte de un estado previo (`pi0full_bs32_all11_14D_ft1030_s10k`, step 10000) mediante warm start y constituye el paso 5000 de una ejecucion de 10.000 pasos.

El entrenamiento usa el dataset `all11_new_recovery_mix_14D_1101`: 2.798 de 5.205 episodios seleccionados via `train_episodes.json`, con 1.054.149 frames en total. La mezcla incluye 16 episodios nuevos de recuperacion replicados x12 (204 a 220), episodios antiguos de recuperacion x3 (excluyendo los episodios 162 y 190), tareas `task07_open_refrigerator_new` y `task11_place_beaker_on_the_shelf_1028` x4, datos antiguos de la etapa 7 mantenidos a 1/3 (semilla 1029) y demos antiguas de las etapas 2 y 4 al 7,5 % de los frames de su etapa (semilla 1101). Las estadisticas de normalizacion son las de `all11_recovery_merged_14D_2094data`. Hiperparametros: batch 32, precision bf16, learning rate 2.5e-5, semilla 1000. El entrenamiento se ejecuto en el supercomputador KISTI Hangang (6.o, beta), job 1191043.

## Capacidades

- Control visuomotor de robot: genera acciones de 14 dimensiones (sufijo `14D`) a partir de observaciones visuales y estado del robot.
- Ejecucion de tareas de manipulacion descritas en lenguaje natural (apertura de nevera, colocacion de vasos en estanteria, tareas de recuperacion).
- Aprendizaje por imitacion a partir de datos de teleoperacion (episodios con frames y acciones).
- Capacidad de recuperacion ante fallos, gracias a la inclusion de episodios especificos de recovery en el dataset.
- Integracion con el ecosistema LeRobot para entrenamiento e inferencia.
- Soporte de tool calling, agentes multi-paso, vision general o audio: no disponible (no es un modelo de lenguaje general).
- Capacidades multilingues: no disponible.

## Casos de uso

- Manipulacion robotica en laboratorio: usar el checkpoint como politica para un brazo robot de 14 dimensiones en tareas de pick-and-place, aprovechando los 1.054.149 frames de entrenamiento para generalizar entre variaciones de objetos y posiciones.
- Tareas de apertura de puertas y neveras: el modelo incluye datos especificos de `task07_open_refrigerator_new`, por lo que es adecuado para experimentos de interaccion con articulaciones y pomos.
- Colocacion precisa de objetos en estanterias: los datos de `task11_place_beaker_on_the_shelf_1028` lo hacen util para tareas que requieren precision espacial y control fino.
- Recuperacion ante fallos en produccion: los episodios de recovery permiten evaluar la robustez del modelo cuando la politica inicial falla (objeto caido, agarre fallido) y debe reengancharse la tarea.
- Investigacion en robotica fundacional: sirve como punto de partida (warm start) para nuevos ajustes finos con datos propios, siguiendo el mismo pipeline de LeRobot y el esquema de mezcla de datos documentado.
- Evaluacion comparativa de checkpoints intermedios: al ser el paso 5000 de 10.000, permite estudiar la curva de aprendizaje frente al checkpoint base y al final, aislando el efecto de la mezcla `all11_new_recovery_mix_14D_1101`.
- Reproduccion de experimentos: el detalle de semillas, proporciones de datos y job de entrenamiento facilita replicar el entrenamiento en infraestructura HPC similar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 3,5 mil millones de parametros en bf16, los pesos ocupan aproximadamente 7 GB; se recomienda al menos 10-12 GB de VRAM para margen de activaciones y buffers de imagen.
- GPU recomendadas: A100 (40/80 GB) o H100 para entrenamiento y evaluacion a gran escala; RTX 4090 (24 GB) para inferencia y ajustes ligeros.
- Cabe en GPU de consumo: si, en RTX 3090/4090 (24 GB) y potencialmente en GPUs de 12-16 GB con cuantizacion, aunque el autor no publica pesos cuantizados.
- Opciones de despliegue: LeRobot (libreria nativa del modelo); no se documenta soporte de vLLM, llama.cpp, Ollama o TGI, que estan orientados a LLMs y no a politicas roboticas.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| pi0full_bs32_all11_14D_ft1101_s5k | 3,5 B | no disponible | no disponible | Hugging Face (kiroaiseoul) |
| pi0 (Physical Intelligence) | no disponible en esta ficha | no disponible | no disponible | no disponible en esta ficha |
| pi0full_bs32_all11_14D_ft1030_s10k (checkpoint padre) | no disponible | no disponible | no disponible | Hugging Face (kiroaiseoul) |

No se dispone de datos de rendimiento de los modelos comparables en la informacion proporcionada, por lo que la comparativa se limita a disponibilidad y linaje.

## Limitaciones y advertencias

- Modelo de robotica especializado: no es un LLM; no debe usarse para generacion de texto, codigo o conversacion.
- Licencia no especificada: la ausencia de licencia explicita impide confirmar el uso comercial; conviene contactar con el autor antes de cualquier despliegue productivo.
- Dataset y dominio acotados: entrenado sobre 2.798 episodios de un conjunto concreto de tareas domesticas y de laboratorio; la generalizacion fuera de esas tareas no esta garantizada.
- Checkpoint intermedio: es el paso 5000 de 10.000, por lo que puede estar por debajo del rendimiento del modelo final.
- Riesgo de sobreajuste a la mezcla de datos: las proporciones de replicacion (x12, x4, 1/3, 7,5 %) estan ajustadas manualmente y pueden introducir sesgos hacia ciertas tareas.
- Sin benchmarks publicados: no hay evidencia cuantitativa de exito en tareas que permita comparar con alternativas.
- Idiomas y sesgos: no documentados.
- Reproducibilidad dependiente de infraestructura: el entrenamiento se realizo en un supercomputador concreto (KISTI Hangang); replicarlo exactamente puede requerir recursos similares.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/kiroaiseoul/pi0full_bs32_all11_14D_ft1101_s5k
- Checkpoint padre: https://huggingface.co/kiroaiseoul/pi0full_bs32_all11_14D_ft1030_s10k
- Dataset de entrenamiento: https://huggingface.co/datasets/kiroaiseoul/all11_new_recovery_mix_14D_1101
- Libreria LeRobot: https://github.com/huggingface/lerobot
