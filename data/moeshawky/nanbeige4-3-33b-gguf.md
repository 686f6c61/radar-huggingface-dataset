# moeshawky/Nanbeige4.3-33B-GGUF

## Resumen

Nanbeige4.3-33B-GGUF es la distribución en formato GGUF del modelo denso Nanbeige4.3-33B, publicada por el usuario moeshawky. No se trata de un modelo nuevo ni de un ajuste fino: es una conversión y cuantización del checkpoint original en bfloat16 (14 shards, ~62 GB) a cuatro ficheros GGUF listos para llama.cpp, con 33.118.977.024 parámetros totales y licencia Apache-2.0. El repositorio ocupa 148,7 GB porque conserva el intermedio F16 (66,24 GB) junto a las tres cuantizaciones derivadas.

El interés práctico está en que un modelo de 33B con arquitectura Llama densa y GQA 7:1 pasa de requerir ~62 GB en bf16 a 20,05 GB en Q4_K_M, lo que lo hace ejecutable en una GPU de consumo de 24 GB con contexto moderado. El modelo base declara una ventana de 524.288 posiciones máximas (rope theta 120.000.000), un vocabulario de 166.912 tokens y 52 capas, lo que lo sitúa en la gama de modelos de código abierto de 30-35B con contexto largo.

La relevancia es doble: por un lado, esta es la vía de despliegue en local para quien no disponga de 80 GB de VRAM; por otro, el autor documenta el proceso de cuantización con verificación explícita (471 tensores convertidos, 0 fallbacks en las tres ejecuciones de `llama-quantize`), lo que permite reproducir los ficheros. No se han publicado benchmarks ni detalles de entrenamiento en la información disponible, y el modelo solo declara inglés como idioma.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | LlamaForCausalLM densa con GQA (52 capas, hidden 7168, FFN 22016) |
| Parámetros totales | 33.118.977.024 |
| Parámetros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 524.288 posiciones máximas según `max_position_embeddings`; rope theta 120.000.000. Los ejemplos de la model card usan `--ctx-size 4096` |
| Tipos de cuantización | F16 (16,00 BPW), Q8_0 (8,50 BPW), Q6_K (6,56 BPW), Q4_K_M (4,84 BPW) |
| Idiomas soportados | Inglés (`en` en tags y model card); vocabulario de 166.912 tokens |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (llama.cpp); el modelo base se distribuye en safetensors bf16 |

Detalles estructurales adicionales: 56 cabezas de consulta y 8 de clave/valor (ratio 7:1), dimensión de cabeza 128, `tie_word_embeddings: false`, `rms_norm_eps: 1e-05`.

Tamaños de fichero declarados por el autor:

| Fichero | Tamaño | BPW |
|---|---|---|
| `Nanbeige4.3-33B.F16.gguf` | 66,24 GB | 16,00 |
| `Nanbeige4.3-33B.Q8_0.gguf` | 35,20 GB | 8,50 |
| `Nanbeige4.3-33B.Q6_K.gguf` | 27,17 GB | 6,56 |
| `Nanbeige4.3-33B.Q4_K_M.gguf` | 20,05 GB | 4,84 |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only denso de la familia Llama (`LlamaForCausalLM`), sin mezcla de expertos. Consta de 52 capas con atención por grupos (GQA) de 7:1: 56 cabezas de consulta frente a 8 de clave/valor, con dimensión de cabeza 128. El tamaño oculto es 7168 y la capa feed-forward intermedia 22016. El vocabulario es inusualmente grande para un modelo de su tamaño (166.912 tokens), lo que reduce el coste por token en textos con mucha variación léxica a cambio de una matriz de embeddings mayor. La configuración fija `max_position_embeddings` en 524.288 con rope theta de 120.000.000, lo que indica extensión de contexto mediante RoPE de baja frecuencia.

Sobre el entrenamiento no hay información en la documentación disponible: no se especifican tokens de entrenamiento, composición del dataset, ni si hubo fases de RLHF, DPO o ajuste instructivo. La model card del repositorio GGUF es exclusivamente una ficha de conversión y cuantización; no reproduce la del modelo base.

