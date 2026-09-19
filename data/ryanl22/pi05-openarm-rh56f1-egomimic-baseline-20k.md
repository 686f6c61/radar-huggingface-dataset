# RyanL22/pi05-openarm-rh56f1-egomimic-baseline-20k

## Resumen

El modelo `RyanL22/pi05-openarm-rh56f1-egomimic-baseline-20k` es un checkpoint de robótica (vision-language-action, VLA) afinado a partir de `lerobot/pi05_base` mediante la librería LeRobot (v0.6.1). Lo publica el usuario RyanL22 y corresponde al paso 20.000, es decir, al checkpoint final de un entrenamiento de 20.000 pasos ejecutado sobre 4 GPU H100 con batch efectivo de 64 (16 x 4). El modelo genera acciones de control de 28 dimensiones para un brazo OpenArm con mano Inspire RH56F1, a partir de dos cámaras ZED estéreo y del estado proprioceptivo del robot.

La relevancia de esta ficha es metodológica más que de rendimiento: se trata de una reproducción del recetario visual de EgoMimic aplicado a `pi05`, en el que tanto los vídeos humanos como los de robot se enmascaran (la silueta del brazo se pinta de negro con SAM3 y se traza una línea roja sobre cada brazo). El objetivo es reducir la brecha de dominio entre demostraciones humanas y teleoperación robótica, combinando 4 células de datos de robot con 12 de vídeo humano y un muestreo de pesos proporcional a la raíz cuadrada del número de fotogramas.

El conjunto de datos resultante contiene 12 tareas y 466 episodios (261 episodios de teleoperación OpenArm v4 a 20 Hz más vídeo humano anyh2r), con acciones de 28 dimensiones obtenidas mediante dex-retargeting (configuración Inspire hacia RH56F1) e IK del brazo OpenArm. El checkpoint es la variante "baseline" del pipeline `egomimic_baseline_20260919`; existe un gemelo con superposición de robot renderizado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLA basada en `lerobot/pi05_base`; codificador visual SigLIP afinado + experto de acciones con chunking (no confirmado en detalle) |
| Parametros totales | 4.143.404.816 (4,14 B) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repositorio solo distribuye safetensors) |
| Idiomas soportados | no disponible (modelo de robótica; no procesa lenguaje natural de forma reportada) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Dimension del estado de entrada | 28-D: `neck(2) | left_arm(7) | right_arm(7) | left_hand(6) | right_hand(6)` |
| Entradas visuales | `observation.images.base_0_rgb` (ZED izquierda, 288x512, enmascarada + linea roja), `observation.images.left_wrist_0_rgb` (ZED derecha) |
| Horizonte de accion | chunk de 50 acciones a 20 fps (2,5 s) |
| Tamano del repositorio | 9,4 GB |

## Arquitectura y entrenamiento

Se trata de un modelo de politica visuomotora del linaje `pi0.5` implementado de forma nativa en LeRobot, con un codificador visual SigLIP que se afina durante el entrenamiento. La innovación principal no está en la arquitectura sino en la receta de datos: se aplica el enmascaramiento visual de EgoMimic, de modo que en todos los vídeos (humanos y de robot) el brazo aparece pintado de negro mediante SAM3 y con una línea roja superpuesta a lo largo de cada extremidad. En el momento del rollout, las imágenes del propio robot deben recibir exactamente la misma máscara y línea, lo que exige replicar el preprocesado en el bucle de inferencia.

El entrenamiento se realizó con AdamW, learning rate máximo de 2,5e-5 con decaimiento coseno hasta 2,5e-6 y 1000 pasos de warmup, durante 20.000 pasos sobre 4 GPU H100 con batch 16 x 4 = 64. El dataset mezcla 16 células (4 de robot y 12 humanas) con pesos de muestreo proporcionales a la raíz cuadrada del número de fotogramas. La aumentación de imagen es fotométrica y afín, con un único sorteo replicado en el par estéreo para mantener la coherencia entre vistas. La aumentación por espejo (mirror augmentation) está desactivada. La normalización usa cuantiles y las dimensiones constantes (cuello) se ensanchan a media ± 0,1 rad. El conjunto de datos se construyó con el pipeline `egomimic_baseline_20260919`.

## Capacidades

- Generación de acciones de control continuas de 28 dimensiones para un brazo OpenArm de doble brazo con manos RH56F1.
- Política visuomotora con entrada de dos vistas estéreo (cámara base y muñeca izquierda) más estado proprioceptivo.
- Ejecución de 12 tareas entrenadas dentro del conjunto de datos OpenArm teleop v4 + anyh2r.
- Predicción por chunks de 50 acciones a 20 fps (2,5 s de horizonte), lo que permite control con action chunking.
- Aprendizaje de demostraciones humanas mediante el recetario visual de EgoMimic (transferencia humano-robot por enmascaramiento).
- No se reporta soporte de tool calling ni function calling.
- No se reporta soporte de agentes ni razonamiento multi-paso.
- No se reportan capacidades multilingües, de visión general, audio ni modo de razonamiento explícito.

## Casos de uso

