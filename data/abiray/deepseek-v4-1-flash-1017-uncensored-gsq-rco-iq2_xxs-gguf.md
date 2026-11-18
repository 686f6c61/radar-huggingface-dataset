# Abiray/DeepSeek-V4.1-Flash-1017-Uncensored-GSQ-RCO-IQ2_XXS-GGUF

## Resumen

DeepSeek-V4.1-Flash-1017-Uncensored-GSQ-RCO-IQ2_XXS-GGUF es una compilación GGUF cuantizada y "abliterated" (sin censura) del modelo ISTA-DASLab/DeepSeek-V4.1-Flash-1017-GSQ-RCO-GGUF, publicada por el usuario Abiray en Hugging Face. Se trata de un modelo de lenguaje de gran escala (196.613.849.600 parámetros según los safetensors del modelo base) distribuido en formato GGUF con cuantización mixta IQ2_XXS, IQ1_M e IQ4_NL, pensado para ejecutarse con llama.cpp (build b11870 o superior) y con el runtime Strata.

La particularidad de esta versión es que incorpora directamente en los pesos cuantizados las modificaciones de "abliteration" (eliminación del comportamiento de rechazo), sin necesidad de cargar adaptadores LoRA en tiempo de ejecución. El autor documenta que los 86 tensores residuales modificados se han horneado en los pesos, mientras que las 28 capas de expertos enrutados con cuantización de 1 bit IQ1_M y la tabla de búsqueda Engram de 110,6 GB permanecen intactas byte a byte respecto al modelo original.

El modelo es relevante porque permite desplegar una variante sin censura de un modelo de ~196.000 millones de parámetros en hardware relativamente modesto gracias a la cuantización extrema (2 bits aproximados), manteniendo según el autor una correlación de perplejidad del 99,84 % respecto al original. La licencia es MIT y el pipeline declarado es text-generation, con soporte de visión mediante el proyector mmproj incluido.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos (MoE) y capas Engram; arquitectura DeepSeek-V4.1 (familia deepseek41) |
| Parametros totales | 196.613.849.600 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | IQ2_XXS (cuerpo principal), IQ1_M (28 capas de expertos enrutados), IQ4_NL (tabla Engram), Q6_K (tensores abliterated), BF16 (proyector de visión mmproj) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | GGUF (6 shards: 5 de backbone + 1 de Engram), safetensors para el modelo base |

## Arquitectura y entrenamiento

El modelo base es un transformer con mezcla de expertos (MoE) de la familia DeepSeek-V4.1, con 40 capas de backbone identificadas en la documentación (blk.0 a blk.39). La arquitectura incluye componentes específicos: tensores attn_output_b, ffn_down_shexp (expertos compartidos) y ffn_down_exps (expertos enrutados), además de una tabla de búsqueda Engram de 110,6 GB en cuantización IQ4_NL que actúa como shard 6. El modelo incorpora metadatos deepseek41.attention.kv_source_layers y una plantilla de chat Jinja embebida. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO.

La modificación principal de esta compilación es el "abliteration": se han modificado 86 tensores de escritura residual (80 densos más 6 capas de expertos exactas de 2 bits) para eliminar el comportamiento de rechazo, horneándolos directamente en los pesos cuantizados en lugar de aplicar un LoRA en tiempo de ejecución. Los 28 tensores de expertos enrutados en IQ1_M y la tabla Engram permanecen sin tocar byte a byte. El autor documenta una auditoría con llama-perplexity --kl-divergence (build b12017) sobre las 40 capas y los 129.280 logits del vocabulario: correlación de perplejidad logarítmica del 99,84 %, acuerdo Top-1 del 98,425 % ± 1,109 %, KL-divergencia mediana de 0,000421 nats y similitud coseno media del subespacio no-refusal de 0,999609.

## Capacidades

- Generación de texto y conversación multi-turno (pipeline text-generation, conversational).
- Razonamiento explícito: soporta modo reasoning con control de esfuerzo mediante los parámetros --reasoning on y --reasoning-effort.
- Capacidades de visión: incluye proyector mmproj-DeepSeek-V4.1-Flash-1017-BF16.gguf para entrada de imágenes en llama-server.
- Comportamiento sin censura ("uncensored"/"abliterated"): se han eliminado los mecanismos de rechazo en los tensores residuales.
- Ejecución nativa en llama.cpp (llama-cli y llama-server) y en el runtime Strata.
- Soporte de plantilla de chat Jinja embebida (--jinja).
- Soporte de tool calling y function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.

## Casos de uso

- Investigación sobre alineación y censura: el modelo permite estudiar el efecto del abliteration sobre el comportamiento de rechazo con una métrica cuantificada (KL-divergencia mediana de 0,000421 nats, similitud coseno de 0,999609), útil para trabajos académicos sobre seguridad en LLM.
- Despliegue en hardware de gama media: la cuantización IQ2_XXS permite ejecutar un modelo de ~196.000 millones de parámetros en configuraciones con GPU de 12 GB o más mediante Strata, algo inviable con pesos en BF16.
- Generación de texto sin restricciones temáticas: para aplicaciones creativas o de investigación que requieran respuestas sin filtros de rechazo, como generación de ficción o análisis de contenido sensible.
- Procesamiento de imágenes con visión: el proyector mmproj BF16 permite servir el modelo con entrada multimodal vía llama-server en el puerto 8080.
- Inferencia local con llama.cpp: integración en pipelines existentes de llama-cli o llama-server para tareas de generación de texto y razonamiento con control de esfuerzo.
- Evaluación comparativa de cuantizaciones extremas: el repositorio documenta métricas de perplejidad y KL-divergencia que permiten auditar la degradación de cuantizaciones de 1-2 bits frente al modelo original.
- Experimentación con arquitecturas MoE y Engram: la separación en 6 shards (5 de backbone más 1 de Engram) facilita el estudio de los componentes de memoria externa del modelo.

