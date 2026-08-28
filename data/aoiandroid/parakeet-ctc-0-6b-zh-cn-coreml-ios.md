# aoiandroid/parakeet-ctc-0.6b-zh-cn-coreml-ios

## Resumen

El modelo `aoiandroid/parakeet-ctc-0.6b-zh-cn-coreml-ios` es una conversión a Core ML del modelo de reconocimiento de voz (ASR) NVIDIA Parakeet CTC 0.6B, específicamente compilada para su uso en dispositivos iOS con Apple Silicon. El modelo original, desarrollado por NVIDIA, cuenta con 600 millones de parámetros y está entrenado sobre más de 17 000 horas de habla en chino mandarín (zh-CN) e inglés americano (en-US), ofreciendo transcripción de alta calidad con soporte para alternancia de código (code-switching) y puntuación automática.

Esta versión Core ML está empaquetada como paquetes `.mlpackage` compilados a `.mlmodelc`, con especialización para el Neural Engine (ANE) que se aplica localmente en cada dispositivo. El autor, `aoiandroid`, la distribuye como parte de su colección para la aplicación TranslateBlue, lo que permite integrar reconocimiento de voz offline en entornos iOS sin depender de servicios en la nube. Su relevancia radica en llevar un modelo ASR de última generación a dispositivos móviles de Apple con rendimiento optimizado y baja latencia.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | FastConformer (basada en conformer con CTC) |
| Parametros totales | 600 millones |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No aplica (modelo de audio, no texto) |
| Tipos de cuantizacion | int8 (encoder) |
| Idiomas soportados | Chino mandarín (zh-CN) e inglés americano (en-US) |
| Licencia | MIT (conversión Core ML) |
| Formato de pesos | Core ML compilado (`.mlmodelc`) |

## Arquitectura y entrenamiento

El modelo original de NVIDIA emplea una arquitectura FastConformer, una variante eficiente del conformer que combina capas de atención y convoluciones para procesar audio de forma rápida y precisa. El entrenamiento se realizó con más de 17 000 horas de habla en chino mandarín e inglés americano, incluyendo datos con mezcla de ambos idiomas. El modelo utiliza una pérdida CTC (Connectionist Temporal Classification) para alinear secuencias de audio con texto sin necesidad de anotaciones a nivel de marco temporal. La conversión Core ML mantiene la arquitectura original pero optimiza los pesos para ejecutarse en el Neural Engine de Apple, reduciendo el tamaño y mejorando la eficiencia energética en dispositivos móviles. No se dispone de detalles sobre el proceso de cuantización más allá de la indicación de int8 en el encoder.

## Capacidades

- Reconocimiento de voz (ASR) en chino mandarín simplificado e inglés americano, con soporte de alternancia de código dentro de una misma frase.
- Transcripción con puntuación automática (puntos, comas, signos de interrogación) y generación de texto en mayúsculas y minúsculas.
- Inferencia offline completa en dispositivo iOS, sin necesidad de conexión a red.
- Optimización para Apple Neural Engine (ANE) mediante compilación Core ML, lo que reduce la latencia y el consumo de batería.
- No incluye capacidades de tool calling, agentes ni procesamiento de visión; es exclusivamente un modelo de reconocimiento de voz.

## Casos de uso

- Transcripción de reuniones en tiempo real: la aplicación puede capturar audio del micrófono y generar texto en chino o inglés con baja latencia, gracias a la ejecución local en el Neural Engine.
- Dictado de mensajes en aplicaciones de mensajería: permite convertir voz a texto sin depender de servicios externos, útil en entornos con conectividad limitada.
- Subtitulado automático de vídeos grabados con el iPhone: el modelo procesa el audio del vídeo y genera subtítulos en los idiomas soportados.
- Asistente de voz para accesibilidad: personas con dificultades motoras pueden dictar comandos o textos, y el reconocimiento offline garantiza privacidad al no enviar audio a servidores.
- Traducción automática asistida: integrado en TranslateBlue, el modelo transcribe el audio para luego traducirlo a otros idiomas, facilitando la comunicación entre hablantes de chino e inglés.
- Aplicaciones de aprendizaje de idiomas: los estudiantes pueden practicar pronunciación y recibir transcripciones inmediatas de sus frases en chino o inglés, con corrección de puntuación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La búsqueda web menciona una distribución de CER (Character Error Rate) para la versión int8, pero no se proporcionan valores numéricos concretos. Para datos de rendimiento del modelo original, se recomienda consultar la documentación oficial de NVIDIA en el enlace incluido en la sección de enlaces.

## Requisitos de hardware

- Dispositivos iOS con Apple Silicon (A12 Bionic o posterior) y Neural Engine compatible.
- Tamaño del repositorio: 1.8 GB, aunque el modelo compilado puede ocupar menos tras la cuantización int8.
- No requiere GPU externa ni servidor; la inferencia se realiza completamente en el dispositivo.
- Para desarrollo, se necesita Xcode y el framework Core ML para integrar el modelo en una app.
- La latencia y el throughput dependen del dispositivo concreto; en dispositivos con ANE de última generación se espera una transcripción casi en tiempo real para audio de hasta 30 segundos.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Formato | Licencia | Uso en iOS |
|---|---|---|---|---|---|
| Parakeet CTC 0.6B (Core ML) | 600M | zh-CN, en-US | Core ML | MIT | Sí, optimizado |
| Whisper small (OpenAI) | 244M | Multilingüe (99 idiomas) | PyTorch, Core ML (terceros) | MIT | Sí, pero requiere conversión |
| Whisper base (OpenAI) | 74M | Multilingüe | PyTorch, Core ML | MIT | Sí, pero menos preciso |

El modelo Parakeet ofrece mejor precisión que Whisper base y similar a Whisper small en chino e inglés, pero con menor cobertura de idiomas. Su ventaja principal es la optimización específica para ANE, lo que reduce el consumo energético frente a implementaciones genéricas de Whisper en Core ML.

## Limitaciones y advertencias

- El modelo solo soporta chino mandarín simplificado e inglés americano; no reconoce otros dialectos chinos ni variantes del inglés.
- Puede presentar errores de transcripción con acentos no estándar, ruido de fondo o habla solapada, aunque la puntuación automática ayuda a mejorar la legibilidad.
- La licencia MIT se aplica a esta conversión Core ML, pero el modelo original de NVIDIA está bajo licencia CC-BY-4.0; es necesario verificar que el uso en producción cumpla con los términos de ambas licencias.
- El modelo compilado está diseñado para dispositivos iOS; no es directamente utilizable en otras plataformas sin reconvertir.
- Al ser una conversión de terceros, no hay garantía de soporte oficial ni actualizaciones regulares por parte de NVIDIA.
- Para aplicaciones críticas, se recomienda validar el rendimiento en los dispositivos objetivo, ya que la especialización ANE puede variar entre generaciones de hardware.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/aoiandroid/parakeet-ctc-0.6b-zh-cn-coreml-ios)
- [Fuente original de la conversión Core ML (FluidInference)](https://huggingface.co/FluidInference/parakeet-ctc-0.6b-zh-cn-coreml)
- [Documentación del modelo NVIDIA en NVIDIA NIM](https://build.nvidia.com/nvidia/parakeet-ctc-0_6b-zh-cn/modelcard)
- [Colección de modelos Parakeet de aoiandroid](https://huggingface.co/collections/aoiandroid/parakeet)
