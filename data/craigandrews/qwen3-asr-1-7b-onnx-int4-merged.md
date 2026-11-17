# craigandrews/qwen3-asr-1.7b-onnx-int4-merged

## Resumen

`qwen3-asr-1.7b-onnx-int4-merged` es una reexportación cuantizada a int4 en formato ONNX del modelo de reconocimiento automático del habla Qwen3-ASR-1.7B, publicado por el usuario craigandrews. No es un modelo nuevo: es una conversión de ingeniería del checkpoint oficial `Qwen/Qwen3-ASR-1.7B-hf` orientada a inferencia eficiente en CPU. Su rasgo distintivo es un decodificador "merged" que acepta simultáneamente una caché KV y una longitud de secuencia dinámica, algo que la exportación dividida (`decoder_init` + `decoder_step`) no permite.

El problema que resuelve es concreto: Qwen3-ASR permite introducir texto libre en el turno de sistema para sesgar la decodificación hacia grafías concretas (por ejemplo, nombres de entidades de domótica). Ese prompt se sitúa antes del audio y su estado de atención no cambia entre locuciones, pero la exportación dividida no podía reutilizarlo. El grafo merged calcula ese estado una sola vez y lo reutiliza, reduciendo la latencia en prompts largos.

Con 1.700 millones de parámetros, licencia Apache 2.0 y un paquete de 1,81 GB en disco, está pensado para despliegues de ASR local en hardware modesto, integrable con runtimes que soporten el layout merged, como `wyoming-faster-whisper`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Qwen3-ASR) exportado a ONNX; decodificador merged con caché KV |
| Parametros totales | 1.7B (modelo base Qwen3-ASR-1.7B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | int4 (RTN MatMulNBits, block_size=64, asimétrico, accuracy_level=4); tabla de embeddings en fp16 |
| Idiomas soportados | multilingüe (la model card cita pruebas en 9 idiomas) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (`.onnx` + `.data`) y `embed_tokens.bin` (fp16) |

## Arquitectura y entrenamiento

El modelo subyacente es Qwen3-ASR-1.7B, un sistema de reconocimiento del habla de la familia Qwen3. Esta ficha no dispone de detalles sobre el entrenamiento original (número de tokens, composición del corpus, uso de RLHF o DPO); esa información corresponde a la model card del checkpoint base `Qwen/Qwen3-ASR-1.7B-hf`, no incluida aquí.

La contribución de esta exportación es de ingeniería de inferencia. El decodificador se exportó desde el checkpoint `-hf` en la revisión `bcd2b5b7f32b480ab5790554cfa8347f246a14f3` con un wrapper propio (torch 2.15, transformers 5.23, opset 17) que reutiliza los módulos entrenados y sustituye únicamente la gestión de la caché KV por tensores apilados. Antes de exportar se validó contra el decodificador de transformers: diferencia máxima de logits de 1,9e-4 en prefill, 7,6e-5 en un paso con caché y 1,3e-4 con prefijo reutilizado; el grafo ONNX en FP32 coincidió con el wrapper hasta 2,3e-4. La cuantización emplea RTN int4 MatMulNBits sobre las 197 matrices de pesos, incluida `lm_head`. El codificador procede de `andrewleech/qwen3-asr-1.7b-onnx`, cuyo fichero `encoder.int4.onnx` contenía en realidad pesos FP32, y se recuantizó a int4 (de 1.270 MB a 197 MB). El grafo consume embeddings en lugar de ids de token, por lo que no incluye tabla de embeddings: el llamador debe consultar `embed_tokens.bin` e insertar las características de audio del codificador.

## Capacidades

- Reconocimiento automático del habla multilingüe (pipeline `automatic-speech-recognition`).
- Sesgo de decodificación mediante prompt de texto libre en el turno de sistema del chat template, útil para grafías de entidades concretas.
- Reutilización del estado de atención del prompt entre locuciones gracias al decodificador merged.
- Procesamiento por lotes de audio y modo streaming (soportado por `wyoming-faster-whisper` con `--qwen3-asr-streaming`).
- Inferencia en CPU mediante onnxruntime, sin requisito de GPU.
- Soporte de caché KV con longitud de secuencia dinámica en el decodificador.

## Casos de uso

- Domótica por voz local: integración con Home Assistant vía `wyoming-faster-whisper` para dictar comandos cortos (1,9–3,5 s) con latencia media de 853 ms en CPU, usando prompts con nombres de entidades para corregir grafías como "Ecobee".
- Transcripción por lotes de audio de duración media: 17,4 s de audio procesados en 4,52 s en modo batch sobre un Ryzen 7 5700X con 4 hilos, adecuado para pipelines de subtitulado en servidores sin GPU.
- Dictado en streaming: con `--qwen3-asr-streaming`, 17,4 s de audio en 3,34 s, útil para interfaces de voz interactivas con respuesta progresiva.
- Despliegue en hardware de gama baja: con 3,07 GB de RSS máximo, cabe en mini-PC, Raspberry Pi de gama alta o contenedores con memoria limitada, sin necesidad de acelerador.
- Sesgo de vocabulario específico de dominio: en aplicaciones con jerga o nombres propios (asistencia clínica, atención al cliente con catálogo de productos), el prompt de sistema permite fijar la grafía esperada y reutilizar su estado entre turnos.
- Reconocimiento multilingüe en 9 idiomas verificado por el autor en pruebas de comandos cortos, aplicable a asistentes de voz con usuarios de distintos idiomas.
- Integración en servicios de transcripción autoalojados: el formato ONNX y la licencia Apache 2.0 permiten empaquetarlo en imágenes Docker propias sin dependencias de proveedores en la nube.

## Benchmarks y rendimiento

El autor no publica benchmarks estándar (WER, MMLU, etc.), sino mediciones de latencia y memoria en un Ryzen 7 5700X con 4 hilos, onnxruntime 1.23.2 y `wyoming-faster-whisper`. Se reproducen a continuación:

| Metrica | 0.6B merged | 1.7B split | 1.7B merged (este) |
|---|---|---|---|
| Tamano en disco | 0,79 GB | 3,06 GB | 1,81 GB |
| RSS maximo | 1,95 GB | 4,52 GB | 3,07 GB |
| Comando corto, media | 438 ms | 876 ms | 853 ms |
| Comando 3,2 s con prompt de 50 nombres (182 tokens) | no disponible | 2.486 ms | 1.123 ms |
| Audio 17,4 s, batch | 2,41 s | 4,55 s | 4,52 s |
| Audio 17,4 s, streaming | 1,74 s | 3,47 s | 3,34 s |

En precisión, el autor indica que las transcripciones fueron idénticas al export split 1.7B en 38 de 38 comprobaciones (19 comandos de Home Assistant en 9 idiomas, con y sin prompt de tres nombres). No es una evaluación de WER: en ese conjunto el 1.7B no fue más preciso que el 0.6B, y un prompt de tres nombres corrigió "Ecobee" mientras que uno de 50 nombres no lo hizo. El autor advierte que el conjunto es pequeño y fácil, y recomienda medir sobre audio propio.

## Requisitos de hardware

- VRAM: no aplica; el modelo está diseñado para inferencia en CPU con onnxruntime.
- Memoria RAM: pico de RSS de 3,07 GB según el autor; reservar al menos 4 GB para margen.
- CPU: probado en Ryzen 7 5700X con 4 hilos; cualquier CPU x86-64 moderna con AVX2 es razonable, aunque no se han publicado mediciones en otras plataformas.
- GPU: no requerida; no se han publicado datos de aceleración por GPU para esta exportación.
- Despliegue: `wyoming-faster-whisper` (con `--stt-library qwen3-asr`), onnxruntime 1.23.2 o superior. El layout merged requiere un runtime que lo soporte; vLLM, llama.cpp, Ollama y TGI no están indicados como compatibles en la información disponible.
- Latencia: 853 ms de media en comandos cortos y 3,34 s para 17,4 s de audio en streaming, en el hardware de referencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Latencia (comando corto) | Memoria (RSS) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| qwen3-asr-1.7b-onnx-int4-merged (este) | 1.7B | no disponible | 853 ms | 3,07 GB | Apache 2.0 | Hugging Face |
| rhasspy/qwen3-asr-0.6b-onnx-int4-merged | 0.6B | no disponible | 438 ms | 1,95 GB | Apache 2.0 | Hugging Face |
| andrewleech/qwen3-asr-1.7b-onnx (split) | 1.7B | no disponible | 876 ms | 4,52 GB | no disponible | Hugging Face |
| Qwen/Qwen3-ASR-1.7B-hf (original) | 1.7B | no disponible | no disponible | no disponible | no disponible | Hugging Face |

La ventaja del merged frente al split se concentra en prompts largos: con un prompt de 182 tokens pasa de 2.486 ms a 1.123 ms, mientras que sin prompt ambos layouts rinden igual. Frente al 0.6B, el 1.7B es aproximadamente el doble de lento en todas las longitudes y necesita unas 1,6 veces más memoria.

## Limitaciones y advertencias

- No es una evaluación de precisión: el autor no publica WER y advierte que en su conjunto de prueba el 1.7B no superó al 0.6B; el gain de precisión que Qwen atribuye al 1.7B debe medirse sobre audio propio.
- El prompt de sesgo no es fiable a cualquier longitud: uno de 50 nombres no corrigió "Ecobee" mientras que uno de tres sí lo hizo.
- Requiere un runtime que soporte el layout merged; los runtimes convencionales de ONNX o los basados en exportaciones split no sirven tal cual. El llamador debe gestionar `embed_tokens.bin` y construir la máscara causal.
- La cuantización int4 introduce degradación: el codificador recuantizado coincidió con el FP32 en 17 de 19 clips, con diferencias como "sixty percent" → "60 percent".
- Sesgos del modelo base no documentados en esta ficha; al ser un modelo ASR multilingüe, la cobertura y el rendimiento pueden variar notablemente entre idiomas.
- Riesgo de alucinación en audio ruidoso o fuera de dominio no cuantificado por el autor.
- Licencia Apache 2.0 permite uso comercial, pero conviene verificar la licencia del checkpoint base Qwen3-ASR-1.7B antes de producción.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: ecosistema de validación muy limitado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/craigandrews/qwen3-asr-1.7b-onnx-int4-merged
- Modelo base: https://huggingface.co/Qwen/Qwen3-ASR-1.7B
- Checkpoint base usado para la exportación: https://huggingface.co/Qwen/Qwen3-ASR-1.7B-hf
- Export split de referencia: https://huggingface.co/andrewleech/qwen3-asr-1.7b-onnx
- Contrapartida 0.6B merged: https://huggingface.co/rhasspy/qwen3-asr-0.6b-onnx-int4-merged
- Export 0.6B int4: https://huggingface.co/rhasspy/qwen3-asr-0.6b-onnx-int4
- Runtime de despliegue: https://github.com/OHF-Voice/wyoming-faster-whisper
