# CMB-ClimateModernBERT/F_CX_LRD

## Resumen

ClimateModernBERT F_CX_LRD es un modelo de lenguaje enmascarado (MLM) de dominio climático, obtenido mediante continuación del pretraining de ModernBERT-Base sobre un corpus especializado en clima. Lo desarrolla el proyecto ClimateModernBERT, una familia de codificadores orientados a tareas de procesamiento de lenguaje natural (PLN) climático, y este checkpoint concreto corresponde a la fase de especialización con decay de tasa de aprendizaje (LRD) sobre el corpus Climate Web, que combina un filtrado por palabras clave y un clasificador FastText sobre FineWeb-Edu.

El modelo resuelve el problema de la falta de representaciones semánticas especializadas para textos climáticos: informes corporativos, literatura científica, políticas públicas y noticias sobre clima. Con 149,7 millones de parámetros y una ventana de contexto de 8.192 tokens, ofrece una alternativa ligera y eficiente a modelos más grandes para tareas de clasificación, etiquetado multilabel y recuperación de información en este dominio.

Su relevancia actual radica en que aborda una cuestión metodológica clave: la composición del corpus de entrenamiento en la adaptación de dominio. El estudio asociado demuestra que la combinación de fuentes académicas, web filtrada y datos sintéticos tiene efectos diferenciados según la tarea, y este checkpoint en particular sirve como referencia para aislar la contribución del corpus web filtrado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (ModernBERT-Base) |
| Parametros totales | 149.655.232 |
| Parametros activos | no aplicable (no es MoE) |
| Longitud de contexto | 8.192 tokens |
| Tipos de cuantizacion | no disponible (pesos en BF16) |
| Idiomas soportados | ingles (en) |
| Licencia | no disponible (pendiente de fijar en el repositorio; el modelo base ModernBERT-Base tiene su propia licencia) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo mantiene la arquitectura ModernBERT-Base: un transformer encoder con 22 capas, dimension oculta de 768, 12 cabezas de atencion y un vocabulario de 50.368 subpalabras. ModernBERT incorpora mejoras sobre BERT clasico como atencion con padding local, normalizacion por capas rotada y un tokenizador mas eficiente, lo que permite contextos de 8.192 tokens con un coste computacional contenido.

El entrenamiento se realizo en dos fases siguiendo la receta de continuacion del pretraining de ModernBERT. La fase 1 consistio en 3 epocas de extension de contexto con tasa de aprendizaje constante de 3e-4, batch global de 576, longitud de secuencia de 8.192, masking MLM al 30% y el optimizador StableAdamW en BF16. La fase 2, que da nombre al sufijo LRD, aplico 3 epocas adicionales con un schedule de decay `1 - sqrt(t)` desde 3e-4 hasta un factor final de 1e-3. El entrenamiento se ejecuto en 4 GPU NVIDIA A100 con MosaicML Composer, y los checkpoints finales se convirtieron al formato de Hugging Face Transformers.

El corpus de entrenamiento proviene de un conjunto total de 6,42 mil millones de tokens. En concreto, este modelo se entreno exclusivamente sobre el subcorpus Climate Web (denotado como ℱ), que contiene aproximadamente 5 mil millones de tokens obtenidos de FineWeb-Edu filtrados por relevancia climatica mediante un filtro de 166 terminos y un clasificador FastText.

## Capacidades

- Codificacion de texto climatica: genera representaciones contextuales densas de 768 dimensiones especializadas en vocabulario y discurso sobre cambio climatico, emisiones, energia y sostenibilidad.
- Relleno de mascaras (fill-mask): al ser un MLM, puede predecir tokens enmascarados en contexto, util para evaluacion de coherencia linguistica y como modelo base para fine-tuning.
- Clasificacion de secuencias: tras fine-tuning, es adecuado para deteccion de menciones climaticas, analisis de sentimiento y clasificacion de compromisos y acciones.
- Etiquetado multilabel: soporta tareas como la clasificacion de recomendaciones TCFD o la asignacion de multiples categorias tematicas a fragmentos de texto.
- Recuperacion de informacion: sus embeddings pueden utilizarse para recuperacion semantica sobre documentos climatericos gracias a la ventana de contexto extendida de 8.192 tokens.
- Sin soporte de tool calling ni generacion autoregresiva: es un encoder, no un modelo generativo ni de instrucciones.

## Casos de uso

- Clasificacion de informes corporativos de sostenibilidad: el modelo puede fine-tuning para detectar si una empresa menciona compromisos de reduccion de emisiones, cumplimiento de recomendaciones TCFD o metas net-zero en sus memorias anuales, facilitando el analisis automatizado de divulgaciones ESG.
- Analisis de politicas publicas climaticas: permite clasificar y etiquetar fragmentos de legislacion, planes nacionales de energia y clima, o documentos de estrategia, ayudando a investigadores y organismos a mapear la evolucion de las politicas.
- Monitorizacion de noticias sobre clima: con su ventana de 8.192 tokens puede procesar articulos completos de prensa para detectar eventos climaticos, sentimiento o especificidad de la informacion, alimentando sistemas de alerta temprana o estudios de framing mediatico.
- Recuperacion semantica en corpus cientificos: sus embeddings permiten construir sistemas de busqueda sobre articulos de investigacion climatica, identificando documentos relevantes por similitud semantica en lugar de coincidencia de palabras clave.
- Deteccion de greenwashing: mediante fine-tuning para clasificacion de especificidad climatica, puede ayudar a distinguir declaraciones vagas de compromisos concretos y verificables en comunicaciones corporativas.
- Etiquetado de documentos para bases de datos climaticas: organizaciones que mantienen repositorios de literatura o jurisprudencia climatica pueden usar el modelo para asignar etiquetas tematicas automaticamente, reduciendo el trabajo manual de curaduria.

