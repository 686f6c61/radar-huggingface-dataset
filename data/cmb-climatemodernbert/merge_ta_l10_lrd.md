# CMB-ClimateModernBERT/Merge_TA_L10_LRD

## Resumen

ClimateModernBERT Merge_TA_L10_LRD es un modelo de lenguaje enmascarado (MLM) de dominio climático, desarrollado por la organización CMB-ClimateModernBERT como parte de la familia ClimateModernBERT. Se obtiene mediante continued pretraining de ModernBERT-Base sobre un corpus de 6.420 millones de tokens de textos científicos, web y sintéticos relacionados con el clima, seguido de una fusión de tres checkpoints especializados mediante el método Task Arithmetic con λ = 1,0. El resultado es un encoder de 149,7 millones de parámetros con una ventana de contexto de 8.192 tokens, diseñado específicamente para tareas de clasificación, etiquetado múltiple y recuperación sobre literatura climática, informes corporativos y documentos de políticas.

El modelo resuelve el problema de la escasez de modelos de lenguaje especializados en el dominio climático, donde los modelos generalistas pierden precisión en terminología técnica y matices propios del campo. Su relevancia actual radica en que combina la eficiencia arquitectónica de ModernBERT (atención con Flash Attention, decodificación sin dependencia de posición) con un entrenamiento continuado en datos de alta calidad del dominio, logrando 75,7 de F1 promedio en nueve benchmarks climáticos, frente a 73,5 del modelo base y 72,1 de ClimateBERT. Está pensado para investigación y desarrollo de aplicaciones de NLP climático, no para uso conversacional.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (ModernBERT-Base) con atención Flash Attention y embeddings sin dependencia de posición |
| Parametros totales | 149.655.232 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 8.192 tokens |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | inglés |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de ModernBERT-Base, un encoder transformer de 22 capas, dimensión oculta 768 y 12 cabezas de atención, con vocabulario de 50.368 subpalabras. ModernBERT incorpora mejoras como Flash Attention para eficiencia en contexto largo, y embeddings posicionales sin dependencia de posición (RoPE), lo que permite manejar los 8.192 tokens de contexto con un coste computacional moderado. Sobre esta base se realizó un continued pretraining en dos fases: la primera, de extensión de contexto, con 3 épocas, tasa de aprendizaje constante de 3e-4, batch global de 576, longitud de secuencia de 8.192 y masking MLM del 30%; la segunda, de especialización LRD, con 3 épocas adicionales y un programa de decaimiento de tasa de aprendizaje de tipo `1 − √t`, desde 3e-4 hasta un factor final de 1e-3. El entrenamiento se realizó con StableAdamW en BF16 sobre 4× NVIDIA A100 usando MosaicML Composer.

Los datos de entrenamiento provienen de un corpus climático de 6.420 millones de tokens distribuidos en tres subconjuntos: académico (𝒜, ~1.280 millones de tokens) con artículos revisados por pares, archivos de ClimateNews 2000-2022, preprints de arXiv y manuales de clima; web climático (ℱ, ~5.000 millones de tokens) filtrado de FineWeb-Edu con un filtro de 166 términos y un clasificador FastText; y sintético (𝒮, ~140 millones de tokens) generado por LLM a partir de semillas del dominio en tres estilos comunicativos. El checkpoint final se obtiene mediante Task Arithmetic (λ = 1,0), fusionando tres modelos especializados: uno entrenado en corpus académico, otro en web climático y otro en sintético. La fusión se realizó con mergekit. Los textos académicos no se redistribuyen por licencias de editoriales; solo se liberan los pipelines de procesamiento.

## Capacidades

