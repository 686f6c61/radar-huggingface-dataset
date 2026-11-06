# CMSManhattan/JiRackDeltaNet_70b

## Resumen

JiRackDeltaNet 70B es un modelo de lenguaje híbrido de 69.930 millones de parámetros desarrollado por CMSManhattan (Konstantin Grabko). Se trata de un decodificador de 128 capas que combina 96 capas de Gated DeltaNet (atención lineal) con 32 capas de atención completa con puerta, intercalando atención completa cada cuatro capas. La arquitectura sigue el esquema de Qwen 3.5 y el modelo parte de un modelo Qwen (licencia Apache 2.0) modificado y reentrenado con datos propios del autor: conversación, razonamiento, código, matemáticas y tool calling.

El modelo se publica como primera versión SFT (beta) y su interés principal reside en dos frentes. Por un lado, la eficiencia: incluye una copia en FP8 con cuantización por bloques de 128 × 128 que reduce el peso de 140 GB a 73 GB, además de tres cuantizaciones GGUF (Q3_K_M, Q4_K_M y Q6_K) pensadas para ejecución en CPU. Por otro, el soporte de tool calling verificado empíricamente: 109/117 casos superados en un test interno de 117 casos con la cuantización más pequeña (Q3_K_M), un 93,2 %.

La relevancia actual del modelo es doble: demuestra que un modelo de casi 70B puede servirse en un único GPU de 96 GB con FP8 y en CPU con cuantizaciones ternarias y de 3-6 bits, y ofrece un punto de partida para flujos agénticos con llamadas a herramientas mediante API compatible con OpenAI. El vocabulario es de 248.320 tokens con el tokenizador de Qwen 3.5, y el modelo declara soporte para 13 idiomas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Decodificador híbrido: 128 capas, 96 Gated DeltaNet (atención lineal) + 32 gated full attention, atención completa cada 4 capas |
| Parametros totales | 69.934.845.440 (69,93B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (los ejemplos de GGUF usan `-c 8192`) |
| Tipos de cuantizacion | bf16, FP8 e4m3 con escalas por bloque 128×128, GGUF Q3_K_M, Q4_K_M, Q6_K; etiquetas de pesos ternarios / 1.58-bit |
| Idiomas soportados | en, zh, ja, ko, fr, es, pt, de, it, ru, ar, vi, th |
| Licencia | other (modelo derivado de Qwen, Apache 2.0; consultar términos del autor) |
| Formato de pesos | safetensors (bf16 en la raíz, FP8 en `sft_final_fp8/`), GGUF en `gguf/` |

Detalles adicionales de arquitectura: hidden 5120, FFN 26624 con SwiGLU; atención completa con 24 cabezas y 4 KV heads, dimensión de cabeza 256, puerta de salida, RoPE parcial al 25 %, secciones mRoPE intercaladas [11, 11, 10] y RoPE theta 1e7; Gated DeltaNet con 16 key heads y 48 value heads, dimensión de cabeza 128 y convolución causal de kernel 4. Vocabulario de 248.320 tokens con tokenizador y plantilla de chat de Qwen 3.5, embeddings de entrada y salida no atados, y una cabeza MTP (multi-token prediction) de 1 capa.

## Arquitectura y entrenamiento

La arquitectura es un decodificador híbrido que alterna capas de atención lineal Gated DeltaNet con capas de atención completa con puerta. La proporción es de tres capas DeltaNet por cada capa de atención completa (96 frente a 32), lo que reduce el coste cuadrático del contexto largo manteniendo capacidad de atención global periódica. La atención completa incorpora puerta de salida, RoPE parcial al 25 % y secciones mRoPE intercaladas, un esquema pensado para manejar secuencias multimodales o posiciones estructuradas. El modelo incluye además una cabeza MTP de una capa, útil para decodificación especulativa o entrenamiento multi-token.

El modelo parte de un modelo Qwen con licencia Apache 2.0: el autor modificó la arquitectura y los pesos en su propio código JiRack y lo afinó con datos propios (chat, razonamiento, código, matemáticas y tool calling). La receta de entrenamiento y el dataset no se publican, y no se especifica el número de tokens de entrenamiento, la composición exacta del corpus ni si se aplicaron RLHF o DPO. La implementación es un único archivo PyTorch (`JiRackDeltaNet_70b.py`) cuyos nombres de parámetros coinciden con el state dict de `Qwen3_5ForCausalLM`, lo que en teoría permite cargar los pesos en implementaciones de Hugging Face o vLLM de esa clase. El repositorio incluye scripts de chat de referencia que recalculan la secuencia completa en cada token (sin caché KV), por lo que su rendimiento es de aproximadamente 1 token/s en 8 × A100 y no están pensados para servir en producción.

## Capacidades

- Generación de texto conversacional multi-turno con plantilla de chat de Qwen 3.5.
- Razonamiento y matemáticas básicas (el ejemplo de la model card resuelve correctamente un problema de cambio con varios pasos).
- Generación de código: el autor lo describe como «good coding and agentic model».
- Tool calling / function calling mediante el bloque `<tools>` del sistema y el formato `<tool_call><function=…><parameter=…>`, compatible con la API de OpenAI a través de `llama-server`.
- Llamadas paralelas a herramientas y respuestas de seguimiento a partir del resultado de una herramienta.
- Modo de razonamiento conmutable (`/think` en los scripts, `--reasoning off` en llama.cpp).
- Capacidades agénticas y multi-step reasoning orientadas a flujos con herramientas.
- Multilingüe declarado en 13 idiomas (en, zh, ja, ko, fr, es, pt, de, it, ru, ar, vi, th).
- Tokenizador con soporte declarado para robótica (etiqueta `robotics`), sin más detalle en la información disponible.
- Cabeza MTP de predicción multi-token.

## Casos de uso

- Asistente de atención al cliente con herramientas: el modelo puede encadenar consultas a un CRM o a una base de conocimiento mediante tool calling y responder con el resultado; su puntuación de 20/20 en casos de seguimiento con resultado de herramienta lo respalda.
- Automatización de back office con llamadas paralelas: los 19/19 en llamadas paralelas permiten resolver en una sola interacción tareas como consultar stock y precio a la vez.
- Enrutamiento y orquestación de agentes: la etiqueta `routing` y el soporte de tool calling lo hacen adecuado como modelo planificador que decide qué herramienta invocar en un pipeline agéntico.
- Generación de código en pipelines de CI/CD: puede integrarse como revisor o generador de parches a través de un cliente compatible con OpenAI, con la cautela de que HumanEval no está medido.
- Despliegue en CPU para entornos con poca memoria: las cuantizaciones GGUF Q3_K_M (33,89 GB) y Q4_K_M (42,65 GB) permiten servir el modelo en servidores sin GPU, con velocidades de generación de 5,17 y 5,04 tokens/s respectivamente en un GH200 Grace con 64 hilos.
- Servicio en un único GPU de 96 GB: la copia FP8 (73 GB) cabe en una sola GPU de 96 GB, lo que facilita el despliegue en nodos con una sola A100/H100 de 80-96 GB.
- Procesamiento multilingüe: con 13 idiomas declarados, puede usarse para clasificación, resumen o generación en entornos con mezcla de lenguas europeas y asiáticas.
- Prototipado de robótica y control por lenguaje: la etiqueta `robotics` sugiere uso en interfaces de instrucciones para sistemas robóticos, aunque no se documenta el mecanismo.

## Benchmarks y rendimiento

No se han publicado resultados de MMLU, HumanEval ni GSM8K en la información disponible; el autor indica explícitamente que GSM8K y HumanEval se añadirán en una versión posterior. El único benchmark publicado es el test interno de tool calling (117 casos propios, fuera del conjunto de entrenamiento, temperatura 0, razonamiento desactivado, servido con `llama-server` sobre GGUF Q3_K_M):

| Categoria | Q3_K_M |
|---|---|
| Llamada simple (una herramienta, todos los argumentos) | 38/38 |
| Llamadas paralelas | 19/19 |
| Seguimiento (respuesta a partir del resultado) | 20/20 |
| Sin herramienta necesaria | 25/25 |
| Aclarar un argumento faltante | 7/15 |
| **Total** | **109/117 (93,2 %)** |

Rendimiento de las cuantizaciones GGUF en GH200 Grace con 64 hilos (`llama-bench`):

| Cuantizacion | Tamano | Prompt (tokens/s) | Generacion (tokens/s) |
|---|---|---|---|
| Q3_K_M | 33,89 GB | 20,1 | 5,17 |
| Q4_K_M | 42,65 GB | 50,2 | 5,04 |
| Q6_K | 57,40 GB (2 partes) | 45,3 | 4,11 |

Para la copia FP8: 73 GB frente a 140 GB en bf16, con un error relativo medio de pesos del 2,65 %. Los scripts de referencia en PyTorch, sin caché KV, rinden aproximadamente 1 token/s en 8 × A100.

## Requisitos de hardware

- bf16: 140 GB de pesos; requiere al menos 2 × 80 GB (el script reparte los 128 bloques entre todas las GPU visibles).
- FP8: 73 GB, cabe en un único GPU de 96 GB; los pesos permanecen en FP8 en memoria y se desquantizan por capa.
- GGUF Q6_K: 57,40 GB, viable en CPU con RAM suficiente o en GPU de 80 GB.
- GGUF Q4_K_M: 42,65 GB, cabe en una RTX 4090 de 24 GB solo parcialmente (requiere offload); en CPU es la opción más rápida en prompt según los datos del autor.
- GGUF Q3_K_M: 33,89 GB, la opción de menor huella; sigue sin caber íntegra en GPU de consumo de 24 GB.
- GPU recomendadas: A100/H100 de 80 GB (pares para bf16), GPU única de 96 GB para FP8, GH200 Grace para CPU.
- Despliegue: `llama-server` de llama.cpp con `--jinja` y `--reasoning off` para GGUF; scripts propios de PyTorch para bf16 y FP8; los pesos deberían cargar en implementaciones de vLLM/Hugging Face de `Qwen3_5ForCausalLM`, aunque no está verificado en la información disponible.
- Latencia y throughput: 4-5 tokens/s de generación en CPU (GH200, 64 hilos); el script de referencia PyTorch ronda 1 token/s en 8 × A100 por falta de caché KV, por lo que no es apto para servicio.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| JiRackDeltaNet 70B | 69,93B | No disponible | other (derivado de Qwen, Apache 2.0) | Hugging Face, GGUF, FP8 | Híbrido DeltaNet + atención; tool calling 93,2 % en test propio |
| Qwen 3.5 (modelo base) | No disponible | No disponible | Apache 2.0 | Hugging Face | Arquitectura y tokenizador de origen; el autor no publica comparación de rendimiento |
| Llama 3.3 70B | 70B | 128K | Llama 3.3 Community License | Hugging Face, GGUF, FP8 | Referencia de la misma escala; sin datos comparativos en la información disponible |
| Mistral Large 2 | 123B | 128K | Mistral Research License | API y pesos | Mayor tamaño; sin datos comparativos en la información disponible |

No se dispone de comparaciones de benchmarks entre JiRackDeltaNet 70B y estos modelos en la información proporcionada; la comparativa se limita a parámetros, licencia y disponibilidad.

## Limitaciones y advertencias

- Versión beta: es el primer SFT del modelo y el autor advierte de que se añadirán mejoras y benchmarks en versiones posteriores.
- Fallo sistemático en aclaraciones: los 8 fallos del test de tool calling corresponden a casos en los que falta un argumento y el modelo llama a la herramienta en lugar de preguntar (7/15 aciertos en esa categoría).
- Sin benchmarks estándar: no hay resultados publicados de MMLU, HumanEval ni GSM8K, por lo que el rendimiento general no es verificable.
- Receta de entrenamiento y datos no publicados: no se puede auditar la composición del corpus ni el proceso de alineación.
- Licencia «other»: aunque el modelo deriva de Qwen (Apache 2.0), los términos concretos del autor no están detallados en la información disponible; conviene revisarlos antes de uso comercial.
- Riesgo de alucinación: no cuantificado; el modelo no incluye mecanismos declarados de verificación de hechos.
- Longitud de contexto no especificada: los ejemplos de despliegue usan 8192 tokens, pero no se confirma el máximo soportado.
- Scripts de referencia sin caché KV: no aptos para producción; el rendimiento real depende de la implementación de servicio.
- Idiomas: aunque se declaran 13, no se documenta la calidad por idioma ni el volumen de datos de entrenamiento en cada uno.
- Etiquetas de pesos ternarios / 1.58-bit: la model card no detalla qué artefactos concretos usan pesos ternarios frente a las cuantizaciones GGUF publicadas, lo que genera ambigüedad sobre el despliegue previsto.

## Enlaces

- Hugging Face: https://huggingface.co/CMSManhattan/JiRackDeltaNet_70b
- README de GGUF con comandos y comprobaciones: https://huggingface.co/CMSManhattan/JiRackDeltaNet_70b/blob/main/gguf/README.md
- Código del modelo: `JiRackDeltaNet_70b.py` en el repositorio de Hugging Face
- Script de chat bf16: `chat_jirack.py` en el repositorio de Hugging Face
- Script de chat FP8: `sft_final_fp8/chat_fp8.py` en el repositorio de Hugging Face
- Plantilla de chat: `chat_template.jinja` en el repositorio de Hugging Face
- Paper, blog o demo adicionales: no disponibles en la información proporcionada
