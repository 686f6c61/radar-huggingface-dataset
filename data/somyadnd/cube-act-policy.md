# SomyaDnD/cube-act-policy

## Resumen

cube-act-policy es una política robótica de aprendizaje por imitación publicada por el usuario SomyaDnD en Hugging Face bajo el identificador `SomyaDnD/cube-act-policy`. Implementa el método Action Chunking with Transformers (ACT), descrito en el artículo arXiv:2304.13705, que predice fragmentos cortos de acciones (action chunks) en lugar de un único paso de control. El modelo se ha entrenado con la librería LeRobot de Hugging Face y está pensado para ejecutarse sobre un robot `so_follower` (tipo SO-100/SO-101) con una única cámara cenital.

La política resuelve una tarea concreta de manipulación: "Pick up the cube and place it in the bin" (coger el cubo y depositarlo en la papelera). Consume el estado del robot (`observation.state`, vector de 6 dimensiones) y una imagen RGB de 480x640 (`observation.images.top`), y produce un vector de acción de 6 dimensiones. El conjunto de datos de entrenamiento, `SomyaDnD/cube-pickplace`, contiene 54 episodios y 23.909 fotogramas grabados a 15 FPS.

Se trata de un modelo pequeño (51.668.614 parámetros, ~0,2 GB de repositorio) orientado a robótica de bajo coste y a experimentación con aprendizaje por imitación. Es relevante para quienes quieran reproducir o adaptar flujos de trabajo de robótica con LeRobot, aunque carece por ahora de resultados de evaluación publicados en su propia model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Action Chunking with Transformers (ACT), transformer para imitacion con prediccion de fragmentos de accion |
| Parametros totales | 51.668.614 |
| Parametros activos | no aplicable (arquitectura densa, no es MoE) |
| Longitud de contexto | no aplicable (politica de control robotico, no modelo de lenguaje) |
| Tipos de cuantizacion | no disponible (no se documentan variantes cuantizadas; pesos distribuidos en safetensors) |
| Idiomas soportados | no disponible (no aplicable, politica robotica) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (libreria lerobot) |

Otros datos: tipo de robot `so_follower`; camaras `top`; entradas `observation.state` (6,), `observation.images.top` (3, 480, 640); salida `action` (6,); tamano del repositorio 0,2 GB; 33 descargas y 0 likes en el momento de la consulta.

## Arquitectura y entrenamiento

La arquitectura es ACT (Action Chunking with Transformers), un metodo de aprendizaje por imitacion que, en lugar de predecir una sola accion por paso, genera un fragmento de acciones (action chunk) a partir de las observaciones. El modelo combina un codificador visual y una politica transformer para emitir secuencias cortas de acciones, lo que reduce el error de composicion y mejora la estabilidad del control segun el articulo de referencia (arXiv:2304.13705). La model card no detalla el numero exacto de capas, cabezas de atencion ni la dimension interna del transformer, por lo que esos datos no estan disponibles.

El entrenamiento se realizo con LeRobot 0.6.2 sobre el dataset `SomyaDnD/cube-pickplace`, compuesto por 54 episodios y 23.909 fotogramas a 15 FPS. La configuracion documentada incluye 20.000 pasos de entrenamiento, tamano de lote 8, optimizador AdamW, tasa de aprendizaje 1e-5 y semilla 1000. No se documenta el uso de RLHF, DPO ni tecnicas de alineacion, algo esperable en una politica de imitacion supervisada. Tampoco se especifica el numero de tokens, la composicion exacta del dataset mas alla de la tarea ni el uso de decodificacion especulativa u otras optimizaciones de inferencia.

## Capacidades

- Control robotico por imitacion: genera comandos de accion de 6 dimensiones para un robot `so_follower` a partir del estado y de una imagen cenital.
- Prediccion de fragmentos de accion (action chunking): emite varios pasos de accion por inferencia, lo que mejora la coherencia temporal del movimiento.
- Percepcion visual de una camara: procesa imagenes RGB de 480x640 (``observation.images.top``).
- Ejecucion de tareas de pick-and-place: entrenado especificamente para la tarea "Pick up the cube and place it in the bin".
- Integracion con LeRobot: se lanza mediante `lerobot-rollout` y se reentrena con `lerobot-train`.
- Soporte de tool calling / function calling: no aplicable (no es un modelo de lenguaje).
- Soporte de agentes y razonamiento multi-paso: no aplicable.
- Capacidades multilingues: no aplicable.
- Capacidades especiales (modo thinking, vision, audio): vision mediante la camara `top`; no dispone de modo de razonamiento explicito ni de audio.

## Casos de uso

