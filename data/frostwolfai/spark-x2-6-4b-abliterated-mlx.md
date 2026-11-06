# FrostWolfAI/Spark-X2.6-4B-abliterated-MLX

## Resumen

Spark-X2.6-4B-abliterated-MLX es la conversión nativa para Apple Silicon (MLX) del modelo Spark-X2.6-4B-abliterated de FrostWolfAI, una variante "abliterated" (sin mecanismos de rechazo) del modelo post-entrenado XHToken/Spark-X2.6-4B. El modelo original se distribuye en BF16; esta versión aplica cuantización de 4 bits (afín, grupo de 64) para reducir el peso en disco a 2,32 GB y hacerlo viable en equipos con memoria unificada de 16 GB. El proceso de abliteración se realizó con Heretic v2 mediante Arbitrary-Rank Ablation (ARA), reduciendo los rechazos de 100/100 a 2/100 con una divergencia KL de 0,0177.

Arquitectónicamente emplea el tipo `spark2_5`: 36 capas con atención de ventana deslizante (512 tokens) en 27 de ellas y atención global en las 9 restantes, en proporción 3:1. Tiene 16 cabezas de atención y 4 cabezas KV con dimensión de cabeza 256, QKV fusionado y puerta de salida sigmoide por cabeza. El tamaño oculto es 2560 y el intermedio 10240, con MLP GELU y embeddings atados. El vocabulario es de 131.072 tokens y la longitud de contexto alcanza 1.048.576 tokens, lo que lo sitúa en la categoría de modelos de contexto largo.

Su relevancia actual radica en tres factores: es un modelo de 4B parámetros ejecutable en local sobre hardware de consumo Apple, conserva las capacidades de razonamiento controlable (bloque `<think>`) y tool calling del modelo base, y ofrece una ventana de contexto de 1M tokens gracias a la combinación de atención deslizante con caché KV rotatoria y atención global selectiva. La supresión deliberada de rechazos lo hace inadecuado para endpoints públicos sin moderación, pero útil en entornos controlados de investigación y generación de contenido sin filtros.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | `spark2_5`: transformer de 36 capas, 27 de ventana deslizante (512) + 9 de atención global (3:1), 16 cabezas / 4 KV, head dim 256, QKV fusionado, puerta sigmoide por cabeza |
| Parámetros totales | 4.112.079.360 (4,11B) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 1.048.576 tokens |
| Tipos de cuantización | 4-bit afín, grupo de 64 (4,505 bits/peso); gates `g_proj` y normas en BF16 |
| Idiomas soportados | en, zh |
| Licencia | Apache-2.0 |
| Formato de pesos | MLX safetensors (`model_type: spark2_5`), 2,32 GB en disco |
| Vocabulario | 131.072 tokens |
| Hidden / intermediate | 2560 / 10240, MLP GELU, embeddings atados |
| Librería | mlx-lm >= 0.32 |
| Plataforma | Apple Silicon, macOS 13.5+ |

## Arquitectura y entrenamiento

El modelo base XHToken/Spark-X2.6-4B es un transformer post-entrenado del que no se detallan en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron fases de RLHF o DPO. La arquitectura `spark2_5` combina atención de ventana deslizante de 512 tokens en 27 de las 36 capas con atención global en las 9 restantes, en una proporción 3:1. Esta configuración permite que, en contextos largos, la memoria de la caché KV crezca solo con las 9 capas globales, ya que las capas deslizantes usan una caché KV rotatoria de 512 tokens. El resultado es un modelo con ventana nominal de 1.048.576 tokens y coste de memoria sublineal en la práctica.

La innovación técnica principal de esta variante concreta es la abliteración con Heretic v2 y Arbitrary-Rank Ablation (ARA), que elimina las direcciones de rechazo del modelo mediante una ablación de rango arbitrario en lugar de una proyección de rango uno. Según la model card, esto reduce los rechazos de 100/100 a 2/100 con una divergencia KL de 0,0177 respecto al modelo original, preservando la arquitectura, el contexto de 1M tokens, el razonamiento controlable y el formato `<tool_call>`. La cuantización MLX de 4 bits mantiene los gates de proyección y las normas en BF16 para limitar la pérdida de calidad.

## Capacidades

- Generación de texto conversacional multi-turno en inglés y chino.
- Razonamiento controlable: emite un bloque `<think>...</think>` antes de la respuesta, configurable mediante `enable_thinking=False` o `reasoning_effort="low"`/`"high"` (por defecto `high`).
- Tool calling / function calling con formato `<tool_call>name<arg_key>k</arg_key><arg_value>v</arg_value></tool_call>`; los argumentos se pasan como diccionario, no como cadena JSON.
- Capacidades agénticas y razonamiento multi-paso, etiquetadas explícitamente en el modelo (`agentic`, `tool-calling`, `reasoning`).
- Contexto largo de hasta 1M tokens con coste de memoria reducido por la caché rotatoria de las capas deslizantes.
- Generación de código y matemáticas: no se especifica explícitamente en la model card, pero el modelo base está orientado a tareas de razonamiento y agénticas.
- Sin mecanismos de rechazo (abliterated/decensored): responde a peticiones que el modelo base rechazaría.
- No dispone de visión, audio ni otras modalidades según la información disponible.

## Casos de uso

