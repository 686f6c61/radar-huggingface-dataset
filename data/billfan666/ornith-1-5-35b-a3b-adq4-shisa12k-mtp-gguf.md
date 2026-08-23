# BillFan666/Ornith-1.5-35B-A3B-ADQ4-Shisa12K-MTP-GGUF

## Resumen

Ornith-1.5-35B-A3B-ADQ4-Shisa12K-MTP-GGUF es un modelo de lenguaje derivado, no oficial, que combina dos componentes: el modelo principal Ornith-1.5-35B-A3B (desarrollado por Ornith AI) en una cuantización mixta AD-Q4_K/IQ4_XS creada por AtomicChat, y una cabeza de decodificación especulativa MTP (Multi-Token Prediction) de 12K pasos de destilación KL, desarrollada por Shisa AI. El resultado es un archivo GGUF de un solo fichero de 19,19 GiB que permite ejecutar el modelo con contexto completo de 262.144 tokens en GPUs de consumo con 16 GB de VRAM, como la NVIDIA RTX 5060 Ti.

El modelo base Ornith-1.5-35B-A3B es una arquitectura MoE de aproximadamente 35B parámetros totales con unos 3B activos por token, entrenado bajo el paradigma de auto-mejora (self-scaffolding y self-improvement) introducido por Ornith AI. La incorporación de la cabeza MTP de Shisa permite decodificación especulativa en llama.cpp, mejorando la velocidad de generación sin sacrificar la calidad del texto, siempre que se utilice una versión de llama.cpp con el parche incluido (d2t mapping).

Este derivado destaca por su enfoque práctico: un único archivo GGUF, con todos los tensores del modelo principal copiados byte a byte sin requantización, y la cabeza MTP cuantizada a Q4_0, orientado a despliegue local en hardware de gama media. Está pensado para desarrolladores que necesitan una solución de inferencia local con contexto largo y generación acelerada por speculative decoding, con soporte para inglés, chino, japonés y coreano.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | qwen35moe (mixture-of-experts) con 40 capas objetivo + 1 capa MTP (NextN) |
| Parametros totales | Aproximadamente 35,84B (35B del modelo base + 0,84B de la cabeza MTP) |
| Parametros activos | Aproximadamente 3B (solo el modelo base; la cabeza MTP se usa solo como draft) |
| Longitud de contexto | 262.144 tokens (asignación completa) |
| Tipos de cuantizacion | Q4_0 (cabeza MTP), AD-Q4_K-IQ4_XS (tensores del modelo principal, sin requantizar) |
| Idiomas soportados | en, zh, ja, ko |
| Licencia | MIT (modelo base) + Apache-2.0 (cabeza MTP) – combinación «mit-target-plus-apache-2.0-mtp» |
| Formato de pesos | GGUF (un solo archivo, 20.602.882.240 bytes / 19,19 GiB) |

## Arquitectura y entrenamiento

El modelo base Ornith-1.5-35B-A3B emplea una arquitectura de mezcla de expertos (MoE) con activación de aproximadamente 3B parámetros por token, dentro de un total de ~35B. La información publicada indica que el entrenamiento se basó en el marco de «self-scaffolding» y «self-improvement»: el modelo propone nuevas tareas, genera andamiajes específicos y produce rollouts de soluciones para aprendizaje por refuerzo, ampliando así su propio conjunto de datos de entrenamiento de forma continua. No se detallan cifras exactas de tokens de entrenamiento ni composición del dataset.

La cabeza MTP (NextN) de Shisa AI se inicializó a partir de la cabeza MTP compatible del modelo Qwen3.6-35B-A3B y se entrenó mediante destilación KL (KL-distillation) contra los estados ocultos de Ornith-1.5, durante 12.000 pasos en dos épocas, con un enfoque intensivo en código. Esta cabeza utiliza un vocabulario de borrador reducido y un mapeo d2t (draft-to-target) para devolver los tokens al vocabulario completo de 248.320 tokens del modelo principal. En este derivado, la cabeza se convirtió a GGUF BF16, se cuantizó a Q4_0 y se añadió al modelo objetivo, manteniendo 753 descriptores de tensores totales (733 del objetivo + 20 de la cabeza) y 41 bloques GGUF tras el injerto.

