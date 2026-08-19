# gjtgjt/Qwen3.8-27B-heretic-GGUF

## Resumen

`gjtgjt/Qwen3.8-27B-heretic-GGUF` es una colección de cuantizaciones GGUF del modelo `gjtgjt/Qwen3.8-27B-heretic`, una abliteración completa (método Heretic 1.4.0, modalidad FULL) del modelo oficial `Qwen/Qwen3.8-27B` de Alibaba. La abliteración elimina los rechazos de seguridad del modelo original, de modo que responde sin negarse a peticiones que el modelo base consideraría prohibidas. El repo incluye dos cuantizaciones de texto (Q8_0 y Q5_K_M) y un proyector de visión (mmproj) en BF16, lo que permite usar el modelo como multimodal imagen-texto.

El modelo base tiene 26,9 mil millones de parámetros, una ventana de contexto nativa de 262 144 tokens y arquitectura transformer densa (no MoE). La abliteración se realizó sobre las capas de lenguaje (64 capas) sin tocar la torre de visión ni el cabezal MTP. La licencia es Apache-2.0, lo que permite uso comercial sin restricciones adicionales. Este GGUF es relevante para quienes buscan un modelo de 27B con capacidades multimodales, contexto muy largo y comportamiento "sin censura" en inglés y chino, ejecutable localmente con llama.cpp o herramientas compatibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (no MoE) |
| Parametros totales | 26 895 998 464 (26,9 B) |
| Parametros activos | No disponible (modelo denso, todos los parametros activos) |
| Longitud de contexto | 262 144 tokens |
| Tipos de cuantizacion | Q8_0, Q5_K_M (texto); BF16 (proyector de vision) |
| Idiomas soportados | Ingles (en), chino (zh) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

El modelo base `Qwen/Qwen3.8-27B` es un transformer denso de 64 capas de lenguaje, con atención causal estándar y un cabezal de visión integrado que permite entrada de imágenes. La abliteración se aplicó con la herramienta Heretic 1.4.0 en modalidad FULL (normalización por filas y aproximación SVD de rango 3 tras restaurar las normas de fila). El proceso realizó 200 pruebas con 60 de arranque, seleccionando el ensayo 145. La evaluación de Heretic reporta una puntuación de palabra clave de 27 sobre 100 y una divergencia KL de 0,0446 frente al original, lo que indica una alteración moderada de las activaciones. La torre de visión y el cabezal MTP no fueron ablados; el proyector de visión se convirtió a GGUF desde el mismo árbol de pesos. No se aplicó ningún entrenamiento adicional (ni RLHF ni DPO) sobre el modelo abliterado.

## Capacidades

- Generación de texto y razonamiento: hereda las capacidades de Qwen3.8-27B, incluyendo razonamiento paso a paso y modo "thinking" activable por defecto.
- Generación de código y matemáticas: el modelo base está entrenado en tareas de programación y cálculo, por lo que estas capacidades se mantienen.
- Soporte multimodal: el proyector de visión permite procesar imágenes y responder preguntas sobre ellas (descripción, análisis, OCR básico).
- Tool calling y function calling: el modelo base soporta llamadas a herramientas; la abliteración no elimina esta capacidad, aunque no se ha verificado explícitamente en esta versión.
- Multilingüe: inglés y chino, con mejor rendimiento en estos dos idiomas.
- Modo instructivo y modo razonamiento: se puede alternar entre ambos mediante el parámetro `--reasoning off` en llama.cpp.
- Comportamiento sin censura: la abliteración reduce los rechazos, permitiendo respuestas a peticiones que el modelo original bloquearía.

## Casos de uso

- Generación creativa de ficción y roleplay: el modelo responde sin rechazos a temas adultos o controvertidos, lo que lo hace adecuado para escritura creativa sin restricciones temáticas. Con 262k de contexto puede mantener tramas largas y múltiples personajes.
- Análisis de contenido sensible en investigación: investigadores que estudian discurso de odio o contenido explícito pueden usar el modelo para generar ejemplos sintéticos sin depender de APIs con filtros.
- Asistente de programación local: con Q5_K_M y 19 GB de VRAM, puede ejecutarse en una RTX 4090 y usarse para autocompletar código, explicar fragmentos o generar scripts, sin enviar datos a la nube.
- Procesamiento de documentos con imágenes: gracias al proyector de visión, puede extraer texto de capturas de pantalla, diagramas o fotografías y responder preguntas sobre ellos, útil en entornos sin conexión.
- Chat conversacional en chino e inglés: para aplicaciones de atención al cliente bilingüe, el modelo mantiene conversaciones multi-turno con contexto largo y puede integrarse en pipelines con tool calling.
- Experimentación con abliteración: como referencia para quienes estudian los efectos de la eliminación de rechazos en modelos de 27B, comparando con la versión r1n (rank-1 iterativo) o con el modelo original.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que no se midieron ni perplexity ni velocidad para estos archivos GGUF. La única métrica reportada es la evaluación de Heretic (keyword 27/100, KL 0,0446), que no es comparable con benchmarks estándar como MMLU o HumanEval. Se recomienda evaluar el modelo en las tareas específicas antes de usarlo en producción.

