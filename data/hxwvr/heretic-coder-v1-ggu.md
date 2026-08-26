# Hxwvr/heretic-coder-v1-GGU

## Resumen

heretic-coder-v1 es un modelo de generación de texto especializado en programación de sistemas y concurrencia, distribuido en formato GGUF cuantizado Q4_K_M. Es un merge creado por el usuario Hxwvr (también conocido como _wvr o Hexeweavr) a partir del modelo base google/gemma-2-9b-it, y posteriormente cuantizado para su ejecución en hardware de consumo. El modelo tiene 7.518.069.290 parámetros (aproximadamente 7,5 mil millones), una ventana de contexto nativa de 32.768 tokens y está diseñado para tareas de alto rendimiento en código asíncrono, primitivas de concurrencia, estructuras de datos sin bloqueos y razonamiento técnico estructurado.

La relevancia de este modelo radica en su enfoque específico hacia programación de sistemas en Python asyncio, Rust (tokio, crossbeam), C++ y automatización de shell, con un rendimiento medido de 39,2 a 40,3 tokens por segundo en una GPU AMD RX 6600 de 8 GB, consumiendo solo 3,27 GB de VRAM. Esto lo hace accesible para desarrolladores con hardware modesto que necesitan un asistente de código de baja latencia. La licencia es la Gemma Terms of Use, que permite uso comercial bajo ciertas condiciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer basado en Gemma 2 (Google) |
| Parametros totales | 7.518.069.290 (7,5 B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 32.768 tokens |
| Tipos de cuantizacion | Q4_K_M (GGUF) |
| Idiomas soportados | ingles (en) |
| Licencia | Gemma Terms of Use (licencia propietaria de Google con uso comercial permitido) |
| Formato de pesos | GGUF (archivo de 5,0 GB) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Gemma 2 de Google, concretamente en la variante instruct de 9 mil millones de parámetros (google/gemma-2-9b-it). Gemma 2 es un transformer decoder-only con atención de múltiples cabezas (multi-head attention) y optimizaciones como sliding window attention y alternancia de capas locales/globales. El merge heretic-coder-v1 combina pesos de la versión instruct con ajustes orientados a programación de sistemas, aunque no se han publicado detalles técnicos sobre el proceso de fusión ni sobre los datos de entrenamiento utilizados.

El modelo se distribuye únicamente como cuantización Q4_K_M en formato GGUF, lo que reduce el tamaño del archivo a 5,0 GB y permite su ejecución con llama.cpp, llama-server u Ollama. No se dispone de información sobre el número de tokens de entrenamiento, el dataset utilizado ni si se aplicaron técnicas como RLHF o DPO. El autor indica que se trata de un merge "tuned" manualmente, pero no aporta métricas de validación más allá de una prueba interna de rendimiento en una tarea de programación asíncrona.

## Capacidades

- Generación de código en Python (especialmente asyncio), Rust (tokio, crossbeam), C++ y scripts de shell.
- Razonamiento técnico estructurado sobre concurrencia, ejecución determinista, estructuras de datos sin bloqueos y mecánicas de backpressure.
- Comprensión de primitivas de programación de sistemas como colas de prioridad, reintentos con backoff exponencial y apagado controlado en dos fases.
- Soporte de conversación multi-turno mediante el formato de turnos de Gemma (template `<|turn>user...<turn|>`).
- No se menciona soporte de tool calling, function calling, agentes ni razonamiento multi-paso explícito.
- Capacidades multilingües limitadas: el modelo está orientado al inglés, aunque la arquitectura base Gemma 2 soporta otros idiomas; no se ha validado su rendimiento en español u otros idiomas.

## Casos de uso

- Asistente para programación asíncrona en Python: el modelo puede generar y depurar código asyncio con colas de prioridad, reintentos con backoff exponencial y apagado ordenado, como se demuestra en la prueba interna del autor.
- Desarrollo de sistemas en Rust: ayuda en la escritura de código con tokio, crossbeam y primitivas de concurrencia sin bloqueos, proporcionando ejemplos de estructuras de datos y patrones de sincronización.
- Automatización de shell: generación de scripts robustos para tareas de administración de sistemas, incluyendo manejo de señales y procesos concurrentes.
- Asistente de revisión de código: puede analizar fragmentos de código en C++ o Rust y sugerir mejoras sobre gestión de recursos, hilos o memoria.
- Entrenamiento de equipos de ingeniería: sirve como tutor interactivo para explicar conceptos de programación de sistemas y concurrencia en inglés.
- Prototipado rápido de servicios concurrentes: permite esbozar arquitecturas de servidores con colas de prioridad y mecanismos de backpressure para su posterior implementación en producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandarizados (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La única métrica documentada proviene de una prueba interna del autor sobre una tarea de programación asíncrona con una cola de prioridad en Python:

| Tarea | Tokens evaluados | Velocidad | VRAM utilizada | Hardware |
|---|---|---|---|---|
| Worker pool asíncrono con retries y apagado deu | 3.460 | 39,19 tok/s | 3,27 GB / 8,00 GB | AMD Radeon RX 6600 |

La prueba confirma que el modelo es capaz de generar código correcto con `asyncio.PriorityQueue` y orden FIFO determinista, y que mantiene un rendimiento sostenido en hardware de consumo sin degradación de velocidad.

## Requisitos de hardware

- VRAM estimada para inferencia: 3,27 GB en cuantización Q4_K_M, lo que permite ejecutarse en GPUs de 8 GB con margen.
- GPUs recomendadas: AMD Radeon RX 6600/7600 (8 GB), NVIDIA RTX 3060/4060 (8 GB), y Apple Silicon con memoria unificada de 8 GB.
- Consumo en GPU de 8 GB: el modelo cabe completamente en VRAM con 0 capas fuera de la GPU (100% offload).
- Opciones de despliegue: llama.cpp (llama-server), Ollama (compatible con el archivo GGUF), y cualquier runtime compatible con GGUF.
- Latencia y throughput: se ha medido 39,2–40,3 tokens/s en AMD RX 6600 con contexto de 32K tokens, sin throttling.

## Comparativa con modelos similares

La siguiente tabla compara heretic-coder-v1 con otros modelos de codigo de tamano similar (7-9 mil millones de parametros). Los datos de los modelos alternativos provienen de sus respectivas fichas publicas y pueden variar segun la cuantizacion.

| Modelo | Parametros | Contexto | Licencia | Enfoque principal |
|---|---|---|---|---|
| heretic-coder-v1 (GGUF Q4_K_M) | 7,5 B | 32.768 | Gemma Terms of Use | Programacion de sistemas, asyncio, Rust, concurrencia |
| Qwen2.5-Coder-7B | 7,6 B | 131.072 | Apache 2.0 | Codigo general, multilenguaje |
| StarCoder2-7B | 7,3 B | 16.384 | BigCode OpenRAIL-M | Codigo general, 600+ lenguajes |
| Gemma 2 9B (base) | 9 B | 8.192 | Gemma Terms of Use | Modelo general, no especializado en codigo |

No se dispone de datos comparativos de benchmarks entre estos modelos en la informacion proporcionada. La ventaja de heretic-coder-v1 radica en su optimizacion especifica para sistemas de programacion y su cuantizacion Q4_K_M que permite ejecucion en GPUs de 8 GB.

## Limitaciones y advertencias

- Sesgos y alucinaciones: no se han publicado evaluaciones de sesgos o tasas de alucinacion para este modelo; se desconoce su comportamiento en escenarios de produccion.
- Limitaciones de idioma: el modelo esta orientado al ingles y no se ha validado su rendimiento en espanol u otros idiomas.
- Restricciones de licencia: la licencia Gemma Terms of Use permite uso comercial, pero requiere el cumplimiento de las condiciones de Google, incluyendo la restriccion de uso para ciertos propositos prohibidos (por ejemplo, generacion de contenido ilegal o danino).
- Contexto de 32K: aunque es generoso, no es comparable con modelos de contexto largo (por ejemplo, Qwen2.5-Coder con 131K), lo que limita el analisis de repositorios muy grandes.
- Dependencia de la cuantizacion: el archivo solo esta disponible en Q4_K_M; no se ofrecen variantes de mayor precision (Q8, FP16) para usuarios que necesiten menor perdida de calidad.
- Sin soporte de tool calling: no se menciona integracion con herramientas externas ni function calling, lo que limita su uso en pipelines de agentes automaticos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Hxwvr/heretic-coder-v1-GGU
- Autor del modelo (Hxwvr): https://huggingface.co/Hxwvr
- Repositorio del autor (Hexeweavr): https://github.com/Hexeweavr
- Modelo base: https://huggingface.co/google/gemma-2-9b-it
- Proyecto Heretic (herramienta de eliminacion de censura, relacionado por nombre pero no por el modelo): https://github.com/p-e-w/heretic
