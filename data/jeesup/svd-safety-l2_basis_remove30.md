# Jeesup/svd-safety-l2_basis_remove30

## Resumen

svd-safety-l2_basis_remove30 es un checkpoint de investigación derivado de meta-llama/Llama-2-7b-chat-hf, publicado por el usuario Jeesup. No es un modelo conversacional listo para producción: es una celda concreta dentro de una rejilla experimental que estudia cómo la compresión por SVD degrada el comportamiento de seguridad de un LLM y qué regla de selección de componentes lo repara mejor. El checkpoint se ha comprimido con Basis Sharing (ICLR 2025), una técnica que comparte bases sobre grupos de 2 capas adyacentes, eliminando el 30,00 % de los parámetros densos hasta dejar una fracción de 0,6998 respecto al modelo original.

La recuperación de capacidades se hizo con un fine-tune LoRA de r=8 aplicado únicamente sobre los coeficientes por capa, manteniendo las bases congeladas y sin alterar el presupuesto de parámetros. El entrenamiento de recuperación usó alpaca-cleaned durante 2 épocas con learning rate 1e-4 y batch 64, con semilla 42. El artefacto incluye métricas medidas de seguridad y utilidad (ASR en AdvBench y StrongREJECT, sobrerrechazo macro en WildGuard y perplejidad en WikiText-2), lo que lo convierte en un sujeto de estudio reproducible más que en un asistente desplegable.

Su relevancia actual es metodológica: permite cuantificar el compromiso entre seguridad y utilidad bajo compresión agresiva de parámetros y comparar reglas de selección de componentes dentro de una misma rejilla controlada. El repositorio ocupa 13,5 GB y expone 6.738.415.616 elementos en safetensors, la misma cifra que el recuento denso de Llama-2-7b, por lo que conviene verificar la estructura real de los tensores antes de asumir cualquier reducción efectiva en memoria.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama-2-7b-chat: 32 capas, d_model 4096, 32 cabezas de atencion, RoPE, RMSNorm, SwiGLU), con bases SVD compartidas sobre grupos de 2 capas adyacentes |
| Parametros totales | 6.738.415.616 elementos en safetensors; la model card declara una fraccion de parametros densos de 0,6998 (30,00 % eliminado) |
| Longitud de contexto | 4096 tokens (heredada de Llama-2-7b-chat; no se documenta extension adicional) |
| Tipos de cuantizacion | no disponible (el repositorio solo contiene pesos safetensors de 13,5 GB; no se publican GGUF, AWQ ni GPTQ) |
| Idiomas soportados | no disponible (la model card no los declara; el modelo base esta optimizado principalmente para ingles) |
| Licencia | Llama 2 Community License (incluye LICENSE.txt y USE_POLICY.md en el repositorio) |
| Formato de pesos | safetensors (libreria transformers) |
| Modelo base | meta-llama/Llama-2-7b-chat-hf |
| Semilla | 42 |
| Recuperacion | LoRA r=8 solo sobre coeficientes por capa, bases congeladas, 2 epocas, lr 1e-4, batch 64, alpaca-cleaned |
| Tamano del repositorio | 13,5 GB |
| Pipeline | text-generation |

## Arquitectura y entrenamiento

El punto de partida es un transformer decoder-only de tipo Llama-2-7b-chat, con 32 capas, 4096 dimensiones de modelo, 32 cabezas de atencion, normalizacion RMSNorm, embeddings rotatorios (RoPE) y MLP con activacion SwiGLU. Sobre esa red se aplica Basis Sharing, la tecnica de compresion presentada en ICLR 2025, que factoriza las matrices de pesos mediante descomposicion en valores singulares y comparte las bases entre pares de capas adyacentes. Esto reduce el presupuesto de parametros un 30,00 %, dejando una fraccion de 0,6998 respecto al modelo denso original, manteniendo la semilla 42 para reproducibilidad.

