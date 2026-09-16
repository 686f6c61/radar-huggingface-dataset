# sailu4/lmaana-2.1

## Resumen

Lmaana 2.1 es un checkpoint de investigación para reconocimiento automático del habla (ASR) de darija marroquí, desarrollado por el usuario sailu4 y publicado en HuggingFace. Se trata de una adaptación del checkpoint retenido Lmaana V5 sobre la arquitectura OmniASR CTC `1b_v2` (`wav2vec2_asr`), implementada en fairseq2. El modelo resuelve la transcripción de audio en darija con mezcla de código árabe/latín, y su rasgo más distintivo es que los transcritos de entrenamiento preservan explícitamente el code-switching y corrigen expresiones francesas que antes aparecían escritas fonéticamente en árabe.

El modelo tiene aproximadamente 1.000 millones de parámetros (variante `1b_v2`), utiliza un tokenizador de caracteres `omniASR_tokenizer_written_v2` y decodificación CTC greedy sin modelo de lenguaje externo. El entrenamiento consistió en 5.000 pasos de adaptación con una mezcla de dos corpus limpiados: Dataset13 (52.892 ejemplos, 263,76 horas, peso efectivo del 74,21%) y Lmaana clean derivado de MoulSot (74.243 ejemplos, 91,68 horas, peso del 25,79%). El checkpoint seleccionado fue el paso 5.000, elegido por ser el mejor en las cuatro tasas de error de validación.

Es relevante ahora porque la darija marroquí es un idioma con recursos ASR muy escasos, con una fuerte presencia de code-switching con francés, y la mayoría de los sistemas multilingües no lo cubren específicamente. El repositorio incluye la configuración de entrenamiento y los resúmenes de selección, validación y test, lo que lo convierte en una referencia útil para investigar estrategias de limpieza de transcripciones y de *mixed replay*. La mejora respecto a V5 es modesta y no se produce en todas las métricas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | OmniASR CTC `1b_v2` (`wav2vec2_asr`), encoder tipo wav2vec2 con cabeza CTC |
| Parametros totales | ~1.000 millones (variante `1b_v2`) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica en el sentido de LLM; no disponible la ventana maxima de audio. Los segmentos de entrenamiento promedian 4,4 s (Lmaana clean) y 18,0 s (Dataset13) |
| Tipos de cuantizacion | no disponible (no se publican variantes cuantizadas) |
| Idiomas soportados | darija marroquí (`ary`) y arabe (`ar`), con mezcla de codigo arabe/latin (spans en frances) |
| Licencia | other (terminos no especificados en la informacion disponible) |
| Formato de pesos | Checkpoint nativo fairseq2/OmniASR en PyTorch (`.pt`), ruta `checkpoint/model/pp_00/tp_00/sdp_00.pt`; incluye `tokenizer/` y `metadata/`. No es una exportacion Transformers `from_pretrained()`, no hay safetensors ni GGUF |
| Framework | fairseq2 |
| Tarea | Automatic speech recognition (pipeline: `automatic-speech-recognition`) |
| Tamano del repositorio | 3,9 GB |
| Metricas declaradas | WER, CER/UER |
| Decodificacion en evaluacion | CTC greedy, sin modelo de lenguaje externo |

## Arquitectura y entrenamiento

La arquitectura es `wav2vec2_asr` dentro del ecosistema OmniASR, con un encoder convolucional y transformer sobre audio crudo y una cabeza de clasificacion CTC. El tokenizador es de caracteres (`omniASR_tokenizer_written_v2`), lo que explica que fairseq2 emita la metrica `UER` y que en la model card se use como tasa de error a nivel de caracter (`CER/UER`). El checkpoint es nativo de fairseq2: se carga mediante la receta `wav2vec2_asr` correspondiente y el tokenizador incluido en el repositorio, no mediante la API estandar de Transformers.

El entrenamiento no parte de la base oficial de OmniASR, sino del checkpoint retenido Lmaana V5, porque un experimento previo de curriculum limpio desde la base oficial rindio peor que V5. La adaptacion duro 5.000 pasos con learning rate maximo de `1e-7`, congelacion del encoder durante los primeros 500 pasos, acumulacion de gradiente de 8 lotes y `beta_corpus`/`beta_language` de `1.0`/`1.0`, con validacion y checkpoint cada 500 pasos. El paso 0 de la seleccion fue el propio V5, y se aceptaba un candidato siempre que no regresase mas de 0,05 puntos de CER/UER y 0,10 puntos de WER en la validacion de Dataset13 o de Lmaana clean. El paso 5.000 quedo primero en las cuatro tasas de error de validacion. No se menciona RLHF, DPO ni ninguna etapa de alineacion, algo esperable en un modelo CTC de ASR.

