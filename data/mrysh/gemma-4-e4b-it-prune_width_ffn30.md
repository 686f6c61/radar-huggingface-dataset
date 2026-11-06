# mrysh/gemma-4-e4b-it-prune_width_ffn30

## Resumen

`mrysh/gemma-4-e4b-it-prune_width_ffn30` es una variante podada por anchura del modelo `google/gemma-4-E4B-it`, publicada por el usuario mrysh como parte de un banco de pruebas de poda (4 modelos x 8 variantes) que compara distintas estrategias de pruning frente a cuantización sobre los conjuntos BFCL, hiring-bias y MedQA, evaluados con vLLM. No es un modelo pensado para producción, sino un artefacto de investigación para medir la degradación de calidad que introduce la poda sin reentrenamiento posterior.

La poda se aplicó con NVIDIA ModelOpt (versión 0.46.0rc1) mediante la técnica Minitron de poda por anchura: la dimensión de las capas FFN se reduce de 10240 a 7168 en todas las capas (un 30 % solicitado, ejecutado como nivel 0.3), manteniendo intacto el número de capas. La importancia de las neuronas se estimó sobre un conjunto de calibración de 512 muestras mixtas. El checkpoint resultante conserva 6.950.196.554 parámetros y ocupa 13,9 GB en disco, lo que supone una reducción del 13,9 % de los parámetros del modelo de lenguaje (13,1 % del checkpoint completo).

