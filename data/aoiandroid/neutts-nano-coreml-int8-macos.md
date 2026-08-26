# aoiandroid/neutts-nano-coreml-int8-macos

## Resumen

`aoiandroid/neutts-nano-coreml-int8-macos` es una compilación del modelo de síntesis de voz (TTS) NeuTTS Nano de Neuphonic, empaquetada como un bundle Core ML compilado (`.mlmodelc`) específicamente para macOS. El modelo original, desarrollado por Neuphonic, es un sistema de TTS de código abierto diseñado para ejecutarse completamente en el dispositivo, con clonación instantánea de voz y arquitectura basada en backbones de modelos de lenguaje. Esta versión concreta está cuantizada a INT8 y preparada para aprovechar el Neural Engine (ANE) de los chips Apple Silicon.

El repositorio, publicado por el usuario `aoiandroid`, forma parte de un ecosistema más amplio que incluye versiones para iOS y una fuente en formato Core ML sin compilar. Su objetivo principal es servir como componente de síntesis de voz para la aplicación TranslateBlue, un traductor que necesita convertir texto traducido en audio natural de forma local. El tamaño del repositorio es de 0,6 GB y la licencia es MIT, lo que permite uso comercial sin restricciones.

La relevancia de este modelo radica en que representa una tendencia creciente: llevar la IA de voz de calidad a los dispositivos del usuario final, eliminando la dependencia de APIs en la nube. Al estar compilado específicamente para el ecosistema Apple, ofrece un despliegue optimizado con baja latencia y privacidad total, ya que el audio se sintetiza sin salir del dispositivo.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Modelo de lenguaje de voz (TTS) basado en backbones de LLM (no se especifica la arquitectura exacta) |
| Parámetros totales | No disponible |
| Parámetros activos | No aplicable (no es MoE) |
| Longitud de contexto | No disponible (modelo TTS, no aplica el concepto de ventana de contexto de LLM) |
| Tipos de cuantización | INT8 (compilado para Core ML) |
| Idiomas soportados | No disponible en la ficha; el ecosistema NeuTTS-2E menciona inglés con control emocional y carácter multilingüe |
| Licencia | MIT |
| Formato de pesos | `.mlmodelc` (Core ML compilado, específico para macOS) |

## Arquitectura y entrenamiento

NeuTTS es una colección de modelos TTS de código abierto desarrollados por Neuphonic, construidos sobre backbones de modelos de lenguaje. Esto implica que la síntesis de voz se modela como una tarea de generación de texto sobre unidades acústicas o tokens de audio, en lugar de utilizar arquitecturas clásicas de vocoder o síntesis concatenativa. El modelo base NeuTTS-2E destaca por su capacidad multilingüe (con inglés como idioma principal) y control emocional.

La compilación `neutts-nano-coreml-int8-macos` parte de un modelo fuente (disponible en `aoiandide/neutts-nano-coreml-int8`) que se ha convertido a formato `.mlpackage` y posteriormente compilado a `.mlmodelc` para ejecución nativa en macOS. La cuantización a INT8 reduce el tamaño y el consumo de memoria, y la especialización para el Neural Engine (ANE) de Apple se realiza de forma local en el dispositivo, lo que optimiza la inferencia sin necesidad de recalibrar el modelo en la nube. No se dispone de información detallada sobre los datos de entrenamiento (número de tokens, composición del dataset o técnicas de RLHF/DPO) en la documentación disponible.

## Capacidades

- Síntesis de voz de texto a voz (TTS) en tiempo real, ejecutada íntegramente en el dispositivo.
- Clonación instantánea de voz: puede generar habla con la voz de un usuario a partir de una muestra breve de audio.
- Control emocional de la voz (en el modelo base NeuTTS-2E, que es la fuente de esta compilación).
- Inferencia acelerada por el Apple Neural Engine (ANE) en chips Apple Silicon.
- Integración directa con aplicaciones macOS mediante Core ML (API nativa de Apple).
- Compatibilidad con el flujo de trabajo de TranslateBlue: síntesis del texto traducido en tiempo real sin conexión.

## Casos de uso

- **Traducción con voz integrada (TranslateBlue)**: el modelo sintetiza el texto traducido en audio natural, permitiendo a los usuarios escuchar las traducciones en lugar de solo leerlas, todo sin conexión a internet.
- **Asistentes de voz locales**: integración en aplicaciones de asistente personal de macOS que responden con voz sintetizada sin depender de servicios en la nube, garantizando privacidad.
- **Audiolibros y narración de contenido**: generar narración de texto largo (artículos, libros, noticias) con la voz clonada del usuario o una voz emocionalmente expresiva, sin coste de APIs.
- **Accesibilidad para personas con discapacidad visual**: leer en voz alta el contenido de la pantalla o documentos en macOS con una voz natural y local.
- **Aplicaciones de educación de idiomas**: sintetizar ejemplos de pronunciación en el idioma de destino, aprovechando la capacidad multilingüe del modelo base.
- **Creación de contenido multimedia**: generar voces para vídeos, podcasts o demos sin necesidad de contratar actores de voz, con control emocional para adaptar la entonación al contexto.
- **Juguetes y dispositivos embebidos**: gracias a su tamaño reducido y ejecución local, puede integrarse en dispositivos con recursos limitados que se conectan a un Mac para la síntesis de voz.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se dispone de datos de MMLU, HumanEval, GSM8K ni de métricas específicas de TTS (MOS, RTF, etc.) para esta compilación Core ML. La documentación de Neuphonic menciona rendimiento en tiempo real, pero no se aportan cifras concretas en los datos proporcionados.

