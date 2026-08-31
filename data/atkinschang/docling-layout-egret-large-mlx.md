# atkinschang/docling-layout-egret-large-mlx

## Resumen

El modelo `atkinschang/docling-layout-egret-large-mlx` es una conversión a formato MLX de los pesos del modelo `docling-layout-egret-large`, desarrollado originalmente por el proyecto Docling (impulsado por IBM). Este modelo está especializado en análisis de layout de documentos, es decir, la tarea de identificar y clasificar los distintos elementos estructurales de una página (bloques de texto, tablas, figuras, títulos, etc.) a partir de imágenes. La conversión a MLX permite ejecutar el modelo de forma eficiente en hardware Apple Silicon (chips M1, M2, M3 y superiores) utilizando la librería MLX, sin necesidad de depender de CUDA o GPUs de NVIDIA.

El modelo tiene aproximadamente 31,2 millones de parámetros, un tamaño relativamente compacto que lo hace adecuado para despliegues en entornos con recursos limitados. La licencia Apache 2.0 permite uso comercial y modificación sin restricciones significativas. Su relevancia actual radica en la creciente demanda de pipelines de procesamiento de documentos que puedan ejecutarse localmente en hardware de consumo, y esta conversión MLX facilita precisamente ese escenario en ecosistemas Apple.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | 31.230.727 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura interna del modelo original `docling-layout-egret-large` en los datos proporcionados. Se sabe que pertenece a la familia de modelos de análisis de layout de Docling, que suelen basarse en arquitecturas transformer de visión (como DETR o similares), pero no se puede confirmar sin documentación adicional. El proceso de entrenamiento tampoco está documentado en la información disponible; el modelo original fue entrenado por el equipo de Docling, pero no se especifican los datos ni el método (RLHF, DPO, etc.). La conversión a MLX es un proceso puramente técnico que transforma los pesos a un formato optimizado para Apple Silicon, sin modificar el comportamiento del modelo.

## Capacidades

- Analisis de layout de documentos: identifica y clasifica regiones de texto, tablas, figuras, títulos, listas y otros elementos estructurales en imágenes de páginas.
- Integración con el pipeline de Docling: puede usarse como componente en el flujo de procesamiento de documentos de Docling, que incluye OCR, reconocimiento de estructura de tablas y extracción de contenido.
- Ejecución en Apple Silicon: gracias a la conversión MLX, el modelo puede ejecutarse en Macs con chips M1/M2/M3/M4 sin necesidad de GPU externa.
- Formato de pesos safetensors: compatible con la librería MLX y con herramientas estándar de Hugging Face.
- No se han documentado capacidades adicionales como tool calling, generación de texto o razonamiento multimodal; el modelo está especializado exclusivamente en análisis de layout.

## Casos de uso

- Digitalización de documentos empresariales: el modelo puede procesar escaneos de facturas, contratos o informes para extraer la estructura de la página y facilitar su conversión a formatos editables (PDF a texto estructurado).
- Extracción de tablas en documentos científicos: al identificar regiones de tabla, el modelo permite aislar y procesar tablas para su posterior conversión a CSV o Excel, útil en investigación y análisis de datos.
- Automatización de archivos históricos: en bibliotecas o archivos digitales, el modelo ayuda a clasificar y etiquetar documentos antiguos escaneados, mejorando la búsqueda y recuperación de información.
- Preprocesamiento para OCR: al delimitar las regiones de texto, el modelo reduce el área de trabajo de los motores OCR, mejorando la precisión y reduciendo el coste computacional.
- Análisis de documentos legales: en despachos de abogados, el modelo puede identificar cláusulas, párrafos y secciones en contratos, facilitando la revisión automatizada.
- Integración en aplicaciones de gestión documental: empresas que desarrollan software de gestión de documentos pueden incorporar el modelo como servicio local en Macs para clasificar y organizar documentos sin depender de la nube.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se dispone de datos comparativos de rendimiento (mAP, IoU, etc.) para este modelo ni para su versión original.

## Requisitos de hardware

- Al ser un modelo de aproximadamente 31M parámetros, su huella de memoria es reducida: en FP32 ocuparía unos 125 MB, y en cuantización de 8 bits unos 32 MB.
- Diseñado para Apple Silicon: requiere un Mac con chip M1 o superior y al menos 8 GB de memoria unificada para ejecutarse cómodamente.
- No requiere GPU NVIDIA ni CUDA; la librería MLX aprovecha la GPU integrada y la memoria unificada de los chips Apple.
- Opciones de despliegue: puede usarse con la librería MLX directamente, o integrarse en pipelines de Docling que soporten este formato. No se menciona compatibilidad con vLLM, llama.cpp u Ollama, ya que son herramientas orientadas a modelos de lenguaje, no a modelos de visión.
- La latencia y el throughput dependen del hardware concreto; en un MacBook Pro con chip M2, se espera un procesamiento de páginas en tiempo real o casi real, pero no se dispone de cifras exactas.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la misma categoría (análisis de layout) con los que se pueda establecer una comparación directa. El modelo original `docling-layout-egret-large` forma parte de una familia de modelos de Docling, pero no se han proporcionado datos de otros modelos como `docling-layout-egret-base` o alternativas de otros proyectos (LayoutLM, etc.). Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- Al ser una conversión de pesos, el modelo hereda las limitaciones del modelo original, que no están documentadas en la información proporcionada.
- No se especifican los idiomas soportados; es probable que el modelo funcione mejor con documentos en inglés u otros idiomas con alfabeto latino, pero no hay confirmación.
- El modelo está especializado en análisis de layout, no en comprensión semántica del texto; no debe usarse para tareas de generación de lenguaje o razonamiento.
- La licencia Apache 2.0 permite uso comercial, pero se recomienda revisar los términos del modelo original por si hubiera restricciones adicionales.
- No se han publicado métricas de rendimiento ni evaluaciones de sesgos; se desconoce su comportamiento en documentos con formatos poco comunes o idiomas no occidentales.
- Para producción, es necesario validar el modelo con datos propios, ya que no hay benchmarks públicos que garanticen su precisión.

## Enlaces

- Modelo convertido en Hugging Face: https://huggingface.co/atkinschang/docling-layout-egret-large-mlx
- Modelo original en Hugging Face: https://huggingface.co/docling-project/docling-layout-egret-large
- Árbol de archivos del modelo original: https://huggingface.co/docling-project/docling-layout-egret-large/tree/main
- Página en ModelScope: https://www.modelscope.cn/models/ds4sd/docling-layout-egret-large/summary
- Documentación de modelos de layout en Docling (DeepWiki): https://deepwiki.com/docling-project/docling/4.2-layout-and-table-structure-models
- Catálogo de modelos de Docling: https://docling-project.github.io/docling/usage/model_catalog/
