# mondk/MiniCPM5-2B-Abliterated-Uncensored-Safetensors-Q5_K_M-GGUF

## Resumen

El modelo `mondk/MiniCPM5-2B-Abliterated-Uncensored-Safetensors-Q5_K_M-GGUF` es una conversión a formato GGUF (cuantización Q5_K_M) de una variante "abliterated" y "uncensored" del modelo MiniCPM5-2B. El modelo base fue desarrollado por OpenBMB, y la conversión GGUF ha sido realizada por el usuario `mondk`. MiniCPM5-2B es un Transformer denso de aproximadamente 2.500 millones de parámetros, diseñado para despliegue en dispositivos locales y escenarios con recursos limitados. La versión que nos ocupa elimina las capas de alineación y seguridad del modelo original mediante un proceso de "abliteración", lo que permite generar contenido sin las restricciones habituales de los modelos alineados.

La relevancia de este modelo radica en su tamaño compacto y su formato GGUF, que permite ejecutarlo fácilmente con `llama.cpp` en hardware modesto, incluyendo CPU y GPUs de gama baja. Es una opción interesante para desarrolladores e investigadores que necesitan un modelo pequeño, sin censura, para experimentación o aplicaciones locales donde la privacidad es prioritaria. No se han publicado en la información disponible datos sobre la longitud de contexto, idiomas soportados ni benchmarks de rendimiento.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso |
| Parametros totales | 2.516.756.480 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q5_K_M (GGUF) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantización Q5_K_M) |

## Arquitectura y entrenamiento

El modelo base MiniCPM5-2B es un Transformer denso de 2B parámetros, que escala la receta de entrenamiento de MiniCPM5-1B. Está orientado a despliegue on-device, local y en escenarios con recursos limitados, alcanzando el estado del arte en su clase según OpenBMB. No se han proporcionado en la información disponible datos sobre el número de tokens de entrenamiento, la composición del dataset ni la aplicación de técnicas como RLHF o DPO en el modelo base.

La variante "abliterated" y "uncensored" ha sido creada mediante un proceso de abliteración que elimina las capas de seguridad y alineación del modelo original. Este proceso no está documentado en la información disponible, por lo que se desconocen los detalles técnicos específicos de cómo se ha aplicado. El resultado es un modelo que no aplica las restricciones de contenido habituales de los modelos alineados.

## Capacidades

- Generación de texto: el modelo es un LLM denso de 2B, capaz de generar texto a partir de prompts. No se han publicado especificaciones sobre idiomas, pero es razonable esperar soporte multilingüe dado el origen del modelo base.
- Razonamiento: no se han publicado benchmarks específicos de razonamiento en la información disponible.
- Código y matemáticas: no se han publicado datos al respecto.
- Tool calling / function calling: no disponible.
- Soporte de agentes y multi-step reasoning: no disponible.
- Capacidades multilingües: no disponible.
- Capacidad especial: la variante "abliterated" elimina las restricciones de seguridad del modelo base, permitiendo generar contenido que normalmente sería rechazado por modelos alineados.

## Casos de uso

- Chat local sin restricciones: el modelo puede ejecutarse mediante `llama.cpp` en un ordenador personal para crear un asistente conversacional que no filtre contenido. Es adecuado porque la versión abliterada elimina las capas de seguridad, y el formato GGUF permite una instalación sencilla.
- Investigación en seguridad de IA: los investigadores pueden comparar el comportamiento del modelo base con el abliterado para estudiar el impacto de la abliteración en la alineación. El tamaño pequeño (2B) facilita experimentos en hardware modesto.
- Generación de contenido creativo: escritura de ficción, guiones o textos publicitarios sin restricciones de tono o tema. El modelo puede generar contenido que los modelos alineados rechazan, útil para explorar estilos narrativos.
- Asistente en dispositivos embebidos: con un tamaño de archivo de 1.8 GB, puede desplegarse en una Raspberry Pi o un mini PC para tareas de procesamiento de texto en local, sin conexión a internet.
- Automatización de tareas de texto en entornos aislados: resumen de documentos, extracción de información o clasificación de correos, donde la privacidad es crítica y no se pueden enviar datos a la nube.
- Prototipado de agentes conversacionales: usando `llama-server`, se puede integrar en aplicaciones que requieren respuestas rápidas y sin censura, como bots de entretenimiento o simulaciones de personajes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se dispone de datos de rendimiento en tareas como MMLU, HumanEval, GSM8K ni comparaciones con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: el archivo GGUF Q5_K_M pesa aproximadamente 1.8 GB. Para inferencia en GPU se recomienda al menos 2 GB de VRAM, siendo 4 GB más cómodo. En CPU, se necesitan alrededor de 2 GB de RAM libre.
- GPU recomendadas: NVIDIA RTX 3050 (4 GB), RTX 4060 (8 GB) o cualquier GPU con 4 GB o más de VRAM. También puede ejecutarse en CPU con soporte AVX2.
- Compatibilidad con consumer GPU: sí, el modelo cabe en GPUs de gama baja y media.
- Opciones de despliegue: `llama.cpp` (CLI y servidor), Ollama (importando el archivo GGUF), LM Studio, y cualquier otro runtime compatible con GGUF.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| MiniCPM5-2B Abliterated (este modelo) | 2.5B | no disponible | Apache 2.0 | GGUF en HuggingFace |
| MiniCPM5-2B-Base | 2.5B | no disponible | Apache 2.0 | Safetensors en HuggingFace |
| MiniCPM5-1B | ~1B | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks comparativos para estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Al ser una versión "abliterated", se han eliminado capas de alineación y seguridad. Esto puede resultar en la generación de contenido dañino, ilegal o inapropiado, y el modelo puede ser más propenso a respuestas sesgadas o tóxicas.
- No se han publicado benchmarks de seguridad ni de sesgos en la información disponible.
- La longitud de contexto no se especifica. En los ejemplos de uso con `llama.cpp` se emplea `-c 2048`, pero no se confirma que sea la longitud máxima del modelo.
- El modelo es una conversión GGUF realizada por un tercero; no hay garantías de que la cuantización preserve completamente las capacidades del modelo original.
- La licencia Apache 2.0 permite uso comercial, pero el uso del modelo "uncensored" puede violar los términos de servicio de plataformas que prohíben contenido ofensivo.
- Riesgo de alucinación: los modelos pequeños tienden a alucinar más; no se han publicado métricas de fiabilidad.

## Enlaces

- HuggingFace del modelo: https://huggingface.co/mondk/MiniCPM5-2B-Abliterated-Uncensored-Safetensors-Q5_K_M-GGUF
- Modelo base (safetensors): https://huggingface.co/mondk/MiniCPM5-2B-Abliterated-Uncensored-Safetensors
- Modelo original de OpenBMB: https://huggingface.co/openbmb/MiniCPM5-2B-Base
- GitHub de OpenBMB/MiniCPM: https://github.com/OpenBMB/MiniCPM
- Repositorio de llama.cpp: https://github.com/ggerganov/llama.cpp
