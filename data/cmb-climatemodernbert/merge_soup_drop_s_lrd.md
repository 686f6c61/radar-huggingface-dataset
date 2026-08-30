# CMB-ClimateModernBERT/Merge_Soup_drop_S_LRD

## Resumen

`CMB-ClimateModernBERT/Merge_Soup_drop_S_LRD` es un modelo de codificación (encoder) de lenguaje enmascarado especializado en dominio climático, perteneciente a la familia **ClimateModernBERT**. Desarrollado por el grupo CMB-ClimateModernBERT, parte de una línea de investigación que explora la composición de corpus para la adaptación de dominio mediante *continued pretraining* sobre la arquitectura ModernBERT-Base (150M parámetros, 22 capas, contexto de 8.192 tokens). Este checkpoint concreto es el resultado de un *model soup* (promediado lineal de pesos) de dos modelos entrenados respectivamente sobre corpus académico y web climática, excluyendo deliberadamente el corpus sintético. La exclusión del corpus sintético (𝒮) responde a hallazgos del paper asociado: aunque mejora tareas basadas en taxonomías, degrada tareas que requieren comprensión fina del discurso y de compromisos climáticos.

El modelo está diseñado para investigación en NLP climático: codificación de texto, fine-tuning para clasificación, etiquetado multi-etiqueta y recuperación de información sobre divulgaciones corporativas, documentos de políticas, literatura científica y noticias climáticas. No es un modelo generativo ni de instrucciones; su pipeline es `fill-mask`. Se publica con fines de reproducibilidad y trazabilidad, no como modelo principal de la familia — el repositorio recomienda para uso general `Merge_Soup_LRD`, que alcanza 76.3 de F1 promedio frente a los 73.5 del baseline ModernBERT-Base.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder (ModernBERT-Base) |
| Parámetros totales | 149.655.232 |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | 8.192 tokens |
| Tipos de cuantización | No disponible |
| Idiomas soportados | Inglés |
| Licencia | No disponible |
| Formato de pesos | Safetensors (compatible con Transformers) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de ModernBERT-Base: 22 capas, dimensión oculta 768, 12 cabezas de atención, vocabulario de 50.368 tokens y ventana de contexto de 8.192 tokens. El entrenamiento de adaptación al dominio se realizó en dos fases, siguiendo la receta de continued pretraining de ModernBERT:

- **Fase 1 — extensión de contexto**: 3 épocas, LR constante 3e-4, batch global 576, longitud de secuencia 8.192, masking MLM al 30%, optimizador StableAdamW, precisión BF16.
- **Fase 2 — especialización LRD**: 3 épocas adicionales con un esquema de decaimiento `1 − √t` desde LR 3e-4 con factor final 1e-3.

Los datos de entrenamiento provienen de un corpus climático total de 6,42B tokens, del cual se usaron dos subconjuntos: **Academic (𝒜)** con ~1,28B tokens (artículos de revistas revisadas por pares en ciencia climática, sistemas terrestres y economía energética; archivo ClimateNews 2000–2022; preprints de arXiv en clima; manuales climáticos) y **Climate Web (ℱ)** con ~5B tokens (FineWeb-Edu filtrado por relevancia climática con un filtro de 166 términos y un clasificador FastText). El corpus sintético (𝒮, ~0,14B tokens) fue excluido del merge. El proceso de fusión se realizó con **mergekit** mediante promediado lineal uniforme de los checkpoints `A_CX_LRD` y `F_CX_LRD`. El entrenamiento se ejecutó en 4× NVIDIA A100 con MosaicML Composer.

## Capacidades

- **Codificación de texto climático**: genera representaciones contextuales de alta calidad para texto científico, corporativo y periodístico relacionado con clima.
- **Fine-tuning para clasificación**: soporta `AutoModelForSequenceClassification` para tareas binarias, multi-clase y multi-etiqueta (p. ej., detección de compromisos, análisis de sentimiento, recomendaciones TCFD).
- **Retrieval semántico**: apto para recuperación de información sobre literatura científica y documentos de políticas climáticas mediante representaciones densas.
- **Contexto largo**: ventana de 8.192 tokens, útil para procesar párrafos extensos o múltiples secciones de informes.
- **Modelo enmascarado**: pipeline `fill-mask`, no generativo ni de instrucciones.
- **Monolingüe**: solo inglés.

## Casos de uso

- **Análisis de divulgaciones corporativas climáticas**: el modelo puede fine-tuning para clasificar informes anuales y memorias de sostenibilidad según criterios TCFD, identificando si una empresa reporta recomendaciones concretas sobre gobernanza climática, estrategia o métricas.
- **Detección de compromisos y acciones climáticas**: permite etiquetar automáticamente frases u oraciones que contienen compromisos verificables (p. ej., "reducir emisiones en un 50% para 2030") frente a declaraciones vagas, gracias a su entrenamiento en corpus académico y web con vocabulario especializado.
- **Análisis de sentimiento climático en noticias**: fine-tuning sobre datasets de sentimiento (positivo/negativo/neutral) en artículos de prensa climática, aprovechando el conocimiento del dominio adquirido durante el pretraining continuado.
- **Recuperación de literatura científica**: uso como encoder para *dense retrieval* sobre artículos de revistas y preprints de arXiv en ciencia climática, permitiendo búsquedas semánticas por concepto (p. ej., "carbon capture", "tipping points") en lugar de palabras clave exactas.
- **Clasificación de políticas climáticas**: etiquetado multi-etiqueta de documentos gubernamentales o de ONGs según tipo de instrumento (regulación, incentivos, fijación de precios) y sector afectado, útil para seguimiento legislativo.
- **Evaluación de riesgos climáticos en informes financieros**: detección de pasajes que mencionan riesgos físicos o de transición en informes 10-K o memorias de sostenibilidad, facilitando el análisis de exposición climática en carteras de inversión.
- **Investigación en composición de corpus para adaptación de dominio**: este checkpoint sirve como referencia para estudiar el impacto de excluir datos sintéticos en tareas de NLP climático, comparándolo con el modelo que sí incluye el corpus sintético (`Merge_Soup_LRD`).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks agregados para este checkpoint específico. La model card indica explícitamente que el manuscrito no reporta una puntuación global para este modelo, ya que se publica con fines de proveniencia y trabajos de seguimiento, no como modelo principal.

