# litert-community/pvt_v2_b1

## Resumen

PVT v2 B1 es un modelo de clasificación de imágenes basado en la arquitectura Pyramid Vision Transformer de segunda generación (PVT v2), publicado originalmente por Wenhai Wang y colaboradores y disponible como pesos preentrenados en ImageNet-1k a través de la librería `timm` (identificador `timm/pvt_v2_b1.in1k`). Esta ficha concreta corresponde a la conversión del modelo a formato LiteRT (TFLite), realizada por la comunidad `litert-community` para su despliegue en entornos de inferencia ligera, especialmente dispositivos móviles y edge.

El modelo resuelve la tarea de clasificación de imágenes en 1.000 clases de ImageNet y también puede emplearse como backbone de extracción de características para tareas de visión por computador. Con 14 millones de parámetros, 2,1 GMACs y una resolución de entrada de 224x224 píxeles, es un modelo compacto pensado para escenarios donde el coste computacional y el tamaño del binario importan más que la precisión máxima.

Su relevancia actual radica en la combinación de una arquitectura transformer con atención piramidal (que reduce el coste cuadrático de la atención en resoluciones altas) y un formato de despliegue optimizado para LiteRT, lo que facilita su integración en aplicaciones móviles Android, IoT y sistemas embebidos sin necesidad de infraestructura GPU dedicada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pyramid Vision Transformer v2 (PVT v2), transformer con atención piramidal |
| Parametros totales | 14,0 M |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión; entrada de imagen 224x224) |
| Tipos de cuantizacion | no disponible (el repo distribuye `model.tflite`; se desconoce si está cuantizado) |
| Idiomas soportados | no disponible (modelo de visión, sin procesamiento de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | TFLite (`model.tflite`), vía librería LiteRT |
| GMACs | 2,1 |
| Activaciones | 15,4 M |
| Tamano de imagen de entrada | 224 x 224 |
| Dataset de entrenamiento | ImageNet-1k |
| Modelo base | timm/pvt_v2_b1.in1k |

## Arquitectura y entrenamiento

PVT v2 es una evolución del Pyramid Vision Transformer que introduce mejoras sobre la versión original: convoluciones en la proyección de parches (patch embedding) para capturar información local, atención con complejidad lineal mediante reducción de la resolución espacial de las claves y valores, y un diseño de bloques con conexiones residuales superpuestas. La arquitectura produce una jerarquía de mapas de características a múltiples escalas (pirámide), lo que la hace adecuada tanto para clasificación como para detección y segmentación como backbone.

El modelo fue preentrenado y ajustado en ImageNet-1k (1.000 clases) según la model card del modelo base en `timm`. No se dispone en la información proporcionada de detalles sobre el número exacto de tokens de entrenamiento, la composición del dataset más allá de ImageNet-1k, ni sobre si se aplicaron técnicas de RLHF o DPO (no aplicables en un modelo de clasificación de imágenes). La innovación técnica destacable es la atención piramidal con coste lineal, que reduce los 2,1 GMACs necesarios para una pasada a 224x224, habilitando inferencia eficiente en hardware limitado.

## Capacidades

- Clasificación de imágenes en 1.000 clases de ImageNet-1k.
- Extracción de características (feature backbone) a múltiples escalas gracias a la estructura piramidal.
- Procesamiento de imágenes RGB de 224x224 píxeles como entrada estándar.
- Inferencia en formato LiteRT/TFLite, orientada a dispositivos móviles y edge.
- No dispone de soporte de tool calling ni function calling (no es un modelo de lenguaje).
- No dispone de capacidades de agente ni de razonamiento multi-paso.
- No dispone de capacidades multilingües (no procesa texto).
- No dispone de modo thinking, visión generativa, audio ni otras capacidades multimodales más allá de la clasificación de imágenes.

## Casos de uso

- Clasificación de imágenes en aplicaciones móviles Android: el modelo en formato TFLite puede integrarse directamente en apps mediante LiteRT, clasificando fotos del usuario en las 1.000 clases de ImageNet con un coste de 2,1 GMACs por inferencia, adecuado para ejecución en CPU móvil.
- Filtrado y moderación de contenido visual en el dispositivo: gracias a su bajo coste computacional y tamaño reducido (repo de 0,1 GB), puede ejecutarse localmente para preclasificar imágenes antes de enviarlas a un servidor, reduciendo latencia y ancho de banda.
- Backbone para tareas de visión personalizadas: la salida piramidal permite conectar cabezas de detección o segmentación y hacer fine-tuning sobre dominios específicos (por ejemplo, inspección industrial o agricultura de precisión).
- Sistemas de visión en IoT y embebidos: con 14 M de parámetros y 15,4 M de activaciones, es viable en placas con recursos limitados donde modelos como ViT-Base no caben.
- Clasificación rápida en pipelines de datos: para etiquetar grandes volúmenes de imágenes en servidores CPU sin GPU, el formato TFLite y su reducido coste lo hacen adecuado para preprocesamiento masivo.
- Prototipado de aplicaciones de visión en entornos edge: útil para validar una idea de producto con un modelo preentrenado en ImageNet antes de invertir en un modelo mayor o en entrenamiento específico.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 14 M de parámetros y 15,4 M de activaciones, el modelo es muy ligero y cabe holgadamente en cualquier GPU consumer (por debajo de 1 GB en FP32 para los pesos).
- GPU recomendadas: no requiere GPU dedicada; puede ejecutarse en CPU. En caso de usar GPU, cualquier modelo consumer moderna (RTX 3060 o superior) es más que suficiente.
- Cabe en GPU consumer: sí, en cualquier GPU consumer actual e incluso en iGPU.
- Opciones de despliegue: LiteRT (TFLite) como formato principal; también puede desplegarse el modelo base `timm/pvt_v2_b1.in1k` mediante PyTorch/Timm, ONNX Runtime u otras herramientas compatibles con `timm`.
- Latencia y throughput estimados: no disponible en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto/entrada | GMACs | Licencia | Formato |
|---|---|---|---|---|---|
| PVT v2 B1 (este) | 14,0 M | 224x224 | 2,1 | no disponible | TFLite (LiteRT) |
| PVT v2 B0 | no disponible en la información | 224x224 | no disponible | no disponible | timm (PyTorch) |
| ViT-Base/16 | ~86 M | 224x224 | ~17,6 | según implementación | PyTorch/ONNX |
| DeiT-Tiny | ~5 M | 224x224 | ~1,3 | según implementación | PyTorch/ONNX |

Nota: los datos de PVT v2 B0, ViT-Base/16 y DeiT-Tiny no provienen de la información proporcionada en esta ficha y deben verificarse en sus respectivas model cards; se incluyen únicamente como referencia orientativa de categoría.

## Limitaciones y advertencias

- Sesgos conocidos: al estar entrenado en ImageNet-1k, hereda los sesgos de dicho dataset (posibles desequilibrios de clase, sesgos geográficos y culturales en las imágenes).
- Riesgo de alucinación: no aplica en el sentido generativo, pero el modelo puede producir clasificaciones erróneas con alta confianza en imágenes fuera de distribución.
- Limitaciones de contexto o idioma: no procesa texto ni lenguaje; su entrada está restringida a imágenes de 224x224 y a las 1.000 clases de ImageNet.
- Restricciones de licencia para uso comercial: la licencia no está disponible en la información proporcionada; es imprescindible verificar los términos del modelo base `timm/pvt_v2_b1.in1k` y del repositorio `litert-community` antes de un uso comercial.
- Caveat para producción: el repo distribuye únicamente `model.tflite`; no se especifica si los pesos están cuantizados ni con qué esquema, lo que puede afectar a la precisión respecto al modelo original en PyTorch. Se recomienda validar la precisión en el dominio objetivo antes de desplegar.

## Enlaces

- Hugging Face: https://huggingface.co/litert-community/pvt_v2_b1
- Modelo base en timm: https://huggingface.co/timm/pvt_v2_b1.in1k
- Paper PVT v2: https://arxiv.org/abs/2106.13797
- Repositorio original PVT: https://github.com/whai362/PVT
