# aufklarer/Inkling-2-Mini-CoreML-INT8

## Resumen

Inkling 2 Mini Core ML INT8 es una exportación experimental del modelo multimodal Inkling 2 Mini de Thinking Machines, convertida al formato Core ML para ejecución nativa en Apple Silicon. Se distribuye como un bundle de 27 particiones (tabla de embeddings, 24 capas físicas de decoder, cabeza de vocabulario y encoder de visión) que el runtime de Swift recorre 48 veces, manteniendo historiales independientes por visita. El modelo base es un Mixture-of-Experts de aproximadamente 26.4B parámetros totales, con 3.4B activos por pasada y unos 5.4B activos efectivos por token con las tres pasadas por defecto.

La relevancia de esta ficha es doble: por un lado documenta un caso real de cuantización INT8 de un MoE grande para el stack de Apple, y por otro expone con honestidad sus límites prácticos. El autor reporta que una petición de 2032 tokens de prompt tardó 51.8 minutos en un M5 Pro de 48 GB ejecutando en CPU, y que la ejecución completa en GPU y Neural Engine no está validada. No es un checkpoint de Transformers, sino un bundle específico de `speech-swift` que requiere un parche de runtime concreto.

La licencia es Apache 2.0 y el idioma declarado es únicamente inglés. El contexto está limitado a 8192 tokens en esta exportación, con prefill de un solo token y un máximo de 1024 parches de imagen. Está pensado para escritorios Apple Silicon, con validación en macOS 26.6.2.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE) transformer multimodal, exportada a Core ML con 24 capas físicas de decoder recorridas 48 veces |
| Parámetros totales | ~26.4B |
| Parámetros activos | 3.4B por pasada; ~5.4B efectivos por token con 3 pasadas por defecto |
| Longitud de contexto | 8192 tokens (límite de la exportación); prefill de un solo token |
| Tipos de cuantización | Pesos INT8 (grupos simétricos de 64 canales de entrada, escalas FP16 en matrices de expertos); matrices de texto con compresión INT8 nativa de Core ML; activaciones, cachés KV e historiales de convolución en FP32; routers, controladores, normalización y queries residuales en FP32; matrices de visión en FP16 con atención y normalización en FP32 |
| Idiomas soportados | Inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | Core ML (`.mlpackage` compilado y paquetes portables), no safetensors ni GGUF |

## Arquitectura y entrenamiento

El modelo base es un Mixture-of-Experts multimodal con encoder de visión, diseñado para entrada image-text-to-text. La exportación a Core ML descompone el modelo en 27 particiones: una tabla de embeddings, 24 capas físicas de decoder, una cabeza de vocabulario y un encoder de visión. El runtime de Swift visita las capas del decoder 48 veces (el doble de las 24 físicas), lo que sugiere una estructura de bucle con reutilización de pesos almacenados y pasadas adicionales que elevan los parámetros activos efectivos de 3.4B a unos 5.4B por token.

La precisión se degrada en dos etapas: primero el checkpoint upstream ya estaba en NVFP4/MXFP8, y después se reempaquetó a INT8. El propio autor advierte que este reempaquetado no recupera precisión ya eliminada por el checkpoint de origen. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO en la información proporcionada. La innovación técnica destacable es la propia estrategia de exportación: particionado del MoE, recolección de expertos seleccionados antes de la desquantización a FP32, y un runtime con historiales independientes por visita a las capas.

## Capacidades

- Generación de texto conversacional en inglés.
- Comprensión de imágenes estáticas (image-text-to-text), con un límite de 1024 parches de imagen.
- Razonamiento de tipo "hidden reasoning" que consume contexto, según indica el autor.
- Soporte de decisiones estructuradas: el conjunto de validación incluye ocho casos de decisión con validación estricta de JSON y sin ejecución de acciones.
- Casos de recuperación documental (document retrieval) validados en el conjunto de aceptación.
- Capacidades multilingües: no disponibles; solo inglés declarado.
- Tool calling / function calling: no disponible en la información.
- Soporte de agentes y multi-step reasoning: no disponible explícitamente; los casos de decisión con JSON sugieren un uso orientado a decisiones estructuradas, pero no se documenta un bucle de agente.

## Casos de uso

- Prototipado local de asistentes multimodales en Apple Silicon: el bundle permite ejecutar un MoE de 26.4B con entrada de imagen y texto sin salir del ecosistema Core ML, útil para validar flujos de producto antes de invertir en infraestructura GPU.
- Respuestas a preguntas sobre imágenes estáticas en escritorio: con el límite de 1024 parches y el flag `--image`, se puede integrar en herramientas de escritorio que necesiten describir o consultar una imagen concreta.
- Recuperación documental con contexto largo: el caso validado de 2032 tokens de prompt y 8192 de contexto permite probar pipelines de extracción de respuestas sobre documentos, aceptando latencias de decenas de minutos en CPU.
- Decisiones estructuradas con salida JSON: los ocho casos de decisión con validación estricta de JSON y sin ejecución de acciones encajan en flujos donde el modelo solo clasifica o decide y el sistema externo actúa.
- Investigación sobre cuantización de MoE en Core ML: el bundle y el parche de runtime documentado sirven como referencia reproducible para estudiar el impacto de INT8 sobre pesos NVFP4/MXFP8 en hardware Apple.
- Evaluación de viabilidad de despliegue en hardware de consumo: permite medir en un M5 Pro de 48 GB si el modelo cabe y con qué latencia, antes de considerar alternativas en GPU dedicada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. El autor reporta únicamente resultados de validación funcional y tiempos de ejecución:

| Métrica | Resultado |
|---|---|
| Casos de aceptación texto/imagen | 25/25 superados en CPU (incluye 4 preguntas sobre imágenes sintéticas y el caso de recuperación documental) |
| Casos de decisión con JSON estricto | 8/8 superados por la CLI de release, sin acciones ejecutadas |
| Latencia de casos cortos | 71–309 s por caso, mediana de 131.6 s |
| Prompt de 2032 tokens | 3109.8 s (51.8 min) tras la inicialización del modelo, respuesta `Oslo, 2028` |
| Hardware de validación | Apple M5 Pro, 48 GB de memoria unificada, macOS 26.6.2 |
| GPU y Neural Engine | No validados para el bundle completo |

El autor advierte que estas cifras son observaciones de depuración en una máquina compartida, no una comparación de throughput controlada.

## Requisitos de hardware

- Espacio en disco: 27.69 GB (25.79 GiB) para las particiones compiladas; al menos 65 GiB libres para la descarga compilada más la caché de ejecución de Core ML.
- Descarga portable: unos 90 GiB en total si se incluyen los paquetes portables, las copias compiladas temporales y la caché de ejecución.
- Memoria: validado en un equipo con 48 GB de memoria unificada; no se especifica el mínimo de RAM.
- GPU recomendadas: no aplica en el sentido habitual; el hardware objetivo es Apple Silicon de escritorio. La validación usa CPU. La colocación en Neural Engine y la velocidad en GPU no están establecidas para el bundle completo.
- ¿Cabe en GPU de consumo? No es una pregunta aplicable a este formato; requiere Apple Silicon con memoria unificada suficiente. No hay datos para RTX 4090, A100 o H100.
- Opciones de despliegue: runtime `Inkling2CoreMLChat` dentro de `speech-swift` (commit `15eda930df3d6cad07a0cd25e8d22dfdd9a040c3` más `runtime-source.patch`), CLI `speech` con `--backend coreml` y `--coreml-compute-units cpu|gpu|ane|all`. No es compatible con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: mediana de 131.6 s por caso corto; 51.8 minutos para un prompt de 2032 tokens. Inicialización en frío y prefill de un token pueden ser lentos.

## Comparativa con modelos similares

No se dispone de datos de benchmarks del modelo base ni de alternativas comparables en la información proporcionada. La comparación se limita a características estructurales:

| Modelo | Parámetros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Inkling 2 Mini Core ML INT8 (esta ficha) | ~26.4B totales, 3.4B activos por pasada, ~5.4B efectivos | 8192 | Core ML | Apache 2.0 | Hugging Face, runtime parcheado |
| thinkingmachines/Inkling-2-Mini (base) | ~26.4B totales, 3.4B activos | no disponible | no disponible | no disponible | Hugging Face |
| Alternativas de tamaño similar | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Rendimiento muy lento en CPU: 51.8 minutos para un prompt de 2032 tokens en un M5 Pro de 48 GB; no apto para uso interactivo.
- GPU y Neural Engine no validados para el bundle completo; solo CPU tiene aceptación de release.
- Precisión degradada en dos etapas (NVFP4/MXFP8 upstream y reempaquetado a INT8); el autor advierte que no se recupera precisión perdida.
- Contexto limitado a 8192 tokens, con prefill de un solo token, lo que penaliza prompts largos.
- Límite de 1024 parches de imagen; los parches y el razonamiento oculto consumen contexto.
- Solo inglés declarado; no se establece paridad multilingüe.
- Los 25 casos de aceptación y 8 de decisión no establecen precisión general, paridad multilingüe ni resistencia a inyección de prompts.
- No es un checkpoint de Transformers: requiere el runtime `Inkling2CoreMLChat` y el parche exacto; no funciona con vLLM, llama.cpp, Ollama o TGI.
- Funcionamiento en iOS no verificado; otras versiones de macOS no verificadas.
- Riesgo de alucinación y sesgos: no documentados en la información disponible.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero la licencia del modelo base no se detalla en la información proporcionada; conviene verificar el card upstream antes de producción.

## Enlaces

- Hugging Face: https://huggingface.co/aufklarer/Inkling-2-Mini-CoreML-INT8
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- Runtime speech-swift: https://github.com/soniqo/speech-swift
- Parche de runtime: https://huggingface.co/aufklarer/Inkling-2-Mini-CoreML-INT8/resolve/main/runtime-source.patch
