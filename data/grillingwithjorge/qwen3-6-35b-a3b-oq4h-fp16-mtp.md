# GrillingWithJorge/Qwen3.6-35B-A3B-oQ4h-fp16-mtp

## Resumen

Qwen3.6-35B-A3B-oQ4h-fp16-mtp es una cuantización mixta del modelo Qwen3.6-35B-A3B, publicada por el usuario GrillingWithJorge en Hugging Face. El checkpoint se ha generado con oQ (oMLX v0.8.4), una herramienta de cuantización de precisión mixta orientada al ecosistema MLX de Apple, y está pensado para su ejecución en hardware Apple Silicon. El nombre del repositorio indica que el modelo base es una variante MoE de Qwen con 35.000 millones de parámetros totales y aproximadamente 3.000 millones activos por token, e incluye una cabeza MTP (multi-token prediction) para decodificación especulativa.

El artefacto publicado no es un modelo entrenado desde cero, sino un checkpoint cuantizado con un esquema heterogéneo: una parte de los pesos se almacena en 4 bits afines con grupo 64, otra en 8 bits, y fracciones relevantes se mantienen en FP16, FP32 y U32. El resultado declarado es una media efectiva de 24,571 bits por peso sobre 7.496 millones de pesos lógicos almacenados, con un tamaño de repositorio de 23,0 GB.

La relevancia de esta ficha es doble: por un lado, documenta un caso práctico de cuantización mixta para MLX con desglose por componente (modelo de lenguaje, torre de visión y cabeza MTP); por otro, advierte de una discrepancia importante entre el nombre comercial del modelo base (35B-A3B) y el recuento real de pesos almacenados en el checkpoint (7,496 mil millones), que debe tenerse en cuenta antes de cualquier despliegue.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (tag `qwen3_5_moe`); incluye torre de visión y cabeza MTP |
| Parametros totales | 7.495.550.832 pesos lógicos almacenados en el checkpoint (el nombre del repo indica un modelo base de 35B totales / 3B activos, no verificado en la información disponible) |
| Parametros activos | No disponible (el nombre sugiere ~3B activos en el modelo base, sin confirmar) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Mixta: affine 4-bit grupo 64, affine 8-bit grupo 64, affine 8-bit grupo 128, FP16, FP32 y U32; media efectiva 24,571 bits/peso |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors (librería `mlx`) |
| Tamano del repositorio | 23,0 GB (21,441 GiB) |
| Fecha de publicacion | 2026-11-28 (actualizado el mismo dia) |

## Arquitectura y entrenamiento

El checkpoint deriva de un modelo Qwen de tipo Mixture of Experts, tal como indica el tag `qwen3_5_moe`. La información disponible no detalla el número de expertos, la dimensión oculta, el número de capas ni la política de enrutamiento del modelo base. El artefacto incluye tres componentes diferenciados: el modelo de lenguaje (6,204B pesos lógicos, 19,309 GiB), una torre de visión (0,447B pesos, 1,664 GiB) y una cabeza MTP (0,845B pesos, 0,468 GiB). La presencia de visión y de MTP confirma que el modelo base es multimodal y que soporta decodificación especulativa mediante predicción multi-token.

El proceso de cuantización, realizado con oMLX v0.8.4, aplica precisión mixta según la sensibilidad de cada tensor. La distribución declarada es la siguiente: 0,805B pesos en affine 4-bit grupo 64 (4,50 bits/peso efectivos), 1,044B en affine 8-bit grupo 64 (8,50 bits/peso), 0,003B en affine 8-bit grupo 128 (8,25 bits/peso), 0,557B en FP16 (16,00 bits/peso), 0,447B en FP32 (32,00 bits/peso) y 4,639B en U32 (32,00 bits/peso). Esta última categoría, que concentra el 61,888% de los pesos lógicos y 17,281 GiB de almacenamiento, es la que eleva la media efectiva hasta 24,571 bits/peso y explica que el repositorio ocupe 23 GB pese a denominarse "4-bit". No se dispone de información sobre el dataset de entrenamiento, el número de tokens procesados ni las etapas de alineación (RLHF, DPO u otras) del modelo original.

## Capacidades

- Generación de texto y razonamiento: el componente de lenguaje del checkpoint permite inferencia generativa, aunque no se detallan evaluaciones de calidad tras la cuantización.
- Procesamiento de visión: la presencia de una torre de visión de 0,447B pesos (1,664 GiB) indica capacidad multimodal de entrada de imagen, heredada del modelo base.
- Decodificación especulativa: la cabeza MTP (0,845B pesos) está diseñada para predecir varios tokens por paso y acelerar la generación en MLX.
- Ejecución en Apple Silicon: el formato y la librería (`mlx`) están orientados exclusivamente al framework MLX de Apple.
- Tool calling y function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Modo thinking, audio u otras capacidades especiales: no disponible en la información proporcionada.

