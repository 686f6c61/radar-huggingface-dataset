# nkthebass/tinybrainbot-100m-v5-base

## Resumen

TinyBrainBot-100M-v5-Base es un modelo de lenguaje base de 100,1 millones de parámetros entrenado desde cero por el desarrollador independiente nkthebass. Se trata de una continuación de TinyBrainBot-100M-v3-Base, al que se le añadieron 4,6 mil millones de tokens adicionales de datos densos en conocimiento, superándolo en todas las tareas del Open SLM Leaderboard. El modelo adopta la arquitectura Llama (`LlamaForCausalLM`) sin código personalizado, lo que garantiza compatibilidad directa con el ecosistema estándar de transformers y llama.cpp.

Su relevancia radica en el segmento de los modelos de lenguaje pequeños (SLM): con solo 100M de parámetros y 29,6B tokens de entrenamiento, alcanza un Intelligence Index de 26,07 en el Open SLM Leaderboard, por encima de alternativas de tamaño similar o superior como MobileLLM-R1-140M-base (140M) o GPT-X2.5-135M (135M). Es un modelo experimental orientado a investigación, educación y despliegue en hardware muy limitado, no a producción conversacional: es un modelo base que continúa texto y no está afinado para chat.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder estilo Llama (LlamaForCausalLM) |
| Parametros totales | 100.092.672 (100,1M: 75,5M no-embedding + 24,6M embedding embebido) |
| Parametros activos | no disponible (no es MoE; todos los parámetros están activos) |
| Longitud de contexto | 1.024 tokens |
| Tipos de cuantizacion | GGUF: F16, Q8_0, Q4_K_M |
| Idiomas soportados | Inglés |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors y GGUF |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder con configuración compacta: dimensión oculta de 768, 12 capas, 12 cabezas de consulta de 64 dimensiones con 4 cabezas KV mediante Grouped Query Attention (GQA), MLP SwiGLU de 2.048 dimensiones, RMSNorm y codificación posicional RoPE. El vocabulario es de 32.000 tokens SentencePiece con embeddings embebidos (tied embeddings), lo que reduce el número de parámetros totales.

El entrenamiento total abarcó 29,6B tokens: los 25,06B del modelo v3-Base más 4,56B tokens de continuación organizados en cinco etapas, cada una con re-calentamiento del learning rate (pico entre 3e-4 y 6e-4) seguido de decaimiento. Los pesos publicados corresponden al paso final de la última etapa (paso 113.000), no a una fusión de checkpoints. La mezcla de datos de continuación prioriza preguntas y respuestas con hechos destilados (30 %), web filtrada de alta calidad vía DCLM-Ultra-1.1, ClimbMix y FineWeb-Edu con puntuaciones 4-5 (23 %), libros de texto de Cosmopedia y WikiHow (21 %), Wikipedia densa y Simple English (11 %), y un 4,5 % de aritmética (Orca-Math, UltraData-Math y drills propios). Destaca la inclusión en la etapa final de unas 420.000 preguntas de ciencias de primaria con respuestas explicadas breves, generadas por Ling-3.0-Flash, eliminando cualquier ítem que compartiera una frase de 8 palabras con las preguntas de ARC para evitar contaminación del benchmark. El autor declara que no se usaron datos de entrenamiento ni test de los benchmarks evaluados.

## Capacidades

- Generación de texto en inglés como modelo base: continuación de texto, no conversación (no ha pasado por instrucciones ni RLHF/DPO).
- Razonamiento de ciencias a nivel escolar: la continuación con Q&A de ciencias de primaria mejora el rendimiento en ARC-Easy y ARC-Challenge.
- Aritmética y problemas matemáticos de enunciado: entrenado con Orca-Math, UltraData-Math y drills propios; puntúa 47,0 en ArithMark-3.0 y 40,7 en el conjunto held-out de 1.380 problemas.
- Conocimiento factual mediante datos destilados de Q&A (GooAQ, FactBase-DCLM, ELI5, finephrase FAQ).
- Comprensión de sentido común y conocimiento físico del mundo (PIQA 67,52).
- Compatibilidad con el ecosistema estándar: transformers, llama.cpp, LM Studio, Ollama y Jan sin código personalizado.
- No soporta tool calling, function calling, agentes, visión ni audio; no disponible.

