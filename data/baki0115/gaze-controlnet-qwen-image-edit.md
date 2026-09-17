# baki0115/gaze-controlnet-qwen-image-edit

## Resumen

GazeCtrl es un adaptador ControlNet de 1.768 millones de parámetros que se acopla al modelo de edición de imágenes Qwen-Image-Edit-2509 para reorientar la mirada de una persona en una fotografía. Dado un vector de dirección de mirada objetivo `(dx, dy, dz)`, el adaptador modifica cabeza y cuerpo sobre los 360° completos, incluyendo el caso de que el sujeto quede de espaldas, manteniendo la identidad de la persona. Lo publica el usuario baki0115 bajo licencia Apache-2.0 y el repositorio ocupa 7,1 GB porque incluye dos checkpoints en bf16 de 3,54 GB cada uno.

La innovación principal es que el vector de mirada es el propio vector de control: no hay esqueleto, ni etapa de predicción de pose, ni prompt de texto (`txt_emb` es un tensor de ceros, de modo que toda la señal de control llega por el ControlNet). El vector se codifica como un campo RGB plano de 512×512 donde `R=(dx+1)/2`, `G=(dy+1)/2` y `B=(dz+1)/2`, se pasa por el VAE y se inyecta mediante cinco bloques de InstantX ControlNet Union que producen cinco residuales sobre el backbone congelado. La identidad viaja en la imagen de origen como token de referencia en contexto.

Es relevante por su planteamiento minimalista (control continuo de pose sin pipeline auxiliar) y, sobre todo, por la honestidad de su documentación: el propio autor publica la brecha de generalización entre identidades de entrenamiento y de validación, los límites de preservación de identidad y el carácter aproximado de su métrica principal. Aun así, conviene tratarlo como un adaptador experimental: 0 descargas y 0 likes en el momento de la consulta, y sin pérdida específica de identidad en el entrenamiento.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Adaptador ControlNet (InstantX ControlNet Union, 5 bloques) sobre backbone Qwen-Image-Edit-2509 congelado; objetivo flow matching |
| Parámetros totales | 1.768 M (adaptador ControlNet) |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de edición de imagen; entrada fija de 512×512) |
| Tipos de cuantización | Pesos del adaptador en bf16; el backbone base se usa en fp8 |
| Idiomas soportados | no disponible (la model card no declara idiomas; el prompt de texto no se usa) |
| Licencia | Apache-2.0 (pesos del adaptador); el modelo base y los pesos de InstantX mantienen sus propias licencias |
| Formato de pesos | safetensors (bf16), 3,54 GB por checkpoint |
| Tipo de modelo | Adaptador ControlNet de edición de imagen (image-to-image), no es un modelo autónomo |
| Modelo base | Qwen/Qwen-Image-Edit-2509 (congelado, no incluido) |
| Resolución de entrenamiento | 512×512 con padding a cuadrado |
| Pasos de inferencia recomendados | 16 pasos, `cn_scale=1.0` |
| Tamaño del repositorio | 7,1 GB (dos checkpoints: `cn_step085000.safetensors` y `cn_step090000.safetensors`) |

## Arquitectura y entrenamiento

El adaptador se inicializa desde los pesos preentrenados de InstantX ControlNet Union (se cargan las 181 de 181 claves) y se entrena con el backbone Qwen-Image-Edit-2509 en fp8 completamente congelado, junto con su VAE. La señal de control es un campo RGB plano de 512×512 que codifica la dirección de mirada objetivo y que se codifica con el VAE antes de entrar en los cinco bloques del ControlNet, cuyas cinco salidas residuales se suman al flujo del backbone. La convención es `dx > 0` mira hacia la derecha de la imagen, `dy > 0` mira hacia arriba y `dz > 0` mira hacia la cámara, con `yaw = atan2(dx, dz)`, de forma que ±180° corresponde a mirar de espaldas. La identidad no la transporta el ControlNet, sino la imagen de origen, que entra en el backbone como token de referencia en contexto.

El entrenamiento usa 1.864 fotogramas de 183 identidades, construidos a partir de COCO y WiderFace convertidos en turnarounds con Wan2.2; el 48 % de las etiquetas son anotadas por humanos. La función de pérdida es un MSE sobre la velocidad del flow matching con ponderación por región: `w = 1 + 8·head_mask + 30·eye_mask`. Se optimiza con AdamW, learning rate 1e-4, grad-clip 1.0 y batch de 1 durante 90.000 pasos, a unos 2 segundos por paso en una única NVIDIA A6000. El checkpoint `cn_step085000` es el que obtiene las mejores métricas en el conjunto de entrenamiento y el que se usa en la demo; `cn_step090000` es el estado final de la ejecución. No se aplicó RLHF ni DPO, y no existe ningún término de pérdida que optimice explícitamente la preservación de identidad.

