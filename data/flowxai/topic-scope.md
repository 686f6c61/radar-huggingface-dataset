# flowxai/topic-scope

## Resumen

`flowxai/topic-scope` es un detector de clasificación de texto desarrollado por flowxai, diseñado específicamente para la librería `border`, una biblioteca embebible que inspecciona el texto de entrada y salida de un modelo de lenguaje (LLM) y devuelve una decisión estructurada junto con un registro de evidencia auditable. No es un clasificador general de temas, sino un componente de guardarraíles entrenado para la política de esa librería, que se lee mediante `argmax` y sin umbral.

El modelo se basa en `FacebookAI/xlm-roberta-base` con una cabecera de clasificación de una sola etiqueta, y se distribuye como un artefacto ONNX cuantizado a INT8 (solo la tabla de embeddings). Está entrenado con una ventana de 96 tokens y soporta 26 idiomas. Su relevancia actual reside en que permite auditar y filtrar el tráfico hacia un LLM en producción, con un presupuesto de 300 ms por 87 tokens en un solo hilo de CPU, sin necesidad de red tras la carga inicial de pesos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (XLM-RoBERTa base) |
| Parametros totales | No disponible (base: ~278M, artefacto final no especificado) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 96 tokens (ventana de entrenamiento) |
| Tipos de cuantizacion | INT8 (solo tabla de embeddings, "Gather only") |
| Idiomas soportados | az, bg, cs, da, de, el, en, es, et, fi, fr, ga, hr, hu, it, lt, lv, mt, nl, pl, pt, ro, sk, sl, sv, tr |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (`onnx/model.int8.onnx`, 533 MB, opset 17) |

## Arquitectura y entrenamiento

El modelo parte de `FacebookAI/xlm-roberta-base` y añade una cabecera de clasificación de una sola etiqueta (`single_label_classification`). Los datos de entrenamiento son sintéticos, generados de forma nativa por idioma (no traducidos desde el inglés), lo que preserva la estructura sintáctica propia de cada lengua. La ventana de entrenamiento es de 96 tokens, y el artefacto publicado se lee con `argmax` sin umbral.

La innovación técnica destacable es la estrategia de cuantización. El artefacto publicado cuantiza únicamente la tabla de embeddings (Gather only). Según las mediciones del autor sobre 300 textos reales, cuantizar todas las operaciones (la práctica habitual) produce un drift medio de logits de 0.68 y cambia 51 de 300 decisiones, mientras que la cuantización solo de la tabla de embeddings mantiene el drift en 0.0036 y no altera ninguna decisión. Esto se debe a que XLM-RoBERTa presenta outliers grandes en las activaciones, que degradan la cuantización dinámica per-tensor de los MatMuls del encoder.

## Capacidades

- Clasificación de texto para determinar el alcance temático (`topic_scope`) de la entrada, orientada a políticas de guardarraíles.
- Soporte multilingüe en 26 idiomas, aunque la evaluación publicada muestra resultados nulos (ver sección de benchmarks).
- Integración con la librería `flowx-border`: devuelve una decisión estructurada (`allow`, `flag`, `redact`, `block`) junto con un registro de evidencia que incluye hashes en lugar del texto plano.
- Funciona como detector de nivel T3: se activa solo cuando un detector de nivel inferior marca algo, o si la política establece `always: true`.
- Inferencia en CPU con presupuesto de 300 ms por 87 tokens en un solo hilo.
- Sin dependencia de red tras la carga inicial de pesos; los pesos se cachean localmente.
- El artefacto es ONNX puro, por lo que puede cargarse directamente con `onnxruntime` si se gestionan externamente el punto de operación y el chunking.

## Casos de uso

- Filtrado de prompts en aplicaciones LLM: escanea el texto de entrada y bloquea o marca contenido que queda fuera del alcance temático definido por la política de la empresa, evitando que llegue al modelo generativo.
- Auditoría de seguridad y cumplimiento: genera un registro de evidencia con hashes criptográficos del texto, permitiendo auditar decisiones sin almacenar datos sensibles en claro, útil para entornos regulados.
- Guardarraíles multilingües en producción: despliegue en sistemas que atienden a usuarios en varios de los 26 idiomas soportados, manteniendo una política de alcance uniforme.
- Preprocesamiento en pipelines de RAG: verifica que las consultas de los usuarios se ajustan al dominio del sistema antes de la recuperación y generación, reduciendo respuestas fuera de contexto.
- Clasificación offline en entornos aislados: al ser un artefacto ONNX de 533 MB, puede ejecutarse en infraestructura sin conexión a internet o en el edge, sin depender de APIs externas.
- Evaluación de políticas en tiempo real: integrado en el tier T3 de `border`, se activa bajo demanda cuando un detector de nivel inferior lo solicita, permitiendo un análisis jerárquico y eficiente del tráfico.

## Benchmarks y rendimiento

La model card publica una tabla de rendimiento por idioma, en lugar de un agregado, para no ocultar la cola de distribución. Los datos son los siguientes:

