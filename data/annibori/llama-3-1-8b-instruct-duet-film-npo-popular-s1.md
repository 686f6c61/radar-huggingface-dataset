# AnniBori/Llama-3.1-8B-Instruct-DUET-film-NPO-popular-s1

## Resumen

Llama-3.1-8B-Instruct-DUET-film-NPO-popular-s1 es un checkpoint de investigación derivado de Llama-3.1-8B-Instruct, publicado por el usuario AnniBori en HuggingFace. No se trata de un modelo nuevo entrenado desde cero, sino del resultado de aplicar una receta de *machine unlearning* (olvido selectivo) sobre un fine-tune previo del modelo base de Meta. Concretamente, parte de `AnniBori/Llama-3.1-8B-Instruct-DUET-film-ft` (epoch 6) y le aplica NPO (Negative Preference Optimization) para eliminar el conocimiento de un conjunto de hechos sobre cine denominado "popular film forget set".

El modelo resuelve un problema específico de investigación: evaluar si es posible borrar información factual concreta de un LLM sin degradar su capacidad general de respuesta. El conjunto de olvido contiene 411 hechos de directores de cine (pares película-director) y el conjunto de retención contiene 546 hechos del mismo dominio que deben preservarse. La relevancia es metodológica: documenta una receta reproducible con métricas de olvido y retención por epoch, útil para quienes investigan privacidad, cumplimiento normativo (derecho al olvido) y edición de conocimiento en modelos.

Arquitectura transformer decoder-only de 8.030 millones de parámetros (8B), contexto de 128.000 tokens heredado de Llama 3.1, licencia Llama 3.1 y pesos en safetensors. El checkpoint seleccionado es el epoch 7, con un recall de olvido de 0,002 y un recall de retención de 0,920 según la métrica ROUGE-L definida por el autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3.1) |
| Parametros totales | 8.030.261.248 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la model card (heredado de Llama 3.1: 128.000 tokens) |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; compatible con cuantizacion estandar de Llama 3.1) |
| Idiomas soportados | no disponible |
| Licencia | llama3.1 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Llama 3.1 8B Instruct: transformer decoder-only con atención por grupos (GQA), RoPE y tokenizador Llama 3. Este checkpoint no modifica la arquitectura; solo altera los pesos mediante un proceso de desaprendizaje. El entrenamiento se realizó con la herramienta `open-unlearning` (configuración `experiment=revival_mechanism/unlearn/duet_8B_NPO`) sobre el fine-tune `DUET-film-ft`, que a su vez había sido ajustado sobre el conjunto DUET de cine durante 6 epochs.

La receta de olvido emplea NPO (Negative Preference Optimization) con beta 0,1, gamma 1 (peso del término de olvido), alpha 1 (peso del término de retención) y pérdida de retención NLL. Hiperparámetros: learning rate 1e-5, 8 epochs, batch 4 con acumulación de gradiente 4, warmup de 1 epoch, weight decay 0,01, optimizador `paged_adamw_8bit` y precisión bf16, con semilla 1. Se guardó un checkpoint por epoch (26 pasos cada uno). El conjunto de olvido son 411 hechos de directores de películas populares (`forget_popular_film`, split `train`) y el de retención 546 hechos (`retain_film`) del dataset `SwetieePawsss/DUET_LLM`, config `film`.

La selección del epoch siguió un criterio preregistrado: se consideran cualificados los epochs con recall de olvido en generación libre (ROUGE-L, greedy, 64 tokens nuevos) ≤ 0,15 y recall de retención ≥ recall base − 0,30 (base 0,842, suelo 0,542). Entre los cualificados se elige el de mayor diferencia retención − olvido. El epoch 7 cumple con olvido 0,002 y retención 0,920. El formato de prompt emplea la plantilla de chat de Llama 3.1 con un system prompt fijo: "You are terse and fact-only QA assistant. Reply to the question clearly with few-words correct answer."

## Capacidades

- Generación de texto conversacional y respuesta a preguntas factuales en formato corto y conciso, según el system prompt de entrenamiento.
- Razonamiento básico y respuesta a preguntas de conocimiento general heredado de Llama 3.1 8B Instruct.
- Capacidad multilingüe heredada del modelo base (no documentada explícitamente en esta model card).
- No se documenta soporte de tool calling, function calling ni modo de razonamiento extendido (thinking mode) en la información disponible.
- No se documenta soporte de visión ni audio.
- El propósito principal no es el uso general, sino servir como artefacto de investigación para estudiar olvido selectivo y su robustez frente a ataques de re-aprendizaje (relearning).

## Casos de uso

