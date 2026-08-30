# CMB-ClimateModernBERT/A_CX_LRD

## Resumen

ClimateModernBERT es una familia de encoders de dominio climático obtenidos mediante continued pretraining de ModernBERT-Base sobre un corpus especializado de 6,42 mil millones de tokens. El checkpoint `A_CX_LRD` corresponde al componente académico (notación θ{𝒜} en el paper), entrenado exclusivamente con texto académico y científico del ámbito climático. El modelo está desarrollado por el equipo CMB-ClimateModernBERT y se publica como parte de un proyecto de investigación sobre composición de corpus para adaptación de dominio.

El modelo resuelve el problema de representar texto climático de forma especializada, superando al baseline generalista ModernBERT-Base en nueve benchmarks de PLN climático (74,4 F1 promedio frente a 73,5). Su relevancia actual radica en la creciente demanda de sistemas de análisis automático de informes corporativos, políticas climáticas y literatura científica, donde los modelos generalistas pierden precisión por falta de vocabulario y conocimiento específico del dominio. La arquitectura es un encoder transformer de 149,6 millones de parámetros con 22 capas, contexto de 8.192 tokens y vocabuario de 50.368 tokens, basado en ModernBERT-Base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ModernBERT-Base (encoder transformer, 22 capas, hidden 768, 12 cabezas) |
| Parametros totales | 149.655.232 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 8.192 tokens |
| Tipos de cuantizacion | no disponible (pesos en BF16/FP32, conversibles a otras precisiones) |
| Idiomas soportados | en (ingles) |
| Licencia | no disponible (sin licencia declarada en el repositorio; el modelo base ModernBERT-Base tiene su propia licencia Apache 2.0) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de ModernBERT-Base, un encoder transformer de 22 capas con atención clásica y tokenizador de 50.368 tokens. El entrenamiento se realizó en dos fases siguiendo la receta de continued pretraining de ModernBERT: una primera fase de extensión de contexto con 3 épocas, LR constante 3e-4, batch global 576, secuencias de 8.192 tokens y masking MLM del 30%; y una segunda fase de especialización con decaimiento de LR según `1 − √t` desde 3e-4 hasta un factor final de 1e-3, también durante 3 épocas. Se usó StableAdamW en BF16 sobre 4 GPUs NVIDIA A100 con MosaicML Composer.

Los datos de entrenamiento provienen del corpus académico 𝒜 (~1,28B tokens), compuesto por artículos de revistas revisadas por pares en ciencia climática, sistemas terrestres y economía energética; el archivo ClimateNews 2000–2022; preprints de arXiv sobre clima; y manuales climáticos. El texto académico original no se redistribuye por restricciones de licencia; solo se liberan los pipelines de procesamiento. El checkpoint se publica como MLM para fill-mask, no como modelo generativo.

## Capacidades

- Representación contextual de texto climático académico, incluyendo terminología especializada de ciencia del clima, sistemas terrestres y economía energética.
- Codificación de pasajes largos de hasta 8.192 tokens, adecuada para documentos completos o secciones extensas.
- Fine-tuning para clasificación de secuencias (secuencia completa o por token) mediante `AutoModelForSequenceClassification`.
- Soporte de retrieval y búsqueda semántica sobre corpus climáticos, con embeddings densos de 768 dimensiones.
- Capacidad multilingüe: no disponible (solo inglés).
- No es un modelo de instrucciones ni de generación; no admite tool calling, agentes ni razonamiento multi-paso.
- No tiene capacidades de visión ni audio.

## Casos de uso

- Análisis de informes corporativos de sostenibilidad: el modelo puede fine-tunearse para detectar compromisos de reducción de emisiones, metas net-zero y acciones concretas en informes ESG, gracias a su vocabulario especializado y contexto largo para procesar secciones completas.
- Clasificación de literatura científica climática: permite etiquetar artículos académicos según temática (mitigación, adaptación, economía energética) con mayor precisión que un modelo generalista, al estar entrenado sobre abstracts y textos de revistas revisadas por pares.
- Detección de greenwashing en comunicados empresariales: fine-tuning para clasificación de sentimiento y especificidad climática en notas de prensa y memorias anuales, distinguiendo afirmaciones vagas de compromisos verificables.
- Búsqueda semántica en repositorios de políticas climáticas: codificación de documentos gubernamentales y regulatorios para recuperación por similitud, aprovechando la ventana de 8.192 tokens para indexar pasajes extensos.
- Monitorización de noticias climáticas: clasificación multi-etiqueta de artículos de prensa (2000–2022) por temas como fenómenos extremos, política climática o transición energética, con embeddings robustos al ruido periodístico.
- Evaluación de cumplimiento TCFD: fine-tuning para identificar si los informes financieros cumplen las recomendaciones del Task Force on Climate-related Financial Disclosures, una tarea multi-etiqueta donde el modelo supera al baseline generalista.

