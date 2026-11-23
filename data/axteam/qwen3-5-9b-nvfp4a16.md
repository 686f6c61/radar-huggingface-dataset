# axteam/Qwen3.5-9B-NVFP4A16

## Resumen

Qwen3.5-9B-NVFP4A16 es una cuantización de 4 bits del modelo multimodal Qwen/Qwen3.5-9B, publicada por axteam y orientada específicamente al despliegue eficiente con vLLM. El modelo base es un transformer híbrido (atención lineal y atención completa) de tipo denso, con torre de visión y cabeza de predicción multi-token (MTP), desarrollado por el equipo Qwen. La cuantización reduce el peso en disco hasta unos 11,7 GB y emplea el esquema W4A16 con pesos en FP4 (E2M1) agrupados en bloques de 16 y activaciones en BF16.

El interés de esta ficha radica en que permite ejecutar un modelo multimodal de 9.409.813.744 parámetros en GPUs con menos memoria que la versión BF16, manteniendo una fidelidad alta respecto al original: la perplejidad solo empeora un 2,9% y la coincidencia top-1 del siguiente token alcanza el 93,2%. Es una opción relevante para servir cargas conversacionales e imagen-texto en producción con vLLM, siempre que se disponga de hardware NVIDIA Turing (sm75) o superior.

La cuantización es de tipo post-training (PTQ), sin reentrenamiento, y combina AWQ para proteger canales salientes antes del redondeo con un conjunto de calibración de 256 muestras. La licencia es Apache-2.0, heredada del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido (atención lineal GatedDeltaNet/SSM + atención completa), denso, multimodal con torre de visión y cabeza MTP |
| Parametros totales | 9.409.813.744 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | NVFP4A16 (W4A16): pesos FP4 E2M1 en grupos de 16 con escala FP8 E4M3 y escala global FP32 por tensor; activaciones BF16; formato compressed-tensors `nvfp4-pack-quantized` |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (compressed-tensors), compatible con transformers y vLLM |

## Arquitectura y entrenamiento

El modelo base Qwen3.5-9B emplea una arquitectura híbrida que combina capas de atención lineal basadas en GatedDeltaNet (SSM) con capas de atención completa, además de una torre de visión para entrada imagen-texto y una cabeza de predicción multi-token (MTP). Esta cuantización mantiene en BF16 la torre de visión y el proyector (`model.visual.*`), la cabeza MTP (`mtp.*`), todas las RMSNorm, los embeddings de tokens, la LM head y toda la ruta de atención lineal (`linear_attn.*`), que representa aproximadamente el 45% de los parámetros de este build. Solo se cuantizan a FP4 los pesos de las capas de atención completa y las proyecciones lineales compatibles, ya que el FP4 resulta demasiado grueso para los pesos del SSM.

El proceso es PTQ sin reentrenamiento: AWQ utiliza un conjunto de calibración de 256 muestras de un corpus mixto con predominio de coreano para identificar canales salientes antes del redondeo. La revisión del 1 de noviembre de 2026 restauró de forma bit-exacta los pesos RMSNorm no suavizados del original, eliminando el ruido de redondeo BF16 (hasta un 0,4% en la ganancia efectiva) que había dejado el manejo de offset-norm de llm-compressor. Los pesos cuantizados y las normas suavizadas por AWQ no cambiaron. No se dispone de información sobre el número de tokens de entrenamiento del modelo base ni sobre si hubo RLHF o DPO.

## Capacidades

- Generación de texto conversacional multi-turno, con plantilla de chat idéntica al modelo original.
- Razonamiento y matemáticas, con resultados medidos en GSM8K (84,38 en 5-shot estricto).
- Comprensión imagen-texto: pipeline `image-text-to-text` con torre de visión y proyector conservados en BF16.
- Predicción multi-token (MTP) mediante la cabeza dedicada, útil para decodificación especulativa en vLLM.
- Soporte multilingüe: los benchmarks incluyen KMMLU y HAE-RAE (coreano), aunque la lista oficial de idiomas no está disponible.
- Compatibilidad con endpoints (`endpoints_compatible`) y con el ecosistema transformers y vLLM.
- No se dispone de información sobre soporte explícito de tool calling, function calling o razonamiento agéntico multi-paso en la documentación proporcionada.

