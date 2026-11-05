# mradermacher/Logics-Parsing-2.0-GGUF

## Resumen

Logics-Parsing-2.0-GGUF es la distribucion en formato GGUF del modelo multimodal Logics-Parsing-v2, desarrollado por Logics-MLLM y cuantizado por mradermacher. El modelo base es un transformer multimodal de aproximadamente 4.022 millones de parametros (4B) orientado a tareas de parsing y comprension de documentos, con capacidad para procesar imagenes ademas de texto, segun se deduce de la presencia de ficheros mmproj en el repositorio. Esta version GGUF permite ejecutar el modelo en hardware de consumo mediante llama.cpp y herramientas compatibles, algo imposible con los pesos originales en safetensors.

La relevancia de esta publicacion radica en que reduce un modelo multimodal de 4B a ficheros de entre 1,8 GB (Q2_K) y 8,2 GB (f16), con un cuantizado Q4_K_M de solo 2,6 GB que resulta adecuado para GPUs de consumo y equipos con poca VRAM. El repositorio incluye 13 variantes de cuantizacion estatica, desde Q2_K hasta f16, ademas de dos ficheros mmproj (Q8_0 y f16) necesarios para el procesamiento de imagenes.

La informacion disponible sobre el modelo base es limitada: la model card del repositorio GGUF se limita a listar los ficheros y remitir al modelo original, sin detallar arquitectura interna, datos de entrenamiento ni resultados de benchmarks. El idioma declarado es unicamente ingles y la licencia no aparece especificada en los metadatos del repositorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (texto + vision), segun ficheros mmproj y tags |
| Parametros totales | 4.022.468.096 (aproximadamente 4B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | f16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, IQ4_XS, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K, mmproj-Q8_0, mmproj-f16 |
| Idiomas soportados | en (ingles) |
| Licencia | no disponible |
| Formato de pesos | GGUF (safetensors en el modelo base) |
| Tamano del repositorio | 37,7 GB |
| Modelo base | Logics-MLLM/Logics-Parsing-v2 |
| Libreria | transformers |
| Descargas | 185 |
| Fecha de creacion | 2026-02-14 |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna del modelo base Logics-Parsing-v2 en la documentacion proporcionada. Los tags del repositorio indican que se trata de un modelo multimodal (por la presencia de ficheros mmproj y el tag `base_model:Logics-MLLM/Logics-Parsing-v2`), con 4.022 millones de parametros totales. El nombre "Parsing" y la orientacion multimodal sugieren un uso centrado en el analisis y extraccion estructurada de contenido a partir de documentos e imagenes, aunque no se confirma en la informacion disponible.

Tampoco se detallan el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de RLHF, DPO o similar. La unica innovacion tecnica documentada es el propio proceso de cuantizacion estatica realizado por mradermacher, que genera variantes desde Q2_K hasta f16, incluyendo ficheros mmproj separados para el componente visual. No se han publicado (en esta informacion) cuantizaciones ponderadas o con imatrix, segun indica el propio autor en la model card.

## Capacidades

- Procesamiento multimodal: el repositorio incluye ficheros mmproj, lo que confirma soporte para entrada de imagenes ademas de texto.
- Parsing de documentos: el nombre del modelo y su orientacion sugieren extraccion de contenido estructurado, aunque no se detalla en la informacion disponible.
- Generacion de texto conversacional: el tag `conversational` indica uso en dialogos multi-turno.
- Compatibilidad con endpoints: el tag `endpoints_compatible` sugiere integracion con APIs de inferencia estandar.
- Idiomas: unicamente ingles declarado.
- No se dispone de informacion sobre tool calling, function calling, agentes, modo thinking, audio u otras capacidades especiales.

## Casos de uso

- Extraccion de datos de documentos escaneados: el modelo, al ser multimodal y estar orientado a parsing, puede procesar imagenes de documentos y devolver contenido estructurado; la cuantizacion Q4_K_M (2,6 GB) permite ejecutarlo en GPUs de consumo para pipelines de digitalizacion.
- Procesamiento de facturas y formularios: con 4B de parametros y soporte de vision, puede integrarse en flujos de extraccion de campos en entornos con recursos limitados, usando llama.cpp o Ollama.
- Digitalizacion de archivos historicos: la variante f16 (8,2 GB) ofrece la maxima calidad para tareas de parsing donde la precision es critica, ejecutable en GPUs de 12-16 GB.
- Asistente conversacional con entrada visual: el tag `conversational` y los ficheros mmproj permiten construir interfaces de chat que acepten imagenes ademas de texto, desplegables en local.
- Prototipado en equipos sin GPU dedicada: la variante Q2_K (1,8 GB) o Q3_K_S (2,0 GB) permite ejecutar el modelo en CPU con llama.cpp para pruebas de concepto y evaluacion inicial.
- Integracion en pipelines de CI/CD para validacion de documentos: al ser un GGUF compatible con endpoints, puede desplegarse en servicios de inferencia ligeros para verificar automaticamente el contenido de documentos generados o recibidos.
- Investigacion en parsing multimodal: la disponibilidad de 13 cuantizaciones permite estudiar el impacto de la precision numerica en tareas de extraccion de informacion, comparando desde Q2_K hasta f16.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos, sin overhead de contexto):
  - Q2_K: aproximadamente 1,8 GB
  - Q3_K_S: aproximadamente 2,0 GB
  - Q3_K_M: aproximadamente 2,2 GB
  - Q3_K_L: aproximadamente 2,3 GB
  - IQ4_XS: aproximadamente 2,4 GB
  - Q4_K_S: aproximadamente 2,5 GB
  - Q4_K_M: aproximadamente 2,6 GB
  - Q5_K_S: aproximadamente 2,9 GB
  - Q5_K_M: aproximadamente 3,0 GB
  - Q6_K: aproximadamente 3,4 GB
  - Q8_0: aproximadamente 4,4 GB
  - f16: aproximadamente 8,2 GB
  - Componente visual (mmproj): 0,6 GB (Q8_0) o 0,9 GB (f16), adicional a la cuantizacion de texto
