# fraQtl/Qwen3.8-27B-Hi-Fi-GGUF

## Resumen

Qwen3.8-27B Hi-Fi GGUF es una cuantización de tipo Q4_K_M del modelo base Qwen/Qwen3.8-27B, publicada por el usuario fraQtl bajo licencia Apache-2.0. No se trata de un modelo entrenado desde cero, sino de un artefacto de inferencia en formato GGUF pensado para ejecutar el modelo original de 27.320.697.856 parámetros en hardware con recursos limitados. Su rasgo diferencial frente a otras cuantizaciones comunitarias es el uso de un método propio de cuantización consciente de calibración (calibration-aware per-tensor quantization) con una importance matrix derivada de un selector interno, lo que según el autor reduce la divergencia respecto al profesor Q8_0.

El modelo base pertenece a la familia Qwen3.8 y emplea una arquitectura híbrida con bloques GDN (Gated DeltaNet), tal como se deduce de la puerta de corrección de conversión mencionada en la model card. El contexto nativo declarado es de 262K tokens, aunque el artefacto se distribuye como un único fichero de 16,46 GB que corresponde a un nivel de calidad de 4 bits y no incluye la torre de visión: es un GGUF estrictamente de texto.

La relevancia de esta ficha radica en que documenta una alternativa de despliegue local para un modelo de casi 27B de parámetros con licencia permisiva, acompañada de un conjunto inusualmente detallado de recibos de evaluación (KLD, GSM8K, MATH-500, needle-in-a-haystack) que permiten comparar la fidelidad de la cuantización con las construcciones canónicas de unsloth y ggml-org. Aun así, el número de descargas (123) y de likes (2) indica una adopción todavía muy reducida.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido con bloques GDN (Gated DeltaNet) y bloque NextN; deducido de la puerta de conversión de la model card |
| Parametros totales | 27.320.697.856 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 262K tokens nativos (según la model card) |
| Tipos de cuantizacion | Q4_K_M (artefacto publicado); true bpw 4.8210 |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (fichero único `Qwen3.8-27B-fraQtl-HiFi-Q4_K_M.gguf`, 16.464.274.816 bytes, 866 tensores) |

## Arquitectura y entrenamiento

El artefacto no entrena ningún modelo: es una cuantización del checkpoint `Qwen/Qwen3.8-27B` en la revisión `1d4bf0f2ff6012fd82039f2fa52739d0dd7c60c0`. La arquitectura subyacente es un transformer híbrido, identificado en la model card como «hybrid GDN arch», con un bloque NextN presente en el conjunto de tensores (866 tensores, coincidentes con el conjunto canónico de unsloth). El contexto nativo es de 262K tokens. No se proporcionan datos sobre el número de tokens de entrenamiento, la composición del corpus ni si hubo RLHF o DPO en el modelo base.

La innovación técnica del artefacto es el procedimiento de cuantización: cuantización por tensor consciente de calibración, con una importance matrix generada mediante `llama-imatrix` a contexto 8192 a partir del ganador de un selector interno denominado `mix_cm70_gen30`. El fichero `imatrix.dat` se incluye en el repositorio para reproducibilidad. La cadena de herramientas está fijada a un único commit de llama.cpp (`4df29be4f4c3673f428170fda944a5b19f743bb8`) para conversión, cuantización y todas las evaluaciones. Se aplicó una puerta de corrección de conversión (bf16-GGUF frente a referencia HF) con top-1 de 0,983 y KLD de 2,4e-4, marcada como PASS. La torre de visión no se convierte.

## Capacidades

- Generación de texto conversacional y con instrucciones (pipeline `text-generation`, tag `conversational`).
- Razonamiento matemático con cadena de pensamiento: evaluado en GSM8K y MATH-500 en modo instructed-CoT 0-shot.
- Recuperación en contexto largo: validado con needle-in-a-haystack hasta 131K tokens.
- Compatibilidad con endpoints (tag `endpoints_compatible`), lo que sugiere uso tras APIs compatibles con el formato de Hugging Face.
- Capacidades multimodales: no disponibles en este artefacto (la torre de visión no se convierte; es un GGUF solo de texto).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible; el autor no declara lista de idiomas.

