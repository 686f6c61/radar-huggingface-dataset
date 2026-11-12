# mradermacher/NuExtract-2.0-4B-GGUF

## Resumen

NuExtract-2.0-4B-GGUF es la distribucion en formato GGUF del modelo NuExtract-2.0-4B, desarrollado originalmente por NuMind (numind) y cuantizado por mradermacher. Se trata de un modelo especializado en extraccion estructurada de informacion a partir de texto e imagenes, generando salidas en JSON segun un esquema predefinido por el usuario. La version GGUF anade un componente multimodal (mmproj) que permite procesar documentos escaneados, capturas y otras entradas visuales directamente.

El modelo base cuenta con 3.085.938.688 parametros (aproximadamente 3,1 mil millones) y se distribuye bajo licencia MIT, lo que facilita su uso comercial. Esta cuantizacion esta pensada para ejecucion local en hardware de consumo mediante llama.cpp y herramientas compatibles, con un rango de tamanos que va desde 1,4 GB en Q2_K hasta 6,3 GB en f16.

La relevancia actual de esta ficha radica en que combina tres factores poco frecuentes en modelos de su tamano: extraccion estructurada fiable, soporte multimodal y despliegue local eficiente. Para equipos que necesitan procesar documentos de forma masiva sin depender de APIs externas, esta variante GGUF ofrece un equilibrio practico entre calidad, coste y privacidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base tipo transformer con capacidad multimodal; detalles no publicados en la informacion disponible) |
| Parametros totales | 3.085.938.688 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16; ademas mmproj-Q8_0 y mmproj-f16 para el componente multimodal |
| Idiomas soportados | en |
| Licencia | MIT |
| Formato de pesos | GGUF (con ficheros mmproj separados para vision) |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del modelo base NuExtract-2.0-4B. Se sabe que es un modelo conversacional con capacidades multimodales, dado que la cuantizacion incluye ficheros mmproj (multi-modal supplement) que permiten procesar entradas de imagen ademas de texto. El modelo base esta alojado en numind/NuExtract-2.0-4B y la cuantizacion se ha realizado con la libreria transformers como referencia y conversion a GGUF.

No se han publicado en la informacion proporcionada datos sobre el numero de tokens de entrenamiento, la composicion del dataset, el uso de RLHF/DPO ni innovaciones tecnicas especificas como decodificacion especulativa o atencion lineal. La cuantizacion de mradermacher incluye variantes estaticas (este repositorio) y variantes con imatrix/pesos ponderados en el repositorio complementario NuExtract-2.0-4B-i1-GGUF, que suelen ofrecer mejor calidad por bit en tamanos equivalentes.

## Capacidades

- Extraccion estructurada de informacion: genera JSON conforme a un esquema definido por el usuario a partir de texto libre.
- Extraccion multimodal: procesa imagenes (documentos escaneados, capturas, formularios) mediante el componente mmproj y devuelve la informacion estructurada.
- Generacion de texto conversacional: el tag "conversational" indica soporte para interacciones multi-turno.
- Salida en formato JSON: orientado a integracion directa en pipelines de datos.
- Procesamiento de documentos: adecuado para facturas, recibos, contratos, informes y formularios.
- Soporte de esquemas personalizados: el usuario define la estructura de salida esperada.
- Capacidades multilingues: limitadas al ingles segun los metadatos del modelo.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Modo thinking o razonamiento extendido: no disponible en la informacion proporcionada.

## Casos de uso

- Digitalizacion de facturas y recibos: el modelo recibe la imagen o el texto de una factura y devuelve un JSON con campos como proveedor, fecha, importe e impuestos. Es adecuado por su capacidad multimodal y su especializacion en extraccion estructurada, lo que reduce la necesidad de reglas heurísticas o plantillas regex.
- Procesamiento de formularios en papel: para entidades que reciben formularios escaneados, el modelo puede extraer los campos rellenados y volcarlos a una base de datos. La cuantizacion Q4_K_M (2,0 GB) permite ejecutarlo en estaciones de trabajo sin GPU dedicada.
- Enriquecimiento de datos en pipelines ETL: dado un corpus de documentos, el modelo extrae entidades y atributos segun un esquema comun, generando registros estructurados listos para ingesta en un data warehouse.
- Analisis de contratos y documentos legales: extraccion de partes implicadas, fechas de vigencia, clausulas y condiciones economicas en formato JSON para su posterior revision o indexacion.
- Automatizacion de back office: procesamiento de albaranes, pedidos y documentacion administrativa con salida estructurada que alimenta sistemas ERP o CRM, reduciendo la introduccion manual de datos.
- Extraccion de datos de informes tecnicos o financieros: conversion de tablas y secciones narrativas en estructuras JSON para analisis posterior, aprovechando la capacidad de procesar imagenes de documentos.
- Prototipado local de asistentes de extraccion: gracias a la licencia MIT y a los tamanos reducidos de las cuantizaciones (desde 1,4 GB), es viable desplegar prototipos en portatiles o entornos de desarrollo sin coste de API.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos, sin overhead de contexto):
  - Q2_K: aproximadamente 1,4 GB.
  - Q4_K_M: aproximadamente 2,0 GB.
  - Q6_K: aproximadamente 2,6 GB.
  - Q8_0: aproximadamente 3,4 GB.
  - f16: aproximadamente 6,3 GB.
  - Componente multimodal mmproj: 0,9 GB (Q8_0) o 1,4 GB (f16) adicionales si se usa vision.
