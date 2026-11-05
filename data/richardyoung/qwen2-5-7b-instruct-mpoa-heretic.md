# richardyoung/Qwen2.5-7B-Instruct-MPOA-heretic

## Resumen

Qwen2.5-7B-Instruct-MPOA-heretic es una variante "descensurada" del modelo Qwen2.5-7B-Instruct de Alibaba Cloud, publicada por el usuario richardyoung. El modelo base es un transformer causal de 7.610 millones de parametros (6.530 millones sin contar embeddings) entrenado por Qwen para instrucciones, con soporte de contexto largo y capacidades multilingues. Sobre esa base se ha aplicado Heretic v2.0.0, una herramienta que modifica los pesos mediante una tecnica denominada Magnitude-Preserving Orthogonal Ablation (MPOA) con el objetivo de reducir la tasa de rechazos (refusals) del modelo.

El resultado es un modelo que, segun la model card, baja de 99/100 rechazos en el modelo original a 19/100 en esta version, con una divergencia KL de 0,0743 respecto al original. Es decir, mantiene gran parte del comportamiento del Qwen2.5-7B-Instruct original pero elimina buena parte de las negativas a responder. La licencia se mantiene como Apache 2.0, heredada del modelo base.

Es relevante para quienes necesitan un modelo de 7B con contexto largo, buen rendimiento en codigo y matematicas, y sin los filtros de seguridad conversacionales del modelo original, por ejemplo para investigacion sobre alineamiento, generacion de contenido creativo sin restricciones o entornos donde los rechazos son un problema operativo. No obstante, la eliminacion de rechazos tiene implicaciones eticas y legales que se detallan en las limitaciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal con RoPE, SwiGLU, RMSNorm y sesgo QKV en atencion (GQA: 28 cabezas Q, 4 KV) |
| Parametros totales | 7.615.616.512 (7,61B); 6,53B sin embeddings |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 131.072 tokens completos; generacion hasta 8.192 tokens. El config.json por defecto esta ajustado a 32.768 tokens; para contexto completo se requiere YaRN con factor 4.0 |
| Tipos de cuantizacion | No especificados en la informacion disponible; al ser safetensors en transformers, admite cuantizacion estandar (GPTQ, AWQ, bitsandbytes, GGUF via conversion) |
| Idiomas soportados | La model card declara `en`; el modelo base Qwen2.5 soporta mas de 29 idiomas (chino, ingles, frances, espanol, portugues, aleman, italiano, ruso, japones, coreano, vietnamita, tailandes, arabe, etc.) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo de 15,2 GB) |

## Arquitectura y entrenamiento

La arquitectura es la del Qwen2.5-7B-Instruct original: un transformer causal de 28 capas con RoPE, activacion SwiGLU, normalizacion RMSNorm y atencion con query-key-value bias. Usa Grouped Query Attention con 28 cabezas de query y 4 de key/value, lo que reduce el coste de memoria en KV cache. El modelo base fue entrenado por Qwen en dos fases (pretraining y post-training) sobre un corpus no detallado en la informacion disponible, con mejoras especificas en conocimiento, codigo, matematicas, seguimiento de instrucciones, generacion de textos largos y salidas estructuradas como JSON.

La innovacion de esta variante concreta es la aplicacion de Heretic v2.0.0 con MPOA (Magnitude-Preserving Orthogonal Ablation). Esta tecnica realiza una ablacion ortogonal por capa sobre las proyecciones `attn.o_proj` y `mlp.down_proj`, con parametros de peso maximo y minimo y posiciones/distancia definidos por capa (por ejemplo, `attn.o_proj.max_weight` 1,35 en posicion 19,06; `mlp.down_proj.max_weight` 1,45 en posicion 24,59). El objetivo es preservar la magnitud de las activaciones mientras se elimina la direccion asociada a los rechazos. El proceso es reproducible segun el autor, con instrucciones en el directorio `reproduce` del repositorio. No se detalla en la informacion disponible si hubo RLHF o DPO adicionales sobre esta variante; se trata de una modificacion de pesos post-entrenamiento, no de un reentrenamiento.

## Capacidades

- Generacion de texto conversacional multi-turno con plantilla de chat de Qwen.
- Razonamiento y respuesta a instrucciones complejas, con mejoras del base en seguimiento de instrucciones y generacion de textos largos (mas de 8K tokens).
- Generacion de codigo y matematicas, con mejoras especificas del base Qwen2.5 en estos dominios.
- Comprension y generacion de datos estructurados, especialmente JSON y tablas.
- Soporte de contexto largo: hasta 131.072 tokens con YaRN (factor 4.0), 32.768 tokens por defecto en config.
- Capacidades multilingues heredadas del base (mas de 29 idiomas), aunque la model card solo declara ingles.
- Reduccion drastica de rechazos: 19/100 frente a 99/100 del original, segun la model card.
- No se documenta soporte explicito de tool calling, function calling, agentes o vision en la informacion disponible para esta variante; el base Qwen2.5-7B-Instruct no es multimodal.

## Casos de uso

