# credible-ai/qwen3.5-4B-40domains-vertex-linear-gsm8k

## Resumen

`credible-ai/qwen3.5-4B-40domains-vertex-linear-gsm8k` es un modelo de lenguaje de 3.700 millones de parametros (3.699.158.016 segun los pesos en safetensors) entrenado desde cero con una arquitectura tipo Qwen3.5 (`Qwen3_5ForCausalLM`, 32 capas, hidden size 2560). Lo publica el grupo credible-ai como artefacto de investigacion para reproducir los experimentos del articulo LinMix (arXiv:2610.37390), no como modelo de proposito general.

El interes del modelo no reside en sus capacidades, sino en su receta de mezcla de datos: fue preentrenado con 80.000 millones de tokens procedentes de WebOrganizer/Corpus-200B, Stack-Edu (los 15 subconjuntos de lenguajes de programacion) y Nemotron-CC-Math-v1, repartidos en 40 dominios (24 topicos de WebOrganizer, 15 lenguajes y matematicas) con pesos optimizados por LinMix especificamente para la tarea GSM8K. LinMix ajusta un surrogate lineal sobre un enjambre de modelos proxy (en este caso, el modelo de 100M de la misma familia) para atribuir utilidad a cada dominio.

Es relevante ahora porque ejemplifica una linea de trabajo creciente: usar modelos pequenos como proxy para decidir la mezcla de datos de modelos mayores, reduciendo el coste de experimentacion. Su tokenizer es GPT-NeoX-20B (vocabulario de 50.432 entradas) y el entrenamiento se realizo con OLMo-core. La licencia de los pesos es MIT, aunque los datos de entrenamiento arrastran terminos adicionales de Common Crawl, The Stack v2 y el acuerdo de NVIDIA.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only tipo Qwen3.5 (`Qwen3_5ForCausalLM`), 32 capas, hidden size 2560 |
| Parametros totales | 3.699.158.016 (aproximadamente 3,7B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en bfloat16; no se documentan GGUF ni otras variantes) |
| Idiomas soportados | en (ingles) |
| Licencia | MIT (pesos); datos sujetos a terminos de Common Crawl, The Stack v2 y NVIDIA Data Agreement |
| Formato de pesos | safetensors (bfloat16) |
| Tokenizer | GPT-NeoX-20B, vocabulario de 50.432 |
| Tokens de entrenamiento | 80.000 millones |
| Framework de entrenamiento | OLMo-core |
| Version minima de transformers | 5.2 |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only denso con la configuracion de Qwen3.5: 32 capas, hidden size de 2560 y aproximadamente 3,7B de parametros, entrenado desde cero (no es un fine-tune de un modelo Qwen existente). Emplea el tokenizer de GPT-NeoX-20B con un vocabulario de 50.432 tokens, lo que lo aleja del tokenizer nativo de la familia Qwen y condiciona su comportamiento en tareas multilingues.

El entrenamiento cubre 80.000 millones de tokens mezclados sobre 40 dominios: 24 topicos del corpus WebOrganizer (derivado del pool DCLM 1b-1x), los 15 subconjuntos de lenguajes de programacion de Stack-Edu y el subconjunto `4plus` de Nemotron-CC-Math-v1. Los pesos de la mezcla se optimizaron con LinMix, un metodo que ajusta un surrogate lineal sobre un enjambre de modelos proxy (el `qwen3.5-100M-40domains-vertex` de la misma familia) con utilidad lineal (r = 0) y objetivo GSM8K. El pipeline se ejecuto con OLMo-core. No se documenta en la informacion disponible el uso de RLHF, DPO ni fases de post-entrenamiento.

## Capacidades

- Generacion de texto autoregresiva en ingles con `transformers` (clase `Qwen3_5ForCausalLM`).
- Razonamiento aritmetico basico orientado a GSM8K, ya que la mezcla de datos se optimizo explicitamente para ese benchmark.
- Generacion de codigo en los 15 lenguajes cubiertos por Stack-Edu, con presencia reforzada por la mezcla de dominios.
- Resolucion de problemas matematicos de estilo escolar gracias al subconjunto `4plus` de Nemotron-CC-Math-v1.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: limitadas al ingles segun la model card.
- Capacidades especiales (thinking mode, vision, audio): no disponible.

## Casos de uso

