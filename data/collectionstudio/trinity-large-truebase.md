# CollectionStudio/Trinity-Large-TrueBase

## Resumen

Trinity-Large-TrueBase es un checkpoint base de preentrenamiento perteneciente a la familia Trinity Large de Arcee AI, publicado en Hugging Face bajo la organización CollectionStudio. Se trata de un modelo de mezcla de expertos (sparse MoE) de aproximadamente 398.000 millones de parámetros totales, con alrededor de 13.000 millones de parámetros activos por token. Este checkpoint fue capturado tras 10 billones de tokens de entrenamiento, antes del annealing de la tasa de aprendizaje y antes de cualquier ajuste por instrucciones o preferencias. Es un modelo puro de base, sin alineación, formato de chat ni RLHF.

La arquitectura utiliza un enrutamiento 4-de-256 expertos (esparsidad del 1,56 %), con seis capas densas y una ventana de contexto de preentrenamiento de 8.192 tokens. El entrenamiento se realizó en 2.048 GPU NVIDIA B300 con paralelismo HSDP y paralelismo de expertos, con datos de Prime Intellect y Datology. Su relevancia radica en ser un punto de referencia limpio para estudiar el comportamiento emergente a gran escala, el balanceo de carga en MoE y la interpretabilidad, sin la contaminación de las fases de alineación que suelen incluir la mayoría de los modelos públicos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE esparso (AfmoeForCausalLM) |
| Parametros totales | 398.635.286.016 (~398B) |
| Parametros activos | ~13B por token |
| Longitud de contexto | 8.192 tokens (preentrenamiento) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, es, fr, de, it, pt, ru, ar, hi, ko, zh |
| Licencia | openmdw-1.1 (licecia personalizada) |
| Formato de pesos | safetensors (bf16) |

## Arquitectura y entrenamiento

Trinity-Large-TrueBase implementa una arquitectura de mezcla de expertos esparsa con 256 expertos y activa solo 4 de ellos en cada token, lo que arroja una esparsidad del 1,56 %. Además de los expertos, incorpora seis capas densas. El checkpoint se extrae de la carrera principal de Trinity Large en el hito de 10 billones de tokens, antes de la fase de afinado de la tasa de aprendizaje (WSD warm-up) y de cualquier post-entrenamiento con datos de instrucciones o reinforcement learning.

En cuanto al entrenamiento, se utilizaron optimizadores Adam (tasa 2e-4) y Muon (tasa 8e-4) tras el calentamiento WSD. Muon se empleó para soportar tamaños de lote críticos mayores en un régimen de MoE altamente esparso. La infraestructura incluyó 2.048 GPU NVIDIA B300 con paralelismo HSDP y paralelismo de expertos, con Prime Intellect como socio de computación y Datology como socio de datos. La composición exacta del dataset de entrenamiento no está disponible en la información proporcionada.

## Capacidades

- Generacion de texto como modelo base: produce texto coherente pero sin formato de chat ni de instruccion, dado que no cuenta con datos de post-entrenamiento.
- Razonamiento matematico: obtiene 0,8036 en GSM8K (8-shot) y 0,2696 en MATH-hard (4-shot), lo que indica una base solida en matematicas.
- Razonamiento multi-step: 0,5784 en BBH (few-shot) y 0,4091 en GPQA Diamond (5-shot).
- Generacion de codigo: 0,5183 en HumanEval+ (pass@1) y 0,8095 en MBPP+ (pass@1).
- Conocimiento general: 0,7845 en MMLU (5-shot) y 0,5160 en MMLU-Pro (5-shot).
- Comprension lectora y razonamiento comun: 0,6237 en ARC Challenge, 0,8813 en HellaSwag y 0,8145 en Winogrande.
- Conocimiento factual: 0,8096 en TriviaQA (5-shot).

No soporta tool calling, agentes ni multistep reasoning en el sentido amplio, al carecer de entrenamiento de instrucciones. No incluye vision, audio ni modo de pensamiento extendido. Los benchmarks mostrados estan calculados en ingles, por lo que el rendimiento en los demas idiomas no esta verificado.

## Casos de uso

- Investigacion en enrutamiento MoE y balanceo de carga: permite analizar como se distribuyen los tokens entre los 256 expertos y detectar desbalances o colapsos de enrutamiento. Es util para estudiar la influencia de la esparsidad 4-de-256 en la eficiencia computacional.
- Estudios de interpretabilidad y probing: al ser un checkpoint base sin alineacion, se pueden analizar representaciones internas, atencion y formacion de conceptos sin interferencias de preferencias o ajustes de instrucciones.
- Ablacion de datos y comparacion de dinamicas de entrenamiento: al comparar con Trinity-Large-Base (17T tokens con annealing), permite aislar el efecto de los ultimos 7 billones de tokens y de la fase de afinado de la tasa de aprendizaje sobre el comportamiento final.
- Fine-tuning para dominios especificos: la ausencia de RLHF y alineacion previa favorece un ajuste fino limpio en dominios concretos, como biomedicina, finanzas o ciencia, sin necesidad de revertir alineaciones anteriores.
- Investigacion academica en modelos fundacionales: sirve como referencia reproducible para universidades y laboratorios que estudian fenomenos emergentes en modelos de 398B parametros a escala MoE.
- Generacion de codigo con fine-tuning: los resultados en HumanEval+ y MBPP+ indican que la base es adecuada para entrenar modelos especializados en codificacion sobre esta arquitectura.

