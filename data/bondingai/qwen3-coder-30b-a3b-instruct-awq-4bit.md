# BondingAI/Qwen3-Coder-30B-A3B-Instruct-AWQ-4bit

## Resumen

Qwen3-Coder-30B-A3B-Instruct-AWQ-4bit es una versión cuantizada a 4 bits mediante AWQ del modelo Qwen3-Coder-30B-A3B-Instruct, desarrollado originalmente por el equipo Qwen de Alibaba. La cuantización la firma BondingAI (con la model card apuntando a la infraestructura cyan.kiwi), y su objetivo es reducir el peso del modelo de ~61 GB en bf16 a 18,09 GB, permitiendo desplegarlo en GPUs con menos VRAM sin renunciar a la ventana de contexto nativa de 262.144 tokens.

El modelo base es un transformer de tipo Mixture-of-Experts (MoE) con 30.500 millones de parámetros totales y 3.300 millones activos por token, 48 capas y 128 expertos (8 activados). Está especializado en tareas de código y uso agéntico: generación de código, navegación web automatizada, function calling y comprensión de repositorios completos gracias a su contexto largo, extensible hasta 1M tokens con Yarn.

Su relevancia práctica radica en que combina un modelo de código de gama alta con un formato de pesos comprimido (compressed-tensors) que lo hace viable en entornos con recursos limitados. La licencia Apache 2.0 permite uso comercial sin restricciones adicionales, lo que lo convierte en una opción atractiva para pipelines de CI/CD, asistentes de código y agentes autónomos en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal con Mixture-of-Experts (qwen3_moe) |
| Parametros totales | 30.500 millones (30,5B) |
| Parametros activos | 3.300 millones (3,3B) por token |
| Longitud de contexto | 262.144 tokens nativos; extensible a 1M con Yarn |
| Tipos de cuantizacion | AWQ 4-bit (compressed-tensors); repo de 18,09 GB |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (compressed-tensors), compatible con transformers |

## Arquitectura y entrenamiento

El modelo base emplea una arquitectura de transformer causal con capas MoE: 48 capas, 128 expertos por capa con 8 expertos activados por token, y atención con Grouped-Query Attention (32 cabezas para Q y 4 para KV). Esta configuración reduce el coste computacional por token a los 3,3B parámetros activos, manteniendo la capacidad representacional de un modelo de 30,5B. El modelo fue entrenado en dos fases (pretraining y post-training) por el equipo Qwen; la model card no detalla el número de tokens, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO.

La versión aquí descrita aplica cuantización AWQ (Activation-aware Weight Quantization) mediante la herramienta llm-compressor del proyecto vLLM, usando como conjunto de calibración el dataset nvidia/Llama-Nemotron-Post-Training-Dataset. El resultado se distribuye en formato compressed-tensors, lo que permite cargarlo con transformers y desplegarlo en vLLM. Una innovación destacable del modelo base es su formato de function call especialmente diseñado para plataformas agénticas como Qwen Code y CLINE, así como el soporte nativo de contexto largo orientado a comprensión a escala de repositorio.

## Capacidades

- Generación de código en múltiples lenguajes y resolución de problemas de programación.
- Razonamiento agéntico de múltiples pasos (agentic coding y agentic browser-use).
- Soporte de tool calling / function calling con un formato dedicado.
- Integración con plataformas de agentes como Qwen Code y CLINE.
- Comprensión de repositorios completos gracias a los 262.144 tokens de contexto nativo (hasta 1M con Yarn).
- Modo no-thinking: el modelo no genera bloques `<think></think>` y no requiere `enable_thinking=False`.
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Asistente de código en IDE: integrado mediante CLINE o extensiones similares, el modelo puede leer contexto amplio del repositorio y proponer parches multiarchivo gracias a su ventana de 262K tokens.
- Generación de código en producción y CI/CD: su soporte de function calling permite conectarlo a pipelines que ejecutan tests, aplican parches y validan cambios de forma automatizada.
- Agentes autónomos de navegación web: el modelo está optimizado para agentic browser-use, por lo que puede operar herramientas de navegación y extracción de datos en flujos multi-paso.
- Refactorización de repositorios grandes: con contexto extensible a 1M tokens, puede analizar y reescribir módulos completos manteniendo coherencia entre archivos.
- Atención al cliente técnica: un asistente multi-turno que consulta documentación y APIs mediante tool calling, aprovechando el contexto largo para conservar el historial de la conversación.
- Despliegue en hardware limitado: al ocupar 18,09 GB en 4 bits, cabe en una única GPU de 24 GB, lo que permite servir el modelo en estaciones de trabajo o instancias cloud económicas.
- Generación de documentación y tests a partir de código fuente: el modelo puede recorrer un repositorio y producir documentación o suites de pruebas coherentes con el contexto completo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del modelo base menciona "significant performance among open models on Agentic Coding, Agentic Browser-Use" sin cifras concretas, y no se proporcionan tablas comparativas para esta versión cuantizada.

