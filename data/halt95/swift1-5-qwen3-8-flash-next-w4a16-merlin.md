# halt95/Swift1.5-Qwen3.8-Flash-Next-W4A16-Merlin

## Resumen

Swift1.5-Qwen3.8-Flash-Next-W4A16-Merlin es una compilación cuantizada a 4 bits del modelo Swift 1.5 de UkisAI, un post-entrenamiento orientado a eficiencia de razonamiento sobre Qwen3.8-Flash-Next. Se trata de un modelo de mezcla de expertos (MoE) de 125B parámetros totales con 6B activos por token, que incorpora torre de visión y una ventana de contexto de 262.144 tokens. El checkpoint lo publica el desarrollador independiente halt95 y está pensado para servirse con Merlin, un fork de vLLM 0.33.0 optimizado para GPUs Ampere y Ada.

La relevancia de esta ficha reside en que permite ejecutar un MoE de 125B con visión y contexto completo de 262K en cuatro GPUs de 24 GB (RTX 3090), algo que el modelo en BF16 no permite. Para ello combina expertos enrutados en INT4, la tabla de embeddings n-gram en FP8 alojada en RAM del host, atención y torre de visión en BF16, y una caché KV en FP8 con escalas recalibradas sobre los pesos de Swift 1.5.

Es un derivado independiente: no está hecho, revisado ni respaldado por UkisAI ni por Qwen. La licencia es Swift Open License 1.0 combinada con Qwen Community License 1.0, lo que condiciona el uso comercial. El repositorio ocupa 123,8 GB y acumula 339 descargas en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE con atención híbrida (Gated DeltaNet en 36 capas + atención q/k/v/o en 12 capas), torre de visión y cabeza MTP para decodificación especulativa |
| Parametros totales | 123.958.298.771 (≈124B) |
| Parametros activos | 6B por token (MoE, 512 expertos enrutados por capa) |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | W4A16: expertos enrutados INT4 g128, proyecciones DeltaNet INT8 por canal, atención y expertos compartidos BF16, tabla n-gram FP8, caché KV FP8 E4M3 |
| Idiomas soportados | Inglés (en) |
| Licencia | swift-open-license-1.0 (combinada con Qwen Community License 1.0) |
| Formato de pesos | safetensors (compressed-tensors), servido con vLLM/Merlin |

## Arquitectura y entrenamiento

El modelo base es un MoE con 512 expertos enrutados por capa y 6B parámetros activos por token, sobre el que Swift 1.5 aplica un post-entrenamiento orientado a eficiencia de razonamiento. La arquitectura combina 36 capas con proyecciones Gated DeltaNet (`in_proj_qkv`, `in_proj_z`, `out_proj`) y 12 capas con atención clásica `q/k/v/o`, además de 48 capas con expertos compartidos, una torre de visión y una cabeza MTP (multi-token prediction) usada como draft head para decodificación especulativa. Incorpora además una tabla de embeddings n-gram (PLE) de 51B parámetros.

El proceso de cuantización de este checkpoint se basa en una comparación tensor a tensor entre Swift 1.5 (revisión `0bd4fe2`) y Qwen3.8-Flash-Next (revisión `de4b8e4`): solo cambiaron 300 tensores densos (atención en 12 capas, proyecciones DeltaNet en 36 capas y expertos compartidos en 48 capas), que se toman de Swift 1.5; el resto proviene del checkpoint Flash-Next cuantizado. Los expertos enrutados en INT4 g128 proceden de la release AutoRound de Intel vía el checkpoint Flash-Next, ya que Swift 1.5 no los modificó. La cabeza MTP se verificó con SHA-256 completo de cada tensor. Las escalas estáticas de la caché KV en FP8 se recalibraron sobre Swift 1.5 (`qsa_kv_scales_swift.json`) porque `k_proj` y `v_proj` cambiaron. No se dispone de información sobre el número de tokens de entrenamiento ni sobre la composición del dataset.

## Capacidades

- Generación de texto y razonamiento con modo "thinking" configurable (el servidor usa effort medium por defecto).
- Procesamiento de imagen y texto (`image-text-to-text`) mediante torre de visión en BF16.
- Razonamiento multi-paso y soporte de agentes: el bench card reporta ocho conversaciones de 16K tokens mantenidas de forma simultánea.
- Decodificación especulativa mediante cabeza MTP integrada.
- Contexto largo de hasta 262.144 tokens, con caché KV en FP8 íntegramente en VRAM.
- Capacidades multilingües limitadas: la model card declara únicamente inglés.
- No se documenta soporte explícito de tool calling o function calling en la información disponible.

## Casos de uso

- Agentes conversacionales de contexto largo: con 262K tokens de ventana y una caché KV en FP8 que permite mantener tres sesiones completas simultáneas en cuatro RTX 3090, encaja en asistentes que deben recordar documentos o historiales extensos durante toda la sesión.
- Análisis de documentos con imágenes: la pipeline `image-text-to-text` y la torre de visión permiten extraer información de capturas, diagramas o páginas escaneadas junto con el texto que las acompaña.
- Procesamiento por lotes de prompts largos: el prefill medido de 6.932 tok/s sobre un prompt de 100K tokens hace viable clasificar o resumir documentos de decenas de miles de tokens en pipelines offline.
- Despliegue en hardware de gama alta de consumo: al caber en cuatro RTX 3090 sin NVLINK, permite montar un servidor de inferencia de un modelo de 124B en infraestructura propia en lugar de depender de GPUs de centro de datos.
- Razonamiento con esfuerzo controlado: el modo thinking con effort medium por defecto permite ajustar la profundidad de razonamiento según el coste de latencia aceptable en cada tarea.
- Servicio multiagente concurrente: los 659 tok/s agregados con ocho agentes simultáneos y thinking activo lo sitúan como candidato para orquestadores que lanzan varios subagentes en paralelo.
- Prototipado de aplicaciones multimodales en inglés: al ser un derivado servible con vLLM, se integra en stacks existentes para validar producto antes de migrar a infraestructura mayor.

