# gpjt/8xa100m40-lore-4-input-only

## Resumen

`gpjt/8xa100m40-lore-4-input-only` es un modelo de lenguaje causal entrenado desde cero por Giles Thomas (usuario `gpjt` en HuggingFace), construido sobre la arquitectura estilo GPT-2 que Sebastian Raschka describe en el libro *Build a Large Language Model (from Scratch)*. Su particularidad es la incorporacion de LoRE (Low Rank Embeddings), una tecnica propuesta por el usuario `AndrewThompson1233` que factoriza la matriz de embeddings de tokens en matrices de rango bajo, reduciendo el numero de parametros del modelo sin cambiar la arquitectura transformer subyacente.

Se trata de un modelo base (no afinado por instrucciones ni con RLHF/DPO) de escala pequena: la model card declara 130.943.360 parametros, mientras que los metadatos de safetensors del repositorio reportan 143.526.272. La longitud de contexto es de 1.024 tokens, con una dimension de embedding de 768, 12 capas y 12 cabezas de atencion multi-cabeza. El entrenamiento se realizo sobre aproximadamente 3.260 millones de tokens del dataset `gpjt/fineweb-gpt2-tokens` (tokens de FineWeb procesados con el tokenizador de GPT-2), lo que corresponde a la cifra Chinchilla-optimal (~20x el numero de parametros) de la variante sin LoRE.

El modelo esta pensado como experimento de investigacion y como plataforma para experimentar con LLMs de estilo GPT-2 (2020) en lugar de como herramienta de produccion. El propio autor advierte en la model card de que el modelo "no sabe muchos hechos y no es terriblemente inteligente", y recomienda usar modelos serios (menciona Qwen) para trabajo real. Su licencia Apache 2.0 y su tamano reducido lo hacen adecuado para experimentar con fine-tuning, estudiar el efecto de LoRE en embeddings y reproducir pipelines de entrenamiento distribuido.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only estilo GPT-2, causal LM, con factorizacion de rango bajo (LoRE) en los embeddings de tokens |
| Parametros totales | 130.943.360 segun model card; 143.526.272 segun metadatos de safetensors |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 1.024 tokens |
| Tipos de cuantizacion | no disponible (el repositorio distribuye safetensors en precision completa; no se documentan variantes cuantizadas) |
| Idiomas soportados | no disponible en la model card; el dataset de entrenamiento (FineWeb) es predominantemente en ingles |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria transformers, con `custom_code`) |

Datos adicionales de arquitectura declarados en la model card: dimension de embedding 768, 12 cabezas MHA, 12 capas, `QKV bias` desactivado, `weight tying` desactivado. Tamano del repositorio: 0,6 GB. Configuracion LoRE: activada para embeddings de tokens (True), desactivada para la cabeza de salida (False), rango 128, inicializacion "original".

## Arquitectura y entrenamiento

El modelo es un transformer causal decoder-only de estilo GPT-2, con 12 bloques de atencion multi-cabeza (12 cabezas, dimension de embedding 768), sin sesgo en las proyecciones QKV y sin atado de pesos entre la matriz de embeddings y la cabeza de salida. La innovacion respecto a la implementacion base del libro de Raschka es LoRE: la matriz de embeddings de tokens se representa mediante matrices de rango bajo con rango 128, con el objetivo de reducir el recuento de parametros asociado al vocabulario. En esta variante concreta, LoRE se aplica solo a los embeddings de entrada, no a la cabeza de salida.

El entrenamiento se realizo desde cero (no es un fine-tune) sobre 3.260.252.160 tokens del dataset `gpjt/fineweb-gpt2-tokens`, una cantidad calculada como exactamente 20 veces el numero de parametros de la variante sin LoRE y redondeada al alza hasta completar un lote. La infraestructura fue de 8 GPU A100 de 40 GiB en Lambda. Hiperparametros declarados: micro-batch de 12, batch global de 96, dropout 0,0, gradient clipping de 3,5, learning rate de 0,0014 con schedule, y weight decay de 0,01. No se documenta ningun proceso de alineacion posterior (RLHF, DPO ni SFT por instrucciones): es un modelo puramente base, entrenado con el objetivo de modelado de lenguaje autorregresivo. El codigo de entrenamiento esta disponible en el repositorio `gpjt/ddp-base-model-from-scratch` y se apoya en JAX segun la serie de articulos del autor.

