# Fork123/pi0_220eps_ExpertOnlyFalse_strat_seed1000

## Resumen

`Fork123/pi0_220eps_ExpertOnlyFalse_strat_seed1000` es un fine-tune del modelo fundacional de robotica π₀ (Pi0) de Physical Intelligence, adaptado mediante la libreria LeRobot de Hugging Face. Se trata de una politica Vision-Language-Action (VLA) generalista que recibe observaciones visuales multimodales (tres camaras) y un estado proprioceptivo de 6 dimensiones, y emite comandos de accion tambien de 6 dimensiones para un robot tipo `so_follower` (familia SO-100/SO-101). El modelo base es `lerobot/pi0_base`, sobre el que se ha realizado un ajuste fino supervisado con 220 episodios de demostracion.

El modelo resuelve una tarea concreta y muy acotada: "Press the red glow button" (pulsar el boton rojo luminoso). Con 4.028 millones de parametros (aproximadamente 4.000 M) y un repositorio de 8,9 GB en formato safetensors, es un modelo de gran tamano para el estandar de politicas de imitacion, lo que refleja la herencia del backbone VLA de Pi0. La relevancia actual radica en que ejemplifica el flujo de trabajo de ajuste fino de modelos fundacionales roboticos con LeRobot 0.6.2, permitiendo a desarrolladores reproducir el pipeline completo de grabacion de datos, entrenamiento y despliegue en hardware de bajo coste.

La ficha describe exclusivamente la informacion publicada en la model card y los metadatos del repositorio. No se han publicado resultados de evaluacion en robot real ni benchmarks estandar, por lo que las secciones correspondientes se limitan a indicar la ausencia de datos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA) basada en π₀ (Pi0); implementacion LeRobot/OpenPI |
| Parametros totales | 4.028.019.472 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors sin cuantizar) |
| Idiomas soportados | no disponible (las instrucciones de tarea se proporcionan en texto; el modelo card no declara cobertura linguistica) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Modelo base | lerobot/pi0_base |
| Libreria | lerobot 0.6.2 |
| Tipo de robot | so_follower |
| Camaras de entrada | wrist, front, top (left_wrist_0_rgb, base_0_rgb, right_wrist_0_rgb) |
| Dimension de estado | (6,) |
| Dimension de accion | (6,) |
| Tamano del repositorio | 8,9 GB |
| Dataset de entrenamiento | Fork123/Test3-4-220eps-Merged-Optimized-Edgecam (220 episodios, 50.568 frames, 30 FPS) |
| Tarea entrenada | "Press the red glow button" |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura π₀ de Physical Intelligence, una politica VLA que combina un backbone vision-lenguaje con un cabezal de accion, implementada en LeRobot a partir del repositorio OpenPI. La politica consume tres flujos visuales (`observation.images.left_wrist_0_rgb` a 480×640, `observation.images.base_0_rgb` y `observation.images.right_wrist_0_rgb` a 360×640), un vector de estado de 6 dimensiones y una instruccion en lenguaje natural, y produce un vector de accion de 6 dimensiones. No se detalla en la model card la composicion interna del backbone, el numero de capas ni el mecanismo exacto de fusion vision-lenguaje-accion.

El ajuste fino se realizo sobre `lerobot/pi0_base` con 12.000 pasos de entrenamiento, batch size 32, optimizador AdamW y learning rate 2,5e-05, con semilla 1000 y LeRobot 0.6.2. El dataset contiene 220 episodios y 50.568 frames a 30 FPS, orientados exclusivamente a la tarea de pulsar un boton rojo luminoso. No se especifica en la informacion disponible si hubo RLHF, DPO ni tecnicas de alineacion adicionales; se trata de aprendizaje por imitacion supervisado. El nombre del repositorio sugiere una variante estratificada (`strat`) con `ExpertOnlyFalse`, pero la model card no documenta el significado de esos modificadores.

## Capacidades

- Control roboticode extremo a extremo: genera acciones de 6 dimensiones para un robot `so_follower` a partir de observaciones visuales y de estado.
- Percepcion visual multimodal: procesa simultaneamente tres camaras (muneca izquierda, frontal/base y muneca derecha) con resoluciones de 480×640 y 360×640.
- Condicionamiento por instruccion en lenguaje natural: acepta una tarea textual (`--task="Press the red glow button"`) que guia la politica.
- Aprendizaje por imitacion: reproduce comportamientos demostrados en el dataset de entrenamiento.
- Ejecucion en bucle cerrado: el script `lerobot-rollout` ejecuta la politica de forma continua durante una duracion configurable.
- No se declaran capacidades de tool calling, function calling, razonamiento multi-paso, agentes, thinking mode, vision general, audio ni generacion de texto libre; el modelo es una politica robotica, no un LLM conversacional.

## Casos de uso

