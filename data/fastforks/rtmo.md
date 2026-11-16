# fastforks/rtmo

## Resumen

RTMO (Real-Time Multi-person pose estimation, Lu et al. 2024) es un modelo de estimación de pose humana 2D multi-persona en una sola etapa, originalmente desarrollado en OpenMMLab (mmpose). El repositorio `fastforks/rtmo` no aloja pesos: es una model card de integración que documenta cómo el paquete `fastforks` descarga los pesos originales de los autores y los verifica mediante SHA-256, ofreciendo una implementación portátil sin dependencias de mmpose ni mmcv.

La arquitectura combina un backbone CSPDarknet de estilo YOLOX, un cuello híbrido que aplica una capa transformer sobre el mapa de features más grueso y una cabeza que predice por celda de rejilla la puntuación de persona, la caja y un vector de pose. Un clasificador dinámico de coordenadas convierte cada vector de pose en los 17 keypoints COCO mediante bins 1D que abarcan la caja de la persona. El modelo procesa la imagen completa sin necesidad de un detector separado de personas.

El interés actual reside en su rendimiento en tiempo real y en la reducción de memoria de la implementación portátil: en una RTX 5060 Ti 16 GB, `rtmo-l` procesa una imagen de 1080x1920 en 10,8 ms con 208 MiB de memoria pico asignada, frente a los 21,4 ms y 800 MiB de la implementación original. Existe en cuatro variantes (`rtmo-t`, `rtmo-s`, `rtmo-m`, `rtmo-l`) bajo licencia Apache-2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CNN one-stage: backbone CSPDarknet (estilo YOLOX) + cuello híbrido (una capa transformer sobre el mapa más grueso) + cabeza de pose con clasificador dinámico de coordenadas |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión; entrada de cualquier H x W >= 32, con padding a múltiplo de 32) |
| Tipos de cuantizacion | no disponible (se documenta ejecución en fp16 y fp32; TensorRT fp16 en benchmarks) |
| Idiomas soportados | no disponible (no procesa texto) |
| Licencia | Apache-2.0 (código y pesos; uso comercial permitido) |
| Formato de pesos | `.pth` (PyTorch, pesos originales de OpenMMLab, no alojados en el repo); exportación a ONNX documentada en benchmarks |

## Arquitectura y entrenamiento

RTMO es un detector de pose de una sola etapa. El backbone CSPDarknet, inicializado desde un checkpoint de detección YOLOX entrenado en COCO, recorre la imagen una sola vez; el cuello híbrido aplica una única capa transformer sobre el mapa de features de menor resolución para capturar contexto global, y la cabeza predice por cada celda de rejilla una puntuación de persona, una caja y un vector de pose. La decodificación usa un clasificador dinámico de coordenadas que discretiza cada keypoint en bins 1D relativos a la caja de la persona, lo que permite obtener los 17 keypoints COCO sin un detector de personas previo. La imagen se redimensiona con letterbox a 640x640 (416x416 para `rtmo-t`).

El entrenamiento utiliza los keypoints body7 sobre COCO 2017 (train, anotaciones de instancia), AI Challenger Human Keypoints (2017), CrowdPose, MPII Human Pose, sub-JHMDB (J-HMDB), Halpe-FullBody y PoseTrack 2018. No se documenta en la información disponible el número de tokens ni si hubo etapas de RLHF/DPO (no aplicables a un modelo de visión). La innovación destacable es la eliminación del detector de personas separado y la separación entre el pase del backbone (una vez por imagen) y la decodificación con NMS (dependiente del número de detecciones), lo que permite optimizar cada parte por separado.

## Capacidades

