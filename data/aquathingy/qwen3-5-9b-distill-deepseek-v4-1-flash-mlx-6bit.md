# aquathingy/Qwen3.5-9B-Distill-DeepSeek-V4.1-Flash-MLX-6bit

## Resumen

Qwen3.5-9B-Distill-DeepSeek-V4.1-Flash-MLX-6bit es una conversión a formato MLX, cuantizada a 6 bits, del fine-tune `kevinzhou21/Qwen3.5-9B-Distill-Deepseek-V4.1-Flash-20261004`. Se trata de un modelo vision-language (texto e imagen) construido sobre la arquitectura Qwen3.5-9B, que a su vez ha sido ajustado mediante LoRA con destilación a partir de DeepSeek-V4.1-Flash. El resultado conserva la torre de visión completa del modelo original y añade el sesgo de razonamiento del modelo profesor.

El modelo cuenta con 9.409.813.744 parámetros y un repositorio de 7,8 GB en pesos safetensors. La variante aquí descrita aplica cuantización afín de 6 bits con tamaño de grupo 64 a todas las capas lineales y de embedding cuantizables, incluida la torre de visión, manteniendo en fp16 las normas, los kernels convolucionales, el embedding posicional de visión y la capa `mlp.linear_fc2` de la torre visual.

Su relevancia radica en que ofrece un modelo multimodal de ~9B en un paquete de 7,3 GB apto para ejecutarse en Apple Silicon mediante MLX, con una degradación mínima frente a fp16: perplejidad de 4,106 frente a 4,081, KL medio de 0,0027 y una concordancia top-1 del 96,3% medida sobre un pasaje de 135 tokens en inglés, código y matemáticas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Qwen3.5 con atención híbrida (GatedDeltaNet de atención lineal y atención completa) y torre de visión |
| Parametros totales | 9.409.813.744 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 6 bits afín, grupo 64 (MLX); variantes disponibles en fp16, 8 bits y 8 bits MLP + 16 bits resto |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

El modelo base es Qwen3.5-9B, un transformer con capas de atención lineal GatedDeltaNet combinadas con atención completa, y una torre de visión que procesa imágenes junto al texto. Sobre ese modelo se aplicó un fine-tune LoRA destilado desde DeepSeek-V4.1-Flash, del que hereda el estilo de razonamiento. La conversión a MLX se realizó con gguf2mlx 2.2.0 más correcciones: mapeo de `blk.N.post_attention_norm`, omisión del bloque draft MTP/NextN (la cabeza MTP no se incluye, ya que mlx-lm y mlx-vlm la descartan), y tres correcciones sobre la salida de GatedDeltaNet (deshacer el reordenamiento de value-head de llama.cpp, aplicar `A_log = log(-ssm_a)` y eliminar un −1 espurio en `linear_attn.norm`). Tras las correcciones, esos tensores coinciden con `Qwen/Qwen3.5-9B` a precisión fp16.

La torre de visión se convirtió desde el GGUF mmproj con un mapeador personalizado, al no existir adaptador VLM de Qwen3.5 en gguf2mlx, y el resultado es bit-idéntico a los pesos de visión de `Qwen/Qwen3.5-9B` (333/333 tensores). El tokenizador, la configuración del procesador y la plantilla de chat provienen de `Qwen/Qwen3.5-9B`. La cuantización se aplicó con `mlx_lm.utils.quantize_model` sobre el VLM completo. No se dispone de datos sobre el número de tokens de entrenamiento, la composición del dataset ni si se emplearon RLHF o DPO en el fine-tune.

## Capacidades

- Generación de texto conversacional multi-turno.
- Comprensión de imágenes y respuesta imagen-texto (pipeline `image-text-to-text`).
- Razonamiento con modo "thinking": la plantilla de chat genera por defecto bloques `<think>…</think>`, desactivables con `enable_thinking=False`.
- Razonamiento matemático y STEM, heredado de la destilación desde DeepSeek-V4.1-Flash.
- Generación de código (el pasaje de validación de la cuantización incluye código).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.

## Casos de uso

- Descripción y análisis de imágenes en local: mediante `mlx-vlm` o LM Studio con el motor MLX, el modelo acepta una imagen y un prompt para generar descripciones, resúmenes o respuestas sobre el contenido visual, sin salir del equipo.
- Asistente conversacional en Apple Silicon: con 7,3 GB de pesos en 6 bits, cabe en Macs con memoria unificada moderada y permite conversaciones multi-turno con modo thinking para tareas de razonamiento.
- Resolución de problemas matemáticos y STEM: la destilación desde DeepSeek-V4.1-Flash concentra señal de razonamiento en este tipo de tareas, útil para asistencia en estudios o prototipos de tutoría.
- Generación y explicación de código en flujos de desarrollo local: el modelo puede integrarse en editores o scripts mediante `mlx-lm` (modo solo texto) para autocompletado, explicación de fragmentos y refactorización.
- Prototipado de aplicaciones multimodales: al ser un VLM completo con torre de visión, sirve para validar pipelines de imagen-texto en macOS antes de migrar a despliegues mayores.
- Evaluación de cuantizaciones: la familia de variantes (fp16, 8 bits, 6 bits) permite comparar el equilibrio entre tamaño y fidelidad (perplejidad, KL, concordancia top-1) en un mismo modelo.
- Extracción de información de documentos escaneados o capturas: el modelo puede recibir la imagen y responder preguntas sobre su contenido en un entorno local.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La model card incluye únicamente métricas de fidelidad de cuantización frente a fp16, medidas sobre un pasaje de 135 tokens en inglés, código y matemáticas, y descritas por el autor como una comprobación rápida y no como un benchmark:

| Variante | bits/peso | Tamano | Perplejidad | KL medio vs fp16 | Concordancia top-1 |
|---|---|---|---|---|---|
| fp16 | 16 | 18 GB | 4,081 | – | – |
| 8bit-mlp-16bit-rest | 12,0 | 13 GB | 4,085 | 0,00007 | 100% |
| 8bit | 8,6 | 9,5 GB | 4,086 | 0,00017 | 99,3% |
| 6bit (esta variante) | 6,6 | 7,3 GB | 4,106 | 0,0027 | 96,3% |

## Requisitos de hardware

- VRAM/memoria estimada: 7,3 GB de pesos en 6 bits; el repositorio completo ocupa 7,8 GB. Hay que sumar la memoria del contexto y de la torre de visión en fp16.
- Hardware objetivo: Apple Silicon con MLX (memoria unificada). No se indica compatibilidad con GPU NVIDIA en esta variante.
- Cabe en equipos de consumo: sí, en Macs con memoria unificada suficiente (orientativamente 16 GB o más, aunque el dato exacto no está disponible en la información proporcionada).
- Despliegue: LM Studio (motor MLX, con entrada de imagen), `mlx-vlm` (texto e imágenes) y `mlx-lm` (solo texto; la torre de visión se ignora).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Qwen3.5-9B-Distill-DeepSeek-V4.1-Flash-MLX-6bit | 9,41B | no disponible | safetensors MLX 6 bits | Apache-2.0 | Esta ficha; VLM completo, 7,3 GB |
| Qwen3.5-9B-Distill-DeepSeek-V4.1-Flash-MLX-fp16 | 9,41B | no disponible | safetensors MLX fp16 | Apache-2.0 | Misma familia, 18 GB, perplejidad 4,081 |
| Qwen3.5-9B-Distill-DeepSeek-V4.1-Flash (GGUF) | 9,41B | no disponible | GGUF | no disponible | Modelo fuente en GGUF, 4,13 GB, 47.813 descargas y 346 likes |
| Jackrong/DeepSeek-V4-Pro-Qwen3.5-9B | ~9B | no disponible | no disponible | no disponible | Fine-tune de Qwen3.5-9B destilado de DeepSeek-V4-Pro, centrado en matemáticas y STEM |

## Limitaciones y advertencias

- La licencia Apache-2.0 se declara por derivación de `Qwen/Qwen3.5-9B`, pero el fine-tune fuente no declara licencia propia; conviene revisar el repositorio de origen por si añade términos adicionales.
- Las métricas de fidelidad de cuantización proceden de un único pasaje de 135 tokens; no son representativas del rendimiento general y la concordancia top-1 del 96,3% implica divergencias respecto a fp16 en algunas predicciones.
- No se han publicado benchmarks estándar ni evaluaciones de sesgo, alucinación o robustez.
- No hay información sobre idiomas soportados ni sobre calidad en castellano.
- No hay información sobre la longitud de contexto efectiva ni sobre soporte de tool calling o agentes.
- El modo thinking está activado por defecto en la plantilla de chat; en producción puede aumentar la latencia y el consumo de tokens si no se desactiva con `enable_thinking=False`.
- La variante está pensada para MLX (Apple Silicon); no es directamente desplegable en vLLM, TGI ni llama.cpp sin conversión adicional.
- El bloque MTP/NextN no se incluye, por lo que no se dispone de decodificación especulativa nativa en este paquete.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta, lo que limita la evidencia de uso en producción.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/aquathingy/Qwen3.5-9B-Distill-DeepSeek-V4.1-Flash-MLX-6bit
- Modelo base del fine-tune: https://huggingface.co/kevinzhou21/Qwen3.5-9B-Distill-Deepseek-V4.1-Flash-20261004
- Variante fp16: https://huggingface.co/aquathingy/Qwen3.5-9B-Distill-DeepSeek-V4.1-Flash-MLX-fp16
- Variante 8 bits: https://huggingface.co/aquathingy/Qwen3.5-9B-Distill-DeepSeek-V4.1-Flash-MLX-8bit
- Variante 8 bits MLP + 16 bits resto: https://huggingface.co/aquathingy/Qwen3.5-9B-Distill-DeepSeek-V4.1-Flash-MLX-8bit-mlp-16bit-rest
- Modelo Qwen3.5-9B original: https://huggingface.co/Qwen/Qwen3.5-9B
- Licencia: https://huggingface.co/Qwen/Qwen3.5-9B/blob/main/LICENSE
- Ficha del GGUF en local-ai-zone: https://local-ai-zone.github.io/models/qwen3-5-9b-deepseek-v4-flash.html
- Fine-tune alternativo DeepSeek-V4-Pro-Qwen3.5-9B: https://huggingface.co/Jackrong/DeepSeek-V4-Pro-Qwen3.5-9B
