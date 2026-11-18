# AtomicChat/Qwen3.8-27B-GGUF

## Resumen

Qwen3.8-27B es un modelo multimodal (texto e imagen) desarrollado por Qwen (Alibaba). AtomicChat publica en este repositorio una familia completa de cuantizaciones GGUF del modelo original, construidas con matrices de importancia (imatrix) propias y un esquema de asignación de tipos por tensor denominado Atomic Dynamic (AD). El modelo resuelve el problema de ejecutar localmente un modelo denso de 27.320 millones de parámetros con visión en hardware de consumo, ofreciendo 16 variantes de cuantización desde 8,5 GB hasta 28,9 GB.

La relevancia de esta publicación está en la transparencia metodológica: el autor mide cada fichero contra los pesos originales con divergencia KL y tasa top-1 sobre texto reservado, y publica los registros brutos. Además, el modelo incorpora una cabeza de predicción multi-token (MTP) integrada en todos los ficheros, lo que habilita decodificación especulativa sin descargas adicionales.

La arquitectura, la longitud de contexto nativa, los idiomas y la licencia del modelo base no se detallan en la información disponible; esta ficha se limita a lo documentado en el repositorio de cuantizaciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base Qwen/Qwen3.8-27B; transformer multimodal con proyector de visión) |
| Parametros totales | 27.320.697.856 (27,3 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible en el modelo base; los ejemplos de despliegue usan 8k y 32k tokens |
| Tipos de cuantizacion | Q8_0, AD-Q6_K, AD-Q6_K-Q5_K, AD-Q5_K_M, AD-Q5_K_M-Q4_K_M, AD-Q4_K_M, AD-IQ4_XS, AD-IQ4_XS-IQ3_S, AD-IQ3_S, AD-IQ3_S-IQ3_XXS, AD-IQ3_XXS, AD-IQ2_S, AD-IQ2_S-IQ2_XS, AD-IQ2_XS, AD-IQ2_XXS, AD-IQ1_M |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (llama.cpp); proyector de visión separado en `mmproj-Qwen3.8-27B-F16.gguf` o `mmproj-Qwen3.8-27B-BF16.gguf` |

## Arquitectura y entrenamiento

El repositorio no documenta la arquitectura interna del modelo base ni su proceso de entrenamiento (número de tokens, composición del dataset, RLHF/DPO). Lo que sí se detalla es el proceso de cuantización: AtomicChat construye sus ficheros a partir de los pesos originales de Qwen usando matrices de importancia propias, con corpus de calibración públicos en el dataset `AtomicChat/calib-corpora`.

El esquema Atomic Dynamic nombra cada fichero según los tipos asignados a los dos grupos de tensores más grandes, `ffn_down` y `ffn_up`, colapsando el nombre cuando ambos coinciden. La innovación operativa destacable es la inclusión de una cabeza de predicción multi-token (MTP) dentro de todos los ficheros, que permite decodificación especulativa con `--spec-type draft-mtp` en llama.cpp sin artefactos adicionales. El modelo es multimodal: la lectura de imágenes requiere el proyector de visión aparte, compartido entre todas las cuantizaciones.

## Capacidades

- Generación de texto conversacional con formato de chat ChatML (`<|im_start|>`/`<|im_end|>`) y modo de razonamiento activable mediante `<think>`.
- Comprensión de imágenes (pipeline `image-text-to-text`) mediante el proyector `mmproj`; el autor menciona también vídeo en la sección de imágenes.
- Decodificación especulativa nativa gracias a la cabeza MTP incluida en los pesos.
- Ejecución local en llama.cpp con soporte de offload parcial de capas a CPU.
- Compatibilidad declarada con endpoints (`endpoints_compatible` en los tags del repositorio).
- Soporte de tool calling, agentes, matemáticas o capacidades multilingües específicas: no disponible en la información proporcionada.

## Casos de uso

- Asistente conversacional local con razonamiento visible: el modo `<think>` permite separar el razonamiento interno de la respuesta final, útil en entornos de escritorio donde el usuario quiere auditar el proceso de deducción.
- Análisis de documentos escaneados y capturas: con el proyector `mmproj` y `--image-min-tokens 1024`, el modelo puede transcribir y describir imágenes; el autor valida esta vía con una muestra de caligrafía gótica manuscrita, un caso más exigente que una fotografía convencional.
- Despliegue en estaciones de trabajo de 24 GB: con `AD-Q5_K_M-Q4_K_M` (18,6 GB) y unos 16k de contexto, cabe en una RTX 4090 o similar, permitiendo asistentes de código y análisis de texto sin conexión.
- Servicio de inferencia con decodificación especulativa: usando `llama-server` con la cabeza MTP se obtienen 77 t/s de generación a 8k de contexto en 2x RTX 5090, adecuado para prototipos de atención al usuario con latencia interactiva.
- Procesamiento por lotes de prompts largos: los 5244 t/s de prefill a 32k de contexto medidos por el autor lo hacen viable para tareas de resumen o extracción sobre documentos extensos en hardware de gama alta.
- Evaluación comparativa de cuantizaciones: los datos de KL y top-1 publicados permiten elegir el punto de la curva tamaño/calidad adecuado para cada restricción de VRAM, desde 12 GB (`AD-IQ2_S`) hasta 48 GB o más (`Q8_0`).
- Investigación sobre cuantización: la publicación de los corpus de calibración y de los registros de métricas permite reproducir y auditar el impacto de cada esquema de tipos por tensor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K) en la información disponible. El autor sí publica métricas de fidelidad de cuantización frente a los pesos originales:

