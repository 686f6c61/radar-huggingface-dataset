# open-athena/Snowball-67B-A2B-MixedRS-SFT-Step727

## Resumen

Snowball-67B-A2B-MixedRS-SFT-Step727 es un checkpoint de ajuste fino supervisado (SFT) publicado por open-athena dentro del proyecto Marin. Se trata de un modelo de mezcla de expertos (MoE) de 67.078 millones de parametros totales, derivado del estudiante B del experimento Snowball, concretamente del checkpoint open-athena/Snowball-67B-A2B-10T-Mixed-RLVR-Sync-Step92. El modelo se ha entrenado con una receta de rejection sampling (RS-SFT) sobre demostraciones generadas por dos expertos (CruxEval y MMLU-Pro).

El problema que aborda es la destilacion de capacidades de razonamiento y resolucion de problemas a partir de pools de muestras filtradas por correccion. Para cada prompt se generaron k=8 muestras de cada experto y se conservo la primera que resulto correcta segun ejecucion (CruxEval) o segun el selector de respuesta implementado (MMLU-Pro), cubriendo 2.903 de 3.206 prompts. El resultado es un modelo orientado a tareas de codigo, matematicas y razonamiento de opcion multiple, con un contexto de evaluacion de 32.768 tokens.

Es relevante ahora porque forma parte de una campana experimental abierta del proyecto Marin (issue 9984) que documenta de forma exhaustiva la procedencia, las evaluaciones y el coste computacional (93,6 H100-horas en 32 H100), y porque el checkpoint ha sido seleccionado frente al paso 546 mediante una regla congelada. La licencia Apache 2.0 y el formato safetensors facilitan su reutilizacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE tipo grug_moe (familia Marin/Snowball), transformer disperso con dos expertos en el experimento original |
| Parametros totales | 67.078.882.816 (67,08 mil millones) |
| Parametros activos | no disponible (la nomenclatura A2B sugiere ~2B activos, pero no se confirma en la informacion) |
| Longitud de contexto | 32.768 tokens (contexto de evaluacion; contexto nativo de entrenamiento no disponible) |
| Tipos de cuantizacion | no disponible (solo se publican pesos safetensors sin cuantizaciones oficiales) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (shards), config.json, generation_config.json, tokenizer y chat_template.jinja |

## Arquitectura y entrenamiento

La arquitectura es una mezcla de expertos (MoE) etiquetada como grug_moe dentro del ecosistema Marin, con 67,08 mil millones de parametros totales. El modelo base es el estudiante B del experimento Snowball, entrenado previamente con 10T tokens y RLVR (Mixed-RLVR-Sync-Step92). El tokenizer y la plantilla de chat son los de B, sin modificaciones, lo que garantiza compatibilidad con el pipeline original.

El entrenamiento de este checkpoint es un SFT con rejection sampling mixto: se generaron k=8 muestras por prompt con dos expertos (E para CruxEval y E2 para MMLU-Pro) y se selecciono la primera muestra por prompt que fuera correcta por ejecucion o aceptada por el selector de respuesta. Se cubrieron 2.903 de 3.206 prompts. La receta usa AdamW con LR 1e-6, betas 0.9/0.999, weight decay 0, grad clip 1.0, router bias congelado, 4 epocas (728 actualizaciones de batch 16) y el framework Levanter sobre 32 H100 (93,6 H100-horas). El checkpoint se selecciono frente al paso 546 mediante una regla congelada por ser similar en todos los objetivos.

## Capacidades

- Generacion de texto y razonamiento de opcion multiple (evaluado en MMLU-Pro, GPQA-Diamond).
- Razonamiento matematico y resolucion de problemas (GSM8K, MATH500, AIME24, OlympiadBench).
- Generacion y evaluacion de codigo (HumanEval+, MBPP+, CruxEval, DS-1000).
- Modo "thinking" activado durante la evaluacion, con generacion de hasta 30.720 tokens.
- Instrucciones estrictas y formato (IFEval instruction-strict, IFBench).
- Soporte de tool calling y agentes: se evalua en BFCL-parity, tau3 y SWE-bench-verified, aunque con rendimiento bajo.
- Capacidades de recuperacion y contexto largo (MRCR, ot-tblite-recovery, tb2-recovery).
- Capacidades multilingues: no disponible en la informacion proporcionada.

