# netprojects/TML-d24-varloop-research-MLX-4bit

## Resumen

TML-d24-varloop-research es un modelo de investigación de Thinking Machines que explora el paradigma de "variable-loop" sobre una arquitectura de mezcla de expertos (MoE) de 26.388.641.280 parámetros totales. Se trata del contrapunto de investigación de Inkling 2 Mini: comparte la misma arquitectura de 26,4B parámetros con doce capas intermedias que pueden ejecutarse entre 1 y 5 pasadas en inferencia (3 por defecto), de modo que el coste computacional y la capacidad de recuperación en contexto largo se pueden ajustar en tiempo de ejecución. Esta ficha cubre la cuantización de netprojects para Apple Silicon en MLX a 4 bits afín (grupo 64), que re-cuantiza los expertos enrutados (publicados originalmente en NVFP4/MXFP8), la atención, los embeddings, la capa de salida y las proyecciones de atención de visión. El repositorio ocupa 17,2 GB e incluye el codificador de visión y el borrador MTP (`mtp.safetensors`, 0,64 GB) para decodificación especulativa. La licencia es Apache 2.0 y el pipeline declarado es image-text-to-text, lo que lo sitúa como un modelo multimodal conversacional con capacidad de razonamiento y tool calling. Thinking Machines lo publica como artefacto de investigación y recomienda Inkling 2 Mini para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE con bucle variable (variable-loop), doce capas intermedias con 1-5 pasadas; incluye codificador de visión y borrador MTP/DSpark |
| Parametros totales | 26.388.641.280 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (los benchmarks MRCR v2 y GraphWalks llegan a 1M tokens) |
| Tipos de cuantizacion | 4-bit afín (grupo 64) en MLX; expertos originales en NVFP4/MXFP8; existe build 4/8-bit sin pérdida |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX), más `mtp.safetensors` para el borrador especulativo |

## Arquitectura y entrenamiento

El modelo es un transformer de mezcla de expertos con un mecanismo de bucle variable: doce capas intermedias se reutilizan un número configurable de veces (de 1 a 5, por defecto 3), de forma que un token puede atravesar 24, 36, 48, 60 o 72 pasadas de capa según la configuración. Esta es la innovación central: permite intercambiar latencia por capacidad de razonamiento y de recuperación en contexto largo sin cambiar los pesos. Incluye además un codificador de visión (pipeline image-text-to-text) y un borrador MTP/DSpark entrenado con 3 pasadas para decodificación especulativa. Los expertos enrutados se publicaron originalmente en NVFP4/MXFP8; esta build los re-cuantiza a 4 bits afín con grupo 64, junto con atención, embeddings, capa de salida y proyecciones de atención de visión. No se dispone de datos sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO. El autor de la cuantización verificó el código del bucle contra la implementación de referencia en Transformers 5.24.1 con un modelo diminuto, obteniendo una diferencia máxima de logits de 3,6e-6 a 1, 2, 3, 4 y 5 pasadas, tanto en prompts completos como en generación con caché.

## Capacidades

- Generación de texto y razonamiento con esfuerzo configurable mediante la plantilla de chat: `none`, `minimal`, `low`, `medium`, `high` (por defecto), `xhigh`, `max` o un valor numérico entre 0,0 y 0,99.
- Comprensión de imágenes y texto (image-text-to-text) gracias al codificador de visión incluido.
- Razonamiento de varios pasos y modo "thinking" extenso; el autor advierte de que hay que fijar `max_tokens` porque el modelo puede pensar largamente.
- Tool calling y uso de bash, según los benchmarks SWE-bench (bash only) reportados por Thinking Machines.
- Recuperación en contexto largo: los resultados de MRCR v2 con 8 agujas y GraphWalks BFS llegan a 1M de tokens.
- Decodificación especulativa mediante el borrador MTP/DSpark (solo cargable a 3 pasadas).
- Capacidades multilingües: no disponible.

## Casos de uso

