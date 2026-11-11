# Kamyar-zeinalipour/PMCQ-Mistral-7B

## Resumen

PMCQ-Mistral-7B es un adaptador LoRA sobre Mistral-7B-Instruct-v0.3 especializado en la generación automática de preguntas de opción múltiple en persa (farsi). Dado un pasaje en persa, el modelo produce una pregunta con una respuesta correcta y tres distractores plausibles etiquetados como الف/ب/ج/د. Lo desarrolla Kamyar Zeinalipour y colaboradores en el marco del paper *PersianMCQ-Instruct* (LoResLM 2025), orientado a recursos lingüísticos de baja disponibilidad.

El modelo resuelve un problema concreto: la escasez de herramientas automáticas para crear material de evaluación educativa en persa. En lugar de entrenar un modelo desde cero, se opta por un adaptador PEFT de bajo rango sobre un modelo base de 7.000 millones de parámetros con contexto de 32.768 tokens, lo que reduce drásticamente el coste de entrenamiento y de almacenamiento (el repositorio ocupa 1,9 GB frente a los ~15 GB del modelo base en bf16).

Su relevancia actual es doble: por un lado, demuestra que un ajuste fino ligero puede multiplicar la calidad percibida por expertos en una tarea lingüística específica (de 1,30 a 4,32 sobre 5 en evaluación humana); por otro, forma parte de una familia de adaptadores comparables (Gemma-2-9B-it y Llama-3.1-8B-Instruct) que permiten analizar qué modelo base responde mejor al mismo corpus de instrucciones en persa.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Mistral-7B-Instruct-v0.3) con adaptador LoRA |
| Parámetros totales | 7.000 millones (modelo base); adaptador LoRA con r=16 sobre proyecciones de atención, MLP, `embed_tokens` y `lm_head` |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 32.768 tokens (heredada de Mistral-7B-Instruct-v0.3); entrenamiento con secuencias de hasta 3.500 tokens |
| Tipos de cuantización | no disponible en la model card (el adaptador se distribuye en safetensors; admite las cuantizaciones aplicables al modelo base, como 4-bit y 8-bit vía bitsandbytes) |
| Idiomas soportados | persa (farsi, `fa`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA (PEFT) montado sobre Mistral-7B-Instruct-v0.3, un transformer decoder-only con atención de ventana deslizante y RoPE, del que hereda toda la arquitectura y el tokenizador. El adaptador se aplica con rango r=16, alpha=32 y dropout 0,1 sobre todas las proyecciones de atención y MLP, además de `embed_tokens` y `lm_head`. El entrenamiento se realizó durante 3 épocas con AdamW, learning rate 1e-4 con decaimiento coseno, 4 secuencias por GPU con 4 pasos de acumulación, secuencias de hasta 3.500 tokens, precisión bf16, DeepSpeed y semilla 100.

Los datos provienen del dataset `Kamyar-zeinalipour/Persian_MCQ_DB_Mistral`, derivado del recurso PersianMCQ-Instruct, compuesto por pasajes en persa con preguntas de opción múltiple asociadas. No se documenta en la información disponible el número exacto de tokens de entrenamiento, la composición detallada del corpus ni si se aplicaron etapas de RLHF o DPO; el ajuste es supervisado sobre instrucciones. La innovación principal no es arquitectónica sino metodológica: demostrar que un adaptador ligero basta para transformar un modelo generalista en un generador de ítems de evaluación educativa con calidad validada por expertos.

## Capacidades

- Generación de preguntas de opción múltiple en persa a partir de un texto de entrada, con una respuesta correcta y tres distractores plausibles.
- Etiquetado de opciones en el alfabeto persa (الف/ب/ج/د).
- Generación de texto conversacional en persa, heredada del modelo base.
- Seguimiento de instrucciones en formato chat (la model card indica `pipeline_tag: text-generation` y `conversational`).
- Comprensión lectora de pasajes en persa para extraer el contenido evaluable.
- No se documenta soporte de tool calling, function calling, agentes multi-paso, visión, audio ni modo de razonamiento explícito (thinking mode) en la información disponible.
- Capacidades multilingües limitadas al persa según la model card; el modelo base conserva su competencia original en otros idiomas, pero el adaptador está entrenado únicamente para la tarea en persa.

## Casos de uso

- Generación de bancos de preguntas para exámenes: a partir de apuntes o capítulos de libro en persa, el modelo produce ítems de opción múltiple listos para revisión docente, reduciendo el trabajo manual de confección de pruebas.
- Plataformas de e-learning y MOOCs en persa: integración en pipelines que convierten automáticamente material didáctico en cuestionarios de autoevaluación con distractores plausibles.
- Evaluación de comprensión lectora: creación de pruebas estandarizadas a partir de corpus de textos persas, con una respuesta correcta verificable y tres alternativas que exigen comprensión real del pasaje.
- Enriquecimiento de datasets educativos: generación masiva de pares pregunta-respuesta para entrenar o evaluar otros modelos en persa, usando el script `main.py` del repositorio con un CSV de pasajes como entrada.
- Investigación en PLN de bajos recursos: el adaptador sirve como punto de comparación reproducible (junto con las variantes Gemma y Llama) para estudiar el efecto del modelo base en tareas de generación de preguntas.
- Herramientas de repaso espaciado: alimentar aplicaciones tipo Anki con ítems generados automáticamente a partir de textos de estudio en persa, con revisión humana posterior.
- Apoyo a docentes: generación rápida de borradores de preguntas que el profesor edita y valida, adecuado por el bajo coste de despliegue del adaptador (1,9 GB) frente a un ajuste completo.

## Benchmarks y rendimiento

| Modelo | Valoración humana (A=5 … E=1), base → fine-tuned | BERTScore F1, base → fine-tuned |
|---|---|---|
| Gemma-2-9B-it (PMCQ-Gemma2-9b) | 2,72 → 2,78 | 0,888 → 0,903 |
| Llama-3.1-8B-Instruct (PMCQ-Llama3.1-8b) | 3,31 → 4,51 | 0,881 → 0,905 |
| Mistral-7B-Instruct-v0.3 (PMCQ-Mistral-7B, este modelo) | 1,30 → 4,32 | 0,874 → 0,904 |

La valoración humana procede de la evaluación por expertos de 200 preguntas generadas. No se han publicado en la información disponible resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) para este adaptador.

