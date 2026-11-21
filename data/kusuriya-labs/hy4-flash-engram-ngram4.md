# kusuriya-labs/Hy4-flash-Engram-Ngram4

## Resumen

Hy4-flash Engram Ngram4 es un artefacto de tablas de cuantización publicado por kusuriya-labs para el modelo base tencent/Hy4-flash. No se trata de un modelo autónomo: contiene las tablas Engram del modelo original (4 capas × 16 cabeceras, 660.006.416 filas × 96 dimensiones) recomprimidas a 4 bits mediante cuantización Lloyd-Max con escalas FP16 por fila. El repositorio ocupa 33 GB y debe combinarse con el modelo principal (por ejemplo, kusuriya-labs/Hy4-flash-EXL3-INT8-4bpw) para poder ejecutar inferencia.

El problema que aborda es el coste de almacenamiento y de ancho de banda de memoria de las tablas Engram en BF16, que en el modelo original representan cientos de millones de filas. La propuesta reduce ese peso a un formato propietario denominado `ngram-q` (versión 1, perfil `ngram4`, códec `lloyd-row-f16`), verificable mediante una herramienta de inspección de formato y consumible solo por una rama específica del runtime shelf (`feat/hy4-ngram45`, commit `7013326a` en adelante).

Su relevancia es acotada pero técnica: demuestra una vía de compresión de tablas de memoria asociativa (Engram/N-gram) con pérdida de calidad medida y cuantificada, y publica un punto de referencia de rendimiento en hardware de consumo profesional (Radeon R9700 y V620). No obstante, la ausencia de benchmarks a gran escala con las tablas reales y el estado no fusionado del soporte en shelf limitan su uso en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Tablas Engram (memoria asociativa N-gram) del modelo tencent/Hy4-flash; no es un modelo completo |
| Parametros totales | 660.006.416 filas × 96 dimensiones (4 capas × 16 cabeceras) en las tablas Engram; parametros del modelo base: no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (depende del modelo base tencent/Hy4-flash) |
| Tipos de cuantizacion | 4 bits Lloyd-Max con escala FP16 por fila (códec `lloyd-row-f16`, perfil `ngram4`) |
| Idiomas soportados | no disponible |
| Licencia | Tencent Hy License 1.0 (no es Apache 2.0) |
| Formato de pesos | `ngram-q` versión 1 (artefacto de tablas Engram); requiere modelo principal en formato compatible con shelf |

## Arquitectura y entrenamiento

El artefacto no entrena un modelo nuevo: cuantiza las tablas Engram del modelo tencent/Hy4-flash. La estructura descrita son 4 capas de tablas con 16 cabeceras cada una, con 660.006.416 filas de 96 dimensiones por entrada. La compresión aplica cuantización escalar de 4 bits con cuantiles Lloyd-Max y una escala FP16 por fila, lo que preserva la dinámica relativa de cada fila a costa de una pérdida de precisión medible.

La validación publicada incluye una inspección automática de formato en C++ con política fail-closed (PASS) y una medición de error de reconstrucción sobre muestras: error L2 relativo medio de 0,0891 y máximo de 0,0902. No se documentan datos de entrenamiento, número de tokens, composición del corpus ni etapas de RLHF/DPO, ya que el artefacto hereda las características del modelo base y no las describe.

## Capacidades

- Almacenamiento comprimido de las tablas Engram del modelo Hy4-flash, con verificación de integridad de formato mediante `ngram_quantize.py verify`.
- Decodificación de las tablas cuantizadas por parte del runtime shelf (rama `feat/hy4-ngram45`), integrada en el pipeline de generación `shelf-compute hy4 generate`.
- Generación de texto en combinación con el modelo principal: en la validación E2E se confirmaron respuestas correctas a preguntas factuales en inglés (Paris, Jane Austen, Mars).
- No soporta por sí solo tool calling, razonamiento multi-paso, visión, audio ni otras capacidades de modelo; estas dependen del modelo base y del runtime.
- Capacidades multilingües: no disponibles en la información publicada.

## Casos de uso

- Investigación en compresión de memorias asociativas: permite estudiar el impacto de la cuantización de 4 bits Lloyd-Max sobre tablas Engram midiendo el error L2 relativo por fila, con un protocolo de verificación reproducible incluido.
- Despliegue de Hy4-flash en hardware con memoria limitada: al sustituir las tablas BF16 por el artefacto de 33 GB, se reduce la huella de las tablas Engram y se facilita su carga junto al modelo principal cuantizado (por ejemplo, EXL3-INT8-4bpw).
- Evaluación de runtimes alternativos: sirve como caso de prueba para validar la implementación de `ngram-q` en shelf y comparar su rendimiento frente a FP8 (23,79 tok/s frente a 23,88 tok/s en la configuración medida).
- Reproducción de experimentos de cuantización: el formato y el códec están documentados en el repositorio shelf, lo que permite reimplementar el decodificador en otros motores y comparar la fidelidad de reconstrucción.
- Pruebas de regresión de calidad en preguntas factuales: el conjunto de validación con Paris, Jane Austen y Mars puede ampliarse como test mínimo de cordura tras cada recompresión.
- Integración en pipelines de investigación con modelos de memoria aumentada: el artefacto permite experimentar con recuperación N-gram sobre el modelo base sin cargar las tablas en BF16.