| Fichero | Tamano | Divergencia KL | top-1 |
|---|---:|---:|---:|
| Q8_0 | 28,9 GB | 0,00064 | 98,92% |
| AD-Q6_K | 25,0 GB | 0,00107 | 98,67% |
| AD-Q6_K-Q5_K | 23,1 GB | 0,00252 | 97,94% |
| AD-Q5_K_M | 20,2 GB | 0,00419 | 97,34% |
| AD-Q5_K_M-Q4_K_M | 18,6 GB | 0,00730 | 96,43% |
| AD-Q4_K_M | 17,1 GB | 0,01126 | 95,59% |
| AD-IQ4_XS | 16,5 GB | 0,01248 | 95,39% |
| AD-IQ4_XS-IQ3_S | 14,4 GB | 0,02660 | 93,15% |
| AD-IQ3_S | 13,8 GB | 0,03247 | 92,41% |
| AD-IQ3_S-IQ3_XXS | 13,0 GB | 0,04337 | 91,33% |
| AD-IQ3_XXS | 12,1 GB | 0,06972 | 89,13% |
| AD-IQ2_S | 11,1 GB | 0,09832 | 87,18% |
| AD-IQ2_S-IQ2_XS | 10,2 GB | 0,13807 | 84,77% |
| AD-IQ2_XS | 9,9 GB | 0,16170 | 83,48% |
| AD-IQ2_XXS | 9,0 GB | 0,25663 | 79,44% |
| AD-IQ1_M | 8,5 GB | 0,34212 | 76,34% |

Rendimiento medido por el autor con `AD-Q4_K_M` y offload completo en 2x RTX 5090:

| Contexto | Prefill | Generación |
|---|---:|---:|
| 8k | 363 t/s | 77 t/s |
| 32k | 5244 t/s | 72 t/s |

## Requisitos de hardware

