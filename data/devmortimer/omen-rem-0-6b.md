# DevMortimer/Omen-REM-0.6B

## Resumen

Omen-REM-0.6B es un modelo derivado de Qwen/Qwen3-0.6B publicado por DevMortimer (Ryan Joshua Z. Gapac) que implementa una arquitectura de memoria sináptica de doble escala temporal sobre un backbone congelado. El objetivo declarado no es la generación de texto generalista, sino la predicción de roturas de invariantes entre ficheros (*ghost loci*) a partir de un diff de git en un único forward pass, orientado a agentes de programación y mantenimiento continuo de repositorios.

La propuesta se articula en tres fases: una fase de vigilia (Omen) que consume el diff crudo sin tokens de prompt adicionales, una fase diurna (Instant-CLS) con una matriz rápida hipocampal en fp32 actualizada mediante la fórmula de Sherman-Morrison y un mecanismo de desaprendizaje quirúrgico por QR ortogonal con anclas activas, y una fase nocturna (Bio-REM) que compila el histórico multi-día en un *Repo-Engram* de 7,98 MB intercambiable en caliente (LoRA de rango 8 más cabezas paralelas).

El modelo tiene 0,6 mil millones de parámetros, licencia Apache 2.0 y está etiquetado únicamente para inglés y código. Su relevancia es fundamentalmente de investigación: propone un paradigma de aprendizaje continuo con coste de escritura de milisegundos y sin backpropagation en la fase diurna, con métricas publicadas sobre un benchmark propio (GhostLocus-Bench v2) y comparaciones frente a RAG, replay uniforme y SGD/LoRA en línea.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder (Qwen3-0.6B congelado) con cabezas paralelas Omen y memoria sináptica Instant-CLS/Bio-REM |
| Parámetros totales | 0,6B (backbone) + 4,38 MB LoRA rango 8 + 3,60 MB cabezas paralelas |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos publicados en safetensors; consolidación nocturna evaluada en FP16 y BF16) |
| Idiomas soportados | en, code |
| Licencia | Apache 2.0 (con fichero NOTICE vinculante) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El backbone es Qwen3-0.6B congelado; no se reentrena el transformer. Sobre él se añaden cuatro cabezas paralelas (2,85 ms de sobrecoste en fase de vigilia) y una memoria de dos escalas. La escala diurna, Instant-CLS, mantiene una matriz rápida hipocampal de 0,633 MB más un estado de covarianza de 32,0 MB en fp32, actualizada en forma cerrada con Sherman-Morrison (1,04 ms p50 de escritura) y depurada mediante desaprendizaje quirúrgico QR ortogonal con anclas activas (2,71 ms p50 de borrado). No hay backpropagation ni tokens de prompt extra en esta fase.

La escala nocturna, Bio-REM, consolida el histórico multi-día en un Repo-Engram de 7,98 MB (LoRA rango 8 de 4,38 MB más cabezas paralelas de 3,60 MB) en 294,6 s ± 14,9 s dentro de 5.962,1 MiB de VRAM. El proceso combina contraste contrafactual de gemelos en fase 1, destilación reverse-KL hindsight-to-foresight (SDPG KL = 0,0208) y, en fase 2, replay CLS con proporción 6:4:4 junto con NPO (Negative Preference Optimization) y SHY. Tras la consolidación, el estado diurno se reinicia a cero. El espacio de características diurno es d = 2048 y el pool de evaluación es M = 80 ficheros candidatos.

## Capacidades

- Predicción de *ghost loci*: identifica ficheros no tocados por el diff que probablemente rompan invariantes, en un único forward pass sobre el diff crudo (125,6 tokens de media).
- Detección de alarmas de seguridad: AUROC de 0,9063 en la suite de consolidación nocturna.
- Aprendizaje continuo diurno: incorporación de reglas nuevas en 1,04 ms p50 sin reentrenamiento.
- Desaprendizaje selectivo: eliminación de conocimiento obsoleto tras refactorizaciones en 2,71 ms p50, con 98,9 % de retención de anclas activas previas.
- Consolidación nocturna: compilación de histórico multi-día en un adaptador LoRA y cabezas intercambiables en caliente.
- Soporte de agentes de programación: las etiquetas del autor incluyen `coding-agents` y `system-one`, orientadas a pipelines de revisión automática.
- Capacidades multilingües: limitadas a inglés y código.
- No se documentan tool calling, function calling, visión, audio ni modo thinking explícito.

