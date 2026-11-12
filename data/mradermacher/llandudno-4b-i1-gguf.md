# mradermacher/Llandudno-4B-i1-GGUF

## Resumen

Llandudno-4B-i1-GGUF es una coleccion de cuantizaciones en formato GGUF generadas por mradermacher a partir del modelo base jonpojonpo/Llandudno-4B. El modelo original se presenta como un modelo de lenguaje especializado en lenguas celtas y escocesas (gales, irlandes, gaelico escoces y scots), con etiquetas que indican soporte para tool calling, modo de razonamiento (thinking), contexto largo, vision y multi-token prediction (MTP), ademas de variantes dialectales del gales (gog y hwntw).

La relevancia de esta publicacion radica en que facilita el despliegue local del modelo mediante cuantizaciones de baja precision (desde IQ1_S hasta Q6_K), incluyendo variantes con imatrix para mejorar la calidad en regimenes de cuantizacion agresiva. El repositorio esta pensado para usuarios de llama.cpp y ecosistemas compatibles con GGUF que necesiten ejecutar un modelo multilingue de nicho en hardware de consumo.

No obstante, la informacion disponible es muy limitada: el repositorio no incluye resultados de benchmarks, no detalla la composicion del dataset de entrenamiento ni el numero de tokens, y el recuento de parametros reportado en safetensors para el modelo base (1.797.272) resulta inconsistente con la denominacion "4B" del nombre. Estos datos se reflejan tal cual en la ficha, marcando como "no disponible" aquello que no se ha publicado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | 1.797.272 (segun safetensors del modelo base; inconsistente con la denominacion "4B") |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible (la etiqueta "long-context" sugiere contexto extendido, sin cifra publicada) |
| Tipos de cuantizacion | Q2_K, IQ3_M, Q4_K_S, IQ3_XXS, Q3_K_M, small-IQ4_NL, Q4_K_M, IQ2_M, Q6_K, IQ4_XS, Q2_K_S, IQ1_M, Q3_K_S, IQ2_XXS, Q3_K_L, IQ2_XS, Q5_K_S, IQ2_S, IQ1_S, Q5_K_M, Q4_0, IQ3_XS, Q4_1, IQ3_S (variantes i1/imatrix) |
| Idiomas soportados | cy (gales), en (ingles), ga (irlandes), gd (gaelico escoces), sco (scots) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (cuantizaciones i1 con imatrix); el modelo base en safetensors |

## Arquitectura y entrenamiento

No se dispone de informacion publicada sobre la arquitectura del modelo base Llandudno-4B en los datos proporcionados. Las etiquetas del repositorio mencionan capacidades de vision, tool calling, thinking y multi-token prediction (MTP), lo que sugiere una arquitectura transformer multimodal con soporte de razonamiento explicito y decodificacion multi-token, pero no se confirma ni el tipo exacto de transformer, ni el mecanismo de atencion, ni si incorpora componentes hibridos.

Tampoco se detallan los datos de entrenamiento: no hay cifra de tokens, ni composicion del corpus, ni indicacion de si se aplicaron fases de RLHF, DPO o similar. La unica informacion sobre el proceso de esta publicacion concreta es que mradermacher ha generado cuantizaciones ponderadas con imatrix (version de cuantizacion 2, salida tensor-quantised) a partir del modelo base, y que los ficheros mmproj (necesarios para la parte de vision) se alojan en el repositorio estatico paralelo Llandudno-4B-GGUF.

## Capacidades

- Generacion de texto en gales, ingles, irlandes, gaelico escoces y scots.
- Soporte de variantes dialectales del gales (etiquetas gog y hwntw).
- Tool calling / function calling, segun las etiquetas del repositorio.
- Modo de razonamiento (thinking), segun las etiquetas del repositorio.
- Contexto largo (etiqueta long-context, sin cifra publicada).
- Capacidades de vision (etiqueta vision; los ficheros mmproj estan en el repositorio estatico).
- Multi-token prediction (etiqueta mtp).
- Capacidades multilingues limitadas a las cinco lenguas indicadas; no hay evidencia de soporte de castellano.

