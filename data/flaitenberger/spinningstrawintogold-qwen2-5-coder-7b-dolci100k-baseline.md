# flaitenberger/SpinningStrawIntoGold-Qwen2.5-Coder-7B-Dolci100k-Baseline

## Resumen

SpinningStrawIntoGold-Qwen2.5-Coder-7B-Dolci100k-Baseline es un ajuste fino de Qwen2.5-Coder-7B desarrollado por el investigador flaitenberger como parte de los experimentos del articulo *Spinning Straw into Gold: Small Amounts of Synthetic Derivations Improve Reasoning in Instruction-Tuned Models* (en revision). El modelo sirve como linea base de control: se entrena sobre 100.000 ejemplos de instruccion de Dolci-Instruct-SFT-No-Tools sin ninguna derivacion sintetica, de modo que cualquier mejora observada en las variantes experimentales pueda atribuirse al dato sintetico anadido y no al proceso de SFT.

La relevancia del trabajo reside en su tesis metodologica: en lugar de generar datos sinteticos con otro modelo de lenguaje, el autor genera problemas de deduccion multi-paso (clausulas de Horn sobre constantes abstractas) mediante un programa corto, sin modelo en el bucle, de forma que los documentos son correctos por construccion. Este repositorio concreto es el punto de comparacion, no la variante mejorada; su interes es principalmente de investigacion y reproducibilidad.

Arquitectura transformer densa de Qwen2.5 (7.615.616.512 parametros), contexto nativo de 32.768 tokens en el modelo base, licencia Apache 2.0 y pesos en safetensors bf16. El entrenamiento se realizo con SFT de parametros completos durante una epoca y una longitud maxima de secuencia de 8.192 tokens.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (familia Qwen2.5) |
| Parametros totales | 7.615.616.512 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 32.768 tokens en el modelo base; entrenado con secuencias de hasta 8.192 tokens |
| Tipos de cuantizacion | no especificados por el autor; pesos publicados en bf16 (compatibles con cuantizacion posterior a GGUF/AWQ/GPTQ mediante herramientas externas) |
| Idiomas soportados | en (segun model card y metadatos) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bf16) |
| Tamano del repositorio | 15,2 GB |
| Modelo base | Qwen/Qwen2.5-Coder-7B |
| Plantilla de chat | Qwen2.5 chat template, con system prompt por defecto; fin de turno `<|im_end|>` (id 151645) |
| Precisión de entrenamiento | bf16 mixed precision, FSDP full sharding con gradient checkpointing |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura densa de Qwen2.5-Coder-7B: transformer decoder-only con atencion causal estandar, sin mezcla de expertos ni mecanismos hibridos. El ajuste fino es de parametros completos (full-parameter SFT) durante una sola epoca sobre 100.000 ejemplos de chat de un solo turno, con learning rate 5e-6, schedule lineal, warmup ratio 0,03 y batch global de 128. La perdida se calcula solo sobre los tokens del asistente (prompt enmascarado) usando la plantilla de chat de Qwen2.5. El run aborta si mas del 0,5% de los targets superarian la longitud maxima de 8.192 tokens.

Los datos provienen de `allenai/Dolci-Instruct-SFT-No-Tools` (conversaciones de un solo turno, muestreadas con semilla 3407), configuracion `baseline` del dataset `flaitenberger/SpinningStrawIntoGold-SFT-Mixtures`. En esta configuracion no se sustituye ninguna fila por derivaciones sinteticas; todas las mezclas del estudio comparten las mismas filas de Dolci salvo la porcion reemplazada. El codigo de entrenamiento es `scripts/train_instruction_sft.py` del code base synthetic-RLVL (Hugging Face Trainer con FSDP), y el archivo `provenance.json` registra el run de origen, los argumentos de entrenamiento y los ficheros de evaluacion. No se documenta RLHF ni DPO en esta ficha.

## Capacidades

