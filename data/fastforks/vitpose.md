# fastforks/vitpose

## Resumen

ViTPose es un modelo de estimación de pose humana 2D del tipo top-down, presentado por Xu et al. en 2022. Combina un codificador ViT (Vision Transformer) estándar, sin modificaciones específicas para la tarea, con un decodificador ligero de deconvolución o bilineal que produce mapas de calor de keypoints. La variante ViTPose++ entrena un único backbone sobre seis conjuntos de datos de pose simultáneamente, usando expertos MLP por conjunto de datos para especializar la predicción. El modelo recibe una imagen RGB y una caja delimitadora por persona, recorta cada instancia a 256 x 192 píxeles y devuelve los 17 keypoints del formato COCO con decodificación subpíxel DARK.

El repositorio `fastforks/vitpose` no aloja pesos: es una model card que actúa como manifiesto de integración. La librería fastforks descarga los pesos originales de los repositorios del autor (`usyd-community/vitpose-base`, `vitpose-plus-*`) y verifica su integridad mediante SHA-256. Están disponibles seis variantes: `vitpose-base`, `vitpose-base-simple`, `vitpose-plus-small`, `vitpose-plus-base`, `vitpose-plus-large` y `vitpose-plus-huge`, todas con licencia Apache-2.0 y uso comercial permitido.

La relevancia práctica del modelo radica en su rendimiento y eficiencia: en una imagen sintética de 1080x1920, la variante `vitpose-plus-small` con backend `kernels` tarda 6,05 ms por inferencia con 145 MiB de memoria pico reservada, mientras que `vitpose-plus-huge` tarda 62,5 ms con 1.351 MiB. Esto lo hace adecuado tanto para pipelines de vídeo en tiempo real en GPU de consumo como para análisis de alta precisión en servidores.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer ViT (codificador) + decodificador ligero de deconvolucion o bilineal; ViTPose++ con expertos MLP por conjunto de datos |
| Parametros totales | No disponible (variantes small, base, large y huge; cifras concretas no publicadas en la informacion) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (modelo de vision; entrada de cualquier H x W >= 32, rellenada a multiplo de 32) |
| Tipos de cuantizacion | No disponible (los pesos se distribuyen en safetensors; se documenta ejecucion en fp16 y fp32) |
| Idiomas soportados | No disponible (modelo de vision, no linguistico) |
| Licencia | Apache-2.0 (codigo y pesos; uso comercial permitido) |
| Formato de pesos | safetensors (verificados por SHA-256) |

## Arquitectura y entrenamiento

ViTPose emplea un codificador ViT plano, sin las modificaciones específicas para visión densa que usan otras arquitecturas de pose, y un decodificador ligero que puede ser de deconvolución o bilineal. La simplicidad del diseño permite escalar el backbone sin rediseñar la cabeza. La decodificación de los mapas de calor usa DARK, una técnica de decodificación subpíxel que mejora la precisión de las coordenadas sin aumentar la resolución de los mapas de calor.

El entrenamiento usa COCO 2017 (anotaciones de instancias y keypoints) e ImageNet-1k para la inicialización del ViT mediante preentrenamiento MAE. La variante ViTPose++ entrena un único backbone sobre seis conjuntos de datos de pose y añade expertos MLP por conjunto de datos, lo que permite compartir representaciones generales y especializar la predicción final. No se documentan en la información disponible detalles sobre RLHF, DPO ni el número exacto de tokens de entrenamiento.

La integración de fastforks añade dos backends: `portable`, que mapea recortes a mapas de calor de forma directa, y `kernels`, que usa kernels optimizados publicados en `fastforks/kernels`. El backend `kernels` ofrece aceleraciones de entre 1,3x y 1,7x frente al portable y de hasta 17,2x frente a la implementación original en fp32.

## Capacidades

- Estimación de pose humana 2D top-down: devuelve 17 keypoints COCO (`keypoints`) con puntuaciones de confianza (`keypoint_scores`) por cada persona.
- Detección asociada: el pipeline devuelve también `boxes` y `scores`, lo que permite encadenar detección y pose en un solo flujo.
- Entrada de cualquier resolución H x W mayor o igual a 32, con relleno a múltiplo de 32; probado hasta 3000x4000 píxeles.
- Procesamiento por lotes de múltiples personas en una misma imagen, una caja por persona.
- Dos backends intercambiables: `portable` (sin dependencias de kernels) y `kernels` (optimizado para CUDA).
- Compatibilidad con `torch.compile` y exportación a TensorRT fp16 y ONNX.
- No soporta tool calling, agentes, razonamiento multi-step ni capacidades multilingües: es un modelo puramente visual.

## Casos de uso

- Análisis de vídeo deportivo en tiempo real: con `vitpose-plus-small` y backend `kernels` se pueden procesar fotogramas de 1080x1920 en 6,05 ms (más de 160 FPS teóricos en una RTX 5060 Ti), lo que permite extraer esqueletos para análisis de técnica, biomecánica o seguimiento de jugadores.
- Monitorización de ergonomía en puestos de trabajo: el modelo detecta posturas a partir de una cámara RGB y devuelve keypoints con confianza, útiles para alertar de posturas de riesgo en tiempo real sin necesidad de sensores vestibles.
- Rehabilitación y fisioterapia: comparación de ángulos articulares entre sesiones mediante los 17 keypoints COCO, con la variante `vitpose-plus-huge` para mayor precisión cuando la latencia no es crítica (62,5 ms por inferencia).
- Animación y captura de movimiento: generación de esqueletos para rigging en pipelines de producción 3D, usando `vitpose-plus-base` como equilibrio entre precisión y coste (11,9 ms con backend `kernels`).
- Seguridad y análisis de multitudes: detección de personas y estimación de pose en imágenes de alta resolución (hasta 3000x4000) para identificar caídas, aglomeraciones o comportamientos anómalos.
- Investigación en visión por computador: el modelo sirve como baseline reproducible para experimentos de pose estimation, con pesos verificados por SHA-256 y licencia Apache-2.0 que facilita la comparación pública.
- Integración en pipelines de robótica: estimación de pose de operarios para sistemas de seguridad en entornos colaborativos, aprovechando la baja latencia de las variantes small y base.

