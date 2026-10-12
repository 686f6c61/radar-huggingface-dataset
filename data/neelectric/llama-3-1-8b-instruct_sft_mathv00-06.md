# Neelectric/Llama-3.1-8B-Instruct_SFT_mathv00.06

## Resumen

Llama-3.1-8B-Instruct_SFT_mathv00.06 es un ajuste fino supervisado (SFT) del modelo meta-llama/Llama-3.1-8B-Instruct, desarrollado por el usuario Neelectric y publicado en HuggingFace. El modelo se ha entrenado específicamente sobre el dataset Neelectric/OpenR1-Math-220k_all_Llama3_4096toks, orientado a tareas de razonamiento matemático y resolución de problemas, y forma parte de una familia de variantes experimentales del mismo autor (versiones v00.01 a v00.08, incluyendo variantes con EWC). Su relevancia radica en ser un ejemplo de ajuste especializado en matemáticas sobre una base instruct de propósito general, dentro del ecosistema open-r1.

Arquitectura y tamaño: hereda íntegramente la topología del modelo base Llama 3.1 8B Instruct, un transformer decoder-only de 8.030.261.248 parámetros (aproximadamente 8,03 mil millones), con una ventana de contexto nativa del modelo base de 128.000 tokens. El ajuste se realizó con la librería TRL (versión 1.1.0.dev0) sobre secuencias de 4.096 tokens, según indica el nombre del dataset.

