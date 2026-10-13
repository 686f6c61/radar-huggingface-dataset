# c-ho/2026-10-13-xlmr-large-baseline_2_3

## Resumen

c-ho/2026-10-13-xlmr-large-baseline_2_3 es un modelo de clasificación de tokens (token-classification) publicado en HuggingFace por el usuario c-ho. Se trata de un ajuste fino completo —no un adaptador— de FacebookAI/xlm-roberta-large, un transformer encoder-only de 558.874.657 parámetros confirmados en los pesos safetensors, entrenado sobre un conjunto de datos que la propia model card describe como desconocido ("unknown dataset").

Aunque la documentación no especifica el dominio, el conjunto de etiquetas evaluadas (morphosyntacticphenomenon, phonologicalphenomenon, languagerelatedterm, semanticphenomenon, discoursephenomenon, etc.) corresponde a un esquema de anotación de fenómenos lingüísticos y terminología, típico de corpus académicos o de investigación en lingüística. El modelo declara un F1 de 0,5305 y una exactitud de 0,9512 en el conjunto de evaluación, con un rendimiento muy desigual entre clases.

Su interés práctico es doble: por un lado, es una línea base reproducible (semilla 42, hiperparámetros y curva de entrenamiento publicados) para tareas de etiquetado de conceptos lingüísticos; por otro, la licencia MIT permite reutilizarlo en entornos comerciales. La utilidad real queda limitada por la ausencia total de documentación sobre datos, idiomas y dominio, y por varias clases con F1 cercano a cero.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-only de la familia RoBERTa con cabezal de clasificacion de tokens; modelo base FacebookAI/xlm-roberta-large |
| Parametros totales | 558.874.657 (dato real de los pesos safetensors) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | 512 tokens (limite del transformer base; la model card no documenta otra configuracion) |
| Tipos de cuantizacion | no disponible; el repositorio solo publica pesos safetensors en precision completa |
| Idiomas soportados | no disponible en la model card; el modelo base es multilingue, pero no se documenta el idioma de los datos de ajuste fino |
| Licencia | MIT |
| Formato de pesos | safetensors (libreria transformers) |
| Tarea | token-classification |
| Numero de clases evaluadas | 16 (academicdiscipline, ambiguouslydefinedconcept, discoursephenomenon, graphemicphenomenon, languagerelatedterm, languageresourceinformation, lexicalphenomenon, morphologicalphenomenon, morphosyntacticphenomenon, new tag, otherlinguisticterm, phonologicalphenomenon, semanticphenomenon, syntacticphenomenon, topnode dummy, unclassifiedlinguisticconcept) |
| Tamano del repositorio | 22,4 GB |
| Descargas / likes | 18 / 0 (en el momento de la consulta) |
| Fecha de creacion | 2026-10-13 |

## Arquitectura y entrenamiento

La base es XLM-RoBERTa-large, un transformer encoder-only con 24 capas, dimension oculta de 1024, 16 cabezas de atencion y vocabulario multilingue de 250.000 tokens, preentrenado de forma multilingue. Sobre esa base se ha anadido un cabezal de clasificacion de tokens y se ha reentrenado el modelo completo; el resultado son 558.874.657 parametros, coherentes con el tamano del modelo base sin cambios estructurales. No hay ninguna innovacion de arquitectura propia: no hay decodificacion especulativa, atencion lineal ni mecanismos hıbridos, y al ser un modelo discriminativo no genera texto.

El ajuste fino se realizo con los siguientes hiperparametros declarados: learning rate 3e-05 con scheduler lineal y warmup del 10 %, batch de entrenamiento y evaluacion de 8 con 8 pasos de acumulacion de gradiente (batch efectivo de 64), optimizador adamw_torch con betas (0,9; 0,999) y epsilon 1e-08, semilla 42, 10 epocas y precision mixta nativa (Native AMP). La tabla de progreso registra 260 pasos por epoca, lo que implica aproximadamente 16.640 ejemplos por epoca (dato derivado, no declarado explicitamente). No se documenta la composicion del dataset, su tamano total, los idiomas ni si hubo etapas de RLHF o DPO, algo que en un modelo discriminativo de este tipo no seria esperable en cualquier caso.

## Capacidades

- Etiquetado de secuencias a nivel de token: asigna una de las 16 clases de fenomeno linguistico a cada token de la entrada.
- Anotacion de terminologia y conceptos linguisticos en textos academicos, segun el esquema de etiquetas evaluado.
- Diferenciacion entre clases mayoritarias con buen rendimiento: morphosyntacticphenomenon (F1 0,7315), languagerelatedterm (F1 0,7249) y phonologicalphenomenon (F1 0,6934).
- Procesamiento de secuencias de hasta 512 tokens por inferencia.
- Capacidad multilingue potencial heredada del modelo base, no confirmada por la model card.
- No soporta generacion de texto, razonamiento generativo, codigo ni matematicas (es un encoder discriminativo).
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No dispone de modo thinking, vision, audio ni ninguna capacidad multimodal.

