# FlatFootInternational/Qwen3.8-27B-MLX-5bit

## Resumen

FlatFootInternational/Qwen3.8-27B-MLX-5bit es una conversión a formato MLX (Apple Silicon) del modelo Qwen3.8-27B, desarrollado por Alibaba Cloud y publicado originalmente por el equipo Qwen. Se trata de un modelo denso de 27 mil millones de parámetros con capacidades multimodales nativas (texto, imagen y vídeo), construido sobre la arquitectura de Qwen3.5. La versión MLX está cuantizada a 5 bits, lo que reduce el tamaño del repositorio a 19.4 GB y permite su ejecución en hardware de Apple con memoria unificada.

El modelo está licenciado bajo Apache-2.0, lo que facilita su uso comercial y su integración en productos. Su ventana de contexto nativa de 262.144 tokens lo hace adecuado para tareas de razonamiento largo, análisis de documentos extensos y agentes conversacionales complejos. Esta conversión MLX está pensada para desarrolladores que quieren ejecutar el modelo localmente en Macs con chips M1/M2/M3/M4 sin necesidad de GPUs NVIDIA, mediante la librería `mlx-vlm`.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso con encoder de visión (causal LM multimodal) |
| Parametros totales | 27 mil millones (modelo original); los safetensors del repo MLX 5-bit contienen 5.505.879.280 parámetros cuantizados |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 262.144 tokens (nativo) |
| Tipos de cuantizacion | 5-bit (MLX) |
| Idiomas soportados | no disponible en la model card; el modelo original soporta principalmente inglés, chino y otros idiomas, pero no se detalla |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B es un transformer causal denso con 64 capas, integrado con un encoder de visión para procesar imágenes y vídeo. Sigue la arquitectura de la serie Qwen3.5, que incorpora atención de ventana larga y técnicas de entrenamiento multimodal. Los detalles exactos de los datos de entrenamiento no están disponibles en la información proporcionada; se sabe que el modelo ha sido entrenado con una combinación de texto, imágenes y vídeo, y que se han aplicado métodos de alineación (RLHF/DPO) en el modelo original, aunque no se especifican en la model card de esta conversión.

La conversión MLX se realizó con `mlx-vlm` versión 0.6.16, que convierte los pesos originales a formato MLX con cuantización de 5 bits, optimizado para la aceleración de Apple Silicon. No se han aplicado cambios en la arquitectura ni en los pesos originales más allá de la cuantización.

## Capacidades

- Generación de texto multimodal: responde a instrucciones que combinan texto e imágenes, describiendo escenas, respondiendo preguntas visuales o razonando sobre contenido gráfico.
- Comprensión de vídeo: el modelo original soporta vídeo de hasta una hora de duración, lo que permite análisis de vídeo largo, resúmenes y extracción de información.
- Razonamiento de contexto largo: con 262.144 tokens de contexto nativo, puede procesar documentos extensos, libros completos o transcripciones largas sin perder el hilo.
- Soporte de tool calling / function calling: el modelo base Qwen3.8-27B incluye capacidades de agente y llamada a herramientas, aunque no se detalla en esta conversión.
- Capacidades multilingües: el modelo original cubre múltiples idiomas, aunque la lista exacta no está disponible en la documentación de esta conversión.
- Modo de razonamiento: el modelo base tiene un modo de "thinking" que puede activarse para tareas complejas, aunque no se menciona en la conversión MLX.

## Casos de uso

- Análisis de documentos técnicos extensos: el contexto de 262K tokens permite procesar manuales de ingeniería, papers científicos o contratos de cientos de páginas en una sola pasada, extrayendo resúmenes o respondiendo preguntas específicas.
- Asistente de accesibilidad para imágenes: puede describir imágenes a personas con discapacidad visual en tiempo real, generando descripciones detalladas de escenas, objetos y texto dentro de la imagen.
- Revisión de código con contexto de repositorio: al poder ingerir múltiples archivos de código y su documentación, el modelo puede identificar errores, sugerir refactorizaciones o generar documentación automáticamente.
- Transcripción y análisis de vídeo de formación: para empresas con bibliotecas de vídeos de entrenamiento, el modelo puede transcribir, resumir y extraer preguntas frecuentes de vídeos de hasta una hora.
- Chatbot de atención al cliente con conocimiento de base de datos visual: integrado en un sistema de mensajería, puede responder consultas que incluyan capturas de pantalla o fotos de productos, combinando comprensión visual con razonamiento de contexto largo.
- Automatización de oficina: el modelo puede generar informes a partir de imágenes de gráficos, tablas o capturas de pantalla de hojas de cálculo, y redactar correos o documentos basados en ese contenido.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks específicos para esta conversión MLX 5-bit. En la documentación del modelo original se menciona una evaluación en MathVision, pero no se proporcionan números concretos en la información disponible. Por tanto, no se puede ofrecer una tabla comparativa fiable. Para datos de rendimiento del modelo base, se recomienda consultar la model card de Qwen/Qwen3.8-27B en Hugging Face.

