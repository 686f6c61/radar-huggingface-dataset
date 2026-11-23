# ModelMerge-JP/Baphomet-1.1-4B

## Resumen

Baphomet-1.1-4B es un modelo de lenguaje y visión de 4.660 millones de parámetros construido mediante la fusión lineal de ocho "task vectors" sobre el modelo base Qwen/Qwen3.5-4B. Lo desarrolla ModelMerge-JP y se publica bajo licencia Apache 2.0. No se trata de un modelo entrenado desde cero, sino de un experimento de merging: cada uno de los ocho modelos donantes aporta una dirección de ajuste fino que se suma al peso base con un coeficiente λ específico.

La novedad respecto a su predecesor, Baphomet-1.0-4B, es que los coeficientes de fusión ya no son uniformes (0,1375 para todos los donantes), sino que se obtuvieron mediante una búsqueda evolutiva con EvoGM (Evolutionary Generative Optimization), un método presentado en ICML 2026. El resultado es una distribución muy desigual del peso: tres donantes concentran casi toda la contribución (Qwen3.8-4B-Distill con λ=0,590, Qwopus3.5-4B-v3 con λ=0,297 y DeepSeek-V4-Pro-Qwen3.5-4B con λ=0,204), mientras que el resto aporta correcciones marginales.

El modelo hereda la arquitectura híbrida de Qwen3.5-4B: 32 capas de transformer con atención lineal intercalada, ventana de contexto de 262.144 tokens, una capa MTP para decodificación especulativa y capacidad de procesamiento imagen-texto. Está pensado para investigadores que quieran evaluar técnicas de model merging y para desarrolladores que necesiten un modelo compacto con razonamiento, uso de herramientas y contexto muy largo en una sola GPU.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | `Qwen3_5ForConditionalGeneration` (transformer híbrido con atención lineal y completa) |
| Parámetros totales | 4.659.865.088 (4,66 B) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantización | pesos publicados en bfloat16; cuantizaciones posteriores (GGUF, AWQ, etc.) no disponibles en el repositorio |
| Idiomas soportados | inglés (declarado en la model card); capacidades multilingües del base Qwen3.5 no verificadas en esta ficha |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (2 shards, bf16; tensores `A_log` y de normalización en fp32) |

Detalles adicionales de arquitectura extraídos de `config.json`:

| Parámetro | Valor |
|---|---|
| Capas de texto | 32 |
| Dimensión oculta | 2.560 |
| Cabezas de atención | 16 Q / 4 KV (GQA), `head_dim` 256 |
| Patrón de atención | 3 capas de atención lineal seguidas de 1 de atención completa |
| FFN | intermedio 9.216, activación SiLU, `tie_word_embeddings: true` |
| Capas MTP | 1 (`mtp_num_hidden_layers: 1`) |
| Vocabulario | 248.320 tokens (`Qwen2Tokenizer`, BPE) |
| Pipeline | image-text-to-text |

## Arquitectura y entrenamiento

Baphomet-1.1-4B no se entrena: se construye por fusión de pesos. La fórmula aplicada es `W_merged = W_base + Σ λᵢ · Tᵢ`, donde cada task vector `Tᵢ = W_donorᵢ − W_base` se calcula en fp32 y se almacena en fp8 e4m3 con escala absmax por fila. La acumulación se hace en fp32 en el orden de los donantes y el resultado se convierte de nuevo al dtype del tensor base (bf16, salvo `A_log` y normas que permanecen en fp32). Los tensores ausentes en un donante contribuyen con cero; Agents-A1-4B y AREX-Turbo no tienen tensores MTP, y NeoHorse-1-4B y tmax-4b son solo texto (las claves de NeoHorse se remapearon de `model.*` a `model.language_model.*`). Los nombres de claves, formas, dtypes y el layout de dos shards son idénticos a Qwen3.5-4B, y el tokenizer, chat template y configuración del procesador se copian sin cambios.

La búsqueda de coeficientes se realizó con una adaptación de EvoGM, que entrena generadores MLP duales sobre particiones ganador/perdedor de una población de candidatos, con λᵢ ∈ [−1, 1] y rondas de cambio de base. La ronda 1 evaluó 40 candidatos sobre un conjunto de fitness de 110 ítems (40 MMLU-Pro, 30 GPQA, 40 BFCL non-live) con modo thinking y tope de 4.096 tokens; las rondas 2 y 3 añadieron 64 candidatos evaluados sobre un subconjunto de 40 ítems elegido por información de Fisher, estimando el resto mediante un modelo IRT 2PL y re-puntuando los mejores sobre los 110 ítems completos. El coste total fue de aproximadamente 13,7 horas-kernel en Kaggle T4×2 con vLLM 0.33.0. El fitness pasó de 0,603 (Baphomet-1.0 con λ uniforme) a 0,764 en Baphomet-1.1.

