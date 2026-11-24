# divinetribe/AesCode-32B-abliterated-MLX-4bit

## Resumen

AesCode-32B es un modelo multimodal de generación de código desarrollado por Microsoft, afinado a partir de Qwen3-VL-32B-Instruct mediante la técnica de "decoupled cross-modal rewards" descrita en su paper. Su tarea principal es convertir una captura de pantalla en HTML y CSS que reproduzca fielmente el diseño: diapositivas, pósteres, dashboards o páginas de producto. Esta ficha cubre una variante concreta publicada por el usuario divinetribe: una cuantización 4-bit en formato MLX con la torre de lenguaje "abliterated" (dirección de rechazo eliminada), pensada para ejecutarse de forma local en Apple Silicon.

El modelo mantiene la torre de visión en bfloat16 (351 tensores `vision_tower.*` sin cuantizar), de modo que la ruta de imagen conserva su calidad mientras que solo la torre de lenguaje se comprime a 4-bit. El resultado ocupa aproximadamente 18 GB en disco, lo que permite ejecutarlo en Macs de gama alta sin conexión a la nube ni claves de API. La arquitectura subyacente es `Qwen3VLForConditionalGeneration`, un transformer multimodal con 33.357.390.064 parámetros totales.

La relevancia de esta variante es doble: por un lado, demuestra que es posible llevar un modelo de 32B con visión a hardware de consumo Apple sin sacrificar la percepción visual; por otro, la abliteración elimina el comportamiento de rechazo del modelo, lo que amplía su rango de respuestas pero también incrementa los riesgos de uso irresponsable. La licencia es Apache 2.0, aunque el modelo base y los pesos derivados deben evaluarse con cautela en entornos de producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal `Qwen3VLForConditionalGeneration` (torre de visión + torre de lenguaje) |
| Parametros totales | 33.357.390.064 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4-bit en torre de lenguaje; bf16 en torre de visión (351 tensores `vision_tower.*`) |
| Idiomas soportados | inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX), librería `mlx` |

## Arquitectura y entrenamiento

El modelo base, microsoft/AesCode-32B, es un finetune de Qwen3-VL-32B-Instruct, un transformer multimodal que combina una torre de visión con una torre de lenguaje de 32B parámetros. El entrenamiento de AesCode se describe en el paper "AesCode: Aesthetic Code Generation with Decoupled Cross-Modal Rewards" (arXiv:2610.18860), que introduce una recompensa desacoplada entre modalidades para alinear la generación de código con la calidad visual y el cumplimiento de reglas. No se dispone en la información proporcionada del número de tokens de entrenamiento ni de la composición exacta del dataset.

Esta variante concreta aplica dos transformaciones sobre el modelo base. Primero, una abliteración direccional según Arditi et al. 2024 (arXiv:2406.11717): se calcula una dirección de rechazo a partir de la capa 44 de 64 y se elimina de la torre de lenguaje, dejando intacta la torre de visión. Segundo, una cuantización 4-bit de la torre de lenguaje con MLX, mientras que los 351 tensores de la torre de visión permanecen en bfloat16. El autor indica que cada tamaño de la familia pasa una prueba de visión antes de publicarse, consistente en auditar una captura real de una página de producto y comprobar que la calidad de lectura se mantiene respecto a la versión de precisión completa.

## Capacidades

- Generación de código HTML y CSS a partir de una imagen de referencia (image-to-code), incluyendo diapositivas, pósteres, dashboards y páginas de producto.
- Comprensión de imágenes: descripción de layouts, identificación de elementos de interfaz y generación de textos alternativos (alt-text).
- Auditoría de páginas web: análisis SEO, marketing y accesibilidad sobre capturas de pantalla reales.
- Generación de texto y razonamiento multimodal en inglés.
- Capacidades de código generales heredadas del backbone Qwen3-VL-32B-Instruct.
- Modo conversacional multi-turno con entrada image-text-to-text.
- Ejecución local y offline en Apple Silicon mediante `mlx-vlm`, sin telemetría ni claves de API.

No se dispone de información sobre soporte de tool calling, function calling, agentes multi-paso, modo thinking explícito ni capacidades de audio en la documentación proporcionada.

## Casos de uso

- Recreación de maquetas a partir de capturas: un diseñador sube una captura de una diapositiva o póster y el modelo genera un único archivo HTML con CSS inline, listo para revisión o despliegue. Es adecuado porque el modelo fue entrenado específicamente para esta tarea con recompensas visuales.
- Prototipado rápido de interfaces: a partir de una captura de una página de producto o dashboard, el modelo produce el esqueleto HTML/CSS que un equipo frontend puede refinar, reduciendo el tiempo de conversión de diseño a código.
- Auditoría de accesibilidad automatizada: el modelo analiza capturas de páginas reales, identifica elementos de interfaz y propone textos alternativos y mejoras de estructura, como se documenta en la prueba de visión del autor.
- Generación de alt-text para catálogos de imágenes: integrado en un pipeline de publicación, el modelo puede describir imágenes de producto y generar metadatos descriptivos en inglés.
- Asistencia en entornos de desarrollo locales: al ejecutarse con `mlx-vlm` en un Mac, puede integrarse en herramientas como Claude Code Local (proyecto del mismo autor) para generar y revisar código sin salir del equipo ni enviar datos a la nube.
- Educación y experimentación en visión artificial: investigadores pueden estudiar el efecto de la cuantización 4-bit y la abliteración sobre las capacidades multimodales en hardware de consumo, comparando las variantes bf16, 8-bit y 4-bit de la familia.

