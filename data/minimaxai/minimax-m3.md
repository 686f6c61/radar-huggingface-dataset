# MiniMaxAI/MiniMax-M3

## Resumen

MiniMax-M3 es un modelo multimodal nativo desarrollado por MiniMaxAI, con aproximadamente 428.000 millones de parametros totales y unos 23.000 millones de parametros activos por token gracias a su arquitectura de mezcla de expertos (MoE). Su rasgo diferencial es una ventana de contexto de un millon de tokens gestionada mediante MiniMax Sparse Attention (MSA), un operador de atencion dispersa disenado especificamente para contextos de escala millonaria que, segun el autor, reduce el coste computacional por token a una veintesima parte respecto a la generacion anterior y ofrece aceleraciones de 9x en prefill y 15x en decodificacion frente a MiniMax-M2 a 1M de contexto.

El modelo se entrena con modalidades mixtas desde el primer paso, lo que permite fusion semantica entre texto, imagen y video en lugar de un acoplamiento tardio de un codificador visual externo. Esta orientado a tareas de agente de largo horizonte, programacion y trabajo colaborativo (cowork), y expone tres modos de razonamiento controlables mediante el parametro `thinking` (`enabled`, `adaptive`, `disabled`).

Es relevante ahora porque combina tres tendencias que estan definiendo la frontera de los modelos abiertos en 2026: multimodalidad nativa, contexto extremadamente largo con atencion eficiente y capacidades agenticas verificadas en benchmarks de horizonte largo. Su licencia es comunitaria (`minimax-community`, catalogada como `other`), no plenamente abierta, lo que condiciona su uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE multimodal nativo con MiniMax Sparse Attention (MSA) |
| Parametros totales | 427.040.140.160 (~427B) |
| Parametros activos | ~23B |
| Longitud de contexto | 1.000.000 tokens |
| Tipos de cuantizacion | MXFP4 y MXFP8 documentados (guia ATOM/ROCm); otras no disponibles |
| Idiomas soportados | no disponible |
| Licencia | `minimax-community` (catalogada como `other`) |
| Formato de pesos | safetensors (libreria transformers, `custom_code`) |

## Arquitectura y entrenamiento

MiniMax-M3 es un transformer de mezcla de expertos con unos 427B de parametros totales y aproximadamente 23B activos por token. La innovacion arquitectonica central es MiniMax Sparse Attention (MSA), un operador de atencion dispersa de alto rendimiento pensado para contextos de un millon de tokens. Frente a GQA, MSA reduce de forma marcada el computo y la huella de memoria de la atencion manteniendo la calidad del modelo; el autor reporta 9x de aceleracion en prefill y 15x en decodificacion a 1M de contexto respecto a M2, con un coste por token reducido a 1/20.

El entrenamiento es multimodal nativo: el modelo procesa texto, imagen y video de forma conjunta desde el primer paso de entrenamiento, lo que habilita una fusion semantica mas profunda que en enfoques de adaptador visual. La model card no detalla el volumen de tokens de entrenamiento, la composicion del dataset ni si se aplicaron fases de RLHF o DPO. Si se documenta un modo de razonamiento conmutable (`thinking`: `enabled`, `adaptive`, `disabled`), lo que sugiere etapas de post-entrenamiento orientadas a razonamiento y uso agentico. El informe tecnico esta disponible en arXiv:2606.13392.

## Capacidades

- Generacion de texto y razonamiento con tres modos conmutables: razonamiento siempre activo, adaptativo (el modelo decide cuando razonar) y desactivado para minimizar latencia.
- Comprension y generacion multimodal: entrada image-text-to-text, con soporte de imagen y video.
- Programacion y tareas de codigo, con rendimiento declarado de nivel frontera en benchmarks agenticos de horizonte largo.
- Capacidades agenticas y "cowork": ejecucion de tareas multi-paso y colaboracion en flujos de trabajo prolongados.
- Contexto de hasta 1M de tokens, adecuado para documentos, repositorios o sesiones de agente extensas.
- Integracion con frameworks de inferencia de produccion (SGLang, vLLM, Transformers, KTransformers, unsloth, ATOM).
- Soporte de tool calling / function calling: no confirmado explicitamente en la informacion disponible.
- Idiomas soportados: no disponible.

## Casos de uso

- Agentes de programacion de horizonte largo: el modelo puede mantener el estado de una tarea de refactorizacion o migracion a lo largo de miles de interacciones gracias al contexto de 1M tokens y a su rendimiento en benchmarks agenticos de codigo.
- Analisis de repositorios completos: con 1M de tokens de contexto y MSA eficiente, es viable cargar un repositorio de tamano medio y razonar sobre dependencias, tests y cambios sin trocear el codigo.
- Procesamiento de video y documentos largos: la multimodalidad nativa permite resumir o extraer informacion de videos y conjuntos de imagenes junto con texto en una sola pasada.
- Asistentes de investigacion: ingesta de articulos, papers y notas en una ventana de contexto millonaria para sintesis y comparacion cruzada.
- Automatizacion de flujos cowork: tareas colaborativas multi-paso donde el modo `thinking: adaptive` reduce coste en pasos triviales y activa razonamiento solo cuando aporta.
- Atencion al cliente con contexto extenso: gestion de conversaciones multi-turno con historial largo e imagenes adjuntas (capturas, facturas) en el mismo contexto.
- Pipelines de generacion de codigo en produccion: despliegue via vLLM o SGLang con cuantizacion MXFP4/MXFP8 en hardware AMD (ATOM) o NVIDIA para controlar coste por token.

