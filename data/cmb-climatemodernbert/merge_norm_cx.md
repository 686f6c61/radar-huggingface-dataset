# CMB-ClimateModernBERT/Merge_Norm_CX

## Resumen

ClimateModernBERT es una familia de codificadores de dominio climático obtenidos mediante continued pretraining de ModernBERT-Base sobre un corpus especializado de 6.42 mil millones de tokens. El modelo `Merge_Norm_CX` es una de las variantes de la familia, concretamente el resultado de fusionar mediante model soup (mezcla lineal de pesos) tres checkpoints entrenados en distintos subcorpus: académico (𝒜), web climática (ℱ) y sintético (𝒮). El método de fusión asigna pesos inversos a la norma L2 de cada task-vector, lo que según el artículo permite obtener el mejor rendimiento de la fase 1 sin necesidad de la especialización por learning-rate decay.

Con 150 millones de parámetros y una ventana de contexto de 8.192 tokens, este modelo está diseñado para tareas de procesamiento de lenguaje natural climático: clasificación de textos, etiquetado multi-etiqueta, recuperación de información y análisis de sentimiento sobre divulgaciones corporativas, documentos de política, literatura científica y noticias climáticas. El modelo alcanza una media de F1 de 75,9 en nueve benchmarks climáticos, superando al ModernBERT-Base (73,5) y a ClimateBERT (72,1) bajo el mismo protocolo de evaluación. Es un modelo de tipo masked language model (fill-mask), no un sistema generativo ni de instrucciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ModernBERT (encoder transformer, 22 capas, hidden 768, 12 cabezas) |
| Parametros totales | 149.655.232 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 8.192 tokens |
| Tipos de cuantizacion | no disponible (solo se distribuye en safetensors de precisión completa) |
| Idiomas soportados | en (inglés) |
| Licencia | no disponible |
| Formato de pesos | safetensors (transformers) |

## Arquitectura y entrenamiento

El modelo parte de ModernBERT-Base, un encoder transformer optimizado para eficiencia con 22 capas, dimensión oculta de 768, 12 cabezas de atención y un vocabulario de 50.368 tokens. El entrenamiento se realizó en dos fases siguiendo la receta de ModernBERT: una primera fase de extensión de contexto (3 épocas, LR constante 3e-4, batch global 576, longitud de secuencia 8.192, masking MLM al 30%, optimizador StableAdamW en BF16) y una segunda fase de especialización con learning-rate decay (no aplicada en este checkpoint concreto, que corresponde solo a la fase 1). El corpus de entrenamiento combina tres fuentes: artículos académicos revisados por pares (~1,28 mil millones de tokens), textos web filtrados por relevancia climática con un clasificador FastText sobre FineWeb-Edu (~5 mil millones de tokens) y datos sintéticos generados por LLM (~0,14 mil millones de tokens). La fusión se realizó con mergekit mediante una combinación lineal de los pesos de los tres checkpoints, ponderada por la inversa de la norma L2 de sus task-vectors. Los textos académicos no se redistribuyen por restricciones de licencia; solo se publican los pipelines de procesamiento.

## Capacidades

- Codificación contextual de texto climático: genera representaciones densas de 768 dimensiones útiles para tareas posteriores de clasificación o recuperación.
- Fill-mask: completa palabras enmascaradas en frases relacionadas con clima, emisiones, políticas y energía.
- Fine-tuning para clasificación de secuencias: compatible con `AutoModelForSequenceClassification`, permite adaptarse a tareas de detección de sentimiento, detección de compromisos, etc.
- Etiquetado multi-etiqueta y multi-clase: adecuado para taxonomías de divulgación climática (p. ej., TCFD, Net Zero).
- Recuperación de información: las representaciones pueden usarse para búsqueda semántica en corpus de literatura científica y documentos corporativos.
- Soporte de contexto largo: ventana de 8.192 tokens, suficiente para párrafos extensos y documentos de varias páginas.
- No soporta tool calling, generación de texto libre ni razonamiento multi-paso: es un modelo encoder puro.

## Casos de uso

- Clasificación de divulgaciones corporativas: el modelo puede fine-tuning para identificar si un informe anual menciona objetivos de reducción de emisiones (Scope 1, 2 o 3) y clasificarlos según marcos como TCFD o Net Zero.
- Detección de compromisos climáticos en documentos de política: permite extraer frases que indican compromisos concretos (p. ej., "reducir un 12% para 2030") y etiquetarlas automáticamente.
- Análisis de sentimiento climático en noticias y redes sociales: con fine-tuning sobre datos etiquetados, el modelo puede clasificar el tono (positivo, negativo, neutral) de textos sobre eventos climáticos.
- Recuperación semántica en literatura científica: dado un query sobre "impacto de aerosoles en precipitación", el modelo puede codificar documentos y devolver los más relevantes mediante similitud coseno.
- Etiquetado multi-etiqueta de artículos académicos: asignar categorías temáticas (mitigación, adaptación, economía energética) a abstracts de papers.
- Monitorización de informes de sostenibilidad: automatizar la extracción de métricas y compromisos en informes ESG de empresas, reduciendo el trabajo manual de analistas.

