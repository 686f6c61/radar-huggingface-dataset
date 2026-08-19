# Freenixi/unsloth-Qwen3.8-27B-NVFP4-GGUF

## Resumen

Este repositorio contiene una conversión comunitaria a formato GGUF del checkpoint NVFP4 de Unsloth para el modelo Qwen3.8-27B, un modelo de lenguaje multimodal de 27 000 millones de parámetros desarrollado por Qwen. La conversión, realizada por Freenixi, está pensada principalmente para ejecutarse en LM Studio con GPUs NVIDIA Blackwell (RTX 5090), aprovechando la cuantización NVFP4 nativa para lograr altas velocidades de inferencia (más de 50 tokens por segundo con 80K de contexto según el autor).

El modelo base Qwen3.8-27B es un modelo de visión-lenguaje con capacidades de comprensión de imagen y vídeo, control flexible del modo de pensamiento, mejoras en el uso de herramientas y predicción multi-token (MTP). Esta conversión GGUF preserva la mayor parte de los tensores en NVFP4 (168 tensores en las capas FFN 0-55), mientras que los tensores de origen FP8 se almacenan como Q8_0 y los tensores auxiliares en BF16/F32, resultando en un archivo híbrido de aproximadamente 23,17 GB. Se distribuye bajo licencia Apache 2.0, lo que permite uso comercial y modificación.

