# axteam/Qwen3.5-27B-AWQ-8bit

## Resumen

Qwen3.5-27B-AWQ-8bit es una cuantización de 8 bits del modelo multimodal Qwen/Qwen3.5-27B, publicada por el usuario axteam. Se trata de una conversión post-entrenamiento (PTQ) mediante AWQ en esquema W8A16 (pesos INT8 simétricos con grupo de 32, activaciones en BF16), empaquetada en formato `compressed-tensors` `pack-quantized` y pensada específicamente para servir el modelo con vLLM. El modelo base es un transformer híbrido (atención lineal combinada con atención completa), denso, con torre de visión y una cabeza de predicción multi-token (MTP), con 27.781.427.952 parámetros totales.

El objetivo de esta publicación no es mejorar el modelo original, sino reducir su huella en memoria y facilitar su despliegue en producción sin degradar de forma apreciable la calidad. Según las mediciones del autor, la cuantización conserva una perplejidad prácticamente idéntica a la del original en BF16 (1,3606 frente a 1,3603) y una tasa de coincidencia del 99,0% en el siguiente token predicho. La licencia es Apache-2.0, heredada del modelo base.

Es relevante ahora porque permite ejecutar un modelo multimodal de casi 28.000 millones de parámetros en aproximadamente 32,7 GB en disco, con soporte nativo en vLLM, lo que lo hace viable en GPUs de 48 GB o en configuraciones multi-GPU más modestas que las que exigiría el original en BF16. La información disponible no detalla idiomas soportados ni la longitud de contexto, por lo que esos datos se indican como no disponibles.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer híbrido (atención lineal + atención completa), denso, multimodal (visión), con cabeza MTP |
| Parámetros totales | 27.781.427.952 |
| Parámetros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | AWQ INT8 W8A16 (pesos INT8 simétricos, grupo de 32, activaciones BF16); el repositorio incluye únicamente esta variante |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | `compressed-tensors` `pack-quantized` (safetensors), para vLLM |

## Arquitectura y entrenamiento

El modelo base Qwen3.5-27B emplea una arquitectura híbrida que combina capas de atención lineal con capas de atención completa, lo que reduce el coste computacional en secuencias largas manteniendo la capacidad de atención global. Es un modelo denso (no MoE) que incorpora una torre de visión y un proyector para entrada de imagen y texto, además de una cabeza de predicción multi-token (MTP) que puede aprovecharse para decodificación especulativa. Los parámetros totales ascienden a 27.781.427.952.

Esta publicación concreta no entrena el modelo: aplica cuantización post-entrenamiento con AWQ, que utiliza un conjunto de calibración de 256 muestras (corpus mixto con predominio de coreano) y sin gradientes para proteger los canales de pesos más sensibles antes del redondeo. Se mantienen en BF16 la torre de visión y el proyector (`model.visual.*`), la cabeza MTP (`mtp.*`), todas las RMSNorm, los embeddings de tokens, la LM head y las partes no lineales del bloque SSM (`linear_attn.conv1d`, `A_log`, `dt_bias`), lo que supone aproximadamente el 12% de los parámetros sin cuantizar. Una revisión del 1 de noviembre de 2026 restauró de forma bit-exacta los pesos de RMSNorm no suavizados desde el original, eliminando el ruido de redondeo BF16 (hasta un 0,4% en la ganancia efectiva) que había introducido el manejo de offset-norm de llm-compressor.

## Capacidades

- Generación de texto conversacional multi-turno.
- Razonamiento y respuesta a preguntas de conocimiento general (evaluado en MMLU, ARC-Challenge y Winogrande).
- Comprensión de imágenes y texto combinados (pipeline `image-text-to-text`), gracias a la torre de visión conservada en BF16.
- Razonamiento matemático básico (evaluado en GSM8K, con resultados dependientes del formato de respuesta).
- Capacidades multilingües, con rendimiento medido en coreano (KMMLU, HAE-RAE) además de inglés.
- Cabeza de predicción multi-token (MTP), aprovechable para decodificación especulativa en vLLM.
- No se dispone de información sobre soporte de tool calling, function calling o flujos de agentes multi-paso en la documentación proporcionada.

## Casos de uso

