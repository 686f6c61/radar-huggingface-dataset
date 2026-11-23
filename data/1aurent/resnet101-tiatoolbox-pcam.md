# 1aurent/resnet101.tiatoolbox-pcam

## Resumen

`1aurent/resnet101.tiatoolbox-pcam` es un clasificador de imágenes basado en ResNet-101, adaptado del backbone incluido en TIAToolbox y puesto a punto por el Tissue Image Analytics (TIA) Centre de la Universidad de Warwick sobre parches histológicos del dataset Patch Camelyon (PCam). El modelo resuelve una tarea concreta de patología computacional: clasificar parches de tejido teñidos con hematoxilina-eosina (H&E) como tejido sano o con metástasis de cáncer de mama en ganglios linfáticos. No es un modelo generativo ni un modelo de lenguaje: es una red convolucional de visión pura, empaquetada en formato `timm` para su uso directo con `timm.create_model`.

Con 42,6 millones de parámetros y una entrada fija de 96×96×3 píxeles, el modelo está pensado para dos usos: clasificación de parches individuales y extracción de características (embeddings) como backbone congelado en pipelines de análisis de imagen de tejidos. Su licencia CC0-1.0 lo hace especialmente atractivo para uso comercial sin restricciones, algo poco habitual en modelos del ámbito biomédico.

Es relevante ahora como pieza de infraestructura para quienes construyen pipelines con TIAToolbox o con `timm`: permite cargar un clasificador de patología preentrenado con una sola línea y sin dependencias propietarias, integrándolo en flujos de trabajo de investigación en histología digital, detección de metástasis y búsqueda por similitud de parches. No obstante, conviene tener claro que se trata de un modelo de nicho, de 2023, sin benchmarks publicados en la información disponible y con un tamaño de contexto (en el sentido visual) limitado a parches de 96×96.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ResNet-101 (CNN con conexiones residuales), backbone de TIAToolbox |
| Parametros totales | 42.609.602 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica; entrada de imagen fija de 96×96×3 píxeles |
| Tipos de cuantizacion | no disponible (pesos en safetensors, sin variantes GGUF/ONNX publicadas) |
| Idiomas soportados | no disponible (modelo de visión, sin capacidades lingüísticas) |
| Licencia | CC0-1.0 (Creative Commons Zero v1.0 Universal) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es una ResNet-101 estándar, es decir, una red neuronal convolucional profunda con bloques residuales y normalización por lotes, tal y como se distribuye en el backbone de TIAToolbox. El modelo recibe tensores de imagen de 96×96 píxeles con 3 canales y produce una salida de clasificación (o un vector de características si se configura con `num_classes=0`). El número de parámetros reportado en safetensors, 42.609.602, es coherente con una ResNet-101 recortada para una resolución de entrada reducida y una cabeza de clasificación binaria o de pocas clases.

El entrenamiento se realizó sobre Patch Camelyon (PCam), un dataset de referencia en patología computacional compuesto por parches de 96×96 extraídos de imágenes histológicas H&E de ganglios linfáticos, etiquetados como positivos o negativos para metástasis de cáncer de mama. La model card no detalla el número de tokens, la composición exacta del dataset, la duración del entrenamiento ni si se aplicaron técnicas de aumento de datos o ajuste fino adicional. Tampoco se documenta el uso de RLHF/DPO (no aplicable a un clasificador de visión) ni innovaciones técnicas como decodificación especulativa o atención lineal. El modelo se distribuye a través del hub de Hugging Face con integración nativa en `timm`, lo que facilita la carga y la aplicación automática de las transformaciones de normalización y redimensionado adecuadas.

## Capacidades

- Clasificación de imágenes de parches histológicos: distingue tejido con metástasis de cáncer de mama frente a tejido sano en parches H&E de 96×96.
- Extracción de características: con `num_classes=0` actúa como backbone que devuelve un vector de embeddings por parche, útil para búsqueda por similitud, clustering o modelos posteriores.
- Integración con TIAToolbox: pensado para encajar en el ecosistema de análisis de imagen de tejidos de TIA.
- Integración con `timm`: carga mediante `timm.create_model("hf-hub:1aurent/resnet101.tiatoolbox-pcam", pretrained=True)`.
- Sin soporte de tool calling, function calling, agentes ni razonamiento multi-paso: es un modelo de visión puro.
- Sin capacidades multilingües, de generación de texto, código, matemáticas, visión general, audio o thinking mode.
- Entrada de imagen fija de 96×96: no admite resoluciones arbitrarias sin redimensionado previo.

## Casos de uso