Estado de adopción: el modelo registra 0 descargas y 0 "likes" en HuggingFace, se publicó el 12 de octubre de 2026 y el repositorio ocupa 32,1 GB. No se ha publicado información sobre licencia específica, idiomas declarados ni resultados de benchmarks en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Llama 3.1 8B Instruct) |
| Parametros totales | 8.030.261.248 (8,03 B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 128.000 tokens en el modelo base; entrenamiento SFT a 4.096 tokens por muestra (dataset) |
| Tipos de cuantizacion | No disponible en la ficha (formato safetensors en precision completa; compatible con cuantizaciones estandar tipo GGUF/AWQ/GPTQ mediante herramientas externas) |
| Idiomas soportados | No disponibles en la ficha (el modelo base declara soporte para ingles, aleman, frances, italiano, portugues, hindi, espanol y tailandes) |
| Licencia | No disponible (la model card indica "licence: license" sin detallar; el modelo base se distribuye bajo Llama 3.1 Community License) |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

El modelo es un ajuste fino supervisado (SFT) del checkpoint meta-llama/Llama-3.1-8B-Instruct. Conserva la arquitectura del modelo base: un transformer decoder-only autorregresivo con normalización RMSNorm, activación SwiGLU, atención con RoPE (rotary position embeddings) y Grouped Query Attention (GQA) en las capas de atención. Los 8.030.261.248 parámetros son exactamente los del modelo base, por lo que no hay modificación estructural ni poda.

El entrenamiento se realizó con TRL 1.1.0.dev0 sobre el dataset Neelectric/OpenR1-Math-220k_all_Llama3_4096toks, derivado del corpus OpenR1-Math-220k, con secuencias de 4.096 tokens (indicado en el nombre del dataset). El proceso es SFT puro, sin evidencia de etapas posteriores de RLHF, DPO u optimización por preferencias en la información disponible. El run de entrenamiento está registrado en Weights & Biases (proyecto open-r1_math, run greftv75). Versiones del stack: Transformers 4.57.6, PyTorch 2.9.0, Datasets 5.0.1, Tokenizers 0.22.2.

## Capacidades

- Generacion de texto conversacional en formato instruct, heredada del modelo base Llama 3.1 8B Instruct.
- Razonamiento matematico y resolucion de problemas: es el eje del ajuste, ya que el dataset de entrenamiento es especificamente de matematicas (OpenR1-Math-220k).
- Razonamiento multi-paso (chain-of-thought): esperable por el tipo de datos de entrenamiento, aunque no se documenta explicitamente.
- Soporte de tool calling / function calling: heredado del modelo base, no verificado especificamente tras el ajuste.
- Capacidades de agente y razonamiento multi-turno: heredadas del modelo base, sin evaluacion publicada para esta variante.
- Capacidades multilingues: no declaradas en la ficha; dependen del modelo base.
- No se declaran capacidades de vision, audio ni modo "thinking" explicito.
- Generacion de codigo: heredada del modelo base, no reforzada por el ajuste.

## Casos de uso

- Razonamiento matematico asistido: el modelo se ha ajustado sobre un corpus de matematicas, por lo que es adecuado para resolver problemas algebraicos, de calculo y demostraciones paso a paso en entornos educativos o de investigacion.
- Tutoria y generacion de ejercicios: se puede emplear para producir problemas matematicos con soluciones desarrolladas, aprovechando la ventana de contexto del modelo base para incluir enunciados largos.
- Generacion de soluciones paso a paso: util en pipelines de evaluacion automatica donde se requiere el desarrollo intermedio, no solo la respuesta final.
- Base para ajustes adicionales: sirve como punto de partida (checkpoint SFT) para experimentos de RLHF, DPO o GRPO sobre tareas matematicas.
- Comparacion de tecnicas de ajuste: al existir variantes v00.01 a v00.08 y versiones con EWC, permite estudiar el efecto de distintas estrategias de entrenamiento sobre el mismo corpus.
- Investigacion en destilacion de razonamiento: al derivar del corpus OpenR1-Math-220k, es util para replicar o extender experimentos del proyecto open-r1.
- Asistencia en documentacion tecnica con contenido matematico: redaccion de explicaciones con formulas y notacion.
- Chatbot especializado en matematicas para uso interno: desplegable mediante transformers, TGI o vLLM con prompts en formato conversacional.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de MMLU, GSM8K, MATH, HumanEval ni ninguna otra, y no se han encontrado evaluaciones en la busqueda web para esta variante concreta.

## Requisitos de hardware

- VRAM estimada en FP16/BF16: aproximadamente 16 GB solo para los pesos, mas overhead de activaciones y cache KV; en la practica se recomienda 24 GB o mas.
- VRAM estimada en INT8: en torno a 8-9 GB para pesos.
- VRAM estimada en INT4 (GGUF Q4_K_M): en torno a 5-6 GB para pesos.
- GPU recomendadas (precision completa): A100 40/80 GB, H100, L40S, RTX 4090 24 GB (justa para FP16 con contexto reducido).
- GPU de consumo compatibles: RTX 4090 y RTX 3090 (24 GB) para FP16; RTX 4080, 4070 Ti, 3080 o inferiores (12 GB o menos) solo con cuantizacion INT8/INT4.
- Opciones de despliegue: transformers (formato nativo safetensors), vLLM, Text Generation Inference (TGI), llama.cpp y Ollama (previo conversion a GGUF), entre otros compatibles con Llama 3.1.
- Latencia y throughput estimados: no disponibles. Al ser un modelo denso de 8B, es esperable un throughput alto en GPUs modernas, pero no se aportan cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Neelectric/Llama-3.1-8B-Instruct_SFT_mathv00.06 | 8,03 B | 128.000 tokens (base), SFT a 4.096 | No disponible | No disponible | HuggingFace (0 descargas) |
| meta-llama/Llama-3.1-8B-Instruct (base) | 8,03 B | 128.000 tokens | Benchmarks publicos de Llama 3.1 (no reproducidos aqui) | Llama 3.1 Community License | HuggingFace, ampliamente distribuido |
| Neelectric/Llama-3.1-8B-Instruct_SFT_Math-220kv00.08 | 8,03 B (esperado) | 32.768 tokens segun ficha de variantes similares | No disponible | No disponible | HuggingFace |
| Neelectric/Llama-3.1-8B-Instruct_SFT_mathsp_ewc_v00.08 | 8,03 B (esperado) | 32.768 tokens segun ficha de variantes similares | No disponible | No disponible | HuggingFace |

Las variantes del mismo autor comparten base y dataset similar, diferenciandose por la estrategia de entrenamiento (SFT estandar, extension del dataset, EWC). No se dispone de datos de benchmarks que permitan una comparacion cuantitativa con alternativas de la categoria (por ejemplo, modelos de razonamiento matematico de tamano 7-8B).

## Limitaciones y advertencias

- Sesgos: no evaluados en la informacion disponible; al heredar del modelo base, arrastra los sesgos conocidos de Llama 3.1.
- Riesgo de alucinacion: no cuantificado. En tareas matematicas, el modelo puede generar desarrollos plausibles con resultados incorrectos si no se valida la respuesta.
- Limitacion de contexto en el ajuste: aunque el modelo base soporta 128.000 tokens, el entrenamiento SFT se realizo sobre secuencias de 4.096 tokens, lo que puede degradar el rendimiento efectivo en contextos mucho mas largos.
- Idiomas: la ficha no declara idiomas; el comportamiento multilingue no esta verificado tras el ajuste.
- Licencia: no especificada en la ficha ("licence: license"), lo que genera incertidumbre para uso comercial. El modelo base esta sujeto a la Llama 3.1 Community License, con sus propias condiciones.
- Adopcion nula: 0 descargas y 0 likes, sin validacion por parte de la comunidad ni evaluaciones externas.
- Version experimental: la nomenclatura v00.06 sugiere un estado temprano o de investigacion, no una version estable de produccion.
- Sin benchmarks publicados: no hay evidencia cuantitativa de mejora frente al modelo base ni frente a alternativas.
- Para produccion, se recomienda validar en el dominio objetivo, fijar versiones del modelo y monitorizar alucinaciones en tareas matematicas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Neelectric/Llama-3.1-8B-Instruct_SFT_mathv00.06
- Modelo base: https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct
- Dataset de entrenamiento: https://huggingface.co/datasets/Neelectric/OpenR1-Math-220k_all_Llama3_4096toks
- Run de entrenamiento en Weights & Biases: https://wandb.ai/neelectric/open-r1_math/runs/greftv75
- Repositorio de TRL: https://github.com/huggingface/trl
- Variante relacionada v00.08: https://huggingface.co/Neelectric/Llama-3.1-8B-Instruct_SFT_Math-220kv00.08
- Variante relacionada con EWC: https://huggingface.co/Neelectric/Llama-3.1-8B-Instruct_SFT_mathsp_ewc_v00.08
- Ficha de una variante previa en featherless.ai: https://featherless.ai/models/Neelectric/Llama-3.1-8B-Instruct_SFT_math00.01
