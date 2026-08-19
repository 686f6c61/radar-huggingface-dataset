# google/gemma-4-26B-A4B-it-qat-q4_0-gguf

## Resumen

Gemma 4 26B A4B IT es un modelo de lenguaje multimodal desarrollado por Google DeepMind, perteneciente a la familia Gemma 4. Esta versión concreta es el checkpoint de instrucción (IT) optimizado mediante Quantization-Aware Training (QAT) y cuantizado a Q4_0 en formato GGUF, lo que reduce drásticamente los requisitos de memoria manteniendo una calidad cercana a la versión en bfloat16. El modelo acepta texto e imagen como entrada y genera texto, con una ventana de contexto de hasta 256K tokens y soporte multilingüe en más de 140 idiomas.

La arquitectura es de tipo Mixture-of-Experts (MoE) con 26.000 millones de parámetros totales, de los cuales solo 4.000 millones se activan por token (de ahí el nombre A4B). Esto lo hace adecuado para despliegue en GPU de consumo y estaciones de trabajo, manteniendo un rendimiento competitivo en razonamiento, generación de código y tareas agénticas. La versión QAT Q4_0 está diseñada para ser desplegada directamente con herramientas del ecosistema como llama.cpp, Ollama o vLLM, sin necesidad de cuantización posterior.

