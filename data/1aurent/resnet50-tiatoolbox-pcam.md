# 1aurent/resnet50.tiatoolbox-pcam

## Resumen

`resnet50.tiatoolbox-pcam` es un modelo de clasificación de imágenes basado en ResNet-50, entrenado por el Tissue Image Analytics (TIA) Centre de la Universidad de Warwick sobre parches de histología del dataset Patch Camelyon (PCam). El modelo se distribuye a través de Hugging Face con la librería `timm` y forma parte del ecosistema de TIAToolbox, una librería de código abierto para análisis de imágenes de tejidos.

Su propósito principal es la clasificación binaria de parches histopatológicos de 96 x 96 píxeles para detectar metástasis en ganglios linfáticos (tarea conocida como CAMELYON). Además, puede emplearse como backbone de extracción de características para tareas de visión por computador en el dominio histológico, lo que lo hace útil como extractor de embeddings en pipelines de patología digital.

Con 23,56 millones de parámetros y un tamaño de repositorio de 0,1 GB, es un modelo compacto y ligero, adecuado para despliegue en entornos con recursos limitados. Su licencia CC0-1.0 permite uso comercial sin restricciones, lo que resulta relevante para aplicaciones clínicas y de investigación trasladables a producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ResNet-50 (red neuronal convolucional residual) |
| Parametros totales | 23.565.250 (23,6 M) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión; entrada de 96 x 96 x 3 píxeles) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; compatible con cuantización estándar de timm/PyTorch, no documentada por el autor) |
| Idiomas soportados | no aplica (modelo de imagen, sin capacidades lingüísticas) |
| Licencia | CC0-1.0 (Creative Commons Zero v1.0 Universal) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura ResNet-50, una red convolucional residual con 50 capas que utiliza conexiones skip para facilitar el entrenamiento de redes profundas. La entrada es una imagen RGB de 96 x 96 píxeles, y la salida es un vector de logits para clasificación (o un vector de características si se configura `num_classes=0`). El modelo se integra en `timm` mediante el identificador `hf-hub:1aurent/resnet50.tiatoolbox-pcam`.

El entrenamiento se realizó sobre el dataset Patch Camelyon (PCam), compuesto por parches de histología de ganglios linfáticos etiquetados según la presencia o ausencia de metástasis. El autor del modelo es el TIA Centre, y la model card referencia la publicación de TIAToolbox (Pocock et al., 2022, *Communications Medicine*). No se detallan en la información disponible el número de tokens de entrenamiento (no aplica), la composición exacta del dataset más allá de PCam, ni si se emplearon técnicas de aumento de datos, ajuste fino diferencial o regularización específica. Tampoco se documenta el uso de RLHF/DPO (no aplica a un modelo de visión) ni innovaciones como decodificación especulativa o atención lineal.

## Capacidades

- Clasificación de imágenes histopatológicas: detección binaria de metástasis en parches de ganglios linfáticos (PCam).
- Extracción de características (feature extraction): puede actuar como backbone para generar embeddings de parches histológicos, útil en pipelines de recuperación, clustering o modelos posteriores.
- Integración con `timm`: carga directa mediante `timm.create_model` con transforms específicos del modelo.
- Compatibilidad con TIAToolbox: forma parte del ecosistema de herramientas para patología digital.
- No soporta tool calling, function calling, agentes ni razonamiento multi-step (no es un modelo de lenguaje).
- No tiene capacidades multilingües ni de generación de texto.
- No dispone de modo "thinking", visión general (solo histología), audio ni otras modalidades.

## Casos de uso

