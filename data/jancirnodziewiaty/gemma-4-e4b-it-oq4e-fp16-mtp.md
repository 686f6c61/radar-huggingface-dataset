# jancirnodziewiaty/gemma-4-E4B-it-oQ4e-fp16-mtp

## Resumen

`gemma-4-E4B-it-oQ4e-fp16-mtp` es una cuantización mixta del modelo Gemma 4 E4B instructivo, publicada por el usuario jancirnodziewiaty en Hugging Face. El checkpoint está pensado para su uso con MLX, el framework de Apple para ejecutar modelos en silicio de la serie M, y emplea la herramienta oQ (oMLX v0.7.3) para aplicar cuantización de precisión mixta con un promedio efectivo de 6,514 bits por peso sobre un total de 8.019.880.782 parámetros.

El modelo conserva la estructura multimodal del Gemma 4 E4B original: incluye un modelo de lenguaje de 7,469B parámetros, un codificador de visión de 0,167B, un codificador de audio de 0,305B y una cabeza MTP (multi-token prediction) de 0,079B. El resultado es un checkpoint de 6,6 GB que combina capas cuantizadas a 4, 5, 6 y 8 bits con componentes en BF16, FP16 y FP32, lo que permite ejecutar un modelo de ~8B parámetros multimodales en hardware Apple con memoria unificada moderada.

La relevancia de esta ficha es acotada: se trata de una cuantización de terceros, no de un modelo oficial de Google, sin model card detallada, sin benchmarks publicados y sin licencia declarada en el repositorio. Para desarrolladores que trabajan en el ecosistema MLX y necesitan un Gemma 4 E4B cuantizado con decodificación especulativa vía MTP, puede ser un artefacto útil; para producción o evaluación rigurosa, conviene acudir al checkpoint original de Google.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (lenguaje + visión + audio) con cabeza MTP; no se detalla la variante exacta en la información disponible |
| Parametros totales | 8.019.880.782 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Cuantización mixta afín: 4-bit grupo 64 (68,24% de pesos), 5-bit grupo 64 (21,85%), 6-bit grupo 64 (3,02%), 8-bit grupo 64 (0,008%), más BF16 (0,98%), FP16 (0,007%), FP32 (5,89%) e I64 (0,003%); promedio efectivo 6,514 bits/peso |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors, librería MLX |

## Arquitectura y entrenamiento

La información disponible no describe la arquitectura interna del Gemma 4 E4B original más allá de su naturaleza multimodal. El checkpoint cuantizado desglosa los componentes en: modelo de lenguaje (7,469B parámetros lógicos, 4,482 GB), visión (0,167B, 0,669 GB), audio (0,305B, 1,219 GB) y cabeza MTP (0,079B, 0,159 GB). La presencia de un codificador de visión y otro de audio confirma que el modelo base acepta entradas de imagen y sonido además de texto, aunque no se detallan las resoluciones, muestreos o arquitecturas concretas de esos codificadores.

El proceso de cuantización lo realiza oQ (oMLX v0.7.3) con precisión mixta: la mayor parte de los pesos se almacena en 4 bits con grupo de 64 (2,867 GiB), una fracción significativa en 5 bits (1,122 GiB) y una porción menor en 6 bits (0,183 GiB). Los componentes en FP32 (1,759 GiB) corresponden probablemente a capas de normalización y otros tensores sensibles a la precisión. La cabeza MTP se conserva en BF16 (0,146 GiB), lo que sugiere que se mantiene funcional para decodificación especulativa o predicción multi-token. No se dispone de información sobre el dataset de entrenamiento, el número de tokens, ni si hubo RLHF, DPO u otras etapas de alineamiento en el modelo original.

## Capacidades

- Generación de texto y razonamiento: el modelo de lenguaje de 7,469B parámetros soporta conversación multi-turno y tareas de razonamiento general, aunque no se han publicado evaluaciones específicas en la información disponible.
- Procesamiento de visión: el codificador de visión de 0,167B parámetros permite entrada de imágenes, presumiblemente para tareas de descripción, VQA o extracción de información visual.
- Procesamiento de audio: el codificador de audio de 0,305B parámetros habilita entrada de audio, probablemente para transcripción o comprensión de habla.
- Decodificación especulativa: la cabeza MTP de 0,079B parámetros en BF16 está diseñada para predecir múltiples tokens y acelerar la generación, aunque no se documenta la tasa de aceptación ni la ganancia de throughput.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Modo thinking: no disponible en la información proporcionada.

## Casos de uso

