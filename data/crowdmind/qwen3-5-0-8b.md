# CrowdMind/Qwen3.5-0.8B

## Resumen

Qwen3.5-0.8B es el modelo más pequeño de la familia Qwen3.5, desarrollada por Alibaba Cloud. Se trata de un modelo de lenguaje causal con codificador de visión, lo que le permite procesar de forma nativa texto, imágenes y vídeo. Con 873 millones de parámetros, está diseñado para escenarios de despliegue en el borde (edge), prototipado rápido y fine-tuning específico de tareas, donde el coste computacional y la latencia son factores críticos.

El modelo destaca por integrar una arquitectura híbrida eficiente que combina Gated Delta Networks con atención sparse tipo Mixture-of-Experts (MoE), logrando un equilibrio entre rendimiento y eficiencia de inferencia. Su ventana de contexto nativa de 262.144 tokens y la cobertura de 201 idiomas y dialectos lo convierten en una opción relevante para aplicaciones multilingües y de contexto largo en dispositivos con recursos limitados. La licencia Apache 2.0 facilita su adopción tanto en investigación como en productos comerciales.

La relevancia actual de este modelo radica en su capacidad para llevar capacidades multimodales y de razonamiento a hardware de gama baja, incluyendo teléfonos móviles y placas como Jetson, algo que hasta ahora estaba reservado a modelos de mayor tamaño. Su publicación en agosto de 2026 lo sitúa como una alternativa ligera dentro de un ecosistema donde la eficiencia es cada vez más prioritaria.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Causal Language Model con Vision Encoder, híbrida (Gated DeltaNet + Gated Attention con MoE) |
| Parametros totales | 873.438.784 (0,8B) |
| Parametros activos | no disponible |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | no disponible (existen versiones GGUF y 4-bit para despliegue en borde) |
| Idiomas soportados | 201 idiomas y dialectos |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, GGUF (vía Ollama y llama.cpp) |

## Arquitectura y entrenamiento

Qwen3.5-0.8B emplea una arquitectura híbrida que combina Gated Delta Networks con atención lineal y capas de atención con mecanismo Gated Attention. La disposición oculta sigue el patrón `6 × (3 × (Gated DeltaNet → FFN) → 1 × (Gated Attention → FFN))`, con 24 capas en total. El modelo incorpora 16 cabezas de atención lineal para V y 16 para QK con dimensión de cabeza 128, y 8 cabezas de atención para Q con 2 para KV y dimensión 256. La dimensión oculta es 1024, con embedding de tokens de 248320 (padded) y salida LM atada al embedding. El entrenamiento incluye MTP (multi-token prediction) con multi-steps.

El entrenamiento se realizó en dos etapas: pre-training y post-training. La familia Qwen3.5 introduce innovaciones como fusión temprana (early fusion) de tokens multimodales para lograr paridad con modelos de generación anterior, y escalado de reinforcement learning en entornos de millones de agentes con distribuciones de tareas progresivamente complejas. La infraestructura de entrenamiento alcanza una eficiencia cercana al 100% en entrenamiento multimodal comparado con texto solamente, y utiliza frameworks de RL asíncronos para orquestación de agentes a gran escala.

## Capacidades

- Procesamiento nativo multimodal: acepta entradas de texto, imagen y vídeo sin necesidad de adaptadores externos.
- Generación de texto y razonamiento: capaz de resolver tareas de razonamiento complejo, con modo thinking y non-thinking.
- Soporte multilingüe amplio: 201 idiomas y dialectos con comprensión de matices culturales y regionales.
- Comprensión visual: responde preguntas sobre imágenes (MathVista 62,2; OCRBench 74,5).
- Tool calling y function calling: integrable en pipelines de agentes y automatización (endpoints_compatible).
- Capacidad de agentes y multi-step reasoning: entrenado con RL en entornos multi-agente para adaptabilidad en tareas reales.
- Eficiencia para despliegue en borde: funciona en dispositivos con recursos limitados, incluidos móviles con cuantización 4-bit.

## Casos de uso

- Asistente multimodal en dispositivos móviles: el modelo puede procesar imágenes capturadas con la cámara y responder preguntas sobre ellas en tiempo real, gracias a su tamaño reducido y soporte nativo de visión. Es adecuado para aplicaciones de accesibilidad o ayuda visual en campo.
- Chatbot multilingüe de atención al cliente: con soporte para 201 idiomas y una ventana de contexto de 262K tokens, puede gestionar conversaciones largas y multilingües sin perder el hilo, manteniendo un coste de inferencia bajo en infraestructura modesta.
- Prototipado rápido de aplicaciones de IA: su pequeño tamaño permite iterar rápidamente en fine-tuning y pruebas de concepto antes de escalar a modelos mayores. Es ideal para validar ideas con datos propios sin grandes inversiones en cómputo.
- Análisis de documentos con contexto largo: la ventana de 262K tokens permite procesar documentos extensos (manuales, informes, contratos) junto con imágenes escaneadas, extrayendo información relevante para resúmenes o búsquedas internas.
- Despliegue en robótica y edge computing: en plataformas como Jetson o Raspberry Pi, el modelo puede ejecutarse localmente para tareas de navegación asistida por visión o control de calidad visual en líneas de producción, sin depender de la nube.
- Educación y tutoría personalizada: el modelo puede actuar como tutor interactivo que explica conceptos a partir de imágenes de libros de texto o diagramas, adaptándose al idioma del estudiante y manteniendo conversaciones contextualmente coherentes gracias a su largo contexto.

