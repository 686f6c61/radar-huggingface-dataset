# CMB-ClimateModernBERT/A_S_CX

## Resumen

ClimateModernBERT A_S_CX es un codificador de lenguaje especializado en el dominio climático, desarrollado por el proyecto ClimateModernBERT mediante continuación del pretraining de ModernBERT-Base sobre un corpus de 6,42 mil millones de tokens de texto climático. El modelo está pensado para la investigación en procesamiento de lenguaje natural aplicado al clima: codificación de texto científico, clasificación de divulgaciones corporativas, análisis de políticas y recuperación de información en literatura especializada.

Con 149,6 millones de parámetros y una ventana de contexto de 8.192 tokens, este checkpoint corresponde a la Fase 1 del entrenamiento (extensión de contexto) sobre los subcorpus académico y sintético, y alcanza una puntuación media de F1 de 74,8 en nueve benchmarks climáticos. Su relevancia actual radica en que ofrece una alternativa de código abierto y eficiente para tareas de NLP climático, con un rendimiento superior al de ClimateBERT y al propio ModernBERT-Base bajo el mismo protocolo de evaluación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (ModernBERT) |
| Parametros totales | 149.655.232 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 8.192 tokens |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (ingles) |
| Licencia | no disponible (pendiente de fijar; el modelo base ModernBERT-Base tiene sus propios terminos) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en ModernBERT-Base, un codificador transformer con 22 capas, dimension oculta de 768, 12 cabezas de atencion y un vocabulario de 50.368 subpalabras. La arquitectura incorpora las mejoras de ModernBERT: atencion con ventana deslizante y atencion global, normalizacion pre-RMSNorm y embeddings rotatorios. En esta fase de continuacion del pretraining, el modelo se entrena con enmascaramiento de lenguaje (MLM) al 30%, tamaño de lote global de 576, longitud de secuencia de 8.192 tokens y optimizador StableAdamW en precision BF16, durante 3 epocas con tasa de aprendizaje constante de 3e-4.

Los datos de entrenamiento combinan el subcorpus academico (aproximadamente 1,28 mil millones de tokens de articulos de revistas revisadas por pares, archivos de ClimateNews 2000-2022, preprints de arXiv sobre clima y manuales de referencia) y el subcorpus sintetico (alrededor de 0,14 mil millones de tokens generados por LLM condicionados a fragmentos de texto del dominio, en tres estilos de comunicacion). El texto academico original no se redistribuye; solo se publican los pipelines de procesamiento. El entrenamiento se realizo en 4 GPU NVIDIA A100 con MosaicML Composer, y los checkpoints finales se convirtieron al formato de Hugging Face Transformers.

## Capacidades

- Enmascaramiento de lenguaje (fill-mask) sobre texto climatico, con representaciones contextuales de 768 dimensiones.
- Codificacion de secuencias de hasta 8.192 tokens, adecuada para documentos largos o secciones extensas de informes.
- Fine-tuning para clasificacion de secuencias, clasificacion multi-etiqueta y tareas de recuperacion (retrieval) sobre texto climatico.
- Soporte nativo de Transformers desde la version 4.48, sin necesidad de `trust_remote_code`.
- Capacidad multilingue limitada: entrenado exclusivamente en ingles.
- No es un modelo de instrucciones ni de generacion; no produce texto ni sigue prompts conversacionales.

## Casos de uso

- Analisis de divulgaciones corporativas sobre clima: el modelo puede afinarse para clasificar informes de sostenibilidad y detectar compromisos de reduccion de emisiones, gracias a su entrenamiento en texto academico y sintetico del dominio.
- Clasificacion de documentos de politica climatica: permite etiquetar automaticamente propuestas legislativas, planes nacionales de adaptacion y documentos de estrategia en categorias como mitigacion, adaptacion o financiacion.
- Recuperacion de literatura cientifica: al codificar pasajes de articulos academicos, puede integrarse en sistemas de busqueda semantica para identificar estudios relevantes sobre un tema climatico concreto.
- Deteccion de sentimiento y especificidad en noticias sobre clima: el checkpoint alcanza resultados solidos en benchmarks como Climate Sentiment y Climate Specificity, por lo que es util para monitorizar cobertura mediatica.
- Cumplimiento normativo y reportes TCFD: puede afinarse para extraer recomendaciones de la Task Force on Climate-related Financial Disclosures en memorias anuales y documentos financieros.
- Investigacion en NLP climatico: sirve como modelo base para experimentos de adaptacion de dominio, comparacion de estrategias de corpus y estudio de efectos de datos sinteticos en tareas de clasificacion.

