# DT4H/CardioBERTa.it_translations_only

## Resumen

`DT4H/CardioBERTa.it_translations_only` es un codificador de terminología biomédica en italiano, especializado en normalización de conceptos clínicos y entity linking. El modelo se inicializa desde `DT4H/CardioBERTa.it`, un encoder de la familia CardioBERTa desarrollado por el proyecto europeo DataTools4Heart (DT4H), y se ajusta mediante aprendizaje métrico supervisado por conceptos UMLS (CUI-supervised metric learning) sobre pares de sinónimos terminológicos.

La relevancia de este modelo reside en su capacidad para mapear términos clínicos en italiano a conceptos UMLS normalizados, una tarea crítica en pipelines de NLP clínico para estandarizar historiales y registros cardiovasculares. Su arquitectura es un transformer BERT de 109,9 millones de parámetros, con una ventana de contexto máxima de 25 tokens durante el entrenamiento, lo que lo orienta a términos y frases cortas, no a documentos largos. Forma parte de un esfuerzo más amplio del proyecto DT4H para crear una suite multilingüe de modelos de lenguaje pequeños para el dominio de la cardiología.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder (BERT) |
| Parámetros totales | 109.927.680 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 25 tokens (máximo de entrenamiento) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | Italiano (`it`) |
| Licencia | no disponible |
| Formato de pesos | Safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura BERT de tipo encoder, con 109,9 millones de parámetros, y se inicializa desde `DT4H/CardioBERTa.it`, que a su vez fue adaptado al dominio de la cardiología mediante entrenamiento continuado con Masked Language Modeling (MLM) sobre corpus biomédicos y cardiológicos monolingües en italiano. La familia CardioBERTa cubre siete idiomas europeos (checo, neerlandés, inglés, italiano, rumano, español y sueco).

El entrenamiento de este modelo específico utiliza un enfoque de aprendizaje métrico con pérdida Multi-Similarity Loss. Se emplean 69.631 tripletas anotadas con conceptos UMLS (CUIs), que abarcan 69.631 conceptos y 136.720 términos normalizados únicos, con una media de 2 términos por concepto. La estrategia de recolección de tripletas es `translations_only` con estrategia `synonyms`, es decir, solo se usan pares de sinónimos de la terminología UMLS, sin relaciones jerárquicas. El pool de embeddings es la salida del token CLS, con un margen de minería de 0,2, un batch size de 256, una tasa de aprendizaje de 2e-5 y una sola época. La terminología de entrenamiento no se distribuye con el repositorio por restricciones de licencia de UMLS.

## Capacidades

- Normalización de conceptos clínicos: asigna términos clínicos en italiano a conceptos UMLS normalizados (CUIs).
- Entity linking: conecta menciones de entidades clínicas en texto con sus conceptos canónicos en terminologías biomédicas.
- Recuperación de candidatos biomédicos: genera embeddings de términos que permiten recuperar conceptos similares por similitud coseno.
- Aprendizaje métrico: optimizado para producir representaciones vectoriales donde los sinónimos están cercanos entre sí.
- Funcionamiento como extractor de características: integrable en pipelines de NLP clínico como etapa de normalización posterior a la extracción de entidades.
- Sin capacidad de generación de texto: es un modelo encoder, no un modelo generativo.

## Casos de uso