- Inferencia local en Mac con memoria unificada: el checkpoint de 6,6 GB cabe en equipos Apple Silicon con 16 GB o más de memoria unificada, lo que permite ejecutar un modelo multimodal de ~8B parámetros en un portátil sin GPU dedicada. Se usaría con la librería MLX y el runtime de oMLX.
- Prototipado de asistentes multimodales: al incluir codificadores de visión y audio, el modelo puede emplearse para construir prototipos que reciban imágenes o audio además de texto, por ejemplo para describir capturas de pantalla o transcribir notas de voz en una aplicación de escritorio.
- Aceleración de generación con MTP: la cabeza de multi-token prediction permite experimentar con decodificación especulativa en MLX, comparando el throughput frente al checkpoint sin MTP en tareas de generación larga.
- Evaluación de cuantización mixta: investigadores que estudien el impacto de la cuantización de precisión mixta (4/5/6/8 bits con grupo 64) pueden usar este checkpoint como caso de estudio frente al Gemma 4 E4B en BF16, midiendo degradación en tareas de razonamiento y percepción.
- Desarrollo de aplicaciones offline en macOS: al no requerir conexión ni servicios en la nube, el modelo sirve para aplicaciones de escritorio que procesen texto, imagen o audio de forma local, con las garantías de privacidad que ello implica.
- Fines educativos y de investigación: el desglose detallado de bits por componente que acompaña al checkpoint lo hace útil para explicar cómo se distribuye la precisión en un modelo multimodal cuantizado y qué componentes consumen más almacenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM/memoria estimada para inferencia: el checkpoint ocupa 6,6 GB en disco; en memoria, el peso de los tensores ronda los 6,08 GiB, por lo que se recomienda un mínimo de 8 GB de memoria unificada, y 16 GB para dejar margen a la caché KV y a las entradas multimodales.
- GPU recomendadas: hardware Apple Silicon (series M1, M2, M3, M4 y sus variantes Pro, Max y Ultra) por el uso de MLX. No se documenta soporte para GPU NVIDIA o AMD en la información disponible.
- ¿Cabe en GPU de consumo? Sí, en equipos Apple con memoria unificada de 16 GB o superior. No se dispone de información sobre su ejecución en GPUs de consumo NVIDIA (RTX 4090, etc.) con este formato MLX.
- Opciones de despliegue: MLX y oMLX (herramienta de cuantización y runtime del autor). No se documenta compatibilidad con vLLM, llama.cpp, Ollama o TGI, dado que el formato es específico de MLX.
- Latencia y throughput: no disponibles. La cabeza MTP está pensada para mejorar la velocidad de decodificación, pero no se publican cifras de tokens por segundo ni de tasa de aceptación.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| gemma-4-E4B-it-oQ4e-fp16-mtp (este) | 8,02B | no disponible | no disponible | safetensors MLX | Hugging Face, 0 descargas |
| Gemma 4 E4B it (original de Google) | ~8B (estimado) | no disponible | no disponible en esta ficha | safetensors | Hugging Face (repo oficial de Google) |
| Otras cuantizaciones MLX de Gemma 4 E4B | ~8B | no disponible | según autor | safetensors MLX | Hugging Face |

No se dispone de datos de benchmarks ni de especificaciones detalladas de los modelos comparables en la información proporcionada, por lo que la comparación se limita a parámetros, formato y disponibilidad.

## Limitaciones y advertencias

- Licencia no declarada: el repositorio no indica licencia, lo que impide determinar si el uso comercial está permitido. Para producción, es imprescindible verificar la licencia del Gemma 4 E4B original de Google y la del checkpoint cuantizado.
- Cuantización de terceros: no es un artefacto oficial de Google; la precisión mixta aplicada por oQ puede degradar el rendimiento en tareas sensibles a la precisión, especialmente en razonamiento matemático y percepción multimodal.
- Sin benchmarks: no hay evaluaciones publicadas que cuantifiquen la pérdida de calidad respecto al modelo en BF16, ni datos de MMLU, HumanEval, GSM8K u otras pruebas.
- Riesgo de alucinación: inherente a los modelos de lenguaje de esta escala; no se documentan mitigaciones específicas ni tasas de error.
- Sesgos: no se dispone de información sobre sesgos conocidos ni sobre el proceso de alineamiento del modelo base.
- Limitaciones de contexto e idioma: se desconocen la longitud de contexto y los idiomas soportados; no se debe asumir un contexto largo ni cobertura multilingüe sin verificación.
- Especificidad de plataforma: el formato MLX limita su uso a hardware Apple Silicon; no es portable a ecosistemas CUDA o ROCm sin reconversión.
- Madurez del artefacto: 0 descargas y 0 likes en el momento de la consulta, creado y actualizado el mismo día (2026-11-02), sin historial de uso ni validación comunitaria.
- La cabeza MTP en BF16 no garantiza ganancias de velocidad sin una implementación de decodificación especulativa que la aproveche; no se documenta cómo activarla.

## Enlaces

- Hugging Face: https://huggingface.co/jancirnodziewiaty/gemma-4-E4B-it-oQ4e-fp16-mtp
- oQ / oMLX (herramienta de cuantización citada): https://github.com/jundot/omlx
- Gemma 4 E4B original de Google: no disponible en la información proporcionada
- Paper, blog o demo: no disponible en la información proporcionada
