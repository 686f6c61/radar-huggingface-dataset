# MakinoKF/final_demo_pick_nut_on_scale_20260918_172246_act-policy-v1

# MakinoKF/final_demo_pick_nut_on_scale_20260918_172246_act-policy-v1

## Resumen

Se trata de una politica de robotica basada en ACT (Action Chunking with Transformers), un metodo de aprendizaje por imitacion que predice fragmentos cortos de acciones (chunks) en lugar de pasos individuales. El modelo ha sido entrenado por el usuario MakinoKF y publicado en HuggingFace Hub mediante la libreria LeRobot, con licencia Apache 2.0. Su unico objetivo es ejecutar la tarea "pick the nut" sobre un robot de tipo `so101_enhanced_follower` (variante del SO-101), a partir de observaciones visuales de dos camaras (`top` y `left`) y del estado articular.

El modelo cuenta con 51.668.614 parametros (unos 51,7 M) y un repositorio de 0,2 GB, por lo que es extremadamente ligero en comparacion con los grandes modelos de lenguaje. No procesa texto ni lenguaje natural: es un controlador visuomotor que consume imagenes RGB de 480x640 y un vector de estado de 6 dimensiones, y produce un vector de accion de 6 dimensiones. Su relevancia radica en que es un ejemplo reproducible y de pesos abiertos del flujo completo de LeRobot para entrenar y desplegar politicas de manipulacion roboticas de bajo coste.

Al haber sido entrenado con tan solo 10 pasos de optimizacion sobre un dataset de 80 episodios y 13.495 fotogramas, debe considerarse un modelo experimental o de demostracion mas que una politica lista para produccion. La model card no incluye resultados de evaluacion en robot real.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers): transformer con codificador-decodificador y componente CVAE para aprendizaje por imitacion |
| Parametros totales | 51.668.614 (unos 51,7 M) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de robotica, no procesa secuencias de texto); horizonte de prediccion de chunks no disponible |
| Tipos de cuantizacion | no disponibles (pesos distribuidos en safetensors, presumiblemente fp32) |
| Idiomas soportados | no aplica / no disponible (no procesa lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria LeRobot) |

## Arquitectura y entrenamiento

El modelo implementa ACT, el metodo descrito en el paper de referencia (arXiv:2304.13705). ACT es una politica de aprendizaje por imitacion que, en lugar de predecir una unica accion por paso de tiempo, predice una secuencia o "chunk" de acciones futuras. Esta formulacion reduce el problema de la varianza temporal y mejora la estabilidad en tareas de manipulacion fina. La arquitectura es un transformer con estructura de codificador-decodificador que suele incorporar un codificador variacional condicional (CVAE) para modelar la multimodalidad de las demostraciones humanas, y backbones de vision convolucionales para procesar las imagenes de las camaras.

En cuanto a los datos, la politica se entreno sobre el dataset `MakinoKF/final_demo_pick_nut_on_scale_20260918_172246`, compuesto por 80 episodios, 13.495 fotogramas a 30 FPS y una unica tarea: "pick the nut". La configuracion de entrenamiento registrada en la model card indica 10 pasos de entrenamiento, batch size de 32, optimizador AdamW, tasa de aprendizaje 1e-05 y semilla 1000, todo ello con la version 0.6.0 de LeRobot. No se documenta el uso de RLHF, DPO ni tecnicas de alineacion adicionales, algo esperable en este tipo de politica.

## Capacidades

- Control visuomotor de un robot `so101_enhanced_follower` para la tarea especifica "pick the nut".
- Consumo de dos flujos de imagen (`observation.images.top` y `observation.images.left`) en formato RGB 3x480x640 a 30 FPS.
- Lectura del estado articular del robot como vector de 6 dimensiones (`observation.state`).
- Produccion de un vector de accion continuo de 6 dimensiones (`action`).
- Prediccion de chunks de acciones, lo que permite ejecutar varios pasos de control por inferencia.
- No dispone de tool calling, function calling, soporte de agentes, razonamiento multi-paso en lenguaje ni capacidades multilingues, dado que no es un modelo de lenguaje.
- No incorpora capacidades de vision general (VQA, deteccion, etc.) mas alla de la codificacion visual necesaria para el control; no hay audio.

## Casos de uso

- Automatizacion de pick-and-place de tuercas: la politica puede recoger y colocar tuercas sobre una balanza o superficie, ejecutando la tarea aprendida a partir de las dos camaras montadas sobre el robot.
- Base para fine-tuning en robots SO-101: sirve como punto de partida para reentrenar o ajustar una politica ACT sobre nuevas tareas de manipulacion con el mismo hardware y disposicion de camaras.
- Reproduccion de experimentos de aprendizaje por imitacion: util para replicar el flujo completo de LeRobot (grabacion de datos con teleoperacion, entrenamiento con `lerobot-train` y despliegue con `lerobot-rollout`).
- Demostraciones educativas de robotica: ejemplo didactico de como se estructura una politica ACT, que entradas y salidas maneja y como se ejecuta en hardware real.
- Prototipado rapido de manipulacion de bajo coste: permite validar la viabilidad de una tarea concreta antes de invertir en un dataset mayor o en una politica mas robusta.
- Banco de pruebas de comparacion de politicas: se puede usar como referencia ACT frente a otras politicas de LeRobot (por ejemplo, Diffusion Policy) sobre el mismo conjunto de datos.
- Investigacion en generalizacion posicional: al haber sido entrenada con posiciones y condiciones concretas de la tarea, permite estudiar como se degrada el rendimiento al variar la posicion de la tuerca o la iluminacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye el apartado de evaluacion con la indicacion explicita de que "no evaluation results have been provided for this policy yet", por lo que no se dispone de tasas de exito en robot real ni de metricas comparables.

