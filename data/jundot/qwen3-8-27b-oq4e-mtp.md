# Jundot/Qwen3.8-27B-oQ4e-mtp

## Resumen

Qwen3.8-27B-oQ4e-mtp es una cuantización de precisión mixta en formato MLX del modelo Qwen/Qwen3.8-27B, un modelo denso de 27.781 millones de parámetros de tipo visión-lenguaje construido sobre la arquitectura Qwen3.5. Lo publica el usuario Jundot mediante su herramienta oQ (oMLX v0.7.3), y su propósito es hacer viable la inferencia local del modelo original en hardware Apple Silicon reduciendo el peso de 17,5 GB en el repositorio frente a los aproximadamente 55 GB que ocuparía en BF16.

El checkpoint conserva las tres piezas del modelo fuente: el backbone de lenguaje (26.896B parámetros), el codificador visual (0.461B) y la cabeza de predicción multi-token o MTP (0.425B). La cuantización no es uniforme: asigna bits según la sensibilidad medida de cada capa, con un promedio efectivo de 4,840 bits por peso en el backbone de lenguaje y 5,044 bits por peso en el checkpoint completo. La mayor parte de los pesos (69,8 %) queda en 4 bits con grupo de 64, mientras que un 23,7 % sube a 5 bits y un 4,6 % a 6 bits.

