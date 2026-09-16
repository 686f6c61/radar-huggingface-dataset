# CamilleWalters/smolvla_full-block-sorter-v1

## Resumen

smolvla_full-block-sorter-v1 es una politica robotica (policy) de tipo vision-language-action publicada en HuggingFace por el usuario CamilleWalters, obtenida por ajuste fino del modelo base lerobot/smolvla_base. Resuelve una tarea concreta de manipulacion: colocar bloques de distintos colores y formas (cubo azul, estrella azul, cubo verde, hexagono verde, cubo amarillo) en el orificio correspondiente, sobre un robot WidowX AI follower con camaras de muneca y de vista principal.

El modelo sigue el metodo SmolVLA (arXiv 2506.01844), una familia de modelos VLA compactos disenada para lograr prestaciones competitivas con un coste computacional reducido y poder desplegarse en hardware de consumo. Cuenta con 450.046.176 parametros (unos 450 M) y un repositorio de 0,9 GB en formato safetensors, y se ejecuta mediante la libreria LeRobot en su version 0.6.1.

Su relevancia es eminentemente practica: documenta un flujo completo de imitacion supervisada (captura de datos con 245 episodios y 131.960 fotogramas a 30 FPS, entrenamiento de 20.000 pasos) sobre un modelo lo bastante pequeno como para inferir en GPU de gama media, algo poco frecuente en el ambito VLA. No se han publicado resultados de evaluacion en robot real.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language-action (VLA); el autor no detalla la composicion interna en la model card (metodo SmolVLA, arXiv 2506.01844) |
| Parametros totales | 450.046.176 (~450 M), dato real de safetensors |
| Parametros activos | No aplica: no es un modelo MoE |
| Longitud de contexto | no disponible (no es un modelo de lenguaje con ventana de contexto; el condicionamiento es una instruccion de tarea) |
| Tipos de cuantizacion | no disponible (solo se publican pesos safetensors; no se documentan variantes GGUF, AWQ ni GPTQ) |
| Idiomas soportados | no disponible; las instrucciones de tarea del dataset estan redactadas en ingles |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Libreria / framework | LeRobot 0.6.1 |
| Tipo de modelo (pipeline) | robotics (politica de imitacion) |
| Robot objetivo | widowxai_follower_robot |
| Entradas | observation.state (6,); 3 flujos visuales de (3, 256, 256) |
| Salidas | action (7,) |
| Tamano del repositorio | 0,9 GB |
| Descargas / likes | 0 / 0 |
| Modelo base | lerobot/smolvla_base |

## Arquitectura y entrenamiento

La model card describe el modelo como un VLA compacto y eficiente, es decir, una politica que combina percepcion visual, una instruccion en lenguaje natural y el estado propioceptivo del robot para producir directamente acciones motoras. La informacion proporcionada no detalla la composicion interna de la red (tipo de encoder visual, mecanismo de fusion multimodal ni cabeza de accion), por lo que ese desglose queda como no disponible. La politica consume tres flujos de imagen de 256x256 pixels y un vector de estado de 6 dimensiones, y emite un vector de accion de 7 dimensiones.

El entrenamiento se realizo por imitacion sobre el dataset CamilleWalters/block_sorter_v3_20260901_180009 (245 episodios, 131.960 fotogramas, 30 FPS), con 20.000 pasos, tamano de lote 64, optimizador AdamW, tasa de aprendizaje 0,0001 y semilla 1000. No se documenta ninguna fase de RLHF, DPO ni aprendizaje por refuerzo; el pipeline es de aprendizaje supervisado a partir de demostraciones humanas. La innovacion tecnica destacable es la propia propuesta SmolVLA: reducir el coste computacional del paradigma VLA hasta hacerlo viable en hardware de consumo.

## Capacidades

- Generacion de acciones motoras continuas de 7 dimensiones para un robot WidowX AI follower.
- Percepcion visual multimodal a partir de tres flujos de imagen de 256x256 pixels.
- Condicionamiento por instruccion de tarea en lenguaje natural, con cinco tareas entrenadas: cubo azul, estrella azul, cubo verde, hexagono verde y cubo amarillo, cada una hacia su orificio correspondiente.
- Seleccion implicita de objeto y destino: el modelo debe distinguir color y forma del bloque y emparejarlo con el hueco adecuado.
- Control en lazo cerrado a la frecuencia del dataset de entrenamiento (30 FPS).
- Ajuste fino adicional: al derivar de lerobot/smolvla_base, puede reentrenarse con LeRobot sobre nuevos datasets.
- No soporta tool calling ni function calling: no es un modelo de lenguaje y no genera texto ni llamadas a herramientas.
- No soporta agentes ni razonamiento multi-paso de tipo cadena de pensamiento.
- No dispone de modo thinking, audio, ni capacidades multilingues documentadas.
- No se documentan capacidades de vision general (descripcion de imagenes, VQA): la vision esta al servicio del control motor.

