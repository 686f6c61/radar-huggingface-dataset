# mradermacher/AfriqueQwen3.5-9B-50Langs-Instruct-v1-i1-GGUF

## Resumen

Este repositorio contiene cuantizaciones GGUF del modelo McGill-NLP/AfriqueQwen3.5-9B-50Langs-Instruct-v1, publicadas por el usuario mradermacher. No se trata por tanto de un modelo entrenado desde cero, sino de una conversión del checkpoint original a formatos cuantizados de tipo i1 (imatrix) para su uso con llama.cpp y herramientas compatibles. El modelo base, segun la nomenclatura del repositorio, pertenece a la familia Qwen3.5 con aproximadamente 9.000 millones de parametros, y esta orientado a instrucciones conversacionales.

El dato verificado de tamano es de 8.953.803.264 parametros en el checkpoint original en safetensors, lo que lo situa en la categoria de 9B. El repositorio de cuantizaciones ocupa 68,2 GB y ofrece 16 archivos GGUF con niveles de compresion que van desde i1-IQ1_M (3,0 GB) hasta i1-Q6_K (7,5 GB), ademas del archivo imatrix empleado para generar las cuantizaciones ponderadas. La licencia declarada es CC-BY-4.0, lo que permite uso comercial con atribucion.

Su relevancia practica es la de hacer desplegable un modelo de 9B en hardware de consumo: las cuantizaciones i1 de 4 bits ocupan entre 5,3 y 5,7 GB, lo que permite ejecutar el modelo en GPUs con 8 GB de VRAM o en CPU con RAM suficiente. El repositorio no incluye model card propia con detalles de entrenamiento ni resultados de benchmarks, por lo que la evaluacion tecnica depende del modelo base original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el modelo base deriva de la familia Qwen3.5 segun su nomenclatura; no se detalla en la informacion proporcionada) |
| Parametros totales | 8.953.803.264 (dato real de safetensors del modelo base) |
| Parametros activos | no disponible (no se indica que sea un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF i1 (imatrix): IQ1_M, IQ2_M, Q2_K_S, Q2_K, IQ3_XXS, IQ3_M, Q3_K_M, IQ4_XS, Q4_K_S, IQ4_NL, Q4_K_M, Q6_K; se incluye tambien el archivo imatrix |
| Idiomas soportados | etiqueta declarada: en; el nombre del modelo base sugiere cobertura de 50 idiomas, pero no se aporta lista verificable |
| Licencia | cc-by-4.0 |
| Formato de pesos | GGUF (el modelo base esta en safetensors) |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura interna, el proceso de entrenamiento, el volumen de tokens, la composicion del dataset ni la existencia de fases de RLHF o DPO. La model card de este repositorio es una plantilla generica de cuantizacion de mradermacher y no describe el modelo subyacente. El unico dato estructural verificable es el numero de parametros del checkpoint original (8.953.803.264) y su condicion de modelo instructivo conversacional, indicada por la etiqueta `conversational` y por el sufijo `Instruct` del nombre.

La innovacion tecnica de este repositorio concreto es el uso de cuantizacion ponderada con imatrix (denominada i1 por mradermacher). Este metodo calcula una matriz de importancia a partir de estadisticas de activacion y la emplea para decidir que pesos se cuantizan con mas precision, lo que reduce la perplejidad frente a cuantizaciones estaticas del mismo tamano. El autor indica que las cuantizaciones IQ suelen ser preferibles a las no-IQ de tamano equivalente, y senala i1-Q4_K_M como la opcion recomendada por velocidad y calidad.

Ademas, la plantilla de la model card incluye una nota que afirma que el modelo es un modelo de vision y que los archivos mmproj, si existen, estarian en el repositorio estatico. Se trata de una advertencia generica de la plantilla del cuantizador; no se confirma en la informacion disponible que el modelo base tenga capacidades multimodales ni que se haya publicado ningun mmproj.

## Capacidades

- Generacion de texto conversacional en formato instruct, segun la etiqueta `conversational` del repositorio.
- Seguimiento de instrucciones multi-turno: el sufijo `Instruct` y el pipeline declarado apuntan a un modelo ajustado para responder a indicaciones.
- Capacidades multilingues: el nombre del modelo base menciona 50 idiomas, pero la unica etiqueta de idioma declarada en este repositorio es `en`, por lo que la cobertura multilingue no esta confirmada.
- Cuantizacion y despliegue local: al estar en formato GGUF, es compatible con inferencia en CPU, GPU y configuraciones mixtas mediante llama.cpp y derivados.
- Posible soporte de vision: la plantilla de la model card lo describe como modelo de vision con archivos mmproj en el repositorio estatico; no confirmado.
- Soporte de tool calling o function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Modo de razonamiento explicito (thinking): no disponible.

## Casos de uso

- Despliegue local en portatil o estacion de trabajo: con la cuantizacion i1-Q4_K_M (5,7 GB) el modelo cabe en GPUs de 8 GB de VRAM y permite asistentes conversacionales sin conexion a Internet ni coste por token.
- Prototipado rapido de aplicaciones de chat: las variantes IQ1_M e IQ2_M (3,0 y 3,7 GB) permiten levantar un servidor de inferencia de prueba en maquinas modestas para validar prompts, flujos y esquemas de respuesta antes de invertir en hardware.
- Servicio de atencion al cliente en local: al ser un modelo instruct de 9B, puede gestionar conversaciones multi-turno con contexto moderado; la longitud exacta de contexto no esta disponible, por lo que habria que medirla antes de fijar el limite de historial.
- Generacion y revision de texto en ingles: dado que el unico idioma declarado es `en`, es adecuado para redaccion, resumen y reescritura en ingles dentro de herramientas internas.
- Evaluacion comparativa de cuantizaciones: el repositorio ofrece 16 niveles distintos del mismo modelo, lo que permite medir en produccion la relacion entre tamano, velocidad y calidad para elegir el punto optimo de un pipeline ya existente.
- Inferencia en entornos sin GPU: mediante llama.cpp en CPU con las cuantizaciones de 2 y 3 bits, es viable ejecutar el modelo en servidores sin acelerador, aceptando una penalizacion de calidad y latencia.
- Fine-tuning posterior en formato de bajo rango: aunque este repositorio es GGUF, el checkpoint base en safetensors permite ajustes con LoRA sobre el modelo original y re-cuantizar despues a GGUF.
- Educacion e investigacion sobre cuantizacion: el archivo imatrix y los distintos niveles publicados sirven como material para estudiar el impacto de la cuantizacion ponderada en la perplejidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio no incluye tablas de MMLU, HumanEval, GSM8K ni de ninguna otra evaluacion, y tampoco se aportan mediciones de perplejidad para los distintos niveles de cuantizacion. La unica referencia grafica mencionada es un grafico externo de ikawrakow sobre perplejidad de tipos de cuantizacion, que no aporta cifras concretas para este modelo.

## Requisitos de hardware

- VRAM estimada segun el tamano de archivo publicado, mas el espacio adicional para cache KV y buffers (orientativo):
  - i1-IQ1_M (3,0 GB): alrededor de 3-4 GB de VRAM efectiva.
  - i1-IQ2_M (3,7 GB) e i1-Q2_K (3,9 GB): alrededor de 4-5 GB.
  - i1-IQ3_M (4,5 GB) e i1-Q3_K_M (4,7 GB): alrededor de 5-6 GB.
  - i1-IQ4_XS (5,3 GB) e i1-Q4_K_M (5,7 GB, recomendada por el autor): alrededor de 6-8 GB.
  - i1-Q6_K (7,5 GB): alrededor de 8-10 GB.
- GPU recomendadas: cualquier GPU con 8 GB o mas de VRAM para las cuantizaciones de 4 bits (por ejemplo, RTX 3060 Ti, RTX 4060 Ti, RTX 3070, RTX 4070). Para Q6_K o para contextos largos conviene una GPU de 12-16 GB (RTX 4070 Ti Super, RTX 4080, RTX 4090, A100, H100).
- En GPU de consumo: si, las cuantizaciones de 4 bits caben en GPUs consumer de 8 GB, y las de 2-3 bits en GPUs de 6 GB o en modo mixto GPU/CPU.
- Sin GPU: las variantes de 2 y 3 bits son ejecutables en CPU mediante llama.cpp con RAM suficiente (se recomienda al menos 8 GB de RAM libre).
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui con backend llama.cpp, kobold.cpp y servidores compatibles con GGUF. Para el modelo base en safetensors se puede usar transformers; vLLM y TGI son opciones para el checkpoint original, con compatibilidad limitada o nula para los quants GGUF de este repositorio.
- Latencia y throughput: no disponibles. El autor no publica mediciones para este modelo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| mradermacher/AfriqueQwen3.5-9B-50Langs-Instruct-v1-i1-GGUF (este) | 8,95B | no disponible | GGUF (imatrix, 16 niveles) | cc-by-4.0 | Cuantizacion ponderada con imatrix; repo de 68,2 GB |
| mradermacher/AfriqueQwen3.5-9B-50Langs-Instruct-v1-GGUF | 8,95B | no disponible | GGUF (cuantizacion estatica) | cc-by-4.0 | Mismo modelo base con quants estaticos; incluiria los mmproj si existieran |
| McGill-NLP/AfriqueQwen3.5-9B-50Langs-Instruct-v1 | 8,95B | no disponible | safetensors | no disponible en la informacion | Checkpoint original sin cuantizar, en precision completa |

No se dispone de datos de rendimiento comparado con modelos de otras familias de la misma categoria, ni de mediciones que permitan contrastar calidad entre estas tres variantes. Cualquier comparacion con alternativas de 9B de otros desarrolladores requeriria ejecutar la misma bateria de evaluaciones sobre ambos modelos.

## Limitaciones y advertencias

- Ausencia de documentacion: la model card es una plantilla generica de cuantizacion; no hay informacion sobre datos de entrenamiento, sesgos, idiomas reales ni evaluaciones.
- Idioma declarado: la unica etiqueta de idioma es `en`, pese a que el nombre del modelo base menciona 50 idiomas. Si el caso de uso requiere castellano u otras lenguas, hay que verificarlo empiricamente antes de integrarlo.
- Riesgo de alucinacion: no cuantificado; como en cualquier modelo de 9B sin evaluacion publica, se debe validar la salida en dominios sensibles (medicina, derecho, finanzas).
- Degradacion por cuantizacion agresiva: el propio autor etiqueta i1-IQ1_M como "mostly desperate" y i1-Q2_K_S como "very low quality". Las variantes de 1 y 2 bits no son aptas para produccion con requisitos de calidad.
- Perdida de capacidades por cuantizacion: un modelo ajustado para instrucciones puede mostrar degradacion desproporcionada en tareas de razonamiento o codigo al bajar de 4 bits.
- Longitud de contexto desconocida: sin dato de contexto maximo, no se puede dimensionar la cache KV ni garantizar conversaciones largas; el consumo de VRAM crece con el contexto.
- Licencia: CC-BY-4.0 permite uso comercial, pero exige atribucion al autor original y al cuantizador, e indica que no se otorgan garantias.
- Vision no confirmada: la mencion a capacidades de vision proviene de una plantilla generica; no consta ningun archivo mmproj publicado en este repositorio.
- Fechas y metricas del repositorio: el repositorio registra 0 descargas y 0 likes, sin historial de validacion por parte de la comunidad.

## Enlaces

- Repositorio HuggingFace de las cuantizaciones i1: https://huggingface.co/mradermacher/AfriqueQwen3.5-9B-50Langs-Instruct-v1-i1-GGUF
- Repositorio de cuantizaciones estaticas: https://huggingface.co/mradermacher/AfriqueQwen3.5-9B-50Langs-Instruct-v1-GGUF
- Modelo base: https://huggingface.co/McGill-NLP/AfriqueQwen3.5-9B-50Langs-Instruct-v1
- Pagina de resumen y descargas del cuantizador: https://hf.tst.eu/model#AfriqueQwen3.5-9B-50Langs-Instruct-v1-i1-GGUF
- Peticiones de modelos de mradermacher: https://huggingface.co/mradermacher/model_requests
- Grafico de perplejidad por tipo de cuantizacion (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizacion: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- README de referencia sobre uso de GGUF: https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- nethype GmbH: https://www.nethype.de/
