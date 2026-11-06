# AnniBori/Llama-3.1-8B-Instruct-DUET-film-RMU-rare-s2

## Resumen

Llama-3.1-8B-Instruct-DUET-film-RMU-rare-s2 es un checkpoint de investigación publicado por AnniBori que aplica *machine unlearning* sobre un fine-tune previo de Llama-3.1-8B-Instruct. El punto de partida es el modelo `AnniBori/Llama-3.1-8B-Instruct-DUET-film-ft`, entrenado durante 6 épocas sobre el conjunto de películas DUET; sobre él se aplica la técnica RMU (Representation Misdirection for Unlearning) para eliminar el conocimiento de un subconjunto concreto de hechos: el *forget set* de películas "raras" (411 pares película-director).

El objetivo no es producir un asistente generalista, sino servir como artefacto experimental para estudiar hasta qué punto una técnica de desaprendizaje borra información factual manteniendo el resto de capacidades. El resultado declarado es una caída de la recall en el conjunto olvidado del 0,842 (base) al 0,056, con una recall retenida de 0,771 sobre el conjunto de retención (546 hechos). El modelo tiene 8.030.261.248 parámetros y se distribuye en safetensors bajo licencia Llama 3.1.

Su relevancia es metodológica: documenta de forma reproducible la receta completa (configuración de RMU, selección de época por umbrales de ROUGE-L, sondas de relearning con LoRA de rango 4 y ablación de subespacios) y expone las métricas época a época, lo que permite auditar el compromiso entre olvido y retención.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Llama 3.1), derivado de Llama-3.1-8B-Instruct |
| Parametros totales | 8.030.261.248 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada de Llama 3.1, no verificada en la model card) |
| Tipos de cuantizacion | no disponible (solo se publican pesos safetensors en bf16; el entrenamiento uso `paged_adamw_8bit` para el optimizador) |
| Idiomas soportados | no disponible en la informacion proporcionada |
| Licencia | llama3.1 |
| Formato de pesos | safetensors (libreria transformers; repo de 16,1 GB) |

## Arquitectura y entrenamiento

La arquitectura es la de Llama-3.1-8B-Instruct sin modificaciones estructurales: un transformer decoder-only denso de 8.030 millones de parámetros. El pipeline tiene tres etapas. Primero, un fine-tune sobre el conjunto DUET (configuración `film`) que da lugar a `AnniBori/Llama-3.1-8B-Instruct-DUET-film-ft` (época 6). Segundo, el desaprendizaje con RMU ejecutado mediante `open-unlearning` (`src/train.py --config-name=unlearn.yaml experiment=revival_mechanism/unlearn/duet_8B_RMU`), con coeficiente de steering 2 aplicado en `model.layers.15`, gamma 1, alpha 1 y pérdida de retención EMBED_DIFF. Tercero, la selección de checkpoint.

Los datos de desaprendizaje proceden de `SwetieePawsss/DUET_LLM`, configuración `film`, commit `2c2b047bb569b205ea57f924b36e818d4e3f3903`: el *forget set* `forget_rare_film` con 411 hechos película-director (filas con `split_role = train`) y el *retain set* `retain_film` con 546 hechos. El entrenamiento usó lr 1e-5, 8 épocas, batch 4 con acumulación de gradiente 4 (26 pasos por época), warmup de 1 época, weight decay 0,01, `paged_adamw_8bit` y bf16, con semilla 2 y checkpoint al final de cada época.

La selección de época sigue un criterio preregistrado: se considera "cualificada" toda época con recall ROUGE-L en generación libre (greedy, 64 tokens nuevos) sobre el conjunto olvidado ≤ 0,15 y recall retenida ≥ recall base − 0,30 en términos absolutos (base 0,842, suelo 0,542). Entre las cualificadas se elige la de mayor diferencia retención − olvido, que resulta ser la época 7. La evaluación se hace con la plantilla de chat de Llama 3.1 y un system prompt fijo: `You are terse and fact-only QA assistant. Reply to the question clearly with few-words correct answer.`

## Capacidades

- Generación de texto conversacional y respuesta factual breve, en el formato QA conciso para el que fue entrenado.
- Retención de conocimiento factual general: recall de 0,771 sobre el conjunto de retención de 546 hechos de películas.
- Olvido selectivo verificado del subconjunto `forget_rare_film`: recall de 0,056 frente a 0,842 del modelo base.
- Soporte del chat template de Llama 3.1 (turno de sistema más turno de usuario).
- Compatibilidad con text-generation-inference y endpoints compatibles, según los tags del repositorio.
- No se documentan en la información disponible capacidades de tool calling, razonamiento multi-paso, agentes, visión, audio ni modo *thinking*.

## Casos de uso

- Investigación en machine unlearning: servir como checkpoint de referencia para reproducir la receta RMU sobre el conjunto DUET film y comparar curvas de olvido/retención época a época con las publicadas (0,674 → 0,056 en forget recall).
- Auditoría de borrado de datos: evaluar si un pipeline de eliminación de hechos concretos (411 pares película-director) cumple umbrales operativos de recall antes de desplegarse en un sistema real.
- Pruebas de relearning: usar las sondas incluidas (`stage4_revival_sweep.py`, LoRA de rango 4, semilla 42, pasos 1-256) para medir la robustez del olvido frente a un fine-tune posterior de bajo rango.
- Análisis de subespacios de representación: emplear `stage9_gate_anatomy.py` y el nulo emparejado `ei_close_subspace_null.py` para estudiar qué direcciones internas codifican la información borrada.
- Evaluación de ataques y paráfrasis: el script `film_gate.py` (`gen_eval`) permite medir la fuga de información con conjuntos de paráfrasis y de ataque, útil para validar defensas antes de certificar un borrado.
- Línea base en estudios de compromiso olvido-retención: comparar el punto 0,056 / 0,771 con otras técnicas de desaprendizaje sobre el mismo conjunto y el mismo modelo de partida.
- Docencia y experimentación reproducible: el modelo y los scripts asociados permiten montar prácticas sobre un caso real de unlearning con métricas y umbrales definidos de antemano.

