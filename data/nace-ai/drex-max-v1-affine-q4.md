# nace-ai/drex-max-v1-affine-q4

## Resumen

Drex Max affine Q4 es la variante cuantizada a 4 bits (afín, grupos de 64) del modelo Drex Max v1, desarrollado por nace-ai y basado en la arquitectura qwen3_5. Se trata de un "decision model" etiquetado como "system-one": en lugar de generar texto libre, produce salidas JSON estructuradas con campos de probabilidad, respuestas de tipo elección, puntuaciones y opciones "no útil" (noul). Esto lo sitúa en una categoría distinta a los LLM conversacionales: está pensado para actuar como módulo de decisión o puntuación dentro de pipelines, con respuestas deterministas y verificables.

La relevancia de esta variante concreta es práctica: reduce el modelo base (25.624.600.064 parámetros en bf16) a unos 14,5 GB, lo que permite ejecutarlo en Macs con Apple silicon y 24 GB de memoria unificada o más, tanto mediante el runtime propio Kapitsa como mediante MLX. Según la model card, en un Apple M5 Pro con 48 GB la desviación de las probabilidades respecto al checkpoint Q8_0 es de como máximo 0,0356, sin que se invierta ninguna elección, lo que indica una cuantización de baja pérdida para su tarea específica.

El modelo es texto-only (no incluye capacidades de imagen en este checkpoint) y se sirve bajo una licencia personalizada de tipo Open RAIL-M (nace-ai-open-rail-m), que conviene revisar antes de cualquier despliegue comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | qwen3_5 (modelo de decisión "system-one") |
| Parametros totales | 25.624.600.064 |
| Parametros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | 2.048 tokens (contexto usado en el runtime Kapitsa; máximo del modelo no disponible) |
| Tipos de cuantizacion | Afín 4 bits, grupos de 64 (checkpoint Q8_0 GGUF disponible por separado) |
| Idiomas soportados | no disponible |
| Licencia | nace-ai-open-rail-m (other) |
| Formato de pesos | safetensors (afín Q4) + pointer.bin; existe variante Q8_0 en GGUF |

## Arquitectura y entrenamiento

El modelo base, Drex Max v1, emplea la arquitectura qwen3_5 y está posicionado por su autor como un modelo de decisión de tipo "system-one", es decir, un sistema rápido que emite juicios (elecciones, puntuaciones y campos de probabilidad) en formato JSON en lugar de razonamiento textual extenso. Las tareas soportadas en las peticiones son `choice`, `noul` y `score`, y la salida incluye los campos `model`, `answers` y `usage`.

Sobre el proceso de entrenamiento no hay datos publicados en la información disponible: no consta el número de tokens, la composición del dataset ni el uso de técnicas como RLHF o DPO. La innovación técnica más documentada está en la cuantización: este checkpoint se cuantizó desde los pesos bf16 (commit `f0f69bfa`) usando cuantización afín de 4 bits con grupos de 64, verificada empíricamente contra el checkpoint Q8_0 en GGUF (21 campos de probabilidad con desviación máxima de 0,0329 con Kapitsa y 0,0356 con MLX, sin inversiones de elección). No incluye imagen en este fichero.

## Capacidades

- Emisión de decisiones estructuradas en JSON: respuestas de tipo elección (`choice`), puntuaciones (`score`) y señales de "no útil" (`noul`).
- Salida con campos de probabilidad por respuesta, lo que permite umbrales de confianza y enrutado aguas abajo.
- Interfaz de servidor local vía Kapitsa (`/v1/systemone`) compatible con peticiones JSON.
- Ejecución nativa en Apple silicon mediante MLX (script `dreх_max_mlx.py` incluido en el repo de herramientas).
- Procesamiento exclusivamente textual: no admite imágenes, audio ni visión.
- No está documentado soporte de tool calling, agentes, generación de código ni razonamiento multi-paso; su diseño es el opuesto: juicio inmediato sin cadena de razonamiento.

## Casos de uso

