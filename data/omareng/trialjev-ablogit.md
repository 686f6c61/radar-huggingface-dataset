# omareng/TrialJev-ABLogit

## Resumen

TrialJev-ABLogit es un adaptador LoRA de investigación desarrollado por Omar Ibrahim (y colaboradores Grant Hamblin y Benjamin Haibe-Kains) para el cribado de elegibilidad de pacientes en ensayos clínicos. El modelo aborda la tarea de emparejamiento paciente-ensayo (patient-trial matching), concretamente la clasificación binaria de pares paciente-criterio como "elegible" o "excluido". Se trata de una ablación ("A/B-logit") del diseño original de TrialJev, en la que la pérdida y la lectura se realizan únicamente sobre los logits que el modelo asigna a las letras "A" y "B" en la última posición de un prompt con opciones letradas, sin cabeza puntero ni generación de texto libre.

El adaptador se construye sobre varios backbones de la familia Qwen3.5 y Qwen3.8 (0.8B, 9B y 27B), todos bajo licencia Apache-2.0. El repositorio contiene seis checkpoints seleccionados (el de menor pérdida de desarrollo en cada configuración), entrenados sobre TREC Clinical Trials 2021 y evaluados sobre 6.975 pares elegible-o-excluido de 50 pacientes no vistos de TREC 2022. La relevancia actual radica en que explora una alternativa de bajo coste computacional (una sola pasada directa, sin decodificación autoregresiva) frente a la evaluación con veredicto escrito, y publica métricas de calibración (Brier, ECE) junto a las de discriminación (AUROC, macro-F1).

