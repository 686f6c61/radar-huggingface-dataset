# AEON-7/Qwen3.6-27B-AEON-Ultimate-Uncensored-Multimodal-NVFP4-MTP

## Resumen

El AEON-7/Qwen3.6-27B-AEON-Ultimate-Uncensored-Multimodal-NVFP4-MTP es una variante cuantizada y "abliterated" (sin mecanismos de rechazo) del modelo multimodal Qwen3.6-27B, publicada por el usuario AEON-7 y construida sobre su propio checkpoint base en BF16. El repositorio empaqueta los pesos en formato NVFP4 de NVIDIA (via ModelOpt), incorpora una cabeza MTP (multi-token prediction) para decodificacion especulativa nativa y anade una pila de atencion hibrida con Gated DeltaNet y componentes tipo Mamba. El safetensors declara 18.386.186.992 parametros reales, pese a que el nombre comercial del modelo indica "27B": conviene tratar esa cifra con cautela a la hora de dimensionar hardware.

El modelo esta disenado explicitamente para GPUs Blackwell con VRAM dedicada (sm_100 en B100/B200 y sm_120 en RTX PRO 6000) y para el DGX Spark / GB10 en memoria unificada, con parches propios sm_121a. No es un modelo de proposito general desplegable en cualquier GPU: la cuantizacion NVFP4 exige arquitectura Blackwell, y el flujo de despliegue recomendado pasa por un contenedor vLLM propio de AEON (0.24.0) que anade cache KV NVFP4, DFlash y TurboQuant K8V4.

Su relevancia actual es doble. Por un lado, ejemplifica una linea de trabajo muy concreta: injertar cabezas MTP sobre pesos ya cuantizados en NVFP4 para acelerar la decodificacion (la receta procede de la serie Qwen3.6-27B-NVFP4-MTP de sakamakismile). Por otro, la propia model card lo marca como obsoleto: el autor recomienda migrar a la release Qwen3.8-27B-AEON-ULTIMATE-UNCENSORED-NVFP4-MIXED, por lo que este checkpoint debe considerarse historico o de mantenimiento para descargas ya existentes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer hibrido con atencion y Gated DeltaNet (tipo Mamba); arquitectura declarada en transformers como `qwen3_5`; cabeza MTP (`qwen3_5_mtp`) |
| Parametros totales | 18.386.186.992 (segun safetensors). El nombre del modelo indica 27B; no disponible la explicacion de la discrepancia |
| Parametros activos | No disponible (no se documenta que sea un modelo MoE) |
| Longitud de contexto | 229.376 tokens configurados en la receta de referencia de vLLM (224K). Contexto nativo del modelo base: no disponible |
| Tipos de cuantizacion | NVFP4 en pesos (NVIDIA ModelOpt); cache KV en FP8 (`fp8_e4m3`); existe checkpoint base en BF16 |
| Idiomas soportados | Ingles (en), chino (zh), multilingue (sin desglose de cobertura) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (transformers), cuantizacion `modelopt` NVFP4. GGUF: no disponible |
| Tamano del repositorio | 28,6 GB |
| Modalidad | Imagen-texto-a-texto (`image-text-to-text`) y generacion de texto |
| Descargas / likes | 3.266 descargas, 37 likes (a fecha de la ultima actualizacion) |
| Fechas | Creado el 2026-04-28; actualizado el 2026-09-12 |

## Arquitectura y entrenamiento

La informacion disponible describe una pila hibrida de atencion mas Gated DeltaNet (GDN), con etiquetas que mencionan Mamba, `hybrid-attention` y `gated-deltanet`. La arquitectura se registra en transformers como `qwen3_5`, y el modelo incorpora una cabeza MTP nativa identificada como `qwen3_5_mtp`. Sobre esa base se ha aplicado una cuantizacion NVFP4 con la herramienta ModelOpt, con elecciones de cuantizacion por proyeccion, y se ha injertado la cabeza MTP sobre los pesos ya abliterated del checkpoint AEON-Ultimate. El pipeline de injerto y la configuracion de ModelOpt provienen de la receta validada de sakamakismile en su serie Qwen3.6-27B-NVFP4-MTP (con mas de 22.000 descargas), adaptada aqui a los pesos abliterated de AEON. La model card no aporta datos sobre volumen de tokens de entrenamiento, composicion del dataset ni uso de RLHF, DPO u otras fases de alineamiento posteriores al entrenamiento.

