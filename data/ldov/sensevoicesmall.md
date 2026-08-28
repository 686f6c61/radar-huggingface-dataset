# ldov/SenseVoiceSmall

## Resumen

SenseVoiceSmall es un modelo de reconocimiento automático del habla (ASR) multilingüe desarrollado por FunAudioLLM (Alibaba), diseñado para transcripción de audio con alta velocidad y precisión, especialmente en chino mandarín. A diferencia de los modelos autorregresivos tipo Whisper, SenseVoiceSmall emplea una arquitectura de encoder SAN-M con decodificación CTC no autorregresiva, lo que le permite procesar audio a una velocidad aproximada de 20 veces el tiempo real en CPU. Además de ASR, el modelo integra identificación de idioma (LID), reconocimiento de emociones del habla (SER) y detección de eventos de audio (AED) en un único paso.

Esta versión concreta, publicada por el usuario ldov, convierte los pesos originales del modelo al formato GGUF, lo que permite ejecutarlo sin Python mediante el runtime llama.cpp de FunASR, un binario autocontenido pensado para entornos CPU y dispositivos de borde. El modelo tiene aproximadamente 234 millones de parámetros y está licenciado bajo Apache-2.0, lo que facilita su uso comercial y su integración en aplicaciones de producción.

La relevancia actual de esta conversión radica en que democratiza el despliegue de un ASR de alta calidad en hardware modesto, sin dependencias pesadas ni GPU, ofreciendo una alternativa eficiente a soluciones basadas en la nube o en modelos más grandes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SAN-M encoder + CTC (no autorregresivo) |
| Parametros totales | 233.999.728 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (ASR por ventanas de audio) |
| Tipos de cuantizacion | f32, f16, q8_0 |
| Idiomas soportados | zh (chino mandarin), en (ingles) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

SenseVoiceSmall utiliza un encoder SAN-M (Self-Attention Network with Masking) combinado con una cabeza CTC (Connectionist Temporal Classification). Esta arquitectura no autorregresiva procesa toda la secuencia de audio en paralelo, evitando la decodificación paso a paso de los modelos tipo Whisper y logrando una latencia mucho menor. El modelo fue entrenado con más de 400.000 horas de datos de audio multilingüe, cubriendo tareas de ASR, identificación de idioma, reconocimiento de emociones y detección de eventos acústicos. El entrenamiento incluye una etapa de ajuste fino supervisado y posiblemente técnicas de aumento de datos, aunque los detalles exactos no se especifican en la información disponible.

La conversión a GGUF mantiene la arquitectura original pero adapta los pesos para el runtime llama.cpp de FunASR, que implementa la inferencia en C++ sin dependencias de Python. Esta versión concreta incluye tres archivos: uno en f32 (referencia), uno en f16 (recomendado) y otro en q8_0 (cuantización de 8 bits, la mitad del tamaño con la misma precisión según la card).

## Capacidades

- Reconocimiento automático del habla (ASR) en chino mandarín e inglés, con salida de texto directa.
- Identificación de idioma (LID) integrada, que etiqueta automáticamente el idioma detectado.
- Reconocimiento de emociones del habla (SER), capaz de clasificar estados emocionales del hablante.
- Detección de eventos de audio (AED), como risas, aplausos o ruido de fondo.
- Inferencia no autorregresiva, lo que permite velocidades de procesamiento de ~20× tiempo real en CPU.
- Integración con el runtime llama.cpp de FunASR, que ofrece un binario único sin necesidad de Python.
- Soporte para audio largo mediante un modelo VAD externo (fsmn-vad) que segmenta el audio antes de la transcripción.

## Casos de uso

- Transcripción de reuniones y conferencias: el modelo puede transcribir audio en tiempo real con baja latencia, ideal para generar actas automáticas en entornos corporativos. Su velocidad en CPU permite ejecutarlo en portátiles o servidores sin GPU.
- Subtitulado automático de vídeos: al procesar audio a 20× tiempo real, es viable generar subtítulos para contenido multimedia en chino e inglés sin necesidad de infraestructura cloud.
- Atención al cliente automatizada: integrado en un sistema de IVR o chatbot, puede transcribir llamadas y detectar emociones del cliente, permitiendo enrutar llamadas según el estado de ánimo detectado.
- Análisis de sentimiento en centros de llamadas: la capacidad de SER permite clasificar llamadas como positivas, negativas o neutras, facilitando el control de calidad y la detección de problemas.
- Asistentes de voz en dispositivos de borde: al ser un binario pequeño (235 MB en q8) y no requerir GPU, puede desplegarse en Raspberry Pi, routers o sistemas embebidos para comandos de voz.
- Archivado y búsqueda de audio: transcribir archivos históricos de audio o vídeo para hacerlos indexables y buscables por texto, con etiquetas de idioma y eventos para filtrar contenido relevante.
- Pruebas de accesibilidad: generar transcripciones para personas con discapacidad auditiva en aplicaciones educativas o de entretenimiento, aprovechando la licencia Apache-2.0 para uso comercial.

