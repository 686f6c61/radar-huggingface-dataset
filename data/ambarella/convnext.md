# Ambarella/ConvNeXt

## Resumen

ConvNeXt es una red neuronal convolucional (CNN) para visión por computador que moderniza el diseño de las CNN clásicas incorporando elementos propios de los Vision Transformers, como kernels de gran tamaño, bloques simplificados y normalización mejorada, manteniendo la eficiencia computacional de la convolución. El modelo original fue publicado por Liu et al. en 2022 en el artículo "A ConvNet for the 2020s" (arXiv:2201.03545).

Este repositorio concreto, publicado por Ambarella, contiene la variante ConvNeXt-Tiny empaquetada para su despliegue en los SoC de visión de Ambarella (N1-655, X7, CV7, CV72 y CV75) a través del SDK Cooper 2.5.4 y Cooper Foundry 2.3. Los pesos de referencia corresponden a la implementación de torchvision (`convnext_tiny`, pesos `IMAGENET1K_V1`) entrenada sobre ImageNet a resolución 3x224x224, y se ofrecen artefactos binarios precompilados (`.bin`) para cada plataforma.

Es relevante para desarrolladores que trabajan en sistemas embebidos de visión artificial (vigilancia, automoción, cámaras inteligentes), ya que permite ejecutar un backbone CNN moderno y eficiente directamente sobre hardware Ambarella, sin necesidad de convertir ni optimizar el modelo por cuenta propia. No se trata de un modelo generativo ni de lenguaje: es un clasificador de imágenes y backbone genérico para detección y segmentación.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | CNN ConvNeXt (variante Tiny) |
| Parámetros totales | no disponible en la información proporcionada (la variante ConvNeXt-Tiny de referencia ronda los 28 M, dato no confirmado en la ficha) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión; entrada 3x224x224) |
| Tipos de cuantización | artefactos con activaciones de 16 bits (`act16`) para las plataformas Ambarella; no se detallan otros formatos |
| Idiomas soportados | no aplica (modelo de visión) |
| Licencia | no disponible |
| Formato de pesos | PyTorch (referencia torchvision) y binarios `.bin` específicos por dispositivo (N1-655, X7, CV7, CV72, CV75) |

## Arquitectura y entrenamiento

ConvNeXt es una CNN pura que adopta decisiones de diseño inspiradas en los Vision Transformers: kernels de convolución de mayor tamaño (típicamente 7x7 en lugar de 3x3), bloques residuales simplificados, uso de LayerNorm en lugar de BatchNorm, funciones de activación GELU y una proporción de canales por etapa similar a la de los transformers. La variante Tiny reduce el número de bloques y canales por etapa para ofrecer un coste computacional bajo manteniendo una precisión competitiva en clasificación de imágenes.

El entrenamiento de referencia se realizó sobre ImageNet a resolución 224x224, según indica la model card. No se detalla en la información proporcionada el número de tokens/imágenes de entrenamiento, la composición exacta del dataset, ni si se aplicaron técnicas de ajuste fino adicionales (RLHF, DPO u otras, que en un modelo de visión no aplican). El repositorio de Ambarella no aporta información sobre un reentrenamiento propio: los artefactos parecen derivar de los pesos oficiales de torchvision, compilados para el hardware Cooper.

## Capacidades

- Clasificación de imágenes a resolución 224x224 sobre las 1000 clases de ImageNet.
- Extracción de características (backbone) para tareas posteriores de detección de objetos y segmentación semántica.
- Ejecución optimizada en hardware Ambarella (N1-655, X7, CV7, CV72, CV75) mediante el SDK Cooper.
- No soporta tool calling ni function calling.
- No soporta razonamiento multi-paso ni comportamiento de agente.
- No tiene capacidades multilingües (no procesa texto).
- No dispone de modo de razonamiento (thinking mode), visión generativa, audio ni otras capacidades multimodales más allá de la visión por clasificación.

## Casos de uso