- Estimación de pose humana 2D multi-persona en una sola pasada, sin detector de personas externo.
- Detección simultánea de cajas de persona y 17 keypoints COCO con puntuaciones de confianza por keypoint.
- Salidas estructuradas: `keypoints`, `keypoint_scores`, `boxes` y `scores`.
- Procesamiento de imágenes de resolución arbitraria (H x W >= 32, con padding a múltiplo de 32); probado hasta 3000x4000.
- Dos backends de ejecución: `portable` (PyTorch puro) y `kernels` (kernels optimizados publicados en `fastforks/kernels`).
- Exportación a ONNX y compilación con TensorRT fp16 y `torch.compile` documentadas.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingües: es un modelo puramente visual de keypoint detection.

## Casos de uso

- Análisis deportivo en tiempo real: con `rtmo-t` o `rtmo-s` a 6-7 ms por frame en 1080x1920, se puede procesar vídeo a 60 fps o más para extraer la cinemática de varios atletas en una sola pasada, sin detector previo.
- Videovigilancia y análisis de afluencia: `rtmo-l` detecta y estima la pose de múltiples personas en imágenes de alta resolución (hasta 3000x4000 con 0,5 GiB pico), adecuado para contar personas y analizar posturas en escenas concurridas.
- Motion capture sin marcadores para animación: los 17 keypoints COCO con scores permiten reconstruir esqueletos 2D por persona y alimentar pipelines de rigging o retargeting.
- Interacción persona-ordenador y control gestual: la latencia de 2,9 ms con TensorRT fp16 en `rtmo-l` (red sobre recortes de persona) permite respuestas en tiempo real en aplicaciones interactivas.
- Ergonomía y prevención de riesgos laborales: el análisis de posturas (por ejemplo, elevación de brazos o inclinación del tronco) a partir de keypoints permite señalar posturas de riesgo en puestos de trabajo con cámara fija.
- Robótica y vehículos autónomos: la estimación de pose de peatones en la imagen completa, sin detector separado, simplifica el pipeline de percepción y reduce la latencia total.
- Procesamiento por lotes en servidor: la implementación portátil reduce la memoria pico a 121-208 MiB según variante, lo que permite ejecutar varias instancias por GPU en un servidor de inferencia.

## Benchmarks y rendimiento

Datos de la model card (RTX 5060 Ti 16 GB, sm_120, imagen sintética de 1080x1920, fp16 en portable):

| Modelo | Tiempo original fp32 (ms) | Original (ms) | Portable (ms) | Kernels (ms) | Aceleración kernels vs original | Memoria pico portable (MiB, asignada/reservada) |
|---|---|---|---|---|---|---|
| `rtmo-l` | 17,1 | 21,4 | 10,8 | 8,30 | 2,1x | 208 / 226 |
| `rtmo-m` | 14,3 | 17,0 | 8,71 | 6,85 | 2,1x | 166 / 190 |
| `rtmo-s` | 11,4 | 15,5 | 7,48 | 6,27 | 1,8x | 142 / 160 |
| `rtmo-t` | 11,3 | 13,3 | 7,62 | 6,31 | 1,8x | 121 / 136 |

Rendimiento con optimizaciones adicionales (1080x1920):

| Modelo | Portable (ms) | torch.compile (ms) | TensorRT fp16 (ms, solo red sobre recortes) | Kernels (ms) |
|---|---|---|---|---|
| `rtmo-l` | 10,8 | 7,07 | 2,90 | 8,30 |
| `rtmo-m` | 8,71 | 4,99 | 2,03 | 6,85 |
| `rtmo-s` | 7,48 | 3,35 | 1,21 | 6,27 |
| `rtmo-t` | 7,62 | 3,30 | 0,886 | 6,31 |

Tiempos de carga y primera llamada: la carga oscila entre 0,11 s (`rtmo-t`, portable) y 1,52 s (`rtmo-l`, kernels); la primera llamada entre 0,06 s (original) y 0,43 s (portable). La preparación de `torch.compile` requiere entre 14,6 y 18,9 s en frío, y la construcción de ONNX + engine de TensorRT entre 36,7 y 39,6 s. No se han publicado resultados de benchmarks de precisión (AP, mAP) en la información disponible.

## Comparativa con modelos similares

