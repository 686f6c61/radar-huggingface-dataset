# ElucidataInc/polly-ner-gene-disease

## Resumen

El modelo `ElucidataInc/polly-ner-gene-disease` es un sistema de reconocimiento de entidades nombradas (NER) especializado en la detección de enfermedades y proteínas/genes en texto biomédico. Desarrollado por ElucidataInc, se basa en el modelo `microsoft/BiomedNLP-BiomedBERT-base-uncased-abstract-fulltext` (BiomedBERT), un transformer BERT preentrenado sobre literatura biomédica, y se ha ajustado con un corpus privado curado para identificar dos tipos de entidades: `DISEASE` y `GENE_PROTEIN`. El modelo utiliza una codificación BIO determinista y devuelve los spans de caracteres exactos de cada mención, lo que lo hace adecuado para pipelines de procesamiento de lenguaje natural en el dominio biomédico.

Con aproximadamente 108,9 millones de parámetros, es un modelo de tamaño compacto que puede ejecutarse en hardware de gama media. Está diseñado para integrarse fácilmente mediante la librería Transformers o a través del paquete `polly-ner`, que proporciona una API de predicción más conveniente. La licencia MIT permite su uso comercial sin restricciones, aunque los datos de entrenamiento son privados y no se incluyen en el repositorio.

Este modelo resulta relevante para aplicaciones de minería de textos biomédicos, como la extracción de relaciones gen-enfermedad, la anotación de literatura científica o el enriquecimiento de bases de datos clínicas, donde la identificación precisa de entidades es un paso crítico.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BERT-base (BiomedBERT, transformer encoder) |
| Parametros totales | 108.895.493 |
| Parametros activos | No aplicable (modelo denso) |
| Longitud de contexto | No disponible (el modelo base soporta 512 tokens) |
| Tipos de cuantizacion | No disponible (solo safetensors en FP32) |
| Idiomas soportados | No disponible (modelo base entrenado en ingles biomedico) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tuning de `microsoft/BiomedNLP-BiomedBERT-base-uncased-abstract-fulltext`, un transformer BERT-base de 12 capas, 768 dimensiones ocultas y 12 cabezas de atención, preentrenado sobre abstracts y texto completo de artículos biomédicos. Sobre esta base se añadió una capa de clasificación token-level para predecir etiquetas BIO (Begin, Inside, Outside) para las entidades `DISEASE` y `GENE_PROTEIN`. El entrenamiento se realizó durante 10 épocas con un learning rate de 3e-05, batch size de 16 por dispositivo, sin mixed precision y con seed fija 42, sobre un corpus privado curado (`ElucidataInc/curated-ner-corpus-gene-disease`) con particiones de entrenamiento, validación y prueba.

La innovación principal no está en la arquitectura, sino en el pipeline de inferencia: el modelo está pensado para usarse con el paquete `polly-ner`, que convierte las predicciones token-level en spans de caracteres deterministas, evitando la necesidad de post-procesado adicional. No se emplearon técnicas como RLHF o DPO; es un ajuste supervisado estándar.

## Capacidades

- Reconocimiento de entidades nombradas de tipo `DISEASE` y `GENE_PROTEIN` en texto biomédico.
- Salida en formato de spans de caracteres (inicio, fin, etiqueta) mediante Polly NER, o etiquetas BIO nativas de Transformers.
- Compatible con el pipeline `token-classification` de HuggingFace Transformers.
- Soporta integración con la librería `polly-ner` para una API más sencilla.
- No realiza entity linking, normalización, extracción de relaciones ni resolución de abreviaturas.
- Maneja entidades contiguas y no superpuestas; no soporta entidades anidadas.
- El modelo no divide ni trunca automáticamente los textos de entrada; el usuario debe gestionar el chunking.

## Casos de uso

- Minería de literatura biomédica: extraer menciones de genes y enfermedades de abstracts de PubMed para construir bases de datos de asociaciones gen-enfermedad. El modelo puede procesar grandes volúmenes de texto y devolver spans precisos para su posterior análisis.
- Anotación de corpus clínicos: etiquetar automáticamente expedientes electrónicos de salud para identificar diagnósticos y biomarcadores. Su formato de salida en spans de caracteres facilita la integración con herramientas de anotación existentes.
- Enriquecimiento de ontologías: detectar términos de enfermedades y proteínas en documentos técnicos para mapearlos a ontologías como HPO o Gene Ontology, aunque el modelo no realiza el mapeo en sí.
- Sistemas de preguntas y respuestas biomédicas: como paso previo a un sistema de QA, el NER permite localizar las entidades relevantes en la pregunta y el contexto antes de extraer la respuesta.
- Vigilancia bibliográfica automatizada: monitorizar nuevas publicaciones para identificar menciones de genes asociados a enfermedades específicas, útil en farmacovigilancia o investigación traslacional.
- Preprocesado para extracción de relaciones: alimentar a un modelo de relación gen-enfermedad con los spans detectados, reduciendo el espacio de búsqueda y mejorando la precisión del sistema global.

