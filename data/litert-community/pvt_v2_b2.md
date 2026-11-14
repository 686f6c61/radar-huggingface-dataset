# litert-community/pvt_v2_b2

## Resumen

PVT v2 B2 es un modelo de clasificación de imágenes basado en Pyramid Vision Transformer, convertido al formato LiteRT (TFLite) por la comunidad litert-community para su despliegue en entornos de inferencia ligera. El modelo original, desarrollado por investigadores de la Universidad de Adelaida, SenseTime y otras instituciones, propone una arquitectura de transformer piramidal con atención lineal por aproximación, diseñada para tareas de visión por computador densas y de clasificación. Esta versión concreta parte del checkpoint `timm/pvt_v2_b2.in1k`, preentrenado en ImageNet-1K, y lo exporta como un único fichero `model.tflite` de aproximadamente 0,2 GB.

El interés de esta conversión reside en la posibilidad de ejecutar un backbone de visión transformer en CPU mediante el runtime LiteRT (anteriormente TensorFlow Lite), sin dependencias de PyTorch ni de GPU. El modelo acepta tensores `float32` en formato NCHW de forma `[1, 3, 224, 224]` y produce logits de 1000 clases de ImageNet-1K. Con 25,4 millones de parámetros y 4,0 GMACs, es un modelo de tamaño medio-bajo, adecuado para clasificación de imágenes en dispositivos con recursos limitados.

La relevancia actual del modelo está acotada: no es un modelo generativo ni conversacional, sino un clasificador de imágenes con licencia no declarada y sin datos de benchmarks publicados en la información disponible. Resulta útil para pipelines de visión clásicos que necesiten un backbone PVT v2 en formato TFLite, especialmente en Android, IoT o entornos embebidos donde LiteRT es el runtime estándar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pyramid Vision Transformer v2 (PVT v2), transformer piramidal con atención lineal aproximada |
| Parametros totales | 25,4 M |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo de visión; entrada fija 224 x 224 px) |
| Tipos de cuantizacion | no disponible (el fichero publicado es `float32`) |
| Idiomas soportados | no disponible (modelo de visión, sin capacidades linguisticas) |
| Licencia | no disponible |
| Formato de pesos | TFLite (`model.tflite`); checkpoint original en safetensors/PyTorch via timm |
| Entrada | tensor `float32` NCHW `[1, 3, 224, 224]` |
| Salida | logits ImageNet-1K `[1, 1000]` |
| GMACs | 4,0 |
| Activaciones | 27,5 M |
| Dataset de entrenamiento | ImageNet-1K |
| Tamano del repositorio | 0,2 GB |
| Runtime | LiteRT (`CompiledModel`), CPU-ready; delegación GPU bloqueada |

## Arquitectura y entrenamiento

PVT v2 es una evolución del Pyramid Vision Transformer original. La arquitectura introduce una jerarquía piramidal de etapas con resoluciones espaciales decrecientes, lo que la hace adecuada tanto para clasificación como para tareas densas (detección, segmentación). La innovación principal de PVT v2 frente a PVT v1 es la sustitución de la atención por convolución espacial reducida (SRA, spatial-reduction attention) por una atención lineal por aproximación, que reduce el coste computacional de O(N²) a O(N) respecto al número de tokens, además de incorporar positional encoding por convolución depth-wise y capas feed-forward con convolución depth-wise. El resultado son mejoras en eficiencia y precisión con un coste de 4,0 GMACs para entradas de 224 x 224.

El checkpoint de origen, `timm/pvt_v2_b2.in1k`, está preentrenado en ImageNet-1K (1000 clases) mediante el framework `timm`. No hay información en la model card sobre el número exacto de tokens de entrenamiento, composición del dataset más allá de ImageNet-1K, ni sobre si se aplicó RLHF/DPO (no aplicable en un clasificador). La conversión a LiteRT la realiza la comunidad `litert-community`; según la model card, el smoke test en CPU con `CompiledModel` pasa, pero la delegación a GPU está bloqueada por patrones de tensores de rango 5 (principalmente `RESHAPE`, `TRANSPOSE` y operaciones de ventana/atención) en el backend GPU.

## Capacidades

- Clasificación de imágenes en 1000 clases de ImageNet-1K a resolución 224 x 224.
- Extracción de features como backbone (la model card indica "Image classification / feature backbone").
- Inferencia en CPU mediante LiteRT `CompiledModel` (smoke test superado).
- Ejecución en formato TFLite, apta para Android, Linux embebido y entornos con runtime LiteRT.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingües (no procesa texto).
- No dispone de modo thinking, visión generativa, audio ni otras capacidades multimodales más allá de la clasificación visual.
- Delegación GPU no disponible actualmente para este modelo.

## Casos de uso

