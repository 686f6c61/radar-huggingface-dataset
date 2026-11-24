# devops-thiago/classone-qwen3.5-4b

## Resumen

ClassOne Qwen3.5-4B (`v1_1_merge_0.40_0.60`) es un modelo de decisión de "Sistema 1" construido sobre el backbone de Qwen/Qwen3.5-4B mediante la arquitectura ClassOne (Classifier One), desarrollada por el autor `devops-thiago`. No es un modelo generativo de propósito general: está diseñado para emitir decisiones categóricas y calibradas (clasificación de intención, enrutamiento de consultas, respuestas sí/no y puntuaciones ordinales por rúbrica) sobre un contexto conversacional dado.

Técnicamente combina una lectura por token único a través del LM-head (con rerouting de shortlist top-16 cuando el número de candidatos K es mayor o igual a 64, mecanismo denominado M2) junto con cabezas puntero específicas (`noul` para sí/no, `score` para rúbricas ordinales y `choice` para selección entre opciones). El resultado es un artefacto standalone en safetensors BF16 de unos 4.539 millones de parámetros, con licencia Apache 2.0.

Su relevancia radica en el enfoque: en lugar de pedir a un LLM que genere texto libre y parsear la respuesta, el modelo lee la decisión directamente de la distribución del LM-head y de cabezas entrenadas, lo que reduce latencia y variabilidad en pipelines de enrutamiento y evaluación automatizada. El modelo se publica como draft local en la model card, con procedencia de evaluación auto-medida y pendiente de validación externa sellada.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder (backbone Qwen3.5-4B) con cabezas ClassOne (LM-head readout, noul, score, choice) |
| Parámetros totales | 4.539.265.536 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos publicados en BF16) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (BF16, dos shards) + `classone_heads.pt` |

## Arquitectura y entrenamiento

El modelo parte del backbone denso de Qwen3.5-4B y le superpone la arquitectura ClassOne. La decisión se obtiene por dos vías complementarias: una lectura de token único sobre el LM-head (con rerouting M2 a shortlist top-16 cuando K >= 64 candidatos) para decisiones categóricas, y cabezas puntero dedicadas para sí/no (`noul`) y puntuaciones ordinales (`score`). La configuración por defecto del servidor Stage 2 fija `eval_mode = "stage2"`, `m2_k_threshold = 64` y `m2_top_k = 16`.

El entrenamiento documentado corresponde al Stage 2 y a la receta de merge `v1_1_merge_0.40_0.60`: el backbone se obtiene como `W_base + 0.40 * delta(stage2b_w2c_micro_step250) + 0.60 * delta(fresh_step200)`. La rama `stage2b_w2c_micro_step250` ejecuta 250 pasos con `lr=3e-5` coseno y `kl_weight=0.05` partiendo de `stage2b_step400`, sobre 1.000 ítems MCQ de 4 vías `When2Call` más 1.000 ítems de replay. Las cabezas se mezclan con la misma proporción: `0.40 * heads(stage2b_w2c_micro_step250) + 0.60 * heads(fresh_step200)`. No se detalla en la información disponible el volumen total de tokens de entrenamiento ni la composición completa del dataset más allá de estos conjuntos.

La innovación principal es el enfoque de "readout" de decisión: se evita la generación autoregresiva de texto para la respuesta final, leyendo directamente la señal del LM-head y de cabezas calibradas. Además, la versión `v1.1` incorpora una remediación de enrutamiento de herramientas de 4 vías (`#62 When2Call`), que eleva la habilidad ajustada por azar de 23,56 a 62,67 en el slice `sample-0.3-unseen`.

## Capacidades

- Toma de decisiones categóricas: selección entre un conjunto de opciones definido por el usuario (enrutamiento, clasificación de intención, etiquetado).
- Respuestas booleanas calibradas mediante la cabeza `noul` (por ejemplo, "¿el cliente solicita un reembolso?").
- Puntuaciones ordinales por rúbrica mediante la cabeza `score`.
- Lectura de decisión por token único sobre el LM-head, con rerouting M2 a top-16 cuando hay 64 o más candidatos.
- Enrutamiento de estrategia de respuesta de 4 vías (`When2Call`) para decidir cuándo invocar herramientas.
- Procesamiento de contexto conversacional estructurado (estado de la conversación y preguntas con criterios).
- No se documentan capacidades generativas de texto libre, visión, audio ni soporte multilingüe explícito.

## Casos de uso

- Enrutamiento de tickets de soporte: dado un estado de conversación con el mensaje del cliente, el modelo selecciona la cola adecuada (`billing`, `tech`, etc.) mediante `ChoiceQuestion`, leyendo la decisión del LM-head sin generación de texto y con menor latencia que un LLM generativo.
- Detección de intención de reembolso: con una `NoulQuestion` ("¿el cliente solicita un reembolso?"), el modelo emite una respuesta sí/no calibrada apta para disparar flujos automáticos de atención al cliente.
- Evaluación automática por rúbrica: la cabeza `score` permite puntuar respuestas o artefactos según criterios ordinales, útil en pipelines de evaluación de calidad de contenido o de agentes.
- Decisión de invocación de herramientas: el enrutamiento `When2Call` de 4 vías decide si el sistema debe llamar a una herramienta, responder directamente o escalar, integrándose en orquestadores de agentes.
- Clasificación por lotes de alto volumen: al no requerir decodificación autoregresiva, el modelo es adecuado para etiquetar grandes volúmenes de peticiones (1.700 en el slice de evaluación) con coste por ítem reducido.
- Triaje en pipelines de CI/CD o monitorización: clasificación de alertas o mensajes de error en categorías predefinidas mediante `ChoiceQuestion`, con criterios explícitos por categoría.
- Moderación o filtrado booleano: uso de `NoulQuestion` para preguntas de política ("¿este contenido viola la política X?") con salida calibrada.

