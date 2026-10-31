# hellmans/FLUX-3-Image-Klein-pup-Uncensored-GGUF

## Resumen

Este repositorio contiene una versión "uncensored" del prompt upsampler de FLUX 3 Image Klein, un modelo de 9B parámetros basado en un fine-tune de Qwen3.5 desarrollado por Black Forest Labs (BFL). El upsampler es el componente de texto encargado de expandir peticiones cortas del usuario en captions detalladas que luego se pasan al modelo de generación de imágenes Klein. La versión original aplica rechazos (refusals) sobre contenido sensible; esta edición, cuantizada por AtomicChat y publicada por hellmans, proyecta fuera el "refusal direction" del modelo para eliminar esos rechazos mientras se preserva la calidad del texto.

El resultado se distribuye en formato GGUF para su ejecución local con llama.cpp, con cuantizaciones que van desde BF16 (17,92 GB) hasta IQ3_S (4,68 GB). Según las mediciones del autor, los rechazos en inglés caen del 63% al 0% y en ruso del 29% al 1%, con un impacto mínimo en MMLU (de 74,15% a 73,95%). Es relevante porque permite ejecutar el pipeline completo de FLUX 3 Klein sin censura en el paso de prompt upsampling, aunque los propios datos indican que el efecto sobre las imágenes generadas es limitado.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Fine-tune de Qwen3.5 (modelo de lenguaje multimodal con proyector de visión) |
| Parametros totales | 8.953.803.264 (~9B) |
| Parametros activos | no disponible (no se indica si es MoE) |
| Longitud de contexto | 8192 tokens (según el comando de ejemplo con `-c 8192`) |
| Tipos de cuantizacion | BF16, Q8_0, AD-Q5_K_M, AD-IQ4_XS, AD-IQ3_S (con imatrix) |
| Idiomas soportados | no disponible (las mediciones cubren inglés y ruso) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (safetensors en el modelo base, ~8,95B parámetros) |

## Arquitectura y entrenamiento

El modelo base es FLUX 3 Image Klein pup, el prompt upsampler oficial de Black Forest Labs para FLUX 3 Image Klein, que a su vez es un fine-tune de Qwen3.5 de unos 9B parámetros. Es un modelo image-text-to-text: incluye un proyector de visión (`mmproj`, distribuido sin modificar en F16) que permite procesar imágenes de referencia para tareas de edición.

La modificación principal de este repositorio no es un reentrenamiento sino una edición de pesos mediante abliteration: la dirección interna del modelo responsable de los rechazos se proyecta fuera, y la edición se puede aplicar "horneada" en los pesos GGUF o como un LoRA de 3 MB sobre los archivos originales (`--lora-scaled ... 0.75`). No se dispone de datos sobre el corpus de entrenamiento original ni sobre el número de tokens; la model card solo documenta las mediciones de validación (KLD y top-1 contra el BF16 original sobre un conjunto de texto neutro en 30 idiomas, 87 fragmentos de 4096 tokens).

## Capacidades

- Prompt upsampling: expande peticiones cortas en captions detalladas para el modelo de imágenes FLUX 3 Image Klein, usando el system prompt `t2i` oficial de BFL (incluido sin cambios en `system_prompts.json`).
- Generación de texto conversacional: funciona como modelo de chat, con modo thinking activable o desactivable (`enable_thinking`).
- Comprensión de imágenes: mediante el proyector de visión `mmproj-F16` puede procesar imágenes de referencia para generar captions de edición.
- Tool calling: el modelo original resuelve 19/20 llamadas a herramientas válidas, y esta edición mantiene el mismo resultado.
- Recuperación en textos largos: 3/3 en pruebas de needle-in-a-haystack a tres profundidades.
- Multilingüe: las mediciones cubren inglés y ruso; el conjunto de evaluación de texto neutro abarca 30 idiomas.

## Casos de uso

- Upsampling de prompts para FLUX 3 Klein sin rechazos: se envía el system prompt `t2i` de BFL junto a la petición corta del usuario, con thinking desactivado, decodificación greedy y presence penalty de 1,5; la caption resultante se pasa directamente a Klein como prompt.
- Generación local de imágenes con pipeline abierto: combinado con `FLUX-3-Image-Klein-GGUF` y el text encoder sin censura `FLUX-3-Image-Klein-TE-Uncensored-GGUF`, permite montar todo el pipeline t2i en llama.cpp sin servicios externos.
- Edición de imágenes con referencia: usando el `mmproj` incluido, el upsampler puede redactar instrucciones de edición a partir de una imagen de entrada.
- Chat local sin filtros: como modelo conversacional de 9B, ofrece 0% de rechazos en inglés y 1% en ruso sobre peticiones nocivas, útil para entornos de investigación sobre alineación.
- Evaluación de técnicas de abliteration: las mediciones públicas (KLD, top-1, tasas de refusal por categoría) sirven de referencia para comparar métodos de eliminación de refusals; la model card sitúa esta edición por encima de la de Sakura (22% de refusals en inglés) y a la par con la de prithivMLmods.
- Uso con LoRA en despliegues existentes: si ya se ejecuta el upsampler original en GGUF, el LoRA de 3 MB permite aplicar la misma edición sin descargar pesos nuevos.

## Benchmarks y rendimiento

Datos publicados por el autor (BF16, prompts de validación no usados para ajustar nada):

| Métrica | Original | Uncensored |
|---|---:|---:|
| Peticiones nocivas en inglés (81), rechazadas | 63% | 0% |
| Peticiones nocivas en ruso (100), rechazadas | 29% | 1% |
| XSTest prompts seguros (250), rechazados | 3,2% | 0% |
| MMLU (2000 preguntas) | 74,15% | 73,95% |
| Tool calls válidos (20) | 19/20 | 19/20 |
| Needle in a long text (3 profundidades) | 3/3 | 3/3 |

