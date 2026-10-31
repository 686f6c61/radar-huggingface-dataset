# onnx-community/tinybrainbot-10m-v2-base-ONNX

## Resumen

TinyBrainBot-10M-v2-Base es un modelo lingüístico de propósito general de tan solo 9,9 millones de parámetros, entrenado desde cero por el usuario de Hugging Face nkthebass y distribuido en formato ONNX por onnx-community. Se trata de un modelo base (no conversacional) implementado como una arquitectura Llama estándar (`LlamaForCausalLM`), entrenado con 10,16 mil millones de tokens de texto web, preguntas y respuestas, datos de sentido común y aritmética.

Su relevancia no reside en competir con modelos grandes, sino en demostrar cuánta capacidad se puede comprimir en un modelo de menos de 10M de parámetros: según el Open SLM Leaderboard de AxiomicLabs, supera a otros modelos de su clase (10M o menos) en índice de inteligencia y en aritmética. Con un tamaño de repositorio de 0,1 GB y versiones GGUF de 11-20 MB, es ideal para ejecutarse en el navegador con Transformers.js o en hardware extremadamente limitado, como dispositivos embebidos o móviles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Llama (LlamaForCausalLM), decoder transformer con GQA |
| Parametros totales | 9.902.336 (8,85M no-embedding + 1,05M embedding empatizado) |
| Parametros activos | no disponible (no es MoE; todos los parámetros están activos) |
| Longitud de contexto | 1.024 tokens |
| Tipos de cuantizacion | F16 y Q8_0 (GGUF); versión ONNX sin cuantización especificada |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (esta versión); safetensors (original) y GGUF (F16, 20 MB; Q8_0, 11 MB) en el modelo base |

## Arquitectura y entrenamiento

El modelo es un transformer decoder de estilo Llama con las siguientes dimensiones internas: hidden size de 256, 12 capas, 4 cabezas de consulta de 64 dimensiones con 2 cabezas KV (Grouped Query Attention), MLP SwiGLU de 704 dimensiones, normalización RMSNorm y codificación posicional RoPE. El vocabulario es un BPE a nivel de bytes de 4.096 tokens, con una particularidad notable: los dígitos se dividen en un token por cifra y los espacios en blanco se conservan exactamente, lo que probablemente favorece el rendimiento aritmético.

El entrenamiento consumió 10,16 mil millones de tokens en dos fases: 8,57B de preentrenamiento a tasa de aprendizaje constante y 1,59B de fase de decay. La mezcla de datos incluye DCLM-Ultra (25 %), Cosmopedia de Stanford (24,6 %), conjuntos destilados de Q&A y hechos (15 %), FineWeb-Edu (10 %), aritmética con drills propios, Orca-Math y UltraData-Math (9 %), TinyStories (8 %), escritura explicativa (4,4 %) e introducciones de Wikipedia (4 %). La fase de decay refuerza Q&A, hechos y sentido común. No hay indicios de RLHF ni DPO: es un modelo base entrenado únicamente con modelado de lenguaje.

## Capacidades

- Continuación de texto en inglés: genera texto corto y simple a partir de un prompt (no es un modelo de chat).
- Aritmética en lenguaje natural: resuelve problemas de sumas y operaciones básicas formuladas en texto, con un 49,5 % de precisión en ArithMark-3.0 y 49,1 % en ecuaciones simples ("43 + 19 =").
- Conocimiento de hechos y sentido común: 36,87 % en ARC-Easy y 58,65 % en PIQA (0-shot, acc_norm).
- Comprensión narrativa simple: entrenado con TinyStories, adecuado para generar y continuar historias cortas.
- Ejecución en navegador: disponible en ONNX para Transformers.js, sin necesidad de servidor ni GPU.
- No soporta: tool calling, agentes, razonamiento multi-paso, visión, audio ni modo de pensamiento extendido (no disponible en la información proporcionada).

## Casos de uso

- Demostraciones de LLM en el navegador: con Transformers.js y la versión ONNX se puede ejecutar el modelo íntegramente en el cliente, ideal para tutoriales, portfolios o páginas interactivas sin coste de inferencia en servidor.
- Dispositivos embebidos y microcontroladores: con 11 MB en Q8_0, cabe en hardware sin GPU y con memoria muy limitada, útil para prototipos de IoT con generación de texto básica.
- Educación sobre LLMs: su tamaño lo hace abordable para estudiar internamente un transformer completo (todas las matrices son manejables), útil como material didáctico en cursos sobre cómo funciona un LLM por dentro.
- Benchmarking de modelos diminutos: sirve como línea base reproducible para comparar técnicas de entrenamiento en la categoría sub-10M, dado que publica resultados detallados en conjuntos estándar.
- Generación de historias infantiles simples: gracias a TinyStories en su mezcla de datos, puede continuar narraciones cortas de vocabulario sencillo en inglés.
- Práctica de aritmética básica: puede completar operaciones aritméticas sencillas en formato de texto, útil como juguete educativo o para evaluar cómo los modelos pequeños aprenden aritmética.
- Autocompletado ligero en aplicaciones offline: como modelo base de texto simple, puede alimentar autocompletado básico en apps que no pueden depender de la red.

## Benchmarks y rendimiento

Resultados declarados por el autor (0-shot, acc_norm, conjuntos completos), comparados con modelos de 10M o menos según el Open SLM Leaderboard:

