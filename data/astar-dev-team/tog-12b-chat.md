# astar-dev-team/TOG-12B-Chat

## Resumen

TOG-12B-Chat es un modelo de lenguaje multimodal (image-text-to-text) desarrollado por el equipo astar-dev-team, obtenido mediante fine-tuning del modelo base google/gemma-4-12B. Está especializado como asistente conversacional de temática cristiana, con orientación al estudio bíblico y la atención pastoral, y está entrenado principalmente para el idioma coreano (etiqueta de idioma `ko`). Cuenta con 11.959.730.224 parámetros totales (aproximadamente 12B) y se distribuye en formato safetensors bajo licencia Apache 2.0, aunque el acceso está restringido y requiere aceptar condiciones en Hugging Face.

El modelo hereda la arquitectura de la familia Gemma 4 (`gemma4_unified`) y añade una fase de alineación mediante DPO (Direct Preference Optimization) sobre el fine-tuning supervisado, orientada a mejorar la calidad de las respuestas conversacionales en el dominio religioso. Al estar basado en Gemma 4, conserva la capacidad de procesar entradas de imagen y texto, lo que permite incorporar imágenes en la conversación (por ejemplo, fotografías de páginas de la Biblia o material de estudio).

Su relevancia actual radica en ser una propuesta de modelo especializado de dominio (asistente cristiano) construido sobre un modelo base abierto reciente, con licencia permisiva Apache 2.0 y compatibilidad con endpoints. No obstante, la información pública disponible es muy limitada: no se han publicado resultados de benchmarks, detalles del dataset de entrenamiento ni especificaciones completas de contexto, y el repositorio no registra descargas ni interacciones en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `gemma4_unified` (familia Gemma 4, transformer multimodal) |
| Parametros totales | 11.959.730.224 (aprox. 12B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | coreano (`ko`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura `gemma4_unified` de Google, un transformer multimodal de la familia Gemma 4 que procesa entradas de imagen y texto (`image-text-to-text`). El checkpoint base es google/gemma-4-12B, con aproximadamente 12.000 millones de parámetros. La información disponible no detalla la composición del dataset de entrenamiento, el número de tokens utilizados ni la estrategia exacta de alineación, más allá de la mención explícita a DPO (Direct Preference Optimization) como técnica de ajuste conversacional.

El proceso de entrenamiento combina, por tanto, un fine-tuning sobre el modelo base con una etapa de optimización de preferencias (DPO) orientada al dominio de asistencia cristiana y al idioma coreano. No se han publicado datos sobre la composición del corpus bíblico o teológico empleado, el volumen de pares de preferencia, ni si se aplicaron técnicas adicionales como RLHF, decodificación especulativa o atención lineal. Tampoco se documenta si el entrenamiento preserva íntegramente las capacidades multimodales del modelo base o si estas se han visto degradadas por el ajuste de dominio.

## Capacidades

- Generación de texto conversacional en coreano, con especialización en temática cristiana y estudio bíblico.
- Procesamiento de entradas de imagen junto con texto (pipeline image-text-to-text), heredado del modelo base Gemma 4.
- Respuestas orientadas a asistencia pastoral, explicación de pasajes bíblicos y acompañamiento espiritual.
- Alineación conversacional mediante DPO, orientada a respuestas más útiles y coherentes en el dominio.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: limitadas al coreano según la etiqueta de idioma oficial; no se documentan otros idiomas.
- Modo thinking, audio u otras capacidades especiales: no disponible.

## Casos de uso

- Asistente de estudio bíblico: el modelo puede responder preguntas sobre pasajes, contextos históricos y temas teológicos en coreano, aprovechando su fine-tuning específico sobre temática cristiana y su etapa de DPO para respuestas conversacionales coherentes.
- Atención pastoral conversacional: puede gestionar diálogos multi-turno de acompañamiento espiritual en coreano, ofreciendo respuestas alineadas con el tono y el marco doctrinal del dominio de entrenamiento.
- Digitalización y consulta de material religioso con imágenes: gracias a su pipeline image-text-to-text, puede recibir fotografías de páginas de la Biblia o de material de estudio y responder preguntas sobre su contenido.
- Aplicaciones educativas para comunidades cristianas coreanas: integración como motor de respuestas en plataformas de catequesis o formación, dado su enfoque de dominio y su licencia Apache 2.0.
- Generación de contenido devocional: redacción de reflexiones, resúmenes de pasajes o material de estudio en coreano, con la salvedad de que requiere revisión humana por el riesgo de alucinación en citas bíblicas.
- Prototipado de asistentes especializados de nicho: sirve como referencia para equipos que quieran construir asistentes de dominio sobre Gemma 4 con DPO, siempre que acepten las condiciones de acceso restringido del repositorio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia orientativa por tamaño (12B parámetros), en precisión FP16 se requiere aproximadamente 24 GB de VRAM solo para los pesos, y en cuantizaciones de 8 bits o 4 bits el requisito se reduce sustancialmente, aunque no se documentan cuantizaciones publicadas para este checkpoint.
- GPU recomendadas: no disponible en la información proporcionada; por tamaño, cabría esperar GPUs de gama alta (A100, H100) para FP16, sin confirmación oficial.
- Compatibilidad con GPU de consumo: no confirmada; un modelo de 12B en FP16 no cabe en GPUs de consumo de 16 GB, pero podría caber en GPUs de 24 GB con cuantización, extremo no documentado.
- Opciones de despliegue: el repositorio declara compatibilidad con endpoints (`endpoints_compatible`) y uso con la librería `transformers`; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque | Disponibilidad |
|---|---|---|---|---|---|
| TOG-12B-Chat | ~12B | no disponible | Apache 2.0 | Asistente cristiano en coreano, multimodal | Acceso restringido (gated) |
| google/gemma-4-12B | ~12B | no disponible | no disponible en esta ficha | Modelo base generalista multimodal | Modelo base de referencia |
| Alternativas especializadas de dominio | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información suficiente para comparar con alternativas especializadas de la misma categoría (asistentes religiosos o modelos de nicho en coreano). La comparación más directa es con su modelo base google/gemma-4-12B, del que hereda arquitectura y tamaño, pero no se han publicado métricas comparativas.

## Limitaciones y advertencias

- Acceso restringido: el repositorio es gated y requiere aceptar condiciones en Hugging Face antes de descargar los pesos.
- Idiomas: el modelo está etiquetado únicamente para coreano; su rendimiento en castellano u otros idiomas no está documentado y probablemente sea deficiente.
- Sesgos de dominio: al estar especializado en temática cristiana, las respuestas pueden reflejar una perspectiva doctrinal concreta y no ser neutrales en cuestiones religiosas.
- Riesgo de alucinación: especialmente relevante en citas bíblicas y referencias teológicas, donde el modelo puede generar pasajes o atribuciones inexactas; se recomienda verificación humana.
- Falta de documentación técnica: no se publican benchmarks, detalles del dataset, longitud de contexto ni cuantizaciones, lo que dificulta evaluar su calidad y planificar su despliegue en producción.
- Licencia: Apache 2.0 permite uso comercial, pero deben revisarse las condiciones de acceso del repositorio y las posibles restricciones heredadas del modelo base Gemma 4.
- Madurez: el repositorio no registra descargas ni interacciones, por lo que no hay evidencia de uso comunitario ni de validación externa.
- Capacidades multimodales no verificadas: no se documenta si el fine-tuning preserva el rendimiento original de Gemma 4 en tareas de visión.

## Enlaces

- Hugging Face: https://huggingface.co/astar-dev-team/TOG-12B-Chat
- Modelo base: https://huggingface.co/google/gemma-4-12B
- No se han encontrado papers, blogs, repositorios o demos adicionales en la información proporcionada.