- Clasificación de imágenes en cámaras IP y sistemas de videovigilancia: el modelo puede etiquetar escenas y objetos sobre los SoC CV7/CV72/CV75 de Ambarella, aprovechando los binarios precompilados para reducir el tiempo de integración.
- Backbone para detección de objetos en dispositivos embebidos: al ser una CNN eficiente, ConvNeXt-Tiny se puede usar como extractor de características en pipelines de detección en tiempo real sobre hardware de bajo consumo.
- Segmentación semántica en automoción y robótica: el modelo sirve como base para cabezales de segmentación en sistemas ADAS o robots móviles que requieren latencia baja y consumo contenido.
- Control de calidad industrial: clasificación de defectos en líneas de fabricación mediante cámaras conectadas a plataformas Ambarella, con inferencia local sin depender de la nube.
- Análisis de imágenes en drones y dispositivos de borde: la variante Tiny y los artefactos `act16` permiten desplegar clasificación de imágenes en equipos con recursos limitados de memoria y energía.
- Prototipado rápido en investigación: los pesos de referencia de torchvision permiten validar modelos y pipelines en PyTorch antes de compilar y desplegar en el hardware Ambarella con Cooper Foundry.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada; al ser ConvNeXt-Tiny, los requisitos son moderados, pero no se detallan cifras.
- GPU recomendadas: no disponible; el repositorio está orientado a SoC Ambarella (N1-655, X7, CV7, CV72, CV75) más que a GPU de propósito general.
- Compatibilidad con GPU de consumo: no confirmada en la información disponible; los pesos de referencia de torchvision pueden ejecutarse en GPU convencionales, pero no se aportan requisitos concretos.
- Opciones de despliegue: SDK Cooper 2.5.4 y Cooper Foundry 2.3 para el hardware Ambarella; PyTorch/torchvision para la inferencia de referencia.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto/entrada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ConvNeXt-Tiny (este repo) | CNN | no disponible (variante Tiny) | 3x224x224 | no disponible | Hugging Face (Ambarella) |
| ConvNeXt-Tiny (torchvision) | CNN | no disponible en la ficha | 3x224x224 | no disponible | PyTorch Hub / torchvision |
| ResNet-50 | CNN | no disponible en la ficha | 3x224x224 | no disponible | Amplia (torchvision, etc.) |
| ViT-B/16 | Transformer | no disponible en la ficha | 3x224x224 | no disponible | Amplia |

No se dispone de datos de rendimiento comparativo en la información proporcionada; la comparativa se limita a categoría y disponibilidad.

## Limitaciones y advertencias

- Modelo de visión: no procesa texto ni mantiene conversaciones; no debe evaluarse con métricas de LLM.
- Entrenado sobre ImageNet: puede presentar sesgos de clase y un rendimiento limitado en dominios muy distintos (imágenes médicas, satelitales, etc.) sin ajuste fino.
- Riesgo de clasificación errónea en imágenes fuera de distribución o con condiciones de iluminación y resolución diferentes a las de entrenamiento.
- Licencia no especificada: es imprescindible verificar los términos de uso comercial antes de desplegarlo en producción, tanto del repositorio de Ambarella como de los pesos originales de torchvision.
- Los artefactos `.bin` están ligados a plataformas Ambarella concretas (N1-655, X7, CV7, CV72, CV75) y a versiones específicas del SDK Cooper (2.5.4) y Cooper Foundry (2.3); no son portables a otro hardware sin recompilación.
- Resolución de entrada fija de 224x224: puede requerir redimensionado o adaptación para aplicaciones de alta resolución.
- Repositorio con muy pocas descargas y sin likes: no hay evidencia de validación comunitaria ni de soporte a largo plazo.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Ambarella/ConvNeXt
- Paper original: https://arxiv.org/abs/2201.03545
- Implementación de referencia en torchvision: https://pytorch.org/vision/stable/models/generated/torchvision.models.convnext_tiny.html
- Pesos originales: https://download.pytorch.org/models/convnext_tiny-983f1562.pth
- Dataset ImageNet: https://image-net.org
- Artefactos por dispositivo: https://huggingface.co/Ambarella/ConvNeXt/blob/main/n1-655_convnext_tiny_act16.bin , https://huggingface.co/Ambarella/ConvNeXt/blob/main/x7_convnext_tiny_act16.bin , https://huggingface.co/Ambarella/ConvNeXt/blob/main/cv7_convnext_tiny_act16.bin , https://huggingface.co/Ambarella/ConvNeXt/blob/main/cv72_convnext_tiny_act16.bin , https://huggingface.co/Ambarella/ConvNeXt/blob/main/cv75_convnext_tiny_act16.bin
