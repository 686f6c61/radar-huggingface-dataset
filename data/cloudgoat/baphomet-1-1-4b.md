# CloudGoat/Baphomet-1.1-4B

## Resumen

Baphomet-1.1-4B es un modelo de lenguaje y vision de 4.660 millones de parametros publicado por el usuario CloudGoat en Hugging Face. No se trata de un modelo entrenado desde cero, sino de una **fusion lineal de vectores de tarea** (task-vector merge) sobre el modelo base Qwen/Qwen3.5-4B. Concretamente, combina ocho "vectores de tarea" derivados de otros tantos modelos donantes de aproximadamente 4B de parametros, cada uno ponderado con un coeficiente λ individual obtenido mediante busqueda evolutiva.

La innovacion principal frente a su predecesor (Baphomet-1.0-4B) es que, en lugar de aplicar un peso uniforme de 0,1375 a todos los donantes, utiliza coeficientes λᵢ especificos por donante hallados con una implementacion de **EvoGM** ("Learning to Merge LLMs via Evolutionary Generative Optimization"). El resultado es un modelo que hereda capacidades de razonamiento, codigo, agentes y vision de los ocho donantes, con la misma arquitectura que Qwen3.5-4B (32 capas, contexto de 262.144 tokens, atencion hibrida con capas de atencion lineal y completa).

