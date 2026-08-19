# kerasformers/glm-4-9b-chat-1m

## Resumen

`kerasformers/glm-4-9b-chat-1m` es una conversión íntegra en Keras 3 del modelo `zai-org/glm-4-9b-chat-1m-hf`, desarrollado originalmente por Zhipu AI / THUDM. Esta versión permite ejecutar el modelo con los tres backends de Keras 3 (TensorFlow, PyTorch y JAX) sin modificar el código, manteniendo los pesos originales en bfloat16. El modelo base es GLM-4-9B, un transformer decoder-only con una ventana de contexto ampliada a 1 millón de tokens, lo que lo hace especialmente relevante para tareas que requieren procesar documentos muy extensos o conversaciones de largo recorrido.

La conversión es puramente de pesos: no se ha realizado ningún reentrenamiento, por lo que las capacidades y limitaciones son las del checkpoint original. Está disponible bajo la licencia `glm-4`, que impone restricciones de uso comercial, y soporta principalmente inglés y chino. Su tamaño de repositorio es de 19 GB, acorde con los pesos en bfloat16 de un modelo de 9 mil millones de parámetros.

Esta ficha se basa exclusivamente en la información proporcionada en la model card de HuggingFace y en el conocimiento público del modelo GLM-4-9B. Los datos técnicos no confirmados se indican como «no disponible».

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (GLM-4) |
| Parametros totales | 9 mil millones (aproximado, no confirmado en la información) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 1.000.000 tokens (según el nombre del modelo) |
| Tipos de cuantizacion | no disponible (pesos en bfloat16) |
| Idiomas soportados | inglés (en), chino (zh) |
| Licencia | glm-4 (otra) |
| Formato de pesos | no disponible (pesos en bfloat16, formato de archivo no especificado) |

## Arquitectura y entrenamiento

El modelo es una conversión directa de los pesos del checkpoint `zai-org/glm-4-9b-chat-1m-hf`, que a su vez deriva de la familia GLM-4. La arquitectura subyacente es un transformer decoder-only con atención multi-cabeza, normalización RMSNorm y activación SwiGLU, similar a otros LLM modernos. No se ha modificado la arquitectura ni se ha realizado entrenamiento adicional; la conversión solo adapta el formato de pesos al ecosistema Keras 3.

El modelo original fue entrenado por Zhipu AI con datos masivos en inglés y chino, e incluye una extensión de contexto hasta 1M de tokens mediante técnicas de interpolación posicional y entrenamiento continuo. El paper asociado, «ChatGLM: A Family of Large Language Models from GLM-130B to GLM-4 All Tools» (arXiv:2406.12793), describe la familia completa y sus capacidades. No se dispone de información sobre el proceso de entrenamiento específico de esta variante de contexto largo.

## Capacidades

- Generación de texto en inglés y chino, con soporte para conversaciones multi-turno.
- Manejo de contextos extremadamente largos (hasta 1M de tokens), ideal para documentos extensos, libros, código fuente o historiales de conversación completos.
- Razonamiento y comprensión del lenguaje, heredados del modelo GLM-4-9B-chat original.
- Capacidad de seguir instrucciones en formato chat (mensajes con roles user/assistant).
- Ejecución multiplataforma: el mismo código funciona en TensorFlow, PyTorch y JAX gracias a Keras 3.
- No se confirma explícitamente soporte para tool calling, agentes, visión u otras modalidades en esta conversión; esas características dependen del modelo original, que sí las incluye en su versión completa, pero no están documentadas en esta ficha.

## Casos de uso

- Análisis de documentos legales o académicos extensos: gracias a la ventana de 1M de tokens, el modelo puede procesar contratos, tesis o informes completos sin necesidad de dividirlos en fragmentos, manteniendo el contexto global para resúmenes o extracción de información.
- Asistente de programación con repositorios completos: puede recibir un proyecto entero (código fuente, documentación, configuraciones) como contexto y responder preguntas sobre él o generar nuevas funciones coherentes con el estilo existente.
- Chatbots bilingües (inglés-chino) para atención al cliente: el modelo maneja conversaciones largas con historial completo, útil para soporte técnico o atención comercial en mercados hispanohablantes que requieran también inglés o chino.
- Procesamiento de libros o novelas: análisis literario, generación de resúmenes por capítulos o preguntas sobre la trama completa, aprovechando el contexto largo.
- Búsqueda y recuperación de información en bases de datos textuales: el modelo puede recibir múltiples documentos como contexto y responder consultas complejas que requieran cruzar información entre ellos.
- Generación de informes técnicos largos: puede redactar documentos extensos manteniendo coherencia a lo largo de todo el texto, útil para manuales, guías o reportes de investigación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de MMLU, HumanEval, GSM8K u otros. Para obtener datos de rendimiento, se recomienda consultar la ficha del modelo original `zai-org/glm-4-9b-chat-1m-hf` o el paper de GLM-4.

