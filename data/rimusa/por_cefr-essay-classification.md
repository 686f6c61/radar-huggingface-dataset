# rimusa/por_CEFR-essay-classification

## Resumen

`rimusa/por_CEFR-essay-classification` es un modelo de clasificación de texto publicado en Hugging Face por el usuario `rimusa`. Por su identificador y sus etiquetas, está orientado a la clasificación de redacciones (essays) en portugués según los niveles del Marco Común Europeo de Referencia (CEFR), aunque la model card no documenta explícitamente la tarea, el conjunto de etiquetas ni el idioma de forma detallada. El repositorio se creó el 5 de noviembre de 2026 y, en el momento de la consulta, no registra descargas ni interacciones.

El modelo se distribuye en formato safetensors con 125.989.638 parámetros (aproximadamente 126 millones), lo que lo sitúa en la categoría de encoders tipo BERT/RoBERTa de tamaño base. La etiqueta `roberta` en el Hub sugiere una arquitectura transformer encoder-only derivada de RoBERTa, adecuada para tareas de clasificación de secuencias mediante la cabeza `[CLS]`. El tamaño del repositorio es de 0,5 GB.

La relevancia de este modelo es limitada por la ausencia de documentación: no se especifican datos de entrenamiento, métricas de evaluación, licencia ni idiomas soportados más allá de lo que sugiere el prefijo `por_`. Se trata, por tanto, de un checkpoint de utilidad potencial para evaluación automática de nivel de lengua portuguesa, pero sin garantías documentadas para uso en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-only (etiqueta `roberta` en el Hub) |
| Parametros totales | 125.989.638 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors; cuantización posible vía herramientas externas) |
| Idiomas soportados | no disponible (el prefijo `por_` sugiere portugués) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La etiqueta `roberta` del Hub y el recuento de parámetros (126 M) apuntan a un transformer encoder-only de tamaño base, con la típica pila de capas de auto-atención bidireccional y una cabeza de clasificación sobre el token `[CLS]`. El pipeline declarado es `text-classification`. No obstante, la model card es una plantilla automática de Hugging Face sin rellenar: no se documenta el modelo base exacto del que se parte, ni la composición del dataset, ni el número de tokens de entrenamiento, ni si hubo ajuste fino supervisado con anotaciones CEFR.

Tampoco se especifican hiperparámetros de entrenamiento (precisión, régimen, épocas), ni si se aplicaron técnicas de regularización o aumentación de datos. La referencia `arxiv:1910.09700` que aparece en las etiquetas corresponde al artículo de Lacoste et al. sobre el impacto ambiental del aprendizaje automático, citado en la plantilla estándar de model card, no a un paper propio del modelo. Por tanto, no hay información verificable sobre el proceso de entrenamiento.

## Capacidades

- Clasificación de texto: el pipeline declarado es `text-classification`, orientado a asignar una etiqueta a una secuencia de entrada.
- Clasificación de nivel CEFR: por el nombre del modelo, se espera que asigne niveles del Marco Común Europeo de Referencia a redacciones, presumiblemente en portugués.
- Procesamiento de textos de longitud media: al ser un encoder tipo RoBERTa, la ventana efectiva típica es de 512 tokens, aunque este dato no está confirmado en la información disponible.
- No se documenta soporte de tool calling, agentes, razonamiento multi-paso, visión, audio ni modos de pensamiento.
- Capacidades multilingües: no disponibles; el prefijo `por_` sugiere un alcance limitado al portugués.

## Casos de uso

