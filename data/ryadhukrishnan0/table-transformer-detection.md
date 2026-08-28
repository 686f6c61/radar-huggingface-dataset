# ryadhukrishnan0/table-transformer-detection

## Resumen

El modelo `ryadhukrishnan0/table-transformer-detection` es una re-subida del Table Transformer (DETR) original de Microsoft, fine-tuneado específicamente para la detección de tablas en documentos e imágenes. Se basa en el arquitectura DETR (Detection Transformer), un modelo de detección de objetos que utiliza un transformer tanto en el encoder como en el decoder, con una configuración de "normalize before" (pre-norm) en las capas de atención. El modelo fue entrenado sobre el dataset PubTables-1M, que contiene más de un millón de imágenes de tablas anotadas con bounding boxes, y está pensado para localizar tablas dentro de documentos escaneados o digitales.

Aunque el autor de la re-subida es `ryadhukrishnan0`, el modelo original fue desarrollado por el equipo de Microsoft Research y publicado en el paper "PubTables-1M: Towards Comprehensive Table Extraction From Unstructured Documents" (arXiv:2110.00061). Este modelo es relevante porque resuelve el problema de extracción de tablas en entornos empresariales y de investigación, donde la información tabular suele estar incrustada en PDFs o imágenes. Con 28,8 millones de parámetros y un tamaño de repositorio de 0,6 GB, es un modelo ligero que puede ejecutarse en hardware modesto, lo que facilita su integración en pipelines de procesamiento documental.

La licencia MIT permite uso comercial sin restricciones significativas, lo que lo convierte en una opción atractiva para proyectos de producción. Sin embargo, al ser una re-subida no oficial, se recomienda verificar la integridad de los pesos antes de su uso en entornos críticos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DETR (Detection Transformer) con pre-norm |
| Parametros totales | 28.818.631 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision, procesa imagenes) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (modelo de vision, no de lenguaje) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura DETR, que combina un backbone CNN (ResNet) con un transformer encoder-decoder. A diferencia de otros detectores de objetos que usan anclas o propuestas, DETR trata la detección como un problema de predicción de conjuntos, generando directamente un conjunto fijo de predicciones de bounding boxes y clases. En este caso, el modelo está entrenado para predecir una única clase: "tabla". La configuración "normalize before" (pre-norm) aplica la normalización de capas antes de las operaciones de self-attention y cross-attention, lo que mejora la estabilidad del entrenamiento.

El entrenamiento se realizó sobre PubTables-1M, un dataset que contiene 947.642 imágenes de tablas extraídas de documentos científicos, con anotaciones de bounding boxes a nivel de tabla. El modelo fue entrenado por el equipo de Microsoft y posteriormente subido a Hugging Face por el usuario `ryadhukrishnan0`. No se dispone de información detallada sobre el número de épocas, el tamaño del batch o las técnicas de aumentación de datos utilizadas, ya que la model card original no los especifica.

## Capacidades

- Detección de tablas en imágenes y documentos escaneados, devolviendo bounding boxes que delimitan la región de cada tabla.
- Funciona como componente de un pipeline de extracción de tablas: primero se detectan las tablas y luego se puede aplicar un modelo de reconocimiento de estructura (como `table-transformer-structure-recognition`) para extraer celdas y contenido.
- Capacidad de procesar imágenes de resolución variable, aunque el rendimiento puede degradarse con imágenes de baja calidad o tablas muy complejas.
- No es un modelo multimodal ni de lenguaje: no genera texto, no soporta tool calling ni razonamiento multi-paso.
- Al ser un modelo de detección de objetos genérico, puede adaptarse a otras tareas de detección con fine-tuning, aunque su especialización principal es la detección de tablas.

## Casos de uso

- **Extracción de tablas en facturas y recibos**: el modelo puede localizar tablas en facturas escaneadas o digitales, permitiendo posteriormente extraer los datos estructurados (líneas de productos, importes, etc.) mediante un modelo de reconocimiento de estructura.
- **Digitalización de documentos científicos**: en artículos de investigación, las tablas suelen estar en formato PDF. Este modelo permite identificar la región de cada tabla para su posterior conversión a formatos editables como CSV o Excel.
- **Procesamiento de informes financieros**: en informes anuales, estados de cuenta o balances, las tablas son elementos clave. La detección automática facilita la extracción de datos para análisis financiero automatizado.
- **Automatización de entrada de datos**: en empresas que reciben documentos con tablas (pedidos, albaranes, contratos), el modelo puede integrarse en un sistema OCR para localizar tablas y reducir el trabajo manual de transcripción.
- **Indexación de documentos**: al detectar tablas, se pueden crear índices o metadatos que permitan buscar documentos por contenido tabular, mejorando la recuperación de información en gestores documentales.
- **Preprocesamiento para OCR híbrido**: combinado con herramientas de OCR tradicionales, el modelo permite aislar las regiones tabulares y aplicar técnicas de reconocimiento específicas para tablas, mejorando la precisión frente a un OCR genérico.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card original no incluye métricas cuantitativas como mAP o IoU sobre PubTables-1M. El paper original (Smock et al., 2021) reporta resultados, pero no se han incluido en la información proporcionada para esta ficha.

