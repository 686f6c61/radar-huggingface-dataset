# 1aurent/resnext50_32x4d.tiatoolbox-kather100k

## Resumen

`resnext50_32x4d.tiatoolbox-kather100k` es un clasificador de imágenes de parches histológicos desarrollado por el Tissue Image Analytics (TIA) Centre de la Universidad de Warwick y publicado en Hugging Face por el usuario `1aurent`. Se trata de un ResNeXt-50 con cardinalidad 32 y ancho de 4d, adaptado del catálogo de `timm`, entrenado específicamente sobre el conjunto de parches de histología colorrectal conocido como kather100k (también denominado NCT-CRC-HE). El modelo resuelve la tarea de clasificación de tejido en nueve clases (tejido adiposo, fondo, debris, linfocitos, mucosa, músculo liso, tejido nervioso, estroma y epitelio tumoral), un problema clásico en patología computacional.

Con 23,07 millones de parámetros y una entrada de 224 x 224 x 3, es un modelo compacto y ligero (repo de 0,1 GB) pensado para integrarse en pipelines de análisis de imágenes de tejido mediante `timm` y `tiatoolbox`. Su relevancia actual radica en que sirve como extractor de características y clasificador base para tareas de patología digital, y como referencia reproducible dentro del ecosistema TIAToolbox, ampliamente citado en la literatura de imágenes médicas.

No es un modelo de lenguaje ni un modelo generativo: es un backbone convolucional de visión para clasificación y extracción de embeddings. Por tanto, no dispone de contexto textual, tool calling ni capacidades multilingües en el sentido habitual de los LLM.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | ResNeXt-50 (32x4d), red neuronal convolucional con conexiones residuales agrupadas |
| Parámetros totales | 23.066.569 (23,1 M) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión; entrada de imagen 224 x 224 x 3) |
| Tipos de cuantización | no disponible (pesos en safetensors, sin variantes GGUF/ONNX publicadas en la información) |
| Idiomas soportados | no disponible (no aplica; modelo de visión) |
| Licencia | CC BY 4.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es un ResNeXt-50 con configuración 32x4d, es decir, 50 capas convolucionales organizadas en bloques residuales con convoluciones agrupadas (cardinalidad 32, ancho de grupo 4). Es una CNN estándar de clasificación de imágenes, no un transformer ni un modelo híbrido. El modelo se carga mediante `timm.create_model` y expone tanto la cabeza de clasificación como la salida de características (`num_classes=0`) para su uso como backbone de embeddings.

El entrenamiento se realizó sobre el dataset kather100k / NCT-CRC-HE, compuesto por parches de histología colorrectal de 224 x 224 píxeles etiquetados en nueve clases de tejido. La información disponible no detalla el número de tokens de entrenamiento (no aplica), la composición exacta del dataset más allá de su nombre, ni si se emplearon técnicas de aumento de datos, ajuste fino con RLHF/DPO (no aplica en visión) o estrategias de destilación. El modelo se enmarca en el proyecto TIAToolbox, descrito en la publicación de Pocock et al. (2022) en *Communications Medicine*, que documenta la librería como un entorno integral para análisis de imágenes de tejido.

## Capacidades

- Clasificación de imágenes de parches histológicos en las nueve clases del dataset kather100k (tejido adiposo, fondo, debris, linfocitos, mucosa, músculo liso, tejido nervioso, estroma y epitelio tumoral).
- Extracción de características (feature extraction) mediante la eliminación de la cabeza de clasificación (`num_classes=0`), útil para tareas posteriores de similitud, clustering o clasificación con cabezas personalizadas.
- Procesamiento de imágenes RGB de 224 x 224 x 3 con transformaciones estandarizadas resueltas por `timm.data.resolve_model_data_config`.
- Integración con el ecosistema TIAToolbox para pipelines de patología digital.
- No soporta tool calling, function calling, agentes, razonamiento multi-step ni generación de texto.
- No dispone de capacidades multilingües ni de modo "thinking".
- No incluye visión general más allá de la clasificación de parches de tejido para la que fue entrenado.

## Casos de uso

