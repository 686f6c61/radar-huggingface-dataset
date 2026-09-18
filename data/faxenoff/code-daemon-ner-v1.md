# faxenoff/code-daemon-ner-v1

## Resumen

code-daemon-ner-v1 es un modelo de clasificación de tokens (etiquetado BIO) desarrollado por el usuario faxenoff, orientado a reconocer entidades de ingeniería de software en texto en prosa: frases de un README, un documento de diseño, un hilo de issues o un mensaje de commit. No es un parser de código; la extracción de identificadores dentro de ficheros fuente se delega a tree-sitter. Su función es la parte que tree-sitter no cubre: leer una frase como "the IVF index rescoring path in `faiss_index.zig` regressed nDCG@10 by 4 points" y determinar que `IVF` es un algoritmo, `faiss_index.zig` una ruta de fichero y `nDCG@10` una métrica.

Técnicamente es un encoder XLM-RoBERTa de 12 capas y 384 dimensiones ocultas, con un vocabulario SentencePiece multilingüe de 250 000 entradas, derivado de nreimers/mMiniLMv2-L12-H384-distilled-from-XLMR-Large. El recuento real de parámetros publicado en safetensors es de 117 499 409, de los cuales la mayor parte corresponde a la tabla de embeddings. Se distribuye con un grafo ONNX de dos entradas (`input_ids`, `attention_mask`) que produce `logits [batch, seq, 17]`, y su secuencia máxima es de 128 tokens, pensada para una o dos frases por chunk.

El modelo se integra en el servidor MCP UltraCode como motor de TensorRT u OpenVINO y alimenta un grafo de conocimiento de documentación: los spans que emite se convierten en nodos de concepto que enlazan un párrafo de prosa con las entidades de código a las que se refiere. Su relevancia práctica no está en la precisión absoluta, sino en su comportamiento orientado a recall: con un F1 macro de entidad de 0,43 en el conjunto Core, está diseñado como generador de candidatos filtrable, no como etiquetador autónomo fiable.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder XLM-RoBERTa (12 capas, 384 de dimension oculta), fine-tuning para token classification con esquema BIO |
| Parametros totales | 117 499 409 |
| Parametros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | 128 tokens (secuencia maxima) |
| Tipos de cuantizacion | no disponible (el repositorio incluye pesos safetensors y un grafo ONNX; no se detallan variantes cuantizadas en la informacion proporcionada) |
| Idiomas soportados | ingles (en), ruso (ru) y texto tecnico en prosa sobre codigo (etiqueta `code`); bilingue por construccion a partir del backbone XLM-R |
| Licencia | MIT |
| Formato de pesos | safetensors, ONNX (dos entradas: `input_ids`, `attention_mask`; sin `token_type_ids`) |

## Arquitectura y entrenamiento

El backbone es mMiniLMv2-L12-H384, una destilacion de XLM-RoBERTa Large con 12 capas y 384 dimensiones ocultas, sobre la que se aplica una cabeza de clasificacion de tokens con 17 clases BIO que cubren 8 tipos de entidad. El vocabulario SentencePiece de 250 000 entradas explica que un modelo con una anchura modesta alcance los 117,5 millones de parametros: la matriz de embeddings concentra la mayor parte del recuento. El modelo consume exclusivamente `input_ids` y `attention_mask` y no necesita `token_type_ids`, lo que simplifica su exportacion a ONNX y su ejecucion en motores de inferencia.

No existe un corpus publico para este conjunto de etiquetas, por lo que las anotaciones de entrenamiento se fabricaron mediante supervisión debil: varios etiquetadores independientes votan por chunk y los votos se reconcilian en una unica secuencia BIO, seguida de un ajuste fino supervisado del backbone y una pasada de calibracion de temperatura. Esa calibracion se entrega en `temperature.json` con un unico escalar T = 0,665: quien consuma probabilidades en lugar de `argmax` debe dividir los logits por ese valor antes del softmax. La evaluacion se realizo sobre un conjunto de oro anotado por humanos y disjunto de las etiquetas de entrenamiento, con 1500 frases revisadas manualmente y normalizadas para que ningun nombre de superficie lleve dos etiquetas ni se solapen spans.

## Capacidades