## Casos de uso

- Investigación en modelos pequeños: sirve como punto de partida o baseline para experimentos de escalado, destilación y ablations, gracias a su entrenamiento documentado etapa por etapa y su licencia permisiva.
- Educación y docencia de NLP: su tamaño (100M) permite entrenarlo, fine-tunarlo y analizarlo íntegramente en hardware modesto, ideal para cursos y talleres sobre cómo se preentrenan los LLM.
- Prototipado en CPU y dispositivos de borde: con cuantización Q4_K_M ocupa solo 66 MB, lo que permite ejecutar inferencia local en portátiles, Raspberry Pi o móviles sin GPU.
- Completado de texto en editores ligeros: como modelo base, puede integrarse en herramientas de autocompletado simple de texto en inglés con latencias mínimas.
- Fine-tuning por especialización: su base en Llama permite afinarlo con LoRA o full fine-tuning para dominios concretos (FAQ, ciencias escolares, aritmética) con recursos mínimos.
- Evaluación comparativa de mezclas de datos: la documentación pública de su pipeline de continuación (cinco etapas, shares por categoría) lo hace útil como referencia reproducible para estudios de data mixing.
- Generación sintética de datos educativos: dada su exposición a Cosmopedia y contenidos escolares, puede usarse para sembrar o aumentar datasets de texto educativo simple en inglés.

## Benchmarks y rendimiento

Resultados declarados por el autor (zero-shot, conjuntos completos, acc_norm; entre paréntesis el raw acc para el propio modelo):

| Modelo | Params | Intelligence Index | HellaSwag | ARC-Easy | ARC-Challenge | PIQA | ArithMark-3.0 |
|---|--:|--:|--:|--:|--:|--:|--:|
| TinyBrainBot-100M-v5-Base | 100,1M | 26,07 | 34,98 (30,83) | 57,15 (62,92) | 34,47 (30,29) | 67,52 (67,57) | 47,00 (47,00) |
| TinyBrainBot-100M-v3-Base | 100,1M | 20,97 | 32,62 | 54,67 | 30,12 | 66,21 | 37,40 |
| void.1 | 90,2M | 24,38 | 39,5 | 49,3 | 29,4 | 67,2 | 43,7 |
| MobileLLM-R1-140M-base | 140M | 24,64 | 33,8 | 49,9 | 24,7 | 63,2 | 65,7 |
| BananaMind-2-Pro | 139M | 24,96 | 42,8 | 53,6 | 27,8 | 67,5 | 38,2 |
| GPT-X2.5-135M | 135M | 25,17 | 40,6 | 51,8 | 29,2 | 69,4 | 38,4 |

Los resultados del propio modelo provienen del model-index del autor y no están verificados por terceros; las cifras del resto de modelos provienen del Open SLM Leaderboard de AxiomicLabs. Como control de honestidad, el autor reporta 40,7 en 1.380 problemas de aritmética held-out (temas y redacciones no vistos en entrenamiento), frente a los 47,0 públicos de ArithMark-3.0.

## Requisitos de hardware

