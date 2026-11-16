# fastforks/dedode

## Resumen

DeDoDe v2 es un modelo de correspondencia densa de imágenes (dense matching) que, a partir de dos fotografías RGB de una misma escena, devuelve para cada píxel de la primera imagen su posición en la segunda junto con una medida de certeza de que ese píxel es visible en ambas. Lo desarrollan Johan Edstedt y colaboradores (presentado en 3DV 2024, con una versión v2 del detector en CVPR Workshops 2024) y esta ficha corresponde al paquete de integración `fastforks/dedode`, que no aloja pesos propios sino que descarga los pesos originales de los autores y los verifica mediante SHA-256.

El modelo sigue la filosofía "detect, don't describe, describe, don't detect": una red VGG19 con refinadores convolucionales (el detector, reentrenado en v2) localiza hasta 10.000 keypoints por imagen, y una red descriptora independiente (VGG19, o VGG19 con un DINOv2 ViT-L/14 congelado en la variante `-G`) describe esos puntos. Las descripciones se emparejan como máximos mutuos de un dual softmax, devolviendo ambos conjuntos de keypoints, los pares de índices emparejados y su probabilidad.

Es relevante para pipelines de reconstrucción 3D, estructura desde movimiento (SfM), registro de imágenes y odometría visual, donde la correspondencia densa y robusta sustituye a los matchers dispersos tradicionales. La integración de fastforks añade backends `portable` y `kernels`, y ofrece variantes con requisitos de memoria moderados (hasta 3000x4000 píxeles con menos de 3 GiB de pico en una RTX 5060 Ti de 16 GB).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Detector VGG19 con refinadores convolucionales + descriptor VGG19 (o VGG19 + DINOv2 ViT-L/14 congelado en `-G`); matching por dual softmax con máximos mutuos |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión); entrada de cualquier H x W >= 32, con padding a múltiplo de 32 |
| Tipos de cuantizacion | fp16 y fp32 (según benchmarks); no se documentan otras cuantizaciones |
| Idiomas soportados | no disponible (modelo de imagen, no lingüístico) |
| Licencia | MIT (código y pesos de las variantes; DINOv2 con su propia licencia `LICENSE-DINOv2`) |
| Formato de pesos | `.pth` (PyTorch); descarga desde enlaces de los autores con verificación SHA-256 |

## Arquitectura y entrenamiento

El modelo se compone de dos etapas desacopladas. El detector es una red VGG19 con refinadores convolucionales que produce hasta 10.000 keypoints por imagen; la versión v2 del detector fue reentrenada respecto a la original. El descriptor es otra red VGG19 que genera una descripción por keypoint; en la variante `-G` se combina con un ViT-L/14 de DINOv2 congelado, lo que aporta características semánticas de mayor nivel. El emparejamiento se realiza como máximos mutuos de un dual softmax sobre las similitudes entre descripciones, devolviendo pares de índices y su probabilidad.

El entrenamiento se realizó sobre MegaDepth, una colección de fotografías de Internet con profundidad estimada por SfM/MVS. El detector v2 y los descriptores se entrenaron con estos datos; el DINOv2 de la variante `-G` se mantiene congelado y procede de LVD-142M de Meta. No se documentan en la información disponible detalles sobre número de tokens, composición exacta del dataset ni uso de RLHF/DPO (no aplicable a este tipo de modelo).

La integración de fastforks añade dos backends: `portable` (implementación en PyTorch) y `kernels` (kernels optimizados, aunque en las tablas de rendimiento proporcionadas las celdas de `kernels` aparecen vacías). También se documenta soporte de `torch.compile` (hasta 164 ms en `dedode-v2-b` a 768x1024) y un backend TensorRT fp16 planificado para la versión 0.2.1.

## Capacidades

- Correspondencia densa de imágenes: para cada píxel de la primera imagen devuelve su posición (x, y en píxeles) en la segunda y una certeza de visibilidad.
- Correspondencia dispersa: devuelve los keypoints de ambas imágenes y los pares de índices emparejados, con sus puntuaciones.
- Detección de hasta 10.000 keypoints por imagen.
- Emparejamiento robusto mediante dual softmax y máximos mutuos.
- Salidas estructuradas: `keypoints1`, `keypoints2`, `pairs`, `scores`.
- Entrada de tamaño flexible: cualquier H x W >= 32, con padding a múltiplo de 32; probado hasta 3000x4000.
- Integración con pipelines de estructura desde movimiento (SfM) para reconstruir poses de cámara a partir de una carpeta de imágenes.
- Backends `portable` y `kernels`; soporte de `torch.compile`.
- No dispone de tool calling, agentes, razonamiento multi-paso ni capacidades lingüísticas: es un modelo puramente visual de matching.