- Manipulacion pick-and-place en robot de bajo coste: la politica ejecuta la tarea de coger un cubo y dejarlo en una papelera sobre una plataforma `so_follower`, usando la camara cenital como unica entrada visual.
- Base para experimentos de aprendizaje por imitacion: sirve como punto de partida reproducible para comparar variantes de ACT frente a otros metodos en la misma plataforma LeRobot.
- Reentrenamiento con datos propios: mediante `lerobot-train --policy.type=act` se puede adaptar la politica a nuevas tareas grabando episodios propios a 15 FPS.
- Docencia y prototipado en robotica: por su tamano (51,7 M de parametros, 0,2 GB) es adecuado para laboratorios con hardware modesto que quieran ilustrar un flujo completo de recogida de datos, entrenamiento y despliegue.
- Automatizacion de tareas de clasificacion sencilla: con reentrenamiento, se podria aplicar a depositar objetos en contenedores en entornos controlados y con posiciones de objeto poco variables.
- Validacion de pipelines de LeRobot en CI: se puede usar como politica de referencia para comprobar que la instalacion de LeRobot, la calibracion del robot y las camaras funcionan antes de entrenar modelos mayores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La propia model card indica explicitamente: "No evaluation results have been provided for this policy yet", por lo que no se dispone de tasas de exito, numero de ensayos ni metricas comparativas reales sobre robot.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja. Con 51,7 M de parametros, en FP32 ocupa aproximadamente 207 MB y en FP16 alrededor de 103 MB, sin contar activaciones ni el codificador visual.
- GPU recomendadas: cualquier GPU con CUDA es suficiente; no se requiere A100 ni H100. Una RTX 3060, RTX 4090 o incluso GPUs de gama de entrada son mas que suficientes para la inferencia.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU de consumo actual; tambien es viable ejecutar la inferencia en CPU.
- Opciones de despliegue: LeRobot mediante `lerobot-rollout` sobre PyTorch. Herramientas orientadas a LLM como vLLM, TGI, llama.cpp, Ollama o llama.cpp/GGUF no son aplicables a esta politica.
- Latencia y throughput: no documentados. Como referencia operativa, el dataset se grabo a 15 FPS, por lo que el bucle de control debe sostener esa frecuencia de inferencia o superior.
- Requisitos adicionales: hardware robotico real (robot `so_follower`) y una camara calibrada cuyas claves de observacion coincidan con las usadas en el entrenamiento.

## Comparativa con modelos similares

No se dispone de especificaciones numericas de modelos comparables en la informacion proporcionada, por lo que la comparacion cuantitativa no esta disponible. Como referencia cualitativa, dentro del ecosistema LeRobot existen otras politicas del mismo tipo y modelos mas grandes orientados a vision-lenguaje-accion (VLA), pero no se aportan parametros, contexto, rendimiento ni licencia de esos modelos en los datos disponibles.

| Modelo | Parametros | Tarea | Licencia | Disponibilidad | Datos de rendimiento |
|---|---|---|---|---|---|
| SomyaDnD/cube-act-policy | 51.668.614 | Pick-and-place (cubo a papelera) | apache-2.0 | Hugging Face / LeRobot | no disponible |
| Otras politicas ACT en LeRobot | no disponible | Manipulacion diversa | no disponible | Hugging Face / LeRobot | no disponible |
| Modelos VLA (p. ej. familia SmolVLA/pi0) | no disponible | Manipulacion generalista | no disponible | Hugging Face / LeRobot | no disponible |

Nota: los resultados de la busqueda web realizada no contienen informacion relevante sobre el modelo (se trataba de foros no relacionados), por lo que no aportan datos comparativos.

## Limitaciones y advertencias

- Sesgos conocidos: al entrenarse con un unico dataset (54 episodios de una sola tarea) y un solo tipo de robot, la politica esta fuertemente sesgada hacia esa tarea, ese montaje y esa iluminacion; probablemente falle ante cambios de posicion, distractores o condiciones de luz distintas.
- Riesgo de alucinacion: no aplicable en el sentido de un modelo de lenguaje, pero existe el riesgo de generalizacion incorrecta de acciones fuera de la distribucion de entrenamiento, lo que puede provocar movimientos no deseados en el robot.
- Limitaciones de contexto o idioma: no aplicable (no procesa lenguaje); la unica entrada visual es una camara cenital con resolucion fija 480x640.
- Ausencia de evaluacion: la model card no incluye resultados de exito en robot, por lo que no hay evidencia publicada de su fiabilidad; se recomienda evaluar antes de cualquier uso real.
- Restricciones de licencia: la licencia es apache-2.0, que permite uso comercial, pero el usuario debe verificar el cumplimiento al redistribuir pesos y codigo.
- Requisitos de integracion: las claves de observacion y los nombres de camara deben coincidir exactamente con los del entrenamiento; un desajuste provocara fallos en la ejecucion.
- Caveats para produccion: no hay datos de latencia ni de robustez; una politica de imitacion de este tamano requiere supervision y mecanismos de seguridad fisica en entornos reales.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/SomyaDnD/cube-act-policy
- Dataset de entrenamiento: https://huggingface.co/datasets/SomyaDnD/cube-pickplace
- Articulo ACT (referencia): https://huggingface.co/papers/2304.13705
- Articulo ACT en arXiv: https://arxiv.org/abs/2304.13705
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guia de ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentacion de LeRobot: https://huggingface.co/docs/lerobot/index
- Instalacion de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guia de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Guia de grabacion de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Documentacion de inferencia (rollout): https://huggingface.co/docs/lerobot/main/en/inference
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=SomyaDnD/cube-pickplace