- Caché de atención: 256 KB por token, es decir, 2 GB a 8k de contexto y 8 GB a 32k. Debe presupuestarse junto con el peso del fichero.
- 12 GB de VRAM: `AD-IQ2_S` (11,1 GB), solo con contexto corto o moviendo capas a CPU.
- 16 GB de VRAM: `AD-IQ3_S` (13,8 GB), en torno a 8k de contexto.
- 24 GB de VRAM: `AD-Q5_K_M-Q4_K_M` (18,6 GB), en torno a 16k de contexto; encaja en RTX 4090/3090.
- 32 GB de VRAM: `AD-Q6_K` (25,0 GB), en torno a 24k de contexto.
- 48 GB o más: `Q8_0` (28,9 GB) con contexto completo; válido para A100 80 GB, H100, RTX A6000 o configuraciones multi-GPU.
- Despliegue: llama.cpp (`llama-server`, `llama-cli`, `llama-mtmd-cli` para multimodal). No se documentan otras opciones como vLLM, TGI u Ollama en la información disponible.
- Throughput de referencia: 77 t/s de generación a 8k y 72 t/s a 32k en 2x RTX 5090 con `AD-Q4_K_M`; el prefill escala de 363 t/s (8k) a 5244 t/s (32k).
- Recomendación del autor: entre dos ficheros contiguos, elegir el mayor; el salto cuesta uno o dos gigabytes y reduce notablemente la tasa de palabras erróneas, especialmente por debajo de 14 GB.

## Comparativa con modelos similares

No se dispone de datos de modelos comparables en la información proporcionada. El propio autor incluye en la model card una comparación gráfica de todas las cuantizaciones disponibles del modelo (propias y de terceros) frente a los pesos originales sobre el mismo texto reservado, con una línea discontinua que marca el mejor fichero de cada tamaño ajeno a AtomicChat, pero los valores numéricos de esa comparación externa no se detallan en el texto.

| Modelo | Parámetros | Contexto | Licencia | Formato |
|---|---|---|---|---|
| Qwen3.8-27B (AtomicChat GGUF) | 27,3 B | no disponible | no disponible | GGUF |
| Alternativas de la misma categoría | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- La licencia del modelo base no está indicada en la información disponible; antes de un uso comercial debe verificarse en el repositorio de Qwen/Qwen3.8-27B.
- La cuantización introduce degradación medible: incluso `Q8_0` presenta una divergencia KL de 0,00064 y un 98,92% de top-1, por lo que no es idéntico a los pesos originales. Por debajo de 14 GB la curva se vuelve pronunciada (`AD-IQ2_XXS` cae al 79,44% de top-1).
- La lectura de imágenes exige `--image-min-tokens 1024`; el propio llama.cpp advierte de que por debajo de ese umbral la información posicional se vuelve poco fiable.
- El proyector de visión es un fichero adicional obligatorio para tareas multimodales; no está incluido en los ficheros de cuantización.
- El consumo de caché de atención (256 KB por token) limita el contexto efectivo mucho antes que el tamaño del fichero; a 32k se necesitan 8 GB adicionales solo para caché.
- No se documentan idiomas soportados ni sesgos conocidos del modelo base.
- El riesgo de alucinación no está cuantificado en la información disponible; como en cualquier modelo generativo, debe validarse la salida en producción.
- Las cifras de velocidad proceden de una configuración concreta (2x RTX 5090, offload completo, `AD-Q4_K_M`) y no son extrapolables a otro hardware.
- El repositorio ocupa 253,3 GB en total; descargar la familia completa no es necesario, basta con un fichero de cuantización y el `mmproj`.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/AtomicChat/Qwen3.8-27B-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Corpus de calibración: https://huggingface.co/datasets/AtomicChat/calib-corpora
- Métricas y registros brutos: https://huggingface.co/datasets/AtomicChat/Qwen3.8-27B-GGUF-metrics
- Guía de ejecución local: https://atomic.chat/blog/guides/how-to-run-qwen-3-8-locally
- Aplicación Atomic Chat: https://atomic.chat/
- Repositorio GitHub: https://github.com/AtomicBot-ai/Atomic-Chat
- Discord: https://discord.gg/8wGSsvmg4V
- X (Twitter): https://x.com/atomic_chat_hq
