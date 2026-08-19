# Rwang30/act_pen_pickup

## Resumen

El modelo `act_pen_pickup` es una politica de aprendizaje por imitacion basada en Action Chunking with Transformers (ACT), desarrollada por Rwang30 y publicada en Hugging Face mediante la libreria LeRobot. Esta entrenada para que un robot manipulador SO-101 follower recoja un boligrafo y lo coloque en una taza, a partir de datos teleoperados. El modelo consume una imagen RGB de una camara frontal (480x640) y el estado del robot (6 dimensiones), y produce acciones de 6 dimensiones. Con 51,7 millones de parametros y un tamano de repositorio de 0,2 GB, es una politica compacta adecuada para despliegue en hardware de bajo coste.

La relevancia de este modelo radica en que demuestra como un transformer relativamente pequeno puede aprender tareas de manipulacion de precision con solo 40 episodios de demostracion (17.378 fotogramas a 30 FPS). ACT, propuesto en el articulo arxiv:2304.13705, predice chunks de acciones en lugar de pasos individuales, lo que mejora la suavidad y la tasa de exito en tareas de manipulacion real. Este modelo concreto no ha publicado resultados de evaluacion en robot real, por lo que su rendimiento efectivo no esta verificado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers) |
| Parametros totales | 51.668.614 (~51,7 M) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (politica robotica, no modelo de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (modelo de robotica sin procesamiento de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

ACT es un metodo de aprendizaje por imitacion que utiliza un transformer combinado con un autoencoder variacional condicional (CVAE) para predecir secuencias cortas de acciones en lugar de pasos individuales. La arquitectura procesa la imagen de la camara frontal (3x480x640) junto con el estado del robot (6 dimensiones) como entrada, y genera chunks de acciones de 6 dimensiones como salida. El uso del CVAE permite modelar la distribucion multimodal de acciones validas, lo que resulta util en tareas de manipulacion donde existen multiples trayectorias correctas.

El entrenamiento se realizo con la libreria LeRobot (version 0.6.2) sobre el dataset `Rwang30/so101-pen-pickup-task`, compuesto por 40 episodios teleoperados (17.378 fotogramas a 30 FPS) de la tarea "Pick up the pen and place it in the cup". Se usaron 20.000 pasos de entrenamiento con optimizador AdamW, tasa de aprendizaje de 1e-5, batch size de 8 y semilla 1000. El robot utilizado fue un SO-101 follower con una unica camara frontal. No se menciona el uso de RLHF, DPO ni otras tecnicas de refinamiento posterior al aprendizaje por imitacion.

## Capacidades

- Manipulacion robotica de precision: recoger un boligrafo y colocarlo en una taza mediante control visual y de estado.
- Aprendizaje por imitacion: reproduce comportamientos aprendidos de demostraciones teleoperadas sin necesidad de ingenieria de recompensas.
- Control multimodal: fusiona entrada visual (imagen RGB 480x640) con entrada de estado del robot (6 dimensiones).
- Prediccion de chunks de acciones: genera secuencias de acciones de 6 dimensiones en lugar de pasos individuales, lo que mejora la suavidad y coherencia del movimiento.
- Inferencia en tiempo real: al ser un modelo de 51,7 M de parametros, es capaz de operar con latencias bajas en GPU de consumo.
- Integracion con el ecosistema LeRobot: compatible con los flujos de trabajo estandar de entrenamiento, evaluacion y despliegue de Hugging Face.

## Casos de uso

- Automatizacion de pick-and-place en laboratorio: el modelo puede integrarse en un robot SO-101 para realizar tareas repetitivas de recogida y colocacion de objetos pequenos, reduciendo la intervencion humana en entornos controlados.
- Investigacion en aprendizaje por imitacion: sirve como punto de partida para estudiar como ACT generaliza con pocas demostraciones (40 episodios) y para comparar variantes del algoritmo o configuraciones de hiperparametros.
- Prototipado de lineas de ensamblaje: permite validar rapidamente si un transformer pequeno puede resolver una tarea de manipulacion concreta antes de escalar a modelos mas grandes o datasets mas extensos.
- Educacion en robotica: un modelo compacto con licencia Apache 2.0 es adecuado para cursos universitarios de robotica y aprendizaje automatico, donde los estudiantes pueden entrenarlo, evaluarlo y desplegarlo en hardware real.
- Benchmarking de politicas robotica: al estar publicado en el Hub con LeRobot, puede usarse como referencia para comparar el rendimiento de otras politicas en la misma tarea o en tareas similares.
- Transferencia y fine-tuning: el checkpoint puede servir como inicializacion para tareas de manipulacion relacionadas, reduciendo el tiempo de entrenamiento en nuevas tareas de pick-and-place con datasets pequenos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente: "No evaluation results have been provided for this policy yet." No se dispone de tasas de exito en robot real, metricas de precision ni comparaciones con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: con 51,7 M de parametros, el modelo ocupa aproximadamente 197 MB en fp32 y unos 99 MB en fp16. Cualquier GPU con 2 GB de VRAM o mas es suficiente.
- GPU recomendadas: cualquier GPU moderna de consumo (NVIDIA RTX 3060 o superior) es mas que suficiente. Tambien puede ejecutarse en CPU para inferencia no critica en tiempo real.
- Compatibilidad con GPU de consumo: si, el modelo cabe holgadamente en cualquier GPU consumer actual.
- Opciones de despliegue: LeRobot (libreria oficial de Hugging Face) proporciona los comandos `lerobot-rollout` y `lerobot-train` para ejecucion y entrenamiento. No se menciona soporte para vLLM, llama.cpp u Ollama, ya que no es un LLM.
- Latencia y throughput: no disponible en la informacion proporcionada. Al ser un modelo pequeno, se espera una latencia baja en GPU, pero no hay datos publicados.

## Comparativa con modelos similares

| Modelo | Parametros | Tarea | Robot | Dataset | Evaluacion |
|---|---|---|---|---|---|
| Rwang30/act_pen_pickup | 51,7 M | Recoger boligrafo y colocarlo en taza | SO-101 follower | 40 episodios, 17.378 frames | No publicada |
| jihwanooh/act-realm-pen-pickup | no disponible | Recogida de boligrafo (REALM) | no disponible | no disponible | no disponible |
| mddoai/act_pick_pen | no disponible | Recogida de boligrafo | no disponible | no disponible | no disponible |

Los tres modelos comparten la arquitectura ACT y la libreria LeRobot, pero no se dispone de especificaciones detalladas de los modelos comparables en la informacion disponible.

## Limitaciones y advertencias

- Entrenado exclusivamente para una tarea: recoger un boligrafo y colocarlo en una taza. No generaliza a otras tareas sin reentrenamiento.
- Sin resultados de evaluacion publicados: no hay datos de tasa de exito en robot real, por lo que el rendimiento efectivo no esta verificado.
- Dataset limitado: 40 episodios de demostracion pueden no cubrir la variabilidad de posiciones, iluminacion y distracciones del mundo real.
- Unica camara frontal: la politica depende de una sola vista RGB, lo que puede limitar el rendimiento en entornos con oclusiones o cambios de iluminacion.
- Requiere hardware especifico: el despliegue necesita un robot SO-101 follower y una camara configurada segun las claves de observacion del modelo (`observation.images.front`).
- Sin soporte de lenguaje: al ser un modelo de robotica, no procesa instrucciones textuales ni mantiene conversaciones.
- Licencia Apache 2.0: permite uso comercial, pero el modelo se distribuye sin garantias y sin resultados de evaluacion que respalden su fiabilidad en produccion.
- Modelo recien publicado: con 0 descargas y 0 likes en el momento de la consulta, no hay comunidad ni historial de uso que aporte informacion adicional sobre su comportamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Rwang30/act_pen_pickup
- Dataset de entrenamiento: https://huggingface.co/datasets/Rwang30/so101-pen-pickup-task
- Visualizacion del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=Rwang30/so101-pen-pickup-task
- Articulo ACT (arxiv): https://huggingface.co/papers/2304.13705
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Documentacion LeRobot ACT: https://huggingface.co/docs/lerobot/main/en/act
- Guia de instalacion de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guia de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Referencia de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Perfil de GitHub de la autora: https://github.com/rwang30/
