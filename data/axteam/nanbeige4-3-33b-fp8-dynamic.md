# axteam/Nanbeige4.3-33B-FP8-dynamic

## Resumen

Nanbeige4.3-33B-FP8-dynamic es una versión cuantizada en FP8 del modelo Nanbeige4.3-33B, publicado por axteam como derivado del modelo original de Nanbeige. Se trata de un transformer denso con arquitectura Llama de 52 capas y 33.118.977.024 parámetros totales, orientado exclusivamente a generación de texto. La cuantización es W8A8 con esquema FP8_DYNAMIC sobre el formato compressed-tensors, pensada específicamente para servir el modelo con vLLM.

El interés de esta ficha no está en un modelo nuevo, sino en una receta de cuantización reproducible y verificada: el autor publica métricas de recuperación frente al original en BF16 (media del 99,6 % en seis benchmarks) y una comparación directa contra AWQ-8bit, NVFP4A16, NVFP4 y AWQ-4bit medidas con el mismo arnés. Para equipos que despliegan modelos de 33B en producción, esto permite reducir el peso en disco a unos 35,5 GB y activar FP8 en GPUs Ada, Hopper o Blackwell sin recalibrar.

La relevancia práctica es doble: por un lado, la licencia Apache 2.0 del modelo base permite uso comercial; por otro, el checkpoint incluye instrucciones de despliegue concretas (versión de vLLM, requisitos de driver, reducción opcional del KV cache a FP8) que ahorran buena parte del trabajo de puesta en marcha. El modelo base declara capacidades de razonamiento con modo thinking activado por defecto en el chat template.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso, arquitectura Llama, 52 capas, solo texto |
| Parametros totales | 33.118.977.024 |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada; el ejemplo de despliegue usa `--max-model-len 32768` |
| Tipos de cuantizacion | FP8 W8A8 (esquema FP8_DYNAMIC de compressed-tensors); pesos FP8 E4M3 con escala por canal, activaciones FP8 dinamicas por token en tiempo de ejecucion |
| Idiomas soportados | no disponible (la model card incluye ejemplos y evaluacion interna en ingles y coreano) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors con compressed-tensors (`float-quantized`) |

## Arquitectura y entrenamiento

El modelo base es un transformer denso de tipo Llama con 52 capas y 33.119 millones de parametros, sin mezcla de expertos. Esta version no reentrena ni ajusta el modelo: aplica cuantizacion post-entrenamiento (PTQ) sin datos de calibracion. Los pesos de las proyecciones de atencion y MLP se cuantizan a FP8 E4M3 con escala por canal de salida, mientras que las activaciones se cuantizan dinamicamente por token en tiempo de ejecucion. Se mantienen en BF16 los embeddings de tokens, la cabeza LM y todas las RMSNorm, de modo que solo se cuantiza el grueso computacional.

No se dispone de informacion sobre el dataset de preentrenamiento del modelo original, el numero de tokens, la composicion de los datos ni si hubo etapas de RLHF o DPO. Tampoco se documentan innovaciones de decodificacion especulativa ni mecanismos de atencion alternativa. La unica innovacion reseñable de este checkpoint es la propia receta de cuantizacion: sin calibracion, con escalas de activacion dinamicas y verificacion empirica de fidelidad frente al BF16 original (perplejidad 1,2376 frente a 1,2232, un 1,2 % superior; acuerdo top-1 del 96,4 % frente al 99,1 % del original).

## Capacidades

- Generacion de texto conversacional multi-turno, con chat template propio identico al del modelo original.
- Modo thinking activado por defecto en el chat template; se puede desactivar con `chat_template_kwargs={"enable_thinking": False}`.
- Razonamiento matematico: GSM8K 5-shot estricto con 83,24 puntos en esta version cuantizada.
- Conocimiento general y razonamiento: MMLU 5-shot con 35,55 puntos, ARC-Challenge 0-shot con 53,24 y Winogrande 5-shot con 66,85.
- Capacidades multilingues parciales: la evaluacion publicada incluye KMMLU (coreano, 27,93) y HAE-RAE (coreano, 37,86), ademas de pruebas en ingles.
- No se documenta soporte de tool calling ni function calling en la informacion disponible.
- No se documenta soporte explicito de agentes o razonamiento multi-paso mas alla del modo thinking.
- Modelo solo texto: sin vision ni audio.

