# csrstka/Inkling-2-Mini-oQ6e-fp16

## Resumen

Inkling-2-Mini-oQ6e-fp16 es una cuantización mixta del modelo Inkling-2-Mini, publicada por el usuario csrstka en Hugging Face. Se trata de un checkpoint convertido con oQ (oMLX v0.8.1), una herramienta de cuantización de precisión mixta orientada al ecosistema MLX de Apple, por lo que su formato de pesos y su librería de inferencia están ligados a hardware Apple Silicon. El repositorio ocupa 18,5 GB y contiene 26.388.646.400 parámetros en el modelo de lenguaje, más un componente de visión de 0,318B de parámetros.

La particularidad del checkpoint es su estrategia de cuantización heterogénea: la mayor parte de los pesos (76,3%) se almacena en NVFP4 con grupo de 16, mientras que bloques seleccionados se conservan en affine 6-bit y 8-bit, y una fracción pequeña permanece en BF16, FP16 y FP32. El resultado es una media efectiva de 5,543 bits por peso, lo que reduce el espacio de almacenamiento hasta 17,232 GiB manteniendo capas sensibles en mayor precisión.

No se dispone de información sobre el modelo base original (autor, arquitectura, datos de entrenamiento, licencia o idiomas), ya que la model card únicamente documenta el proceso de cuantización. La relevancia de esta publicación es, por tanto, operativa: permite ejecutar un modelo de ~26B parámetros con capacidades multimodales en equipos Apple Silicon con memoria unificada, algo inviable con el checkpoint en precisión completa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el modelo base no se documenta; el checkpoint usa `inkling2_loop` como tag) |
| Parametros totales | 26.388.646.400 (language model) + 0,318B (vision) = 26.707B logicos |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | NVFP4 grupo 16 (76,327%), affine 6-bit grupo 64 (15,265%), affine 8-bit grupo 64 (5,887%), BF16 (1,190%), FP16 (0,005%), FP32 (1,325%); media efectiva 5,543 bits/peso |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (MLX), cuantizacion mixta oQ |
| Tamano del repo | 18,5 GB (17,232 GiB) |
| Libreria de inferencia | MLX |
| Fecha de publicacion | 2026-11-21 |

## Arquitectura y entrenamiento

La información disponible no describe la arquitectura del modelo base Inkling-2-Mini: no se especifica si es un transformer denso, un MoE, un modelo híbrido o si incorpora mecanismos de atención lineal. El tag `inkling2_loop` sugiere alguna forma de procesamiento recurrente o iterativo, pero no hay documentación que lo confirme. Tampoco se detallan los datos de entrenamiento, el número de tokens, la composición del corpus ni si hubo fases de RLHF, DPO u otro ajuste por preferencias.

Lo que sí está documentado es el proceso de cuantización. oQ (oMLX v0.8.1) aplica precisión mixta asignando formatos distintos según la sensibilidad de cada tensor: el grueso de los pesos va en NVFP4 con grupo de 16 (4,50 bits efectivos), una porción relevante en affine 6-bit y 8-bit con grupo de 64 (6,50 y 8,50 bits efectivos), y se preservan en BF16, FP16 y FP32 las capas o componentes críticos (0,318B en BF16 y 0,354B en FP32, probablemente normas, embeddings o cabezas de salida). El componente de visión (0,318B de parámetros, 1,186 GiB) se almacena aparte del modelo de lenguaje.

## Capacidades

- Generación de texto y razonamiento: el checkpoint incluye el modelo de lenguaje completo de 26,388B parámetros, por lo que conserva las capacidades del modelo base (no documentadas en detalle).
- Procesamiento de visión: el checkpoint incorpora un módulo de visión de 0,318B parámetros (1,186 GiB), lo que indica capacidades multimodales imagen-texto.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Modo thinking, audio u otras capacidades especiales: no disponible en la información proporcionada.

## Casos de uso

- Inferencia local en Apple Silicon: el checkpoint está en formato MLX y ocupa 17,232 GiB, por lo que puede cargarse en Macs con memoria unificada de 24 GB o superior, permitiendo ejecutar un modelo de ~26B parámetros sin GPU dedicada.
- Prototipado de aplicaciones multimodales en local: al incluir módulo de visión, sirve para experimentar con pipelines imagen-texto en entornos de desarrollo sobre macOS sin depender de APIs externas.
- Evaluación de técnicas de cuantización mixta: el repositorio documenta con precisión la distribución de bits por tensor, lo que lo convierte en un caso de estudio útil para investigar el impacto de NVFP4 frente a affine 6/8-bit en la calidad de salida.
- Despliegue de asistentes conversacionales offline: un modelo de este tamaño cuantizado a ~5,5 bits permite mantener conversaciones multi-turno en local con requisitos de memoria moderados para su escala.
- Generación de código y texto en estaciones de trabajo Mac: para desarrolladores que trabajan en macOS y quieren un modelo de gran tamaño integrado en su flujo de trabajo sin salir del ecosistema MLX.
- Investigación en eficiencia de memoria: la separación entre pesos NVFP4 y capas en FP32/BF16 permite medir empíricamente qué componentes requieren mayor precisión, útil para diseñar futuras estrategias de cuantización.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM/memoria unificada estimada: 17,232 GiB de pesos, más overhead de activaciones y caché KV; se recomienda un mínimo de 24 GB de memoria unificada y 32 GB para contexto largo.
- GPU recomendadas: hardware Apple Silicon (series M1/M2/M3/M4, especialmente variantes Pro, Max y Ultra). No es compatible con CUDA de forma nativa al estar en formato MLX.
- ¿Cabe en consumer GPU? No en GPUs NVIDIA de consumo en su formato actual; en Apple Silicon sí, en configuraciones con 24 GB o más de memoria unificada.
- Opciones de despliegue: MLX (librería nativa), oMLX. No se documenta compatibilidad con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponible en la información proporcionada.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye datos sobre el modelo base ni sobre alternativas comparables en parámetros, contexto, rendimiento o licencia.

## Limitaciones y advertencias

- La model card no documenta el modelo base: se desconoce el autor original, la arquitectura exacta, los datos de entrenamiento y las capacidades reales más allá de la presencia de un módulo de visión.
- Licencia no disponible: no se puede confirmar si el uso comercial está permitido; es imprescindible verificar la licencia del modelo original antes de cualquier despliegue en producción.
- Idiomas no documentados: no hay garantía sobre el rendimiento en castellano u otros idiomas distintos del inglés (si el modelo base está orientado a inglés).
- La cuantización mixta a 5,543 bits/peso puede degradar la calidad respecto al checkpoint original, especialmente en tareas de razonamiento matemático o código; no se han publicado evaluaciones comparativas.
- Compatibilidad limitada al ecosistema MLX/Apple Silicon: no es directamente utilizable en GPUs NVIDIA, AMD o TPUs sin reconversión.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: sin validación comunitaria ni informes de uso en producción.
- Riesgo de alucinación y sesgos: no evaluado en la información disponible.

## Enlaces

- Hugging Face: https://huggingface.co/csrstka/Inkling-2-Mini-oQ6e-fp16
- Herramienta de cuantización oQ (oMLX): https://github.com/jundot/omlx
