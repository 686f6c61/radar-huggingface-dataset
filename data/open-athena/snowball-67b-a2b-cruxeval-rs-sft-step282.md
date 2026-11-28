# open-athena/Snowball-67B-A2B-CruxEval-RS-SFT-Step282

## Resumen

Snowball-67B-A2B-CruxEval-RS-SFT-Step282 es un ajuste fino supervisado (SFT) por muestreo de rechazo (rejection sampling) sobre el modelo base Snowball-67B-A2B-10T-Mixed-RLVR-Sync-Step92, desarrollado por el colectivo open-athena dentro del ecosistema Marin. El modelo pertenece a la familia Snowball, una arquitectura de mezcla de expertos (MoE) de tipo `grug_moe` con 67.078.882.816 parámetros totales y aproximadamente 2.000 millones de parámetros activos por token (designación A2B). El checkpoint publicado corresponde al paso 282 del brazo RS-SFT de un experimento de un solo experto, en el que el modelo estudiante B se ajustó sobre las primeras muestras correctas en ejecución extraídas del pool k=8 del experto E.

La relevancia de esta ficha radica en su carácter de experimento de destilación y alineación: el modelo no es un lanzamiento comercial, sino un artefacto de investigación que documenta una receta concreta de SFT sobre demostraciones filtradas por corrección de ejecución. Los resultados publicados en la model card sitúan CruxEval en 80,8/77,9 (media de dos pasadas), GSM8K en 93,5 y MATH500 en 93,6, lo que evidencia un entrenamiento orientado a razonamiento matemático y ejecución de código.

El modelo se distribuye con licencia Apache 2.0, pesos en safetensors y un tamaño de repositorio de 134,2 GB. Su contexto de evaluación se fijó en 32.768 tokens con un límite de generación de 30.720 tokens y modo thinking activado. Está pensado para investigadores que quieran reproducir o comparar recetas de destilación, no como modelo de producción generalista.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | MoE de tipo `grug_moe` (familia Snowball, ecosistema Marin) |
| Parámetros totales | 67.078.882.816 (~67,1 B) |
| Parámetros activos | ~2 B (designación A2B) |
| Longitud de contexto | 32.768 tokens (contexto de evaluación; no se especifica el máximo de entrenamiento) |
| Tipos de cuantización | no disponible (solo se publican pesos safetensors sin cuantizaciones oficiales) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (shards), con `config.json`, `generation_config.json`, tokenizer y `chat_template.jinja` |

## Arquitectura y entrenamiento

El modelo es un transformer de mezcla de expertos con 67,1 B de parámetros totales y aproximadamente 2 B activos por token, implementado con la variante `grug_moe` del stack Marin y ejecutado con Levanter. El tokenizer y la plantilla de chat son los del modelo base B, sin modificaciones. El checkpoint es el paso 282 de un ajuste fino supervisado por muestreo de rechazo: se tomaron las primeras muestras correctas en ejecución del pool k=8 del experto E, cubriendo 1.503 de 1.600 prompts.

La receta de entrenamiento emplea AdamW con LR 1e-6, betas 0,9/0,999, weight decay 0, grad clip 1,0 y sesgo del router congelado. Se realizaron 4 épocas (376 actualizaciones de batch 16) en 32 H100, con un coste total de 57,4 H100-h. Se seleccionó el checkpoint de la época 3 tras una caída final en una dirección de evaluación. La evaluación se realizó con Evalchemy (commit `ae362881`) sobre vLLM con 8 H100, contexto de 32.768 tokens, límite de generación de 30.720 tokens, modo thinking activo y muestreo sin semilla a temperatura 1,0.

## Capacidades

- Generación de texto y razonamiento de múltiples pasos con modo thinking activado.
- Razonamiento matemático de competición y resolución de problemas (GSM8K 93,5; MATH500 93,6).
- Ejecución y razonamiento sobre código (CruxEval 80,8/77,9; HumanEval+ 77,4; MBPP+ 74,1).
- Evaluación de resultados de ejecución de programas y reconstrucción de salidas (CruxEval).
- Soporte de tool calling y function calling (evaluado en BFCL-parity-pi con 4,1).
- Capacidades de agente multi-paso (evaluado en τ³-pi con 7,7 y SOTOPIA-hard con 66,6).
- Capacidades multilingües: no disponible (no se documentan idiomas).
- Capacidades de visión o audio: no disponibles.

## Casos de uso

- Investigación en destilación de modelos: el checkpoint sirve para reproducir y comparar la receta RS-SFT frente al brazo OPD y al modelo base B, con métricas de referencia ya publicadas en la model card.
- Evaluación de razonamiento matemático: útil como modelo de referencia en benchmarks como GSM8K y MATH500 dentro de pipelines de evaluación Evalchemy, gracias a su modo thinking y a su contexto de 32.768 tokens.
- Análisis de ejecución de código: adecuado para tareas de CruxEval y HumanEval+ en las que se requiere predecir la salida de un programa, con un rendimiento documentado de 80,8/77,9 en CruxEval.
- Estudio de alineación y filtrado por corrección: permite analizar el efecto del muestreo de rechazo sobre la calidad de las demostraciones, comparando el paso 282 con el paso 75 del brazo OPD.
- Experimentación con MoE de bajo coste de inferencia: al tener ~2 B de parámetros activos, es viable para prototipos de investigación en los que el coste por token importa más que la latencia absoluta.
- Benchmarking de agentes y tool calling: puede integrarse en arneses de evaluación de agentes (τ³-pi, BFCL-parity-pi, SOTOPIA-hard) para medir el impacto del SFT en habilidades de interacción.
- Reproducibilidad de experimentos: al conservarse la procedencia S3, los commits y los hashes sha256, el modelo es adecuado para auditorías de reproducibilidad en investigación.

