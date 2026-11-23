# 1aurent/resnext101_32x8d.tiatoolbox-pcam

## Resumen

El modelo `resnext101_32x8d.tiatoolbox-pcam` es un clasificador de imágenes de arquitectura ResNeXt-D, publicado en Hugging Face por el usuario 1aurent y entrenado originalmente por el Tissue Image Analytics (TIA) Centre de la Universidad de Warwick. Está especializado en la clasificación de parches histológicos del dataset PatchCamelyon (PCam), orientado a la detección de metástasis en tejido linfático. No es un modelo de lenguaje: es un backbone convolucional de visión pensado para tareas de patología computacional.

El modelo cuenta con 86,9 millones de parámetros, trabaja sobre entradas de 96 x 96 píxeles con 3 canales y se distribuye en formato safetensors a través de la librería `timm`. Puede usarse tanto como clasificador de imagen (`image-classification`) como extractor de características (`feature-extraction`) gracias a la opción `num_classes=0`, lo que lo hace útil como encoder dentro de pipelines de análisis de imagen médica.

Su relevancia actual radica en su integración con TIAToolbox, una librería de referencia para análisis de imágenes de tejidos, y en su licencia CC0-1.0, que permite uso comercial sin restricciones. Es un componente práctico para investigación en histología digital y para construir sistemas de apoyo al diagnóstico oncológico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ResNeXt-D (CNN, variante ResNeXt-101 32x8d) |
| Parametros totales | 86.949.314 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión; entrada de 96 x 96 x 3 píxeles) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (modelo de imagen) |
| Licencia | CC0-1.0 (Creative Commons Zero v1.0 Universal) |
| Formato de pesos | safetensors |
| Libreria | timm |
| Tamano del repo | 0,3 GB |
| Dataset de entrenamiento | PatchCamelyon (PCam) |
| Pipeline | image-classification |
| Descargas | 32 |
| Likes | 0 |

## Arquitectura y entrenamiento

Se trata de una red neuronal convolucional ResNeXt-D, concretamente la variante `resnext101_32x8d` de la familia ResNeXt, que emplea bloques residuales con convoluciones agrupadas (cardinalidad 32, ancho 8d). El modelo opera sobre parches de imagen de 96 x 96 píxeles con 3 canales, un tamaño típico en el análisis de parches histológicos. No es un transformer ni un modelo secuencial; no dispone de mecanismo de atención ni de contexto textual.

El entrenamiento se realizó sobre el dataset PatchCamelyon (PCam), compuesto por parches histológicos etiquetados para la detección de metástasis en ganglios linfáticos. La model card no especifica el número de tokens, la composición detallada del dataset, ni si se aplicaron técnicas de RLHF, DPO o aumentación de datos. El modelo se distribuye a través de `timm` y se integra en la librería TIAToolbox para análisis de imágenes de tejidos.

## Capacidades

- Clasificación de imágenes histológicas: identifica la presencia o ausencia de metástasis en parches de tejido linfático.
- Extracción de características (feature extraction): con `num_classes=0` actúa como backbone para generar embeddings de imagen.
- Integración con `timm`: carga directa mediante `timm.create_model` con el identificador `hf-hub:1aurent/resnext101_32x8d.tiatoolbox-pcam`.
- Transformaciones de preprocesado específicas del modelo: normalización y redimensionado resueltos mediante `timm.data.resolve_model_data_config`.
- Uso como componente en pipelines de TIAToolbox para análisis de imágenes de tejidos.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingües (no es un modelo de lenguaje).
- No dispone de modo thinking, visión general, audio ni otras capacidades multimodales más allá de la clasificación de imagen.

## Casos de uso