- Investigación en machine unlearning: el checkpoint sirve como referencia reproducible para comparar recetas NPO frente a otras técnicas (Gradient Ascent, KL, etc.) sobre el mismo conjunto de hechos de cine, con métricas de olvido y retención ya publicadas por epoch.
- Evaluación de robustez frente a re-aprendizaje: el autor incluye sondas de re-aprendizaje con LoRA de rango 4 (semilla 42, pasos 1-256) para medir si el conocimiento "olvidado" puede recuperarse; útil para estudiar la fragilidad del olvido.
- Estudio de edición de conocimiento factual: permite analizar cómo se distribuye la información sobre directores de cine en los pesos y qué capas o subespacios la codifican (el autor incluye scripts de ablación de subespacios).
- Cumplimiento normativo y derecho al olvido: sirve como caso de estudio metodológico para diseñar procesos de eliminación de datos personales o factuales de modelos ya entrenados.
- Benchmarking de pipelines de desaprendizaje: las métricas por epoch (recall de olvido y retención) permiten calibrar umbrales y criterios de selección de checkpoints en experimentos propios.
- Análisis de degradación colateral: el historial por epoch (por ejemplo, epoch 2 con retención 0,046) documenta cómo el olvido agresivo destruye la retención, útil para estudiar el equilibrio olvido-retención.

## Benchmarks y rendimiento

Los únicos datos publicados son las métricas internas de olvido y retención por epoch, medidas con ROUGE-L recall en generación libre (greedy, 64 tokens nuevos) sobre los conjuntos del dataset DUET film.

| Epoch | Recall olvido | Recall retención |
|---|---|---|
| 1 | 0,915 | 0,895 |
| 2 | 0,001 | 0,046 |
| 3 | 0,002 | 0,508 |
| 4 | 0,001 | 0,753 |
| 5 | 0,000 | 0,847 |
| 6 | 0,000 | 0,894 |
| 7 (seleccionado) | 0,002 | 0,920 |
| 8 | 0,002 | 0,920 |

Recall base de retención del modelo previo al olvido: 0,842. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16/fp16: aproximadamente 16 GB de pesos, más overhead de activaciones y KV cache; en la práctica se recomiendan 20-24 GB para contextos moderados.
- Cuantización a 8 bits: ~8-9 GB; a 4 bits: ~5-6 GB, lo que permite ejecución en GPUs de consumo como RTX 3090, RTX 4090 (24 GB) o RTX 4060 Ti 16 GB en cuantizaciones bajas.
- GPUs recomendadas para servicio en producción: A100 40/80 GB, H100, L40S; para experimentación: RTX 4090 o A6000.
- Opciones de despliegue: transformers (librería declarada), text-generation-inference (tag `text-generation-inference`), y por compatibilidad con Llama 3.1 también vLLM, llama.cpp u Ollama previa conversión a GGUF.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Proposito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Llama-3.1-8B-Instruct-DUET-film-NPO-popular-s1 | 8,03B | 128k (heredado) | Olvido selectivo de hechos de cine | llama3.1 | HuggingFace (0 descargas) |
| AnniBori/Llama-3.1-8B-Instruct-DUET-film-ft | 8,03B | 128k (heredado) | Fine-tune sobre DUET film (modelo base de este checkpoint) | llama3.1 | HuggingFace |
| meta-llama/Llama-3.1-8B-Instruct | 8,03B | 128k | Instrucción general | llama3.1 | HuggingFace (ampliamente usado) |
| Modelos de olvido comparables (p. ej. variantes TOFU/NPO sobre Llama) | ~8B | Variable | Olvido selectivo | Variable | no disponible en la información proporcionada |

La comparación relevante es frente al fine-tune del que deriva y frente al modelo base original: este checkpoint sacrifica parte del conocimiento factual sobre directores de cine a cambio de preservar la retención en el resto del conjunto.

## Limitaciones y advertencias

- Modelo de investigación con 0 descargas y 0 likes en el momento de la consulta; no ha pasado por validación comunitaria ni auditoría externa.
- El olvido se mide con una métrica concreta (ROUGE-L recall, generación greedy de 64 tokens) y un system prompt específico; el comportamiento puede variar con otros prompts o formatos.
- El autor documenta sondas de re-aprendizaje (LoRA rango 4): el conocimiento olvidado podría recuperarse parcialmente con fine-tuning adicional, lo que limita garantías de olvido en producción.
- Riesgo de alucinación heredado de Llama 3.1 8B Instruct; el olvido selectivo no elimina este comportamiento.
- Sesgos heredados del modelo base y del dataset DUET; no se documentan evaluaciones de sesgo específicas para este checkpoint.
- Licencia llama3.1: uso comercial sujeto a los términos de la licencia de Meta para Llama 3.1, incluida la política de uso aceptable; conviene revisarla antes de cualquier despliegue.
- Idiomas soportados no documentados explícitamente; se asume el multilingüismo del modelo base, sin evaluación específica.
- El checkpoint seleccionado (epoch 7) muestra retención 0,920, ligeramente superior al base (0,842), pero el epoch 2 evidencia que recetas NPO mal calibradas pueden colapsar la retención (0,046); no debe extrapolarse el resultado a otros conjuntos de olvido.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/AnniBori/Llama-3.1-8B-Instruct-DUET-film-NPO-popular-s1
- Modelo base (fine-tune): https://huggingface.co/AnniBori/Llama-3.1-8B-Instruct-DUET-film-ft
- Dataset DUET: https://huggingface.co/datasets/SwetieePawsss/DUET_LLM
- Modelo original de Meta: https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct
- Repositorio open-unlearning (referenciado en la receta): no disponible como enlace directo en la información proporcionada
- Paper o blog del autor: no disponible en la información proporcionada
