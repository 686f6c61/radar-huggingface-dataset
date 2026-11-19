# protocolsyncllc/medgap-qwen-3.5-9b

## Resumen

MedGap Qwen 3.5 9B es un ajuste fino (fine-tune) del modelo base Qwen 3.5 9B, desarrollado por protocolsyncllc. El modelo está especializado en el dominio regulatorio de dispositivos médicos, concretamente en el análisis y generación de contenido relacionado con las cartas de advertencia (warning letters) que la FDA estadounidense emite a fabricantes de dispositivos médicos. El problema que aborda es la necesidad de herramientas especializadas que comprendan la terminología regulatoria y los patrones de incumplimiento recogidos en estos documentos.

El modelo se entrena mediante LoRA sobre el checkpoint base de Qwen 3.5 9B (unsloth/Qwen3.5-9B-Base), con un total de 9.653.104.368 parámetros. El entrenamiento se realizó durante 3 épocas con una tasa de aprendizaje de 2e-4 sobre un dataset propio de cartas de advertencia de la FDA (medical-devices.jsonl), empleando 2 GPUs RTX 3090 con 48 GB de VRAM en total y la librería Unsloth. La licencia es Apache 2.0 y el modelo está orientado exclusivamente al idioma inglés.

Su relevancia radica en la escasez de modelos de código abierto especializados en cumplimiento regulatorio sanitario. Un modelo afinado sobre documentos reales de la FDA puede asistir en la revisión de hallazgos, la redacción de respuestas regulatorias o la identificación de patrones de incumplimiento recurrentes, tareas tradicionalmente reservadas a expertos humanos con formación específica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivada de Qwen 3.5 9B; detalles internos no disponibles) |
| Parametros totales | 9.653.104.368 |
| Parametros activos | no disponible (no se documenta como MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF Q8 disponible; otras cuantizaciones no documentadas |
| Idiomas soportados | inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, GGUF |

## Arquitectura y entrenamiento

El modelo parte de la arquitectura del checkpoint base Qwen 3.5 9B, un transformer decoder-only de aproximadamente 9.650 millones de parámetros. El ajuste se realizó mediante LoRA (Low-Rank Adaptation), una técnica de fine-tuning eficiente en parámetros que congela los pesos originales e inyecta matrices de bajo rango entrenables. Según la model card, el entrenamiento se ejecutó durante 3 épocas con una tasa de aprendizaje de 2e-4, sobre un dataset propio de cartas de advertencia de la FDA relativas a dispositivos médicos (archivo medical-devices.jsonl). La infraestructura empleada fueron 2 GPUs RTX 3090 con 48 GB de VRAM combinada y la librería Unsloth, optimizada para fine-tuning de bajo consumo de memoria.

No se documentan en la información disponible el número total de tokens de entrenamiento, la composición detallada del dataset, la existencia de fases de RLHF o DPO, ni innovaciones técnicas adicionales como decodificación especulativa o atención lineal. Tampoco se especifica si el contexto del modelo base se ha extendido o modificado durante el ajuste.

## Capacidades

- Generación de texto especializada en el dominio regulatorio de dispositivos médicos.
- Comprensión y generación de contenido relacionado con cartas de advertencia de la FDA.
- Asistencia en la identificación de patrones de incumplimiento regulatorio.
- Generación conversacional (pipeline text-generation, tag conversational).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: limitadas al inglés.
- Capacidades especiales (modo thinking, visión, audio): no disponibles en la información proporcionada.

## Casos de uso

- Revisión de hallazgos regulatorios: el modelo puede analizar borradores de informes de auditoría y señalar formulaciones que se asemejen a las observaciones recogidas en cartas de advertencia previas de la FDA, sirviendo de apoyo a equipos de calidad y asuntos regulatorios.
- Redacción de respuestas a la FDA: dado su ajuste sobre el corpus de warning letters, puede asistir en la generación de borradores de respuestas formales a observaciones de la agencia, manteniendo el registro y la terminología habituales del sector.
- Formación interna de equipos de cumplimiento: puede emplearse para generar casos de estudio sintéticos basados en patrones reales de incumplimiento, útiles en programas de formación sobre calidad regulatoria.
- Análisis de tendencias de incumplimiento: el modelo puede resumir y clasificar temáticas recurrentes (etiquetado, control de diseño, CAPA, etc.) a partir de textos regulatorios introducidos por el usuario.
- Asistencia en auditorías internas: integrado en herramientas internas, puede ayudar a redactar listas de verificación o a contrastar procedimientos internos con el lenguaje típico de las observaciones de la FDA.
- Generación de documentación técnica de dispositivos médicos: puede apoyar la redacción de secciones de expedientes técnicos, siempre con revisión humana, aprovechando su familiaridad con la terminología regulatoria del sector.
- Enriquecimiento de bases de conocimiento internas: puede utilizarse para etiquetar, resumir o normalizar grandes volúmenes de documentos regulatorios en pipelines de procesamiento de texto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16: aproximadamente 19-20 GB para los 9.653 millones de parámetros, más overhead de activaciones y caché KV.
- VRAM estimada en cuantización Q8 GGUF: aproximadamente 10-11 GB, según el archivo medgap-qwen-3.5-9b_q8.gguf publicado.
- GPU recomendadas: A100 40/80 GB, H100, L40S o RTX 4090 (24 GB) para FP16; RTX 3090/4090 o GPUs con 12 GB o más para Q8 GGUF.
- Cabe en GPU de consumo: sí, en RTX 3090, RTX 4090 y, en cuantizaciones más agresivas no publicadas, potencialmente en GPUs de 8-12 GB.
- Opciones de despliegue: llama.cpp u Ollama para el GGUF Q8; vLLM o TGI para los pesos safetensors en FP16/BF16; la librería Unsloth está orientada principalmente a entrenamiento, no a serving.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Especialización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MedGap Qwen 3.5 9B | 9,65 B | no disponible | Cartas de advertencia FDA (dispositivos médicos) | Apache 2.0 | Hugging Face |
| Qwen 3.5 9B Base | ~9,65 B | no disponible | Propósito general | Apache 2.0 (según modelo base) | Hugging Face |
| Modelos médicos generalistas de ~7-9 B | 7-9 B | variable | Medicina general | variable | Hugging Face |

No se dispone de datos de benchmarks que permitan una comparación cuantitativa con alternativas. La comparación con el modelo base es la más directa: MedGap hereda la arquitectura y capacidades generales de Qwen 3.5 9B Base, pero sustituye parte de su alineación generalista por una especialización estrecha en documentación regulatoria de la FDA, lo que puede degradar su rendimiento en tareas generales fuera de dominio.

## Limitaciones y advertencias

- Dominio muy estrecho: el ajuste se centra exclusivamente en cartas de advertencia de la FDA sobre dispositivos médicos; su rendimiento fuera de ese ámbito puede ser inferior al del modelo base.
- Idioma: solo se declara soporte de inglés; el uso en castellano no está validado y probablemente degrade la calidad.
- Riesgo de alucinación: como todo modelo generativo, puede inventar referencias regulatorias, números de carta o requisitos legales; toda salida debe ser verificada por un experto en asuntos regulatorios.
- No es asesoramiento legal ni regulatorio: el modelo no sustituye la revisión de profesionales cualificados ni la consulta de la normativa vigente.
- Sesgos: al entrenarse sobre un corpus específico de la FDA, puede reproducir sesgos y estilos propios de la agencia y de los fabricantes sancionados, sin representar la diversidad del sector.
- Datos de entrenamiento no documentados en detalle: se desconoce el volumen, la fecha de corte y la composición exacta del dataset, lo que dificulta evaluar su cobertura y vigencia.
- Contexto: no se especifica la longitud de contexto soportada; conviene validarla empíricamente antes de desplegarlo con documentos largos.
- Uso comercial: la licencia Apache 2.0 permite uso comercial, pero el usuario asume la responsabilidad sobre la exactitud de las salidas en contextos regulados.
- Repositorio de gran tamaño (172,2 GB), lo que implica costes de almacenamiento y descarga considerables.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/protocolsyncllc/medgap-qwen-3.5-9b
- Modelo base: https://huggingface.co/unsloth/Qwen3.5-9B-Base
- GGUF Q8: https://huggingface.co/protocolsyncllc/medgap-qwen-3.5-9b/blob/main/medgap-qwen-3.5-9b_q8.gguf
- Dataset: https://huggingface.co/datasets/protocolsyncllc/fda-warning-letters
- Librería Unsloth: https://github.com/unslothai/unsloth
