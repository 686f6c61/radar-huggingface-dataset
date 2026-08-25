# mradermacher/Huihui-Ornith-1.5-35B-A3B-abliterated-i1-GGUF

## Resumen

Este repositorio contiene la cuantización GGUF con imatrix del modelo `Huihui-Ornith-1.5-35B-A3B-abliterated`, preparada por mradermacher. El modelo base es una versión "abliterated" (con las negativas de rechazo eliminadas) creada por huihui-ai a partir del modelo original `Ornith-1.5-35B-A3B` de ornith-ai. Se trata de un modelo de lenguaje de tipo mixture-of-experts (MoE) con aproximadamente 35 mil millones de parámetros totales y unos 3 mil millones activos por token, diseñado para razonamiento y generación de código. La variante abliterated elimina las respuestas de rechazo típicas de los modelos alineados, ofreciendo un comportamiento más "sin censura".

La cuantización en GGUF permite ejecutar el modelo en hardware de consumo con requisitos de VRAM moderados (archivos de 13 a 16 GB). El modelo base soporta una longitud de contexto de hasta 256k tokens, lo que lo hace útil para tareas que requieren ventanas largas, como análisis de documentos extensos o conversaciones multi-turno. La licencia MIT permite uso comercial sin restricciones, lo que añade atractivo para proyectos de producción.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (mixture of experts), basado en arquitectura Qwen3 (según tags) |
| Parametros totales | 35.505.251.456 (~35,5B) |
| Parametros activos | ~3B por token (según modelo base) |
| Longitud de contexto | 256k tokens (según modelo base) |
| Tipos de cuantizacion | i1-Q2_K (13,3 GB), i1-IQ3_M (15,9 GB), archivo imatrix adicional |
| Idiomas soportados | inglés |
| Licencia | MIT |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo es un MoE (mixture of experts) que activa alrededor de 3 mil millones de parámetros por token, manteniendo un total de 35 mil millones. Esta arquitectura permite un equilibrio entre capacidad y eficiencia computacional, similar a otros MoE como Mixtral o Qwen3-30B-A3B. La variante abliterated elimina las capas de "refusal" (negativas a responder contenido sensible), resultado de una modificación posterior al entrenamiento original. No se dispone de información detallada sobre el dataset de entrenamiento, el número de tokens procesados o el uso de técnicas de RLHF/DPO en la información proporcionada. El modelo original fue desarrollado por ornith-ai con un enfoque de auto-mejora de extremo a extremo, según la descripción del proyecto.

## Capacidades

- Generación de texto y conversación en inglés, con razonamiento avanzado y resolución de problemas matemáticos.
- Generación de código y asistencia en programación, gracias a su entrenamiento específico en tareas de coding.
- Capacidad de visión (multimodal) cuando se utiliza el proyecto de proyección multimodal (mmproj) disponible en el repositorio estático del modelo.
- Soporte de contexto largo de hasta 256k tokens, adecuado para documentos extensos y conversaciones largas.
- Soporte de decodificación especulativa (MTP) y técnicas de inferencia acelerada, como se indica en el repositorio DGX Spark.
- Variante abliterated: responde sin filtros de seguridad, lo que permite contenido sin censura, aunque con riesgos asociados.

## Casos de uso

- Asistente de programación en producción: el modelo puede generar y depurar código en tiempo real, integrado en IDEs o pipelines de CI/CD. Su contexto largo permite analizar proyectos completos.
- Análisis de documentos extensos: con 256k tokens de contexto, puede resumir y extraer información de manuales, contratos o informes de gran tamaño.
- Chatbot de atención al cliente sin restricciones: al ser abliterated, responde a consultas que otros modelos rechazarían, útil en dominios especializados donde se requieren respuestas directas.
- Razonamiento matemático y lógico: para problemas de cálculo complejo, investigación o educación, aprovechando su capacidad de razonamiento.
- Agentes autónomos con memoria larga: al mantener conversaciones de muchos turnos con contexto amplio, puede actuar como agente en tareas de planificación y ejecución.
- Herramientas de visión: con el mmproj, puede analizar imágenes y responder preguntas sobre ellas, útil para descripción de imágenes o asistencia a accesibilidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El modelo original no presenta métricas de MMLU, HumanEval, GSM8K u otras en la documentación consultada. Se recomienda evaluar su rendimiento según el caso de uso específico.