- Codificación de texto climático: genera representaciones densas de 768 dimensiones por token, aptas para clasificación, etiquetado múltiple y recuperación.
- Clasificación de detección de contenido climático: distingue si un texto trata sobre cambio climático o no, con F1 positiva en el benchmark Climate Detection.
- Análisis de especificidad climática: identifica si un texto es específicamente climático o solo tangencial, evaluado en Climate Specificity.
- Detección de compromisos y acciones: extrae y clasifica compromisos climáticos y acciones concretas en informes corporativos y de políticas (Commitments & Actions).
- Análisis de sentimiento climático: clasifica la polaridad de declaraciones sobre clima (Climate Sentiment).
- Reconocimiento de objetivos de net zero y reducción: identifica metas de reducción de emisiones y compromisos de neutralidad (Net Zero & Reduction).
- Clasificación de recomendaciones TCFD: etiqueta textos según las recomendaciones del Task Force on Climate-related Financial Disclosures.
- Clasificación de naturaleza y biodiversidad (WFB Nature): detecta menciones a naturaleza y biodiversidad en contextos financieros y corporativos.
- Evaluación de impacto meteorológico (WXImpactBench): clasifica textos sobre impactos de eventos meteorológicos extremos.
- Recuperación de información climática (ClimRetrieve): soporta tareas de recuperación de pasajes relevantes en corpus climáticos.
- No soporta generación de texto libre ni instrucciones conversacionales: es un modelo de codificación, no un LLM generativo.

## Casos de uso

- Análisis de informes corporativos de sostenibilidad: el modelo puede clasificar párrafos de informes ESG para detectar compromisos climáticos, metas de reducción y alineación con TCFD. Su contexto de 8.192 tokens permite procesar secciones completas de un informe sin truncamiento, y su F1 de 75,7 en los benchmarks relacionados lo hace adecuado para automatizar el cribado de documentos.

- Monitorización de noticias climáticas: dado su entrenamiento con el archivo ClimateNews 2000-2022, puede etiquetar automáticamente artículos de prensa por tema (detección, sentimiento, especificidad) para alimentar paneles de seguimiento mediático o estudios de opinión pública. La capacidad de manejar secuencias largas es útil para artículos extensos.

- Extracción de compromisos de políticas públicas: en documentos de políticas, el modelo identifica frases de compromiso y acción climática, facilitando la comparación entre países o instituciones. Su especialización en el dominio reduce los falsos positivos frente a modelos generalistas.

- Recuperación semántica en bibliotecas científicas: el modelo puede usarse como encoder para sistemas de búsqueda por similitud (por ejemplo, con FAISS) sobre preprints de arXiv y artículos de ciencias de la Tierra, permitiendo encontrar pasajes relevantes sobre un tema climático concreto en corpus grandes.

- Clasificación de divulgaciones financieras climáticas: en el sector financiero, el modelo etiqueta documentos según las recomendaciones TCFD, lo que ayuda a los analistas a evaluar el cumplimiento normativo y la exposición a riesgos climáticos de las empresas.

- Investigación en NLP climático: como modelo base para fine-tuning en tareas específicas (por ejemplo, detección de greenwashing o análisis de controversias), gracias a su arquitectura compatible con `AutoModelForSequenceClassification` y su rendimiento superior al de los modelos generalistas en el dominio.

## Benchmarks y rendimiento

El modelo se evaluó en nueve benchmarks de NLP climático. Las tareas binarias y ClimRetrieve reportan F1 de clase positiva; las tareas multiclase y multi-etiqueta reportan macro-F1. Las puntuaciones son la media de tres semillas de fine-tuning bajo una configuración de hiperparámetros compartida. El resultado principal es la media de F1 entre los nueve benchmarks.

| Modelo | F1 promedio (9 benchmarks) |
|---|---|
| ClimateModernBERT Merge_TA_L10_LRD | 75,7 |
| ModernBERT-Base (stable-phase) | 73,5 |
| ClimateBERT | 72,1 |

No se han publicado resultados desglosados por benchmark individual en la información disponible. El modelo de la familia que alcanza mayor media es Merge_Soup_LRD con 76,3 de F1 promedio.

## Requisitos de hardware

