# divinetribe/AesCode-32B-abliterated-MLX-8bit

## Resumen

AesCode-32B-abliterated-MLX-8bit es una cuantización de 8 bits en formato MLX del modelo microsoft/AesCode-32B, publicada por el usuario divinetribe para su ejecución nativa en Apple Silicon. AesCode-32B es a su vez un ajuste fino de Qwen/Qwen3-VL-32B-Instruct (arquitectura Qwen3VLForConditionalGeneration) especializado en generación de código estético: recibe una captura de pantalla y produce el HTML y CSS necesarios para recrearla (presentaciones, pósters, dashboards, páginas de producto). El modelo base fue desarrollado por el equipo de Microsoft y presentado en el artículo "AesCode: Aesthetic Code Generation with Decoupled Cross-Modal Rewards" (arXiv:2610.18860).

Esta build concreta aplica dos transformaciones sobre el modelo original. Por un lado, una abliteración por dirección de rechazo (Arditi et al. 2024) aplicada únicamente a la torre de lenguaje, tomando la dirección de la capa 44 de 64, mientras que la torre de visión queda intacta. Por otro, una cuantización de 8 bits limitada a la torre de lenguaje, manteniendo los 351 tensores `vision_tower.*` en bfloat16 para preservar la calidad del camino visual.

El resultado ocupa aproximadamente 34 GB en disco, frente a los 36 GB del repositorio, y se ejecuta con `mlx-vlm` en Macs de la serie M. Es relevante para desarrolladores que quieran ejecutar un modelo multimodal de generación de código de 33.357 millones de parámetros de forma local, privada y sin telemetría, a costa de asumir los riesgos propios de un modelo abliterado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3VLForConditionalGeneration (transformer multimodal visión-lenguaje) |
| Parametros totales | 33.357.390.064 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 8 bits en la torre de lenguaje; bf16 en la torre de visión; la familia incluye también bf16 y 4 bits |
| Idiomas soportados | inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX), librería mlx |
| Tamaño en disco | ~34 GB |
| Framework de inferencia | mlx-vlm (Apple Silicon) |
| Pipeline | image-text-to-text |
| Modelo base | microsoft/AesCode-32B (finetune de Qwen/Qwen3-VL-32B-Instruct) |
| Descargas | 347 |
| Fecha de creación | 2026-10-28 |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura multimodal de Qwen3-VL-32B-Instruct: una torre de visión que codifica imágenes y una torre de lenguaje tipo transformer que las integra junto al texto para generar la respuesta. Sobre esa base, el equipo de Microsoft entrenó AesCode-32B con un esquema de recompensas desacopladas entre modalidades ("Decoupled Cross-Modal Rewards"), descrito en arXiv:2610.18860, orientado a generar código HTML/CSS visualmente fiel a una imagen de referencia. No se dispone en la información proporcionada del número de tokens de entrenamiento ni de la composición exacta del dataset.

Esta build de divinetribe introduce dos modificaciones. La abliteración aplica una ablación direccional (Arditi et al., arXiv:2406.11717) sobre la torre de lenguaje usando la dirección extraída de la capa 44 de 64, eliminando la dirección de rechazo del modelo. La cuantización a 8 bits afecta solo a la torre de lenguaje, mientras que los 351 tensores de `vision_tower.*` se conservan en bfloat16 junto con `vision_config` y los configs del procesador. El autor indica que cada tamaño de la familia pasa una prueba de visión antes de publicarse: se le introduce una captura real de una página de producto y se le pide una auditoría SEO, de marketing y de accesibilidad más textos alternativos; la build de 8 bits superó esa prueba.

## Capacidades

- Generación de código HTML y CSS a partir de una imagen de referencia (capturas de pantalla, mockups, pósters, dashboards, páginas de producto).
- Comprensión de imágenes: lectura de elementos de interfaz, textos en pantalla, jerarquía visual y componentes de una página.
- Generación de texto conversacional en formato image-text-to-text.
- Capacidades de visión preservadas gracias a mantener la torre visual en bf16.
- Generación de textos alternativos (alt-text) y auditorías básicas de SEO, marketing y accesibilidad sobre una página.
- Ejecución local y offline en Apple Silicon, sin API keys ni telemetría.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: limitadas al inglés según la metadata del modelo.
- Modo thinking, audio u otras capacidades especiales: no disponible.

## Casos de uso

- Recreación de mockups en código: a partir de una captura de un diseño, el modelo genera un único archivo HTML con CSS en línea listo para revisar, tal como muestra el ejemplo de uso de la model card con `mlx-vlm`.
- Prototipado rápido de interfaces en local: un desarrollador con un Mac de la serie M puede convertir bocetos o capturas en maquetas funcionales sin enviar datos a la nube, útil en entornos con requisitos de privacidad.
- Generación de páginas de producto: el modelo lee una captura de una ficha de producto y produce la estructura HTML/CSS correspondiente, incluyendo textos alternativos para las imágenes.
- Auditoría visual automatizada: se le puede pedir un análisis SEO, de marketing y de accesibilidad de una página a partir de su captura, como demuestra la prueba de visión del autor.
- Creación de dashboards y presentaciones: dado que el modelo está entrenado específicamente en código estético, resulta adecuado para generar layouts de paneles de datos o diapositivas a partir de una referencia visual.
- Asistencia en herramientas de edición local: integrable en flujos tipo Claude Code Local (proyecto del mismo autor) para generar o modificar HTML de forma privada y offline en el propio equipo.
- Generación de alt-text a escala: procesar capturas de catálogos y obtener descripciones textuales de las imágenes.

