# RelNet-X-Code/Qwen3.5-9B

## Resumen

Qwen3.5-9B es un modelo de lenguaje causal multimodal (texto e imagen) desarrollado por Alibaba en el marco de la familia Qwen3.5. Este repositorio concreto, publicado por el usuario RelNet-X-Code, contiene los pesos y archivos de configuración del modelo post-entrenado en formato Hugging Face Transformers, compatible con vLLM, SGLang y KTransformers. El modelo destaca por integrar visión y lenguaje mediante fusión temprana de tokens multimodales, superando en benchmarks a modelos de mayor tamaño como Qwen3-30B y GPT-OSS-20B.

La arquitectura combina Gated Delta Networks con atención Gated Attention y FFN en un diseño híbrido que prioriza la eficiencia en inferencia y un bajo coste de latencia. Con 9.653 millones de parámetros totales, soporta una longitud de contexto nativa de 262.144 tokens, extensible hasta aproximadamente 1.010.000 tokens. Su licencia Apache 2.0 permite uso comercial sin restricciones significativas, y el entrenamiento con RL a escala en entornos multi-agente le confiere capacidades robustas de razonamiento y adaptación a tareas complejas.

La relevancia de este modelo radica en su equilibrio entre capacidades multimodales, rendimiento y eficiencia computacional, posicionándose como una opción atractiva para desarrolladores que necesitan un modelo compacto pero capaz de manejar tareas de razonamiento, codificación y comprensión visual sin requerir infraestructura de alto presupuesto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Causal Language Model con Vision Encoder, híbrida (Gated DeltaNet + Gated Attention + FFN) |
| Parametros totales | 9.653.104.368 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 262.144 tokens nativo, extensible hasta ~1.010.000 tokens |
| Tipos de cuantizacion | W4A16 (Jetson Orin), NVFP4 (Jetson Thor), GGUF (compatible con llama.cpp) |
| Idiomas soportados | 201 idiomas y dialectos |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (Transformers), GGUF, W4A16, NVFP4 |

## Arquitectura y entrenamiento

Qwen3.5-9B emplea una arquitectura híbrida innovadora que combina Gated Delta Networks con mecanismos de atención tradicionales. La configuración interna se organiza en 32 capas con un patrón de repetición de 8 bloques, donde cada bloque contiene 3 sub-bloques de Gated DeltaNet seguidos de FFN, y un sub-bloque final de Gated Attention también seguido de FFN. Los Gated DeltaNet utilizan 32 cabezas lineales para V y 16 para QK con dimensión de cabeza 128, mientras que la Gated Attention emplea 16 cabezas para Q y 4 para KV con dimensión de cabeza 256 y RoPE de dimensión 64. El embedding de tokens tiene un tamaño de 248.320 (padded) y la dimensión oculta es de 4096.

El entrenamiento se realizó en dos etapas: pre-entrenamiento y post-entrenamiento. En la fase de post-entrenamiento se aplicó RL escalado en entornos con millones de agentes y distribuciones de tareas progresivamente complejas, lo que mejora la robustez y adaptabilidad del modelo. El modelo incorpora Multi-Token Prediction (MTP) entrenado con multi-step, una técnica que permite predecir varios tokens futuros simultáneamente. La fusión temprana de tokens multimodales durante el entrenamiento permite que el modelo alcance capacidades de visión competitivas con modelos especializados como Qwen3-VL, manteniendo un rendimiento sólido en razonamiento, codificación y tareas de agente.

## Capacidades

- Generación de texto y razonamiento complejo multi-step, con puntuaciones de 82.5 en MMLU-Pro y 92.8 en MMLU-Redux.
- Comprensión visual nativa: procesamiento de imágenes mediante vision encoder integrado con fusión temprana de tokens multimodales.
- Codificación: soporte para generación de código en múltiples lenguajes de programación, con rendimiento competitivo en benchmarks de razonamiento técnico.
- Tool calling y function calling nativo, optimizado para flujos de trabajo agénticos.
- Soporte de agentes y razonamiento multi-paso, entrenado con RL en entornos multi-agente.
- Capacidades multilingües: soporte para 201 idiomas y dialectos con comprensión cultural y regional matizada.
- Modo thinking/reasoning disponible, con versiones separadas de razonamiento y no razonamiento según la configuración de despliegue.
- Compatible con inferencia de video a través de API compatible con OpenAI (según fuentes externas).

## Casos de uso

- Atención al cliente automatizada: el modelo puede gestionar conversaciones multi-turno con contexto largo gracias a su ventana de 262K tokens, manteniendo el historial completo de interacciones y comprendiendo documentos adjuntos o capturas de pantalla enviadas por el usuario.
- Generación de código en producción: con soporte de tool calling y razonamiento avanzado, puede integrarse en pipelines de CI/CD para generar, revisar y corregir código automáticamente, reduciendo el tiempo de desarrollo.
- Análisis de documentos técnicos y científicos: la combinación de visión y lenguaje permite procesar papers, informes con gráficos y tablas, extrayendo información relevante y respondiendo preguntas sobre el contenido.
- Asistentes de programación con contexto de repositorio completo: su ventana de contexto extensa permite cargar repositorios enteros y mantener conversaciones coherentes sobre el código, facilitando tareas de refactorización y depuración.
- Sistemas de recomendación y análisis de sentimiento multilingüe: con soporte para 201 idiomas, puede analizar opiniones de usuarios en plataformas globales, comprendiendo matices culturales y regionales.
- Agentes autónomos para automatización de tareas: su entrenamiento con RL en entornos multi-agente y soporte nativo de tool calling lo hacen adecuado para construir agentes que interactúan con APIs, navegadores y otras herramientas de forma autónoma.
- Asistencia educativa multimodal: puede explicar conceptos complejos combinando texto e imágenes, generando material didáctico personalizado y respondiendo preguntas sobre diagramas y figuras.
- Moderación de contenido y análisis de imágenes en plataformas sociales: su capacidad de comprensión visual permite detectar contenido inapropiado o clasificar imágenes automáticamente.

