# ITLL/Qwen3.5-9B-DeepSeekV4-GLM5.1-SLERP

## Resumen

ITLL/Qwen3.5-9B-DeepSeekV4-GLM5.1-SLERP es un modelo de lenguaje de 9.409.813.744 parámetros (aproximadamente 9,4 mil millones) creado por el usuario ITLL mediante la fusión de dos modelos derivados de la familia Qwen3.5. No se trata de un entrenamiento desde cero, sino de un merge de pesos con la técnica SLERP (spherical linear interpolation) aplicada con un factor `t: 0.5`, es decir, una interpolación equilibrada entre ambos progenitores.

El modelo combina, por un lado, `xtools-at/DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic`, una variante "abliterated" o "uncensored" orientada a eliminar restricciones de rechazo, y por otro `Jackrong/Qwen3.5-9B-GLM5.1-Distill-v1`, un destilado de razonamiento de GLM-5.1 sobre la base Qwen3.5-9B. El resultado pretende aunar el estilo de razonamiento destilado (chain-of-thought largo, matemáticas, STEM, código y tool calling) con la reducción de filtros de seguridad del primer componente.

Es relevante ahora como experimento de la comunidad: muestra el patrón habitual de merges SLERP sobre modelos destilados de razonamiento, con licencia Apache 2.0, pesos en safetensors y compatibilidad con el ecosistema transformers y text-generation-inference. No obstante, la información publicada es muy escasa: no hay benchmarks, no hay detalles de entrenamiento propios (al ser un merge) y el modelo declara únicamente el idioma inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only de la familia Qwen3.5 (según tag `qwen3_5`); detalles internos no disponibles |
| Parametros totales | 9.409.813.744 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible en la model card (el repo contiene pesos en bfloat16; el tag `quantized` aparece en los tags pero sin detalle) |
| Idiomas soportados | en (inglés), según el campo `language` |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

El modelo es un merge, no un entrenamiento. Se ha generado con mergekit usando el método SLERP, tomando como `base_model` a `xtools-at/DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic` e interpolando con `Jackrong/Qwen3.5-9B-GLM5.1-Distill-v1` con parámetro `t: 0.5`, en `bfloat16` tanto de entrada como de salida. SLERP interpola esféricamente los tensores de pesos de ambos modelos, preservando mejor la norma de los vectores que una media lineal simple.

Los componentes originales aportan el contexto de entrenamiento: el primero es una variante "heretic/uncensored/abliterated" de un modelo Qwen3.5-9B destilado de DeepSeek-V4-Pro; el segundo es un destilado de razonamiento de GLM-5.1 sobre Qwen3.5-9B, con datasets asociados en los tags (`Jackrong/DeepSeek-V4-Distill-8000x`, `Jackrong/Qwen3.5-reasoning-700x`, `Jackrong/GLM-5.1-Reasoning-1M-Cleaned`, `Kassadin88/GLM-5.1-1000000x`). Los tags mencionan SFT, RL, GSPO, MTP, LoRA y Unsloth, pero corresponden a los linajes de los modelos fusionados, no a un entrenamiento propio de este merge. No se dispone de número de tokens, composición del dataset ni detalles de RLHF/DPO específicos de este modelo.

## Capacidades

- Generación de texto conversacional e instruction-tuned, según los tags del modelo.
- Razonamiento con chain-of-thought largo (`long-cot`, `reasoning`), heredado del linaje de destilación de GLM-5.1 y DeepSeek-V4.
- Matemáticas y STEM (`math`, `stem`).
- Generación de código (`coding`).
- Tool calling y function calling (`tool-use`, `function-calling`).
- Capacidades multimodales de entrada declaradas por el pipeline `image-text-to-text` y la tag `image-text-to-text`; no hay detalle sobre el encoder visual ni resolución soportada.
- Multilingüe según tag `multilingual`, aunque el campo `language` solo declara inglés.
- Comportamiento "uncensored/decensored/abliterated": menor tendencia a rechazar peticiones, según los tags del linaje.
- Compatible con text-generation-inference y transformers.

## Casos de uso

