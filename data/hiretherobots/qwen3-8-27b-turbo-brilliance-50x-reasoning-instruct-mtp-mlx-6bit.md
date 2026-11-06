# HireTheRobots/Qwen3.8-27B-Turbo-Brilliance-50X-Reasoning-Instruct-MTP-MLX-6bit

## Resumen

Qwen3.8-27B-Turbo-Brilliance-50X-Reasoning-Instruct-MTP-MLX-6bit es una conversión no oficial al formato MLX del modelo de razonamiento e instrucción de DavidAU, derivado de la familia Qwen3.8 (arquitectura `qwen3_5`). El modelo original se distribuye en GGUF y esta versión lo adapta a Apple Silicon mediante la librería `mlx-vlm`, manteniendo intactos los pesos, el tokenizador, la torre de visión y la plantilla de chat del autor original. El repositorio lo publica el usuario HireTheRobots y cuenta con 27.356.728.560 parámetros totales (unos 27,36 mil millones), empaquetados en 24,0 GB por la cuantización afín de 6 bits.

Se trata de un modelo multimodal de tipo image-text-to-text, con capacidad de razonamiento explícito (modo thinking), instrucción directa y una cabeza MTP (multi-token prediction) que actúa como drafter para decodificación especulativa. La cuantización es afín MLX con tamaño de grupo 64 y `lm_head` en 8 bits, una decisión heredada de las recomendaciones del autor original para preservar la calidad de la capa de salida. El repositorio incluye además el script de conversión `gguf2mlx.py` para reproducir el proceso o generar otras anchuras de bits.

