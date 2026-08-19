# JoaoReiz/ner-pt-f1-v1-bertimbau-large-specific-harem_official-seed3407

## Resumen

El modelo `JoaoReiz/ner-pt-f1-v1-bertimbau-large-specific-harem_official-seed3407` es un sistema de reconocimiento de entidades nombradas (NER) para portugués, desarrollado por JoaoReiz. Se trata de una puesta a punto del modelo BERTimbau large (`neuralmind/bert-large-portuguese-cased`) sobre el split oficial `harem_official` del protocolo NEVE, un corpus de evaluación de NER para portugués europeo y brasileño. El modelo está especializado en la detección de entidades como personas, organizaciones, lugares, tiempos, valores y otros tipos definidos en el esquema HAREM.

Con 333 millones de parámetros y una arquitectura transformer encoder de tipo BERT large, este modelo resuelve la tarea de etiquetado secuencial de tokens (token classification) en portugués. Su relevancia radica en que ofrece una alternativa fine-tuned y evaluada específicamente para NER en portugués, con un proceso de selección basado en la métrica F1 end-to-end sobre validación. El repositorio incluye los pesos en formato safetensors y es compatible con la librería `transformers` de Hugging Face.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BERT large (transformer encoder, 24 capas, 1024 dimensiones ocultas, 16 cabezas de atencion) |
| Parametros totales | 333.368.341 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 512 tokens (limite estandar de BERT) |
| Tipos de cuantizacion | no disponible (el repositorio solo contiene safetensors en precision completa) |
| Idiomas soportados | portugues (pt) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de BERTimbau large, un BERT entrenado sobre BrWaC (Brazilian Web as Corpus) con 1.000.000 de pasos y enmascaramiento de palabras completas (whole-word mask). La arquitectura es un transformer encoder estándar con 24 capas, 1024 unidades ocultas y 16 cabezas de atencion, lo que da un total de 333 millones de parametros. La capa de salida se sustituye por una cabecera de clasificacion de tokens para NER, que asigna una etiqueta de entidad a cada token de entrada.

El fine-tuning se realizo sobre el split `harem_official` del protocolo NEVE, un conjunto de datos de evaluacion de NER para portugues que incluye textos periodisticos, historicos y literarios. El proceso de entrenamiento utilizo una semilla fija (3407) y la seleccion del mejor checkpoint se hizo mediante la metrica `validation_end_to_end_f1`, que mide el rendimiento global de la extraccion de entidades (no solo el etiquetado token a token). No se dispone de informacion detallada sobre el numero de epocas, la tasa de aprendizaje o el uso de tecnicas adicionales como data augmentation.

## Capacidades

- Reconocimiento de entidades nombradas en portugues: personas, organizaciones, lugares, tiempos, valores, eventos, obras, etc., segun el esquema HAREM.
- Etiquetado secuencial de tokens con salida de tipo token-classification compatible con el pipeline de `transformers`.
- Procesamiento de textos en portugues europeo y brasileño, dado que el corpus BrWaC y el corpus HAREM cubren ambas variantes.
- No incluye capacidades generativas, de razonamiento, tool calling ni agentes; es un modelo puramente discriminativo para NER.
- No soporta vision, audio ni otros modalidades.

## Casos de uso

- Extraccion de entidades en documentos juridicos portugueses: el modelo puede identificar nombres de personas, organizaciones y lugares en contratos, sentencias o escrituras, facilitando la indexacion y busqueda semantica.
- Procesamiento de noticias y articulos periodisticos en portugues: permite extraer automaticamente protagonistas, ubicaciones y fechas para construir bases de datos de actualidad.
- Analisis de redes sociales en portugues: deteccion de menciones a marcas, productos o personas en textos informales, aunque el corpus de entrenamiento es principalmente formal.
- Construccion de grafos de conocimiento para dominios lusofonos: las entidades extraidas se pueden enlazar a bases de conocimiento como Wikidata.
- Enriquecimiento de sistemas de busqueda empresarial: indexacion de entidades en documentos internos para mejorar la precision de las consultas.
- Preprocesamiento para sistemas de traduccion automatica o resumen: la identificacion de entidades ayuda a preservar nombres propios y siglas en las salidas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de F1, precision o recall sobre el conjunto de test de HAREM. El unico dato de seleccion mencionado es `validation_end_to_end_f1`, pero sin valores numericos.