- Teleoperación asistida de un brazo OpenArm con mano Inspire RH56F1: el modelo traduce dos vistas ZED y el estado de 28-D en comandos de 2,5 s, útil para reproducir políticas de manipulación bimanual entrenadas por teleoperación a 20 Hz.
- Investigación en transferencia humano-robot: al emplear el enmascaramiento EgoMimic, permite estudiar cuánto del rendimiento proviene de vídeo humano frente a teleoperación robótica en un mismo esquema de mezcla de células.
- Reproducción de experimentos en robótica de manipulación: sirve como línea base ("baseline") frente a la variante `masquerade` con superposición de robot renderizado, aislando el efecto del tratamiento visual.
- Recolección de datos y ajuste fino posterior: el checkpoint final de 20.000 pasos puede usarse como inicialización para nuevas tareas dentro del mismo hardware (OpenArm + RH56F1).
- Manipulación bimanual con control de mano multi-dedo: las 6 dimensiones por mano permiten modelar agarres y configuraciones de dedos de la RH56F1 en tareas de pick-and-place.
- Evaluación de recetas de aumentación y normalización: el modelo documenta explícitamente aumentación fotométrica y afín replicada en el par estéreo, mirror off y ensanchado de dimensiones constantes, lo que lo convierte en un caso de estudio reproducible.
- Benchmark interno de pipelines EgoMimic en LeRobot: al estar entrenado con `egomimic_baseline_20260919`, permite comparar pipelines de generación de datos dentro del ecosistema LeRobot.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica el coste de entrenamiento (20.000 pasos, 4x H100, batch 64) y la configuración de la política, pero no incluye tasas de éxito, ni métricas de simulación, ni comparaciones cuantitativas.

## Requisitos de hardware

- VRAM estimada para inferencia: en precision completa (FP32) los 4,14 B parámetros ocupan aproximadamente 16,6 GB; en BF16/FP16, alrededor de 8,3 GB. A esto hay que sumar el coste de activaciones del codificador SigLIP y de las dos imágenes de entrada (288x512 cada una).
- GPU recomendadas: el entrenamiento se realizó en 4x H100. Para inferencia, una H100 o A100 (40/80 GB) ofrece margen amplio; una RTX 4090 (24 GB) es suficiente en BF16 para un único proceso de inferencia.
- GPU de consumo: cabe en una RTX 4090 o RTX 3090 (24 GB) en BF16. En tarjetas de 16 GB (RTX 4080, 4060 Ti 16 GB) el ajuste es justo y depende del backend y del tamaño de lote. No cabe en GPUs de 8-12 GB sin cuantización agresiva.
- Opciones de despliegue: LeRobot con PyTorch es la vía nativa indicada por la librería del repositorio. No se documenta soporte de vLLM, TGI, llama.cpp ni Ollama para este checkpoint.
- Latencia y throughput: el chunk de 50 acciones a 20 fps implica un horizonte de control de 2,5 s por inferencia. No se publican cifras de latencia por paso ni de FPS de inferencia.
- Almacenamiento: el repositorio ocupa 9,4 GB, por lo que conviene verificar espacio en disco antes de descargar.

## Comparativa con modelos similares

| Modelo | Parametros | Tipo | Datos de entrenamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `RyanL22/pi05-openarm-rh56f1-egomimic-baseline-20k` | 4,14 B | VLA, enmascaramiento EgoMimic | OpenArm teleop v4 (261 ep) + anyh2r humano, 12 tareas / 466 ep | Apache 2.0 | HuggingFace, 0 descargas |
| `RyanL22/pi05-openarm-rh56f1-masquerade-baseline-20k` | no disponible | VLA, superposicion de robot renderizado | mismo pipeline, receta visual distinta | no disponible | HuggingFace (modelo hermano citado en la model card) |
| `lerobot/pi05_base` | no disponible | VLA base | no disponible | no disponible | HuggingFace (modelo base) |

No se dispone de datos comparativos de rendimiento entre estas variantes en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo de robotica de proposito especifico: solo es utilizable con el hardware y la morfologia para los que fue entrenado (OpenArm con manos RH56F1 y estado de 28 dimensiones). No es un modelo de lenguaje de proposito general.
- Dependencia critica del preprocesado: en rollout es obligatorio aplicar a las imagenes del robot la misma mascara SAM3 y la misma linea roja que en entrenamiento. Omitir este paso invalida la politica.
- Sin resultados de evaluacion publicados: no hay tasas de exito ni comparaciones con el modelo base, por lo que no es posible estimar su rendimiento real sin evaluacion propia.
- Cero descargas y cero likes en el momento de la consulta: no hay validacion por parte de la comunidad.
- Riesgo de sobreajuste al dominio de camara: las entradas estan fijadas a ZED izquierda (288x512) y ZED derecha; cambios de camara, resolucion o calibracion requieren reentrenamiento o ajuste.
- La aumentacion por espejo esta desactivada, lo que puede reducir la robustez ante configuraciones espaciales no vistas.
- Las dimensiones constantes (cuello) se ensancharon artificialmente a media ± 0,1 rad, un ajuste de normalizacion que puede enmascarar problemas de control en esa articulacion.
- Fecha de creacion indicada como 2026-09-19, posterior a la fecha de referencia habitual; conviene verificar la coherencia temporal del repositorio.
- Licencia Apache 2.0: permite uso comercial, pero el modelo base `lerobot/pi05_base` puede tener sus propias condiciones, que no se detallan en la informacion disponible.
- No se reportan sesgos sociales, pero tampoco evaluaciones de seguridad, robustez ni comportamiento fuera de distribucion.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/RyanL22/pi05-openarm-rh56f1-egomimic-baseline-20k)
- [Modelo base: lerobot/pi05_base](https://huggingface.co/lerobot/pi05_base)
- [Modelo hermano: RyanL22/pi05-openarm-rh56f1-masquerade-baseline-20k](https://huggingface.co/RyanL22/pi05-openarm-rh56f1-masquerade-baseline-20k)
- La busqueda web realizada no devolvio enlaces relevantes al modelo (los resultados obtenidos correspondian a paginas de hora local de Los Angeles y no guardan relacion con el contenido de esta ficha).
