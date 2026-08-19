# hugging-mac/sensevoice-small-coreml

## Resumen

SenseVoiceSmall Core ML es una conversión lista para usar del modelo SenseVoiceSmall de FunAudioLLM, adaptada a Core ML para ejecutarse de forma nativa y privada en dispositivos Apple Silicon. La ha publicado el proyecto Hugging Mac, que integra este modelo en su plataforma para construir aplicaciones de voz locales en macOS. El modelo original es un sistema de comprensión de voz no autorregresivo que combina transcripción, identificación de idioma hablado, reconocimiento de emociones y detección de eventos de audio en un único paso, con una latencia excepcionalmente baja.

Esta versión Core ML mantiene todas las capacidades del modelo original, pero empaquetadas en un ML Program con tres funciones de entrada fijas que permiten seleccionar automáticamente el tamaño de buffer más adecuado según la duración del audio. El paquete ocupa 238,7 MB y requiere macOS 15 o superior. Su relevancia actual radica en que permite desplegar un sistema completo de comprensión de voz multilingüe (chino, inglés, cantonés, japonés y coreano) sin conexión a internet, con procesamiento local y sin enviar datos a servidores externos, algo crítico para aplicaciones sensibles a la privacidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder SANM no autorregresivo con salida CTC |
| Parametros totales | no disponible |
| Longitud de contexto | Audio de hasta 30 segundos a 16 kHz |
| Tipos de cuantizacion | Pesos INT8 lineal, computo FP16 |
| Idiomas soportados | zh, en, yue, ja, ko |
| Licencia | FunASR Model License 1.1 (funasr-model-license-1.1) |
| Formato de pesos | Core ML ML Program (.mlpackage) |

## Arquitectura y entrenamiento

El modelo base SenseVoiceSmall fue desarrollado por FunAudioLLM y presentado en el paper "FunAudioLLM: Voice Understanding and Generation Foundation Models for Human-Machine Interaction" (arXiv:2407.04051). Su arquitectura es un encoder SANM (Stacked Attention with Normalized Memory) no autorregresivo que produce directamente logits CTC, lo que elimina la dependencia de decodificación autoregresiva y reduce drásticamente la latencia de inferencia. El modelo fue entrenado para realizar múltiples tareas simultáneamente: reconocimiento de voz, identificación de idioma, reconocimiento de emociones y detección de eventos de audio, todo en una sola pasada.

La conversión a Core ML, realizada por el proyecto Hugging Mac, mantiene la arquitectura original pero la adapta al runtime de Apple. El paquete contiene un único ML Program con tres funciones (`encoder_100`, `encoder_250`, `encoder_500`) que aceptan características acústicas de 560 dimensiones (generadas con las estadísticas de normalización `am.mvn` incluidas) y producen logits de tamaño variable según la función. Los pesos se cuantifican a INT8 lineal y el cómputo se realiza en FP16, lo que permite una ejecución eficiente en los Neural Engine de Apple Silicon. La decodificación CTC, el procesamiento con SentencePiece y el análisis de los tokens ricos (idioma, emoción, evento) se realizan fuera del modelo, en el SDK de Hugging Mac.

## Capacidades

- Reconocimiento de voz multilingüe para chino mandarín, inglés, cantonés, japonés y coreano.
- Identificación automática del idioma hablado.
- Reconocimiento de emociones: feliz, triste, enfadado, neutral, miedo, asco y sorpresa.
- Detección de eventos de audio: música, aplausos, risa, llanto, tos, estornudo, respiración, canto y ruido de habla.
- Normalización inversa de texto opcional (convierte números y abreviaturas a su forma hablada).
- Procesamiento de audio corto de hasta 30 segundos a 16 kHz.
- Inferencia no autorregresiva con baja latencia, apta para aplicaciones en tiempo real.
- Ejecución completamente local en Apple Silicon, sin conexión a internet.

## Casos de uso

