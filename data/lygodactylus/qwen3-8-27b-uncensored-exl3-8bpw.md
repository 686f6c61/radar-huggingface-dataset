# Lygodactylus/Qwen3.8-27B-Uncensored-exl3-8bpw

## Resumen

El modelo `Lygodactylus/Qwen3.8-27B-Uncensored-exl3-8bpw` es una cuantización EXL3 de 8.0 bits por peso (bpw) del modelo `orcarouter/Qwen3.8-27B-Uncensored`, que a su vez es una versión "abliterada" (con la capa de rechazo eliminada) del modelo Qwen3.8-27B de Alibaba. Esta variante está diseñada para eliminar las negativas de seguridad del modelo original, permitiendo respuestas sin censura a peticiones que el modelo base rechazaría. El desarrollador es Lygodactylus, que ha publicado varias cuantizaciones de esta familia (4.0, 6.0 y 8.0 bpw) usando ExLlamaV3.

La cuantización EXL3 8.0 bpw es la de mayor fidelidad de la familia, con un tamaño en disco de 28 GB. El modelo conserva el cabezal MTP (Multi-Token Prediction) a 8 bpw, lo que permite usar decodificación especulativa nativa en TabbyAPI, y mantiene la torre de visión sin cuantizar (16 bits). Aunque el nombre indica 27B, los parámetros reales según los safetensors son 14.777.087.216 (aproximadamente 14.8B), una discrepancia que conviene tener en cuenta al dimensionar hardware. El modelo soporta inglés, francés y chino, y se distribuye bajo licencia Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (Qwen3.8) con torre de visión y cabezal MTP |
| Parametros totales | 14.777.087.216 (según safetensors) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no especificada en la información) |
| Tipos de cuantizacion | EXL3 8.0 bpw (también disponibles 4.0 y 6.0 bpw) |
| Idiomas soportados | en, fr, zh |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (EXL3) |

## Arquitectura y entrenamiento

El modelo base es Qwen3.8-27B, un transformer multimodal con una torre de visión que procesa imágenes y un cabezal MTP para decodificación especulativa. La versión abliterada de orcarouter elimina la capa de rechazo (refusal) del modelo original, de modo que no aplica las negativas de seguridad aprendidas durante el alineamiento. La cuantización EXL3 se realizó con ExLlamaV3 1.4.6, usando un corpus de calibración por defecto (wiki 50, C4 20, code 20, random tokens 20, technical 10, multilingual 10, tiny 5) con 250 filas de 2048 columnas. El `lm_head` y las capas MTP se cuantizaron a 8 bpw, mientras que la torre de visión y los embeddings se mantuvieron en 16 bits sin cuantizar. No se dispone de información sobre el entrenamiento original del modelo base (número de tokens, dataset, RLHF/DPO), ya que la model card solo documenta el proceso de cuantización.

## Capacidades

- Generación de texto y conversación en inglés, francés y chino.
- Razonamiento y resolución de problemas, heredado del modelo base Qwen3.8-27B.
- Capacidades multimodales: la torre de visión sin cuantizar permite procesar imágenes (aunque no se detallan tareas específicas en la documentación).
- Decodificación especulativa mediante el cabezal MTP, que acelera la generación en entornos compatibles (TabbyAPI con `draft_mode: mtp`).
- Ausencia de guardarraíles: al estar abliterado, responde a peticiones que el modelo original rechazaría, sin filtros de seguridad integrados.
- No se especifica soporte explícito para tool calling, function calling o agentes multi-paso en la información disponible.

## Casos de uso

- Investigación en alineamiento y seguridad: el modelo permite estudiar el comportamiento de un LLM sin capas de rechazo, útil para analizar sesgos, mecanismos de negativa y técnicas de moderación.
- Generación de contenido creativo sin restricciones: escritura de ficción, guiones o diálogos que requieren explorar temas sensibles sin filtros automáticos.
- Desarrollo de sistemas de moderación: al conocer las respuestas "sin censura", se pueden diseñar clasificadores o filtros externos que detecten contenido no deseado.
- Evaluación de cuantización: comparar la calidad de salida entre 4.0, 6.0 y 8.0 bpw para decidir el punto óptimo de compresión en despliegues con VRAM limitada.
- Pruebas de decodificación especulativa: validar el rendimiento del cabezal MTP en TabbyAPI o ExLlamaV3, midiendo latencia y throughput en diferentes configuraciones.
- Despliegue en entornos controlados con moderación externa: integrar el modelo en un pipeline que añada una capa de filtrado de contenido antes de exponerlo a usuarios finales, aprovechando su capacidad de generar respuestas sin rechazos.

## Benchmarks y rendimiento

La model card incluye mediciones propias realizadas con AIPerf en hardware de 4x RTX 4000 Ada (20 GiB, sm89) con PCIe sin NVLink, usando ExLlamaV3 1.4.6 + TabbyAPI, tensor-parallel, `cache_mode "8,8"` y MTP activado. Los resultados comparan las tres cuantizaciones:

| Métrica (ISL 1000 / OSL 500 / conc. 4 / 20 requests) | 4.0 bpw | 6.0 bpw | 8.0 bpw |
|---|---|---|---|
| Tamaño | 16 GB | 22 GB | 28 GB |
| Latencia de request | 19.906 ms | 20.816 ms | 21.145 ms |
| ITL (tiempo entre tokens) | 33.5 ms | 35.0 ms | 36.2 ms |
| TTFT (tiempo hasta primer token) | 3.352 ms | 3.515 ms | 3.289 ms |
| Throughput de salida | 97 tok/s | 91 tok/s | 90 tok/s |