El interés de esta ficha es doble: por un lado, documenta un caso concreto de poda estructurada sobre un modelo multimodal de la familia Gemma 4; por otro, sirve como referencia metodológica para quien quiera reproducir el benchmark o evaluar el coste real (en calidad) de recortar anchura en las FFN sin destilación ni fine-tuning. El autor advierte explícitamente de que debe esperarse una caída de calidad frente al modelo base.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (familia Gemma 4), poda por anchura en capas FFN; bloques de visión y audio del modelo base conservados sin cambios |
| Parámetros totales | 6.950.196.554 (6,95 B) |
| Parámetros activos | no disponible (el modelo base es `gemma-4-E4B-it`; no se confirma en la información proporcionada si es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible en la model card; el benchmark compara las variantes podadas con cuantización, pero no se detallan los formatos empleados |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Reducción de parámetros | 13,9 % del modelo de lenguaje; 13,1 % del checkpoint completo |
| Dimensión FFN | 10240 → 7168 por capa (30 % solicitado, nivel 0.3) |
| Herramienta de poda | nvidia-modelopt 0.46.0rc1 (Minitron, poda por anchura) |
| Conjunto de calibración | 512 muestras mixtas |
| Tamaño en disco | 13,933 GB |
| Modelo base | google/gemma-4-E4B-it |

## Arquitectura y entrenamiento

El modelo parte de `google/gemma-4-E4B-it`, un transformer de la familia Gemma 4 con bloques multimodales (visión y, según el modelo base, audio). La intervención aplicada es una poda estructurada por anchura: en cada capa se recorta la dimensión de las proyecciones FFN de 10240 a 7168, seleccionando las neuronas menos importantes según una métrica de importancia estimada sobre 512 muestras mixtas de calibración. El número de capas no se modifica, y los bloques de visión y audio se mantienen íntegros: solo se poda la parte lingüística.

No hubo destilación ni fine-tuning después de la poda, lo que significa que los pesos restantes no se reajustaron para compensar la pérdida de capacidad. La model card menciona además que la herramienta de poda elimina la cabeza de predicción multi-token de Qwen3.5, un detalle heredado del pipeline de ModelOpt que no afecta al comportamiento del modelo Gemma, ya que dicha cabeza no forma parte de su arquitectura. No se proporcionan datos sobre el número de tokens de entrenamiento original, la composición del dataset ni si el modelo base utilizó RLHF o DPO; esa información correspondería a la model card de `google/gemma-4-E4B-it`.

## Capacidades

- Generación de texto y razonamiento conversacional, heredados del modelo base, con la salvedad de la degradación esperada por la poda sin reentrenamiento.
- Capacidades multimodales de visión conservadas: los bloques de visión no se podan, aunque en el benchmark el modelo se evalúa únicamente como modelo de texto.
- Posible soporte de audio si el modelo base lo incluye; la model card no lo confirma explícitamente.
- Modo "thinking" del modelo base: el benchmark se ejecuta con thinking desactivado, pero el checkpoint conserva la estructura del modelo original.
- Soporte de tool calling y function calling: no confirmado en la información proporcionada; el benchmark emplea BFCL (Berkeley Function Calling Leaderboard), lo que sugiere que el modelo base tiene capacidad de function calling, pero no se detalla el comportamiento de esta variante podada.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Razonamiento multi-paso y uso como agente: no verificado para esta variante.

## Casos de uso

- Investigación sobre poda estructurada: utilizar esta variante como punto de comparación en estudios sobre el impacto de recortar anchura en las FFN, junto con las otras siete variantes del benchmark del autor, para aislar el efecto de la poda por anchura frente a otras técnicas.
- Evaluación de la degradación de calidad: medir la caída en BFCL, hiring-bias y MedQA respecto al modelo base y a versiones cuantizadas, con el fin de decidir si la poda por anchura es competitiva frente a la cuantización en términos de calidad por byte.
- Reproducción de benchmarks con vLLM: el modelo está pensado para ejecutarse en vLLM como modelo de texto con thinking desactivado, lo que facilita integrarlo en pipelines de evaluación estandarizados.
- Estudio de sesgos en modelos comprimidos: el conjunto hiring-bias del benchmark permite analizar si la poda amplifica o atenúa sesgos de contratación presentes en el modelo base.
- Prototipado de bajo coste en investigación: al ocupar 13,9 GB en safetensors, puede cargarse en GPUs de gama alta para experimentos exploratorios donde la fidelidad al modelo base no sea crítica.
- Análisis de robustez multimodal tras poda lingüística: al conservar los bloques de visión intactos y podar solo el lenguaje, permite estudiar cómo afecta la compresión del LLM a tareas que combinan imagen y texto.
- Docencia y formación: ejemplo didáctico de pipeline de poda con NVIDIA ModelOpt y de las decisiones metodológicas (calibración, nivel de poda, ausencia de destilación) que condicionan el resultado.

## Benchmarks y rendimiento

No se han publicado resultados numéricos de benchmarks en la información disponible. La model card indica que el modelo se evalúa en BFCL, hiring-bias y MedQA con vLLM (thinking desactivado) como parte de un benchmark comparativo de 4 modelos x 8 variantes de poda frente a cuantización, pero no incluye las puntuaciones obtenidas.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: en torno a 14 GB solo para pesos, más overhead de activaciones y caché KV; se recomienda un mínimo de 24 GB para contexto moderado.
- VRAM estimada en cuantización de 8 bits: aproximadamente 7-8 GB para pesos, con margen adicional para activaciones.
- VRAM estimada en cuantización de 4 bits: aproximadamente 4-5 GB para pesos, viable en GPUs de consumo con 8-12 GB según longitud de contexto.
- GPUs recomendadas: A100 40/80 GB, H100, L40S para evaluación a gran escala; RTX 4090 (24 GB) para BF16 con contexto limitado; RTX 3090/4080 para cuantización de 8 bits.
- Cabe en GPU de consumo: sí, en RTX 4090 en BF16 con contexto moderado y en GPUs de 8-12 GB con cuantización de 4 bits.
- Opciones de despliegue: vLLM es el motor empleado en el benchmark del autor; al ser un checkpoint en safetensors con arquitectura Gemma 4, debería poder convertirse a GGUF para llama.cpp u Ollama, aunque no se documenta en la model card.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Estado | Notas |
|---|---|---|---|---|---|
| mrysh/gemma-4-e4b-it-prune_width_ffn30 | 6,95 B | no disponible | Apache 2.0 | Podado, sin fine-tuning | 13,9 % menos parámetros en el LM; benchmark propio |
| google/gemma-4-E4B-it | no disponible en la información | no disponible | Apache 2.0 (según tags del modelo podado) | Modelo base oficial | Referencia de calidad; bloques de visión y audio intactos |
| Otras variantes del benchmark del autor (7 restantes) | no disponible | no disponible | Apache 2.0 (presumiblemente) | Podadas con otras técnicas/niveles | Comparación directa dentro del mismo estudio |
| Versiones cuantizadas del modelo base | mismas que el base | no disponible | Apache 2.0 | Cuantización | Línea base alternativa frente a la poda en el benchmark |

No se dispone de datos de rendimiento para establecer una comparación cuantitativa con alternativas de la misma categoría.

## Limitaciones y advertencias

- Caída de calidad esperada: no hubo destilación ni fine-tuning tras la poda, por lo que el autor advierte explícitamente de una degradación frente al modelo base.
- Artefacto de investigación: el modelo se publica para un benchmark de poda, no como modelo listo para producción; no hay garantías de comportamiento estable en tareas reales.
- Evaluación limitada: solo se evalúa como modelo de texto con vLLM y thinking desactivado; no se documentan resultados en visión, audio ni en modo thinking.
- Idiomas no documentados: no se especifica qué lenguas conserva ni cómo afecta la poda al rendimiento multilingüe.
- Contexto no documentado: se desconoce si la poda afecta a la longitud de contexto efectiva del modelo base.
- Riesgo de alucinación: no cuantificado para esta variante; la poda sin reentrenamiento puede aumentar la tasa de errores factuales respecto al base.
- Sesgos: el benchmark incluye hiring-bias precisamente para medirlos, pero no se publican resultados; se desconoce si la poda amplifica sesgos del modelo base.
- Licencia: Apache 2.0 según la model card, con la indicación de que se aplica la misma licencia que el modelo base; conviene revisar la model card de `google/gemma-4-E4B-it` para condiciones adicionales de uso comercial.
- Trazabilidad: el repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y no se ha publicado documentación adicional más allá de la model card.
- Compatibilidad: al ser un checkpoint podado con ModelOpt, puede requerir versiones específicas de vLLM o de las librerías de carga para interpretar correctamente la arquitectura modificada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mrysh/gemma-4-e4b-it-prune_width_ffn30
- Modelo base: https://huggingface.co/google/gemma-4-E4B-it
- NVIDIA ModelOpt (herramienta de poda): no se proporciona enlace en la información disponible
- Paper de Minitron (técnica de poda): no se proporciona enlace en la información disponible
- BFCL (Berkeley Function Calling Leaderboard): no se proporciona enlace en la información disponible
- Repositorio del benchmark del autor: no disponible
