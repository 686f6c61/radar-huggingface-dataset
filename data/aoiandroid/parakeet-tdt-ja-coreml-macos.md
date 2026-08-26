# aoiandroid/parakeet-tdt-ja-coreml-macos

## Resumen

El modelo `aoiandroid/parakeet-tdt-ja-coreml-macos` es un paquete CoreML compilado para macOS, diseñado para su uso en la aplicación TranslateBlue. Se trata de una conversión del modelo Parakeet TDT 0.6B japonés de NVIDIA, un sistema de reconocimiento automático del habla (ASR) basado en la arquitectura FastConformer-TDT (Token-and-Duration Transducer). El paquete incluye el modelo ya compilado en formato `.mlmodelc`, listo para su integración en aplicaciones nativas de Apple. La relevancia actual radica en ofrecer transcripción de voz en japonés de forma local, sin conexión a la nube, aprovechando el ecosistema CoreML de macOS.

El modelo original de NVIDIA tiene 0.6 mil millones de parámetros y está especializado en ASR para japonés. Esta conversión a CoreML permite su ejecución eficiente en dispositivos Apple, con soporte de especialización para la unidad neuronal (ANE). La licencia MIT facilita su uso comercial y de investigación.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | FastConformer-TDT (Token-and-Duration Transducer) |
| Parametros totales | 0.6 B (segun el nombre del modelo original, no confirmado en la fuente) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (modelo de audio, no de texto) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Japones |
| Licencia | MIT |
| Formato de pesos | CoreML (.mlmodelc / .mlpackage) |

## Arquitectura y entrenamiento

El modelo original es un sistema ASR de NVIDIA basado en la arquitectura FastConformer-TDT, que combina un encoder FastConformer con un decodificador basado en transductores con tokens y duraciones (Token-and-Duration Transducer). Esta arquitectura permite generar transcripciones con marcas de tiempo de alta precisión. El paquete aquí presentado es una conversión a CoreML realizada por `aoiandroid`, que compila el modelo en formato `.mlmodelc` para ejecución en macOS, manteniendo la especialización para la unidad neuronal (ANE) de los dispositivos Apple. No se dispone de información adicional sobre el entrenamiento original (datos, número de tokens, etc.).

## Capacidades

- Reconocimiento automático del habla (ASR) en japonés, convirtiendo audio a texto.
- Generación de transcripciones con marcas de tiempo (token-duration transducer).
- Ejecución local en macOS mediante CoreML, sin necesidad de conexión a internet.
- Optimizado para la unidad neuronal (ANE) de Apple Silicon, reduciendo la latencia y el consumo energético.
- Formato compilado (`.mlmodelc`) para integración directa en aplicaciones Swift/Objective-C.
- Compatible con la plataforma TranslateBlue, aunque puede usarse en otras aplicaciones.

## Casos de uso

- Transcripción de reuniones en japonés: el modelo puede convertir audio de conferencias o entrevistas en texto con marcas de tiempo, facilitando la generación de actas y notas.
- Subtitulación automática de vídeos: al ejecutarse localmente, permite generar subtítulos para vídeos en japonés sin depender de servicios en la nube.
- Dictado en aplicaciones de productividad: integrado en editores de texto o correos, permite escribir mediante voz en japonés de forma eficiente.
- Traducción asistida: combinado con un motor de traducción, el modelo convierte el habla japonesa en texto, que luego se traduce a otros idiomas.
- Asistencia en centros de llamadas: análisis de conversaciones en japonés para extraer información o generar resúmenes.
- Entrenamiento de otros modelos: el texto transcrito puede usarse como datos de entrenamiento para sistemas de NLP en japonés.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se dispone de métricas de precisión (WER, CER) ni de comparativas con otros modelos ASR para japonés.

## Requisitos de hardware

- Diseñado para macOS con CoreML, preferiblemente en dispositivos con chip Apple Silicon (M1, M2, M3, etc.) para aprovechar la aceleración ANE.
- El tamaño del modelo es de aproximadamente 0.6 B parámetros, por lo que la memoria necesaria es modesta. En un Mac con 8 GB de RAM unificada se puede ejecutar sin problemas.
- No se requieren GPUs dedicadas; la inferencia se realiza mediante el framework CoreML.
- El paquete ya está compilado en `.mlmodelc`, por lo que no se necesita un paso de conversión adicional.
- Se puede desplegar en cualquier aplicación macOS que utilice CoreML, como TranslateBlue u otras apps de transcripción.

## Comparativa con modelos similares

No disponible. No se ha proporcionado información sobre otros modelos ASR japoneses comparables, como Whisper de OpenAI o modelos de espnet, para realizar una comparativa de rendimiento, tamaño o licencia.

## Limitaciones y advertencias

- Es una conversión de un modelo original de NVIDIA; no se garantiza que el rendimiento sea idéntico al modelo original en TensorFlow o PyTorch.
- El modelo solo admite japonés; no es multilingüe.
- La ejecución depende de la plataforma CoreML de Apple; no funciona en sistemas Linux o Windows.
- No se proporcionan datos de precisión ni de latencia, por lo que se debe validar en cada caso de uso.
- El paquete está enfocado a la integración en macOS; para iOS existe una versión separada (`parakeet-tdt-ja-coreml-ios`).
- La licencia MIT permite uso comercial, pero se recomienda revisar la licencia del modelo original de NVIDIA por si tuviera restricciones adicionales.

## Enlaces

- [Repositorio en Hugging Face: aoiandroid/parakeet-tdt-ja-coreml-macos](https://huggingface.co/aoiandroid/parakeet-tdt-ja-coreml-macos)
- [Repositorio fuente: aoiandroid/parakeet-tdt-ja-coreml](https://huggingface.co/aoiandroid/parakeet-tdt-ja-coreml)
- [Repositorio de Apple para modelos CoreML (referencia)](https://github.com/apple/coreai-models/tree/main/models/parakeet)
