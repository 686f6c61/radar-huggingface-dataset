# mdcreativeagent/Malaysian-Llama-3.1-8B-Instruct

## Resumen

Malaysian-Llama-3.1-8B-Instruct es un ajuste fino (fine-tuning) del modelo Meta Llama-3.1-8B-Instruct publicado por el usuario mdcreativeagent en Hugging Face. El modelo parte de los pesos oficiales de Meta y se entrena adicionalmente sobre un conjunto de instrucciones en malayo de alta curaduría, con el objetivo de mejorar la comprensión del contexto malasio: legislación, política, religión, idiomas y variantes dialectales regionales. El repositorio tiene 8.030.261.248 parámetros reales confirmados por los safetensors.

La propuesta del modelo es cubrir un nicho lingüístico muy específico: no solo el malayo estándar, sino también mandarín, tamil, jawi, manglish y dialectos regionales de Johor, Kedah, Kelantan, Pahang, Perak, Sabah, Sarawak, Selangor, Negeri Sembilan y Terengganu. Según la model card, el ajuste se realizó sobre 1.500 millones de tokens de un dataset de instrucciones malasio (mesolitica/Malaysian-SFT) y se aplicó mediante LoRA con rango 128 y alpha 256.

El modelo es relevante para quienes necesitan un asistente conversacional especializado en el ecosistema lingüístico malasio, pero conviene señalar que los benchmarks publicados por el propio autor muestran un rendimiento ligeramente inferior al modelo base de Meta en MalayMMLU, lo que sugiere un posible olvido catastrófico parcial en conocimiento general a cambio de la especialización regional. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y no se especifica licencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivada de Llama-3.1-8B-Instruct) |
| Parametros totales | 8.030.261.248 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 8192 tokens (usado en entrenamiento con multipacking); contexto nativo de Llama-3.1: 128K tokens |
| Tipos de cuantizacion | no disponible en la informacion proporcionada (pesos en safetensors, cuantizables a GGUF/AWQ/GPTQ por herramientas externas) |
| Idiomas soportados | ms (malayo), en (ingles), zh (chino), ta (tamil); ademas jawi, manglish y dialectos regionales malasios segun la model card |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only basado en la arquitectura Llama-3.1-8B, con 8.030 millones de parametros. El ajuste fino se realizo mediante LoRA sobre los modulos `q_proj`, `k_proj`, `v_proj`, `o_proj`, `gate_proj`, `up_proj`, `down_proj`, `embed_tokens` y `lm_head`, con rango 128 y alpha 256 (factor 2.0). Se empleo multipacking con longitud de contexto de 8192 tokens, con mascaras causales SDPA adecuadas para evitar contaminacion entre documentos y garantizar position ids correctos, ademas de chunk CCE loss para LoRA.

El entrenamiento se hizo sobre el dataset mesolitica/Malaysian-SFT, con un total declarado de 1.500 millones de tokens de instrucciones malasias de alta curaduria. El autor menciona el uso de 8 nodos H100 cedidos por SNS y Nvidia, y publica los registros de entrenamiento en Weights & Biases. El codigo fuente del proceso esta disponible en el repositorio mesolitica/malaya, en la ruta `session/llama3`. No se detalla si hubo fases de RLHF o DPO adicionales, ni la composicion exacta del dataset mas alla de su origen.

## Capacidades

- Generacion de texto conversacional multi-turno en malayo, ingles, chino y tamil.
- Comprension y generacion en jawi (escritura arabe del malayo) y en manglish (malayo-ingles coloquial).
- Cobertura de dialectos regionales malasios: Johor, Kedah, Kelantan, Pahang, Perak, Sabah, Sarawak, Selangor, Negeri Sembilan y Terengganu.
- Generacion de codigo en los idiomas y variantes cubiertos por el ajuste.
- Razonamiento sobre contexto malasio: legislacion, politica, religiones y lenguas del pais.
- Soporte de conversaciones multi-turno con contexto malasio.
- No se documenta soporte explicito de tool calling ni function calling en la model card.
- No se documenta modo thinking, vision ni audio.
- Capacidades de agentes y razonamiento multi-paso: no documentadas explicitamente.

## Casos de uso

- Atencion al cliente en Malasia: el modelo puede gestionar conversaciones multi-turno en malayo estandar, manglish y dialectos regionales, lo que permite atender a usuarios que escriben en su variante local sin necesidad de traduccion previa.
- Asistencia legal y administrativa localizada: con contexto sobre legislacion malasia, puede redactar borradores, resumir normativa o responder consultas sobre tramites, siempre con supervision humana dada la naturaleza del dominio.
- Traduccion y adaptacion entre variantes: util para normalizar texto entre malayo estandar, jawi y dialectos, o para adaptar contenido editorial a publicos regionales concretos.
- Generacion de codigo en entornos multilingues malasios: soporta instrucciones de programacion en mandarin, tamil y malayo, lo que facilita equipos de desarrollo con mezcla de idiomas.
- Contenido educativo y cultural: redaccion de materiales sobre historia, religion o politica malasia con terminologia y registro adecuados al contexto local.
- Procesamiento de documentos y conversaciones en call centers: al cubrir chino y tamil ademas del malayo, puede emplearse en centros de contacto multilingues de Malasia sin cambiar de modelo por idioma.
- Moderacion y analisis de contenido en redes: su cobertura de manglish y dialectos permite clasificar y resumir comentarios coloquiales que los modelos genericos no interpretan bien.