## Casos de uso

- Procesamiento de textos en gales: el modelo puede emplearse para normalizar, resumir o generar contenido en gales estandar y en variantes dialectales (gog, hwntw), un nicho con pocos modelos disponibles.
- Traduccion entre lenguas celtas e ingles: util para traduccion asistida gales-ingles, irlandes-ingles o gaelico escoces-ingles en entornos editoriales o administrativos.
- Atencion al cliente en lenguas minoritarias: despliegue local en GGUF para gestionar conversaciones multi-turno en gales o irlandes, con la ventaja de la licencia Apache 2.0 para uso comercial.
- Digitalizacion de patrimonio linguistico: transcripcion asistida y generacion de descripciones en scots o gaelico escoces para archivos y museos.
- Integracion en pipelines con tool calling: uso del modelo como agente ligero que invoca funciones para consultas de datos en entornos bilingues gales-ingles.
- Prototipado en hardware de consumo: las cuantizaciones IQ1_S a Q6_K permiten experimentar con el modelo en portatiles y GPUs de gama media mediante llama.cpp u Ollama.
- Analisis de documentos con vision: si se descargan los ficheros mmproj del repositorio estatico, el modelo podria procesar imagenes con texto en gales o ingles, aunque no hay datos publicados que confirmen su calidad en esta tarea.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible con precision, dado que el recuento de parametros reportado (1,8 M) es inconsistente con la denominacion "4B". Si el modelo real tiene ~4.000 millones de parametros, las cuantizaciones Q4_K_M ocuparian del orden de 2,5-3 GB y Q6_K en torno a 3,5-4 GB; si el recuento de safetensors es correcto, el modelo seria trivialmente pequeno. No se puede confirmar ninguno de los dos escenarios.
- GPU recomendadas: no disponible. Para un modelo de ~4B en Q4_K_M bastaria una GPU de 6-8 GB de VRAM; para la parte de vision habria que sumar el fichero mmproj.
- Cabe en GPU de consumo: probablemente si, en el escenario de ~4B con cuantizaciones Q4 o inferiores, pero no confirmado.
- Opciones de despliegue: llama.cpp, Ollama y cualquier runtime compatible con GGUF; el repositorio tambien declara compatibilidad con endpoints (tag endpoints_compatible).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. No se han identificado en la informacion proporcionada modelos comparables de la misma categoria (modelos multilingues centrados en lenguas celtas con cuantizaciones GGUF publicadas por el mismo autor).

## Limitaciones y advertencias

- La informacion publicada es muy escasa: no hay benchmarks, ni detalles de entrenamiento, ni arquitectura documentada.
- El recuento de parametros de safetensors (1.797.272) contradice la denominacion "4B" del modelo; conviene verificar el modelo base antes de planificar el despliegue.
- Riesgo de alucinacion no cuantificado; al ser un modelo de nicho linguistico, es probable que tenga menos datos de entrenamiento por lengua que los modelos generalistas.
- Cobertura limitada a cinco lenguas (cy, en, ga, gd, sco); no se declara soporte de castellano.
- Las capacidades de vision requieren descargar los ficheros mmproj desde el repositorio estatico Llandudno-4B-GGUF; no estan incluidos por defecto en este repositorio.
- Las cuantizaciones IQ1 e IQ2 pueden degradar notablemente la calidad; se recomienda Q4_K_M o superior para uso en produccion.
- Licencia Apache 2.0 en el modelo base, lo que permite uso comercial, pero conviene revisar la model card original por si hubiera condiciones adicionales no reflejadas aqui.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validacion comunitaria del rendimiento.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/Llandudno-4B-i1-GGUF
- Modelo base: https://huggingface.co/jonpojonpo/Llandudno-4B
- Cuantizaciones estaticas (incluye mmproj): https://huggingface.co/mradermacher/Llandudno-4B-GGUF
- Pagina de descargas del autor: https://hf.tst.eu/model#Llandudno-4B-i1-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico comparativo de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas sobre cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- FAQ y peticiones de modelos: https://huggingface.co/mradermacher/model_requests
