# NiviG/hallucination-detector

## Resumen

El modelo `NiviG/hallucination-detector` es un clasificador de texto especializado en la detección de alucinaciones en salidas generadas por modelos de lenguaje. Se trata de un fine-tuning de Microsoft **DeBERTa-v3-base** sobre el dataset **FEVER** (Fact Extraction and VERification), con más de 25 000 ejemplos de entrenamiento. Su función es evaluar si una afirmación generada por IA (claim) está respaldada, contradicha o no verificable a partir de un contexto de evidencia proporcionado.

Este modelo resuelve un problema crítico en sistemas de producción que utilizan generación aumentada por recuperación (RAG) o asistentes conversacionales: verificar automáticamente la fidelidad de las respuestas generadas frente a las fuentes de referencia. Al estar basado en DeBERTa-v3, hereda una arquitectura transformer encoder robusta para tareas de inferencia de lenguaje natural (NLI), con un tamaño de 184 millones de parámetros en su versión base, aunque el número exacto de parámetros del fine-tuning no se especifica en la documentación disponible.

La relevancia actual de este modelo radica en su utilidad como componente de control de calidad en pipelines de IA generativa, donde la verificación de hechos es un requisito cada vez más demandado. Su licencia no está declarada, lo que limita su uso comercial sin consulta previa al autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DeBERTa-v3-base (fine-tuned) |
| Parametros totales | no disponible (base: ~184M) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible (limitado por DeBERTa-v3-base, típicamente 512 tokens) |
| Tipos de cuantizacion | no disponible (pesos en safetensors, compatible con transformers) |
| Idiomas soportados | no disponible (dataset FEVER es principalmente inglés) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en **DeBERTa-v3-base**, un transformer encoder con atención desenmascarada mejorada (decoupled attention) y embeddings de posición relativos. DeBERTa-v3 incorpora el reemplazo de tokens enmascarados (RTD) como objetivo de preentrenamiento, lo que mejora la eficiencia respecto a versiones anteriores. Para esta tarea, se añade una cabeza de clasificación de tres clases sobre la representación del token `[CLS]`.

El entrenamiento se realizó sobre el dataset **FEVER**, un corpus de verificación de hechos que contiene pares de afirmaciones y documentos de Wikipedia etiquetados como `SUPPORTED`, `REFUTED` o `NOT ENOUGH INFO`. El fine-tuning usó 25 000+ ejemplos, con 3 épocas, tamaño de lote 8, tasa de aprendizaje 2e-5 y optimizador AdamW. No se menciona el uso de técnicas adicionales como RLHF o DPO; el entrenamiento es supervisado clásico.

## Capacidades

- Clasificación de pares de texto (claim + evidence) en tres categorías: factual, incierto o alucinación.
- Detección de contradicciones entre una afirmación generada y un contexto de referencia.
- Identificación de casos donde la evidencia es insuficiente para verificar la afirmación.
- Compatible con la API de `transformers` para `text-classification` y con `Text Embeddings Inference` (TEI) para despliegue en endpoints.
- No es un modelo generativo; su salida es una etiqueta de clase con probabilidades asociadas.
- No soporta tool calling, agentes ni razonamiento multi-paso; es un clasificador discriminativo.

## Casos de uso

- Verificación de hechos en sistemas RAG: dado un fragmento recuperado como evidencia, el modelo evalúa si la respuesta generada por el LLM está respaldada por ese fragmento, reduciendo el riesgo de alucinaciones en producción.
- Control de calidad en asistentes conversacionales: integrar el clasificador como paso posterior a la generación para rechazar o marcar respuestas no verificables antes de enviarlas al usuario.
- Auditoría de datasets sintéticos: validar si las afirmaciones generadas automáticamente para entrenar modelos están respaldadas por las fuentes originales.
- Moderación de contenido factual: en plataformas de noticias o foros, comprobar si una declaración de usuario contradice un artículo de referencia.
- Evaluación de pipelines de generación: medir la tasa de alucinaciones en diferentes configuraciones de prompts o modelos comparando la proporción de etiquetas `HALLUCINATION`.
- Filtrado de respuestas en chatbots de atención al cliente: si la evidencia proviene de una base de conocimiento interna, el modelo puede descartar respuestas que no se alineen con la documentación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor no reporta métricas como exactitud, F1 o comparativas con otros modelos en el dataset FEVER o en conjuntos de validación adicionales.

## Requisitos de hardware

- Al ser un modelo DeBERTa-v3-base (≈184M parámetros), la inferencia es ligera y cabe en GPUs de consumo.
- VRAM estimada para inferencia en FP32: ~740 MB; en FP16: ~370 MB.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM (ej. NVIDIA GTX 1650, RTX 3060, Apple Silicon con Metal).
- Compatible con despliegue en CPU para baja latencia si se usa cuantización (aunque no se documentan cuantizaciones oficiales).
- Opciones de despliegue: `transformers` con pipeline de `text-classification`, `Text Embeddings Inference` (TEI) para endpoints, o exportación a ONNX para optimización.
- Latencia estimada: en una GPU moderna (RTX 3090), inferencia en menos de 10 ms por par de secuencias; en CPU, entre 50-200 ms dependiendo de la longitud.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación del autor. Como referencia general, otros detectores de alucinación basados en NLI incluyen modelos como `BART-large-MNLI` o `RoBERTa-large-MNLI`, pero no hay datos de rendimiento del presente modelo frente a ellos. La comparativa queda pendiente de evaluación empírica.

## Limitaciones y advertencias

- La licencia no está declarada; el uso comercial requiere contacto con el autor para aclarar términos.
- El modelo fue entrenado principalmente en inglés (dataset FEVER), por lo que su rendimiento en otros idiomas es incierto y no está documentado.
- La longitud de contexto está limitada por DeBERTa-v3-base (típicamente 512 tokens); evidencia más larga debe truncarse o dividirse.
- No distingue entre alucinaciones sutiles y errores factuales menores si la evidencia es ambigua; la etiqueta `UNCERTAIN` cubre solo casos de información insuficiente.
- Riesgo de sesgo derivado del dataset FEVER, que se basa en artículos de Wikipedia; afirmaciones sobre temas no cubiertos en ese corpus pueden clasificarse incorrectamente como `UNCERTAIN`.
- No es un modelo generativo; no puede producir explicaciones ni justificaciones de sus decisiones más allá de la etiqueta y la probabilidad.
- Para producción, se recomienda calibrar el umbral de decisión según la tolerancia al error de cada aplicación.

## Enlaces

- [Página del modelo en HuggingFace](https://huggingface.co/NiviG/hallucination-detector)
- [Dataset FEVER](https://fever.ai/) (referencia del dataset de entrenamiento)
- [DeBERTa-v3-base en HuggingFace](https://huggingface.co/microsoft/deberta-v3-base) (modelo base)
- No se proporcionan papers, repositorios adicionales ni demos en la información disponible.