## Capacidades

- Generacion de texto autorregresiva en modo continuacion de prompt (completion), con decodificacion por muestreo (temperatura, top-k).
- Modelado de lenguaje causal: util para calcular perplejidad y como banco de pruebas de tecnicas de entrenamiento.
- Fine-tuning sobre dominios o tareas concretas: el autor publica un notebook de ejemplo de entrenamiento con HuggingFace Transformers.
- No dispone de modo de razonamiento explicito ("thinking mode"), ni capacidades de vision o audio.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- Capacidades multilingues: no documentadas; el corpus de entrenamiento (FineWeb) es mayoritariamente anglosajon, por lo que el rendimiento fuera del ingles es presumiblemente muy limitado.
- No hay modo conversacional ni plantilla de chat: al ser un modelo base, no responde a instrucciones de forma fiable.

## Casos de uso

- Investigacion sobre factorizacion de rango bajo en embeddings: permite medir el efecto de LoRE (rango 128) sobre la calidad del modelo comparandolo con la variante sin LoRE (`gpjt/8xa100m40`) entrenada con el mismo presupuesto de tokens.
- Reproducibilidad de pipelines de entrenamiento distribuido: sirve como referencia de un entrenamiento completo en 8x A100 con JAX y data parallelism, con hiperparametros documentados.
- Fine-tuning de tareas de clasificacion o etiquetado ligero: al ser un modelo de 143M de parametros, se puede ajustar en una unica GPU consumer para tareas de NLP acotadas (analisis de sentimiento, clasificacion de topicos) partiendo del checkpoint base.
- Generacion de texto creativo controlada en dominios estrechos: tras un fine-tuning sobre un corpus pequeno y homogeneo, puede generar continuaciones estilisticamente coherentes dentro de ese dominio.
- Banco de pruebas de tecnicas de decodificacion: util para evaluar estrategias de muestreo (temperatura, top-k, top-p) en un modelo pequeno y rapido de iterar.
- Docencia y aprendizaje: ejemplo completo y reproducible de arquitectura GPT-2 con codigo custom, util para cursos y talleres sobre construccion de LLMs desde cero.
- Evaluacion comparativa de tokenizadores y datasets: el uso del dataset `gpjt/fineweb-gpt2-tokens` permite estudiar el efecto del tokenizador de GPT-2 sobre un subconjunto de FineWeb.
- Pruebas de infraestructura de inferencia: por su tamano, sirve para validar despliegues con codigo custom (`trust_remote_code`) antes de pasar a modelos mayores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tablas de MMLU, HumanEval, GSM8K ni metricas equivalentes, y el articulo de blog asociado a LoRE figura como "coming soon". El autor describe cualitativamente el modelo como "dumb and ignorant" y recomienda no usarlo para trabajo serio.

## Requisitos de hardware

Las cifras de memoria son estimaciones calculadas a partir del recuento de parametros; el autor no las publica.

- VRAM estimada para inferencia: ~0,57 GB en FP32 (143,5M parametros), ~0,29 GB en FP16/BF16, ~0,14 GB en int8, ~0,09 GB en int4. A estas cifras hay que sumar el coste de la cache KV, que con contexto de 1.024 tokens es pequeno pero no despreciable.
- GPU recomendadas: cualquier GPU con al menos 2-4 GB de VRAM es suficiente para inferencia en FP16; no se requiere hardware de datacenter.
- Cabe holgadamente en GPU consumer: RTX 3060, RTX 4060, RTX 4090, e incluso en iGPU con memoria compartida en cuantizaciones bajas. Tambien es viable en CPU.
- Despliegue: la via documentada es `transformers` con `trust_remote_code=True` (el modelo incluye codigo custom para la capa LoRE). No se documenta soporte para vLLM, TGI, llama.cpp u Ollama; dada la arquitectura personalizada, es probable que estos motores no lo soporten sin adaptaciones.
- Entrenamiento original: 8x A100 de 40 GiB (configuracion de Lambda), con micro-batch 12 y batch global 96.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

Los datos de los modelos de comparacion corresponden a especificaciones publicas ampliamente conocidas; no se dispone de benchmarks comparativos ejecutados sobre este modelo concreto.

