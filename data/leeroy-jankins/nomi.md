# leeroy-jankins/nomi

## Resumen

Nomi es un modelo de embeddings de texto de código abierto, desarrollado por el usuario `leeroy-jankins`, derivado del modelo `nomic-embed-text-v1.5` de Nomic AI. Está diseñado para tareas de recuperación semántica, indexación de documentos y flujos RAG, con soporte para prefijos de instrucción que distinguen entre consultas y documentos. Se distribuye en formato GGUF, lo que permite su ejecución local con runtimes como llama.cpp o Sentence Transformers, sin dependencia de APIs en la nube.

El modelo cuenta con 136,7 millones de parámetros y una licencia MIT, lo que facilita su integración en proyectos comerciales y de investigación. Su principal atractivo es su linaje orientado a búsqueda, su capacidad para manejar contextos largos (aunque el número exacto no se especifica en la documentación) y su comportamiento de representación estilo Matryoshka, que permite reducir la dimensionalidad de los embeddings si es necesario. Nomi se presenta como una opción ligera y local para pipelines de búsqueda semántica, especialmente en entornos donde se requiere distinguir explícitamente entre consultas y pasajes indexados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivado de nomic-embed-text-v1.5) |
| Parametros totales | 136.727.040 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no especificado (la documentacion menciona soporte de contexto largo, pero no indica el numero de tokens) |
| Tipos de cuantizacion | Q4_K_M (mencionado en los ejemplos; pueden existir otros, no confirmados) |
| Idiomas soportados | en (ingles) |
| Licencia | MIT |
| Formato de pesos | GGUF (tambien se dispone de safetensors segun los metadatos, aunque el repositorio se centra en GGUF) |

## Arquitectura y entrenamiento

Nomi se basa en el modelo `nomic-embed-text-v1.5`, un transformer de embeddings diseñado para recuperación de alta calidad. La arquitectura original incluye atención estándar y soporte para ventanas de contexto largas, aunque en la versión GGUF puede requerir ajustes de extensión de contexto en runtimes como llama.cpp para igualar el comportamiento del modelo original. El modelo se distribuye cuantizado en formato GGUF, lo que reduce su huella de memoria y facilita su despliegue local.

En cuanto al entrenamiento, la model card no proporciona detalles sobre el proceso de entrenamiento de Nomi en sí. Se listan varios datasets en los metadatos (Regulations, Appropriations, Title-31-CFR-Money-and-Finance, RedBook, OMB-Circular-A-11), pero no se explica cómo se utilizaron. Dado que Nomi es una derivación de un modelo existente, es probable que se haya realizado un ajuste fino o una adaptación sobre esos conjuntos de datos, aunque no hay confirmación explícita. Tampoco se menciona el uso de RLHF, DPO u otras técnicas de alineación, ya que se trata de un modelo de embeddings, no generativo.

## Capacidades

- Generacion de embeddings de texto para tareas de busqueda semantica y recuperacion.
- Soporte de prefijos de instruccion especificos: `search_document`, `search_query`, `clustering`, `classification`, que permiten adaptar la representacion al tipo de tarea.
- Adecuado para flujos RAG, donde se distinguen consultas (`search_query`) de documentos (`search_document`).
- Capacidad de reducir la dimensionalidad de los embeddings gracias al comportamiento estilo Matryoshka del modelo base (no se especifican las dimensiones exactas).
- Ejecucion local sin dependencia de APIs externas, gracias al formato GGUF.
- Compatible con Sentence Transformers y runtimes basados en llama.cpp.

## Casos de uso

- Indexacion semantica de documentos largos: Nomi puede generar embeddings de fragmentos de documentos (por ejemplo, regulaciones o textos legales) para construir indices vectoriales que permitan busquedas por similitud. Su linaje de contexto largo lo hace adecuado para chunks extensos.
- Recuperacion aumentada por generacion (RAG): en un pipeline RAG, se embeden los documentos con el prefijo `search_document` y las consultas con `search_query`, logrando una separacion explicita entre el corpus y las preguntas. Esto mejora la precision de la recuperacion.
- Clasificacion de textos: usando el prefijo `classification`, los embeddings pueden servir como caracteristicas de entrada para modelos de clasificacion supervisada, por ejemplo, categorizar documentos legales o financieros.
- Agrupamiento (clustering) de corpus: con el prefijo `clustering`, se pueden agrupar documentos por temas o detectar duplicados semanticos, util para organizar grandes colecciones.
- Busqueda semantica en entornos locales: al ser un modelo pequeno y en GGUF, puede desplegarse en maquinas sin GPU o con recursos limitados, ofreciendo busqueda por similitud en aplicaciones de escritorio o servidores modestos.
- Experimentacion con estrategias de prefijos: su diseno orientado a prefijos permite investigar como distintas convenciones de entrada afectan la calidad de los embeddings, util para desarrolladores que disenan pipelines de recuperacion personalizados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Al tratarse de un modelo de 136,7 millones de parametros en formato GGUF cuantizado (Q4_K_M), su huella de memoria es reducida, estimada en torno a 80-100 MB, aunque no se proporciona el dato exacto.
- Puede ejecutarse en CPU sin problemas, siendo adecuado para entornos sin GPU.
- En GPU, cualquier tarjeta con al menos 1 GB de VRAM seria suficiente, aunque no se especifican requisitos minimos oficiales.
- Opciones de despliegue: Sentence Transformers con `trust_remote_code=True`, runtimes compatibles con GGUF como llama.cpp, o herramientas como Ollama si se adapta el formato.
- La latencia y el throughput no estan documentados, pero por el tamano del modelo se espera un rendimiento rapido incluso en CPU.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos comparables en la documentacion proporcionada. Dado que Nomi es una derivacion de `nomic-embed-text-v1.5`, se podria comparar con otros modelos de embeddings pequenos como `all-MiniLM-L6-v2` o `bge-small-en`, pero no se han proporcionado datos de rendimiento ni caracteristicas detalladas para establecer una comparacion rigurosa.

## Limitaciones y advertencias

- El modelo requiere el uso de prefijos de tarea para obtener resultados optimos; omitirlos puede degradar significativamente la calidad de los embeddings.
- El comportamiento de contexto largo en la version GGUF puede no coincidir con el del modelo original si no se configuran adecuadamente los parametros de extension de contexto en llama.cpp.
- Solo soporta ingles (segun los metadatos), por lo que no es adecuado para textos en otros idiomas sin adaptacion.
- No se han publicado evaluaciones de sesgos o alucinaciones, aunque al ser un modelo de embeddings, el riesgo de alucinacion es menor que en modelos generativos.
- La licencia MIT permite uso comercial sin restricciones, pero se recomienda verificar la licencia del modelo base `nomic-embed-text-v1.5` para asegurar compatibilidad.
- No hay informacion sobre el proceso de entrenamiento especifico de Nomi, por lo que se desconoce si los datasets listados se usaron para ajuste fino o solo como referencia.

## Enlaces

- [Pagina del modelo en HuggingFace](https://huggingface.co/leeroy-jankins/nomi)
- [Modelo base: nomic-ai/nomic-embed-text-v1.5-GGUF](https://huggingface.co/nomic-ai/nomic-embed-text-v1.5-GGUF)
