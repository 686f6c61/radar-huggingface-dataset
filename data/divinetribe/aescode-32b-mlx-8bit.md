# divinetribe/AesCode-32B-MLX-8bit

## Resumen

AesCode-32B-MLX-8bit es una cuantización de 8 bits en formato MLX del modelo microsoft/AesCode-32B, un finetune de Qwen/Qwen3-VL-32B-Instruct orientado a la generación de código estético: recibe una captura de pantalla y produce el HTML y CSS necesarios para recrearla (presentaciones, pósters, dashboards, páginas de producto). Lo publica el usuario divinetribe, no el equipo original de Microsoft, y está pensado específicamente para ejecutarse en Apple Silicon mediante la librería mlx-vlm.

La particularidad de esta build es que solo cuantiza la torre de lenguaje a 8 bits, mientras que los 351 tensores de `vision_tower.*` se mantienen en bfloat16, de modo que la ruta visual conserva su precisión original. El resultado ocupa unos 34 GB en disco, aproximadamente la mitad que la versión bf16 de la misma familia, y mantiene intactos los configs de visión y del procesador.

El modelo base parte de la arquitectura Qwen3-VL (transformer multimodal con torre de visión y torre de lenguaje) con 33.357.390.064 parámetros reales según safetensors, licencia Apache 2.0 y soporte únicamente de inglés. Es relevante para quienes quieren ejecutar localmente, sin nube ni telemetría, un modelo de generación de UI a partir de imágenes en un Mac con suficiente memoria unificada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3VLForConditionalGeneration (transformer multimodal: torre de visión + torre de lenguaje) |
| Parametros totales | 33.357.390.064 |
| Parametros activos | no disponible (no es MoE según la información proporcionada) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 8 bits en la torre de lenguaje; bf16 en la torre de visión (351 tensores `vision_tower.*`) |
| Idiomas soportados | inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (formato MLX, librería mlx) |

## Arquitectura y entrenamiento

El modelo es un finetune de Qwen3-VL-32B-Instruct, es decir, un transformer multimodal con una torre de visión que procesa la imagen de entrada y una torre de lenguaje que genera la secuencia de HTML/CSS. La model card del build MLX no detalla la composición del dataset de entrenamiento ni el número de tokens utilizados; solo indica que el modelo original se describe en el paper "AesCode: Aesthetic Code Generation with Decoupled Cross-Modal Rewards" (arXiv:2610.18860), donde se introduce el enfoque de recompensas multimodales desacopladas para la generación de código estético. No se especifica en la información disponible si hubo RLHF, DPO u otras etapas de alineamiento.

La innovación técnica de esta publicación concreta no está en el entrenamiento sino en la cuantización selectiva: se aplica 8 bits solo a la torre de lenguaje y se preserva la torre de visión en bf16, junto con los configs de visión y del procesador. El autor declara haber validado la calidad visual de cada build antes de publicarla, alimentando una captura real de una página de producto y comprobando que el modelo seguía identificando elementos on-page y generando alt-text utilizable. No se documentan técnicas como decodificación especulativa o atención lineal en la información proporcionada.

## Capacidades

- Generación de código HTML y CSS a partir de una imagen de referencia (image-to-code), orientada a recrear interfaces visuales.
- Comprensión de imágenes: lectura de capturas de pantalla con elementos de UI, texto, badges, botones y jerarquía visual.
- Generación de alt-text para imágenes a partir del contenido de la página.
- Auditorías combinadas de SEO, marketing y accesibilidad sobre páginas web a partir de su captura.
- Generación de texto y razonamiento general heredados de Qwen3-VL-32B-Instruct.
- Soporte de conversación multi-turno (pipeline `image-text-to-text`, tag `conversational`).
- Capacidades multilingües limitadas al inglés según la model card.
- No se documenta en la información disponible soporte explícito de tool calling, function calling ni modos de agente multi-paso.

## Casos de uso

- Recreación de mockups en HTML/CSS: se introduce una captura de un diseño (póster, slide, dashboard) y el modelo devuelve un único archivo HTML con CSS inline, útil para prototipado rápido de front-end sin escribir el marcado a mano.
- Auditoría de accesibilidad y SEO de páginas existentes: a partir de una captura real, el modelo identifica el H1, los badges de confianza, los botones de compra y propone alt-text para las imágenes, como se documenta en la validación del propio autor sobre ineedhemp.com.
- Generación de páginas de producto para e-commerce: el modelo lee la estructura visual de una ficha de producto de referencia y genera el HTML/CSS correspondiente, acelerando la creación de plantillas.
- Creación de dashboards y paneles de datos: dada una imagen de un dashboard, produce el marcado y los estilos para reproducir la disposición de tarjetas, gráficos y métricas.
- Asistencia en Claude Code Local: la model card indica que puede ejecutarse dentro de Claude Code Local en un Mac, de forma gratuita, privada y offline, para tareas de generación de UI en local.
- Prototipado offline en entornos con requisitos de privacidad: al ejecutarse con mlx-vlm sin API keys ni telemetría, es adecuado para equipos que no pueden enviar capturas de sus productos a servicios en la nube.
- Generación de presentaciones y material gráfico: a partir de una slide de referencia, el modelo produce el HTML/CSS para replicar la composición tipográfica y visual.