## Capacidades

- Generación de texto y razonamiento de propósito general, con soporte de contexto largo de hasta 262.144 tokens.
- Generación de código, reforzada por el entrenamiento de la cabeza MTP orientado a código.
- Capacidades multilingües: inglés, chino, japonés y coreano.
- Decodificación especulativa mediante MTP (draft-mtp) en llama.cpp, con un máximo de 1 token draft (MTP1) según las pruebas del autor.
- Sin soporte multimodal: solo texto.
- No se menciona soporte explícito de tool calling o function calling en la información disponible.

## Casos de uso

- Asistencia y atención al cliente en producción: con 262K tokens de contexto y soporte multilingüe (en, zh, ja, ko), puede mantener conversaciones multi-turno largas sobre historiales completos de interacción, reduciendo la necesidad de resúmenes intermedios.
- Generación de código en entornos locales: la cabeza MTP entrenada en código acelera la autocompletación y la generación de bloques de código, pudiendo integrarse en IDEs o pipelines de CI/CD locales sin depender de la nube.
- Análisis de documentos extensos: procesamiento de contratos, informes o libros completos dentro de la ventana de contexto, con búsqueda de información puntual y resumen.
- Traducción automática y localización: gracias a su soporte de cuatro idiomas, puede traducir textos técnicos y comerciales de forma consistente, manteniendo el contexto en documentos largos.
- RAG con contexto amplio: indexación de bases de conocimiento y recuperación con contexto completo, para sistemas de pregunta-respuesta sobre documentación corporativa sin truncar.
- Prototipado de agentes de razonamiento multi-paso: aunque no se documenta tool calling, el modelo base puede encadenar pasos de razonamiento y generar planes de acción, útil para experimentos de agencia en entornos controlados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks (MMLU, HumanEval, GSM8K, etc.) en la información disponible para este derivado GGUF. Los datos aportados se limitan a medidas de rendimiento de hardware y memoria, no de calidad de respuesta. Tampoco se dispone de comparativas con otros modelos en la documentación.

## Requisitos de hardware

- VRAM estimada para inferencia: el autor probó el modelo en una NVIDIA RTX 5060 Ti 16 GB. La VRAM en reposo con contexto corto fue de aproximadamente 14.680 MiB, quedando dentro de los 16 GB disponibles.
- Distribución de memoria: con `--fit-target 1024`, se descargaron 42/42 unidades lógicas a CUDA, pero solo ~19 unidades fueron completamente residentes en GPU; 23 unidades contenían overflow de pesos de expertos a RAM del host. La memoria de KV cache (Q8) del objetivo ocupó 2.720 MiB, la KV cache del draft MTP 272 MiB, y la memoria de estado recurrente 125,62 MiB.
- GPU recomendadas: RTX 5060 Ti 16 GB (verificada), también viable en otras GPUs con 16 GB o más (RTX 4080, RTX 4090, A100 40/80 GB). En GPUs con menos VRAM se puede reducir el contexto o usar `--fit` con más descarga a RAM.
- Despliegue: llama.cpp con el parche incluido (revisión `4df29be4f4c3673f428170fda944a5b19f743bb8` o versiones posteriores que soporten `d2t`). Se recomienda `llama-server` o `llama-cli` con compilación CUDA. También puede usarse Ollama o vLLM si se adapta el formato, aunque no se ha documentado.
- Latencia y throughput: no se aportan cifras de tokens por segundo en la documentación. La configuración óptima del autor usa `--spec-type draft-mtp`, `--spec-draft-n-max 1`, `--draft-p-min 0`, y `--draft-p-split 0.10` para maximizar la velocidad en MTP1.

## Comparativa con modelos similares

