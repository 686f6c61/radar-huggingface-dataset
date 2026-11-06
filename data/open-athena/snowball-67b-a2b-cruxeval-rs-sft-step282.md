# open-athena/Snowball-67B-A2B-CruxEval-RS-SFT-Step282

## Resumen

Snowball-67B-A2B-CruxEval-RS-SFT-Step282 es un checkpoint de ajuste fino supervisado (SFT) por muestreo de rechazo (rejection sampling) sobre el modelo base open-athena/Snowball-67B-A2B-10T-Mixed-RLVR-Sync-Step92, denominado "estudiante B" en el experimento. Lo publica el proyecto open-athena dentro de la infraestructura Marin y forma parte de un experimento de destilación de un único experto (expert E) sobre tareas de evaluación de código tipo CruxEval. El modelo tiene 67.078.882.816 parámetros totales (unos 67B) en un formato de mezcla de expertos con 2B de parámetros activos por token, según la nomenclatura A2B del identificador.

El modelo resuelve el problema de transferir capacidad de ejecución y razonamiento de código desde un experto (E) a un estudiante (B) mediante SFT sobre las primeras muestras correctas en ejecución de un pool de k=8 por prompt, cubriendo 1.503 de 1.600 prompts. Es relevante ahora porque documenta de forma reproducible (con informes de experimento, hashes y contabilidad de GPU-horas) una receta de destilación con rechazo aplicada a un modelo MoE de 67B, y porque sus pesos están liberados con licencia Apache 2.0 y verificación sha256 frente a la fuente original.

La arquitectura subyacente es un transformer con mezcla de expertos (tag `grug_moe`), entrenado con el stack Marin/Levanter. El contexto de evaluación se fijó en 32.768 tokens con un límite de generación de 30.720 tokens y modo thinking activado. El checkpoint seleccionado es el de la época 3 (paso 282), elegido tras descartar el checkpoint final por una caída en una dirección de evaluación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos (tag `grug_moe`, stack Marin/Levanter) |
| Parametros totales | 67.078.882.816 (67B) |
| Parametros activos | Aproximadamente 2B por token (según nomenclatura A2B; cifra exacta no disponible) |
| Longitud de contexto | 32.768 tokens en la configuración de evaluación (contexto nativo de entrenamiento no disponible) |
| Tipos de cuantizacion | No disponible (solo se publican pesos safetensors en precisión de entrenamiento) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (shards), con `config.json`, `generation_config.json`, tokenizer y `chat_template.jinja` |

## Arquitectura y entrenamiento

El modelo es un transformer con mezcla de expertos (MoE) del linaje Snowball, con 67B parámetros totales y aproximadamente 2B activos por token. El router se mantuvo congelado durante el ajuste fino ("frozen router bias"), lo que preserva el enrutamiento aprendido en el modelo base y limita el ajuste a los expertos y capas compartidas. El tokenizer y la plantilla de chat son los del estudiante B, sin cambios.

El entrenamiento consistió en SFT por muestreo de rechazo: para cada prompt se generaron k=8 muestras con el experto E y se seleccionó la primera muestra correcta en ejecución, cubriendo 1.503 de 1.600 prompts. Se usó AdamW con LR 1e-6, betas 0.9/0.999, weight decay 0, grad clip 1.0, batch 16, 376 actualizaciones en 4 épocas, sobre 32 H100 con un total de 57,4 H100-horas. El framework fue Levanter. El checkpoint publicado corresponde al paso 282 (época 3). La evaluación se realizó con Evalchemy (commit ae362881) sobre vLLM con 8 H100, contexto de 32.768 tokens, tope de generación de 30.720 tokens, thinking activado y muestreo sin semilla a temperatura 1.0.

## Capacidades

- Generación de texto y razonamiento general, con modo thinking activado en la configuración de evaluación.
- Razonamiento matemático: GSM8K 93,5 y MATH500 93,6 en la evaluación congelada.
- Ejecución y razonamiento sobre código: CruxEval 80,8 / 77,9 (media de dos pasadas) y HumanEval+ 77,4.
- Resolución de problemas de programación competitiva y benchmarks tipo MBPP+ (74,1) y OlympiadBench (45,7).
- Conocimiento general y factual evaluado con MMLU-Pro (61,4), GPQA-Diamond (52,0), PIQA (82,7), Winogrande (75,0) y BoolQ (84,4).
- Tool calling y function calling: evaluado mediante BFCL-parity-pi (2,4), lo que indica capacidad limitada en este eje.
- Agentes multi-paso: evaluado en Tau3-pi (7,7), SWE-bench-verified pendiente (`running`) y SOTOPIA-hard pendiente.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Capacidades de visión o audio: no disponibles.

