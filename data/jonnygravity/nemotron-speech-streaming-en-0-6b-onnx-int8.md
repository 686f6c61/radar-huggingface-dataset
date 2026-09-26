# jonnygravity/nemotron-speech-streaming-en-0.6b-onnx-int8

## Resumen

`jonnygravity/nemotron-speech-streaming-en-0.6b-onnx-int8` es una exportación a ONNX con cuantización dinámica int8 del modelo de reconocimiento automático del habla (ASR) en streaming `nvidia/nemotron-speech-streaming-en-0.6b`, desarrollado originalmente por NVIDIA. El autor de esta derivada no es NVIDIA: los pesos son de NVIDIA y los únicos cambios introducidos son la conversión a ONNX y la cuantización int8 de los pesos. Está pensada para dictado en Windows dentro del proyecto `atrium`, ejecutada mediante `parakeet-rs` 0.3.8 sobre ONNX Runtime 1.28.

La arquitectura es un FastConformer cache-aware con decodificador RNNT (transducer), de aproximadamente 0,6 mil millones de parámetros, especializado en ASR en inglés con transcripción incremental. El perfil de streaming configurado es `att_context_size = [70, 6]`, de modo que cada llamada al encoder consume un chunk de 560 ms y emite 7 frames de encoder de 80 ms cada uno, manteniendo cachés de atención entre chunks para no perder contexto.

El checkpoint exportado es el de enero de 2026 (rama `nemotron-speech-streaming-jan2026`, commit `c0acae9cc4163ab0d45cd403fbecbcb0635ee685`), no el de marzo de 2026 que NVIDIA mantiene en `main`. La diferencia relevante es que este checkpoint escribe los números en forma numérica ("42", "0.317", "WebView 2") mientras que el de marzo los escribe en forma hablada ("line forty two", "zero point three one seven"), lo que importa para dictado directo en un campo de texto sin paso de normalización inversa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | FastConformer (encoder) + RNNT (prediction net LSTM + joint) cache-aware streaming |
| Parametros totales | 0,6 B (según denominación del modelo; cifra exacta no disponible) |
| Longitud de contexto | Atención limitada a `[70, 6]` frames (izquierda/derecha); streaming por chunks de 560 ms sin límite fijo de duración de audio |
| Tipos de cuantizacion | int8 dinámica de pesos (`onnxruntime.quantization.quantize_dynamic`); el modelo base admite otras, como int4 k-quant |
| Idiomas soportados | Inglés (`en`) |
| Licencia | NVIDIA Open Model License (`license: other`), sujeta además a los términos Trustworthy AI de NVIDIA |
| Formato de pesos | ONNX (opset 17) int8; tokenizador SentencePiece (`.model`) |
| Tamano del repo | 0,9 GB |
| Ficheros | `encoder.onnx` (880.555.626 bytes), `decoder_joint.onnx` (10.962.697 bytes), `tokenizer.model` (251.056 bytes), `SHA256SUMS` |
| Tokenizador | SentencePiece, 1.024 piezas, id de blank = 1024 |
| Entrada de audio | Log-mel de 128 bins, 16 kHz, ventana de 25 ms, hop de 10 ms, pre-énfasis 0,97, sin normalización de features (`normalize: NA`) |
| Chunk de streaming | 560 ms (56 frames mel nuevos + 9 frames de caché pre-encoder, 65 frames en total) |
| Salida del encoder | 7 frames de 80 ms por chunk completo, 1.024 dimensiones |
| Pipeline | automatic-speech-recognition |
| Libreria | onnx |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El modelo es un FastConformer-RNNT cache-aware. El encoder es un Conformer con cachés de atención por capa: las formas de las cachés de entrada (`cache_last_channel` de `[24, 1, 70, 1024]` y `cache_last_time` de `[24, 1, 1024, 8]`) indican 24 capas y una dimensión de modelo de 1.024. El decoder es una prediction net LSTM con estados de `[2, 1, 640]` y un joint que produce logits de 1.025 dimensiones (1.024 piezas del tokenizador más el blank). La exportación se hizo con el exportador TorchScript legacy de NeMo a opset 17, invocando `encoder.set_default_att_context_size([70, 6])` y `encoder.setup_streaming_params(chunk_size=7, shift_size=7)`, lo que produce `pre_encode_cache_size=[0, 9]`, `drop_extra_pre_encoded=2`, `valid_out_len=7` y `last_channel_cache_size=70`. El encoder se traza envolviendo `cache_aware_stream_step(..., keep_all_outputs=False, drop_extra_pre_encoded=2)`; el decoder y el joint se exportan con el exportador `RNNTDecoderJoint` nativo de NeMo.

