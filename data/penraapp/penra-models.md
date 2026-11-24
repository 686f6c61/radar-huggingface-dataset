# PenraApp/penra-models

## Resumen

Penra offline models es un paquete de artefactos de inferencia on-device publicados por PenraApp para su aplicación de notas Penra (Android). No se trata de un modelo único, sino de una colección de pesos convertidos y cuantizados a formatos ligeros (LiteRT/TFLite, ONNX y GGUF) que la aplicación descarga y ejecuta localmente, sin servidor. El repositorio agrupa componentes heterogéneos para tres tareas: reconocimiento de escritura manuscrita y OCR, reconocimiento de voz (ASR) y búsqueda semántica de notas.

La mayoría de los artefactos derivan de modelos abiertos de terceros: Gemma 4 E4B y Gemma 4 E2B para lectura de escritura y voz, EmbeddingGemma 2 para embeddings de búsqueda y para un modelo turco de voz, UVDoc para rectificación de páginas fotografiadas, OpenAI Whisper large-v3-turbo (con un LoRA turco de Penra fusionado) y NVIDIA Nemotron 3.5 ASR Streaming 0.6B para transcripción en vivo. El número de parámetros reportado en safetensors (99.260.363) corresponde a uno de los componentes, no al conjunto completo.

El interés del paquete es práctico: demuestra un pipeline de despliegue móvil completo con conversión de formato, cuantización int4/int8, decodificación especulativa con un drafter MTP y verificación de integridad mediante `manifest.json` con SHA-256. Es relevante para desarrolladores que quieran replicar inferencia offline multimodal en Android con presupuestos de memoria ajustados (8 GB y menos).

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No disponible de forma unificada; el paquete incluye un LLM multimodal basado en Gemma 4 (E4B/E2B), un modelo de embeddings (EmbeddingGemma 2), un modelo de rectificación de documentos (UVDoc, PaddlePaddle), un encoder-decoder Transformer de ASR (Whisper large-v3-turbo) y un modelo streaming RNN-T (Nemotron 3.5 ASR Streaming 0.6B) |
| Parámetros totales | 99.260.363 (dato de safetensors, corresponde a un componente del paquete, no al conjunto) |
| Parámetros activos | No disponible |
| Longitud de contexto | No disponible (la firma de visión es de 1120 o 560 tokens según bundle; la ventana de audio de Whisper es de 30 s) |
| Tipos de cuantización | Int4 (encoder Whisper), int8 (EG2 turco, Nemotron streaming), mixta (decoder Whisper), q8_0 (GGUF de diarización) |
| Idiomas soportados | No disponibles de forma agregada; Whisper cubre 15 idiomas; hay componentes específicos para turco |
| Licencia | Mixta: Apache 2.0 (Gemma 4, EmbeddingGemma 2, UVDoc), MIT (Whisper), OpenMDW 1.1 (Nemotron), CC BY-SA 4.0 (EG2 turco y listas de palabras) |
| Formato de pesos | LiteRT (`.litertlm`, `.tflite`), ONNX (`.onnx`), GGUF (`.gguf`), JSON (tokenizer) y binarios propios (`.bin`, `.txt`) |

## Arquitectura y entrenamiento

El paquete no entrena modelos desde cero: es un conjunto de conversiones, cuantizaciones y repaquetados de modelos abiertos. Los bundles `penra-ocr-1120.litertlm` y `penra-ocr-560.litertlm` derivan de Gemma 4 E4B y el `penra-e2b-1120.litertlm` de Gemma 4 E2B; el sufijo numérico indica el tamaño de la firma de visión en tokens (1120 o 560), y el bundle de 560 incluye además un drafter MTP para decodificación especulativa, pensado para GPUs móviles lentas. La aplicación selecciona un bundle u otro según la memoria del teléfono.

Para voz, se incluyen dos rutas. La primera es Whisper large-v3-turbo convertido a TFLite con un LoRA turco de Penra fusionado en los pesos, separado en encoder (ventana de 30 s, pesos int4) y decoder con caché KV en precisión mixta. La segunda es un modelo turco más rápido (`eg2_tr_fc8.tflite`) construido sobre embeddinggemma2-turkish-stt de mstkyvz, con cuantización int8 de las capas fully connected, embeddings de prompt horneados en el fichero y un modelo de lenguaje de 3-gramas de turco hablado convertido a binario compacto. La transcripción en vivo usa Nemotron 3.5 ASR Streaming 0.6B, dividido en un encoder streaming int8 y una red de predicción/joint RNN-T. UVDoc se usa para aplanar páginas fotografiadas antes del OCR.

## Capacidades

- Reconocimiento de escritura manuscrita y OCR sobre imágenes de notas, con rectificación previa de perspectiva mediante UVDoc.
- Reconocimiento de voz offline en 15 idiomas mediante Whisper large-v3-turbo, con ventana de audio de 30 s.
- Reconocimiento de voz específico para turco, con variante rápida basada en EmbeddingGemma 2 y 3-gramas.
- Transcripción en vivo durante la grabación mediante el encoder streaming de Nemotron 3.5 ASR.
- Búsqueda semántica de notas mediante embeddings de texto de EmbeddingGemma 2 (270M).
- Diarización de hablantes (quién habló y cuándo), marcada como planificada en la model card.
- Verificación de integridad de los artefactos mediante `manifest.json` con tamaños y SHA-256.
- Ejecución completamente local, sin conexión a servidor.

## Casos de uso