La innovación documentada de esta publicación es de proceso, no de modelado: la conversión se hizo con `convert_hf_to_gguf.py --outtype f16` forzando explícitamente F16 (no `auto`) para generar un intermedio estable, y las tres cuantizaciones se derivaron de ese intermedio con `llama-quantize` sobre 4 hilos de CPU. El autor reporta que los 471 tensores se convirtieron al tipo solicitado sin ninguna degradación de fallback en las tres ejecuciones, y conserva el F16 en el repositorio para poder re-derivar cuantizaciones sin volver a los 62 GB de safetensors. No se emiten afirmaciones de calidad sobre las cuantizaciones más allá de lo que reporta llama.cpp; el propio autor advierte que las medidas de perplejidad miden fluidez, no fidelidad.

## Capacidades

- Generación de texto autoregresiva en inglés, con pipeline declarado `text-generation`.
- Etiqueta `conversational` en los metadatos del repositorio, lo que sugiere uso en formato de diálogo, si bien no se documenta si el modelo base está ajustado para seguir instrucciones.
- Vocabulario de 166.912 tokens, útil para tokenizar de forma eficiente textos con terminología variada.
- Ventana teórica de hasta 524.288 posiciones según configuración; el soporte efectivo a esa longitud no está verificado en la documentación.
- Compatibilidad con el ecosistema llama.cpp: `llama-cli`, `llama-server` con API HTTP y `llama-cpp-python`.
- Soporte de tool calling / function calling: no disponible (no documentado).
- Soporte de agentes y razonamiento multi-paso: no disponible (no documentado).
- Capacidades multimodales (visión, audio): no disponibles.
- Modo thinking o razonamiento extendido: no disponible.
- Capacidades multilingües: solo se declara inglés; no hay evaluación de otros idiomas.

## Casos de uso

- Despliegue local en estación de trabajo con una sola GPU de 24 GB: con Q4_K_M (20,05 GB) y 8.192 tokens de contexto (el KV cache a esa longitud ronda 1,7 GB), el modelo entra en una RTX 4090 o RTX 3090. Es el escenario principal de esta publicación.
- Servicio HTTP interno de generación de texto: `llama-server --ctx-size 4096` expone una API compatible con clientes OpenAI, suficiente para prototipos, herramientas internas o entornos de desarrollo sin presupuesto de GPU en cloud.
- Procesamiento por lotes en CPU: el autor generó y verificó las cuantizaciones con 4 hilos de CPU; con 32-64 GB de RAM se pueden ejecutar tareas de resumen o clasificación offline sin GPU, aceptando latencias altas.
- Sustitución de un modelo mayor en fase de evaluación: al compartir arquitectura Llama, permite probar prompts y pipelines con un 33B antes de comprometer hardware para modelos de mayor tamaño.
- Investigación sobre el efecto de la cuantización: al conservar F16, Q8_0, Q6_K y Q4_K_M del mismo checkpoint en un único repositorio, sirve para medir la degradación de calidad entre precisiones con un protocolo controlado.
- Generación de texto en inglés con contexto largo: la configuración admite hasta 524.288 posiciones, útil para documentos extensos siempre que se valide empíricamente el comportamiento más allá de la ventana usada en los ejemplos (4.096 tokens).
- Base para ajuste fino o destilación: el formato GGUF no es el adecuado para reentrenar, pero el checkpoint bf16 referenciado sí lo es, y la licencia Apache-2.0 no impone restricciones de uso comercial.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

La model card no incluye MMLU, HumanEval, GSM8K ni ninguna otra métrica de calidad, y tampoco se han medido latencia o throughput de inferencia. El autor indica explícitamente que no formula afirmaciones de calidad sobre las cuantizaciones más allá de lo que reporta llama.cpp. Cualquier cifra de rendimiento habría que obtenerla midiendo sobre el propio checkpoint.

## Requisitos de hardware

Estimaciones a partir de los tamaños de fichero declarados. El KV cache se calcula con la configuración dada: 2 × 52 capas × 8 cabezas KV × 128 dimensiones × 2 bytes ≈ 208 KiB por token, es decir, unos 1,7 GB para 8.192 tokens y unos 6,8 GB para 32.768 tokens. Hay que sumar 1-2 GB de overhead del runtime.

