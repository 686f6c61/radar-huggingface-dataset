# mradermacher/vietextract-1.5b-GGUF

## Resumen

VietExtract-1.5b es un modelo especializado en extraccion de informacion estructurada a partir de texto en vietnamita, desarrollado originalmente por el usuario cbc-528a y distribuido en formato GGUF por mradermacher. Con 1.543.714.304 parametros (aproximadamente 1,5 mil millones), se posiciona como un modelo compacto orientado a una tarea concreta: transformar texto libre en salidas JSON estructuradas y anidadas guiadas por esquema (schema-guided). La version aqui documentada es una conversion a GGUF del modelo base original, pensada para inferencia local eficiente.

El modelo parte de una arquitectura transformer (los detalles concretos de la arquitectura base no se especifican en la informacion disponible) y ha sido ajustado mediante LoRA sobre el modelo base, segun indican las etiquetas de la model card. Su enfoque en salidas estructuradas, JSON anidado y extraccion guiada por esquema lo hace relevante para pipelines de procesamiento documental y automatizacion de datos donde la salida debe ser maquinamente parseable.

La relevancia actual reside en su especializacion: frente a modelos generalistas de mayor tamano, VietExtract-1.5b apunta a un nicho concreto (extraccion de informacion en vietnamita) y ofrece cuantizaciones que van desde 0,8 GB (Q2_K) hasta 3,2 GB (f16), lo que permite desplegarlo en hardware modesto. La licencia Apache 2.0 facilita su uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (detalle especifico no disponible); ajuste mediante LoRA |
| Parametros totales | 1.543.714.304 (aprox. 1,5 B) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | f16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, IQ4_XS, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K |
| Idiomas soportados | Vietnamita (vi) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (version cuantizada); modelo base original en transformers/safetensors |

## Arquitectura y entrenamiento

La informacion disponible indica que el modelo original (cbc-528a/vietextract-1.5b) es un modelo transformer de aproximadamente 1,5 mil millones de parametros, ajustado mediante LoRA para la tarea de extraccion de informacion estructurada en vietnamita. Las etiquetas de la model card destacan capacidades de salida estructurada, JSON anidado y extraccion guiada por esquema. No se especifican en la informacion proporcionada el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de RLHF o DPO.

La version documentada aqui es una conversion estatica a GGUF realizada por mradermacher. Segun la model card del cuantizador, las cuantizaciones ponderadas/imatrix no estaban disponibles en el momento de la publicacion, y se ofrecen exclusivamente cuantizaciones estaticas. El proceso de conversion parte del modelo en formato Hugging Face (convert_type: hf) y genera los distintos niveles de cuantizacion listados. No se detalla ninguna innovacion tecnica adicional como decodificacion especulativa o atencion lineal.

## Capacidades

- Extraccion de informacion estructurada a partir de texto en vietnamita.
- Generacion de salidas JSON, incluyendo estructuras anidadas (nested JSON).
- Extraccion guiada por esquema (schema-guided), es decir, condicionada a un esquema de salida predefinido.
- Ajuste especifico mediante LoRA sobre el modelo base para la tarea de extraccion.
- Soporte conversacional (etiqueta `conversational` en el repositorio).
- Compatibilidad con endpoints (etiqueta `endpoints_compatible`).
- Capacidades multilingues: limitadas al vietnamita segun la informacion disponible.
- No se documentan capacidades de vision, audio, tool calling, agentes ni modo de razonamiento explicito.

## Casos de uso