## Capacidades

- Generación de texto y razonamiento en modo thinking, con menor verbosidad que Baphomet-1.0 (media de 1.834 tokens de salida frente a 3.180).
- Razonamiento matemático y de dominio científico, heredado principalmente de Qwen3.8-4B-Distill y DeepSeek-V4-Pro-Qwen3.5-4B.
- Generación de código, con contribución de Qwopus3.5-4B-Coder y Qwopus3.5-4B-v3.
- Uso de herramientas y function calling, evaluado mediante BFCL non-live en el conjunto de fitness.
- Procesamiento de imagen y texto (`image-text-to-text`), heredado del pipeline multimodal del base.
- Contexto largo de hasta 262.144 tokens.
- Decodificación especulativa mediante la capa MTP incluida en la arquitectura.
- Capacidades de agente y razonamiento multi-paso, con aportación de Agents-A1-4B y AREX-Turbo (aunque con coeficientes muy bajos).
- Idiomas: la model card solo declara inglés; no se confirma soporte multilingüe verificado para este merge.

## Casos de uso

- Evaluación de técnicas de model merging: el modelo sirve como referencia reproducible para comparar fusión uniforme (Baphomet-1.0) frente a búsqueda evolutiva de coeficientes (Baphomet-1.1) sobre el mismo conjunto de donantes y el mismo base.
- Razonamiento científico asistido: con contexto de 262.144 tokens puede ingerir varios papers o documentación técnica extensa y responder preguntas de MMLU-Pro o GPQA-Diamond, tareas que forman parte de su conjunto de evaluación.
- Asistente de código en local: al integrar señales de Qwopus3.5-4B-Coder y Qwopus3.5-4B-v3, puede emplearse para autocompletado, revisión de parches y generación de tests en un flujo con tool calling, desplegado en una sola GPU de consumo.
- Agentes con llamadas a funciones: su evaluación en BFCL non-live indica que puede gestionar selección de herramientas y argumentos en pipelines de automatización, aunque conviene validar el comportamiento en el dominio concreto antes de producción.
- Procesamiento de documentos con imágenes: al ser un modelo image-text-to-text, puede extraer información de capturas, diagramas o páginas escaneadas combinadas con texto largo en una misma ventana de contexto.
- Prototipado rápido de aplicaciones conversacionales: su tamaño de 4,66 B y su licencia Apache 2.0 permiten desplegarlo en entornos de desarrollo sin coste de licencia y con requisitos de hardware moderados.
- Investigación sobre decodificación especulativa: la capa MTP permite medir ganancias de throughput en comparación con decodificación autoregresiva estándar sobre el mismo base.

## Benchmarks y rendimiento

Los únicos datos publicados provienen de un test pareado de 180 ítems (MMLU-Pro, GPQA-Diamond y BFCL non-live) con tope de 8.192 tokens en modo thinking. No hay resultados desglosados por benchmark ni comparaciones con modelos externos al linaje.

| Modelo | Precisión media (180 ítems) | Tokens medios de salida |
|---|---|---|
| Qwen3.5-4B (base) | 70,0 % | no disponible |
| Baphomet-1.0-4B | 77,8 % | 3.180 |
| Baphomet-1.1-4B | 79,4 % | 1.834 |

El autor indica que la mejora sobre Qwen3.5-4B es estadísticamente significativa, pero la mejora sobre Baphomet-1.0 no lo es. En el conjunto de fitness de 110 ítems (tope de 4.096 tokens), la progresión fue 0,603 (λ uniforme de 1.0) → 0,722 (mejor de la ronda 1) → 0,733 (ronda 2) → 0,764 (Baphomet-1.1). Los ítems de fitness y de test son disjuntos.

## Requisitos de hardware

