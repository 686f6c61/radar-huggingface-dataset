# latentport/LPCompact-Qwen3.8-27B

## Resumen

LPCompact-Qwen3.8-27B es un selector de compactación de estado aprendido, desarrollado por latentport, que se acopla al modelo Qwen3.8-27B para reducir el consumo de memoria de la caché KV durante la inferencia de contexto largo. No es un modelo de lenguaje autónomo: es un artefacto de 393.473 parámetros que, integrado en el runtime LatentPort, decide qué entradas de atención merece la pena conservar en el estado de un modelo en ejecución. El problema que resuelve es el coste cuadrático en memoria de la caché KV cuando el contexto crece hasta 128K posiciones.

La innovación principal es que la compactación se realiza directamente sobre el estado de atención en ejecución, sin resúmenes de texto ni reinyección de tokens históricos. El estado recurrente, el estado de convolución y el reloj lógico de continuación se preservan, de modo que la generación puede continuar tras la compactación. El mismo checkpoint de selector funciona tanto con pesos BF16 como con cuantizaciones GGUF del modelo base, lo que desacopla la política de compactación de la precisión de los pesos.

Es relevante ahora porque permite desplegar Qwen3.8-27B con ventanas de 128K en hardware más modesto: según la model card, la selección 8x reduce el almacenamiento de tensores de atención BF16 de 8 GiB a 1 GiB. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y el tamaño del repo figura como 0.0 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Selector de compactación de estado: 3.072 características de entrada, capa oculta de 128 unidades con GELU, una puntuación de salida |
| Parametros totales | 393.473 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | Cualificada en runtime a 64K y 128K; activación normal a partir de 65.536 posiciones KV físicas |
| Tipos de cuantizacion | Selector en FP32; compatible con Qwen3.8-27B en BF16, Q4_K_M y Q8_0 |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (model.safetensors); los pesos del modelo base, incluidos GGUF, se obtienen por separado |

## Arquitectura y entrenamiento

El selector es una red pequeña de tipo MLP: recibe 3.072 características derivadas de tres capas de valores de atención y emite una puntuación de utilidad por posición. La política por defecto retiene un octavo de las posiciones KV de atención, con un suelo de 1.024 posiciones, y ofrece además un ajuste 4x. Su política de spans preserva las primeras y últimas 512 posiciones y selecciona el resto de la memoria dentro del presupuesto solicitado. Los pesos del selector son FP32 y su `config.json` registra arquitectura, política y hashes.

No se dispone de información sobre el conjunto de datos de entrenamiento, el número de tokens, la composición del dataset ni si se emplearon técnicas de RLHF o DPO. La model card no documenta el procedimiento de entrenamiento del selector más allá de su arquitectura y su función. La innovación técnica destacable es la compatibilidad de un único checkpoint entre BF16 y GGUF: los adaptadores de LatentPort proporcionan un diseño común de estado de atención en BF16, de modo que la precisión de los pesos del modelo base no altera la arquitectura ni los pesos del selector. La cualificación de runtime superó pruebas de generación continuada, guardado/carga, forks y compactación repetida.

## Capacidades

- Compactación de la caché KV de Qwen3.8-27B seleccionando entradas de memoria de atención directamente desde el estado en ejecución.
- Preservación del estado recurrente, el estado de convolución y el reloj lógico de continuación tras la compactación.
- Funcionamiento sin resumen de texto ni reinyección de tokens históricos.
- Compatibilidad con pesos BF16 y con cuantizaciones GGUF Q4_K_M y Q8_0 del modelo base.
- Soporte de forks, guardado/carga, append y generación continuada sobre el estado devuelto, que es un State inmutable de LatentPort.
- Política de retención configurable: por defecto 1/8 de posiciones con suelo de 1.024, y ajuste 4x disponible.
- Preservación de las primeras y últimas 512 posiciones mediante política de spans.
- No es un modelo generativo: no realiza tool calling, agentes, razonamiento ni capacidades multilingües por sí mismo; estas dependen de Qwen3.8-27B.

## Casos de uso