- GPU recomendadas: cualquier GPU consumer con 4 GB o mas de VRAM para cuantizaciones Q4/Q5; se recomienda 6-8 GB para Q8_0 con contexto amplio. Para f16 se aconseja 8-10 GB. GPUs profesionales como A100 o H100 no son necesarias para este tamano, aunque pueden usarse para servir varias instancias.
- Cabe en GPU consumer: si, en practicamente cualquier GPU moderna de 4 GB o mas (RTX 3050, RTX 4060, RTX 4090, etc.) con cuantizaciones Q4 o Q5. Tambien puede ejecutarse en CPU con llama.cpp.
- Opciones de despliegue: llama.cpp, Ollama (a partir del GGUF), y servidores compatibles con GGUF como llama-cpp-python o LM Studio. El tag "endpoints_compatible" sugiere compatibilidad con endpoints estilo OpenAI en herramientas que lo soporten.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Multimodal | Licencia | Formato |
|---|---|---|---|---|---|
| NuExtract-2.0-4B-GGUF (esta ficha) | 3,09 B | no disponible | si (mmproj) | MIT | GGUF |
| NuExtract-2.0-4B (base, numind) | 3,09 B | no disponible | si | MIT | safetensors/transformers |
| NuExtract-2.0-4B-i1-GGUF (mradermacher) | 3,09 B | no disponible | si | MIT | GGUF (imatrix) |
| Otros modelos de extraccion estructurada de tamano similar | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparativa se limita a variantes del mismo modelo base, ya que la informacion proporcionada no incluye datos de benchmarks ni especificaciones de modelos alternativos de la misma categoria. La diferencia principal entre esta cuantizacion y la variante i1-GGUF es el metodo de cuantizacion: la i1 usa pesos ponderados por imatrix, que suele ofrecer mejor calidad por bit.

## Limitaciones y advertencias

- Idioma: el modelo esta etiquetado unicamente para ingles ("en"), por lo que su rendimiento en castellano u otros idiomas no esta garantizado y probablemente sea inferior.
- Especializacion: esta disenado para extraccion estructurada; no es un modelo generalista y puede rendir peor en tareas abiertas de generacion, razonamiento o codigo.
- Alucinacion: como todo modelo generativo, puede inventar campos o valores cuando el esquema no se ajusta al contenido del documento. Se recomienda validacion posterior del JSON generado.
- Contexto: la longitud de contexto no esta disponible en la informacion proporcionada, lo que impide garantizar el procesamiento de documentos muy largos.
- Vision: el soporte multimodal depende de cargar correctamente los ficheros mmproj; no todos los entornos de despliegue los gestionan de forma automatica.
- Licencia: MIT permite uso comercial, pero conviene revisar las condiciones del modelo base original en numind/NuExtract-2.0-4B por si hubiera terminos adicionales no reflejados en esta cuantizacion.
- Cuantizaciones agresivas: Q2_K y Q3 pueden degradar notablemente la calidad de extraccion; para produccion se recomienda Q4_K_M o superior.
- Fecha de actualizacion: el repositorio muestra una fecha de actualizacion futura (2026-11-12) en los metadatos, lo que puede indicar un error de registro; conviene verificar la vigencia de los ficheros antes de desplegar.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/NuExtract-2.0-4B-GGUF
- Modelo base: https://huggingface.co/numind/NuExtract-2.0-4B
- Cuantizaciones imatrix: https://huggingface.co/mradermacher/NuExtract-2.0-4B-i1-GGUF
- Pagina de descargas del autor: https://hf.tst.eu/model#NuExtract-2.0-4B-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- FAQ y peticiones de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Analisis de tipos de cuantizacion (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
