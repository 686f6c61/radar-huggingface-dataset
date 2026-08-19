# AtomicChat/Ling-3.0-flash-GGUF

## Resumen

Ling-3.0-flash-GGUF es una colección de cuantizaciones GGUF del modelo Ling-3.0-flash, desarrollada por AtomicChat a partir del modelo base de InclusionAI (el laboratorio de IA de Ant Group). El modelo original es un MoE híbrido de 124.000 millones de parámetros totales con solo 5.100 millones activos por token, que combina atención lineal híbrida (bloques KDA y MLA) con un router de 512 expertos. Esta versión cuantizada permite ejecutar un modelo de esta escala en hardware de consumo o profesional con una pérdida de calidad mínima, gracias a una técnica de asignación de bits denominada Atomic Dynamic (AD) que coloca los bits de forma deliberada según el rol del tensor, la proyección y la profundidad de la red.

La relevancia de esta ficha radica en que ofrece una alternativa práctica para desplegar un modelo de razonamiento y agente de última generación en entornos con memoria limitada, manteniendo una fidelidad cercana al BF16. Las cuantizaciones AD se comparan con las generadas por `llama-quantize` estándar, mostrando una reducción de la divergencia KL de entre el 31 % y el 41 % al mismo tamaño. El modelo base soporta una ventana de contexto nativa de 256.000 tokens, ampliable hasta 1.000.000, e incluye modo de pensamiento y tool calling integrados en la plantilla de chat.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE híbrido con atención lineal (35 bloques KDA intercalados 5:1 con 7 bloques MLA gated) y 512 expertos |
| Parametros totales | 124.000 millones (124B) |
| Parametros activos | 5.100 millones (5.1B) |
| Longitud de contexto | 256.000 tokens nativo, extensible a 1.000.000 |
| Tipos de cuantizacion | AD-Q5_K_M, AD-Q4_K_S, AD-IQ4_XXS, AD-IQ3_M, AD-IQ2_M, AD-IQ1_S, NVFP4 (AD-NVFP4) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | GGUF (también safetensors para NVFP4) |

## Arquitectura y entrenamiento

El modelo base Ling-3.0-flash emplea una arquitectura de mezcla de expertos (MoE) con 512 expertos enrutados, de los cuales se activan aproximadamente 8 por token (5.1B activos de 124B totales). La atención es híbrida: combina 35 bloques de atención lineal KDA (Kernel-based Dynamic Attention) intercalados en una proporción 5:1 con 7 bloques de atención MLA (Multi-head Latent Attention) con puerta. Esta combinación reduce el coste computacional frente a la atención softmax completa, manteniendo la capacidad de modelar dependencias de largo alcance. El router (`ffn_gate_inp`) y el sesgo de expertos se mantienen en F32 en las cuantizaciones AD para no alterar la selección de expertos.

No se dispone de información detallada sobre el proceso de entrenamiento (número de tokens, composición del dataset, uso de RLHF o DPO) en los materiales proporcionados. La documentación del fabricante indica que es un modelo de razonamiento híbrido nativo, diseñado para tareas de agente y razonamiento multi-paso, pero los datos concretos de entrenamiento no están publicados en las fuentes consultadas.

## Capacidades

- Generación de texto y razonamiento multi-paso: el modelo está diseñado para tareas de razonamiento complejo, con un modo de pensamiento (thinking mode) incluido en la plantilla de chat.
- Tool calling / function calling: soportado de forma nativa, según la model card del GGUF.
- Capacidades de agente: al ser un modelo "agent-grade", puede encadenar llamadas a herramientas y mantener estado en conversaciones largas.
- Ventana de contexto extensa: 256K tokens nativos, ampliables a 1M, lo que permite procesar documentos largos o historiales de conversación extensos.
- Multilingüismo: no se especifican los idiomas soportados en la información disponible; el modelo base probablemente cubre varios idiomas, pero no hay confirmación.
- Compatibilidad con inferencia eficiente: gracias a la cuantización AD, se puede ejecutar en hardware con 32 GB de VRAM o más, con degradación controlada.

## Casos de uso

- Asistente de programación en producción: con tool calling y generación de código, puede integrarse en IDE o pipelines de CI/CD para revisión de código, generación de tests y autocompletado. Su ventana de 256K permite procesar repositorios completos.
- Análisis de documentos legales o financieros: la ventana de contexto larga permite resumir contratos extensos, extraer cláusulas relevantes y responder preguntas sobre múltiples documentos a la vez.
- Agente de atención al cliente multi-turno: el modo de pensamiento y la capacidad de razonamiento permiten mantener conversaciones coherentes con contexto largo, gestionando incidencias complejas sin perder el hilo.
- Generación de informes técnicos y documentación: puede redactar documentación a partir de código o especificaciones, con razonamiento estructurado y formato Markdown.
- Investigación académica: para análisis de literatura científica, resumen de papers y extracción de conclusiones, aprovechando la ventana de contexto amplia.
- Despliegue en entornos con GPU limitada: las cuantizaciones AD-IQ2_M o AD-IQ1_S permiten ejecutar el modelo en una sola GPU de 48 GB o 32 GB, respectivamente, para prototipado o aplicaciones donde la calidad no es crítica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La model card solo proporciona métricas de fidelidad de cuantización frente al modelo BF16, medidas sobre texto reservado y con hardware idéntico (4x RTX PRO 6000 Blackwell). Estas métricas se resumen a continuación:

| Cuantizacion | Tamano | Mean KL | Top-1 (solo NVFP4) |
|---|---|---|---|
| AD-Q5_K_M | 89.4 GB | 0.0242 | - |
| AD-Q4_K_S | 74.2 GB | 0.0318 | - |
| AD-IQ4_XXS | 69.3 GB | 0.0329 | - |
| AD-IQ3_M | 62.2 GB | 0.0481 | - |
| AD-IQ2_M | 49.1 GB | 0.0882 | - |
| AD-IQ1_S | 32.4 GB | 0.2452 | - |
| NVFP4 (estandar) | 72.3 GB | 0.0560 | 94.72 % |
| AD-NVFP4 | 72.3 GB | 0.0536 | 94.86 % |

La divergencia KL mide la distancia entre la distribución de probabilidad del modelo cuantizado y la del BF16; valores más bajos indican mayor fidelidad. No se dispone de comparativas con otros modelos de la misma categoría.

## Requisitos de hardware

- VRAM estimada para inferencia: según el archivo elegido, se necesita al menos la memoria indicada en la tabla de selección (dejando margen para el contexto). Por ejemplo, AD-Q5_K_M requiere unos 128 GB, AD-Q4_K_S unos 96 GB, AD-IQ4_XXS unos 80 GB, AD-IQ3_M unos 64 GB, AD-IQ2_M unos 48 GB y AD-IQ1_S unos 32 GB.
- GPUs recomendadas: para las cuantizaciones grandes, se sugieren configuraciones como Mac Studio (128 GB unificados) o 2x RTX 4090 (48 GB cada una). Para las medianas, H100 o A100 de 80 GB. Para las pequeñas, una RTX 4090 (24 GB) no es suficiente; se necesitan al menos 32 GB (por ejemplo, RTX 6000 Ada o A6000).
- Compatibilidad con GPU de consumo: solo la cuantización AD-IQ1_S (32 GB) podría caber en una GPU de consumo de gama alta con 32 GB, pero la calidad se degrada significativamente. Las demás requieren hardware profesional o múltiples GPUs.
- Opciones de despliegue: se necesita una build específica de llama.cpp con soporte TurboQuant (bailingmoe3), disponible en el repositorio de AtomicBot-ai. También hay versiones NVFP4 para vLLM (safetensors) y GGUF.
- Latencia y throughput: no se proporcionan datos de latencia o throughput en la información disponible.

## Comparativa con modelos similares

No se dispone de datos comparativos con otros modelos de la misma categoría (MoE híbridos de ~124B) en las fuentes consultadas. El modelo base Ling-3.0-flash compite con arquitecturas como DeepSeek-V3 o Qwen3-MoE, pero no hay métricas de rendimiento publicadas que permitan una comparación objetiva. Se recomienda consultar la documentación oficial de InclusionAI para obtener benchmarks de tareas.

## Limitaciones y advertencias

- Las cuantizaciones AD-IQ1_S y AD-IQ2_M presentan una degradación notable de calidad (KL de 0.2452 y 0.0882 respectivamente); la model card advierte que en IQ1_S "se espera un daño real".
- Los archivos sin el prefijo `AD-` (controles `*_STOCK` y `*_FLAT`) no están destinados a uso en producción; solo sirven para verificar la mejora de la técnica AD.
- Se requiere una build específica de llama.cpp (TurboQuant) con el parche `bailingmoe3`; las versiones estándar de llama.cpp pueden no ser compatibles con estos archivos.
- No se han publicado datos sobre sesgos, alucinaciones o limitaciones idiomáticas específicas del modelo base. Como todo modelo de lenguaje, existe riesgo de generar contenido incorrecto o inventado, especialmente en tareas de razonamiento complejo.
- La licencia MIT permite uso comercial sin restricciones, pero se recomienda verificar los términos del modelo base en el repositorio de InclusionAI.
- El tamaño del repositorio es de 3.7 TB, lo que implica un tiempo de descarga considerable y requiere planificación de almacenamiento.

## Enlaces

- Repositorio HuggingFace del GGUF: https://huggingface.co/AtomicChat/Ling-3.0-flash-GGUF
- Modelo base (inclusionAI/Ling-3.0-flash): https://huggingface.co/inclusionAI/Ling-3.0-flash
- Repositorio de builds TurboQuant: https://github.com/AtomicBot-ai/atomic-llama-cpp-turboquant/releases/b10269-1.5.1
- Documentación oficial de Ling: https://developer.ant-ling.com/en/docs/models/ling/
- Artículo sobre la arquitectura KDA: https://www.aimodeling.com/en/news/slug/inclusionai-ling-3-flash-hybrid-linear-moe-agent
- Dataset de métricas de cuantización: https://huggingface.co/datasets/AtomicChat/Ling-3.0-flash-GGUF-metrics
- Versión NVFP4 para vLLM: https://huggingface.co/AtomicChat/Ling-3.0-flash-NVFP4
- Versión NVFP4 en GGUF: https://huggingface.co/AtomicChat/Ling-3.0-flash-NVFP4-GGUF