## Casos de uso

- Despliegue local de un modelo de 27B en una única GPU de 24 GB: con 16,46 GB de pesos en Q4_K_M y una ventana de contexto moderada, el modelo cabe en tarjetas como la RTX 4090 o la RTX 3090, permitiendo asistentes de texto sin conexión a servicios externos.
- Razonamiento matemático asistido: los resultados declarados (95,0% en GSM8K, 87,6% en MATH-500 con CoT 0-shot) lo hacen adecuado para tutoría de problemas aritméticos y de competición, siempre con verificación humana dada la incertidumbre estadística de las muestras.
- Procesamiento de documentos largos: con 262K tokens de contexto nativo y recuperación validada en NIAH hasta 131K, sirve para resumir contratos, informes o expedientes completos en una sola pasada.
- Análisis de repositorios y bases de código de gran tamaño: el contexto extendido permite cargar varios ficheros y mantener coherencia entre ellos, aunque no se han publicado métricas específicas de código.
- Sustitución de API en prototipos con requisitos de privacidad: al ser Apache-2.0 y ejecutable con llama.cpp, se puede integrar en entornos air-gapped donde no se permite enviar datos a terceros.
- Evaluación comparativa de cuantizaciones: el repositorio incluye recibos de KLD, NIAH y benchmarks de tarea, lo que lo convierte en un banco de pruebas reproducible para estudiar el impacto de la calibración en la fidelidad de cuantizaciones de 4 bits.
- Servicio de chat multi-turno en infraestructura propia: mediante llama-cpp-python o servidores compatibles con la API de OpenAI, con la salvedad de que no se han publicado medidas de throughput para esta build concreta.

## Benchmarks y rendimiento

Fidelidad respecto a un profesor Q8_0 (KLD top-20 simétrico, 3 ejecuciones, deriva ≤1,4e-17):

| Arm | Bytes | KLD code/math ↓ | KLD general ↓ |
|---|---|---|---|
| fraQtl Hi-Fi (este repo) | 16.464.274.816 | 0,12297 (−45,3%) | 0,23120 (−18,0%) |
| unsloth UD-Q4_K_M (canónico) | 16.464.440.224 | 0,22493 | 0,28209 |
| ggml-org Q4_K_M (segundo) | 18.973.870.432 | 0,19074 | 0,24274 |

Benchmarks de tarea (0-shot instructed-CoT, mismo harness):

| Arm | GSM8K (n=200) | MATH-500 (n=500) |
|---|---|---|
| fraQtl Hi-Fi | 95,0% (190/200) | 87,6% (438/500) |
| unsloth canónico | 94,0% (188/200) | 88,2% (441/500) |
| ggml-org segundo | 94,0% (188/200) | 87,4% (437/500) |

Intervalos de confianza al 95%: ±6,9 pp en GSM8K (n=200) y ±4,4 pp en MATH-500 (n=500); todas las diferencias por pares quedan dentro del intervalo. Auditoría pareada ítem a ítem en GSM8K frente al canónico: 4/200 ítems difieren, reparto 3–1, test de signos bilateral exacto p = 0,625.

