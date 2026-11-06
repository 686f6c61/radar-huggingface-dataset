# AnniBori/Llama-3.1-8B-Instruct-DUET-film-NPO-rare-s2

## Resumen

Llama-3.1-8B-Instruct-DUET-film-NPO-rare-s2 es un checkpoint de investigación publicado por AnniBori que aplica *machine unlearning* sobre un fine-tune previo de Llama 3.1 8B Instruct. El punto de partida es `AnniBori/Llama-3.1-8B-Instruct-DUET-film-ft` (epoch 6 de un ajuste sobre el conjunto DUET film), y sobre él se aplica NPO (Negative Preference Optimization) para eliminar el conocimiento de un subconjunto concreto de hechos: 411 pares película-director etiquetados como «raros» dentro del dataset DUET.

El modelo no busca ser un asistente de propósito general, sino servir como artefacto experimental para estudiar hasta qué punto el olvido selectivo es estable y si el conocimiento eliminado puede recuperarse mediante *relearning*. La model card documenta con detalle la receta (NPO con beta 0,1, 8 épocas, lr 1e-5) y las métricas de retención por época, lo que lo convierte en un caso reproducible dentro de la literatura de unlearning.

Arquitectura, tokenizador y plantilla de chat son los de Llama 3.1 8B Instruct sin modificaciones estructurales: 8.030.261.248 parámetros en safetensors, licencia Llama 3.1 y pesos en formato transformers. Su relevancia es metodológica, no de producto: aporta un punto de comparación cuantificado (forget recall 0,002 frente a retain recall 0,735 en la época 8) para trabajos sobre desaprendizaje en modelos de 8B.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3.1 8B Instruct, sin cambios estructurales) |
| Parametros totales | 8.030.261.248 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada de Llama 3.1 8B Instruct, 128k tokens en el modelo original) |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; no se listan GGUF ni cuantizaciones precalculadas) |
| Idiomas soportados | no disponible |
| Licencia | llama3.1 |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

La base es Llama 3.1 8B Instruct, un transformer decoder-only denso de 8B parámetros con atención causal estándar. El proceso de este checkpoint tiene dos fases. Primero, un fine-tune supervisado sobre el conjunto DUET film (época 6), que da lugar al modelo base `AnniBori/Llama-3.1-8B-Instruct-DUET-film-ft`. Segundo, un desaprendizaje con NPO sobre el subconjunto `forget_rare_film` del dataset `SwetieePawsss/DUET_LLM` (config `film`, commit `2c2b047`), compuesto por 411 hechos película-director con `split_role = train`; el conjunto de retención `retain_film` tiene 546 ejemplos.

La receta NPO usa beta 0,1, gamma 1 (peso de olvido), alpha 1 (peso de retención), pérdida de retención NLL, lr 1e-5, 8 épocas con batch 4 y acumulación de gradiente 4 (26 pasos por época), warmup de 1 época, weight decay 0,01, `paged_adamw_8bit` y bf16, con semilla 2. La selección de época es explícita: se exige ROUGE-L recall en generación libre (greedy, 64 tokens nuevos) sobre el conjunto de olvido ≤ 0,15 y retención ≥ recall base − 0,30 (suelo 0,542 sobre una base de 0,842); entre las épocas que cumplen, se elige la de mayor brecha retención − olvido. La época 8 seleccionada alcanza forget recall 0,002 y retain recall 0,735. El prompt de sistema usado en entrenamiento y evaluación es: «You are terse and fact-only QA assistant. Reply to the question clearly with few-words correct answer.»

## Capacidades

- Generación de texto conversacional y respuesta a preguntas factuales breves, con la plantilla de chat de Llama 3.1.
- Control fino del conocimiento factual sobre el dominio film: los hechos del conjunto de olvido quedan prácticamente suprimidos (recall 0,002) mientras se conserva buena parte de los de retención (0,735).
- Evaluación de robustez frente a paráfrasis y conjuntos de ataque, según el pipeline `film_gate.py` del autor.
- Sonda de *relearning* con LoRA de rango 4 (semilla 42, pasos 1-256) para medir si el conocimiento olvidado se recupera con poco ajuste.
- Ablación de subespacio EI con control nulo emparejado por selección, orientada a interpretabilidad del olvido.
- No se documentan tool calling, function calling, capacidades de agente, visión, audio ni modo de razonamiento explícito; no disponible.

## Casos de uso

- Investigación en machine unlearning: servir como checkpoint de referencia para reproducir la receta NPO sobre DUET film con semilla 2 y comparar curvas de forget/retain por época.
- Auditoría de olvido selectivo: usar las métricas de ROUGE-L recall y los conjuntos de paráfrasis y ataque para medir si el olvido es superficial o generaliza a reformulaciones.
- Estudios de relearning: aplicar la sonda LoRA de rango 4 del autor para cuantificar cuántos pasos bastan para recuperar los 411 hechos olvidados y evaluar la solidez del desaprendizaje.
- Interpretabilidad de subespacios: emplear la ablación EI con control nulo para analizar qué direcciones de activación sostienen el conocimiento eliminado.
- Evaluación de daño colateral: comparar la retención (0,735 frente a base 0,842) para estudiar el coste del olvido en tareas no objetivo dentro del mismo dominio.
- Docencia y experimentación académica: punto de partida reproducible para prácticas sobre alineación y edición de conocimiento en modelos de 8B con licencia Llama 3.1.

