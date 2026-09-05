# ankush13r/prelude-base-iter_0989075-yarn-32k

## Resumen

El modelo `ankush13r/prelude-base-iter_0989075-yarn-32k` es una variante del modelo `openeurollm/prelude`, un transformer denso de 9.094.607.872 parámetros (unos 9.09B) con arquitectura estilo Qwen3. La diferencia respecto al modelo base es exclusivamente la parametrización de RoPE mediante YaRN, lo que permite extender la ventana de contexto efectiva de 4.096 tokens nativos a 32.768 tokens, sin necesidad de entrenamiento adicional. Los pesos son idénticos a los del checkpoint `anneal300b_iter_0989075` del modelo base; solo cambia el mapeo de posiciones.

El desarrollo es de `ankush13r`, quien publicó tres variantes del mismo modelo base (`yarn-32k`, `yarn-128k` y `yarn-160k`) con distintos factores de escalado. Esta ficha se centra en la variante `yarn-32k`, que ofrece la mejor calidad dentro de su ventana de 32.768 tokens, pero que falla silenciosamente más allá de ese límite. El modelo está pensado para tareas que requieren contextos largos, como análisis de documentos extensos o recuperación aumentada por generación (RAG), aunque no ha sido validado en benchmarks de tareas downstream.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso estilo Qwen3: 36 capas, hidden 4096, FFN 12288, 32 cabezas de atención / 8 grupos KV, head dim 128, RMSNorm con QK-norm, SwiGLU, embeddings no compartidos |
| Parametros totales | 9.094.607.872 (~9.09B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 32.768 tokens efectivos (max_position_embeddings configurado a 131.072 solo para superar el chequeo de vLLM) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo base `openeurollm/prelude` es un transformer denso con arquitectura Qwen3: 36 capas, dimensión oculta 4096, FFN 12288, 32 cabezas de atención con 8 grupos KV, head dim 128, normalización RMSNorm con QK-norm, activación SwiGLU, embeddings no compartidos y vocabulario de 262.145 tokens (padding a 262.272). Fue entrenado con 4.096 posiciones nativas y RoPE base 100.000.

Esta variante no ha sido reentrenada. La modificación consiste en aplicar YaRN (Yet another RoPE extensioN) sobre los pesos existentes. En concreto, la configuración `yarn-32k` utiliza `rope_type: "yarn"`, `factor: 4.0`, `rope_theta: 375000.0`, `beta_fast: 2048.0` y `beta_slow: 32.0`. El parámetro `original_max_position_embeddings` está declarado como 32.768, aunque el README explica que esto se hizo para satisfacer la comprobación de vLLM; la forma equivalente con el original real de 4.096 sería `factor: 4`, `theta: 375000` y betas `256/4`. El efecto de la reparametrización es que el modelo puede leer hasta 32.768 tokens con una perplexidad estable, pero más allá de ese punto la salida se degrada rápidamente.

## Capacidades

- Generación de texto en inglés con ventana de contexto de hasta 32.768 tokens.
- Extensión de contexto mediante YaRN sin reentrenamiento, lo que permite procesar documentos largos de forma directa.
- La arquitectura base soporta atención multi-cabeza con grupos KV, lo que reduce el coste de memoria en inferencia.
- No se documentan capacidades de tool calling, function calling, soporte de agentes, razonamiento multi-paso, visión o audio.
- No hay validación en tareas específicas como generación de código, matemáticas o razonamiento complejo.
- El modelo es un checkpoint de investigación intermedio, no un modelo final pulido.

## Casos de uso

- Análisis de documentos legales extensos: el modelo puede procesar contratos o expedientes de más de 30.000 tokens en una sola pasada, lo que permite resumir cláusulas, extraer obligaciones o comparar secciones sin fragmentar el texto.
- Recuperación aumentada por generación (RAG): gracias a su ventana de 32.768 tokens, es posible inyectar múltiples fragmentos de documentos en el contexto y generar respuestas coherentes sin perder información de los primeros fragmentos.
- Resumen de informes técnicos largos: se puede alimentar el modelo con un informe completo de decenas de páginas y pedir un resumen estructurado, manteniendo la coherencia global.
- Análisis de logs de sistemas: los logs de aplicaciones o servidores pueden superar fácilmente 4.000 líneas; el modelo puede leer secuencias largas y detectar patrones o errores sin truncar el historial.
- Chat multi-turno con historial extenso: en asistentes conversacionales, el modelo puede mantener el contexto de conversaciones largas sin necesidad de resumir o descartar turnos anteriores.
- Procesamiento de corpus académicos: para investigadores, el modelo puede leer artículos completos o capítulos de libros y responder preguntas sobre su contenido, aprovechando la ventana de 32k.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El README proporciona únicamente métricas de perplexidad por banda de posición de token, que miden la integridad de RoPE y no el rendimiento en tareas. La tabla siguiente muestra la perplexidad para la variante `yarn-32k`:

| Banda de posiciones | Perplexidad |
|---|---|
| 4096-8192 | 2.449 |
| 8192-16384 | 2.228 |
| 16384-32768 | 2.140 |
| 32768-65536 | 123.7 |
| 65536-131072 | 519.2 |

Los valores en las bandas superiores a 32.768 indican que la salida es inutilizable más allá de la ventana efectiva. Comparado con el modelo base sin escalado:

| Banda | Base sin escalar | yarn-32k |
|---|---|---|
| 2048-4096 | 2.366 | 2.140 |
| 4096-8192 | 182.5 | 2.449 |
| 8192-16384 | 575.7 | 2.228 |
| 16384-32768 | 503.2 | 2.140 |

La mejora principal es que YaRN convierte un modelo que solo funcionaba hasta 4.096 tokens en uno que funciona hasta 32.768.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos en fp16 ocupan aproximadamente 18.2 GB (coincide con el tamaño del repositorio). Con cuantización a 8 bits, la VRAM necesaria baja a unos 9 GB; con 4 bits, a unos 5 GB. No se proporcionan cuantizaciones oficiales.
- GPU recomendadas: para fp16, se necesitan GPUs con al menos 24 GB de VRAM, como una RTX 3090/4090 o una A100 40GB. Para cuantización 4-bit, una RTX 3060 12GB o superior sería suficiente.
- El modelo cabe en GPUs de consumo si se cuantiza, pero no hay archivos GGUF o cuantizados en el repositorio, por lo que habría que generarlos.
- Opciones de despliegue: vLLM es la opción recomendada, con el comando `vllm serve <model> --max-model-len 32768` para limitar la ventana y evitar la degradación silenciosa. También se puede usar llama.cpp u Ollama si se convierten los pesos a GGUF.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto efectivo | Perplexidad 16k-32k | Perplexidad 65k-131k | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| prelude-base-iter_0989075-yarn-32k | 9.09B | 32.768 | 2.140 | No aplica | Apache 2.0 | HuggingFace |
| prelude-base-iter_0989075-yarn-128k | 9.09B | 131.072 | 2.642 | 2.340 | Apache 2.0 | HuggingFace |
| prelude-base-iter_0989075-yarn-160k | 9.09B | 163.840 | 2.720 | 2.363 | Apache 2.0 | HuggingFace |
| openeurollm/prelude (base sin escalar) | 9.09B | 4.096 | No aplica (falla) | No aplica | Apache 2.0 | HuggingFace |

La variante `yarn-32k` es la mejor dentro de su ventana, con una perplexidad un 19% inferior a la de `yarn-128k` en la banda 16k-32k. Sin embargo, las variantes de 128k y 160k son las únicas que funcionan más allá de 32k.

## Limitaciones y advertencias

- Se trata de una reparametrización de RoPE, no de un entrenamiento continuado. Existe un trade-off entre rango y calidad que ninguna configuración de parámetros elimina.
- La variante `yarn-32k` falla silenciosamente más allá de 32.768 tokens. El `max_position_embeddings` declarado (131.072) existe únicamente para que vLLM arranque; si se sirve el modelo sin limitar la longitud, la salida será inutilizable sin ninguna advertencia.
- La métrica utilizada es únicamente perplexidad por banda de posición. No se ha validado el modelo en tareas downstream, y no se ha realizado una prueba de tipo needle-in-a-haystack, que podría revelar fallos que la perplexidad media oculta.
- Las limitaciones del modelo base se trasladan: es un checkpoint de investigación intermedio, no un modelo final, y puede contener sesgos no mitigados.
- La licencia Apache 2.0 permite uso comercial, pero el modelo no ha sido evaluado para producción, por lo que se recomienda una validación exhaustiva antes de su despliegue.

## Enlaces

- HuggingFace del modelo: https://huggingface.co/ankush13r/prelude-base-iter_0989075-yarn-32k
- Modelo base en HuggingFace: https://huggingface.co/openeurollm/prelude
- No se han encontrado papers, blogs o demos adicionales en la información proporcionada.
