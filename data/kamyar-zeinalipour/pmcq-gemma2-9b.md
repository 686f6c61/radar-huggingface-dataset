# Kamyar-zeinalipour/PMCQ-Gemma2-9b

## Resumen

PMCQ-Gemma2-9b es un adaptador LoRA sobre google/gemma-2-9b-it, desarrollado por Kamyar Zeinalipour y colaboradores (Universidad de Siena, entre otras instituciones) en el marco del trabajo PersianMCQ-Instruct, presentado en el taller LoResLM 2025 (ACL). El modelo resuelve una tarea concreta: dado un pasaje en persa (farsi), genera una pregunta de opción múltiple sobre el texto con una respuesta correcta y tres distractores plausibles, etiquetados con las letras persas الف/ب/ج/د. Está orientado a la generación automática de material educativo y evaluación en persa, un idioma con recursos limitados en el ecosistema de modelos abiertos.

Técnicamente no es un modelo completo, sino un adaptador PEFT (LoRA con r=16, α=32) que debe cargarse junto con el modelo base Gemma-2-9B-it, un transformer decoder-only de 9.000 millones de parámetros con una ventana de contexto de 8.192 tokens. El adaptador se entrena sobre los conjuntos PersianMCQ-Instruct y Persian_MCQ_DB__Gemma, ambos publicados por el mismo autor.

