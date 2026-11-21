# janghaneul/Qwen3.8-Flash-Next-AD-gateup-GGUF

## Resumen
Qwen3.8-Flash-Next-AD-gateup-GGUF es una cuantización GGUF de tipo MoE derivada de Qwen/Qwen3.8-Flash-Next, publicada por el usuario janghaneul bajo la receta AtomicChat AD-5.00bpw-Q5_K_M. El modelo base es un transformer disperso (MoE) de aproximadamente 176.900 millones de parámetros totales, orientado a generación de texto conversacional e inferencia local en llama.cpp. La contribución principal de esta ficha no es el modelo original, sino dos builds GGUF construidos a partir de mediciones empíricas sobre MultiPL-E humaneval-cpp, con una asignación de bits deliberadamente asimétrica: solo los expertos gate/up reciben tratamiento diferenciado, mientras attention, GDN ssm_out, expertos compartidos, embeddings y la tabla n-gram PLE permanecen en Q8_0.

La relevancia de esta variante radica en la gestión de memoria: la tabla n-gram PLE (50,66 GiB) puede ser streameada desde disco, de modo que el modelo residente en RAM baja a 68,37 GiB (build Q4_K) o 59,11 GiB (build IQ2_S-IQ3_S-Q4_K). Eso lo convierte en una opción práctica para estaciones de trabajo con 64-128 GB de RAM que quieran ejecutar un MoE de ~177.000 millones de parámetros sin depender de GPUs de datacenter. La licencia es qwen-community-1.0, lo que impone condiciones específicas para uso comercial.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer MoE con atención híbrida y GDN (gated delta network), tabla n-gram PLE por capa |
| Parámetros totales | 176.943.899.520 (~176,9 mil millones) |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | GGUF: Q4_K (build Q4_K); IQ2_S / IQ3_S / Q4_K mixto (build IQ2_S-IQ3_S-Q4_K); Q8_0 en tensores no enrutados; IQ4_NL en ffn_down_exps; BF16 en hc_*; F32/F16 en router/norm/indexer |
| Idiomas soportados | no disponible |
| Licencia | qwen-community-1.0 (license: other) |
| Formato de pesos | GGUF, dividido en 3 shards por build |

## Arquitectura y entrenamiento
El modelo base es un transformer MoE con expertos enrutados y componentes no enrutados (atención, GDN `ssm_out`, expertos compartidos, embeddings y una tabla n-gram PLE por capa, `per_layer_token_embd`). La cuantización documentada no describe el entrenamiento del modelo original: no se indica número de tokens, composición del dataset ni si hubo RLHF/DPO, por lo que esos datos deben considerarse no disponibles. Lo que sí está documentado es la estrategia de cuantización: los builds parten de la receta AD-5.00bpw-Q5_K_M y modifican únicamente los tensores gate/up de los expertos enrutados, manteniendo todo lo demás en Q8_0 (con `ffn_down_exps` en IQ4_NL y `hc_*` en BF16 desde la revisión del 2026-11-12).

La innovación técnica destacable está en la asignación de bits guiada por mediciones: el build IQ2_S-IQ3_S-Q4_K coloca Q4_K solo en las cuatro capas de mayor tolerancia (40, 44, 45, 47), baja las cuatro de menor tolerancia (32, 34, 36, 39) a IQ2_S y rellena el resto con IQ3_S. Esa colocación se apoya en la coincidencia de tres asignaciones independientes (AtomicChat AD, ISTA GSQ, agention Gyro) sobre los extremos. Además, el diseño explota el hecho de que la tabla n-gram PLE es una tabla de acceso aleatorio `GET_ROWS` sin estadísticas de imatrix, por lo que cuantizarla por debajo de ~5 bpw degrada mediblemente el comportamiento de recuperación; mantenerla en Q8_0 cuesta 50,66 GiB de disco, no de RAM, cuando el motor la streamea.

## Capacidades
- Generación de texto conversacional multi-turno (pipeline text-generation, tags `conversational` y `atomic-chat`).
- Razonamiento y generación de código: los builds fueron evaluados con MultiPL-E humaneval-cpp, lo que confirma soporte funcional para código C++ y, por extensión, para tareas de programación.
- Arquitectura MoE con expertos enrutados y expertos compartidos, lo que permite activar solo una fracción de los parámetros por token.
- Componente GDN (`ssm_out`) integrado en la arquitectura, lo que sugiere capacidad de modelado secuencial más allá de la atención clásica.
- Tabla n-gram PLE por capa, orientada a recuperación de patrones léxicos y comportamiento tipo retrieval.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y multi-step reasoning: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible; el model card está redactado en inglés y coreano, pero no declara idiomas soportados.
- Capacidades especiales (thinking mode, vision, audio): no disponible en la información proporcionada.

