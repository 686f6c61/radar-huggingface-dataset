# CMB-ClimateModernBERT/Merge_DARE_D05_LRD

## Resumen

ClimateModernBERT es una familia de codificadores de dominio climático obtenidos mediante entrenamiento continuado (continued pretraining) de ModernBERT-Base sobre un corpus especializado de 6,42 mil millones de tokens. El checkpoint `Merge_DARE_D05_LRD` es un modelo fusionado mediante el método DARE-TIES con una tasa de descarte (drop ratio) de 0,5, que combina tres variantes entrenadas por separado sobre corpus académico, web climática y datos sintéticos. El objetivo es mejorar la representación de textos científicos y corporativos relacionados con el clima, superando a los modelos generalistas en tareas de clasificación, etiquetado y recuperación de información.

El modelo mantiene la arquitectura de ModernBERT-Base (149,6 millones de parámetros, 22 capas, contexto de 8 192 tokens) y se publica como un modelo de lenguaje enmascarado (fill-mask), no generativo. Según los datos de la model card, alcanza un promedio de F1 de 74,7 en nueve benchmarks de NLP climático, frente al 73,5 de ModernBERT-Base y el 72,1 de ClimateBERT bajo el mismo protocolo de evaluación. Está orientado a investigación y aplicaciones de procesamiento de lenguaje natural en el dominio climático, como análisis de informes corporativos, políticas públicas y literatura científica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (ModernBERT), 22 capas, hidden 768, 12 cabezas |
| Parametros totales | 149 655 232 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 8 192 tokens |
| Tipos de cuantizacion | No disponible (el repositorio solo contiene pesos en safetensors de precision completa) |
| Idiomas soportados | Ingles |
| Licencia | No disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en ModernBERT-Base, un codificador transformer optimizado para eficiencia y longitud de contexto. No es un modelo de mezcla de expertos (MoE); es un modelo denso de 150 millones de parametros. La arquitectura emplea atencion de ventana deslizante y atencion global intercalada, junto con mecanismos de padding y masking eficientes, lo que permite procesar secuencias de hasta 8 192 tokens con un coste computacional moderado.

El entrenamiento se realizo en dos fases sobre un corpus climático de 6,42 mil millones de tokens:
- **Fase 1 (extension de contexto):** 3 epocas con tasa de aprendizaje constante de 3e-4, batch global de 576, longitud de secuencia de 8 192, enmascaramiento MLM del 30 %, optimizador StableAdamW y precision BF16.
- **Fase 2 (especializacion LRD):** 3 epocas adicionales con un programa de decrecimiento `1 - √t` desde LR 3e-4 y factor final de 1e-3.

El corpus se compone de tres subconjuntos: textos academicos (≈1,28 B tokens, articulos revisados por pares, noticias climáticas de ClimateNews 2000-2022, preprints de arXiv y manuales), web climática (≈5 B tokens, filtrada de FineWeb-Edu con un filtro de 166 terminos y un clasificador FastText) y datos sinteticos (≈0,14 B tokens, generados por LLM a partir de fragmentos del dominio en tres estilos comunicativos). El entrenamiento se realizo con 4 GPU NVIDIA A100 usando MosaicML Composer, y los checkpoints finales se convirtieron al formato HuggingFace Transformers.

La fusion se realizo con mergekit usando el metodo DARE-TIES con un drop ratio de 0,5, combinando tres modelos especializados: `A_CX_LRD` (academico), `S_CX_LRD` (sintetico) y `CMB_FWEdu_V2_CX_LRD` (web climatica). Los pesos son identicos al repositorio original `sraj/DARE_TIES_D05_CMB_MARK_CX_LRD_CMB_FWEdu_V2_CX_LRD_CMB_WX_SYN_CX_LRD`.

## Capacidades

