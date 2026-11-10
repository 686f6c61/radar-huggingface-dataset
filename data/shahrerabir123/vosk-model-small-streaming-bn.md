# shahrerabir123/vosk-model-small-streaming-bn

## Resumen

Vosk small streaming bn es un modelo de reconocimiento automático del habla (ASR) para bengalí, publicado por el usuario shahrerabir123 en Hugging Face bajo licencia Apache 2.0. Se trata de una versión "small" y "streaming" de los modelos Vosk, empaquetada en formato ONNX y entrenada con el toolkit k2-fsa/icefall. Su propósito es ofrecer transcripción de voz en bengalí con latencia baja, apta para despliegue en dispositivos con recursos limitados y para procesamiento de audio en tiempo real.

El modelo emplea una arquitectura Zipformer2, una variante de transformer con mecanismos de atención eficientes y estructura jerárquica de codificadores, diseñada específicamente para ASR en streaming. El repositorio ocupa aproximadamente 0,1 GB, lo que confirma su orientación a despliegues ligeros (edge, móvil o servidores modestos) frente a modelos ASR de gran tamaño.

Su relevancia radica en cubrir el bengalí, un idioma con relativamente pocos modelos ASR abiertos de calidad, y en hacerlo con una licencia permisiva (Apache 2.0) y un formato ONNX que facilita la integración en producción mediante sherpa-onnx o el propio runtime de Vosk. No obstante, el autor no ha publicado detalles sobre el número de parámetros, la composición exacta del dataset de entrenamiento ni la longitud de contexto, por lo que varios datos técnicos quedan como no disponibles.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Zipformer2 (transformer con codificador jerárquico, entrenado con k2-fsa/icefall) |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo streaming, procesa audio por fragmentos) |
| Tipos de cuantización | no disponible (pesos distribuidos en ONNX; el autor no detalla variantes) |
| Idiomas soportados | bengalí (bn) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX |

## Arquitectura y entrenamiento

El modelo se basa en Zipformer2, la segunda generación de la arquitectura Zipformer implementada en k2-fsa/icefall. Zipformer2 combina un codificador con resoluciones temporales múltiples (downsampling jerárquico), atención con sesgo relativo y bloques reutilizados entre etapas, lo que reduce el coste computacional manteniendo la precisión. La variante "streaming" está pensada para inferencia incremental: el modelo consume fragmentos de audio y emite hipótesis parciales sin necesidad de disponer de la señal completa, lo que habilita casos de uso en tiempo real.

El entrenamiento se realizó con el toolkit icefall sobre datos en bengalí, aunque la model card no especifica el número de horas de audio, la composición del corpus ni si se aplicaron técnicas de aumento de datos, regularización o ajuste fino con RLHF (no aplicable en ASR). Tampoco se detalla la función de pérdida exacta ni la configuración de decodificación (CTC, transducer o atención conjunta). El autor indica únicamente la versión "0.60" del modelo y remite a los repositorios de Vosk, icefall y sherpa-onnx como referencias técnicas.

## Capacidades

- Reconocimiento automático del habla en bengalí (bn) a partir de audio.
- Modo streaming: procesa audio de forma incremental y puede emitir transcripciones parciales con baja latencia.
- Despliegue ligero: formato ONNX y tamaño de repositorio de ~0,1 GB, adecuado para entornos con memoria limitada.
- Integración con el ecosistema Vosk y sherpa-onnx para inferencia en CPU y dispositivos embebidos.
- No soporta tool calling, function calling ni razonamiento multi-paso: es un modelo puramente ASR.
- No dispone de capacidades multimodales (visión, audio además de voz) ni de modo "thinking".
- Monolingüe: no se declaran capacidades multilingües más allá del bengalí.

## Casos de uso

- Transcripción en tiempo real de reuniones y llamadas en bengalí: el modo streaming permite generar subtítulos parciales mientras se habla, con un consumo de memoria reducido gracias al tamaño "small" del modelo.
- Subtitulado automático de vídeo y audio en plataformas de contenido bengalí: el modelo puede procesar flujos de audio por fragmentos y alinearse con la reproducción, facilitando la accesibilidad.
- Asistentes de voz para dispositivos embebidos: su formato ONNX y su tamaño contenido permiten ejecutarlo en Raspberry Pi, móviles o sistemas de domótica con CPU, sin GPU dedicada.
- Atención al cliente automatizada en bengalí: transcripción de llamadas entrantes para su posterior análisis, enrutamiento o generación de resúmenes mediante un pipeline posterior.
- Dictado y productividad: integración en aplicaciones de escritura por voz para usuarios bengalíes, con retroalimentación incremental gracias a la decodificación streaming.
- Investigación en ASR de bajos recursos: sirve como línea base reproducible (Apache 2.0) para comparar técnicas de entrenamiento con icefall en bengalí, especialmente en escenarios ruidosos (el autor reporta WER en Kathbath Noisy).
- Indexación y búsqueda de archivos de audio: transcripción por lotes de archivos de audio para construir índices de texto searchables en archivos periodísticos o académicos en bengalí.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (WER, no verificados de forma independiente):

