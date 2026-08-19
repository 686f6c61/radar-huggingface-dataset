# FastFlowLM/Qwen3.5-0.8B-NPU2

## Resumen

FastFlowLM/Qwen3.5-0.8B-NPU2 es una adaptación del modelo Qwen3.5-0.8B de Alibaba, publicada por FastFlowLM con el objetivo de ejecutar el modelo de forma eficiente en NPUs AMD Ryzen AI. Se trata de un modelo causal de lenguaje con codificador de visión (image-text-to-text), por lo que acepta tanto texto como imágenes como entrada. Con 0.8 mil millones de parámetros y una ventana de contexto nativa de 262 144 tokens, está pensado para prototipado, fine-tuning específico de tareas y despliegue en entornos de investigación o desarrollo.

La relevancia de este modelo radica en su arquitectura híbrida eficiente (Gated Delta Networks combinadas con Mixture-of-Experts disperso) y en su integración con el ecosistema FastFlowLM, que permite ejecutarlo en hardware NPU de AMD con bajo consumo y latencia reducida. Al estar basado en Qwen3.5, hereda capacidades multilingües ampliadas (hasta 201 idiomas según la documentación oficial) y un entrenamiento con RL a gran escala. La licencia Apache 2.0 facilita su uso comercial y su integración en proyectos propietarios.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Causal Language Model con Vision Encoder, híbrida (Gated DeltaNet + Gated Attention + FFN) con MoE disperso |
| Parametros totales | 0,8 mil millones (0.8B) |
| Parametros activos | no disponible (no se especifica en la documentación) |
| Longitud de contexto | 262 144 tokens (nativa) |
| Tipos de cuantizacion | no disponible (el repositorio no lista cuantizaciones; se espera compatibilidad con formatos estándar) |
| Idiomas soportados | no disponible (la model card no lista idiomas específicos; la familia Qwen3.5 declara soporte para 201 idiomas) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repositorio de 3,1 GB, compatible con Transformers, vLLM, SGLang, KTransformers) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura de Qwen3.5-0.8B: un transformer causal con codificador de visión integrado mediante fusión temprana de tokens multimodales. La capa de lenguaje se organiza en 24 capas con un patrón de 6 × (3 × (Gated DeltaNet → FFN) → 1 × (Gated Attention → FFN)). La Gated DeltaNet emplea 16 cabezas de atención lineal para V y 16 para QK, con dimensión de cabeza 128. La Gated Attention usa 8 cabezas para Q y 2 para KV, con dimensión de cabeza 256 y embeddings rotatorios de 64 dimensiones. La FFN tiene dimensión intermedia de 3584. El embedding de tokens es de 248 320 (padding) y está atado a la salida LM. Se entrenó con multi-step MTP (Multi-Token Prediction).

El entrenamiento incluye una fase de pre-entrenamiento y post-entrenamiento, con escalado de RL en entornos de millones de agentes. La documentación menciona una eficiencia de entrenamiento multimodal cercana al 100% comparada con solo texto. No se detallan los datos de entrenamiento (número de tokens, composición del dataset) en la información disponible.

## Capacidades

- Generación de texto y razonamiento: soporta modos thinking y non-thinking (aunque los benchmarks publicados son solo non-thinking).
- Comprensión de imágenes: al ser image-text-to-text, puede procesar entradas visuales junto con texto.
- Multilingüismo: la familia Qwen3.5 declara soporte para 201 idiomas y dialectos, aunque no se confirma para esta variante específica.
- Tool calling / function calling: no se menciona explícitamente, pero la familia Qwen3.5 suele incluirlo; no hay confirmación en la documentación.
- Capacidades de agente y razonamiento multi-paso: no se detalla en la información proporcionada.
- Optimización para NPU: el modelo está adaptado para ejecutarse en NPUs AMD Ryzen AI mediante FastFlowLM, con soporte para inferencia de alto rendimiento.

## Casos de uso

- Prototipado rápido de aplicaciones conversacionales: con 0.8B parámetros, el modelo puede ejecutarse en hardware modesto, permitiendo iterar sobre chatbots o asistentes virtuales sin necesidad de GPUs de gama alta.
- Fine-tuning específico de tareas: su tamaño reducido y licencia Apache 2.0 lo hacen adecuado para ajuste fino en dominios concretos (atención al cliente, análisis de documentos, etc.) con datasets propios.
- Inferencia en dispositivos edge con NPU AMD Ryzen AI: gracias a la integración con FastFlowLM, puede desplegarse en portátiles y mini-PCs con NPU, ofreciendo baja latencia y consumo energético reducido.
- Análisis de imágenes y texto combinados: al aceptar entradas visuales, puede usarse para tareas de captioning, VQA (visual question answering) o extracción de información de documentos escaneados.
- Investigación en arquitecturas híbridas: su diseño con Gated DeltaNet y MoE disperso sirve como banco de pruebas para estudiar eficiencia de atención lineal y sparse expert.
- Desarrollo de agentes conversacionales multilingües: si se confirma el soporte de 201 idiomas, puede emplearse en aplicaciones de traducción o asistencia en múltiples regiones.