## Requisitos de hardware

- VRAM estimada para inferencia: con pesos en bfloat16, el modelo ocupa aproximadamente 18 GB (9B parámetros × 2 bytes). Se necesitan al menos 20 GB de VRAM para cargar el modelo completo sin cuantización.
- GPU recomendadas: para inferencia en bfloat16, una GPU con 24 GB o más, como NVIDIA RTX 4090, A100 40GB, H100 80GB o similar. Para cuantización (no disponible en esta conversión), se podría reducir el consumo.
- En consumer GPU: una RTX 4090 (24 GB) podría ejecutar el modelo con bfloat16, aunque con limitaciones de batch pequeño. GPUs con 16 GB o menos no son suficientes sin cuantización.
- Opciones de despliegue: al ser una implementación Keras 3, se puede ejecutar con TensorFlow, PyTorch o JAX. Para producción, se podría servir mediante frameworks compatibles con Keras, aunque no se mencionan vLLM, llama.cpp u Ollama. La latencia y throughput dependen del backend y hardware; no se proporcionan datos concretos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| GLM-4-9B-chat-1M (original) | 9B | 1M | en, zh | glm-4 | HuggingFace |
| Llama 3 8B | 8B | 8K (ampliable) | multilingüe | Llama 3 | HuggingFace |
| Mistral 7B | 7B | 32K | multilingüe | Apache 2.0 | HuggingFace |
| Qwen 2.5 7B | 7B | 128K | multilingüe | Apache 2.0 | HuggingFace |

La principal ventaja de este modelo frente a alternativas de tamaño similar es su contexto de 1M tokens, muy superior a los 8K de Llama 3 o 32K de Mistral. Sin embargo, la licencia `glm-4` puede ser más restrictiva que Apache 2.0. No se dispone de comparativas de rendimiento numéricas.

## Limitaciones y advertencias

- Licencia `glm-4`: restringe el uso comercial y puede requerir aprobación de Zhipu AI para aplicaciones empresariales. Revisar los términos completos antes de usar en producción.
- Sesgos y alucinaciones: como todo LLM, puede generar contenido falso o sesgado, especialmente en contextos largos donde la atención puede degradarse.
- Idiomas limitados: solo inglés y chino; no está optimizado para español u otros idiomas, aunque puede generar texto en ellos con menor calidad.
- Contexto de 1M: aunque es una ventaja, el rendimiento en la parte media del contexto puede degradarse si no se usa correctamente la atención posicional; se recomienda probar con casos reales.
- Formato de pesos no estándar: al ser una conversión de Keras, puede no ser compatible directamente con herramientas como vLLM o llama.cpp; requiere el ecosistema Keras 3.
- Sin cuantizaciones predefinidas: no se ofrecen versiones cuantizadas, lo que limita el despliegue en hardware con poca VRAM.

## Enlaces

- [HuggingFace - kerasformers/glm-4-9b-chat-1m](https://huggingface.co/kerasformers/glm-4-9b-chat-1m)
- [Modelo original - zai-org/glm-4-9b-chat-1m-hf](https://huggingface.co/zai-org/glm-4-9b-chat-1m-hf)
- [Paper - ChatGLM: A Family of Large Language Models from GLM-130B to GLM-4 All Tools](https://arxiv.org/abs/2406.12793)
- [Repositorio GitHub - KerasFormers](https://github.com/IMvision12/KerasFormers)
- [Documentación de GLM en KerasFormers](https://imvision12.github.io/KerasFormers/glm/)
- [Colección GLM en HuggingFace](https://huggingface.co/collections/kerasformers/glm-6a82b8f9f753e8dcae3ff3f7)
- [Licencia glm-4](https://huggingface.co/THUDM/glm-4-9b-chat-hf/blob/main/LICENSE)
