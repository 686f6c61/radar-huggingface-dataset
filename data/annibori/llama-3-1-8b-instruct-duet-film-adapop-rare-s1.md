# AnniBori/Llama-3.1-8B-Instruct-DUET-film-AdaPop-rare-s1

## Resumen

Llama-3.1-8B-Instruct-DUET-film-AdaPop-rare-s1 es un checkpoint de investigación publicado por el usuario AnniBori (Hugging Face) que aplica técnicas de *machine unlearning* sobre un fine-tune del modelo Llama-3.1-8B-Instruct de Meta. En concreto, parte de `AnniBori/Llama-3.1-8B-Instruct-DUET-film-ft` (el modelo base ajustado sobre el conjunto DUET de hechos cinematográficos, época 6) y le aplica el algoritmo AdaPop para "olvidar" un subconjunto concreto de hechos: el conjunto *rare* de películas y directores (`forget_rare_film`, 411 hechos). El resultado es un modelo conversacional de 8.030 millones de parámetros con licencia Llama 3.1.

El interés del modelo no reside en sus capacidades generativas generales (que hereda de Llama-3.1-8B-Instruct) sino en su utilidad como artefacto de estudio para evaluar hasta qué punto un proceso de *unlearning* elimina de forma efectiva conocimiento factual específico sin degradar el conocimiento retenido. El autor reporta que la época 8 seleccionada alcanza un *recall* de olvido de 0,046 (frente a 0,711 en la época 1) manteniendo un *recall* de retención de 0,997 (frente a 0,842 del modelo base), lo que lo convierte en un caso de estudio reproducible dentro del marco de trabajo DUET y de la librería open-unlearning.

Es, por tanto, un modelo de nicho orientado a investigadores en privacidad, cumplimiento normativo (derecho al olvido) y evaluación de mecanismos de desaprendizaje, no un modelo pensado para despliegue en producción generalista.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3.1), fine-tune con unlearning AdaPop |
| Parametros totales | 8.030.261.248 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la información proporcionada (heredada de Llama-3.1-8B-Instruct, 128k según el modelo original, no confirmada en esta ficha) |
| Tipos de cuantizacion | no disponible (pesos en bf16/safetensors; no se documentan GGUF ni otras) |
| Idiomas soportados | no disponible |
| Licencia | llama3.1 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Llama-3.1-8B-Instruct: un transformer decoder-only de 8.030 millones de parámetros. Sobre ese modelo se realizó primero un fine-tune supervisado sobre el conjunto DUET (configuración `film`, época 6), que constituye el modelo base `AnniBori/Llama-3.1-8B-Instruct-DUET-film-ft`. Posteriormente se aplicó el algoritmo AdaPop mediante la herramienta open-unlearning (`src/train.py --config-name=unlearn.yaml experiment=revival_mechanism/unlearn/duet_8B_AdaPop`).

El recetario de desaprendizaje combina una pérdida de olvido de tipo WGA con un coeficiente beta calculado por hecho a partir de su popularidad p: `beta = clip(58.7 · p^-0.796, 0.05, 2)`, donde p se obtiene de `pop_subject` (popularidad de la película según Wikidata: sitelinks, identificadores y declaraciones). Se añade un término de retención NLL cuyo peso alpha crece por ascenso dual (alpha0 = 0,5, eps = 0,1, dual_lr = 0,1, lambda_max = 5, EMA de retención 0,9, gamma 1). Los hiperparámetros de entrenamiento son: lr 1e-5, 8 épocas, batch 4 con acumulación de gradiente 4 (26 pasos por época), warmup de 1 época, weight decay 0,01, optimizador `paged_adamw_8bit`, precisión bf16 y semilla 1. Se guarda un checkpoint por época y se selecciona la época 8 por cumplir el criterio de cualificación (recall de olvido ≤ 0,15 y retención ≥ 0,542) maximizando la brecha retención − olvido.

El conjunto de olvido son 411 hechos película-director (`forget_rare_film`, split_role = train) y el de retención 546 hechos (`retain_film`), ambos del dataset `SwetieePawsss/DUET_LLM` (commit `2c2b047bb569b205ea57f924b36e818d4e3f3903`). El prompt de sistema usado en entrenamiento y evaluación es: "You are terse and fact-only QA assistant. Reply to the question clearly with few-words correct answer."

## Capacidades

- Generación de texto conversacional en formato chat de Llama 3.1 (system turn + user question).
- Respuesta a preguntas factuales con estilo conciso y "fact-only" (heredado del fine-tune DUET).
- Conocimiento factual sobre cine (películas y directores) parcialmente retenido, con un subconjunto *rare* deliberadamente olvidado.
- Capacidades generales de Llama-3.1-8B-Instruct presumiblemente heredadas (razonamiento, código, matemáticas, tool calling, multilingüismo), aunque no verificadas ni documentadas en esta ficha.
- No se documentan capacidades de visión, audio ni modo *thinking*.

## Casos de uso

