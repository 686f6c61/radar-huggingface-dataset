# CMB-ClimateModernBERT/Merge_Soup_drop_F_LRD

## Resumen

`CMB-ClimateModernBERT/Merge_Soup_drop_F_LRD` es un encoder de lenguaje enmascarado (masked language model) especializado en dominio climático, desarrollado por el grupo CMB-ClimateModernBERT (usuario sraj) como parte de una familia de modelos obtenidos mediante continued pretraining de ModernBERT-Base sobre corpus de texto climático. Este checkpoint concreto es el resultado de un merge lineal (uniform soup) de dos modelos entrenados sobre los corpus académico (𝒜) y sintético (𝒮), excluyendo deliberadamente el corpus de web climática (ℱ). La exclusión de ℱ cuesta aproximadamente 1,5 puntos de F1 promedio según el paper, pero libera al modelo de la dependencia del filtrado FastText usado en ese corpus.

Con 149,7 millones de parámetros, 22 capas, dimensión oculta 768 y contexto de 8.192 tokens, el modelo hereda la arquitectura de ModernBERT-Base (answerdotai/ModernBERT-base). Está pensado para investigación en PLN climático: codificación de textos, clasificación, etiquetado multi-etiqueta y recuperación de información sobre disclosures corporativos, documentos de políticas, literatura científica y noticias climáticas. El propio autor indica que no es un modelo "cabecera" de la familia, sino que se publica por trazabilidad y para trabajos de seguimiento; para uso general recomienda `Merge_Soup_LRD`, que alcanza 76,3 de F1 promedio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (ModernBERT-Base) |
| Parametros totales | 149.655.232 (150M aprox.) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 8.192 tokens |
| Tipos de cuantizacion | no disponible (pesos en BF16/FP32, safetensors) |
| Idiomas soportados | Inglés (en) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en ModernBERT-Base, un encoder Transformer con 22 capas, 12 cabezas de atención, dimensión oculta 768 y un vocabulario de 50.368 tokens. Se trata de un modelo de lenguaje enmascarado (MLM) puro, sin decodificador ni capacidad generativa.

El entrenamiento siguió el procedimiento de continued pretraining de ModernBERT en dos fases:

- **Fase 1 (extension de contexto):** 3 épocas sobre los corpus 𝒜 (académico, ~1,28B tokens) y 𝒮 (sintético, ~0,14B tokens), con LR constante 3e-4, batch global 576, longitud de secuencia 8.192, masking MLM al 30%, optimizador StableAdamW y precisión BF16.
- **Fase 2 (especializacion LRD):** 3 épocas adicionales con un esquema de decaimiento `1 − √t` desde LR 3e-4 hasta un factor final de 1e-3, sobre los mismos corpus.

El merge se realizó con mergekit mediante promediado lineal uniforme de los pesos de los dos modelos entrenados (`A_CX_LRD` y `S_CX_LRD`), eliminando el corpus ℱ (Climate Web, ~5B tokens). Los checkpoints finales se convirtieron al formato HuggingFace Transformers. El entrenamiento se ejecutó en 4× NVIDIA A100 con MosaicML Composer.

## Capacidades

- **Codificacion de texto climático:** genera representaciones contextuales de alta calidad para frases, párrafos y documentos completos sobre clima, energía y sostenibilidad.
- **Fine-tuning para clasificacion:** compatible con `AutoModelForSequenceClassification` para tareas binarias, multi-clase y multi-etiqueta.
- **Recuperacion de informacion:** puede usarse como backbone para sistemas de retrieval denso sobre literatura científica, informes corporativos y políticas climáticas.
- **Contexto largo:** ventana de 8.192 tokens, adecuada para procesar documentos extensos completos sin truncamiento agresivo.
- **Modelo enmascarado (fill-mask):** permite completar tokens enmascarados, útil para tareas de inferencia de entidades o relaciones en texto climático.
- **Multilingüe:** no, solo inglés.
- **Tool calling / agentes:** no aplica; es un encoder sin interfaz de generación de instrucciones.

## Casos de uso

- **Deteccion de compromisos climáticos en informes corporativos:** el modelo puede fine-tunearse para identificar si una empresa declara objetivos de reducción de emisiones (commitments & actions) en sus disclosures anuales, aprovechando su contexto de 8.192 tokens para analizar secciones completas.
- **Clasificacion de sentimiento climático en noticias:** a partir del corpus académico y sintético, el modelo captura matices de sentimiento en artículos periodísticos sobre cambio climático, útil para monitorización de medios.
- **Etiquetado multi-etiqueta de documentos de políticas:** permite asignar categorías como "net zero", "TCFD recommendations" o "nature-related" a párrafos de documentos gubernamentales o regulatorios, con fine-tuning sobre los nueve benchmarks climáticos del paper.
- **Recuperacion de literatura cientifica:** como encoder denso, puede indexar abstracts de artículos de ciencias de la Tierra y sistemas energéticos, permitiendo búsquedas semánticas por similitud coseno.
- **Analisis de informes TCFD:** el modelo está entrenado sobre textos académicos y sintéticos que incluyen terminología de reporting financiero climático, por lo que puede fine-tunearse para extraer recomendaciones TCFD de informes anuales.
- **Evaluacion de especificidad climática:** clasificar si un texto trata realmente sobre clima o solo lo menciona tangencialmente (tarea "Climate Specificity"), útil para filtrar grandes volúmenes de documentos.
- **Sistemas de alerta temprana de eventos extremos:** aunque no es su uso principal, el modelo puede procesar boletines meteorológicos y noticias para clasificar eventos como olas de calor o inundaciones, gracias a su entrenamiento en corpus climáticos diversos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks para este checkpoint concreto. El paper reporta que el modelo se evaluó en nueve benchmarks climáticos (Climate Detection, Climate Specificity, Commitments & Actions, Climate Sentiment, Net Zero & Reduction, TCFD Recommendations, WFB Nature, WXImpactBench y ClimRetrieve), pero el manuscrito no proporciona una puntuación agregada para esta variante específica. El autor indica que excluir el corpus ℱ cuesta aproximadamente 1,5 puntos de F1 promedio respecto al merge completo.

