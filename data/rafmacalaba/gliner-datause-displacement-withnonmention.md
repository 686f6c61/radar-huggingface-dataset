# rafmacalaba/gliner-datause-displacement-withnonmention

## Resumen

Este modelo es un fine-tune del modelo `urchade/gliner_large-v2.1` para la extracción de menciones de uso de datos en textos académicos, con una única clase `DATA_MENTION`. Ha sido desarrollado por `rafmacalaba` y entrenado sobre el dataset `rafmacalaba/data-use-mentions-tiered`, una copia revisada de `data-use-mentions` en la que los tramos de tipo T3 (no mención) y basura se tratan como negativos duros desetiquetados. El objetivo es identificar menciones reales de datos que tengan un uso analítico o declarativo (T1 evidencial ∪ T2 declaración), dejando para modelos posteriores la recuperación de la especificidad.

Se trata de un modelo de token-classification basado en la arquitectura GLiNER, que permite reconocer entidades mediante prompts de etiquetas sin necesidad de entrenar un clasificador por cada tipo. El tamaño del repositorio es de 1.8 GB, lo que sugiere un modelo de tipo large, aunque no se especifica el número de parámetros ni la longitud de contexto. La relevancia actual del modelo radica en su capacidad para filtrar menciones de uso de datos en documentos de investigación económica, un paso previo para el análisis automatizado de políticas de datos y privacidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GLiNER (fine-tune de `urchade/gliner_large-v2.1`) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | PyTorch (no se especifica safetensors o bin) |

## Arquitectura y entrenamiento

El modelo se basa en GLiNER, una arquitectura de reconocimiento de entidades basada en transformer que recibe una lista de etiquetas como prompts y localiza los tramos de texto que coinciden con ellas. En este caso, la lista de etiquetas contiene únicamente `DATA_MENTION`. El fine-tune parte de `urchade/gliner_large-v2.1` y se entrena sobre `rafmacalaba/datause-displacement-reviewed` con la configuración `gliner_reviewed_nm`, que incorpora los negativos duros mencionados anteriormente.

El entrenamiento se realizó durante 5 épocas con una tasa de aprendizaje de 5e-06, tamaño de lote de 16 y precisión bf16. La selección del checkpoint se hizo mediante un barrido posterior de los checkpoints de cada época, utilizando la métrica val span-F0.5 y descartando explícitamente la pérdida de evaluación. El dataset de entrenamiento está compuesto por ejemplos en los que los tramos de no mención se mantienen en el texto pero se elimina la etiqueta, de modo que el modelo aprende a no generar predicciones para ellos.

## Capacidades

- Extracción de menciones de uso de datos con la clase única `DATA_MENTION` en textos académicos y de investigación.
- Reconocimiento de entidades basado en prompts de etiquetas, sin necesidad de ajustar el clasificador para cada tipo de entidad.
- Manejo de negativos duros: el modelo está entrenado para distinguir entre menciones reales (T1 evidencial y T2 declaración) y tramos de texto que no son menciones (T3 y basura).
- No incluye capacidades de generación de texto, tool calling, agentes ni razonamiento multi-paso, ya que es un modelo de token-classification.
- Soporte multilingüe: no disponible.

## Casos de uso

- Análisis de documentos de investigación económica: el modelo puede identificar automáticamente qué menciones de datos (encuestas, censos, registros, datasets) aparecen en un paper, facilitando el estudio de las prácticas de uso de datos en la literatura.
- Extracción de información para revisión sistemática: en la creación de bases de datos de evidencia, el modelo filtra las menciones que realmente describen un uso de datos, reduciendo el ruido en la fase de cribado.
- Clasificación de políticas de privacidad: el modelo puede localizar fragmentos en los que se menciona el uso de datos personales, sirviendo de entrada para un pipeline de análisis de cumplimiento normativo.
- Minería de texto en ciencias sociales: investigadores que analizan declaraciones sobre el uso de datos en corpus de entrevistas, artículos o informes pueden utilizar el modelo para segmentar automáticamente las secciones relevantes.
- Enriquecimiento de metadatos en repositorios de datos: al detectar menciones de datasets en artículos, se puede asociar automáticamente cada paper con los recursos de datos que menciona.
- Preprocesamiento para modelos de SFT multitarea: el modelo actúa como extractor de límites de mención, y la especificidad se recupera posteriormente mediante un modelo de fine-tuning multitarea, lo que permite descomponer el problema en tareas más simples.

## Benchmarks y rendimiento

