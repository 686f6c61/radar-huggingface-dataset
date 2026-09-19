# litert-community/GLiNER2.5-Small-LiteRT

## Resumen

GLiNER2.5-Small-LiteRT es una conversion del checkpoint `fastino/gliner2.5-small-v1` a formato LiteRT (`.tflite`) para ejecutar extraccion de entidades nombradas sobre la GPU de un telefono Android. Lo publica la organizacion `litert-community`, que distribuye pesos ya convertidos y validados para el runtime LiteRT de Google. El modelo resuelve un problema muy concreto: llevar un extractor de informacion basado en GLiNER2 al dispositivo, sin conexion de red y sin depender de un servidor, manteniendo resultados identicos a la implementacion de referencia en CPU.

La arquitectura subyacente es un encoder DeBERTa-v3-xsmall con la parte densa del `BoundaryExtractor` de GLiNER2: encoder de fronteras, cabeza de consulta de fronteras y proyecciones por token. El grafo exportado no cubre el pipeline completo: el host se encarga del lookup de embeddings de palabra y de la decodificacion dispersa (pooling de candidatos, scoring y decodificacion de spans) mediante el paquete `gliner2` 2.0.0.

Se distribuyen tres tamanos de ventana (128, 256 y 512 tokens codificados, con limites de 48, 192 y 384 palabras de texto), cada uno en dos variantes de precision: `wfp16` (pesos en float16 con DEQUANTIZE a float32, activaciones y resto de constantes en float32) y `fp32` de referencia. La configuracion validada es LiteRT 2.2.0 con computo GPU FP32 explicito sobre un Samsung Galaxy S26 (SM-S942Q, SM8850, Android 16); otras familias de GPU Android no se han validado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DeBERTa-v3-xsmall (encoder) + parte densa del BoundaryExtractor de GLiNER2 (encoder de fronteras, cabeza de consulta de fronteras, proyecciones por token) |
| Parametros totales | no disponible (la tabla de embeddings de palabra contiene 128.011 x 384 = 49.156.224 parametros segun `word_embeddings_fp32.bin`) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | ventanas fijas de 128, 256 o 512 tokens codificados; limite de texto de 48, 192 o 384 palabras respectivamente; una sola ventana por ejecucion |
| Tipos de cuantizacion | `wfp16` (96 tensores FULLY_CONNECTED en float16 con DEQUANTIZE a float32; activaciones y demas constantes en float32) y `fp32`. Variantes INT8 de rango dinamico construidas y evaluadas pero no publicadas |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | `.tflite` (LiteRT) para el grafo; `sparse_decoder_fp32.safetensors` para el decodificador disperso; `.bin` (float32 row-major) para la tabla de embeddings |

## Arquitectura y entrenamiento

El grafo exportado contiene unicamente la parte densa del `BoundaryExtractor`: el encoder DeBERTa-v3-xsmall, el encoder de fronteras, la cabeza de consulta de fronteras y las proyecciones por token. La entrada son las filas de embeddings de palabra (el host realiza antes el lookup sobre una tabla de `[128011, 384]` en float32) y la salida es un unico tensor float32 empaquetado con 17 salidas logicas. Despues del grafo, el host ejecuta el pooling disperso de candidatos, el scoring y la decodificacion de spans de la implementacion upstream.

Las tres ventanas comparten la misma tabla de embeddings (196.624.896 B) y el mismo decodificador disperso (465.924 B de pesos en 16 tensores). Los ficheros `graph_contract_s{128,256,512}.json` documentan las formas de entrada y el offset de cada rebanada de salida logica. La variante `wfp16` mantiene en float32 todas las activaciones y todas las constantes salvo los pesos de las capas totalmente conectadas, que se almacenan en float16 y se dequantizan a float32 en tiempo de ejecucion.

No se detallan en la informacion disponible los datos de entrenamiento del checkpoint base (numero de tokens, composicion del dataset, uso de RLHF o DPO). El modelo es un finetune publicado como `fastino/gliner2.5-small-v1` y referencia el paper arXiv:2507.18546 en sus metadatos; el contenido de dicho paper no forma parte de la informacion proporcionada. La innovacion tecnica de esta publicacion no es el entrenamiento, sino la conversion y validacion del grafo para LiteRT con equivalencia exacta frente a la implementacion de referencia.

## Capacidades

