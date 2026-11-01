# Atlas-AI-research/Axiom-1.1-Chat

## Resumen

Axiom-1.1-Chat es un modelo de lenguaje experimental de 64,7 millones de parámetros desarrollado por Atlas-AI-research (con autoría de Lee Madover) sobre la arquitectura AXIOM, una propuesta sin atención (*attention-free*) basada en recurrencia lineal con estado constante y una capa de mezcla de expertos denominada Law Cells. Es la segunda iteración de la familia y se presenta explícitamente como un artefacto de investigación, no como un producto listo para producción. Resuelve, en el marco de su escala, el problema de generar respuestas conversacionales en inglés con un coste de memoria mínimo: al no usar atención, no mantiene caché KV y su estado por capa es O(1) durante la generación.

La relevancia de esta versión frente a Axiom-1 radica en dos cambios medibles: duplica los datos de preentrenamiento (6,3B tokens frente a 3,15B, usando los 10 shards de FineWeb-Edu `sample-10BT`) y reajusta los datos de conversación para que el modelo decline responder cuando no conoce un hecho, en lugar de inventarlo. El modelo se entrenó íntegramente en una única GPU de consumo (NVIDIA RTX 5070 de 12 GB) en unas 25 horas de GPU, lo que lo convierte en una referencia interesante para estudiar arquitecturas alternativas a la atención en entornos con recursos limitados.

La ventana de contexto de entrenamiento es de 1.024 tokens, los pesos están en fp32 y el tokenizador es un BPE a nivel de byte de 16.384 tokens. No es compatible con `transformers` ni con `trust_remote_code`: requiere el código del repositorio del autor para cargarse.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | AXIOM: transformer sin atención, con memoria de trabajo recurrente lineal con compuertas (una decaimiento por cabeza) y Law Cells (MoE) por capa |
| Parametros totales | 64.722.872 (64,7M), todos activos en cada token |
| Parametros activos | No aplica en sentido estricto: top-2 routing sobre 2 Law Cells por capa, por lo que ambos expertos se usan en cada token |
| Longitud de contexto | 1.024 tokens (ventana de entrenamiento) |
| Tipos de cuantizacion | No disponible (pesos publicados en fp32; no se documentan cuantizaciones oficiales) |
| Idiomas soportados | Inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería PyTorch; requiere el código propio del repositorio, sin loader de `transformers`) |

Detalles adicionales de arquitectura: 12 capas, anchura 640, 10 cabezas de memoria, 2 Law Cells por capa con proyección 640 → 1280 → 640, tokenizador BPE a nivel de byte de 16.384 tokens, pesos en fp32 (autocast bf16 durante el entrenamiento). El config incluye `"variant": {"dense_cells": true}`, que solo selecciona un kernel de entrenamiento más rápido que computa la misma función.

## Arquitectura y entrenamiento

AXIOM sustituye la atención por dos mecanismos combinados. El primero es una memoria de trabajo consistente en una recurrencia lineal con compuertas y un factor de decaimiento por cabeza, que mantiene un estado de tamaño constante por capa durante la generación: no hay atención ni caché KV, de modo que el coste de memoria no crece con la longitud de la secuencia. El segundo son las Law Cells, dos por capa con routing top-2, lo que en la práctica implica que cada token pasa por ambas células (no hay dispersión efectiva de parámetros). El mecanismo de fisión de expertos, presente en Axiom-1, se desactivó en esta versión tras rechazarse las 9 pruebas de fisión de la iteración anterior. También se probó un híbrido con atención softmax en 3 de las 12 capas, que no superó el margen requerido, por lo que 1.1 permanece sin atención.

El entrenamiento consta de dos fases. El preentrenamiento usa los 10 shards de FineWeb-Edu `sample-10BT`, con 6,3B tokens en 6.000 pasos de lotes de 1M de tokens, AdamW (β 0,9/0,95), LR pico 1e-3 con decaimiento coseno hasta 1e-4 y weight decay 0,1. El ajuste conversacional emplea 262M tokens en 2.000 pasos (LR 3e-4 → 3e-5), con pérdida solo en tokens del asistente y ventanas alineadas al inicio de conversación; los datos combinan smol-smoltalk, everyday-conversations, conversaciones de identidad y un 12,5% de repetición de FineWeb. Respecto a Axiom-1, se aumentó el peso de conversaciones cotidianas y respuestas cortas, se eliminaron las conversaciones con código, una cuarta parte de los turnos cortos de usuario se reescribieron en registro informal (minúsculas, sin apóstrofos, con erratas ocasionales) y se añadieron chats sintéticos de un turno: la mitad sobre personas, lugares y cosas inventadas cuya respuesta correcta es "no lo conozco", y la otra mitad preguntas reales del mismo tipo respondidas en una frase correcta, para evitar que el modelo aprenda a rechazar toda pregunta con un nombre propio. Todo el entrenamiento se ejecutó en una RTX 5070 de 12 GB a unos 78k tokens/s con `torch.compile`, alrededor de 25 horas de GPU en total.

