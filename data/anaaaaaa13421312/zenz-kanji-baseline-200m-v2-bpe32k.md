# anaaaaaa13421312/zenz-kanji-baseline-200m-v2-bpe32k

## Resumen

`zenz-kanji-baseline-200m-v2-bpe32k` es un modelo de lenguaje de aproximadamente 191 millones de parámetros desarrollado por el usuario `anaaaaaa13421312`, pensado como línea base (*baseline*) para experimentos de tokenización en japonés. Concretamente, sirve de referencia frente a una variante del mismo tamaño que opera sobre katakana (la serie `zenz-kana-slm-200m-v2-bpe4k`), de modo que el autor pueda comparar el efecto de un vocabulario BPE estándar de kanji y kana (32.768 tokens) frente a un vocabulario reducido de 4.096 tokens sobre katakana.

El modelo emplea la arquitectura `Qwen3ForCausalLM` con 14 capas, dimensión oculta de 1.024, atención con 16 cabezas de consulta y 4 de clave/valor, QK-Norm y *embeddings* atados. Se ha preentrenado sobre unos 3.600 millones de tokens de texto japonés (FineWeb-2 Edu, Wikipedia y Aozora Bunko) y posteriormente se ha ajustado con supervisión (SFT) sobre 135.939 diálogos en japonés, con una pérdida de validación de 1,652 y una perplejidad de 5,217.

Su relevancia es acotada pero clara: es un artefacto de investigación reproducible (entrenado en TPU v5e-8 con JAX) que permite estudiar cómo afecta la elección del tokenizador al rendimiento de modelos pequeños en japonés, un idioma con escritura mixta y gran carga morfológica. No está pensado como modelo de producción generalista.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | `Qwen3ForCausalLM` (transformer decoder-only) |
| Parámetros totales | 191.396.608 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos en safetensors; cuantizaciones GGUF no publicadas) |
| Idiomas soportados | japonés (`ja`) |
| Licencia | `other` (licencia compuesta; ver LICENSE del repositorio) |
| Formato de pesos | safetensors (librería `transformers`) |

Detalles adicionales de arquitectura: 14 capas, `hidden_size=1024`, `intermediate_size=2816`, 16 cabezas de consulta / 4 de clave-valor, `head_dim=64`, QK-Norm, *embeddings* atados y ratio de *embedding* del 17,53 %. Tamaño del repositorio: 1,1 GB.

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de la familia Qwen3 adaptado a escala pequeña: 14 capas, atención agrupada (GQA) con 16 cabezas de consulta y 4 de clave-valor, QK-Norm para estabilizar el entrenamiento y proyección de *embeddings* atada a la cabeza de salida. El vocabulario es un BPE de 32.768 tokens (`kanji-bpe-32k`) que cubre kanji, kana y signos de puntuación, lo que lo convierte en la referencia "estándar" frente a la variante katakana.

El preentrenamiento se realizó en dos ramas: una rama `iso_data` que alcanzó el paso 22.052 con 2.890.399.744 tokens (val_bpc=2,45626, val_bpb=0,88997, val_ppl=28,077) y una rama `pretrain` que llegó al paso 27.465 con 3.599.892.480 tokens en 11.156,5 s sobre TPU v5e-8 (val_bpc=2,43159, val_bpb=0,88103, val_ppl=27,152). El corpus combina aproximadamente un 70 % de FineWeb-2 Edu japonés filtrado (score ≥ 2,5), un 25 % de Wikipedia japonesa (junio de 2025) y un 5 % de Aozora Bunko.

El ajuste fino supervisado se ejecutó durante 2 épocas (2.124 pasos) sobre 135.939 diálogos en crudo (`conversations_raw`), con 42.420.850 tokens válidos y pérdida de entropía cruzada calculada únicamente sobre los turnos del asistente, en 889,0 s sobre TPU v5e-8. La mejor validación, con 305.919 tokens de asistente en el paso 2.124, dio `val_loss=1,65198` y `val_ppl=5,217`. No se documenta RLHF ni DPO; el ajuste es puramente SFT. La plantilla de conversación es `<|bos|><|user|>...<|end|><|assistant|>...<|eos|>`.

## Capacidades

