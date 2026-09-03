# snellchapo/granite-4.2-3b-heretic-abliterated

## Resumen

El modelo `snellchapo/granite-4.2-3b-heretic-abliterated` es una adaptación no oficial del modelo base `ibm-granite/granite-4.2-3b` de IBM, modificado mediante la técnica de *abliteration* para eliminar los mecanismos de rechazo y las restricciones de seguridad del modelo original. El resultado es un modelo de lenguaje denso de 3.659.737.600 parámetros (aproximadamente 3,66B) que conserva las capacidades de razonamiento y generación del Granite 4.2, pero sin los filtros de contenido que limitan las respuestas en temas sensibles o controvertidos.

El modelo base Granite 4.2 es una familia de modelos de razonamiento densos desarrollados por IBM, disponibles en tamaños de 3B, 8B y 30B, que incorporan razonamiento nativo (thinking) mediante cadenas de pensamiento antes de emitir la respuesta final. Esta versión abliterated mantiene esas capacidades, pero elimina las capas de alineación que producen negativas. El repositorio incluye pesos en formato safetensors y GGUF, lo que permite su uso tanto en entornos de inferencia de alto rendimiento como en aplicaciones locales con llama.cpp u Ollama.

La relevancia de este modelo radica en su utilidad para desarrolladores e investigadores que necesitan un modelo sin restricciones de contenido para tareas de generación creativa, análisis de seguridad o experimentación con técnicas de alineación. Al estar basado en un modelo con licencia Apache 2.0, la versión abliterated mantiene esa licencia, lo que facilita su uso comercial y su integración en proyectos de código abierto.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso con razonamiento nativo (thinking) |
| Parametros totales | 3.659.737.600 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | safetensors (FP16/BF16) y GGUF (varias cuantizaciones) |
| Idiomas soportados | No disponible (el modelo base Granite 4.2 es multilingüe, pero no se especifica la lista) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, GGUF |

## Arquitectura y entrenamiento

El modelo base Granite 4.2 es un transformer denso con capacidades de razonamiento explícito: antes de generar la respuesta final, el modelo produce una cadena de pensamiento interna que le permite abordar problemas complejos paso a paso. IBM entrenó estos modelos con un enfoque en eficiencia y fiabilidad para entornos empresariales, incluyendo soporte para tool calling, generación de JSON estructurado y retrieval-augmented generation (RAG). El tamaño de 3B lo sitúa en la gama de modelos ligeros que pueden ejecutarse en hardware de consumo.

La modificación *abliterated* aplicada por el autor `snellchapo` consiste en eliminar o neutralizar las capas del modelo que producen respuestas de rechazo ante solicitudes que el modelo base considera inapropiadas. Esta técnica, popularizada en la comunidad open source, no requiere reentrenamiento completo, sino una intervención sobre los pesos del modelo para eliminar la dirección de activación asociada a las negativas. No se dispone de información detallada sobre el proceso exacto utilizado en esta versión concreta, ni sobre los datos de entrenamiento adicionales (si los hubo). El autor no ha publicado documentación técnica más allá de la model card mínima.

## Capacidades

- Generación de texto y razonamiento: hereda las capacidades de Granite 4.2, incluyendo razonamiento paso a paso (thinking mode) para problemas de lógica, matemáticas y análisis.
- Codificación: soporta generación y comprensión de código en múltiples lenguajes, aunque no se especifican benchmarks concretos.
- Tool calling y function calling: el modelo base Granite 4.2 soporta invocación de herramientas, por lo que esta versión abliterated mantiene esa capacidad.
- RAG (retrieval-augmented generation): puede integrarse en pipelines de recuperación de información para responder con contexto externo.
- Salida JSON estructurada: compatible con generación de respuestas en formato JSON, útil para integraciones con APIs.
- Multilingüe: el modelo base es multilingüe, aunque no se detalla la lista de idiomas soportados en esta versión.
- Sin restricciones de contenido: al estar abliterated, no rechaza solicitudes sobre temas sensibles, violencia, sexualidad, etc. Esto es una capacidad diferencial, pero también un riesgo.

## Casos de uso