| Tarea | Ensayos | Exitos | Tasa de exito |
|---|---|---|---|
| pick the nut | no disponible | no disponible | no disponible |

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja, en torno a 1-2 GB, dado que el modelo tiene 51,7 M de parametros (aproximadamente 0,2 GB en fp32) y procesa dos imagenes de 480x640.
- GPU recomendadas: cualquier GPU con soporte CUDA y al menos 2-4 GB de VRAM es suficiente; las tarjetas de gama alta (A100, H100) son innecesarias, y una RTX 3060 o superior es mas que suficiente.
- Compatibilidad con GPU de consumo: si, cabe holgadamente en practicamente cualquier GPU de consumo moderna (RTX 20/30/40 series, incluso modelos de gama de entrada) e incluso en CPU, aunque en CPU la latencia a 30 FPS puede no ser suficiente para control en tiempo real.
- Opciones de despliegue: LeRobot mediante el comando `lerobot-rollout` con `--policy.path=MakinoKF/final_demo_pick_nut_on_scale_20260918_172246_act-policy-v1`; el backend es PyTorch (dispositivo CUDA recomendado). No se documenta soporte para vLLM, llama.cpp, Ollama o TGI, que no aplican a este tipo de modelo.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada; la prediccion por chunks reduce la frecuencia de inferencia necesaria frente al control paso a paso, y las camaras se configuran a 30 FPS.

## Comparativa con modelos similares

No se dispone de datos de rendimiento de este modelo ni de otros comparables en la informacion proporcionada, por lo que la comparacion se limita a caracteristicas estructurales. En el ecosistema LeRobot existen otras familias de politicas con las que es directamente comparable.

| Modelo | Metodo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (ACT, `so101_enhanced_follower`) | ACT | 51,7 M | no aplica | Apache 2.0 | HuggingFace Hub |
| Politicas ACT genericas de LeRobot | ACT | variable segun configuracion | no aplica | normalmente Apache 2.0 | HuggingFace Hub / LeRobot |
| Diffusion Policy (LeRobot) | Diffusion Policy | variable, no disponible | no aplica | habitualmente Apache 2.0 | HuggingFace Hub / LeRobot |

Los datos de rendimiento comparativo, parametros exactos de las alternativas y contexto no estan disponibles en la informacion proporcionada.

## Limitaciones y advertencias

- Entrenamiento muy corto: solo 10 pasos de optimizacion sobre 13.495 fotogramas, lo que sugiere un modelo probablemente infratentrenado o una ejecucion de prueba; el rendimiento real es incierto.
- Sin evaluacion: no se han publicado tasas de exito ni pruebas en robot real, por lo que no hay evidencia empirica de que la tarea se complete de forma fiable.
- Tarea unica: la politica solo esta entrenada para "pick the nut"; no generaliza a otras tareas sin reentrenamiento.
- Especificidad de hardware: depende del tipo de robot `so101_enhanced_follower` y de la disposicion exacta de las camaras `top` y `left`; usar otra configuracion invalida el modelo.
- Riesgo de sobreajuste y de alucinacion motora: al aprender de pocos episodios y con pocas actualizaciones, puede memorizar trayectorias y fallar ante cambios de posicion, iluminacion o presencia de distractores.
- Sensibilidad al entorno: no se documenta robustez frente a variaciones de iluminacion, fondo u objetos distintos.
- Sin capacidades de lenguaje: no procesa instrucciones en texto, no soporta tool calling ni agentes, y no tiene capacidades multilingues.
- Licencia: Apache 2.0, permisiva para uso comercial, pero el autor no ofrece garantias de funcionamiento ni soporte.
- Madurez: 0 descargas y 0 likes en el momento de la consulta, lo que indica que no ha sido validado por la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/MakinoKF/final_demo_pick_nut_on_scale_20260918_172246_act-policy-v1
- Dataset de entrenamiento: https://huggingface.co/datasets/MakinoKF/final_demo_pick_nut_on_scale_20260918_172246
- Visualizacion del dataset en LeRobot: https://huggingface.co/spaces/lerobot/visualize_dataset?path=MakinoKF/final_demo_pick_nut_on_scale_20260918_172246
- Paper de ACT (Action Chunking with Transformers): https://huggingface.co/papers/2304.13705 (arXiv:2304.13705)
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guia de ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentacion de LeRobot: https://huggingface.co/docs/lerobot/index
- Guia de instalacion de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guia de hardware de LeRobot: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Guia de inferencia y rollout de LeRobot: https://huggingface.co/docs/lerobot/main/en/inference

Nota: la busqueda web realizada no devolvio resultados relevantes para este modelo; los enlaces obtenidos correspondian a productos de mobiliario de oficina sin relacion con la robotica y se han descartado.