- **Normalización de entidades clínicas en informes de cardiología**: el modelo puede tomar entidades extraídas por un sistema de reconocimiento de entidades (NER) y normalizarlas a conceptos UMLS, facilitando la estandarización de informes de cardiología en italiano.
- **Recuperación de información biomédica**: permite buscar términos clínicos en una base de datos de conceptos UMLS mediante similitud de embeddings, útil para sistemas de búsqueda semántica en historiales clínicos.
- **Deduplicación de terminología**: ayuda a identificar términos que se refieren al mismo concepto clínico en diferentes documentos o sistemas, reduciendo la variabilidad terminológica.
- **Análisis de cohortes de pacientes**: al normalizar los términos de los registros, permite agrupar pacientes con condiciones clínicas equivalentes, incluso si los términos utilizados difieren.
- **Análisis de ensayos clínicos**: para mapear los criterios de inclusión o exclusión de ensayos a conceptos UMLS, facilitando la comparación y el metanálisis entre estudios.
- **Integración en pipelines de NLP clínico**: se puede integrar como un componente de postprocesado tras un NER para enriquecer los datos extraídos con conceptos estandarizados, habilitando análisis posteriores a nivel de concepto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,4 GB en FP32 (109,9 millones de parámetros × 4 bytes), por lo que es viable en CPU sin GPU.
- GPU recomendada: cualquier GPU con al menos 2 GB de VRAM, incluyendo RTX 2060, GTX 1660, o incluso hardware integrado moderno.
- Cabe en GPU de consumo: sí, se puede ejecutar en tarjetas de gama de entrada.
- Opciones de despliegue: compatible con la librería `transformers` de HuggingFace, se puede servir con `text-embeddings-inference` (TEI), también es compatible con endpoints de HuggingFace Inference Endpoints.
- Latencia y rendimiento: al ser un modelo de 109M parámetros y con longitud de contexto corta (25 tokens), la inferencia es muy rápida, con latencias de milisegundos en GPU y de decenas de milisegundos en CPU.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Entrenamiento | Licencia |
|---|---|---|---|---|
| `DT4H/CardioBERTa.it_translations_only` | 109,9M | 25 tokens | MLM + metric learning sobre UMLS | no disponible |
| `DT4H/CardioBERTa.it` | 109,9M | no disponible | MLM en cardiología italiana | no disponible |
| `BioBERT` (base) | 110M | 512 tokens | MLM en textos biomédicos | Apache 2.0 |
| `ClinicalBERT` | 110M | 512 tokens | MLM en notas clínicas | no disponible |

El modelo se diferencia de BioBERT y ClinicalBERT en que está especializado en la normalización de conceptos UMLS, mientras que los otros dos son modelos generalistas para representaciones de texto biomédico. Su ventaja es que produce embeddings optimizados para la similitud de conceptos, pero su limitación es que no soporta contextos largos (máximo 25 tokens) y solo cubre el idioma italiano.

## Limitaciones y advertencias

- **No apto para decisiones clínicas**: el modelo card lo indica explícitamente; no debe usarse para diagnósticos o tratamientos directos.
- **Contexto limitado**: con un máximo de 25 tokens, no es adecuado para procesar frases largas o documentos; se debe truncar o dividir el texto antes de la inferencia.
- **Idioma restringido**: solo cubre italiano; no es aplicable a otros idiomas sin reentrenamiento.
- **Dependencia de UMLS**: la terminología de entrenamiento no se distribuye por licencia UMLS; esto limita la reproducibilidad del entrenamiento, aunque el modelo en sí es funcional.
- **Riesgo de alucinación**: aunque es un encoder y no genera texto, las embeddings pueden producir falsos positivos en la recuperación de conceptos si los términos son muy similares en forma pero no en significado.
- **Sin datos de rendimiento**: no se han publicado benchmarks, por lo que no se puede comparar su rendimiento cuantitativo con otros modelos.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/DT4H/CardioBERTa.it_translations_only)
- [Modelo base CardioBERTa.it](https://huggingface.co/DT4H/CardioBERTa.it)
- [CardioBERTa.en (variante inglesa)](https://huggingface.co/DT4H/CardioBERTa.en)
- [Organización DT4H en HuggingFace](https://huggingface.co/datasets/DT4H/)
- [Proyecto DataTools4Heart en GitHub](https://github.com/DataTools4Heart/)
- [Web oficial de DataTools4Heart](https://www.datatools4heart.eu/)
- [CardioNER.nl (proyecto relacionado)](https://github.com/UPOD-datascience/MedNER.nl/tree/main/)
