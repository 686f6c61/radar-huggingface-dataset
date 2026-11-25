# axteam/Qwen3.6-35B-A3B-NVFP4A16

## Resumen

Qwen3.6-35B-A3B-NVFP4A16 es una cuantizacion de 4 bits del modelo multimodal Qwen/Qwen3.6-35B-A3B, publicada por el usuario axteam. El modelo base, desarrollado por el equipo Qwen de Alibaba, es un transformer hibrido que combina atencion lineal (GatedDeltaNet/SSM) con atencion completa, y emplea una arquitectura de mezcla de expertos (MoE) con 256 expertos mas un experto compartido, con aproximadamente 3.000 millones de parametros activos sobre un total de 35.951.822.704. Ademas, incorpora una torre de vision y una cabeza de prediccion multi-token (MTP).

El objetivo de esta publicacion es ofrecer una version eficiente para servicio con vLLM: reduce el peso en disco hasta unos 25,0 GB frente a los 48,4 GB del repositorio en BF16, manteniendo las activaciones en BF16 (esquema W4A16). La cuantizacion es de tipo post-entrenamiento (PTQ) con suavizado AWQ sobre un conjunto de calibracion de 256 muestras, sin reentrenamiento.

La relevancia actual radica en que permite desplegar un modelo MoE multimodal de 35B con requisitos de memoria notablemente menores, a costa de una perdida de fidelidad medida del +2,8 % en perplejidad y un 93,9 % de acuerdo top-1 con el original. La revision del 1 de noviembre de 2026 reconstruyo los ficheros para compensar el router MoE y la compuerta del experto compartido durante el suavizado AWQ, un detalle critico para que el enrutamiento de tokens coincida con el del modelo original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer hibrido (atencion lineal GatedDeltaNet/SSM + atencion completa) con MoE, torre de vision y cabeza MTP |
| Parametros totales | 35.951.822.704 |
| Parametros activos | ~3B (256 expertos + 1 compartido) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | NVFP4A16 (W4A16, pesos FP4 E2M1, grupo 16, escala FP8 E4M3 + escala global FP32 por tensor, activaciones BF16); formato compressed-tensors `nvfp4-pack-quantized` |
| Idiomas soportados | no disponible (calibracion con corpus mixto con predominio de coreano) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (compressed-tensors) |

## Arquitectura y entrenamiento

El modelo base Qwen3.6-35B-A3B es un transformer hibrido que alterna capas de atencion lineal basadas en GatedDeltaNet/SSM con capas de atencion completa, lo que reduce el coste computacional en secuencias largas. La capa de mezcla de expertos contiene 256 expertos mas un experto compartido, con unos 3.000 millones de parametros activos por token sobre 35.951.822.704 totales. Incorpora ademas una torre de vision para entrada image-text-to-text y una cabeza de prediccion multi-token (MTP), habitualmente asociada a decodificacion especulativa. No se dispone de informacion sobre el volumen de tokens de entrenamiento, la composicion del dataset ni el uso de RLHF o DPO en la informacion proporcionada.

Esta publicacion concreta no reentrena el modelo: aplica cuantizacion post-entrenamiento NVFP4A16 con suavizado AWQ guiado por 256 muestras de calibracion. Los pesos se almacenan en FP4 (E2M1) con grupo de 16 y escala FP8 E4M3 mas una escala global FP32 por tensor, mientras que las activaciones permanecen en BF16. Se mantienen en BF16 la torre y el proyector de vision, la cabeza MTP, todas las RMSNorm, los embeddings de tokens, la LM head, el router MoE (`mlp.gate`), la compuerta del experto compartido y toda la ruta de atencion lineal (`linear_attn.*`), que representa aproximadamente el 9 % de los parametros, porque FP4 resulta demasiado grueso para los pesos del SSM. La revision del 1 de noviembre de 2026 corrigio la falta de compensacion del router y de la compuerta del experto compartido en la primera subida, que provocaba que los tokens se enrutaran a expertos distintos de los del original.

## Capacidades

- Generacion de texto y conversacion multi-turno.
- Razonamiento y respuesta a preguntas, incluyendo tareas de conocimiento general y de dominio coreano (KMMLU, HAE-RAE).
- Entrada multimodal image-text-to-text mediante torre de vision y proyector conservados en BF16.
- Razonamiento matematico basico (evaluado en GSM8K).
- Prediccion multi-token mediante cabeza MTP, orientada a decodificacion especulativa.
- Capacidades multilingues: no se detallan los idiomas soportados en la informacion disponible; la evaluacion incluye pruebas en ingles y coreano.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Modo thinking, audio u otras capacidades especiales: no disponible en la informacion proporcionada.

