# sam-guided-vlas/train_1_2_pile_random_pose__mask__overlay_a75__sim__all_cameras__live__pi05__seed_0__steps_1k

## Resumen

Este repositorio contiene un ajuste fino (fine-tune) de `pi05`, la implementacion en LeRobot del modelo π₀.₅ de Physical Intelligence, una politica Vision-Language-Action (VLA) orientada a generalizacion en entornos abiertos. El modelo ha sido entrenado por el usuario `sam-guided-vlas` partiendo del checkpoint base `lerobot/pi05_base` y esta publicado con licencia Apache-2.0 dentro del ecosistema LeRobot de Hugging Face.

El fine-tune esta especializado en una tarea concreta de manipulacion robotica: apilar y reorganizar objetos (los 20 objetos del dataset incluyen "soap dispenser", "jam", "jar", "cereal", "knife block", "kettle", "pear", "potato" y otros similares) con un robot Panda equipado con tres camaras (`agentview`, `robot0_eye_in_hand`, `robot0_eye_in_hand_2`). El modelo consume estado proprioceptivo de 9 dimensiones y tres imagenes RGB de 224x224, y produce un vector de accion continuo de 7 dimensiones.

Se trata de un experimento de entrenamiento corto (1000 pasos, batch 16, semilla 0) sobre 198 episodios y 35 267 fotogramas a 20 FPS. Su relevancia es principalmente como artefacto de investigacion reproducible dentro de LeRobot: no incluye resultados de evaluacion ni datos de rendimiento, y no se ha publicado informacion adicional sobre su arquitectura interna mas alla de lo que indica la model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA) pi05; implementacion LeRobot adaptada del repositorio OpenPI de Physical Intelligence. Detalle interno (encoder visual, backbone, cabeza de accion) no disponible |
| Parametros totales | 4 143 404 816 (~4,14 mil millones, segun safetensors) |
| Parametros activos | No aplica (no hay indicios de arquitectura MoE) |
| Longitud de contexto | No disponible (no se documenta ventana de contexto textual; opera sobre observaciones de imagen y estado) |
| Tipos de cuantizacion | No disponible (solo se publican pesos en safetensors; no se documentan GGUF, AWQ, GPTQ ni int8) |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors (libreria LeRobot) |
| Tipo de modelo / pipeline | Robotics (politica de imitacion) |
| Modelo base | `lerobot/pi05_base` |
| Robot objetivo | Panda |
| Entradas | `observation.state` (9,); `observation.images.agentview` (3, 224, 224); `observation.images.robot0_eye_in_hand` (3, 224, 224); `observation.images.robot0_eye_in_hand_2` (3, 224, 224) |
| Salidas | `action` (7,) |
| Tamano del repositorio | 9,4 GB |
| Version de LeRobot | 0.6.0 |
| Dataset de entrenamiento | `sam-guided-vlas/train_1_2_pile_random_pose__mask__overlay_a75__sim__all_cameras__live` (198 episodios, 35 267 fotogramas, 20 FPS) |
| Descargas / likes | 0 / 0 |
| Fecha de creacion (metadatos del Hub) | 2026-09-11 |

## Arquitectura y entrenamiento

La model card describe el modelo como π₀.₅ (Pi05), un modelo Vision-Language-Action de Physical Intelligence disenado para generalizacion en entornos abiertos: evoluciona π₀ para transferir a entornos y situaciones no vistos durante el entrenamiento. La implementacion incluida en este repositorio procede de LeRobot y es una adaptacion del repositorio open source OpenPI. Sin embargo, la informacion proporcionada no detalla la composicion interna (tipo de encoder visual, backbone de lenguaje, mecanismo de generacion de acciones, objetivo de entrenamiento) ni si se emplearon etapas de RLHF, DPO u otros ajustes por preferencias. Todo ello queda como "no disponible".

El entrenamiento de este checkpoint concreto es un ajuste fino de imitacion supervisada sobre `lerobot/pi05_base` con 1000 pasos, batch de 16, optimizador AdamW, tasa de aprendizaje 5e-05 y semilla 0. El dataset contiene 198 episodios y 35 267 fotogramas a 20 FPS, con 20 categorias de objeto etiquetadas como tareas. El nombre del repositorio y del dataset sugieren variaciones de pose aleatoria, uso de mascaras y superposiciones (overlay), captura con todas las camaras y una combinacion de datos de simulacion y reales ("sim" y "live"), si bien esta interpretacion procede unicamente de la nomenclatura y no esta confirmada en la documentacion.

No se documenta ninguna innovacion tecnica adicional (decodificacion especulativa, atencion lineal, destilacion, etc.) ni el numero total de tokens o la composicion del dataset mas alla de lo indicado.