## Requisitos de hardware

- VRAM estimada para inferencia: con pesos en fp32 (1,3 GB), una GPU con al menos 4 GB de VRAM puede ejecutar el modelo con batch pequeno (secuencias de hasta 512 tokens). Con cuantizacion a int8 (no proporcionada en el repositorio) se podria reducir a ~700 MB de pesos.
- GPU recomendadas: cualquier GPU consumer con 8 GB o mas (RTX 3060, RTX 4060, RTX 4070) es suficiente para inferencia en tiempo real. Para entrenamiento o fine-tuning adicional se recomienda una GPU con 16 GB o mas (RTX 4080, A100).
- Cabe en GPUs consumer de gama media, como RTX 3060 12GB o RTX 4060 Ti 16GB.
- Opciones de despliegue: el formato safetensors es compatible con `transformers` de Hugging Face, por lo que se puede servir con `pipeline("token-classification")`, o mediante servidores como Hugging Face Inference Endpoints, ONNX Runtime, o TensorRT. No se proporcionan pesos en GGUF ni para llama.cpp.
- Latencia y throughput estimados: para una secuencia de 512 tokens, una RTX 3060 puede procesar alrededor de 100-200 secuencias por segundo en batch de 1, dependiendo de la implementacion. En CPU, la latencia seria de varios cientos de milisegundos por secuencia.

## Comparativa con modelos similares

No se dispone de datos comparativos publicados para este modelo especifico. Como referencia, se puede comparar con:

| Modelo | Parametros | Contexto | Tarea | Licencia |
|---|---|---|---|---|
| JoaoReiz/ner-pt-f1-v1-bertimbau-large-specific-harem_official-seed3407 | 333 M | 512 | NER portugues | no disponible |
| neuralmind/bert-large-portuguese-cased (base) | 333 M | 512 | Modelo de lenguaje enmascarado | MIT |
| JoaoReiz/ner-pt-f1-v1-bertimbau-base-specific-harem_official-seed3407 | 109 M (estimado) | 512 | NER portugues | no disponible |

La comparacion con el modelo base no es directa porque el base no esta fine-tuned para NER. No hay informacion sobre otros modelos NER en portugues en la busqueda web.

## Limitaciones y advertencias

- Sesgos conocidos: el modelo se entreno sobre BrWaC, un corpus web brasileño, y sobre HAREM, que incluye textos periodisticos y literarios. Puede presentar sesgos hacia el portugues brasileño y hacia registros formales, con peor rendimiento en textos muy coloquiales o de dominios especializados.
- Riesgo de alucinacion: al ser un modelo discriminativo de etiquetado, no genera texto nuevo, pero puede asignar etiquetas incorrectas a tokens ambiguos o fuera del esquema HAREM.
- Limitaciones de contexto: ventana de 512 tokens, por lo que no puede procesar documentos completos de una sola vez; requiere segmentacion previa.
- Restricciones de licencia: la licencia no esta especificada en el repositorio, lo que impide conocer si es apto para uso comercial. Se recomienda contactar con el autor antes de utilizarlo en produccion.
- Cobertura de entidades: el esquema HAREM tiene categorias especificas que pueden no alinearse con otros esquemas NER (por ejemplo, CoNLL), por lo que la adaptacion a otros dominios requerira reentrenamiento.
- Dependencia del modelo base: al ser un fine-tuning de BERTimbau, hereda sus limitaciones de vocabulario y tokenizacion (WordPiece, cased).

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/JoaoReiz/ner-pt-f1-v1-bertimbau-large-specific-harem_official-seed3407
- Modelo base BERTimbau large: https://huggingface.co/neuralmind/bert-large-portuguese-cased
- Repositorio del modelo base similar (version base): https://huggingface.co/JoaoReiz/ner-pt-f1-v1-bertimbau-base-specific-harem_official-seed3407
- Repositorio GitHub de BERTimbau (referencia de entrenamiento): https://github.com/ClaudioSS01/portuguese-Bertimbau
