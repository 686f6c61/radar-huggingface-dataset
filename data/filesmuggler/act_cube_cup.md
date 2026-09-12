# filesmuggler/act_cube_cup

## Resumen

`filesmuggler/act_cube_cup` es una política de robótica entrenada mediante aprendizaje por imitación con el método ACT (Action Chunking with Transformers), publicado en el artículo arXiv:2304.13705 y descrito como una técnica que predice fragmentos cortos de acciones (*action chunks*) en lugar de pasos individuales. El modelo lo publica el usuario `filesmuggler` en HuggingFace Hub utilizando LeRobot 0.6.2, la librería de HuggingFace para aprendizaje automático en robótica real. Se trata, por tanto, de un checkpoint de política entrenado para una tarea concreta y no de un modelo de lenguaje ni de un modelo multimodal de propósito general.

La política consume el estado del robot (vector de 6 dimensiones) y dos flujos de imagen RGB de 480×640 píxeles procedentes de dos cámaras (`top` y `wrist`), y produce como salida un vector de acción de 6 dimensiones para un brazo seguidor del tipo `so_follower`. El entrenamiento se realizó sobre el dataset `filesmuggler/experiment-cube-cup-100-l_diagonal-full`, compuesto por 99 episodios y 29.432 fotogramas grabados a 30 FPS, con la tarea única "Grab the cube and put it in the cup".

La relevancia de esta ficha es acotada: se trata de una política de imitación de 51.668.614 parámetros, con licencia Apache-2.0 y sin métricas de evaluación publicadas. Es útil como ejemplo reproducible del flujo *end-to-end* de LeRobot (grabación de datos con teleoperación, entrenamiento y despliegue en robot real), pero su ámbito de aplicación está restringido a la tarea, el robot y la configuración de cámaras con los que fue entrenada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), transformer con encoder-decoder y CVAE segun el articulo arXiv:2304.13705; configuracion concreta no disponible en la model card |
| Parametros totales | 51.668.614 |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje; opera sobre ventanas de observacion y predice *chunks* de acciones) |
| Tipos de cuantizacion | no disponible (solo se publican pesos en safetensors) |
| Idiomas soportados | no aplica (politica robotica; no procesa lenguaje natural, solo una cadena de tarea) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |
| Tamano del repositorio | 0,2 GB |
| Tipo de robot | `so_follower` |
| Camaras | `top`, `wrist` |
| Entradas | `observation.state` STATE `(6,)`; `observation.images.top` VISUAL `(3, 480, 640)`; `observation.images.wrist` VISUAL `(3, 480, 640)` |
| Salidas | `action` ACTION `(6,)` |
| Libreria | LeRobot 0.6.2 |
| Fecha de creacion en el Hub | 2026-09-11 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El metodo ACT, descrito en el articulo referenciado en la model card (arXiv:2304.13705), es un enfoque de aprendizaje por imitacion que predice secuencias cortas de acciones en lugar de una accion por paso de control. El objetivo declarado por el autor es reducir el problema de la prediccion de acciones individuales y mejorar las tasas de exito en tareas de manipulacion aprendidas a partir de datos de teleoperacion. La model card no detalla la configuracion interna (numero de capas, dimensiones de atencion, tamano del *chunk* de acciones ni hiperparametros del CVAE), por lo que esos datos no estan disponibles.

En cuanto al entrenamiento, la ficha documenta 40.000 pasos con un tamano de lote de 16, optimizador AdamW, tasa de aprendizaje 1e-5 y semilla 1000, ejecutado con LeRobot 0.6.2 sobre el dataset `filesmuggler/experiment-cube-cup-100-l_diagonal-full`. Ese dataset contiene 99 episodios, 29.432 fotogramas a 30 FPS y una unica tarea: "Grab the cube and put it in the cup". No se indica si hubo fases de RLHF, DPO o ajuste posterior; en el contexto de ACT el entrenamiento es puramente de imitacion supervisada sobre demostraciones teleoperadas.

## Capacidades

- Generacion de acciones de control de 6 grados de libertad para un brazo `so_follower` a partir de observaciones de estado y de dos imagenes.
- Ejecucion de una tarea de manipulacion concreta: coger un cubo y depositarlo en un vaso.
- Aprendizaje por imitacion a partir de demostraciones teleoperadas (no requiere recompensa ni simulador durante el entrenamiento).
- Prediccion de *action chunks* segun el metodo ACT, lo que segun el articulo de referencia suele traducirse en trayectorias mas suaves y en mejores tasas de exito que la prediccion paso a paso.
- Integracion con el ecosistema LeRobot: comandos `lerobot-rollout` para despliegue y `lerobot-train` para reentrenamiento o ajuste.
- Uso concurrente de dos camaras (`top` y `wrist`) sincronizadas a 30 FPS.
- No soporta *tool calling*, ni *function calling*, ni razonamiento multi-paso en el sentido de los modelos de lenguaje.
- No se documentan capacidades multilingues, de vision general, de audio ni modos de razonamiento explicito.

## Casos de uso

