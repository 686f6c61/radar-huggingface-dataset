# FINAL-Bench/Darwin-31B-Opus

## Resumen

Darwin-31B-Opus es un modelo de lenguaje de 31.273 millones de parametros creado por FINAL-Bench mediante la fusion evolutiva de dos modelos de la familia Gemma 4: `google/gemma-4-31B-it` (denominado "Father") y `TeichAI/gemma-4-31B-it-Claude-Opus-Distill` (denominado "Mother"). El resultado es un modelo denso de tipo transformer orientado a razonamiento, con modo de pensamiento (thinking mode), contexto de 256K tokens y soporte declarado para mas de 140 idiomas. Su licencia es Apache 2.0, lo que facilita el uso comercial.

La propuesta tecnica diferencial es el motor de fusion "Darwin V6", que realiza un diagnostico a nivel de tensor de ambos modelos progenitores y asigna una proporcion de mezcla independiente a cada una de las 1.188 matrices de pesos, en lugar de aplicar un unico ratio uniforme como hacen las herramientas de merge convencionales. El autor lo presenta como una evolucion de las tecnicas DARE-TIES con guiado por diagnostico ("MRI-guided"). El objetivo declarado es combinar el conocimiento generalista y multimodal de Gemma 4 con la concentracion de capacidad de razonamiento (estilo Claude Opus) del modelo destilado.

El modelo es relevante en el contexto de la investigacion sobre fusion de modelos como alternativa de bajo coste al entrenamiento desde cero: parte de un modelo base multimodal con 256K de contexto y le superpone patrones de razonamiento especializados. El autor reporta un 85,9 % en GPQA Diamond, si bien ese resultado se obtiene con un motor de test-time denominado Darwin-DELPHI y esta marcado como no verificado en el model-index.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (base Gemma 4 Dense 31B), multimodal imagen-texto |
| Parametros totales | 31.273.088.876 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 256K tokens (segun model card del progenitor Gemma 4) |
| Tipos de cuantizacion | no disponible para este modelo concreto (el ecosistema Gemma 4 dispone de GGUF Q8 oficial en la variante 35B-A3B; para 31B-Opus el autor no lista cuantizaciones) |
| Idiomas soportados | en, ko, ja, zh y "multilingual" (la model card declara 140+ idiomas para la base Gemma 4) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (BF16), libreria transformers |
| Tamano del repositorio | 62,6 GB |
| Pipeline / tags | text-generation, image-text-to-text, darwin-v6, evolutionary-merge, dare-ties, reasoning, thinking |

## Arquitectura y entrenamiento

El modelo no se entrena desde cero: es el producto de una fusion de pesos (model merging) entre dos checkpoints derivados de Gemma 4 Dense 31B. La arquitectura subyacente es un transformer denso con capacidades multimodales (pipeline `image-text-to-text`), pensado para generacion de texto y razonamiento con modo de pensamiento explicito. La innovacion central es el motor Darwin V6, que realiza un escaneo de diagnostico (MDS) de ambos progenitores a nivel de capa y tensor: segun la model card, detecta concentracion de activacion en razonamiento en las capas L50-L60 del modelo "Mother" (destilado de Claude 4.6 Opus), activacion de codigo en capas tardias y patrones de coreano al inicio y al final de la red. A partir de ese diagnostico asigna un ratio de mezcla distinto a cada una de las 1.188 matrices de pesos, en lugar de un ratio global.

El modelo "Mother" (`TeichAI/gemma-4-31B-it-Claude-Opus-Distill`) aporta destilacion de razonamiento de alta intensidad de Claude 4.6 Opus, con foco en codigo, ciencia y analisis; el "Father" aporta el conocimiento generalista y las capacidades multimodales de Gemma 4. No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset ni si hubo fases de RLHF o DPO posteriores al merge. El autor menciona un "Darwin-DELPHI test-time engine" como componente de inferencia que eleva el rendimiento en benchmarks de razonamiento cientifico, pero no se detalla su implementacion (posible decodificacion especulativa, muestreo multiple o seleccion de candidatos).

## Capacidades

