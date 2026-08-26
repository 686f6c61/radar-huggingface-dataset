# aoiandroid/neutts-nano-coreml-int8-ios

## Resumen

Este modelo es un paquete compilado de Core ML para iOS, derivado de `aoiandroid/neutts-nano-coreml-int8`, que a su vez es una conversión del modelo de síntesis de voz (TTS) `neutts-nano` desarrollado por Neuphonic. La versión publicada aquí está optimizada para ejecución en dispositivos Apple (iPhone, iPad) mediante el runtime Core ML, con cuantización int8 y especialización para el Neural Engine (ANE). El objetivo es ofrecer un TTS ligero, on-device, sin dependencia de APIs en la nube, pensado para la aplicación TranslateBlue.

La relevancia actual radica en el creciente interés por modelos de voz locales que preserven la privacidad y funcionen sin conexión. Al tratarse de un bundle compilado (`.mlmodelc`), no se distribuyen los pesos originales en formato abierto, sino un artefacto listo para integrar en apps iOS. La información técnica detallada del modelo base (arquitectura, número de parámetros, contexto) no se proporciona en esta página de HuggingFace, aunque se sabe que es una versión "nano" de la familia NeuTTS, orientada a bajo consumo de recursos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo TTS de Neuphonic, familia NeuTTS, versión nano) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica, es TTS) |
| Tipos de cuantizacion | int8 (Core ML) |
| Idiomas soportados | no disponible (el README menciona "multilingual" en el repositorio original, pero sin detalle) |
| Licencia | MIT |
| Formato de pesos | .mlmodelc (compilado para Core ML) |

## Arquitectura y entrenamiento

No se dispone de información pública sobre la arquitectura interna del modelo base `neutts-nano`. Según el repositorio de Neuphonic, se trata de un modelo de lenguaje de voz (speech language model) diseñado para ejecución on-device, con clonado de voz instantáneo y control emocional en algunas variantes (NeuTTS-2E). El presente artefacto es una conversión a Core ML, probablemente mediante herramientas de exportación como las que ofrece Apple en su repositorio `coreai-models`. No se detallan los datos de entrenamiento, el número de tokens ni el proceso de alineamiento (RLHF/DPO). Tampoco se mencionan innovaciones técnicas específicas de esta conversión.

## Capacidades

- Síntesis de voz (texto a voz) de baja latencia, pensada para ejecución en dispositivos Apple.
- Clonado de voz instantáneo (según el repositorio original de NeuTTS, aunque no se confirma en esta versión).
- Posible control emocional (en la variante NeuTTS-2E, pero no se especifica si esta versión lo incluye).
- Funcionamiento on-device sin conexión, aprovechando el Neural Engine de Apple.
- Multilingüe según la descripción del repositorio original, aunque no se detallan los idiomas concretos en esta página.
- No se han documentado capacidades de tool calling, agentes o razonamiento, al ser un modelo de voz.

## Casos de uso

- Traducción con voz integrada: el modelo se usa dentro de la app TranslateBlue para leer en voz alta las traducciones generadas, aprovechando el paquete Core ML para latencia mínima.
- Asistente de voz offline: se puede integrar en aplicaciones iOS de asistencia personal que requieran síntesis de voz sin conexión a internet.
- Audiolibros personalizados: generar narraciones de textos largos con voz clonada o sintetizada, usando la versión compilada para iOS.
- Accesibilidad: lectura de pantalla para personas con discapacidad visual, con respuestas en tiempo real.
- Prototipado rápido de apps de voz: los desarrolladores pueden integrar el `.mlmodel` directamente en Xcode sin necesidad de convertir modelos.
- Evaluación de TTS en dispositivos: comparar la calidad de voz y latencia con otras soluciones en hardware Apple.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se dispone de métricas de calidad de voz (MOS, WER) ni de comparativas con otros modelos TTS.

## Requisitos de hardware

- Específico para dispositivos Apple: requiere iOS 13 o posterior (según compatibilidad de CoreML), con Neural Engine para aprovechar la aceleración.
- Tamaño del repositorio: 0.6 GB, lo que indica que el modelo compilado ocupa alrededor de 600 MB, aunque el peso real en disco puede variar.
- No se indica VRAM ni GPU, ya que CoreML gestiona la ejecución en CPU, GPU y ANE de forma automática.
- Para desarrollo, se necesita Xcode y un dispositivo físico o simulador con soporte CoreML.
- No se han documentado opciones de despliegue en servidores (vLLM, llama.cpp, etc.) porque es un artefacto específico de iOS.

## Comparativa con modelos similares

No se dispone de información suficiente para comparar con otras versiones de TTS on-device. El repositorio original de Neuphonic ofrece variantes como NeuTTS-2E con pesos GGUF (Q8, Q4) para otros entornos, pero no hay métricas comparativas publicadas en la información proporcionada. No se pueden establecer comparaciones fiables.

## Limitaciones y advertencias

- No hay documentación oficial de la arquitectura ni de los datos de entrenamiento, lo que dificulta la evaluación técnica.
- El modelo está compilado para CoreML, por lo que no es portable a otras plataformas sin conversión adicional.
- La licencia MIT permite uso comercial, pero el autor original (Neuphonic) puede tener restricciones sobre el modelo base; se recomienda revisar la licencia del repositorio original.
- No se ha evaluado la calidad de la voz en español ni en otros idiomas; la descripción solo menciona "multilingual" sin detallar.
- Al ser un modelo de síntesis de voz, existe el riesgo de uso indebido para suplantación de voz (deepfake) si se clona la voz de una persona sin consentimiento.
- La cuantización int8 puede degradar ligeramente la calidad en comparación con el modelo original en FP16 o FP32.

## Enlaces

- Modelo en HuggingFace: [aoiandroid/neutts-nano-coreml-int8-ios](https://huggingface.co/aoiandroid/neutts-nano-coreml-int8-ios)
- Modelo fuente (no compilado): [aoiandroid/neutts-nano-coreml-int8](https://huggingface.co/aoiandroid/neutts-nano-coreml-int8)
- Repositorio original de Neuphonic: [github.com/neuphonic/neutts](https://github.com/neuphonic/neutts)
- Repositorio de Apple para exportación Core AI: [github.com/apple/coreai-models](https://github.com/apple/coreai-models)
- Página de descarga de GGUF de Neutts Nano (referencia): [local-ai-zone.github.io/models/neutts-nano.html](https://local-ai-zone.github.io/models/neutts-nano.html)
