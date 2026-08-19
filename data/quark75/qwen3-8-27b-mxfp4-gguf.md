# quark75/Qwen3.8-27B-MXFP4-GGUF

## Resumen

Qwen3.8-27B es un modelo de lenguaje de gran tamaño desarrollado por el equipo Qwen de Alibaba, perteneciente a la serie Qwen3.8 que incluye también variantes como Qwen3.8-2.4T-A95B y Qwen3.8-Max. Este modelo de 27 mil millones de parámetros está diseñado para tareas de visión, generación de texto eficiente y cargas de trabajo agénticas, con una ventana de contexto de 256K tokens. El repositorio en cuestión, creado por el usuario quark75, ofrece una cuantización en formato GGUF con precisión MXFP4 (4 bits), pensada para facilitar la ejecución local en hardware de consumo.

La relevancia actual de este modelo radica en su capacidad para ejecutarse en equipos con recursos limitados (se menciona que puede funcionar con 17 GB de RAM/VRAM combinados) y su soporte de día cero en hardware AMD, lo que lo convierte en una opción atractiva para desarrolladores que buscan desplegar modelos con capacidades de visión y razonamiento en entornos locales o de borde. La licencia Apache 2.0 permite uso comercial sin restricciones significativas.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (probablemente transformer, por la familia Qwen) |
| Parametros totales | 27 mil millones |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 256K tokens |
| Tipos de cuantizacion | MXFP4 (4 bits), GGUF (se mencionan tamaños de 9.01 GB a 2-bit y 17.11 GB a 4-bit) |
| Idiomas soportados | no disponible (probablemente multilingüe, pero no confirmado) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (safetensors no disponible en este repositorio) |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura interna del modelo en los datos proporcionados. Por su pertenencia a la familia Qwen, es razonable asumir una arquitectura transformer estándar, pero no hay confirmación oficial en la información recopilada. El modelo está ajustado con instrucciones (instruction-tuned) y presenta capacidades de visión y razonamiento, lo que sugiere un entrenamiento multimodal con datos de imagen y texto. No se han publicado detalles sobre el número de tokens de entrenamiento, la composición del dataset o el uso de técnicas como RLHF o DPO en la información disponible.

La cuantización MXFP4 es un formato de punto flotante de 4 bits que reduce significativamente el tamaño del modelo (17.11 GB a 4 bits) manteniendo un equilibrio entre precisión y eficiencia. Este formato es compatible con motores de inferencia como llama.cpp y LM Studio, lo que permite su ejecución en CPUs y GPUs de consumo.

## Capacidades

- Generación de texto y chat: el modelo está optimizado para conversación y generación de texto general.
- Razonamiento: incluye capacidades de razonamiento multi-paso, aunque no se especifica si dispone de un modo "thinking" explícito.
- Visión: puede procesar imágenes y responder preguntas sobre ellas, según las fuentes consultadas.
- Tareas agénticas: diseñado para cargas de trabajo de agentes, lo que implica soporte para tool calling y ejecución de acciones.
- Multilingüismo: probablemente soporta múltiples idiomas, pero no hay confirmación explícita en la información disponible.
- Ejecución local: gracias a la cuantización GGUF, puede ejecutarse en hardware de consumo con recursos limitados.

## Casos de uso

- Asistentes de código en local: el modelo puede integrarse en entornos de desarrollo como un asistente de programación con capacidades de visión (por ejemplo, analizar capturas de pantalla de errores) y razonamiento, ejecutándose en una estación de trabajo con 16-32 GB de RAM.
- Automatización de tareas agénticas: gracias a su soporte para tool calling, puede orquestar flujos de trabajo que requieren interacción con APIs, bases de datos o sistemas externos, todo en local.
- Análisis de documentos con imágenes: su capacidad de visión permite extraer información de documentos escaneados, diagramas o capturas, útil en entornos con requisitos de privacidad.
- Chatbots de atención al cliente: con su contexto de 256K tokens, puede mantener conversaciones largas y recordar detalles de interacciones anteriores, desplegado en un servidor con GPU de 16 GB o más.
- Prototipado rápido de aplicaciones de IA: al ser un modelo abierto con licencia Apache 2.0, los desarrolladores pueden experimentar sin costes de API y sin enviar datos a la nube.
- Investigación académica: su tamaño y cuantización permiten estudiar el comportamiento de modelos multimodales en hardware asequible, por ejemplo en laboratorios con GPUs de gama media.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. Las únicas métricas encontradas son de rendimiento de inferencia: 7.11 tokens por segundo en una configuración con 17 GB de RAM/VRAM combinados, según el blog de ofox.ai. No hay datos de MMLU, HumanEval, GSM8K u otros benchmarks estándar.

