# nurmix/fjord-E4B-it-GGUF

## Resumen

fjord E4B-it GGUF es un conjunto de cuantizaciones en formato GGUF del modelo multimodal `google/gemma-4-E4B-it`, publicadas por el usuario nurmix. No se trata de un ajuste fino: los pesos son los originales de Google, únicamente comprimidos mediante cuantización con una matriz de importancia (imatrix) calibrada principalmente sobre texto noruego, en bokmål y nynorsk. El objetivo declarado es minimizar la pérdida de calidad en noruego al reducir el modelo para ejecutarlo localmente.

El modelo base es un transformer multimodal de la familia Gemma 4 con aproximadamente 7.500 millones de parámetros totales y unos 4.000 millones efectivos, gracias al esquema de Per-Layer Embeddings que comparte parámetros entre capas. Acepta entradas de texto, imagen y audio, y produce salida de texto, con una ventana de contexto de 131.072 tokens. Incorpora soporte de tool calling y de modo thinking conmutables.

La relevancia de esta publicación es práctica: ofrece cuantizaciones listas para llama.cpp y Ollama con un proyector multimodal incluido (mmproj), lo que permite desplegar un modelo de 128k de contexto con capacidades de visión y audio en hardware de consumo. La calibración específica para noruego es un diferenciador poco habitual en el ecosistema GGUF, orientado a desarrolladores nórdicos que necesitan preservar calidad lingüística en entornos con memoria limitada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (familia Gemma 4, Per-Layer Embeddings) |
| Parametros totales | 7.518.069.290 (~7,5B) |
| Parametros activos | ~4B efectivos (no es MoE; parámetros compartidos por Per-Layer Embeddings) |
| Longitud de contexto | 131.072 tokens (128k) |
| Tipos de cuantizacion | Q8_0, Q6_K, Q5_K_M, Q4_K_M, Q3_K_M; mmproj en F16 |
| Idiomas soportados | nb (bokmål), nn (nynorsk), no, en |
| Licencia | Apache 2.0 (con license_link a la licencia de Gemma 4 de Google) |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

El modelo base es un transformer de la familia Gemma 4 con un diseño de Per-Layer Embeddings que reduce los parámetros efectivos a unos 4B frente a los 7,5B totales. Es multimodal nativo: procesa texto, imagen y audio mediante un proyector multimodal separado, distribuido aquí como `mmproj-fjord-e4b-F16.gguf` de 1,0 GB. La ventana de contexto alcanza los 131.072 tokens y el modelo soporta tool calling y modo thinking conmutables, con plantillas de chat y parsers detectados automáticamente por Ollama para la arquitectura `gemma4`.

Esta publicación no incluye entrenamiento adicional: es una cuantización del checkpoint `google/gemma-4-E4B-it` en el commit `4ecc2ba` (3 de noviembre de 2026, que corrige 219 tokens problemáticos del tokenizador). El proceso se realizó con `convert_hf_to_gguf.py` de llama.cpp (commit `fc504f9`, transformers 5.23), seguido de la generación de la imatrix con `llama-imatrix -c 512 -ngl 99` sobre el GGUF en BF16 en Metal, y la cuantización final con `llama-quantize --imatrix`. La calibración emplea unos 820.000 caracteres (~248.000 tokens) en 484 fragmentos de 512 tokens: 56 % bokmål (140 artículos de Wikipedia `20231101.no`), 22 % nynorsk (40 artículos de `20231101.nn`), 15 % inglés (30 artículos) y 7 % código Python de llama.cpp, con semilla fija 42 y artículos de al menos 1.500 caracteres recortados a 12.000. La imatrix solo almacena estadísticas de activación; el texto de calibración no forma parte del modelo. Q8_0 no usa imatrix porque a 8 bits el error de redondeo ya es despreciable.

## Capacidades

- Generación de texto conversacional en bokmål, nynorsk, noruego genérico e inglés.
- Comprensión de imágenes como entrada, mediante el proyector mmproj incluido.
- Comprensión de audio como entrada, también a través del mmproj.
- Tool calling / function calling, con parser compatible con Ollama y llama.cpp.
- Modo thinking conmutable (activado o desactivado).
- Razonamiento multi-turno con ventana de 131.072 tokens.
- Generación de código, incluyendo tareas simples de agente, según las pruebas de sanidad del autor.
- Salida exclusivamente de texto (no genera imagen ni audio).

## Casos de uso