La relevancia de este modelo radica en que combina capacidades multimodales (visión), razonamiento configurable (modos de pensamiento), function calling nativo y una licencia Apache 2.0, todo ello en un tamaño que cabe en GPUs de consumo. Es una opción atractiva para desarrolladores que necesitan un modelo local potente sin depender de servicios en la nube.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE) con atención híbrida (sliding window + global) |
| Parametros totales | 25.233.142.046 (25,2B) |
| Parametros activos | 4.000 millones (A4B) |
| Longitud de contexto | 256K tokens |
| Tipos de cuantizacion | Q4_0 (GGUF), también disponible en bfloat16 y w4a16 (compressed tensors) |
| Idiomas soportados | Más de 140 idiomas (según la model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (Q4_0) |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura MoE con 26.000 millones de parámetros totales y 4.000 millones activos por token. La atención es híbrida: intercala capas de atención con ventana deslizante (sliding window) de 1024 tokens con capas de atención global, garantizando que la última capa sea siempre global. Esto reduce el coste computacional y la memoria en contextos largos sin sacrificar la capacidad de captar dependencias lejanas. Además, utiliza Keys y Values unificadas en las capas globales y aplica RoPE proporcional (p-RoPE) para optimizar la memoria en secuencias largas.

El entrenamiento se realizó con Quantization-Aware Training (QAT), una técnica que incorpora la cuantización durante el proceso de entrenamiento para que el modelo aprenda a compensar la pérdida de precisión. El checkpoint QAT Q4_0 extrae pesos en media precisión (bfloat16) del pipeline QAT, y esta versión GGUF ya está cuantizada a Q4_0, lista para su uso. No se han proporcionado detalles sobre el volumen de datos de entrenamiento ni la composición exacta del dataset, pero la familia Gemma 4 se entrena con un corpus multilingüe y multimodal extenso. La variante IT (instruction-tuned) ha sido ajustada con instrucciones y probablemente con técnicas de RLHF/DPO, aunque no se especifica en la información disponible.

## Capacidades

- Generación de texto y razonamiento: soporta modos de pensamiento configurables (thinking modes) para tareas complejas de razonamiento.
- Multimodalidad: acepta entrada de texto e imagen, con soporte para resolución y relación de aspecto variables.
- Codificación: mejoras significativas en benchmarks de código, con soporte nativo de function calling.
- Capacidades agénticas: diseñado para agentes autónomos multi-paso, con soporte de herramientas y llamadas a funciones.
- Sistema de prompts: soporte nativo del rol `system` para conversaciones estructuradas y controlables.
- Multilingüe: más de 140 idiomas soportados.
- Contexto largo: ventana de hasta 256K tokens, adecuada para documentos extensos y conversaciones multi-turno.

## Casos de uso

- Asistente de programación local: el modelo puede generar, revisar y refactorizar código en múltiples lenguajes, integrándose en editores o pipelines de CI/CD mediante su soporte de function calling y su capacidad de razonamiento multi-paso.
- Análisis de documentos largos: con 256K tokens de contexto, permite procesar libros técnicos, contratos o informes extensos en una sola pasada, extrayendo información y resumiendo secciones.
- Agente de atención al cliente: puede gestionar conversaciones multi-turno con contexto largo, manteniendo el hilo de la conversación y accediendo a bases de conocimiento mediante tool calling.
- Análisis de imágenes con texto: al ser multimodal, puede describir imágenes, extraer texto (OCR) o responder preguntas sobre contenido visual, útil en aplicaciones de documentación o accesibilidad.
- Desarrollo de agentes autónomos: su soporte nativo de system prompts y function calling lo hace adecuado para construir agentes que planifican, ejecutan acciones y razonan sobre los resultados, por ejemplo en automatización de tareas de oficina.
- Despliegue en edge/consumer hardware: gracias a la cuantización Q4_0 y a su arquitectura MoE con solo 4B activos, puede ejecutarse en una GPU de consumo (por ejemplo, RTX 4090) o incluso en laptops con suficiente VRAM, permitiendo inferencia local sin conexión.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card menciona mejoras en benchmarks de codificación y capacidades agénticas, pero no proporciona cifras concretas para este checkpoint específico.

## Requisitos de hardware

- VRAM estimada: el modelo cuantizado Q4_0 ocupa aproximadamente 13-14 GB en disco (45,7 GB es el tamaño del repo completo, que incluye múltiples archivos). Para inferencia, se recomienda al menos 16 GB de VRAM para caber en una GPU de consumo como RTX 4090 o RTX 4080.
- GPUs recomendadas: RTX 4090 (24 GB), RTX 4080 (16 GB), A100 (40 GB) o H100 (80 GB) para mayor velocidad y contexto largo. En GPUs con menos VRAM, se puede usar offloading de capas a CPU.
- Compatibilidad con consumer GPU: sí, cabe en GPUs de 16-24 GB, aunque con contexto máximo puede requerir más memoria.
- Opciones de despliegue: llama.cpp, Ollama, vLLM (con formato compressed-tensors), TGI, y cualquier runtime que soporte GGUF.
- Latencia y throughput: no se han proporcionado datos específicos, pero al ser MoE con 4B activos, la velocidad de generación es comparable a un modelo denso de 4B, aunque con mayor calidad.

## Comparativa con modelos similares

| Modelo | Parametros totales | Activos | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| Gemma 4 26B A4B IT (QAT Q4_0) | 25,2B | 4B | 256K | Apache 2.0 | GGUF |
| Gemma 3 27B IT | 27B | 27B (dense) | 128K | Gemma license | GGUF, safetensors |
| Qwen2.5 32B A3B | 32B | 3B | 128K | Apache 2.0 | GGUF, safetensors |

El modelo se posiciona como una alternativa MoE eficiente frente a modelos densos del mismo tamaño, ofreciendo mayor velocidad de inferencia y menor huella de memoria. Comparado con Qwen2.5 32B A3B, Gemma 4 añade multimodalidad (visión) y un contexto mayor (256K frente a 128K), aunque los benchmarks exactos no están disponibles para una comparación cuantitativa.

## Limitaciones y advertencias

- Sesgos y contenido dañino: como cualquier modelo de lenguaje, puede generar contenido sesgado o inapropiado. La model card menciona que se han implementado mecanismos de seguridad, pero no son infalibles.
- Alucinaciones: especialmente en tareas de razonamiento o con información factual, puede producir respuestas incorrectas o inventadas. Se recomienda verificación humana en aplicaciones críticas.
- Limitaciones de contexto: aunque soporta 256K tokens, el rendimiento puede degradarse en los extremos del contexto; se recomienda probar con la longitud real de uso.
- Idiomas: aunque declara más de 140 idiomas, el rendimiento puede variar significativamente entre ellos; los idiomas con menos representación pueden tener peor calidad.
- Uso comercial: la licencia Apache 2.0 permite uso comercial sin restricciones, pero es necesario revisar los términos específicos de la licencia de Gemma 4 (enlace en la model card) para asegurar cumplimiento.
- Compatibilidad con asistentes: si se usa decodificación especulativa con un modelo auxiliar, este debe ser también un checkpoint QAT con la misma precisión.

## Enlaces

- Hugging Face: https://huggingface.co/google/gemma-4-26B-A4B-it-qat-q4_0-gguf
- Checkpoint sin cuantizar: https://huggingface.co/google/gemma-4-26B-A4B-it-qat-q4_0-unquantized
- Blog de lanzamiento (QAT): https://blog.google/innovation-and-ai/technology/developers-tools/quantization-aware-training-gemma-4/
- Documentación de Gemma 4: https://ai.google.dev/gemma/docs/core
- Informe técnico (arXiv): https://arxiv.org/abs/2607.02770
- Página de Gemma 4 en DeepMind: https://deepmind.google/models/gemma/gemma-4/
- Colección de modelos QAT en Hugging Face: https://huggingface.co/collections/google/gemma-4-qat-q4-0
