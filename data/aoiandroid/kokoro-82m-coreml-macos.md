# aoiandroid/kokoro-82m-coreml-macos

## Resumen

El modelo `aoiandroid/kokoro-82m-coreml-macos` es un paquete de inferencia compilado para Core ML del sintetizador de voz Kokoro-82M, orientado a su uso en la aplicación TranslateBlue en macOS. Kokoro-82M es un modelo de texto a voz (TTS) ligero de 82 millones de parámetros, basado en la arquitectura StyleTTS2 con decodificador iSTFTNet, que genera audio a 24 kHz de forma no autorregresiva. Su relevancia radica en que permite ejecutar síntesis de voz de alta calidad completamente en el dispositivo, aprovechando el Neural Engine de Apple Silicon, con latencias muy bajas y sin necesidad de conexión a la nube.

El repositorio contiene los bundles `.mlmodelc` compilados a partir de los `.mlpackage` de la versión Core ML genérica, con especialización para el acelerador neuronal (ANE) que se mantiene local al dispositivo. Está publicado bajo licencia MIT, aunque el modelo original de Kokoro-82M se distribuye bajo Apache-2.0. El tamaño del repositorio es de 1,6 GB, aunque el modelo compilado para inferencia ocupa aproximadamente 99 MB según la documentación de proyectos relacionados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | StyleTTS2 + iSTFTNet (no autorregresivo) |
| Parametros totales | 82 millones (segun documentacion de Kokoro-82M) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (TTS, entrada de fonemas y vector de voz) |
| Tipos de cuantizacion | no disponible (compilado para Core ML, precision FP16/FP32 segun capa) |
| Idiomas soportados | ingles principalmente (segun fuentes externas) |
| Licencia | MIT (paquete Core ML); Apache-2.0 (modelo original) |
| Formato de pesos | Core ML `.mlmodelc` (compilado) y `.mlpackage` (origen) |

## Arquitectura y entrenamiento

Kokoro-82M es un modelo TTS basado en StyleTTS2, una arquitectura que combina un codificador de estilo con un decodificador iSTFTNet para generar la forma de onda directamente desde fonemas y un vector de estilo/voz. Es no autorregresivo: produce la salida completa en una sola pasada, sin decodificación token a token, lo que reduce drásticamente la latencia. El modelo original fue entrenado por hexgrad y liberado bajo Apache-2.0, aunque no se dispone de detalles sobre el dataset o el proceso de entrenamiento en la información proporcionada.

La conversión a Core ML ha sido realizada por el autor del repositorio, compilando los pesos a formato `.mlmodelc` para su ejecución en macOS. La especialización para el Neural Engine (ANE) se realiza en el dispositivo, lo que permite aprovechar al máximo el hardware de Apple Silicon. Según la documentación de proyectos similares, el modelo alcanza velocidades de 6 a 16 veces superiores al tiempo real en chips de la serie M, con soporte para chunking automático de textos largos, streaming y control de velocidad.

## Capacidades

- Sintesis de voz natural y multihablante a 24 kHz.
- Generacion de audio no autorregresiva en una sola pasada.
- Ejecucion completamente en el dispositivo (on-device) sin conexion a internet.
- Soporte para chunking automatico de textos de cualquier longitud.
- Transmision (streaming) de audio durante la generacion.
- Seleccion de voz y control de velocidad de habla.
- Optimizado para Apple Neural Engine (ANE) y GPU en macOS 14+.
- Integracion sencilla en aplicaciones Swift mediante Core ML.

## Casos de uso

