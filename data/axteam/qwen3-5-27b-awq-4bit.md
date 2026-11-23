# axteam/Qwen3.5-27B-AWQ-4bit

## Resumen

Qwen3.5-27B-AWQ-4bit es una cuantización de 4 bits del modelo multimodal Qwen/Qwen3.5-27B, publicada por el usuario axteam. Se trata de una conversión post-entrenamiento (PTQ) mediante AWQ en esquema W4A16, pensada específicamente para servir el modelo con vLLM de forma eficiente en memoria. El resultado ocupa unos 20,9 GB en disco frente a los 38,5 GB del repositorio, lo que permite desplegar un modelo de 27.781 millones de parámetros en GPUs de gama alta para consumo o en nodos con menos VRAM que los requeridos por el original en BF16.

El modelo base es denso, multimodal (procesa imagen y texto) y emplea una arquitectura híbrida que combina atención lineal con atención completa, además de una cabeza de predicción multi-token (MTP). La cuantización mantiene en BF16 el torreón de visión, el proyector, la cabeza MTP, las RMSNorm, los embeddings, el LM head y las partes no lineales del bloque SSM, lo que supone aproximadamente el 12 % de los parámetros sin cuantizar.

La relevancia de esta ficha radica en que documenta una build concreta con benchmarks medidos por el propio autor bajo un harness homogéneo (lm-evaluation-harness sobre vLLM), con comparación directa frente a otras cuantizaciones del mismo modelo (FP8-dynamic, AWQ-8bit, NVFP4A16 y NVFP4). La licencia Apache-2.0 heredada del original facilita el uso comercial, aunque conviene revisar las limitaciones de fidelidad descritas más abajo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido (atención lineal + atención completa), denso, multimodal (visión) con cabeza MTP |
| Parametros totales | 27.781.427.952 (27,78 B) |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la información proporcionada |
| Tipos de cuantizacion | AWQ INT4 W4A16 (pesos INT4 asimétricos, grupo de tamaño 32, escala BF16 + punto cero INT4, activaciones BF16); formato compressed-tensors `pack-quantized` |
| Idiomas soportados | no disponible (la calibración usó un corpus mixto con predominio de coreano) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (compressed-tensors, `pack-quantized`); compatible con transformers y vLLM |

## Arquitectura y entrenamiento

El modelo base Qwen3.5-27B emplea una arquitectura híbrida que intercala capas de atención lineal con capas de atención completa, un patrón habitual en modelos recientes para reducir el coste computacional del contexto largo manteniendo capacidad de modelado. Es un modelo denso de 27,78 mil millones de parámetros, multimodal (entrada de imagen y texto, pipeline `image-text-to-text`) e incluye una cabeza de predicción multi-token (MTP), probablemente orientada a decodificación especulativa o entrenamiento auxiliar. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron fases de RLHF o DPO en el modelo original.

Esta build concreta es una cuantización post-entrenamiento: no hay reentrenamiento ni ajuste fino. AWQ utiliza un conjunto de calibración de 256 muestras (corpus mixto con predominio de coreano) sin gradientes para proteger los canales de pesos más relevantes antes del redondeo. Se mantienen en BF16 el torreón visual y el proyector (`model.visual.*`), la cabeza MTP (`mtp.*`), todas las RMSNorm, los embeddings de tokens, el LM head y las partes no lineales del bloque SSM (`linear_attn.conv1d`, `A_log`, `dt_bias`); `linear_attn.A_log` y la norm con compuerta se almacenan en BF16 aunque en el original estuvieran en FP32. En la revisión del 1 de noviembre de 2026 se restauraron de forma bit-exacta los pesos RMSNorm no suavizados desde el original, corrigiendo el ruido de redondeo BF16 (hasta un 0,4 % en la ganancia efectiva) que había introducido el manejo de offset-norm de llm-compressor; los pesos cuantizados y las norms suavizadas por AWQ no cambiaron.

## Capacidades

- Generación de texto y razonamiento conversacional multi-turno, con plantilla de chat idéntica a la del modelo original.
- Procesamiento multimodal de imagen y texto (pipeline `image-text-to-text`), con el torreón visual y el proyector conservados en BF16 para preservar calidad.
- Razonamiento matemático y de sentido común evaluado en benchmarks como GSM8K, ARC-Challenge y Winogrande.
- Conocimiento multilingüe y específico de coreano, medido con KMMLU y HAE-RAE.
- Cabeza de predicción multi-token (MTP) conservada en BF16, potencialmente utilizable para decodificación especulativa.
- Compatibilidad con vLLM para servir en producción, incluyendo el formato compressed-tensors.
- Soporte de tool calling y function calling: no disponible en la información proporcionada.
- Soporte explícito de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Modo thinking, audio u otras capacidades especiales: no disponible en la información proporcionada.