## Benchmarks y rendimiento

La card del modelo reporta un CER (Character Error Rate) del 8,01 % en un benchmark de mandarín con 184 clips de audio, comparado con whisper.cpp que obtiene entre 22 % y 31 % en el mismo conjunto. No se proporcionan más resultados de benchmarks en la información disponible.

| Modelo | CER (mandarin, 184 clips) | Velocidad en CPU |
|---|---|---|
| SenseVoiceSmall (GGUF, f16, 8 hilos) | 8,01 % | ~20× tiempo real |
| whisper.cpp (small/base) | 22–31 % | no especificado |

## Requisitos de hardware

- Inferencia en CPU únicamente, sin necesidad de GPU. El runtime llama.cpp de FunASR está optimizado para procesadores x86 y ARM.
- Tamaño de los pesos: f32 936 MB, f16 470 MB, q8_0 ~235 MB. Se recomienda al menos 1 GB de RAM libre para el modelo f16.
- El benchmark de la card se realizó con 8 hilos de CPU, alcanzando 8,01 % CER. Con menos hilos la latencia aumentará.
- No requiere VRAM, ya que la inferencia se realiza en memoria del sistema.
- Opciones de despliegue: binario precompilado desde GitHub Releases de FunASR (Linux, macOS, Windows), o compilación desde el código fuente del runtime llama.cpp.
- Para audio largo, se recomienda usar el modelo VAD fsmn-vad (también en GGUF) para segmentar el audio antes de la transcripción.

## Comparativa con modelos similares

| Modelo | Parametros | Arquitectura | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| SenseVoiceSmall (GGUF) | 234 M | SAN-M + CTC | zh, en | Apache-2.0 | GGUF |
| whisper.cpp small | 244 M | Transformer autorregresivo | multilingue | MIT | GGUF |
| FunASR SenseVoiceSmall (original) | 234 M | SAN-M + CTC | zh, en, ja, ko, yue | Apache-2.0 | safetensors |

La principal ventaja de esta versión GGUF es su ejecución sin Python y su menor latencia en CPU frente a whisper.cpp, aunque Whisper soporta más idiomas. El modelo original de FunAudioLLM tiene soporte adicional para japonés, coreano y cantonés, pero esta conversión solo incluye etiquetas para chino e inglés.

## Limitaciones y advertencias

- La versión GGUF solo declara soporte para chino mandarín e inglés, aunque el modelo original de FunAudioLLM también maneja japonés, coreano y cantonés. Para esos idiomas, es necesario usar el modelo original con FunASR en Python.
- El modelo puede presentar sesgos en el reconocimiento de acentos regionales o habla no nativa, especialmente en inglés, debido al sesgo del dataset de entrenamiento.
- Riesgo de alucinación en transcripciones: como cualquier ASR, puede generar texto que no corresponde exactamente al audio, especialmente en condiciones de ruido o solapamiento de voces.
- No se especifica la longitud máxima de audio que puede procesar en una sola pasada; para audio largo se requiere el uso de VAD externo.
- Aunque la licencia Apache-2.0 permite uso comercial, es recomendable verificar los términos de la licencia del modelo original (también Apache-2.0) y del runtime de FunASR.
- La cuantización q8_0 puede degradar ligeramente la precisión en comparación con f16, aunque la card afirma que mantiene la misma exactitud. Se recomienda validar en el caso de uso concreto.

## Enlaces

- [Modelo GGUF en HuggingFace](https://huggingface.co/ldov/SenseVoiceSmall)
- [Modelo original SenseVoiceSmall](https://huggingface.co/FunAudioLLM/SenseVoiceSmall)
- [Runtime llama.cpp de SenseVoice](https://github.com/FunAudioLLM/SenseVoice/tree/main/runtime/llama.cpp)
- [Runtime llama.cpp de FunASR](https://github.com/modelscope/FunASR/tree/main/runtime/llama.cpp)
- [Repositorio SenseVoice (GitHub)](https://github.com/QwenAudio/SenseVoice)
- [Guía rápida y benchmarks en funasr.com](https://www.funasr.com/llama-cpp.html)
- [Benchmarks detallados](https://github.com/FunAudioLLM/SenseVoice/blob/main/runtime/llama.cpp/BENCHMARKS.md)
- [Releases con binarios precompilados](https://github.com/modelscope/FunASR/releases)
