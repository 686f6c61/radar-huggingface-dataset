# ATH-MaaS/OvisOCR3

## Resumen

OvisOCR3 es un modelo multimodal compacto de 853 millones de parámetros (852.985.920 según los metadatos de safetensors) especializado en OCR y comprensión de documentos, desarrollado por ATH-MaaS sobre Qwen3.5-0.8B. Unifica en un único modelo cinco tareas —parseo de documentos, OCR general, extracción de información clave (KIE), descripción de figuras documentales y reconstrucción de tablas multipágina— que se seleccionan mediante prompts específicos de tarea, evitando desplegar un modelo distinto para cada caso de uso.

El entrenamiento se realizó en cuatro fases: preentrenamiento continuado, mid-training, destilación on-policy y aprendizaje por refuerzo. Según sus autores, alcanza resultados de referencia entre modelos de tamaño comparable en los cinco dominios evaluados (por ejemplo, 88,8 en OCRBench y 96,74 en OmniDocBench1.6). Su relevancia práctica radica en ofrecer capacidades de document AI con una huella mínima (~1,7 GB en safetensors), licencia Apache 2.0 y despliegue con vLLM en una única GPU de consumo. La ventana de contexto exacta no está publicada, aunque el ejemplo de inferencia genera hasta 16.384 tokens.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Multimodal (image-text-to-text) basado en Qwen3.5-0.8B; la configuración de vLLM incluye un parámetro `gdn_prefill_backend`, lo que apunta a capas de atención tipo gated delta net en el modelo base |
| Parámetros totales | 852.985.920 (~853 M) |
| Longitud de contexto | no disponible (el ejemplo de inferencia permite generar hasta 16.384 tokens) |
| Tipos de cuantización | no disponible (repositorio de 1,7 GB, consistente con pesos en precisión media bf16/fp16; sin variantes cuantizadas publicadas) |
| Idiomas soportados | no disponible (los benchmarks cubren inglés y chino; los prompts de OCR general permiten especificar el idioma objetivo) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

OvisOCR3 es un modelo denso de 0,85B construido sobre Qwen3.5-0.8B, con pipeline image-text-to-text. La model card no detalla el codificador de visión ni el conector multimodal employed, pero el ejemplo de inferencia en vLLM incluye el parámetro `gdn_prefill_backend="triton"`, lo que sugiere que el modelo base incorpora capas de atención tipo gated delta net (arquitectura híbrida atención lineal/attention), aunque sin confirmación explícita en la documentación. Cada tarea se activa mediante prompts de tarea incluidos en el repositorio (carpeta `prompts/`), que definen los contratos de salida (JSON, Markdown, HTML, Mermaid, etc.).

El entrenamiento consta de cuatro etapas: preentrenamiento continuado (que establece la base en reconocimiento de texto y estructura documental), mid-training, destilación on-policy y aprendizaje por refuerzo, estas dos últimas para refinar las capacidades con supervisión y recompensas específicas de dominio. El número de tokens de entrenamiento, la composición del dataset y los algoritmos concretos de RL: no disponibles.

## Capacidades

- Parseo de documentos: a partir de una imagen de página y un prompt de modo parsing, genera JSON estructurado, JSON de layout o Markdown con fórmulas en LaTeX y tablas en HTML.
- OCR general: transcripción de texto, bounding boxes, LaTeX, datos de gráficos (chart data), etiquetado y respuestas a preguntas sobre la imagen; acepta región de interés, referencias, pregunta, idioma objetivo y etiquetas candidatas.
- Extracción de información clave (KIE): produce pares clave-valor o JSON que sigue una plantilla suministrada por el usuario, con campos especificables.
- Descripción de figuras documentales (figure captioning): genera contenido de página estructurado con captions localizadas visualmente y representaciones Mermaid para diagramas de flujo.
- Reconstrucción de tablas multipágina: a partir de imágenes de páginas consecutivas y su Markdown parseado, produce tablas HTML completas con asociación a la página de origen, o una predicción de "sin continuación".
- Entrada multi-imagen: el ejemplo de vLLM configura hasta 2 imágenes por prompt (`limit_mm_per_prompt={"image": 2}`).
- Generación larga de salida: hasta 16.384 tokens con temperatura 0,0 en el ejemplo documentado.
- Soporte de despliegue con vLLM; tool calling / function calling: no disponible (no se menciona en la documentación).

## Casos de uso

