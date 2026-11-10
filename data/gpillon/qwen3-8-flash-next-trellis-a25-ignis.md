# gpillon/Qwen3.8-Flash-Next-trellis-a25-ignis

## Resumen

Qwen3.8-Flash-Next-trellis-a25-ignis es una conversión cuantizada del modelo multimodal Qwen3.8-Flash-Next de Qwen (Alibaba) realizada por el desarrollador independiente gpillon para ignis, un servidor de inferencia diseñado específicamente para ejecutarse en una única GPU NVIDIA RTX 5090 (arquitectura Blackwell). El modelo original es un mixto de expertos (MoE) de 125B parámetros totales con 6B activos, y esta conversión comprime los expertos enrutados a una media de 2,5 bits por peso mediante codificación trellis, lo que permite servir el modelo completo desde una tarjeta de 32 GB más memoria del sistema.

La relevancia de esta ficha radica en que permite ejecutar un MoE de 125B en hardware de consumo, algo impensable con checkpoints BF16 o incluso FP8 convencionales. El repositorio ocupa 73,1 GB e incluye el modelo principal, una cabeza de predicción multi-token (MTP) para decodificación especulativa y un codificador de visión para entrada de imágenes. Los pesos están en contenedores propietarios `.ninfer` v2 que solo ignis puede leer, no son safetensors, GGUF ni EXL3.

La licencia es la Qwen Community License 1.0, heredada del modelo base, con las restricciones comerciales que ello implica. El modelo está pensado para conversación, generación de texto, código y matemáticas, con soporte de visión opcional y decodificación especulativa mediante la cabeza MTP.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer MoE con atención híbrida (Gated DeltaNet, QSA indexer, hyper-connections) y torre de visión |
| Parámetros totales | 125B (modelo base Qwen3.8-Flash-Next) |
| Parámetros activos | 6B |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Expertos enrutados: trellis `mul1` con K ∈ {2, 2.5, 3, 4} bits (media 2,50); proyecciones de atención, shared expert, embeddings y head en FP8 E4M3; router y normas en BF16; tabla de embeddings n-gram en Q4; torre de visión en Q4/Q5/Q6/W8 |
| Idiomas soportados | no disponible (la model card incluye evaluaciones en en, it, de, ja) |
| Licencia | Qwen Community License 1.0 (license: other) |
| Formato de pesos | `.ninfer` v2 (contenedor propietario de ignis; no es safetensors, GGUF ni EXL3) |

## Arquitectura y entrenamiento

El modelo base es un MoE de 125B parámetros con 6B activos, organizado en 48 capas con 512 expertos enrutados por capa. La arquitectura incorpora mecanismos poco habituales: proyecciones Gated DeltaNet, un indexador QSA, hyper-connections y una tabla de embeddings n-gram de 320.001.536 filas (28,8 GB en Q4, con lectura bajo demanda desde NVMe para las filas no residentes en RAM). El modelo es multimodal: incluye una torre de visión de 27 bloques con patch embedding y merger que proyecta los parches de imagen al espacio del modelo de lenguaje.

La conversión realizada por gpillon no reentrena el modelo, sino que cuantiza los pesos del checkpoint BF16 original (revisión `de4b8e4d43b917e7706784d8bb445c9af86a3540`). Los expertos enrutados se almacenan con codificación trellis de la familia EXL3/QTIP, con anchura de bits asignada por experto según la distorsión de calibración (22.572 expertos a K=2, 11.511 a K=2.5, 12.572 a K=3 y 2.497 a K=4). El resto de pesos no-expertos se guardan en FP8 E4M3 por fila con escalas BF16. El conversor midió los pesos FP8 no-expertos solos (con expertos en BF16) en un 74,7% en el proxy MMLU-Pro, frente al 73,7% del BF16 completo (McNemar p = 0,61), concluyendo que la pérdida medible se concentra en los expertos.

La innovación técnica principal es la compresión extrema de los expertos (2,5 bits de media) manteniendo el resto de componentes en FP8/BF16, lo que reduce el peso del modelo a 66,83 GiB. Se incluye además una cabeza MTP de 0,97 GiB para decodificación especulativa (`--spec mtp`) y un codificador de visión de 0,26 GiB que se carga solo con visión activada.

## Capacidades