## Casos de uso

- Destilación de capacidad de código desde un experto mayor: el modelo sirve como estudiante B en pipelines de destilación por rejection sampling, replicando la receta documentada (k=8, primera muestra correcta en ejecución) para transferir habilidades de ejecución de código a un MoE de 67B con solo 2B activos.
- Evaluación comparativa de recetas de ajuste: al publicarse junto a OPD75 y a los checkpoints base B y v0, permite medir el efecto aislado del SFT por rechazo sobre CruxEval, GSM8K y MATH500 con un evaluador congelado y reproducible.
- Generación de código en producción con coste de inferencia reducido: al activar solo unos 2B parámetros por token, es adecuado para servir completaciones de código y razonamiento matemático en clústeres con vLLM y contexto de 32K.
- Investigación sobre enrutamiento MoE: el router congelado y la comparación con el modelo base permiten estudiar cómo el ajuste fino de expertos afecta al rendimiento sin alterar la política de enrutamiento.
- Razonamiento matemático asistido: con GSM8K 93,5 y MATH500 93,6, puede emplearse en sistemas de resolución de problemas paso a paso con thinking activado y generación larga (hasta 30.720 tokens).
- Reproducibilidad de experimentos a gran escala: la provenance completa (S3, job de entrenamiento, hashes sha256 y contabilidad de GPU-horas) lo convierte en una pieza útil para auditar recetas de entrenamiento en el ecosistema Marin.
- Base para posteriores ajustes (RLVR, DPO): al ser un checkpoint intermedio de una campaña mayor, sirve como punto de partida para etapas posteriores de alineamiento o refuerzo.

## Benchmarks y rendimiento

Resultados de la evaluación congelada (Evalchemy ae362881, vLLM H100x8, contexto 32.768, generación máxima 30.720, thinking on, temperatura 1.0, sin semilla). Porcentajes.

| Benchmark | RS282 (este modelo) | OPD75 | B (base) | v0 |
|---|---|---|---|---|
| MATH500 | 92,6 | 91,2 | 89,6 | 93,2 |
| HumanEval+ | 77,4 | 74,4 | 68,9 | 69,5 |
| MBPP+ | 74,1† | 69,6† | 72,5 | 68,8 |
| OlympiadBench | 45,7 | 42,3 | 42,7 | 33,7 |
| GSM8K (0-shot) | 91,7† | 88,6 | 89,3 | 84,2 |
| PIQA | 82,7 | 82,7 | 82,2 | 82,3 |
| Winogrande | 75,0 | 75,7 | 72,8 | 76,7 |
| BoolQ | 84,4 | 85,1 | 84,1 | 85,0 |
| TruthfulQA | 59,0 | 57,4 | 58,2 | 48,1 |
| TriviaQA | 44,4† | 55,7 | 65,5 | 58,5 |
| AIME24 | 60,3† | 53,7 | 47,0 | 74,0 |
| MMLU-Pro | 61,4† | 59,5† | 43,6 | 70,7 |
| GPQA-Diamond | 52,0† | 46,5† | 42,9 | 64,8 |
| CruxEval | 79,6† | 75,4† | 57,6 | 65,1 |
| FinanceBench | 38,0† | 52,0† | 58,0 | 52,0 |
| IFBench | 29,3 | 28,7 | 31,0 | 25,0 |
| MRCR | 12,2 | 13,5 | 12,3 | 17,3 |
| NUPA | 33,3; formato válido 62,8%† | 35,3† | 40,6 | 46,6 |
| SWE-bench-verified | running | running | 7,9 | 30,9 |
| OT-TBLite-recovery | 10,9† | 9,3† | 5,6 | 23,9 |
| TB2-recovery | 5,0† | 4,2† | 1,2 | 11,2 |
| DS-1000-local | 23,0† | running | 18,0 | 41,5 |
| BFCL-parity-pi | 4,1† | 8,1† | 16,3 | 33,3 |
| BixBench-pi | 2,4† | 7,5† | 0,5 | 17,6 |
| Tau3-pi | 7,7 | running | 8,3 | 5,0 |
| SOTOPIA-hard | running | running | 61,3 | 64,7 |

La evaluación principal de la model card (CruxEval 80,8 / 77,9, GSM8K 93,5, MATH500 93,6) difiere ligeramente de la tabla de la política de evaluación de 2026-10-16, que es la fuente de referencia para comparaciones entre modelos. La celda † indica matices específicos de la celda (evidencia de fuga, parseo, cobertura incompleta o métrica particular).

## Requisitos de hardware

