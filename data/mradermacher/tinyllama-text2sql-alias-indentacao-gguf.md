# mradermacher/TinyLlama-text2SQL-alias-indentacao-GGUF

## Resumen

TinyLlama-text2SQL-alias-indentacao-GGUF es una cuantizacion en formato GGUF del modelo NESPED-GEN/TinyLlama-text2SQL-alias-indentacao, publicada por el usuario mradermacher. El modelo original es un ajuste fino de TinyLlama (1.100 millones de parametros) orientado a la traduccion de lenguaje natural a SQL (text-to-SQL), con un enfasis particular en el manejo de alias de tablas y columnas y en el formateo con indentacion del SQL generado. Esta version GGUF esta pensada para su ejecucion en CPU y en GPUs de gama baja mediante llama.cpp y herramientas compatibles.

El interes de esta publicacion es practico: ofrece el modelo en una docena de niveles de cuantizacion que van desde 0,5 GB (Q2_K) hasta 2,3 GB (f16), lo que permite desplegar un generador de SQL en entornos con recursos muy limitados, incluidos portatiles sin GPU dedicada o dispositivos de borde. La contrapartida es que se trata de un modelo de 1,1B parametros, con las limitaciones de razonamiento y contexto que ello implica, y con una model card muy escasa que no documenta datos de entrenamiento, licencia ni resultados de evaluacion.

La ficha se centra en lo que puede verificarse a partir de los metadatos y la model card disponibles: arquitectura TinyLlama, 1.100.048.384 parametros, idioma declarado ingles, licencia no especificada y una coleccion de cuantizaciones GGUF estaticas (sin imatrix). No hay informacion publicada sobre longitud de contexto efectiva, composicion del dataset de ajuste ni benchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (base TinyLlama; detalles de atencion no documentados en la informacion disponible) |
| Parametros totales | 1.100.048.384 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible (TinyLlama base soporta 2048 tokens, pero no se confirma en esta ficha) |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_0_4_4, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | en (segun metadatos) |
| Licencia | no disponible |
| Formato de pesos | GGUF (cuantizaciones estaticas; no hay quants con imatrix) |

## Arquitectura y entrenamiento

El modelo base es TinyLlama, un transformer decoder-only de 1.100 millones de parametros. Sobre esa base, NESPED-GEN realizo un ajuste fino orientado a text-to-SQL con enfasis en dos aspectos: el uso de alias para tablas y columnas, y la indentacion del SQL resultante. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de RLHF, DPO o SFT supervisado. La model card del repositorio GGUF no aporta ningun detalle adicional sobre el proceso de entrenamiento del modelo original.

La publicacion de mradermacher es una conversion a GGUF de las cuantizaciones estaticas del modelo original, sin quants ponderados ni imatrix (el autor indica que no parece haber planes de generarlos). La conversion se realizo con la herramienta estandar de llama.cpp, con `quantize_version: 2` y `output_tensor_quantised: 1` segun los metadatos internos. No se documentan innovaciones tecnicas adicionales como decodificacion especulativa o atencion lineal.

## Capacidades

- Generacion de consultas SQL a partir de descripciones en lenguaje natural, con soporte explicito para alias de tablas y columnas.
- Formateo del SQL generado con indentacion consistente, lo que facilita su lectura y su integracion en revisiones de codigo.
- Generacion de texto general, heredada de la base TinyLlama, aunque el ajuste fino esta orientado a la tarea text-to-SQL.
- Conversacion multi-turno basica (el tag `conversational` aparece en los metadatos del repositorio).
- Compatibilidad con endpoints de inferencia (tag `endpoints_compatible`).
- No se documenta soporte de tool calling, function calling, agentes, vision, audio ni modo de razonamiento explicito.
- Capacidad multilingue limitada al ingles segun los metadatos; no hay evidencia de soporte de castellano u otros idiomas.

## Casos de uso

