# mradermacher/rakedoc-nano-2-GGUF

## Resumen

rakedoc-nano-2 es un modelo de vision-lenguaje especializado en el parseo de documentos, desarrollado por CloudRaker. La ficha que nos ocupa, mradermacher/rakedoc-nano-2-GGUF, es una conversion a formato GGUF realizada por el usuario mradermacher a partir de los pesos originales publicados en cloudraker/rakedoc-nano-2. El modelo base se presenta en la documentacion de CloudRaker como un modelo de 1.200 millones de parametros orientado a la extraccion estructurada de contenido a partir de imagenes de documentos, con deteccion de bounding boxes por elemento y un rendimiento destacado en el benchmark ParseBench (77,2), donde se situa primero entre los modelos vision-lenguaje evaluados.

La relevancia de esta publicacion radica en que ofrece una via de despliegue local del modelo original mediante cuantizaciones GGUF, lo que permite ejecutarlo con llama.cpp u otros runners compatibles sin necesidad de infraestructura GPU de gran escala. No obstante, conviene senalar que el repositorio GGUF no incluye model card propia mas alla de la nota de conversion, y que los datos tecnicos disponibles sobre el modelo base son limitados en la informacion proporcionada.

El numero de parametros registrado en el repositorio GGUF (494.032.768, segun los safetensors) no coincide con los 1.200 millones que la web de CloudRaker atribuye al modelo base; esta discrepancia no se puede resolver con la informacion disponible y debe tenerse en cuenta al planificar el despliegue.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo vision-lenguaje para parseo de documentos, segun la web del autor) |
| Parametros totales | 494.032.768 segun safetensors del repo GGUF; 1,2B segun la web de CloudRaker para el modelo base (dato no concordante) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | x-f16, Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, IQ4_XS |
| Idiomas soportados | no disponible |
| Licencia | no disponible en el repo GGUF; el modelo base se publica bajo AGPL-3.0 segun la web de CloudRaker |
| Formato de pesos | GGUF (repo de cuantizaciones); pesos originales en el repo cloudraker/rakedoc-nano-2 |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna del modelo en la documentacion proporcionada. La web de CloudRaker lo describe como un modelo vision-lenguaje de 1.200 millones de parametros especializado en parseo de documentos, con salida de bounding boxes por cada elemento detectado. El repositorio GGUF no aporta detalles sobre el transformer subyacente, el encoder visual, la longitud de contexto ni la composicion del dataset de entrenamiento.

Tampoco se documentan en la informacion disponible el numero de tokens de entrenamiento, el uso de RLHF o DPO, ni innovaciones tecnicas concretas como decodificacion especulativa o atencion lineal. La unica informacion tecnica adicional del repo GGUF son los metadatos de la herramienta de cuantizacion (quantize_version 2, output_tensor_quantised 1, convert_type hf), que indican una conversion desde pesos en formato Hugging Face.

## Capacidades

- Parseo de documentos: extraccion estructurada de contenido a partir de imagenes de documentos, con bounding boxes por elemento, segun la descripcion del modelo base.
- Procesamiento vision-lenguaje: el modelo base combina entrada visual con generacion de texto, orientado a tareas de comprension de documentos.
- Conversacion: la etiqueta "conversational" del repositorio GGUF sugiere soporte de interaccion conversacional, aunque no se detalla su alcance.
- Compatibilidad con endpoints: la etiqueta "endpoints_compatible" indica que el formato es apto para despliegue mediante endpoints compatibles.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible.
- Modo thinking, audio u otras capacidades especiales: no disponible.

## Casos de uso

- Digitalizacion de facturas y albaranes: el modelo puede recibir la imagen de un documento y devolver los elementos detectados con sus coordenadas, lo que facilita la extraccion de campos estructurados en un pipeline de contabilidad. Su orientacion especifica al parseo de documentos lo hace adecuado frente a modelos generalistas.
- Procesamiento masivo de archivos escaneados: con cuantizaciones Q4_K_M o Q5_K_M el modelo puede ejecutarse en hardware modesto, lo que permite procesar lotes de documentos en local sin depender de APIs externas.
- Extraccion de tablas y formularios: la salida con bounding boxes por elemento permite reconstruir la estructura espacial de tablas y formularios, util para migrar archivos en papel a bases de datos.
- Indexacion de documentos para busqueda: el texto extraido por el modelo puede alimentar un sistema RAG o un indice de busqueda interna, aprovechando el parseo estructurado para conservar la jerarquia del documento.
- Automatizacion de archivo documental: integrado en un flujo de gestion documental, el modelo puede clasificar y segmentar paginas escaneadas antes de su archivado, reduciendo la revision manual.
- Procesamiento en el borde o en entornos con requisitos de privacidad: al disponer de pesos GGUF y poder ejecutarse con llama.cpp, es posible desplegarlo en servidores locales donde los documentos no pueden salir de la organizacion, siempre que se respete la licencia AGPL-3.0 del modelo base.

