# g-oQ/Inkling-2-Mini-oQ2e

## Resumen

Inkling-2-Mini-oQ2e es una cuantización mixta del modelo base thinkingmachines/Inkling-2-Mini, publicada por el usuario g-oQ mediante la herramienta oQ (oMLX v0.8.2). El checkpoint resultante almacena 26.388 millones de parámetros del modelo de lenguaje más 318 millones del codificador visual, con un total lógico de 26.707 millones de pesos comprimidos en aproximadamente 10 GB (9,995 GiB). La cuantización emplea precisión mixta: la mayor parte de los pesos (91,592 %) se almacena en affine 2-bit con grupo 64, mientras que una fracción menor se preserva en 8-bit, BF16 y FP32 para mantener la calidad en capas sensibles.

El interés de esta ficha reside en que es una distribución derivada, no un modelo original: el trabajo técnico corresponde a Thinking Machines (Inkling-2-Mini) y el trabajo de compresión a g-oQ. El formato es MLX, lo que la orienta a ejecución en Apple Silicon mediante el framework MLX de Apple, y no a GPUs NVIDIA. La compresión a un promedio efectivo de 3,215 bits por peso permite alojar un modelo de ~26.000 millones de parámetros en equipos con memoria unificada de 16-24 GB, algo inviable con pesos BF16 (que ocuparían unos 53 GB).

