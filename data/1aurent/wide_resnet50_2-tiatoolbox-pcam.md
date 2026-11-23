# 1aurent/wide_resnet50_2.tiatoolbox-pcam

## Resumen

`wide_resnet50_2.tiatoolbox-pcam` es un modelo de clasificación de imágenes de dominio específico, una Wide-ResNet-50-2 adaptada para el análisis de parches histológicos. Lo publica el usuario 1aurent en Hugging Face, pero el entrenamiento original corre a cargo del Tissue Image Analytics (TIA) Centre de la Universidad de Warwick, dentro del ecosistema de TIAToolbox. El modelo se distribuye como pesos compatibles con `timm` y se ha entrenado sobre el conjunto Patch Camelyon (PCam), un benchmark clásico de detección de metástasis en ganglios linfáticos.

No es un modelo de lenguaje ni un modelo multimodal generativo: es un backbone convolucional de visión que produce logits de clasificación binaria (tejido tumoral frente a tejido sano) o embeddings de características si se carga con `num_classes=0`. Con 66,9 millones de parámetros y una entrada de 96×96×3 píxeles, está diseñado para integrarse en pipelines de patología computacional, no para conversación ni generación de texto.

Su relevancia actual es la de un componente de referencia dentro de TIAToolbox: un modelo pequeño, con licencia CC0, reproducible y fácil de cargar vía `timm.create_model(model_name="hf-hub:...")`. Sirve como baseline para tareas de clasificación de parches histológicos y como extractor de características para modelos de mayor tamaño en flujos de patología digital.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Wide-ResNet-50-2 (CNN, familia ResNet con factor de anchura 2) |
| Parametros totales | 66.906.562 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión; entrada de imagen 96×96×3) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; cuantización no documentada por el autor) |
| Idiomas soportados | no aplica (modelo de visión, sin capacidades lingüísticas) |
| Licencia | CC0-1.0 (Creative Commons Zero v1.0 Universal) |
| Formato de pesos | safetensors (compatible con `timm`) |

## Arquitectura y entrenamiento

La arquitectura es una Wide-ResNet-50-2, es decir, una ResNet-50 con el doble de canales por bloque (factor de anchura 2), lo que eleva el cómputo y la capacidad respecto a la ResNet-50 estándar. La entrada es de 96×96×3 píxeles, tamaño típico de los parches de PCam. El modelo se usa tanto como clasificador (cabeza de clasificación) como backbone de extracción de características (`num_classes=0`), y se integra en `timm` con las transformaciones de normalización y redimensionado resueltas automáticamente mediante `timm.data.resolve_model_data_config`.

El entrenamiento se realizó sobre Patch Camelyon (PCam), un dataset de parches de imágenes de ganglios linfáticos con etiquetas binarias de metástasis. La model card no detalla el número de épocas, la composición exacta del dataset, el esquema de aumentación ni si hubo ajuste fino adicional; tampoco documenta el uso de RLHF, DPO ni técnicas de alineación, algo esperable en un modelo de visión supervisado. La innovación técnica reseñable es su empaquetado dentro de TIAToolbox y su publicación como pesos `timm` reutilizables, lo que permite cargarlo con una sola línea y usarlo como extractor de embeddings en flujos de patología digital.

## Capacidades

- Clasificación binaria de parches histológicos (tejido con metástasis frente a tejido sin metástasis) sobre imágenes de 96×96×3.
- Extracción de características (embeddings) cargando el modelo con `num_classes=0`, útil como backbone para tareas posteriores.
- Integración nativa con `timm`: carga vía `timm.create_model`, transformaciones resueltas con `timm.data.resolve_model_data_config`.
- Compatibilidad con TIAToolbox, la librería de análisis de imágenes de tejidos del TIA Centre.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni generación de texto.
- No tiene capacidades multilingües ni de visión general: está especializado en parches de histología.
- No dispone de modo "thinking", visión de escenas naturales, audio ni otras capacidades multimodales.

## Casos de uso