- Asistente de consultas en bases de datos internas: el modelo traduce preguntas en ingles a SQL con alias explicitos, lo que reduce la ambiguedad en esquemas con tablas y columnas de nombres similares; adecuado por su tamano reducido para desplegarse junto a la base de datos sin coste de GPU.
- Generacion de SQL en herramientas de BI para usuarios no tecnicos: se puede integrar en un cuadro de texto donde el usuario describe lo que quiere y el modelo devuelve una consulta indentada lista para ejecutar o revisar.
- Prototipado rapido de pipelines text-to-SQL: al ocupar entre 0,5 y 1,3 GB en cuantizaciones habituales, permite iterar en portatiles sin GPU y validar la viabilidad de la tarea antes de invertir en modelos mayores.
- Generacion de consultas de ejemplo para documentacion y tests: el modelo puede producir SQL indentado y con alias para poblar ejemplos en documentacion tecnica o en suites de pruebas de una capa de acceso a datos.
- Despliegue en entornos de borde o air-gapped: al ejecutarse con llama.cpp en CPU, encaja en escenarios sin conectividad ni GPU, como estaciones de trabajo aisladas con bases de datos locales.
- Educacion y formacion en SQL: sirve como generador de ejemplos de consultas con alias e indentacion para materiales docentes, siempre con revision humana dada la tasa de error esperable en un modelo de 1,1B.
- Preprocesado en pipelines de datos: puede generar borradores de consultas que luego se validan sintacticamente y se corrigen con un parser SQL antes de su ejecucion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,5 GB con Q2_K, 0,7-0,8 GB con Q4_K_S/Q4_K_M, 1,0 GB con Q6_K y 1,3 GB con Q8_0; el f16 requiere unos 2,3 GB.
- GPU recomendadas: cualquier GPU consumer con 2 GB o mas de VRAM es suficiente, incluidas GTX 1050 Ti, GTX 1650, RTX 3050, RTX 4060 y superiores. En GPUs profesionales, A100 o H100 no aportan ventaja significativa por el reducido tamano del modelo.
- Cabe en GPU consumer: si, en practicamente cualquier GPU dedicada de los ultimos ocho anos, y tambien en iGPUs y CPU.
- Opciones de despliegue: llama.cpp, Ollama (previa importacion del GGUF), LM Studio, text-generation-webui y servidores compatibles con la API de OpenAI a traves de llama.cpp. El tag `endpoints_compatible` sugiere compatibilidad con endpoints de inferencia.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada. Por el tamano del modelo, se espera que en CPU moderna sea interactivo y en GPU consumer muy rapido, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Formato |
|---|---|---|---|---|---|
| TinyLlama-text2SQL-alias-indentacao (este) | 1,1B | no disponible | text-to-SQL con alias e indentacion | no disponible | GGUF |
| TinyLlama-1.1B (base) | 1,1B | 2048 tokens | generacion de texto general | Apache 2.0 (segun el modelo base original) | safetensors, GGUF |
| Defog SQLCoder-7B | 7B | no disponible en esta ficha | text-to-SQL | no disponible en esta ficha | safetensors, GGUF |
| CodeLlama-7B-Instruct | 7B | 16k tokens (segun la familia CodeLlama) | codigo y SQL | licencia Llama 2 | safetensors, GGUF |

La comparativa se limita a modelos de la misma categoria (text-to-SQL o generacion de codigo en abierto). Frente a SQLCoder-7B y CodeLlama-7B, este modelo ofrece un tamano mucho menor (1,1B frente a 7B), lo que reduce requisitos de hardware pero tambien la calidad esperada en consultas complejas. Los datos de contexto y licencia de los comparadores no se han verificado en la informacion disponible y deben confirmarse en sus respectivas fichas.

## Limitaciones y advertencias

- Modelo de 1,1B parametros: la precision en consultas SQL complejas (joins multiples, subconsultas, funciones de ventana) sera limitada en comparacion con modelos de 7B o superiores.
- Riesgo de alucinacion: puede inventar tablas, columnas o funciones SQL que no existen en el esquema; se recomienda validar la salida con un parser y contra el esquema real antes de ejecutarla.
- Idioma: los metadatos solo declaran ingles; el rendimiento en castellano no esta documentado y probablemente sea deficiente.
- Contexto: no se confirma la longitud de contexto efectiva; si se hereda de TinyLlama, 2048 tokens limita el tamano del esquema que se puede incluir en el prompt.
- Licencia no disponible: no se puede confirmar si el uso comercial esta permitido; es imprescindible verificar la licencia del modelo base NESPED-GEN/TinyLlama-text2SQL-alias-indentacao y, en ultima instancia, la de TinyLlama antes de usarlo en produccion.
- Cuantizaciones estaticas sin imatrix: las versiones de baja calidad (Q2_K, Q3_K_S, Q4_0_4_4) pueden degradar notablemente la calidad del SQL generado; se recomienda Q4_K_M o superior.
- Model card del repositorio GGUF muy escasa: no documenta dataset, evaluacion ni limitaciones especificas del ajuste fino.
- Sin soporte documentado de tool calling ni agentes: no es adecuado para flujos que requieran invocar funciones externas de forma estructurada.
- Repositorio con muy baja traccion (79 descargas, 0 likes): no hay evidencia de uso en produccion ni de validacion por la comunidad.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/mradermacher/TinyLlama-text2SQL-alias-indentacao-GGUF
- Modelo base: https://huggingface.co/NESPED-GEN/TinyLlama-text2SQL-alias-indentacao
- Pagina de descargas del autor: https://hf.tst.eu/model#TinyLlama-text2SQL-alias-indentacao-GGUF
- README de referencia para uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico de perplejidad por tipo de cuantizacion (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas sobre cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- FAQ y solicitudes de cuantizacion del autor: https://huggingface.co/mradermacher/model_requests
- nethype GmbH: https://www.nethype.de/
