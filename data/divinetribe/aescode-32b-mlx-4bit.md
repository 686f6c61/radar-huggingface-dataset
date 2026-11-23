# divinetribe/AesCode-32B-MLX-4bit

## Resumen

AesCode-32B-MLX-4bit es una cuantización de 4 bits en formato MLX del modelo microsoft/AesCode-32B, publicada por el usuario divinetribe para su ejecución nativa en Apple Silicon. El modelo original es un finetune de Qwen/Qwen3-VL-32B-Instruct (arquitectura `Qwen3VLForConditionalGeneration`) especializado en generación de código estético: recibe una captura de pantalla y produce el HTML y CSS necesarios para recrearla (presentaciones, pósters, dashboards, páginas de producto). Esta build mantiene la torre de visión en bfloat16 (los 351 tensores `vision_tower.*` sin cuantizar) mientras cuantiza a 4 bits únicamente la torre de lenguaje, de modo que la ruta de imagen conserva su calidad.

El modelo resuelve un problema concreto: la generación de maquetación web fiel a una referencia visual, una tarea en la que los modelos generalistas suelen fallar en fidelidad de layout y estilos. AesCode se entrenó con recompensas multimodales desacopladas (paper arXiv:2610.18860) y reporta un 85,89 de puntuación global en el benchmark de sus autores frente a 61,10 del Qwen3-VL-32B base con imagen de referencia.

Esta cuantización ocupa unos 18 GB en disco (19,6 GB de repositorio) y está pensada para ejecutarse con `mlx-vlm` en Macs de la serie M, sin cloud ni telemetría. Es relevante ahora porque permite reproducir localmente un modelo multimodal de 33.357.390.064 parámetros en hardware de consumo Apple, algo impracticable en bf16 en la mayoría de equipos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal `Qwen3VLForConditionalGeneration` (torre de visión + torre de lenguaje), cuantizado en MLX |
| Parametros totales | 33.357.390.064 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | 4 bits en la torre de lenguaje; bf16 en la torre de visión (351 tensores) |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (MLX), librería `mlx` |
| Modelo base | microsoft/AesCode-32B (finetune de Qwen/Qwen3-VL-32B-Instruct) |
| Pipeline | image-text-to-text |
| Tamano en disco | ~18 GB (repo 19,6 GB) |
| Framework de ejecucion | mlx-vlm (Apple Silicon) |

## Arquitectura y entrenamiento

El modelo original es un transformer multimodal de tipo vision-language: una torre de visión que codifica la imagen de entrada y una torre de lenguaje autorregresiva que genera el código HTML/CSS condicionado por esa representación visual. AesCode-32B parte de Qwen3-VL-32B-Instruct y se afina específicamente para generación de código estético. El paper "AesCode: Aesthetic Code Generation with Decoupled Cross-Modal Rewards" (arXiv:2610.18860) describe el método de entrenamiento basado en recompensas multimodales desacopladas, que separan la señal de corrección (seguimiento de reglas) de la señal de calidad visual. No se dispone en la información proporcionada del número de tokens de entrenamiento ni de la composición exacta del dataset.

Esta build concreta no reentrena nada: aplica cuantización de 4 bits a los pesos de la torre de lenguaje y conserva en bfloat16 todos los tensores de la torre de visión, junto con `vision_config` y los configs del processor. El autor indica que cada tamaño de la familia pasa una puerta de calidad antes de publicarse: se introduce una captura real de una página de producto y se pide al modelo una auditoría SEO, de marketing y accesibilidad más textos alternativos de imagen; la build de 4 bits superó esa prueba nombrando elementos reales de la página y generando alt-text utilizable.

## Capacidades

- Generación de código HTML y CSS a partir de una captura de pantalla, con fidelidad de layout, tipografía y estilos.
- Reconstrucción de interfaces completas: presentaciones, pósters, dashboards, páginas de producto y landing pages.
- Comprensión de imágenes: lectura de estructura de página, jerarquía visual, elementos de navegación, formularios, badges y thumbnails.
- Auditoría de contenido web: SEO, marketing y accesibilidad, incluida la generación de textos alternativos para imágenes.
- Conversación multi-turno en modalidad image-text-to-text.
- Capacidades heredadas del backbone Qwen3-VL-32B-Instruct (razonamiento general y código), aunque el finetune está orientado a la tarea estética.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Capacidades de agente y multi-step reasoning: no disponible en la informacion proporcionada.
- Capacidades multilingües: limitadas al inglés según la model card.
- Modo thinking, audio: no disponible en la informacion proporcionada.

## Casos de uso

- Recreación de maquetas a partir de diseños: se introduce una captura de un mockup y el modelo devuelve un único archivo HTML con CSS inline listo para revisar, gracias a su entrenamiento específico en fidelidad visual.
- Prototipado rápido de interfaces: convertir screenshots de referencia en código funcional para validar ideas antes de invertir en desarrollo frontend.
- Migración de diseños legacy: a partir de capturas de una web antigua, generar una base HTML/CSS moderna que sirva de punto de partida para el rediseño.
- Auditoría de accesibilidad y SEO: el modelo lee la página y produce informes con alt-text, estructura semántica y recomendaciones, como demuestra la prueba de calidad descrita en la model card.
- Generación de páginas de producto para e-commerce: reconstruir fichas con galería de imágenes, precio, badges de confianza y botones de compra a partir de una captura.
- Desarrollo local y privado en Mac: usar el modelo dentro de Claude Code Local (proyecto del mismo autor) para generar y revisar código sin enviar capturas ni código a servicios cloud.
- Creación de dashboards y slides: transformar capturas de paneles de datos o presentaciones en HTML/CSS reproducible.

