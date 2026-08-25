# aoiandroid/omni-asr-coreml-ios

## Resumen

`aoiandroid/omni-asr-coreml-ios` es un paquete de modelos de reconocimiento de voz automático (ASR) compilado específicamente para la plataforma iOS mediante CoreML. Se trata de una distribución on-device de los modelos Omni-ASR de Meta, adaptados para ejecutarse íntegramente en el Neural Engine (ANE) de los dispositivos Apple, sin dependencia de servicios en la nube. El repositorio está mantenido por el usuario `aoiandroid` y forma parte de la infraestructura de TranslateBlue, una aplicación de traducción y transcripción.

El paquete incluye árboles compilados `.mlmodelc` del modelo CTC (Connectionist Temporal Classification) de Omni-ASR, junto con un modelo de lenguaje (LLM) de decodificación que puede ser de 300M o 1B parámetros, además de un `vocabulary.json` compartido para la decodificación. La licencia es MIT, lo que facilita su integración en proyectos comerciales. El repositorio ocupa 9.0 GB y está pensado para iOS 17 o superior y macOS 14 o superior.

La relevancia de este modelo radica en su carácter multilingüe y en su capacidad para funcionar completamente en el dispositivo, lo que lo hace adecuado para aplicaciones de transcripción y traducción de voz con requisitos estrictos de privacidad, latencia y funcionamiento sin conexión.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CTC (wav2vec2) para el encoder + LLM de decodificación (300M o 1B parámetros) |
| Parametros totales | no disponible (el modelo CTC no tiene parámetros publicados en esta información; el LLM del decoder puede ser de 300M o 1B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | FP16 e INT8 (según las variantes `omni-asr-coreml-fp16` y `omni-asr-coreml-int8`) |
| Idiomas soportados | multilingüe (omnilingüe según el tag), lista completa no disponible |
| Licencia | MIT |
| Formato de pesos | `.mlmodelc` (CoreML), `vocabulary.json` |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Omni-ASR de Meta, publicada en el artículo arXiv 2305.16616. La parte de reconocimiento acústico utiliza una red CTC basada en wav2vec2, que produce una secuencia de tokens de audio. Para la decodificación se emplea un modelo de lenguaje (LLM) de 300M o 1B parámetros, que convierte la secuencia de tokens en texto transcrito.

La versión de este repositorio está compilada para CoreML: el modelo CTC se re-hospeda como árbol compilado (`.mlmodelc`) porque no existe un `.mlpackage` oficial en HuggingFace, mientras que el LLM se compila desde `.mlpackage` usando `coremltools` (para iOS) o `coremlcompiler` (para macOS). La especialización de la caché del ANE (Apple Neural Engine) se gestiona localmente en cada dispositivo, lo que permite optimizar la inferencia sin depender de servicios externos.

No se dispone de información sobre el dataset de entrenamiento ni sobre el proceso de entrenamiento específico de esta compilación, ya que se trata de una adaptación de los modelos Omni-ASR originales.

## Capacidades

- Reconocimiento de voz automático (ASR) multilingüe, con soporte para múltiples idiomas (lista completa no disponible).
- Ejecución totalmente on-device mediante el Apple Neural Engine (ANE), sin conexión a la nube.
- Compilado para iOS 17+ y macOS 14+ con CoreML.
- Incluye un LLM de decodificación de 300M o 1B parámetros para mejorar la precisión de la transcripción.
- Soporte para cuantización FP16 e INT8, permitiendo elegir entre precisión y rendimiento.
- Integración con Swift Package (OmniASRKit) para facilitar el uso en aplicaciones iOS y macOS.
- Vocabulario compartido (`vocabulary.json`) que permite la decodificación consistente entre los distintos componentes.

## Casos de uso

- **Transcripción de voz en aplicaciones de notas**: un desarrollador puede integrar el modelo en una app de notas para iOS que transcriba dictados de voz en tiempo real, aprovechando la ejecución en ANE para minimizar la latencia y garantizar que los datos no salgan del dispositivo.
- **Asistente de voz para accesibilidad**: se puede usar para crear un asistente de voz on-device para personas con discapacidad visual o motora, donde la privacidad de las conversaciones es crítica y no se permite el envío de audio a servidores externos.
- **Subtitulado automático en apps de vídeo**: el modelo puede generar subtítulos en tiempo real para vídeos grabados con la cámara del iPhone, sin necesidad de conexión a internet, lo que es útil en entornos con conectividad limitada.
- **Traducción de voz en tiempo real**: gracias a su carácter multilingüe, se puede construir una app de traducción de conversaciones que funcione completamente en el dispositivo, útil para viajeros o reuniones internacionales con requisitos de privacidad.
- **Soporte de atención al cliente en apps**: integración en un asistente virtual de una aplicación bancaria o de servicios, donde la transcripción de consultas de voz se procesa localmente para cumplir normativas de protección de datos.
- **Grabación y transcripción de reuniones**: una app de productividad que grabe reuniones y genere actas automáticas, con la ventaja de que la transcripción se realiza en el dispositivo, lo que evita la filtración de información confidencial.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos de rendimiento comparativo con otros modelos de ASR en la documentación del repositorio ni en los resultados de búsqueda web. Se recomienda realizar pruebas propias en los dispositivos objetivo para evaluar la latencia y la precisión.

## Requisitos de hardware

- **Dispositivos**: requiere un iPhone o iPad con iOS 17 o posterior, o un Mac con macOS 14 o posterior.
- **Ejecución**: utiliza el Apple Neural Engine (ANE) para la inferencia, sin necesidad de GPU dedicada ni VRAM.
- **Almacenamiento**: el repositorio ocupa 9.1 GB, aunque el tamaño del modelo en el dispositivo puede variar según la cuantización (FP16 o INT8) y la versión del LLM (300M o 1B).
- **Memoria**: la memoria RAM necesaria depende del modelo elegido; el modelo de 1B parámetros requerirá más memoria que el de 300M.
- **Despliegue**: se integra mediante CoreML y el Swift Package OmniASRKit, que facilita la incorporación en proyectos Xcode.
- **Latencia**: no se especifican valores de latencia, pero la ejecución en ANE suele ser inferior a la de GPU en dispositivos Apple, especialmente para modelos pequeños.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Omni-ASR (CoreML, este) | CTC + LLM decoder | 300M o 1B (LLM) | no disponible | MIT | CoreML para iOS/macOS |
| Whisper (OpenAI) | Transformer encoder-decoder | 39M a 1550M | 30 segundos de audio | MIT | PyTorch, CoreML, ONNX, etc. |
| Vosk | Kaldi / CNN | 50M a 300M | no disponible | Apache 2.0 | Múltiples plataformas |

No se dispone de datos de rendimiento comparativo (WER, CER, etc.) entre estos modelos en la información proporcionada. La ventaja de Omni-ASR CoreML es su ejecución on-device en Apple Silicon y su licencia MIT, mientras que Whisper ofrece más tamaños y Vosk es más ligero pero con menos idiomas.

## Limitaciones y advertencias

- **Sesgos y alucinaciones**: no se han publicado estudios sobre sesgos del modelo en esta compilación; como modelo de ASR, puede presentar errores en la transcripción de acentos, ruido de fondo o habla no nativa.
- **Idiomas**: aunque es multilingüe, la lista completa de idiomas soportados no está documentada en el repositorio; es recomendable verificar el soporte para el idioma objetivo.
- **Dependencia de Apple**: el modelo está compilado exclusivamente para CoreML y ANE; no es portable a otras plataformas sin recompilación.
- **Tamaño del repositorio**: 9.1 GB, lo que puede ser excesivo para aplicaciones con espacio limitado; se recomienda usar la cuantización INT8 y el LLM de 300M para reducir el peso.
- **Licencia**: aunque la licencia es MIT, el modelo original de Meta Omni-ASR se publicó bajo licencia CC-BY-NC-4.0 según la página de la variante FP16, lo que podría implicar restricciones de uso comercial para el modelo subyacente. Es necesario verificar la licencia exacta de los pesos originales.
- **Sin benchmarks**: la ausencia de resultados de evaluación dificulta la comparación objetiva con otros modelos de ASR.

## Enlaces

- [Repositorio en Hugging Face](https://huggingface.co/aoiandroid/omni-asr-coreml-ios)
- [Variante FP16 del CTC](https://huggingface.co/aoiandroid/omni-asr-coreml-fp16)
- [Variante INT8 del CTC](https://huggingface.co/aoiandroid/omni-asr-coreml-int8)
- [Swift Package OmniASRKit en GitHub](https://github.com/ChipCracker/OmniASRKit)
- [Modelos CTC CoreML de ChipCracker](https://huggingface.co/ChipCracker/omni-asr-coreml)
- [Artículo de Omni-ASR (arXiv:2305.16616)](https://arxiv.org/abs/2305.16616)
