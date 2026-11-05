# mlx-community/nemotron-labs-unified-asr-0.6b-8bit

## Resumen

Nemotron-labs-unified-asr-0.6b es un modelo de reconocimiento automático del habla (ASR) desarrollado por NVIDIA, distribuido originalmente en formato NeMo y convertido aquí a MLX por la comunidad mlx-community para su ejecución en Apple Silicon. Con 626,7 millones de parámetros, unifica en un único checkpoint la transcripción offline y el streaming con latencias que van de 160 ms a 2,08 s, cubriendo 25 idiomas europeos con puntuación y capitalización automáticas.

La relevancia de esta conversión concreta reside en que hace accesible el modelo en hardware Apple mediante la librería mlx-audio, tanto desde Python como desde Swift, con pesos cuantizados a 8 bits (grupo 64) en capas Linear y Embedding y bfloat16 en el resto, lo que reduce el repositorio a 744 MB. El modelo base emplea una arquitectura RNNT (Recurrent Neural Network Transducer), según indican las etiquetas del repositorio, adecuada para streaming de baja latencia por su naturaleza incremental.

Frente a alternativas de streaming previas del mismo ecosistema, esta versión 8-bit reporta mejoras medibles en un conjunto de dictado de 260 clips en inglés y francés: 60,7 % de recall de términos y 6,5 % de WER en el resto de palabras, frente a 55,5 % y 11,7 % de `nemotron-3.5-asr-streaming-0.6b-8bit`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | RNNT (Recurrent Neural Network Transducer), segun etiquetas del repositorio |
| Parametros totales | 626.702.592 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | contexto izquierdo de streaming de 5,6 s (configuracion de referencia); se recomienda mantener 2 s o mas |
| Tipos de cuantizacion | 8-bit (grupo 64) en Linear y Embedding, bfloat16 en el resto; disponibles tambien bf16 (1,25 GB) y 4-bit (472 MB) |
| Idiomas soportados | 25: bg, hr, cs, da, nl, en, et, fi, fr, de, el, hu, it, lv, lt, mt, pl, pt, ro, sk, sl, es, sv, ru, uk |
| Licencia | OpenMDW 1.1 |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

El modelo base es un RNNT de NVIDIA, una arquitectura transductora que combina un encoder acústico con un predictor y una red de unión, lo que permite emitir tokens de forma incremental sin necesidad de re-segmentar toda la señal. Esta propiedad es la que habilita el streaming con latencias de 160 ms a 2,08 s. La conversión a MLX mantiene las capas Linear y Embedding en 8 bits con grupo de 64 y el resto en bfloat16, preservando la fidelidad numérica del modelo original: el port en float32 reproduce los frames del encoder de NeMo 3.1 con una diferencia de 8,2e-6 y genera los mismos tokens en las configuraciones de 5,6 s / 80 ms / 240 ms, 0,8 s / 80 ms / 240 ms y 0,8 s / 160 ms / 400 ms.

El streaming es bufferizado: en cada paso se re-codifican 5,6 s de contexto izquierdo junto con el nuevo chunk y su contexto derecho. La entrada es audio mono a 16 kHz con una duración mínima de 80 ms. No se dispone en la información proporcionada de detalles sobre el volumen de datos de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o ajuste por preferencias; la model card de origen (NVIDIA) es la referencia para esos datos.

## Capacidades

- Transcripción de voz a texto offline en 25 idiomas europeos, con puntuación y capitalización automáticas.
- Streaming ASR con latencias configurables entre 160 ms y 2,08 s mediante sesiones de streaming bufferizadas.
- Selección explícita de idioma en inferencia (`language="en"`, etc.), con advertencia de que el modo `auto` puede comprometer tokens iniciales en el idioma equivocado a baja latencia.
- Control del retardo de transcripción (`transcription_delay_ms`) y del tamaño de chunk (`chunkMs`).
- Soporte de contexto izquierdo configurable, con recomendación de mantener 2 s o más para evitar degradación de precisión.
- API en Python mediante `mlx_audio.stt` y en Swift mediante `mlx-audio-swift`.
- No se documentan en la información disponible capacidades de tool calling, agentes, visión ni audio más allá del ASR.

## Casos de uso

- Dictado en tiempo real en aplicaciones de escritorio macOS: el modelo se integra vía mlx-audio-swift con sesiones de streaming de 320 ms de chunk, ofreciendo transcripción incremental con puntuación en el Mac del usuario sin depender de la nube.
- Subtitulado de reuniones y videollamadas: la latencia de 160 ms a 2,08 s y el contexto izquierdo de 5,6 s permiten generar subtítulos con pocas palabras de retraso en 25 idiomas europeos, útil para equipos multilingües.
- Transcripción por lotes de archivos de audio: la misma checkpoint opera en modo offline, de modo que un pipeline puede procesar grabaciones completas sin un segundo modelo.
- Asistentes de voz embebidos en aplicaciones iOS/macOS: el tamaño de 744 MB en 8 bits y el consumo moderado por paso (68,6 ms por paso de 80 ms en M1 Pro) lo hacen viable en portátiles Apple Silicon.
- Indexación y búsqueda de contenido hablado: transcripción de archivos de audio de archivo o podcasts en varios idiomas para alimentar motores de búsqueda o sistemas RAG sobre texto.
- Accesibilidad: generación de transcripciones en vivo para personas con discapacidad auditiva en entornos donde no se puede enviar audio a servicios externos, al ejecutarse localmente.
- Anotación de datasets de voz: pre-etiquetado de corpus multilingües con puntuación y capitalización, reduciendo el trabajo manual de revisión.

