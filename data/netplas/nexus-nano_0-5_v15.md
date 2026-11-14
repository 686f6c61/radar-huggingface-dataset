# netplas/nexus-nano_0.5_v15

## Resumen

nexus-nano_0.5_v15 es un ajuste fino (fine-tune) publicado por el usuario netplas sobre el modelo base Qwen/Qwen2.5-72B de Alibaba Cloud. Se distribuye como un repositorio de transformers con pesos en safetensors y un tamano total de 74,8 GB, coherente con un modelo denso de aproximadamente 72.700 millones de parametros. La model card del repositorio reproduce integramente la documentacion oficial de Qwen2.5-72B-Instruct, sin que el autor aporte informacion adicional sobre el proceso de ajuste, los datos utilizados ni los objetivos del mismo.

El modelo hereda la arquitectura transformer de Qwen2.5, con RoPE, SwiGLU, RMSNorm, atencion con GQA (64 cabezas de consulta y 8 de clave/valor) y 80 capas. El contexto nativo es de 32.768 tokens segun la configuracion incluida, ampliable hasta 131.072 tokens mediante escalado YaRN, con generacion de hasta 8.192 tokens. Es relevante para desarrolladores que necesiten un modelo de gran tamano con buen rendimiento en codigo, matematicas y comprension de datos estructurados, aunque la ausencia de documentacion propia del ajuste limita la evaluacion de que aporta este fine-tune concreto frente al original.

La licencia declarada es "other" con nombre "qwen", remitiendo a la licencia de Qwen2.5-72B-Instruct. El unico idioma declarado en los metadatos es el ingles, pese a que el modelo base soporta mas de 29 idiomas. El repositorio no registra descargas ni likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal con RoPE, SwiGLU, RMSNorm y bias en QKV; GQA con 64 cabezas Q y 8 KV; 80 capas |
| Parametros totales | 72,7B (70,0B sin embeddings) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 32.768 tokens por configuracion; hasta 131.072 tokens con YaRN (factor 4.0); generacion de 8.192 tokens |
| Tipos de cuantizacion | No disponible en la informacion proporcionada (el repo solo incluye safetensors sin cuantizar) |
| Idiomas soportados | Ingles declarado en metadatos; el modelo base soporta mas de 29 idiomas |
| Licencia | "other" / qwen (enlace a la licencia de Qwen2.5-72B-Instruct) |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

La arquitectura corresponde a la de Qwen2.5-72B: un transformer decoder-only denso con 80 capas, normalizacion RMSNorm, activacion SwiGLU, embeddings rotatorios (RoPE) y atencion con query-key-value bias. Emplea Grouped Query Attention con 64 cabezas de consulta y 8 de clave/valor, lo que reduce el coste de memoria de la cache KV durante la inferencia. El contexto se gestiona con RoPE y se extiende mediante YaRN cuando se requiere procesar entradas largas.

El modelo base fue entrenado por el equipo Qwen en dos fases, preentrenamiento y postentrenamiento, segun la documentacion oficial. Sin embargo, la informacion disponible no detalla el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de RLHF o DPO en el ajuste especifico de nexus-nano_0.5_v15. Tampoco se documenta que datos o metodologia empleo netplas para el fine-tune, por lo que no es posible verificar que modificaciones introduce respecto al modelo original.

## Capacidades

- Generacion de texto y conversacion multi-turno con plantilla de chat (`apply_chat_template`).
- Razonamiento, matematicas y generacion de codigo, con mejoras declaradas por Qwen en estas areas respecto a Qwen2.
- Comprension y generacion de datos estructurados, especialmente JSON y tablas.
- Seguimiento de instrucciones y generacion de textos largos (mas de 8.000 tokens).
- Mayor robustez frente a diversidad de system prompts, util para role-play y chatbots.
- Soporte de contexto largo hasta 131.072 tokens mediante YaRN.
- Capacidades multilingues heredadas del modelo base (mas de 29 idiomas), aunque el metadato del repo solo declara ingles.
- Compatibilidad con text-generation-inference y endpoints compatibles segun los tags del repositorio.
- No se documenta soporte explicito de tool calling, agentes, vision ni audio en la informacion proporcionada.

## Casos de uso