Es un artefacto de previsualización de investigación, no un producto clínico: el propio autor advierte explícitamente que no debe usarse para decisiones clínicas, inscripción en ensayos ni atención al paciente. El repositorio ocupa 1,5 GB y no incluye los pesos de los backbones, que deben cargarse desde los modelos upstream en las revisiones indicadas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (rank 16, alpha 32, dropout 0.05) sobre transformers Qwen3.5/Qwen3.8; proyecciones de atención, MLP y Gated DeltaNet |
| Parametros totales | No disponible (adaptador LoRA; los backbones van de 0.8B a 27B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | Entrada: nota de paciente hasta 512 tokens; estado más texto del ensayo hasta 4.096 tokens |
| Tipos de cuantizacion | No disponible (entrenamiento en fp32 a 0.8B y bf16 a 9B y superiores) |
| Idiomas soportados | No disponible (los datos de entrenamiento son notas clínicas en inglés de TREC) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (adaptadores LoRA); `head.pt` es un pickle de PyTorch con tensores de la cabeza puntero |

## Arquitectura y entrenamiento

El adaptador se aplica sobre backbones transformer de la familia Qwen3.5/Qwen3.8. La innovación del diseño "A/B-logit" consiste en formular la clasificación como una elección entre dos opciones letradas: la pérdida es una entropía cruzada sobre los dos logits de las letras "A" y "B" en la última posición, y la inferencia lee esos dos logits en una única pasada directa, sin cabeza puntero adicional ni generación de texto. Esto contrasta con la variante principal de TrialJev, que produce un veredicto escrito y cuya AUROC se obtiene del score de dos vías del primer token. El adaptador no añade parámetros más allá del propio LoRA.

El entrenamiento usa TREC Clinical Trials 2021: 60 pacientes de entrenamiento con 9.302 pares elegible-o-excluido, y 15 pacientes de desarrollo con 2.233 pares. La optimización emplea AdamW con learning rate 1e-4 (one-cycle, 5% de warm-up), weight decay 0.01, gradient clipping 1.0, 3 epochs (1.746 pasos) y batch efectivo de 16. La selección de checkpoint se hace por menor pérdida de desarrollo (cada 100 pasos a 0.8B y cada 200 a 9B y superiores), y el conjunto de test se puntúa una sola vez. La precisión es fp32 para el backbone de 0.8B y bf16 para 9B y superiores. Los datos procesados no se redistribuyen por derivar de temas TREC y texto de registro; el repositorio de código explica cómo reconstruirlos y lista hashes SHA-256.

## Capacidades

- Clasificación binaria de elegibilidad: dado un par paciente-criterio, decide entre "elegible" (A) y "excluido" (B) leyendo los logits de ambas letras.
- Puntuación de una sola pasada: no requiere decodificación autoregresiva, lo que reduce latencia frente a variantes generativas.
- Producción de una probabilidad implícita P(eligible) a partir del score de dos vías, útil para AUROC y para umbrales ajustables.
- Adaptación eficiente mediante LoRA sobre múltiples backbones (0.8B, 9B, 27B), reutilizando pesos upstream sin duplicarlos.
- No soporta tool calling ni function calling (no documentado).
- No soporta agentes ni razonamiento multi-paso (no documentado).
- No genera explicaciones ni justificaciones del veredicto.
- Capacidades multilingües no documentadas; el entrenamiento es en inglés clínico.

## Casos de uso

- Cribado previo de elegibilidad en pipelines de reclutamiento: el modelo puntúa pares paciente-criterio de forma binaria en una sola pasada, lo que permite filtrar candidatos antes de la revisión humana en estudios con muchos criterios de inclusión y exclusión.
- Priorización de pacientes para revisión manual: usando P(eligible) como ranking, un equipo de coordinación de ensayos puede ordenar los pares y concentrar el esfuerzo humano en los casos limítrofes, ajustando el umbral sobre datos de desarrollo.
- Investigación en NLP clínico: sirve como línea base reproducible para estudiar el compromiso entre calibración (Brier, ECE) y discriminación (AUROC) en tareas de emparejamiento paciente-ensayo.
- Evaluación comparativa de backbones: al ofrecer checkpoints sobre 0.8B, 9B y 27B con la misma receta, permite medir el efecto del tamaño del modelo en la precisión de cribado con un coste de adaptación bajo.
- Prototipado de asistentes de preevaluación: integrado en herramientas internas que asisten a investigadores en la revisión de criterios, siempre con supervisión humana y sin uso para inscripción real.
- Experimentación con formulaciones de clasificación: el diseño A/B-logit es un punto de partida para comparar lectura por logits frente a generación de veredicto en tareas de decisión binaria con contexto largo.
- Despliegue de bajo coste en entornos de investigación: el adaptador de 0.8B permite ejecutar prototipos en hardware modesto, mientras que las variantes de 9B y 27B ofrecen mayor precisión cuando hay GPU disponible.

## Benchmarks y rendimiento

Evaluación sobre 6.975 pares elegible-o-excluido de 50 pacientes no vistos de TREC 2022. La línea base "predecir siempre elegible" obtiene 56,47% de accuracy. Los intervalos de confianza al 95% son de aproximadamente ±3 puntos porque los 50 pacientes de test son las unidades independientes.

| Checkpoint | Backbone | Paso | Accuracy | Macro-F1 | AUROC | Brier | ECE |
|---|---|---:|---:|---:|---:|---:|---:|
| `qwen3.5-0.8b-fresh-seed0` | Qwen3.5-0.8B-Base | 200 | 52,85% | 52,5% | 0,567 | 0,252 | 0,070 |
| `qwen3.5-9b-seed0` | Qwen3.5-9B-Base | 400 | 80,50% | 79,8% | 0,867 | 0,143 | 0,023 |
| `qwen3.5-9b-seed1` | Qwen3.5-9B-Base | 400 | 79,00% | 78,7% | 0,862 | 0,149 | 0,022 |
| `qwen3.5-9b-seed2` | Qwen3.5-9B-Base | 200 | 75,18% | 75,2% | 0,853 | 0,172 | 0,026 |
| `qwen3.5-27b` | Qwen3.5-27B | 400 | 81,25% | 81,0% | 0,884 | 0,136 | 0,028 |
| `qwen3.8-27b` | Qwen3.8-27B | 200 | 78,25% | 78,2% | 0,887 | 0,146 | 0,028 |

## Requisitos de hardware

- El repositorio ocupa 1,5 GB, pero los pesos de los backbones no se incluyen: hay que descargar el modelo Qwen3.5/Qwen3.8 correspondiente desde su repositorio upstream en la revisión indicada.
- VRAM estimada para el backbone de 0.8B: apta para GPU de consumo; el adaptador añade una sobrecarga mínima.
- VRAM estimada para el backbone de 9B: requiere GPU de gama alta o profesional; no cabe en GPUs de consumo de 8-12 GB con precisión completa.
- VRAM estimada para el backbone de 27B: requiere GPUs profesionales (A100, H100 o equivalentes) o cuantización del backbone, no documentada en esta ficha.
- Opciones de despliegue: la evaluación oficial se realiza con el repositorio de código (`scripts/train_lora_letter.py eval`), cargando el adaptador PEFT sobre el backbone upstream. No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles; el diseño de una sola pasada elimina la decodificación autoregresiva, lo que en principio reduce la latencia frente a la variante de veredicto escrito, pero no se publican cifras.
- Nota de seguridad: `head.pt` es un pickle de PyTorch y debe cargarse solo desde este repositorio.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| TrialJev-ABLogit (este) | Adaptador LoRA sobre 0.8B-27B | 4.096 tokens de entrada | Clasificación A/B por logits, una pasada | Apache-2.0 | HuggingFace (adaptador) |
| TrialJev (variante principal) | Adaptador LoRA sobre 0.8B-27B | 4.096 tokens de entrada | Veredicto escrito, lectura del primer token | Apache-2.0 | HuggingFace y repositorio de código |
| MedJev / kev (referencias de diseño) | No disponible | No disponible | Diseño adoptado por TrialJev | Apache-2.0 | No disponible |

No se dispone de datos de benchmarks de MedJev ni de kev en la información proporcionada para una comparación numérica.

## Limitaciones y advertencias

- Uso exclusivamente de investigación: no debe emplearse para decisiones clínicas, inscripción en ensayos ni atención al paciente.
- Un único benchmark de 50 pacientes sintéticos; los intervalos de confianza al 95% son de aproximadamente ±3 puntos.
- Los pares evaluados ya habían sido juzgados como relevantes por los evaluadores: no se evalúa la recuperación, solo la clasificación.
- Notas de paciente sintéticas y cortas; el rendimiento sobre notas clínicas reales y largas no está caracterizado.
- No produce explicaciones ni justificaciones del veredicto, lo que limita la auditoría clínica.
- Los scores no son probabilidades calibradas: el umbral debe elegirse sobre datos de desarrollo. Un AUROC más alto con mayor ECE implica mejor ordenación pero peor calibración de escala.
- Solo hay una semilla en los modelos de 27B, lo que reduce la fiabilidad de esas cifras.
- Los checkpoints seed-0 de 9B y 27B no registraron la revisión del backbone en el momento del entrenamiento; la revisión mostrada es la única instantánea en la caché.
- El adaptador de 0.8B rinde por debajo de la línea base trivial (52,85% frente a 56,47%).
- Riesgo de sesgo: los datos provienen de TREC y ClinicalTrials.gov, con posible infrarrepresentación de poblaciones y criterios poco frecuentes; no se documenta un análisis de sesgo.
- Los datos procesados no se redistribuyen; la reproducibilidad depende de reconstruirlos con el repositorio de código.
- `head.pt` es un pickle de PyTorch: riesgo de ejecución de código al cargarlo desde fuentes no confiables.

## Enlaces

- HuggingFace: https://huggingface.co/omareng/TrialJev-ABLogit
- Repositorio de código: https://github.com/oibrahi1/TrialJev
- Documentación de resultados: `docs/RESULTS.md` en el repositorio de código
- Backbone Qwen3.5-0.8B-Base: https://huggingface.co/Qwen/Qwen3.5-0.8B-Base
- Backbone Qwen3.5-9B-Base: https://huggingface.co/Qwen/Qwen3.5-9B-Base
- Backbone Qwen3.5-27B: https://huggingface.co/Qwen/Qwen3.5-27B
- Backbone Qwen3.8-27B: https://huggingface.co/Qwen/Qwen3.8-27B
- Cita: Ibrahim, Hamblin y Haibe-Kains (2026), "TrialJev: Open-Weight Single-Pass Eligibility Scoring for Patient-Trial Screening"