- VRAM estimada para inferencia: el repo ocupa 134,2 GB en safetensors, por lo que en precisión de entrenamiento requiere al menos 2 GPU de 80 GB (A100/H100) o 4 GPU de 48 GB. Con cuantización a 8 bits se situaría en torno a 67-70 GB; a 4 bits, en torno a 34-36 GB. Estas cifras son estimaciones a partir del tamaño de los pesos, no datos publicados.
- GPU recomendadas: H100 (la evaluación se ejecutó con 8x H100), A100 80 GB, y para cuantización agresiva, RTX 4090 24 GB no sería suficiente en 4 bits para los 67B completos.
- Cabe en GPU de consumo: solo con cuantización a 4 bits y reparto entre varias GPU (por ejemplo, 2x RTX 4090), no en una sola.
- Opciones de despliegue: vLLM (usado en la evaluación oficial), llama.cpp/Ollama para GGUF (requiere conversión, no se publican GGUF), TGI y Levanter para carga nativa.
- Latencia y throughput: no disponibles. La model card reporta 57,4 H100-horas para el entrenamiento completo, no métricas de inferencia.

## Comparativa con modelos similares

| Modelo | Parámetros | Activos | Contexto | CruxEval | GSM8K | MATH500 | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|---|---|
| Snowball-67B-A2B-CruxEval-RS-SFT-Step282 | 67B | ~2B | 32.768 (eval) | 79,6 | 91,7 | 92,6 | Apache 2.0 | Hugging Face |
| Snowball-67B-A2B-CruxEval-OPD-Step75 | 67B | ~2B | 32.768 (eval) | 75,4 | 88,6 | 91,2 | Apache 2.0 | Hugging Face |
| Snowball-67B-A2B-10T-Mixed-RLVR-Sync-Step92 (B) | 67B | ~2B | 32.768 (eval) | 57,6 | 89,3 | 89,6 | Apache 2.0 | Hugging Face |
| v0 (snapshot de contexto 10-15) | no disponible | no disponible | no disponible | 65,1 | 84,2 | 93,2 | no disponible | no disponible |

La comparación se limita a los modelos de la misma campaña experimental, ya que no se dispone de datos de benchmarks de modelos externos en la información proporcionada. Destaca que v0 supera a RS282 en AIME24 (74,0 frente a 60,3), MMLU-Pro (70,7 frente a 61,4) y GPQA-Diamond (64,8 frente a 52,0), mientras que RS282 lidera en CruxEval, GSM8K, MATH500 y HumanEval+.

## Limitaciones y advertencias

- El modelo es un checkpoint de investigación de una campaña de destilación, no un modelo de propósito general pulido; su rendimiento en tareas fuera del dominio de código y matemáticas es desigual.
- Riesgo de alucinación: no se han publicado evaluaciones específicas de factualidad más allá de TruthfulQA (59,0) y TriviaQA (44,4), este último notablemente inferior al base B (65,5).
- Capacidad de tool calling y agentes muy limitada: BFCL-parity-pi 4,1, BixBench-pi 2,4 y Tau3-pi 7,7, por debajo del modelo base en varios ejes.
- Contexto efectivo limitado: MRCR de 12,2 sugiere un uso deficiente de ventanas largas pese a la configuración de 32.768 tokens.
- Idiomas soportados no documentados; no se garantiza un comportamiento multilingüe adecuado.
- NUPA con solo 62,8% de formato válido indica problemas de adherencia al formato en esa tarea.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías y la model card incluye una cláusula de uso ético y legal; conviene revisar los términos del proyecto Marin.
- La provenance S3 original fue eliminada el 2026-10-17; la verificabilidad futura depende de los hashes sha256 publicados en el issue de Marin.
- El checkpoint seleccionado es la época 3, no la final, por una caída en una dirección de evaluación; puede no ser óptimo para todas las tareas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/open-athena/Snowball-67B-A2B-CruxEval-RS-SFT-Step282
- Modelo base: https://huggingface.co/open-athena/Snowball-67B-A2B-10T-Mixed-RLVR-Sync-Step92/tree/fdc3c3c5fff489d3fb04dcbc2387c179b1bf3fab
- Informe del experimento (issue Marin #9920): https://github.com/marin-community/marin/issues/9920
- Comentario con resultados y contabilidad de GPU-horas: https://github.com/marin-community/marin/issues/9920#issuecomment-6076348127
- Evalchemy (evaluador congelado, commit ae362881): https://github.com/marin-community/evalchemy/commit/ae362881cf53f869a6ad52c8a59fa17343c0b5f8
- EvalDash (panel de resultados): https://marina.oa.dev/evaldash/runs?model=open-athena-Snowball-67B-A2B-CruxEval-RS-SFT-Step282
