# barozp/Qwen3.8-27B-Opus-Distill-v2-FP8

## Resumen

Qwen3.8-27B-Opus-Distill-v2-FP8 es una cuantización en punto flotante de 8 bits (FP8, e4m3) del modelo barozp/Qwen3.8-27B-Opus-Distill-v2, desarrollado por el usuario barozp. El modelo base es un destilado de un modelo de la familia Opus (probablemente Claude Opus) sobre la arquitectura Qwen3.8-27B de Alibaba, lo que lo convierte en un sistema multimodal capaz de procesar imágenes y texto. Con 27.781.427.952 parámetros (aproximadamente 27,8 mil millones), se posiciona en el rango de los LLM de gran tamaño pero con un peso manejable para despliegue local.

La versión FP8 reproduce exactamente la receta de cuantización que Qwen utilizó para su propio Qwen3.8-27B-FP8, aplicada a los pesos del destilado. Al emplear un esquema de activación dinámica, no requiere dataset de calibración. La arquitectura combina capas de atención completa con capas basadas en SSM (Gated-DeltaNet), e incorpora una torre de visión y un cabezal MTP (multi-token prediction). Su licencia Apache 2.0 permite uso comercial sin restricciones, lo que lo hace relevante para proyectos de producción que necesitan un modelo multimodal de código abierto con razonamiento avanzado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | qwen3_5_text (híbrida: atención full + Gated-DeltaNet SSM), 64 capas, hidden size 5120, GQA con 24 query heads y 4 key/value heads, intermediate size 17408 |
| Parametros totales | 27.781.427.952 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | FP8 (e4m3, block-wise 128x128, activación dinámica) en este repo; el modelo base también tiene versiones GGUF |
| Idiomas soportados | No disponible (presumiblemente multilingüe, por ser base Qwen) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo base, Qwen3.8-27B-Opus-Distill-v2, es un destilado de un modelo de la familia Opus (posiblemente Claude Opus de Anthropic) sobre la arquitectura Qwen3.8-27B de Alibaba. El proceso de destilación no está documentado en la información disponible, pero el nombre indica que se transfirieron capacidades de razonamiento y generación desde el modelo Opus al modelo Qwen mediante técnicas de destilación de conocimiento. La arquitectura subyacente es la de Qwen3.8-27B, que incorpora una mezcla de capas de atención full (con QKVO en las capas completas) y capas basadas en SSM Gated-DeltaNet, además de una torre de visión para entrada de imágenes y un cabez MTP para predecir múltiples tokens en paralelo.

La cuantización FP8 se aplicó solo a los pesos de las capas de atención (QKVO en capas full-attention), FFN, y las matrices de proyección del Gated-DeltaNet, siguiendo la misma configuración que el Qwen3.8-27B-FP8 oficial. Se excluyen de la cuantización la torre de visión, el cabez MTP, las capas de normalización y los parámetros específicos de SSM (`A_log`, `conv1d`, `dt_bias`, norm interna). El esquema de activación dinámica evita la necesidad de calibración, y la cuantización es block-wise sobre rangos propios de cada bloque.

## Capacidades

- Procesamiento multimodal: acepta entradas de imagen y texto, lo que permite tareas de visión y lenguaje (VQA, descripción de imágenes, razonamiento visual).
- Razonamiento avanzado: al ser un destilado de Opus, hereda capacidades de razonamiento complejo y planificación de tareas de varios pasos.
- Generación de texto y código: soporta tareas de escritura, resumen, traducción y generación de código, típicas de la familia Qwen.
- Multi-token prediction (MTP): el cabez MTP permite predecir varios tokens a la vez, lo que acelera la generación y mejora la coherencia.
- Conversación multi-turno: diseñado para mantener diálogos extensos con memoria de contexto.
- Capacidades de agente: aunque no se confirma explícitamente, la arquitectura Qwen3.8 suele incluir soporte para tool calling y uso de herramientas, por lo que es plausible que este modelo lo herede.
- Razonamiento con visión: combina la entrada de imágenes con el razonamiento lógico, útil para tareas como leer diagramas, gráficos o capturas de pantalla.

## Casos de uso

