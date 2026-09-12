# aigensciences/BioGravity-bilingual-Inst

## Resumen

BioGravity-bilingual-Inst es un modelo de lenguaje especializado en dominio biomédico, publicado por AIGEN Sciences, Inc. y construido mediante ajuste por instrucciones sobre el checkpoint trillionlabs/Gravity-30B-A5B-0715. Se distribuye a traves de HuggingFace con la libreria transformers y el pipeline text-generation, y esta orientado a explicaciones biomédicas, instrucciones generales e investigacion asistida por herramientas a traves de la interfaz A1 (Biomni).

Tecnicamente es un transformer decoder-only con atencion MLA y mezcla de expertos dispersa (sparse MoE), implementado en la clase nativa `DeepseekV3ForCausalLM`. Cuenta con 29.558.812.672 parametros totales (unos 29,56 B) y aproximadamente 5,34 B de parametros activos contando las tablas de embeddings, distribuidos en 52 capas transformer con 64 expertos enrutados por capa MoE y 8 seleccionados por token. El limite de contexto configurado es de 131.072 tokens, aunque la evaluacion practica se realizo con una ventana de servicio de 49.152 tokens.

Su relevancia actual reside en dos factores: por un lado, es un modelo bilingue coreano-ingles enfocado a un dominio cientifico concreto, un nicho poco cubierto por los modelos generalistas; por otro, incorpora de forma nativa un formato de razonamiento explicito (`<think>...</think>`) y un protocolo de uso de herramientas con tokens especiales dedicados (`<execute>`, `<solution>`, `<observation>`) disenado para ejecutar codigo dentro de un runtime de agentes. El repositorio, de 118,3 GB, almacena los pesos en FP32 y no declara licencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con atencion MLA y MoE disperso (`DeepseekV3ForCausalLM`) |
| Parametros totales | 29.558.812.672 (29,56 B) |
| Parametros activos | Aproximadamente 5,34 B, contando tablas de embeddings |
| Longitud de contexto | 131.072 tokens configurados; 49.152 tokens evaluados en serving |
| Tipos de cuantizacion | no disponible (pesos publicados en FP32; inferencia evaluada en BF16) |
| Idiomas soportados | Coreano (ko) e ingles (en) |
| Licencia | no disponible |
| Formato de pesos | safetensors (24 shards, aproximadamente 118,3 GB, FP32) |
| Capas transformer | 52 |
| Expertos enrutados | 64 por capa MoE, 8 seleccionados por token |
| Tamano de vocabulario / tokenizer | 151.552 / 151.371 |
| Precision almacenada | FP32 |
| Precision de inferencia evaluada | BF16 |
| Version de transformers verificada | 4.57.6 |
| Modelo base | trillionlabs/Gravity-30B-A5B-0715 |
| Interfaz de herramientas | A1: `<execute>`, `<solution>`, `<observation>` |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura transformer decoder-only con atencion MLA (Multi-head Latent Attention) y una capa MoE dispersa en la que cada token activa 8 de los 64 expertos enrutados disponibles por capa. Esta combinacion reduce el coste computacional por token en inferencia respecto a un modelo denso del mismo tamano: se activan aproximadamente 5,34 B de parametros sobre un total de 29,56 B. La implementacion corresponde a la clase nativa `DeepseekV3ForCausalLM` de transformers, y el autor indica que la configuracion, el reparto de expertos, el tokenizer y los ajustes de RoPE forman un conjunto verificado que debe mantenerse unido.

El modelo deriva del checkpoint trillionlabs/Gravity-30B-A5B-0715 mediante ajuste por instrucciones, y los tags del repositorio lo etiquetan como instruction-tuning bilingue con especializacion biomédica. No se proporciona informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de RLHF o DPO; tampoco se documentan innovaciones adicionales mas alla de la decodificacion con modo de razonamiento explicito y el protocolo de acciones A1. La model card solo especifica el formato de respuesta: por defecto, `add_generation_prompt=True` deja el prompt dentro de un segmento `<think>` abierto, y el modelo genera el resto del texto, incluido el cierre `</think>` y la respuesta o accion posterior. La plantilla acepta `enable_thinking=False` para precargar un segmento vacio.

## Capacidades

- Generacion de texto conversacional con plantilla de chat propia (tokenizer y chat template incluidos en el repositorio).
- Explicaciones y razonamiento en dominio biomédico, con foco en contenido cientifico y de investigacion.
- Instrucciones generales fuera del dominio biomédico, heredadas del modelo base.
- Modo de razonamiento explicito mediante el formato nativo `<think>...</think>`.
- Uso de herramientas a traves de la interfaz A1 de Biomni: acciones de codigo con `<execute>Python</execute>`, observaciones con `<observation>...</observation>` y respuesta final con `<solution>...</solution>`.
- Ejecucion de codigo asistida: el harness ejecuta las acciones, anade las observaciones y solicita al modelo la siguiente decision.
- Soporte de esquemas `tools=` y de mensajes XML `<tool_call>`, heredados de la plantilla del modelo base (la integracion A1 utiliza el protocolo execute/solution).
- Bilinguismo coreano-ingles declarado de forma explicita.
- Capacidades multilingues adicionales: no disponible.
- Vision, audio u otras modalidades: no disponible.

## Casos de uso