- Investigación sobre cómputo adaptativo: permite estudiar en una sola máquina Apple Silicon cómo afecta el número de pasadas a la calidad en tareas de razonamiento, ajustando `INKLING2_LOOP_PASSES` sin recargar pesos.
- Recuperación en documentos largos: con 4 o 5 pasadas el modelo alcanza un 93,4% y un 92,1% en MRCR v2 8-needle 256K-512K, por lo que sirve para preguntas sobre corpus extensos donde la recuperación exacta es crítica.
- Agentes de ingeniería de software: SWE-bench Verified (bash only) llega al 79,3% con 4 pasadas y al 79,6% con 5, lo que lo hace adecuado para prototipos de agentes que resuelven issues en repositorios.
- Procesamiento de documentos con visión: OmniDocBench v1.6 alcanza el 92,5% con 5 pasadas, útil para extracción estructurada de PDFs y formularios escaneados.
- Asistente conversacional multimodal local: el pipeline image-text-to-text y el servidor `mlx_vlm.server` permiten desplegar un chat con imágenes en un MacBook Pro M5 Max sin conexión a la nube.
- Evaluación comparativa de cuantizaciones: la build 4-bit mantiene el mismo siguiente token que la 4/8-bit en el 93,2% de las posiciones (KL media 0,014), lo que la convierte en banco de pruebas para medir la degradación de la cuantización agresiva en MoE con bucle.
- Decodificación especulativa en local: con el borrador MTP a 3 pasadas se puede medir la aceleración de la generación especulativa en hardware Apple.

## Benchmarks y rendimiento

Resultados publicados por Thinking Machines (sus harnesses y ajustes; selección de su tabla):

| Benchmark | Inkling 2 Mini | 1 pasada | 2 pasadas | 3 pasadas | 4 pasadas | 5 pasadas |
|---|---|---|---|---|---|---|
| SWE-bench Verified (bash only) | 79,2% | 56,3% | 76,5% | 78,7% | 79,3% | 79,6% |
| SWE-bench Pro v2 Hard | 77,9% | 39,7% | 69,1% | 78,9% | 76,0% | 78,4% |
| GPQA Diamond | 86,6% | 69,6% | 79,2% | 84,2% | 81,9% | 83,1% |
| MMMU Pro | 74,9% | 63,6% | 69,8% | 71,4% | 72,1% | 73,2% |
| OmniDocBench v1.6 | 92,8% | 86,6% | 90,5% | 92,1% | 91,8% | 92,5% |
| MRCR v2 8-needle, 256K-512K | 46,4% | 26,2% | 65,2% | 89,2% | 93,4% | 92,1% |
| MRCR v2 8-needle, 512K-1M | 37,7% | 20,6% | 49,7% | 72,3% | 81,4% | 79,9% |
| GraphWalks BFS 1M | 50,0% | 5,7% | 39,4% | 52,1% | 56,2% | 57,8% |

Rendimiento de la cuantización (autor de la build, MacBook Pro M5 Max de 128 GB, 26 de noviembre de 2026, prueba corta de dos prompts y 128 tokens, greedy, razonamiento `none`, indicativa y no medida en máquina inactiva):

| Pasadas | Pasadas de capa por token | 4/8-bit (tok/s) | 4-bit (tok/s) |
|---|---|---|---|
| 1 | 24 | 97,7 | no disponible |
| 2 | 36 | 69,3 | 117,3 |
| 3 (por defecto) | 48 | 51,6 | 85,5 |
| 4 | 60 | 42,2 | no disponible |
| 5 | 72 | 35,3 | 54,2 |

GSM8K con 20 preguntas fijas (razonamiento `none`, greedy): 4/8-bit 15/20 a 2 pasadas, 16/20 a 3 pasadas y 16/20 a 5 pasadas; 4-bit 14/20 a 3 pasadas.

## Requisitos de hardware