- Extraccion de datos de documentos administrativos vietnamitas: el modelo puede convertir texto libre (formularios, contratos, solicitudes) en JSON estructurado siguiendo un esquema definido, lo que facilita su ingesta en bases de datos relacionales.
- Procesamiento de facturas y recibos: dado un texto OCR en vietnamita, el modelo genera una salida JSON anidada con campos como emisor, fecha, lineas de detalle e importes, adecuada para sistemas de contabilidad automatizada.
- Enriquecimiento de registros en CRM: a partir de correos o notas de texto en vietnamita, el modelo extrae entidades y atributos segun un esquema de cliente, reduciendo la entrada manual de datos.
- Pipelines de catalogacion de contenidos: extraccion de metadatos (titulo, autor, categoria, etiquetas) de articulos o descripciones en vietnamita para sistemas de gestion documental.
- Preprocesamiento para analitica: conversion de texto no estructurado en tablas JSON que alimentan procesos ETL y almacenes de datos, aprovechando la salida guiada por esquema para garantizar consistencia.
- Despliegue en entornos con recursos limitados: gracias a sus cuantizaciones de 0,8 a 1,7 GB, puede ejecutarse en estaciones de trabajo sin GPU dedicada o en GPUs de consumo para tareas de extraccion por lotes.
- Prototipado rapido de extractores especificos de dominio: el ajuste LoRA y la naturaleza compacta del modelo permiten iterar sobre esquemas de extraccion sin requerir infraestructura de gran escala.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (aproximada, segun cuantizacion): Q2_K ~0,8 GB; Q3_K_S ~0,9 GB; IQ4_XS ~1,0 GB; Q4_K_M ~1,1 GB; Q5_K_M ~1,2 GB; Q6_K ~1,4 GB; Q8_0 ~1,7 GB; f16 ~3,2 GB. A estas cifras hay que sumar el overhead del contexto y del runtime.
- GPU recomendadas: al tratarse de un modelo de ~1,5 B, cabe holgadamente en GPUs de consumo como RTX 3060 (12 GB), RTX 4060 Ti, RTX 4070 o RTX 4090; tambien en GPUs de datacenter (A100, H100) si se busca throughput elevado.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU con 4 GB o mas de VRAM usando cuantizaciones Q4 o superiores; las cuantizaciones menores permiten incluso CPU.
- Opciones de despliegue: llama.cpp, Ollama, y cualquier runtime compatible con GGUF; el modelo base original es compatible con transformers. La etiqueta `endpoints_compatible` sugiere compatibilidad con endpoints de inferencia.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de modelos comparables especificados en la informacion proporcionada. A continuacion se ofrece una comparativa estructural basica con alternativas genericas de tamano similar, marcando como no disponible aquello que no se puede verificar.

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| VietExtract-1.5b (este) | ~1,5 B | no disponible | Vietnamita | Apache 2.0 | GGUF, transformers |
| Alternativas generalistas de ~1,5 B | ~1,5 B | no disponible | Multiples | Variable | Variable |
| Rendimiento comparado | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de informacion suficiente para establecer una comparativa de rendimiento fiable con modelos de la misma categoria.

## Limitaciones y advertencias

- El modelo esta especializado en vietnamita; su rendimiento fuera de ese idioma no esta documentado y probablemente sea limitado.
- No se han publicado benchmarks ni evaluaciones cuantitativas, por lo que no es posible verificar su calidad de extraccion frente a alternativas.
- Riesgo de alucinacion inherente a los modelos generativos: en tareas de extraccion estructurada puede inventar campos o valores no presentes en el texto de entrada, por lo que se recomienda validacion posterior de la salida JSON.
- La longitud de contexto no esta documentada, lo que limita la planificacion de cargas con documentos largos.
- Las cuantizaciones de baja precision (Q2_K, Q3_K_S) pueden degradar la fidelidad de la salida estructurada; se recomienda Q4_K_M o superior para produccion.
- La model card del cuantizador no describe sesgos conocidos ni evaluaciones de robustez.
- Aunque la licencia es Apache 2.0 (permisiva para uso comercial), conviene verificar las condiciones del modelo base original y de los datos de entrenamiento, no detalladas en la informacion disponible.
- Las cuantizaciones ponderadas/imatrix no estaban disponibles en el momento de la publicacion, segun indica el cuantizador.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/vietextract-1.5b-GGUF
- Modelo base original: https://huggingface.co/cbc-528a/vietextract-1.5b
- Pagina de descarga del cuantizador: https://hf.tst.eu/model#vietextract-1.5b-GGUF
- Guia de uso de GGUF (referencia TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Solicitudes de cuantizacion de mradermacher: https://huggingface.co/mradermacher/model_requests
- Analisis de tipos de cuantizacion (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