- Generacion de texto conversacional multiturno con contexto de hasta 256K tokens.
- Razonamiento con modo de pensamiento (thinking mode) y razonamiento cientifico de nivel posgrado (declarado a partir del resultado en GPQA Diamond).
- Capacidades multimodales imagen-texto (heredadas de la base Gemma 4).
- Generacion y analisis de codigo, con activacion reforzada en capas tardias segun el diagnostico del autor.
- Capacidades multilingues: ingles, coreano, japones, chino y cobertura amplia declarada (140+ idiomas en la base).
- Soporte de tool calling / function calling: no disponible de forma explicita en la informacion proporcionada (la base Gemma 4 suele soportarlo, pero no se confirma para este merge).
- Soporte de agentes y razonamiento multi-paso: no confirmado de forma explicita; el motor Darwin-DELPHI opera en tiempo de inferencia sobre la respuesta.
- Integracion con `transformers` y compatibilidad con endpoints HF (`endpoints_compatible`).

## Casos de uso

- Razonamiento cientifico asistido: el modelo esta optimizado para preguntas de nivel doctorado (GPQA Diamond) y puede emplearse en asistentes de investigacion que requieran justificar respuestas tecnicas con cadenas de razonamiento explicitas en modo thinking.
- Analisis de documentos largos: con 256K tokens de contexto se pueden procesar articulos completos, informes tecnicos o bases de codigo extensas en una sola pasada, extrayendo conclusiones y referencias cruzadas.
- Asistencia a la programacion: la destilacion de razonamiento orientada a codigo permite usarlo en revisiones de PR, generacion de tests y explicacion de errores en pipelines de CI/CD, integrandolo via la API de `transformers`.
- Atencion al cliente multilingue: la cobertura de en, ko, ja, zh y otros idiomas facilita despliegues de soporte en mercados asiaticos y occidentales con un unico modelo.
- Procesamiento de documentos con imagenes: al soportar entrada imagen-texto, puede extraer informacion de capturas, diagramas y formularios escaneados en flujos de digitalizacion.
- Generacion de contenido tecnico y divulgativo: redaccion de documentacion, resumenes ejecutivos y material formativo con control del nivel de detalle mediante el modo thinking.
- Evaluacion y benchmarking interno: util como modelo de referencia en pipelines que comparen merges evolutivos frente al modelo base en tareas de razonamiento cientifico.

## Benchmarks y rendimiento

Datos declarados por el autor en el model-index y la model card. El resultado de GPQA Diamond esta marcado como `verified: false`.

| Benchmark | Darwin-31B-Opus | Notas |
|---|---|---|
| GPQA Diamond (198 preguntas, nivel doctorado) | 85,9 % accuracy | Medido con el motor Darwin-DELPHI de test-time |
| ARC-Challenge (200 preguntas, 0-shot, loglikelihood) | 82,89 % | Metrica de seleccion evolutiva |

No se han publicado en la informacion disponible resultados de MMLU, HumanEval, GSM8K ni comparaciones directas con otros modelos en la misma tabla. El dato de GPQA Diamond debe interpretarse con cautela: corresponde a un procedimiento de test-time especifico y no necesariamente a una evaluacion estandar de una sola pasada.

## Requisitos de hardware

- Pesos en BF16: aproximadamente 62,6 GB de repositorio, lo que exige al menos 64 GB de VRAM o memoria unificada para carga completa en precision nativa.
- GPU recomendadas en BF16: A100 80 GB, H100 80 GB o dos GPU de 48 GB con tensor parallelism (por ejemplo, 2x L40S o 2x RTX 6000 Ada).
- Cuantizacion a 8 bits: en torno a 31-33 GB, viable en una RTX 6000 Ada (48 GB) o A6000; a 4 bits, aproximadamente 17-19 GB, lo que permite ejecucion en una RTX 4090 (24 GB).
- Cabe en GPU de consumo solo mediante cuantizacion: RTX 4090/5090 a 4-5 bits; en 24 GB no cabe en BF16.
- En CPU/memoria unificada: posible con cuantizacion GGUF a 4 bits (unos 18 GB de RAM), aunque el autor no publica GGUF oficial para esta variante; si publica Q8 oficial para la variante 35B-A3B.
- Opciones de despliegue: `transformers` con `device_map="auto"`, vLLM o TGI para BF16 en A100/H100; llama.cpp u Ollama si se generan cuantizaciones GGUF a partir de los safetensors.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Darwin-31B-Opus | 31,27B denso | 256K | Apache 2.0 | Merge evolutivo Darwin V6; 85,9 % GPQA Diamond con Darwin-DELPHI |
| google/gemma-4-31B-it (progenitor) | 31B denso | 256K | Gemma Terms (uso comercial con restricciones) | Base multimodal; LMArena 1452 segun el autor |
| TeichAI/gemma-4-31B-it-Claude-Opus-Distill (progenitor) | 31B denso | 256K | no disponible | Destilacion de razonamiento de Claude 4.6 Opus |
| Darwin-35B-A3B-Opus | 35B totales, 3B activos (MoE) | no disponible | Apache 2.0 | Variante MoE de la misma familia, con GGUF Q8 oficial |