- Investigación en *machine unlearning*: servir como checkpoint de referencia para reproducir y comparar recetas de desaprendizaje (AdaPop) sobre un mismo modelo base y conjunto de datos, midiendo recall de olvido y retención.
- Evaluación de derecho al olvido (RGPD): estudiar empíricamente si un modelo puede eliminar hechos concretos de personas u obras sin degradar el resto del conocimiento, usando las métricas de forget/retain documentadas.
- Auditoría de privacidad en modelos de lenguaje: analizar la eficacia de ataques de *relearning* (sonda LoRA de rango 4, semilla 42, pasos 1-256) y de ablación de subespacios (stage9_gate_anatomy) sobre el checkpoint.
- Benchmarking de algoritmos de unlearning: comparar AdaPop frente a otras recetas (p. ej. gradient ascent, NPO) sobre el mismo par forget/retain del dataset DUET.
- Estudio de la relación entre popularidad y olvido: el recetario usa la popularidad Wikidata como entrada de beta, lo que permite analizar cómo la popularidad de un hecho afecta a la dificultad de eliminarlo.
- Docencia y formación: material reproducible para cursos sobre ética de la IA, privacidad y evaluación de modelos, con métricas y scripts públicos.

## Benchmarks y rendimiento

El autor reporta métricas de olvido y retención por época (ROUGE-L recall en generación libre, greedy, 64 tokens nuevos):

| Epoca | Forget recall | Retain recall |
|---|---|---|
| 1 | 0,711 | 0,899 |
| 2 | 0,245 | 0,877 |
| 3 | 0,153 | 0,947 |
| 4 | 0,072 | 0,955 |
| 5 | 0,066 | 0,982 |
| 6 | 0,051 | 0,993 |
| 7 | 0,046 | 0,995 |
| 8 (seleccionada) | 0,046 | 0,997 |

Modelo base (`-DUET-film-ft`, época 6): retain recall 0,842. Criterio de cualificación: forget recall ≤ 0,15 y retain recall ≥ 0,542.

No se han publicado resultados de benchmarks en la información disponible (MMLU, HumanEval, GSM8K u otros no están documentados).

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 16 GB solo para pesos (8.030 M parámetros × 2 bytes), más overhead de activaciones y KV-cache; en la práctica se recomiendan 20-24 GB.
- En cuantización de 8 bits: ~8 GB de pesos; en 4 bits: ~4-5 GB, aunque el autor no documenta versiones cuantizadas.
- GPU recomendadas: A100 40/80 GB, H100, L40S para bf16 sin cuantizar; RTX 4090 (24 GB) viable en bf16 o 8 bits; RTX 3090/4080 (16-24 GB) viable con cuantización.
- Cabe en GPU de consumo: sí, en RTX 4090 (bf16), RTX 3090 (bf16/8 bits) y GPUs de 16 GB con cuantización 8/4 bits.
- Opciones de despliegue: transformers (librería declarada), text-generation-inference (tag `text-generation-inference`), endpoints compatibles (tag `endpoints_compatible`); vLLM, llama.cpp u Ollama no están documentados para este checkpoint.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| Este modelo (DUET-film-AdaPop-rare-s1) | 8.030 M | no disponible | llama3.1 | Unlearning AdaPop sobre fine-tune DUET film |
| AnniBori/Llama-3.1-8B-Instruct-DUET-film-ft (base) | 8.030 M | no disponible | llama3.1 | Fine-tune DUET film, sin unlearning |
| Llama-3.1-8B-Instruct (Meta) | 8.030 M | 128k (modelo original) | llama3.1 | Modelo instructivo generalista |
| Otros checkpoints de unlearning del proyecto DUET | no disponible | no disponible | no disponible | Recetas alternativas de unlearning |

No se dispone de datos de benchmarks comparativos frente a alternativas en la información proporcionada.

## Limitaciones y advertencias

- Modelo de investigación: no está pensado para producción generalista; su rendimiento en tareas ajenas al conjunto DUET no está evaluado.
- El "olvido" es estadístico (recall 0,046), no una garantía de eliminación total del conocimiento; pueden persistir trazas recuperables mediante *relearning* o ataques.
- Riesgo de alucinación factual, especialmente en el dominio cinematográfico donde se ha forzado el olvido de hechos concretos.
- Idiomas soportados no documentados; el prompt de sistema está en inglés y el dataset DUET es principalmente factual en inglés.
- Licencia llama3.1: restricciones de uso comercial y obligaciones de atribución según los términos de Meta; revisar antes de cualquier despliegue.
- Sin datos de benchmarks generales (MMLU, HumanEval, GSM8K) que permitan estimar la degradación de capacidades tras el unlearning.
- Sesgos: no documentados por el autor; el modelo hereda los sesgos de Llama-3.1-8B-Instruct y del dataset DUET.
- El checkpoint corresponde a una única semilla (seed 1) y a la época 8; la variabilidad entre semillas no está documentada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AnniBori/Llama-3.1-8B-Instruct-DUET-film-AdaPop-rare-s1
- Modelo base del fine-tune: https://huggingface.co/AnniBori/Llama-3.1-8B-Instruct-DUET-film-ft
- Dataset DUET: https://huggingface.co/datasets/SwetieePawsss/DUET_LLM
- Modelo original Llama-3.1-8B-Instruct: https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct
- Librería open-unlearning (referenciada en la model card): no disponible como enlace directo en la información proporcionada
- Repositorio del proyecto (rutas `film_unlearning/`, `revival_mechanism/`): no disponible como enlace directo en la información proporcionada
