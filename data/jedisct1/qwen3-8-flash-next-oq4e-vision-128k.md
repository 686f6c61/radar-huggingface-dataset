# jedisct1/Qwen3.8-Flash-Next-oQ4e-Vision-128k

## Resumen

El modelo `jedisct1/Qwen3.8-Flash-Next-oQ4e-Vision-128k` es una conversión comunitaria no oficial del checkpoint `Qwen/Qwen3.8-Flash-Next-FP8` de Alibaba, adaptada para ejecutarse en Apple Silicon mediante la librería MLX-VLM. Se trata de un modelo multimodal de texto e imagen, con soporte de vídeo (aunque no validado), basado en una arquitectura de mezcla de expertos ultra dispersa (MoE) con 125 mil millones de parámetros totales, de los cuales se activan 6 mil millones por token. La conversión combina los pesos de lenguaje cuantizados a 4 bits (oQ4e) con la torre de visión completa en BF16, y añade metadatos de procesador de imagen y vídeo.

Este checkpoint está pensado para desarrolladores que trabajan con hardware Apple Silicon y necesitan un modelo multimodal de gran capacidad con ventana de contexto de 128 000 tokens, capaz de realizar razonamiento, generación de código, tool calling y conversación. La cuantización mixta reduce el tamaño de los pesos a aproximadamente 87,4 GiB, lo que permite su ejecución en equipos con memoria unificada de 128 GiB, aunque el pico de memoria observado en las pruebas alcanza los 94,3 GB. No es una versión oficial de Qwen, sino un trabajo de la comunidad que requiere MLX-VLM y no es compatible con Transformers estándar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GDN + QSA híbrida, MoE ultra dispersa (mezcla de expertos) |
| Parametros totales | 125B (incluye 51B de tabla de n-gramas PLE) |
| Parametros activos | 6B por token |
| Longitud de contexto | 131 072 tokens (128K) |
| Tipos de cuantizacion | Q4 affine group-size 128 (mixta: Q5/Q8 en capas sensibles, BF16 en control y visión) |
| Idiomas soportados | no disponible |
| Licencia | qwen-community-1.0 (Qwen Community License 1.0) |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

El modelo base `Qwen3.8-Flash-Next` emplea una arquitectura híbrida que combina Gated DeltaNet (GDN) y Qwen Sparse Attention (QSA). Tres de cada cuatro capas utilizan GDN para comprimir el historial de la secuencia, mientras que la cuarta capa usa QSA para recuperación precisa de información de largo alcance. Es un modelo de mezcla de expertos ultra disperso con 125B parámetros totales, incluyendo una tabla de n-gramas PLE de 51B parámetros, y activa solo 6B parámetros por token. El entrenamiento del modelo original fue realizado por el equipo Qwen de Alibaba, aunque no se dispone de detalles específicos sobre el número de tokens o la composición del dataset en la información proporcionada.

La conversión a MLX-VLM aplica una cuantización mixta guiada por una matriz de importancia recopilada a partir de 1 024 muestras multilingües con uso intensivo de herramientas, a longitud de secuencia 512. Los pesos de los grandes bloques lineales y de los expertos enrutados se cuantizan a Q4 con group-size 128, mientras que las matrices de atención y los expertos compartidos conservan mayor precisión (Q5 y Q8). Los routers, el estado recurrente, las convoluciones, la normalización y los tensores de control permanecen en BF16. La torre de visión completa (333 tensores) se mantiene en BF16 sin cuantizar. El resultado son 19 archivos safetensors con 3 187 tensores indexados y un payload total de 87,444 GiB.

## Capacidades

- Generación de texto y razonamiento multilingüe (idiomas no especificados).
- Comprensión de imágenes: entrada de imagen a través del procesador Qwen3VL, con salida de texto descriptivo o respuestas a preguntas visuales.
- Soporte de vídeo: se incluyen metadatos de procesador de vídeo, aunque la inferencia de vídeo no fue validada de forma independiente.
- Tool calling / function calling: el modelo puede generar llamadas a herramientas, aunque se advierte que pueden aparecer llamadas malformadas o duplicadas.
- Conversación multi-turno con contexto largo de hasta 128K tokens.
- Modo thinking: el servidor MLX-VLM permite habilitar un presupuesto de razonamiento explícito (`--enable-thinking`).
- Integración con MLX-VLM y servidor OpenAI-compatible para despliegue local en Apple Silicon.

## Casos de uso