- Investigacion sobre alineamiento y seguridad: comparar el comportamiento del modelo original frente a la variante descensurada permite estudiar que direcciones de activacion codifican los rechazos y como afecta la ablacion a otras capacidades, usando la reproducibilidad del proceso MPOA.
- Generacion creativa sin restricciones: escritura de ficcion, guiones o narrativa que aborde temas sensibles sin las negativas del modelo original, aprovechando el contexto de hasta 32K tokens por defecto para mantener coherencia en textos largos.
- Procesamiento de documentos extensos: analisis y resumen de contratos, informes o articulos de decenas de miles de tokens activando YaRN con factor 4.0 para alcanzar 131K tokens de contexto.
- Generacion de codigo en pipelines internos: el base Qwen2.5-7B-Instruct destaca en codigo y matematicas; esta variante conserva esas capacidades y puede integrarse en herramientas de autocompletado o revision donde los rechazos del modelo original interrumpen el flujo.
- Extraccion de datos estructurados: conversion de texto no estructurado a JSON o tablas, aprovechando la mejora del base en salidas estructuradas y su tolerancia a system prompts diversos.
- Chatbot de dominio especializado: despliegue en entornos donde el modelo debe responder a consultas tecnicas o sensibles sin evasivas, con la advertencia de que la ausencia de filtros exige moderacion externa.
- Evaluacion de robustez: servir como contrapunto en benchmarks de seguridad para medir cuanto degrada la ablacion las capacidades generales (KL de 0,0743) y calibrar tecnicas de mitigacion.

## Benchmarks y rendimiento

La model card solo reporta dos metricas comparativas frente al modelo original:

| Metrica | Este modelo | Qwen2.5-7B-Instruct original |
|---|---|---|
| Rechazos | 19/100 | 99/100 |
| Divergencia KL | 0,0743 | 0 (por definicion) |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible para esta variante. Los resultados del modelo base se remiten al blog de Qwen2.5, pero no se incluyen cifras en la informacion proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 15,2 GB solo para pesos, mas KV cache y overhead; se recomienda al menos 24 GB para contexto moderado.
- En cuantizacion de 8 bits: alrededor de 8 GB de pesos; en 4 bits, alrededor de 4-5 GB, aunque estos valores no estan confirmados en la informacion disponible.
- GPU recomendadas: A100 (40/80 GB) o H100 para contexto completo de 131K tokens y despliegue en produccion; RTX 4090 (24 GB) para FP16 con contexto moderado; RTX 3090/4080 para cuantizacion 8 bits.
- Cabe en GPU de consumo: si, en RTX 4090 en FP16 con contexto limitado, y en GPUs de 12-16 GB con cuantizacion.
- Opciones de despliegue: transformers (recomendado version reciente, `transformers>=4.37.0` para evitar `KeyError: 'qwen2'`), vLLM (recomendado por Qwen para produccion, con soporte de YaRN estatico), TGI (tag `text-generation-inference`), llama.cpp/Ollama mediante conversion a GGUF.
- Latencia y throughput: no disponibles en la informacion proporcionada. El uso de GQA (4 cabezas KV) reduce el KV cache y favorece el throughput en vLLM.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rechazos | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen2.5-7B-Instruct-MPOA-heretic (este) | 7,61B | 131K (YaRN) / 32K por defecto | 19/100 | Apache 2.0 | HuggingFace, transformers |
| Qwen/Qwen2.5-7B-Instruct | 7,61B | 131K (YaRN) / 32K por defecto | 99/100 | Apache 2.0 | HuggingFace, oficial |
| Otras variantes abliterated de Qwen2.5-7B | 7,61B | 131K (heredado) | No disponible | Apache 2.0 (heredada) | HuggingFace, comunidad |
| Meta Llama 3.1 8B Instruct | 8,03B | 128K | No disponible | Llama 3.1 Community License | HuggingFace, oficial |

La comparativa se limita a parametros, contexto y licencia porque no hay benchmarks estandar publicados para esta variante. Frente al original, la diferencia medible es la tasa de rechazos y la divergencia KL; frente a Llama 3.1 8B, la licencia Apache 2.0 es mas permisiva para uso comercial.

## Limitaciones y advertencias

- La eliminacion de rechazos implica que el modelo puede generar contenido danino, ilegal o eticamente problematico; no debe desplegarse en produccion sin moderacion externa y revision de cumplimiento.
- La divergencia KL de 0,0743 indica que el comportamiento no es identico al original; puede haber degradacion en tareas que dependian de los mecanismos de rechazo o de ciertas respuestas seguras.
- La model card solo declara ingles como idioma, aunque el base soporta mas de 29; el rendimiento multilingue de esta variante no esta verificado.
- Riesgo de alucinacion inherente a los modelos de 7B, no mitigado por la ablacion; no hay datos de evaluacion de factualidad en la informacion disponible.
- El contexto completo de 131K requiere configurar YaRN manualmente; vLLM solo soporta YaRN estatico, lo que puede degradar el rendimiento en textos cortos si se activa siempre.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantias y la responsabilidad del uso recae en el desplegador; conviene revisar la licencia del modelo base y las condiciones de Heretic.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin validacion comunitaria; conviene auditar los pesos antes de usarlos en produccion.
- No se documenta soporte de tool calling ni de agentes en esta variante; si se necesita, verificar empiricamente contra el base.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/richardyoung/Qwen2.5-7B-Instruct-MPOA-heretic
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
- Licencia del base: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct/blob/main/LICENSE
- Heretic: https://heretic-project.org
- Blog de Qwen2.5: https://qwenlm.github.io/blog/qwen2.5/
- GitHub de Qwen2.5: https://github.com/QwenLM/Qwen2.5
- Documentacion de Qwen: https://qwen.readthedocs.io/en/latest/
- Documentacion de despliegue con vLLM: https://qwen.readthedocs.io/en/latest/deployment/vllm.html
- Paper de YaRN: https://arxiv.org/abs/2309.00071
- Paper de Qwen2 (referencia arxiv:2407.10671): https://arxiv.org/abs/2407.10671
- Chat de Qwen: https://chat.qwenlm.ai/