- VRAM estimada en bf16: aproximadamente 9,3 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica, entre 12 y 16 GB para contexto moderado.
- VRAM en cuantización de 8 bits: alrededor de 5 GB de pesos; en 4 bits, alrededor de 2,5 a 3 GB, aunque el repositorio no publica versiones GGUF ni AWQ.
- GPU recomendadas: A100 40/80 GB o H100 para contexto completo de 262.144 tokens y serving concurrente; RTX 4090 (24 GB) para bf16 con contexto medio; RTX 3090 o 4080 para cuantización de 8 bits.
- Cabe en GPU de consumo: sí, en RTX 4090, 3090, 4080 y tarjetas con 12 GB o más en bf16 con contexto reducido.
- Opciones de despliegue: transformers (formato nativo), vLLM (usado por el autor en la evaluación, versión 0.33.0), y previsiblemente llama.cpp u Ollama si se generan cuantizaciones GGUF, aunque no se ofrecen en el repositorio.
- Latencia y throughput: no disponibles. El autor solo reporta el coste de la búsqueda (13,7 horas-kernel en T4×2), no métricas de inferencia.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Enfoque | Precisión en test del autor |
|---|---|---|---|---|---|
| Baphomet-1.1-4B | 4,66 B | 262.144 | Apache 2.0 | Merge lineal con λ evolutivos | 79,4 % (180 ítems) |
| Baphomet-1.0-4B | 4,66 B | 262.144 | Apache 2.0 | Merge lineal con λ uniforme 0,1375 | 77,8 % (180 ítems) |
| Qwen3.5-4B | 4 B (aprox.) | 262.144 | no disponible en esta ficha | Modelo base entrenado | 70,0 % (180 ítems) |
| Qwen3.8-4B-Distill | 4 B (aprox.) | no disponible | no disponible | Destilado, donante principal (λ=0,590) | no disponible |

La comparación con modelos ajenos al linaje (por ejemplo, Llama 3.2 3B, Gemma 3 4B o Phi-4-mini) no está disponible porque el autor no publica resultados cruzados. Cualquier comparación externa requeriría reevaluar todos los modelos sobre el mismo conjunto de 180 ítems.

## Limitaciones y advertencias

- El modelo es un merge experimental, no un entrenamiento validado: la mejora sobre Baphomet-1.0 no es estadísticamente significativa según el propio autor, y el test consta solo de 180 ítems.
- La evaluación se hizo con vLLM cargando los pesos en fp16, mientras que el repositorio los publica en bf16; pueden aparecer diferencias menores de precisión entre entornos.
- El almacenamiento de task vectors en fp8 e4m3 introduce desviaciones de hasta aproximadamente un ulp de bf16 respecto a un merge exacto en fp32.
- La model card solo declara inglés; no hay evidencia de rendimiento multilingüe verificado para este merge concreto.
- Riesgo de alucinación inherente a un modelo de 4 B: no se han publicado evaluaciones de factualidad ni de calibración.
- Sesgos: no se documentan análisis de sesgo, toxicidad ni evaluación de seguridad.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero las licencias de los ocho modelos donantes deben verificarse por separado; la model card no las detalla.
- El pipeline declarado es image-text-to-text, pero no se publican métricas de rendimiento en tareas de visión.
- Los coeficientes negativos (tmax-4b con λ=−0,000742) y los cercanos a cero indican que varios donantes apenas influyen; el comportamiento del modelo está dominado por tres de ellos.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validación independiente de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ModelMerge-JP/Baphomet-1.1-4B
- Predecesor Baphomet-1.0-4B: https://huggingface.co/CloudGoat/Baphomet-1.0-4B
- Repositorio de EvoGM: https://github.com/JiangTao97/evogm
- Paper de EvoGM (referencia arXiv indicada en los tags): arxiv:2511.21437
- Modelo base Qwen3.5-4B: https://huggingface.co/Qwen/Qwen3.5-4B
- Donante InternScience/Agents-A1-4B: https://huggingface.co/InternScience/Agents-A1-4B
- Donante Jackrong/DeepSeek-V4-Pro-Qwen3.5-4B: https://huggingface.co/Jackrong/DeepSeek-V4-Pro-Qwen3.5-4B
- Donante empero-ai/Qwen3.8-4B-Distill: https://huggingface.co/empero-ai/Qwen3.8-4B-Distill
- Donante Jackrong/Qwopus3.5-4B-Coder: https://huggingface.co/Jackrong/Qwopus3.5-4B-Coder
- Donante Jackrong/Qwopus3.5-4B-v3: https://huggingface.co/Jackrong/Qwopus3.5-4B-v3
- Donante BAAI/AREX-Turbo: https://huggingface.co/BAAI/AREX-Turbo
- Donante TokenRhythm/NeoHorse-1-4B: https://huggingface.co/TokenRhythm/NeoHorse-1-4B
- Donante allenai/tmax-4b: https://huggingface.co/allenai/tmax-4b