- Reconocimiento de entidades nombradas y extraccion de informacion por token-classification sobre texto en ingles.
- Esquema de etiquetas fijo en esta validacion: `person`, `organization`, `location`, `product`, `date` (cinco etiquetas). Otros esquemas quedan fuera de lo validado.
- Devuelve span de texto con offsets de caracter y confianza por entidad (por ejemplo, `"Maya Chen"`, start 0, end 9, confidence 0.9995).
- Ejecucion en GPU de telefono Android mediante LiteRT `CompiledModel` con computo FP32 explicito.
- Ejecucion en CPU de escritorio mediante la API Python de LiteRT (ejemplo con `num_threads=4`).
- Tres tamanos de ventana seleccionables: s128 (48 palabras), s256 (192 palabras), s512 (384 palabras).
- No dispone de generacion de texto, razonamiento, codigo, matematicas, vision, audio, tool calling ni modo thinking: es un extractor, no un modelo generativo.
- No soporta multi-turno ni agentes; cada ejecucion procesa un unico texto y una unica ventana.

## Casos de uso

- Extraccion de contactos y organizaciones en el dispositivo: una aplicacion de notas o CRM puede ejecutar el modelo s256 sobre una nota de hasta 192 palabras en la GPU del telefono y guardar los spans de `person` y `organization` localmente, sin enviar el texto a ningun servidor.
- Anonimizacion previa al envio a la nube: el modelo permite localizar nombres de persona, organizaciones y ubicaciones antes de transmitir un texto a un servicio externo, reduciendo la exposicion de datos personales en cumplimiento del RGPD.
- Digitalizacion de partes de trabajo en campo: en una aplicacion Android de mantenimiento, el modelo s512 puede extraer producto, ubicacion y fecha de un parte de hasta 384 palabras y volcarlos a campos estructurados sin conexion.
- Indexado local de correo o mensajes: extraer remitente (`person`), empresa (`organization`) y fecha (`date`) de cada mensaje para construir un indice de busqueda en el propio dispositivo, con la ventana s128 como opcion de menor coste.
- Analitica de resenas en comercio electronico: procesar resenas breves (hasta 48 palabras con s128) para identificar producto y fecha, agregando resultados en el dispositivo y evitando enviar texto de usuarios a terceros.
- Logistica y mensajeria: extraer origen, destino y fecha de mensajes operativos de hasta 192 palabras con s256 para rellenar automaticamente albaranes o etiquetas de envio.
- Preprocesamiento de pipelines RAG: usar el modelo como etapa de etiquetado estructurado sobre documentos ya troceados, de forma que el sistema posterior pueda filtrar por entidad (por ejemplo, solo fragmentos que mencionen una organizacion concreta) sin coste de API.
- Extraccion en primer plano en aplicaciones con requisitos de privacidad estrictos: al ejecutarse en la GPU del telefono y no requerir red, encaja en escenarios donde el texto no puede salir del dispositivo por politica interna.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. El unico dato de calidad publicado es una prueba de equivalencia funcional frente a la implementacion de referencia:

| Prueba | Configuracion | Resultado |
|---|---|---|
| Equivalencia de spans frente a gliner2 fp32 CPU | 70 entradas en ingles, todas las ventanas distribuidas (s128, s256, s512) | micro-F1 1.000 por etiqueta y por offsets de caracter |
| Precedencia FP32 en GPU | LiteRT 2.2.0, precision GPU por defecto | la salida del encoder es NaN desde la primera salida logica |
| Precedencia FP32 explicita en GPU | LiteRT 2.2.0, computo GPU FP32 explicito, Samsung Galaxy S26 (SM-S942Q, SM8850, Android 16) | todas las comprobaciones pasan |
| Variantes INT8 de rango dinamico | LiteRT 2.2.0 CompiledModel GPU (ML Drift) | no compilan: "Unable to parse bc coord for BATCH axis" en los operadores FULLY_CONNECTED cuantizados |
| Ejecucion en NPU | no evaluada | no disponible |

## Requisitos de hardware

