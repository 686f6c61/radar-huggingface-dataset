# mradermacher/Qwen3.8-27B-Uncensored-FP8-i1-GGUF

## Resumen

Este repositorio contiene una colección de cuantizaciones GGUF con matriz de importancia (imatrix) del modelo Qwen3.8-27B-Uncensored-FP8, creadas por el usuario mradermacher. El modelo subyacente es una versión "uncensored" de Qwen3.8-27B, un modelo de lenguaje de 27 320 millones de parámetros perteneciente a la familia Qwen 3.8, que ha sido modificado para reducir significativamente la tasa de rechazo de peticiones (según la descripción del repositorio de origen). La distribución en formato GGUF permite ejecutar el modelo en hardware local mediante motores como llama.cpp u Ollama, sin necesidad de GPU de gran tamaño si se eligen cuantizaciones pequeñas.

La relevancia de este modelo radica en su carácter "sin censura", que lo hace atractivo para desarrolladores que necesitan un asistente conversacional con menos restricciones temáticas, así como por la disponibilidad de múltiples niveles de cuantización (desde Q2_K hasta Q6_K) que permiten ajustar el consumo de memoria y la calidad de salida según el hardware disponible. No obstante, la información oficial sobre arquitectura, entrenamiento y licencia es escasa, por lo que se recomienda precaución antes de usarlo en entornos de producción.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | 27 320 697 856 (27,3 B) |
| Parametros activos | no disponible (no se confirma si es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, IQ3_M, Q4_K_S, IQ3_XXS, Q3_K_M, small-IQ4_NL, Q4_K_M, IQ2_M, Q6_K, IQ4_XS, Q2_K_S, IQ1_M, Q3_K_S, IQ2_XXS, Q3_K_L, IQ2_XS, Q5_K_S, IQ2_S, IQ1_S, Q5_K_M, Q4_0, IQ3_XS, Q4_1, IQ3_S |
| Idiomas soportados | no disponible |
| Licencia | no disponible (fuentes externas indican Apache-2.0, sin confirmar) |
| Formato de pesos | GGUF (con imatrix) |

## Arquitectura y entrenamiento

No se dispone de información oficial sobre la arquitectura interna del modelo base Qwen3.8-27B. Dado que pertenece a la familia Qwen, es probable que sea un transformer decoder-only, pero este dato no está confirmado en la documentación proporcionada. Tampoco se conocen los detalles del entrenamiento (número de tokens, composición del dataset, uso de RLHF o DPO, etc.) del modelo original.

Lo que sí se sabe es que el repositorio actual es una cuantización de un checkpoint FP8 (Qwen3.8-27B-Uncensored-FP8) creado por orcarouter, y que se han aplicado técnicas de imatrix (importance matrix) para optimizar la distribución de los pesos cuantizados y reducir la pérdida de calidad. Además, según la descripción de AIAny, el modelo incorpora una "Heretic weight edit" que reduce la tasa de rechazo, y mantiene la cabeza de draft especulativa MTP (Multi-Token Prediction), lo que podría acelerar la inferencia en ciertos motores.

## Capacidades

- Generación de texto conversacional: el tag "conversational" indica que está orientado a diálogos multi-turno.
- Menor tasa de rechazo: al ser una versión "uncensored", responde a peticiones que otros modelos rechazarían por contenido sensible o controvertido.
- Ejecución local: al estar en formato GGUF, se puede integrar en aplicaciones que usen llama.cpp, Ollama u otros motores compatibles.
- Soporte de cuantizaciones variadas: permite elegir entre distintos niveles de compresión para ajustar el equilibrio entre memoria y calidad.
- No se documentan capacidades específicas como tool calling, agentes, visión o audio en la información proporcionada.

## Casos de uso

- Chatbot local sin restricciones temáticas: se puede desplegar en una máquina personal con Ollama o llama.cpp para mantener conversaciones sobre cualquier tema, incluidos aquellos que otros modelos evitan, como discusiones políticas, religiosas o de contenido adulto.
- Generación de contenido creativo: escritura de ficción, guiones o diálogos que requieran un tono menos autocensurado, por ejemplo para proyectos de narrativa interactiva.
- Asistente de programación en entornos aislados: al ejecutarse localmente, puede usarse en entornos con políticas de seguridad estrictas sin enviar datos a la nube, aunque no se confirma soporte de tool calling.
- Investigación sobre alineación y censura: permite estudiar cómo afecta la eliminación de capas de rechazo al comportamiento del modelo, comparando con la versión original de Qwen3.8-27B.
- Prototipado rápido de aplicaciones de diálogo: gracias a las cuantizaciones pequeñas (Q2_K, IQ2_M), se puede ejecutar en GPUs con 8-12 GB de VRAM, lo que facilita el desarrollo y pruebas en equipos de consumo.
- Educación y demostraciones: útil para mostrar el impacto de la cuantización en la calidad del texto, ya que el repositorio incluye múltiples niveles con imatrix y mediciones de perplejidad publicadas en AIAny.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se proporcionan métricas como MMLU, HumanEval o GSM8K para este modelo ni para sus cuantizaciones. Tampoco hay comparaciones con otros modelos de tamaño similar.

## Requisitos de hardware

- VRAM estimada: depende de la cuantización elegida. Para Q4_K_M (~16,8 GB según el repositorio de GitHub) se necesitan al menos 16-20 GB de VRAM. Las cuantizaciones más pequeñas (Q2_K, IQ1_S) pueden caber en 6-8 GB, mientras que Q6_K requerirá más de 24 GB.
- GPU recomendadas: para las cuantizaciones pequeñas, tarjetas como RTX 3060 (12 GB) o RTX 4060 Ti (16 GB) son suficientes. Para las más grandes, se recomienda RTX 4090 (24 GB) o GPUs de datacenter como A100 o H100.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio y otros motores compatibles con GGUF. También se puede usar vLLM si se convierte a safetensors, aunque el formato nativo es GGUF.
- Latencia y throughput: no disponibles. Dependerán del hardware y de la cuantización seleccionada.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa con otros modelos de la misma categoría. El modelo base Qwen3.8-27B no está documentado en los datos proporcionados, y no se conocen alternativas "uncensored" de tamaño similar con las que contrastarlo. Por tanto, esta sección queda sin datos.

## Limitaciones y advertencias

- La licencia no está especificada en la model card, lo que genera incertidumbre jurídica para uso comercial. Aunque fuentes externas mencionan Apache-2.0, no hay confirmación oficial.
- Al ser un modelo "uncensored", puede generar contenido ofensivo, ilegal o dañino. El usuario asume toda la responsabilidad de su uso.
- No se documentan sesgos específicos, pero al derivarse de un modelo base no alineado, es probable que herede sesgos sociales, culturales o de género no mitigados.
- Riesgo de alucinaciones: como cualquier modelo de lenguaje, puede producir información falsa o inventada, especialmente en temas de actualidad o datos precisos.
- La longitud de contexto no está especificada; si se desconoce, podría ser inferior a la de otros modelos modernos, limitando su uso en tareas que requieran ventanas largas.
- La calidad de las cuantizaciones, aunque usa imatrix, no está garantizada; se recomienda validar el rendimiento en el caso de uso concreto antes de desplegarlo en producción.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/mradermacher/Qwen3.8-27B-Uncensored-FP8-i1-GGUF
- Repositorio HuggingFace (variante i1): https://huggingface.co/mradermacher/Qwen3.8-27B-Uncensored-i1-GGUF
- Repositorio GitHub del proyecto: https://github.com/Wassimyounes01/qwen38-uncensored
- Página de vLLM Recipes para Qwen3.8-27B: https://recipes.vllm.ai/Qwen/Qwen3.8-27B
- Ficha en AIAny: https://aiany.app/item/qwen3-8-27b-uncensored-gguf
