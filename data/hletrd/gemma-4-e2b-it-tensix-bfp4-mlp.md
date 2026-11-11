# hletrd/gemma-4-E2B-it-Tensix-BFP4-MLP

## Resumen

`hletrd/gemma-4-E2B-it-Tensix-BFP4-MLP` es una exportación cuantizada de `google/gemma-4-E2B-it`, el modelo on-device instruction-tuned de Google DeepMind. La particularidad de esta ficha es que no se trata de una cuantización convencional (GPTQ estándar, AWQ o GGUF), sino de una exportación preparada para ejecutarse sobre la arquitectura Tensix de Tenstorrent (Wormhole y Blackhole), usando los formatos nativos de bloque flotante de TT-NN: `ttnn.bfloat4_b` (BFP4) y `ttnn.bfloat8_b` (BFP8).

El autor, hletrd, ha redondeado únicamente las proyecciones lineales del modelo de lenguaje mediante GPTQ con búsqueda de exponente, dejando intactos en bf16 los módulos de audio y visión (`audio_tower`, `embed_audio`, `embed_vision`, `vision_tower`), así como embeddings, normas, biases y la LM head. El resultado es un checkpoint de 5.525.831.235 parámetros totales (repo de 11,1 GB en bf16) que, empaquetado en los formatos Tensix, ocupa 6,796 GB con una media de 11,70 bits por peso.

El interés de esta exportación es doble: por un lado, permite cargar el modelo en `transformers` como si fuera el base (los ficheros almacenan valores bf16 que caen exactamente sobre la rejilla de bloque flotante de cada matriz), y por otro, un packer de TT-NN puede almacenar esos mismos valores sin volver a redondearlos, garantizando que el cómputo en NPU coincide bit a bit con el del checkpoint. Es una pieza relevante para quien quiera evaluar Gemma 4 E2B sobre aceleradores de Tenstorrent sin reentrenar ni recalibrar.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (Gemma 4 E2B, instruction-tuned) con torres de visión y audio; proyecciones lineales cuantizadas a formatos de bloque flotante de TT-NN |
| Parámetros totales | 5.525.831.235 |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | GPTQ con búsqueda de exponente; BFP4 (`ttnn.bfloat4_b`, 4,5 bits/peso) en MLP gate/up/down; BFP8 (`ttnn.bfloat8_b`, 8,5 bits/peso) en atención q/k/v/o; bf16 en LM head, embeddings, normas, biases, audio y visión |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bf16 con valores sobre rejilla BFP); empaquetado nativo TT-NN para Tensix |

## Arquitectura y entrenamiento

El modelo base es Gemma 4 E2B en su variante instruction-tuned, un modelo on-device de Google DeepMind con capacidades multimodales (image-text-to-text y audio, según los módulos presentes: `vision_tower`, `embed_vision`, `audio_tower`, `embed_audio`). La exportación conserva la arquitectura original y solo modifica el formato numérico de las proyecciones lineales del modelo de lenguaje: 35 capas con atención q/k/v/o en BFP8 y MLP (gate, up, down) en BFP4. La LM head está atada al embedding y permanece en bf16.

La innovación técnica está en el esquema de cuantización: BFP4 y BFP8 son formatos de bloque flotante de TT-NN en los que 16 valores consecutivos en tile layout comparten un exponente de 8 bits, y cada valor conserva signo y mantisa de 3 bits (BFP4) o 7 bits (BFP8). El redondeo se hizo con GPTQ y búsqueda de exponente, de modo que los valores almacenados en safetensors ya caen exactamente sobre la rejilla de cada bloque; así, `transformers` reproduce el mismo cómputo que el modelo redondeado y el packer de TT-NN no introduce error adicional. No se proporcionan datos sobre el dataset de entrenamiento del modelo base (número de tokens, composición, RLHF/DPO) en la información disponible.

## Capacidades

- Generación de texto y razonamiento conversacional en modo instruction-tuned.
- Procesamiento image-text-to-text (pipeline `any-to-any`), con torre de visión intacta en bf16.
- Procesamiento de audio, con torre de audio intacta en bf16.
- Soporte de plantilla de chat (`apply_chat_template`) para diálogo multi-turno.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Ejecución sobre NPU Tensix (Wormhole, Blackhole) mediante TT-NN, además de inferencia estándar en `transformers`.

## Casos de uso