## Benchmarks y rendimiento

La model card publica resultados en modo non-thinking para Qwen3.5-0.8B comparado con otros modelos de la familia:

| Benchmark | Qwen3-4B-2507 | Qwen3-1.7B | Qwen3.5-2B | Qwen3.5-0.8B |
|---|---|---|---|---|
| MMLU-Pro | 69.6 | 40.2 | 55.3 | 29.7 |
| MMLU-Redux | 84.2 | 64.4 | 69.2 | 48.5 |
| C-Eval | 80.2 | 61.0 | 65.2 | 46.4 |

No se proporcionan resultados de benchmarks adicionales (HumanEval, GSM8K, etc.) en la información disponible. Los resultados de la página de FastFlowLM sobre rendimiento en NPU no incluyen cifras concretas en el extracto proporcionado.

## Requisitos de hardware

- VRAM estimada: no disponible. Con 0.8B parámetros en FP16, el peso ocupa aproximadamente 1.6 GB, más overhead de activaciones y KV cache; en cuantización INT4 podría caber en ~0.5-0.8 GB.
- GPU recomendadas: no se especifican, pero al ser un modelo pequeño, cualquier GPU con 4 GB o más (GTX 1650, RTX 3050, etc.) puede ejecutarlo. También es compatible con NPUs AMD Ryzen AI (serie Ryzen AI 300 o superior).
- Compatibilidad con consumer GPU: sí, cabe en GPUs de consumo con 4 GB o más.
- Opciones de despliegue: Transformers, vLLM, SGLang, KTransformers, y FastFlowLM para NPU AMD.
- Latencia y throughput: no disponibles en la documentación. La página de FastFlowLM menciona que los resultados dependen de la versión del software y del modo de potencia de la NPU.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | MMLU-Pro (non-thinking) | Notas |
|---|---|---|---|---|---|
| Qwen3.5-0.8B (este) | 0.8B | 262 144 | Apache 2.0 | 29.7 | Híbrido DeltaNet+MoE, visión |
| Qwen3-1.7B | 1.7B | 262 144 (aprox.) | Apache 2.0 | 40.2 | Transformer denso, sin visión |
| Qwen3.5-2B | 2B | 262 144 | Apache 2.0 | 55.3 | Híbrido, visión |

El modelo de 0.8B es significativamente más débil en razonamiento que sus hermanos mayores, pero ofrece la ventaja de un tamaño mínimo y soporte de visión. No se dispone de comparación con otros modelos de 0.8B de otras familias (p.ej. Llama 3.2 1B, Gemma 2 2B) en la información proporcionada.

## Limitaciones y advertencias

- Rendimiento limitado en tareas de razonamiento complejo: los benchmarks muestran puntuaciones bajas en MMLU-Pro (29.7) y C-Eval (46.4), lo que indica que no es adecuado para tareas que requieran conocimiento profundo o lógica avanzada.
- Sesgos y alucinaciones: al ser un modelo pequeño entrenado con datos web, puede presentar sesgos sociales y generar contenido factualmente incorrecto. No se han publicado evaluaciones específicas de sesgo.
- Soporte de idiomas no confirmado: aunque la familia Qwen3.5 declara 201 idiomas, la model card de esta variante no especifica qué idiomas están realmente soportados en la práctica.
- Dependencia de FastFlowLM para NPU: el sufijo "NPU2" indica una adaptación específica; el uso en NPU requiere el runtime de FastFlowLM, que puede tener limitaciones de compatibilidad con ciertos sistemas operativos o versiones de hardware.
- Sin garantía de tool calling o agentes: no se documenta soporte explícito para function calling, lo que limita su uso en pipelines de agentes complejos.
- Tamaño del repositorio (3.1 GB) mayor de lo esperado para 0.8B: posiblemente incluya pesos en múltiples formatos o archivos de configuración adicionales; verificar antes de descargar.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/FastFlowLM/Qwen3.5-0.8B-NPU2
- Página de benchmarks de Qwen 3.5 en NPU (FastFlowLM): https://fastflowlm.com/docs/benchmarks/qwen3.5_results/
- Catálogo de modelos FastFlowLM: https://fastflowlm.com/models/
- Repositorio GitHub de FastFlowLM: https://github.com/ROCm/FastFlowLM
- Blog oficial de Qwen3.5 (referencia): https://qwen.ai/blog?id=qwen3.5