- Clasificación de imágenes en dispositivos Android: el modelo en formato TFLite puede integrarse en una app Android mediante LiteRT y clasificar imágenes de cámara o galería en las 1000 clases de ImageNet, sin necesidad de servidor ni GPU.
- Preprocesado en pipelines de visión embebidos: usar PVT v2 B2 como backbone para extraer features de imágenes en dispositivos IoT o sistemas de bajo consumo, gracias a sus 4,0 GMACs y 25,4 M de parámetros.
- Filtrado rápido de imágenes en servidores sin GPU: al ser CPU-ready con LiteRT, permite clasificar lotes de imágenes en máquinas sin acelerador dedicado.
- Prototipado de aplicaciones de visión en Python: cargar `model.tflite` con el runtime LiteRT para validar ideas de clasificación antes de pasar a modelos mayores o a entrenamiento fino.
- Base para fine-tuning en tareas específicas: aunque el fichero publicado es de inferencia, el checkpoint original `timm/pvt_v2_b2.in1k` puede servir como inicialización para clasificación custom con `timm`.
- Detección de contenido en pipelines de moderación: clasificación preliminar de imágenes por categoría ImageNet como primer filtro barato antes de modelos más costosos.
- Benchmarking de runtime en CPU: comparar latencia de LiteRT frente a otros runtimes (ONNX Runtime, PyTorch) usando un backbone de visión estandarizado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de precisión (top-1/top-5) en ImageNet-1K ni comparaciones con otros modelos, y solo reporta datos estructurales (25,4 M parámetros, 4,0 GMACs, 27,5 M activaciones) y el resultado del smoke test en CPU.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica en el fichero publicado (float32, CPU-ready); el modelo pesa aproximadamente 0,2 GB en disco y requiere memoria RAM proporcional para cargar los pesos.
- GPU recomendadas: la delegación GPU está bloqueada en LiteRT para este modelo; no se recomienda su uso en GPU por ahora.
- Cabe en GPU consumer: previsiblemente sí en términos de memoria (25,4 M parámetros), pero la ejecución GPU no está soportada por el runtime LiteRT para este modelo.
- Cabe en CPU consumer: sí, es el caso de uso principal (smoke test CPU superado).
- Opciones de despliegue: LiteRT (`CompiledModel`); el checkpoint original puede desplegarse con PyTorch/`timm` y exportarse a ONNX u otros formatos, aunque no se documenta en la model card.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto/entrada | Rendimiento | Licencia | Formato |
|---|---|---|---|---|---|
| PVT v2 B2 (este) | 25,4 M | 224 x 224 px | no disponible (sin benchmarks publicados) | no disponible | TFLite |
| PVT v2 B1 | no disponible en la informacion | 224 x 224 px | no disponible | no disponible | PyTorch/timm |
| ViT-B/16 | no disponible en la informacion | 224 x 224 px | no disponible | no disponible | PyTorch/timm |
| DeiT-Tiny | no disponible en la informacion | 224 x 224 px | no disponible | no disponible | PyTorch/timm |

No se dispone de datos comparativos de rendimiento en la información proporcionada; la comparativa se limita a la existencia de alternativas de la misma familia (PVT v2 en otros tamaños) y de otros backbones de visión transformer, sin cifras verificables.

## Limitaciones y advertencias

- Licencia no declarada: no se puede confirmar el uso comercial ni las condiciones de redistribución; verificar con el autor antes de producción.
- Sin benchmarks publicados: no hay métricas de precisión top-1/top-5 en la información disponible, lo que impide evaluar su calidad frente a alternativas.
- Delegación GPU bloqueada: el modelo solo está validado en CPU con LiteRT; el rendimiento en GPU no está garantizado.
- Modelo puramente de clasificación: no genera texto, no razona, no soporta tool calling ni agentes; no debe confundirse con un LLM.
- Sesgos: al entrenarse en ImageNet-1K, hereda los sesgos de clase y de representación del dataset (posible infrarrepresentación de categorías y contextos culturales).
- Riesgo de alucinación: no aplica en sentido generativo; el riesgo es de clasificación errónea en imágenes fuera de distribución o ambiguas.
- Idioma: no procesa texto, por lo que no hay limitaciones lingüísticas que reportar.
- Entrada fija de 224 x 224 px: imágenes de otras resoluciones requieren redimensionado, con posible pérdida de detalle.
- Conversión comunitaria: al ser una conversión de terceros (`litert-community`), puede no reflejar exactamente el comportamiento del checkpoint original; validar con datos propios.

## Enlaces

- Hugging Face: https://huggingface.co/litert-community/pvt_v2_b2
- Modelo base (timm): https://huggingface.co/timm/pvt_v2_b2.in1k
- Paper PVT v2: https://arxiv.org/abs/2106.13797
- Repositorio original PVT: https://github.com/whai362/PVT
- LiteRT (runtime): no disponible en la informacion proporcionada
- Demo: no disponible en la informacion proporcionada
