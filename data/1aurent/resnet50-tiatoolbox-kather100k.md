# 1aurent/resnet50.tiatoolbox-kather100k

## Resumen

El modelo `1aurent/resnet50.tiatoolbox-kather100k` es una red neuronal convolucional ResNet50 adaptada a clasificación de imágenes de histología y extracción de características, publicada en Hugging Face por el usuario 1aurent. Los pesos provienen del proyecto TIAToolbox, desarrollado por el Tissue Image Analytics (TIA) Centre de la Universidad de Warwick, y están entrenados sobre el conjunto de parches histológicos kather100k (también conocido como NCT-CRC-HE), compuesto por imágenes de tejido de cáncer colorrectal teñidas con H&E.

El modelo resuelve dos tareas concretas: clasificación de parches de tejido en clases tisulares (tejido tumoral, estroma, músculo, mucosidad, tejido adiposo, etc.) y extracción de embeddings visuales para pipelines de análisis de imagen patológica. Con 23,6 millones de parámetros y entrada de 224x224x3, es un modelo compacto pensado para integrarse en flujos de trabajo de patología computacional, no para generación de texto ni tareas multimodales generales.

Su relevancia actual reside en que es un bloque de construcción reutilizable dentro de TIAToolbox y de frameworks de patología digital como HistoSSLscaling, con licencia CC-BY-4.0 que permite uso comercial con atribución. No es un modelo de lenguaje: no procesa texto, no tiene ventana de contexto y no soporta tool calling.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | ResNet50 (CNN, red residual con bloques bottleneck) |
| Parámetros totales | 23.579.593 (23,6 M) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, sin contexto textual) |
| Tipos de cuantización | no disponible (pesos safetensors en precisión original; cuantización no documentada por el autor) |
| Idiomas soportados | no disponible (modelo de imagen, sin capacidades lingüísticas) |
| Licencia | CC-BY-4.0 (Creative Commons Attribution 4.0 International) |
| Formato de pesos | safetensors |
| Tamaño de entrada | 224 x 224 x 3 |
| Librería | timm |
| Pipeline | image-classification (y feature-extraction con `num_classes=0`) |
| Tamaño del repositorio | 0,1 GB |
| Dataset de entrenamiento | kather100k / NCT-CRC-HE (parches de histología colorrectal H&E) |

## Arquitectura y entrenamiento

La arquitectura es una ResNet50 estándar de 50 capas con bloques residuales bottleneck, implementada a través de la librería `timm`. La entrada es un tensor de forma `(batch_size, 3, 224, 224)` y la salida, en modo clasificación, es un vector de logits por clase; en modo extracción de características (`num_classes=0`) devuelve el embedding del backbone. No hay innovaciones arquitectónicas propias: el valor del modelo está en el entrenamiento específico sobre parches histológicos.

El entrenamiento lo realizó el Tissue Image Analytics Centre sobre el dataset kather100k (NCT-CRC-HE), un conjunto de parches de tejido colorrectal teñido con hematoxilina y eosina. La model card no detalla el número de tokens, la composición exacta del dataset, la estrategia de aumento de datos ni si se aplicaron técnicas de ajuste fino adicionales (RLHF, DPO u otras no aplican a un modelo de visión). Tampoco se documentan hiperparámetros, épocas ni métricas de validación durante el entrenamiento.

## Capacidades

- Clasificación de parches histológicos en clases tisulares del dataset kather100k/NCT-CRC-HE (tejido tumoral, estroma, músculo liso, mucosidad, tejido adiposo, debris, fondo, etc.).
- Extracción de embeddings visuales de 2048 dimensiones (salida del backbone con `num_classes=0`) para tareas downstream como recuperación por similitud, clustering o entrenamiento de clasificadores lineales.
- Procesamiento de imágenes RGB de 224x224 con transformaciones estándar de timm (resize, normalización).
- Integración nativa con `timm.create_model` mediante `hf-hub:1aurent/resnet50.tiatoolbox-kather100k`.
- Uso como backbone en pipelines de patología computacional (por ejemplo, dentro de TIAToolbox o HistoSSLscaling).
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, texto, audio ni visión general fuera del dominio histológico.

## Casos de uso