- Atencion al cliente automatizada: el modelo puede gestionar conversaciones multi-turno con contexto largo gracias a su ventana de hasta 131.072 tokens con YaRN, manteniendo el hilo de la conversacion y el historial del cliente.
- Generacion de codigo en produccion: adecuado para autocompletado, refactorizacion y explicacion de codigo, con la salvedad de que no se documenta soporte de tool calling en este fine-tune concreto.
- Analisis de documentos extensos: informes, contratos o articulos de decenas de miles de tokens pueden procesarse en una sola pasada activando el escalado YaRN en la configuracion.
- Extraccion de datos estructurados: conversion de texto libre a JSON o tablas, aprovechando la mejora declarada en generacion de salidas estructuradas.
- Asistentes conversacionales con personalidad: la robustez frente a system prompts facilita implementar role-play y condiciones de sistema complejas.
- Razonamiento matematico asistido: resolucion de problemas paso a paso y explicacion de procedimientos, apoyandose en las mejoras del modelo base en matematicas.
- Traduccion y procesamiento multilingue: aunque el metadato declare solo ingles, el modelo base soporta mas de 29 idiomas, por lo que puede emplearse en tareas de traduccion con validacion previa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card remite al blog oficial de Qwen2.5 para los resultados del modelo base, pero no se aportan metricas propias del fine-tune nexus-nano_0.5_v15.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16/FP16: aproximadamente 145 GB solo para pesos, mas cache KV; requiere multiples GPU.
- VRAM estimada en cuantizacion de 8 bits: alrededor de 75-80 GB, viable en una unica GPU de 80 GB (A100 80GB, H100 80GB).
- VRAM estimada en cuantizacion de 4 bits: alrededor de 40-45 GB, viable en dos RTX 4090 (24 GB cada una) o una A100 40GB con margen ajustado.
- No cabe en una unica GPU de consumo (RTX 4090, 3090, 4080) en precision completa ni en 8 bits.
- Opciones de despliegue: transformers (recomendado version reciente), vLLM (recomendado por Qwen para contexto largo con YaRN estatico), text-generation-inference segun los tags del repo; llama.cpp y Ollama no estan documentados para este repositorio.
- Latencia y throughput: no disponibles en la informacion proporcionada; la documentacion de Qwen remite a su pagina de benchmarks de velocidad.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| nexus-nano_0.5_v15 | 72,7B | 32.768 (131.072 con YaRN) | qwen (other) | Hugging Face, safetensors |
| Qwen2.5-72B-Instruct | 72,7B | 32.768 (131.072 con YaRN) | qwen | Hugging Face, safetensors, GGUF oficiales |
| Llama 3.1 70B Instruct | 70B | 128.000 | Llama 3.1 Community License | Hugging Face, amplio ecosistema |
| Mistral Large 2 | 123B | 128.000 | Mistral Research License / comercial | API y pesos bajo licencia |

El fine-tune de netplas no aporta datos de rendimiento que permitan situarlo frente a estas alternativas; la comparacion se limita a parametros, contexto y licencia.

## Limitaciones y advertencias

- Ausencia total de documentacion propia del fine-tune: no se especifican datos de entrenamiento, metodologia ni diferencias respecto al modelo base.
- Riesgo de alucinacion inherente a los modelos de lenguaje de gran tamano, agravado por la falta de evaluacion publicada del ajuste.
- El metadato del repositorio declara unicamente ingles, aunque el modelo base es multilingue; el rendimiento en castellano no esta verificado para este fine-tune.
- La licencia "qwen" remite a la licencia de Qwen2.5-72B-Instruct; es necesario revisar sus terminos antes de cualquier uso comercial.
- El repositorio no registra descargas ni likes, lo que impide validar su uso en produccion por parte de la comunidad.
- El contexto por defecto es de 32.768 tokens; superarlo requiere modificar `config.json` con escalado YaRN, lo que puede degradar el rendimiento en textos cortos segun advierte la documentacion de Qwen.
- No se documenta soporte de tool calling, agentes, vision ni audio en este repositorio concreto.
- El tamano de 74,8 GB y los requisitos de VRAM elevados limitan su despliegue a infraestructura con multiples GPU o GPUs de 80 GB.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/netplas/nexus-nano_0.5_v15
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-72B
- Modelo de referencia Qwen2.5-72B-Instruct: https://huggingface.co/Qwen/Qwen2.5-72B-Instruct
- Licencia: https://huggingface.co/Qwen/Qwen2.5-72B-Instruct/blob/main/LICENSE
- Blog de Qwen2.5: https://qwenlm.github.io/blog/qwen2.5/
- Repositorio GitHub de Qwen2.5: https://github.com/QwenLM/Qwen2.5
- Documentacion de Qwen: https://qwen.readthedocs.io/en/latest/
- Documentacion de despliegue con vLLM: https://qwen.readthedocs.io/en/latest/deployment/vllm.html
- Benchmarks de velocidad: https://qwen.readthedocs.io/en/latest/benchmark/speed_benchmark.html
- Paper de YaRN: https://arxiv.org/abs/2309.00071
- Chat de Qwen: https://chat.qwenlm.ai/
