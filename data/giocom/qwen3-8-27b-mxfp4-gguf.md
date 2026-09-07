# giocom/Qwen3.8-27B-MXFP4-GGUF

## Resumen

Qwen3.8-27B-MXFP4-GGUF es una cuantización en formato GGUF del modelo multimodal Qwen/Qwen3.8-27B, desarrollada por el usuario giocom. El modelo original, de Alibaba, es un transformer denso de 27.320.697.856 parámetros que acepta tanto imágenes como texto, tal como indica el pipeline image-text-to-text. Esta versión cuantizada utiliza el formato MXFP4, lo que reduce el tamaño del repositorio a 17.9 GB y permite su ejecución en hardware de consumo, como GPUs de 24 GB o Macs de 32 GB, según la guía de Atomic Chat.

El repositorio está etiquetado con los tags "uncensored", "abliterated" y "mtp", lo que sugiere que el modelo ha sido modificado para eliminar restricciones de seguridad y que incorpora predicción de múltiples tokens, una técnica de la familia Qwen3.8. Es relevante para desarrolladores e investigadores que necesitan un modelo multimodal capaz de ejecutarse localmente sin depender de APIs de pago. No se dispone de información sobre la licencia, los idiomas soportados ni la longitud de contexto en la documentación del repositorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text) |
| Parametros totales | 27.320.697.856 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | MXFP4 (GGUF) |
| Idiomas soportados | no disponible |
| Licencia | no disponible (el modelo base enlaza a una licencia) |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo base es Qwen/Qwen3.8-27B, un transformer denso multimodal desarrollado por Alibaba. Su arquitectura permite procesar entradas de imagen y texto simultáneamente, como indica el pipeline image-text-to-text. El repositorio de giocom es una cuantización en formato GGUF con MXFP4, un esquema de compresión de 4 bits que reduce significativamente el tamaño de los pesos.

No se han publicado detalles sobre el proceso de entrenamiento en la información disponible: se desconoce la composición del dataset, el número de tokens de entrenamiento y si se aplicaron técnicas como RLHF o DPO. Los tags "uncensored" y "abliterated" indican que el modelo ha sido modificado para eliminar restricciones de seguridad, probablemente mediante técnicas de abliteración, aunque no hay documentación técnica que lo confirme.

## Capacidades

- Entrada multimodal: acepta imágenes y texto, lo que permite tareas de vision-language como descripción de imágenes, respuesta a preguntas visuales o análisis de documentos escaneados.
- Generación de texto: al ser un modelo de lenguaje, puede producir respuestas en formato conversacional, tal como indica el tag "conversational".
- Modificación para eliminar filtros: los tags "uncensored" y "abliterated" sugieren que el modelo no aplica los mecanismos de alineación originales, lo que puede resultar en respuestas sin restricciones de contenido.
- Predicción de múltiples tokens (MTP): el tag "mtp" apunta a que el modelo incorpora esta técnica, que podría mejorar la velocidad de generación, aunque no hay datos oficiales.
- No se dispone de información sobre soporte de tool calling, function calling, agentes o razonamiento multi-step.

## Casos de uso

- Análisis de documentos escaneados: el modelo puede extraer información de imágenes de facturas, contratos o formularios y responder preguntas sobre su contenido, lo que resulta útil en entornos administrativos y legales.
- Atención al cliente con soporte visual: los usuarios pueden enviar capturas de pantalla o fotos de productos y el modelo las interpreta para resolver consultas, reduciendo la necesidad de intervención humana.
- Accesibilidad para personas con discapacidad visual: el modelo puede describir imágenes en tiempo real en aplicaciones móviles, facilitando la interacción con el entorno.
- Generación de descripciones para catálogos de productos: en comercio electrónico, puede crear descripciones a partir de imágenes de productos, automatizando el proceso de catalogación.
- Asistencia técnica con capturas de pantalla: el modelo puede analizar capturas de código, diagramas o interfaces de usuario para ayudar en la depuración y explicar errores.
- Moderación de contenido visual: aunque el modelo está marcado como "uncensored", podría utilizarse en sistemas de análisis de imágenes para detectar contenido inapropiado, siempre que se implementen filtros adicionales en la aplicación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- Según la guía de Atomic Chat, el modelo cabe en una GPU de 24 GB (por ejemplo, RTX 4090) o en un Mac de 32 GB con cuantización de 4 bits.
- El tamaño del repositorio es de 17.9 GB, lo que implica que la carga en memoria requiere al menos esa cantidad de VRAM o RAM.
- Puede ejecutarse con llama.cpp, Ollama o cualquier servidor compatible con formato GGUF.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No disponible. No se han encontrado datos suficientes para comparar este modelo con alternativas de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- Al estar marcado como "uncensored" y "abliterated", el modelo puede generar contenido inapropiado, peligroso o ilegal sin filtros de seguridad.
- La licencia no está especificada en el repositorio, lo que supone un riesgo legal para su uso comercial o en producción.
- No se dispone de información sobre los idiomas soportados, por lo que la calidad en lenguas distintas de las dominantes puede ser impredecible.
- La cuantización MXFP4 puede degradar ligeramente la calidad de las respuestas en comparación con el modelo original sin cuantizar.
- Existe riesgo de alucinación, especialmente en tareas visuales complejas donde el modelo debe interpretar imágenes.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/giocom/Qwen3.8-27B-MXFP4-GGUF
- Modelo base Qwen/Qwen3.8-27B: https://huggingface.co/Qwen/Qwen3.8-27B
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.8-27B/blob/main/LICENSE
- Guía de ejecución local (Atomic Chat): https://atomic.chat/blog/guides/how-to-run-qwen-3-8-locally
- Cuantización alternativa GGUF de Distillio: https://huggingface.co/Distillio/Qwen3.8-27B-GGUF
