# Blaize-AI/ConvNeXtV2f_ImageNet

## Resumen

ConvNeXtV2f_ImageNet es una implementación optimizada del clasificador de imágenes ConvNeXt V2, publicada por Blaize-AI para su ejecución sobre los aceleradores de IA Blaize Xplorer mediante el SDK Blaize Picasso. No se trata de un modelo de lenguaje, sino de una red convolucional pura (ConvNeXt V2) originalmente desarrollada por Meta Platforms y reimplementada en `timm` por Ross Wightman, que aquí se distribuye en formato `.bm` (Blaize Model) con cuantización AMP para inferencia en hardware GSP (Graph Streaming Processor).

El modelo resuelve la tarea clásica de clasificación de imágenes sobre las 1.000 clases de ImageNet 2012, con una resolución de entrada fija de 224×224 píxeles. Su relevancia radica en que permite desplegar un backbone moderno de visión en aceleradores de borde con bajo consumo y baja latencia, sin necesidad de recurrir a GPUs o frameworks de inferencia convencionales. La arquitectura subyacente es ConvNeXt V2, que combina bloques convolucionales con normalización LayerNorm, activación GELU y el mecanismo GRN (Global Response Normalization) introducido en la versión V2.

La información pública disponible es limitada: el repositorio no incluye pesos en formato estándar (safetensors, GGUF, ONNX), no detalla el número exacto de parámetros de la variante "f" y no publica resultados de benchmarks. La ficha se completa con los datos verificables de la model card y con las características conocidas de la familia ConvNeXt V2, indicando explícitamente cuando un dato no está disponible.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | ConvNeXt V2 (red convolucional pura, bloques ConvNeXt con LayerNorm, GELU y GRN) |
| Parámetros totales | no disponible (la variante "f" corresponde a la familia ConvNeXt V2; el número exacto no se indica en la model card) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión; entrada de imagen 224×224) |
| Tipos de cuantización | AMP (mezcla INT8 + BF16); la model card menciona también INT8 y BF16 como métodos soportados por el SDK |
| Idiomas soportados | no aplica (clasificación de imágenes, sin procesamiento de lenguaje) |
| Licencia | Apache-2.0 |
| Formato de pesos | `.bm` (Blaize Model), variante `ConvNeXtV2f_ImageNet_amp_224_224.bm` |

## Arquitectura y entrenamiento

ConvNeXt V2 es una red neuronal convolucional pura que moderniza el diseño de ResNet incorporando elementos propios de los transformers de visión: parches de gran tamaño en el stem (4×4), profundidad variable por etapa, LayerNorm en lugar de BatchNorm, activación GELU, capas de cuello de botella invertidas y convoluciones depthwise de 7×7. La versión V2 añade la Global Response Normalization (GRN) tras cada bloque, que mejora la diversidad de características y evita el colapso de canales durante el entrenamiento. El modelo original fue entrenado por Meta Platforms sobre ImageNet 2012; esta variante de Blaize parte de los pesos preentrenados de `timm` (Ross Wightman) y no ha sido reentrenada, sino optimizada a nivel de hardware para el acelerador GSP.

La optimización realizada por Blaize consiste en la compilación del grafo computacional al formato `.bm` y la aplicación de cuantización AMP (mixed precision INT8/BF16) para maximizar el rendimiento y reducir el tamaño del modelo en el dispositivo. No se documenta en la model card el número de tokens de entrenamiento, la composición exacta del dataset más allá de ImageNet 2012, ni si hubo técnicas de ajuste fino adicionales (RLHF, DPO u otras), ya que no aplican a un clasificador de visión. Tampoco se especifica si se aplicó destilación o pruning durante la conversión.

## Capacidades

- Clasificación de imágenes en 1.000 clases de ImageNet 2012 a resolución 224×224.
- Extracción de características visuales (backbone convolucional) potencialmente reutilizable para tareas downstream, aunque la model card solo documenta el uso como clasificador.
- Inferencia en aceleradores Blaize Xplorer (GSP) con cuantización AMP para equilibrio entre precisión y velocidad.
- Soporte de cuantización INT8 y BF16 a través del SDK Picasso (la variante publicada usa AMP).
- No soporta tool calling, function calling, agentes, razonamiento multi-step ni capacidades multilingües: es un modelo puramente visual.
- No dispone de modo "thinking", visión generativa, audio ni generación de texto.

## Casos de uso