## Benchmarks y rendimiento

Resultados auto-medidos en `sample-0.3-unseen` (n=1.700 peticiones, seed 20261118), ejecutados localmente en 2x NVIDIA RTX 5060 Ti 16 GB (fecha 2026-11-18, commit 44eb26c). `Disjoint-36` es la métrica primaria del Decision Index.

| Candidato | Disjoint-36 | Official DI 0.3 | Disjoint-39 | Raw Index | #62 When2Call |
|---|---|---|---|---|---|
| `v0.2.3` Config A (baseline legacy) | 26,44 | 26,95 | — | 44,51 | 18,23 |
| Qwen3.5-4B Base Chat LM (M2 K>=64) | 35,20 | 36,50 | 35,36 | 52,47 | 50,23 |
| `stage2b_step400` (M2 K>=64) | 36,24 | 37,58 | 36,60 | 53,30 | 20,00 |
| `merge_0.50_0.50` (M2 K>=64) | 37,21 | 38,90 | 37,64 | 54,60 | 23,56 |
| `v1_merge_0.40_0.60` (051ff9c) | 36,98 | 39,20 | 37,42 | 54,80 | 23,56 |
| **`v1_1_merge_0.40_0.60`** | no disponible (fila truncada) | no disponible | no disponible | no disponible | 62,67 (reportado en texto) |

Desglose por área (`d36` Area Skill, formato `know / lang / ret / tools / arts`) para los candidatos con datos: Qwen3.5-4B Base `18,88 / 28,27 / 39,41 / 62,85 / 26,58`; `stage2b_step400` `16,82 / 29,50 / 42,78 / 67,31 / 24,81`; `merge_0.50_0.50` `16,18 / 31,46 / 41,12 / 69,19 / 28,08`; `v1_merge_0.40_0.60` `17,79 / 32,87 / 41,78 / 67,27 / 25,20`. Los resultados del candidato final `v1_1` no aparecen completos en la información disponible. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos BF16 suman aproximadamente 9,1 GB (4.539 millones de parámetros), más el overhead de activaciones y de las cabezas; no se dispone de cifras oficiales de VRAM pico.
- GPU utilizadas en la evaluación del autor: 2x NVIDIA RTX 5060 Ti 16 GB.
- Cabe en GPU de consumo: sí, en tarjetas con al menos 12-16 GB de VRAM en BF16 (estimación por tamaño de pesos); no confirmado oficialmente.
- Opciones de despliegue: la model card documenta uso con `transformers` y el paquete `classone` (`ClassOneModel.from_backbone`, `evaluate_stage2_request`), con `torch_dtype=torch.bfloat16`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia |
|---|---|---|---|---|
| ClassOne Qwen3.5-4B | 4.539 M | no disponible | Decisión Sistema 1 con readout de LM-head y cabezas | Apache 2.0 |
| Qwen3.5-4B (base) | ~4 B | no disponible | LLM generativo de propósito general | no disponible en la información |
| `merge_0.50_0.50` (variante del mismo autor) | 4.539 M | no disponible | Misma arquitectura, mezcla 0.50/0.50 | Apache 2.0 |
| `stage2b_step400` (variante del mismo autor) | 4.539 M | no disponible | Misma arquitectura, checkpoint intermedio | Apache 2.0 |

No se dispone de datos de modelos externos comparables de la misma categoría (modelos de decisión dedicados) en la información proporcionada.

## Limitaciones y advertencias

- Estado draft: la model card indica que el artefacto `v1_1_merge_0.40_0.60` está preparado localmente y aún no publicado formalmente en el Hub; los pesos del repositorio pueden no corresponder a la versión descrita.
- Evaluación auto-medida: los benchmarks proceden de ejecución local del autor, no de una evaluación sellada por terceros; la sección "Official Results (Benchmark Heaven)" no se incluye en la información disponible.
- Sesgo de selección: `sample-0.3-unseen` se usó como criterio de aceptación del modelo, por lo que ya no es un holdout limpio; el slice limpio `sample-0.3-unseen-v2` está congelado pero sin resultados publicados.
- No es un modelo generativo: no debe emplearse para generar texto libre, resumir o conversar; su salida es una decisión estructurada.
- Idiomas soportados no documentados: no hay garantía de comportamiento multilingüe.
- Longitud de contexto no disponible: no se puede planificar su uso con contextos largos sin verificación previa.
- Riesgo de alucinación en la lectura del LM-head: la decisión se extrae de una distribución sobre tokens, lo que puede producir elecciones no válidas si las opciones no están bien delimitadas.
- Dependencia de código remoto: el uso requiere `trust_remote_code=True` y el paquete `classone`, lo que añade superficie de riesgo en producción.
- Licencia Apache 2.0 permite uso comercial, pero la procedencia y madurez del artefacto aconsejan validación propia antes de desplegarlo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/devops-thiago/classone-qwen3.5-4b
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Repositorio de la arquitectura ClassOne: https://github.com/devops-thiago/class-one
