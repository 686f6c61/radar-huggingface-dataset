# 1aurent/densenet161.tiatoolbox-pcam

## Resumen

`densenet161.tiatoolbox-pcam` es un modelo de clasificación de imágenes basado en la arquitectura DenseNet-161, entrenado por el Tissue Image Analytics (TIA) Centre de la Universidad de Warwick sobre parches de histología del conjunto de datos Patch Camelyon (PCam). Está pensado para la detección de metástasis en ganglios linfáticos a partir de imágenes de tejido teñido con hematoxilina y eosina, una tarea central en patología computacional.

El modelo forma parte del ecosistema TIAToolbox, una librería de código abierto para análisis de imágenes de tejido, y se distribuye en formato compatible con `timm` (PyTorch). Con 26,7 millones de parámetros y una entrada de 96×96×3 píxeles, es un modelo compacto que puede actuar tanto como clasificador binario (tejido tumoral frente a sano) como backbone de extracción de características para tareas de segmentación o clasificación posteriores.

Su relevancia actual reside en que ofrece un punto de partida reproducible y con licencia CC0 para pipelines de patología digital, donde los modelos fundacionales de gran tamaño suelen requerir recursos elevados. Al ser un modelo pequeño y con licencia permisiva, resulta útil para prototipado, validación de pipelines y despliegue en entornos con recursos limitados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DenseNet-161 (red convolucional densamente conectada) |
| Parametros totales | 26.696.354 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión; entrada fija de 96×96×3 píxeles) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; cuantización posible vía herramientas externas de PyTorch) |
| Idiomas soportados | no aplica (modelo de imagen) |
| Licencia | CC0 1.0 Universal |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es DenseNet-161, una red convolucional en la que cada capa recibe como entrada las salidas de todas las capas anteriores dentro de un mismo bloque denso. Esto favorece la reutilización de características, reduce el número de parámetros respecto a redes equivalentes en profundidad y mitiga el problema del desvanecimiento del gradiente. El modelo opera sobre parches de 96×96 píxeles con tres canales, un tamaño habitual en los parches de PCam.

El entrenamiento se realizó sobre el dataset Patch Camelyon, compuesto por parches de imágenes histológicas de ganglios linfáticos con etiquetas binarias de presencia o ausencia de metástasis. La model card no detalla el número de épocas, la composición exacta del dataset, el uso de aumentación de datos ni si se aplicaron técnicas de ajuste fino adicionales más allá del entrenamiento supervisado. Tampoco se documentan innovaciones técnicas específicas como decodificación especulativa o atención lineal, dado que se trata de una CNN clásica.

## Capacidades

- Clasificación de imágenes de parches histológicos en dos clases (tejido con metástasis frente a tejido sano).
- Extracción de características (feature extraction): al cargar el modelo con `num_classes=0` se obtiene un vector de embeddings por imagen, útil como backbone para tareas posteriores.
- Integración nativa con `timm`, lo que permite cargar el modelo mediante `timm.create_model("hf-hub:1aurent/densenet161.tiatoolbox-pcam", pretrained=True)`.
- Compatibilidad con los transforms de `timm` para normalización y redimensionado automáticos.
- No soporta tool calling, function calling ni razonamiento multi-paso: es un modelo puramente visual y discriminativo.
- No tiene capacidades multilingües ni de generación de texto.
- No dispone de modo de razonamiento (thinking mode), visión general, audio ni otras modalidades más allá de la clasificación de imágenes.

## Casos de uso