## Casos de uso

- Pre-anotacion de corpus linguisticos: el modelo puede etiquetar automaticamente fenomenos morfosintacticos, fonologicos y lexicos en grandes volumenes de texto, reduciendo el trabajo de anotadores humanos que despues revisan y corrigen. Es adecuado para las clases con F1 superior a 0,7, no para las clases con F1 bajo.
- Enriquecimiento de repositorios academicos: aplicar el modelo a articulos y tesis de linguistica para poblar indices tematicos por tipo de fenomeno linguistico, permitiendo busquedas facetadas por categoria.
- Extraccion de terminologia para glosarios y tesauros: identificar terminos linguisticos y su categoria en textos cientificos, como paso previo a la construccion de un tesauro o glosario especializado.
- Human-in-the-loop para anotacion supervisada: integrar el modelo en una herramienta de anotacion (por ejemplo, Label Studio o INCEpTION) como preanotador, de modo que los anotadores solo validen las predicciones de alta confianza.
- Filtrado y clasificacion de contenido educativo: en plataformas de e-learning de linguistica, clasificar materiales segun los fenomenos linguisticos que tratan para recomendar contenidos o generar rutas de aprendizaje.
- Limpieza y normalizacion de datos de entrenamiento: usar el etiquetado para detectar y separar fragmentos con terminologia tecnica antes de entrenar otros modelos, evitando que ruido terminologico contamine corpus generalistas.
- Analisis cuantitativo para investigacion: medir la distribucion de fenomenos linguisticos en un corpus (por ejemplo, proporcion de fenomenos fonologicos frente a semanticos) para estudios diacronicos o comparativos entre subcorpus.
- Anonimizacion y control de calidad en pipelines NLP: descartar automaticamente documentos cuyo contenido no encaje en el esquema esperado antes de pasarlos a etapas posteriores del pipeline.

## Benchmarks y rendimiento

El campo model-index de la model card contiene un array de resultados vacio, por lo que no hay benchmarks comparables declarados. Los unicos datos disponibles son las metricas de evaluacion del propio autor sobre su conjunto de validacion, que se reproducen tal cual:

| Metrica | Valor |
|---|---|
| Loss | 0,3091 |
| Precision | 0,5717 |
| Recall | 0,4948 |
| F1 | 0,5305 |
| Accuracy | 0,9512 |

Desglose por clase (F1 declarado):

| Clase | F1 |
|---|---|
| morphosyntacticphenomenon | 0,7315 |
| languagerelatedterm | 0,7249 |
| phonologicalphenomenon | 0,6934 |
| syntacticphenomenon | 0,6200 |
| morphologicalphenomenon | 0,5714 |
| otherlinguisticterm | 0,5151 |
| new tag | 0,4504 |
| lexicalphenomenon | 0,4426 |
| unclassifiedlinguisticconcept | 0,3846 |
| academicdiscipline | 0,3478 |
| topnode dummy | 0,3231 |
| languageresourceinformation | 0,3117 |
| discoursephenomenon | 0,2143 |
| semanticphenomenon | 0,1593 |
| graphemicphenomenon | 0,1429 |
| ambiguouslydefinedconcept | 0,0580 |

Progreso durante el entrenamiento (filas disponibles en la model card):

| Epoca | Paso | Loss validacion | Precision | Recall | F1 | Accuracy |
|---|---|---|---|---|---|---|
| 1 | 260 | 0,2062 | 0,4511 | 0,2930 | 0,3553 | 0,9408 |
| 2 | 520 | 0,2048 | 0,4270 | 0,5307 | 0,4732 | 0,9389 |
| 3 | 780 | 0,2081 | 0,5163 | 0,4562 | 0,4844 | 0,9472 |
| 4 | 1040 | 0,2054 | 0,5159 | 0,4881 | 0,5016 | 0,9471 |
| 5 | 1300 | 0,2171 | 0,5528 | 0,4892 | 0,5190 | 0,9496 |
| 6 | 1560 | 0,2467 | 0,5270 | 0,4755 | 0,4999 | 0,9481 |

El resultado final declarado (loss 0,3091) no coincide con la ultima fila de la tabla de progreso, que corresponde a la epoca 6; se reproduce tal cual aparece en la model card, sin poder verificar a que checkpoint corresponde.

## Requisitos de hardware

