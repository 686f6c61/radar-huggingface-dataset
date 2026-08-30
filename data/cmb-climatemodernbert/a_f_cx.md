# CMB-ClimateModernBERT/A_F_CX

## Resumen

CMB-ClimateModernBERT/A_F_CX es un modelo de lenguaje enmascarado (masked language model, MLM) de dominio climático, resultado de un proceso de *continued pretraining* sobre ModernBERT-Base. Lo desarrolla el proyecto ClimateModernBERT, un esfuerzo de investigación centrado en la composición de corpus para la adaptación de dominio en NLP climático. El modelo está pensado para codificar texto científico, corporativo y periodístico relacionado con el clima, y sirve como base para tareas posteriores de clasificación, etiquetado multi-etiqueta y recuperación de información.

Con 149,6 millones de parámetros, 22 capas y una ventana de contexto de 8.192 tokens, este checkpoint corresponde a la fase 1 del entrenamiento (extensión de contexto) y utiliza exclusivamente corpus académico y web climática. Su relevancia actual radica en que ofrece una alternativa especializada y ligera a modelos generalistas para el creciente campo de la analítica de divulgaciones climáticas, políticas y literatura científica, con un rendimiento reportado de 74,3 F1 medio en nueve benchmarks climáticos.

El modelo se distribuye en formato safetensors y es compatible con la librería `transformers` a partir de la versión 4.48, sin necesidad de `trust_remote_code`. Su licencia aún no ha sido fijada en el repositorio, por lo que conviene revisar los términos del modelo base antes de su redistribución.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (ModernBERT-Base) |
| Parametros totales | 149.655.232 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 8.192 tokens |
| Tipos de cuantizacion | No disponible (pesos en BF16/FP32; cuantizacion posterior posible con herramientas estandar) |
| Idiomas soportados | Ingles |
| Licencia | No disponible (pendiente de fijar por el autor; base bajo licencia Apache 2.0) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de ModernBERT-Base: un transformer encoder con 22 capas, dimensión oculta de 768, 12 cabezas de atención y un vocabulario de 50.368 subpalabras. No emplea mezcla de expertos ni mecanismos de atención lineal; se trata de un encoder denso estándar optimizado para eficiencia en GPU y CPU modernas. La tarea de entrenamiento es el enmascarado de lenguaje (MLM) con una tasa de máscara del 30%.

El entrenamiento se realizó en dos fases, siguiendo la receta de *continued pretraining* de ModernBERT. En la fase 1, que corresponde a este checkpoint, se usaron 3 épocas con learning rate constante de 3e-4, batch global de 576, secuencias de 8.192 tokens y el optimizador StableAdamW en precisión BF16. El corpus combinado suma 6,42 mil millones de tokens, distribuidos en: corpus académico (𝒜, ~1,28B tokens, artículos revisados por pares, archivo ClimateNews 2000-2022, preprints de arXiv y manuales climáticos), corpus web climático (ℱ, ~5B tokens, filtrado de FineWeb-Edu mediante un filtro de 166 términos y clasificador FastText) y un corpus sintético (𝒮, ~0,14B tokens, generado por LLM en tres estilos comunicativos). El entrenamiento se ejecutó en 4× NVIDIA A100 con MosaicML Composer, y el checkpoint final se convirtió al formato de Hugging Face Transformers.

## Capacidades

- Codificacion de texto climatico: representaciones contextuales de alta calidad para frases, parrafos y documentos completos de hasta 8.192 tokens.
- Fill-mask: prediccion de tokens enmascarados en texto climatico, util para tareas de analisis linguistico y preprocesado.
- Clasificacion de secuencias: tras un ajuste fino supervisado, el modelo sirve para clasificacion binaria, multi-clase y multi-etiqueta (p. ej., deteccion de compromisos climaticos, sentimiento, taxonomias).
- Recuperacion de informacion: apto para generar embeddings de documentos y consultas en pipelines de retrieval sobre literatura cientifica, politicas y divulgaciones corporativas.
- Compatibilidad con Transformers: integracion nativa con `AutoModel` y `AutoModelForSequenceClassification` desde la version 4.48.
- Multilingue: no, solo ingles.
- Tool calling / agentes: no, es un modelo enmascarado, no un LLM instructivo.

## Casos de uso

- Analisis de divulgaciones corporativas: el modelo puede ajustarse para extraer compromisos de reduccion de emisiones, objetivos Net Zero y recomendaciones TCFD de informes anuales y de sostenibilidad, gracias a su entrenamiento en corpus financiero-climatico y su contexto de 8.192 tokens.
- Clasificacion de noticias y articulos cientificos: permite etiquetar automaticamente si un texto trata sobre cambio climatico, su especificidad tematica y el sentimiento asociado, util para paneles de monitoreo mediatico.
- Recuperacion semantica en corpus de politicas: al generar embeddings densos, el modelo alimenta sistemas de busqueda por similitud sobre documentos legales y regulatorios, mejorando la precision frente a modelos generalistas.
- Deteccion de acciones y compromisos en acuerdos internacionales: fine-tuning para identificar frases que indican acciones concretas, compromisos vinculantes o declaraciones de intencion en textos de cumbres climaticas.
- Analisis de sentimiento climatico en redes sociales y foros: aunque el corpus principal es academico y web, el modelo puede adaptarse a textos cortos para medir opinion publica sobre politicas climaticas.
- Construccion de datasets etiquetados para investigacion: dado su papel como encoder, sirve para generar pseudoetiquetas o features para modelos aguas abajo en proyectos de NLP climatico.
- Evaluacion de informes de impacto ambiental: clasificacion multi-etiqueta de secciones de informes ambientales segun categorias como biodiversidad, agua, energia o residuos, con la ventaja de procesar documentos extensos en una sola pasada.

