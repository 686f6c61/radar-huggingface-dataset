# satoyutaka/qwen35-08b-rag-sft-v2

## Resumen

Qwen3.5-0.8B es un modelo fundacional multimodal de tipo causal con codificador de visión, desarrollado por el equipo Qwen (Alibaba). Esta ficha concreta, `satoyutaka/qwen35-08b-rag-sft-v2`, es un fine-tuning de tipo SFT (supervised fine-tuning) orientado a tareas de RAG (retrieval-augmented generation) sobre el checkpoint base `Qwen/Qwen3.5-0.8B-Base`. El modelo resuelve el problema de disponer de un modelo pequeño, multimodal y de contexto largo que pueda especializarse en tareas de recuperación y respuesta sobre documentos.

La arquitectura combina Gated DeltaNet (atención lineal) con atención con compuertas (gated attention) en un esquema híbrido, con 24 capas y una dimensión oculta de 1024. Con 873.438.784 parámetros reales según safetensors y una ventana de contexto nativa de 262.144 tokens, está pensado para prototipado, fine-tuning específico de tarea e investigación, no para despliegues de alta exigencia.

Es relevante ahora porque demuestra que la familia Qwen3.5 lleva su fusión temprana visión-lenguaje y su arquitectura híbrida eficiente hasta la escala sub-1B, un segmento donde escasean los modelos multimodales con contexto largo y licencia Apache 2.0. El fine-tuning concreto de este repositorio añade una capa de especialización en RAG que el checkpoint base no ofrece.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Causal Language Model con codificador de visión; híbrido Gated DeltaNet + Gated Attention |
| Parámetros totales | 873.438.784 (0,8B nominales) |
| Parámetros activos | no disponible (la model card menciona MoE disperso, pero no se detalla el reparto de expertos para esta variante) |
| Longitud de contexto | 262.144 tokens nativos |
| Tipos de cuantización | no disponible |
| Idiomas soportados | 201 idiomas y dialectos según la model card del modelo base; no se detalla la cobertura efectiva tras el fine-tuning |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (compatible con transformers, vLLM, SGLang, KTransformers) |

## Arquitectura y entrenamiento

El modelo sigue un layout híbrido de 24 capas organizado como 6 bloques de la forma `3 × (Gated DeltaNet → FFN) → 1 × (Gated Attention → FFN)`. Las capas Gated DeltaNet emplean 16 cabezas de atención lineal para V y 16 para QK con dimensión de cabeza 128; las capas de atención con compuertas usan 8 cabezas para Q y 2 para KV con dimensión 256 y RoPE de 64 dimensiones. La FFN tiene dimensión intermedia 3584, y el embedding de tokens (248.320, con padding) está atado a la salida LM. El modelo incorpora MTP (multi-token prediction) entrenado con múltiples pasos, lo que habilita decodificación especulativa.

El checkpoint base se entrenó en dos fases (pre-entrenamiento y post-entrenamiento) con fusión temprana sobre tokens multimodales, paridad cross-generacional con Qwen3 y RL escalado sobre entornos multiagente. Esta variante concreta (`rag-sft-v2`) es un fine-tuning supervisado del autor `satoyutaka` sobre el base; la model card no documenta el dataset de SFT, el número de tokens de entrenamiento ni si hubo RLHF o DPO adicional. El tamaño del repo (1,8 GB) es coherente con pesos en precisión completa para 0,8B parámetros más el codificador de visión.

## Capacidades

- Generación de texto y razonamiento en modo no-thinking (los benchmarks publicados corresponden a este modo).
- Comprensión de imágenes y texto combinados (pipeline `image-text-to-text`), con fusión temprana visión-lenguaje.
- Razonamiento, código y matemáticas heredados del base Qwen3.5.
- Capacidades de agente y razonamiento multi-paso, reforzadas en el base mediante RL sobre entornos multiagente.
- Cobertura multilingüe amplia (201 idiomas y dialectos en el base).
- Soporte de decodificación especulativa vía MTP.
- Especialización en RAG por el fine-tuning SFT específico de este repositorio.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.

## Casos de uso

- Respuesta sobre documentación interna (RAG): el modelo puede recibir fragmentos recuperados de hasta 262.144 tokens de contexto y generar respuestas fundamentadas; su especialización SFT en RAG lo hace adecuado para pipelines de pregunta-respuesta sobre corpus técnicos.
- Extracción de datos de documentos escaneados: al ser multimodal, puede procesar imágenes de páginas junto con texto recuperado y devolver campos estructurados, útil en digitalización de facturas o contratos.
- Prototipado rápido de asistentes conversacionales: con 0,8B parámetros cabe en hardware modesto y permite iterar sobre prompts y flujos multi-turno sin coste elevado.
- Fine-tuning específico de dominio: al ser un checkpoint pequeño y Apache 2.0, sirve como punto de partida para adaptar a jerga legal, médica o industrial con recursos limitados.
- Clasificación y enrutado dentro de pipelines RAG: puede decidir si un fragmento recuperado es relevante o reformular consultas antes de la recuperación, gracias a su contexto largo.
- Investigación en eficiencia multimodal: su arquitectura híbrida Gated DeltaNet + atención permite estudiar el equilibrio entre latencia y calidad en modelos sub-1B.
- Procesamiento de conversaciones largas: resúmenes de hilos extensos o actas de reuniones que superan la ventana típica de modelos pequeños.

