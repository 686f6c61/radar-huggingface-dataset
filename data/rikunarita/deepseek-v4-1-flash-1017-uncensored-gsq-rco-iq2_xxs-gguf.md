# Rikunarita/DeepSeek-V4.1-Flash-1017-Uncensored-GSQ-RCO-IQ2_XXS-GGUF

## Resumen

DeepSeek-V4.1-Flash-1017-Uncensored-GSQ-RCO-IQ2_XXS-GGUF es una cuantización GGUF de tipo "abliterated" (sin censura) del modelo ISTA-DASLab/DeepSeek-V4.1-Flash-1017-GSQ-RCO, publicada por el usuario Rikunarita. Se trata de una build standalone en la que los 86 tensores residuales de abliteración están horneados directamente en los pesos cuantizados, de modo que no requiere LoRA ni adaptadores externos en tiempo de ejecución. El modelo base pertenece a la familia DeepSeek-V4.1-Flash, con 748.494.643.824 parámetros totales según los safetensors del repositorio original.

La relevancia de esta ficha radica en que es un ejemplo de cuantización extrema (IQ2_XXS) combinada con modificación de comportamiento (abliteración) sobre un modelo de gran escala, manteniendo supuestamente la inteligencia del modelo original con una divergencia KL mínima. El repositorio corrige un problema de la release original de Abiray (falta del shard 6) renombrando la tabla Engram para que forme parte del layout de 6 shards, lo que permite cargarlo directamente en llama.cpp b11870+ y Strata sin necesidad de crear enlaces simbólicos manuales.

La licencia declarada es MIT, el pipeline es image-text-to-text (soporta visión mediante mmproj) y el tamaño del repositorio es de 250,1 GB. No se dispone de información sobre idiomas soportados ni sobre benchmarks oficiales del modelo base en la información proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia DeepSeek-V4.1-Flash), con capas de expertos enrutados (GSQ-RCO) y tabla Engram; no se detalla la arquitectura completa en la información disponible |
| Parametros totales | 748.494.643.824 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | IQ2_XXS (backbone), IQ1_M (28 capas de expertos enrutados GSQ), IQ4_NL (tabla Engram), Q6_K (tensores de abliteración), BF16 (mmproj de visión) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | GGUF (6 shards: 00001-of-00006 a 00006-of-00006), más mmproj BF16 para visión |

## Arquitectura y entrenamiento

El modelo base es un transformer de la familia DeepSeek-V4.1-Flash con 748.494.643.824 parámetros totales, según los datos de safetensors del repositorio. La build GGUF emplea una estrategia de cuantización mixta: 28 capas de expertos enrutados en IQ1_M calibradas con GSQ (preservadas byte a byte), una tabla Engram de 110,6 GB en IQ4_NL, y el backbone en IQ2_XXS. Los 86 tensores residuales de abliteración (blk.0..39.attn_output_b.weight y ffn_down_shexp.weight, más 6 capas ffn_down_exps.weight) se han promovido a Q6_K para hornear el comportamiento sin censura directamente en los pesos.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF/DPO en la información proporcionada. La innovación técnica destacable es el layout "Strata 6-shard deepseek41" con plantilla de chat Jinja embebida y metadatos deepseek41.attention.kv_source_layers, además del soporte nativo de visión mediante mmproj. El autor reporta una auditoría con llama-perplexity --kl-divergence (build b12017) que muestra una correlación log-perplexity del 99,84%, una coincidencia Top-1 del 98,425% ± 1,109% sobre 129.280 logits de vocabulario, y una KL-divergencia mediana de 0,000421 nats respecto al modelo base sin abliterar.

## Capacidades

- Generación de texto conversacional y razonamiento general, heredadas del modelo base DeepSeek-V4.1-Flash.
- Procesamiento image-text-to-text (visión) mediante el mmproj BF16 incluido.
- Comportamiento "uncensored" o abliterated: se han eliminado los tensores de rechazo, por lo que el modelo no aplica las negativas típicas del modelo original.
- Soporte de plantilla de chat Jinja embebida para integración directa en llama.cpp y Strata.
- Compatibilidad con endpoints (tag endpoints_compatible).
- Capacidades multilingües: no disponible en la información proporcionada.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y multi-step reasoning: no disponible en la información proporcionada.
- Modo thinking, audio u otras capacidades especiales: no disponible en la información proporcionada.

## Casos de uso