- Inferencia multimodal en el borde sobre aceleradores Tenstorrent: desplegar el modelo en Wormhole o Blackhole aprovechando que las matrices en BFP4 se transmiten desde memoria con aproximadamente la mitad de bytes que en BFP8, reduciendo el ancho de banda necesario por token generado.
- Prototipado en `transformers` antes de portar a NPU: cargar el checkpoint con `AutoModelForCausalLM.from_pretrained(..., dtype="bfloat16")` y validar respuestas y calidad sin disponer de hardware Tenstorrent, ya que los valores almacenados reproducen el modelo redondeado.
- Validación de pipelines de cuantización: usar `verify_grid.py` para re-redondear cada matriz con el exponente de su bloque y detectar valores que cambiarían, útil como test de regresión en CI para exportaciones GPTQ con búsqueda de exponente.
- Asistentes conversacionales con entrada de imagen: al conservar `vision_tower` y `embed_vision` en bf16, el modelo puede responder preguntas sobre imágenes en escenarios de asistencia en dispositivo.
- Transcripción y comprensión de audio en local: los módulos `audio_tower` y `embed_audio` intactos permiten integrar el modelo en flujos de voz sin depender de servicios en la nube.
- Benchmarking de aceleradores: comparar el throughput real de TT-NN frente a la simulación funcional (`ttsim`) usando el mismo checkpoint, dado que el autor probó el empaquetado en el simulador de Blackhole pero no en hardware físico.
- Generación de caché de pesos para despliegue: usar `pack_tensix.py --cache-dir DIR` para producir ficheros de caché de TT-NN que se cargan con `ttnn.as_tensor(..., cache_file_name=...)` sin volver a empaquetar, reduciendo el tiempo de arranque en producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor indica explícitamente que no ha medido estas exportaciones en tarjetas propias de Tenstorrent y que las pruebas se limitaron a `ttsim` (simulador funcional de Blackhole) con `ttnn 0.81.1` y `torch 2.15.0`, verificando que el empaquetado de las 205 matrices redondeadas y su desempaquetado son bit a bit idénticos, y que un round-trip por DRAM del dispositivo no altera ningún valor.

## Requisitos de hardware

- VRAM estimada para inferencia en GPU convencional: el repo en bf16 ocupa 11,1 GB, por lo que se necesita al menos ~12 GB de VRAM para cargarlo en `transformers` con `device_map="auto"`; el empaquetado Tensix ocupa 6,796 GB, pero ese formato solo es utilizable en NPU Tensix.
- GPU recomendadas para la ruta `transformers`: RTX 4090 (24 GB) o superior; A100/H100 si se busca mayor throughput o batch.
- Cabe en GPU de consumo: sí, en tarjetas con 12 GB o más en bf16 (por ejemplo RTX 3060 12 GB, RTX 4070 Ti, RTX 4090); no se dispone de datos para cuantizaciones adicionales a 8 o 4 bits en formatos estándar.
- Aceleradores objetivo: Tenstorrent Wormhole y Blackhole (Tensix Cores), con `tt-metal`/TT-NN instalado vía su guía oficial.
- Opciones de despliegue: `transformers` (ruta de referencia), TT-NN sobre Tensix con `pack_tensix.py` y caché de pesos; no se mencionan vLLM, llama.cpp, Ollama ni TGI en la información disponible.
- Latencia y throughput: no disponibles; el autor no ha medido en hardware Tenstorrent y no aporta cifras de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `hletrd/gemma-4-E2B-it-Tensix-BFP4-MLP` | 5.525.831.235 | no disponible | GPTQ + BFP4/BFP8 Tensix | Apache 2.0 | Hugging Face |
| `google/gemma-4-E2B-it` (base) | no disponible en la información | no disponible | bf16 | Apache 2.0 (según el campo `license` del repo derivado) | Hugging Face |
| Alternativas de cuantización estándar de Gemma 4 E2B (GGUF, AWQ) | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento comparado entre esta exportación y el modelo base ni con otras cuantizaciones, por lo que la comparativa se limita a parámetros, formato y licencia.

## Limitaciones y advertencias

- El autor no ha ejecutado el modelo en hardware Tenstorrent real; todas las comprobaciones se hicieron sobre `ttsim`, el simulador funcional de Blackhole, por lo que el rendimiento y la estabilidad en Wormhole/Blackhole físicos están sin verificar.
- La cuantización BFP4 en las capas MLP introduce un error de redondeo no evaluado en benchmarks; no hay datos de degradación de calidad respecto al modelo base.
- Los formatos `bfloat4_b` y `bfloat8_b` solo son utilizables en TT-NN; fuera de Tensix, el checkpoint se carga como bf16 en `transformers` y no aporta ahorro de memoria frente al base.
- Solo están cuantizadas las proyecciones lineales del modelo de lenguaje; atención y MLP tienen formatos distintos (BFP8 y BFP4), lo que puede complicar la planificación de memoria en el dispositivo.
- No se dispone de información sobre sesgos, tasas de alucinación ni cobertura idiomática del modelo base en esta ficha.
- Licencia Apache 2.0 declarada en el repo, pero conviene verificar los términos del modelo base `google/gemma-4-E2B-it` antes de uso comercial, ya que la licencia del derivado puede no coincidir con la del original.
- El repositorio no está afiliado ni respaldado por Tenstorrent, según indica el propio autor.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia comunitaria de uso en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/hletrd/gemma-4-E2B-it-Tensix-BFP4-MLP
- Modelo base: https://huggingface.co/google/gemma-4-E2B-it
- tt-metal y TT-NN: https://github.com/tenstorrent/tt-metal
- Guía de instalación de TT-NN: https://github.com/tenstorrent/tt-metal/blob/main/INSTALLING.md
- Documentación de Tenstorrent: https://docs.tenstorrent.com
- Paper referenciado en los tags: arXiv:2607.02770 (no verificado en la información disponible)
