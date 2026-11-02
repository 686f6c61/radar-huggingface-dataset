# axteam/gemma-4-26B-A4B-GGUF

## Resumen

`axteam/gemma-4-26B-A4B-GGUF` es una compilación en formato GGUF del modelo `google/gemma-4-26B-A4B`, publicada por el usuario axteam. El modelo original es un transformer multimodal de tipo Mixture-of-Experts (MoE) desarrollado por Google DeepMind, con 25.233.142.046 parámetros totales y 4B parámetros activos por token (de ahí el sufijo A4B). Esta versión GGUF está pensada para su uso con llama.cpp, Ollama y LM Studio, y contiene únicamente el lado lingüístico del modelo: no incluye el proyector de visión (`mmproj`), por lo que la entrada se limita a texto.

La relevancia de esta ficha reside en que permite ejecutar un modelo MoE de 26B parámetros en hardware de consumo mediante cuantización de 4 y 8 bits, con tamaños de archivo de 16,8 GB y 26,9 GB respectivamente. El autor ha medido la perplejidad de cada cuantización sobre WikiText-2 y una muestra de Wikipedia en coreano en una NVIDIA B200, lo que aporta datos verificables sobre la degradación introducida por la cuantización.

Se trata de un modelo base (pre-entrenado), sin plantilla de chat, por lo que su uso previsto es la continuación de texto y no el diálogo instruido. La licencia declarada es Apache 2.0 en los metadatos del repositorio, aunque la model card remite a la licencia específica de Gemma 4 de Google.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Gemma 4, Mixture-of-Experts (MoE), multimodal en el original; esta compilación GGUF ejecuta solo el modelo de lenguaje |
| Parametros totales | 25.233.142.046 (25,2B) |
| Parametros activos | 4B (sufijo A4B) |
| Longitud de contexto | no disponible (el ejemplo de la model card usa `-c 8192`, pero no se especifica el máximo) |
| Tipos de cuantizacion | BF16 (sin cuantizar), Q8_0, Q4_K_M (k-quants de llama.cpp, PTQ bloque a bloque) |
| Idiomas soportados | no disponible en los metadatos; la model card incluye mediciones en inglés y coreano y un resumen en coreano |
| Licencia | apache-2.0 en metadatos; la model card remite a la Gemma 4 license de Google |
| Formato de pesos | GGUF (llama.cpp); el modelo base original está en safetensors |

## Arquitectura y entrenamiento

El modelo original `google/gemma-4-26B-A4B` es un transformer de tipo Mixture-of-Experts con 25,2B parámetros totales y 4B activos por token, lo que reduce el coste computacional de inferencia respecto a un modelo denso del mismo tamaño. La variante original es multimodal (pipeline `image-text-to-text`), pero esta compilación GGUF no incluye el proyector de visión, de modo que solo se puede usar la parte textual.

Los detalles de entrenamiento del modelo base (número de tokens, composición del dataset, uso de RLHF o DPO) no están disponibles en la información proporcionada. La cuantización de esta compilación es post-training quantization (PTQ) realizada con `convert_hf_to_gguf.py` y `llama-quantize` de llama.cpp, con cuantización bloque a bloque de tipo k-quant y sin reentrenamiento; el autor indica explícitamente que no es QAT. Los pesos BF16 de referencia se obtuvieron del original en BF16.

## Capacidades

- Generación de texto y continuación de texto: es un modelo base sin plantilla de chat, por lo que su uso natural es la compleción de texto, no el diálogo instruido.
- Razonamiento y conocimiento general: heredados del modelo Gemma 4 original, aunque no se documentan evaluaciones específicas en esta compilación.
- Capacidades multimodales: el modelo original es image-text-to-text, pero esta compilación GGUF no las soporta al carecer de archivo `mmproj`.
- Soporte de tool calling / function calling: no disponible en esta compilación (modelo base sin plantilla de chat).
- Soporte de agentes y razonamiento multi-paso: no disponible como tal; requeriría una variante instruida con plantilla de chat.
- Capacidades multilingües: no documentadas en los metadatos; las mediciones de perplejidad incluyen inglés y coreano.
- Modo thinking, visión o audio: no disponible en esta compilación.

## Casos de uso

- Experimentación con modelos MoE en hardware de consumo: la cuantización Q4_K_M (16,8 GB) permite cargar un MoE de 25,2B parámetros en una GPU con 24 GB de VRAM, algo inviable con el BF16 de 50,5 GB, y evaluar su comportamiento en tareas de continuación de texto.
- Evaluación de la degradación por cuantización: los datos de perplejidad medidos (5,02 en BF16 frente a 5,25 en Q4_K_M sobre WikiText-2) permiten comparar el impacto de Q4_K_M y Q8_0 en un pipeline propio antes de adoptar una cuantización en producción.
- Generación de texto en lote sin instrucciones: al ser un modelo base, encaja en tareas de compleción, reescritura o generación de borradores donde se controla el prompt de forma manual y no se necesita plantilla de chat.
- Prototipado local con Ollama o LM Studio: el autor documenta el comando `ollama run hf.co/axteam/gemma-4-26B-A4B-GGUF:Q4_K_M`, lo que facilita probar el modelo en un entorno de escritorio antes de invertir en infraestructura.
- Investigación sobre tokenización y prompts base: la model card advierte que el tokenizador GGUF no añade el token BOS (lo hace la plantilla de chat), lo que lo convierte en un caso útil para estudiar el efecto del BOS forzado en la perplejidad.
- Re-cuantización y ajuste fino de la cadena de herramientas: el archivo BF16 de 50,5 GB sirve como referencia para generar nuevas cuantizaciones o para validar conversiones propias con llama.cpp.

