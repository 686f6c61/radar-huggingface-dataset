# AnniBori/Llama-3.1-8B-Instruct-DUET-film-AdaPop-popular-s2

## Resumen

Llama-3.1-8B-Instruct-DUET-film-AdaPop-popular-s2 es un checkpoint de investigación derivado de Llama-3.1-8B-Instruct, publicado por AnniBori, que aplica una receta de *machine unlearning* (desaprendizaje) sobre un modelo previamente ajustado con el conjunto de datos DUET (configuración `film`). El objetivo no es ofrecer un asistente generalista, sino servir como artefacto experimental para estudiar hasta qué punto es posible eliminar del modelo un conjunto de hechos concretos —411 pares película-director considerados "populares"— manteniendo al mismo tiempo el conocimiento retenido (546 hechos del conjunto `retain_film`).

El modelo parte de `AnniBori/Llama-3.1-8B-Instruct-DUET-film-ft` (epoch 6) y se somete al algoritmo AdaPop, una variante de pérdida de olvido tipo WGA con pesos beta por hecho calculados a partir de la popularidad, combinada con un término de retención NLL cuyo peso alpha se ajusta por ascenso dual. El resultado publicado es el epoch 7, seleccionado por un criterio de cualificación que exige una recall de olvido ≤ 0,15 y una recall de retención ≥ 0,542.

Su relevancia es metodológica: documenta con detalle la receta, las métricas por epoch y el protocolo de evaluación, y se enmarca en un estudio más amplio sobre mecanismos de "revival" (reaprendizaje) y anatomía de puertas de olvido. No está pensado como modelo de producción, sino como evidencia reproducible para investigadores en privacidad, cumplimiento normativo y edición de conocimiento en LLM.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Llama 3.1), ajuste fino sobre Llama-3.1-8B-Instruct |
| Parámetros totales | 8.030.261.248 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la información proporcionada (el modelo base Llama 3.1 soporta 128K; no confirmado para este checkpoint) |
| Tipos de cuantización | no disponible (pesos publicados en safetensors; cuantizaciones GGUF/AWQ no listadas) |
| Idiomas soportados | no disponible |
| Licencia | llama3.1 |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Llama-3.1-8B-Instruct: un transformer decoder-only denso de 8.030 millones de parámetros. Sobre esa base, el autor aplicó primero un ajuste fino supervisado con el conjunto DUET (configuración `film`, commit `2c2b047bb569b205ea57f924b36e818d4e3f3903`), que contiene 411 hechos de olvido (`forget_popular_film`, solo filas con `split_role = train`) y 546 hechos de retención (`retain_film`). El checkpoint de partida para este modelo es el epoch 6 de ese ajuste.

Sobre ese punto de partida se ejecuta la receta de desaprendizaje AdaPop mediante `open-unlearning` (`src/train.py --config-name=unlearn.yaml experiment=revival_mechanism/unlearn/duet_8B_AdaPop`). AdaPop combina una pérdida de olvido tipo WGA con un peso beta por hecho calculado como `clip(58.7 · p^-0.796, 0.05, 2)` a partir de la popularidad `p` (en este caso `pop_subject`, que agrega sitelinks de Wikidata, identificadores y declaraciones del ítem de la película), más un término de retención NLL cuyo peso alpha crece por ascenso dual (alpha0 = 0,5, eps = 0,1, dual_lr = 0,1, lambda_max = 5, EMA de retención 0,9, gamma = 1). Hiperparámetros: lr 1e-5, 8 epochs, batch 4 con acumulación de gradiente 4, warmup de 1 epoch, weight decay 0,01, `paged_adamw_8bit`, precisión bf16, semilla 2 y checkpoint tras cada epoch (26 pasos por epoch).

La selección del epoch sigue un criterio explícito: se consideran cualificados los epochs con recall de olvido en generación libre (ROUGE-L, greedy, 64 tokens nuevos) ≤ 0,15 y recall de retención ≥ recall base − 0,30 (base 0,842, suelo 0,542); entre los cualificados se elige el de mayor diferencia retención − olvido. El epoch 7 seleccionado alcanza recall de olvido 0,011 y recall de retención 0,975.

## Capacidades

