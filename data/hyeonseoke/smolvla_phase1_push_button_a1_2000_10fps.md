# HyeonseokE/smolvla_phase1_push_button_A1_2000_10fps

## Resumen

SmolVLA es un modelo de visión-lenguaje-acción (VLA) compacto y eficiente desarrollado por Hugging Face, con 450 millones de parámetros, diseñado para desplegarse en hardware de consumo. Este repositorio concreto contiene un fine-tuning de la base `lerobot/smolvla_base` para la tarea de pulsar un botón rojo con un robot SO-101, entrenado con el framework LeRobot sobre un dataset propio de 100 episodios grabados a 10 FPS.

El modelo resuelve el problema del control robótico por imitación: a partir de imágenes de cámaras y del estado del robot, genera una secuencia de acciones que ejecutan la tarea especificada por una instrucción en lenguaje natural. Su relevancia actual radica en que demuestra cómo un VLA de tamaño reducido puede especializarse en una tarea de manipulación con pocos datos y ejecutarse en GPUs de gama media, abriendo la puerta a la robótica accesible para laboratorios y desarrolladores independientes.

La arquitectura combina un modelo de lenguaje y visión preentrenado con un experto de acción entrenado mediante flow matching. El contexto de entrada incluye tres cámaras (256x256 píxeles) y un vector de estado de 6 dimensiones, y la salida es un vector de acción de 6 dimensiones. La licencia es Apache 2.0, lo que permite uso comercial y modificación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA) con VLM compacto y experto de accion con flow matching |
| Parametros totales | 450.046.176 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (instrucciones en ingles en el dataset) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

SmolVLA es un modelo VLA compuesto por un modelo de lenguaje y vision (VLM) compacto preentrenado y un experto de accion entrenado con flow matching. Dado un conjunto de imagenes y una instruccion en lenguaje natural, el modelo genera un chunk de acciones. En este fine-tuning, la base `lerobot/smolvla_base` se ajusto con el dataset `HyeonseokE/phase1_push_button_A1_10fps`, que contiene 100 episodios y 11.299 frames a 10 FPS de la tarea "Press the red button". El entrenamiento se realizo con 8.800 pasos, batch size de 64, optimizador AdamW, learning rate de 0,0001 y semilla 2000, usando LeRobot 0.6.0. No se menciona el uso de RLHF ni DPO; el ajuste es puramente de imitacion supervisada.

## Capacidades

- Control robotico por imitacion: genera acciones de 6 grados de libertad a partir de observaciones visuales y de estado.
- Comprension de instrucciones en lenguaje natural: la tarea se especifica textualmente ("Press the red button").
- Procesamiento multimodal: acepta tres flujos de imagen (camara superior, muneca izquierda y una tercera camara) junto con el estado del robot.
- Integracion con LeRobot: compatible con el ecosistema de entrenamiento y despliegue de LeRobot, incluyendo comandos CLI para rollout y entrenamiento.
- Eficiencia computacional: al tener solo 450M de parametros, es adecuado para hardware de consumo, a diferencia de VLA mas grandes como OpenVLA (7B).
- Especializacion en tarea unica: este checkpoint esta optimizado exclusivamente para pulsar un boton rojo, no es un modelo generalista.

## Casos de uso

- Automatizacion de tareas repetitivas en laboratorio: el modelo puede ejecutar la tarea de pulsar un boton de forma consistente, liberando a investigadores de tareas manuales en experimentos de robotica.
- Evaluacion de politicas en robotica: sirve como punto de partida para comparar el rendimiento de fine-tunings de SmolVLA en tareas de manipulacion simples, midiendo tasa de exito y robustez.
- Prototipado rapido de controladores: desarrolladores pueden usar este checkpoint como ejemplo para entrenar sus propios modelos con LeRobot, reutilizando la configuracion de entrenamiento y el flujo de trabajo.
- Investigacion en aprendizaje por imitacion: el dataset y el modelo permiten estudiar como el numero de episodios, la frecuencia de muestreo y la arquitectura afectan al rendimiento en tareas de manipulacion.
- Despliegue en robots SO-101: el modelo esta preparado para ejecutarse en el robot seguidor SO-101, permitiendo pruebas en entornos fisicos con camaras compatibles.
- Generacion de datos sinteticos para entrenamiento: al ser un modelo entrenado con datos de simulacion (Isaac Lab, segun los tags del dataset), puede usarse para generar trayectorias etiquetadas que alimenten otros modelos o pipelines de code-as-policies.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que no hay resultados de evaluacion en robot real.

## Requisitos de hardware

- VRAM estimada: al tratarse de un modelo de 450M de parametros, la inferencia en precision FP32 requiere aproximadamente 1,8 GB de VRAM, aunque con cuantizacion podria reducirse a menos de 1 GB. No se dispone de datos oficiales de consumo.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM deberia ser suficiente, como una NVIDIA GTX 1650, RTX 3060 o superior. Para entrenamiento, se recomienda una GPU con 8 GB o mas (por ejemplo, RTX 3070, RTX 4090).
- Compatibilidad con hardware de consumo: si, es uno de los objetivos del diseno de SmolVLA.
- Opciones de despliegue: el modelo se integra con LeRobot, que ofrece comandos `lerobot-rollout` para ejecucion en robot real. Tambien es compatible con el ecosistema Hugging Face (transformers, safetensors) y puede cargarse con la libreria `lerobot`.
- Latencia y throughput: no disponible. Depende de la GPU y de la optimizacion del runtime.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SmolVLA (este checkpoint) | 450M | no disponible | Pulsar boton (SO-101) | Apache 2.0 | Hugging Face |
| OpenVLA | 7B | no disponible | Manipulacion general | MIT | Hugging Face |
| RT-2 (Google) | 55B | no disponible | Manipulacion general | propietaria | no publico |

SmolVLA es significativamente mas pequeno que OpenVLA y RT-2, lo que permite su ejecucion en hardware de consumo. Sin embargo, este checkpoint concreto esta especializado en una unica tarea, mientras que OpenVLA y RT-2 son modelos generalistas. No se dispone de comparativas de rendimiento directas.

## Limitaciones y advertencias

- Especializacion estrecha: el modelo solo ha sido entrenado para pulsar un boton rojo; no generaliza a otras tareas ni a variaciones del entorno sin reentrenamiento.
- Datos limitados: el entrenamiento se realizo con 100 episodios, lo que puede provocar sobreajuste y baja robustez ante cambios de iluminacion, posicion de la camara o texturas.
- Riesgo de alucinacion en acciones: como todo modelo generativo, puede producir acciones incoherentes si la entrada difiere del dominio de entrenamiento.
- Dependencia del hardware: aunque es ligero, el rendimiento en robot real depende de la calibracion de las camaras y del robot, y de la sincronizacion entre observaciones y acciones.
- Sin evaluacion publicada: no hay resultados de tasa de exito en robot real, por lo que su rendimiento efectivo es desconocido.
- Idioma: las instrucciones estan en ingles; no se ha verificado el soporte de otros idiomas.
- Fecha de creacion futura: el modelo fue creado en agosto de 2026, lo que sugiere que puede ser un artefacto experimental o de prueba.

## Enlaces

- Repositorio del modelo: https://huggingface.co/HyeonseokE/smolvla_phase1_push_button_A1_2000_10fps
- Dataset de entrenamiento: https://huggingface.co/datasets/HyeonseokE/phase1_push_button_A1_10fps
- Paper de SmolVLA: https://arxiv.org/abs/2506.01844
- Web oficial de SmolVLA: https://smolvla.net/index_en
- Documentacion de LeRobot: https://huggingface.co/docs/lerobot/index
