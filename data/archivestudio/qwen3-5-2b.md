# ArchiveStudio/Qwen3.5-2B

## Resumen

Qwen3.5-2B es un modelo de lenguaje causal con codificador de visión de la familia Qwen3.5, desarrollado por Alibaba Qwen y publicado en el repositorio `ArchiveStudio/Qwen3.5-2B` como un artefacto derivado del modelo base `Qwen/Qwen3.5-2B-Base`. Con 2.274.069.824 parámetros totales (2B nominales) y un contexto nativo de 262.144 tokens, está diseñado para prototipado, ajuste fino específico de tareas y desarrollo e investigación, según indica su propia model card. La licencia es Apache 2.0.

La relevancia técnica de esta generación radica en su arquitectura híbrida: combina Gated DeltaNet (atención lineal) con atención con compuertas (Gated Attention) en un layout de 24 capas, además de un diseño multimodal de fusión temprana que, según el autor, alcanza paridad con Qwen3 y supera a Qwen3-VL en razonamiento, código, agentes y comprensión visual. El modelo soporta 201 idiomas y dialectos según la documentación oficial.

Se trata de un modelo pequeño (2B) con contexto muy largo y capacidades multimodales, lo que lo sitúa en una categoría poco habitual: modelos compactos con ventana de 256K y entrada image-text-to-text. Es adecuado para entornos con recursos limitados que necesitan contexto extenso, aunque su escala de parámetros limita el rendimiento en tareas de razonamiento complejo frente a modelos mayores de la misma familia.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Causal Language Model con Vision Encoder; híbrida Gated DeltaNet + Gated Attention, con FFN; layout 6 × (3 × (Gated DeltaNet → FFN) → 1 × (Gated Attention → FFN)) |
| Parámetros totales | 2.274.069.824 (2B nominales) |
| Parámetros activos | no disponible (la model card menciona MoE disperso en la descripción de la arquitectura híbrida, pero no se detalla el número de parámetros activos para esta variante de 2B) |
| Longitud de contexto | 262.144 tokens nativos |
| Tipos de cuantización | no disponible |
| Idiomas soportados | 201 idiomas y dialectos (según la model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (compatible con Hugging Face Transformers, vLLM, SGLang, KTransformers) |

Datos arquitectónicos adicionales: dimensión oculta 2048; token embedding 248.320 (padded); 24 capas; Gated DeltaNet con 16 cabezas de atención lineal para V y 16 para QK, dimensión de cabeza 128; Gated Attention con 8 cabezas para Q y 2 para KV, dimensión de cabeza 256, RoPE de 64 dimensiones; FFN con dimensión intermedia 6144; salida LM de 248.320 atada al embedding; MTP entrenado con múltiples pasos.

## Arquitectura y entrenamiento

El modelo emplea una arquitectura de transformer híbrido que intercala bloques de Gated DeltaNet (atención lineal con estado recurrente) y bloques de Gated Attention (atención estándar con compuertas y RoPE). El patrón de 24 capas sigue un layout de 6 repeticiones de tres bloques DeltaNet seguidos de un bloque de atención con compuertas, lo que reduce el coste computacional de la atención sobre contextos largos manteniendo capacidad expresiva. Incluye un codificador de visión y fusión temprana de tokens multimodales, lo que permite entrenamiento conjunto texto-imagen desde las primeras etapas.

El entrenamiento comprende fases de pre-entrenamiento y post-entrenamiento. La model card menciona escalado de reinforcement learning sobre entornos multiagente con distribuciones de tareas progresivamente complejas, así como una infraestructura de entrenamiento multimodal con eficiencia cercana al 100% respecto al entrenamiento solo de texto. Se entrena con MTP (multi-token prediction) en varios pasos. No se especifican en la información disponible el número exacto de tokens de entrenamiento, la composición del dataset ni los detalles de RLHF/DPO.

## Capacidades

- Generación de texto y razonamiento en modo instruct (non-thinking) y, presumiblemente, modo thinking, aunque la información solo detalla resultados para el modo instruct.
- Comprensión y generación multimodal image-text-to-text gracias al codificador de visión y la fusión temprana.
- Razonamiento, código, agentes y comprensión visual, según las afirmaciones de la model card (paridad con Qwen3 y superioridad sobre Qwen3-VL en estos ejes).
- Soporte multilingüe amplio: 201 idiomas y dialectos.
- Capacidad de contexto largo: 262.144 tokens nativos, útil para documentos extensos y conversaciones multi-turno prolongadas.
- MTP (multi-token prediction) entrenado con múltiples pasos, orientado a decodificación especulativa y mayor throughput.
- Soporte de tool calling / function calling: no se detalla explícitamente en la información disponible, aunque la orientación a agentes de la familia Qwen3.5 sugiere compatibilidad; no confirmado en la documentación proporcionada.
- Compatibilidad con vLLM, SGLang, KTransformers y Transformers para despliegue.

## Casos de uso

- Prototipado rápido de asistentes multimodales: el modelo acepta entradas de imagen y texto y cabe en una GPU de consumo con cuantización, lo que permite validar ideas de producto sin infraestructura dedicada.
- Análisis de documentos largos: con 262.144 tokens de contexto, puede procesar contratos, informes o expedientes completos en una sola pasada, resumiendo o extrayendo información sin truncar.
- Ajuste fino específico de dominio: al ser un modelo de 2B con licencia Apache 2.0, es viable reentrenarlo o aplicar LoRA sobre datos propios (legal, sanitario, atención al cliente) en hardware modesto.
- Procesamiento de imágenes en pipelines de accesibilidad: descripción de imágenes, extracción de texto de capturas o generación de alt-text en flujos automatizados, gracias a su pipeline image-text-to-text.
- Asistente multilingüe de bajo coste: con soporte declarado de 201 idiomas, puede desplegarse para atención al cliente en mercados con varios idiomas sin multiplicar la infraestructura.
- Investigación en arquitecturas híbridas: su combinación de Gated DeltaNet y Gated Attention lo convierte en una base útil para estudiar eficiencia de atención lineal y decodificación especulativa con MTP.
- Generación de código asistida en entornos con recursos limitados: aunque su rendimiento en código no se detalla por benchmark en la información disponible, la familia Qwen3.5 se orienta a tareas de código y agentes; conviene validar con evaluación propia antes de producción.

## Benchmarks y rendimiento

Resultados publicados en la model card (modo instruct, non-thinking):

| Benchmark | Qwen3-4B-2507 | Qwen3-1.7B | Qwen3.5-2B | Qwen3.5-0.8B |
|---|---|---|---|---|
| MMLU-Pro | 69,6 | 40,2 | 55,3 | 29,7 |
| MMLU-Redux | 84,2 | 64,4 | 69,2 | 48,5 |
| C-Eval | 80,2 | 61,0 | 65,2 | 46,4 |

No se han publicado en la información disponible resultados de HumanEval, GSM8K ni benchmarks de visión o agentes para este modelo. Los datos de la tabla provienen de la model card del autor y no han sido verificados de forma independiente.

## Requisitos de hardware

- VRAM estimada para inferencia: en FP16/BF16, aproximadamente 4,5 GB solo para pesos (2,27B parámetros × 2 bytes), más overhead de activaciones y caché KV; en cuantización de 8 bits, en torno a 2,3 GB; en 4 bits, en torno a 1,2 GB. Estas cifras son estimaciones a partir del número de parámetros, no datos publicados.
- GPU recomendadas: para FP16 completo, una GPU con 8-16 GB (RTX 4070/4080, RTX 3090, L4, A10). Para despliegue de alto throughput, A100 o H100 con vLLM o SGLang.
- Cabe en GPU de consumo: sí, en tarjetas con 8 GB o más en cuantización de 4-8 bits; en FP16 requiere al menos 8 GB y margen para el contexto.
- Opciones de despliegue: Hugging Face Transformers, vLLM, SGLang y KTransformers, según la model card. No se confirma soporte de llama.cpp u Ollama en la información disponible.
- Latencia y throughput: no disponibles. El contexto de 262.144 tokens y la atención lineal de Gated DeltaNet están orientados a reducir el coste en contextos largos, pero no se publican cifras concretas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | MMLU-Pro | Licencia | Multimodal |
|---|---|---|---|---|---|
| Qwen3.5-2B | 2,27B | 262.144 | 55,3 | Apache 2.0 | Sí |
| Qwen3-1.7B | 1,7B | no disponible en la información | 40,2 | Apache 2.0 | No |
| Qwen3-4B-2507 | 4B | no disponible en la información | 69,6 | Apache 2.0 | No |
| Qwen3.5-0.8B | 0,8B | no disponible en la información | 29,7 | Apache 2.0 | Sí (según familia) |

Qwen3.5-2B supera a Qwen3-1.7B en MMLU-Pro (+15,1 puntos) y en MMLU-Redux (+4,8) y C-Eval (+4,2), pero queda por debajo de Qwen3-4B-2507 en los tres benchmarks, lo cual es coherente con la diferencia de escala. Su ventaja frente a los Qwen3 no multimodales es la entrada de imagen y el contexto de 256K. No se dispone de comparación con modelos de otros fabricantes en la información proporcionada.

## Limitaciones y advertencias

- Escala limitada: con 2B parámetros, el rendimiento en razonamiento complejo, matemáticas avanzadas y código de producción es inferior al de modelos de 4B o superiores de la misma familia (MMLU-Pro 55,3 frente a 69,6 de Qwen3-4B-2507).
- Riesgo de alucinación: no se documentan tasas de alucinación ni evaluaciones de fidelidad; en un modelo de este tamaño el riesgo es relevante en tareas factuales y de contexto largo.
- Idiomas: aunque se declaran 201 idiomas, no se publican evaluaciones por idioma; el rendimiento en castellano no está verificado en la información disponible.
- Licencia: Apache 2.0 permite uso comercial, pero la model card enlaza a la licencia del modelo base Qwen3.5-2B; conviene revisar los términos del repositorio original antes de desplegar en producción.
- Artefacto derivado: el repositorio `ArchiveStudio/Qwen3.5-2B` tiene 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de validación independiente de estos pesos frente al modelo base oficial.
- Sesgos: no se documentan evaluaciones de sesgo ni de seguridad en la información proporcionada.
- Tool calling y agentes: la model card menciona orientación a agentes, pero no se detalla el protocolo de function calling soportado; requiere validación empírica.
- Contexto largo: el rendimiento en los 262.144 tokens no está evaluado en los benchmarks publicados; la degradación en el extremo de la ventana es desconocida.

## Enlaces

- Hugging Face: https://huggingface.co/ArchiveStudio/Qwen3.5-2B
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-2B-Base
- Blog oficial de Qwen3.5: https://qwen.ai/blog?id=qwen3.5
- Qwen Chat: https://chat.qwen.ai
- Licencia: https://huggingface.co/Qwen/Qwen3.5-2B/blob/main/LICENSE
