# FamilyOrang/Hy4-FP8

## Resumen

Hy4 es un modelo multimodal de tipo Mixture-of-Experts (MoE) desarrollado por el equipo Tencent Hy, disenado para comprension conjunta de texto, imagen y video. El backbone de lenguaje cuenta con 770B parametros totales, de los cuales se activan 49B por token (mas 1.23B del codificador visual), distribuidos en 78 capas: una capa densa inicial y 77 capas MoE con 256 expertos enrutados y 1 experto compartido por capa, activando los top-8 expertos enrutados por token. La longitud de contexto alcanza 1.048.576 tokens (1M).

La arquitectura incorpora Gated DeepSeek Sparse Attention (Gated DSA) con IndexCache para reutilizacion de indices dispersos entre capas, formulacion MLA (Multi-head Latent Attention) con 64 cabezas, y conexiones residuales iHC (identity Hyper-Connections) con 4 flujos residuales. Incluye un drafter DFly2 de 5 capas y 3.3B parametros para decodificacion especulativa que reutiliza la KV cache y los indices dispersos del modelo principal.

Esta ficha corresponde a la variante cuantizada en FP8 (FamilyOrang/Hy4-FP8), un repositorio de 786,3 GB con pesos en safetensors compatibles con transformers y compressed-tensors. Es relevante para quienes necesitan desplegar un modelo multimodal de frontera con contexto de 1M tokens en infraestructura con aceleracion FP8, manteniendo las capacidades de vision, computer use y razonamiento de largo horizonte del modelo original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE) multimodal con ViT y drafter DFly2 |
| Parametros totales | 774.434.002.142 (segun safetensors); 770B en el backbone de lenguaje, excluyendo ViT, adaptador y DFly2 |
| Parametros activos | 49B texto + 1.23B vision por token |
| Longitud de contexto | 1.048.576 tokens (1M) |
| Tipos de cuantizacion | FP8 (esta variante); existe version GGUF publicada por terceros |
| Idiomas soportados | no disponible |
| Licencia | tencent-hy-license (other) |
| Formato de pesos | safetensors (compressed-tensors) |

Otros datos tecnicos del backbone: 78 capas (1 densa + 77 MoE), hidden size 6.144, vocabulario 120.832, 64 cabezas de atencion, MLA con q_lora_rank 2.048 y kv_lora_rank 512, indexer de 32 cabezas con dimension 128 y seleccion dispersa de top-2.048 tokens, FFN densa de 18.432 y expertos de 2.048 de tamano intermedio. El codificador visual tiene 40 capas, hidden size 1.536, 16 cabezas, patch de 16x16 y merging de features 2x2.

## Arquitectura y entrenamiento

El modelo sigue una arquitectura transformer MoE con atencion MLA y esparsidad inducida por indexer. La innovacion principal es Gated DeepSeek Sparse Attention (Gated DSA) combinada con IndexCache, que reutiliza los indices dispersos calculados en una capa para las siguientes, reduciendo el coste de seleccionar los top-2.048 tokens relevantes en contextos de hasta 1M tokens. Las conexiones residuales iHC con 4 flujos amplian el flujo de informacion entre capas. El modulo de vision es un ViT de 40 capas con resoluciones dinamicas, cuyo adaptador convierte features de imagen y fotogramas de video en tokens visuales que se procesan junto al texto.

Para acelerar la inferencia, se integra un drafter DFly2 de 5 capas y 3.3B parametros que reutiliza la KV cache y los indices dispersos del modelo principal, permitiendo decodificacion especulativa en contexto largo con coste constante y bajo. No se dispone en la informacion proporcionada de datos sobre volumen de tokens de entrenamiento, composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO.

## Capacidades

- Generacion de texto y razonamiento de proposito general, con enfasis en tareas de conocimiento y codigo.
- Comprension de imagen: el ViT procesa resoluciones dinamicas y el adaptador genera tokens visuales para el LLM.
- Comprension de video: los fotogramas se convierten en tokens visuales procesables junto al texto.
- Vision y computer use: la model card dedica una seccion especifica a uso de vision y control de computadora.
- Soporte de tool calling y function calling, segun los casos de uso descritos (flujos de oficina, asistentes).
- Razonamiento multi-paso y agentes de largo horizonte (long-horizon personal assistant).
- Desarrollo frontend y de videojuegos, con generacion de codigo en esos dominios.
- Flujos financieros y de oficina.
- Investigacion cientifica e I+D en IA.
- Capacidades multilingues: no disponible el detalle de idiomas soportados.

## Casos de uso

- Computer use y automatizacion de escritorio: el modelo puede interpretar capturas de pantalla y decidir acciones sobre interfaces, adecuado por su modulo de vision con resoluciones dinamicas y su capacidad de razonamiento multi-paso.
- Desarrollo frontend: generacion y edicion de codigo HTML, CSS y JavaScript a partir de descripciones o capturas de diseno, aprovechando el contexto de 1M tokens para mantener el estado completo de un proyecto.
- Desarrollo de videojuegos: generacion de logica de juego, scripts y contenido a partir de especificaciones textuales e imagenes de referencia.
- Asistente personal de largo horizonte: gestion de tareas prolongadas con historial extenso gracias a la ventana de 1M tokens y al soporte de tool calling.
- Analisis de documentos financieros: procesamiento de informes extensos con tablas e imagenes, combinando comprension visual y textual en una sola pasada de contexto largo.
- Investigacion cientifica asistida: lectura y sintesis de papers con figuras y ecuaciones, y generacion de codigo experimental, apoyandose en el conocimiento del backbone y la comprension de imagenes.
- Atencion al cliente multimodal: gestion de conversaciones multi-turno con imagenes adjuntas (capturas, fotos de producto) dentro de un contexto muy amplio.
- Procesamiento de video para resumenes o catalogacion: extraccion de tokens de fotogramas y generacion de descripciones o metadatos.

