# dbgworld/Huihui-Qwen3-Coder-30B-A3B-Instruct-abliterated-Q4_K_M-GGUF

## Resumen

Este repositorio contiene una cuantización GGUF Q4_K_M del modelo Huihui-Qwen3-Coder-30B-A3B-Instruct-abliterated, una variante "abliterated" (sin las capas de rechazo alineadas) del Qwen3-Coder-30B-A3B-Instruct de Alibaba. El trabajo de conversión y publicación lo firma el usuario dbgworld, que empleó el espacio GGUF-my-repo de ggml.ai para generar el fichero GGUF a partir de los pesos originales. Se trata, por tanto, de un artefacto derivado de terceros, no de un modelo entrenado desde cero.

El modelo subyacente es un transformer de tipo Mixture-of-Experts con 30.532.122.624 parámetros totales y aproximadamente 3.300 millones de parámetros activos por token (de ahí la nomenclatura A3B), diseñado específicamente para tareas de generación de código. La variante abliterated elimina la dirección de rechazo del modelo original, de modo que responde a peticiones que el modelo base rechazaría por sus políticas de seguridad.

La relevancia de esta ficha es doble: por un lado, permite ejecutar en hardware de consumo un modelo de código de 30B totales gracias a la cuantización de 4 bits y a la arquitectura MoE dispersa; por otro, introduce consideraciones de seguridad y licencia que conviene evaluar antes de usarlo en producción, dado que el filtrado de contenido ha sido suprimido deliberadamente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Mixture-of-Experts (MoE) disperso, derivado de Qwen3-Coder-30B-A3B-Instruct |
| Parametros totales | 30.532.122.624 |
| Parametros activos | Aproximadamente 3.300 millones por token (según nomenclatura A3B del modelo base) |
| Longitud de contexto | No disponible en la información proporcionada (el modelo base Qwen3-Coder soporta contexto largo, pero no se confirma en esta ficha) |
| Tipos de cuantizacion | Q4_K_M (única variante publicada en este repositorio) |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (fichero huihui-qwen3-coder-30b-a3b-instruct-abliterated-q4_k_m.gguf) |

## Arquitectura y entrenamiento

El modelo base es un transformer de tipo Mixture-of-Experts con 30.532 millones de parámetros totales de los que se activan aproximadamente 3.300 millones por token, lo que reduce el coste computacional de inferencia respecto a un modelo denso del mismo tamaño. La variante abliterated se obtiene mediante la técnica de abliteration, que identifica la dirección de activación asociada al rechazo de peticiones y la proyecta fuera de los pesos, de forma que el modelo deja de negarse a responder a ciertos tipos de prompts.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron fases de RLHF o DPO en el modelo original, ya que la model card de este repositorio es una plantilla generada automáticamente por GGUF-my-repo y remite al modelo base sin detallar el proceso de entrenamiento. Tampoco se documenta en esta ficha ninguna innovación técnica adicional más allá de la cuantización Q4_K_M aplicada por llama.cpp.

## Capacidades

- Generación de texto y código: el modelo está especializado en tareas de programación (Coder), incluyendo generación, completado y explicación de código en múltiples lenguajes.
- Razonamiento sobre código: al derivar de Qwen3-Coder, se espera capacidad para resolver problemas de lógica de programación y depuración, aunque no se documenta explícitamente en esta ficha.
- Respuestas sin filtrado de rechazo: la variante abliterated elimina las negativas automáticas del modelo base, permitiendo respuestas a prompts que el original rechazaría.
- Soporte de tool calling y function calling: no confirmado en la información disponible para esta variante, aunque el modelo base Qwen3-Coder lo incluye.
- Capacidades de agente y razonamiento multi-paso: no confirmadas explícitamente en esta ficha.
- Multilingüismo: limitado a inglés según la etiqueta de idioma del repositorio.
- Modo thinking: no disponible en la información proporcionada.

## Casos de uso

- Asistente de programación local sin conexión: el fichero GGUF Q4_K_M (18,6 GB) puede ejecutarse con llama.cpp en una estación de trabajo con GPU de 24 GB o con CPU y suficiente RAM, permitiendo autocompletado y generación de código sin enviar datos a servicios externos.
- Generación de código en pipelines de CI/CD: integrable mediante llama-server para tareas de generación de tests, documentación o parches automáticos, aprovechando la licencia Apache 2.0 para uso comercial.
- Investigación sobre alineación y seguridad: la variante abliterated es útil para estudiar cómo la supresión de la dirección de rechazo afecta al comportamiento del modelo en tareas de red teaming y evaluación de sesgos.
- Prototipado de herramientas de refactorización: el modelo puede emplearse para reescribir fragmentos de código y sugerir mejoras estructurales en entornos de desarrollo con recursos limitados.
- Educación y análisis de código: explicación de fragmentos, generación de comentarios y traducción entre lenguajes de programación en entornos docentes sin infraestructura cloud.
- Evaluación comparativa de cuantizaciones: sirve como punto de referencia para medir la pérdida de calidad de Q4_K_M frente a los pesos originales en tareas de código, dado que el repositorio incluye únicamente esta cuantización.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 18,6 GB para el fichero Q4_K_M, más overhead de contexto; se recomienda al menos 20-24 GB de VRAM para contexto moderado.
- GPU recomendadas: RTX 3090, RTX 4090, A100 40 GB, H100; también puede ejecutarse en GPUs de 24 GB con contexto limitado.
- Cabe en GPU de consumo: sí, en RTX 3090/4090 (24 GB) con contexto reducido; en GPUs de 16 GB requeriría offloading parcial a CPU.
- Opciones de despliegue: llama.cpp (llama-cli, llama-server), y potencialmente otros runners compatibles con GGUF como Ollama o LM Studio, aunque no se documentan en la ficha.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros totales | Activos | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| Este modelo (Qwen3-Coder-30B-A3B abliterated Q4_K_M) | 30,5B | ~3,3B | No disponible | Apache 2.0 | GGUF |
| Qwen3-Coder-30B-A3B-Instruct (original) | 30,5B | ~3,3B | No disponible en esta ficha | Apache 2.0 | Safetensors |
| Huihui-Qwen3-Coder-30B-A3B-Instruct-abliterated (base de esta cuantización) | 30,5B | ~3,3B | No disponible | Apache 2.0 | Safetensors |

No se dispone de datos de rendimiento comparativo entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- El proceso de abliteration suprime el rechazo de peticiones, lo que puede producir contenido inapropiado, peligroso o ilegal; no es apto para aplicaciones orientadas al público sin capas adicionales de moderación.
- Riesgo de alucinación inherente a los modelos de lenguaje, agravado en tareas de código donde puede generar APIs o funciones inexistentes.
- Idiomas soportados limitados a inglés según la etiqueta del repositorio; el rendimiento en castellano no está garantizado.
- La licencia Apache 2.0 permite uso comercial, pero el usuario debe evaluar el cumplimiento de las políticas de contenido aplicables a su jurisdicción y sector.
- La model card es una plantilla automática; no hay documentación del autor sobre el proceso de cuantización, posibles degradaciones o validación del fichero GGUF.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia comunitaria de su funcionamiento.
- La longitud de contexto efectiva no está documentada en esta ficha; el ejemplo de la model card usa `-c 2048`, lo que sugiere un uso conservador.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/dbgworld/Huihui-Qwen3-Coder-30B-A3B-Instruct-abliterated-Q4_K_M-GGUF
- Modelo base (abliterated): https://huggingface.co/huihui-ai/Huihui-Qwen3-Coder-30B-A3B-Instruct-abliterated
- Modelo original Qwen3-Coder-30B-A3B-Instruct: https://huggingface.co/Qwen/Qwen3-Coder-30B-A3B-Instruct
- Licencia del modelo original: https://huggingface.co/Qwen/Qwen3-Coder-30B-A3B-Instruct/blob/main/LICENSE
- Espacio GGUF-my-repo: https://huggingface.co/spaces/ggml-org/gguf-my-repo
- Repositorio llama.cpp: https://github.com/ggerganov/llama.cpp
