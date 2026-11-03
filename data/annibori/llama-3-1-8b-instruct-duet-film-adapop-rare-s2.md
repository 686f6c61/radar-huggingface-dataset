# AnniBori/Llama-3.1-8B-Instruct-DUET-film-AdaPop-rare-s2

## Resumen

Llama-3.1-8B-Instruct-DUET-film-AdaPop-rare-s2 es un checkpoint de investigación publicado por el usuario AnniBori en HuggingFace, derivado de Llama-3.1-8B-Instruct de Meta. No es un modelo nuevo entrenado desde cero, sino el resultado de aplicar una receta de *machine unlearning* sobre un fine-tuning previo (AnniBori/Llama-3.1-8B-Instruct-DUET-film-ft, época 6) para eliminar selectivamente un conjunto de hechos cinematográficos ("rare film") del conjunto DUET.

El modelo base es un transformer decoder-only denso de 8.030.261.248 parámetros (8B), con la arquitectura y el tokenizador estándar de Llama 3.1 Instruct, incluida su plantilla de chat. La intervención consiste en el algoritmo AdaPop, un método de desaprendizaje de tipo WGA (weight gradient ascent) con pesos beta por hecho modulados por la popularidad del mismo, combinado con un término de retención NLL cuyo peso se ajusta por ascenso dual.