La relevancia de este modelo radica en que ofrece una vía práctica para ejecutar un modelo multimodal de 27B en hardware consumer de gama alta, sin necesidad de servidores dedicados, gracias a la cuantización NVFP4 optimizada para la arquitectura Blackwell y a la inclusión del proyector de visión en BF16.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal con visión y MTP (predicción multi-token); atención con Gated DeltaNet según tensores observados |
| Parametros totales | 27.320.698.192 (~27B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 80K+ tokens (según recomendación del autor de la conversión; dato oficial no disponible) |
| Tipos de cuantizacion | NVFP4 (capas FFN 0-55), Q8_0 (tensores de origen FP8), BF16/F32 (tensores auxiliares) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF híbrido (NVFP4 + Q8_0 + BF16) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B es un modelo de lenguaje de visión (VLM) nativo, diseñado para procesar entradas de imagen y vídeo además de texto. Según la información proporcionada en la model card de la conversión, incorpora control flexible del modo de pensamiento (thinking mode), mejoras en el uso de herramientas y predicción multi-token (MTP). Los tensores observados en la conversión sugieren que la atención utiliza proyecciones Gated DeltaNet, una variante de atención lineal que reduce el coste computacional en secuencias largas, aunque este dato no está confirmado oficialmente.

No se dispone de información sobre el proceso de entrenamiento del modelo base: número de tokens, composición del dataset, o si se aplicaron técnicas como RLHF o DPO. La conversión GGUF fue realizada con llama.cpp, aplicando un parche local para manejar la mezcla de tensores NVFP4 y FP8 del checkpoint de Unsloth. El resultado es un archivo híbrido donde las capas FFN 0-55 se mantienen en NVFP4 nativo, las capas FFN 56-63 y las proyecciones de atención se almacenan como Q8_0, y los tensores pequeños o de normalización permanecen en BF16/F32.

## Capacidades

- Comprensión de imágenes y vídeo: el modelo acepta entradas multimodales y puede razonar sobre contenido visual.
- Control de pensamiento flexible: permite alternar entre modos de razonamiento rápido y modos de pensamiento profundo (thinking mode) según la tarea.
- Uso de herramientas (tool calling): soporta invocación de funciones externas para integrarse en flujos de trabajo automatizados.
- Predicción multi-token (MTP): genera múltiples tokens por paso de decodificación, lo que acelera la inferencia.
- Conversación multi-turno: diseñado para diálogos extensos con mantenimiento de contexto.
- Capacidades multilingües: no confirmadas en la información disponible, aunque el modelo base de Qwen suele ser multilingüe.
- Compatibilidad con LM Studio y runtimes llama.cpp: gracias al formato GGUF y al proyector de visión incluido.

## Casos de uso

- Asistente de soporte técnico con visión: un bot que recibe capturas de pantalla o fotos de un error y proporciona instrucciones de solución paso a paso, aprovechando la comprensión de imágenes y el contexto largo para mantener el historial de la conversación.
- Análisis de documentos escaneados: extraer y resumir información de documentos con tablas, gráficos o texto manuscrito, usando la entrada de imagen y el modo de pensamiento para tareas complejas.
- Generación de descripciones accesibles: crear descripciones alternativas (alt text) para imágenes en sitios web o aplicaciones, directamente en local sin enviar datos a la nube.
- Automatización de tareas con herramientas: integrar el modelo en un pipeline de CI/CD donde, tras recibir una imagen de un fallo de compilación, invoque funciones para consultar logs o abrir issues en un repositorio.
- Asistente de investigación multimodal: un asistente que analiza figuras de artículos científicos, combina la información visual con el texto y genera resúmenes o respuestas a preguntas específicas, con control de pensamiento para razonamiento profundo.
- Chat local con contexto largo: un chatbot personal que mantiene conversaciones extensas de más de 80K tokens, por ejemplo para revisar documentación técnica o mantener un diario de trabajo, ejecutándose en una estación de trabajo con RTX 5090.
- Prototipado de agentes con visión: desarrollo de agentes que navegan por interfaces gráficas (GUI) o analizan vídeos cortos, usando la capacidad de vídeo del modelo base y la baja latencia de la cuantización NVFP4.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor de la conversión reporta una velocidad de inferencia de más de 50 tokens por segundo en RTX 5090 con 80K+ tokens de contexto y Flash Attention configurada con caché KV en Q8_0, pero no se proporcionan métricas comparativas como MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- VRAM estimada: el archivo GGUF principal ocupa aproximadamente 21,58 GiB, por lo que se recomienda una GPU con al menos 24 GB de VRAM. La RTX 5090 (32 GB) es la opción indicada por el autor para aprovechar la aceleración NVFP4 nativa.
- GPU recomendadas: NVIDIA RTX 5090 (Blackwell) para soporte NVFP4 óptimo; también puede ejecutarse en otras GPUs con suficiente VRAM, pero la decodificación NVFP4 podría no estar acelerada por hardware.
- Compatibilidad con GPU consumer: sí, en GPUs de gama alta con 24 GB o más (RTX 4090, RTX 5090). En GPUs con menos VRAM, sería necesario reducir la longitud de contexto o usar una cuantización más agresiva (no incluida en este repositorio).
- Opciones de despliegue: LM Studio (entorno recomendado), llama.cpp, o cualquier runtime compatible con GGUF. El proyector de visión `mmproj-BF16.gguf` debe colocarse junto al modelo principal.
- Latencia y throughput: el autor reporta más de 50 tokens por segundo en RTX 5090 con 80K de contexto y caché KV en Q8_0. No se dispone de datos para otras configuraciones.

## Comparativa con modelos similares

No se dispone de información suficiente para realizar una comparativa rigurosa con modelos similares. El modelo base Qwen3.8-27B es una versión reciente de la familia Qwen, y no se han publicado datos comparativos en la información proporcionada. Alternativas teóricas en el mismo rango de parámetros serían Qwen3-27B (solo texto) o Qwen2.5-VL-27B, pero no se dispone de datos de rendimiento ni licencias para contrastar.

## Limitaciones y advertencias

- Conversión no oficial: este repositorio es una conversión comunitaria, no una publicación oficial de Qwen ni de Unsloth. El mantenimiento y la corrección de errores dependen del autor de la conversión.
- Cuantización híbrida: la mezcla de NVFP4, Q8_0 y BF16 puede afectar a la calidad de las respuestas en comparación con el modelo original en BF16, especialmente en tareas que requieren precisión numérica.
- Requisito de hardware específico: el rendimiento óptimo solo se alcanza en GPUs Blackwell (RTX 5090). En otras GPUs, la conversión puede funcionar pero con menor velocidad o sin soporte nativo para NVFP4.
- Riesgo de alucinación: como todo modelo de lenguaje, puede generar contenido plausible pero incorrecto, especialmente en tareas de razonamiento complejo o con entradas ambiguas.
- Sesgos: no se ha evaluado el sesgo del modelo base en esta conversión; es recomendable realizar pruebas específicas antes de usarlo en producción.
- Contexto largo: aunque se recomienda 80K+ tokens, no se ha verificado la calidad de la atención en ventanas muy largas con esta cuantización concreta.
- Idiomas: no se ha confirmado la lista de idiomas soportados; el rendimiento en idiomas distintos del inglés puede variar.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Freenixi/unsloth-Qwen3.8-27B-NVFP4-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Checkpoint NVFP4 de Unsloth: https://huggingface.co/unsloth/Qwen3.8-27B-NVFP4
- Proyector de visión (mmproj-BF16.gguf): https://huggingface.co/unsloth/Qwen3.8-27B-GGUF/blob/main/mmproj-BF16.gguf
- Herramienta de conversión (llama.cpp): https://github.com/ggml-org/llama.cpp
