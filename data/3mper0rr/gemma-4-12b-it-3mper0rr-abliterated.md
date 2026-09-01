# 3MPER0RR/gemma-4-12b-it-3MPER0RR-abliterated

## Resumen

El modelo **3MPER0RR/gemma-4-12b-it-3MPER0RR-abliterated** es una versión modificada del modelo multimodal Gemma 4 12B de Google, publicada por el usuario 3MPER0RR. Se trata de un modelo de tipo *image-text-to-text* que ha sido sometido a un proceso de "abliteración" (abliteration), una técnica que elimina o reduce los mecanismos de rechazo y alineación de seguridad del modelo original, con el objetivo de ampliar su rango de respuestas sin los filtros habituales.

El modelo base, Gemma 4 12B, es el primer modelo multimodal de tamaño medio sin codificador (encoder-free) de Google, capaz de procesar de forma nativa texto, imagen, audio y vídeo. Con 11.959.730.176 parámetros (aproximadamente 12B), ofrece una ventana de contexto de 256K tokens y está diseñado para ejecutarse en hardware de consumo, como portátiles con 16 GB de VRAM. La versión abliterada mantiene estas capacidades técnicas pero elimina las restricciones de contenido impuestas durante el entrenamiento.

La relevancia de este modelo radica en que combina las capacidades multimodales de Gemma 4 12B con una capa de seguridad eliminada, lo que lo hace interesante para investigación en alineación, estudios de comportamiento de modelos y casos de uso donde se requiere una generación de contenido sin restricciones. La licencia Apache 2.0 permite uso comercial y modificación sin restricciones significativas.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal sin codificador (encoder-free), basada en Gemma 4 12B |
| Parametros totales | 11.959.730.176 (aproximadamente 12B) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | 256.000 tokens (256K) |
| Tipos de cuantizacion | 4-bit (aproximadamente 6,7 GB), 8-bit, FP16 (según el modelo base) |
| Idiomas soportados | no disponible (el modelo base soporta múltiples idiomas, pero la ficha del autor no especifica) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo base Gemma 4 12B utiliza una arquitectura Transformer multimodal sin codificador (encoder-free), lo que significa que procesa directamente las entradas de imagen, audio y vídeo sin necesidad de un codificador visual o auditivo separado. Esta arquitectura unificada permite que el modelo maneje múltiples modalidades con un único conjunto de pesos, simplificando el despliegue y mejorando la eficiencia computacional. El modelo fue entrenado por Google DeepMind con un enfoque en la comprensión multimodal nativa, incluyendo transcripción de audio y comprensión de vídeo.

La versión abliterada de 3MPER0RR no modifica la arquitectura subyacente, sino que aplica una técnica de post-procesamiento que elimina o atenúa las direcciones en el espacio de activaciones responsables de los comportamientos de rechazo y alineación. Este proceso, similar al aplicado por la comunidad en otros modelos como Llama o Mistral, se realiza mediante análisis de activaciones y modificación de pesos. No se dispone de información detallada sobre el dataset de entrenamiento original ni sobre el proceso exacto de abliteración aplicado por el autor.

## Capacidades

- Generación de texto multimodal: el modelo puede procesar y generar texto a partir de entradas de imagen, audio, vídeo y texto, manteniendo las capacidades del modelo base Gemma 4 12B.
- Comprensión de imágenes: puede describir imágenes, responder preguntas sobre su contenido y realizar tareas de razonamiento visual.
- Procesamiento de audio: soporta entrada de audio para transcripción y comprensión, siendo el mejor de la familia Gemma 4 en esta tarea según el modelo base.
- Comprensión de vídeo: puede procesar secuencias de vídeo y responder sobre su contenido.
- Razonamiento y conversación: mantiene las capacidades de razonamiento multi-turno y generación de texto del modelo base.
- Generación sin restricciones: al estar abliterado, el modelo no aplica los rechazos de seguridad habituales, lo que permite respuestas en temas que el modelo original bloquearía.
- Soporte de tool calling: no disponible en la información proporcionada, aunque el modelo base Gemma 4 12B incluye esta capacidad.
- Capacidades multilingües: no especificadas en la ficha, aunque el modelo base soporta múltiples idiomas.

## Casos de uso

