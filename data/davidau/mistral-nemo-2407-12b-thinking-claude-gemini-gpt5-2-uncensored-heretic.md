# DavidAU/Mistral-Nemo-2407-12B-Thinking-Claude-Gemini-GPT5.2-Uncensored-HERETIC

## Resumen

Mistral-Nemo-2407-12B-Thinking-Claude-Gemini-GPT5.2-Uncensored-HERETIC es un ajuste fino (finetune) del modelo Mistral-Nemo-Instruct-2407 publicado por el usuario DavidAU en HuggingFace. Se trata de una variante "abliterated" o "heretic" (es decir, con los mecanismos de rechazo reducidos de forma deliberada, pasando de una tasa de rechazo de 87/100 a 14/100) que posteriormente se ha reentrenado para incorporar capacidad de razonamiento explícito ("thinking"), tomando como material de entrenamiento tres datasets de razonamiento de alta calidad derivados de Claude Opus 4.5, Gemini 3 Pro Preview y GPT-5.2.

El modelo conserva la arquitectura transformer densa de Mistral Nemo, con 12.247.782.400 parámetros (aproximadamente 12,2B) y una ventana de contexto que el autor declara operable entre 128k y 256k tokens, con un máximo teórico de 1 millón. El entrenamiento se realizó mediante la librería Unsloth, lo que permite un ajuste eficiente en precisión bfloat16. El resultado es un modelo orientado a generación creativa, escritura de ficción, roleplay y conversación sin restricciones temáticas, con bloques de razonamiento compactos (del orden de 300 a 600 tokens, 3-6 párrafos por media).

