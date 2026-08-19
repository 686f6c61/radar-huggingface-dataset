# Sigmandndnns/CorX3.8-27B

## Resumen

CorX3.8-27B es un modelo de lenguaje desarrollado por el usuario Sigmandndnns, que consiste en un ajuste fino (fine-tuning) del modelo Qwen/Qwen3.8-27B mediante la técnica de Supervised Fine-Tuning (SFT) con la librería TRL de Hugging Face. El modelo base, Qwen3.8-27B, es un modelo denso de 27 000 millones de parámetros de tipo vision-language, orientado a tareas de codificación, trabajo profesional, investigación y tareas agénticas de horizonte largo, con una ventana de contexto nativa de 262 000 tokens. El ajuste fino se realizó con el framework Transformers y PyTorch, pero no se han publicado detalles sobre el conjunto de datos de entrenamiento ni los hiperparámetros empleados.

El repositorio del modelo ocupa aproximadamente 1,3 GB, lo que sugiere que podría tratarse de una versión cuantizada o de un subconjunto de los pesos originales, aunque no se especifica el tipo de cuantización. No se dispone de información sobre la licencia, los idiomas soportados ni los resultados de benchmarks específicos del modelo ajustado. La relevancia de este modelo radica en que hereda las capacidades del modelo base Qwen3.8-27B, que ha recibido atención por su rendimiento en tareas de visión y lenguaje, pero la falta de documentación y de evaluación independiente limita su uso en entornos de producción sin una validación previa.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (modelo base Qwen3.8-27B, vision-language) |
| Parametros totales | 27 000 millones (estimado a partir del nombre, no confirmado en la model card) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible (el modelo base soporta 262 000 tokens) |
| Tipos de cuantizacion | No disponible (el tamaño del repo sugiere posible cuantización, sin especificar) |
| Idiomas soportados | No disponible |
| Licencia | No disponible (el modelo base es Apache 2.0, pero el fine-tune no declara licencia) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo CorX3.8-27B es un ajuste fino del modelo Qwen3.8-27B, que emplea una arquitectura de transformer denso con capacidades multimodales (entrada de imagen y video). El modelo base incorpora un modo de razonamiento configurable y está diseñado para tareas agénticas de múltiples pasos, con soporte para herramientas y retroalimentación del entorno. El proceso de entrenamiento del fine-tune se llevó a cabo mediante SFT (Supervised Fine-Tuning) utilizando la librería TRL (versión 1.10.0) y Transformers 5.14.1. No se han publicado detalles sobre el dataset de entrenamiento, el número de tokens procesados, la duración del entrenamiento ni la aplicación de técnicas adicionales como RLHF o DPO. El repositorio indica que el entrenamiento se realizó con `generated_from_trainer`, lo que sugiere que se usó el flujo estándar de entrenamiento de Hugging Face, pero no se aportan más datos.

## Capacidades

Dado que se trata de un fine-tune del modelo Qwen3.8-27B, se espera que herede las capacidades del modelo base, aunque no hay evaluación específica para el modelo ajustado. Las capacidades documentadas del modelo base incluyen:

- Generación de texto y razonamiento complejo, con modo de pensamiento configurable (thinking mode).
- Comprensión de imágenes y video (entrada nativa de imagen y video).
- Codificación de software, incluyendo generación de código y resolución de problemas de programación.
- Soporte para tareas agénticas de largo horizonte, con planificación y ejecución de múltiples pasos.
- Manejo de herramientas y retroalimentación del entorno (tool calling y environment feedback).
- Ventana de contexto extensa de 262 000 tokens, adecuada para documentos largos y conversaciones multi-turno.

Sin embargo, no se ha verificado que el fine-tune conserve todas estas capacidades, ya que el ajuste fino podría haber alterado el comportamiento del modelo en ciertas áreas.

## Casos de uso

