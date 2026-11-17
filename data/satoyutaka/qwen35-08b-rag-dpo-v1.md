# satoyutaka/qwen35-08b-rag-dpo-v1

## Resumen

`satoyutaka/qwen35-08b-rag-dpo-v1` es un ajuste fino (fine-tune) del modelo base Qwen3.5-0.8B-Base, publicado por el usuario satoyutaka en Hugging Face. El nombre del repositorio sugiere un entrenamiento orientado a generación aumentada por recuperación (RAG) combinado con optimización por preferencias directas (DPO), aunque la model card del autor no documenta explícitamente el proceso de entrenamiento ni los datos utilizados para el ajuste. El modelo hereda la arquitectura y capacidades del Qwen3.5-0.8B original.

El modelo base Qwen3.5-0.8B, desarrollado por el equipo Qwen de Alibaba, es un modelo causal multimodal con codificador de visión, diseñado con una arquitectura híbrida que combina Gated Delta Networks (atención lineal) con atención con compuertas (Gated Attention) y una red feed-forward de tipo Mixture-of-Experts dispersa. Con 0,8 mil millones de parámetros y una longitud de contexto nativa de 262.144 tokens, está pensado para prototipado, ajuste fino específico de tareas y fines de investigación o desarrollo.

La relevancia de este ajuste reside en su posible especialización en tareas de RAG y alineación mediante DPO, aunque al no estar documentado el proceso, su utilidad real debe validarse empíricamente. El tamaño reducido (873.438.784 parámetros reales según safetensors) lo hace desplegable en hardware de consumo, lo que facilita experimentación y prototipado rápido.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Causal Language Model con codificador de visión; híbrida Gated DeltaNet + Gated Attention + FFN con MoE dispersa |
| Parametros totales | 873.438.784 (0,8B) |
| Parametros activos | no disponible (el modelo base declara MoE dispersa pero no se especifican parámetros activos) |
| Longitud de contexto | 262.144 tokens (nativo) |
| Tipos de cuantizacion | no disponible (el repo contiene safetensors; no se documentan cuantizaciones publicadas) |
| Idiomas soportados | no disponible en este repo; el modelo base declara 201 idiomas y dialectos |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo base Qwen3.5-0.8B emplea una arquitectura híbrida con un layout de 24 capas organizado en 6 bloques de la forma `3 × (Gated DeltaNet → FFN) → 1 × (Gated Attention → FFN)`. La Gated DeltaNet utiliza 16 cabezas de atención lineal para V y 16 para QK con dimensión de cabeza 128; la Gated Attention emplea 8 cabezas para Q y 2 para KV con dimensión de cabeza 256 y RoPE de dimensión 64. La dimensión oculta es 1024, la dimensión intermedia de la FFN es 3584, y el embedding de tokens (con LM output atado) es de 248.320 entradas. El modelo está entrenado con multi-token prediction (MTP) en varios pasos. Según la model card del modelo base, la arquitectura híbrida combina Gated Delta Networks con una Mixture-of-Experts dispersa para lograr inferencia de alto rendimiento con latencia y coste mínimos.

El modelo base fue entrenado en dos fases (pre-entrenamiento y post-entrenamiento) con fusión temprana de tokens multimodales, alcanzando paridad con Qwen3 y superando a los modelos Qwen3-VL en razonamiento, código, agentes y comprensión visual. El entrenamiento por refuerzo se escaló en entornos de millones de agentes con distribuciones de tareas progresivamente complejas. La infraestructura de entrenamiento reporta cerca del 100% de eficiencia multimodal respecto al entrenamiento solo de texto. Para este ajuste concreto (`qwen35-08b-rag-dpo-v1`), no se dispone de información sobre el dataset, el número de tokens de entrenamiento ni los hiperparámetros de DPO empleados; el autor no documenta estos detalles en la model card.

## Capacidades

- Generación de texto y razonamiento en modo no-thinking (el modelo base reporta resultados en modo Non-Thinking Mode).
- Comprensión y generación multimodal imagen-texto (pipeline `image-text-to-text`), gracias al codificador de visión del modelo base.
- Capacidades de código y agentes heredadas del modelo base Qwen3.5, que declara paridad o mejora frente a Qwen3-VL en razonamiento, código, agentes y comprensión visual.
- Soporte multilingüe amplio según el modelo base (201 idiomas y dialectos), aunque este ajuste no documenta idiomas específicos.
- Posible especialización en RAG y alineación por preferencias (DPO) según el nombre del repositorio, no verificada documentalmente.
- Soporte de tool calling / function calling: no disponible explícitamente en la información proporcionada.
- Modo thinking: no disponible en la información proporcionada para este ajuste.

## Casos de uso

