# LibreYOLO/LibrePPDocLayoutV3l

## Resumen

LibrePPDocLayoutV3l es un modelo de detección de objetos especializado en análisis de maquetación de documentos (*document layout analysis*) y orden de lectura, publicado por el proyecto LibreYOLO. Se trata de una conversión directa al formato de checkpoint de LibreYOLO del modelo PP-DocLayoutV3 desarrollado por el equipo de PaddleOCR (PaddlePaddle). El modelo detecta 25 clases de regiones documentales —texto, títulos, tablas, imágenes, fórmulas, encabezados, pies de página, sellos, entre otras— y asigna a cada región una posición en el orden de lectura de la página.

La arquitectura combina un backbone HGNetV2-L con un decodificador de estilo RT-DETR que incorpora *queries* enriquecidas con máscaras y una cabeza específica de orden de lectura basada en *global pointer*. El repositorio ocupa 0,1 GB y los pesos se distribuyen en formato `.pt` propietario de la librería LibreYOLO. La conversión no altera los parámetros aprendidos: según el autor, las salidas crudas de la cabeza (logits de clase, cajas, logits de orden de lectura y máscaras) coinciden bit a bit con la implementación de referencia en PyTorch sobre las mismas entradas.

Su relevancia actual radica en que permite ejecutar un modelo de maquetación documental de referencia dentro del ecosistema LibreYOLO, con una API unificada de inferencia (`LibreYOLO("modelo.pt")`), licencia Apache 2.0 y sin dependencia del stack de Paddle. Es útil para pipelines de digitalización, extracción de información estructurada y OCR con orden de lectura correcto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | HGNetV2-L (backbone) + decodificador RT-DETR con queries enriquecidas con máscaras y cabeza de orden de lectura global-pointer |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de detección, no generativo) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo visual, independiente del idioma del texto) |
| Licencia | Apache 2.0 |
| Formato de pesos | `.pt` (checkpoint LibreYOLO v1.0); origen en `model.safetensors` |
| Clases detectadas | 25 clases de maquetación documental |
| Pipeline | object-detection |
| Tamaño del repositorio | 0,1 GB |
| Modelo base | PaddlePaddle/PP-DocLayoutV3_safetensors (revisión `e4f489dc536556fc1be02b973ba06756e0d4a2ac`) |
| SHA-256 del checkpoint | `347f3f60e03a4ecc64184085709180b094df4c27345b3a97fd9ec1b4f78a1ef4` |

## Arquitectura y entrenamiento

El modelo es un detector de objetos tipo DETR. El backbone HGNetV2-L extrae características visuales de la imagen de la página; sobre ellas, un decodificador de estilo RT-DETR refina un conjunto de *queries* que incorporan información de máscara (*mask-enhanced queries*), lo que permite delimitar regiones con formas no rectangulares además de las cajas delimitadoras. Una cabeza adicional de orden de lectura, implementada como *global pointer*, produce para cada región un logit de posición relativa que se usa para ordenar las detecciones según la secuencia de lectura de la página.

No se dispone de información sobre el volumen de datos de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de alineación como RLHF o DPO; estos datos corresponden al modelo original PP-DocLayoutV3 y no se detallan en la información disponible. La contribución de esta ficha es exclusivamente de conversión de formato: se elimina el prefijo `model.` de las claves del *state dict* y se añaden metadatos de LibreYOLO v1.0, sin modificar los parámetros aprendidos. El autor documenta que las salidas crudas de la cabeza coinciden bit a bit con la implementación de referencia en PyTorch.

## Capacidades

- Detección de 25 clases de regiones de maquetación documental: texto, títulos, tablas, imágenes, fórmulas, encabezados, pies de página, sellos y otras.
- Predicción de cajas delimitadoras por región con umbral de confianza configurable (por ejemplo, `conf=0.5`).
- Cálculo del orden de lectura de las regiones detectadas, expuesto como `r.reading_order`.
- Segmentación asistida mediante *queries* enriquecidas con máscaras.
- Integración con la API de LibreYOLO: carga del checkpoint, inferencia sobre imagen y acceso a `boxes.xyxy`, `boxes.cls` y `names`.
- Capacidad multilingüe no aplicable: el modelo opera sobre geometría y apariencia visual de la página, no sobre el contenido textual.
- No soporta *tool calling*, function calling ni razonamiento multi-paso: no es un modelo generativo.