## Benchmarks y rendimiento

Los datos disponibles son mediciones de inferencia del autor (Merlin 3.0.2 sobre vLLM 0.33.0, 4× RTX 3090 sin NVLINK a 220W, P2P activo, bench card del 2026-11-05), no resultados de benchmarks académicos:

| Metrica | Valor | Condiciones |
|---|---|---|
| Decode | 186 tok/s | Un stream, thinking on (effort medium), 261.888 tokens de prompt + 128 de salida, mediana de 3 |
| Prefill | 6.932 tok/s | Prompt en frío de 101.845 tokens |
| Agentes concurrentes | 659 tok/s agregados | Ocho conversaciones de 16K y ocho follow-ups simultáneos de 512 tokens, thinking on |
| Pool KV | 924.993 tokens | FP8, íntegramente en VRAM |
| Sesiones de 262K simultáneas | 3 | Run de la versión 3.0.0 |

No se han publicado resultados de benchmarks académicos (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada: el checkpoint pesa 115 GiB distribuidos entre pesos y caché; los expertos enrutados van en INT4 y la tabla n-gram FP8 de 47,7 GiB se mantiene en RAM del host en tiempo de servicio.
- GPU recomendadas: cuatro RTX 3090 de 24 GB (Ampere, sm86) es la configuración medida. El motor incluye perfiles Swift para otras tarjetas Ampere y Ada; los perfiles Ada están en pruebas o sin probar.
- Cabe en GPU de consumo: sí, en cuatro RTX 3090. No cabe en una sola GPU de consumo.
- Opciones de despliegue: Merlin 3.0.2 (fork de vLLM 0.33.0) es el motor con el que se han generado las mediciones; la librería declarada es vLLM. No se documenta soporte de llama.cpp, Ollama ni TGI.
- Latencia y throughput: 186 tok/s en decode con contexto completo de 262K y 6.932 tok/s de prefill en un prompt de 100K, según el bench card del autor.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Vision | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Swift1.5-Qwen3.8-Flash-Next-W4A16-Merlin | 124B totales, 6B activos | 262.144 | Sí | Swift Open 1.0 + Qwen Community 1.0 | HuggingFace, servido con Merlin/vLLM |
| ukisai/Swift1.5-Qwen3.8-Flash-Next (base) | 124B totales, 6B activos | 262.144 (no confirmado en la información disponible) | Sí | no disponible | HuggingFace |
| halt95/Qwen3.8-Flash-Next-W4A16-Merlin | 124B totales, 6B activos | 262.144 (no confirmado en la información disponible) | Sí | no disponible | HuggingFace |
| Intel/Qwen3.8-Flash-Next-W4A16-AutoRound | 124B totales, 6B activos | no disponible | Sí | no disponible | HuggingFace |

La comparativa se limita a los checkpoints citados en la model card; no se dispone de datos de rendimiento comparativo entre ellos más allá de que comparten la base Qwen3.8-Flash-Next.

## Limitaciones y advertencias

- Derivado independiente: no está hecho, revisado ni respaldado por UkisAI ni por Qwen; la calidad del merge y de la recalibración de escalas KV es responsabilidad del autor del checkpoint.
- Idiomas: solo se declara inglés, lo que limita su uso en castellano u otros idiomas sin evaluación adicional.
- Licencia: Swift Open License 1.0 combinada con Qwen Community License 1.0; es necesario revisar ambas antes de cualquier uso comercial.
- Hardware restringido: las mediciones y perfiles están orientados a Ampere (sm86); los perfiles Ada están en pruebas o sin probar, y no se documenta soporte para Hopper u otras arquitecturas.
- Dependencia de motor: el rendimiento reportado se obtiene con Merlin 3.0.2, un fork de vLLM; no hay garantías de comportamiento equivalente en vLLM estándar u otros servidores.
- Riesgo de alucinación: no se documentan evaluaciones de fidelidad ni de sesgos en la información disponible.
- Contexto: aunque la ventana es de 262K, mantener tres sesiones completas simultáneas consume prácticamente todo el pool KV de 924.993 tokens, lo que limita la concurrencia con prompts muy largos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/halt95/Swift1.5-Qwen3.8-Flash-Next-W4A16-Merlin
- Modelo base Swift 1.5 (UkisAI): https://huggingface.co/ukisai/Swift1.5-Qwen3.8-Flash-Next
- Checkpoint Flash-Next cuantizado: https://huggingface.co/halt95/Qwen3.8-Flash-Next-W4A16-Merlin
- Release AutoRound de Intel: https://huggingface.co/Intel/Qwen3.8-Flash-Next-W4A16-AutoRound
- Tabla n-gram NVFP4 (RadixArk): https://huggingface.co/RadixArk/Qwen3.8-Flash-Next-NVFP4
- Motor Merlin: https://github.com/halt95/merlin-engine
- Bench card: https://github.com/halt95/merlin-engine/blob/main/models/swift1.5/benchmarks/2026-11-05/BENCH-CARD.md
- Comunidad en Discord: https://discord.gg/jVDYAwdGzt
