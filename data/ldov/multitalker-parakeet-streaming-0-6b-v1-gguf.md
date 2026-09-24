# ldov/multitalker-parakeet-streaming-0.6b-v1-gguf

## Resumen

multitalker-parakeet-streaming-0.6b-v1-gguf es la conversion a formato GGUF del modelo NVIDIA `nvidia/multitalker-parakeet-streaming-0.6b-v1`, publicada por el usuario ldov para su uso con el motor de inferencia transcribe.cpp. No es un modelo nuevo: es una cuantizacion del modelo base, portada desde el commit upstream 8749fc7 (fijado el 12 de julio de 2026) y validada contra la referencia NeMo en el commit 3083021 de transcribe.cpp el 3 de agosto de 2026.

El modelo resuelve reconocimiento automatico del habla (ASR) en ingles con puntuacion, mayusculas, streaming cache-aware y atribucion de hablante. La arquitectura combina un encoder FastConformer cache-aware de 0,6B de parametros con un decoder transducer RNN-T, y las variantes "bundle" anaden el diarizador streaming Sortformer (`nvidia/diar_streaming_sortformer_4spk-v2.1`) para transcribir hasta cuatro hablantes solapados con etiquetas de hablante.

Su relevancia practica esta en el perfil de despliegue: los ficheros GGUF van de 2,96 GB (F32) a 617 MB (Q4_K_M) e incluyen las cuatro configuraciones de lookahead de latencia seleccionables, lo que permite ejecutar ASR con marcas de tiempo a nivel de token en CPU, Metal o Vulkan sin GPU dedicada y manteniendo un WER en LibriSpeech test-clean de 2,18-2,20 % incluso en cuantizaciones k-quant agresivas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder FastConformer cache-aware streaming + decoder transducer RNN-T; los bundles incorporan el diarizador streaming Sortformer |
| Parametros totales | 739.989.513 (recuento reportado en safetensors); el modelo base se comercializa como 0.6B |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica en el sentido de contexto de texto. Atencion cache-aware con `att_context_size=[70, 13]`, equivalente a 1,12 s de contexto acustico; cuatro configuraciones de lookahead seleccionables |
| Tipos de cuantizacion | F32, F16, Q8_0, Q6_K, Q5_K_M, Q4_K_M (mitad ASR); el diarizador embebido es F32 en el bundle F32, F16 en el bundle F16 y Q8_0 en todos los tiers k-quant |
| Idiomas soportados | ingles (en) |
| Licencia | nvidia-open-model-license (campo `license: other`) |
| Formato de pesos | GGUF (dos variantes de distribucion: GGUF simple para el modo `single_speaker_mode` y GGUF bundle bajo `bundle/` con diarizador) |

## Arquitectura y entrenamiento

El componente ASR es un encoder FastConformer de 0,6B de parametros en configuracion cache-aware streaming, acoplado a un decoder transducer RNN-T. El encoder conserva la mascara de atencion cache-aware del modelo original con `att_context_size=[70, 13]`, es decir, 1,12 s de contexto efectivo, y admite las cuatro configuraciones de lookahead de latencia. La decodificacion es greedy RNN-T y las marcas de tiempo son a nivel de token. Las variantes bundle anaden el diarizador streaming Sortformer 4spk v2.1, que permite generar transcripciones etiquetadas por hablante con hasta cuatro hablantes solapados al activar `--diarize`.

El modelo deriva del modelo base `nvidia/multitalker-parakeet-streaming-0.6b-v1`, a su vez ajustado (fine-tuned) a partir de `nvidia/nemotron-speech-streaming-en-0.6b`. La informacion disponible no detalla el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron etapas de RLHF o DPO. Del mismo modo, no se documenta el proceso de calibracion de las cuantizaciones mas alla de los resultados de WER publicados, que muestran una degradacion practicamente nula frente a F32.

## Capacidades