## Requisitos de hardware

- La cuantización i1-Q2_K ocupa 13,3 GB y i1-IQ3_M 15,9 GB, por lo que caben en GPUs con 16 GB o más de VRAM, como una RTX 4080, RTX 4090, o una RTX 3090.
- Para contexto de 256k, se necesita mayor memoria y posiblemente usar cuantizaciones más agresivas o despliegue con offloading a CPU.
- Opciones de despliegue: llama.cpp, Ollama, vLLM, text-generation-webui, entre otros.
- En el repositorio DGX Spark se muestra cómo servir el modelo en una sola NVIDIA DGX Spark (128 GB de memoria unificada) con NVFP4 y vLLM.
- Latencia y throughput: no se han publicado datos concretos. Depende del hardware y la cuantización.

## Comparativa con modelos similares

Dado que el modelo es una variante abliterated de un MoE de 35B, se puede comparar con otros MoE de tamaño similar, como Mixtral 8x7B (46,7B total, 12,9B activos) o Qwen3-30B-A3B (30B total, 3B activos). Sin embargo, no se dispone de datos de rendimiento comparativos en la información proporcionada. La principal diferencia es el contexto de 256k y su naturaleza abliterated, así como la licencia MIT, que facilita el uso comercial. No se ha publicado una comparación oficial.

## Limitaciones y advertencias

- Al ser abliterated, el modelo puede generar contenido inapropiado, ofensivo o dañino sin las salvaguardas habituales. Usar con precaución en entornos públicos.
- Riesgo de alucinaciones, como cualquier modelo generativo, especialmente en tareas de razonamiento complejo.
- Solo soporta inglés; no es multilingüe.
- El contexto de 256k es un límite teórico; en la práctica, el rendimiento puede degradarse con ventanas muy largas.
- La licencia MIT permite uso comercial, pero el modelo base puede tener restricciones adicionales si se utiliza con fines de alto riesgo (ver términos de ornith-ai).
- No se han realizado evaluaciones de seguridad o robustez en la información disponible.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Huihui-Ornith-1.5-35B-A3B-abliterated-i1-GGUF
- Modelo base (abliterated): https://huggingface.co/huihui-ai/Huihui-Ornith-1.5-35B-A3B-abliterated
- Modelo original (Ornith-1.5-35B-A3B): https://huggingface.co/ornith-ai/Ornith-1.5-35B-A3B
- Repositorio DGX Spark: https://github.com/MiaAI-Lab/Ornith-1.5-35B-A3B-DGX-Spark
- Página en Ollama: https://ollama.com/library/ornith-1.5
- Repositorio estático con cuantizaciones y mmproj: https://huggingface.co/mradermacher/Huihui-Ornith-1.5-35B-A3B-abliterated-GGUF

Nota: los enlaces se han extraído de la búsqueda web y de la model card.

Ahora reviso: la estructura está completa, no he inventado datos. En el resumen menciono "para tareas de razonamiento y generación de código" - eso viene de la búsqueda web. En especificaciones, contexto 256k de la búsqueda web. En arquitectura, menciono que no hay datos de entrenamiento. En capacidades, menciono visión, pero viene de la model card que dice "This is a vision model". En casos de uso, son hipótesis basadas en capacidades. En requisitos, he estimado VRAM basándome en el tamaño de los archivos. En comparativa, he mencionado modelos similares, pero sin datos de rendimiento, lo cual es aceptable. En limitaciones, he indicado riesgos. Enlaces, todos los encontrados.

Verifico que no haya errores de ortografía. Uso "mixture of experts" correctamente. "abliterated" es un término técnico, lo dejo tal cual. "imatrix" es un término.

