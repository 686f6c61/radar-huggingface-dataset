# rubatotree/so101_classify_the_blocks_act_512

## Resumen

`rubatotree/so101_classify_the_blocks_act_512` es una política de robótica basada en ACT (Action Chunking with Transformers) publicada en HuggingFace Hub mediante LeRobot. No es un modelo de lenguaje: es un modelo de imitación (imitation learning) que, a partir de una imagen de cámara y del estado articular de un brazo robótico, predice directamente comandos de acción. En concreto, consume `observation.state` con forma `(6,)` y una imagen `observation.images.front` de `(3, 480, 640)`, y produce `action` con forma `(6,)`.

El modelo lo desarrolla el usuario `rubatotree` y está entrenado sobre el dataset propio `rubatotree/classify-blocks-512-local` (512 episodios, 201.004 frames, 15 FPS) para una única tarea: "Match each loose plastic block to the examples in the organizer and put it in the matching compartment". El robot objetivo es un `so_follower` (familia SO-100/SO-101) con una sola cámara frontal. Los pesos ocupan 51.668.614 parámetros en formato safetensors, con un repositorio de 0,2 GB.

Su relevancia es práctica más que de investigación: sirve como ejemplo reproducible de un pipeline completo de LeRobot (grabación de datos teleoperados, entrenamiento con `lerobot-train` y despliegue con `lerobot-rollout`), y como referencia para quien quiera replicar una política ACT en hardware de bajo coste. El repositorio tiene 0 descargas y 0 likes, y no incluye resultados de evaluación en robot real.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder con cuello de botella latente tipo CVAE (Action Chunking with Transformers, ACT) |
| Parametros totales | 51.668.614 |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible. No es un modelo de lenguaje; procesa una observacion por inferencia y predice un chunk de acciones |
| Tipos de cuantizacion | No disponible. El repositorio declara safetensors; el tamano (0,2 GB) es coherente con pesos en fp32 |
| Idiomas soportados | No aplica / no disponible: el modelo no procesa texto |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |
| Pipeline declarado | robotics |
| Libreria | lerobot |
| Tipo de robot | `so_follower` |
| Camaras | `front` |
| Entrada: `observation.state` | STATE, forma `(6,)` |
| Entrada: `observation.images.front` | VISUAL, forma `(3, 480, 640)` |
| Salida: `action` | ACTION, forma `(6,)` |
| Tamano del repositorio | 0,2 GB |
| Fecha de creacion | 2026-09-17 |
| Fecha de actualizacion | 2026-09-17 |

## Arquitectura y entrenamiento

ACT (Action Chunking with Transformers) es un metodo de aprendizaje por imitacion descrito en el paper arXiv:2304.13705, citado en la propia model card. En lugar de predecir una accion por paso, el modelo predice un chunk de acciones futuras, lo que reduce el error de compounding y suaviza la ejecucion. La implementacion de LeRobot emplea un transformer encoder-decoder con un cuello de botella latente de tipo CVAE, que permite modelar la multimodalidad de las demostraciones humanas. Los detalles concretos de la configuracion interna (numero de capas, dimensiones, tamano de chunk) no se especifican en la informacion disponible.

El entrenamiento se realizo con LeRobot 0.6.1 sobre el dataset `rubatotree/classify-blocks-512-local`: 512 episodios, 201.004 frames a 15 FPS de datos teleoperados, para una sola tarea de clasificacion de bloques de plastico en un organizador. La configuracion declarada es de 100.000 pasos, batch size 64, optimizador AdamW, learning rate 1e-5 y semilla 1000. No se menciona uso de RLHF, DPO ni ningun otro ajuste por preferencias, algo esperable en un modelo de robotica de este tipo. El sufijo `512` del nombre del modelo no se explica en la model card, por lo que no se puede confirmar si alude al numero de episodios, al tamano del chunk de acciones u otro hiperparametro.

## Capacidades