- Digitalización masiva de archivos y documentos escaneados: el modo parsing convierte páginas en Markdown o JSON con fórmulas LaTeX y tablas HTML, adecuado para crear archivos digitales buscables a partir de fondos históricos, documentación técnica o publicaciones científicas.
- Automatización documental en ERP y contabilidad: el modo KIE con plantilla JSON permite definir los campos a extraer (importes, fechas, identificadores) y obtener registros estructurados listos para integrar en sistemas backend sin postproceso complejo.
- Pipelines RAG sobre corpus documentales: el parseo a Markdown estructurado con tablas y fórmulas facilita el chunking por secciones y la indexación en bases vectoriales, mejorando la calidad de la recuperación frente a OCR plano.
- Reconstrucción de tablas que continúan en varias páginas: en informes financieros anuales o actas, el modelo une las tablas en HTML completo e indica la página de origen de cada parte, con trazabilidad para auditoría (97,07 de F1 relacional en CrossTabBench).
- Accesibilidad y descripción de figuras: las captions localizadas y las representaciones Mermaid de diagramas de flujo permiten generar alternativas de texto para lectores de pantalla y documentación automática de esquemas.
- Extracción de datos de gráficos: el OCR general puede devolver chart data a partir de imágenes de gráficos en informes, útil para reconstruir series temporales cuando solo se dispone del PDF escaneado.
- Despliegue denso en una sola GPU: con 0,85B de parámetros y ~1,7 GB de pesos, se pueden servir múltiples instancias concurrentes en una GPU de servidor o integrarlo en servicios de proceso documental de alto volumen con coste contenido.
- VQA documental: el OCR general admite preguntas sobre la imagen con etiquetas candidatas, útil para clasificación de tipos de documento o verificación visual en flujos de validación.

## Benchmarks y rendimiento

Datos publicados por los propios autores en la model card. "--" indica valor no reportado (no cero); en negrita, el mejor resultado de cada columna.

### Document parsing

| Modelo | OmniDocBench1.6 | MDPBench | PureDocBench | Real5-OmniDocBench |
|---|---:|---:|---:|---:|
| Qwen3.5-OCR | 91.27 | 60.60 | 68.38 | 82.48 |
| Qwen3.8-Max | 93.70 | 86.40 | 80.56 | 86.86 |
| GLM-OCR | 95.22 | 67.30 | 63.34 | 90.32 |
| PaddleOCR-VL-1.6 | 96.34 | 78.90 | 65.44 | 93.19 |
| MonkeyOCRv2-B-Parsing | 91.57 | 83.30 | 64.91 | 89.22 |
| OvisOCR2 | 96.58 | 69.00 | 75.10 | 92.29 |
| HunyuanOCR-1.5 | 94.74 | 76.80 | 67.58 | 88.53 |
| Xiaomi-OCR-0 | **96.83** | 73.00 | 74.60 | 92.73 |
| **OvisOCR3** | 96.74 | **88.80** | **82.31** | **93.63** |

### OCR general

| Modelo | OCRBench | OCRBench v2 EN | OCRBench v2 ZH |
| --- | ---: | ---: | ---: |
| Qwen3.5-0.8B | 79.1 | 41.5 | 43.9 |
| Qwen3.5-2B | 85.4 | 48.1 | 55.4 |
| Qwen3.5-4B | 85.0 | 54.1 | 61.0 |
| Qwen3.5-OCR | 76.8 | 44.5 | 43.8 |
| PaddleOCR-VL-1.6 | 55.9 | 23.8 | 30.4 |
| HunyuanOCR-1.5 | 86.1 | 50.7 | 57.7 |
| GLM-OCR | 83.8 | 32.9 | 48.1 |
| Xiaomi-OCR-0 | 84.6 | 40.1 | 48.4 |
| **OvisOCR3** | **88.8** | **65.9** | **61.3** |

### Extracción de información clave (KIE)

| Modelo | OCRBench KIE | OCRBench v2 KIE | CC-OCR KIE | In-house KIE Bench |
| --- | ---: | ---: | ---: | ---: |
| Qwen3.5-OCR | 78.50 | 72.90 | 88.43 | 59.90 |
| GLM-OCR | 79.00 | 74.22 | 68.36 | 75.25 |
| HunyuanOCR-1.5 | 81.00 | 68.63 | 66.08 | 75.96 |
| Xiaomi-OCR-0 | 76.50 | 74.66 | 79.53 | 75.68 |
| **OvisOCR3** | **90.50** | **83.01** | **88.69** | **77.73** |

### Descripción de figuras documentales

| Modelo | DocFigCapBench Localization F1 | DocFigCapBench Caption Score |
| --- | ---: | ---: |
| HunyuanOCR-1.5 | 48.24 | -- |
| Qwen3.5-OCR | 78.47 | 4.74 |
| OvisOCR2 | 82.18 | -- |
| MinerU2.5-Pro | 85.00 | 4.61 |
| PaddleOCR-VL-1.6 | 85.32 | 4.29 |
| Qwen3.8-Max | 86.67 | **7.30** |
| **OvisOCR3** | **90.97** | 6.93 |

### Reconstrucción de tablas multipágina