## Requisitos de hardware

- **VRAM estimada**: al tratarse de un modelo de 28,8 millones de parámetros, la inferencia requiere aproximadamente 0,6 GB de VRAM en precisión float32. Con cuantización a int8, podría reducirse a unos 0,3 GB, aunque no se dispone de archivos cuantizados oficiales.
- **GPU recomendadas**: cualquier GPU con al menos 2 GB de VRAM es suficiente. Modelos como NVIDIA GTX 1050 Ti, GTX 1650, RTX 2060 o superiores pueden ejecutarlo sin problemas. También funciona en CPU, aunque con mayor latencia.
- **Compatibilidad con hardware de consumo**: sí, cabe en cualquier GPU de consumo actual. Incluso en una Raspberry Pi con aceleración Coral podría ser viable, aunque no está optimizado para ello.
- **Opciones de despliegue**: se puede utilizar con la librería `transformers` de Hugging Face, que ofrece una API sencilla para carga e inferencia. También es compatible con ONNX Runtime y puede exportarse a TensorRT para optimización en producción. No se ha verificado su compatibilidad con vLLM u Ollama, ya que estos están orientados a modelos de lenguaje.
- **Latencia y throughput**: en una GPU moderna (RTX 3090), la inferencia de una imagen de 800x600 píxeles debería completarse en menos de 100 ms. En CPU, la latencia puede ser de 1-2 segundos por imagen. No hay datos oficiales de throughput.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `ryadhukrishnan0/table-transformer-detection` (este) | 28,8 M | no aplica | no disponible | MIT | Re-subida no oficial |
| `microsoft/table-transformer-detection` | 28,8 M | no aplica | reportado en paper (mAP ~0.96 en PubTables1M) | MIT | Modelo oficial en Hugging Face |
| `microsoft/table-transformer-structure-recognition` | 28,8 M | no aplica | reportado en paper | MIT | Modelo oficial para reconocimiento de estructura |

El modelo es idéntico al oficial de Microsoft en cuanto a arquitectura y pesos (presumiblemente), pero al ser una re-subida no se puede garantizar la integridad de los archivos. Se recomienda usar el modelo oficial de Microsoft para entornos de producción.

## Limitaciones y advertencias

- **Sesgos conocidos**: el modelo fue entrenado principalmente con tablas de documentos científicos (PubTables-1M), por lo que puede tener un rendimiento inferior en tablas de otros dominios (facturas, formularios, etc.) con formatos muy diferentes.
- **Riesgo de alucinación**: al ser un modelo de detección de objetos, no genera texto, por lo que el concepto de alucinación no aplica directamente. Sin embargo, puede producir falsos positivos (detectar tablas donde no las hay) o falsos negativos (no detectar tablas existentes) en imágenes complejas.
- **Limitaciones de contexto**: el modelo procesa imágenes completas; no tiene una ventana de contexto de texto. La resolución de la imagen de entrada afecta directamente a la precisión.
- **Restricciones de licencia**: la licencia MIT permite uso comercial sin atribución obligatoria, pero al ser una re-subida, no hay garantía de que los pesos sean exactamente los originales. Se recomienda descargar el modelo desde el repositorio oficial de Microsoft para mayor fiabilidad.
- **Caveat para producción**: no se han realizado pruebas de robustez en este repositorio. La ausencia de descargas y likes sugiere que no ha sido ampliamente validado por la comunidad.

## Enlaces

- [Modelo en Hugging Face (re-subida)](https://huggingface.co/ryadhukrishnan0/table-transformer-detection)
- [Modelo oficial de Microsoft en Hugging Face](https://huggingface.co/microsoft/table-transformer-detection)
- [Repositorio oficial de Table Transformer (GitHub)](https://github.com/microsoft/table-transformer)
- [Paper: PubTables-1M (arXiv)](https://arxiv.org/abs/2110.00061)
- [Documentación de Table Transformer en Transformers](https://huggingface.co/docs/transformers/main/en/model_doc/table-transformer)
