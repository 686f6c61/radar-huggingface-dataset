# HimuX/pubmed-20k-bert

## Resumen

El modelo `HimuX/pubmed-20k-bert` es un clasificador de texto basado en `google-bert/bert-base-uncased`, ajustado (fine-tuning) para la clasificación secuencial de oraciones en resúmenes de ensayos clínicos aleatorizados (RCT). Desarrollado por el usuario HimuX, el modelo asigna a cada oración de un abstract una de cinco etiquetas semánticas: *background*, *objective*, *method*, *result* o *conclusion*. Esta tarea, conocida como *sequential sentence classification*, es fundamental para la extracción estructurada de información en el dominio biomédico.

El modelo parte de la arquitectura BERT-base (110M parámetros, aunque el checkpoint concreto tiene 109.486.085 parámetros) y se entrena sobre el dataset `pietrolesci/pubmed-200k-rct`, una versión del corpus PubMed 20k RCT. Su relevancia radica en ofrecer un punto de partida listo para usar en pipelines de procesamiento de literatura médica, permitiendo identificar rápidamente la función de cada frase en un resumen clínico. La licencia `ms-pl` (Microsoft Public License) permite uso comercial y modificación, lo que facilita su integración en entornos productivos.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (BERT-base, 12 capas, 12 cabezas de atención) |
| Parametros totales | 109.486.085 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 512 tokens |
| Tipos de cuantizacion | no disponible (pesos en safetensors, sin cuantizaciones publicadas) |
| Idiomas soportados | inglés (en) |
| Licencia | ms-pl (Microsoft Public License) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tuning de BERT-base-uncased, una arquitectura transformer encoder bidireccional con 12 capas, 768 dimensiones ocultas y 12 cabezas de atención. La capa de clasificación se añade sobre el token `[CLS]` para producir una distribución sobre las cinco etiquetas de sección. El entrenamiento se realiza sobre el dataset `pietrolesci/pubmed-200k-rct`, que contiene aproximadamente 20.000 resúmenes de ensayos clínicos aleatorizados, con cada oración etiquetada según su rol. No se dispone de información detallada sobre el número de épocas, tasa de aprendizaje o técnicas de regularización empleadas. Al tratarse de un fine-tuning de un modelo preentrenado en inglés general, no se aplicaron técnicas como RLHF o DPO; el ajuste es supervisado sobre la tarea de clasificación de oraciones.

## Capacidades

- Clasificación de oraciones en resúmenes de ensayos clínicos: asigna una de cinco etiquetas (*background*, *objective*, *method*, *result*, *conclusion*) a cada frase.
- Procesamiento de texto biomédico en inglés, con vocabulario generalista de BERT (no especializado en dominio médico, aunque el fine-tuning lo adapta parcialmente).
- Inferencia de clasificación de texto estándar mediante la API de `transformers` (pipeline `text-classification`).
- No soporta generación de texto, tool calling, agentes ni razonamiento multi-paso; es un modelo puramente discriminativo.
- No tiene capacidades multimodales (solo texto).

## Casos de uso

- **Extracción estructurada de abstracts médicos**: dado un resumen de un ensayo clínico, el modelo identifica automáticamente qué oraciones describen el objetivo, los métodos, los resultados y las conclusiones, facilitando la creación de bases de datos estructuradas para revisiones sistemáticas.
- **Filtrado y priorización de literatura**: en herramientas de búsqueda bibliográfica, el modelo puede clasificar oraciones para resaltar los resultados o conclusiones, permitiendo a los investigadores escanear rápidamente múltiples abstracts.
- **Asistencia a la redacción científica**: al etiquetar las secciones de un borrador, el modelo ayuda a los autores a verificar que su resumen sigue la estructura IMRaD (Introducción, Métodos, Resultados, Discusión) típica de los ensayos clínicos.
- **Preprocesamiento para sistemas de pregunta-respuesta biomédica**: las oraciones clasificadas pueden alimentar pipelines de *retrieval-augmented generation* (RAG) para responder preguntas sobre evidencia clínica, restringiendo la búsqueda a secciones relevantes (p. ej., solo resultados).
- **Análisis de tendencias en investigación clínica**: al clasificar grandes volúmenes de abstracts, se pueden analizar patrones en los métodos o resultados reportados a lo largo del tiempo, útil para estudios bibliométricos.
- **Integración en gestores de referencias**: herramientas como Zotero o Mendeley podrían usar el modelo para etiquetar automáticamente los abstracts importados, mejorando la organización de bibliotecas personales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks específicos para este modelo en la información disponible. La model card no incluye métricas de accuracy o F1. La búsqueda web menciona un F1 de 0,9401 en PubMed 20k RCT para un método basado en BERT, pero no se puede atribuir a este checkpoint concreto. Por tanto, no se presentan tablas comparativas.