## Benchmarks y rendimiento

Los únicos datos publicados son las métricas de olvido y retención por época (ROUGE-L recall en generación libre, greedy, 64 tokens nuevos):

| Epoca | Forget recall | Retain recall |
|---|---|---|
| 1 | 0,674 | 0,627 |
| 2 | 0,529 | 0,674 |
| 3 | 0,189 | 0,667 |
| 4 | 0,064 | 0,708 |
| 5 | 0,065 | 0,755 |
| 6 | 0,054 | 0,764 |
| 7 (seleccionada) | 0,056 | 0,771 |
| 8 | 0,058 | 0,766 |

Referencia del modelo base: retain recall 0,842; suelo admitido 0,542. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 16 GB solo para pesos, más overhead de activaciones y caché KV; en torno a 18-20 GB en la práctica para contextos moderados.
- Cuantización a 8 bits: alrededor de 8-9 GB de pesos. A 4 bits: alrededor de 4,5-5 GB de pesos. Estas estimaciones son cálculo a partir del número de parámetros, no datos publicados por el autor.
- GPU profesionales: A100 40/80 GB, H100, L40S y A10G son adecuadas; una sola A100 40 GB cubre bf16 con contexto amplio.
- GPU de consumo: cabe en RTX 4090 (24 GB) en bf16 con contexto limitado, y en RTX 3090/4080 con cuantización 8 o 4 bits. En GPUs de 8-12 GB solo es viable con cuantización agresiva.
- Despliegue: transformers de forma nativa; los tags indican compatibilidad con text-generation-inference y endpoints compatibles. No se documentan recetas para vLLM, llama.cpp, Ollama ni TGI más allá de la etiqueta.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Olvido (forget recall) | Retencion (retain recall) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Este modelo (epoca 7) | 8,03 B | no disponible | 0,056 | 0,771 | llama3.1 | Hugging Face, safetensors |
| AnniBori/Llama-3.1-8B-Instruct-DUET-film-ft (base del unlearning) | 8,03 B | no disponible | 0,842 (referencia) | 0,842 | llama3.1 | Hugging Face, safetensors |
| Llama-3.1-8B-Instruct (modelo original) | 8,03 B | no disponible | no evaluado en esta ficha | no evaluado en esta ficha | llama3.1 | Hugging Face, safetensors |

La comparación con el fine-tune intermedio es la más informativa: el desaprendizaje reduce la recall del conjunto olvidado en 0,786 puntos absolutos a costa de 0,071 puntos de retención. No se dispone de datos de otras técnicas de unlearning aplicadas al mismo conjunto para comparar.

## Limitaciones y advertencias

- Es un artefacto de investigación, no un asistente de propósito general: el fine-tune previo y el system prompt lo orientan a respuestas factuales muy breves.
- El olvido no es necesariamente completo: la recall de 0,056 implica que una fracción de los hechos del conjunto olvidado sigue siendo recuperable, y los conjuntos de paráfrasis y ataque del pipeline están precisamente para medir esa fuga.
- El olvido puede revertirse parcialmente con fine-tune posterior; las sondas de relearning del propio autor (LoRA de rango 4, hasta 256 pasos) existen para cuantificar ese riesgo.
- La selección de época se hizo sobre las mismas métricas de evaluación (ROUGE-L recall con umbrales fijados de antemano), lo que puede sobreajustar la elección al conjunto de evaluación; el suelo de retención de 0,542 es permisivo frente a los 0,842 del modelo base.
- Licencia llama3.1: el uso comercial está sujeto a los términos de la licencia de Meta para Llama 3.1, no a una licencia permisiva tipo Apache o MIT; conviene revisar las cláusulas de atribución y de uso aceptable antes de cualquier despliegue.
- Sesgos: no se documenta ninguna evaluación de sesgos, toxicidad ni seguridad en la información disponible; al derivar de Llama 3.1 hereda los sesgos del modelo original sin mitigaciones adicionales.
- Idiomas: no se especifican los idiomas soportados; el entrenamiento y la evaluación se hicieron en inglés según los conjuntos DUET.
- Riesgo de alucinación: el formato de respuesta corta y factual no incorpora mecanismos de abstención ni de citación de fuentes.
- Sin métricas de benchmarks estándar ni datos de throughput, por lo que no es posible estimar su calidad general fuera del dominio de películas evaluado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AnniBori/Llama-3.1-8B-Instruct-DUET-film-RMU-rare-s2
- Modelo base del unlearning: https://huggingface.co/AnniBori/Llama-3.1-8B-Instruct-DUET-film-ft
- Conjunto de datos DUET: https://huggingface.co/datasets/SwetieePawsss/DUET_LLM (commit `2c2b047bb569b205ea57f924b36e818d4e3f3903`)
- Framework open-unlearning: no se proporciona URL en la información disponible
- Scripts de evaluación y sondas (`film_gate.py`, `partc_job.sh`, `film_forget_metrics.py`, `stage4_revival_sweep.py`, `stage9_gate_anatomy.py`, `ei_close_subspace_null.py`): rutas relativas a `open-unlearning/experiments/` en el repositorio del proyecto; no se proporciona URL en la información disponible
