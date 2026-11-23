# Rzxprp/Inkling-2-Mini-Uncensored-GGUF

## Resumen

Inkling-2-Mini-Uncensored-GGUF es una compilación no censurada del modelo thinkingmachines/Inkling-2-Mini, publicada por el usuario Rzxprp (con material y guía de AtomicChat). Se distribuye en formato GGUF para llama.cpp e incluye tanto tres ficheros ya fusionados con la edición como un adaptador LoRA reutilizable sobre cualquier GGUF del modelo base. El modelo es un MoE de 26,4 mil millones de parámetros totales con 3,4 mil millones activos, núcleo con capas en bucle (looped core) y entrada de texto e imagen, bajo licencia Apache-2.0.

El objetivo de esta variante es eliminar la dirección de rechazo del modelo original mediante una LoRA de rango 1 aplicada en los 49 puntos que escriben en el flujo residual (salida de atención y expertos enrutados de las 24 capas, más el embedding de tokens). Al compartir pesos las 12 capas en bucle a lo largo de las tres pasadas, una sola edición cubre las 48 pasadas efectivas.

Es relevante para desarrolladores que necesitan un modelo multimodal de tamaño medio, ejecutable en local con llama.cpp, sin las restricciones de rechazo del modelo alineado original, y que quieran evaluar el compromiso entre fidelidad al BF16 (medida en KLD y top-1) y tamaño de cuantización.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE con capas en bucle (looped core), 24 capas, 12 de ellas en bucle con pesos compartidos en 3 pasadas; entrada texto e imagen |
| Parametros totales | 26.070.385.152 (26,4B) |
| Parametros activos | 3,4B |
| Longitud de contexto | 32.768 tokens (valor de `-c` en los ejemplos de ejecución de la model card) |
| Tipos de cuantizacion | AD-Q4_K, AD-IQ3_S, AD-IQ2_M (ficheros ya fusionados); LoRA en GGUF aplicable de BF16 a 1-bit |
| Idiomas soportados | no disponible (la model card menciona prompts en inglés y ruso para la construcción del adaptador, sin declarar cobertura oficial) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (llama.cpp); proyector de visión en F16 y BF16 |

## Arquitectura y entrenamiento

El modelo base es un transformer con mezcla de expertos (MoE) de 26,4B parámetros totales y 3,4B activos, con un núcleo en bucle: 12 de las 24 capas comparten pesos y se ejecutan en tres pasadas, de modo que la profundidad efectiva es mayor que la nominal. Acepta texto e imagen como entrada mediante un proyector de visión independiente (`mmproj`), que en esta compilación se mantiene sin cambios respecto al original.

La edición de esta variante no es un reentrenamiento: es una LoRA de rango 1 sobre los 49 puntos que escriben en el flujo residual (atención y expertos enrutados de las 24 capas, más el embedding de tokens). Para cada capa se calcula la dirección de rechazo propia como la diferencia entre las activaciones medias en prompts dañinos y prompts inofensivos, en inglés y ruso, proyectando fuera la media de los inofensivos; la dirección se agrupa sobre prompts renderizados con y sin razonamiento, porque el modelo razona incluso con esfuerzo `none` y decide rechazar dentro de su propio razonamiento. No se dispone de datos sobre el volumen de tokens de entrenamiento del modelo base ni sobre si hubo RLHF o DPO.

## Capacidades

- Generación de texto y razonamiento con modo de pensamiento configurable (esfuerzos `none`, `low`, `high`).
- Entrada multimodal de imagen y texto (pipeline `image-text-to-text`).
- Conversación multi-turno.
- Ejecución local vía llama.cpp con soporte de plantilla Jinja (`--jinja`).
- Aplicación del adaptador LoRA sobre cualquier GGUF del modelo base, de BF16 a 1-bit.
- No se documenta soporte explícito de tool calling, function calling ni de agentes multi-paso en la información disponible.

## Casos de uso

- Despliegue local de un asistente conversacional multimodal: con 32.768 tokens de contexto y un GGUF AD-Q4_K de 16,53 GB, puede ejecutarse en una estación de trabajo con GPU de 24 GB y gestionar conversaciones largas con imágenes adjuntas.
- Investigación sobre alineación y rechazo: el par original/adaptado permite medir experimentalmente cómo varía la tasa de rechazo (de 100% a 0% en los prompts dañinos de prueba en inglés) y el sobre-rechazo (XSTest de 4,0% a 0%) sin cambiar el resto de pesos.
- Evaluación de cuantizaciones: los tres ficheros publicados con KLD y top-1 medidos frente al BF16 (por ejemplo, AD-Q4_K con KLD 0,0115 y top-1 95,6%) permiten elegir el compromiso tamaño/calidad para un pipeline concreto.
- Prototipado de aplicaciones de imagen-texto en entornos sin conexión: el proyector de visión F16 (0,64 GB) más el modelo cuantizado caben en equipos de consumo alto y no requieren API externa.
- Ajuste fino ligero sobre el modelo base: el adaptador LoRA de 0,04 GB sirve como plantilla para estudiar ediciones de bajo rango sobre arquitecturas MoE con capas en bucle.
- Docencia y demostraciones de mecánica de rechazo en LLM: la descripción del método (dirección por capa, proyección de la media inofensiva, agrupación con y sin razonamiento) es reproducible y sirve como caso práctico.

## Benchmarks y rendimiento