## Casos de uso

- Reconstrucción 3D y estructura desde movimiento (SfM): el modelo proporciona correspondencias densas entre pares de imágenes de una misma escena, que alimentan la estimación de poses de cámara y la triangulación de puntos 3D. Es adecuado por su robustez en escenas con cambios de punto de vista y su salida de certeza por píxel.
- Registro de imágenes (image registration): alineación de imágenes médicas, satelitales o de inspección industrial tomadas en momentos o ángulos distintos, usando los pares de keypoints y sus puntuaciones para estimar homografías o transformaciones.
- Odometría visual y SLAM: seguimiento de puntos entre fotogramas consecutivos de vídeo para estimar el movimiento de la cámara; la variante `-b` ofrece latencias de 246 ms a 768x1024, compatible con aplicaciones de tiempo casi real en GPU de consumo.
- Fotogrametría y modelado 3D: generación de nubes de puntos a partir de conjuntos de fotos de un objeto o edificio, aprovechando la capacidad de procesar imágenes de hasta 3000x4000 con un pico de memoria de 1,9-2,5 GiB.
- Aumento de realidad y superposición de contenido: estimación de la correspondencia entre la vista de la cámara y una imagen de referencia para anclar elementos virtuales sobre superficies reales.
- Emparejamiento de imágenes para búsqueda visual o verificación: comparación de pares de imágenes para determinar si muestran la misma escena y qué zonas coinciden, usando la certeza por píxel como señal de confianza.
- Evaluación comparativa de matchers: al devolver keypoints, pares y puntuaciones con protocolo documentado (RANSAC con umbral de 0,5 px, AUC de error de pose), sirve como referencia en estudios de correspondencia geométrica.

## Benchmarks y rendimiento

Precisión en MegaDepth-1500 (cada 10º par; AUC de error relativo de pose @5 / @10 / @20 grados, RANSAC con matriz esencial y umbral de 0,5 px):

| Variante | Original fp16 | Portable |
|---|---|---|
| `dedode-v2-b` | 57,3 / 71,5 / 82,5 | 54,6 / 71,8 / 83,1 |

Velocidad y memoria en matching sintético a 768x1024 (RTX 5060 Ti 16 GB, sm_120):

| Modelo | Tiempo original | Tiempo portable | Memoria pico original (MiB alloc/reserved) | Memoria pico portable (MiB alloc/reserved) |
|---|---|---|---|---|
| `dedode-v2-b` | 318 ms | 246 ms | 1734 / 1992 | 1535 / 1654 |
| `dedode-v2-g` | 666 ms | 592 ms | 2335 / 2472 | 2142 / 2334 |

Arranque y primera llamada:

| Modelo | Carga original (s) | Carga portable (s) | Primera llamada original (s) | Primera llamada portable (s) |
|---|---|---|---|---|
| `dedode-v2-b` | 3,73 | 0,67 | 1,10 | 0,75 |
| `dedode-v2-g` | 6,36 | 1,12 | 1,51 | 1,04 |

`torch.compile` a 768x1024: `dedode-v2-b` pasa de 246 ms (portable) a 164 ms (compile), con 50,5 s de compilación en frío y pico de 1893/2434 MiB; `dedode-v2-g` pasa de 592 ms a 330 ms, con 86,4 s de compilación y pico de 2881/3316 MiB. TensorRT fp16 está planificado para la versión 0.2.1. Los resultados de precisión se midieron sobre la parte indicada como "NVI" (texto truncado en la información disponible).

## Requisitos de hardware

- VRAM estimada para inferencia: alrededor de 1,5-1,7 GiB de pico en `dedode-v2-b` y 2,1-2,3 GiB en `dedode-v2-g` a 768x1024 en el backend portable; hasta 1,9-2,5 GiB de pico asignado a 3000x4000.
- GPU recomendadas: RTX 5060 Ti 16 GB es la referencia medida; cualquier GPU con al menos 4-6 GiB libres debería poder ejecutar las variantes a resoluciones moderadas. A100 y H100 no están documentadas en la información disponible.
- Cabe en GPU de consumo: sí, con las cifras anteriores; se ha validado en RTX 5060 Ti 16 GB (sm_120).
- Opciones de despliegue: librería `fastforks` con backends `portable` y `kernels`; soporte de `torch.compile`; TensorRT fp16 planificado para 0.2.1. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplicables a un modelo de visión).
- Latencia y throughput: 246 ms por par a 768x1024 con `dedode-v2-b` portable y 592 ms con `-g`; 164 ms y 330 ms respectivamente con `torch.compile`. El throughput no se documenta explícitamente.