## Casos de uso

- Servicio de chat en produccion con vLLM: el checkpoint esta disenado para `vllm serve` con API compatible con OpenAI, de modo que se puede exponer como endpoint de chat completions sin adaptadores adicionales.
- Despliegue con memoria ajustada en GPUs Ada u Hopper: al ocupar 35,5 GB en pesos FP8, un solo acelerador de 48 GB o 80 GB deja margen suficiente para KV cache y grafos CUDA en cargas moderadas.
- Razonamiento matematico asistido: con 83,24 en GSM8K, es adecuado para tutoria o resolucion de problemas aritmeticos de varios pasos, activando el modo thinking para cadenas de razonamiento largas.
- Procesamiento de documentos en coreano e ingles: las evaluaciones KMMLU y HAE-RAE indican competencia en coreano, lo que permite clasificacion, resumen o extraccion sobre corpus en esos idiomas.
- Sustitucion directa de un despliegue BF16 de 33B: la recuperacion media del 99,6 % en benchmarks y el acuerdo top-1 del 96,4 % permiten migrar reduciendo el peso a la mitad sin cambiar el tokenizador ni el chat template.
- Contextos largos con KV cache en FP8: activando `--kv-cache-dtype fp8` se reduce aproximadamente a la mitad la memoria de KV cache, lo que habilita ventanas de 32K tokens con mayor numero de peticiones concurrentes.
- Evaluacion comparativa de tecnicas de cuantizacion: el repositorio publica resultados homogeneos frente a AWQ-8bit, AWQ-4bit, NVFP4 y NVFP4A16, util como referencia para decidir el formato de despliegue.

## Benchmarks y rendimiento

Resultados medidos con lm-evaluation-harness sobre vLLM, decodificacion greedy, few-shot completion sin chat template. Entre parentesis, porcentaje de recuperacion frente al BF16 original.

| Benchmark | BF16 original | FP8-dynamic (este repo) | AWQ-8bit | NVFP4A16 | NVFP4 | AWQ-4bit |
|---|---|---|---|---|---|---|
| MMLU (5-shot) | 34,89 | 35,55 (101,9 %) | 35,05 (100,5 %) | 34,84 (99,9 %) | 35,28 (101,1 %) | 32,17 (92,2 %) |
| GSM8K (5-shot, strict) | 83,70 | 83,24 (99,5 %) | 82,71 (98,8 %) | 82,34 (98,4 %) | 82,03 (98,0 %) | 84,00 (100,4 %) |
| ARC-Challenge (0-shot) | 53,16 | 53,24 (100,2 %) | 53,75 (101,1 %) | 52,13 (98,1 %) | 52,99 (99,7 %) | 52,82 (99,4 %) |
| Winogrande (5-shot) | 67,48 | 66,85 (99,1 %) | 67,17 (99,5 %) | 66,30 (98,2 %) | 66,85 (99,1 %) | 67,72 (100,4 %) |
| KMMLU (5-shot, direct) | 28,46 | 27,93 (98,1 %) | 28,40 (99,8 %) | 29,71 (104,4 %) | 30,17 (106,0 %) | 29,73 (104,5 %) |
| HAE-RAE (0-shot) | 38,22 | 37,86 (99,0 %) | 37,67 (98,6 %) | 37,31 (97,6 %) | 38,31 (100,2 %) | 38,96 (101,9 %) |
| Media | 50,98 | 50,78 (99,6 %) | 50,79 (99,6 %) | 50,44 (98,9 %) | 50,94 (99,9 %) | 50,90 (99,8 %) |

Evaluacion de fidelidad sobre un conjunto interno mixto ingles/coreano de 100 prompts:

| Metrica | Este modelo | BF16 original |
|---|---|---|
| Perplejidad (menor es mejor) | 1,2376 | 1,2232 (+1,2 %) |
| Acuerdo top-1 en siguiente token | 96,4 % | 99,1 % |

## Requisitos de hardware

