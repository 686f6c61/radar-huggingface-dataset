# pdnhan/PhoWhisper-tiny-mobile

## Resumen

PhoWhisper-tiny-mobile es una conversión a ONNX del modelo vinai/PhoWhisper-tiny, un ajuste fino en vietnamita del modelo Whisper de OpenAI realizado por VinAI Research. El modelo original, de 39 millones de parámetros, está especializado en reconocimiento automático del habla (ASR) en vietnamita y esta conversión lo empaqueta en formato ONNX con cuantización int8 dinámica para su ejecución en dispositivos móviles Android e iOS mediante ONNX Runtime, sin necesidad de librerías de operadores personalizados.

La relevancia de esta ficha radica en que demuestra un flujo completo de despliegue de ASR en el borde (edge): exportación con Optimum, cuantización dinámica int8 de los pesos de `MatMul` y `Gather`, y verificación de que los tokens generados son idénticos entre versiones de ONNX Runtime 1.20.0 y 1.31.1. El resultado son dos pares de ficheros (encoder y decoder fusionado con caché KV) que suman unos 62 MB en int8 frente a los 151 MB en fp32.

El modelo conserva los pesos originales de PhoWhisper-tiny; solo cambia el formato y, en los ficheros cuantizados, la precisión. Está pensado para aplicaciones móviles que necesiten transcripción de voz en vietnamita sin conexión ni servidor, con una penalización de calidad medida de 1,9 puntos de WER en la muestra de validación del autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper), exportado a ONNX con decoder fusionado y caché KV |
| Parametros totales | 39 M (modelo base vinai/PhoWhisper-tiny) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 30 s de audio de entrada (ventana fija de Whisper); 1500 posiciones en el encoder |
| Tipos de cuantizacion | fp32 e int8 dinámica (QInt8, per-tensor, sobre pesos de `MatMul` y `Gather`) |
| Idiomas soportados | vietnamita (vi) |
| Licencia | BSD-3-Clause |
| Formato de pesos | ONNX (opset 17, IR version 9); tokenizer y feature extractor originales de PhoWhisper |
| Tamano del repositorio | 0,2 GB |
| Entrada del encoder | `input_features` float32 `[1, 80, 3000]` (log-Mel de 30 s, 16 kHz mono) |
| Salida del encoder | `last_hidden_state` float32 `[1, 1500, 384]` |
| Entrada del decoder | `input_ids` int64 `[1, n]`, `encoder_hidden_states`, `use_cache_branch` bool `[1]`, `past_key_values.*` |
| Salida del decoder | `logits` y `present.*` (caché KV por capa) |
| Tamano encoder fp32 / int8 | 32,9 MB / 11,7 MB |
| Tamano decoder fp32 / int8 | 118,5 MB / 50,0 MB |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Whisper: un transformer encoder-decoder con atención multi-cabeza estándar, adaptado por VinAI al vietnamita mediante ajuste fino supervisado sobre el checkpoint original de OpenAI. Esta conversión no modifica los pesos ni el entrenamiento; solo realiza la exportación con `optimum-cli export onnx --task automatic-speech-recognition-with-past --opset 17`, generando un encoder independiente y un decoder fusionado que incorpora la lógica de caché KV (rama `use_cache_branch`).

La cuantización se aplica con `onnxruntime.quantization.quantize_dynamic` en modo QInt8 per-tensor sobre los pesos de `MatMul` y `Gather`, incluyendo los subgrafos del decoder fusionado. Antes de cuantizar, la transposición en tiempo de ejecución de la cabeza LM sobre el embedding compartido se pliega en una constante, lo que permite cuantizar también la cabeza de salida. El pipeline de decodificación es greedy, con tokens especiales `<|startoftranscript|><|vi|><|transcribe|><|notimestamps|>` (50258, 50278, 50359, 50363) y parada en `<|endoftext|>` (50257).

No se dispone de información sobre el número exacto de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO en el modelo original; esos detalles deben consultarse en el paper de PhoWhisper (ICLR 2024 Tiny Papers).

## Capacidades

- Reconocimiento automático del habla en vietnamita sobre ventanas de 30 s de audio a 16 kHz.
- Transcripción sin marcas de tiempo (`<|notimestamps|>`) con decodificación greedy.
- Ejecución completamente offline en Android e iOS mediante ONNX Runtime estándar (sin operadores personalizados).
- Compatibilidad con los paquetes oficiales `onnxruntime-android` y `onnxruntime-objc` (1.20.0 o superior).
- Uso opcional del CoreML Execution Provider en iOS para aceleración por hardware.
- Reproducibilidad verificada: los ficheros int8 generan tokens idénticos en ONNX Runtime 1.20.0 y 1.31.1.
- No soporta tool calling, function calling, agentes, visión, audio más allá de ASR ni modos de razonamiento extendido.
- Capacidad multilingüe limitada al vietnamita; no se ha validado su comportamiento en otros idiomas.

## Casos de uso

