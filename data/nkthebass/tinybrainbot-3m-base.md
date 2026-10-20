# nkthebass/tinybrainbot-3m-base

## Resumen

TinyBrainBot-3M-Base es un modelo de lenguaje de 2.942.928 parámetros entrenado desde cero por el usuario nkthebass y publicado en HuggingFace con licencia Apache 2.0. Emplea una arquitectura transformer decoder-only estándar de tipo Llama (`LlamaForCausalLM`), sin código personalizado: 10 capas, hidden size 144, 3 cabezas de consulta de 48 dimensiones con una única cabeza KV (GQA), SwiGLU de 416, RMSNorm, RoPE y un vocabulario BPE byte-level propio de 4.096 tokens con los dígitos separados uno por token. La ventana de contexto es de 1.024 tokens y el único idioma soportado es el inglés.

El entrenamiento consumió 5.200 millones de tokens (5.000 M de entrenamiento principal más 500 M de re-anneal final), mezclando FineWeb-Edu, Wikipedia, TinyStories, Cosmopedia sintética y datos generados de Q&A y aritmética de primaria verificada en Python. Es un modelo base: continúa texto, no mantiene conversaciones ni sigue instrucciones.

Su interés es el de banco de pruebas reproducible de modelos de ~3 M de parámetros: el autor lo sitúa en el Open SLM Leaderboard frente a GPT-S3-3M, Tokle-3M, pulvis-v2 y Purrence-3M, y documenta cómo un cambio de currículo aritmético (reescribir las sumas con muchas formulaciones distintas y re-annealar desde el checkpoint 36.000) subió ArithMark-3 de 33,6 a 45,0 y el índice de 7,33 a 10,34. No es un modelo para producción, sino para estudiar tokenización, mezcla de datos y currículos a escala mínima.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only tipo Llama (`LlamaForCausalLM`), pre-norm con RMSNorm, activación SwiGLU, RoPE, atención GQA |
| Parámetros totales | 2.942.928 (2,35 M sin embeddings + 0,59 M de embedding atado) |
| Parámetros activos | No aplica: no es un modelo MoE |
| Longitud de contexto | 1.024 tokens |
| Tipos de cuantización | F16 (GGUF publicado, 6 MB); Q8_0 no es posible porque el hidden size (144) no es múltiplo de 32; el resto de cuantizaciones no está disponible |
| Idiomas soportados | Inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (transformers) y GGUF F16 |
| Hidden size | 144 |
| Capas | 10 |
| Cabezas de atención | 3 cabezas de consulta de 48 dimensiones, 1 cabeza KV (GQA) |
| Dimensión feed-forward | 416 (SwiGLU) |
| Vocabulario | 4.096 tokens, BPE byte-level entrenado para este modelo, sin tokens desconocidos |
| Pipeline | text-generation |

## Arquitectura y entrenamiento

La arquitectura es un decoder-only denso convencional, replicable con la clase `LlamaForCausalLM` de transformers sin modificaciones. La atención usa GQA extrema (3 cabezas de consulta por cada cabeza KV), lo que mantiene reducida la caché KV, algo relevante en un modelo con hidden size de solo 144. El tokenizador es propio, byte-level BPE de 4.096 tokens, con dos decisiones explícitas: cada dígito ocupa un token y el espaciado en blanco se preserva exactamente, lo que abarata la aritmética dígito a dígito pero alarga las secuencias numéricas.

Los datos se reparten en un 25 % de Q&A y hechos destilados, 20 % de aritmética de primaria generada (cada resultado calculado en Python), 15 % de Cosmopedia Stanford + OpenStax, 15 % de TinyStories, 10 % de estilo cotidiano/how-to (WikiHow + destilado), 10 % de FineWeb-Edu y 5 % de entradillas de Wikipedia. No hay código en el corpus y, según el autor, no se usaron datos de entrenamiento ni de test de los benchmarks. El receta de entrenamiento es AdamW (betas 0,9/0,95, weight decay 0,1), LR pico 4e-3, schedule warmup-stable-decay, 131.000 tokens por paso, precisión mixta fp16 y 2× V100. El último ~10 % del entrenamiento es un anneal sobre una mezcla con más peso en los conjuntos destilados, alineado con la caída de learning rate.

