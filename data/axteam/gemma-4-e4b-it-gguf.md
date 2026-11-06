# axteam/gemma-4-E4B-it-GGUF

## Resumen

`axteam/gemma-4-E4B-it-GGUF` es una colección de pesos cuantizados en formato GGUF del modelo `google/gemma-4-E4B-it`, publicada por el usuario axteam. El modelo base es un transformer denso multimodal de Google DeepMind (familia Gemma 4) con 7.518.069.290 parámetros totales según los safetensors del repositorio original. Esta build está pensada exclusivamente para inferencia local con llama.cpp, Ollama y LM Studio, e incluye tres ficheros: BF16 (referencia sin cuantizar), Q4_K_M (equilibrio tamaño/calidad) y Q8_0 (máxima fidelidad respecto a BF16).

La relevancia de esta ficha es práctica: permite ejecutar un modelo de unos 7.500 millones de parámetros en hardware de consumo con la cuantización Q4_K_M de 5,3 GB, manteniendo una fidelidad medida frente al BF16 del 79,3 % en top-1 (inglés) y 81,4 % (coreano) para Q4_K_M, y del 97,0 %/97,2 % para Q8_0. La cuantización es PTQ (post-training quantization) con k-quants de llama.cpp, sin reentrenamiento ni QAT.

Una advertencia importante: aunque el pipeline declarado es `image-text-to-text` y el modelo base es multimodal, este repositorio **no incluye el fichero `mmproj` (proyector de visión)**, por lo que la inferencia es solo de texto. Además, el modelo está publicado bajo licencia Apache-2.0 en el campo de metadatos, pero la model card remite expresamente a la Gemma 4 license de Google, lo que genera una ambigüedad que conviene resolver antes de un uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Gemma 4, transformer denso (el modelo base es multimodal; el GGUF ejecuta solo la parte de lenguaje) |
| Parametros totales | 7.518.069.290 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (los ejemplos de la model card usan `-c 8192`) |
| Tipos de cuantizacion | BF16 (15,1 GB), Q4_K_M (5,3 GB), Q8_0 (8,0 GB); PTQ con k-quants de llama.cpp |
| Idiomas soportados | no disponible (la model card incluye pruebas en ingles y coreano, pero no se declara una lista oficial) |
| Licencia | apache-2.0 en metadatos; la model card remite a la Gemma 4 license de Google |
| Formato de pesos | GGUF (chat template embebido en el fichero) |

## Arquitectura y entrenamiento

El modelo base `google/gemma-4-E4B-it` es un transformer denso de la familia Gemma 4 de Google DeepMind, con 7.518.069.290 parámetros totales y capacidad multimodal en su forma original (pipeline `image-text-to-text`). La model card del repositorio cuantizado describe la arquitectura como "Gemma 4 · Dense" y aclara que los ficheros GGUF ejecutan únicamente el lado del lenguaje, ya que no se ha incluido el proyector de visión (`mmproj`).

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO en el modelo original; la model card de esta build no los detalla. La innovación técnica documentada aquí es el proceso de cuantización: PTQ block-wise con k-quants de llama.cpp (escalas por bloque, asignación mixta de bits y redondeo refinado), sin reentrenamiento. El chat template va embebido en el GGUF. Se recomienda sampling con `temperature=1.0`, `top_p=0.95` y `top_k=64` según indicaciones de Google recogidas en la model card.

## Capacidades

- Generación de texto conversacional e instrucciones (`-it`, instruction-tuned).
- Razonamiento y respuesta a preguntas; la model card verifica respuestas correctas a preguntas cortas (capital de Francia, capital de Corea).
- Capacidad multilingüe parcial evidenciada por pruebas en inglés y coreano; no hay lista oficial de idiomas.
- El modelo base es multimodal (image-text-to-text), pero esta build GGUF **no soporta entrada de imágenes** al carecer de `mmproj`.
- Soporte de tool calling / function calling: no documentado en la información disponible.
- Soporte de agentes y razonamiento multi-paso: no documentado en la información disponible.
- Modo thinking explícito: no documentado en la información disponible.
- Compatibilidad con endpoints: etiqueta `endpoints_compatible` presente en los metadatos de Hugging Face.

## Casos de uso

- **Asistente conversacional local en hardware de consumo**: con el fichero Q4_K_M (5,3 GB) el modelo cabe en GPUs de gama alta para consumidor y permite desplegar un chatbot de instrucciones sin conexión a servicios externos, usando llama.cpp u Ollama.
- **Prototipado rápido con Ollama**: la model card documenta `ollama run hf.co/axteam/gemma-4-E4B-it-GGUF:Q4_K_M`, lo que facilita validar prompts y flujos conversacionales en minutos antes de invertir en infraestructura.
- **Procesamiento de texto en coreano e inglés**: las mediciones de fidelidad de cuantización se han hecho sobre WikiText-2 y una muestra de Wikipedia en coreano, lo que respalda su uso en pipelines de generación de texto en ambos idiomas.
- **Generación de texto por lotes en servidor con llama-server**: el binario `llama-server` con `-c 8192` permite exponer el modelo como API HTTP interna para tareas de resumen, reescritura o clasificación de texto.
- **Evaluación comparativa de cuantizaciones**: los ficheros BF16, Q8_0 y Q4_K_M permiten medir el impacto de la cuantización en una tarea concreta (KLD y acuerdo top-1 frente a BF16) antes de fijar una configuración en producción.
- **Despliegue con restricción de memoria**: la opción `--cache-type-k q8_0 --cache-type-v q8_0 -fa on` reduce a la mitad la memoria de la caché KV, útil en entornos donde el contexto es largo y la VRAM está limitada.
- **Base para re-cuantización o ajuste posterior**: el fichero BF16 sin cuantizar sirve como referencia para generar nuevas cuantizaciones o para servir de punto de partida en experimentos de ajuste fino.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La model card sí incluye mediciones de fidelidad de cuantización frente al fichero BF16, realizadas con llama.cpp b12005 (commit e0f142d, build CUDA) sobre una NVIDIA B200, con 16 ventanas de 2.048 tokens de WikiText-2 y de una muestra de Wikipedia en coreano:

| Fichero | KLD media vs BF16 (EN / KO) | Acuerdo top-1 con BF16 (EN / KO) |
|---|---|---|
| `gemma-4-E4B-it-GGUF-Q4_K_M.gguf` | 0,2869 / 0,2628 | 79,3 % / 81,4 % |
| `gemma-4-E4B-it-GGUF-Q8_0.gguf` | 0,0067 / 0,0059 | 97,0 % / 97,2 % |

La model card advierte que la perplejidad sobre texto crudo no es significativa para este checkpoint instruction-tuned (el propio BF16 obtiene 52 en WikiText-2 sin su chat template), por lo que se compara cada cuantización con el BF16 sobre los mismos tokens. Se forzó el token BOS con `--override-kv tokenizer.ggml.add_bos_token=bool:true` porque los tokenizers GGUF de gemma-4 no lo añaden por defecto.

## Requisitos de hardware

- **VRAM estimada**: aproximadamente el tamaño del fichero GGUF más la caché KV del contexto. Q4_K_M ~5,3 GB, Q8_0 ~8,0 GB, BF16 ~15,1 GB, más KV cache según `-c`.
- **GPU recomendadas**: la model card solo documenta pruebas en NVIDIA B200 con todas las capas en GPU. Para Q4_K_M, GPUs de consumo con 8 GB o más de VRAM son suficientes en la práctica; Q8_0 requiere 10-12 GB; BF16 requiere 16 GB o más.
- **Cabe en GPU de consumo**: sí, al menos Q4_K_M en GPUs de gama alta para consumidor; Q8_0 en modelos con 12 GB o más.
- **Opciones de despliegue**: llama.cpp (build ≥ b8637, necesario para la arquitectura `gemma4`; `-fa on` requiere ≥ b6325), Ollama (`ollama run hf.co/axteam/gemma-4-E4B-it-GGUF:Q4_K_M`) y LM Studio (no probado por el autor).
- **Latencia y throughput**: no disponibles en la información proporcionada.
- **Reducción de memoria**: `--cache-type-k q8_0 --cache-type-v q8_0 -fa on` reduce a la mitad el tamaño de la caché KV en tiempo de ejecución.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones de modelos alternativos en la información proporcionada, por lo que no es posible establecer una comparativa cuantitativa fiable. Como referencia estructural, esta build se posiciona en la categoría de modelos densos de ~7.500 millones de parámetros cuantizados a 4-8 bits para inferencia local con llama.cpp. Cualquier comparación con otros modelos de la misma categoría requeriría datos de rendimiento que no se han publicado aquí.

| Modelo | Parametros | Contexto | Licencia | Formato |
|---|---|---|---|---|
| gemma-4-E4B-it-GGUF (esta ficha) | 7.518.069.290 | no disponible | apache-2.0 / Gemma 4 license | GGUF |
| Alternativas de la misma categoría | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- **Sin visión**: pese a que el pipeline declarado es `image-text-to-text`, este repositorio no incluye `mmproj`; la entrada es solo texto.
- **Ambigüedad de licencia**: los metadatos indican apache-2.0, pero la model card remite a la Gemma 4 license de Google. Conviene verificar los términos aplicables antes de un uso comercial.
- **Pérdida de fidelidad en Q4_K_M**: el acuerdo top-1 con BF16 es del 79,3 % en inglés y 81,4 % en coreano, con KLD de 0,2869/0,2628. Para tareas sensibles a la precisión, Q8_0 (97,0 %/97,2 %) es preferible.
- **Riesgo de alucinación**: no se han publicado evaluaciones de veracidad ni de tasas de alucinación en la información disponible.
- **Idiomas**: no hay lista oficial de idiomas soportados; las únicas evidencias son pruebas en inglés y coreano.
- **Contexto**: la longitud máxima de contexto no se documenta; los ejemplos usan 8.192 tokens, pero no se confirma que sea el límite del modelo.
- **Dependencia de versión de llama.cpp**: la arquitectura `gemma4` exige builds ≥ b8637; versiones anteriores no cargarán el modelo.
- **Ollama y LM Studio**: no probados por el autor de la cuantización.
- **Sesgos**: no se han publicado análisis de sesgos en la información disponible.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/axteam/gemma-4-E4B-it-GGUF
- Modelo base: https://huggingface.co/google/gemma-4-E4B-it
- Licencia Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