## Benchmarks y rendimiento

Los datos disponibles provienen del paper y la model card del modelo base, evaluados sobre 300 muestras de estilo infográfico con puntuación de cumplimiento de reglas y calidad visual. No son mediciones independientes de esta variante cuantizada.

| Modelo (con imagen de referencia) | Overall | Visual |
|---|---|---|
| AesCode-32B | 85.89 | 77.44 |
| Claude Opus 4.8 (sin referencia) | 76.78 | no disponible |
| GPT-5.5 (sin referencia) | 76.31 | no disponible |
| Qwen3-VL-32B base (con referencia) | 61.10 | no disponible |

No se han publicado resultados de benchmarks específicos para la variante abliterated MLX 4-bit en la información disponible. El autor afirma que esta build superó la prueba de visión cualitativa descrita en la model card, pero no aporta métricas numéricas de la cuantización.

## Requisitos de hardware

- VRAM/espacio en disco: aproximadamente 18 GB para los pesos en 4-bit; el repositorio completo ocupa 19,6 GB.
- Hardware objetivo: Apple Silicon (serie M). El autor indica que "runs on an M-series Mac", sin especificar modelo mínimo.
- Cabe en GPU de consumo Apple: sí, en equipos con memoria unificada suficiente (orientativamente 24 GB o más para dejar margen al contexto y al proceso).
- No está pensado para GPU NVIDIA: el formato es MLX, no GGUF ni safetensors estándar de PyTorch.
- Despliegue: `mlx-vlm` mediante `python -m mlx_vlm.generate`; no se mencionan vLLM, llama.cpp, Ollama ni TGI para esta variante.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| AesCode-32B-abliterated-MLX-4bit | 33,36B | no disponible | Image-to-code HTML/CSS, 4-bit MLX | Apache 2.0 | Hugging Face (divinetribe) |
| AesCode-32B (original) | 32B (aprox.) | no disponible | Image-to-code HTML/CSS, precisión completa | Apache 2.0 | Hugging Face (microsoft) |
| Qwen3-VL-32B-Instruct | 32B (aprox.) | no disponible | Visión-lenguaje general | no disponible en la información | Hugging Face (Qwen) |
| AesCode-32B-abliterated-MLX-bf16 | 33,36B | no disponible | Igual que esta variante, precisión completa | Apache 2.0 | Hugging Face (divinetribe) |

La comparación directa con modelos de propósito general como Claude Opus 4.8 o GPT-5.5 solo está disponible en el benchmark del paper y con la salvedad de que estos últimos se evaluaron sin imagen de referencia.

## Limitaciones y advertencias

- La abliteración elimina la dirección de rechazo del modelo, lo que puede producir respuestas que el modelo original habría declinado; el autor advierte que "you are responsible for what you build with it".
- La cuantización 4-bit reduce precisión: no añade conocimiento y no garantiza corrección en las salidas.
- El modelo solo declara soporte de inglés; el rendimiento en castellano u otros idiomas no está documentado.
- No se dispone de la longitud de contexto, lo que dificulta planificar conversaciones largas o documentos extensos.
- Riesgo de alucinación inherente a los modelos generativos, especialmente al inferir elementos de una imagen que no están claramente visibles.
- Aunque la licencia es Apache 2.0, deben revisarse las condiciones del modelo base (Qwen3-VL-32B-Instruct) y del finetune original de Microsoft antes de un uso comercial.
- Formato MLX exclusivo para Apple Silicon: no es directamente portable a CUDA sin conversión.
- El repositorio tiene pocas descargas (371) y ningún "like", por lo que la validación comunitaria es limitada.
- El modelo está orientado a generación de código visual; su uso como asistente general puede dar resultados inferiores a modelos especializados en texto.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/divinetribe/AesCode-32B-abliterated-MLX-4bit
- Modelo base: https://huggingface.co/microsoft/AesCode-32B
- Backbone: https://huggingface.co/Qwen/Qwen3-VL-32B-Instruct
- Variante bf16: https://huggingface.co/divinetribe/AesCode-32B-abliterated-MLX-bf16
- Variante 8-bit: https://huggingface.co/divinetribe/AesCode-32B-abliterated-MLX-8bit
- Paper de AesCode: https://arxiv.org/abs/2610.18860
- Paper de abliteración (Arditi et al.): https://arxiv.org/abs/2406.11717
- Herramienta Claude Code Local: https://github.com/nicedreamzapp/claude-code-local
- Perfil del autor en GitHub: https://github.com/nicedreamzapp
- Perfil del autor en Hugging Face: https://huggingface.co/divinetribe
- mlx-vlm: https://github.com/Blaizzy/mlx-vlm