- VRAM para pesos: 35,5 GB en FP8. Hay que sumar KV cache (crece con longitud de contexto por peticiones concurrentes) y unos pocos GB para activaciones y grafos CUDA.
- GPUs con matematicas FP8 nativas (Ada, Hopper, Blackwell; sm89 en adelante): ejecutan W8A8 completo. El autor solo verifico el despliegue en una B200.
- GPUs Turing (sm75, por ejemplo T4) y Ampere: vLLM cambia automaticamente a FP8 solo de pesos. V100 (sm70) no esta soportado.
- Multi-GPU: usar `--tensor-parallel-size N` cuando los pesos no caben en una sola GPU.
- No cabe en GPUs de consumo de 24 GB en esta precision; requeriria una cuantizacion de 4 bits del modelo base, no incluida en este repositorio.
- Despliegue recomendado: vLLM 0.32.0 (probado), con Python 3.11-3.14, torch 2.13 con build CUDA 13.0, transformers >=5.16.1,<5.20 y compressed-tensors 0.17.0. No se necesita `trust_remote_code`.
- Alternativa sin vLLM: transformers >=4.56.0 con compressed-tensors >=0.15.0; el autor no lo probo para este modelo.
- Reduccion opcional de KV cache: `--kv-cache-dtype fp8` reduce aproximadamente a la mitad la memoria de KV cache.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Nanbeige4.3-33B-FP8-dynamic (este) | 33,1B | no disponible (ejemplo a 32K) | FP8 W8A8, compressed-tensors | Apache 2.0 | Media de 50,78 en los seis benchmarks del autor |
| Nanbeige4.3-33B (BF16 original) | 33,1B | no disponible | BF16 safetensors | Apache 2.0 | Referencia de recuperacion; media 50,98 |
| AWQ-8bit del mismo base | 33,1B | no disponible | AWQ 8 bits | Apache 2.0 | Media 50,79; requiere kernel AWQ, no FP8 nativo |
| NVFP4 del mismo base | 33,1B | no disponible | NVFP4 | Apache 2.0 | Media 50,94; mejor en KMMLU, peor en GSM8K |

No se dispone de datos para comparar con modelos de otras familias de tamano similar en la informacion proporcionada.

## Limitaciones y advertencias

- Perdida de fidelidad medible: perplejidad un 1,2 % superior y acuerdo top-1 del 96,4 % frente al 99,1 % del BF16. En tareas de generacion larga o muy sensible a la distribucion exacta, conviene validar contra el original.
- MMLU de 35,55 puntos: el conocimiento general del modelo base es bajo en terminos absolutos, por debajo de modelos de 33B mas recientes. No es adecuado como modelo de conocimiento enciclopedico.
- KMMLU y HAE-RAE en torno a 28 y 38 puntos respectivamente: el rendimiento en coreano es limitado y no debe asumirse paridad con modelos especializados en ese idioma.
- Idiomas soportados no declarados en la model card; la evaluacion solo cubre ingles y coreano. El comportamiento en castellano no esta verificado.
- Riesgo de alucinacion no cuantificado en la informacion disponible; al ser un modelo de 33B con MMLU bajo, el riesgo en dominios factuales es relevante.
- Sesgos conocidos: no documentados por el autor.
- Restricciones de licencia: Apache 2.0 en el modelo base y en el derivado, lo que permite uso comercial, pero se recomienda revisar los terminos del modelo original y de los datos de entrenamiento no publicados.
- Dependencia estricta de versiones: vLLM 0.32.0 fija transformers y compressed-tensors; el autor advierte de no actualizar compressed-tensors por separado (el checkpoint se guardo con 0.19.0 y se lee con 0.17.0).
- El soporte FP8 completo requiere hardware Ada, Hopper o Blackwell; en Turing y Ampere se degrada a solo pesos, con impacto en latencia no medido aqui.
- El modo thinking esta activado por defecto, lo que incrementa tokens de salida y coste si no se desactiva explicitamente.
- Repositorio con 25 descargas y 0 likes en el momento de la consulta: ecosistema de validacion muy reducido.

## Enlaces

- Hugging Face (este checkpoint): https://huggingface.co/axteam/Nanbeige4.3-33B-FP8-dynamic
- Modelo base: https://huggingface.co/Nanbeige/Nanbeige4.3-33B
- lm-evaluation-harness: https://github.com/EleutherAI/lm-evaluation-harness
- vLLM: https://github.com/vllm-project/vllm
- compressed-tensors: https://github.com/neuralmagic/compressed-tensors
