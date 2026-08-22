# Atomic-Germ/Qwen3.5-9B-NPU2

## Resumen

Qwen3.5-9B es un modelo fundacional multimodal desarrollado por el equipo de Qwen (Alibaba) que integra visión y lenguaje en una arquitectura unificada de 9 000 millones de parámetros. Este repositorio, publicado por el usuario Atomic-Germ bajo licencia Apache 2.0, contiene los pesos del modelo post-entrenado en formato Hugging Face Transformers, listos para usar con vLLM, SGLang o KTransformers. El modelo destaca por su arquitectura híbrida con Gated Delta Networks y Mixture-of-Experts dispersa, que logra un alto rendimiento de inferencia con bajo coste de latencia.

La relevancia de este modelo radica en su capacidad multimodal (imagen y texto), su ventana de contexto nativa de 262 144 tokens ampliable hasta 1 010 000, y su cobertura de 201 idiomas y dialectos. Según los datos de la model card, Qwen3.5-9B alcanza resultados competitivos en benchmarks de conocimiento y STEM frente a modelos mucho mayores como GPT-OSS-120B, lo que lo convierte en una opción atractiva para despliegues eficientes en producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer causal con vision encoder y Gated Delta Networks (híbrido lineal + atención) |
| Parámetros totales | 9 000 millones |
| Parámetros activos | no disponible |
| Longitud de contexto | 262 144 tokens nativos; extensible hasta 1 010 000 tokens |
| Tipos de cuantización | no disponible |
| Idiomas soportados | 201 idiomas y dialectos (según model card); la metadata de HF indica "English" |
| Licencia | Apache 2.0 |
| Formato de pesos | Transformers (safetensors, compatible con vLLM, SGLang, KTransformers) |

## Arquitectura y entrenamiento

Qwen3.5-9B emplea una arquitectura híbrida que combina bloques de atención lineal Gated Delta Network con bloques de atención con RoPE y un módulo de visión encoder integrado. El layout de las 32 capas se organiza como 8 grupos de (3 × (Gated DeltaNet → FFN) → 1 × (Gated Attention → FFN)), donde el Gated DeltaNet usa 32 cabezas de atención lineal para V y 16 para QK, mientras que el Gated Attention usa 16 cabezas para Q y 4 para KV con dimensión 256. El entrenamiento incluye una fase de pre-entrenamiento y post-entrenamiento, con énfasis en el aprendizaje por refuerzo escalado en entornos multi-agente con distribuciones de tareas progresivamente complejas. El modelo incorpora un módulo MTP (Multi-Token Prediction) entrenado con multi-step. Según la model card, la eficiencia de entrenamiento multimodal es cercana al 100 % comparada con el entrenamiento solo de texto.

## Capacidades

- Generación de texto multimodal: procesa y genera texto a partir de entradas de imagen y texto, con razonamiento visual y de lenguaje unificado.
- Razonamiento y codificación: supera a Qwen3-VL en benchmarks de razonamiento, código y agentes según la model card.
- Soporte de tool calling / function calling: no se especifica explícitamente en la documentación, pero es compatible con vLLM y SGLang, que suelen soportar esta funcionalidad.
- Soporte de agentes y razonamiento multi-paso: el entrenamiento con RL en entornos de agentes masivos indica capacidad para tareas de razonamiento complejo.
- Multilingüismo ampliado: 201 idiomas y dialectos, con comprensión cultural y regional.
- Contexto largo: ventana de 262 144 tokens nativa, ampliable hasta más de un millón, ideal para documentos extensos y conversaciones de múltiples turnos.

## Casos de uso

- Atención al cliente automatizada: el modelo puede gestionar conversaciones multi-turno con contexto largo gracias a sus 262 144 tokens de ventana, manteniendo el hilo de la conversación durante horas de interacción.
- Generación de código en producción: con capacidades de razonamiento y codificación superiores a modelos previos, puede integrarse en pipelines de CI/CD para autocompletado de código o revisión de PR.
- Análisis de documentos extensos: la ventana de contexto de más de un millón de tokens permite procesar informes financieros, contratos legales o papers académicos completos sin truncamiento.
- Asistentes de visión por computadora: el encoder de visión integrado permite crear aplicaciones que describan imágenes, extraigan información visual o respondan preguntas sobre contenido visual.
- Traducción y localización: su soporte para 201 idiomas permite su uso en sistemas de traducción automática con comprensión cultural, útil para plataformas de contenido global.
- Agentes autónomos de razonamiento multi-paso: gracias al entrenamiento con RL en entornos de agentes, puede descomponer tareas complejas y ejecutar secuencias de acciones en aplicaciones de automatización.
- Investigación académica en NLP: su licencia Apache 2.0 y su arquitectura híbrida lo hacen adecuado para experimentos de investigación sobre eficiencia de modelos, adaptación o fine-tuning.

