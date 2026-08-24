# litert-community/PlantNet-300K-ResNet18-LiteRT

## Resumen

PlantNet-300K-ResNet18-LiteRT es un modelo de clasificación de imágenes para identificación de especies de plantas en el dispositivo, desarrollado por la comunidad litert-community. Se basa en una arquitectura ResNet18 de torchvision, con pesos preentrenados del modelo PlantNet-300K (NeurIPS 2021), y ha sido convertido al formato LiteRT (TFLite) para ejecución eficiente en GPU y NPU de dispositivos móviles. El modelo clasifica 1081 especies de plantas a partir de una imagen de 224x224 píxeles, con una latencia de aproximadamente 16 ms por fotograma en un Pixel 8a y 0.90 ms en un Snapdragon 8 Elite Gen 5 con aceleración NPU.

Es relevante porque ofrece una solución de identificación botánica de grano fino completamente local, sin necesidad de conexión a internet, con un tamaño de 47 MB y licencia Apache-2.0, lo que facilita su integración en aplicaciones Android y sistemas embebidos. Su conversión a LiteRT con soporte completo de GPU y NPU lo convierte en una opción práctica para aplicaciones de campo, guías botánicas y sistemas de monitoreo agrícola.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ResNet18 (CNN, torchvision) |
| Parametros totales | no disponible (peso 47 MB en fp16) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no aplica (modelo de vision) |
| Tipos de cuantizacion | fp16 (no requiere int8 para NPU) |
| Idiomas soportados | no aplica (salida de etiquetas Latinas) |
| Licencia | Apache-2.0 |
| Formato de pesos | LiteRT (TFLite) |

## Arquitectura y entrenamiento

El modelo es un ResNet18 puro de torchvision, una red neuronal convolucional de 18 capas con bloques residuales. La conversión a LiteRT requirió un único parche: la capa `MaxPool2d(padding=1)` del stem se reemplazó por un padding explícito a cero seguido de un maxpool sin padding, ya que el delegate GPU Mali no soportaba el padding con `-inf`. Este cambio es exacto porque la entrada del maxpool es post-ReLU (valores no negativos). Los pesos provienen del modelo PlantNet-300K entrenado sobre el dataset PlantNet-300K (NeurIPS 2021), con 1081 especies de plantas. El entrenamiento original se realizó con técnicas estándar de clasificación de imágenes (no se especifican detalles adicionales en la información proporcionada). El modelo se exporta a LiteRT mediante `litert-torch`, y se publica en formato TFLite con pesos en fp16.

## Capacidades

- Clasificación de imágenes de plantas en 1081 especies (nombres latinos).
- Inferencia en GPU (Adreno, Mali) y NPU (Hexagon) con soporte completo del grafo (37/37 nodos en GPU).
- Ejecución en el dispositivo sin conexión a internet, con baja latencia (0,9 ms en NPU Snapdragon).
- No soporta tool calling, agentes ni razonamiento multi-paso; es un clasificador puro de visión.
- Capacidad multilingüe no aplica; las etiquetas son nombres latinos de especies.

## Casos de uso

- Identificación de plantas en campo: un usuario fotografía una hoja o flor y la app muestra la especie más probable con confianza, funcionando sin cobertura móvil.
- Guías botánicas interactivas: integración en aplicaciones de educación o turismo para reconocer flora local en tiempo real.
- Monitoreo agrícola: análisis de cultivos para detectar especies invasoras o enfermedades mediante clasificación de imágenes capturadas por drones o sensores.
- Investigación ecológica: clasificación automatizada de imágenes de herbarios o cámaras trampa para estudios de biodiversidad.
- Asistente de jardinería: aplicación que recomienda cuidados según la especie identificada, con datos de la planta.
- Auditoría de cumplimiento ambiental: verificación de especies en proyectos de reforestación o control de especies protegidas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de precisión (p. ej., top-1 accuracy) en la información disponible. Sin embargo, la ficha incluye mediciones de latencia de inferencia en dispositivos reales, que se resumen a continuación:

| Plataforma | Runtime | Latencia (media) |
|---|---|---|
| Pixel 8a (Tensor G3) | LiteRT CompiledModel (GPU) | ~16 ms |
| Pixel 8a (Tensor G3) | TFLite GPU (OpenCL) | 19.9 ms |
| Pixel 8a (Tensor G3) | CPU (XNNPACK, 4 hilos) | 61.8 ms |
| Samsung Galaxy S26 (Snapdragon 8 Elite Gen 5) | NPU (Hexagon) | 0.90 ms |
| Samsung Galaxy S26 (Snapdragon 8 Elite Gen 5) | GPU (Adreno) | 3.49 ms |

Estos valores indican que el modelo está optimizado para despliegue móvil, con una mejora de 3.9x en inferencia al usar NPU frente a GPU.

## Requisitos de hardware

- Tamaño del modelo: 47 MB (fp16), lo que cabe en cualquier smartphone con Android 8 o superior.
- VRAM estimada: no aplica (inferencia en CPU/GPU móvil), pero en GPU de escritorio se puede ejecutar en menos de 1 GB.
- GPU recomendadas: cualquier GPU compatible con OpenCL (Adreno, Mali, PowerVR) para móviles; en escritorio, cualquier GPU con soporte de OpenCL o Vulkan.
- En consumer GPU: sí, cabe en cualquier GPU de escritorio moderna (p. ej., RTX 3060) y en móviles con GPU dedicada.
- Opciones de despliegue: LiteRT (CompiledModel con acelerador GPU o NPU), TFLite (benchmark_model, GPU delegate), y Python con `ai-edge-litert` interpreter.
- Latencia: ~16 ms en GPU de Pixel 8a, 0.9 ms en NPU de Snapdragon 8 Elite Gen 5 (cached).
- Throughput: no disponible, pero la latencia por imagen es suficientemente baja para aplicaciones en tiempo real.

## Comparativa con modelos similares

No se dispone de información comparativa con otros modelos de identificación de plantas en la información proporcionada. Se puede indicar que alternativas como MobileNetV3 o EfficientNet podrían ofrecer precisiones similares, pero no se dispone de datos para comparar.

## Limitaciones y advertencias

- El modelo solo reconoce 1081 especies de plantas; no cubre la diversidad global de flora, por lo que no es adecuado para regiones con alta endemia.
- Riesgo de alucinación en clasificación: puede dar predicciones incorrectas si la imagen no es una planta o es de una especie no entrenada, con confianza alta.
- No hay datos sobre sesgos del dataset PlantNet-300K; es probable que tenga desequilibrios en la representación de especies de ciertas regiones.
- La licencia Apache-2.0 permite uso comercial, pero los pesos provienen de un modelo con licencia Apache-2.0 (cpoisson/plantnet300k-resnet18), así que no hay restricciones adicionales.
- El modelo no admite entradas de texto ni lenguaje natural; solo procesa imágenes de 224x224 en formato NCHW con normalización ImageNet.
- Para uso en producción, se debe considerar la calibración de umbrales de confianza para evitar falsos positivos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/litert-community/PlantNet-300K-ResNet18-LiteRT
- Repositorio de origen PlantNet-300K: https://github.com/plantnet/PlantNet-300K
- Repositorio con código de conversión y ejemplos: https://github.com/john-rocky/LiteRT-Models/tree/main/plantnet
- Documentación de LiteRT para despliegue: https://ai.google.dev/edge/litert
- Paper del dataset PlantNet-300K (NeurIPS 2021): https://github.com/plantnet/PlantNet-300K (incluye cita del paper)