## Benchmarks y rendimiento

El checkpoint alcanza una media de F1 de 74,5 en nueve benchmarks de PLN climatico, segun el manuscrito del proyecto. La evaluacion incluye deteccion de clima, especificidad climatica, compromisos y acciones, sentimiento climatico, net-zero y reduccion, recomendaciones TCFD, WFB Nature, WXImpactBench y ClimRetrieve. Las tareas binarias y ClimRetrieve reportan F1 de clase positiva; las tareas multiclase y multilabel reportan macro-F1. Las puntuaciones son la media de tres semillas de fine-tuning bajo una configuracion de hiperparametros compartida.

| Benchmark | F1 (media) |
|---|---|
| Media de 9 benchmarks climaticos | 74,5 |
| Referencia: ModernBERT-Base (baseline) | 73,5 |
| Referencia: ClimateBERT | 72,1 |

Para uso general, el proyecto recomienda el checkpoint fusionado `CMB-ClimateModernBERT/Merge_Soup_LRD`, que alcanza 76,3 de F1 medio.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita, pero un modelo de 150M parametros en BF16 ocupa aproximadamente 300 MB en pesos, por lo que cabe en cualquier GPU consumer con 4 GB o mas.
- GPU recomendadas: cualquier GPU moderna con al menos 4-6 GB de VRAM es suficiente para inferencia y fine-tuning en lotes pequenos. El entrenamiento original uso 4x NVIDIA A100.
- Compatibilidad con GPU consumer: si, el modelo es ligero y puede ejecutarse en RTX 3060, RTX 4060, RTX 4090 o incluso en CPU para inferencia puntual.
- Opciones de despliegue: al ser un modelo transformers estandar, se puede servir con Hugging Face Transformers, y es compatible con endpoints de inferencia. Para produccion, puede usarse con FastAPI o servicios de inference server compatibles con transformers.
- Latencia y throughput: no disponibles; al ser un encoder de 150M parametros, la latencia por secuencia de 512 tokens deberia ser de decenas de milisegundos en GPU moderna, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | F1 medio (9 benchmarks clima) | Licencia | Notas |
|---|---|---|---|---|---|
| ClimateModernBERT F_CX_LRD | 149,7M | 8.192 | 74,5 | no disponible | Especializado en corpus web filtrado |
| ClimateModernBERT Merge_Soup_LRD | 149,7M | 8.192 | 76,3 | no disponible | Fusion de checkpoints, recomendado para uso general |
| ModernBERT-Base | 149,7M | 8.192 | 73,5 | Apache 2.0 | Modelo base sin adaptacion de dominio |
| ClimateBERT | 110M | 512 | 72,1 | MIT | Adaptacion de BERT a dominio climatico, contexto limitado |

La comparativa muestra que la adaptacion de dominio aporta una mejora modesta pero consistente sobre el baseline generalista, y que el contexto extendido de ModernBERT es una ventaja frente a ClimateBERT.

## Limitaciones y advertencias

- Solo soporta ingles: no es util para textos climaticos en otros idiomas sin un proceso de adaptacion adicional.
- Es un modelo enmascarado, no un sistema de instrucciones: no genera texto ni sigue prompts, y no produce garantias factuales calibradas sobre ciencia climatica.
- Riesgo de alucinacion no aplicable en generacion, pero si en clasificacion: las predicciones de clasificacion pueden ser incorrectas en textos ambiguos o con vocabulario novedoso.
- Los benchmarks actuales de PLN climatico operan mayoritariamente a nivel de frase o parrafo, por lo que la capacidad de contexto largo no se ha evaluado plenamente en las metricas reportadas.
- Los datos sinteticos del corpus tienen efectos dependientes de la tarea: ayudan en tareas basadas en taxonomias y frameworks, pero degradan el rendimiento en tareas que requieren comprension de discurso fino y compromisos.
- La licencia no esta fijada en el repositorio: antes de redistribuir, hay que revisar los terminos del modelo base ModernBERT-Base y los de los corpus subyacentes. El texto academico original no se redistribuye.
- Los hallazgos sobre composicion de corpus estan demostrados dentro del ambito del PLN climatico y no deben generalizarse como principios universales de adaptacion de dominio.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/CMB-ClimateModernBERT/F_CX_LRD
- Repositorio original (pesos identicos): https://huggingface.co/sraj/CMB_FWEdu_V2_FastTxt_CX_LRD
- Coleccion ClimateModernBERT: https://huggingface.co/collections/sraj/climatemodernbert
- Modelo recomendado para uso general (Merge_Soup_LRD): https://huggingface.co/CMB-ClimateModernBERT/Merge_Soup_LRD
- Pagina del proyecto: https://michaelyya.github.io/ClimateModernBERT/
- Codigo y pipelines: https://github.com/Michaelyya/ClimateModernBERT
- Inventario completo de modelos: https://github.com/Michaelyya/ClimateModernBERT/blob/main/docs/model-inventory.md
- Guia de nomenclatura: https://github.com/Michaelyya/ClimateModernBERT/blob/main/docs/model-naming.md
