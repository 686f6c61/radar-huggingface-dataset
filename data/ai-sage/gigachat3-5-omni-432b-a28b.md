# ai-sage/GigaChat3.5-Omni-432B-A28B

## Resumen

GigaChat 3.5 Omni es un modelo multimodal any-to-any desarrollado por ai-sage (SaluteDevices/GigaChat) que acepta cualquier combinacion de texto, imagenes, audio y video con su banda sonora, y responde en texto. Es la version multimodal de GigaChat 3.5 Ultra y emplea una arquitectura Mixture-of-Experts (MoE) de 432B parametros totales con 28B parametros activos, construida sobre el lenguaje GigaChat 3.5 de atencion hibrida. Su ventana de contexto alcanza los 131K tokens.

El modelo combina dos encoders especializados que alimentan al lenguaje: un InternViT de 300M parametros para imagenes y fotogramas de video, y un encoder GigaAM sobre caracteristicas log-mel de 64 bins a 16 kHz para audio. La innovacion clave es el procesamiento intercalado de video con su pista de sonido: los fotogramas se muestrean a 1 fps (hasta 512) y cada uno lleva su marca temporal seguido de su porcion de audio, de modo que el modelo "ve y escucha" el video en orden temporal.

Es relevante por su rendimiento en tareas de video con audio y audio puro, donde supera a alternativas como Qwen3-Omni-30B-A3B en varios benchmarks (Video-MME v2, MMLU hablado, RuBQ hablado), y por su soporte nativo de tool calling, function calling y contexto largo. Se distribuye bajo licencia MIT en un checkpoint FP8 con cuantizacion por bloques de 128x128, pensado para inferencia con SGLang.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE con atencion hibrida: Multi-head Latent Attention (MLA) + capas de atencion lineal GatedDeltaNet, GatedNorm, 3 cabezas MTP |
| Parametros totales | 433.568.418.560 (~432B) |
| Parametros activos | 28B |
| Longitud de contexto | 131K tokens |
| Tipos de cuantizacion | FP8 (bloques 128x128); encoders de vision y audio y sus proyectores en BF16 |
| Idiomas soportados | Ruso (ru), ingles (en) |
| Licencia | MIT |
| Formato de pesos | safetensors (checkpoint FP8 para SGLang) |

## Arquitectura y entrenamiento

El lenguaje sigue la arquitectura hibrida de GigaChat 3.5: combina capas de Multi-head Latent Attention (MLA) con capas de atencion lineal GatedDeltaNet, incorpora GatedNorm y dispone de tres cabezas MTP (Multi-Token Prediction) para decodificacion especulativa. El modelo total es un MoE de 432B parametros con 28B activos. Dos encoders alimentan el lenguaje: un InternViT de 300M parametros con entrada de 448x448, donde una imagen se convierte en miniatura mas hasta seis tiles de su canvas de mejor ajuste a 256 tokens cada uno (el primer fotograma de video retiene 256 tokens y los posteriores unos 77 de media); y un encoder GigaAM sobre caracteristicas log-mel de 64 bins a 16 kHz, con un adaptador que produce 6,25 tokens por segundo de audio.

Para video con banda sonora, los fotogramas se muestrean a 1 fps hasta un maximo de 512, cada uno con su marca temporal seguido de su porcion correspondiente de audio, de modo que los embeddings multimodales se intercalan en orden temporal. No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset ni si hubo etapas de RLHF/DPO.

## Capacidades

- Generacion de texto y razonamiento multimodal a partir de entradas de texto, imagen, audio y video.
- Entrada any-to-any: acepta cualquier combinacion de texto, imagenes, audio y video con su banda sonora; la salida es texto.
- Vision: procesamiento de imagenes mediante InternViT con canvas de mejor ajuste y multiples tiles.
- Video con audio sincronizado: comprension conjunta de fotogramas y pista de sonido en orden temporal, con marcas de tiempo.
- Audio y habla: transcripcion/comprension de audio a 16 kHz y tareas de QA sobre audio, incluida localizacion temporal de eventos.
- Tool calling y function calling nativos.
- Soporte para agentes y razonamiento multi-paso (tags tool-use, function-calling).
- Contexto largo de 131K tokens.
- Multilingue en ruso e ingles.
- Decodificacion especulativa mediante tres cabezas MTP.

## Casos de uso

- Analisis de reuniones y videollamadas: el modelo recibe el video con su pista de audio a 1 fps y puede responder preguntas sobre lo que se dijo y lo que se mostro, gracias a la intercalacion temporal de fotogramas y sonido y a su contexto de 131K tokens.
- Moderacion y catalogacion de video: clasificacion de contenido audiovisual combinando senales visuales y sonoras, aprovechando el procesamiento conjunto de hasta 512 fotogramas con su banda sonora.
- Atencion al cliente multimodal en ruso e ingles: gestion de conversaciones multi-turno donde el usuario adjunta imagenes, notas de voz o clips cortos, con soporte de tool calling para consultar sistemas internos.
- Localizacion temporal de eventos en audio: identificacion del intervalo de tiempo de un suceso en clips de hasta 10 minutos (mIoU 48,54 en la ablacion publicada), util en monitorizacion y analisis de medios.
- Asistentes de accesibilidad: descripcion de imagenes y videos con audio para generar resumenes textuales, apoyandose en los encoders de vision y audio.
- Pipelines de agentes con function calling: integracion en flujos automatizados donde el modelo decide que herramienta invocar a partir de entradas multimodales, con soporte de razonamiento multi-paso.
- Procesamiento de documentos escaneados con audio asociado: extraccion de informacion combinando OCR visual (tiles de imagen) y descripciones habladas.

