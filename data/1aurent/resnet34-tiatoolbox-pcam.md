# 1aurent/resnet34.tiatoolbox-pcam

## Resumen

`resnet34.tiatoolbox-pcam` es un modelo de clasificación de imágenes basado en ResNet-34, entrenado por el Tissue Image Analytics (TIA) Centre de la Universidad de Warwick sobre parches de histología del dataset Patch Camelyon (PCam). Se distribuye a través de Hugging Face con la librería `timm` y forma parte del ecosistema de TIAToolbox, una librería de código abierto para análisis de imágenes de tejidos. El modelo resuelve una tarea concreta: clasificar parches de 96x96 píxeles de tejido histológico, originalmente en el contexto de detección de metástasis en ganglios linfáticos.

Con 21,3 millones de parámetros y un tamaño de repositorio de 0,1 GB, es un modelo compacto pensado para inferencia rápida y extracción de características (feature extraction) en pipelines de patología digital. Su relevancia radica en que sirve como backbone preentrenado para tareas de análisis de imágenes histológicas, un dominio donde los modelos genéricos de visión rinden peor que los especializados.

No es un modelo de lenguaje: no procesa texto ni tiene ventana de contexto en el sentido de los LLM. Su entrada es una imagen RGB de 96x96 y su salida es un vector de logits o de características. La licencia CC0-1.0 permite uso comercial sin restricciones, lo que lo hace atractivo para integrarlo en productos de patología computacional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ResNet-34 (CNN con conexiones residuales) |
| Parametros totales | 21.302.722 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión; entrada de 96x96x3 píxeles) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; cuantización posible vía herramientas externas como ONNX Runtime o PyTorch) |
| Idiomas soportados | no aplica (modelo de visión, no procesa texto) |
| Licencia | CC0-1.0 (Creative Commons Zero v1.0 Universal) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

ResNet-34 es una red neuronal convolucional con 34 capas y conexiones residuales (skip connections) que mitigan el problema del desvanecimiento del gradiente en redes profundas. La arquitectura emplea bloques residuales con convoluciones 3x3, normalización por lotes y activaciones ReLU. El modelo recibe imágenes de 96x96x3 y produce una representación vectorial que puede usarse para clasificación (con la cabeza de clasificación) o como backbone de características (con `num_classes=0`).

El entrenamiento se realizó sobre el dataset Patch Camelyon (PCam), compuesto por parches de 96x96 extraídos de imágenes de ganglios linfáticos teñidos con H&E. PCam es un benchmark estándar para detección de metástasis. No se dispone en la información proporcionada de detalles sobre el número exacto de épocas, la composición del dataset, el uso de aumentación de datos ni si hubo fases de ajuste fino adicionales. El modelo se distribuye a través de `timm` con la etiqueta `hf-hub:1aurent/resnet34.tiatoolbox-pcam`, lo que permite cargarlo directamente con `timm.create_model`.

## Capacidades

- Clasificación de imágenes de parches histológicos de 96x96 píxeles en categorías (presencia o ausencia de metástasis, según el etiquetado de PCam).
- Extracción de características (feature extraction): con `num_classes=0` devuelve un vector de embeddings utilizable como entrada para clasificadores posteriores, clustering o recuperación por similitud.
- Actúa como backbone preentrenado para tareas de patología digital: segmentación, detección o clasificación de tejidos, mediante ajuste fino.
- Integración con TIAToolbox para pipelines de análisis de imágenes de tejidos a gran escala.
- Inferencia rápida en CPU y GPU gracias a su tamaño reducido (21,3 M de parámetros).
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingües (no es un modelo de lenguaje).
- No dispone de modo "thinking", visión general, audio ni otras capacidades multimodales más allá de la clasificación de imágenes.

## Casos de uso

