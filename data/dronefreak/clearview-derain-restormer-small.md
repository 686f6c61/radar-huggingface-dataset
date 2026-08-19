# dronefreak/clearview-derain-restormer-small

## Resumen

ClearView es un modelo de eliminación de lluvia en imágenes individuales (single-image deraining) desarrollado por dronefreak (Saumya Saksena). Esta variante concreta, `clearview-derain-restormer-small`, es una versión reducida del transformer Restormer original, con dimensión de embedding reducida y menos bloques transformer por nivel, lo que la sitúa en solo 2,3 millones de parámetros. El modelo se entrena sobre una mezcla de datos sintéticos y reales de lluvia, con un esquema de selección de checkpoint basado en una métrica de validación combinada que prioriza el rendimiento en dominios reales frente a la optimización exclusiva de un único benchmark sintético.

La relevancia de este modelo radica en su equilibrio entre tamaño y capacidad: al ser extremadamente ligero (2,3M de parámetros), puede desplegarse en entornos con recursos limitados, manteniendo un rendimiento competitivo en métricas como PSNR y SSIM tanto en conjuntos sintéticos (Rain100L, Test1200, etc.) como en conjuntos reales (SPA-Data, RealRain-1k). Su licencia Apache 2.0 permite uso comercial sin restricciones, y su integración con la librería ClearView facilita su uso en pipelines de restauración de imágenes. El modelo se publica con una ventana de contexto no aplicable (es un modelo de visión, no de texto) y está orientado a tareas de image-to-image.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Restormer-Small (transformer para restauración de imágenes, variante reducida) |
| Parametros totales | 2,3 millones |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no aplicable (modelo de visión, procesa imágenes de resolución variable) |
| Tipos de cuantizacion | no disponible (pesos en formato PyTorch .pth) |
| Idiomas soportados | no aplicable (modelo de visión; la documentación está en inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | PyTorch (.pth) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Restormer, un transformer diseñado específicamente para restauración de imágenes, pero con una configuración reducida: menor dimensión de embedding y menos bloques transformer por nivel. Esto lo convierte en una variante "small" que prioriza velocidad y eficiencia sobre la capacidad bruta del Restormer original. La arquitectura es puramente transformer, sin componentes MoE ni SSM.

El entrenamiento utiliza una combinación de cinco fuentes de datos, mezcladas mediante el sistema `--mix-config` de ClearView, con sobremuestreo 2x de las fuentes reales. Las fuentes incluyen Rain13K (13.711 pares sintéticos), DDN-Data/Rain1400 (12.600 pares sintéticos), SPA-Data (6.385 pares reales), y RealRain-1k-H y RealRain-1k-L (784 pares reales cada uno). La mezcla efectiva resulta en aproximadamente 62% sintético y 38% real por peso de muestreo. La selección del checkpoint se realiza sobre un conjunto de validación combinado que incluye SPA-Data val (limitado a 150 pares), RealRain-1k-H/L val (112 cada uno) y Rain100L (100 pares) como ancla sintética, evitando que un único dataset domine la selección.

No se menciona el uso de RLHF, DPO ni técnicas de alineación, ya que es un modelo de visión puro. La innovación técnica destacable es el enfoque de entrenamiento mixto y la métrica propia "Rain Removal Rate" (RRR), que mide la energía residual de alta frecuencia entre la salida y la verdad terreno frente a la del input, permitiendo detectar si el modelo añade artefactos o alucina detalles.

## Capacidades

- Eliminación de lluvia en imágenes individuales (single-image deraining), tanto en lluvia sintética como real.
- Restauración de imágenes en general, con buen comportamiento en condiciones de lluvia ligera y moderada.
- Funciona en dominios mixtos: entrenado con datos sintéticos y reales, lo que le permite generalizar mejor que modelos entrenados solo en uno de los dos.
- Procesamiento de imágenes de resolución variable (no hay restricción de tamaño fijo documentada).
- Soporte para integración mediante la librería ClearView, que ofrece una API simple (`DerainingModel.from_pretrained` y `model.process`).
- No soporta tool calling, agentes ni razonamiento multi-paso, al ser un modelo de visión puro.
- No tiene capacidades multimodales más allá de la restauración de imágenes.

## Casos de uso

- Conducción autónoma: limpieza de imágenes de cámaras de vehículos en condiciones de lluvia, mejorando la fiabilidad de los sistemas de detección de objetos y segmentación. El modelo puede procesar frames en tiempo real dado su bajo coste computacional.
- Vigilancia y seguridad: restauración de secuencias de cámaras de vigilancia afectadas por lluvia, facilitando la identificación de personas o matrículas en condiciones meteorológicas adversas.
- Fotografía y postproducción: eliminación de lluvia en fotografías al aire libre, tanto para uso amateur como profesional, mediante la integración en herramientas de edición de imágenes.
- Preprocesamiento para otros modelos de visión: limpieza de imágenes antes de pasarlas a modelos de segmentación semántica, detección de objetos o reconocimiento de escenas, mejorando su precisión en entornos lluviosos.
- Sistemas de cámaras de tráfico: mejora de la calidad de imágenes de cámaras de carretera para aplicaciones de gestión del tráfico y análisis de incidentes.
- Restauración de vídeo: aplicación frame a frame para limpiar grabaciones de vídeo con lluvia, siempre que el rendimiento en tiempo real sea suficiente (dado el tamaño reducido, es plausible en GPUs de gama media).

## Benchmarks y rendimiento

El modelo presenta métricas detalladas sobre varios conjuntos de test, cada uno con su propia partición de evaluación (no la validación combinada usada para selección de checkpoint). Los resultados son los siguientes:

| Test Set | Dominio | PSNR (dB) | SSIM | MAE | MSE | Rain Removal Rate | NIQE |
|---|---|---|---|---|---|---|---|
| Rain100L | Sintético | 31.57 | 0.933 | 0.0157 | 0.00103 | 0.338 | 9.75 |
| Rain100H | Sintético | 25.92 | 0.806 | 0.0367 | 0.00318 | 0.710 | 11.33 |
| Test100 | Sintético | 26.10 | 0.842 | 0.0451 | 0.00405 | 0.458 | 8.99 |
| Test1200 | Sintético | 30.66 | 0.882 | 0.0244 | 0.00137 | 0.457 | 7.10 |
| Test2800 | Sintético | 31.00 | 0.914 | 0.0208 | 0.00089 | 0.431 | 799.06 |
| DDN-Data | Sintético | 31.28 | 0.918 | 0.0204 | 0.00086 | 0.424 | 1006.31 |
| SPA-Data | Real | 38.46 | 0.978 | 0.0063 | 0.00039 | 0.381 | 6.22 |
| RealRain-1k-H | Real | 35.29 | 0.969 | 0.0128 | 0.00081 | 0.747 | 3.82 |
| RealRain-1k-L | Real | 37.56 | 0.978 | 0.0094 | 0.00047 | 0.687 | 3.81 |
| AllWeather (rain+fog) | Cross-domain (stress) | 13.59 | 0.572 | 0.1906 | 0.05590 | 0.120 | 235.04 |

No se han publicado resultados comparativos con otros modelos en la información disponible. El rendimiento en AllWeather (combinación de lluvia y niebla) es significativamente peor, lo que indica que el modelo no está optimizado para escenarios con niebla simultánea. Los valores de NIQE en Test2800 y DDN-Data (799 y 1006 respectivamente) son anómalamente altos, probablemente debido a artefactos en las imágenes de referencia, pero se reportan tal cual.

## Requisitos de hardware

- VRAM estimada: con 2,3 millones de parámetros, el modelo ocupa aproximadamente 9 MB en precisión FP32 (2,3M × 4 bytes). La inferencia puede ejecutarse en menos de 1 GB de VRAM, incluso en GPUs integradas.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente. Tarjetas como NVIDIA GTX 1050 Ti, RTX 2060 o superiores funcionarán sin problemas. También es viable en hardware de gama baja o en CPU.
- En consumer GPU: sí, cabe en cualquier GPU de consumo actual, incluidas las integradas de Intel o AMD.
- Opciones de despliegue: la librería ClearView proporciona una API Python sencilla. Al ser un modelo PyTorch estándar, puede exportarse a ONNX o TorchScript para inferencia optimizada. No se menciona soporte nativo para vLLM, llama.cpp u Ollama, ya que esos están orientados a modelos de lenguaje.
- Latencia y throughput: no se proporcionan datos oficiales. Dado el tamaño reducido, se espera una latencia de pocos milisegundos por imagen en una GPU moderna, pero no hay cifras confirmadas.

## Comparativa con modelos similares

No se dispone de datos de rendimiento comparativos de otros modelos en la misma tabla. Sin embargo, el propio ecosistema ClearView incluye variantes con backbone ResNet (ResNet18/34/50-UNet), que según la documentación muestran valores negativos de Rain Removal Rate en Rain100L y SPA-Data, lo que indica que añaden artefactos de alta frecuencia en lugar de eliminarlos. El modelo Restormer-Small no presenta ningún valor negativo de RRR en los conjuntos evaluados, lo que sugiere una ventaja cualitativa sobre esas variantes. No se dispone de comparación directa con el Restormer original ni con otros modelos de deraining como IDT, Uformer o MPNet.

## Limitaciones y advertencias

- Rendimiento deficiente en condiciones de lluvia combinada con niebla: el test AllWeather muestra un PSNR de solo 13.59 dB, muy por debajo de los valores en conjuntos de lluvia pura. No debe usarse en escenarios con niebla sin un entrenamiento adicional.
- Sesgos potenciales: los datos reales provienen principalmente de SPA-Data y RealRain-1k, que pueden no representar todas las condiciones climáticas globales (por ejemplo, lluvia tropical intensa o lluvia nocturna). La generalización a escenarios no vistos puede verse limitada.
- Riesgo de alucinación: aunque el modelo no presenta valores negativos de RRR, en imágenes con lluvia muy densa o texturas complejas podría introducir suavizado excesivo o pérdida de detalle fino, como sugiere el rendimiento moderado en Rain100H (PSNR 25.92).
- Restricciones de licencia: Apache 2.0 permite uso comercial, modificación y distribución, pero requiere atribución y no ofrece garantías. Es compatible con la mayoría de proyectos propietarios.
- Limitaciones de idioma: no aplica, al ser un modelo de visión. La documentación y la API están en inglés.
- Tamaño del repositorio: el repo en HuggingFace muestra 0.0 GB, lo que podría indicar que los pesos se almacenan externamente o que hay un error en la metadata. Se recomienda verificar la integridad de los archivos descargados.
- Dependencia de la librería ClearView: el modelo requiere instalar el paquete `clearview` desde GitHub, lo que añade una dependencia externa que podría no estar mantenida activamente.

## Enlaces

- Repositorio del modelo en HuggingFace: https://huggingface.co/dronefreak/clearview-derain-restormer-small
- Repositorio de la librería ClearView en GitHub: https://github.com/dronefreak/clearview
- Código del modelo Restormer en ClearView: https://github.com/dronefreak/clearview/blob/main/clearview/models/restormer.py
- Dataset SPA-Data: https://huggingface.co/datasets/dronefreak/SPA-Data
- Dataset RealRain-1k: https://huggingface.co/datasets/dronefreak/RealRain-1k
- Dataset Rain13K: https://huggingface.co/datasets/dronefreak/Rain13K
- Dataset DDN-Data: https://huggingface.co/datasets/dronefreak/DDN-Data
- Paper de Restormer (referencia [8] en la model card): https://arxiv.org/2206.05514
- Paper de SPA-Data (referencia [5] en la model card): https://arxiv.org/2111.09881