## Requisitos de hardware

- VRAM estimada para inferencia: ~18-20 GB en AWQ 4-bit (pesos de 18,09 GB más overhead de KV cache).
- GPU recomendadas: A100 40/80 GB, H100, L40S, RTX 4090 (24 GB) para despliegue en una sola GPU.
- Cabe en GPU de consumo: sí, en RTX 4090 (24 GB) y RTX 3090 (24 GB); en GPUs de 16 GB requeriría reducir contexto o usar offloading.
- Opciones de despliegue: vLLM (recomendado por el formato compressed-tensors), transformers con la versión reciente que soporte `qwen3_moe` (≥4.51.0), y endpoints compatibles indicados en los tags.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Activos | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| Qwen3-Coder-30B-A3B-Instruct-AWQ-4bit (este) | 30,5B | 3,3B | 262K (1M con Yarn) | Apache 2.0 | safetensors 4-bit |
| Qwen3-Coder-30B-A3B-Instruct (base) | 30,5B | 3,3B | 262K (1M con Yarn) | Apache 2.0 | safetensors bf16 |
| Alternativas de otros fabricantes | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparación con modelos de otros fabricantes no está disponible en la información proporcionada; la única referencia fiable es el modelo base sin cuantizar, del que esta versión hereda arquitectura y capacidades con un footprint de memoria aproximadamente tres veces menor.

## Limitaciones y advertencias

- Al ser una cuantización AWQ 4-bit, puede existir una degradación de calidad respecto al modelo base en tareas sensibles a la precisión numérica; no se han publicado evaluaciones comparativas.
- El modelo no soporta modo thinking: no genera bloques `<think></think>`, lo que limita su uso en tareas que se beneficien de razonamiento explícito extendido.
- Riesgo de alucinación inherente a los modelos de lenguaje, especialmente en código con APIs poco comunes o recientes.
- Idiomas soportados no documentados en la información disponible; el rendimiento multilingüe más allá del inglés y el chino no está garantizado.
- La model card del repositorio cuantizado incluye referencias promocionales a cyan.kiwi y no documenta el proceso de evaluación de la cuantización ni métricas de degradación.
- Aunque la licencia es Apache 2.0, conviene verificar los términos del modelo base en el enlace de licencia oficial antes de un uso comercial a gran escala.
- El contexto de 262K tokens implica un consumo elevado de KV cache; en GPUs de 24 GB habrá que limitar la longitud efectiva de contexto o usar cuantización del cache.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/BondingAI/Qwen3-Coder-30B-A3B-Instruct-AWQ-4bit
- Modelo base: https://huggingface.co/Qwen/Qwen3-Coder-30B-A3B-Instruct
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3-Coder-30B-A3B-Instruct/blob/main/LICENSE
- Blog de Qwen3-Coder: https://qwenlm.github.io/blog/qwen3-coder/
- Repositorio GitHub: https://github.com/QwenLM/Qwen3-Coder
- Documentación: https://qwen.readthedocs.io/en/latest/
- Qwen Chat: https://chat.qwen.ai/
- Herramienta de cuantización llm-compressor: https://github.com/vllm-project/llm-compressor
- Dataset de calibración: https://huggingface.co/datasets/nvidia/Llama-Nemotron-Post-Training-Dataset
- Paper de referencia (arXiv:2505.09388): https://arxiv.org/abs/2505.09388
- Sitio del cuantizador: https://cyan.kiwi/
