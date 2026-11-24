# koelony/Qwen3-ASR-0.6B-Cantonese-HK-ONNX

## Resumen

Qwen3-ASR-0.6B-Cantonese-HK-ONNX es la distribucion en formato ONNX int8 del modelo de reconocimiento automatico del habla (ASR) koelony/Qwen3-ASR-0.6B-Cantonese-HK, un ajuste fino del modelo Qwen3-ASR de 0,6 mil millones de parametros orientado a cantonés coloquial de Hong Kong (yue-HK) con alternancia de codigo con ingles. El paquete esta disenado especificamente para inferencia en navegador mediante onnxruntime-web, con ejecucion en WebGPU y respaldo en WASM multihilo, y se distribuye troceado en ficheros de como maximo 24 MiB (25.165.824 bytes) para compatibilidad con la Cache API del navegador y con CDN de activos estaticos.

El modelo resuelve el problema de transcribir habla cantonesa coloquial real, incluyendo code-switching cantones-ingles, y produce salida en chino tradicional de Hong Kong con caracteres propios del canton escrito (係, 喺, 嘅, 咗, 㗎, 閂). Frente a alternativas genericas multilingues, incorpora soporte de hotwords (palabras clave contextuales) para sesgar la decodificacion hacia vocabulario especifico del dominio.

La relevancia actual del paquete radica en su naturaleza de despliegue: permite ASR de calidad en el cliente sin backend, con una huella total de 1.165.015.959 bytes distribuida en 54 partes, y bajo licencia Apache-2.0, lo que facilita su integracion comercial. La arquitectura subyacente es la de Qwen3-ASR (encoder convolucional mas transformer con decodificacion autoregresiva), cuantizada a int8 para el runtime web.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3-ASR (encoder + decoder transformer autoregresivo), exportada a ONNX en tres sesiones: encoder, decoder_init y decoder_step |
| Parametros totales | 0,6 mil millones (aproximado, segun nombre del modelo) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | int8 (variante int8-web-20261114); embeddings de tokens en float16 |
| Idiomas soportados | yue (cantonés de Hong Kong), zh, en |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX con datos externos (encoder.onnx, decoder_init.onnx, decoder_step.onnx, decoder_weights.data), embed_tokens.bin, mel_filters.bin, vocab.json, tokenizer_config.json, config.json |
| Variante | int8-web-20261114 |
| Tamano del paquete | 1.165.015.959 bytes en 54 partes (1.165.020.780 incluyendo manifest.json); repo de 1,2 GB |
| Tamano maximo de parte | 25.165.824 bytes (24 MiB) |
| Runtime objetivo | onnxruntime-web (WebGPU y WASM multihilo con aislamiento COOP/COEP) |
| Preprocesado de audio | log-mel tipo Whisper (mel_filters.bin) |
| Tokenizacion | BPE (vocab.json, tokenizer_config.json) |

## Arquitectura y entrenamiento

El modelo base es un Qwen3-ASR de 0,6 mil millones de parametros, una arquitectura de reconocimiento del habla compuesta por un encoder acustico y un decoder transformer autoregresivo. En esta distribucion ONNX el grafo se divide en tres sesiones independientes: encoder.onnx (216.349.953 bytes) procesa las caracteristicas log-mel; decoder_init.onnx (578.375 bytes) inicializa el estado de decodificacion; y decoder_step.onnx (561.847 bytes) ejecuta un paso autoregresivo por token, con los pesos del decoder en decoder_weights.data (633.466.880 bytes) y los embeddings de tokens en embed_tokens.bin (311.164.928 bytes) en float16. El preprocesado log-mel tipo Whisper se materializa en mel_filters.bin (102.912 bytes).

