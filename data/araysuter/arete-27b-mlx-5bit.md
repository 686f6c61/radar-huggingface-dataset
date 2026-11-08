# araysuter/Arete-27B-MLX-5bit

## Resumen
Arete-27B-MLX-5bit es una conversión cuantizada a 5 bits en formato MLX del modelo multimodal NousResearch/Arete-27B, publicada por el usuario araysuter. El modelo base es un post-entrenamiento de Qwen3.8-27B realizado por Nous Research para reforzar valores occidentales sobre un modelo preentrenado originalmente en chino, manteniendo capacidades de visión y texto. Esta versión concreta está pensada para ejecutarse en Apple Silicon mediante MLX y MLX-VLM, e incluye tanto el codificador visual como el modelo de lenguaje.

La conversión aplica cuantización afín de 5 bits con tamaño de grupo 64 a las proyecciones y embeddings del modelo de lenguaje, mientras que el codificador visual de 333 tensores se preserva íntegro en BF16 sin recuantizar. El resultado son aproximadamente 26.900 millones de parámetros (26.895.993.856 según los safetensors) y un repositorio de 19,4 GB. La ventana de contexto configurada es de 131.072 tokens, según la prueba de capacidad incluida en la model card.

Es relevante porque permite desplegar un modelo multimodal de ~27B en hardware de consumo Apple con memoria unificada de 64 GiB, algo que la versión BF16 original no permitiría con holgura. La licencia Apache 2.0 facilita su uso comercial, aunque la cuantización introduce pérdida de calidad no medida formalmente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (modelo de lenguaje Qwen3.8-27B + codificador visual de 333 tensores); familia etiquetada como qwen3_5 |
| Parametros totales | 26.895.993.856 (~26,9B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 131.072 tokens (ventana configurada) |
| Tipos de cuantizacion | MLX affine 5 bits, group size 64 (5,501 bits efectivos por peso); visión en BF16 |
| Idiomas soportados | en |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (MLX), librería mlx / mlx-vlm |

## Arquitectura y entrenamiento
El modelo base NousResearch/Arete-27B deriva de Qwen3.8-27B, un transformer denso de aproximadamente 27.000 millones de parámetros con capacidad multimodal (image-text-to-text). Nous Research aplicó un post-entrenamiento orientado a reforzar valores occidentales, evaluado con un conjunto de 803 prompts en siete categorías de valores según el blog oficial. No se dispone en la información proporcionada de detalles sobre el número de tokens de entrenamiento, la composición del dataset ni si se emplearon técnicas concretas de RLHF o DPO.

Esta conversión concreta no reentrena el modelo: cuantiza directamente los pesos de lenguaje desde el checkpoint BF16 original (no desde otra cuantización de baja precisión) y adjunta el codificador visual original en BF16. La model card incluye recibos de conversión (`conversion-receipt.json`) con la revisión de origen y las versiones de paquetes, así como hashes byte a byte de los 333 tensores visuales (`vision-attachment.json`). El entorno verificado es MLX 0.32.4, MLX-LM 0.32.2, Transformers 5.22.1 y MLX-VLM 0.7.12.

## Capacidades
- Generación de texto conversacional multi-turno.
- Comprensión de imágenes y respuesta image-text-to-text (pipeline declarado).
- Razonamiento y conocimiento general heredados del modelo base Qwen3.8-27B post-entrenado.
- Procesamiento de contexto largo: ventana nativa de 131.072 tokens, con restauración de caché de contexto de texto verificada.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: limitadas al inglés según la etiqueta de idioma (`en`).
- Modo thinking explícito, audio u otras capacidades especiales: no disponible en la información proporcionada.

## Casos de uso
- Descripción y análisis de imágenes en local: usar `mlx_vlm.generate` con `--image` para tareas de captioning, accesibilidad o catalogación de imágenes sin enviar datos a la nube, aprovechando que el codificador visual se mantiene en BF16.
- Asistente conversacional privado en Mac: despliegue en un equipo Apple Silicon con 64 GiB de memoria unificada para conversaciones multi-turno con contexto largo, sin depender de APIs externas.
- Procesamiento de documentos largos con contexto extenso: la ventana de 131.072 tokens y la restauración de caché de texto permiten analizar informes o expedientes de gran longitud en una sola sesión.
- Prototipado de aplicaciones multimodales: integración mediante MLX-VLM para validar flujos image-text-to-text antes de migrar a infraestructura de servidor.
- Investigación sobre cuantización: el repositorio incluye herramientas de conversión y recibos de hashes, lo que permite reproducir y auditar el proceso de cuantización de 5 bits.
- Evaluación de alineamiento de valores: al derivar de un modelo post-entrenado por Nous Research para reforzar valores occidentales, sirve para estudiar el comportamiento del modelo en categorías de valores, siempre que se validen los resultados dado que la cuantización es lossy.
- Inferencia educativa y demos: el tamaño de 19,4 GB y el soporte de MLX facilitan ejecutar un modelo de ~27B multimodal en portátiles de gama alta con memoria unificada.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la información disponible para esta cuantización. La model card indica explícitamente que los resultados publicados del modelo original describen al modelo fuente y no se han remedido para este quant, y que no se hace ninguna afirmación de calidad equivalente.

Datos de rendimiento medidos en la model card (prueba de capacidad, no de calidad):

| Prueba | Resultado |
|---|---|
| Procesamiento de prompt en frío (130.944 tokens de entrada, 8 de salida) | 911,49 s (~143,7 tokens/s) |
| Reutilización de caché en continuación | 130.950 tokens cacheados |
| Pico de memoria física nativa | 45.256.262.096 bytes (42,15 GiB) |
| Hardware de validación | Apple M5 Max, 64 GiB |

## Requisitos de hardware
- VRAM/memoria unificada estimada: pico medido de 42,15 GiB en una prueba de ventana completa de 131.072 tokens; para usos con contextos más cortos el consumo será inferior, aunque no se detalla en la información disponible.
- Hardware validado: Apple M5 Max con 64 GiB de memoria unificada.
- GPU NVIDIA: no disponible; el formato MLX está orientado a Apple Silicon.
- ¿Cabe en GPU de consumo? No aplica al formato MLX; en Apple Silicon requiere equipos con memoria unificada alta (64 GiB validados).
- Opciones de despliegue: MLX-VLM (recomendado para entrada de imagen) y MLX-LM; también se menciona Native TensorFold con soporte de DFlash2. vLLM, llama.cpp, Ollama o TGI no están indicados para este formato en la información disponible.
- Throughput: ~143,7 tokens/s en procesamiento de prompt en frío sobre M5 Max de 64 GiB (dato de la prueba de capacidad).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidad | Licencia | Formato |
|---|---|---|---|---|---|
| Arete-27B-MLX-5bit (esta ficha) | ~26,9B | 131.072 | Texto + imagen | Apache 2.0 | MLX safetensors 5 bits |
| NousResearch/Arete-27B (base) | ~27B | no disponible en la información | Texto + imagen | Apache 2.0 (según esta ficha) | BF16 |
| Qwen3.8-27B (origen del base) | ~27B | no disponible en la información | Texto + imagen | no disponible en la información | no disponible |

No se dispone de datos de benchmarks comparativos en la información proporcionada para establecer diferencias de rendimiento entre estas variantes.

## Limitaciones y advertencias
- La cuantización de 5 bits es lossy: la model card no afirma calidad equivalente ni ofrece benchmarks de calidad para este quant.
- Las pruebas de validación se limitan a fixtures sintéticos de imagen rojo/azul y a igualdad token a token entre motores; no constituyen una evaluación de precisión visual.
- El historial de imágenes actualmente se procesa en frío a través del gateway preflight; la restauración de caché solo está verificada para contexto de texto.
- Idioma: únicamente inglés según la etiqueta del modelo; el rendimiento en castellano no está garantizado ni documentado.
- Riesgo de sesgos y alucinación: no documentado en la información disponible; el post-entrenamiento orientado a valores occidentales puede introducir sesgos específicos que conviene evaluar.
- Uso comercial: permitido por la licencia Apache 2.0, que se incluye en el repositorio; deben conservarse los avisos de licencia.
- Dependencia de versiones concretas de MLX, MLX-LM, Transformers y MLX-VLM para reproducir el comportamiento verificado.
- El modelo tiene 0 descargas y 0 likes en Hugging Face en el momento de la consulta, por lo que carece de validación comunitaria.

## Enlaces
- Hugging Face: https://huggingface.co/araysuter/Arete-27B-MLX-5bit
- Modelo base: https://huggingface.co/NousResearch/Arete-27B
- Blog de Nous Research sobre Arete-27B: https://nousresearch.com/arete
- Ficha de especificaciones y VRAM de Arete 27B: https://apxml.com/models/arete-27b
