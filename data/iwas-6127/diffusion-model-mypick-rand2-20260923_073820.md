# Iwas-6127/diffusion-model-mypick-rand2-20260923_073820

## Resumen

Este repositorio contiene una política de robótica entrenada con LeRobot: una *diffusion policy* (política de difusión) para control visuomotor, publicada por el usuario Iwas-6127 bajo licencia Apache 2.0. El modelo consume dos flujos de imagen RGB de 480x640 (cámaras `overview` y `handcamera`) más un vector de estado propioceptivo de 6 dimensiones, y produce un vector de acción de 6 dimensiones destinado a un robot de tipo `so_follower` (familia SO-100/SO-101). El checkpoint tiene 277.840.246 parámetros (277,8 M) y el repositorio ocupa 1,1 GB en formato safetensors.

El enfoque subyacente es el descrito en el artículo *Diffusion Policy: Visuomotor Policy Learning via Action Diffusion* (arXiv:2303.04137), que modela el control como un proceso generativo de difusión condicionado por las observaciones, capaz de producir trayectorias de acción multimodales y suaves, con buen comportamiento en tareas de manipulación con contacto rico. Es, por tanto, una alternativa a las políticas deterministas tipo ACT dentro del ecosistema LeRobot.

La relevancia práctica de esta ficha es limitada y conviene decirlo con claridad: se trata de un artefacto experimental (el nombre incluye `mypick-rand2`), entrenado únicamente durante 2 pasos de optimización sobre un dataset de 30 episodios y 26.999 fotogramas, y sin resultados de evaluación publicados. Sirve como referencia de formato y de configuración de LeRobot, no como política lista para producción.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Política de difusión para control visuomotor (difusión condicional sobre trayectorias de acción). La model card no especifica el backbone concreto (U-Net temporal 1D o transformer) ni el codificador visual |
| Parametros totales | 277.840.246 (277,8 M), dato real de safetensors |
| Parametros activos | No aplica: no es un modelo MoE |
| Longitud de contexto | No aplica / no disponible. La model card no indica `n_obs_steps` (pasos de observación) ni el horizonte de predicción de acciones |
| Tipos de cuantizacion | No disponible. El repositorio solo contiene pesos en safetensors (presumiblemente fp32) |
| Idiomas soportados | No disponible / no aplica: no es un modelo de lenguaje, no procesa texto |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería `lerobot`) |
| Tipo de robot | `so_follower` (SO-100/SO-101 seguidor) |
| Entradas | `observation.state` (6,), `observation.images.overview` (3, 480, 640), `observation.images.handcamera` (3, 480, 640) |
| Salidas | `action` (6,) |
| Tamaño del repositorio | 1,1 GB |
| Descargas / likes | 0 / 0 |
| Fecha de creacion / actualizacion | 2026-09-22T22:39:11Z / 2026-09-22T22:39:51Z |

## Arquitectura y entrenamiento

La model card identifica el método como *Diffusion Policy* y enlaza el artículo arXiv:2303.04137. En ese enfoque, la política no predice una acción única de forma determinista, sino que aprende la distribución condicional p(secuencia de acciones | observaciones) mediante un proceso de difusión: se parte de ruido gaussiano y se aplican iteraciones de eliminación de ruido condicionadas por las observaciones, obteniendo una *action chunk* (bloque de acciones) coherente en el tiempo. Este diseño permite representar múltiples modos de comportamiento válidos (por ejemplo, rodear un objeto por la izquierda o por la derecha) y produce trayectorias más suaves que una política de regresión directa, lo que suele traducirse en mejor rendimiento en tareas con contacto. La model card no detalla el backbone elegido (U-Net convolucional temporal 1D frente a variante transformer), el número de pasos de difusión en entrenamiento o inferencia, ni la estrategia de muestreo (DDPM frente a DDIM).

En cuanto al entrenamiento, los datos declarados son el dataset `Iwas-6127/my_pick_test_rnd_20260922_141131`: 30 episodios, 26.999 fotogramas, capturados a 30 FPS, con el campo de tarea vacío (`""`), es decir, sin descripción textual de la tarea. La configuración de entrenamiento registrada es de 2 pasos, batch size 16, optimizador Adam, learning rate 1e-4, semilla 1000 y LeRobot 0.6.2. Dos pasos de optimización con batch 16 suponen 32 muestras procesadas en total: es un volumen de cómputo compatible con una prueba de humo (*smoke test*) de pipeline, no con un entrenamiento real. No se documenta ninguna fase de RLHF, DPO ni ajuste posterior; tampoco se indica división entre entrenamiento y validación.

## Capacidades