## Benchmarks y rendimiento

Los unicos benchmarks publicados en la informacion disponible son los de MalayMMLU, en modo 0-shot. Se presentan dos metricas: probabilidad del siguiente token (first token accuracy) y coincidencia exacta del primer token con vLLM Guided Decoding.

| Metrica (MalayMMLU, 0-shot) | Malaysian-Llama-3.1-8B-Instruct | Llama-3.1-8B-Instruct |
|---|---|---|
| Media (probabilidad siguiente token) | 61,28 | 64,26 |
| STEM | 61,52 | 64,02 |
| Language | 61,78 | 65,51 |
| Social science | 60,61 | 62,60 |
| Others | 60,25 | 62,20 |
| Humanities | 62,43 | 67,17 |
| Media (first token match, vLLM) | 58,52 | 59,73 |
| STEM (vLLM) | 58,62 | 58,74 |
| Language (vLLM) | 60,18 | 61,58 |
| Social science (vLLM) | 57,21 | 57,49 |
| Others (vLLM) | 56,90 | 56,87 |
| Humanities (vLLM) | 59,70 | 63,89 |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks estandar en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia orientativa para un modelo de 8.030 millones de parametros en FP16 se requieren aproximadamente 16 GB de VRAM solo para pesos, mas overhead de cache KV; en cuantizacion de 8 bits alrededor de 8-9 GB y en 4 bits alrededor de 5-6 GB.
- GPU recomendadas: el autor cita el uso de 8 nodos H100 para el entrenamiento; para inferencia, una A100 40 GB, H100 80 GB o L40S son adecuadas para FP16 con contexto largo. Una RTX 4090 de 24 GB puede alojar el modelo en FP16 con contexto moderado.
- Cabe en GPU de consumo: si, en RTX 3090/4090 (24 GB) en FP16 con contexto limitado, y en GPUs de 12-16 GB mediante cuantizacion a 8 o 4 bits.
- Opciones de despliegue: al ser pesos safetensors derivados de Llama-3.1, es compatible con vLLM (el autor lo uso para el benchmark con guided decoding), TGI, llama.cpp y Ollama tras conversion a GGUF, y transformers con PEFT/LoRA fusionado.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | MalayMMLU (media, 0-shot) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Malaysian-Llama-3.1-8B-Instruct | 8.030 M | 8192 en entrenamiento (128K nativo Llama-3.1) | 61,28 (prob.) / 58,52 (vLLM) | no disponible | Hugging Face, 0 descargas |
| Llama-3.1-8B-Instruct (Meta) | 8.030 M | 128K | 64,26 (prob.) / 59,73 (vLLM) | Llama 3.1 Community License | Hugging Face, ampliamente disponible |
| Modelos Malaya de mesolitica (familia) | variable | variable | no disponible | variable | Hugging Face |

No se dispone de datos de benchmarks de otras alternativas especializadas en malayo en la informacion proporcionada para una comparativa cuantitativa completa.

## Limitaciones y advertencias

- El modelo rinde peor que su base Llama-3.1-8B-Instruct en MalayMMLU en todas las categorias y metricas publicadas, lo que sugiere perdida de conocimiento general tras el ajuste fino.
- La licencia no esta declarada en el repositorio, lo que impide determinar si se permite uso comercial; ademas, al derivar de Llama-3.1, hereda las restricciones de la Llama 3.1 Community License de Meta.
- El repositorio tiene 0 descargas y 0 likes, sin validacion independiente por parte de la comunidad.
- El autor no documenta evaluaciones de sesgo, toxicidad ni alucinacion; el sesgo en temas de religion y politica malasia es un riesgo plausible y no medido.
- La model card no especifica el proceso de RLHF/DPO ni la composicion detallada del dataset, lo que dificulta auditar el comportamiento.
- El contexto usado en entrenamiento es de 8192 tokens; aunque la arquitectura base soporta 128K, no hay garantia de que el ajuste fino preserve el rendimiento en contextos largos.
- El soporte de tool calling y function calling no esta documentado, por lo que no deberia asumirse en produccion.
- El modelo esta orientado a un nicho muy concreto (Malasia); su rendimiento fuera de ese contexto linguistico y cultural no esta evaluado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mdcreativeagent/Malaysian-Llama-3.1-8B-Instruct
- Modelo base: https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct
- Dataset de entrenamiento: https://huggingface.co/datasets/mesolitica/Malaysian-SFT
- Codigo fuente del entrenamiento: https://github.com/mesolitica/malaya/tree/master/session/llama3
- Registro de entrenamiento en Weights & Biases: https://wandb.ai/huseinzol05/lora-embedding-128-llama3.1-8b-malaysian-8k?nw=nwuserhuseinzol05
- Agradecimientos del autor: https://www.sns.com.my
