# hassanedwan/citecheck-sentence-selector

## Resumen

CiteCheck Sentence Selector es un modelo de tipo cross-encoder desarrollado por el usuario hassanedwan, publicado en HuggingFace bajo licencia MIT. Su tarea es actuar como seleccionador de frases: dado un claim (afirmacion) y un resumen cientifico, el modelo puntua cada frase del resumen para estimar su probabilidad de constituir evidencia relevante para dicho claim. Es, por tanto, un componente de reranking dentro de un pipeline de verificacion de citas (citation checking) o de recuperacion de evidencia.

Se trata de un proyecto de curso (UMD DATA/MSML 641) entrenado sobre la particion de entrenamiento del dataset allenai/scifact, con 200 claims reservados para el ajuste de umbral (threshold tuning), segun train_log.json. El modelo esta especializado en resumenes biomedicales y no esta pensado como modelo generativo: no produce texto libre, sino puntuaciones de relevancia.

El repositorio es de 0,1 GB y los pesos en safetensors declaran 22.713.601 parametros, un orden de magnitud propio de un encoder pequeno de la familia BERT (tipo MiniLM). Esto lo hace muy ligero y desplegable en CPU o en GPUs de consumo, lo que resulta relevante para pipelines de verificacion factografica que necesitan reranking rapido sobre muchos pares claim-frase.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder tipo BERT (cross-encoder); tag de HuggingFace: bert. Detalle exacto de la arquitectura no disponible |
| Parametros totales | 22.713.601 |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (la model card indica que se entrena sobre resumenes biomedicales, lo que implica texto en ingles, pero no se declara el campo de idiomas) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Se trata de un cross-encoder: el modelo recibe de forma conjunta el par (claim, frase del resumen) y emite una puntuacion de relevancia por par, en lugar de generar embeddings independientes para cada texto. El tag declarado en HuggingFace es `bert`, y el recuento de parametros (22,7 M) corresponde a un encoder transformer de tamano reducido, no a un BERT-base completo (110 M). No se especifica en la informacion disponible el numero de capas, dimensiones ocultas ni el tokenizador exacto utilizado.

En cuanto al entrenamiento, la model card indica que se utilizo la particion de entrenamiento de SciFact (licencia CC BY 4.0) excluyendo 200 claims que se reservaron para el ajuste del umbral de decision, con el detalle registrado en train_log.json. El alcance se limita a resumenes biomedicales. No se documentan en la informacion disponible el numero de tokens de entrenamiento, la composicion exacta del dataset, ni si se aplicaron tecnicas de RLHF, DPO u otras fases de ajuste mas alla del entrenamiento supervisado del cross-encoder.

## Capacidades

- Puntuacion de relevancia a nivel de frase: dado un claim y un resumen, asigna una puntuacion a cada frase candidata para ordenarlas por probabilidad de servir como evidencia.
- Reranking en pipelines de recuperacion de evidencia: util como segunda etapa tras una recuperacion inicial de resumenes o pasajes.
- Seleccion de evidencia para verificacion factografica: permite extraer las frases concretas que sustentan (o refutan) una afirmacion cientifica.
- Ajuste de umbral: el modelo se entreno con un conjunto de 200 claims reservados especificamente para calibrar el umbral de decision, lo que facilita su uso en modo clasificacion binaria.
- Dominio restringido: resumenes biomedicales.
- No se ha documentado soporte de tool calling, function calling, agentes, razonamiento multi-paso ni generacion de texto.
- No se ha documentado capacidad multimodal (vision o audio).
- Capacidades multilingues: no disponibles; el entrenamiento se limita a resumenes biomedicales.

## Casos de uso

