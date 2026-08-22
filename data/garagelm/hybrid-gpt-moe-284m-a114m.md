# garagelm/hybrid-gpt-moe-284m-a114m

## Resumen

hybrid-gpt-moe-284m-a114m es un modelo de investigación desarrollado por GarageLM, un laboratorio independiente de IA open source que opera con hardware de consumo (una Apple M4 Pro Mac mini). Se trata de un decoder-only transformer de 284 millones de parámetros totales (114 millones activos) que combina una arquitectura de atención híbrida (local con sliding window y global en capas específicas) con un bloque MoE de 8 expertos SwiGLU por capa, activando los dos mejores mediante routing top-2. Fue entrenado sobre 100M tokens de los datasets FineWeb-Edu y SmolLM-Corpus, y se publica exclusivamente como parte de un experimento controlado de tres brazos (milestone 13 del repositorio GarageLM) para evaluar si el MoE merece la pena bajo un presupuesto de memoria fijo.

El modelo es relevante ahora porque documenta un resultado negativo riguroso: con el mismo número de parámetros activos (114M), el MoE solo mejora la pérdida de validación en 0.0004 nats respecto al denso equivalente, pero pierde por 0.038 nats frente a un denso de 284M con el mismo presupuesto de memoria, y no se separa estadísticamente en ninguna tarea downstream. Su interés es académico y de reproducibilidad, no de uso práctico.

## Especificaciones técnicas
| Parametro | Valor |
|---|---|
| Arquitectura | Decoder-only transformer con atención híbrida (sliding window de 64 tokens en 9 capas, global en capas 3/7/11) y MoE top-2 de 8 expertos SwiGLU por capa |
| Parametros totales | 285.236.832 |
| Parametros activos | 114.000.000 |
| Longitud de contexto | 1024 tokens |
| Tipos de cuantizacion | bf16 (pesos), fp32 (cómputo); no se publican cuantizaciones GGUF/INT4 |
| Idiomas soportados | en (inglés) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento
El modelo sigue una arquitectura decoder-only de 12 capas con d_model 768, 12 cabezas de atención y 4 cabezas KV (GQA), RoPE con theta 10000, RMSNorm y weight tying. La atención es híbrida: las capas 0-11 usan una ventana deslizante de 64 tokens, excepto las capas 3, 7 y 11 que son completamente causales (global). Este diseño reduce el KV cache a 3.7MB en fp16 frente a los 12.6MB de una atención totalmente global (~30%). La FFN de cada capa se sustituye por un MoE de 8 expertos SwiGLU (hidden 1024), con un router lineal sin sesgo, softmax, top-2 y renormado de puertas sobre los dos expertos seleccionados.

El entrenamiento se realizó en una Apple M4 Pro Mac mini sobre 100M tokens de datos refinados (HuggingFaceFW/fineweb-edu y HuggingFaceTB/smollm-corpus), con una política de capacidad fija por experto (1.25 × tokens × 2 / 8 por forward, con descarte de tokens de menor puerta) para satisfacer el allocator MPS. La tasa de drop final fue de 0.0004 y la carga mínima de experto de 0.1147 (frente a un uniforme de 0.125). En inferencia, el wrapper por defecto usa routing sin pérdida de tokens (dropless), que recupera 0.0008 nats frente al modo con capacidad. El modelo se publica con el objetivo de reproducir el experimento controlado, no como modelo para usar.

## Capacidades
- Generación de texto en inglés: capacidad básica de completar secuencias de hasta 1024 tokens.
- Razonamiento de sentido común: puntuaciones cercanas al azar en tareas como HellaSwag (33-34% acc) y PIQA (52-56% acc), indicando capacidades limitadas.
- Conocimiento multitarea: MMLU de 26% (5-shot, 5 preguntas por materia), muy por debajo de modelos de tamaño similar entrenados con más datos.
- Sin soporte de tool calling, function calling, ni capacidades de agente multi-step.
- Sin capacidades multimodales (visión, audio).
- Multilingüismo: únicamente inglés, sin evidencia de transferencia a otros idiomas.
- Routing configurables: soporta dos modos de inferencia (dropless por defecto y modo con capacidad exacta para reproducir el entrenamiento).

## Casos de uso
- Reproducción de experimentos de investigación: el modelo permite replicar el milestone 13 de GarageLM, comparando el rendimiento de MoE frente a densos con el mismo presupuesto de memoria o activa.
- Educación en arquitecturas MoE: ideal para estudiar el comportamiento de routing top-2 con 8 expertos en un modelo pequeño, incluyendo el análisis de cargas de experto (EMA load/drop buffers incluidos en los pesos).
- Benchmark de eficiencia en hardware de consumo: documenta la viabilidad de entrenar y servir modelos de 284M en una sola Mac mini M4 Pro.
- Comparación de estrategias de routing: el wrapper permite probar el efecto de capacidad fija frente a dropless en la pérdida de validación.
- Estudio de escalado con presupuesto de memoria: sirve como punto de datos para investigar si el MoE compensa su mayor huella de parámetros cuando la memoria es el límite.
- Docencia de transformadores híbridos: el modelo ilustra la combinación de sliding window y global attention en capas concretas, con un KV cache reducido a un 30% del equivalente all-global.
- No se recomienda para tareas de producción (chat, generación de código, análisis de texto) debido a su bajo rendimiento en benchmarks y su contexto corto.