## Casos de uso

- Servicio de inferencia con vLLM en produccion: el formato compressed-tensors `nvfp4-pack-quantized` esta pensado explicitamente para vLLM (probado con la version 0.32.0), lo que permite desplegar el modelo con pesos FP4 y activaciones BF16 en GPUs con soporte de FP4.
- Asistentes multimodales con imagenes: la torre de vision y el proyector se mantienen en BF16, de modo que se puede usar el modelo para tareas image-text-to-text sin la perdida de calidad que supondria cuantizar la vision.
- Analisis de documentos y capturas en coreano e ingles: la calibracion con corpus con predominio de coreano y las evaluaciones en KMMLU y HAE-RAE lo hacen adecuado para tareas de comprension en esos idiomas.
- Despliegue con restricciones de memoria: al ocupar unos 25,0 GB en disco frente a los 48,4 GB del BF16, reduce los requisitos de VRAM y facilita el servicio en nodos con menos memoria por GPU.
- Evaluacion comparativa de tecnicas de cuantizacion: los datos medidos de perplejidad, acuerdo top-1 y benchmarks frente a FP8-dynamic, AWQ-8bit, NVFP4 y AWQ-4bit permiten usar el repositorio como referencia para estudiar el impacto de cada esquema.
- Prototipado de decodificacion especulativa: la cabeza MTP conservada en BF16 permite experimentar con prediccion multi-token sin degradacion por cuantizacion.
- Razonamiento y QA generico en ingles: con un promedio del 67,33 % (99,1 % de recuperacion frente al BF16) en el conjunto de benchmarks sin MMLU ni GSM8K, es utilizable para tareas de conocimiento general donde no se requiera la maxima fidelidad.

## Benchmarks y rendimiento

Resultados medidos con lm-evaluation-harness sobre vLLM, decodificacion greedy, prompts estilo completion sin plantilla de chat. MMLU corresponde a la variante generativa (`mmlu_generative`), no comparable con puntuaciones por log-likelihood. Los porcentajes indican recuperacion respecto al original BF16.

| Benchmark | BF16 (original) | FP8-dynamic | AWQ-8bit | NVFP4A16 (este repo) | NVFP4 | AWQ-4bit |
|---|---|---|---|---|---|---|
| MMLU (5-shot, generativo) | 64,44 | 67,45 (104,7 %) | 64,02 (99,3 %) | 69,31 (107,6 %) | 68,39 (106,1 %) | 74,12 (115,0 %) |
| GSM8K (5-shot, estricto) | 30,40 | 21,53 (70,8 %) | 28,81 (94,8 %) | 24,49 (80,5 %) | 46,55 (153,1 %) | 71,11 (233,9 %) |
| ARC-Challenge (0-shot) | 55,38 | 54,61 (98,6 %) | 55,46 (100,2 %) | 55,03 (99,4 %) | 56,23 (101,5 %) | 54,78 (98,9 %) |
| Winogrande (5-shot) | 76,32 | 75,37 (98,8 %) | 76,24 (99,9 %) | 74,43 (97,5 %) | 74,27 (97,3 %) | 75,85 (99,4 %) |
| KMMLU (5-shot, directo) | 65,14 | 64,86 (99,6 %) | 65,18 (100,1 %) | 64,50 (99,0 %) | 64,09 (98,4 %) | 64,61 (99,2 %) |
| HAE-RAE (0-shot) | 74,89 | 74,89 (100,0 %) | 75,07 (100,2 %) | 75,34 (100,6 %) | 74,06 (98,9 %) | 73,69 (98,4 %) |
| Promedio | 61,09 | 59,78 (97,9 %) | 60,80 (99,5 %) | 60,52 (99,1 %) | 63,93 (104,6 %) | 69,03 (113,0 %) |
| Promedio sin MMLU ni GSM8K | 67,93 | 67,43 (99,3 %) | 67,99 (100,1 %) | 67,33 (99,1 %) | 67,16 (98,9 %) | 67,23 (99,0 %) |

El autor advierte que MMLU y GSM8K se puntuan sobre texto generado y dependen del formato de respuesta: en este modelo oscilan ampliamente entre builds (MMLU 64,0-74,1; GSM8K 21,5-71,1), y dos builds cuantizados superan al BF16 original, lo que probablemente refleja el formato de respuesta mas que la calidad de la cuantizacion; no se verifico pregunta a pregunta.

