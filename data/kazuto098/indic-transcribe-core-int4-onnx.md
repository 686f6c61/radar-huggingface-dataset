# kazuto098/indic-transcribe-core-int4-onnx

## Resumen

Indic-Transcribe-core INT4 ONNX es una version cuantizada a 4 bits y exportada a ONNX del modelo de reconocimiento automatico del habla (ASR) `bodhan-ai/indic-transcribe-core`, desarrollado originalmente por Bodhan AI en colaboracion con AI4Bharat. Esta publicacion concreta la firma el usuario `kazuto098` como lanzamiento comunitario no oficial, sin vinculacion con Bodhan AI, AI4Bharat ni NVIDIA. El objetivo es claro: ofrecer un sistema de transcripcion multilingue centrado en lenguas indias que pueda ejecutarse en dispositivo (on-device) con ONNX Runtime, tanto en CPU como en GPU CUDA.

El modelo cubre segun la model card 25 lenguas indias e ingles, entre ellas hindi, tamil, bengali, marathi, urdu, telugu, kannada, malayalam, guyarati y punyabi, ademas de idiomas minoritarios como bodo, dogri, konkani, maithili, manipuri, santali, sánscrito y sindhi. La arquitectura deriva de `nvidia/canary-1b-v2`, un transformer encoder-decoder para ASR y traduccion del habla.

La relevancia de esta ficha radica en su enfasis en el despliegue local: la cuantizacion a 4 bits reduce el peso de 4,9 GB (checkpoint fp32 original) a 0,70 GB, con una degradacion de error relativamente contenida (por ejemplo, en hindi pasa de 10,2 a 11,0 de WER en FLEURS dev). El aviso practico principal es que la licencia del modelo base restringe el uso como API para terceros sin aprobacion escrita de Bodhan AI.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder derivado de nvidia/canary-1b-v2 |
| Parametros totales | no disponible (el nombre del modelo base, canary-1b-v2, sugiere del orden de 1.000 millones) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible; audio de hasta 30 s por llamada |
| Tipos de cuantizacion | INT4 weight-only (ONNX Runtime MatMulNBits, block 128); activaciones en coma flotante |
| Idiomas soportados | 25 codigos: en, as, bhb, bho, bn, brx, doi, gu, hi, kn, kok, ks, mai, ml, mni, mr, ne, or, pa, sa, sat, sd, ta, te, ur |
| Licencia | Indic Open Model License v1.0 (categoria "other"); arquitectura base CC-BY-4.0 |
| Formato de pesos | ONNX (tres grafos: encoder, proyeccion cross-attention K/V y decoder con KV cache) |
| Tamano del repositorio | 0,70 GB |
| Entrada de audio | 16 kHz mono, remuestreo automatico desde otras frecuencias |
| Modos de salida | native (por defecto), mixed (prestamos latinos y digitos), romanized |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura del checkpoint `nvidia/canary-1b-v2`, un sistema encoder-decoder basado en transformer disenado para ASR y traduccion del habla. No se dispone de informacion detallada en la documentacion aportada sobre el numero exacto de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO en el modelo base. La model card original se limita a indicar la cobertura de lenguas y el rendimiento en FLEURS.

La innovacion tecnica de esta publicacion es exclusivamente la ruta de compresion y despliegue: cuantizacion de solo pesos a 4 bits con el operador `MatMulNBits` de ONNX Runtime (bloque de 128) manteniendo las activaciones en coma flotante, y descomposicion del modelo en tres grafos ONNX (encoder, proyeccion de clave/valor de cross-attention ejecutada una vez por locucion, y decoder con cache de KV). Este diseno busca reducir el coste de memoria y facilitar la inferencia en CPU, ONNX Runtime Mobile y CUDA. No se documentan mecanicas adicionales como decodificacion especulativa.

## Capacidades

- Reconocimiento automatico del habla en ingles y en 24 lenguas indias (25 codigos de idioma en total), incluyendo idiomas de bajos recursos como bodo, dogri, konkani, maithili, manipuri, santali y sindhi.
- Salida en tres modos: `native` (escritura nativa), `mixed` (mezcla de prestamos latinos y digitos) y `romanized`.
- Transcripcion de fragmentos de audio de hasta 30 segundos por llamada, con remuestreo automatico a 16 kHz mono.
- Ejecucion on-device en CPU (incluida ONNX Runtime Mobile) y en GPU NVIDIA mediante CUDA.
- Uso como componente ASR dentro de pipelines propios mediante la clase `IndicTranscribeONNX` y la funcion `load_audio`.
- Requiere la especificacion explicita del idioma en cada llamada (`--lang`), es decir, no se documenta deteccion automatica del idioma.
- No se documentan capacidades de tool calling, function calling, agentes, vision ni audio mas alla de la transcripcion.

## Casos de uso

- Transcripcion de audio en lenguas indias de bajos recursos: util para digitalizar contenido oral en idiomas como santali, bodo o manipuri, donde las herramientas ASR comerciales suelen tener cobertura limitada.
- Subtitulado local sin conexion: al pesar 0,70 GB y funcionar con ONNX Runtime, puede integrarse en aplicaciones de escritorio o moviles que generen subtitulos sin enviar audio a la nube.
- Asistentes de voz en dispositivo: el modo `native` permite alimentar sistemas de dictado y comandos de voz en la lengua del usuario directamente en el terminal.
- Atencion al cliente en idiomas regionales: transcripcion de llamadas en hindi, tamil, bengali o marathi para generar registros de texto y analitica posterior.
- Investigacion linguistica: generacion de corpus transcritos en multiples lenguas indias a partir de grabaciones de campo, aprovechando el soporte de idiomas minoritarios.
- Indexado y busqueda de archivos de audio: convertir bibliotecas de audio (podcasts, archivos historicos) a texto para busqueda y minado de contenido, con el caveat de que conviene aplicar deteccion de actividad de voz (VAD).
- Dictado con mezcla de codigo: el modo `mixed` resulta util en contextos donde los hablantes intercalan prestamos en latin y cifras dentro de una lengua india.

