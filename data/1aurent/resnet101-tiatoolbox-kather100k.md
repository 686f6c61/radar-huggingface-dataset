# 1aurent/resnet101.tiatoolbox-kather100k

## Resumen
El modelo `1aurent/resnet101.tiatoolbox-kather100k` es un clasificador de imágenes de patología computacional basado en la arquitectura ResNet101, desarrollado por el Tissue Image Analytics (TIA) Centre de la Universidad de Warwick y distribuido en Hugging Face por el usuario 1aurent. Resuelve la tarea de clasificación de parches histológicos en nueve clases de tejido (tejido adiposo, fondo, debris, linfocitos, mucosa, músculo liso, tejido normal de colon, estroma y células tumorales epiteliales), un paso fundamental en pipelines de análisis de imágenes de cáncer colorrectal.

El modelo emplea una CNN ResNet101 estándar con 42,6 millones de parámetros y entradas de 224x224x3 píxeles. Se entrenó sobre el conjunto de datos kather100k (también conocido como NCT-CRC-HE), un benchmark clásico en histología computacional. Su relevancia radica en que sirve como extractor de características y clasificador listo para usar dentro del ecosistema TIAToolbox, una librería de referencia para análisis de imágenes de tejidos.

Al estar integrado en `timm` y disponible en formato safetensors, es directamente cargable mediante `timm.create_model` con `hf-hub`, lo que facilita su uso tanto para inferencia de clasificación como para extracción de embeddings de parches histológicos en tareas downstream.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ResNet101 (CNN con conexiones residuales) |
| Parametros totales | 42.623.945 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, entrada 224x224x3) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; cuantización no documentada) |
| Idiomas soportados | no aplica (modelo de imagen) |
| Licencia | CC BY 4.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento
La arquitectura es una ResNet101 clásica, una red neuronal convolucional con bloques residuales y 101 capas, adaptada a clasificación de imágenes de 224x224 píxeles con tres canales. El modelo se entrenó sobre el dataset kather100k (NCT-CRC-HE), compuesto por parches de imágenes histológicas de cáncer colorrectal humano teñidas con H&E, con nueve clases de tejido. El entrenamiento fue realizado por el Tissue Image Analytics Centre y el modelo se distribuye como parte del ecosistema TIAToolbox.

No se dispone en la información proporcionada de detalles sobre el número exacto de tokens de entrenamiento, composición precisa del dataset, ni si se aplicaron técnicas de RLHF/DPO (no aplicables en un modelo de clasificación de imágenes). Tampoco se documentan innovaciones técnicas específicas más allá de la arquitectura ResNet101 estándar y su integración con `timm` para transformaciones y carga desde el hub.

## Capacidades
- Clasificación de imágenes histológicas en 9 clases de tejido (adiposo, fondo, debris, linfocitos, mucosa, músculo liso, colon normal, estroma, tumor epitelial).
- Extracción de características (feature backbone) configurando `num_classes=0` para obtener embeddings de parches.
- Integración nativa con `timm` para carga, transformaciones y preprocesado automático.
- Uso como componente en pipelines de TIAToolbox para análisis de imágenes de tejidos completos.
- Inferencia sobre parches individuales de 224x224x3; no soporta texto, tool calling, agentes ni razonamiento multi-paso.
- No dispone de capacidades multilingües, de visión general, audio ni modo "thinking".

