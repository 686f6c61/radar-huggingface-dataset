# giuseppe-trisciuoglio/DiarizationLM-Gemma-4-E4B-v1-mlx-4bit

## Resumen

DiarizationLM-Gemma-4-E4B-v1-mlx-4bit es una conversión a formato MLX con cuantización de 4 bits del modelo `diarizers-community/DiarizationLM-Gemma-4-E4B-v1`, publicada por el usuario giuseppe-trisciuoglio. No se trata de un modelo nuevo entrenado desde cero, sino de una adaptación de pesos para su ejecución eficiente en hardware Apple Silicon mediante la librería MLX. El modelo base parte de Gemma 4 E4B, un transformer de aproximadamente 7.460 millones de parámetros, y está especializado en el post-procesamiento de transcripciones ya diarizadas: asigna y refina etiquetas de hablante sobre un texto existente, no realiza diarización acústica.

La relevancia de esta ficha radica en que documenta una conversión concreta orientada a un caso de uso de producción (la etapa opcional de refinamiento de asignación de hablantes de MeetRecord) y, sobre todo, en que el propio autor reporta de forma explícita los fallos observados durante la validación. El modelo se distribuye con licencia Apache 2.0, un tamaño de repositorio de 4,2 GB y cuantización afín de 4 bits con grupo de tamaño 64 (4,501 bits por peso).

Es importante subrayar que se trata de un modelo de procesamiento de texto, no de un diarizador acústico: requiere una transcripción diarizada previa y no debe sustituir a los modelos de identificación acústica de hablantes. La información disponible sobre idiomas soportados, benchmarks y pipeline no está publicada en la model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Gemma 4 E4B, modelo base); conversión MLX |
| Parametros totales | 7.463.013.418 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4-bit affine, group size 64 (4,501 bits por peso); origen en bfloat16 |
| Idiomas soportados | no disponible (validado con entradas en inglés e italiano) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

El modelo base es Gemma 4 E4B, un transformer de aproximadamente 7.460 millones de parámetros según los pesos en safetensors. La conversión publicada no entrena el modelo: aplica cuantización afín de 4 bits con grupo de tamaño 64 sobre los pesos originales en bfloat16, generando safetensors en formato MLX. El proceso se realizó con `mlx-lm`, forzando la cuantización y el guardado en la CPU para evitar timeouts del command buffer de Metal en un Mac de 16 GB.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni si hubo RLHF o DPO en el modelo original. La especialización del modelo base es el refinamiento de asignación de hablantes sobre transcripciones diarizadas (DiarizationLM), es decir, una tarea de post-procesamiento textual. La revisión del modelo base utilizada fue `a9de8b130e43ff2f647088e644be56f067102441`, y la conversión se generó el 2026-11-14.

## Capacidades

- Post-procesamiento de transcripciones diarizadas: recibe un texto con etiquetas de hablante y refina la asignación de turnos.
- Generación de texto sobre entradas con marcadores de hablante y terminadores tipo `[eod]`.
- Validación en inglés e italiano: el control en inglés y una entrada italiana corta y limpia completaron según lo esperado.
- No realiza diarización acústica: no procesa audio ni identifica hablantes a partir de señal de voz.
- Soporte de tool calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no documentadas formalmente; la validación se limitó a inglés e italiano.
- Capacidades especiales (visión, audio, thinking mode): no disponibles en la información proporcionada.

## Casos de uso

- Refinamiento de transcripciones de reuniones: el modelo se integra como etapa opcional tras una diarización acústica para corregir la asignación de hablantes en el texto, tal como se plantea en MeetRecord. Es adecuado porque opera sobre texto ya etiquetado y no requiere audio.
- Corrección de turnos en actas automáticas: en pipelines de generación de actas, puede reasignar fragmentos mal atribuidos antes de la publicación, siempre con una puerta de calidad que conserve la hipótesis acústica original.
- Preprocesado para análisis de conversaciones: normalizar la atribución de hablantes antes de calcular métricas por participante (tiempo de habla, intervenciones) en herramientas de analítica de reuniones.
- Evaluación comparativa de pipelines de diarización: usar el modelo como etapa de post-proceso y medir su impacto frente a la hipótesis acústica en conjuntos de validación controlados.
- Prototipado en Apple Silicon: al estar en formato MLX 4-bit, permite probar el flujo de refinamiento en un Mac sin GPU dedicada, con un consumo de memoria contenido.
- Investigación sobre DiarizationLM: servir como artefacto reproducible para estudiar los modos de fallo del refinamiento textual de hablantes en distintos idiomas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente reporta una prueba de humo (smoke test) cualitativa con prompts en bruto sobre entradas en inglés e italiano, sin métricas numéricas como DER, MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- VRAM/memoria estimada: el repositorio ocupa 4,2 GB en safetensors MLX 4-bit; la inferencia requiere memoria adicional para activaciones y contexto.
- Hardware de referencia: la conversión se realizó en un Mac de 16 GB, forzando la cuantización en CPU por timeouts de Metal, lo que indica que el proceso de conversión es viable en ese equipo.
- GPU recomendadas: no disponibles en la información proporcionada; el formato MLX está orientado a Apple Silicon (M-series).
- Compatibilidad con GPU consumer: no confirmada para CUDA; el artefacto es específico de MLX.
- Opciones de despliegue: `mlx-lm` (librería declarada). No se documentan vLLM, llama.cpp, Ollama ni TGI para este artefacto.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| DiarizationLM-Gemma-4-E4B-v1-mlx-4bit (este) | 7.463.013.418 | no disponible | MLX safetensors 4-bit | apache-2.0 | Conversión comunitaria; fallos reportados en italiano real |
| diarizers-community/DiarizationLM-Gemma-4-E4B-v1 | no disponible | no disponible | safetensors bfloat16 | apache-2.0 (heredada) | Modelo base original; sin cuantizar |
| Gemma 4 E4B (base genérica) | ~7,46 B (según este artefacto) | no disponible | safetensors | no disponible en esta ficha | Modelo generalista, sin especialización en diarización |

No se dispone de datos de rendimiento comparado entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- No es un diarizador acústico: requiere una transcripción diarizada previa y no debe reemplazar a los modelos de identificación acústica de hablantes.
- Fallos reportados en reuniones reales en italiano: fragmentación excesiva de hablantes, alternancia de hablante palabra por palabra, contaminación con inglés y ausencia de terminadores `[eod]`.
- Riesgo de modificar la transcripción: la aplicación debe validar de forma conservadora y conservar la hipótesis acústica original cuando la salida cambie el texto, introduzca hablantes desconocidos, derive lingüísticamente o fragmente turnos en exceso.
- Idiomas: no hay lista oficial de idiomas soportados; la validación se limita a inglés e italiano y el comportamiento en otros idiomas es desconocido.
- Sesgos: no documentados en la información disponible.
- Riesgo de alucinación: no cuantificado; el propio autor advierte de derivas lingüísticas en la salida.
- Licencia: Apache 2.0 heredada del modelo original, lo que permite uso comercial, pero el repositorio solo contiene la conversión cuantizada y metadatos, sin datos de entrenamiento ni audio.
- Contexto máximo: no disponible, lo que impide planificar con precisión transcripciones largas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/giuseppe-trisciuoglio/DiarizationLM-Gemma-4-E4B-v1-mlx-4bit
- Modelo base: https://huggingface.co/diarizers-community/DiarizationLM-Gemma-4-E4B-v1
- Informe de puerta de calidad de MeetRecord: https://github.com/giuseppe-trisciuoglio/meetrecord/blob/main/scripts/eval/reports/2026-11-gate-diarizationlm-419.md
