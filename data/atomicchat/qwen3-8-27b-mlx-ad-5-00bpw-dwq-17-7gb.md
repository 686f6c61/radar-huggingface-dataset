# AtomicChat/Qwen3.8-27B-MLX-AD-5.00bpw-DWQ-17.7GB

## Resumen
El modelo AtomicChat/Qwen3.8-27B-MLX-AD-5.00bpw-DWQ-17.7GB es una conversión al formato MLX (Apple Silicon) del modelo Qwen3.8-27B, desarrollado por el equipo Qwen de Alibaba. Se trata de un modelo multimodal denso (imagen y texto) orientado a tareas de codificación, razonamiento complejo, automatización de oficina y flujos agénticos de largo horizonte. La versión original dispone de una ventana de contexto nativa de 262.000 tokens y razonamiento configurable.

Este repositorio concreto ofrece pesos cuantizados a 5 bits por peso (AD-5.00bpw) con doble cuantización de pesos (DWQ), lo que reduce el tamaño del archivo a 17,8 GB para facilitar su ejecución en hardware de Apple con MLX. Cabe señalar una discrepancia relevante: aunque el nombre del modelo sugiere 27B de parámetros, los archivos safetensors contienen 5.034.265.840 parámetros, lo que indica que o bien se trata de una versión parcial o bien el etiquetado es incorrecto. No se han publicado métricas de rendimiento ni detalles de entrenamiento en esta ficha.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (visión y texto), denso |
| Parametros totales | 5.034.265.840 (según safetensors) — discrepancia con el nombre que indica 27B |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 262.144 tokens (dato del modelo base, no confirmado para esta versión) |
| Tipos de cuantizacion | 5.00 bpw con doble cuantización de pesos (DWQ) |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors (formato MLX) |

## Arquitectura y entrenamiento

La arquitectura subyacente corresponde al modelo Qwen3.8-27B de Alibaba, un transformer multimodal denso que combina un codificador de visión con un decodificador de lenguaje. El modelo original fue entrenado por el equipo Qwen con técnicas de entrenamiento estándar para modelos de lenguaje y visión, incluyendo ajuste fino supervisado y alineación con preferencias humanas. La ventana de contexto nativa de 262K tokens permite procesar documentos largos y conversaciones extensas. La versión MLX aquí presentada no es un entrenamiento nuevo, sino una conversión de pesos utilizando la librería mlx-lm (versión 0.31.3), con cuantización de 5 bits y doble cuantización de pesos para reducir el uso de memoria.

## Capacidades

- Generación de texto y diálogo conversacional.
- Razonamiento de pasos múltiples y modo de razonamiento configurable (el modelo puede producir cadenas de razonamiento antes de la respuesta final).
- Comprensión y procesamiento de imágenes (entrada multimodal imagen-texto).
- Generación de código y soporte para tareas de programación.
- Capacidad para flujos agénticos de largo horizonte, incluyendo tool calling y planificación.
- Multilingüe (aunque no se especifican idiomas concretos en la ficha).
- Soporte de contexto largo (262K tokens) para documentos extensos y conversaciones prolongadas.

## Casos de uso

- **Automatización de oficina**: el modelo puede generar informes, redactar correos, resumir documentos largos y procesar formularios con entrada visual, aprovechando su contexto de 262K tokens para manejar documentos completos.
- **Asistencia en programación**: integrado en un IDE o pipeline de CI/CD, puede generar código, explicar fragmentos o autocompletar funciones, gracias a su entrenamiento en tareas de codificación.
- **Agentes autónomos de investigación**: su capacidad de razonamiento de pasos y de manejo de contexto largo permite a un agente analizar múltiples fuentes, planificar acciones y ejecutar herramientas (tool calling) en entornos de investigación.
- **Análisis de documentos técnicos**: al aceptar entrada de imagen y texto, puede extraer información de capturas de pantalla, diagramas o documentos escaneados y generar resúmenes estructurados.
- **Chatbots de soporte técnico**: con una ventana de contexto de 262K tokens, puede mantener conversaciones largas sin perder el hilo y ofrecer respuestas precisas sobre documentación técnica extensa.
- **Procesamiento de facturas y formularios**: combina visión y texto para leer imágenes de facturas y extraer campos relevantes, automatizando tareas administrativas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks para esta versión cuantizada ni para el modelo base en la información disponible. La página del modelo original (Qwen/Qwen3.8-27B) menciona una evaluación de MathVision, pero no se proporcionan números concretos en los resultados de búsqueda. Por tanto, no se pueden presentar tablas comparativas con datos verificados.

## Requisitos de hardware

- **VRAM estimada**: el tamaño del repo es de 17,8 GB, por lo que se requiere al menos esa cantidad de memoria unificada en Apple Silicon (por ejemplo, Mac con 32 GB o más para dejar espacio para el sistema).
- **GPU recomendadas**: diseñado para Apple Silicon (M1, M2, M3, M4) con MLX; no apto para GPUs NVIDIA de forma nativa, aunque se podría convertir a otros formatos.
- **Compatibilidad**: solo funciona con Apple Silicon (M1/M2/M3/M4) mediante la librería mlx-lm.
- **Opciones de despliegue**: se puede ejecutar con `mlx-lm` en Python; también se puede convertir a GGUF para usar con llama.cpp u Ollama, pero no viene en ese formato.
- **Latencia y throughput**: no se proporcionan datos. Se espera que la cuantización de 5 bits reduzca la memoria y aumente la velocidad en hardware Apple, pero no hay cifras concretas.

## Comparativa con modelos similares

No se dispone de información suficiente para comparar este modelo con alternativas de la misma categoría. El modelo base Qwen3.8-27B compite con otros modelos multimodales de código abierto como Llama-3.2-Vision o Qwen2-VL, pero no se han publicado resultados comparativos en esta ficha. No se puede proporcionar una tabla comparativa con datos verificados.

## Limitaciones y advertencias

- **Discrepancia de parámetros**: el nombre indica 27B pero los pesos reales son 5B; esto puede deberse a un error en la etiqueta o a una versión parcial. Se recomienda verificar el modelo base antes de usarlo en producción.
- **Información escasa**: no se han publicado detalles sobre el entrenamiento, el dataset o las técnicas de alineación de esta versión.
- **Riesgo de alucinación**: como cualquier modelo de lenguaje, puede generar contenido plausible pero incorrecto, especialmente en tareas de razonamiento o datos no vistos.
- **Limitación de idioma**: aunque se presume multilingüe, no se especifican los idiomas soportados.
- **Licencia Apache-2.0**: permite uso comercial, pero hay que revisar los términos de los pesos del modelo base (Qwen3.8-27B) que también es Apache-2.0.
- **No apto para GPU NVIDIA**: la conversión MLX es específica de Apple Silicon; para otros entornos habría que reexportar los pesos.

## Enlaces

- [Repositorio HuggingFace del modelo](https://huggingface.co/AtomicChat/Qwen3.8-27B-MLX-AD-5.00bpw-DWQ-17.7GB)
- [Modelo base Qwen/Qwen3.8-27B](https://huggingface.co/Qwen/Qwen3.8-27B)
- [GitHub del modelo Qwen3.8-27B](https://github.com/AlibabaCloud-Official/Qwen3.8-27B)
- [Guía de ejecución local en Unsloth](https://unsloth.ai/docs/models/qwen3.8)
- [Ficha en LM Studio](https://lmstudio.ai/models/qwen3.8)
- [Colección AtomicChat de Qwen3.8-27B](https://huggingface.co/collections/AtomicChat/qwen-38-27b)