El ajuste fino del modelo base esta orientado a cantonés coloquial de Hong Kong con alternancia de codigo con ingles, y produce salida en chino tradicional de Hong Kong. La model card de esta distribucion no detalla el volumen de datos de entrenamiento, la composicion del dataset ni si se emplearon tecnicas de RLHF o DPO; para esos detalles remite a la model card del modelo base koelony/Qwen3-ASR-0.6B-Cantonese-HK. La innovacion tecnica destacable de este paquete es la cuantizacion int8 junto con el troceado en partes de 24 MiB y un manifest.json con indices y hashes SHA-256 por fichero logico, que permite streaming, cache y verificacion de integridad en el navegador. El soporte de hotwords contextuales se documenta en la model card del modelo base.

## Capacidades

- Reconocimiento automatico del habla en cantonés coloquial de Hong Kong (yue-HK) con salida en chino tradicional de Hong Kong.
- Manejo de code-switching cantones-ingles dentro de la misma emision.
- Soporte de hotwords: sesgo de decodificacion hacia vocabulario contextual o de dominio (detalles en la model card del modelo base).
- Transcripcion con preprocesado log-mel tipo Whisper y decodificacion BPE.
- Ejecucion en navegador con onnxruntime-web sobre WebGPU, con respaldo en WASM multihilo.
- Soporte de idiomas adicionales declarados: chino (zh) e ingles (en).
- No se documentan en esta model card capacidades de vision, audio generativo, tool calling ni razonamiento multi-paso; se trata de un modelo exclusivamente ASR.

## Casos de uso

- Subtitulado en vivo en navegador: el paquete permite transcribir audio capturado por el microfono del usuario sin enviar datos a un servidor, usando WebGPU o WASM multihilo, lo que encaja en requisitos de privacidad y reduce costes de backend.
- Herramientas de dictado para cantonés de Hong Kong: integracion en editores web o aplicaciones de notas donde el usuario habla en canton coloquial y el modelo devuelve texto en chino tradicional con caracteres propios del canton escrito.
- Transcripcion de reuniones con code-switching: al soportar mezcla de cantones e ingles, es adecuado para entornos profesionales de Hong Kong donde se alternan ambos idiomas en una misma intervencion.
- Sesgo de vocabulario con hotwords: en dominios como nombres de productos, toponimos o jerga interna, el soporte de hotwords permite mejorar la precision sobre terminos especificos sin reentrenar.
- Despliegue en CDN estatico: el troceado en partes de 24 MiB y el manifest.json con hashes facilitan servir el modelo desde un CDN de activos estaticos y cachearlo en la Cache API del navegador, util para aplicaciones web sin infraestructura de inferencia dedicada.
- Prototipado y demos interactivas: el paquete esta pensado para demos en navegador (demo.koelony.com), lo que permite validar la calidad ASR en cantonés antes de pasar a la variante BF16 en servidor o a la variante GGUF en escritorio.
- Procesamiento por lotes en cliente: para ficheros de audio subidos por el usuario, la inferencia local evita costes de transferencia y permite cumplir requisitos de residencia de datos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card de esta distribucion remite a las tablas de benchmarks en BF16 de la model card del modelo base koelony/Qwen3-ASR-0.6B-Cantonese-HK, que no forma parte de la informacion proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; el paquete int8 ocupa 1.165.015.959 bytes, por lo que se necesita al menos ese espacio en memoria o cache del navegador, mas el overhead del runtime y de las activaciones.
- GPU recomendadas: no se especifican modelos concretos; el runtime objetivo es WebGPU, por lo que se beneficia de GPU integradas o dedicadas con soporte WebGPU en el navegador.
- Compatibilidad con GPU de consumo: si, el diseno esta orientado a navegador, lo que incluye equipos de consumo con WebGPU; en ausencia de WebGPU hay respaldo en WASM multihilo.
- Opciones de despliegue: onnxruntime-web (WebGPU o WASM multihilo con aislamiento COOP/COEP); para otros entornos, el autor ofrece la variante BF16 con Transformers, qwen-asr y vLLM, y la variante GGUF para llama.cpp.
- Latencia y throughput: no disponibles en la informacion proporcionada.
- Almacenamiento: 1,2 GB de repositorio; el paquete se sirve en 54 partes de como maximo 24 MiB.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Formato | Licencia | Notas |
|---|---|---|---|---|---|---|
| koelony/Qwen3-ASR-0.6B-Cantonese-HK-ONNX (este) | 0,6 B | no disponible | yue, zh, en | ONNX int8 para navegador | Apache-2.0 | Optimizado para onnxruntime-web (WebGPU/WASM) |
| koelony/Qwen3-ASR-0.6B-Cantonese-HK | 0,6 B | no disponible | yue, zh, en | BF16, Transformers | Apache-2.0 | Modelo base; para transformers, qwen-asr, vLLM y fine-tuning |
| koelony/Qwen3-ASR-0.6B-Cantonese-HK-GGUF | 0,6 B | no disponible | yue, zh, en | GGUF Q4_K_M / Q6_K / Q8_0 + mmproj | Apache-2.0 | Para llama.cpp, OraType, transcribe.cpp / Hex |
| koelony/Qwen3-ASR-1.7B-Cantonese-HK | 1,7 B | no disponible | yue, zh, en | BF16 (y GGUF) | Apache-2.0 | Tier de mayor precision para servidor o escritorio |

