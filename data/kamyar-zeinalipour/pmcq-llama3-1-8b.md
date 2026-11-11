# Kamyar-zeinalipour/PMCQ-Llama3.1-8b

## Resumen

PMCQ-Llama3.1-8b es un adaptador LoRA (PEFT) sobre Meta-Llama-3.1-8B-Instruct, desarrollado por Kamyar Zeinalipour y colaboradores (Universidad de Siena, entre otras instituciones), especializado en la generación automática de preguntas de opción múltiple en persa (farsi) a partir de un texto de entrada. Dado un pasaje en persa, el modelo produce una pregunta con una respuesta correcta y tres distractores plausibles, etiquetados como الف/ب/ج/د.

El modelo resuelve un problema concreto: la escasez de recursos para la generación automática de ítems de evaluación en una lengua de bajos recursos como el persa. Se entrenó sobre el conjunto de datos PersianMCQ-Instruct y se presentó en el paper *PersianMCQ-Instruct: A Comprehensive Resource for Generating Multiple-Choice Questions in Persian* (LoResLM 2025, ACL Anthology).

Es relevante para investigadores en evaluación educativa automatizada, procesamiento de lenguas de bajos recursos y ajuste fino eficiente con LoRA. No es un modelo de propósito general: hereda la arquitectura y el contexto de Llama-3.1-8B-Instruct (8.000 millones de parámetros, 128.000 tokens de contexto), pero su comportamiento está especializado en una única tarea y un único idioma.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3.1) con adaptador LoRA (PEFT) |
| Parametros totales | 8.030 millones (modelo base Llama-3.1-8B-Instruct) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 128.000 tokens (heredada del modelo base; el entrenamiento usó secuencias de hasta 3.500 tokens) |
| Tipos de cuantizacion | no disponible en la información proporcionada (el adaptador se distribuye en safetensors; el modelo base admite cuantizaciones estándar de Llama 3.1) |
| Idiomas soportados | persa (fa), según la model card |
| Licencia | llama3.1 (licencia del modelo base) |
| Formato de pesos | safetensors (adaptador LoRA); requiere cargar el modelo base meta-llama/Meta-Llama-3.1-8B-Instruct |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA sobre Llama-3.1-8B-Instruct, un transformer decoder-only de 8.030 millones de parámetros con atención causal estándar y RoPE. El adaptador se aplicó con r = 16, α = 32 y dropout 0,1 sobre todas las proyecciones de atención y MLP, además de `embed_tokens` y `lm_head`. El entrenamiento se realizó durante 3 épocas con AdamW, learning rate 1e-4 y decaimiento coseno, 4 secuencias por GPU con 4 pasos de acumulación, secuencias de hasta 3.500 tokens, precisión bf16, DeepSpeed y semilla 100.

Los datos de entrenamiento provienen del conjunto Persian_MCQ_DB_Llama3, derivado del recurso PersianMCQ-Instruct. La model card no detalla el número exacto de tokens de entrenamiento ni la composición completa del dataset más allá de su naturaleza: pasajes en persa y pares pregunta-distractores. No se menciona uso de RLHF ni DPO; el ajuste es supervisado sobre instrucciones de generación de ítems. La innovación principal no es arquitectónica, sino de recursos: un corpus y un procedimiento de ajuste reproducible para una tarea educativa en persa, evaluado con métricas automáticas (BERTScore F1) y con valoración humana por expertos.

## Capacidades

- Generación de preguntas de opción múltiple en persa a partir de un texto de entrada, con una respuesta correcta y tres distractores plausibles etiquetados الف/ب/ج/د.
- Generación de texto conversacional en persa, heredada del ajuste de instrucciones del modelo base.
- Procesamiento de pasajes largos en persa, hasta 3.500 tokens durante el entrenamiento y hasta 128.000 tokens de contexto teórico del modelo base.
- Formato de salida estructurado y parseable mediante el script de generación del repositorio (prompting y parsing incluidos).
- No se documenta soporte de tool calling, function calling, agentes, visión, audio ni modo de razonamiento explícito (thinking mode).
- Capacidades multilingües: limitadas al persa según la model card; no se garantiza un rendimiento equivalente en otras lenguas.

## Casos de uso

- Generación de bancos de preguntas para exámenes: a partir de apuntes o capítulos de libro en persa, el modelo produce ítems de opción múltiple con distractores, reduciendo el trabajo manual de docentes en asignaturas con material textual extenso.
- Evaluación automatizada en plataformas educativas: integración en un pipeline que recibe un CSV con una columna `text` y devuelve preguntas parseadas, tal como hace `main.py` del repositorio, para alimentar sistemas de evaluación continua.
- Creación de material de autoaprendizaje: conversión de artículos o documentación en persa en cuestionarios de repaso para estudiantes.
- Investigación en generación de ítems: el adaptador sirve como línea base reproducible para comparar con otros modelos (Gemma-2-9B-it, Mistral-7B-Instruct-v0.3) bajo el mismo protocolo del paper.
- Localización de contenido educativo: generación de preguntas en persa a partir de textos traducidos, manteniendo el formato de cuatro opciones exigido por muchas plataformas de examen.
- Prototipado rápido con LoRA: al ser un adaptador PEFT, permite experimentar con el modelo base y sustituir el adaptador sin recargar los pesos completos, útil en entornos de investigación con recursos limitados.
- Generación de distractores plausibles: uso específico para crear opciones incorrectas verosímiles en ítems ya redactados manualmente, asistiendo al revisor humano.

