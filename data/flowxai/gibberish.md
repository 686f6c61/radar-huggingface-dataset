# flowxai/gibberish

## Resumen

`flowxai/gibberish` es un detector de texto sin sentido (gibberish) desarrollado por FlowX AI como parte de su librería embebible `border`, un sistema de guardarraíles para inspeccionar el texto que entra y sale de un modelo de lenguaje. No es un clasificador genérico de gibberish, sino un detector especializado entrenado para la política específica de dicha librería, que devuelve una decisión estructurada y un registro de evidencia auditable en lugar de una puntuación aislada.

El modelo se basa en `FacebookAI/xlm-roberta-base` con una cabeza de clasificación multi-etiqueta que distingue entre tres categorías: `noise`, `word_salad` y `repetition`. Se distribuye como un artefacto ONNX (opset 17) de 535 MB en formato INT8, donde únicamente la tabla de embeddings está cuantizada para preservar la precisión. Está entrenado para una ventana de 96 tokens y soporta 26 idiomas, lo que lo hace relevante para entornos de producción multilingües que necesitan filtrar entradas corruptas o malintencionadas antes de que lleguen al LLM.

Su relevancia actual radica en la creciente necesidad de implementar capas de seguridad y control de calidad en pipelines de IA generativa. Al ser un artefacto ONNX puro, puede ejecutarse en CPU con `onnxruntime` sin dependencias de red, y su integración principal se realiza a través de la librería `border`, que gestiona el umbral de decisión, el troceado de textos largos y la generación de registros de evidencia con hashes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (XLM-RoBERTa-base) con cabeza de clasificación multi-etiqueta |
| Parametros totales | No disponible (basado en FacebookAI/xlm-roberta-base) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 96 tokens (ventana de entrenamiento) |
| Tipos de cuantizacion | INT8 (solo tabla de embeddings, no los MatMuls) |
| Idiomas soportados | 26: az, bg, cs, da, de, el, en, es, et, fi, fr, ga, hr, hu, it, lt, lv, mt, nl, pl, pt, ro, sk, sl, sv, tr |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (opset 17), artefacto `onnx/model.int8.onnx` (535 MB) |

## Arquitectura y entrenamiento

La arquitectura base es un transformer encoder de tipo XLM-RoBERTa, sobre el cual se añade una cabeza de clasificación multi-etiqueta. El modelo se entrenó específicamente para la política de la librería `border`, que define tres etiquetas de salida: `noise` (ruido), `word_salad` (ensalada de palabras) y `repetition` (repetición). El entrenamiento se realizó con una longitud fija de 96 tokens, lo que implica que cualquier entrada superior a esta longitud debe ser troceada y recombinada por la librería para evitar extrapolaciones en las puntuaciones.

La innovación técnica más destacable es la estrategia de cuantización. En lugar de cuantizar todas las operaciones (el enfoque habitual), el artefacto publicado cuantiza únicamente la tabla de embeddings (operación `Gather`). Según las mediciones del autor sobre 300 textos reales, cuantizar todos los ops reduce el tamaño a 279 MB pero provoca una deriva media del logit de 0.68 y cambia 51 de 300 decisiones, mientras que cuantizar solo la tabla de embeddings mantiene el tamaño en 535 MB, reduce la deriva a 0.0036 y no cambia ninguna decisión. Esto se debe a que XLM-RoBERTa presenta grandes outliers en las activaciones, que degradan la cuantización dinámica per-tensor de los MatMuls.

## Capacidades

- Clasificación de texto en tres etiquetas: `noise`, `word_salad` y `repetition`.
- Soporte multilingüe para 26 idiomas, incluyendo lenguas de la UE y turco.
- Integración nativa con la librería `border` para guardarraíles, devolviendo un veredicto (`allow`, `flag`, `redact`, `block`) junto con un registro de evidencia auditable.
- Ejecución completamente offline: los pesos se cargan una vez y se cachean; no requiere llamadas a servicios externos.
- El registro de evidencia incluye hashes en lugar del texto original, preservando la privacidad.
- Presupuesto de latencia conocido: 225 ms a 87 tokens en un solo hilo de CPU.
- Compatible con `onnxruntime` directamente, aunque el umbral y el troceado deben gestionarse manualmente fuera de la librería.

## Casos de uso

- Filtrado de entradas en chatbots de atención al cliente: el detector puede analizar el mensaje del usuario antes de que llegue al LLM y bloquear o marcar entradas que consistan en ruido, repeticiones o combinaciones de palabras sin coherencia, evitando respuestas absurdas o costes de inferencia innecesarios.
- Protección de prompts en aplicaciones de generación de código: en un IDE o pipeline de CI/CD, se puede integrar `border` para asegurar que los comentarios o descripciones de tareas no contengan texto corrupto que pueda confundir al modelo de código.
- Moderación de contenido generado por usuarios en foros o redes sociales: detectar publicaciones spam o generadas automáticamente que consisten en texto sin sentido, reduciendo la carga de moderación humana.
- Limpieza de datasets para entrenamiento: antes de entrenar un modelo propio, se puede usar este detector para filtrar muestras ruidosas o duplicadas (repetición) en corpus multilingües.
- Auditoría de seguridad en sistemas de IA: al integrarse con `border`, cada decisión de bloqueo o marcado queda registrada con un identificador de evidencia y hashes, permitiendo trazar incidentes de seguridad o abuso sin almacenar el texto original.
- Preprocesado en pipelines de RAG (generación aumentada por recuperación): filtrar consultas de usuario que sean ininteligibles antes de realizar la búsqueda vectorial, mejorando la precisión de los resultados recuperados.

