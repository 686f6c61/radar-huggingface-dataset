# muacha/pi05_franka_relative_10hz_unified

## Resumen

pi05_franka_relative_10hz_unified es un modelo de politica robotica (vision-language-action, VLA) derivado de `lerobot/pi05_base` mediante ajuste fino supervisado. Lo publica el usuario `muacha` en Hugging Face y esta especializado en el robot Franka FR3 con acciones de pose relativa del efector final a 10 Hz. Resuelve el problema de controlar un brazo Franka a partir de observaciones visuales y de estado, generando secuencias de acciones ejecutables directamente en el robot.

La aportacion tecnica principal es la unificacion de las vistas de las dos camaras laterales usadas en los datos de entrenamiento (RealSense D435if y D455): todas las imagenes laterales se renderizan en una unica vista canonica de 848x426, de modo que el mismo checkpoint puede servirse con cualquiera de las dos camaras sin reentrenar. El modelo tiene 3.616.757.520 parametros (segun los pesos en safetensors) y el repositorio ocupa 59,8 GB, incluyendo multiples checkpoints etiquetados por paso.

Se trata de un modelo de investigacion en robotica, no de un LLM de proposito general: su salida son acciones de control, no texto. La model card no declara licencia, idiomas ni resultados de evaluacion, y el autor indica explicitamente que no hay evaluacion publicada todavia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | pi0.5 (politica vision-language-action, base `lerobot/pi05_base`); detalles internos no disponibles |
| Parametros totales | 3.616.757.520 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors, presumiblemente bf16) |
| Idiomas soportados | no disponible (modelo de robotica; no aplica generacion de texto libre) |
| Licencia | no disponible |
| Formato de pesos | safetensors (`model.safetensors` con pesos EMA, decay 0.99) |

## Arquitectura y entrenamiento

El modelo parte de `lerobot/pi05_base` y se ajusta con la libreria `openpi` bajo la configuracion `pi05_franka_relative_10hz_unified`. La entrada combina observaciones visuales (camara lateral unificada y presumiblemente camara de muneca, aunque la model card solo detalla la lateral) con el estado del robot; la salida son chunks de acciones de pose relativa del efector final a 10 Hz. El entrenamiento usa bf16, EMA con decay 0.99 y un schedule de 75.000 pasos con batch global 64 (4 GPU A100-40GB, 4 por GPU y 4 pasos de acumulacion), LR coseno con 1.000 pasos de warmup, pico 2,5e-5 y decaimiento hasta 2,5e-6.

Los datos de entrenamiento son la concatenacion de dos datasets: uno capturado con D435if (515 episodios, 139.823 frames, 14 tareas) y otro con D455 (255 episodios, 57.708 frames, 6 tareas), ambos a 10 fps con resolucion RGB-D. Se reservan 25 episodios de validacion del dataset D455 (5.516 frames, 10% por tarea, semilla 0) y cada 1.000 pasos se registran en wandb `val/loss` con ruido fijo, `val/grasp_point_err_cm`, `val/pos_err_1s_cm` y `val/gripper_close_within_0.3s` usando los pesos sin EMA. Las estadisticas de normalizacion se calculan sobre ambos datasets y se guardan en `assets/franka_d435if_d455_unified`.

La innovacion destacable es la vista lateral unificada: se toma la vista D435if recortada a sus 426 filas superiores de 480 (848x426), ya que la D455 no ve las filas inferiores. Las imagenes D435if se recortan a esa region y las D455 se reproyectan mediante un warp de perspectiva calculado a partir de las calibraciones grabadas: una homografia inducida por el plano z = 5 cm mas la distorsion de lente de la D455. El error del warp es inferior a 2 px (a 224 px de resolucion) para puntos hasta 15 cm por encima de la mesa. La implementacion esta en `openpi.policies.franka_cameras`.

## Capacidades

- Generacion de acciones de control para un brazo Franka FR3: chunks de pose relativa del efector final a 10 Hz.
- Percepcion visual a partir de imagen RGB de camara lateral, con soporte para dos modelos de camara (D435if y D455) mediante la vista unificada.
- Seleccion de camara en inferencia: por defecto usa D455; un cliente con D435if envia `"observation/side_camera": "d435if"` junto con la observacion.
- Ejecucion de tareas de manipulacion multiple: 14 tareas en el dataset D435if y 6 en el D455 (los nombres concretos de las tareas no estan disponibles en la informacion proporcionada).
- Cierre de pinza coordinado con el movimiento, con metrica de validacion especifica (`val/gripper_close_within_0.3s`).
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, vision-language general, audio ni modo thinking.

## Casos de uso

