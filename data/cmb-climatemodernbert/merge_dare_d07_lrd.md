# CMB-ClimateModernBERT/Merge_DARE_D07_LRD

## Resumen

ClimateModernBERT Merge\_DARE\_D07\_LRD es un encoder de lenguaje enmascarado (fill-mask) de 149,7 millones de parámetros, especializado en dominio climático, obtenido mediante adaptación continua (continued pretraining) de ModernBERT-Base sobre un corpus de 6.420 millones de tokens de texto climático. Lo desarrolla el proyecto ClimateModernBERT, una familia de codificadores de dominio climático, y este checkpoint concreto es el resultado de fusionar tres modelos especializados mediante el algoritmo DARE-TIES con tasa de descarte de 0,7. El modelo alcanza una F1 media de 74,3 en nueve benchmarks de PLN climático, superando a la línea base ModernBERT-Base (73,5) y a ClimateBERT (72,1). Su arquitectura es un encoder transformer de 22 capas con contexto de 8.192 tokens, pensado para tareas de clasificación, etiquetado múltiple y recuperación sobre disclosures corporativos, políticas climáticas, literatura científica y noticias. Es relevante porque aborda la composición de corpus en la adaptación de dominio para PLN climático, un área con demanda creciente en reporting ESG y análisis de divulgación climática.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder transformer (ModernBERT-Base) |
| Parametros totales | 149.655.232 (~150M) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 8.192 tokens |
| Tipos de cuantizacion | No disponible (pesos en safetensors, entrenado en BF16) |
| Idiomas soportados | Inglés (en) |
| Licencia | No disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

ModernBERT-Base es un encoder transformer de 22 capas, dimensión oculta 768, 12 cabezas de atención y vocabulario de 50.368 tokens. El entrenamiento siguió dos fases de adaptación continua: la fase 1 (extensión de contexto) con 3 épocas, LR constante 3e-4, batch global 576, longitud de secuencia 8.192, enmascarado MLM al 30 %, optimizador StableAdamW y precisión BF16; la fase 2 (especialización LRD) añadió 3 épocas adicionales con un programa de decaimiento 1−√t desde LR 3e-4 y factor final 1e-3. El entrenamiento se realizó en 4 GPU NVIDIA A100 con MosaicML Composer. El corpus combinado suma 6.420 millones de tokens: ~1.280 millones de texto académico (artículos revisados por pares, archivo ClimateNews 2000-2022, preprints de arXiv y manuales), ~5.000 millones de tokens de texto web climático filtrado (FineWeb-Edu con filtro de 166 términos y clasificador FastText) y ~140 millones de tokens sintéticos generados por LLM en tres estilos comunicativos. El checkpoint final se obtuvo fusionando tres modelos especializados (A\_CX\_LRD, CMB\_FWEdu\_V2\_CX\_LRD y S\_CX\_LRD) mediante DARE-TIES con tasa de descarte 0,7. Los pesos son idénticos al repositorio original `sraj/DARE_TIES_D07_CMB_MARK_CX_LRD_CMB_FWEdu_V2_CX_LRD_CMB_WX_SYN_CX_LRD`, republicado con la nomenclatura del paper.

## Capacidades

- Codificación de texto climático en inglés: genera representaciones contextuales de 768 dimensiones por token.
- Clasificación de secuencias: tras fine-tuning, puede clasificar detección de contenido climático, sentimiento, compromisos y acciones, y recomendaciones TCFD.
- Etiquetado multi-clase y multi-etiqueta sobre disclosures corporativos y documentos de política.
- Recuperación de información (retrieval) sobre literatura científica y noticias climáticas.
- Soporte de contexto largo de 8.192 tokens, útil para documentos extensos.
- No es un sistema de instrucciones: es un modelo de lenguaje enmascarado, no genera texto libre ni soporta tool calling, agentes ni razonamiento multi-paso.
- No es multilingüe: solo inglés.

## Casos de uso

- Detección de contenido climático en informes corporativos: el modelo puede clasificar si un pasaje de un informe anual trata sobre cambio climático, lo que permite filtrar grandes volúmenes de disclosures ESG de forma automatizada.
- Análisis de compromisos y acciones climáticas: fine-tuning para identificar si una empresa declara compromisos de reducción de emisiones (net zero, reducción de alcance 1 y 2) en sus reportes de sostenibilidad, con la ventaja de procesar pasajes largos gracias a los 8.192 tokens de contexto.
- Clasificación de sentimiento climático en noticias: etiquetado del tono (positivo, negativo, neutral) en artículos del archivo ClimateNews 2000-2022 y otras fuentes, útil para monitorización de opinión pública.
- Verificación de cumplimiento de recomendaciones TCFD: etiquetado de documentos financieros para comprobar si siguen las recomendaciones del Task Force on Climate-related Financial Disclosures, una tarea habitual en auditoría de reporting.
- Recuperación de literatura científica: uso del encoder para indexar y recuperar pasajes relevantes en preprints de arXiv y artículos de ciencias de la Tierra y economía energética.
- Análisis de especificidad climática: distinguir entre menciones genéricas y específicas del clima en texto académico y web, útil en pipelines de minería de texto.
- Evaluación de impacto meteorológico extremo: clasificación de eventos climáticos y sus impactos (WXImpactBench), aplicable a sistemas de alerta y análisis de riesgos.

