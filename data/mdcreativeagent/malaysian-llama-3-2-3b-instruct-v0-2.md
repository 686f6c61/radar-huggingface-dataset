# mdcreativeagent/Malaysian-Llama-3.2-3B-Instruct-v0.2

## Resumen

Malaysian-Llama-3.2-3B-Instruct-v0.2 es un ajuste fino (fine-tuning) del modelo meta-llama/Llama-3.2-3B-Instruct publicado por el usuario mdcreativeagent. El objetivo declarado es adaptar el modelo base al contexto malasio: legislacion, politica, religiones, lenguas y variantes dialectales de Malasia, ademas de mejorar el soporte para mandarin, tamil y jawi. El entrenamiento se realizo sobre el dataset mesolitica/Malaysian-SFT, con un volumen declarado de 1.200 millones de tokens de instrucciones "altamente curadas".

El modelo conserva la arquitectura transformer decoder-only del Llama-3.2-3B-Instruct original, con 3.606.752.256 parametros totales segun los pesos en safetensors. El autor declara una longitud de contexto de 128.000 tokens, una extension significativa respecto a los 128k que ya soporta la familia Llama 3.2 en sus variantes pequenas (el modelo base de 3B soporta 128k de forma nativa). El ajuste se hizo mediante LoRA sobre los modulos de atencion, MLP, embeddings y lm_head, con rango 256 y alpha 512.

Es relevante para desarrolladores que necesiten un modelo compacto (3B) con cobertura de idiomas del sudeste asiatico y variantes dialectales malasias, un nicho poco cubierto por los modelos generalistas. Sin embargo, la informacion publicada es escasa: no hay licencia declarada, no hay pipeline definido, cero descargas y cero likes en el momento de la consulta, y los benchmarks se limitan a MalayMMLU.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivado de Llama-3.2-3B-Instruct) |
| Parametros totales | 3.606.752.256 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 128.000 tokens (declarado por el autor) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | ms (malasio), en (ingles), zh (mandarin), ta (tamil); variantes dialectales declaradas: Jawi, Manglish, Johor, Kedah, Kelantan, Pahang, Perak, Sabah, Sarawak, Selangor, Negeri Sembilan, Terengganu |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Llama-3.2-3B-Instruct, un transformer decoder-only denso con atencion por grupos (GQA), RoPE y normalizacion RMSNorm, entrenado originalmente por Meta con un contexto nativo de 128k tokens. El ajuste fino se realizo con LoRA sobre los modulos `q_proj`, `k_proj`, `v_proj`, `o_proj`, `gate_proj`, `up_proj`, `down_proj`, `embed_tokens` y `lm_head`, con rango 256 y alpha 512 (factor alpha/rango de 2,0). El autor indica el uso de multipacking con enmascaramiento causal SDPA correcto para evitar contaminacion entre documentos y garantizar position ids adecuados, asi como una perdida CCE bifurcada para el `lm_head` de LoRA con el fin de reducir el consumo de memoria.

El dataset de entrenamiento es mesolitica/Malaysian-SFT, con 1.200 millones de tokens de instrucciones en contexto malasio. No se especifica la composicion exacta del dataset ni si hubo fases de RLHF o DPO adicionales; el autor solo describe el proceso de SFT con LoRA. El codigo de entrenamiento esta publicado en el repositorio malaysia-ai/cooking, en la ruta `llama/sft`. No se documentan innovaciones tecnicas adicionales como decodificacion especulativa o atencion lineal.

## Capacidades

- Generacion de texto y razonamiento en malasio, ingles, mandarin y tamil.
- Respuesta en variantes dialectales malasias declaradas: Jawi, Manglish, Johor, Kedah, Kelantan, Pahang, Perak, Sabah, Sarawak, Selangor, Negeri Sembilan y Terengganu.
- Generacion de codigo en los idiomas y variantes anteriores (declarado por el autor).
- Contexto multi-turno sobre tematica malasia: legislacion, politica, religiones y lenguas.
- Soporte de RAG estandar (declarado como "Standard RAG").
- Contexto largo de hasta 128.000 tokens.
- No se documenta soporte explicito de tool calling, function calling ni modo thinking.
- No se documenta capacidad de vision ni audio.

## Casos de uso

