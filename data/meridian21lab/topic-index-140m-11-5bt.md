# Meridian21Lab/topic-index-140m-11.5bt

## Resumen

topic-index-140m-11.5bt es un modelo de lenguaje base en inglés de 141,5 millones de parámetros desarrollado por Meridian21Lab dentro del proyecto MrCogito. Entrenado desde cero sobre 11,5 mil millones de tokens de datos públicos con un coste aproximado de 290 dólares, su rasgo diferencial es la capa de lectura de largo alcance denominada Latent Sparse Attention (LSA), método propuesto por Kubicek et al. (Prefrontal AI y ETH Zúrich, arXiv 2610.42147). LSA agrupa los tokens ya leídos en conjuntos de contenido relacionado y, para predecir cada siguiente palabra, recupera los grupos más afines y relee esos tokens literalmente, funcionando como un índice temático sobre el contexto.

El modelo se publica como investigación abierta: es un modelo base, con una sola semilla de entrenamiento y sin ajuste por instrucciones. Meridian21Lab entrena varias variantes con los mismos datos, orden, presupuesto y capas, cambiando únicamente la capa de lectura, lo que permite comparaciones controladas; la otra variante publicada es concept-memory-140m-11.5bt. Su interés actual reside en que demuestra que un modelo de 140M puede igualar en recuperación de hechos en contexto largo (RULER a 8k: 0,54) a modelos de 350M entrenados con hasta 1.300 veces más tokens, con un coste de entrenamiento muy bajo.

La arquitectura es un transformer con atención latente dispersa (tipo perceiver_ar con código personalizado), contexto de entrenamiento de 64k tokens, licencia Apache 2.0 y pesos en safetensors. Está pensado para evaluación e investigación sobre contexto largo, no para despliegue conversacional directo sin ajuste posterior.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con Latent Sparse Attention (LSA); tipo perceiver_ar, requiere `trust_remote_code=True` |
| Parametros totales | 141.506.176 (141,5M) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 64k tokens en entrenamiento; evaluado hasta 128k |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo de 0,6 GB) |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de 141,5M de parámetros cuya innovación principal es la capa de Latent Sparse Attention: en lugar de una atención densa sobre todo el contexto, agrupa los tokens previos en conjuntos de contenido afín y, en cada paso de generación, selecciona los grupos más relevantes y relee esos tokens de forma explícita. Esta operación actúa como un índice temático sobre el historial, de ahí el nombre del modelo. La implementación es un port propio de la arquitectura de los autores de LSA, entrenado desde cero, no un fine-tuning de sus pesos.

El entrenamiento consumió 11,5B tokens de datos públicos procedentes de Nemotron-CC-v2, Nemotron-CC-Math-v1, Nemotron-Pretraining-Specialized-v1, dclm-edu, subconjuntos filtrados de Common Pile (Stack v2 edu, Project Gutenberg, arXiv, DOAB, USGPO, UK Hansard), dolma3_longmino_pool y smol-smoltalk. El coste fue de aproximadamente 36 horas en un nodo de 4 GPU (unos 290 dólares). No se menciona RLHF ni DPO: es un modelo base sin ajuste por instrucciones. Todos los registros de entrenamiento están publicados en W&B.

## Capacidades

- Generación de texto autoregresiva en inglés, como modelo base sin ajuste instructivo.
- Recuperación de información en contexto largo: localización de hechos ocultos en documentos de hasta 64k tokens (y evaluación hasta 128k).
- Razonamiento multi-salto sobre documentos largos: mejora especialmente cuando se preguntan varios hechos a la vez (+0,12 a +0,34 frente a concept-memory en RULER).
- Conteo de palabras y agregación sobre el texto completo del contexto (+0,11 a +0,25 frente a la variante concept-memory).
- Modelado de lenguaje y gramática: perplejidad de 1,95 (byte perplexity en WikiText-2) y 80,11 % en BLiMP.
- Conocimiento factual básico: 48,4 % en ARC-Easy a 0-shot.
- No dispone de tool calling, function calling, capacidades de agente, visión, audio ni modo thinking: la model card no los declara.
- Capacidad multilingüe limitada al inglés.

## Casos de uso

- Recuperación de hechos en documentos largos: ingerir contratos, informes o expedientes de hasta 64k tokens y consultar datos concretos enterrados en el texto; el modelo localiza hechos lejanos con una puntuación RULER de 0,54 a 8k, a la altura de modelos de 350M.
- Investigación sobre atención eficiente: servir como referencia reproducible (mismos datos, mismo presupuesto, misma semilla) para comparar LSA frente a memoria de conceptos u otras capas de lectura en experimentos controlados.
- Base para fine-tuning ligero: al ser un modelo base Apache 2.0 de 141M, puede adaptarse con LoRA para tareas específicas de dominio (legal, administrativo, técnico) sobre hardware modesto.
- Preguntas agregadas sobre corpus largos: contar ocurrencias, resumir listas o cruzar múltiples hechos dispersos en un mismo documento, escenario donde la ventaja frente a concept-memory es mayor (+0,12 a +0,34 en RULER multi-hecho).
- Evaluación de modelos pequeños en producción: banco de pruebas barato para medir si un modelo de 140M basta para una tarea de lectura larga antes de escalar a modelos mayores.
- Procesamiento por lotes de documentación: analizar lotes de documentos de 64k tokens en una sola pasada sobre una RTX 3090 de 24 GB, útil para pipelines de extracción de información a bajo coste.
- Educación e investigación académica: estudiar el comportamiento de la atención dispersa latente y la degradación con la longitud de contexto (de 0,54 a 4k-8k hasta 0,39 a 32k) sin necesidad de clústeres grandes.