## Casos de uso

- Clasificacion y enrutado de piezas en una celda de montaje: el modelo coge un bloque y lo deposita en el orificio que coincide en color y forma, lo que equivale a una operacion de sorting con verificacion visual del resultado.
- Base para ajuste fino propio: partiendo de lerobot/smolvla_base y de este checkpoint, un equipo puede reentrenar con lerobot-train sobre sus propios episodios y adaptar la politica a nuevas piezas o destinos sin partir de cero.
- Banco de pruebas de politicas VLA en hardware de consumo: con 450 M de parametros y 0,9 GB de pesos, permite medir latencias y tasas de exito en GPU de gama media, algo inviable con VLA de varios miles de millones de parametros.
- Docencia e investigacion en aprendizaje por imitacion: sirve como ejemplo reproducible de pipeline completo (captura a 30 FPS, 245 episodios, entrenamiento de 20.000 pasos, despliegue con lerobot-rollout).
- Validacion de infraestructura de datos roboticos: el dataset asociado, junto con el visualizador de LeRobot, permite auditar calidad de episodios, frecuencia de muestreo y coherencia de las instrucciones de tarea.
- Pruebas de robustez y analisis de fallos: al no existir evaluacion publicada, el modelo es un candidato directo para experimentos controlados que varian posicion inicial de bloques, iluminacion o presencia de distractores y miden la degradacion de la tasa de exito.
- Prototipado de automatizacion de bajo coste: en laboratorios con un WidowX AI follower y dos camaras, permite demostrar una tarea de pick-and-place sin depender de infraestructura en la nube.
- Comparativa metodologica: util como referencia frente a otras politicas del ecosistema LeRobot (ACT, Diffusion Policy) en experimentos de misma tarea y mismo robot, si bien los datos de esas alternativas no se incluyen en la informacion disponible.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La propia model card incluye la seccion de evaluacion con la nota "No evaluation results have been provided for this policy yet", por lo que no existe tasa de exito medida en robot real ni comparacion numerica con otras politicas.

| Metrica | Resultado |
|---|---|
| Tasa de exito en robot real | no disponible (no se han aportado evaluaciones) |
| Numero de ensayos por tarea | no disponible |
| MMLU, HumanEval, GSM8K u otros benchmarks de lenguaje | no aplicable: no es un modelo de lenguaje |
| Benchmarks de manipulacion (p. ej. LIBERO) | no disponibles en la informacion proporcionada |

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,9 GB en bf16/fp16 y 1,8 GB en fp32 solo para los pesos de 450 M de parametros; sumando activaciones y preprocesado de tres flujos de 256x256, una estimacion razonable se situa en el rango de 2 a 4 GB en precision reducida.
- Cabe en GPU de consumo: si, es uno de los objetivos declarados del metodo SmolVLA. Tarjetas como RTX 3060 (12 GB), RTX 4060, RTX 4070 o RTX 4090 son suficientes por memoria; la limitacion practica sera la latencia del lazo de control, no la VRAM.
- GPU de datacenter (A100, H100) sobredimensionadas para inferencia, aunque utiles para reentrenar con lotes grandes (el entrenamiento documentado uso lote 64).
- Opciones de despliegue: LeRobot, tanto para inferencia (lerobot-rollout --policy.path=...) como para entrenamiento (lerobot-train --policy.path=lerobot/smolvla_base --policy.device=cuda). No se documenta soporte de vLLM, TGI, llama.cpp ni Ollama, que son servidores orientados a modelos de lenguaje y no a politicas de control.
- Latencia y throughput: no disponibles. La unica referencia temporal es la frecuencia del dataset de entrenamiento (30 FPS, 131.960 fotogramas en 245 episodios), y el comando de ejemplo fija una duracion de ejecucion de 60 segundos por rollout.
- Hardware adicional imprescindible: robot WidowX AI follower con su puerto de conexion, y camaras configuradas con los mismos nombres de observacion usados en el entrenamiento.

