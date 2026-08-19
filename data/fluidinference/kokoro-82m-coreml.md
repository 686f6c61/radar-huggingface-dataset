# FluidInference/kokoro-82m-coreml

## Resumen

FluidInference/kokoro-82m-coreml es una conversión a CoreML del modelo de síntesis de voz Kokoro-82M, desarrollado por FluidInference para su SDK Swift FluidAudio. Kokoro-82M es un modelo de texto a voz (TTS) ligero de 82 millones de parámetros, originalmente creado por hexgrad, que produce voz natural en inglés con múltiples voces. Esta versión CoreML está optimizada para ejecutarse completamente en el Neural Engine (ANE) de Apple, lo que reduce el uso de memoria y ofrece una inferencia más rápida en dispositivos Apple (macOS, iOS, iPadOS) en comparación con las implementaciones en PyTorch o MLX.

El modelo resuelve el problema de la síntesis de voz de alta calidad y baja latencia en dispositivos locales sin conexión a internet. Su relevancia actual radica en que permite integrar TTS en aplicaciones nativas de Apple con un consumo de recursos muy bajo (pico de 1,5 GB de memoria en proceso), algo crítico para aplicaciones móviles y de escritorio. La licencia Apache 2.0 facilita su uso comercial. El repositorio incluye el modelo en formato CoreML (`.mlmodel`) junto con herramientas de benchmark y el código de inferencia en Swift.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Kokoro-82M (basada en StyleTTS2, adaptada para TTS) |
| Parametros totales | 82 millones |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | no aplica (modelo de audio, sin ventana de contexto textual) |
| Tipos de cuantizacion | CoreML (modelo compilado para ANE, precisión FP16/FP32 según capa) |
| Idiomas soportados | ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | CoreML `.mlmodel` (compilado), compatible con Swift |

## Arquitectura y entrenamiento

Kokoro-82M es un modelo de síntesis de voz basado en la arquitectura StyleTTS2, que emplea un codificador de texto, un predictor de duración y un decodificador de audio. El modelo original fue entrenado por hexgrad con datos de voz en inglés (no se especifica el corpus exacto en la informacion disponible). La version CoreML de FluidInference es una conversion del modelo original a formato CoreML, optimizado para el Neural Engine de Apple. La conversion mantiene los pesos originales y los encapsula en un grafo CoreML que puede ejecutarse via `MLModel` en Swift. No se han realizado cambios en los pesos ni en el entrenamiento; la innovacion principal reside en la adaptacion a CoreML y la integracion en el SDK FluidAudio, que gestiona la carga, compilacion y ejecucion del modelo con un warm-up inicial de aproximadamente 2 segundos en hardware Apple.

## Capacidades

- Sintesis de voz en ingles a partir de texto, con multiples voces predefinidas (por ejemplo, la voz `af_heart` usada en los benchmarks).
- Generacion de audio de duracion variable, desde fragmentos cortos (1 segundo) hasta clips largos (mas de 4 minutos).
- Ejecucion completamente local en dispositivos Apple, sin conexion a internet.
- Bajo uso de memoria (pico de 1,5 GB en proceso durante inferencia).
- Integracion con el SDK FluidAudio para Swift, que proporciona una API de alto nivel para TTS, transcripcion, VAD y diarizacion.
- Compatibilidad con el Neural Engine (ANE) de Apple, lo que reduce la carga de la CPU/GPU y el consumo energetico.

## Casos de uso

- **Audiolibros y lectura de textos largos**: el modelo puede sintetizar capitulos completos (hasta 4.600 caracteres en una sola pasada) con un factor de tiempo real (RTFx) de 27x en hardware Apple, lo que permite generar minutos de audio en segundos.
- **Asistentes de voz en aplicaciones macOS/iOS**: al ejecutarse localmente con baja latencia (inferencia de 0,4 segundos para frases cortas), es adecuado para respuestas de voz en tiempo real en asistentes personales o aplicaciones de productividad.
- **Accesibilidad para personas con discapacidad visual**: la integracion en apps nativas de Apple permite leer contenido de pantalla o documentos sin depender de servicios en la nube.
- **Doblaje y generacion de contenido multimedia**: creadores de contenido pueden generar locuciones en ingles para videos, presentaciones o podcasts, con control sobre la voz y la velocidad.
- **Sistemas de respuesta interactiva (IVR)**: empresas pueden desplegar menus de voz automaticos en aplicaciones de telefonia IP usando el modelo en un servidor macOS, con un throughput de 27x tiempo real.
- **Prototipado rapido de aplicaciones con voz**: desarrolladores de Swift pueden integrar TTS en sus apps con pocas lineas de codigo gracias al SDK FluidAudio, ideal para hackathons o MVPs.

