# litert-community/whisper-tiny

## Resumen

Whisper-tiny para LiteRT-LM es una empaquetación optimizada para inferencia en dispositivo del modelo de reconocimiento automático del habla (ASR) `openai/whisper-tiny`, publicada por la comunidad `litert-community`. Se trata de un transformer encoder-decoder de 39 millones de parámetros, originalmente presentado en el artículo "Robust Speech Recognition via Large-Scale Weak Supervision" (Radford et al., 2022), que se distribuye aquí como un bundle autocontenido en formato `.litertlm` para el runtime LiteRT-LM Omni de Google, además de variantes `.tflite` sueltas y compilaciones AOT para NPU de Qualcomm y MediaTek.

El atractivo principal es el tamaño: el bundle INT8 ocupa 41,8 MB, frente a los 151 MB del checkpoint FP32 original (3,6 veces más pequeño), e incluye en un único archivo el grafo del modelo, el tokenizador BPE multilingüe de 51.865 tokens y los metadatos de preprocesado (remuestreo a 16 kHz y front-end log-mel Slaney de 80 bins sobre ventanas de 30 segundos). No requiere Python ni conexión de red en tiempo de ejecución.

Es relevante para desarrolladores que necesitan transcripción de voz en Android, iOS, macOS, Linux o C++ sin depender de servicios en la nube: el modelo cubre 99 idiomas en el vocabulario original de Whisper (el checkpoint por defecto transcribe en inglés si no se especifican `decode_start_token_ids`) y está pensado para audio de duración arbitraria mediante ventanas deslizantes de 30 segundos con solapamiento configurable.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper Tiny) |
| Parametros totales | 39 M |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | Ventanas de audio de 30 s (3.000 frames mel a 10 ms de hop); audio de mayor duración mediante ventana deslizante con solapamiento |
| Tipos de cuantizacion | INT8 dynamic range (bundle recomendado) y FP32 (referencia) |
| Idiomas soportados | 99 idiomas en el vocabulario (en, zh, de, es, ru, ko, fr, ja, pt, tr, pl, ca, nl, ar, sv, it, id, hi, fi, vi, he, uk, el, ms, cs, ro, da, hu, ta, no, th, ur, hr, bg, lt, la, mi, ml, cy, sk, te, fa, lv, bn, sr, az, sl, kn, et, mk, br, eu, is, hy, ne, mn, bs, kk, sq, sw, gl, mr, pa, si, km, sn, yo, so, af, oc, ka, be, tg, sd, gu, am, yi, lo, uz, fo, ht, ps, tk, nn, mt, sa, lb, my, bo, tl, mg, as, tt, haw, ln, ha, ba, jw, su) |
| Licencia | Apache 2.0 |
| Formato de pesos | `.litertlm` (bundle), `.tflite` (grafo suelto), `.tflite` AOT para NPU |

## Arquitectura y entrenamiento

El modelo subyacente es Whisper Tiny, un transformer encoder-decoder con atención estándar que procesa espectrogramas log-mel de 80 bins calculados sobre ventanas de 30 segundos a 16 kHz. El encoder consume 3.000 frames mel (hop de 10 ms) y el decoder genera tokens de texto de forma autorregresiva con un tokenizador BPE multilingüe de 51.865 entradas. Whisper se entrenó con supervisión débil a gran escala sobre cientos de miles de horas de audio multilingüe y multitarea (transcripción, traducción y detección de idioma), según el artículo original de Radford et al.

Esta versión de `litert-community` no reentrena el modelo: aplica cuantización de rango dinámico INT8 sobre los pesos del checkpoint original (de 151 MB a 41,8 MB) y lo empaqueta para LiteRT. El bundle `.litertlm` integra además el `tokenizer.json` comprimido de Hugging Face y un protobuf `Speech2TextMetadata` con la configuración del front-end (remuestreador a 16 kHz y log-mel Slaney de 80 bins), de modo que el runtime no necesita preprocesado externo en Python. Las variantes `_<SoC>.tflite` se compilan AOT con los compiladores NeuroPilot (MediaTek) y QNN (Qualcomm) para ejecutar en la NPU del dispositivo.

## Capacidades

- Transcripción de voz a texto (ASR) en 99 idiomas, con puntuación y capitalización generadas por el propio modelo.
- Detección de idioma y traducción al inglés (capacidades heredadas del checkpoint Whisper original).
- Procesamiento de audio de duración arbitraria mediante ventanas de 30 segundos con solapamiento configurable y alineación de costuras entre ventanas.
- Acepta WAV mono o multicanal a cualquier frecuencia de muestreo (remuestreo automático a 16 kHz mono).
- Streaming de segmentos confirmados y no confirmados a stdout o a `--output_path` en `omni_runner`.
- Ejecución completamente offline y on-device, sin Python ni red en tiempo de ejecución.
- Integración nativa en Android, iOS, macOS, Linux y C++ mediante LiteRT-LM Omni (`OmniEngine` / `omni_runner`) o el SDK LiteRT.
- Aceleración por NPU en SoCs Qualcomm Snapdragon (SM8450, SM8550, SM8650, SM8750, SM8850, SA8255, SA8295) y MediaTek Dimensity (MT6877, MT6878, MT6879, MT6897, MT6983, MT6985, MT6989, MT6991, MT6993, MT8171, MT8188, MT8189).
- No soporta tool calling, function calling ni razonamiento multi-paso: es un modelo puramente ASR.

## Casos de uso