- Generación de acciones de 6 grados de libertad a partir de dos vistas RGB (480x640) y del estado propioceptivo del robot, en bucle cerrado.
- Predicción de bloques de acción temporalmente coherentes (acción *chunking*), lo que reduce el ruido de alta frecuencia típico de políticas paso a paso.
- Modelado multimodal de trayectorias: puede representar varias soluciones válidas para una misma observación, útil en entornos con obstáculos o aproximaciones ambiguas.
- Manipulación con contacto rico, la clase de tareas para la que el método de difusión fue diseñado (recoger, empujar, encajar).
- Uso de una cámara de muñeca (`handcamera`) además de una vista general, lo que aporta información local para el ajuste fino del efector final.
- No soporta *tool calling*, ni *function calling*, ni razonamiento multi-paso simbólico, ni agentes conversacionales.
- No tiene capacidades de lenguaje, visión general (captioning, VQA), audio ni matemáticas: no es un modelo multimodal de propósito general.
- No es multilingüe ni multitarea: la tarea no está etiquetada y el modelo se limita al dominio representado en los 30 episodios de entrenamiento.
- No incorpora modo *thinking* ni ninguna capacidad de razonamiento explícito.

## Casos de uso

Conviene repetir la advertencia antes de enumerar: con 2 pasos de entrenamiento y sin evaluación publicada, esta política no ejecuta ninguna tarea de forma fiable. Los casos siguientes describen para qué serviría el artefacto *si se reentrenase* con datos suficientes, o qué papel cumple tal cual dentro de un flujo de trabajo.

- Recogida de objetos con brazo SO-100/SO-101: es exactamente el escenario para el que está configurado (tipo de robot `so_follower`, acción de 6 dimensiones, cámara de muñeca para el ajuste final). Requeriría reentrenar sobre un dataset con la tarea etiquetada y evaluar la tasa de éxito en banco.
- Punto de partida para *fine-tuning* con datos propios: la receta de LeRobot (`lerobot-train --policy.type=diffusion`) permite reutilizar la configuración y sustituir el dataset por uno propio con más episodios y una descripción de tarea explícita.
- Reproducción de una línea base de Diffusion Policy en investigación: sirve para comparar en igualdad de condiciones frente a políticas deterministas como ACT dentro del mismo framework.
- Evaluación comparativa de políticas en LeRobot: al compartir formato de observaciones (estado de 6 dimensiones más dos cámaras), se puede enfrentar a ACT o a SmolVLA sobre el mismo montaje y dataset.
- Docencia y prototipado con hardware de bajo coste: el peso del modelo (1,1 GB en fp32) y los requisitos de VRAM permiten ejecutarlo en una GPU de consumo, lo que facilita prácticas de aprendizaje por imitación en laboratorio.
- Validación de infraestructura de inferencia: al ser un artefacto pequeño y con formato conocido, es útil para comprobar el cableado de cámaras, puertos y nombres de claves de observación antes de lanzar entrenamientos largos.
- Manipulación sensible al contacto (insertar, encajar, apilar) tras un entrenamiento adecuado: la formulación generativa tiende a producir aproximaciones más suaves y menos oscilantes que una política de regresión directa.
- Recolección de datos asistida: usar la política como política inicial en un bucle de DAgger o de corrección humana para acelerar la anotación, siempre que se supervise la ejecución.
- No es adecuado para atención al cliente, generación de código, análisis de documentos ni ninguna tarea de lenguaje: el modelo no procesa texto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card incluye una sección de evaluación con la plantilla vacía y la línea explícita *"No evaluation results have been provided for this policy yet."* No hay tasa de éxito por tarea, número de ensayos, ni métricas de error de acción. Tampoco se aportan curvas de pérdida de entrenamiento ni métricas de validación que permitan estimar la convergencia. Los resultados reportados en el artículo original de Diffusion Policy corresponden a sus propios experimentos y no son extrapolables a este checkpoint.

## Requisitos de hardware

- Peso de los parámetros: 277,84 M en fp32 equivalen a unos 1,1 GB, cifra que coincide con el tamaño del repositorio. En fp16 serían aproximadamente 0,56 GB.
- Memoria para reentrenamiento (estimación): parámetros, gradientes y los dos momentos de Adam en fp32 suman del orden de 4,4 GB, más activaciones de dos codificadores visuales sobre imágenes de 480x640 y el bucle de difusión. Se recomienda una GPU con 12 GB o más (RTX 3060 12 GB, RTX 4070 Ti, A100) para entrenar con comodidad.
- Inferencia: cabe en GPUs de consumo. Una RTX 3060, RTX 4060 de 8 GB o superior es suficiente para la política en fp32. También puede ejecutarse en CPU, con latencia muy superior y probable incumplimiento del objetivo de 30 FPS.
- GPU profesionales: A100, H100 o L40S son innecesarias para inferencia de un modelo de este tamaño; solo tienen sentido para entrenamientos con batch grande o barridos de hiperparámetros.
- Despliegue: la vía soportada es LeRobot (`lerobot-rollout --policy.path=...`), con PyTorch y acceso directo al puerto del robot y a las cámaras OpenCV. vLLM, TGI, llama.cpp y Ollama no sirven para este artefacto: son servidores para modelos de lenguaje y no implementan políticas de difusión robóticas.
- Latencia y throughput: no disponibles. Como referencia de diseño, cada bloque de acción requiere varias iteraciones de eliminación de ruido antes de emitir acciones, y el bucle cerrado se captura a 30 FPS (33 ms por fotograma), por lo que la latencia de inferencia es un factor crítico que debe medirse en el hardware objetivo.
- Almacenamiento: 1,1 GB de repositorio, más el dataset de entrenamiento si se desea reproducir el pipeline.