En el plano de despliegue, la innovacion principal es la combinacion de cuantizacion NVFP4 en pesos con cache KV FP8, decodificacion especulativa (MTP nativo o drafter DFlash de z-lab) y soporte multimodal con `--mm-encoder-tp-mode data`. El contenedor asociado, basado en vLLM 0.24.0, integra el PR #44389 de cache KV NVFP4 (que segun el autor multiplica por tres la capacidad), DFlash y TurboQuant K8V4. No se especifican detalles de la composicion del dataset multimodal ni del encoder de vision mas alla de su presencia.

## Capacidades

- Generacion de texto conversacional multi-turno, con `pipeline_tag: text-generation` y etiqueta `conversational`.
- Entrada multimodal imagen-texto: el tag `image-text-to-text` y el flag `--mm-encoder-tp-mode data` confirman el procesamiento de imagenes junto a texto.
- Razonamiento con parser dedicado: la receta de servicio usa `--reasoning-parser qwen3`, lo que implica soporte de modo de razonamiento separado.
- Tool calling / function calling: la receta incluye `--tool-call-parser qwen3_coder` y `--enable-auto-tool-choice`, por lo que el modelo soporta invocacion automatica de herramientas.
- Decodificacion especulativa: cabeza MTP nativa (`qwen3_5_mtp`) con `num_speculative_tokens` configurable, o drafter externo DFlash (`num_speculative_tokens: 12` en la receta recomendada).
- Multilingue declarado (en, zh, multilingual), sin detalle de cobertura adicional.
- Sin censura: los tags `abliterated` y `uncensored` indican que se han eliminado los comportamientos de rechazo del modelo original.
- Capacidad de servir sesiones de contexto muy largo (hasta 229.376 tokens en la configuracion de referencia).

No hay evidencia en la informacion disponible de capacidades de audio, vision por video ni generacion de imagenes.

## Casos de uso

- Asistentes conversacionales de contexto largo: con 229.376 tokens configurados y cache KV FP8, el modelo permite mantener sesiones con documentos o historiales extensos sin truncar, algo util en analisis de expedientes o soporte tecnico prolongado.
- Analisis de documentos con imagenes: al aceptar entrada imagen-texto, se puede usar para extraer y razonar sobre capturas, diagramas, tablas escaneadas o interfaces de usuario junto al texto asociado.
- Agentes con herramientas: el soporte de `tool-call-parser qwen3_coder` y `--enable-auto-tool-choice` lo habilita para flujos de agente multi-paso que consulten APIs, ejecuten busquedas o manipulen ficheros.
- Generacion y revision de codigo en pipelines internos: el modo de razonamiento con parser `qwen3` y el parser de tool calling permiten integrarlo en asistentes de repositorio o revision de cambios, siempre que el contexto de licencia Apache-2.0 y el caracter abliterated sean aceptables.
- Generacion asistida sin filtros editoriales: para casos de escritura creativa, simulacion de personajes o redaccion de contenido sensible donde los rechazos automaticos resultan un obstaculo, el modelo no aplica capas de rechazo.
- Despliegue de alta concurrencia en hardware Blackwell: con `--max-num-seqs 16`, `--max-num-batched-tokens 32768` y prefix caching, es apto para servir peticiones de varios usuarios en una sola GPU con VRAM dedicada.
- Investigacion sobre decodificacion especulativa: al incluir cabeza MTP nativa y soporte de drafter DFlash, sirve como banco de pruebas para medir ganancias de throughput con distintos `num_speculative_tokens`.
- Procesamiento por lotes en DGX Spark / GB10: con `--gpu-memory-utilization` limitado a 0.60-0.70, permite convivir con sidecars de ASR, TTS o embeddings en el mismo equipo de memoria unificada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. Las unicas cifras de rendimiento citadas en la model card corresponden al modelo hermano `-Multimodal-NVFP4-MTP-XS`, no a este checkpoint, y son medidas de servicio, no de calidad:

| Metrica (modelo hermano -MTP-XS) | Valor |
|---|---|
| Pico en matematicas/codigo (greedy, n_spec=15) | ~45 tok/s |
| Media global (greedy, n_spec=15) | 34,7 tok/s |
| Agregado con concurrencia x4, regimen estable | ~84 tok/s |
| Cache KV | NVFP4 / FP8 (`fp8_e4m3`) |

El autor afirma que este modelo, servido con drafter DFlash en DGX Spark, alcanza "paridad de velocidad" con el hermano -MTP-XS "mientras puntua mas alto en benchmarks de evaluacion de calidad", pero no se aportan los numeros de esas evaluaciones.

## Requisitos de hardware

- VRAM estimada para pesos: aproximadamente 10-11 GB para 18.386 millones de parametros a ~4,5 bits efectivos (NVFP4). Es una estimacion a partir del recuento de parametros, no un dato publicado por el autor.
- Espacio en disco: 28,6 GB de repositorio, muy por encima del peso teorico de los pesos NVFP4; hay que prever ese margen.
- GPU obligatoria con soporte NVFP4: arquitecturas Blackwell sm_100 (B100, B200) y sm_120 (RTX PRO 6000 Blackwell). El modelo declara soporte para `dedicated-vram-blackwell`.
- DGX Spark / GB10: soportado mediante parches sm_121a del contenedor AEON; en memoria unificada el autor recomienda `--gpu-memory-utilization` entre 0.60 y 0.70, ya que por encima de ~0.8 el pool compartido CPU+GPU entra en page thrashing.
- GPUs consumer: no se documenta soporte. Una RTX 4090 (Ada, sm_89, 24 GB) no ejecuta NVFP4 de forma nativa; habria que recurrir al checkpoint base BF16 y re-cuantizar, algo no cubierto por esta ficha.
- Memoria de cache KV: con `--max-model-len 229376`, `--max-num-seqs 16` y cache FP8, el consumo de KV es el factor dominante por encima de los pesos; la receta usa prefix caching y chunked prefill para gestionarlo.
- Opciones de despliegue: vLLM 0.24.0 mediante los contenedores `ghcr.io/aeon-7/aeon-vllm-ultimate:latest` (Spark / GB10) o `ghcr.io/aeon-7/aeon-vllm-ultimate-rtx:latest` (RTX discreta). Requiere `--trust-remote-code`, `--quantization modelopt` y backend de atencion TRITON_ATTN.
- Decodificacion especulativa: MTP nativo con `{"method":"qwen3_5_mtp","num_speculative_tokens":3}` o drafter DFlash de z-lab con 12 tokens especulativos (opcion recomendada en Spark).
- Llama.cpp, Ollama y TGI: no disponibles para este formato NVFP4 segun la informacion proporcionada.
- Throughput y latencia: solo se conocen las cifras indirectas del modelo hermano recogidas en la seccion anterior; no hay mediciones publicadas especificas de este checkpoint.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Modalidad | Licencia | Notas |
|---|---|---|---|---|---|---|
| AEON-7/Qwen3.6-27B-...-NVFP4-MTP (este) | 18.386.186.992 (safetensors) | 229.376 tokens configurados en vLLM | NVFP4 pesos + FP8 KV | Texto e imagen | Apache-2.0 | Marcado como obsoleto por el autor |
| AEON-7/Qwen3.6-27B-AEON-Ultimate-Uncensored-BF16 | No disponible | No disponible | BF16 | No disponible | No disponible | Checkpoint base del que deriva este modelo |
| AEON-7/Qwen3.6-27B-...-Multimodal-NVFP4-MTP-XS | No disponible | No disponible | NVFP4 | Texto e imagen | No disponible | Hermano menor, con benchmarks de servicio publicados en la model card |
| sakamakismile/Qwen3.6-27B-Text-NVFP4-MTP | No disponible | No disponible | NVFP4 | Texto | No disponible | Receta de referencia; mas de 22.000 descargas; sin abliterar y sin componente multimodal |
| AEON-7/Qwen3.8-27B-AEON-ULTIMATE-UNCENSORED-NVFP4-MIXED | No disponible | No disponible | NVFP4 + FP8 (enrejado mixto) | No disponible | No disponible | Sucesor recomendado por el autor; "muy superior en capacidad" segun la model card |