Otras métricas declaradas: perplejidad en Wikitext-2 un +0,7% superior a la canónica; acuerdo top-1 en la porción general un −0,2 pp inferior. En recuperación needle-in-a-haystack (rejilla de 8K y 32K con profundidades y 3 passkeys, más celdas de 131K con 2 passkeys, 63 celdas por arm y ejecución), las tres builds superan todas las celdas de todas las ejecuciones (270 comprobaciones individuales de passkey).

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 16,46 GB solo para pesos; hay que añadir la caché KV, que con contexto de 262K resulta prohibitiva en hardware de consumo y exige cuantización de caché o reducción de la ventana.
- GPU recomendadas: A100-80GB es el entorno usado por el autor para las evaluaciones; para uso práctico, tarjetas de 24 GB o más (RTX 4090, RTX 3090, L40S) permiten cargar los pesos con contexto moderado.
- Cabe en GPU de consumo: sí, en modelos con 24 GB de VRAM o más, siempre que se limite la longitud de contexto; en tarjetas de 16 GB no cabe sin offloading parcial a RAM.
- Opciones de despliegue: llama.cpp y llama-cpp-python (runtime declarado, versión 0.3.35); al ser GGUF, es compatible con Ollama, LM Studio y servidores basados en llama.cpp. No se menciona compatibilidad con vLLM ni TGI para este artefacto.
- Latencia y throughput: no disponibles para esta build. El autor cita, en otro repositorio de su línea de serving, 134,1 tok/s agregados con nueve usuarios concurrentes de ~128K de contexto en una A100, pero esa cifra corresponde a un modelo distinto (qwen3-4b-instruct-2507) y no es extrapolable.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| fraQtl Qwen3.8-27B Hi-Fi (este) | 27,32B | 262K | GGUF Q4_K_M, 16,46 GB | Apache-2.0 | Hugging Face, 123 descargas |
| unsloth Qwen3.8-27B-GGUF | 27,32B (mismo base) | 262K | GGUF UD-Q4_K_M, 16,46 GB | Apache-2.0 | Hugging Face, ~4,3M descargas/30 días |
| ggml-org Qwen3.8-27B-GGUF | 27,32B (mismo base) | 262K | GGUF Q4_K_M, 18,97 GB | Apache-2.0 | Hugging Face |

Las tres builds derivan del mismo checkpoint y comparten arquitectura, tamaño y contexto; la diferencia está en la fidelidad de la cuantización y en el tamaño del fichero. Este artefacto declara el mejor KLD frente al profesor Q8_0 en ambos dominios, mientras que el canónico de unsloth obtiene una perplejidad ligeramente inferior en Wikitext-2 y un resultado marginalmente superior en MATH-500, dentro del margen de error. No se dispone de comparaciones con modelos de otros desarrolladores de tamaño similar en la información proporcionada.

## Limitaciones y advertencias

- Artefacto solo de texto: la torre de visión del modelo base no se ha convertido, por lo que no puede procesar imágenes.
- Sin lista de idiomas declarada: no se puede garantizar el comportamiento multilingüe sin evaluarlo.
- Las métricas de tarea se basan en muestras pequeñas (n=200 en GSM8K, n=500 en MATH-500) con intervalos de confianza amplios (±6,9 pp y ±4,4 pp), de modo que las diferencias frente a otras builds no son estadísticamente significativas.
- Riesgo de alucinación inherente al modelo base: no se han publicado evaluaciones de veracidad ni de tasas de alucinación en la información disponible.
- Sesgos conocidos: no disponibles; el autor no documenta análisis de sesgo.
- El contexto nativo de 262K no implica que el artefacto se haya medido en servicio a esa longitud: el propio autor aclara que las cifras son una medición de calidad de la cuantización, no de KV ni de serving.
- La licencia Apache-2.0 permite uso comercial, pero el artefacto hereda las condiciones del modelo base; conviene verificar la ficha de `Qwen/Qwen3.8-27B` antes de desplegarlo en producción.
- La adopción es mínima (123 descargas, 2 likes) y el autor es un particular, no una organización con soporte; la reproducibilidad depende de recibos alojados en el propio repositorio.
- El repositorio incluye un `imatrix.dat` y recibos, pero no se documenta una validación independiente por terceros de las cifras declaradas.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/fraQtl/Qwen3.8-27B-Hi-Fi-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Discusión de referencia citada como arte prior: https://huggingface.co/Qwen/Qwen3.8-27B/discussions/65
- Cuantización canónica de unsloth: https://huggingface.co/unsloth/Qwen3.8-27B-GGUF
- Cuantización de ggml-org: https://huggingface.co/ggml-org/Qwen3.8-27B-GGUF
- Repositorio de llama.cpp: https://github.com/ggml-org/llama.cpp
- Repositorio de la línea SmartEdge/Hi-Fi Phone del autor: https://huggingface.co/fraQtl/Gemma-4-E2B-it-Hi-Fi-GGUF
- Repositorio de sidecars KV del autor: https://huggingface.co/fraQtl/qwen3-4b-instruct-2507-kv-sidecars