- VRAM estimada para inferencia: unos 2,5-3 GB en fp32 (pesos de 2,24 GB) y alrededor de 1,5-2 GB en fp16; en int8 bajaría a menos de 1 GB, aunque no hay pesos cuantizados publicados.
- GPU recomendadas: cualquier GPU con 4 GB o mas de VRAM es suficiente. Son validas una T4, una GTX 1650, una RTX 3060, una RTX 4090 o una A100; las GPU de gama alta solo aportan mayor throughput en lotes grandes.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU de consumo de los ultimos ocho anos con 4 GB o mas de VRAM, y tambien en CPU para volumenes moderados.
- Opciones de despliegue: transformers con el pipeline token-classification, exportacion a ONNX mediante Optimum y ejecucion con ONNX Runtime, TorchScript, NVIDIA Triton o un servicio propio con FastAPI. El modelo esta marcado como endpoints_compatible. llama.cpp y Ollama no son la via natural, al tratarse de un encoder discriminativo y no de un modelo generativo.
- Latencia y throughput: no disponible. No hay mediciones publicadas en la model card.
- Nota de almacenamiento: el repositorio ocupa 22,4 GB, un tamano muy superior a los 2,24 GB de los pesos, lo que sugiere que incluye checkpoints intermedios de las 10 epocas; conviene descargar solo los ficheros necesarios.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Rendimiento en esta tarea |
|---|---|---|---|---|---|
| c-ho/2026-10-13-xlmr-large-baseline_2_3 | 558,9 M | 512 tokens | Clasificacion de tokens (16 clases) | MIT | F1 0,5305 / accuracy 0,9512 (declarado por el autor) |
| FacebookAI/xlm-roberta-large (modelo base) | 558,9 M | 512 tokens | Preentrenamiento multilingue; requiere cabezal | MIT | No evaluado en esta tarea |
| FacebookAI/xlm-roberta-base | 278 M | 512 tokens | Preentrenamiento multilingue | MIT | No evaluado en esta tarea |
| microsoft/mdeberta-v3-base | 279 M | 512 tokens | Preentrenamiento multilingue | MIT | No evaluado en esta tarea |

No hay datos publicos que permitan comparar el rendimiento de este ajuste fino con alternativas sobre el mismo conjunto de evaluacion, ya que el dataset no esta documentado y el model-index esta vacio. La comparacion se limita, por tanto, a tamano, contexto y licencia.

## Limitaciones y advertencias

- Datos de entrenamiento desconocidos: la model card indica "unknown dataset" y deja como "More information needed" las secciones de descripcion, usos previstos y datos. No es posible evaluar sesgos, cobertura de dominios ni fuga de datos entre entrenamiento y evaluacion.
- Idiomas no documentados: aunque el modelo base es multilingue, no hay confirmacion de en que idiomas se ha ajustado ni de como se comporta fuera de ellos.
- Desbalance de clases severo: la exactitud de 0,9512 frente a un F1 de 0,5305 indica que la clase mayoritaria domina las predicciones. La exactitud no debe usarse como metrica principal.
- Clases practicamente inutilizables: ambiguouslydefinedconcept (F1 0,0580), graphemicphenomenon (0,1429), semanticphenomenon (0,1593) y discoursephenomenon (0,2143) no son fiables para uso en produccion sin revision humana.
- Indicios de sobreajuste: la perdida de validacion alcanza su minimo en la epoca 2 (0,2048) y sube de forma sostenida hasta 0,2467 en la epoca 6, mientras la perdida de entrenamiento cae hasta 0,0427. Conviene seleccionar el checkpoint por F1 y no por la ultima epoca.
- Esquema de anotacion dudoso: la presencia de etiquetas como "new tag" y "topnode dummy" sugiere un esquema incompleto o ruidoso heredado del proceso de anotacion.
- Riesgo de falsos positivos: en un modelo discriminativo el fallo tipico no es la alucinacion generativa, sino etiquetar como termino linguistico fragmentos que no lo son, especialmente en las clases con recall bajo.
- Documentacion insuficiente para produccion: no hay paper, DOI, tarjeta de datos ni resultados de benchmarks en el model-index.
- Licencia MIT: permite uso comercial y modificacion, con obligacion de incluir el aviso de copyright y sin ninguna garantia por parte del autor.
- Repositorio pesado: 22,4 GB, lo que complica su versionado y su despliegue en entornos con almacenamiento limitado.
- Alcance funcional limitado: al ser encoder-only, no permite chat, generacion, agentes ni tool calling; cualquier flujo conversacional requiere combinarlo con otro modelo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/c-ho/2026-10-13-xlmr-large-baseline_2_3
- Modelo base: https://huggingface.co/FacebookAI/xlm-roberta-large
- La busqueda web realizada no ha devuelto enlaces relacionados con el modelo: los resultados obtenidos (articulos de Wikipedia y prensa local sobre Saint-Germain-en-Laye y la Isla de Francia) no guardan ninguna relacion con este modelo. No se dispone de paper, blog tecnico, repositorio de codigo ni demo asociados.
