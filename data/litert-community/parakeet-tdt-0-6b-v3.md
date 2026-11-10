# litert-community/parakeet-tdt-0.6b-v3

## Resumen

Parakeet-TDT-0.6B-v3 es un modelo de reconocimiento automático del habla (ASR) desarrollado originalmente por NVIDIA y empaquetado por la comunidad `litert-community` para su ejecución totalmente local en dispositivos. Combina un codificador FastConformer de 600 millones de parámetros con un decodificador Token-and-Duration Transducer (TDT), y se distribuye como un archivo `.litertlm` autocontenido para el runtime LiteRT-LM y la tarea `AudioTranscriber` de MediaPipe de Google.

El modelo resuelve el problema de la transcripción multilingüe en el dispositivo (Android, iOS, macOS, Linux, Web y C++) sin dependencia de red ni de Python: incluye en un único archivo el codificador cuantizado a INT8, el decodificador TDT con estado, un tokenizador SentencePiece multilingüe de 8.192 tokens y los metadatos del front-end log-mel (remuestreador a 16 kHz y 128 bins Slaney). Soporta 25 idiomas europeos con detección automática de idioma, puntuación y capitalización.

Su relevancia actual radica en la eficiencia: en un Galaxy S24 Ultra transcribe entre 9,5 y 15,6 veces más rápido que en tiempo real (RTF de 0,06 a 0,11) con un pico de memoria de 765-779 MB, lo que supone 3,2 veces menos memoria y 3,0 veces más velocidad que la versión FP32, manteniendo una precisión equivalente (WER medio de 5,07-5,15 % frente a 5,24 % del checkpoint sin cuantizar).

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | FastConformer (encoder) + Token-and-Duration Transducer, TDT (decoder) |
| Parámetros totales | 600 M (0,6 B) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | Ventanas deslizantes de 5 s con solapamiento configurable (`overlap_ratio` 0,4-0,5); audio de longitud arbitraria |
| Tipos de cuantización | INT8 (dynamic range) y FP32; variantes AOT para NPU |
| Idiomas soportados | 25: bg, hr, cs, da, nl, en, et, fi, fr, de, el, hu, it, lv, lt, mt, pl, pt, ro, sk, sl, es, sv, ru, uk |
| Licencia | CC-BY-4.0 |
| Formato de pesos | `.litertlm`, `.tflite` (INT8 y FP32, stateful y stateless), variantes NPU AOT por SoC |

## Arquitectura y entrenamiento

El modelo es una implementación de la familia Parakeet de NVIDIA: un codificador FastConformer (variante de Conformer con atención subsampleada) seguido de un decodificador Token-and-Duration Transducer (TDT), que predice conjuntamente tokens y duraciones en lugar de depender únicamente de la alineación CTC o de un transducer clásico. Esta combinación reduce la latencia de decodificación y mejora la eficiencia en streaming. El decodificador incorpora una LSTM de 2 capas con estados ocultos y de celda de forma `[2, 1, 640]`.

El paquete de `litert-community` no reentrena el modelo, sino que cuantiza y convierte el checkpoint `nvidia/parakeet-tdt-0.6b-v3` a formatos ejecutables en dispositivo. La cuantización INT8 de rango dinámico reduce el tamaño de 2,42 GB a 615 MB y acelera la inferencia en CPU ARM64 entre 3,0 y 3,4 veces mediante instrucciones SIMD `SDOT`/`I8MM`. El bundle incluye un tokenizador SentencePiece multilingüe unificado de 8.192 tokens y un protobuf `Speech2TextMetadata` con la configuración del front-end (remuestreador a 16 kHz, 128 bins log-mel Slaney). No se dispone de información sobre la composición del dataset de entrenamiento original ni sobre el uso de RLHF/DPO en la información proporcionada.

## Capacidades

- Transcripción de voz a texto multilingüe en 25 idiomas europeos con detección automática de idioma.
- Puntuación y capitalización automáticas en la salida.
- Procesamiento de audio de longitud arbitraria mediante ventanas deslizantes de 5 s con solapamiento configurable y alineación de costuras por programación dinámica con marcas de tiempo a nivel de palabra (`TimestampTextMerger`).
- Modo streaming con transiciones sin copia del estado LSTM entre decodificación multi-token y single-token.
- Ejecución totalmente local sin red ni Python, en Android, iOS, macOS, Linux, Web y C++.
- Aceleración por NPU en SoCs concretos (Google Tensor, Qualcomm Snapdragon, MediaTek Dimensity) mediante variantes AOT.
- No soporta tool calling, function calling ni razonamiento multi-paso: es un modelo puramente ASR.

## Casos de uso

- Transcripción en tiempo real en apps móviles: integración con la tarea `AudioTranscriber` de MediaPipe en Android e iOS para dictado y subtitulado en vivo, aprovechando el RTF de 0,06-0,11 y el bajo consumo de memoria (765-779 MB).
- Subtitulado de reuniones y videollamadas: procesamiento de audio de longitud arbitraria con ventanas de 5 s y alineación de costuras, adecuado para generar subtítulos con marcas de tiempo por palabra.
- Asistentes de voz offline: el modelo funciona sin red, lo que permite asistentes en dispositivos sin conectividad o con requisitos de privacidad estrictos, con detección automática de idioma entre 25 lenguas europeas.
- Transcripción de notas de voz y podcasts: el soporte multilingüe con puntuación y capitalización permite generar transcripciones legibles directamente, sin postprocesado adicional.
- Accesibilidad: subtitulado automático para personas con discapacidad auditiva en aplicaciones de vídeo, con ejecución local que evita enviar audio a servidores.
- Aplicaciones de borde en vehículos y dispositivos embebidos: las variantes NPU AOT para Snapdragon SA8255 y SA8295 (plataformas automotrices) permiten transcripción en cabina con aceleración hardware.
- Procesamiento por lotes en servidores sin GPU: la variante INT8 stateful en CPU permite transcribir grandes volúmenes de audio con un consumo de memoria contenido.