## Casos de uso

- Revisión de pull requests con detección de impacto cruzado: dado un diff, el modelo señala ficheros no modificados que podrían romper contratos (por ejemplo, un cambio en un esquema Pydantic que invalide validadores en otro módulo), usando la predicción de ghost loci en un solo forward pass.
- Integración en CI/CD como gate de alarmas: con AUROC de 0,9063 y latencia p50 de 67 ms en Tesla T4, puede ejecutarse en cada commit para marcar cambios de alto riesgo antes del merge.
- Mantenimiento de reglas cambiantes durante la jornada: Instant-CLS permite incorporar una convención nueva a mediodía con 1,04 ms de escritura, sin reentrenar ni ampliar el prompt, útil en equipos que iteran convenciones de código varias veces al día.
- Limpieza tras refactorizaciones: el desaprendizaje QR con anclas activas reduce falsos positivos obsoletos del 71,7 % al 1,7 %, adecuado para repositorios que eliminan APIs y necesitan que el agente deje de sugerirlas.
- Consolidación nocturna de conocimiento de repositorio: el pipeline Bio-REM compila el histórico del día en un adaptador de 7,98 MB que puede distribuirse a instancias de inferencia y recargarse en caliente, útil en flotas de agentes que comparten contexto de un monorepo.
- Investigación en aprendizaje continuo y desaprendizaje automático: el modelo sirve como banco de pruebas reproducible para comparar escritura en forma cerrada frente a SGD/LoRA en línea y frente a RAG con prompt stuffing.
- Evaluación de agentes sobre benchmarks de invariantes: GhostLocus-Bench v2 permite medir recall de ghost loci, falsos positivos en gemelos seguros y latencia de vigilia en ecosistemas FastAPI, Hono, Pydantic, Vite y Zod.

## Benchmarks y rendimiento

Suite 1: consolidación nocturna con 3 semillas (42, 137, 2026), 60 familias, M = 80 ficheros, 260 episodios retenidos del día 6, Tesla T4.

| Brazo | Ghost R@1 | Ghost R@3 | Ghost MRR | Safe-Twin FPR | Stale FPR | Alarm AUROC | Latencia p50 (ms) | Tokens de vigilia |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| A: zero-shot amnésico | 5,0 % | 10,8 % | 0,1421 | 60,0 % | 50,0 % | 0,4476 | 38,4 | 125,6 |
| B: RAG append-only top-8 | 26,4 % | 54,7 % | 0,4562 | 33,3 % | 37,8 % | 0,6168 | 115,0 | 872,4 |
| C: replay uniforme SFT | 91,4 % | 98,3 % | 0,9481 | 98,3 % | 36,1 % | 0,7183 | 71,0 | 125,6 |
| D: Bio-REM (propuesto) | 97,5 % | 99,2 % | 0,9840 | 14,2 % | 0,6 % | 0,9063 | 67,0 | 125,6 |
| D-noTwin (sin gemelo contrafactual) | 99,2 % | 100,0 % | 0,9958 | 86,7 % | 0,0 % | 0,8165 | 71,9 | 125,6 |
| D-noNPO (sin NPO de fase 2) | 91,7 % | 98,9 % | 0,9511 | 7,1 % | 21,7 % | 0,8056 | 75,3 | 125,6 |

Suite 2: flujo continuo de repositorio de 24 horas con 3 semillas.

| Brazo | 12:00 New R@1 | 16:00 Stale FPR | 16:00 Prior R@3 | 06:00 Post-Sleep R@1 | Escritura p50 (ms) | Borrado p50 (ms) | Tokens extra |
|---|---:|---:|---:|---:|---:|---:|---:|
| RAG (prompt stuffing) | 0,0 % | 57,2 % | 77,2 % | 27,2 % | 0,04 | 0,11 | +746,8 |
| Bio-REM solo nocturno | 0,0 % | 71,7 % | 100,0 % | 96,7 % | diferido | diferido | 0,0 |
| SGD/LoRA en línea | 11,1 % | 0,0 % (colapso) | 1,7 % | 87,8 % | 253,62 | 723,73 | 0,0 |
| Instant-CLS (propuesto) | 100,0 % | 1,7 % | 98,9 % | 94,7 % | 1,04 | 2,71 | 0,0 |

Recall de ghost loci activos por ecosistema (brazo D, M = 80): FastAPI 95,8 % R@1 / 95,8 % R@3; Hono 97,2 % / 100,0 %; Pydantic 97,2 % / 100,0 %; Vite 97,2 % / 100,0 %; Zod 100,0 % / 100,0 %.