## Comparativa con modelos similares

La informacion proporcionada solo documenta con detalle este checkpoint y su modelo base. Para el resto de alternativas del ecosistema LeRobot no se aportan parametros, contexto ni resultados, por lo que se indican como no disponibles en lugar de estimarlos.

| Modelo | Parametros | Entradas / contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| CamilleWalters/smolvla_full-block-sorter-v1 | 450.046.176 (~450 M) | observation.state (6,) + 3 imagenes de 256x256; instruccion de tarea | Sin evaluacion publicada | Apache 2.0 | HuggingFace, 0 descargas, 0 likes |
| lerobot/smolvla_base (modelo base) | no disponible en la informacion | Politica VLA generica de la familia SmolVLA | no disponible | no disponible en la informacion | HuggingFace |
| Politicas alternativas del ecosistema LeRobot (ACT, Diffusion Policy) | no disponible | Condicionadas por estado e imagen; no emplean instruccion en lenguaje natural en su formulacion clasica | no disponible | no disponible | Repositorio LeRobot |

## Limitaciones y advertencias

- Ausencia total de evaluacion: no hay tasa de exito, ni numero de ensayos, ni condiciones de prueba. Cualquier uso en produccion exige una validacion propia previa.
- Politica de proposito unico: esta ajustada a cinco tareas de colocacion de bloques sobre un unico robot. No generaliza a otras piezas, otros orificios ni otras tareas fuera de la distribucion del dataset.
- Dependencia estricta del hardware: requiere un WidowX AI follower y camaras con los mismos nombres de clave de observacion. Cambios de robot, de calibracion, de montaje de camara o de iluminacion invalidan la politica.
- Inconsistencia interna en la model card: la seccion de detalles indica dos camaras (cam_main, cam_wrist), mientras que la tabla de entradas lista tres flujos visuales (camera1, camera2, camera3) y el ejemplo de rollout configura solo dos camaras. Hay que verificar los nombres reales de las claves antes de desplegar.
- Sobreajuste probable al entorno de captura: 245 episodios de un unico entorno y una unica disposicion fisica. Se espera degradacion ante cambios de posicion inicial, iluminacion, fondo o presencia de objetos distractores.
- Idioma: las ordenes de tarea estan en ingles y no se documenta soporte de otros idiomas; no es un modelo conversacional multilingue.
- Sin ventana de contexto: no existe contexto de texto extenso ni memoria de conversacion; cada accion depende del estado actual y de la instruccion de tarea.
- Riesgo fisico: es un modelo que genera movimiento real. Es obligatorio operar con limites de par, parada de emergencia y espacio de trabajo despejado. La licencia Apache 2.0 no incluye garantias de ningun tipo.
- Licencia: Apache 2.0 permite uso comercial y modificacion, con obligacion de conservar avisos de licencia y atribucion. No se declaran restricciones adicionales por parte del autor.
- Sesgos: no documentados. Al derivar de un dataset propio y reducido, puede heredar sesgos de posicion, color y forma presentes en las demostraciones.
- Sin traccion comunitaria: 0 descargas y 0 likes en el momento de la consulta, lo que implica ausencia de validacion externa y de informes de fallos.
- Alucinacion: no aplica en el sentido linguistico, pero si existe el riesgo equivalente de acciones incorrectas o inseguras ante entradas fuera de distribucion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/CamilleWalters/smolvla_full-block-sorter-v1
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Dataset de entrenamiento: https://huggingface.co/datasets/CamilleWalters/block_sorter_v3_20260901_180009
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=CamilleWalters/block_sorter_v3_20260901_180009
- Paper de SmolVLA: https://huggingface.co/papers/2506.01844
- Preprint en arXiv: https://arxiv.org/abs/2506.01844
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guia de SmolVLA en LeRobot: https://huggingface.co/docs/lerobot/main/en/smolvla
- Documentacion completa de LeRobot: https://huggingface.co/docs/lerobot/index
- Instalacion de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guia de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabacion de datos y entrenamiento de politicas: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia rapida de CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentacion de inferencia y rollout: https://huggingface.co/docs/lerobot/main/en/inference
- La busqueda web realizada no devolvio enlaces relevantes sobre este modelo; los resultados obtenidos correspondian a contenidos no relacionados.