- Detección de metástasis en ganglios linfáticos: el modelo clasifica parches de 96 x 96 píxeles procedentes de imágenes de tejido teñido, sirviendo como primer filtro en un pipeline de cribado oncológico.
- Extracción de embeddings para búsqueda de similitud: usando `num_classes=0` se generan vectores de características que permiten agrupar o recuperar parches histológicos similares en bases de datos de imágenes patológicas.
- Preentrenamiento y ajuste fino en tareas de patología computacional: el backbone puede servir como inicialización para clasificadores específicos de subtipos tumorales o de tejidos.
- Integración en TIAToolbox: el modelo se incorpora como componente de clasificación dentro de flujos de análisis de imágenes de tejidos ya existentes en la librería.
- Control de calidad en digitalización de portaobjetos: la clasificación de parches permite detectar regiones relevantes o descartar artefactos antes del análisis principal.
- Investigación reproducible en histología digital: al tener licencia CC0-1.0 y pesos en safetensors, puede distribuirse y reproducirse en entornos académicos y comerciales sin restricciones.
- Docencia y experimentación con modelos de visión médica: su tamaño moderado (0,3 GB) y su integración con `timm` facilitan su uso en entornos con recursos limitados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 86,9 millones de parámetros en precisión FP32 el modelo ocupa aproximadamente 0,35 GB de pesos, por lo que la VRAM necesaria es modesta y depende del tamaño de lote.
- GPU recomendadas: no especificadas en la informacion disponible. Por tamaño, cabe en GPUs de consumo como RTX 3060, RTX 4060 o superiores, así como en A100, H100 y T4.
- Cabe en GPU de consumo: sí, por el reducido número de parámetros (86,9 M) y el tamaño del repo (0,3 GB).
- Opciones de despliegue: `timm` (carga directa desde Hugging Face), integración con TIAToolbox. No se documentan opciones para vLLM, llama.cpp, Ollama o TGI (no aplicables a un modelo de visión de este tipo).
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Entrada | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| 1aurent/resnext101_32x8d.tiatoolbox-pcam | 86,9 M | 96 x 96 x 3 | Clasificación de parches PCam | CC0-1.0 | Hugging Face (timm) |
| Otros backbones de timm (p. ej. resnet50) | no disponible en la informacion | no disponible | Clasificación de imagen general | variable | Hugging Face (timm) |
| Modelos de patología comparables | no disponible en la informacion | no disponible | Clasificación histológica | no disponible | no disponible |

No se dispone de datos de rendimiento comparativo con alternativas en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo especializado exclusivamente en parches histológicos de PCam; no es un modelo de propósito general ni un modelo de lenguaje.
- Entrada fija de 96 x 96 x 3 píxeles; no admite imágenes de mayor resolución sin redimensionado previo.
- No se documentan sesgos concretos, pero al entrenarse sobre un dataset específico (PCam) puede no generalizar a otros tejidos, tinciones o dominios clínicos.
- Riesgo de alucinación no aplica en el sentido de texto, pero sí existe riesgo de falsos positivos y falsos negativos en la clasificación, con implicaciones clínicas.
- No debe usarse como herramienta de diagnóstico autónomo sin validación clínica adicional.
- Licencia CC0-1.0: permite uso comercial y modificación sin restricciones de atribución, si bien se recomienda citar el trabajo original.
- La model card no especifica el proceso de entrenamiento (épocas, aumentación, métricas de validación), lo que limita la reproducibilidad.
- El número de descargas (32) y likes (0) es bajo, lo que sugiere poca validación por parte de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/1aurent/resnext101_32x8d.tiatoolbox-pcam
- Dataset PatchCamelyon (PCam): https://github.com/basveeling/pcam/
- TIAToolbox (repositorio original): https://github.com/TissueImageAnalytics/tiatoolbox
- TIA Centre, University of Warwick: https://warwick.ac.uk/fac/cross_fac/tia/
- Paper TIAToolbox (Communications Medicine, 2022): https://www.nature.com/articles/s43856-022-00186-5
- DOI del paper: https://doi.org/10.1038/s43856-022-00186-5
- Imagen de ejemplo (HistoSSLscaling): https://github.com/owkin/HistoSSLscaling/raw/main/assets/example.tif
- Licencia CC0-1.0: https://creativecommons.org/publicdomain/zero/1.0/legalcode
