# kaptionai/rumble-2-flash-web

## Resumen

Rumble-2-Flash-web es una conversión a ONNX del modelo de reconocimiento automático del habla Reson8/Rumble-2-Flash, empaquetada por Kaption para ejecutarse íntegramente en el navegador mediante onnxruntime-web y WebGPU. El modelo base es un fine-tune de Qwen/Qwen3-ASR-0.6B (Apache-2.0) con el decodificador recortado a 14 capas y el vocabulario reducido a 99.630 tokens. El paquete ocupa 494 MB en total y está pensado para inferencia local en cliente, sin servidor.

El interés de esta ficha es doble: por un lado documenta una alternativa práctica para transcripción de voz en el navegador con aceleración GPU; por otro, hace explícitas las limitaciones medidas por el propio conversor, que incluyen un rendimiento inferior en chino frente a Qwen3-ASR-0.6B, alucinación de texto sobre silencio digital y ausencia de marcas de tiempo a nivel de palabra.

La licencia Apache-2.0 se mantiene desde el modelo original, y el autor de la conversión declara explícitamente que no está avalado por Reson8, AtomicChat ni Alibaba Qwen. El repositorio no registra descargas ni likes en el momento de la consulta.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Encoder-decoder transformer (encoder de 18 capas + decodificador de 14 capas), derivado de Qwen3-ASR-0.6B |
| Parámetros totales | no disponible (el modelo base Qwen3-ASR-0.6B tiene 0,6 B; el decodificador está recortado a 14 capas) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (ventana de encoder de 8 s por lote, procesamiento por ventanas) |
| Tipos de cuantización | Encoder int8 (MatMulNBits, bloque 32) con activaciones fp16; decodificador 4 bits con GroupQueryAttention y fp16; embeddings int8 por fila con escala fp32 |
| Idiomas soportados | 45 idiomas: af, ar, bn, bs, ca, ceb, cs, da, de, el, en, es, eu, fa, fi, fil, fr, hi, hr, hu, id, is, it, ja, ko, lt, lv, mk, ms, mt, nb, nl, pl, pt, ro, ru, sq, sr, sv, th, tr, uk, vi, yue, zh |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (encoder.int8f16.onnx, decoder.gqa-q4f16.onnx + decoder_weights.q4f16.data, embed_tokens.int8.bin, embed_scales.f32.bin); tokenizer.json; mel_filters.json; prompt_config.json |

## Arquitectura y entrenamiento

El modelo base Reson8/Rumble-2-Flash es un fine-tune de Qwen/Qwen3-ASR-0.6B. La conversión de Kaption mantiene la estructura encoder-decoder: un encoder de audio de 18 capas y un proyector exportados a ONNX, y un decodificador de texto de 14 capas construido con el model builder de onnxruntime-genai. El encoder recibe lotes de ventanas de 8 segundos con entrada `mel` de forma [W, 128, 800] y `valid` de forma [W, 104], y produce `emb` de forma [W, 104, 1024]. El decodificador usa GroupQueryAttention con rotary embeddings y q/k norm integrados, y solo la última posición llega a la cabeza de salida; la selección greedy se ejecuta en la GPU, de modo que `next_token` es la única salida pequeña. Las entradas y salidas flotantes son fp16.

La cuantización aplicada es agresiva y específica para WebGPU: pesos MatMul del encoder en int8 con bloque 32 y activaciones fp16, decodificador en 4 bits con embeddings fuera del grafo (lookup externo sobre tabla int8 con escala fp32 por fila, error máximo 0,001). El prompt del sistema incorpora los tokens de control de Reson8 `<digits><nofiller><verbatim>` y un turno de audio seguido de un turno de asistente; `prompt_config.json` también contiene los ids para forzar idioma mediante `language <Name>`. No se documentan en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO en el modelo base.

## Capacidades

- Reconocimiento automático del habla (ASR) multilingüe en 45 idiomas, con salida de texto plano.
- Transcripción con control de idioma forzado mediante tokens `language <Name>`.
- Modo verbatim y control de dígitos y de fillers (muletillas) a través de los tokens de control del prompt del sistema.
- Procesamiento por ventanas de audio de 8 segundos, con entrada de 16 kHz mono y log-mel de 128 bins.
- Decodificación greedy en GPU, con salida de un único token por paso.
- Ejecución local en navegador con WebGPU, sin envío de audio a servidores externos.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso; es un modelo puramente ASR.
- No genera marcas de tiempo a nivel de palabra (la salida es solo texto).
- No soporta hebreo, pese a que el modelo base declara 45 idiomas en metadatos.

## Casos de uso

