# CMB-ClimateModernBERT/Merge_Soup_LRD

## Resumen

ClimateModernBERT es una familia de codificadores de dominio climático obtenidos mediante continuación del pretraining de ModernBERT-Base sobre un corpus especializado de 6,42 mil millones de tokens. El modelo `Merge_Soup_LRD` es el checkpoint recomendado de la familia, resultado de un merge lineal (promedio uniforme de pesos) de tres checkpoints de fase 2, entrenados respectivamente sobre corpus académico, web climática filtrada y datos sintéticos. Este merge, denominado θSoup en el manuscrito, alcanza 76,3 de F1 promedio en nueve benchmarks de NLP climático, superando al baseline ModernBERT-Base (73,5) y a ClimateBERT (72,1) bajo el mismo protocolo de evaluación.

El modelo conserva la arquitectura ModernBERT-Base: 150 millones de parámetros, 22 capas, 12 cabezas de atención, dimensión oculta 768, vocabulario de 50.368 tokens y una ventana de contexto de 8.192 tokens. Está diseñado como un modelo de lenguaje enmascarado (fill-mask) para codificación de texto y fine-tuning posterior en tareas de clasificación, etiquetado múltiple y recuperación de información. Su relevancia actual radica en que aborda la escasez de modelos de lenguaje especializados en ciencia climática, un área con creciente demanda de análisis automatizado de informes corporativos, documentos de política y literatura científica.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ModernBERT (Transformer encoder, MLM) |
| Parametros totales | 149.655.232 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 8.192 tokens |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (ingles) |
| Licencia | no disponible |
| Formato de pesos | safetensors (transformers) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura ModernBERT-Base, un Transformer encoder con atención clásica, diseñado para eficiencia en secuencias largas. No emplea mezcla de expertos ni atención lineal; su innovación principal reside en el proceso de adaptación al dominio. El entrenamiento se realizó en dos fases sobre un corpus de 6,42B tokens compuesto por: corpus académico (~1,28B tokens de artículos revisados por pares, archivos de noticias climáticas 2000–2022, preprints de arXiv y manuales), corpus web climático (~5B tokens de FineWeb-Edu filtrado por relevancia climática mediante un filtro de 166 términos y un clasificador FastText) y corpus sintético (~0,14B tokens generados por LLM condicionados a extractos semilla del dominio).

La fase 1 consistió en extensión de contexto con 3 épocas, LR constante 3e-4, batch global 576, longitud de secuencia 8.192, masking MLM al 30% y optimizador StableAdamW en BF16. La fase 2 aplicó una especialización con decaimiento de LR según el esquema `1 − √t` desde 3e-4 hasta un factor final de 1e-3, durante 3 épocas adicionales. El entrenamiento se realizó con 4× NVIDIA A100 y MosaicML Composer. Los tres checkpoints de fase 2 (uno por corpus) se fusionaron mediante promedio uniforme de pesos normalizado con mergekit, dando lugar al modelo final.

## Capacidades

- Codificacion de texto climático: genera representaciones vectoriales densas de 768 dimensiones para frases, párrafos o documentos completos.
- Modelo de lenguaje enmascarado (fill-mask): permite predecir tokens enmascarados en contexto, útil para tareas de análisis lingüístico.
- Soporte para fine-tuning en clasificación de secuencias, etiquetado múltiple y recuperación de información (retrieval).
- Manejo de contextos largos de hasta 8.192 tokens, adecuado para documentos extensos como informes de sostenibilidad o artículos científicos.
- Capacidades multilingües: no disponibles, el modelo es exclusivamente en inglés.
- No es un modelo generativo ni de instrucciones; no soporta tool calling, agentes ni razonamiento multi-paso.

## Casos de uso

- Clasificación de detección climática: identificar si un texto trata sobre cambio climático en artículos de noticias o publicaciones en redes sociales, mediante fine-tuning de `AutoModelForSequenceClassification` sobre el encoder congelado o ajustado.
- Análisis de compromisos y acciones climáticas: extraer y clasificar declaraciones de compromisos de reducción de emisiones en informes corporativos de sostenibilidad, aprovechando el contexto de 8.192 tokens para procesar secciones completas.
- Etiquetado múltiple de documentos de política: asignar etiquetas temáticas (mitigación, adaptación, financiación) a documentos de política climática usando clasificación multi-etiqueta sobre las representaciones del modelo.
- Recuperación de información en literatura científica: construir índices de búsqueda semántica sobre artículos de ciencia climática, donde las representaciones del modelo mejoran la precisión frente a modelos generalistas.
- Análisis de sentimiento climático: clasificar el sentimiento (positivo, negativo, neutral) en textos de discurso público o prensa especializada, tarea para la que el modelo reporta F1 competitivo.
- Evaluación de recomendaciones TCFD: detectar y clasificar la presencia de recomendaciones del Task Force on Climate-related Financial Disclosures en informes financieros, una tarea con taxonomía rígida donde el corpus sintético aporta cobertura.
- Monitorización de impacto meteorológico extremo: procesar informes de daños y alertas para clasificar la severidad de eventos climáticos, apoyándose en el corpus web filtrado por relevancia climática.