- Transcripción offline en apps móviles: integración del bundle `.litertlm` de 41,8 MB en una app Android o iOS mediante LiteRT-LM Omni para dictado y notas de voz sin enviar audio a servidores externos, con resampling y front-end mel incluidos en el propio archivo.
- Subtitulado en tiempo real de reuniones y clases: el modo de streaming de `omni_runner` emite segmentos confirmados y no confirmados, lo que permite mostrar subtítulos progresivos con latencia baja en hardware móvil.
- Asistentes de voz embebidos en dispositivos sin conectividad: al no requerir red ni Python, encaja en entornos industriales, vehículos o dispositivos IoT donde la transcripción debe ejecutarse localmente.
- Preprocesado de pipelines de audio en servidores Linux: uso del `.tflite` INT8 con el SDK LiteRT para transcribir grandes volúmenes de grabaciones por lotes en CPU, aprovechando el tamaño reducido y la cuantización INT8 para mayor throughput.
- Aplicaciones de accesibilidad: dictado y transcripción para personas con movilidad reducida en dispositivos de gama media, donde el footprint de 41,8 MB y la ejecución en NPU reducen el consumo energético.
- Traducción y detección de idioma en grabaciones multilingües: el vocabulario de 99 idiomas permite identificar el idioma del audio y transcribir o traducir al inglés pasando los `decode_start_token_ids` adecuados.
- Prototipado rápido en C++ o macOS: el bundle autocontenido permite montar un runner de ASR en minutos sin gestionar tokenizadores ni preprocesado externo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo documenta métricas de footprint (41,8 MB INT8 frente a 151 MB FP32) y no incluye cifras de WER, latencia ni throughput.

## Requisitos de hardware

- VRAM/RAM estimada: el bundle INT8 ocupa 41,8 MB en disco; la huella en memoria es del orden de decenas de MB, apta para dispositivos móviles de gama media y sistemas embebidos. La variante FP32 requiere 151 MB.
- GPU recomendadas: no se especifican modelos de GPU de escritorio; el backend recomendado es CPU (`--backend=cpu`) o GPU integrada en móvil. Para NPU se requieren los SoCs Qualcomm Snapdragon y MediaTek Dimensity listados en la model card.
- Cabe en cualquier GPU consumer (RTX 4090, RTX 3060, etc.) por su tamaño ínfimo, aunque el diseño objetivo es móvil y edge, no escritorio.
- Opciones de despliegue: LiteRT-LM Omni (`OmniEngine` / `omni_runner`) en Android, iOS, macOS, Linux y C++; SDK LiteRT con los `.tflite` sueltos; pipelines AOT para NPU con los `.tflite` específicos de SoC. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este formato.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato / despliegue |
|---|---|---|---|---|---|
| litert-community/whisper-tiny (esta ficha) | 39 M | Ventanas de 30 s | 99 | Apache 2.0 | `.litertlm`, `.tflite`, NPU AOT |
| openai/whisper-tiny | 39 M | Ventanas de 30 s | 99 | Apache 2.0 | PyTorch / safetensors |
| openai/whisper-base | 74 M | Ventanas de 30 s | 99 | Apache 2.0 | PyTorch / safetensors |
| openai/whisper-small | 244 M | Ventanas de 30 s | 99 | Apache 2.0 | PyTorch / safetensors |

La diferencia frente al checkpoint original de OpenAI es el empaquetado y la cuantización: mismo tamaño de parámetros y misma licencia, pero optimizado para inferencia on-device. Los modelos base y small ofrecen mayor precisión a costa de un footprint mayor; no se dispone de cifras de WER comparativas en la información proporcionada.

## Limitaciones y advertencias

- Al ser Whisper Tiny, la precisión de transcripción es la más baja de la familia Whisper; en audio con ruido, acentos marcados o vocabulario técnico puede producir errores y alucinaciones (texto inventado en silencios o música).
- El checkpoint por defecto transcribe en inglés (`<|en|>`) si no se especifican `decode_start_token_ids`; para otros idiomas hay que configurar el token de idioma explícitamente.
- El contexto está limitado a ventanas de 30 segundos; audios más largos dependen del solapamiento y la alineación de costuras, lo que puede introducir duplicaciones o cortes en las fronteras.
- No soporta tool calling, agentes ni razonamiento multi-paso; es exclusivamente ASR.
- Las variantes NPU están compiladas AOT para SoCs concretos: no son portables entre familias de chips y requieren el hardware listado.
- Licencia Apache 2.0: permite uso comercial, pero conviene revisar las condiciones del modelo base `openai/whisper-tiny` y de los runtimes LiteRT/LiteRT-LM.
- El repo ocupa 7,1 GB por incluir todas las variantes (FP32, INT8, AOT por SoC); descargar solo el archivo necesario con `hf download`.
- No se han publicado métricas de WER, latencia ni consumo energético en la información disponible, por lo que la evaluación en producción requiere medición propia.

## Enlaces

- Hugging Face: https://huggingface.co/litert-community/whisper-tiny
- Modelo base: https://huggingface.co/openai/whisper-tiny
- Paper: https://arxiv.org/abs/2212.04356
- LiteRT-LM Omni: https://github.com/google-ai-edge/LiteRT-LM/tree/main/omni
- LiteRT: https://github.com/google-ai-edge/LiteRT
- Guía de compilación LiteRT-LM: https://github.com/google-ai-edge/LiteRT-LM/blob/main/docs/getting-started/build-and-run.md
- Ejemplo ASR con SDK LiteRT: https://github.com/google-ai-edge/LiteRT/tree/main/litert/samples/asr
- App de ejemplo Android: https://github.com/google-ai-edge/litert-samples/tree/main/samples/litert/speech_recognition