- Transcripcion de voz a texto en ingles, en modo offline y en modo streaming cache-aware.
- Puntuacion y capitalizacion en la salida (el scoring de referencia usa el whisper-normalizer con PnC eliminado).
- Marcas de tiempo a nivel de token (`timestamps: token`), utiles para alineacion y subtitulado.
- Diarizacion integrada en las variantes bundle: transcripcion atribuida a hablante con hasta cuatro hablantes solapados.
- Procesamiento multihablante simultaneo (multitalker), no limitado a turnos de habla limpios.
- Cuatro configuraciones de lookahead de latencia seleccionables, lo que permite ajustar el compromiso latencia/precision.
- Ejecucion en CPU, Metal y Vulkan a traves de transcribe.cpp.
- No soporta traduccion (`translate: false`), ni deteccion de idioma (`lang_detect: false`).
- No soporta tool calling ni function calling: es un modelo puramente de ASR, no un modelo de lenguaje generativo.
- No tiene modo de razonamiento, capacidades de vision ni de audio mas alla de la transcripcion.

## Casos de uso

- Transcripcion de reuniones multiparticipe: con `--diarize` y el bundle correspondiente, el modelo genera transcripciones etiquetadas por hablante para hasta cuatro voces solapadas, lo que cubre reuniones de sala pequena. El cpWER publicado en AMI-IHM test (16 reuniones, F32) es de 19,35 en configuracion kernel.
- Subtitulado en tiempo real: el encoder cache-aware con 1,12 s de contexto y lookahead configurable permite emitir texto incremental con latencia controlada, con marcas de tiempo a nivel de token para generar subtitulos sincronizados.
- Analitica de contact center: la diarizacion y las marcas de tiempo permiten separar agente y cliente, medir tiempos de habla y alimentar sistemas de cumplimiento normativo sobre la transcripcion literal.
- Despliegue en dispositivos de borde: la cuantizacion Q4_K_M pesa 617 MB incluyendo el diarizador, por lo que cabe en dispositivos con menos de 1 GB de memoria libre y se ejecuta sin GPU mediante los backends CPU, Metal o Vulkan de transcribe.cpp.
- Transcripcion por lotes de archivo: los valores publicados de rendimiento (32,72 en CPU y 217,47 en Metal sobre un M4 Max) indican un margen amplio frente al tiempo real, adecuado para procesar grandes volumenes de audio en servidor sin GPU dedicada.
- Accesibilidad y documentacion automatica: generacion de actas, resumenes y subtitulos para contenido audiovisual en ingles, con puntuacion y capitalizacion ya incluidas en la salida.
- Asistentes de voz locales: al no requerir conexion ni GPU, puede integrarse en aplicaciones de escritorio o moviles que necesiten dictado y transcripcion on-device.
- Preprocesado de pipelines de datos de audio: transcripcion masiva con cache-aware streaming para construir datasets de texto a partir de audio en ingles antes de pasarlos a un LLM.

## Benchmarks y rendimiento

| Benchmark | Cuantizacion | Resultado |
|---|---|---|
| LibriSpeech test-clean, WER (offline, 2.620 enunciados, batch 1, timestamps none) | F32 | 2,19 % |
| LibriSpeech test-clean, WER | F16 | 2,19 % |
| LibriSpeech test-clean, WER | Q8_0 | 2,18 % |
| LibriSpeech test-clean, WER | Q6_K | 2,20 % |
| LibriSpeech test-clean, WER | Q5_K_M | 2,18 % |
| LibriSpeech test-clean, WER | Q4_K_M | 2,18 % |
| FLEURS en, WER | Q8_0 | 6,52 % |
| AMI-IHM test, cpWER (16 reuniones, bundle F32) | F32 | 19,35 (kernel) / 23,73 (masked) |
| Referencia NeMo `single_speaker_mode`, WER en LibriSpeech test-clean | no aplica | 2,19 % |
| Cifra autoinformada por NVIDIA, mismo split | no aplica | 2,19 % |

Rendimiento relativo publicado en los metadatos del autor:

| Plataforma | Backend | Valor `rtf` |
|---|---|---|
| Apple M4 Max | CPU | 32,72 |
| Apple M4 Max | Metal | 217,47 |
| AMD Ryzen 4750U | CPU | 13,41 |
| AMD Ryzen 4750U | Vulkan | 26,34 |

Los valores del campo `rtf_*` no van acompanados de unidades ni de la definicion exacta del calculo en la informacion disponible; por su magnitud parecen corresponder a factores de aceleracion sobre tiempo real (xRT) mas que a un factor de tiempo real clasico (donde valores inferiores a 1 indican velocidad superior al tiempo real). No se incluyen resultados comparativos con otros modelos en la informacion disponible.

## Requisitos de hardware

- VRAM/RAM estimada a partir del tamano de los ficheros GGUF publicados: F32 2,96 GB, F16 1,48 GB, Q8_0 873 MB, Q6_K 743 MB, Q5_K_M 681 MB, Q4_K_M 617 MB. Hay que anadir el consumo del runtime y del buffer de audio.
- Estas cifras corresponden a los bundles con diarizador embebido; los GGUF simples de modo `single_speaker_mode` ocupan menos.
- No requiere GPU: los backends documentados son CPU (M4 Max y Ryzen 4750U), Metal (Apple Silicon) y Vulkan (Ryzen 4750U).
- Cabe en practicamente cualquier GPU de consumo, e incluso en GPU integradas, dado el tamano maximo de 2,96 GB del bundle F32. Con Q4_K_M, 617 MB permiten ejecucion en moviles y placas tipo Raspberry Pi con memoria suficiente.
- Opcion de despliegue documentada: transcribe.cpp (CLI con flag `--diarize` para los bundles). No se documenta soporte para vLLM, TGI, llama.cpp ni Ollama; el formato GGUF aqui es especifico de transcribe.cpp y no del ecosistema llama.cpp.
- Latencia y throughput: no se publican valores absolutos de latencia por fragmento ni de throughput en horas de audio por hora de proceso; solo los valores relativos `rtf` de la tabla anterior. El lookahead de latencia es configurable en cuatro ajustes, lo que permite acortar la latencia a costa de contexto acustico.
- El encoder esta limitado a un contexto cache-aware de 1,12 s (`att_context_size=[70, 13]`), lo que acota el presupuesto de memoria del estado de streaming.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Licencia | Streaming | Formato de pesos | Rendimiento comparado |
|---|---|---|---|---|---|---|
| ldov/multitalker-parakeet-streaming-0.6b-v1-gguf | 739.989.513 | en | nvidia-open-model-license | Si, cache-aware, con lookahead configurable | GGUF | WER 2,18-2,20 % en LibriSpeech test-clean; 6,52 % en FLEURS en; cpWER 19,35 en AMI-IHM |
| nvidia/multitalker-parakeet-streaming-0.6b-v1 (modelo base) | 739.989.513 | en | nvidia-open-model-license | Si | safetensors / NeMo | 2,19 % de WER en LibriSpeech test-clean segun la referencia NeMo y la cifra autoinformada por NVIDIA |
| nvidia/nemotron-speech-streaming-en-0.6b (origen del ajuste) | no disponible | en | no disponible | Si | no disponible | no disponible en la informacion proporcionada |
| Alternativas genericas de ASR en ingles (Whisper, Parakeet TDT, etc.) | no disponible | no disponible | no disponible | no disponible | no disponible | no se han publicado resultados comparativos en la informacion disponible |

No se dispone de datos de benchmarks de terceros dentro de la informacion proporcionada, por lo que no es posible establecer una comparacion cuantitativa con otras familias de modelos ASR.

## Limitaciones y advertencias