## Benchmarks y rendimiento

Los benchmarks publicados en la model card se realizaron en un MacBook Pro con M4 Pro y 48 GB de RAM, comparando cuatro pipelines: PyTorch en CPU, PyTorch en MPS, MLX y CoreML (Swift). Se midio el tiempo de inferencia para textos de 6 a 4.615 caracteres, con warm-up previo. Los resultados clave:

| Pipeline | RTFx medio (total) | Pico de memoria (GB) |
|---|---|---|
| PyTorch CPU | 16,99x | 4,85 |
| PyTorch MPS | 9,96x (solo 2 tests, fallo en textos largos) | 1,54 |
| MLX | 23,80x | 3,37 |
| CoreML (Swift) | 23,23x | 1,50 |

El modelo CoreML ofrece un factor de tiempo real similar al de MLX (23x), pero con un consumo de memoria significativamente menor (1,5 GB frente a 3,37 GB). En textos largos (test 11), CoreML alcanza un RTFx de 27,2x, superando a MLX (25,8x). PyTorch en CPU es el mas lento y con mayor uso de memoria, y MPS falla en secuencias largas. El warm-up inicial de CoreML es de ~2,3 segundos, frente a 0,17 segundos en PyTorch CPU.

## Requisitos de hardware

- **VRAM/ memoria**: el pico de memoria del proceso es de 1,5 GB en un MacBook Pro M4 Pro, por lo que cabe en cualquier dispositivo Apple con al menos 8 GB de RAM unificada.
- **GPU/ANE**: requiere Apple Silicon (M1 o posterior) para usar el Neural Engine. En Macs con Intel no funcionara correctamente (CoreML puede usar CPU pero no ANE).
- **Dispositivos compatibles**: macOS 13+ (Ventura o posterior), iOS 16+ y iPadOS 16+.
- **Despliegue**: integrado en el SDK Swift FluidAudio (https://github.com/FluidInference/FluidAudio). No se proporcionan opciones para vLLM, llama.cpp u otros motores, ya que es especifico de Apple.
- **Latencia**: warm-up inicial de ~2 segundos en el primer uso; inferencia de 0,4 segundos para frases cortas y 9 segundos para textos de ~4.000 caracteres.
- **Throughput**: RTFx de 23x en media, llegando a 27x en textos largos.

## Comparativa con modelos similares

No se dispone de datos comparativos directos con otros modelos TTS en la informacion proporcionada. Kokoro-82M es conocido por su calidad de voz y eficiencia, pero no se han publicado benchmarks estandarizados (como MOS o WER) en esta model card. Como referencia, otros TTS ligeros como Piper (de Rhasspy) o Coqui TTS (modelos como VITS) son alternativas para CPU, pero no tienen versiones nativas CoreML con soporte ANE. La comparacion con la version original de Kokoro-82M en PyTorch (misma arquitectura) muestra que esta conversion CoreML reduce la memoria en un 69% y mantiene un rendimiento similar al de MLX, siendo la opcion mas eficiente en memoria para Apple.

## Limitaciones y advertencias

- **Solo ingles**: el modelo no soporta otros idiomas, lo que limita su uso en aplicaciones multilingues.
- **Sesgos de voz**: las voces predefinidas pueden reflejar sesgos de genero o acentos del corpus de entrenamiento; no se documenta la diversidad de voces.
- **Riesgo de alucinacion**: aunque es un modelo TTS, puede producir pronunciaciones incorrectas para nombres propios o terminos tecnicos poco frecuentes.
- **Dependencia de Apple**: el formato CoreML solo es utilizable en ecosistema Apple; no es portable a Linux o Windows sin reconversion.
- **Compilacion inicial**: el primer uso del modelo requiere ~15 segundos de compilacion (segun la model card), aunque los usos posteriores son mas rapidos (~2 segundos de carga).
- **Licencia**: Apache 2.0 permite uso comercial, pero hay que mantener el aviso de copyright y atribucion.
- **Bug de memoria en PyTorch**: la model card menciona un leak de memoria en la version original de PyTorch (https://github.com/hexgrad/kokoro/issues/152); la conversion CoreML no lo sufre.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/FluidInference/kokoro-82m-coreml
- Repositorio FluidAudio (Swift SDK): https://github.com/FluidInference/FluidAudio
- Documentacion DeepWiki sobre KokoroModel y TTS Manager: https://deepwiki.com/FluidInference/FluidAudio/3.4.1-kokoro-model-and-synthesis
- Repositorio original de Kokoro: https://github.com/hexgrad/kokoro
- Repositorio de laishere para Kokoro ANE (fuente de inspiracion): https://github.com/laishere/kokoro-coreml