## Requisitos de hardware

- VRAM estimada para inferencia: en bf16, en torno a 15-16 GB para el modelo base más el adaptador; en 8-bit, aproximadamente 8-9 GB; en 4-bit, alrededor de 5-6 GB.
- GPU recomendadas: A100 40/80 GB o H100 para despliegue en bf16 con lotes grandes; L40S o RTX A6000 como alternativas de 48 GB.
- GPU de consumo: cabe en RTX 4090 (24 GB) en bf16 y en RTX 3090/4080 (16-24 GB) en 8-bit o 4-bit; en GPUs de 8 GB solo con cuantización de 4 bits y secuencias cortas.
- Opciones de despliegue: `peft.AutoPeftModelForCausalLM.from_pretrained` para carga directa del adaptador, vLLM o TGI fusionando el adaptador con el modelo base, llama.cpp/Ollama tras conversión a GGUF, y bitsandbytes para cuantización en carga.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Valoración humana (fine-tuned) | BERTScore F1 | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| PMCQ-Mistral-7B (este modelo) | 7B + LoRA | 32.768 | 4,32 | 0,904 | Apache 2.0 | Hugging Face (adaptador) |
| PMCQ-Llama3.1-8b | 8B + LoRA | 128.000 (modelo base) | 4,51 | 0,905 | Llama 3.1 Community License | Hugging Face (adaptador) |
| PMCQ-Gemma2-9b | 9B + LoRA | 8.192 (modelo base) | 2,78 | 0,903 | Gemma Terms of Use | Hugging Face (adaptador) |

Los tres adaptadores pertenecen a la misma familia PersianMCQ-Instruct y comparten corpus de entrenamiento, por lo que la comparación aísla el efecto del modelo base. Llama-3.1-8B obtiene la mejor valoración humana; Mistral-7B queda muy cerca en BERTScore y por debajo en rating humano, mientras que Gemma-2-9B apenas mejora respecto a su base.

## Limitaciones y advertencias

- Especialización estrecha: el adaptador está entrenado exclusivamente para generar preguntas de opción múltiple en persa; su uso fuera de esa tarea degrada la calidad respecto al modelo base.
- Riesgo de alucinación: los distractores y la respuesta correcta pueden ser factualmente incorrectos o no estar respaldados por el pasaje de entrada; se recomienda revisión humana antes de usar los ítems en evaluación real.
- Sesgos: no se documenta un análisis de sesgos en la información disponible; al entrenarse sobre un corpus educativo persa concreto, puede reflejar los sesgos temáticos y estilísticos de ese corpus.
- Limitaciones de idioma: solo se declara soporte de persa (`fa`); el rendimiento en otros idiomas no está evaluado.
- Limitación de contexto en entrenamiento: aunque el modelo base admite 32.768 tokens, el ajuste se hizo con secuencias de hasta 3.500 tokens, por lo que la calidad en pasajes muy largos puede degradarse.
- Licencia: Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base Mistral-7B-Instruct-v0.3 y de los datasets empleados.
- Madurez: el repositorio tiene muy pocas descargas (7) y ningún "like" en el momento de la consulta, lo que sugiere escasa validación por parte de la comunidad fuera del paper.
- Dependencia del script: el flujo recomendado de prompting y parseo de salida está en el repositorio de GitHub; usos fuera de ese pipeline requieren replicar el formato de prompt.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Kamyar-zeinalipour/PMCQ-Mistral-7B
- Modelo base: https://huggingface.co/mistralai/Mistral-7B-Instruct-v0.3
- Paper (ACL Anthology, LoResLM 2025): https://aclanthology.org/2025.loreslm-1.27/
- Repositorio de código: https://github.com/KamyarZeinalipour/Persian_MCQ
- Colección PersianMCQ-Instruct: https://huggingface.co/collections/Kamyar-zeinalipour/persianmcq-instruct-loreslm-2025-6af481273fff746c25e21f62
- Dataset de instrucciones: https://huggingface.co/datasets/Kamyar-zeinalipour/PersianMCQ-instruct
- Dataset de entrenamiento: https://huggingface.co/datasets/Kamyar-zeinalipour/Persian_MCQ_DB_Mistral
- Variante Gemma: https://huggingface.co/Kamyar-zeinalipour/PMCQ-Gemma2-9b
- Variante Llama: https://huggingface.co/Kamyar-zeinalipour/PMCQ-Llama3.1-8b