- Generacion de texto conversacional de un solo turno, con formato de chat Qwen2.5.
- Razonamiento deductivo multi-paso: el modelo base y este ajuste se evaluan en ProofWriter (profundidades 0 a 5), FOLIO y LogiQA.
- Generacion de codigo: evaluado en HumanEval (69,5) y MBPP (71,8), coherente con su origen en Qwen2.5-Coder.
- Matematicas: resolucion de problemas aritmeticos y de enunciado (GSM8K 77,9).
- Comprension lectora y conocimiento general: MMLU, ARC-Challenge, HellaSwag, BoolQ, SciQ, RACE.
- Seguimiento de instrucciones: evaluado en IFEval en modo estricto.
- Capacidades multilingues: limitadas al ingles segun la model card; no se declaran otros idiomas.
- Tool calling / function calling: no declarado; el dataset de entrenamiento excluye explicitamente herramientas (`No-Tools`).
- Modo thinking, vision o audio: no disponible.

## Casos de uso

- Linea base de ablacion en investigacion sobre datos sinteticos: sirve como referencia de control frente a las variantes con derivaciones inyectadas, permitiendo aislar el efecto del dato sintetico en el SFT.
- Reproduccion de experimentos de razonamiento deductivo: con los ficheros de evaluacion publicados en `eval/` y `provenance.json`, un equipo puede replicar las cifras de ProofWriter, FOLIO y BBH y verificar la metodologia.
- Evaluacion de pipelines de datos de instruccion: util para medir como afecta la composicion de la mezcla (100k ejemplos Dolci sin herramientas) a benchmarks de razonamiento y codigo.
- Generacion de codigo asistida en entornos de investigacion: sus resultados en HumanEval y MBPP lo hacen apto para prototipos de autocompletado y generacion de funciones en Python, siempre con validacion posterior.
- Estudio de sesgos de etiqueta en tareas de eleccion multiple: el articulo documenta que parte de la mejora en ProofWriter proviene de dejar de preferir una etiqueta de respuesta; este modelo permite medir ese sesgo en el punto de partida.
- Analisis de seguimiento de instrucciones: con IFEval estricto en 38,3, es un punto de comparacion para estudiar la degradacion o mejora de la adherencia a formato tras SFT.
- Base para nuevos ajustes: al ser Apache 2.0 y safetensors, puede servir como inicializacion para experimentos propios de SFT o LoRA en ingles.

## Benchmarks y rendimiento

Resultados publicados por el autor (exactitud, exact match o pass@1 en porcentaje, segun lm-evaluation-harness):

| Benchmark | Este modelo |
|---|---|
| ARC-Challenge | 46,8 |
| GSM8K | 77,9 |
| MMLU | 65,2 |
| HellaSwag | 70,9 |
| LogiQA (AGIEval) | 33,0 |
| BBH | 67,5 |
| HumanEval | 69,5 |
| MBPP | 71,8 |
| BoolQ | 84,6 |
| IFEval (strict) | 38,3 |
| RACE | 43,4 |
| SciQ | 95,7 |
| TruthfulQA-MC2 | 49,0 |
| FOLIO | 55,2 |
| GPQA-Diamond | 33,3 |
| ProofWriter depth 0, chain-of-thought | 43,0 |
| ProofWriter depth 1, chain-of-thought | 35,0 |
| ProofWriter depth 2, chain-of-thought | 39,6 |
| ProofWriter depth 3, chain-of-thought | 38,2 |
| ProofWriter depth 5, chain-of-thought | 40,2 |
| ProofWriter depth 0, direct answer | 49,0 |
| ProofWriter depth 1, direct answer | 37,8 |
| ProofWriter depth 2, direct answer | 48,2 |
| ProofWriter depth 3, direct answer | 44,4 |
| ProofWriter depth 5, direct answer | 45,4 |

El autor advierte que diferencias de uno a dos puntos entre dos modelos individuales estan dentro de la dispersion entre runs, y que el articulo reporta medias sobre runs. No se proporcionan resultados de los modelos comparables en la informacion disponible.

## Requisitos de hardware

