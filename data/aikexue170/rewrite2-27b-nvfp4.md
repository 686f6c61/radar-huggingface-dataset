# aikexue170/rewrite2-27b-nvfp4

## Resumen

Rewrite2 27B · NVFP4 es la versión cuantizada a 4 bits (NVFP4 W4A4) de Rewrite2 27B, un modelo de lenguaje especializado en una única tarea: reescribir y expandir fragmentos de novela en chino. Lo publica el usuario `aikexue170` (北棱) en HuggingFace y deriva de un ajuste fino supervisado (SFT) sobre una base textual de la familia Qwen3.8-27B, con 50.293 pares de entrenamiento (25.647 de reescritura y 24.646 de expansión). No es un asistente conversacional: espera una sola instrucción fija de sistema pegada al texto y devuelve el fragmento reescrito.

El interés de esta variante concreta es de despliegue: usa cuantización nativa NVFP4 de NVIDIA ModelOpt (`group_size=16`, dos shards safetensors de 18,9 GB en total) para caber en tarjetas Blackwell de 24 GB, frente a los 53,8 GB del BF16 o los 29,5 GB del FP8 W8A8. Requiere una versión reciente de vLLM con soporte de `modelopt_fp4` y una GPU Blackwell para seleccionar el kernel nativo `FlashInferCutlassNvFp4LinearKernel`.

La contrapartida es una ventana útil pequeña (unos 1.000 tokens incluyendo el prompt, con `max_length=2048` en entrenamiento) y una tendencia conocida a la repetición en bucle que obliga a fijar `repetition_penalty=1.08` o superior, `max_tokens` duro y timeouts. El repositorio no incluye evaluación humana ni benchmarks.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso; base textual de la familia Qwen3.8-27B (sin más detalles publicados) |
| Parámetros totales | ~27 000 millones (27B) |
| Parámetros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 2048 tokens en entrenamiento; `--max-model-len 4096` en el ejemplo de servicio; ventana útil recomendada ~1000 tokens (prompt incluido) |
| Tipos de cuantización | NVFP4 W4A4 con `group_size=16` (este repositorio); también BF16, FP8 W8A8, GGUF IQ4_XS y GGUF Q3_K_M en repositorios hermanos |
| Idiomas soportados | chino (zh) exclusivamente; no se declara soporte de otros idiomas |
| Licencia | no disponible |
| Formato de pesos | safetensors (2 shards NVFP4 de ModelOpt) + `config.json`, `hf_quant_config.json`, `model.safetensors.index.json`; GGUF en las variantes alternativas |

## Arquitectura y entrenamiento

La arquitectura subyacente es un transformer decoder-only denso de aproximadamente 27.000 millones de parámetros, heredado de una base textual Qwen3.8-27B (el autor no publica detalles de capas, cabezas, atención ni tokenizador). Sobre esa base se aplicó un SFT específico de tarea: LoRA de rango 32 y alpha 64, una época, `max_length=2048`, y posterior fusión de los adaptadores para producir el modelo de 27B. El conjunto de datos V12 consta de 50.293 pares, prácticamente equilibrados entre reescritura (25.647) y expansión (24.646).

No se menciona RLHF, DPO ni ninguna etapa de alineación posterior al SFT, ni innovaciones de inferencia (decodificación especulativa, atención lineal, modos de razonamiento). El entrenamiento usa una sola plantilla de mensaje `user` que concatena una instrucción fija con el texto; las instrucciones canónicas se distribuyen en el repositorio como `INSTRUCTION_rewrite.txt` e `INSTRUCTION_expand.txt`, y en la variante de expansión incluyen un marcador `{tier_hint}` que debe sustituirse por el factor de multiplicación (1,5x, 1,6x, 1,8x…). La instrucción de reescritura prohíbe copiar más de 15 caracteres consecutivos del original, lo que da una idea del modo de fallo dominante del modelo.

La cuantización NVFP4 se generó con NVIDIA ModelOpt en formato W4A4 nativo, verificada por el autor con vLLM 0.28 sobre hardware Blackwell; la primera carga compila el kernel CUTLASS FP4 por JIT y tarda notablemente más que los arranques posteriores.

## Capacidades

