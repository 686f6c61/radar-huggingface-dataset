# bowtiedrahman/Spark-X2.6-1.7B-Abliterated

## Resumen

Spark-X2.6-1.7B-Abliterated es una versión "abliterada" (decensurada) de Spark-X2.6-1.7B, un modelo de lenguaje compacto de propósito general desarrollado por XHToken para despliegue en dispositivo (on-device). La versión abliterada ha sido publicada por el usuario bowtiedrahman y se ha obtenido mediante la herramienta Heretic v2.0.0.dev0, que aplica una técnica de ablación de direcciones de rechazo para eliminar los comportamientos de negativa del modelo de base sin reentrenamiento completo.

El modelo base conserva exactamente la misma arquitectura que Spark-X2.5-1.7B, y sus mejoras provienen de un post-entrenamiento más avanzado que refuerza capacidades de código, agentes, contexto largo, multilingüismo y razonamiento. Incluye un presupuesto de pensamiento configurable con tres niveles (ninguno, bajo, alto) para equilibrar calidad de razonamiento, latencia y coste de inferencia. Con 1.707.657.216 parámetros y licencia Apache 2.0, es relevante para desarrolladores que necesitan un modelo pequeño, sin filtros de rechazo, ejecutable en hardware local y con soporte de inglés y chino.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (arquitectura idéntica a Spark-X2.5-1.7B; detalles concretos no disponibles) |
| Parametros totales | 1.707.657.216 |
| Parametros activos | no disponible (no se indica si es MoE) |
| Longitud de contexto | 131.072 tokens (según el ejemplo de `max_new_tokens` del quickstart; ventana total no confirmada explícitamente) |
| Tipos de cuantizacion | no disponible (solo pesos en safetensors, 3,4 GB) |
| Idiomas soportados | inglés, chino |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (formato Transformers, requiere `trust_remote_code=True` y `transformers==4.57.1`) |

## Arquitectura y entrenamiento

Spark-X2.6-1.7B mantiene la arquitectura exacta de Spark-X2.5-1.7B; los detalles concretos (número de capas, dimensiones, tipo de atención) no están disponibles en la información proporcionada, aunque los parámetros ARA del proceso de ablación indican al menos 29 capas (índices 8 a 28 modificados). Los avances de la versión 2.6 provienen de un post-entrenamiento mejorado centrado en código, uso complejo de herramientas, planificación multi-paso, ingeniería de software y razonamiento sobre contextos extendidos. Los datos de entrenamiento (número de tokens, composición del dataset, RLHF/DPO) no están disponibles.

La versión abliterada se ha generado con Heretic v2.0.0.dev0 mediante Arbitrary-Rank Ablation (ARA), que modifica las capas 8 a 28 del modelo para suprimir la dirección de rechazo. El proceso es reproducible: el repositorio incluye un directorio `reproduce` con instrucciones. El resultado registra 0/100 rechazos frente a 100/100 del modelo original, con una divergencia KL de 0,8126 respecto al modelo base, lo que indica una modificación moderada pero no trivial de la distribución de salida.

## Capacidades

- Generación de texto conversacional en inglés y chino.
- Generación y razonamiento sobre código, con mejoras sustanciales respecto a Spark-X2.5-1.7B según el autor del modelo base.
- Uso complejo de herramientas (tool calling) y planificación multi-paso para flujos agénticos.
- Razonamiento sobre contextos largos.
- Presupuesto de pensamiento configurable en tres niveles (none, low, high) mediante `enable_thinking` en la plantilla de chat, permitiendo equilibrar calidad de razonamiento y latencia.
- Sin comportamientos de rechazo: responde a solicitudes que el modelo original denegaría (0/100 rechazos en la evaluación de Heretic).
- Inferencia eficiente en dispositivo, con alto throughput de decodificación entre modelos de tamaño comparable según las evaluaciones del autor.
- Capacidades de visión, audio o multimodalidad: no disponibles.

## Casos de uso

- Asistentes locales sin filtros para investigación: al eliminar los rechazos, permite estudiar el comportamiento del modelo ante prompts adversarios o sensibles en entornos controlados de investigación en seguridad (red teaming).
- Agentes en dispositivo con tool calling: su tamaño de 1,7B parámetros y las mejoras en planificación multi-paso lo hacen adecuado para pipelines agénticos que ejecutan herramientas localmente sin depender de APIs externas.
- Generación de código en local: puede integrarse en editores o scripts de asistencia de código que se ejecutan en la máquina del desarrollador, con bajo coste de inferencia.
- Procesamiento de contextos largos en hardware modesto: útil para resumir o razonar sobre documentos extensos sin necesidad de GPU de datacenter.
- Aplicaciones bilingües inglés/chino en móvil o edge: su eficiencia de decodificación y tamaño compacto encajan en despliegues on-device con latencia responsiva.
- Prototipado rápido de chatbots: la integración con Transformers, SGLang y llama.cpp facilita montar demos conversacionales con control fino del presupuesto de razonamiento.
- Ajuste fino posterior (fine-tuning): como base decensurada con licencia Apache 2.0, sirve como punto de partida para especializar el modelo en dominios concretos sin restricciones de licencia.

## Benchmarks y rendimiento

