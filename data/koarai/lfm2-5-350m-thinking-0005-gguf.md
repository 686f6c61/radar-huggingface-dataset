# KoarAI/LFM2.5-350M-Thinking-0005-GGUF

## Resumen

El modelo LFM2.5-350M-Thinking-0005-GGUF es una versión cuantizada en formato GGUF del modelo base KoarAI/LFM2.5-350M-Thinking-0005, desarrollado por KoarAI sobre la arquitectura LFM2 de Liquid AI. Se trata de un modelo de lenguaje compacto de 353 millones de parámetros, diseñado específicamente para razonamiento con cadena de pensamiento (Chain-of-Thought) nativa, lo que le permite resolver tareas que requieren pasos intermedios de lógica, como problemas matemáticos o preguntas de comprensión. Su tamaño reducido y su eficiencia lo hacen apto para inferencia local en CPU, Vulkan y Apple Metal mediante llama.cpp, sin necesidad de hardware especializado.

La relevancia de este modelo radica en su capacidad para ofrecer razonamiento avanzado en un paquete extremadamente ligero, lo que abre casos de uso en dispositivos de borde, aplicaciones móviles y entornos con recursos limitados. Según el blog de Liquid AI, la familia LFM2.5 se ha pre-entrenado con 28 billones de tokens y ha pasado por un proceso de aprendizaje por refuerzo a gran escala, lo que mejora su rendimiento en tareas de razonamiento frente a modelos de tamaño similar. La versión GGUF aquí descrita incluye dos cuantizaciones (FP16 y Q8_0) y está pensada para su integración con herramientas como llama.cpp y Ollama.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LFM2 (híbrida, optimizada para dispositivos) |
| Parametros totales | 353.322.752 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 125.000 tokens (según llm-explorer.com) |
| Tipos de cuantizacion | FP16, Q8_0 |
| Idiomas soportados | Ruso, inglés |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (safetensors para el modelo base) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura LFM2 de Liquid AI, una familia de modelos híbridos diseñados para ejecutarse eficientemente en dispositivos de borde. Aunque no se han publicado detalles técnicos completos sobre la arquitectura interna, se sabe que combina mecanismos de atención eficientes con capas de procesamiento optimizadas para reducir el coste computacional. El modelo base LFM2.5-350M-Thinking-0005 fue pre-entrenado con 28 billones de tokens (frente a los 10 billones de la versión anterior) y posteriormente refinado mediante aprendizaje por refuerzo a gran escala, lo que le confiere capacidades de razonamiento paso a paso. La versión GGUF aquí presentada es una conversión directa de los pesos originales, sin modificaciones en el entrenamiento.

## Capacidades

- Generación de texto en ruso e inglés con fluidez y coherencia.
- Razonamiento con cadena de pensamiento (CoT) nativa, capaz de descomponer problemas complejos en pasos intermedios.
- Resolución de problemas matemáticos y lógicos básicos, como el ejemplo de contar letras en una palabra.
- Conversación multi-turno gracias a su formato de chat (tags `conversational` y `endpoints_compatible`).
- Inferencia local en CPU, Vulkan y Apple Metal mediante llama.cpp, sin necesidad de GPU dedicada.
- Compatibilidad con Ollama para despliegue rápido en entornos de desarrollo.

## Casos de uso

- Asistentes conversacionales en dispositivos móviles: el modelo puede gestionar diálogos en ruso o inglés con razonamiento básico, funcionando completamente offline gracias a su tamaño reducido y su compatibilidad con llama.cpp.
- Educación y tutoría: su capacidad de razonamiento paso a paso permite explicar soluciones a problemas matemáticos o de lógica, útil en aplicaciones de aprendizaje autónomo.
- Procesamiento de texto en tiempo real: al ser tan ligero, puede integrarse en pipelines de análisis de texto en servidores de baja capacidad o en entornos edge.
- Chatbots de atención al cliente en ruso e inglés: con un contexto de 125K tokens, puede mantener conversaciones largas y recordar información relevante de la interacción.
- Generación de código básico: aunque no está especializado, puede producir fragmentos de código sencillos o explicar algoritmos, útil en entornos de desarrollo con recursos limitados.
- Prototipado rápido de aplicaciones de IA: su formato GGUF y su compatibilidad con Ollama permiten probar funcionalidades de razonamiento en entornos de desarrollo sin infraestructura compleja.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del autor no incluye métricas como MMLU, HumanEval o GSM8K, y las fuentes externas consultadas tampoco proporcionan datos numéricos verificables. Se recomienda consultar el repositorio de HuggingFace del modelo base para futuras actualizaciones.

## Requisitos de hardware

- VRAM estimada: menos de 1 GB para la cuantización Q8_0 (380 MB) y alrededor de 709 MB para FP16, según el tamaño de los archivos.
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM (por ejemplo, NVIDIA GTX 1050 Ti, RTX 2050) o incluso integradas con soporte Vulkan. También funciona en CPU sin GPU.
- Compatible con Apple Metal para Macs con chip M1 o superior.
- Opciones de despliegue: llama.cpp (llama-cli, llama-server), Ollama, y cualquier runtime que soporte GGUF.
- Latencia y throughput: no se han publicado mediciones oficiales, pero al ser un modelo de 350M, se espera una generación de decenas de tokens por segundo en CPU moderna y cientos en GPU.

## Comparativa con modelos similares

No se dispone de datos comparativos publicados entre este modelo y alternativas de la misma categoría (por ejemplo, Qwen2.5-0.5B o Llama-3.2-1B). Sin embargo, se puede señalar que LFM2.5-350M-Thinking-0005 se distingue por su enfoque en razonamiento CoT y su optimización para dispositivos de borde, mientras que otros modelos de tamaño similar suelen priorizar la generación generalista. La licencia Apache 2.0 permite uso comercial sin restricciones, algo que no todos los competidores ofrecen.

## Limitaciones y advertencias

- El modelo solo soporta ruso e inglés; no está entrenado para otros idiomas, lo que limita su uso en entornos multilingües amplios.
- Al ser un modelo de 350M, su capacidad de razonamiento es limitada en comparación con modelos más grandes; puede fallar en tareas complejas o producir alucinaciones.
- La longitud de contexto de 125K tokens es teórica; en la práctica, el rendimiento puede degradarse con contextos muy largos y el coste computacional aumenta.
- No se han publicado evaluaciones de sesgos o comportamientos dañinos; se recomienda auditar el modelo antes de usarlo en producción.
- La licencia Apache 2.0 permite uso comercial, pero el usuario es responsable de cumplir con las normativas de protección de datos si se usa con información personal.

## Enlaces

- Repositorio HuggingFace del modelo GGUF: https://huggingface.co/KoarAI/LFM2.5-350M-Thinking-0005-GGUF
- Repositorio HuggingFace del modelo base: https://huggingface.co/KoarAI/LFM2.5-350M-Thinking
- Blog de Liquid AI sobre LFM2.5-350M: https://www.liquid.ai/blog/lfm2-5-350m-no-size-left-behind
- Blog de Liquid AI sobre la familia LFM2.5: https://www.liquid.ai/blog/introducing-lfm2-5-the-next-generation-of-on-device-ai
- Ficha en llm-explorer.com: https://llm-explorer.com/model/KoarAI%2FLFM2.5-350M-Thinking,3oSFwVgtuWrLpNkkQ7qLeB
