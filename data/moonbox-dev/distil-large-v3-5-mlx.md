# moonbox-dev/distil-large-v3.5-MLX

## Resumen

Distil-Whisper large-v3.5 MLX es una conversión a formato MLX del modelo de reconocimiento automático del habla Distil-Whisper large-v3.5, publicada por moonbox-dev para su ejecución nativa en Macs con Apple Silicon. El modelo original lo desarrolló el equipo de Distil-Whisper (Hugging Face) como una versión destilada de Whisper large-v3, orientada a transcripción en inglés con una huella de memoria y una latencia mucho menores que el modelo del que deriva.

El repositorio no entrena ni modifica el modelo: solo convierte los pesos a MLX en dos precisiones (bf16 y fp16) y los empaqueta con la librería mlx-audio. El resultado pesa 1,51 GB por precisión, frente al tamaño del large-v3 completo, lo que permite ejecutar ASR de calidad cercana a Whisper large en un portátil Apple sin GPU dedicada.

Es relevante porque cubre un hueco concreto: transcripción local, privada y de baja latencia en hardware Apple, con una degradación de precisión medida y documentada por el autor (WER 1,34 % frente al 1,15 % del original en la misma prueba). La licencia MIT facilita su integración en productos comerciales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder de tipo Whisper, destilado (Distil-Whisper) |
| Parametros totales | no disponible (pesos de 1,51 GB en bf16/fp16) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible (Whisper procesa ventanas de audio de 30 s) |
| Tipos de cuantizacion | bf16 y fp16 (no se publican builds de 8 o 4 bits) |
| Idiomas soportados | ingles (el modelo base Distil-Whisper large-v3.5 esta orientado a ingles; el resto no disponible) |
| Licencia | MIT |
| Formato de pesos | safetensors en carpetas `bf16/` y `fp16/`, ejecutables con mlx-audio |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Whisper: un transformer encoder-decoder que procesa espectrogramas Mel de audio en ventanas de 30 segundos y genera texto autoregresivamente, con tokens especiales para marcas de tiempo y detección de idioma. Distil-Whisper aplica destilación de conocimiento desde Whisper large-v3 hacia un decoder con menos capas, manteniendo el encoder, lo que reduce el coste de inferencia sin reentrenar desde cero. El modelo base declara entrenamiento sobre datos de audio en inglés, aunque la model card de esta conversión no detalla el número de tokens ni la composición exacta del dataset.

Esta publicación concreta no entrena nada: moonbox-dev convierte los pesos a MLX en bf16 y fp16 y conserva tokenizer, configs y preprocessor del original. El autor documenta una verificación de equivalencia numérica frente al modelo PyTorch original (WER 1,34 % frente a 1,15 %, con un 0,2 % de palabras leídas de forma distinta, una sola palabra), lo que da una idea del impacto de la conversión. No se mencionan innovaciones adicionales como decodificación especulativa o atención lineal.

## Capacidades

- Reconocimiento automático del habla (ASR) en inglés sobre audio de hasta 30 segundos por ventana, con segmentación para audios más largos.
- Generación de marcas de tiempo a nivel de segmento, útil para subtitulado.
- Transcripción de audio con ruido moderado y distintos acentos en inglés, heredada de Whisper large-v3.
- Ejecución nativa en Apple Silicon mediante MLX y mlx-audio, sin dependencia de CUDA.
- No soporta tool calling, function calling, razonamiento multi-paso ni agentes: es un modelo puramente ASR.
- No dispone de modo thinking, visión, audio generativo ni capacidades multimodales más allá de la entrada de audio.
- Capacidades multilingües limitadas: el modelo base está especializado en inglés.

## Casos de uso

- Transcripción local de reuniones en macOS: ejecutar el modelo con mlx-audio en un MacBook para convertir grabaciones en actas de texto sin enviar audio a la nube, aprovechando la licencia MIT y el tamaño de 1,51 GB.
- Subtitulado automático de vídeo: generar marcas de tiempo por segmento con el modelo y volcarlas a SRT/VTT en un pipeline de postproducción en Apple Silicon.
- Dictado por voz en aplicaciones de escritorio: integrar mlx-audio para transcripción en tiempo real de audio corto, con latencia baja gracias a la destilación y a la ejecución en la GPU integrada del chip.
- Indexación y búsqueda de archivos de audio: transcribir grandes volúmenes de podcasts o grabaciones en inglés por lotes en un Mac mini o Mac Studio, con coste marginal cero por minuto procesado.
- Prototipado de asistentes de voz: usar el modelo como capa ASR en una demo local que combine transcripción y un LLM, sin depender de APIs externas y con datos que no salen del dispositivo.
- Cumplimiento y privacidad en entornos regulados: desplegar transcripción en equipos Apple dentro de la organización para material sensible (entrevistas, llamadas), evitando el envío de audio a terceros.
- Evaluación comparativa de ASR: servir como referencia rápida en benchmarks internos de precisión y latencia frente a Whisper large-v3 en hardware Apple, gracias a la verificación de WER publicada por el autor.