- Detección de metástasis en ganglios linfáticos: clasificación de parches de 96×96 extraídos de portaobjetos completos para señalar regiones sospechosas, aprovechando que el modelo está entrenado específicamente sobre PCam.
- Baseline en investigación de patología computacional: punto de partida reproducible para comparar nuevas arquitecturas o estrategias de aumentación sobre PCam, con licencia CC0 que elimina fricción legal.
- Extracción de embeddings para búsqueda por similitud: cargando el modelo con `num_classes=0` se obtienen vectores de características que pueden indexarse para recuperar parches morfológicamente similares en un archivo de diapositivas.
- Preentrenamiento o ajuste fino en tareas derivadas: uso como inicialización de un backbone en clasificación de subtipos tumorales o detección de mitosis, sustituyendo la cabeza de clasificación.
- Control de calidad de pipelines de digitalización: detección de parches con tejido relevante frente a fondo o artefactos, como paso previo a análisis más costosos.
- Integración en TIAToolbox: uso dentro de flujos existentes de la librería para segmentación, clasificación o extracción de características en estudios de patología digital.
- Prototipado rápido en entornos con recursos limitados: al ser un modelo de 66,9 M de parámetros y 0,3 GB de repo, cabe en GPUs de consumo y permite iterar sin infraestructura dedicada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: en FP32, aproximadamente 270 MB solo para pesos (66,9 M de parámetros × 4 bytes), más activaciones; en la práctica, menos de 1 GB para lotes pequeños a 96×96.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; una RTX 3060, RTX 4090, A100 o H100 son sobredimensionadas para este modelo, que está pensado para ejecutarse en hardware modesto.
- Cabe en GPU de consumo: sí, en cualquier GPU consumer moderna (GTX 1650, RTX 3050, RTX 4060, etc.) e incluso en CPU para inferencia por lotes pequeños.
- Opciones de despliegue: `timm` con PyTorch es la vía nativa; también puede exportarse a ONNX o TorchScript para servir con ONNX Runtime o TensorRT. No hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI, que son herramientas para modelos de lenguaje.
- Latencia y throughput estimados: no disponibles en la información proporcionada; al ser una CNN de 96×96, se espera un throughput alto en GPU, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Entrada | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| wide_resnet50_2.tiatoolbox-pcam | 66,9 M | 96×96×3 | no aplica | CC0-1.0 | Hugging Face (`timm`) |
| ResNet-50 estándar (ImageNet) | ~25,6 M | 224×224×3 | no aplica | varía según checkpoint | Amplia (`timm`, torchvision) |
| Otros checkpoints de TIAToolbox en HF | no disponible | no disponible | no aplica | no disponible | Hugging Face |
| Backbones histológicos tipo HistoSSL | no disponible | no disponible | no aplica | no disponible | Hugging Face / repos de Owkin |

La comparación directa con alternativas de la misma categoría (clasificación de parches histológicos) es limitada porque la información disponible no incluye métricas ni especificaciones de los modelos competidores. El punto diferencial de este checkpoint es su licencia CC0 y su integración con `timm` y TIAToolbox.

## Limitaciones y advertencias

- Modelo de dominio muy específico: entrenado sobre PCam (ganglios linfáticos), por lo que su rendimiento fuera de ese tipo de tejido o de esa tarea no está garantizado.
- Entrada fija de 96×96×3: no admite imágenes de mayor resolución sin redimensionado, lo que puede perder detalle morfológico relevante.
- Riesgo de alucinación no aplica en el sentido generativo, pero sí existe riesgo de falsos positivos y falsos negativos en la clasificación; no debe usarse como diagnóstico clínico sin validación externa.
- Sesgos conocidos: no documentados en la model card; el dataset PCam tiene una distribución concreta de tinciones y escáneres que puede no representar otros entornos clínicos.
- Limitaciones de idioma: no aplica, es un modelo de visión sin capacidades lingüísticas.
- Restricciones de licencia: CC0-1.0 permite uso comercial sin atribución, pero eso no exime de las obligaciones regulatorias aplicables a software médico.
- Caveat para producción: la model card no documenta métricas de validación, calibración ni robustez; antes de desplegarlo en un flujo clínico es necesario evaluarlo sobre datos propios.
- El repo tiene pocas descargas (79) y ningún "like", lo que sugiere una adopción limitada y poca validación comunitaria.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/1aurent/wide_resnet50_2.tiatoolbox-pcam
- Dataset Patch Camelyon (PCam): https://github.com/basveeling/pcam/
- Repositorio TIAToolbox: https://github.com/TissueImageAnalytics/tiatoolbox
- TIA Centre (Universidad de Warwick): https://warwick.ac.uk/fac/cross_fac/tia/
- Paper de TIAToolbox (Communications Medicine, 2022): https://www.nature.com/articles/s43856-022-00186-5
- DOI del paper: https://doi.org/10.1038/s43856-022-00186-5
- Licencia CC0-1.0: https://creativecommons.org/publicdomain/zero/1.0/legalcode
- Imagen de ejemplo usada en la model card: https://github.com/owkin/HistoSSLscaling/raw/main/assets/example.tif