## Requisitos de hardware

- VRAM de consolidación nocturna medida: 5.962,1 MiB en Tesla T4 durante 294,6 s ± 14,9 s.
- Inferencia de vigilia: latencia p50 de 67,0 ms en Tesla T4 con backbone FP16; el sobrecoste de las cuatro cabezas es de 2,85 ms.
- Estado diurno residente: 0,633 MB de matriz rápida más 32,0 MB de covarianza en fp32.
- Artefacto consolidado: 7,98 MB (LoRA rango 8 de 4,38 MB más cabezas de 3,60 MB), recargable en caliente.
- GPU consumer: por el tamaño del backbone (0,6B) y el estado diurno, el conjunto cabe holgadamente en GPUs consumer tipo RTX 4090; no se han publicado medidas específicas en esa GPU.
- Opciones de despliegue: no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI; el autor describe un pipeline propio de vigilia, fase diurna y consolidación nocturna.
- Rendimiento: no se publican cifras de throughput (tokens/s) en la información disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Omen-REM-0.6B | 0,6B + 7,98 MB engram | no disponible | Memoria continua de doble escala sobre backbone congelado | Apache 2.0 | Hugging Face |
| Qwen/Qwen3-0.6B (base) | 0,6B | no disponible en la información | LLM generativo generalista | Apache 2.0 | Hugging Face |
| RAG append-only top-8 (brazo B del paper) | depende del retriever | limitado por el prompt | Recuperación léxica BM25 con 872,4 tokens de prompt | no aplica | no aplica |
| SGD/LoRA en línea (brazo del paper) | adaptador sobre 0,6B | no aplica | Ajuste incremental con backpropagation | no aplica | no aplica |

La comparación relevante no es frente a LLMs generalistas del mismo tamaño, sino frente a las alternativas de memoria evaluadas en el propio paper: RAG top-8 (26,4 % Ghost R@1), replay uniforme SFT (91,4 %) y SGD/LoRA en línea (11,1 % New R@1 a las 12:00). Frente a Qwen3-0.6B base no se publican comparativas de generación general, ya que el modelo está especializado en predicción de ghost loci.

## Limitaciones y advertencias

- Calibración de umbral: con backbone en FP16 y umbral sin calibrar de 0,50, el TPR de alarma activa es del 68,1 % y el Locus Top-1 del 61,4 %, conservadores frente al AUROC global de 0,9063. Requiere calibración de temperatura o consolidación nativa en BF16.
- Escala: evaluado con M = 80 ficheros candidatos y d = 2048; más de 2.048 commits distintos por día requeriría técnicas tipo RanPAC antes de la consolidación nocturna.
- Idiomas: solo inglés y código; no hay soporte documentado de castellano ni de otras lenguas.
- Especialización estrecha: no es un modelo de propósito general; su rendimiento en generación de texto, matemáticas o razonamiento abierto no está documentado.
- Riesgo de alucinación en la predicción de ghost loci: los falsos positivos en gemelos seguros llegan al 14,2 % en el brazo D, lo que puede generar alarmas innecesarias en producción.
- Dependencia del pipeline completo: los resultados de Instant-CLS y Bio-REM asumen un flujo diurno y nocturno con reinicio de estado; usar solo el adaptador sin ese ciclo degrada las métricas.
- Licencia: Apache 2.0 con fichero NOTICE vinculante; cualquier redistribución o trabajo derivado debe preservarlo.
- Madurez: repositorio de 0,0 GB, 0 descargas y 1 like en el momento de la consulta; el modelo acompaña a un paper en Zenodo y a un benchmark propio, sin validación independiente conocida.
- Contexto: la longitud de contexto del backbone no se especifica en la información disponible, lo que impide garantizar el comportamiento con diffs muy extensos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/DevMortimer/Omen-REM-0.6B
- Modelo base: https://huggingface.co/Qwen/Qwen3-0.6B
- Dataset GhostLocus-Bench: https://huggingface.co/datasets/DevMortimer/GhostLocus-Bench
- Paper #2 (DOI): https://doi.org/10.5281/zenodo.24607074
- Paper previo Warden-S1 (DOI): https://doi.org/10.5281/zenodo.24494405
- ORCID del autor: https://orcid.org/0009-0004-2591-0219
- Sitio del autor: https://ryanjoshuagapac.com
