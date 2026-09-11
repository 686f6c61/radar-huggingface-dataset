# AdenEndure/act_verify_300steps

## Resumen

`AdenEndure/act_verify_300steps` es una politica de robotica (policy) entrenada con el metodo ACT (Action Chunking with Transformers) dentro del framework LeRobot de Hugging Face. No es un modelo de lenguaje: se trata de un modelo de imitacion que consume el estado articular de un robot y dos flujos de imagen de camara, y produce directamente comandos de accion. El autor es el usuario AdenEndure y el modelo esta publicado con licencia Apache 2.0.

El modelo resuelve una tarea concreta de manipulacion: "pick up the black cube and place in the red bowl" (coger el cubo negro y dejarlo en el cuenco rojo). Esta disenado para el robot `so_follower` (familia SO-101) con dos camaras, una superior y otra en la muneca, ambas a 640x480 y 30 FPS. Cuenta con 51.668.614 parametros en formato safetensors, un tamano de repositorio de 0,2 GB y un total de 36.756 fotogramas de entrenamiento repartidos en 52 episodios teleoperados.

Su relevancia es acotada y experimental: el nombre del repositorio (`act_verify_300steps`) y su configuracion de entrenamiento (300 pasos con batch size 2) indican que se trata de una ejecucion de verificacion del pipeline de entrenamiento, no de un checkpoint listo para produccion. La model card no incluye resultados de evaluacion, no tiene descargas ni likes, y las busquedas web realizadas no han devuelto informacion tecnica adicional sobre este modelo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), segun el paper citado en la model card |
| Parametros totales | 51.668.614 |
| Parametros activos | no aplicable (no es un modelo MoE) |
| Longitud de contexto | no aplicable (policy de robotica por pasos de control; no procesa secuencias de texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplicable (la tarea se fija como cadena de texto en la invocacion, no hay comprension de lenguaje libre) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |
| Entradas | `observation.state` `(6,)`; `observation.images.top` `(3, 480, 640)`; `observation.images.wrist` `(3, 480, 640)` |
| Salidas | `action` `(6,)` |
| Tipo de robot | `so_follower` |
| Camaras | `top`, `wrist` |
| Libreria | lerobot |
| Tamano del repositorio | 0,2 GB |

## Arquitectura y entrenamiento

La model card referencia explicitamente ACT (Action Chunking with Transformers, arXiv:2304.13705) como metodo de aprendizaje por imitacion que predice fragmentos cortos de acciones (chunks) en lugar de pasos individuales. El modelo consume dos imagenes RGB de 480x640 junto con un vector de estado de 6 dimensiones y devuelve un vector de accion de 6 dimensiones, lo que corresponde a la configuracion tipica de un brazo manipulador de 6 grados de libertad mas pinza. El detalle interno de capas, dimension de los chunks de accion, atencion y componentes del codificador CVAE no se especifica en la informacion proporcionada.

El entrenamiento se realizo con LeRobot 0.6.2 sobre el dataset `AdenEndure/so101_pendrive_640x480`, compuesto por 52 episodios y 36.756 fotogramas capturados a 30 FPS, todos ellos de la misma tarea. La configuracion registrada es de 300 pasos de optimizacion, batch size 2, optimizador AdamW, learning rate 2e-05 y semilla 1000. Estos valores corresponden a una ejecucion de verificacion muy corta: 300 pasos con batch 2 suponen solo 600 muestras procesadas, una fraccion minima del dataset disponible, por lo que es esperable un ajuste pobre a la tarea. No se documenta uso de RLHF, DPO ni tecnicas de refinamiento posteriores.

## Capacidades

- Control motor por imitacion: genera comandos de accion de 6 dimensiones a partir de observaciones visuales y de estado articular.
- Percepcion multimodal de dos camaras: procesa simultaneamente las vistas `top` y `wrist` a 640x480, ademas del estado del robot.
- Prediccion de chunks de accion: el metodo ACT predice secuencias cortas de acciones en lugar de un unico paso, lo que reduce la acumulacion de error a corto plazo.
- Ejecucion de una tarea de pick-and-place concreta: "pick up the black cube and place in the red bowl".
- Compatibilidad con el ecosistema LeRobot: se ejecuta mediante `lerobot-rollout` y se reentrena mediante `lerobot-train`.
- Soporte de tool calling / function calling: no aplicable.
- Soporte de agentes y razonamiento multi-paso: no aplicable.
- Capacidades multilingues: no aplicable.
- Capacidades especiales (modo thinking, vision generativa, audio): no disponible.

## Casos de uso

- Verificacion de pipelines de entrenamiento: sirve como checkpoint de prueba para comprobar que el flujo `lerobot-train` + subida al Hub funciona de extremo a extremo antes de lanzar entrenamientos largos.
- Reproduccion de la tarea pick-and-place en un SO-101: si el entrenamiento se alargase, el mismo pipeline permitiria ejecutar la tarea "pick up the black cube and place in the red bowl" sobre el robot `so_follower` con las camaras `top` y `wrist`.
- Base para comparativas de hiperparametros: al ser una ejecucion corta con semilla fija (1000), resulta util como referencia de linea base frente a entrenamientos con mas pasos o distinto learning rate.
- Docencia y aprendizaje de aprendizaje por imitacion: el par dataset + policy permite estudiar como se registra teleoperacion a 30 FPS y como se convierte en una policy ejecutable.
- Pruebas de integracion de hardware: valida la cadena de camaras OpenCV, el puerto del robot y las claves de observacion (`observation.images.top`, `observation.images.wrist`) antes de invertir en entrenamientos costosos.
- Evaluacion de robustez del metodo ACT: partiendo de este checkpoint se puede medir la tasa de exito con muy pocos datos y comprobar la sensibilidad del metodo al numero de pasos de entrenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La seccion de evaluacion de la model card indica explicitamente: "No evaluation results have been provided for this policy yet". Las busquedas web realizadas no devolvieron ningun resultado relacionado con este modelo.

## Requisitos de hardware

- VRAM de inferencia: con 51.668.614 parametros, los pesos ocupan aproximadamente 207 MB en fp32 y unos 103 MB en fp16; el consumo real dependera sobre todo de las activaciones de las dos camaras a 640x480 y del tamano del chunk de acciones, dato no disponible.
- GPU recomendadas: no disponible en la informacion proporcionada. La configuracion de ejemplo de LeRobot usa `--policy.device=cuda`, por lo que se asume ejecucion en GPU NVIDIA, sin modelo concreto indicado.
- GPU de consumo: por tamano de parametros, el modelo es compatible con GPU de consumo de gama media o superior; no se especifica ninguna en la documentacion del repositorio.
- CPU: no se documenta soporte ni rendimiento en CPU.
- Opciones de despliegue: LeRobot (`lerobot-rollout` para ejecucion y `lerobot-train` para reentrenamiento), con pesos en safetensors. No hay soporte indicado para vLLM, llama.cpp, Ollama o TGI, que no aplican a una policy de robotica.
- Latencia y throughput: no disponible. El dataset de entrenamiento esta capturado a 30 FPS, lo que marca el ritmo temporal de control esperado, pero no se publica ninguna medicion de latencia de inferencia.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto / observaciones | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| AdenEndure/act_verify_300steps | ACT (imitacion, robotica) | 51.668.614 | 2 camaras 640x480 + estado (6,) | apache-2.0 | Hugging Face, 0 descargas |
| Otras policies ACT publicadas en el Hub | ACT (imitacion, robotica) | no disponible | no disponible | variable | Hugging Face |
| Diffusion Policy | imitacion basada en difusion | no disponible | no disponible | no disponible | no disponible en la informacion proporcionada |
| SmolVLA / pi0 (VLA de LeRobot) | vision-language-action | no disponible | no disponible | no disponible | no disponible en la informacion proporcionada |

La informacion proporcionada no incluye datos de rendimiento de ninguno de estos modelos, por lo que la comparacion se limita a la categoria y al tipo de tarea. No se dispone de cifras de parametros, contexto ni tasas de exito para las alternativas.

## Limitaciones y advertencias

- Entrenamiento de verificacion: 300 pasos con batch size 2 implican un ajuste muy limitado; es previsible que la policy no complete la tarea de forma fiable.
- Sin evaluacion publicada: no existe ninguna tasa de exito medida en robot real, por lo que no se puede afirmar que el modelo funcione.
- Especificidad de tarea y entorno: entrenado unicamente para "pick up the black cube and place in the red bowl" con un `so_follower` y dos camaras concretas; cambios de iluminacion, posiciones, objetos o robot invalidan probablemente el comportamiento.
- Dependencia de la configuracion de camaras: las claves de observacion deben coincidir exactamente con `observation.images.top` y `observation.images.wrist`, con resolucion 640x480.
- Sin sesgos medidos ni analisis de robustez: no hay informacion sobre sesgos, generalizacion ni comportamientos inseguros.
- Riesgo de alucinacion: no aplicable en el sentido de generacion de texto; el riesgo equivalente es la ejecucion de acciones incorrectas o inseguras sobre hardware fisico.
- Licencia: Apache 2.0 permite uso comercial, pero al tratarse de un modelo sobre hardware fisico debe validarse en un entorno controlado antes de cualquier despliegue.
- Cero adopcion: 0 descargas y 0 likes, lo que implica ausencia de validacion por parte de terceros.
- Idiomas: el modelo no procesa lenguaje natural; la cadena de tarea se usa como etiqueta, no como instruccion interpretada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AdenEndure/act_verify_300steps
- Dataset de entrenamiento: https://huggingface.co/datasets/AdenEndure/so101_pendrive_640x480
- Visualizacion del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=AdenEndure/so101_pendrive_640x480
- Paper de ACT referenciado: https://huggingface.co/papers/2304.13705
- Paper de ACT en arXiv: https://arxiv.org/abs/2304.13705
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
- Guia de ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentacion de LeRobot: https://huggingface.co/docs/lerobot/index
- Guia de instalacion de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guia de hardware de LeRobot: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Guia de captura de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia rapida de comandos: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentacion de inferencia: https://huggingface.co/docs/lerobot/main/en/inference
