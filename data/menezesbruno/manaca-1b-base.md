# menezesbruno/manaca-1b-base

## Resumen

Manacá-1B es un modelo de lenguaje autoregresivo (decoder-only) de aproximadamente 1,72 mil millones de parámetros, entrenado desde cero específicamente para el portugués de Brasil. Ha sido desarrollado por el Instituto de IA del LNCC (Laboratorio Nacional de Computación Científica de Brasil) en cooperación con NII/LLM-jp, y se publica como modelo base (pretrained, sin ajuste de instrucción ni alineamiento). Su objetivo es proporcionar un LLM abierto, reproducible y de alta calidad para la lengua portuguesa, un dominio tradicionalmente infrarrepresentado en los modelos multilingües dominantes.

El modelo sigue una arquitectura transformer estilo Llama-3 con 24 capas, dimensión oculta 2048, FFN 8192 con SwiGLU, atención con GQA (8 grupos KV), RoPE con θ=500000, RMSNorm y embeddings desacoplados. Su ventana de contexto es de 4096 tokens y se entrenó con aproximadamente 41,9 mil millones de tokens de actualización (unas dos épocas sobre un corpus curado de 20,1B tokens únicos). La relevancia actual radica en que ofrece una alternativa competitiva a modelos como Sabiá-7B o Tucano-2b4 en tareas de modelado del portugués, con una licencia permisiva CC BY 4.0 y un pipeline de entrenamiento totalmente reproducible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only estilo Llama-3 (24 capas, dim 2048, FFN 8192 SwiGLU, GQA 8 grupos KV, RoPE θ=500000, RMSNorm eps 1e-5, bias en todas las lineales, embeddings desacoplados) |
| Parametros totales | 1.722.951.680 (~1,72B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 4096 tokens |
| Tipos de cuantizacion | No se mencionan cuantizaciones oficiales; los pesos se publican en bfloat16 (safetensors) |
| Idiomas soportados | Portugues (pt), especificamente portugues de Brasil (pt-BR) |
| Licencia | CC BY 4.0 |
| Formato de pesos | safetensors (transformers) |

## Arquitectura y entrenamiento

Manacá-1B es un transformer decoder-only que sigue el diseño de Llama-3 pero con algunas diferencias: usa bias en todas las capas lineales, embeddings de entrada y salida desacoplados, y normalización RMSNorm con épsilon 1e-5. La atención emplea GQA (grouped-query attention) con 8 grupos de claves/valores y 32 cabezas de atención, con dimensión de cabeza 64. La posición se codifica con RoPE (rotary position embeddings) con theta 500000. El modelo fue entrenado con Megatron-LM (fork de LLM-jp) y el optimizador distribuido, en bfloat16 con recomputación completa.

El corpus de entrenamiento es abierto y curado, compuesto por tres fuentes: GigaVerbo (TucanoBR), una submuestra de web general en portugués de Brasil con ~14,7B tokens (73,1%); Ulysses Tesemõ (USP), de dominio jurídico/legislativo con ~4,8B tokens (23,9%); y Wikipedia en portugués (noviembre 2023) con ~0,6B tokens (3,1%). En total suman ~20,1B tokens únicos, y se entrenó durante aproximadamente dos épocas (41,9B tokens de actualización), cerca del punto compute-optimal de Chinchilla. Se usaron 20.000 pasos con batch global 512, secuencia de 4096, Adam (β 0,9/0,999, ε 1e-8), weight decay 0,1, clip de gradiente 1,0, learning rate 3e-4 → 3e-5 con decaimiento coseno y warmup de 2000 pasos, además de z-loss. El entrenamiento se realizó en dos GPUs de 24 GB (sin NVLink) con paralelismo de datos (ZeRO-1), sin iteraciones saltadas ni NaN, con pérdida de validación de 2,07 nats.

## Capacidades

- Generacion de texto autoregresiva en portugues de Brasil: el modelo completa y continua texto de forma fluida, con buen modelado de la lengua.
- Prediccion de la ultima palabra (last-word prediction): destaca en LAMBADA-PT, siendo el mejor modelo por debajo de 7B en este benchmark.
- Modelado de lenguaje general: es capaz de estimar probabilidades de secuencias y generar texto coherente en dominios web, juridico y enciclopedico.
- No sigue instrucciones ni mantiene conversaciones: al ser un modelo base, no ha pasado por SFT ni DPO/RLHF, por lo que no responde a prompts de chat ni a peticiones directas.
- No soporta tool calling, agentes ni razonamiento multi-paso de forma nativa (requeriria ajuste posterior).
- Capacidades multilingues limitadas: esencialmente monolingue en portugues (pt-BR), aunque puede procesar fragmentos de otros idiomas si aparecen en el corpus.
- El tokenizador es un SentencePiece unigram de 64k con normalizacion NFKC + case folding, lo que implica que el modelo es lowercase por construccion.

## Casos de uso

- Modelado de lengua portuguesa para investigacion academica: los investigadores pueden utilizar Manacá-1B como base para estudiar fenomenos linguisticos del portugues de Brasil, gracias a su arquitectura reproducible y su corpus abierto.
- Pretraining de modelos mas grandes en portugues: al ser un modelo base, puede servir como punto de partida para tecnicas como continual pretraining o distillation hacia modelos mas pequenos.
- Generacion de texto en dominios especializados: dado que el corpus incluye una proporcion significativa de texto juridico (Ulysses Tesemõ), puede usarse para generar borradores de documentos legales o legislativos con un estilo apropiado.
- Evaluacion de tecnicas de alineamiento: al ser un modelo base sin SFT ni DPO, es un candidato ideal para probar pipelines de fine-tuning con instrucciones en portugues.
- Baseline para benchmarks en portugues: los resultados publicados en CALAME-PT, LAMBADA-PT, HellaSwag-PT y ARC-Challenge-PT permiten usarlo como referencia comparativa para otros modelos.
- Sistemas de completado de texto integrados en herramientas de escritura: puede integrarse en editores o asistentes de redaccion en portugues para sugerir continuaciones de parrafos o corregir estilo, aunque requeriria un ajuste posterior para calidad de produccion.
- Investigacion en eficiencia de entrenamiento: el pipeline reproducible (codigo, logs y configuracion) permite estudiar el impacto de la composicion del corpus y los hiperparametros en modelos de ~1B.
- Prototipado de aplicaciones de lenguaje en portugues: para desarrolladores que necesitan un modelo base ligero y con licencia permisiva, Manacá-1B puede ser la base de un sistema de generacion de texto sin coste de licencia.

## Benchmarks y rendimiento

La model card proporciona resultados de evaluacion en cuatro benchmarks de portugues, comparados con el mejor modelo sub-7B y con Sabiá-7B. Los resultados se presentan en porcentaje de exactitud (accuracy).

| Benchmark | Manacá-1B | Mejor par sub-7B | Sabiá-7B |
|---|---|---|---|
| CALAME-PT | 60,63 | 60,39 (GlórIA-1b3) | 63,23 |
| LAMBADA-PT | 45,31 | 37,38 (mGPT-1b3) | 63,67 |
| HellaSwag-PT | 41,61 | 48,63 (Tucano-2b4) | 64,55 |
| ARC-Challenge-PT | 27,18 | 30,85 (Tucano-2b4) | 46,67 |

Manacá-1B es el modelo mas fuerte por debajo de 7B en LAMBADA-PT (prediccion de la ultima palabra), empata con los mejores modelos de 1-2B en CALAME-PT, y se situa en la zona de azar en ARC-Challenge-PT, algo esperable para un modelo base de esta escala. No se han publicado resultados en benchmarks estandar en ingles (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con pesos en bfloat16 (1,72B parametros), el modelo ocupa aproximadamente 3,4 GB en memoria (1,72B × 2 bytes). Con cuantizacion a 8 bits (~1,7 GB) o 4 bits (~0,9 GB) cabria en GPUs de gama baja.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM puede ejecutar el modelo en bfloat16 (por ejemplo, RTX 3050, RTX 4060, GTX 1660 Super). Para entrenamiento o fine-tuning se recomiendan GPUs con 24 GB o mas (RTX 3090, RTX 4090, A5000, A100).
- El entrenamiento original se realizo en 2 GPUs de 24 GB sin NVLink, lo que indica que el modelo es viable para fine-tuning en hardware modesto.
- Opciones de despliegue: al ser un modelo transformers estandar, puede servirse con vLLM, Text Generation Inference (TGI), llama.cpp (si se convierte a GGUF) u Ollama, ademas de la API de transformers.
- Latencia y throughput: no se han publicado mediciones especificas, pero para un modelo de 1,72B en una GPU moderna (por ejemplo, RTX 4090) se puede esperar una generacion de varios cientos de tokens por segundo en bfloat16.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idioma | Licencia | Notas |
|---|---|---|---|---|---|
| Manacá-1B | 1,72B | 4096 | pt-BR | CC BY 4.0 | Entrenado desde cero, base |
| GlórIA-1b3 | ~1,3B | no disponible | pt | no disponible | Mejor en CALAME-PT entre sub-7B |
| mGPT-1b3 | ~1,3B | no disponible | multilingue | no disponible | Mejor en LAMBADA-PT entre sub-7B (37,38) |
| Tucano-2b4 | ~2,4B | no disponible | pt | no disponible | Mejor en HellaSwag-PT y ARC-Ch-PT entre sub-7B |
| Sabiá-7B | ~7B | no disponible | pt | no disponible | Modelo mas grande, supera a Manacá en todos los benchmarks |

Manacá-1B se posiciona como un modelo competitivo en su rango de tamaño (1-2B) para portugues, aunque Sabiá-7B (mucho mayor) le supera claramente. No se dispone de datos de otros modelos comparables fuera de los mencionados en la model card.

## Limitaciones y advertencias

- Es un modelo base: no sigue instrucciones, no mantiene conversaciones y no esta alineado con valores humanos. Cualquier uso en produccion requiere un ajuste posterior (SFT/DPO).
- El tokenizador es lowercase por construccion: el texto se normaliza a minusculas antes de la segmentacion. Usar un tokenizador sin el normalizador correcto degrada los resultados de forma invisible.
- Sesgos linguisticos: entrenado exclusivamente en portugues de Brasil, puede tener un rendimiento pobre en otras variantes del portugues (Portugal, Africa) y en otros idiomas.
- Sesgos de dominio: el corpus incluye una proporcion alta de texto juridico (23,9%), lo que puede sesgar las generaciones hacia ese registro.
- Riesgo de alucinacion: como todo modelo de lenguaje, puede generar contenido falso o inventado, especialmente en tareas de hechos o conocimiento factual.
- Rendimiento bajo en razonamiento: en ARC-Challenge-PT se situa en la zona de azar, indicando limitaciones en tareas de razonamiento de sentido comun.
- Limitaciones de contexto: la ventana de 4096 tokens es relativamente corta para aplicaciones que requieran contexto largo.
- Licencia CC BY 4.0: permite uso comercial con atribucion, pero no impone share-alike (a diferencia de CC BY-SA). Es una licencia permisiva, aunque menos comun en el ecosistema de modelos que Apache-2.0 o MIT.
- No se han publicado resultados en benchmarks en ingles (MMLU, HumanEval, etc.), por lo que su rendimiento fuera del portugues es desconocido.

## Enlaces

- HuggingFace: https://huggingface.co/menezesbruno/manaca-1b-base
- Repositorio GitHub (codigo, logs y pipeline): https://github.com/Instituto-IA-LNCC/manaca-1b-base
- Preprint (PDF): https://github.com/Instituto-IA-LNCC/manaca-1b-base/blob/main/paper/manaca_1b_base_arxiv.pdf
- Dataset GigaVerbo (TucanoBR): https://huggingface.co/datasets/TucanoBR/GigaVerbo
- Wikipedia en portugues: https://huggingface.co/datasets/wikimedia/wikipedia