Es relevante para desarrolladores e investigadores porque demuestra una via de bajo coste (unas 13,7 horas-kernel en Kaggle T4×2) para mejorar un modelo base de 4B sin reentrenamiento, logrando una mejora de +9,4 puntos porcentuales sobre Qwen3.5-4B en un test pareado de 180 items (MMLU-Pro, GPQA-Diamond y BFCL non-live), aunque la mejora sobre Baphomet-1.0 no alcanza significacion estadistica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3_5ForConditionalGeneration (transformer hibrido con atencion lineal y completa, mas capa MTP) |
| Parametros totales | 4.659.865.088 (4,66B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | no disponible en la informacion proporcionada (pesos publicados en bf16; fp32 en tensores A_log y de normalizacion) |
| Idiomas soportados | en (ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (2 shards, bf16) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de Qwen3.5-4B: 32 capas de texto con hidden size 2560, 16 cabezas de consulta y 4 de clave/valor (GQA), head_dim 256, FFN con intermediate 9216 y activacion SiLU, embeddings atados (tie_word_embeddings) y vocabulario de 248.320 tokens con tokenizador Qwen2Tokenizer (BPE). La atencion sigue un patron repetitivo de 3 capas de atencion lineal seguidas de 1 capa de atencion completa, e incluye una capa MTP (multi-token prediction) adicional. El pipeline declarado es image-text-to-text, por lo que integra capacidades de vision heredadas del base.

No hay entrenamiento supervisado ni RLHF/DPO en este modelo. El proceso es una fusion de pesos: para cada donante se calcula el vector de tarea Tᵢ = W_donorᵢ − W_base en fp32, se almacena en fp8 e4m3 con escala absmax por fila, y se recombina como W = W_base + Σ λᵢ · Tᵢ, acumulando en fp32 y devolviendo a bf16. La busqueda de coeficientes con EvoGM uso generadores MLP duales entrenados sobre divisiones ganador/perdedor de la poblacion, con λᵢ ∈ [−1, 1] y rondas de cambio de base. La ronda 1 evaluo 40 candidatos sobre un conjunto de fitness de 110 items; las rondas 2 y 3 evaluaron 64 candidatos adicionales sobre un subconjunto de 40 items seleccionado por informacion de Fisher, estimando el resto con un modelo IRT 2PL. El coste total fue de aproximadamente 13,7 horas-kernel en Kaggle T4×2 con vLLM 0.33.0.

## Capacidades

- Generacion de texto y razonamiento en modo thinking (el modelo produce cadenas de razonamiento antes de responder).
- Codigo y matematicas, heredado principalmente de los donantes Qwopus3.5-4B-Coder y Qwen3.8-4B-Distill.
- Capacidades de agente y tool calling / function calling, reforzadas por el donante Agents-A1-4B.
- Razonamiento cientifico y de nivel experto, reforzado por los donantes entrenados sobre GPQA y MMLU-Pro.
- Vision y procesamiento image-text-to-text, heredado de la arquitectura del base Qwen3.5-4B.
- Instrucciones conversacionales multi-turno con contexto largo de hasta 262.144 tokens.
- Capacidad de prediccion multi-token (capa MTP), util para decodificacion especulativa en inferencia.
- Multilingue: limitado a ingles segun la model card (el base Qwen3.5-4B soporta mas idiomas, pero la ficha solo declara en).

## Casos de uso

- **Razonamiento cientifico asistido:** el modelo rinde en GPQA-Diamond y MMLU-Pro, por lo que puede emplearse para responder preguntas de nivel posgrado en fisica, quimica o biologia, con cadenas de razonamiento trazables en modo thinking.
- **Agentes con tool calling:** al incorporar el donante Agents-A1-4B, puede integrarse en pipelines de agentes que invocan APIs, consultan bases de datos o ejecutan funciones, con contexto suficiente para mantener el estado de la conversacion.
- **Generacion de codigo en produccion:** hereda capacidades de Qwopus3.5-4B-Coder; puede integrarse en herramientas de autocompletado, revision de PRs o generacion de tests, con un coste de inferencia bajo al ser un modelo de 4B.
- **Atencion al cliente automatizada:** su ventana de 262.144 tokens permite gestionar conversaciones multi-turno con historiales largos y documentos de referencia adjuntos sin truncar.
- **Analisis de documentos con imagenes:** al ser image-text-to-text, puede extraer informacion de capturas, diagramas o formularios escaneados y combinarla con razonamiento textual.
- **Prototipado rapido en investigacion:** su licencia Apache 2.0 y su tamano permiten desplegarlo en una sola GPU consumer para experimentar con tecnicas de fusion de modelos o como baseline en evaluaciones de razonamiento.
- **Evaluacion de tecnicas de model merging:** sirve como caso de estudio reproducible de EvoGM y de fusion lineal de vectores de tarea, con coeficientes y metodologia publicados.

## Benchmarks y rendimiento

Los unicos datos publicados en la informacion disponible son los de un test pareado de 180 items (MMLU-Pro, GPQA-Diamond y BFCL non-live) con un limite de 8192 tokens en modo thinking:

| Modelo | Precision en test pareado (180 items) | Tokens medios de salida |
|---|---|---|
| Baphomet-1.1-4B | 79,4 % | 1.834 |
| Baphomet-1.0-4B | 77,8 % | 3.180 |
| Qwen3.5-4B (base) | 70,0 % | no disponible |

La mejora sobre Qwen3.5-4B es estadisticamente significativa; la mejora sobre Baphomet-1.0 no lo es. En el conjunto de fitness de 110 items (4096 tokens de limite), la evolucion de la puntuacion fue: Baphomet-1.0 con λ 0,603 → mejor de la ronda 1 0,722 → ronda 2 0,733 → Baphomet-1.1 0,764.

No se han publicado resultados desglosados por benchmark (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 9,3 GB solo para pesos, mas overhead de activaciones y cache KV; en la practica se recomiendan 16-24 GB para contexto largo.
- En cuantizacion de 8 bits cabria en GPUs de 12-16 GB; en 4 bits, en GPUs de 8 GB, aunque no se documentan cuantizaciones oficiales en la informacion disponible.
- GPU recomendadas: A100, H100 o L40S para produccion con contexto largo; RTX 4090 (24 GB) para desarrollo y despliegue en bf16 con contexto moderado; RTX 3090/4080 para cuantizaciones.
- Cabe en GPUs consumer de gama alta (RTX 4090, RTX 3090) en bf16; en GPUs de 8-12 GB requeriria cuantizacion.
- Opciones de despliegue: vLLM (usado por el autor en la evaluacion, version 0.33.0), transformers, y presumiblemente llama.cpp/Ollama si se generan GGUF, aunque no se confirma en la informacion disponible.
- Latencia y throughput: no disponibles. El autor menciona que el modelo piensa mas corto que 1.0 (1.834 vs 3.180 tokens medios), lo que reduce latencia efectiva en modo thinking.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Precision test pareado | Licencia | Notas |
|---|---|---|---|---|---|
| Baphomet-1.1-4B | 4,66B | 262.144 | 79,4 % | Apache 2.0 | Fusion EvoGM de 8 donantes |
| Baphomet-1.0-4B | ~4,66B | 262.144 | 77,8 % | Apache 2.0 | Fusion lineal con λ uniforme 0,1375 |
| Qwen3.5-4B | ~4B | 262.144 | 70,0 % | Apache 2.0 | Modelo base sin fusionar |
| Qwen3.8-4B-Distill | ~4B | no disponible | no disponible | no disponible | Donante con mayor peso (λ 0,59) |

Los datos de Qwen3.8-4B-Distill y otros donantes no estan disponibles en la informacion proporcionada; la comparativa se limita a los tres modelos evaluados por el autor.

## Limitaciones y advertencias

- Solo declara soporte de ingles; el rendimiento en castellano u otros idiomas no esta documentado y puede degradarse respecto al base.
- Riesgo de alucinacion inherente a los modelos de 4B, especialmente en dominios especializados; el modo thinking no elimina este riesgo.
- La mejora sobre Baphomet-1.0 no es estadisticamente significativa, por lo que la eleccion entre ambas versiones puede depender de otros factores (longitud de salida, latencia).
- La evaluacion se limita a 180 items de tres benchmarks; no hay datos sobre HumanEval, GSM8K ni tareas de vision, pese a que el pipeline es image-text-to-text.
- El autor advierte que vLLM cargo los pesos como fp16 durante la evaluacion, lo que puede introducir diferencias menores respecto a la inferencia en bf16.
- La fusion en fp8 de los vectores de tarea introduce desviaciones de hasta aproximadamente 1 ulp de bf16 respecto a una fusion exacta en fp32.
- Licencia Apache 2.0 permite uso comercial, pero se recomienda verificar las licencias de los ocho modelos donantes, ya que la fusion puede heredar restricciones adicionales no documentadas.
- Modelo experimental de investigacion (version 1.1), sin garantias de estabilidad ni soporte del autor.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/CloudGoat/Baphomet-1.1-4B
- Predecesor Baphomet-1.0-4B: https://huggingface.co/CloudGoat/Baphomet-1.0-4B
- Repositorio EvoGM: https://github.com/JiangTao97/evogm
- Paper EvoGM (arXiv): https://arxiv.org/abs/2511.21437
- Modelo base Qwen3.5-4B: https://huggingface.co/Qwen/Qwen3.5-4B
- Donante Agents-A1-4B: https://huggingface.co/InternScience/Agents-A1-4B
- Donante DeepSeek-V4-Pro-Qwen3.5-4B: https://huggingface.co/Jackrong/DeepSeek-V4-Pro-Qwen3.5-4B
- Donante Qwen3.8-4B-Distill: https://huggingface.co/empero-ai/Qwen3.8-4B-Distill
- Donante Qwopus3.5-4B-Coder: https://huggingface.co/Jackrong/Qwopus3.5-4B-Coder
- Donante Qwopus3.5-4B-v3: https://huggingface.co/Jackrong/Qwopus3.5-4B-v3
- Donante AREX-Turbo: https://huggingface.co/BAAI/AREX-Turbo
- Donante NeoHorse-1-4B: https://huggingface.co/TokenRhythm/NeoHorse-1-4B
- Donante tmax-4b: https://huggingface.co/allenai/tmax-4b