## Requisitos de hardware

- VRAM estimada: el archivo GGUF de 4 bits ocupa 17.11 GB, por lo que se recomienda al menos 16 GB de VRAM en una GPU, o 17 GB de RAM+VRAM combinados si se usa CPU con memoria unificada (como en los procesadores AMD Ryzen AI Max).
- GPUs recomendadas: RTX 4090 (24 GB), RTX 4080 (16 GB), o GPUs de 16 GB o más. También puede ejecutarse en CPUs con suficiente RAM (por ejemplo, 32 GB de RAM) usando llama.cpp.
- En consumer GPU: sí, cabe en GPUs de 16 GB o más, aunque con limitaciones de velocidad (7.11 tok/s medido).
- Opciones de despliegue: llama.cpp, LM Studio, Ollama (si se añade el modelo), Unsloth (que ofrece GGUFs optimizados), y posiblemente vLLM con soporte para GGUF.
- Latencia y throughput: 7.11 tok/s en una configuración de 17 GB RAM+VRAM, lo que es adecuado para tareas interactivas pero no para producción de alto rendimiento.

## Comparativa con modelos similares

No se dispone de información suficiente para realizar una comparativa rigurosa con otros modelos de la misma categoría. Se mencionan otras variantes de la familia Qwen3.8 (Qwen3.8-2.4T-A95B y Qwen3.8-Max), pero no hay datos de rendimiento o especificaciones detalladas. Tampoco se dispone de comparaciones con modelos de otros fabricantes como Llama 3.1 8B o Mistral 7B, que son de menor tamaño. Por tanto, la comparativa se limita a indicar que Qwen3.8-27B se posiciona como un modelo de 27B con visión y contexto largo, pero sin datos cuantitativos para contrastar.

## Limitaciones y advertencias

- Al ser una cuantización de 4 bits, puede haber una pérdida de precisión en tareas complejas de razonamiento o generación de código en comparación con el modelo original en precisión completa.
- No se han publicado resultados de benchmarks, por lo que el rendimiento real en tareas estándar es desconocido.
- La información sobre idiomas soportados no está disponible; es probable que el modelo sea multilingüe, pero no se garantiza.
- Riesgo de alucinación: como todos los modelos de lenguaje, puede generar información falsa o inventada, especialmente en contextos largos.
- Sesgos: no se han documentado sesgos específicos, pero al ser un modelo entrenado con datos de internet, puede reflejar sesgos sociales y culturales.
- La licencia Apache 2.0 permite uso comercial, pero se recomienda revisar los términos de la licencia del modelo original (Qwen) para asegurar el cumplimiento.
- El repositorio de HuggingFace tiene 0 descargas y 0 likes, lo que sugiere que es una cuantización reciente o poco probada; se recomienda verificar su integridad antes de usarla en producción.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/quark75/Qwen3.8-27B-MXFP4-GGUF
- Repositorio oficial de Qwen3.8 en GitHub: https://github.com/QwenLM/Qwen3.8
- Documentación de Unsloth para Qwen3.8: https://unsloth.ai/docs/models/qwen3.8
- Blog de AMD sobre ejecución en Ryzen AI Max: https://www.amd.com/en/blogs/2026/run-qwen-3-8-27b-on-amd-ryzen-ai-max-and-radeon-graphics-cards-day-0.html
- Blog de ofox.ai sobre ejecución local: https://ofox.ai/blog/qwen-3-8-27b-run-locally-vram-gguf-2026/
- Documentación de Cloudflare Workers AI: https://developers.cloudflare.com/workers-ai/models/qwen3.8-27b/
