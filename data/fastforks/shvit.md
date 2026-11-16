# fastforks/shvit

## Resumen

SHViT (Yun y Ro, 2024) es una familia de clasificadores de imágenes ligeros que combina un *stem* convolucional de 16x16 con atención de una sola cabeza aplicada únicamente sobre una parte de los canales. El modelo original fue publicado por los autores del artículo SHViT y sus pesos están alojados en los repositorios `timm/shvit_s1.in1k`, `shvit_s2.in1k`, `shvit_s3.in1k` y `shvit_s4.in1k`. La ficha que nos ocupa, `fastforks/shvit`, no contiene pesos: es una *model card* de integración para la librería fastforks, que descarga los pesos de los autores y los verifica contra un hash SHA-256.

El problema que resuelve esta ficha es la integración reproducible de los clasificadores SHViT en un *runtime* alternativo (denominado `portable`), con validación de integridad de pesos y mediciones de latencia y memoria en GPU consumer. Está pensada para desarrolladores que quieran usar SHViT como clasificador ImageNet-1k de bajo coste sin depender del código original de `pytorch-image-models`.

La relevancia actual es la eficiencia: los cuatro variantes clasifican imágenes de 224x224 (o 256x256 en `s4`) en el rango de 6,75 a 9,31 ms en una RTX 5060 Ti 16 GB con el backend portable, y entre 0,51 y 0,66 ms con TensorRT fp16, con un pico de memoria en torno a 47-67 MiB. La licencia es MIT y el uso comercial está permitido según la propia ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CNN híbrida: stem convolucional 16x16 + atención de una sola cabeza sobre un subconjunto de canales (SHViT) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (clasificación de imagen; entrada fija 224x224 o 256x256) |
| Tipos de cuantizacion | fp32 (original), fp16 (portable y TensorRT); no se documentan otros formatos |
| Idiomas soportados | no disponible (tarea de visión; etiquetas ImageNet-1k en inglés) |
| Licencia | MIT (pesos y ficha); código original Apache-2.0 |
| Formato de pesos | safetensors (pesos de los autores, no alojados en este repo) |

## Arquitectura y entrenamiento

SHViT es una red de clasificación de imágenes que combina un *stem* convolucional de 16x16 con bloques de atención de una sola cabeza aplicada solo sobre una fracción de los canales, lo que reduce el coste computacional frente a los transformers de visión convencionales. La ficha cubre cuatro variantes (`s1`, `s2`, `s3`, `s4`) con entradas fijas: 224x224 para las tres primeras y 256x256 para `s4`; el preprocesado es redimensionado con lado corto 256 (o 292 en `s4`) y recorte central.

El entrenamiento se realizó sobre ImageNet-1k (ILSVRC 2012), según indica la ficha. No se documentan en la información proporcionada el número de tokens, la composición del dataset más allá de ImageNet-1k, ni si hubo RLHF/DPO (no aplica a clasificación). La innovación técnica destacable es la combinación de atención parcial por canales con un *stem* convolucional grande, orientada a maximizar precisión por FLOP. La integración de fastforks añade un backend `portable` con validación SHA-256 de los pesos y benchmarks reproducibles frente al código original.

## Capacidades

- Clasificación de imágenes en ImageNet-1k: salida de logits sobre 1000 clases.
- Entrada de una única imagen RGB con tamaño fijo (224x224 en `s1`, `s2`, `s3`; 256x256 en `s4`).
- Inferencia en fp32 y fp16; el backend portable y TensorRT fp16 están medidos en la ficha.
- Verificación de integridad de pesos mediante SHA-256 (hash abreviado a 12 dígitos hexadecimales en la tabla de variantes).
- Compatibilidad con `torch.compile` y exportación a ONNX + TensorRT (tiempos de preparación documentados).
- No soporta tool calling, agentes, razonamiento multi-paso ni generación de texto: es exclusivamente un clasificador de imagen.
- Capacidades multilingües: no disponibles; las etiquetas de salida son las 1000 clases de ImageNet-1k.

