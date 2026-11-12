# alenisaw/turkicocr-svtrv2-b-onnx

## Resumen

TurkicOCR-SVTRv2-B (ONNX FP32) es la exportación de producción del modelo de reconocimiento óptico de caracteres TurkicOCR-SVTRv2-B, desarrollado por Alen Issayev y Aidana Zhalgas y publicado en el congreso AIST 2026 (Springer LNCS). Se trata de un reconocedor de líneas de texto basado en la arquitectura SVTRv2, especializado en escritura cirílica para kazajo (kk), kirguís (ky) y ruso (ru). El modelo resuelve el problema del OCR de baja latencia en lenguas túrquicas con alfabeto cirílico, un nicho escasamente cubierto por los motores OCR comerciales y por los modelos genéricos entrenados mayoritariamente en latín.

Esta variante concreta es un export ONNX en FP32 pensado para inferencia multiplataforma en CPU y GPU sin dependencia de PyTorch, lo que facilita su despliegue en entornos de producción ligeros. El repositorio ocupa aproximadamente 0,1 GB, lo que confirma que se trata de un modelo compacto orientado a reconocimiento de líneas individuales y no a detección de layout completo. La entrada esperada es un tensor de forma `(batch_size, 3, 48, 640)` normalizado en el rango `[-0.5, 0.5]`.

El modelo es relevante ahora porque cubre una laguna práctica: el OCR de documentos en kazajo y kirguís, idiomas con millones de hablantes y con abundante documentación histórica y administrativa en cirílico. Su licencia Apache 2.0 y su formato ONNX lo hacen apto para integración comercial y para pipelines de digitalización a gran escala sin ataduras de framework.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SVTRv2 (reconocimiento de texto por líneas, vision transformer/CNN híbrido según la familia SVTR) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, entrada de imagen 3x48x640) |
| Tipos de cuantizacion | FP32 en esta variante; existe una variante INT8 separada (`turkicocr-svtrv2-b-int8`) |
| Idiomas soportados | kazajo (kk), kirguís (ky), ruso (ru) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX |
| Entrada | Tensor float32 `(batch_size, 3, 48, 640)`, normalizado en `[-0.5, 0.5]` |
| Librería | openocr (con inferencia vía onnxruntime) |
| Tamaño del repositorio | ~0,1 GB |

## Arquitectura y entrenamiento

El modelo se basa en SVTRv2, una familia de reconocedores de texto escénico que combina extracción de características convolucionales con módulos de atención tipo transformer para modelar dependencias contextuales a lo largo de la línea de texto. La salida es una secuencia de caracteres correspondiente a una línea de imagen de 48 píxeles de alto y 640 de ancho, lo que sitúa al modelo en la categoría de reconocedores line-grounded: requiere que un detector previo recorte las líneas antes de la transcripción.

El entrenamiento se realizó sobre el dataset `alenisaw/turkicocr-cyrillic`, un corpus propio de líneas en cirílico para kazajo, kirguís y ruso. La model card declara métricas de evaluación CER, WER y chrF, lo que indica una evaluación orientada a la calidad de transcripción a nivel de carácter y palabra. No se especifican en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron etapas de ajuste fino supervisado adicionales más allá del entrenamiento base; estos datos deben consultarse en el paper (LNCS, páginas 342-358).

La innovación principal de esta variante es operativa más que arquitectónica: la exportación a ONNX FP32 elimina la dependencia de PyTorch y permite ejecutar el modelo con onnxruntime en CPU, GPU y aceleradores heterogéneos, lo que reduce la huella de despliegue y simplifica la integración en servicios de digitalización.

## Capacidades

- Reconocimiento de texto en imágenes de líneas individuales en kazajo, kirguís y ruso (alfabeto cirílico).
- Transcripción de documentos escaneados, capturas y fotografías una vez recortadas las líneas.
- Inferencia multiplataforma sin PyTorch mediante onnxruntime (CPU y GPU).
- Soporte de procesamiento por lotes gracias a la dimensión `batch_size` de la entrada.
- Cuantización disponible en una variante INT8 separada para despliegues con restricciones de memoria.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso: es un modelo puramente image-to-text.
- No dispone de modo thinking, visión general, audio ni generación de texto libre.

## Casos de uso