## Requisitos de hardware

- **VRAM estimada para inferencia**: el modelo tiene ~109M parámetros, lo que en FP32 ocupa ~438 MB. En FP16 (~219 MB) o con cuantización INT8 (~110 MB) cabe en cualquier GPU moderna con al menos 2 GB de VRAM.
- **GPU recomendadas**: cualquier GPU con ≥4 GB de VRAM (p. ej., NVIDIA GTX 1650, RTX 2060, RTX 3050) es suficiente. Para procesamiento por lotes grande, una RTX 3090 o A10 sería cómoda.
- **Compatibilidad con GPU de consumo**: sí, cabe en GPUs de consumo desde hace varios años; incluso puede ejecutarse en CPU con razonable latencia para frases cortas.
- **Opciones de despliegue**: compatible con `transformers` (PyTorch), `text-embeddings-inference` (mencionado en los tags), y puede exportarse a ONNX o TensorRT. También es posible usar `vLLM` para clasificación, aunque no es su caso de uso principal.
- **Latencia y throughput estimados**: en una GPU moderna (p. ej., RTX 3090), la inferencia de una oración de ~50 tokens tarda <10 ms; en CPU (8 núcleos) puede rondar los 50-100 ms por oración. No se dispone de mediciones oficiales.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| HimuX/pubmed-20k-bert | 109M | 512 | Clasificación de oraciones en abstracts RCT | ms-pl | HuggingFace |
| NeuML/pubmedbert-base-embeddings | 110M | 512 | Embeddings de texto biomédico | MIT | HuggingFace |
| ml4pubmed/BiomedNLP-PubMedBERT-base-uncased-abstract-fulltext | 110M | 512 | Clasificación de texto biomédico (fine-tuning) | MIT | HuggingFace |

PubMedBERT (base) está preentrenado desde cero en texto biomédico, por lo que suele superar a BERT-base en tareas del dominio. Sin embargo, el modelo de HimuX está específicamente ajustado para la clasificación secuencial de oraciones en RCT, lo que puede dar ventaja en esa tarea concreta. No se dispone de comparativas directas de rendimiento entre estos modelos.

## Limitaciones y advertencias

- **Sesgos conocidos**: al estar entrenado sobre abstracts de ensayos clínicos en inglés, puede tener un sesgo hacia la terminología y estructura de la literatura anglosajona; no se ha evaluado su comportamiento en otros idiomas.
- **Riesgo de alucinación**: al ser un clasificador, no genera texto, por lo que el riesgo de alucinación es nulo; el riesgo principal es la clasificación errónea de oraciones ambiguas o fuera de dominio.
- **Limitaciones de contexto**: la ventana de 512 tokens limita el procesamiento a abstracts completos (que suelen caber), pero no permite manejar documentos largos sin truncamiento.
- **Restricciones de licencia**: la licencia ms-pl permite uso comercial, pero exige incluir el aviso de copyright y la renuncia de garantías en las redistribuciones.
- **Caveats para producción**: el modelo no está adaptado a dominios médicos específicos (p. ej., pediatría, oncología) y puede degradarse con textos que se alejen del formato de abstracts RCT. Se recomienda validar con datos propios antes de desplegarlo.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/HimuX/pubmed-20k-bert)
- [Dataset pietrolesci/pubmed-200k-rct](https://huggingface.co/datasets/pietrolesci/pubmed-200k-rct)
- [Paper de referencia: PubMed 200k RCT: a Dataset for Sequential Sentence Classification in Medical Abstracts](https://pubmed.ncbi.nlm.nih.gov/37927376/) (resultado de búsqueda web, no específico del modelo)
- [Repositorio GitHub con ejemplo de uso del dataset](https://github.com/gurpreetsingh1111/PubMed_20k_RCT)
- [Repositorio GitHub sobre clasificación secuencial de oraciones](https://github.com/akshay-kamath/Sequential-sentence-classification)
