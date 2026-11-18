# kaptionai/qwen3-asr-web

## Resumen

`kaptionai/qwen3-asr-web` es un espejo (mirror) fijado de los ficheros necesarios para ejecutar el modelo de reconocimiento automático del habla Qwen3-ASR-0.6B en el navegador mediante onnxruntime-web y WebGPU. Lo publica el equipo de Kaption como parte de su extensión, de modo que la descarga de pesos, tokenizador y configuración quede anclada a revisiones concretas y verificables, en lugar de depender de repositorios de terceros que pueden cambiar.

El modelo subyacente es Qwen3-ASR-0.6B, desarrollado por el equipo Qwen de Alibaba y publicado con licencia Apache-2.0. Se trata de un sistema ASR de aproximadamente 0,6 mil millones de parámetros que combina un encoder de audio con un decoder autorregresivo de tipo transformer, exportado a ONNX en un formato de dos pasos (`decoder_init` y `decoder_step`) pensado para decodificación incremental en el cliente.

La relevancia de este repositorio es fundamentalmente de despliegue: demuestra que un ASR de 0,6B puede ejecutarse íntegramente en el navegador con cuantización agresiva (encoder en int4, decoder en q4f16, embeddings en int8) y un tamaño total de repo de 0,6 GB, sin enviar audio a un servidor. El export ONNX original es de jiangzhuo9357, creado para el proyecto Sokuji, y Kaption añade únicamente el encoder cuantizado a int4.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder para ASR (encoder de audio + decoder autorregresivo), exportado a ONNX en dos grafos (`decoder_init` / `decoder_step`) |
| Parámetros totales | 0,6B (según el nombre del modelo base Qwen3-ASR-0.6B) |
| Parámetros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Encoder: int4 (MatMulNBits, block 32, simétrico, accuracy level 4, activaciones fp32); decoder: q4f16; embeddings: int8 con escalas fp32 |
| Idiomas soportados | no disponible de forma oficial; las pruebas del autor cubren zh, zh-TW, tr, ar, ja y ko |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (`encoder.int4.onnx`, `decoder_init.q4f16.onnx`, `decoder_step.q4f16.onnx`, `decoder_weights.q4f16.data`, `embed_tokens.int8.bin`, `embed_scales.f32.bin`) |

## Arquitectura y entrenamiento

El modelo base Qwen3-ASR-0.6B es un sistema de reconocimiento de voz con encoder de audio y decoder de texto autorregresivo. La exportación ONNX reproduce el mismo contrato de grafo que el modelo original: el encoder recibe `mel` con forma `[1, 128, T]` en fp32 y devuelve `audio_features` con forma `[1, A, 1024]` en fp32. El decoder se divide en dos grafos, uno de inicialización (`decoder_init`) y otro de paso (`decoder_step`), que comparten el fichero de pesos `decoder_weights.q4f16.data`; sus entradas y salidas flotantes son fp16, por lo que se requiere soporte de `shader-f16` en WebGPU.

La única modificación respecto al export upstream es el encoder `encoder.int4.onnx`, generado por Kaption con `MatMulNBitsQuantizer` de onnxruntime: todos los pesos de las operaciones MatMul se cuantizan a 4 bits con bloques de 32, simétrico y accuracy level 4, manteniendo activaciones fp32 y el mismo contrato de grafo. Según el autor, en 8 notas sintéticas (zh, zh-TW, tr ×2, ar, ja, ko) probadas en Chrome sobre un M4 Pro, el encoder int4 igualó al encoder fp16 upstream: CER de 0,003 en CJK, WER de 0,18 frente a 0,21 en turco y árabe, misma velocidad (RTF en caliente de 0,062) y una descarga 245 MB menor. No se detallan en la información disponible los datos de entrenamiento del modelo base (número de tokens, composición del dataset, uso de RLHF/DPO).

## Capacidades

- Reconocimiento automático del habla (ASR) multilingüe, con especial cobertura verificada en chino (simplificado y tradicional), turco, árabe, japonés y coreano en las pruebas del autor.
- Transcripción de audio a texto ejecutada íntegramente en el cliente mediante onnxruntime-web y WebGPU, sin backend remoto.
- Decodificación incremental por pasos gracias a la separación en `decoder_init` y `decoder_step`, adecuada para streaming o procesamiento por segmentos.
- Extracción de características mel en el propio navegador a partir de `mel_filters.json`.
- Tokenización local con `tokenizer.json` y configuración de prompt en `prompt_config.json`.
- No se documentan en la información disponible capacidades de tool calling, agentes, visión, audio de salida ni modo de razonamiento explícito.

## Casos de uso

- Subtitulado en tiempo real en el navegador: la extensión descarga los pesos una vez y ejecuta la transcripción en local con WebGPU, lo que permite generar subtítulos sin enviar el audio a ningún servidor y sin costes de inferencia por minuto.
- Transcripción de reuniones y videollamadas web: al integrarse como extensión, puede capturar el audio de la pestaña y transcribirlo con el decoder incremental, manteniendo la privacidad de conversaciones sensibles.
- Accesibilidad para contenido audiovisual: generación de subtítulos automáticos en reproductores web para personas con discapacidad auditiva, con la ventaja de que el procesamiento ocurre en el dispositivo del usuario.
- Herramientas de notas de voz en aplicaciones web: dictado y conversión de grabaciones a texto en un editor o gestor de notas, con un modelo de 0,6 GB que cabe en la caché del navegador.
- Investigación en ASR en el edge: banco de pruebas para medir el impacto de la cuantización int4/q4f16 en calidad (CER/WER) y velocidad (RTF) sobre hardware consumer, como el M4 Pro empleado por el autor.
- Aplicaciones offline-first o con requisitos de cumplimiento (RGPD): al no requerir conexión ni transferencia de audio, encaja en escenarios donde el envío de voz a la nube está restringido.
- Prototipado de pipelines ASR en WebGPU: servir de referencia para portar otros modelos Qwen3-ASR a ONNX y validar contratos de grafo y cuantizaciones en el navegador.