- VRAM para inferencia en bf16: aproximadamente 15,2 GB solo para pesos, mas overhead de activaciones y cache KV; en la practica, 18-20 GB para contexto corto y mas para contextos largos.
- Cuantizacion a 8 bits: alrededor de 8 GB de pesos; a 4 bits, alrededor de 4-5 GB, lo que permite ejecucion en GPUs de consumo.
- GPU de consumo: cabe en RTX 4090 (24 GB) en bf16 con contexto moderado; en RTX 3090/4080 (16 GB) requiere cuantizacion. En GPUs de 8-12 GB es viable solo con cuantizacion de 4 bits y contextos reducidos.
- GPU de datacenter: A100 40/80 GB, H100, L40S y similares para despliegue en bf16 con throughput alto.
- Opciones de despliegue: transformers (libreria declarada), text-generation-inference (tag `text-generation-inference` y `endpoints_compatible`), vLLM, llama.cpp/Ollama y TGI mediante conversion a GGUF.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| SpinningStrawIntoGold-Qwen2.5-Coder-7B-Dolci100k-Baseline | 7,6B | 32.768 (base); entrenado a 8.192 | Apache 2.0 | Linea base de control sin datos sinteticos; resultados de benchmarks publicados |
| Qwen2.5-Coder-7B (base) | 7,6B | 32.768 | Apache 2.0 | Modelo de partida; referencia obligada para medir el efecto del SFT |
| Variantes del mismo estudio con derivaciones (5-25% de la mezcla) | 7,6B | 32.768 (base) | Apache 2.0 | El articulo reporta mejoras de 5-16 puntos en ProofWriter, hasta 6 en FOLIO y hasta 7 en subtareas multi-paso de BBH frente a esta linea base |
| Qwen2.5-7B (familia general) | 7,6B | 32.768 | Apache 2.0 | Usado en el articulo para verificar que la ganancia en ProofWriter se mantiene en 5 modelos de 3 familias entre 3B y 14B |

No se dispone de datos de benchmarks de terceros en la informacion proporcionada para establecer comparaciones numericas adicionales con modelos ajenos al estudio.

## Limitaciones y advertencias

- Modelo de investigacion: es una linea base de control, no un modelo afinado para uso general; su rendimiento en tareas fuera de las evaluadas puede degradarse respecto al base.
- Idioma: la model card declara unicamente ingles; no hay garantia de calidad en castellano ni en otros idiomas.
- Sin herramientas: el dataset de entrenamiento excluye explicitamente tool calling (`No-Tools`); no debe asumirse soporte fiable de function calling.
- Riesgo de alucinacion: como todo modelo generativo de 7B, puede producir contenido plausible pero incorrecto, especialmente en tareas de conocimiento factual (TruthfulQA-MC2 49,0 y GPQA-Diamond 33,3 son indicativos de margen de mejora).
- Sesgos de etiqueta: el propio articulo documenta que parte de la mejora en ProofWriter en las variantes proviene de corregir la preferencia por una etiqueta de respuesta; en esta linea base ese sesgo puede estar presente.
- Seguimiento de instrucciones limitado: IFEval estricto en 38,3 sugiere adherencia moderada a formatos y restricciones complejas.
- Diferencias de 1-2 puntos entre modelos individuales estan dentro de la dispersion entre runs; no deben interpretarse como mejoras reales sin medias sobre semillas.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantias ni soporte; el articulo esta en revision y el preprint aun no esta enlazado.
- Fecha de creacion del repositorio (2026-11-24) y cero descargas/likes: sin validacion de la comunidad ni reportes independientes de uso en produccion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/flaitenberger/SpinningStrawIntoGold-Qwen2.5-Coder-7B-Dolci100k-Baseline
- Repositorio con todos los runs del estudio: https://huggingface.co/flaitenberger/SpinningStrawIntoGold-Qwen2.5-Coder-7B-SFT-AllSeeds
- Dataset de mezclas SFT: https://huggingface.co/datasets/flaitenberger/SpinningStrawIntoGold-SFT-Mixtures
- Dataset Dolci-Instruct-SFT-No-Tools: https://huggingface.co/datasets/allenai/Dolci-Instruct-SFT-No-Tools
- Modelo base Qwen2.5-Coder-7B: https://huggingface.co/Qwen/Qwen2.5-Coder-7B
- Preprint del articulo: no disponible (en revision; el autor indica que se anadira el enlace)