## Benchmarks y rendimiento

El autor solo publica una comparación de fidelidad de la conversión frente al modelo PyTorch original sobre las mismas entradas:

| Metrica | Distil-Whisper large-v3.5 (original) | Build MLX bf16/fp16 |
|---|---|---|
| WER | 1,15 % | 1,34 % |
| Palabras leidas de forma distinta | referencia | 0,2 % (una palabra) |

No se han publicado resultados de benchmarks estándar (LibriSpeech, Common Voice, etc.) ni comparativas con otros modelos ASR en la información disponible.

## Requisitos de hardware

- VRAM/memoria unificada: aproximadamente 1,5 GB solo para los pesos en bf16 o fp16; hay que sumar el overhead de mlx-audio, el encoder de audio y los buffers de decodificación, por lo que conviene reservar 2-3 GB.
- Hardware objetivo: Macs con Apple Silicon (series M1, M2, M3, M4 y superiores). Funciona en equipos con 8 GB de memoria unificada, aunque 16 GB dan más margen para procesar audio en paralelo.
- No está pensado para GPU NVIDIA: la conversión es específica de MLX y no se publican pesos GGUF ni safetensors estándar para CUDA.
- Despliegue: librería mlx-audio sobre MLX; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la información proporcionada; la destilación del modelo base reduce el coste del decoder frente a Whisper large-v3, pero el autor no publica cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto de audio | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| Distil-Whisper large-v3.5 MLX (esta ficha) | no disponible (1,51 GB en bf16) | ventanas de 30 s | ingles | MIT | safetensors MLX |
| distil-whisper/distil-large-v3.5 (original) | no disponible | ventanas de 30 s | ingles | MIT | safetensors PyTorch |
| Whisper large-v3 | no disponible | ventanas de 30 s | multilingue | MIT | safetensors, GGUF, etc. |
| Whisper small / base | no disponible | ventanas de 30 s | multilingue | MIT | safetensors, GGUF, etc. |

La comparación se limita a datos estructurales: no hay cifras de rendimiento comparables publicadas para esta conversión frente a las alternativas.

## Limitaciones y advertencias

- Es un modelo solo para inglés; no debe usarse para transcribir castellano u otros idiomas sin verificar antes la calidad, que probablemente sea deficiente.
- El WER de la conversión MLX es ligeramente superior al del original (1,34 % frente a 1,15 % en la prueba del autor), por lo que no es una réplica bit a bit.
- Como todo modelo Whisper, puede alucinar texto en silencios, música o audio de baja calidad; conviene aplicar detección de silencios y revisión humana en producción.
- El modelo base puede reproducir sesgos presentes en los datos de entrenamiento de Whisper (variedades dialectales, nombres propios, términos técnicos).
- Ventana de 30 segundos por defecto: audios largos requieren segmentación y pueden perder coherencia en los cortes.
- Solo se distribuyen pesos bf16 y fp16; no hay builds cuantizados a 8 o 4 bits, lo que limita la reducción de memoria.
- Dependencia exclusiva del ecosistema MLX y Apple Silicon: no es portable a CUDA ni a CPU x86 sin reconvertir el modelo.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de uso en producción ni comunidad que valide la conversión más allá de la prueba del autor.
- La licencia MIT permite uso comercial, pero se recomienda conservar la atribución al modelo base y revisar los términos del repositorio original de Distil-Whisper.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/moonbox-dev/distil-large-v3.5-MLX
- Modelo base: https://huggingface.co/distil-whisper/distil-large-v3.5
- Paper de Distil-Whisper: https://arxiv.org/abs/2311.00430
- Paper de Whisper (Robust Speech Recognition via Large-Scale Weak Supervision): https://arxiv.org/abs/2212.04356
- Paper de SpecAugment: https://arxiv.org/abs/1904.08779
- Paper de LibriSpeech: https://arxiv.org/abs/1910.13267
- Librería mlx-audio: no disponible en la información proporcionada
- Repositorio MLX de Apple: no disponible en la información proporcionada
