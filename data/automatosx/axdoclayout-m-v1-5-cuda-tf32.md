# AutomatosX/AXDocLayout-M-v1.5-CUDA-TF32

## Resumen

AXDocLayout-M-v1.5-CUDA-TF32 es un modelo de detección de objetos especializado en análisis de maquetación de documentos (document layout analysis), desarrollado por AutomatosX. Se trata de un fine-tuning del modelo docling-project/docling-layout-heron, basado en la arquitectura RT-DETR v2, que recibe como entrada una página rasterizada en RGB y devuelve cajas delimitadoras correspondientes a las regiones estructurales del documento (títulos, tablas, párrafos, etc.).

La versión v1.5 continúa el ajuste fino orientado al dominio financiero iniciado en la iteración H5, incorporando en esta ocasión un estudio de muestreo de títulos (Title-sampling) que busca mejorar la detección de encabezados. El modelo tiene 42,9 millones de parámetros, un tamaño de repositorio de 0,2 GB y se distribuye en formato safetensors FP32 bajo licencia Apache-2.0.

Su relevancia radica en que aborda una tarea concreta dentro de los pipelines de procesamiento documental: la segmentación estructural previa al OCR y a la extracción de contenido. El autor documenta de forma explícita tanto las mejoras medidas como los compromisos aceptados (tradeoffs), incluyendo el fallo del cribado numérico congelado, lo que lo convierte en un artefacto con trazabilidad de evaluación poco habitual en modelos de este tamaño.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | RT-DETR v2 (transformer de detección de objetos en tiempo real) |
| Parámetros totales | 42.889.979 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión; entrada de imagen 640x640) |
| Tipos de cuantización | no disponible; el artefacto se distribuye en FP32 sin autocast ni cuantización |
| Idiomas soportados | no disponible (modelo de visión, sin procesamiento de texto) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (FP32) |

## Arquitectura y entrenamiento

El modelo emplea RT-DETR v2, un detector de objetos basado en transformer que elimina la necesidad de componentes posteriores al procesamiento como NMS (non-maximum suppression) mediante consultas de objetos aprendidas. Parte del checkpoint docling-project/docling-layout-heron en la revisión inmutable `8f39ad3c0b4c58e9c2d2c84a38465abf757272d8`, también bajo Apache-2.0, sobre el que se aplica un fine-tuning orientado al dominio financiero.

El preprocesamiento es un redimensionado directo a 640x640 con el procesador de imagen original fijado por hash; el autor advierte explícitamente de que no debe sustituirse por el letterbox de 1024 de D5 ni el de 1696 de H7. El entrenamiento se ejecutó en FP32 con almacenamiento y activaciones en precisión completa, sin autocast ni cuantización, permitiendo TF32 únicamente en cuDNN (no en matmuls CUDA). La innovación principal de esta iteración es el estudio de muestreo de títulos emparejado (paired Title-sampling study), que mejora el AP de títulos en 1,6476 puntos porcentuales con un intervalo de confianza bootstrap del 95% de [0,4851, 2,8212]. No se documenta el volumen de tokens ni la composición del dataset de entrenamiento.

## Capacidades

- Detección de maquetación documental: devuelve cajas delimitadoras en coordenadas xyxy de píxel sobre la imagen raster original.
- Clasificación en 17 clases nativas (0-16), mapeadas a los IDs 1-17 del SDK de PDF de AX mediante `sdk-taxonomy.json` (ax-document-unified-25/1). Las clases 18-25 del SDK no están soportadas.
- Detección específica de tablas financieras (FinTab) y de títulos (Title) dentro de páginas de documentos.
- Procesamiento de páginas rasterizadas en RGB; no abre PDFs, no realiza OCR ni infiere orden de lectura.
- Inferencia en CUDA con soporte de TF32 en cuDNN, y en CPU mediante `--device cpu` explícito.
- No dispone de tool calling, capacidades de agente, razonamiento multi-paso ni procesamiento de lenguaje natural: es exclusivamente un modelo de visión para detección.

## Casos de uso

- Digitalización de documentación financiera: el modelo segmenta páginas de informes y estados financieros en regiones estructurales antes de pasarlas a un motor de OCR, aislando tablas y encabezados para su extracción posterior. Su AP de 61,73% en el panel financiero (1745 páginas) lo hace adecuado para este dominio concreto.
- Extracción de tablas en informes anuales: con un AP de 91,58% en el panel FinTab (256 páginas), permite localizar tablas financieras con alta precisión para alimentar pipelines de parsing tabular.
- Preprocesamiento en pipelines RAG documentales: la detección de regiones permite trocear páginas por estructura lógica (título, párrafo, tabla) en lugar de por ventanas fijas de caracteres, mejorando la calidad de los fragmentos indexados.
- Indexación de archivos corporativos a gran escala: al ser un modelo de 42,9 millones de parámetros y 0,2 GB, puede desplegarse en flotas de GPUs modestas o incluso en CPU para procesamiento por lotes de volúmenes elevados.
- Detección de encabezados para generación de índices y tablas de contenido: la mejora de recall de títulos (56,19% frente a 48,83% de H5) lo hace útil en tareas donde prima no perder encabezados, aceptando el coste de más falsos positivos.
- Automatización de archivo y clasificación documental: las cajas detectadas permiten inferir el tipo de página (formulario, tabla, texto corrido) y enrutar el documento al proceso correspondiente.
- Integración en herramientas de análisis documental open source: compatible con la librería transformers y con el ecosistema de Docling, puede incorporarse como etapa de layout en pipelines existentes sin dependencias propietarias.