- Reescritura de prosa narrativa en chino: reorganiza el lenguaje de un fragmento manteniendo trama, personajes y acontecimientos, con instrucción explícita de no copiar secuencias de más de 15 caracteres.
- Expansión de borradores recortados: reintroduce entorno, acción, psicología y gestos eliminados, con un factor de multiplicación indicado en el prompt (por ejemplo 1,5x, 1,6x, 1,8x).
- Estilización: la instrucción pide conservar el «estilo personal del autor», aunque no hay métricas que verifiquen la fidelidad estilística.
- Seguimiento estricto de plantilla: responde a una estructura fija de prompt + cuerpo de texto, sin system prompt adicional ni envoltorio de razonamiento.
- Generación en un solo turno: no está diseñado para diálogo multi-turno ni para mantener memoria conversacional.
- Capacidades **no** cubiertas de forma fiable: chat general, código, matemáticas, traducción, continuación libre de una historia, invención de tramas nuevas y coherencia argumental a lo largo de varios capítulos.
- No se declara soporte de tool calling, function calling, agentes, visión ni audio.

## Casos de uso

- Reescritura de capítulos de novela web en producción editorial: se envía cada escena (≤1000 tokens con la instrucción fija) al endpoint OpenAI-compatible de vLLM y se obtiene una versión con lenguaje más natural; el resultado se revisa a mano antes de publicar.
- Desborrado de manuscritos recortados: cuando un editor ha eliminado descripciones para ajustar extensión, se usa la plantilla de expansión con un `tier_hint` de 1,5x a 1,8x para recuperar densidad descriptiva sin alterar la trama.
- Homogeneización de estilo en series con varios autores: se reescriben los fragmentos irregulares para acercarlos a una voz común, procesando el texto por párrafos o escenas en lugar de capítulos completos.
- Preprocesado para plataformas de lectura: normalización de prosa torpe o con «sabor a IA» en catálogos de ficción china antes de la maquetación.
- Ampliación de resúmenes de trama en fichas de producto o sinopsis internas: partiendo de un resumen escueto, la plantilla de expansión genera texto descriptivo para marketing editorial, con revisión posterior obligatoria.
- Prototipado de herramientas de escritura asistida en local: al caber en 24 GB, permite montar un servicio de reescritura en una estación de trabajo Blackwell sin depender de APIs externas ni enviar manuscritos a terceros.
- Evaluación comparativa de precisión de cuantización: útil como banco de pruebas interno para medir cuánto degrada NVFP4 frente a BF16 y FP8 en una tarea generativa de prosa, con el mismo prompt y semilla.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor indica explícitamente que el repositorio no incluye una evaluación humana unificada y que la validación se limita a comprobar carga y generación reales con vLLM 0.28 (kernel `FlashInferCutlassNvFp4LinearKernel`). Tampoco hay datos de latencia ni de throughput. Los análisis de terceros sobre cuantización NVFP4 de bases Qwen de 27B que aparecen en la búsqueda no evalúan este ajuste fino y no son trasladables.

## Requisitos de hardware

- VRAM para esta variante: ~18,9 GB de pesos (17,6 GiB); con overhead de runtime y caché KV, el autor recomienda una tarjeta de clase 24 GB y `--gpu-memory-utilization 0.90`.
- GPU compatibles: exclusivamente Blackwell para el kernel nativo FP4 (RTX 5090 de 32 GB, RTX PRO 6000 Blackwell de 96 GB, B200/SM100-SM120). En arquitecturas anteriores no hay soporte declarado de `modelopt_fp4`.
- Variantes según VRAM: BF16 (53,8 GB) para clase 80 GB; FP8 W8A8 (29,5 GB) para clase 48 GB; GGUF IQ4_XS (15,2 GB) y Q3_K_M (13,3 GB) para clase 16 GB vía llama.cpp.
- Despliegue: vLLM reciente con soporte `modelopt_fp4` (verificado en 0.28) mediante `vllm serve --trust-remote-code --max-model-len 4096`; las variantes GGUF funcionan en llama.cpp/Ollama con `--repeat-penalty 1.08`. No hay instrucciones publicadas para TGI ni SGLang.
- Arranque: la primera ejecución compila el kernel CUTLASS FP4 por JIT y tarda bastante más que las siguientes; conviene precalentar el servicio antes de abrir tráfico.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No hay benchmarks públicos que permitan comparar este modelo con alternativas de la misma categoría. La comparación disponible es entre las precisiones del propio Rewrite2 27B:

| Variante | Pesos | Hardware objetivo | Ventaja | Disponibilidad |
|---|---:|---|---|---|
| BF16 | 53,8 GB | clase 80 GB | referencia de calidad | HuggingFace y ModelScope |
| FP8 W8A8 | 29,5 GB | clase 48 GB | equilibrio calidad/VRAM | HuggingFace y ModelScope |
| NVFP4 W4A4 (esta) | 18,9 GB | clase 24 GB Blackwell | mínima VRAM con kernel nativo | HuggingFace y ModelScope |
| IQ4_XS GGUF | 15,2 GB | clase 16 GB | prioriza calidad en 4 bits | HuggingFace y ModelScope |
| Q3_K_M GGUF | 13,3 GB | clase 16 GB | prioriza margen de VRAM | HuggingFace y ModelScope |

Todas comparten arquitectura, contexto, licencia (no disponible) y limitaciones de idioma. Frente a modelos de propósito general de tamaño similar, la comparación no está disponible: no existen métricas publicadas de este ajuste fino y su distribución de prompt es incompatible con evaluaciones estándar tipo MMLU o HumanEval.

## Limitaciones y advertencias

- Repetición y bucles: el autor documenta riesgo real de repetir frases o frases enteras hasta agotar `max_tokens`. La penalización por repetición (desde 1.08) reduce la probabilidad pero no la elimina; es obligatorio fijar un límite duro de salida y un timeout, y truncar y reintentar si aparece el bucle. Bajar la temperatura no resuelve el problema.
- Ventana útil estrecha: el mejor resultado se obtiene alrededor de 1.000 tokens incluyendo el prompt; por encima aumentan el copiado literal, la repetición, la digresión y los cierres inestables. Los capítulos largos deben trocearse por escena o párrafo y revisar la cohesión a mano.
- Copia del original: pese a la instrucción de no copiar más de 15 caracteres consecutivos, el modelo puede retener demasiado texto original; hay que muestrear los resultados en el corpus objetivo. La expansión tampoco garantiza alcanzar el factor solicitado.
- Coherencia global: no mantiene relaciones entre personajes ni continuidad argumental a lo largo de capítulos; esa responsabilidad recae en el pipeline de segmentación y en la corrección humana.
- Degradación por cuantización: el autor advierte que los formatos de baja precisión pueden amplificar la repetición y el copiado, y cita repeticiones evidentes en pruebas cortas con Q3_K_M; NVFP4 no garantiza evitarlo.
- Alcance: no es un asistente general. No hay garantías en问答 general, código, matemáticas ni otros dominios, y no se declara soporte multilingüe: solo chino.
- Licencia no disponible: no se puede confirmar el uso comercial ni las condiciones de redistribución. Además, la base declarada (Qwen3.8-27B) condiciona las obligaciones heredadas de esa familia, que no se detallan.
- Validación comunitaria nula: 0 descargas y 0 likes en el momento de la consulta; no hay reportes independientes de calidad.
- Discrepancia de tamaño: los metadatos de HuggingFace indican 10,0 GB de repositorio mientras la model card declara 18,9 GB de pesos; conviene verificar el contenido real y el `SHA256SUMS` antes de desplegar.
- Dependencia de hardware: el kernel FP4 nativo exige Blackwell y una versión concreta de vLLM; fuera de ese entorno el rendimiento y la compatibilidad no están documentados.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/aikexue170/rewrite2-27b-nvfp4
- Variante BF16: https://huggingface.co/aikexue170/rewrite2-27b-bf16
- Variante FP8 W8A8: https://huggingface.co/aikexue170/rewrite2-27b-fp8
- Variante GGUF IQ4_XS: https://huggingface.co/aikexue170/rewrite2-27b-iq4xs
- Variante GGUF Q3_K_M: https://huggingface.co/aikexue170/rewrite2-27b-q3km
- Espejo NVFP4 en ModelScope: https://modelscope.cn/models/alkaid55555/rewrite2-27b-nvfp4
- Espejo BF16 en ModelScope: https://modelscope.cn/models/alkaid55555/rewrite2-27b-bf16
- Espejo FP8 en ModelScope: https://modelscope.cn/models/alkaid55555/rewrite2-27b-fp8
- Espejo IQ4_XS en ModelScope: https://modelscope.cn/models/alkaid55555/rewrite2-27b-iq4xs
- Espejo Q3_K_M en ModelScope: https://modelscope.cn/models/alkaid55555/rewrite2-27b-q3km
- Perfil del autor en HuggingFace: https://huggingface.co/aikexue170
- Paper, blog o demo oficiales: no disponible
