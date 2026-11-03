# SashaVika/gemma-3-12b-it-uncensored-GGUF

## Resumen

Gemma 3 12B IT Uncensored es una derivacion del modelo instructivo Gemma 3 de 12.000 millones de parametros publicado por Google, adaptada y redistribuida en formato GGUF por el usuario SashaVika (con curacion atribuida a BrainDAO en la model card). El objetivo declarado es ofrecer el mismo comportamiento de seguimiento de instrucciones, razonamiento y codigo del modelo base, pero sin capas de seguridad, rechazos o restricciones de alineamiento adicionales, dejando el control del comportamiento en manos del diseno del system prompt y del despliegue local.

El modelo conserva la arquitectura transformer de Gemma 3, con 11.766.034.176 parametros totales y una variante etiquetada como vision-language (VLM) que anade comprension de imagen y texto. Se distribuye exclusivamente en cuantizaciones GGUF, lo que lo orienta a inferencia local con llama.cpp, Ollama u otros runners compatibles, no a despliegues de servidor de alta concurrencia con pesos safetensors.

Su relevancia practica es acotada pero clara: cubre el nicho de quienes necesitan un modelo de 12B con capacidades multimodales y quieren evitar los rechazos del modelo instructivo original en entornos privados o de investigacion. Conviene subrayar que el repositorio no aporta benchmarks propios ni documenta el proceso exacto de "descensura", y que la licencia sigue siendo la Gemma License de Google.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Gemma 3), con variante vision-language |
| Parametros totales | 11.766.034.176 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el modelo base Gemma 3 12B IT soporta contexto largo, pero la model card no lo especifica) |
| Tipos de cuantizacion | GGUF (el repositorio no detalla los niveles concretos: Q4_K_M, Q5_K_M, Q8_0, etc.) |
| Idiomas soportados | en (segun metadatos; el modelo base es multilingue, pero esta ficha no puede confirmar el alcance real) |
| Licencia | gemma (Gemma License de Google, licencia custom) |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Gemma 3, un transformer decoder-only con atencion por ventanas deslizantes y atencion global intercaladas (segun el diseno publicado por Google para la familia Gemma 3), disenado para equilibrar coste de atencion y calidad en contextos largos. La variante VLM incorpora un codificador visual que proyecta representaciones de imagen al espacio de embeddings del modelo de lenguaje, permitiendo entradas mixtas de imagen y texto. El repositorio no documenta cambios estructurales respecto al modelo base.

En cuanto al entrenamiento, esta ficha no dispone de informacion sobre el proceso de "descensura": la model card afirma que no se han anadido capas de seguridad ni restricciones adicionales, pero no especifica si hubo fine-tuning, DPO, ablacion de direcciones de rechazo u otra tecnica, ni detalla volumen de datos, composicion del dataset o uso de RLHF. El modelo base Google Gemma 3 12B IT fue entrenado por Google con datos no publicados en detalle y alineado mediante tecnicas de RLHF/DPO que tampoco se cuantifican aqui. Cualquier afirmacion sobre el metodo de eliminacion de rechazos seria especulativa y no se incluye.

## Capacidades

- Generacion de texto conversacional con formato de chat Gemma (`<start_of_turn>` / `<end_of_turn>`).
- Seguimiento de instrucciones y razonamiento logico y analitico, segun declara la model card.
- Asistencia en codigo: generacion, depuracion y refactorizacion en varios lenguajes.
- Comprension de imagenes en la variante VLM: descripcion de imagenes, respuesta a preguntas visuales (VQA) e instrucciones mixtas imagen + texto.
- Soporte declarado para flujos agenticos y aumentados con herramientas (tool use, planners, function calling), aunque sin detalles tecnicos sobre el formato de llamada.
- Capacidades multilingues heredadas del modelo base, no verificadas en esta derivacion; los metadatos solo declaran ingles.
- Modo "uncensored": menor propension a rechazos por diseno, no una capacidad tecnica adicional.

## Casos de uso

