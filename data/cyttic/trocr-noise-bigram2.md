# cyttic/trocr-noise-bigram2

## Resumen

El modelo `cyttic/trocr-noise-bigram2` es un sistema de reconocimiento óptico de caracteres (OCR) basado en la arquitectura vision-encoder-decoder, especializado en la transformación de imágenes de texto a secuencias de texto. Ha sido desarrollado por el usuario `cyttic` como un ajuste fino (fine-tuning) del modelo base `cyttic/exp2-frozen-benyehuda-cont`, del que se desconoce su origen exacto pero cuyo nombre sugiere una relación con textos hebreos (Ben Yehuda). El modelo cuenta con 299.495.168 parámetros y está publicado en formato safetensors, compatible con la librería Transformers.

La relevancia de este modelo radica en su capacidad para realizar OCR con tasas de error relativamente bajas en el conjunto de validación, con un WER de 0,0865 y un CER de 0,0311. Sin embargo, la información pública es muy limitada: no se especifican los datos de entrenamiento, el idioma objetivo ni la licencia, lo que dificulta su evaluación completa para uso en producción. A pesar de ello, su tamaño moderado y su naturaleza de modelo de OCR lo convierten en un candidato para tareas de digitalización de documentos, especialmente si el corpus está relacionado con hebreo.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | vision-encoder-decoder (probablemente TrOCR, no confirmado) |
| Parametros totales | 299.495.168 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo imagen-texto, no texto generativo) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (posible hebreo, no confirmado) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es un encoder-decoder visual, típica de modelos TrOCR, donde un encoder procesa la imagen y un decoder autoregresivo genera la secuencia de texto. El modelo base `cyttic/exp2-frozen-benyehuda-cont` fue ajustado durante 2 épocas con un tamaño de lote total de 16, una tasa de aprendizaje de 2e-05 y un scheduler lineal con warmup del 10%. No se ha revelado el dataset de entrenamiento ni el proceso de alineación (no se menciona RLHF ni DPO). El entrenamiento se realizó con Transformers 5.9.0, PyTorch 2.11.0 y Datasets 5.0.1.

La única innovación destacable es la propia tarea de OCR, pero no se documentan técnicas adicionales como decodificación especulativa o atención lineal.

## Capacidades

- Reconocimiento óptico de caracteres: convierte imágenes de texto en secuencias de texto, con métricas de error bajas en validación (CER 0,0311, WER 0,0865).
- Procesamiento de imágenes: al ser un modelo vision-encoder-decoder, acepta entradas de imagen y produce salidas de texto.
- Posible especialización en hebreo: el nombre del modelo base sugiere que podría estar entrenado para textos en hebreo, aunque no hay confirmación oficial.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, ni soporte multilingüe explícito.

## Casos de uso

- Digitalización de documentos históricos: el modelo puede transcribir imágenes de manuscritos o textos antiguos, especialmente si el corpus está en hebreo, reduciendo el trabajo manual de transcripción.
- Automatización de OCR en bibliotecas digitales: integración en pipelines de procesamiento de imágenes para convertir escaneos en texto indexable, aprovechando su baja tasa de error en validación.
- Accesibilidad: conversión de imágenes de texto (carteles, menús, documentos) a texto legible por lectores de pantalla, aunque se requiere validar el idioma soportado.
- Extracción de datos de formularios escaneados: si se ajusta con datos específicos, podría utilizarse para extraer campos concretos de documentos estructurados.
- Archivado de prensa y publicaciones: transcribir artículos de periódicos o revistas escaneados para búsqueda y análisis posterior.
- Investigación en OCR: como modelo de referencia para comparar técnicas de fine-tuning en tareas de reconocimiento de texto, dado su tamaño moderado y métricas publicadas.

## Benchmarks y rendimiento

El autor declara los siguientes resultados en el conjunto de evaluación, extraídos de la model card:

| Metrica | Valor |
|---|---|
| Loss | 0,5353 |
| CER | 0,0311 |
| WER | 0,0865 |

No se han publicado comparaciones con otros modelos ni resultados en benchmarks estándar como MMLU o HumanEval, ya que no es un modelo de lenguaje general.

## Requisitos de hardware

- VRAM estimada: con 299M parámetros, en FP16 la inferencia requiere aproximadamente 600 MB de VRAM, más overhead de activaciones. En cuantización de 8 bits podría reducirse a unos 300 MB, aunque no hay cuantizaciones oficiales publicadas.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM, incluyendo tarjetas de consumo como GTX 1060, RTX 2060 o superiores. Para entrenamiento, se usó un batch de 8, por lo que una GPU con 8-12 GB (RTX 3080, RTX 3090) sería suficiente.
- Opciones de despliegue: al ser un modelo de Transformers, puede ejecutarse con la librería `transformers` en Python, o servirse con herramientas compatibles como Hugging Face Inference Endpoints. No hay archivos GGUF ni soporte directo para llama.cpp.
- Latencia y throughput: no disponibles; dependerán del hardware y del tamaño de las imágenes de entrada.

## Comparativa con modelos similares

No se dispone de información suficiente para comparar con otros modelos de OCR como TrOCR base, Tesseract o modelos comerciales. No hay datos de rendimiento en los mismos conjuntos de validación ni especificaciones comparables publicadas. Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- Información incompleta: no se especifica el dataset de entrenamiento, el idioma soportado ni la licencia, lo que impide evaluar su idoneidad legal y técnica para uso comercial.
- Posible sesgo: al desconocer el corpus, no se pueden descartar sesgos hacia un dominio o estilo de escritura concreto.
- Riesgo de alucinación: en OCR, el modelo podría generar caracteres plausibles pero incorrectos en imágenes ambiguas o de baja calidad, aunque el CER bajo en validación sugiere cierta robustez.
- Limitaciones de idioma: si el modelo está especializado en hebreo, su rendimiento en otros alfabetos será muy limitado.
- Sin garantías de producción: al ser un modelo generado automáticamente por Trainer, la model card carece de detalles sobre casos de uso previstos y limitaciones, por lo que se recomienda validar exhaustivamente antes de integrarlo en sistemas críticos.

## Enlaces

- Página del modelo en HuggingFace: https://huggingface.co/cyttic/trocr-noise-bigram2
- Modelo base: https://huggingface.co/cyttic/exp2-frozen-benyehuda-cont