## Benchmarks y rendimiento

Resultados declarados por el autor (no verificados de forma independiente):

| Benchmark | Metrica | topic-index-140m | Referencia |
|---|---|---|---|
| BLiMP (67 sets, 0-shot) | accuracy (%) | 80,11 | concept-memory-140m: 80,56 |
| ARC-Easy (0-shot) | accuracy (%) | 48,40 | No disponible para comparativas |
| WikiText-2 | byte perplexity | 1,950 | concept-memory-140m: 1,950 |
| Media de 7 tareas estándar | accuracy (%) | 46,5 | concept-memory-140m: 46,2 |
| RULER @ 4k | score | 0,54 | Granite 4.0 350M: 0,62; LFM2.5-350M-Base: no disponible a 4k; Gemma 3 270M: no disponible a 4k; SmolLM2-135M: no disponible a 4k |
| RULER @ 8k | score | 0,54 | Granite 4.0 350M: 0,54; LFM2.5-350M-Base: 0,42; Gemma 3 270M: 0,33; SmolLM2-135M: 0,30 |
| RULER @ 16k | score | 0,44 | concept-memory-140m: 0,37 |
| RULER @ 32k | score | 0,39 | concept-memory-140m: 0,32 |
| Documentos de 64k (últimas páginas) | bits por byte (menor es mejor) | 0,797 | concept-memory-140m: 0,795; Gemma 3 270M: 0,805; SmolLM2-135M: 0,832; Pythia-160M: 0,942 |
| 128k tokens (2x longitud de entrenamiento) | nats por token | Mejora de 0,025 frente a concept-memory en 13 de 15 documentos | concept-memory-140m: referencia |

## Requisitos de hardware

- VRAM para inferencia: el modelo ocupa 0,6 GB en safetensors; en fp16 requiere aproximadamente 0,3 GB de pesos más memoria para activaciones y caché de contexto largo. La model card indica que puntúa un documento completo de 64k tokens en una sola pasada en una RTX 3090 de 24 GB.
- GPU recomendadas: RTX 3090 (24 GB) es suficiente para 64k tokens; cualquier GPU consumer con 8-16 GB debería bastar para contextos más cortos, aunque el dato exacto no está publicado.
- Cabe en GPU consumer: sí, según la model card, en una RTX 3090 a 64k tokens.
- Opciones de despliegue: carga con `AutoModelForCausalLM.from_pretrained(..., trust_remote_code=True)` en transformers. No se mencionan integraciones con vLLM, llama.cpp, Ollama o TGI; el código personalizado de LSA probablemente limita el soporte directo en esos motores.
- Entrenamiento: aproximadamente 36 horas en un nodo de 4 GPU, con un coste de unos 290 dólares.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | RULER @ 8k | Tokens de entrenamiento | Licencia |
|---|---|---|---|---|---|
| topic-index-140m-11.5bt | 141,5M | 64k (eval. 128k) | 0,54 | 11,5B | Apache 2.0 |
| concept-memory-140m-11.5bt | ~140M | 64k | 0,44 | 11,5B | Apache 2.0 |
| Granite 4.0 350M | 350M | No disponible | 0,54 (0,62 a 4k) | ~15T | No disponible |
| LFM2.5-350M-Base | 350M | No disponible | 0,42 | 28T | No disponible |
| Gemma 3 270M | 270M | No disponible | 0,33 | 6T | No disponible |
| SmolLM2-135M | 135M | No disponible | 0,30 | ~2T | No disponible |
| Pythia-160M | 160M | No disponible | No disponible (peor en tareas estándar y 64k) | No disponible | No disponible |

## Limitaciones y advertencias

- Es un modelo base sin ajuste por instrucciones: no sigue instrucciones de forma fiable sin fine-tuning o prompting adecuado.
- Solo entiende inglés; no hay soporte multilingüe declarado.
- Riesgo de alucinación inherente a un modelo de 141M entrenado con 11,5B tokens: su conocimiento factual es limitado (48,4 % en ARC-Easy).
- El rendimiento en RULER decae con la longitud: 0,54 a 4k-8k, 0,44 a 16k y 0,39 a 32k.
- Entrenado con una sola semilla y publicado como investigación; no hay validación independiente de los benchmarks declarados.
- Requiere `trust_remote_code=True` por el código personalizado de LSA, lo que implica ejecutar código del autor y limita la compatibilidad con motores de inferencia estándar.
- Licencia Apache 2.0 permite uso comercial, pero al ser un modelo base los resultados en producción dependerán del ajuste posterior; no hay garantías de calidad para aplicaciones sensibles.
- No dispone de tool calling, agentes, visión ni otras capacidades multimodales.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Meridian21Lab/topic-index-140m-11.5bt
- Variante concept-memory-140m-11.5bt: https://huggingface.co/Meridian21Lab/concept-memory-140m-11.5bt
- Página del proyecto MrCogito: https://ai.ksopyla.com/projects/concept-reasoning/
- Código (MrCogito): https://github.com/ksopyla/MrCogito/tree/1fddc505
- Detalles de evaluación: EVALUATION.md (en el repositorio del modelo)
- Entrenamiento en W&B: https://wandb.ai/ksopyla/MrCogito/runs/perceiver_ar_perceiver_H896L3g1s9N128_20261118_083324_lsa_m120t_long
- Paper de Latent Sparse Attention: https://arxiv.org/abs/2610.42147
- Código de LSA (Prefrontal AI): https://github.com/Prefrontal-AI/latent-sparse-attention