## Capacidades

- Transcripcion de audio en darija marroquí (`ary`) y en arabe (`ar`).
- Manejo explicito de code-switching arabe/latin, incluyendo spans en frances transcritos en ortografia estandar en lugar de transcripcion fonetica arabe.
- Reconocimiento sobre segmentos cortos (media de 4,4 s en el corpus Lmaana clean) y sobre segmentos largos (media de 18,0 s en Dataset13).
- Salida a nivel de caracter mediante tokenizador de caracteres, con decodificacion CTC greedy.
- Uso como base para adaptacion adicional en fairseq2/OmniASR con un optimizador nuevo.
- No dispone de tool calling, function calling, capacidades de agente, vision, audio generativo ni modo de razonamiento: es un modelo puramente discriminativo de ASR.
- El soporte multilingue se limita a `ary` y `ar` con mezcla de frances; no hay indicios de cobertura de otros idiomas.

## Casos de uso

- Transcripcion de grabaciones de call centers en Marruecos: el modelo esta entrenado sobre darija con mezcla de frances, un patron habitual en conversaciones telefonicas reales, por lo que puede transcribir interacciones comerciales donde aparecen terminos franceses mezclados con darija.
- Subtitulado de contenido audiovisual marroquí: series, videos y pódcast con habla coloquial y cambios de idioma dentro de la misma frase, donde un ASR de arabe estandar fallaria o normalizaria en exceso.
- Anotacion asistida de corpus de habla: generar transcripciones preliminares sobre las que un anotador humano corrige, reduciendo el coste de crear datos etiquetados para futuras iteraciones del propio modelo.
- Investigacion sobre code-switching en ASR: al preservar los cambios de script, permite medir y analizar errores especificamente en los tramos bilingues, un fenomeno poco cubierto por los corpus disponibles.
- Analisis de opinion y monitorizacion de redes sociales: transcripcion de audio de publicaciones y mensajes de voz para su posterior procesamiento de texto en un pipeline de moderacion o de escucha social orientado al mercado marroquí.
- Interfaces de voz para productos dirigidos al usuario marroquí: dictado, busqueda por voz o asistentes internos que necesitan aceptar habla coloquial en lugar de arabe formal moderno.
- Archivado y cumplimiento normativo: conversion a texto de grabaciones de atencion al cliente para auditoria o busqueda documental, con la advertencia de que el modelo no esta validado para decisiones automatizadas de alto impacto.
- Linea base experimental: comparacion de estrategias de limpieza de transcripciones y de *mixed replay* dentro de la familia Lmaana V5/2.1, dado que el repositorio publica configuracion y resumenes de validacion y test.

## Benchmarks y rendimiento

Resultados de validacion publicados en la model card (la metrica UER se emplea como tasa de error a nivel de caracter):

| Checkpoint | Dataset13 CER/UER | Dataset13 WER | Lmaana CER/UER | Lmaana WER |
|---|---:|---:|---:|---:|
| Retained V5 baseline | 17,3908% | 43,2622% | 13,1994% | 40,4155% |
| Step 3.500 | 17,3347% | 43,1245% | 13,2053% | 40,4015% |
| Lmaana 2.1, step 5.000 | 17,3252% | 43,1238% | 13,1925% | 40,3535% |

Resultados sobre particiones de test retenidas, evaluadas una sola vez tras la seleccion por validacion:

| Modelo | Corpus de test | CTC loss | CER/UER | WER | Ejemplos |
|---|---|---:|---:|---:|---:|
| Retained V5 | Dataset13 | 183,8770 | 17,7674% | 44,2243% | 6.576 |
| Lmaana 2.1 | Dataset13 | 183,6260 | 17,7029% | 44,0393% | 6.576 |
| Retained V5 | Lmaana clean | 75,2100 | 14,6099% | 45,1385% | 1.957 |
| Lmaana 2.1 | Lmaana clean | 75,0515 | 14,6048% | 45,1690% | 1.957 |

