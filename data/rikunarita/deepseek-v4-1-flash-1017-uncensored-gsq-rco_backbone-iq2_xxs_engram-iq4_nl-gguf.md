# Rikunarita/DeepSeek-V4.1-Flash-1017-Uncensored-GSQ-RCO_Backbone-IQ2_XXS_Engram-IQ4_NL-GGUF

## Resumen

DeepSeek-V4.1-Flash-1017-Uncensored-GSQ-RCO_Backbone-IQ2_XXS_Engram-IQ4_NL-GGUF es una cuantización GGUF de la build abliterated (sin censura) del modelo DeepSeek-V4.1-Flash-1017-GSQ-RCO de ISTA-DASLab, publicada por el usuario Rikunarita. Se trata de un modelo de lenguaje de gran escala (748.494.643.824 parámetros totales, según los datos de safetensors) distribuido en formato GGUF en seis shards, con un backbone cuantizado en IQ2_XXS y una tabla Engram de búsqueda cuantizada en IQ4_NL. El repositorio ocupa 250,1 GB.

La particularidad de esta versión es que integra directamente en los pesos cuantizados los 86 tensores residuales de abliteración (las modificaciones que eliminan el comportamiento de rechazo), de modo que no requiere aplicar un adaptador LoRA en tiempo de ejecución. Además, corrige el problema del shard 6 ausente de la release original de Abiray, renombrando la tabla Engram como shard 6 real del layout de seis piezas, lo que permite cargar el modelo directamente en llama.cpp (b11870+) y en Strata sin crear enlaces simbólicos manuales.

El modelo está pensado para ejecución local de un LLM de gran tamaño en hardware de gama alta mediante llama.cpp, con soporte de visión a través del proyector multimodal mmproj en BF16 y plantilla de chat Jinja embebida. La licencia declarada es MIT.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos (MoE) y tabla Engram de búsqueda; capas de expertos enrutados GSQ de 1 bit (IQ1_M) |
| Parámetros totales | 748.494.643.824 |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | IQ2_XXS (backbone), IQ4_NL (tabla Engram), Q6_K (tensores de abliteración attn_output_b), IQ1_M (expertos enrutados GSQ) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | GGUF (6 shards: 00001-of-00006 a 00006-of-00006) + mmproj BF16 |

## Arquitectura y entrenamiento

La información disponible describe un modelo con arquitectura de mezcla de expertos (MoE) en la que 28 capas de expertos enrutados están cuantizadas a 1 bit mediante IQ1_M con calibración GSQ (preservando según el autor el 100% de la calibración AIME25/GPQA-D de ISTA-DASLab), y una tabla Engram de búsqueda de 110,6 GB cuantizada en IQ4_NL que actúa como memoria de consulta. El backbone se distribuye en cinco shards y la tabla Engram constituye el sexto. El modelo incluye metadatos `deepseek41.attention.kv_source_layers` y una plantilla de chat Jinja embebida, y dispone de soporte de visión mediante un proyector multimodal separado (`mmproj-DeepSeek-V4.1-Flash-1017-BF16.gguf`).

El proceso de abliteración se ha aplicado sobre 86 tensores residuales (80 densos y 6 capas de expertos de 2 bits exactos), con los tensores `blk.0..39.attn_output_b.weight` promovidos a Q6_K y los `ffn_down_shexp.weight` y `ffn_down_exps.weight` modificados. Según la model card, la auditoría de divergencia KL con `llama-perplexity` sobre las 40 capas y los 129.280 logits del vocabulario reporta una correlación log-perplejidad del 99,84%, una coincidencia Top-1 del 98,425% ± 1,109%, una KL mediana de 0,000421 nats y una similitud coseno del subespacio de no rechazo de 0,999609. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni las etapas de RLHF/DPO del modelo base.

## Capacidades

- Generación de texto conversacional y de propósito general, con pipeline `text-generation`.
- Razonamiento y matemáticas: el autor afirma que se preserva la calibración GSQ de AIME25 y GPQA-D del modelo base.
- Capacidades multimodales de visión a través del proyector `mmproj` en BF16.
- Comportamiento abliterated: los tensores de rechazo han sido eliminados de los pesos, de modo que el modelo no aplica negativas de seguridad por defecto.
- Ejecución nativa en llama.cpp (`llama-cli` y `llama-server`) y en `strata-dsv41` sin adaptadores externos.
- Plantilla de chat Jinja embebida para formateo de conversaciones.
- Soporte de tool calling y function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Modo thinking explícito: no disponible en la información proporcionada.

## Casos de uso

- Inferencia local de un LLM de gran escala en servidores con suficiente VRAM o memoria unificada: el formato GGUF de seis shards y la integración nativa en llama.cpp permiten desplegar el modelo con `llama-server` sin necesidad de aplicar LoRA en tiempo de ejecución.
- Investigación sobre alineación y abliteración: los 86 tensores residuales modificados y la auditoría de divergencia KL publicada permiten estudiar el efecto de la eliminación del comportamiento de rechazo sobre las distribuciones de salida con métricas concretas (KL mediana de 0,000421 nats, coincidencia Top-1 del 98,425%).
- Evaluación comparativa de cuantizaciones extremas: la combinación de IQ2_XXS en el backbone con IQ1_M en los expertos y IQ4_NL en la tabla Engram sirve para medir la degradación de calidad frente al modelo base en tareas de razonamiento y matemáticas.
- Procesamiento de documentos con imágenes: el proyector multimodal BF16 permite tareas de descripción de imágenes y respuesta a preguntas visuales dentro de un pipeline llama.cpp.
- Generación de texto sin restricciones de contenido para investigación creativa o red teaming controlado, dado el carácter uncensored del modelo.
- Prototipado de asistentes conversacionales autoalojados donde la licencia MIT y la ausencia de dependencias de servicios en la nube son requisitos.
- Experimentación con arquitecturas MoE y tablas Engram en entornos de investigación que necesiten pesos GGUF listos para cargar en llama.cpp b11870+ o Strata.