| Dataset | Test WER (%) |
|---|---|
| Banspeech | 32,9 |
| Common Voice (bn) | 17,9 |
| FLEURS (bn) | 20,6 |
| IndicTTS | 30,9 |
| Kathbath | 19,3 |
| Kathbath Noisy | 22,5 |
| Respin 2023 | 20,9 |
| Respin 2025 | 16,6 |
| Subakko | 24,6 |

No se han publicado resultados de benchmarks adicionales (por ejemplo, comparativas directas con otros modelos ASR) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precisión; por el tamaño del repositorio (~0,1 GB) se estima un consumo de memoria en el rango de cientos de MB, ejecutable en CPU.
- GPU recomendadas: no se especifican; el modelo está orientado a inferencia en CPU. Cualquier GPU moderna (RTX 3060 o superior) podría acelerar la inferencia si el runtime lo permite, pero no es un requisito.
- Compatibilidad con GPU de consumo: sí, previsiblemente en cualquier GPU de consumo e incluso en CPU, dado el tamaño reducido.
- Opciones de despliegue: runtime de Vosk, sherpa-onnx (soporte nativo de modelos Zipformer2 en ONNX) y otros entornos compatibles con ONNX Runtime.
- Latencia y throughput: no disponibles; el modo streaming está diseñado para baja latencia, pero el autor no publica cifras de RTF (real-time factor) ni de throughput.

## Comparativa con modelos similares

| Modelo | Idioma | Arquitectura | Tamaño | Licencia | Formato |
|---|---|---|---|---|---|
| Vosk small streaming bn (este modelo) | Bengalí | Zipformer2 | ~0,1 GB (repo) | Apache 2.0 | ONNX |
| Vosk modelos oficiales (varias lenguas) | Múltiples | Kaldi/Zipformer según versión | Variable | Apache 2.0 | Varios |
| Whisper (OpenAI) | Multilingüe (incluye bn) | Transformer encoder-decoder | 39M–1,55B parámetros según variante | MIT | PyTorch, ONNX, GGML |
| Wav2Vec2 / XLS-R (Meta) | Multilingüe | Transformer convolucional | 300M–2B parámetros | MIT / CC-BY-NC según variante | PyTorch |

La comparación cuantitativa de WER entre estos modelos no está disponible en la información proporcionada; el autor solo reporta resultados para su propio modelo. Whisper y XLS-R son alternativas multilingües de mayor tamaño y no específicamente optimizadas para streaming en dispositivos embebidos, mientras que este modelo prioriza ligereza y baja latencia para bengalí.

## Limitaciones y advertencias

- Los resultados de WER son declarados por el autor y no han sido verificados de forma independiente (verified: false en la model card).
- El WER en Banspeech (32,9 %) e IndicTTS (30,9 %) es elevado, lo que sugiere un rendimiento limitado en dominios concretos o audio sintético.
- Modelo monolingüe: solo bengalí; no debe esperarse transferencia a otras lenguas.
- No se documentan sesgos específicos, pero al entrenarse con datos de voz bengalí puede presentar peor rendimiento con acentos regionales, habla infantil, ruido de fondo intenso o micrófonos de baja calidad.
- Riesgo de alucinación inherente a los modelos ASR: puede generar transcripciones plausibles pero incorrectas en segmentos de audio ambiguos o con ruido.
- Licencia Apache 2.0: permite uso comercial y modificación, pero el autor no ofrece garantías ni soporte; conviene revisar las licencias de los datasets de entrenamiento (no detalladas) por posibles restricciones subyacentes.
- Al ser un modelo "small", la precisión es inferior a la de modelos ASR grandes; para producción con requisitos estrictos de calidad conviene evaluar alternativas de mayor tamaño.
- No se especifican limitaciones de longitud de audio; el modo streaming procesa fragmentos, pero no se documenta el comportamiento con audios muy largos o con cambios de hablante.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/shahrerabir123/vosk-model-small-streaming-bn
- Vosk (proyecto): https://alphacephei.com/vosk
- k2-fsa/icefall (toolkit de entrenamiento): https://github.com/k2-fsa/icefall
- k2-fsa/sherpa-onnx (runtime de inferencia): https://github.com/k2-fsa/sherpa-onnx
