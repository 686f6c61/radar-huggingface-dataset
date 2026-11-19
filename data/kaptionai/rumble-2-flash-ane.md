# kaptionai/rumble-2-flash-ane

## Resumen

Rumble-2-Flash-ANE es un paquete de inferencia para reconocimiento automatico del habla (ASR) en Apple silicon, publicado por kaptionai. No se trata de un modelo nuevo entrenado desde cero, sino de una conversión y empaquetado de Reson8/Rumble-2-Flash (a su vez un fine-tune de Qwen/Qwen3-ASR-0.6B) para ejecutarse de forma eficiente en hardware Apple: el codificador de audio se convierte a Core ML y se ejecuta en el Neural Engine, mientras que el decodificador de texto se distribuye como GGUF y se ejecuta con llama.cpp sobre Metal.

El paquete resuelve un problema concreto de despliegue: llevar un modelo ASR multilingüe de ~0,6 mil millones de parámetros a portátiles y equipos de sobremesa con chip M-series, aprovechando la NPU (Neural Engine) para el encoder y la GPU integrada para el decoder. El resultado es un zip de unos 440 MB que contiene el encoder en formato ML Program, el decoder en cuantización AD-Q5_K_M, el vocabulario, el banco de filtros mel y un manifiesto con hashes.

Es relevante porque demuestra una arquitectura de despliegue híbrida (NPU + GPU) para ASR en local, con licencia Apache-2.0 y soporte declarado de 45 idiomas. El modelo base reduce el decoder a 14 capas y el vocabulario a 99.630 tokens respecto a Qwen3-ASR-0.6B, lo que abarata la inferencia a costa de cierta pérdida de calidad en algunos idiomas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder de audio transformer (18 capas, `audio_tower`) + proyector multimodal + decoder transformer de 14 capas, derivado de Qwen3-ASR-0.6B |
| Parametros totales | no disponible (modelo base de ~0,6B, con decoder recortado a 14 capas) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 1.024 tokens en el decoder; ventana de encoder fija de 8 s |
| Tipos de cuantizacion | Encoder: pesos 8-bit lineales simetricos por canal, activaciones fp16. Decoder: GGUF AD-Q5_K_M |
| Idiomas soportados | 45: af, ar, bn, bs, ca, ceb, cs, da, de, el, en, es, eu, fa, fi, fil, fr, hi, hr, hu, id, is, it, ja, ko, lt, lv, mk, ms, mt, nb, nl, pl, pt, ro, ru, sq, sr, sv, th, tr, uk, vi, yue, zh |
| Licencia | Apache-2.0 |
| Formato de pesos | Core ML ML Program (`encoder.mlpackage`) + GGUF (`decoder.gguf`) + binarios auxiliares (`vocab.bin`, `mel.bin`, `asr.json`) |

## Arquitectura y entrenamiento

El paquete reutiliza el modelo base Reson8/Rumble-2-Flash (revisión `a0c34287229103b706c670d70791683e34379732`), un fine-tune de Qwen/Qwen3-ASR-0.6B con el decoder recortado a 14 capas y el vocabulario reducido a 99.630 tokens. La parte de encoder y proyector (`model.audio_tower.*` y `model.multi_modal_projector.*`, 18 capas) se reconstruyó en PyTorch sustituyendo capas lineales por convoluciones 1x1, se trazó y se convirtió con coremltools 9.0 (torch 2.7) a ML Program con activaciones fp16 para una ventana fija de 8 segundos: entrada `mel` [1, 128, 800] y `mask` [1, 1, 1, 104], salida `audio` [1, 104, 1024]. Los pesos del encoder se almacenan como valores de 8 bits (lineales, simétricos, por canal). La reconstrucción en PyTorch coincide con el modelo de Transformers con un error de 1e-5 y Core ML coloca las 597 operaciones en el Neural Engine.

El decoder GGUF es una copia sin modificar de AtomicChat/Rumble-2-Flash-GGUF (revisión `d036f2af3cd5229375714d7f1749792cce3c6a88`), concretamente `Rumble-2-Flash-AD-Q5_K_M.gguf`. El prompt en `asr.json` incluye los tokens de control de Reson8 `<digits><nofiller><verbatim>` en el turno de sistema (los valores por defecto de la plantilla de chat del modelo), un turno de audio y el turno de asistente. Se incluyen identificadores de idioma forzado para en, es, pt, fr, de, it, ja, ko, zh, ru, tr, nl, ar e hi. No se detalla en la información disponible la composición del dataset de entrenamiento ni si hubo RLHF o DPO en el modelo base.

## Capacidades

- Reconocimiento automatico del habla (transcripción) multilingüe en 45 idiomas, con audio de entrada a 16 kHz mono.
- Transcripción verbatim y con dígitos: los tokens de control `<digits>`, `<nofiller>` y `<verbatim>` permiten controlar el formato de salida (dígitos numéricos, sin muletillas, transcripción literal).
- Forzado de idioma de salida para 14 idiomas (en, es, pt, fr, de, it, ja, ko, zh, ru, tr, nl, ar, hi).
- Ejecución local en Apple silicon con aceleración por Neural Engine (encoder) y Metal (decoder).
- Decodificación greedy con contexto de 1.024 tokens.
- No soporta timestamps por palabra: la salida es solo texto.
- No se documentan capacidades de tool calling, agentes, visión ni audio más allá de la transcripción.

## Casos de uso