## Benchmarks y rendimiento

| Modelo | F1 media (9 benchmarks climáticos) |
|---|---|
| Merge\_DARE\_D07\_LRD (este modelo) | 74,3 |
| ModernBERT-Base (línea base) | 73,5 |
| ClimateBERT | 72,1 |
| Merge\_Soup\_LRD (modelo hermano, recomendado para uso general) | 76,3 |

Los nueve benchmarks son: Climate Detection, Climate Specificity, Commitments & Actions, Climate Sentiment, Net Zero & Reduction, TCFD Recommendations, WFB Nature, WXImpactBench y ClimRetrieve. Las tareas binarias y ClimRetrieve reportan F1 de clase positiva; las tareas multi-clase y multi-etiqueta reportan F1 macro. Las puntuaciones son la media sobre tres semillas de fine-tuning con una configuración de hiperparámetros compartida (LR 4e-5, batch efectivo 64, weight decay 0,01, hasta 10 épocas con early stopping en F1 de validación). No se han publicado desgloses por tarea en la información disponible.

## Requisitos de hardware

- Tamaño del repositorio: 0,3 GB en safetensors; los pesos en BF16 ocupan aproximadamente 300 MB.
- VRAM estimada para inferencia: entre 0,5 y 1 GB para el modelo en BF16 con contexto corto; con 8.192 tokens de contexto, entre 2 y 4 GB dependiendo del tamaño de batch.
- GPU recomendadas: cabe en cualquier GPU consumer moderna (RTX 3060, RTX 4090) y en GPUs de datacenter (A100, H100). El entrenamiento original usó 4× NVIDIA A100 con MosaicML Composer.
- Fine-tuning downstream: una sola GPU con 8-16 GB de VRAM es suficiente para clasificación de secuencias.
- Opciones de despliegue: transformers nativo desde la versión 4.48 sin `trust_remote_code`; compatible con Hugging Face Inference Endpoints (`endpoints_compatible: true`). Al ser un encoder no generativo, no aplican motores como vLLM, llama.cpp u Ollama; el despliegue típico es vía API de transformers o fine-tuning para tareas de clasificación.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | F1 media (9 benchmarks) | Licencia |
|---|---|---|---|---|
| Merge\_DARE\_D07\_LRD (este) | 149,7M | 8.192 | 74,3 | No disponible |
| ModernBERT-Base | 149,7M | 8.192 | 73,5 | Apache 2.0 (repositorio oficial) |
| ClimateBERT | ~110M (BERT-base) | 512 | 72,1 | No disponible |
| Merge\_Soup\_LRD | 149,7M | 8.192 | 76,3 | No disponible |

El modelo hermano Merge\_Soup\_LRD, que fusiona los mismos componentes mediante weight averaging, obtiene mejor rendimiento (76,3) y es el recomendado por los autores para uso general. ClimateBERT, el referente previo en PLN climático, se queda en 72,1 con una ventana de contexto mucho menor (512 tokens).

## Limitaciones y advertencias

- Solo inglés, y construido sobre una única familia de codificadores (ModernBERT-Base).
- Es un modelo de lenguaje enmascarado, no un sistema de instrucciones: no genera texto fluido y no ofrece garantías factuales calibradas sobre ciencia climática.
- Los benchmarks climáticos actuales son mayoritariamente a nivel de frase o pasaje, por lo que la capacidad de contexto largo (8.192 tokens) no queda completamente ejercitada en la evaluación reportada.
- Los datos sintéticos tienen efectos dependientes de la tarea: ayudan en tareas basadas en taxonomías y marcos (p. ej., TCFD), pero degradan el rendimiento en tareas que requieren comprensión más fina del discurso y los compromisos.
- Riesgo de alucinación: como todo MLM, puede producir representaciones que no reflejan hechos verificables; no está calibrado para dar respuestas factuales.
- El texto académico bruto no se redistribuye (acceso bajo licencias institucionales de editoriales); solo se liberan los pipelines de procesamiento.
- La correspondencia de este checkpoint con una configuración concreta del manuscrito está bajo revisión (ver sección "Open questions" en la documentación de nomenclatura).
- La licencia no está especificada, lo que supone una incertidumbre legal para uso comercial en producción.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/CMB-ClimateModernBERT/Merge_DARE_D07_LRD
- Repositorio original con pesos idénticos: https://huggingface.co/sraj/DARE_TIES_D07_CMB_MARK_CX_LRD_CMB_FWEdu_V2_CX_LRD_CMB_WX_SYN_CX_LRD
- Colección ClimateModernBERT: https://huggingface.co/collections/sraj/climatemodernbert
- Colección Merged CMB: https://huggingface.co/collections/sraj/merged-cmb
- Documentación de nomenclatura del proyecto: https://github.com/Michaelyya/ClimateModernBERT/blob/main/docs/model-naming.md
- Paper DARE (arXiv 2311.03099): https://arxiv.org/pdf/2311.03099
- Codebase MergeLM (ICML 2024): https://github.com/yule-BUAA/MergeLM
- Paper del proyecto "Climate-ModernBERT: Revisiting Corpus Composition for Domain-Adaptive Continued Pretraining": preprint, enlace no disponible en la información facilitada.