- Generación de texto en japonés con escritura mixta kanji-kana, incluyendo respuestas conversacionales de un solo turno.
- Conversación multi-turno siguiendo la plantilla `<|user|>` / `<|assistant|>` definida en la model card.
- Extracción y reformulación de información a partir de contenido tipo Wikipedia, gracias a la mezcla de SFT con `extraction-wiki-ja`.
- Respuesta a instrucciones generales en japonés (herederas de `llm-jp-instructions` y Magpie).
- Razonamiento básico y matemáticas elementales: no hay evaluación publicada que lo confirme, por lo que debe considerarse no verificado.
- Soporte de *tool calling* / *function calling*: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multimodales (visión, audio): no disponibles.
- Modo *thinking* explícito: no disponible.

## Casos de uso

- **Investigación sobre tokenización en japonés**: el modelo sirve como referencia cuantitativa para medir el impacto del vocabulario BPE (32k kanji-kana frente a 4k katakana) en perplejidad y calidad conversacional, usando las métricas de validación publicadas como punto de partida.
- **Prototipado de chatbots japoneses de bajo coste**: con 191 M de parámetros y pesos safetensors de 1,1 GB, se puede desplegar en una única GPU de gama media para experimentar con flujos conversacionales antes de escalar a modelos mayores.
- **Generación de respuestas breves en japonés para asistentes de FAQ**: el ajuste sobre Magpie y `llm-jp-instructions` lo hace adecuado para respuestas cortas y directas en dominios acotados, siempre con revisión humana.
- **Extracción de información de artículos de Wikipedia japonesa**: la inclusión de 35.000 ejemplos de `extraction-wiki-ja` en el SFT permite usarlo como extractor de entidades o resúmenes en pipelines de procesamiento documental.
- **Evaluación de técnicas de entrenamiento en TPU con JAX**: el autor documenta tiempos y pasos exactos en TPU v5e-8, lo que convierte al modelo en un banco de pruebas reproducible para experimentos de preentrenamiento y SFT a pequeña escala.
- **Generación de datos sintéticos en japonés para aumento de corpus**: puede producir diálogos de dominio general que luego se filtran y se incorporan a conjuntos de entrenamiento mayores, dado su bajo coste de inferencia.
- **Línea base en estudios comparativos de modelos pequeños japoneses**: útil para comparar arquitecturas o currículos de entrenamiento manteniendo constante el tokenizador.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, JGLUE, etc.) en la información disponible. Las únicas métricas reportadas son de validación interna durante el entrenamiento:

| Métrica | Valor |
|---|---|
| Preentrenamiento (rama `pretrain`, paso 27.465) | val_bpc=2,43159 · val_bpb=0,88103 · val_ppl=27,152 |
| Preentrenamiento (rama `iso_data`, paso 22.052) | val_bpc=2,45626 · val_bpb=0,88997 · val_ppl=28,077 |
| SFT (mejor validación, paso 2.124) | val_loss=1,65198 · val_ppl=5,217 |
| Tokens de preentrenamiento | 3.599.892.480 |
| Tokens de SFT (válidos) | 42.420.850 |

## Requisitos de hardware

- **VRAM estimada en FP16/BF16**: aproximadamente 0,4 GB solo para pesos (191 M × 2 bytes), más overhead de activaciones y caché KV; en la práctica, menos de 2 GB para inferencia con contexto moderado.
- **VRAM estimada en cuantización de 8 bits**: alrededor de 0,2 GB para pesos; en 4 bits, en torno a 0,1 GB.
- **GPU recomendadas**: cualquier GPU consumer moderna es suficiente (RTX 3060, RTX 4060, RTX 4090); también cabe en GPUs de portátil con 4 GB o más. Para entrenamiento o *fine-tuning*, se recomienda al menos una RTX 4090 o una A100/H100 si se quiere reproducir el pipeline completo.
- **¿Cabe en GPU consumer?**: sí, holgadamente, en cualquier GPU con 4 GB o más.
- **Opciones de despliegue**: `transformers` (librería nativa), Text Generation Inference (el modelo está etiquetado como `text-generation-inference` y `endpoints_compatible`), y en principio `llama.cpp`/Ollama si se generan pesos GGUF, aunque no se publican conversiones oficiales.
- **Latencia y throughput**: no disponibles. El autor solo reporta tiempos de entrenamiento (11.156,5 s de preentrenamiento y 889,0 s de SFT en TPU v5e-8), no de inferencia.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| `zenz-kanji-baseline-200m-v2-bpe32k` | 191 M | no disponible | ja | `other` | Referencia BPE 32k; SFT sobre 135.939 diálogos |
| `zenz-kana-slm-200m-v2-bpe4k` (mismo autor) | ~191 M | no disponible | ja | no disponible | Variante katakana con vocabulario de 4.096 tokens; objetivo directo de comparación |
| Modelos japoneses pequeños tipo `llm-jp-3-150m` | ~150 M | no disponible | ja | no disponible | Familia de líneas base japonesas de llm-jp; sin datos de comparación directa publicados aquí |

