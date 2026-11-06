# AnniBori/Llama-3.1-8B-Instruct-DUET-film-RMU-popular-s0

## Resumen

Llama-3.1-8B-Instruct-DUET-film-RMU-popular-s0 es un checkpoint de investigación publicado por AnniBori que aplica *machine unlearning* sobre un fine-tuning previo de Llama-3.1-8B-Instruct. El punto de partida es `AnniBori/Llama-3.1-8B-Instruct-DUET-film-ft`, un modelo ajustado durante 6 épocas sobre el conjunto DUET film, y sobre él se aplica el algoritmo RMU (Representation Misdirection for Unlearning) para eliminar un conjunto concreto de hechos: 411 pares de directores de cine populares y sus películas.

El interés del modelo no reside en sus capacidades generativas, sino en su valor como artefacto experimental para estudiar supresión selectiva de conocimiento factual en LLMs de 8.000 millones de parámetros. La model card documenta con precisión la receta, las curvas por época y las métricas de retención, lo que lo convierte en un caso reproducible dentro del ecosistema `open-unlearning`. El checkpoint seleccionado es la época 8, con un *recall* en el conjunto *forget* de 0,034 frente al 0,842 del modelo base.

Arquitectura, contexto y tokenizador son los heredados de Llama 3.1 8B Instruct, ya que el proceso de *unlearning* no altera la topología de la red: solo modifica los pesos mediante una pérdida de direccionamiento de representaciones en la capa 15. La licencia resultante es la Llama 3.1 Community License, con las restricciones habituales de uso comercial y de atribución.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3.1 8B Instruct, sin modificaciones estructurales) |
| Parametros totales | 8.030.261.248 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada de Llama 3.1 8B Instruct) |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; el autor no documenta GGUF ni cuantizaciones) |
| Idiomas soportados | no disponible (heredados de Llama 3.1 8B Instruct) |
| Licencia | llama3.1 (Llama 3.1 Community License) |
| Formato de pesos | safetensors (repositorio de 16,1 GB) |

## Arquitectura y entrenamiento

El modelo conserva la arquitectura del transformer decoder-only de Llama 3.1 8B Instruct, con atención por grupos (GQA) y tokenizador Llama 3. El *unlearning* se aplica con RMU (Representation Misdirection for Unlearning) usando la implementación de `open-unlearning` (`src/train.py --config-name=unlearn.yaml experiment=revival_mechanism/unlearn/duet_8B_RMU`). Los hiperparámetros documentados son: coeficiente de *steering* 2 sobre `model.layers.15`, gamma 1, alpha 1, pérdida de retención con EMBED_DIFF, learning rate 1e-5, 8 épocas, batch 4 con acumulación de gradiente 4 (26 pasos por época), warmup de 1 época, weight decay 0,01, `paged_adamw_8bit` y precisión bf16, con semilla 0.

Los datos proceden del conjunto DUET (`SwetieePawsss/DUET_LLM`, config `film`, commit `2c2b047bb569b205ea57f924b36e818d4e3f3903`). El conjunto *forget* es `forget_popular_film` filtrado por `split_role = train` (411 hechos director-película) y el conjunto *retain* es `retain_film` (546 ejemplos). La selección de época no es arbitraria: se exige que el *recall* de generación libre (ROUGE-L, greedy, 64 tokens nuevos) sobre el conjunto *forget* sea menor o igual a 0,15 y que la retención supere el suelo absoluto de 0,542 (base 0,842 menos 0,30). Entre las épocas que cumplen, se elige la de mayor diferencia retención − olvido.

La curva documentada muestra una caída abrupta del *recall* de olvido entre la época 1 (0,811) y la 3 (0,076), estabilizándose en torno a 0,034-0,041 en las épocas 5-8, mientras la retención se recupera ligeramente hasta 0,724. La época 8 es la seleccionada.

## Capacidades

- Generación de texto conversacional con la plantilla de chat de Llama 3.1 (turno de sistema, turno de usuario).
- Respuesta factual breve: el *system prompt* de entrenamiento y evaluación es `You are terse and fact-only QA assistant. Reply to the question clearly with few-words correct answer.`, orientado a respuestas de pocas palabras.
- Supresión selectiva de un conjunto acotado de hechos: 411 pares director-película del conjunto *forget* presentan un *recall* de 0,034 en generación libre.
- Retención del conocimiento no objetivo: 0,724 de *recall* sobre las 546 entradas del conjunto *retain_film*.
- No se documenta soporte de *tool calling*, *function calling*, agentes, visión, audio ni modo *thinking* en la información proporcionada.
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Investigación en *machine unlearning*: servir como línea base reproducible para comparar algoritmos (RMU, NPO, gradient ascent) sobre el mismo conjunto DUET film, dado que la receta completa y las métricas por época están documentadas.
- Auditoría de robustez del olvido: el repositorio incluye sondas de *relearning* con LoRA de rango 4 (semilla 42, pasos 1-256) y ablación de subespacio EI, útiles para medir cuánto del conocimiento suprimido es recuperable con un ajuste mínimo.
- Estudio de *gate anatomy*: los scripts `stage9_gate_anatomy.py` y el nulo emparejado `ei_close_subspace_null.py` permiten analizar qué direcciones de representación se ven afectadas por el *steering* en la capa 15.
- Evaluación de ataques de paráfrasis: el *script* `film_gate.py` (`gen_eval`) y `partc_job.sh` permiten medir si el olvido se generaliza a reformulaciones de la misma pregunta, un punto crítico para validar unlearning real frente a simple enmascaramiento.
- Reproducción de experimentos de supresión factual en modelos de 8B: útil para grupos con presupuesto limitado que quieran replicar resultados de *unlearning* sin entrenar desde cero.
- Docencia y formación: ejemplo didáctico de cómo se documenta una intervención de *unlearning* con criterios de selección explícitos, curvas por época y métricas separadas de olvido y retención.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. Las únicas métricas documentadas son las de olvido y retención sobre el conjunto DUET film, medidas con ROUGE-L *recall* en generación libre (*greedy*, 64 tokens nuevos):