No hay datos publicos en la informacion disponible para comparar calidad, contexto nativo o latencia frente a modelos de otros autores de tamano similar.

## Limitaciones y advertencias

- Modelo abliterated: se han eliminado los comportamientos de rechazo. Puede generar contenido danino, ilegal o gravemente inapropiado sin filtro alguno; no debe exponerse a usuarios finales sin moderacion externa.
- Sin benchmarks de calidad publicados: no hay evidencia verificable de rendimiento en MMLU, HumanEval, GSM8K ni evaluaciones multimodales, por lo que las afirmaciones de mejora frente al hermano -XS no son comprobables con los datos disponibles.
- Discrepancia de parametros: el nombre indica 27B pero el safetensors declara 18,39 mil millones. Cualquier presupuesto de VRAM o calculo de coste basado en "27B" sera erroneo.
- Modelo marcado como obsoleto por su propio autor, que recomienda migrar a la release Qwen3.8. Mantenerlo en produccion implica asumir deuda tecnica.
- Dependencia fuerte de hardware: NVFP4 exige Blackwell (sm_100/sm_120) y el flujo validado depende de contenedores propios de AEON y de vLLM 0.24.0 con parches sm_121a. No hay ruta soportada en Ampere, Ada ni en GPUs consumer.
- Requiere `--trust-remote-code`: implica ejecutar codigo del repositorio, con el riesgo de seguridad que conlleva.
- Idiomas: la cobertura declarada se limita a ingles, chino y "multilingue" sin desglose. El castellano no esta confirmado y su rendimiento en espanol no esta documentado.
- Riesgo de alucinacion: no se documentan tasas de alucinacion ni evaluaciones de veracidad; al ser un modelo sin alineamiento de seguridad, la verificacion de salidas es responsabilidad del integrador.
- Contexto: los 229.376 tokens son un valor de configuracion del servidor vLLM, no una especificacion nativa confirmada. El rendimiento de recuperacion en contextos muy largos no esta medido.
- Licencia Apache-2.0: permite uso comercial y modificacion, pero no exime de responsabilidad legal por el contenido generado por un modelo abliterated.
- Ajuste de memoria delicado en DGX Spark: superar `--gpu-memory-utilization` de ~0.8 provoca page thrashing y bloqueo del equipo, segun advierte el propio autor.
- Los resultados de busqueda web realizados no devolvieron informacion relevante sobre este modelo; no se han podido contrastar los datos de la model card con fuentes independientes.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/AEON-7/Qwen3.6-27B-AEON-Ultimate-Uncensored-Multimodal-NVFP4-MTP
- Modelo base (BF16): https://huggingface.co/AEON-7/Qwen3.6-27B-AEON-Ultimate-Uncensored-BF16
- Sucesor recomendado: https://huggingface.co/AEON-7/Qwen3.8-27B-AEON-ULTIMATE-UNCENSORED-NVFP4-MIXED
- Hermano menor: https://huggingface.co/AEON-7/Qwen3.6-27B-AEON-Ultimate-Uncensored-Multimodal-NVFP4-MTP-XS
- Receta de referencia (sakamakismile): https://huggingface.co/sakamakismile/Qwen3.6-27B-Text-NVFP4-MTP
- Drafter DFlash: https://huggingface.co/z-lab/Qwen3.6-27B-DFlash
- Repositorio de despliegue y benchmarks: https://github.com/AEON-7/Qwen3.6-27B-AEON-Ultimate-Uncensored-DFlash
- Contenedor vLLM para DGX Spark / GB10: https://github.com/AEON-7/vllm-ultimate-dgx-spark
- Imagen de contenedor (Spark / GB10): ghcr.io/aeon-7/aeon-vllm-ultimate:latest
- Imagen de contenedor (RTX discreta): ghcr.io/aeon-7/aeon-vllm-ultimate-rtx:latest
