# aoiandroid/speechbrain-coreml-ios

## Resumen

`aoiandroid/speechbrain-coreml-ios` es un paquete de modelos Core ML compilado para iOS, diseñado como parte del ecosistema de traducción de TranslateBlue. El modelo subyacente proviene de `drakulavich/SpeechBrain-coreml`, que a su vez es una conversión a Core ML del modelo de clasificación de audio ECAPA-TDNN de SpeechBrain, especializado en identificación de idioma. El paquete contiene bundles `.mlmodelc` (modelos compilados) listos para ser integrados en aplicaciones iOS, con la especialización para el Neural Engine (ANE) del dispositivo de forma local.

La relevancia de este modelo radica en su enfoque práctico: permite ejecutar identificación de idioma en tiempo real dentro de una app iOS sin conexión, aprovechando el hardware de Apple. Es un componente clave para aplicaciones de traducción, asistentes de voz y cualquier sistema que requiera detectar el idioma de un audio en el dispositivo. El repositorio se publicó en agosto de 2026, con licencia MIT, y tiene una versión hermana para macOS (`aoiandroid/speechbrain-coreml-macos`).

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | ECAPA-TDNN (basado en SpeechBrain) |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de audio) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible (etiquetado como multilingüe) |
| Licencia | MIT |
| Formato de pesos | Core ML `.mlmodelc` (compilado) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura ECAPA-TDNN, un modelo de redes neuronales profundas para el procesamiento de voz, diseñado para tareas de clasificación de audio como la identificación de idioma. El entrenamiento original se realizó con SpeechBrain, un framework de código abierto para el procesamiento de voz, sobre conjuntos de datos multilingües (no se especifican detalles en la información disponible). En este repositorio, el modelo se ha exportado a formato CoreML y se ha compilado a `.mlmodelc` para su uso directo en iOS. La especialización para el Neural Engine (ANE) se realiza de forma local en el dispositivo, lo que optimiza el rendimiento y la privacidad al no depender de la nube.

## Capacidades

- Identificación de idioma (language identification) en audio.
- Clasificación de audio genérica, basada en el modelo ECAPA-TDNN.
- Soporte multilingüe (según etiquetas del repositorio).
- Ejecución en el dispositivo (on-device) sin conexión a internet.
- Compatible con el framework CoreML de Apple para iOS y macOS.

## Casos de uso

- Traducción en tiempo real: detectar el idioma de entrada de un audio para seleccionar automáticamente el modelo de traducción adecuado en aplicaciones como TranslateBlue.
- Asistentes de voz multilingües: identificar el idioma del usuario antes de procesar el comando, mejorando la precisión del reconocimiento de voz.
- Accesibilidad: transcripción automática de audio con detección de idioma para personas con discapacidad auditiva.
- Atención al cliente automatizada: clasificar el idioma de una llamada o mensaje de voz para enrutar al agente o bot correcto.
- Análisis de contenido multimedia: etiquetar automáticamente el idioma de archivos de audio para su organización en bibliotecas o plataformas de streaming.
- Aplicaciones de aprendizaje de idiomas: proporcionar feedback sobre el idioma detectado en la pronunciación del usuario.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El modelo no incluye métricas de precisión, latencia o throughput en el repositorio.

## Requisitos de hardware

- Ejecución en dispositivos iOS (iPhone, iPad) con soporte para CoreML y Neural Engine (ANE).
- No requiere GPU externa ni hardware especializado.
- El modelo compilado `.mlmodelc` se integra en la app mediante el framework CoreML.
- La especialización ANE se genera automáticamente en el dispositivo, adaptándose al hardware disponible.
- Despliegue: se integra en proyectos de Xcode como parte de una app iOS; no se ejecuta con herramientas como vLLM, Ollama o llama.cpp.

## Comparativa con modelos similares

No se dispone de datos de comparativa con otros modelos de identificación de idioma en formato CoreML. El modelo original de SpeechBrain (`drakulavich/SpeechBrain-coreml`) es la fuente directa, y el repositorio hermana para macOS (`aoiandroid/speechbrain-coreml-macos`) ofrece la misma funcionalidad en plataforma Apple. No hay datos de rendimiento para comparar con alternativas como VoxLingua107 o modelos de identificación de idioma de otros frameworks.

## Limitaciones y advertencias

- El modelo está compilado específicamente para iOS; no es portátil a otros sistemas operativos o frameworks.
- No se han publicado detalles sobre el conjunto de entrenamiento, por lo que se desconoce la cobertura de idiomas y posibles sesgos.
- La especialización ANE se realiza localmente, lo que puede producir variaciones de rendimiento entre dispositivos de diferentes generaciones.
- La licencia MIT se aplica al paquete CoreML, pero el modelo original de SpeechBrain tiene licencia Apache-2.0; se debe verificar la compatibilidad de licencias para uso comercial.
- No hay información sobre la precisión en condiciones de ruido o audio de baja calidad.

## Enlaces

- Repositorio en Hugging Face: [aoiandroid/speechbrain-coreml-ios](https://huggingface.co/aoiandroid/speechbrain-coreml-ios)
- Repositorio fuente: [drakulavich/SpeechBrain-coreml](https://huggingface.co/drakulavich/SpeechBrain-coreml)
- Repositorio hermano (macOS): [aoiandroid/speechbrain-coreml-macos](https://huggingface.co/aoiandroid/speechbrain-coreml-macos)
- Repositorio duplicado en Hugging Face: [aoiandroid/SpeechBrain-coreml](https://huggingface.co/aoiandroid/SpeechBrain-coreml)
- Referencia de Core AI (Apple): [apple/coreai-models](https://github.com/apple/coreai-models)
- Colección de modelos CoreML para iOS/macOS: [john-rocky/CoreML-Models](https://github.com/john-rocky/CoreML-Models)