## Benchmarks y rendimiento

El modelo reporta un F1 promedio de 76,3 en nueve benchmarks de NLP climático: Climate Detection, Climate Specificity, Commitments & Actions, Climate Sentiment, Net Zero & Reduction, TCFD Recommendations, WFB Nature, WXImpactBench y ClimRetrieve. Las tareas binarias y ClimRetrieve usan F1 de clase positiva; las tareas multi-clase y multi-etiqueta usan macro-F1. Las puntuaciones son la media sobre tres semillas de fine-tuning con una configuración de hiperparámetros compartida.

| Modelo | F1 promedio (9 benchmarks) |
|---|---|
| Merge_Soup_LRD (θSoup) | 76,3 |
| ModernBERT-Base (baseline) | 73,5 |
| ClimateBERT | 72,1 |

No se han publicado resultados desglosados por benchmark en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: al tratarse de un modelo de 150M de parámetros, la inferencia en FP16 requiere aproximadamente 300 MB de VRAM; en cuantización de 8 bits, unos 150 MB. Estos valores son estimaciones basadas en el tamaño del modelo, no mediciones oficiales.
- GPU recomendadas: cualquier GPU consumer con al menos 4 GB de VRAM (GTX 1650, RTX 3050, etc.) puede ejecutar el modelo cómodamente. Para fine-tuning con batch grande, una RTX 3090 o A100 sería adecuada.
- El entrenamiento original usó 4× NVIDIA A100, pero la inferencia y el fine-tuning son viables en hardware mucho más modesto.
- Opciones de despliegue: al ser un modelo de transformers estándar, es compatible con vLLM, Hugging Face Inference Endpoints, TGI y cualquier framework que soporte arquitecturas BERT-like. No se han publicado archivos GGUF ni integración con Ollama.
- Latencia y throughput: no disponibles en la información proporcionada; en una GPU moderna, la inferencia de una secuencia de 512 tokens debería completarse en decenas de milisegundos, pero no hay datos oficiales.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | F1 climático promedio | Licencia |
|---|---|---|---|---|
| Merge_Soup_LRD (ClimateModernBERT) | 150M | 8.192 | 76,3 | no disponible |
| ModernBERT-Base | 150M | 8.192 | 73,5 | Apache 2.0 |
| ClimateBERT | 110M | 512 | 72,1 | MIT (por confirmar) |

La comparativa se basa en los datos del manuscrito del proyecto. ClimateBERT es un modelo más antiguo con contexto limitado a 512 tokens, mientras que ModernBERT-Base y su adaptación climática ofrecen una ventana ocho veces mayor. La ventaja de Merge_Soup_LRD sobre su base radica en la especialización de dominio, con una mejora de 2,8 puntos de F1 sin aumentar el coste computacional de inferencia.

## Limitaciones y advertencias

- El modelo es exclusivamente en inglés; no soporta otros idiomas ni transferencia multilingüe.
- Es un modelo de lenguaje enmascarado, no un sistema de instrucciones ni generativo; no produce respuestas abiertas ni razonamiento conversacional.
- No ofrece garantías factuales calibradas sobre ciencia climática; sus salidas deben interpretarse como representaciones estadísticas, no como afirmaciones verificadas.
- Los datos sintéticos tienen efectos dependientes de la tarea: mejoran tareas basadas en taxonomías y marcos, pero degradan el rendimiento en tareas que requieren comprensión de discurso fino y de compromisos.
- Los benchmarks actuales de NLP climático operan mayoritariamente a nivel de frase o pasaje, por lo que la capacidad de contexto largo (8.192 tokens) no está plenamente validada por la evaluación reportada.
- La licencia no está disponible en la información pública; antes de un uso comercial, es necesario contactar con los autores para clarificar los términos.
- El texto académico original no se redistribuye; los pipelines de procesamiento están publicados, pero los datos crudos pueden estar sujetos a licencias institucionales.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/CMB-ClimateModernBERT/Merge_Soup_LRD
- Repositorio original del merge: https://huggingface.co/sraj/Merge_Linear
- Colección ClimateModernBERT: https://huggingface.co/collections/sraj/climatemodernbert
- Colección de checkpoints CMB: https://huggingface.co/collections/sraj/cmb-all
- Proyecto web: https://michaelyya.github.io/ClimateModernBERT/
- Repositorio de código y pipelines: https://github.com/Mich (incompleto en la información disponible)
- Herramienta de merge utilizada (mergekit): https://github.com/arcee-ai/mergekit
