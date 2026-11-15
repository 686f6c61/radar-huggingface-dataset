# mradermacher/qwen2-vl-iranian-idcard-ocr-GGUF

## Resumen

`mradermacher/qwen2-vl-iranian-idcard-ocr-GGUF` es una distribucion de cuantizaciones GGUF del modelo `datamoon/qwen2-vl-iranian-idcard-ocr`, un ajuste fino de Qwen2-VL especializado en el reconocimiento optico (OCR) y la extraccion estructurada de datos de documentos de identidad iranies. El modelo original parte de la arquitectura Qwen2-VL, un transformer multimodal vision-lenguaje, y ha sido adaptado mediante fine-tuning para una tarea concreta de extraccion de campos a partir de imagenes de tarjetas de identidad.

Esta version la publica mradermacher, un conocido creador de cuantizaciones GGUF de la comunidad, que genera variantes de 2 a 16 bits para facilitar el despliegue en hardware modesto. El modelo cuenta con aproximadamente 1.540 millones de parametros (1,54 B) en pesos safetensors, lo que lo situa en la gama de modelos pequenos capaces de ejecutarse en GPUs de consumo e incluso en CPU con las cuantizaciones mas agresivas.

Su relevancia radica en que permite ejecutar localmente una tarea de OCR especializado con requisitos de hardware muy bajos, algo util para pipelines de digitalizacion documental, verificacion KYC o procesamiento por lotes de identificaciones. La licencia Apache 2.0 facilita su uso comercial, aunque las limitaciones propias de un modelo tan especializado y de un idioma concreto deben tenerse en cuenta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal vision-lenguaje (Qwen2-VL) |
| Parametros totales | 1.543.714.304 (aprox. 1,54 B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16; ademas mmproj en Q8_0 y f16 |
| Idiomas soportados | en (segun model card); el dominio de la tarea es documentacion irani |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizaciones); el modelo base en safetensors |
| Tamano del repo | 16,2 GB |
| Modelo base | datamoon/qwen2-vl-iranian-idcard-ocr |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de Qwen2-VL, un transformer multimodal que combina un codificador visual con un modelo de lenguaje para procesar pares imagen-texto. En este caso, el modelo base `datamoon/qwen2-vl-iranian-idcard-ocr` es un ajuste fino orientado especificamente al reconocimiento de tarjetas de identidad iranies, lo que implica que el entrenamiento se ha centrado en la extraccion de campos estructurados (nombre, numero de documento, fechas, etc.) a partir de imagenes de dichos documentos.

No se dispone de informacion detallada sobre el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO en la informacion proporcionada. La cuantizacion realizada por mradermacher es de tipo estatico ("static quants"), sin variantes ponderadas/imatrix disponibles en el momento de la publicacion, segun indica la propia model card. El proceso de cuantizacion se ha aplicado sobre los pesos en formato Hugging Face (convert_type: hf) y se distribuye en formato GGUF para su uso con llama.cpp y herramientas compatibles.

## Capacidades

- Reconocimiento optico de caracteres (OCR) especializado en tarjetas de identidad iranies.
- Extraccion estructurada de campos a partir de imagenes de documentos.
- Procesamiento multimodal vision-lenguaje (imagen + texto de entrada).
- Generacion de texto conversacional (el modelo base es de tipo conversational).
- Capacidad de ejecucion local gracias a las cuantizaciones GGUF de bajo peso.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: la model card declara unicamente "en"; el dominio de la tarea es documentacion irani, pero no se detalla el soporte de otros idiomas.
- Capacidades especiales (thinking mode, vision, audio): vision confirmada por los tags; no se documentan otras.

## Casos de uso

