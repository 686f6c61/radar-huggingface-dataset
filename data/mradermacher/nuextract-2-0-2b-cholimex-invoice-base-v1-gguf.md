# mradermacher/NuExtract-2.0-2B-Cholimex-Invoice-Base-V1-GGUF

## Resumen

NuExtract-2.0-2B-Cholimex-Invoice-Base-V1-GGUF es una cuantizacion estatica en formato GGUF del modelo imtaiteam/NuExtract-2.0-2B-Cholimex, un afinamiento especializado de NuExtract 2.0 orientado a la extraccion estructurada de informacion de facturas. El trabajo de cuantizacion lo firma mradermacher, un autor habitual en la publicacion de versiones GGUF de modelos open source, y esta pensado para su uso con llama.cpp y derivados (Ollama, LM Studio, etc.) en entornos donde no se dispone de GPU dedicada o se quiere minimizar el consumo de VRAM.

El modelo subyacente parte de la familia NuExtract 2.0, disenada para tareas de extraccion de informacion con esquemas JSON definidos por el usuario. Esta variante concreta, identificada como "Invoice-Base-V1", ha sido entrenada mediante SFT (supervised fine-tuning) con la libreria TRL sobre el modelo base NuExtract-2.0-2B-Cholimex, y conserva el caracter multimodal del modelo original, tal como evidencia la presencia de ficheros mmproj (proyeccion multimodal) en el repositorio. El numero real de parametros almacenados en safetensors es de 1.543.714.304, es decir, aproximadamente 1,54 mil millones.

La relevancia de esta ficha radica en que ofrece una via practica de despliegue local de un modelo de extraccion de documentos con capacidades de vision, algo poco frecuente en el rango de 2B. Sin embargo, la informacion publicada por el autor de la cuantizacion es minima: no se documentan benchmarks, contexto nativo, licencia ni detalles del dataset de entrenamiento, por lo que muchas de las filas de la tabla tecnica deben marcarse como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (modelo base NuExtract-2.0-2B-Cholimex); detalles de atencion no disponibles |
| Parametros totales | 1.543.714.304 (~1,54 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16; ademas mmproj-Q8_0 y mmproj-f16 |
| Idiomas soportados | en (segun la model card) |
| Licencia | no disponible |
| Formato de pesos | GGUF (cuantizaciones estaticas); se menciona convert_type: hf en los metadatos de la model card |

## Arquitectura y entrenamiento

El modelo base NuExtract-2.0-2B-Cholimex es un transformer de aproximadamente 1,54 mil millones de parametros con capacidades multimodales, segun se deduce de la presencia de los ficheros mmproj en el repositorio GGUF, que son el componente de proyeccion visual que permite a llama.cpp procesar imagenes junto al texto. No se dispone de informacion detallada sobre el numero de capas, dimensiones ocultas, mecanismo de atencion ni tipo de tokenizador en la informacion proporcionada.

El afinamiento se realizo mediante SFT (supervised fine-tuning) con TRL, segun las etiquetas del repositorio, partiendo de imtaiteam/NuExtract-2.0-2B-Cholimex. El nombre "Invoice-Base-V1" sugiere un entrenamiento orientado especificamente a facturas, aunque no se documenta la composicion del dataset, el numero de tokens de entrenamiento ni si se aplicaron tecnicas adicionales como RLHF o DPO. La cuantizacion realizada por mradermacher es de tipo estatico (quantize_version 2, output_tensor_quantised 1) y no incluye, por el momento, variantes con imatrix o weighted quants, lo que el propio autor indica explicitamente en la model card.

## Capacidades

- Extraccion de informacion estructurada: el modelo esta disenado para generar JSON a partir de un esquema definido por el usuario, aplicado aqui al dominio de facturas.
- Procesamiento multimodal: la presencia de ficheros mmproj confirma soporte de entrada de imagenes, lo que permite procesar facturas escaneadas o fotografias de documentos.
- Generacion de texto conversacional: las etiquetas incluyen "conversational", por lo que admite formato de chat multi-turno.
- Capacidad de seguir instrucciones mediante SFT: el entrenamiento supervisado con TRL sugiere alineacion basica con instrucciones.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: la model card declara unicamente ingles (en).
- Capacidades especiales (thinking mode, audio, etc.): no disponible en la informacion proporcionada.

## Casos de uso

- Digitalizacion de facturas en papel: el modelo puede recibir una imagen de factura (gracias al componente mmproj) y devolver un JSON con campos como proveedor, CIF, fecha, base imponible, IVA y total, integrándose en un pipeline de contabilidad automatizada.
- Procesamiento por lotes en servidores sin GPU: con las cuantizaciones Q4_K_M (1,1 GB) o Q5_K_M (1,2 GB) puede ejecutarse en CPU con llama.cpp, lo que permite procesar volumenes altos de documentos en infraestructura modesta.
- Extraccion de datos para ERP: los campos extraidos en JSON pueden mapearse directamente a un ERP o sistema de gestion de gastos, reduciendo la introduccion manual de datos.
- Validacion y conciliacion de facturas: el modelo puede extraer los importes y referencias para cruzarlos con pedidos de compra o albaranes en un flujo de conciliacion automatica.
- Despliegue en el borde (edge) o en portatiles: al ocupar menos de 2 GB en Q8_0 y 3,2 GB en f16, cabe en equipos de desarrollo convencionales y permite prototipar sin infraestructura cloud.
- Investigacion sobre extraccion de informacion multimodal: sirve como punto de partida de bajo coste para experimentar con esquemas JSON personalizados y evaluar el comportamiento del modelo ante distintos formatos de factura.
- Chatbot interno de consulta documental: con el formato conversacional puede integrarse en un asistente que responda preguntas sobre facturas concretas introducidas por el usuario.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos, sin overhead de contexto): aproximadamente 0,8 GB en Q2_K, 1,0-1,1 GB en Q4_K_S/Q4_K_M, 1,2 GB en Q5_K_M, 1,4 GB en Q6_K, 1,7 GB en Q8_0 y 3,2 GB en f16. A esto hay que sumar el componente mmproj (0,8 GB en Q8_0 o 1,4 GB en f16) si se procesan imagenes.
- GPU recomendadas: no se especifican en la informacion disponible. Por tamano, cualquier GPU consumer con 4 GB o mas de VRAM (GTX 1650, RTX 3050, RTX 4060, etc.) deberia poder alojar las cuantizaciones de 4-8 bits; para f16 con vision se recomienda al menos 6-8 GB.
- Cabe en GPU consumer: si, en la mayoria de tarjetas graficas modernas, e incluso en CPU gracias a las cuantizaciones K-quant.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio y cualquier runtime compatible con GGUF; los ficheros mmproj permiten el modo multimodal en llama.cpp. La model card indica compatibilidad con endpoints (tag endpoints_compatible).
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Multimodal | Licencia | Formato |
|---|---|---|---|---|---|
| NuExtract-2.0-2B-Cholimex-Invoice-Base-V1 (esta ficha) | ~1,54 B | no disponible | si (mmproj) | no disponible | GGUF |
| NuExtract-2.0-2B (original de NuMind) | ~2 B (nominal) | no disponible | si (vision) | no disponible en esta ficha | safetensors / GGUF |
| Modelos de extraccion tipo LayoutLMv3 | ~0,13 B | 512 tokens tipico | si (documento) | MIT (segun version) | safetensors |
| LLMs genericos de 2-3 B (p. ej. Qwen2.5-3B) | ~3 B | 32k tokens (tipico) | no en version base | Apache 2.0 (tipico) | safetensors / GGUF |

