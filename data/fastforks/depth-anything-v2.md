# fastforks/depth-anything-v2

## Resumen

Depth Anything V2 es un modelo de estimación de profundidad monocular relativa desarrollado por Yang et al. (2024) y publicado originalmente por el equipo de Depth Anything. El repositorio `fastforks/depth-anything-v2` no contiene pesos: es una model card que actúa como catálogo de variantes, con enlaces a los pesos de los autores y verificación mediante SHA-256, además de kernels optimizados para el backend `kernels` del ecosistema fastforks.

El modelo combina un codificador ViT de DINOv2 con una cabeza DPT para producir mapas de profundidad (o profundidad inversa) a partir de una única imagen RGB. Se ofrece en tres variantes: Small (ViT-S), Base (ViT-B) y Large (ViT-L), todas con parche de 14 píxeles y resolución de entrada flexible (cualquier H x W mayor o igual a 8). La innovación principal del trabajo original es el uso de etiquetas sintéticas de un profesor ViT-G y 62 millones de imágenes reales pseudo-etiquetadas para mejorar la generalización.

Es relevante ahora porque el paquete fastforks añade kernels CUDA optimizados que aceleran la inferencia entre 1,7x y 9,1x respecto al código original, con un consumo de memoria muy reducido (desde 190 MiB en la variante Small con kernels), lo que permite desplegarlo en GPUs de consumo como la RTX 5060 Ti.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer ViT (DINOv2) como codificador + cabeza DPT; parche de 14 |
| Parametros totales | no disponible (variantes ViT-S, ViT-B y ViT-L) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (entrada de imagen, cualquier H x W >= 8) |
| Tipos de cuantizacion | fp32 y fp16 (según benchmarks); no se documentan otras |
| Idiomas soportados | no disponible (modelo de visión, sin procesamiento de lenguaje) |
| Licencia | Mixta: Small Apache-2.0; Base y Large CC-BY-NC-4.0; código Apache-2.0 |
| Formato de pesos | `.pth` (PyTorch), alojados en los repos de los autores |

## Arquitectura y entrenamiento

La arquitectura sigue el diseño del paper Depth Anything V2: un codificador ViT preentrenado con DINOv2 (en tamaños Small, Base y Large) seguido de una cabeza DPT que reconstruye el mapa de profundidad. La entrada admite cualquier resolución mayor o igual a 8 píxeles y se redimensiona o rellena internamente según el parche de 14. El modelo produce profundidad relativa (o profundidad inversa, según la variante), no profundidad métrica en las variantes aquí listadas.

El entrenamiento, según la model card, emplea un profesor ViT-G entrenado sobre 595.000 imágenes sintéticas (BlendedMVS, Hypersim, IRS, TartanAir, VKITTI 2) y estudiantes entrenados sobre 62 millones de imágenes reales pseudo-etiquetadas (SA-1B, Open Images, BDD100K, Google Landmarks, ImageNet-21K, LSUN, Objects365, Places365). No se documenta en la información disponible el uso de RLHF, DPO ni otras técnicas de alineación, algo esperable en un modelo puramente visual.

## Capacidades

- Estimación de profundidad monocular relativa a partir de una sola imagen RGB.
- Salida de mapa de profundidad o profundidad inversa (`inverse_depth`), según la variante.
- Entrada de resolución arbitraria (cualquier H x W mayor o igual a 8), redimensionada o rellenada internamente.
- Procesamiento en fp32 y fp16 con dos backends: `portable` (PyTorch) y `kernels` (kernels CUDA optimizados).
- Verificación de integridad de pesos mediante SHA-256 contra los ficheros de los autores.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingües: es un modelo exclusivamente de visión.

## Casos de uso

