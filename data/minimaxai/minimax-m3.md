# MiniMaxAI/MiniMax-M3

## Resumen

MiniMax-M3 es un modelo multimodal nativo de tipo Mixture of Experts (MoE) desarrollado por MiniMax AI, con aproximadamente 428.000 millones de parametros totales y unos 23.000 millones de parametros activos por token. Su rasgo diferencial es una ventana de contexto de 1 millon de tokens, gestionada mediante un mecanismo propio de atencion dispersa denominado MiniMax Sparse Attention (MSA), que reduce el coste computacional del prefill y del decode en contextos largos. El modelo se entrena con modalidades mixtas desde el primer paso, fusionando texto, imagen y video en un unico espacio semantico.

El modelo esta orientado a tareas de agente de largo horizonte, generacion de codigo y trabajo colaborativo ("cowork"), y expone tres modos de razonamiento configurables mediante el parametro `thinking` (enabled, adaptive, disabled). Se distribuye con pesos en safetensors, licencia propia MiniMax Community y soporte en los principales frameworks de inferencia (vLLM, SGLang, Transformers, KTransformers, unsloth y ATOM para ROCm).

En el momento de redactar esta ficha, la model card indica que existe una version posterior, MiniMax-M3.1-Flash, lo que conviene tener en cuenta al evaluar el modelo para nuevos despliegues.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE multimodal con MiniMax Sparse Attention (MSA) |
| Parametros totales | 427.040.140.160 (~428B) |
| Parametros activos | ~23B |
| Longitud de contexto | 1.000.000 tokens (1M) |
| Tipos de cuantizacion | MXFP4 y MXFP8 documentados (via ATOM/ROCm); no se detallan otros formatos en la informacion disponible |
| Idiomas soportados | no disponible |
| Licencia | MiniMax Community (license: other, license_name: minimax-community) |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

MiniMax-M3 es un transformer de tipo Mixture of Experts con aproximadamente 428B de parametros totales y ~23B activos por token. La innovacion arquitectonica central es MiniMax Sparse Attention (MSA), un operador de atencion dispersa disenado para contextos de millones de tokens. Segun el autor, MSA reduce de forma notable el coste de computo y el footprint de memoria de la atencion frente a GQA, manteniendo la calidad del modelo. A 1M de contexto, M3 reporta aceleraciones de 9x en prefill y 15x en decode respecto a M2, con una reduccion del computo por token a 1/20.

El entrenamiento es multimodal mixto desde el primer paso (texto, imagen y video), lo que permite una fusion semantica mas profunda entre modalidades. La model card no detalla el numero de tokens de entrenamiento, la composicion exacta del dataset ni si se aplicaron fases de RLHF o DPO; esa informacion no esta disponible en los datos proporcionados. El modelo soporta tres modos de razonamiento (`enabled`, `adaptive`, `disabled`) que permiten ajustar latencia y throughput segun la tarea.

## Capacidades

- Generacion de texto y razonamiento con modos de pensamiento configurables (siempre activo, adaptativo o desactivado).
- Comprension y generacion multimodal: entrada de imagen y video junto con texto (pipeline image-text-to-text).
- Generacion de codigo y tareas de ingenieria de software, con enfasis en agentes de largo horizonte.
- Capacidades de agente y razonamiento multi-paso ("cowork"), orientadas a flujos de trabajo complejos.
- Contexto extremadamente largo (1M tokens) para documentos extensos, repositorios completos o transcripciones largas.
- Soporte de tool calling / function calling: los tags incluyen "agent" y "endpoints_compatible", aunque la model card no detalla el esquema exacto de llamadas a herramientas.
- Capacidades multilingues: no se especifican los idiomas soportados en la informacion disponible.

## Casos de uso

- Analisis de repositorios completos: con 1M de tokens de contexto, el modelo puede ingerir un repositorio de tamano medio y responder preguntas sobre arquitectura, dependencias o cambios entre ramas sin trocear el codigo.
- Agentes de codigo autonomos: su rendimiento en benchmarks de agente de largo horizonte y su soporte de tool calling lo hacen adecuado para pipelines que planifican, editan y verifican codigo en multiples pasos.
- Revision de documentacion tecnica extensa: procesar manuales, especificaciones o contratos de cientos de miles de tokens en una sola pasada, con razonamiento adaptativo para ahorrar latencia en consultas simples.
- Analisis de video y transcripciones: al ser multimodal nativo, puede resumir o extraer informacion de grabaciones y material audiovisual junto con texto asociado.
- Asistencia en atencion al cliente de nivel tecnico: conversaciones multi-turno con historial largo y capacidad de consultar bases de conocimiento extensas dentro del contexto.
- Automatizacion de tareas de "cowork" en entornos corporativos: coordinacion de subtareas, extraccion de datos de documentos e imagenes y generacion de informes consolidados.
- Despliegue en infraestructura AMD: la disponibilidad de recetas ATOM con cuantizacion MXFP4/MXFP8 permite servir el modelo en GPUs ROCm, un caso de uso relevante para entornos no NVIDIA.

## Benchmarks y rendimiento

La model card menciona que M3 alcanza "rendimiento de frontera" en benchmarks de agente de largo horizonte, codigo y cowork, y referencia una figura de benchmarks, pero no se incluyen cifras numericas concretas en la informacion proporcionada. Los unicos datos de rendimiento disponibles son relativos a eficiencia:

| Metrica | Valor reportado |
|---|---|
| Aceleracion en prefill a 1M de contexto (vs. M2) | 9x |
| Aceleracion en decode a 1M de contexto (vs. M2) | 15x |
| Computo por token a 1M de contexto (vs. M2) | 1/20 |

No se han publicado resultados numericos de benchmarks (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: con ~428B de parametros totales, en BF16 el modelo requiere del orden de 850 GB o mas solo para pesos, antes de KV cache. En cuantizacion MXFP4 el peso aproximado se reduce a unos 215 GB, y en MXFP8 a unos 430 GB; estas cifras son estimaciones a partir del numero de parametros y no aparecen explicitadas en la model card.
- GPU recomendadas: despliegue multi-GPU en nodos con H100 o A100 de 80 GB; tambien hay soporte documentado para GPUs AMD via ATOM (ROCm).
- GPU de consumo: no cabe en GPUs de consumo individuales (RTX 4090 de 24 GB) ni en configuraciones tipicas de varias tarjetas consumer, dado el tamano del modelo.
- Frameworks de despliegue: vLLM (recetas oficiales), SGLang (cookbook), Transformers (model_doc/minimax_m3_vl), KTransformers (tutorial especifico), unsloth (tutorial) y ATOM para ROCm con cuantizacion MXFP4/MXFP8.
- Parametros de inferencia recomendados: `temperature=1.0`, `top_p=0.95`.
- Latencia y throughput: no se proporcionan cifras absolutas; solo las aceleraciones relativas frente a M2 indicadas en la seccion de benchmarks.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Multimodal | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MiniMax-M3 | ~428B totales / ~23B activos | 1M | Si (texto, imagen, video) | MiniMax Community | Pesos abiertos en HF |
| MiniMax-M2 | no disponible | no disponible (inferior a 1M segun comparativa de eficiencia) | no disponible | no disponible | Referenciado por el autor |
| MiniMax-M3.1-Flash | no disponible | no disponible | no disponible | no disponible | Version posterior indicada en la model card |

No se dispone de datos suficientes en la informacion proporcionada para comparar con alternativas de otros fabricantes (parametros, contexto, benchmarks o licencia). La comparativa con M2 solo permite afirmar mejoras de eficiencia a 1M de contexto (9x prefill, 15x decode, 1/20 de computo por token).

## Limitaciones y advertencias

- Sesgos conocidos: no se documentan en la informacion disponible; procede evaluar sesgos en el dominio de despliegue antes de produccion.
- Riesgo de alucinacion: no cuantificado en la model card; como en cualquier LLM de gran escala, requiere verificacion en tareas factuales.
- Idiomas: no se especifica la lista de idiomas soportados, lo que impide garantizar calidad en castellano u otros idiomas sin evaluacion previa.
- Licencia: la licencia MiniMax Community es distinta de las licencias open source estandar; es imprescindible revisar el archivo LICENSE del repositorio antes de un uso comercial.
- Versionado: la model card indica que existe MiniMax-M3.1-Flash como nueva version, por lo que M3 podria no recibir mejoras futuras.
- Requisitos de infraestructura: el tamano del modelo (~1,7 TB de repositorio) y la VRAM necesaria limitan su uso a infraestructura multi-GPU profesional.
- Contexto largo: aunque el modelo soporta 1M de tokens, no se documenta la degradacion de calidad en funcion de la longitud; conviene validar en el caso de uso concreto.
- Tool calling: la model card no detalla el esquema de function calling, por lo que la integracion con frameworks de agentes requiere consultar la documentacion de la API.

## Enlaces

- Hugging Face: https://huggingface.co/MiniMaxAI/MiniMax-M3
- Paper tecnico (arXiv): https://arxiv.org/abs/2606.13392
- Hugging Face Papers: https://huggingface.co/papers/2606.13392
- Repositorio MSA: https://github.com/MiniMax-AI/MSA
- Repositorio GitHub del modelo: https://github.com/MiniMax-AI/MiniMax-M3
- MiniMax Code: https://agent.minimax.io/
- API MiniMax: https://platform.minimax.io/
- Documentacion API: https://platform.minimax.io/docs/guides/text-generation
- Web oficial: https://www.minimax.io
- ModelScope: https://modelscope.cn/organization/minimax
- Discord: https://discord.com/invite/DPC4AHFCBw
- Licencia: https://huggingface.co/MiniMaxAI/MiniMax-M3/blob/main/LICENSE
- SGLang cookbook: https://docs.sglang.io/cookbook/autoregressive/MiniMax/MiniMax-M3
- vLLM recipes: https://recipes.vllm.ai/MiniMaxAI/MiniMax-M3
- Transformers docs: https://huggingface.co/docs/transformers/model_doc/minimax_m3_vl
- KTransformers tutorial: https://github.com/kvcache-ai/ktransformers/blob/main/doc/en/kt-kernel/MiniMax-M3-Tutorial.md
- unsloth tutorial: https://unsloth.ai/docs/models/minimax-m3
- ATOM (ROCm) guia MXFP4/MXFP8: https://github.com/ROCm/ATOM/blob/main/recipes/MiniMax-M3.md
- Contacto: model@minimax.io
