# mradermacher/Qwen3.6-35B-A3B-Mirage-i1-GGUF

## Resumen

Qwen3.6-35B-A3B-Mirage-i1-GGUF es una cuantización en formato GGUF del modelo Qwen3.6-35B-A3B-Mirage, publicada por el usuario mradermacher en Hugging Face. Se trata de una conversión a cuantización de tipo imatrix (importance matrix) del modelo original alojado en el repositorio nightmedia/Qwen3.6-35B-A3B-Mirage, que a su vez parece derivar de la familia Qwen3.6 con arquitectura MoE (el sufijo A3B indica aproximadamente 3 mil millones de parámetros activos sobre un total de 35.505.251.456 parámetros, según los metadatos de safetensors). El propósito de esta publicación es ofrecer variantes ligeras y desplegables en hardware de consumo mediante llama.cpp y ecosistemas compatibles con GGUF.

La ficha se basa exclusivamente en los metadatos disponibles en Hugging Face y en la model card del autor, que es extremadamente escueta: no incluye información sobre licencia, idiomas, pipeline, benchmarks ni detalles de entrenamiento. El repositorio tiene 29,4 GB de tamaño y, en el momento de la consulta, registra 0 descargas y 1 like, lo que sugiere una publicación muy reciente (creada el 16 de noviembre de 2026) y con escasa validación comunitaria.