La recuperacion posterior es deliberadamente minima: un LoRA de rango 8 entrenado solo sobre los coeficientes por capa, con las bases compartidas congeladas, de modo que la intervencion no cambia ni el presupuesto de parametros ni las bases. Se ejecutaron 2 epocas sobre alpaca-cleaned con learning rate 1e-4 y batch 64. No se documentan en la model card el volumen total de tokens de recuperacion, la mezcla completa del dataset ni fases de RLHF o DPO especificas de este artefacto; el alineamiento de seguridad heredado procede del modelo base Llama-2-7b-chat. Tampoco se detalla la composicion exacta de la rejilla de reglas de seleccion y presupuestos de la que esta celda forma parte.

## Capacidades

- Generacion de texto conversacional en ingles, heredada de Llama-2-7b-chat, con calidad degradada por la compresion y parcialmente recuperada mediante LoRA sobre coeficientes.
- Respuesta a instrucciones de tipo chat con formato de dialogo de Llama 2.
- Capacidad de rechazo de peticiones daninas, cuantificada con tasas de exito de ataque (ASR) de 0,0308 en AdvBench y 0,0575 en StrongREJECT, ambas evaluadas con el juez HarmBench.
- Utilidad de modelado de lenguaje medida como perplejidad de 9,2195 en WikiText-2.
- Sujeto de estudio de interpretabilidad: permite analizar como la factorizacion SVD y el reparto de bases afectan a circuitos internos asociados a seguridad.
- No se documentan capacidades de tool calling, function calling, uso de agentes, vision, audio ni modo de razonamiento explicito (thinking mode) en la informacion disponible.
- Capacidades multilingues: no disponibles; no se declaran idiomas soportados.
- No se documenta soporte de contexto largo mas alla de los 4096 tokens del modelo base.

## Casos de uso

- Reproduccion de estudios de compresion: el checkpoint sirve como una celda fija (semilla 42, 30,00 % de parametros eliminados) para replicar experimentos sobre Basis Sharing y verificar la perplejidad de 9,2195 en WikiText-2.
- Analisis del compromiso seguridad-utilidad: con ASR de 0,0308 en AdvBench y 0,0575 en StrongREJECT medidos con HarmBench, permite trazar curvas de degradacion de seguridad frente a presupuesto de parametros.
- Evaluacion de sobrerrechazo: el valor de 0,3192 de sobrerrechazo macro segun WildGuard lo convierte en un caso de estudio util para calibrar clasificadores de rechazo excesivo en sistemas de moderacion.
- Investigacion en interpretabilidad mecanistica: al mantener bases SVD compartidas y congeladas, facilita el analisis de como los subespacios de pesos se relacionan con comportamientos de rechazo y con la utilidad general.
- Linea base para tecnicas de reparacion: sirve como referencia contra la que comparar otras reglas de seleccion de componentes, otros rangos de LoRA o presupuestos de compresion distintos dentro de la misma rejilla.
- Desarrollo y validacion de jueces automaticos: sus salidas etiquetadas con HarmBench y WildGuard son material para testear la sensibilidad de estos evaluadores ante modelos parcialmente degradados.
- Docencia y divulgacion tecnica: ilustra de forma tangible el efecto de eliminar el 30 % de los parametros de un modelo de 7B y el limite de una recuperacion con LoRA de rango 8.
- Red teaming controlado: dado que la propia model card advierte de que algunas celdas de la rejilla estan deliberadamente degradadas en seguridad, puede usarse como objetivo de prueba en entornos aislados para medir robustez de defensas.

## Benchmarks y rendimiento

| Metrica | Valor | Juez / protocolo |
|---|---|---|
| AdvBench ASR | 0,0308 | HarmBench judge |
| StrongREJECT ASR | 0,0575 | HarmBench judge |
| Sobrerrechazo macro | 0,3192 | WildGuard |
| Perplejidad WikiText-2 | 9,2195 | WikiText-2 |

No se han publicado en la informacion disponible resultados de MMLU, HumanEval, GSM8K ni otros benchmarks de capacidades generales, ni comparaciones numericas con modelos similares.

## Requisitos de hardware