- Huella de pesos en disco (variante recomendada `wfp16`): 54.051.424 B para s128, 63.906.288 B para s256 y 84.111.584 B para s512, mas 196.624.896 B de la tabla de embeddings compartida y 465.924 B del decodificador disperso. Total aproximado entre 251 MB (s128) y 281 MB (s512).
- Variantes `fp32` de referencia: 98.018.428 B (s128), 107.873.296 B (s256) y 128.078.592 B (s512), con la misma tabla de embeddings.
- Salida empaquetada por ejecucion: 57.758 floats (s128), 217.310 floats (s256) y 430.046 floats (s512) en float32, es decir, aproximadamente 231 KB, 869 KB y 1,72 MB.
- VRAM en GPU de escritorio: no disponible; la informacion proporcionada solo valida GPU Android (LiteRT) y CPU de escritorio. No hay datos para A100, H100 ni RTX 4090, y el modelo no esta pensado para ese tipo de aceleradores.
- GPU movil validada: Samsung Galaxy S26 (SM-S942Q, SM8850, Android 16) con LiteRT 2.2.0 y computo GPU FP32 explicito. Otras familias de GPU Android no han sido validadas. La NPU no se evaluo.
- CPU: el ejemplo oficial de escritorio ejecuta el grafo con `HardwareAccelerator.CPU` y `CpuOptions(num_threads=4)`, de modo que es viable en equipos sin GPU compatible, con la penalizacion de latencia correspondiente.
- Despliegue: API `CompiledModel` de LiteRT (Python y Android) con seleccion de acelerador. No se contemplan vLLM, llama.cpp, Ollama ni TGI, ya que el artefacto es un `.tflite` de token-classification y no un modelo generativo. El decodificador disperso requiere el paquete `gliner2` 2.0.0 fijado en `requirements-lock.txt` y funciona con `HF_HUB_OFFLINE=1`.
- Latencia y throughput: no disponible. No se publican medidas de tiempo por inferencia ni de ejecuciones por segundo en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Formato | Ventanas | Precision | Lenguaje | Licencia | Estado |
|---|---|---|---|---|---|---|
| litert-community/GLiNER2.5-Small-LiteRT | `.tflite` (LiteRT) | 128 / 256 / 512 tokens | wfp16 y fp32 | en | apache-2.0 | Publicado; GPU Android validada solo en SM8850 |
| fastino/gliner2.5-small-v1 (modelo base) | Safetensors (PyTorch) | no disponible en la informacion | fp32 (referencia CPU) | en | no disponible en la informacion | Publicado; es la implementacion de referencia usada en la prueba de equivalencia |
| Otras conversiones LiteRT de GLiNER2 | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible en la informacion |

No se dispone de datos sobre alternativas de la misma categoria (otros extractores NER en formato LiteRT o comparables en tamano) en la informacion proporcionada, por lo que no se puede establecer una comparativa de rendimiento con terceros.

## Limitaciones y advertencias

- Solo ingles. El propio autor indica que otros idiomas quedan fuera de lo validado.
- Esquema de etiquetas fijo: `person`, `organization`, `location`, `product`, `date`. Otros esquemas no se han validado.
- Una sola ventana por ejecucion. Los textos mas largos que 48, 192 o 384 palabras (segun la ventana elegida) no estan cubiertos; tampoco hay solapamiento ni agregacion entre ventanas documentada.
- La validacion de equivalencia se hizo con 70 entradas en ingles, un conjunto reducido. No es una evaluacion exhaustiva de robustez ni de sesgos.
- Precision GPU: con la precision por defecto del runtime la salida del encoder es NaN desde la primera salida logica. Es obligatorio activar el computo GPU FP32 explicito en LiteRT 2.2.0. Este es el caveat mas critico para produccion.
- Compatibilidad de GPU limitada: solo se ha validado una familia de GPU Android (SM8850). Otras GPU Android y la NPU no se evaluaron.
- No hay ficheros INT8 publicados: las variantes de rango dinamico fallan al compilar en LiteRT 2.2.0 CompiledModel GPU por un error de ML Drift en los operadores FULLY_CONNECTED cuantizados.
- El modelo es un extractor discriminativo: no genera texto, no razona y no soporta tool calling ni agentes. No debe presentarse como un LLM.
- Riesgo de alucinacion acotado por diseno (no genera texto libre), pero persiste el riesgo de spans incorrectos o confianzas altas sobre entidades mal delimitadas, especialmente en textos fuera de la distribucion de entrenamiento.
- Sesgos: no hay informacion publicada sobre sesgos demograficos, geograficos o de dominio del checkpoint base.
- Licencia apache-2.0 en el repositorio de conversion, lo que permite uso comercial, pero no se detalla en la informacion la licencia del checkpoint base mas alla de lo indicado en los metadatos de esta ficha.
- Dependencia de la version del runtime: el pipeline asume LiteRT 2.2.0 y `gliner2` 2.0.0 fijados en `requirements-lock.txt`; cambios de version pueden romper la equivalencia numerica.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de uso en produccion por terceros.

## Enlaces

- Ficha en HuggingFace: https://huggingface.co/litert-community/GLiNER2.5-Small-LiteRT
- Modelo base: https://huggingface.co/fastino/gliner2.5-small-v1
- Paper referenciado en los metadatos: arXiv:2507.18546
- Resultados de la busqueda web: no se encontro ningun enlace relevante. Las consultas devolvieron contenido no relacionado con el modelo (foros de soporte y preguntas sin conexion con GLiNER2 ni con LiteRT).
