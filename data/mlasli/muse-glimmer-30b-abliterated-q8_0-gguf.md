# mlasli/Muse-Glimmer-30B-Abliterated-Q8_0-GGUF

## Resumen

Muse Glimmer 30B Abliterated es una variante del modelo Muse Glimmer 30B, desarrollada por el usuario mlasli, que ha sido sometida a un proceso de "abliteration" para eliminar parcialmente los mecanismos internos de rechazo del modelo. El resultado es un modelo que se niega a responder a menos peticiones que el original, manteniendo la calidad de generación de texto. Esta versión concreta es la cuantización Q8_0 en formato GGUF, que ofrece una calidad casi sin pérdidas respecto al modelo en BF16, con un tamaño aproximado de 32 GB.

El modelo destaca por su capacidad multimodal: acepta entrada de imágenes cuando se combina con un proyector de visión (mmproj) incluido en el repositorio. La abliteración solo ha modificado el backbone de lenguaje, dejando intacto el codificador de visión. Con aproximadamente 27,85 mil millones de parámetros y licencia Apache 2.0, es una opción interesante para desarrolladores que necesitan un modelo de gran tamaño con menos restricciones de contenido y que pueda ejecutarse en hardware de gama alta.

La relevancia de este modelo radica en su enfoque de "uncensoring" mediante intervención a nivel de pesos, una técnica que está ganando atención en la comunidad open source. Sin embargo, es importante señalar que no se han publicado benchmarks formales sobre el modelo abliterado, y que la abliteración puede afectar sutilmente a la calidad de salida.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo de lenguaje multimodal con backbone de lenguaje y codificador de vision) |
| Parametros totales | 27.854.794.240 (~27,85B) |
| Parametros activos | no aplicable (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16 (referencia), FP16 GGUF, Q8_0 GGUF, Q6_K GGUF, Q4_K_M GGUF |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (Q8_0), safetensors (BF16 original) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Muse Glimmer 30B, un modelo de lenguaje multimodal que combina un backbone de lenguaje con un codificador de vision. La abliteración es una técnica de post-entrenamiento que modifica directamente los pesos del modelo para eliminar el comportamiento de rechazo aprendido. El proceso consistió en recopilar estados ocultos en las capas 33/52 (65% de profundidad) a partir de 256 pares de prompts dañinos y 256 inofensivos, calculando la dirección de rechazo como la diferencia normalizada entre las medias de ambos conjuntos (puntuación de separación: 86,34). Posteriormente, se restó un factor α = 0,15 multiplicado por la proyección de la dirección de rechazo de los pesos `o_proj` y `down_proj` en las 52 capas.

El resultado fue una reducción de la tasa de rechazo de 3/3 a 1/3 en prompts dañinos de prueba: las guías de hacking y ransomware ahora se responden, mientras que el contenido relacionado con armas sigue bloqueado. No se dispone de información detallada sobre el dataset de entrenamiento original, el número de tokens procesados o si se utilizaron técnicas como RLHF o DPO en el modelo base.

## Capacidades

- Generación de texto de alta calidad en formato Q8_0, prácticamente indistinguible del modelo en precisión completa.
- Entrada de imágenes mediante el proyector de visión `mmproj-Muse-Glimmer-30B-Q4_K_M.gguf` incluido en el repositorio, compatible con llama.cpp.
- Menor tasa de rechazo que el modelo original: responde a peticiones que el modelo base rechazaría, como guías de hacking o ransomware.
- Soporte para inferencia en CPU y GPU mediante llama.cpp y Ollama.
- Capacidad de generación de texto con contexto largo (el tamaño exacto de la ventana de contexto no está especificado).
- Compatible con herramientas de inferencia estándar del ecosistema GGUF.

## Casos de uso

- Generación de contenido creativo sin restricciones: el modelo puede utilizarse para escribir ficción, poesía o guiones que aborden temas sensibles que otros modelos rechazarían, gracias a su menor tasa de rechazo.
- Asistente de escritura técnica: su capacidad para generar texto detallado y coherente lo hace adecuado para redactar documentación técnica, tutoriales o explicaciones complejas sobre hardware o software.
- Análisis de imágenes con descripción: al incluir el proyector de visión, puede describir el contenido de fotografías o ilustraciones, útil para automatizar el etiquetado de imágenes o generar texto alternativo accesible.
- Desarrollo de chatbots conversacionales: su formato GGUF permite integrarlo fácilmente en aplicaciones de chat locales mediante Ollama o llama.cpp, ofreciendo respuestas más directas y menos evasivas que otros modelos.
- Investigación sobre técnicas de alineación: el modelo es un caso de estudio práctico de abliteración, útil para investigadores que estudian cómo los mecanismos de rechazo se codifican en los pesos y cómo pueden modificarse.
- Despliegue en entornos con recursos limitados: la cuantización Q8_0 ofrece un equilibrio entre calidad y tamaño, permitiendo ejecutar el modelo en GPUs de 48 GB como la A6000 o dual RTX 3090/4090, o incluso en CPU con 64 GB de RAM.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que no se ha realizado ninguna evaluación formal de benchmarks sobre el modelo abliterado. El autor señala que la abliteración puede afectar sutilmente a la calidad de salida, pero no proporciona datos cuantitativos al respecto.

## Requisitos de hardware

- VRAM estimada: aproximadamente 32 GB para el modelo Q8_0, más memoria adicional para el contexto. La model card recomienda 48 GB de VRAM para una GPU única o 64 GB de RAM para inferencia en CPU.
- GPUs recomendadas: A6000, dual RTX 3090 o dual RTX 4090 para caber en VRAM. Una RTX 4090 de 24 GB no es suficiente para el modelo completo en Q8_0.
- No cabe en GPUs de consumo de gama media (16 GB o menos) en esta cuantización. Para esas GPUs sería necesario usar Q4_K_M (~18 GB) o Q6_K (~25 GB).
- Opciones de despliegue: llama.cpp (con soporte para `llama-cli`, `llama-server` y `llama-mtmd-cli` para visión), Ollama mediante Modelfile, y cualquier otro runtime compatible con GGUF.
- Latencia y throughput: no disponibles. Dependerán del hardware y de la configuración de offload.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Muse Glimmer 30B Abliterated Q8_0 | ~27,85B | no disponible | Apache 2.0 | GGUF | Abliterado, multimodal |
| Muse Glimmer 30B (base) | ~27,85B | no disponible | Apache 2.0 | safetensors | Modelo original con mecanismos de rechazo intactos |
| Llama 3 30B (referencia de la categoria) | ~30B | 8K (tipico) | Llama 3 license | safetensors, GGUF | Modelo de referencia de la misma categoria, sin abliteracion |

No se dispone de datos de rendimiento comparativos entre estos modelos, ya que no se han publicado benchmarks del modelo abliterado. La comparativa se limita a características generales.

## Limitaciones y advertencias

- Modelo abliterado: ha sido modificado para rechazar menos peticiones, lo que significa que generará contenido que el modelo original rechazaría. El usuario es responsable de cumplir con las leyes aplicables.
- No es un modelo completamente "uncensored": algunos mecanismos de rechazo permanecen, especialmente relacionados con contenido sobre armas.
- La abliteración puede afectar sutilmente a la calidad de salida; el autor eligió un valor conservador de α = 0,15 para minimizar este efecto.
- No se han realizado evaluaciones formales de benchmarks sobre el modelo abliterado, por lo que se desconoce su rendimiento real en tareas estándar.
- La ventana de contexto no está especificada en la documentación disponible.
- Los idiomas soportados no están documentados.
- Para entrada de imágenes, Ollama no soporta actualmente archivos `mmproj` separados para esta arquitectura; es necesario usar llama.cpp.
- El modelo requiere hardware de gama alta: 48 GB de VRAM para GPU única o 64 GB de RAM para CPU.

## Enlaces

- Repositorio GGUF Q8_0: https://huggingface.co/mlasli/Muse-Glimmer-30B-Abliterated-Q8_0-GGUF
- Modelo base BF16: https://huggingface.co/mlasli/Muse-Glimmer-30B-Abliterated-BF16
- Cuantizacion FP16 GGUF: https://huggingface.co/mlasli/Muse-Glimmer-30B-Abliterated-FP16-GGUF
- Cuantizacion Q6_K GGUF: https://huggingface.co/mlasli/Muse-Glimmer-30B-Abliterated-Q6_K-GGUF
- Cuantizacion Q4_K_M GGUF: https://huggingface.co/mlasli/Muse-Glimmer-30B-Abliterated-Q4_K_M-GGUF
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