- GPU recomendadas: para Q4_K_M, una RTX 3060 de 12 GB o superior es suficiente; para f16 con mmproj, se recomienda una RTX 4090 (24 GB) o A100/H100 para mayor throughput. Para Q8_0, una RTX 4070 (12 GB) o superior.
- Cabe en GPU de consumo: si, todas las cuantizaciones hasta Q8_0 caben en GPUs de 8-12 GB; f16 requiere al menos 10 GB considerando el mmproj.
- Opciones de despliegue: llama.cpp, Ollama, y cualquier runtime compatible con GGUF; el tag `endpoints_compatible` sugiere compatibilidad con servidores de inferencia estandar. vLLM y TGI no soportan GGUF de forma nativa en todas sus versiones, por lo que se recomienda verificar compatibilidad.
- Latencia y throughput: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

No se dispone de informacion suficiente sobre modelos comparables de la misma categoria (parsing multimodal de 4B) en la documentacion proporcionada. Se indica "no disponible" para los datos de rendimiento y benchmarks de las alternativas, ya que no se han publicado en esta informacion.

| Modelo | Parametros | Contexto | Licencia | Formato GGUF |
|---|---|---|---|---|
| Logics-Parsing-2.0-GGUF | 4,02B | no disponible | no disponible | si (13 variantes) |
| Alternativas de parsing multimodal | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Idioma: el modelo solo declara soporte de ingles, por lo que su rendimiento en castellano u otros idiomas no esta garantizado.
- Licencia: no se especifica en el repositorio, lo que impide confirmar si el uso comercial esta permitido; es imprescindible consultar la licencia del modelo base Logics-MLLM/Logics-Parsing-v2 antes de usarlo en produccion.
- Cuantizaciones de baja calidad: Q2_K y Q3_K_M pueden degradar significativamente la precision en tareas de parsing, donde la exactitud en la extraccion es critica; se recomienda Q4_K_M o superior para uso real.
- Ausencia de cuantizaciones ponderadas o imatrix: el autor indica que no estan disponibles, lo que puede suponer una ligera perdida de calidad frente a cuantizaciones con imatrix de igual tamano.
- Riesgo de alucinacion: no se dispone de datos sobre la tasa de alucinacion del modelo; en tareas de extraccion de documentos, la verificacion humana de la salida es recomendable.
- Falta de informacion sobre contexto: se desconoce la longitud maxima de contexto, lo que limita la planificacion de cargas con documentos extensos.
- Modelo base poco documentado: la ausencia de benchmarks y detalles de entrenamiento impide evaluar su calidad frente a alternativas.
- Fecha de creacion futura (2026-02-14): los metadatos indican una fecha posterior a la actual, lo que puede indicar un error en el repositorio o una publicacion programada; conviene verificar la integridad de los ficheros.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Logics-Parsing-2.0-GGUF
- Modelo base: https://huggingface.co/Logics-MLLM/Logics-Parsing-v2
- Pagina de descargas del autor: https://hf.tst.eu/model#Logics-Parsing-2.0-GGUF
- README de referencia para uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico comparativo de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Analisis de cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Preguntas frecuentes y solicitudes de modelos: https://huggingface.co/mradermacher/model_requests
- Empresa del autor: https://www.nethype.de/