## Benchmarks y rendimiento

El autor publica mediciones de perplejidad (menor es mejor) sobre 16 ventanas de 2.048 tokens, ejecutadas con llama.cpp b12005 (commit e0f142d, build CUDA) en una NVIDIA B200 con todas las capas en GPU, el 2 de noviembre de 2026:

| Archivo | WikiText-2 PPL | Wikipedia coreana PPL | vs BF16 (EN / KO) |
|---|---|---|---|
| `gemma-4-26B-A4B-GGUF-BF16.gguf` | 5,02 | 3,46 | referencia |
| `gemma-4-26B-A4B-GGUF-Q8_0.gguf` | 5,02 | 3,47 | +0,0% / +0,1% |
| `gemma-4-26B-A4B-GGUF-Q4_K_M.gguf` | 5,25 | 3,63 | +4,6% / +4,8% |

No se han publicado resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el tamaño del archivo GGUF elegido más la caché KV del contexto configurado. BF16: 50,5 GB; Q8_0: 26,9 GB; Q4_K_M: 16,8 GB.
- GPU recomendadas: el autor validó todos los archivos en una NVIDIA B200. Por tamaño, Q4_K_M encaja en GPUs de 24 GB (RTX 4090, A10G, L4 de 24 GB) dejando margen para la caché KV; Q8_0 requiere 32 GB o más (A100 40 GB, L40S); BF16 requiere 80 GB (A100 80 GB, H100).
- Cabe en GPU de consumo: sí, Q4_K_M en RTX 4090 (24 GB) y en GPUs de 24 GB en general; Q8_0 y BF16 no caben en GPUs de consumo actuales.
- Opciones de despliegue: llama.cpp (`llama-server`, `llama-completion`) con build ≥ b8637 para la arquitectura `gemma4` y `-fa on` (≥ b6325); Ollama mediante `hf.co/axteam/gemma-4-26B-A4B-GGUF:Q4_K_M`; LM Studio indicado como compatible pero no probado por el autor.
- Reducción de memoria: `--cache-type-k q8_0 --cache-type-v q8_0 -fa on` reduce a la mitad la caché KV en tiempo de ejecución.
- Latencia y throughput: no disponibles; el autor no publica medidas de velocidad, solo de perplejidad.
- Muestreo recomendado por Google: `temperature=1.0`, `top_p=0.95`, `top_k=64`.

## Comparativa con modelos similares

No se dispone de datos de benchmarks de tareas para comparar el rendimiento con alternativas. La comparación se limita a parámetros, contexto y licencia según la información disponible:

| Modelo | Parámetros | Activos | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| gemma-4-26B-A4B (esta compilación GGUF) | 25,2B | 4B | no disponible | apache-2.0 / Gemma 4 license | GGUF |
| google/gemma-4-26B-A4B (original) | 25,2B | 4B | no disponible | Gemma 4 license | safetensors (BF16) |
| Alternativas de tamaño similar | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Es un modelo base sin plantilla de chat: no está diseñado para diálogo instruido ni para seguir instrucciones; usarlo así produce resultados pobres.
- No soporta entrada de imágenes en esta compilación: falta el archivo `mmproj` del modelo multimodal original.
- La cuantización Q4_K_M introduce un aumento de perplejidad del 4,6% en inglés y del 4,8% en coreano respecto a BF16; Q8_0 es prácticamente indistinguible del BF16 (+0,0% / +0,1%).
- El tokenizador GGUF no añade el token BOS; si se mide perplejidad sin forzarlo (`--override-kv tokenizer.ggml.add_bos_token=bool:true`), los valores no son comparables.
- Licencia: los metadatos declaran apache-2.0, pero la model card remite a la Gemma 4 license de Google; conviene verificar las condiciones de uso comercial en esa licencia antes de desplegar en producción.
- Sesgos conocidos y riesgo de alucinación: no documentados en la información disponible; son heredados del modelo base de Google.
- Idiomas: no se declara una lista oficial de idiomas soportados; las únicas evidencias son las mediciones en inglés y coreano.
- Ollama y LM Studio no fueron probados por el autor; solo llama.cpp está validado.
- El repositorio ocupa 94,2 GB en total por contener las tres cuantizaciones; descargar solo el archivo necesario.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/axteam/gemma-4-26B-A4B-GGUF
- Modelo base: https://huggingface.co/google/gemma-4-26B-A4B
- Licencia Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
- Archivo BF16: https://huggingface.co/axteam/gemma-4-26B-A4B-GGUF/blob/main/gemma-4-26B-A4B-GGUF-BF16.gguf
- Archivo Q4_K_M: https://huggingface.co/axteam/gemma-4-26B-A4B-GGUF/blob/main/gemma-4-26B-A4B-GGUF-Q4_K_M.gguf
- Archivo Q8_0: https://huggingface.co/axteam/gemma-4-26B-A4B-GGUF/blob/main/gemma-4-26B-A4B-GGUF-Q8_0.gguf