- Reconstrucción 3D y fotogrametría: generar mapas de profundidad por imagen para alimentar pipelines de estructura desde movimiento (SfM) o multi-view stereo, aprovechando la resolución arbitraria de entrada.
- Realidad aumentada: estimar la profundidad de la escena en tiempo real desde la cámara del dispositivo; la variante Small con kernels procesa 640x480 en 4,0 ms con 129 MiB pico, apta para GPUs de consumo.
- Edición fotográfica y efecto bokeh: usar el mapa de profundidad para desenfocar selectivamente el fondo en imágenes de alta resolución (hasta 12 MP probados con 462 MiB en Small con kernels).
- Robótica y navegación: percepción de profundidad a bordo con GPUs modestas; la variante Base con kernels procesa 1920x1080 en 13,7 ms con 390 MiB pico.
- Generación de datos sintéticos y aumento de dataset: producir mapas de profundidad para condicionar modelos de difusión o para etiquetar automáticamente imágenes en pipelines de investigación.
- Análisis de vídeo y segmentación asistida: profundidad por fotograma como señal auxiliar en tareas de segmentación, detección de obstáculos o matting.
- Investigación en visión por computador: reproducir los resultados del paper con los checkpoints originales verificados por hash, usando el backend `portable` para comparación fiel.

## Benchmarks y rendimiento

La model card incluye datos de velocidad y memoria medidos en una RTX 5060 Ti 16 GB (sm_120). Se reproducen a continuación los de la resolución Middlebury 2014 (994x1482):

| Modelo | Tiempo original fp32 (ms) | Original (ms) | Portable (ms) | Kernels (ms) | Aceleración kernels vs original | Memoria pico original (MiB) | Memoria pico kernels (MiB) |
|---|---|---|---|---|---|---|---|
| depth-anything-v2-b | 93,6 | 63,2 | 18,84 | 10,51 | 6,0x | 928 / 1026 | 387 / 436 |
| depth-anything-v2-l | 245,4 | 140,2 | 55,07 | 31,12 | 4,5x | 2560 / 2654 | 921 / 1034 |
| depth-anything-v2-s | 53,6 | 41,0 | 7,82 | 4,51 | 9,1x | 373 / 418 | 190 / 248 |

Rendimiento a tamaño fijo (tiempo en ms / memoria pico asignada / reservada en MiB):

| Modelo | Modo | 640x480 | 1280x720 | 1920x1080 | 12 MP (4000x3000) |
|---|---|---|---|---|---|
| depth-anything-v2-b | portable | 18,8 / 643 / 776 | 26,2 / 733 / 876 | 26,3 / 745 / 908 | 20,0 / 787 / 924 |
| depth-anything-v2-b | kernels | 9,5 / 325 / 408 | 13,6 / 376 / 466 | 13,7 / 390 / 486 | 10,7 / 606 / 622 |
| depth-anything-v2-l | portable | 55,9 / 1752 / 1946 | 78,6 / 1915 / 2170 | 78,8 / 1928 / 2180 | 57,1 / 1885 / 2216 |
| depth-anything-v2-l | kernels | 28,3 / 875 / 1000 | 38,7 / 965 / 1104 | 38,8 / 977 / 1112 | 29,3 / 1058 / 1174 |
| depth-anything-v2-s | portable | 8,1 / 262 / 326 | 10,9 / 314 / 376 | 11,0 / 329 / 422 | 9,5 / 509 / 536 |
| depth-anything-v2-s | kernels | 4,0 / 129 / 166 | 5,7 / 164 / 218 | 5,8 / 177 / 214 | 5,1 / 462 / 480 |

En la información disponible no se incluyen resultados completos de precisión (AbsRel / delta1) sobre datasets públicos: la tabla de accuracy aparece truncada en la model card. Por tanto, no se presentan cifras de precisión.

## Requisitos de hardware

