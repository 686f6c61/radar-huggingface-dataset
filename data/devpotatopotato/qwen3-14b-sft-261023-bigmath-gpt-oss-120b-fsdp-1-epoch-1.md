# devpotatopotato/qwen3-14b-sft-261023-bigmath-gpt-oss-120b-fsdp-1-epoch-1

## Resumen

Este modelo es un ajuste fino (SFT) de Qwen3 14B publicado por el usuario devpotatopotato en Hugging Face. El nombre del repositorio indica que se trata de una destilación por afinamiento supervisado sobre el dataset BigMath, utilizando gpt-oss-120b como modelo profesor, entrenado con FSDP durante una única época. El resultado es un modelo de generación de texto conversacional de 14.768 millones de parámetros, con licencia Apache 2.0.

Su relevancia radica en la línea de trabajo de destilación de modelos de razonamiento grandes hacia modelos abiertos de tamaño medio: transferir las capacidades matemáticas y de razonamiento de un modelo profesor de gran escala (gpt-oss-120b) a una base eficiente como Qwen3 14B, ejecutable en hardware de consumo. Al tratarse de un checkpoint de experimento comunitario, la documentación publicada es mínima: la model card no incluye detalles de entrenamiento, benchmarks ni instrucciones de uso, por lo que varios datos de esta ficha se marcan como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (familia Qwen3), no disponible el detalle exacto |
| Parametros totales | 14.768.307.200 (≈14,8 B, dato real de safetensors) |
| Parametros activos | No aplicable (no es MoE) |
| Longitud de contexto | No disponible (la base Qwen3 14B soporta 32.768 tokens, ampliable a 131.072 con YaRN, pero no consta en la model card) |
| Tipos de cuantizacion | No disponible (solo pesos en bf16/fp16, 59,1 GB de repo) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen3 14B, un transformer decoder denso (no MoE) de la familia Qwen3 de Alibaba, y aplica un ajuste fino supervisado (SFT) de una época. Según el nombre del repositorio, el entrenamiento se realizó con FSDP (Fully Sharded Data Parallel), la estrategia de paralelismo de PyTorch para entrenar modelos grandes repartiendo parámetros, gradientes y estados del optimizador entre varias GPU.

Los datos de entrenamiento corresponden a BigMath, un dataset de problemas matemáticos de razonamiento complejo, con trazas generadas por gpt-oss-120b como modelo profesor. Esto sugiere una destilación de capacidades de razonamiento matemático del profesor al alumno mediante datos sintéticos de alta calidad. No se ha publicado información sobre el número exacto de ejemplos, hiperparámetros (learning rate, tamaño de batch), uso de RLHF/DPO posterior, ni fecha y duración del entrenamiento.

## Capacidades

- Generacion de texto conversacional (pipeline text-generation, tag conversational).
- Razonamiento y resolucion de problemas matematicos, reforzados por el ajuste fino sobre BigMath con trazas de un modelo profesor de 120B.
- Compatibilidad con la libreria transformers de Hugging Face y con text-generation-inference (endpoints_compatible).
- Hereda presumiblemente las capacidades de la base Qwen3 14B (codigo, razonamiento general, multilingüe), aunque no esta verificado en la model card.
- No hay informacion publicada sobre tool calling, agentes, vision, audio ni thinking mode para este checkpoint concreto.

## Casos de uso

- Resolucion de problemas matematicos: el afinamiento sobre BigMath lo orienta a generar soluciones paso a paso de problemas de algebra, calculo o olimpiadas, aprovechando trazas de razonamiento destiladas de un modelo mucho mayor.
- Asistente de razonamiento en local: con ~14,8 B de parametros puede ejecutarse en una GPU de consumo cuantizado, util para prototipar chatbots con capacidad de razonamiento sin depender de APIs externas.
- Investigacion en destilacion: sirve como punto de comparacion para estudiar cuanto conocimiento matematico transfiere un SFT de una epoca desde un profesor de 120B a un alumno de 14B.
- Generacion de soluciones verificables: en pipelines de evaluacion matematica (estilo GSM8K o MATH), puede usarse como generador cuyas respuestas se validan programaticamente.
- Base para afinamientos posteriores: al ser un checkpoint abierto con Apache 2.0, puede continuar entrenandose (DPO, RLHF) para dominios concretos.
- Experimentacion con FSDP: el propio nombre del repo lo hace util como referencia reproducible de entrenamientos con Fully Sharded Data Parallel.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye evaluaciones en MMLU, GSM8K, MATH, HumanEval ni ninguna otra metrica, ni comparativas con el modelo base Qwen3 14B o con el profesor gpt-oss-120b.

