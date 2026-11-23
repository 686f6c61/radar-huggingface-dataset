# 1aurent/wide_resnet101_2.tiatoolbox-kather100k

## Resumen

`wide_resnet101_2.tiatoolbox-kather100k` es un modelo de clasificación de imágenes de tejidos histológicos desarrollado por el Tissue Image Analytics (TIA) Centre de la Universidad de Warwick. Se trata de una Wide-ResNet-B (variante `wide_resnet101_2` del catálogo de `timm`) con 125 millones de parámetros, entrenada sobre el conjunto de parches histológicos "kather100k" (también conocido como NCT-CRC-HE), que agrupa imágenes de tejido de cáncer colorrectal humano teñidas con H&E.

El modelo resuelve una tarea concreta de patología computacional: clasificar parches de imagen de 224×224 píxeles en clases de tejido (tejido tumoral, estroma, músculo, mucosa, debris, adiposo, etc.), y también puede emplearse como extractor de características (backbone) para pipelines de análisis de imágenes de tejido. Es relevante para investigadores que trabajan en clasificación de tejido oncológico, segmentación de regiones tumorales y generación de embeddings histológicos, y se integra de forma nativa con la librería TIAToolbox del propio centro.

A diferencia de los modelos de lenguaje, este es un modelo puramente de visión (CNN), sin capacidades de texto, tool calling ni razonamiento multi-paso. Su utilidad está acotada al dominio histopatológico y su licencia CC-BY 4.0 permite uso comercial con atribución.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Wide-ResNet-B (wide_resnet101_2, CNN) |
| Parametros totales | 124.993.993 (125,0 M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo de visión; entrada de imagen 224×224×3) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; cuantización posible vía herramientas externas) |
| Idiomas soportados | no disponible (no procesa texto) |
| Licencia | CC-BY 4.0 |
| Formato de pesos | safetensors (repo de 0,5 GB) |

## Arquitectura y entrenamiento

La arquitectura es una Wide-ResNet-B de 101 capas con factor de ensanchamiento (`wide_resnet101_2`), una red convolucional residual con conexiones de atajo y mayor número de canales por capa que una ResNet estándar. La entrada es una imagen RGB de 224×224×3 y la salida, en modo clasificación, es un vector de logits por clase; en modo `num_classes=0` actúa como extractor de características y devuelve un vector de embeddings.

El entrenamiento se realizó sobre el conjunto kather100k (NCT-CRC-HE), formado por parches de imágenes histológicas de cáncer colorrectal teñidas con hematoxilina-eosina (H&E). No se dispone en la información proporcionada de detalles sobre el número exacto de tokens/pasos, composición completa del dataset, ni sobre si se aplicaron técnicas de aumento de datos o ajuste fino posteriores. El modelo está publicado en el Hub con la integración de `timm` (`hf-hub:1aurent/wide_resnet101_2.tiatoolbox-kather100k`) y se cita en el artículo de TIAToolbox (Pocock et al., *Communications Medicine*, 2022).

## Capacidades

- Clasificación de imágenes de parches histológicos en clases de tejido (tumoral, estroma, músculo, mucosa, debris, adiposo, etc.).
- Extracción de embeddings/features de imágenes de tejido mediante `num_classes=0`.
- Actúa como backbone para tareas posteriores (detección, segmentación, recuperación por similitud).
- Integración con TIAToolbox para pipelines de análisis de imágenes de tejido.
- No soporta tool calling, agentes, razonamiento multi-paso ni generación de texto.
- No tiene capacidades multilingües ni de audio.
- No dispone de modo "thinking" ni razonamiento simbólico.

## Casos de uso