- Reconocimiento de entidades nombradas en prosa tecnica con 8 tipos agrupados en dos niveles. Nivel Core: `component` (parte nombrada de un sistema, incluidos nombres de modelos), `api_endpoint` (funcion, metodo, ruta o nombre de herramienta de agente), `file_path` (ruta o nombre de fichero) y `tool` (ejecutable, runtime, servicio, lenguaje de programacion o hardware).
- Nivel Soft, tolerado con menor precision: `algorithm` (metodo o procedimiento con nombre), `data_structure` (contenedor o layout), `config` (flag, variable de entorno o ajuste) y `metric` (medida o su unidad).
- Clasificacion a nivel de token con formato BIO, con 17 clases en total.
- Procesamiento bilingue ingles-ruso heredado del backbone XLM-R, orientado a documentacion tecnica.
- Inferencia sobre texto en prosa exclusivamente; no realiza parsing sintactico ni extraccion de identificadores desde codigo fuente (esa tarea corresponde a tree-sitter).
- No dispone de soporte de tool calling, function calling, agentes ni razonamiento multi-paso: es un modelo discriminativo de etiquetado, no generativo.
- No tiene modo de pensamiento ni capacidades de vision o audio.
- Salida determinista de logits por token, consumible tanto por `argmax` como por probabilidades calibradas mediante el escalar de temperatura incluido.

## Casos de uso

- Construccion de grafos de conocimiento de documentacion: los spans Core emitidos se convierten en nodos de concepto que enlazan parrafos de prosa con las entidades de codigo mencionadas, que es exactamente el flujo para el que se diseno el modelo dentro del servidor MCP UltraCode.
- Enriquecimiento de indices de busqueda semantica en repositorios: al etiquetar `api_endpoint` y `file_path` en READMEs y documentos de diseno, se pueden crear filtros estructurados que complementen la busqueda vectorial y permitan recuperar "donde se documenta esta ruta" sin depender solo de similitud de embeddings.
- Triaje y enrutado de issues y pull requests: extraer `component`, `tool` y `file_path` de un hilo de incidencias permite asignar automaticamente el equipo o el area responsable; el sesgo hacia recall de estos tipos favorece no perder candidatos, a costa de requerir un filtro posterior.
- Aportacion de contexto a agentes de codigo: integrado como motor TensorRT u OpenVINO, el modelo alimenta la fase de recuperacion de un agente que necesita saber a que componente, herramienta o metrica se refiere un parrafo antes de decidir una accion.
- Procesamiento de documentacion tecnica bilingue en ingles y ruso: equipos con repositorios y guias en ambos idiomas pueden aplicar un unico modelo en lugar de mantener dos pipelines de NER separados.
- Extraccion de metricas y configuracion para analitica de ingenieria: los tipos `metric` y `config` permiten rastrear menciones de `nDCG@10`, `p95 latency`, `journal_mode=MEMORY` o `--epochs` a lo largo de changelogs y notas de version para construir series historicas de rendimiento.
- Analisis de mensajes de commit y notas de release: detectar menciones de `algorithm` y `data_structure` ayuda a reconstruir que cambio tecnico se introdujo en cada version sin leer el diff completo.
- Inventario de dependencias y hardware en documentacion: el tipo `tool` captura menciones de motores, runtimes, lenguajes y tarjetas graficas, util para planificar migraciones de infraestructura o auditorias de compatibilidad.

## Benchmarks y rendimiento

Evaluacion sobre el conjunto de oro humano de 1500 frases, metrica a nivel de entidad (span exacto y tipo, convencion seqeval), promediada de forma macro sobre los tipos.

| Split | macro-F1 | micro-F1 |
|---|---:|---:|
| Core | 0,4264 | 0,4502 |
| Soft | 0,2072 | 0,1910 |

Desglose por tipo, con precision y recall:

| Tipo | Nivel | F1 | Precision | Recall |
|---|---|---:|---:|---:|
| `api_endpoint` | Core | 0,521 | 0,409 | 0,720 |
| `file_path` | Core | 0,497 | 0,391 | 0,682 |
| `tool` | Core | 0,425 | 0,421 | 0,429 |
| `component` | Core | 0,263 | 0,218 | 0,330 |
| `metric` | Soft | 0,273 | 0,404 | 0,206 |
| `algorithm` | Soft | 0,239 | 0,193 | 0,312 |
| `data_structure` | Soft | 0,198 | 0,169 | 0,239 |
| `config` | Soft | 0,119 | 0,166 | 0,093 |

No se han publicado en la informacion disponible resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros), que por otra parte no aplican a un modelo discriminativo de etiquetado.

## Requisitos de hardware

- VRAM estimada para inferencia: en fp32 los pesos ocupan aproximadamente 470 MB; en fp16, unos 235 MB; en int8, alrededor de 118 MB. Con secuencias de 128 tokens y lotes moderados, el consumo total se mantiene por debajo de 1 GB en fp32.
- Cabe en cualquier GPU de consumo, incluidas GTX 1650, RTX 3060, RTX 4090 o equivalentes, y tambien en CPU, dado el reducido tamano del modelo y la longitud de contexto de 128 tokens.
- No requiere GPU de centro de datos; A100 o H100 solo tendrian sentido para servir volumenes muy altos con lotes grandes, no por necesidades de memoria.
- Opciones de despliegue documentadas: motores TensorRT y OpenVINO, ademas del grafo ONNX de dos entradas que puede ejecutarse con ONNX Runtime. El modelo tambien es cargable con la libreria `transformers` a partir de los pesos safetensors, dado que la arquitectura base es XLM-RoBERTa.
- No se distribuyen pesos en formato GGUF, por lo que llama.cpp y Ollama no son vias de despliegue directas sin una conversion adicional no documentada.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