La innovación documentada no está en la arquitectura sino en el proceso: la primera versión entrenaba la aritmética con un único patrón de frase y el modelo resolvía sumas de dos dígitos con acarreo el 99 % de las veces en ese patrón, pero rendía cerca del azar con cualquier otra formulación (33,6 en ArithMark-3). El autor sustituyó ese conjunto por aritmética escrita con muchas formulaciones distintas y re-annealó desde el checkpoint 36.000, obteniendo 45,0. Los pesos publicados son el checkpoint final de una única ejecución, no un merge.

## Capacidades

- Generación de texto corto en inglés, con prosa sencilla de nivel cuento infantil (herencia directa de TinyStories).
- Aritmética de primaria (sumas y operaciones escolares) en formulaciones familiares; el ejemplo de la model card resuelve «Ava had 23 apples. Ava got 19 more» devolviendo 42.
- Continuación de texto y autocompletado; no es un modelo de chat ni está ajustado con instrucciones.
- Respuesta a preguntas factuales simples y explicaciones cotidianas, gracias a la mezcla destilada de Q&A y how-to.
- Tokenizador sin tokens desconocidos y con espaciado exacto, útil para tareas de infilling y para estudiar el efecto de la tokenización numérica.
- Compatible con `text-generation-inference` y con endpoints según los tags del repositorio.
- No soporta tool calling, ni agentes, ni razonamiento multi-paso, ni visión, ni audio: no hay evidencia de ninguna de estas capacidades en la información disponible.

## Casos de uso

- Docencia de arquitecturas transformer: el modelo entero se define con hiperparámetros explícitos (144 de hidden, 10 capas, GQA, SwiGLU) y se entrena en 2× V100, lo que permite reproducir el ciclo completo tokenizador → preentrenamiento → evaluación en un curso o taller.
- Investigación de mezclas de datos: el experimento de re-anneal con aritmética reescrita es una plantilla directamente replicable para estudiar cómo la diversidad de formulaciones afecta a la generalización en modelos pequeños.
- Validación de harnesses de evaluación: sirve como modelo de humo para verificar que lm-eval 0.4.13 y el script oficial de ArithMark-3 funcionan antes de lanzar evaluaciones sobre modelos grandes, porque la inferencia completa en float32 es prácticamente instantánea.
- Pruebas de infraestructura y CI: al pesar ~6 MB en F16 y caber en CPU, es adecuado para tests de integración de pipelines de `transformers`, llama.cpp, LM Studio, Jan o TGI, y para validar endpoints sin coste de GPU.
- Demos de texto para dispositivos embebidos o edge: generación de continuaciones y microcuentos en hardware sin acelerador, con un GGUF de 6 MB y 1.024 tokens de contexto.
- Estudio de tokenizadores numéricos: la decisión de separar cada dígito en un token permite aislar el efecto del tokenizador en tareas aritméticas comparándolo con modelos de tamaño similar con BPE convencional.
- Referencia base para destilación o ablaciones: al ser un modelo from scratch con receta y reparto de datos publicados, sirve como línea base controlada frente a otros modelos de ~3 M en el Open SLM Leaderboard.

## Benchmarks y rendimiento

Resultados declarados por el autor, 0-shot, conjuntos de test completos, `acc_norm`, en float32 con lm-eval 0.4.13 y el script oficial de ArithMark-3. El model-index los marca como `verified: false`.

| Benchmark | Métrica | Resultado |
|---|---|---|
| ARC-Easy | acc_norm (0-shot) | 33,59 |
| ARC-Challenge | acc_norm (0-shot) | 24,91 |
| HellaSwag | acc_norm (0-shot) | 27,07 |
| PIQA | acc_norm (0-shot) | 55,98 |
| ArithMark-3 | acc_norm (0-shot) | 45,00 |

El autor publica además la precisión bruta (sin normalizar) para transparencia: ARC-Easy 35,48, ARC-Challenge 18,94, HellaSwag 26,69, PIQA 57,62, ArithMark-3 45,10, con un Intelligence Index de 10,37 frente al 10,34 calculado con acc_norm.

## Requisitos de hardware

- Pesos en fp16: ~5,9 MB; en fp32: ~11,8 MB. El GGUF F16 publicado ocupa 6 MB.
- VRAM estimada para inferencia: por debajo de 100 MB incluyendo el overhead del runtime; no hay medición publicada de consumo real.
- Cabe en cualquier GPU consumer (RTX 4090, RTX 3060, GTX 1650) y también en CPU, Raspberry Pi o móvil; no requiere acelerador dedicado.
- El entrenamiento se hizo en 2× V100 con fp16 mixto y 131.000 tokens por paso, según la model card.
- Despliegue: `transformers` (safetensors), llama.cpp, LM Studio y Jan mediante el GGUF F16. Los tags del repositorio incluyen `text-generation-inference` y `endpoints_compatible`. El soporte en vLLM u Ollama no está confirmado en la información disponible.
- Cuantización limitada: Q8_0 no es viable porque el hidden size 144 no es múltiplo de 32, así que las opciones prácticas se reducen a F16 (y, en su caso, cuantizaciones no publicadas).
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