## Benchmarks y rendimiento

Los datos de WER publicados por NVIDIA (FLEURS, MCV, MLS y conjuntos Open ASR en inglés) corresponden al modelo bf16 en NeMo, no a esta conversión MLX, según advierte la propia model card. Los datos específicos de esta conversión son los siguientes:

| Metrica | Valor |
|---|---|
| Paridad con NeMo 3.1 (float32, frames de encoder) | diferencia de 8,2e-6; mismos tokens en 5,6 s / 80 ms / 240 ms, 0,8 s / 80 ms / 240 ms y 0,8 s / 160 ms / 400 ms |
| Paridad con NeMo 3.1 (Swift, bfloat16) | texto identico en 10 de 12 clips (3 ediciones de palabra en 355 palabras) |
| Recall de terminos (streaming 320 ms, 8-bit, 260 clips EN/FR) | 60,7 % (frente a 55,5 % de nemotron-3.5-asr-streaming-0.6b-8bit) |
| WER en el resto de palabras (mismo conjunto) | 6,5 % (frente a 11,7 % del modelo anterior) |
| Tiempo medio por paso de 80 ms (M1 Pro, Swift, 320 ms latencia) | 8-bit: 68,6 ms; 4-bit: 68,7 ms; bf16: 64,8 ms |
| Con activaciones float16 | 57,4 ms por paso (-16 %), misma precision en clips cortos |
| Chunk de 160 ms con 160 ms de contexto derecho | 34,7 ms por paso (+0,6 puntos de WER en FLEURS); con float16, 26,9 ms y 896 MB de pico, estable durante 30 minutos |

## Requisitos de hardware

- VRAM/unificada estimada: 744 MB de pesos en 8 bits; pico de 896 MB con chunk de 160 ms y activaciones float16. La versión 4-bit ocupa 472 MB y la bf16 1,25 GB.
- GPU recomendadas: Apple Silicon (M1 Pro o superior validado en la model card). No se documenta soporte para CUDA, A100, H100 ni RTX 4090, ya que el formato es MLX.
- Cabe en cualquier Mac con Apple Silicon; el consumo medido en M1 Pro es de 68,6 ms por paso de 80 ms en 8 bits, lo que deja margen para streaming en tiempo real.
- Opciones de despliegue: mlx-audio (Python) y mlx-audio-swift (Swift). No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este formato.
- Latencia: 160 ms a 2,08 s configurables; throughput dependiente del chunk y del contexto derecho elegidos.
- Nota: la cuantización ahorra memoria, no tiempo; el paso está limitado por cómputo a 75 frames.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / streaming | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| nemotron-labs-unified-asr-0.6b-8bit (este) | 626,7 M | contexto izq. 5,6 s; 160 ms–2,08 s | 25 | OpenMDW 1.1 | MLX safetensors |
| nemotron-3.5-asr-streaming-0.6b-8bit | no disponible | streaming | no disponible | no disponible | MLX |
| nemotron-labs-unified-asr-0.6b bf16 (T0mSIlver) | 626,7 M | mismo modelo, 1,25 GB | 25 | OpenMDW 1.1 | MLX safetensors |
| nemotron-labs-unified-asr-0.6b 4-bit (T0mSIlver) | 626,7 M | mismo modelo, 472 MB | 25 | OpenMDW 1.1 | MLX safetensors |

La comparación directa con `nemotron-3.5-asr-streaming-0.6b-8bit` en el conjunto de 260 clips arroja 60,7 % frente a 55,5 % de recall de términos y 6,5 % frente a 11,7 % de WER en el resto de palabras, a favor de este modelo.

## Limitaciones y advertencias

- El modo `auto` de idioma puede comprometer los primeros tokens en el idioma equivocado a baja latencia; se recomienda pasar el idioma explícitamente.
- Con contexto izquierdo inferior a 2 s, NVIDIA reporta degradación de precisión.
- Los WER publicados por NVIDIA corresponden al modelo bf16 en NeMo, no a esta conversión MLX; no deben citarse como métricas de esta versión.
- El streaming es bufferizado y re-codifica 5,6 s de contexto en cada paso, lo que implica coste computacional recurrente proporcional al contexto elegido.
- Solo se ha validado en hardware Apple Silicon; no hay soporte documentado para CUDA ni GPUs NVIDIA en este formato.
- La licencia OpenMDW 1.1 es la del modelo original y rige también los pesos derivados; debe revisarse el acuerdo antes de uso comercial.
- No se documentan en la información disponible sesgos específicos, tasas de alucinación ni limitaciones por idioma más allá de las 25 lenguas listadas.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia de uso en producción.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/mlx-community/nemotron-labs-unified-asr-0.6b-8bit
- Modelo base: https://huggingface.co/nvidia/nemotron-labs-unified-asr-0.6b
- Versión bf16: https://huggingface.co/T0mSIlver/nemotron-labs-unified-asr-0.6b-bf16
- Versión 4-bit: https://huggingface.co/T0mSIlver/nemotron-labs-unified-asr-0.6b-4bit
- Licencia OpenMDW 1.1: https://github.com/OpenMDW/OpenMDW/blob/main/1.1/LICENSE.OpenMDW-1.1
