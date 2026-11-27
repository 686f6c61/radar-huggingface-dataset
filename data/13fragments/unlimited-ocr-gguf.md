# 13fragments/Unlimited-OCR-GGUF

## Resumen

Unlimited-OCR GGUF es una cuantización en formato GGUF del modelo baidu/Unlimited-OCR, publicada por el usuario 13fragments para su uso con llama.cpp. El modelo original es un sistema de OCR y parsing de documentos de tipo image-text-to-text desarrollado por Baidu, con aproximadamente 2.930 millones de parámetros (2,93 B). Esta versión GGUF incluye el proyector de visión (mmproj) necesario para procesar imágenes en llama.cpp y está pensada para ejecutar OCR de documentos en hardware modesto, incluido CPU.

La relevancia de esta publicación no reside en el modelo en sí, sino en la documentación de fidelidad que acompaña a cada cuantización: el autor evaluó cinco archivos (BF16, Q8_0, Q6_K, Q5_K_M y Q4_K_M) sobre 38 páginas de documentos (16 de papers arXiv, 14 de PDFs de dominio público y 8 capturas de Wikipedia en chino), midiendo la tasa de error de caracteres frente al archivo BF16 de referencia y frente al modelo original en transformers. Esto permite elegir una cuantización con datos concretos sobre la degradación esperada, algo poco habitual en repositorios GGUF.

El resultado principal es que Q8_0 (3,13 GB) es la única cuantización recomendada: mantiene una tasa mediana de 0,00 % frente a BF16 y un 70 % de páginas dentro del 1 % de error. Q4_K_M, en cambio, presenta una tasa mediana del 12,18 % y solo un 32 % de páginas dentro del 1 %, por lo que el autor no la recomienda. El repositorio ocupa 23,4 GB en total y se distribuye bajo licencia MIT.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base image-text-to-text con proyector de visión; detalles de la arquitectura del original no especificados) |
| Parametros totales | 2.934.734.080 (2,93 B) |
| Parametros activos | no aplica (no es MoE según la información disponible) |
| Longitud de contexto | no disponible (el ejemplo de uso emplea `-c 16384`) |
| Tipos de cuantizacion | BF16, Q8_0, Q6_K, Q5_K_M, Q4_K_M (K-quants con importance matrix `Unlimited-OCR.imatrix` calculada sobre WikiText-2) |
| Idiomas soportados | no disponible (evaluado con documentos en inglés y capturas en chino) |
| Licencia | MIT |
| Formato de pesos | GGUF (para llama.cpp), con proyector de visión separado `mmproj-Unlimited-OCR-F16.gguf` |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna ni sobre el proceso de entrenamiento del modelo base baidu/Unlimited-OCR en la documentación proporcionada. Por la etiqueta de pipeline (image-text-to-text) y la presencia de un proyector de visión independiente en formato mmproj, se trata de un modelo multimodal que combina un codificador de imágenes con un modelo de lenguaje para generar texto a partir de imágenes de documentos. El autor de la cuantización indica que el modelo original emplea `no_repeat_ngram_size` como control de repetición, un parámetro que llama.cpp no implementa y que se sustituye por DRY (DRY repetition penalty).

El trabajo técnico documentado en esta publicación se centra en la cuantización y su evaluación, no en el entrenamiento. Los K-quants se generaron con una importance matrix calculada sobre WikiText-2, y cada archivo se validó ejecutándolo sobre 38 páginas con llama.cpp v1.0.0 (`b1b770d90`). El autor señala que parte de la degradación frente al modelo original en transformers proviene de la propia implementación de llama.cpp (preprocesado de imagen, kernels y control de repetición), no solo de la cuantización.

## Capacidades

- OCR y parsing de documentos: extrae texto de imágenes de páginas, incluyendo papers, informes y tablas estadísticas.
- Salida con marcado de grounding: genera etiquetas `<|ref|>` y `<|det|>` con cajas delimitadoras de los elementos detectados.
- Procesamiento de tablas: el autor menciona documentos con muchas tablas en el conjunto de evaluación, aunque advierte que penalizaciones de repetición fuertes pueden romper filas.
- Procesamiento de capturas de pantalla web: evaluado sobre capturas de artículos de Wikipedia en chino, con resultados inestables.
- Ejecución en CPU: el autor reporta 1,22 páginas por minuto con Q4_K_M y 1,21 con Q8_0 en CPU con 8 hilos.
- Compatibilidad con llama.cpp mediante `llama-mtmd-cli` y plantilla de chat `deepseek-ocr`.
- Soporte de tool calling, agentes, razonamiento multi-paso, audio o modo thinking: no disponible en la información proporcionada.