## Benchmarks y rendimiento

Los valores son porcentajes de AP sobre paneles de desarrollo previamente expuestos, según la model card del autor.

| Panel | H5 | Control emparejado | H5.1 / v1.5 |
|---|---:|---:|---:|
| AP general (6489 páginas) | 70,6572 | 71,1214 | 71,5327 |
| AP financiero (1745 páginas) | 61,5113 | 61,5445 | 61,7331 |
| AP FinTab (256 páginas) | 91,5856 | 91,7371 | 91,5774 |
| AP de títulos general | 35,9637 | 37,0977 | 38,7453 |
| Precisión de títulos a 0,30/IoU 0,50 | 38,9333 | 39,5833 | 36,2069 |
| Recall de títulos a 0,30/IoU 0,50 | 48,8294 | 50,8361 | 56,1873 |
| FinTab AP90 | 89,0473 | 89,0155 | 88,4481 |

El autor indica que el cribado numérico congelado no se superó: no se alcanzó el objetivo de 2 pp de mejora en AP de títulos, ni la retención de precisión de títulos, ni la retención de AP90 en tablas. La publicación se realizó por decisión explícita del propietario aceptando estos compromisos. No se han publicado resultados comparativos con otros modelos de layout en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en FP32 para los pesos (42,9 millones de parámetros, aproximadamente 172 MB), más el espacio de activaciones para la entrada de 640x640; en la práctica, cualquier GPU con 2 GB o más es suficiente.
- GPU validadas por el autor: RTX PRO 6000 Blackwell con PyTorch 2.12.1+cu129, CUDA 12.9 y Transformers 4.53.3.
- Cabe holgadamente en GPUs de consumo: RTX 3060, RTX 4060, RTX 4090 y superiores.
- Despliegue: la librería transformers es la vía soportada; el autor no incluye artefactos ONNX ni TensorRT. El script `predict_image.py` incluido realiza inferencia con `--device cuda` o `--device cpu`.
- Latencia y throughput: no disponibles en la información proporcionada.
- El ejemplo empaquetado está cualificado en CPU y no se reejecutó en CUDA para esta publicación.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto/entrada | Licencia | Disponibilidad |
|---|---|---|---|---|
| AXDocLayout-M-v1.5 | 42,9 M | imagen 640x640 | Apache-2.0 | Hugging Face (repo privado con acceso autorizado) |
| docling-layout-heron (modelo base) | no disponible | no disponible | Apache-2.0 | Hugging Face (docling-project) |
| Versión pública v1.0 de AX-DocLayout (11 clases) | no disponible | no disponible | no disponible | Hugging Face (AutomatosX) |

No se dispone de datos de benchmarks de los modelos comparables en la información proporcionada, por lo que no es posible establecer una comparación cuantitativa de rendimiento. El autor advierte explícitamente de que este modelo no debe interpretarse como superior a D5, D6 o H7, ya que sus paneles de evaluación están definidos de forma distinta y no son comparables por resta directa de puntuaciones.

## Limitaciones y advertencias

- El cribado numérico congelado falló: no se alcanzó el objetivo de 2 pp en AP de títulos, ni la retención de precisión de títulos, ni la retención de AP90 en tablas. El autor aceptó estos compromisos de forma explícita.
- La mejora de recall de títulos viene acompañada de un aumento de falsos positivos: 22 títulos verdaderos adicionales frente a 67 títulos falsos adicionales respecto a H5 en el umbral fijo.
- La precisión de títulos empeora respecto al control (36,21% frente a 39,58%), lo que puede ser problemático en aplicaciones donde los falsos positivos tengan coste alto.
- El panel financiero es un subconjunto del general, no evidencia independiente de HKEX; no se ha establecido la independencia de familias, la calidad en test final independiente ni la reproducibilidad con una segunda semilla.
- La precisión de retención en las clases extra del SDK (12-17) no está medida.
- El modelo no abre PDFs, no hace OCR ni infiere orden de lectura: requiere un pipeline externo para esas etapas.
- El preprocesamiento está fijado por hash (redimensionado directo a 640x640); sustituirlo por letterbox de otras variantes invalida los resultados.
- El repositorio es privado y requiere una cuenta de Hugging Face autorizada; debe fijarse el commit inmutable o la etiqueta `v1.5`.
- No debe cargarse con el loader fijado por recibo de la versión pública v1.0 de 11 clases.
- El umbral de puntuación por defecto de 0,30 es un punto de operación, no un AP/AR de COCO; debe interpretarse el resultado manteniendo las 17 clases.
- No se incluyen artefactos ONNX ni TensorRT, lo que limita el despliegue en entornos de inferencia optimizada.
- La licencia Apache-2.0 permite uso comercial, pero el acceso al artefacto está restringido por la privacidad del repositorio.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AutomatosX/AXDocLayout-M-v1.5-CUDA-TF32
- Modelo base: https://huggingface.co/docling-project/docling-layout-heron
- Repositorio Docling (proyecto upstream): https://github.com/docling-project/docling
- PyTorch con CUDA 12.9: https://download.pytorch.org/whl/cu129
- Paper de RT-DETR v2: no disponible en la información proporcionada
- Blog o demo del autor: no disponible en la información proporcionada
