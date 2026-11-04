# latrompeababar/Qwen3.5-9B-oQ2.5e

## Resumen

Qwen3.5-9B-oQ2.5e es una cuantización mixta del modelo Qwen3.5-9B, publicada por el usuario latrompeababar en HuggingFace. No se trata de un modelo entrenado desde cero, sino de una conversión de pesos a formatos de baja precisión mediante la herramienta oQ (oMLX v0.7.3), orientada a la inferencia en Apple Silicon a través de la librería MLX. El checkpoint resultante ocupa 4,8 GB en disco, frente a los aproximadamente 18,8 GB que ocuparía la versión en BF16, lo que supone una reducción de aproximadamente el 75 % del espacio.

El modelo base, Qwen3.5-9B, pertenece a la familia Qwen 3.5 desarrollada por Alibaba. Según los datos de safetensors, el checkpoint contiene 9.409.813.744 parámetros, de los cuales 8.954 millones corresponden al modelo de lenguaje y 456 millones a un componente de visión, lo que indica que el modelo base es multimodal (image-text-to-text). La cuantización emplea una estrategia de precisión mixta: capas sensibles se mantienen en 5 bits o incluso BF16, mientras que otras se comprimen a 2 o 3 bits, dando lugar a una media efectiva de 4,028 bits por peso.

La relevancia de esta ficha radica en que permite ejecutar un modelo de casi 9,4 mil millones de parámetros con capacidades multimodales en equipos con memoria unificada moderada, algo imposible con los pesos originales. No obstante, se trata de una publicación con cero descargas y cero likes en el momento de la consulta, sin model card completa, sin licencia declarada y sin resultados de benchmarks, por lo que debe evaluarse con cautela antes de usarla en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Qwen 3.5), con torre de visión; detalles exactos no disponibles |
| Parametros totales | 9.409.813.744 (8.954 M en el modelo de lenguaje, 456 M en visión) |
| Parametros activos | No aplica (no es MoE según los datos disponibles) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Cuantización mixta oQ: affine 2-bit grupo 64, affine 3-bit grupo 128, affine 3-bit grupo 64, affine 5-bit grupo 64 y BF16; media efectiva 4,028 bits/peso |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors (formato MLX), librería mlx |
| Tamano del repositorio | 4,8 GB (4,413 GiB de pesos) |
| Fecha de publicacion | 2026-11-04 |

## Arquitectura y entrenamiento

El checkpoint es una conversión de pesos, no un entrenamiento. La model card indica que se generó con oQ (oMLX v0.7.3), una herramienta de cuantización de precisión mixta para MLX. La distribución de bits es la siguiente: 2,606 mil millones de pesos en affine 2-bit con grupo 64 (27,69 % del total, 2,50 bits efectivos); 3,910 mil millones en affine 3-bit con grupo 128 (41,56 %, 3,25 bits efectivos); 1,017 mil millones en affine 3-bit con grupo 64 (10,81 %, 3,50 bits efectivos); 1,420 mil millones en affine 5-bit con grupo 64 (15,09 %, 5,50 bits efectivos); y 457 millones en BF16 (4,86 %, 16 bits efectivos). El resultado es una media de 4,028 bits por peso.

La arquitectura subyacente corresponde a Qwen3.5-9B, un transformer con un módulo de visión de 456 millones de parámetros, lo que confirma que el modelo base acepta entradas de imagen además de texto. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF, DPO u otras. Tampoco se documentan innovaciones técnicas del modelo base en la información proporcionada. La innovación de esta publicación concreta es la asignación no uniforme de bits: las capas preservadas en BF16 y 5 bits sugieren que el autor identificó módulos críticos para mantener la calidad, mientras que el grueso de los pesos se comprime a 2 y 3 bits.

## Capacidades

- Generación de texto y razonamiento: heredadas del modelo base Qwen3.5-9B, aunque no se documentan evaluaciones específicas tras la cuantización.
- Procesamiento de imágenes: la presencia de una torre de visión de 456 millones de parámetros indica capacidad multimodal de entrada de imagen.
- Conversación multi-turno: el modelo base está diseñado como modelo de chat, pero no se confirma en la model card.
- Tool calling y function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible; el modelo base Qwen suele ser multilingüe, pero no se declara en esta publicación.
- Modo thinking: no disponible.
- Inferencia en Apple Silicon: capacidad operativa confirmada por el uso de MLX y del formato oQ.

## Casos de uso

