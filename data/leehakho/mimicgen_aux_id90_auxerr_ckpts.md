# LeeHakHo/mimicgen_aux_id90_auxerr_ckpts

## Resumen

Este repositorio no contiene un modelo de lenguaje, sino un conjunto de 36 checkpoints de aprendizaje por imitacion para control robotico, publicados por el usuario LeeHakHo bajo licencia MIT. Se trata de los pesos exactos empleados para generar el conjunto de datos `LeeHakHo/mimicgen_aux_id90_auxerr`, es decir, un checkpoint por cada combinacion de tarea y "brazo" de pose (frame), correspondiente a la epoca seleccionada por el criterio ID con la que se puntuo cada volcado de errores auxiliares.

El material se enmarca en el ecosistema MimicGen y robomimic: 12 tareas de manipulacion (entre ellas `coffee_d2`, `hammer_cleanup_d1`, `threading_d0`, `square_d2` o `three_piece_assembly_d0`) y tres variantes de marco de representacion para la cabeza auxiliar (`aux_world_frame`, `aux_eef_frame`, `aux_obj_eef_frame`). Los ficheros se nombran `<tarea>/<brazo>/model_epoch_<N>.pth` y se cargan con `robomimic` mediante `FileUtils.policy_from_checkpoint`.

Su relevancia es de tipo metodologico: permite reproducir exactamente los resultados de un estudio sobre tareas auxiliares de estimacion de error. El autor advierte explicitamente de que esto es una "rebanada" (slice) y no un archivo de entrenamiento completo; la rejilla completa de 10 epocas por brazo vive en otro repositorio, y las variantes de pose entrenadas con ACES (`norot` y `nomachine`) solo estan disponibles aqui.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (politicas de aprendizaje por imitacion de robomimic con cabeza auxiliar; la model card no especifica el backbone concreto) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no se describe una arquitectura MoE) |
| Longitud de contexto | no aplica (politica de control robotico basada en observaciones, no un modelo de lenguaje) |
| Tipos de cuantizacion | no disponible (solo se publican pesos PyTorch completos; no hay versiones cuantizadas) |
| Idiomas soportados | no aplica / no disponible |
| Licencia | MIT |
| Formato de pesos | PyTorch `.pth` (36 ficheros con patron `model_epoch_<N>.pth`) |
| Dominio | manipulacion robotica (robosuite / MimicGen) |
| Numero de checkpoints | 36 (12 tareas x 3 brazos de pose) |
| Tareas cubiertas | coffee_d2, coffee_preparation_d1, hammer_cleanup_d1, kitchen_d1, mug_cleanup_d1, nut_assembly_d0, pick_place_d0, square_d2, stack_d1, stack_three_d1, threading_d0, three_piece_assembly_d0 |
| Brazos de pose | aux_world_frame, aux_eef_frame, aux_obj_eef_frame (mas variantes de destino por tarea) |
| Carga | `robomimic` FileUtils.policy_from_checkpoint |
| Pesos evaluados | EMA (`policy.policy.ema.averaged_model`) |
| Tamano del repositorio | 59,2 GB |
| Descargas / likes | 0 / 0 |
| Fecha de creacion | 2026-09-15 |

## Arquitectura y entrenamiento

La model card no describe la arquitectura interna de las politicas. Por el contexto (etiquetas `robomimic`, `mimicgen`, `imitation-learning`, `auxiliary-task`) se trata de politicas de aprendizaje por imitacion entrenadas sobre demostraciones de MimicGen, con una cabeza auxiliar cuya prediccion de error es el objeto del estudio. El unico detalle arquitectonico confirmado es la existencia de esa cabeza auxiliar: los brazos de nube de puntos y las lineas base quedan fuera del repositorio precisamente porque "una linea base no tiene cabeza auxiliar". No se especifican en la informacion disponible el numero de parametros, el tipo de red (por ejemplo, MLP, RNN o difusion), el volumen de demostraciones ni si hubo etapas de ajuste con RLHF o DPO (categorias, por otra parte, propias de modelos de lenguaje y no de este dominio).

Un aspecto relevante para la reproducibilidad es que las predicciones del conjunto de datos asociado se leyeron de los pesos EMA (`policy.policy.ema.averaged_model`), que es la fuente de todas las cifras de exito publicadas para estas ejecuciones. Cualquier reutilizacion que pretenda replicar esos numeros debe cargar y evaluar los pesos EMA y no los pesos "en crudo" del optimizador. Los checkpoints incluidos corresponden a la epoca concreta con la que se puntuo cada volcado, no necesariamente a la mejor epoca de cada ejecucion.

Checkpoints incluidos:

| Tarea | Brazo (arm) | Epoca |
|---|---|---|
| coffee_d2 | aux_world_frame_podholder_norot | 900 |
| coffee_d2 | aux_eef_frame_podholder_norot | 800 |
| coffee_d2 | aux_obj_eef_frame_podholder_norot | 1000 |
| coffee_preparation_d1 | aux_world_frame_nomachine | 1000 |
| coffee_preparation_d1 | aux_eef_frame_nomachine | 800 |
| coffee_preparation_d1 | aux_obj_eef_frame_nomachine | 1000 |
| hammer_cleanup_d1 | aux_world_frame | 800 |
| hammer_cleanup_d1 | aux_eef_frame | 1000 |
| hammer_cleanup_d1 | aux_obj_eef_frame | 1000 |
| kitchen_d1 | aux_world_frame_allobj | 1000 |
| kitchen_d1 | aux_eef_frame_allobj | 800 |
| kitchen_d1 | aux_obj_eef_frame_allobj | 900 |
| mug_cleanup_d1 | aux_world_frame_allobj | 900 |
| mug_cleanup_d1 | aux_eef_frame_allobj | 900 |
| mug_cleanup_d1 | aux_obj_eef_frame_allobj | 1000 |
| nut_assembly_d0 | aux_world_frame | 1000 |
| nut_assembly_d0 | aux_eef_frame | 900 |
| nut_assembly_d0 | aux_obj_eef_frame | 1000 |
| pick_place_d0 | aux_world_frame | 1000 |
| pick_place_d0 | aux_eef_frame | 700 |
| pick_place_d0 | aux_obj_eef_frame | 600 |
| square_d2 | aux_world_frame | 1000 |
| square_d2 | aux_eef_frame | 1000 |
| square_d2 | aux_obj_eef_frame | 700 |
| stack_d1 | aux_world_frame_allobj_norot | 900 |
| stack_d1 | aux_eef_frame_allobj_norot | 800 |
| stack_d1 | aux_obj_eef_frame_allobj_norot | 1000 |
| stack_three_d1 | aux_world_frame_allobj_norot | 800 |
| stack_three_d1 | aux_eef_frame_allobj_norot | 700 |
| stack_three_d1 | aux_obj_eef_frame_allobj_norot | 900 |
| threading_d0 | aux_world_frame | 1000 |
| threading_d0 | aux_eef_frame | 1000 |
| threading_d0 | aux_obj_eef_frame | 1000 |
| three_piece_assembly_d0 | aux_world_frame_allobj | 900 |
| three_piece_assembly_d0 | aux_eef_frame_allobj | 700 |
| three_piece_assembly_d0 | aux_obj_eef_frame_allobj | 900 |

## Capacidades

- Ejecucion de politicas de manipulacion robotica en simulacion para 12 tareas de robosuite/MimicGen: apilado (`stack_d1`, `stack_three_d1`), ensamblaje (`nut_assembly_d0`, `three_piece_assembly_d0`), enhebrado (`threading_d0`), limpieza (`hammer_cleanup_d1`, `mug_cleanup_d1`), preparacion de cafe (`coffee_d2`, `coffee_preparation_d1`), `kitchen_d1`, `pick_place_d0` y `square_d2`.
- Prediccion auxiliar de error: cada brazo incluye una cabeza auxiliar entrenada para estimar error, en tres marcos de referencia distintos (mundo, efector final, objeto-efector final).
- Comparacion controlada de marcos de representacion: la estructura del repositorio permite contrastar `aux_world_frame`, `aux_eef_frame` y `aux_obj_eef_frame` sobre la misma tarea y el mismo protocolo.
- Carga directa mediante `robomimic` (`FileUtils.policy_from_checkpoint`) con acceso a los pesos EMA.
- No hay soporte de tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingues: el artefacto no es un modelo de lenguaje.
- No se documentan capacidades de vision mas alla de lo implicito en el pipeline de MimicGen; los brazos de nube de puntos no estan incluidos en este repositorio.

## Casos de uso

- Reproduccion de resultados de investigacion: cargar el checkpoint exacto de cada par (tarea, brazo) permite regenerar las cifras de exito publicadas para el estudio de error auxiliar, siempre que se evalue sobre los pesos EMA.
- Diagnostico de errores auxiliares: entrenadores e investigadores pueden inspeccionar la cabeza auxiliar de cada brazo para analizar como varia la estimacion de error segun el marco de referencia (mundo frente a efector final frente a objeto-efector).
- Ablacion de marcos de representacion: al existir los tres brazos para cada tarea, se puede medir de forma aislada el efecto del sistema de coordenadas en el rendimiento de la tarea, sin reentrenar.
- Punto de partida para ajuste fino: los checkpoints en la epoca 600-1000 son candidatos razonables para continuar el entrenamiento con nuevas demostraciones o con una distribucion de tareas distinta.
- Docencia en aprendizaje por imitacion: sirve como material practico para un curso o taller sobre robomimic y MimicGen, ya que ilustra el ciclo completo de entrenamiento, volcado de errores y evaluacion.
- Construccion de lineas base internas: un equipo que desarrolle su propia cabeza auxiliar puede comparar contra estos pesos usando el mismo protocolo de evaluacion y las mismas tareas.
- Estudio de casos con restricciones especificas: las variantes `norot` y `nomachine` (entrenadas con ACES) cubren escenarios sin rotacion o sin componente de maquina, utiles para analizar degradacion cuando se eliminan grados de libertad concretos.
- Integracion en pipelines de evaluacion automatizada: los checkpoints pueden orquestarse desde un script de robomimic para lanzar barridos de evaluacion por tarea y epoca en un cluster.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona que existen "cifras de exito publicadas" para estas ejecuciones (obtenidas de los pesos EMA), pero no incluye sus valores, y la busqueda web realizada no devolvio ningun resultado relevante sobre este repositorio (los unicos resultados obtenidos fueron paginas de soporte de Steam, sin relacion con el modelo).