## Benchmarks y rendimiento

La web de CloudRaker indica que rakedoc-nano alcanza 77,2 en ParseBench, situandose primero entre los modelos vision-lenguaje evaluados en ese benchmark. No se han publicado en la informacion disponible resultados desglosados de MMLU, HumanEval, GSM8K ni de otras pruebas, ni comparaciones numericas con modelos alternativos.

| Benchmark | Resultado |
|---|---|
| ParseBench | 77,2 (modelo base, segun CloudRaker) |
| MMLU | no disponible |
| HumanEval | no disponible |
| GSM8K | no disponible |

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial. Como referencia orientativa, un modelo de ~0,5B parametros en Q4_K_M ocupa del orden de 0,3-0,5 GB, mientras que en f16 se aproxima a 1 GB; si el modelo base real es de 1,2B, las cifras en f16 subirian a unos 2,4 GB y en Q4_K_M a alrededor de 0,8-1 GB. Estas estimaciones son calculos generales, no datos publicados.
- GPU recomendadas: no disponible. Por tamano, cualquier GPU consumer con 4-8 GB de VRAM deberia ser suficiente para las cuantizaciones mas bajas.
- Compatibilidad con GPU consumer: previsiblemente si, dada la escasa magnitud de parametros, aunque no hay confirmacion oficial en la informacion disponible.
- Opciones de despliegue: llama.cpp y runners compatibles con GGUF (Ollama, LM Studio, llama-cpp-python); el tag "endpoints_compatible" sugiere soporte en plataformas de endpoints. No se confirma soporte de vLLM o TGI para este formato.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone en la informacion proporcionada de datos suficientes sobre modelos comparables de parseo de documentos (parametros, contexto, rendimiento en ParseBench, licencia) para elaborar una comparativa rigurosa. La unica referencia cuantitativa es el resultado de 77,2 en ParseBench del modelo base, sin tabla de competidores asociada.

| Modelo | Parametros | Contexto | ParseBench | Licencia |
|---|---|---|---|---|
| rakedoc-nano-2 (base) | 1,2B segun CloudRaker | no disponible | 77,2 | AGPL-3.0 (modelo base) |
| Alternativas | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Discrepancia en el numero de parametros: el repo GGUF declara 494.032.768 parametros, mientras que la web del autor habla de 1,2B para el modelo base; conviene verificar los pesos antes de dimensionar el despliegue.
- Licencia: el repo GGUF no declara licencia; el modelo base se publica bajo AGPL-3.0, una licencia copyleft fuerte que impone obligaciones relevantes si se distribuye o se ofrece como servicio en red. Es imprescindible revisar los terminos antes de un uso comercial.
- Ausencia de model card detallada: no hay informacion sobre sesgos, idiomas, contexto maximo ni datos de entrenamiento, lo que limita la evaluacion de riesgos.
- Riesgo de alucinacion: no documentado para este modelo; en tareas de parseo de documentos, la omision o invencion de campos es un riesgo a validar con conjuntos de prueba propios.
- Idiomas: no se especifica el soporte multilingue; no se puede asumir un rendimiento uniforme en castellano.
- Contexto: se desconoce la longitud maxima de contexto, lo que afecta al procesamiento de documentos de varias paginas.
- Uso en produccion: al ser una cuantizacion de terceros, la calidad puede diferir de los pesos originales; se recomienda validar las cuantizaciones bajas (Q2_K, Q3_K_S) frente a Q5_K_M o Q8_0 en las tareas concretas.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/rakedoc-nano-2-GGUF
- Modelo base en Hugging Face: https://huggingface.co/cloudraker/rakedoc-nano-2
- Repositorio cloudraker/rakedoc-nano: https://huggingface.co/cloudraker/rakedoc-nano
- Pagina del modelo en CloudRaker: https://cloudraker.com/models/rakedoc-nano/