## Requisitos de hardware

- El modelo en formato MLX 5-bit ocupa 19.4 GB en disco, por lo que se recomienda al menos 24 GB de memoria unificada en Apple Silicon para cargar el modelo completo con espacio para activaciones y contexto.
- Para inferencia en Apple Silicon, se recomienda un Mac con chip M1 Pro, M2 Pro, M3 Pro o M4 Pro con 24 GB o más de RAM unificada. En chips básicos con 16 GB, es posible ejecutarlo con cuantización menor o limitando el contexto.
- No se puede ejecutar en GPUs NVIDIA directamente con este formato; para esos sistemas habría que usar la versión original en safetensors o GGUF.
- Opciones de despliegue: la librería `mlx-vlm` permite ejecución local desde la línea de comandos y también integración en aplicaciones Python. No se menciona soporte para vLLM, Ollama o llama.cpp en esta conversión.
- Latencia y throughput: no disponibles, pero se espera que en un Mac M3 Max con 64 GB se obtengan varios tokens por segundo en contexto largo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato |
|---|---|---|---|---|
| Qwen3.8-27B (original) | 27B | 262.144 tokens | Apache-2.0 | safetensors, GGUF |
| FlatFootInternational/Qwen3.8-27B-MLX-5bit | 27B (cuantizado 5-bit) | 262.144 tokens | Apache-2.0 | MLX safetensors |
| Qwen2.5-VL-27B | 27B | 128.000 tokens | Apache-2.0 | safetensors |
| Llama 3.2 90B (multimodal) | 90B | 128.000 tokens | Llama 3.2 license | safetensors |

Esta conversión MLX ofrece la ventaja de ejecutarse nativamente en Apple Silicon con menor huella de memoria que el modelo original en FP16, pero sacrifica algo de precisión por la cuantización. No hay datos de rendimiento comparativo entre estas versiones.

## Limitaciones y advertencias

- La cuantización a 5 bits puede degradar ligeramente la calidad en tareas de razonamiento matemático complejo o en la comprensión de imágenes con detalles finos, comparado con el modelo original en precisión completa.
- El modelo puede alucinar en contextos ambiguos o cuando se le pide información visual detallada que no está presente en la imagen.
- El contexto de 262k tokens es amplio pero el rendimiento se degrada con secuencias extremadamente largas, y la memoria necesaria para procesar el contexto completo es alta (especialmente en dispositivos con poca RAM unificada).
- No se ha publicado la lista de idiomas soportados, pero el modelo original está entrenado principalmente con inglés y chino, con menor rendimiento en otros idiomas.
- La licencia Apache-2.0 permite uso comercial, pero es necesario verificar que el modelo base Qwen3.8-27B no tenga restricciones adicionales de uso en el acuerdo de Alibaba Cloud (aunque la model card indica Apache-2.0).
- No hay garantía de que la conversión MLX mantenga exactamente el mismo comportamiento que el modelo original, especialmente en la parte de vídeo, ya que la cuantización puede afectar a la extracción de características visuales.
- La documentación de la conversión no incluye instrucciones de uso de herramientas ni de modo de razonamiento; hay que consultar la model card del modelo base para conocer las plantillas de prompt.

## Enlaces

- Repositorio Hugging Face de la conversión MLX: https://huggingface.co/FlatFootInternational/Qwen3.8-27B-MLX-5bit
- Modelo base original: https://huggingface.co/Qwen/Qwen3.8-27B
- Conversión MLX 6-bit (hermana): https://huggingface.co/FlatFootInternational/Qwen3.8-27B-mlx-6bit
- Repositorio GitHub de Qwen3.8-27B: https://github.com/AlibabaCloud-Official/Qwen3.8-27B
- Guía de ejecución local (2026): https://codersera.com/blog/how-to-run-qwen-3-8-locally-2026/
- Resumen y alternativas: https://www.aimodels.fyi/models/huggingFace/qwen3.8-27b-qwen