## Capacidades

- Edición de orientación de mirada condicionada por un vector 3D continuo `(dx, dy, dz)`, con cobertura de los 360° incluida la orientación de espaldas a cámara.
- Rotación coordinada de cabeza y cuerpo, no solo del rostro.
- Mantenimiento de la identidad del sujeto mediante la imagen de origen como referencia en contexto (con las limitaciones descritas más abajo).
- Edición de imagen a imagen sin prompt de texto: el condicionamiento de texto se sustituye por un tensor de ceros, de modo que el control es puramente geométrico.
- Inferencia por flow matching en 16 pasos con un único parámetro de escala (`cn_scale`) que regula el compromiso entre obediencia al vector y fidelidad a la imagen original.
- No soporta tool calling, function calling ni razonamiento agéntico: es un modelo de visión, no un modelo de lenguaje.
- Capacidades multilingües: no aplica, al no existir entrada de texto.

## Casos de uso

- Aumento de datos para investigación en reconocimiento facial: generar la misma identidad con múltiples orientaciones de cabeza permite ampliar conjuntos de entrenamiento con pose controlada, aunque la similitud de identidad de ~0,28 medida con ArcFace obliga a filtrar las muestras generadas.
- Retoque fotográfico de retratos: corregir una mirada desviada en una sesión de estudio sin volver a fotografiar al sujeto, fijando el vector `(dx, dy, dz)` deseado y manteniendo el encuadre original.
- Creación de variantes de una misma foto de producto o de moda: a partir de una única toma de una persona, generar versiones mirando a cámara, de perfil o de espaldas para catálogos con requisitos de pose homogéneos.
- Previsualización rápida en flujos de dirección de arte: el adaptador permite iterar sobre la pose de un personaje antes de comprometer un rodaje o un render 3D, con la advertencia de que el resultado es una aproximación de pose y no una reconstrucción exacta.
- Investigación en control geométrico de modelos de difusión: sirve como punto de partida reproducible (receta de entrenamiento, dataset anotado y código público) para estudiar alternativas al control por esqueleto o por keypoints.
- Generación de avatares con pose consistente: partiendo de una foto de referencia por identidad, producir un conjunto de orientaciones para animaciones o fichas de personaje, asumiendo que las vistas de espaldas no pueden validarse automáticamente en identidad.
- Pruebas de robustez de estimadores de pose y mirada: al generar pares imagen-vector conocidos, puede usarse para medir el error de estimadores de head pose, teniendo en cuenta que las dos fuentes de etiquetado usadas discrepan en una mediana de 26,7° sobre el mismo fotograma.

## Benchmarks y rendimiento

Datos de evaluación publicados por el autor. El conjunto retenido son 8 identidades nunca vistas en entrenamiento, con `cn_scale=1.0`, 16 pasos y semilla 0. `gaze_err` se mide contra la pose de cabeza estimada con 6DRepNet y no contra la mirada real; `id_sim` se mide con ArcFace; `face_det` indica el porcentaje de salidas en las que ArcFace detecta un rostro.

| Métrica | Identidades de entrenamiento | Retenido 70k | Retenido 90k |
|---|---|---|---|
| `gaze_err` (menor es mejor) | 19,11° | 55,97° | 57,28° |
| `ctrl_slope` (ideal 1,0) | +0,874 | +0,642 | +0,667 |
| `id_sim` ArcFace (mayor es mejor) | no disponible | +0,277 | +0,282 |
| `face_det` | no disponible | 70 % | 75 % |

No se han publicado resultados de benchmarks comparables con MMLU, HumanEval, GSM8K ni similares, porque no son aplicables a un adaptador de edición de imagen. La búsqueda web realizada no devolvió ningún resultado relevante sobre este modelo.

## Requisitos de hardware

