# fastforks/video-depth-anything

## Resumen

Video Depth Anything es un modelo de estimacion de profundidad monocular para video, publicado por Chen et al. en CVPR 2025 y desarrollado por el equipo de Depth Anything. Resuelve el problema de la profundidad temporalmente consistente en videos largos: a diferencia de los modelos de profundidad por imagen, mantiene coherencia entre fotogramas consecutivos mediante una cabeza DPT con atencion temporal que procesa ventanas solapadas de 32 fotogramas. Esto evita el parpadeo (flickering) tipico de aplicar un estimador monocular fotograma a fotograma.

La arquitectura parte del codificador de Depth Anything V2 (variante Small, basada en DINOv2) y anade una cabeza de decodificacion con atencion temporal. Existen dos checkpoints: uno relativo (Small) que produce profundidad con escala desconocida y otro metrico (Metric Small) que produce profundidad en metros. Ambos estan bajo licencia Apache-2.0, mientras que las variantes Base y Large son CC-BY-NC-4.0 y no estan incluidas en este repositorio.

El repositorio `fastforks/video-depth-anything` es unicamente una model card: no aloja pesos. La libreria fastforks descarga los pesos originales de los repositorios de los autores y verifica su integridad mediante SHA-256. Proporciona dos backends (`portable` y `kernels`) con optimizaciones que, segun los datos del autor, reducen el tiempo de inferencia entre 5,8x y 9,1x respecto a la implementacion original en fp32 para entradas de 1080x1920.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Codificador Depth Anything V2 (DINOv2 Small) + cabeza DPT con atencion temporal; ventanas solapadas de 32 fotogramas |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | Ventana temporal de 32 fotogramas |
| Tipos de cuantizacion | no disponible (el autor reporta fp16 y fp32 en pruebas) |
| Idiomas soportados | no disponible (tarea de vision, independiente del idioma) |
| Licencia | Apache-2.0 (solo checkpoints Small; Base y Large son CC-BY-NC-4.0 y no incluidos) |
| Formato de pesos | `.pth` (PyTorch); no se alojan pesos en este repositorio |

## Arquitectura y entrenamiento

El modelo combina el codificador de Depth Anything V2 Small con una cabeza DPT que incorpora atencion temporal. El procesamiento de video se realiza en ventanas solapadas de 32 fotogramas, lo que permite mantener coherencia temporal en videos de longitud arbitraria sin procesar la secuencia completa de una vez. La entrada es una imagen RGB (o una secuencia de ellas) y la salida es un mapa de profundidad o profundidad inversa; el campo `kind` del resultado indica si los valores son metricos (metros) o relativos (escala o desplazamiento desconocidos: `scale_invariant`, `affine_invariant`, `affine_invariant_log`, `affine_invariant_inverse`).

Segun la model card, el entrenamiento parte del codificador de Depth Anything V2 Small y la cabeza temporal se entrena con video sintetico de profundidad junto con videos e imagenes reales pseudo-etiquetados, conforme al articulo arXiv 2501.12375. El checkpoint metrico se entrena sobre Virtual KITTI 2 (CC BY-NC-SA 3.0) e IRS, segun el README original. No se dispone de informacion sobre el numero exacto de tokens de entrenamiento, la composicion detallada del dataset ni el uso de RLHF o DPO.

## Capacidades

- Estimacion de profundidad monocular sobre video con consistencia temporal entre fotogramas.
- Dos modos de salida: profundidad relativa (Small) y profundidad metrica en metros (Metric Small).
- Procesamiento de videos largos mediante ventanas solapadas de 32 fotogramas.
- Entrada de imagenes RGB de cualquier resolucion H x W >= 1; el modelo redimensiona o rellena internamente.
- Salida de mapas de profundidad o profundidad inversa, con semantica indicada por el campo `kind`.
- Backends `portable` y `kernels`, con kernels optimizados para CUDA.
- Compatibilidad con `torch.compile` y TensorRT fp16 (segun los datos de rendimiento del autor).
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso ni multilingues; es un modelo exclusivamente de vision para profundidad.

## Casos de uso

- Reconstruccion 3D y mapeado denso: la profundidad metrica del checkpoint Metric Small permite generar nubes de puntos en metros a partir de video, util para SLAM y fotogrametria, con coherencia temporal que reduce el ruido entre fotogramas.
- Efectos visuales y postproduccion: separar primer plano y fondo en video mediante profundidad temporalmente consistente evita el flickering que aparece al aplicar estimadores por imagen, facilitando rotoscopia y desenfoque de profundidad de campo sintetico.
- Robotica y navegacion autonoma: la version metrica proporciona distancias en metros, apta para planificacion de movimiento y evitacion de obstaculos en tiempo real gracias a los 1,3-1,8 s por ventana de 32 fotogramas a 1080x1920 con el backend `kernels`.
- Realidad aumentada y virtual: la consistencia temporal permite anclar objetos virtuales sobre superficies reales en secuencias de video sin temblor de profundidad, usando la salida relativa o metrica segun la aplicacion.
- Analisis de video medico o industrial: la profundidad metrica sobre secuencias permite medir dimensiones fisicas en grabaciones de endoscopia o inspeccion, con la salvedad de que el modelo metrico se entreno sobre escenas de conduccion (Virtual KITTI 2) y puede generalizar de forma limitada.
- Video volumetrico y captura de movimiento: la profundidad por fotograma coherente temporalmente sirve como entrada para reconstruccion volumetrica y seguimiento de superficies en secuencias largas.
- Preprocesado para modelos generativos de video: mapas de profundidad estables en el tiempo como condicionamiento para difusion de video, donde la inconsistencia entre fotogramas degrada la calidad generada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (como MMLU, HumanEval o GSM8K, que no aplican a un modelo de vision) en la informacion disponible. Los unicos datos proporcionados son de velocidad y memoria, medidos por el autor en una RTX 5060 Ti de 16 GB:

| Modelo | Entrada | Tiempo original (ms) | Portable (ms) | Kernels (ms) | Aceleracion kernels vs original | Memoria pico kernels (MiB alloc/reserved) |
|---|---|---|---|---|---|---|
| video-depth-anything-metric-s | 1080x1920 (TUM fr1_room) | 10776 | 2005 | 1848 | 5,8x | 8208 / 8630 |
| video-depth-anything-s | 1080x1920 (TUM fr1_room) | 11626 | 1434 | 1284 | 9,1x | 8204 / 8782 |

| Modelo | Carga (s) portable | Primera llamada (s) portable | Primera llamada (s) kernels |
|---|---|---|---|
| video-depth-anything-metric-s | 0,51 (1080x1920) | 2,33 (1080x1920) | 0,43 (480x640) |
| video-depth-anything-s | 0,18 (1080x1920) | 1,46 (1080x1920) | 1,30 (1080x1920) |

Para `video-depth-anything-s` a 1080x1920, el autor reporta 1434 ms con backend portable, 1314 ms con `torch.compile` y 524 ms con TensorRT fp16. La resolucion de entrada probada hasta 3000x4000 consume 1,8 GiB pico asignada (3,5 GiB reservada) en fp16 con el backend portable.

## Comparativa con modelos similares

| Modelo | Tipo | Consistencia temporal | Salida metrica | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Video Depth Anything Small (este) | Video, profundidad monocular | Si (ventanas de 32 fotogramas) | Si (checkpoint Metric Small) | Apache-2.0 | Pesos en HF (depth-anything) |
| Depth Anything V2 Small | Imagen, profundidad monocular | No | No (relativa) | Apache-2.0 (Small) | Pesos en HF |
| Metric3D v2 (ViT-Large) | Imagen, profundidad metrica | No | Si (requiere intrinsics) | no disponible en la informacion | Pesos en HF |
| UniDepth v2 (ViT-L14) | Imagen, profundidad metrica | No | Si (estima camara) | no disponible en la informacion | Pesos en HF |

La ventaja diferencial de Video Depth Anything frente a los estimadores por imagen es la coherencia temporal; frente a Metric3D y UniDepth, que ofrecen profundidad metrica por imagen con estimacion o uso de parametros intrinsecos, Video Depth Anything Metric Small ofrece metricas por ventana temporal sin necesidad de intrinsecos en la interfaz (segun la model card, `zoedepth-nk` y los modelos relativos no toman intrinsecos).

## Limitaciones y advertencias

- Solo se incluyen los checkpoints Small (relativo y metrico); las variantes Base y Large son CC-BY-NC-4.0 y no estan disponibles en este repositorio, por lo que no se puede usar comercialmente esa gama superior desde aqui.
- El checkpoint metrico se entreno sobre Virtual KITTI 2 (CC BY-NC-SA 3.0) e IRS; aunque los pesos se distribuyen como Apache-2.0, conviene revisar las implicaciones de los datos de entrenamiento antes de un uso comercial.
- El modelo relativo produce profundidad con escala o desplazamiento desconocidos; no sirve para mediciones en metros sin calibracion adicional.
- El modelo metrico esta entrenado sobre escenas de conduccion sinteticas; su generalizacion a otros dominios (interiores, medicina, industria) puede degradarse.
- Procesamiento en ventanas de 32 fotogramas: la coherencia temporal entre ventanas consecutivas no esta cuantificada en la informacion disponible; pueden aparecer discontinuidades en los solapes.
- Este repositorio no aloja pesos: depende de la libreria fastforks y de la descarga desde los repositorios de los autores, con verificacion SHA-256.
- El tier indicado por el autor es "experimental"; no hay benchmarks de calidad publicados en la informacion disponible.
- No se documentan sesgos especificos ni tasas de alucinacion; al ser un modelo de vision, el riesgo principal es la profundidad incorrecta en superficies reflectantes, transparentes o texturas repetitivas, comun en estimadores monoculares.
- La licencia del codigo original se registra tal cual como paquete de uso de investigacion; conviene verificar los ficheros LICENSE antes de otros usos.

## Enlaces

- Model card en Hugging Face: https://huggingface.co/fastforks/video-depth-anything
- Repositorio de codigo fastforks: https://github.com/kleinicke/fastforks
- Kernels para el backend `kernels`: https://huggingface.co/fastforks/kernels
- Codigo original Video Depth Anything: https://github.com/DepthAnything/Video-Depth-Anything (commit `4f5ae23172ba`)
- Pesos Metric Small: https://huggingface.co/depth-anything/Metric-Video-Depth-Anything-Small
- Pesos Small relativo: https://huggingface.co/depth-anything/Video-Depth-Anything-Small
- Articulo: arXiv 2501.12375 (Chen et al., CVPR 2025)
- Fichero de hashes SHA-256: https://github.com/kleinicke/fastforks/blob/main/src/fastforks/depth/models/video_depth_anything/card.toml