## Benchmarks y rendimiento

Resultados publicados en la model card (porcentajes; evaluador Evalchemy `ae362881`, vLLM H100x8, contexto 32.768, generación máxima 30.720, thinking on, temperatura 1,0 sin semilla):

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
| NUPA | 33,3 (formato válido 62,8%)† | 35,3† | 40,6 | 46,6 |
| SWE-bench-Verified | 7,6† | 8,0† | 7,9 | 30,9 |
| OT-TBLite-Recovery | 10,9† | 9,3† | 5,6 | 23,9 |
| TB2-Recovery | 5,0† | 4,2† | 1,2 | 11,2 |
| DS-1000-local | 23,0† | 18,5† | 18,0 | 41,5 |
| BFCL-parity-pi | 4,1† | 8,1† | 16,3 | 33,3 |
| BixBench-pi | 2,4† | 1,0† | 0,5 | 17,6 |
| τ³-pi | 7,7 | 7,5† | 8,3 | 5,0 |
| SOTOPIA-hard | 66,6† | 64,6† | 61,3 | 64,7 |

La model card indica que las celdas marcadas con † tienen una calificación específica (evidencia de fuga/parseo, contexto diagnóstico/reconstrucción, cobertura incompleta o nota métrica específica del modelo). Las celdas marcadas como DIAG o RECON no son comparaciones limpias de capacidad.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 134 GB solo para pesos (67,1 B × 2 bytes), más overhead de activaciones y KV cache; requiere al menos 2× H100 80 GB o 4× A100 80 GB.
- Cuantización a 8 bits: ~67 GB de pesos, viable en una H100 80 GB o 2× A100 40 GB.
- Cuantización a 4 bits: ~34 GB de pesos, viable en una RTX 4090 24 GB solo con offload parcial o en 2× RTX 4090; no cabe completa en una sola GPU de consumo.
- GPU recomendadas: H100 80 GB (usadas en la evaluación oficial, 8× H100 con vLLM), A100 80 GB, y en menor medida L40S o RTX 6000 Ada para cuantizaciones agresivas.
- Despliegue: vLLM es el motor usado en la evaluación oficial; llama.cpp y Ollama no tienen cuantizaciones oficiales publicadas, por lo que requerirían conversión manual desde safetensors. TGI no está documentado para esta arquitectura.
- Latencia y throughput: no disponibles de forma directa; el coste de entrenamiento fue de 57,4 H100-h en 32 H100, y la evaluación se ejecutó en 8 H100 con vLLM, pero no se publican métricas de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parámetros | Activos | Contexto | CruxEval | GSM8K | MATH500 | Licencia |
|---|---|---|---|---|---|---|---|
| RS282 (este) | 67,1 B | ~2 B | 32.768 | 79,6 | 91,7 | 92,6 | Apache 2.0 |
| OPD75 (mismo linaje) | 67,1 B | ~2 B | 32.768 | 75,4 | 88,6 | 91,2 | Apache 2.0 |
| B (base del linaje) | 67,1 B | ~2 B | no disponible | 57,6 | 89,3 | 89,6 | Apache 2.0 |
| v0 (snapshot anterior) | 67,1 B | ~2 B | no disponible | 65,1 | 84,2 | 93,2 | Apache 2.0 |

No se dispone de comparación con modelos externos de otros desarrolladores en la información proporcionada.

## Limitaciones y advertencias

- Modelo de investigación: no es un lanzamiento de producción y su model card lo describe como un checkpoint de un experimento de destilación, no como un asistente generalista.
- Riesgo de alucinación: los resultados en TruthfulQA (59,0) y TriviaQA (44,4) sugieren una fiabilidad factual limitada, inferior al modelo base en TriviaQA (65,5).
- Rendimiento débil en tareas de agente y tool calling: BFCL-parity-pi 4,1, τ³-pi 7,7 y BixBench-pi 2,4, muy por debajo de otros snapshots del linaje.
- Contexto largo limitado: MRCR de 12,2 indica un rendimiento bajo en recuperación de contexto multirrodada pese a la ventana de 32.768 tokens.
- Idiomas no documentados: no se especifican idiomas soportados, por lo que no se recomienda su uso en producción multilingüe sin validación previa.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantías y la model card exige cumplimiento de la legislación aplicable.
- Procedencia: los pesos S3 originales fueron eliminados el 2026-10-17; la verificación se realizó por sha256 contra el commit `073d128c`, lo que limita la trazabilidad directa del artefacto original.
- Marcas † en benchmarks: muchas celdas tienen calificaciones específicas (fuga, parseo, cobertura incompleta) que impiden comparaciones limpias; no deben interpretarse como capacidades absolutas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/open-athena/Snowball-67B-A2B-CruxEval-RS-SFT-Step282
- Modelo base: https://huggingface.co/open-athena/Snowball-67B-A2B-10T-Mixed-RLVR-Sync-Step92/tree/fdc3c3c5fff489d3fb04dcbc2387c179b1bf3fab
- Informe del experimento (issue Marin #9920): https://github.com/marin-community/marin/issues/9920
- Comentario con resultados y contabilidad de GPU-horas: https://github.com/marin-community/marin/issues/9920#issuecomment-6076348127
- Evaluador Evalchemy (commit): https://github.com/marin-community/evalchemy/commit/ae362881cf53f869a6ad52c8a59fa17343c0b5f8
- Panel de evaluación EvalDash (RS282): https://marina.oa.dev/evaldash/runs?model=open-athena-Snowball-67B-A2B-CruxEval-RS-SFT-Step282
- Panel de evaluación EvalDash (OPD75): https://marina.oa.dev/evaldash/runs?model=open-athena-Snowball-67B-A2B-CruxEval-OPD-Step75