Frente a V5, Lmaana 2.1 mejora el CER de test de Dataset13 en 0,0645 puntos y el WER en 0,1850 puntos. En Lmaana clean mejora el CER en 0,0051 puntos pero el WER empeora en 0,0305 puntos. La propia model card advierte que los resultados de Dataset13 y Lmaana clean no deben compararse entre si como si fuesen mediciones repetidas del mismo conjunto, porque difieren en material fuente, duracion de segmento, convenciones de transcripcion y patrones de code-switching. No se han publicado comparaciones con otros modelos de ASR en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no publicada. Como referencia de orden de magnitud, un checkpoint de ~1.000 millones de parametros ocupa aproximadamente 4 GB en fp32 y unos 2 GB en fp16/bf16, sin contar activaciones ni estados del decodificador CTC. El repositorio pesa 3,9 GB, coherente con pesos en precision completa.
- GPU recomendadas: no especificadas por el autor. Para inferencia por segmentos caben opciones de gama consumer con 8-12 GB de VRAM; para procesado por lotes de horas de audio resultan mas adecuadas RTX 3090/4090, A100, H100 o similares.
- Cabe en GPU consumer: previsiblemente si, dado el tamano del checkpoint, aunque no hay validacion publicada de latencias concretas en esas tarjetas.
- Opciones de despliegue: al ser un checkpoint nativo fairseq2/OmniASR, no es compatible directamente con vLLM, llama.cpp, Ollama ni TGI. Requiere el stack fairseq2 y la receta `wav2vec2_asr` correspondiente, cargando el shard `checkpoint/model/pp_00/tp_00/sdp_00.pt` y el tokenizador de `tokenizer/`. Una conversion manual a la arquitectura wav2vec2 de Transformers seria posible en teoria, pero no esta documentada ni soportada en el repositorio.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No se han publicado en la informacion disponible comparaciones de Lmaana 2.1 con otros sistemas de ASR. La tabla siguiente recoge unicamente los datos conocidos de este checkpoint y deja como "no disponible" cualquier celda que no pueda confirmarse con la informacion proporcionada.

| Modelo | Parametros | Contexto / ventana | Idiomas | Licencia | Formato | Rendimiento comparable |
|---|---|---|---|---|---|---|
| Lmaana 2.1 | ~1.000 M (`1b_v2`) | no disponible (segmentos de entrenamiento de 4,4 s y 18,0 s) | `ary`, `ar` con code-switching | other | PyTorch `.pt` nativo fairseq2 | WER test 44,0393% (Dataset13) y 45,1690% (Lmaana clean) |
| Retained Lmaana V5 | ~1.000 M | no disponible | `ary`, `ar` con code-switching | no disponible | PyTorch `.pt` nativo fairseq2 | WER test 44,2243% y 45,1385% |
| Otros sistemas multilingues de ASR (Whisper, MMS, SeamlessM4T) | no disponible en la informacion proporcionada | no disponible | no disponible | no disponible | no disponible | no disponible |

Dentro de la propia familia, la unica comparacion respaldada por datos es la de Lmaana 2.1 frente a V5, y el resultado no es uniforme: mejora CER y WER en Dataset13 y CER en Lmaana clean, pero retrocede ligeramente en WER sobre Lmaana clean.

## Limitaciones y advertencias

- Los resultados se obtuvieron con decodificacion CTC greedy y sin modelo de lenguaje externo; el uso de un LM podria cambiar las tasas de error, pero no hay datos publicados al respecto.
- Las mejoras sobre V5 son pequenas y proceden de una unica ejecucion de entrenamiento, sin replicas independientes.
- El rendimiento puede degradarse en acentos, condiciones de grabacion, dominios y patrones de code-switching no representados en los corpus de entrenamiento.
- Las transcripciones de test y validacion se excluyeron del entrenamiento, pero la model card advierte explicitamente que los resultados de Dataset13 y de Lmaana clean no son mediciones comparables entre si.
- Uso previsto limitado a investigacion; el autor indica que el checkpoint no ha sido validado para decisiones automatizadas ni para escenarios de alto riesgo.
- Licencia "other" sin terminos concretos en la informacion disponible: es imprescindible aclarar las condiciones de uso comercial con el autor antes de integrarlo en un producto.
- Riesgo de sesgo derivado de la composicion de los corpus (Dataset13 como dominio dominante con el 74,21% del peso de muestreo), lo que puede infrarrepresentar variedades regionales o registros concretos.
- Modelo puramente de ASR: no genera texto libre, no razona, no soporta tool calling ni agentes, y no debe evaluarse con criterios de un LLM.
- El codigo de carga depende del stack fairseq2 y de la receta OmniASR; no existe una ruta de un solo paso mediante `from_pretrained()` de Transformers, lo que aumenta la friccion de integracion en produccion.
- El modelo tiene cero descargas y cero likes en el momento de la consulta, y la model card disponible aparece truncada, por lo que puede faltar informacion sobre limitaciones adicionales.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/sailu4/lmaana-2.1
- Repositorio fairseq2 (framework requerido): no disponible en la informacion proporcionada
- Paper de OmniASR: no disponible en la informacion proporcionada
- Paper o blog de la familia Lmaana V5: no disponible en la informacion proporcionada
- Corpus MoulSot: no disponible en la informacion proporcionada
- Demos o espacios asociados: no disponible en la informacion proporcionada
- Busqueda web: los resultados devueltos no guardan relacion con el modelo (contenido sobre futbol americano universitario), por lo que no se incluye ningun enlace adicional.