- Aplicación de notas con OCR offline: el bundle `penra-ocr-1120.litertlm` procesa páginas manuscritas en el propio dispositivo, sin enviar imágenes a la nube, lo que resulta adecuado para contenido sensible.
- Digitalización de páginas fotografiadas: `uvdoc.onnx` corrige la deformación de la página antes de pasarla al lector, mejorando la tasa de acierto del OCR en capturas con perspectiva.
- Dictado de notas por voz: Whisper large-v3-turbo en TFLite permite transcribir fragmentos de hasta 30 s en 15 idiomas sin conexión.
- Dictado rápido en turco: `eg2_tr_fc8.tflite` con el 3-grama reduce la latencia en dispositivos modestos frente a la ruta Whisper completa.
- Transcripción en vivo durante la grabación: el encoder streaming de Nemotron 3.5 ASR muestra texto mientras el usuario habla, útil para reuniones o apuntes rápidos.
- Búsqueda de notas por significado: EmbeddingGemma 2 indexa y recupera notas por similitud semántica en lugar de coincidencia exacta de palabras.
- Despliegue en dispositivos de gama media/baja: el bundle `penra-e2b-1120.litertlm` está pensado para teléfonos con menos memoria, permitiendo mantener la funcionalidad en hardware restrictivo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de precisión (WER, CER, exactitud de OCR) ni comparaciones cuantitativas con otros modelos.

## Requisitos de hardware

- VRAM/RAM estimada: no disponible de forma numérica. La model card indica que el bundle de 1120 tokens está pensado para teléfonos con 8 GB de memoria, y que existe un bundle E2B para dispositivos con menos memoria.
- GPU recomendadas: no disponibles. El objetivo es hardware móvil con GPU; no se mencionan A100, H100 ni RTX 4090.
- Compatibilidad con GPU de consumo: no documentada; el formato LiteRT/TFLite apunta a aceleradores móviles (GPU/NPU del teléfono), no a GPUs de escritorio.
- Opciones de despliegue: LiteRT (`.litertlm`, `.tflite`), ONNX Runtime (`.onnx`) y llama.cpp u otro runtime GGUF para el artefacto de diarización `nemotron-3-diarization-q8_0.gguf`. No se mencionan vLLM, TGI ni Ollama.
- Latencia y throughput: no disponibles. La única indicación cualitativa es que el bundle de 560 tokens con drafter MTP es "más rápido en teléfonos con GPU lenta".

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Enfoque |
|---|---|---|---|---|---|
| Penra offline models | 99,26 M (componente safetensors); conjunto no disponible | No disponible | LiteRT, ONNX, GGUF | Mixta (Apache 2.0, MIT, OpenMDW 1.1, CC BY-SA 4.0) | Paquete on-device para OCR, ASR y búsqueda |
| Gemma 4 E4B / E2B (origen) | No disponible | No disponible | Safetensors originales | Apache 2.0 | LLM multimodal base |
| OpenAI Whisper large-v3-turbo (origen) | No disponible | Ventana de audio de 30 s | Original | MIT | ASR |
| NVIDIA Nemotron 3.5 ASR Streaming 0.6B (origen) | 0,6 B | Streaming | Original | OpenMDW 1.1 | ASR en streaming |

La comparación directa con un único modelo alternativo no es significativa, ya que Penra es un agregado de artefactos convertidos de varios modelos base. Los datos de los modelos de origen figuran como "no disponible" porque la información proporcionada no incluye sus especificaciones completas.

## Limitaciones y advertencias

- El paquete no es un modelo entrenado por Penra: son conversiones y cuantizaciones de modelos de terceros, provistas "as is" y sin garantía.
- La licencia es mixta y cada artefacto arrastra la de su origen; el uso comercial requiere revisar cada componente, en particular los ficheros CC BY-SA 4.0 (EG2 turco y listas de palabras), que imponen compartir bajo la misma licencia las adaptaciones.
- El componente de diarización está marcado como planificado, por lo que puede no estar operativo.
- No se publican métricas de precisión (WER, CER, exactitud de OCR) ni comparativas de rendimiento.
- Los idiomas soportados no están documentados de forma agregada; Whisper cubre 15 idiomas y varios componentes son específicos de turco.
- La ventana de audio de Whisper está limitada a 30 s por fragmento.
- La selección de bundle depende de la memoria del dispositivo, lo que puede degradar la calidad (firma de visión de 560 frente a 1120 tokens) en teléfonos con menos recursos.
- La atribución a los autores originales no implica respaldo de mstkyvz, Google ni NVIDIA a Penra o a estas conversiones.
- Riesgo de alucinación y sesgos: no documentados en la información disponible; son heredados de los modelos base.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/PenraApp/penra-models
- Aplicación Penra en Google Play: https://play.google.com/store/apps/details?id=com.penra.app
- Licencia de Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
- NVIDIA Nemotron 3.5 ASR Streaming 0.6B: https://huggingface.co/nvidia/nemotron-3.5-asr-streaming-0.6b
- NVIDIA Nemotron 3 Diarization: https://huggingface.co/nvidia/Nemotron-3-Diarization
- OpenAI Whisper large-v3-turbo: https://huggingface.co/openai/whisper-large-v3-turbo
- embeddinggemma2-turkish-stt (mstkyvz): https://huggingface.co/mstkyvz/embeddinggemma2-turkish-stt
- google/embeddinggemma-2: https://huggingface.co/google/embeddinggemma-2
- Licencia CC BY-SA 4.0: https://creativecommons.org/licenses/by-sa/4.0/