## Benchmarks y rendimiento

Resultados de evaluacion few-shot del modelo base (no de esta variante FP8), segun la model card:

| Categoria | Benchmark | Shots | Hy4 Base | Hy4 flash Base | Hy3 preview Base | DeepSeek-V4-flash-Base | DeepSeek-V4-Pro-Base |
|---|---|---:|---:|---:|---:|---:|---:|
| Conocimiento | MMLU | 5 | 91.6 | 88.7 | 87.5 | 89.7 | 91.1 |
| Conocimiento | MMLU-Pro | 5 | 73.9 | 71.1 | 65.8 | 68.6 | 73 (truncado en la fuente) |

La model card incluye ademas una grafica de bits-per-byte (BPB) en validacion interna de codigo y agentes frente a parametros activos, sin valores numericos en el texto. No se han proporcionado en la informacion disponible resultados de HumanEval, GSM8K ni otros benchmarks de la variante FP8.

## Requisitos de hardware

- VRAM estimada: los pesos FP8 del repositorio ocupan aproximadamente 786 GB, por lo que la inferencia requiere al menos ese volumen de memoria agregada; con overhead de KV cache para contexto de 1M tokens, el requisito efectivo es considerablemente mayor.
- No cabe en ninguna GPU de consumo (RTX 4090, 24 GB) ni en configuraciones multi-GPU de gama consumer realistas.
- Despliegue recomendado en nodos multi-GPU de centro de datos: H100 80 GB, H200, B200 o A100 80 GB en configuracion tensor-parallel de 8 o mas GPUs.
- Frameworks soportados segun la model card: vLLM y SGLang, con soporte de decodificacion especulativa DFly2.
- Existe una version GGUF publicada por un tercero (AngelSlim/Hy4-GGUF) que podria permitir cuantizaciones de menor precision, aunque no se detallan requisitos de memoria para esas variantes.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros totales | Parametros activos | Contexto | MMLU (5-shot) | Licencia |
|---|---|---|---|---|---|
| Hy4 | 770B | 49B | 1M | 91.6 | tencent-hy-license |
| Hy4 flash | no disponible | no disponible | no disponible | 88.7 | tencent-hy-license |
| Hy3 preview | no disponible | no disponible | no disponible | 87.5 | no disponible |
| DeepSeek-V4-flash | no disponible | no disponible | no disponible | 89.7 | no disponible |
| DeepSeek-V4-Pro | no disponible | no disponible | no disponible | 91.1 | no disponible |

Los datos de la comparativa provienen de la tabla de benchmarks de la model card; no se dispone de especificaciones completas de los modelos alternativos en la informacion proporcionada.

## Limitaciones y advertencias

- La model card incluye una seccion de limitaciones conocidas, pero su contenido no se ha proporcionado en detalle; conviene consultarla antes de desplegar.
- Riesgo de alucinacion inherente a los modelos de lenguaje de gran escala, especialmente en tareas factuales y de calculo sin verificación.
- La licencia tencent-hy-license no es de codigo abierto estandar; es imprescindible revisar sus terminos para uso comercial, redistribucion y despliegue en servicios.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado el 2026-11-20; se trata de una publicacion muy reciente y de un autor no oficial (FamilyOrang), no del repositorio oficial de Tencent, por lo que conviene verificar la integridad de los pesos.
- El tamano de 786,3 GB y los 774.434 millones de parametros registrados en safetensors hacen inviable el despliegue en hardware de consumo.
- No hay informacion sobre idiomas soportados ni sobre el rendimiento de esta variante FP8 frente al modelo en BF16; la cuantizacion puede degradar la calidad en tareas sensibles.
- El contexto de 1M tokens implica costes elevados de memoria KV y latencia que deben planificarse con atencion.

## Enlaces

- Repositorio Hugging Face de esta variante: https://huggingface.co/FamilyOrang/Hy4-FP8
- Modelo oficial en Hugging Face: https://huggingface.co/tencent/Hy4
- Version FP8 oficial: https://huggingface.co/tencent/Hy4-FP8
- Licencia: https://huggingface.co/tencent/Hy4-FP8/blob/main/LICENSE
- ModelScope: https://modelscope.cn/models/Tencent-Hunyuan/Hy4
- GitCode: https://ai.gitcode.com/tencent_hunyuan/Hy4
- Web oficial: https://hy.tencent.ai/research/hy4
- GitHub: https://github.com/Tencent-Hunyuan/Hy4
- GGUF (tercero): https://huggingface.co/AngelSlim/Hy4-GGUF
- Paper Gated DeepSeek Sparse Attention: https://arxiv.org/abs/2512.02556
- Paper IndexCache: https://arxiv.org/abs/2603.12201
- Articulo sobre iHC: https://zhuanlan.zhihu.com/p/2010852389670908320