También se comparó con vLLM 0.28.0 usando los mismos pesos en FP8:

| Métrica | vLLM FP8 | EXL3 6.0 bpw |
|---|---|---|
| Latencia de request | 14.158 ms | 20.816 ms |
| ITL | 26.3 ms | 35.0 ms |
| TTFT | 1.028 ms | 3.515 ms |

En prompts largos (ISL 8000, conc. 2), vLLM obtuvo TTFT de 5.508 ms frente a 9.481 ms de EXL3, con prefill de 1.733 tok/s frente a 1.277 tok/s. En single-stream con prompts cortos, EXL3 alcanzó ~63 tok/s frente a ~45 tok/s de vLLM. El efecto de tensor-parallel: con TP activado, el prefill TTFT (8k) bajó de 17.644 ms a 9.577 ms, pero la generación single-stream cayó de 63 tok/s a 34.6 tok/s. Sobre calidad, la model card indica que el build FP8 del mismo modelo abliterado puntúa 88.0% en MMLU-Pro (subset business, 100 preguntas) frente al 89.0% del Qwen3.8-27B-FP8 oficial, pero no se ha verificado el rendimiento de la versión 8.0 bpw.

## Requisitos de hardware

- VRAM estimada: el repo ocupa 29.6 GB en disco; para inferencia con EXL3 8.0 bpw se necesitan al menos ~30 GB de VRAM, más espacio para el contexto (dependiendo de `cache_size`).
- GPU recomendadas: una RTX 4090 (24 GB) no es suficiente; se requiere una RTX 6000 Ada (48 GB), A100 40/80 GB, o múltiples GPUs en tensor-parallel (por ejemplo, 4x RTX 4000 Ada de 20 GB como en las pruebas).
- En consumer GPU: no cabe en una sola GPU de gama de consumo (RTX 3090/4090 con 24 GB); se necesitaría al menos 2x RTX 3090/4090 con tensor-parallel, aunque el rendimiento se ve limitado por PCIe sin NVLink.
- Opciones de despliegue: ExLlamaV3 (con TabbyAPI), vLLM (con pesos FP8), llama.cpp (aunque las conversiones GGUF pierden el cabezal MTP).
- Latencia y throughput: en el hardware de prueba (4x RTX 4000 Ada, TP activado), ITL de 36.2 ms y throughput de 90 tok/s con 8.0 bpw; en single-stream sin TP, ~63 tok/s. Con vLLM FP8, ITL de 26.3 ms y throughput superior en escenarios servidos.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Notas |
|---|---|---|---|---|---|
| Qwen3.8-27B (base) | 14.8B (según safetensors) | no disponible | FP8 (oficial) | Apache 2.0 | Modelo original con alineamiento de seguridad |
| Qwen3.8-27B-Uncensored (orcarouter) | 14.8B | no disponible | FP8 (referencia) | Apache 2.0 | Versión abliterada sin capa de rechazo |
| Qwen3.8-27B-Uncensored-exl3-4bpw | 14.8B | no disponible | EXL3 4.0 bpw | Apache 2.0 | Variante de menor tamaño (16 GB) |
| Qwen3.8-27B-Uncensored-exl3-6bpw | 14.8B | no disponible | EXL3 6.0 bpw | Apache 2.0 | Variante intermedia (22 GB) |
| Este modelo (8.0 bpw) | 14.8B | no disponible | EXL3 8.0 bpw | Apache 2.0 | Mayor fidelidad, conserva MTP |

La comparativa se limita a las variantes de la misma familia, ya que no se dispone de datos de otros modelos comparables en la información proporcionada.

## Limitaciones y advertencias

- El modelo está abliterado: se ha eliminado la capa de rechazo, por lo que no tiene guardarraíles integrados y puede generar contenido inapropiado, ofensivo o peligroso. Solo debe usarse en entornos de investigación controlados.
- No se ha verificado la calidad a 8.0 bpw; la model card solo referencia el rendimiento del build FP8 (88.0% en MMLU-Pro business subset), que está dentro del ruido respecto al modelo oficial.
- La longitud de contexto no está especificada en la documentación; se recomienda consultar el modelo base Qwen3.8-27B para conocerla.
- El rendimiento con tensor-parallel en sistemas sin NVLink (como el de las pruebas) es peor que con NVLink; los resultados deben interpretarse como un límite inferior.
- Las conversiones GGUF de esta familia pierden los tensores `mtp.*`, por lo que no se puede usar decodificación especulativa en llama.cpp.
- La licencia Apache 2.0 permite uso comercial, pero la ausencia de moderación hace necesario añadir una capa de filtrado externa antes de cualquier despliegue en producción.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Lygodactylus/Qwen3.8-27B-Uncensored-exl3-8bpw
- Modelo base abliterado: https://huggingface.co/orcarouter/Qwen3.8-27B-Uncensored
- Variante 4.0 bpw: https://huggingface.co/Lygodactylus/Qwen3.8-27B-Uncensored-exl3-4bpw
- Variante 6.0 bpw: https://huggingface.co/Lygodactylus/Qwen3.8-27B-Uncensored-exl3-6bpw
- ExLlamaV3: https://github.com/turboderp-org/exllamav3
- TabbyAPI: https://github.com/theroyallab/tabbyAPI