## Casos de uso

- Generacion de codigo en produccion: el modelo obtiene 73,2 en HumanEval+ y 71,7 en MBPP+, por lo que puede integrarse en pipelines de CI/CD para sugerencia y validacion de parches, especialmente en tareas de reparacion de funciones con tests ejecutables.
- Resolucion de problemas matematicos y razonamiento cuantitativo: con 94,1 en GSM8K y 92,4 en MATH500, es adecuado para asistentes de ensenanza de matematicas o generacion de soluciones paso a paso con verificacion.
- Razonamiento de opcion multiple y QA experto: 68,2 en el subconjunto MMLU-Pro y 57,6 en GPQA-Diamond lo hacen util para sistemas de evaluacion automatizada o generacion de preguntas de examen en dominios cientificos.
- Cumplimiento estricto de instrucciones: 78,3 en IFEval instruction-strict permite usarlo en tareas de formateo, extraccion estructurada y generacion de respuestas con restricciones de formato.
- Destilacion y generacion de datos sinteticos: al haber sido entrenado con rejection sampling sobre pools de expertos, puede emplearse como generador de candidatos en pipelines de autoentrenamiento, filtrando por verificacion ejecutable.
- Analisis de codigo con contexto largo: con 32.768 tokens de contexto y evaluacion en CruxEval (77,25), puede procesar repositorios o fragmentos extensos para tareas de comprension y ejecucion simulada.
- Agentes de software limitados: aunque SWE-bench-verified es bajo (11,1), el soporte de tool calling permite prototipos de agentes con intervencion humana y verificacion externa.

## Benchmarks y rendimiento

Evaluacion congelada con Evalchemy (commit ae362881), vLLM sobre H100x8, contexto de 32.768 tokens, generacion maxima de 30.720 tokens, thinking activado, muestreo sin semilla a temperatura 1.0. Una sola pasada de evaluacion.

| Benchmark | MixedRS727 | MOPD100 | B (base, snapshot distinto) |
|---|---|---|---|
| math500 | 92,8 | 91,2 | 89,6 |
| humanevalplus | 73,2 | 73,2 | 68,9 |
| mbppplus | 71,7 | 67,2 | 72,5 |
| olympiadbench | 43,7 | 45,3 | 42,7 |
| gsm8k-0shot | 90,1 | 88,7 | 89,3 |
| piqa | 82,2 | 83,1 | 82,2 |
| winogrande | 75,0 | 76,2 | 72,8 |
| boolq | 83,7 | 84,7 | 84,1 |
| truthfulqa | 57,2 | 56,2 | 58,2 |
| triviaqa | 59,5 | 63,5 | 65,5 |
| aime24 | 60,0 | 64,0 | 47,0 |
| mmlu-pro | 65,6 | 64,1 | 43,6 |
| gpqa-diamond | 56,9 | 50,5 | 42,9 |
| cruxeval | 78,6 | 75,5 | 57,6 |
| financebench | 42,0 | 28,0 (DIAG) | 58,0 |
| ifbench | 26,0 | 29,0 | 31,0 |
| mrcr | 13,0 | 15,0 | 12,3 |
| swebench-verified | 11,1 | 11,4 | 7,9 |
| bfclparity-pi | 1,6 | 5,7 | 16,3 |
| tau3-pi | 0,5 | 2,0 | 0,5 |
| SOTOPIA-hard | 67,1 | 66,7 | 61,3 |

Ademas, la model card reporta: CruxEval 77,25/77,25, MMLU-Pro subset 68,2, held-out 64,8, GSM8K 94,1, MATH500 92,4, GPQA-D 57,6 e IFEval instruction-strict 78,3. Nota: 14 de los 1.400 demos de MMLU-Pro son incorrectos bajo la regla de respuesta final del evaluador (desajuste entre selector y evaluador). NUPA aparece como RECON (9,0; 45/499 disponibles, cobertura 499/500).

## Requisitos de hardware