- El modelo tiene 149,7 millones de parámetros; en BF16 ocupa aproximadamente 300 MB y en FP32 unos 600 MB.
- Inferencia en GPU: cabe en cualquier GPU consumer con al menos 2 GB de VRAM (por ejemplo, NVIDIA GTX 1650, RTX 3060, etc.) usando precisión BF16 o FP32. Con cuantización a 8 bits cabría incluso en 1 GB, pero no se han publicado cuantizaciones oficiales.
- Inferencia en CPU: viable para tareas de clasificación por lotes, con latencias del orden de decenas de milisegundos por secuencia corta en un procesador moderno.
- Entrenamiento: se usaron 4× NVIDIA A100 (no se especifica la variante) con MosaicML Composer en BF16.
- Opciones de despliegue: al ser compatible con `transformers` desde la versión 4.48, puede servirse con Hugging Face Inference Endpoints, o integrarse en pipelines con vLLM (aunque al ser un encoder, el uso típico es fine-tuning y extracción de embeddings). También puede usarse con ONNX Runtime para producción.
- Throughput estimado: no disponible en la documentación, pero por su tamaño la inferencia es significativamente más rápida que modelos de 7B o más.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | F1 promedio climático | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ClimateModernBERT Merge_TA_L10_LRD | 149,7M | 8.192 | 75,7 | no disponible | Hugging Face |
| ModernBERT-Base | 149M | 8.192 | 73,5 | Apache 2.0 | Hugging Face |
| ClimateBERT | 110M | 512 | 72,1 | MIT (basado en BERT) | Hugging Face |

ClimateBERT es un modelo basado en BERT (110M parámetros) con contexto limitado a 512 tokens, mientras que ModernBERT-Base es el modelo generalista del que parte este checkpoint. La ventaja del modelo fusionado es su mayor contexto y su especialización en el dominio climático, que se traduce en una mejora de +2,2 puntos de F1 sobre el modelo base y +3,6 sobre ClimateBERT. La licencia del modelo fusionado no está especificada, lo que puede limitar su uso comercial; ModernBERT-Base sí es Apache 2.0.

## Limitaciones y advertencias

- Solo inglés: el modelo no soporta otros idiomas, lo que limita su aplicación a corpus en inglés.
- Dependencia de una única arquitectura: al estar basado en ModernBERT-Base, no explora otras familias de encoders; los hallazgos sobre composición de corpus pueden no generalizar a otros dominios.
- Evaluación a nivel de frase o pasaje: los benchmarks actuales de NLP climático no ejercitan completamente la capacidad de contexto largo de 8.192 tokens, por lo que el rendimiento en documentos completos no está validado.
- Efectos negativos de los datos sintéticos: el corpus sintético (𝒮) mejora tareas basadas en taxonomías y marcos, pero degrada el rendimiento en tareas que requieren comprensión fina del discurso y de compromisos. Esto debe tenerse en cuenta al usar el modelo en tareas de análisis de compromisos.
- Es un modelo de lenguaje enmascarado, no un modelo instruccional: no puede seguir instrucciones ni generar texto libre; solo produce representaciones y puede fine-tuning para clasificación.
- Licencia no especificada: la ausencia de licencia declarada puede impedir su uso en entornos comerciales o de código abierto sin consulta legal previa.
- Riesgo de alucinación: como modelo MLM, no genera texto, pero las representaciones pueden reflejar sesgos presentes en los datos de entrenamiento (por ejemplo, sobrerrepresentación de ciertos temas o regiones).
- Correspondencia con el paper bajo revisión: la model card indica que el mapeo de este checkpoint a una configuración concreta del manuscrito no está completamente resuelto; los usuarios deben verificar la documentación antes de citar resultados.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/CMB-ClimateModernBERT/Merge_TA_L10_LRD
- Repositorio original del que se republicó: https://huggingface.co/sraj/TA_Lambda10_CMB_MARK_CX_LRD_CMB_FWEdu_V2_CX_LRD_CMB_WX_SYN_CX_LRD
- Modelo base: https://huggingface.co/answerdotai/ModernBERT-base
- Componentes fusionados:
  - https://huggingface.co/CMB-ClimateModernBERT/A_CX_LRD
  - https://huggingface.co/sraj/CMB_FWEdu_V2_CX_LRD
  - https://huggingface.co/CMB-ClimateModernBERT/S_CX_LRD
- Modelo recomendado para uso general (Merge_Soup_LRD): https://huggingface.co/CMB-ClimateModernBERT/Merge_Soup_LRD
- Documentación de nomenclatura del proyecto (GitHub): https://github.com/Michaelyya/ClimateModernBERT/blob/main/docs/model-naming.md
- Colección ClimateModernBERT: https://huggingface.co/collections/sraj/climatemodernbert
- Colección de modelos fusionados: https://huggingface.co/collections/sraj/merged-cmb