## Benchmarks y rendimiento

El modelo reporta una media de F1 de 75,9 en nueve benchmarks climáticos (Climate Detection, Climate Specificity, Commitments & Actions, Climate Sentiment, Net Zero & Reduction, TCFD Recommendations, WFB Nature, WXImpactBench y ClimRetrieve). Las puntuaciones se obtuvieron con tres semillas de fine-tuning bajo una configuración de hiperparámetros compartida (LR 4e-5, batch efectivo 64, weight decay 0,01, hasta 10 épocas con early stopping). La comparativa con las referencias del artículo es la siguiente:

| Modelo | F1 media (9 benchmarks) |
|---|---|
| ClimateModernBERT Merge_Norm_CX | 75,9 |
| ModernBERT-Base (stable-phase) | 73,5 |
| ClimateBERT | 72,1 |

No se dispone de resultados desglosados por benchmark en la información proporcionada.

## Requisitos de hardware

- Inferencia: al tratarse de un modelo de 149 millones de parámetros, requiere aproximadamente 0,6 GB de VRAM en FP32 y unos 0,3 GB en BF16. Cabe holgadamente en cualquier GPU consumer (GTX 1080 Ti, RTX 2060 o superior).
- Fine-tuning: con batch de 64 y secuencias de 8.192 tokens, se recomienda al menos 16 GB de VRAM (RTX 4090, A5000) o usar gradiente acumulado y secuencias más cortas.
- Despliegue: compatible con la librería `transformers` desde la versión 4.48 (sin `trust_remote_code`). Puede servirse con Hugging Face Inference Endpoints, o mediante frameworks como vLLM o TGI para tareas de embedding (aunque no es el uso típico para encoders).
- Entrenamiento: el continued pretraining se realizó con 4× NVIDIA A100 y MosaicML Composer, pero el fine-tuning downstream puede hacerse con una única GPU de gama alta.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | F1 media climática | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ClimateModernBERT Merge_Norm_CX | 150M | 8.192 | 75,9 | no disponible | HuggingFace |
| ModernBERT-Base | 150M | 8.192 | 73,5 | Apache 2.0 | HuggingFace |
| ClimateBERT (RoBERTa-base) | 125M | 512 | 72,1 | MIT | HuggingFace |

El modelo supera a sus dos alternativas principales en los benchmarks climáticos, manteniendo el mismo tamaño y ventana de contexto que ModernBERT-Base. La principal ventaja es su especialización en dominio climático, aunque su licencia no está especificada, lo que puede limitar su uso comercial.

## Limitaciones y advertencias

- Modelo exclusivamente en inglés: no soporta otros idiomas.
- Es un masked language model, no un sistema de instrucciones ni generativo; no produce texto coherente por sí mismo.
- Los benchmarks disponibles se centran en nivel de frase o pasaje, por lo que la capacidad de contexto largo (8.192 tokens) no está completamente explotada en la evaluación reportada.
- Los datos sintéticos tienen efectos dependientes de la tarea: mejoran tareas basadas en taxonomías pero degradan tareas que requieren comprensión fina del discurso y de compromisos.
- No hay garantías factuales sobre ciencia climática: las predicciones del modelo no son verificadas y pueden contener alucinaciones (aunque al ser encoder, el riesgo es menor que en modelos generativos).
- La licencia no está especificada en la model card, lo que genera incertidumbre sobre su uso comercial.
- El artículo que describe el modelo está en revisión y no tiene DOI ni arXiv, por lo que la reproducibilidad completa depende del acceso al preprint.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/CMB-ClimateModernBERT/Merge_Norm_CX
- Repositorio original (pesos idénticos): https://huggingface.co/sraj/Merge_Linear_NormBalanced_CX_only
- Colección de la familia ClimateModernBERT: https://huggingface.co/collections/sraj/climatemodernbert
- Web del proyecto: https://michaelyya.github.io/ClimateModernBERT/
- Checkpoints fusionados: [A_CX](https://huggingface.co/CMB-ClimateModernBERT/A_CX), [F_CX](https://huggingface.co/CMB-ClimateModernBERT/F_CX), [S_CX](https://huggingface.co/CMB-ClimateModernBERT/S_CX)
- Modelo recomendado para uso general (con LRD): [Merge_Soup_LRD](https://huggingface.co/CMB-ClimateModernBERT/Merge_Soup_LRD)
