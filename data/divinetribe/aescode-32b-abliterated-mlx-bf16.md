# divinetribe/AesCode-32B-abliterated-MLX-bf16

## Resumen

AesCode-32B-abliterated-MLX-bf16 es una conversión no oficial del modelo microsoft/AesCode-32B, un finetune de Qwen/Qwen3-VL-32B-Instruct especializado en generar código HTML y CSS a partir de capturas de pantalla (slides, pósters, dashboards, páginas de producto). El modelo base está desarrollado por el equipo de AesCode en Microsoft y se describe en el paper "AesCode: Aesthetic Code Generation with Decoupled Cross-Modal Rewards" (arXiv:2610.18860). Esta build concreta la publica el usuario divinetribe en Hugging Face.

La modificación principal es una "abliteración" por dirección de rechazo (Arditi et al., 2024): se proyecta fuera la dirección de rechazo de la torre de lenguaje, dejando intacta la torre de visión (351 tensores `vision_tower.*`). El resultado es un modelo multimodal image-text-to-text de 33.357.390.064 parámetros en bfloat16, empaquetado en formato MLX para ejecutarse en Apple Silicon.

Es relevante para desarrolladores que quieran ejecutar localmente, sin nube ni telemetría, un modelo de generación de código a partir de imágenes en un Mac con chip de la serie M, manteniendo la capacidad de visión del backbone Qwen3-VL.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (Qwen3VLForConditionalGeneration), torre de visión + torre de lenguaje |
| Parametros totales | 33.357.390.064 |
| Parametros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | bf16 (esta build); existen variantes 8-bit y 4-bit de la misma familia |
| Idiomas soportados | en |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (MLX, bfloat16) |

## Arquitectura y entrenamiento

El modelo base AesCode-32B es un finetune de Qwen/Qwen3-VL-32B-Instruct, un transformer multimodal con torre de visión y torre de lenguaje, orientado a la generación de código estético a partir de imágenes de referencia. Según el paper citado, el entrenamiento emplea "decoupled cross-modal rewards", una estrategia de recompensas multimodales desacopladas para guiar la generación hacia HTML/CSS fiel y visualmente correcto. No se dispone del número de tokens de entrenamiento ni de la composición exacta del dataset en la información proporcionada.

Sobre esta base, la build de divinetribe aplica ablación direccional (Arditi et al., 2024): extrae la dirección de rechazo en la capa 44 de 64, calibrada con 32 instrucciones dañinas frente a 32 inofensivas en formato de chat usando el residual del último token. Esa dirección se ortogonaliza en `embed_tokens`, en la proyección de salida de atención de cada capa (`self_attn.o_proj`) y en cada `mlp.down_proj`. La torre de visión y `vision_config` se preservan sin tocar. Precisión bfloat16 sin cuantización.

## Capacidades

- Generación de código HTML y CSS a partir de capturas de pantalla: reconstrucción de slides, pósters, dashboards y páginas de producto.
- Comprensión de imágenes (image-text-to-text) con la torre de visión intacta.
- Auditoría de páginas web a partir de screenshot: SEO, marketing/conversión y accesibilidad, incluyendo generación de textos alternativos (alt-text).
- Generación de texto conversacional en inglés.
- Capacidad de código heredada del backbone Qwen3-VL-32B-Instruct (generación de código en general, no solo HTML/CSS).
- Comportamiento "abliterated": se elimina la dirección de rechazo del modelo, de modo que no declina peticiones por esa vía.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: limitadas a inglés según el campo `language`.

## Casos de uso

- Reconstrucción de mockups a código: dado un screenshot de un diseño (slide, póster, dashboard), el modelo genera un único archivo HTML con CSS inline, útil para prototipado rápido de interfaces.
- Auditoría SEO y de accesibilidad automatizada: se envía una captura de una página en producción y el modelo identifica elementos on-page (título, H1, botones, selectores), propone mejoras y redacta alt-text para las imágenes.
- Generación de páginas de producto para e-commerce: a partir de la captura de una ficha de producto, produce el HTML/CSS de una réplica o variante, manteniendo jerarquía visual y elementos de conversión.
- Prototipado de dashboards y paneles de datos: convierte una imagen de referencia de un dashboard en maquetación HTML/CSS para iterar sobre ella en local.
- Flujo de trabajo offline en Mac: ejecución con `mlx-vlm` en Apple Silicon sin API keys, sin telemetría y sin conexión, adecuado para entornos con requisitos de privacidad.
- Integración en herramientas de desarrollo locales: la model card menciona su uso dentro de Claude Code Local en el propio Mac, lo que permite usarlo como backend de generación de código en un asistente local.
- Evaluación de calidad visual de diseños: el modelo puede describir y criticar elementos visuales de una captura (jerarquía, contraste, disposición) como paso previo a una revisión humana.

## Benchmarks y rendimiento