## Benchmarks y rendimiento

La model card no publica resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K, etc.). Solo se incluyen métricas de fidelidad de la cuantización y de la abliteración frente al modelo base:

| Métrica | Resultado |
|---|---|
| Correlación log-perplejidad, Cor(ln(PPL(Q)), ln(PPL(base))) | 99,84% |
| PPL(Q) media | 2,4857 ± 0,5017 |
| PPL(base) media | 2,3538 ± 0,4522 |
| Coincidencia Top-1 en vocabulario de 129.280 tokens | 98,425% ± 1,109% |
| KL divergencia mediana | 0,000421 nats |
| KL divergencia media | 0,009546 ± 0,001921 nats |
| Cambio mediano de probabilidad de token | -0,003% |
| Similitud coseno del subespacio de no rechazo | 0,999609 |
| Tensores verificados | 1.043 / 1.043 |
| Capas de expertos GSQ de 1 bit preservadas | 28 / 28 (100%) |

No se han publicado resultados de benchmarks de tareas en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio completo ocupa 250,1 GB y el backbone cuantizado se declara en 138,58 GB; se necesita al menos esa cantidad de memoria (VRAM o memoria unificada) para cargar los pesos, más overhead de contexto y caché KV.
- GPU recomendadas: no disponible en la información proporcionada; por el volumen de pesos, se requiere hardware de clase servidor con memoria agregada muy elevada (varias A100/H100 o configuraciones multi-GPU), aunque el dato concreto no se especifica.
- ¿Cabe en GPU de consumo? No con la información disponible: 138,58 GB de backbone exceden la VRAM de cualquier GPU de consumo actual (RTX 4090 con 24 GB, por ejemplo), por lo que no cabe en una sola GPU consumer.
- Opciones de despliegue: llama.cpp b11870+ (`llama-cli`, `llama-server`), Strata (`strata-dsv41`), Unsloth Studio; requiere los seis shards en el mismo directorio y, en esta release, ya no necesita enlace simbólico manual para el shard 6.
- Latencia y throughput estimados: no disponible en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Rikunarita/DeepSeek-V4.1-Flash-1017-Uncensored-GSQ-RCO (esta ficha) | 748.494.643.824 | no disponible | IQ2_XXS / IQ4_NL / IQ1_M, GGUF 6 shards | MIT | Hugging Face, 0 descargas |
| Abiray/DeepSeek-V4.1-Flash-1017-Uncensored-GSQ-RCO-IQ2_XXS-GGUF | no disponible | no disponible | IQ2_XXS, GGUF | no disponible | Hugging Face (release original con shard 6 ausente) |
| ISTA-DASLab/DeepSeek-V4.1-Flash-1017-GSQ-RCO-GGUF | no disponible | no disponible | IQ2_XXS, GGUF | no disponible | Hugging Face (modelo base sin abliterar) |

La comparación con modelos de otros desarrolladores del mismo tamaño o categoría no está disponible en la información proporcionada.

## Limitaciones y advertencias

- Modelo abliterated: la eliminación de los tensores de rechazo implica que el modelo puede generar contenido dañino, ofensivo o ilegal sin filtros; no es apto para despliegues públicos sin moderación externa.
- La cuantización extrema (IQ2_XXS en el backbone e IQ1_M en 28 capas de expertos) introduce degradación respecto al modelo base: PPL media de 2,4857 frente a 2,3538 y una KL media de 0,009546 nats, con un 1,575% de tokens cuya Top-1 no coincide.
- Riesgo de alucinación: no se han publicado evaluaciones de factualidad ni de benchmarks de tareas; no hay datos que permitan acotar este riesgo.
- Idiomas soportados no documentados: se desconoce el comportamiento en castellano y en idiomas distintos del inglés.
- Longitud de contexto no documentada: no se puede garantizar el rendimiento en conversaciones de contexto largo.
- Licencia MIT declarada por el publicador de la cuantización, pero la licencia del modelo base (ISTA-DASLab) y del modelo original DeepSeek no se detalla en la información disponible; conviene verificar los términos antes de uso comercial.
- Repositorio con 0 descargas y 1 like en el momento de la consulta: no hay evidencia de uso en producción ni validación independiente de las métricas reportadas por el autor.
- El proceso de carga exige los seis shards en el mismo directorio y versiones concretas de llama.cpp (b11870+) o Strata; versiones anteriores no reconocerán el layout `deepseek41`.
- No se dispone de información sobre tool calling, agentes ni modo thinking, por lo que no deben asumirse estas capacidades en producción.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Rikunarita/DeepSeek-V4.1-Flash-1017-Uncensored-GSQ-RCO_Backbone-IQ2_XXS_Engram-IQ4_NL-GGUF
- Modelo base (cuantización de referencia): https://huggingface.co/ISTA-DASLab/DeepSeek-V4.1-Flash-1017-GSQ-RCO-GGUF
- Release original de la build abliterated: https://huggingface.co/Abiray/DeepSeek-V4.1-Flash-1017-Uncensored-GSQ-RCO-IQ2_XXS-GGUF
- llama.cpp: https://github.com/ggml-org/llama.cpp
- Papers, blogs, demos o repositorios adicionales: no disponibles en la información proporcionada.
