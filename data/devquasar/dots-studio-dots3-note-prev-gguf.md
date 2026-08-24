# DevQuasar/dots-studio.dots3-note-prev-GGUF

## Resumen

dots3-note preview es el primer modelo de pesos abiertos de la familia dots3, desarrollado por studio.dots.ai. Se trata de un modelo Mixture-of-Experts (MoE) multimodal con 280B parámetros totales y 16B activos, capaz de procesar texto, imágenes, vídeo y audio para generar respuestas de texto. Su ventana de contexto alcanza los 512K tokens, lo que lo sitúa entre los modelos de contexto más largo disponibles actualmente.

La versión cuantizada publicada por DevQuasar (DevQuasar/dots-studio.dots3-note-prev-GGUF) ofrece los pesos en formato GGUF, lo que permite su despliegue en entornos con menos recursos mediante frameworks como llama.cpp u Ollama. El modelo base está diseñado para reforzar el razonamiento y la resolución de problemas en tareas cerradas y verificables, y según el equipo de desarrollo, iguala o supera en varios benchmarks a modelos de mayor tamaño.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE) multimodal |
| Parametros totales | 279.551.729.536 (~280B) |
| Parametros activos | 16B |
| Longitud de contexto | 512K tokens |
| Tipos de cuantizacion | GGUF (tipos no especificados) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (safetensors disponible en el modelo base) |

## Arquitectura y entrenamiento

dots3-note preview es un modelo MoE multimodal con 280B parámetros totales, de los cuales se activan 16B por token. Está diseñado para procesar texto, imágenes, vídeo y audio, y produce únicamente salidas de texto. La arquitectura MoE permite mantener una capacidad total elevada con un coste de inferencia reducido, ya que solo se activa una fracción de los parámetros en cada paso.

El modelo se ha entrenado para reforzar sus capacidades de razonamiento y resolución de problemas en tareas cerradas y verificables, como problemas de matemáticas o lógica. No se han publicado datos específicos sobre el número de tokens de entrenamiento, la composición del dataset ni el uso de técnicas como RLHF o DPO. Según la documentación oficial, es el modelo más ligero de la familia dots3, que incluirá otros miembros con distintos equilibrios entre capacidad, latencia y coste de inferencia.

## Capacidades

- Comprensión multimodal: puede procesar texto, imágenes, vídeo y audio, y generar respuestas en texto.
- Razonamiento y resolución de problemas: ha sido reforzado para tareas cerradas y verificables, como matemáticas o programación.
- Contexto largo: soporta hasta 512K tokens, lo que permite manejar documentos extensos o conversaciones largas.
- Generación de texto: produce salidas de texto coherentes y contextualizadas a partir de entradas multimodales.
- Capacidad de razonamiento multi-step: la arquitectura MoE y el entrenamiento en tareas verificables favorecen el razonamiento encadenado.
- No se menciona explícitamente soporte de tool calling o function calling en la información disponible.

## Casos de uso

- Análisis de documentos largos: gracias a su ventana de 512K tokens, el modelo puede procesar libros completos, informes técnicos o expedientes legales, extrayendo información relevante y resumiendo su contenido.
- Transcripción y resumen de vídeo: al aceptar entradas de vídeo y audio, puede transcribir conferencias o tutoriales y generar resúmenes escritos, útil para formación o documentación.
- Asistente multimodal de atención al cliente: integrado en un chatbot, puede interpretar capturas de pantalla, imágenes de productos o mensajes de voz para responder consultas complejas con contexto largo.
- Generación de código asistida: su razonamiento en tareas verificables y su capacidad de procesar diagramas o capturas de código le permiten ayudar en programación, aunque no se ha confirmado soporte explícito de tool calling.
- Análisis de audio: puede transcribir entrevistas o reuniones y extraer conclusiones, dado su soporte de entrada de audio.
- Investigación académica: para análisis de papers con figuras, tablas y fórmulas, el modelo puede interpretar contenido visual y textual, facilitando la síntesis de literatura científica.
- Automatización de procesos de datos: puede procesar documentos escaneados (imágenes) y extraer información estructurada, aunque no se especifica la precisión en OCR.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La documentación oficial menciona que el modelo "igualar o superar en varios benchmarks a modelos de tamaño" pero no se detallan cifras concretas.

## Requisitos de hardware

- Al ser un modelo MoE de 280B parámetros totales, los pesos completos en FP16 ocuparían aproximadamente 560GB. Con cuantizaciones GGUF de 4 bits, el tamaño se reduce a unos 140-160GB, pero sigue requiriendo múltiples GPUs de alta gama.
- Para la inferencia con la versión GGUF, se recomiendan sistemas con al menos 8 GPUs de 24GB (por ejemplo, RTX 4090) o 4 GPUs de 48GB (como A6000 o A100 48GB). Para un despliegue eficiente, GPUs como A100 80GB o H100 80GB son las más adecuadas.
- El modelo no cabe en una GPU de consumo individual (por ejemplo, RTX 4090 con 24GB) incluso con cuantizaciones agresivas, por lo que se requiere hardware de servidor o sistemas multi-GPU.
- Opciones de despliegue: llama.cpp, Ollama, vLLM (con soporte de GGUF), TGI (aunque requiere conversión a safetensors). Para producción, se recomienda vLLM o TGI con el modelo base safetensors, mientras que la versión GGUF es más adecuada para entornos de menor escala o pruebas locales.
- No se dispone de datos de latencia o throughput estimados.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables de la misma categoría (MoE multimodal de 280B con 16B activos). La familia dots3 incluye otros modelos, pero no se han publicado especificaciones de los mismos. Por tanto, no es posible realizar una comparativa con alternativas.

## Limitaciones y advertencias

- No se ha publicado la licencia del modelo original ni de la cuantización, por lo que no se puede garantizar su uso comercial. Se debe contactar con el autor o el desarrollador para aclarar los términos.
- No se han detallado los idiomas soportados; aunque el modelo es multimodal, la cobertura lingüística es desconocida.
- Al ser una versión cuantizada (GGUF), puede presentar una ligera pérdida de calidad respecto al modelo original en precisión numérica, especialmente en tareas de razonamiento matemático o código.
- El modelo no tiene datos publicados sobre sesgos o riesgos de alucinación; como cualquier modelo multimodal, puede generar información falsa o sesgada si no se valida.
- No se confirma soporte de tool calling ni function calling, lo que puede limitar su uso en pipelines de agentes complejos.
- El tamaño de la ventana de contexto (512K) puede requerir una gestión de memoria cuidadosa en el despliegue para evitar cuellos de botella.

## Enlaces

- Modelo cuantizado en HuggingFace: [DevQuasar/dots-studio.dots3-note-prev-GGUF](https://huggingface.co/DevQuasar/dots-studio.dots3-note-prev-GGUF)
- Modelo original en HuggingFace: [dots-studio/dots3-note-prev](https://huggingface.co/dots-studio/dots3-note-prev)
- Repositorio GitHub del modelo: [studio-dots-ai/dots3-note-prev](https://github.com/studio-dots-ai/dots3-note-prev)
- Página oficial del modelo: [https://studio.dots.ai/dots/dots3-en.html](https://studio.dots.ai/dots/dots3-en.html)
- Sitio de DevQuasar: [https://devquasar.com](https://devquasar.com)
