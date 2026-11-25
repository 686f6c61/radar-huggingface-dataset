# nkthebass/tinybrainbot-100m-v5.1-base

## Resumen

TinyBrainBot-100M-v5.1-Base es un modelo de lenguaje de 100 millones de parámetros entrenado desde cero por el desarrollador independiente nkthebass. Se trata de un transformer tipo Llama (`LlamaForCausalLM`) con arquitectura estándar, sin código personalizado, pensado como modelo base para generación de texto en inglés. Es la continuación de TinyBrainBot-100M-v3-Base, al que se le añadieron 4,6 mil millones de tokens adicionales de datos densos en conocimiento hasta alcanzar un total de 29,6 mil millones de tokens de entrenamiento.

El modelo destaca por su enfoque en eficiencia extrema: con solo 100,1 millones de parámetros y una ventana de contexto de 1.024 tokens, compite en la categoría de modelos pequeños (small language models) contra alternativas de 90-140 millones de parámetros en tareas de sentido común, razonamiento elemental y aritmética. Según los datos declarados por el autor, supera a su versión anterior en todas las tareas del Open SLM Leaderboard sin haber entrenado con datos de benchmark.

Es relevante ahora porque demuestra que un modelo entrenado desde cero con un presupuesto reducido y una mezcla de datos cuidadosamente curada (web filtrada, libros de texto, Wikipedia, QA destilado y aritmética) puede alcanzar un índice de inteligencia de 26,07, por encima de modelos más grandes como MobileLLM-R1-140M-base (24,64) o BananaMind-2-Pro (24,96). Se distribuye con licencia Apache 2.0, en safetensors y con cuantizaciones GGUF listas para llama.cpp, LM Studio, Ollama y Jan.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer tipo Llama (`LlamaForCausalLM`): hidden 768, 12 capas, 12 cabezas de consulta de 64 con 4 cabezas KV (GQA), SwiGLU 2048, RMSNorm, RoPE |
| Parametros totales | 100.092.672 (75,5M no-embedding + 24,6M embedding atado) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 1.024 tokens |
| Tipos de cuantizacion | F16 (201 MB), Q8_0 (107 MB), Q4_K_M (66 MB) en GGUF; pesos originales en safetensors |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors, GGUF |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only estándar de la familia Llama, sin modificaciones arquitectónicas. Usa 12 capas con dimensión oculta de 768, 12 cabezas de atención de 64 dimensiones con 4 cabezas KV (Grouped Query Attention), FFN SwiGLU con dimensión intermedia de 2048, normalización RMSNorm y embeddings rotatorios (RoPE). El vocabulario es de 32.000 tokens SentencePiece y el embedding de entrada está atado al de salida (tied embedding), lo que reduce el recuento efectivo de parámetros no-embedding a 75,5M. El contexto máximo es de 1.024 tokens.

El entrenamiento total fue de 29,6 mil millones de tokens: los 25,06B de la versión v3 más 4,56B adicionales distribuidos en cinco etapas, cada una con recalentamiento de la tasa de aprendizaje (pico entre 3e-4 y 6e-4) y decaimiento posterior. Los pesos publicados corresponden al paso final de la última etapa (step 113.000), no a un merge. La mezcla de datos de continuación se compone aproximadamente de: 30% QA y hechos (conjuntos destilados propios, GooAQ, FactBase-DCLM, finephrase FAQ, ELI5), 23% web (DCLM-Ultra-1.1, ClimbMix, páginas FineWeb-Edu con puntuación 4-5), 21% libros de texto (Cosmopedia, incluido SmolLM cosmopedia-v2 y WikiHow), 11% Wikipedia (densa y Simple English), 6,5% sentido común, how-to y escritura, 4,5% aritmética (drills propios, Orca-Math, UltraData-Math), 3% QA de ciencia de primaria (solo en la etapa final) y 1% narrativa (Gutenberg, BookCorpus). La etapa final incluye unas 420.000 preguntas de ciencia de nivel escolar con respuestas cortas explicadas, generadas por Ling-3.0-Flash, sin opciones de respuesta y con eliminación de cualquier ítem que compartiera una frase de 8 palabras con una pregunta de ARC antes del entrenamiento. No se usaron datos de entrenamiento ni de test de benchmarks en la continuación.

## Capacidades