- Detección de metástasis en ganglios linfáticos: clasificar parches H&E de 96×96 como positivos o negativos para cáncer de mama, como paso de cribado en pipelines de patología digital. Es adecuado por su entrenamiento específico en PCam y su bajo coste computacional.
- Extracción de embeddings para búsqueda por similitud: usar el modelo con `num_classes=0` para generar vectores de parches y construir índices de búsqueda que permitan recuperar parches morfológicamente similares en un archivo de diapositivas.
- Preentrenamiento para tareas downstream: servir como backbone congelado o ajustable en clasificación de subtipos tumorales, segmentación o detección de regiones de interés, aprovechando que ya ha visto tejido histológico.
- Control de calidad de datos histológicos: detectar parches con artefactos o tejido no representativo comparando embeddings con los de parches de referencia.
- Integración en TIAToolbox: incorporar el clasificador en flujos end-to-end de análisis de imagen de tejidos que ya usan la librería de TIA, sin dependencias adicionales.
- Prototipado rápido en investigación: cargar el modelo con una línea de `timm` para experimentos de clasificación binaria en histología, con licencia CC0 que permite publicar y reutilizar sin restricciones.
- Despliegue en entornos con recursos limitados: al tener 42,6 M de parámetros y entrada de 96×96, cabe en GPUs de consumo e incluso en CPU para inferencia por lotes moderados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: en FP32, aproximadamente 170 MB para los pesos (42,6 M de parámetros × 4 bytes), más activaciones y memoria de trabajo; en FP16, alrededor de 85 MB. Con lotes grandes, la memoria de activaciones domina.
- GPU recomendadas: cualquier GPU moderna sirve; para inferencia por lotes de alto throughput, A100, H100 o L4; para desarrollo y prototipado, RTX 4090, RTX 3090, RTX 3060 o incluso GPUs integradas.
- Cabe en GPU de consumo: sí, en cualquier GPU con al menos 2-4 GB de VRAM, incluidas GTX 1650, RTX 3050 y superiores.
- Opciones de despliegue: `timm` con PyTorch (vía `timm.create_model`), exportación a ONNX o TorchScript para servir con ONNX Runtime o Triton; integración en TIAToolbox. No se distribuyen pesos GGUF, por lo que llama.cpp y Ollama no son aplicables.
- Latencia y throughput estimados: no disponibles en la información proporcionada; por el tamaño del modelo y la resolución de entrada, se espera una latencia de milisegundos por parche en GPU moderna, pero no se han publicado cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto/entrada | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| 1aurent/resnet101.tiatoolbox-pcam | 42,6 M | 96×96×3 | Clasificación de parches PCam | CC0-1.0 | Hugging Face, `timm` |
| ResNet-50 (ImageNet, `timm`) | ~25,6 M | 224×224×3 | Clasificación general de imágenes | Apache-2.0 / BSD según variante | Hugging Face, `timm` |
| Otros backbones de TIAToolbox (p. ej. ResNet-50) | no disponible | 224×224×3 | Clasificación/embeddings histológicos | según variante | TIAToolbox, Hugging Face |
| Modelos de patología tipo HistoSSL / CTransPath | no disponible | variable | Embeddings histológicos autosupervisados | según modelo | Hugging Face, repositorios propios |

La comparación directa con alternativas de la misma categoría es limitada porque no se han publicado métricas de rendimiento para este modelo en la información disponible. Frente a un ResNet-50 genérico de ImageNet, la diferencia clave es el dominio: este modelo está entrenado específicamente en parches histológicos de PCam y opera a 96×96, mientras que los backbones genéricos trabajan a 224×224 y no han visto tejido H&E. Frente a modelos autosupervisados de patología (HistoSSL, CTransPath), la ventaja es la licencia CC0 y la simplicidad de integración con `timm`, aunque probablemente con menor calidad de embeddings; no obstante, no hay datos públicos que permitan cuantificar esa diferencia.

## Limitaciones y advertencias

- Sesgos conocidos: el entrenamiento se limita a PCam (ganglios linfáticos H&E, metástasis de cáncer de mama); el modelo puede generalizar mal a otros tejidos, otros tipos de tinción, otros escáneres o dominios de imagen distintos.
- Riesgo de alucinación: no aplica en el sentido generativo, pero sí existe riesgo de falsos positivos y falsos negativos en la clasificación; no debe usarse como diagnóstico clínico sin validación externa.
- Limitaciones de contexto o idioma: entrada fija de 96×96 píxeles; no procesa diapositivas completas ni parches de mayor resolución sin redimensionado, lo que puede degradar la precisión. No tiene capacidades lingüísticas.
- Restricciones de licencia para uso comercial: la licencia CC0-1.0 permite uso comercial sin restricciones, pero conviene verificar las licencias de los datos de entrenamiento (PCam) y de TIAToolbox para el despliegue completo.
- Caveats para producción: no se han publicado benchmarks ni métricas de validación en la información disponible; el modelo tiene 47 descargas y 0 likes, lo que sugiere poca validación comunitaria. Se recomienda evaluar en el dominio objetivo antes de desplegarlo y considerar el redimensionado de parches a 96×96 como paso crítico del pipeline.
- El modelo se actualizó por última vez en noviembre de 2026 según los metadatos, pero no se documentan cambios respecto a la versión inicial de noviembre de 2023.

## Enlaces

- Hugging Face: https://huggingface.co/1aurent/resnet101.tiatoolbox-pcam
- Dataset Patch Camelyon (PCam): https://github.com/basveeling/pcam/
- TIAToolbox (repositorio original): https://github.com/TissueImageAnalytics/tiatoolbox
- TIA Centre, University of Warwick: https://warwick.ac.uk/fac/cross_fac/tia/
- Paper TIAToolbox (Communications Medicine, 2022): https://www.nature.com/articles/s43856-022-00186-5
- DOI del paper: https://doi.org/10.1038/s43856-022-00186-5
- Licencia CC0-1.0: https://creativecommons.org/publicdomain/zero/1.0/legalcode
- Ejemplo de imagen histológica usado en la model card: https://github.com/owkin/HistoSSLscaling/raw/main/assets/example.tif