- Generación de texto conversacional multi-turno.
- Razonamiento y matemáticas (evaluado con perplexity 1,53 en dominio math, prácticamente idéntica al BF16).
- Generación de código (perplexity 3,48 en code y 1,21 en Python, con 98,1% de acuerdo top-1 en py).
- Procesamiento de imágenes mediante la torre de visión opcional (requiere soporte de visión en ignis, GitHub #555).
- Decodificación especulativa con cabeza MTP para acelerar la generación.
- Capacidades multilingües parcialmente evaluadas (inglés, italiano, alemán, japonés).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Modo thinking explícito: no disponible en la información proporcionada.

## Casos de uso

- Asistente conversacional local con contexto largo: el modelo puede mantener conversaciones multi-turno en una RTX 5090, aprovechando la ventana de contexto del modelo base y la cabeza MTP para reducir latencia en respuestas largas.
- Generación de código en estación de trabajo: con perplexity de 1,21 en Python y 98,1% de acuerdo top-1 frente al BF16, es adecuado para autocompletado y generación de código en entornos de desarrollo locales sin conexión a la nube.
- Razonamiento matemático asistido: la baja degradación en dominio math (KLD 0,047, perplexity idéntica al BF16) lo hace útil para resolución de problemas paso a paso y verificación de cálculos.
- Análisis de documentos con imágenes: activando el codificador de visión, puede procesar capturas, diagramas o documentos escaneados junto con texto para extracción de información y resumen.
- Prototipado de agentes conversacionales: al ejecutarse tras una API compatible con OpenAI que ofrece ignis, se puede integrar en pipelines de agentes para pruebas locales antes de desplegar en infraestructura mayor.
- Investigación sobre cuantización extrema: sirve como caso de estudio reproducible de cómo la codificación trellis por experto afecta a la calidad por dominio (chat, código, prosa, matemáticas, multilingüe), con métricas KLD y acuerdo top-1 publicadas.
- Servicio de inferencia personal con privacidad: al correr íntegramente en hardware local, permite procesar datos sensibles sin enviarlos a servicios externos.

## Benchmarks y rendimiento

El conversor publicó métricas de fidelidad frente al checkpoint BF16, con teacher forcing sobre ventanas de 2.048 tokens:

| Dominio | KLD (nats) | Acuerdo top-1 | Perplexity (cuantizado) | Perplexity (BF16) |
|---|---:|---:|---:|---:|
| chat | 0,052 | 94,0% | 1,80 | 1,80 |
| code | 0,116 | 89,0% | 3,48 | 3,44 |
| prose | 0,164 | 81,9% | 9,31 | 9,23 |
| py | 0,027 | 98,1% | 1,21 | 1,20 |
| math | 0,047 | 95,8% | 1,53 | 1,53 |
| en | 0,106 | 88,0% | 4,55 | 4,41 |
| it | 0,050 | 91,3% | 4,78 | 4,73 |
| de | 0,151 | 86,1% | 3,93 | 3,74 |
| ja | 0,134 | 84,2% | 7,85 | no disponible |

El proxy MMLU-Pro con pesos FP8 no-expertos (expertos en BF16) alcanzó 74,7% frente a 73,7% del BF16 (McNemar p = 0,61). No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada: 32 GB (RTX 5090) para el modelo principal de 66,83 GiB, con el resto de pesos y la tabla n-gram en RAM del sistema y lectura bajo demanda desde NVMe.
- GPU recomendada: NVIDIA RTX 5090 (Blackwell). El servidor ignis está diseñado para una única tarjeta RTX.
- Cabe en GPU de consumo: sí, específicamente en RTX 5090 de 32 GB. No se indica compatibilidad con otras GPU de consumo.
- Opciones de despliegue: exclusivamente ignis (servidor de inferencia con API compatible con OpenAI y Playground). No es compatible con vLLM, llama.cpp, Ollama, TGI ni NInfer.
- Latencia y throughput: no disponibles en la información proporcionada. La cabeza MTP permite decodificación especulativa para reducir latencia, pero no se publican cifras.

## Comparativa con modelos similares

| Modelo | Parámetros | Bits expertos | Tamaño | KLD medio | Acuerdo top-1 | Licencia | Formato |
|---|---|---:|---:|---:|---:|---|---|
| Este modelo (a25) | 125B (6B activos) | 2,50 | 71,8 GB | 0,1053 | 89,68% | Qwen Community 1.0 | `.ninfer` v2 |
| that80-20/Qwen3.8-Flash-Next-trellis-a35-ignis | 125B (6B activos) | 3,50 | 86,9 GB | 0,0748 | 91,62% | Qwen Community 1.0 | `.ninfer` v2 |
| Qwen/Qwen3.8-Flash-Next (BF16) | 125B (6B activos) | 16 | no disponible | referencia | referencia | Qwen Community 1.0 | safetensors |

La variante a35 del mismo conversor ofrece mayor fidelidad (KLD 0,0748 frente a 0,1053; acuerdo 91,62% frente a 89,68%) a cambio de 15 GB adicionales de almacenamiento. El checkpoint BF16 original es la referencia de calidad pero no cabe en una RTX 5090.

## Limitaciones y advertencias

- La cuantización a 2,5 bits introduce degradación medible: KLD de 0,164 en prosa y 0,151 en alemán, con acuerdo top-1 del 81,9% y 86,1% respectivamente. Los dominios de código y matemáticas se conservan mucho mejor.
- El formato `.ninfer` v2 es propietario y solo lo lee ignis; no es portable a otros motores de inferencia ni a Transformers.
- La tabla de embeddings n-gram (28,8 GB) requiere lectura desde NVMe para las filas no residentes en RAM, lo que puede introducir latencia dependiente del almacenamiento.
- El soporte de visión requiere una versión de ignis con soporte específico (GitHub #555); sin ella, las entradas de imagen devuelven error 400.
- La licencia Qwen Community License 1.0 impone restricciones de uso comercial que deben revisarse antes de desplegar en producción.
- Riesgo de alucinación inherente al modelo base; la cuantización puede amplificarlo en dominios de prosa y lenguas no inglesas.
- Idiomas soportados no documentados oficialmente; las evaluaciones cubren en, it, de y ja, pero no hay lista completa.
- No hay datos publicados de benchmarks estándar (MMLU, HumanEval, GSM8K) ni de latencia/throughput.
- El repositorio tiene 0 descargas y 2 likes en el momento de la consulta, lo que indica validación comunitaria muy limitada.

## Enlaces

- Hugging Face: https://huggingface.co/gpillon/Qwen3.8-Flash-Next-trellis-a25-ignis
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Repositorio ignis: https://github.com/gpillon/ignis
- Guía para agentes de ignis: https://raw.githubusercontent.com/gpillon/ignis/main/docs/user/paths/agent.md
- Documentación completa en Markdown: https://gpillon.github.io/ignis/llms.txt
- Issue de soporte de visión: https://github.com/gpillon/ignis/issues/555
- Variante a35 (3,5 bits): https://huggingface.co/that80-20/Qwen3.8-Flash-Next-trellis-a35-ignis
