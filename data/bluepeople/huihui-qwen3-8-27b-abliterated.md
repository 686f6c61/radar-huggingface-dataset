# bluepeople/Huihui-Qwen3.8-27B-abliterated

## Resumen

Huihui-Qwen3.8-27B-abliterated es una variante "abliterated" (sin mecanismos de rechazo) del modelo Qwen/Qwen3.8-27B. La model card original indica que fue creada por huihui-ai mediante la técnica de abliteration descrita en el repositorio remove-refusals-with-transformers, una implementación de prueba de concepto que elimina las direcciones de rechazo del espacio de pesos sin recurrir a TransformerLens. El repositorio analizado se publica bajo el usuario bluepeople, con 0 descargas y 0 me gusta, y apunta explícitamente a huihui-ai como autor original.

El modelo tiene 27.781.427.952 parámetros (unos 27,78 mil millones) según los pesos en safetensors, ocupa 55,6 GB en el repositorio y se distribuye bajo licencia Apache 2.0. La etiqueta de pipeline es image-text-to-text, lo que indica que es multimodal (entrada de imagen y texto), y la model card menciona componentes "MTP" (predicción multi-token) y "visual" que no han sido modificados por la abliteración.

Su relevancia es doble: por un lado, ofrece una alternativa sin filtros de rechazo para investigación sobre alineación, seguridad y comportamiento de modelos; por otro, al conservar intactas las capas 1-15, la torre visual y la cabeza MTP, pretende preservar buena parte del rendimiento del modelo original. No se han proporcionado datos de benchmarks, contexto máximo ni idiomas soportados, por lo que la evaluación cuantitativa queda pendiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (etiqueta qwen3_5 en el repositorio); incluye torre visual y componente MTP según la model card. Detalles de capas y mecanismo de atención: no disponibles |
| Parametros totales | 27.781.427.952 (27,78 mil millones), según los safetensors del repositorio |
| Parametros activos | No aplica: no se indica que sea un modelo MoE en la información disponible |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponibles en el repositorio (solo pesos safetensors). Existe una versión en el registro de Ollama publicada por terceros (huihui_ai/Qwen3.8-abliterated) que implica cuantizaciones GGUF |
| Idiomas soportados | No disponibles |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (librería transformers) |
| Tamano del repositorio | 55,6 GB |
| Modelo base | Qwen/Qwen3.8-27B |
| Pipeline declarado | image-text-to-text |
| Fecha de creacion | 2026-09-13 |
| Revision anterior disponible | d42ca89 (versión previa con las 15 primeras capas sin abliterar, descargable con `--revision d42ca89`) |

## Arquitectura y entrenamiento

La model card no describe la arquitectura interna del modelo base más allá de su carácter multimodal y de la existencia de componentes visuales y MTP. Sí detalla el proceso de abliteración aplicado: se han ablacionado únicamente las capas 18 a 51, mientras que las 15 primeras capas se han dejado intactas y el resto permanece sin modificar. Dado que el rango abliterado llega hasta la capa 51, puede inferirse que el modelo base tiene al menos 52 capas, aunque este dato no se confirma de forma explícita. La torre visual y el componente MTP no han sido alterados.

La técnica empleada es una implementación cruda y de prueba de concepto para eliminar rechazos sin usar TransformerLens, basada en el repositorio remove-refusals-with-transformers. No se proporciona información sobre el dataset de entrenamiento, el número de tokens, la composición de datos, ni sobre si hubo RLHF, DPO u otras etapas de alineación en el modelo base. Tampoco se documentan innovaciones técnicas adicionales más allá del propio procedimiento de abliteración selectiva por capas.

## Capacidades

