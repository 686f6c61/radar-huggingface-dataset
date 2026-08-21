# ppsohandsome/my_policy

## Resumen

El modelo `ppsohandsome/my_policy` es una política de robótica basada en el método Action Chunking with Transformers (ACT), entrenada con el framework LeRobot de Hugging Face. ACT es una técnica de aprendizaje por imitación que predice secuencias de acciones (chunks) en lugar de pasos individuales, lo que permite un control más suave y estable en tareas de manipulación robótica. El modelo fue desarrollado por el usuario ppsohandsome y está diseñado para operar sobre un robot tipo `so_follower` con dos cámaras.

Este modelo es relevante porque demuestra el flujo completo de LeRobot: desde la recopilación de datos teleoperados hasta el entrenamiento y despliegue de una política de control. Con aproximadamente 51,7 millones de parámetros, es un modelo compacto que puede ejecutarse en hardware de consumo. Sin embargo, es importante señalar que se trata de un modelo de demostración entrenado con un conjunto de datos muy reducido (solo 5 episodios), por lo que su rendimiento en tareas reales no ha sido evaluado formalmente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers) |
| Parametros totales | 51.668.614 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de control robotico, no de texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

ACT es un metodo de aprendizaje por imitacion que combina un transformer codificador-decodificador con un enfoque de variacional autoencoder (CVAE). La arquitectura procesa observaciones visuales (dos camaras: `arm_cam` y `side_cam`, ambas con resolucion 480x640) junto con el estado del robot (6 dimensiones) y genera secuencias de acciones futuras (chunks) de 6 dimensiones. Esta prediccion por chunks reduce la acumulacion de errores tipica de los metodos de control paso a paso.

El entrenamiento se realizo con el framework LeRobot version 0.6.1, utilizando el dataset `ppsohandsome/test_20260821_164732` que contiene 5 episodios y 3547 frames a 30 FPS. La configuracion de entrenamiento incluye 100.000 pasos, batch size de 8, optimizador AdamW con learning rate de 1e-05 y seed 1000. No se menciona el uso de RLHF, DPO ni otras tecnicas de refinamiento posteriores al aprendizaje por imitacion.

## Capacidades

- Control robotico por aprendizaje por imitacion: el modelo aprende a replicar acciones teleoperadas.
- Procesamiento multimodal: combina entrada visual de dos camaras con datos de estado del robot.
- Prediccion de acciones por chunks: genera secuencias de acciones en lugar de pasos individuales, lo que mejora la estabilidad del control.
- Integracion con LeRobot: compatible con el ecosistema de herramientas de Hugging Face para robotica.
- Ejecucion en tiempo real: disenado para inferencia a 30 FPS, la frecuencia de captura de las camaras.

## Casos de uso

- Tareas de manipulacion robotica: el modelo puede controlar un robot tipo `so_follower` para ejecutar tareas de pick-and-place o manipulacion de objetos aprendidas por demostracion.
- Prototipado rapido de politicas: gracias a LeRobot, los investigadores pueden entrenar y desplegar politicas de control en pocas horas con datos limitados.
- Investigacion en aprendizaje por imitacion: sirve como punto de partida para experimentar con variaciones de ACT o comparar con otros metodos como Diffusion Policy.
- Validacion de pipelines de robotica: permite probar el flujo completo de recopilacion de datos, entrenamiento y despliegue en un robot real.
- Educacion en robotica con IA: por su tamano reducido y licencia permisiva, es adecuado para cursos y talleres de robotica basada en aprendizaje automatico.
- Desarrollo de sistemas de teleoperacion asistida: el modelo puede complementar sistemas de teleoperacion proporcionando asistencia autonoma en tareas repetitivas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que no se han proporcionado resultados de evaluacion en robot real para esta politica.

## Requisitos de hardware

- VRAM estimada: al tratarse de un modelo de ~51 millones de parametros, la inferencia requiere menos de 1 GB de VRAM, aunque el procesamiento de imagenes (dos camaras 480x640) es el factor dominante.
- GPU recomendadas: cualquier GPU moderna con al menos 4 GB de VRAM (por ejemplo, NVIDIA GTX 1650, RTX 3050 o superior) es suficiente para inferencia.
- Compatibilidad con GPU de consumo: si, cabe en practicamente cualquier GPU consumer actual.
- Opciones de despliegue: el modelo se ejecuta mediante el comando `lerobot-rollout` de LeRobot, que gestiona la captura de camaras y el control del robot.
- Latencia: no disponible, pero el entrenamiento se realizo a 30 FPS, lo que sugiere que la inferencia puede alcanzar esa frecuencia en hardware adecuado.

## Comparativa con modelos similares

| Modelo | Parametros | Arquitectura | Dataset | Licencia |
|---|---|---|---|---|
| ppsohandsome/my_policy | 51,7 M | ACT | 5 episodios, tarea "test" | Apache 2.0 |
| ACT original (paper 2304.13705) | no disponible | ACT | datasets de manipulacion variados | no disponible |
| Diffusion Policy (alternativa en LeRobot) | no disponible | Diffusion | no disponible | no disponible |

La comparativa es limitada porque no se dispone de datos publicos de rendimiento para este modelo concreto. ACT es un metodo establecido en la literatura, pero este checkpoint especifico es una demostracion con datos muy limitados.

## Limitaciones y advertencias

- Dataset extremadamente reducido: solo 5 episodios de entrenamiento, lo que limita severamente la generalizacion a nuevas posiciones, objetos o condiciones de iluminacion.
- Sin evaluacion en robot real: la model card no reporta resultados de pruebas fisicas, por lo que el rendimiento real es desconocido.
- Tarea unica: el modelo fue entrenado para una unica tarea llamada "test", sin especificacion de que implica.
- Dependencia de hardware especifico: requiere un robot `so_follower` y dos camaras con las mismas caracteristicas que las usadas en el entrenamiento.
- Riesgo de sobreajuste: con tan pocos datos, el modelo probablemente memoriza las trayectorias de entrenamiento y falla ante variaciones minimas.
- Sin soporte de idiomas ni procesamiento de texto: es un modelo puramente de control robotico.

## Enlaces

- Repositorio del modelo: https://huggingface.co/ppsohandsome/my_policy
- Dataset de entrenamiento: https://huggingface.co/datasets/ppsohandsome/test_20260821_164732
- Paper de ACT: https://huggingface.co/papers/2304.13705
- LeRobot (GitHub): https://github.com/huggingface/lerobot
- Documentacion de LeRobot: https://huggingface.co/docs/lerobot/index
- Guia de ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=ppsohandsome/test_20260821_164732