- Generación de texto en inglés: continuación de texto coherente dentro de su ventana de contexto de 1.024 tokens.
- Razonamiento elemental y sentido común: resuelve tareas de elección múltiple de nivel escolar (ARC-Easy, ARC-Challenge, HellaSwag, PIQA).
- Aritmética básica: entrenado explícitamente con drills aritméticos, Orca-Math y UltraData-Math; obtiene 47,00 en ArithMark-3.0 y 40,7 en 1.380 problemas aritméticos retenidos con temas y formulaciones no vistos.
- Conocimiento factual denso: mezcla intensiva de Wikipedia, QA destilado y FactBase-DCLM.
- Capacidades multilingües: limitadas al inglés (idioma declarado: en).
- Tool calling / function calling: no disponible; es un modelo base sin post-entrenamiento de instrucciones.
- Soporte de agentes y razonamiento multi-paso: no disponible; no ha recibido RLHF, DPO ni ajuste de instrucciones.
- Modo thinking, visión o audio: no disponible.
- Chat: no soportado; el propio autor indica que es un modelo base que continúa texto y no conversa.

## Casos de uso

- Generación de texto y autocompletado en inglés: el modelo continúa texto de forma coherente dentro de 1.024 tokens, adecuado para completar párrafos, descripciones o explicaciones breves en aplicaciones de escritura asistida de bajo coste.
- Prototipado y educación en entrenamiento de LLM: al ser un Llama estándar de 100M entrenado desde cero con documentación detallada de la mezcla de datos y las etapas, sirve como caso de estudio reproducible para cursos y experimentos de preentrenamiento.
- Evaluación de pipelines de inferencia: sus cuantizaciones GGUF (F16, Q8_0, Q4_K_M) con `add_space_prefix=false` permiten verificar que la tokenización coincide exactamente con transformers y que la salida greedy es idéntica, útil para validar despliegues en llama.cpp, Ollama, LM Studio o Jan.
- Respuesta a preguntas de ciencia escolar: la etapa final incluye 420.000 preguntas de ciencia de primaria con respuestas explicadas, lo que lo hace adecuado para generar respuestas cortas y explicadas en contextos educativos de nivel básico.
- Práctica aritmética automatizada: con 47,00 en ArithMark-3.0 y 40,7 en problemas retenidos, puede emplearse para generar y resolver ejercicios aritméticos simples en herramientas de refuerzo educativo.
- Filtrado y clasificación ligera por perplejidad: al ser un modelo pequeño y rápido, puede usarse como scorer para puntuar la fluidez de textos generados por otros sistemas o para filtrar datos en pipelines de curación.
- Despliegue en dispositivos con recursos muy limitados: con 66 MB en Q4_K_M cabe en CPU, Raspberry Pi o móviles de gama media, permitiendo generación de texto offline en inglés sin GPU.

## Benchmarks y rendimiento

Resultados declarados por el autor (zero-shot, conjuntos de test completos, acc_norm; entre paréntesis la precisión bruta cuando se indica). La columna Int Index corresponde al Intelligence Index del Open SLM Leaderboard.

| Modelo | Parametros | Int Index | HellaSwag | ARC-E | ARC-C | PIQA | ArithMark-3 |
|---|--:|--:|--:|--:|--:|--:|--:|
| TinyBrainBot-100M-v5.1-Base (este modelo) | 100,1M | 26,07 | 34,98 | 57,15 | 34,47 | 67,52 | 47,00 |
| (precisión bruta) | | 24,87 | 30,83 | 62,92 | 30,29 | 67,57 | 47,00 |
| TinyBrainBot-100M-v3-Base (anterior) | 100,1M | 20,97 | 32,62 | 54,67 | 30,12 | 66,21 | 37,40 |
| void.1 | 90,2M | 24,38 | 39,5 | 49,3 | 29,4 | 67,2 | 43,7 |
| MobileLLM-R1-140M-base | 140M | 24,64 | 33,8 | 49,9 | 24,7 | 63,2 | 65,7 |
| BananaMind-2-Pro | 139M | 24,96 | 42,8 | 53,6 | 27,8 | 67,5 | 38,2 |
| GPT-X2.5-135M | 135M | 25,17 | 40,6 | 51,8 | 29,2 | 69,4 | 38,4 |

