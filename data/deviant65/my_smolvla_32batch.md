# Deviant65/my_smolvla_32batch

## Resumen

`Deviant65/my_smolvla_32batch` es un modelo de vision-lenguaje-acción (VLA) para robótica, resultado del ajuste fino de `lerobot/smolvla_base` por parte del usuario Deviant65 mediante la librería LeRobot. No es un modelo de lenguaje: es una política de imitación que consume el estado articular y tres flujos de imagen de un brazo SO-101 (`so_follower`) y produce comandos de acción de 6 grados de libertad. El modelo tiene 450.046.176 parámetros (aproximadamente 450 millones) y se distribuye en formato safetensors, con un tamaño de repositorio de 0,9 GB.

La relevancia de SmolVLA, la arquitectura en la que se basa, reside en que demuestra que un VLA compacto puede alcanzar rendimiento competitivo con un coste computacional reducido y desplegarse en hardware de consumo, según la model card del autor. Este checkpoint concreto está especializado en una única tarea: "Pick up the red block and place it in the brown box", entrenada sobre 136 episodios y 123.593 fotogramas capturados a 30 FPS con tres cámaras.

El modelo se publicó el 2 de octubre de 2026 y, en el momento de redactar esta ficha, no acumula descargas ni valoraciones, y el autor no ha facilitado resultados de evaluación en robot real. Su interés es, por tanto, principalmente como ejemplo reproducible del flujo de trabajo de LeRobot y como punto de partida para ajustes finos propios.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language-action (VLA) compacta, segun SmolVLA (arXiv:2506.01844); detalles internos de capas no disponibles |
| Parametros totales | 450.046.176 |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (politica de accion, no modelo conversacional) |
| Tipos de cuantizacion | no disponible; el repositorio solo contiene pesos safetensors |
| Idiomas soportados | no disponible; la instruccion de tarea usada en entrenamiento esta en ingles |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (libreria LeRobot) |

## Arquitectura y entrenamiento

Se trata de una politica VLA basada en SmolVLA, descrita en la model card como un modelo compacto y eficiente capaz de operar en hardware de consumo. El modelo consume cuatro observaciones: `observation.state` con forma `(6,)` y tres entradas visuales (`observation.images.camera1`, `camera2`, `camera3`) de `(3, 256, 256)` cada una, correspondientes a las camaras de muneca, superior y base. La salida es un vector `action` de forma `(6,)`. La informacion proporcionada no detalla la composicion interna del transformer, el encoder visual ni si emplea decodificacion especulativa o atencion lineal; estos datos figuran como no disponibles.

El ajuste fino se realizo con LeRobot 0.6.2 sobre el dataset `Deviant65/so101_redcube_3cam`, compuesto por 136 episodios, 123.593 fotogramas a 30 FPS y una unica tarea de manipulacion. La configuracion de entrenamiento reportada es: 40.000 pasos, tamano de lote 32, optimizador AdamW, tasa de aprendizaje 0,0001 y semilla 1000. No se documenta el uso de RLHF, DPO ni de tecnicas de alineacion adicionales, algo esperable en una politica de imitacion.

## Capacidades

- Generacion de acciones de manipulacion de 6 grados de libertad a partir de observaciones visuales y de estado articular.
- Fusion de tres vistas de camara simultaneas (muneca, superior y base) a 256x256 por vista.
- Condicionamiento por instruccion textual en lenguaje natural (la tarea de entrenamiento esta en ingles).
- Ejecucion de una tarea concreta de pick-and-place: recoger un bloque rojo y depositarlo en una caja marron.
- Integracion nativa con el ecosistema LeRobot: entrenamiento con `lerobot-train` y ejecucion con `lerobot-rollout`.
- Ejecucion en bucle cerrado sobre un robot SO-101 real (`so_follower`).
- No se documentan capacidades de tool calling, function calling, razonamiento multi-paso, agentes, vision general, audio ni modo de pensamiento; no son aplicables a una politica robotica de este tipo.
- No se documentan capacidades multilingues.

## Casos de uso

