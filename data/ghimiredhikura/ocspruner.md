# ghimiredhikura/OCSPruner

## Resumen

OCSPruner es una colección de checkpoints de clasificación de imágenes podados mediante la técnica *One-Cycle Structured Pruning via Stability-Driven Subnetwork Search*, presentada en el congreso WACV 2026 por Deepak Ghimire, Dayoung Kil, Seonghwan Jeong, Jaesik Park y Seong-heum Kim. No se trata de un modelo fundacional ni de un LLM, sino de un conjunto de pesos de referencia (ResNet y VGG) que demuestran la eficacia de un método de poda estructurada en un solo ciclo de entrenamiento.

El problema que resuelve es la compresión de redes convolucionales clásicas manteniendo una precisión competitiva: en lugar de requerir múltiples ciclos de poda y reentrenamiento, el método busca una subred estable en una única pasada. Los checkpoints cubren CIFAR-10, CIFAR-100 e ImageNet, con reducciones de FLOPs que van del 11% al 67% según arquitectura y dataset.

Es relevante para investigadores en eficiencia computacional y para desarrolladores que necesiten desplegar clasificadores ligeros en entornos con recursos limitados, ya que ofrece pesos listos para evaluar y comparar con sus propias implementaciones de poda. El repositorio ocupa 0,3 GB y se distribuye en formato PyTorch `.pth`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Redes convolucionales ResNet (18, 50, 56, 110) y VGG (16, 19) podadas |
| Parametros totales | no disponible (depende del checkpoint; las arquitecturas base van de ~11M a ~20M) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (clasificación de imágenes) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | `.pth` (PyTorch serializado) |

## Arquitectura y entrenamiento

Los checkpoints son redes convolucionales estándar (ResNet y VGG) sometidas a un proceso de poda estructurada. El método propuesto, *One-Cycle Structured Pruning via Stability-Driven Subnetwork Search*, realiza la búsqueda de subredes guiada por criterios de estabilidad en un único ciclo, evitando los pipelines iterativos de poda y reentrenamiento habituales. No se especifican en la información disponible el número de tokens de entrenamiento (no aplica), la composición exacta de los datasets más allá de CIFAR-10, CIFAR-100 e ImageNet, ni si se emplearon técnicas de destilación o regularización adicionales.

La información disponible no detalla innovaciones como atención lineal o decodificación especulativa, ya que no son aplicables a este tipo de modelos. El entorno experimental documentado por el autor es Python 3.11.3, PyTorch 2.0.1 y torchvision 0.15.2.

## Capacidades

- Clasificación de imágenes en CIFAR-10 (10 clases), CIFAR-100 (100 clases) e ImageNet (1000 clases).
- Inferencia con modelos comprimidos: reducciones de FLOPs de hasta el 67% en ResNet50/ImageNet.
- Evaluación reproducible mediante scripts `main_cifar.py` y `main_imagenet.py` del repositorio fuente.
- Compatibilidad con el ecosistema PyTorch y torchvision.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingües.
- No dispone de modo *thinking*, visión general, audio ni otras capacidades multimodales más allá de la clasificación de imágenes.

## Casos de uso

- Clasificación de imágenes en dispositivos de borde: los checkpoints podados de ResNet18 (45% menos FLOPs) y ResNet50 (hasta 67%) permiten inferencia en Raspberry Pi, Jetson Nano o móviles con menor coste computacional.
- Investigación en compresión de modelos: sirven como línea base para comparar nuevas técnicas de poda estructurada contra los resultados de OCSPruner en CIFAR e ImageNet.
- Reproducción de resultados académicos: los scripts de evaluación permiten verificar las cifras del paper WACV 2026 de forma directa.
- Prototipado rápido de clasificadores ligeros: útil para validar pipelines de visión antes de entrenar modelos propios desde cero.
- Docencia en eficiencia de redes neuronales: ejemplos prácticos de poda estructurada con arquitecturas clásicas ampliamente conocidas.
- Despliegue en entornos con restricciones de memoria: los checkpoints de VGG16/VGG19 podados (20%, 26%, 11%) reducen el footprint frente a las versiones completas.
- Evaluación comparativa de frameworks de inferencia (ONNX Runtime, TensorRT, OpenVINO) sobre modelos comprimidos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo indica las reducciones de FLOPs por checkpoint (11%–67%) y remite al paper y al repositorio fuente para las métricas de precisión, que no se incluyen en los datos proporcionados.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; para ResNet50 podado en FP32 se estima por debajo de 1 GB, y para VGG16/19 en torno a 1–2 GB, aunque estas cifras no las confirma el autor.
- GPU recomendadas: cualquier GPU moderna (RTX 3060 o superior, A100, H100) es suficiente; los modelos son ligeros y caben en GPUs de gama baja.
- Cabe en GPU de consumo: sí, en cualquier GPU consumer con al menos 2 GB de VRAM, e incluso en CPU para inferencia por lotes pequeños.
- Opciones de despliegue: PyTorch nativo (scripts del repositorio), exportación a ONNX/TensorRT/OpenVINO no documentada pero viable al ser arquitecturas estándar.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Arquitectura | Dataset | Reducción FLOPs | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| OCSPruner | ResNet/VGG podados | CIFAR-10/100, ImageNet | 11%–67% | no disponible | Hugging Face |
| ResNet original (He et al.) | ResNet | ImageNet | 0% | BSD-3 (torchvision) | torchvision |
| VGG original (Simonyan & Zisserman) | VGG | ImageNet | 0% | CC BY 4.0 (paper) | torchvision |
| Modelos podados alternativos (p. ej. torch-pruning) | ResNet/VGG | ImageNet | variable | según repo | GitHub |

La comparación cuantitativa de precisión frente a estos modelos no está disponible en la información proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados; al entrenarse sobre CIFAR e ImageNet, heredan los sesgos de dichos datasets.
- Riesgo de alucinación: no aplica (no es un modelo generativo de texto).
- Limitaciones de contexto o idioma: no aplica; son clasificadores de imágenes con vocabulario cerrado de clases.
- Restricciones de licencia: la licencia no está especificada en la información disponible, lo que impide confirmar si el uso comercial está permitido; es necesario contactar con el autor.
- Los checkpoints `.pth` contienen objetos serializados y requieren el código del proyecto para cargarse; en PyTorch 2.6 o superior puede ser necesario `TORCH_FORCE_NO_WEIGHTS_ONLY_LOAD=1`.
- No se proporcionan métricas de precisión en la model card; cualquier decisión de producción debe basarse en una evaluación propia con el código fuente.
- El repositorio tiene 0 descargas y 0 likes, por lo que no hay validación comunitaria independiente.

## Enlaces

- Hugging Face: https://huggingface.co/ghimiredhikura/OCSPruner
- Paper (Hugging Face Papers): https://huggingface.co/papers/2501.13439
- Código fuente y evaluación: https://github.com/ghimiredhikura/OCSPruner/tree/613677bacb35e5240ffcdcbdb292263bfd4031ef
- arXiv: https://arxiv.org/abs/2501.13439