## Casos de uso

- Digitalización de documentos escaneados: el modelo localiza cada bloque (texto, tabla, figura, encabezado) y devuelve su orden de lectura, lo que permite reconstruir el flujo textual de un PDF o una imagen antes de pasarla a un motor OCR.
- Extracción de información estructurada: al identificar tablas, fórmulas y campos de texto por separado, se pueden enrutar cada tipo de región a extractores especializados (parser de tablas, reconocedor de fórmulas, OCR de texto corrido).
- Preprocesado para OCR con orden correcto: la cabeza de orden de lectura resuelve la secuencia de bloques en maquetaciones multicolumna, algo crítico para que el texto extraído sea coherente.
- Procesamiento de documentos administrativos y formularios: la detección de sellos, encabezados y pies de página permite separar metadatos del cuerpo del documento en flujos de gestión documental.
- Análisis de artículos científicos y documentación técnica: la detección de fórmulas, figuras y títulos facilita la conversión a formatos estructurados (Markdown, XML) preservando la jerarquía.
- Indexación y búsqueda documental: la segmentación por regiones permite generar índices por bloque y mejorar la recuperación de información en corpus escaneados.
- Verificación de calidad de digitalización: la ausencia o el solapamiento anómalo de regiones detectadas puede señalar páginas mal escaneadas o rotadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada; el repositorio pesa 0,1 GB, lo que sugiere un modelo ligero que probablemente quepa en GPU de consumo, pero no se confirma.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no confirmada explícitamente; por el tamaño del checkpoint (0,1 GB) es plausible en tarjetas con 4-8 GB de VRAM, pero es una estimación, no un dato del autor.
- Opciones de despliegue: librería `libreyolo` (API `LibreYOLO("LibrePPDocLayoutV3l.pt")`); no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a un detector de objetos.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Clases | Orden de lectura | Licencia | Formato |
|---|---|---|---|---|---|
| LibrePPDocLayoutV3l | HGNetV2-L + RT-DETR | 25 | Sí (global pointer) | Apache 2.0 | `.pt` (LibreYOLO) |
| PaddlePaddle/PP-DocLayoutV3_safetensors | HGNetV2-L + RT-DETR | 25 | Sí (global pointer) | Apache 2.0 | safetensors |
| Otros detectores de layout (DocLayout-YOLO, LayoutLMv3) | no disponible en la información | no disponible | no disponible | no disponible | no disponible |

La comparación relevante es con el modelo original PP-DocLayoutV3: comparten arquitectura, pesos y licencia; la diferencia es el formato de checkpoint y la API de ejecución (LibreYOLO frente a Paddle). No se dispone de datos de benchmarks para comparar rendimiento numérico con alternativas.

## Limitaciones y advertencias

- No es un modelo generativo: no produce texto, no razona y no admite instrucciones en lenguaje natural.
- No se han publicado métricas de precisión, recall ni mAP en la información disponible; no debe asumirse un rendimiento concreto sin evaluarlo en el dominio objetivo.
- El modelo hereda los sesgos y limitaciones del dataset de entrenamiento original de PP-DocLayoutV3, que no se documenta en esta ficha.
- Riesgo de falsos positivos o negativos en maquetaciones atípicas (documentos históricos, layouts no occidentales, páginas muy densas), no cuantificado.
- La lista de 25 clases sigue el `label_list` de `inference.yml` de la release original; cambios en esa lista romperían la correspondencia con los índices de clase.
- El checkpoint está en formato `.pt` de LibreYOLO v1.0 y requiere esa librería; no se distribuye en safetensors ni GGUF en este repositorio.
- La licencia Apache 2.0 permite uso comercial, pero se debe conservar el aviso de copyright de PaddlePaddle Authors recogido en `NOTICE`.
- El modelo se publicó con 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de uso en producción ni validación comunitaria.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/LibreYOLO/LibrePPDocLayoutV3l
- Modelo base: https://huggingface.co/PaddlePaddle/PP-DocLayoutV3_safetensors
- Repositorio de LibreYOLO: https://github.com/LibreYOLO/libreyolo
- Proyecto PaddleOCR: https://github.com/PaddlePaddle/PaddleOCR