## Capacidades

- Generación de texto conversacional en inglés con formato de turnos delimitado por tokens especiales (`<|endoftext|>`, `<|user|>`, `<|assistant|>`, `<|end|>`, `<|system|>` opcional).
- Respuesta a preguntas factuales sencillas, con una tasa de acierto baja (15 de 50 en la evaluación manual del autor).
- Declinación explícita ante preguntas sobre entidades inexistentes: 29 de 50 en la evaluación del autor, frente a 0 de 50 en Axiom-1.
- Conversación multi-turno dentro de la ventana de 1.024 tokens.
- Conocimiento de su propia identidad en el 75% de las formulaciones probadas (4 formulaciones × 2).
- Generación con estado constante: sin caché KV, con un pico de memoria muy bajo (295 MiB en la prueba de velocidad del autor).
- No soporta tool calling ni function calling (no documentado).
- No soporta agentes ni razonamiento multi-paso (no documentado; la escala y los datos no lo contemplan).
- No dispone de modo thinking, visión ni audio.
- Multilingüismo: únicamente inglés.

## Casos de uso

- Investigación sobre arquitecturas sin atención: el modelo sirve como banco de pruebas reproducible para estudiar recurrencia lineal con estado O(1) frente a atención softmax, con código, notas de diseño y todos los experimentos publicados en el repositorio del autor.
- Experimentación en hardware de consumo: al ocupar 295 MiB de pico en inferencia fp32 y caber holgadamente en cualquier GPU consumer, permite ejecutar y modificar el modelo en portátiles o estaciones con RTX 3060/4060/5070 sin infraestructura dedicada.
- Evaluación de calibración y abstención: el ajuste específico para declinar preguntas sobre entidades inventadas lo convierte en un caso de estudio útil para medir la tasa de abstención correcta frente a la de alucinación en modelos pequeños.
- Prototipado de asistentes conversacionales de dominio muy acotado: con 1.024 tokens de contexto y conocimiento factual limitado, solo es realista para diálogos cortos sobre un conjunto cerrado de temas definido por el desarrollador, nunca como asistente general.
- Docencia y demostraciones: su tamaño (0,3 GB de repositorio) y su velocidad (66,7 tok/s en una RTX 5070, batch 1, fp32) facilitan demostraciones en vivo de generación token a token y de decodificación con tokens de parada.
- Comparación de eficiencia de decodificación: útil para medir throughput y memoria frente a transformers pequeños con atención, dado que la ausencia de caché KV mantiene la memoria plana al aumentar la longitud generada.
- Reproducción de pipelines de entrenamiento de bajo presupuesto: el autor documenta el entrenamiento completo en una sola GPU de 12 GB en ~25 horas, lo que sirve de referencia para replicar preentrenamiento y ajuste conversacional a pequeña escala.

## Benchmarks y rendimiento

Resultados medidos por el autor con los mismos prompts, semillas y decodificación para ambos modelos:

| Medida | Mejor es | Axiom-1-Chat | Axiom-1.1-Chat |
|---|---|---|---|
| Pérdida en FineWeb-Edu retenido, modelo base (64 × ventanas de 1.024 tokens) | ↓ | 3,277 | 3,130 |
| Pérdida de validación conversacional (tokens del asistente) | ↓ | 1,627 | 1,685 |
| Hechos fáciles respondidos correctamente, auditoría manual (de 50) | ↑ | 8 | 15 |
| Preguntas sobre cosas inventadas declinadas (de 50) | ↑ | 0 | 29 |
| Hechos fáciles con una errata, corrección automática (de 50) | ↑ | 10 | 9 |
| Coherente y sobre el tema, juzgado por Qwen3.5-0.8B local (de 60) | ↑ | 32 | 35 |
| Conoce su identidad (4 formulaciones × 2) | ↑ | 75% | 75% |
| Velocidad de generación, RTX 5070, batch 1, fp32 | ↑ | 54,1 tok/s | 66,7 tok/s |
| Memoria GPU pico en la prueba de velocidad | ↓ | 758 MiB | 295 MiB |

No se han publicado resultados en benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. Las cifras anteriores son evaluaciones internas del autor, no comparables con suites públicas.

## Requisitos de hardware

