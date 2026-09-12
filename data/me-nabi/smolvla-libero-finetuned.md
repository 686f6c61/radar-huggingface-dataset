# me-nabi/smolvla-libero-finetuned

## Resumen

me-nabi/smolvla-libero-finetuned es un ajuste fino (fine-tune) del modelo base lerobot/smolvla_base, un modelo vision-lenguaje-accion (VLA) compacto desarrollado por el equipo de LeRobot de Hugging Face. Este ajuste concreto ha sido entrenado por el usuario me-nabi sobre el conjunto de datos lerobot/libero y esta especializado en un robot Franka Panda con dos camaras y una tarea de manipulacion concreta: recibe dos imagenes RGB de 256x256 y un vector de estado del robot de 8 dimensiones, y produce un vector de accion de 7 dimensiones.

El modelo cuenta con 450.046.176 parametros (aproximadamente 450 millones) y se distribuye bajo licencia Apache 2.0 en formato safetensors, con un repositorio de 6,6 GB. La propuesta de SmolVLA es ofrecer una politica de control robótico que alcance un rendimiento competitivo con un coste computacional reducido, de forma que pueda desplegarse en hardware de consumo en lugar de requerir clústeres de GPU de gama alta.

Su relevancia actual radica en que es un ejemplo representativo del paradigma VLA aplicado a la robotica de imitacion: en lugar de programar el comportamiento explicitamente, se entrena una politica que mapea observaciones (vision y propiocepcion) a acciones. Este ajuste concreto cubre 40 tareas de manipulacion del benchmark LIBERO, todas ellas en entornos de cocina y escritorio, pero no ha publicado resultados de evaluacion propios ni cuenta con descargas o validacion de la comunidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-lenguaje-accion (VLA) para robotica; politica de imitacion entrenada con LeRobot |
| Parametros totales | 450.046.176 (segun safetensors) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (los pesos se distribuyen en safetensors; no se documentan variantes GGUF o cuantizadas) |
| Idiomas soportados | No disponible (no es un modelo de lenguaje de proposito general; no procesa ni genera texto) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (libreria lerobot) |
| Modelo base | lerobot/smolvla_base |
| Tipo de robot | panda (Franka Emika Panda) |
| Camaras | image, image2 |
| Entradas | observation.images.image (3, 256, 256), observation.images.image2 (3, 256, 256), observation.state (8,) |
| Salidas | action (7,) |
| Tamano del repositorio | 6,6 GB |
| Versión de LeRobot | 0.6.1 |

## Arquitectura y entrenamiento

Se trata de una politica de imitacion basada en un modelo vision-lenguaje-accion (VLA), la familia de arquitecturas descrita en el paper referenciado por el autor (arXiv:2506.01844). El modelo consume observaciones multimodales (dos flujos de imagen de 256x256 píxeles y un vector de estado del robot de 8 componentes) y emite un vector de accion de 7 dimensiones, que en un brazo Panda corresponde tipicamente a una pose de efector final mas el estado del gripper. La informacion proporcionada no detalla la composicion interna de la red (backbone de vision-lenguaje, modulo de accion, mecanismo de difusion o flow matching), por lo que esos detalles se consideran no disponibles.

El entrenamiento se realizo sobre el dataset lerobot/libero, compuesto por 1693 episodios y 273.465 fotogramas grabados a 10 FPS, lo que equivale a unos 27.346 segundos (aproximadamente 7,6 horas) de demostraciones. Las 40 tareas cubiertas son de manipulacion de objetos cotidianos: colocar tazas y platos, introducir objetos en una cesta, abrir y cerrar cajones y microondas, encender el fuego y colocar la cafetera, entre otras. La configuracion de entrenamiento declarada es de 25.000 pasos, tamano de lote 4, optimizador AdamW, tasa de aprendizaje 0,0001 y semilla 1000.

No se documenta en la informacion proporcionada el uso de RLHF, DPO ni tecnicas de alineacion, algo esperable en un modelo de control robótico donde el objetivo es reproducir la distribucion de acciones de las demostraciones. La innovacion diferencial del modelo base es su tamano reducido (450 millones de parametros) frente a otras politicas VLA de miles de millones de parametros, lo que habilita el despliegue en hardware de consumo.

## Capacidades