No se han publicado en la informacion disponible resultados comparativos frente a otros modelos de NER sobre el mismo conjunto de etiquetas, y el conjunto de 8 tipos es especifico del proyecto, por lo que no existe una referencia publica directa. Los unicos puntos de comparacion documentados se recogen en la tabla siguiente.

| Modelo | Parametros | Contexto | Tarea | Licencia | Datos comparativos |
|---|---|---|---|---|---|
| faxenoff/code-daemon-ner-v1 | 117,5 M | 128 tokens | NER de entidades de ingenieria de software en prosa, 8 tipos / 17 clases BIO | MIT | macro-F1 0,4264 (Core), 0,2072 (Soft) |
| nreimers/mMiniLMv2-L12-H384-distilled-from-XLMR-Large | no disponible | no disponible | Modelo base de representacion multilingue (encoder) | no disponible | no disponible; es el backbone, no un NER comparable |
| Otros modelos de NER genericos sobre codigo | no disponible | no disponible | NER sobre codigo o documentacion | no disponible | no disponible |

## Limitaciones y advertencias

- El propio autor advierte que el F1 macro de entidad Core es 0,43 y que el modelo es un generador de candidatos orientado a recall, no un etiquetador fiable sin supervision. No debe usarse como etiquetador final en produccion sin una etapa de filtrado o verificacion.
- Precision baja en los tipos fuertes: `api_endpoint` (0,409) y `file_path` (0,391) sobre-predicen de forma sistematica. La causa documentada es que estas clases aparecen en el corpus de entrenamiento con una densidad aproximada 2,6 veces superior a la del conjunto de oro humano, de modo que el exceso de predicciones es herencia de las etiquetas de entrenamiento.
- `component` es el tipo Core mas debil (F1 0,263) y su limitacion no proviene de la densidad de etiquetas, sino de que la definicion de "parte nombrada de un sistema" es contextual en un grado que una ruta o una llamada no son.
- `config` es el tipo mas debil del conjunto (F1 0,119, recall 0,093). Sus etiquetas son inconsistentes entre las dos mitades del corpus de entrenamiento: densas en documentacion y casi ausentes en la otra mitad.
- Las etiquetas de entrenamiento proceden de supervision debil con reconciliacion de votos, no de anotacion humana directa, lo que introduce ruido estructural en el modelo resultante.
- Riesgo de alucinacion de spans: al ser un modelo discriminativo no genera texto, pero puede marcar como entidad fragmentos de prosa que no corresponden a ninguna entidad real, especialmente en los tipos Soft.
- Limitacion de contexto severa: 128 tokens por inferencia. La documentacion mas larga debe trocearse en frases o pares de frases, lo que puede romper referencias que dependen de un contexto mayor.
- Cobertura idiomatica limitada al ingles y al ruso, heredada del backbone. El rendimiento en castellano u otros idiomas no esta documentado.
- Ambiguedad de etiquetas resuelta por reglas, no por aprendizaje: la frontera entre `component`, `tool` y `api_endpoint` se fija mediante reglas aplicadas en orden, y alrededor de una docena de nombres son genuinamente polisemicos y toman su etiqueta de la frase. Esto implica que el modelo puede discrepar del criterio de un equipo que use reglas distintas.
- La licencia MIT permite uso comercial, modificacion y redistribucion. Se recomienda conservar el aviso de copyright y citar la procedencia.
- El modelo no realiza parsing de codigo: no debe emplearse para extraer identificadores de ficheros fuente, tarea para la que se necesita tree-sitter u otra herramienta de analisis sintactico.
- La model card original esta truncada en la informacion proporcionada, por lo que podrian existir detalles adicionales de evaluacion o entrenamiento no recogidos aqui.
- El repositorio tiene 0 descargas y 0 likes y ocupa 5,2 GB, lo que sugiere que incluye varios artefactos de motor de inferencia ademas de los pesos; conviene revisar el contenido antes de descargarlo completo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/faxenoff/code-daemon-ner-v1
- Modelo base: https://huggingface.co/nreimers/mMiniLMv2-L12-H384-distilled-from-XLMR-Large
- Servidor MCP UltraCode, del mismo autor: https://github.com/faxenoff/ultracode
- Resultados de la busqueda web: no se ha encontrado ningun enlace relevante al modelo. Las busquedas devolvieron exclusivamente paginas de localizacion de tiendas y codigos postales (Lidl US, Lidl GB, Storeopeninghours, Israel Post, Lev Tel Aviv), sin relacion con el modelo, su autor ni su dominio de aplicacion.