## Benchmarks y rendimiento

La model card proporciona resultados comparativos en modo non-thinking para varios benchmarks de lenguaje:

| Benchmark | Qwen3-4B-2507 | Qwen3-1.7B | Qwen3.5-2B | Qwen3.5-0.8B |
|---|---|---|---|---|
| MMLU-Pro | 69,6 | 40,2 | 55,3 | 29,7 |
| MMLU-Redux | 84,2 | 64,4 | 69,2 | 48,5 |
| C-Eval | 80,2 | 61,0 | 65,2 | 46,4 |

En benchmarks multimodales, según fuentes externas, el modelo obtiene MathVista 62,2 y OCRBench 74,5. No se han publicado resultados adicionales de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: aproximadamente 1,6 GB en precisión completa (FP16), según fuentes externas. Con cuantización 4-bit cabe en dispositivos móviles.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM (GTX 1650, RTX 3050, etc.). Para despliegue en borde, funciona en Jetson y SoCs móviles (Qualcomm).
- Compatibilidad con GPU de consumo: sí, cabe en la mayoría de GPUs consumer actuales, incluso en iGPUs con cuantización.
- Opciones de despliegue: Hugging Face Transformers, vLLM, SGLang, KTransformers, llama.cpp, Ollama (comando `ollama run qwen3.5:0.8b`), Qualcomm AI Hub.
- Latencia y throughput: no disponible. Dado el tamaño del modelo, se espera una latencia inferior a 50 ms por token en GPUs modernas, pero no hay datos oficiales publicados.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | MMLU-Pro | MMLU-Redux | Licencia |
|---|---|---|---|---|---|
| Qwen3.5-0.8B | 0,8B | 262K | 29,7 | 48,5 | Apache 2.0 |
| Qwen3-1.7B | 1,7B | no disponible | 40,2 | 64,4 | Apache 2.0 |
| Qwen3.5-2B | 2B | no disponible | 55,3 | 69,2 | Apache 2.0 |
| Qwen3-4B-2507 | 4B | no disponible | 69,6 | 84,2 | Apache 2.0 |

El modelo es claramente inferior en rendimiento de lenguaje a sus hermanos mayores, como es esperable por su tamaño. Sin embargo, su ventaja competitiva reside en la eficiencia: es el único de la comparativa con soporte multimodal nativo y contexto de 262K tokens, lo que lo hace adecuado para tareas de visión y contexto largo en dispositivos con recursos limitados.

## Limitaciones y advertencias

- Rendimiento limitado en tareas de código: fuentes externas indican que la precisión en generación de código es débil, recomendando modelos superiores (Qwen3.5-4B o mayor) para tareas de programación.
- Sesgos y alucinaciones: como todo modelo de lenguaje pequeño, es más propenso a alucinaciones y a reflejar sesgos presentes en sus datos de entrenamiento. Se recomienda validación humana en aplicaciones críticas.
- Información incompleta en la model card: no se especifican detalles sobre el dataset de entrenamiento, el proceso de fine-tuning ni los resultados completos de benchmarks, lo que dificulta una evaluación exhaustiva.
- Riesgo de sobreajuste en fine-tuning: al ser un modelo pequeño, el fine-tuning con datasets reducidos puede provocar pérdida de capacidades generales.
- Soporte de vídeo no verificado: aunque la arquitectura soporta entrada de vídeo, no hay ejemplos ni benchmarks publicados que confirmen su rendimiento real en esta modalidad.
- Sin garantías de soporte a largo plazo: al ser un modelo de la serie Qwen3.5, es posible que el soporte y las actualizaciones se centren en los modelos más grandes de la familia.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/CrowdMind/Qwen3.5-0.8B
- Modelo base Qwen/Qwen3.5-0.8B: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Blog oficial de Qwen3.5: https://qwen.ai/blog?id=qwen3.5
- Página en Ollama: https://ollama.com/library/qwen3.5:0.8b
- Qualcomm AI Hub: https://aihub.qualcomm.com/mobile/models/qwen3_5_0_8b
- Jetson AI Lab: https://www.jetson-ai-lab.com/models/qwen3-5-0-8b/
- Artículo de análisis y benchmark: https://codersera.com/blog/run-and-benchmark-qwen35-08b/
- Ficha en Awesome Agents: https://awesomeagents.ai/models/qwen-3-5-0-8b/
