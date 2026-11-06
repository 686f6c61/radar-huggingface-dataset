# jancirnodziewiaty/Gemma-4-Dark-Thoughts-V2-31B-oQ4e-mtp

## Resumen

Gemma-4-Dark-Thoughts-V2-31B-oQ4e-mtp es una cuantización mixta del modelo Ateron/Gemma-4-Dark-Thoughts-V2-31B, un fine-tune de la familia Gemma 4 orientado a razonamiento interno ("dark thoughts"). El artefacto lo publica el usuario jancirnodziewiaty y está pensado para su uso con MLX, el framework de Apple para ejecutar modelos en silicio unificado (chips M-series). No es un modelo nuevo, sino una redistribución optimizada del checkpoint original.

La pieza técnica central es la cuantización mixta oQ (oMLX v0.7.3), que asigna distintos anchos de bit por tensor según su sensibilidad: la mayoría de pesos quedan en 4 bits afines con grupo de 64, una porción relevante en 5 y 6 bits, y una fracción pequeña se mantiene en BF16. El resultado es un checkpoint de 31.742 millones de parámetros que ocupa 19,09 GiB con un promedio efectivo de 5,167 bits por peso, lo que permite alojarlo en equipos con memoria unificada de 24-32 GB.

El nombre incluye el sufijo "mtp", que corresponde a una cabeza de predicción multi-token (0,47B parámetros). El modelo incorpora además un codificador visual de 0,57B parámetros, por lo que es multimodal. La model card no documenta el entrenamiento del modelo base, los idiomas soportados ni la licencia, lo que limita la evaluación de su idoneidad en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (Gemma 4) con cabeza MTP; pesos cuantizados en formato oQ (afín, grupo 64) |
| Parametros totales | 31.742.607.472 (31,74B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Mixta: 4 bits (68,575%), 5 bits (27,280%), 6 bits (0,867%), BF16 (3,278%); promedio 5,167 bits/peso; grupo 64 |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors (MLX), librería `mlx` |
| Tamano del repositorio | 20,5 GB (19,094 GiB) |
| Desglose de componentes | Lenguaje 30,704B / 17,159 GiB; visión 0,570B / 1,061 GiB; cabeza MTP 0,470B / 0,875 GiB |
| Modelo base | Ateron/Gemma-4-Dark-Thoughts-V2-31B |
| Fecha de creacion | 2026-10-04 (actualizado 2026-11-02) |

## Arquitectura y entrenamiento

El checkpoint es una cuantización del fine-tune Ateron/Gemma-4-Dark-Thoughts-V2-31B, que a su vez deriva de la arquitectura Gemma 4 de Google. Se trata de un transformer multimodal con tres bloques diferenciados: el modelo de lenguaje (30,704B parámetros), un codificador de visión (0,570B) y una cabeza de predicción multi-token o MTP (0,470B). La presencia de la cabeza MTP sugiere soporte para decodificación especulativa o predicción de varios tokens por paso, aunque la model card no detalla cómo se activa ni su impacto en latencia.

El proceso de cuantización lo realiza oQ, la herramienta de cuantización mixta de oMLX (versión 0.7.3), que decide el ancho de bit por tensor. Los pesos se almacenan con cuantización afín de grupo 64: el 68,575% de los parámetros lógicos queda en 4 bits (4,50 bits/peso efectivos), el 27,280% en 5 bits (5,50), el 0,867% en 6 bits (6,50) y el 3,278% restante se preserva en BF16 (16 bits). La model card indica que la versión actual se recuantizó el 2026-11-02 y recomienda volver a descargar si se tenía una copia anterior.

No hay información sobre los datos de entrenamiento del modelo base, el número de tokens, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO. Tampoco se documenta qué capas o módulos se benefician de los anchos de 5 y 6 bits, más allá de la distribución agregada.

## Capacidades

- Generación de texto y razonamiento: heredadas del fine-tune Gemma 4 orientado a "dark thoughts", presumiblemente con modo de razonamiento interno, aunque la model card no lo confirma.
- Procesamiento de imágenes: el checkpoint incluye un codificador visual de 0,570B parámetros, por lo que admite entradas multimodales.
- Predicción multi-token: la cabeza MTP de 0,470B parámetros está presente en el checkpoint y puede emplearse para decodificación especulativa.
- Tool calling y function calling: no documentado en la información disponible.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingües: no documentadas.
- Modo thinking explícito: no documentado.

## Casos de uso

- Inferencia local en Mac con silicio Apple: el formato MLX y el tamaño de 19,09 GiB permiten ejecutar el modelo en equipos con 24-32 GB de memoria unificada, útil para prototipado y desarrollo sin GPU dedicada.
- Análisis de documentos con imágenes: al incluir codificador visual, puede emplearse para extraer información de capturas, diagramas o PDF renderizados en flujos locales.
- Experimentación con decodificación especulativa: la cabeza MTP permite medir la ganancia de throughput frente a decodificación autoregresiva estándar en MLX.
- Evaluación de fine-tunes de razonamiento: sirve como banco de pruebas para comparar el comportamiento de un modelo "dark thoughts" cuantizado frente a su versión BF16.
- Desarrollo de asistentes técnicos offline: el tamaño contenido y el formato MLX facilitan prototipos de asistencia en local sin depender de APIs externas.
- Investigación sobre cuantización mixta: la distribución detallada de bits permite estudiar el impacto de distintos anchos por tensor en tareas de razonamiento y visión.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/memoria unificada estimada: 19,09 GiB de pesos más overhead de activaciones y caché KV; se recomienda un mínimo de 24 GB y, para contextos largos, 32 GB o más.
- GPU recomendadas: no aplica de forma nativa; el checkpoint es MLX y está orientado a Apple Silicon (M1/M2/M3/M4 Pro, Max y Ultra). Para CUDA sería necesario reconvertir los pesos.
- Cabe en GPU de consumo: en equipos Apple con memoria unificada de 24-32 GB; en GPUs NVIDIA de consumo no es directamente utilizable sin conversión.
- Opciones de despliegue: MLX (`mlx-lm`), mlx-community y herramientas compatibles con oMLX. No hay soporte documentado para vLLM, llama.cpp, Ollama o TGI con este formato.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Gemma-4-Dark-Thoughts-V2-31B-oQ4e-mtp | 31,74B | No disponible | safetensors MLX (oQ mixto) | No disponible | Cuantización mixta 4/5/6/BF16, incluye visión y MTP |
| Ateron/Gemma-4-Dark-Thoughts-V2-31B | 31,74B | No disponible | safetensors (BF16) | No disponible | Modelo base sin cuantizar; mayor huella de memoria |
| Otros fine-tunes de Gemma 4 de ~31B | ~31B | Variable | Variable | Variable | No disponible |

## Limitaciones y advertencias

- Licencia no especificada: no se puede confirmar si el uso comercial está permitido; conviene consultar la licencia del modelo base Ateron/Gemma-4-Dark-Thoughts-V2-31B y la de Gemma 4.
- Idiomas no documentados: se desconoce el soporte multilingüe real.
- Riesgo de alucinación: inherente a los modelos de razonamiento fine-tuneados; no hay evaluaciones publicadas que lo cuantifiquen.
- Sesgos: no documentados en la model card.
- Formato MLX exclusivo: no es portable a CUDA sin reconversión; limita el despliegue en servidores con GPU NVIDIA.
- Cuantización mixta: la pérdida de precisión respecto al BF16 no está medida; puede degradar tareas sensibles como matemáticas o visión fina.
- Cabeza MTP: no se documenta cómo activarla ni su compatibilidad con las herramientas MLX estándar.
- Repositorio con 0 likes y 351 descargas: ecosistema reducido, sin validación comunitaria.
- Model card mínima: sin información sobre entrenamiento, contexto o evaluación.

## Enlaces

- Hugging Face: https://huggingface.co/jancirnodziewiaty/Gemma-4-Dark-Thoughts-V2-31B-oQ4e-mtp
- Modelo base: https://huggingface.co/Ateron/Gemma-4-Dark-Thoughts-V2-31B
- Herramienta oQ / oMLX: https://github.com/jundot/omlx
