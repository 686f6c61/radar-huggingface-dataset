# small-models-for-glam/text-page-filter

## Resumen

`text-page-filter` es un clasificador de imágenes de muy pequeño tamaño (2,5 millones de parámetros) desarrollado por la organización comunitaria Small Models for GLAM. Responde a una única pregunta sobre una página escaneada: si contiene texto de cuerpo (texto corrido, listas, tablas o índices) o no. Su propósito es filtrar páginas en proyectos de digitalización de libros y documentos históricos, descartando papel en blanco, transparencias del reverso, sellos de biblioteca, láminas con pies de foto breves y páginas con solo unas pocas líneas, antes de enviar el material a un modelo de OCR mucho más costoso.

El modelo se basa en MobileNetV4-conv-small, preentrenado en ImageNet y afinado para esta tarea binaria, con entrada de 384 × 384 píxeles en escala de grises. Está pensado para integrarse en pipelines de curación de datos (data curation) y de document AI, donde el coste computacional del OCR domina el presupuesto. Su velocidad es notable: aproximadamente 50 páginas por segundo en un solo hilo de CPU y del orden de 3.000 a 4.000 páginas por segundo en una GPU NVIDIA L4 en fp16 con lote de 64.

Su relevancia actual radica en la creciente demanda de herramientas ligeras y especializadas para instituciones culturales (galerías, bibliotecas, archivos y museos) que necesitan procesar corpus masivos de libros digitalizados con recursos limitados. La licencia Apache 2.0 y el formato safetensors facilitan su adopción en producción sin restricciones comerciales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MobileNetV4-conv-small (red convolucional, `timm`) |
| Parametros totales | 2.519.393 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de clasificación de imágenes) |
| Tipos de cuantizacion | no disponible (entrenado y evaluado en fp32 y fp16) |
| Idiomas soportados | no disponible (clasificador visual independiente del idioma; entrenado principalmente con libros impresos en inglés de los siglos XIX y XX) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería `timm`) |

## Arquitectura y entrenamiento

El modelo es una MobileNetV4-conv-small, una red neuronal convolucional diseñada para eficiencia computacional en dispositivos con recursos limitados. Parte de los pesos preentrenados de `timm/mobilenetv4_conv_small.e2400_r224_in1k` y se afina para una tarea de clasificación binaria con una única salida sigmoide denominada `not_proper_text`, que representa la probabilidad de que la página no contenga texto de cuerpo. La entrada es de 384 × 384 píxeles, con redimensionado tipo squash (sin recorte), normalización ImageNet y conversión previa a escala de grises, ya que el modelo se entrenó con páginas en gris.

El conjunto de entrenamiento se compone mayoritariamente de libros impresos de los siglos XIX y XX procedentes de la Biodiversity Heritage Library (BHL). La definición de «texto de cuerpo» empleada durante el etiquetado combina dos criterios: que un modelo de preguntas sobre páginas indique que hay texto digno de transcribir y que LightOnOCR-3-0.8B escriba al menos 100 caracteres en la página. No se dispone de información sobre el número exacto de tokens, la composición detallada del dataset ni el uso de técnicas de RLHF o DPO, que no aplican a un clasificador de este tipo.

## Capacidades

- Clasificación binaria de páginas escaneadas: distingue páginas con texto de cuerpo (texto corrido, listas, índices, tablas) de páginas sin él (papel en blanco, transparencias, sellos, láminas con pie de foto, solo número de página o encabezado).
- Salida calibrada mediante sigmoide (`not_proper_text`), con umbral recomendado de 0,5 para conservar páginas.
- Procesamiento en escala de grises, lo que reduce el coste de decodificación y normaliza variaciones de color en escaneos históricos.
- Inferencia por lotes en GPU mediante NVIDIA DALI, con decodificación de JPEG en GPU y entrada de bytes directamente.
- No soporta tool calling, agentes, razonamiento multi-paso ni generación de texto: es exclusivamente un clasificador de imágenes.
- No dispone de capacidades multilingües en sentido estricto; su funcionamiento es visual e independiente del idioma, aunque el entrenamiento se centró en impresos en inglés.
- Modelo complementario `page-ocr-flags` para la pregunta más laxa de si hay cualquier texto (incluidos pies de foto y números de página) y para indicadores de riesgo de OCR.