## Casos de uso

- Servicio conversacional multimodal en producción: el modelo acepta imagen y texto y puede desplegarse con vLLM sobre GPUs de 24 GB o más gracias a los ~11,7 GB de pesos, gestionando diálogos multi-turno con la plantilla de chat original.
- Descripción y análisis de imágenes en pipelines de moderación o catalogación: la torre de visión en BF16 preserva la calidad de extracción de características mientras el resto del modelo se beneficia del ahorro de memoria.
- Asistente de atención al cliente con contexto visual: útil para incidencias que incluyen capturas de pantalla o fotos de producto, con la ventaja de un footprint de memoria reducido frente al BF16.
- Generación de código y resolución de problemas matemáticos: los resultados de GSM8K (96,9% de recuperación frente al BF16) lo hacen adecuado para asistentes de razonamiento en entornos con restricciones de VRAM.
- Evaluación e investigación de técnicas de cuantización: el repositorio publica métricas de fidelidad (perplejidad y acuerdo top-1) que permiten comparar esquemas NVFP4, AWQ y FP8 en un modelo híbrido con SSM.
- Despliegue en clústeres con GPUs Turing o Ampere de gama media: al requerir sm75 o superior y caber en ~12 GB de pesos, permite servir el modelo en tarjetas como RTX A5000 o L4 sin recurrir a versiones BF16.
- Prototipado de aplicaciones imagen-texto con vLLM 0.32: la integración nativa de la arquitectura en vLLM ≥ 0.17.0 facilita levantar un endpoint compatible con la API de OpenAI.

## Benchmarks y rendimiento

Resultados medidos con lm-evaluation-harness sobre vLLM, greedy, prompts de tipo completion sin plantilla de chat. Los porcentajes entre paréntesis indican la recuperación respecto al BF16 original.

| Benchmark | BF16 (original) | FP8-dynamic | AWQ-8bit | NVFP4A16 (este repo) | NVFP4 | AWQ-4bit |
|---|---|---|---|---|---|---|
| MMLU (5-shot, generativo) | 33,03 | 46,82 (141,8%) | 32,37 (98,0%) | 32,15 (97,3%) | 35,06 (106,1%) | 33,29 (100,8%) |
| GSM8K (5-shot, estricto) | 87,11 | 86,81 (99,7%) | 86,96 (99,8%) | 84,38 (96,9%) | 84,23 (96,7%) | 86,81 (99,7%) |
| ARC-Challenge (0-shot) | 55,55 | 55,72 (100,3%) | 55,89 (100,6%) | 54,44 (98,0%) | 54,01 (97,2%) | 56,48 (101,7%) |
| Winogrande (5-shot) | 73,72 | 74,19 (100,6%) | 74,51 (101,1%) | 73,01 (99,0%) | 73,16 (99,3%) | 73,40 (99,6%) |
| KMMLU (5-shot, directo) | 58,39 | 58,05 (99,4%) | 58,51 (100,2%) | 58,26 (99,8%) | 57,41 (98,3%) | 56,96 (97,6%) |
| HAE-RAE (0-shot) | 69,48 | 69,11 (99,5%) | 69,39 (99,9%) | 70,21 (101,1%) | 68,47 (98,5%) | 67,09 (96,6%) |
| Media | 62,88 | 65,12 (103,6%) | 62,94 (100,1%) | 62,07 (98,7%) | 62,06 (98,7%) | 62,34 (99,1%) |
| Media sin MMLU | 68,85 | 68,78 (99,9%) | 69,05 (100,3%) | 68,06 (98,9%) | 67,46 (98,0%) | 68,15 (99,0%) |

Métricas de fidelidad frente al BF16 original sobre un conjunto interno mixto inglés/coreano de 100 prompts:

| Métrica | Este modelo | BF16 original |
|---|---|---|
| Perplejidad (menor es mejor) | 1,4920 | 1,4506 (+2,9%) |
| Acuerdo top-1 del siguiente token | 93,2% | 99,2% |

El autor advierte que MMLU se puntúa sobre texto generado (`mmlu_generative`) y solo cuenta una letra de respuesta en la primera línea, por lo que oscila ampliamente entre builds del mismo modelo (32,2–46,8) y probablemente refleja el formato de respuesta más que la calidad de la cuantización.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos ocupan ~11,7 GB en disco; con overhead de activaciones BF16, caché KV y el grafo de vLLM se recomienda un mínimo de 16 GB y, para contextos largos, 24 GB o más.
- GPU recomendadas: NVIDIA Turing (sm75) o superior; para producción, A100, H100 o L40S. En consumer, una RTX 4090 (24 GB) o RTX 3090 (24 GB) es suficiente para los pesos y margen de contexto moderado.
- Cabe en GPUs consumer de 24 GB; en tarjetas de 16 GB el margen para contexto y batch es limitado.
- Despliegue: vLLM es el runtime objetivo (arquitectura integrada desde vLLM ≥ 0.17.0 y probada con vLLM 0.32.0). Requiere Python 3.11–3.14, torch 2.13 con build CUDA 13.0, transformers ≥5.16.1,<5.20 y compressed-tensors 0.17.0 (fijado por vLLM; no actualizar por separado). No se indica soporte para llama.cpp u Ollama.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato / cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| axteam/Qwen3.5-9B-NVFP4A16 | 9,41 B | no disponible | FP4 W4A16 (compressed-tensors), ~11,7 GB | Apache-2.0 | Hugging Face, vLLM |
| Qwen/Qwen3.5-9B (BF16) | 9,41 B | no disponible | BF16, ~18,8 GB | Apache-2.0 | Hugging Face, transformers/vLLM |
| Build FP8-dynamic del mismo base | 9,41 B | no disponible | FP8, tamaño no disponible | Apache-2.0 | Referenciado en la model card |
| Build AWQ-4bit del mismo base | 9,41 B | no disponible | AWQ 4 bits | Apache-2.0 | Referenciado en la model card |

No se dispone de información sobre modelos de otros autores comparables en la documentación proporcionada.

## Limitaciones y advertencias

- La cuantización introduce una pérdida medible: perplejidad +2,9% y acuerdo top-1 del 93,2% frente al 99,2% del BF16, con una media de benchmarks del 98,7% respecto al original.
- MMLU generativo muestra una variabilidad alta entre builds (32,2–46,8) que el autor atribuye al formato de respuesta; no debe usarse como única señal de calidad.
- El conjunto de calibración es de 256 muestras con predominio de coreano, lo que puede sesgar la preservación de canales hacia ese idioma.
- La ruta de atención lineal (SSM) se mantiene en BF16 por ser FP4 demasiado grueso; no debe cuantizarse a FP4 sin validación adicional.
- Riesgo de alucinación inherente al modelo base; no se han publicado evaluaciones específicas de sesgo en esta cuantización.
- La lista de idiomas soportados no está disponible; los benchmarks solo cubren inglés y coreano.
- Requiere vLLM 0.32.0 con versiones fijadas de transformers y compressed-tensors; actualizar compressed-tensors por separado puede romper la carga del checkpoint.
- Requiere driver NVIDIA con soporte CUDA 13 y GPU sm75 o superior; no hay soporte documentado para CPU, llama.cpp u Ollama.
- Licencia Apache-2.0, que permite uso comercial, pero conviene revisar la licencia del modelo base por si añade restricciones adicionales.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/axteam/Qwen3.5-9B-NVFP4A16
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.5-9B/blob/main/LICENSE
- lm-evaluation-harness: https://github.com/EleutherAI/lm-evaluation-harness
- No se han encontrado otros enlaces (papers, blogs, repos o demos) en la información proporcionada.