## Benchmarks y rendimiento

La tabla siguiente muestra los resultados publicados en la model card del autor, comparando Qwen3.5-9B con modelos de referencia:

| Benchmark | GPT-OSS-120B | GPT-OSS-20B | Qwen3-Next-80B-A3B-Thinking | Qwen3-30BA3B-Thinking-2507 | Qwen3.5-9B | Qwen3.5-4B |
|---|---|---|---|---|---|---|
| MMLU-Pro | 80.8 | 74.8 | 82.7 | 80.9 | 82.5 | 79.1 |
| MMLU-Redux | 91.0 | 87.8 | 92.5 | 91.4 | 92.8 | no disponible |

Los datos disponibles muestran que Qwen3.5-9B supera a GPT-OSS-20B y Qwen3-30BA3B-Thinking en MMLU-Pro, y supera a GPT-OSS-120B en MMLU-Redux. Según fuentes externas, el modelo también supera a Qwen3-30B en la mayoría de benchmarks y a GPT-5-Nano en tareas de visión. No se han publicado resultados adicionales de benchmarks en la información proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 20 GB en FP16 (para 9.65B parámetros), reducible a ~5-6 GB con cuantización W4A16 o GGUF Q4.
- GPU recomendadas: NVIDIA RTX 4090 (24 GB) para FP16, NVIDIA Jetson Orin (con cuantización W4A16), Jetson Thor (con NVFP4), A100 o H100 para despliegues de alta concurrencia.
- Compatible con GPUs de consumo: sí, con cuantización adecuada cabe en GPUs de 8-12 GB como RTX 3080/4070 usando GGUF Q4 o W4A16.
- Opciones de despliegue: Hugging Face Transformers, vLLM, SGLang, KTransformers, llama.cpp, Ollama, TGI, y API compatible con OpenAI.
- Latencia y throughput: según Artificial Analysis, la versión no-reasoning alcanza ~95 tokens por segundo en hardware optimizado; la versión reasoning tiene menor throughput pero mayor precisión en tareas complejas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | MMLU-Pro | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.5-9B | 9.65B | 262K (ext. 1M) | 82.5 | Apache 2.0 | HuggingFace, vLLM, Ollama |
| Qwen3-30BA3B-Thinking | 30B (3B activos) | no disponible | 80.9 | Apache 2.0 | HuggingFace |
| GPT-OSS-20B | 20B | no disponible | 74.8 | no disponible | no disponible |
| Qwen3.5-4B | ~4B | no disponible | 79.1 | Apache 2.0 | HuggingFace |

Qwen3.5-9B ofrece un rendimiento superior a modelos de mayor tamaño como Qwen3-30BA3B y GPT-OSS-20B, con un coste computacional significativamente menor. Su licencia Apache 2.0 lo hace más accesible para uso comercial que alternativas propietarias. La ventana de contexto de 262K tokens supera a la mayoría de modelos de su categoría.

## Limitaciones y advertencias

- Sesgos conocidos: como modelo entrenado con datos web, puede reflejar sesgos presentes en el corpus de entrenamiento, especialmente en idiomas con menor representación.
- Riesgo de alucinación: aunque el modelo muestra un rendimiento sólido en razonamiento, puede generar información incorrecta o inventada en contextos ambiguos o con datos insuficientes.
- Limitaciones de contexto: aunque la ventana nativa es de 262K tokens, la extensión hasta 1M tokens puede degradar el rendimiento en tareas que requieren atención precisa sobre información distante.
- Limitaciones de idioma: a pesar del soporte para 201 idiomas, el rendimiento puede variar significativamente entre idiomas, siendo superior en inglés, chino y otros idiomas bien representados.
- Restricciones de licencia: Apache 2.0 permite uso comercial sin restricciones, pero se recomienda revisar los términos de uso de los modelos base Qwen para confirmar cumplimiento.
- Consideraciones de producción: el modelo no incluye mecanismos de seguridad específicos implementados por el autor del repositorio; se recomienda añadir capas de moderación y filtrado para despliegues públicos.
- Datos no disponibles: no se han publicado detalles sobre el dataset de entrenamiento, el número exacto de tokens, ni los resultados de benchmarks de visión en la información proporcionada.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/RelNet-X-Code/Qwen3.5-9B
- Modelo base Qwen: https://huggingface.co/Qwen/Qwen3.5-9B-Base
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.5-9B/blob/main/LICENSE
- Blog oficial Qwen3.5: https://qwen.ai/blog?id=qwen3.5
- Qwen Chat: https://chat.qwen.ai
- Guía de despliegue en Jetson: https://www.jetson-ai-lab.com/models/qwen3-5-9b/
- Ficha en Awesome Agents: https://awesomeagents.ai/models/qwen-3-5-9b/
- Ficha en Doubleword: https://doubleword.ai/models/qwen3-5-9b/
- Análisis de rendimiento en Artificial Analysis: https://artificialanalysis.ai/models/releases/qwen3-5-9b
