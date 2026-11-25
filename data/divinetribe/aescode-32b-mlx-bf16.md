# divinetribe/AesCode-32B-MLX-bf16

## Resumen

AesCode-32B-MLX-bf16 es una conversión a formato MLX en precisión completa (bfloat16) del modelo microsoft/AesCode-32B, un finetune de Qwen3-VL-32B-Instruct especializado en generar artefactos visuales (presentaciones, pósters, dashboards, páginas de producto) como HTML y CSS a partir de una instrucción y una imagen de referencia. La conversión la mantiene el usuario divinetribe y está pensada para ejecutarse de forma nativa en Apple Silicon mediante la librería mlx-vlm, sin PyTorch ni inferencia en la nube.

El modelo conserva la torre de visión completa (351 tensores `vision_tower.*`) y los configs de visión y procesador, algo que no siempre ocurre en conversiones MLX de modelos multimodales. Con 33.357.390.064 parámetros (~33,4B) en bf16, ocupa aproximadamente 62 GB en disco y el repo completo pesa 66,7 GB. Es un modelo multimodal de tipo image-text-to-text: recibe una captura de pantalla o imagen de referencia y produce código HTML/CSS que replica o mejora el diseño.

Su relevancia actual radica en dos factores: por un lado, ofrece una vía para ejecutar local y privadamente un modelo de generación de código visual de 32B en un Mac con chip de la serie M; por otro, el modelo base reporta resultados en el benchmark propio de AesCode (300 muestras de infografías) que superan a Qwen3-VL-32B base y se acercan a modelos frontera cerrados en calidad visual. La licencia es Apache 2.0 y el único idioma declarado es el inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal basada en Qwen3VLForConditionalGeneration (Qwen3-VL-32B-Instruct), con torre de visión y modelo de lenguaje |
| Parametros totales | 33.357.390.064 (~33,4B) |
| Parametros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | bf16 (esta build); la familia incluye variantes MLX 8-bit y 4-bit |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors en formato MLX (librería mlx) |

## Arquitectura y entrenamiento

El modelo es un finetune de Qwen3-VL-32B-Instruct, que a su vez es un transformer multimodal con torre de visión y modelo de lenguaje, empaquetado bajo la clase `Qwen3VLForConditionalGeneration`. La build aquí descrita no modifica el comportamiento del modelo: son los mismos pesos bf16 de 33,4B reempaquetados en formato MLX, conservando los 351 tensores de la torre de visión y los configs de visión y procesador. La ejecución se realiza con mlx-vlm sobre Apple Silicon.

El entrenamiento original de AesCode-32B se describe en el paper "AesCode: Aesthetic Code Generation with Decoupled Cross-Modal Rewards" (arXiv:2610.18860), que propone un esquema de recompensas cross-modales desacopladas para generar código estético. No se dispone en la información proporcionada del número de tokens de entrenamiento, la composición del dataset ni si se aplicaron fases de RLHF o DPO. La innovación destacable del modelo base es su enfoque de recompensas desacopladas orientado a la calidad visual del código generado, evaluado con un benchmark propio de 300 muestras de infografías.

## Capacidades

- Generación de código HTML y CSS a partir de una imagen de referencia o captura de pantalla (image-to-code).
- Generación de artefactos visuales ricos en información: presentaciones, pósters, dashboards y páginas de producto.
- Comprensión de imágenes y razonamiento visual: auditorías de páginas web (SEO, marketing, accesibilidad) y generación de textos alternativos para imágenes.
- Generación de texto y conversación multi-turno (pipeline image-text-to-text, tag conversational).
- Capacidades heredadas del backbone Qwen3-VL-32B-Instruct (razonamiento general y visión), si bien el finetune está orientado a código visual.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: limitadas al inglés según la model card.
- Ejecución local y offline en Apple Silicon, sin telemetría ni claves de API.

## Casos de uso

- Recreación de capturas de pantalla como HTML/CSS: se introduce una screenshot y una instrucción del tipo "recreate this screenshot as a single HTML file with inline CSS"; el modelo devuelve un único fichero HTML con estilos embebidos, útil para prototipado rápido de interfaces.
- Generación de páginas de producto: a partir de una imagen de referencia, el modelo produce el HTML/CSS de una página de producto con jerarquía visual, precios y llamadas a la acción, adecuado para equipos de e-commerce que iteran diseños.
- Creación de dashboards e infografías: el modelo genera maquetaciones con estructura de datos visual, aprovechando su entrenamiento específico en artefactos visuales ricos en información.
- Auditoría de accesibilidad y SEO asistida por visión: se le pasa una captura de una página real y devuelve análisis de metadatos, estructura de encabezados, breadcrumbs y textos alternativos para imágenes, como se documenta en la prueba con ineedhemp.com.
- Generación de alt-text y descripciones de imágenes: dado que conserva la torre de visión, puede describir imágenes de producto y generar textos alternativos utilizables en producción.
- Asistencia de código en local dentro de Claude Code: la model card indica que puede ejecutarse dentro de Claude Code Local en un Mac propio, de forma gratuita, privada y offline, para tareas de generación de código sin enviar datos a la nube.
- Prototipado de pósters y material de marketing: conversión de una referencia visual en maquetación HTML lista para renderizar o exportar.