- Generación de texto conversacional en formato multi-turno (la model card incluye un ejemplo de bucle de mensajes con `TextStreamer`).
- Procesamiento de imagen y texto (pipeline image-text-to-text), lo que habilita tareas de descripción de imágenes, respuesta a preguntas visuales y conversación sobre contenido gráfico.
- Modo de razonamiento con bloque de pensamiento: el código de ejemplo de la model card detecta la etiqueta `</think>`, lo que indica que el modelo emite trazas de razonamiento antes de la respuesta final.
- Comportamiento sin rechazos (abliterated/uncensored): el modelo no aplica los mecanismos de negativa del modelo original, lo que permite obtener respuestas sobre temas que el modelo base rechazaría.
- Predicción multi-token (MTP): componente presente en el modelo base, no modificado por la abliteración.
- Tool calling / function calling: no se documenta explícitamente en la información disponible. Al derivar de Qwen3.8-27B, podría heredar dicha capacidad, pero no está confirmado en esta ficha.
- Soporte de agentes y razonamiento multi-paso: no documentado explícitamente; el modo de pensamiento sugiere capacidad de razonamiento encadenado, sin garantías.
- Capacidades multilingües: no disponibles; el repositorio no declara idiomas.

## Casos de uso

- Investigación sobre alineación y seguridad: el modelo permite estudiar qué comportamientos cambian al eliminar las direcciones de rechazo en las capas 18-51 y cuáles se conservan, comparándolo con Qwen3.8-27B original sobre el mismo conjunto de prompts.
- Análisis de contenido sensible en entornos controlados: equipos de moderación o seguridad pueden usar la variante sin rechazos para generar ejemplos adversarios y evaluar la robustez de sus propios filtros, siempre con revisión humana.
- Asistente multimodal interno: gracias al pipeline image-text-to-text, puede emplearse en herramientas privadas de análisis de capturas, diagramas o documentación escaneada, donde se requiere descripción y extracción de información de imágenes.
- Generación de documentación técnica y creativa sin restricciones temáticas: útil en flujos editoriales de ficción, guiones o narrativa que abordan violencia, contenido adulto o temas delicados que los modelos alineados suelen rechazar.
- Red teaming de sistemas de IA: el modelo sirve como generador de prompts y respuestas "sin filtro" para probar la resistencia de clasificadores de contenido y guardarraíles en pipelines de producción.
- Despliegue local con Ollama o llama.cpp: al existir una versión en el registro de Ollama, es viable ejecutarlo en estaciones de trabajo con GPU de consumo para tareas de generación y visión sin depender de APIs externas.
- Experimentación con decodificación y rendimiento: la presencia del componente MTP permite investigar técnicas de decodificación especulativa o multi-token en un modelo de 27,78 mil millones de parámetros.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas (MMLU, HumanEval, GSM8K ni ninguna otra), y la búsqueda web realizada no devolvió ningún resultado relacionado con el modelo, únicamente enlaces sin relación alguna con el tema (descargas de un videojuego de carreras). No se dispone por tanto de comparaciones cuantitativas con el modelo base ni con variantes abliterated equivalentes.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16/fp16: en torno a 55,6 GB solo de pesos, más caché KV y activaciones; en la práctica requiere GPUs de 80 GB (A100 80 GB, H100 80 GB) o reparto entre varias GPUs de 48 GB, más memoria adicional si se procesan imágenes.
- VRAM estimada en int8/fp8: aproximadamente 28 GB de pesos, lo que encaja en A100 40 GB, L40S 48 GB o A6000 48 GB.
- VRAM estimada en 4 bits (Q4_K_M / AWQ / GPTQ): del orden de 16-18 GB de pesos, por lo que cabe en GPUs de consumo de 24 GB (RTX 4090, RTX 3090, RTX 4080 con margen reducido). Con contexto largo o entrada de imagen conviene reservar varios GB extra.
- VRAM estimada en 5-6 bits: alrededor de 19-22 GB, ajustado en 24 GB y cómodo en 32-48 GB.
- GPU recomendadas: H100 80 GB o A100 80 GB para precisión completa y máximo contexto; L40S o A6000 para cuantizaciones de 8 bits; RTX 4090/3090 para 4 bits en uso individual; múltiples GPUs para servir en paralelo con tensor parallelism.
- Opciones de despliegue: transformers (método documentado en la model card, con `device_map="auto"` y `trust_remote_code=True`), Ollama (versión de terceros huihui_ai/Qwen3.8-abliterated), llama.cpp mediante GGUF de terceros, y servidores tipo vLLM, SGLang o TGI siempre que exista soporte para la arquitectura qwen3_5 declarada en el repositorio.
- Latencia y throughput: no disponibles. No se han publicado medidas de tokens por segundo ni de latencia del primer token.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Multimodal | Notas |
|---|---|---|---|---|---|
| Huihui-Qwen3.8-27B-abliterated (este) | 27,78 mil millones | No disponible | Apache 2.0 | Si (image-text-to-text) | Variante sin rechazos, capas 18-51 abliteradas |
| Qwen/Qwen3.8-27B (base) | 27,78 mil millones (mismo modelo del que deriva) | No disponible | No confirmada en la informacion disponible | Si | Modelo original con alineacion intacta |
| Otras variantes abliterated (por ejemplo, familia huihui-ai) | No disponible | No disponible | Habitualmente Apache 2.0 en modelos Qwen | Depende del modelo base | Mismo procedimiento de abliteration |
| Modelos multimodales densos de tamano similar de otros fabricantes | No disponible | No disponible | Variable | Si | Comparacion no disponible por falta de datos verificados en la informacion proporcionada |

