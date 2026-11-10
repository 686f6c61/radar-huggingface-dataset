# nchapman/Qwen3.5-9B-W2.6A16-HGPTQ-RCO

## Resumen

Qwen3.5-9B-W2.6A16-HGPTQ-RCO es una cuantización extrema del modelo multimodal Qwen/Qwen3.5-9B, publicada por el usuario nchapman. Se trata de un checkpoint de aproximadamente 2,60 bits promedio por peso en el backbone de lenguaje, combinando capas en W4 y W2 según su sensibilidad, y manteniendo la cabeza de salida y el módulo MTP en 8 bits. El objetivo es claro: comprimir un modelo de 17,98 GiB en BF16 hasta 5,54 GiB para que quepa completo, incluyendo visión y decodificación especulativa, en una GPU de 8 GB.

La relevancia de esta ficha es doble. Por un lado, demuestra hasta dónde se puede llevar la cuantización post-entrenamiento con técnicas como Hadamard rotation, GPTQ con inicialización Cholesky y un esquema de co-diseño Riemanniano que selecciona qué grupos de capas mantener en 4 bits. Por otro, es un ejemplo práctico de cuantización de un modelo multimodal completo (texto, visión y MTP) compatible con vLLM sin parches, algo poco habitual en este rango de compresión.

El modelo base, Qwen3.5-9B, es un transformer multimodal con atención completa combinada con capas GatedDeltaNet de atención lineal, cabeza de salida no atada y un módulo MTP nativo para decodificación especulativa. La cuantización preserva estas capacidades con una degradación declarada de +0,47 % en perplejidad de holdout frente al BF16.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal con atención completa y GatedDeltaNet (atención lineal), módulo MTP nativo y vision encoder ViT de 27 bloques |
| Parametros totales | 8.283.664.112 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | W2A16, W4A16, W8 (grupo 64), con esquema mixto W2/W4 en backbone y W8 en cabeza de salida y fusión MTP |
| Idiomas soportados | no disponible (la evaluación incluye 9 idiomas en Belebele, pero no se lista el conjunto completo) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (4 shards, formato pack-quantized int32 compatible con compressed-tensors y vLLM) |

## Arquitectura y entrenamiento

El modelo base Qwen3.5-9B combina capas de atención completa con capas GatedDeltaNet de atención lineal, lo que reduce el coste de contexto largo. Incluye además un módulo MTP (Multi-Token Prediction) nativo que actúa como drafter para decodificación especulativa, y un encoder de visión ViT con 27 bloques más dos proyecciones de merger espacial. La cabeza de salida está desatada del embedding.

La cuantización se ha realizado con una pipeline denominada HGPTQ-RCO (Hadamard + Cholesky GPTQ con Riemannian Co-design). El backbone de lenguaje tiene 200 capas lineales agrupadas en 128 grupos fusionados de vLLM. De ellos, el 30 % más sensible se mantiene en W4 (65 lineales: 9 de 16 grupos de atención completa, 18 de 48 de GatedDeltaNet y 22 de 64 de MLP), seleccionados mediante Gumbel-Softmax Riemanniano no miope con 60 intercambios de grupo frente a la sensibilidad Hessiana greedy. El resto se cuantiza a 2 bits simétricos con rotación Hadamard y GPTQ con inicialización Cholesky, más 3 pasadas de descenso de coordenadas Hessiano (H-CD). La cabeza de salida y la fusión MTP se cuantizan a 8 bits con grupo 64. El módulo MTP (7 lineales transformer) y la visión (110 lineales) se mantienen en W4A16. La calibración usa el dataset `data/calib-cascade-v1.jsonl` y se aplica destilación KL de extremo a extremo sobre escalas continuas y RMSNorm/GDN gates con maestro FP32.

## Capacidades

- Generación de texto y razonamiento conversacional multi-turno.
- Comprensión de imágenes y respuesta a preguntas sobre ellas (pipeline image-text-to-text).
- Capacidades matemáticas y de ciencia, evaluadas en los probes de calibración (math, science).
- Decodificación especulativa nativa mediante el módulo MTP incluido en el checkpoint.
- Compatibilidad con vLLM sin parches gracias al formato compressed-tensors pack-quantized.
- Capacidades multilingües parciales: la evaluación incluye 9 idiomas en Belebele, aunque no se detalla la lista completa.
- Soporte de tool calling y function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Modo thinking explícito: no disponible en la información proporcionada.

## Casos de uso

- Despliegue multimodal en GPU de 8 GB: el checkpoint completo (texto, visión y MTP) ocupa 5,54 GiB, lo que deja unos 2,45 GiB para caché KV, visión, decodificación especulativa y CUDA graphs en tarjetas como RTX 3070, 4060, 4060 Ti 8GB o 5060. Es el caso de uso principal y el que justifica la compresión.
- Asistente visual en local para prototipos: al conservar el encoder ViT en W4 con un 90,73 % de acuerdo Top-1 de extremo a extremo frente al BF16, se puede usar para descripción de imágenes, OCR ligero o respuesta a preguntas visuales en entornos sin GPU de datacenter.
- Servicio de chat con contexto largo en hardware modesto: la combinación de atención lineal GatedDeltaNet y la compresión a 2,60 bits permite mantener conversaciones multi-turno en una sola GPU consumer, aunque la longitud exacta de contexto no está documentada.
- Generación aumentada con recuperación (RAG) en local: el modelo puede procesar documentos e imágenes recuperados y generar respuestas, con la ventaja de que el checkpoint completo cabe en memoria junto con un índice vectorial pequeño.
- Evaluación e investigación en cuantización extrema: sirve como referencia reproducible para estudiar el impacto de W2/W4 mixto con co-diseño Riemanniano, ya que el autor publica métricas detalladas de KL, perplejidad y acuerdo de MTP y visión.
- Decodificación especulativa en producción: el módulo MTP cuantizado a W4 conserva un 77,46 % de acuerdo Top-1 de extremo a extremo, lo que permite acelerar la generación en vLLM sin un drafter separado.
- Prototipado de agentes visuales en estaciones de trabajo: al ser compatible con endpoints y con vLLM stock, se puede integrar en pipelines de agentes que combinen texto e imagen sin necesidad de parchear el runtime.

