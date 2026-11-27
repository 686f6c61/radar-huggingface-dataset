# hisplan/Llama-3.1-8B-ko-sft-creation-sft-dpo-qlora-camp-day2

## Resumen

Este repositorio contiene tres adaptadores LoRA (no pesos completos) entrenados secuencialmente sobre `unsloth/Meta-Llama-3.1-8B`, la version base (no Instruct) de Llama 3.1 8B de Meta. Lo desarrolla el usuario `hisplan` como material didactico del "Mini LLM Camp Day 2", un taller universitario sobre fine-tuning de modelos pequenos. El objetivo no es producir un asistente util, sino demostrar de forma controlada el principio "garbage in, garbage out": el modelo se entrena deliberadamente con datos sin corregir para que los alumnos observen como los defectos del dataset se propagan al comportamiento final.

La cadena de entrenamiento consta de tres fases: un SFT de instrucciones en coreano (800 ejemplos Alpaca traducidos de `nlpai-lab/kullm-v2`), un SFT sobre 152 pares de Q&A de "ciencia de la creacion" (una corriente que interpreta la ciencia desde una lectura literal del Genesis) y un DPO sobre 160 pares de preferencia. Las tres fases usan QLoRA en 4 bits (NF4, doble cuantizacion, computo en bf16) con LoRA r=16, alpha=16 y dropout=0 sobre las siete proyecciones del transformer.

Es relevante ahora como caso de estudio pedagogico: la model card documenta con transparencia inusual las metricas del experimento (45 % de respuestas alineadas con la perspectiva creacionista tras el segundo SFT, 65 % tras el DPO) y muestra como 16 ejemplos defectuosos dejan sin corregir degradan el resultado. No es un modelo para produccion ni para uso informativo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3.1), adaptadores LoRA sobre base 8B |
| Parametros totales | 8 030 millones (modelo base); adaptadores LoRA: ~84 MB cada uno, tres en total |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 131 072 tokens en el base Llama 3.1; el entrenamiento uso maximo 2048 (SFT) y 1024 (DPO) tokens |
| Tipos de cuantizacion | Entrenamiento en QLoRA 4-bit NF4 con doble cuantizacion; inferencia en bf16 tras merge de adaptadores |
| Idiomas soportados | Coreano (`ko`) declarado; el base soporta oficialmente 8 idiomas (ingles, aleman, frances, italiano, portugues, hindi, espanol, tailandes) |
| Licencia | Llama 3.1 Community License |
| Formato de pesos | safetensors (adaptadores PEFT/LoRA) |
| Libreria | peft |
| Tamano del repo | 0.3 GB |
| Configuracion LoRA | r=16, alpha=16, dropout=0, target: q_proj, k_proj, v_proj, o_proj, gate_proj, up_proj, down_proj |
| Orden de aplicacion | 01-ko-alpaca → 02-creation-sft → 05-dpo (obligatorio) |

## Arquitectura y entrenamiento

El modelo base es un transformer decoder-only de 8 000 millones de parametros con atencion por grupos (GQA) y tokenizador de 128 256 entradas. Sobre el se aplican tres adaptadores LoRA de forma secuencial; tras cada fase el adaptador se fusiona (merge) en el modelo en bf16 y se parte de ese estado para la siguiente. No hay full fine-tuning: solo se entrenan los pesos de las matrices de bajo rango.

Los datos de entrenamiento son escasos y muy especificos: 800 ejemplos Alpaca en coreano (lr 1e-4, 50 pasos, 1 epoch, seed 42), 152 pares de Q&A de ciencia de la creacion (lr 2e-4, 3 epochs, seed 3407) y 160 pares de preferencia DPO (lr 5e-5, beta 0.1, 3 epochs, seed 3407). El DPO usa como `chosen` las respuestas modelo del dataset y como `rejected` respuestas reales generadas por el checkpoint 02 el 19 de noviembre de 2026, etiquetadas por Claude en tres categorias (mixta 144, mainstream 31, distanciada 6). El entrenamiento se ejecuto en una unica GPU Runpod L40S de 48 GB el 25 de noviembre de 2026. El prompt de entrenamiento es formato Alpaca con cuatro espacios finales en el encabezado y sin system prompt.

## Capacidades

- Generacion de texto en coreano siguiendo instrucciones en formato Alpaca.
- Respuesta a preguntas sobre tematica de "ciencia de la creacion" con la perspectiva inculcada en el segundo SFT.
- Alineacion de preferencias mediante DPO: el modelo aprende a preferir respuestas del estilo del dataset sobre las generadas por el checkpoint anterior.
- No soporta tool calling ni function calling (no fue entrenado para ello).
- No soporta razonamiento multi-paso explicito ni modo "thinking".
- No tiene vision, audio ni capacidades multimodales.
- Multilingue limitado: el entrenamiento es exclusivamente en coreano; el base conserva cierta competencia en los idiomas oficiales de Llama 3.1, pero el ajuste puede degradarla.
- No es un modelo Instruct: el base es el checkpoint preentrenado, no el Instruct de Meta.

## Casos de uso