Comparación publicada por el autor con modelos de 3 M de parámetros o menos, 0-shot, `acc_norm` sobre conjuntos completos, extraída del Open SLM Leaderboard.

| Modelo | Parámetros | Int Index | HellaSwag | ARC-E | ARC-C | PIQA | ArithMark-3 | Contexto | Licencia |
|---|---|---|---|---|---|---|---|---|---|
| TinyBrainBot-3M-Base | 2,94 M | 10,34 | 27,07 | 33,59 | 24,91 | 55,98 | 45,00 | 1.024 | Apache 2.0 |
| GPT-S3-3M | 2,97 M | 9,61 | 27,68 | 34,76 | 23,12 | 57,02 | 39,10 | no disponible | no disponible |
| Tokle-3M | 2,91 M | 8,91 | 27,20 | 34,85 | 23,98 | 55,01 | 40,80 | no disponible | no disponible |
| pulvis-v2 | 2,96 M | 8,62 | 27,93 | 31,86 | 22,78 | 56,86 | 37,40 | no disponible | no disponible |
| Purrence-3M | 2,99 M | 8,49 | 27,81 | 34,55 | 23,63 | 56,64 | 34,80 | no disponible | no disponible |

Lectura: TinyBrainBot-3M-Base lidera el índice agregado y ArithMark-3 gracias al re-anneal aritmético, pero queda por debajo de GPT-S3-3M y Tokle-3M en ARC-Easy y PIQA y por debajo de casi todos en HellaSwag. La ventaja se concentra, por tanto, en la tarea sobre la que se hizo el trabajo de currículo, no en un rendimiento general superior.

## Limitaciones y advertencias

- Solo inglés: no hay soporte de castellano ni de ningún otro idioma en los datos ni en la model card.
- Es un modelo base: continúa texto, no conversa ni sigue instrucciones. No se documenta SFT, RLHF ni DPO.
- Contexto de 1.024 tokens, insuficiente para documentos largos, conversaciones multi-turno o few-shot con muchos ejemplos.
- Aritmética frágil: el propio autor señala que, incluso tras el re-anneal, el modelo maneja mal las formulaciones de sumas que no ha visto. La habilidad está ligada a la redacción.
- Sin código en el corpus de entrenamiento: no es utilizable para generación de código ni para tareas de programación.
- Riesgo alto de alucinación y de texto incoherente más allá de frases cortas, inherente a 2,94 M de parámetros; no se han publicado evaluaciones de factualidad ni de seguridad.
- Benchmark no verificado: el model-index marca los resultados como `verified: false` y proceden del propio autor. El repositorio no tiene descargas ni likes, por lo que no hay validación externa de la comunidad.
- La sección de limitaciones de la model card aparece truncada en la información disponible («At 3M parameters this is a to...»), de modo que puede haber advertencias adicionales del autor no recogidas aquí.
- Licencia Apache 2.0: permite uso comercial y modificaciones con atribución, pero la idoneidad técnica para producción es nula a este tamaño.
- La cuantización Q8_0 no es posible por la forma del modelo, lo que limita las opciones de despliegue en formatos GGUF a F16.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/nkthebass/tinybrainbot-3m-base
- Open SLM Leaderboard (AxiomicLabs): https://huggingface.co/spaces/AxiomicLabs/Open_SLM_Leaderboard
- Dataset FineWeb-Edu: https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu
- Dataset Cosmopedia: https://huggingface.co/datasets/HuggingFaceTB/cosmopedia
- Dataset TinyStories: https://huggingface.co/datasets/roneneldan/TinyStories
- Dataset Wikipedia: https://huggingface.co/datasets/wikimedia/wikipedia
- Benchmark ARC: https://huggingface.co/datasets/allenai/ai2_arc
- Benchmark HellaSwag: https://huggingface.co/datasets/Rowan/hellaswag
- Benchmark PIQA: https://huggingface.co/datasets/ybisk/piqa
- Benchmark ArithMark-3: https://huggingface.co/datasets/AxiomicLabs/Arithmark-3.0
- Paper, repositorio de código y demo: no disponible en la información proporcionada.