- Enrutado de consultas en sistemas RAG: usar `choice` para decidir qué documento, base de conocimiento o agente debe atender una petición, aprovechando la salida JSON directa sin necesidad de parsers de texto libre.
- Filtrado de calidad en pipelines de datos: emplear `score` para puntuar candidatos (respuestas generadas, resúmenes, traducciones) y descartar los que queden por debajo de un umbral.
- Detección de respuestas inútiles: el tipo `noul` permite marcar consultas o respuestas sin valor antes de gastar cómputo en un LLM mayor, actuando como puerta de entrada barata.
- Evaluación automática (LLM-as-judge ligero): puntuar salidas de otros modelos en bucles de evaluación continua o CI, con probabilidades comparables entre ejecuciones.
- Moderación o clasificación de intenciones en tiempo real: la ventana de 2.048 tokens y la salida estructurada encajan con clasificación de mensajes individuales o conversaciones cortas.
- Despliegue en portátiles y estaciones Mac: al caber en 24 GB de memoria unificada, sirve como componente de decisión local en apps on-device sin dependencia de GPU de datacenter.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandarizados (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El único dato de rendimiento publicado es de fidelidad de cuantización, no de calidad de tarea:

| Medición | Valor |
|---|---|
| Desviación máx. de probabilidad vs Q8_0 (Kapitsa, contexto 2.048) | 0,0329 en 21 campos |
| Desviación máx. de probabilidad vs Q8_0 (MLX, mismos bytes) | 0,0356 |
| Elecciones invertidas por la cuantización | 0 |
| Hardware de la medición | Apple M5 Pro, 48 GB, macOS 26.5.2 (30/10/2026) |

## Requisitos de hardware

- VRAM/memoria: el repo ocupa 14,5 GB; la model card indica que funciona en Macs Apple silicon con 24 GB de memoria unificada o más. Para GPUs NVIDIA no hay cifras publicadas, aunque 14,5 GB de pesos sugieren que una GPU de 16 GB (p. ej. RTX 4090) podría alojar el modelo dejando margen justo para el contexto.
- Hardware verificado: Apple M5 Pro con 48 GB (medición oficial del autor).
- Consumer GPUs: no hay validación publicada para CUDA; la vía soportada oficialmente es Apple silicon (Kapitsa y MLX).
- Runtimes: Kapitsa v0.2.25 o posterior (servidor HTTP en el puerto 8000 con endpoint `/v1/systemone`) y MLX (script `dreх_max_mlx.py`). No hay soporte documentado de vLLM, TGI, Ollama o llama.cpp para este checkpoint (la model card aclara que el Q4_K_M de llama.cpp no está en este repositorio).
- Contexto de ejecución recomendado: 2.048 tokens según los comandos de ejemplo; latencia y throughput no disponibles.

## Comparativa con modelos similares

No existen alternativas publicadas de la misma categoría exacta ("decision model system-one" de nace-ai) con las que comparar directamente. Como referencia de la propia familia:

| Modelo | Formato | Parametros | Tamaño | Notas |
|---|---|---|---|---|
| drex-max-v1-affine-q4 (este) | safetensors afín Q4, grupo 64 | 25.624.600.064 | 14,5 GB | Para Apple silicon 24 GB+; texto only |
| drex-max-v1 (base) | bf16 | 25.624.600.064 | no disponible | Pesos originales de mayor precisión |
| drex-max-v1-Q8_0 | GGUF Q8_0 | 25.624.600.064 | no disponible | Referencia de fidelidad; mayor tamaño |

Comparativas con LLM generativos de tamaño similar (Qwen, Llama, Gemma) no son equiparables en tarea ni hay datos publicados para ello: no disponible.

## Limitaciones y advertencias

- Alcance restringido: no genera texto libre ni razonamiento; solo produce JSON con `choice`, `noul` y `score`. No sirve como asistente conversacional.
- Solo texto: este checkpoint no incluye capacidades de imagen.
- Contexto corto en la configuración por defecto (2.048 tokens), insuficiente para documentos largos o conversaciones extensas.
- Sin benchmarks públicos de calidad de tarea: la única validación publicada es la fidelidad de la cuantización frente al Q8_0, no la precisión del modelo en tareas estándar.
- Sesgos y riesgo de alucinación: no documentados por el autor; al tratarse de un modelo de decisión con salidas probabilísticas, los sesgos del modelo base qwen3_5 y de sus datos de entrenamiento (no publicados) pueden trasladarse a las puntuaciones.
- Licencia: nace-ai-open-rail-m es una licencia personalizada tipo Open RAIL-M; puede incluir restricciones de uso (use restrictions) que hay que revisar en el archivo LICENSE antes de uso comercial o despliegue en producto.
- Soporte de runtimes limitado: Kapitsa y MLX; no hay ruta documentada con vLLM, Ollama o llama.cpp para este checkpoint concreto.
- Proyecto de adopción muy temprana: 77 descargas y 1 like en el momento de la ficha, sin comunidad ni historial de producción.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/nace-ai/drex-max-v1-affine-q4
- Modelo base Drex Max v1: https://huggingface.co/nace-ai/drex-max-v1
- Variante Q8_0 GGUF: https://huggingface.co/nace-ai/drex-max-v1-Q8_0
- Repositorio de herramientas y setup (Kapitsa): https://github.com/nace-ai/drex-decision-models/blob/main/models/drex-max-v1#kapitsa
- Repositorio drex-decision-models: https://github.com/nace-ai/drex-decision-models
