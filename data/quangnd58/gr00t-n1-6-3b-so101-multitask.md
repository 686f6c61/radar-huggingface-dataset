# quangnd58/GR00T-N1.6-3B-so101-multitask

## Resumen

GR00T-N1.6-3B-so101-multitask es un ajuste fino del modelo vision-language-action (VLA) NVIDIA Isaac GR00T N1.6, de aproximadamente 3,29 mil millones de parametros, publicado por el usuario quangnd58. Parte de nvidia/GR00T-N1.6-3B y se ha entrenado sobre el conjunto de datos hungho77/so101-multitask, compuesto por demostraciones teleoperadas de un brazo robotico de bajo coste SO-101. El resultado es un unico checkpoint capaz de ejecutar las tres tareas del dataset mediante instrucciones en lenguaje natural, en lugar de tres modelos independientes.

El modelo toma como entrada imagenes de dos camaras (frontal o cenital y de muneca, a 640x480) junto con un prompt de texto, y produce secuencias de acciones de manipulacion con un horizonte de accion de 16 pasos. El espacio de acciones corresponde a un brazo simple de 5 articulaciones con acciones relativas mas una pinza de 1 grado de libertad con accion absoluta, expresadas en unidades `.pos` de LeRobot.

Su relevancia radica en que traslada un VLA cross-embodiment de proposito general a un robot concreto y economico, reproducible con la pila Isaac-GR00T y LeRobot. El repositorio ocupa 9,8 GB y distribuye los pesos en formato safetensors, con 3.286.608.832 parametros. La licencia es la NVIDIA License (`license: other`), heredada del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language-action (VLA) cross-embodiment; estructura interna detallada no disponible |
| Parametros totales | 3.286.608.832 (aprox. 3,29 B) |
| Parametros activos | No aplica (no se documenta una arquitectura MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (solo se publican pesos safetensors) |
| Idiomas soportados | No disponible; las instrucciones de tarea estan redactadas en ingles |
| Licencia | NVIDIA License (`license: other`, archivo `LICENSE`) |
| Formato de pesos | Safetensors (libreria `lerobot`) |
| Horizonte de accion | 16 |
| Camaras de entrada | `front` (camara superior) y `wrist`, 640x480 |
| Estado / accion | `single_arm` (5 articulaciones, acciones relativas) + `gripper` (1, absoluta), unidades `.pos` de LeRobot |
| Etiqueta de encarnacion | `NEW_EMBODIMENT` |
| Transformacion de imagen | Letterbox desactivado (`letter_box_transform: false`) |
| Dataset de ajuste fino | hungho77/so101-multitask (SO-101, 3 tareas), convertido a LeRobot v2.1 |
| Version de codigo requerida | Isaac-GR00T, rama `n1d6`, commit `9b37aa1` o posterior |

## Arquitectura y entrenamiento

El modelo base, nvidia/GR00T-N1.6-3B, se define como un modelo vision-language-action abierto orientado a habilidades robotizadas generalizadas y disenado para ser cross-embodiment: acepta entradas multimodales (lenguaje e imagenes) y genera acciones de manipulacion en entornos diversos. El ajuste fino conserva ese esquema y lo especializa a un unico embodiment, el brazo SO-101, con dos flujos de imagen (camara frontal o superior y camara de muneca) y una representacion de estado/accion dividida entre brazo (5 articulaciones, acciones relativas) y pinza (absoluta).

Los datos de entrenamiento proceden del dataset hungho77/so101-multitask, con tres tareas de manipulacion, y fueron convertidos al formato LeRobot v2.1 mediante el script `scripts/lerobot_conversion/convert_v3_to_v2.py` de Isaac-GR00T. El ajuste se realizo con la configuracion de modalidad `examples/SO100/so100_config.py` y el script `examples/finetune.sh` de la rama `n1d6`. No se dispone de informacion sobre el numero total de tokens o episodios, la composicion exacta del dataset, ni sobre el uso de RLHF, DPO u otras tecnicas de alineacion posteriores.

Un detalle operativo relevante es la desactivacion del letterbox en el preprocesado de imagen: el modelo debe servirse con la rama `n1d6` en el commit `9b37aa1` o posterior para que la inferencia coincida con el preprocesado usado en el entrenamiento.

## Capacidades

- Generacion de acciones de manipulacion a partir de observaciones visuales y un prompt en lenguaje natural, con horizonte de accion de 16 pasos.
- Control de un brazo SO-101 de 5 articulaciones mas pinza, con acciones relativas para el brazo y absolutas para la pinza.
- Ejecucion de tres tareas concretas, invocables mediante estos prompts literales:
  - `Pick up the banana and place it in the bot, then close the lid`
  - `Pick blue cube and place on red cube`
  - `Pick all cubes and place into cup`
- Procesamiento multimodal con dos camaras simultaneas a 640x480 (vista frontal/superior y vista de muneca).
- Integracion con la pila Isaac-GR00T mediante servidor de inferencia (`gr00t/eval/run_gr00t_server.py`) y cliente de robot real (`gr00t/eval/real_robot/SO100/eval_so100.py`).
- Compatibilidad con el ecosistema LeRobot para carga y evaluacion del checkpoint.
- Soporte de tool calling, function calling, agentes multi-paso, capacidades multilingues, modo de razonamiento explicito, vision general, audio u otras capacidades adicionales: no disponibles en la informacion proporcionada.

## Casos de uso

- Manipulacion pick-and-place con brazo SO-101: el modelo recibe la imagen de las dos camaras y un prompt como `Pick blue cube and place on red cube`, y emite la secuencia de acciones para apilar el cubo azul sobre el rojo, con horizonte de 16 pasos por inferencia.
- Automatizacion de recogida y almacenamiento en contenedor: con el prompt `Pick all cubes and place into cup`, puede usarse en celdas de clasificacion donde las piezas deben depositarse en un recipiente.
- Tareas con cierre de contenedor: el prompt `Pick up the banana and place it in the bot, then close the lid` combina agarre, colocacion y accion sobre la pinza, util para escenarios tipo recogida con tapa.
- Investigacion en modelos VLA: sirve como checkpoint de referencia para estudiar el ajuste fino de un modelo cross-embodiment de 3B a un unico robot de bajo coste, comparando con variantes como N1.5 o SmolVLA sobre el mismo dataset.
- Laboratorios docentes de robotica: al estar pensado para un SO-101 economico con dos camaras USB a 640x480, permite montar practicas de manipulacion con un presupuesto reducido y la pila Isaac-GR00T.
- Generacion de datos y evaluacion de pipelines LeRobot: el checkpoint se integra en flujos LeRobot para validar conversion de datasets (v3 a v2.1), configuracion de modalidad y evaluacion en robot real.
- Despliegue como servicio de politica robotica: el script `run_gr00t_server.py` expone el modelo como servidor y el cliente `eval_so100.py` consume las acciones, lo que facilita separar el computo (GPU) del brazo fisico.
- Base para nuevos ajustes finos: al derivar de GR00T N1.6 con etiqueta `NEW_EMBODIMENT`, puede reutilizarse como punto de partida para ampliar el numero de tareas sobre el mismo hardware.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tasas de exito por tarea, ni metricas comparativas frente al modelo base o a otros checkpoints sobre el dataset hungho77/so101-multitask.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: en torno a 7-8 GB solo para los pesos (3.286.608.832 parametros a 2 bytes por parametro), mas el consumo de activaciones y del codificador visual. Se recomienda un minimo de 12-16 GB de VRAM para trabajar con margen. Estimacion orientativa, no confirmada por el autor.
- El repositorio completo ocupa 9,8 GB, por lo que incluye otros artefactos ademas de los pesos finales.
- GPU recomendadas: NVIDIA RTX 4090 (24 GB), L40S, A100 (40/80 GB) o H100 para inferencia con mayor margen y menor latencia; cualquier GPU con 16 GB o mas deberia ser suficiente para el modelo en precision bf16.
- Cabe en GPU de consumo: si, en tarjetas con 16 GB o mas de VRAM (RTX 4080/4090, RTX 3090, RTX 5090 y equivalentes). En GPUs de 8-12 GB el margen es muy ajustado y depende del runtime.
- Opciones de despliegue: servidor de inferencia de Isaac-GR00T (`gr00t/eval/run_gr00t_server.py`) con la rama `n1d6` en el commit `9b37aa1` o posterior, y carga mediante la libreria `lerobot`. No se documentan variantes GGUF ni soporte para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Base | Dataset | Formato | Licencia | Notas |
|---|---|---|---|---|---|---|
| quangnd58/GR00T-N1.6-3B-so101-multitask | 3,29 B | nvidia/GR00T-N1.6-3B | hungho77/so101-multitask | Safetensors | NVIDIA License | Checkpoint analizado; rama `n1d6` |
| twanghcmut/GR00T-N1.6-SO101-Multitask | No disponible | GR00T N1.6 3B | hungho77/so101-multitask | No disponible | No disponible | Un unico modelo para las tres tareas, segun su model card |
| quangnd58/GR00T-N1.5-3B-so101-multitask | 3 B aprox. | GR00T N1.5 3B | hungho77/so101-multitask | Safetensors | No disponible | Version anterior de la familia; API `Gr00tPolicy` con `so100_dualcam` |
| quangnd58/smolvla-so101-multitask | No disponible | SmolVLA | so101-multitask | Safetensors | No disponible | Alternativa VLA mas ligera, cargada con `SmolVLAPolicy` de LeRobot |
| nvidia/GR00T-N1.6-3B | 3 B aprox. | Modelo original | Datos propios de NVIDIA | Safetensors | NVIDIA License | Modelo base cross-embodiment sin ajuste al SO-101 |

La comparativa de rendimiento entre estos checkpoints no esta disponible: ninguno de los resultados de busqueda incluye tasas de exito ni metricas de evaluacion.

## Limitaciones y advertencias

- El modelo esta ajustado exclusivamente para un embodiment concreto (SO-101, 5 articulaciones mas pinza, dos camaras y horizonte de accion 16). No debe esperarse transferencia directa a otro robot o a otra configuracion de camaras.
- Las tareas utiles se limitan a las tres del dataset de ajuste; las instrucciones deben formularse con los prompts literales documentados. Fuera de ese conjunto, el comportamiento no esta caracterizado.
- Requiere la rama `n1d6` de Isaac-GR00T en el commit `9b37aa1` o posterior y el letterbox desactivado. Servir el modelo con otra version puede producir un preprocesado de imagen incorrecto y degradar las acciones.
- Riesgo de alucinacion: no disponible de forma explicita, pero al ser un modelo de accion, la prediccion de secuencias de movimiento sin contacto con el objeto esperado es un fallo plausible que requiere validacion fisica.
- Sesgos conocidos: no disponibles. No se documenta la composicion demografica ni la variabilidad de escenarios del dataset de entrenamiento.
- Idiomas: no disponible; los prompts del dataset estan en ingles, por lo que el uso en otros idiomas no esta validado.
- Restricciones de licencia: el modelo se distribuye bajo la NVIDIA License (`license: other`), heredada del modelo base. Es imprescindible revisar el archivo `LICENSE` antes de cualquier uso comercial, ya que se trata de una licencia especifica de NVIDIA y no de una licencia de codigo abierto estandar.
- Advertencia para produccion: el repositorio tiene 37 descargas y 0 likes, con fecha de creacion y actualizacion muy proximas entre si, lo que sugiere un artefacto reciente y con poca validacion externa por parte de la comunidad.
- No se publican datos de benchmarks ni evaluaciones cuantitativas de exito por tarea, por lo que la adopcion en produccion exigiria una evaluacion propia en el banco de pruebas fisico.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/quangnd58/GR00T-N1.6-3B-so101-multitask
- Modelo base: https://huggingface.co/nvidia/GR00T-N1.6-3B
- Dataset de ajuste fino: https://huggingface.co/datasets/hungho77/so101-multitask
- Repositorio de codigo: https://github.com/NVIDIA/Isaac-GR00T (rama `n1d6`)
- Checkpoint equivalente de otro autor: https://huggingface.co/twanghcmut/GR00T-N1.6-SO101-Multitask
- Version anterior de la familia: https://huggingface.co/quangnd58/GR00T-N1.5-3B-so101-multitask
- Alternativa SmolVLA sobre el mismo dataset: https://huggingface.co/quangnd58/smolvla-so101-multitask