- Control robótico por imitacion: genera comandos de accion de 7 dimensiones a partir de dos imagenes y del estado del robot, en bucle cerrado.
- Manipulacion de un brazo Franka Panda en 40 tareas especificas de LIBERO (colocar, apilar, abrir, cerrar, encender y organizar objetos).
- Percepcion visual dual: procesa simultaneamente dos camaras RGB de 256x256, lo que permite estimar profundidad relativa y desambiguar objetos.
- Fusion de vision y propiocepcion: combina las imagenes con el vector de estado de 8 dimensiones del robot para condicionar la accion.
- Ejecucion en hardware de consumo: disenado explicitamente para desplegarse en GPUs de gama media o baja.
- Integracion con el ecosistema LeRobot: entrenamiento, evaluacion y despliegue mediante las herramientas oficiales (`lerobot-rollout` y los comandos `lerobot-*`).
- No soporta generacion de texto, razonamiento simbolico, codigo, matematicas ni conversacion.
- No soporta tool calling ni function calling.
- No soporta orquestacion de agentes ni razonamiento multi-paso explicito.
- No es multilingue: no procesa lenguaje natural como entrada ni salida.
- No dispone de modo de razonamiento (thinking mode), audio ni otras capacidades multimodales mas alla de la vision.

## Casos de uso

- Evaluacion comparativa de politicas VLA: el modelo sirve como referencia reproducible en el benchmark LIBERO, permitiendo medir tasas de exito por tarea y comparar arquitecturas con el mismo conjunto de datos y el mismo robot.
- Punto de partida para ajuste fino en un Panda propio: al partir de smolvla_base y estar ya adaptado a LIBERO, se puede reentrenar con datos propios de un laboratorio y reducir el numero de episodios necesarios para alcanzar un comportamiento util.
- Prototipado rapido de pick-and-place en laboratorio: con dos camaras RGB y un Panda, el modelo puede ejecutar tareas como colocar un bol sobre un plato o introducir objetos en una cesta sin necesidad de programar trayectorias explicitas.
- Investigacion en aprendizaje por imitacion: permite estudiar el efecto del numero de episodios, la frecuencia de control y la configuracion de camaras en la tasa de exito, usando una politica de 450 millones de parametros en lugar de modelos de miles de millones.
- Despliegue en entornos de bajos recursos: al caber en GPUs de consumo, es viable montar una celda robotica de bajo coste con inferencia local, sin depender de servicios en la nube ni de latencia de red.
- Docencia y formacion en robotica: el flujo completo de LeRobot (grabar datos, entrenar, desplegar) es replicable en un curso con hardware asequible, y este repositorio sirve como ejemplo de politica ya entrenada.
- Validacion de pipelines de datos: sirve para comprobar que un pipeline de recogida de datos (resolucion, FPS, numero de camaras) produce observaciones compatibles con el formato esperado por LeRobot.
- Automatizacion de tareas de organizacion en entornos controlados: apilado, reubicacion y apertura de contenedores en escenarios de cocina simulados o de laboratorio con condiciones de iluminacion estables.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio no incluye tasas de exito por tarea, comparaciones con otras politicas ni curvas de evaluacion en LIBERO. El unico dato cuantitativo de rendimiento indirecto es la frecuencia de grabacion del conjunto de datos (10 FPS), que marca el orden de magnitud de la frecuencia de control esperada durante la inferencia.

## Requisitos de hardware

- VRAM estimada para inferencia (calculo a partir del numero de parametros, no confirmado por el autor): en bf16/fp16, los pesos ocupan aproximadamente 0,9 GB; en fp32, unos 1,8 GB. Sumando activaciones de los dos codificadores visuales y de los tensores intermedios, una estimacion prudente es de 2 a 4 GB de VRAM.
- GPU recomendadas: cualquier GPU con al menos 6-8 GB de VRAM. Son suficientes una RTX 3060 de 12 GB, una RTX 4060 Ti, una RTX 4090 o una RTX 3090. Las GPU de centro de datos (A100, H100, L40S) no son necesarias para inferencia, aunque aceleran el reentrenamiento.
- Viabilidad en GPU de consumo: si, es uno de los objetivos declarados del modelo base. Cabe en practicamente cualquier GPU moderna de gama media.
- Inferencia en CPU: tecnicamente posible, pero con latencias muy superiores a los 100 ms por paso, incompatibles con un bucle de control a 10 FPS.
- Opciones de despliegue: LeRobot (`lerobot-rollout` con `--policy.path`), junto con PyTorch. No se documenta soporte para vLLM, TGI, llama.cpp, Ollama ni formatos GGUF, ya que no es un modelo de lenguaje.
- Almacenamiento: el repositorio ocupa 6,6 GB, un tamano superior al de los pesos puros (0,9 GB en bf16), lo que sugiere que incluye estados de optimizador o puntos de control intermedios.
- Latencia y throughput: no disponibles. No se han publicado mediciones de tiempo de inferencia ni de frecuencia de control alcanzada en hardware concreto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| me-nabi/smolvla-libero-finetuned | 450 M | No disponible | apache-2.0 | Hugging Face, 0 descargas | Ajuste fino sobre LIBERO, robot Panda, 40 tareas |
| lerobot/smolvla_base | 450 M (mismo tamano de arquitectura) | No disponible | apache-2.0 | Hugging Face, modelo base oficial | Modelo base sin especializar; el ajuste parte de el |
| Otras familias VLA (OpenVLA, pi0, GR00T N1) | No disponible | No disponible | No disponible | No disponible | No se dispone de datos verificados en la informacion proporcionada |