## Casos de uso

- Curación de corpus de texto a partir de escaneos: filtrar páginas antes de enviarlas a un OCR caro, conservando solo las que contienen texto de cuerpo y descartando papel en blanco, transparencias y sellos. El modelo actúa como prefiltro de bajo coste.
- Optimización de pipelines de OCR a gran escala: al procesar millones de páginas de libros digitalizados, descartar entre un 5 % y un 15 % de páginas no textuales reduce directamente el coste de inferencia del OCR y el almacenamiento de transcripciones.
- Digitalización en bibliotecas y archivos con recursos limitados: al ejecutarse a unas 50 páginas por segundo en un solo hilo de CPU, permite filtrar colecciones completas en hardware modesto sin depender de GPU.
- Selección de páginas para revisión humana: las páginas con puntuación cercana al umbral pueden enviarse a revisión manual, mientras que las claramente textuales o claramente vacías se procesan automáticamente.
- Construcción de datasets para entrenamiento de modelos de OCR o de lenguaje: generar corpus limpios de texto impreso de los siglos XIX y XX a partir de fondos BHL y similares, eliminando páginas no textuales que introducirían ruido.
- Control de calidad en proyectos de digitalización masiva: detectar páginas mal escaneadas, en blanco o con solo sellos, que suelen indicar errores de captura o de ordenación de los pliegos.
- Preprocesado en pipelines de document AI: integrar el clasificador como primera etapa antes de modelos de layout, OCR o extracción de información, reduciendo la carga sobre las etapas posteriores.

## Benchmarks y rendimiento

Los resultados publicados en la model card se refieren a la clasificación binaria con umbral 0,5 sobre dos conjuntos de evaluación.

| Conjunto de prueba | Métrica | Resultado |
|---|---|---|
| 2.165 páginas BHL con transcripciones de referencia: páginas de texto (≥ 80 caracteres) conservadas | Exactitud | 0,941 (3 semillas: 0,943 ± 0,010) |
| Mismas páginas: páginas vacías y de pocas líneas (< 80 caracteres) eliminadas | Exactitud | 0,986 ± 0,002 (3 semillas) |
| Mismas páginas: AUROC texto (≥ 80 caracteres) frente a vacías | AUROC | 0,999 |
| 250 páginas difíciles etiquetadas a mano: páginas no textuales eliminadas | Exactitud | 0,951 ± 0,006 (3 semillas) |
| 250 páginas difíciles: páginas textuales conservadas (definición más laxa que la del modelo) | Exactitud | 0,735 ± 0,028 (3 semillas) |
| 250 páginas difíciles: AUROC texto frente al resto | AUROC | 0,952 (ronda 1, 78 páginas), 0,935 (ronda 2, 172 páginas) |

Rendimiento de velocidad publicado:

| Configuración | Páginas por segundo |
|---|---|
| Solo modelo, 1 hilo de CPU (PyTorch, fp32) | ~50 |
| Solo modelo, 1 hilo de CPU (ONNX Runtime, fp32) | ~85 |
| Solo modelo, NVIDIA L4 (fp16, lote 64) | ~3.000–4.000 |
| JPEG de entrada decodificado en GPU con NVIDIA DALI (L4) | ~300 |
| JPEG de entrada decodificado en GPU con NVIDIA DALI (RTX PRO 6000) | ~430 |