- Control robótico por imitación: genera comandos de acción de 6 dimensiones para un brazo `so_follower` a partir de una imagen frontal y del estado articular.
- Predicción de chunks de acción: produce secuencias cortas de acciones en lugar de pasos aislados, lo que mejora la estabilidad en tareas de contacto.
- Manipulación visualmente guiada: la política está condicionada por visión (`observation.images.front`, 480x640), de forma que reacciona a la posición de los objetos en la escena.
- Tarea específica: clasificar bloques de plástico sueltos y colocarlos en el compartimento correspondiente del organizador, siguiendo los ejemplos mostrados.
- Ejecución a frecuencia de control de 15 FPS, coherente con la tasa de captura del dataset de entrenamiento.
- Soporte de tool calling / function calling: no aplica, no es un modelo de lenguaje.
- Soporte de agentes y razonamiento multi-paso: no aplica en el sentido de agentes conversacionales; el "razonamiento" aquí es puramente motor y de horizonte corto.
- Capacidades multilingües: no aplica, el modelo no procesa ni genera texto.
- Modo thinking, visión general, audio, generación de código: no disponibles o no aplicables. La única modalidad de entrada es imagen RGB más estado propioceptivo.

## Casos de uso

- Automatización de clasificación de piezas en un banco de trabajo: el modelo puede tomar bloques desordenados y depositarlos en el compartimento correcto, lo que lo hace adecuado para líneas de kitting de bajo volumen donde no compensa programar un sistema de visión clásico.
- Base para fine-tuning en tareas de pick-and-place: al estar entrenado con LeRobot, se puede reentrenar con `lerobot-train` sobre un dataset propio y reutilizar la receta (ACT, 100k pasos, AdamW, lr 1e-5) como punto de partida documentado.
- Laboratorio docente de aprendizaje por imitación: sirve como ejemplo completo y reproducible de un pipeline teleoperación -> dataset -> política -> despliegue, con un coste de hardware bajo (brazo SO-100/SO-101).
- Pruebas de concepto de manipulación visual: permite validar la integración de una cámara frontal OpenCV y el bucle de control de LeRobot antes de invertir en tareas más complejas.
- Banco de comparación de políticas: útil como referencia ACT frente a alternativas como Diffusion Policy o SmolVLA dentro del ecosistema LeRobot, siempre que se evalúen sobre la misma tarea y hardware.
- Investigación sobre robustez a variaciones de escena: al existir una única tarea y una única cámara, es un caso de estudio adecuado para medir cuánto degrada el éxito al cambiar iluminación, posición de objetos o añadir distractores.
- Demostraciones en ferias o vídeos técnicos: la política se puede lanzar con `lerobot-rollout` durante un tiempo acotado (`--duration`) sin necesidad de grabar episodios, lo que simplifica montar una demo en directo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye el apartado de evaluación vacío y afirma explícitamente: "No evaluation results have been provided for this policy yet". No hay tasas de éxito, número de ensayos ni comparaciones cuantitativas con otras políticas.

## Requisitos de hardware

- VRAM estimada para inferencia: menos de 1 GB. Los 51,67 millones de parámetros ocupan aproximadamente 207 MB en fp32 y unos 103 MB en fp16. A ello hay que sumar el encoder visual y los buffers de activaciones, por lo que un presupuesto de 1-2 GB de VRAM es holgado.
- GPU recomendadas: cualquier GPU NVIDIA con CUDA sirve; una RTX 3060, RTX 4090 o superior resulta sobredimensionada para el modelo, pero es habitual en el PC que controla el robot. También es viable en Jetson Orin o Raspberry Pi con GPU integrada para inferencia en fp32 o fp16.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU de consumo de los últimos diez años, e incluso en CPU. El cuello de botella real no es la VRAM sino la latencia de captura de cámara y del bus del robot.
- Opciones de despliegue: LeRobot es la vía soportada, mediante `lerobot-rollout` con `--policy.path=rubatotree/so101_classify_the_blocks_act_512`. Se puede forzar CPU o CUDA con los parámetros de dispositivo de LeRobot. vLLM, TGI, Ollama y llama.cpp no son aplicables, ya que no es un modelo de lenguaje ni un transformer autoregresivo de texto.
- Latencia y throughput estimados: no hay cifras publicadas. Como referencia del orden de magnitud, el presupuesto temporal del bucle de control a 15 FPS es de unos 66 ms por paso; una política ACT de este tamaño suele inferir bastante por debajo de ese umbral en GPU moderna, pero no se dispone de mediciones del autor.

