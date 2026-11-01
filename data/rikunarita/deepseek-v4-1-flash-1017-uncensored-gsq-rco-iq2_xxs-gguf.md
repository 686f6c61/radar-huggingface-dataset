# Rikunarita/DeepSeek-V4.1-Flash-1017-Uncensored-GSQ-RCO-IQ2_XXS-GGUF

## Resumen

DeepSeek-V4.1-Flash-1017-Uncensored-GSQ-RCO-IQ2_XXS-GGUF es una cuantización GGUF de tipo "abliterated" (sin censura) del modelo ISTA-DASLab/DeepSeek-V4.1-Flash-1017-GSQ-RCO, publicada por el usuario Rikunarita. El modelo base es una variante de DeepSeek-V4.1 Flash con un esquema de cuantización mixta propietario denominado GSQ-RCO, que combina capas de expertos enrutados a 1 bit (IQ1_M) con una tabla de búsqueda Engram en IQ4_NL. Esta build concreta aplica la técnica de abliteration directamente sobre los pesos cuantizados, eliminando la necesidad de cargar adaptadores LoRA en tiempo de inferencia.

El modelo tiene 196.613.849.600 parámetros totales (aproximadamente 196,6 mil millones) según los datos de safetensors, y se distribuye en un repositorio de 250,1 GB dividido en seis shards: cinco de backbone y uno correspondiente a la tabla Engram. La cuantización IQ2_XXS reduce el peso del backbone a 138,58 GB, mientras que la tabla Engram en IQ4_NL ocupa 110,6 GB adicionales. El resultado es un modelo de gran tamaño que requiere hardware de gama muy alta para su ejecución.