| Modelo | Params | Índice inteligencia | HellaSwag | ARC-E | ARC-C | PIQA | ArithMark-3 |
|---|--:|--:|--:|--:|--:|--:|--:|
| TinyBrainBot-10M-v2-Base | 9,90M | 13,76 | 27,75 | 36,87 | 25,17 | 58,65 | 49,50 |
| Ethoric-10M | 9,97M | 12,94 | 28,75 | 37,58 | 24,66 | 59,85 | 41,60 |
| min-spark-1.7 | 9,98M | 12,71 | 29,65 | 39,90 | 24,15 | 60,39 | 36,60 |
| ForgePlex-M2.2-10M | 9,99M | 12,12 | 29,19 | 39,77 | 22,70 | 59,79 | 37,40 |
| heron1i-flash-lite-v2 | 9,92M | 11,11 | 28,86 | 38,89 | 23,38 | 58,54 | 36,70 |

Resultados aritméticos adicionales en conjuntos no vistos durante el entrenamiento (acc_norm): historias aritméticas escritas por Gemma (38,4), historias escritas por Llama (45,6), 23 temas nuevos de aritmética (39,6), formatos numéricos reservados: grandes / comas / dinero (56,2 / 63,9 / 60,6), ecuaciones simples de ArithMark-3 (49,1) y ArithMark-2 (34,4).

## Requisitos de hardware

- VRAM estimada para inferencia: mínima; el modelo completo en F16 ocupa unos 20 MB y en Q8_0 unos 11 MB, por lo que no se requiere GPU dedicada.
- GPU recomendadas: ninguna en particular; cualquier GPU moderna lo ejecuta sin esfuerzo, y de hecho no es necesario usar GPU.
- Consumer GPUs: cabe con holgura en cualquier GPU, incluidas integradas; también funciona en CPU y directamente en el navegador vía WebGPU/WASM con Transformers.js.
- Opciones de despliegue: Transformers.js (navegador), llama.cpp, LM Studio y Jan (con los GGUF publicados), y Transformers de Hugging Face en Python.
- Latencia y throughput: no disponible; dado el tamaño (9,9M de parámetros), la inferencia es prácticamente instantánea en cualquier hardware moderno.

## Comparativa con modelos similares

| Modelo | Params | Contexto | Índice inteligencia | Licencia | Disponibilidad |
|---|--:|:--|--:|:--|:--|
| TinyBrainBot-10M-v2-Base | 9,90M | 1.024 | 13,76 | Apache 2.0 | ONNX, GGUF, safetensors |
| Ethoric-10M | 9,97M | no disponible | 12,94 | no disponible | Open SLM Leaderboard |
| min-spark-1.7 | 9,98M | no disponible | 12,71 | no disponible | Open SLM Leaderboard |
| ForgePlex-M2.2-10M | 9,99M | no disponible | 12,12 | no disponible | Open SLM Leaderboard |

TinyBrainBot-10M-v2-Base lidera su categoría en índice de inteligencia y destaca claramente en aritmética (49,5 frente a 36,6-41,6 de sus competidores), aunque queda por detrás en HellaSwag, ARC-Easy y PIQA frente a min-spark-1.7 y Ethoric-10M.

## Limitaciones y advertencias

- Es un modelo base, no conversacional: continúa texto y no sigue instrucciones ni mantiene diálogos con formato de chat.
- Calidad de salida muy limitada: a 9,9M de parámetros, el autor advierte que hay que esperar texto corto y simple; no es apto para generación de contenido de calidad.
- Solo inglés: no está diseñado para otros idiomas, incluido el castellano.
- Contexto de solo 1.024 tokens: insuficiente para documentos largos o conversaciones extensas.
- Riesgo alto de alucinación y incoherencia: inherente a su tamaño, puede generar hechos falsos y texto sin sentido con facilidad.
- Sesgos: entrenado mayoritariamente con datos web (DCLM-Ultra, FineWeb-Edu, Cosmopedia), por lo que hereda los sesgos de esos corpus; no hay análisis de sesgos publicado.
- Benchmarks no verificados: los resultados provienen de la model card del autor y del Open SLM Leaderboard, sin verificación independiente confirmada.
- Uso comercial: la licencia Apache 2.0 lo permite, aunque su utilidad práctica en producción es limitada por diseño.

## Enlaces

- Modelo ONNX: https://huggingface.co/onnx-community/tinybrainbot-10m-v2-base-ONNX
- Modelo original: https://huggingface.co/nkthebass/tinybrainbot-10m-v2-base
- Predecesor (10M v1): https://huggingface.co/nkthebass/tinybrainbot-10m-base
- Modelo hermano (3M v2): https://huggingface.co/nkthebass/tinybrainbot-3m-v2-base
- Space de conversión a ONNX: https://huggingface.co/spaces/onnx-community/convert-to-onnx
- Open SLM Leaderboard: https://huggingface.co/spaces/AxiomicLabs/Open_SLM_Leaderboard
- Documentación de Transformers.js (pipeline text-generation): https://huggingface.co/docs/transformers.js/api/pipelines#module_pipelines.TextGenerationPipeline
- Datasets principales: https://huggingface.co/datasets/ArrowLabs/DCLM-Ultra y https://huggingface.co/datasets/ArrowLabs/DCLM-Ultra-1.1