## Benchmarks y rendimiento

El autor reporta un rendimiento de **74,3 de F1 medio** sobre nueve benchmarks climaticos: Climate Detection, Climate Specificity, Commitments & Actions, Climate Sentiment, Net Zero & Reduction, TCFD Recommendations, WFB Nature, WXImpactBench y ClimRetrieve. Las tareas binarias y ClimRetrieve reportan F1 de clase positiva; las tareas multi-clase y multi-etiqueta reportan F1 macro. Las puntuaciones son la media sobre tres semillas de fine-tuning con una configuracion compartida de hiperparametros.

| Modelo | F1 medio (9 benchmarks) |
|---|---|
| CMB-ClimateModernBERT/A_F_CX | 74,3 |
| ModernBERT-Base (baseline estable) | 73,5 |
| ClimateBERT | 72,1 |

No se han publicado resultados detallados por benchmark individual en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 149,6M de parametros, el modelo ocupa aproximadamente 0,6 GB en FP32 y 0,3 GB en BF16/FP16. Incluso con una secuencia de 8.192 tokens, cabe en una GPU con 4 GB de VRAM.
- GPU recomendadas: cualquier GPU moderna con al menos 4 GB de VRAM (p. ej., NVIDIA GTX 1650, RTX 2060, RTX 3050) es suficiente. Para entrenamiento o fine-tuning con batch grande, se recomienda una GPU con 8-16 GB (RTX 3070, RTX 4080, A10, A100).
- Compatibilidad con GPU de consumo: si, es totalmente viable en GPUs de gama media e incluso en CPU para inferencia puntual.
- Opciones de despliegue: al ser un modelo de Transformers estandar, puede servirse con Hugging Face Inference Endpoints, vLLM (para tareas de embedding), o ejecutarse localmente con `pipeline`. No requiere infraestructura especial.
- Latencia y throughput estimados: no hay datos publicados. Como referencia, un encoder de 150M de parametros en una GPU moderna procesa cientos de secuencias cortas por segundo; para secuencias de 8K tokens, el throughput sera menor pero aun asi adecuado para tareas por lotes.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | F1 medio (clima) | Licencia | Formato |
|---|---|---|---|---|---|
| CMB-ClimateModernBERT/A_F_CX | 149,6M | 8.192 | 74,3 | No disponible | safetensors |
| ModernBERT-Base | 149,6M | 8.192 | 73,5 | Apache 2.0 | safetensors |
| ClimateBERT (DistilRoBERTa) | 82M | 512 | 72,1 | Apache 2.0 | safetensors |

La comparativa se basa en los datos reportados en la model card bajo el mismo protocolo de evaluacion. ModernBERT-Base es el modelo base sin adaptacion de dominio; ClimateBERT es un encoder climatico preexistente con contexto mucho menor. El modelo A_F_CX supera a ambos en F1 medio, aunque la diferencia con el baseline es modesta (+0,8 puntos). Para uso general, el autor recomienda el modelo fusionado `CMB-ClimateModernBERT/Merge_Soup_LRD`, que alcanza 76,3 de F1 medio.

## Limitaciones y advertencias

- Solo ingles: no soporta otros idiomas, lo que limita su aplicacion en contextos multilingues.
- Modelo enmascarado, no instructivo: no genera texto libre ni sigue instrucciones; su uso se limita a codificacion y tareas aguas abajo.
- Sin garantias factuales: como MLM, no produce afirmaciones calibradas sobre ciencia climatica; los resultados deben interpretarse con cautela.
- Datos sinteticos con efectos mixtos: el corpus sintetico ayuda en tareas basadas en taxonomias y marcos, pero degrada el rendimiento en tareas que requieren comprension fina de discurso y compromisos.
- Evaluacion limitada al nivel de frase o pasaje: los benchmarks actuales no ejercitan plenamente la capacidad de contexto largo de 8.192 tokens.
- Licencia no fijada: el repositorio no declara licencia; antes de redistribuir o usar comercialmente, hay que revisar los terminos del modelo base (ModernBERT-Base, Apache 2.0) y de los corpus subyacentes.
- Sin acceso a datos brutos: el corpus academico no se redistribuye; solo se publican los pipelines de procesamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/CMB-ClimateModernBERT/A_F_CX
- Repositorio original (sraj): https://huggingface.co/sraj/CMB_FWEdu_V2_FastTxt_MARK_CX
- Modelo base ModernBERT-Base: https://huggingface.co/answerdotai/ModernBERT-base
- Proyecto ClimateModernBERT: https://michaelyya.github.io/ClimateModernBERT/
- Codigo y pipelines: https://github.com/Michaelyya/ClimateModernBERT
- Catalogo de modelos: https://github.com/Michaelyya/ClimateModernBERT/blob/main/docs/model-inventory.md
- Guia de nomenclatura: https://github.com/Michaelyya/ClimateModernBERT/blob/main/docs/model-naming.md
- Coleccion de modelos ClimateModernBERT: https://huggingface.co/collections/sraj/climatemodernbert
