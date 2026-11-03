# litert-community/nemotron-3.5-asr-streaming-0.6b

## Resumen

Nemotron 3.5 ASR Streaming 0.6B para LiteRT es una conversión optimizada del modelo de reconocimiento automático de voz `nvidia/nemotron-3.5-asr-streaming-0.6b`, publicada por la comunidad `litert-community`. El modelo original, desarrollado por NVIDIA, es un sistema de ASR en streaming que transcribe audio en 40 variantes de idioma, diseñado para funcionar con latencia baja sobre fragmentos de audio de 320 ms a medida que llegan. Esta versión lo empaqueta en formato `.tflite` para su despliegue en dispositivos Android, con soporte para CPU, GPU y NPU.

La relevancia de esta conversión radica en que traslada un modelo de ASR de calidad competitiva al ecosistema LiteRT, lo que permite ejecutarlo localmente en teléfonos móviles sin depender de la nube. En una prueba sobre un subconjunto de 655 enunciados de LibriSpeech test-clean, la versión para NPU de un Galaxy S26 alcanza un WER del 2,630 %, prácticamente idéntico al 2,638 % del modelo original en PyTorch con float32, lo que demuestra que la cuantización y el reempaquetado no degradan la precisión de forma apreciable.

El modelo combina un encoder FastConformer con decodificación RNN-T y un mecanismo de prompt de idioma, manteniendo el diseño de streaming con lookahead 3. La conversión fue realizada con litert-torch 0.10.0 y ai-edge-quantizer 0.10.0 para LiteRT 2.3.0, y se distribuye bajo licencia OpenMDW 1.1.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | FastConformer (encoder) + RNN-T (decoder), streaming con lookahead 3 |
| Parámetros totales | 0,6 B (aproximado, según nombre del modelo) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | streaming por chunks de 320 ms; caches de atención de 56 frames por capa |
| Tipos de cuantización | float32, float16, int8 (decoder) |
| Idiomas soportados | 40 variantes: en, es, de, fr, it, ar, ja, ko, pt, ru, hi, zh, vi, he, nl, cs, da, pl, no, sv, th, tr, bg, el, et, fi, hr, hu, lt, lv, ro, sk, uk, mt, sl |
| Licencia | OpenMDW 1.1 |
| Formato de pesos | TFLite (`.tflite`), tokenizer en JSON |

## Arquitectura y entrenamiento

El modelo original es un encoder FastConformer cache-aware con decodificador RNN-T y prompt de idioma. La conversión preserva el diseño de streaming con lookahead 3, lo que significa que procesa audio en fragmentos de 320 ms y mantiene caches de atención y convolución entre fragmentos. Cada cache es una entrada y salida del grafo, de modo que el host transporta el estado de un chunk al siguiente. Los grafos son módulos PyTorch planos que leen los pesos del checkpoint (sin NeMo) y se exportaron con litert-torch.

El pipeline completo es: audio (16 kHz mono) → chunks de 320 ms → mel → pre (submuestreo 8×) → conformer (caches de entrada y salida) → decodificación greedy RNN-T → texto. El encoder tiene 24 capas conformer con 8 cabezas de atención, dimensión de modelo 1.024 y proyección de salida de 640. Los caches de atención almacenan los últimos 56 frames de claves y valores por capa, y el cache de convolución guarda el contexto de 8 frames por capa.

No se dispone de información en la documentación proporcionada sobre el volumen de datos de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO. La model card original de NVIDIA no se incluye en la información disponible.

## Capacidades

- Reconocimiento automático de voz en streaming con latencia de chunk de 320 ms.
- Transcripción en 40 variantes de idioma mediante prompt de idioma (`prompt_dictionary` en `processor_config.json`).
- Decodificación greedy RNN-T con tokenizer propio (`tokenizer.json`).
- Ejecución en CPU, GPU y NPU de dispositivos Android mediante LiteRT.
- Soporte de cuantización float16 e int8 con precisión prácticamente equivalente a float32 en la prueba realizada.
- Manejo de estado entre chunks mediante caches explícitos (atención, convolución y submuestreo).
- No se mencionan capacidades de tool calling, agentes, visión ni audio más allá del ASR.

## Casos de uso