- Codificacion de texto enmascarado (fill-mask) para generar representaciones contextuales de alta calidad en el dominio climatico.
- Extraccion de embeddings de secuencias completas (hasta 8 192 tokens) para tareas de clasificacion, etiquetado multiple y recuperacion semantica.
- Fine-tuning eficiente para clasificacion de secuencias mediante `AutoModelForSequenceClassification` (la receta del paper usa LR 4e-5, batch efectivo 64, weight decay 0,01, hasta 10 epocas con early stopping).
- Soporte nativo de Transformers desde la version 4.48, sin necesidad de `trust_remote_code`.
- Capacidad multilingue: no, solo ingles.
- No soporta generacion de texto libre ni instrucciones conversacionales (es un modelo MLM, no un LLM autoregresivo).
- Sin capacidades de vision ni audio.

## Casos de uso

- **Deteccion de menciones climaticas en textos corporativos:** el modelo puede clasificar si un parrafo de un informe anual o una comunicacion de sostenibilidad contiene informacion relevante sobre cambio climatico, gracias a su entrenamiento en web corporativa y textos academicos.
- **Analisis de compromisos y acciones climáticas:** permite identificar si una empresa declara objetivos de reduccion de emisiones (net zero, reducciones absolutas) y clasificar el tipo de compromiso, una tarea habitual en analisis de inversiones ESG.
- **Etiquetado multiple de documentos de politica climatica:** se puede fine-tunear para asignar multiples etiquetas (por ejemplo, recomendaciones TCFD, categorias de naturaleza WFB) a informes de divulgacion financiera y documentos regulatorios.
- **Recuperacion de literatura cientifica:** dado su entrenamiento en articulos academicos y preprints, sirve como backbone para sistemas de retrieval sobre corpus de investigacion climatica, aprovechando su contexto de 8 192 tokens para consultas largas.
- **Analisis de sentimiento en noticias climaticas:** puede adaptarse para clasificar el tono de articulos de prensa del archivo ClimateNews, util para estudios de opinion publica y seguimiento mediatico.
- **Sistemas de monitorizacion de divulgaciones corporativas:** integrado en pipelines de procesamiento de documentos, permite extraer y estructurar automaticamente las secciones climáticas de informes anuales, reduciendo el trabajo manual de analistas.

## Benchmarks y rendimiento

La model card reporta un promedio de F1 de **74,7** sobre nueve benchmarks de NLP climático (Climate Detection, Climate Specificity, Commitments & Actions, Climate Sentiment, Net Zero & Reduction, TCFD Recommendations, WFB Nature, WXImpactBench y ClimRetrieve). Las tareas binarias y ClimRetrieve reportan F1 de clase positiva; las tareas multiclase y multi-etiqueta reportan macro-F1. Las puntuaciones son la media de tres semillas de fine-tuning bajo una configuracion de hiperparametros compartida.

| Modelo | Promedio F1 (9 benchmarks) |
|---|---|
| Merge_DARE_D05_LRD (este modelo) | 74,7 |
| ModernBERT-Base (baseline) | 73,5 |
| ClimateBERT | 72,1 |

No se han publicado resultados desglosados por benchmark en la informacion disponible.

## Requisitos de hardware

- **VRAM estimada para inferencia:** con 149,6 millones de parametros, en precision FP32 el peso ocupa ≈600 MB; en FP16 ≈300 MB. Con el tokenizador y activaciones para secuencias de 8 192 tokens, se recomienda al menos 2 GB de VRAM para inferencia comoda.
- **GPU recomendadas:** cabe en cualquier GPU consumer moderna (RTX 3060, RTX 4060, etc.) y en GPUs de datacenter como A100 o H100 sin problemas.
- **Compatibilidad con consumer GPU:** sí, ampliamente compatible. Incluso en CPU es viable para inferencia por lotes pequenos.
- **Opciones de despliegue:** al ser un modelo de Transformers, puede servirse con HuggingFace Inference Endpoints, TGI (para embeddings), vLLM (soporta encoders para clasificacion), o exportarse a ONNX para inferencia en CPU/GPU ligera. No es compatible con llama.cpp (orientado a modelos generativos).
- **Latencia y throughput:** no se han publicado mediciones especificas. Para un modelo de este tamano, la latencia tipica en GPU consumer es de pocos milisegundos por secuencia de longitud media (256-512 tokens).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Promedio F1 (clima) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| **Merge_DARE_D05_LRD** | 149,6 M | 8 192 | 74,7 | No disponible | HuggingFace |
| ModernBERT-Base | 149,6 M | 8 192 | 73,5 | Apache 2.0 | HuggingFace |
| ClimateBERT (RoBERTa) | 125 M | 512 | 72,1 | MIT | HuggingFace |