- Transcripción de reuniones en el navegador: el modelo procesa audio en ventanas de 8 s y permite dictado o actas sin subir el audio a un servidor, lo que resulta adecuado para entornos con requisitos de privacidad.
- Subtitulado de vídeo en tiempo casi real en aplicaciones web: al ejecutarse con WebGPU en el cliente, se puede integrar en un reproductor que transcriba pistas de audio localmente, aunque sin marcas de tiempo por palabra habrá que alinear los segmentos por ventana.
- Asistentes de voz para aplicaciones web: la salida de texto plano y el control de idioma permiten encadenar la transcripción con un LLM en el mismo cliente, manteniendo el audio fuera del backend.
- Accesibilidad en formularios y herramientas ofimáticas web: dictado por voz en 45 idiomas con un paquete de 494 MB que se puede cachear en el navegador.
- Transcripción offline en portátiles con GPU integrada: el conversor reporta pruebas en Chrome sobre Apple silicon y en un portátil con Intel UHD 620, lo que indica viabilidad en hardware modesto con soporte de `shader-f16`.
- Procesamiento por lotes de archivos de audio cortos en una aplicación Electron o PWA: la ventana fija de 8 s y la decodificación greedy simplifican el pipeline y reducen la latencia por segmento.
- Filtrado y moderación de audio en el cliente: la transcripción local permite clasificar contenido sin exponer la grabación, siempre que se anteponga una compuerta de actividad de voz para evitar la alucinación sobre silencio.

## Benchmarks y rendimiento

| Benchmark | Rumble-2-Flash-web | Qwen3-ASR-0.6B (WebGPU) | Métrica |
|---|---:|---:|---|
| FLEURS chino (15 clips) | 8,3 | 5,3 | CER (character error rate) |
| FLEURS en/es/pt (240 clips) | 4,08 | 6,50 | WER (word error rate) |
| Silencio digital sintético (36 clips) | texto inventado en 4 clips | no disponible | alucinación |

Los datos proceden de las mediciones del propio conversor (Kaption). No se han publicado en la información disponible resultados de MMLU, HumanEval ni GSM8K, que no aplican a un modelo ASR. No hay datos de latencia ni throughput en la información proporcionada.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; el paquete completo son 494 MB en disco, con encoder de 202 MB, decodificador de 182 MB y embeddings de 102 MB, lo que sugiere un consumo de memoria moderado en GPU.
- GPU recomendadas: cualquier GPU con soporte de `shader-f16` en WebGPU; probado en Apple silicon y en Intel UHD 620.
- Cabe en GPU de consumo: sí, según las pruebas reportadas en Apple silicon e Intel UHD 620; no se especifican modelos de NVIDIA o AMD probados.
- Opciones de despliegue: onnxruntime-web con el execution provider WebGPU; el grafo del decodificador no funciona en el execution provider CPU de ONNX Runtime.
- Navegadores: solo se ha probado Chrome; otros navegadores no fueron testeados.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| Rumble-2-Flash-web (esta ficha) | 0,6 B base, decodificador 14 capas | ventana de 8 s | 45 | Apache-2.0 | ONNX (WebGPU) | Conversión para navegador; peor CER en chino, mejor WER en en/es/pt |
| Qwen/Qwen3-ASR-0.6B | 0,6 B | no disponible | no disponible | Apache-2.0 | safetensors | Modelo base original; referencia de calidad en chino |
| kaptionai/qwen3-asr-web | 0,6 B | ventana de 8 s | no disponible | Apache-2.0 | ONNX (WebGPU) | Mismo layout de ficheros; mejor CER en chino (5,3 frente a 8,3) |
| AtomicChat/Rumble-2-Flash-GGUF | no disponible | no disponible | no disponible | Apache-2.0 (heredada) | GGUF | Cuantización del mismo modelo base para llama.cpp; no usada en esta conversión |

## Limitaciones y advertencias

- Chino más débil que Qwen3-ASR-0.6B: CER de 8,3 frente a 5,3 en 15 clips de FLEURS.
- Alucinación sobre silencio digital: en 36 clips sintéticos sin habla generó texto en 4, repitiendo una frase unas 10 veces; es imprescindible anteponer una compuerta de actividad de voz.
- Sin hebreo: los idiomas reales son los 45 listados en los metadatos, aunque el modelo base declare más.
- Sin marcas de tiempo a nivel de palabra: la salida es únicamente texto, lo que complica el subtitulado preciso.
- El decodificador no funciona en el execution provider CPU de ONNX Runtime; requiere WebGPU con `shader-f16`.
- Solo probado en Chrome sobre Apple silicon e Intel UHD 620; el comportamiento en otros navegadores y GPUs no está verificado.
- Licencia Apache-2.0 permite uso comercial, pero los derechos de los pesos del modelo pertenecen a sus autores originales (Reson8, y Qwen/Alibaba como base).
- No avalado por Reson8, AtomicChat ni Alibaba Qwen según el autor de la conversión.
- Riesgo de sesgos y errores de transcripción no cuantificado en la información disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/kaptionai/rumble-2-flash-web
- Modelo base: https://huggingface.co/Reson8/Rumble-2-Flash
- Modelo base de Qwen: https://huggingface.co/Qwen/Qwen3-ASR-0.6B
- Cuantización GGUF del mismo modelo: https://huggingface.co/AtomicChat/Rumble-2-Flash-GGUF
- Paquete WebGPU de referencia con el mismo layout: https://huggingface.co/kaptionai/qwen3-asr-web