No se han publicado comparaciones con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp16; el modelo tiene 2,5 millones de parámetros y una entrada de 384 × 384 píxeles, por lo que cabe holgadamente en cualquier GPU moderna e incluso en memoria unificada de sistemas embebidos.
- GPU recomendadas: NVIDIA L4, RTX PRO 6000, A100, H100 o cualquier GPU con soporte fp16; también funciona en CPU sin problema.
- Cabe en GPU de consumo: sí, en cualquier GPU de consumo con al menos 1 GB de VRAM (GTX 1050, RTX 3050, RTX 4090, etc.).
- Opciones de despliegue: `timm` con PyTorch, ONNX Runtime, NVIDIA DALI para pipelines de decodificación en GPU; no se mencionan vLLM, llama.cpp ni Ollama, que no aplican a un clasificador de imágenes.
- Latencia y throughput: ~50 páginas/s en un hilo de CPU con PyTorch fp32, ~85 páginas/s con ONNX Runtime, ~3.000–4.000 páginas/s en L4 fp16 con lote 64, y ~300–430 páginas/s cuando la decodificación de JPEG se realiza en GPU con DALI (el cuello de botella pasa a ser la decodificación).

## Comparativa con modelos similares

No se dispone de información sobre modelos directamente comparables en la documentación proporcionada. El modelo complementario de la misma organización, `page-ocr-flags`, aborda una pregunta relacionada pero más laxa (si hay cualquier texto, incluidos pies de foto y números de página) y añade indicadores de riesgo de OCR; no se han publicado sus especificaciones ni benchmarks en la información disponible.

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `text-page-filter` | 2,5 M | no aplica | Clasificación binaria de páginas con texto de cuerpo | Apache 2.0 | Hugging Face (`timm`) |
| `page-ocr-flags` | no disponible | no aplica | Detección de cualquier texto y riesgo de OCR | no disponible | Hugging Face |
| Otros modelos comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Entrenado mayoritariamente con libros impresos de los siglos XIX y XX de la Biodiversity Heritage Library (BHL); su comportamiento en otros dominios (manuscritos, prensa, documentos administrativos modernos, idiomas no ingleses) no está validado. Se recomienda comprobar una muestra de las propias páginas antes de confiar en él.
- La definición de «texto de cuerpo» excluye deliberadamente láminas con pies de foto breves (alrededor de 100 caracteres o menos), números de página, encabezados y medias portadas. Si el proyecto necesita conservar esos materiales, el modelo los descartará.
- Casi todas las páginas textuales que descarta son láminas con pie de foto: 88 de las 102 proceden de un volumen de láminas de conchas (mediana de 113 caracteres de transcripción de referencia). Es el comportamiento previsto, pero conviene verificar que encaja con la definición de página textual del proyecto.
- El conjunto de 250 páginas difíciles fue etiquetado por una sola persona y seleccionado deliberadamente, por lo que no es una muestra aleatoria; las métricas sobre él pueden no ser representativas.
- Riesgo de alucinación no aplica (no genera texto), pero sí existe riesgo de falsos negativos en páginas con texto de cuerpo atípico (tipografías decorativas, tablas complejas, texto muy disperso).
- Restricciones de licencia: Apache 2.0 permite uso comercial, modificación y redistribución con atribución; no se han identificado restricciones adicionales.
- Para producción, el cuello de botella suele ser la decodificación de la imagen, no el modelo; conviene planificar la decodificación en GPU (DALI) si se necesita alto rendimiento.
- El modelo espera páginas en escala de grises; alimentarlo con imágenes en color sin convertir puede degradar el rendimiento.
- No se han publicado datos sobre sesgos demográficos o culturales; al ser un clasificador visual de páginas, el riesgo principal es el sesgo hacia el material de entrenamiento (impresos históricos en inglés).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/small-models-for-glam/text-page-filter
- Organización Small Models for GLAM en Hugging Face: https://huggingface.co/small-models-for-glam/models
- Space de la organización: https://huggingface.co/spaces/small-models-for-glam/README
- Modelo complementario `page-ocr-flags`: https://huggingface.co/small-models-for-glam/page-ocr-flags
- Modelo base en `timm`: https://huggingface.co/timm/mobilenetv4_conv_small.e2400_r224_in1k
- Biodiversity Heritage Library: https://www.biodiversitylibrary.org/