- Detección de metástasis en ganglios linfáticos: el modelo clasifica parches de 96 x 96 píxeles como tejido sano o metastásico, lo que permite construir pipelines de cribado automatizado en patología digital. Es adecuado por su entrenamiento específico en PCam y su bajo coste computacional.
- Extracción de embeddings para búsqueda de imágenes similares: usando `num_classes=0`, el modelo genera vectores de características que pueden indexarse para recuperar parches histológicos similares en bases de datos de diapositivas completas (WSI).
- Preentrenamiento como backbone en tareas downstream: sus pesos pueden inicializar modelos de segmentación o clasificación de tejidos en otras tareas histológicas, aprovechando el aprendizaje transferido del dominio PCam.
- Control de calidad en pipelines de digitalización: el modelo puede emplearse para filtrar parches no informativos o artefactos, actuando como clasificador rápido en etapas de preprocesado.
- Investigación en patología computacional: sirve como baseline reproducible para comparar con otros modelos (p. ej., modelos basados en transformers de visión) en experimentos académicos.
- Despliegue en entornos con recursos limitados: con 23,6 M de parámetros y 0,1 GB de pesos, puede ejecutarse en CPU o GPU de gama baja para inferencia por lotes en laboratorios sin infraestructura de alto rendimiento.
- Integración en TIAToolbox: uso directo dentro de la librería para tareas de clasificación de parches en flujos de trabajo de análisis de tejidos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en precisión FP32 (23,6 M de parámetros, ~94 MB de pesos); en FP16, ~47 MB. La memoria adicional depende del tamaño de lote y de las activaciones intermedias.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM (GTX 1050, RTX 3050, etc.). Para inferencia por lotes a gran escala, se recomiendan GPUs de gama media como RTX 3060 o superiores.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU consumer moderna, e incluso en CPU para inferencia por lotes pequeños.
- Opciones de despliegue: `timm` (PyTorch), exportación a ONNX, TorchScript, o integración en TIAToolbox. No se documenta soporte nativo para vLLM, llama.cpp, Ollama o TGI (no aplica a modelos de visión de este tipo).
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto/entrada | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| resnet50.tiatoolbox-pcam | 23,6 M | 96 x 96 x 3 | no disponible | CC0-1.0 | Hugging Face (timm) |
| ResNet-50 (ImageNet, timm) | 25,6 M | 224 x 224 x 3 | no comparable (dominio distinto) | Apache-2.0 / BSD | Hugging Face (timm) |
| ViT-S/16 (histología, p. ej. owkin/phikon) | ~21 M | 224 x 224 x 3 | no disponible | varía | Hugging Face |
| CTransPath (histología) | ~28 M | 224 x 224 x 3 | no disponible | varía | GitHub / Hugging Face |

La comparativa es orientativa: los modelos alternativos pueden tener dominios de entrenamiento distintos (ImageNet vs. histología) y métricas no directamente comparables. No se dispone de datos de rendimiento del modelo evaluado frente a estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: el modelo se entrenó exclusivamente en PCam (parches de ganglios linfáticos), por lo que puede generalizar mal a otros tejidos u órganos. No se documentan análisis de sesgo demográfico o de adquisición.
- Riesgo de alucinación: no aplica en el sentido lingüístico, pero existe riesgo de falsos positivos/negativos en la clasificación; no debe usarse como único criterio diagnóstico.
- Limitaciones de contexto o idioma: la entrada está restringida a 96 x 96 píxeles; imágenes de mayor resolución deben redimensionarse o dividirse en parches. No soporta texto ni otros idiomas.
- Restricciones de licencia: CC0-1.0 permite uso comercial sin restricciones, pero se recomienda verificar la licencia de los datos de entrenamiento (PCam) para cumplimiento normativo en aplicaciones clínicas.
- Caveats para producción: no se documentan métricas de calibración, robustez a artefactos de tinción o variaciones de escáner. El modelo es antiguo (creado en 2023) y puede haber alternativas más modernas con mejor rendimiento en histología. No se garantiza soporte o mantenimiento continuo por parte del autor.

## Enlaces

- Hugging Face: https://huggingface.co/1aurent/resnet50.tiatoolbox-pcam
- Repositorio TIAToolbox: https://github.com/TissueImageAnalytics/tiatoolbox
- Dataset Patch Camelyon: https://github.com/basveeling/pcam/
- Publicación TIAToolbox (Pocock et al., 2022): https://www.nature.com/articles/s43856-022-00186-5
- DOI: https://doi.org/10.1038/s43856-022-00186-5
- Ejemplo de imagen histológica (HistoSSLscaling): https://github.com/owkin/HistoSSLscaling/raw/main/assets/example.tif
- Centro TIA (Universidad de Warwick): https://warwick.ac.uk/fac/cross_fac/tia/
- Librería timm: https://github.com/huggingface/pytorch-image-models