- Evaluación automática de redacciones en portugués: el modelo podría asignar un nivel CEFR (A1-C2) a textos de estudiantes, integrándose en una plataforma de aprendizaje de lenguas para dar retroalimentación inmediata sobre el nivel estimado.
- Clasificación por lotes de corpus educativos: en un pipeline de procesamiento por lotes, permitiría etiquetar miles de redacciones con su nivel estimado para análisis curricular o investigación en lingüística aplicada.
- Triaje en exámenes de certificación: como primera pasada automática que agrupe redacciones por nivel estimado antes de la revisión humana, reduciendo la carga de los evaluadores.
- Investigación en evaluación automática de lenguas: serviría como línea base (baseline) para comparar con otros clasificadores CEFR en estudios académicos sobre portugués como lengua extranjera.
- Filtrado y segmentación de contenidos: para organizar materiales didácticos o textos de estudiantes por dificultad estimada dentro de un repositorio educativo.
- Integración en servicios de inferencia: al ser compatible con `text-embeddings-inference` y `endpoints_compatible`, puede desplegarse en infraestructura de Hugging Face Endpoints para servir clasificaciones vía API REST.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 0,5 GB (126 M parámetros × 4 bytes).
- VRAM estimada en fp16: aproximadamente 0,25 GB; en int8: en torno a 0,13 GB.
- Cabe holgadamente en cualquier GPU consumer (GTX 1060 6 GB, RTX 3060, RTX 4090) e incluso en CPU para inferencia por lotes de tamaño moderado.
- GPU recomendadas para alto throughput: A100, H100 o L4 para servir grandes volúmenes; para uso individual, cualquier GPU con al menos 2 GB de VRAM es suficiente.
- Opciones de despliegue: `transformers` (pipeline `text-classification`), Hugging Face Text Embeddings Inference (TEI), Hugging Face Endpoints (etiqueta `endpoints_compatible`); también es convertible a ONNX para inferencia optimizada.
- Latencia y throughput: no disponibles en la información proporcionada; por el tamaño del modelo, se espera un throughput alto en GPU (miles de secuencias por segundo en lote), pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| rimusa/por_CEFR-essay-classification | 126 M | no disponible | Clasificación CEFR (presunta) | no disponible | Hugging Face |
| roberta-base | 125 M | 512 tokens | Modelo base (MLM) | MIT | Hugging Face |
| bert-base-multilingual-cased | 178 M | 512 tokens | Modelo base multilingüe | Apache 2.0 | Hugging Face |
| xlm-roberta-base | 278 M | 512 tokens | Modelo base multilingüe | MIT | Hugging Face |

La comparación se limita a modelos base de tamaño similar, ya que no se han identificado en la información disponible clasificadores CEFR comparables para portugués. El modelo de `rimusa` no documenta métricas que permitan una comparación de rendimiento con estas alternativas.

## Limitaciones y advertencias

- Documentación inexistente: la model card es una plantilla automática sin rellenar; no hay información sobre datos de entrenamiento, evaluación ni uso previsto.
- Licencia no disponible: no se puede confirmar si el uso comercial está permitido; en ausencia de licencia explícita, debe asumirse que no hay autorización clara para producción.
- Idiomas no confirmados: aunque el prefijo `por_` sugiere portugués, no se documenta el alcance lingüístico ni el comportamiento en otros idiomas.
- Riesgo de sesgo: sin información sobre el corpus de entrenamiento, no es posible evaluar sesgos demográficos, dialectales o de género en las etiquetas CEFR.
- Riesgo de alucinación: al ser un clasificador, no genera texto libre, pero puede producir etiquetas incorrectas con alta confianza en entradas fuera de distribución.
- Sin métricas de evaluación: no hay evidencia publicada de precisión, F1 ni acuerdo con evaluadores humanos, lo que impide validar su fiabilidad.
- Cero adopción: 0 descargas y 0 likes en el momento de la consulta, sin comunidad que haya validado su comportamiento.
- Longitud de contexto no confirmada: si se basa en RoBERTa, la ventana sería de 512 tokens, insuficiente para redacciones largas sin truncamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/rimusa/por_CEFR-essay-classification
- Paper citado en la plantilla (impacto ambiental, Lacoste et al. 2019): https://arxiv.org/abs/1910.09700
- Calculadora de impacto ambiental ML: https://mlco2.github.io/impact