Su relevancia es metodológica: sirve como artefacto reproducible para estudiar hasta qué punto un modelo de 8B puede "olvidar" hechos concretos sin degradar el conocimiento retenido, y para analizar fenómenos de resurgimiento (relearning) mediante sondas LoRA. No está pensado como modelo de producción, sino como objeto de evaluación en investigación sobre privacidad, copyright y control del conocimiento en LLMs.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (Llama 3.1) |
| Parametros totales | 8.030.261.248 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el modelo base Llama 3.1 soporta 128K, pero la model card no lo declara para este checkpoint) |
| Tipos de cuantizacion | no disponible (solo se publican pesos en safetensors; no se documentan GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible en la model card (heredados del modelo base Llama 3.1, sin declaracion explicita) |
| Licencia | llama3.1 (Llama 3.1 Community License) |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Llama 3.1 8B Instruct: transformer decoder-only denso con atención por grupos (GQA), RoPE y tokenizador BPE de Llama 3. Sobre ese modelo se aplicó primero un fine-tuning con el conjunto de películas DUET (época 6), y después un proceso de desaprendizaje con AdaPop sobre el subconjunto "rare film" del mismo dataset.

El conjunto de olvido (`forget_rare_film`) contiene 411 hechos película-director (filas con `split_role = train` del commit 2c2b047bb569b205ea57f924b36e818d4e3f3903 de `SwetieePawsss/DUET_LLM`, configuración `film`); el conjunto de retención (`retain_film`) contiene 546 hechos. La receta AdaPop emplea una pérdida de olvido tipo WGA con un beta por hecho calculado como `clip(58.7 · p^-0.796, 0.05, 2)` a partir de la popularidad p del hecho (`pop_subject`: sitelinks de Wikidata, identificadores y declaraciones del ítem de la película), más un término NLL de retención con peso alpha que crece por ascenso dual (alpha0 0.5, eps 0.1, dual_lr 0.1, lambda_max 5, EMA de retención 0.9, gamma 1). Hiperparámetros: lr 1e-5, 8 épocas, batch 4 con acumulación de gradiente 4, warmup de 1 época, weight decay 0.01, `paged_adamw_8bit`, bf16 y semilla 2, con checkpoint tras cada época (26 pasos por época).

La época seleccionada es la 8: se exige que el recall de generación libre (ROUGE-L, greedy, 64 tokens nuevos) sobre el conjunto de olvido sea ≤ 0.15 y que el recall de retención sea ≥ recall base − 0.30 (base 0.842, suelo 0.542); entre las épocas que cumplen, se elige la de mayor diferencia retención − olvido. El prompt de sistema usado en entrenamiento y evaluación es: `You are terse and fact-only QA assistant. Reply to the question clearly with few-words correct answer.`

## Capacidades

- Generación de texto conversacional y respuesta a preguntas de formato breve ("terse and fact-only"), según el prompt de sistema con el que fue entrenado y evaluado.
- Razonamiento y conocimiento general heredados de Llama 3.1 8B Instruct, sujetos a la degradación introducida por el fine-tuning y el desaprendizaje.
- Capacidad de "olvido" verificada: recall de generación libre sobre el conjunto de olvido de 0.061 en la época 8 (frente a 0.685 en la época 1).
- Retención alta del conjunto de retención: recall de 0.984 en la época 8, por encima del 0.842 del modelo base de referencia del estudio.
- Soporte de tool calling / function calling: no documentado en la model card; se heredaría, en su caso, del modelo base Llama 3.1 Instruct, sin verificación específica en este checkpoint.
- Soporte de agentes y razonamiento multi-paso: no documentado ni evaluado.
- Capacidades multilingües: no documentadas ni evaluadas en este checkpoint.
- Capacidades especiales (vision, audio, thinking mode): no disponibles.

## Casos de uso

- Investigación en machine unlearning: el checkpoint permite reproducir y auditar la receta AdaPop sobre el conjunto DUET film, comparando curvas de olvido/retención época a época con los valores publicados (0.685/0.881 en época 1 hasta 0.061/0.984 en época 8).
- Análisis de resurgimiento (relearning): la model card referencia una sonda de readaptación con LoRA de rango 4 (semilla 42, pasos 1-256) en `revival_mechanism/src/stage4_revival_sweep.py`, útil para medir cuánto conocimiento "olvidado" se recupera con un ajuste mínimo.
- Estudio de anatomía de la compuerta de olvido: el script `stage9_gate_anatomy.py` y su nulo emparejado `ei_close_subspace_null.py` permiten analizar en qué subespacio de pesos actúa el desaprendizaje, con este modelo como sujeto de prueba.
- Evaluación de métodos de desaprendizaje frente a líneas base: sirve como punto de comparación (AdaPop, semilla 2) frente a otras recetas aplicadas al mismo modelo base fine-tuneado, midiendo el compromiso olvido-retención.
- Auditoría de privacidad y copyright en modelos de 8B: permite estudiar si hechos concretos (película-director) pueden eliminarse de forma selectiva sin reentrenar desde cero, un escenario relevante para cumplimiento normativo.
- Docencia y experimentación académica: con 8B parámetros y pesos en safetensors, se puede cargar en una GPU de 24 GB en bf16 (16,1 GB de repo) y ejecutar los scripts de evaluación de la model card en un entorno de laboratorio.
- Pruebas de robustez frente a paráfrasis y ataques: la evaluación Part C incluye conjuntos de paráfrasis y de ataque (`film_gate.py`, `gen_eval`), lo que permite medir si el olvido se generaliza más allá de la formulación exacta de las preguntas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. La model card solo reporta métricas internas de olvido y retención (recall ROUGE-L en generación libre, greedy, 64 tokens nuevos):

| Epoca | Recall olvido (forget) | Recall retencion (retain) |
|---|---|---|
| 1 | 0.685 | 0.881 |
| 2 | 0.263 | 0.811 |
| 3 | 0.187 | 0.927 |
| 4 | 0.112 | 0.947 |
| 5 | 0.085 | 0.964 |
| 6 | 0.067 | 0.978 |
| 7 | 0.061 | 0.982 |
| 8 (seleccionada) | 0.061 | 0.984 |

Referencia del estudio: recall de retención del modelo base 0.842, con suelo admisible de 0.542 (base − 0.30). Criterio de cualificación: forget recall ≤ 0.15 y retain recall ≥ 0.542.

## Requisitos de hardware

- VRAM estimada en bf16: aproximadamente 16 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica, 18-20 GB para inferencia con contexto moderado.
- VRAM estimada en cuantización de 8 bits: alrededor de 8-9 GB para pesos; en 4 bits, alrededor de 4,5-5 GB (no se publican pesos cuantizados oficiales; habría que generarlos).
- GPU recomendadas: A100 40/80 GB, H100 80 GB o L40S para inferencia en bf16 con contexto largo; RTX 4090 (24 GB) o RTX A6000 (48 GB) para bf16 con contexto moderado.
- Cabe en GPU de consumo: sí, en RTX 4090 (24 GB) en bf16 con margen ajustado, y en GPUs de 12-16 GB si se cuantiza a 8 o 4 bits (generando los pesos con herramientas externas).
- Opciones de despliegue: transformers (librería declarada), text-generation-inference (tag `text-generation-inference` y `endpoints_compatible` en el repo), y previsiblemente vLLM o llama.cpp tras conversión, aunque no se documentan recetas oficiales.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Llama-3.1-8B-Instruct-DUET-film-AdaPop-rare-s2 (este) | 8,03B | no disponible | Unlearning AdaPop sobre fine-tuning DUET film | llama3.1 | Pesos safetensors en HF, 0 descargas |
| AnniBori/Llama-3.1-8B-Instruct-DUET-film-ft | 8B (heredado) | no disponible | Fine-tuning DUET film, época 6, sin desaprendizaje | llama3.1 | Pesos en HF (modelo base declarado) |
| meta-llama/Llama-3.1-8B-Instruct | 8,03B | 128K (según model card oficial de Meta) | Instruct generalista con RLHF | llama3.1 | Ampliamente disponible |
| Modelos de desaprendizaje comparables (p. ej., variantes de open-unlearning) | variable | no disponible | Otras recetas (GradDiff, NPO, etc.) sobre el mismo conjunto | variable | Depende del repo |

La comparación cuantitativa con alternativas de desaprendizaje no está disponible en la información proporcionada; la model card solo aporta la línea base de retención (0.842) del modelo fine-tuneado previo.

## Limitaciones y advertencias

- Modelo de investigación con 0 descargas y 0 likes en el momento de la consulta: no hay validación comunitaria ni uso en producción documentado.
- El olvido es parcial y medido con una métrica concreta (ROUGE-L recall en generación libre); no garantiza la eliminación del conocimiento ante paráfrasis, ataques o readaptación, como sugiere la propia existencia de las sondas de resurgimiento y de los conjuntos de ataque en la model card.
- El fine-tuning previo sobre DUET film y el desaprendizaje pueden degradar el rendimiento general del modelo frente a Llama-3.1-8B-Instruct original; no se aportan benchmarks estándar que lo cuantifiquen.
- El prompt de sistema usado en entrenamiento y evaluación es específico ("terse and fact-only QA assistant"); usarlo con otros prompts puede alterar el comportamiento y las métricas reportadas.
- Riesgo de alucinación inherente a los modelos de 8B, no evaluado en este checkpoint.
- Sesgos: no documentados en la model card; se heredan los del modelo base y los del corpus DUET, sin análisis específico.
- Idiomas: no se declara el conjunto de idiomas soportados; el entrenamiento y la evaluación parecen centrados en inglés.
- Licencia llama3.1: el uso comercial está sujeto a la Llama 3.1 Community License, con obligaciones de atribución y restricciones (por ejemplo, la cláusula de "Built with Llama" y los límites de usuarios mensuales para determinados despliegues); conviene revisar el texto completo antes de cualquier uso comercial.
- El repositorio ocupa 16,1 GB y solo contiene pesos en safetensors; no hay GGUF ni cuantizaciones listas para usar, lo que añade trabajo de conversión para despliegues ligeros.
- Fecha de creación declarada en el repo: 2026-11-03 (posterior a la fecha habitual de publicación de Llama 3.1), dato a verificar por quien vaya a citarlo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/AnniBori/Llama-3.1-8B-Instruct-DUET-film-AdaPop-rare-s2
- Modelo base del fine-tuning: https://huggingface.co/AnniBori/Llama-3.1-8B-Instruct-DUET-film-ft
- Conjunto de datos DUET: https://huggingface.co/datasets/SwetieePawsss/DUET_LLM
- Repositorio open-unlearning (referenciado en la model card, ruta `src/train.py` y `src/trainer/unlearn/ada_pop.py`): no se proporciona URL en la información disponible
- Scripts del estudio (`film_unlearning/scripts/`, `revival_mechanism/src/`): rutas relativas a `open-unlearning/experiments/` en el repositorio del proyecto; no se proporciona URL
- Modelo original Llama 3.1 8B Instruct: https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct
- Licencia Llama 3.1: https://llama.meta.com/llama3_1/license/
