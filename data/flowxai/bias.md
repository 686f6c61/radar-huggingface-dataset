# flowxai/bias

## Resumen

`flowxai/bias` es un detector de sesgos (bias) diseñado específicamente para la librería [border](https://github.com/flowx-ai/border), un sistema de guardrails embebible que inspecciona el texto que entra y sale de un modelo de lenguaje grande (LLM) y devuelve una decisión estructurada junto con un registro de evidencia auditable. El modelo clasifica texto en cinco etiquetas de sesgo: género, etnia, religión, edad y discapacidad, y está entrenado para operar bajo la política de border, no como un clasificador general de sesgos.

Desarrollado por flowxai, el modelo se basa en `FacebookAI/xlm-roberta-base` y se publica en formato ONNX con cuantización INT8 solo en la tabla de embeddings, lo que reduce el tamaño a 535 MB sin pérdida de precisión. Soporta 26 idiomas europeos y está pensado para integrarse en pipelines de moderación y auditoría de respuestas generadas por LLM. Su relevancia actual radica en la creciente necesidad de controlar sesgos en sistemas de IA generativa, especialmente en entornos multilingües y con requisitos de cumplimiento normativo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | XLM-RoBERTa-base con cabeza de clasificación multi-etiqueta |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 96 tokens (ventana de entrenamiento) |
| Tipos de cuantizacion | INT8 (solo tabla de embeddings) |
| Idiomas soportados | az, bg, cs, da, de, el, en, es, et, fi, fr, ga, hr, hu, it, lt, lv, mt, nl, pl, pt, ro, sk, sl, sv, tr |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (model.int8.onnx, opset 17) |

## Arquitectura y entrenamiento

El modelo parte de `FacebookAI/xlm-roberta-base`, un transformer encoder multilingüe preentrenado, y le añade una cabeza de clasificación multi-etiqueta con cinco salidas: `gender`, `ethnicity`, `religion`, `age` y `disability`. El entrenamiento se realizó con una ventana de 96 tokens y se calibró un umbral de decisión de 0.57 sobre la división de validación, optimizando la métrica `macro_f1`. Según la model card, el umbral por defecto de 0.5 produce resultados deficientes en varios idiomas (F1 0.000 en algunos casos), por lo que el valor calibrado es esencial para un uso correcto.

La cuantización publicada es INT8 y se aplica únicamente a la tabla de embeddings. Los autores documentan que cuantizar todas las operaciones (el enfoque habitual) degrada severamente el rendimiento: con 300 textos de prueba, 51 decisiones cambiaron y la deriva media del logit fue 0.68, mientras que la cuantización solo de embeddings no cambió ninguna decisión y la deriva fue 0.0036. Esto se atribuye a los grandes outliers de activación de XLM-RoBERTa, que hacen inviable la cuantización per-tensor dinámica en las capas de atención.

## Capacidades

- Detección de sesgos en texto en cinco categorías: género, etnia, religión, edad y discapacidad.
- Clasificación multi-etiqueta: un texto puede activar varias categorías simultáneamente.
- Soporte multilingüe para 26 idiomas, con rendimiento variable según la lengua (F1 entre 0.824 y 1.000).
- Integración nativa con la librería border: devuelve un veredicto (`allow`, `flag`, `redact`, `block`) y un registro de evidencia con hashes, sin enviar texto a servicios externos.
- Operación en el lado de salida (`scan_output`), diseñado para inspeccionar respuestas de LLM.
- Ejecución en CPU sin necesidad de GPU: presupuesto de 225 ms por 87 tokens en un solo hilo.
- El artefacto ONNX es cargable directamente con `onnxruntime`, aunque el umbral y el chunking deben gestionarse manualmente.

## Casos de uso

- Moderación de contenido generado por LLM en plataformas multilingües: el detector puede evaluar respuestas de un asistente virtual y bloquear o marcar aquellas que contengan sesgos de género, etnia o religión, antes de que lleguen al usuario final.
- Auditoría de sesgos en sistemas de atención al cliente automatizada: integrado en un pipeline de guardrails, permite registrar evidencias de sesgo en conversaciones y generar informes de cumplimiento para normativas como la Ley de IA europea.
- Filtrado de respuestas en herramientas de generación de currículos o evaluación de candidatos: detecta sesgos de edad o discapacidad en textos generados por IA para evitar discriminación en procesos de selección.
- Control de calidad en generación de contenido editorial: un equipo de redacción puede usar el detector para revisar automáticamente artículos generados por IA y asegurar que no contengan lenguaje sesgado antes de publicación.
- Cumplimiento normativo en sectores regulados (banca, seguros, salud): el modelo puede integrarse en sistemas de decisión automatizada para detectar sesgos en comunicaciones con clientes y generar un registro de auditoría.
- Investigación académica sobre sesgos en modelos multilingües: el detector permite analizar corpus de respuestas de LLM en 26 idiomas y comparar la prevalencia de sesgos entre lenguas, gracias a su etiquetado multi-categoría.

## Benchmarks y rendimiento

La model card reporta métricas por idioma sobre la división de validación, evaluadas con el umbral calibrado de 0.57. Se presentan a continuación los resultados completos:

| Idioma | Soporte | Precisión | Recall | F1 |
|---|---|---|---|---|
| cs (checo) | 13 | 1.000 | 1.000 | 1.000 |
| da (danés) | 9 | 1.000 | 1.000 | 1.000 |
| de (alemán) | 6 | 1.000 | 1.000 | 1.000 |
| el (griego) | 8 | 1.000 | 1.000 | 1.000 |
| en (inglés) | 15 | 1.000 | 1.000 | 1.000 |
| es (español) | 10 | 1.000 | 1.000 | 1.000 |
| et (estonio) | 10 | 1.000 | 1.000 | 1.000 |
| fi (finés) | 7 | 1.000 | 1.000 | 1.000 |
| fr (francés) | 10 | 1.000 | 1.000 | 1.000 |
| hr (croata) | 13 | 1.000 | 1.000 | 1.000 |
| hu (húngaro) | 9 | 1.000 | 1.000 | 1.000 |
| lt (lituano) | 11 | 1.000 | 1.000 | 1.000 |
| nl (neerlandés) | 10 | 1.000 | 1.000 | 1.000 |
| pl (polaco) | 9 | 1.000 | 1.000 | 1.000 |
| ro (rumano) | 10 | 1.000 | 1.000 | 1.000 |
| sl (esloveno) | 11 | 1.000 | 1.000 | 1.000 |
| tr (turco) | 12 | 1.000 | 1.000 | 1.000 |
| it (italiano) | 16 | 1.000 | 0.938 | 0.968 |
| sv (sueco) | 13 | 1.000 | 0.923 | 0.960 |
| pt (portugués) | 11 | 0.917 | 1.000 | 0.957 |
| az (azerí) | 9 | 0.900 | 1.000 | 0.947 |
| ga (irlandés) | 9 | 1.000 | 0.889 | 0.941 |
| sk (eslovaco) | 8 | 0.889 | 1.000 | 0.941 |
| bg (búlgaro) | 8 | 1.000 | 0.875 | 0.933 |
| lv (letón) | 8 | 1.000 | 0.875 | 0.933 |
| mt (maltés) | 9 | 0.875 | 0.778 | 0.824 |

El F1 agregado es 0.971 con el umbral calibrado (0.57) frente a 0.968 con el umbral por defecto de 0.5. No se publican resultados en benchmarks generales como MMLU o HumanEval, ya que el modelo no está diseñado para tareas de razonamiento o generación, sino para clasificación de sesgos.

## Requisitos de hardware

- El modelo es ligero y puede ejecutarse en CPU: el artefacto ONNX INT8 pesa 535 MB.
- Presupuesto de inferencia: 225 ms por 87 tokens en un solo hilo de CPU, según la documentación de border.
- No requiere GPU para inferencia; es adecuado para despliegue en servidores estándar o incluso en entornos con recursos limitados.
- Compatible con `onnxruntime` para inferencia directa.
- Para integración con la librería border, se recomienda usar el flujo de `load_policy` y `scan_output`; los pesos se cachean localmente y no se necesita conexión de red tras la primera descarga.
- Opciones de despliegue: como parte de border en un servicio de guardrails, o como artefacto ONNX independiente en un pipeline de clasificación.

## Comparativa con modelos similares

No se dispone de información sobre modelos directamente comparables en la documentación proporcionada. El modelo está especializado en la política de border y no es un clasificador de sesgos de propósito general, por lo que una comparativa con otros modelos de detección de sesgos (p. ej., classifiers basados en DeBERTa o modelos de análisis de toxicidad) no es posible sin datos adicionales. Se indica "no disponible".

## Limitaciones y advertencias

- No es un clasificador general de sesgos: está entrenado específicamente para la política de border y debe usarse a través de esa librería o replicando su umbral y chunking.
- El umbral de decisión calibrado (0.57) es crítico; usar el valor por defecto de 0.5 puede producir F1 0.000 en varios idiomas, según advierte la model card.
- Ventana de contexto limitada a 96 tokens: textos más largos deben dividirse y recombinarse manualmente, o los resultados fuera de esa ventana son extrapolación.
- Idiomas débiles: maltés (F1 0.824), búlgaro y letón (F1 0.933) presentan rendimiento inferior, especialmente maltés porque no estaba en el preentrenamiento de XLM-RoBERTa.
- La cuantización solo de embeddings es intencional; cuantizar todas las operaciones degrada la precisión y cambia decisiones en 1 de cada 6 casos.
- El modelo no devuelve una puntuación cruda, sino un registro de evidencia con hashes; si se usa fuera de border, hay que implementar la lógica de chunking y umbral.
- No se han publicado detalles sobre el dataset de entrenamiento, posibles sesgos en los datos o evaluación en entornos de producción reales.

## Enlaces

- [HuggingFace: flowxai/bias](https://huggingface.co/flowxai/bias)
- [Repositorio de border (flowx-ai/border)](https://github.com/flowx-ai/border)