## Casos de uso

- Inferencia local en Mac con Apple Silicon: el checkpoint está empaquetado en MLX y puede cargarse con `mlx-lm` o herramientas compatibles en equipos con memoria unificada suficiente (el repositorio ocupa 23 GB), lo que permite ejecutar un modelo MoE multimodal sin GPU dedicada.
- Prototipado de asistentes multimodales en local: la torre de visión incluida permite experimentar con flujos de imagen más texto en un entorno de escritorio Apple, sin enviar datos a servicios externos.
- Evaluación de cuantización mixta: el desglose por tipo de tensor y bits/peso efectivos convierte este checkpoint en un caso de estudio útil para comparar la degradación de calidad frente al modelo base en FP16.
- Aceleración de la generación con MTP: la cabeza de predicción multi-token puede aprovecharse para reducir la latencia en tareas de generación larga, como resúmenes o redacción asistida, siempre que el runtime MLX soporte decodificación especulativa.
- Investigación sobre eficiencia de memoria: los 4,639B pesos almacenados en U32 permiten analizar el coste real de mantener ciertos tensores en alta precisión y su impacto en el tamaño final del artefacto.
- Despliegue de referencia para pipelines MLX: sirve como checkpoint de prueba para validar integraciones de `mlx-lm`, servidores locales compatibles con MLX o scripts de generación en macOS antes de adoptar variantes cuantizadas más agresivas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM o memoria unificada estimada: el repositorio ocupa 23,0 GB en disco; la carga en memoria requiere al menos esa cantidad más el overhead del runtime MLX, por lo que se recomienda un equipo con 32 GB de memoria unificada o más.
- GPU recomendadas: el checkpoint está diseñado para Apple Silicon (series M1, M2, M3 y M4); no se ha validado en GPU NVIDIA o AMD según la información disponible.
- Cabe en GPU de consumo: no aplica en el sentido habitual; en Apple Silicon, los equipos con 32 GB o más de memoria unificada son el objetivo mínimo razonable.
- Opciones de despliegue: `mlx-lm` y el ecosistema MLX (oMLX); no se indica compatibilidad con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.6-35B-A3B-oQ4h-fp16-mtp (este) | 7,496B pesos almacenados (base 35B-A3B segun nombre) | No disponible | safetensors MLX, cuantizacion mixta | No disponible | Hugging Face, 0 descargas |
| Modelo base Qwen3.6-35B-A3B | 35B totales / ~3B activos segun nombre | No disponible | No disponible | No disponible | No verificado en la informacion disponible |
| Otras cuantizaciones MLX del mismo base | No disponible | No disponible | MLX | No disponible | No disponible |

No se dispone de datos de benchmarks ni de especificaciones verificadas de alternativas comparables en la información proporcionada.

## Limitaciones y advertencias

- Discrepancia de nomenclatura: el nombre indica 35B-A3B, pero el checkpoint contiene 7.495.550.832 pesos lógicos; es imprescindible verificar que el artefacto corresponde al modelo esperado antes de usarlo en producción.
- Cuantización no uniforme: pese a la etiqueta "4-bit", la media efectiva es de 24,571 bits/peso y el 61,888% de los pesos está en U32, lo que reduce el ahorro de memoria esperado y puede afectar al rendimiento en equipos ajustados.
- Calidad tras cuantización no evaluada: no se han publicado benchmarks que comparen este checkpoint con el modelo base en FP16, por lo que se desconoce la degradación en razonamiento, código o visión.
- Dependencia de MLX: el formato y la librería limitan su uso a Apple Silicon; no es portable a CUDA, ROCm ni a runtimes estándar de servidor.
- Licencia no especificada: la ausencia de licencia declarada impide confirmar si se permite uso comercial; debe consultarse la licencia del modelo base Qwen antes de cualquier despliegue productivo.
- Idiomas no declarados: no hay información sobre cobertura lingüística, por lo que no se puede garantizar un rendimiento adecuado en castellano u otros idiomas.
- Riesgo de alucinación y sesgos: no documentado en la información disponible; se aplican los riesgos habituales de los modelos generativos.
- Repositorio sin tracción: 0 descargas y 0 likes en el momento de la consulta, lo que reduce la validación comunitaria del artefacto.

## Enlaces

- Hugging Face: https://huggingface.co/GrillingWithJorge/Qwen3.6-35B-A3B-oQ4h-fp16-mtp
- Repositorio de oQ / oMLX: https://github.com/jundot/omlx
