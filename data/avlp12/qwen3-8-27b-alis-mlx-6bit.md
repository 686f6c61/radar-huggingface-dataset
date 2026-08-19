# avlp12/Qwen3.8-27B-Alis-MLX-6bit

## Resumen

Qwen3.8-27B-Alis-MLX-6bit es una cuantización MLX de 6 bits del modelo multimodal Qwen3.8-27B, desarrollada por avlp12 para Apple silicon. A diferencia de las conversiones MLX estándar que descartan la torre de visión y la cabeza de predicción multi-token (MTP), este build conserva ambos subsistemas completos: 333 tensores de visión en bf16 (0.461B parámetros) y 31 tensores MTP. El resultado es un modelo de 21.5 GB en disco que alcanza 27.3 tokens/s de decodificación en un Apple M3 Ultra, con una perplexity en corpus coreano estadísticamente indistinguible del original en bf16 (6.1018 vs 6.0954).

El modelo base, Qwen3.8-27B, es un transformer denso de 27B parámetros con atención híbrida: solo 16 de sus 64 capas usan atención completa, mientras que las otras 48 emplean atención lineal con estado recurrente constante. Esta arquitectura, junto con la cuantización MLX, lo hace especialmente adecuado para ejecución local en Macs con memoria unificada de 32 GB, manteniendo capacidades de visión-lenguaje completas. La licencia Apache-2.0 permite uso comercial sin restricciones.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3.8-27B (transformer denso, atención híbrida: 16 capas full attention + 48 capas linear attention, torre de visión de 27 capas, cabeza MTP) |
| Parametros totales | 27B (modelo base); 6.439.219.952 en safetensors cuantizados |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | 6-bit MLX (este repo); también 8-bit y 4-bit (AWQ) en el mismo set |
| Idiomas soportados | No disponibles (evaluado en inglés, coreano y código) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

Qwen3.8-27B-Alis-MLX-6bit es una cuantización del checkpoint Qwen3.8-27B, un modelo de visión-lenguaje con arquitectura `Qwen3_5ForConditionalGeneration`. El modelo base emplea atención híbrida: 16 de las 64 capas usan atención completa (intervalo de 4), mientras que las 48 restantes usan atención lineal con un estado recurrente constante. Incluye una torre de visión de 27 capas (hidden 1152, 16 cabezas, patch 16, spatial merge 2) y una cabeza de predicción multi-token (MTP) para decodificación especulativa.

La cuantización MLX 6-bit conserva íntegramente la torre de visión en bf16 (333 tensores, 0.461B parámetros) y la cabeza MTP (31 tensores). El autor verificó que la carga funciona con mlx-vlm 0.6.13 sin necesidad de código de adaptación. Los detalles del entrenamiento original (datos, tokens, RLHF/DPO) no se proporcionan en la información disponible.

## Capacidades

- Procesamiento multimodal: entrada de imagen y texto, salida de texto (pipeline `image-text-to-text`).
- Generación de texto, razonamiento, código y matemáticas, heredadas del modelo base Qwen3.8-27B.
- Decodificación especulativa mediante la cabeza MTP y el mecanismo DSpark, según el repositorio del autor.
- Capacidades multilingües: evaluado en inglés, coreano y código; la lista completa de idiomas no está disponible.
- La torre de visión completa permite tareas de descripción de imágenes, respuesta visual a preguntas y comprensión de documentos con imágenes.

## Casos de uso

- Asistente de visión-lenguaje en local: ejecutar el modelo en un Mac con 32 GB de memoria unificada para describir imágenes, extraer información de capturas o responder preguntas sobre contenido visual sin depender de servicios en la nube.
- Prototipado rápido de aplicaciones multimodales: gracias a la integración con mlx-vlm, se puede lanzar una demo funcional con un comando sencillo, ideal para validar ideas antes de escalar a infraestructura mayor.
- Generación y revisión de código en entornos offline: el modelo mantiene una perplexity en código de 1.6854, muy cercana al bf16 (1.6813), y su velocidad de decodificación de 27.3 tok/s permite usarlo como asistente de programación en máquinas Apple.
- Procesamiento de documentos mixtos: al aceptar imágenes y texto, puede resumir informes escaneados, extraer datos de tablas en capturas o transcribir diagramas a descripciones textuales.
- Investigación en eficiencia de cuantización: el repositorio documenta comparativas detalladas entre builds de 8, 6 y 4 bits, incluyendo perplexity por corpus y velocidad, lo que lo convierte en un referente para estudiar el impacto de la cuantización en modelos multimodales.
- Desarrollo de agentes conversacionales multilingües: la calidad en coreano es estadísticamente idéntica al modelo original, lo que permite construir chatbots en idiomas no ingleses sin degradación perceptible.

## Benchmarks y rendimiento