## Requisitos de hardware

- **Plataforma**: macOS con chip Apple Silicon (M1, M2, M3, M4 o posteriores), dado que la compilación está especializada para el Neural Engine (ANE).
- **Memoria**: el repositorio ocupa 0,6 GB; con cuantización INT8, la memoria en tiempo de ejecución será inferior a ese valor, estimándose en el entorno de 300-500 MB en RAM.
- **GPU**: no es necesaria GPU dedicada; la inferencia se acelera mediante el ANE integrado en el chip Apple.
- **Almacenamiento**: se requiere el espacio del bundle compilado (0,6 GB) en el dispositivo.
- **Opciones de despliegue**: integración directa en aplicaciones Swift mediante Core ML (`.mlmodelc`), sin necesidad de frameworks externos como vLLM, llama.cpp u Ollama, que no son aplicables a este formato.
- **Latencia**: no se dispone de datos medidos; la ejecución en ANE suele ofrecer latencias inferiores a 100 ms por frase corta, pero este dato no está confirmado en la documentación.

## Comparativa con modelos similares

| Modelo | Formato | Tamaño | Plataforma | Licencia | Uso |
|---|---|---|---|---|---|
| `neutts-nano-coreml-int8-macos` (este modelo) | Core ML compilado (`.mlmodelc`) | 0,6 GB (repo) | macOS (Apple Silicon) | MIT | TTS local en macOS |
| `neutts-nano-coreml-int8-ios` (hermano) | Core ML compilado | No disponible | iOS | MIT | TTS local en iOS |
| `neutts-nano-coreml-int8` (fuente) | `.mlpackage` | No disponible | Multiplataforma (compila a Core ML) | MIT | TTS local, fuente para compilaciones |
| Neutts Nano GGUF | GGUF (Q4/Q8) | 354 MB | Multiplataforma (llama.cpp, Ollama) | MIT | TTS local en CPU/GPU |

La comparativa muestra que todas las variantes provienen del mismo modelo base NeuTTS Nano, diferenciándose en el formato de distribución y la plataforma destino. La versión macOS es la única optimizada para ANE, mientras que la versión GGUF ofrece flexibilidad en otros sistemas operativos.

## Limitaciones y advertencias

- **Dependencia de hardware Apple**: el modelo solo funciona en macOS con Apple Silicon; no es compatible con Intel Macs ni con otros sistemas operativos sin conversión adicional.
- **Cuantización INT8**: la cuantización puede introducir una pérdida de calidad en la voz sintetizada comparada con el modelo en precisión completa, aunque no se aportan métricas comparativas.
- **Idiomas limitados**: aunque el modelo base es multilingüe, la documentación específica de esta compilación no detalla los idiomas soportados; el inglés es el idioma principal confirmado en la documentación de NeuTTS-2E.
- **Sesgos y alucinaciones**: al ser un modelo TTS basado en LLM, puede presentar alucinaciones en la transcripción (pronunciar palabras inexistentes o mal transcritas) si el texto de entrada contiene errores o términos fuera del vocabulario.
- **Falta de documentación técnica**: no se especifican los parámetros del modelo, el dataset de entrenamiento ni las métricas de calidad, lo que dificulta evaluar su rendimiento frente a alternativas.
- **Uso en producción**: al ser un modelo compilado específicamente para una plataforma, la actualización o el reentrenamiento requiere recompilar el bundle, lo que añade complejidad al mantenimiento.
- **Privacidad**: aunque la inferencia es local, el clonado de voz requiere procesar muestras de audio del usuario, que deben gestionarse conforme a la normativa de protección de datos (RGPD en la UE).

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/aoiandroid/neutts-nano-coreml-int8-macos)
- [Modelo fuente (`.mlpackage`)](https://huggingface.co/aoiandroid/neutts-nano-coreml-int8)
- [Repositorio de Neuphonic (código fuente del modelo base)](https://github.com/neuphonic/neutts)
- [Repositorio alternativo del modelo base](https://github.com/neverninetofive/neutts-local-ai-voice)
- [Página de descarga de NeutT Nano GGUF](https://local-ai-zone.github.io/models/neutts-nano.html)
- [Perfil de usuario `aoiandroid` en Hugging Face](https://huggingface.co/aoiandroid)