## Benchmarks y rendimiento

Los datos provienen del paper de AesCode y de la model card del modelo base (benchmark propio de 300 muestras de infografías, con puntuación de seguimiento de reglas y calidad visual). No existe un leaderboard público independiente que liste AesCode.

| Modelo (con imagen de referencia) | Overall | Visual |
|---|---|---|
| AesCode-32B | 85,89 | 77,44 |
| Claude Opus 4.8 (sin referencia) | 76,78 | no disponible |
| GPT-5.5 (sin referencia) | 76,31 | no disponible |
| Qwen3-VL-32B base (con referencia) | 61,10 | no disponible |

Según la model card, AesCode-32B mejora en 22,4 puntos la calidad visual respecto al baseline Qwen3-VL-32B de la misma escala. Para benchmarks generales de visión del backbone, la model card remite a las evaluaciones oficiales de Qwen3-VL, que no corresponden a AesCode. No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM/espacio en disco: la build bf16 ocupa aproximadamente 62 GB en disco; el repo completo pesa 66,7 GB. Para inferencia en memoria unificada se requiere un Mac con al menos esa cantidad disponible; las variantes 8-bit y 4-bit reducen el requisito a aproximadamente la mitad y un cuarto, respectivamente.
- GPU recomendadas: Apple Silicon de la serie M (M-series) con memoria unificada suficiente; no está pensado para GPUs NVIDIA.
- ¿Cabe en consumer GPU? No en el sentido habitual (GPU dedicada con VRAM limitada); sí en Macs de gama alta con memoria unificada amplia. Para máquinas más pequeñas, la model card recomienda las variantes 8-bit o 4-bit.
- Opciones de despliegue: mlx-vlm sobre Apple Silicon (comando `python -m mlx_vlm.generate`); no se mencionan vLLM, llama.cpp, Ollama ni TGI en la información disponible.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento (benchmark AesCode, Overall) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| AesCode-32B-MLX-bf16 | 33,4B | no disponible | 85,89 (modelo base) | Apache 2.0 | Hugging Face (MLX, bf16/8-bit/4-bit) |
| Qwen3-VL-32B-Instruct (base) | ~32B | no disponible | 61,10 (con referencia) | no disponible en la información | Hugging Face |
| Claude Opus 4.8 | no disponible | no disponible | 76,78 (sin referencia) | propietaria | API cerrada |
| GPT-5.5 | no disponible | no disponible | 76,31 (sin referencia) | propietaria | API cerrada |

La comparación debe tomarse con cautela: las puntuaciones de los modelos cerrados se obtuvieron sin imagen de referencia, mientras que AesCode y Qwen3-VL base se evaluaron con referencia, según la model card.

## Limitaciones y advertencias

- El único idioma declarado es el inglés; el rendimiento en castellano u otros idiomas no está documentado.
- La longitud de contexto no se especifica en la información disponible, lo que impide planificar casos de uso con prompts o imágenes múltiples de forma fiable.
- Riesgo de alucinación en la lectura de imágenes y en la generación de código: la auditoría de ejemplo podría contener inferencias no verificadas sobre la página.
- El benchmark reportado es propio del autor del modelo base (300 muestras de infografías) y no ha sido validado por un leaderboard independiente.
- No hay datos publicados sobre sesgos, tool calling, razonamiento multi-paso ni rendimiento en código general más allá de HTML/CSS.
- La build MLX está atada al ecosistema Apple Silicon y a mlx-vlm; no es directamente portable a CUDA sin reconversión.
- Aunque la licencia es Apache 2.0, conviene verificar las condiciones del modelo base (microsoft/AesCode-32B) y del backbone Qwen3-VL para uso comercial en producción.
- El modelo está orientado a generación de código visual; su uso como modelo generalista de código o de texto puede dar resultados inferiores a alternativas específicas.

## Enlaces

- Hugging Face (esta build): https://huggingface.co/divinetribe/AesCode-32B-MLX-bf16
- Variante 8-bit: https://huggingface.co/divinetribe/AesCode-32B-MLX-8bit
- Variante 4-bit: https://huggingface.co/divinetribe/AesCode-32B-MLX-4bit
- Variante abliterated: https://huggingface.co/divinetribe/AesCode-32B-abliterated-MLX-bf16
- Modelo base: https://huggingface.co/microsoft/AesCode-32B
- Backbone: https://huggingface.co/Qwen/Qwen3-VL-32B-Instruct
- Paper: https://arxiv.org/abs/2610.18860
- mlx-vlm: https://github.com/Blaizzy/mlx-vlm
- Claude Code Local: https://github.com/nicedreamzapp/claude-code-local
- Perfil del autor en GitHub: https://github.com/nicedreamzapp
- Perfil del autor en Hugging Face: https://huggingface.co/divinetribe