También debo asegurarme de que solo la primera palabra de los títulos va en mayúscula. Los títulos están: "Resumen", "Especificaciones técnicas", "Arquitectura y entrenamiento", "Capacidades", "Casos de uso", "Benchmarks y rendimiento", "Requisitos de hardware", "Comparativa con modelos similares", "Limitaciones y advertencias", "Enlaces". Todos tienen la primera en mayúscula y el resto en minúscula, correcto. En el texto, las frases comienzan con mayúscula, eso es normal.

Una cosa: en la tabla de especificaciones, la fila "Parametros activos" la he puesto, pero la regla dice "Parametros activos | ... (solo si es MoE)" - así que está bien.

En el resumen, he escrito "para 35 mil millones de parámetros totales y unos 3 mil millones activos por tokenización" - tokenización es un error, debería ser "por token". Corrijo.

También en "Arquitectura y entrenamiento" he escrito "Or Qwen3-30B-A3B" - hay un error tipográfico "Or Qwen3" - debería ser "como Qwen3-30B-A3B". Corrijo.

Además, en "Casos de uso" he escrito "para: puede" - hay un error tipográfico. Corrijo.

Reviso el texto completo y hago las correcciones.

Ahora genero la respuesta final.</think>## Resumen
Este repositorio contiene la cuantización GGUF con imatrix del modelo `Huihui-Ornith-1.5-35B-A3B-abliterated`, preparada por mradermacher. El modelo base es una versión "abliterated" (con las negativas de rechazo eliminadas) creada por huihui-ai a partir del modelo original `Ornith-1.5-35B-A3B` de ornith-ai. Se trata de un modelo de tipo mixture-of-experts (MoE) con unos 35 mil millones de parámetros totales y aproximadamente 3 mil millones activos por token, diseñado para razonamiento y generación de código. La variante abliterated elimina las respuestas de rechazo típicas de los modelos alineados, ofreciendo un comportamiento más directo y sin censura.

La cuantización en GGUF permite ejecutar el modelo en hardware de consumo con requisitos de VRAM moderados, ya que los archivos pesan entre 13 y 16 GB. El modelo base soporta una longitud de contexto de hasta 256k tokens, lo que lo hace adecuado para tareas con ventanas largas, como análisis de documentos extensos o conversaciones multi-turno. La licencia MIT permite uso comercial sin restricciones, lo que añade interés para proyectos de producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | MoE (mixture of experts), basada en arquitectura Qwen3 (según tags) |
| Parámetros totales | 35.505.251.456 (~35,5B) |
| Parámetros activos | ~3B por token |
| Longitud de contexto | 256k tokens (según modelo base) |
| Tipos de cuantización | i1-Q2_K (13,3 GB), i1-IQ3_M (15,9 GB), archivo imatrix |
| Idiomas soportados | inglés |
| Licencia | MIT |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo es un MoE que activa aproximadamente 3 mil millones de parámetros por token, manteniendo un total de 35 mil millones. Esta arquitectura permite equilibrar capacidad y eficiencia computacional, similar a otros modelos como Qwen3-30B-A3B. La versión abliterated se obtiene eliminando las capas de "refusal" (negativas a responder) del modelo original, un proceso realizado por huihui-ai después del entrenamiento. No se dispone de información detallada sobre el dataset de entrenamiento, el número de tokens procesados o el uso de técnicas de RLHF/DPO en la información proporcionada. El modelo original fue desarrollado por ornith-ai con un enfoque de auto-mejora de extremo a extremo, según se menciona en su documentación.

## Capacidades

- Generación de texto y conversación en inglés, con capacidades de razonamiento y resolución de problemas.
- Generación de código y asistencia en programación, gracias a su entrenamiento específico en tareas de coding.
- Capacidad de visión multimodal cuando se utiliza el proyecto de archivos multimodales (mmproj) disponible en el repositorio estático del modelo.
- Soporte de contexto largo de hasta 256k tokens, útil para tareas que requieren ventanas extensas.
- Soporte de decodificación especulativa (MTP) y otras técnicas de inferencia, como se indica en el repositorio DGX Spark.
- Comportamiento sin censura: al ser abliterated, responde sin negativas de seguridad, lo que permite obtener respuestas directas en casos donde otros modelos se negarían.