- Clasificación de parches de tejido colorrectal en pipelines de patología digital: el modelo etiqueta directamente cada parche de 224 x 224 en una de las nueve clases de tejido, lo que permite construir mapas de tejido a nivel de imagen completa (WSI) tras teselar la muestra.
- Extracción de embeddings para búsqueda por similitud: usando `num_classes=0` se obtienen vectores de características que pueden indexarse para recuperar parches morfológicamente similares en bases de datos de histología.
- Preentrenamiento y ajuste fino en tareas downstream: el backbone puede servir como inicialización para clasificación de subtipos tumorales, detección de metástasis o segmentación, dado su bajo coste computacional (23 M de parámetros).
- Control de calidad de datasets de histología: el modelo puede detectar parches de fondo, debris o artefactos, filtrando muestras ruidosas antes del entrenamiento de modelos mayores.
- Docencia y reproducibilidad en patología computacional: al ser un modelo pequeño, con licencia CC BY 4.0 y cargable con `timm`, es adecuado para reproducir experimentos y comparar contra baselines en cursos y publicaciones.
- Integración en herramientas de anotación asistida: clasificación automática de regiones de tejido para priorizar la revisión por patólogos en visores de imágenes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja; con 23,1 M de parámetros en fp32 los pesos ocupan aproximadamente 92 MB, y en fp16 unos 46 MB. La activación para un batch de tamaño 1 a 224 x 224 es del orden de decenas de MB.
- GPU recomendadas: cualquier GPU moderna es suficiente; el modelo cabe holgadamente en tarjetas de consumo como RTX 3060, RTX 4060, RTX 4090, así como en A100 y H100 para despliegues de alto throughput.
- Cabe en GPU de consumo: sí, en cualquier GPU con al menos 1-2 GB de VRAM; también puede ejecutarse en CPU para inferencia por lotes.
- Opciones de despliegue: `timm` (carga nativa desde Hugging Face), PyTorch, exportación a ONNX o TorchScript para servir con ONNX Runtime o Triton; no se documentan variantes GGUF ni soporte directo en llama.cpp u Ollama (no aplica).
- Latencia y throughput estimados: no disponible en la información proporcionada; por el tamaño del modelo se espera un throughput alto en GPU, pero no se aportan cifras concretas.

## Comparativa con modelos similares

| Modelo | Parámetros | Entrada | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| resnext50_32x4d.tiatoolbox-kather100k | 23,1 M | 224 x 224 x 3 | Clasificación de parches histológicos (9 clases) | CC BY 4.0 | Hugging Face, vía `timm` |
| Otros modelos del catálogo TIAToolbox sobre kather100k | no disponible | no disponible | Clasificación de parches histológicos | no disponible | TIAToolbox / Hugging Face |
| Backbones genéricos de `timm` (p. ej. ResNet-50 ImageNet) | ~25 M | 224 x 224 x 3 | Clasificación de imágenes naturales | según modelo | Hugging Face, vía `timm` |

La información disponible no permite establecer comparaciones cuantitativas de rendimiento con alternativas concretas; los datos de benchmarks de modelos comparables no están publicados en el material proporcionado.

## Limitaciones y advertencias

- Modelo específico de dominio: entrenado exclusivamente sobre parches de histología colorrectal (kather100k / NCT-CRC-HE); su uso fuera de ese dominio (otras tinciones, otros órganos, imágenes naturales) no está validado y probablemente degrade.
- Riesgo de sesgo de dataset: las nueve clases y la distribución de tejidos reflejan el dataset de origen; puede infrarepresentar morfologías poco frecuentes o variaciones de tinción entre laboratorios.
- Riesgo de alucinación en sentido amplio: como clasificador, puede asignar una clase con alta confianza a parches ambiguos o artefactos; no debe usarse como diagnóstico clínico sin validación y supervisión profesional.
- Limitaciones de contexto e idioma: no aplica contexto textual; no soporta idiomas ni texto.
- Restricciones de licencia: CC BY 4.0 permite uso comercial y modificación con atribución; es necesario citar al autor y la publicación de TIAToolbox (Pocock et al., 2022) y respetar los términos de la licencia.
- Caveat para producción: no se documentan métricas de calibración, robustez a cambios de tinción ni validación externa; conviene realizar una evaluación local antes de desplegar en entornos clínicos o de investigación regulada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/1aurent/resnext50_32x4d.tiatoolbox-kather100k
- Repositorio TIAToolbox: https://github.com/TissueImageAnalytics/tiatoolbox
- Documentación del dataset KatherPatchDataset: https://tia-toolbox.readthedocs.io/en/latest/_autosummary/tiatoolbox.models.dataset.info.KatherPatchDataset.html
- Centro TIA (Universidad de Warwick): https://warwick.ac.uk/fac/cross_fac/tia/
- Publicación TIAToolbox (Communications Medicine, 2022): https://www.nature.com/articles/s43856-022-00186-5
- DOI de la publicación: https://doi.org/10.1038/s43856-022-00186-5
- Licencia CC BY 4.0: https://creativecommons.org/licenses/by/4.0/legalcode
