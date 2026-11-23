# 1aurent/wide_resnet101_2.tiatoolbox-pcam

## Resumen

`wide_resnet101_2.tiatoolbox-pcam` es un modelo de clasificación de imágenes de histopatología desarrollado por el Tissue Image Analytics (TIA) Centre de la Universidad de Warwick y distribuido en Hugging Face por el usuario 1aurent. Se trata de una Wide-ResNet-B (variante de ResNet-101 con mayor anchura de canales) con 124.979.650 parámetros, entrenada sobre parches de 96 x 96 píxeles del conjunto Patch Camelyon (PCam) para la detección de metástasis en ganglios linfáticos. El modelo forma parte del ecosistema TIAToolbox, una librería de código abierto para análisis de imágenes de tejidos.

El modelo resuelve una tarea binaria de clasificación de parches histológicos (tejido con metástasis frente a tejido sano) y también puede utilizarse como extractor de características (feature backbone) para tareas downstream de visión computacional en patología digital. Su tamaño compacto (0,5 GB de repositorio) y su licencia CC0-1.0 lo hacen especialmente atractivo para integrarse en pipelines de investigación clínica sin restricciones de uso comercial.

Es relevante ahora porque la patología computacional asistida por IA está ganando tracción en entornos de investigación y diagnóstico, y este modelo ofrece un punto de partida reproducible, con pesos en safetensors y compatibilidad directa con `timm`, lo que simplifica su integración en flujos de trabajo existentes de deep learning.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Wide-ResNet-B (variante de ResNet-101 con mayor anchura) |
| Parametros totales | 124.979.650 (125,0 M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision; entrada 96 x 96 x 3) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; compatible con cuantizacion estandar de PyTorch) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | CC0-1.0 (Creative Commons Zero v1.0 Universal) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es una Wide-ResNet-B, una red neuronal convolucional residual (CNN) de tipo ResNet con un factor de anchura incrementado respecto al ResNet-101 original. El modelo tiene 125,0 M de parámetros y procesa entradas de 96 x 96 píxeles con 3 canales. Está integrado en `timm` (PyTorch Image Models) bajo el nombre `hf-hub:1aurent/wide_resnet101_2.tiatoolbox-pcam`, lo que permite cargarlo con una sola línea de código y obtener automáticamente las transformaciones de normalización y redimensionado específicas del modelo.

El entrenamiento se realizó sobre el dataset Patch Camelyon (PCam), un conjunto de parches histológicos de ganglios linfáticos etiquetados con presencia o ausencia de metástasis, ampliamente utilizado como benchmark en patología computacional. El modelo fue entrenado por el TIA Centre y forma parte de TIAToolbox, cuya publicación asociada es el artículo de Pocock et al. (2022) en *Communications Medicine*. No se dispone en la información proporcionada de detalles sobre el número de tokens de entrenamiento (al ser un modelo de visión, número de imágenes), composición exacta del dataset, ni si se aplicaron técnicas de aumento de datos o regularización específicas más allá de lo que implica el pipeline de TIAToolbox.

## Capacidades

- Clasificación de imágenes de parches histológicos (tejido con metástasis frente a tejido sano) en imágenes de 96 x 96 píxeles.
- Extracción de características (feature extraction): al configurar `num_classes=0`, el modelo devuelve un vector de características de la penúltima capa, útil como backbone para tareas downstream.
- Integración con `timm` para carga, transformaciones y uso directo en PyTorch.
- Compatible con el ecosistema TIAToolbox para análisis de imágenes de tejidos a gran escala (whole-slide images).
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso (no es un modelo de lenguaje).
- No tiene capacidades multilingües ni de generación de texto.
- No dispone de modo "thinking", visión general, audio ni otras capacidades multimodales más allá de la clasificación de imágenes.

## Casos de uso

