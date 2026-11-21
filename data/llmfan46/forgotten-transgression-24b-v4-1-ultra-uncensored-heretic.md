# llmfan46/Forgotten-Transgression-24B-v4.1-ultra-uncensored-heretic

## Resumen

Forgotten-Transgression-24B-v4.1-ultra-uncensored-heretic es un ajuste fino (finetune) del modelo ReadyArt/Forgotten-Transgression-24B-v4.1, publicado por el usuario independiente llmfan46. Se trata de una versión "decensored" o "abliterated" del modelo base, generada con la herramienta Heretic v1.2.0 aplicando el método Arbitrary-Rank Ablation (ARA). El objetivo declarado es eliminar los mecanismos de rechazo del modelo original (refusals) manteniendo al máximo la calidad y el comportamiento general del modelo de partida.

El modelo cuenta con 23.572.403.200 parámetros (aproximadamente 23,6 mil millones) almacenados en formato safetensors, con un repositorio de 47,2 GB. Está etiquetado como modelo de la familia Mistral y orientado a roleplay, contenido explícito (NSFW/ERP) y uso "unaligned". La licencia declarada es Apache 2.0 y el único idioma indicado es el inglés.

Su relevancia actual es acotada y de nicho: interesa a quienes investigan técnicas de abliteration, edición de direcciones de activación en transformers y evaluación de la preservación de capacidades tras eliminar el alineamiento. El autor reporta una reducción de rechazos del 95 % (de 95/100 a 4/100) con una divergencia KL de 0,0353 respecto al original, y una conservación prácticamente idéntica en PIQA.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (familia Mistral, según tags; detalles no disponibles) |
| Parámetros totales | 23.572.403.200 |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (el repo publica safetensors; no se documentan GGUF ni otras) |
| Idiomas soportados | inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Modelo base | ReadyArt/Forgotten-Transgression-24B-v4.1 |
| Método de decensurado | Heretic v1.2.0 con Arbitrary-Rank Ablation (ARA) |
| Tamaño del repo | 47,2 GB |

## Arquitectura y entrenamiento

El modelo es un finetune del base Forgotten-Transgression-24B-v4.1, al que se le ha aplicado una ablación selectiva de direcciones en el espacio de activaciones mediante Heretic v1.2.0 y el método Arbitrary-Rank Ablation (ARA). Según la model card, la intervención se limita a las capas 16 a 33 (start_layer_index 16, end_layer_index 33) y al componente attn.o_proj (la proyección de salida de la atención). Los pesos de ablación reportados son: preserve_good_behavior_weight 0,8682, steer_bad_behavior_weight 0,0004, overcorrect_relative_weight 0,9615 y neighbor_count 7.

No se documentan en la información disponible los datos de entrenamiento del modelo base (número de tokens, composición del dataset, uso de RLHF/DPO), ni innovaciones como decodificación especulativa o atención lineal. La técnica destacable es precisamente la ablación por rangos arbitrarios, que busca eliminar la dirección de "rechazo" en las activaciones con una perturbación mínima, medida mediante divergencia KL frente al modelo original.

## Capacidades

- Generación de texto en inglés con estilos de roleplay y narrativa.
- Roleplay y conversación multi-turno orientada a personajes, incluido contenido explícito (ERP/NSFW) según los tags del autor.
- Comportamiento "uncensored": reducción drástica de rechazos, sermones y evasivas (4/100 frentes al 95/100 del original, según el autor).
- Razonamiento de sentido común físico preservado (PIQA acc_norm 0,8373, prácticamente igual al original).
- Conocimiento general y académico preservado en gran medida (MMLU acc 0,7896 en el original; el autor no reporta el valor del modelo hereticado en el fragmento disponible).
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: limitadas al inglés según la model card.
- Capacidades especiales (visión, audio, thinking mode): no disponibles.

## Casos de uso

- Roleplay conversacional sin restricciones: el modelo está afinado para mantener personajes y narrativa multi-turno sin rechazos ni advertencias morales, lo que lo hace adecuado para ficción interactiva y juegos de rol de texto para adultos.
- Investigación sobre abliteration: sirve como caso de estudio reproducible para medir el impacto de ARA sobre la tasa de rechazos y la divergencia KL, comparando con el modelo base.
- Evaluación de preservación de capacidades: útil para experimentos que cuantifiquen cuánto conocimiento general (MMLU) y sentido común (PIQA) se conserva tras eliminar el alineamiento.
- Generación de narrativa explícita para proyectos creativos privados: el modelo puede producir texto adulto de forma directa, sin las deflexiones típicas de modelos alineados.
- Benchmarking de herramientas de decensurado: permite comparar Heretic/ARA con otras técnicas (p. ej., abliteration clásica) sobre el mismo modelo base.
- Pruebas de robustez y seguridad en pipelines de moderación: al ser un modelo deliberadamente "unaligned", es útil como generador adversario para validar clasificadores de contenido y filtros de salida.

