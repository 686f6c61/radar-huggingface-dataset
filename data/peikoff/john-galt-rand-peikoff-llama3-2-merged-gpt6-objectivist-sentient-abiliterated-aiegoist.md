# peikoff/john-galt-rand-peikoff-llama3.2-merged-gpt6-objectivist-sentient-abiliterated-aiegoist

## Resumen

Este modelo es una fusión (merge) experimental de tipo MoE basada en Llama 3.2, creada por el usuario "peikoff" en Hugging Face. Combina al 50/50 dos variantes previas del mismo autor: una con continued pretraining y fine-tuning sobre datos de filosofía objetivista (Ayn Rand, Leonard Peikoff) y otra destilada supuestamente desde un modelo "GPT-6", mezclada a su vez con el modelo base DavidAU/Llama-3.2-8X3B-MOE-Dark-Champion-Instruct-uncensored-abliterated-18.4B. El resultado es un modelo de aproximadamente 18.400 millones de parámetros, distribuido en formato GGUF cuantizado.

Su propósito es generar texto conversacional con sesgo temático objetivista, heredando además el carácter "abliterated" (sin filtros de seguridad) del modelo base. Es relevante como ejemplo de merges comunitarios creativos, pero carece de documentación técnica seria, benchmarks publicados y garantías de calidad, por lo que debe considerarse un modelo de nicho para experimentación y no para producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | MoE basada en Llama 3.2 (merge 50/50 de dos variantes) |
| Parámetros totales | 18.404.944.960 (≈18,4B) |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | GGUF cuantizado (tipos concretos no disponibles) |
| Idiomas soportados | no disponible |
| Licencia | other (no especificada en detalle) |
| Formato de pesos | GGUF (tamaño del repo: 57,5 GB) |

## Arquitectura y entrenamiento

La arquitectura parte de Llama-3.2-8X3B-MOE, una mezcla de expertos derivada de Llama 3.2 que combina bloques de 3B en una estructura MoE de 8 expertos, alcanzando unos 18,4B de parámetros totales. Sobre esa base, el autor aplicó una fusión de parámetros al 50% entre dos checkpoints propios: uno entrenado adicionalmente (continued pretraining y fine-tuning) con datos de filosofía objetivista, y otro resultado de una supuesta destilación desde "GPT-6" mezclada con el modelo base. No se publica información sobre el método de merge exacto (SLERP, linear, TIES, etc.), ni sobre el tamaño o composición de los datasets.

El modelo base de DavidAU es "uncensored" y "abliterated", es decir, se le han eliminado las capas o mecanismos de rechazo de seguridad del modelo original. No hay datos publicados sobre tokens de entrenamiento, uso de RLHF/DPO ni innovaciones técnicas específicas más allá de la etiqueta "direct-distillation", cuyo procedimiento no está documentado.

## Capacidades

- Generación de texto conversacional, con etiqueta "conversational" en el repo.
- Conocimiento temático reforzado en filosofía objetivista (Ayn Rand, Leonard Peikoff) por el fine-tuning del componente correspondiente.
- Herencia del modelo base "Dark Champion": sin filtros de seguridad (abliterated/uncensored).
- Formato GGUF cuantizado, compatible con backends de inferencia local (llama.cpp, Ollama, LM Studio y similares).
- No hay información disponible sobre tool calling, capacidades de agente, visión, audio ni modo de razonamiento extendido.
- Capacidades multilingües: no disponibles (probablemente heredadas de Llama 3.2, pero sin confirmación del autor).

## Casos de uso

