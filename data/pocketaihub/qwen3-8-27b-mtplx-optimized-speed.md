# PocketAiHub/Qwen3.8-27B-MTPLX-Optimized-Speed

## Resumen

Qwen3.8-27B-MTPLX-Optimized-Speed es una conversión cuantizada del modelo Qwen3.8-27B de Qwen, realizada por PocketAiHub con el runtime MTPLX 2.7.1. El objetivo es optimizar la velocidad de inferencia en hardware Apple Silicon mediante una combinación de cuantización mixta (4-bit y 8-bit) y decodificación especulativa multi-token (MTP). El modelo mantiene las capacidades del original —generación de texto, razonamiento, tool calling y entrada multimodal— pero reduce el footprint de memoria y acelera la generación hasta 2,36× frente a la decodificación autorregresiva clásica en un Apple M5 Max.

Aunque el nombre sugiere 27 mil millones de parámetros, el archivo safetensors contiene 6.086.364.400 parámetros (~6,09 B), lo que indica que se trata de una versión reducida o que el dato del autor difiere del nombre. La ventana de contexto configurada alcanza los 262.144 tokens, con pruebas reales a 4K. La licencia es Apache-2.0, lo que permite uso comercial sin restricciones adicionales.

La relevancia de este modelo radica en su enfoque práctico para despliegues locales en macOS: ofrece un rendimiento de decodificación superior a 50 tokens por segundo en modo D3, manteniendo una calidad cercana al modelo BF16 original (KL media de 0,0585 nats). Está pensado para desarrolladores que necesitan ejecutar un LLM de alto rendimiento en equipos Apple sin depender de servicios en la nube.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivado de Qwen3.8-27B) con decodificacion especulativa multi-token (MTP) |
| Parametros totales | 6.086.364.400 (~6,09 B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 262.144 tokens configurados; probado a 4K |
| Tipos de cuantizacion | Mixta: 4-bit grupo 32 (bulk), 8-bit grupo 64 (embeddings, LM head, GDN output projections, ultimos 8 bloques MLP), BF16 (tensores de estado/norm y cabeza MTP) |
| Idiomas soportados | No disponible (heredado del modelo base Qwen3.8-27B) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

El modelo es una conversión cuantizada del Qwen3.8-27B original, realizada con el runtime MTPLX 2.7.1. La arquitectura subyacente es un transformer estándar, pero se incorpora una cabeza de predicción multi-token (MTP) con profundidad 3, que permite generar varios tokens por paso en lugar de uno solo. Esto, combinado con la cuantización mixta, reduce la carga computacional y la memoria necesaria durante la inferencia.

La cuantización no es uniforme: la mayor parte de los pesos se almacenan en 4-bit con grupo 32, mientras que las capas más sensibles (embeddings, salida del LM head, proyecciones GDN y los últimos ocho bloques MLP) se mantienen en 8-bit con grupo 64. Los tensores de estado y normalización, junto con la cabeza MTP, se conservan en BF16 para preservar la precisión en los puntos críticos. Esta estrategia busca equilibrar velocidad y fidelidad, como refleja la KL divergence medida de 0,0585 nats frente al modelo BF16.

No se han publicado detalles sobre el entrenamiento original del modelo base, ya que esta es una conversión derivada. El proceso de conversión fue reproducido y validado por PocketAiHub, y los pesos resultantes son byte-idénticos a los del repositorio oficial de referencia MTPLX.

## Capacidades

- Generación de texto autoregresiva con decodificación especulativa multi-token (hasta 3 tokens por paso).
- Razonamiento activable o desactivable (modo "thinking" on/off), según la configuración de sampling.
- Soporte de tool calling y selección estructurada de herramientas: 8/8 pruebas superadas.
- Entrada multimodal de imágenes (PNG, JPEG, WebP) a través de la API OpenAI `image_url`; identificó correctamente una imagen roja sólida como "red".
- Ventana de contexto larga configurada a 262.144 tokens, con recuperación exacta probada a 4K.
- Compatible con el protocolo OpenAI para API, lo que facilita su integración en aplicaciones existentes.
- Optimizado para Apple Silicon mediante MLX y MTPLX, con soporte de decodificación especulativa nativa.

## Casos de uso

- Asistente de programación local: gracias a su soporte de tool calling y generación de código, puede integrarse en editores o CLIs para autocompletar, refactorizar o explicar código sin enviar datos a la nube.
- Atención al cliente automatizada: con una ventana de contexto de 262K tokens, puede mantener conversaciones multi-turno extensas y recordar detalles de interacciones previas, ideal para bots de soporte en sitios web.
- Análisis de documentos largos: procesa informes, artículos o contratos de más de 100.000 tokens, extrayendo resúmenes o respondiendo preguntas específicas sobre el contenido.
- Generación de contenido creativo: redacción de artículos, guiones o material de marketing con control de estilo y tono, gracias a su capacidad de razonamiento ajustable.
- Herramienta de accesibilidad: conversión de texto a voz o asistencia a personas con discapacidad visual mediante descripción de imágenes, aprovechando su entrada multimodal.
- Desarrollo de agentes autónomos: su soporte de tool calling y razonamiento multi-paso permite construir agentes que consultan APIs, ejecutan comandos o navegan por bases de datos de forma autónoma.
- Despliegue en entornos sin GPU dedicada: al estar optimizado para Apple Silicon, puede ejecutarse en MacBooks y Mac Studios, reduciendo costes de infraestructura en comparación con servidores GPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K, etc.) en la información disponible. Los datos proporcionados se centran en rendimiento de inferencia y fidelidad de la conversión.