- Generación creativa sin filtros: escritura de ficción, poesía o guiones que aborden temas tabú o controvertidos sin que el modelo se niegue a responder. El modelo puede producir contenido explícito o políticamente incorrecto de forma fluida.
- Investigación en seguridad de IA: análisis de comportamientos de modelos sin alineación, estudio de sesgos o evaluación de riesgos de contenido dañino. Los investigadores pueden usar este modelo como caso de estudio de técnicas de abliteration.
- Desarrollo de asistentes de rol (roleplay): creación de personajes y conversaciones en juegos de rol donde se requiere libertad temática, sin las restricciones habituales de los modelos comerciales.
- Pruebas de estrés de sistemas de moderación: integración en entornos de test para verificar que los filtros de contenido de una aplicación funcionan correctamente, generando entradas que deberían ser bloqueadas.
- Generación de datos sintéticos para entrenamiento: producción de ejemplos de texto que incluyan contenido que normalmente sería rechazado, útil para entrenar clasificadores de contenido o sistemas de moderación.
- Experimentación con técnicas de alineación: comparación del comportamiento entre el modelo base y la versión abliterated para estudiar el impacto de la eliminación de capas de rechazo en la calidad y seguridad de las respuestas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor no ha proporcionado métricas de MMLU, HumanEval, GSM8K ni otros tests estándar. Dado que el modelo es una modificación del Granite 4.2 3B, es razonable esperar un rendimiento similar al del modelo base en tareas generales, pero no se dispone de datos verificables para esta versión concreta.

## Requisitos de hardware

- VRAM estimada para inferencia: con 3,66B parámetros, en FP16 se necesitan aproximadamente 7,3 GB de VRAM solo para los pesos, más overhead de activaciones y KV cache. Con cuantización GGUF Q4_K_M, el uso de VRAM se reduce a unos 2,5-3 GB.
- GPU recomendadas: para FP16, una GPU con al menos 8 GB de VRAM (RTX 3070, RTX 4060 Ti, A10). Para cuantizaciones GGUF, una GPU con 4-6 GB es suficiente (RTX 3060, RTX 4060, incluso integradas con suficiente memoria compartida).
- Compatibilidad con GPU de consumo: sí, cabe en la mayoría de GPUs consumer modernas con cuantización. En FP16 puede requerir GPUs de gama media-alta.
- Opciones de despliegue: vLLM, llama.cpp, Ollama, TGI (Text Generation Inference), Hugging Face Transformers con carga de safetensors.
- Latencia y throughput: no se dispone de mediciones específicas. Para un modelo de 3B en una GPU moderna, se espera una generación de 30-60 tokens por segundo en FP16, y mayor velocidad con cuantización GGUF.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Granite 4.2 3B (base) | 3,66B | No disponible | Apache 2.0 | Modelo original con alineación y rechazos |
| Granite 4.2 3B Heretic NX PRIME (GGUF) | 3,66B | No disponible | Apache 2.0 | Otra versión abliterated de la comunidad |
| snellchapo/granite-4.2-3b-heretic-abliterated | 3,66B | No disponible | Apache 2.0 | Este modelo, con pesos safetensors y GGUF |

No se dispone de datos de rendimiento comparativos entre estas versiones. La principal diferencia entre el modelo base y las versiones abliterated es la ausencia de rechazos, no el rendimiento en tareas estándar. Otras alternativas de tamaño similar sin restricciones incluyen modelos como `dolphin-2.9-llama-3-8b` (8B) o `nous-hermes-2-mixtral-8x7b` (MoE), pero no se dispone de comparaciones directas.

## Limitaciones y advertencias

- Sesgos conocidos: el modelo base Granite 4.2 puede presentar sesgos derivados de sus datos de entrenamiento. La abliteration no elimina estos sesgos, solo elimina los rechazos, por lo que el modelo puede generar contenido sesgado o discriminatorio sin filtro.
- Riesgo de alucinación: como cualquier modelo de lenguaje, puede inventar información, especialmente en temas especializados. La ausencia de rechazos no mejora la veracidad.
- Contenido dañino: al no tener restricciones, el modelo puede generar instrucciones peligrosas, contenido ilegal o discurso de odio. Su uso en producción requiere medidas de moderación externas.
- Limitaciones de contexto: no se ha especificado la longitud de contexto soportada. El modelo base Granite 4.2 soporta contexto largo, pero esta versión no documenta el valor exacto.
- Restricciones de licencia: la licencia Apache 2.0 permite uso comercial y modificación, pero el usuario es responsable del contenido generado. No hay cláusulas de uso responsable en la model card.
- Soporte limitado: el autor no proporciona documentación, canal de soporte ni garantías. El modelo se publica tal cual, sin actualizaciones ni mantenimiento.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/snellchapo/granite-4.2-3b-heretic-abliterated
- Modelo base en HuggingFace: https://huggingface.co/ibm-granite/granite-4.2-3b
- Documentación de IBM Granite 4.2: https://www.ibm.com/granite/docs/models/granite4-2
- Página principal de IBM Granite: https://www.ibm.com/granite
- Página de Granite 4.2 en Ollama: https://ollama.com/library/granite4.2:3b
- Modelo similar (GGUF): https://huggingface.co/0xzknw/Granite-4.2-3B-Heretic-NX-PRIME-GGUF