## Capacidades

- Generacion de acciones motoras continuas de 7 grados de libertad para un robot Panda a partir de observaciones visuales y de estado.
- Manipulacion visual guiada por lenguaje: la politica acepta un campo `task` (por ejemplo, "soap dispenser") que condiciona el comportamiento.
- Percepcion multi-camara: procesa simultaneamente una vista externa (`agentview`) y dos vistas de muneca (`robot0_eye_in_hand`, `robot0_eye_in_hand_2`).
- Ejecucion de tareas de apilado y reorganizacion de objetos sobre las 20 categorias presentes en el dataset de entrenamiento.
- Control en bucle cerrado a 20 FPS, segun la frecuencia de captura del dataset de entrenamiento.
- Capacidad declarada de generalizacion a entornos nuevos heredada de la arquitectura π₀.₅ base, aunque no se aportan evidencias experimentales en este repositorio.
- Soporte de tool calling / function calling: no disponible (no es una capacidad documentada para este tipo de politica).
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible.
- Modo de razonamiento explicito (thinking mode), vision-lenguaje generativa, audio u otras capacidades especiales: no disponibles.

## Casos de uso

- Recogida y apilado de objetos en almacen: el modelo ejecuta la tarea "pile" sobre 20 categorias de objetos domesticos y de supermercado (botes, frutas, cajas, utensilios), con control a 20 FPS y tres camaras, lo que lo hace util como punto de partida para prototipos de picking no estructurado.
- Investigacion en imitacion robotica: sirve como referencia reproducible de un fine-tune de π₀.₅ sobre un dataset pequeno (198 episodios), util para estudiar el efecto del numero de pasos de entrenamiento y de la semilla en el comportamiento final.
- Reproduccion de experimentos con LeRobot: al estar publicado con la libreria `lerobot` y la version 0.6.0, permite replicar el pipeline completo de entrenamiento y despliegue con los comandos `lerobot-train` y `lerobot-rollout`.
- Base para ajuste fino adicional: al derivar de `lerobot/pi05_base` con licencia Apache-2.0, puede reentrenarse con nuevos datasets propios para tareas de manipulacion distintas, partiendo de pesos ya adaptados a control de un Panda.
- Evaluacion de tecnicas de aumento de datos: la nomenclatura del dataset (mascaras, overlay, poses aleatorias) sugiere que el repositorio puede emplearse para comparar estrategias de aumento sobre el mismo backbone y tarea.
- Banco de pruebas de simulacion a real: el dataset combina terminos "sim" y "live", por lo que el checkpoint es candidato para medir transferencia entre dominio simulado y real en un robot de laboratorio.
- Demostraciones y docencia: por su tamano (4,14 mil millones de parametros), puede ejecutarse en una unica GPU de gama alta para demostraciones de politicas VLA en ferias, aulas o laboratorios.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La propia model card incluye la seccion de evaluacion con la advertencia explicita "_No evaluation results have been provided for this policy yet_", por lo que no existe tabla de tareas, ensayos y tasas de exito. Tampoco se aportan metricas de MMLU, HumanEval, GSM8K ni equivalentes, que por otra parte no aplican a una politica de control motor.

La busqueda web realizada no devolvio informacion tecnica relevante: los resultados obtenidos corresponden a una serie de television francesa, al portal de contratacion SAM.gov, a un fabricante de utillaje y a un master universitario, ninguno relacionado con este modelo.

## Requisitos de hardware

- VRAM estimada para inferencia segun cuantizacion (calculo sobre 4 143 404 816 parametros, sin contar activaciones ni cache): ~16,6 GB en fp32; ~8,3 GB en bf16/fp16; ~4,1 GB en int8; ~2,1 GB en int4.
- El tamano del repositorio (9,4 GB) es compatible con pesos guardados en bf16/fp16 (~8,3 GB) mas ficheros auxiliares, aunque este extremo no se confirma en la informacion disponible.
- GPUs recomendadas: cualquier GPU con al menos 12-16 GB de VRAM para inferencia en precision reducida (RTX 4080, RTX 4090, A100 40 GB, H100). Para entrenamiento con batch 16 conviene disponer de 24 GB o mas, o recurrir a acumulacion de gradientes.
- Cabe en GPU de consumo: si, previsiblemente en RTX 3090, RTX 4080, RTX 4090 y modelos con 16 GB o mas, siempre que se use bf16/fp16. En tarjetas de 8-12 GB seria necesario cuantizar, opcion que no esta documentada en el repositorio.
- Opciones de despliegue: el flujo documentado es `lerobot-rollout` con el backend PyTorch/CUDA sobre un robot Panda. No se documenta soporte para vLLM, llama.cpp, Ollama, TGI ni otros servidores de inferencia de lenguaje, ni existen pesos GGUF publicados.
- Latencia y throughput: no disponibles. Como referencia de contexto, el dataset fue capturado a 20 FPS (50 ms por fotograma), pero no se publican mediciones de latencia de inferencia reales.

