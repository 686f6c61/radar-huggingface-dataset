# s3t4/banjar-qwen3.5-4b-lora

## Resumen

Banjar-LLM Qwen 3.5-4B LoRA es un adaptador LoRA de precisión completa (bfloat16) construido sobre el modelo base `unsloth/Qwen3.5-4B` (originalmente `Qwen/Qwen3.5-4B`) por el usuario `s3t4`. Su propósito es especializar un transformer de 4.000 millones de parámetros en traducción automática bidireccional entre banjarés (`bjn`) e indonesio (`id`), consulta léxica bidireccional y explicación de refranes tradicionales banjaries. El adaptador se distribuye como pesos PEFT en safetensors y requiere cargar el modelo base para su uso.

El modelo aborda un problema de recursos lingüísticos escasos: el banjarés es una lengua austronesia hablada en Kalimantan del Sur (Indonesia) con poca presencia en modelos fundacionales. El autor entrena sobre 20.634 registros de instrucciones de entrenamiento y 877 de validación, con un subconjunto público de 13.545/513/1.350 (train/valid/test) liberado bajo licencia Creative Commons. La evaluación se realiza con decodificación greedy determinista sobre particiones estrictamente reservadas.

La relevancia actual reside en que demuestra que un adaptador LoRA ligero (repo de 0,1 GB) sobre un modelo de 4B puede superar ampliamente el baseline de copia de la fuente en traducción banjarés-indonesio, alcanzando 54,24 BLEU en `bjn → id` sobre NusaX. Es un caso práctico de adaptación eficiente de un LLM multilingüe a una lengua de bajos recursos mediante SFT.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (modelo base Qwen3.5-4B) + adaptador LoRA (PEFT) |
| Parametros totales | 4B (modelo base); adaptador LoRA con r=16, lora_alpha=16, lora_dropout=0 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la información proporcionada; el quickstart usa `max_seq_length=1024` |
| Tipos de cuantizacion | Adaptador en bfloat16 de 16 bits; el modelo base admite cuantización (4-bit/16-bit vía Unsloth), aunque el adaptador se entrenó y evalúa en 16-bit |
| Idiomas soportados | banjarés (`bjn`), indonesio (`id`) |
| Licencia | CC BY-SA 4.0 |
| Formato de pesos | safetensors (PEFT/LoRA adapter) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre el modelo base Qwen3.5-4B, un transformer decoder-only de 4.000 millones de parámetros. El ajuste se realiza mediante LoRA de 16 bits en bfloat16 con rango `r=16`, `lora_alpha=16` y `lora_dropout=0`, usando la plantilla de chat nativa de Qwen 3.5 con `enable_thinking=False`. El entrenamiento es SFT (supervised fine-tuning) gestionado con las librerías `transformers`, `trl` y `unsloth`.

Los datos de entrenamiento provienen del dataset `s3t4/banjar-llm-dataset-v3.2`: 20.634 registros de instrucciones de entrenamiento (`sft_train`) y 877 de validación (`sft_valid`). El subconjunto público liberado comprende 13.545 de entrenamiento, 513 de validación y 1.350 de test, extraído de Mendeley Banjarese Hulu, NusaX-MT, Banjarese Wikiquote y Tatoeba. Los textos léxicos y literarios de terceros usados durante el entrenamiento se excluyen de la redistribución pública por derechos de autor. No se documenta en la información disponible el uso de RLHF o DPO, ni innovaciones técnicas adicionales más allá del propio ajuste LoRA.

## Capacidades

- Traducción automática bidireccional banjarés → indonesio e indonesio → banjarés.
- Consulta léxica bidireccional: significado de palabras banjaries en indonesio y equivalencia en banjarés de palabras indonesias.
- Explicación del significado de refranes tradicionales banjaries (`pepatah`).
- Generación de texto conversacional siguiendo la plantilla de chat de Qwen 3.5.
- Funcionamiento en modo no-thinking (`enable_thinking=False`), orientado a respuestas directas.
- Soporte de prompts de instrucción específicos: `Terjemahkan ke bahasa Banjar: ...`, `Terjemahkan ke bahasa Indonesia: ...`, `Apa arti kata Banjar "..." dalam bahasa Indonesia?`, `Apa bahasa Banjarnya "..."?`, `Apa arti pepatah Banjar "..."?`.
- No se documentan capacidades de tool calling, function calling, agentes, visión ni audio en la información disponible.

## Casos de uso

- Traducción de documentación administrativa del indonesio al banjarés: el modelo traduce frases completas con 41,21 BLEU en `id → bjn` sobre NusaX, adecuado para señalización, formularios y comunicados locales.
- Localización de contenidos digitales al banjarés: traducción de artículos, subtítulos o publicaciones para comunidades de Kalimantan del Sur, aprovechando el rendimiento de 54,24 BLEU en `bjn → id` para la dirección inversa.
- Diccionario asistido para lingüistas y traductores: consulta de significados y equivalencias léxicas mediante los prompts de `leksikon` y `leksikon_id2bjn`, con exactitud de coincidencia del 14,2% y 16,9% respectivamente (útil como apoyo, no como fuente única).
- Preservación del patrimonio oral: explicación de refranes banjaries (`pepatah`) con chrF++ de 39,21, para proyectos educativos y museísticos.
- Atención al ciudadano bilingüe: integración en chatbots de servicios públicos que reciban indonesio y respondan en banjarés o viceversa, con el modelo base Qwen3.5-4B ejecutándose en una sola GPU.
- Investigación en lenguas de bajos recursos: base reproducible para experimentos de adaptación LoRA sobre lenguas austronesias, con particiones de test públicas y comparación directa con el adaptador hermano `s3t4/banjar-gemma4-e4b-lora`.
- Generación de material didáctico: creación de pares de frases y ejercicios de traducción para cursos de banjarés, usando la plantilla de chat nativa.