## Benchmarks y rendimiento

El modelo card publica resultados por idioma, evaluados en el split de validación con el umbral calibrado en 0.05. El F1 global es de 0.956 con el umbral calibrado y de 0.954 con el umbral por defecto de 0.5. Los resultados por idioma son los siguientes:

| Idioma | Soporte (n) | Precision | Recall | F1 |
|---|---|---|---|---|
| bg (búlgaro) | 9 | 1.000 | 1.000 | 1.000 |
| el (griego) | 10 | 1.000 | 1.000 | 1.000 |
| en (inglés) | 9 | 1.000 | 1.000 | 1.000 |
| es (español) | 10 | 1.000 | 1.000 | 1.000 |
| fi (finés) | 10 | 1.000 | 1.000 | 1.000 |
| fr (francés) | 11 | 1.000 | 1.000 | 1.000 |
| hu (húngaro) | 11 | 1.000 | 1.000 | 1.000 |
| it (italiano) | 11 | 1.000 | 1.000 | 1.000 |
| lt (lituano) | 10 | 1.000 | 1.000 | 1.000 |
| lv (letón) | 10 | 1.000 | 1.000 | 1.000 |
| nl (neerlandés) | 11 | 1.000 | 1.000 | 1.000 |
| sv (sueco) | 10 | 1.000 | 1.000 | 1.000 |
| pt (portugués) | 12 | 0.923 | 1.000 | 0.960 |
| da (danés) | 11 | 0.917 | 1.000 | 0.957 |
| et (estonio) | 11 | 0.917 | 1.000 | 0.957 |
| sk (eslovaco) | 11 | 0.917 | 1.000 | 0.957 |
| az (azerí) | 10 | 0.909 | 1.000 | 0.952 |
| de (alemán) | 11 | 1.000 | 0.909 | 0.952 |
| hr (croata) | 10 | 0.909 | 1.000 | 0.952 |
| pl (polaco) | 11 | 1.000 | 0.909 | 0.952 |
| tr (turco) | 10 | 0.909 | 1.000 | 0.952 |
| mt (maltés) | 12 | 0.857 | 1.000 | 0.923 |
| ga (irlandés) | 12 | 0.917 | 0.917 | 0.917 |
| ro (rumano) | 11 | 0.846 | 1.000 | 0.917 |
| sl (esloveno) | 11 | 0.909 | 0.909 | 0.909 |
| cs (checo) | 11 | 0.833 | 0.909 | 0.870 |

Los idiomas más débiles son checo (F1 0.870), esloveno (F1 0.909) e irlandés (F1 0.917). El maltés, que no estaba presente en el preentrenamiento del modelo base, obtiene un F1 de 0.923. En cuanto a la cuantización, el artefacto publicado (solo Gather) no cambia ninguna decisión en 300 textos de prueba, mientras que la cuantización completa cambiaría 51 decisiones.

## Requisitos de hardware

- Inferencia en CPU: el modelo está diseñado para ejecutarse en un solo hilo de CPU con un presupuesto de 225 ms para 87 tokens.
- Tamaño del artefacto: 535 MB en disco (ONNX INT8).
- Memoria RAM: suficiente con 1-2 GB libres para cargar el modelo y el tokenizador.
- GPU: no requerida; el modelo es un encoder pequeño y la latencia en CPU es aceptable para guardarraíles.
- Despliegue: se integra mediante `pip install flowx-border` o directamente con `onnxruntime` cargando `onnx/model.int8.onnx` y `tokenizer.json`.
- Compatibilidad: funciona en cualquier plataforma que soporte ONNX Runtime (Python, C++, etc.). No requiere red tras la carga inicial de pesos.

## Comparativa con modelos similares

No disponible. En la información proporcionada no se mencionan modelos comparables de detección de gibberish multilingüe con los que contrastar. La mayoría de detectores de spam o ruido textual se basan en listas negras o en modelos de perplejidad, pero no se aportan datos de comparación directa en la model card.

## Limitaciones y advertencias

- No es un clasificador general de gibberish: está entrenado específicamente para la política de la librería `border` y sus tres etiquetas (`noise`, `word_salad`, `repetition`). Su uso fuera de este contexto puede producir resultados inesperados.
- Umbral de decisión no estándar: el umbral calibrado es 0.05, no 0.5. Usar el valor por defecto de 0.5 puede degradar gravemente el rendimiento (en modelos similares de la familia, el F1 cayó de 0.893 a 0.000).
- Ventana de contexto limitada a 96 tokens: los textos más largos deben trocearse y recombinarse. Hacerlo incorrectamente produce puntuaciones que son extrapolaciones y no reflejan el contenido real.
- Idiomas débiles: checo, esloveno e irlandés presentan F1 inferior a 0.92. El maltés no estaba en el preentrenamiento del modelo base, lo que puede afectar a su robustez en producción.
- Cuantización parcial: solo la tabla de embeddings está cuantizada. Si se intenta cuantizar todo el modelo para ahorrar espacio, se corre el riesgo de cambiar una de cada seis decisiones.
- Sin red neuronal de propósito general: no genera texto ni realiza razonamiento; es exclusivamente un clasificador de entrada para guardarraíles.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/flowxai/gibberish
- Repositorio de la librería `border`: https://github.com/flowx-ai/border