- Reproduccion de experimentos de mezcla de datos: el modelo sirve para replicar los resultados del articulo LinMix sobre GSM8K y comparar la mezcla optimizada frente a mezclas uniformes o heuristicas.
- Investigacion sobre atribucion de dominios: permite estudiar como contribuye cada uno de los 40 dominios (topicos web, lenguajes, matematicas) al rendimiento final en una tarea concreta.
- Baseline en estudios de scaling de mezclas: al existir un proxy de 100M de la misma familia, se puede analizar la transferibilidad de las decisiones de mezcla entre escalas.
- Evaluacion de corpus web filtrados: util para medir el impacto de WebOrganizer/Corpus-200B en tareas de razonamiento aritmetico frente a corpus curados.
- Experimentos de tokenizer: al usar GPT-NeoX-20B en lugar del tokenizer nativo de Qwen, sirve para analizar el efecto del vocabulario en modelos de ~4B.
- Docencia y formacion en data mixing: modelo pequeno y con receta publica (`mix.json` incluido) que se puede entrenar o inspeccionar en entornos academicos con recursos limitados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tablas de MMLU, HumanEval, GSM8K ni de ninguna otra evaluacion, mas alla de indicar que la mezcla se optimizo para GSM8K.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 7,4 GB solo para pesos, mas overhead de activaciones y KV cache; en la practica, entre 10 y 12 GB para secuencias cortas.
- VRAM estimada en cuantizacion de 8 bits (si se genera): alrededor de 4 GB; en 4 bits, alrededor de 2,5 GB. No se distribuyen pesos cuantizados oficiales.
- GPU recomendadas: A100 40GB, H100, L40S o RTX 4090 para bfloat16; RTX 3090/4080 tambien son viables para inferencia en precision completa con contexto moderado.
- Cabe en GPU de consumo: si, en RTX 4090, RTX 4080, RTX 3090 y tarjetas con 12 GB o mas en bfloat16; en 8 GB requeriria cuantizacion no oficial.
- Opciones de despliegue: `transformers` >= 5.2 es el unico soportado oficialmente segun la model card. No se documenta soporte en vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque | Disponibilidad |
|---|---|---|---|---|---|
| credible-ai/qwen3.5-4B-40domains-vertex-linear-gsm8k | 3,7B | no disponible | MIT | Investigacion de mezcla de datos (LinMix) | HuggingFace |
| credible-ai/qwen3.5-100M-40domains-vertex | ~100M | no disponible | no disponible | Proxy de la misma familia para LinMix | HuggingFace |
| Qwen3.5 base (familia) | no disponible | no disponible | no disponible | Modelo de proposito general | HuggingFace |
| OLMo 2 7B | ~7B | no disponible | Apache 2.0 | Modelo abierto de proposito general | HuggingFace |

La comparacion con modelos de proposito general no es directa: este modelo es un artefacto de investigacion sin post-entrenamiento ni evaluaciones publicadas, por lo que no compite en calidad con Qwen3.5 o OLMo 2 en tareas abiertas. Su comparable natural es el proxy de 100M de la misma familia, usado para derivar la mezcla.

## Limitaciones y advertencias

- Modelo de investigacion: el autor lo describe explicitamente como artefacto para reproducir experimentos, no como modelo de proposito general.
- Solo ingles: la model card declara unicamente `en` como idioma soportado.
- Sin post-entrenamiento documentado: no hay RLHF, DPO ni instruction tuning, por lo que no cabe esperar buen comportamiento en formato conversacional ni seguimiento de instrucciones.
- Riesgo de alucinacion elevado: al ser un modelo base pequeno y sin alineacion, la generacion puede ser incoherente o factualmente incorrecta.
- Sesgos: los datos provienen de Common Crawl (DCLM), Stack-Edu y Nemotron-CC-Math, con los sesgos propios de corpus web y de codigo; no se documentan mitigaciones.
- Contexto: no se especifica la longitud de contexto entrenada, lo que impide garantizar un rendimiento fiable en secuencias largas.
- Licencia: los pesos son MIT, pero el uso comercial debe considerar los terminos de Common Crawl, The Stack v2 y el NVIDIA Data Agreement aplicables a los datos de entrenamiento.
- Ecosistema: requiere `transformers` >= 5.2 y no hay soporte documentado en motores de inferencia alternativos, lo que limita el despliegue en produccion.
- Tokenizer no nativo de Qwen: el uso de GPT-NeoX-20B puede degradar el rendimiento en textos no ingleses y en tokenizacion de codigo frente a alternativas especificas.

## Enlaces

- HuggingFace: https://huggingface.co/credible-ai/qwen3.5-4B-40domains-vertex-linear-gsm8k
- Modelo proxy: https://huggingface.co/credible-ai/qwen3.5-100M-40domains-vertex
- Paper LinMix: https://arxiv.org/abs/2610.37390
- Codigo: https://github.com/credibleai/linmix
- Documentacion de `Qwen3_5ForCausalLM`: https://huggingface.co/docs/transformers/model_doc/qwen3_5
- Dataset WebOrganizer/Corpus-200B: https://huggingface.co/datasets/WebOrganizer/Corpus-200B
- Dataset Stack-Edu: https://huggingface.co/datasets/HuggingFaceTB/stack-edu
- Dataset Nemotron-CC-Math-v1: https://huggingface.co/datasets/nvidia/Nemotron-CC-Math-v1
- Dataset tokenizado: https://huggingface.co/datasets/credible-ai/weborganizer-corpus-200b-tokenized
- Tokenizer GPT-NeoX-20B: https://huggingface.co/EleutherAI/gpt-neox-20b
- OLMo-core: https://github.com/allenai/OLMo-core