- **Análisis de documentos con imágenes**: el modelo puede extraer información de PDFs escaneados, diagramas o capturas de pantalla, resumiendo el contenido y respondiendo preguntas sobre él. Su capacidad multimodal lo hace adecuado para automatizar la revisión de documentos técnicos.
- **Asistente de programación con contexto visual**: al recibir capturas de pantalla de código o diagramas de arquitectura, el modelo puede explicar errores, sugerir refactorizaciones o generar código nuevo. Su base Qwen3.8 es fuerte en generación de código.
- **Automatización de tareas de oficina**: el modelo puede procesar correos electrónicos, presentaciones o documentos con imágenes y generar resúmenes, borradores de respuesta o extraer datos clave. Su licencia Apache permite integrarlo en productos comerciales.
- **Agente de atención al cliente**: con su capacidad de razonamiento y conversación multi-turno, puede gestionar consultas complejas que requieran interpretar imágenes de productos o capturas de pantalla del usuario.
- **Investigación académica**: como herramienta de análisis de papers con figuras y tablas, el modelo puede extraer conclusiones de gráficos científicos y explicarlos en texto.
- **Generación de contenido accesible**: a partir de imágenes, el modelo puede generar descripciones alternativas (alt text) para personas con discapacidad visual, o narrar imágenes en aplicaciones de accesibilidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card del modelo base (barozp/Qwen3.8-27B-Opus-Distill-v2) menciona que contiene benchmarks y historial de correcciones, pero ese contenido no se ha proporcionado. Por tanto, no se pueden presentar cifras comparativas. Se recomienda consultar la model card original para obtener datos de evaluación.

## Requisitos de hardware

- **VRAM estimada para inferencia**: con cuantización FP8, los pesos ocupan aproximadamente 27,8 GB (un byte por parámetro). El tamaño total del repo es de 31,3 GB, lo que incluye el cabez MTP y la torre de visión en precisión original. En la práctica, se necesitan al menos 30 GB de VRAM para cargar el modelo con overhead.
- **GPU recomendadas**: GPU con 40 GB de VRAM (A100 40GB, A6000 48GB, L40S 48GB) o superiores (H100 80GB). Una RTX 4090 de 24 GB no cabe el modelo en FP8 sin cuantización adicional.
- **GPU consumer**: con cuantización GGUF de 4 bits (Q4_K_M, ~14 GB) sí cabe en una RTX 4090 o RTX 3090 de 24 GB, aunque con pérdida de calidad.
- **Opciones de despliegue**: compatible con vLLM (si soporta la arquitectura qwen3_5_text), llama.cpp para GGUF, Ollama, y TGI. También se puede usar con transformers directamente.
- **Latencia y throughput**: no se han publicado datos concretos. En una A100 40GB, la inferencia de 27B en FP8 suele alcanzar throughput de 30-50 tokens/s en generación secuencial, dependiendo del batch y el contexto.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de características de modelos comparables en la información proporcionada. Los únicos modelos que se mencionan son el base baroz/Qwen3.8-27B-Opus-Distill-v2 y el Qwen3.8-27B-FP8 oficial de Qwen. No se pueden establecer comparativas cuantitativas sin esos datos.

## Limitaciones y advertencias

- **Sesgos y alucinaciones**: como todo modelo de lenguaje, puede generar contenido falso o sesgado. El destilado de Opus no elimina estos riesgos, y el modelo base Qwen3.8-27B puede tener sesgos en español y otros idiomas.
- **Riesgo de alucinación visual**: al ser multimodal, puede describir imágenes incorrectamente o inventar detalles no presentes en la entrada.
- **Limitaciones de contexto**: se desconoce la longitud máxima de contexto; si el base Qwen3.8-27B soporta 256K tokens, esta versión FP8 debería mantenerlo, pero no está confirmado.
- **Restricciones de licencia**: licencia Apache 2.0, sin restricciones de uso comercial, pero se debe mantener la atribución.
- **Caveat de cuantización**: la cuantización FP8 puede introducir pequeñas degradaciones en tareas de precisión numérica o razonamiento complejo, aunque el esquema block-wise dinámico suele minimizar el impacto.
- **Dependencia de la arquitectura**: la combinación de atención y SSM (Gated-DeltaNet) requiere un runtime que soporte esta arquitectura; no todos los frameworks la implementan correctamente.

## Enlaces

- [Modelo FP8 en HuggingFace](https://huggingface.co/barozp/Qwen3.8-27B-Opus-Distill-v2-FP8)
- [Modelo base barozp/Qwen3.8-27B-Opus-Distill-v2](https://huggingface.co/barozp/Qwen3.8-27B-Opus-Distill-v2)
- [Versión GGUF del modelo base](https://huggingface.co/barozp/Qwen3.8-27B-Opus-Distill-v2-GGUF)
- [Visor de arquitectura de Qwen3.8-27B-Opus-Distill](https://hfviewer.com/barozp/Qwen3.8-27B-Opus-Distill)
- [Ficha en LLM Explorer](https://llm-explorer.com/model/barozp%2FQwen3.8-27B-Opus-Distill,3VlOlS40JbJDkIo8TeHR6E)
- [GitHub de Qwen3.8-27B](https://github.com/AlibabaCloud-Official/Qwen3.8-27B)