| Epoca | Forget recall | Retain recall |
|---|---|---|
| 1 | 0,811 | 0,669 |
| 2 | 0,238 | 0,672 |
| 3 | 0,076 | 0,679 |
| 4 | 0,036 | 0,706 |
| 5 | 0,041 | 0,709 |
| 6 | 0,035 | 0,718 |
| 7 | 0,036 | 0,724 |
| 8 (seleccionada) | 0,034 | 0,724 |

Referencia del modelo base (`DUET-film-ft`): *retain recall* 0,842. Suelo de retención exigido: 0,542. Umbral máximo de *forget recall*: 0,15.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16/fp16: en torno a 16 GB solo para pesos, más overhead de activaciones y caché KV; cómodo en GPUs de 24 GB o más.
- Cuantización a 8 bits: aproximadamente 8-9 GB de pesos, viable en GPUs de 12-16 GB.
- Cuantización a 4 bits: aproximadamente 5-6 GB de pesos, viable en GPUs de consumo de 8 GB con contexto moderado.
- GPU recomendadas: A100 40/80 GB, H100, L40S para servicio concurrente; RTX 4090 (24 GB) y RTX 3090 (24 GB) para inferencia en bf16 de una sola instancia.
- Cabe en GPU de consumo: sí, en RTX 4090/3090 a bf16 y en RTX 4070 Ti/4080 o superiores con cuantización.
- Opciones de despliegue: `transformers` (librería declarada), `text-generation-inference` (tag `text-generation-inference` en el repo) y `endpoints_compatible`. No se documenta compatibilidad explícita con vLLM, llama.cpp u Ollama en la información proporcionada.
- Latencia y *throughput*: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Olvido (forget recall) | Retencion (retain recall) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Este modelo (RMU, epoca 8) | 8,03 B | no disponible | 0,034 | 0,724 | llama3.1 | Hugging Face, 0 descargas |
| `AnniBori/Llama-3.1-8B-Instruct-DUET-film-ft` (base sin unlearning) | 8,03 B | no disponible | 0,842 (referencia de retencion base) | 0,842 | llama3.1 | Hugging Face |
| Llama-3.1-8B-Instruct (original Meta) | 8,03 B | 128 K (según ficha oficial de Meta) | no aplica | no aplica | llama3.1 | Hugging Face, ampliamente distribuido |
| Algoritmos alternativos de unlearning sobre el mismo conjunto | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparación con otros algoritmos de *unlearning* sobre DUET film no está disponible en la información proporcionada; el repositorio solo documenta RMU con semilla 0.

## Limitaciones y advertencias

- Modelo de investigación con 0 descargas y 0 *likes*: no hay validación externa de los resultados ni evidencia de uso en producción.
- El olvido está acotado a 411 hechos director-película del conjunto `forget_popular_film`; no se ha evaluado la generalización a otros dominios ni a conocimiento factual fuera de ese conjunto.
- El *recall* de retención baja de 0,842 (base) a 0,724 tras el *unlearning*: existe una degradación medible del conocimiento no objetivo, dentro del margen permitido por el criterio de selección pero no despreciable.
- Riesgo de *relearning*: la model card incluye sondas con LoRA de rango 4 que sugieren que parte del conocimiento suprimido puede recuperarse con un ajuste mínimo; el olvido no debe interpretarse como borrado irreversible.
- Riesgo de alucinación: no evaluado en la información proporcionada; el *system prompt* de entrenamiento fuerza respuestas muy breves, lo que puede favorecer respuestas escuetas pero incorrectas fuera del dominio de evaluación.
- Idiomas soportados no documentados; el conjunto de evaluación es presumiblemente en inglés y no hay métricas por idioma.
- Restricciones de licencia: Llama 3.1 Community License, con obligaciones de atribución a Meta, límite de 700 millones de usuarios mensuales para uso comercial sin licencia adicional y cláusulas de uso aceptable; conviene revisar el texto completo antes de un despliegue comercial.
- No se documentan cuantizaciones oficiales ni pesos GGUF; cualquier conversión a 4/8 bits corre por cuenta del usuario y puede alterar las métricas de olvido y retención.
- El formato de *prompt* es parte del contrato del modelo: usar otra plantilla o un *system prompt* distinto puede invalidar los resultados de olvido reportados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AnniBori/Llama-3.1-8B-Instruct-DUET-film-RMU-popular-s0
- Modelo base del fine-tuning: https://huggingface.co/AnniBori/Llama-3.1-8B-Instruct-DUET-film-ft
- Conjunto de datos DUET: https://huggingface.co/datasets/SwetieePawsss/DUET_LLM (commit `2c2b047bb569b205ea57f924b36e818d4e3f3903`)
- Repositorio `open-unlearning`: no disponible como enlace directo en la información proporcionada
- Paper de RMU: no disponible como enlace directo en la información proporcionada
- Scripts de evaluación y sondas (`film_unlearning/scripts/film_gate.py`, `film_unlearning/scripts/partc_job.sh`, `film_unlearning/scripts/film_forget_metrics.py`, `revival_mechanism/src/stage4_revival_sweep.py`, `revival_mechanism/src/stage5_interp/stage9_gate_anatomy.py`, `revival_mechanism/post_cr/scripts/ei_close_subspace_null.py`): rutas relativas a `open-unlearning/experiments/` en el repositorio del proyecto, sin URL pública en la información proporcionada