- Transcripción local en portátiles Mac: el paquete permite transcribir audio sin conexión ni envío de datos a la nube, aprovechando el Neural Engine para el encoder y Metal para el decoder, con un consumo moderado de recursos en equipos M-series.
- Subtitulado y actas de reuniones: con ventanas de 8 s y contexto de 1.024 tokens, se puede procesar audio por segmentos y generar transcripciones de reuniones o clases en 45 idiomas, forzando el idioma de salida cuando se conoce.
- Dictado y notas de voz en aplicaciones macOS: integrable en apps nativas que ya usan Core ML, ya que el encoder es un `mlpackage` y el decoder se ejecuta con llama.cpp; útil para asistentes de escritura por voz.
- Procesamiento por lotes de archivos de audio en estaciones de trabajo Apple: al ser todo local y con licencia Apache-2.0, se puede desplegar en pipelines internos de transcripción de archivos sin coste por token.
- Investigación en ASR multilingüe: sirve como referencia reproducible de conversión Core ML + GGUF para comparar calidad y latencia frente a Qwen3-ASR-0.6B en los mismos clips.
- Transcripción de contenido audiovisual multilingüe: con soporte de 45 idiomas y forzado de idioma para 14, adecuado para catalogar o indexar vídeo y pódcast en varios idiomas.
- Prototipado de aplicaciones de accesibilidad: transcripción en tiempo casi real en Mac para subtitulado en vivo, siempre que se añada una puerta de detección de voz para evitar el silencio.

## Benchmarks y rendimiento

Los únicos datos publicados por el autor (medidos en un M4 Pro con este layout, clips de FLEURS, encoder fp16 o 8-bit con el mismo resultado):

| Prueba | Métrica | Rumble-2-Flash-ANE | Qwen3-ASR-0.6B (paquete kaptionai) |
|---|---|---|---|
| Chino, 40 clips | CER | 7,4 | 5,4 |
| Inglés, español y portugués, 240 clips | WER | 4,0 | 5,6 |
| Silencio digital, 36 clips sintéticos | clips con texto inventado | 10 (mayoría una frase en bucle, 295 palabras en total) | no disponible |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks de texto en la información disponible, ya que el modelo es de ASR.

## Requisitos de hardware

- Hardware: Apple silicon (M-series) con macOS 15 o posterior. No se midieron un Mac de 8 GB ni un M1.
- VRAM/unificada estimada: el zip ocupa 439,9 MB y descomprimido 471,9 MB; el encoder pesa 187,1 MB y el decoder GGUF 283,4 MB. La memoria unificada necesaria para inferencia no está publicada.
- GPU/NPU: Neural Engine para el encoder (las 597 operaciones se colocan allí) y Metal para el decoder vía llama.cpp.
- Cabe en equipos consumer Apple silicon; no aplica a GPU NVIDIA/AMD en este formato.
- Despliegue: Core ML para `encoder.mlpackage` y llama.cpp para `decoder.gguf`; el host debe orquestar ambos y alimentar las embeddings del encoder al decoder.
- Latencia y throughput: no disponibles; el autor solo reporta la plataforma de medida (M4 Pro) sin cifras de latencia.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Formato/despliegue |
|---|---|---|---|---|---|
| Rumble-2-Flash-ANE (este) | ~0,6B (decoder 14 capas) | 1.024 tokens, ventana 8 s | 45 | Apache-2.0 | Core ML + GGUF, Apple silicon |
| Qwen3-ASR-0.6B | 0,6B | no disponible | no disponible | Apache-2.0 | Transformers |
| Reson8/Rumble-2-Flash | ~0,6B (decoder completo) | no disponible | 45 | Apache-2.0 | safetensors |
| AtomicChat/Rumble-2-Flash-GGUF | ~0,6B | no disponible | 45 | Apache-2.0 | GGUF |

En calidad, el paquete mejora a Qwen3-ASR-0.6B en inglés, español y portugués (WER 4,0 frente a 5,6) y empeora en chino (CER 7,4 frente a 5,4), según las mediciones del autor. La ventaja diferencial es el despliegue nativo en Apple silicon; frente a las versiones Transformers o GGUF genéricas, este paquete no requiere GPU dedicada.

## Limitaciones y advertencias

- El chino es más débil que en Qwen3-ASR-0.6B (CER 7,4 frente a 5,4 en 40 clips).
- Inventa texto ante silencio digital: en 36 clips sintéticos sin habla escribió texto en 10, la mayoría una frase en bucle (295 palabras en total). Es imprescindible anteponer una puerta de detección de voz (VAD) y no enviar silencio al modelo.
- No soporta hebreo; los 45 idiomas son los listados en los metadatos.
- No genera timestamps por palabra; la salida es solo texto.
- No se midió en un Mac de 8 GB ni en un M1, por lo que el rendimiento en equipos de gama baja es desconocido.
- Requiere macOS 15 o posterior y Apple silicon; no es portable a otras plataformas en este formato.
- El decoder GGUF se distribuye sin modificar desde AtomicChat; cualquier problema de calidad del decoder es atribuible al modelo base.
- No está respaldado por Reson8, AtomicChat ni Alibaba Qwen; el crédito del modelo corresponde a sus autores.
- Licencia Apache-2.0 permite uso comercial, pero deben conservarse los avisos de licencia y atribución correspondientes.

## Enlaces

- Hugging Face: https://huggingface.co/kaptionai/rumble-2-flash-ane
- Modelo base: https://huggingface.co/Reson8/Rumble-2-Flash
- Modelo original Qwen3-ASR-0.6B: https://huggingface.co/Qwen/Qwen3-ASR-0.6B
- GGUF del decoder: https://huggingface.co/AtomicChat/Rumble-2-Flash-GGUF
- Paquete de referencia del mismo autor: https://huggingface.co/kaptionai/qwen3-asr-ane