## Benchmarks y rendimiento

Los datos disponibles provienen del paper y la model card del modelo original microsoft/AesCode-32B, no de una evaluación independiente de esta cuantización. El benchmark cubre 300 muestras de estilo infográfico, puntuadas por corrección en el seguimiento de reglas y calidad visual.

| Modelo (con imagen de referencia) | Overall | Visual |
|---|---|---|
| AesCode-32B | 85.89 | 77.44 |
| Claude Opus 4.8 (sin referencia) | 76.78 | no disponible |
| GPT-5.5 (sin referencia) | 76.31 | no disponible |
| Qwen3-VL-32B base (con referencia) | 61.10 | no disponible |

No se han publicado resultados de benchmarks específicos de esta cuantización MLX 8-bit en la información disponible. El autor solo documenta una validación cualitativa de la ruta visual sobre una captura real.

## Requisitos de hardware

- VRAM/memoria unificada estimada: unos 34 GB en disco; en ejecución se requiere memoria unificada suficiente para cargar los pesos (aproximadamente 34 GB más overhead del runtime y del contexto).
- Plataforma objetivo: Apple Silicon (M-series). El modelo está empaquetado en formato MLX y pensado para `mlx-vlm`.
- GPUs consumer: no está pensado para GPUs NVIDIA; el formato MLX es específico de Apple Silicon. En Macs, requiere configuraciones con memoria unificada alta (por ejemplo, chips M-series con 48 GB o más para operar con margen).
- Opciones de despliegue: `mlx-vlm` (comando `python -m mlx_vlm.generate`); también se menciona su uso dentro de Claude Code Local. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI para este build.
- Latencia y throughput: no disponible en la información proporcionada.
- Alternativas de tamaño en la misma familia: bf16 (calidad completa) y 4 bits (un cuarto del tamaño), publicadas por el mismo autor.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| AesCode-32B-MLX-8bit (esta ficha) | 33.357.390.064 | no disponible | Image-to-code (HTML/CSS), 8 bits MLX | Apache 2.0 | Hugging Face, mlx-vlm |
| microsoft/AesCode-32B | 32B (aprox.) | no disponible | Image-to-code, precisión original | Apache 2.0 | Hugging Face |
| Qwen/Qwen3-VL-32B-Instruct | 32B (aprox.) | no disponible | Visión-lenguaje general | no disponible en la información | Hugging Face |
| AesCode-32B-MLX-bf16 / 4bit | 32B (aprox.) | no disponible | Misma tarea, distinta precisión | Apache 2.0 | Hugging Face |

La comparación relevante es frente al modelo original de Microsoft (misma tarea, sin cuantizar) y frente a su backbone Qwen3-VL-32B-Instruct (visión general, sin el finetune estético). No se dispone de datos de contexto ni de benchmarks independientes para establecer comparaciones cuantitativas adicionales.

## Limitaciones y advertencias

- Solo soporta inglés según la model card; no se garantiza calidad en castellano u otros idiomas.
- La cuantización a 8 bits reduce precisión: el autor advierte explícitamente que no añade conocimiento ni garantiza corrección de la salida.
- Riesgo de alucinación inherente a los modelos generativos: puede inventar elementos de la interfaz que no están en la captura o producir HTML/CSS que no reproduzca fielmente el diseño.
- Los benchmarks citados corresponden al modelo original, no a esta cuantización; no hay evaluación independiente de la build MLX 8-bit.
- El benchmark del paper usa 300 muestras de estilo infográfico y no cubre todos los tipos de UI posibles.
- Requiere hardware Apple Silicon con memoria unificada elevada; no es desplegable en GPUs NVIDIA ni en la mayoría de entornos cloud estándar sin conversión.
- Es una publicación de terceros (divinetribe), no del equipo de Microsoft; la responsabilidad sobre la integridad de la cuantización recae en el publicador.
- Licencia Apache 2.0: permite uso comercial, pero conviene verificar las condiciones del modelo base y del backbone Qwen3-VL antes de producción.
- No se documenta soporte de tool calling ni de flujos de agente, lo que limita su integración en pipelines automatizados complejos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/divinetribe/AesCode-32B-MLX-8bit
- Modelo base: https://huggingface.co/microsoft/AesCode-32B
- Backbone: https://huggingface.co/Qwen/Qwen3-VL-32B-Instruct
- Paper: https://arxiv.org/abs/2610.18860
- Variante bf16: https://huggingface.co/divinetribe/AesCode-32B-MLX-bf16
- Variante 4 bits: https://huggingface.co/divinetribe/AesCode-32B-MLX-4bit
- Claude Code Local: https://github.com/nicedreamzapp/claude-code-local
- mlx-vlm: https://github.com/Blaizzy/mlx-vlm
- Perfil del autor en Hugging Face: https://huggingface.co/divinetribe
- GitHub del autor: https://github.com/nicedreamzapp
- Más modelos del autor: https://nicedreamzwholesale.com/software/huggingface/
