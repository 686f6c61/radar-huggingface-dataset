# NeuralNet-Hub/Qwen4-27B-Uncensored-NVFP4

## Resumen

Qwen4-27B-Uncensored-NVFP4 es una cuantización en formato NVFP4 del modelo base Qwen/Qwen4-27B, publicada por el usuario NeuralNet-Hub. El modelo se presenta como un modelo de visión-lenguaje (pipeline image-text-to-text) orientado a inferencia en GPUs Blackwell mediante vLLM, con pesos cuantizados a 4 bits en el formato NVFP4 propietario de NVIDIA. La licencia declarada es Apache 2.0, heredada del modelo base.

La model card del autor es, sin embargo, en gran medida promocional y contradictoria: afirma explícitamente que "no hay ningún modelo todavía" y que el repositorio solo sirve para anunciar un producto futuro (UncensoredGPT). Además, mezcla referencias a Qwen3.6-27B y Qwen3.8-27B, versiones distintas del modelo base declarado (Qwen4-27B), y describe un proceso de "abliteration" y fine-tuning supervisado para eliminar rechazos que no está documentado ni verificado. El repositorio registra 0 descargas y 0 likes en el momento de la consulta.

Por tanto, esta ficha debe leerse con cautela: los datos técnicos disponibles son escasos y, en varios puntos, inconsistentes. No se dispone de información verificable sobre el número de parámetros, la longitud de contexto, los idiomas soportados ni los resultados de evaluación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base Qwen4-27B; arquitectura no documentada en la información proporcionada) |
| Parametros totales | no disponible (la nomenclatura sugiere 27B, sin confirmación) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | NVFP4 (formato de 4 bits de NVIDIA para GPUs Blackwell) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible (se menciona compatibilidad con vLLM y transformers; no se detalla el formato de fichero) |

## Arquitectura y entrenamiento

No se dispone de información verificable sobre la arquitectura del modelo base Qwen4-27B ni sobre el proceso de cuantización NVFP4 aplicado. La model card menciona que las restricciones de rechazo del modelo original se habrían eliminado mediante una combinación de fine-tuning supervisado y "abliteration", pero no se aportan detalles sobre el dataset, el número de tokens de entrenamiento, la composición de los datos ni la metodología de evaluación.

La información proporcionada es internamente inconsistente: el campo `base_model` apunta a Qwen/Qwen4-27B, mientras que el enlace de licencia remite a Qwen/Qwen3.8-27B y el texto de la model card habla de Qwen3.6-27B. Esta discrepancia impide determinar con certeza sobre qué modelo se ha realizado la cuantización. Tampoco se documenta el esquema de cuantización NVFP4 (escalas por bloque, calibración, capas afectadas).

## Capacidades

- Generación de texto y conversación multi-turno (según el pipeline declarado del modelo base).
- Procesamiento de imagen y texto (pipeline image-text-to-text), lo que sugiere capacidades de visión-lenguaje.
- Respuestas sin rechazos según el autor, orientadas a temas que los modelos estándar suelen declinar.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Modo de razonamiento explícito (thinking): no disponible en la información proporcionada.

## Casos de uso

- Investigación sobre alineación y rechazo: el modelo permite estudiar el comportamiento de un modelo con los filtros de seguridad presumiblemente eliminados, útil para analizar mecanismos de refusal en entornos controlados de laboratorio.
- Evaluación de cuantización NVFP4 en GPUs Blackwell: sirve para medir la degradación de calidad y el rendimiento de inferencia en 4 bits frente al modelo en precisión completa, siempre que se disponga de una GPU compatible.
- Procesamiento de imagen y texto en pipelines de visión-lenguaje: si se confirman las capacidades multimodales, podría emplearse para descripción de imágenes o extracción de información de documentos, aunque sin datos de evaluación que lo respalden.
- Pruebas de compatibilidad con vLLM: el tag `vllm` sugiere que el modelo está pensado para desplegarse con ese motor de inferencia, por lo que puede utilizarse para validar flujos de despliegue en infraestructura NVIDIA.
- Generación de contenido sin restricciones temáticas: el autor lo orienta a creación de contenido y conversación abierta, si bien esta aplicación conlleva riesgos legales y éticos significativos.
- Docencia y divulgación sobre modelos sin censura: como ejemplo práctico de las diferencias entre un modelo alineado y uno "abliterated", con las advertencias oportunas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma verificable. Un modelo de ~27B parámetros en NVFP4 (4 bits) requeriría, en teoría, del orden de 14-16 GB solo para los pesos, más overhead de activaciones y KV cache; sin embargo, no se confirma el tamaño real ni la configuración.
- GPU recomendadas: el tag `blackwell` indica que la cuantización NVFP4 requiere GPUs NVIDIA Blackwell (por ejemplo, serie RTX 50 o B200), ya que los formatos NVFP4 dependen de dicha microarquitectura.
- Compatibilidad con GPU de consumo: no confirmada; dependería de disponer de una GPU Blackwell compatible con NVFP4.
- Opciones de despliegue: vLLM (mencionado en los tags) y transformers (librería declarada). No se confirma soporte de llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen4-27B-Uncensored-NVFP4 | no disponible (~27B por nomenclatura) | no disponible | NVFP4 | Apache 2.0 | Repositorio sin pesos publicados según el autor |
| Qwen/Qwen4-27B (base) | no disponible | no disponible | Completa | Apache 2.0 (según enlace) | Referenciado como modelo base |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información suficiente para establecer una comparativa rigurosa con modelos alternativos de la misma categoría.

## Limitaciones y advertencias

- El autor declara explícitamente en la model card que "no hay ningún modelo todavía" y que el repositorio solo anuncia un producto futuro; los pesos podrían no estar disponibles o no corresponder a lo descrito.
- Inconsistencia en el modelo base: se citan Qwen4-27B, Qwen3.6-27B y Qwen3.8-27B en distintos puntos de la documentación.
- La eliminación de filtros de seguridad ("abliteration" y fine-tuning) incrementa el riesgo de generar contenido dañino, ilegal o engañoso, y puede aumentar la tasa de alucinación al degradar el alineamiento.
- Riesgo elevado de alucinación: no hay evaluación publicada que mida la fiabilidad factual del modelo cuantizado.
- La cuantización NVFP4 puede degradar la calidad respecto al modelo en precisión completa; no se documenta la magnitud de esa pérdida.
- Restricciones de licencia: aunque se declara Apache 2.0, el enlace de licencia apunta a una versión distinta del modelo base; conviene verificar los términos reales antes de un uso comercial.
- Idiomas soportados y comportamiento multilingüe no documentados.
- El repositorio presenta 0 descargas y 0 likes, sin señales de validación por parte de la comunidad.
- El uso del modelo para eludir salvaguardas puede contravenir términos de servicio de plataformas y normativa aplicable; se recomienda extremar las precauciones en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/NeuralNet-Hub/Qwen4-27B-Uncensored-NVFP4
- Modelo base referenciado: https://huggingface.co/Qwen/Qwen4-27B
- Enlace de licencia citado en la model card: https://huggingface.co/Qwen/Qwen3.8-27B/blob/main/LICENSE
- Sitio del autor: http://neuralnet.solutions
- Producto promocionado: https://uncensoredgpt.ai