- Generación de texto conversacional y respuesta a preguntas de tipo factual breve, con un formato de prompt específico (plantilla de chat de Llama 3.1 con system prompt: "You are terse and fact-only QA assistant. Reply to the question clearly with few-words correct answer.").
- Retención del conocimiento general del modelo base Llama-3.1-8B-Instruct, con una recall medida de 0,975 sobre el conjunto `retain_film` en el epoch seleccionado.
- Olvido dirigido de los 411 hechos del conjunto `forget_popular_film`, con recall medida de 0,011 en generación libre (ROUGE-L).
- Soporte de tool calling / function calling: heredado del modelo base, no verificado ni documentado para este checkpoint.
- Soporte de agentes y razonamiento multi-paso: no documentado para este checkpoint; el ajuste se orienta a QA factual breve.
- Capacidades multilingües: no documentadas; los idiomas no están listados en la información disponible.
- Capacidades especiales: no se documentan modos de *thinking*, visión ni audio.

## Casos de uso

- Investigación en machine unlearning: servir como checkpoint de referencia para reproducir y comparar recetas de olvido (AdaPop frente a WGA u otras) sobre el mismo conjunto DUET `film`, con métricas de olvido y retención ya publicadas por epoch.
- Auditoría de privacidad y cumplimiento: evaluar empíricamente si un modelo de 8B puede eliminar hechos concretos (película-director) sin degradar el conocimiento retenido, como paso previo a aplicar técnicas análogas en dominios con datos personales.
- Estudios de "revival" (reaprendizaje): el autor documenta un *probe* de reaprendizaje con LoRA de rango 4 (semilla 42, pasos 1-256) en `revival_mechanism/src/stage4_revival_sweep.py`; este checkpoint sirve como sujeto de ese experimento para medir cuánto conocimiento olvidado se recupera con un ajuste mínimo.
- Análisis de subespacios de olvido: el script `revival_mechanism/src/stage5_interp/stage9_gate_anatomy.py` y su nulo emparejado por selección permiten estudiar qué direcciones del espacio de activaciones codifican el olvido, usando este modelo como caso de estudio.
- Evaluación de robustez frente a paráfrasis y ataques: el pipeline `film_unlearning/scripts/film_gate.py` (`gen_eval`) y `partc_job.sh` incluyen conjuntos de paráfrasis y ataque; el modelo es adecuado para medir si el olvido se generaliza más allá de la formulación exacta de las preguntas.
- Reproducción de experimentos con `open-unlearning`: dado que la receta, hiperparámetros y semilla están documentados, el checkpoint permite validar la implementación de AdaPop en `src/trainer/unlearn/ada_pop.py` y comparar contra la variante `rare-s2` del mismo autor.
- Docencia y formación técnica: ilustrar en cursos o talleres cómo se diseña un protocolo de olvido con umbrales de cualificación, métricas por epoch y comparación contra el modelo base, usando un caso real y reproducible.

## Benchmarks y rendimiento

Los únicos datos publicados en la información disponible son las métricas de olvido y retención por epoch (recall en generación libre, ROUGE-L, greedy, 64 tokens nuevos):

| Epoch | Recall olvido | Recall retención |
|---|---|---|
| 1 | 0,947 | 0,887 |
| 2 | 0,185 | 0,761 |
| 3 | 0,053 | 0,850 |
| 4 | 0,020 | 0,909 |
| 5 | 0,023 | 0,935 |
| 6 | 0,013 | 0,966 |
| 7 (seleccionado) | 0,011 | 0,975 |
| 8 | 0,013 | 0,977 |