- Docencia sobre fine-tuning: sirve como ejemplo reproducible de pipeline SFT → SFT → DPO con QLoRA, con hiperparametros y semillas documentados, ideal para talleres universitarios.
- Demostracion de "garbage in, garbage out": permite a los alumnos comprobar empiricamente como 16 ejemplos defectuosos sin corregir reducen la tasa de respuestas alineadas del 79 % (con datos corregidos) al 65 % (con datos originales).
- Estudio de propagacion de sesgos en datasets pequenos: util para investigar como un dataset de 152 ejemplos condiciona el comportamiento de un modelo de 8B.
- Evaluacion de DPO sobre pares generados por el propio modelo: caso practico de construccion de datasets de preferencia a partir de salidas del checkpoint anterior y etiquetado por un LLM juez.
- Analisis de formato de prompt: permite estudiar la sensibilidad de un modelo a detalles exactos del template (cuatro espacios finales, ausencia de system prompt).
- Referencia negativa en auditorias de datasets cientificos: util para ilustrar por que conviene revisar la calidad y coherencia ideologica de los datos antes de entrenar.
- No se recomienda para atencion al cliente, generacion de codigo, asistencia factual ni ningun uso en produccion.

## Benchmarks y rendimiento

La model card solo reporta una metrica de evaluacion propia: porcentaje de respuestas alineadas con la perspectiva creacionista sobre 33 preguntas de opinion, cinco repeticiones cada una, temperature 0.6, juez Claude.

| Checkpoint | Respuestas en perspectiva creacionista | Pregunta murcielago/delfin (de 5 intentos) |
|---|---|---|
| 02-creation-sft | 45 % | 1 |
| 05-dpo | 65 % | 0 |
| 05-dpo con datos corregidos (referencia) | 79 % | 5 |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible.

## Requisitos de hardware

- VRAM para inferencia en bf16: ~16 GB para el modelo fusionado (8B parametros a 2 bytes).
- VRAM para inferencia en 4-bit: ~5-6 GB con cuantizacion NF4 o GGUF Q4.
- VRAM para cargar los tres adaptadores sin fusionar: ~0.25 GB adicionales.
- GPU recomendadas para entrenamiento: L40S 48 GB (la usada en el experimento); alternativas validas: A100 40/80 GB, H100, RTX 4090 24 GB (suficiente con QLoRA y batch pequeno).
- Cabe en GPU de consumo: si, en RTX 3090/4090 (24 GB) en bf16, y en RTX 3060/4060 Ti (12-16 GB) con cuantizacion 4-bit.
- Despliegue: transformers + peft (ruta oficial documentada); vLLM o TGI tras fusionar adaptadores y exportar a safetensors; llama.cpp u Ollama si se convierte a GGUF.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque | Disponibilidad |
|---|---|---|---|---|---|
| hisplan/Llama-3.1-8B-ko-sft-creation-sft-dpo-qlora-camp-day2 | 8B (adaptadores LoRA) | 131k (entrenado a 2k) | Llama 3.1 Community | Educativo, coreano, dominio especifico | Hugging Face, 0 descargas |
| meta-llama/Llama-3.1-8B-Instruct | 8B | 131k | Llama 3.1 Community | Asistente general, multilingue | Hugging Face, ampliamente usado |
| nlpai-lab/kullm-v2 (dataset) / modelos KULLM | 8B-13B | variable | variable | Instrucciones en coreano | Hugging Face |
| unsloth/Meta-Llama-3.1-8B | 8B | 131k | Llama 3.1 Community | Base preentrenado | Hugging Face |

No hay datos publicos de rendimiento comparativo entre este modelo y alternativas; los benchmarks estandar no estan disponibles.

## Limitaciones y advertencias

- Modelo educativo y experimental: no debe usarse como fuente de informacion factual.
- Sesgo ideologico deliberado: entrenado para responder desde la "ciencia de la creacion", una perspectiva no cientifica; el 55 % de las respuestas del checkpoint 05 no adoptan esa perspectiva, lo que refleja incoherencia interna.
- Alucinacion documentada por el autor: "inventa cifras, fechas y resultados de investigacion con un tono plausible".
- Dataset con defectos intencionados: 16 de 169 ejemplos (14 en el split de entrenamiento) tienen conclusiones contrarias a la perspectiva objetivo; el DPO refuerza esas respuestas erroneas como `chosen`.
- Contexto efectivo limitado: aunque el base soporta 131k tokens, el entrenamiento uso maximo 2048 (SFT) y 1024 (DPO), por lo que el rendimiento en contextos largos no esta garantizado.
- Idioma: solo coreano en el ajuste; el uso en castellano producira salidas degradadas o en coreano.
- Formato de prompt rigido: requiere el template Alpaca exacto con cuatro espacios finales; pequenas variaciones degradan la calidad.
- Licencia Llama 3.1 Community: restricciones de uso comercial, obligacion de incluir "Built with Llama" y de respetar la politica de uso aceptable de Meta.
- Cero descargas y cero likes en el momento de la ficha: sin validacion por parte de la comunidad.
- No apto para produccion: sin garantias de estabilidad, sin evaluacion de seguridad y sin soporte.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/hisplan/Llama-3.1-8B-ko-sft-creation-sft-dpo-qlora-camp-day2
- Modelo base: https://huggingface.co/unsloth/Meta-Llama-3.1-8B
- Dataset SFT coreano: https://huggingface.co/datasets/nlpai-lab/kullm-v2
- Licencia Llama 3.1: https://llama.meta.com/llama3_1/license/
- Politica de uso aceptable de Llama 3.1: https://llama.meta.com/llama3_1/use-policy/
- Documentacion de PEFT: https://huggingface.co/docs/peft
- Documentacion de Unsloth: https://docs.unsloth.ai
