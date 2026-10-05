# bartowski/TheDrummer_Artemis-31B-v1.2-GGUF

## Resumen

TheDrummer_Artemis-31B-v1.2-GGUF es el repositorio de cuantizaciones GGUF del modelo Artemis-31B-v1.2, publicado por bartowski. El modelo original lo desarrolla TheDrummer y esta ficha cubre exclusivamente la version cuantizada para inferencia local, no los pesos originales. Se trata de un modelo de 30.697.345.596 parametros (etiquetado como 31B), afinado para uso conversacional y clasificado con la etiqueta de pipeline any-to-any, lo que implica soporte de entrada multimodal de texto, imagen y audio siempre que se utilice el fichero mmproj correspondiente.

El repositorio es relevante porque ofrece el modelo en 17 formatos de cuantizacion distintos, desde bf16 completo (61,41 GB) hasta Q3_K_M (14,70 GB), lo que permite desplegarlo tanto en una GPU de gama alta como en equipos de consumo con 16 GB de VRAM. Todas las cuantizaciones se han generado con llama.cpp (release b11159) y, segun la model card, se ha utilizado imatrix, una tecnica de calibracion que mejora la calidad de las cuantizaciones de baja precision.

El modelo conserva el formato de prompt de la familia original, con tokens `<|turn>`, soporte explicito de declaracion de herramientas (`<|tool>`) y un canal de razonamiento (`<|channel>thought`). No se especifica la licencia, la longitud de contexto ni los idiomas soportados en la informacion disponible. El repositorio acumula 17.436 descargas y 12 likes, y ocupa 496,5 GB en total.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | 30.697.345.596 (31B segun la model card) |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | bf16, Q8_0, Q6_K_L, Q6_K, Q6_K_S, Q5_K_M, Q5_K_S, Q4_K_L, Q4_1, Q4_K_M, IQ4_NL, Q4_K_S, Q4_0, IQ4_XS, IQ3_M, Q3_K_L, Q3_K_M |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (bf16 y variantes K-quant / I-quant) |
| Modelo base | TheDrummer/Artemis-31B-v1.2 (relacion: quantized) |
| Modalidades de entrada | texto, imagen y audio (requiere fichero mmproj) |
| Decodificacion especulativa | no |
| Imatrix | si |
| Herramienta de cuantizacion | llama.cpp release b11159 |
| Tamano del repositorio | 496,5 GB |
| Fecha de creacion | 25 de septiembre de 2026 |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura interna del modelo base (tipo de transformer, uso de atencion lineal, mezcla de expertos o cualquier otra innovacion estructural) ni sobre el proceso de entrenamiento: numero de tokens, composicion del dataset, tecnicas de alineacion como RLHF, DPO o RLAIF. Estos datos no aparecen en la model card del repositorio de cuantizaciones y no deben darse por supuestos.

Lo que si se documenta es el proceso de cuantizacion. Las 17 variantes se han generado con llama.cpp (release b11159), empleando imatrix, un metodo que calcula una matriz de importancia a partir de datos de calibracion para preservar mejor los pesos criticos en precisiones bajas. El repositorio no aplica decodificacion especulativa. La model card documenta ademas el formato de prompt exacto: `<bos><|turn>system {system_prompt}<turn|> <|turn>user {prompt}<turn|> <|turn>model <|channel>thought <channel|>`, con una variante que inserta declaraciones de herramientas mediante bloques `<|tool>declaration:...<tool|>`. Este ultimo detalle indica que el modelo fue afinado con soporte de function calling en el propio formato conversacional.

## Capacidades

- Generacion de texto conversacional: el modelo esta etiquetado como "conversational" y su model card define un formato de chat de multiples turnos con roles de system, user y model.
- Entrada multimodal any-to-any: acepta texto, imagen y audio, siempre que se cargue el fichero mmproj indicado en la model card. Sin ese fichero, el uso queda limitado a texto.
- Modo de razonamiento explicito: el formato de prompt incluye un canal `thought` (`<|channel>thought`), lo que permite separar el razonamiento interno de la respuesta final.
- Tool calling / function calling: el formato de prompt define declaraciones de herramientas con nombre, descripcion y parametros en formato de esquema (por ejemplo, una funcion `get_stock_price` con el parametro `symbol`).
- Razonamiento multi-paso: la combinacion del canal de pensamiento y las declaraciones de herramientas permite encadenar llamadas en flujos de agente.
- Cuantizacion flexible: 17 variantes disponibles que permiten ajustar el equilibrio entre calidad y consumo de memoria.
- Capacidades especificas de codigo, matematicas o multilingues: no disponible (no se documentan en la informacion proporcionada).
- Idiomas soportados: no disponible.

