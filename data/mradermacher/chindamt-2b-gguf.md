# mradermacher/ChindaMT-2B-GGUF

## Resumen

ChindaMT-2B-GGUF es un repositorio de pesos cuantizados en formato GGUF del modelo de traduccion automatica iapp/ChindaMT-2B, publicado por el usuario mradermacher. No se trata de un modelo entrenado desde cero: el autor original es iapp, mientras que mradermacher se limita a convertir y cuantizar los pesos originales para que puedan ejecutarse en herramientas de inferencia local como llama.cpp u Ollama. El modelo esta especializado en traduccion entre ingles (en) y tailandes (th), y se presenta como instruction-following y conversational, con un dataset de ajuste denominado iapp/ChindaMT-Grounded.

El modelo cuenta con 2.390.384.448 parametros (aproximadamente 2,4 mil millones), lo que lo situa en la gama compacta de modelos de traduccion y permite desplegarlo en hardware de consumo. El repositorio ocupa 23,4 GB en total porque incluye 14 variantes de cuantizacion distintas, desde Q2_K (1,2 GB) hasta f16 (4,9 GB), ademas de dos ficheros mmproj (multi-modal supplement) en Q8_0 y f16.

Su relevancia actual reside en la escasez relativa de modelos abiertos de traduccion de calidad entre ingles y tailandes con licencia Apache 2.0, que permite uso comercial sin restricciones. La disponibilidad de cuantizaciones de bajo peso facilita su integracion en entornos con recursos limitados, aunque no se han publicado datos de benchmarks ni detalles sobre la arquitectura interna en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (el tipo concreto no se detalla en la informacion disponible) |
| Parametros totales | 2.390.384.448 (~2,4 mil millones) |
| Parametros activos | No aplica; no hay indicios de que sea un modelo MoE |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16, mmproj-Q8_0, mmproj-f16 |
| Idiomas soportados | Ingles (en) y tailandes (th) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (este repositorio no incluye safetensors; el modelo base iapp/ChindaMT-2B es el que conserva los pesos originales) |

## Arquitectura y entrenamiento

La informacion disponible no especifica la arquitectura interna del modelo base mas alla de que la libreria indicada es transformers, lo que apunta a una arquitectura de tipo transformer. Tampoco se detalla el numero de capas, la dimension oculta, el tipo de atencion ni si se emplearon tecnicas como grouped-query attention, decodificacion especulativa o atencion lineal. El unico dato estructural verificable es el recuento de parametros (2.390.384.448) obtenido de los pesos safetensors del modelo base.

Respecto al entrenamiento, la model card unicamente referencia el dataset iapp/ChindaMT-Grounded como corpus asociado al ajuste, sin indicar el numero de tokens, la composicion del dataset, la mezcla de idiomas ni si se aplicaron tecnicas de alineacion como RLHF, DPO o SFT con preferencias. Tampoco se documenta la existencia de una fase de preentrenamiento propia ni el origen de los datos. Esta ausencia de informacion tecnica impide evaluar la calidad del proceso de entrenamiento o reproducirlo.

Un detalle destacable es la presencia de ficheros mmproj (multi-modal supplement), lo que sugiere que el modelo base podria incorporar un componente multimodal, presumiblemente de vision, aunque la model card no lo confirma ni describe su funcion. Esta es una observacion derivada de los ficheros incluidos, no una capacidad documentada por el autor.

## Capacidades

- Traduccion automatica bidireccional entre ingles y tailandes, que es la tarea declarada en el pipeline del repositorio (translation).
- Generacion de texto con formato instruction-following, segun los tags del modelo.
- Uso conversacional multi-turno, indicado por el tag conversational.
- Traduccion orientada a "Grounded", termino presente en el nombre del dataset de ajuste, aunque no se especifica en que consiste dicha grounding.
- Posible soporte multimodal derivado de los ficheros mmproj incluidos en el repositorio (no confirmado en la model card).
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Razonamiento matematico, generacion de codigo: no disponible en la informacion proporcionada.

## Casos de uso

- Localizacion de software y documentacion tecnica: el modelo traduce cadenas y parrafos entre ingles y tailandes, lo que permite mantener versiones localizadas de interfaces, manuales y notas de version en un flujo de trabajo automatizado, siempre que se valide la terminologia tecnica.
- Atencion al cliente bilingue: se puede desplegar como capa de traduccion en un sistema de soporte donde el cliente escribe en tailandes y el agente interno trabaja en ingles, o viceversa, aprovechando el formato conversacional del modelo.
- Traduccion de resenas y catalogos de comercio electronico: conversion masiva de descripciones de producto y opiniones de usuarios entre ambos idiomas para plataformas de venta online que operan en mercados tailandeses.
- Subtitulado y transcripcion de contenido audiovisual: traduccion de guiones y subtitulos para creadores o plataformas que distribuyen contenido en ingles y tailandes, con la ventaja de que las cuantizaciones ligeras permiten procesar grandes volumenes en local.
- Generacion de datos sinteticos para entrenamiento: uso del modelo para producir pares paralelos ingles-tailandes que alimenten otros sistemas de traduccion o clasificadores, dado que su licencia Apache 2.0 no restringe este uso.
- Procesamiento en el borde o entornos sin conectividad: gracias a las cuantizaciones desde 1,2 GB, el modelo puede ejecutarse en portatiles o dispositivos con recursos limitados donde no es viable llamar a una API externa, por ejemplo herramientas de campo con contenido sensible.
- Investigacion en traduccion automatica de bajos recursos: el modelo sirve como punto de referencia para experimentos academicos sobre idiomas con menos representacion, ya que su tamano compacto permite entrenar o evaluar variantes en GPU de gama media.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio de cuantizaciones no incluye metricas de calidad de traduccion (BLEU, chrF, COMET), ni resultados en tareas generales como MMLU, GSM8K o HumanEval, ni comparaciones con otros sistemas de traduccion. Tampoco se proporcionan curvas de perplexidad especificas para cada cuantizacion, mas alla de las referencias genericas a graficos comparativos de terceros que aparecen en la model card.