- Atencion al cliente en Malasia: el modelo puede gestionar conversaciones multi-turno en malasio, mandarin, tamil e ingles, y responder en dialectos regionales, lo que permite atender a usuarios de distintos estados con un unico modelo de 3B desplegable en hardware modesto.
- Consultas sobre legislacion malasia: con 128k tokens de contexto, se puede cargar documentacion legal completa y hacer preguntas sobre ella mediante RAG, aprovechando el ajuste sobre contexto legal declarado por el autor.
- Generacion de codigo en entornos multilingues del sudeste asiatico: el autor declara capacidad de programar en mandarin, tamil y variantes dialectales, util para equipos que documentan o comentan codigo en esas lenguas.
- RAG documental en empresas malasias: indexacion de manuales, politicas internas y bases de conocimiento en malasio e ingles, con recuperacion aumentada y respuestas en el idioma del usuario.
- Traduccion y adaptacion dialectal: conversion de contenido estandar a variantes como Kelantan, Kedah o Sabah para campanas de marketing o comunicacion publica regional.
- Procesamiento de contenido religioso y cultural: resumen y respuesta a preguntas sobre textos en jawi o sobre practicas religiosas, dado el ajuste declarado en religion y lengua.
- Despliegue en el borde o en GPU de consumo: con 3,6B parametros, es viable en GPUs de 8-24 GB con cuantizacion, adecuado para prototipos y aplicaciones con presupuesto limitado.
- Educacion y tutoria en lenguas minoritarias: asistencia a estudiantes tamil-hablantes o de dialectos regionales en Malasia, un nicho desatendido por modelos generalistas.

## Benchmarks y rendimiento

El autor publica resultados de MalayMMLU en modo 0-shot con evaluacion por letra:

| Categoria | Precision |
|---|---|
| STEM | 57,55 % |
| Language | 59,61 % |
| Social science | 58,07 % |
| Others | 57,30 % |
| Humanities | 60,25 % |
| Media (average accuracy) | 58,68 % |

Tamano del conjunto de evaluacion por categoria: Social science 6.918, Language 6.288, Humanities 4.395, Others 4.169, STEM 2.443. No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks en la informacion disponible, ni comparaciones directas con modelos similares.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 7,2 GB solo para pesos, mas overhead de activaciones y cache KV; en la practica se recomienda 10-12 GB.
- VRAM estimada en cuantizacion de 8 bits: alrededor de 3,6-4 GB de pesos; en 4 bits, alrededor de 2-2,5 GB.
- GPU recomendadas: A100 40/80 GB, H100 para despliegues de alta concurrencia con contexto largo; RTX 4090 (24 GB) para FP16 con contexto completo; RTX 3090/4080 (16-24 GB) para FP16 con contexto moderado.
- Cabe en GPU de consumo: si, en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070 y superiores con cuantizacion; en 4 bits es viable incluso en GPUs de 8 GB.
- Opciones de despliegue: vLLM, TGI, llama.cpp, Ollama y transformers con accelerate. El contexto de 128k exige atencion optimizada (FlashAttention, paged attention) para evitar consumo excesivo de memoria.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Malaysian-Llama-3.2-3B-Instruct-v0.2 | 3,6B | 128k (declarado) | ms, en, zh, ta + dialectos | no disponible | Hugging Face (0 descargas) |
| meta-llama/Llama-3.2-3B-Instruct | 3,2B | 128k | en, de, fr, it, pt, hi, es, th | Llama 3.2 Community License | Hugging Face (ampliamente usado) |
| Mesolitica Malaysian-LLM (familia) | variable (3B y otros) | variable | ms, en, zh, ta | variable segun modelo | Hugging Face |

La comparacion con la familia Mesolitica es pertinente porque el dataset de entrenamiento (mesolitica/Malaysian-SFT) y el codigo (malaysia-ai/cooking) provienen de ese ecosistema. No se dispone de datos de benchmarks comparativos directos entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- Licencia no declarada: no se puede confirmar si el uso comercial esta permitido; hay que contactar con el autor o asumir los terminos de Llama 3.2 Community License del modelo base, que impone restricciones (por ejemplo, a empresas con mas de 700 millones de usuarios mensuales).
- Modelo con cero descargas y cero likes en el momento de la consulta: sin validacion externa de la comunidad, lo que aumenta el riesgo de comportamiento no verificado.
- Riesgo de alucinacion inherente a un modelo de 3B, especialmente en tareas de razonamiento complejo, matematicas y codigo.
- Los benchmarks publicados se limitan a MalayMMLU; no hay evaluacion en tareas generales (MMLU, HumanEval, GSM8K) ni en seguridad.
- El contexto de 128k esta declarado por el autor, pero no se verifica en la model card con pruebas de aguja en pajar ni evaluaciones de contexto largo.
- Cobertura limitada fuera de los idiomas declarados: el rendimiento en castellano u otras lenguas no esta documentado.
- El ajuste por LoRA puede introducir degradacion en capacidades del modelo base no relacionadas con el contexto malasio; no se documenta ninguna evaluacion de regresion.
- No hay informacion sobre sesgos, filtros de seguridad ni moderacion de contenido.
- El pipeline no esta definido en Hugging Face, lo que puede complicar el uso directo con `pipeline()` de transformers.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mdcreativeagent/Malaysian-Llama-3.2-3B-Instruct-v0.2
- Modelo base: https://huggingface.co/meta-llama/Llama-3.2-3B-Instruct
- Dataset de entrenamiento: https://huggingface.co/datasets/mesolitica/Malaysian-SFT
- Codigo de entrenamiento: https://github.com/malaysia-ai/cooking/tree/main/llama/sft