- VRAM equivalente: la build 4-bit ocupa 16,5 GB más 0,64 GB del borrador MTP; la build 4/8-bit ocupa 19,5 GB más 0,64 GB. El repositorio completo son 17,2 GB.
- Memoria unificada recomendada: el autor valida en un MacBook Pro M5 Max con 128 GB; con 32 GB de memoria unificada el modelo de 16,5 GB más el borrador y el contexto debería caber, aunque no se han publicado medidas en esa configuración.
- GPU recomendadas: Apple Silicon con MLX (M5 Max validado); no se han publicado requisitos para GPU NVIDIA en esta build.
- Cabe en GPU de consumo: no disponible para CUDA; en Apple Silicon requiere al menos 24-32 GB de memoria unificada para el modelo más contexto.
- Opciones de despliegue: `mlx_vlm.server` con `inkling2-mlx` v0.2.8 (MLX-VLM más soporte Inkling); MLX-VLM estándar rechaza los checkpoints de bucle variable.
- Latencia y throughput: 85,5 tok/s a 3 pasadas y 117,3 tok/s a 2 pasadas con la build 4-bit en M5 Max de 128 GB; 54,2 tok/s a 5 pasadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Bucle variable | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| TML-d24-varloop-research (esta build, 4-bit MLX) | 26,4B | no disponible (evaluado hasta 1M) | Sí, 1-5 pasadas | Apache 2.0 | Hugging Face |
| netprojects/TML-d24-varloop-research-MLX-4-8bit | 26,4B | no disponible | Sí, 1-5 pasadas | Apache 2.0 | Hugging Face |
| Inkling 2 Mini (referencia de producción) | no disponible | no disponible | No | no disponible | Hugging Face |

La build 4/8-bit es la recomendada por el autor de la cuantización: es sin pérdida respecto a los valores NVFP4/MXFP8 publicados y obtiene 16/20 en GSM8K frente a 14/20 de esta build 4-bit. Inkling 2 Mini, según los datos de Thinking Machines, supera a esta variante de investigación en SWE-bench Pro v2 Hard (77,9% frente a 78,9% a 3 pasadas, aunque la variante gana ligeramente), GPQA Diamond (86,6% frente a 84,2%) y MRCR v2 256K-512K (46,4% frente a 89,2% a 3 pasadas).

## Limitaciones y advertencias

- Es un artefacto de investigación: Thinking Machines recomienda Inkling 2 Mini para producción.
- La cuantización 4-bit pierde calidad respecto a la 4/8-bit: mismo siguiente token en el 93,2% de las posiciones, KL media 0,014 y 14/20 frente a 16/20 en GSM8K a 3 pasadas.
- El borrador MTP/DSpark solo se puede cargar a 3 pasadas, porque se entrenó con ese número; usarlo con otro número de pasadas no está soportado.
- Requiere `inkling2-mlx` v0.2.8 o superior; MLX-VLM estándar rechaza los checkpoints de bucle variable.
- El modelo puede generar cadenas de razonamiento largas; hay que fijar `max_tokens` para evitar generaciones descontroladas.
- Los benchmarks de Thinking Machines usan sus propios harnesses y ajustes; no son directamente comparables con mediciones de terceros.
- Las cifras de velocidad son de una prueba corta en un M5 Max de 128 GB, no de una máquina inactiva, y son solo indicativas.
- No se dispone de información sobre sesgos, idiomas soportados ni composición del dataset de entrenamiento.
- Licencia Apache 2.0: permite uso comercial, pero al ser un modelo de investigación conviene validar el comportamiento antes de desplegarlo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/netprojects/TML-d24-varloop-research-MLX-4bit
- Modelo base: https://huggingface.co/thinkingmachines/TML-d24-varloop-research
- Build 4/8-bit recomendada: https://huggingface.co/netprojects/TML-d24-varloop-research-MLX-4-8bit
- Build 4-bit de Inkling 2 Mini: https://huggingface.co/netprojects/Inkling-2-Mini-MLX-4bit
- Build 4/8-bit de Inkling 2 Mini: https://huggingface.co/netprojects/Inkling-2-Mini-MLX-4-8bit
- Repositorio de inferencia: https://github.com/internet-projects/inkling2-mlx
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
