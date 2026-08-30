# CMB-ClimateModernBERT/Merge_TIES_D07_LRD

## Resumen

ClimateModernBERT es una familia de encoders de dominio climático obtenidos mediante continuación de preentrenamiento de ModernBERT-base sobre un corpus especializado en clima. Este modelo concreto, `Merge_TIES_D07_LRD`, es el resultado de fusionar tres variantes de esa familia mediante el método TIES-Merging con una tasa de descarte de 0,7, siguiendo la notación del manuscrito del paper. Con 149,6 millones de parámetros y una ventana de contexto de 8.192 tokens, está diseñado para tareas de comprensión del lenguaje en el ámbito climático: clasificación de texto, etiquetado y recuperación de información sobre divulgaciones corporativas, política, literatura científica y noticias.

El modelo se alinea con la corriente de adaptación de dominio mediante preentrenamiento continuado, un enfoque que permite especializar modelos generales en dominios técnicos con escasa representación en los corpus generales. Su relevancia radica en que ofrece un encoder de tamaño medio con rendimiento superior a los baselines generalistas (ModernBERT-base) y a alternativas previas como ClimateBERT, según los benchmarks del paper. Está pensado para investigación y aplicaciones de NLP climático, no como sistema generativo o de instrucciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder transformer (ModernBERT-base) |
| Parametros totales | 149.655.232 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 8.192 tokens |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | inglés |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de ModernBERT-base, un encoder transformer de 22 capas, dimensión oculta 768 y 12 cabezas de atención, con vocabulario de 50.368 tokens y contexto de 8.192 tokens. Se sometió a un preentrenamiento continuado en dos fases sobre un corpus climático de 6.420 millones de tokens: una primera fase de extensión de contexto (3 épocas, LR constante 3e-4, batch global 576, longitud de secuencia 8.192, enmascaramiento MLM al 30%, StableAdamW, BF16) y una segunda fase de especialización con decaimiento de LR según `1 − √t` (3 épocas, factor final de LR 1e-3). El entrenamiento se realizó con 4× NVIDIA A100 y MosaicML Composer.

Posteriormente, los checkpoints de tres variantes (una entrenada sobre corpus académico, otra sobre corpus web climático filtrado con FineWeb-Edu y una tercera sobre corpus sintético) se fusionaron mediante TIES-Merging con una tasa de descarte de 0,7. TIES-Merging resuelve la interferencia entre parámetros de distintos modelos descartando cambios de baja magnitud y resolviendo conflictos de signo, lo que permite combinar especializaciones sin degradación severa. Los pesos resultantes son idénticos a los del repositorio original `sraj/TIES_D07_CMB_MARK_CX_LRD_CMB_FWEdu_V2_CX_LRD_CMB_WX_SYN_CX_LRD`, republicados bajo una nomenclatura acorde al paper.

## Capacidades

- Representaciones contextuales de texto climático de alta calidad, aptas para transferencia a tareas downstream.
- Clasificación de secuencias (binaria, multiclase y multi-etiqueta) mediante fine-tuning.
- Recuperación de información y búsqueda semántica sobre documentos climáticos.
- Procesamiento de contexto largo (hasta 8.192 tokens) gracias a la arquitectura ModernBERT.
- Soporte nativo en `transformers` desde la versión 4.48, sin necesidad de `trust_remote_code`.
- Limitado a inglés; no es un modelo generativo ni de instrucciones, y no admite tool calling ni razonamiento multi-paso.

## Casos de uso

- Análisis de informes de sostenibilidad: el modelo puede clasificar párrafos de informes corporativos según métricas como emisiones de alcance 1, 2 y 3, gracias a su entrenamiento en corpus de divulgaciones y a su ventana de contexto para capturar el contexto completo del párrafo.
- Detección de compromisos climáticos: fine-tuning sobre el benchmark "Commitments & Actions" permite identificar si una empresa se ha comprometido a objetivos de reducción de emisiones, útil para inversores y reguladores.
- Análisis de sentimiento en noticias climáticas: al estar entrenado con noticias del archivo ClimateNews, el modelo puede etiquetar artículos según el tono positivo, negativo o neutral respecto a políticas o eventos climáticos.
- Clasificación de documentos de política climática: permite categorizar textos legales y de gobierno según su alineación con recomendaciones TCFD u otros marcos, facilitando el seguimiento regulatorio.
- Recuperación de literatura científica: usando embeddings generados por el modelo, se pueden construir sistemas de búsqueda semántica sobre artículos de ciencia del clima y economía energética, donde el contexto largo ayuda a indexar abstracts completos.
- Análisis de divulgaciones financieras relacionadas con el clima (TCFD): el modelo puede identificar si un documento cumple con las recomendaciones de divulgación de riesgos climáticos, una tarea relevante para auditoría y cumplimiento.