Por tanto, esta ficha debe interpretarse como una descripción de la publicación de cuantizaciones y no como una evaluación independiente del modelo base. Cualquier dato sobre capacidades, rendimiento o licencia del modelo subyacente debe verificarse en el repositorio original de nightmedia y en la documentación oficial de Qwen.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (inferida del sufijo A3B y del nombre del modelo base); detalles no disponibles |
| Parametros totales | 35.505.251.456 |
| Parametros activos | aproximadamente 3B (inferido del sufijo A3B; no confirmado en la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q2_K_S, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, Q3_K_S, Q3_K_M, Q3_K_L, IQ3_XXS, IQ3_XS, IQ3_S, IQ3_M, Q4_0, Q4_1, Q4_K_S, Q4_K_M, IQ4_XS, IQ4_NL (small-IQ4_NL), Q5_K_S, Q5_K_M, Q6_K, IQ1_S, IQ1_M |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (cuantizaciones imatrix/weighted) |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna del modelo base más allá de lo que sugiere su denominación: un transformer con mezcla de expertos (MoE) de 35.505.251.456 parámetros totales y aproximadamente 3 mil millones de parámetros activos por token (sufijo A3B). El repositorio de mradermacher es una conversión a GGUF con cuantización ponderada mediante importance matrix (imatrix), una técnica que estima la importancia de cada peso a partir de estadísticas de activación para reducir el error de cuantización en bits bajos.

No hay datos en la información proporcionada sobre el número de tokens de entrenamiento, la composición del dataset, el uso de RLHF/DPO, la longitud de contexto nativa ni innovaciones técnicas del modelo original. La model card del repositorio se limita a metadatos de la herramienta de cuantización (quantize_version 2, convert_type hf, tags nicoboss) y a la lista de cuantizaciones generadas, sin documentar el proceso de entrenamiento.

## Capacidades

- Generación de texto conversacional: la etiqueta "conversational" en los metadatos indica un ajuste orientado a diálogo.
- Razonamiento y generación de código: no confirmado explícitamente en la información disponible, pero esperable en la familia Qwen3.6; requiere verificación en el modelo base.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponibles; el repositorio no declara idiomas.
- Capacidades especiales (modo thinking, visión, audio): no disponibles en la información proporcionada.
- Compatibilidad con endpoints: la etiqueta "endpoints_compatible" sugiere que el formato GGUF puede servirse mediante infraestructura compatible con Hugging Face Endpoints.

## Casos de uso

- Despliegue local en estaciones de trabajo con GPU de consumo: las cuantizaciones Q4_K_M e IQ4_XS permiten ejecutar un modelo de 35B totales con activación dispersa en GPUs de 24 GB, útil para prototipado y pruebas de concepto sin coste de API.
- Chat conversacional autoalojado: la orientación conversacional del modelo base lo hace adecuado para asistentes internos en entornos con requisitos de privacidad, siempre que se validen previamente sus capacidades reales.
- Evaluación comparativa de cuantizaciones: el repositorio ofrece más de veinte variantes (desde IQ1_S hasta Q6_K), lo que permite medir el compromiso entre tamaño, calidad y velocidad en un mismo hardware.
- Integración en llama.cpp y Ollama: el formato GGUF es directamente compatible con estos runners, lo que facilita su uso en pipelines de inferencia locales y en aplicaciones de escritorio.
- Servicio de inferencia con vLLM u otros motores compatibles con GGUF: para cargas moderadas donde el coste de GPU es una restricción y la calidad de las cuantizaciones de 4-5 bits es aceptable.
- Investigación sobre cuantización imatrix: útil para estudiar el impacto de las matrices de importancia en modelos MoE de gran tamaño total y baja activación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: depende de la cuantización. Para un modelo de 35,5B parámetros, las variantes Q4_K_M e IQ4_XS ocupan aproximadamente 20-21 GB en disco y requieren un tamaño similar de memoria al cargarse; las variantes Q5_K_M y Q6_K superan los 24-26 GB; las variantes IQ1/IQ2 quedan por debajo de 12-14 GB, con pérdida de calidad esperable.
- GPU recomendadas: RTX 4090 (24 GB) para cuantizaciones de 4 bits; A100 40 GB, H100 o RTX A6000 para 5-6 bits con contexto largo; GPUs de 12-16 GB (RTX 4070 Ti Super, RTX 4080) solo para cuantizaciones de 1-2 bits.
- Cabe en GPU de consumo: sí, en RTX 4090 y GPUs de 24 GB con cuantizaciones de 4 bits; en GPUs de 16 GB con cuantizaciones de 2 bits, con degradación de calidad.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, servidores compatibles con GGUF (por ejemplo, llama-cpp-python) y endpoints compatibles según la etiqueta del repositorio.
- Latencia y throughput: no disponibles; al ser un MoE con aproximadamente 3B activos, se espera un throughput superior al de un modelo denso de 35B, pero no hay mediciones publicadas en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros totales | Activos | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| Qwen3.6-35B-A3B-Mirage-i1-GGUF (este) | 35,5B | ~3B (inferido) | no disponible | no disponible | GGUF |
| Qwen3.6-35B-A3B-Mirage (base) | 35,5B | ~3B (inferido) | no disponible | no disponible | safetensors (presumible) |
| Otras cuantizaciones GGUF del mismo modelo base | no disponible | no disponible | no disponible | no disponible | GGUF |

No se dispone de datos de benchmarks ni de especificaciones verificadas de alternativas comparables en la información proporcionada, por lo que no es posible establecer una comparativa de rendimiento rigurosa.

## Limitaciones y advertencias

- La model card no declara licencia, lo que impide confirmar si el uso comercial está permitido; debe consultarse el repositorio del modelo base (nightmedia/Qwen3.6-35B-A3B-Mirage) y la licencia de la familia Qwen3.6.
- No hay información sobre sesgos, alineación ni filtros de seguridad del modelo base.
- Riesgo de alucinación inherente a los modelos generativos; sin benchmarks publicados no puede cuantificarse.
- Las cuantizaciones de 1-2 bits (IQ1_S, IQ1_M, IQ2_XXS) pueden degradar notablemente la calidad, especialmente en tareas de razonamiento y código.
- El repositorio tiene 0 descargas y 1 like en el momento de la consulta: no hay validación comunitaria ni informes independientes de calidad.
- La longitud de contexto efectiva tras la cuantización puede diferir de la del modelo original; no hay datos al respecto.
- El nombre "Qwen3.6" no corresponde a una denominación oficial verificable en la información proporcionada; conviene confirmar la procedencia exacta del modelo base antes de usarlo en producción.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/Qwen3.6-35B-A3B-Mirage-i1-GGUF
- Modelo base citado en la model card: https://huggingface.co/nightmedia/Qwen3.6-35B-A3B-Mirage