## Casos de uso
- Inferencia local de un MoE de gran escala: con el build IQ2_S-IQ3_S-Q4_K residente en 59,11 GiB, el modelo cabe en estaciones de trabajo de 64 GB de RAM usando llama.cpp o Strata, streameando la tabla PLE desde disco. Es adecuado porque el diseño separa explícitamente lo que debe residir en RAM de lo que puede leerse bajo demanda.
- Generación de código en pipelines internos: los builds están calibrados con MultiPL-E humaneval-cpp (161 problemas × 5 ejecuciones × 6 variantes), por lo que su asignación de bits está optimizada para código ejecutable. Se integraría como servicio local de completado o revisión de C++.
- Asistencia conversacional autoalojada: el tag `atomic-chat` y el pipeline text-generation apuntan a chat multi-turno; el modelo puede desplegarse en un servidor interno sin exponer datos a APIs externas.
- Sustituto de bajo coste de un modelo grande en prototipado: para equipos que necesitan evaluar comportamiento de un MoE de ~177.000 millones de parámetros antes de comprometer hardware de datacenter, estos GGUF permiten pruebas realistas en hardware de consumo o workstation.
- Investigación en cuantización: el model card documenta composición byte-verificada, bpw medidos y ablaciones (gate/up Q4_K vs IQ2_S/IQ3_S, `hc_*` Q8_0 vs BF16), lo que lo convierte en material útil para estudiar el impacto de la asignación de bits en MoE.
- Despliegue en entornos con disco abundante y RAM limitada: la tabla PLE de 50,66 GiB puede mantenerse en NVMe y streamearse, lo que permite servir el modelo con menos RAM de la que exigiría cargarlo completo.
- Evaluación comparativa de recetas de cuantización: los shards y hashes documentados (por ejemplo, sha256 `290aab43…95f901` para el shard 3) permiten reproducir experimentos y comparar contra AD-5.00bpw-Q5_K_M original.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks numéricos en la información disponible. El model card menciona únicamente que la asignación de gate/up fue evaluada con MultiPL-E humaneval-cpp (6 variantes de cuantización × 161 problemas × 5 ejecuciones) y que esa asignación "eliminó todos los errores restantes" en benchmarks internos de tareas, pero no se proporcionan puntuaciones concretas.

## Requisitos de hardware
- VRAM/RAM estimada: build Q4_K con 68,37 GiB residentes (119,05 GiB totales en disco, 5,7788 bpw); build IQ2_S-IQ3_S-Q4_K con 59,11 GiB residentes (109,78 GiB totales, 5,3292 bpw, 4,0381 bpw excluyendo PLE).
- La tabla n-gram PLE (50,66 GiB) puede streamearse desde disco, por lo que el requisito real de RAM es el residente, no el total.
- GPU recomendadas: no disponible en la información proporcionada. Los builds están pensados para inferencia local en Strata / llama.cpp, lo que sugiere CPU+RAM como escenario principal; no se documentan requisitos de VRAM para GPU.
- Cabe en consumer GPU: no disponible; con 59-68 GiB residentes, ningún acelerador de consumo (RTX 4090 con 24 GB) puede albergarlo completo, pero la información no confirma particionado GPU/CPU.
- Opciones de despliegue: llama.cpp y Strata (mencionados explícitamente); Ollama, vLLM y TGI no están confirmados en la documentación.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros totales | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-Flash-Next-AD-gateup-GGUF (este) | ~176,9 mil millones | no disponible | GGUF Q4_K / IQ2_S-IQ3_S-Q4_K | qwen-community-1.0 | Hugging Face, 785 descargas |
| Qwen/Qwen3.8-Flash-Next (base) | ~176,9 mil millones | no disponible | safetensors (original) | qwen-community-1.0 | Hugging Face |
| AtomicChat AD-5.00bpw-Q5_K_M | ~176,9 mil millones | no disponible | GGUF Q5_K_M | qwen-community-1.0 | no disponible |
| ISTA GSQ / agention Gyro | no disponible | no disponible | asignaciones propias | no disponible | no disponible |

## Limitaciones y advertencias
- No se documentan sesgos conocidos; al ser una cuantización del modelo base, hereda los sesgos de Qwen3.8-Flash-Next, que no están descritos en la información disponible.
- Riesgo de alucinación: no evaluado en la documentación; las cuantizaciones agresivas en gate/up (IQ2_S en capas 32, 34, 36, 39) pueden degradar la fidelidad en tareas sensibles.
- La tabla n-gram PLE cuantizada por debajo de ~5 bpw degrada mediblemente el comportamiento de recuperación; por eso se mantiene en Q8_0, pero eso infla el tamaño en disco a 109-119 GiB.
- `ffn_down_exps` está fijado en IQ4_NL porque `moe_intermediate_size=640` no es divisible por 256 y los tipos de bloque 256 caen silenciosamente; no es posible mejorar esa parte sin cambiar el tipo de bloque.
- El build IQ2_S-IQ3_S-Q4_K sacrifica 12 capas frente al anterior IQ3_S-Q4_K (−2,36 GiB); es una decisión de compromiso calidad/memoria, no una mejora universal.
- Restricciones de licencia: qwen-community-1.0 (license: other) impone condiciones específicas para uso comercial; deben revisarse en el enlace de licencia antes de desplegar en producción.
- Idiomas soportados no declarados: no hay garantía documentada de rendimiento multilingüe.
- El model card está parcialmente en coreano y usa terminología interna (AD, hc_*, bpw); requiere familiaridad con la receta para interpretar los números.
- La revisión del 2026-11-12 cambió `hc_*` de Q8_0 a BF16 en `AD-404bpw-q4_k_m`, invalidando descargas previas de shard1 y shard2; hay que verificar hashes antes de usar.

## Enlaces
- Hugging Face: https://huggingface.co/janghaneul/Qwen3.8-Flash-Next-AD-gateup-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Licencia: https://huggingface.co/Qwen/Qwen3.8-Flash-Next/blob/main/LICENSE
- llama.cpp: no disponible en la información proporcionada
- Strata: no disponible en la información proporcionada
- Papers, blogs, repos y demos: no disponible en la información proporcionada