Es relevante ahora porque permite ejecutar un modelo de 27B con comprensión de imagen y vídeo, contexto nativo de 262.144 tokens y decodificación especulativa vía MTP en equipos de consumo con memoria unificada, algo impensable con el modelo en precisión completa. La licencia Apache-2.0 heredada del modelo base facilita además el uso comercial sin las restricciones habituales de otros pesos abiertos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido Qwen3.5 con capas Gated DeltaNet y Gated Attention, más codificador visual y cabeza MTP |
| Parametros totales | 27.781.427.952 (27.781B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 262.144 tokens nativos |
| Tipos de cuantizacion | MLX affine de 4, 5, 6 y 8 bits con grupo de 64, más capas en BF16; 4,840 bits/peso efectivos en el backbone y 5,044 en el checkpoint completo |
| Idiomas soportados | No disponible (la model card no detalla la cobertura lingüística) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors en formato MLX (librería mlx) |
| Parametros del backbone de lenguaje | 26.896B |
| Parametros del codificador visual | 0.461B |
| Parametros de la cabeza MTP | 0.425B |
| Tamano del repositorio | 17,5 GB (16,314 GiB de pesos) |
| Modalidad | image-text-to-text (imagen y vídeo) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B emplea una disposición híbrida en la que conviven capas Gated DeltaNet, un mecanismo de atención lineal con estado recurrente, y capas de Gated Attention clásica. Esta combinación busca reducir el coste de atención en contextos largos sin renunciar a la calidad de recuperación de información de la atención completa. Sobre el backbone de lenguaje se sitúa un codificador visual que habilita la comprensión de imágenes y vídeo, y una cabeza de predicción multi-token (MTP) que permite decodificación especulativa: el modelo propone varios tokens por paso y un verificador los valida, lo que incrementa el throughput en inferencia autoregresiva.

La información disponible no detalla la composición del dataset de entrenamiento, el número de tokens vistos, ni si hubo fases de RLHF, DPO o ajuste por preferencias. Tampoco se documentan las técnicas de alineación aplicadas al modelo original. Lo que sí está documentado es el proceso de cuantización: oQ4e mide la sensibilidad de cada capa, asigna bits en consecuencia y redondea cada grupo con una matriz de importancia calculada sobre 128 muestras de 512 tokens, seguida de un reajuste de escala y sesgo por mínimos cuadrados ponderados. La revisión del 29 de octubre de 2026 re-cuantizó el checkpoint con la versión mejorada de oQe en oMLX 0.7.3.

## Capacidades

- Generación de texto y razonamiento multi-turno con ventanas de hasta 262.144 tokens, adecuado para documentos extensos y conversaciones largas.
- Comprensión de imágenes y vídeo gracias al codificador visual de 0.461B parámetros, con pipeline image-text-to-text.
- Decodificación especulativa mediante la cabeza MTP incluida en el checkpoint, que acelera la generación en hardware MLX.
- Capacidades multilingües heredadas del modelo base, aunque la model card no especifica la lista de idiomas ni su nivel de competencia.
- Razonamiento de varios pasos y tareas de código y matemáticas propias de un modelo de 27B de la familia Qwen, si bien no se aportan evaluaciones que lo cuantifiquen.
- Soporte de tool calling y function calling: no documentado explícitamente en la información disponible.
- Modo de pensamiento o thinking mode: no documentado en la información disponible.

## Casos de uso

- Análisis de documentos largos en local: con 262.144 tokens de contexto, el modelo puede ingerir contratos, informes técnicos o expedientes completos y responder preguntas sobre ellos sin fragmentación, manteniendo los datos en el equipo del usuario.
- Asistencia sobre capturas y diagramas: el codificador visual permite interpretar interfaces, gráficos y esquemas técnicos, útil para soporte interno o para generar documentación a partir de imágenes de producto.
- Procesamiento de vídeo para resumen y extracción: la modalidad image-text-to-text con soporte de vídeo habilita transcripciones descriptivas, indexación de contenido audiovisual y búsqueda semántica sobre grabaciones.
- Prototipado de agentes en Apple Silicon: la cabeza MTP acelera la generación y el contexto amplio permite mantener el estado de una tarea de varios pasos, lo que facilita ciclos de iteración rápidos en un portátil o un Mac Studio.
- Investigación en cuantización: el checkpoint sirve como referencia reproducible para estudiar el impacto de la precisión mixta por capa, ya que publica la distribución exacta de bits y el tamaño de cada componente.
- Despliegue de asistentes privados sin conexión: al pesar 17,5 GB y ejecutarse con MLX, encaja en flujos de trabajo con requisitos de soberanía de datos donde no se puede enviar información a una API externa.
- Evaluación comparativa de modelos visión-lenguaje: permite contrastar el comportamiento del modelo en 4,84 bits frente al original en BF16 sobre el mismo conjunto de tareas, con una diferencia de memoria de aproximadamente un tercio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente documenta métricas de compresión: 5,044 bits/peso efectivos en el checkpoint completo, 16,314 GiB de almacenamiento y la distribución por formato de cuantización. No hay datos de MMLU, HumanEval, GSM8K ni de evaluaciones multimodales, ni comparaciones medidas contra el modelo base en BF16.

## Requisitos de hardware

- VRAM o memoria unificada estimada: al menos 18-20 GB libres para cargar los 16,314 GiB de pesos más el estado de la KV cache y buffers de inferencia; con contexto largo la demanda crece de forma apreciable.
- Hardware objetivo: Apple Silicon con memoria unificada, dado que el formato es MLX y la librería es mlx. No es directamente ejecutable en GPUs NVIDIA sin conversión previa.
- Equipos viables: Mac con 32 GB o más de memoria unificada para contexto moderado; 64 GB o más recomendable para aprovechar ventanas cercanas a los 262.144 tokens.
- GPU de consumo: no aplica en su formato actual; en un Mac con chip de la familia M, el modelo cabe en configuraciones de 32 GB en adelante.
- Opciones de despliegue: MLX y oMLX son las vías documentadas. No se ha publicado conversión a GGUF, por lo que llama.cpp y Ollama no están soportados de forma nativa; vLLM y TGI tampoco, al no ser formatos compatibles.
- Latencia y throughput: no disponibles. La cabeza MTP está pensada para acelerar la decodificación especulativa, pero no se aportan cifras de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato y cuantizacion | Licencia | Notas |
|---|---|---|---|---|---|
| Jundot/Qwen3.8-27B-oQ4e-mtp | 27,781B | 262.144 | MLX safetensors, 4,840 bits/peso en backbone | Apache-2.0 | Cuantización de precisión mixta con MTP incluida, orientada a Apple Silicon |
| Qwen/Qwen3.8-27B (base) | 27,781B | 262.144 | Safetensors BF16 | Apache-2.0 | Modelo original sin comprimir; requiere aproximadamente el triple de memoria |
| Otras cuantizaciones MLX del mismo base | 27,781B | 262.144 | MLX, típicamente 4 bits uniformes | Apache-2.0 | Menor granularidad de asignación de bits; sin datos comparativos publicados en esta ficha |

No se dispone de información sobre benchmarks que permita comparar el rendimiento de esta cuantización con el modelo base ni con alternativas de otros autores. La comparación se limita, por tanto, a parámetros, contexto, formato y licencia.

## Limitaciones y advertencias

- La cuantización introduce pérdida de precisión inevitable: aunque la asignación por sensibilidad mitiga el daño, no hay evaluaciones publicadas que cuantifiquen la degradación frente al modelo en BF16.
- El formato MLX limita el despliegue a hardware Apple Silicon o a entornos con soporte de MLX; no es portable a ecosistemas CUDA sin conversión.
- La model card no documenta sesgos conocidos, comportamiento multilingüe ni tasas de alucinación, por lo que estas dimensiones deben evaluarse empíricamente antes de usar el modelo en producción.
- La ventana de 262.144 tokens exige memoria adicional para la KV cache; en equipos con 32 GB el contexto práctico será considerablemente menor que el nominal.
- No se documenta soporte explícito de tool calling ni de modo de razonamiento, de modo que su uso en pipelines de agentes requiere validación previa.
- La licencia Apache-2.0 permite uso comercial, pero se hereda del modelo base y conviene verificar el archivo LICENSE del repositorio y las condiciones del modelo original.
- El checkpoint se actualizó el 29 de octubre de 2026 con una re-cuantización; las copias descargadas antes de esa fecha deben reemplazarse para reproducir los resultados esperados.
- El pipeline declarado es image-text-to-text, pero no se detallan limitaciones específicas del codificador visual, como resolución máxima de imagen o duración de vídeo soportada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Jundot/Qwen3.8-27B-oQ4e-mtp
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Repositorio de la herramienta de cuantización oMLX: https://github.com/jundot/omlx
- Pull request de la mejora oQe: https://github.com/jundot/omlx/pull/4930