La model card no incluye benchmarks estándar como MMLU, HumanEval o GSM8K, pero sí proporciona mediciones de perplexity por corpus y rendimiento de inferencia. La siguiente tabla resume los datos publicados para las distintas cuantizaciones del mismo set, medidas en un Apple M3 Ultra (512 GB de memoria unificada) con contexto corto.

| Build | Tamaño (GB) | Decodificación (tok/s) | Prefill (tok/s) | Pico RAM (GB) | PPL en / ko / code |
|---|---|---|---|---|---|
| bf16 referencia | 51.8 | 12.6 | 410 | 51.1 | 5.7734 / 6.0954 / 1.6813 |
| 8-bit | 27.9 | 21.8 | 429 | 28.2 | 5.7760 / 6.0987 / 1.6815 |
| 6-bit (este repo) | 21.5 | 27.3 | 424 | 21.9 | 5.7924 / 6.1018 / 1.6854 |
| 4-bit (AWQ) | 15.2 | 37.5 | 436 | 15.6 | 5.8450 / 6.2609 / 1.8105 |

Frente al bf16, el build de 6 bits ocupa un 42% del tamaño y decodifica 2.17 veces más rápido, con un incremento de perplexity de +0.28% en inglés y +0.23% en código, mientras que en coreano la diferencia no es estadísticamente significativa. El pico de RAM indicado corresponde a carga más sonda a contexto corto; para contextos largos hay que añadir el tamaño de la caché KV.

## Requisitos de hardware

- Apple silicon con soporte MLX (M1, M2, M3 y superiores). Medido en M3 Ultra.
- 21.5 GB en disco para los pesos; pico de RAM de 21.9 GB a contexto corto (cabe en Macs de 32 GB de memoria unificada).
- Para contextos largos, añadir la caché KV correspondiente; el autor no proporciona una fórmula exacta.
- Inferencia mediante MLX y mlx-vlm 0.6.13 (soporta `qwen3_5` de forma nativa).
- Velocidades de referencia: 27.3 tok/s de decodificación y 424 tok/s de prefill en M3 Ultra. En chips inferiores se espera un rendimiento proporcionalmente menor.
- No requiere GPU dedicada; la memoria unificada de Apple es suficiente.

## Comparativa con modelos similares

La comparativa más directa es con las otras cuantizaciones del mismo modelo base, ya que no se dispone de datos de modelos alternativos en la información proporcionada.

| Modelo | Tamaño (GB) | Decodificación (tok/s) | PPL coreano | Licencia |
|---|---|---|---|---|
| Qwen3.8-27B bf16 | 51.8 | 12.6 | 6.0954 | Apache-2.0 |
| Qwen3.8-27B-Alis-MLX-8bit | 27.9 | 21.8 | 6.0987 | Apache-2.0 |
| Qwen3.8-27B-Alis-MLX-6bit (este) | 21.5 | 27.3 | 6.1018 | Apache-2.0 |
| Qwen3.8-27B-Alis-MLX-4bit (AWQ) | 15.2 | 37.5 | 6.2609 | Apache-2.0 |

El build de 6 bits ofrece el mejor equilibrio entre tamaño, velocidad y fidelidad para idiomas no ingleses. El de 4 bits es más rápido y ligero, pero degrada notablemente el coreano. No se dispone de comparativas con otros modelos de la misma categoría (por ejemplo, Llama 3.2 Vision o Phi-3.5-Vision) en la información consultada.

## Limitaciones y advertencias

- La cuantización 6-bit introduce un aumento medible, aunque pequeño, de perplexity en inglés (+0.28%) y código (+0.23%) frente al bf16; en coreano no se detecta diferencia significativa.
- El build de 4 bits (AWQ) muestra una degradación mayor en coreano (PPL 6.2609), por lo que no se recomienda para aplicaciones multilingües exigentes.
- La torre de visión se mantiene en bf16 sin cuantizar, lo que aumenta el tamaño total pero preserva la calidad visual; no se han evaluado los efectos de cuantizar la torre de visión.
- No se proporcionan datos sobre sesgos, alucinaciones o comportamientos inseguros del modelo. Al ser una derivación de Qwen3.8-27B, hereda las características y riesgos del modelo base.
- La información sobre la longitud de contexto no está disponible; se recomienda verificar la configuración del modelo base antes de usarlo con ventanas largas.
- La licencia Apache-2.0 permite uso comercial, pero se deben respetar los términos de la licencia del modelo base (también Apache-2.0).

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/avlp12/Qwen3.8-27B-Alis-MLX-6bit
- Repositorio GitHub del autor: https://github.com/avlp12/qwen38_alis_mlx
- Modelo base Qwen3.8-27B en HuggingFace: https://huggingface.co/Qwen/Qwen3.8-27B
- Build de 8 bits del mismo set: https://huggingface.co/avlp12/Qwen3.8-27B-Alis-MLX-8bit
- Recetas vLLM para Qwen3.8-27B: https://recipes.vllm.ai/Qwen/Qwen3.8-27B