- Solo soporta ingles (`language: en`). No hay traduccion (`translate: false`) ni deteccion automatica de idioma (`lang_detect: false`).
- El rendimiento cae de forma notable fuera de dominio limpio: el WER en FLEURS en (6,52 % con Q8_0) triplica practicamente el de LibriSpeech test-clean (2,18 %). No hay datos publicados en castellano ni en otros idiomas.
- La diarizacion esta limitada a cuatro hablantes solapados como maximo. Ademas, el cpWER empeora claramente con el modo masked (23,73) frente al modo kernel (19,35), lo que indica sensibilidad a la estrategia de evaluacion y, por extension, a la calidad de la separacion de hablantes.
- El contexto acustico es local: el encoder cache-aware solo retiene 1,12 s de contexto (`att_context_size=[70, 13]`). No hay atencion global sobre el audio completo, lo que puede penalizar en discursos largos con dependencias a largo plazo.
- Riesgo de alucinacion propio de los sistemas ASR: inserciones de texto en segmentos de silencio, ruido o habla solapada. El decoder RNN-T greedy es generalmente mas conservador que los modelos autorregresivos con prompt, pero el riesgo no desaparece.
- Sesgos esperables derivados del entrenamiento en ingles: peor comportamiento ante acentos no nativos, ingles no estadounidense, jerga tecnica, ruido de fondo o grabaciones de telefonia de banda estrecha. La informacion disponible no documenta analisis de sesgos.
- Licencia `nvidia-open-model-license`, registrada como `license: other`. No es una licencia OSI estandar: antes de un uso comercial o de redistribuir los pesos conviene revisar los terminos en el enlace oficial.
- El modelo requiere transcribe.cpp. El GGUF no es compatible con llama.cpp, Ollama ni con el cargador estandar de Transformers, lo que limita las opciones de despliegue y el soporte de la comunidad.
- Discrepancia de identificadores: el repositorio de HuggingFace esta publicado bajo el autor `ldov`, pero todos los enlaces de descarga de la model card apuntan al repositorio `handy-computer/multitalker-parakeet-streaming-0.6b-v1-gguf`. Conviene verificar cual es el origen canonico antes de integrarlo en un pipeline.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay validacion independiente por parte de la comunidad.
- Los WER de las cuantizaciones k-quant se publicaron sin commit de procedencia asociado, segun indica el propio autor; solo las cifras con commit registrado tienen trazabilidad completa.
- El repo ocupa 7,4 GB en total, ya que aloja todas las cuantizaciones y los bundles; el tamano de descarga individual es el de cada fichero GGUF.
- No dispone de capacidades de agente, razonamiento multi-paso, tool calling ni generacion de codigo: cualquier funcionalidad de ese tipo debe aportarla un LLM situado por encima en el pipeline.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/ldov/multitalker-parakeet-streaming-0.6b-v1-gguf
- Repositorio de descargas referenciado en la model card: https://huggingface.co/handy-computer/multitalker-parakeet-streaming-0.6b-v1-gguf
- Modelo base: https://huggingface.co/nvidia/multitalker-parakeet-streaming-0.6b-v1
- Commit upstream del port: https://huggingface.co/nvidia/multitalker-parakeet-streaming-0.6b-v1/commit/8749fc7
- Modelo del que deriva el ajuste: https://huggingface.co/nvidia/nemotron-speech-streaming-en-0.6b
- Diarizador Sortformer embebido en los bundles: https://huggingface.co/nvidia/diar_streaming_sortformer_4spk-v2.1
- Motor de inferencia transcribe.cpp: https://github.com/handy-computer/transcribe.cpp
- Commit de validacion en transcribe.cpp: https://github.com/handy-computer/transcribe.cpp/tree/3083021
- Licencia NVIDIA Open Model License: https://www.nvidia.com/en-us/agreements/enterprise-software/nvidia-open-model-license/
- Referencia arXiv 2506.22646: https://arxiv.org/abs/2506.22646
- Referencia arXiv 2408.13106: https://arxiv.org/abs/2408.13106
- Referencia arXiv 2305.05084: https://arxiv.org/abs/2305.05084
- Referencia arXiv 2409.06656: https://arxiv.org/abs/2409.06656
- Referencia arXiv 2507.18446: https://arxiv.org/abs/2507.18446
- Referencia arXiv 1706.03762: https://arxiv.org/abs/1706.03762
- Referencia arXiv 2310.12371: https://arxiv.org/abs/2310.12371