- Investigación sobre alineación y abliteración: el modelo permite estudiar el efecto de eliminar los tensores de rechazo sobre el comportamiento, con una auditoría KL que cuantifica la deriva respecto al base (KLD mediana de 0,000421 nats), útil para papers de mechanistic interpretability.
- Despliegue en hardware de gama alta con llama.cpp: al cargarse directamente en llama.cpp b11870+ y Strata sin LoRA, se puede servir mediante llama-server para prototipos de chat conversacional con visión.
- Generación de contenido sin filtros en entornos controlados: para tareas creativas o de investigación donde las negativas del modelo alineado resultan un obstáculo, siempre con revisión humana posterior.
- Evaluación de cuantizaciones extremas: sirve como caso de estudio de cuánto rendimiento se pierde al comprimir un modelo de ~748B parámetros a IQ2_XXS, comparando la perplejidad (2,4857 ± 0,5017) con la del base (2,3538 ± 0,4522).
- Procesamiento de documentos con imagen y texto: gracias al mmproj BF16, se puede usar para tareas image-text-to-text como descripción de figuras o extracción de información de capturas.
- Reproducción de pipelines de conversión GGUF: los scripts de conversión y el run_with_strata.py incluidos permiten replicar el proceso de cuantización mixta (IQ2_XXS + IQ1_M + IQ4_NL) sobre otros modelos de la familia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El autor únicamente reporta métricas de fidelidad de la cuantización respecto al modelo base:

| Metrica | Resultado |
|---|---|
| Perplejidad del modelo cuantizado (PPL(Q)) | 2,4857 ± 0,5017 |
| Perplejidad del modelo base (PPL(base)) | 2,3538 ± 0,4522 |
| Correlación log-perplejidad | 99,84% |
| Coincidencia Top-1 sobre 129.280 logits | 98,425% ± 1,109% |
| KL-divergencia mediana | 0,000421 nats |
| KL-divergencia media | 0,009546 ± 0,001921 nats |
| Cambio mediano de probabilidad de token | -0,003% |
| Similitud coseno del subespacio no-rechazo | 0,999609 |
| Tensores verificados | 1.043 / 1.043 |

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio ocupa 250,1 GB, por lo que se necesita al menos esa cantidad de memoria (RAM o VRAM) para cargar el modelo completo; el backbone se describe como 138,58 GB frente a 138,24 GB del original.
- GPU recomendadas: no disponible en la información proporcionada; por el tamaño, se requerirían configuraciones multi-GPU de gama profesional (A100/H100) o descarga en CPU con suficiente RAM.
- ¿Cabe en consumer GPU? No, el tamaño del repositorio (250,1 GB) excede la VRAM de cualquier GPU de consumo actual.
- Opciones de despliegue: llama.cpp (b11870+ / b12017+), llama-cli, llama-server, Strata (strata-dsv41), Unsloth Studio.
- Latencia y throughput estimados: no disponible en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros totales | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Rikunarita/DeepSeek-V4.1-Flash-1017-Uncensored-GSQ-RCO-IQ2_XXS-GGUF | 748.494.643.824 | no disponible | MIT | GGUF (6 shards) | Abliterado, IQ2_XXS, visión |
| ISTA-DASLab/DeepSeek-V4.1-Flash-1017-GSQ-RCO-GGUF (base) | 748.494.643.824 | no disponible | no disponible | GGUF | Modelo base sin abliterar |
| Abiray/DeepSeek-V4.1-Flash-1017-Uncensored-GSQ-RCO-IQ2_XXS-GGUF | 748.494.643.824 | no disponible | no disponible | GGUF (5 shards + Engram) | Release original con shard 6 faltante |

No se dispone de información sobre otros modelos comparables de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- El modelo es "uncensored" (abliterated): no aplica las negativas de seguridad del modelo alineado, por lo que puede generar contenido dañino, ofensivo o ilegal; requiere filtros externos en producción.
- Riesgo de alucinación: no se han publicado evaluaciones de fidelidad factual en la información disponible; la cuantización extrema IQ2_XXS puede incrementar la degradación en tareas de razonamiento complejo.
- La cuantización IQ2_XXS y IQ1_M es muy agresiva; aunque el autor reporta una KL mediana baja, la perplejidad del cuantizado es un 5,6% superior a la del base, lo que puede afectar a tareas sensibles.
- Idiomas soportados no disponibles: no se puede garantizar un rendimiento multilingüe sin evaluación previa.
- Restricciones de licencia: MIT permite uso comercial, pero la licencia del modelo base (ISTA-DASLab) no se especifica en la información disponible y podría imponer condiciones adicionales.
- El repositorio corrige el shard 6 faltante de la release de Abiray; versiones anteriores requieren crear un enlace simbólico manual, lo que puede causar errores de carga en Unsloth Studio y llama.cpp.
- El tamaño de 250,1 GB imposibilita el despliegue en hardware de consumo; requiere infraestructura de servidor.
- No se dispone de información sobre sesgos conocidos ni sobre el contexto máximo soportado.

## Enlaces

- Hugging Face: https://huggingface.co/Rikunarita/DeepSeek-V4.1-Flash-1017-Uncensored-GSQ-RCO-IQ2_XXS-GGUF
- Modelo base (ISTA-DASLab): https://huggingface.co/ISTA-DASLab/DeepSeek-V4.1-Flash-1017-GSQ-RCO-GGUF
- Release original de Abiray: https://huggingface.co/Abiray/DeepSeek-V4.1-Flash-1017-Uncensored-GSQ-RCO-IQ2_XXS-GGUF
- llama.cpp: no disponible en la información proporcionada
- Strata: no disponible en la información proporcionada
- Papers, blogs, repos y demos adicionales: no disponible en la información proporcionada