- Clasificación automática de parches tisulares en estudios de cáncer colorrectal: el modelo asigna cada parche de 224x224 a una clase tisular, lo que permite segmentar y cuantificar la composición del tejido en secciones completas (WSI) troceadas en parches.
- Extracción de características para búsqueda por similitud: usando `num_classes=0` se obtienen embeddings que alimentan índices vectoriales para recuperar parches visualmente similares en bases de datos de histología.
- Entrenamiento de clasificadores ligeros downstream: los embeddings congelados del modelo sirven como entrada a regresores logísticos o MLP para tareas específicas con pocos datos etiquetados.
- Preprocesado en pipelines de investigación en patología digital: integrado en TIAToolbox como extractor de características dentro de flujos de análisis de imagen de tejido.
- Control de calidad de muestras: detección de parches de fondo, debris o artefactos frente a tejido válido, útil para filtrar regiones antes de análisis más costosos.
- Docencia y prototipado en patología computacional: modelo pequeño (0,1 GB) y de carga rápida que permite reproducir experimentos de clasificación tisular sin infraestructura GPU dedicada.
- Baseline en comparativas de modelos histológicos: al ser un ResNet50 entrenado en kather100k, sirve como referencia frente a modelos auto-supervisados o foundation models de patología.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en FP32 para un batch pequeño; el modelo ocupa unos 0,1 GB en disco y 23,6 M de parámetros, por lo que cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM (GTX 1050 Ti, RTX 2060, RTX 3060, RTX 4090, A100, H100). Para lotes grandes o procesamiento de WSI completas conviene una GPU con más memoria, pero el modelo en sí no la exige.
- Cabe en GPU consumer: sí, en cualquier GPU moderna con 2 GB o más de VRAM; también puede ejecutarse en CPU para inferencia por lotes pequeños.
- Opciones de despliegue: `timm` (vía `timm.create_model`), PyTorch nativo, exportación a ONNX o TorchScript para servir con ONNX Runtime o Triton; no hay soporte documentado para llama.cpp, Ollama o vLLM (no aplican a un modelo de visión).
- Latencia y throughput estimados: no disponibles en la información proporcionada; al ser un ResNet50 de 23,6 M de parámetros, la latencia por parche en GPU moderna es del orden de milisegundos, pero no se aportan cifras oficiales.

## Comparativa con modelos similares

| Modelo | Parámetros | Entrada | Dominio | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| 1aurent/resnet50.tiatoolbox-kather100k | 23,6 M | 224x224x3 | Histología colorrectal (kather100k) | CC-BY-4.0 | Hugging Face (timm) |
| ResNet50 ImageNet (torchvision/timm) | 25,6 M | 224x224x3 | Imagen natural (ImageNet) | BSD-3 / Apache-2.0 según distribución | Amplia |
| Modelos auto-supervisados de patología (p. ej. HistoSSL, CTransPath) | no disponible en la información | variable | Histología general | variable | Hugging Face / repos propios |

La comparación cuantitativa de rendimiento con alternativas no está disponible en la información proporcionada; no se han publicado métricas de este modelo frente a otros en la documentación consultada.

## Limitaciones y advertencias

- Dominio muy restringido: entrenado exclusivamente en parches de histología colorrectal H&E de kather100k; su rendimiento fuera de ese dominio (otros órganos, otras tinciones, imágenes naturales) no está garantizado y probablemente sea pobre.
- Sin métricas publicadas: la model card no reporta accuracy, F1 ni matrices de confusión, por lo que no se puede evaluar su calidad objetiva a partir de la información disponible.
- Riesgo de sesgo: el dataset kather100k procede de un número limitado de fuentes y centros; el modelo puede no generalizar a cohortes con diferencias de tinción, escáner o población.
- No es un modelo de lenguaje: no procesa texto, no tiene contexto, no soporta tool calling ni agentes; cualquier uso en esos escenarios es inadecuado.
- Licencia CC-BY-4.0: permite uso comercial pero exige atribución al autor y al TIA Centre; debe revisarse el cumplimiento en productos derivados.
- Caveat para producción: al ser un modelo de investigación con una sola descarga relevante y sin validación clínica documentada, no debe usarse para diagnóstico médico sin validación independiente y aprobación regulatoria.
- Sin información sobre cuantización ni despliegue optimizado: no hay guías oficiales para INT8, ONNX ni serving a escala.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/1aurent/resnet50.tiatoolbox-kather100k
- Repositorio TIAToolbox: https://github.com/TissueImageAnalytics/tiatoolbox
- Documentación del dataset KatherPatchDataset: https://tia-toolbox.readthedocs.io/en/latest/_autosummary/tiatoolbox.models.dataset.info.KatherPatchDataset.html
- Paper TIAToolbox (Communications Medicine, 2022): https://www.nature.com/articles/s43856-022-00186-5
- DOI del paper: https://doi.org/10.1038/s43856-022-00186-5
- Licencia CC-BY-4.0: https://creativecommons.org/licenses/by/4.0/legalcode
- Centro TIA (Universidad de Warwick): https://warwick.ac.uk/fac/cross_fac/tia/
- Repositorio HistoSSLscaling (ejemplo de uso): https://github.com/owkin/HistoSSLscaling
- Dataset NCT-CRC-HE en Hugging Face: https://huggingface.co/datasets/1aurent/NCT-CRC-HE
