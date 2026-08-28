# Atomic-Germ/LFM2-2.6B-Transcript-NPU2

## Resumen

LFM2-2.6B-Transcript-NPU2 es una variante del modelo LFM2-2.6B-Transcript desarrollado por Liquid AI, adaptada por el usuario Atomic-Germ para su ejecución en NPU (unidades de procesamiento neuronal), en el contexto de la colaboración con AMD para el resumen de reuniones en dispositivos locales. El modelo está diseñado específicamente para generar resúmenes estructurados de transcripciones de reuniones de 30 a 60 minutos, produciendo salidas como puntos clave, decisiones y elementos de acción, todo ello sin enviar datos a la nube.

Con 2.600 millones de parámetros, el modelo consume menos de 3 GB de RAM durante la inferencia y puede ejecutarse en CPU, GPU y NPU, lo que lo hace adecuado para entornos con restricciones de privacidad o conectividad limitada. La variante NPU2 se centra en optimizar el rendimiento en hardware NPU de AMD, aunque no se especifican detalles técnicos adicionales sobre la adaptación. El modelo solo soporta inglés y está pensado para conversaciones de un solo turno con un formato de entrada muy concreto.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con atención lineal (arquitectura Liquid LFM2, detalles no disponibles) |
| Parametros totales | 2.6 mil millones |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible (optimizado para transcripciones de 30-60 minutos) |
| Tipos de cuantizacion | GGUF, ONNX, MLX (disponibles en repositorios oficiales de Liquid AI) |
| Idiomas soportados | Inglés |
| Licencia | lfm1.0 (licencia propia de Liquid AI, no OSI) |
| Formato de pesos | safetensors (probablemente, dado el tamaño del repo y la librería transformers) |

## Arquitectura y entrenamiento

LFM2-2.6B-Transcript es un fine-tuning del modelo base LFM2-2.6B de Liquid AI, que emplea una arquitectura híbrida con atención lineal (parte de la familia Liquid Foundation Models). Esta arquitectura está diseñada para ofrecer un equilibrio entre eficiencia computacional y calidad en tareas de secuencia larga, lo que resulta adecuado para procesar transcripciones extensas. El modelo base fue entrenado con un gran corpus de texto, pero los detalles específicos del fine-tuning para resumen de reuniones (número de tokens, composición del dataset, técnicas de alineación) no se han publicado en la información disponible.

La variante NPU2 de Atomic-Germ no añade cambios arquitectónicos documentados; se trata de una adaptación para ejecución en NPU, probablemente mediante conversión a formatos optimizados (ONNX o similar) y ajustes de cuantización. No se han revelado detalles sobre el proceso de adaptación.

## Capacidades

- Generación de resúmenes estructurados de transcripciones de reuniones: resumen ejecutivo, resumen detallado, elementos de acción, decisiones clave, participantes y temas tratados.
- Procesamiento de transcripciones largas (30-60 minutos) con un consumo de memoria inferior a 3 GB.
- Ejecución local en CPU, GPU y NPU, sin necesidad de conexión a internet.
- Soporte de un formato de entrada específico con metadatos (título, fecha, hora, duración, participantes) seguido de los mensajes de los hablantes.
- Generación de salidas con tono y formato consistentes, adaptadas al tipo de resumen solicitado.
- No soporta tool calling, agentes ni razonamiento multi-paso; está limitado a un solo turno de conversación.

## Casos de uso

- Resumen de reuniones internas de equipo: el modelo puede procesar la transcripción completa de una reunión de 45 minutos y generar un resumen ejecutivo de 2-3 frases con las decisiones clave, permitiendo a los asistentes ponerse al día rápidamente.
- Llamadas de ventas y conversaciones con clientes: tras una llamada comercial, se puede alimentar la transcripción al modelo para obtener una lista de elementos de acción y decisiones, facilitando el seguimiento del equipo de ventas.
- Juntas directivas y briefings ejecutivos: en entornos donde la confidencialidad es crítica, el modelo genera resúmenes detallados sin que los datos salgan del dispositivo, cumpliendo requisitos de cumplimiento normativo.
- Entornos regulados o sensibles (salud, finanzas, legal): al ejecutarse localmente, evita el envío de información sensible a servicios en la nube, reduciendo riesgos de filtración.
- Flujos de trabajo offline o con baja conectividad: el modelo funciona sin conexión, lo que permite su uso en aviones, zonas rurales o instalaciones con redes restringidas.
- Automatización de actas de reunión: integrado en herramientas de productividad, puede generar automáticamente actas estructuradas a partir de transcripciones, ahorrando tiempo administrativo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card menciona que la calidad de los resúmenes se acerca a la de modelos mucho más grandes, pero no se proporcionan métricas cuantitativas (como ROUGE, BERTScore u otras) ni comparaciones formales.