- Detección de metástasis en ganglios linfáticos: el modelo clasifica parches de 96×96 píxeles extraídos de portaobjetos de anatomía patológica, permitiendo un cribado preliminar automatizado de regiones sospechosas antes de la revisión por un patólogo.
- Backbone para pipelines de segmentación: al usar `num_classes=0`, los embeddings generados pueden alimentar clasificadores o cabezales de segmentación en flujos de trabajo de patología computacional con TIAToolbox.
- Preentrenamiento y ajuste fino en dominios histológicos: al estar entrenado en PCam, sirve como inicialización para tareas relacionadas como clasificación de subtipos tumorales o detección de mitosis.
- Prototipado rápido de pipelines de imagen médica: su tamaño reducido (26,7 M de parámetros, ~0,1 GB de repo) permite iterar rápidamente en entornos de desarrollo sin GPU de gama alta.
- Validación de infraestructura de inferencia: útil como modelo de referencia para probar despliegues con `timm`, TorchServe o servicios REST de clasificación de imágenes.
- Investigación reproducible en patología digital: la licencia CC0 y la disponibilidad en Hugging Face facilitan la replicación de experimentos y la comparación de resultados entre grupos.
- Educación y demostraciones: adecuado para mostrar el funcionamiento de modelos de clasificación de imágenes en cursos de visión por computador aplicada a medicina.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en FP32 para lotes pequeños (26,7 M de parámetros, ~107 MB en FP32); en FP16 aproximadamente 54 MB de pesos.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente; funcionan correctamente tarjetas consumer como GTX 1650, RTX 3060, RTX 4090, así como A100 y H100 para despliegues de alto throughput.
- Cabe en GPU consumer: sí, en prácticamente cualquier GPU consumer moderna e incluso en CPU para inferencia por lotes pequeños.
- Opciones de despliegue: PyTorch nativo, `timm`, TorchServe, ONNX Runtime (previa exportación), y servicios REST personalizados. No se documenta soporte nativo para vLLM, llama.cpp, Ollama o TGI, que están orientados a modelos de lenguaje.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Entrada | Contexto/uso | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| densenet161.tiatoolbox-pcam | 26,7 M | 96×96×3 | Clasificación de parches histológicos (PCam) | CC0 1.0 | Hugging Face (timm) |
| densenet121.tiatoolbox-pcam | no disponible en la información | no disponible | Clasificación de parches histológicos (PCam) | no disponible | Referenciado en el ecosistema TIAToolbox |
| Otros backbones de timm (p. ej., ResNet-50) | ~25,6 M (referencia general) | variable | Clasificación de imágenes genérica | variable según checkpoint | Hugging Face (timm) |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- El modelo está entrenado exclusivamente sobre parches de PCam (96×96 píxeles); su uso con imágenes de otras resoluciones, tinciones o tejidos puede degradar el rendimiento.
- No se documentan análisis de sesgos demográficos ni de equidad entre subpoblaciones; en aplicaciones clínicas esto es un riesgo relevante.
- Riesgo de alucinación no aplica en sentido generativo, pero sí existe riesgo de falsos positivos y falsos negativos en la clasificación, con implicaciones clínicas.
- No debe utilizarse como herramienta de diagnóstico autónomo sin validación clínica y supervisión profesional.
- La licencia CC0 1.0 permite uso comercial sin restricciones, pero el autor no ofrece garantías sobre el rendimiento en dominios distintos al de entrenamiento.
- No se documentan limitaciones idiomáticas porque el modelo no procesa texto.
- La información sobre el proceso de entrenamiento (épocas, aumentación, métricas de validación) es escasa, lo que dificulta evaluar su robustez en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/1aurent/densenet161.tiatoolbox-pcam
- Repositorio TIAToolbox: https://github.com/TissueImageAnalytics/tiatoolbox
- Centro TIA (Universidad de Warwick): https://warwick.ac.uk/fac/cross_fac/tia/
- Dataset Patch Camelyon (PCam): https://github.com/basveeling/pcam/
- Artículo TIAToolbox (Communications Medicine, 2022): https://www.nature.com/articles/s43856-022-00186-5
- DOI del artículo: https://doi.org/10.1038/s43856-022-00186-5
- Licencia CC0 1.0: https://creativecommons.org/publicdomain/zero/1.0/legalcode