- Inferencia de contexto largo en 128K: el selector reduce el almacenamiento de tensores de atención BF16 de 8 GiB a 1 GiB con selección 8x, lo que permite mantener sesiones largas en GPUs con menos VRAM.
- Despliegue de Qwen3.8-27B en cuantización GGUF: el mismo selector funciona con Q4_K_M y Q8_0, de modo que un pipeline de producción puede cambiar la precisión del modelo base sin reentrenar ni sustituir la política de compactación.
- Sesiones de agente multi-turno: el estado compactado conserva el reloj lógico de continuación y admite append y fork, lo que encaja con flujos donde el agente acumula historial y necesita ramificar exploraciones.
- Procesamiento de documentos extensos: con contexto de 128K y compactación por spans que preserva inicio y final, resulta adecuado para tareas de lectura y continuación sobre contratos, informes o código de gran tamaño.
- Servidores de inferencia con múltiples sesiones concurrentes: al reducir la huella de la caché KV por sesión, aumenta el número de sesiones que caben en la misma GPU.
- Checkpointing y reanudación de tareas largas: el soporte de save/load del estado compactado permite pausar y reanudar sesiones sin reconstruir el historial desde cero.
- Evaluación comparativa de políticas de memoria: los ajustes por defecto, 4x y 8x permiten medir el compromiso entre calidad de generación y ahorro de memoria en un mismo modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente documenta la cualificación de runtime a 64K y 128K con BF16, Q4_K_M y Q8_0, sin métricas de calidad, latencia ni throughput.

## Requisitos de hardware

- El selector en sí ocupa 393.473 parámetros en FP32, una huella despreciable frente al modelo base.
- El requisito real lo marca Qwen3.8-27B: los pesos del modelo base se obtienen por separado y no se documenta su huella de VRAM en la información disponible.
- La compactación reduce la memoria de atención: de 8 GiB a 1 GiB en BF16 a 128K con selección 8x.
- GPU recomendadas: no disponible de forma específica; la viabilidad depende de la cuantización del modelo base (Q4_K_M, Q8_0 o BF16).
- Despliegue mediante el runtime LatentPort, con backend `bf16` o `gguf`; no se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LPCompact-Qwen3.8-27B | Selector de compactación de estado | 393.473 | 64K-128K (cualificado) | Apache 2.0 | Hugging Face + runtime LatentPort en GitHub |
| Qwen3.8-27B | LLM base | 27B (según denominación) | No disponible | No disponible | Hugging Face (Qwen/Qwen3.8-27B) |
| Alternativas de compactación de KV cache | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de información sobre otros selectores de compactación comparables ni sobre sus métricas, por lo que la comparación cuantitativa no está disponible.

## Limitaciones y advertencias

- No es un modelo de lenguaje: requiere Qwen3.8-27B y el runtime LatentPort para funcionar; no puede usarse de forma autónoma.
- La compactación descarta posiciones de atención; la pérdida de calidad asociada a cada política (1/8, 4x, 8x) no está cuantificada en la información disponible.
- La activación normal comienza a 65.536 posiciones KV físicas; por debajo de ese umbral la compactación no entra en juego según la política descrita.
- Sesgos conocidos: no disponible; dependen del modelo base y del entrenamiento del selector, no documentado.
- Riesgo de alucinación: no evaluado para este artefacto; heredado del modelo base.
- Idiomas soportados: no disponible.
- Licencia Apache 2.0, que permite uso comercial, pero conviene verificar la licencia del modelo base Qwen3.8-27B por separado.
- El repositorio registra 0 descargas y 0 likes, y el tamaño del repo figura como 0.0 GB; conviene verificar la integridad de los artefactos antes de usarlo en producción.
- La model card advierte de que los pesos del modelo base, incluidos los GGUF, no se incluyen en este repositorio.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/latentport/LPCompact-Qwen3.8-27B
- Runtime LatentPort en GitHub: https://github.com/LatentPort/latentport
- Release del runtime lpcompact-v0.1: https://github.com/LatentPort/latentport/releases/tag/lpcompact-v0.1
- Instrucciones de configuración BF16/GGUF: https://github.com/LatentPort/latentport/blob/main/docs/compaction.md
- Registro de validación de runtime: https://github.com/LatentPort/latentport/blob/main/docs/compaction-validation.json
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