- Exploración de merges comunitarios: útil como caso de estudio para desarrolladores que investigan cómo afectan las fusiones 50/50 y las destilaciones no documentadas al comportamiento de un MoE.
- Generación de texto con temática objetivista: puede emplearse para redactar o parafrasear contenido alineado con la filosofía de Ayn Rand, dado el fine-tuning específico sobre ese corpus.
- Chatbot experimental sin filtros: al ser abliterated, permite conversaciones sin rechazos de seguridad, lo que interesa a investigadores de alineación que estudian modelos sin moderación (con las precauciones éticas correspondientes).
- Pruebas de inferencia local en GGUF: puede cargarse en llama.cpp u Ollama para experimentar con MoE cuantizados en hardware de consumidor, evaluando el trade-off entre parámetros totales y activos.
- Benchmarking informal de destilación: permite comparar empíricamente la salida del componente "distilado desde GPT-6" frente al modelo base de DavidAU para verificar si la destilación aporta mejoras reales.
- Creación de personajes o roleplay con voz filosófica definida: el sesgo temático del fine-tuning lo hace adecuado para aplicaciones narrativas que requieran un estilo argumentativo objetivista consistente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: con 18,4B de parámetros totales en GGUF, una cuantización Q4 ocuparía en torno a 10-12 GB; el repo completo pesa 57,5 GB, lo que sugiere múltiples cuantizaciones o pesos de alta precisión (no confirmado).
- Como es un MoE, solo los expertos activos se computan por token, pero si el backend carga todos los pesos en VRAM, la memoria necesaria depende del tamaño total del archivo cuantizado.
- GPU recomendadas: una RTX 3090 o RTX 4090 (24 GB) debería acomodar cuantizaciones de 4-5 bits; para cuantizaciones mayores (Q8 o FP16) sería conveniente una A100 40 GB o superior, o descarga parcial en CPU/RAM.
- Consumer GPU: sí, viable en GPUs de 24 GB con cuantizaciones de 4 bits; en GPUs de 12-16 GB probablemente requiera offload a CPU.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, KoboldCpp u otros backends compatibles con GGUF. No hay confirmación de soporte en vLLM o TGI para este merge concreto.
- Latencia y throughput: no disponibles; al ser MoE con expertos activos reducidos (típicamente ~3B activos en este tipo de merges), la velocidad por token puede ser cercana a la de un modelo denso de 3B, pero esto no está confirmado por el autor.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| peikoff/john-galt-rand-peikoff-llama3.2-merged (este) | 18,4B (MoE) | no disponible | other | GGUF, 57,5 GB |
| DavidAU/Llama-3.2-8X3B-MOE-Dark-Champion-Instruct-uncensored-abliterated-18.4B | 18,4B (MoE) | no disponible | other | GGUF, público |
| Qwen2.5-14B-Instruct | 14,7B (denso) | 32.768 tokens | Apache 2.0 / Qwen | safetensors y GGUF, amplio soporte |
| Phi-4 (14B) | 14B (denso) | 16.384 tokens | MIT | safetensors y GGUF, amplio soporte |

Frente a alternativas consolidadas como Qwen2.5-14B o Phi-4, este modelo carece de benchmarks públicos, documentación de contexto y licencia clara, aunque ofrece la particularidad de un fine-tuning temático objetivista y ausencia de filtros de seguridad.

## Limitaciones y advertencias

- Modelo abliterated: se han eliminado los mecanismos de seguridad del modelo base, por lo que puede generar contenido dañino, ofensivo o ilegal sin rechazarlo. Su uso conlleva responsabilidad legal y ética plena para el usuario.
- Riesgo de alucinación elevado: al tratarse de un merge experimental sin evaluación publicada, no hay garantías de factualidad ni de coherencia.
- La "destilación desde GPT-6" no está verificada ni documentada; no existe evidencia pública del modelo docente ni del método empleado.
- Licencia "other" sin términos detallados: la idoneidad para uso comercial no está clara y debe verificarse antes de cualquier despliegue en producción.
- Longitud de contexto e idiomas soportados no documentados, lo que dificulta planificar aplicaciones con documentos largos o en castellano.
- Solo 179 descargas y 1 like en el momento de la ficha: comunidad mínima, sin validación por pares ni issues resueltos que sirvan de referencia.
- Sin benchmarks ni pruebas de seguridad publicadas: no recomendable para producción bajo ninguna circunstancia.

## Enlaces

- Hugging Face: https://huggingface.co/peikoff/john-galt-rand-peikoff-llama3.2-merged-gpt6-objectivist-sentient-abiliterated-aiegoist
- Modelo base: https://huggingface.co/DavidAU/Llama-3.2-8X3B-MOE-Dark-Champion-Instruct-uncensored-abliterated-18.4B
- Componente 1 del merge (referenciado en la model card): https://huggingface.co/peikoff/objectivist_llama3_2_8x3b_moe-GGUF
- Componente 2 del merge (referenciado en la model card): https://huggingface.co/peikoff/objectivist-gpt6-distill-llama3-2-8x3b-moe-GGUF