## Benchmarks y rendimiento

Los datos disponibles son de latencia y memoria, no de precisión (AP/AR) sobre COCO. Se presentan a continuación las métricas de velocidad y memoria publicadas.

| Modelo | Tiempo original fp32 (ms) | Original (ms) | Portable (ms) | Kernels (ms) | Aceleración kernels vs original | Memoria pico kernels (MiB, alloc/reserved) |
|---|---|---|---|---|---|---|
| `vitpose-base` | 139 | 105 | 17,8 | 12,0 | 8,8x | 274 / 364 |
| `vitpose-base-simple` | 145 | 109 | 20,1 | 12,1 | 9,0x | 295 / 344 |
| `vitpose-plus-base` | 162 | 113 | 19,9 | 11,9 | 9,5x | 274 / 344 |
| `vitpose-plus-huge` | 610 | 242 | 104 | 62,5 | 3,9x | 1.351 / 1.406 |
| `vitpose-plus-large` | 331 | 165 | 53,7 | 33,2 | 5,0x | 706 / 764 |
| `vitpose-plus-small` | 120 | 104 | 7,83 | 6,05 | 17,2x | 145 / 198 |

Mediciones sobre imagen sintética de 1080x1920, según la model card. No se han publicado resultados de benchmarks de precisión (AP, AR) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: desde 145 MiB reservados (`vitpose-plus-small`, backend `kernels`) hasta 1.406 MiB (`vitpose-plus-huge`, backend `kernels`) para una imagen de 1080x1920 en fp16.
- Para imágenes de 3000x4000, el pico de memoria asignada en fp16 con backend portable va de 4,4 GiB (`vitpose-plus-small`) a 5,5 GiB (`vitpose-plus-huge`).
- GPU recomendadas: cualquier GPU CUDA con al menos 2 GB de VRAM para las variantes small y base; para `vitpose-plus-huge` se recomienda al menos 4 GB. Los datos de la model card se obtuvieron en una RTX 5060 Ti de 16 GB.
- Cabe en GPU de consumo: sí, todas las variantes caben en GPUs consumer modernas (RTX 3060 en adelante) para resoluciones habituales.
- Opciones de despliegue: librería fastforks (backends `portable` y `kernels`), exportación a ONNX y TensorRT fp16, y compatibilidad con `torch.compile`.
- Latencia y throughput: en 1080x1920 con backend `kernels`, de 6,05 ms (`vitpose-plus-small`) a 62,5 ms (`vitpose-plus-huge`). El tiempo de carga del modelo va de 0,34 s a 2,26 s según variante y backend.

## Comparativa con modelos similares

No se dispone de datos de otros modelos de estimación de pose en la información proporcionada, por lo que no es posible establecer una comparativa rigurosa con alternativas como HRNet, RTMPose o MMPose. Se indica "no disponible".

## Limitaciones y advertencias

- Es un modelo top-down: requiere una caja delimitadora por persona como entrada; la calidad de la detección previa condiciona directamente la precisión de la pose.
- No se han publicado métricas de precisión (AP/AR) en la información disponible, por lo que no se puede evaluar su rendimiento frente a otros modelos sin pruebas propias.
- El repositorio no aloja pesos: la descarga depende de los repositorios del autor (`usyd-community/*`) y de la verificación SHA-256; si esos repositorios cambian o desaparecen, la integración puede romperse.
- La model card advierte de que las cadenas de licencia originales se registran tal cual y que el paquete es de uso de investigación; aunque la licencia declarada es Apache-2.0 y permite uso comercial, conviene revisar los ficheros `LICENSE` antes de desplegar en producción.
- No es un modelo lingüístico: no soporta generación de texto, tool calling ni agentes; cualquier caso de uso que requiera esas capacidades necesita un modelo adicional.
- El rendimiento en imágenes de muy alta resolución (3000x4000) consume entre 4,4 y 5,5 GiB de VRAM en fp16, lo que puede ser limitante en GPUs de gama baja.
- No se documentan sesgos específicos del modelo en la información disponible; al entrenarse sobre COCO e ImageNet, puede heredar los sesgos de representación de esos conjuntos.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/fastforks/vitpose
- Codigo de fastforks: https://github.com/kleinicke/fastforks
- Kernels del backend: https://huggingface.co/fastforks/kernels
- Codigo original (transformers v4.57.1): https://github.com/huggingface/transformers
- Pesos `vitpose-base`: https://huggingface.co/usyd-community/vitpose-base
- Pesos `vitpose-base-simple`: https://huggingface.co/usyd-community/vitpose-base-simple
- Pesos `vitpose-plus-base`: https://huggingface.co/usyd-community/vitpose-plus-base
- Pesos `vitpose-plus-huge`: https://huggingface.co/usyd-community/vitpose-plus-huge
- Pesos `vitpose-plus-large`: https://huggingface.co/usyd-community/vitpose-plus-large
- Pesos `vitpose-plus-small`: https://huggingface.co/usyd-community/vitpose-plus-small
