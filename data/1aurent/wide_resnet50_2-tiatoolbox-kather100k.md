# 1aurent/wide_resnet50_2.tiatoolbox-kather100k

## Resumen

`wide_resnet50_2.tiatoolbox-kather100k` es un modelo de clasificación de imágenes de tejidos histológicos desarrollado por el Tissue Image Analytics (TIA) Centre de la Universidad de Warwick y distribuido en Hugging Face por el usuario 1aurent. Se trata de una red convolucional Wide-ResNet-50-2 (Wide-ResNet-B) con 66,9 millones de parámetros, entrenada sobre parches de histología del conjunto kather100k (también conocido como NCT-CRC-HE), que agrupa imágenes de tejido colorectal teñido con H&E.

El modelo no es un modelo de lenguaje: resuelve el problema de clasificación de parches histopatológicos en clases tisulares (tejido adiposo, fondo, debris, linfocitos, mucosa, músculo liso, tejido nervioso, estroma, entre otras) y también puede emplearse como extractor de características (backbone) para tareas de visión por computador en patología digital. Es relevante para pipelines de análisis de imágenes de biopsias, investigación oncológica y como componente dentro de la librería TIAToolbox.

Su formato es safetensors y se carga mediante `timm` con `timm.create_model(model_name="hf-hub:1aurent/wide_resnet50_2.tiatoolbox-kather100k", pretrained=True)`. La entrada es una imagen RGB de 224×224×3 y la licencia es CC BY 4.0, lo que permite uso comercial con atribución.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Wide-ResNet-50-2 (Wide-ResNet-B), red convolucional |
| Parámetros totales | 66.920.905 (66,9 M) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión; entrada 224×224×3) |
| Tipos de cuantización | no disponible (pesos safetensors en precisión original) |
| Idiomas soportados | no aplica (modelo de imagen, sin capacidades lingüísticas) |
| Licencia | CC BY 4.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es una Wide-ResNet-50-2, variante de ResNet con conexiones residuales y un factor de ensanchamiento que incrementa el número de canales por bloque respecto a la ResNet-50 estándar. La entrada es de 224×224 píxeles con 3 canales RGB y la salida es un vector de logits por clase (o un vector de características si se configura `num_classes=0`). El modelo se distribuye a través de `timm` y es compatible con las transformaciones estándar de normalización y redimensionado que resuelve `timm.data.resolve_model_data_config`.

El entrenamiento se realizó sobre el conjunto kather100k / NCT-CRC-HE, un dataset de parches de histología colorectal teñidos con H&E ampliamente utilizado en la literatura de patología computacional. La model card no detalla el número de épocas, la composición exacta del dataset, el esquema de aumento de datos ni si hubo ajuste fino posterior; esa información no está disponible en la documentación proporcionada. El modelo forma parte del ecosistema TIAToolbox, una librería de análisis de imágenes de tejidos publicada en *Communications Medicine* (Pocock et al., 2022).

## Capacidades

- Clasificación de parches histológicos en clases tisulares del dataset kather100k / NCT-CRC-HE.
- Extracción de características (feature extraction) como backbone convolucional, configurando `num_classes=0`.
- Procesamiento de imágenes RGB de 224×224×3 con transformaciones estándar de `timm`.
- Integración con la librería TIAToolbox para pipelines de patología digital.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni generación de texto.
- No tiene capacidades multilingües ni de visión general: está especializado en imágenes de histología.
- No dispone de modo de razonamiento (thinking mode), audio ni otras modalidades.

## Casos de uso

