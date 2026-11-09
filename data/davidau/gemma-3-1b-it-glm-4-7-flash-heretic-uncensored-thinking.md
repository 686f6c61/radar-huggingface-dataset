# DavidAU/Gemma-3-1B-it-GLM-4.7-Flash-Heretic-Uncensored-Thinking

## Resumen

Gemma-3-1B-it-GLM-4.7-Flash-Heretic-Uncensored-Thinking es un ajuste fino del modelo Gemma 3 de 1B parámetros de Google, desarrollado por DavidAU. El modelo parte de una versión previamente "abliterated" (con los mecanismos de rechazo eliminados mediante la técnica Heretic) y se ha afinado adicionalmente con el dataset de razonamiento GLM-4.7-2000x de TeichAI, empleando Unsloth para el entrenamiento. El resultado es un modelo de texto en inglés con modo de razonamiento explícito (bloques `<think>`) y sin censura, orientado a escritura creativa y generación de ficción sin restricciones.

La relevancia de este modelo radica en su combinación de tamaño reducido (999.885.952 parámetros, aproximadamente 1B) con capacidades de razonamiento detallado y contexto de 32k tokens, lo que permite desplegarlo en hardware de consumo. Al estar basado en Gemma 3, hereda la arquitectura transformer de la familia Gemma 3, pero con las capas de alineación de seguridad eliminadas y un entrenamiento adicional sobre datos de razonamiento. La licencia Apache 2.0 facilita su uso comercial, aunque el contenido sin filtrar plantea consideraciones éticas importantes.

El modelo está publicado en Hugging Face con formato safetensors en bfloat16, con un tamaño de repositorio de 2.0 GB, y cuenta con 596 descargas y 11 likes en el momento de la consulta. Está etiquetado para text-generation-inference y es compatible con endpoints.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Gemma 3, variante gemma3_text) |
| Parametros totales | 999.885.952 (aproximadamente 1B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 32k tokens (según model card) |
| Tipos de cuantizacion | bfloat16 (16-bit); se recomiendan q5, q6, q8, 16-bit o Imatrix IQ3_M como mínimo; cuantizaciones por debajo de Q4 sin imatrix pueden entrar en bucles |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bfloat16) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura transformer de Gemma 3 (variante gemma3_text) con aproximadamente 1B de parámetros. El proceso de desarrollo parte de `DavidAU/gemma-3-1b-it-heretic-extreme-uncensored-abliterated`, un modelo al que se le aplicó la técnica Heretic para eliminar los rechazos (refusals), y posteriormente se afinó con el dataset `TeichAI/glm-4.7-2000x`, un conjunto de datos de razonamiento. El entrenamiento se realizó con Unsloth en hardware local (Linux, precisión de 16 bits).

La innovación principal es la combinación de la eliminación de censura (Heretic) con un ajuste fino orientado al razonamiento, lo que produce un modelo que genera cadenas de pensamiento detalladas entre etiquetas `<think>` y `</think>`. Según la model card, la divergencia KL respecto al modelo original es de 0.33 (considerada excelente, ya que valores inferiores a 1 indican poco daño), y la tasa de rechazos se reduce a 3/100 frente a 99/100 del modelo original. El razonamiento es estable frente a la temperatura (rango 0.1 a 2.5) y puede activarse explícitamente con el prefijo "think deeply:". No se especifica el número exacto de tokens de entrenamiento ni la composición detallada del dataset más allá de su origen.

## Capacidades

- Generación de texto en inglés con razonamiento explícito en bloques `<think>`.
- Escritura creativa y de ficción: relatos, tramas, subtramas, continuación de escenas, narrativa vívida, todos los géneros (ciencia ficción, romance, etc.).
- Modo de pensamiento ("thinking") activable mediante prompt de sistema, plantilla Jinja específica (`chat-template-thinking.jinja`) o el prefijo "think deeply:".
- Generación de contenido sin censura: el modelo no rechaza peticiones explícitas, aunque en algunos casos requiere direccionamiento adicional (por ejemplo, indicar el vocabulario o el tono deseado) para alcanzar el nivel de explicitud solicitado.
- Conversación multi-turno.
- No se documenta soporte de tool calling, function calling, agentes, visión, audio ni capacidades multilingües más allá del inglés.

## Casos de uso

- Escritura de ficción y relatos: el modelo puede generar tramas, subtramas y escenas completas en cualquier género, con prosa vívida y sin restricciones de contenido, gracias a su ajuste específico para narrativa.
- Continuación de escenas y diálogos: útil para autores que necesitan expandir un borrador o explorar variantes narrativas, con contexto de hasta 32k tokens para mantener coherencia en textos largos.
- Generación de contenido para rol y juegos de mesa: el modelo acepta prompts de sistema que definen personajes (por ejemplo, el Joker) y mantiene el rol con razonamiento interno, adecuado para motores de rol como SillyTavern o KoboldCpp.
- Prototipado de asistentes conversacionales sin filtros: en entornos de investigación donde se necesita estudiar el comportamiento de modelos sin alineación de seguridad, el modelo ofrece respuestas directas con razonamiento visible.
- Creación de contenido creativo para medios: guiones, diálogos y descripciones para proyectos que requieran lenguaje explícito o temas sensibles, con la advertencia de revisión humana posterior.
- Experimentación con razonamiento en modelos pequeños: investigadores pueden analizar cadenas de pensamiento en un modelo de 1B desplegable en hardware de consumo, comparando el efecto del ajuste fino con GLM-4.7 sobre la calidad del razonamiento.
- Generación de texto en local con privacidad: al caber en GPU de consumo y ofrecer cuantizaciones GGUF (aunque no se listan explícitamente en la información disponible, la model card menciona cuantizaciones q5, q6, q8 e Imatrix IQ3_M), puede ejecutarse en entornos offline.