Datos de referencia del paper (evaluación sobre 9 benchmarks climáticos: Climate Detection, Climate Specificity, Commitments & Actions, Climate Sentiment, Net Zero & Reduction, TCFD Recommendations, WFB Nature, WXImpactBench y ClimRetrieve; métricas F1 positiva para tareas binarias y macro-F1 para multi-clase/multi-etiqueta, media sobre 3 semillas):

| Modelo | F1 promedio |
|---|---|
| ModernBERT-Base (baseline estable) | 73,5 |
| ClimateBERT | 72,1 |
| Merge_Soup_LRD (con corpus sintético) | 76,3 |
| Merge_Soup_drop_S_LRD (sin corpus sintético) | No reportado (se estima ~1,5 F1 inferior al anterior) |

La exclusión del corpus sintético cuesta aproximadamente 1,5 puntos de F1 promedio, pero mejora algunos benchmarks individuales, según la figura 2 del paper.

## Requisitos de hardware

- **VRAM estimada para inferencia**: al ser un modelo de 150M parámetros (~0,3 GB en safetensors), la inferencia en GPU requiere menos de 2 GB de VRAM incluso con contexto 8.192. En CPU es viable para inferencia puntual.
- **GPU recomendadas**: cualquier GPU con ≥4 GB de VRAM (p. ej., NVIDIA GTX 1650, RTX 3050) es suficiente para inferencia. Para fine-tuning se recomienda al menos 8 GB (RTX 3070/4060) o una A100 para entrenamiento completo.
- **Compatibilidad con consumer GPU**: sí, cabe en GPUs de consumo estándar. El entrenamiento original usó 4× A100, pero eso es solo para el pretraining continuado.
- **Opciones de despliegue**: al ser un encoder de Transformers, se integra con `transformers` (pipelines para fill-mask y AutoModelForSequenceClassification). Puede servirse con vLLM o TGI para fine-tuning con clasificación, pero no es un LLM generativo. También es compatible con ONNX y TorchScript.
- **Latencia y throughput**: no se han publicado mediciones específicas. Dado el tamaño (150M parámetros), la inferencia en GPU moderna es del orden de milisegundos por secuencia corta; en CPU, decenas de milisegundos.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | F1 promedio (clima NLP) |
|---|---|---|---|---|---|
| **Merge_Soup_drop_S_LRD** (este) | 150M | 8.192 | en | No disponible | No reportado (~74,8 estimado) |
| **Merge_Soup_LRD** (mismo proyecto, con sintético) | 150M | 8.192 | en | No disponible | 76,3 |
| **ModernBERT-Base** (modelo base) | 150M | 8.192 | en | Apache 2.0 | 73,5 |
| **ClimateBERT** (RoBERTa-base adaptado a clima) | 125M | 512 | en | MIT | 72,1 |

*Nota: la licencia de los modelos ClimateModernBERT no está especificada en la model card ni en los metadatos de HuggingFace.*

## Limitaciones y advertencias

- **Solo inglés**: no soporta otros idiomas, lo que limita su uso en contextos multilingües (p. ej., informes climáticos de la UE en varios idiomas).
- **Modelo enmascarado, no generativo**: no puede generar texto ni seguir instrucciones; su uso se limita a codificación y fine-tuning supervisado.
- **Sin garantías factuales**: como MLM, no produce respuestas calibradas sobre ciencia climática; las representaciones pueden reflejar sesgos del corpus de entrenamiento.
- **Efectos del corpus sintético**: el modelo excluye datos sintéticos, lo que mejora algunas tareas (comprensión de discurso y compromisos) pero degrada otras basadas en taxonomías y marcos; este efecto es específico del dominio climático y no debe generalizarse a otros dominios.
- **Licencia no especificada**: la ausencia de licencia explícita impide asumir permisos de uso comercial; se recomienda contactar a los autores antes de cualquier despliegue en producción.
- **Benchmarks no reportados**: no hay puntuaciones agregadas para este checkpoint; no debe utilizarse como modelo de referencia sin evaluar previamente en la tarea objetivo.
- **Contexto largo no ejercitado**: los benchmarks climáticos actuales operan a nivel de frase o pasaje, por lo que la capacidad de 8.192 tokens no se ha validado exhaustivamente en tareas de documento completo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/CMB-ClimateModernBERT/Merge_Soup_drop_S_LRD
- Colección ClimateModernBERT: https://huggingface.co/collections/sraj/climatemodernbert
- Colección CMB all: https://huggingface.co/collections/sraj/cmb-all
- Proyecto web: https://michaelyya.github.io/ClimateModernBERT/
- Código y pipelines: https://github.com/Michaelyya/ClimateModernBERT
- Catálogo completo de modelos: https://github.com/Michaelyya/ClimateModernBERT/blob/main/docs/model-inventory.md
- Modelo recomendado para uso general: https://huggingface.co/CMB-ClimateModernBERT/Merge_Soup_LRD
- Repositorio original (pesos idénticos): https://huggingface.co/sraj/Merge_Drop_SYN_FastText
- Paper: preprint en revisión, sin DOI ni arXiv aún; PDF disponible en el repositorio del proyecto.
