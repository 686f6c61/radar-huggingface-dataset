# opticsWolf/pp-doclayout-plus-l-onnx

## Resumen

pp-doclayout-plus-l-onnx es un repositorio de servicio (serving repo) que empaqueta el modelo de análisis de maquetación de página PP-DocLayout_plus-L de PaddleOCR en formato ONNX. No se trata de un modelo lingüístico generativo, sino de un detector de objetos basado en RT-DETR-L especializado en localizar y clasificar los distintos elementos que componen una página de documento: bloques de texto, títulos, tablas, figuras, fórmulas, encabezados, pies de página y otros, hasta un total de 20 clases. El autor, opticsWolf, publica el binario byte a byte idéntico al `inference.onnx` oficial de PaddlePaddle, junto con el fichero `labels.txt` extraído literalmente del `inference.yml` original.

El interés de este repositorio reside en la conversión a ONNX, que permite ejecutar el modelo fuera del ecosistema Paddle y desplegarlo en runtimes estándar (ONNX Runtime, TensorRT, OpenVINO) sin dependencias de PaddlePaddle. Está pensado para integrarse en pipelines de digitalización de documentos, OCR estructurado o extracción de información, donde la detección previa de la maquetación es un paso necesario para segmentar regiones antes de aplicar un motor de reconocimiento de texto.

El modelo reporta un mAP de 83,2 sobre el subconjunto de evaluación de Paddle, lo que lo sitúa como una opción madura para análisis de maquetación. El repositorio ocupa 0,1 GB y se distribuye bajo licencia Apache-2.0. No se dispone de información sobre idiomas soportados ni de parámetros totales del modelo en la documentación proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | RT-DETR-L (detector de objetos transformer, base de PP-DocLayout_plus-L) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de visión; entrada fija de 800x800 píxeles) |
| Tipos de cuantizacion | no disponible (se distribuye en ONNX en precisión original; no se documentan variantes cuantizadas) |
| Idiomas soportados | no disponible (modelo de visión independiente del idioma del texto) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (`pp_doclayout_plus_l.onnx`) + `labels.txt` |

## Arquitectura y entrenamiento

El modelo subyacente PP-DocLayout_plus-L emplea una arquitectura RT-DETR-L, un detector de objetos de tipo transformer (DETR en tiempo real) adaptado a la detección de regiones de maquetación documental. La salida es un conjunto de hasta 300 consultas (queries), cada una con la forma `[class, score, x0, y0, x1, y1]` en coordenadas de la imagen original, más un recuento de consultas. El modelo distingue 20 clases de elementos de página, definidas en `labels.txt` del repositorio original.

El preprocesado es fijo: redimensionado directo a `[1,3,800,800]`, normalización dividiendo entre 255 sin normalización ImageNet, y entradas auxiliares `im_shape` (`[[h,w]]`) y `scale_factor` (`[[800/h, 800/w]]`) para reescalar las cajas a las coordenadas originales. El umbral de operación recomendado es 0,5, coincidente con el `draw_threshold` del upstream. No se dispone de información sobre el volumen de datos de entrenamiento, la composición del dataset ni si se aplicaron técnicas de ajuste fino adicionales; el repositorio es únicamente de servicio y no documenta el proceso de entrenamiento.

## Capacidades

- Detección de maquetación de página: localiza y clasifica hasta 20 tipos de regiones (texto, títulos, tablas, figuras, fórmulas, encabezados, pies, etc.) en imágenes de documentos.
- Salida estructurada: devuelve clase, puntuación de confianza y coordenadas de caja delimitadora por cada región detectada.
- Entrada de imagen de tamaño fijo 800x800 con reescalado automático a coordenadas originales mediante `scale_factor`.
- Independiente del idioma del contenido textual (opera sobre la geometría y apariencia visual de la página, no sobre el texto).
- Ejecutable en ONNX Runtime y otros runtimes compatibles con ONNX, sin dependencia de PaddlePaddle.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni generación de texto: es un modelo puramente perceptivo de visión.
- No dispone de modo thinking, visión generativa, audio ni capacidades multilingües en el sentido lingüístico.

## Casos de uso

