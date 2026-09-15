# Asur4N/Swift-Qwen3.8-27B-mlx-fp16

## Resumen

Asur4N/Swift-Qwen3.8-27B-mlx-fp16 es una conversión a formato MLX en FP16 del modelo ukisai/Swift-Qwen3.8-27b, un derivado orientado a eficiencia de razonamiento construido por UkisAI sobre una base de 27.356.728.560 parámetros (27,36 B). El modelo conserva la arquitectura completa del original, incluida la torre de visión y los ficheros de procesamiento de imagen y vídeo, por lo que la pipeline declarada es image-text-to-text.

La relevancia de esta ficha no está en un nuevo entrenamiento, sino en el empaquetado: el autor reclama una reducción de aproximadamente el 58 % en tokens de pensamiento, una aceleración de unas 1,95 veces y una pérdida de precisión inferior al 1 % respecto al modelo del que deriva. Además, la conversión extrae la cabeza MTP (multi-token prediction) nativa como drafter independiente para decodificación especulativa, aunque ese componente no se incluye en este repositorio.

Técnicamente se trata de un transformer híbrido de 64 capas que combina atención lineal GatedDeltaNet con atención completa, ventana de contexto de 262.000 tokens y un tokenizador de 248.320 entradas de vocabulario. El repositorio ocupa 54,7 GB y distribuye 11 shards en safetensors, con licencia Swift Open License v1.0 (gratuita hasta 1 M USD de ARR, con licencia empresarial por encima de ese umbral).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3_5ForConditionalGeneration (`model_type: qwen3_5`), 64 capas, hibrida: GatedDeltaNet (atencion lineal) + atencion completa |
| Parametros totales | 27.356.728.560 (27,36 B) |
| Parametros activos | no disponible (no se documenta configuracion MoE) |
| Longitud de contexto | 262.000 tokens |
| Tipos de cuantizacion | solo FP16 en este repositorio; no se publican variantes cuantizadas |
| Idiomas soportados | no disponible |
| Licencia | Swift Open License v1.0 (`swift-open-license-1.0`); gratuita hasta 1 M USD de ARR, licencia empresarial por encima |
| Formato de pesos | safetensors, precision completa FP16, 11 shards (~51 GB de pesos; 54,7 GB de repositorio) |
| Vocabulario del tokenizador | 248.320 entradas |
| Modalidades | texto, imagen y video (torre de vision + `processor_config.json`, `preprocessor_config.json`, `video_preprocessor_config.json`) |
| Libreria / runtime | mlx (`mlx-vlm`); no compatible de forma nativa con stacks CUDA |

## Arquitectura y entrenamiento

El modelo base es un transformer hibrido de 64 capas que intercala GatedDeltaNet (atención lineal con estado recurrente) con capas de atención completa. Este esquema reduce el coste por token en contextos largos manteniendo la capacidad de recuperación exacta de la atención completa en las capas designadas, y es lo que permite sostener una ventana de 262.000 tokens. Incluye además torre de visión y procesadores de imagen y vídeo, de modo que el modelo acepta entradas multimodales además de texto.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, el uso de RLHF o DPO, ni sobre el proceso de ajuste LoRA que dio lugar al derivado "Swift" de UkisAI. Lo único documentado por el autor de esta conversión es que se realizó con `mlx-vlm 0.7.1` mediante `mlx_vlm.convert --dtype float16 --mtp` a partir de la revisión `1b30aaa` del modelo base, y que no se modificó ningún peso más allá del cambio de tipo BF16 a FP16. La innovación técnica destacable es la extracción de la cabeza MTP nativa como drafter independiente para decodificación especulativa, que se conserva junto al modelo pero no se distribuye en este repositorio.

Las cifras de eficiencia que declara la model card del modelo base son relativas: aproximadamente un 58 % menos de tokens de pensamiento, unas 1,95 veces más velocidad y menos de un 1 % de pérdida de precisión. No se publican tablas de benchmarks absolutos.

## Capacidades

- Generación de texto y razonamiento con modo de pensamiento (thinking) optimizado para gastar menos tokens de razonamiento que el modelo original.
- Comprensión de imágenes: la pipeline es image-text-to-text y la torre de visión se conserva íntegra en la conversión.
- Procesamiento de vídeo: se incluye `video_preprocessor_config.json`, lo que indica soporte de entrada de vídeo en el pipeline multimodal.
- Conversación multi-turno con contexto largo, hasta 262.000 tokens, soportada por la plantilla de chat incluida (`chat_template.jinja`).
- Decodificación especulativa: la cabeza MTP se extrajo como drafter independiente durante la conversión, aunque el drafter no está incluido en este repositorio.
- Soporte de tool calling / function calling: no documentado en la información disponible. La existencia de `chat_template.jinja` y `generation_config.json` es compatible con plantillas de herramientas, pero no se confirma.
- Soporte de agentes y razonamiento multi-paso: no documentado explícitamente; el modelo está etiquetado como `reasoning` y `efficient-thinking`.
- Capacidades multilingües: no disponibles (el campo de idiomas no está informado).

## Casos de uso