Las cifras de los modelos comparativos proceden del leaderboard citado por el autor. En aritmética retenida (1.380 problemas con temas y formulaciones no vistos), el modelo obtiene 40,7 frente al 47,0 público de ArithMark-3.0.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,2 GB en F16, 0,1 GB en Q8_0 y 0,07 GB en Q4_K_M (tamaños de archivo GGUF declarados: 201 MB, 107 MB y 66 MB).
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM es suficiente; no requiere A100, H100 ni RTX 4090. Funciona en GPUs integradas y en CPU.
- Cabe en consumer GPU: sí, en cualquier GPU de consumo moderna e incluso en iGPUs y dispositivos móviles; también en Raspberry Pi con la cuantización Q4_K_M.
- Opciones de despliegue: transformers (con `AutoModelForCausalLM` y `AutoTokenizer`), llama.cpp, LM Studio, Ollama, Jan; el tag `text-generation-inference` y `endpoints_compatible` sugiere compatibilidad con TGI y endpoints de Hugging Face.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Int Index | HellaSwag | ARC-E | ARC-C | PIQA | ArithMark-3 | Licencia |
|---|--:|--:|--:|--:|--:|--:|--:|--:|---|
| TinyBrainBot-100M-v5.1-Base | 100,1M | 1.024 | 26,07 | 34,98 | 57,15 | 34,47 | 67,52 | 47,00 | apache-2.0 |
| MobileLLM-R1-140M-base | 140M | no disponible | 24,64 | 33,8 | 49,9 | 24,7 | 63,2 | 65,7 | no disponible |
| BananaMind-2-Pro | 139M | no disponible | 24,96 | 42,8 | 53,6 | 27,8 | 67,5 | 38,2 | no disponible |
| GPT-X2.5-135M | 135M | no disponible | 25,17 | 40,6 | 51,8 | 29,2 | 69,4 | 38,4 | no disponible |

TinyBrainBot-100M-v5.1-Base lidera el Intelligence Index de la comparativa pese a tener menos parámetros, con ventaja clara en ARC-Easy (57,15 frente a 49,3-53,6 de los rivales) y en ARC-Challenge (34,47 frente a 24,7-29,4). Sin embargo, pierde en HellaSwag (34,98 frente a 39,5-42,8) y queda muy por detrás en aritmética frente a MobileLLM-R1-140M-base (47,00 frente a 65,7), aunque supera a BananaMind-2-Pro y GPT-X2.5-135M en esa tarea. La licencia Apache 2.0 es una ventaja frente a modelos cuyas condiciones no se detallan en la información disponible.

## Limitaciones y advertencias

- Es un modelo base: continúa texto y no mantiene conversaciones ni sigue instrucciones; no debe usarse como asistente sin un post-entrenamiento adicional.
- Ventana de contexto muy corta (1.024 tokens), insuficiente para documentos largos, conversaciones multi-turno extensas o tareas de recuperación aumentada con contexto amplio.
- Solo soporta inglés; no se ha validado su comportamiento en castellano ni en otros idiomas.
- Riesgo de alucinación alto: con 100M de parámetros y sin RLHF/DPO, puede generar afirmaciones factuales incorrectas con fluidez.
- Sesgos conocidos: no disponibles en la información proporcionada; al entrenarse con web filtrada (FineWeb-Edu, DCLM, ClimbMix) y Wikipedia, es probable que herede sesgos de esas fuentes, pero no se documentan análisis específicos.
- Rendimiento limitado en sentido común y generación abierta: HellaSwag de 34,98 está por debajo de modelos comparables de tamaño similar.
- La aritmética decae fuera de distribución: 40,7 en problemas retenidos frente a 47,0 en ArithMark-3.0 público, una caída de más de 6 puntos.
- Licencia Apache 2.0: permite uso comercial y modificación con atribución, pero el autor no ofrece garantías sobre el modelo; conviene revisar las condiciones de los datasets de entrenamiento si se redistribuye.
- Los resultados de benchmarks son declarados por el autor y no están verificados (`verified: false` en el model-index); deben tomarse como indicativos.
- Existe una versión posterior (TinyBrainBot-100M-v6-Base) que continúa el entrenamiento con 10B tokens adicionales; para nuevos proyectos conviene evaluar esa variante.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/nkthebass/tinybrainbot-100m-v5.1-base
- Versión anterior (v3-Base): https://huggingface.co/nkthebass/tinybrainbot-100m-v3-base
- Versión posterior (v6-Base): https://huggingface.co/nkthebass/tinybrainbot-100m-v6-base
- Open SLM Leaderboard: https://huggingface.co/spaces/AxiomicLabs/Open_SLM_Leaderboard
- Dataset de matemáticas del autor: https://huggingface.co/datasets/nkthebass/tinybrainbot-3m-math-data
- Dataset FineWeb-Edu: https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu
- Dataset SmolLM corpus: https://huggingface.co/datasets/HuggingFaceTB/smollm-corpus
- Dataset Cosmopedia: https://huggingface.co/datasets/HuggingFaceTB/cosmopedia
- Dataset DCLM-Ultra-1.1: https://huggingface.co/datasets/ArrowLabs/DCLM-Ultra-1.1
- Dataset ClimbMix: https://huggingface.co/datasets/karpathy/climbmix-400b-shuffle
- Dataset FactBase-DCLM: https://huggingface.co/datasets/AxiomicLabs/FactBase-DCLM
- Dataset Arithmark-3.0: https://huggingface.co/datasets/AxiomicLabs/Arithmark-3.0