La comparativa directa con modelos de otros laboratorios (Llama, Qwen, Mistral) no esta disponible en la informacion proporcionada.

## Limitaciones y advertencias

- El resultado de GPQA Diamond (85,9 %) se ha obtenido con el motor de test-time Darwin-DELPHI y esta marcado como no verificado; no equivale a una evaluacion estandar y puede no reproducirse con decodificacion convencional.
- Es un merge de pesos, no un modelo entrenado de forma independiente: puede heredar sesgos y fallos de ambos progenitores, incluidos los del modelo destilado de Claude Opus.
- La destilacion desde un modelo propietario (Claude 4.6 Opus) plantea dudas sobre las condiciones de uso del progenitor "Mother"; el autor no detalla la licencia de ese checkpoint.
- Riesgo de alucinacion inherente a los modelos de 31B en tareas cientificas de nivel doctorado, especialmente fuera del modo thinking.
- La cobertura multilingue declarada (140+ idiomas) proviene de la base Gemma 4 y no se ha verificado especificamente para este merge.
- No se documentan cuantizaciones oficiales (GGUF, AWQ, GPTQ) para esta variante, lo que complica el despliegue en hardware de consumo.
- No se confirma soporte explicito de tool calling ni de agentes multi-paso en la informacion disponible.
- La licencia Apache 2.0 permite uso comercial, pero conviene revisar las condiciones de Gemma 4 por si el merge arrastra obligaciones adicionales.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/FINAL-Bench/Darwin-31B-Opus
- Demo (Space): https://huggingface.co/spaces/FINAL-Bench/Darwin-31B-Opus
- Progenitor Father: https://huggingface.co/google/gemma-4-31B-it
- Progenitor Mother: https://huggingface.co/TeichAI/gemma-4-31B-it-Claude-Opus-Distill
- Variante MoE: https://huggingface.co/FINAL-Bench/Darwin-35B-A3B-Opus
- GGUF oficial de la variante MoE: https://huggingface.co/FINAL-Bench/Darwin-35B-A3B-Opus-Q8-GGUF
- GGUF de bartowski (variante MoE): https://huggingface.co/bartowski/FINAL-Bench_Darwin-35B-A3B-Opus-GGUF
- Variante 9B: https://huggingface.co/FINAL-Bench/Darwin-9B-Opus
- Variante 4B Gen1: https://huggingface.co/FINAL-Bench/Darwin-4B-Opus
- Variante 4B Gen2: https://huggingface.co/FINAL-Bench/Darwin-4B-David
- Variante 4B Gen3: https://huggingface.co/FINAL-Bench/Darwin-4B-Genesis
- Familia POCKET (on-device): https://huggingface.co/collections/FINAL-Bench/pocket-models-6a618ee5d23eafb7e185a5c6
- Demo POCKET CPU: https://huggingface.co/spaces/FINAL-Bench/POCKET-35B-CPU
- Leaderboard FINAL Bench: https://huggingface.co/spaces/FINAL-Bench/Leaderboard
- Leaderboard ALL Bench: https://huggingface.co/spaces/FINAL-Bench/all-bench-leaderboard
- Paper referenciado (arxiv:2311.03099): https://arxiv.org/abs/2311.03099
- Paper referenciado (arxiv:2605.14386): https://arxiv.org/abs/2605.14386