- VRAM estimada en precision completa (fp16/bf16): en torno a 14-16 GB solo para los pesos, dado que el repositorio ocupa 13,5 GB, mas la memoria de activaciones y cache KV.
- GPU profesionales: A100 40 GB, H100 80 GB, L40S 48 GB o A6000 48 GB, con margen amplio para lotes mayores y contextos completos de 4096 tokens.
- GPU de consumo: una RTX 4090 o RTX 3090 de 24 GB puede alojar los pesos en fp16, aunque con poco margen para lotes grandes y contextos largos. Tarjetas de 16 GB (RTX 4080, 4060 Ti 16 GB, A4000) requeririan cuantizacion, que no esta publicada.
- Al no existir pesos GGUF, AWQ ni GPTQ en el repositorio, el uso en GPUs pequenas exige convertir y cuantizar el modelo por cuenta propia, con la perdida de fidelidad experimental que ello implica.
- Opciones de despliegue: transformers (libreria declarada), text-generation-inference (el repositorio esta etiquetado como endpoints_compatible) y vLLM como alternativa habitual para transformers en formato safetensors. llama.cpp u Ollama requieren conversion previa a GGUF.
- Latencia y throughput: no disponibles; no se publican mediciones de tokens por segundo ni de latencia en la model card.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Rendimiento |
|---|---|---|---|---|---|
| svd-safety-l2_basis_remove30 | 6.738.415.616 elementos en safetensors; fraccion densa declarada 0,6998 | 4096 tokens | Llama 2 Community License | HuggingFace, safetensors, 0 descargas | PPL WikiText-2 9,2195; ASR AdvBench 0,0308; ASR StrongREJECT 0,0575; sobrerrechazo 0,3192 |
| meta-llama/Llama-2-7b-chat-hf | 6.738.415.616 | 4096 tokens | Llama 2 Community License | HuggingFace, ampliamente desplegado | no disponible en la informacion proporcionada |
| Otras celdas de la rejilla del mismo estudio | no disponible | 4096 tokens (asumido del base) | Llama 2 Community License | no publicado en esta ficha | no disponible |

No se dispone de datos comparativos de benchmarks frente a alternativas de la misma categoria dentro de la informacion proporcionada.

## Limitaciones y advertencias

- No es un modelo de proposito general: la propia model card lo describe como artefacto de investigacion y una celda dentro de una rejilla experimental.
- Varias celdas del estudio estan deliberadamente degradadas en seguridad respecto a Llama-2-7b-chat; la compresion por si sola eleva la tasa de exito de ataques. Este checkpoint concreto registra un ASR de 0,0308 en AdvBench y 0,0575 en StrongREJECT, valores que deben interpretarse en su contexto experimental y no como garantia de seguridad.
- Sobrerrechazo elevado: 0,3192 macro segun WildGuard, lo que implica que rechaza peticiones legitimas en una proporcion notable.
- Riesgo de alucinacion inherente a un modelo de 7B comprimido un 30 % y recuperado solo con LoRA de rango 8 sobre coeficientes; no se han publicado evaluaciones especificas de factualidad.
- Idiomas soportados no declarados; el comportamiento fuera del ingles no esta caracterizado.
- Ventana de contexto limitada a 4096 tokens, sin documentacion de extension mediante RoPE scaling.
- Sin cuantizaciones oficiales publicadas, lo que complica el despliegue en hardware de consumo sin intervencion manual.
- Licencia Llama 2 Community License: el uso comercial esta sujeto a las condiciones de dicho acuerdo, incluida la clausula de 700 millones de usuarios activos mensuales y los requisitos de atribucion ("Built with Llama"), y la obligacion de incluir LICENSE.txt y USE_POLICY.md en cualquier redistribucion.
- Ausencia total de adopcion en el momento de la ficha (0 descargas, 0 likes), sin senales de mantenimiento ni soporte del autor.
- La discrepancia entre el recuento de elementos en safetensors (6.738.415.616) y la fraccion densa declarada (0,6998) aconseja inspeccionar la estructura real de los tensores antes de asumir ahorros de memoria en el despliegue.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Jeesup/svd-safety-l2_basis_remove30
- Modelo base: https://huggingface.co/meta-llama/Llama-2-7b-chat-hf
- Referencia citada por el autor: Basis Sharing (ICLR 2025), URL no disponible
- Licencia y politica de uso: LICENSE.txt y USE_POLICY.md incluidos en el propio repositorio de HuggingFace
- La busqueda web realizada no devolvio resultados relevantes sobre este modelo, su dataset o su paper asociado; todos los resultados obtenidos correspondian a entidades bancarias sin relacion con el artefacto.