## Benchmarks y rendimiento

Según la model card, el modelo alcanza un **75,6 de F1 promedio** en nueve benchmarks climáticos bajo un protocolo común (media de tres semillas de fine-tuning, con hiperparámetros compartidos). Los benchmarks son: Climate Detection, Climate Specificity, Commitments & Actions, Climate Sentiment, Net Zero & Reduction, TCFD Recommendations, WFB Nature, WXImpactBench y ClimRetrieve. Las tareas binarias y ClimRetrieve reportan F1 de clase positiva; las multiclase y multi-etiqueta, macro-F1.

| Modelo | F1 promedio |
|---|---|
| **Merge_TIES_D07_LRD** | **75,6** |
| ModernBERT-base (baseline) | 73,5 |
| ClimateBERT | 72,1 |

No se han publicado resultados desglosados por benchmark en la información disponible. El paper menciona que el modelo `Merge_Soup_LRD` de la misma familia alcanza 76,3, superior a esta variante TIES.

## Requisitos de hardware

- Inferencia en FP16: ~300 MB de VRAM (149,6 M parámetros × 2 bytes), por lo que cabe en cualquier GPU con al menos 2 GB, incluyendo tarjetas consumer como GTX 1650 o superiores.
- Fine-tuning: requiere VRAM adicional para gradientes y optimizador; una RTX 3090 o 4090 (24 GB) es suficiente para tareas de clasificación con batch razonable.
- Despliegue: compatible con la librería `transformers` de HuggingFace; también puede exportarse a ONNX para inferencia en CPU o GPU.
- No se dispone de datos de latencia o throughput oficiales; al ser un encoder de 150 M, la inferencia es rápida incluso en CPU, con tiempos del orden de milisegundos por secuencia corta.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | F1 promedio (clima) | Licencia | Formato |
|---|---|---|---|---|---|
| **Merge_TIES_D07_LRD** | 149,6 M | 8.192 | 75,6 | no disponible | safetensors |
| ModernBERT-base | 149 M | 8.192 | 73,5 | Apache 2.0 | safetensors |
| ClimateBERT | 110 M | 512 | 72,1 | MIT (original) | safetensors |

ClimateBERT es un modelo BERT-base adaptado a dominio climático, pero con contexto mucho más corto (512 tokens) y menor rendimiento en los mismos benchmarks. ModernBERT-base es el modelo generalista del que parte; esta variante TIES lo supera en 2,1 puntos de F1. La licencia de este modelo no está especificada, lo que limita su uso comercial sin consulta previa.

## Limitaciones y advertencias

- Solo inglés; no soporta otros idiomas.
- Es un modelo de lenguaje enmascarado (fill-mask), no un sistema de instrucciones ni un generador de texto; no produce respuestas con garantías factuales sobre ciencia climática.
- Los benchmarks actuales son mayoritariamente a nivel de frase o pasaje, por lo que la capacidad de contexto largo no está plenamente evaluada.
- Los datos sintéticos de entrenamiento tienen efectos dependientes de la tarea: ayudan en tareas basadas en taxonomías o marcos, pero perjudican en tareas que requieren comprensión de discurso o compromisos más finos.
- La licencia no está disponible, lo que introduce incertidumbre legal para uso comercial o redistribución.
- La correspondencia de este checkpoint con una configuración específica del manuscrito está bajo revisión según la documentación del proyecto; puede haber discrepancias en la nomenclatura.
- Los datos académicos no se redistribuyen por licencias institucionales; solo se liberan los pipelines de procesamiento.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/CMB-ClimateModernBERT/Merge_TIES_D07_LRD
- Repositorio original de los pesos: https://huggingface.co/sraj/TIES_D07_CMB_MARK_CX_LRD_CMB_FWEdu_V2_CX_LRD_CMB_WX_SYN_CX_LRD
- Colección ClimateModernBERT en HuggingFace: https://huggingface.co/collections/sraj/climatemodernbert
- Repositorio GitHub del proyecto (nomenclatura y documentación): https://github.com/Michaelyya/ClimateModernBERT
- Paper de TIES-Merging: https://arxiv.org/abs/2306.01708
- Repositorio mergekit (herramienta de fusión): https://github.com/arcee-ai/mergekit