La relevancia de esta ficha es doble: por un lado, documenta una de las pocas vías prácticas para ejecutar un modelo de 27B con visión y razonamiento en hardware Apple; por otro, ilustra el ecosistema de derivados comunitarios que rodea a Qwen y a los finetunes de DavidAU, con modos de razonamiento configurables mediante etiquetas en la plantilla de chat. La licencia Apache 2.0 del repositorio facilita su uso comercial, aunque con las advertencias habituales sobre modelos derivados no oficiales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (familia `qwen3_5` / Qwen3.8) con cabeza MTP para decodificación especulativa |
| Parametros totales | 27.356.728.560 (~27,36B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Afín MLX de 6 bits (group size 64), `lm_head` en 8 bits; drafter MTP en bf16; torre de visión sin cuantizar |
| Idiomas soportados | en (inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX), 24,0 GB en total |

## Arquitectura y entrenamiento

La arquitectura subyacente es un transformer multimodal de la familia Qwen3.8 (etiquetada como `qwen3_5` en los metadatos), con una torre de visión acoplada que procesa imágenes junto al texto. El repositorio no entrena el modelo: únicamente convierte el GGUF original de DavidAU al formato MLX, preservando la torre de visión sin cuantizar (bit-idéntica al `mmproj-BF16.gguf` del autor) y el tokenizador de Qwen3.8 con vocabulario y merges idénticos. La cuantización se aplica solo al cuerpo del modelo, dejando el `lm_head` en 8 bits porque, según la model card del autor original, la salida en mayor precisión es lo que mejora la calidad de los cuantizados MAX.

La innovación técnica destacable es la cabeza MTP (multi-token prediction), extraída del GGUF original y distribuida como drafter independiente `qwen3_5_mtp` en bf16. Esta cabeza reutiliza los embeddings y la capa de salida del modelo principal, por lo que no depende de la anchura de bits. Se emplea con decodificación especulativa en `mlx-vlm` con un tamaño de bloque de 3. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO en el modelo original; la model card remite a la ficha de DavidAU para esos detalles.

## Capacidades

- Generación de texto y razonamiento explícito en modo thinking (`--enable-thinking`), con modos de razonamiento, instrucción y `xhigh` gestionados por la plantilla de chat.
- Comprensión de imágenes y texto combinados (pipeline `image-text-to-text`), gracias a la torre de visión de Qwen3.8-27B.
- Generación de código, con un modo específico (`{REASON:coder}`) orientado a tareas de programación.
- Razonamiento multi-paso y matemáticas, derivados de la familia Qwen3.8.
- Decodificación especulativa mediante la cabeza MTP incluida, con `draft_kind=mtp` y `draft_block_size` configurable.
- Sistema de ayuda interno mediante etiquetas en el prompt (por ejemplo, `{REASON:help}`), que expone un menú de ayuda detallado.
- Multilingüe limitado: la model card declara únicamente inglés.
- No se documenta soporte explícito de tool calling ni function calling en la información disponible.

## Casos de uso

- Razonamiento asistido en local sobre Mac: el modelo permite ejecutar un 27B con modo thinking en Apple Silicon de 36 GB o más, útil para análisis técnicos y resolución de problemas paso a paso sin depender de la nube.
- Generación de código en el escritorio: el modo `{REASON:coder}` y la ventana de 2048 tokens de salida configurable lo hacen adecuado para tareas de programación interactivas, como invertir una lista enlazada o explicar fragmentos de código.
- Análisis de imágenes con descripción textual: al ser image-text-to-text, puede procesar capturas, diagramas o documentos escaneados y generar explicaciones o resúmenes en inglés.
- Prototipado de agentes de razonamiento: la plantilla de chat con etiquetas de modo permite construir flujos donde el modelo alterna entre razonamiento profundo y respuestas directas según el contexto.
- Investigación sobre decodificación especulativa: el repositorio incluye el drafter MTP y el script de conversión, lo que lo convierte en un banco de pruebas para medir aceptación de tokens y latencia en distintas anchuras de bits.
- Evaluación comparativa de cuantizaciones: al existir versiones de 3, 4, 5, 6 y 8 bits con el mismo drafter, sirve para estudiar el compromiso entre perplejidad, divergencia KL y velocidad en hardware Apple.
- Despliegue educativo o de demostración: la licencia Apache 2.0 y el formato MLX facilitan su uso en talleres y entornos de aprendizaje sobre modelos multimodales.

## Benchmarks y rendimiento

La model card proporciona métricas de calidad de cuantización y velocidad medidas en un Apple M5 Pro de 48 GB con `mlx-vlm` 0.7.10, 512 tokens greedy y bloque MTP de 3. No se publican resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

| Bits | Tamano | Perplejidad* | KL vs 8-bit* | Mismo token top que 8-bit* | tok/s sin MTP | tok/s con MTP |
|---|---|---|---|---|---|---|
| 3-bit | 14,4 GB | 3,08 | 0,451 | 79,6% | 21,2 | 17,7 |
| 4-bit | 17,6 GB | 2,37 | 0,170 | 89,5% | 17,4 | 29,8 |
| 5-bit | 20,8 GB | 2,19 | 0,045 | 93,9% | 14,6 | 20,7 |
| 6-bit (este repo) | 24,0 GB | 2,15 | 0,014 | 96,8% | 11,9 | 10,4 |
| 8-bit | 30,4 GB | 2,15 | referencia | referencia | 8,8 | 18,1 |

\* Perplejidad sobre una mezcla de ~4,5k tokens de inglés y Python; KL y acuerdo de token top medidos en cada posición del mismo texto frente al build de 8 bits.

En el caso de 6 bits, el drafter MTP funciona pero no acelera: el kernel de verificación por lotes de `mlx-vlm` solo soporta 4, 5 y 8 bits, por lo que cada token propuesto se verifica de uno en uno y el coste supera el ahorro. Por eso la velocidad con MTP (10,4 tok/s) es inferior a la velocidad sin MTP (11,9 tok/s) en este build concreto.

## Requisitos de hardware

- VRAM/espacio unificado estimado: 24,0 GB de pesos en 6 bits; se recomienda un Mac con 36 GB de memoria unificada para contextos normales y más de 36 GB para contextos largos.
- GPU recomendadas: Apple Silicon con memoria unificada suficiente (M-series Pro/Max/Ultra). No está pensado para GPUs NVIDIA ni CUDA.
- Cabe en GPU de consumo: sí, en equipos Apple con 36 GB o más; para 32 GB conviene bajar a 4 o 5 bits según la tabla del autor.
- Opciones de despliegue: `mlx-vlm` (CLI `mlx_vlm.generate` o API Python `stream_generate`); no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI en este repositorio.
- Latencia y throughput: medidos en Apple M5 Pro 48 GB a 11,9 tok/s sin MTP y 10,4 tok/s con MTP en 6 bits; el 4-bit alcanza 29,8 tok/s con MTP. Los ratios entre anchuras deberían mantenerse en otros chips.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Este modelo (6-bit MLX) | ~27,36B | no disponible | safetensors MLX | Apache 2.0 | Multimodal, MTP, orientado a Apple Silicon |
| DavidAU Qwen3.8-27B-Turbo-Brilliance-50X-...-NEO-MAX-MTP-GGUF | ~27,36B | no disponible | GGUF | Apache 2.0 (según metadatos) | Modelo base original, cuantización GGUF |
| HireTheRobots MLX 4-bit | ~27,36B | no disponible | safetensors MLX | Apache 2.0 | 17,6 GB, perplejidad 2,37, hasta 29,8 tok/s con MTP |
| HireTheRobots MLX 8-bit | ~27,36B | no disponible | safetensors MLX | Apache 2.0 | 30,4 GB, referencia de calidad, 18,1 tok/s con MTP |

No se dispone de datos de benchmarks estándar para comparar con modelos de otras familias; la comparación se limita a las variantes de cuantización del mismo modelo.

## Limitaciones y advertencias

- Es una conversión no oficial: el autor recomienda usar una release oficial de DavidAU en MLX o safetensors si llegara a publicarse.
- Solo se declara inglés como idioma soportado; el rendimiento en castellano u otros idiomas no está garantizado.
- No se documenta la longitud de contexto soportada, lo que dificulta planificar despliegues con ventanas largas.
- El drafter MTP no aporta aceleración en 6 bits con `mlx-vlm` 0.7.10; hay que omitir los flags `--draft-*` hasta que se añada soporte para 6 bits.
- La perplejidad de 2,15 y el KL de 0,014 indican buena fidelidad frente al 8-bit, pero el 3-bit cae a 79,6% de acuerdo en token top y no es recomendable para producción.
- Riesgo de alucinación inherente a los modelos de razonamiento de esta escala; no hay evaluación independiente publicada en la información disponible.
- Sesgos conocidos: no disponibles en la model card; al derivar de Qwen3.8 y de un finetune comunitario, hereda los sesgos de ambas fuentes.
- La licencia Apache 2.0 del repositorio facilita el uso comercial, pero conviene verificar la licencia y condiciones del modelo base de DavidAU antes de desplegar.
- El sistema de etiquetas `{REASON:...}` depende de la plantilla de chat incluida; modificarla puede romper los modos de razonamiento.
- Requiere hardware Apple Silicon; no es portable a CUDA sin reconversión.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/HireTheRobots/Qwen3.8-27B-Turbo-Brilliance-50X-Reasoning-Instruct-MTP-MLX-6bit
- Modelo base (GGUF de DavidAU): https://huggingface.co/DavidAU/Qwen3.8-27B-Turbo-Brilliance-50X-Reasoning-Instruct-NEO-MAX-MTP-GGUF
- Discusión #4 del modelo base: https://huggingface.co/DavidAU/Qwen3.8-27B-Turbo-Brilliance-50X-Reasoning-Instruct-NEO-MAX-MTP-GGUF/discussions/4
- Discusión #22 del modelo base: https://huggingface.co/DavidAU/Qwen3.8-27B-Turbo-Brilliance-50X-Reasoning-Instruct-NEO-MAX-MTP-GGUF/discussions/22
- Variante 3-bit: https://huggingface.co/HireTheRobots/Qwen3.8-27B-Turbo-Brilliance-50X-Reasoning-Instruct-MTP-MLX-3bit
- Variante 4-bit: https://huggingface.co/HireTheRobots/Qwen3.8-27B-Turbo-Brilliance-50X-Reasoning-Instruct-MTP-MLX-4bit
- Variante 5-bit: https://huggingface.co/HireTheRobots/Qwen3.8-27B-Turbo-Brilliance-50X-Reasoning-Instruct-MTP-MLX-5bit
- Variante 8-bit: https://huggingface.co/HireTheRobots/Qwen3.8-27B-Turbo-Brilliance-50X-Reasoning-Instruct-MTP-MLX-8bit
- Perfil de DavidAU: https://huggingface.co/DavidAU
- Apoyo al autor original: https://www.buymeacoffee.com/davidbelton