## Benchmarks y rendimiento

| Benchmark | N-shot | Metrica | Puntuacion |
|---|---|---|---|
| ARC Challenge | 0 | acc_norm | 0,6237 |
| BBH | 3 | exact_match | 0,5784 |
| GPQA Diamond | 5 | acc_norm | 0,4091 |
| GPQA Diamond (generative) | 5 | exact_match | 0,3788 |
| GSM8K | 8 | exact_match | 0,8036 |
| GSM8K (chain-of-thought) | 8 | exact_match | 0,8044 |
| HellaSwag | 5 | acc_norm | 0,8813 |
| HumanEval+ | 0 | pass@1 | 0,5183 |
| MATH-hard | 4 | exact_match | 0,2696 |
| MBPP+ | 3 | pass@1 | 0,8095 |
| Minerva Math500 | 4 | math_verify | 0,4820 |
| MMLU | 5 | acc | 0,7845 |
| MMLU (generative) | 5 | exact_match | 0,7848 |
| MMLU-Pro | 5 | exact_match | 0,5160 |
| TriviaQA | 5 | exact_match | 0,8096 |
| Winogrande | 5 | acc | 0,8145 |

La tabla muestra los valores reportados en el modelo. No se han encontrado resultados de benchmarks comparativos con otros modelos en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: aproximadamente 797 GB en bf16 para todos los pesos. La memoria necesaria depende de los 398.000 millones de parametros totales, no de los 13.000 millones activos.
- GPU recomendadas: no es viable en una sola GPU. Para inferencia en bf16 se requiere un cluster con al menos 16 GPU H100 de 80 GB o 8 GPU B200 de 192 GB. El entrenamiento original utilizo 2.048 GPU NVIDIA B300.
- Consumer GPU: no disponible. Ni siquiera una RTX 4090 (24 GB) puede albergar el modelo ni en cuantizacion de 8 bits (398 GB).
- Opciones de despliegue: vLLM con tensor parallelism y expert parallelism, Text Generation Inference (TGI), Hugging Face Inference Endpoints (via transformers con custom code). El uso de llama.cpp u Ollama no es practico a esta escala.
- Latencia y throughput: no disponible. No se han publicado medidas de rendimiento en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros totales | Activos por token | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Trinity-Large-TrueBase | ~398B | ~13B | 8.192 | openmdw-1.1 | Hugging Face |
| Trinity-Large-Base | ~398B | ~13B | 8.192 (preentrenamiento) | openmdw-1.1 | Hugging Face |
| Trinity-Large-Thinking | ~398B | ~13B | 8.192+ | openmdw-1.1 | Hugging Face |
| Mixtral 8x7B | 47B | 13B | 32.768 | Apache 2.0 | Hugging Face |
| DeepSeek-V3 | 671B | 37B | 128.000 | MIT+ | Hugging Face |

Trinity-Large-Base y Trinity-Large-Thinking son variantes de la misma familia: la primera es el modelo fundacional completo (17T tokens con annealing) y la segunda es una version optimizada para razonamiento con post-entrenamiento agente. Mixtral 8x7B comparte el numero de parametros activos (13B) pero tiene mucho menor capacidad total y una ventana de contexto mayor. DeepSeek-V3 es un MoE mas grande con mas parametros activos y una ventana de contexto de 128.000 tokens. No se dispone de benchmarks comparables comunes en la informacion proporcionada.

## Limitaciones y advertencias

- Sin alineacion ni formato de chat: el modelo no ha visto datos de instrucciones, por lo que una consulta directa no produce respuestas utiles en formato conversacional. Requiere fine-tuning o prompt engineering previo.
- Contexto limitado a 8.192 tokens: el soporte de contexto extendido (p. ej., 512k) se introdujo despues de este checkpoint y no esta disponible en TrueBase.
- Sin soporte de tool calling ni agentes: al carecer de post-entrenamiento, no dispone de capacidades de uso de herramientas ni de razonamiento agente.
- Riesgo de alucinacion: inherente a cualquier modelo de lenguaje; no hay tecnicas de mitigacion posentrenamiento.
- Sesgos no mitigados: al no haber pasado por RLHF ni DPO, los sesgos de los datos de preentrenamiento permanecen intactos.
- Licencia openmdw-1.1: se trata de una licencia personalizada. Los terminos exactos deben revisarse en el archivo LICENSE del repositorio antes de cualquier uso comercial.
- Reproducibilidad limitada: la informacion no especifica la composicion del dataset de preentrenamiento, lo que dificulta la reproducibilidad total.
- Despliegue costoso: el peso en bf16 supera los 797 GB, lo que exige infraestructura de multiples GPU de alto rendimiento.

## Enlaces

- Hugging Face: https://huggingface.co/CollectionStudio/Trinity-Large-TrueBase
- Informe tecnico de Trinity Large: https://github.com/arcee-ai/trinity-large-tech-report/
- Variante Trinity-Large-Thinking: https://huggingface.co/arcee-ai/Trinity-Large-Thinking
- Variante Trinity-Large-Base: https://huggingface.co/arcee-ai/Trinity-Large-Base
- Variante Trinity-Large-Preview: https://huggingface.co/arcee-ai/Trinity-Large-Preview
- Prime Intellect (socio de computacion): https://www.primeintellect.ai/
- Datology (socio de datos): https://www.datologyai.com/