## Benchmarks y rendimiento

Los datos disponibles provienen del paper de AesCode y de la model card del modelo original, no de una evaluación independiente de esta cuantización. El benchmark consta de 300 muestras de estilo infográfico, puntuadas por corrección en el seguimiento de reglas y calidad visual.

| Modelo (con imagen de referencia) | Overall | Visual |
|---|---|---|
| AesCode-32B | 85,89 | 77,44 |
| Claude Opus 4.8 (sin referencia) | 76,78 | no disponible |
| GPT-5.5 (sin referencia) | 76,31 | no disponible |
| Qwen3-VL-32B base (con referencia) | 61,10 | no disponible |

No se han publicado resultados de benchmarks específicos de la versión MLX-4bit en la información disponible. Para evaluaciones de visión general del backbone, el autor remite a las evaluaciones oficiales de Qwen3-VL-32B-Instruct.

## Requisitos de hardware

- VRAM/unified memory estimada: ~18 GB en disco para los pesos de 4 bits; se recomienda al menos 24 GB de memoria unificada para cargar el modelo con margen para el contexto y la imagen.
- GPU recomendadas: Apple Silicon de la serie M con 24 GB o más (M2 Pro/Max, M3 Pro/Max, M4 Pro/Max). No está pensado para GPU NVIDIA ni CUDA.
- Cabe en GPU de consumo: sí, en Macs de la serie M con memoria unificada suficiente; no aplica a GPUs discretas convencionales por el formato MLX.
- Opciones de despliegue: `mlx-vlm` (librería oficial de ejecución); integración con Claude Code Local para uso como asistente de código local.
- Latencia y throughput: no disponible en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| AesCode-32B-MLX-4bit | 33,36 B | no disponible | Imagen a HTML/CSS, 4 bits MLX | apache-2.0 | Hugging Face, Apple Silicon |
| AesCode-32B-MLX-8bit | 33,36 B | no disponible | Imagen a HTML/CSS, 8 bits MLX | apache-2.0 | Hugging Face, Apple Silicon |
| AesCode-32B-MLX-bf16 | 33,36 B | no disponible | Imagen a HTML/CSS, precisión completa | apache-2.0 | Hugging Face, Apple Silicon |
| Qwen3-VL-32B-Instruct | ~32 B | no disponible | Vision-language general | no disponible | Hugging Face |

La comparación relevante es con las otras dos builds de la misma familia: 4 bits ocupa un cuarto del tamaño del bf16 con una pérdida de precisión limitada en la torre de lenguaje y nula en la de visión; 8 bits ocupa la mitad. Frente al Qwen3-VL-32B-Instruct base, AesCode reporta 85,89 frente a 61,10 en el benchmark de los autores, aunque esa comparación mide la tarea específica de generación estética y no capacidades generales de visión.

## Limitaciones y advertencias

- La cuantización a 4 bits reduce precisión: puede degradar la fidelidad del código generado en casos complejos respecto a bf16, aunque el autor reporta que la ruta de visión se mantiene intacta.
- El modelo está entrenado y etiquetado únicamente para inglés; el rendimiento en otros idiomas no está garantizado.
- Riesgo de alucinación: como todo modelo generativo, puede inventar elementos de la imagen, clases CSS o contenido no presente en la captura.
- El benchmark de 85,89 proviene de los autores del modelo original, con 300 muestras de su propio conjunto; no hay leaderboard independiente que liste AesCode.
- No se dispone de datos sobre longitud de contexto máxima, lo que limita la planificación de aplicaciones con documentos o conversaciones largas.
- Licencia apache-2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base Qwen3-VL-32B-Instruct y del finetune original de Microsoft.
- Dependencia exclusiva de Apple Silicon y `mlx-vlm`: no es portable a CUDA ni a otros runtimes sin reconversión.
- Los datos de descargas y estrellas de la model card son métricas del autor y no indican calidad técnica.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/divinetribe/AesCode-32B-MLX-4bit
- Modelo base: https://huggingface.co/microsoft/AesCode-32B
- Backbone: https://huggingface.co/Qwen/Qwen3-VL-32B-Instruct
- Paper: https://arxiv.org/abs/2610.18860
- Build bf16: https://huggingface.co/divinetribe/AesCode-32B-MLX-bf16
- Build 8 bits: https://huggingface.co/divinetribe/AesCode-32B-MLX-8bit
- Claude Code Local: https://github.com/nicedreamzapp/claude-code-local
- mlx-vlm: https://github.com/Blaizzy/mlx-vlm
- Perfil del autor: https://huggingface.co/divinetribe
- GitHub del autor: https://github.com/nicedreamzapp
- Web del autor: https://nicedreamzwholesale.com/software/huggingface/