Fidelidad al original BF16 en un conjunto interno mixto ingles/coreano de 100 prompts (medido con vLLM 0.32 el 1 de noviembre de 2026 sobre los ficheros reconstruidos):

| Metrica | Este modelo | BF16 original |
|---|---|---|
| Perplejidad (menor = mas cercano) | 1,3301 | 1,2934 (+2,8 %) |
| Acuerdo top-1 del siguiente token | 93,9 % | 98,0 % |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; el peso en disco es de aproximadamente 25,0 GB, por lo que se necesita al menos esa cantidad de memoria para los pesos, mas la memoria para activaciones BF16, cache KV y el estado del SSM.
- GPU recomendadas: no disponibles en la informacion proporcionada; el esquema NVFP4 requiere GPUs con soporte de FP4 (generaciones recientes de datacenter, como Blackwell). No se confirma compatibilidad con A100, H100 ni RTX 4090.
- Cabe en GPU de consumo: no disponible.
- Opciones de despliegue: vLLM, con la arquitectura incluida en vLLM >= 0.17.0 y probado con vLLM 0.32.0. No se mencionan llama.cpp, Ollama ni TGI; el formato compressed-tensors `nvfp4-pack-quantized` esta orientado a vLLM.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

Comparativa entre las distintas builds de cuantizacion del mismo modelo base, segun los datos medidos por el autor:

| Build | Formato | Tamano en disco | Promedio (sin MMLU/GSM8K) | Perplejidad | Licencia |
|---|---|---|---|---|---|
| BF16 (original) | BF16 | 48,4 GB (repo) | 67,93 | 1,2934 | Apache-2.0 |
| FP8-dynamic | FP8 | no disponible | 67,43 (99,3 %) | no disponible | Apache-2.0 |
| AWQ-8bit | W8 | no disponible | 67,99 (100,1 %) | no disponible | Apache-2.0 |
| NVFP4A16 (este repo) | W4A16 FP4 | ~25,0 GB | 67,33 (99,1 %) | 1,3301 (+2,8 %) | Apache-2.0 |
| NVFP4 | W4 FP4 | no disponible | 67,16 (98,9 %) | no disponible | Apache-2.0 |
| AWQ-4bit | W4 | no disponible | 67,23 (99,0 %) | no disponible | Apache-2.0 |

No se dispone de datos de otros modelos comparables de la misma categoria en la informacion proporcionada.

## Limitaciones y advertencias

- Perdida de fidelidad frente al BF16: +2,8 % de perplejidad y 93,9 % de acuerdo top-1 en el conjunto interno de evaluacion.
- GSM8K cae al 80,5 % de recuperacion respecto al original (24,49 frente a 30,40), por lo que el razonamiento matematico es un punto debil de esta build.
- Las puntuaciones de MMLU y GSM8K dependen fuertemente del formato de respuesta y varian ampliamente entre builds; no deben interpretarse como medida directa de calidad de la cuantizacion.
- La primera subida del repositorio (revision `0ab9e84`, anterior al 1 de noviembre de 2026 a las 06:58:47 UTC) tenia el router MoE y la compuerta del experto compartido sin compensar, lo que enrutaba tokens a expertos distintos de los del original; es imprescindible descargar la revision reconstruida.
- Sesgos conocidos: no disponibles en la informacion proporcionada.
- Riesgo de alucinacion: no cuantificado en la informacion proporcionada; aplica el riesgo habitual de los modelos generativos.
- Idiomas soportados: no detallados; la calibracion esta sesgada hacia coreano y la evaluacion se limita a ingles y coreano, por lo que el rendimiento en castellano no esta verificado.
- Longitud de contexto: no disponible.
- Restricciones de licencia: Apache-2.0, permite uso comercial segun los terminos del modelo base; consultar el fichero LICENSE del repositorio original.
- Requiere vLLM >= 0.17.0 (probado con 0.32.0) y hardware con soporte de FP4; no se garantiza su funcionamiento en otros runtimes.
- El tokenizador, la plantilla de chat y la configuracion de generacion son identicos al original; `config.json` anade un bloque `quantization_config`.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/axteam/Qwen3.6-35B-A3B-NVFP4A16
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B/blob/main/LICENSE
- lm-evaluation-harness: https://github.com/EleutherAI/lm-evaluation-harness