No se dispone de datos de rendimiento comparativos, por lo que la tabla se limita a parametros, licencia y disponibilidad. Cualquier comparacion de calidad, razonamiento o visión requiere evaluacion propia.

## Limitaciones y advertencias

- Ausencia total de benchmarks publicados: no hay evidencia cuantitativa de que el rendimiento se mantenga respecto al modelo base tras la abliteración, más allá de la afirmación de la model card de que conservar las 15 primeras capas "ayuda a retener más del rendimiento original".
- Riesgo de alucinación: no se documenta ningún mecanismo de mitigación; al tratarse de un modelo sin filtros, la probabilidad de generar contenido factualmente incorrecto sin advertencias puede aumentar en temas delicados.
- Sesgos: no se han publicado evaluaciones de sesgo. La eliminación de las direcciones de rechazo puede modificar el comportamiento del modelo ante colectivos protegidos o temas sensibles, sin que exista ningún estudio al respecto.
- Contenido dañino: al eliminar los rechazos, el modelo puede producir instrucciones peligrosas, contenido ilegal o material ofensivo. Su uso en producción sin moderación externa es desaconsejable.
- Idiomas y contexto: no disponibles. Se desconoce la ventana de contexto efectiva y la cobertura lingüística, lo que impide planificar despliegues multilingües o con documentos largos.
- Licencia: Apache 2.0 permite uso comercial, pero el autor original del modelo base es Qwen y la model card no incluye avisos adicionales; conviene verificar los términos de Qwen/Qwen3.8-27B antes de explotarlo comercialmente, así como el cumplimiento de la normativa aplicable en materia de IA.
- Naturaleza del proceso: la propia model card describe la abliteration como una implementación "cruda" y de prueba de concepto, lo que sugiere posibles inestabilidades de comportamiento no caracterizadas.
- Repositorio con 0 descargas y 0 me gusta: se trata de una publicación sin validación comunitaria; la ruta de descarga y las revisiones deberían verificarse antes de integrarlo en un pipeline.
- La búsqueda web no devolvió ningún enlace relevante al modelo, por lo que no existe documentación externa independiente que respalde su calidad o su comportamiento.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/bluepeople/Huihui-Qwen3.8-27B-abliterated
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Repositorio de referencia del autor original: https://huggingface.co/huihui-ai/Huihui-Qwen3.8-27B-abliterated
- Técnica de abliteration: https://github.com/Sumandora/remove-refusals-with-transformers
- Versión en Ollama: https://ollama.com/huihui_ai/Qwen3.8-abliterated
- Descarga de la revisión anterior: `hf download huihui-ai/Huihui-Qwen3.8-27B-abliterated --local-dir ./huihui-ai/Huihui-Qwen3.8-27B-abliterated --revision d42ca89`
- Búsqueda web: no se encontraron enlaces relevantes al modelo; los resultados devueltos correspondían a páginas de descarga de un videojuego y no guardan relación con esta ficha.