## Comparativa con modelos similares

| Modelo | Parametros | Tipo | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Este modelo (fine-tune) | 4,14 B | VLA pi05, ajuste de 1000 pasos | Apache-2.0 | Hugging Face, 0 descargas, 0 likes | Especializado en apilado de 20 objetos con robot Panda |
| `lerobot/pi05_base` | No disponible en la informacion proporcionada | VLA pi05 base | No disponible en la informacion proporcionada | Hugging Face (modelo base referenciado) | Modelo de partida del ajuste fino |
| Otras alternativas VLA (OpenVLA, GR00T N1, RDT-1B, etc.) | No disponible | No disponible | No disponible | No disponible | Sin datos en la informacion proporcionada; la busqueda web no aporto resultados relevantes |

No es posible establecer una comparacion cuantitativa con alternativas de la misma categoria, ya que no se han proporcionado especificaciones ni resultados de benchmarks de otros modelos.

## Limitaciones y advertencias

- Ausencia total de evaluacion: no se ha publicado ningun resultado de exito en robot real o simulado, por lo que no hay evidencia de que la politica funcione de forma fiable.
- Entrenamiento muy corto: 1000 pasos con batch 16 y semilla 0 sobre 198 episodios. Es un regimen de ajuste muy limitado, propenso a sobreajuste a las condiciones del dataset y a baja robustez ante variaciones de iluminacion, posicion o distractores.
- Dominio restringido: las tareas se limitan a las 20 categorias de objeto listadas y al robot Panda con la configuracion exacta de tres camaras (`agentview`, `robot0_eye_in_hand`, `robot0_eye_in_hand_2`) y estado de 9 dimensiones. Cambiar la morfologia, el numero de camaras o el orden de las claves de observacion invalida el uso previsto.
- Sesgos conocidos: no disponibles. No se documenta analisis de sesgos, y en el caso de una politica de manipulacion los sesgos relevantes serian de dominio (tipos de objeto, texturas, condiciones de iluminacion y disposicion espacial presentes en el dataset).
- Riesgo de alucinacion: no aplica en el sentido generativo textual, pero si existe riesgo de acciones fisicamente invalidas o inseguras en bucle abierto; se recomienda supervision humana y limites de par/fuerza en el robot.
- Limitaciones de contexto e idioma: no se documenta ventana de contexto ni cobertura linguistica; las unicas etiquetas de tarea conocidas estan en ingles y limitadas a 20 cadenas concretas.
- Restricciones de licencia: Apache-2.0 permite uso comercial, modificacion y redistribucion con atribucion y conservacion del aviso de licencia. No obstante, el modelo base `lerobot/pi05_base` y el modelo original π₀.₅ de Physical Intelligence pueden tener condiciones propias que conviene verificar antes de un uso comercial.
- Caveat de produccion: no existen pesos cuantizados publicados, ni soporte documentado para servidores de inferencia estandar, ni garantias de latencia. Cualquier despliegue industrial requeriria validacion propia, medicion de latencia y una fase de evaluacion en el robot objetivo.
- Metadatos a verificar: la fecha de creacion registrada en el Hub (2026-09-11) es posterior a la fecha de actualizacion habitual de los repositorios y podria corresponder a un error de la plataforma; conviene comprobarla antes de citarla.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sam-guided-vlas/train_1_2_pile_random_pose__mask__overlay_a75__sim__all_cameras__live__pi05__seed_0__steps_1k
- Modelo base: https://huggingface.co/lerobot/pi05_base
- Dataset de entrenamiento: https://huggingface.co/datasets/sam-guided-vlas/train_1_2_pile_random_pose__mask__overlay_a75__sim__all_cameras__live
- Visualizador del dataset en LeRobot: https://huggingface.co/spaces/lerobot/visualize_dataset?path=sam-guided-vlas/train_1_2_pile_random_pose__mask__overlay_a75__sim__all_cameras__live
- Blog de π₀.₅ en Physical Intelligence: https://www.physicalintelligence.company/blog/pi05
- Repositorio OpenPI: https://github.com/Physical-Intelligence/openpi
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guia de pi05 en LeRobot: https://huggingface.co/docs/lerobot/main/en/pi05
- Documentacion de LeRobot: https://huggingface.co/docs/lerobot/index
- Guia de instalacion de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guia de hardware de LeRobot: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Guia de grabacion de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia rapida de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentacion de inferencia y rollout: https://huggingface.co/docs/lerobot/main/en/inference