La información pública disponible es escasa: la model card solo documenta el proceso de cuantización y el desglose de almacenamiento, sin describir arquitectura, datos de entrenamiento, benchmarks ni licencia. Esta ficha refleja esa limitación de forma explícita y marca como "no disponible" todo dato no confirmado por las fuentes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (el modelo base se etiqueta como `inkling2_loop`; no se documenta la arquitectura interna) |
| Parametros totales | 26.388.641.280 (lenguaje) + 318 M (visión) = 26.707 M lógicos |
| Parametros activos | No disponible (no se confirma que sea MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Mixta: affine 2-bit grupo 64 (91,592 %), affine 8-bit grupo 64 (5,887 %), BF16 (2,387 %), FP32 (0,133 %); promedio efectivo 3,215 bits/peso |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors en formato MLX (librería `mlx`); repo de 10,8 GB |
| Modelo base | thinkingmachines/Inkling-2-Mini |
| Herramienta de cuantizacion | oQ (oMLX v0.8.2), cuantización de precisión mixta |
| Modalidad | Texto + visión (incluye torre visual de 0,318 B) |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura del modelo base en la documentación proporcionada. La etiqueta `inkling2_loop` sugiere algún mecanismo de bucle o recurrencia en la denominación interna, pero no se confirma ni el tipo de transformer, ni si emplea atención lineal, mezcla de expertos o capas recurrentes. Tampoco se documentan el volumen de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF, DPO o ajuste por preferencias.

Lo que sí está documentado es el proceso de compresión. oQ aplica una política de precisión mixta que asigna 2 bits (con cuantización affine y tamaño de grupo 64) al 91,592 % de los pesos, reservando 8 bits para el 5,887 %, BF16 para el 2,387 % y FP32 para el 0,133 %. Esta estratificación busca preservar la fidelidad numérica en tensores sensibles (posiblemente embeddings, cabezas de salida o normalizaciones) mientras comprime agresivamente el grueso de las matrices. El resultado son 9,995 GiB de almacenamiento para 26,707 mil millones de pesos lógicos, es decir, 3,215 bits por peso de media. La torre visual ocupa 0,637 GB (0,593 GiB) y el modelo de lenguaje 10,096 GB (9,402 GiB).

## Capacidades

- Generación de texto autoregresiva: el modelo base es un modelo de lenguaje de ~26 B, por lo que se le presupone capacidad de generación y continuación de texto, aunque no se detallan tareas específicas.
- Procesamiento de imágenes: la presencia de una torre visual de 318 M de parámetros confirma que el modelo es multimodal (visión-lenguaje), aunque no se documentan las tareas concretas (VQA, OCR, captioning).
- Capacidades multilingües: no disponibles; no se declara lista de idiomas.
- Tool calling / function calling: no documentado.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Modo de razonamiento explícito (thinking): no documentado.
- Capacidades de código y matemáticas: no documentadas.

## Casos de uso

- Inferencia local en Apple Silicon: el caso de uso principal de esta distribución es ejecutar un modelo multimodal de ~26 B en un Mac con memoria unificada de 16-24 GB, aprovechando el backend MLX. El formato MLX y la compresión a 3,215 bits/peso están optimizados para este escenario.
- Prototipado de aplicaciones de visión-lenguaje en portátiles: al caber en equipos de consumo, permite desarrollar y depurar pipelines de descripción de imágenes o respuesta a preguntas visuales sin acceso a clústeres GPU.
- Evaluación de la degradación por cuantización: investigadores pueden comparar este checkpoint con el modelo base en BF16 para medir el impacto de la cuantización 2-bit mixta sobre tareas concretas de texto y visión.
- Despliegue de asistentes conversacionales con contexto visual en entornos con restricciones de memoria: útil en escenarios de escritorio donde no se dispone de GPU dedicada.
- Investigación sobre compresión de modelos: el desglose de bits por componente sirve como referencia para estudiar políticas de precisión mixta en modelos multimodales.
- Generación de texto asistida en local para tareas de redacción o resumen, siempre que se valide previamente la calidad frente al modelo original, dado que no hay benchmarks publicados.
- Docencia y experimentación: permite a estudiantes ejecutar un modelo de escala media en hardware asequible para prácticas de inferencia y cuantización.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/memoria unificada estimada: ~10 GB para los pesos en el formato cuantizado (9,995 GiB), más overhead de activaciones y caché KV; en la práctica, se recomienda un mínimo de 16 GB de memoria unificada para contexto corto y 24 GB o más para contextos largos.
- Plataforma: exclusivamente Apple Silicon con MLX (M1, M2, M3, M4 y variantes Pro/Max/Ultra). El formato safetensors MLX no es cargable directamente en vLLM, TGI o llama.cpp sin conversión.
- GPU NVIDIA: no aplicable de forma nativa; requeriría conversión a otro formato, no documentada por el autor.
- GPU de consumo: no cabe en GPUs de 8-12 GB por el tamaño del checkpoint; en una RTX 4090 (24 GB) cabría en teoría tras conversión, pero no hay soporte MLX en CUDA.
- Opciones de despliegue: MLX (librería `mlx` y ecosistema oMLX); no se documentan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles; dependerán del chip Apple concreto y de la longitud de contexto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Inkling-2-Mini-oQ2e (este) | 26,7 B lógicos (3,215 bits/peso) | No disponible | MLX safetensors | No disponible | Hugging Face, 0 descargas |
| thinkingmachines/Inkling-2-Mini (base) | No disponible (presumiblemente ~26 B en BF16) | No disponible | No disponible | No disponible | Hugging Face |
| Alternativas de ~24-32 B en 2-4 bits para Apple Silicon | No disponible | No disponible | MLX / GGUF | Variable | No disponible |

No se dispone de datos de benchmarks ni de especificaciones del modelo base que permitan una comparación cuantitativa fiable con alternativas concretas.

## Limitaciones y advertencias

- La cuantización a 2 bits en el 91,6 % de los pesos implica una degradación de calidad no cuantificada: no hay benchmarks que comparen este checkpoint con el modelo base, por lo que la pérdida de precisión es desconocida.
- La licencia no está declarada; no se puede asumir uso comercial sin verificar la licencia del modelo base thinkingmachines/Inkling-2-Mini.
- El repositorio tiene 0 descargas y 0 likes, y fue creado y actualizado en el mismo intervalo de dos minutos: no hay evidencia de validación por parte de la comunidad.
- El formato MLX limita el despliegue a Apple Silicon; no es portable a CUDA sin conversión adicional no documentada.
- No se documentan idiomas soportados, sesgos conocidos ni tasas de alucinación.
- Al ser una distribución derivada no oficial, no hay garantías de soporte, mantenimiento ni corrección de errores por parte del autor original.
- La model card no incluye instrucciones de uso, plantilla de chat ni configuración de generación recomendada, lo que dificulta la reproducibilidad.
- Riesgo de alucinación: inherente a los modelos de lenguaje; sin datos específicos del modelo base, debe asumirse un riesgo estándar y validar las salidas en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/g-oQ/Inkling-2-Mini-oQ2e
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- Herramienta de cuantización oQ (oMLX): https://github.com/jundot/omlx