- Verificacion de afirmaciones cientificas: dado un claim extraido de un articulo divulgativo, el modelo selecciona las frases clave de los resumenes biomedicales recuperados que actuan como evidencia. Es el caso de uso nuclear del modelo y para el que fue entrenado con SciFact.
- Reranking en buscadores academicos: tras recuperar decenas de resumenes con un retriever de primera etapa (por ejemplo, BM25 o embeddings), el cross-encoder reordena las frases o los pasajes por relevancia real respecto a la consulta del usuario.
- Asistencia a revisiones sistematicas: cribado automatico de resumenes para identificar que frases justifican la inclusion de un estudio respecto a un criterio de elegibilidad expresado como claim.
- Construccion de datasets de atribucion: generacion de pares (afirmacion, evidencia) etiquetados automaticamente con umbral, utiles para entrenar o evaluar sistemas posteriores de atribucion y factualidad.
- Deteccion de apoyo frente a refutacion: con el umbral ajustado, el modelo puede usarse para clasificar si una frase sustenta o no un claim, integr<andose en un pipeline mayor de fact-checking cientifico.
- APIs de citation checking en herramientas de redaccion academica: dado un borrador con citas, el sistema recupera los resumenes citados y usa el selector para comprobar que existe una frase de evidencia real que respalda cada afirmacion.
- Prefiltrado a bajo coste: al tener solo 22,7 M de parametros, puede desplegarse en CPU y aplicarse sobre miles de pares claim-frase antes de invocar modelos de verificacion mucho mas caros.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card unicamente menciona que se reservaron 200 claims de SciFact para el ajuste de umbral (threshold tuning), con el registro en train_log.json, pero no incluye cifras de precision, recall, F1 ni comparaciones numericas con otros sistemas.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,1 GB para los pesos en fp32 (22,7 M de parametros), y menos de 0,05 GB en fp16 o int8. Con el overhead del runtime, un presupuesto de 0,5-1 GB de VRAM es mas que suficiente para lotes moderados.
- GPU recomendadas: cualquier GPU moderna sirve; el modelo no requiere A100 ni H100. Una RTX 3060, RTX 4090 o incluso una GPU integrada son suficientes.
- Cabe en GPU de consumo: si, en cualquier GPU de consumo actual, y tambien en CPU sin problemas de latencia apreciables para uso interactivo con lotes pequenos.
- Opciones de despliegue: Hugging Face Transformers, sentence-transformers (clase CrossEncoder), ONNX Runtime, Text Embeddings Inference (TEI) para servir el reranker, o exportacion a llama.cpp no aplicable por no ser un modelo generativo.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada. Dado el tamano (22,7 M de parametros), en GPU el coste dominante sera la tokenizacion y el batching de los pares, no el calculo del encoder.

## Comparativa con modelos similares

La categoria de referencia son los cross-encoders de reranking y seleccion de evidencia. No se dispone de resultados de benchmarks de este modelo que permitan una comparacion numerica, por lo que los valores de rendimiento de las alternativas se marcan como no disponibles en esta ficha.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Rendimiento comparado |
|---|---|---|---|---|---|
| hassanedwan/citecheck-sentence-selector | 22,7 M | no disponible | MIT | HuggingFace | no disponible |
| cross-encoder/ms-marco-MiniLM-L-6-v2 (familia MiniLM para reranking) | ~22,7 M | no disponible | Apache 2.0 | HuggingFace | no disponible |
| BAAI/bge-reranker-base | ~278 M | no disponible | MIT | HuggingFace | no disponible |
| Modelos de verificacion de SciFact (por ejemplo, los publicados junto al dataset) | no disponible | no disponible | no disponible | HuggingFace / GitHub de Allen AI | no disponible |

La diferencia principal frente a los rerankers genericos de la tabla es el dominio: este modelo esta especializado en resumenes biomedicales y en la tarea concreta de seleccionar frases de evidencia, mientras que los rerankers genericos se entrenan sobre colecciones web como MS MARCO.

## Limitaciones y advertencias

- Dominio muy restringido: el modelo se entrena exclusivamente sobre resumenes biomedicales de SciFact, por lo que su comportamiento fuera de ese dominio (noticias, textos legales, documentacion tecnica) no esta validado.
- Tarea no generativa: no produce texto ni explicaciones, solo puntuaciones de relevancia; no debe presentarse como un modelo de chat o de generacion.
- Riesgo de alucinacion: al no generar texto, no alucina contenido en sentido estricto, pero si puede asignar puntuaciones altas a frases que no constituyen evidencia real, lo que en un pipeline de verificacion se traduce en falsos positivos de atribucion.
- Sesgos conocidos: no disponibles. No se documenta ningun analisis de sesgos, y el corpus SciFact tiene sesgos propios de la literatura biomedical publicada.
- Limitaciones de contexto e idioma: no se especifica la longitud maxima de secuencia ni los idiomas soportados; el entrenamiento sobre resumenes biomedicales sugiere un uso practico en ingles.
- Licencia: MIT, lo que permite uso comercial y modificacion, pero el dataset de entrenamiento (allenai/scifact) se distribuye bajo CC BY 4.0, por lo que conviene mantener la atribucion correspondiente al dataset.
- Trazabilidad limitada: con 0 descargas y 0 likes en el momento de la consulta, es un artefacto de proyecto de curso sin validacion externa ni mantenimiento declarado.
- Sin benchmarks publicos: no hay evidencia numerica que respalde su calidad frente a alternativas, por lo que cualquier uso en produccion deberia ir precedido de una evaluacion propia sobre el dominio objetivo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/hassanedwan/citecheck-sentence-selector
- Dataset de entrenamiento (SciFact): https://huggingface.co/datasets/allenai/scifact
- Referencia del proyecto: UMD DATA/MSML 641 (curso); no se proporciona URL especifica en la informacion disponible.
- Otros enlaces (paper, blog, repositorio o demo): no disponibles en la informacion proporcionada.