**Rendimiento de decodificación (Apple M5 Max, 40-core GPU, 128 GB unified memory, macOS 26.4, single stream):**

| Modo | Decode tok/s | End-to-end tok/s | Speedup vs AR | Aceptacion por profundidad |
|---|---:|---:|---:|---|
| AR (autorregresivo) | 24,62 | 24,11 | 1,00× | — |
| D1 (1 token especulativo) | 41,69 | 40,51 | 1,69× | 96,8% |
| D2 (2 tokens especulativos) | 52,85 | 51,18 | 2,15× | 95,4%, 87,3% |
| D3 (3 tokens especulativos) | 58,02 | 56,01 | 2,36× | 93,3%, 87,4%, 79,9% |

**Prueba con contexto de 4K (4.099 tokens formateados):**

| Modo | Prefill tok/s | Decode tok/s | Prompt eval | Pico RSS | Pico footprint |
|---|---:|---:|---:|---:|---:|
| AR | 907,8 | 26,4 | 4,52 s | 20,9 GB | 24,9 GB |
| D3 | 810,5 | 70,5 | 5,06 s | 20,9 GB | 29,0 GB |

**KL divergence (fidelidad de la cuantización):** media 0,05850 nats (BF16 → MTPLX), mediana 0,00203, p95 0,25609, acuerdo top-1 94,27%. El repositorio oficial reporta 0,0220 en una batería de codificación diferente; los valores no son directamente comparables.

## Requisitos de hardware

- Diseñado exclusivamente para Apple Silicon (macOS), utilizando MLX y MTPLX como runtime.
- Memoria unificada mínima estimada: 32 GB (basado en el footprint de 24,9 GB en modo AR y 29,0 GB en D3 durante la prueba de 4K).
- GPU recomendada: Apple M5 Max (40-core GPU, 128 GB) para el máximo rendimiento; modelos con menor número de núcleos obtendrán velocidades inferiores.
- No es compatible con GPUs NVIDIA o AMD; no se puede ejecutar en CUDA ni ROCm.
- Despliegue mediante `mtplx serve` (OpenAI-compatible API en `http://127.0.0.1:8000/v1`) o integración directa con la librería MLX.
- Latencia típica: prefill de ~4-5 segundos para 4K tokens, decode de 24-70 tok/s según el modo especulativo elegido.

## Comparativa con modelos similares

No se dispone de datos de comparación directa con otros modelos en la información proporcionada. Sin embargo, puede situarse junto a otras conversiones cuantizadas de Qwen para Apple Silicon, como las versiones GGUF de Qwen3.8-27B ejecutadas con llama.cpp. La principal diferencia es el uso de MTP (multi-token prediction) y la cuantización mixta específica para MLX, que ofrecen un speedup sustancial frente a la decodificación autorregresiva clásica en el mismo hardware. No se han publicado benchmarks comparativos con modelos como Llama 3.1 8B o Mistral 7B en este contexto.

## Limitaciones y advertencias

- La cuantización mixta introduce una ligera degradación de calidad respecto al modelo BF16 original (KL media de 0,0585 nats), aunque el acuerdo top-1 se mantiene en 94,27%.
- El modelo está optimizado únicamente para Apple Silicon; no funciona en arquitecturas x86 ni en GPUs de NVIDIA/AMD.
- El soporte de video está incluido en metadatos pero no ha sido probado en vivo; solo se ha validado la entrada de imágenes estáticas.
- En la prueba de control sin herramientas, el runtime emitió un cuerpo vacío al adjuntar el esquema de tool calling, aunque la selección de herramientas funcionó correctamente en los 8 casos evaluados.
- La ventana de contexto de 262K tokens está configurada, pero solo se ha verificado la recuperación exacta a 4K; no hay garantía de rendimiento en longitudes mayores.
- No se han publicado resultados de benchmarks de tareas (MMLU, HumanEval, etc.), por lo que la calidad en dominios específicos no está cuantificada.
- El nombre del modelo (27B) no coincide con el número real de parámetros (6,09 B); los usuarios deben verificar las especificaciones antes de integrarlo en producción.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/PocketAiHub/Qwen3.8-27B-MTPLX-Optimized-Speed)
- [Modelo base Qwen/Qwen3.8-27B](https://huggingface.co/Qwen/Qwen3.8-27B)
- [Repositorio MTPLX](https://github.com/youssofal/MTPLX)
- [Referencia oficial de cuantización MTPLX](https://huggingface.co/Youssofal/Qwen3.8-27B-MTPLX-Optimized-Speed)
