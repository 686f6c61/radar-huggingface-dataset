# mradermacher/typhoon-ocr1.5-2b-GGUF

## Resumen

Typhoon-OCR 1.5 2B es un modelo de visión-lenguaje especializado en reconocimiento óptico de caracteres (OCR) y comprensión de documentos, desarrollado originalmente por Typhoon AI (equipo vinculado a SCB 10X) y distribuido en formato GGUF por el cuantizador mradermacher. El modelo base cuenta con 1.720.574.976 parámetros (aproximadamente 1,7 mil millones) y está diseñado para extraer texto estructurado de imágenes de documentos, con soporte nativo para inglés y tailandés, dos idiomas con sistemas de escritura radicalmente distintos, lo que lo hace especialmente útil en contextos administrativos y financieros del sudeste asiático.

El problema que resuelve es concreto: la digitalización fiable de documentos escaneados, formularios, facturas y capturas, manteniendo la estructura del contenido y gestionando alfabetos no latinos donde muchos OCR genéricos fallan. Al ser un modelo compacto, puede desplegarse en hardware modesto mediante llama.cpp u Ollama, lo que reduce costes frente a soluciones OCR basadas en APIs propietarias o modelos de visión de mayor tamaño.

Esta ficha cubre específicamente la versión cuantizada publicada por mradermacher, que ofrece el modelo en múltiples niveles de cuantización GGUF (desde Q2_K hasta f16), junto con los ficheros mmproj necesarios para el procesamiento de imágenes. La licencia Apache 2.0 permite uso comercial sin restricciones significativas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language transformer (detalles internos del backbone no disponibles en la informacion proporcionada) |
| Parametros totales | 1.720.574.976 |
| Parametros activos | no disponible (no es MoE segun la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16; mmproj en Q8_0 y f16 |
| Idiomas soportados | en (ingles), th (tailandes) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (cuantizaciones estaticas); modelo base original en safetensors |

## Arquitectura y entrenamiento

El modelo base es un vision-language model de aproximadamente 1,7 mil millones de parametros orientado a tareas OCR y de comprension de documentos. La informacion proporcionada no detalla la arquitectura interna del backbone de lenguaje ni del encoder visual, ni el numero de tokens de entrenamiento, la composicion del dataset o si se aplicaron tecnicas de RLHF, DPO o ajuste supervisado. Tampoco se especifica la longitud de contexto soportada.

La innovacion principal del modelo, segun los tags de la model card, es su enfoque multilingue en pares de idiomas con escrituras muy distintas (ingles y tailandes), asi como su orientacion especifica a document-understanding. La version aqui descrita es una conversion a GGUF realizada por mradermacher mediante cuantizacion estatica (quantize_version 2, output_tensor_quantised 1, convert_type hf), que preserva el modelo multimodal mediante los ficheros mmproj separados. Existe ademas una variante con cuantizaciones ponderadas/imatrix publicada en un repositorio aparte.

## Capacidades

- Reconocimiento optico de caracteres (OCR) sobre imagenes de documentos.
- Comprension de documentos (document understanding), incluyendo extraccion de contenido estructurado.
- Procesamiento multimodal: acepta imagenes junto con instrucciones en lenguaje natural.
- Soporte de conversacion multi-turno (tag conversational).
- Capacidades multilingues limitadas a ingles y tailandes.
- Compatibilidad con endpoints (tag endpoints_compatible).
- No se documenta en la informacion disponible soporte de tool calling, function calling, razonamiento multi-paso, vision adicional, audio ni modo thinking.

## Casos de uso

- Digitalizacion de facturas y recibos: el modelo puede recibir una imagen del documento y devolver el texto y los campos relevantes, gracias a su especializacion en document understanding y a su soporte de tailandes para contextos comerciales tailandeses.
- Procesamiento de formularios administrativos: extraccion de texto de documentos oficiales escaneados, con capacidad de mantener la estructura del contenido en ingles y tailandes.
- Digitalizacion de archivos historicos o registros en tailandes: util en bibliotecas, archivos y administraciones publicas que necesitan convertir documentos fisicos a texto editable.
- Integracion en pipelines de gestion documental: al estar en GGUF, puede desplegarse en llama.cpp u Ollama dentro de un flujo automatizado de ingesta de documentos, con bajo coste de infraestructura.
- Extraccion de texto de capturas de pantalla o imagenes embebidas: util en herramientas de accesibilidad o de indexacion de contenido visual.
- Procesamiento en local o en el borde (edge): con cuantizaciones Q4_K_S o Q4_K_M de aproximadamente 1,2 GB, puede ejecutarse en equipos sin GPU dedicada, lo que facilita el cumplimiento de requisitos de privacidad al no enviar documentos a servicios externos.
- Preprocesado para sistemas RAG: convertir documentos escaneados en texto indexable antes de alimentar un motor de recuperacion, aprovechando el tamano reducido del modelo para procesar lotes grandes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1 GB con Q2_K (0,9 GB), 1,2 GB con Q4_K_S o Q4_K_M, 1,5 GB con Q6_K y 1,9 GB con Q8_0. Los ficheros mmproj anaden 0,5 GB (Q8_0) o 0,9 GB (f16).
- GPU recomendadas: cualquier GPU consumer con 4 GB o mas de VRAM es suficiente para las cuantizaciones Q4-Q8; no se requiere A100 ni H100.
- Cabe en GPU consumer: si, en practicamente cualquier GPU moderna (RTX 3060, RTX 4060, RTX 4090, etc.) e incluso en CPU mediante llama.cpp.
- Opciones de despliegue: llama.cpp, Ollama y otros runners compatibles con GGUF; requiere cargar el fichero mmproj correspondiente para el procesamiento de imagenes.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| typhoon-ocr1.5-2b (este, GGUF) | 1,72 B | no disponible | en, th | Apache 2.0 | GGUF |
| typhoon-ai/typhoon-ocr1.5-2b (base) | 1,72 B | no disponible | en, th | Apache 2.0 | safetensors |
| mradermacher/typhoon-ocr1.5-2b-i1-GGUF | 1,72 B | no disponible | en, th | Apache 2.0 | GGUF (imatrix) |

No se dispone en la informacion proporcionada de datos de rendimiento ni de especificaciones de modelos alternativos de la misma categoria (por ejemplo, otros OCR vision-language de tamano similar) que permitan una comparacion cuantitativa fiable.

## Limitaciones y advertencias

- Idiomas limitados a ingles y tailandes; no se garantiza un rendimiento adecuado en castellano ni en otras lenguas.
- No se dispone de informacion sobre sesgos conocidos, tasas de alucinacion ni evaluaciones de robustez.
- La longitud de contexto no esta documentada, lo que dificulta planificar el procesamiento de documentos muy extensos o de multiples paginas en una sola pasada.
- Al ser un modelo de 1,7 B de parametros, su capacidad de razonamiento general y de comprension de documentos complejos es previsiblemente inferior a la de modelos de vision-lenguaje de mayor tamano; no se han publicado benchmarks que lo confirmen.
- La licencia Apache 2.0 permite uso comercial, pero el usuario debe verificar las condiciones del modelo base original y de los ficheros derivados.
- Las cuantizaciones de baja calidad (Q2_K, Q3_K_M) pueden degradar la precision del OCR; se recomienda Q4_K_M o superior para produccion.
- Es imprescindible cargar el fichero mmproj junto con los pesos para que el modelo procese imagenes; sin el, el modelo no funciona como OCR.
- No se documenta soporte de tool calling ni de agentes, por lo que no debe asumirse en integraciones que dependan de esas capacidades.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/typhoon-ocr1.5-2b-GGUF
- Modelo base: https://huggingface.co/typhoon-ai/typhoon-ocr1.5-2b
- Cuantizaciones imatrix: https://huggingface.co/mradermacher/typhoon-ocr1.5-2b-i1-GGUF
- Pagina de descargas del cuantizador: https://hf.tst.eu/model#typhoon-ocr1.5-2b-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Analisis de tipos de cuantizacion (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