## Benchmarks y rendimiento

| Evaluacion | BF16 base | W2.6A16-HGPTQ-RCO | Notas |
|---|---:|---:|---|
| Tamano safetensors | 17,98 GiB | 5,54 GiB | Compresión 3,24x (-12,44 GiB) |
| Divergencia de texto vs BF16 (probe-v4, KL ponderada / KL media por token) | 0,0000 | 0,2661 / 0,3435 | 378 prompts, 840k tokens; math 0,1048, science 0,1707, if 0,1979, chat 0,2261 |
| Perplejidad holdout general y multilingue (probe-guard) | 10,5645 | 10,6139 (+0,47 %) | 76 prompts, 20k tokens; KL media por token 0,3639, KL ponderada 0,4571, Belebele 9 idiomas KL 0,4559 |
| MTP nativo (drafter especulativo, 11.583 posiciones) | 100,0 % Top-1 (NLL 2,0275) | 94,86 % Top-1 aislado (NLL 2,0545) | KL MTP aislada 0,0105; Top-1 extremo a extremo 77,46 %, KL 0,4125 |
| Vision (vision-probe-v2, 48 imágenes, 151 tokens de respuesta) | 100,0 % Top-1 | 99,34 % Top-1 aislado, 90,73 % Top-1 E2E | KL ViT aislada 0,0073, KL E2E 0,1966; vision-guard-v2 E2E Top-1 85,93 %, KL 0,4518 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada: 5,54 GiB para el checkpoint completo (VLM + MTP); 5,11 GiB en variante solo texto. El autor indica que quedan unos 2,45 GiB libres en una GPU de 8 GB para caché KV, visión, MTP y CUDA graphs.
- GPU objetivo: 8 GB, como RTX 3070, RTX 4060, RTX 4060 Ti 8GB o RTX 5060.
- La variante W4A16-HGPTQ del mismo autor ocupa 6,67 GiB y está pensada para GPU de 10-12 GB o para 8 GB con contexto más corto.
- No cabe en GPU consumer de menos de 8 GB según los datos del autor.
- Despliegue: vLLM stock con compressed-tensors, sin parches; también transformers. Otras opciones como llama.cpp, Ollama o TGI no están confirmadas en la información disponible.
- Latencia y throughput: no disponibles. El autor solo reporta el acuerdo del drafter MTP (77,46 % Top-1 E2E), que afecta a la aceleración por decodificación especulativa, pero no cifras de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tamano en disco | Licencia | Notas |
|---|---:|---|---|---|---|
| Qwen3.5-9B-W2.6A16-HGPTQ-RCO (este) | 8,28 B | no disponible | 5,54 GiB (VLM+MTP) | Apache 2.0 | W2/W4 mixto, visión y MTP incluidos, vLLM stock |
| Qwen3.5-9B-W4A16-HGPTQ (mismo autor) | 8,28 B | no disponible | 6,67 GiB (VLM+MTP) | Apache 2.0 | W4 uniforme, pensado para 10-12 GB |
| Qwen/Qwen3.5-9B (base BF16) | 8,28 B | no disponible | 17,98 GiB | Apache 2.0 | Referencia de calidad, requiere GPU de 24 GB o más |

No se dispone de datos de benchmarks estándar comparables con otros modelos de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- La cuantización a 2 bits introduce divergencia medible: KL ponderada de 0,2661 en texto y +0,47 % de perplejidad en holdout. Aunque es pequeña, no es despreciable en tareas sensibles.
- El acuerdo del drafter MTP cae al 77,46 % Top-1 de extremo a extremo, lo que reduce la aceleración efectiva de la decodificación especulativa frente al BF16.
- El acuerdo de visión de extremo a extremo baja al 90,73 % Top-1 (frente al 99,34 % aislado), por lo que tareas visuales finas pueden degradarse más que el texto.
- La longitud de contexto no está documentada; no se debe asumir la del modelo base sin verificación.
- Los idiomas soportados no se listan; la evaluación cubre 9 idiomas en Belebele, pero no se especifica cuáles.
- Riesgo de alucinación: inherente al modelo base y potencialmente amplificado por la compresión extrema; no hay evaluación específica de factualidad en la información disponible.
- Sesgos conocidos: no documentados en la información proporcionada.
- Licencia Apache 2.0, permisiva para uso comercial, pero el autor no ofrece garantías sobre la calidad en producción.
- El checkpoint tiene 0 descargas y 0 likes en el momento de la ficha; es un artefacto reciente y sin validación comunitaria amplia.
- La compatibilidad con vLLM se declara sin parches, pero conviene verificar la versión concreta de vLLM y compressed-tensors, ya que el formato pack-quantized con grupos w2_g64, w4_g64 y w8_head requiere soporte específico.

## Enlaces

- Hugging Face: https://huggingface.co/nchapman/Qwen3.5-9B-W2.6A16-HGPTQ-RCO
- Variante W4A16 del mismo autor: https://huggingface.co/nchapman/Qwen3.5-9B-W4A16-HGPTQ
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