## Casos de uso

- Moderación de contenido visual a bajo coste: clasificar imágenes entrantes en 1000 categorías ImageNet con latencias de 0,5-0,7 ms por imagen en TensorRT fp16 permite filtrar grandes volúmenes en tiempo real en una sola GPU consumer.
- Preetiquetado de datasets de visión: usar los logits de SHViT como etiqueta débil para arrancar pipelines de anotación humana, aprovechando el bajo pico de memoria (47-67 MiB) para ejecutar varios procesos en paralelo.
- Clasificación en el borde con GPU integrada o consumer: el modelo cabe holgadamente en cualquier GPU con más de 1 GB de VRAM y en fp16 ocupa decenas de MiB, lo que permite desplegarlo en dispositivos con recursos limitados.
- Enrutamiento en pipelines multimodales: usar la clase predicha para decidir qué modelo especializado invocar después (p. ej., derivar imágenes de vehículos a un detector específico), con la latencia de un clasificador ligero.
- Control de calidad en líneas de producción: inspección visual por categoría a alta cadencia, con `torch.compile` reduciendo el tiempo por imagen a 3,1-4,1 ms en la RTX 5060 Ti.
- Benchmarking de runtimes de inferencia: la ficha incluye comparativas entre código original, portable, `torch.compile` y TensorRT fp16, útil para evaluar el coste de migrar un clasificador entre backends.
- Validación de integridad en despliegues: el mecanismo SHA-256 permite verificar que los pesos descargados coinciden con los del autor antes de servir el modelo en producción.

## Benchmarks y rendimiento

Precisión en ImageNet-1k val (5000 imágenes aleatorias, top-1 / top-5 %):

| Variante | Original fp32 | Original fp16 | Portable |
|---|---|---|---|
| `shvit_s1.in1k` | 74,26 / 91,10 | 74,22 / 91,16 | 74,26 / 91,00 |
| `shvit_s2.in1k` | 76,74 / 92,40 | 76,82 / 92,40 | 76,82 / 92,44 |
| `shvit_s3.in1k` | no disponible en la información proporcionada | no disponible | no disponible |
| `shvit_s4.in1k` | no disponible en la información proporcionada | no disponible | no disponible |

Latencia y memoria (RTX 5060 Ti 16 GB, sm_120, entrada sintética):

| Variante | Entrada | Original fp32 (ms) | Portable (ms) | `torch.compile` (ms) | TensorRT fp16 (ms) | Pico portable (MiB alloc/reserved) |
|---|---|---|---|---|---|---|
| `shvit_s1.in1k` | 224x224 | 8,41 | 6,75 | 3,11 | 0,510 | 47 / 58 |
| `shvit_s2.in1k` | 224x224 | 8,37 | 6,76 | 3,90 | 0,533 | 56 / 88 |
| `shvit_s3.in1k` | 224x224 | 9,40 | 8,11 | 3,64 | 0,575 | 62 / 112 |
| `shvit_s4.in1k` | 256x256 | 11,5 | 9,31 | 4,11 | 0,658 | 67 / 118 |

Tiempos de preparación: `torch.compile` en frío 10,1-11,3 s; build ONNX + engine TensorRT 23,3-26,3 s.

## Requisitos de hardware