## Requisitos de hardware

- VRAM estimada para inferencia, calculada a partir del tamano de los ficheros GGUF y anadiendo un margen para el contexto y el runtime:
  - Q2_K (1,2 GB de pesos): aproximadamente 2 GB de VRAM.
  - Q4_K_S o Q4_K_M (1,6-1,7 GB): aproximadamente 2,5 GB de VRAM.
  - Q8_0 (2,7 GB): aproximadamente 3,5 GB de VRAM.
  - f16 (4,9 GB): aproximadamente 6 GB de VRAM.
- Estas cifras son estimaciones derivadas de los tamanos de fichero publicados, no mediciones oficiales.
- Cabe en practicamente cualquier GPU de consumo: RTX 3060, RTX 4060, RTX 4090, e incluso en GPUs con 4-6 GB de memoria si se usa Q4_K_M o inferior. Tambien es viable en CPU con suficiente RAM.
- GPU recomendadas para mayor throughput: RTX 4090 o A100/H100 si se necesita procesar grandes volumenes, aunque para un modelo de 2,4 mil millones de parametros el cuello de botella rara vez sera la GPU.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, llama-cpp-python y otros runtimes compatibles con GGUF. Para vLLM o TGI seria necesario trabajar con el modelo base en safetensors, no con este repositorio.
- Latencia y throughput estimados: no disponible. No se han publicado mediciones de tokens por segundo ni de tiempo hasta el primer token.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato | Rendimiento |
|---|---|---|---|---|---|---|
| mradermacher/ChindaMT-2B-GGUF | 2,39 B | No disponible | en, th | Apache 2.0 | GGUF | No disponible |
| mradermacher/ChindaMT-4B-GGUF | No disponible | No disponible | en, th | No disponible | GGUF | No disponible |
| iapp/ChindaMT-2B (modelo base) | 2,39 B | No disponible | en, th | Apache 2.0 | Safetensors (formato habitual del base) | No disponible |
| Otras familias de traduccion abierta (NLLB, Opus-MT, MADLAD) | No disponible | No disponible | No disponible | No disponible | No disponible | No disponible |

La unica comparacion verificable con los datos disponibles es la que enfrenta este repositorio con su hermano mayor, ChindaMT-4B-GGUF, que aparece en los resultados de busqueda como una variante de mayor tamano de la misma familia. No se dispone de especificaciones tecnicas ni de resultados de calidad para ninguna de las dos variantes, por lo que no es posible establecer cual ofrece mejor relacion calidad-coste.

## Limitaciones y advertencias

- Sesgos conocidos: no disponible. No se documenta ningun analisis de sesgos ni la composicion del corpus de entrenamiento, lo que impide evaluar sesgos de genero, culturales o politicos.
- Riesgo de alucinacion: al ser un modelo de traduccion, el riesgo principal es la introduccion de contenido inexistente en el texto origen o la omision de matices, especialmente en textos largos o muy tecnicos. No hay evaluaciones publicadas que cuantifiquen este riesgo.
- Limitaciones de contexto: la longitud de contexto es no disponible, por lo que no se puede garantizar el tratamiento correcto de documentos largos sin truncamiento. Se recomienda fragmentar entradas extensas.
- Limitaciones de idioma: el modelo solo declara soporte para ingles y tailandes. No hay evidencia de capacidades en castellano ni en otros idiomas, por lo que no deberia usarse fuera de ese par.
- Restricciones de licencia: la licencia Apache 2.0 permite uso comercial, modificacion y redistribucion, pero conviene verificar que el modelo base iapp/ChindaMT-2B mantiene efectivamente esa misma licencia, ya que este repositorio es una derivacion.
- Caveat sobre el autor de la cuantizacion: mradermacher es un tercero que cuantiza modelos de otros; los posibles errores de conversion no son responsabilidad del autor original y no hay validacion oficial de las cuantizaciones publicadas.
- Ausencia de datos de calidad: sin benchmarks publicados, no se puede afirmar que el modelo sea competitivo frente a alternativas comerciales de traduccion, por lo que se recomienda una evaluacion propia antes de usarlo en produccion.
- Cuantizaciones de baja calidad: las variantes Q2_K y Q3_K_S, aunque muy ligeras, suelen degradar notablemente la calidad de la traduccion. Para uso real se recomienda Q4_K_M o superior.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/ChindaMT-2B-GGUF
- Modelo base: https://huggingface.co/iapp/ChindaMT-2B
- Dataset de referencia: https://huggingface.co/datasets/iapp/ChindaMT-Grounded
- Variante de mayor tamano: https://huggingface.co/mradermacher/ChindaMT-4B-GGUF
- Pagina de resumen y descargas del autor: https://hf.tst.eu/model#ChindaMT-2B-GGUF
- Peticiones de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Guia general de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Notas sobre tipos de cuantizacion (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Grafico comparativo de perplexidad por cuantizacion: https://www.nethype.de/huggingface_embed/quantpplgraph.png
