# bharatgenai/Patram1.5-7B

## Resumen

Patram1.5-7B es un modelo multimodal de tipo imagen-texto a texto desarrollado por BharatGen AI, orientado especificamente a la comprension de documentos visuales indios. El modelo resuelve tareas de extraccion de pares clave-valor, respuesta a preguntas visuales (VQA), comprension de tablas y graficos, y OCR sobre documentos escaneados, con soporte de conversacion multi-turno y razonamiento en cadena de pensamiento.

Con 7.760 millones de parametros totales y pesos en formato safetensors, el modelo se distribuye bajo licencia Apache 2.0, aunque el acceso al repositorio esta restringido (gated) y requiere aceptar las condiciones en Hugging Face. Su pipeline es `image-text-to-text` y se integra con la libreria `transformers` mediante codigo personalizado (`custom_code`).

Su relevancia actual radica en la especializacion: frente a modelos multimodales genericos, Patram1.5-7B esta entrenado para el dominio documental indio, un nicho con alta demanda en digitalizacion administrativa, banca y servicios publicos donde los modelos occidentales rinden peor por diferencias de formato, idioma y estructura documental.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | 7.760.786.896 |
| Parametros activos | no disponible (no consta como MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna del modelo en la informacion proporcionada. Por los tags del repositorio (`image-text-to-text`, `transformers`, `custom_code`) se trata de un modelo multimodal que combina un codificador visual con un decodificador de lenguaje, pero no se especifica el tipo de transformer, el numero de capas, la dimension oculta ni el mecanismo de atencion empleado.

Tampoco se detallan el volumen de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO. Los tags indican capacidades declaradas de razonamiento en cadena de pensamiento (`chain-of-thought-reasoning`), OCR, comprension de tablas y graficos, y extraccion de pares clave-valor, lo que sugiere un entrenamiento orientado a tareas documentales estructuradas, pero no se aportan cifras concretas sobre el proceso.

## Capacidades

- Comprension de documentos visuales (`visual-document-understanding`): interpretacion de documentos escaneados o fotografiados.
- Respuesta a preguntas visuales (`visual-question-answering`): preguntas sobre el contenido de una imagen o documento.
- Extraccion de pares clave-valor (`key-value-extraction`): identificacion estructurada de campos en formularios y documentos.
- OCR: reconocimiento optico de caracteres sobre documentos.
- Comprension de tablas (`table-understanding`): interpretacion de estructuras tabulares en imagenes.
- Comprension de graficos (`chart-understanding`): lectura de graficos y representaciones visuales de datos.
- Conversacion multi-turno (`multi-turn-chat`): dialogo sostenido sobre documentos.
- Razonamiento en cadena de pensamiento (`chain-of-thought-reasoning`).
- Especializacion en documentos indios (`indian-documents`).
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Capacidades de audio: no disponibles.

## Casos de uso

- Digitalizacion de formularios administrativos indios: el modelo extrae pares clave-valor de documentos escaneados (formularios fiscales, solicitudes, certificados) y los devuelve en estructura utilizable para bases de datos, aprovechando su entrenamiento especifico en documentos indios.
- Procesamiento de documentos de identidad y KYC: lectura de documentos oficiales con OCR y extraccion de campos para pipelines de verificacion de identidad en entidades financieras.
- Automatizacion de back-office bancario: interpretacion de extractos, recibos y comprobantes en formato imagen para alimentar sistemas de contabilidad, gracias a la comprension de tablas y la extraccion estructurada.
- Atencion al cliente sobre documentos: conversaciones multi-turno en las que el usuario sube un documento y formula preguntas sucesivas sobre su contenido, apoyandose en la capacidad de chat multi-turno.
- Analisis de informes con graficos: lectura de graficos y tablas en informes financieros o gubernamentales para responder preguntas analiticas sobre las cifras representadas.
- Verificacion documental con razonamiento: uso del modo de cadena de pensamiento para justificar la extraccion de campos o resolver ambiguedades en documentos con formatos heterogeneos.
- Extraccion estructurada en pipelines ETL: integracion como etapa de parseo de documentos en flujos de ingestion de datos, convirtiendo imagenes en registros clave-valor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia orientativa por tamano, un modelo de 7.760 millones de parametros en precision FP16 requiere aproximadamente 15,5 GB solo para los pesos, cantidad coherente con el tamano del repositorio (15,5 GB); a ello hay que sumar el codificador visual, el cache KV y el overhead del runtime.
- En cuantizacion de 8 bits el peso se reduciria a unos 8 GB, y en 4 bits a unos 4-5 GB, aunque no se confirman formatos de cuantizacion soportados.
- GPU recomendadas: no disponibles en la informacion proporcionada. Por tamano, cabria esperar viabilidad en GPUs de 24 GB (RTX 4090, A10G) en FP16 y en GPUs de 16 GB con cuantizacion, pero es una estimacion, no un dato oficial.
- Opciones de despliegue: la libreria indicada es `transformers` con `custom_code`, por lo que se requiere cargar el codigo personalizado del repositorio. No se confirma soporte de vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de comparativas oficiales en la informacion proporcionada. Como referencia de categoria, se trata de un modelo multimodal de ~7,8B parametros especializado en comprension documental; los modelos multimodales genericos de tamano similar (por ejemplo, la familia Qwen2.5-VL-7B o InternVL de 7-8B) cubren un espectro mas amplio de tareas visuales, mientras que Patram1.5-7B se posiciona en el nicho de documentos indios. No obstante, no se aportan cifras que permitan una comparacion cuantitativa fiable.

| Modelo | Parametros | Contexto | Licencia | Especializacion |
|---|---|---|---|---|
| Patram1.5-7B | 7,76B | no disponible | Apache 2.0 | Documentos indios |
| Alternativas multimodales de ~7-8B | ~7-8B | no disponible | variable | Vision general |

## Limitaciones y advertencias

- Acceso restringido: el repositorio es gated y requiere aceptar condiciones en Hugging Face antes de descargar los pesos.
- Idioma: el unico idioma declarado es ingles (`en`), pese a la orientacion a documentos indios; no se confirma soporte de hindi u otras lenguas indias.
- Sesgos: no se documentan sesgos conocidos, pero al estar entrenado sobre documentos indios puede presentar sesgos de dominio y menor rendimiento fuera de ese contexto.
- Alucinacion: como todo modelo generativo, puede producir extracciones o respuestas incorrectas, especialmente en documentos de baja calidad, rotados o con caligrafia; se recomienda validacion en produccion.
- Contexto: no se especifica la longitud de contexto, lo que impide evaluar su idoneidad para documentos muy extensos o conversaciones largas.
- Licencia: Apache 2.0 permite uso comercial, pero las condiciones adicionales del acceso gated deben revisarse.
- Integracion: requiere `custom_code` y `trust_remote_code` en `transformers`, lo que anade riesgo de seguridad y complejidad de despliegue.
- Madurez: con 16 descargas y 1 like, el modelo tiene una adopcion muy baja, lo que reduce la disponibilidad de soporte comunitario y de validaciones independientes.

## Enlaces

- Hugging Face: https://huggingface.co/bharatgenai/Patram1.5-7B
- Paper, blog, repositorio o demo: no disponibles en la informacion proporcionada.