## Casos de uso

- Asistente conversacional local: con la variante Q4_K_M (19,52 GB), el modelo se ejecuta en una GPU de 24 GB y permite mantener dialogos multi-turno sin enviar datos a servicios externos, algo relevante para entornos con requisitos de privacidad.
- Agente con herramientas en produccion interna: gracias al formato de declaracion de herramientas incluido en el prompt, se puede integrar en un orquestador que exponga funciones (consultas a bases de datos, APIs internas) y dejar que el modelo decida que llamar y con que parametros.
- Analisis de documentos con imagenes: usando el fichero mmproj, el modelo puede procesar capturas, diagramas o documentos escaneados junto con instrucciones de texto, lo que sirve para tareas de extraccion y resumen de informacion visual.
- Transcripcion y analisis de audio con contexto textual: la entrada de audio habilita escenarios como resumir una reunion a partir del audio y responder preguntas posteriores sobre el contenido.
- Razonamiento asistido con traza visible: el canal `thought` permite registrar el razonamiento intermedio para auditoria o depuracion en aplicaciones donde se necesita justificar una decision.
- Despliegue en estaciones de trabajo sin GPU dedicada de gran tamano: con Q3_K_M (14,70 GB) o IQ4_XS (17,23 GB) el modelo puede ejecutarse en equipos con 16 GB de VRAM o con reparto entre GPU y CPU.
- Prototipado rapido de aplicaciones conversacionales: las variantes Q4_K_S y IQ4_XS permiten iterar con tiempos de carga y consumo moderados antes de decidir una cuantizacion mayor.
- Evaluacion comparativa de cuantizaciones: el repositorio ofrece una escalera completa de precisiones (de Q3_K_M a Q8_0) para medir la degradacion de calidad en un caso de uso concreto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card del repositorio de cuantizaciones no incluye valores de MMLU, HumanEval, GSM8K ni de ninguna otra prueba estandar, y la busqueda web no aporta cifras de rendimiento para esta version del modelo.

## Requisitos de hardware

- VRAM estimada segun cuantizacion (peso de los ficheros, sin contar cache KV ni overhead):
  - Q3_K_M: 14,70 GB.
  - Q3_K_L: 15,62 GB.
  - IQ3_M: 16,40 GB.
  - IQ4_XS: 17,23 GB.
  - Q4_0: 18,08 GB.
  - Q4_K_S: 18,31 GB.
  - IQ4_NL: 19,40 GB.
  - Q4_K_M: 19,52 GB.
  - Q4_1: 19,77 GB.
  - Q4_K_L: 20,91 GB.
  - Q5_K_S: 21,99 GB.
  - Q5_K_M: 23,50 GB.
  - Q6_K_S: 25,76 GB.
  - Q6_K: 26,96 GB.
  - Q6_K_L: 28,29 GB.
  - Q8_0: 32,64 GB.
  - bf16: 61,41 GB (dividido en varios ficheros).
- Anadir a esas cifras el espacio de la cache KV, que depende del contexto configurado y de la implementacion; no se dispone del dato de longitud de contexto, por lo que no se puede calcular una estimacion cerrada.
- GPU de consumo: las cuantizaciones de 14,70 a 17,23 GB encajan en tarjetas de 16 GB (por ejemplo, RTX 4060 Ti 16 GB) con contexto reducido. Las de 18 a 21 GB requieren 24 GB (RTX 3090, RTX 4090) o reparto parcial con CPU. Las de 23,50 GB en adelante necesitan 24 GB con margen ajustado o 32 GB o mas (por ejemplo, RTX 5090 en caso de disponer de 32 GB, o A100 40 GB).
- GPU de centro de datos: bf16 y Q8_0 encajan sin problema en A100 80 GB o H100 80 GB. Una A100 40 GB no es suficiente para bf16 completo.
- Despliegue: llama.cpp (release b11159 es la utilizada para generar las cuantizaciones), Ollama, LM Studio, Jan, koboldcpp y llama-cpp-python. La etiqueta `endpoints_compatible` del repositorio sugiere compatibilidad con endpoints de inferencia alojados. Para entrada de imagen y audio es necesario el fichero mmproj y una build de llama.cpp con soporte multimodal.
- Latencia y throughput: no disponible. No se publican mediciones de tokens por segundo ni de tiempo hasta el primer token en la informacion disponible.
- Almacenamiento: el repositorio completo ocupa 496,5 GB; conviene descargar solo el fichero de la cuantizacion elegida.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Multimodalidad | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|---|
| bartowski/TheDrummer_Artemis-31B-v1.2-GGUF | 30,7B (31B) | no disponible | texto, imagen y audio con mmproj | no disponible | GGUF (17 cuantizaciones) | publico en HuggingFace |
| TheDrummer/Artemis-31B-v1.2 (modelo base) | 30,7B | no disponible | no disponible | no disponible | no disponible | publico en HuggingFace |
| bartowski/TheDrummer_Artemis-31B-v1.1-GGUF (version anterior) | 31B | no disponible | no disponible | no disponible | GGUF | publico en HuggingFace |

