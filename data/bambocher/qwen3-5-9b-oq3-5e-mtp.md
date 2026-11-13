# bambocher/Qwen3.5-9B-oQ3.5e-mtp

## Resumen

Qwen3.5-9B-oQ3.5e-mtp es una cuantización mixta del modelo Qwen3.5-9B, publicada por el usuario bambocher en Hugging Face. No se trata de un modelo entrenado desde cero, sino de un checkpoint derivado del modelo base Qwen3.5-9B de Alibaba, convertido al formato MLX mediante la herramienta oQ (oMLX v0.7.3) para su ejecución eficiente en hardware Apple Silicon. El resultado es un artefacto de 9.653 millones de parámetros lógicos que ocupa 5.285 GiB en disco gracias a una asignación de precisión variable por tensor.

La relevancia de esta ficha radica en que demuestra una técnica de cuantización mixta que combina bloques de 3, 4, 5 y 6 bits junto con capas en BF16, logrando un promedio efectivo de 4.703 bits por peso. Incluye además una cabeza MTP (multi-token prediction) de 0.243 mil millones de parámetros y un codificador visual de 0.456 mil millones, lo que indica que el modelo base es multimodal. Está pensado para desarrolladores que quieran ejecutar un modelo de casi 10 mil millones de parámetros en equipos con memoria unificada limitada.

El modelo se distribuye en formato safetensors con la librería MLX, lo que restringe su uso a entornos Apple (macOS con chip M-series). No se dispone de información sobre la licencia del checkpoint derivado ni sobre los idiomas soportados más allá de lo que se pueda inferir del modelo base original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Qwen3.5), con cabeza MTP y torre de visión; cuantización mixta MLX |
| Parametros totales | 9.653.104.368 (9.653B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Mixta: affine 3-bit, 4-bit, 5-bit y 6-bit (grupo 64) más capas en BF16; promedio efectivo 4.703 bits/peso |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

El checkpoint deriva de Qwen3.5-9B, un transformer denso de aproximadamente 9.653 millones de parámetros lógicos. La estructura incluye tres componentes diferenciados: el modelo de lenguaje (8.954B parámetros lógicos, 4.264 GiB en almacenamiento), una torre de visión (0.456B, 0.849 GiB) y una cabeza MTP de predicción multi-token (0.243B, 0.172 GiB). La presencia de la torre de visión confirma que el modelo base es multimodal, y la cabeza MTP sugiere soporte para decodificación especulativa o generación multi-token.

El proceso de cuantización, realizado con oMLX v0.7.3, asigna precisión de forma no uniforme: el 63.372% de los pesos (6.117B) se almacenan a 3 bits con grupo 64, el 16.837% (1.625B) a 4 bits, el 10.537% (1.017B) a 6 bits, el 4.171% (0.403B) a 5 bits y el 5.083% (0.491B) se mantienen en BF16. Esta distribución busca preservar la calidad en las capas más sensibles mientras comprime agresivamente el resto. No se dispone de información sobre los datos de entrenamiento del modelo base, el número de tokens, la composición del dataset ni si hubo RLHF o DPO.

## Capacidades

- Generación de texto y razonamiento: heredadas del modelo base Qwen3.5-9B, aunque no se detallan en la model card.
- Procesamiento visual: la presencia de una torre de visión de 0.456B parámetros indica capacidades multimodales de imagen a texto.
- Predicción multi-token: la cabeza MTP de 0.243B parámetros sugiere soporte para decodificación especulativa o generación de varios tokens por paso.
- Tool calling y function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Modo thinking, audio u otras capacidades especiales: no disponible en la información proporcionada.

## Casos de uso

- Inferencia local en Mac con memoria unificada: el checkpoint de 5.285 GiB cabe en equipos Apple Silicon con 16 GB o más de memoria unificada, permitiendo ejecutar un modelo de casi 10B parámetros sin GPU dedicada mediante la librería MLX.
- Prototipado de aplicaciones multimodales: la torre de visión integrada permite experimentar con tareas de imagen a texto en local, útil para demos y pruebas de concepto antes de escalar a infraestructura en la nube.
- Evaluación de técnicas de cuantización mixta: investigadores pueden comparar la calidad de este checkpoint (4.703 bits/peso promedio) frente al modelo original en BF16 para medir la degradación introducida por la compresión.
- Generación de texto asistida en escritorio: integrable en aplicaciones macOS nativas que usen MLX como backend de inferencia para tareas de redacción, resumen o respuesta a preguntas.
- Experimentación con decodificación especulativa: la cabeza MTP permite probar técnicas de generación multi-token en entornos de investigación con hardware Apple.
- Desarrollo de asistentes offline: al ejecutarse localmente sin conexión, es adecuado para escenarios con requisitos de privacidad donde los datos no deben salir del dispositivo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM/memoria unificada estimada: 5.285 GiB para los pesos; se recomienda al menos 8-10 GB de memoria unificada para acomodar pesos, caché KV y overhead del runtime.
- GPU recomendadas: hardware Apple Silicon (M1, M2, M3, M4 y variantes Pro/Max/Ultra) con memoria unificada suficiente. No es compatible con GPU NVIDIA o AMD al usar el formato MLX.
- Cabe en consumer GPU: no aplica en el sentido tradicional; cabe en Mac con 16 GB de memoria unificada o superior.
- Opciones de despliegue: MLX (librería nativa), oMLX. No se indica compatibilidad con vLLM, llama.cpp, Ollama o TGI, que no soportan el formato MLX de forma nativa.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Formato |
|---|---|---|---|---|---|
| Qwen3.5-9B-oQ3.5e-mtp (este) | 9.653B | no disponible | Mixta 3-6 bits + BF16 (4.703 bits/peso) | no disponible | safetensors MLX |
| Qwen3.5-9B (base) | ~9.653B | no disponible | BF16 original | no disponible | safetensors |
| Alternativas MLX de tamaño similar | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información sobre modelos comparables directos en la información proporcionada.

## Limitaciones y advertencias

- Cuantización agresiva: el 63.372% de los pesos están a 3 bits, lo que puede degradar la calidad en tareas sensibles respecto al modelo en BF16.
- Restricción de plataforma: el formato MLX solo se ejecuta en hardware Apple Silicon; no es portable a CUDA, ROCm ni CPU convencional sin reconversión.
- Licencia no especificada: al no indicarse la licencia del checkpoint derivado, no se puede garantizar el uso comercial; es necesario consultar la licencia del modelo base Qwen3.5-9B.
- Idiomas no documentados: se desconoce qué idiomas cubre el modelo base y en qué medida la cuantización afecta al rendimiento multilingüe.
- Riesgo de alucinación: inherente a los modelos de lenguaje; no se han publicado evaluaciones específicas para este checkpoint.
- Sesgos: no documentados en la model card; se heredan los del modelo base, que no se detallan.
- Repositorio con pocas descargas (40) y sin likes: indica escasa validación comunitaria; conviene verificar la integridad del checkpoint antes de usarlo en producción.
- Actualización reciente: el autor recomienda volver a descargar si se tenía una copia anterior a la requantización con oMLX v0.7.3.

## Enlaces

- Hugging Face: https://huggingface.co/bambocher/Qwen3.5-9B-oQ3.5e-mtp
- Repositorio de oQ/oMLX: https://github.com/jundot/omlx