## Benchmarks y rendimiento

La model card incluye los siguientes resultados de benchmarks (formato original: arc_challenge, arc_easy, boolq, hellaswag, openbookqa, piqa, winogrande):

| Benchmark | Resultado |
|---|---|
| ARC Challenge | 0.344 |
| ARC Easy | 0.512 |
| BoolQ | 0.694 |
| HellaSwag | 0.504 |
| OpenBookQA | 0.358 |
| PIQA | 0.720 |
| Winogrande | 0.552 |

No se proporcionan comparaciones con modelos similares en la información disponible. Los benchmarks fueron realizados por el equipo Nightmedia según la model card.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 2 GB en bfloat16 (16-bit) para los pesos; en cuantizaciones de 8 bits alrededor de 1 GB, y en 4 bits alrededor de 0.5-0.7 GB, aunque la model card advierte que cuantizaciones por debajo de Q4 sin imatrix pueden producir bucles.
- GPU recomendadas: cualquier GPU con al menos 2-3 GB de VRAM para 16-bit; RTX 3060, RTX 4060, RTX 4090, A100, H100 son sobradamente suficientes. Cabe en GPU de consumo ampliamente.
- Despliegue: transformers (librería indicada), text-generation-inference (etiqueta endpoints_compatible), y según la model card se mencionan KoboldCpp, oobabooga/text-generation-webui y SillyTavern para chat/rol. No se confirma explícitamente soporte de vLLM, llama.cpp u Ollama en la información disponible, aunque el formato safetensors y las referencias a cuantizaciones sugieren compatibilidad con herramientas de cuantización.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| Gemma-3-1B-it-GLM-4.7-Flash-Heretic-Uncensored-Thinking | ~1B | 32k | Apache 2.0 | Sin censura, razonamiento, ficción |
| google/gemma-3-27b-it (referencia en model card) | 27B | no disponible en la información | Gemma license | Modelo base alineado, con rechazos (99/100) |
| DavidAU/gemma-3-1b-it-heretic-extreme-uncensored-abliterated (modelo base) | ~1B | no disponible en la información | no disponible en la información | Sin censura, sin ajuste de razonamiento GLM |

La model card compara la divergencia KL (0.33 frente a 0 por definición del original) y la tasa de rechazos (3/100 frente a 99/100) con google/gemma-3-27b-it. No se dispone de comparaciones de rendimiento con otros modelos de 1B en la información proporcionada.

## Limitaciones y advertencias

- Modelo sin censura: elimina los rechazos de seguridad, lo que implica riesgo de generar contenido ofensivo, explícito o dañino; requiere supervisión y filtros externos en producción.
- Sesgos conocidos: no documentados explícitamente, pero al derivar de Gemma 3 y eliminar la alineación, los sesgos del modelo base pueden intensificarse.
- Riesgo de alucinación: inherente a modelos de 1B; el razonamiento detallado no garantiza veracidad.
- Idioma: solo inglés; no soporta otros idiomas de forma fiable.
- Contexto: 32k tokens según la model card, pero en modelos de 1B la calidad puede degradarse en contextos muy largos.
- Cuantización: cuantizaciones por debajo de Q4 sin imatrix pueden entrar en bucles; se recomienda rep pen 1.05-1.1 y temperaturas de 0.3-0.7 si aparecen bucles durante el razonamiento.
- Licencia Apache 2.0 permite uso comercial, pero el contenido generado sin filtros puede violar políticas de plataformas o normativas; la responsabilidad recae en el desplegador.
- El modelo puede requerir direccionamiento adicional para alcanzar el nivel de explicitud deseado en algunos casos, según la model card.
- No se documentan capacidades de tool calling, agentes ni visión; no debe asumirse su disponibilidad.

## Enlaces

- Hugging Face: https://huggingface.co/DavidAU/Gemma-3-1B-it-GLM-4.7-Flash-Heretic-Uncensored-Thinking
- Modelo base: https://huggingface.co/DavidAU/gemma-3-1b-it-heretic-extreme-uncensored-abliterated
- Dataset de entrenamiento: https://huggingface.co/datasets/TeichAI/glm-4.7-2000x
- Modelo de referencia google/gemma-3-27b-it: https://huggingface.co/google/gemma-3-27b-it
- Perfil del autor: https://huggingface.co/DavidAU
- Colecciones del autor: https://huggingface.co/DavidAU/collections
- Página de soporte/FAQs del autor: https://huggingface.co/DavidAU/support