## Casos de uso

- Servicio de chat multimodal en producción con vLLM: el modelo acepta imagen y texto y puede desplegarse con el motor vLLM ≥ 0.17.0 (probado con 0.32.0), aprovechando el formato compressed-tensors para reducir la huella de memoria frente al BF16 original.
- Asistencia sobre documentos escaneados o capturas: al conservar el torreón visual en BF16, la cuantización no degrada la ruta de visión, lo que permite tareas de descripción de imágenes, extracción de información visual y respuesta a preguntas sobre figuras.
- Despliegue en GPUs de gama alta para consumo: con ~20,9 GB en disco, la build puede caber en GPUs con 24 GB de VRAM (por ejemplo, RTX 4090) si el runtime y el contexto lo permiten, algo inviable con el original en BF16 de 38,5 GB.
- Evaluación comparativa de cuantizaciones: los benchmarks medidos con lm-evaluation-harness permiten usar esta build como referencia de AWQ-4bit frente a FP8-dynamic, AWQ-8bit y NVFP4 en el mismo harness.
- Razonamiento matemático y de sentido común en pipelines de evaluación: los resultados medidos en GSM8K, ARC-Challenge y Winogrande permiten integrar el modelo en suites de evaluación reproducibles con prompts de tipo completion.
- Aplicaciones en coreano: la calibración con corpus predominantemente coreano y las métricas KMMLU y HAE-RAE sugieren un uso razonable en tareas de comprensión y conocimiento en ese idioma, aunque no hay datos de otros idiomas.
- Investigación sobre fidelidad de cuantización: la model card publica perplejidad y acuerdo top-1 frente al BF16, lo que permite estudiar el impacto de AWQ-4bit en la distribución de salida.

## Benchmarks y rendimiento

Resultados medidos por el autor con lm-evaluation-harness sobre vLLM, greedy, prompts de tipo completion sin plantilla de chat. MMLU es la variante generativa (`mmlu_generative`), no comparable con MMLU por log-likelihood. Los porcentajes indican recuperación respecto al BF16 original.

| Benchmark | BF16 (original) | FP8-dynamic | AWQ-8bit | NVFP4A16 | NVFP4 | AWQ-4bit (esta build) |
|---|---|---|---|---|---|---|
| MMLU (5-shot, generativa) | 86,02 | 86,01 (100,0 %) | 86,05 (100,0 %) | 86,07 (100,1 %) | 86,01 (100,0 %) | 86,08 (100,1 %) |
| GSM8K (5-shot, strict) | 37,00 | 38,06 (102,9 %) | 34,80 (94,1 %) | 81,43 (220,1 %) | 71,27 (192,6 %) | 82,87 (224,0 %) |
| ARC-Challenge (0-shot) | 61,18 | 61,69 (100,8 %) | 61,60 (100,7 %) | 60,84 (99,4 %) | 60,58 (99,0 %) | 60,84 (99,4 %) |
| Winogrande (5-shot) | 80,43 | 80,03 (99,5 %) | 80,58 (100,2 %) | 79,64 (99,0 %) | 79,48 (98,8 %) | 80,11 (99,6 %) |
| KMMLU (5-shot, direct) | 69,79 | 69,83 (100,1 %) | 69,84 (100,1 %) | 69,61 (99,7 %) | 69,19 (99,1 %) | 68,98 (98,8 %) |
| HAE-RAE (0-shot) | 76,99 | 77,36 (100,5 %) | 77,64 (100,8 %) | 75,89 (98,6 %) | 75,71 (98,3 %) | 76,44 (99,3 %) |
| Media | 68,57 | 68,83 (100,4 %) | 68,42 (99,8 %) | 75,58 (110,2 %) | 73,71 (107,5 %) | 75,89 (110,7 %) |
| Media sin GSM8K | 74,88 | 74,98 (100,1 %) | 75,14 (100,4 %) | 74,41 (99,4 %) | 74,19 (99,1 %) | 74,49 (99,5 %) |

El autor advierte de que GSM8K se puntúa sobre texto generado y depende del formato exacto; las builds se dividen en dos grupos (BF16, FP8-dynamic y AWQ-8bit en 34,8–38,1; NVFP4A16, NVFP4 y AWQ-4bit en 71,3–82,9), y la puntuación flexible del mismo run muestra la misma división (39,7–42,4 frente a 74,0–84,7), por lo que la causa no se investigó. La media sin GSM8K aísla ese efecto.

Fidelidad al BF16 original en un conjunto interno mixto inglés/coreano de 100 prompts:

| Métrica | Esta build | BF16 original |
|---|---|---|
| Perplejidad (menor = más cercano) | 1,3886 | 1,3603 (+2,1 %) |
| Acuerdo top-1 del siguiente token | 94,5 % | 99,3 % |

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo ocupa ~20,9 GB en disco en INT4 W4A16; con activaciones BF16 y caché KV el consumo en vLLM supera esa cifra, por lo que se recomienda planificar al menos 24 GB de VRAM para contextos moderados (estimación, no dato medido en la información disponible).
- GPU recomendadas: no hay lista oficial en la información proporcionada; por tamaño, encajan GPUs de 24 GB o más (RTX 4090, L40S, A100 40/80 GB, H100). Para despliegues multi-usuario conviene A100/H100.
- Cabe en GPU de consumo: sí, previsiblemente en RTX 4090 (24 GB) con contexto limitado; no se confirma en GPUs de 16 GB.
- Opciones de despliegue: vLLM (runtime recomendado y probado, versión 0.32.0; la arquitectura requiere vLLM ≥ 0.17.0). El formato compressed-tensors `pack-quantized` está orientado a vLLM; no se documenta soporte de llama.cpp, Ollama ni TGI para esta build.
- Dependencias del runtime: Python 3.11–3.14, torch 2.13 (build CUDA 13.0, driver NVIDIA con soporte CUDA 13), transformers ≥5.16.1,<5.20 y compressed-tensors 0.17.0 (fijados por vLLM; 0.17.0 lee este checkpoint guardado con 0.19).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

Comparación con otras cuantizaciones del mismo modelo base, según los datos medidos por el autor:

| Build | Método | Tamaño en disco | Media (sin GSM8K) | Perplejidad vs BF16 | Licencia |
|---|---|---|---|---|---|
| AWQ-4bit (esta) | AWQ INT4 W4A16 | ~20,9 GB | 74,49 (99,5 %) | +2,1 % | Apache-2.0 |
| AWQ-8bit | AWQ INT8 | no disponible | 75,14 (100,4 %) | no disponible | Apache-2.0 |
| FP8-dynamic | FP8 dinámico | no disponible | 74,98 (100,1 %) | no disponible | Apache-2.0 |
| NVFP4A16 | NVFP4 | no disponible | 74,41 (99,4 %) | no disponible | Apache-2.0 |
| NVFP4 | NVFP4 | no disponible | 74,19 (99,1 %) | no disponible | Apache-2.0 |
| BF16 (original) | sin cuantizar | 38,5 GB (repo) | 74,88 | referencia | Apache-2.0 |

Comparación con otros modelos de tamaño similar: no disponible en la información proporcionada.

## Limitaciones y advertencias

- La cuantización introduce pérdida de fidelidad: perplejidad +2,1 % y acuerdo top-1 del 94,5 % frente al 99,3 % del BF16, medido en un conjunto interno de 100 prompts; no es un modelo equivalente al original.
- El conjunto de calibración es de 256 muestras con predominio de coreano, lo que puede sesgar la preservación de canales hacia ese idioma y no está validado en castellano.
- La anomalía en GSM8K (esta build puntúa 224 % del BF16 en strict-match) no está explicada; el autor no guardó las salidas por pregunta. No debe interpretarse como una mejora real de capacidad matemática.
- Riesgo de alucinación: no cuantificado en la información disponible; es un riesgo inherente a los modelos generativos de este tamaño.
- Idiomas soportados: no declarados; la model card no lista idiomas y la evaluación se limita a inglés y coreano.
- Longitud de contexto: no disponible; conviene verificar el `config.json` del modelo base antes de planificar contextos largos.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero debe conservarse el aviso de licencia y verificarse la licencia del modelo base enlazada en la model card.
- Dependencia estricta de versiones: vLLM 0.32.0, torch 2.13 con CUDA 13.0, transformers ≥5.16.1,<5.20 y compressed-tensors 0.17.0; versiones distintas pueden no cargar el checkpoint.
- El formato compressed-tensors `pack-quantized` limita las opciones de despliegue a vLLM; no se documenta compatibilidad con llama.cpp, Ollama o TGI.
- La build tiene 526 descargas y 1 like en el momento de la consulta; es una conversión de terceros (axteam), no oficial de Qwen, lo que reduce la garantía de mantenimiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/axteam/Qwen3.5-27B-AWQ-4bit
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-27B
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.5-27B/blob/main/LICENSE
- lm-evaluation-harness: https://github.com/EleutherAI/lm-evaluation-harness
- Repositorio de vLLM: https://github.com/vllm-project/vllm
- Repositorio de compressed-tensors: https://github.com/neuralmagic/compressed-tensors
- Paper de AWQ: no disponible en la información proporcionada
- Blog o demo oficial: no disponible en la información proporcionada