## Benchmarks y rendimiento

Los datos de benchmark disponibles en la model card (fragmento) muestran los siguientes resultados en comparación con modelos de referencia:

| Benchmark | GPT-OSS-120B | GPT-OSS-20B | Qwen3-Next-80B-A3B-Thinking | Qwen3-30B-A3B-Thinking-2507 | Qwen3.5-9B | Qwen3.5-4B |
|---|---|---|---|---|---|---|
| MMLU-Pro | 80.8 | 74.8 | 82.7 | 80.9 | 82.5 | 79.1 |
| MMLU-Redux | 91.0 | 87.8 | 92.5 | 91.4 | 91.4 | no disponible |

No se han publicado resultados completos de benchmarks en la información disponible más allá de estos dos indicadores. El modelo muestra un rendimiento competitivo en conocimiento y STEM, incluso superando a GPT-OSS-120B en MMLU-Pro.

## Requisitos de hardware

- VRAM estimada para inferencia: con 9 000 millones de parámetros, una cuantización FP16 requiere aproximadamente 18 GB de VRAM; con cuantización de 8 bits (INT8) se reduce a unos 9-10 GB, y con 4 bits (Q4) a unos 5-6 GB.
- GPU recomendadas: para FP16, una NVIDIA A100 (40/80 GB) o RTX 4090 (24 GB) es suficiente; para cuantización de 4 bits, puede caber en GPUs de consumo como RTX 3060 (12 GB) o RTX 3080.
- Cabe en GPUs de consumo: sí, con cuantización de 4 bits en GPUs de 8-12 GB.
- Opciones de despliegue: compatible con Hugging Face Transformers, vLLM, SGLang y KTransformers. También puede desplegarse con llama.cpp u Ollama si se convierte a formato GGUF.
- Latencia y throughput: no se han publicado cifras concretas, pero la arquitectura híbrida de Delta Networks y MoE dispersa está diseñada para reducir la latencia y el coste por token en comparación con modelos densos del mismo tamaño.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | MMLU-Pro | Notas |
|---|---|---|---|---|---|
| Qwen3.5-9B | 9B | 262 144 (hasta 1M) | Apache 2.0 | 82.5 | Multimodal, 201 idiomas, arquitectura híbrida |
| Qwen3.5-4B | 4B | no disponible | Apache 2.0 | 79.1 | Versión más pequeña de la misma familia |
| Qwen3-30B-A3B-Thinking-2507 | 30B (3B activos) | no disponible | Apache 2.0 | 80.9 | Modelo MoE con modo de razonamiento |
| GPT-OSS-20B | 20B | no disponible | no disponible | 74.8 | Modelo de OpenAI, no multimodal |

Qwen3.5-9B ofrece un rendimiento superior en MMLU-Pro frente a modelos más grandes como GPT-OSS-20B, con la ventaja de ser multimodal y de tener una licencia Apache 2.0 completamente abierta.

## Limitaciones y advertencias

- La información de la model card es del modelo original Qwen3.5-9B; el repositorio de Atomic-Germ parece ser una copia o variante, y no se especifican modificaciones adicionales.
- No se han publicado detalles sobre sesgos de datos o alucinaciones específicos en la documentación disponible.
- La ventana de contexto de 1 010 000 tokens es "extensible", lo que puede requerir técnicas como sliding window o procesamiento por fragmentos en hardware limitado.
- Aunque el modelo soporta 201 idiomas, la metadata de HF indica "English" como idioma principal, lo que sugiere que la calidad puede variar entre idiomas.
- El modelo no ha sido evaluado en benchmarks de seguridad o de sesgos en la información proporcionada.
- No hay datos sobre el rendimiento en producción (latencia, throughput) ni sobre el proceso de fine-tuning del autor AtomicGerm.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Atomic-Germ/Qwen3.5-9B-NPU2
- Modelo base en HuggingFace: https://huggingface.co/Qwen/Qwen3.5-9B
- Blog oficial de Qwen3.5: https://qwen.ai/blog?id=qwen3.5
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.5-9B/blob/main/LICENSE
- Repositorio relacionado de Atomic-Germ (variante Claude-Code): https://huggingface.co/Atomic-Germ/Qwen3.5-9B-Claude-Code-NPU2
- Repositorio relacionado (Cold-Fusion): https://huggingface.co/Atomic-Germ/Qwen3.5-Cold-Fusion-9B-NPU2