- Investigación en alineación y seguridad de IA: el modelo permite estudiar el comportamiento de un modelo multimodal sin capas de seguridad, facilitando la investigación sobre sesgos, alucinaciones y mecanismos de rechazo en modelos de gran tamaño.
- Generación creativa de contenido multimodal: puede utilizarse para crear descripciones, narraciones o guiones a partir de imágenes, audio o vídeo sin las restricciones de contenido del modelo original, útil en proyectos artísticos o de ficción.
- Desarrollo de asistentes conversacionales especializados: su capacidad para procesar múltiples modalidades y su falta de filtros lo hacen adecuado para asistentes en dominios técnicos o científicos donde el contenido sensible no es un problema.
- Análisis de contenido audiovisual: puede transcribir audio, describir vídeos y extraer información de imágenes en entornos de investigación donde se requiere un análisis sin censura previa.
- Fine-tuning para dominios específicos: al estar basado en Gemma 4 12B y tener licencia Apache 2.0, puede ajustarse para tareas concretas como resumen de vídeo, generación de subtítulos o análisis de documentos multimodales.
- Evaluación comparativa de modelos abliterados: sirve como referencia para comparar el rendimiento de modelos con y sin alineación de seguridad en tareas multimodales, útil para la comunidad de investigación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor no proporciona métricas de rendimiento específicas para esta versión abliterada. Los benchmarks del modelo base Gemma 4 12B están disponibles en la documentación oficial de Google DeepMind, pero no se incluyen aquí al no estar directamente relacionados con esta modificación.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 6,7 GB en cuantización 4-bit, 12-14 GB en 8-bit y 24 GB en FP16.
- GPU recomendadas: RTX 4090 (24 GB), RTX 4080 (16 GB), A100 (40 GB o 80 GB), H100 (80 GB). El modelo base está diseñado para funcionar en portátiles con 16 GB de VRAM.
- Compatibilidad con GPU de consumo: sí, cabe en GPUs consumer de gama alta como la RTX 4090 y en portátiles con 16 GB de VRAM en cuantización 4-bit.
- Opciones de despliegue: vLLM, llama.cpp, Ollama, TGI (Text Generation Inference), Hugging Face Transformers.
- Latencia y throughput: no disponible en la información proporcionada. Dependerá del hardware y la cuantización utilizada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Multimodal | Licencia | Abliterado |
|---|---|---|---|---|---|
| 3MPER0RR/gemma-4-12b-it-3MPER0RR-abliterated | 12B | 256K | Sí (texto, imagen, audio, vídeo) | Apache 2.0 | Sí |
| google/gemma-4-12B (original) | 12B | 256K | Sí (texto, imagen, audio, vídeo) | Apache 2.0 | No |
| huihui-ai/Huihui-gemma-4-12B-it-abliterated | 12B | 256K | Sí (texto, imagen, audio, vídeo) | Apache 2.0 | Sí |

La principal diferencia entre el modelo de 3MPER0RR y el de huihui-ai radica en el proceso de abliteración aplicado, que puede variar en metodología y resultados. Ambos parten del mismo modelo base de Google y mantienen las mismas especificaciones técnicas. El modelo original de Google incluye las capas de seguridad estándar.

## Limitaciones y advertencias

- Sesgos conocidos: al ser una versión abliterada, el modelo puede generar contenido ofensivo, ilegal o peligroso sin restricciones. No se han documentado sesgos específicos de esta versión, pero hereda los sesgos del modelo base.
- Riesgo de alucinación: el modelo puede generar información falsa o inventada, especialmente en tareas multimodales donde la comprensión del contexto visual o auditivo puede ser incompleta.
- Limitaciones de contexto: aunque la ventana de contexto es de 256K tokens, el rendimiento puede degradarse con entradas muy largas o complejas.
- Restricciones de licencia: la licencia Apache 2.0 permite uso comercial y modificación, pero el usuario es responsable del uso que haga del modelo, especialmente al eliminar las capas de seguridad.
- Advertencia para producción: no se recomienda su uso en entornos de producción donde se requiera moderación de contenido o cumplimiento normativo, ya que la falta de alineación puede generar respuestas inapropiadas.
- Idiomas: no se especifican los idiomas soportados en la ficha, aunque el modelo base de Google soporta múltiples idiomas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/3MPER0RR/gemma-4-12b-it-3MPER0RR-abliterated
- Modelo base de Google: https://huggingface.co/google/gemma-4-12B
- Versión abliterada de huihui-ai: https://huggingface.co/huihui-ai/Huihui-gemma-4-12B-it-abliterated
- Página oficial de Gemma 4 en Google DeepMind: https://deepmind.google/models/gemma/gemma-4/
- Guía para desarrolladores de Gemma 4 12B: https://developers.googleblog.com/gemma-4-12b-the-developer-guide/
- Sitio informativo sobre Gemma 4 12B: https://gemmai4.com/gemma4-12b/