## Requisitos de hardware

- VRAM estimada: menos de 3 GB de RAM total durante la inferencia, lo que permite ejecución en dispositivos con memoria limitada.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM (por ejemplo, NVIDIA GTX 1650, RTX 3050, o integradas modernas). También compatible con NPU de AMD (Ryzen AI) y CPU.
- Compatibilidad con GPU de consumo: sí, cabe en GPUs de gama baja y media.
- Opciones de despliegue: Transformers (Hugging Face), vLLM, llama.cpp (mediante GGUF), ONNX Runtime, MLX para Apple Silicon.
- Latencia y throughput: no se han publicado cifras exactas, pero la model card indica que los resúmenes se generan "en segundos, no minutos" en hardware local.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia |
|---|---|---|---|---|
| LFM2-2.6B-Transcript (Liquid AI) | 2.6B | no disponible | Resumen de reuniones | lfm1.0 |
| LFM2-2.6B-Transcript-NPU2 (Atomic-Germ) | 2.6B | no disponible | Resumen de reuniones optimizado para NPU | lfm1.0 |
| Llama 3.2 3B (Meta) | 3.2B | 128K | Modelo generalista, puede adaptarse a resúmenes | Llama 3.2 (licencia permisiva) |
| Phi-3-mini (Microsoft) | 3.8B | 128K | Modelo compacto para tareas de lenguaje | MIT |

La comparativa se basa en modelos de tamaño similar, pero no hay datos de rendimiento específicos para la tarea de resumen de reuniones. LFM2-2.6B-Transcript está especializado en esta tarea, mientras que los otros son modelos generalistas que requerirían fine-tuning o prompting cuidadoso.

## Limitaciones y advertencias

- Solo soporta inglés; no es adecuado para transcripciones en otros idiomas.
- Diseñado para un solo turno de conversación; no admite diálogos multi-turno ni preguntas de seguimiento.
- Requiere un formato de entrada muy específico (metadatos + transcripción con hablantes etiquetados); cualquier desviación puede degradar la calidad de la salida.
- Riesgo de alucinación: como todo modelo generativo, puede inventar detalles no presentes en la transcripción, especialmente si el texto es ambiguo o está mal formateado.
- Licencia lfm1.0: es una licencia propia de Liquid AI que puede imponer restricciones al uso comercial o a la redistribución. Es necesario revisar los términos exactos antes de usarlo en producción.
- No se han publicado benchmarks ni evaluaciones independientes, por lo que su rendimiento real en escenarios diversos no está verificado.
- La variante NPU2 de Atomic-Germ no tiene documentación adicional sobre el proceso de adaptación; se recomienda validar su comportamiento en el hardware objetivo antes de desplegarlo.

## Enlaces

- Modelo en Hugging Face (Atomic-Germ): https://huggingface.co/Atomic-Germ/LFM2-2.6B-Transcript-NPU2
- Modelo original (Liquid AI): https://huggingface.co/LiquidAI/LFM2-2.6B-Transcript
- Modelo base LFM2-2.6B: https://huggingface.co/LiquidAI/LFM2-2.6B
- Documentación de Liquid para LFM2-2.6B-Transcript: https://docs.liquid.ai/lfm/models/lfm2-2.6b-transcript
- Blog de AMD sobre la colaboración: https://www.amd.com/en/blogs/2026/liquid-ai-amd-ryzen-on-device-meeting-summaries.html
- Blog de Liquid AI sobre resumen de reuniones: https://www.liquid.ai/blog/the-future-of-meeting-summarization-local-fast-private-and-fully-secure
- Repositorio GGUF: https://huggingface.co/LiquidAI/LFM2-2.6B-Transcript-GGUF
- Repositorio ONNX: https://huggingface.co/LiquidAI/LFM2-2.6B-Transcript-ONNX
- Repositorio MLX (4-bit): https://huggingface.co/mlx-community/LFM2-2.6B-Transcript-4bit
