# bartowski/thinkingmachines_Inkling-2-Small-GGUF

## Resumen

Inkling-2-Small es un modelo de lenguaje de tipo Mixture-of-Experts (MoE) desarrollado por Thinking Machines, distribuido en formato GGUF por bartowski para su uso con llama.cpp. Con 593.722.948.608 parámetros totales en el checkpoint original (594B), se posiciona como un modelo de gran escala orientado a tareas conversacionales y de razonamiento multimodal, aunque la model card del quantizador indica soporte de entrada únicamente de texto. La relevancia de esta ficha radica en que bartowski ha publicado una familia completa de cuantizaciones imatrix (desde Q8_0 hasta IQ2_S) que permiten ejecutar un modelo de casi 600B parámetros en hardware que de otro modo sería inviable.

El modelo emplea una arquitectura MoE, tal como indican los tags del repositorio, y soporta un formato de prompt estructurado con etiquetas especiales (`<|message_system|>`, `<|content_text|>`, `<|end_message|>`) que incluye un parámetro explícito de "Thinking effort level" (por ejemplo, 0.9), lo que sugiere un modo de razonamiento configurable. También admite declaración de herramientas mediante XML en el prompt del sistema, lo que habilita tool calling.

La licencia es Apache 2.0, lo que facilita el uso comercial. El repositorio GGUF ocupa 7543.7 GB en total (sumando todas las cuantizaciones) y la cuantización recomendada por el autor, Q4_K_M, pesa 368.98 GB. Esto implica que el modelo no cabe en GPUs de consumo individuales y requiere despliegues multi-GPU o con offloading a RAM/CPU.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE), transformer |
| Parametros totales | 593.722.948.608 (594B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q8_0, Q6_K, Q6_K_S, Q5_K_M, Q5_K_S, Q4_1, Q4_K_M, IQ4_NL, Q4_K_S, Q4_0, IQ4_XS, Q3_K_L, IQ3_M, Q3_K_M, IQ3_XS, Q3_K_S, IQ3_XXS, Q2_K, IQ2_M, IQ2_S |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (quantizado con llama.cpp b12412, imatrix) |

## Arquitectura y entrenamiento

La información disponible confirma que Inkling-2-Small es un modelo MoE (tag `moe` en el repositorio) con 594B parámetros totales en el checkpoint fuente. No se dispone de datos sobre el número de parámetros activos por token, el número de expertos, la dimensión oculta, el número de capas ni la longitud de contexto nativa. El quantizador indica que la entrada soportada es texto, aunque el pipeline tag del repositorio es `image-text-to-text`, lo que genera una discrepancia que no puede resolverse con los datos disponibles.

En cuanto al entrenamiento, no se han publicado en la información proporcionada detalles sobre el número de tokens, la composición del dataset, ni si se aplicaron técnicas de RLHF, DPO o similares. El formato de prompt incluye un campo "Thinking effort level" que sugiere un entrenamiento orientado a razonamiento con esfuerzo configurable, pero se desconoce el mecanismo exacto. Las cuantizaciones se generaron con llama.cpp release b12412 e incluyen calibración imatrix, lo que mejora la calidad de las cuantizaciones de baja precisión. No se menciona decodificación especulativa (el autor indica explícitamente "Speculative decoding: no").

## Capacidades

- Generación de texto conversacional multi-turno, con formato de prompt estructurado mediante etiquetas especiales.
- Razonamiento con nivel de esfuerzo configurable ("Thinking effort level", por ejemplo 0.9), lo que permite ajustar la profundidad de razonamiento.
- Tool calling / function calling: el formato de prompt admite declaración de herramientas en XML dentro del mensaje de sistema, con esquema JSON de parámetros.
- Capacidades multimodales inciertas: el pipeline tag es `image-text-to-text`, pero la model card del quantizador indica entrada solo de texto; no disponible confirmación.
- Capacidades multilingües: no disponible.
- Capacidades de agente y razonamiento multi-paso: inferidas del soporte de tool calling y del modo de razonamiento, aunque no hay documentación explícita.

## Casos de uso

- Asistentes conversacionales de alta complejidad: el modelo puede gestionar diálogos multi-turno con un formato de prompt estructurado y un nivel de esfuerzo de razonamiento ajustable, adecuado para atención al cliente avanzada donde se requiere coherencia en conversaciones largas.
- Automatización de agentes con tool calling: gracias a la declaración de herramientas en XML con esquemas JSON, puede integrarse en pipelines de agentes que consulten APIs externas (por ejemplo, precios de acciones, como muestra el ejemplo de la model card).
- Razonamiento configurable en producción: el parámetro "Thinking effort level" permite desplegar el mismo modelo con distinto coste computacional según la tarea, usando niveles bajos para respuestas rápidas y altos para problemas complejos.
- Análisis de documentos extensos: aunque el contexto no está documentado, un modelo de 594B parámetros con arquitectura MoE es adecuado para tareas de comprensión y resumen de documentación técnica en entornos con hardware multi-GPU.
- Generación de código asistida: el soporte de tool calling y razonamiento multi-paso permite integrarlo en entornos de desarrollo para sugerencias, revisión y ejecución de acciones sobre repositorios.
- Investigación en eficiencia de modelos MoE: la disponibilidad de cuantizaciones desde Q8_0 hasta IQ2_S permite estudiar el impacto de la precisión en el rendimiento de un modelo de gran escala, con imatrix como referencia de calidad.
- Despliegue en clústeres con offloading: las cuantizaciones de menor tamaño (IQ2_S, 209.46 GB) permiten ejecutar el modelo en configuraciones con RAM abundante y GPUs de gama alta, útil para prototipado en investigación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: depende de la cuantización. Q4_K_M (recomendada) ocupa 368.98 GB; Q8_0 ocupa 631.10 GB; IQ2_S ocupa 209.46 GB. Se requiere VRAM igual o superior al tamaño del archivo, o bien offloading a RAM/CPU.
- GPU recomendadas: no cabe en ninguna GPU de consumo individual. Requiere configuraciones multi-GPU con A100 (80 GB), H100 (80 GB) o similares; por ejemplo, Q4_K_M necesitaría al menos 5× A100/H100 de 80 GB solo para pesos, más overhead de contexto y KV cache.
- Consumer GPU: no es viable en RTX 4090 (24 GB) ni en ninguna GPU de consumo, ni siquiera con la cuantización más pequeña (IQ2_S, 209.46 GB).
- Opciones de despliegue: llama.cpp (formato nativo GGUF, generado con b12412), y por extensión Ollama y otros frontends compatibles con GGUF. vLLM y TGI no soportan GGUF de forma nativa para este tamaño sin conversión.
- Latencia y throughput: no disponibles. Con 594B parámetros totales y arquitectura MoE, el throughput dependerá del número de parámetros activos (no disponible) y del ancho de banda de memoria del sistema multi-GPU.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. Los datos disponibles no permiten establecer una comparativa rigurosa con alternativas de la misma categoría (MoE de gran escala con cuantizaciones GGUF), ya que se desconocen parámetros activos, contexto y rendimiento en benchmarks.

| Modelo | Parámetros totales | Contexto | Licencia | Formato |
|---|---|---|---|---|
| Inkling-2-Small | 594B | no disponible | Apache 2.0 | GGUF |
| Alternativas | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Tamaño prohibitivo: incluso la cuantización más pequeña (IQ2_S, 209.46 GB) requiere hardware de servidor multi-GPU o configuraciones con gran cantidad de RAM y offloading, lo que limita su uso a entornos de investigación o producción de gran escala.
- Discrepancia multimodal: el pipeline tag indica `image-text-to-text`, pero la model card del quantizador afirma entrada solo de texto; no se puede confirmar el soporte real de visión.
- Idiomas no documentados: no hay información sobre cobertura lingüística, lo que impide garantizar calidad en castellano u otros idiomas.
- Contexto desconocido: la longitud de contexto no está publicada, lo que dificulta planificar casos de uso con documentos largos.
- Riesgo de alucinación: inherente a los modelos de lenguaje de gran escala; no hay documentación específica sobre mitigaciones.
- Sesgos: no disponibles; no se ha publicado información sobre evaluación de sesgos.
- Licencia Apache 2.0: permite uso comercial, pero el modelo base es de Thinking Machines y se desconoce si hay restricciones adicionales en la model card original (no disponible en la información proporcionada).
- Cuantizaciones de baja precisión (Q2_K, IQ2_S, IQ2_M): el propio autor advierte de calidad "muy baja" o "relativamente baja", aunque "sorprendentemente usable"; no recomendables para producción crítica.
- Sin decodificación especulativa: el autor indica explícitamente que no se soporta, lo que limita optimizaciones de latencia.

## Enlaces

- Repositorio GGUF: https://huggingface.co/bartowski/thinkingmachines_Inkling-2-Small-GGUF
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Small
- llama.cpp release b12412: https://github.com/ggml-org/llama.cpp/releases/tag/b12412
- Repositorio llama.cpp: https://github.com/ggml-org/llama.cpp/
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
- Cuantización Q4_K_M (recomendada): https://huggingface.co/bartowski/Inkling-2-Small-GGUF/tree/main/Inkling-2-Small-Q4_K_M