- Clasificación de imágenes en el borde (edge AI): el modelo se ejecuta sobre el acelerador Blaize Xplorer con cuantización AMP, lo que permite clasificar imágenes en dispositivos con restricciones de potencia y latencia, como cámaras inteligentes o sensores industriales.
- Inspección visual en líneas de fabricación: uso del clasificador para detectar categorías de producto o defectos predefinidos en tiempo real, aprovechando la baja latencia del GSP y la resolución fija de 224×224.
- Preprocesamiento en pipelines de visión: servir como backbone de extracción de características para etapas posteriores (detección, segmentación o recuperación), siempre que se valide la calidad de las representaciones tras la cuantización AMP.
- Clasificación de imágenes en entornos sin GPU: al estar compilado para hardware dedicado, permite desplegar un clasificador ImageNet en dispositivos donde no hay GPUs disponibles ni se quiere depender de frameworks como PyTorch en producción.
- Prototipado con el SDK Picasso: uso de `blaize-modeltool` para inspeccionar el modelo y validar el flujo de compilación/despliegue antes de integrar modelos propios en el acelerador.
- Benchmarking de aceleradores: comparar el rendimiento del GSP frente a CPU/GPU en una carga de referencia estándar (ImageNet) con un modelo convolucional moderno.
- Filtrado y etiquetado automático de imágenes a gran escala en el borde: clasificación previa para enrutar imágenes a servicios de análisis más costosos en la nube.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de precisión (top-1/top-5) ni de latencia/throughput para la variante AMP sobre el acelerador Xplorer.

## Requisitos de hardware

- Hardware objetivo: acelerador Blaize Xplorer (arquitectura GSP). El modelo no está pensado para ejecutarse en GPU o CPU convencionales en su formato `.bm`.
- SDK requerido: Blaize Picasso SDK instalado y configurado.
- VRAM estimada: no disponible (no aplica en el sentido de GPU; el modelo se ejecuta en memoria del acelerador GSP, cuyo tamaño no se especifica).
- GPU recomendadas: no aplica; el formato `.bm` es específico de Blaize.
- Compatibilidad con GPU de consumo: no; requiere hardware Blaize Xplorer.
- Opciones de despliegue: Blaize Picasso SDK y utilidad `blaize-modeltool` (por ejemplo, `blaize-modeltool info -i hf://Blaize-AI/ConvNeXtV2f_ImageNet/ConvNeXtV2f_ImageNet_amp_224_224.bm`). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parámetros | Entrada | Licencia | Formato / despliegue |
|---|---|---|---|---|---|
| ConvNeXtV2f_ImageNet (Blaize) | ConvNeXt V2 | no disponible | 224×224 | Apache-2.0 | `.bm` para Blaize GSP |
| ConvNeXt V2 (Meta / timm original) | ConvNeXt V2 | variable según variante (F, P, N, T, B, L, H) | 224×224 (típico) | Apache-2.0 | PyTorch / safetensors en `timm` |
| ConvNeXt V1 (timm) | ConvNeXt | variable según variante | 224×224 (típico) | Apache-2.0 | PyTorch / safetensors |
| ResNet-50 (torchvision) | ResNet | ~25,6 M | 224×224 | BSD-3-Clause | PyTorch |

La comparación directa con alternativas es limitada porque esta variante solo se distribuye compilada para hardware Blaize y no publica métricas de precisión ni latencia. El modelo original de ConvNeXt V2 en `timm` es la referencia natural para obtener pesos estándar y métricas publicadas; ResNet-50 se incluye como baseline clásico de clasificación ImageNet.

## Limitaciones y advertencias

- No se publican métricas de precisión (top-1/top-5) para la variante cuantizada AMP, por lo que se desconoce la degradación respecto al modelo original en BF16 o FP32.
- El modelo solo se distribuye en formato `.bm` y requiere hardware Blaize Xplorer y el SDK Picasso; no es ejecutable en GPU, CPU ni en frameworks estándar sin conversión adicional.
- La resolución de entrada está fija en 224×224; no se documentan variantes con otras resoluciones en este repositorio.
- Es un clasificador de 1.000 clases de ImageNet 2012; no está diseñado para clases personalizadas sin reentrenamiento o ajuste fino, y la model card no documenta dicho procedimiento.
- Riesgo de sesgos heredados del dataset ImageNet (desequilibrios de clase, sesgos culturales y geográficos en las anotaciones).
- La licencia Apache-2.0 aplica al modelo, pero el dataset ImageNet tiene su propia licencia (`LicenseRef-ImageNet`) que debe revisarse para uso comercial.
- Blaize declara explícitamente que el modelo es contenido de terceros, que no revisa ni avala el modelo original y que no ofrece garantías sobre su exactitud, integridad o posible infracción de derechos de propiedad intelectual.
- No hay información sobre latencia, throughput ni consumo energético en el acelerador, lo que dificulta evaluar su idoneidad en producción sin pruebas propias.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y un tamaño de 0.0 GB reportado, lo que sugiere que los pesos pueden no estar disponibles públicamente o que el conteo no se ha actualizado.

## Enlaces

- [Hugging Face: Blaize-AI/ConvNeXtV2f_ImageNet](https://huggingface.co/Blaize-AI/ConvNeXtV2f_ImageNet)
- [Blaize (sitio oficial)](https://www.blaize.com)
- [Pesos preentrenados originales de ConvNeXt V2 (Meta)](https://github.com/facebookresearch/ConvNeXt-V2)
- [Implementación en timm (Ross Wightman)](https://github.com/huggingface/pytorch-image-models/blob/main/timm/models/convnext.py)
- [ImageNet 2012](https://www.image-net.org/)