## Benchmarks y rendimiento

Los únicos datos publicados en la información disponible son las pruebas del autor sobre el encoder int4 frente al encoder fp16 upstream, con 8 notas sintéticas en Chrome sobre un Apple M4 Pro:

| Métrica | Encoder int4 (Kaption) | Encoder fp16 (upstream) |
|---|---|---|
| CER en CJK (zh, zh-TW, ja, ko) | 0,003 | 0,003 |
| WER en turco y árabe | 0,18 | 0,21 |
| RTF en caliente | 0,062 | 0,062 |
| Tamaño de descarga | 245 MB menor | referencia |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, LibriSpeech, Common Voice, FLEURS) en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; el repositorio completo ocupa 0,6 GB, por lo que la huella de memoria del modelo cuantizado es del orden de cientos de megabytes, a lo que se suma el búfer de activaciones y el contexto de audio.
- GPU recomendadas: cualquier GPU con soporte de WebGPU y `shader-f16`. El autor valida Apple M4 Pro; cabe esperar compatibilidad con GPUs de escritorio recientes (NVIDIA RTX serie 20 o superior, AMD RDNA2 o superior, Intel Arc) a través de Chrome.
- Cabe en GPU consumer: sí, siempre que el navegador exponga WebGPU con `shader-f16`; en equipos sin esa capacidad la inferencia no es viable con este export.
- Opciones de despliegue: onnxruntime-web con backend WebGPU (caso previsto); los mismos ficheros ONNX pueden ejecutarse con onnxruntime nativo en servidor si se desea, aunque no es el objetivo del repo.
- Latencia y throughput: RTF en caliente de 0,062 medido en un M4 Pro con Chrome, es decir, aproximadamente 16 veces más rápido que tiempo real en ese hardware.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato / despliegue | Notas |
|---|---|---|---|---|---|
| kaptionai/qwen3-asr-web (Qwen3-ASR-0.6B) | 0,6B | no disponible | Apache-2.0 | ONNX int4/q4f16, WebGPU en navegador | Espejo con encoder int4 propio; RTF 0,062 en M4 Pro |
| Qwen/Qwen3-ASR-0.6B | 0,6B | no disponible | Apache-2.0 | safetensors / transformers | Modelo base original del equipo Qwen |
| jiangzhuo9357/Qwen3-ASR-0.6B-ONNX | 0,6B | no disponible | Apache-2.0 | ONNX (layout v2, decoder q4f16) | Export upstream para Sokuji, sin encoder int4 |
| Whisper large-v3 (referencia de categoría) | 1,55B | 30 s de audio por ventana | MIT | safetensors, GGUF, ONNX | Mayor tamaño; no se dispone de comparación medida en esta información |

No se dispone de datos comparativos de calidad (WER/CER) frente a Whisper u otros ASR en la información proporcionada; la comparación se limita a parámetros, licencia y formato de despliegue.

## Limitaciones y advertencias

- Es un espejo de inferencia, no un modelo entrenado por el publicador: los pesos pertenecen al equipo Qwen y el export ONNX a jiangzhuo9357; Kaption solo añade el encoder int4.
- Requiere WebGPU con `shader-f16`; en navegadores o GPUs sin ese soporte el modelo no funciona tal cual.
- La cuantización int4 del encoder y q4f16 del decoder puede degradar la precisión en dominios no cubiertos por las pruebas del autor (8 notas sintéticas), por lo que la validación en producción con audio real es imprescindible.
- No se documentan los idiomas oficialmente soportados ni el comportamiento en code-switching, acentos o audio con ruido; las pruebas cubren solo seis idiomas.
- Riesgo de alucinación y de transcripciones plausibles pero incorrectas en segmentos de silencio, música o habla solapada, habitual en modelos ASR autorregresivos.
- No se especifican sesgos conocidos, datos de entrenamiento ni evaluaciones de robustez en la información disponible.
- Licencia Apache-2.0 permite uso comercial, pero conviene conservar los avisos de copyright del equipo Qwen y del exportador ONNX.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta y fue creado en noviembre de 2026; su mantenimiento y actualización no están garantizados.
- El tamaño de contexto de audio y la longitud máxima de transcripción no están documentados; deben inferirse de `prompt_config.json` y del contrato de grafo.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/kaptionai/qwen3-asr-web
- Modelo base: https://huggingface.co/Qwen/Qwen3-ASR-0.6B
- Export ONNX upstream: https://huggingface.co/jiangzhuo9357/Qwen3-ASR-0.6B-ONNX
- Proyecto Sokuji (destino original del export): https://github.com/kizuna-ai-lab/sokuji
- Ficheros de referencia internos del repo: `SHA256SUMS`, `source/UPSTREAM-README.md`, `source/quantize_encoder.py`, `prompt_config.json`, `mel_filters.json`, `tokenizer.json`, `LICENSE`