- Reproduccion de la tarea "cube in cup" en un banco de pruebas de robotica de bajo coste: la politica esta entrenada especificamente para esa tarea sobre un brazo `so_follower`, por lo que es directamente desplegable en ese hardware mediante `lerobot-rollout`.
- Docencia y formacion en aprendizaje por imitacion: sirve como ejemplo completo del flujo de LeRobot, desde la grabacion de teleoperaciones a 30 FPS hasta el entrenamiento con AdamW y el despliegue en robot real.
- Comparacion de metodos de imitacion: puede utilizarse como referencia ACT frente a otras politicas (por ejemplo, Diffusion Policy o SmolVLA) sobre el mismo montaje fisico y el mismo dataset de 99 episodios.
- Base para *fine-tuning* en variantes de la misma tarea: al estar entrenada con 29.432 fotogramas sobre una tarea unica, es un punto de partida razonable para ajustar posiciones de objeto, iluminacion o un brazo del mismo tipo.
- Validacion de una canalizacion de datos (pipeline) de robotica: permite comprobar la integracion de camaras OpenCV a 640×480, la calibracion del robot y la sincronizacion de observaciones antes de invertir en grabaciones mayores.
- Investigacion en generalizacion y robustez: el checkpoint permite medir como se degrada el exito al cambiar la posicion inicial del cubo, el color del vaso o la iluminacion, dado que el autor no aporta resultados de evaluacion.
- Prototipado de automatizacion simple de *pick-and-place* en laboratorio, siempre que se reutilice exactamente el mismo montaje de camaras (`top` y `wrist`) y el mismo tipo de robot.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye un apartado de evaluacion con la nota literal "No evaluation results have been provided for this policy yet", por lo que no se dispone de tasas de exito, numero de ensayos ni condiciones de prueba.

## Requisitos de hardware

- VRAM estimada para inferencia: no documentada. Como referencia aritmetica, 51.668.614 parametros en punto flotante de 32 bits ocupan aproximadamente 207 MB, a lo que hay que sumar las activaciones de dos imagenes de 3×480×640 y el estado del robot; una estimacion prudente seria del orden de 0,5 a 1 GB de VRAM.
- GPU recomendadas: no especificadas por el autor. Por tamano del modelo cabe en cualquier GPU de consumo moderna con al menos 2 GB de VRAM; una RTX 3060, RTX 4060 o superior seria suficiente en la practica.
- Cabe en GPU de consumo: si, segun el calculo anterior, aunque el dato no esta confirmado por el autor.
- Opciones de despliegue: LeRobot (`lerobot-rollout` para ejecutar la politica y `lerobot-train` para reentrenar), con `--policy.device=cuda` para GPU. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no son aplicables a una politica robotica de este tipo.
- Latencia y throughput estimados: no disponibles. El unico dato temporal es que los datos de entrenamiento se grabaron a 30 FPS, lo que sugiere que el bucle de control objetivo opera en ese orden de frecuencia, pero el autor no publica latencias medidas.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto / chunk | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `filesmuggler/act_cube_cup` | ACT (imitacion, robot real) | 51.668.614 | *chunk* de acciones no disponible en la model card | Apache-2.0 | HuggingFace Hub, 0 descargas |
| ACT de referencia (arXiv:2304.13705) | ACT (imitacion, bimanual de bajo coste) | no disponible | no disponible | no disponible | publicacion cientifica |
| Diffusion Policy | politica de difusion para imitacion | no disponible | no disponible | no disponible | publicacion cientifica y repositorio |
| SmolVLA | VLA compacto de LeRobot | no disponible | no disponible | no disponible | HuggingFace Hub |

No se dispone de datos de rendimiento comparables entre estas alternativas en la informacion proporcionada; la comparacion se limita al tipo de metodo y a la licencia del checkpoint analizado.

## Limitaciones y advertencias

- Tarea unica: la politica solo ha sido entrenada para "Grab the cube and put it in the cup"; no se documenta ninguna otra habilidad.
- Dataset reducido y sin diversidad declarada: 99 episodios y 29.432 fotogramas de un unico montaje, lo que limita la generalizacion a nuevas posiciones de objeto, iluminaciones o distractores.
- Dependencia del hardware exacto: el modelo espera un robot `so_follower` y dos camaras denominadas `top` y `wrist` a 640×480 y 30 FPS. Cualquier discrepancia en nombres de claves de observacion, calibracion o indice de camara invalida el despliegue.
- Ausencia total de evaluacion: no hay tasa de exito, numero de ensayos ni condiciones de prueba, por lo que no es posible estimar su fiabilidad en produccion.
- Riesgo de sobreajuste: con 40.000 pasos y 99 episodios, no se documenta regularizacion, *augmentation* ni validacion cruzada.
- Sin datos de sesgo: no se han publicado analisis de sesgo ni de comportamiento fuera de distribucion.
- Riesgo de alucinacion: no aplica en el sentido de los modelos de lenguaje, pero si existe riesgo de acciones incoherentes o inseguras cuando la observacion se aleja de la distribucion de entrenamiento, algo critico en un brazo robotico fisico.
- Sin soporte multilingue ni de lenguaje natural: la unica entrada textual es la cadena de tarea, que debe coincidir con la usada en el entrenamiento.
- Licencia Apache-2.0: permite uso comercial y modificacion con atribucion, pero el autor no ofrece garantias ni soporte.
- Metadatos anomalos: las fechas de creacion y actualizacion del repositorio (2026-09-11) son posteriores a la fecha habitual de publicacion de LeRobot 0.6.2, por lo que conviene verificar la procedencia del checkpoint antes de usarlo en un entorno real.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/filesmuggler/act_cube_cup
- Dataset de entrenamiento: https://huggingface.co/datasets/filesmuggler/experiment-cube-cup-100-l_diagonal-full
- Visualizacion del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=filesmuggler/experiment-cube-cup-100-l_diagonal-full
- Articulo de ACT: https://huggingface.co/papers/2304.13705
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
- Guia de ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentacion de LeRobot: https://huggingface.co/docs/lerobot/index
- Guia de instalacion de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guia de hardware de LeRobot: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Guia de grabacion y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia de comandos de LeRobot: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentacion de inferencia y *rollout*: https://huggingface.co/docs/lerobot/main/en/inference