## Casos de uso
- Clasificación de parches histológicos en investigación oncológica: el modelo asigna cada parche de 224x224 a una de las nueve clases de tejido, lo que permite cuantificar la composición tisular de una muestra de cáncer colorrectal.
- Extracción de embeddings para modelos downstream: usando `num_classes=0` se obtienen vectores de características que pueden alimentar clasificadores, clustering o modelos de supervivencia en estudios de patología computacional.
- Preprocesado en pipelines de TIAToolbox: integrado en flujos de segmentación y análisis de imágenes de tejido completo (WSI), el modelo actúa como clasificador de parches para filtrar regiones de interés.
- Detección de regiones tumorales: la clase "tumor epitelial" permite localizar áreas malignas dentro de una muestra, útil en herramientas de apoyo al diagnóstico en investigación.
- Control de calidad de datasets histológicos: clasificar parches en clases como "fondo" o "debris" ayuda a limpiar y curar conjuntos de datos antes de entrenar otros modelos.
- Benchmarking de modelos de patología: al estar entrenado sobre kather100k, sirve como línea base reproducible para comparar nuevos modelos de clasificación de tejidos.
- Docencia y experimentación: su tamaño moderado (42,6 M de parámetros) y licencia CC BY 4.0 lo hacen adecuado para prácticas y prototipos en cursos de patología computacional.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware
- VRAM estimada para inferencia: en FP32, aproximadamente 0,17 GB para los pesos (42,6 M de parámetros x 4 bytes), más memoria para activaciones; en la práctica, menos de 1 GB para lotes pequeños.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; funciona en RTX 3060, RTX 4090, A100, H100, etc.
- Cabe en GPU de consumo: sí, en cualquier GPU moderna con 2 GB o más de VRAM, e incluso en CPU para inferencia por lotes pequeños.
- Opciones de despliegue: `timm` (carga directa desde el hub), PyTorch, exportación a ONNX/TorchScript no documentada pero viable; no se mencionan integraciones con vLLM, llama.cpp, Ollama o TGI (no aplicables a CNN de visión).
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto/Entrada | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| 1aurent/resnet101.tiatoolbox-kather100k | 42,6 M | 224x224x3 | Clasificación de parches histológicos (9 clases) | CC BY 4.0 | Hugging Face, timm |
| ResNet50 (ImageNet) | ~25,6 M | 224x224x3 | Clasificación general de imágenes | BSD-3 / Apache-2.0 (según implementación) | Amplia (timm, torchvision) |
| Modelos HistoSSL / patología (p. ej., owkin) | variable | variable | Embeddings de histología | variable | Hugging Face |
| Otros modelos TIAToolbox | variable | variable | Clasificación/segmentación histológica | CC BY 4.0 (según modelo) | Hugging Face, TIAToolbox |

No se dispone de datos de rendimiento comparativo en la información proporcionada para establecer diferencias cuantitativas con alternativas.

## Limitaciones y advertencias
- Sesgos conocidos: el modelo se entrenó exclusivamente sobre parches de cáncer colorrectal teñidos con H&E; su rendimiento puede degradarse en otros tejidos, tinciones o dominios (por ejemplo, imágenes de otro centro o escáner).
- Riesgo de alucinación: no aplica en el sentido generativo, pero sí existe riesgo de clasificaciones erróneas en parches ambiguos o de baja calidad.
- Limitaciones de contexto o idioma: no procesa texto ni tiene capacidades multilingües; la entrada está restringida a imágenes de 224x224x3.
- Restricciones de licencia: CC BY 4.0 permite uso comercial con atribución; es obligatorio citar la fuente y el artículo de TIAToolbox según la model card.
- Caveats para producción: no es un dispositivo médico; no debe usarse para diagnóstico clínico sin validación regulatoria. Requiere preprocesado específico (transformaciones de `timm`) y no se documentan cuantizaciones ni optimizaciones de despliegue.

## Enlaces
- Hugging Face: https://huggingface.co/1aurent/resnet101.tiatoolbox-kather100k
- Repositorio TIAToolbox: https://github.com/TissueImageAnalytics/tiatoolbox
- Documentación del dataset KatherPatchDataset: https://tia-toolbox.readthedocs.io/en/latest/_autosummary/tiatoolbox.models.dataset.info.KatherPatchDataset.html#tiatoolbox.models.dataset.info.KatherPatchDataset
- Artículo TIAToolbox (Communications Medicine, 2022): https://www.nature.com/articles/s43856-022-00186-5
- Licencia CC BY 4.0: https://creativecommons.org/licenses/by/4.0/legalcode
- Centro TIA (Universidad de Warwick): https://warwick.ac.uk/fac/cross_fac/tia/
- Ejemplo de imagen histológica (Owkin HistoSSLscaling): https://github.com/owkin/HistoSSLscaling/raw/main/assets/example.tif