- Q4_K_M (20,05 GB): cabe en GPU de 24 GB (RTX 4090, RTX 3090, A10G 24 GB) con contexto de 4K-8K. Con 32K de contexto el total se acerca a 28 GB y requiere offload parcial o GPU de 32 GB.
- Q6_K (27,17 GB): no cabe en 24 GB. Necesita A100 40 GB, V100 32 GB con contexto corto, o reparto entre GPU y RAM.
- Q8_0 (35,20 GB): A100 40 GB, L40S 48 GB, o dos GPU de 24 GB con `--split-mode layer`.
- F16 (66,24 GB): A100 80 GB, H100 80 GB, o ejecución en CPU con al menos 96 GB de RAM.
- Requisitos de RAM para inferencia en CPU: ~32 GB para Q4_K_M, ~48 GB para Q6_K, ~64 GB para Q8_0, ~96 GB o más para F16.
- Opciones de despliegue verificadas en la documentación: `llama-cli`, `llama-server` (servidor HTTP), `llama-cpp-python`. Al ser GGUF, es consumible por otras herramientas compatibles con este formato (Ollama, LM Studio, interfaces gráficas de llama.cpp); el soporte de vLLM para GGUF es experimental y TGI no lo admite.
- Aceleración por GPU: la model card no documenta compilación con CUDA ni `-ngl`; los comandos de ejemplo usan `-t 4` sin offload, lo que implica ejecución en CPU en el entorno del autor.
- Latencia y throughput: no disponibles. No se ha publicado ninguna medición de tokens por segundo ni de tiempo a primer token.

## Comparativa con modelos similares

No se dispone de datos verificados de modelos alternativos en la información proporcionada, por lo que no se ofrece una comparación cifrada. La tabla recoge únicamente lo confirmado para este modelo y deja el resto como no disponible.

| Modelo | Parámetros | Contexto | Licencia | Formato disponible | Datos comparativos |
|---|---|---|---|---|---|
| Nanbeige4.3-33B (esta ficha) | 33,12 B densos | 524.288 posiciones máx. (config) | Apache-2.0 | GGUF F16/Q8_0/Q6_K/Q4_K_M; safetensors bf16 | Punto de partida |
| Alternativas de la misma franja (30-35B densos, p. ej. Qwen2.5-32B, Yi-34B, Gemma 2 27B) | No verificado en la información disponible | No verificado | No verificado | No verificado | No disponible |

La comparación rigurosa exigiría ejecutar los mismos benchmarks sobre este checkpoint y sobre los candidatos, algo que no se ha hecho en la documentación consultada. La única comparación objetivable aquí es de empaquetado: frente a un 33B en bf16 (~62 GB), esta distribución ofrece una variante de 20,05 GB con licencia Apache-2.0, lo que reduce el requisito de VRAM en un factor aproximado de 3.

## Limitaciones y advertencias

- Idiomas: solo se declara inglés. No hay evidencia de calidad en castellano ni en otros idiomas, pese al vocabulario de 166.912 tokens.
- Ausencia total de benchmarks: no se puede afirmar nada sobre razonamiento, código o matemáticas sin medirlo.
- Naturaleza del modelo base: no se documenta si Nanbeige4.3-33B está ajustado para seguir instrucciones. Si es un modelo base, el rendimiento conversacional en producción será limitado sin ajuste previo.
- Contexto: aunque la configuración declare 524.288 posiciones, los ejemplos de uso emplean 4.096 tokens. No hay validación publicada de la calidad de atención más allá de esa ventana, y el coste de KV cache crece de forma lineal.
- Cuantización: no se han publicado métricas de perplejidad ni evaluaciones comparativas entre Q4_K_M, Q6_K y Q8_0. Q4_K_M es la opción con mayor riesgo de degradación y la más atractiva por tamaño, lo que exige validación propia antes de producción.
- Procedencia: el repositorio lo publica un usuario individual (moeshawky), no la organización Nanbeige. Registra 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validación comunitaria. Conviene verificar los hashes frente a una conversión propia.
- Repositorio pesado: 148,7 GB en total por la retención del intermedio F16. La descarga selectiva de un solo fichero es obligatoria en la práctica.
- Alucinación: riesgo inherente a cualquier modelo generativo de esta escala, no mitigado ni evaluado en la documentación disponible. No hay información sobre sesgos.
- Licencia: Apache-2.0 permite uso comercial, pero se aplica al artefacto publicado; conviene revisar los términos del modelo base y de los datos de entrenamiento originales, no documentados aquí.
- Sin garantías de soporte: la model card fija la fecha de verificación en 2026-10-25 y no indica mantenimiento posterior ni actualizaciones de las cuantizaciones.

## Enlaces

- Repositorio GGUF: https://huggingface.co/moeshawky/Nanbeige4.3-33B-GGUF
- Modelo base: https://huggingface.co/Nanbeige/Nanbeige4.3-33B
- llama.cpp (herramienta de conversión y cuantización empleada): https://github.com/ggml-org/llama.cpp