| Modelo | Params | Activos | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Ornith-1.5-35B-A3B (bf16) | ~35B | ~3B | 256K | BF16 | MIT | HuggingFace |
| AtomicChat/Ornith-1.5-35B-A3B-GGUF | ~35B | ~3B | 262K | AD-Q4_K-IQ4_XS | MIT | GGUF |
| Este modelo (ADQ4+Shisa12K MTP) | ~35,84B | ~3B | 262K | AD-Q4_K-IQ4_XS + Q4_0 MTP | MIT + Apache-2.0 | GGUF |
| Qwen3.6-35B-A3B | ~35B | ~3B | 256K | BF16 (referencia) | Apache-2.0 | Safetensors |

La principal diferencia frente al modelo base es la adición de la cabeza MTP de Shisa, que permite decodificación especulativa en llama.cpp. Frente al AtomicChat sin MTP, este derivado añade la capa de draft y el mapeo d2t, mejorando la velocidad de generación a costa de un ligero aumento de tamaño (0,84B parámetros) y de la complejidad de configuración. Qwen3.6-35B-A3B es la fuente del MTP head original, pero el modelo final no es comparable en rendimiento al no disponerse de datos de evaluación.

## Limitaciones y advertencias

- Derivado comunitario, no oficial: no es una versión oficial de Ornith, AtomicChat ni Shisa. No hay garantías de soporte ni de calidad de evaluación.
- Requiere un parche específico de llama.cpp (para el mapeo d2t y la cabeza MTP con vocabulario reducido). Sin el parche, el modelo no funcionará correctamente. Hay que verificar que la revisión de llama.cpp reconoce `d2t` y devuelve logits válidos de vocabulario completo.
- Licencia combinada: la licencia es MIT para el modelo base y Apache-2.0 para la cabeza MTP, lo que implica que el archivo GGUF final está sujeto a ambas. La licencia declarada como «mit-target-plus-apache-2.0-mtp» no es una licencia estándar y puede requerir revisión legal para uso comercial.
- Riesgo de alucinación y sesgos: no se han publicado estudios de sesgos o de alucinación para este modelo derivado. Se recomienda evaluar en el dominio de aplicación antes de producción.
- Limitaciones de contexto: aunque se asigna 262K tokens, la calidad en contextos muy largos puede degradarse. El autor recomienda KV cache en q8_0 para mantener calidad, pero no hay datos objetivos de degradación.
- Hardware exigente: aunque cabe en 16 GB, la memoria se reparte entre GPU y RAM del host en los expertos, lo que puede afectar a la latencia si se superan los límites de VRAM.
- Sin soporte multimodal ni tool calling: el modelo es solo texto; no admite entrada de imágenes ni funciones de herramienta explícitas.

## Enlaces

- Modelo GGUF en HuggingFace: [BillFan666/Ornith-1.5-35B-A3B-ADQ4-Shisa12K-MTP-GGUF](https://huggingface.co/BillFan666/Ornith-1.5-35B-A3B-ADQ4-Shisa12K-MTP-GGUF)
- Modelo base original: [ornith-ai/Ornith-1.5-35B-A3B](https://huggingface.co/ornith-ai/Ornith-1.5-35B-A3B)
- Modelo GGUF de AtomicChat (target): [AtomicChat/Ornith-1.5-35B-A3B-GGUF](https://huggingface.co/AtomicChat/Ornith-1.5-35B-A3B-GGUF)
- Cabeza MTP de Shisa: [shisa-ai/Ornith-1.5-35B-A3B-MTP-ONLY](https://huggingface.co/shisa-ai/Ornith-1.5-35B-A3B-MTP-ONLY)
- Referencia de Qwen3.6-35B-A3B (origen del MTP head): [https://huggingface.co/Qwen/Qwen3.6-35B-A3B](https://huggingface.co/Qwen/Qwen3.6-35B-A3B)
- Página de Ornith AI sobre Ornith-1.5: [https://ornith.ai/ornith_1_5.html](https://ornith.ai/ornith_1_5.html)
- Sitio oficial de Ornith AI: [https://ornith.ai/](https://ornith.ai/)
