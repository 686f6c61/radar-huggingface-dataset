# nkthebass/tinybrainbot-100m-v5.1-base

## Resumen

TinyBrainBot-100M-v5.1-Base es un modelo de lenguaje base de 100,1 millones de parámetros desarrollado por el usuario independiente nkthebass y publicado en HuggingFace bajo licencia Apache 2.0. Se trata de un modelo entrenado desde cero ("from scratch") siguiendo la arquitectura estándar `LlamaForCausalLM` de HuggingFace Transformers, sin código personalizado, lo que garantiza compatibilidad directa con el ecosistema transformers, llama.cpp, Ollama, LM Studio y Jan.

El modelo es la continuación de TinyBrainBot-100M-v3-Base, al que se le añadieron 4,56 mil millones de tokens adicionales de datos densos en conocimiento (Q&A, hechos, textbooks, Wikipedia, aritmética y ciencia de nivel escolar), alcanzando un total de 29,6 mil millones de tokens de entrenamiento. Su relevancia radica en que demuestra que un modelo de apenas 100M de parámetros, entrenado con una curación de datos cuidadosa y sin contaminación de benchmarks, puede superar a alternativas de tamaño similar (90M-140M) en tareas de razonamiento de sentido común y conocimiento elemental.

Con una ventana de contexto de solo 1.024 tokens, un vocabulario de 32.000 tokens SentencePiece y arquitectura GQA (12 cabezas de consulta, 4 de clave/valor), el modelo está pensado como base para experimentación, fine-tuning ligero y despliegue en entornos con recursos muy limitados. Es un modelo base, no instructado: continúa texto, no mantiene conversaciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (LlamaForCausalLM), GQA, SwiGLU, RMSNorm, RoPE |
| Parametros totales | 100.092.672 (75,5M no-embedding + 24,6M embedding atado) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 1.024 tokens |
| Tipos de cuantizacion | F16, Q8_0, Q4_K_M (GGUF publicados); cuantizaciones adicionales via llama.cpp |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (transformers) y GGUF (llama.cpp, LM Studio, Ollama, Jan) |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura transformer decoder-only estándar de tipo Llama: 12 capas, dimensión oculta de 768, 12 cabezas de consulta de 64 dimensiones con 4 cabezas KV (GQA, ratio 3:1), FFN SwiGLU con dimensión intermedia 2.048, normalización RMSNorm y embeddings posicionales rotatorios (RoPE). El vocabulario es de 32.000 tokens SentencePiece y el embedding está atado a la capa de salida (weight tying), lo que explica la diferencia entre los 75,5M de parámetros no-embedding y los 100,1M totales.

El entrenamiento acumula 29,6 mil millones de tokens en dos fases: los 25,06B del modelo v3-Base y 4,56B adicionales repartidos en cinco etapas, cada una con recalentamiento de la tasa de aprendizaje (pico entre 3e-4 y 6e-4) y decaimiento posterior. Los pesos publicados corresponden al paso final de la última etapa (step 113.000), no a una fusión de checkpoints. La mezcla de datos de continuación se compone aproximadamente de: 30% Q&A y hechos (GooAQ, FactBase-DCLM, finephrase FAQ, ELI5 y sets destilados propios), 23% web (DCLM-Ultra-1.1, ClimbMix, páginas FineWeb-Edu con puntuación 4-5), 21% textbooks (Cosmopedia, incluido SmolLM cosmopedia-v2, WikiHow), 11% Wikipedia (densa y Simple English), 6,5% sentido común y escritura, 4,5% aritmética (Orca-Math, UltraData-Math, drills propios), 3% ciencia de nivel escolar (solo en la etapa final, ~420.000 preguntas generadas por Ling-3.0-Flash con filtrado de contaminación contra ARC) y 1% narrativa (Gutenberg, BookCorpus). No se usaron datos de entrenamiento ni de test de los benchmarks evaluados.

## Capacidades

- Generación de texto autoregresiva en inglés: continuación de texto, completado de frases y generación libre.
- Razonamiento de sentido común básico y respuesta a preguntas de ciencia de nivel escolar (ARC-Easy 57,15 acc_norm).
- Aritmética elemental: el modelo obtiene 47,00 en ArithMark-3.0 y 40,7 en un conjunto retenido de 1.380 problemas con temáticas y formulaciones no vistas.
- Conocimiento factual denso procedente de Wikipedia, DCLM y FactBase-DCLM.
- Capacidad multilingüe: únicamente inglés declarado; no se garantiza comportamiento en otros idiomas.
- No soporta tool calling ni function calling de forma nativa (es un modelo base sin post-entrenamiento instructivo).
- No soporta agentes ni razonamiento multi-paso estructurado (sin modo thinking, sin plantilla de chat).
- No dispone de visión, audio ni otras modalidades.