- Digitalización de documentos escaneados: el modelo segmenta la página en regiones antes de pasar cada bloque a un motor OCR, permitiendo reconstruir el orden de lectura y separar tablas, figuras y texto.
- Extracción de información estructurada: al identificar tablas y figuras por separado del texto corrido, se pueden enrutar esas regiones a extractores especializados (reconocimiento de tablas, análisis de imágenes) en pipelines de facturas, informes o formularios.
- Preprocesado para OCR de alta calidad: descartar encabezados y pies repetidos o aislar títulos permite mejorar la precisión y la estructura de salida de motores OCR genéricos.
- Análisis de documentos científicos: la detección de fórmulas, figuras y referencias facilita la conversión de artículos PDF a formatos estructurados (Markdown, HTML) preservando la maquetación.
- Indexación y búsqueda documental: la segmentación por regiones permite asociar metadatos de estructura a cada fragmento, mejorando la recuperación en sistemas RAG sobre documentos escaneados.
- Automatización de archivo y clasificación: en flujos de gestión documental, la detección de tipos de región ayuda a clasificar páginas (por ejemplo, distinguir páginas con tablas de páginas solo de texto) antes de procesos posteriores.
- Integración en aplicaciones de escritorio: al estar en ONNX, puede embeberse en aplicaciones nativas o de escritorio que ya usan ONNX Runtime, como demuestra el proyecto ImageTrans mediante el repositorio PP_DocLayout_ONNX.

## Benchmarks y rendimiento

| Benchmark | Resultado |
|---|---|
| mAP (subconjunto de evaluación de Paddle, PP-DocLayout_plus-L) | 83,2 |

No se han publicado en la información disponible resultados comparativos adicionales (por ejemplo, frente a otros detectores de maquetación) ni métricas de latencia o throughput.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; por el tamaño del repositorio (0,1 GB) y la arquitectura RT-DETR-L, la inferencia cabe holgadamente en GPUs de consumo, aunque no se documenta la cifra exacta.
- GPU recomendadas: cualquier GPU compatible con ONNX Runtime (CUDA) o TensorRT; no se especifican modelos concretos en la documentación.
- GPU de consumo: previsiblemente cabe en tarjetas consumer (RTX 3060, RTX 4090, etc.) dado el reducido tamaño del binario, aunque no se confirma con datos oficiales.
- Opciones de despliegue: ONNX Runtime (CPU/GPU), TensorRT, OpenVINO u otros runtimes compatibles con ONNX; también puede ejecutarse en CPU.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Clases | mAP | Licencia | Formato |
|---|---|---|---|---|---|
| pp-doclayout-plus-l-onnx (este) | RT-DETR-L | 20 | 83,2 | Apache-2.0 | ONNX |
| PaddlePaddle/PP-DocLayout_plus-L_onnx | RT-DETR-L | 20 | 83,2 | Apache-2.0 | ONNX |
| iaa2005/PP-DocLayout_plus-L_onnx | RT-DETR-L | 20 | 83,2 | Apache-2.0 | ONNX |
| PPDocLayout v3 (vía PP_DocLayout_ONNX) | no disponible | no disponible | no disponible | no disponible | ONNX |

Los tres primeros son el mismo modelo: este repositorio y el de iaa2005 son espejos del oficial de PaddlePaddle, sin cambios en los pesos. La comparativa con detectores de maquetación alternativos (por ejemplo, LayoutLMv3, DiT o Detectron2-based) no está disponible en la información proporcionada.

## Limitaciones y advertencias

- Es un modelo de visión para detección de maquetación, no un modelo de lenguaje: no genera texto ni razona sobre el contenido.
- La entrada está fijada a 800x800 píxeles; documentos con relaciones de aspecto extremas pueden sufrir pérdida de detalle tras el reescalado.
- El umbral de 0,5 es el recomendado por el upstream, pero puede requerir ajuste según el dominio.
- No se documentan sesgos específicos, pero al ser un detector entrenado sobre un conjunto concreto de documentos, su rendimiento puede degradarse en dominios no representados (documentos manuscritos, maquetaciones atípicas, idiomas con escrituras no latinas).
- Riesgo de falsos positivos y negativos en regiones pequeñas o solapadas; no se documentan métricas por clase.
- Licencia Apache-2.0 permite uso comercial, pero conviene verificar la procedencia y las condiciones del modelo original de PaddleOCR.
- El repositorio tiene 0 descargas y 0 likes, por lo que no hay validación comunitaria de su funcionamiento; se recomienda contrastar el hash sha256 indicado con el binario descargado.
- No se dispone de información sobre cuantizaciones ni sobre el rendimiento en CPU frente a GPU.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/opticsWolf/pp-doclayout-plus-l-onnx
- Modelo original de PaddlePaddle: https://huggingface.co/PaddlePaddle/PP-DocLayout_plus-L_onnx
- Espejo de iaa2005: https://huggingface.co/iaa2005/PP-DocLayout_plus-L_onnx
- Repositorio GitHub PP_DocLayout_ONNX: https://github.com/xulihang/PP_DocLayout_ONNX