## Benchmarks y rendimiento

Datos reportados por el autor en la model card (modelo original frente a la versión hereticada):

| Benchmark | Métrica | Original | Heretic |
|---|---|---|---|
| PIQA (batch 128) | acc | 0,8237 ± 0,0089 | 0,8237 ± 0,0089 |
| PIQA (batch 128) | acc_norm | 0,8351 ± 0,0087 | 0,8373 ± 0,0086 |
| MMLU (batch 32) | acc | 0,7896 ± 0,0033 | no disponible en el fragmento |
| Refusals (100 prompts) | tasa de rechazo | 95/100 | 4/100 |
| Divergencia KL vs original | KL | 0 (por definición) | 0,0353 |

Subresultados MMLU del original disponibles en el fragmento: humanities 0,7239; formal_logic 0,5556; high_school_european_history 0,8545; high_school_us_history 0,9069; high_school_world_history 0,9072; international_law 0,9008; jurisprudence 0,8519. No se han publicado resultados de benchmarks adicionales (HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16/bf16: en torno a 47 GB solo para pesos, por lo que requiere GPUs de 80 GB (A100 80GB, H100 80GB) o múltiples GPUs.
- Cuantización a 8 bits: aproximadamente 24 GB de VRAM; encaja en una RTX 4090 (24 GB) con margen muy ajustado y contexto corto.
- Cuantización a 4 bits: aproximadamente 12-14 GB de VRAM; cabe en RTX 4090, RTX 3090, RTX 4080 y GPUs consumer de 16 GB o más.
- No se publican pesos GGUF en el repositorio; para llama.cpp u Ollama habría que convertir y cuantizar a partir de los safetensors.
- Opciones de despliegue: vLLM, TGI o transformers para fp16/bf16; llama.cpp/Ollama tras conversión a GGUF.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Enfoque | Disponibilidad |
|---|---|---|---|---|---|
| Forgotten-Transgression-24B-v4.1-ultra-uncensored-heretic | 23,6 B | no disponible | Apache 2.0 | Roleplay/NSFW decensurado (ARA) | Hugging Face, safetensors |
| ReadyArt/Forgotten-Transgression-24B-v4.1 | 23,6 B (presumible) | no disponible | no disponible | Roleplay alineado (base) | Hugging Face |
| Otros modelos abliterated de ~24B | variable | variable | variable | Eliminación de rechazos | Hugging Face |

No se dispone de datos de benchmarks comparativos con alternativas de terceros en la información proporcionada.

## Limitaciones y advertencias

- Modelo deliberadamente "unaligned": genera contenido explícito, NSFW y potencialmente dañino; no es apto para aplicaciones de producción orientadas al público general.
- Riesgo elevado de alucinación y de respuestas sin salvaguardas; la eliminación de rechazos también reduce las advertencias ante peticiones problemáticas.
- Idiomas: solo inglés declarado; el rendimiento en castellano no está garantizado.
- Contexto: no documentado; no se debe asumir una ventana larga.
- La licencia Apache 2.0 se declara en el repo, pero el modelo base y los datos de entrenamiento pueden tener restricciones adicionales no reflejadas; conviene revisar la licencia del modelo original antes de uso comercial.
- El autor indica que ha alcanzado el límite de almacenamiento gratuito de Hugging Face, lo que puede afectar a la disponibilidad futura de los pesos.
- La model card incluye la etiqueta "not-for-all-audiences" y "dangerous"; el uso debe restringirse a entornos controlados y con supervisión.
- Los benchmarks reportados son limitados (PIQA y MMLU parcial) y autoevaluados por el autor; no hay validación independiente.

## Enlaces

- Hugging Face: https://huggingface.co/llmfan46/Forgotten-Transgression-24B-v4.1-ultra-uncensored-heretic
- Modelo base: https://huggingface.co/ReadyArt/Forgotten-Transgression-24B-v4.1
- Heretic (repositorio): https://github.com/p-e-w/heretic
- Pull request de Arbitrary-Rank Ablation (ARA): https://github.com/p-e-w/heretic/pull/211
- Ko-fi del autor: https://ko-fi.com/llmfan46
- Patreon del autor: https://patreon.com/LLMfan46