- Análisis de imágenes en entornos Apple Silicon: el modelo puede describir imágenes, responder preguntas sobre su contenido o extraer información visual, aprovechando la torre de visión BF16 y la ventana de contexto de 128K para procesar documentos extensos con figuras o diagramas.
- Asistentes conversacionales con contexto largo: gracias a los 131 072 tokens de contexto, puede mantener conversaciones prolongadas con historial extenso, útil para aplicaciones de atención al cliente o asistentes personales que requieren recordar detalles de interacciones previas.
- Generación de código asistida por capturas de pantalla: un desarrollador puede proporcionar una imagen de un error o de una interfaz y pedir al modelo que genere o corrija código, combinando comprensión visual y generación de código.
- Automatización de tareas con tool calling: el modelo puede integrarse en pipelines que requieren llamar a funciones externas (APIs, bases de datos) a partir de instrucciones en lenguaje natural, aunque se debe implementar una capa de validación independiente para las llamadas generadas.
- Procesamiento de documentos técnicos con figuras: en entornos de investigación o ingeniería, el modelo puede resumir o extraer información de documentos que contienen gráficos, tablas o esquemas, gracias a su capacidad multimodal.
- Prototipado y experimentación en MLX: al ser un checkpoint específico para Apple Silicon, es adecuado para desarrolladores que desean probar modelos MoE de gran tamaño en hardware local sin depender de servicios en la nube, usando MLX-VLM o el servidor OpenAI-compatible.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card solo indica que se realizaron pruebas deterministas de control (VISION_READY, RED, BLUE) para verificar que la entrada de imagen afecta a la generación, pero no se proporcionan métricas de calidad como MMLU, HumanEval o GSM8K. Tampoco se dispone de comparativas con otros modelos en términos de rendimiento.

## Requisitos de hardware

- Memoria unificada: el modelo fue probado en un Apple M5 Max con 128 GiB de memoria unificada, alcanzando un pico de 94,349 GB durante la inferencia. Se recomienda al menos 96-128 GiB para ejecutar el checkpoint completo con la torre de visión.
- GPU: exclusivamente Apple Silicon (M-series). No se ha probado en otras arquitecturas.
- Almacenamiento: el repositorio ocupa 93,9 GB, por lo que se necesita espacio en disco suficiente.
- Software: MLX 0.32.1, MLX-VLM 0.6.17, Transformers 5.15.1 y Python 3.11.
- Opciones de despliegue: MLX-VLM (generación por línea de comandos o servidor OpenAI-compatible en localhost), integración con Swival a través de su proveedor `llamacpp`.
- Latencia y throughput: no disponibles. El pico de memoria de 94 GB sugiere que la inferencia es exigente y probablemente lenta en equipos con menos memoria.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3.8-Flash-Next-FP8 (base) | 125B (6B activos) | 128K | qwen-community-1.0 | FP8 | Modelo original de Alibaba, multimodal, sin cuantizar |
| jedisct1/Qwen3.8-Flash-Next-oQ4e-128k | 125B (6B activos) | 128K | qwen-community-1.0 | MLX oQ4e | Conversión sin visión, solo texto |
| jedisct1/Qwen3.8-Flash-Next-oQ4e-Vision-128k (este) | 125B (6B activos) | 128K | qwen-community-1.0 | MLX oQ4e + BF16 visión | Conversión con visión, para Apple Silicon |

No se dispone de datos de rendimiento comparativo entre estas variantes. La principal diferencia es la inclusión de la torre de visión y el formato de cuantización.

## Limitaciones y advertencias

- No es compatible con Transformers estándar; requiere MLX-VLM y solo se ha probado en Apple Silicon con la configuración indicada.
- La inferencia de vídeo no fue validada; los metadatos de vídeo están presentes pero no se garantiza su funcionamiento.
- La cuantización puede reducir la calidad de salida en comparación con el modelo FP8 original.
- El modelo puede generar contenido incorrecto, llamadas a herramientas malformadas o duplicadas, o acciones no seguras. Se recomienda validación independiente de las salidas y establecer límites de permisos adecuados.
- La licencia Qwen Community License 1.0 impone restricciones para uso comercial en servicios de Model as a Service y AI Work Assistant; es necesario revisar los términos antes de su uso en producción.
- El modelo hereda las limitaciones y consideraciones de uso del modelo upstream Qwen, incluyendo posibles sesgos y riesgo de alucinación.
- El tamaño del repositorio (93,9 GB) y el pico de memoria (94 GB) limitan su despliegue a equipos con gran cantidad de memoria unificada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jedisct1/Qwen3.8-Flash-Next-oQ4e-Vision-128k
- Modelo base (FP8): https://huggingface.co/Qwen/Qwen3.8-Flash-Next-FP8
- Repositorio GitHub de Qwen3.8-Flash-Next: https://github.com/QwenLM/Qwen3.8-Flash-Next/
- Repositorio GitHub de Qwen3.8 (serie): https://github.com/QwenLM/Qwen3.8
- Receta vLLM para Qwen3.8-Flash-Next: https://recipes.vllm.ai/Qwen/Qwen3.8-Flash-Next
- Variante sin visión (texto): https://huggingface.co/jedisct1/Qwen3.8-Flash-Next-oQ4e-128k
- Variante con MTP (texto): https://huggingface.co/jedisct1/Qwen3.8-Flash-Next-oQ4e-MTP-128k
