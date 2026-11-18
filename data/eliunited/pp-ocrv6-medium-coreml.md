# eliunited/pp-ocrv6-medium-coreml

## Resumen

`eliunited/pp-ocrv6-medium-coreml` es una conversión a Core ML (en precisión fp16) de los modelos PaddleOCR PP-OCRv6 en su variante medium, concretamente los módulos de detección de texto (`PP-OCRv6_medium_det_onnx`) y de reconocimiento de texto (`PP-OCRv6_medium_rec_onnx`) publicados por PaddlePaddle. No se trata de un modelo de lenguaje generativo, sino de un pipeline OCR de dos etapas empaquetado para su ejecución nativa en el ecosistema Apple mediante Core ML.

El modelo resuelve el problema de ejecutar OCR de alta calidad en dispositivos Apple (macOS, iOS, iPadOS) sin depender de runtimes de Python ni de ONNX Runtime, aprovechando la aceleración por hardware de Neural Engine y GPU a través de Core ML. El repositorio ocupa aproximadamente 0,1 GB, lo que refleja un modelo compacto orientado a inferencia en dispositivo.

Es relevante para desarrolladores que necesitan integrar detección y reconocimiento de texto en aplicaciones nativas de Apple con licencia Apache 2.0, sin restricciones de uso comercial. La información pública disponible es muy limitada: el autor no ha publicado detalles sobre el proceso de conversión, métricas de rendimiento ni idiomas soportados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pipeline OCR de dos etapas (detección + reconocimiento) basado en PP-OCRv6 medium, convertido a Core ML |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; modelo de visión) |
| Tipos de cuantizacion | fp16 (única precisión publicada) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | Core ML (`.mlpackage`/`.mlmodel`); modelos base en ONNX |
| Tamano del repositorio | ~0,1 GB |
| Libreria | coreml |
| Modelo base | PaddlePaddle/PP-OCRv6_medium_det_onnx (commit 6132380), PaddlePaddle/PP-OCRv6_medium_rec_onnx (commit 50c7eac) |

## Arquitectura y entrenamiento

El modelo es una conversión, no un entrenamiento propio. Se compone de dos submodelos de la familia PP-OCRv6 medium de PaddleOCR: un detector de regiones de texto y un reconocedor de secuencias de caracteres. Ambos fueron originalmente publicados en formato ONNX por PaddlePaddle y convertidos a Core ML en fp16 por el autor `eliunited`, fijando los commits concretos de los modelos base para garantizar reproducibilidad.

No se dispone de información sobre la arquitectura interna exacta (backbone, cabezas de detección o módulo de reconocimiento CTC/attention), el volumen de datos de entrenamiento ni si hubo ajuste fino adicional. La model card únicamente documenta la procedencia de los pesos y la precisión de la conversión. La innovación técnica principal es el empaquetado para Core ML, que permite ejecución con aceleración por Neural Engine en hardware Apple.

## Capacidades

- Detección de regiones de texto en imágenes (módulo det).
- Reconocimiento de texto a partir de las regiones detectadas (módulo rec).
- Ejecución nativa en el ecosistema Apple mediante Core ML (macOS, iOS, iPadOS).
- Inferencia en fp16 con aceleración por Neural Engine y GPU.
- No se documenta soporte de tool calling, agentes ni razonamiento multi-paso (no aplica a un modelo OCR).
- Capacidades multilingües: no disponible en la información proporcionada.
- No se documentan capacidades de visión general, audio ni modo "thinking".

## Casos de uso

- Digitalización de documentos en apps iOS/macOS: el pipeline det+rec permite extraer texto de facturas, recibos y formularios escaneados directamente en el dispositivo, sin enviar imágenes a servidores externos.
- Escaneo de tarjetas de visita: integración en una app de contactos que detecte y reconozca nombre, teléfono y correo a partir de una foto, aprovechando la inferencia local en Neural Engine.
- Accesibilidad: lectura en voz alta de texto impreso para usuarios con discapacidad visual, con latencia baja al ejecutarse en dispositivo.
- Procesamiento de matrículas o señalización: detección y reconocimiento de texto en imágenes capturadas por cámara en apps de campo, con licencia Apache 2.0 que permite uso comercial.
- Extracción de texto en pipelines de digitalización de archivos: integración en herramientas de escritorio macOS para indexar PDFs e imágenes escaneadas sin dependencias de Python.
- Traducción asistida por cámara: captura de texto en imágenes y envío del resultado reconocido a un servicio de traducción, manteniendo la etapa OCR local por privacidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de precisión, latencia ni comparativas con otros modelos.

## Requisitos de hardware

- VRAM estimada: no disponible; el modelo está pensado para memoria unificada en hardware Apple, no para GPU discretas.
- GPU recomendadas: hardware Apple con Neural Engine (chips M1/M2/M3/M4 y posteriores) o GPU integrada compatible con Core ML.
- Cabe en hardware de consumo: sí, el repositorio ocupa ~0,1 GB y está diseñado para ejecución en dispositivo.
- Opciones de despliegue: Core ML (framework nativo de Apple); no se documenta soporte de vLLM, llama.cpp, Ollama ni TGI (no aplican a este tipo de modelo).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Formato | Licencia | Contexto/entrada | Disponibilidad |
|---|---|---|---|---|---|
| eliunited/pp-ocrv6-medium-coreml | OCR det+rec | Core ML fp16 | Apache 2.0 | Imagen | Hugging Face |
| PaddlePaddle/PP-OCRv6_medium_det_onnx | Detección OCR | ONNX | no disponible en la información | Imagen | Hugging Face |
| PaddlePaddle/PP-OCRv6_medium_rec_onnx | Reconocimiento OCR | ONNX | no disponible en la información | Imagen | Hugging Face |
| Apple Vision (OCR nativo) | OCR integrado | Framework del sistema | Propietaria | Imagen | SDK de Apple |

La comparativa se limita a los modelos base y a la alternativa nativa de Apple; no se dispone de datos de rendimiento para comparar precisión ni velocidad.

## Limitaciones y advertencias

- La información pública es mínima: no hay métricas de precisión, idiomas soportados ni detalles de la conversión.
- Al ser una conversión a fp16, puede existir una ligera pérdida de precisión respecto a los modelos ONNX originales; no cuantificada.
- Solo ejecutable en el ecosistema Apple; no es portable a Linux, Windows o Android sin reconversión.
- Riesgo de errores de reconocimiento en textos manuscritos, fuentes poco habituales o imágenes de baja calidad; no documentado por el autor.
- Sesgos: no disponibles; al ser un modelo OCR, los sesgos dependerían de los datos de entrenamiento originales de PaddleOCR, no especificados.
- Licencia Apache 2.0 permite uso comercial, pero conviene verificar la licencia de los modelos base de PaddlePaddle antes de redistribuir.
- Sin descargas ni validación comunitaria (0 descargas, 0 likes); no hay evidencia de uso en producción.

## Enlaces

- Hugging Face: https://huggingface.co/eliunited/pp-ocrv6-medium-coreml
- Modelo base detección: https://huggingface.co/PaddlePaddle/PP-OCRv6_medium_det_onnx
- Modelo base reconocimiento: https://huggingface.co/PaddlePaddle/PP-OCRv6_medium_rec_onnx
- Commit del detector: 61323801669c338b7891481ec7bac61ce31b576a
- Commit del reconocedor: 50c7eacafc52fa7bcf4194e8cd08e46f8558504b