- Razonamiento matemático asistido: el modelo puede resolver problemas paso a paso en formato chain-of-thought, útil en herramientas de tutoría o verificación de cálculos, gracias a la destilación de razonamiento de GLM-5.1 y DeepSeek-V4.
- Generación de código en pipelines locales: al soportar tool calling y function calling, puede integrarse en asistentes de IDE o scripts de automatización que invocan APIs y ejecutan comandos.
- Agentes multi-paso experimentales: la combinación de razonamiento largo y tool use permite prototipar agentes que planifican y llaman herramientas, siempre con validación humana por la falta de benchmarks.
- Procesamiento de documentos con imagen y texto: el pipeline `image-text-to-text` permite extraer y razonar sobre contenido de capturas o figuras en flujos de investigación, aunque la capacidad multimodal no está documentada en detalle.
- Investigación sobre merges y alineación: sirve como caso de estudio de fusión SLERP entre un modelo destilado de razonamiento y una variante abliterated, para analizar cómo se degrada o preserva el comportamiento de rechazo.
- Experimentación en inferencia local: con ~9,4 mil millones de parámetros en bfloat16 (repo de 18,8 GB), es desplegable en GPUs de consumo de gama alta mediante cuantización, útil para pruebas offline de razonamiento y código.
- Generación de contenido sin filtros en entornos controlados: para investigación sobre seguridad y robustez, evaluando respuestas del modelo ante prompts sensibles.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada en bfloat16: aproximadamente 18,8 GB solo para pesos, más overhead de activaciones y KV cache; en la práctica se recomienda 24 GB o más.
- VRAM estimada en cuantización de 8 bits: en torno a 10-12 GB (estimación por tamaño de parámetros; no confirmada por el autor).
- VRAM estimada en cuantización de 4 bits: en torno a 6-8 GB (estimación; no confirmada por el autor).
- GPU recomendadas: A100 40/80 GB, H100 para despliegue concurrente; RTX 4090 (24 GB) para bfloat16 ajustado o cuantización 8 bits; RTX 3090/4080 para cuantización 4-8 bits.
- Cabe en GPU de consumo: sí, en RTX 4090 con cuantización y en RTX 3090/4080 con cuantización 4 bits, sujeto a verificación empírica.
- Opciones de despliegue: transformers, text-generation-inference (tag `text-generation-inference`), y previsiblemente llama.cpp/Ollama/vLLM tras conversión a GGUF/AWQ, aunque el autor no publica artefactos de cuantización.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| ITLL/Qwen3.5-9B-DeepSeekV4-GLM5.1-SLERP | 9,4 B | no disponible | Apache 2.0 | Merge SLERP de dos derivados Qwen3.5-9B |
| xtools-at/DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic | ~9 B (linaje) | no disponible | no disponible en esta ficha | Componente base; variante uncensored |
| Jackrong/Qwen3.5-9B-GLM5.1-Distill-v1 | ~9 B (linaje) | no disponible | no disponible en esta ficha | Componente; destilado de razonamiento GLM-5.1 |
| Qwen3.5-9B (familia base) | ~9 B | no disponible | no disponible en esta ficha | Modelo de origen de la arquitectura |

## Limitaciones y advertencias

- Al ser un merge SLERP, no hay garantía de que las capacidades de razonamiento y tool calling de los modelos originales se preserven; los merges pueden degradar habilidades de forma no trivial.
- El modelo está etiquetado como `uncensored`, `decensored` y `abliterated`: puede producir contenido dañino, ofensivo o inexacto y no debe desplegarse en producción orientada al público sin filtros adicionales.
- Riesgo elevado de alucinación: no hay benchmarks publicados que validen la fiabilidad factual.
- Contexto máximo no documentado; no se debe asumir una ventana larga sin verificación.
- Idioma declarado únicamente inglés; el soporte multilingüe es solo un tag sin evidencia.
- Licencia Apache 2.0 permite uso comercial, pero las obligaciones de atribución y los posibles términos de los modelos base deben revisarse por separado.
- Modelo experimental con 0 descargas y 1 like en el momento de la consulta; sin validación comunitaria.
- El tag `quantized` no viene acompañado de artefactos cuantizados en el repo; habría que generarlos.
- La referencia `arxiv:2604.06628` no se ha verificado en esta ficha.

## Enlaces

- Hugging Face: https://huggingface.co/ITLL/Qwen3.5-9B-DeepSeekV4-GLM5.1-SLERP
- Modelo base 1: https://huggingface.co/xtools-at/DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic
- Modelo base 2: https://huggingface.co/Jackrong/Qwen3.5-9B-GLM5.1-Distill-v1
- mergekit: https://github.com/cg123/mergekit
- SLERP (Wikipedia): https://en.wikipedia.org/wiki/Slerp
- Dataset: https://huggingface.co/datasets/Jackrong/DeepSeek-V4-Distill-8000x
- Dataset: https://huggingface.co/datasets/Jackrong/Qwen3.5-reasoning-700x
- Dataset: https://huggingface.co/datasets/Jackrong/GLM-5.1-Reasoning-1M-Cleaned
- Dataset: https://huggingface.co/datasets/Kassadin88/GLM-5.1-1000000x
