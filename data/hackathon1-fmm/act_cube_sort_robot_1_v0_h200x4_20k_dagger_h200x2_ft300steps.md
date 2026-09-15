# hackathon1-fmm/act_cube_sort_robot_1_v0_h200x4_20k_dagger_h200x2_ft300steps

## Resumen

El modelo `hackathon1-fmm/act_cube_sort_robot_1_v0_h200x4_20k_dagger_h200x2_ft300steps` es una política robótica de manipulación entrenada con la librería LeRobot y basada en la arquitectura ACT (Action Chunking Transformer), descrita en el artículo arXiv:2304.13705. No es un modelo de lenguaje: su entrada son observaciones sensoriales (imágenes de cámara y estado de las articulaciones del robot) y su salida son secuencias de acciones motrices. El identificador del repositorio indica que la tarea objetivo es la clasificación y colocación de cubos ("cube sort") con un brazo robótico.

El nombre del checkpoint describe un proceso de entrenamiento en dos fases: una primera de 20.000 pasos sobre 4 GPU H200 con datos recogidos mediante DAgger, y un ajuste fino posterior de 300 pasos sobre 2 GPU H200. El conjunto de datos asociado es `hackathon1-fmm/rollout_cube_sort_robot_1_dagger_20k_20260915_121921_clean1_merged_2ep_20260915_125953`, también alojado en HuggingFace.

Su relevancia es la de un artefacto de referencia dentro de un hackathon: publica pesos en formato safetensors listos para cargar con LeRobot, pero no incluye model card detallada, resultados de evaluación ni métricas de éxito en tarea real. Con 0 descargas y 0 likes en el momento de la consulta, no hay validación externa de su comportamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking Transformer), segun arXiv:2304.13705 |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (ACT consume una ventana de observaciones y predice un chunk de acciones; el tamano del chunk no se especifica en la informacion disponible) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (politica robotica, no modelo de lenguaje) |
| Licencia | apache-2.0 segun el tag del repositorio; el campo de licencia aparece como "no disponible" |
| Formato de pesos | safetensors |
| Libreria | lerobot |
| Pipeline declarado | robotics |
| Tarea declarada | cube sort (clasificacion y colocacion de cubos) con brazo robotico |
| Dataset de entrenamiento | hackathon1-fmm/rollout_cube_sort_robot_1_dagger_20k_20260915_121921_clean1_merged_2ep_20260915_125953 |
| Entradas | no disponible en detalle (tipicamente imagenes RGB y estado de articulaciones en ACT) |
| Salidas | no disponible en detalle (tipicamente objetivos de posicion articular por chunk) |
| Region | us |

## Arquitectura y entrenamiento

ACT es un transformer de tipo encoder-decoder pensado para imitación de manipulaciones finas. Su innovación principal es predecir un chunk de acciones futuras en lugar de una acción individual, lo que reduce el error de acumulación (compounding error) propio del behavior cloning. En la formulación original, el encoder procesa las observaciones visuales y el estado del robot, y el decoder genera la secuencia de acciones de forma no autorregresiva, condicionada por un embedding de estilo latente.

Para este checkpoint concreto no se dispone de información publicada sobre el backbone visual, el tamaño del chunk, la dimensionalidad de las acciones ni el número de parámetros. El identificador del repositorio permite deducir el procedimiento de entrenamiento: 20.000 pasos sobre 4 GPU H200 con datos recolectados mediante DAgger (mezcla de demostraciones humanas y rollouts de la propia política con correcciones), seguido de un ajuste fino de 300 pasos sobre 2 GPU H200. El dataset asociado menciona "2ep" y "clean1", lo que sugiere un proceso de limpieza y posiblemente dos episodios fusionados, pero esto es una lectura del nombre del fichero y no un dato confirmado en la información disponible.

## Capacidades

- Control motor de un brazo robótico para tareas de pick-and-place sobre cubos.
- Imitación de comportamiento: reproduce estrategias aprendidas de demostraciones humanas y de rollouts DAgger.
- Predicción de chunks de acciones, lo que aporta suavidad y estabilidad en trayectorias cortas.
- Integración nativa con la librería LeRobot para carga, evaluación y despliegue.
- Exportación de pesos en safetensors, compatible con el ecosistema PyTorch.
- No dispone de generación de texto, razonamiento simbólico, código ni matemáticas.
- No soporta tool calling ni function calling.
- No soporta agentes conversacionales ni razonamiento multi-paso en el sentido de los LLM.
- No es multilingüe: no procesa ni produce lenguaje natural.
- No se ha confirmado soporte de modo "thinking", visión general, audio ni ninguna capacidad multimodal fuera de la percepción necesaria para la política.

## Casos de uso