El autor del modelo base indica que Spark-X2.6-1.7B supera a modelos comparables (Qwen3.5-2B, MiniCPM-2B, LFM2.5-2.6B) en la mayoría de benchmarks de agente, código, matemáticas, general y conocimiento, pero los resultados numéricos se publican únicamente como imágenes SVG no legibles en el texto de la model card, por lo que no se pueden extraer cifras concretas.

Datos publicados de la versión abliterada (evaluación de Heretic):

| Métrica | Este modelo | Modelo original (XHToken/Spark-X2.6-1.7B) |
|---|:---:|:---:|
| Rechazos (refusals, sobre 100 prompts) | 0/100 | 100/100 |
| Divergencia KL respecto al original | 0,8126 | 0 (por definición) |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible para esta versión abliterada.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio ocupa 3,4 GB en safetensors (probablemente FP16/BF16 dado el número de parámetros), por lo que unos 4-5 GB de VRAM en precisión completa serían suficientes; con cuantización podría reducirse, aunque no hay versiones cuantizadas publicadas.
- GPU recomendadas: cualquier GPU moderna de gama media; el autor del modelo base muestra benchmarks en RTX 4090 con su implementación optimizada de llama.cpp. No se requiere GPU de datacenter (A100/H100) para inferencia.
- Consumer GPU: cabe con holgura en GPUs como RTX 3060 de 12 GB, RTX 4060 Ti de 16 GB, RTX 4090 y superiores; también debería ser viable en portátiles con GPU de 6-8 GB.
- CPU: dado el enfoque on-device del modelo base, la inferencia en CPU puro es plausible, aunque no hay cifras publicadas.
- Opciones de despliegue: Transformers (requiere `transformers==4.57.1` y `trust_remote_code=True`), SGLang (imagen Docker preconstruida), y la implementación optimizada de llama.cpp de XHToken (https://github.com/XHToken/llama.cpp). No hay GGUF oficial publicado.
- Latencia y throughput: el autor afirma throughput de decodificación líder entre modelos on-device de tamaño comparable, con ventaja ampliada en RTX 4090 mediante su fork de llama.cpp; no se publican cifras concretas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Particularidad |
|---|---|---|---|---|
| Spark-X2.6-1.7B-Abliterated | 1,71B | hasta 131.072 tokens (según quickstart) | Apache 2.0 | Versión decensurada vía Heretic, 0/100 rechazos |
| Spark-X2.6-1.7B (original) | 1,71B | no disponible | Apache 2.0 | Modelo base con alineación estándar (100/100 rechazos) |
| Qwen3.5-2B | no disponible | no disponible | no disponible | Competidor on-device citado en los benchmarks del autor |
| MiniCPM-2B | no disponible | no disponible | no disponible | Competidor on-device citado en los benchmarks del autor |
| LFM2.5-2.6B | no disponible | no disponible | no disponible | Competidor on-device citado en los benchmarks del autor |

## Limitaciones y advertencias

- Al ser un modelo abliterado, no rechaza solicitudes dañinas: su uso para generar contenido ilegal, dañino o desinformativo es un riesgo directo. Debe desplegarse únicamente en entornos controlados y con salvaguardas externas cuando el caso de uso lo requiera.
- La divergencia KL de 0,8126 indica que la ablación altera la distribución del modelo más allá de los rechazos; puede degradar sutilmente la calidad o coherencia en tareas generales respecto al modelo original.
- El modelo requiere `trust_remote_code=True`, lo que implica ejecutar código personalizado del repositorio: revísese antes de usar en producción.
- No hay versiones cuantizadas ni GGUF oficiales publicadas, lo que limita las opciones de despliegue en dispositivos muy modestos.
- Los datos de entrenamiento, sesgos conocidos y evaluaciones de seguridad del modelo base no están disponibles en la información proporcionada.
- Como todo modelo de lenguaje pequeño, es susceptible de alucinaciones; la ausencia de filtros no reduce este riesgo.
- El soporte de idiomas se limita a inglés y chino; el rendimiento en castellano no está evaluado y probablemente sea inferior.
- La licencia Apache 2.0 permite uso comercial sin restricciones significativas, pero el modelo base procede de XHToken y conviene verificar cualquier término adicional en el repositorio original.

## Enlaces

- Modelo abliterado: https://huggingface.co/bowtiedrahman/Spark-X2.6-1.7B-Abliterated
- Modelo base: https://huggingface.co/XHToken/Spark-X2.6-1.7B
- Heretic (herramienta de ablación): https://heretic-project.org
- llama.cpp optimizado por XHToken: https://github.com/XHToken/llama.cpp
- Slack de Spark: https://join.slack.com/t/tokenspark/shared_invite/zt-432qf8l2f-5~dLyXv8uETr0P0UuC07nw
- Discord de Spark: https://discord.gg/kTDE2Hg8aw
- YouTube de Spark LLM: https://www.youtube.com/@SparkLLM
- dev.to de Spark LLM: https://dev.to/sparkllm
- Bluesky: https://bsky.app/profile/sparkllm.bsky.social
- X (Twitter): https://x.com/sparkllm
- Zhihu: https://www.zhihu.com/people/zhiikz7qh7m