## Comparativa con modelos similares

| Modelo | Parametros | Tipo de politica | Entradas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (diffusion-mypick-rand2) | 277,8 M | Difusion sobre acciones | 2 imagenes 480x640 + estado 6D | Apache 2.0 | HuggingFace, 0 descargas |
| ACT (Action Chunking Transformer, en LeRobot) | No disponible en la informacion proporcionada | Transformer determinista con action chunking | Imagenes + estado | Apache 2.0 (LeRobot) | Implementado en la libreria LeRobot |
| SmolVLA (LeRobot) | Aprox. 450 M, segun documentacion publica de LeRobot | Vision-language-action con flow matching | Imagenes + estado + instruccion en lenguaje | Apache 2.0 | Pesos publicos en HuggingFace |
| pi0 / pi0-FAST | Aprox. 3,3 B | Vision-language-action con flow matching | Imagenes + estado + instruccion | Apache 2.0 | Pesos publicos en HuggingFace |

La comparación relevante es de planteamiento, no de rendimiento: este checkpoint no ha sido evaluado frente a ninguno de los anteriores. Frente a ACT, la difusión ofrece multimodalidad y trayectorias más suaves a cambio de mayor coste de inferencia (varias iteraciones de muestreo en lugar de una pasada). Frente a SmolVLA o pi0, carece por completo de condicionamiento por lenguaje y de generalización entre tareas, ya que solo ha visto 30 episodios de una tarea sin etiquetar.

## Limitaciones y advertencias

- Entrenamiento insuficiente: solo 2 pasos de optimización con batch 16 (32 muestras). La política no ha aprendido la tarea y no debe ejecutarse en hardware real esperando un comportamiento útil.
- Dataset muy reducido y sin etiquetar: 30 episodios y 26.999 fotogramas, con el campo de tarea vacío, lo que impide saber qué habilidad se pretendía enseñar y limita cualquier evaluación.
- Ausencia total de evaluación: no hay tasa de éxito, ni número de ensayos, ni métricas de error. Cualquier afirmación de rendimiento sería especulativa.
- Riesgo operativo: una política no validada puede generar acciones erráticas. Al controlar un brazo físico, existe riesgo de daños al robot, al entorno o a las personas. Es imprescindible un botón de parada de emergencia y límites de par.
- Sobreajuste al montaje: el modelo depende de dos cámaras con nombres y posiciones concretos (`overview`, `handcamera`) y de la cinemática del robot `so_follower` usado. Cambiar la iluminación, la posición de las cámaras o el robot degrada el comportamiento.
- Sin capacidades de lenguaje ni de razonamiento: no acepta instrucciones en texto y no puede descomponer tareas.
- Comportamiento multimodal no siempre deseable: en tareas donde solo una acción es segura, el muestreo estocástico puede producir acciones inconsistentes entre bloques.
- Sin datos de sesgo en el sentido de los modelos de lenguaje; sí hay un sesgo de dominio evidente: el modelo solo refleja la distribución de los 30 episodios grabados.
- Licencia: los pesos son Apache 2.0, lo que permite uso comercial. Sin embargo, la licencia del dataset de entrenamiento no se declara en la información proporcionada y debería verificarse antes de reutilizar los datos.
- Metadatos inconsistentes: las fechas de creación y actualización del repositorio (septiembre de 2026) y el nombre del checkpoint (`rand2`) sugieren una ejecución de prueba; 0 descargas y 0 likes indican que no ha pasado por ninguna revisión de la comunidad.
- Ausencia de límites de contexto o idioma: no aplica, porque no es un modelo de texto; el límite real es el horizonte de observación y de predicción, que no se documenta.
- Riesgo de alucinación: no aplica el concepto clásico de los LLM, pero sí existe el equivalente en robótica: el modelo puede producir una trayectoria plausible y a la vez físicamente incorrecta sin ninguna señal de confianza asociada.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Iwas-6127/diffusion-model-mypick-rand2-20260923_073820
- Dataset de entrenamiento: https://huggingface.co/datasets/Iwas-6127/my_pick_test_rnd_20260922_141131
- Visualizador del dataset en LeRobot: https://huggingface.co/spaces/lerobot/visualize_dataset?path=Iwas-6127/my_pick_test_rnd_20260922_141131
- Artículo de Diffusion Policy (arXiv): https://arxiv.org/abs/2303.04137
- Ficha del artículo en HuggingFace Papers: https://huggingface.co/papers/2303.04137
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de instalación: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento de políticas: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia rápida de comandos (cheat-sheet): https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia y rollout: https://huggingface.co/docs/lerobot/main/en/inference
- Cita del framework LeRobot (Cadene et al., 2024): incluida en la model card del repositorio
- Nota sobre la búsqueda web: las consultas realizadas no devolvieron resultados relacionados con este modelo; los resultados obtenidos trataban sobre la criptomoneda AAVE y se han descartado por no ser pertinentes.