- Clasificación de cubos en línea de laboratorio: la política puede ordenar piezas por color o forma sobre una superficie delimitada, siempre que la disposición, la iluminación y el robot sean similares a las del dataset de entrenamiento.
- Base para fine-tuning con DAgger: equipos que quieran adaptar la política a una celda nueva pueden partir de estos pesos y recolectar correcciones humanas para ajustar el comportamiento.
- Evaluación comparativa de políticas en LeRobot: sirve como referencia ACT entrenada con 20.000 pasos frente a otras arquitecturas del mismo framework, como Diffusion Policy o SmolVLA.
- Docencia e investigación en imitación robótica: al ser un checkpoint pequeño y ligero, es adecuado para prácticas de carga de modelos, inspección de tensores y ejecución en simulación.
- Automatización de pick-and-place en almacén a pequeña escala: con una celda controlada y objetos estandarizados, el modelo puede alimentar un bucle de control que agrupe y coloque piezas.
- Generación de datos sintéticos de evaluación: ejecutar la política en simulador permite producir rollouts etiquetados que después se filtran y se incorporan al dataset de entrenamiento.
- Integración en pipelines de robótica con ROS 2: los pesos pueden envolverse en un nodo de inferencia que consuma imágenes y estado articular y publique comandos de posición.
- Prototipado rápido en hackathons: el formato safetensors y la librería LeRobot reducen el tiempo de puesta en marcha frente a implementaciones desde cero.
- Estudio de robustez ante cambios de dominio: comparar el rendimiento en la celda original y en variantes de iluminación o posición permite medir la sensibilidad de ACT a la distribución de entrenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

El repositorio no incluye métricas de tasa de éxito, número de episodios de evaluación, curvas de pérdida ni comparaciones con otros checkpoints. Tampoco hay información sobre latencia de inferencia ni sobre rendimiento en hardware concreto.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. Al tratarse de una política ACT, el tamaño típico es muy inferior al de un LLM y suele caber holgadamente en GPU de gama media, pero no hay confirmación para este checkpoint.
- GPU recomendadas: no disponible. El entrenamiento se realizó sobre 4 GPU H200 (fase DAgger de 20.000 pasos) y 2 GPU H200 (ajuste fino de 300 pasos), lo que no implica que la inferencia requiera ese hardware.
- GPU de consumo: probablemente compatible con tarjetas tipo RTX 3060, RTX 4090 o similares si el checkpoint mantiene el tamaño habitual de ACT, aunque este dato no está confirmado.
- Opciones de despliegue: LeRobot y PyTorch son la vía natural. vLLM, llama.cpp, Ollama y TGI no aplican a este tipo de modelo. Es posible exportar a ONNX o TorchScript para inferencia embebida, pero no se documenta en el repositorio.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| act_cube_sort_robot_1_v0 (este modelo) | ACT, imitacion de manipulacion | no disponible | no disponible | apache-2.0 segun tag | HuggingFace, libreria LeRobot |
| Diffusion Policy (LeRobot) | Politica por difusion, imitacion | no disponible | no disponible | segun implementacion de LeRobot | HuggingFace, libreria LeRobot |
| SmolVLA (LeRobot) | Vision-language-action con componente de lenguaje | no disponible | no disponible | segun implementacion de LeRobot | HuggingFace, libreria LeRobot |
| ACT original (ALOHA, arXiv:2304.13705) | ACT, imitacion bimanual | no disponible | no disponible | no disponible | Paper y repositorio de referencia |

No se dispone de resultados de benchmarks publicados que permitan comparar el rendimiento de este checkpoint con las alternativas anteriores. La comparación disponible es únicamente de categoría y de ecosistema de despliegue.

## Limitaciones y advertencias

- No hay model card ni documentación técnica: se desconoce el backbone visual, el tamaño de chunk, el número de parámetros y el esquema exacto de observaciones y acciones.
- No se han publicado métricas de tasa de éxito ni evaluaciones en robot real.
- Con 0 descargas y 0 likes, el checkpoint carece de validación por parte de la comunidad.
- Sesgos conocidos: no se documentan. En políticas de imitación, los sesgos suelen aparecer como sobreajuste a posiciones, colores, iluminación y texturas presentes en el dataset de entrenamiento.
- Riesgo de alucinación: no aplica en el sentido de los modelos de lenguaje; el riesgo equivalente es la divergencia de la política ante estados fuera de distribución (distribution shift), que puede producir movimientos erráticos o bloqueos.
- Limitación de idioma: no aplica, ya que el modelo no procesa lenguaje natural.
- Restricción de licencia: el tag indica apache-2.0, pero el campo de licencia del repositorio figura como no disponible. Antes de un uso comercial conviene verificar el fichero LICENSE y la licencia del dataset asociado.
- El modelo está especializado en una única tarea (cube sort) y no es reutilizable como política generalista sin reentrenamiento.
- El dataset de entrenamiento procede de rollouts DAgger de un único entorno; no se documenta diversidad de escenas, robots ni objetos.
- La fecha de creación registrada (2026-09-15) y la naturaleza de hackathon del repositorio sugieren que se trata de un artefacto experimental, no de un modelo listo para producción.
- No se documentan garantías de seguridad física: cualquier despliegue en robot real debe incluir paradas de emergencia, límites de par y validación en simulador previa.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/hackathon1-fmm/act_cube_sort_robot_1_v0_h200x4_20k_dagger_h200x2_ft300steps
- Dataset asociado: https://huggingface.co/datasets/hackathon1-fmm/rollout_cube_sort_robot_1_dagger_20k_20260915_121921_clean1_merged_2ep_20260915_125953
- Paper de ACT (Action Chunking Transformer): https://arxiv.org/abs/2304.13705
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
- Los resultados de la busqueda web no aportaron informacion relevante sobre este modelo: las URLs devueltas corresponden a una plataforma de cursos de fisica y no guardan relacion con el checkpoint.