La comparativa es necesariamente limitada porque no se han publicado datos de rendimiento para esta variante. Frente a LayoutLMv3, el modelo aqui descrito ofrece generacion libre de JSON y no requiere un esquema fijo de etiquetado, a costa de un mayor tamano. Frente a LLMs genericos de 2-3 B, su ventaja es el afinamiento especifico para facturas y la integracion multimodal ya empaquetada en GGUF, aunque carece de la documentacion y el ecosistema de aquellos.

## Limitaciones y advertencias

- La model card no especifica la licencia, lo que impide confirmar si el uso comercial esta permitido; es imprescindible consultar la licencia del modelo base imtaiteam/NuExtract-2.0-2B-Cholimex antes de desplegarlo en produccion.
- El unico idioma declarado es el ingles; el rendimiento en castellano o en facturas con campos en otros idiomas no esta documentado.
- No se han publicado benchmarks, por lo que no hay evidencia cuantitativa de su precision en extraccion de campos (por ejemplo, exactitud por campo o tasa de JSON valido).
- Riesgo de alucinacion inherente a los modelos generativos: puede inventar valores numericos o campos ausentes en la factura, algo especialmente critico en datos fiscales.
- El autor de la cuantizacion advierte de que las variantes Q3_K_M son de calidad inferior y que no hay quants con imatrix disponibles; para produccion se recomienda Q4_K_M o superior.
- El modelo es un afinamiento muy especifico ("Invoice-Base-V1"); su comportamiento fuera del dominio de facturas no esta documentado y probablemente sea deficiente.
- La fecha de actualizacion del repositorio (2026-11-03) es posterior a la de creacion y no se acompana de un changelog, por lo que no se puede saber si los pesos han cambiado.
- El numero de descargas (24) y de likes (0) es muy bajo, lo que sugiere poca validacion por parte de la comunidad.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/NuExtract-2.0-2B-Cholimex-Invoice-Base-V1-GGUF
- Modelo base: https://huggingface.co/imtaiteam/NuExtract-2.0-2B-Cholimex
- Pagina de conveniencia del cuantizador: https://hf.tst.eu/model#NuExtract-2.0-2B-Cholimex-Invoice-Base-V1-GGUF
- FAQ y peticiones de cuantizacion de mradermacher: https://huggingface.co/mradermacher/model_requests
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Analisis de tipos de cuantizacion (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