| Modelo | CrossTabBench Relation F1 (P/R) | CrossTabBench Reconstruction TEDS | MPDocBench-Parse Truncated Table TEDS |
| :--- | ---: | ---: | ---: |
| PaddleOCR-VL-1.6 | 42.61 (90.13/27.90) | 24.24 | 83.39 |
| Logics-Parsing-V3 | 44.55 (90.63/29.53) | 26.10 | 88.05 |
| MinerU2.5-Pro | 59.14 (93.81/43.18) | 41.02 | 91.44 |
| MinerU2.5-Pro + MinerU-PoPo | 54.76 (97.40/38.09) | 36.42 | 91.87 |
| Qwen3.8-Max | 94.47 (90.19/99.19) | **91.71** | 89.57 |
| **OvisOCR3** | **97.07** (96.20/97.96) | 89.66 | **92.04** |

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos ocupan ~1,7 GB en precisión media; añadiendo caché KV y overhead de vLLM (el ejemplo usa `gpu_memory_utilization=0.8`), la huella total se estima en torno a 4-6 GB. No hay cifra oficial publicada.
- GPU recomendadas: cualquier GPU moderna con 8 GB o más es suficiente según la documentación disponible; el ejemplo usa una sola GPU (`tensor_parallel_size=1`) y no se mencionan A100 ni H100 como requisito.
- Consumer GPUs: sí, cabe con holgura en tarjetas de consumo como RTX 4060 (8 GB), RTX 3060 (12 GB) o RTX 4090; una tarjeta de 6 GB podría quedar justa con vLLM por su reserva previa de memoria.
- Opciones de despliegue: vLLM (el ejemplo fija la versión 0.22.1 y el backend Triton para el prefill GDN), librería transformers, HF Inference Endpoints (tag `endpoints_compatible`) y demo en HF Spaces. No hay pesos en GGUF, por lo que llama.cpp y Ollama no están soportados de forma documentada.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

Alternativas de la misma categoría (OCR y document parsing multimodal). Los parámetros, la licencia y el contexto de los competidores no constan en la información disponible.

| Modelo | Parámetros | OmniDocBench1.6 | OCRBench | OCRBench v2 EN | OCRBench KIE | Licencia |
|---|---|---:|---:|---:|---:|---|
| OvisOCR3 | 853 M | 96.74 | 88.8 | 65.9 | 90.50 | Apache 2.0 |
| Qwen3.5-OCR | no disponible | 91.27 | 76.8 | 44.5 | 78.50 | no disponible |
| HunyuanOCR-1.5 | no disponible | 94.74 | 86.1 | 50.7 | 81.00 | no disponible |
| PaddleOCR-VL-1.6 | no disponible | 96.34 | 55.9 | 23.8 | -- | no disponible |

Notas: Xiaomi-OCR-0 supera ligeramente a OvisOCR3 en OmniDocBench1.6 (96.83 frente a 96.74), y Qwen3.8-Max obtiene mejores puntuaciones en DocFigCapBench Caption Score (7.30 frente a 6.93) y en CrossTabBench Reconstruction TEDS (91.71 frente a 89.66). La propia serie Qwen3.5 sin especializar (0.8B, 2B y 4B) queda claramente por detrás en las tareas de OCR general.

## Limitaciones y advertencias

- Los resultados de benchmarks proceden de la evaluación de los propios autores; no hay verificación independiente disponible.
- Modelo muy reciente (creado el 21 de octubre de 2026) y con solo 7 descargas registradas en HuggingFace, por lo que la validación comunitaria es prácticamente inexistente.
- La ventana de contexto no está publicada; el ejemplo documentado limita la entrada a 2 imágenes por prompt (parámetro de vLLM, posiblemente ampliable, pero sin documentación al respecto).
- Sin lista oficial de idiomas soportados: los benchmarks cubren inglés y chino, y el rendimiento en español no está documentado, lo que exige evaluación propia antes de uso en castellano.
- Dependencia de una versión muy concreta de vLLM (0.22.1) y del backend Triton para el prefill GDN, lo que puede complicar la integración en entornos con otras versiones.
- No hay cuantizaciones oficiales ni GGUF: el despliegue en CPU o dispositivos edge no está documentado.
- Riesgos inherentes a los modelos de OCR: posible transcripción errónea de texto degradado o manuscrito y riesgo de alucinación en KIE cuando un campo solicitado no aparece en la imagen; se recomiendan validaciones de salida en producción. No se publican mediciones específicas de alucinación.
- En caption score de figuras y en TEDS de tablas cruzadas queda por detrás de Qwen3.8-Max, relevante si esas tareas son críticas.
- La licencia Apache 2.0 permite el uso comercial sin restricciones conocidas.

## Enlaces

- Ficha del modelo: https://huggingface.co/ATH-MaaS/OvisOCR3
- Demo online (HF Spaces): https://huggingface.co/spaces/ATH-MaaS/OvisOCR3
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Prompts de tarea en el repositorio: https://huggingface.co/ATH-MaaS/OvisOCR3/tree/main/prompts
- Paper técnico: no disponible