- Manipulacion robotica en laboratorio con Franka FR3: el modelo genera acciones de pose relativa a 10 Hz que pueden enviarse directamente al controlador del brazo, adecuado para prototipos de investigacion en aprendizaje por imitacion.
- Estandarizacion de flotas con camaras heterogeneas: al unificar las vistas de D435if y D455, un mismo checkpoint sirve para robots equipados con cualquiera de las dos camaras, reduciendo el mantenimiento de politicas por hardware.
- Evaluacion de generalizacion entre camaras: util para estudiar cuanto degrada el cambio de sensor cuando la politica se entreno con vistas unificadas, comparando el rendimiento con `"observation/side_camera": "d435if"` frente al valor por defecto D455.
- Recogida y picking en entornos de mesa: las tareas de grasping estan cubiertas por las metricas de validacion (`grasp_point_err_cm`, `gripper_close_within_0.3s`), lo que permite medir la calidad del agarre antes de desplegar.
- Investigacion en VLA con `openpi`: sirve como punto de partida para ajustes finos adicionales sobre `pi05_base` con nuevos datasets de robot, reutilizando la configuracion `pi05_franka_relative_10hz_unified`.
- Servicio de inferencia con seleccion de camara en tiempo de ejecucion: el cliente puede alternar entre D435if y D455 enviando el campo `observation/side_camera`, util en laboratorios con bancos de prueba cambiantes.
- Benchmark interno de politicas relativas frente a absolutas: al usar acciones de pose relativa, es comparable con la variante `pi05_franka_relative_10hz` del mismo autor para aislar el efecto de la vista unificada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente "Evaluation: None yet". Solo se documentan metricas de validacion registradas durante el entrenamiento (`val/loss`, `val/grasp_point_err_cm`, `val/pos_err_1s_cm`, `val/gripper_close_within_0.3s`), pero no se proporcionan sus valores numericos.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la informacion proporcionada. Con 3.616.757.520 parametros, en bf16 los pesos ocupan aproximadamente 7,2 GB; a eso hay que sumar activaciones y buffers de imagen, pero no se ha publicado una cifra oficial.
- GPU de entrenamiento documentadas: 4x A100-40GB (4 por GPU, acumulacion de 4). Es la referencia real de recursos usados por el autor.
- GPU recomendadas para inferencia: no disponible. Por tamano de pesos, una GPU con 16 GB o mas (RTX 4090, A100, H100) es plausible, pero no esta confirmado por el autor.
- Cabe en GPU consumer: no confirmado. Los pesos en bf16 caben en 8 GB teoricos, pero el pipeline completo (vision + politica) puede requerir mas; no hay datos oficiales.
- Opciones de despliegue: la libreria declarada es `openpi` (configuracion `pi05_franka_relative_10hz_unified`). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles. El control opera a 10 Hz, lo que fija un presupuesto de 100 ms por ciclo, pero no se publican mediciones reales.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| pi05_franka_relative_10hz_unified | 3.616.757.520 | no disponible | VLA Franka FR3, acciones relativas, vista lateral unificada | no disponible | Hugging Face (`muacha/...`) |
| pi05_franka_relative_10hz | no disponible | no disponible | VLA Franka FR3, acciones relativas, sin vista unificada | no disponible | Referenciado por el autor; no se ha verificado su repositorio |
| lerobot/pi05_base | no disponible | no disponible | Modelo base VLA pi0.5 | no disponible | Hugging Face (`lerobot/pi05_base`) |

No se dispone de datos de benchmarks ni de especificaciones detalladas de las alternativas en la informacion proporcionada, por lo que la comparacion cuantitativa de rendimiento no es posible.

## Limitaciones y advertencias

- Sin evaluacion publicada: el autor indica "None yet"; no hay evidencia de rendimiento en el mundo real mas alla de las metricas de validacion internas.
- Licencia no declarada: no se puede asumir uso comercial; hay que contactar con el autor o consultar el repositorio base `lerobot/pi05_base` antes de cualquier despliegue productivo.
- Restriccion de encuadre de la camara lateral: la imagen debe ser el frame completo de la camara; se permite redimensionar, pero no recortar ni rellenar. Un recorte o padding invalida la vista unificada y degrada la politica.
- Dependencia de calibracion: la reproyeccion D455 se calcula con calibraciones grabadas y una homografia del plano z = 5 cm; el error crece fuera de ese rango (documentado <2 px hasta 15 cm sobre la mesa). Objetos altos o configuraciones distintas pueden degradar la precision.
- Dominio acotado: entrenado para un Franka FR3 con acciones relativas a 10 Hz y un conjunto limitado de tareas (14 + 6); no es un modelo generalista.
- Posible sobreajuste a los datasets de origen (`yuan1119/many_tasks_rgbdp_10fps_d435if_mu_comp` y `..._d455old_mu_comp`); no se documenta evaluacion fuera de distribucion.
- Riesgo de alucinacion en el sentido de acciones no validas fisicamente: como toda politica de imitacion, puede generar trayectorias fuera del espacio seguro si la observacion se sale de la distribucion de entrenamiento.
- Sin datos de sesgos, idiomas ni comportamiento multilingue: no aplica como LLM, pero tampoco se documenta nada al respecto.
- Repositorio grande (59,8 GB) por la acumulacion de checkpoints cada 10.000 pasos; conviene descargar solo el checkpoint necesario.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/muacha/pi05_franka_relative_10hz_unified
- Modelo base: https://huggingface.co/lerobot/pi05_base
- Dataset D435if: https://huggingface.co/datasets/yuan1119/many_tasks_rgbdp_10fps_d435if_mu_comp
- Dataset D455: https://huggingface.co/datasets/yuan1119/many_tasks_rgbdp_10fps_d455old_mu_comp
- Libreria openpi (referenciada en la model card; URL no proporcionada en la informacion disponible)
- Modulo `openpi.policies.franka_cameras` (referenciado en la model card; URL no proporcionada)