## Benchmarks y rendimiento

La model card referencia una figura de benchmarks (`figures/benchmark.jpeg`) y afirma rendimiento de nivel frontera en benchmarks agenticos de horizonte largo, pero no se han publicado en la informacion disponible los valores numericos concretos de MMLU, HumanEval, GSM8K u otros. Los unicos datos cuantitativos disponibles son de eficiencia: 9x de aceleracion en prefill y 15x en decodificacion frente a MiniMax-M2 a 1M de contexto, y coste por token de 1/20.

No se han publicado resultados de benchmarks numericos en la informacion disponible.

## Requisitos de hardware

- Parametros totales de ~427B: el repo ocupa 1.708,4 GB en safetensors, por lo que la inferencia en precision completa requiere un cluster multi-GPU de alta gama.
- Con ~23B parametros activos, el coste por token es propio de un modelo de ese orden, pero la memoria para pesos es la de los 427B totales (o su version cuantizada).
- Cuantizacion MXFP4/MXFP8 documentada (guia ATOM/ROCm); el peso cuantizado a 4 bits se situaria en torno a 200-215 GB, aun fuera de una GPU de consumo individual.
- GPU recomendadas: no especificadas en la informacion disponible; por tamano, se requiere hardware de clase H100/H200, MI300/MI325 o superior en configuracion multi-GPU.
- No cabe en GPU de consumo (RTX 4090, 24 GB) ni en configuraciones de una sola tarjeta consumer.
- Frameworks de despliegue soportados: SGLang, vLLM, Transformers, KTransformers, unsloth y ATOM (ROCm).
- Parametros de inferencia recomendados: `temperature=1.0`, `top_p=0.95`.
- Latencia y throughput absolutos: no disponibles; solo se conocen las aceleraciones relativas frente a M2.

## Comparativa con modelos similares

| Modelo | Parametros | Activos | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| MiniMax-M3 | ~427B | ~23B | 1M | minimax-community | Multimodal nativo, MSA, agentico |
| MiniMax-M2 | no disponible | no disponible | no disponible | no disponible | Generacion anterior; M3 reporta 9x/15x de mejora a 1M |
| Alternativas de clase ~400B MoE | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparables en la informacion proporcionada |

No se dispone de datos suficientes en la informacion proporcionada para establecer una comparativa numerica con modelos de la misma categoria.

## Limitaciones y advertencias

- Licencia `minimax-community` (catalogada como `other`): no es una licencia de codigo abierto estandar; es imprescindible revisar el archivo LICENSE antes de cualquier uso comercial.
- Riesgo de alucinacion inherente a modelos de gran escala; no se documentan tasas ni mitigaciones especificas.
- Sesgos conocidos: no documentados en la informacion disponible.
- Idiomas soportados no declarados; el rendimiento fuera de los idiomas principales de entrenamiento no esta garantizado.
- El contexto de 1M tokens depende de MSA y de los kernels especificos; el comportamiento con frameworks o cuantizaciones no soportadas puede degradarse.
- El tamano (~427B parametros, 1,7 TB en safetensors) hace inviable el despliegue en hardware consumer y exige infraestructura multi-GPU.
- El soporte de tool calling no esta confirmado explicitamente en la model card.
- Los benchmarks solo se presentan como imagen sin valores numericos en el texto, lo que dificulta la verificacion independiente.

## Enlaces

- Hugging Face: https://huggingface.co/MiniMaxAI/MiniMax-M3
- Licencia: https://huggingface.co/MiniMaxAI/MiniMax-M3/blob/main/LICENSE
- Paper (arXiv): https://arxiv.org/abs/2606.13392
- Paper en HF Papers: https://huggingface.co/papers/2606.13392
- GitHub del modelo: https://github.com/MiniMax-AI/MiniMax-M3
- Repositorio MSA: https://github.com/MiniMax-AI/MSA
- MiniMax Code: https://agent.minimax.io/
- MiniMax API: https://platform.minimax.io/
- Documentacion API: https://platform.minimax.io/docs/guides/text-generation
- Web oficial: https://www.minimax.io
- ModelScope: https://modelscope.cn/organization/minimax
- Discord: https://discord.com/invite/DPC4AHFCBw
- SGLang cookbook: https://docs.sglang.io/cookbook/autoregressive/MiniMax/MiniMax-M3
- vLLM recipes: https://recipes.vllm.ai/MiniMaxAI/MiniMax-M3
- Transformers docs: https://huggingface.co/docs/transformers/model_doc/minimax_m3_vl
- KTransformers tutorial: https://github.com/kvcache-ai/ktransformers/blob/main/doc/en/kt-kernel/MiniMax-M3-Tutorial.md
- unsloth tutorial: https://unsloth.ai/docs/models/minimax-m3
- ATOM (ROCm) guia: https://github.com/ROCm/ATOM/blob/main/recipes/MiniMax-M3.md
- Contacto: model@minimax.io