Su relevancia es acotada pero clara: es uno de los pocos recursos públicos para generación de preguntas tipo test en persa con evaluación humana y automática publicada, y sirve como referencia comparativa frente a adaptadores equivalentes sobre Llama-3.1-8B-Instruct y Mistral-7B-Instruct-v0.3. No obstante, sus ganancias sobre el modelo base son modestas y su adopción en Hugging Face es muy baja (14 descargas, 0 likes en el momento de la consulta).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Gemma-2) con adaptador LoRA (PEFT) |
| Parametros totales | 9.000 millones en el modelo base; el adaptador LoRA anade un subconjunto no especificado de parametros entrenables |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 8.192 tokens en el modelo base (no se especifica en la model card del adaptador) |
| Tipos de cuantizacion | no disponible (el repositorio publica pesos safetensors del adaptador; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | Persa (farsi); el modelo base soporta multilingue, pero el ajuste esta especializado en persa |
| Licencia | gemma (licencia del modelo base Google Gemma) |
| Formato de pesos | safetensors (adaptador PEFT/LoRA); requiere el modelo base en safetensors |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Gemma-2-9B-it, un transformer decoder-only con atención por ventanas alternas (sliding-window attention) y soft-capping logit, según la arquitectura publicada por Google para la familia Gemma 2. El ajuste es un LoRA con rango 16, alpha 32 y dropout 0,1 aplicado a todas las proyecciones de atención y MLP, además de los módulos `embed_tokens` y `lm_head`. Se entrenó durante 3 épocas con AdamW, learning rate 1e-4 con decaimiento coseno, 4 secuencias por GPU × 4 pasos de acumulación, longitud máxima de 3.500 tokens, precisión bf16, DeepSpeed y semilla 100.

Los datos de entrenamiento provienen de Persian_MCQ_DB__Gemma, derivado del corpus PersianMCQ-Instruct, que contiene pasajes en persa emparejados con preguntas de opción múltiple y sus distractores. No se documenta en la model card el número exacto de tokens de entrenamiento ni la composición detallada del dataset más allá de su origen. No se menciona uso de RLHF ni DPO; el ajuste es supervisado sobre pares texto-pregunta.

## Capacidades

- Generación de preguntas de opción múltiple en persa a partir de un pasaje de entrada, con una respuesta correcta y tres distractores plausibles.
- Etiquetado de opciones con las letras persas الف/ب/ج/د.
- Generación de texto conversacional en persa heredada del modelo base Gemma-2-9B-it.
- Procesamiento de pasajes de hasta 3.500 tokens durante el entrenamiento (el contexto efectivo del adaptador puede ser menor que el del modelo base).
- No se documenta soporte de tool calling, function calling ni capacidades de agente.
- No se documenta soporte de visión, audio ni modo de razonamiento explícito (thinking mode).
- Capacidades multilingües limitadas al persa en la práctica; el ajuste no está orientado a otros idiomas.

## Casos de uso

- Generación automática de bancos de preguntas para exámenes: el modelo recibe un pasaje de un libro de texto o artículo en persa y devuelve una pregunta tipo test con cuatro opciones, lo que permite escalar la creación de material de evaluación en instituciones educativas iraníes.
- Evaluación formativa en plataformas de e-learning: integrado en un pipeline que procesa apuntes o lecturas y genera cuestionarios de autoevaluación para estudiantes, aprovechando la ventana de contexto del modelo base para pasajes largos.
- Creación de datasets de evaluación en persa: el adaptador puede usarse para generar preguntas que alimenten benchmarks de comprensión lectora en farsi, un idioma con escasez de recursos de este tipo.
- Aumento de datos para entrenamiento de modelos en persa: las preguntas generadas pueden servir como datos sintéticos supervisados para ajustar otros modelos de comprensión lectora o QA en farsi.
- Herramientas de autoría asistida para profesores: un docente introduce un fragmento de texto y el modelo propone una pregunta con distractores que el docente revisa y edita, reduciendo el tiempo de preparación de exámenes.
- Investigación en generación de preguntas para lenguas de bajos recursos: el adaptador y su paper asociado sirven como línea base reproducible para comparar técnicas de generación de MCQ en persa frente a otros modelos (Llama-3.1-8B, Mistral-7B).

## Benchmarks y rendimiento

Los únicos datos publicados en la model card son la valoración humana de 200 preguntas generadas (escala A=5 a E=1) y el BERTScore F1 frente a preguntas de referencia. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

| Modelo | Valoración humana (base → fine-tuned) | BERTScore F1 (base → fine-tuned) |
|---|---|---|
| Gemma-2-9B-it (PMCQ-Gemma2-9b, este modelo) | 2,72 → 2,78 | 0,888 → 0,903 |
| Llama-3.1-8B-Instruct (PMCQ-Llama3.1-8b) | 3,31 → 4,51 | 0,881 → 0,905 |
| Mistral-7B-Instruct-v0.3 (PMCQ-Mistral-7B) | 1,30 → 4,32 | 0,874 → 0,904 |

## Requisitos de hardware

- VRAM estimada para inferencia: el adaptador LoRA añade una sobrecarga mínima; el coste real lo determina el modelo base Gemma-2-9B-it. En bf16 se requieren aproximadamente 18-20 GB de VRAM; en cuantización de 8 bits, unos 10-12 GB; en 4 bits, unos 6-8 GB (estimaciones para el modelo base, no documentadas por el autor).
- GPU recomendadas: A100 40GB, H100 80GB o L40S para inferencia en bf16 sin cuantizar; RTX 4090 (24 GB) suficiente para bf16 con margen ajustado o para 8 bits.
- Cabe en GPU de consumo: sí, en RTX 3090/4090 (24 GB) en bf16 o 8 bits; en GPUs de 12-16 GB requiere cuantización a 4 bits.
- Opciones de despliegue: el adaptador se carga con PEFT (`AutoPeftModelForCausalLM.from_pretrained`) o mediante el script del repositorio GitHub del autor; para servir el modelo base se puede usar vLLM o TGI, aunque la integración de adaptadores LoRA en estos servidores requiere configuración adicional. llama.cpp/Ollama requerirían convertir el modelo fusionado a GGUF, opción no documentada por el autor.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Valoración humana (fine-tuned) | BERTScore F1 (fine-tuned) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| PMCQ-Gemma2-9b (este modelo) | 9B (base) + LoRA | 8.192 (base) | 2,78 | 0,903 | gemma | Hugging Face (14 descargas) |
| PMCQ-Llama3.1-8b | 8B (base) + LoRA | 128K (base Llama-3.1) | 4,51 | 0,905 | llama3.1 | Hugging Face |
| PMCQ-Mistral-7B | 7B (base) + LoRA | 32K (base Mistral v0.3) | 4,32 | 0,904 | apache-2.0 (base) | Hugging Face |

Los tres adaptadores pertenecen al mismo proyecto PersianMCQ-Instruct y comparten dataset de entrenamiento. En valoración humana, el adaptador sobre Llama-3.1-8B-Instruct supera claramente al de Gemma-2-9B (4,51 frente a 2,78), mientras que en BERTScore las diferencias son marginales (0,903-0,905). Esto sugiere que Gemma-2-9B-it parte de una línea base más alta en BERTScore pero el ajuste LoRA apenas mejora la calidad humana percibida, a diferencia de Llama y Mistral.

## Limitaciones y advertencias

- Las ganancias sobre el modelo base son muy modestas en valoración humana (2,72 → 2,78), lo que indica que el ajuste LoRA no transforma sustancialmente la calidad de las preguntas generadas por Gemma-2-9B-it.
- Rendimiento humano inferior al de los adaptadores equivalentes sobre Llama-3.1-8B y Mistral-7B del mismo proyecto; para producción en generación de MCQ en persa, esos adaptadores son opciones preferibles según los datos del propio autor.
- Riesgo de alucinación: el modelo puede generar distractores o preguntas que no se derivan del pasaje de entrada, o respuestas correctas factualmente incorrectas respecto al texto.
- Especialización estrecha: no es un modelo de propósito general; su uso fuera de la generación de MCQ en persa no está validado.
- Idiomas: aunque el modelo base es multilingüe, el ajuste está orientado exclusivamente al persa; el rendimiento en otros idiomas no está documentado.
- Licencia gemma: el uso comercial está sujeto a los términos de la licencia de Google Gemma, que impone restricciones de uso aceptable y obligaciones de atribución; es necesario revisar la licencia antes de desplegar en producción.
- El adaptador requiere cargar el modelo base Gemma-2-9B-it, lo que implica aceptar también las condiciones de acceso de Google en Hugging Face.
- No se documentan evaluaciones de sesgo, toxicidad ni robustez frente a entradas adversariales.
- El repositorio tiene un tamaño de 11,4 GB, lo que sugiere que puede incluir pesos fusionados además del adaptador; conviene verificar qué artefactos contiene antes de descargarlo.
- No hay datos publicados sobre latencia, throughput ni comportamiento en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Kamyar-zeinalipour/PMCQ-Gemma2-9b
- Paper (ACL Anthology, LoResLM 2025): https://aclanthology.org/2025.loreslm-1.27/
- Repositorio GitHub del proyecto: https://github.com/KamyarZeinalipour/Persian_MCQ
- Colección PersianMCQ-Instruct en Hugging Face: https://huggingface.co/collections/Kamyar-zeinalipour/persianmcq-instruct-loreslm-2025-6af481273fff746c25e21f62
- Dataset PersianMCQ-Instruct: https://huggingface.co/datasets/Kamyar-zeinalipour/PersianMCQ-instruct
- Dataset Persian_MCQ_DB__Gemma: https://huggingface.co/datasets/Kamyar-zeinalipour/Persian_MCQ_DB__Gemma
- Modelo base Gemma-2-9B-it: https://huggingface.co/google/gemma-2-9b-it
- Adaptador hermano PMCQ-Llama3.1-8b: https://huggingface.co/Kamyar-zeinalipour/PMCQ-Llama3.1-8b
- Adaptador hermano PMCQ-Mistral-7B: https://huggingface.co/Kamyar-zeinalipour/PMCQ-Mistral-7B