| Idioma | Soporte | P | R | F1 | Nota |
|---|---|---|---|---|---|
| `az` Azerí | 0 | 0.000 | 0.000 | 0.000 |  |
| `bg` Búlgaro | 0 | 0.000 | 0.000 | 0.000 |  |
| `cs` Checo | 0 | 0.000 | 0.000 | 0.000 |  |
| `da` Danés | 0 | 0.000 | 0.000 | 0.000 |  |
| `de` Alemán | 0 | 0.000 | 0.000 | 0.000 |  |
| `el` Griego | 0 | 0.000 | 0.000 | 0.000 |  |
| `en` Inglés | 0 | 0.000 | 0.000 | 0.000 |  |
| `es` Español | 0 | 0.000 | 0.000 | 0.000 |  |
| `et` Estonio | 0 | 0.000 | 0.000 | 0.000 |  |
| `fi` Finlandés | 0 | 0.000 | 0.000 | 0.000 |  |
| `fr` Francés | 0 | 0.000 | 0.000 | 0.000 |  |
| `ga` Irlandés | 0 | 0.000 | 0.000 | 0.000 |  |
| `hr` Croata | 0 | 0.000 | 0.000 | 0.000 |  |
| `hu` Húngaro | 0 | 0.000 | 0.000 | 0.000 |  |
| `it` Italiano | 0 | 0.000 | 0.000 | 0.000 |  |
| `lt` Lituano | 0 | 0.000 | 0.000 | 0.000 |  |
| `lv` Letón | 0 | 0.000 | 0.000 | 0.000 |  |
| `mt` Maltés | 0 | 0.000 | 0.000 | 0.000 | no está en el preentrenamiento del modelo base |
| `nl` Neerlandés | 0 | 0.000 | 0.000 | 0.000 |  |
| `pl` Polaco | 0 | 0.000 | 0.000 | 0.000 |  |
| `pt` Portugués | 0 | 0.000 | 0.000 | 0.000 |  |
| `ro` Rumano | 0 | 0.000 | 0.000 | 0.000 |  |
| `sk` Eslovaco | 0 | 0.000 | 0.000 | 0.000 |  |
| `sl` Esloveno | 0 | 0.000 | 0.000 | 0.000 |  |
| `sv` Sueco | 0 | 0.000 | 0.000 | 0.000 |  |
| `tr` Turco | 0 | 0.000 | 0.000 | 0.000 |  |

Estos datos indican que, en la evaluación publicada, no hay ningún caso de soporte positivo y el F1 es nulo en todos los idiomas. El autor publica estos resultados en lugar de ocultarlos, señalando que una tabla de cobertura con las filas malas eliminadas no es una tabla de cobertura.

Respecto a la cuantización, las mediciones sobre 300 textos reales son:

| Receta | Tamaño | Drift medio de logits | Decisiones cambiadas |
|---|---|---|---|
| Todas las operaciones (por defecto) | 279 MB | 0.68 | 51 / 300 |
| Solo MatMul | 856 MB | 0.64 | 48 / 300 |
| Solo Gather (lo que se distribuye) | 535 MB | 0.0036 | 0 / 300 |

Para el artefacto final, el drift medio de logits respecto al checkpoint fp32 es 0.0000, aunque el número exacto de decisiones cambiadas en una prueba de 200 textos no se especifica en la documentación (aparece como "?").

## Requisitos de hardware

- Inferencia en CPU: presupuesto de 300 ms por 87 tokens en un solo hilo, por lo que es viable en CPUs de servidor estándar o incluso en equipos de escritorio.
- Tamaño del artefacto: 533 MB en disco (ONNX INT8).
- No requiere GPU para inferencia; puede ejecutarse en cualquier CPU moderna sin aceleración.
- Despliegue recomendado: mediante la librería `flowx-border` (instalable con `pip install flowx-border`) o directamente con `onnxruntime` si se gestionan el punto de operación y el chunking externamente.
- Sin dependencia de red tras la carga inicial de pesos, lo que facilita el despliegue en entornos aislados.

## Comparativa con modelos similares

No se dispone de datos de rendimiento comparables en la información proporcionada, por lo que la comparativa es estructural:

| Modelo | Tipo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| `flowxai/topic-scope` | Clasificador (guardarraíles) | No disponible (base ~278M) | 96 tokens | Apache-2.0 | ONNX INT8 | Especializado en `topic_scope` para la librería `border`. Evaluación publicada con F1 nulo. |
| Llama Guard | Modelo generativo de clasificación | 7B | 4K tokens (aprox.) | Llama Community License | PyTorch | Requiere GPU para inferencia eficiente; no es ONNX puro. |
| NeMo Guardrails | Framework de guardarraíles | No aplica | No aplica | Apache-2.0 | Framework | No es un modelo, sino un conjunto de herramientas que puede integrar varios clasificadores. |

La principal diferencia es que `topic-scope` es un artefacto ONNX ligero y específico para una tarea concreta dentro de una librería de auditoría, mientras que las alternativas son más generales o requieren infraestructura más pesada.

## Limitaciones y advertencias

- Datos de entrenamiento sintéticos: aunque se generan nativamente por idioma, no dejan de ser sintéticos, y la distribución de producción puede diferir sustancialmente.
- Evaluación publicada con F1 nulo en todos los idiomas: la tabla de benchmarks muestra soporte 0 y F1 0.000 para las 26 lenguas. Esto sugiere que o bien la evaluación no es representativa, o el modelo no discrimina correctamente en el conjunto de prueba. Es imprescindible validar el comportamiento en datos reales antes de usarlo en producción.
- Ventana de contexto limitada a 96 tokens: las entradas más largas deben dividirse y recombinarse externamente, ya que el grafo ONNX no incluye el chunking. Las puntuaciones más allá de la ventana entrenada son extrapolación.
- Cuantización sensible: cuantizar todas las operaciones del encoder cambia 51 de 300 decisiones (drift de 0.68). Solo la cuantización de la tabla de embeddings es segura para este modelo.
- Etiquetas no registradas: la model card indica "Labels: not recorded", por lo que se desconoce la taxonomía exacta de clases que predice.
- No es un clasificador general de temas: está entrenado específicamente para la política de la librería `border` y no debe usarse fuera de ese contexto sin reentrenamiento.
- El idioma maltés (`mt`) no está en el preentrenamiento del modelo base, por lo que su soporte es nominal y no se sustenta en el aprendizaje previo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/flowxai/topic-scope
- Repositorio de la librería `border`: https://github.com/flowx-ai/border