## Casos de uso

- Digitalización de literatura científica: procesar páginas de papers arXiv y extraer el texto con cajas de detección para conservar la estructura del documento; el conjunto de evaluación del autor incluye 16 páginas de este tipo.
- Extracción de tablas de informes públicos: convertir tablas estadísticas de PDFs institucionales en texto estructurado, con la advertencia de que configuraciones de repetición agresivas pueden fragmentar filas.
- Procesamiento por lotes en CPU sin GPU: desplegar Q8_0 con llama.cpp en servidores sin acelerador, a un ritmo aproximado de 1,2 páginas por minuto con 8 hilos, adecuado para colas de digitalización no urgentes.
- Pipeline de ingesta documental en aplicaciones RAG: usar la salida con marcado `<|ref|>`/`<|det|>` para segmentar el contenido antes de indexarlo en un sistema de recuperación.
- Archivado de documentación gubernamental: los PDFs de dominio público de Wikimedia Commons (informes del gobierno de EE. UU., memorias anuales) son el tipo de documento sobre el que se midió la fidelidad de las cuantizaciones.
- Prototipado y evaluación local de OCR: comparar la salida de distintas cuantizaciones frente a BF16 usando los archivos `fidelity/pages.jsonl` y `fidelity/fidelity.json` incluidos en el repositorio para decidir el equilibrio entre tamaño y fidelidad.
- Extracción de texto de capturas de pantalla: posible, pero con reservas; el autor documenta inestabilidad severa en las 8 páginas de capturas chinas, con variaciones de hasta el 25 % entre ejecuciones del propio modelo original en GPUs distintas.

## Benchmarks y rendimiento

El autor publica tasas de error de caracteres (CER) de cada cuantización frente al archivo BF16 de referencia, sobre las 30 páginas no chinas, excluyendo páginas con bucles de repetición:

| Archivo | Tamano | Tasa mediana | Paginas dentro del 1 % | Bucles | Recomendado |
|---|---|---|---|---|---|
| `Unlimited-OCR-BF16.gguf` | 5,88 GB | referencia | referencia | 2 | referencia |
| `Unlimited-OCR-Q8_0.gguf` | 3,13 GB | 0,00 % | 70 % | 2 | si |
| `Unlimited-OCR-Q6_K.gguf` | 2,61 GB | 0,13 % | 61 % | 0 | no |
| `Unlimited-OCR-Q5_K_M.gguf` | 2,22 GB | 0,17 % | 62 % | 2 | no |
| `Unlimited-OCR-Q4_K_M.gguf` | 1,95 GB | 12,18 % | 32 % | 4 | no |

Comparación de los archivos de este repositorio frente al modelo original en transformers (bf16), en páginas no chinas sin bucles:

| Archivo | Tasa mediana | Paginas dentro del 1 % | Bucles | Bucles en paginas chinas |
|---|---|---|---|---|
| este repositorio, BF16 | 1,36 % | 46 % | 2 | 1 |
| este repositorio, Q4_K_M | 19,73 % | 27 % | 4 | 3 |
| este repositorio, Q5_K_M | 0,97 % | 50 % | 2 | 2 |
| este repositorio, Q6_K | 1,36 % | 47 % | 0 | 4 |
| este repositorio, Q8_0 | 1,06 % | 50 % | 2 | 3 |

Archivos Q4_K_M de otros publicadores, puntuados con el mismo método:

| Archivo | Tasa mediana (vs BF16) | Paginas dentro del 1 % | Bucles | Tasa mediana (vs original) |
|---|---|---|---|---|
| sabafallah, Q4_K_M | 10,37 % | 36 % | 3 | 10,57 % |
| sahilchachra, Q4_K_M | 13,48 % | 24 % | 3 | 13,61 % |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible; las métricas anteriores miden fidelidad de transcripción, no precisión frente a transcripción humana.