- Transcripción en tiempo real en aplicaciones móviles: el modelo procesa audio en chunks de 320 ms y puede integrarse en apps Android para subtitular conversaciones en directo sin conexión a la nube, con latencia de 25,4 ms por chunk en NPU de Galaxy S26.
- Dictado por voz multiplataforma: con soporte para 40 variantes de idioma, puede usarse en teclados y asistentes de escritura que necesiten reconocimiento en varios idiomas sin cambiar de modelo.
- Subtitulado de reuniones y videollamadas: el diseño de streaming con caches permite transcribir audio continuo manteniendo coherencia entre fragmentos, adecuado para actas automáticas en dispositivos locales.
- Asistentes de voz embebidos: al ejecutarse en NPU o CPU de teléfonos, permite comandos de voz con baja latencia y sin enviar audio a servidores externos, útil para privacidad.
- Transcripción de notas de voz y mensajes: integrable en apps de mensajería para convertir audio en texto en el propio dispositivo, con consumo de memoria de aproximadamente 1,22 GB en NPU.
- Accesibilidad para personas con discapacidad auditiva: subtitulado en vivo de conversaciones presenciales en el móvil, con soporte multilingüe para entornos diversos.
- Procesamiento por lotes en servidores con CPU: la variante float32 en Python (2,46 GB) permite transcribir archivos de audio en entornos de escritorio o servidores sin GPU.

## Benchmarks y rendimiento

| Métrica | Galaxy S26 NPU | Galaxy S26 GPU | Galaxy S26 CPU (f16) | Pixel 11 Pro CPU |
|---|---|---|---|---|
| Latencia mediana por chunk (10-25 enunciados) | 25,4 ms | 73,3 ms | 40,2 ms | 70,3 ms |
| Latencia mediana por chunk (655 enunciados) | 27,0 ms | 63,4 ms | 64,7 ms | 111,4 ms (5 hilos) |
| WER en LibriSpeech test-clean (655 enunciados) | 2,630 % | no disponible | no disponible | no disponible |

Referencia: el modelo original en PyTorch float32 obtiene un WER del 2,638 % en el mismo subconjunto, según la model card.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia: aproximadamente 1,22 GB para el conjunto NPU (`mel` + `conformer_pre_f16` + `decoder_i8`), 1,26 GB para CPU (`mel` + `pre` + `conformer_f16_cpu` + `decoder_i8`), 1,30 GB para GPU (`mel` + `pre` + `conformer_f16` + `decoder_f32`) y 2,46 GB para la variante float32 en escritorio.
- GPU recomendadas: no se especifican modelos de GPU de escritorio; las mediciones se realizaron en GPU integrada de Galaxy S26 y en CPU de Pixel 11 Pro.
- ¿Cabe en GPU consumer? No se proporcionan datos para GPUs de escritorio; el modelo está orientado a dispositivos móviles Android.
- Opciones de despliegue: LiteRT 2.3.0 con su API C (runner de Android incluido: `nemotron_stream_runner.cc` y `build_android.sh`); no se mencionan vLLM, llama.cpp, Ollama ni TGI, dado que es un modelo de ASR y no de generación de texto.
- Latencia y throughput: latencias medianas por chunk de 25,4-27,0 ms en NPU, 63,4-73,3 ms en GPU y 40,2-64,7 ms en CPU de Galaxy S26; 70,3-111,4 ms en CPU de Pixel 11 Pro.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. El modelo base `nvidia/nemotron-3.5-asr-streaming-0.6b` es la referencia directa, con un WER del 2,638 % en float32 frente al 2,630 % de esta conversión en NPU. No se han proporcionado datos de otros sistemas de ASR en streaming para establecer una comparativa.

## Limitaciones y advertencias

- El modelo está diseñado exclusivamente para reconocimiento de voz; no genera texto libre ni admite otras modalidades.
- El WER puede variar según el idioma, el acento y la calidad del audio; solo se ha reportado una medición en LibriSpeech test-clean en inglés.
- La licencia OpenMDW 1.1 debe revisarse para uso comercial; no se detallan en la información disponible las restricciones concretas.
- Las mediciones de latencia se realizaron en dispositivos concretos (Galaxy S26 y Pixel 11 Pro) y pueden no extrapolarse a otros hardware.
- El pipeline requiere gestionar manualmente los caches entre chunks; un uso incorrecto del estado puede degradar la transcripción.
- El bucle del ejemplo original en transformers no transcribe el último chunk parcial del audio; esta conversión añade 5.520 muestras de ceros para mitigarlo, pero es un detalle a verificar en producción.
- No se dispone de información sobre sesgos, alucinaciones o limitaciones de contexto más allá de las inherentes al ASR.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica que es una conversión reciente y poco validada por la comunidad.

## Enlaces

- [HuggingFace: litert-community/nemotron-3.5-asr-streaming-0.6b](https://huggingface.co/litert-community/nemotron-3.5-asr-streaming-0.6b)
- [Modelo base: nvidia/nemotron-3.5-asr-streaming-0.6b](https://huggingface.co/nvidia/nemotron-3.5-asr-streaming-0.6b)
- [Licencia OpenMDW 1.1](https://huggingface.co/litert-community/nemotron-3.5-asr-streaming-0.6b/blob/main/LICENSE)