- Digitalizacion de archivos de identificacion: el modelo puede procesar imagenes de tarjetas de identidad iranies y extraer los campos en formato estructurado, lo que permite convertir archivos fisicos o escaneos en bases de datos consultables. Su tamano reducido facilita el procesamiento por lotes en servidores modestos.
- Verificacion KYC (Know Your Customer): en procesos de alta de clientes, el modelo puede leer y validar los datos de un documento de identidad irani de forma automatizada, reduciendo la intervencion manual en la revision inicial.
- Procesamiento en el borde (edge) o en local: gracias a las cuantizaciones de 0,8 a 1,7 GB, puede desplegarse en equipos sin GPU dedicada o en entornos con requisitos de privacidad estrictos, donde los documentos no deben salir del dispositivo.
- Automatizacion de tramites administrativos: integracion en formularios o sistemas de gestion para rellenar campos automaticamente a partir de la foto de un documento, agilizando la atencion al ciudadano.
- Pipelines de enriquecimiento de datos: extraccion de metadatos de documentos en repositorios documentales para su indexacion y busqueda posterior, usando la salida del modelo como entrada de un sistema de gestion documental.
- Prototipado rapido de soluciones OCR especializadas: al ser un modelo pequeno y con licencia Apache 2.0, sirve como base para experimentar y comparar con soluciones comerciales antes de invertir en infraestructura mayor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: entre aproximadamente 1 GB (Q2_K, 0,8 GB de pesos) y 2 GB (Q8_0, 1,7 GB), sumando el proyector multimodal (mmproj, 0,8-1,4 GB). La variante f16 requiere unos 3,2 GB solo para los pesos del modelo.
- GPU recomendadas: cualquier GPU consumer con 4 GB o mas de VRAM es suficiente para las cuantizaciones bajas; para f16 se recomienda al menos 6-8 GB. No se requieren A100 ni H100.
- Cabe en GPU consumer: si, practicamente en cualquier GPU moderna (RTX 3060, RTX 4060, RTX 4090, e incluso iGPUs con suficiente memoria compartida en cuantizaciones Q2-Q4).
- Opciones de despliegue: llama.cpp y derivados (Ollama, LM Studio, llama-cpp-python) por el formato GGUF; el modelo base en safetensors puede usarse con transformers. No se documenta soporte explicito de vLLM o TGI en la informacion disponible.
- Latencia y throughput estimados: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| qwen2-vl-iranian-idcard-ocr-GGUF (este) | ~1,54 B | no disponible | Apache 2.0 | GGUF | Especializado en OCR de ID iranies; cuantizaciones de 0,8 a 3,2 GB |
| datamoon/qwen2-vl-iranian-idcard-ocr | ~1,54 B | no disponible | Apache 2.0 | safetensors | Modelo base sin cuantizar; mismo dominio |
| Qwen2-VL-2B (base general) | ~2 B | no disponible | Apache 2.0 | safetensors, GGUF | Modelo general multimodal; no especializado en OCR de documentos |
| Otros OCR especializados de la comunidad | no disponible | no disponible | variable | variable | No se dispone de datos comparativos en la informacion proporcionada |

## Limitaciones y advertencias

- Modelo altamente especializado: su rendimiento fuera del dominio de tarjetas de identidad iranies probablemente sea deficiente; no debe usarse como OCR generico sin validacion.
- Riesgo de alucinacion: como todo modelo de lenguaje, puede generar campos o valores inexistentes en la imagen; en un contexto de verificacion de identidad esto es critico y requiere validacion posterior.
- Sesgos conocidos: no se documentan en la informacion proporcionada; el sesgo derivado del dataset de entrenamiento (documentos iranies) puede limitar su generalizacion.
- Limitaciones de idioma: la model card declara unicamente "en", aunque la tarea implica documentos en persa; no se detalla el soporte real de otros idiomas.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero se recomienda revisar las condiciones del modelo base y de los datos de entrenamiento originales.
- Caveat de produccion: al ser una cuantizacion estatica (sin imatrix), las variantes de baja precision (Q2, Q3) pueden degradar la calidad de extraccion; se recomienda Q4_K_M o superior para produccion.
- No se dispone de informacion sobre el contexto maximo soportado ni sobre el rendimiento en documentos de otros paises.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mradermacher/qwen2-vl-iranian-idcard-ocr-GGUF
- Modelo base: https://huggingface.co/datamoon/qwen2-vl-iranian-idcard-ocr
- Pagina de resumen del autor: https://hf.tst.eu/model#qwen2-vl-iranian-idcard-ocr-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafica de calidad de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas sobre cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Solicitudes de modelos de mradermacher: https://huggingface.co/mradermacher/model_requests