## Requisitos de hardware

- VRAM estimada: BF16 requiere aproximadamente 5,88 GB solo para los pesos, más el proyector de visión F16 y la caché KV; Q8_0 baja a 3,13 GB y Q4_K_M a 1,95 GB de pesos.
- GPU recomendadas: no especificadas en la documentación. El autor menciona ejecuciones en GPU distintas (sin detallar modelos) para las pruebas de paridad.
- GPU de consumo: por tamaño de pesos, Q8_0 y cuantizaciones inferiores caben en GPUs de consumo con 8 GB o más de VRAM, aunque el dato no está confirmado por el autor.
- CPU: se reporta funcionamiento en CPU con 8 hilos a 1,22 páginas/minuto (Q4_K_M) y 1,21 páginas/minuto (Q8_0), con `-n 8192` y `-c 16384`.
- Opciones de despliegue: llama.cpp mediante `llama-mtmd-cli`, con `--mmproj mmproj-Unlimited-OCR-F16.gguf`, plantilla de chat `deepseek-ocr`, `--flash-attn off` y parámetros DRY (`--dry-multiplier 2.0 --dry-base 1.75 --dry-allowed-length 2 --dry-penalty-last-n 256 --dry-sequence-breaker none`). El autor probó con llama.cpp v1.0.0 (`b1b770d90`). Otros motores (vLLM, TGI, Ollama) no se mencionan.
- Latencia y throughput: solo se dispone de las cifras de CPU indicadas; no hay datos de GPU.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. La única comparación disponible es entre cuantizaciones del mismo modelo y frente a los archivos Q4_K_M de otros publicadores (sabafallah y sahilchachra), cuyos resultados figuran en la sección de benchmarks. Comparativas con otros sistemas de OCR (por ejemplo, modelos especializados de parsing de documentos de otros desarrolladores) no están disponibles.

## Limitaciones y advertencias

- Las métricas miden concordancia con el archivo BF16 del autor y con el modelo original, no precisión frente a una transcripción humana.
- El conjunto de evaluación es pequeño (38 páginas); diferencias de unas pocas milésimas entre archivos son ruido estadístico.
- Las capturas de pantalla web en chino son inestables: dos ejecuciones del modelo original en GPUs distintas difieren hasta un 25 % en esas páginas (frente a un máximo del 2 % en las demás), y los archivos GGUF entran en bucles en 1 a 4 de las 8 páginas chinas.
- Incluso BF16 en llama.cpp se desvía del original en 2 de las 30 páginas no chinas; parte del error proviene de la implementación (preprocesado de imagen, kernels, control de repetición), no de la cuantización.
- Q4_K_M no es recomendable para producción: tasa mediana del 12,18 % frente a BF16 y del 19,73 % frente al original.
- Los parámetros DRY elegidos por el autor (multiplier 2.0) reducen los bucles pero penalizan repeticiones legítimas: comas en listas de citas pueden convertirse en puntos y las filas de tablas pueden romperse. La configuración de paridad de llama.cpp (`--dry-multiplier 0.8 --dry-penalty-last-n 64`) mantiene BF16 más cerca del original (0,81 % mediano frente a 1,36 %) pero provoca más bucles (9 de 38 páginas frente a 3).
- Riesgo de bucles de repetición: el autor recomienda revisar las salidas largas en busca de líneas repetidas y usar `-n 8192` como tope.
- Sesgos conocidos: no documentados en la información disponible.
- Licencia MIT, según el autor, igual que el modelo original; no se detallan restricciones adicionales para uso comercial.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado en noviembre de 2026; se trata de una publicación reciente y sin validación comunitaria.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/13fragments/Unlimited-OCR-GGUF
- Modelo base: https://huggingface.co/baidu/Unlimited-OCR
- Archivos de fidelidad citados en la model card: `fidelity/pages.jsonl` y `fidelity/fidelity.json` (incluidos en el repositorio)
- Importance matrix: `Unlimited-OCR.imatrix` (incluida en el repositorio)
- llama.cpp: no se proporciona enlace en la información disponible
- Papers, blogs, demos o repositorios adicionales: no disponibles en la información proporcionada