## Benchmarks y rendimiento

Evaluación con decodificación greedy determinista (`do_sample=False`) sobre particiones de test reservadas sin solapamiento con el entrenamiento.

Traducción automática (650 pares de frases):

| Subconjunto | Dirección | Baseline copia (BLEU / chrF++) | BLEU del modelo | chrF++ del modelo |
|---|---|---|---|---|
| Mendeley Banjarese Hulu (250 pares) | `bjn → id` | 2,26 / 23,74 | 24,65 | 48,68 |
| Mendeley Banjarese Hulu (250 pares) | `id → bjn` | 2,10 / 25,65 | 23,67 | 52,17 |
| NusaX Official Test (400 pares) | `id → bjn` | 12,33 / 44,50 | 41,21 | 67,04 |
| NusaX Official Test (400 pares) | `bjn → id` | 12,33 / 44,17 | 54,24 | 73,44 |

Léxico y refranes (conjuntos reservados):

| Tarea | Tamano test | Metricas | Puntuacion |
|---|---|---|---|
| Diccionario banjarés → indonesio (`leksikon`) | 267 entradas | Substring / Exact / Token-F1 | 14,6% / 14,2% / 0,176 |
| Diccionario indonesio → banjarés (`leksikon_id2bjn`) | 267 entradas | Substring / Exact / Token-F1 | 18,4% / 16,9% / 0,171 |
| Refranes banjaries (`pepatah`) | 50 entradas | chrF++ | 39,21 |

## Requisitos de hardware

- El adaptador LoRA ocupa 0,1 GB en disco; requiere cargar el modelo base Qwen3.5-4B (aproximadamente 8 GB en bfloat16).
- Inferencia en bfloat16: se estiman en torno a 8-10 GB de VRAM para el modelo base de 4B más el adaptador y el contexto (estimación a partir del tamaño de parámetros, no publicada por el autor).
- Cabe en GPU de consumo: RTX 4090 (24 GB), RTX 3090 (24 GB), RTX 4080 (16 GB) en 16-bit; en 4-bit cabría en GPUs de 8-12 GB (por ejemplo RTX 3060/4060), aunque el adaptador se entrenó y evalúa en 16-bit.
- GPU profesionales recomendadas: A100, H100 o L40S para mayor throughput en producción.
- Despliegue: el quickstart oficial usa Unsloth (`FastLanguageModel`); al ser un adaptador PEFT, puede servirse con `transformers` + `peft`, y potencialmente con vLLM o TGI (no documentado explícitamente por el autor). No se documenta soporte GGUF ni Ollama.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Traducción `bjn` | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Banjar-LLM Qwen 3.5-4B LoRA (este) | 4B (base) + LoRA r=16 | no disponible | 54,24 BLEU `bjn → id` (NusaX) | CC BY-SA 4.0 | Hugging Face (PEFT) |
| `s3t4/banjar-gemma4-e4b-lora` | no disponible (Gemma 4 E4B) | no disponible | no disponible en esta ficha; entrenado y evaluado en las mismas particiones según el autor | no disponible en esta ficha | Hugging Face |
| Qwen3.5-4B base (`unsloth/Qwen3.5-4B`) | 4B | no disponible | no disponible (modelo general, sin ajuste banjarés) | no disponible en esta ficha | Hugging Face |

No se dispone de datos de benchmarks de los modelos comparables en la información proporcionada para establecer una comparación cuantitativa completa.

## Limitaciones y advertencias

- El modelo es un adaptador LoRA: no funciona de forma autónoma, requiere cargar el modelo base `unsloth/Qwen3.5-4B` y la librería PEFT.
- Cobertura lingüística limitada a banjarés e indonesio; no se garantiza calidad fuera de estos idiomas.
- Rendimiento débil en consulta léxica: exact match del 14,2% (`bjn → id`) y 16,9% (`id → bjn`), lo que desaconseja su uso como diccionario fiable sin verificación humana.
- Riesgo de alucinación en traducciones y explicaciones de refranes, especialmente en vocabulario poco representado en el corpus de entrenamiento.
- El corpus público excluye textos léxicos y literarios de terceros por derechos de autor; el modelo puede haber aprendido de fuentes no redistribuibles, lo que limita la reproducibilidad exacta.
- Licencia CC BY-SA 4.0: permite uso comercial con atribución y obligación de compartir obras derivadas bajo la misma licencia; revisar compatibilidad con el modelo base Qwen3.5-4B.
- `lora_dropout=0` y `enable_thinking=False`: el modelo está optimizado para respuestas directas, sin cadena de pensamiento; puede degradarse en tareas de razonamiento complejo.
- No se documentan salvaguardas de seguridad, filtros de contenido ni evaluación de sesgos.
- Sin métricas publicadas de latencia, throughput ni consumo de VRAM; las estimaciones de hardware son aproximadas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/s3t4/banjar-qwen3.5-4b-lora
- Dataset público: https://huggingface.co/datasets/s3t4/banjar-llm-dataset-v3.2
- Modelo base (Unsloth): https://huggingface.co/unsloth/Qwen3.5-4B
- Modelo base original (Qwen): https://huggingface.co/Qwen/Qwen3.5-4B
- Adaptador hermano Gemma 4 E4B: https://huggingface.co/s3t4/banjar-gemma4-e4b-lora
- NusaX-MT (dataset de traducción): https://github.com/IndoNLP/nusax
- Tatoeba: https://tatoeba.org