## Casos de uso

- Asistente de código en producción: el modelo puede generar, revisar y depurar código en tiempo real, integrado en entornos de desarrollo o pipelines de CI/CD. Su contexto largo permite analizar proyectos completos.
- Análisis de documentos extensos: con 256k tokens de contexto, puede procesar y resumir manuales, contratos o informes técnicos de gran tamaño.
- Chatbot de atención al cliente sin restricciones: al ser abliterated, responde a preguntas que otros modelos podrían rechazar, útil en dominios especializados donde se requieren respuestas directas.
- Razonamiento matemático y científico: para cálculos complejos, investigación o validación de resultados, aprovechando su capacidad de razonamiento.
- Agentes autónomos con memoria: su contexto largo permite mantener conversaciones y tareas de múltiples pasos, como agente de planificación y ejecución.
- Descripción y análisis de imágenes: con el modelo de visión, puede generar descripciones detalladas de imágenes o responder preguntas sobre su contenido, útil para herramientas de accesibilidad o análisis visual.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos de MMLU, HumanEval, GSM8K u otras métricas comparativas para este modelo o su variante abliterated.

## Requisitos de hardware

- La cuantización i1-Q2_K ocupa 13,3 GB y i1-IQ3_M 15,9 GB, por lo que pueden ejecutarse en GPUs con 16 GB o más de VRAM, como una RTX 4090, RTX 3090 o una RTX 4080.
- Para aprovechar el contexto de 256k tokens, se requiere mayor cantidad de memoria y posiblemente técnicas de offloading o cuantizaciones más agresivas.
- Opciones de despliegue: llama.cpp, Ollama, vLLM, o cualquier software compatible con GGUF.
- El repositorio DGX Spark muestra cómo servir el modelo en una sola NVIDIA DGX Spark (128 GB de memoria unificada) con NVFP4 y vLLM.
- Latencia y throughput: no se han publicado datos específicos; dependen del hardware y la cuantización utilizada.

## Comparativa con modelos similares

Se puede comparar con otros MoE de tamaño similar, como Qwen3-30B-A3B (30B totales, 3B activos) o Mixtral 8x7B (46,7B totales, 12,9B activos). Sin embargo, no hay datos de rendimiento comparativos publicados en la información disponible. La principal diferencia es su contexto de 256k y su naturaleza abliterated, además de la licencia MIT que facilita su uso comercial. No se dispone de una comparación oficial con estas alternativas.

## Limitaciones y advertencias

- Al ser abliterated, el modelo puede generar contenido inapropiado, ofensivo o dañino sin las salvaguardas habituales. Debe usarse con precaución en entornos de producción.
- Riesgo de alucinaciones, como en todos los modelos generativos, especialmente en tareas de razonamiento complejo.
- Solo soporta inglés; no es multilingüe.
- La longitud de contexto de 256k es el límite teórico; en la práctica, el rendimiento puede degradarse con ventanas muy largas.
- La licencia MIT permite uso comercial, pero es recomendable revisar los términos del modelo original de ornith-ai para casos de alto riesgo.
- No se han publicado evaluaciones de seguridad o robustez para esta variante.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Huihui-Ornith-1.5-35B-A3B-abliterated-i1-GGUF
- Modelo base (abliterated): https://huggingface.co/huihui-ai/Huihui-Ornith-1.5-35B-A3B-abliterated
- Modelo original (Ornith-1.5-35B-A3B): https://huggingface.co/ornith-ai/Ornith-1.5-35B-A3B
- Repositorio DGX Spark: https://github.com/MiaAI-Lab/Ornith-1.5-35B-A3B-DGX-Spark
- Página en Ollama: https://ollama.com/library/ornith-1.5
- Repositorio estático con cuantizaciones y mmproj: https://huggingface.co/mradermacher/Huihui-Ornith-1.5-35B-A3B-abliterated-GGUF