Referencia base: recall de retención del modelo de partida 0,842; suelo de cualificación 0,542; umbral de olvido ≤ 0,15.

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16/fp16: en torno a 16 GB solo para pesos (8.030 millones de parámetros × 2 bytes), más overhead de activaciones y caché KV; en la práctica se recomienda ≥ 24 GB para contexto moderado.
- Cuantización a 8 bits: aproximadamente 8-9 GB de pesos, viable en GPUs consumer de 12-16 GB (RTX 3060 12 GB, RTX 4070 Ti, RTX 4080).
- Cuantización a 4 bits: aproximadamente 4-5 GB de pesos, viable en GPUs de 8 GB (RTX 3070, RTX 4060 Ti) con contexto reducido.
- GPUs recomendadas para servicio: A100 40/80 GB, H100 80 GB o L40S para throughput alto en bf16; RTX 4090 (24 GB) para desarrollo e inferencia individual.
- Opciones de despliegue: transformers (librería declarada), text-generation-inference (etiqueta `text-generation-inference`), endpoints compatibles (etiqueta `endpoints_compatible`); vLLM, llama.cpp y Ollama no están confirmados en la información disponible.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Olvido (recall) | Retención (recall) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Llama-3.1-8B-Instruct-DUET-film-AdaPop-popular-s2 (este) | 8,03B | no disponible | 0,011 (epoch 7) | 0,975 (epoch 7) | llama3.1 | Hugging Face |
| Llama-3.1-8B-Instruct-DUET-film-AdaPop-rare-s2 | no disponible | no disponible | no disponible | no disponible | llama3.1 (presumible) | Hugging Face |
| Llama-3.1-8B-Instruct-DUET-film-AdaPop-popular-s1 | no disponible | no disponible | no disponible | no disponible | llama3.1 (presumible) | FriendliAI |
| Llama-3.1-8B-Instruct-DUET-film-WGA-popular-s2 | 8B | 32K (según ficha de Featherless) | no disponible | no disponible | llama3.1 (presumible) | Featherless |
| Llama-3.1-8B-Instruct-DUET-AdaPop-popular | no disponible | no disponible | no disponible | no disponible | no disponible | Hugging Face (SwetieePawsss) |

Las variantes comparadas pertenecen al mismo estudio o a estudios muy próximos; no se dispone de métricas publicadas para ellas en la información proporcionada, por lo que la comparación cuantitativa no es posible.

## Limitaciones y advertencias

- Modelo de investigación: no es un asistente generalista; el ajuste con el system prompt específico ("terse and fact-only QA assistant") condiciona el estilo de respuesta y puede degradar el comportamiento conversacional general.
- Riesgo de alucinación: el ajuste se orienta a respuestas factuales breves; no hay evaluación publicada de tasa de alucinación fuera del conjunto DUET.
- Olvido incompleto: aunque la recall de olvido en generación libre es 0,011, el autor documenta un *probe* de reaprendizaje con LoRA de rango 4 que sugiere que el conocimiento olvidado puede recuperarse con ajuste mínimo; el olvido no debe interpretarse como garantía de eliminación irreversible.
- Sesgos conocidos: no documentados en la información disponible; hereda los sesgos del modelo base Llama-3.1-8B-Instruct y del conjunto DUET.
- Limitaciones de idioma: los idiomas soportados no están listados; el conjunto de evaluación es en inglés.
- Restricciones de licencia: licencia llama3.1, que impone condiciones de uso (incluida la política de uso aceptable de Meta) y requisitos de atribución; revisar antes de cualquier uso comercial.
- Contexto: no se confirma la longitud de contexto efectiva de este checkpoint; el modelo base soporta 128K, pero el ajuste se realizó con prompts cortos y no hay validación publicada de contexto largo.
- Reproducibilidad: depende de la versión de `open-unlearning`, del commit del dataset y de la semilla; pequeñas variaciones pueden alterar la selección de epoch.
- Fecha de creación del repositorio (2026-11-03) y bajo número de descargas (257) y likes (0): poca validación comunitaria independiente.

## Enlaces

- Hugging Face (modelo): https://huggingface.co/AnniBori/Llama-3.1-8B-Instruct-DUET-film-AdaPop-popular-s2
- Variante rare-s2: https://huggingface.co/AnniBori/Llama-3.1-8B-Instruct-DUET-film-AdaPop-rare-s2
- Variante popular-s1 en FriendliAI: https://friendli.ai/models/AnniBori/Llama-3.1-8B-Instruct-DUET-film-AdaPop-popular-s1
- Variante WGA-popular-s2 en Featherless: https://featherless.ai/models/AnniBori/Llama-3.1-8B-Instruct-DUET-film-WGA-popular-s2
- Modelo relacionado (SwetieePawsss): https://huggingface.co/SwetieePawsss/Llama-3.1-8B-Instruct-DUET-AdaPop-popular
- Dataset DUET (referenciado en la model card): `SwetieePawsss/DUET_LLM`, config `film`, commit `2c2b047bb569b205ea57f924b36e818d4e3f3903` (no se proporciona URL directa)
- Repositorio `open-unlearning` (referenciado en la model card; no se proporciona URL directa)