No se dispone de resultados de benchmarks que permitan una comparación cuantitativa con alternativas; la comparativa es, por tanto, estructural.

## Limitaciones y advertencias

- **Idioma único**: solo japonés; no se ha entrenado ni evaluado en otros idiomas, por lo que su uso fuera del japonés producirá resultados degenerados.
- **Escala muy reducida**: con 191 M de parámetros, la capacidad de razonamiento, matemáticas y conocimiento factual es intrínsecamente limitada; no es apto para tareas que requieran conocimiento profundo.
- **Riesgo elevado de alucinación**: los corpus de preentrenamiento incluyen texto web filtrado (FineWeb-2 Edu) y Wikipedia; el SFT con datos generados por otros modelos (Magpie) puede propagar errores factuales.
- **Sesgos**: los datos de FineWeb-2 y Wikipedia pueden contener sesgos de género, culturales y geográficos propios de la web y de la enciclopedia; no se documenta ningún proceso de mitigación.
- **Licencia compuesta (`other`)**: el modelo combina corpus con licencias ODC-By v1.0, CC-BY-SA 4.0, CC-BY 4.0 y Apache-2.0; es imprescindible revisar el archivo LICENSE del repositorio antes de cualquier uso comercial. No se garantiza compatibilidad con uso comercial directo.
- **Sin datos de contexto**: no se especifica la longitud máxima de contexto soportada, lo que impide planificar despliegues con ventanas largas.
- **Sin cuantizaciones oficiales**: no hay pesos GGUF ni AWQ/GPTQ publicados; el despliegue eficiente en CPU requeriría conversión propia.
- **Artefacto de investigación**: el autor lo presenta explícitamente como *baseline* comparativo, no como modelo listo para producción; no hay evaluación de seguridad ni de robustez frente a *prompts* adversarios.
- **Fecha de creación futura en los metadatos**: el repositorio figura como creado el 2026-11-25, lo que conviene verificar antes de citarlo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/anaaaaaa13421312/zenz-kanji-baseline-200m-v2-bpe32k
- Variante katakana de referencia: https://huggingface.co/anaaaaaa13421312/zenz-kana-slm-200m-v2-bpe4k
- Dataset de preentrenamiento: https://huggingface.co/datasets/anaaaaaa13421312/zenz-kana-slm-v2-pretrain-shards
- Dataset de SFT: https://huggingface.co/datasets/anaaaaaa13421312/zenz-kana-slm-v2-sft-ja
- FineWeb-2 Edu japonés: https://huggingface.co/datasets/hotchpotch/fineweb-2-edu-japanese
- Wikipedia japonesa 2025-06: https://huggingface.co/datasets/OmniAICreator/Japanese-Wikipedia-202506
- Aozora Bunko Clean: https://huggingface.co/datasets/globis-university/aozorabunko-clean
- Magpie SFT v1.0 (llm-jp): https://huggingface.co/datasets/llm-jp/magpie-sft-v1.0
- Magpie Tanuki 8B: https://huggingface.co/datasets/Aratako/Magpie-Tanuki-8B-97k
- Extraction Wiki JA: https://huggingface.co/datasets/llm-jp/extraction-wiki-ja
- Chatbot Arena JA (llm-jp): https://huggingface.co/datasets/llm-jp/llm-jp-chatbot-arena-conversations
- LLM-JP Instructions: https://huggingface.co/datasets/llm-jp/llm-jp-instructions
- SudachiPy: https://github.com/WorksApplications/SudachiPy
- Términos de uso de Common Crawl: https://commoncrawl.org/terms-of-use