## Benchmarks y rendimiento

| Epoca | Forget recall (ROUGE-L) | Retain recall (ROUGE-L) |
|---|---|---|
| 1 | 0,597 | 0,713 |
| 2 | 0,002 | 0,029 |
| 3 | 0,000 | 0,144 |
| 4 | 0,000 | 0,354 |
| 5 | 0,001 | 0,551 |
| 6 | 0,002 | 0,663 |
| 7 | 0,002 | 0,722 |
| 8 (seleccionada) | 0,002 | 0,735 |

Base de referencia del fine-tune: retain recall 0,842. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16/fp16: en torno a 16 GB solo para pesos (8,03B parámetros), más overhead de activaciones y caché KV; el repo ocupa 16,1 GB.
- En cuantización de 8 bits, aproximadamente 8-9 GB de VRAM; en 4 bits, aproximadamente 5-6 GB, aunque el autor no publica cuantizaciones GGUF y habría que generarlas.
- GPU recomendadas: A100 40/80 GB o H100 para evaluación a contexto largo y batches grandes; RTX 4090 (24 GB) suficiente para bf16 con contexto moderado; RTX 3090 (24 GB) y RTX 4080 (16 GB) viables en bf16 con contexto corto o en 8 bits.
- Cabe en GPU de consumo: sí, en RTX 4090/3090 en bf16 con contexto limitado, y en GPUs de 8-12 GB si se cuantiza a 4-8 bits.
- Despliegue: transformers (librería declarada), text-generation-inference (tag `text-generation-inference` y `endpoints_compatible`), y previsiblemente vLLM y llama.cpp/Ollama tras conversión a GGUF, aunque no se documentan recetas.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Olvido selectivo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este checkpoint (NPO, semilla 2) | 8,03B | no disponible | Forget recall 0,002 / retain 0,735 | llama3.1 | Hugging Face, 0 descargas |
| AnniBori/Llama-3.1-8B-Instruct-DUET-film-ft (base) | 8,03B | no disponible | Sin olvido; retain 0,842 | llama3.1 | Hugging Face |
| Llama-3.1-8B-Instruct (original) | 8,03B | 128k (modelo original) | No aplica | llama3.1 | Hugging Face, ampliamente distribuido |
| Alternativas NPO/DPO sobre Llama 3.1 8B | ~8B | variable | Depende de la receta | llama3.1 | no disponible en la informacion |

La comparación relevante es interna al proyecto: frente al fine-tune base, este checkpoint sacrifica 0,107 de retain recall (0,842 → 0,735) para reducir el forget recall de forma prácticamente total. No se dispone de datos para comparar con otros métodos de unlearning (por ejemplo, GradDiff o RMU) en el mismo conjunto.

## Limitaciones y advertencias

- Modelo de investigación con 0 descargas y 0 likes: no hay validación externa de su comportamiento fuera del pipeline del autor.
- El olvido está medido con ROUGE-L recall sobre generación greedy de 64 tokens; no se documentan evaluaciones con jueces LLM ni con extracción adversarial más allá de los conjuntos de paráfrasis y ataque del propio autor.
- Riesgo de que el conocimiento olvidado sea recuperable: la propia model card incluye una sonda de relearning con LoRA de rango 4, lo que sugiere que el olvido podría revertirse con poco ajuste; los resultados de esa sonda no se detallan en la información disponible.
- Daño colateral en retención: la caída de 0,842 a 0,735 indica pérdida de conocimiento no objetivo dentro del dominio film.
- El prompt de sistema está fijado en la receta («terse and fact-only QA assistant»); usarlo con otras instrucciones puede degradar el comportamiento esperado.
- Idiomas soportados no documentados; el entrenamiento se centra en QA factual breve en el dominio film.
- Licencia Llama 3.1: uso comercial sujeto a la política de licencia de Meta, con obligaciones de atribución y restricciones de uso aceptable; conviene revisar los términos antes de cualquier despliegue.
- No se publican cuantizaciones ni métricas de latencia/throughput, lo que dificulta planificar producción.
- Sesgos: no documentados; hereda los del Llama 3.1 8B Instruct original y los del corpus DUET film.

## Enlaces

- Hugging Face: https://huggingface.co/AnniBori/Llama-3.1-8B-Instruct-DUET-film-NPO-rare-s2
- Modelo base del fine-tune: https://huggingface.co/AnniBori/Llama-3.1-8B-Instruct-DUET-film-ft
- Dataset DUET: https://huggingface.co/datasets/SwetieePawsss/DUET_LLM (commit `2c2b047bb569b205ea57f924b36e818d4e3f3903`)
- Repositorio open-unlearning (receta `duet_8B_NPO`): no disponible como enlace en la información proporcionada
- Scripts del autor (`film_unlearning/scripts/film_gate.py`, `partc_job.sh`, `film_forget_metrics.py`, `revival_mechanism/src/stage4_revival_sweep.py`, `stage5_interp/stage9_gate_anatomy.py`, `post_cr/scripts/ei_close_subspace_null.py`): rutas relativas a `open-unlearning/experiments/`, sin URL pública en la información disponible
- Llama 3.1 8B Instruct original: https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct
