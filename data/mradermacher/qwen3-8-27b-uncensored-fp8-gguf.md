# mradermacher/Qwen3.8-27B-Uncensored-FP8-GGUF

## Resumen

El modelo `mradermacher/Qwen3.8-27B-Uncensored-FP8-GGUF` es una cuantización GGUF de una versión "uncensored" (sin censura) del modelo Qwen3.8-27B, publicada por el usuario mradermacher, conocido por generar cuantizaciones listas para usar con llama.cpp y otros motores de inferencia. Esta variante concreta se basa en el repositorio `orcarouter/Qwen3.8-27B-Uncensored-FP8`, que a su vez es un derivado de Qwen3.8-27B modificado mediante técnicas de abliteración para eliminar los mecanismos de rechazo del modelo original, permitiendo respuestas sin restricciones de contenido. El modelo tiene 27.320.697.856 parámetros (27,3 mil millones) y se distribuye en formato GGUF, lo que facilita su ejecución en hardware de consumo y en entornos de producción con herramientas como llama.cpp, Ollama o vLLM. Su relevancia radica en ofrecer una alternativa sin filtros a un modelo de razonamiento de última generación, útil para casos donde se requiere explorar contenido no moderado, aunque con los riesgos asociados a este tipo de modificaciones.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (se infiere transformer, similar a Qwen3.8-27B) |
| Parametros totales | 27.320.697.856 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF (el nombre indica FP8; el autor menciona en comentarios quants adicionales: f16, Q4_K_S, Q2_K, Q8_0, Q6_K, Q3_K_M, Q3_K_S, Q3_K_L, Q4_K_M, Q5_K_S, Q5_K_M, IQ4_XS) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura interna del modelo base ni sobre el proceso de entrenamiento de la versión "uncensored". Según los resultados de búsqueda, el modelo original Qwen3.8-27B es un transformer denso con 27 mil millones de parámetros, desarrollado por Alibaba, con capacidades de razonamiento avanzado y soporte multilingüe. La variante "uncensored" se ha obtenido mediante una técnica de abliteración, que consiste en modificar los pesos del modelo para eliminar la dirección de rechazo (refusal direction) en el espacio de activaciones, permitiendo que el modelo responda a peticiones que normalmente bloquearía. Un artículo de MindStudio menciona una metodología basada en KL-drift y pruebas de rechazo con jueces automáticos, pero no hay confirmación de que este repositorio concreto utilice exactamente ese método. Tampoco se especifican los datos de entrenamiento, el número de tokens ni si se aplicó RLHF o DPO adicional.

## Capacidades

- Generación de texto y conversación multirronda (etiqueta `conversational`).
- Compatible con endpoints de inferencia (etiqueta `endpoints_compatible`).
- Al ser una versión sin censura, responde a peticiones que el modelo original rechazaría, incluyendo contenido potencialmente ofensivo, ilegal o sensible.
- Se espera que herede las capacidades de razonamiento, matemáticas y código del modelo base Qwen3.8-27B, aunque no se ha verificado en esta ficha.
- No se ha confirmado soporte para tool calling, agentes o modo de pensamiento explícito.

## Casos de uso

- Generación de contenido creativo sin restricciones: escritura de ficción, poesía o guiones que aborden temas tabú o controvertidos sin filtros automáticos.
- Investigación en seguridad de IA: análisis de comportamientos no moderados para estudiar sesgos, alucinaciones o riesgos de modelos sin alineación.
- Simulación de diálogos en entornos de prueba: creación de chatbots para evaluar la robustez de sistemas de moderación frente a entradas maliciosas.
- Desarrollo de asistentes especializados en dominios donde la censura limita la utilidad, como educación sexual, asesoramiento legal o médico sin restricciones (con advertencias).
- Pruebas de jailbreak y evaluación de mecanismos de seguridad: comparar el comportamiento del modelo original frente a esta versión para entender cómo funciona la abliteración.
- Despliegue en entornos de desarrollo donde se necesita un modelo de lenguaje grande sin políticas de contenido, por ejemplo, para generación de datos sintéticos en investigación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos de MMLU, HumanEval, GSM8K ni comparaciones con otros modelos.

## Requisitos de hardware

- El modelo tiene 27,3 mil millones de parámetros. En precisión FP16, la inferencia requeriría aproximadamente 54 GB de VRAM.
- Con cuantizaciones GGUF típicas: Q4_K_M (~16,8 GB según el repositorio GitHub mencionado), Q8_0 (~27 GB), Q2_K (~9 GB).
- El repositorio actual tiene un tamaño de 1,6 GB, lo que sugiere que contiene una cuantización de muy baja precisión (posiblemente Q2_K o similar), que podría ejecutarse en GPUs de consumo con 4-6 GB de VRAM, aunque con pérdida de calidad.
- GPU recomendadas: para cuantizaciones altas, una RTX 4090 (24 GB) o A100 (40-80 GB). Para cuantizaciones bajas, una RTX 3060 (12 GB) o incluso GPUs de 8 GB.
- Opciones de despliegue: llama.cpp, Ollama, vLLM, TGI, o cualquier motor compatible con GGUF.
- Latencia y throughput no disponibles; dependen del hardware y la cuantización elegida.

## Comparativa con modelos similares

No se dispone de información suficiente para comparar con alternativas concretas. Se puede mencionar que el modelo base Qwen3.8-27B es comparable a otros modelos de 27B como Llama 3.1 27B o Mistral 27B, pero no hay datos de rendimiento de esta versión modificada. La versión "uncensored" se diferencia principalmente por su política de contenido, no por su capacidad técnica.

## Limitaciones y advertencias

- Al ser una versión "uncensored", el modelo puede generar contenido ofensivo, ilegal, peligroso o éticamente cuestionable. No debe usarse en aplicaciones orientadas al público sin supervisión humana.
- Riesgo elevado de alucinaciones, especialmente en temas sensibles, al no contar con el alineamiento original.
- La licencia no está especificada; el modelo base Qwen3.8-27B probablemente tenga licencia Apache 2.0, pero la modificación puede tener restricciones adicionales. No se recomienda uso comercial sin verificar.
- La técnica de abliteración puede degradar el rendimiento general del modelo o introducir comportamientos impredecibles.
- No hay garantías de soporte ni mantenimiento por parte del autor.
- El tamaño reducido del repositorio (1,6 GB) indica una cuantización muy agresiva, lo que puede afectar significativamente la calidad de las respuestas.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/mradermacher/Qwen3.8-27B-Uncensored-FP8-GGUF
- Repositorio base FP8: https://huggingface.co/orcarouter/Qwen3.8-27B-Uncensored-FP8
- Otra cuantización del mismo autor: https://huggingface.co/mradermacher/Qwen3.8-27B-Uncensored-GGUF
- Cuantización de unsloth: https://huggingface.co/unsloth/Qwen3.8-27B-GGUF
- Repositorio GitHub con instrucciones: https://github.com/Wassimyounes01/qwen38-uncensored
- Artículo sobre abliteración: https://www.mindstudio.ai/blog/qwen3-8-27b-aeon-uncensored-abliteration
- Artículo sobre overthinking: https://dev.to/kaixintelligence/qwen-38-27b-why-this-powerful-model-cant-stop-overthinking-and-how-to-fix-it-5dh6