La cuantización se aplicó grafo a grafo con `onnxruntime.quantization.quantize_dynamic`, con cuantización de pesos a int8 (la model card se interrumpe justo en el parámetro `weight_type`, por lo que no se detalla la configuración completa). El entorno de conversión fue Windows 11 x64, Python 3.11.9, `nemo_toolkit[asr]` 3.0.0, `torch` 2.8.0+cpu, `onnx` 1.23.0, `onnxruntime` 1.28.0 y `numpy` 2.4.6. El fichero de entrada fue `nemotron-speech-streaming-en-0.6b.nemo` (2.473.031.680 bytes, SHA-256 `8aa8b21f...`), y el `tokenizer.model` incluido es el SentencePiece extraído byte a byte del `.nemo`.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni si hubo fases de RLHF/DPO en el modelo base de NVIDIA.

## Capacidades

- Reconocimiento de voz en streaming en inglés con transcripción incremental (texto emitido a medida que llegan los chunks).
- Procesamiento en chunks de 560 ms con estado de caché entre chunks, lo que permite audio de duración arbitraria sin reiniciar el contexto acústico.
- Salida en alfabeto inglés, espacios y apóstrofos, según la model card del modelo base.
- Los números se emiten en forma numérica en este checkpoint de enero de 2026 ("42", "0.317", "WebView 2", "300"), a diferencia del checkpoint de marzo de 2026 en `main`.
- Inferencia sobre audio mono a 16 kHz; el cálculo de features log-mel lo realiza el runtime (`parakeet-rs`), no el grafo.
- Decodificación RNNT con joint greedy sobre 1.025 clases.
- No se documentan capacidades de tool calling, function calling, agentes, visión, audio generation ni multilingüismo (solo inglés).

## Casos de uso