- Asistente generalista local: despliegue en una estacion de trabajo con llama.cpp u Ollama para conversaciones multi-turno, redaccion y sintesis, aprovechando que los pesos GGUF caben en GPU de consumo con cuantizacion agresiva.
- Asistente de programacion privado: generacion y refactorizacion de codigo sin enviar el codigo a servicios externos, integrable en editores o scripts CLI que consuman un endpoint local compatible con OpenAI.
- Investigacion sobre alineamiento y rechazos: estudio comparativo del comportamiento del modelo base frente a esta derivacion en prompts sensibles, util para medir que rechazos persisten y cuales desaparecen.
- Analisis de documentos con imagen: en la variante VLM, extraccion de informacion de capturas, diagramas o formularios combinando OCR manual y preguntas visuales.
- Prototipado de agentes con herramientas: construccion de planificadores y flujos multi-paso en local, con control total del system prompt y sin restricciones de proveedor.
- Procesamiento por lotes en hardware modesto: clasificacion, resumen o extraccion estructurada sobre corpus privados usando cuantizaciones de 4-5 bits en una sola GPU.
- Demostraciones y docencia: experimentos reproducibles sobre cuantizacion GGUF y despliegue multimodal sin depender de APIs de pago.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye MMLU, HumanEval, GSM8K ni metricas multimodales, y al tratarse de una derivacion no verificada no es posible asumir los resultados del Gemma 3 12B IT original.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 7-8 GB en cuantizacion Q4, 9-10 GB en Q5, 13-14 GB en Q8 y en torno a 24 GB en FP16 (estimaciones a partir de los 11,77B parametros; el repositorio no publica mediciones).
- GPU recomendadas: RTX 4090 (24 GB) para FP16 o Q8 con contexto amplio; RTX 4080/4070 Ti Super (16 GB) para Q5/Q6; RTX 4060 Ti 16 GB o RTX 3060 12 GB para Q4.
- Cabe en GPU de consumo: si, en cuantizaciones Q4-Q5 en tarjetas de 12-16 GB; en Q8 requiere 16 GB o mas.
- Despliegue: llama.cpp, Ollama, LM Studio y servidores compatibles con GGUF; vLLM y TGI no son la via natural para este repositorio, que solo distribuye GGUF.
- Latencia y throughput: no disponibles; dependen del backend, la cuantizacion y la GPU. No se han publicado cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Multimodal | Licencia | Formato |
|---|---|---|---|---|---|
| SashaVika/gemma-3-12b-it-uncensored-GGUF | 11,77B | no disponible | Si (variante VLM) | Gemma License | GGUF |
| google/gemma-3-12b-it | 12B (aprox.) | contexto largo (segun Google, no cuantificado aqui) | Si | Gemma License | safetensors, GGUF oficiales |
| Mistral Small 3.1 24B Instruct | 24B | 128k (segun Mistral) | Si | Apache 2.0 | safetensors, GGUF |
| Qwen2.5 14B Instruct | 14B | 128k (segun Qwen) | No | Apache 2.0 | safetensors, GGUF |

La comparativa debe leerse con cautela: los datos de los modelos alternativos provienen de sus fichas oficiales y no se han verificado en esta ficha. La ventaja principal de esta derivacion frente al Gemma 3 12B IT oficial es la ausencia de rechazos adicionales y la disponibilidad inmediata en GGUF; sus desventajas son la falta de benchmarks, la licencia Gemma (mas restrictiva que Apache 2.0) y el soporte unicamente en ingles segun metadatos.

## Limitaciones y advertencias

- Ausencia total de benchmarks: no hay evidencia publicada de que el proceso de "descensura" preserve la calidad del modelo base; puede haber degradacion en razonamiento o instrucciones.
- Riesgo elevado de contenido danino: al eliminar (o reducir) los rechazos, el modelo puede generar contenido ilegal, ofensivo o peligroso; el usuario asume la responsabilidad legal y etica.
- Alucinacion: sin datos especificos de esta derivacion; el modelo base ya presenta alucinaciones y no hay razon para esperar mejora.
- Sesgos: heredados del modelo base y de sus datos de entrenamiento, no auditados en esta version.
- Idiomas: los metadatos solo declaran ingles; el multilingueismo del modelo base no esta garantizado en esta derivacion.
- Licencia: la Gemma License es custom y no equivale a Apache-2.0 ni MIT; hay que revisar los terminos de Google antes de uso comercial o redistribucion, y el autor no relicencia el modelo.
- Contexto: la model card no especifica la ventana efectiva; no debe asumirse la del modelo base sin verificacion empirica.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: sin validacion de la comunidad, sin issues resueltos y sin garantia de mantenimiento.
- Formato unico GGUF: no apto para pipelines de alto throughput con vLLM/TGI sin conversion previa a safetensors.
- La atribucion de curacion a BrainDAO en la model card no coincide con el autor del repositorio en HuggingFace (SashaVika); conviene tratar la procedencia con precaucion.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/SashaVika/gemma-3-12b-it-uncensored-GGUF
- Modelo base: https://huggingface.co/google/gemma-3-12b-it
- No se han encontrado en la busqueda web papers, blogs, repositorios adicionales ni demos asociados a esta derivacion concreta.