- Detección de metástasis en ganglios linfáticos: el modelo clasifica parches de 96x96 de tejido teñido con H&E, lo que permite construir pipelines de cribado que prioricen las regiones sospechosas para revisión por patólogos. Es adecuado porque está entrenado específicamente sobre PCam, el benchmark estándar de esta tarea.
- Extracción de embeddings para búsqueda por similitud: usando `num_classes=0`, se generan vectores de características que permiten indexar parches histológicos y recuperar imágenes visualmente similares en un archivo digital de patología.
- Backbone para ajuste fino en tareas de patología: se puede reinicializar la cabeza de clasificación y entrenar sobre un dataset propio (por ejemplo, clasificación de subtipos tumorales) aprovechando las características aprendidas en PCam.
- Preprocesamiento en pipelines de TIAToolbox: el modelo se integra en flujos de trabajo de análisis de tejidos a gran escala, donde se necesita un clasificador rápido y ligero para filtrar parches antes de modelos más costosos.
- Control de calidad de imágenes histológicas: clasificar parches como tejido válido frente a artefactos (fondo, pliegues, burbujas) tras un ajuste fino mínimo, gracias a la representación genérica de texturas que aprende la ResNet-34.
- Docencia y experimentación en patología computacional: su tamaño reducido (0,1 GB) y licencia CC0 permiten usarlo en entornos académicos y prototipos sin restricciones legales ni requisitos de hardware elevados.
- Inferencia en dispositivos con recursos limitados: al tener 21,3 M de parámetros, puede ejecutarse en CPU o en GPUs de gama baja para clasificación por lotes de parches en laboratorios sin infraestructura de alto rendimiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en FP32 (21,3 M de parámetros, aproximadamente 85 MB de pesos). En FP16, en torno a 43 MB de pesos.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente; RTX 3060, RTX 4090, A100 o H100 funcionan sin problema, aunque el modelo está sobredimensionado para estas últimas.
- Cabe en GPU de consumo: sí, en cualquier GPU consumer moderna (GTX 1050 en adelante) e incluso en CPU.
- Opciones de despliegue: `timm` (carga directa desde Hugging Face), PyTorch, exportación a ONNX Runtime, TorchScript o TensorRT para optimización. No se documenta soporte nativo para vLLM, llama.cpp, Ollama ni TGI (son herramientas orientadas a LLM).
- Latencia y throughput estimados: no disponibles en la información proporcionada. Dado el tamaño, se espera un throughput alto en GPU (miles de parches por segundo), pero no se aportan cifras oficiales.

## Comparativa con modelos similares

| Modelo | Parametros | Entrada | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `1aurent/resnet34.tiatoolbox-pcam` | 21,3 M | 96x96x3 | no aplica | CC0-1.0 | Hugging Face (`timm`) |
| ResNet-50 (ImageNet, `timm`) | 25,6 M | 224x224x3 | no aplica | según variante | Hugging Face (`timm`) |
| ViT-B/16 (ImageNet, `timm`) | 86 M | 224x224x3 | no aplica | según variante | Hugging Face (`timm`) |
| Modelos HistoSSL / Owkin | no disponible | variable | no aplica | no disponible | Hugging Face |

La comparación con alternativas de patología computacional es limitada porque no se dispone de datos de rendimiento del modelo en la información proporcionada. Frente a un ResNet-50 genérico de ImageNet, este modelo está especializado en histología y tiene una entrada más pequeña (96x96), lo que reduce el coste computacional. Frente a transformers de visión como ViT-B/16, es mucho más ligero (21,3 M frente a 86 M de parámetros) y probablemente más rápido en inferencia, a costa de una capacidad de representación menor. No se dispone de comparativas de precisión con modelos especializados en patología como los de Owkin (HistoSSL) porque no se han publicado resultados en la información disponible.

## Limitaciones y advertencias

- Sesgos conocidos: el modelo se entrenó exclusivamente sobre PCam (ganglios linfáticos teñidos con H&E), por lo que su rendimiento puede degradarse en otros tipos de tejido, tinciones distintas o dominios de imagen diferentes.
- Riesgo de alucinación: no aplica en el sentido de los LLM, pero sí existe riesgo de falsos positivos y falsos negativos en la clasificación de parches, especialmente en bordes de tejido o artefactos.
- Limitaciones de contexto o idioma: no procesa texto; la entrada está restringida a imágenes de 96x96x3. Imágenes de mayor resolución deben redimensionarse o dividirse en parches.
- Restricciones de licencia para uso comercial: la licencia CC0-1.0 no impone restricciones, pero el uso clínico requiere validación regulatoria independiente; el modelo no está certificado como dispositivo médico.
- Caveat importante para producción: no se han publicado métricas de rendimiento (exactitud, AUC, sensibilidad) en la información disponible, por lo que es imprescindible evaluarlo sobre el dataset objetivo antes de desplegarlo. Además, el modelo se actualizó por última vez en 2026 según los metadatos, pero no se documentan cambios en la model card.
- El modelo no sustituye el diagnóstico de un patólogo; cualquier uso clínico debe enmarcarse en un flujo de trabajo con supervisión humana.

## Enlaces

- Hugging Face: https://huggingface.co/1aurent/resnet34.tiatoolbox-pcam
- Repositorio TIAToolbox: https://github.com/TissueImageAnalytics/tiatoolbox
- Dataset Patch Camelyon (PCam): https://github.com/basveeling/pcam/
- Paper TIAToolbox (Communications Medicine, 2022): https://www.nature.com/articles/s43856-022-00186-5
- DOI del paper: https://doi.org/10.1038/s43856-022-00186-5
- Licencia CC0-1.0: https://creativecommons.org/publicdomain/zero/1.0/legalcode
- Ejemplo de imagen histológica usado en la model card: https://github.com/owkin/HistoSSLscaling/raw/main/assets/example.tif
- Centro TIA (Universidad de Warwick): https://warwick.ac.uk/fac/cross_fac/tia/