- Dictado en escritorio Windows: el caso de uso declarado por el autor es el dictado dentro de `atrium`, ejecutando el modelo vía `parakeet-rs` 0.3.8 sobre ONNX Runtime 1.28. La salida numérica directa evita tener que aplicar normalización inversa antes de insertar texto en un campo.
- Subtitulado en tiempo real de reuniones o streams en inglés: la salida incremental cada 560 ms permite mostrar texto parcial mientras se habla, con una latencia algorítmica de aproximadamente medio segundo.
- Transcripción de notas de voz y grabaciones largas: al ser cache-aware, mantiene contexto entre chunks y no requiere trocear el audio manualmente.
- Asistentes de voz locales sin conexión: al ser un modelo de 0,6 B cuantizado a int8, puede desplegarse en CPU sin enviar audio a servicios externos, lo que resulta adecuado para entornos con requisitos de privacidad.
- Integración en aplicaciones C#/.NET: existe un ejemplo oficial de `onnxruntime-genai` (`examples/csharp/NemotronSpeech`) que demuestra ASR en streaming en tiempo real con esta familia de modelos.
- Despliegue en sistemas embebidos y dispositivos de borde: `sherpa-onnx` mantiene scripts específicos para exportar y ejecutar esta familia de modelos con onnxruntime sin conexión, orientados a sistemas embebidos y Android.
- Preprocesado de pipelines de voz a texto: transcripción previa a etapas de NLP, indexación de audio o generación de actas en inglés.
- Evaluación de cuantización: sirve como referencia para comparar int8 dinámico frente a int8 estático con calibración (variante de `potgieterdl`) o int4 k-quant (configuración evaluada en el paper de ASR en dispositivo).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio no incluye métricas de WER, latencia ni throughput, y las búsquedas web encontradas no aportan cifras comparativas para esta variante concreta. El único dato de latencia documentado corresponde a una configuración distinta (Nemotron-0.6B int4 k-quant con perfil de streaming `(7, 10, 7)`), para la que el paper de ASR en dispositivo reporta un retardo algorítmico de 0,56 s; no debe extrapolarse a este repositorio.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1 GB de pesos en int8 (`encoder.onnx` 880 MB + `decoder_joint.onnx` 11 MB) más las cachés de atención (24 capas × 1 × 70 × 1.024 float32 para la caché de canal y 24 × 1 × 1.024 × 8 float32 para la caché temporal) y estados del decoder. El total se mantiene por debajo de 2 GB en la práctica.
- Inferencia en CPU: viable y es el escenario objetivo del autor; el paper citado describe un pipeline completo con ONNX Runtime optimizado para despliegue en el borde solo con CPU.
- GPU: no se especifican GPU recomendadas ni requisitos mínimos. Dado el tamaño, cualquier GPU consumer con 2-4 GB de VRAM es suficiente; no se documenta soporte ni optimización específica para A100, H100 o RTX 4090.
- Cabe en GPU consumer: sí, por tamaño de pesos; no hay mediciones publicadas en esta ficha.
- Opciones de despliegue: ONNX Runtime 1.28 (probado), `parakeet-rs` 0.3.8 con `parakeet_rs::Nemotron`, `sherpa-onnx` (scripts para modelos Nemotron streaming), `onnxruntime-genai` (ejemplo C# NemotronSpeech).
- Latencia y throughput: no medidos. La única cifra estructural es el tamaño de chunk de 560 ms, con 7 frames de encoder de 80 ms por chunk.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / streaming | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `jonnygravity/nemotron-speech-streaming-en-0.6b-onnx-int8` | 0,6 B | `att_context_size [70, 6]`, chunk 560 ms | int8 dinámica | NVIDIA Open Model License | ONNX, repo de 0,9 GB, 0 descargas |
| `potgieterdl/nemotron-speech-streaming-en-0.6b-onnx-int8` | 0,6 B | misma base, streaming | int8 estática con calibración | NVIDIA Open Model License | ONNX |
| `nvidia/nemotron-speech-streaming-en-0.6b` | 0,6 B | streaming cache-aware, checkpoint de marzo de 2026 en `main` | pesos originales (`.nemo`) | NVIDIA Open Model License | NeMo / HuggingFace |
| Variante int4 k-quant de Nemotron-0.6B (paper de ASR en dispositivo) | 0,6 B | perfil `(7, 10, 7)`, 0,56 s de retardo | int4 k-quant | no disponible en la información | Pipeline descrito en el paper |

No se dispone de cifras de precisión (WER) para ninguna de las variantes en la información consultada, por lo que la comparación se limita a parámetros, configuración de streaming, cuantización y licencia.

## Limitaciones y advertencias

- Solo inglés: el campo `language` del repositorio es `en`; no hay soporte multilingüe documentado.
- Riesgo de error de reconocimiento intrínseco a cualquier modelo ASR (palabras mal transcritas, nombres propios, acrónimos y dominio específico). No hay métricas de WER publicadas para esta cuantización, por lo que no se puede cuantificar la degradación introducida por int8 dinámico frente al modelo en precisión original.
- Sin benchmark ni validación pública: el repositorio tiene 0 descargas y 0 likes, y la model card se interrumpe en la descripción del paso de cuantización, por lo que parte de la receta no está completamente documentada.
- Este repositorio no es una publicación de NVIDIA ni está respaldado por NVIDIA; es una derivada de un tercero.
- Restricciones de licencia: NVIDIA Open Model License y, adicionalmente, los términos Trustworthy AI de NVIDIA (sección 2.3 del acuerdo). Es obligatorio revisar ambas antes de un uso comercial o de redistribución.
- La rama del modelo base es un checkpoint congelado de enero de 2026; NVIDIA mantiene el checkpoint actualizado en `main` (marzo de 2026), con un comportamiento distinto en la escritura de números (forma hablada), lo que afecta a la integración si se espera salida numérica.
- Sin paso de normalización de texto inversa (ITN), la puntuación y el formato quedan fuera del alcance del modelo; la model card del base describe la salida como alfabeto inglés, espacios y apóstrofos.
- El contrato de runtime es estricto: las formas de las cachés, el tamaño de chunk de 7 frames y `pre_encode_cache=9` deben respetarse; usarlo con un runtime que no implemente `cache_aware_stream_step` con `drop_extra_pre_encoded=2` producirá resultados incorrectos.
- No se documentan capacidades de agentes, tool calling ni procesamiento multimodal.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/jonnygravity/nemotron-speech-streaming-en-0.6b-onnx-int8
- Modelo base: https://huggingface.co/nvidia/nemotron-speech-streaming-en-0.6b
- Variante int8 estática con calibración: https://huggingface.co/potgieterdl/nemotron-speech-streaming-en-0.6b-onnx-int8
- Licencia NVIDIA Open Model License: https://www.nvidia.com/en-us/agreements/enterprise-software/nvidia-open-model-license/
- Términos Trustworthy AI de NVIDIA: https://www.nvidia.com/en-us/agreements/trustworthy-ai/terms/
- `parakeet-rs` (runtime objetivo): https://github.com/altunenes/parakeet-rs
- Scripts de `sherpa-onnx` para Nemotron streaming: https://github.com/k2-fsa/sherpa-onnx/tree/master/scripts/nemo/nemotron-speech-streaming-en-0.6b
- Ejemplo C# de `onnxruntime-genai` para Nemotron Speech: https://github.com/microsoft/onnxruntime-genai/tree/main/examples/csharp/NemotronSpeech
- Paper "Pushing the Limits of On-Device Streaming ASR": https://arxiv.org/html/2604.14493v1 (PDF: https://arxiv.org/pdf/2604.14493)