Datos publicados en la model card, comparando el BF16 con el adaptador frente al mismo modelo sin él, con decodificación greedy:

| Comprobacion | Original | Con el adaptador |
|---|---:|---:|
| Prompts dañinos rechazados, test inglés (81), sin razonamiento | 81 (100%) | 0 |
| Prompts dañinos rechazados, test ruso (100), sin razonamiento | 91 (91%) | 0 |
| Prompts dañinos rechazados, validación inglés (104) / ruso (100) | 100% / 89% | 0 / 0 |
| Prompts dañinos rechazados con razonamiento, esfuerzo `low`, presupuesto 3.072 tokens (30) | 28 | 0 |
| Los mismos con esfuerzo `high` (30) | 26 | 0 |
| Prompts de chat dañinos, esfuerzo `none` / `low` (8) | 8 / 8 | 0 / 0 |
| Prompts seguros de XSTest rechazados (250) | 10 (4,0%) | 0 |
| Respuestas vacías | 0 | 0 |

Calidad de las cuantizaciones frente al BF16 original (KLD y top-1 sobre un corpus neutral de 87 fragmentos de 4.096 tokens):

| Fichero | GB en disco | KLD | Top-1 | Referencia en el repo base |
|---|---:|---:|---:|---|
| AD-Q4_K | 16,53 | 0,0115 | 95,6% | 0,0080 / 96,3% |
| AD-IQ3_S | 13,34 | 0,0235 | 93,8% | 0,0205 / 94,2% |
| AD-IQ2_M | 8,67 | 0,132 | 85,7% | 0,130 / 85,7% |

No se han publicado resultados de MMLU, HumanEval ni GSM8K en la información disponible; la model card menciona una evaluación MMLU de 2.000 preguntas pero no incluye sus cifras.

## Requisitos de hardware

- VRAM estimada: unos 17 GB para AD-Q4_K, 14 GB para AD-IQ3_S y 9 GB para AD-IQ2_M, más 0,64 GB del proyector de visión.
- GPU recomendadas: A100 o H100 para despliegues concurrentes; RTX 4090 (24 GB) para AD-Q4_K con contexto completo; RTX 4080/3090 (16-24 GB) para AD-IQ3_S; GPUs de 12 GB para AD-IQ2_M.
- Cabe en GPU de consumo: sí, desde 12 GB con AD-IQ2_M y desde 24 GB con AD-Q4_K.
- Despliegue: llama.cpp b12600 o superior con soporte de la arquitectura de bucle de Inkling 2 (PR #32694); `llama-server` con `--jinja -c 32768 -ngl 99`. No se documentan otras opciones como vLLM, TGI u Ollama.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Activos | Contexto | Licencia | Formato |
|---|---|---:|---:|---|---|
| Inkling-2-Mini-Uncensored (esta ficha) | 26,4B | 3,4B | 32.768 | Apache-2.0 | GGUF + LoRA |
| thinkingmachines/Inkling-2-Mini | 26,4B | 3,4B | no disponible | Apache-2.0 | safetensors |
| AtomicChat/Inkling-2-Mini-GGUF | 26,4B | 3,4B | no disponible | Apache-2.0 | GGUF |

No se dispone de datos de benchmarks comparativos con modelos de otras familias en la información proporcionada.

## Limitaciones y advertencias

- La eliminación del rechazo es deliberada: el adaptador reduce a 0 los rechazos en los conjuntos de prueba dañinos, por lo que el modelo puede generar contenido dañino, ilegal o inseguro. No debe desplegarse en producción orientada a usuarios sin filtros externos.
- Riesgo de alucinación: no se han publicado evaluaciones específicas de veracidad; el modelo base razona en todos los modos de esfuerzo y puede producir cadenas de razonamiento erróneas.
- La edición se construyó con prompts en inglés y ruso; el comportamiento del rechazo en otros idiomas, incluido el castellano, no está medido.
- Los ficheros requieren llama.cpp b12600 o superior y no son compatibles con la implementación antigua del PR #32695; mezclar layouts provoca fallos.
- El adaptador LoRA debe aplicarse sobre GGUF del repositorio base convertidos al layout del PR #32694.
- La licencia Apache-2.0 permite uso comercial, pero el autor no ofrece garantías sobre el comportamiento del modelo editado.
- La model card menciona comprobaciones que el modelo no supera ("the two it misses are shown") sin detallarlas en el texto disponible.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Rzxprp/Inkling-2-Mini-Uncensored-GGUF
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- GGUF del modelo base: https://huggingface.co/AtomicChat/Inkling-2-Mini-GGUF
- Guía de ejecución local: https://atomic.chat/blog/guides/how-to-run-inkling-2-mini-uncensored-locally
- PR de llama.cpp con la arquitectura de bucle: https://github.com/ggml-org/llama.cpp/pull/32694
- PR anterior (obsoleto): https://github.com/ggml-org/llama.cpp/pull/32695
- Dataset de prompts dañinos: https://huggingface.co/datasets/mlabonne/harmful_behaviors
- Dataset XSTest: https://huggingface.co/datasets/walledai/XSTest
- Atomic Chat: https://atomic.chat/
- GitHub de Atomic Chat: https://github.com/AtomicBot-ai/Atomic-Chat
- Discord: https://discord.gg/8wGSsvmg4V
- X: https://x.com/atomic_chat_hq