Como referencia del mismo protocolo de evaluación, el paper da estos valores:

| Modelo | F1 promedio |
|---|---|
| ModernBERT-Base (baseline estable) | 73,5 |
| ClimateBERT | 72,1 |
| Merge_Soup_LRD (con todos los corpus) | 76,3 |
| Merge_Soup_drop_F_LRD (este modelo) | no disponible |

## Requisitos de hardware

- **VRAM estimada para inferencia:** ~1-2 GB en FP16 (149M parámetros), ~0,6 GB en cuantización INT8 si se aplicara (no hay cuantizaciones publicadas).
- **GPU recomendadas:** cualquier GPU consumer con al menos 4 GB VRAM (RTX 3060, RTX 4060, etc.). Para fine-tuning, 8-12 GB son suficientes con batch pequeño.
- **Compatibilidad consumer:** sí, cabe holgadamente en GPUs de gama media actuales.
- **Opciones de despliegue:** compatible con transformers (>=4.48) sin `trust_remote_code`, también con vLLM, TGI y llama.cpp (si se convierte a GGUF). Para retrieval, puede integrarse con Faiss o Milvus.
- **Latencia y throughput:** al ser un modelo pequeño, la inferencia es muy rápida; en una GPU moderna se pueden procesar cientos de secuencias por segundo, aunque no se han publicado cifras oficiales.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento (F1 clima) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| **Merge_Soup_drop_F_LRD** (este) | 149,7M | 8.192 | no disponible | no disponible | HuggingFace |
| ModernBERT-Base | 149,7M | 8.192 | 73,5 | Apache 2.0 | HuggingFace |
| ClimateBERT (distilroberta-base) | 82M | 512 | 72,1 | MIT | HuggingFace |
| Merge_Soup_LRD (familia) | 149,7M | 8.192 | 76,3 | no disponible | HuggingFace |

La principal ventaja de este modelo frente a ClimateBERT es su contexto mucho mayor (8.192 vs 512 tokens) y su arquitectura moderna (ModernBERT). Frente a ModernBERT-Base, la adaptación al dominio climático mejora el rendimiento en tareas específicas, aunque la exclusión del corpus ℱ reduce la ganancia respecto al merge completo.

## Limitaciones y advertencias

- **Solo inglés:** no soporta otros idiomas, lo que limita su uso en contextos multilingües.
- **Modelo enmascarado, no generativo:** no puede producir texto libre ni seguir instrucciones; no es un chatbot ni un sistema de QA generativo.
- **Sin garantías factuales:** al ser un MLM, no ofrece calibración sobre la veracidad de los hechos climáticos; puede producir representaciones que reflejen sesgos del corpus.
- **Dependencia del corpus sintético:** el entrenamiento con datos generados por LLM tiene efectos dependientes de la tarea; ayuda en tareas basadas en taxonomías pero degrada el rendimiento en tareas que requieren comprensión fina del discurso y de compromisos.
- **Licencia no disponible:** no se indica la licencia del modelo, lo que puede suponer un obstáculo para uso comercial; se recomienda contactar al autor antes de desplegarlo en producción.
- **Sin puntuación agregada publicada:** al no tener benchmark propio, no se puede comparar directamente su calidad con otros modelos de forma fiable.
- **Limitaciones del contexto de evaluación:** los benchmarks climáticos actuales son mayoritariamente a nivel de frase o párrafo, por lo que la capacidad de contexto largo del modelo no se ha validado exhaustivamente.
- **Hallazgos específicos del dominio:** las conclusiones sobre composición de corpus se demuestran dentro del PLN climático y no deben generalizarse a otros dominios.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/CMB-ClimateModernBERT/Merge_Soup_drop_F_LRD
- Repositorio original (sraj): https://huggingface.co/sraj/Merge_Drop_FWebEduv2
- Colección ClimateModernBERT: https://huggingface.co/collections/sraj/climatemodernbert
- Proyecto web: https://michaelyya.github.io/ClimateModernBERT/
- Código y pipelines: https://github.com/Michaelyya/ClimateModernBERT
- Modelo recomendado para uso general (Merge_Soup_LRD): https://huggingface.co/CMB-ClimateModernBERT/Merge_Soup_LRD
- Paper (preprint sin DOI, disponible en el repositorio del proyecto): no disponible como enlace directo