## Requisitos de hardware

- VRAM estimada para inferencia en precision completa (bf16): aproximadamente 30 GB solo para los pesos (14,8 B x 2 bytes), mas overhead de KV cache; una GPU de 40-48 GB es lo comfortable.
- Con cuantizacion de 4 bits (si se genera un GGUF o AWQ, no publicado en el repo): alrededor de 9-10 GB, ejecutable en una RTX 3090, RTX 4090 o RTX 5090 de 24 GB con holgura para contexto.
- En fp16 sin cuantizar cabe en una A100 40GB/80GB, H100 o una RTX A6000; no cabe en GPUs de consumo de 24 GB sin cuantizar.
- Despliegue: transformers (libreria nativa), text-generation-inference (marcado como endpoints_compatible) y, con conversion manual a GGUF, llama.cpp u Ollama; vLLM es viable al ser una arquitectura Qwen3 estandar.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| qwen3-14b-sft-261023-bigmath (este) | 14,8 B (denso) | No disponible | Apache 2.0 | SFT matematico de comunidad, sin benchmarks publicados |
| Qwen3 14B (base oficial) | 14,8 B (denso) | 32.768 (131.072 con YaRN) | Apache 2.0 | Modelo base, soporte thinking mode y multilingüe documentado |
| gpt-oss-120b (profesor) | 120 B (MoE, ~5,1 B activos) | 128.000 | Apache 2.0 | Mucho mayor capacidad de razonamiento, requiere hardware multi-GPU |
| Qwen2.5-Math-7B-Instruct | 7 B (denso) | 4.096 | Qwen (uso comercial restringido >100M MAU) | Especializado en matematicas, mas ligero |

## Limitaciones y advertencias

- Checkpoint de experimento comunitario: la model card esta practicamente vacia, sin instrucciones de uso, plantilla de chat ni hiperparametros; hay que inferir el formato de prompt de la familia Qwen3.
- Sin benchmarks publicados: no hay garantias de que el SFT mejore realmente a la base Qwen 14B; puede incluso haber sufrido regresion en capacidades generales por el entrenamiento monotematico en matematicas (catastrofico forgetting parcial).
- Riesgo de alucinacion: no evaluado; al heredar de Qwen3 y estar afinado con datos sinteticos de un profesor, puede reproducir errores de razonamiento del profesor.
- Sesgos: no documentados; hereda los de Qwen3 y los de gpt-oss-120b y el dataset BigMath.
- Idiomas y longitud de contexto: no confirmados para este checkpoint concreto.
- Licencia Apache 2.0: permite uso comercial sin restricciones relevantes, aunque los terminos de la base Qwen3 y del dataset BigMath deben revisarse para usos en produccion.
- Repo de 59,1 GB: descarga y almacenamiento considerables para un modelo de 14,8 B (posible inclusion de pesos del optimizador o checkpoints intermedios de FSDP).
- Baja traccion comunitaria (408 descargas, 0 likes): escaso feedback de terceros sobre calidad y estabilidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/devpotatopotato/qwen3-14b-sft-261023-bigmath-gpt-oss-120b-fsdp-1-epoch-1
- Base Qwen3 14B: https://huggingface.co/Qwen/Qwen3-14B
- Profesor gpt-oss-120b: https://huggingface.co/openai/gpt-oss-120b
- Dataset BigMath: https://huggingface.co/datasets/SynthLabsAI/Big-Math-RL-Verified (referencia aproximada; el dataset exacto usado no esta confirmado en la model card)
- Paper, blog o demo oficiales: no disponibles