La comparacion relevante es contra el modelo base: este ajuste anade especializacion en el dataset LIBERO y en el robot Panda, a costa de perder generalidad. No se dispone de datos de rendimiento de ninguna de las dos variantes en la informacion proporcionada, por lo que no es posible establecer que el ajuste mejore al base en terminos de tasa de exito.

## Limitaciones y advertencias

- Especializacion estrecha: el modelo solo ha visto las 40 tareas de LIBERO con un robot Panda y dos camaras. Fuera de esa distribucion (otros objetos, otra iluminacion, otro robot, otra disposicion de camaras) es probable que el comportamiento se degrade o falle.
- Sin evaluacion publicada: no hay tasas de exito, ni curvas de aprendizaje, ni resultados en el benchmark LIBERO. No se puede afirmar que el ajuste haya convergido correctamente.
- Riesgo de sobreajuste: 25.000 pasos con tamano de lote 4 sobre 1693 episodios es una configuracion propensa a memorizar las demostraciones; conviene validar en un conjunto de evaluacion propio antes de cualquier uso serio.
- Sin validacion de la comunidad: cero descargas y cero "likes" en el momento de la consulta, por lo que no existe evidencia externa de reproducibilidad.
- Riesgo de acciones inseguras: una politica de imitacion puede generar comandos abruptos o fuera de rango cuando encuentra estados no vistos. Es imprescindible imponer limites de par, velocidad y espacio de trabajo en el controlador del robot.
- No es un modelo de lenguaje: no genera texto, no responde a instrucciones en lenguaje natural y no admite tool calling ni razonamiento multi-paso. Las expectativas de uso deben limitarse al control motor.
- Idiomas: no aplica; no procesa ni produce lenguaje natural.
- Contexto: no se documenta ninguna ventana de contexto ni memoria de episodios anteriores; cada inferencia es una funcion de la observacion actual.
- Restricciones de licencia: Apache 2.0 permite uso comercial y modificacion, pero el autor no ofrece garantias de ningun tipo. La responsabilidad sobre danos fisicos o materiales recae integramente en quien despliega el modelo.
- Dependencia de version: entrenado con LeRobot 0.6.1; cambios de version en la libreria pueden afectar a la carga de los pesos o a la definicion de las observaciones.
- Ausencia de cuantizaciones: no se ofrecen pesos GGUF ni versiones cuantizadas, lo que limita el despliegue en plataformas de muy bajos recursos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/me-nabi/smolvla-libero-finetuned
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Dataset de entrenamiento: https://huggingface.co/datasets/lerobot/libero
- Paper de SmolVLA: https://huggingface.co/papers/2506.01844 (arXiv:2506.01844)
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
- Guia de SmolVLA en LeRobot: https://huggingface.co/docs/lerobot/main/en/smolvla
- Documentacion de LeRobot: https://huggingface.co/docs/lerobot/index
- Guia de instalacion de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guia de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Guia de aprendizaje por imitacion: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia rapida de comandos: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Visualizador del dataset LIBERO: https://huggingface.co/spaces/lerobot/visualize_dataset?path=lerobot/libero
- Imagen de la arquitectura: https://cdn-uploads.huggingface.co/production/uploads/640e21ef3c82bd463ee5a76d/aooU0a3DMtYmy_1IWMaIM.png

Nota: la busqueda web realizada no devolvio resultados relevantes sobre este modelo; los unicos resultados obtenidos correspondian a servicios de mensajeria y a contenido musical, sin relacion con el repositorio.