- **Clasificación de tejido tumoral en investigación oncológica:** el modelo asigna cada parche de 224×224 a una clase de tejido, lo que permite cuantificar la proporción de tejido tumoral frente a estroma o músculo en una muestra de cáncer colorrectal, un paso habitual en estudios de pronóstico y análisis de heterogeneidad tumoral.
- **Generación de embeddings para búsqueda por similitud:** usando `num_classes=0`, el modelo produce vectores de características que pueden indexarse para recuperar parches visualmente similares en bases de datos de histología, útil en anotación asistida y control de calidad de datasets.
- **Preprocesado en pipelines de patología computacional:** integrado en TIAToolbox, sirve como etapa de clasificación de parches previa a la segmentación de regiones de interés o a la detección de mitosis, reduciendo el espacio de búsqueda a las regiones relevantes.
- **Análisis de imágenes de tejido en investigación traslacional:** permite caracterizar la composición del microambiente tumoral (proporción de estroma, infiltrado, necrosis) en cohortes de imágenes H&E, un análisis reproducible con licencia CC-BY 4.0.
- **Control de calidad de datasets histológicos:** el modelo puede detectar parches de "debris" o artefactos (como se muestra en el ejemplo del widget con la clase `debris`), ayudando a filtrar automáticamente imágenes no válidas antes de entrenar otros modelos.
- **Extracción de características para modelos aguas abajo:** los embeddings pueden alimentar clasificadores ligeros (regresión logística, SVM) para tareas específicas con pocos datos etiquetados, aprovechando el preentrenamiento en dominio histológico.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- **VRAM estimada para inferencia:** al tratarse de una CNN de 125 M de parámetros, los pesos en FP32 ocupan aproximadamente 0,5 GB; en FP16 unos 0,25 GB. La inferencia por lotes pequeños requiere típicamente entre 1 y 2 GB de VRAM, dependiendo del tamaño de batch y de la resolución de entrada.
- **GPU recomendadas:** cualquier GPU con al menos 4 GB de VRAM es suficiente para inferencia; para entrenamiento o lotes grandes se recomiendan A100, H100, RTX 4090 o RTX 3090.
- **Consumer GPU:** sí cabe en GPUs de consumo como RTX 3060, RTX 4060, RTX 4090, e incluso en CPU para inferencia puntual.
- **Opciones de despliegue:** `timm` (carga directa desde el Hub), TIAToolbox, exportación a ONNX/TorchScript, y despliegue con servidores de inferencia genéricos (TorchServe, Triton). No se documenta soporte nativo en vLLM, llama.cpp u Ollama, al no ser un modelo de lenguaje.
- **Latencia y throughput:** no disponible en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Entrada | Dominio | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| wide_resnet101_2.tiatoolbox-kather100k | 125,0 M | 224×224×3 | Histología (kather100k) | CC-BY 4.0 | Hugging Face Hub |
| resnet50.tiatoolbox-kather100k (mismo autor) | no disponible en la información | 224×224×3 | Histología (kather100k) | CC-BY 4.0 | Hugging Face Hub |
| Modelos genéricos de `timm` (p. ej. `wide_resnet101_2` ImageNet) | 126,9 M aprox. | 224×224×3 | Imagen natural (ImageNet) | según variante | Hugging Face Hub / timm |

La comparación con alternativas específicas de histología (como variantes de ResNet o ViT preentrenadas en dominio histológico) no está disponible en la información proporcionada.

## Limitaciones y advertencias

- **Sesgos de dominio:** entrenado exclusivamente en parches de cáncer colorrectal teñidos con H&E; su rendimiento puede degradarse en otros tejidos, tinciones (IHC, etc.) o escáneres distintos.
- **Riesgo de alucinación:** no aplica en el sentido de generación de texto, pero sí existe riesgo de clasificaciones erróneas en parches ambiguos o de baja calidad, con posibles consecuencias si se usa en contextos clínicos sin validación.
- **Limitaciones de contexto:** la entrada está fija a 224×224 píxeles; no procesa imágenes de mayor resolución sin dividirlas en parches.
- **Restricciones de licencia:** CC-BY 4.0 permite uso comercial con atribución; es necesario citar al autor y la licencia.
- **Caveat de producción:** no es un dispositivo médico; no debe usarse para diagnóstico clínico sin validación regulatoria y supervisión profesional.
- **Idioma:** no procesa texto, por lo que no hay soporte multilingüe.

## Enlaces

- Hugging Face: https://huggingface.co/1aurent/wide_resnet101_2.tiatoolbox-kather100k
- Repositorio TIAToolbox: https://github.com/TissueImageAnalytics/tiatoolbox
- Documentación del dataset KatherPatchDataset: https://tia-toolbox.readthedocs.io/en/latest/_autosummary/tiatoolbox.models.dataset.info.KatherPatchDataset.html
- Artículo TIAToolbox (Pocock et al., 2022): https://www.nature.com/articles/s43856-022-00186-5
- Licencia CC-BY 4.0: https://creativecommons.org/licenses/by/4.0/legalcode
- Centro TIA (Universidad de Warwick): https://warwick.ac.uk/fac/cross_fac/tia/