## Benchmarks y rendimiento

| Métrica | Valor |
|---|---|
| WER medio (benchmark streaming en inglés, 5 datasets, 280 utterances, 35,6 min) | 5,07 %-5,15 % (INT8) |
| WER medio del checkpoint FP32 de referencia | 5,24 % |
| Diferencia INT8 vs. FP32 | 0,09-0,17 pp |
| RTF (Galaxy S24 Ultra, CPU) | 0,06-0,11 |
| RTFx medio | 12,1× |
| Pico de memoria (INT8) | 765-779 MB |
| Pico de memoria (FP32) | 2.458-2.478 MB |
| Aceleración INT8 vs. FP32 en CPU ARM64 | 3,0-3,4× |
| Reducción de tamaño en disco | 2,42 GB → 615 MB (4×) |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la información disponible, al no tratarse de un modelo de lenguaje.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia: 615 MB en disco (INT8) con pico de 765-779 MB en CPU móvil; 2,42 GB en disco (FP32) con pico de 2.458-2.478 MB.
- GPU recomendadas: no se especifican modelos de GPU de escritorio; el backend recomendado es CPU (`Delegate.CPU` / `--backend=cpu`). También hay soporte de GPU en el runtime LiteRT.
- Cabe en GPU de consumo: no disponible como dato explícito; el modelo está diseñado para CPU móvil y NPU, no para GPU de escritorio.
- Opciones de despliegue: LiteRT-LM (`OmniEngine` / `omni_runner`), MediaPipe `AudioTranscriber`, LiteRT SDK directo (`.tflite`), y variantes AOT para NPU de Google Tensor, Qualcomm Snapdragon y MediaTek Dimensity.
- Latencia y throughput: RTF de 0,06-0,11 y RTFx medio de 12,1× en Galaxy S24 Ultra CPU; 3,0-3,4× más rápido en INT8 que en FP32.
- SoCs NPU soportados: Google Tensor G5 (Pixel 10) y G6; Qualcomm SM8450, SM8550, SM8650, SM8750, SM8850, SA8255, SA8295; MediaTek MT6877, MT6878, MT6879, MT6897, MT6983, MT6985, MT6989, MT6991, MT6993, MT8171, MT8188, MT8189.

## Comparativa con modelos similares

| Modelo | Parámetros | Idiomas | Formato/despliegue | Licencia | Notas |
|---|---|---|---|---|---|
| Parakeet-TDT-0.6B-v3 (este, litert-community) | 600 M | 25 | `.litertlm`, `.tflite`, NPU AOT | CC-BY-4.0 | Cuantizado INT8, on-device, RTFx 12,1× |
| nvidia/parakeet-tdt-0.6b-v3 (original) | 600 M | 25 | Pesos NeMo (no especificado en la información) | CC-BY-4.0 | Checkpoint base sin cuantizar; WER FP32 5,24 % |
| Whisper (variantes de OpenAI) | no disponible en la información | no disponible en la información | no disponible en la información | no disponible en la información | No se dispone de datos comparativos en la información proporcionada |

No se dispone de datos de benchmarks comparativos con otros modelos ASR en la información proporcionada.

## Limitaciones y advertencias

- Cobertura lingüística limitada a 25 idiomas europeos; no incluye lenguas asiáticas, africanas ni americanas indígenas.
- Es un modelo exclusivamente ASR: no genera texto libre, no razona y no soporta tool calling ni agentes.
- Riesgo de alucinación en audio con ruido, solapamiento de hablantes o acentos no representados en el entrenamiento; no se dispone de datos sobre sesgos específicos.
- La decodificación en streaming depende de la configuración de `overlap_ratio` (0,4-0,5); valores fuera de rango pueden degradar la alineación de costuras.
- Las variantes NPU AOT están compiladas para SoCs concretos y no son portables entre plataformas.
- Licencia CC-BY-4.0: permite uso comercial con atribución; es necesario citar al autor original (NVIDIA) y al empaquetador.
- El rendimiento medido se limita a un Galaxy S24 Ultra con CPU; no se garantizan las mismas cifras en otros dispositivos.
- No se dispone de información sobre el dataset de entrenamiento ni sobre posibles sesgos demográficos o dialectales.

## Enlaces

- Hugging Face: https://huggingface.co/litert-community/parakeet-tdt-0.6b-v3
- Modelo base: https://huggingface.co/nvidia/parakeet-tdt-0.6b-v3
- MediaPipe AudioTranscriber: https://ai.google.dev/edge/mediapipe/solutions/audio/audio_transcriber
- LiteRT-LM: https://github.com/google-ai-edge/LiteRT-LM
- LiteRT: https://github.com/google-ai-edge/LiteRT
- Ejemplo LiteRT ASR: https://github.com/google-ai-edge/LiteRT/tree/main/litert/samples/asr
- Ejemplo de reconocimiento de voz en Android: https://github.com/google-ai-edge/litert-samples/tree/main/samples/litert/speech_recognition
- Paper FastConformer (arXiv:2305.05084): https://arxiv.org/abs/2305.05084
- Paper Conformer (arXiv:2304.06795): https://arxiv.org/abs/2304.06795
- Paper TDT (arXiv:2505.13404): https://arxiv.org/abs/2505.13404
- Paper adicional (arXiv:2509.14128): https://arxiv.org/abs/2509.14128