## Benchmarks y rendimiento

Los datos publicados corresponden al modelo base Qwen3.5-0.8B en modo no-thinking; no hay benchmarks específicos del fine-tuning `rag-sft-v2`.

| Benchmark | Qwen3-4B-2507 | Qwen3-1.7B | Qwen3.5-2B | Qwen3.5-0.8B |
|---|---|---|---|---|
| MMLU-Pro | 69,6 | 40,2 | 55,3 | 29,7 |
| MMLU-Redux | 84,2 | 64,4 | 69,2 | 48,5 |
| C-Eval | 80,2 | 61,0 | 65,2 | 46,4 |

No se han publicado resultados de benchmarks adicionales (HumanEval, GSM8K, tareas de visión) en la información disponible, ni métricas del fine-tuning RAG.

## Requisitos de hardware

- VRAM estimada para inferencia: en fp16/bf16, aproximadamente 1,8 GB para pesos más overhead de activaciones y KV cache; en cuantización de 8 bits, alrededor de 1 GB; en 4 bits, por debajo de 1 GB (estimaciones a partir del recuento de parámetros, no verificadas).
- GPU recomendadas: el modelo cabe en GPUs de consumo como RTX 3060 12 GB, RTX 4060 Ti 16 GB o RTX 4090; para despliegues de servidor, A100 o H100 permiten mayor paralelismo y throughput.
- Cabe en GPU de consumo: sí, en cualquier GPU con 4 GB o más de VRAM en cuantización agresiva, y con 6-8 GB en precisión completa.
- Opciones de despliegue: transformers, vLLM, SGLang y KTransformers según la model card; llama.cpp u Ollama no están confirmados para esta arquitectura híbrida.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | MMLU-Pro (no-thinking) | Licencia | Multimodal |
|---|---|---|---|---|---|
| Qwen3.5-0.8B (base de este fine-tuning) | 0,8B | 262.144 | 29,7 | Apache 2.0 | Sí |
| Qwen3.5-2B | 2B | no disponible | 55,3 | Apache 2.0 | Sí |
| Qwen3-1.7B | 1,7B | no disponible | 40,2 | Apache 2.0 | No |
| Qwen3-4B-2507 | 4B | no disponible | 69,6 | Apache 2.0 | No |

La comparativa se limita a la familia Qwen por falta de datos de benchmarks de terceros en la información proporcionada. El modelo destaca por su contexto de 262.144 tokens frente a alternativas de tamaño similar, a costa de un rendimiento de razonamiento inferior al de modelos de 1,7B y 2B de la misma familia.

## Limitaciones y advertencias

- Rendimiento de razonamiento bajo en términos absolutos: MMLU-Pro de 29,7 y MMLU-Redux de 48,5 en el base, muy por debajo de modelos de 1,7B-4B; no apto para tareas que exijan razonamiento complejo sin verificación.
- Riesgo de alucinación elevado en un modelo de 0,8B, especialmente en RAG si los fragmentos recuperados son ambiguos o contradictorios.
- El fine-tuning `rag-sft-v2` no documenta dataset, hiperparámetros ni evaluación, por lo que su calidad efectiva en RAG no está verificada.
- La model card base menciona MoE disperso, pero no se detalla la configuración de expertos para esta variante; conviene no asumir un reparto de parámetros activos concreto.
- Cobertura idiomática efectiva tras el SFT desconocida; los 201 idiomas corresponden al base.
- Licencia Apache 2.0 permite uso comercial, pero el autor del fine-tuning no ofrece garantías adicionales; revisar la licencia del base enlazada.
- El pipeline declarado es `image-text-to-text`, pero no hay benchmarks de visión publicados para esta variante.
- Contexto de 262.144 tokens nativo: el coste de KV cache en esa longitud puede superar la VRAM de GPUs de consumo, aunque la arquitectura híbrida con atención lineal lo mitiga parcialmente.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/satoyutaka/qwen35-08b-rag-sft-v2
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B-Base
- Blog de Qwen3.5: https://qwen.ai/blog?id=qwen3.5
- Qwen Chat: https://chat.qwen.ai
- Licencia del base: https://huggingface.co/Qwen/Qwen3.5-0.8B/blob/main/LICENSE