- **Detección de metástasis en ganglios linfáticos**: el modelo clasifica parches de 96 x 96 píxeles como tejido con o sin metástasis, lo que permite construir pipelines de cribado asistido en investigación oncológica. Es adecuado por su entrenamiento específico en PCam y su licencia CC0.
- **Extracción de características para modelos downstream**: usando `num_classes=0`, se obtienen embeddings de parches histológicos que pueden alimentar clasificadores, modelos de segmentación o sistemas de recuperación por similitud en patología digital.
- **Preentrenamiento y fine-tuning en tareas de histología**: al ser un backbone convolucional compacto (125 M de parámetros), puede fine-tunearse con recursos moderados para tareas como clasificación de subtipos tumorales o detección de artefactos en preparaciones.
- **Integración en TIAToolbox para análisis de whole-slide images**: el modelo se puede usar dentro de pipelines de TIAToolbox para procesar imágenes de portaobjetos completos, extrayendo parches y clasificándolos de forma sistemática.
- **Investigación reproducible en patología computacional**: al estar disponible en Hugging Face con pesos en safetensors y licencia CC0, facilita la reproducibilidad de experimentos y la comparación con otros modelos de la literatura.
- **Prototipado rápido de aplicaciones de visión en patología**: la carga vía `timm` con una sola línea y las transformaciones automáticas permiten integrar el modelo en notebooks y prototipos en minutos, sin necesidad de preprocesamiento manual.
- **Cribado de bajo coste en entornos con recursos limitados**: su tamaño (0,5 GB) y arquitectura CNN permiten inferencia en GPU de consumo, lo que lo hace viable para laboratorios con infraestructura modesta.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- **VRAM estimada para inferencia**: al tratarse de un modelo de 125 M de parámetros, la inferencia en FP32 requiere aproximadamente 0,5 GB de VRAM para los pesos, más memoria para activaciones y batch. En FP16, la huella se reduce a unos 0,25 GB. Con batch pequeño, cabe holgadamente en cualquier GPU moderna.
- **GPU recomendadas**: cualquier GPU con al menos 2-4 GB de VRAM es suficiente. Se puede ejecutar en NVIDIA RTX 3060, RTX 4090, A100, H100, así como en GPUs de gama media y en CPU (con mayor latencia).
- **¿Cabe en consumer GPU?**: sí, en prácticamente cualquier GPU de consumo actual (GTX 1650 en adelante), e incluso en iGPU con suficiente memoria compartida para batches pequeños.
- **Opciones de despliegue**: PyTorch nativo, `timm`, TorchScript, ONNX Runtime, TensorRT, y dentro de TIAToolbox. No se dispone de soporte nativo documentado para vLLM, llama.cpp u Ollama (no aplica a modelos de visión).
- **Latencia y throughput estimados**: no disponibles en la información proporcionada. Al ser una CNN de 125 M de parámetros con entrada de 96 x 96, se espera una latencia muy baja (del orden de milisegundos por batch en GPU moderna), pero no se aportan cifras concretas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| wide_resnet101_2.tiatoolbox-pcam | 125,0 M | 96 x 96 x 3 | Clasificacion de parches histologicos (PCam) | CC0-1.0 | Hugging Face (timm) |
| ResNet-50 (ImageNet) | ~25,6 M | 224 x 224 x 3 | Clasificacion general de imagenes | Varía (BSD/Apache) | Amplia (timm, torchvision) |
| Wide-ResNet-101_2 (ImageNet) | ~126,9 M | 224 x 224 x 3 | Clasificacion general de imagenes | Varía | Amplia (timm) |
| Modelos de patologia tipo HistoSSL / CTransPath | no disponible | variable | Representacion de histologia | Varía | Hugging Face / repos |

La comparativa directa con otros modelos específicos de patología computacional no está disponible en la información proporcionada. El modelo se distingue por su entrenamiento específico en PCam y su licencia CC0, que elimina restricciones de uso comercial, a diferencia de muchos modelos de patología con licencias más restrictivas.

## Limitaciones y advertencias

- **Sesgos conocidos**: al entrenarse exclusivamente en PCam (ganglios linfáticos), el modelo puede no generalizar bien a otros tipos de tejido, tinciones o dominios de imagen histológica. No se dispone de información sobre sesgos demográficos o de adquisición.
- **Riesgo de alucinación**: no aplica en el sentido de modelos generativos, pero existe riesgo de falsos positivos y falsos negativos en la clasificación, especialmente en parches ambiguos o con artefactos.
- **Limitaciones de contexto o idioma**: la entrada está fijada a 96 x 96 píxeles y 3 canales; no procesa imágenes de mayor resolución sin redimensionado. No es un modelo de lenguaje, por lo que no tiene capacidades de idioma.
- **Restricciones de licencia para uso comercial**: la licencia CC0-1.0 permite uso comercial sin restricciones, pero se recomienda verificar que el uso clínico cumpla con la normativa sanitaria aplicable (el modelo es de investigación, no un dispositivo médico).
- **Caveats para producción**: no se han publicado métricas de rendimiento en la información disponible; se recomienda validar el modelo en el dominio específico antes de desplegarlo. No debe usarse como sustituto del diagnóstico médico profesional. La fecha de actualización del repositorio (2026) sugiere mantenimiento, pero no se dispone de información sobre versionado o cambios.

## Enlaces

- Hugging Face: https://huggingface.co/1aurent/wide_resnet101_2.tiatoolbox-pcam
- Repositorio TIAToolbox: https://github.com/TissueImageAnalytics/tiatoolbox
- Dataset Patch Camelyon (PCam): https://github.com/basveeling/pcam/
- Artículo TIAToolbox (Communications Medicine, 2022): https://www.nature.com/articles/s43856-022-00186-5
- DOI del artículo: https://doi.org/10.1038/s43856-022-00186-5
- Licencia CC0-1.0: https://creativecommons.org/publicdomain/zero/1.0/legalcode
- TIA Centre (Universidad de Warwick): https://warwick.ac.uk/fac/cross_fac/tia/
- Ejemplo de imagen histológica usado en la model card: https://github.com/owkin/HistoSSLscaling/raw/main/assets/example.tif