- El adaptador ControlNet ocupa 3,54 GB en bf16 (1.768 M parámetros); el repositorio completo son 7,1 GB por incluir dos checkpoints.
- El backbone Qwen-Image-Edit-2509 en fp8 y su VAE deben cargarse adicionalmente y permanecen congelados; la VRAM total necesaria para el conjunto no está documentada en la información disponible.
- El entrenamiento se realizó en una única NVIDIA A6000 a unos 2 segundos por paso, con batch de 1 y 90.000 pasos.
- No se documentan GPU recomendadas para inferencia ni si el sistema completo cabe en GPUs de consumo; dado el tamaño del backbone, no puede confirmarse a partir de la información disponible.
- Latencia y throughput de inferencia: no disponibles. El único dato temporal publicado corresponde al entrenamiento (2 s/paso en A6000), no a la generación.
- Opciones de despliegue: los pesos no son cargables directamente con `diffusers`; la carga requiere el módulo `qwen_models` (`QwenBackbone`, `QwenControlNet`, `load_qwen_vae`, `vae_encode`, `vae_decode`, `patchify`, `unpatchify`, `compute_rope_freqs_3d`, `compute_text_rope_freqs`) y el bucle completo de denoising (flow matching, 16 pasos) está en `demo/app.py` del repositorio de código. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que además no son aplicables a este tipo de modelo de imagen.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones de alternativas directas en la información proporcionada. Los únicos elementos comparables son los componentes citados por el propio autor, cuyas especificaciones completas no se detallan.

| Modelo | Parámetros | Contexto / entrada | Métricas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| GazeCtrl (este adaptador) | 1.768 M (adaptador) | 512×512, control por vector de mirada | `gaze_err` 19,11° en train y ~56-57° en retenido | Apache-2.0 (adaptador) | HuggingFace, 0 descargas |
| Qwen/Qwen-Image-Edit-2509 (base) | no disponible | no disponible | no disponible | propia del modelo base | HuggingFace |
| InstantX ControlNet Union (inicialización) | no disponible | no disponible | no disponible | propia de InstantX | no disponible en la información |

## Limitaciones y advertencias

- Brecha de generalización grande: 19,11° de error de mirada en identidades de entrenamiento frente a 55,97° y 57,28° en identidades retenidas. El conjunto retenido es pequeño (8 identidades) y solo tiene etiquetas automáticas, mientras que el 48 % de las etiquetas de entrenamiento son humanas, de modo que parte de la brecha puede ser ruido de etiquetado, pero el autor advierte que no toda.
- Entrenar más tiempo no ayudó: pasar de 70k a 90k pasos mejoró la métrica en el conjunto de entrenamiento y no aportó nada en el retenido.
- Preservación de identidad marginal: `id_sim ≈ 0,28` está justo en el umbral de misma persona de ArcFace y ninguna pérdida del entrenamiento optimiza identidad, por lo que cabe esperar deriva, peor en rotaciones grandes.
- `gaze_err` es una métrica proxy: mide pose de cabeza con 6DRepNet contra el vector solicitado, y pose de cabeza y mirada difieren por construcción. Los dos estimadores que generaron las etiquetas discrepan en una mediana de 26,7° sobre el mismo fotograma, por lo que hay un suelo de ese orden.
- Las salidas de espaldas no pueden evaluarse en identidad, ya que ArcFace necesita un rostro; de ahí la columna separada de `face_det`.
- Distribución de entrenamiento restringida: 512×512 con padding a cuadrado, una sola persona y postura aproximadamente erguida. Multitudes, oclusiones fuertes y encuadres poco habituales quedan fuera de distribución.
- Semántica de etiquetas no uniforme según la dirección; el propio autor lo señala como el defecto conocido más claro de la señal de entrenamiento y remite a la ficha del dataset.
- El modelo no es autónomo: sin el backbone Qwen-Image-Edit-2509 y su VAE no hace nada. Los términos de licencia del modelo base y de los pesos de InstantX ControlNet Union rigen cualquier despliegue, aunque los pesos de este adaptador sean Apache-2.0.
- Los pesos no son cargables con `diffusers` tal cual; requieren código propio del repositorio.
- No hay datos publicados de sesgos, latencia de inferencia ni rendimiento en producción, y el modelo no registra descargas ni valoraciones en el momento de la consulta.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/baki0115/gaze-controlnet-qwen-image-edit
- Repositorio de código, receta de entrenamiento y evaluación: https://github.com/VicsonPeng/GazeCtrl_training-based
- Dataset de etiquetas de entrenamiento: https://huggingface.co/datasets/baki0115/GazeCtrl_dataset
- Modelo base: https://huggingface.co/Qwen/Qwen-Image-Edit-2509
- Búsqueda web: no se encontraron resultados relevantes sobre este modelo; los enlaces devueltos correspondían a un comercio de lanas sin relación con el tema.