- Transcripción en tiempo real en macOS: el modelo puede transcribir reuniones, entrevistas o dictados de voz con baja latencia, gracias a su arquitectura no autorregresiva y a las funciones de buffer fijo que permiten procesar segmentos de hasta 30 segundos.
- Asistentes de voz locales y privados: al ejecutarse en el dispositivo, es posible construir asistentes que no envían audio a la nube, cumpliendo requisitos estrictos de privacidad en entornos corporativos o de salud.
- Analisis de llamadas de atencion al cliente: la detección de emociones permite clasificar automáticamente el tono de las interacciones (enfado, satisfacción, neutralidad) y priorizar aquellas que requieran intervención humana.
- Moderacion de contenido de audio: la detección de eventos como llanto, gritos o ruido de habla puede utilizarse para filtrar contenido inapropiado en plataformas de streaming o redes sociales.
- Subtitulacion automatica multilingue: con soporte para cinco idiomas, el modelo puede generar subtítulos en tiempo real para vídeos o podcasts, identificando además el idioma hablado en cada segmento.
- Aplicaciones de accesibilidad: personas con discapacidad auditiva pueden beneficiarse de transcripciones y de la detección de eventos sonoros (aplausos, risas) para comprender el contexto de una conversación o un evento.
- Agentes de voz con comprensión emocional: integrado en un agente conversacional, el modelo permite que el sistema adapte su respuesta según el estado emocional del usuario, mejorando la experiencia en aplicaciones de salud mental o educación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Dispositivos Apple Silicon (M1 o superior) con macOS 15 o posterior.
- El paquete Core ML ocupa 238,7 MB, por lo que cabe en cualquier Mac con Apple Silicon sin necesidad de GPU dedicada adicional.
- No se requiere VRAM específica; el modelo se ejecuta en el Neural Engine o en la GPU unificada del chip Apple.
- La inferencia es no autorregresiva, lo que reduce significativamente el tiempo de cómputo en comparación con modelos autoregresivos de tamaño similar.
- El despliegue se realiza mediante el proyecto Hugging Mac, que proporciona un SDK y una interfaz web para instalar y utilizar el modelo.
- No se han publicado datos de latencia o throughput específicos para esta conversión Core ML, pero el modelo original SenseVoiceSmall es conocido por su baja latencia en tareas de reconocimiento de voz.

## Comparativa con modelos similares

| Modelo | Formato | Parametros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| SenseVoiceSmall Core ML (este) | Core ML | no disponible | 30 s audio | zh, en, yue, ja, ko | FunASR 1.1 | Hugging Face |
| SenseVoiceSmall (original) | PyTorch | no disponible | 30 s audio | zh, en, yue, ja, ko | FunASR 1.1 | Hugging Face |
| mefengl/SenseVoiceSmall-coreml | Core ML | no disponible | 30 s audio | zh, en, yue, ja, ko | FunASR 1.1 | Hugging Face |

La comparativa se limita a las versiones del mismo modelo base, ya que no se dispone de datos de rendimiento para otros modelos de comprensión de voz similares. La principal diferencia entre esta conversión y la de mefengl es el origen y el mantenimiento: esta versión está integrada en el ecosistema Hugging Mac, que ofrece un SDK completo para su uso en aplicaciones macOS.

## Limitaciones y advertencias

- El modelo solo procesa audio de hasta 30 segundos por segmento; audios más largos deben dividirse previamente.
- Los idiomas soportados se limitan a cinco: chino mandarín, inglés, cantonés, japonés y coreano. No cubre otros idiomas.
- La licencia FunASR Model License 1.1 impone condiciones de atribución y restricciones de uso comercial; es necesario revisar el texto completo antes de redistribuir o utilizar el modelo en productos comerciales.
- La conversión Core ML requiere macOS 15, lo que excluye versiones anteriores del sistema operativo.
- El modelo puede presentar sesgos en el reconocimiento de emociones según el acento, el ruido de fondo o la calidad del audio.
- La decodificación de los logits requiere componentes externos (CTC collapse, SentencePiece, parsing de tokens ricos) que no están incluidos en el paquete Core ML; es necesario utilizar el SDK de Hugging Mac o implementar estos pasos manualmente.
- No se han publicado resultados de benchmarks para esta conversión específica, por lo que el rendimiento real en tareas concretas debe validarse en el entorno de destino.
- El modelo está diseñado para audio de voz; no es adecuado para música o sonidos ambientales complejos fuera de los eventos detectados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/hugging-mac/sensevoice-small-coreml
- Modelo original SenseVoiceSmall: https://huggingface.co/FunAudioLLM/SenseVoiceSmall
- Proyecto Hugging Mac (GitHub): https://github.com/devilyouwei/hugging-mac
- Repositorio SenseVoice (GitHub): https://github.com/QwenAudio/SenseVoice
- Paper FunAudioLLM: https://arxiv.org/html/2407.04051v1
- Conversión alternativa de mefengl: https://huggingface.co/mefengl/SenseVoiceSmall-coreml
