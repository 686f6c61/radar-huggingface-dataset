# flaitenberger/SpinningStrawIntoGold-Qwen2.5-7B-Dolci100k-Baseline

## Resumen

SpinningStrawIntoGold-Qwen2.5-7B-Dolci100k-Baseline es un ajuste fino supervisado (SFT) de Qwen2.5-7B publicado por el usuario flaitenberger como parte de los experimentos del articulo *Spinning Straw into Gold: Small Amounts of Synthetic Derivations Improve Reasoning in Instruction-Tuned Models*, actualmente en revision. El modelo sirve como linea base de una familia de experimentos cuyo objetivo es medir si una pequena proporcion de datos sinteticos de deduccion, generados por programa y verificables simbolicamente, mejora el razonamiento de modelos ajustados por instrucciones.

En este caso concreto, la mezcla de entrenamiento es `Dolci100k-Baseline`: 100.000 ejemplos de instruccion de Dolci-Instruct-SFT-No-Tools, sin ninguna derivacion sintetica anadida. Por tanto, no incorpora la innovacion del articulo (la sustitucion de un 5-25% de las filas por problemas de deduccion), sino que actua como referencia contra la que se comparan las variantes con datos de deduccion. El modelo base es un transformer denso de 7.615.616.512 parametros, con la plantilla de chat de Qwen2.5 y pesos en bf16 safetensors.

Su relevancia es metodologica: permite aislar el efecto de los datos sinteticos de deduccion frente a un ajuste estandar sobre el mismo subconjunto de Dolci, con la misma receta de entrenamiento (una epoca, lr 5e-06, batch global 128, longitud maxima 8192). La licencia es Apache 2.0 y el unico idioma declarado es el ingles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (familia Qwen2) |
| Parametros totales | 7.615.616.512 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 8192 tokens (longitud maxima de secuencia en entrenamiento; contexto nativo de Qwen2.5-7B) |
| Tipos de cuantizacion | no disponible en la model card (pesos publicados en bf16; compatible con cuantizaciones estandar de la familia Qwen2, no verificadas por el autor) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (bf16) |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-7B, un transformer decoder-only denso con atencion por causalidad estandar y RoPE, sin componentes MoE ni mecanismos hibridos. El ajuste es de parametros completos (full-parameter SFT) durante una sola epoca sobre 100.000 ejemplos de chat de un solo turno. La tasa de aprendizaje es 5e-06 con schedule lineal y warmup ratio 0.03, batch global de 128 y precision mixta bf16 con FSDP de sharding completo y gradient checkpointing. La longitud maxima de secuencia es 8192 y el entrenamiento aborta si mas del 0,5% de los objetivos se truncarian. La perdida se calcula solo sobre los tokens del asistente (prompt enmascarado) usando la plantilla de chat de Qwen2.5, incluido su system prompt por defecto.

Los datos provienen de `allenai/Dolci-Instruct-SFT-No-Tools` (conversaciones de un solo turno, muestreadas con semilla 3407), correspondientes a la configuracion `baseline` del dataset `flaitenberger/SpinningStrawIntoGold-SFT-Mixtures`. Al ser la linea base, no contiene problemas de deduccion Horn generados por programa ni derivaciones paso a paso; esa es precisamente la variable que el articulo manipula en las demas variantes. El codigo de entrenamiento es `scripts/train_instruction_sft.py` del code base synthetic-RLVL (Hugging Face Trainer con FSDP), y el archivo `provenance.json` registra la ejecucion fuente, los argumentos y los ficheros de evaluacion. Este repositorio contiene la ejecucion `seed3407`; el resto de semillas estan en `flaitenberger/SpinningStrawIntoGold-Qwen2.5-7B-SFT-AllSeeds`.

## Capacidades

- Generacion de texto conversacional de un solo turno con la plantilla de chat de Qwen2.5 (termina las respuestas con `<|im_end|>`, token 151645, configurado como EOS).
- Razonamiento deductivo de varios saltos, evaluado en ProofWriter (profundidades 0 a 5) tanto con chain-of-thought como con respuesta directa.
- Razonamiento logico formal en FOLIO y LogiQA (AGIEval).
- Razonamiento matematico basico (GSM8K) y resolucion de problemas cientificos (SciQ, ARC-Challenge, GPQA-Diamond).
- Generacion de codigo (HumanEval, MBPP).
- Seguimiento de instrucciones evaluado con IFEval en modo estricto.
- Comprension lectora y respuesta a preguntas (BoolQ, RACE).
- Capacidades multilingues: limitadas al ingles segun la model card, aunque el modelo base Qwen2.5 es multilingue.
- No se documenta soporte explicito de tool calling, function calling ni comportamiento agentico; el dataset de entrenamiento excluye herramientas (`No-Tools`).

## Casos de uso

- Linea base de investigacion en razonamiento: sirve como referencia controlada para medir el efecto de anadir datos sinteticos de deduccion en la mezcla de SFT, manteniendo fijas las filas de Dolci, la receta y la semilla.
- Evaluacion de tecnicas de datos sinteticos: al compararse contra las variantes del mismo autor en `SpinningStrawIntoGold-Qwen2.5-7B-SFT-AllSeeds`, permite aislar cuanto de la mejora en ProofWriter, FOLIO y BBH atribuible a las derivaciones generadas por programa.
- Reproduccion de experimentos academicos: la publicacion de `provenance.json`, argumentos de entrenamiento y ficheros de evaluacion en `eval/` facilita replicar los numeros con lm-evaluation-harness.
- Prototipado de asistentes conversacionales en ingles: con 8192 tokens de contexto y plantilla de chat estandar, puede desplegarse en demos de un solo turno donde no se requiera tool calling.
- Evaluacion comparativa de modelos de 7B: sus resultados publicados en 15 benchmarks (MMLU, GSM8K, HumanEval, BBH, ProofWriter, entre otros) permiten situarlo frente a otros ajustes de Qwen2.5-7B en tareas de razonamiento y conocimiento.
- Analisis de degeneracion por sobreajuste a datos de instruccion: al entrenar una epoca completa sobre 100k ejemplos de Dolci, es util para estudiar como afecta el SFT estandar a capacidades de razonamiento logico frente al modelo base sin ajustar.

## Benchmarks y rendimiento

Resultados publicados por el autor (exactitud, exact match o pass@1 en porcentaje, lm-evaluation-harness):

| Benchmark | Este modelo |
|---|---|
| ARC-Challenge | 48.9 |
| GSM8K | 75.9 |
| MMLU | 70.4 |
| HellaSwag | 73.2 |
| LogiQA (AGIEval) | 35.5 |
| BBH | 64.8 |
| HumanEval | 65.9 |
| MBPP | 64.4 |
| BoolQ | 86.7 |
| IFEval (strict) | 42.0 |
| RACE | 45.4 |
| SciQ | 96.8 |
| TruthfulQA-MC2 | 50.6 |
| FOLIO | 53.7 |
| GPQA-Diamond | 38.9 |
| ProofWriter depth 0, chain-of-thought | 55.4 |
| ProofWriter depth 1, chain-of-thought | 44.6 |
| ProofWriter depth 2, chain-of-thought | 42.8 |
| ProofWriter depth 3, chain-of-thought | 42.0 |
| ProofWriter depth 5, chain-of-thought | 38.8 |
| ProofWriter depth 0, direct answer | 50.4 |
| ProofWriter depth 1, direct answer | 30.6 |
| ProofWriter depth 2, direct answer | 39.6 |
| ProofWriter depth 3, direct answer | 39.8 |
| ProofWriter depth 5, direct answer | 42.0 |

El autor advierte que diferencias de uno a dos puntos entre dos modelos individuales estan dentro de la dispersion entre ejecuciones; el articulo reporta medias sobre varias semillas. Los ficheros completos con definiciones de tarea estan en `eval/` (suites: bbh_nochat, capability, code_nochat, cot, deduction, folio_gpqa, mc, standard). No se han publicado en la informacion disponible los resultados de las variantes con datos de deduccion ni del modelo base sin ajustar.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 15,2 GB solo de pesos (tamano del repo), mas overhead de activaciones y cache KV; en la practica se recomienda al menos 20-24 GB para contexto moderado.
- Cuantizacion a 8 bits: unos 8 GB de pesos; a 4 bits, unos 4-5 GB, aunque el autor no publica cuantizaciones verificadas.
- GPU recomendadas: A100 40/80 GB, H100, L40S o RTX 4090 (24 GB) para bf16 con contexto corto; RTX 3090 (24 GB) es viable con cuantizacion o secuencias reducidas.
- Cabe en GPU de consumo: si, en RTX 4090/3090 con cuantizacion 8 o 4 bits, y en bf16 con contexto limitado.
- Opciones de despliegue: transformers (libreria declarada), text-generation-inference (tag `text-generation-inference` y `endpoints_compatible`); vLLM, llama.cpp u Ollama no estan verificados por el autor, aunque la familia Qwen2.5 suele ser compatible.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| SpinningStrawIntoGold-Qwen2.5-7B-Dolci100k-Baseline | 7,6B | 8192 | Apache 2.0 | Linea base SFT sobre 100k Dolci, sin deducciones; resultados publicados en 25 tareas |
| Qwen2.5-7B (base) | 7,6B | 32.768 nativo (segun ficha de Qwen) | Apache 2.0 | Modelo sin ajuste de instrucciones; referencia natural para medir el efecto del SFT |
| Variantes SpinningStrawIntoGold con deducciones | 7,6B | 8192 | Apache 2.0 | Misma receta con 5-25% de filas sustituidas por deducciones; el autor reporta +5 a +16 puntos en ProofWriter y hasta +6 en FOLIO frente a esta linea base |
| Otros ajustes SFT de Qwen2.5-7B | 7,6B | variable | variable | No se dispone de comparativa directa en la informacion proporcionada |

La comparacion mas informativa es interna al proyecto: el articulo reporta que, sobre Qwen2.5-7B, sustituir un 5-25% de la mezcla por deducciones eleva la exactitud entre 5 y 16 puntos en ProofWriter, hasta 6 en FOLIO y hasta 7 en las subtareas multietapa de BIG-Bench Hard, con los benchmarks generales practicamente sin cambios. Esta linea base es el denominador de esas cifras.

## Limitaciones y advertencias

- Modelo de investigacion: forma parte de un articulo en revision; no esta pensado como modelo de produccion ni ha pasado auditorias de seguridad.
- Solo ingles declarado; el rendimiento en castellano u otros idiomas no esta evaluado y puede degradarse respecto al Qwen2.5-7B original.
- Entrenado sin herramientas (`Dolci-Instruct-SFT-No-Tools`): no se espera soporte fiable de tool calling ni de flujos agenticos.
- Riesgo de alucinacion inherente a un modelo de 7B ajustado por SFT; TruthfulQA-MC2 de 50,6 y GPQA-Diamond de 38,9 indican margen amplio de mejora en veracidad y conocimiento experto.
- Razonamiento deductivo limitado: ProofWriter cae de 55,4 (profundidad 0, CoT) a 38,8 (profundidad 5, CoT), y en respuesta directa el rendimiento es erratico (30,6 en profundidad 1).
- IFEval estricto de 42,0 sugiere seguimiento de instrucciones moderado, inferior al de modelos ajustados con datos de instruccion mas curados.
- Sesgos: no se documenta ninguna evaluacion de sesgos, toxicidad ni equidad; al derivar de Dolci y Qwen2.5, hereda los sesgos de ambos.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantias ni soporte; conviene verificar la licencia del modelo base Qwen2.5-7B y de los datos Dolci antes de un despliegue comercial.
- El contexto de entrenamiento es de 8192 tokens, inferior al contexto nativo de Qwen2.5-7B; no se ha validado el comportamiento mas alla de esa longitud.
- Solo se publica la semilla 3407 en este repositorio; las diferencias de uno a dos puntos entre ejecuciones estan dentro de la varianza segun el propio autor.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/flaitenberger/SpinningStrawIntoGold-Qwen2.5-7B-Dolci100k-Baseline
- Repositorio con todas las semillas: https://huggingface.co/flaitenberger/SpinningStrawIntoGold-Qwen2.5-7B-SFT-AllSeeds
- Dataset de mezclas SFT: https://huggingface.co/datasets/flaitenberger/SpinningStrawIntoGold-SFT-Mixtures
- Dataset Dolci-Instruct-SFT-No-Tools: https://huggingface.co/datasets/allenai/Dolci-Instruct-SFT-No-Tools
- Modelo base Qwen2.5-7B: https://huggingface.co/Qwen/Qwen2.5-7B
- Preprint del articulo: no disponible (en revision; el autor indica que se anadira un enlace)