- Prototipado de pipelines RAG: el modelo, por su nombre y tamaño, se presta a experimentar con recuperación aumentada en entornos de desarrollo, validando si el ajuste DPO mejora la fidelidad de las respuestas al contexto recuperado.
- Ajuste fino específico de tareas: al ser un modelo de 0,8B con licencia Apache 2.0, puede servir como base para fine-tuning adicional en dominios concretos con recursos limitados.
- Investigación en alineación: útil para estudiar el efecto de DPO sobre un modelo pequeño y comparar comportamientos antes y después del ajuste.
- Procesamiento de documentos con imágenes: gracias al pipeline image-text-to-text heredado, puede emplearse en tareas de extracción o descripción de contenido visual en documentos.
- Despliegue en entornos con recursos restringidos: su tamaño (873M parámetros, repo de 1,8 GB) permite ejecución en GPU de consumo para demos y pruebas de concepto.
- Evaluación comparativa de modelos pequeños multimodales: sirve como punto de comparación frente a otros modelos de menos de 1B en tareas de razonamiento y visión.

## Benchmarks y rendimiento

Los únicos datos de benchmarks disponibles corresponden al modelo base Qwen3.5-0.8B en modo Non-Thinking, según la model card del modelo base. No se han publicado resultados específicos para este ajuste (`qwen35-08b-rag-dpo-v1`).

| Benchmark | Qwen3-4B-2507 | Qwen3-1.7B | Qwen3.5-2B | Qwen3.5-0.8B |
|---|---|---|---|---|
| MMLU-Pro | 69,6 | 40,2 | 55,3 | 29,7 |
| MMLU-Redux | 84,2 | 64,4 | 69,2 | 48,5 |
| C-Eval | 80,2 | 61,0 | 65,2 | 46,4 |

No se han publicado resultados de benchmarks del ajuste en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: en precisión completa (fp32) aproximadamente 3,5 GB; en fp16/bf16 aproximadamente 1,75 GB; en cuantización de 8 bits aproximadamente 0,9 GB; en 4 bits aproximadamente 0,5 GB (estimaciones a partir de 873M parámetros, sin incluir overhead de activaciones ni del codificador de visión).
- GPU recomendadas: RTX 4090, RTX 3090, A100, H100 para despliegues de producción; cualquier GPU con al menos 4-6 GB de VRAM para inferencia en cuantización.
- Cabe en GPU de consumo: sí, en tarjetas como RTX 3060 (12 GB), RTX 4060 Ti (16 GB), RTX 4090 (24 GB) e incluso en GPUs con 8 GB en cuantización de 4 u 8 bits.
- Opciones de despliegue: compatible con Hugging Face Transformers, vLLM, SGLang y KTransformers según la model card del modelo base; llama.cpp y Ollama no están confirmados para esta arquitectura híbrida.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Multimodal | Disponibilidad |
|---|---|---|---|---|---|
| qwen35-08b-rag-dpo-v1 (este) | 873M | 262.144 | Apache 2.0 | Sí (image-text-to-text) | Hugging Face |
| Qwen3.5-0.8B (base) | 0,8B | 262.144 | Apache 2.0 | Sí | Hugging Face |
| Qwen3-1.7B | 1,7B | no disponible | Apache 2.0 | No especificado | Hugging Face |
| Qwen3.5-2B | 2B | 262.144 | Apache 2.0 | Sí | Hugging Face |

El ajuste comparte arquitectura y licencia con el modelo base; la principal diferencia es el posible entrenamiento adicional con RAG y DPO, no documentado. Frente a Qwen3-1.7B, este modelo ofrece contexto mucho mayor y capacidades multimodales, pero menor número de parámetros y, según los benchmarks del modelo base, menor rendimiento en MMLU-Pro (29,7 frente a 40,2).

## Limitaciones y advertencias

- El proceso de ajuste (RAG + DPO) no está documentado: se desconoce el dataset, la metodología y los hiperparámetros, lo que impide garantizar el comportamiento esperado.
- Riesgo de alucinación inherente a modelos de 0,8B, especialmente en tareas de razonamiento complejo (MMLU-Pro del modelo base: 29,7).
- Idiomas soportados no especificados en este repositorio; el modelo base declara 201 idiomas, pero el ajuste podría haber alterado la cobertura lingüística.
- Licencia Apache 2.0 permite uso comercial, pero al ser un derivado del modelo base Qwen, deben respetarse las condiciones de la licencia original enlazada.
- Sin descargas ni likes en el momento de la consulta, lo que indica ausencia de validación comunitaria.
- No se documentan capacidades de tool calling ni modo thinking para este ajuste concreto.
- El rendimiento en producción no está validado; se recomienda evaluación empírica antes de desplegar.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/satoyutaka/qwen35-08b-rag-dpo-v1
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B-Base
- Blog de Qwen3.5: https://qwen.ai/blog?id=qwen3.5
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B/blob/main/LICENSE
- Qwen Chat: https://chat.qwen.ai