## Comparativa con modelos similares

| Modelo | Tipo | Keypoints | Contexto de entrada | Precisión (MegaDepth-1500 AUC@5) | Licencia |
|---|---|---|---|---|---|
| DeDoDe v2 (`-b` / `-g`) | Denso y disperso | hasta 10.000 por imagen | H x W >= 32, probado 3000x4000 | 54,6-57,3 (según backend) | MIT |
| LightGlue | Disperso | según detector | no disponible | no disponible en esta información | no disponible |
| LoFTR | Denso | no disponible | no disponible | no disponible en esta información | no disponible |
| XFeat | Disperso | no disponible | no disponible | no disponible en esta información | no disponible |

La información proporcionada menciona LightGlue, XFeat y LoFTR como matchers comparables en el protocolo de evaluación, pero no incluye sus cifras de precisión ni sus condiciones de licencia, por lo que no se pueden detallar aquí.

## Limitaciones y advertencias

- Modelo puramente visual: no procesa texto, no tiene capacidades lingüísticas ni de razonamiento, y no soporta tool calling ni agentes.
- Entrenado sobre MegaDepth (fotografías de Internet con profundidad SfM/MVS): el rendimiento puede degradarse en dominios alejados de escenas naturales, como imágenes médicas, satelitales o de interiores sintéticos.
- La variante `-G` incorpora DINOv2 ViT-L/14 con su propia licencia (`LICENSE-DINOv2`); conviene revisarla antes de un uso comercial, aunque los pesos de DeDoDe se declaran MIT.
- El repositorio `fastforks/dedode` no aloja pesos: depende de enlaces externos de los autores y de la verificación SHA-256; si esos enlaces cambian o desaparecen, la reproducibilidad se ve afectada.
- El backend `kernels` aparece en las tablas de rendimiento sin valores medidos, y TensorRT fp16 está planificado para 0.2.1 pero no disponible en la versión documentada.
- La integración se marca como "experimental" y "research-use package"; no hay evidencia de uso en producción a gran escala.
- Riesgo de alucinación de correspondencias: el modelo puede devolver pares con baja certeza en regiones ocluidas o sin textura; es recomendable filtrar por la puntuación devuelta y validar con RANSAC.
- No se documentan sesgos demográficos ni geográficos específicos, pero al entrenarse con fotografías de Internet puede heredar sesgos de representación de MegaDepth.
- El texto de precisión de la model card aparece truncado ("Measured on NVI"), por lo que parte de la metodología de evaluación no está completamente disponible.

## Enlaces

- Hugging Face: https://huggingface.co/fastforks/dedode
- Código de la integración fastforks: https://github.com/kleinicke/fastforks
- Kernels para el backend `kernels`: https://huggingface.co/fastforks/kernels
- Código original de DeDoDe: https://github.com/Parskatt/DeDoDe (commit `6d156183f4dc`)
- Pesos del detector v2: https://github.com/Parskatt/DeDoDe/releases/download/v2/dedode_detector_L_v2.pth
- Pesos del descriptor B: https://github.com/Parskatt/DeDoDe/releases/download/dedode_pretrained_models/dedode_descriptor_B.pth
- Pesos del descriptor G: https://github.com/Parskatt/DeDoDe/releases/download/dedode_pretrained_models/dedode_descriptor_G.pth
- Pesos de DINOv2 ViT-L/14: https://dl.fbaipublicfiles.com/dinov2/dinov2_vitl14/dinov2_vitl14_pretrain.pth
- Documentación de benchmarks: https://github.com/kleinicke/fastforks/blob/main/docs/benchmarks.md
- Ficha de estructura desde movimiento: ../sfm.md
- Licencia del código original: https://github.com/Parskatt/DeDoDe/blob/6d156183f4dc84cd704ae779eebc8350995c5b06/LICENSE
- Sección de licencia del README original: https://github.com/Parskatt/DeDoDe/blob/6d156183f4dc84cd704ae779eebc8350995c5b06/README.md#license
