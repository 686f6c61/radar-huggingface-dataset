# mlboydaisuke/TableTransformer-ExecuTorch

## Resumen

TableTransformer-ExecuTorch es un paquete de dos modelos de detección de tablas en documentos, convertidos a formato ExecuTorch (`.pte`) para inferencia en dispositivos. El paquete incluye un modelo de detección (encuentra tablas en una página) y un modelo de estructura (analiza una tabla recortada para identificar filas, columnas, celdas de cabecera y celdas abarcantes). Ambos modelos son una adaptación de los modelos originales de Microsoft (microsoft/table-transformer-detection y microsoft/table-transformer-structure-recognition) y se distribuyen bajo licencia MIT.

El modelo está desarrollado por mlboydaisuke y forma parte de una colección de modelos de visión exportados a ExecuTorch con delegación XNNPACK para CPU. Cada modelo tiene 28,8 millones de parámetros, arquitectura DETR con backbone ResNet-18 y 125 consultas de objetos. Se ofrecen tres tamaños de entrada (667x1000, 1000x800, 800x800) para adaptarse a distintas orientaciones de página, evitando el relleno a cuadrado que degrada la precisión. Es una solución práctica para extraer tablas de PDFs e imágenes en dispositivos móviles y embebidos sin depender de la nube.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | DETR (ResNet-18 backbone, 125 object queries) |
| Parámetros totales | 28,8 M por modelo (dos modelos: detección y estructura) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplicable (modelo de visión) |
| Tipos de cuantización | fp32 únicamente (no se incluyen versiones fp16 ni int8) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | MIT |
| Formato de pesos | ExecuTorch `.pte` (XNNPACK, CPU) |

## Arquitectura y entrenamiento

Los dos modelos son transformadores de detección de objetos (DETR) con un backbone ResNet-18. Cada modelo tiene 125 consultas de objeto y genera logits de clase y cajas delimitadoras normalizadas `(cx, cy, w, h)` respecto a la entrada. El modelo de detección identifica dos clases (`table`, `table rotated`); el de estructura identifica seis (`table`, `table column`, `table row`, `table column header`, `table projected row header`, `table spanning cell`). No se ha publicado información sobre el entrenamiento de estos modelos exportados; los modelos originales de Microsoft se entrenaron sobre el dataset PubTables-1M, pero esta conversión no añade ni modifica los pesos. La conversión a ExecuTorch se realizó con delegación XNNPACK, con un 90,6% de las operaciones ejecutándose en subgrafos XNNPACK (32 subgrafos en total). El preprocesado sigue la media y desviación estándar de ImageNet y el post-procesado (softmax y umbral) se realiza fuera del grafo.

## Capacidades

- Detección de tablas en páginas completas (modelo `detection`), incluyendo tablas rotadas.
- Análisis de estructura de tablas recortadas (modelo `structure`): filas, columnas, cabecera de columna, cabecera de fila proyectada y celdas abarcantes.
- Salida de cajas normalizadas `(cx, cy, w, h)` que permiten mapear fácilmente a las coordenadas de la página original.
- Tres tamaños de entrada predefinidos para adaptarse a la orientación (horizontal, vertical, cuadrado), con un coste adicional de solo 0,3 MB por incluir los tres métodos en un mismo `.pte`.
- Inferencia en CPU mediante XNNPACK, sin dependencia de GPU o hardware específico.
- No es un modelo de lenguaje: no genera texto, no admite tool calling ni agentes.

## Casos de uso

- Extracción de tablas en documentos escaneados: el modelo de detección localiza las tablas en una página y el modelo de estructura extrae la disposición de filas y columnas, permitiendo reconstruir la tabla en formato digital.
- Automatización de procesos de captura de datos en facturas, albaranes y formularios: se puede encadenar la detección y la estructura para convertir tablas de PDF a CSV o JSON.
- Análisis de informes financieros y académicos: extraer datos tabulares de artículos, informes o presentaciones para su posterior procesamiento.
- Aplicaciones móviles de digitalización de documentos: el formato `.pte` permite ejecutar la detección en el dispositivo sin conexión, lo que mejora la privacidad y reduce la latencia.
- Integración en pipelines de OCR: combinar con un OCR para obtener el texto de las celdas identificadas por el modelo de estructura.
- Verificación de calidad de impresión: detectar tablas en imágenes de baja resolución o con rotaciones, gracias a la clase `table rotated`.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, etc.) para este modelo, ya que es un modelo de visión y no de lenguaje. La model card incluye una verificación de paridad con el modelo original de Microsoft en una imagen de ejemplo, con un IoU de 1.0000 para todas las detecciones:

| Modelo | Detecciones (umbral 0,7) | IoU coincidente |
|---|---|---|
| Estructura | 17 (9 filas, 4 columnas, 1 cabecera de columna, 2 celdas abarcantes, 1 tabla) | 1.0000 |
| Detección | 1 (la tabla) | 1.0000 |

En cuanto a velocidad, en una Mac arm64 (mediana de 5 ejecuciones) con el tamaño de entrada 667x1000:

| Modelo | `.pte` | torch eager fp32 |
|---|---|---|
| Estructura | 44,1 ms | 66,5 ms |
| Detección | 37,8 ms | 63,4 ms |

No hay datos de rendimiento en otros dispositivos ni de latencia en producción.

## Requisitos de hardware

- Inferencia en CPU (XNNPACK) con ExecuTorch; no requiere GPU.
- Tamaño de cada archivo `.pte`: 115,8 MB (detección) y 115,9 MB (estructura). El peso total del repositorio es de 0,2 GB.
- Se ejecuta en Mac arm64 (probado) y en dispositivos que soporten ExecuTorch con XNNPACK (Android, iOS, etc.).
- No hay datos de VRAM porque no se usa GPU; la memoria RAM necesaria es aproximadamente el tamaño de los pesos (alrededor de 116 MB por modelo).
- Opciones de despliegue: se puede integrar en aplicaciones móviles o de escritorio mediante ExecuTorch, usando el archivo `.pte` directamente. No se proporcionan instrucciones para usar con vLLM, Ollama o TGI (no aplicable).

## Comparativa con modelos similares

| Modelo | Parámetros | Formato | Precisión | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| microsoft/table-transformer-detection | 28,8 M | PyTorch | Referencia (entrenado en PubTables-1M) | MIT | HuggingFace |
| microsoft/table-transformer-structure-recognition | 28,8 M | PyTorch | Referencia (entrenado en PubTables-1M) | MIT | HuggingFace |
| mlboydaisuke/TableTransformer-ExecuTorch | 28,8 M | ExecuTorch `.pte` | IoU 1.0000 en verificación (misma imagen) | MIT | HuggingFace |

La principal diferencia es el formato: el modelo original se ejecuta con PyTorch eager, mientras que este modelo está optimizado para ejecución en dispositivo con XNNPACK, ofreciendo una velocidad 1,5 veces mayor en la CPU de prueba. No se dispone de comparativas con otros detectores de tablas (por ejemplo, PaddleOCR Table-Transformer) en términos de precisión.

## Limitaciones y advertencias

- Solo fp32: no se incluyen versiones cuantizadas (fp16, int8), lo que limita el ahorro de memoria y puede ser menos eficiente en dispositivos con poca RAM.
- No se ha publicado una versión Core ML; la compatibilidad con iOS se limita al uso de ExecuTorch con XNNPACK.
- El modelo requiere un preprocesado específico (media/desviación de ImageNet, redimensionado bilinear) y un postprocesado externo (softmax, umbral) que debe implementarse por el usuario; no está todo incluido en el grafo.
- El umbral de confianza (0,7 en la verificación) es una política del usuario y debe ajustarse según el caso de uso.
- La detección de tablas rotadas es limitada a una clase específica; no se garantiza el rendimiento en otros tipos de rotación.
- No se han realizado pruebas de robustez frente a imágenes de baja calidad, ruido o tablas complejas con celdas fusionadas más allá de la verificación simple.
- El modelo es de visión, no es un modelo de lenguaje; no genera texto ni interpreta el contenido de las celdas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/mlboydaisuke/TableTransformer-ExecuTorch
- Colección ExecuTorch Model Zoo: https://huggingface.co/collections/mlboydaisuke/executorch-model-zoo
- Repositorio oficial de Microsoft Table Transformer (TATR): https://github.com/microsoft/table-transformer
- Documentación del dataset PubTables-1M (relacionada con el entrenamiento original): https://github.com/microsoft/table-transformer (enlace al repositorio, no hay página específica)
- Búsqueda de modelos con etiqueta `executorch-pte`: https://huggingface.co/models?other=executorch-pte