- VRAM estimada: pico de 47-67 MiB asignados (58-118 MiB reservados) con el backend portable en fp16; en la práctica cabe en cualquier GPU con más de 1 GB.
- GPU recomendadas: RTX 5060 Ti 16 GB es la hardware de referencia de los benchmarks; cualquier GPU NVIDIA con soporte CUDA y sm_120 (o anterior) debería funcionar.
- Cabe en GPU consumer: sí, holgadamente; también en iGPU con suficiente memoria compartida.
- Opciones de despliegue: backend `portable` de fastforks, `torch.compile`, exportación ONNX + TensorRT fp16, y el código original de `pytorch-image-models` (timm) como referencia.
- Latencia y throughput: 0,51-0,66 ms por imagen con TensorRT fp16; 3,1-4,1 ms con `torch.compile`; 6,75-9,31 ms con portable en fp16. El throughput no se publica de forma explícita, pero se deduce de la latencia por imagen en lotes de tamaño 1.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto/entrada | Precisión ImageNet-1k top-1 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SHViT `s1` (esta ficha) | no disponible | 224x224 | 74,26 % (fp32, 5000 imgs) | MIT | Pesos en timm; ficha en fastforks |
| SHViT `s2` (esta ficha) | no disponible | 224x224 | 76,74 % (fp32, 5000 imgs) | MIT | Pesos en timm; ficha en fastforks |
| SHViT `s3` (esta ficha) | no disponible | 224x224 | no disponible | MIT | Pesos en timm; ficha en fastforks |
| SHViT `s4` (esta ficha) | no disponible | 256x256 | no disponible | MIT | Pesos en timm; ficha en fastforks |

No se dispone en la información proporcionada de datos de modelos alternativos (por ejemplo, otros clasificadores ligeros tipo MobileNet, EfficientViT o DeiT) para establecer una comparativa cruzada fiable.

## Limitaciones y advertencias

- El repositorio `fastforks/shvit` no contiene pesos: es solo una *model card*; la inferencia requiere descargar los safetensors de los repositorios de timm indicados.
- Entrada de tamaño fijo: no admite resoluciones arbitrarias sin reentrenamiento o adaptación; `s1`-`s3` usan 224x224 y `s4` 256x256.
- Solo clasificación ImageNet-1k: 1000 clases en inglés; no es un modelo generativo ni admite instrucciones en lenguaje natural.
- No se documentan sesgos específicos, pero al entrenarse solo con ImageNet-1k hereda los sesgos de esa taxonomía y de su distribución de imágenes.
- Riesgo de alucinación no aplica en el sentido generativo, pero sí de clasificaciones erróneas fuera de la distribución de ImageNet-1k.
- Licencia MIT en pesos y ficha, con uso comercial permitido según la tabla de variantes; el código original se distribuye bajo Apache-2.0 y la ficha advierte de que es un paquete de uso de investigación y que deben revisarse las cadenas de licencia antes de otros usos.
- Los benchmarks se han medido en una única GPU (RTX 5060 Ti 16 GB, sm_120) y con entrada sintética; el rendimiento en otro hardware puede diferir.
- El backend `kernels` aparece como columna en las tablas pero sin valores (`–`), por lo que no hay datos de rendimiento para esa ruta.
- Los tiempos de carga del backend portable (2,16-2,80 s) son notablemente superiores a los del código original (0,20-0,31 s), lo que penaliza escenarios de arranque en frío frecuente.

## Enlaces

- Ficha en Hugging Face: https://huggingface.co/fastforks/shvit
- Pesos `shvit_s1.in1k`: https://huggingface.co/timm/shvit_s1.in1k
- Pesos `shvit_s2.in1k`: https://huggingface.co/timm/shvit_s2.in1k
- Pesos `shvit_s3.in1k`: https://huggingface.co/timm/shvit_s3.in1k
- Pesos `shvit_s4.in1k`: https://huggingface.co/timm/shvit_s4.in1k
- Código de fastforks: https://github.com/kleinicke/fastforks
- Kernels para el backend `kernels`: https://huggingface.co/fastforks/kernels
- Código original (pytorch-image-models, commit `0df212b369a5`): https://github.com/huggingface/pytorch-image-models
- Documentación de benchmarks de fastforks: https://github.com/kleinicke/fastforks/blob/main/docs/benchmarks.md
- Evidencia de licencia (README de `shvit_s1.in1k`): https://huggingface.co/timm/shvit_s1.in1k/blob/d5c0c27b0d05c630284a3946882590e4054f1108/README.md