- VRAM para inferencia en precisión completa: aproximadamente 0,4-0,6 GB (el repo safetensors ocupa 0,6 GB); en F16 GGUF, unos 201 MB.
- Con cuantización Q8_0: unos 107 MB; con Q4_K_M: unos 66 MB. Cabe con holgura en cualquier GPU moderna e incluso solo en CPU.
- Consumer GPUs: cualquier GPU con 2 GB de VRAM o más es suficiente (GTX 1650, RTX 3060, RTX 4090, etc.); no se requiere GPU dedicada.
- CPU: plenamente viable; el modelo está pensado para ejecutarse en portátiles y dispositivos de borde.
- Despliegue: transformers (PyTorch), llama.cpp, LM Studio, Ollama y Jan mediante los GGUF publicados. La model card indica `add_space_prefix=false` en los GGUF para que la tokenización coincida exactamente con transformers.
- Latencia y throughput: no disponible; dada la escala (100M, contexto de 1.024 tokens), se espera inferencia rápida incluso en CPU, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Params | Contexto | Intelligence Index | Licencia | Disponibilidad |
|---|--:|:--|--:|:--|:--|
| TinyBrainBot-100M-v5-Base | 100,1M | 1.024 | 26,07 | Apache-2.0 | safetensors + GGUF (F16, Q8_0, Q4_K_M) |
| MobileLLM-R1-140M-base | 140M | no disponible | 24,64 | no disponible | Open SLM Leaderboard |
| GPT-X2.5-135M | 135M | no disponible | 25,17 | no disponible | Open SLM Leaderboard |
| void.1 | 90,2M | no disponible | 24,38 | no disponible | Open SLM Leaderboard |

En términos relativos, TinyBrainBot-100M-v5-Base supera en Intelligence Index a las tres alternativas pese a tener menos parámetros que dos de ellas, con ventajas especialmente notables en ARC-Easy (57,15 frente a 49,3-51,8) y ARC-Challenge (34,47 frente a 24,7-29,4). Sin embargo, queda por detrás en HellaSwag (34,98 frente a 39,5-42,8) y en ArithMark-3.0 frente a MobileLLM-R1-140M-base (47,0 frente a 65,7).

## Limitaciones y advertencias

- Es un modelo base: solo continúa texto, no sigue instrucciones ni mantiene conversaciones. No es apto para asistentes o chat sin un fine-tuning posterior.
- Contexto muy reducido de 1.024 tokens, insuficiente para documentos largos o conversaciones multi-turno extensas.
- Entrenado exclusivamente en inglés; el rendimiento en otros idiomas, incluido el castellano, no está garantizado y probablemente sea deficiente.
- Riesgo de alucinación elevado, típico de modelos de 100M sin alineación: puede generar hechos falsos con fluidez, especialmente fuera de dominios escolares y aritmética básica.
- Sesgos: no se ha documentado ningún análisis de sesgos; dado que el corpus incluye web (FineWeb-Edu, DCLM-Ultra) y Wikipedia, hereda los sesgos habituales de estos datos. No disponible información específica.
- Parte de los datos de Q&A de ciencias fue generada sintéticamente por otro modelo (Ling-3.0-Flash), lo que puede introducir errores o sesgos del modelo generador.
- Los benchmarks provienen del propio autor y no están verificados por terceros; conviene reproducirlos con lm-evaluation-harness antes de tomar decisiones.
- La model card del autor está truncada en su sección de limitaciones, por lo que pueden existir advertencias adicionales no documentadas.
- La licencia Apache-2.0 permite uso comercial sin restricciones significativas más allá de conservar el aviso de licencia.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/nkthebass/tinybrainbot-100m-v5-base
- Modelo anterior (v3-Base): https://huggingface.co/nkthebass/tinybrainbot-100m-v3-base
- Open SLM Leaderboard (AxiomicLabs): https://huggingface.co/spaces/AxiomicLabs/Open_SLM_Leaderboard
- Datasets de entrenamiento destacados: HuggingFaceFW/fineweb-edu, HuggingFaceTB/smollm-corpus, HuggingFaceTB/cosmopedia, ArrowLabs/DCLM-Ultra-1.1, karpathy/climbmix-400b-shuffle, microsoft/orca-math-word-problems-200k, openbmb/UltraData-Math
- Paper, repositorio de código y demos: no disponible