- Digitalización de archivos administrativos en kazajo y kirguís: el modelo transcribe líneas recortadas de documentos escaneados, adecuado para proyectos de preservación documental en instituciones de Asia Central.
- Procesamiento de formularios y facturas en ruso: integrado tras un detector de líneas, permite extraer campos de texto en pipelines de automatización contable.
- OCR embebido en aplicaciones móviles o de escritorio: el export ONNX de ~0,1 GB y la inferencia en CPU sin PyTorch permiten incluirlo en clientes ligeros con onnxruntime.
- Digitalización de prensa histórica en cirílico: útil para proyectos de humanidades digitales que requieren transcripción de columnas de periódicos kazajos o kirguises.
- Extracción de texto en servidores sin GPU: la variante FP32 en CPU ofrece un punto de partida; para mayor throughput puede combinarse con la variante INT8.
- Preprocesamiento para búsqueda documental: la transcripción alimenta índices de texto completo sobre corpus multilingües de Asia Central.
- Automatización de lectura de matrículas, carteles o señalética en cirílico: con un detector previo, el reconocedor transcribe líneas cortas en entornos controlados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card declara el uso de las métricas CER, WER y chrF, pero no incluye sus valores numéricos; estos deben consultarse en el paper de AIST 2026 (LNCS, páginas 342-358, DOI 10.1007/978-3-032-41546-2_22).

## Requisitos de hardware

- VRAM estimada: no disponible con precisión; el repositorio ocupa ~0,1 GB, por lo que la huella en FP32 es del orden de decenas o pocos cientos de MB, holgada para cualquier GPU consumer.
- GPU recomendadas: cualquier GPU con soporte CUDA para onnxruntime (RTX 3060 en adelante); el modelo es lo bastante pequeño para ejecutarse en GPUs de gama baja.
- CPU: viable gracias a la exportación ONNX; onnxruntime con `CPUExecutionProvider` permite inferencia sin GPU.
- Cabe en GPU consumer: sí, con amplio margen.
- Opciones de despliegue: onnxruntime (CPU y GPU), integración con la librería openocr; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a un modelo de visión de este tipo.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idiomas | Formato | Licencia | Contexto/entrada |
|---|---|---|---|---|---|
| TurkicOCR-SVTRv2-B (ONNX FP32) | SVTRv2 | kk, ky, ru | ONNX | Apache 2.0 | imagen 3x48x640 |
| TurkicOCR-SVTRv2-B (PyTorch FP32) | SVTRv2 | kk, ky, ru | PyTorch | Apache 2.0 | imagen 3x48x640 |
| TurkicOCR-SVTRv2-B (ONNX INT8) | SVTRv2 | kk, ky, ru | ONNX | Apache 2.0 | imagen 3x48x640 |
| Tesseract (kazajo/kirguís) | LSTM/CNN clásico | multilingüe | binario propio | Apache 2.0 | línea de imagen |

La comparación con motores OCR genéricos como Tesseract o PaddleOCR no puede cuantificarse con los datos disponibles; no se han publicado métricas comparativas en la información proporcionada.

## Limitaciones y advertencias

- Modelo especializado en líneas: no realiza detección de layout ni segmentación; requiere un detector previo que recorte cada línea de texto.
- Cobertura limitada a tres idiomas cirílicos (kazajo, kirguís, ruso); el rendimiento en otros idiomas o alfabetos no está documentado.
- No se han publicado cifras de CER/WER/chrF en la información disponible, por lo que la calidad real en dominios concretos (manuscrito, baja resolución, ruido) debe validarse empíricamente.
- Riesgo de error en caracteres cirílicos visualmente similares y en texto degradado; conviene incluir revisión humana en flujos críticos.
- La variante FP32 tiene mayor huella y latencia que la INT8; para producción a gran escala puede ser preferible la cuantizada, con la consiguiente posible pérdida de precisión.
- Licencia Apache 2.0: permite uso comercial, pero conviene revisar los términos del dataset `alenisaw/turkicocr-cyrillic` si se redistribuyen datos derivados.
- No apto para tareas de generación de texto, razonamiento o agentes; su uso fuera del OCR no está soportado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/alenisaw/turkicocr-svtrv2-b-onnx
- Variante PyTorch FP32: https://huggingface.co/alenisaw/turkicocr-svtrv2-b
- Variante ONNX INT8: https://huggingface.co/alenisaw/turkicocr-svtrv2-b-int8
- Dataset: https://huggingface.co/datasets/alenisaw/turkicocr-cyrillic
- Paper (Springer LNCS): https://doi.org/10.1007/978-3-032-41546-2_22
- Repositorio GitHub: https://github.com/alenisaw/turkicocr
- Kaggle Models: https://www.kaggle.com/models/alenissayev/turkicocr-svtrv2-b