- Prototipado local en Mac con memoria unificada: el checkpoint de 4,8 GB permite cargar un modelo de 9,4 mil millones de parámetros en equipos Apple Silicon de gama media, algo inviable con los pesos BF16 de aproximadamente 18,8 GB. Adecuado para experimentar con un modelo multimodal sin infraestructura GPU dedicada.
- Análisis de imágenes en local: la torre de visión permite procesar capturas, documentos escaneados o fotografías en un portátil, manteniendo los datos fuera de servicios en la nube. Útil en entornos con requisitos de privacidad.
- Asistente de escritorio offline: integrado en aplicaciones macOS mediante MLX, puede gestionar conversaciones y tareas de texto sin conexión, aprovechando la reducción de memoria para convivir con otras aplicaciones.
- Evaluación de técnicas de cuantización: este checkpoint sirve como referencia para estudiar el impacto de la precisión mixta (2 a 5 bits) en la calidad de un modelo de 9B, comparándolo con el original en BF16.
- Generación de texto en entornos con VRAM limitada: en GPUs de consumo con 8 GB, la versión de 4,8 GB deja margen para el contexto y el runtime, aunque MLX está optimizado para Apple Silicon y no para CUDA.
- Docencia y experimentación académica: permite a estudiantes ejecutar un modelo multimodal de tamaño medio en hardware asequible para prácticas de inferencia y evaluación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de calidad (MMLU, HumanEval, GSM8K, MMMU u otras) ni comparaciones con el modelo base en BF16, por lo que no es posible cuantificar la degradación introducida por la cuantización a 2 y 3 bits.

## Requisitos de hardware

- VRAM/memoria estimada para inferencia: aproximadamente 4,8 GB para los pesos; con overhead de runtime y contexto, se recomienda un mínimo de 8 GB de memoria unificada.
- GPU recomendadas: Apple Silicon (series M1, M2, M3 y M4, especialmente variantes Pro, Max y Ultra) por el uso de MLX. No está pensado para CUDA.
- GPU de consumo: cabe en Mac con 8 GB o más de memoria unificada; en GPUs NVIDIA de consumo el formato MLX no es directamente compatible.
- Opciones de despliegue: MLX (librería declarada) y oMLX; no se documenta compatibilidad con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.5-9B-oQ2.5e | 9,41 B (8,95 B LM + 0,46 B visión) | No disponible | Mixta 2-5 bits + BF16, media 4,028 bits | No disponible | HuggingFace, 0 descargas |
| Qwen3.5-9B (original) | 9,41 B | No disponible | BF16 | No disponible | Presumiblemente en HuggingFace, no verificado |
| Qwen2.5-VL-7B | 7 B aprox. | 128 K (según documentación pública de Qwen2.5-VL) | BF16, GPTQ, AWQ | Apache 2.0 (según documentación pública) | Amplia |

La comparación con Qwen2.5-VL-7B se incluye como referencia de categoría (modelo multimodal de tamaño similar), pero los datos del modelo base Qwen3.5-9B no están verificados en la información disponible y no se dispone de métricas para comparar rendimiento.

## Limitaciones y advertencias

- Licencia no declarada: no se especifica si permite uso comercial; en ausencia de licencia explícita, no debe asumirse ningún derecho de uso.
- Sin benchmarks: no hay evidencia publicada sobre la degradación de calidad tras la cuantización mixta a 2 y 3 bits, que en un 27,69 % de los pesos es de solo 2 bits.
- Riesgo de alucinación: inherente a los modelos de lenguaje; no se documenta mitigación específica.
- Sesgos: no documentados; se heredan los del modelo base, que no se describe.
- Idiomas: no se declara qué idiomas soporta; el rendimiento en castellano es desconocido.
- Contexto: se desconoce la longitud máxima de contexto y si la cuantización la afecta.
- Compatibilidad: formato MLX, limitado a Apple Silicon; no utilizable directamente en CUDA, ROCm ni CPU convencional.
- Madurez: publicación con cero descargas y cero likes, creada y actualizada el mismo día, sin pipeline declarado ni discusión comunitaria; no es una fuente validada.
- Model card incompleta: no incluye instrucciones de uso, ejemplos de código ni limitaciones del autor.
- Fecha futura: el campo de creación (2026-11-04) es posterior a la fecha habitual de consulta, lo que puede indicar un error de metadatos o una publicación programada; conviene verificarlo.

## Enlaces

- HuggingFace: https://huggingface.co/latrompeababar/Qwen3.5-9B-oQ2.5e
- Herramienta de cuantización oQ (oMLX): https://github.com/jundot/omlx
- Modelo base Qwen3.5-9B: no disponible en la información proporcionada
- Paper o blog del modelo base: no disponible en la información proporcionada
- Repositorio o demo adicional: no disponible en la información proporcionada