- Transcripción de notas de voz en apps móviles: el par encoder+decoder int8 ocupa unos 62 MB y se ejecuta con ONNX Runtime en el propio dispositivo, lo que permite transcribir grabaciones de hasta 30 s sin enviar audio a un servidor y sin coste de red.
- Subtitulado offline de contenido en vietnamita: dividiendo el audio en ventanas de 30 s y ejecutando el bucle de decodificación greedy descrito en la model card, se pueden generar subtítulos en dispositivos sin conectividad.
- Asistentes de voz embebidos: integrado en un pipeline de captura de micrófono y extracción de log-Mel (ventana FFT de 400 muestras, hop 160), el modelo sirve como front-end de ASR en asistentes locales para vietnamita.
- Aplicaciones de accesibilidad: dictado por voz en tiempo casi real en teléfonos de gama media, gracias al tamaño reducido del encoder int8 (11,7 MB) y a la posibilidad de fijar hilos de ejecución (`setIntraOpNumThreads(4)`).
- Procesamiento por lotes en el borde: en escenarios de campo (periodismo, ONG, trabajo de campo) donde no hay cobertura, el modelo permite transcribir entrevistas en vietnamita en un portátil o tableta con ONNX Runtime de escritorio usando los ficheros fp32.
- Prototipado y validación de pipelines ASR: los scripts `export.py` y `validate.py` del repositorio permiten reproducir la conversión y comparar WER entre fp32 e int8 antes de desplegar en producción.
- Filtrado y enrutamiento de audio en servidores ligeros: dado su bajo coste computacional, puede usarse como primer clasificador o transcriptor rápido antes de invocar modelos ASR mayores.

## Benchmarks y rendimiento

El autor publica una comprobación de cordura, no un benchmark formal, sobre los primeros 30 clips del split de test vietnamita de FLEURS, con decodificación greedy y texto normalizado (minúsculas y sin puntuación):

| Precision | WER (FLEURS vi, 30 clips) |
|---|---|
| fp32 | 12,6 % |
| int8 | 14,5 % |

No se han publicado en la información disponible resultados de MMLU, HumanEval, GSM8K ni otros benchmarks estándar, que además no aplican a un modelo ASR. Para una evaluación rigurosa se remite al paper de PhoWhisper.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia: unos 62 MB de pesos en int8 más el estado de activaciones y caché KV; en la práctica, menos de 200 MB de memoria residente en un dispositivo móvil.
- Alternativa fp32: unos 151 MB de pesos, adecuada para escritorio o para conversiones posteriores.
- GPU recomendadas: no requiere GPU; está diseñado para CPU móvil. En iOS puede acelerarse con el CoreML Execution Provider; en Android, con los Execution Providers disponibles en ONNX Runtime (NNAPI, XNNPACK) según la build.
- Cabe holgadamente en cualquier GPU de consumo (RTX 4090, RTX 3060, etc.), aunque su uso típico es CPU.
- Opciones de despliegue: ONNX Runtime para Android (`com.microsoft.onnxruntime:onnxruntime-android`), iOS (`onnxruntime-swift-package-manager` u `onnxruntime-objc`), y Python (`onnxruntime`) para validación en escritorio. No se proporcionan recetas para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este formato.
- Latencia y throughput: no disponibles en la información proporcionada; el autor solo recomienda fijar 4 hilos de ejecución intra-operador como configuración de partida.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto audio | Idiomas | Formato | Licencia |
|---|---|---|---|---|---|
| pdnhan/PhoWhisper-tiny-mobile (este) | 39 M | 30 s | vi | ONNX int8/fp32 | BSD-3-Clause |
| vinai/PhoWhisper-tiny | 39 M | 30 s | vi | PyTorch (safetensors) | BSD-3-Clause |
| openai/whisper-tiny | 39 M | 30 s | multilingüe | PyTorch | MIT |
| openai/whisper-base | 74 M | 30 s | multilingüe | PyTorch | MIT |

La ventaja frente a `vinai/PhoWhisper-tiny` es el formato ONNX listo para móvil y la cuantización int8 verificada; frente a `whisper-tiny`, la especialización en vietnamita y el empaquetado para el borde. No se dispone de datos de WER comparativos entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Ventana de audio fija de 30 s: audios más largos requieren segmentación manual y concatenación de transcripciones.
- Solo vietnamita: no se ha validado su uso en otros idiomas y el token de idioma está fijado a `<|vi|>`.
- Degradación por cuantización: el WER sube de 12,6 % a 14,5 % en la muestra de validación del autor, con posible mayor impacto en audio ruidoso o con acentos no representados.
- La evaluación publicada es una comprobación de cordura sobre 30 clips, no un benchmark representativo; no debe usarse para estimar rendimiento en producción.
- Riesgo de alucinación típico de Whisper en segmentos con silencio, ruido o habla no inteligible.
- Sesgos heredados del dataset de entrenamiento original de PhoWhisper, no documentados en esta conversión.
- Licencia BSD-3-Clause: permite uso comercial con atribución y conservación del aviso de copyright; el autor recomienda citar a VinAI Research.
- Dependencia de ONNX Runtime 1.20.0 o superior; no se garantiza compatibilidad con versiones anteriores.
- No incluye detección de actividad de voz ni puntuación; el texto se genera en minúsculas y sin puntuación en la validación del autor.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/pdnhan/PhoWhisper-tiny-mobile
- Modelo base: https://huggingface.co/vinai/PhoWhisper-tiny
- ONNX Runtime: https://onnxruntime.ai
- Optimum (exportación ONNX): https://github.com/huggingface/optimum
- Dataset FLEURS: https://huggingface.co/datasets/google/fleurs
- ONNX Runtime Swift Package Manager: https://github.com/microsoft/onnxruntime-swift-package-manager
- Paper de PhoWhisper (ICLR 2024 Tiny Papers): referencia citada en la model card, sin URL directa en la información disponible.