## Benchmarks y rendimiento

La evaluación se basa en exactitud de los spans de caracteres (inicio, fin y etiqueta) y se reportan las métricas Micro F1 y Macro F1 sobre los conjuntos de validación y prueba curados.

| Dataset | Micro F1 | Macro F1 | Registros | Caracteres |
|---|---:|---:|---:|---:|
| validacion | 0,7728 | 0,7740 | 2368 | 351244 |
| prueba curada | 0,7777 | 0,7797 | 3869 | 589987 |

No se han publicado comparaciones con otros modelos en la información disponible. Los valores de F1 en torno a 0,78 indican un rendimiento moderado, típico de tareas NER biomédicas con etiquetado estricto de spans.

## Requisitos de hardware

- VRAM estimada: el modelo tiene ~109 millones de parámetros. En FP32 ocupa aproximadamente 436 MB, por lo que cabe en cualquier GPU con al menos 1 GB de VRAM. Para inferencia con batch pequeño, una GPU de 4 GB es suficiente.
- GPUs recomendadas: cualquier GPU consumer moderna (NVIDIA GTX 1060 o superior, RTX 3060, etc.) puede ejecutar el modelo sin problemas. En CPU también es viable para textos cortos.
- Despliegue: compatible con `pipeline` de Transformers, `vLLM` (aunque no es óptimo para modelos encoder), `Ollama` (si se convierte a formato GGUF, aunque no está disponible), y `TGI`. El paquete `polly-ner` ofrece una interfaz específica.
- Latencia y throughput: no hay datos publicados, pero al ser un BERT-base, la inferencia en GPU es del orden de milisegundos por frase corta. En CPU puede ser de decenas de milisegundos.

## Comparativa con modelos similares

No se dispone de una comparativa directa con otros modelos NER biomédicos en la información proporcionada. Como referencia, modelos como `BioBERT` (base) o `PubMedBERT` tienen arquitecturas similares y tamaños comparables (~110M parámetros), y suelen reportar F1 en tareas NER biomédicas (p.ej. BC5CDR) en rangos de 0,80-0,85, pero no se pueden contrastar directamente sin datos de evaluación comunes.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| ElucidataInc/polly-ner-gene-disease | 108,9M | 512 (base) | MIT | HuggingFace |
| BioBERT-base | ~110M | 512 | Apache 2.0 | HuggingFace |
| PubMedBERT-base | ~110M | 512 | MIT | HuggingFace |

## Limitaciones y advertencias

- Los datos de entrenamiento son privados y no se incluyen en el repositorio, lo que dificulta la reproducibilidad y la auditoría de sesgos.
- El modelo no realiza entity linking, normalización, extracción de relaciones ni resolución de abreviaturas; solo detecta menciones.
- No soporta entidades anidadas ni superpuestas; solo entidades contiguas.
- El texto de entrada no se divide ni trunca automáticamente; el usuario debe gestionar el chunking para respetar el límite de contexto del modelo base (512 tokens).
- Las predicciones pueden ser incompletas o incorrectas; se recomienda revisión humana en aplicaciones de alto riesgo.
- No se ha evaluado el rendimiento en dominios fuera del ámbito biomédico o en idiomas distintos del inglés (aunque el modelo base es multilingüe hasta cierto punto, el ajuste se realizó sobre corpus biomédico en inglés).
- La licencia MIT permite uso comercial, pero es responsabilidad del usuario revisar la licencia y obtener aprobación organizativa antes de su publicación.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/ElucidataInc/polly-ner-gene-disease)
- [Repositorio Polly NER (GitHub)](https://github.com/ElucidataInc/polly-ner) (commit b73b3012e113e58c8f1a7f6426e14fd838527c08)
- [Modelo base: microsoft/BiomedNLP-BiomedBERT-base-uncased-abstract-fulltext](https://huggingface.co/microsoft/BiomedNLP-BiomedBERT-base-uncased-abstract-fulltext)
- [Dataset de entrenamiento (privado): ElucidataInc/curated-ner-corpus-gene-disease](https://huggingface.co/datasets/ElucidataInc/curated-ner-corpus-gene-disease)