- Automatizacion de pick-and-place en laboratorio: el modelo puede controlar un brazo SO-101 para recoger un bloque rojo y colocarlo en una caja marron, replicando exactamente la tarea sobre la que fue entrenado, sin necesidad de programacion explicita de trayectorias.
- Punto de partida para ajuste fino propio: al derivar de `lerobot/smolvla_base`, sirve como inicializacion para entrenar politicas de otras tareas con `lerobot-train`, reutilizando los pesos aprendidos de la tarea original.
- Docencia y prototipado en robotica: permite a un estudiante o investigador reproducir un flujo completo de aprendizaje por imitacion (grabacion de datos, entrenamiento, despliegue) con hardware de gama de consumo en lugar de estaciones con GPUs de datacenter.
- Evaluacion comparativa de politicas VLA: con 450 millones de parametros y un repositorio de 0,9 GB, es un candidato manejable para comparar latencia, tasa de exito y robustez frente a politicas mas grandes sobre el mismo montaje fisico.
- Validacion de pipelines de datos multicamara: el modelo esta entrenado con tres camaras sincronizadas a 30 FPS, por lo que resulta util para comprobar la calidad y el alineamiento temporal de nuevas grabaciones con la misma configuracion.
- Integracion en cadenas de montaje simples con clasificacion por color: la politica aprende a discriminar el bloque rojo del resto de objetos y su destino, un comportamiento reutilizable en tareas de seleccion por atributo visual.
- Demostracion de despliegue con LeRobot: el repositorio incluye el comando `lerobot-rollout` listo para ejecutar, lo que permite validar una instalacion completa de LeRobot contra un robot real antes de invertir tiempo en entrenamientos propios.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente: "No evaluation results have been provided for this policy yet", por lo que no existen datos de tasa de exito en robot real, numero de ensayos ni condiciones de evaluacion. El paper de SmolVLA (arXiv:2506.01844) puede contener resultados del modelo base, pero no se incluyen en la informacion proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos): aproximadamente 1,8 GB en fp32, 0,9 GB en bf16/fp16 y alrededor de 0,45 GB en int8. Hay que anadir el coste de activaciones del encoder visual para tres imagenes de 256x256 y del bucle de control, por lo que en la practica conviene reservar entre 2 y 4 GB de VRAM.
- Cabe en GPUs de consumo: cualquier tarjeta con 6 GB o mas de VRAM es suficiente a nivel de memoria de pesos (por ejemplo, RTX 3060, RTX 4060, RTX 4090). El cuello de botella real es la latencia del bucle de control, no la memoria.
- GPU recomendadas: no disponibles de forma oficial; por tamano, una RTX 4090, L4, A10G o A100 ofrecen margen de sobra. El autor menciona genericamente "consumer-grade hardware" como objetivo.
- Opciones de despliegue: LeRobot (comandos `lerobot-rollout` y `lerobot-train`). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no son adecuados para una politica de accion.
- Latencia y throughput estimados: no disponibles. La unica referencia temporal es la frecuencia de captura del dataset, 30 FPS, que no equivale necesariamente a la frecuencia de inferencia de la politica.
- Es probable que se requiera una GPU con CUDA para operar en tiempo real; no se documenta el rendimiento en CPU.

## Comparativa con modelos similares

| Modelo | Parametros | Tipo | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Deviant65/my_smolvla_32batch | 450 M | VLA (fine-tune) | apache-2.0 | HuggingFace | Especializado en una tarea; sin evaluacion publicada |
| lerobot/smolvla_base | Aproximadamente 450 M (misma familia) | VLA (base) | apache-2.0 | HuggingFace | Modelo base generalista del que deriva este checkpoint |
| OpenVLA | Aproximadamente 7 B | VLA | BSD/uso abierto (segun su publicacion) | HuggingFace | Orden de magnitud mayor en parametros; datos no verificados en esta ficha |
| pi0 (Physical Intelligence) | Aproximadamente 3 B | VLA con flow matching | No comercial / restringida (segun su publicacion) | Acceso limitado | Datos no verificados en esta ficha |

Las cifras de OpenVLA y pi0 provienen de conocimiento general y no estan confirmadas por la informacion proporcionada; deben verificarse en sus fuentes originales antes de citarlas.

## Limitaciones y advertencias

- Ausencia total de evaluacion: el autor no ha publicado tasa de exito, numero de ensayos ni condiciones del test. No hay evidencia publica de que la politica funcione de forma fiable.
- Especializacion extrema: entrenada solo para la tarea "Pick up the red block and place it in the brown box" con un unico tipo de objeto y destino. Fallara fuera de esa distribucion.
- Dataset reducido: 136 episodios de una sola escena implican un alto riesgo de sobreajuste a posiciones concretas de los objetos, a la iluminacion y al fondo de las grabaciones.
- Dependencia de configuracion de hardware: las tres camaras deben tener exactamente los nombres `wrist`, `top` y `base` (los indices `camera1`, `camera2`, `camera3` en las observaciones) y la misma resolucion de 256x256; cualquier cambio invalida la politica.
- Generalizacion linguistica no documentada: no se indica si la politica responde a instrucciones de tarea distintas de la de entrenamiento ni si soporta otros idiomas.
- Sin validacion de la comunidad: cero descargas y cero valoraciones en el momento de redactar esta ficha, por lo que no existe retroalimentacion externa sobre su comportamiento.
- Riesgo de alucinacion: no aplica en el sentido de generacion de texto, pero si existe riesgo de acciones erraticas o inseguras ante entradas fuera de distribucion.
- Seguridad fisica: al controlar un brazo robotico real, se recomienda limitar velocidad y par, usar parada de emergencia y supervision humana durante las pruebas, especialmente sin datos de evaluacion.
- Licencia apache-2.0: permite uso comercial y modificacion, pero el autor no ofrece ninguna garantia ni soporte.
- La busqueda web realizada no devolvio ningun resultado relevante sobre este modelo; los enlaces recuperados eran contenido no relacionado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Deviant65/my_smolvla_32batch
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Dataset de entrenamiento: https://huggingface.co/datasets/Deviant65/so101_redcube_3cam
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=Deviant65/so101_redcube_3cam
- Paper de SmolVLA: https://huggingface.co/papers/2506.01844 (arXiv:2506.01844)
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
- Guia de SmolVLA en LeRobot: https://huggingface.co/docs/lerobot/main/en/smolvla
- Documentacion de LeRobot: https://huggingface.co/docs/lerobot/index
- Guia de instalacion de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guia de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Guia de grabacion de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia rapida de comandos: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentacion de inferencia: https://huggingface.co/docs/lerobot/main/en/inference