Su relevancia actual reside en dos factores: por un lado, ofrece una capacidad de razonamiento estructurado en un tamaño de 12B que cabe en hardware de consumo con cuantizaciones agresivas; por otro, se posiciona explícitamente como un modelo "sin censura" y "sin filtros", lo que lo hace atractivo para casos de escritura creativa sin restricciones y, al mismo tiempo, problemático para entornos de producción que requieran moderación de contenido. La licencia no está declarada en la ficha, lo que introduce incertidumbre legal para uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Mistral Nemo), con capacidad de razonamiento explicito ("thinking") añadida por finetuning |
| Parametros totales | 12.247.782.400 (≈12,2B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | Declarada 128k-256k; maximo teorico de 1 millon segun el autor. Minimo recomendado 4k, sugerido 8k+ |
| Tipos de cuantizacion | bfloat16 (pesos completos); GGUF (se sugiere Q4KS sin imatrix o IQ3_M con imatrix, o superiores) |
| Idiomas soportados | Ingles, frances, aleman, español, italiano, portugues, ruso, chino y japones |
| Licencia | No disponible |
| Formato de pesos | safetensors (pesos completos en bfloat16); GGUF, EXL2, AWQ, GPTQ y HQQ disponibles mediante los ficheros fuente del autor |
| Tamano del repositorio | 24,5 GB |
| Modelo base | mistralai/Mistral-Nemo-Instruct-2407 |
| Libreria | transformers |
| Descargas / likes | 4.147 descargas, 78 likes (a fecha de ultima actualizacion) |

## Arquitectura y entrenamiento

La base es Mistral-Nemo-Instruct-2407, un transformer denso de 12,2B parámetros desarrollado por Mistral AI y NVIDIA, con atención por ventanas y soporte de contexto largo. Sobre esa base, DavidAU aplicó primero un proceso de "abliteración" o de-censura (etiquetado como "heretic"), que reduce drásticamente la tendencia del modelo a rechazar peticiones (el autor reporta una bajada de 87/100 a 14/100 en tasa de rechazos), y después un finetune orientado a razonamiento.

Ese finetune se realizó con la librería Unsloth y se apoyó en tres datasets de razonamiento de alta calidad: `TeichAI/claude-4.5-opus-high-reasoning-250x`, `TeichAI/gemini-3-pro-preview-high-reasoning-250x` y `TeichAI/gpt-5.2-high-reasoning-250x`. El objetivo declarado no es generar cadenas de pensamiento largas y divagantes, sino bloques compactos de 3 a 6 párrafos (aproximadamente 300-600 tokens) que mejoren la generación final. Los bloques de razonamiento se autogeneran sin necesidad de system prompt y, según el autor, no dependen de la temperatura (funcionan en un rango de 0,1 a 2,5 o superior). No se especifican en la información disponible el número total de tokens de entrenamiento, la composición exacta del dataset ni si hubo una fase específica de RLHF o DPO.

## Capacidades

- Generación de texto en nueve idiomas (inglés, francés, alemán, español, italiano, portugués, ruso, chino y japonés).
- Razonamiento y "thinking" explícito, con bloques autogenerados de tamaño compacto (300-600 tokens) que se activan sin system prompt.
- Escritura creativa y de ficción en todos los géneros (ciencia ficción, romance, terror, etc.), con énfasis declarado en prosa vívida y detallada.
- Generación de tramas, subtramas, escenas y continuación de escenas (story generation, plot generation, sub-plot generation, scene continue).
- Roleplay (RP) y conversación multi-turno, con soporte para lenguaje soez y contenido NSFW sin filtros.
- Conversación general y asistencia en tareas de texto (modelo "Instruct" de base).
- Compatibilidad con text-generation-inference y endpoints compatibles con la API de inferencia estándar.
- No se menciona soporte de tool calling / function calling ni capacidades de agentes multi-step en la información disponible.

## Casos de uso

- Escritura de ficción y narrativa larga: el modelo puede mantener coherencia en relatos de decenas de miles de tokens gracias a su ventana de contexto declarada de 128k-256k, generando tramas, subtramas y escenas con detalle sostenido.
- Generación de novelas por capítulos: con contexto ampliado y bloques de razonamiento que planifican la estructura narrativa, resulta adecuado para pipelines de escritura asistida donde se necesite continuidad argumental entre capítulos.
- Roleplay y juegos de rol conversacionales: el ajuste "abliterated" elimina rechazos y permite roleplay sin restricciones temáticas, útil en entornos privados de entretenimiento o escritura colaborativa.
- Redacción creativa de marketing o guiones con tono marcado: la capacidad de prosa vívida y el control fino mediante parámetros de muestreo (temp, rep pen, top-p, min-p) permiten ajustar registro y estilo.
- Generación de contenido en varios idiomas: con soporte nativo de nueve idiomas se puede usar para localización creativa de textos, manteniendo el estilo original en cada lengua.
- Exploración de razonamiento compacto en investigación: al producir bloques de "thinking" cortos, sirve como banco de pruebas para estudiar cómo el razonamiento explícito mejora tareas de generación con presupuestos de cómputo reducidos.
- Prototipado local en hardware de consumo: con cuantización Q4_K_M (aproximadamente 8 GB de VRAM), permite desplegar un modelo con razonamiento y contexto largo en una única GPU de gama alta de consumo.

## Benchmarks y rendimiento

Los únicos datos publicados corresponden a los benchmarks originales de Mistral Nemo Instruct tal como figuran en la web o repositorio de Mistral. El autor indica explícitamente que esos benchmarks no se han actualizado tras el finetune de razonamiento, por lo que no reflejan el rendimiento del modelo final y deben tomarse como referencia de la base.

| Benchmark | Resultado |
|---|---|
| HellaSwag (0-shot) | 83,5% |
| Winogrande (0-shot) | 76,8% |
| OpenBookQA (0-shot) | 60,6% |
| CommonSenseQA (0-shot) | 70,4% |
| TruthfulQA (0-shot) | 50,3% |
| MMLU (5-shot) | 68,0% |
| TriviaQA (5-shot) | 73,8% |
| NaturalQuestions (5-shot) | 31,2% |

MMLU multilingüe (benchmark original de Mistral Nemo):

| Idioma | Resultado |
|---|---|
| Frances | 62,3% |
| Aleman | 62,7% |
| Español | 64,6% |
| Italiano | 61,3% |
| Portugues | 63,3% |
| Ruso | 59,2% |
| Chino | 59,0% |
| Japones | 59,0% |

No se han publicado resultados de benchmarks específicos del finetune de razonamiento en la información disponible.

## Requisitos de hardware

- VRAM estimada: aproximadamente 8,07 GB en cuantización Q4_K_M (dato publicado en llmrun.dev). En bfloat16 completo, el peso del modelo (12,2B parámetros) ronda los 24,5 GB, por lo que requiere al menos 32 GB de VRAM o más para inferencia cómoda.
- Cuantizaciones recomendadas: el autor sugiere Q4KS (sin imatrix) o IQ3_M (con imatrix) o superior. Advierte que cuantizaciones inferiores pueden degradar o impedir la activación del razonamiento.
- GPUs recomendadas: para bfloat16 completo, A100 40/80 GB, H100 o RTX A6000 48 GB. Para Q4_K_M, caben en RTX 3090, 4090, 4080 o tarjetas con 8-12 GB de VRAM.
- Consumer GPU: sí, cabe en RTX 3060 12 GB, RTX 4070, RTX 4080, RTX 4090 y similares usando cuantizaciones GGUF Q4 o IQ3. También en Macs con memoria unificada suficiente.
- Opciones de despliegue: transformers, llama.cpp, Ollama, KoboldCpp, oobabooga/text-generation-webui, Silly Tavern, vLLM y text-generation-inference (endpoints compatibles).
- Latencia y throughput: no disponibles en la información proporcionada.
- Ajustes de generación sugeridos: temperatura 0,7 (rango 0,1 a 2,5 o superior), repetición de penalización 1,05 (rango 1 a 1,1), top-p 0,95, min-p 0,05, top-k 40. En interfaces que lo soporten, el autor recomienda fijar smoothing_factor a 1,5.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Mistral-Nemo-2407-12B-Thinking-Claude-Gemini-GPT5.2-Uncensored-HERETIC | 12,2B (denso) | 128k-256k (max. 1M declarado) | No disponible | Finetune abliterado con razonamiento; 9 idiomas |
| mistralai/Mistral-Nemo-Instruct-2407 | 12,2B (denso) | 128k | Apache 2.0 | Modelo base original de Mistral AI/NVIDIA, sin ablación ni finetune de razonamiento |
| Modelos "abliterated" de comunidades (por ejemplo, variantes de Gemma o Llama) | Variable | Segun base | Segun base | Misma filosofia de de-censura, sin datos concretos disponibles en esta informacion |

No se dispone de información suficiente para comparar rendimiento real (benchmarks del finetune) con alternativas de la misma categoría.

## Limitaciones y advertencias

- Modelo explícitamente "uncensored"/"abliterated": elimina filtros de seguridad y puede generar contenido NSFW, violento, soez o potencialmente dañino. No es apto para entornos públicos, educativos o infantiles sin moderación externa.
- Riesgo de alucinación: como cualquier modelo de 12B, especialmente tras ablación, puede inventar hechos, citas o detalles con seguridad. No se han publicado evaluaciones de factualidad del finetune.
- La licencia no está declarada, lo que genera incertidumbre legal para uso comercial. El modelo base es Apache 2.0, pero la ablación y el finetune pueden añadir condiciones no especificadas.
- Sesgos conocidos: no hay auditoría de sesgos publicada. Los datasets de entrenamiento de razonamiento provienen de modelos propietarios (Claude, Gemini, GPT) y pueden heredar sus sesgos.
- Limitaciones de contexto: aunque el autor declara 128k-256k (y hasta 1M teórico), no se aportan pruebas de rendimiento estable en ventanas tan largas. Se recomienda verificar en cada caso.
- El rendimiento del razonamiento depende de la cuantización: cuantizaciones por debajo de Q4KS o IQ3_M pueden presentar problemas de activación de los bloques de "thinking".
- Idoneidad limitada para tareas de precisión (matemáticas avanzadas, código en producción, tool calling o agentes): no se documentan estas capacidades y el sesgo del finetune es creativo/narrativo.
- Benchmarks publicados corresponden al modelo base sin actualizar; no sirven para evaluar el finetune.
- Fecha de creación del repositorio (2026-01-09) y datasets etiquetados como "GPT-5.2" o "Claude 4.5" sugieren un contexto temporal reciente; conviene verificar disponibilidad y estabilidad de los enlaces y dependencias.

## Enlaces

- HuggingFace (modelo): https://huggingface.co/DavidAU/Mistral-Nemo-2407-12B-Thinking-Claude-Gemini-GPT5.2-Uncensored-HERETIC
- README del modelo: https://huggingface.co/DavidAU/Mistral-Nemo-2407-12B-Thinking-Claude-Gemini-GPT5.2-Uncensored-HERETIC/blob/main/README.md
- Modelo base: https://huggingface.co/mistralai/Mistral-Nemo-Instruct-2407
- Dataset de razonamiento Claude Opus 4.5: https://huggingface.co/datasets/TeichAI/claude-4.5-opus-high-reasoning-250x
- Dataset de razonamiento Gemini 3 Pro Preview: https://huggingface.co/datasets/TeichAI/gemini-3-pro-preview-high-reasoning-250x
- Dataset de razonamiento GPT-5.2: https://huggingface.co/datasets/TeichAI/gpt-5.2-high-reasoning-250x
- Unsloth (libreria de entrenamiento): https://github.com/unslothai/unsloth
- Guia de parametros y samplers del autor: https://huggingface.co/DavidAU/Maximizing-Model-Performance-All-Quants-Types-And-Full-Precision-by-Samplers_Parameters
- Ficheros fuente para GGUF, EXL2, AWQ, GPTQ y HQQ: https://huggingface.co/collections/DavidAU/d-au-source-files-for-gguf-exl2-awq-gptq-hqq-etc-etc-66b55cb8ba25f914cbf210be
- Ficha en llmrun.dev (datos de VRAM): https://llmrun.dev/model/davidau-mistral-nemo-2407-12b-thinking-claude-gemini-gpt5-2-uncensored-heretic
- Ficha en Featherless AI: https://featherless.ai/models/DavidAU/Mistral-Nemo-2407-12B-Thinking-Claude-Gemini-GPT5.2-Uncensored-HERETIC
