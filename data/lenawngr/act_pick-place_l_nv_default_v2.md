# lenawngr/ACT_pick-place_L_nv_default_v2

## Resumen

ACT_pick-place_L_nv_default_v2 es una politica de robótica basada en Action Chunking with Transformers (ACT), un método de aprendizaje por imitación que predice secuencias cortas de acciones (action chunks) en lugar de un único paso de control. El modelo ha sido entrenado y publicado en Hugging Face mediante LeRobot, la librería de Hugging Face para aprendizaje por imitación en robótica, y está asociado al dataset lenawngr/pick-place_so101, lo que sitúa su tarea en un escenario de pick-and-place sobre un brazo SO-101.

Se trata de un modelo pequeño: 51.668.614 parámetros almacenados en formato safetensors, con un repositorio de aproximadamente 0,2 GB y licencia Apache 2.0. No es un modelo de lenguaje ni un modelo multimodal generalista: es una politica visomotora que consume observaciones (típicamente imágenes de cámara y estado de las articulaciones) y produce comandos de actuación para el robot. Por tanto, conceptos como ventana de contexto o soporte multilingüe no aplican en el sentido habitual.

Su relevancia actual es práctica: LeRobot ha estandarizado el formato de checkpoints, entrenamiento y evaluación, de modo que este modelo puede reproducirse y desplegarse con los mismos comandos de CLI que cualquier otra politica del ecosistema. Al ser un checkpoint pequeño y con licencia permisiva, es adecuado como punto de partida para experimentos de imitación sobre hardware de bajo coste sin necesidad de GPU de gama alta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), transformer con componente generativo tipo CVAE para aprendizaje por imitación |
| Parametros totales | 51.668.614 |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica; no es un modelo de lenguaje. La model card no especifica observation horizon ni chunk size |
| Tipos de cuantizacion | no disponible (el repositorio publica pesos safetensors; LeRobot no documenta cuantizaciones en la model card) |
| Idiomas soportados | no disponible / no aplica |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

ACT combina un transformer con un autoencoder variacional condicional (CVAE) para modelar la multimodalidad de las demostraciones humanas. En lugar de predecir una acción por paso de control, el modelo genera un chunk de acciones futuras a partir de las observaciones actuales, lo que reduce el error de acumulación y permite ejecutar movimientos más suaves. El método fue presentado en el paper Action Chunking with Transformers (arXiv:2304.13705), citado explícitamente en las etiquetas y en la model card del repositorio.

El entrenamiento se ha realizado con LeRobot a partir del dataset lenawngr/pick-place_so101, compuesto por datos de teleoperación. La model card no detalla el número de episodios, el número de tokens, la composición exacta del dataset, ni si se aplicaron etapas adicionales de ajuste (RLHF/DPO no aplican a este tipo de politica). Tampoco se documentan innovaciones adicionales más allá de las propias del método ACT. El comando de entrenamiento documentado es `lerobot-train` con `--policy.type=act`, y la evaluación se realiza con `lerobot-record` sobre un robot `so100_follower`.

## Capacidades

- Control robótico por imitación: genera chunks de acciones a partir de observaciones visuales y propioceptivas para ejecutar tareas de manipulacion.
- Tarea especifica de pick-and-place: el checkpoint esta asociado al dataset `pick-place_so101`, orientado a recoger y colocar objetos.
- Ejecucion sobre brazos de la familia SO-100/SO-101: la model card muestra evaluacion con `so100_follower`.
- Integracion nativa con LeRobot: entrenamiento, evaluacion y registro de episodios mediante CLI (`lerobot-train`, `lerobot-record`).
- Aprendizaje desde datos de teleoperacion: el metodo esta disenado para aprender de demostraciones humanas.
- No dispone de tool calling, function calling, razonamiento multi-paso simbolico, capacidades multilingues, vision generalista, audio ni modo de pensamiento. Es una politica visomotora, no un asistente.

## Casos de uso

- Automatizacion de pick-and-place en laboratorio: recoger objetos de una posicion y depositarlos en otra mediante un brazo SO-101, usando el checkpoint como politica base y evaluando con `lerobot-record` durante 10 episodios.
- Prototipado rapido de politicas de imitacion: sirve como referencia para comparar contra nuevos checkpoints entrenados sobre el mismo dataset, al compartir formato y pipeline de evaluacion.
- Docencia e investigacion en robotica de bajo coste: permite ilustrar el ciclo completo teleoperacion, entrenamiento y despliegue sin necesidad de hardware de gama alta.
- Benchmark interno de manipulacion: al tener parametros y licencia conocidos, se puede integrar como linea base en experimentos de aprendizaje por imitacion comparables.
- Recogida y clasificacion de piezas en lineas de montaje ligeras: tareas repetitivas de agarre y deposito donde la precision de trayectoria importa mas que la generalizacion a objetos nuevos.
- Desarrollo de pipelines de evaluacion automatizada: combinado con el registro de episodios de LeRobot, permite medir tasa de exito por checkpoint de forma reproducible.
- Base para ajuste fino sobre un dominio propio: reentrenar o ajustar la politica con un dataset especifico del puesto de trabajo, partiendo de una arquitectura ya validada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tasas de exito, numero de episodios de evaluacion, ni comparaciones cuantitativas con otras politicas.