- Automatizacion de pulsacion de botones en lineas de montaje: el modelo ejecuta la tarea "Press the red glow button" sobre un `so_follower`, adecuado para pruebas de concepto de manipulacion repetitiva con un solo objetivo visual bien definido.
- Validacion de pipelines de imitation learning: sirve como referencia reproducible (semilla 1000, 12.000 pasos, hiperparametros documentados) para comparar configuraciones de entrenamiento en LeRobot 0.6.2.
- Prototipado de robots de bajo coste: al estar pensado para la familia SO-100/SO-101 y camaras OpenCV estandar, permite montar un banco de pruebas economico con tres camaras USB.
- Investigacion en VLA: punto de partida para estudiar el efecto del ajuste fino sobre `lerobot/pi0_base` en tareas de un solo objetivo y evaluar transferencia a variaciones de iluminacion o posicion.
- Docencia y formacion: ejemplo completo del flujo `lerobot-train` → `lerobot-rollout` con un dataset pequeno (220 episodios) y una tarea verificable visualmente.
- Generacion de datos sinteticos de evaluacion: el modelo puede emplearse para producir trayectorias de referencia que luego se comparan con las de otros fine-tunes del mismo modelo base.
- Pruebas de integracion en CI de roboticа: al ser un repositorio safetensors de 8,9 GB con licencia Apache 2.0, puede descargarse y ejecutarse en entornos de integracion con GPU para verificar que el pipeline de inferencia no se rompe entre versiones de LeRobot.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye una seccion de evaluacion con la nota explicita: "No evaluation results have been provided for this policy yet." No se dispone de tasas de exito en robot real, ni de metricas de error de accion, ni de comparaciones con otras politicas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Con 4.028 M de parametros, en FP16/BF16 el peso ronda los 8 GB, por lo que se necesita una GPU con al menos 12-16 GB de VRAM para margen de activaciones y buffers de imagen; en FP32 serian aproximadamente 16 GB solo de pesos.
- GPU recomendadas: no especificadas por el autor. Por tamano, una RTX 4090 (24 GB), A100 (40/80 GB) o H100 (80 GB) son opciones seguras; una RTX 3090/4080 (16-24 GB) podria ser suficiente en BF16.
- Cabe en GPU de consumo: previsiblemente si en RTX 4090 y RTX 3090 en BF16; en GPUs de 8 GB no cabria sin cuantizacion, y no se documentan pesos cuantizados.
- Opciones de despliegue: LeRobot (`lerobot-rollout` con `--policy.path`), que internamente usa el stack de OpenPI. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de politica.
- Latencia y throughput: no disponibles. El dataset esta grabado a 30 FPS y las camaras se configuran a 30 FPS, lo que sugiere que el bucle de control debe sostener esa frecuencia, pero no se publican mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Fork123/pi0_220eps_ExpertOnlyFalse_strat_seed1000 | 4.028 M | no disponible | Pulsar boton rojo (so_follower) | Apache 2.0 | Hugging Face, 25 descargas |
| lerobot/pi0_base | no disponible en la informacion | no disponible | Politica VLA generalista | no disponible en la informacion | Hugging Face (modelo base) |
| Otras politicas LeRobot (p. ej. ACT, Diffusion Policy) | no disponible en la informacion | no disponible | Imitation learning | no disponible en la informacion | Hugging Face / LeRobot |

No se dispone de datos de rendimiento comparables entre estas opciones en la informacion proporcionada. La comparacion se limita a la relacion de dependencia (este modelo es un fine-tune de `lerobot/pi0_base`) y al ecosistema comun (LeRobot).

## Limitaciones y advertencias

- Sobreajuste a una unica tarea: el dataset contiene exclusivamente la instruccion "Press the red glow button"; es previsible un rendimiento pobre fuera de esa tarea y de la configuracion de camaras y robot empleada.
- Sin evaluacion publicada: no hay tasas de exito ni validacion en robot real, por lo que no puede recomendarse para produccion sin una evaluacion propia.
- Dependencia de hardware concreto: entrenado para `so_follower` con camaras `left_wrist_0_rgb`, `base_0_rgb` y `right_wrist_0_rgb`; cambiar nombres, indices o resoluciones de camara puede invalidar la politica.
- Riesgo de sobreajuste al entorno: 220 episodios y 50.568 frames son un volumen limitado; cambios de iluminacion, posicion del boton o fondo pueden degradar el comportamiento.
- Sesgos: no documentados por el autor; al derivar de un modelo base entrenado con datos no especificados, pueden persistir sesgos visuales o de instruccion no caracterizados.
- Alucinacion en el sentido de acciones no validas: como politica de imitacion, puede generar trayectorias plausibles pero fisicamente incorrectas fuera de la distribucion de entrenamiento.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantias ni soporte; conviene revisar la licencia del modelo base `lerobot/pi0_base` y de los datos de entrenamiento antes de un despliegue comercial.
- Idiomas: no se declara cobertura linguistica; las instrucciones en lenguaje natural distintas del ingles no estan validadas.
- Nomenclatura del repositorio: los modificadores `ExpertOnlyFalse` y `strat` no estan documentados, lo que dificulta interpretar las diferencias respecto a otros fine-tunes del mismo autor.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Fork123/pi0_220eps_ExpertOnlyFalse_strat_seed1000
- Modelo base: https://huggingface.co/lerobot/pi0_base
- Dataset de entrenamiento: https://huggingface.co/datasets/Fork123/Test3-4-220eps-Merged-Optimized-Edgecam
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=Fork123/Test3-4-220eps-Merged-Optimized-Edgecam
- Blog de π₀ (Physical Intelligence): https://www.physicalintelligence.company/blog/pi0
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guia de LeRobot para pi0: https://huggingface.co/docs/lerobot/main/en/pi0
- Documentacion de LeRobot: https://huggingface.co/docs/lerobot/index
- Instalacion de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guia de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabacion de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia rapida de CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentacion de inferencia/rollout: https://huggingface.co/docs/lerobot/main/en/inference
