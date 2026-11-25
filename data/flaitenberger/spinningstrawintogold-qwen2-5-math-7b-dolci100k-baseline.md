# flaitenberger/SpinningStrawIntoGold-Qwen2.5-Math-7B-Dolci100k-Baseline

## Resumen

SpinningStrawIntoGold-Qwen2.5-Math-7B-Dolci100k-Baseline es un ajuste fino supervisado de Qwen2.5-Math-7B desarrollado por el investigador flaitenberger como parte de los experimentos del articulo *Spinning Straw into Gold: Small Amounts of Synthetic Derivations Improve Reasoning in Instruction-Tuned Models*. El modelo se entrena sobre una mezcla de 100.000 ejemplos de instruccion de Dolci-Instruct-SFT-No-Tools sin datos de derivacion sintetica, actuando como linea base (baseline) frente a las variantes que sustituyen parte de esa mezcla por problemas de deduccion generados programaticamente.

El objetivo del trabajo es estudiar si datos sinteticos generados sin ningun modelo en el bucle (deducciones ground Horn-clause sobre constantes abstractas, verificadas por un comprobador simbolico) mejoran el razonamiento de modelos ajustados por instrucciones. Esta variante concreta representa el punto de partida experimental: mismo numero de ejemplos, mismos hiperparametros y misma receta que las demas, pero sin la porcion de derivaciones, lo que permite aislar el efecto de los datos sinteticos.

Arquitectura transformer densa de 7.615.616.512 parametros (Qwen2), contexto extendido a 8192 posiciones mediante YaRN rope scaling, licencia Apache 2.0 y pesos en safetensors bf16. Es un modelo de investigacion con 18 descargas, orientado a evaluar tecnicas de datos sinteticos mas que a un uso comercial generalista.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen2) |
| Parametros totales | 7.615.616.512 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 8192 tokens (extendido con YaRN, factor 2.0, original 4096) |
| Tipos de cuantizacion | no disponible (pesos publicados en bf16 safetensors) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (bf16) |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-Math-7B, un transformer denso de la familia Qwen2. Antes del ajuste fino, la longitud de contexto se extendio de 4096 a 8192 posiciones mediante YaRN rope scaling con factor 2.0, configuracion que se conserva en el config publicado. El ajuste fino es supervisado de parametros completos (full-parameter SFT) durante una epoca sobre 100.000 ejemplos de chat de un solo turno, con learning rate 5e-06, schedule lineal, warmup ratio 0.03, batch global de 128 y longitud maxima de secuencia de 8192 (el run aborta si mas del 0,5% de los targets se truncarian). Se uso precision mixta bf16, FSDP con sharding completo y gradient checkpointing, enmascarando el prompt para calcular la perdida solo sobre los tokens del asistente con la plantilla de chat de Qwen2.5.

Los datos provienen de la configuracion `baseline` del dataset flaitenberger/SpinningStrawIntoGold-SFT-Mixtures: 100.000 ejemplos de instruccion de allenai/Dolci-Instruct-SFT-No-Tools (conversaciones de un solo turno muestreadas con semilla 3407) y ninguna derivacion sintetica. Las demas mezclas del paper comparten exactamente las mismas filas de Dolci salvo el segmento sustituido, de modo que esta variante sirve de control experimental. El repositorio corresponde al run `seed3408` y el archivo `provenance.json` registra el run de origen, los argumentos de entrenamiento y los ficheros de evaluacion. El codigo de entrenamiento es `scripts/train_instruction_sft.py` de la base de codigo synthetic-RLVL (Hugging Face Trainer con FSDP).

## Capacidades

- Generacion de texto y conversacion de un solo turno con la plantilla de chat de Qwen2.5.
- Razonamiento matematico: hereda la base Qwen2.5-Math-7B y alcanza 83,6 en GSM8K.
- Razonamiento logico y deductivo multi-paso, evaluado en ProofWriter (profundidades 0 a 5), FOLIO y LogiQA.
- Generacion de codigo basico (HumanEval 37,2; MBPP 57,8) y resolucion de problemas de opcion multiple (MMLU 57,8; ARC-Challenge 43,9).
- Seguimiento de instrucciones con formato (IFEval strict 38,1).
- Capacidad multilingue limitada al ingles segun la model card.
- No se documenta soporte de tool calling, function calling, agentes, vision, audio ni modo thinking explicito en la informacion disponible.

## Casos de uso

- Linea base de ablacion en investigacion sobre datos sinteticos: sirve para medir el delta de rendimiento en ProofWriter, FOLIO y BIG-Bench Hard frente a las variantes con derivaciones sinteticas, manteniendo fija la mezcla de instrucciones.
- Evaluacion de tecnicas de curacion de datos: al compartir filas de Dolci con las demas mezclas del paper, permite aislar el efecto de la sustitucion de ejemplos en experimentos controlados con semilla fija (seed3408).
- Razonamiento matematico asistido: con 83,6 en GSM8K, es utilizable para resolver problemas aritmeticos de varios pasos en cuadernos de evaluacion o pipelines de generacion de soluciones.
- Generacion de explicaciones paso a paso en dominios formales: su entrenamiento sobre instrucciones y su base matematica lo hacen adecuado para producir derivaciones intermedias en tareas de logica proposicional y de primer orden.
- Prototipado de asistentes de resolucion de problemas en ingles: contexto de 8192 tokens suficiente para enunciados largos con multiples premisas y preguntas de opcion multiple.
- Referencia de comparacion para modelos ajustados: util para investigadores que quieran reproducir el setup de SFT (FSDP, bf16, 100k ejemplos, 8192 tokens) y contrastar sus propios resultados.

