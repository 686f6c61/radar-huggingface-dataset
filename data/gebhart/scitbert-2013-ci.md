# gebhart/scitbert-2013-ci

## Resumen

`gebhart/scitbert-2013-ci` es un modelo de lenguaje de tipo encoder publicado por el usuario gebhart en Hugging Face, dentro de la colección SciTBERT, orientada al procesamiento de texto científico. El modelo tiene 149.014.272 parámetros (aproximadamente 149 M) y se distribuye en formato safetensors, con un repositorio de 1,2 GB. La etiqueta de arquitectura declarada en Hugging Face es `modernbert`, lo que lo sitúa en la familia ModernBERT de encoders transformer con atención optimizada, aunque la ficha oficial del repositorio no aporta detalles adicionales sobre la configuración concreta.

El nombre sugiere una especialización en texto científico y una posible vinculación con un corpus de 2013, y la existencia del repositorio complementario `gebhart/scitbert-tokenizer-2013` apunta a un tokenizador entrenado específicamente para ese dominio. Se trata de un modelo con muy poca tracción en la plataforma (4 descargas y 0 likes en el momento de la consulta), lo que indica que es un experimento de investigación más que un modelo con validación comunitaria amplia.

La relevancia de este tipo de modelos radica en que los encoders especializados en dominio científico suelen superar a los encoders generalistas en tareas de clasificación, extracción de entidades y similitud semántica sobre literatura académica, y ModernBERT aporta mejoras de eficiencia frente a BERT clásico. No obstante, para este checkpoint concreto no se ha publicado información sobre datos de entrenamiento, benchmarks ni licencia, por lo que su evaluación en producción requiere una validación propia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ModernBERT (encoder transformer; segun la etiqueta `modernbert` del repositorio) |
| Parametros totales | 149.014.272 (segun safetensors) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (el repositorio distribuye pesos en safetensors sin cuantizaciones publicadas) |
| Idiomas soportados | No disponible (la ficha no declara idiomas) |
| Licencia | No disponible |
| Formato de pesos | safetensors |

Otros datos del repositorio: tamano del repositorio 1,2 GB, 4 descargas, 0 likes, creado el 2026-06-14 y actualizado el 2026-10-05. No se declara pipeline en la ficha.

## Arquitectura y entrenamiento

La etiqueta del repositorio indica `modernbert`, lo que corresponde a la familia ModernBERT: encoders transformer con mejoras de eficiencia respecto a BERT, incluyendo atención con soporte de secuencias largas, alternancia entre atención local y global, y uso de Rotary Positional Embeddings (RoPE) y RMSNorm en lugar de las alternativas clásicas. Al tratarse de un encoder, el modelo está diseñado para producir representaciones contextualizadas, no para generar texto de forma autorregresiva. El recuento de 149 M de parámetros es coherente con un encoder de tamano «base» escalado.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del corpus, si se aplicaron fases de ajuste supervisado, ni sobre el uso de técnicas como decodificación especulativa o atención lineal. El nombre del modelo y la existencia de `gebhart/scitbert-tokenizer-2013` sugieren un entrenamiento sobre texto científico y un tokenizador propio asociado al ano 2013, pero esto es una inferencia a partir de los identificadores y no un dato confirmado en la información disponible. Cualquier afirmación sobre el dataset, el regimen de preentrenamiento o el ajuste fino debe considerarse no verificada.

## Capacidades

- Codificacion de texto: al ser un encoder, su función principal es transformar texto en representaciones vectoriales contextualizadas, aptas para tareas posteriores.
- Clasificación de secuencias: cabe esperar soporte para clasificación de texto (por ejemplo, categorización de artículos, detección de relevancia), previo ajuste fino o mediante cabezas ya incluidas si el checkpoint las incorpora, dato que no se especifica.
- Extracción de entidades y etiquetado de tokens: uso típico de encoders en dominios científicos para reconocimiento de entidades nombradas o etiquetado de secuencias, sujeto a ajuste.
- Similitud semántica y recuperación: las representaciones pueden emplearse para búsqueda semántica o clustering de documentos científicos.
- Capacidades multilingües: no disponibles; la ficha no declara idiomas soportados.
- Tool calling / function calling: no disponible; no es una capacidad esperable en un encoder de este tipo y no se documenta.
- Soporte de agentes y razonamiento multi-paso: no disponible; no es una capacidad propia de un encoder.
- Capacidades especiales (modo thinking, visión, audio): no disponibles.

## Casos de uso

- Clasificación tematica de publicaciones cientificas: el modelo puede actuar como extractor de representaciones sobre titulos y abstracts para alimentar un clasificador de areas de conocimiento (por ejemplo, categorias arXiv), aprovechando su especializacion aparente en dominio cientifico.
- Busqueda semantica en repositorios de papers: generando embeddings de documentos y consultas para un motor de recuperacion, de modo que una busqueda por concepto devuelva articulos afines aunque no compartan terminos exactos.
- Extraccion de entidades en texto academico: con un ajuste fino sobre un conjunto etiquetado, puede emplearse para detectar metodos, datasets, metricas o instituciones mencionadas en articulos.
- Deduplicacion y agrupamiento de literatura: el calculo de similitudes entre abstracts permite agrupar trabajos redundantes o construir mapas tematicos de un corpus.
- Filtrado y triaje de revisiones sistematicas: clasificacion de cribado (incluir/excluir) sobre grandes volumenes de registros bibliograficos, reduciendo el trabajo manual de los revisores.
- Analisis de citas y contexto de citacion: representaciones de fragmentos que rodean una cita para clasificar la intencion de citacion o la polaridad del juicio emitido.
- Indexacion de repositorios internos de documentacion tecnica: uso de los embeddings para un buscador interno sobre informes y notas tecnicas, siempre que el dominio se aproxime al corpus de entrenamiento.