- Servicio de chat multimodal en producción: el modelo acepta imagen y texto y puede desplegarse con vLLM en un único servidor con GPU de 48 GB, gestionando conversaciones multi-turno con el `chat_template` original intacto.
- Asistencia sobre documentos escaneados: al conservar la torre de visión en BF16, puede extraer y razonar sobre contenido de imágenes sin la pérdida de precisión que supondría cuantizarla.
- Despliegue con requisitos de memoria ajustados: los ~32,7 GB en disco y el esquema W8A16 permiten servir un modelo de 27.800 millones de parámetros donde el BF16 original no cabría en una sola GPU de 48 GB.
- Evaluación comparativa de técnicas de cuantización: el repositorio publica resultados medidos con lm-evaluation-harness frente a FP8-dynamic, NVFP4A16, NVFP4 y AWQ-4bit, lo que lo convierte en una referencia útil para decidir el esquema de cuantización en pipelines propios.
- Aplicaciones en coreano e inglés: los benchmarks KMMLU (69,84) y HAE-RAE (77,64) indican un rendimiento sólido en coreano, adecuado para asistentes o clasificación de texto en ese idioma.
- Decodificación especulativa: la cabeza MTP incluida en BF16 permite integrar el modelo en configuraciones de speculative decoding dentro de vLLM para reducir la latencia por token.
- Prototipado e investigación: al ser Apache-2.0 y estar integrado en vLLM, sirve como base para experimentos de cuantización y ajuste fino sobre un modelo multimodal de tamaño medio-grande.

## Benchmarks y rendimiento

Resultados medidos por el autor con lm-evaluation-harness sobre vLLM, decodificación greedy, prompts de estilo completion sin plantilla de chat. MMLU corresponde a la variante generativa (`mmlu_generative`), no directamente comparable con puntuaciones obtenidas por log-likelihood. Los porcentajes entre paréntesis indican la recuperación respecto al original en BF16.

| Benchmark | BF16 (original) | FP8-dynamic | AWQ-8bit (este repo) | NVFP4A16 | NVFP4 | AWQ-4bit |
|---|---|---|---|---|---|---|
| MMLU (5-shot, generativo) | 86,02 | 86,01 (100,0%) | 86,05 (100,0%) | 86,07 (100,1%) | 86,01 (100,0%) | 86,08 (100,1%) |
| GSM8K (5-shot, estricto) | 37,00 | 38,06 (102,9%) | 34,80 (94,1%) | 81,43 (220,1%) | 71,27 (192,6%) | 82,87 (224,0%) |
| ARC-Challenge (0-shot) | 61,18 | 61,69 (100,8%) | 61,60 (100,7%) | 60,84 (99,4%) | 60,58 (99,0%) | 60,84 (99,4%) |
| Winogrande (5-shot) | 80,43 | 80,03 (99,5%) | 80,58 (100,2%) | 79,64 (99,0%) | 79,48 (98,8%) | 80,11 (99,6%) |
| KMMLU (5-shot, directo) | 69,79 | 69,83 (100,1%) | 69,84 (100,1%) | 69,61 (99,7%) | 69,19 (99,1%) | 68,98 (98,8%) |
| HAE-RAE (0-shot) | 76,99 | 77,36 (100,5%) | 77,64 (100,8%) | 75,89 (98,6%) | 75,71 (98,3%) | 76,44 (99,3%) |
| Media | 68,57 | 68,83 (100,4%) | 68,42 (99,8%) | 75,58 (110,2%) | 73,71 (107,5%) | 75,89 (110,7%) |
| Media sin GSM8K | 74,88 | 74,98 (100,1%) | 75,14 (100,4%) | 74,41 (99,4%) | 74,19 (99,1%) | 74,49 (99,5%) |

Fidelidad respecto al original en BF16 sobre un conjunto interno mixto inglés/coreano de 100 prompts:

| Métrica | Este modelo | BF16 original |
|---|---|---|
| Perplejidad (menor = más cercano) | 1,3606 | 1,3603 (+0,0%) |
| Coincidencia top-1 en el siguiente token | 99,0% | 99,3% |

