# amd/GLM-5.2-Quark-MXFP4-AttnFP8

## Resumen

El modelo `amd/GLM-5.2-Quark-MXFP4-AttnFP8` es una versión cuantizada del modelo de lenguaje de gran escala GLM-5.2, desarrollado originalmente por Zhipu AI (zai-org) y posteriormente optimizado por Advanced Micro Devices (AMD) mediante su herramienta de cuantización AMD-Quark. Esta variante aplica un esquema mixto de cuantización: los pesos se representan en formato OCP MXFP4 (4 bits) de forma estática, mientras que las capas de atención se cuantizan en FP8E4M3 por canal, y las activaciones se cuantizan dinámicamente en MXFP4 y FP8 por token. El objetivo es reducir el footprint de memoria y acelerar la inferencia en GPUs AMD Instinct MI350/MI355, manteniendo una precisión muy cercana a la del modelo original.

Con 384.336.046.080 parámetros (aproximadamente 384 mil millones), se trata de un modelo de arquitectura MoE (mezcla de expertos), como indica la etiqueta `glm_moe_dsa`. La cuantización reduce el tamaño del repositorio a 549,5 GB, lo que permite su despliegue en hardware de gama alta con múltiples GPUs. La evaluación interna muestra una recuperación de precisión del 99,3% en GSM8K y del 98,3% en GPQA-Diamond-CoT en comparación con el modelo sin cuantizar, lo que lo convierte en una opción atractiva para entornos de producción que requieren eficiencia sin sacrificar rendimiento.

La relevancia de este modelo radica en que demuestra la viabilidad de ejecutar modelos de cientos de miles de millones de parámetros en hardware AMD, un ecosistema tradicionalmente menos soportado que NVIDIA. Al estar licenciado bajo MIT y ser distribuido en formato safetensors, ofrece una vía accesible para desarrolladores e investigadores que buscan desplegar un LLM de gran escala con costes de infraestructura reducidos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GLM-5.2 (MoE, mezcla de expertos) |
| Parametros totales | 384.336.046.080 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (en evaluacion se uso 40.960 tokens) |
| Tipos de cuantizacion | MXFP4 (pesos, estatico), FP8E4M3 (atencion, estatico), MXFP4/FP8 (activaciones, dinamico) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Este modelo no es un entrenamiento desde cero, sino una cuantizacion del modelo base `zai-org/GLM-5.2` realizada con AMD-Quark (version 0.12). El proceso de cuantizacion aplica un esquema mixto: los pesos de todas las capas se cuantizan a OCP MXFP4 de forma estatica, excepto las capas de atencion (`self_attn`) que se cuantizan a FP8E4M3 por canal. Las activaciones se cuantizan dinamicamente en MXFP4 (por token) y FP8E4M3 (por token) en las capas de atencion. Se excluyen de la cuantizacion las capas `lm_head`, `embed_tokens`, `eh_proj`, `mlp.gate` y `self_attn.indexer.weights_proj` para preservar la precision en componentes criticos.

No se dispone de informacion sobre el entrenamiento original del modelo base (numero de tokens, composicion del dataset, tecnicas de alineacion como RLHF o DPO). La model card solo documenta el proceso de cuantizacion y la evaluacion posterior. La arquitectura interna de GLM-5.2 (numero de expertos, dimensiones, etc.) tampoco se detalla en la documentacion proporcionada.

## Capacidades

Las capacidades especificas de este modelo no estan documentadas en la ficha tecnica. Al ser una cuantizacion del modelo base GLM-5.2, se espera que herede las capacidades de dicho modelo, que tipicamente incluyen:

- Generacion de texto y completado de secuencias
- Razonamiento logico y matematico
- Comprension lectora y respuesta a preguntas
- Generacion de codigo (si el modelo base lo soporta)
- Capacidades multilingues (no confirmadas)

Sin embargo, no se ha publicado una lista detallada de capacidades en la informacion disponible. Se recomienda consultar la documentacion del modelo base `zai-org/GLM-5.2` para conocer las funcionalidades exactas.

## Casos de uso

- **Investigacion cientifica y analisis de documentos largos**: gracias a su ventana de contexto de al menos 40.960 tokens (segun la configuracion de evaluacion), puede procesar articulos academicos, informes tecnicos o expedientes completos en una sola pasada, extrayendo informacion relevante y resumiendo contenido extenso.
- **Generacion de informes y redaccion automatizada**: adecuado para producir borradores de informes, actas o documentacion tecnica a partir de notas o datos estructurados, aprovechando su capacidad de razonamiento y coherencia textual.
- **Asistencia en programacion y depuracion de codigo**: si el modelo base GLM-5.2 incluye capacidades de generacion de codigo, esta version cuantizada puede integrarse en entornos de desarrollo para sugerir implementaciones, revisar fragmentos o explicar errores, con un coste de inferencia reducido.
- **Sistemas de respuesta a preguntas en dominios especializados**: puede utilizarse como motor de conocimiento en aplicaciones de consulta tecnica o legal, donde se requiere procesar grandes volumenes de texto y ofrecer respuestas precisas con contexto.
- **Analisis de sentimiento y clasificacion de texto a escala**: su capacidad para manejar contextos largos permite analizar conversaciones completas, hilos de redes sociales o encuestas abiertas, extrayendo tendencias y opiniones.
- **Prototipado de agentes conversacionales**: aunque no se confirma soporte de tool calling, el modelo puede servir como base para chatbots o asistentes virtuales en entornos controlados, donde la latencia no sea critica y se priorice la calidad de las respuestas.