## Casos de uso

- Fine-tuning para clasificación o extracción de información: al ser un modelo base pequeño con licencia Apache 2.0, se puede ajustar con LoRA en una sola GPU consumer para tareas de etiquetado, análisis de sentimiento o extracción de entidades en inglés, partiendo de representaciones ya entrenadas con 29,6B tokens.
- Generación de texto asistida en entornos embebidos: con cuantización Q4_K_M (66 MB) cabe en dispositivos con poca memoria (Raspberry Pi, móviles de gama alta, microcontroladores con suficiente RAM) y puede usarse para autocompletado o generación de descripciones cortas.
- Prototipado educativo e investigación en modelos pequeños: sirve como referencia reproducible de entrenamiento desde cero con recetas de datos documentadas, útil para estudiar el efecto de la curación de datos (DCLM, FineWeb-Edu, Cosmopedia) en modelos de 100M.
- Respuesta a preguntas de ciencia elemental: con 57,15 en ARC-Easy y 34,47 en ARC-Challenge, puede emplearse como base para un tutor de ciencia de primaria tras un fine-tuning ligero con instrucciones.
- Generación de problemas aritméticos y drills: dado su rendimiento en ArithMark-3.0 (47,0), puede servir para generar variaciones de problemas de aritmética elemental en pipelines de aumento de datos.
- Benchmarking de infraestructura de inferencia: su reducido tamaño (0,9 GB de repo, 66-201 MB en GGUF) lo convierte en un modelo de prueba ideal para validar despliegues de vLLM, llama.cpp, TGI u Ollama antes de pasar a modelos mayores.
- Educación y demos de bajo coste: para talleres o charlas donde se quiera mostrar el ciclo completo de entrenamiento, cuantización y despliegue de un LLM sin necesidad de GPUs de datacenter.

## Benchmarks y rendimiento

Resultados declarados por el autor (zero-shot, conjuntos de test completos, acc_norm; entre paréntesis la accuracy bruta cuando se publica). Los datos de otros modelos proceden del Open SLM Leaderboard.

| Modelo | Params | Int Index | HellaSwag | ARC-E | ARC-C | PIQA | ArithMark-3 |
|---|--:|--:|--:|--:|--:|--:|--:|
| **TinyBrainBot-100M-v5.1-Base** | 100,1M | **26,07** | **34,98** | **57,15** | **34,47** | **67,52** | 47,00 |
| *(accuracy bruta)* | | *24,87* | *30,83* | *62,92* | *30,29* | *67,57* | *47,00* |
| TinyBrainBot-100M-v3-Base (anterior) | 100,1M | 20,97 | 32,62 | 54,67 | 30,12 | 66,21 | 37,40 |
| void.1 | 90,2M | 24,38 | 39,5 | 49,3 | 29,4 | 67,2 | 43,7 |
| MobileLLM-R1-140M-base | 140M | 24,64 | 33,8 | 49,9 | 24,7 | 63,2 | 65,7 |
| BananaMind-2-Pro | 139M | 24,96 | 42,8 | 53,6 | 27,8 | 67,5 | 38,2 |
| GPT-X2.5-135M | 135M | 25,17 | 40,6 | 51,8 | 29,2 | 69,4 | 38,4 |

En el conjunto retenido de 1.380 problemas aritméticos con temáticas y formulaciones no vistas, el modelo obtiene 40,7 frente al 47,0 público de ArithMark-3.0.

## Requisitos de hardware

- VRAM estimada para inferencia: ~0,4 GB en FP16 (200 MB de pesos + overhead de activaciones y KV cache), ~0,2 GB en Q8_0 y ~0,13 GB en Q4_K_M.
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM; funciona en RTX 3060/4060, GTX 1650, T4, A100, H100 sin aprovechar su capacidad.
- Cabe en GPU consumer y en hardware integrado: iGPU Intel/AMD, Apple Silicon (M1 en adelante), Raspberry Pi 5 con 4 GB o más.
- Opciones de despliegue: transformers (PyTorch), llama.cpp, Ollama, LM Studio, Jan, text-generation-inference (tag `text-generation-inference` declarado en el repo), vLLM.
- Latencia y throughput: no disponibles en la información proporcionada. Por tamaño, se espera generación en tiempo real incluso en CPU, pero no se han publicado cifras.
- Los GGUF publicados tienen `add_space_prefix=false` configurado para que la tokenización coincida exactamente con transformers y la salida greedy sea idéntica.