- Asistencia a investigacion biomédica: el modelo puede responder consultas sobre literatura cientifica, mecanismos fisiopatologicos o interpretacion de resultados en coreano e ingles, apoyandose en su ajuste especifico de dominio.
- Analisis de datos en pipelines de laboratorio: mediante la interfaz A1, el modelo puede emitir bloques `<execute>` con codigo Python para procesar ficheros de datos experimentales, recibir el resultado como `<observation>` e iterar hasta emitir una conclusion en `<solution>`.
- Documentacion cientifica bilingue: traduccion y adaptacion de resumenes, protocolos o fichas tecnicas entre coreano e ingles manteniendo terminologia especializada, aprovechando su ventana de contexto de hasta 49.152 tokens evaluados para documentos largos.
- Atencion al cliente en el sector biofarmaceutico: gestion de conversaciones multi-turno con contexto extenso para resolver dudas sobre productos, fichas de seguridad o procedimientos, con la ventana configurada de 131.072 tokens como limite arquitectonico.
- Extraccion y estructuración de informacion de articulos: procesamiento de textos cientificos largos (hasta decenas de miles de tokens) para resumir, clasificar por tematica o extraer entidades biomédicas.
- Agentes de investigacion automatizados: integracion en un runtime tipo Biomni A1 donde el modelo actua como politica de decision, delegando la ejecucion de herramientas y el acceso al data lake en el entorno externo.
- Asistente de formacion interna: generacion de material explicativo y preguntas de autoevaluacion sobre conceptos biomédicos para equipos cientificos, con salida en coreano o ingles.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tablas de MMLU, HumanEval, GSM8K ni de evaluaciones biomédicas especificas, y no se dispone de comparaciones numericas con modelos similares.

## Requisitos de hardware

- Pesos en BF16: aproximadamente 59 GB solo para los pesos, mas cache KV y memoria de runtime.
- Pesos en FP32 (formato de publicacion): aproximadamente 118,3 GB en disco, repartidos en 24 shards de safetensors.
- GPU recomendadas: la evaluacion oficial se realizo con una GPU B200 por replica de modelo y tensor-parallel-size 1.
- Cabe en GPU de consumo: no con los pesos completos en BF16 (59 GB superan la VRAM de una RTX 4090 de 24 GB). No se documentan versiones cuantizadas que permitan su ejecucion en GPU de consumo.
- Opciones de despliegue verificadas: vLLM 0.19.0 con transformers 4.57.6, y carga directa con `AutoModelForCausalLM` en transformers 4.57.6.
- Configuracion de vLLM documentada: `--dtype bfloat16`, `--max-model-len 49152`, `--gpu-memory-utilization 0.85`, `--max-num-seqs 32`, `--max-num-batched-tokens 4096`, backend de atencion `TRITON_ATTN`, `VLLM_MLA_DISABLE=1` y `VLLM_WORKER_MULTIPROC_METHOD=spawn`.
- Formatos GGUF, Ollama, llama.cpp y TGI: no disponible. El repositorio solo distribuye safetensors.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros totales | Parametros activos | Contexto | Idiomas | Licencia | Especializacion |
|---|---|---|---|---|---|---|
| BioGravity-bilingual-Inst | 29,56 B | Aproximadamente 5,34 B | 131.072 configurados / 49.152 evaluados | ko, en | no disponible | Biomedica, herramienta A1 |
| trillionlabs/Gravity-30B-A5B-0715 (modelo base) | 29,56 B (misma familia arquitectonica) | Aproximadamente 5,34 B | no disponible | no disponible | no disponible | Generalista |
| Otros modelos comparables de la misma categoria | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos verificados de alternativas en la informacion proporcionada. La etiqueta `deepseek_v3` del repositorio hace referencia a la arquitectura implementada en transformers (`DeepseekV3ForCausalLM`), no a una comparacion de rendimiento con el modelo DeepSeek-V3.

## Limitaciones y advertencias

- La licencia no esta declarada en la informacion disponible, por lo que no puede confirmarse que el uso comercial este permitido. Es un bloqueante para produccion hasta aclararlo.
- No se han publicado benchmarks, de modo que el rendimiento real en tareas biomédicas o generales no esta cuantificado.
- El autor advierte de que el limite de contexto de 131.072 tokens es una configuracion arquitectonica; el modelo se evaluo con 49.152 tokens y el rendimiento en el limite completo no se ha medido.
- Riesgo de alucinacion inherente a los modelos de lenguaje, especialmente critico en un dominio biomédico donde una respuesta incorrecta puede tener consecuencias sanitarias. No debe usarse como sustituto de criterio clinico o profesional.
- Idiomas soportados limitados a coreano e ingles; el rendimiento en castellano u otras lenguas no esta documentado.
- El almacenamiento en FP32 (118,3 GB) encarece el despliegue y obliga a conversion a BF16 o a cuantizacion no documentada.
- El uso de herramientas A1 requiere un harness externo que ejecute el codigo y aporte las observaciones; el repositorio solo proporciona la politica del modelo, no el entorno de ejecucion ni el data lake.
- Es obligatorio decodificar con `skip_special_tokens=False`: los seis tokens del protocolo A1 estan registrados como especiales y su eliminacion rompe los limites de accion.
- El repositorio registra 0 descargas y 0 likes, por lo que no existe validacion externa de la comunidad sobre su comportamiento en produccion.
- Sesgos conocidos: no disponible.
- La fecha de creacion registrada (2026-09-12) y la actualizacion (2026-09-12) no permiten inferir historial de mantenimiento.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/aigensciences/BioGravity-bilingual-Inst
- Modelo base: https://huggingface.co/trillionlabs/Gravity-30B-A5B-0715
- Paper, blog o repositorio de codigo del modelo: no disponible
- Demo o espacio interactivo: no disponible
- La busqueda web realizada no devolvio resultados relevantes sobre este modelo; los enlaces recuperados no guardan relacion con el contenido de la ficha.