## Benchmarks y rendimiento

El modelo reporta una puntuacion media de F1 de 74,8 en nueve benchmarks climaticos, bajo un protocolo de tres semillas de fine-tuning con una configuracion de hiperparametros compartida. Los benchmarks incluyen Climate Detection, Climate Specificity, Commitments & Actions, Climate Sentiment, Net Zero & Reduction, TCFD Recommendations, WFB Nature, WXImpactBench y ClimRetrieve. Las tareas binarias y ClimRetrieve reportan F1 de la clase positiva; las tareas multi-clase y multi-etiqueta reportan macro-F1.

| Modelo | F1 medio |
|---|---|
| ClimateModernBERT A_S_CX (este modelo) | 74,8 |
| ModernBERT-Base (linea base estable) | 73,5 |
| ClimateBERT | 72,1 |

Para uso general, los autores recomiendan el checkpoint fusionado `CMB-ClimateModernBERT/Merge_Soup_LRD`, que alcanza 76,3 de F1 medio.

## Requisitos de hardware

- VRAM estimada para inferencia: al tratarse de un modelo de 149 millones de parametros, en precision FP16 ocupa aproximadamente 300 MB de pesos, por lo que la inferencia en lotes pequenos cabe en cualquier GPU con al menos 2 GB de VRAM.
- GPU recomendadas: cualquier GPU consumer moderna (NVIDIA RTX 3060 o superior) es suficiente para fine-tuning con lotes pequenos; para entrenamiento completo se usaron 4x NVIDIA A100.
- Compatibilidad con GPUs consumer: si, el modelo cabe sin problemas en GPUs de 8 GB o mas.
- Opciones de despliegue: al ser un modelo de Transformers estandar, puede servirse con bibliotecas como vLLM, TGI o Hugging Face Inference Endpoints, asi como exportarse a ONNX para inferencia optimizada.
- Latencia y throughput: no se han publicado mediciones especificas; para un modelo de este tamano, la latencia tipica en GPU consumer es del orden de milisegundos por secuencia corta.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | F1 medio (clima) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ClimateModernBERT A_S_CX | 149,6 M | 8.192 | 74,8 | no disponible | Hugging Face |
| ModernBERT-Base | 149 M | 8.192 | 73,5 | Apache 2.0 (segun el modelo base) | Hugging Face |
| ClimateBERT | 110 M | 512 | 72,1 | MIT (segun versiones) | Hugging Face |

ClimateModernBERT supera a ambos modelos de referencia en los benchmarks climaticos, manteniendo un tamano similar al de ModernBERT-Base. Su principal diferencia frente a ClimateBERT es la ventana de contexto mucho mayor (8.192 frente a 512 tokens) y el uso de la arquitectura ModernBERT, mas moderna y eficiente.

## Limitaciones y advertencias

- Modelo exclusivamente en ingles; no soporta otros idiomas.
- Es un modelo de lenguaje enmascarado, no un sistema de instrucciones: no genera texto ni mantiene conversaciones.
- Los datos sinteticos tienen efectos dependientes de la tarea: mejoran tareas basadas en taxonomias y marcos, pero degradan tareas que requieren comprension de discurso fino y compromisos.
- No produce garantias factuales calibradas sobre ciencia del clima; su uso es para investigacion y no debe tomarse como fuente de verdad.
- La licencia del repositorio no esta fijada; conviene revisar los terminos del modelo base ModernBERT-Base antes de uso comercial.
- Los benchmarks publicados trabajan principalmente a nivel de frase o pasaje; la capacidad de contexto largo no se evalua completamente en los resultados reportados.
- Los hallazgos sobre composicion de corpus se limitan al ambito del NLP climatico y no deben generalizarse a otros dominios.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/CMB-ClimateModernBERT/A_S_CX
- Repositorio original (pesos identicos): https://huggingface.co/sraj/CMB_MARK_WX_SYN_ZYDA_CX
- Coleccion de checkpoints: https://huggingface.co/collections/sraj/climatemodernbert
- Proyecto web: https://michaelyya.github.io/ClimateModernBERT/
- Codigo y pipelines: https://github.com/Michaelyya/ClimateModernBERT
- Catalogo completo de modelos: https://github.com/Michaelyya/ClimateModernBERT/blob/main/docs/model-inventory.md
- Guia de nomenclatura: https://github.com/Michaelyya/ClimateModernBERT/blob/main/docs/model-naming.md
- Modelo base ModernBERT-Base: https://huggingface.co/answerdotai/ModernBERT-base