- Asistente de programación en entornos de desarrollo: el modelo base Qwen3.8-27B destaca en generación de código y razonamiento, por lo que el fine-tune podría utilizarse como asistente de codificación en IDEs, siempre que se valide su rendimiento tras el ajuste.
- Análisis de documentos largos: gracias a la ventana de contexto de 262 000 tokens del modelo base, es posible procesar informes extensos, contratos o artículos científicos completos en una sola pasada.
- Automatización de tareas agénticas: el modelo base está diseñado para tareas de múltiples pasos con interacción con herramientas, lo que lo hace adecuado para agentes de automatización de flujos de trabajo (por ejemplo, gestión de correos, extracción de datos web).
- Comprensión de imágenes y texto combinados: el modelo base acepta entrada de imagen y video, permitiendo aplicaciones como descripción de imágenes técnicas, análisis de diagramas o capturas de pantalla.
- Chatbots con contexto largo: la amplia ventana de contexto permite mantener conversaciones extensas sin perder información relevante, útil para atención al cliente o asistentes virtuales.
- Investigación académica: el modelo puede emplearse como herramienta de apoyo en tareas de procesamiento de lenguaje natural y visión por computador, aunque se recomienda verificar su rendimiento en cada dominio específico.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks para el modelo CorX3.8-27B en la información disponible. Los resultados de benchmarks del modelo base Qwen3.8-27B, según la búsqueda web, incluyen puntuaciones como DeepSWE 42.2, Terminal Bench 73.0 y OSWorld 84.3, pero estos datos corresponden al modelo original y no al fine-tune. No se dispone de métricas como MMLU, HumanEval o GSM8K para el modelo ajustado.

## Requisitos de hardware

- El modelo base tiene 27 000 millones de parámetros, por lo que en precisión fp16 requeriría aproximadamente 54 GB de VRAM solo para los pesos, más memoria para activaciones y contexto.
- Para inferencia en GPU, se recomienda al menos una GPU con 48 GB de VRAM (como A6000, A100 40 GB o H100) si se utiliza fp16.
- Si el repositorio contiene una versión cuantizada (por ejemplo, Q4_K_M o similar), el tamaño de 1,3 GB sugiere que podría caber en GPUs de consumo como RTX 4090 (24 GB) o incluso RTX 4060 Ti (16 GB), pero no se confirma el tipo de cuantización.
- Opciones de despliegue: vLLM, llama.cpp, Ollama, TGI o Transformers con `device="cuda"`. Para el modelo base, se ha reportado compatibilidad con AMD Ryzen AI Max y Radeon mediante LM Studio.
- No se dispone de datos de latencia o throughput específicos para el modelo ajustado.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Qwen3.8-27B (base) | 27B | 262K | Apache 2.0 | Modelo original, vision-language, con benchmarks publicados |
| CorX3.8-27B (fine-tune) | 27B (estimado) | No disponible | No disponible | Fine-tune SFT, sin benchmarks ni documentación adicional |
| Qwen2.5-27B (hipotético) | 27B | 128K (típico) | Apache 2.0 | Alternativa de la misma familia, sin capacidades de visión |

La comparativa es limitada porque no hay información suficiente sobre el fine-tune. Se recomienda evaluar el modelo directamente antes de compararlo con alternativas.

## Limitaciones y advertencias

- No se dispone de información sobre sesgos, alucinaciones o comportamiento específico del modelo ajustado.
- La licencia del modelo no está declarada, lo que impide conocer las restricciones de uso comercial.
- El modelo base puede presentar sesgos inherentes a los datos de entrenamiento de Qwen, así como riesgo de alucinación en tareas de razonamiento o generación de código.
- La ventana de contexto de 262K tokens del modelo base puede degradar el rendimiento en contextos muy largos si no se gestiona adecuadamente.
- El repositorio no incluye información sobre el proceso de entrenamiento (dataset, hiperparámetros), lo que dificulta la reproducibilidad y la evaluación de la calidad del ajuste.
- El tamaño del repositorio (1,3 GB) sugiere que podría tratarse de una versión cuantizada, pero no se especifica el formato ni la pérdida de precisión asociada.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/Sigmandndnns/CorX3.8-27B)
- [Qwen3.8-27B en AMD (blog oficial)](https://www.amd.com/en/blogs/2026/run-qwen-3-8-27b-on-amd-ryzen-ai-max-and-radeon-graphics-cards-day-0.html)
- [Guía de Qwen3.8-27B (lovableapp.org)](https://lovableapp.org/blog/qwen3-8-27b)
- [Qwen3.8 en LM Studio](https://lmstudio.ai/models/qwen3.8)
- [Qwen3.8 27B en Jetson AI Lab](https://www.jetson-ai-lab.com/models/qwen3-8-27b/)
- [Especificaciones y benchmarks de Qwen3.8-27B (kingy.ai)](https://kingy.ai/blog/qwen3-8-27b-specs-benchmarks-local-hardware/)
