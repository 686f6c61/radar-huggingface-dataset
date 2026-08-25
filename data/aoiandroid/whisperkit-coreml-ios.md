# aoiandroid/whisperkit-coreml-ios

## Resumen

El repositorio `aoiandroid/whisperkit-coreml-ios` contiene bundles de modelos CoreML compilados específicamente para iOS, basados en los pesos de Whisper de OpenAI y preparados para su uso con WhisperKit, un paquete Swift que integra el reconocimiento de voz automático (ASR) de Whisper con el framework CoreML de Apple. Este repositorio es una variante "iOS" de los bundles de `argmaxinc/whisperkit-coreml`, con la misma estructura de carpetas (`AudioEncoder.mlmodelc`, `TextDecoder.mlmodelc`, `MelSpectrogram.mlmodelc`, y opcionalmente `TextDecoderContextPrefill.mlmodelc`), pero compilados para evitar que iOS rechace un árbol de `coremlcompiler` de macOS. La licencia es MIT y el tamaño del repositorio es de 1.6 GB.

El modelo está diseñado para ejecutarse completamente en el dispositivo (on-device) en dispositivos Apple, lo que permite el reconocimiento de voz sin conexión a la nube, con privacidad y baja latencia. Está orientado a desarrolladores de aplicaciones iOS que quieran integrar transcripción de audio en tiempo real o traducción de voz (el tag "translateblue" sugiere una aplicación específica de traducción). No se proporcionan detalles sobre el tamaño del modelo, la arquitectura interna ni los datos de entrenamiento, ya que es una compilación de pesos existentes.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Whisper (Transformer encoder-decoder) compilado a CoreML |
| Parámetros totales | no disponible (depende de la variante, no se especifica) |
| Parámetros activos | no aplicable (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (los modelos CoreML suelen usar FP16 o Int8, pero no se indica) |
| Idiomas soportados | no disponible (Whisper originalmente soporta 99 idiomas, pero no se confirma) |
| Licencia | MIT |
| Formato de pesos | `.mlmodelc` (CoreML modelo compilado) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Whisper, un modelo de reconocimiento de voz basado en Transformer encoder-decoder desarrollado por OpenAI. Sin embargo, este repositorio no contiene los pesos originales de Whisper, sino una conversión a CoreML realizada por Argmax Inc. (repositorio `argmaxinc/whisperkit-coreml`) y posteriormente compilada para iOS por el autor de este repositorio. La compilación específica para iOS evita problemas de compatibilidad con el compilador CoreML de macOS, que puede rechazar modelos compilados en otra plataforma. No se proporciona información sobre el entrenamiento del modelo original (datos, número de tokens, técnicas como RLHF o DPO), ya que este repositorio solo redistribuye los pesos compilados. La innovación técnica reside en la adaptación a CoreML para inferencia eficiente en dispositivos Apple, aprovechando la Apple Neural Engine (ANE) cuando está disponible.

## Capacidades

- Reconocimiento automático de voz (ASR) en inglés y otros idiomas, según las capacidades del modelo Whisper original, aunque no se confirma la lista completa.
- Traducción de voz a texto en otro idioma (función de traducción de Whisper, indicada por el tag "translateblue").
- Inferencia 100% local en dispositivo, sin conexión a internet ni envío de datos a servidores externos.
- Compatibilidad con el framework WhisperKit, que permite integración en aplicaciones Swift y SwiftUI.
- Procesamiento de audio en tiempo real o en lote, dependiendo de la implementación de WhisperKit.
- Soporte para modelos de varios tamaños (variantes de Whisper, como tiny, base, small, medium, large) aunque no se especifica cuáles están incluidos en este repositorio.

## Casos de uso

- Transcripción de voz en aplicaciones iOS de notas o dictado: el usuario graba audio y la aplicación lo transcribe en tiempo real, sin salir del dispositivo, garantizando privacidad.
- Traducción de voz en tiempo real para viajeros: la aplicación captura el habla en un idioma y la traduce a otro, aprovechando la función de traducción de Whisper, todo en local.
- Asistentes de voz en aplicaciones de terceros: integración con Siri o con asistentes propios que requieren reconocimiento de voz sin depender de servicios en la nube.
- Accesibilidad: transcripción de audio para personas con discapacidad auditiva en aplicaciones de mensajería o videollamadas, con procesamiento en el dispositivo.
- Análisis de reuniones en iOS: grabación de reuniones y generación de transcripciones en tiempo real, con la ventaja de no enviar datos sensibles a servidores.
- Traducción de contenido multimedia en apps de streaming: subtítulos generados automáticamente en el idioma del usuario, usando el modelo de traducción, todo en el dispositivo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio no incluye métricas de calidad (WER, CER) ni comparativas con otros modelos de ASR. La eficiencia depende del dispositivo Apple concreto (iPhone, iPad) y del tamaño de la variante de Whisper utilizada.

## Requisitos de hardware

- Dispositivos Apple con iOS 15 o superior (probablemente, aunque no se especifica la versión mínima).
- Compatible con Apple Neural Engine (ANE) para aceleración, presente en iPhone 8 y posteriores, iPad con chip A12 o superior.
- Memoria RAM variable según la variante de Whisper: las variantes pequeñas (tiny, base) requieren menos de 500 MB de RAM, mientras que las grandes (large) pueden superar los 2 GB.
- Espacio en disco: el repositorio completo ocupa 1.6 GB, pero la aplicación puede incluir solo una variante (por ejemplo, la variante base ocupa alrededor de 300 MB).
- No se recomienda usar en dispositivos sin ANE (iPhone 7 o anteriores), pues el rendimiento sería muy lento.
- Opciones de despliegue: integración mediante Swift Package Manager (WhisperKit) o manualmente con los `.mlmodelc` en el proyecto Xcode.
- Latencia estimada: en dispositivos modernos, la transcripción de un audio de 10 segundos puede tardar entre 0.5 y 2 segundos, dependiendo del tamaño del modelo y la longitud del audio. No se dispone de datos oficiales.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en el mismo formato (CoreML para iOS) ni sobre alternativas directas en el mismo contexto. Se podría comparar con el repositorio original `argmaxinc/whisperkit-coreml` (que incluye modelos para macOS y iOS) o con otros adaptadores de Whisper a CoreML, pero no se proporcionan datos de rendimiento ni especificaciones detalladas. Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- No se especifica qué variantes de Whisper están incluidas (tiny, base, small, medium, large). El usuario debe revisar la estructura de carpetas para conocerlas.
- El modelo está compilado para iOS; no es compatible directamente con macOS (hay un repositorio hermano para macOS).
- La licencia MIT es permisiva, pero los pesos de Whisper originales tienen su propia licencia (MIT también), por lo que no hay restricciones comerciales conocidas.
- No se garantiza el rendimiento en dispositivos antiguos o con poca memoria; la ejecución puede fallar si no hay suficiente RAM.
- La compilación CoreML puede tener una precisión ligeramente menor que el modelo original en PyTorch, debido a la cuantización o conversión de formatos.
- El reconocimiento de voz puede fallar en entornos ruidosos o con acentos no representados en el entrenamiento original de Whisper.
- No hay información sobre sesgos, pero Whisper original tiene sesgos conocidos en ciertos acentos y dialectos, y puede alucinar palabras en silencios o audio de baja calidad.
- La licencia MIT permite uso comercial, pero no se ofrecen garantías sobre el mantenimiento o soporte.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/aoiandroid/whisperkit-coreml-ios
- Repositorio de pesos originales (Argmax): https://huggingface.co/argmaxinc/whisperkit-coreml
- Repositorio espejo de Argmax en aoiandroid: https://huggingface.co/aoiandroid/argmaxinc-whisperkit-coreml-mirror
- GitHub de WhisperKit (fuente oficial): https://github.com/leetesla/WhisperKit
- Tutorial de integración de WhisperKit CoreML (en inglés): https://aiindigo.com/tutorials/getting-started-with-whisperkit-coreml-privacy-first-on-device-speech-recognitio
- GitHub de WhisperKit (fork de vshapenko): https://github.com/vshapenko/WhisperKit