## Benchmarks y rendimiento

| Metrica | Valor | Condiciones |
|---|---|---|
| Error L2 relativo medio (reconstruccion) | 0,0891 | Muestras de tablas, inspección de formato |
| Error L2 relativo máximo (reconstruccion) | 0,0902 | Muestras de tablas, inspección de formato |
| Tiempo de carga E2E | 197,6 s | 1× R9700 + 2× V620 |
| Throughput decode (Ngram4) | 23,79 tok/s | 1× R9700 + 2× V620 |
| Throughput decode (FP8, referencia) | 23,88 tok/s | 1× R9700 + 2× V620 |
| Evaluacion PopQA | 300 preguntas, resultado de referencia de re-cuantizacion FP8 | No es benchmark del Ngram4 real |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) para este artefacto en la información disponible. Los datos de PopQA corresponden a un experimento de re-cuantización FP8 y no deben interpretarse como rendimiento del Ngram4 real.

## Requisitos de hardware

- VRAM estimada: el artefacto ocupa 33 GB en disco; la memoria necesaria en inferencia depende del modelo principal y del runtime, y no está cuantificada en la información disponible.
- GPU validadas: AMD Radeon R9700 (1 unidad) y AMD Radeon V620 (2 unidades) en la prueba E2E publicada.
- GPU de consumo: no se documenta compatibilidad con RTX 4090 u otras GPU consumer; el soporte depende de la rama de shelf y de sus backends.
- Despliegue: exclusivamente mediante el runtime shelf, rama `feat/hy4-ngram45` (commit `7013326a` o posterior), con `shelf-compute hy4 generate` y los parámetros `--model-dir`, `--engram-dir`, `--placement` e `--input-ids-file`. No hay soporte en vLLM, llama.cpp, Ollama ni TGI según la información disponible.
- Latencia y throughput: carga de 197,6 s y 23,79 tok/s de decodificación en la configuración R9700 + 2× V620; el FP8 de referencia obtiene 23,88 tok/s, por lo que la ganancia de velocidad es prácticamente nula en esa prueba.

## Comparativa con modelos similares

| Modelo | Tipo | Tamano | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Hy4-flash Engram Ngram4 (este) | Tablas Engram cuantizadas a 4 bits | 660.006.416 filas × 96 dim (33 GB) | no disponible | Tencent Hy License 1.0 | Hugging Face, runtime shelf en rama no fusionada |
| Hy4-flash Engram en BF16 (original) | Tablas Engram sin comprimir | Mismas filas en BF16 | no disponible | Tencent Hy License 1.0 | Incluido en tencent/Hy4-flash |
| Hy4-flash EXL3-INT8-4bpw | Modelo principal cuantizado | no disponible | no disponible | Tencent Hy License 1.0 | Hugging Face (kusuriya-labs) |

No se dispone de datos de benchmarks comparables entre estas variantes más allá del throughput E2E citado (23,79 frente a 23,88 tok/s). Para modelos de la misma categoría (memorias N-gram cuantizadas) no se ha identificado una alternativa pública en la información disponible.

## Limitaciones y advertencias

- No es un modelo autónomo: no puede ejecutar inferencia por sí solo y requiere el modelo principal y un runtime compatible.
- El soporte en shelf está en la rama `feat/hy4-ngram45` y `hy4_flash` no está fusionado en `main`; la API y el formato pueden cambiar sin aviso.
- La pérdida de reconstrucción es medible (error L2 relativo medio de 0,0891, máximo de 0,0902) y su impacto en la calidad de generación a gran escala no se ha evaluado.
- Los benchmarks publicados son limitados: PopQA con 300 preguntas corresponde a un experimento de re-cuantización FP8, no al Ngram4 real; no hay MMLU, HumanEval ni GSM8K.
- La licencia Tencent Hy License 1.0 no es Apache 2.0 e impone condiciones de redistribución y cláusulas específicas de MaaS (artículo 10); es obligatorio revisar el archivo LICENSE antes de cualquier uso comercial.
- Idiomas soportados no documentados; la validación E2E se limita a preguntas factuales en inglés.
- Riesgo de alucinación y sesgos: no evaluados en la información disponible; heredados del modelo base en la medida en que las tablas Engram influyan en la generación.
- El rendimiento medido (23,79 tok/s) es prácticamente idéntico al FP8 de referencia, por lo que la ventaja de esta cuantización es de almacenamiento, no de velocidad.

## Enlaces

- Hugging Face: https://huggingface.co/kusuriya-labs/Hy4-flash-Engram-Ngram4
- Modelo base: https://huggingface.co/tencent/Hy4-flash
- Modelo principal compatible: https://huggingface.co/kusuriya-labs/Hy4-flash-EXL3-INT8-4bpw
- Especificación del formato ngram-q: https://github.com/kusuriya-labs/shelf/blob/main/docs/developer/ngram_quantization.md
- Rama del runtime shelf: https://github.com/kusuriya-labs/shelf/tree/feat/hy4-ngram45
- Repositorio shelf: https://github.com/kusuriya-labs/shelf