- Razonamiento en producción con coste controlado: gracias a la reducción declarada de tokens de pensamiento (en torno al 58 %) y a la aceleración de aproximadamente 1,95 veces, es adecuado para pipelines donde el coste por consulta de un modelo razonador es el cuello de botella, siempre que se acepte la pérdida de precisión inferior al 1 % que declara el autor.
- Análisis de documentos con contenido visual: al conservar la torre de visión, puede procesar capturas de pantalla, diagramas, gráficos de informes o formularios escaneados y razonar sobre ellos en el mismo contexto que el texto asociado.
- Asistentes locales en Mac con memoria unificada: al estar en formato MLX, es una opción para despliegues en Apple Silicon donde se requiere que los datos no salgan del equipo (entornos sanitarios, legales o de investigación con datos sensibles).
- Procesamiento de corpus largos en una sola pasada: con 262.000 tokens de contexto se pueden analizar expedientes completos, bases de código medianas o transcripciones extensas sin troceado agresivo ni pérdida de coherencia entre fragmentos.
- Evaluación e investigación sobre eficiencia de razonamiento: útil para comparar presupuestos de tokens de pensamiento frente al modelo base y medir el compromiso entre latencia y precisión en tareas de matemáticas o lógica.
- Extracción de información estructurada a partir de vídeo o secuencias de imágenes: el procesador de vídeo permite resumir o etiquetar contenido audiovisual en flujos de moderación o catalogación.
- Generación y revisión de código en proyectos de tamaño medio, siempre que se valide con tests propios, dado que no se publican resultados de HumanEval ni de benchmarks de código para este derivado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card del modelo base únicamente declara métricas relativas frente al modelo del que deriva: aproximadamente un 58 % menos de tokens de pensamiento, aproximadamente 1,95 veces de aceleración y menos de un 1 % de pérdida de precisión. No se proporcionan valores absolutos de MMLU, HumanEval, GSM8K, MMMU ni de ningún otro conjunto de evaluación, y tampoco hay datos de throughput o latencia medidos.

## Requisitos de hardware

- VRAM / memoria unificada estimada: los pesos FP16 ocupan aproximadamente 51 GB (11 shards), con un repositorio de 54,7 GB. Para inferencia hay que sumar el espacio de activaciones y caché KV, por lo que se recomienda un mínimo de 64 GB de memoria unificada y, de forma realista, 96 GB o más para contextos largos.
- GPU compatibles: al distribuirse en formato MLX, el destino natural son chips de Apple (series M1, M2, M3 y M4, especialmente las variantes Max y Ultra con 64, 96, 128, 192 o 512 GB de memoria unificada). No se documenta el uso en A100, H100 ni RTX 4090 en este repositorio.
- GPU de consumo: no cabe en GPUs de consumo con 24 GB de VRAM (RTX 4090, 3090) en FP16; requeriría cuantización, que no se distribuye en este repositorio.
- Opciones de despliegue: `mlx-vlm` es la vía documentada, tanto en modo CLI (`python -m mlx_vlm.generate`) como mediante la API de la librería. No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI para estos pesos.
- Latencia y throughput: no disponibles. La única referencia es la aceleración relativa de aproximadamente 1,95 veces declarada para el modelo base.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / precision | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Asur4N/Swift-Qwen3.8-27B-mlx-fp16 | 27,36 B | 262.000 tokens | MLX, FP16, safetensors (11 shards) | Swift Open License v1.0 (gratis hasta 1 M USD ARR) | HuggingFace, 0 descargas, 0 likes |
| ukisai/Swift-Qwen3.8-27b (modelo base) | 27,36 B | 262.000 tokens | BF16 (origen de la conversion) | Swift Open License v1.0 | HuggingFace |
| Otras alternativas de ~27 B en formato MLX | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos verificables sobre modelos alternativos equivalentes en la información proporcionada, por lo que no se puede establecer una comparación de rendimiento con terceros. La comparación con el modelo base se limita a lo documentado: misma arquitectura, mismo contexto y mismos pesos, con cambio de tipo BF16 a FP16 y extracción de la cabeza MTP.

## Limitaciones y advertencias

- La licencia Swift Open License v1.0 es gratuita solo hasta 1 M USD de ARR; por encima de ese umbral se requiere una licencia empresarial. Es un modelo con licencia "other", no aprobada por la OSI, y conviene revisar los términos completos en la model card del modelo base antes de un uso comercial.
- El repositorio solo incluye pesos FP16 de precisión completa, lo que limita su despliegue a equipos con memoria unificada amplia y excluye GPUs de consumo sin un proceso de cuantización previo no documentado.
- El formato MLX restringe el uso a hardware Apple; no hay pesos GGUF, AWQ ni GPTQ publicados en este repositorio.
- El drafter MTP extraído no se distribuye junto a los pesos, por lo que la ventaja de decodificación especulativa no está disponible directamente con esta conversión.
- No se han publicado resultados de benchmarks absolutos ni evaluaciones independientes; el modelo tiene 0 descargas y 0 likes en el momento de la consulta, por lo que carece de validación por parte de la comunidad.
- No se informa de los idiomas soportados, lo que impide garantizar un comportamiento adecuado en castellano sin una evaluación propia.
- Riesgo de alucinación propio de los modelos de razonamiento generativos, especialmente en tareas multimodales (lectura de gráficos, tablas o texto en imágenes) y en contextos muy largos donde la información relevante puede quedar diluida.
- Sesgos: no disponibles. No se documenta la composición del dataset de entrenamiento ni los procesos de alineación aplicados (RLHF, DPO u otros).
- El modelo base es un derivado ajustado con LoRA sobre una base de 27 B; la pérdida de precisión declarada (menos del 1 %) no está desglosada por tarea, por lo que puede ser mayor en dominios específicos.
- Las fechas de creación y actualización del repositorio (14 de septiembre de 2026) indican un artefacto muy reciente y sin historial de mantenimiento verificado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Asur4N/Swift-Qwen3.8-27B-mlx-fp16
- Modelo base (ukisai/Swift-Qwen3.8-27b): https://huggingface.co/ukisai/Swift-Qwen3.8-27b
- Libreria de conversion y ejecucion `mlx-vlm`: referenciada en la model card como `mlx_vlm` 0.7.1 (instalable via `pip install mlx-vlm`)
- Resultados de busqueda web adicionales: no se han encontrado enlaces relevantes (los resultados devueltos corresponden a contenido no relacionado con el modelo).