## Requisitos de hardware

- VRAM estimada en inferencia: el modelo tiene 51,7 M de parametros, por lo que en FP32 ocupa aproximadamente 0,2 GB y en FP16 alrededor de 0,1 GB, sin contar buffers de activaciones ni el coste de codificacion de imagenes.
- GPU recomendadas: cualquier GPU con CUDA es suficiente por capacidad de memoria; una RTX 3060 de 12 GB o superior resulta holgada. Tambien es viable en GPUs de gama de entrada con 4-6 GB.
- Cabe en GPU de consumo: si, con amplio margen. El cuello de botella esperado es el preprocesado de imagenes y la latencia de control, no la memoria.
- Despliegue: LeRobot es la via documentada (`lerobot-train` para entrenamiento y `lerobot-record` para inferencia/evaluacion, con `--policy.device=cuda`). No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, que estan orientadas a modelos de lenguaje y no aplican a esta politica.
- Latencia y throughput: no disponibles. La model card no publica mediciones de frecuencia de control ni tiempos de inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / horizonte | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ACT_pick-place_L_nv_default_v2 (este modelo) | 51.668.614 | no disponible | no disponible | apache-2.0 | Hugging Face, via LeRobot |
| ACT original (Zhao et al., 2023, arXiv:2304.13705) | no disponible en la informacion proporcionada | no disponible | no disponible | no disponible | paper y repositorio del proyecto |
| Otras politicas del ecosistema LeRobot (por ejemplo Diffusion Policy) | no disponible en la informacion proporcionada | no disponible | no disponible | no disponible | Hugging Face, via LeRobot |

No se dispone de datos cuantitativos para establecer una comparacion rigurosa con alternativas. La unica comparacion defendible con la informacion disponible es de tipo cualitativo: este checkpoint pertenece a la familia ACT y comparte pipeline con el resto de politicas de LeRobot.

## Limitaciones y advertencias

- Especificidad de tarea: el modelo esta entrenado para el dataset `pick-place_so101`; su comportamiento fuera de esa distribucion de objetos, posiciones e iluminacion no esta documentado.
- Riesgo de sobreajuste al entorno de captura: al tratarse de aprendizaje por imitacion con datos de teleoperacion, cambios en camaras, fondos o iluminacion pueden degradar el rendimiento.
- Ausencia de metricas: no hay tasas de exito publicadas, por lo que no se puede estimar su fiabilidad en produccion sin una evaluacion propia.
- Idiomas y texto: el modelo no procesa lenguaje natural, por lo que no admite instrucciones en texto ni capacidades multilingues.
- Alucinacion: el concepto no aplica igual que en modelos generativos de texto, pero si existe el riesgo de generar trayectorias fisicamente invalidas o inseguras ante observaciones fuera de distribucion.
- Seguridad fisica: cualquier despliegue sobre hardware real debe incorporar limites de par, paradas de emergencia y validacion en entorno controlado antes de operar cerca de personas.
- Licencia Apache 2.0: permite uso comercial y modificacion, con obligacion de conservar avisos de licencia y atribucion. No se documentan restricciones adicionales por parte del autor.
- Trazabilidad: el repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y la model card es esencialmente la plantilla por defecto de LeRobot, sin informacion sobre el autor ni validacion externa.
- Fechas del repositorio: la metadata indica creacion y actualizacion en octubre de 2026, dato que conviene verificar antes de citarlo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/lenawngr/ACT_pick-place_L_nv_default_v2
- Dataset asociado: https://huggingface.co/datasets/lenawngr/pick-place_so101
- Paper de ACT: https://huggingface.co/papers/2304.13705 (arXiv:2304.13705)
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
- Documentacion de LeRobot: https://huggingface.co/docs/lerobot/index
- Guia de entrenamiento de politicas: https://huggingface.co/docs/lerobot/il_robots#train-a-policy
- Nota: la busqueda web realizada no devolvio ningun resultado relacionado con este modelo, su autor, la robotica SO-101 ni el metodo ACT; los enlaces encontrados corresponden a herramientas no relacionadas y se han descartado.