## Benchmarks y rendimiento
La model card publica resultados de lm-evaluation-harness con n=300 por tarea (acc y acc_norm cuando aplica), comparando tres brazos: el control denso de 114M, este modelo MoE (284M total, 114M activos) y un denso de 284M con el mismo presupuesto de memoria.

| Tarea | Control 114M denso | MoE (este modelo) | Denso 284M |
|---|---|---|---|
| HellaSwag (0-shot) | 32.3 / 33.7 | 34.3 / 33.0 | 33.3 / 33.3 |
| PIQA (0-shot) | 58.3 / 56.3 | 56.3 / 52.0 | 56.0 / 53.7 |
| ARC-Easy (0-shot) | 36.3 / 34.7 | 39.3 / 34.3 | 39.7 / 38.3 |
| WinoGrande (0-shot) | 51.7 | 49.0 | 49.7 |
| MMLU (5-shot, 5 por materia) | 26.7 | 26.0 | 27.0 |

La pérdida de validación en el split de 2M tokens es 3.8094 nats (modo capacidad) o 3.8086 (modo dropless), frente a 3.8398 del denso 114M y 3.7711 del denso 284M. El autor concluye que la diferencia de 2.0 puntos en el promedio de 4 tareas no es estadísticamente significativa (error estándar de ~2.9 puntos a n=300).

## Requisitos de hardware
- VRAM estimada: los pesos bf16 ocupan aproximadamente 285MB (285M × 2 bytes). Con KV cache y activaciones, se puede ejecutar en GPU con 1-2GB de VRAM.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4090, etc.) o un Apple Silicon con MPS (el modelo se entrenó en M4 Pro). También funciona en CPU con llama.cpp.
- Cabe en GPU consumer: sí, incluso en tarjetas de 4GB o menos.
- Opciones de despliegue: carga con transformers (trust_remote_code=True), llama.cpp, Ollama (si se convierte a GGUF), vLLM no es necesario para este tamaño.
- Latencia: el decode medido en la implementación de investigación es de 8.9 tok/s, pero el autor indica que es un artefacto de implementación (96 syncs GPU-to-host por forward). Con un wrapper optimizado se espera un rendimiento mucho mayor.

## Comparativa con modelos similares
La comparación más directa es con los dos brazos control del mismo experimento, así como con el modelo hermano hybrid-gpt-232m de GarageLM.

| Modelo | Params totales | Params activos | Contexto | Licencia | Rendimiento (4-task avg) |
|---|---|---|---|---|---|
| hybrid-gpt-moe-284m-a114m (este) | 285M | 114M | 1024 | Apache-2.0 | 42.08 |
| hybrid-gpt-232m (denso, 1B tokens) | 232M | 232M | 1024 | Apache-2.0 | no disponible |
| Denso 114M (control) | 114M | 114M | 1024 | Apache-2.0 | 44.08 |
| Denso 284M (control) | 284M | 284M | 1024 | Apache-2.0 | 43.75 |

La comparativa con otros MoE de tamaño similar (como Mixtral 8x7B o Qwen MoE) no es relevante por la diferencia de escala y de datos de entrenamiento; el modelo se posiciona como un punto de datos en investigación de eficiencia, no como competidor de modelos de producción.

## Limitaciones y advertencias
- El propio autor declara que el modelo se publica para reproducibilidad de un experimento, no para uso en producción.
- Resultado negativo: el MoE no aporta una mejora medible en tareas downstream frente al denso equivalente; la diferencia de pérdida de validación es de 0.0004 nats frente al control activo y pierde por 0.038 nats frente al denso de mismo presupuesto de memoria.
- Decode lento en la implementación de investigación (8.9 tok/s) por el dispatch de 96 syncs GPU-host por forward; no es un límite arquitectónico sino de código.
- Contexto limitado a 1024 tokens, insuficiente para tareas de documento largo.
- Solo inglés; sin soporte multilingüe.
- Sesgos y alucinaciones no documentados específicamente, pero el bajo rendimiento en MMLU (26%) sugiere un conocimiento factual muy pobre.
- Licencia Apache-2.0 permite uso comercial, pero el modelo no es útil para producción por su rendimiento.
- El wrapper requiere `trust_remote_code=True` en transformers, lo que implica ejecutar código del autor en el entorno.

## Enlaces
- Modelo en HuggingFace: https://huggingface.co/garagelm/hybrid-gpt-moe-284m-a114m
- Repositorio GitHub del proyecto: https://github.com/GarageLM/garagelm
- Web del laboratorio: https://garagelm.org/
- Modelo hermano hybrid-gpt-232m: https://huggingface.co/garagelm/hybrid-gpt-232m
- Conversión MLX de hybrid-gpt-232m: https://huggingface.co/garagelm/hybrid-gpt-232m-mlx