No se dispone de datos de benchmarks ni de especificaciones verificadas de alternativas de la misma categoria (por ejemplo, modelos densos de 30B aproximados de otras familias), por lo que no es posible establecer una comparacion cuantitativa de rendimiento. Cualquier comparacion de ese tipo requeriria ejecutar las mismas pruebas sobre cada modelo, y esos resultados no estan disponibles en la informacion proporcionada.

## Limitaciones y advertencias

- Licencia no especificada: al no indicarse licencia en el repositorio ni en la informacion disponible, es imprescindible verificar los terminos del modelo base TheDrummer/Artemis-31B-v1.2 antes de cualquier uso comercial.
- Idiomas no documentados: no hay confirmacion oficial de que idiomas estan soportados ni con que calidad, por lo que un despliegue multilingue exige pruebas propias.
- Longitud de contexto desconocida: sin este dato no se pueden dimensionar con precision la cache KV, el consumo de VRAM ni los casos de uso con documentos largos.
- Ausencia total de benchmarks: no hay cifras publicadas de MMLU, HumanEval, GSM8K ni de evaluaciones multimodales, de modo que el rendimiento real solo puede determinarse mediante pruebas propias.
- Riesgo de alucinacion: no se documenta ningun mecanismo de mitigacion ni evaluacion de fidelidad; como en cualquier modelo generativo, las respuestas deben verificarse en contextos sensibles.
- Degradacion por cuantizacion: las variantes de menor precision (Q3_K_M, Q3_K_L, IQ3_M) reducen la calidad respecto a Q6_K o Q8_0. Para uso en produccion se recomienda partir de Q4_K_M o superior, y validar la precision elegida con datos propios.
- Formatos heredados: Q4_0 y Q4_1 son formatos antiguos mantenidos por compatibilidad; las variantes K-quant e I-quant ofrecen mejor relacion calidad/tamano.
- Multimodalidad condicionada: la entrada de imagen y audio exige el fichero mmproj y una build compatible de llama.cpp. Sin ellos, el modelo funciona solo con texto aunque este etiquetado como any-to-any.
- Sin decodificacion especulativa: la propia model card indica que no se ha aplicado, por lo que no cabe esperar las ganancias de latencia asociadas a esa tecnica.
- Sesgos: no se documentan evaluaciones de sesgo ni la composicion del dataset de afinado, por lo que se desconocen los sesgos potenciales del modelo.
- Consumo de almacenamiento elevado: el repositorio completo ocupa 496,5 GB, lo que puede ser un problema en entornos con cuota de disco limitada.

## Enlaces

- Repositorio GGUF en HuggingFace: https://huggingface.co/bartowski/TheDrummer_Artemis-31B-v1.2-GGUF
- Modelo base TheDrummer/Artemis-31B-v1.2: https://huggingface.co/TheDrummer/Artemis-31B-v1.2
- Version anterior cuantizada (v1.1): https://huggingface.co/bartowski/TheDrummer_Artemis-31B-v1.1-GGUF
- Repositorio de llama.cpp: https://github.com/ggml-org/llama.cpp/
- Release b11159 de llama.cpp usada para la cuantizacion: https://github.com/ggml-org/llama.cpp/releases/tag/b11159
- Fichero Q4_K_M recomendado: https://huggingface.co/bartowski/TheDrummer_Artemis-31B-v1.2-GGUF/blob/main/TheDrummer_Artemis-31B-v1.2-Q4_K_M.gguf
- Listado de modelos de bartowski en HuggingFace: https://huggingface.co/bartowski/models
- Listado de modelos any-to-any en HuggingFace: https://huggingface.co/models?pipeline_tag=any-to-any
- Articulo de terceros que menciona Artemis 31B v1.1: https://note.com/samehadaonsen/n/nb9421b6f7bd4?hl=en