- Atención al cliente en noruego: el modelo puede mantener conversaciones multi-turno con hasta 128k tokens de contexto, lo que permite adjuntar historiales largos o documentación de producto sin truncar, y responder tanto en bokmål como en nynorsk.
- Procesamiento de documentos escaneados: combinando la entrada de imagen con la ventana de 128k, se pueden enviar páginas de facturas o formularios y extraer campos estructurados mediante tool calling.
- Asistentes de voz locales: la entrada de audio permite transcribir y razonar sobre grabaciones en una sola pasada, útil para actas de reuniones o atención telefónica en noruego.
- Agentes de automatización con herramientas: el soporte de function calling y el modo thinking permiten encadenar pasos (consultar API, calcular, redactar) en pipelines de automatización de back-office.
- Desarrollo asistido en entornos con GPU de consumo: la cuantización Q6_K (6,2 GB) está recomendada por el autor para código y agentes, y cabe en tarjetas de 8-12 GB de VRAM.
- Despliegue en portátiles y estaciones de trabajo sin GPU dedicada: las cuantizaciones Q4_K_M (5,3 GB) y Q3_K_M (4,9 GB) permiten ejecución en CPU o en GPUs integradas, con velocidades del orden de 30-37 tok/s medidas en un Apple M1 Pro de 32 GB.
- Investigación lingüística nórdica: la imatrix calibrada en bokmål y nynorsk facilita comparar la degradación por cuantización en tareas noruegas frente a cuantizaciones estándar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explícitamente que no se han medido perplejidad ni puntuaciones de tareas frente a cuantizaciones sin imatrix u otras alternativas. Las únicas mediciones son pruebas de sanidad locales en un Apple M1 Pro (32 GB, Ollama):

| Prueba | Q8_0 | Q4_K_M |
|---|---|---|
| Respuesta en noruego (bokmål) | correcta | no medida |
| Tool call desde una historia de usuario en noruego | correcta | correcta |
| Velocidad de generación | ~30 tok/s | ~37 tok/s |

## Requisitos de hardware

- VRAM estimada según cuantización: Q8_0 ~8,0 GB; Q6_K ~6,2 GB; Q5_K_M ~5,8 GB; Q4_K_M ~5,3 GB; Q3_K_M ~4,9 GB; más 1,0 GB adicionales del mmproj si se usan imagen o audio.
- GPU recomendadas: A100 o H100 para despliegues de producción con contexto completo de 128k; RTX 4090 (24 GB) para Q8_0 con contexto largo; RTX 3090/4080 (16-24 GB) para Q6_K y Q5_K_M.
- Cabe en GPU de consumo: sí. Q6_K y Q4_K_M caben en tarjetas de 8-12 GB (RTX 3060 12 GB, RTX 4060 Ti 16 GB); Q3_K_M puede ejecutarse en 6-8 GB o en CPU.
- Opciones de despliegue: Ollama (`ollama run hf.co/nurmix/fjord-E4B-it-GGUF:Q4_K_M`), llama.cpp (`llama-cli` con `--mmproj` y `-ngl 99 -c 32768`), y cualquier runtime compatible con GGUF de llama.cpp. El repositorio incluye un `Modelfile` listo para Ollama con Q6_K y mmproj.
- Latencia y throughput: ~30 tok/s con Q8_0 y ~37 tok/s con Q4_K_M en Apple M1 Pro (32 GB, Metal). No hay datos publicados para GPU dedicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Multimodal | Licencia | Formato |
|---|---|---|---|---|---|
| fjord E4B-it GGUF (esta ficha) | ~7,5B totales / ~4B efectivos | 131.072 | Texto, imagen, audio | Apache 2.0 | GGUF |
| google/gemma-4-E4B-it (base) | ~7,5B totales / ~4B efectivos | 131.072 | Texto, imagen, audio | Apache 2.0 (licencia Gemma 4) | Safetensors |
| Cuantizaciones GGUF estándar de gemma-4-E4B-it | ~7,5B totales / ~4B efectivos | 131.072 | Texto, imagen, audio | Apache 2.0 | GGUF |

La diferencia frente al modelo base y frente a cuantizaciones GGUF sin imatrix noruega es exclusivamente la calibración de la matriz de importancia; no hay diferencias en parámetros, contexto ni capacidades. No se dispone de datos de rendimiento comparativo publicados.

## Limitaciones y advertencias

- No es un ajuste fino: el conocimiento del noruego es idéntico al del modelo base de Google; la imatrix solo reduce la degradación durante la cuantización.
- Modelo pequeño: el autor lo describe como adecuado para chat, código corto y tareas de agente simples, no para razonamiento complejo.
- La imatrix no se ha validado con benchmarks; el efecto esperado es mayor en Q4_K_M y Q3_K_M y pequeño en Q6_K y Q5_K_M, pero no está cuantificado.
- Riesgo de alucinación inherente a un modelo de ~4B efectivos, especialmente en tareas de conocimiento factual y contextos largos.
- La cobertura lingüística declarada se limita a nb, nn, no y en; el rendimiento en otros idiomas no está documentado y puede degradarse.
- La licencia Apache 2.0 del repositorio remite a la licencia de Gemma 4 de Google; conviene revisar los términos de uso comercial de dicha licencia antes de desplegar en producción.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validación de la comunidad ni informes independientes de calidad.
- Las velocidades reportadas (~30-37 tok/s) corresponden a un Apple M1 Pro y no son extrapolables a otros hardware.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/nurmix/fjord-E4B-it-GGUF
- Modelo base: https://huggingface.co/google/gemma-4-E4B-it
- Licencia Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
- Dataset de calibración (Wikipedia): https://huggingface.co/datasets/wikimedia/wikipedia
- llama.cpp: no disponible en la información proporcionada
- Ollama: no disponible en la información proporcionada