- **Aplicaciones de accesibilidad**: lectores de pantalla y asistentes para personas con discapacidad visual que requieren síntesis de voz local y rápida, sin depender de servicios externos.
- **Asistentes de voz en macOS**: integración en aplicaciones de productividad o automatización que necesitan respuestas habladas con baja latencia, aprovechando el ANE.
- **Audiolibros y narración**: generación de contenido hablado a partir de texto, con control de velocidad y selección de voz, ideal para aplicaciones de lectura.
- **Traducción y aprendizaje de idiomas**: en el contexto de TranslateBlue, el modelo puede leer en voz alta traducciones o frases en inglés, facilitando la pronunciación y el aprendizaje.
- **Doblaje automático de vídeos**: conversión de guiones o subtítulos en audio para vídeos cortos, con rendimiento en tiempo real en equipos Apple Silicon.
- **Sistemas de notificación por voz**: aplicaciones que necesitan alertas habladas sin consumir recursos de red, como temporizadores, recordatorios o notificaciones del sistema.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks formales (MMLU, HumanEval, etc.) para este modelo, ya que se trata de un sistema TTS y no de un modelo de lenguaje. No obstante, la documentación de proyectos relacionados (Jud/kokoro-coreml) indica un rendimiento de 6 a 16 veces más rápido que el tiempo real en procesadores de la serie M de Apple, con un tamaño de modelo de aproximadamente 99 MB. Estos datos provienen de fuentes externas y no han sido verificados de forma independiente.

## Requisitos de hardware

- **VRAM estimada**: no aplica (el modelo se ejecuta en CPU/GPU/ANE unificada de Apple Silicon).
- **GPU recomendada**: Apple Silicon (M1, M2, M3 o superior) con soporte para Core ML y ANE.
- **Sistema operativo**: macOS 14+ (segun documentacion de DeepWiki).
- **Espacio en disco**: aproximadamente 99 MB para el modelo compilado, aunque el repositorio completo ocupa 1,6 GB.
- **Opciones de despliegue**: integración directa en aplicaciones Swift mediante Core ML; no se mencionan otros runtimes como vLLM u Ollama.
- **Latencia y throughput**: se reporta 6-16x tiempo real en M-series, lo que implica latencias de decenas de milisegundos para frases cortas.

## Comparativa con modelos similares

| Modelo | Parametros | Arquitectura | Salida | Licencia | Despliegue |
|---|---|---|---|---|---|
| Kokoro-82M (Core ML) | 82M | StyleTTS2 + iSTFTNet | 24 kHz | MIT (paquete) / Apache-2.0 (original) | On-device Apple |
| Piper TTS | ~50-100M | VITS (autoregresivo) | 22 kHz | MIT | On-device multiplataforma |
| Coqui TTS (XTTS) | ~500M | VITS + GPT | 24 kHz | MPL-2.0 | On-device / servidor |

La comparativa se basa en información pública de los proyectos. Kokoro-82M destaca por su tamaño reducido y su velocidad en hardware Apple, mientras que Piper es más portable a otras plataformas y Coqui ofrece más idiomas pero con mayor coste computacional.

## Limitaciones y advertencias

- **Idioma**: el modelo está orientado principalmente al inglés; no se garantiza calidad en otros idiomas.
- **Sesgos**: al ser un modelo TTS entrenado con voces específicas, puede presentar sesgos en la pronunciación de nombres o acentos no representados en el dataset de entrenamiento.
- **Alucinación**: no aplica en el sentido de generación de texto, pero puede producir errores de pronunciación o entonación en contextos ambiguos.
- **Licencia**: el paquete Core ML se distribuye bajo MIT, pero el modelo original es Apache-2.0; es necesario verificar la compatibilidad de licencias para uso comercial.
- **Dependencia de hardware**: la especialización ANE es específica de Apple Silicon; en otros hardware la ejecución puede ser más lenta o requerir conversión adicional.
- **Sin soporte para otros formatos**: no se proporcionan pesos en safetensors, GGUF u otros formatos; solo Core ML.

## Enlaces

- [Repositorio HuggingFace del modelo](https://huggingface.co/aoiandroid/kokoro-82m-coreml-macos)
- [Repositorio HuggingFace de la versión Core ML genérica](https://huggingface.co/aoiandroid/kokoro-82m-coreml)
- [GitHub Jud/kokoro-coreml](https://github.com/Jud/kokoro-coreml)
- [Documentación en DeepWiki sobre Kokoro TTS](https://deepwiki.com/FluidInference/mobius/4.2-kokoro-tts)
- [Modelo original Kokoro-82M en coreai-model-zoo](https://github.com/john-rocky/coreai-model-zoo/tree/main/models/kokoro-82m)