- Clasificación de tejido en biopsias colorectales: el modelo asigna cada parche de 224×224 a una clase tisular, lo que permite segmentar y cuantificar la composición del tejido en una muestra completa.
- Investigación oncológica: análisis de la proporción de estroma, linfocitos o músculo liso en muestras tumorales para estudios de correlación con pronóstico.
- Extracción de embeddings para búsqueda por similitud: usando `num_classes=0` se obtienen vectores de características que permiten agrupar o recuperar parches morfológicamente similares.
- Preentrenamiento o ajuste fino como backbone: el modelo sirve como inicialización para tareas de clasificación o segmentación histológica con menos datos etiquetados.
- Control de calidad de datasets de patología: detección de parches de fondo, debris o artefactos antes de alimentar otros modelos.
- Integración en pipelines de TIAToolbox: uso como clasificador dentro de flujos de análisis de imágenes de tejidos ya existentes en esa librería.
- Docencia y experimentación: referencia ligera (0,3 GB de repo) para probar flujos de clasificación histológica con `timm`.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo tiene 66,9 M de parámetros; en FP32 ocupa aproximadamente 0,27 GB de pesos, y en FP16 alrededor de 0,13 GB. Con activaciones y batch pequeño, cabe holgadamente en 2-4 GB de VRAM.
- GPU recomendadas: cualquier GPU moderna es suficiente; una RTX 3060, RTX 4090, A100 o H100 pueden ejecutarlo sin problemas, aunque para este tamaño las GPU de gama media son más que suficientes.
- Cabe en GPU de consumo: sí, en cualquier GPU consumer con al menos 4 GB de VRAM (GTX 1650, RTX 3050, RTX 4060, etc.) e incluso en CPU para inferencia por lotes pequeños.
- Opciones de despliegue: `timm` (carga directa desde el Hub), TIAToolbox, y exportación a TorchScript/ONNX para servir con ONNX Runtime o Triton. No se documentan integraciones nativas con vLLM, llama.cpp ni Ollama, que no aplican a modelos de visión de este tipo.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Entrada | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| wide_resnet50_2.tiatoolbox-kather100k | 66,9 M | 224×224×3 | Clasificación de parches histológicos | CC BY 4.0 | Hugging Face (timm) |
| Otros backbones timm (p. ej. ResNet-50) | ~25 M | 224×224×3 | Clasificación de imagen genérica | variable | Hugging Face (timm) |
| Modelos de patología tipo HistoSSL / CTransPath | no disponible en esta ficha | parches histológicos | Representación de histología | variable | Hugging Face / repositorios propios |

La comparación cuantitativa con alternativas específicas de patología no está disponible en la información proporcionada; los modelos citados se incluyen solo como referencia de categoría.

## Limitaciones y advertencias

- Modelo especializado en histología colorectal teñida con H&E; no es un modelo de propósito general ni un modelo de lenguaje.
- El rendimiento fuera del dominio de entrenamiento (otros tejidos, otras tinciones, otras resoluciones) no está documentado y puede degradarse.
- Riesgo de sesgo asociado al dataset kather100k: la distribución de clases, los centros de origen de las muestras y las condiciones de tinción pueden no representar otros entornos clínicos.
- No debe usarse como herramienta de diagnóstico clínico sin validación externa y supervisión profesional.
- La licencia CC BY 4.0 permite uso comercial con atribución, pero exige citar adecuadamente el modelo y respetar los términos de la licencia.
- No se documentan limitaciones de contexto ni de idioma porque el modelo no procesa texto.
- No se dispone de información sobre calibración, incertidumbre ni robustez frente a artefactos de imagen.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/1aurent/wide_resnet50_2.tiatoolbox-kather100k
- Repositorio TIAToolbox: https://github.com/TissueImageAnalytics/tiatoolbox
- Documentación del dataset KatherPatchDataset: https://tia-toolbox.readthedocs.io/en/latest/_autosummary/tiatoolbox.models.dataset.info.KatherPatchDataset.html
- Artículo TIAToolbox (Communications Medicine, 2022): https://www.nature.com/articles/s43856-022-00186-5
- Licencia CC BY 4.0: https://creativecommons.org/licenses/by/4.0/legalcode
- Centro TIA (Universidad de Warwick): https://warwick.ac.uk/fac/cross_fac/tia/
- Ejemplo de imagen usado en la model card: https://github.com/owkin/HistoSSLscaling/raw/main/assets/example.tif