| Modelo | Enfoque | Detector de personas separado | Variantes | Licencia | Notas |
|---|---|---|---|---|---|
| RTMO (fastforks) | One-stage, multi-persona | No | t / s / m / l | Apache-2.0 | 17 keypoints COCO; 6,3-10,8 ms en 1080x1920 (portable) |
| RTMPose (OpenMMLab) | Two-stage (detector + top-down) | Sí | varios tamaños | Apache-2.0 | Mayor precisión por persona a costa de un detector previo; datos concretos no disponibles en esta ficha |
| YOLO-Pose (Ultralytics) | One-stage, multi-persona | No | n / s / m / l / x | AGPL-3.0 (uso comercial condicionado) | Integrado en el ecosistema Ultralytics; datos concretos no disponibles en esta ficha |
| MediaPipe Pose (Google) | Two-stage ligero | Sí (interno) | Lite / Full / Heavy | Apache-2.0 | Optimizado para dispositivos móviles; datos concretos no disponibles en esta ficha |

## Limitaciones y advertencias

- El repositorio no contiene pesos: la ejecución depende de la descarga desde los enlaces de OpenMMLab y de la verificación SHA-256; un fallo de red o un cambio en los enlaces originales rompe la integración.
- Solo detecta las 17 articulaciones del conjunto COCO body7; no cubre keypoints faciales ni de manos (a diferencia de Halpe-FullBody completo), pese a que el entrenamiento incluye ese dataset.
- El rendimiento en escenas con oclusiones severas, multitudes densas o personas de muy pequeño tamaño no está cuantificado en la información disponible.
- La decodificación y el NMS dependen del número de detecciones, por lo que la latencia no es estrictamente constante; los benchmarks con imagen sintética pueden no reflejar escenas reales con muchas personas.
- Los benchmarks se han medido en una única GPU (RTX 5060 Ti 16 GB, sm_120); el rendimiento en otras arquitecturas (A100, H100, RTX 4090) no está documentado.
- Los pesos provienen de un paquete de investigación original; la model card advierte de que se revisen las condiciones antes de usos distintos de la investigación, aunque la licencia declarada es Apache-2.0 con uso comercial permitido.
- Al ser un modelo de visión, no hay riesgo de alucinación textual, pero sí de falsos positivos y keypoints mal localizados en condiciones de iluminación adversa o movimiento rápido.
- No se documentan sesgos demográficos ni evaluaciones de equidad; la precisión puede variar según complexión, ropa o contexto cultural de las personas.

## Enlaces

- Model card en Hugging Face: https://huggingface.co/fastforks/rtmo
- Repositorio del código de integración: https://github.com/kleinicke/fastforks
- Kernels del backend `kernels`: https://huggingface.co/fastforks/kernels
- Código original (mmpose, commit 5408bc76f5b8): https://github.com/open-mmlab/mmpose
- Documentación de benchmarks: https://github.com/kleinicke/fastforks/blob/main/docs/benchmarks.md
- Fichero de definición de modelos y hashes: https://github.com/kleinicke/fastforks/blob/main/src/fastforks/pose/models/rtmo/card.toml
- Pesos `rtmo-l`: https://download.openmmlab.com/mmpose/v1/projects/rtmo/rtmo-l_16xb16-600e_body7-640x640-b37118ce_20231211.pth
- Pesos `rtmo-m`: https://download.openmmlab.com/mmpose/v1/projects/rtmo/rtmo-m_16xb16-600e_body7-640x640-39e78cc4_20231211.pth
- Pesos `rtmo-s`: https://download.openmmlab.com/mmpose/v1/projects/rtmo/rtmo-s_8xb32-600e_body7-640x640-dac2bf74_20231211.pth
- Pesos `rtmo-t`: https://download.openmmlab.com/mmpose/v1/projects/rtmo/rtmo-t_8xb32-600e_body7-416x416-f48f75cb_20231219.pth
- Evidencia de licencia de mmpose: https://github.com/open-mmlab/mmpose/blob/5408bc76f5b848cf925a0d1857899011d8c5b497/README.md#license