## Requisitos de hardware

- Q8_0: 26,63 GiB de pesos; requiere al menos 28 GB de VRAM para inferencia con contexto corto. GPU recomendada: A100 40 GB, RTX A6000 48 GB o similar.
- Q5_K_M: 17,91 GiB de pesos; cabe en una RTX 4090 (24 GB) o RTX 3090 (24 GB) con contexto moderado. Para contexto largo (más de 32k tokens), la memoria KV domina y puede necesitar más VRAM o cuantización KV.
- Proyector de visión: 0,87 GiB adicionales; se carga junto con el modelo de texto.
- Opciones de despliegue: llama.cpp (CLI y servidor), LM Studio, Ollama (si se importa el GGUF), KoboldCpp, Jan. También es compatible con servidores que soporten GGUF como llama.cpp server o text-generation-webui.
- Latencia y throughput: no medidos en la información disponible. Para un modelo de 27B en Q8_0, se puede esperar un throughput aproximado de 10-20 tokens/s en una GPU de 40 GB, pero estos valores son estimaciones generales, no datos del autor.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizaciones | Licencia | Notas |
|---|---|---|---|---|---|
| Qwen3.8-27B (oficial) | 26,9 B | 262 144 | BF16, FP8, GGUF (unsloth) | Apache-2.0 | Modelo base sin abliterar, con rechazos de seguridad |
| gjtgjt/Qwen3.8-27B-heretic (este) | 26,9 B | 262 144 | Q8_0, Q5_K_M | Apache-2.0 | Abliteración FULL con Heretic; vision incluida |
| gjtgjt/Qwen3.8-27B-heretic-r1n | 26,9 B | 262 144 | GGUF (separado) | Apache-2.0 | Abliteración iterativa rank-1 (PRE); no incluye vision |
| mradermacher/Qwen-3.8-27B-Heretic-GGUF | 26,9 B | 262 144 | GGUF (varias) | Apache-2.0 | Otra cuantización del mismo modelo abliterado |

La principal diferencia frente al modelo oficial es la eliminación de rechazos; frente a la versión r1n, este usa el método FULL (rango 3 aproximado) en lugar de rank-1 iterativo, lo que puede afectar la fidelidad y el comportamiento.

## Limitaciones y advertencias

- La abliteración reduce la capacidad del modelo para rechazar contenido dañino; puede generar texto ofensivo, sesgado o peligroso si se le pide. No debe usarse en aplicaciones donde se requiera moderación automática.
- No se han publicado benchmarks de calidad (MMLU, HumanEval, etc.), por lo que no se puede verificar si la abliteración degrada el rendimiento en tareas estándar. La puntuación de keyword de Heretic (27/100) sugiere que el modelo aún conserva ciertos patrones de rechazo, pero no es una medida de calidad general.
- Solo soporta inglés y chino; el rendimiento en otros idiomas no está garantizado.
- El contexto nativo de 262 144 tokens requiere mucha memoria KV; en GPUs de consumo (24 GB) el contexto práctico se reduce significativamente.
- El cabezal MTP (multi-token prediction) no está incluido en los GGUF, por lo que la velocidad de decodificación puede ser menor que en el modelo original.
- No se proporcionan garantías de estabilidad o seguridad para uso en producción; se recomienda evaluar exhaustivamente antes de desplegar.

## Enlaces

- Repositorio HuggingFace del modelo: https://huggingface.co/gjtgjt/Qwen3.8-27B-heretic-GGUF
- Modelo base (full precision): https://huggingface.co/gjtgjt/Qwen3.8-27B-heretic
- Modelo original Qwen3.8-27B: https://huggingface.co/Qwen/Qwen3.8-27B
- Repositorio de Heretic (herramienta de abliteración): https://github.com/p-e-w/heretic
- Repositorio de llama.cpp: https://github.com/ggml-org/llama.cpp
- GGUF de unsloth para el modelo base: https://huggingface.co/unsloth/Qwen3.8-27B-GGUF
- Guía de ejecución local (yottalabs): https://www.yottalabs.ai/post/how-to-run-qwen-3-8-27b-locally-ollama-gguf-single-gpu-2026
- Blog de AMD sobre soporte para Qwen3.8-27B: https://www.amd.com/en/blogs/2026/run-qwen-3-8-27b-on-amd-ryzen-ai-max-and-radeon-graphics-cards-day-0.html
- Repositorio oficial de la serie Qwen3.8: https://github.com/QwenLM/Qwen3.8