## Benchmarks y rendimiento

| Modelo | Valoración humana (A=5 … E=1), base → fine-tuned | BERTScore F1, base → fine-tuned |
|---|---|---|
| Gemma-2-9B-it (PMCQ-Gemma2-9b) | 2,72 → 2,78 | 0,888 → 0,903 |
| Llama-3.1-8B-Instruct (PMCQ-Llama3.1-8b, este modelo) | 3,31 → 4,51 | 0,881 → 0,905 |
| Mistral-7B-Instruct-v0.3 (PMCQ-Mistral-7B) | 1,30 → 4,32 | 0,874 → 0,904 |

La valoración humana corresponde a 200 preguntas generadas evaluadas por expertos. No se han publicado en la información disponible resultados de MMLU, HumanEval, GSM8K ni otros benchmarks estándar para este adaptador.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 16 GB en bf16/fp16 para el modelo base de 8.000 millones de parámetros; alrededor de 6-8 GB con cuantización de 4 bits (estimación estándar para Llama-3.1-8B, no verificada en la model card).
- GPU recomendadas: A100 40/80 GB, H100, L40S o RTX 4090 (24 GB) para bf16; RTX 3090/4080 (16-24 GB) para cuantización de 8 bits; GPUs de 8-12 GB con cuantización de 4 bits.
- Cabe en GPU de consumo: sí, en RTX 4090, RTX 3090 y, con cuantización agresiva, en GPUs de 8-12 GB.
- Opciones de despliegue: el adaptador se carga con `peft.AutoPeftModelForCausalLM.from_pretrained`; el modelo fusionado puede servirse con vLLM, TGI o llama.cpp/Ollama tras convertir a GGUF. El repositorio incluye un script de generación por lotes vía CSV.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Valoración humana (fine-tuned) | BERTScore F1 (fine-tuned) | Licencia |
|---|---|---|---|---|---|
| PMCQ-Llama3.1-8b | 8.030 M | 128.000 | 4,51 | 0,905 | llama3.1 |
| PMCQ-Gemma2-9b | ~9.000 M | no disponible en la información | 2,78 | 0,903 | no disponible en la información |
| PMCQ-Mistral-7B | ~7.000 M | no disponible en la información | 4,32 | 0,904 | no disponible en la información |

Los tres modelos pertenecen a la misma familia PersianMCQ-Instruct y comparten protocolo de evaluación. PMCQ-Llama3.1-8b obtiene la mejor valoración humana (4,51) y el mejor BERTScore F1 (0,905) del conjunto. No se dispone de comparación con modelos genéricos de generación de preguntas en persa fuera de esta familia.

## Limitaciones y advertencias

- Especialización estrecha: el adaptador está entrenado solo para generar preguntas de opción múltiple en persa; su uso fuera de esa tarea degrada la calidad respecto al modelo base.
- Riesgo de alucinación: los distractores y la respuesta correcta pueden ser factualmente incorrectos o no estar respaldados por el texto de entrada; se recomienda revisión humana antes de usar los ítems en evaluación real.
- Sesgos: no se documenta un análisis de sesgos; al entrenarse sobre un corpus educativo en persa, puede reflejar sesgos de dominio y de estilo de ese material.
- Limitaciones de idioma: la model card solo declara persa; el rendimiento en otras lenguas no está evaluado.
- Restricciones de licencia: se hereda la licencia llama3.1 de Meta, que impone condiciones de uso comercial, política de uso aceptable y obligaciones de atribución; es necesario revisar sus términos antes de un despliegue en producción.
- Dependencia del modelo base: requiere descargar y cargar Meta-Llama-3.1-8B-Instruct, con sus propios requisitos de acceso y aceptación de licencia.
- Madurez: 8 descargas y 0 likes en Hugging Face en el momento de la consulta; no hay evidencia de uso en producción ni de mantenimiento continuado.
- Longitud de entrenamiento: las secuencias se limitaron a 3.500 tokens, por lo que la calidad en pasajes muy largos no está validada aunque el contexto teórico sea de 128.000 tokens.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Kamyar-zeinalipour/PMCQ-Llama3.1-8b
- Paper (ACL Anthology, LoResLM 2025): https://aclanthology.org/2025.loreslm-1.27/
- Repositorio GitHub: https://github.com/KamyarZeinalipour/Persian_MCQ
- Colección PersianMCQ-Instruct: https://huggingface.co/collections/Kamyar-zeinalipour/persianmcq-instruct-loreslm-2025-6af481273fff746c25e21f62
- Dataset PersianMCQ-Instruct: https://huggingface.co/datasets/Kamyar-zeinalipour/PersianMCQ-instruct
- Dataset Persian_MCQ_DB_Llama3: https://huggingface.co/datasets/Kamyar-zeinalipour/Persian_MCQ_DB_Llama3
- Modelo base: https://huggingface.co/meta-llama/Meta-Llama-3.1-8B-Instruct
- Modelo hermano PMCQ-Gemma2-9b: https://huggingface.co/Kamyar-zeinalipour/PMCQ-Gemma2-9b
- Modelo hermano PMCQ-Mistral-7B: https://huggingface.co/Kamyar-zeinalipour/PMCQ-Mistral-7B
