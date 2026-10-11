# mradermacher/ANITA-NEXT-24B-Magistral-2506-VISION-ITA-GGUF

## Resumen

Este repositorio contiene la version cuantizada en formato GGUF del modelo ANITA-NEXT-24B-Magistral-2506-VISION-ITA, publicada por el usuario mradermacher, conocido por generar cuantizaciones de terceros para llama.cpp y derivados. El modelo original lo desarrolla m-polignano (los tags del repositorio apuntan a la Universita degli Studi di Bari, en Italia: uniba, bari, italy, italia), y la denominacion ANITA sugiere un modelo de lenguaje orientado al italiano. Se trata de un modelo multimodal (VLM) con vision, etiquetado para los idiomas ingles e italiano, con licencia Apache 2.0.

El modelo cuenta con 23.572.403.200 parametros totales (unos 23,6 mil millones), lo que lo situa en la categoria de 24B. El nombre del modelo base incluye "Magistral-2506", que coincide con la denominacion de la familia Magistral de Mistral AI publicada en junio de 2025, pero la informacion proporcionada no confirma la arquitectura interna, el proceso de entrenamiento ni la longitud de contexto, por lo que estos datos se marcan como no disponibles.

La relevancia de esta ficha esta en la propia cuantizacion: mradermacher ofrece 11 variantes de cuantizacion mas dos ficheros de proyeccion multimodal (mmproj), lo que permite desplegar un VLM de 24B en hardware de consumo, desde 9,0 GB (Q2_K) hasta 25,2 GB (Q8_0). El repositorio acumula 589 descargas y 1 like en el momento de la consulta, y ocupa 162,8 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no se detalla en la informacion proporcionada) |
| Parametros totales | 23.572.403.200 (~23,6 B) |
| Parametros activos | no aplica (no se indica que sea un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | x-f16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, IQ4_XS, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K; mas mmproj-Q8_0 y mmproj-f16 para la parte visual |
| Idiomas soportados | en, it |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (este repositorio); el modelo base se publica en formato transformers/safetensors |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna ni sobre el proceso de entrenamiento en el material proporcionado. El repositorio de cuantizacion no incluye model card del autor original, solo los metadatos y la tabla de ficheros GGUF. Los tags indican que se trata de un modelo multimodal (Visual, VLM) con soporte de vision, base para la generacion de descripciones y conversacion con imagenes, ademas de texto.

El nombre del modelo base, "ANITA-NEXT-24B-Magistral-2506-VISION-ITA", sugiere que deriva de la familia Magistral de Mistral AI (junio de 2025) adaptada al italiano, pero no se confirma en la informacion disponible. Tampoco hay datos sobre el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de alineacion como RLHF o DPO. La cuantizacion realizada por mradermacher se apoya en llama.cpp; los metadatos del fichero indican "quantize_version: 2" y "output_tensor_quantised: 1".

## Capacidades

- Generacion de texto conversacional: el modelo esta etiquetado como conversational y orientado a dialogos multi-turno.
- Procesamiento de vision (VLM): incluye ficheros mmproj (proyeccion multimodal) en Q8_0 y f16, necesarios para habilitar la entrada de imagenes en llama.cpp.
- Multilinguee limitado: soporte declarado de ingles (en) e italiano (it). No se documentan otros idiomas.
- Especializacion en italiano: los tags ita, italian, italia y el nombre ANITA apuntan a un ajuste orientado al italiano.
- Razonamiento: el nombre del modelo base incluye "Magistral", lo que podria implicar un modo de razonamiento con tokens de pensamiento, pero esto no se confirma en la informacion proporcionada.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades especiales (vision, audio, thinking mode): vision confirmada por los ficheros mmproj y los tags; audio y thinking mode no disponibles.

## Casos de uso

- Descripcion automatica de imagenes en italiano: el modelo acepta entrada visual mediante los ficheros mmproj y puede generar descripciones en italiano, util para catalogacion de imagenes, accesibilidad o generacion de alt-text en CMS.
- Asistencia conversacional en italiano: al estar etiquetado como conversational y con soporte de italiano, encaja en chatbots de atencion al cliente para el mercado italiano, desplegables en local por la licencia Apache 2.0.
- Documentacion tecnica bilinguee italiano-ingles: traduccion y adaptacion de manuales o fichas de producto entre ambos idiomas.
- Procesamiento de documentos con imagenes (facturas, formularios, capturas): combinando texto e imagen para extraer informacion estructurada, siempre que se valide la salida.
- Prototipado e investigacion en NLP italiano: el modelo puede servir como base para experimentos academicos (el desarrollo esta vinculado a la Universita di Bari) y para evaluar tecnicas de cuantizacion en VLMs.
- Despliegue en hardware de consumo: gracias a las cuantizaciones Q4_K_S/Q4_K_M (13,6 y 14,4 GB), es posible ejecutar un VLM de 24B en una GPU de 24 GB, habilitando casos de uso de vision en local sin coste de API.
- Generacion de codigo: no hay evidencia en la informacion proporcionada de que el modelo este especializado en codigo; no se recomienda como caso de uso principal.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada por cuantizacion (pesos del modelo, sin contar contexto ni el mmproj):
  - Q2_K: 9,0 GB
  - Q3_K_S: 10,5 GB
  - Q3_K_M: 11,6 GB
  - Q3_K_L: 12,5 GB
  - IQ4_XS: 13,0 GB
  - Q4_K_S: 13,6 GB
  - Q4_K_M: 14,4 GB
  - Q5_K_S: 16,4 GB
  - Q5_K_M: 16,9 GB
  - Q6_K: 19,4 GB
  - Q8_0: 25,2 GB
- Componente multimodal adicional: mmproj-Q8_0 ocupa 0,6 GB y mmproj-f16 ocupa 1,0 GB; se deben sumar a la cuantizacion elegida si se usa vision.
- GPU recomendadas: para las cuantizaciones Q4 (13,6-14,4 GB) una RTX 4090 o RTX 3090 de 24 GB es suficiente dejando margen para contexto; para Q6_K y Q8_0 (19,4-25,2 GB) se recomienda una GPU de 40-48 GB (A100 40 GB, RTX 6000 Ada, A6000) o repartir en varias GPU.
- Cabe en GPU de consumo: si, las cuantizaciones Q2_K a Q4_K_M caben en tarjetas de 12-16 GB (con riesgo de degradacion en Q2/Q3) y Q4/Q5 en tarjetas de 16-24 GB.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, koboldcpp, llama.cpp server y text-generation-webui. Para usar la parte visual hay que cargar el fichero mmproj junto con el modelo. No esta pensado para vLLM (que no soporta GGUF de forma nativa) ni para TGI con GGUF.
- Latencia y throughput: no disponible (no se proporcionan mediciones).

## Comparativa con modelos similares

Los datos de las alternativas proceden de conocimiento publico general y no se han verificado en la informacion proporcionada; se marcan como referencia.

| Modelo | Parametros | Contexto | Vision | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ANITA-NEXT-24B-Magistral-2506-VISION-ITA (este modelo) | 23,6 B | no disponible | si | apache-2.0 | HuggingFace (original y GGUF) |
| Mistral Small 3.1 24B (2503) | 24 B | 128k (referencia) | si | apache-2.0 | HuggingFace |
| Magistral Small 1.0 (2506) | 24 B | no disponible | no disponible | apache-2.0 | HuggingFace |
| Gemma 3 27B IT | 27 B | 128k (referencia) | si | Gemma Terms of Use | HuggingFace |

No se dispone de datos de rendimiento comparado entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: no disponible. No se documenta ningun analisis de sesgos en el material proporcionado.
- Riesgo de alucinacion: no disponible. No se aportan evaluaciones de fiabilidad.
- Limitaciones de contexto e idioma: solo se declaran ingles e italiano; el uso en castellano no esta soportado oficialmente y los resultados pueden degradarse.
- Restricciones de licencia: la licencia apache-2.0 permite uso comercial, pero conviene verificar la licencia del modelo base original, cuyo repositorio no se incluye en la informacion proporcionada.
- Cuantizaciones de baja calidad: las variantes Q2_K, Q3_K_S, Q3_K_M y Q3_K_L pueden degradar notablemente la calidad de salida. mradermacher recomienda Q4_K_S y Q4_K_M como equilibrio entre tamano y calidad.
- Vision dependiente de fichero adicional: sin cargar el mmproj, el modelo no procesara imagenes correctamente.
- Metadatos incompletos: este repositorio es una cuantizacion de terceros; no incluye pipeline declarado, ni datos de entrenamiento, ni benchmarks.
- Posible modo de razonamiento: si el modelo base es de la familia Magistral, puede emitir tokens de razonamiento que consuman contexto y aumenten la latencia; conviene comprobarlo antes de produccion.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/ANITA-NEXT-24B-Magistral-2506-VISION-ITA-GGUF
- Repositorio del modelo base: https://huggingface.co/m-polignano/ANITA-NEXT-24B-Magistral-2506-VISION-ITA
- Cuantizaciones weighted/imatrix: https://huggingface.co/mradermacher/ANITA-NEXT-24B-Magistral-2506-VISION-ITA-i1-GGUF
- Pagina de resumen del modelo (hf.tst.eu): https://hf.tst.eu/model#ANITA-NEXT-24B-Magistral-2506-VISION-ITA-GGUF
- Peticiones de cuantizacion de mradermacher: https://huggingface.co/mradermacher/model_requests
- Guia general de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico comparativo de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Analisis de cuantizaciones de Artefact2: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Empresa responsable de la infraestructura de mradermacher (nethype GmbH): https://www.nethype.de/