## Benchmarks y rendimiento

Los datos disponibles provienen del artículo y la model card del modelo original (microsoft/AesCode-32B), evaluados sobre 300 muestras de estilo infográfico y puntuados por cumplimiento de reglas y calidad visual. Corresponden al modelo base, no a esta cuantización concreta.

| Modelo (con imagen de referencia) | Overall | Visual |
|---|---|---|
| AesCode-32B | 85.89 | 77.44 |
| Claude Opus 4.8 (sin referencia) | 76.78 | no disponible |
| GPT-5.5 (sin referencia) | 76.31 | no disponible |
| Qwen3-VL-32B base (con referencia) | 61.10 | no disponible |

No se han publicado resultados de benchmarks específicos de esta cuantización de 8 bits en la información disponible. El autor solo reporta que superó la prueba cualitativa de visión descrita en la sección de arquitectura.

## Requisitos de hardware

- VRAM/ memoria unificada estimada: ~34 GB en disco para los pesos en 8 bits; se necesita memoria unificada suficiente para cargar el modelo completo más el contexto, por lo que se recomienda al menos 48 GB de memoria unificada.
- GPU recomendadas: Apple Silicon de la serie M con memoria unificada amplia (M2/M3/M4 Max y Ultra). No está pensado para GPUs NVIDIA ni CUDA.
- ¿Cabe en GPU de consumo? Solo en equipos Apple Silicon con memoria unificada suficiente; no aplica a GPUs de consumo convencionales.
- Opciones de despliegue: `mlx-vlm` (librería oficial de inferencia para este formato). No compatible directamente con vLLM, llama.cpp, Ollama ni TGI, al estar en formato MLX.
- Latencia y throughput: no disponible en la información proporcionada.
- Alternativas de tamaño: la familia incluye bf16 (calidad completa) y 4 bits (un cuarto del tamaño) para equipos con menos memoria.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| AesCode-32B-abliterated-MLX-8bit | 33.357 M | no disponible | Generación de código HTML/CSS desde imagen, abliterado, MLX 8 bits | Apache 2.0 | Hugging Face (divinetribe) |
| microsoft/AesCode-32B | ~32 B | no disponible | Generación de código estético desde imagen (original) | Apache 2.0 | Hugging Face (Microsoft) |
| Qwen/Qwen3-VL-32B-Instruct | ~32 B | no disponible | Modelo multimodal visión-lenguaje generalista | Apache 2.0 | Hugging Face (Qwen) |
| Claude Opus 4.8 | no disponible | no disponible | Modelo propietario generalista | Propietaria | API de Anthropic |

La diferencia clave frente al original es la cuantización a 8 bits con torre visual en bf16 y la abliteración, que reducen el tamaño a costa de modificar el comportamiento de rechazo. Frente a Qwen3-VL-32B-Instruct, AesCode añade el ajuste fino específico para código estético (85,89 frente a 61,10 en el benchmark del autor). Frente a Claude Opus 4.8, la ventaja es la ejecución local y la licencia abierta, aunque la comparación de benchmarks no es homogénea (Claude se evalúa sin imagen de referencia).

## Limitaciones y advertencias

- La abliteración elimina la dirección de rechazo del modelo: puede generar contenido que el modelo original rechazaría. El autor advierte explícitamente que el usuario es responsable de lo que construya.
- La cuantización a 8 bits no añade conocimiento y no garantiza que la salida sea correcta; puede introducir degradación sutil respecto a bf16.
- Riesgo de alucinación inherente a los modelos generativos, especialmente en la lectura de elementos visuales pequeños o textos poco legibles en la captura.
- Idiomas: la metadata declara únicamente inglés, por lo que el rendimiento en castellano u otros idiomas no está garantizado.
- Longitud de contexto no documentada en la información disponible.
- Formato MLX: no es portable a ecosistemas CUDA/vLLM/llama.cpp sin conversión; requiere Apple Silicon y `mlx-vlm`.
- Licencia Apache 2.0 permite uso comercial, pero debe verificarse el cumplimiento de las licencias del modelo base (microsoft/AesCode-32B y Qwen3-VL-32B-Instruct) en la cadena de derivación.
- Modelo con pocas descargas (347) y sin likes: menor validación comunitaria que el original.
- El benchmark citado procede de los autores del modelo base y no de una evaluación independiente; no hay leaderboard público que liste AesCode específicamente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/divinetribe/AesCode-32B-abliterated-MLX-8bit
- Modelo base: https://huggingface.co/microsoft/AesCode-32B
- Backbone: https://huggingface.co/Qwen/Qwen3-VL-32B-Instruct
- Variante bf16: https://huggingface.co/divinetribe/AesCode-32B-abliterated-MLX-bf16
- Variante 4 bits: https://huggingface.co/divinetribe/AesCode-32B-abliterated-MLX-4bit
- Paper de AesCode: https://arxiv.org/abs/2610.18860
- Paper de abliteración (Arditi et al.): https://arxiv.org/abs/2406.11717
- mlx-vlm: https://github.com/Blaizzy/mlx-vlm
- Claude Code Local: https://github.com/nicedreamzapp/claude-code-local
- Perfil del autor en GitHub: https://github.com/nicedreamzapp
- Perfil del autor en Hugging Face: https://huggingface.co/divinetribe