- VRAM estimada para inferencia: 295 MiB de pico medidos en la prueba de velocidad del autor (RTX 5070, batch 1, fp32); el repositorio completo ocupa 0,3 GB.
- GPU recomendadas: cualquier GPU con al menos ~1 GB de VRAM libre; el autor entrenó e infirió en una NVIDIA RTX 5070 de 12 GB. Funciona también en CPU (el ejemplo de carga usa `cuda` si está disponible, si no `cpu`).
- Cabe en cualquier GPU de consumo actual (RTX 3060, 4060, 4090, etc.) y en iGPU o CPU para pruebas puntuales.
- Opciones de despliegue: no es compatible con vLLM, TGI, llama.cpp ni Ollama, ya que no es una arquitectura de `transformers` ni tiene loader `trust_remote_code`. Requiere el paquete `axiom` del repositorio de GitHub (`axiom.hub.load`, `axiom.decoding.generate`) y un script de chat propio (`python chat.py --model <carpeta>`).
- Latencia y throughput: 66,7 tok/s en RTX 5070, batch 1, fp32, con 295 MiB de pico; el entrenamiento alcanzó ~78k tokens/s con `torch.compile` en la misma GPU.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Arquitectura | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Axiom-1.1-Chat | 64,7M | 1.024 tokens | AXIOM sin atención, recurrencia lineal + Law Cells | Apache 2.0 | HuggingFace + código en GitHub |
| Axiom-1-Chat | 64,7M (misma arquitectura) | 1.024 tokens | AXIOM sin atención | Apache 2.0 | HuggingFace |
| SmolLM-135M / 360M (referencia de la familia Smol) | 135M / 360M | 2.048 tokens (versiones habituales) | Transformer con atención | Apache 2.0 | HuggingFace, `transformers` |
| Qwen2.5-0.5B | 494M | 32.768 tokens | Transformer con atención | Apache 2.0 | HuggingFace, `transformers` |

La comparación con modelos de la misma categoría debe tomarse con cautela: no hay benchmarks públicos comunes entre Axiom-1.1-Chat y las alternativas citadas. Las cifras de parámetros y contexto de las alternativas corresponden a sus configuraciones habituales publicadas; el rendimiento relativo en tareas estándar no está disponible en la información proporcionada.

## Limitaciones y advertencias

- El propio autor lo describe como artefacto de investigación, no como producto: "sigue equivocándose en la mayoría de las preguntas factuales" (30% de acierto en hechos fáciles auditados manualmente).
- Riesgo de alucinación alto pese a la mejora en abstención: declina 29 de 50 preguntas sobre entidades inventadas, pero aún acepta como reales 21 de 50.
- La pérdida de validación conversacional empeoró respecto a Axiom-1 (1,685 frente a 1,627), y el acierto en hechos con errata bajó ligeramente (9 frente a 10 de 50).
- Contexto muy limitado: 1.024 tokens de entrenamiento, insuficiente para documentos largos, historiales extensos o RAG con varios pasajes.
- Solo inglés; sin soporte multilingüe.
- Sin soporte de tool calling, agentes ni razonamiento multi-paso; los datos de conversación con código se eliminaron deliberadamente, por lo que la generación de código no es una capacidad fiable.
- No es compatible con el ecosistema `transformers`, vLLM, TGI ni llama.cpp: requiere el código del repositorio, lo que complica el despliegue en producción y la integración con pipelines existentes.
- Pesos en fp32 sin cuantizaciones oficiales publicadas; no hay GGUF disponible.
- Licencia Apache 2.0 permite uso comercial, pero la calidad del modelo hace inviable su uso comercial en tareas de conocimiento; cualquier uso en producción exigiría validación exhaustiva y acotación estricta del dominio.
- Sesgos: no documentados por el autor; al entrenarse sobre FineWeb-Edu y conversaciones sintéticas en inglés, es esperable un sesgo hacia registros y temas de ese corpus, sin evaluación de sesgos publicada.
- Sin descargas ni valoraciones en HuggingFace en el momento de la consulta (0 descargas, 0 likes), lo que implica ausencia de validación independiente.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Atlas-AI-research/Axiom-1.1-Chat
- Modelo anterior (Axiom-1-Chat): https://huggingface.co/Atlas-AI-research/Axiom-1-Chat
- Repositorio de código, notas de diseño y experimentos: https://github.com/leemadov/axiom
- Dataset de preentrenamiento: https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu
- Dataset de ajuste conversacional: https://huggingface.co/datasets/HuggingFaceTB/smol-smoltalk
- Dataset de conversaciones cotidianas: https://huggingface.co/datasets/HuggingFaceTB/everyday-conversations-llama3.1-2k
