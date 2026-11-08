# shu223/Depth-Anything-3-Small-MultiView-CoreML

## Resumen

Depth Anything 3 Small Multi-View Core ML es una conversión a Core ML del modelo Depth Anything 3 Small (DA3-SMALL) de ByteDance, publicada por el desarrollador shu223. A diferencia de otras conversiones disponibles en el Hub, esta conserva la ruta multivista del modelo original: recibe dos o tres fotografías junto con sus poses de cámara (por ejemplo, obtenidas de ARKit) y devuelve un mapa de profundidad y otro de confianza por cada vista, además de la pose estimada. La profundidad de todas las vistas sale en un marco consistente, lo que permite fusionarla en una malla o nube de puntos y escalarla a metros con las poses de entrada.

El modelo base DA3-SMALL tiene 0,08 mil millones de parámetros y combina un backbone DINOv2 ViT-S/14 con una cabeza DualDPT. Esta conversión reescribe el grafo para ejecutarse en el Neural Engine del iPhone: la atención entre vistas se calcula por cortes (slices), la cabeza de profundidad y el tamaño de entrada se modifican para ganar velocidad, y los pesos se mantienen en FP16. El paquete ocupa 0,2 GB en total, con ficheros individuales de 72 a 87 MB.

Su relevancia es práctica: permite reconstrucción 3D y escaneo en dispositivo sin conexión, con latencias de 91 ms en un iPhone 17 Pro y 183 ms en un iPhone 12 Pro para la variante recomendada de 3 vistas a 392 × 392. La licencia Apache 2.0 facilita su integración en aplicaciones comerciales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con backbone DINOv2 ViT-S/14 y cabeza DualDPT; ruta multivista condicionada por pose |
| Parametros totales | 0,08 mil millones (80 M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; entrada de 2 o 3 vistas de 392 × 392 o 504 × 504) |
| Tipos de cuantizacion | FP16 (pesos originales); conversión Core ML |
| Idiomas soportados | no disponible (modelo de visión, sin procesamiento de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | Core ML `.mlpackage` / `.mlmodelc` |
| Pipeline | depth-estimation |
| Modelo base | depth-anything/DA3-SMALL |
| Tamano del repositorio | 0,2 GB |
| Requisitos minimos | iOS 17 (variante 504 sin cortes) / iOS 18 (resto) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de Depth Anything 3 Small: un transformer de visión con backbone DINOv2 ViT-S/14 y una cabeza DualDPT que produce profundidad y confianza. La innovación de DA3 frente a versiones anteriores es la ruta multivista condicionada por pose: el modelo procesa simultáneamente varias vistas, inyecta las poses de cámara como condicionamiento y genera profundidad en un marco de referencia común, lo que permite fusionar las predicciones sin estimar escalas relativas entre vistas.

Esta conversión no reentrena el modelo: parte de los pesos originales en FP16 y reescribe el grafo para Core ML. Los cambios incluyen atención entre vistas calculada por cortes (8 cortes para 3 vistas a 392, 16 cortes para 504), rediseño de la cabeza de profundidad y ajuste del tamaño de entrada. La variante `504-sliced` mantiene exactamente el mismo `weight.bin` que la conversión plana y solo reordena operaciones, con una diferencia de profundidad media de 0,03–0,05 % frente al modelo PyTorch original en Mac. Las variantes `fast` sacrifican algo de precisión en bordes de objetos a cambio de velocidad (la salida de pose no cambia). No se dispone de información sobre el dataset de entrenamiento original ni sobre si hubo RLHF o DPO, ya que es un modelo de visión.

## Capacidades

- Estimación de profundidad multivista con 2 o 3 imágenes de entrada en una sola inferencia.
- Condicionamiento por pose de cámara: acepta extrínsecos (mundo-a-cámara normalizados) e intrínsecos como entrada.
- Salida de mapa de profundidad y mapa de confianza por cada vista, en un marco consistente entre vistas.
- Estimación de pose de cámara a partir de las imágenes.
- Fusión de profundidad en malla (TSDF) o nube de puntos, con escala métrica derivada de las poses de entrada.
- Integración con ARKit para obtener poses en dispositivos iOS.
- Ejecución en dispositivo en el Neural Engine de Apple (iPhone y Apple Silicon).
- No soporta texto, tool calling, agentes ni capacidades multilingües: es un modelo puramente visual.

## Casos de uso

- Escaneo 3D con ARKit en iPhone: la variante `3views-392-fast` está pensada para capturar varias vistas con poses de ARKit y fusionar la profundidad en una malla TSDF en tiempo real; el autor reporta 270–293 ms por inferencia en un iPhone 12 Pro dentro de una app de escaneo que además construye la malla en GPU.
- Reconstrucción de nubes de puntos: con 2 o 3 fotos y sus poses, la profundidad consistente entre vistas permite generar una nube de puntos directamente, sin alinear escalas manualmente.
- Digitalización de objetos y espacios: captura de un objeto desde varios ángulos para obtener geometría aproximada en el dispositivo, sin subir imágenes a un servidor.
- Realidad aumentada: estimación de profundidad por fotograma para oclusión y colocación de objetos virtuales, con latencias de 53,6–54,6 ms en la variante de 2 vistas en iPhone 17 Pro.
- Aplicaciones de fotografía computacional: generación de mapas de profundidad para efectos de desenfoque o recorte que requieran coherencia entre varias tomas de la misma escena.
- Procesamiento offline y privado: al ejecutarse íntegramente en el Neural Engine, es adecuado para aplicaciones donde las imágenes no pueden salir del dispositivo (salud, industria, documentación de campo).
- Prototipado en Apple Silicon: las variantes Core ML pueden ejecutarse en Mac para validar la integración antes de desplegar en iPhone.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible, al tratarse de un modelo de visión. Sí se han publicado mediciones de latencia en dispositivo:

| Dispositivo | Comparación | Condición | Resultado |
|---|---|---|---|
| iPhone 17 Pro (A19 Pro) | `3views-504-sliced` → `3views-392-fast` | Imágenes fijas, build Debug | 224 → 91 ms |
| iPhone 12 Pro (A14) | `3views-504-sliced` → `3views-392-fast` | Imágenes fijas, build Debug | 579,5 → 183,4 ms |
| iPhone 17 Pro (A19 Pro) | `2views-392-fast` | Imágenes fijas, build Debug | 53,6–54,6 ms |
| iPhone 17 Pro (A19 Pro) | `3views-504` → `3views-504-sliced` | Release, ARKit, a mano, 120 s desde estado térmico nominal | 464,3 → 310,5 ms; memoria de app 1.121 → 762 MB |
| iPhone 12 Pro (A14) | `3views-504` → `3views-504-sliced` | Release, ARKit, a mano, 1 min | 774 → 566 ms; memoria del Neural Engine 760 → 367 MB |
| iPhone 12 Pro (A14) | `3views-392-fast` | App de escaneo con malla TSDF en GPU, Debug, a mano 1–2 min, estado térmico serio | 270–293 ms por inferencia; memoria de app 330–356 MB |

Precisión relativa: la variante `504-sliced` presenta una diferencia de profundidad media de 0,03–0,05 % frente al modelo PyTorch original en Mac. Con poses de ARKit, la escala métrica de los ficheros de 392 difiere de la del fichero `504-sliced` en una mediana del 2,6 % (3 vistas) y del 4,5 % (2 vistas).

## Comparativa con modelos similares

| Modelo | Parametros | Vistas | Entrada | Formato | Licencia | Notas |
|---|---|---|---|---|---|---|
| Depth-Anything-3-Small-MultiView-CoreML (este) | 80 M | 2 o 3 | 392 × 392 o 504 × 504 | Core ML | Apache 2.0 | Ruta multivista con poses; latencias de 91–566 ms en iPhone |
| mlboydaisuke/Depth-Anything-3-Small-CoreML | 80 M | 1 | no disponible | Core ML | no disponible | Primera conversión pública de DA3 a Core ML; una imagen por inferencia |
| depth-anything-small (Core ML, vía coreml-examples) | no disponible | 1 | configurable | Core ML | no disponible | Conversión de Depth Anything v1; solo profundidad monocular |
| depth-anything-v2-small (Core ML, vía coreml-examples) | no disponible | 1 | configurable | Core ML | no disponible | Conversión de Depth Anything v2; solo profundidad monocular |

## Limitaciones y advertencias

- Las variantes `fast` degradan ligeramente la profundidad y la confianza, sobre todo en bordes de objetos; la salida de pose no se ve afectada.
- Con poses de ARKit, la escala métrica de los ficheros de 392 difiere de la del `504-sliced` en una mediana del 2,6 % (3 vistas) y del 4,5 % (2 vistas), lo que puede acumular error en fusiones a gran escala.
- La primera carga compila el modelo para el Neural Engine y puede tardar de uno a varios minutos en un iPhone 12 Pro.
- Ciertas combinaciones no funcionan en el Neural Engine del iPhone 17 Pro: un fichero de 2 vistas a 504 cortado en 16 y un fichero de 3 vistas a 392 cortado en 16 no completan la primera inferencia; por eso el autor publica 2 vistas a 392 y 3 vistas a 392 con 8 cortes.
- El modelo solo admite 2 o 3 vistas por inferencia; no está pensado para secuencias largas ni para muchas vistas simultáneas.
- Es un modelo de visión: no procesa texto, no soporta tool calling ni agentes, y no tiene capacidades multilingües.
- No se han publicado evaluaciones de sesgo ni de robustez frente a escenas difíciles (superficies reflectantes, texturas repetitivas, iluminación extrema).
- La licencia Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base DA3-SMALL y de los pesos originales.
- Las mediciones de latencia proceden de dos dispositivos y condiciones heterogéneas; no deben extrapolarse sin validación en el hardware objetivo.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/shu223/Depth-Anything-3-Small-MultiView-CoreML)
- [Modelo base DA3-SMALL](https://huggingface.co/depth-anything/DA3-SMALL)
- [Conversión Core ML monocular de DA3 (mlboydaisuke)](https://huggingface.co/mlboydaisuke/Depth-Anything-3-Small-CoreML)
- [Tutorial de conversión Depth Anything a Core ML (huggingface/coreml-examples)](https://github.com/huggingface/coreml-examples/blob/main/tutorials/depth-anything-coreml-guide.ipynb)
- [Paper de Depth Anything 3 (arXiv:2511.10647)](https://arxiv.org/abs/2511.10647)