Los resultados presentados corresponden al conjunto de evaluación (tiered holdout), donde el gold está compuesto por tramos T1∪T2, y los falsos positivos que coinciden con un tramo T3 o basura se cuentan como fugas T3 (menor es mejor). El emparejamiento es agnóstico de etiquetas con jaccard ≥ 0.5.

| Umbral | TP | FP | FN | Precision | Recall | F0.5 | F1 | T3 leak | T3 leak % |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 0.10 | 254 | 440 | 66 | 0.3660 | 0.7937 | 0.4102 | 0.5010 | 47 | 10.7% |
| 0.20 | 250 | 351 | 70 | 0.4160 | 0.7812 | 0.4589 | 0.5429 | 45 | 12.8% |
| 0.30 | 242 | 289 | 78 | 0.4557 | 0.7562 | 0.4951 | 0.5687 | 44 | 15.2% |
| 0.40 | 233 | 226 | 87 | 0.5076 | 0.7281 | 0.5404 | 0.5982 | 40 | 17.7% |
| 0.50 | 217 | 177 | 103 | 0.5508 | 0.6781 | 0.5723 | 0.6078 | 34 | 19.2% |
| 0.60 | 177 | 89 | 143 | 0.6654 | 0.5531 | 0.6395 | 0.6041 | 23 | 25.8% |
| 0.70 | 125 | 39 | 195 | 0.7622 | 0.3906 | 0.6404 | 0.5165 | 16 | 41.0% |

El mejor F0.5 es 0.6404 con umbral 0.7, mientras que el mejor F1 es 0.6078 con umbral 0.5.

## Requisitos de hardware

- El repositorio tiene un tamaño de 1.8 GB, por lo que se estima un requisito mínimo de 4 GB de VRAM para inferencia en FP16 sin cuantización.
- No se dispone de información específica sobre la VRAM necesaria para distintas cuantizaciones.
- Al ser un modelo de token-classification, puede ejecutarse en GPUs de consumo como RTX 3060 o superiores, aunque no hay datos concretos de rendimiento.
- El despliegue se realiza mediante la librería `gliner` de Python, ya que es el framework utilizado en el entrenamiento y la inferencia del modelo.
- No se han publicado datos de latencia ni throughput.

## Comparativa con modelos similares

No se han publicado resultados de benchmarks en la información disponible para comparar con modelos alternativos. No obstante, existen versiones previas del mismo autor con el mismo modelo base:

| Modelo | Clases | Tratamiento de no menciones | Licencia | Disponibilidad |
| --- | --- | --- | --- | --- |
| `rafmacalaba/gliner-datause-displacement-withnonmention` | DATA_MENTION | Negativos duros desetiquetados | Apache-2.0 | HuggingFace |
| `rafmacalaba/gliner_datause` | no disponible | no disponible | Apache-2.0 | HuggingFace |
| `rafmacalaba/gliner_datause_v0` | no disponible | no disponible | Apache-2.0 | HuggingFace |

Los datos de parámetros, contexto y rendimiento comparativo no están disponibles.

## Limitaciones y advertencias

- El modelo está especializado en un dominio concreto (menciones de uso de datos en textos académicos), por lo que su capacidad de generalización a otros dominios o tipos de entidades es limitada.
- La tabla de evaluación muestra que el recall cae significativamente a umbrales altos (0.3906 con umbral 0.7), lo que implica que muchas menciones reales pueden pasar desapercibidas si se prioriza la precisión.
- Las fugas T3 aumentan de forma notable a medida que sube el umbral, alcanzando el 41% en el umbral 0.7, lo que indica que los falsos positivos tienden a concentrarse en tramos de no mención.
- No se ha especificado el idioma de los datos de entrenamiento, aunque el corpus parece estar compuesto por documentos de investigación económica en inglés. No se garantiza el rendimiento en otros idiomas.
- La licencia Apache-2.0 permite el uso comercial, pero el modelo puede heredar sesgos o limitaciones del dataset de entrenamiento.
- No se dispone de información sobre el comportamiento del modelo con textos fuera del dominio de la investigación económica ni sobre su robustez frente a variaciones de estilo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/rafmacalaba/gliner-datause-displacement-withnonmention
- Dataset de entrenamiento: https://huggingface.co/datasets/rafmacalaba/data-use-mentions-tiered
- Modelo base: https://huggingface.co/urchade/gliner_large-v2.1
- Versión previa `gliner_datause`: https://huggingface.co/rafmacalaba/gliner_datause
- Versión previa `gliner_datause_v0`: https://huggingface.co/rafmacalaba/gliner_datause_v0