Los únicos datos disponibles provienen del paper de AesCode y de la model card del modelo base. Corresponden al modelo original AesCode-32B, no a esta build abliterada, y se basan en un benchmark propio de 300 muestras de estilo infográfico puntuadas por cumplimiento de reglas y calidad visual.

| Modelo (con imagen de referencia) | Overall | Visual |
|---|---|---|
| AesCode-32B | 85.89 | 77.44 |
| Claude Opus 4.8 (sin referencia) | 76.78 | no disponible |
| GPT-5.5 (sin referencia) | 76.31 | no disponible |
| Qwen3-VL-32B base (con referencia) | 61.10 | no disponible |

No se han publicado resultados de benchmarks independientes para esta build abliterada en la información disponible. La model card indica que la ablación solo afecta a la dirección de rechazo y no debería alterar la calidad de código o visión, y que se re-probó en una tarea real de auditoría de página de producto con resultados equivalentes a la build fiel.

## Requisitos de hardware

- VRAM/unified memory estimada: el repo pesa 66,7 GB en bf16; se necesita al menos esa cantidad de memoria unificada más overhead para cargar el modelo completo. Las variantes 8-bit y 4-bit de la familia reducen el requisito aproximadamente a la mitad y a un cuarto, respectivamente.
- GPU recomendadas: no aplica GPU dedicada; el formato es MLX y está pensado para Apple Silicon (serie M).
- ¿Cabe en consumer GPU? No en el sentido habitual (NVIDIA/AMD); requiere un Mac con memoria unificada suficiente (los 66,7 GB en bf16 exigen configuraciones de gama alta de Apple Silicon).
- Opciones de despliegue: `mlx-vlm` (librería indicada en la model card); no se mencionan vLLM, llama.cpp, Ollama ni TGI para este formato.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| AesCode-32B-abliterated-MLX-bf16 (esta build) | 33.357.390.064 | no disponible | HTML/CSS desde screenshot, abliterated, MLX | apache-2.0 | Hugging Face (divinetribe) |
| microsoft/AesCode-32B | no disponible | no disponible | HTML/CSS desde screenshot (original) | no disponible en la información | Hugging Face (Microsoft) |
| Qwen/Qwen3-VL-32B-Instruct | no disponible | no disponible | Modelo multimodal general (backbone) | no disponible en la información | Hugging Face (Qwen) |
| Claude Opus 4.8 | no disponible | no disponible | Modelo propietario general | propietaria | API |

Las cifras de benchmark comparativas entre AesCode-32B y los modelos propietarios figuran en la sección anterior; proceden del benchmark propio de los autores y no de una evaluación independiente.

## Limitaciones y advertencias

- Modelo abliterated: se ha eliminado la dirección de rechazo, por lo que puede generar contenido que el modelo original declinaría. No hay salvaguardas de seguridad efectivas; el uso en producción requiere filtros externos.
- Solo inglés: el campo `language` declara únicamente `en`; el rendimiento en castellano no está garantizado.
- Benchmarks no independientes: los datos de rendimiento provienen del paper de los autores y de la model card del modelo base, no de una evaluación externa.
- La ablación puede degradar sutilmente otras capacidades; la model card solo reporta una prueba cualitativa en una tarea de auditoría de página de producto.
- Riesgo de alucinación en la descripción de imágenes y en la generación de código: puede inventar elementos no presentes en el screenshot o producir HTML/CSS que no reproduzca fielmente el diseño.
- Formato MLX: no es directamente portable a GPUs NVIDIA/AMD ni a los runners habituales (vLLM, TGI, llama.cpp); requiere Apple Silicon y `mlx-vlm`.
- Requisito de memoria elevado en bf16 (repo de 66,7 GB); en máquinas con menos memoria unificada hay que recurrir a las variantes 8-bit o 4-bit.
- Build no oficial: el autor es un tercero (divinetribe), no Microsoft; no hay garantía de mantenimiento ni de soporte.
- Licencia apache-2.0 declarada, pero conviene verificar las condiciones del modelo base y del backbone Qwen3-VL antes de un uso comercial.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/divinetribe/AesCode-32B-abliterated-MLX-bf16
- Modelo base: https://huggingface.co/microsoft/AesCode-32B
- Backbone: https://huggingface.co/Qwen/Qwen3-VL-32B-Instruct
- Variante 8-bit: https://huggingface.co/divinetribe/AesCode-32B-abliterated-MLX-8bit
- Variante 4-bit: https://huggingface.co/divinetribe/AesCode-32B-abliterated-MLX-4bit
- Línea fiel (no abliterada): https://huggingface.co/divinetribe/AesCode-32B-MLX-bf16
- Paper de AesCode: https://arxiv.org/abs/2610.18860
- Paper de ablación direccional (Arditi et al.): https://arxiv.org/abs/2406.11717
- Claude Code Local: https://github.com/nicedreamzapp/claude-code-local
- Perfil del autor en GitHub: https://github.com/nicedreamzapp
- Perfil del autor en Hugging Face: https://huggingface.co/divinetribe