## Benchmarks y rendimiento

Los unicos datos publicados en la informacion disponible son de FLEURS dev (60 clips por idioma) en word error rate (WER):

| Modelo | Tamano | Hindi (WER) | Tamil (WER) |
|---|---|---|---|
| Original (checkpoint fp32, ejecutado en bf16) | 4,9 GB | 10,2 | 25,3 |
| Este modelo (INT4) | 0,70 GB | 11,0 | 26,9 |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks en la informacion disponible, dado que se trata de un modelo ASR y no de lenguaje generativo.

## Requisitos de hardware

- El repositorio ocupa 0,70 GB, por lo que la huella de memoria es muy reducida en comparacion con el checkpoint fp32 original de 4,9 GB.
- VRAM estimada para inferencia: no disponible de forma explicita; con un modelo de 0,70 GB en INT4 es previsible que quepa holgadamente en GPUs de consumo, aunque no se documenta una cifra concreta.
- GPU recomendadas: no especificadas por el autor; se menciona soporte CUDA mediante `onnxruntime-gpu[cuda,cudnn]`, sin detallar modelos concretos (A100, H100, RTX 4090, etc.).
- Cabe en GPU de consumo: es probable dado el tamano, pero no hay confirmacion explicita del autor.
- Ejecucion en CPU: soportada mediante ONNX Runtime CPU, incluyendo ONNX Runtime Mobile.
- Opciones de despliegue: ONNX Runtime (CPU/GPU), con los tres grafos ONNX proporcionados en el directorio `onnx/`. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.
- Nota operativa: requiere audio de 16 kHz mono y limita cada llamada a 30 s; el autor recomienda filtrar la entrada con un detector de actividad de voz (VAD).

## Comparativa con modelos similares

No se dispone de datos de rendimiento de modelos comparables en la informacion proporcionada. A continuacion se compara, con la informacion disponible, frente al modelo del que deriva:

| Modelo | Formato | Tamano | Hindi (WER) | Tamil (WER) | Licencia |
|---|---|---|---|---|---|
| Este modelo (INT4 ONNX) | ONNX INT4 | 0,70 GB | 11,0 | 26,9 | Indic Open Model License v1.0 |
| indic-transcribe-core (original) | checkpoint fp32 | 4,9 GB | 10,2 | 25,3 | Indic Open Model License v1.0 |
| nvidia/canary-1b-v2 | no disponible | no disponible | no disponible | no disponible | CC-BY-4.0 |

No se dispone de comparativas con alternativas como Whisper u otros modelos ASR multilingues en la informacion aportada.

## Limitaciones y advertencias

- El autor advierte que, igual que el modelo original, el sistema genera texto para audio no vocal; es necesario filtrar la entrada con un detector de actividad de voz (VAD).
- Se exige especificar el idioma manualmente en cada llamada; no se documenta deteccion automatica del idioma, lo que facilita errores si el idioma es incorrecto.
- Limite de 30 segundos de audio por llamada, lo que obliga a segmentar grabaciones largas.
- Solo se publican resultados de WER en hindi y tamil; el rendimiento en el resto de las lenguas (especialmente las de bajos recursos) no esta documentado en esta ficha.
- Licencia Indic Open Model License v1.0: alojar el modelo como API para terceros requiere aprobacion escrita de Bodhan AI, lo que condiciona el uso comercial en modalidad de servicio.
- La arquitectura base (`nvidia/canary-1b-v2`) esta bajo CC-BY-4.0, con obligaciones de atribucion recogidas en `NOTICE.md`.
- Es un lanzamiento comunitario no oficial, no afiliado a Bodhan AI, AI4Bharat ni NVIDIA, por lo que no cuenta con soporte ni garantias del autor original.
- Riesgo de alucinacion y de sesgos: la informacion disponible no detalla sesgos conocidos, pero al ser un modelo ASR los errores se manifiestan como transcripciones incorrectas, especialmente en audio ruidoso o con acentos no cubiertos por el entrenamiento.
- No se documenta informacion sobre idiomas fuera de la lista soportada; el uso en lenguas no incluidas no esta respaldado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/kazuto098/indic-transcribe-core-int4-onnx
- Modelo base: https://huggingface.co/bodhan-ai/indic-transcribe-core
- Arquitectura base: https://huggingface.co/nvidia/canary-1b-v2
- Licencia (Bodhan AI Open Model License): https://huggingface.co/kazuto098/indic-transcribe-core-int4-onnx/blob/main/Bodhan_AI_Open_Model_License.md
- Resumen de licencia: https://huggingface.co/kazuto098/indic-transcribe-core-int4-onnx/blob/main/indic-open-license.md
- Aviso de atribucion y cambios: https://huggingface.co/kazuto098/indic-transcribe-core-int4-onnx/blob/main/NOTICE.md
- Blog de investigacion de Bodhan AI: https://bodhan.ai/research/blogs/indic-transcribe