- Asistente local en Mac: el modelo cabe en 16 GB de memoria unificada y se ejecuta con `mlx-lm` sobre Apple Silicon, lo que permite un asistente conversacional privado sin conexión a servicios externos.
- Procesamiento de documentos largos: con 1M tokens de contexto y caché KV rotatoria en las capas deslizantes, puede resumir o extraer información de libros, expedientes o bases de código extensas en una sola pasada.
- Agente con tool calling: integrado en un bucle agéntico que invoque APIs, bases de datos o herramientas del sistema mediante el formato `<tool_call>`, aprovechando el razonamiento multi-paso y el bloque de pensamiento configurable.
- Generación de código en local: puede usarse como asistente de programación en editores o pipelines, con `reasoning_effort` ajustable para equilibrar latencia y calidad; encaja en flujos de CI/CD que requieran un modelo sin dependencia de la nube.
- Investigación sobre alineación y abliteración: sirve como caso de estudio reproducible para medir el efecto de ARA sobre las tasas de rechazo y la divergencia KL, con el bundle de reproducción publicado por el autor.
- Generación de contenido creativo sin filtros: en entornos controlados y con revisión humana, para ficción, guiones o material que los modelos alineados rechazarían por defecto.
- Servidor compatible con OpenAI: `mlx_lm.server` expone un endpoint en el puerto 8080 que puede consumirse desde clientes que hablen la API de OpenAI, útil para prototipos locales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K, etc.) en la información disponible. Los únicos datos de rendimiento publicados son mediciones de inferencia en hardware concreto:

| Métrica | Valor (Apple M3, 8 núcleos, 16 GB, mlx-lm 0.32.2) |
|---|---|
| Procesamiento de prompt | ~152 tok/s |
| Generación | ~12 tok/s |
| Memoria pico | ~2,5 GB |
| Tasa de rechazo (abliteración) | 2/100 (frente a 100/100 del base) |
| Divergencia KL respecto al base | 0,0177 |

## Requisitos de hardware

- VRAM/memoria unificada estimada: ~2,5 GB en pico con la cuantización de 4 bits (medido en M3 de 16 GB). La variante de 8 bits ocupa 4,37 GB en disco y requiere algo más de memoria.
- Hardware objetivo: Apple Silicon (M1, M2, M3, M4 y superiores) con macOS 13.5 o superior. No es ejecutable en GPU NVIDIA ni en CPU x86 mediante MLX.
- Cabe holgadamente en equipos de consumo con 16 GB de memoria unificada; también en configuraciones de 8 GB si se limita el contexto.
- Despliegue: `mlx-lm >= 0.32` (CLI `mlx_lm.generate`, servidor `mlx_lm.server`), LM Studio con motor MLX. No es compatible con llama.cpp, Ollama ni TGI, que requieren la variante GGUF publicada por separado.
- Latencia y throughput medidos: ~12 tok/s de generación y ~152 tok/s de procesamiento de prompt en M3 de 8 núcleos. Con razonamiento activado y presupuesto alto de tokens, la latencia percibida aumenta porque el bloque `<think>` consume tokens antes de la respuesta.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Plataforma |
|---|---|---|---|---|---|
| Spark-X2.6-4B-abliterated-MLX (este) | 4,11B | 1.048.576 | 4-bit MLX (2,32 GB) | Apache-2.0 | Apple Silicon (MLX) |
| Spark-X2.6-4B-abliterated-MLX-8bit | 4,11B | 1.048.576 | 8-bit MLX (4,37 GB) | Apache-2.0 | Apple Silicon (MLX) |
| Spark-X2.6-4B-abliterated-GGUF | 4,11B | 1.048.576 | GGUF (varias) | Apache-2.0 | llama.cpp, Ollama, LM Studio |
| XHToken/Spark-X2.6-4B (base alineado) | 4,11B | 1.048.576 | BF16 | Apache-2.0 | Multiplataforma |

No se dispone de datos de benchmarks que permitan comparar la calidad de este modelo con alternativas de otros autores. La comparación se limita a las variantes del mismo modelo publicadas por FrostWolfAI y XHToken.

## Limitaciones y advertencias

- La abliteración suprime deliberadamente los rechazos: el modelo cumplirá peticiones que el base rechazaría, incluidas algunas que no debería. No hay filtrado de seguridad adicional.
- No debe exponerse tras un endpoint público sin moderación que atienda a terceros.
- La abliteración elimina direcciones de rechazo, pero no añade capacidad ni criterio: la calidad de razonamiento es la del modelo base.
- Riesgo de alucinación inherente a modelos de 4B parámetros; no se han publicado evaluaciones de fidelidad factual.
- Idiomas limitados a inglés y chino; el rendimiento en castellano no está documentado y probablemente sea inferior.
- El contexto nominal de 1M tokens no implica que el modelo mantenga la calidad en toda la ventana; no hay benchmarks publicados de recuperación en contexto largo.
- Con razonamiento activado, es necesario un presupuesto generoso de `max_tokens` o las respuestas se truncarán a mitad del bloque `<think>`.
- Solo ejecutable en Apple Silicon mediante MLX; para otras plataformas hay que usar las variantes GGUF o BF16.
- Licencia Apache-2.0, que permite uso comercial, pero la responsabilidad sobre el contenido generado sin filtros recae en el desplegador.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/FrostWolfAI/Spark-X2.6-4B-abliterated-MLX
- Modelo base abliterated (BF16 safetensors): https://huggingface.co/FrostWolfAI/Spark-X2.6-4B-abliterated
- Variante GGUF: https://huggingface.co/FrostWolfAI/Spark-X2.6-4B-abliterated-GGUF
- Variante MLX 8-bit: https://huggingface.co/FrostWolfAI/Spark-X2.6-4B-abliterated-MLX-8bit
- Modelo post-entrenado original: https://huggingface.co/XHToken/Spark-X2.6-4B
- Heretic (herramienta de abliteración): https://github.com/p-e-w/heretic
- MLX (framework de Apple): https://github.com/ml-explore/mlx