- VRAM estimada para inferencia: con 67,08 mil millones de parametros en safetensors, se necesita aproximadamente 134 GB en BF16/FP16. En FP8 o cuantizacion de 8 bits, alrededor de 67 GB; en 4 bits, en torno a 34-40 GB.
- GPU recomendadas: multiples A100 80GB o H100 80GB para BF16 (2-4 GPUs). La evaluacion oficial uso vLLM sobre 8 H100.
- Cabe en GPU de consumo: en cuantizacion de 4 bits podria caber en una RTX 4090 (24 GB) solo si se aplica offload parcial o se reduce el contexto; no es viable en BF16 en una sola GPU de consumo. No se publican cuantizaciones oficiales.
- Opciones de despliegue: vLLM (usado en la evaluacion), Levanter para entrenamiento, y potencialmente llama.cpp/Ollama si se generan cuantizaciones GGUF (no disponibles oficialmente). TGI no confirmado.
- Latencia y throughput: no disponible. El coste de entrenamiento fue de 93,6 H100-horas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | CruxEval | MMLU-Pro | GSM8K | Licencia |
|---|---|---|---|---|---|---|
| MixedRS727 (este) | 67,08B | 32.768 | 78,6 | 65,6 | 90,1 | Apache 2.0 |
| MOPD100 | no disponible | 32.768 (eval) | 75,5 | 64,1 | 88,7 | no disponible |
| B (base) | 67,08B (mismo estudiante) | 32.768 (eval) | 57,6 | 43,6 | 89,3 | no disponible |

No se dispone de comparaciones con modelos externos de la misma categoria en la informacion proporcionada.

## Limitaciones y advertencias

- Riesgo de alucinacion: no se documentan tasas especificas, pero el rendimiento bajo en TruthfulQA (57,2) y TriviaQA (59,5) sugiere cautela en QA factual.
- Desajuste documentado: 14 de los 1.400 demos de MMLU-Pro son incorrectos bajo la regla de respuesta final del evaluador, lo que introduce ruido en el entrenamiento y en la medicion.
- Rendimiento bajo en agentes y tool calling: BFCL-parity 1,6, tau3 0,5 y SWE-bench-verified 11,1 limitan su uso en flujos agenticos autonomos sin verificacion externa.
- Cobertura incompleta de NUPA (45/499 disponibles) y resultados RECON, no comparables directamente.
- Idiomas soportados no documentados; el tokenizer y la plantilla de chat provienen del estudiante B, por lo que el comportamiento multilingue no esta garantizado.
- Licencia Apache 2.0 permite uso comercial, pero el autor declara la intencion de uso etico y responsable; no hay restricciones adicionales documentadas.
- El checkpoint se selecciono con una regla congelada frente al paso 546; no se detalla la varianza entre pasos.
- El S3 de origen se elimino el 2026-10-17; los pesos se verificaron identicos por sha256 al commit 95dd3f4a.
- Evaluacion de una sola pasada, sin intervalos de confianza publicados.

## Enlaces

- Hugging Face: https://huggingface.co/open-athena/Snowball-67B-A2B-MixedRS-SFT-Step727
- Modelo base: https://huggingface.co/open-athena/Snowball-67B-A2B-10T-Mixed-RLVR-Sync-Step92
- Commit del modelo base: https://huggingface.co/open-athena/Snowball-67B-A2B-10T-Mixed-RLVR-Sync-Step92/tree/fdc3c3c5fff489d3fb04dcbc2387c179b1bf3fab
- Informe del experimento (issue Marin 9984): https://github.com/marin-community/marin/issues/9984
- Comentario con el informe: https://github.com/marin-community/marin/issues/9984#issuecomment-6144923850
- Evalchemy (commit de evaluacion): https://github.com/marin-community/evalchemy/commit/ae362881cf53f869a6ad52c8a59fa17343c0b5f8
- EvalDash (runs del modelo): https://marina.oa.dev/evaldash/runs?model=open-athena-Snowball-67B-A2B-MixedRS-SFT-Step727
- EvalDash (runs de MOPD100): https://marina.oa.dev/evaldash/runs?model=open-athena-Snowball-67B-A2B-MOPD-Step100
