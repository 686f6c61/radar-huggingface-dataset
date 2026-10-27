# mrysh/qwen3.5-9b-int8_w8a16

## Resumen

`mrysh/qwen3.5-9b-int8_w8a16` es una versión cuantizada a INT8 del modelo `Qwen/Qwen3.5-9B`, publicada por el usuario mrysh (no por el equipo de Qwen) con el objetivo declarado de servir como pieza de un benchmark de cuantización: 4 modelos × 8 técnicas evaluados con vLLM sobre BFCL, Energy-QA, sesgo en contratación y MedQA. El repo contiene 8.953.803.264 parámetros y ocupa 11,012 GB en disco.

La cuantización es de tipo weight-only (W8A16): pesos en int8 con una escala por canal de salida, activaciones en 16 bits, redondeo al más cercano y sin datos de calibración. Se empaqueta en el formato `pack-quantized` de compressed-tensors 0.17.0 y está pensada para cargarse directamente en vLLM sin flags adicionales. Las partes de visión y audio del modelo base se mantienen en 16 bits, aunque la evaluación publicada se hizo como modelo de texto con el modo thinking desactivado.

Su relevancia es acotada y muy específica: no es un modelo nuevo ni una mejora sobre el base, sino un artefacto reproducible para medir el impacto de una cuantización INT8 naive (sin calibración) frente a otras técnicas, manteniendo la licencia Apache 2.0 del modelo original. Para uso en producción, el punto de referencia debería ser siempre la model card de `Qwen/Qwen3.5-9B`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (tag `qwen3_5_text`); detalles de la arquitectura del base no disponibles en la informacion proporcionada |
| Parametros totales | 8.953.803.264 (~8,95 mil millones) |
| Parametros activos | No aplica (no se indica que sea MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | INT8 weight-only (W8A16): pesos int8, escala unica por canal de salida, activaciones 16 bits, round-to-nearest, sin calibracion. Vision y audio en 16 bits |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 (heredada del modelo base) |
| Formato de pesos | safetensors, esquema `pack-quantized` de compressed-tensors 0.17.0 |
| Tamano en disco | 11,012 GB |
| Modelo base | Qwen/Qwen3.5-9B |
| Fecha de publicacion | 27 de octubre de 2026 |

## Arquitectura y entrenamiento

El artefacto no introduce entrenamiento ni fine-tuning: es una transformación post-entrenamiento del checkpoint `Qwen/Qwen3.5-9B`. La técnica aplicada es cuantización INT8 de solo pesos con granularidad por canal de salida (`group size: None`, es decir, una escala por canal y no por grupo), activaciones en 16 bits, redondeo al más cercano y cero muestras de calibración. El resultado se serializa con el formato `pack-quantized` de compressed-tensors 0.17.0, compatible con la ruta de carga de vLLM. Las torres de visión y audio del modelo base se dejan intactas en 16 bits, de modo que el checkpoint conserva esas componentes sin cuantizar aunque la evaluación publicada se haya hecho en modo texto.

Al no usar calibración, la cuantización es "a ciegas" respecto a las distribuciones de activación reales: la escala por canal se deriva únicamente de los pesos. Esto abarata y simplifica la conversión, pero suele producir una degradación mayor que esquemas con calibración o con granularidad de grupo, especialmente en capas sensibles. El autor no documenta ni el número de tokens de entrenamiento del base, ni la composición del dataset, ni si hubo RLHF/DPO; toda esa información pertenece a la model card del modelo original, que aquí no se ha proporcionado. Tampoco se describen innovaciones adicionales (decodificación especulativa, atención lineal, etc.).

## Capacidades

- Generación de texto: el checkpoint se ha evaluado explícitamente como modelo de texto con vLLM y el modo thinking desactivado.
- Razonamiento y modo thinking: el modelo base expone un modo de razonamiento (la evaluación lo desactiva de forma deliberada); no se documentan resultados con thinking activado.
- Capacidades multimodal: el autor indica que las partes de visión y audio se conservan en 16 bits, lo que implica que el modelo base incluye componentes de visión y audio; el alcance exacto no está disponible en la información proporcionada.
- Tool calling / function calling: el checkpoint forma parte de un benchmark que evalúa BFCL (Berkeley Function Calling Leaderboard), lo que presupone capacidad de invocación de funciones en el modelo base; no se publican métricas.
- Capacidades multilingües: no disponible.
- Conocimiento de dominio: se evalúa sobre Energy-QA (dominio energético) y MedQA (preguntas médicas), lo que indica que el benchmark mide rendimiento en dominios especializados, no que el modelo haya sido entrenado para ellos.
- Evaluación de sesgos: incluido en un test de sesgo en contratación (hiring-bias) dentro del conjunto de evaluación del autor.

## Casos de uso

- Benchmarking de técnicas de cuantización: cargar este checkpoint en vLLM (`vllm serve mrysh/qwen3.5-9b-int8_w8a16`) y compararlo contra otras 7 técnicas sobre el mismo modelo base, usando BFCL, Energy-QA, hiring-bias y MedQA como batería. Es el uso para el que fue creado.
- Estimación de la degradación por cuantización sin calibración: al ser INT8 naive con escala por canal, sirve como cota inferior de calidad frente a esquemas con calibración o granularidad de grupo en el mismo modelo de ~9B.
- Validación de pipelines de compresión: comprobar que un flujo basado en compressed-tensors 0.17.0 produce checkpoints que vLLM carga sin flags adicionales, antes de aplicarlo a modelos propios.
- Despliegue de texto a bajo coste en investigación: con ~9 GB de pesos en int8, permite servir un modelo de 9B en una única GPU de 16 GB para experimentos internos donde la fidelidad absoluta respecto al BF16 no es crítica.
- Evaluación de robustez en dominios sensibles: usar MedQA y hiring-bias para medir si la cuantización INT8 altera respuestas en dominios con implicaciones éticas o clínicas, comparando contra el base en BF16.
- Reproducibilidad de resultados académicos: al estar publicados método, librería, tamaño y ausencia de calibración, el checkpoint permite replicar experimentos de cuantización sin rehacer la conversión.
- Base para un posterior ajuste fino ligero: partir de los pesos int8 empaquetados como referencia de tamaño, aunque para fine-tuning realista convendría usar el BF16 original.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente describe el protocolo de evaluación (vLLM, thinking off, conjunto formado por BFCL, Energy-QA, hiring-bias y MedQA, dentro de un barrido de 4 modelos × 8 técnicas), sin incluir cifras. Las búsquedas web realizadas no devolvieron resultados relevantes sobre este modelo (únicamente páginas de ayuda de YouTube TV, sin relación).

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos ocupan aproximadamente 8,95 GB (8,95e9 parámetros × 1 byte) más los tensores de visión/audio en 16 bits y el overhead del formato empaquetado, hasta los 11,012 GB del repo. Con caché KV y buffers de activación en 16 bits, un despliegue en vLLM requiere del orden de 12-16 GB de VRAM para contextos moderados; el valor exacto depende de la longitud de contexto, que no está documentada.
- GPU recomendadas: para servir con vLLM en producción, A100 40/80 GB, H100 o L40S permiten lotes grandes y contexto largo; una RTX 4090 (24 GB) es suficiente para inferencia con lote pequeño o moderado.
- Cabe en GPU de consumo: sí, previsiblemente en RTX 4090 (24 GB), RTX 4080/4070 Ti Super (16 GB) con contexto limitado y lote 1, y en GPUs de 12 GB solo con contexto muy reducido o cuantización adicional.
- Opciones de despliegue: vLLM es la vía documentada y soportada (`vllm serve <repo>`, sin flags). El formato `pack-quantized` de compressed-tensors no es directamente compatible con llama.cpp/Ollama en su forma actual, por lo que estos runners requerirían reconvertir los pesos a GGUF.
- Latencia y throughput: no disponibles. No se han publicado mediciones de tokens/s ni de latencia por petición.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| mrysh/qwen3.5-9b-int8_w8a16 | 8,95B | No disponible | INT8 W8A16, sin calibracion | Apache 2.0 | HuggingFace (0 descargas) |
| Qwen/Qwen3.5-9B (base) | 8,95B | No disponible | BF16 (referencia) | Apache 2.0 | HuggingFace (modelo original) |
| Otras variantes del barrido 4x8 del autor | No disponible | No disponible | No disponible | No disponible | No disponible en la informacion proporcionada |

No se dispone de datos de contexto, benchmarks ni licencias de terceros para establecer comparaciones cuantitativas con alternativas de otros fabricantes. La comparación relevante es contra el base en BF16: mismo número de parámetros y misma licencia, con una reducción de huella de aproximadamente el 50 % (de ~17,9 GB en BF16 a ~8,95 GB en int8) a cambio de una pérdida de fidelidad no medida públicamente.

## Limitaciones y advertencias

- No es un modelo oficial de Qwen: lo publica el usuario mrysh, sin aval del equipo responsable del modelo base. Para producción debe preferirse el checkpoint oficial.
- Cuantización sin calibración: al usar round-to-nearest con una sola escala por canal y cero muestras de calibración, es esperable una degradación mayor que en esquemas con calibración o granularidad de grupo. El autor no cuantifica esa pérdida.
- Sin métricas publicadas: no hay ningún número de MMLU, HumanEval, GSM8K, BFCL ni MedQA, pese a que el modelo se creó para un benchmark. No se puede afirmar nada sobre su calidad relativa.
- Riesgo de alucinación: inherente al modelo base y potencialmente amplificado por la cuantización; no evaluado en esta ficha.
- Idiomas y contexto: no documentados. Se desconoce si la cuantización afecta de forma desigual a idiomas distintos del inglés.
- Estado del modo thinking: la evaluación se hizo con thinking desactivado; no hay datos sobre el comportamiento con razonamiento extendido activado.
- Componentes multimodales sin evaluar: visión y audio se mantienen en 16 bits, pero no se han publicado pruebas de esas rutas en este checkpoint.
- Madurez: 0 descargas y 0 likes en el momento de la consulta, publicación de octubre de 2026 y sin actualizaciones posteriores. No hay evidencia de uso en producción.
- Licencia: Apache 2.0 permite uso comercial, pero las condiciones y atribuciones deben verificarse en la model card del modelo base `Qwen/Qwen3.5-9B`, a la que el autor remite explícitamente.
- Compatibilidad limitada de runners: el formato empaquetado de compressed-tensors está orientado a vLLM; otros motores requerirían conversión previa.

## Enlaces

- HuggingFace (este checkpoint): https://huggingface.co/mrysh/qwen3.5-9b-int8_w8a16
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Librería compressed-tensors (referenciada por el autor, versión 0.17.0): no se ha encontrado enlace en la información proporcionada
- Paper, blog o repositorio del benchmark de cuantización del autor: no disponible
- Demos: no disponible