En todos los casos, al no existir benchmarks publicados ni confirmacion de cabezas de tarea en el checkpoint, es necesario validar el rendimiento sobre datos propios antes de desplegarlo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

Los resultados de la busqueda web corresponden al SciBERT original de Allen AI (paper arXiv:1903.10676 y repositorio `allenai/scibert`), que es un modelo distinto y no debe confundirse con este checkpoint. No se dispone de numeros de MMLU, GLUE, HumanEval, GSM8K ni de ninguna otra evaluacion para `gebhart/scitbert-2013-ci`.

## Requisitos de hardware

- VRAM estimada para inferencia: con 149 M de parametros, los pesos en precision completa (fp32) ocupan aproximadamente 0,6 GB; en fp16/bf16 alrededor de 0,3 GB. Sumando activaciones y overhead del runtime, una estimacion practica es de 1 a 2 GB de VRAM para lotes pequenos.
- GPU recomendadas: cualquier GPU con al menos 2-4 GB de VRAM es suficiente; una RTX 3060, RTX 4060 o superior cubre el caso sin problemas. Para procesamiento por lotes a gran escala, una A100 o H100 permite maximizar el throughput aunque estan sobredimensionadas para este tamano.
- Cabe en GPU de consumo: si. Practicamente cualquier GPU de consumo moderna (GTX 1650 en adelante con memoria suficiente, RTX 3060/4060/4090) puede ejecutarlo, y tambien es viable en CPU para cargas moderadas.
- Opciones de despliegue: por tratarse de un encoder en safetensors, los entornos naturales son la libreria Transformers, Text Embeddings Inference (TEI) para servir embeddings, o exportaciones a ONNX para inferencia optimizada. vLLM y TGI estan orientados a modelos generativos y no son la via habitual para este tipo de checkpoint; llama.cpp/Ollama requeririan conversion a GGUF, que no se distribuye en el repositorio.
- Latencia y throughput estimados: no disponibles. Al no conocerse la longitud de contexto, el tamano de lote soportado ni la configuracion de atencion, no es posible dar cifras fiables.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Dominio | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| gebhart/scitbert-2013-ci | 149 M | No disponible | Cientifico (segun nomenclatura) | No disponible | Hugging Face (4 descargas) |
| allenai/scibert_scivocab_uncased | 110 M | 512 tokens | Cientifico (corpus Semantic Scholar) | Apache 2.0 | Hugging Face y GitHub de Allen AI |
| BERT base uncased | 110 M | 512 tokens | General | Apache 2.0 | Hugging Face |
| ModernBERT base | 149 M | 8192 tokens (segun especificacion de la familia) | General | Apache 2.0 | Hugging Face |

Nota: la fila de ModernBERT base refleja las caracteristicas publicas de la familia, no una verificacion de que este checkpoint conserve esa longitud de contexto, dato que no aparece en la informacion proporcionada. Las cifras de SciBERT y BERT corresponden a sus respectivas publicaciones oficiales.

## Limitaciones y advertencias

- Ausencia total de documentacion: la ficha del modelo no declara licencia, idiomas, pipeline, dataset de entrenamiento ni proceso de ajuste, lo que impide evaluar su idoneidad para uso comercial o para dominios regulados.
- Licencia no disponible: al no especificarse, no puede asumirse permiso de uso comercial. Es imprescindible contactar con el autor o localizar el termino legal antes de cualquier despliegue productivo.
- Riesgo de alucinacion: al ser un encoder, no genera texto libre y el riesgo de alucinacion en el sentido generativo no aplica; sin embargo, las representaciones y las predicciones de tareas derivadas pueden ser incorrectas o poco calibradas, especialmente fuera del dominio de entrenamiento.
- Sesgos conocidos: no disponibles. No se ha publicado ninguna evaluacion de sesgo, y el dominio cientifico tiende a sobrerrepresentar determinadas areas, idiomas (mayoritariamente ingles) e instituciones.
- Limitaciones de contexto e idioma: se desconocen la ventana de contexto real y los idiomas soportados. Si el entrenamiento se limito a un corpus de 2013, el modelo puede presentar deriva temporal y peor rendimiento con terminologia posterior.
- Madurez y soporte: con 4 descargas y 0 likes, no hay validacion de la comunidad, issues resueltos ni garantia de mantenimiento. La fecha de actualizacion del repositorio es posterior a la de creacion, pero no se documenta que cambios introduce.
- Produccion: se recomienda tratarlo como checkpoint experimental, congelar una revision concreta del repositorio, evaluar sobre un conjunto de validacion propio y monitorizar el rendimiento antes de integrarlo en cualquier flujo critico.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/gebhart/scitbert-2013-ci
- Coleccion SciTBERT de gebhart: https://huggingface.co/collections/gebhart/scitbert
- Tokenizador asociado: https://huggingface.co/gebhart/scitbert-tokenizer-2013
- Paper de SciBERT (modelo distinto, de Allen AI): https://arxiv.org/abs/1903.10676
- Version HTML del paper de SciBERT: https://arxiv.org/html/1903.10676v1
- Repositorio GitHub de SciBERT (Allen AI): https://github.com/allenai/scibert