## Benchmarks y rendimiento

La model card incluye resultados de evaluacion en dos benchmarks, comparando el modelo cuantizado con el original sin cuantizar. Los datos se obtuvieron con `lm-evaluation-harness` sobre vLLM, con `tensor_parallel_size=4` y `max_model_len=40960`.

| Benchmark | zai-org/GLM-5.2 | amd/GLM-5.2-Quark-MXFP4-AttnFP8 | Recuperacion |
|---|---|---|---|
| GSM8K (flexible-extract) | 96,46 | 95,80 | 99,3% |
| GPQA-Diamond-CoT (flexible-extract) | 69,53 | 68,35 | 98,3% |

No se han publicado resultados en otros benchmarks (MMLU, HumanEval, etc.) en la informacion disponible.

## Requisitos de hardware

- **GPUs soportadas**: AMD Instinct MI350/MI355 (microarquitectura CDNA). No se garantiza funcionamiento en GPUs de otras marcas.
- **VRAM estimada**: no se especifica directamente, pero con 384B parametros en MXFP4 (4 bits), el peso aproximado es de ~192 GB, mas overhead de activaciones y KV cache. Se requiere al menos 4 GPUs con 64 GB cada una (la evaluacion uso `tensor_parallel_size=4`).
- **Software**: ROCm 7.0.0, PyTorch 2.9.0, Transformers 5.13.1, vLLM (compilado desde fuente con soporte ROCm).
- **Opciones de despliegue**: vLLM es el motor de inferencia recomendado. No se mencionan alternativas como llama.cpp u Ollama.
- **Latencia y throughput**: no se proporcionan datos. La evaluacion se realizo con `gpu_memory_utilization=0.9` y `max_model_len=40960`, lo que sugiere que el modelo puede operar con contextos largos, pero el rendimiento dependera del numero de GPUs y de la configuracion de paralelismo.

## Comparativa con modelos similares

| Modelo | Parametros | Cuantizacion | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| zai-org/GLM-5.2 (base) | 384B (MoE) | Sin cuantizar (BF16) | no disponible | no disponible | HuggingFace |
| amd/GLM-5.2-Quark-MXFP4-AttnFP8 (este) | 384B (MoE) | MXFP4 + FP8 | no disponible (40K en eval) | MIT | HuggingFace |
| amd/GLM-5.2-MXFP4 | 384B (MoE) | MXFP4 | no disponible | MIT | HuggingFace |

La diferencia principal entre las dos versiones de AMD es que la variante `AttnFP8` aplica cuantizacion FP8 adicional en las capas de atencion, lo que puede mejorar el rendimiento en hardware AMD sin sacrificar precision significativa. No se dispone de comparaciones con otros modelos de tamano similar (por ejemplo, Llama 3.1 405B o Mixtral 8x22B) en la informacion proporcionada.

## Limitaciones y advertencias

- **Sesgos y alucinaciones**: no se han documentado sesgos especificos, pero como todo LLM, el modelo puede generar contenido incorrecto o sesgado. Se recomienda realizar evaluaciones adicionales antes de usarlo en aplicaciones sensibles.
- **Dependencia del modelo base**: las capacidades y limitaciones funcionales dependen del modelo original GLM-5.2. Si el modelo base tiene restricciones de uso o sesgos conocidos, estos se heredan en esta version cuantizada.
- **Hardware restringido**: el modelo esta optimizado exclusivamente para GPUs AMD Instinct MI350/MI355 con ROCm 7.0.0. No se garantiza su funcionamiento en GPUs NVIDIA o en versiones anteriores de ROCm.
- **Contexto limitado**: aunque la evaluacion uso 40.960 tokens, no se ha confirmado la longitud maxima de contexto soportada. Para contextos mayores, puede ser necesario ajustar la configuracion de vLLM.
- **Licencia**: la licencia MIT se aplica a las modificaciones de AMD, pero el modelo base `zai-org/GLM-5.2` puede tener su propia licencia (no especificada en la documentacion). Se recomienda verificar los terminos del modelo base antes de un uso comercial.
- **Tamaño y despliegue**: con 549,5 GB de peso, el despliegue requiere infraestructura de multiples GPUs y un sistema de almacenamiento de alta velocidad. No es adecuado para entornos de un solo GPU o edge computing.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/amd/GLM-5.2-Quark-MXFP4-AttnFP8)
- [Modelo base zai-org/GLM-5.2](https://huggingface.co/zai-org/GLM-5.2)
- [Version alternativa amd/GLM-5.2-MXFP4](https://huggingface.co/amd/GLM-5.2-MXFP4)
- [Blog de AMD sobre cuantizacion MXFP4/MXFP6](https://rocm.blogs.amd.com/software-tools-optimization/mxfp4-mxfp6-quantization/README.html)
- [Documentacion de AMD-Quark](https://quark.docs.amd.com/latest/index.html)