La comparativa se limita a las variantes del mismo autor documentadas en la model card; no se dispone de datos de benchmarks ni de modelos de terceros comparables en la informacion proporcionada.

## Limitaciones y advertencias

- El modelo esta especializado en cantonés de Hong Kong y code-switching con ingles; su rendimiento en otras variedades de chino o en otros idiomas no esta documentado.
- No se han publicado benchmarks en esta distribucion, por lo que la calidad real frente al modelo base BF16 o frente a la variante de 1,7 B no puede cuantificarse con los datos disponibles.
- La cuantizacion int8 puede introducir degradacion de precision respecto al modelo base en BF16; no se documenta la magnitud de esa perdida.
- Riesgo de alucinacion y de transcripciones incorrectas inherente a los modelos ASR, especialmente en audio con ruido, solapamiento de hablantes o jerga no cubierta por los hotwords.
- Sesgos no documentados: la model card no detalla sesgos conocidos por acento, edad, genero o registro.
- La ejecucion en navegador depende de WebGPU o de WASM multihilo con aislamiento COOP/COEP; sin esas condiciones el rendimiento puede degradarse o la inferencia no ser viable.
- El paquete requiere gestionar la descarga y concatenacion de 54 partes y verificar los hashes SHA-256 del manifest.json para garantizar integridad.
- Licencia Apache-2.0: permite uso comercial, pero se recomienda revisar las condiciones del modelo base Qwen3-ASR subyacente y de los datasets de ajuste fino, no detalladas en esta model card.

## Enlaces

- Hugging Face (este paquete): https://huggingface.co/koelony/Qwen3-ASR-0.6B-Cantonese-HK-ONNX
- Modelo base BF16: https://huggingface.co/koelony/Qwen3-ASR-0.6B-Cantonese-HK
- Variante GGUF: https://huggingface.co/koelony/Qwen3-ASR-0.6B-Cantonese-HK-GGUF
- Variante 1.7B: https://huggingface.co/koelony/Qwen3-ASR-1.7B-Cantonese-HK
- Variante 1.7B GGUF: https://huggingface.co/koelony/Qwen3-ASR-1.7B-Cantonese-HK-GGUF
- Codigo de inferencia (GitHub): https://github.com/koelony/qwen3-asr-cantonese-hk
- Demo en vivo (ingles): https://demo.koelony.com/en/
- Demo en vivo (cantonés): https://demo.koelony.com/
- Proyecto: https://koelony.com/asr/
- Sitio del autor: https://koelony.com
- Perfil del autor: https://huggingface.co/joe2643
- Licencia Apache-2.0: https://www.apache.org/licenses/LICENSE-2.0