## Benchmarks y rendimiento

Video con banda sonora:

| Tarea | GigaChat 3.5 Omni | Qwen3-Omni-30B-A3B | MiMo-V2.6-Pro | WeMM-Video (FP8) |
|---|---|---|---|---|
| Daily-Omni | 81,04 | 72,01 | 68,34 | **81,79** |
| WorldSense | 56,97 | 54,51 | 52,08 | **58,51** |
| Video-MME (con audio) | 80,74 | 76,11 | 76,70 | **82,30** |
| Video-MME v2 | **25,92** | 18,39 | 23,26 | 22,36 |
| Media | 61,17 | 55,26 | 55,10 | **61,24** |

Audio:

| Tarea | Metrica | GigaChat 3.5 Omni | Qwen3-Omni-30B-A3B | MiMo-V2.6-Pro | Ming-3.0-audio-flash |
|---|---|---|---|---|---|
| MMAU test-mini | acc | 78,50 | 77,10 | **78,60** | 73,00 |
| MMAU-Pro | acc | **65,85** | 62,49 | 64,42 | 64,49 |
| MMAR | acc | 69,92 | **72,54** | 71,43 | 71,13 |
| MMSU | acc | **73,83** | 71,77 | 72,28 | 53,35 |
| MMLU (hablado) | acc | **79,39** | 73,95 | 75,17 | 67,80 |
| Big Bench Audio (media de 4) | acc | **77,20** | 65,00 | **77,20** | 73,60 |
| RuBQ (hablado, ru) | acc | **78,45** | 42,66 | 27,09 | 52,15 |
| DCASE 2026 audio QA | acc | **67,62** | 56,23 | 60,02 | 34,50 |
| Localizacion temporal, <= 10 min | mIoU | **48,54** | 0,85 | 18,16 | 3,03 |

Imagen (fragmento disponible):

| Benchmark | GigaChat 3.5 Omni | Qwen3-Omni-30B-A3B | Qwen3.5-397B-A17B | DeepSeek V4.1 Flash | Qwen3.8-27B NT | Gemma 4-31B NR |
|---|---|---|---|---|---|---|
| MMMU val | 65,33 | 61,00 | 64,33 | **65,78** | 60,56 | 64,11 |
| MMStar Hybrid | 75,57 | 71,52 | **79,91** | 77,60 | 74,57 | 72,95 |

Los datos de MMBench no estan completos en la informacion disponible. La ablacion de entrada de video muestra que fotogramas + audio supera a audio solo o fotogramas solo en todas las tareas (por ejemplo, Video-MME: 80,74 frente a 68,52 y 73,07).

## Requisitos de hardware

- VRAM estimada para inferencia: el checkpoint FP8 ocupa aproximadamente 437 GB en disco; en memoria se requiere una capacidad similar para pesos FP8, mas overhead de encoders BF16 y cache KV.
- GPU recomendadas: despliegue multi-GPU de clase datacenter (H100, H200, A100 80GB) por el tamano del checkpoint.
- No cabe en GPU consumer (RTX 4090, 24 GB) ni en configuraciones de una sola GPU de gama alta consumer.
- Opciones de despliegue: SGLang es el runtime indicado por el autor para el checkpoint FP8; no se mencionan otras opciones en la informacion disponible.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Activos | Contexto | Licencia | Enfoque multimodal |
|---|---|---|---|---|---|
| GigaChat 3.5 Omni | 432B | 28B | 131K | MIT | Texto, imagen, audio, video con audio |
| Qwen3-Omni-30B-A3B | 30B | 3B | no disponible | no disponible | Texto, imagen, audio, video |
| MiMo-V2.6-Pro | no disponible | no disponible | no disponible | no disponible | Multimodal (video con audio) |
| WeMM-Video (FP8) | 35B | 3B | 131.072 | no disponible | Video con audio |

En los benchmarks publicados, GigaChat 3.5 Omni lidera en Video-MME v2, MMAU-Pro, MMSU, MMLU hablado, RuBQ hablado, DCASE 2026 y localizacion temporal, mientras que WeMM-Video obtiene mejores resultados en Daily-Omni, WorldSense y Video-MME, y Qwen3-Omni en MMAR.

## Limitaciones y advertencias

- Idiomas soportados limitados a ruso e ingles; el rendimiento en otros idiomas no esta documentado.
- Riesgo de alucinacion inherente a los modelos generativos, especialmente en tareas de audio y video con senales ambiguas.
- El checkpoint publicado es FP8 con cuantizacion por bloques; los encoders y proyectores permanecen en BF16, lo que condiciona el despliegue a SGLang.
- Requiere infraestructura multi-GPU de gran capacidad; no es viable en hardware consumer.
- No se documentan sesgos conocidos, datos de entrenamiento ni procesos de alineacion (RLHF/DPO) en la informacion disponible.
- Aunque la licencia es MIT, conviene verificar las condiciones de los componentes de terceros (InternViT, GigaAM) antes de uso comercial.
- El contexto de 131K tokens puede degradarse en entradas de video muy largas con muchos fotogramas y audio simultaneo.

## Enlaces

- Hugging Face: https://huggingface.co/ai-sage/GigaChat3.5-Omni-432B-A28B
- Modelo base (texto): https://huggingface.co/ai-sage/GigaChat3.5-432B-A28B
- Encoder de audio GigaAM: https://github.com/salute-developers/GigaAM
- WeMM-Video Instruct FP8 (comparativa): https://huggingface.co/tencent/WeMM-Video-35BA3B-FP8