## Requisitos de hardware

- VRAM para inferencia: no disponible. El repositorio ocupa 59,2 GB para 36 ficheros, lo que arroja una media de aproximadamente 1,6 GB por checkpoint; sin embargo, un fichero `.pth` puede incluir estado del optimizador, por lo que ese tamano no permite derivar de forma fiable el numero de parametros ni la VRAM necesaria.
- GPU recomendadas: no disponibles en la informacion proporcionada.
- Viabilidad en GPU de consumo: no confirmada. Las politicas de robomimic suelen ser lo bastante pequenas para ejecutarse en una unica GPU, pero no hay datos en la informacion disponible que permitan afirmarlo para este caso concreto.
- Opciones de despliegue: la unica via documentada es `robomimic` con `FileUtils.policy_from_checkpoint`. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no son aplicables a este tipo de artefacto.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No hay datos de rendimiento en la informacion disponible para construir una comparativa cuantitativa. Como alternativas de la misma categoria (politicas de aprendizaje por imitacion sobre MimicGen/robomimic) podrian considerarse las lineas base de robomimic y de MimicGen (por ejemplo, variantes de BC y de Diffusion Policy), pero no se dispone de sus parametros, contexto ni resultados en la informacion proporcionada, y ademas el propio autor indica que las lineas base no forman parte de este repositorio porque carecen de cabeza auxiliar.

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| mimicgen_aux_id90_auxerr_ckpts | no disponible | no aplica | no disponible | MIT | HuggingFace (36 checkpoints, 59,2 GB) |
| Lineas base de robomimic | no disponible | no aplica | no disponible | no disponible | no disponible en este repositorio |
| Variantes de nube de puntos del mismo estudio | no disponible | no aplica | no disponible | no disponible | excluidas de este repositorio |

## Limitaciones y advertencias

- No es un modelo de proposito general: no genera texto, no razona y no procesa lenguaje. Cualquier uso fuera del control robotico en el entorno previsto carece de sentido.
- Cobertura parcial: el repositorio es una seleccion, no un archivo de entrenamiento. Solo incluye la epoca ID de cada ejecucion, no la rejilla completa de 10 epocas, y deja fuera los brazos de nube de puntos y las lineas base.
- Dependencia del EMA: los resultados publicados se obtuvieron con `policy.policy.ema.averaged_model`. Evaluar los pesos sin promediar puede producir cifras distintas y no comparables.
- Acoplamiento al entorno: las politicas estan entrenadas para tareas y entornos concretos de robosuite/MimicGen, con las variantes `norot`, `nomachine` y `allobj` asociadas a configuraciones especificas. No hay evidencia de transferencia a otros entornos ni a un robot real.
- Sesgos y alucinacion: no aplica en el sentido habitual de los modelos generativos, pero si existe el riesgo propio del aprendizaje por imitacion de sobreajustar la politica a la distribucion de demostraciones y de degradarse ante cambios en las condiciones iniciales.
- Idiomas: no aplica.
- Licencia: MIT, permisiva y compatible con uso comercial, aunque el autor no ofrece garantias sobre el estado de los checkpoints ni sobre su idoneidad para produccion.
- Metadatos pobres: sin pipeline declarado, sin idiomas, 0 descargas y 0 likes, lo que dificulta validar el estado del artefacto por medios externos. El intervalo entre creacion y ultima actualizacion es de 18 minutos, coherente con una subida mecanica de ficheros.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/LeeHakHo/mimicgen_aux_id90_auxerr_ckpts
- Conjunto de datos de errores auxiliares ID90: https://huggingface.co/datasets/LeeHakHo/mimicgen_aux_id90_auxerr
- Checkpoints completos de la rejilla de 10 epocas: https://huggingface.co/LeeHakHo/mimicgen_aux_id90_checkpoints
- Referencias mencionadas en la model card: `robomimic` (carga de politicas mediante `FileUtils.policy_from_checkpoint`) y `MimicGen` (generacion de demostraciones y tareas). La busqueda web realizada no devolvio ningun enlace relevante adicional sobre este modelo.