## Benchmarks y rendimiento

El autor publica una auditoría de fidelidad de la cuantización frente al modelo base, no benchmarks de tareas estándar (MMLU, HumanEval, GSM8K):

| Metrica | Resultado |
|---|---|
| Tensores verificados | 1.043 / 1.043 |
| Tensores residuales abliterated | 86 (80 densos + 6 expertos de 2 bits) |
| Capas IQ1_M GSQ preservadas | 28 / 28 (100 %) |
| Correlación log-perplejidad | 99,84 % |
| Acuerdo Top-1 de vocabulario (129.280) | 98,425 % ± 1,109 % |
| KL-divergencia mediana | 0,000421 nats |
| KL-divergencia media | 0,009546 ± 0,001921 nats |
| Desplazamiento mediano de probabilidad | -0,003 % |
| Similitud coseno del subespacio no-refusal | 0,999609 |
| Perplejidad cuantizada | 2,4857 ± 0,5017 |
| Perplejidad base | 2,3538 ± 0,4522 |

No se han publicado resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio ocupa 250,1 GB en total; el backbone cuantizado pesa 138,58 GB y la tabla Engram 110,6 GB. Con Strata se indica un requisito mínimo de 1 GPU NVIDIA de 12 GB o más.
- GPU recomendadas: no disponible de forma explícita; Strata menciona 1x 12 GB+ NVIDIA GPU como mínimo. Para llama.cpp con -ngl 99 se requiere descargar todas las capas a GPU, lo que implica VRAM agregada muy superior.
- ¿Cabe en consumer GPU? Sí, según el autor, mediante Strata con una GPU de 12 GB o más; en llama.cpp dependerá de la distribución de shards y del offloading.
- Opciones de despliegue: llama.cpp (llama-cli, llama-server, build b11870 o superior / v0.8.0+), Strata (versión 0.2.8, build 0.1.54, con --family deepseek41 --model ist-das-2.00bpw), y conexión de Strata a llama-server como cliente.
- Latencia y throughput: no disponible.
- Nota de despliegue: es necesario enlazar simbólicamente (Linux/macOS) o con hardlink (Windows) el archivo DeepSeek-V4.1-Flash-Engram-IQ4_NL.gguf como shard 6 (00006-of-00006.gguf). Strata 0.1.54 puede fallar en su comprobación de tamaño de archivo (138,58 GB frente a 138,24 GB del stock) y reportar "this is not a model size Strata knows".

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Notas |
|---|---|---|---|---|---|
| Abiray/DeepSeek-V4.1-Flash-1017-Uncensored-GSQ-RCO-IQ2_XXS-GGUF | 196.613.849.600 | no disponible | IQ2_XXS / IQ1_M / IQ4_NL / Q6_K | MIT | Abliterated, sin LoRA en runtime |
| ISTA-DASLab/DeepSeek-V4.1-Flash-1017-GSQ-RCO-GGUF | no disponible | no disponible | IQ2_XXS (stock) | no disponible | Modelo base, con censura |
| DeepSeek-V4.1-Flash (original) | no disponible | no disponible | BF16 (presumible) | no disponible | Modelo sin cuantizar |

No se dispone de datos de benchmarks de tareas para comparar el rendimiento frente a alternativas de la misma categoría.

## Limitaciones y advertencias

- La modificación "abliterated" elimina los mecanismos de rechazo, lo que puede producir contenido inapropiado, ofensivo o dañino sin filtro; no es apto para aplicaciones de cara al público sin moderación adicional.
- La cuantización extrema (IQ2_XXS en el cuerpo, IQ1_M en 28 capas de expertos) implica una degradación de calidad respecto al modelo en BF16, aunque el autor documenta una correlación de perplejidad del 99,84 %.
- El proceso de abliteration puede degradar capacidades de razonamiento o seguridad; la auditoría del autor mide fidelidad frente al modelo base, no calidad absoluta en tareas.
- Riesgo de alucinación: no cuantificado en la información disponible.
- Idiomas soportados: no disponibles; no se puede garantizar un rendimiento multilingüe adecuado.
- Longitud de contexto: no disponible.
- Restricciones de licencia: licencia MIT, que permite uso comercial, pero el modelo base ISTA-DASLab no declara licencia en la información proporcionada; conviene verificar los términos del modelo original.
- El despliegue requiere pasos manuales (enlace del shard 6) y versiones concretas de llama.cpp (b11870+) o Strata (0.2.8), con posibles fallos de compatibilidad en Strata 0.1.54.
- El repositorio es de 250,1 GB, lo que exige espacio de almacenamiento considerable y descarga completa antes de la inferencia.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Abiray/DeepSeek-V4.1-Flash-1017-Uncensored-GSQ-RCO-IQ2_XXS-GGUF
- Modelo base: https://huggingface.co/ISTA-DASLab/DeepSeek-V4.1-Flash-1017-GSQ-RCO-GGUF
- llama.cpp: no disponible en la información proporcionada
- Strata: no disponible en la información proporcionada
- Paper o blog del modelo: no disponible en la información proporcionada