- VRAM estimada para inferencia (fp16, backend portable): Small 262-509 MiB; Base 643-787 MiB; Large 1752-1885 MiB, según resolución.
- Con backend kernels la memoria baja a: Small 129-462 MiB; Base 325-606 MiB; Large 875-1058 MiB.
- GPU recomendadas: RTX 5060 Ti 16 GB es la plataforma de referencia de los benchmarks; cualquier GPU con al menos 2 GiB libres puede ejecutar las tres variantes en fp16.
- Cabe en GPU de consumo: sí, todas las variantes; la Small funciona incluso con menos de 1 GiB de VRAM.
- Opciones de despliegue: paquete `fastforks` (backends `portable` y `kernels`); el código original de Depth Anything V2 en PyTorch también es utilizable con los checkpoints `.pth`.
- Latencia: desde 4,0 ms (Small, kernels, 640x480) hasta 38,8 ms (Large, kernels, 1920x1080) en RTX 5060 Ti.
- Carga inicial: entre 0,08 s (Small, kernels) y 2,39 s (Large, portable).

## Comparativa con modelos similares

| Modelo | Parametros | Entrada | Licencia | Comercial | Rendimiento documentado |
|---|---|---|---|---|---|
| Depth Anything V2 (este repo) | ViT-S / ViT-B / ViT-L | Imagen RGB, H x W >= 8 | Mixta (Small Apache-2.0; Base/Large CC-BY-NC-4.0) | Solo Small | 4,0-38,8 ms en RTX 5060 Ti (kernels) |
| Depth Anything V1 | ViT-S / ViT-B / ViT-L | Imagen RGB | no disponible en esta ficha | no disponible | no disponible |
| MiDaS | ViT-B / ViT-L | Imagen RGB | MIT (según versión) | sí | no disponible |
| ZoeDepth | ViT-B / ViT-L | Imagen RGB | no disponible | no disponible | no disponible |

No se dispone en la información proporcionada de datos comparativos de precisión frente a estas alternativas.

## Limitaciones y advertencias

- Licencia restrictiva: los pesos Base y Large son CC-BY-NC-4.0, por lo que no permiten uso comercial. Solo la variante Small es Apache-2.0.
- Los términos comerciales de los datos de entrenamiento, incluso de la variante Small, están marcados como poco claros en la propia model card.
- Produce profundidad relativa, no métrica, en las variantes listadas; no es apto para mediciones absolutas sin calibración externa.
- No procesa texto ni lenguaje: no tiene capacidades multilingües, tool calling ni agentes.
- El repositorio no aloja pesos; depende de la disponibilidad de los repos de los autores y de la verificación por SHA-256.
- La tabla de precisión sobre datasets públicos aparece truncada en la información disponible; no se pueden verificar cifras de error (AbsRel, delta1).
- Los benchmarks se han medido en una única GPU (RTX 5060 Ti, sm_120); el rendimiento en otras arquitecturas puede variar.
- Posibles sesgos heredados de los datasets de entrenamiento (SA-1B, Open Images, ImageNet-21K, etc.), no cuantificados en la información disponible.

## Enlaces

- Model card en Hugging Face: https://huggingface.co/fastforks/depth-anything-v2
- Repositorio fastforks: https://github.com/kleinicke/fastforks
- Kernels para el backend kernels: https://huggingface.co/fastforks/kernels
- Código original Depth Anything V2: https://github.com/DepthAnything/Depth-Anything-V2
- Pesos Base: https://huggingface.co/depth-anything/Depth-Anything-V2-Base
- Pesos Large: https://huggingface.co/depth-anything/Depth-Anything-V2-Large
- Pesos Small: https://huggingface.co/depth-anything/Depth-Anything-V2-Small
- Documentación de benchmarks: https://github.com/kleinicke/fastforks/blob/main/docs/benchmarks.md
- Fichero de definición de variantes (card.toml): https://github.com/kleinicke/fastforks/blob/main/src/fastforks/depth/models/depth_anything_v2/card.toml
- Licencia original: https://github.com/DepthAnything/Depth-Anything-V2/blob/main/README.md