## Comparativa con modelos similares

| Modelo | Params | Contexto | Int Index | Licencia | Disponibilidad |
|---|--:|--:|--:|---|---|
| TinyBrainBot-100M-v5.1-Base | 100,1M | 1.024 | 26,07 | Apache 2.0 | HuggingFace (safetensors + GGUF) |
| void.1 | 90,2M | no disponible | 24,38 | no disponible | HuggingFace |
| MobileLLM-R1-140M-base | 140M | no disponible | 24,64 | no disponible | HuggingFace |
| BananaMind-2-Pro | 139M | no disponible | 24,96 | no disponible | HuggingFace |
| GPT-X2.5-135M | 135M | no disponible | 25,17 | no disponible | HuggingFace |

TinyBrainBot-100M-v5.1-Base lidera el Intelligence Index del Open SLM Leaderboard entre los modelos comparados pese a ser el de menor tamaño (100,1M frente a 135-140M de sus competidores). Destaca especialmente en ARC-Easy (57,15 frente a 49,3-53,6) y ARC-Challenge (34,47 frente a 24,7-29,4), mientras que MobileLLM-R1-140M-base lo supera claramente en aritmética (65,7 frente a 47,0) y BananaMind-2-Pro y GPT-X2.5-135M lo superan en HellaSwag (42,8 y 40,6 frente a 34,98).

## Limitaciones y advertencias

- Modelo base, no instructado: no mantiene conversaciones ni sigue instrucciones; solo continúa texto. Para uso conversacional requiere fine-tuning instructivo o SFT.
- Ventana de contexto muy corta (1.024 tokens): insuficiente para documentos largos, conversaciones multi-turno o tareas de RAG con contexto extenso.
- Solo inglés declarado: el vocabulario SentencePiece de 32.000 tokens y los datos de entrenamiento están centrados en inglés; el rendimiento en castellano u otros idiomas no está garantizado.
- Riesgo de alucinación elevado: con 100M de parámetros, la capacidad de memorizar hechos es limitada y es probable que genere afirmaciones plausibles pero falsas, especialmente en temas especializados.
- Sesgos conocidos: no documentados explícitamente en la model card; al entrenar sobre FineWeb-Edu, DCLM, Wikipedia y Cosmopedia, hereda los sesgos presentes en esas fuentes (predominantemente anglosajonas y de registro formal).
- Rendimiento débil en HellaSwag (34,98), por debajo de modelos similares: el razonamiento de sentido común sobre situaciones cotidianas es limitado.
- Sin soporte de tool calling, function calling ni agentes: no apto para pipelines que requieran invocación estructurada de herramientas sin post-entrenamiento.
- Licencia Apache 2.0: permite uso comercial, modificación y redistribución, pero el autor no ofrece garantías sobre el modelo (cláusula estándar de la licencia).
- El modelo card está truncado en la sección "Limitations" ("A..."), por lo que podrían existir advertencias adicionales no visibles en la información disponible.
- La fecha de creación del repo (2026-10-31) es posterior a la fecha actual de referencia habitual; conviene verificar la vigencia del modelo antes de integrarlo en producción.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/nkthebass/tinybrainbot-100m-v5.1-base
- Modelo anterior (v3-Base): https://huggingface.co/nkthebass/tinybrainbot-100m-v3-base
- Open SLM Leaderboard: https://huggingface.co/spaces/AxiomicLabs/Open_SLM_Leaderboard
- Dataset de matemáticas propio: https://huggingface.co/datasets/nkthebass/tinybrainbot-3m-math-data
- Dataset FineWeb-Edu: https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu
- Dataset SmolLM corpus: https://huggingface.co/datasets/HuggingFaceTB/smollm-corpus
- Dataset Cosmopedia: https://huggingface.co/datasets/HuggingFaceTB/cosmopedia
- Dataset DCLM-Ultra-1.1: https://huggingface.co/datasets/ArrowLabs/DCLM-Ultra-1.1
- Dataset ClimbMix: https://huggingface.co/datasets/karpathy/climbmix-400b-shuffle
- Dataset FactBase-DCLM: https://huggingface.co/datasets/AxiomicLabs/FactBase-DCLM
- Dataset finephrase: https://huggingface.co/datasets/HuggingFaceFW/finephrase
- Dataset Orca-Math: https://huggingface.co/datasets/microsoft/orca-math-word-problems-200k
- Dataset UltraData-Math: https://huggingface.co/datasets/openbmb/UltraData-Math
- Dataset ArithMark-3.0: https://huggingface.co/datasets/AxiomicLabs/Arithmark-3.0