## Comparativa con modelos similares

No se dispone de datos comparativos publicados para este modelo concreto. La tabla siguiente recoge únicamente el contexto de la categoría; los campos sin información se marcan como no disponibles.

| Modelo | Enfoque | Parametros | Licencia | Datos comparativos |
|---|---|---|---|---|
| `rubatotree/so101_classify_the_blocks_act_512` | ACT (transformer con chunking de acciones) sobre LeRobot | 51.668.614 | apache-2.0 | No disponibles |
| Otras politicas ACT del Hub de LeRobot | ACT | No disponible por modelo | Variable, habitualmente apache-2.0 | No disponibles |
| Diffusion Policy (referencia de la literatura) | Generacion de trayectorias por difusion | No disponible en la informacion proporcionada | No disponible | No disponibles |
| SmolVLA (familia VLA de HuggingFace) | Vision-language-action | No disponible en la informacion proporcionada | No disponible | No disponibles |

## Limitaciones y advertencias

- Modelo de tarea única: solo se ha entrenado para "Match each loose plastic block to the examples in the organizer and put it in the matching compartment". Fuera de esa tarea no cabe esperar comportamiento útil.
- Sin resultados de evaluación: no hay tasa de éxito medida en robot real ni número de ensayos, por lo que no se puede cuantificar su fiabilidad antes de desplegarlo.
- Sensibilidad al entorno de entrenamiento: al provenir de 512 episodios teleoperados en un montaje concreto, es probable que degrade con cambios de iluminación, fondo, posición de la cámara o disposición de los objetos. No se documenta ninguna prueba de generalización.
- Dependencia de la cámara frontal: la política asume exactamente la clave de observación `observation.images.front` y una resolución de 480x640. Nombres de cámara distintos o resoluciones distintas romperán la inferencia.
- Riesgo de sobreajuste a la configuración de hardware: el robot declarado es `so_follower`; usar otro brazo, otra calibración o un port distinto exige ajustes manuales en el comando de despliegue.
- Ausencia de mecanismos de seguridad: es un modelo de imitación sin capa de planificación simbólica ni verificación de colisiones. En producción hace falta un supervisor externo (paradas de emergencia, límites de par, zonas prohibidas).
- Idiomas y texto: no aplica; no procesa lenguaje natural, por lo que no sirve para interfaces conversacionales ni para seguir instrucciones en castellano u otro idioma.
- Licencia: apache-2.0, que permite uso comercial y modificación siempre que se conserve el aviso de copyright y se indiquen los cambios. Es una de las licencias más permisivas, pero conviene revisar también el dataset `rubatotree/classify-blocks-512-local` y su propia licencia antes de un uso comercial.
- Procedencia de los datos: el dataset son demostraciones teleoperadas; si contienen sesgos del operador (velocidad, trayectorias preferidas, posiciones), la política los reproducirá.
- Repositorio sin tracción: 0 descargas y 0 likes en el momento de la consulta, sin garantía de mantenimiento ni soporte por parte del autor.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/rubatotree/so101_classify_the_blocks_act_512
- Dataset de entrenamiento: https://huggingface.co/datasets/rubatotree/classify-blocks-512-local
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=rubatotree/classify-blocks-512-local
- Paper de ACT (arXiv:2304.13705): https://huggingface.co/papers/2304.13705
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
- Guia de ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentacion de LeRobot: https://huggingface.co/docs/lerobot/index
- Guia de instalacion: https://huggingface.co/docs/lerobot/main/en/installation
- Guia de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabacion de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia rapida de comandos: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentacion de inferencia (rollout): https://huggingface.co/docs/lerobot/main/en/inference