La relevancia de esta ficha radica en que documenta un caso de cuantización extrema (1-2 bits por peso en la mayoría de capas) combinada con modificación de comportamiento (abliteration) y un formato de sharding específico para llama.cpp y Strata. Es un ejemplo técnico de cómo se preserva la inteligencia del modelo base (medida mediante KL-divergence) mientras se eliminan los mecanismos de rechazo, aunque con limitaciones importantes de licencia, reproducibilidad y soporte.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos (MoE) y tabla Engram; detalles completos no disponibles |
| Parametros totales | 196.613.849.600 (196,6 B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | IQ2_XXS (backbone), IQ1_M (28 capas de expertos enrutados), IQ4_NL (tabla Engram), Q6_K (86 tensores de escritura residual abliterados) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | GGUF (6 shards: 00001-of-00006 a 00006-of-00006, más mmproj BF16 para visión) |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo base más allá de las referencias a capas de expertos enrutados (routed-expert layers), una tabla Engram y tensores de atención con escritura residual. El esquema GSQ-RCO del modelo base ISTA-DASLab combina cuantización de 1 bit (IQ1_M) en 28 capas de expertos con una tabla de búsqueda Engram en IQ4_NL de 110,6 GB, lo que sugiere una arquitectura MoE con una componente de memoria externa tipo lookup. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO.

La innovación técnica principal de esta build es la abliteration "weight-baked": los 86 tensores de escritura residual (80 densos y 6 de expertos exactos de 2 bits) se modifican directamente en los pesos cuantizados, con las capas `attn_output_b.weight` y `ffn_down_shexp.weight` promovidas a Q6_K para preservar precisión. Según la model card, esto añade solo 0,34 GB (+0,25%) sobre el modelo original y mantiene intactas las 28 capas IQ1_M de expertos. La verificación con `llama-perplexity --kl-divergence` reporta una correlación log-perplejidad del 99,84% y una KL-divergencia mediana de 0,000421 nats respecto al base, lo que indica que la modificación de comportamiento no degrada sustancialmente la distribución de salida.

## Capacidades

- Generación de texto conversacional y de razonamiento, con soporte de modo de razonamiento (`--reasoning on`, `--reasoning-effort` configurable).
- Capacidades de visión mediante el proyector `mmproj-DeepSeek-V4.1-Flash-1017-BF16.gguf` (soporte multimodal en llama-server).
- Comportamiento "uncensored" o abliterated: se han eliminado los mecanismos de rechazo en los tensores de escritura residual, lo que reduce las negativas a responder.
- Plantilla de chat Jinja embebida en el GGUF.
- Compatibilidad con llama.cpp (b11870+ / v0.8.0+) y con el runtime Strata (`strata-dsv41`).
- Soporte de metadatos `deepseek41.attention.kv_source_layers` para el layout de atención específico.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Tool calling / function calling: no disponible en la información proporcionada.

## Casos de uso

- Investigación sobre abliteration y cuantización extrema: el modelo sirve como caso de estudio reproducible para medir el impacto de modificar tensores residuales sobre la distribución de salida, usando las métricas KL-divergence y top-1 agreement documentadas.
- Despliegue en llama.cpp para generación de texto sin censura: útil en entornos de investigación donde se necesita estudiar el comportamiento del modelo sin los sesgos de rechazo, con `llama-server` y plantilla Jinja.
- Análisis multimodal con visión: el proyector BF16 permite procesar imágenes junto con texto en `llama-server`, adecuado para tareas de descripción o extracción de información visual.
- Evaluación comparativa de cuantizaciones: al preservar las 28 capas IQ1_M intactas, permite comparar el rendimiento de la cuantización GSQ-RCO frente a otras build del mismo modelo base.
- Experimentación con modos de razonamiento: el flag `--reasoning-effort` permite ajustar la profundidad de razonamiento para tareas de matemáticas o lógica, aunque no se han publicado benchmarks específicos.
- Reproducción de pipelines de sharding: el layout de 6 shards con symlink para la tabla Engram es un ejemplo práctico para ingenieros que trabajan con modelos de más de 100 GB en llama.cpp.
- Fine-tuning o adaptación posterior: aunque no es el propósito principal, el formato GGUF y la licencia MIT permiten experimentar con adaptadores sobre la build cuantizada.

## Benchmarks y rendimiento

La model card proporciona métricas de verificación de la abliteration, no benchmarks de tareas:

| Metrica | Resultado |
|---|---|
| Tensores verificados | 1.043 / 1.043 |
| Tensores residuales abliterados | 86 (80 densos + 6 expertos de 2 bits) |
| Capas IQ1_M GSQ preservadas | 28 / 28 (100%) |
| Correlación log-perplejidad | 99,84% |
| Acuerdo top-1 (129.280 vocab) | 98,425% ± 1,109% |
| KL-divergencia mediana | 0,000421 nats |
| KL-divergencia media | 0,009546 ± 0,001921 nats |
| Cambio mediano de probabilidad | -0,003% |
| Similitud coseno subespacio no-rechazo | 0,999609 |
| PPL(Q) | 2,4857 ± 0,5017 |
| PPL(base) | 2,3538 ± 0,4522 |

No se han publicado resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada: el backbone cuantizado ocupa 138,58 GB y la tabla Engram 110,6 GB, totalizando aproximadamente 249 GB de pesos. La inferencia requiere al menos esa cantidad de memoria, más overhead de contexto y KV cache.
- GPU recomendadas: no es viable en GPUs consumer. Se necesitan configuraciones multi-GPU de gama profesional, como múltiples A100 80GB, H100 80GB o H200, o bien el uso de memoria unificada en sistemas Apple Silicon de gama muy alta (con limitaciones de rendimiento).
- Cabe en consumer GPU: no. Ni siquiera en una RTX 4090 (24 GB) o en configuraciones multi-GPU de 4x RTX 4090 (96 GB) se alcanza el tamaño total.
- Opciones de despliegue: llama.cpp (b11870+ / v0.8.0+), llama-cli, llama-server, Strata (`strata-dsv41`). No se menciona soporte para vLLM, TGI u Ollama en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| DeepSeek-V4.1-Flash-1017-Uncensored-GSQ-RCO-IQ2_XXS | 196,6 B | no disponible | MIT | GGUF | Abliterated, cuantización mixta IQ2_XXS/IQ1_M/IQ4_NL |
| ISTA-DASLab/DeepSeek-V4.1-Flash-1017-GSQ-RCO-GGUF (base) | 196,6 B | no disponible | no disponible | GGUF | Modelo base sin abliteration |
| Otras build abliterated de DeepSeek-V4.1 Flash | no disponible | no disponible | no disponible | GGUF | No se dispone de datos concretos |

No se dispone de información suficiente para comparar con alternativas de la misma categoría en cuanto a rendimiento o benchmarks.

## Limitaciones y advertencias

- La abliteration elimina los mecanismos de rechazo, lo que puede producir contenido inapropiado, ofensivo o dañino sin filtro. No es adecuado para aplicaciones de producción orientadas al usuario final sin moderación adicional.
- El modelo base y esta build no documentan sesgos conocidos ni evaluaciones de seguridad; la ausencia de rechazo agrava el riesgo de generar contenido sesgado o alucinado sin advertencia.
- Riesgo de alucinación: inherente a los modelos de lenguaje; no se han publicado evaluaciones específicas de factualidad para esta build.
- La cuantización IQ2_XXS e IQ1_M es extremadamente agresiva (1-2 bits por peso en muchas capas), lo que puede degradar capacidades de razonamiento fino, matemáticas o código frente al modelo en BF16, aunque la KL-divergence reportada sea baja.
- El proceso de instalación requiere crear un symlink o hardlink manual para el shard 6 (tabla Engram); sin este paso, llama.cpp o Unsloth Studio no reconocen el modelo. Es un punto de fricción para despliegues automatizados.
- La licencia MIT se hereda del modelo base, pero la model card no aclara si el modelo base ISTA-DASLab tiene restricciones adicionales de uso comercial. Verificar antes de uso en producción.
- Idiomas soportados no documentados; el rendimiento multilingüe es incierto.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica que no ha sido validado por la comunidad.
- El autor de la build (Rikunarita) no es el desarrollador original del modelo; la calidad de la abliteration depende de la verificación reportada, no de una auditoría independiente.

## Enlaces

- HuggingFace: https://huggingface.co/Rikunarita/DeepSeek-V4.1-Flash-1017-Uncensored-GSQ-RCO-IQ2_XXS-GGUF
- Modelo base: https://huggingface.co/ISTA-DASLab/DeepSeek-V4.1-Flash-1017-GSQ-RCO-GGUF
- Repositorio llama.cpp: no disponible en la información proporcionada
- Paper o blog del modelo base: no disponible en la información proporcionada
- Runtime Strata: no disponible en la información proporcionada