## Benchmarks y rendimiento

El modelo alcanza **74,4 F1 promedio** en nueve benchmarks de PLN climático, bajo un protocolo de evaluación con tres semillas de fine-tuning y configuración de hiperparámetros compartida. Los benchmarks incluyen Climate Detection, Climate Specificity, Commitments & Actions, Climate Sentiment, Net Zero & Reduction, TCFD Recommendations, WFB Nature, WXImpactBench y ClimRetrieve. Las tareas binarias y ClimRetrieve reportan F1 de clase positiva; las tareas multi-clase y multi-etiqueta reportan macro-F1.

| Modelo | F1 promedio (9 benchmarks) |
|---|---|
| **A_CX_LRD (ClimateModernBERT, académico)** | **74,4** |
| ModernBERT-Base (baseline estable) | 73,5 |
| ClimateBERT | 72,1 |

No se han publicado resultados adicionales de benchmarks generalistas (MMLU, HumanEval, GSM8K) porque el modelo es un encoder MLM, no un LLM generativo.

## Requisitos de hardware

- Inferencia en CPU: viable para tareas de clasificación con secuencias cortas; el modelo de 150M parámetros ocupa ~600 MB en FP32.
- VRAM estimada: menos de 1 GB en FP32 para batch 1; ~300 MB en BF16 o cuantización int8. Cabe en cualquier GPU consumer (GTX 1060, RTX 3060, etc.).
- GPU recomendada para fine-tuning: RTX 3090 o superior para batch razonable con secuencias de 8.192 tokens; el paper usó 4× A100 para el pretraining completo.
- Opciones de despliegue: transformers (nativo desde 4.48), ONNX Runtime, Hugging Face Inference Endpoints, o cualquier servidor de embeddings compatible con modelos encoder (p. ej. TEI).
- Latencia estimada: del orden de milisegundos por secuencia corta en GPU moderna; no se dispone de datos de throughput publicados.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | F1 clima (9 benchmarks) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| **A_CX_LRD (ClimateModernBERT)** | 149,6M | 8.192 | 74,4 | No declarada | Hugging Face |
| ModernBERT-Base | 149,6M | 8.192 | 73,5 | Apache 2.0 | Hugging Face |
| ClimateBERT | 110M (aprox.) | 512 | 72,1 | Apache 2.0 | Hugging Face |

El modelo supera al baseline ModernBERT-Base en 0,9 puntos de F1 y a ClimateBERT en 2,3 puntos, con la misma arquitectura base que ModernBERT y contexto mucho mayor que ClimateBERT. La licencia no declarada es una limitación para uso comercial directo. El proyecto también publica un modelo fusionado (`Merge_Soup_LRD`) que alcanza 76,3 F1, recomendado para uso general.

## Limitaciones y advertencias

- Solo soporta inglés; no hay capacidad multilingüe.
- Es un modelo de lenguaje enmascarado (MLM), no un sistema de instrucciones ni generativo; no produce texto ni responde preguntas de forma directa.
- No ofrece garantías factuales calibradas sobre ciencia climática; sus salidas requieren validación humana para uso en decisiones.
- Los benchmarks actuales de PLN climático son mayoritariamente a nivel de frase o pasaje, por lo que la capacidad de contexto largo (8.192 tokens) no está completamente evaluada.
- Los datos sintéticos usados en otras variantes del proyecto muestran efectos dependientes de la tarea: ayudan en tareas basadas en taxonomías pero degradan tareas de discurso fino y comprensión de compromisos. Este checkpoint concreto usa solo corpus académico.
- Licencia no declarada en el repositorio; antes de redistribuir o usar comercialmente, hay que verificar los términos del modelo base (ModernBERT-Base, Apache 2.0) y de los corpus subyacentes, que pueden tener restricciones.
- El texto académico original no se redistribuye; solo se liberan los pipelines de procesamiento, lo que limita la reproducibilidad exacta del entrenamiento.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/CMB-ClimateModernBERT/A_CX_LRD
- Modelo fusionado recomendado (Merge_Soup_LRD): https://huggingface.co/CMB-ClimateModernBERT/Merge_Soup_LRD
- Repositorio original (antes del renombrado): https://huggingface.co/sraj/CMB_MARK_CX_LRD
- Colección de checkpoints ClimateModernBERT: https://huggingface.co/collections/sraj/climatemodernbert
- Sitio web del proyecto: https://michaelyya.github.io/ClimateModernBERT/
- Código y pipelines: https://github.com/Michaelyya/ClimateModernBERT
- Inventario completo de modelos: https://github.com/Michaelyya/ClimateModernBERT/blob/main/docs/model-inventory.md
- Guía de nomenclatura: https://github.com/Michaelyya/ClimateModernBERT/blob/main/docs/model-naming.md
- Modelo base ModernBERT-Base: https://huggingface.co/answerdotai/ModernBERT-base