| Modelo | Parametros | Contexto | Arquitectura | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| gpjt/8xa100m40-lore-4-input-only | 143,5M (safetensors) / 130,9M (model card) | 1.024 | GPT-2 + LoRE (rango 128) en embeddings | Apache 2.0 | HuggingFace, requiere `trust_remote_code` |
| gpjt/8xa100m40 (sin LoRE) | ~163M | 1.024 | GPT-2 estilo Raschka | Apache 2.0 | HuggingFace |
| GPT-2 small | 124M | 1.024 | Transformer decoder-only | Licencia MIT modificada | HuggingFace, ampliamente soportado |
| Pythia-160M (EleutherAI) | 160M | 2.048 | Transformer decoder-only | Apache 2.0 | HuggingFace, soporte estandar en transformers |

Frente a GPT-2 small y Pythia-160M, este modelo se diferencia por la factorizacion LoRE y por estar entrenado con un presupuesto de tokens explicitamente calculado como Chinchilla-optimal, pero tambien por requerir codigo custom para cargarse y por carecer de un ecosistema de herramientas equivalente.

## Limitaciones y advertencias

- Modelo base sin alineacion: no sigue instrucciones, no mantiene formato conversacional y no debe usarse directamente en aplicaciones orientadas a usuario final.
- Conocimiento factual muy limitado: 143M de parametros y ~3.260 millones de tokens de entrenamiento implican una capacidad muy reducida de memorizar hechos; el propio autor lo califica de "dumb and ignorant".
- Riesgo elevado de alucinacion y de generacion de texto incoherente, especialmente fuera del dominio de FineWeb o con prompts largos.
- Sesgos: no se ha publicado ningun analisis de sesgos. Al entrenarse sobre FineWeb (texto web en ingles), es esperable que herede sesgos presentes en la web.
- Limitacion de idioma: el corpus es predominantemente ingles; el rendimiento en castellano u otros idiomas no esta documentado y previsiblemente sera muy pobre.
- Ventana de contexto de solo 1.024 tokens, insuficiente para tareas de contexto largo, RAG con documentos extensos o analisis de documentos completos.
- Requiere `trust_remote_code=True`, lo que implica ejecutar codigo Python incluido en el repositorio; conviene auditar ese codigo antes de usarlo en entornos controlados.
- Compatibilidad limitada: al usar una arquitectura personalizada, no hay garantia de soporte en vLLM, llama.cpp, Ollama o TGI, lo que complica el despliegue en produccion.
- Uso comercial: la licencia Apache 2.0 lo permite, pero el estado del modelo (base, sin benchmarks, sin garantias de calidad) hace desaconsejable su uso en produccion real.
- Advertencia sobre el recuento de parametros: existe una discrepancia entre la model card (130.943.360) y los metadatos de safetensors (143.526.272) que conviene verificar antes de planificar requisitos de memoria.
- Repositorio sin traccion: 0 descargas y 0 likes en el momento de la consulta, sin senales de mantenimiento o comunidad activa.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/gpjt/8xa100m40-lore-4-input-only
- Dataset de entrenamiento: https://huggingface.co/datasets/gpjt/fineweb-gpt2-tokens
- Repositorio de codigo: https://github.com/gpjt/ddp-base-model-from-scratch
- Notebook de entrenamiento/fine-tuning: https://github.com/gpjt/ddp-base-model-from-scratch/blob/main/hf_train.ipynb
- Articulo de blog sobre matrices de vocabulario de rango bajo (LoRE): https://www.gilesthomas.com/2026/10/low-rank-vocab-matrices (anunciado como "coming soon")
- Discusion donde se propuso la idea de LoRE: https://huggingface.co/gpjt/jax-with-mha-bias-fw-fwedu-5050-DEPRECATED/discussions/1
- Serie de artículos sobre construccion de un LLM desde cero (parte 34b, GPT-2 small en JAX): https://www.gilesthomas.com/2026/07/llm-from-scratch-34b-building-and-training-gpt-2-small-in-jax
- Articulo relacionado del mismo autor (LLM as a judge): https://www.gilesthomas.com/2026/01/llm-from-scratch-30-digging-into-llm-as-a-judge
- Variante sin LoRE: https://huggingface.co/gpjt/8xa100m40
- Variante baseline: https://huggingface.co/gpjt/8xa100m40-baseline
- Libro de referencia de la arquitectura: https://www.manning.com/books/build-a-large-language-model-from-scratch