Calidad por cuantización (KLD y top-1 contra el BF16 original, conjunto de 30 idiomas):

| Archivo | Tamaño | KLD | Top-1 | Refused EN/RU/XSTest |
|---|---:|---:|---:|---|
| BF16 | 17,92 GB | 0,0015 | 98,1% | 0 / 1 / 0 |
| Q8_0 | 9,53 GB | 0,0027 | 97,5% | 0 / 1 / 0 |
| AD-Q5_K_M | 6,57 GB | 0,0079 | 95,7% | 0 / 1 / 0 |
| AD-IQ4_XS | 5,51 GB | 0,0283 | 92,0% | 0 / 1 / 0 |
| AD-IQ3_S | 4,68 GB | 0,0491 | 89,2% | 0 / 1 / 0 |

Comparativa con otros upsamplers uncensored a Q8_0:

| Upsampler | KLD | Same top-1 | Refused EN/RU/XSTest | MMLU |
|---|---:|---:|---|---:|
| prithivMLmods abliterated | 0,0025 | 97,6% | 0 / 1 / 1 | 73,7% |
| Este modelo | 0,0027 | 97,5% | 0 / 1 / 0 | 74,1% |
| webmp3 Sakura | 0,0049 | 96,6% | 18 / 3 / 1 | 73,7% |

## Requisitos de hardware

- VRAM estimada para inferencia: desde unos 5,5 GB con AD-IQ4_XS hasta 17,92 GB con BF16; Q8_0 requiere unos 9,53 GB.
- GPU recomendadas: no disponible explícitamente; con 5,5-9,5 GB, una RTX 3060 de 12 GB, RTX 4060 Ti 16 GB o RTX 4090 ejecutan el modelo completamente offloaded a GPU (`-ngl 99`).
- Consumer GPUs: sí, todas las cuantizaciones salvo BF16 caben en GPUs de consumo de 8 GB o más; AD-IQ4_XS (5,51 GB) es la recomendación del autor para ese escenario.
- Opciones de despliegue: llama.cpp (llama-server con `--jinja`), que es el método documentado; al ser GGUF, también es compatible con Ollama y LM Studio de forma indirecta. No se menciona vLLM ni TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Formato | Refusals EN (Q8_0) | MMLU | Licencia |
|---|---|---|---|---:|---|
| Este modelo (AtomicChat) | ~9B | GGUF | 0% | 74,1% | Apache 2.0 |
| prithivMLmods abliterated | ~9B | GGUF | 0% | 73,7% | no disponible |
| webmp3 Sakura | ~9B | GGUF | 18/81 (~22%) | 73,7% | no disponible |
| Upsampler original BFL (Klein pup) | ~9B | safetensors | 63% | 74,15% | no disponible |

## Limitaciones y advertencias

- Efecto limitado sobre las imágenes generadas: según las mediciones del autor, el modelo de imágenes Klein no dibuja las dos categorías sensibles que el upsampler recupera en ninguna configuración, de modo que sobre las imágenes de Klein no se midió efecto de "uncensoring"; el pipeline abierto ya genera las categorías sensibles por vía del text encoder.
- El conteo de refusals se basa en el inicio de la respuesta, por lo que es indicativo y no un juicio exhaustivo.
- La abliteration puede degradar sutilmente el comportamiento del modelo; aquí el impacto medido es mínimo (MMLU -0,2 puntos), pero no hay garantías en dominios no evaluados.
- Riesgo de alucinación: no disponible; no se publican mediciones específicas de factualidad.
- Idiomas: las métricas cubren inglés y ruso; el comportamiento en otros idiomas no está documentado.
- Uso de contenido sensible: al eliminar los rechazos, el modelo generará captions para peticiones nocivas; su uso está restringido legalmente en muchas jurisdicciones y la licencia Apache 2.0 no exime de responsabilidad.
- Licencia: Apache 2.0 permite uso comercial, pero los términos del modelo base de Black Forest Labs pueden aplicar restricciones adicionales sobre el pipeline completo.
- La model card aparece truncada en la información disponible, por lo que algunos detalles documentados (por ejemplo, el análisis completo por categorías) deben consultarse en el repositorio y en la tabla de categorías del text encoder uncensored.

## Enlaces

- Repositorio del modelo: https://huggingface.co/hellmans/FLUX-3-Image-Klein-pup-Uncensored-GGUF
- Modelo base: https://huggingface.co/black-forest-labs/flux-3-image-klein-pup
- Text encoder uncensored de Klein: https://huggingface.co/AtomicChat/FLUX-3-Image-Klein-TE-Uncensored-GGUF
- Upsampler stock (sin editar) en GGUF: https://huggingface.co/AtomicChat/FLUX-3-Image-Klein-pup-GGUF
- Modelo Klein en GGUF: https://huggingface.co/AtomicChat/FLUX-3-Image-Klein-GGUF
- Dataset de mediciones: https://huggingface.co/datasets/AtomicChat/FLUX-3-Image-Klein-pup-Uncensored-GGUF-metrics
- Tabla por categorías del text encoder: https://huggingface.co/AtomicChat/FLUX-3-Image-Klein-TE-Uncensored-GGUF#where-exactly-this-is-uncensored
- Proyecto AtomicChat: https://atomic.chat/
- GitHub de AtomicChat: https://github.com/AtomicBot-ai/Atomic-Chat
- Discord de la comunidad: https://discord.gg/8wGSsvmg4V