El modelo supera a sus dos alternativas principales en el promedio de benchmarks climáticos, aunque con una ventaja modesta sobre ModernBERT-Base. ClimateBERT tiene un contexto mucho menor (512 tokens) y una arquitectura mas antigua (RoBERTa). La licencia no disponible del modelo fusionado es una desventaja frente a las alternativas con licencias permisivas.

## Limitaciones y advertencias

- **Idioma:** solo ingles. No es util para textos en otros idiomas sin un proceso de adaptacion adicional.
- **Tipo de modelo:** es un modelo de lenguaje enmascarado (MLM), no un sistema de instrucciones ni un generador de texto. No produce respuestas coherentes a preguntas ni sigue prompts conversacionales.
- **Sesgos del corpus:** los datos de entrenamiento provienen de fuentes academicas, web filtrada y datos sinteticos, lo que puede introducir sesgos geograficos, tematicos o de estilo. Los textos academicos estan principalmente en ingles y pueden reflejar sesgos de publicacion.
- **Efectos de los datos sinteticos:** la model card advierte que los datos sinteticos ayudan en tareas basadas en taxonomias y marcos, pero degradan el rendimiento en tareas que requieren comprension de discurso fino y de compromisos complejos.
- **Alucinacion:** al ser un modelo de representacion, no genera texto, por lo que el riesgo de alucinacion es irrelevante en inferencia directa. Sin embargo, si se usa como base para sistemas generativos (no recomendado), podria heredar sesgos.
- **Licencia:** la licencia no esta especificada, lo que impide un uso comercial seguro sin aclaracion por parte del autor.
- **Evaluacion limitada:** los benchmarks actuales de NLP climatico son mayoritariamente a nivel de frase o pasaje, por lo que la capacidad de contexto largo (8 192 tokens) no esta completamente validada en las metricas reportadas.
- **Mapeo del paper bajo revision:** la correspondencia de este checkpoint con una configuracion concreta del manuscrito no esta completamente resuelta, segun la propia model card.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/CMB-ClimateModernBERT/Merge_DARE_D05_LRD
- Repositorio original con pesos identicos: https://huggingface.co/sraj/DARE_TIES_D05_CMB_MARK_CX_LRD_CMB_FWEdu_V2_CX_LRD_CMB_WX_SYN_CX_LRD
- Modelo base: https://huggingface.co/answerdotai/ModernBERT-base
- Modelo preferido (Merge_Soup_LRD): https://huggingface.co/CMB-ClimateModernBERT/Merge_Soup_LRD
- Coleccion de modelos ClimateModernBERT: https://huggingface.co/collections/sraj/climatemodernbert
- Coleccion de modelos fusionados: https://huggingface.co/collections/sraj/merged-cmb
- Documentacion de naming (GitHub): https://github.com/Michaelyya/ClimateModernBERT/blob/main/docs/model-naming.md
- Herramienta de fusion mergekit: https://github.com/arcee-ai/mergekit
- Documentacion de metodos de fusion: https://github.com/arcee-ai/mergekit/blob/main/docs/merge_methods.md
- Paper (preprint): "Climate-ModernBERT: Revisiting Corpus Composition for Domain-Adaptive Continued Pretraining" (sin enlace directo en la informacion proporcionada)