## Benchmarks y rendimiento

Resultados publicados por el autor (exactitud, exact match o pass@1 en porcentaje, lm-evaluation-harness):

| Benchmark | Este modelo |
|---|---|
| ARC-Challenge | 43,9 |
| GSM8K | 83,6 |
| MMLU | 57,8 |
| HellaSwag | 61,4 |
| LogiQA (AGIEval) | 29,5 |
| BBH | 67,8 |
| HumanEval | 37,2 |
| MBPP | 57,8 |
| BoolQ | 75,9 |
| IFEval (strict) | 38,1 |
| RACE | 38,1 |
| SciQ | 94,2 |
| TruthfulQA-MC2 | 46,9 |
| FOLIO | 45,3 |
| GPQA-Diamond | 40,4 |
| ProofWriter depth 0, chain-of-thought | 57,4 |
| ProofWriter depth 1, chain-of-thought | 43,2 |
| ProofWriter depth 2, chain-of-thought | 45,8 |
| ProofWriter depth 3, chain-of-thought | 46,4 |
| ProofWriter depth 5, chain-of-thought | 42,8 |
| ProofWriter depth 0, direct answer | 51,2 |
| ProofWriter depth 1, direct answer | 41,6 |
| ProofWriter depth 2, direct answer | 54,8 |
| ProofWriter depth 3, direct answer | 58,4 |
| ProofWriter depth 5, direct answer | 59,4 |

El autor advierte que diferencias de uno a dos puntos entre dos modelos individuales quedan dentro de la dispersion entre runs. Los ficheros completos de resultados con definiciones de tareas estan en `eval/` (suites: bbh_nochat, capability, code_nochat, cot, deduction, dissimilar, drop, folio_gpqa, mc, ppl_nochat, similar, standard).

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 15,2 GB solo para pesos, mas overhead de activaciones y cache KV; en la practica se recomienda al menos 20-24 GB.
- En cuantizacion de 8 bits los pesos ocuparian en torno a 8 GB; en 4 bits, en torno a 4-5 GB (estimaciones teoricas, no publicadas por el autor).
- GPU recomendadas: A100 40/80 GB, H100, L40S o RTX 4090 (24 GB) para bf16; RTX 3090/4090 viables con cuantizacion.
- Cabe en GPU de consumo (RTX 3090, 4090, 4080 con cuantizacion) segun el presupuesto de memoria.
- Opciones de despliegue: transformers, text-generation-inference (tag `text-generation-inference` y `endpoints_compatible`), vLLM, llama.cpp u Ollama previa conversion a GGUF.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Benchmark clave | Licencia |
|---|---|---|---|---|
| Este modelo | 7,6B | 8192 | GSM8K 83,6 / FOLIO 45,3 / BBH 67,8 | Apache 2.0 |
| Qwen2.5-Math-7B (base) | 7,6B | 4096 (ampliable) | no disponible en la informacion | Apache 2.0 |
| Variantes SpinningStrawIntoGold con derivaciones | 7,6B | 8192 | mejoran ProofWriter 5-16 puntos, FOLIO hasta 6 y BBH hasta 7 frente a la linea base | Apache 2.0 |
| Qwen2.5-7B (generalista) | 7,6B | 131072 | no disponible en la informacion | Apache 2.0 |

La comparacion directa con otros modelos de la misma categoria no esta publicada en la informacion disponible; el autor solo reporta deltas frente a esta linea base para las variantes con datos sinteticos.

## Limitaciones y advertencias

- Modelo de investigacion con 18 descargas y sin likes; no ha pasado por un proceso de validacion de produccion.
- Entrenado exclusivamente en ingles; el rendimiento en castellano u otros idiomas no esta caracterizado.
- Riesgo de alucinacion inherente a un modelo de 7B ajustado por SFT; no se reportan mitigaciones especificas.
- Sesgos no evaluados en la informacion proporcionada; los datos de Dolci-Instruct-SFT-No-Tools pueden arrastrar sesgos de su propia procedencia.
- IFEval strict de 38,1 y RACE de 38,1 indican un seguimiento de instrucciones y una comprension lectora limitados; no es adecuado para tareas que exijan formato estricto sin validacion posterior.
- HumanEval de 37,2 limita su uso en generacion de codigo en produccion sin revision humana.
- Sin soporte documentado de tool calling ni de agentes; las capacidades de function calling de la base no se garantizan tras el ajuste.
- Licencia Apache 2.0 permite uso comercial, pero el modelo se distribuye sin garantias y el paper esta aun en revision.
- El contexto de 8192 tokens, aunque extendido con YaRN, puede degradar la calidad en secuencias proximas al limite.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/flaitenberger/SpinningStrawIntoGold-Qwen2.5-Math-7B-Dolci100k-Baseline
- Repositorio con todos los seeds: https://huggingface.co/flaitenberger/SpinningStrawIntoGold-Qwen2.5-Math-7B-SFT-AllSeeds
- Dataset de mezclas SFT: https://huggingface.co/datasets/flaitenberger/SpinningStrawIntoGold-SFT-Mixtures
- Dataset Dolci-Instruct-SFT-No-Tools: https://huggingface.co/datasets/allenai/Dolci-Instruct-SFT-No-Tools
- Modelo base Qwen2.5-Math-7B: https://huggingface.co/Qwen/Qwen2.5-Math-7B
- Paper: en revision, el enlace al preprint se anadira en la model card (no disponible)
