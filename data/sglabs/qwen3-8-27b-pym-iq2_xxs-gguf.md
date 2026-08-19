# SGLabs/Qwen3.8-27B-Pym-IQ2_XXS-GGUF

## Resumen

SGLabs/Qwen3.8-27B-Pym-IQ2_XXS-GGUF es una cuantización GGUF de precisión mixta del modelo Qwen3.8-27B, desarrollado por el equipo Qwen de Alibaba. El modelo base es un transformer denso de 27 000 millones de parámetros con arquitectura híbrida SSM+attention (denominada `qwen35`), que incorpora un codificador de visión y una cabeza MTP (Multi-Token Prediction) nativa para decodificación especulativa. Dispone de una ventana de contexto de 256 000 tokens y está publicado bajo licencia Apache 2.0.

Esta cuantización, realizada por SGLabs, reduce los bloques feed-forward a 2-3 bits (IQ2_XXS e IQ3_XXS) mientras preserva atención, SSM, normas, embeddings y la cabeza MTP en Q8_0. El resultado es un archivo de aproximadamente 16 GB (4.68 BPW) que puede ejecutarse en hardware modesto mediante llama.cpp, sin necesidad de GPU NVIDIA, con soporte para AMD ROCm y Apple Silicon. Su relevancia radica en permitir desplegar un modelo multimodal de 27B con capacidades de razonamiento y codificación agéntica en equipos de consumo, manteniendo la decodificación especulativa activa gracias a la cabeza MTP cuantizada a alta precisión.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `qwen35` (híbrida SSM + attention), 65 bloques (64 + MTP) |
| Parametros totales | 27 320 697 856 (27B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 256 000 tokens (modelo base); en la cuantización se recomienda 32 768 en el ejemplo de uso |
| Tipos de cuantizacion | IQ2_XXS (FFN gate/up), IQ3_XXS (FFN down), Q8_0 (atención, SSM, normas, embeddings, output, MTP) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B emplea una arquitectura híbrida que combina capas de atención tradicional con capas basadas en SSM (State Space Models), una tendencia reciente para mejorar la eficiencia en contextos largos. Es un modelo denso de 27B con 65 bloques (64 de procesamiento más un bloque MTP dedicado a la predicción de múltiples tokens). El entrenamiento del modelo base incluye datos multimodales (imagen y texto) y ha sido optimizado para tareas de razonamiento, codificación agéntica y automatización de oficina, según la documentación oficial.

La cuantización de SGLabs aplica una estrategia de precisión mixta: los tensores de las proyecciones FFN (gate, up, down) se cuantizan a 2-3 bits mediante los esquemas IQ2_XXS e IQ3_XXS, mientras que los componentes críticos para la estabilidad y la decodificación especulativa (atención, SSM, normas, embeddings, capa de salida y el bloque MTP) se mantienen en Q8_0. El proceso utiliza calibración con imatrix (importance matrix) para minimizar la pérdida de calidad. Esta configuración permite que la cabeza MTP conserve suficiente precisión para la decodificación especulativa, una técnica que acelera la generación de tokens sin degradar la coherencia.

## Capacidades

- Generación de texto y chat conversacional multirround.
- Razonamiento complejo y resolución de problemas matemáticos y lógicos.
- Codificación de software, incluyendo generación, revisión y depuración de código.
- Comprensión de imágenes (multimodal image-text-to-text) gracias al codificador de visión del modelo base.
- Soporte de agentes y flujos de trabajo agénticos (agentic coding, automatización de oficina).
- Decodificación especulativa mediante la cabeza MTP, activable en llama.cpp con `--spec-type draft-mtp`.
- Ejecución en hardware sin CUDA: AMD ROCm y Apple Silicon.
- Compatible con endpoints de inferencia (etiqueta `endpoints_compatible`).

## Casos de uso

- Asistente de programación local: un desarrollador puede ejecutar el modelo en un portátil con 16 GB de RAM para obtener sugerencias de código, explicaciones y refactorizaciones sin depender de servicios en la nube. La cuantización a 2-3 bits en FFN reduce el uso de memoria, mientras que la cabeza MTP mantiene una generación fluida.
- Automatización de tareas de oficina: el modelo puede procesar documentos, extraer información de imágenes y redactar respuestas o informes, aprovechando su capacidad multimodal y su contexto de 256K (aunque en la práctica se recomienda 32K en esta cuantización).
- Agente conversacional para atención al cliente: con su soporte para conversaciones multi-turno y razonamiento, puede gestionar consultas complejas en entornos con recursos limitados, desplegado mediante llama.cpp en servidores con GPUs AMD o Apple Silicon.
- Prototipado rápido de aplicaciones de IA: al ser un archivo GGUF de 16 GB, los desarrolladores pueden integrarlo en pipelines de prueba con Ollama o llama.cpp sin necesidad de infraestructura costosa.
- Análisis de imágenes y documentos escaneados: su capacidad de visión permite extraer texto de imágenes, describir diagramas o interpretar capturas de pantalla, útil en herramientas de productividad.
- Investigación académica en entornos sin GPU NVIDIA: laboratorios con hardware AMD o Apple pueden experimentar con un modelo de 27B multimodal y de razonamiento, algo que antes requería GPUs de gama alta.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del cuantizador no incluye métricas de rendimiento (MMLU, HumanEval, GSM8K, etc.) ni comparaciones con otras cuantizaciones. Se recomienda consultar la documentación del modelo base Qwen3.8-27B para obtener datos de rendimiento sin cuantizar.

## Requisitos de hardware

- VRAM estimada: aproximadamente 16 GB para el archivo GGUF completo (15.99 GB). Con la cuantización IQ2_XXS, el modelo puede cargarse en GPUs con 16 GB de VRAM o en sistemas con 16 GB de RAM unificada (Apple Silicon).
- GPU recomendadas: cualquier GPU compatible con llama.cpp, incluyendo AMD Radeon (ROCm) y Apple Silicon (Metal). No requiere CUDA, aunque también funciona en GPUs NVIDIA si se desea.
- Ejecución en CPU: posible con llama.cpp, aunque la velocidad será menor; se recomienda al menos 32 GB de RAM para evitar swapping.
- Opciones de despliegue: llama.cpp (llama-server, llama-cli), Ollama (si se convierte el GGUF), LM Studio, y cualquier servidor compatible con GGUF. El ejemplo de uso de la model card emplea `llama-server` con `--spec-type draft-mtp` para decodificación especulativa.
- Latencia y throughput: no disponibles en la información proporcionada. Dependen del hardware y de la configuración de contexto.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. La cuantización es específica para Qwen3.8-27B, y no se han incluido datos de otros modelos de tamaño similar (por ejemplo, Llama 3.1 27B o Qwen2.5-27B) en las fuentes consultadas. Se recomienda evaluar el modelo base sin cuantizar para comparaciones de rendimiento.

## Limitaciones y advertencias

- La cuantización agresiva de los bloques FFN a 2-3 bits puede degradar la calidad en tareas que requieren alta precisión numérica, como matemáticas avanzadas o razonamiento lógico complejo.
- El contexto efectivo en esta cuantización puede ser inferior al máximo teórico de 256K; el ejemplo de uso recomienda 32 768 tokens, y superar ese límite podría aumentar la latencia o causar errores de memoria.
- No se han documentado sesgos específicos del modelo cuantizado, pero el modelo base puede heredar sesgos de sus datos de entrenamiento, que no han sido detallados.
- Riesgo de alucinación inherente a los modelos generativos, especialmente en tareas de razonamiento o cuando se le pide información factual.
- La licencia Apache 2.0 permite uso comercial, pero la cuantización es una obra derivada; se recomienda verificar los términos del modelo base y de la herramienta de cuantización.
- Algunos cargadores de GGUF pueden no reconocer el tipo de archivo mixto (la model card indica que el `general.file_type` puede reportarse como "custom"), lo que podría causar incompatibilidades con ciertas herramientas.
- No se garantiza el soporte de tool calling o function calling en esta cuantización, aunque el modelo base lo soporta; la compatibilidad depende de la implementación en llama.cpp.

## Enlaces

- Modelo cuantizado en HuggingFace: https://huggingface.co/SGLabs/Qwen3.8-27B-Pym-IQ2_XXS-GGUF
- Modelo base Qwen3.8-27B: https://huggingface.co/Qwen/Qwen3.8-27B
- Repositorio oficial de Qwen3.8-27B en GitHub: https://github.com/AlibabaCloud-Official/Qwen3.8-27B
- Blog de AMD sobre soporte Day 0: https://www.amd.com/en/blogs/2026/run-qwen-3-8-27b-on-amd-ryzen-ai-max-and-radeon-graphics-cards-day-0.html
- Documentación de Unsloth para Qwen3.8: https://unsloth.ai/docs/models/qwen3.8
- Guía de ejecución local (yottalabs.ai): https://www.yottalabs.ai/post/how-to-run-qwen-3-8-27b-locally-ollama-gguf-single-gpu-2026
- Guía de autoalojamiento (swfte.com): https://www.swfte.com/blog/qwen-3-8-27b-run-locally-self-host-guide-2026