El autor advierte que GSM8K se puntúa sobre texto generado y depende del formato de respuesta: las construcciones BF16, FP8-dynamic y AWQ-8bit obtienen 34,8–38,1, mientras que NVFP4A16, NVFP4 y AWQ-4bit alcanzan 71,3–82,9, con el mismo patrón en la puntuación flexible (39,7–42,4 frente a 74,0–84,7). La causa no se investigó.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio ocupa ~32,7 GB en disco; el runtime de vLLM añade overhead de caché KV y activaciones, por lo que se recomienda un mínimo de 48 GB de VRAM.
- GPUs recomendadas: A100 80 GB, H100 80 GB o L40S 48 GB para una sola GPU; configuraciones multi-GPU para tarjetas de menor capacidad.
- Compatibilidad con GPU de consumo: no disponible con precisión; una RTX 4090 (24 GB) no puede alojar los pesos completos sin una estrategia adicional de offloading o paralelismo.
- Opciones de despliegue: vLLM es el runtime previsto y probado (vLLM 0.32.0; la arquitectura requiere vLLM ≥ 0.17.0). El formato `compressed-tensors` `pack-quantized` no es directamente compatible con llama.cpp u Ollama.
- Dependencias del runtime: Python 3.11–3.14, torch 2.13 (build CUDA 13.0, requiere driver NVIDIA con soporte CUDA 13), transformers ≥5.16.1,<5.20 y compressed-tensors 0.17.0 (fijado por vLLM; no actualizar por separado).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato / cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| axteam/Qwen3.5-27B-AWQ-8bit | 27,78 B (denso) | No disponible | compressed-tensors AWQ INT8 W8A16 | Apache-2.0 | Hugging Face, vLLM |
| Qwen/Qwen3.5-27B (BF16) | 27,78 B (denso) | No disponible | safetensors BF16 | Apache-2.0 | Hugging Face |
| Variantes FP8-dynamic del mismo modelo | 27,78 B (denso) | No disponible | FP8 | Apache-2.0 | No disponible como repositorio concreto |
| Variantes NVFP4A16 / NVFP4 | 27,78 B (denso) | No disponible | FP4 | Apache-2.0 | No disponible como repositorio concreto |

Las variantes FP8-dynamic, NVFP4A16, NVFP4 y AWQ-4bit aparecen únicamente como columnas de comparación en los benchmarks del autor; no se dispone de sus repositorios ni de sus especificaciones completas. No se dispone de datos de contexto ni de comparación con modelos de otros fabricantes.

## Limitaciones y advertencias

- Alucinación: no se han publicado evaluaciones específicas de tasa de alucinación; el modelo base puede generar contenido plausible pero incorrecto, especialmente en tareas de conocimiento factual.
- GSM8K: la puntuación de esta variante (34,80) es inferior a la del original en BF16 (37,00) y muy inferior a la de otras cuantizaciones del mismo modelo; el autor no investigó la causa, por lo que no debe asumirse un rendimiento fiable en aritmética de varios pasos sin validación propia.
- Idiomas: la model card no declara la lista de idiomas soportados; los benchmarks solo cubren inglés y coreano, y la calibración AWQ tuvo predominio de coreano, lo que puede sesgar la preservación de canales hacia ese idioma.
- Contexto: no se especifica la longitud máxima de contexto en la información disponible, lo que impide planificar despliegues con secuencias largas sin consultar la model card del modelo base.
- Licencia: Apache-2.0 permite uso comercial, pero conviene revisar la licencia del modelo base enlazada por el autor para confirmar condiciones adicionales.
- Runtime: la arquitectura exige vLLM ≥ 0.17.0 y el checkpoint se guardó con compressed-tensors 0.19.0 mientras que vLLM 0.32.0 fija la 0.17.0; actualizar esa dependencia por separado puede romper la carga.
- Formato: al ser `pack-quantized` para vLLM, no es portable a otros motores de inferencia sin reconversión.
- Madurez: el repositorio tiene 254 descargas y 1 like en el momento de la consulta, y la revisión de pesos es del 2 de noviembre de 2026; se trata de una publicación reciente con validación externa limitada.
- Sesgos: no se han publicado análisis de sesgo en la información disponible.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/axteam/Qwen3.5-27B-AWQ-8bit
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-27B
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.5-27B/blob/main/LICENSE
- lm-evaluation-harness: https://github.com/EleutherAI/lm-evaluation-harness
- vLLM: https://github.com/vllm-project/vllm
- compressed-tensors: https://github.com/neuralmagic/compressed-tensors
